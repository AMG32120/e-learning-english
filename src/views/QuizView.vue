<template>
  <div>
    <main class="container page">
      <h1 class="page-title">随机测验</h1>
      <p class="page-sub">从已学习、已解锁内容池随机抽题，随时检验掌握程度</p>

      <!-- 锁定 -->
      <section v-if="!progress.ready || !unlocked" class="card">
        <div class="empty-state">
          <p class="empty-icon">🔒</p>
          <p>随机测验尚未开放</p>
          <p class="empty-hint">完成 L2 的至少 1 个关卡后开放（受内容可见性过滤器约束，仅从已解锁内容抽题）。</p>
          <router-link class="btn btn-primary" to="/map">前往闯关</router-link>
        </div>
      </section>

      <!-- 设置页 -->
      <section v-else-if="phase === 'setup'" class="card">
        <div class="setup">
          <p class="setup-label">出题范围</p>
          <div class="setup-options">
            <button
              v-for="opt in rangeOptions"
              :key="opt.value"
              class="setup-opt"
              :class="{ active: range === opt.value }"
              @click="range = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>
          <p class="setup-label">题量</p>
          <div class="setup-options">
            <button
              v-for="n in [10, 20]"
              :key="n"
              class="setup-opt"
              :class="{ active: count === n }"
              @click="count = n"
            >
              {{ n }} 题
            </button>
          </div>
          <button class="btn btn-primary btn-block" @click="start">开始测验</button>
          <p v-if="startHint" class="setup-hint">{{ startHint }}</p>
        </div>
      </section>

      <!-- 答题页 -->
      <section v-else-if="phase === 'quiz'" class="card">
        <div class="quiz-progress">第 {{ index + 1 }} / {{ questions.length }} 题</div>
        <div v-if="current" class="quiz-body">
          <p class="quiz-q">{{ current.q }}</p>
          <div class="quiz-options">
            <button
              v-for="(opt, oi) in current.options"
              :key="oi"
              class="quiz-opt"
              :class="{
                correct: picked !== null && oi === current.answer,
                wrong: picked !== null && picked === oi && oi !== current.answer
              }"
              :disabled="picked !== null"
              @click="pick(oi)"
            >
              <span class="opt-label">{{ String.fromCharCode(65 + oi) }}.</span>{{ opt }}
            </button>
          </div>
          <p v-if="picked !== null && current.explain" class="quiz-explain">{{ current.explain }}</p>
          <button v-if="picked !== null" class="btn btn-primary btn-block" @click="next">下一题</button>
        </div>
      </section>

      <!-- 结果页 -->
      <section v-else class="card">
        <div class="result">
          <p class="result-icon">{{ correct >= Math.ceil(questions.length * 0.7) ? '🎉' : '📚' }}</p>
          <p class="result-num">{{ correct }} / {{ questions.length }}</p>
          <p class="result-text">答对 {{ correct }} 题，正确率 {{ accuracy }}%</p>
          <p class="result-hint">成绩已计入学习统计；答错题目已加入复习池。</p>
          <div class="result-actions">
            <button class="btn btn-ghost" @click="phase = 'setup'">再测一组</button>
            <router-link class="btn btn-primary" to="/map">返回闯关地图</router-link>
          </div>
        </div>
      </section>
    </main>
    <BottomTab />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import BottomTab from '../components/BottomTab.vue'
import { LEVELS } from '../data/levels'
import { collectLevelQuestions, shuffle } from '../services/quizBank'
import { useProgressStore } from '../stores/progress'

const progress = useProgressStore()

const phase = ref('setup') // setup | quiz | result
const range = ref('all')
const count = ref(10)
const index = ref(0)
const picked = ref(null)
const correct = ref(0)
const questions = ref([])

/* 开放条件：完成 L2 至少 1 关（PLAN §3.4.6） */
const unlocked = computed(() => {
  if (!progress.data) return false
  const lv2 = LEVELS.find((l) => l.level === 2)
  return !!lv2 && lv2.stages.some((st) => progress.data.progress.stages[st.id] && progress.data.progress.stages[st.id].completed)
})

/* 当前可出题等级：已解锁等级 */
const availableLevels = computed(() =>
  LEVELS.filter((l) => progress.isLevelUnlocked(l.level)).map((l) => l.level)
)

const rangeOptions = computed(() => {
  const opts = [{ value: 'all', label: '全部已解锁内容' }]
  availableLevels.value.forEach((lv) => {
    const title = { 1: '字母启蒙', 2: '基础词汇', 3: '日常对话', 4: '初级语法', 5: '中级词汇', 6: '听说进阶', 7: '高级读写', 8: '仿真冲刺' }[lv] || `L${lv}`
    opts.push({ value: String(lv), label: `L${lv} ${title}` })
  })
  return opts
})

const startHint = ref('')

const current = computed(() => questions.value[index.value] || null)
const accuracy = computed(() => (questions.value.length ? Math.round((correct.value / questions.value.length) * 100) : 0))

function start() {
  startHint.value = ''
  const levels = range.value === 'all' ? availableLevels.value : [Number(range.value)]
  const all = []
  levels.forEach((lv) => all.push(...collectLevelQuestions(progress, lv)))
  questions.value = shuffle(all).slice(0, count.value)
  if (!questions.value.length) {
    startHint.value = '所选范围内暂无可抽题目，请先完成更多关卡。'
    return
  }
  index.value = 0
  picked.value = null
  correct.value = 0
  phase.value = 'quiz'
}

function pick(oi) {
  if (picked.value !== null) return
  picked.value = oi
  if (oi === current.value.answer) {
    correct.value += 1
  } else {
    progress.addToReviewPool([`quiz-${index.value}-${Date.now() % 100000}`])
  }
}

function next() {
  if (index.value + 1 >= questions.value.length) {
    finish()
    return
  }
  index.value += 1
  picked.value = null
}

function finish() {
  progress.recordQuiz({ correct: correct.value, total: questions.value.length })
  phase.value = 'result'
}

onMounted(() => {
  progress.loadForCurrentUser()
})
</script>

<style scoped>
.page-sub {
  color: var(--c-text-secondary);
  font-size: 13px;
  margin-top: 2px;
  margin-bottom: var(--space-md);
}
.empty-state {
  text-align: center;
  padding: 24px 8px;
  color: var(--c-text-secondary);
}
.empty-icon {
  font-size: 36px;
  margin-bottom: 8px;
}
.empty-hint {
  font-size: 13px;
  color: var(--c-text-muted);
  margin-top: 6px;
  margin-bottom: 14px;
}
.setup-label {
  font-size: 14px;
  font-weight: 600;
  margin: 14px 0 8px;
}
.setup-options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  margin-bottom: 8px;
}
.setup-opt {
  padding: 9px 14px;
  border: 1px solid var(--c-border);
  border-radius: 20px;
  background: var(--c-bg-soft);
  color: var(--c-text);
  font-size: 14px;
  cursor: pointer;
}
.setup-opt.active {
  border-color: var(--c-primary);
  background: var(--c-primary);
  color: #fff;
}
.setup-hint {
  font-size: 13px;
  color: var(--c-text-muted);
  margin-top: 10px;
  text-align: center;
}
.btn-block {
  width: 100%;
  margin-top: 14px;
}
.quiz-progress {
  font-size: 13px;
  color: var(--c-text-muted);
  margin-bottom: 16px;
  text-align: center;
}
.quiz-q {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  line-height: 1.5;
}
.quiz-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: 16px;
}
.quiz-opt {
  text-align: left;
  padding: 12px 14px;
  border: 1px solid var(--c-border);
  border-radius: 12px;
  background: var(--c-bg-soft);
  color: var(--c-text);
  font-size: 15px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.quiz-opt:not(:disabled):hover {
  border-color: var(--c-primary);
}
.quiz-opt.correct {
  border-color: var(--c-success, #22c55e);
  background: rgba(34, 197, 94, 0.12);
  color: var(--c-success, #15803d);
}
.quiz-opt.wrong {
  border-color: var(--c-danger, #ef4444);
  background: rgba(239, 68, 68, 0.1);
  color: var(--c-danger, #b91c1c);
}
.opt-label {
  display: inline-block;
  min-width: 22px;
  font-weight: 700;
}
.quiz-explain {
  background: var(--c-bg-soft);
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 14px;
  color: var(--c-text-secondary);
  margin-bottom: 16px;
}
.result {
  text-align: center;
  padding: 16px 0;
}
.result-icon {
  font-size: 44px;
  margin-bottom: 8px;
}
.result-num {
  font-size: 36px;
  font-weight: 800;
  color: var(--c-primary);
}
.result-text {
  font-size: 16px;
  font-weight: 600;
  margin-top: 8px;
}
.result-hint {
  font-size: 13px;
  color: var(--c-text-muted);
  margin-top: 6px;
  margin-bottom: 20px;
}
.result-actions {
  display: flex;
  gap: var(--space-sm);
  justify-content: center;
}
</style>
