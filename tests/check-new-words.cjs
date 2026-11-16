/* 检查新词库文件与既有词库的碰撞情况
   用法: node tests/check-new-words.cjs [files...]
   不传 files 时检查 public/data 下所有 words-l5-* 文件 */
const fs = require('fs')
const path = require('path')

const dir = path.join(__dirname, '..', 'public', 'data')

function loadExisting() {
  const seen = new Set()
  for (const f of fs.readdirSync(dir)) {
    if (/^words-(l2|l5)-/.test(f) && !process.argv.slice(2).includes(f)) {
      const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))
      const words = Array.isArray(j) ? j.flatMap((t) => t.words) : Object.values(j).flat()
      for (const w of words) if (w && w.word) seen.add(String(w.word).toLowerCase())
    }
  }
  return seen
}

const files = process.argv.slice(2)
const existing = loadExisting()
const newSeen = new Map() // word -> file  新文件内部互撞
let total = 0
let unique = 0

for (const f of files) {
  const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))
  const clashesExt = []
  const clashesInt = []
  for (const t of j) {
    const emojis = new Set()
    for (const w of t.words) {
      total++
      const word = String(w.word).toLowerCase()
      if (existing.has(word)) clashesExt.push(`${t.id}:${word}`)
      else if (newSeen.has(word)) clashesInt.push(`${t.id}:${word}(先出现于${newSeen.get(word)})`)
      else {
        newSeen.set(word, f)
        unique++
      }
      if (w.emoji) {
        if (emojis.has(w.emoji)) clashesInt.push(`${t.id}:emoji重复 ${w.emoji}`)
        emojis.add(w.emoji)
      }
    }
  }
  console.log(`\n[${f}] 主题 ${j.length} · 词次 ${j.reduce((s, t) => s + t.words.length, 0)}`)
  if (clashesExt.length) console.log('  与旧库撞词:', clashesExt.join(', '))
  if (clashesInt.length) console.log('  新文件互撞:', clashesInt.join(', '))
}
console.log(`\n合计: 词次 ${total} · 新增去重词 ${unique}`)
