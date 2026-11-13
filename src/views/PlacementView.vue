<template>
  <div class="page-container placement">
    <h1 class="page-title">入学水平自测</h1>
    <p class="page-subtitle">
      {{ done ? '自测完成' : `共 ${QUESTIONS.length} 题，请根据当前水平作答，无对错压力` }}
    </p>

    <!-- 答题中 -->
    <template v-if="!done">
      <div class="card placement-card">
        <div class="placement-progress">
          第 {{ index + 1 }} / {{ QUESTIONS.length }} 题
          <div class="progress-bar" style="margin-top: 6px">
            <div class="progress-fill" :style="{ width: ((index + 1) / QUESTIONS.length) * 100 + '%' }"></div>
          </div>
        </div>

        <div class="placement-question">
          <div class="placement-q-text">{{ current.q }}</div>
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
        </div>

        <button class="btn btn-primary btn-block" :disabled="!answered" @click="next">
          {{ index === QUESTIONS.length - 1 ? '查看结果' : '下一题' }}
        </button>
      </div>
    </template>

    <!-- 结果页 -->
    <template v-else>
      <div class="card placement-card result">
        <div class="result-score">
          <div class="result-num">{{ correct }}/{{ QUESTIONS.length }}</div>
          <div class="result-percent">正确率 {{ percent }}%</div>
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

const router = useRouter()
const auth = useAuthStore()

const QUESTIONS = [
  { q: '字母 A 的正确读音是？', options: [{ k: '0', label: '/eɪ/' }, { k: '1', label: '/æ/' }, { k: '2', label: '/ɑː/' }, { k: '3', label: '/iː/' }], answer: '0' },
  { q: '小写字母 g 的大写形式是？', options: [{ k: '0', label: 'G' }, { k: '1', label: 'Q' }, { k: '2', label: 'J' }, { k: '3', label: 'S' }], answer: '0' },
  { q: '单词 apple 的中文意思是？', options: [{ k: '0', label: '香蕉' }, { k: '1', label: '苹果' }, { k: '2', label: '橙子' }, { k: '3', label: '葡萄' }], answer: '1' },
  { q: '"狗" 的英文是？', options: [{ k: '0', label: 'cat' }, { k: '1', label: 'dog' }, { k: '2', label: 'pig' }, { k: '3', label: 'bird' }], answer: '1' },
  { q: '音标 /kæt/ 对应哪个单词？', options: [{ k: '0', label: 'cat' }, { k: '1', label: 'cut' }, { k: '2', label: 'kite' }, { k: '3', label: 'cake' }], answer: '0' },
  { q: 'I ___ a student.', options: [{ k: '0', label: 'is' }, { k: '1', label: 'am' }, { k: '2', label: 'are' }, { k: '3', label: 'be' }], answer: '1' },
  { q: 'There ___ two books on the desk.', options: [{ k: '0', label: 'is' }, { k: '1', label: 'are' }, { k: '2', label: 'am' }, { k: '3', label: 'be' }], answer: '1' },
  { q: '点击喇叭听发音，选出听到的单词对应的中文意思：', listen: 'cat', options: [{ k: '0', label: '苹果' }, { k: '1', label: '猫' }, { k: '2', label: '帽子' }, { k: '3', label: '鸟' }], answer: '1' }
]

const index = ref(0)
const selected = ref(null)
const answered = ref(false)
const correctCount = ref(0)
const done = ref(false)

const current = computed(() => QUESTIONS[index.value])
const correctAnswerLabel = computed(() => {
  const opt = current.value.options.find((o) => o.k === current.value.answer)
  return opt ? opt.label : ''
})
const correct = computed(() => correctCount.value)
const percent = computed(() => Math.round((correctCount.value / QUESTIONS.length) * 100))
const recommendLevel = computed(() => {
  if (percent.value >= 80) return 3
  if (percent.value >= 40) return 2
  return 1
})
const recommendLabel = computed(() => `L${recommendLevel.value} ${['', '字母启蒙', '基础词汇', '日常对话'][recommendLevel.value]}`)
const recommendDesc = computed(() => {
  if (percent.value >= 80) return '基础扎实，可从日常对话等级开始进阶'
  if (percent.value >= 40) return '有一定基础，建议从基础词汇等级巩固'
  return '零基础友好，从字母启蒙开始打牢地基'
})

function choose(k) {
  if (answered.value) return
  selected.value = k
  answered.value = true
  if (k === current.value.answer) correctCount.value += 1
}

function next() {
  if (index.value === QUESTIONS.length - 1) {
    finish()
    return
  }
  index.value += 1
  selected.value = null
  answered.value = false
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
.placement-card {
  max-width: 640px;
  margin: 0 auto;
}

.placement-progress {
  font-size: 14px;
  color: var(--c-text-secondary);
  margin-bottom: var(--space-lg);
}

.placement-question {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.placement-q-text {
  font-size: 18px;
  font-weight: 600;
  flex: 1;
}

.placement-feedback {
  margin-top: var(--space-md);
  font-weight: 600;
}

/* 选项组与「下一题」按钮之间保持呼吸感 */
.quiz-options {
  margin-bottom: var(--space-md);
}

.feedback-ok {
  color: var(--c-accent);
}

.feedback-no {
  color: var(--c-danger);
}

.result {
  text-align: center;
}

.result-score {
  font-size: 20px;
  font-weight: 700;
  color: var(--c-primary);
  margin-bottom: var(--space-md);
}

.result-num {
  font-size: 42px;
  font-weight: 800;
}

.result-percent {
  font-size: 16px;
  color: var(--c-text-secondary);
}

.result-recommend {
  background: var(--c-primary-light);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  margin-bottom: var(--space-lg);
}

.result-label {
  font-size: 13px;
  color: var(--c-text-secondary);
}

.result-level {
  font-size: 26px;
  font-weight: 800;
  color: var(--c-primary);
}

.result-desc {
  font-size: 14px;
  color: var(--c-text-secondary);
  margin-top: var(--space-xs);
}

.result-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
</style>
