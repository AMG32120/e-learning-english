/* ============================================================
   services/quizBank.js —— 题库生成服务（内容可见性过滤器）
   * 按「已完成 / 已解锁」关卡内容抽题，供等级综合测验与随机测验复用。
   * ============================================================ */
import { getLevel, getPoolData } from '../data/levels'
import { LETTERS } from '../data/letters'
import { DIALOGUES_L3 } from '../data/dialogues'
import { getGrammarUnitById } from '../data/grammar'
import { L5_THEMES } from '../data/words_l5'
import { getL6ListeningById } from '../data/listening_l6'
import { getArticleById } from '../data/reading_l7'
import { getSimulationById, L8_ACADEMIC_WORDS } from '../data/simulation_l8'

export function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/* 词义选择题生成器 */
function makeWordChoice(word, zhPool) {
  const distractors = shuffle(zhPool.filter((z) => z !== word.zh)).slice(0, 3)
  const options = shuffle([word.zh, ...distractors])
  return {
    q: word.word,
    options,
    answer: options.indexOf(word.zh),
    explain: `${word.word} ${word.ipa || ''}，${word.zh}`
  }
}

/* 例句填空题生成器（cloze）：把例句中的目标词挖空选词填入 */
function escapeReg(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function makeCloze(word, wordPool) {
  if (!word.example) return null
  const re = new RegExp(`\\b${escapeReg(word.word)}\\b`, 'i')
  if (!re.test(word.example)) return null
  const blanked = word.example.replace(re, '______')
  const distractors = shuffle(wordPool.filter((w) => w.word !== word.word)).slice(0, 3).map((w) => w.word)
  if (distractors.length < 3) return null
  const options = shuffle([word.word, ...distractors])
  return {
    q: `选词填空：${blanked}`,
    options,
    answer: options.indexOf(word.word),
    explain: `${word.zh} —— ${word.example}`
  }
}

/* 收集某个等级内所有已解锁关卡的题目（内容可见性过滤器）*/
export function collectLevelQuestions(progress, level) {
  const lv = getLevel(level)
  if (!lv) return []
  const qs = []
  lv.stages.forEach((st, idx) => {
    if (!progress.isStageUnlocked(`L${lv.level}-${idx + 1}`)) return
    if (level === 1) {
      LETTERS.forEach((letter) => {
        const opts = shuffle([
          letter.lower,
          ...shuffle(LETTERS.filter((x) => x.lower !== letter.lower))
            .slice(0, 3)
            .map((x) => x.lower)
        ])
        qs.push({
          q: `字母 ${letter.upper} 对应的小写是？`,
          options: opts,
          answer: opts.indexOf(letter.lower),
          explain: `${letter.upper} 读作 ${letter.letterIpa}，例：${letter.example}`
        })
      })
    } else if (level === 2) {
      // stage.content.pool 为 l2_* 前缀键，须经 getPoolData 映射到 WORDS_L2 实际词池
      const words = getPoolData(st.content.pool) || []
      const zhPool = words.map((w) => w.zh)
      words.forEach((w) => {
        qs.push(makeWordChoice(w, zhPool))
        const cloze = makeCloze(w, getPoolData(st.content.pool) || [])
        if (cloze) qs.push(cloze)
      })
    } else if (level === 3) {
      const d = DIALOGUES_L3.find((x) => x.id === st.content.scene)
      if (!d) return
      const zhPool = d.lines.map((l) => l.zh)
      d.lines.forEach((line) => {
        const distractors = shuffle(zhPool.filter((z) => z !== line.zh)).slice(0, 3)
        const options = shuffle([line.zh, ...distractors])
        qs.push({
          q: line.en,
          options,
          answer: options.indexOf(line.zh),
          explain: line.note || ''
        })
      })
    } else if (level === 4) {
      const g = getGrammarUnitById(st.content.unit)
      if (!g) return
      g.questions.forEach((q) =>
        qs.push({ q: q.prompt, options: q.options, answer: q.answer, explain: q.explain })
      )
    } else if (level === 5) {
      const theme = L5_THEMES.find((t) => t.id === st.content.pool)
      if (!theme) return
      const zhPool = theme.words.map((w) => w.zh)
      theme.words.forEach((w) => {
        qs.push(makeWordChoice(w, zhPool))
        const cloze = makeCloze(w, theme.words)
        if (cloze) qs.push(cloze)
      })
    } else if (level === 6) {
      const m = getL6ListeningById(st.content.script)
      if (!m) return
      m.questions.forEach((q) => qs.push({ q: q.q, options: q.options, answer: q.answer, explain: '根据听力材料作答' }))
    } else if (level === 7) {
      const a = getArticleById(st.content.article)
      if (!a) return
      a.questions.forEach((q) => qs.push({ q: q.q, options: q.options, answer: q.answer, explain: '根据阅读文章作答' }))
    } else if (level === 8) {
      const sim = getSimulationById(st.content.simulation)
      if (!sim) return
      sim.questions.forEach((q) => qs.push({ q: q.q, options: q.options, answer: q.answer, explain: '仿真题题型训练' }))
      // 学术词汇例句填空（L8_ACADEMIC_WORDS 带例句）
      L8_ACADEMIC_WORDS.forEach((w) => {
        const cloze = makeCloze(w, L8_ACADEMIC_WORDS)
        if (cloze) qs.push(cloze)
      })
    }
  })
  return qs
}

/* 从指定等级集合抽取题量（随机打乱后取前 max）*/
export function collectUnlockedQuestions(progress, levels, max = 20) {
  const qs = []
  for (const lv of levels) {
    qs.push(...collectLevelQuestions(progress, lv))
  }
  return shuffle(qs).slice(0, max)
}
