/* ============================================================
   services/quizBank.js —— 题库生成服务（内容可见性过滤器）
   * 按「已完成 / 已解锁」关卡内容抽题，供等级综合测验与随机测验复用。
   * ============================================================ */
import { getLevel, getPoolData } from '../data/levels'
import { LETTERS } from '../data/letters'
import { DIALOGUES_L3 } from '../data/dialogues'
import { getGrammarUnitById } from '../data/grammar'
import { getL8Words } from './wordData'
import { getL6ListeningById } from '../data/listening_l6'
import { getArticleById } from '../data/reading_l7'
import { getSimulationById } from '../data/simulation_l8'

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
    explain: `${word.word} ${word.ipa || ''}，${word.zh}`,
    word: word.word,
    pos: word.pos || ''
  }
}

/* 例句填空题生成器（cloze）：把例句中的目标词挖空选词填入 */
function escapeReg(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function makeCloze(word, wordPool) {
  if (!word.example) return null
  /* 词组搭配不做挖空：例句里常是变形（stood up / took over），
     挖空后选项都是多词短语，辨识度低、体验差。 */
  if (/\s/.test(String(word.word || '').trim())) return null
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
    explain: `${word.zh} —— ${word.example}`,
    word: word.word,
    pos: word.pos || ''
  }
}

/* 收集某个等级内所有已解锁关卡的题目（内容可见性过滤器）
   按题型分发，与等级数量解耦（12 级结构下同样适用）。 */
export function collectLevelQuestions(progress, level) {
  const lv = getLevel(level)
  if (!lv) return []
  const qs = []
  lv.stages.forEach((st) => {
    if (!progress.isStageUnlocked(st.id)) return
    const c = st.content || {}
    if (st.type === 'letter_recognize' || st.type === 'letter_match' || st.type === 'phonics') {
      // 字母类：由 LETTERS 词池生成选择题
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
    } else if (st.type === 'dialogue') {
      const d = DIALOGUES_L3.find((x) => x.id === c.scene)
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
    } else if (st.type === 'grammar_quiz') {
      const g = getGrammarUnitById(c.unit)
      if (!g) return
      g.questions.forEach((q) =>
        qs.push({ q: q.prompt, options: q.options, answer: q.answer, explain: q.explain })
      )
    } else if (st.type === 'word_choice' || st.type === 'word_match' || st.type === 'word_spell') {
      // 词汇类（L2/L3 基础词汇、L6~L9 中级词汇、L9 词组）：统一由词池生成
      const words = getPoolData(c.pool) || []
      if (!words.length) return
      const zhPool = words.map((w) => w.zh)
      words.forEach((w) => {
        qs.push(makeWordChoice(w, zhPool))
        const cloze = makeCloze(w, words)
        if (cloze) qs.push(cloze)
      })
    } else if (st.type === 'listening') {
      const m = getL6ListeningById(c.script)
      if (!m) return
      m.questions.forEach((q) => qs.push({ q: q.q, options: q.options, answer: q.answer, explain: '根据听力材料作答' }))
    } else if (st.type === 'reading') {
      const a = getArticleById(c.article)
      if (!a) return
      a.questions.forEach((q) => qs.push({ q: q.q, options: q.options, answer: q.answer, explain: '根据阅读文章作答' }))
    } else if (st.type === 'simulation') {
      const sim = getSimulationById(c.simulation)
      if (!sim) return
      sim.questions.forEach((q) => qs.push({ q: q.q, options: q.options, answer: q.answer, explain: '仿真题题型训练' }))
      // 学术词汇例句填空（L12 学术词带例句）
      const l8Words = getL8Words()
      l8Words.forEach((w) => {
        const cloze = makeCloze(w, l8Words)
        if (cloze) qs.push(cloze)
      })
    }
    // word_order（连词成句）：交互题型，不进入选择题题库
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
