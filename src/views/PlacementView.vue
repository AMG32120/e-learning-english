<template>
  <div class="page-container placement">
    <h1 class="page-title">入学水平自测</h1>
    <p class="page-subtitle">
      {{ done ? '自测完成' : '从易到难共 6 组，每组达标才进入下一组，测到哪组就推荐到哪级' }}
    </p>

    <!-- 答题中 -->
    <template v-if="!done">
      <div class="card placement-card">
        <div class="placement-progress">
          <span class="tier-badge">{{ currentTier.name }}</span>
          第 {{ tierIndex + 1 }} / {{ TIERS.length }} 组 · 第 {{ tierQIndex + 1 }} / {{ tierQuestions.length }} 题
          <div class="progress-bar progress-bar-mt">
            <div class="progress-fill" :style="{ width: (answeredCount / MAX_QUESTIONS) * 100 + '%' }"></div>
          </div>
        </div>

        <div class="placement-question">
          <div class="placement-q-text">{{ current.q }}</div>
          <p v-if="current.context" class="placement-context">{{ current.context }}</p>
          <TtsButton v-if="current.listen" :text="current.listen" :rate="0.7" class="placement-listen" aria-label="播放听力" />
        </div>

        <div class="quiz-options">
          <button
            v-for="opt in current.options"
            :key="opt.k"
            class="quiz-option"
            :class="{
              selected: selected === opt.k,
              correct: answered && opt.k === current.answer,
              wrong: answered && selected === opt.k && opt.k !== current.answer
            }"
            :disabled="answered"
            @click="choose(opt.k)"
          >
            <span class="quiz-option-label">{{ opt.label }}</span>
          </button>
        </div>

        <div v-if="answered" class="placement-feedback">
          <span v-if="selected === current.answer" class="feedback-ok">回答正确</span>
          <span v-else class="feedback-no">正确答案：{{ correctAnswerLabel }}</span>
          <span v-if="current.explain && selected !== current.answer" class="feedback-explain">{{ current.explain }}</span>
        </div>

        <button class="btn btn-primary btn-block" :disabled="!answered" @click="next">
          {{ isVeryLastQuestion ? '查看结果' : '下一题' }}
        </button>
      </div>
    </template>

    <!-- 结果页 -->
    <template v-else>
      <div class="card placement-card result">
        <div class="result-score">
          <div class="result-num">{{ correct }}/{{ answeredCount }}</div>
          <div class="result-percent">正确率 {{ percent }}%</div>
        </div>
        <div class="result-tiers">
          <div
            v-for="(t, i) in tierResults"
            :key="i"
            class="tier-result"
            :class="{ pass: t.passed, fail: !t.passed }"
          >
            <span class="tier-result-icon">{{ t.passed ? '✓' : '✗' }}</span>
            <span class="tier-result-name">{{ t.name }}</span>
            <span class="tier-result-score">{{ t.score }}/{{ t.total }}</span>
          </div>
        </div>
        <div class="result-recommend">
          <div class="result-label">推荐起始等级</div>
          <div class="result-level">{{ recommendLabel }}</div>
          <div class="result-desc">{{ recommendDesc }}</div>
        </div>
        <div class="result-actions">
          <button class="btn btn-primary btn-block" @click="goRecommend">从推荐等级开始</button>
          <button class="btn btn-ghost btn-block" @click="goL1">仍从 L1 字母启蒙开始</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import TtsButton from '../components/TtsButton.vue'
import { useAuthStore } from '../stores/auth'
import { getLevel } from '../data/levels'
import { GRAMMAR_UNITS_L4 } from '../data/grammar'
import { ARTICLES_L7 } from '../data/reading_l7'
import { SIMULATIONS_L8 } from '../data/simulation_l8'
import { SENTENCE_BANKS } from '../data/sentences'
import { getWordsL2, getL5Themes, getL8Words } from '../services/wordData'

const router = useRouter()
const auth = useAuthStore()

/* ---------- 工具 ---------- */

function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/* 用带 correct 标记的候选生成一道选择题（选项乱序、答案键随机化，防背选项位置） */
function mkQ(q, candidates, extra = {}) {
  const shuffled = shuffle(candidates)
  const options = shuffled.map((o, i) => ({ k: String(i), label: o.label }))
  const answer = String(shuffled.findIndex((o) => o.correct))
  return { q, options, answer, ...extra }
}

/* ---------- 题目生成 ---------- */

const l2all = Object.values(getWordsL2()).flat()
const wordsOfCefr = (cefr) => {
  const list = l2all.filter((w) => w.cefr === cefr && w.zh)
  return list.length >= 4 ? list : l2all.filter((w) => w.zh)
}
const l5all = getL5Themes().flatMap((t) => (Array.isArray(t.words) ? t.words : [])).filter((w) => w.word && w.zh)
const l8all = getL8Words().filter((w) => w.word && w.zh)

/* 英→中 / 中→英 / 听音选义 三种词汇题型（干扰项随机取自同词库） */
function qEn2Zh(word, pool) {
  const others = pool.filter((w) => w.word !== word.word && w.zh !== word.zh)
  return mkQ(`「${word.word}」的中文意思是？`, [
    { label: word.zh, correct: true },
    ...shuffle(others).slice(0, 3).map((d) => ({ label: d.zh, correct: false }))
  ])
}
function qZh2En(word, pool) {
  const others = pool.filter((w) => w.word !== word.word && w.zh !== word.zh)
  return mkQ(`「${word.zh}」的英文是？`, [
    { label: word.word, correct: true },
    ...shuffle(others).slice(0, 3).map((d) => ({ label: d.word, correct: false }))
  ])
}
function qListen(word) {
  return mkQ('点击喇叭听发音，选出你听到的单词的中文意思：', [
    { label: word.zh, correct: true },
    ...shuffle(l2all.filter((w) => w.word !== word.word && w.zh !== word.zh)).slice(0, 3).map((d) => ({ label: d.zh, correct: false }))
  ], { listen: word.word })
}

/* 语法题（GRAMMAR_UNITS_L4：{prompt, options[], answer, explain}） */
function grammarQs(unitIds, count) {
  const qs = []
  for (const id of unitIds) {
    const unit = GRAMMAR_UNITS_L4.find((u) => u.id === id)
    if (!unit) continue
    const picked = shuffle(unit.questions).slice(0, count)
    for (const item of picked) {
      qs.push({
        q: item.prompt,
        options: item.options.map((label, i) => ({ k: String(i), label })),
        answer: String(item.answer),
        explain: item.explain
      })
    }
  }
  return qs
}

/* 「选出正确英文句子」题（干扰句取自同句库，保证长度/难度相近） */
function sentenceQ(item, bank) {
  const others = shuffle(bank.filter((s) => s.en !== item.en)).slice(0, 3)
  return mkQ(`选出「${item.zh}」的正确英文表达：`, [
    { label: item.en, correct: true },
    ...others.map((s) => ({ label: s.en, correct: false }))
  ])
}

/* ---------- 自适应分组 ---------- */

/* 每组达标线：正确率 ≥ 65%（5 题需 4 对，6 题需 4 对）。
   全程最多 34 题；零基础第 1 组不过即结束（最少 5 题），高水平一路通关。 */
const TIERS = [
  {
    name: '字母与音标',
    build() {
      return [
        { q: '字母 A 的正确读音是？', options: [{ k: '0', label: '/eɪ/' }, { k: '1', label: '/æ/' }, { k: '2', label: '/ɑː/' }, { k: '3', label: '/iː/' }], answer: '0' },
        { q: '小写字母 g 的大写形式是？', options: [{ k: '0', label: 'G' }, { k: '1', label: 'Q' }, { k: '2', label: 'J' }, { k: '3', label: 'S' }], answer: '0' },
        { q: '下列哪一组全是元音字母？', options: [{ k: '0', label: 'A E I O U' }, { k: '1', label: 'A B C D E' }, { k: '2', label: 'a e m n o' }, { k: '3', label: 'E F G H I' }], answer: '0' },
        { q: '音标 /kæt/ 对应哪个单词？', options: [{ k: '0', label: 'cat' }, { k: '1', label: 'cut' }, { k: '2', label: 'kite' }, { k: '3', label: 'cake' }], answer: '0' },
        { q: '单词 apple 的中文意思是？', options: [{ k: '0', label: '香蕉' }, { k: '1', label: '苹果' }, { k: '2', label: '橙子' }, { k: '3', label: '葡萄' }], answer: '1' }
      ]
    }
  },
  {
    name: 'A1 基础词汇',
    build() {
      const pool = wordsOfCefr('A1')
      const words = shuffle(pool)
      const qs = []
      if (words[0]) qs.push(qEn2Zh(words[0], pool))
      if (words[1]) qs.push(qListen(words[1]))
      if (words[2]) qs.push(qZh2En(words[2], pool))
      if (words[3]) qs.push(qEn2Zh(words[3], pool))
      if (words[4]) qs.push(qListen(words[4]))
      return qs
    }
  },
  {
    name: 'A2 词汇与基础语法',
    build() {
      const pool = wordsOfCefr('A2')
      const words = shuffle(pool)
      const qs = []
      if (words[0]) qs.push(qEn2Zh(words[0], pool))
      if (words[1]) qs.push(qZh2En(words[1], pool))
      qs.push(...grammarQs(['be_verbs'], 1))
      qs.push(...grammarQs(['present_simple'], 1))
      if (words[2]) qs.push(qListen(words[2]))
      qs.push(...grammarQs(['plural_nouns'], 1))
      if (words[3]) qs.push(qEn2Zh(words[3], pool))
      return qs
    }
  },
  {
    name: 'B1 词汇与语法进阶',
    build() {
      const pool = wordsOfCefr('B1')
      const words = shuffle(pool)
      const qs = []
      if (words[0]) qs.push(qEn2Zh(words[0], pool))
      qs.push(...grammarQs(['pronouns'], 1))
      if (words[1]) qs.push(qZh2En(words[1], pool))
      qs.push(...grammarQs(['there_be'], 1))
      if (words[2]) qs.push(qEn2Zh(words[2], pool))
      qs.push(...grammarQs(['simple_sentences'], 1))
      return qs
    }
  },
  {
    name: '中级词汇与句型',
    build() {
      const words = shuffle(l5all)
      const qs = []
      if (words[0]) qs.push(qEn2Zh(words[0], l5all))
      if (words[1]) qs.push(qZh2En(words[1], l5all))
      if (SENTENCE_BANKS.basic.length) qs.push(sentenceQ(shuffle(SENTENCE_BANKS.basic)[0], SENTENCE_BANKS.basic))
      if (words[2]) qs.push(qListen(words[2]))
      qs.push(...grammarQs(['l7_adverbial'], 1))
      if (SENTENCE_BANKS.adv.length) qs.push(sentenceQ(shuffle(SENTENCE_BANKS.adv)[0], SENTENCE_BANKS.adv))
      return qs
    }
  },
  {
    name: '学术词汇与阅读',
    build() {
      const words = shuffle(l8all)
      const qs = []
      if (words[0]) qs.push(qEn2Zh(words[0], l8all))
      if (words[1]) qs.push(qZh2En(words[1], l8all))
      /* 仿真题：阅读理解（带原文 context）+ 词汇释义 */
      const sim = SIMULATIONS_L8[Math.floor(Math.random() * SIMULATIONS_L8.length)]
      if (sim) {
        const reading = sim.questions.filter((x) => x.section === 'reading' && x.context)
        if (reading.length) {
          const item = reading[Math.floor(Math.random() * reading.length)]
          qs.push({
            q: item.q,
            context: item.context,
            options: item.options.map((label, i) => ({ k: String(i), label })),
            answer: String(item.answer),
            explain: item.explain
          })
        }
        const vocab = shuffle(sim.questions.filter((x) => x.section === 'vocab')).slice(0, 2)
        for (const item of vocab) {
          qs.push({
            q: item.q,
            options: item.options.map((label, i) => ({ k: String(i), label })),
            answer: String(item.answer),
            explain: item.explain
          })
        }
      }
      /* 阅读题：随机文章 + 随机一题（带原文段落 context） */
      const article = ARTICLES_L7[Math.floor(Math.random() * ARTICLES_L7.length)]
      if (article && article.questions.length) {
        const item = article.questions[Math.floor(Math.random() * article.questions.length)]
        qs.push({
          q: `阅读《${article.title}》：${item.q}`,
          context: (article.text || []).join(' '),
          options: item.options.map((label, i) => ({ k: String(i), label })),
          answer: String(item.answer),
          explain: item.explain
        })
      }
      if (words[2]) qs.push(qEn2Zh(words[2], l8all))
      return qs
    }
  }
]

/* 预生成全部组题（进入页面时词库已由 BootGate 就绪） */
const tierQuestionSets = TIERS.map((t) => t.build())

/* 进度条上限 = 全部组的实际题数总和（未答完就停在对应比例） */
const MAX_QUESTIONS = Math.max(1, tierQuestionSets.reduce((n, qs) => n + qs.length, 0))

/* ---------- 答题状态 ---------- */

const tierIndex = ref(0) // 当前组
const tierQIndex = ref(0) // 组内题号
const tierScores = ref(TIERS.map(() => ({ score: 0, answered: 0 })))
const selected = ref(null)
const answered = ref(false)
const correctCount = ref(0)
const done = ref(false)
const failedTier = ref(-1) // 未通过的组下标；全部通过为 -1

const tierQuestions = computed(() => tierQuestionSets[tierIndex.value] || [])
const current = computed(() => tierQuestions.value[tierQIndex.value] || { q: '', options: [] })
const currentTier = computed(() => TIERS[tierIndex.value] || TIERS[0])
const correctAnswerLabel = computed(() => {
  const opt = current.value.options.find((o) => o.k === current.value.answer)
  return opt ? opt.label : ''
})
const answeredCount = computed(() => tierScores.value.reduce((n, t) => n + t.answered, 0))
const correct = computed(() => correctCount.value)
const percent = computed(() => (answeredCount.value ? Math.round((correct.value / answeredCount.value) * 100) : 0))
const isVeryLastQuestion = computed(() => {
  /* 当前组最后一题，且本组无论过不过都结束（最后一组，或当前正确数已不可能达标） */
  const isTierLast = tierQIndex.value >= tierQuestions.value.length - 1
  if (!isTierLast) return false
  if (tierIndex.value >= TIERS.length - 1) return true
  const score = tierScores.value[tierIndex.value].score + (selected.value === current.value.answer ? 1 : 0)
  const total = tierScores.value[tierIndex.value].answered + 1
  return score / total < 0.65 // 提前判死，本题交卷即出结果
})

/* ---------- 分级推荐 ----------
   未通过组内按得分细分；全部通过 → L15 学术词汇 */
function recommendLevelFor(failedIdx, score) {
  if (failedIdx === -1) return 15
  if (failedIdx === 0) return 1
  if (failedIdx === 1) return 2
  if (failedIdx === 2) return score >= 3 ? 4 : 3
  if (failedIdx === 3) return score >= 4 ? 7 : score === 3 ? 6 : 5
  if (failedIdx === 4) return score >= 4 ? 10 : score === 3 ? 9 : 8
  return score >= 3 ? 14 : 13
}

const recommendLevel = computed(() => recommendLevelFor(failedTier.value, failedTier.value >= 0 ? tierScores.value[failedTier.value].score : 0))
const recommendLabel = computed(() => {
  const lv = getLevel(recommendLevel.value)
  return `L${recommendLevel.value} ${lv ? lv.name : ''}`.trim()
})
const recommendDesc = computed(() => {
  const lv = recommendLevel.value
  if (lv === 15) return '全部通关！词汇与阅读功底扎实，可直接挑战学术词汇与仿真冲刺'
  if (lv >= 13) return '高级别表现不错，建议从听说进阶/仿真训练衔接，查漏补缺'
  if (lv >= 8) return '中级基础较好，从对应中级词汇段起步巩固话题词汇'
  if (lv >= 5) return '基础词汇过关，建议通过对话与语法关夯实句型运用'
  if (lv >= 3) return 'A2 词汇已上手，按主题继续扩展基础词汇'
  if (lv === 2) return '有一定基础，建议从基础词汇等级巩固'
  return '零基础友好，从字母启蒙开始打牢地基'
})

const tierResults = computed(() =>
  TIERS.map((t, i) => {
    const s = tierScores.value[i]
    const started = s.answered > 0
    return {
      name: t.name,
      score: started ? s.score : 0,
      total: started ? s.answered : tierQuestionSets[i].length,
      passed: started ? s.score / s.answered >= 0.65 : i < tierIndex.value,
      skipped: !started
    }
  })
)

/* ---------- 交互 ---------- */

function choose(k) {
  if (answered.value) return
  selected.value = k
  answered.value = true
  tierScores.value[tierIndex.value].answered += 1
  if (k === current.value.answer) {
    correctCount.value += 1
    tierScores.value[tierIndex.value].score += 1
  }
}

function next() {
  if (!answered.value) return
  const score = tierScores.value[tierIndex.value]
  const tierLast = tierQIndex.value >= tierQuestions.value.length - 1

  if (!tierLast) {
    tierQIndex.value += 1
    selected.value = null
    answered.value = false
    return
  }

  /* 组结束：判定通过与否 */
  const passed = score.score / score.answered >= 0.65
  if (passed && tierIndex.value < TIERS.length - 1) {
    tierIndex.value += 1
    tierQIndex.value = 0
    selected.value = null
    answered.value = false
    return
  }

  failedTier.value = passed ? -1 : tierIndex.value
  finish()
}

function finish() {
  auth.markOnboardingDone()
  auth.markPlacementDone()
  done.value = true
}

function goRecommend() {
  router.push(`/map/${recommendLevel.value}`)
}

function goL1() {
  router.push('/map')
}
</script>

<style scoped>
.placement-progress {
  font-size: 14px;
  color: var(--c-text-secondary);
  margin-bottom: var(--space-lg);
}

/* 组别文字与进度条之间留出间距 */
.progress-bar-mt {
  margin-top: 10px;
}

/* 选项列表与「下一题」按钮之间留出间距（未作答时中间无反馈区，原本贴死） */
.placement-card .btn-block {
  margin-top: var(--space-md);
}

.tier-badge {
  display: inline-block;
  background: var(--c-primary-soft, rgba(59, 130, 246, 0.12));
  color: var(--c-primary);
  border-radius: 999px;
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 700;
  margin-right: 8px;
}

.placement-question {
  margin-bottom: var(--space-lg);
}

.placement-q-text {
  font-size: 17px;
  font-weight: 600;
  color: var(--c-text-primary);
  line-height: 1.6;
}

.placement-context {
  margin-top: var(--space-sm);
  font-size: 13px;
  line-height: 1.7;
  color: var(--c-text-secondary);
  background: var(--c-bg-soft, #f5f7fa);
  border-radius: 8px;
  padding: 10px 12px;
  max-height: 150px;
  overflow-y: auto;
}

.placement-listen {
  margin-top: var(--space-sm);
}

.placement-feedback {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: var(--space-md);
  font-size: 14px;
}

.feedback-ok {
  color: var(--c-success, #16a34a);
  font-weight: 700;
}

.feedback-no {
  color: var(--c-danger, #dc2626);
  font-weight: 700;
}

.feedback-explain {
  font-size: 13px;
  color: var(--c-text-secondary);
  line-height: 1.6;
}

/* 结果页 */
.result-tiers {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: var(--space-md) 0;
}

.tier-result {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--c-bg-soft, #f5f7fa);
}

.tier-result-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.tier-result.pass .tier-result-icon {
  background: var(--c-success, #16a34a);
}

.tier-result.fail .tier-result-icon {
  background: var(--c-danger, #dc2626);
}

.tier-result-name {
  flex: 1;
  color: var(--c-text-primary);
}

.tier-result-score {
  color: var(--c-text-secondary);
  font-variant-numeric: tabular-nums;
}
</style>
