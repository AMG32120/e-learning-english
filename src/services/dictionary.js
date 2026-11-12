/* ============================================================
   services/dictionary.js —— 词条索引服务
   将所有内容词库构建为 word|pos → 词条 的索引，
   供复习池、每日一句、随机测验按 itemKey 快速查词。
   ============================================================ */
import { LETTERS, IPA_VOWELS, IPA_CONSONANTS, PHONICS_WORDS } from '../data/letters'
import { WORDS_L2 } from '../data/words'
import { getAllL5Words } from '../data/words_l5'
import { L8_ACADEMIC_WORDS } from '../data/simulation_l8'

const SOURCES = [
  LETTERS,
  IPA_VOWELS,
  IPA_CONSONANTS,
  PHONICS_WORDS,
  ...Object.values(WORDS_L2).flat(),
  getAllL5Words(),
  L8_ACADEMIC_WORDS
]

let CACHE = null

export function buildWordIndex() {
  if (CACHE) return CACHE
  const index = new Map()
  const push = (item) => {
    const key = item.word || item.en || item.text
    if (!key) return
    const pos = item.pos || ''
    const mapKey = `${key}|${pos}`
    if (!index.has(mapKey)) {
      index.set(mapKey, { word: key, pos, zh: item.zh || '', ipa: item.ipa || '', example: item.example || '' })
    }
  }
  for (const list of SOURCES) {
    if (Array.isArray(list)) list.forEach(push)
  }
  CACHE = index
  return index
}

/* 按 itemKey（word|pos）查词条；pos 缺失时退化按 word 查询 */
export function findWord(itemKey) {
  const index = buildWordIndex()
  if (index.has(itemKey)) return index.get(itemKey)
  const word = String(itemKey).split('|')[0]
  for (const [k, v] of index.entries()) {
    if (k.split('|')[0] === word) return v
  }
  return null
}
