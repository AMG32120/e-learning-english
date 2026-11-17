<template>
  <main class="page-container">
    <button class="back-btn" @click="$router.back()">← 返回</button>
    <h1 class="page-title">连词成句</h1>
    <p class="page-subtitle">把乱序词块排成正确的句子，巩固语法语序</p>

    <!-- 答题中 -->
    <div v-if="!finished" class="card stage-card">
      <div class="stage-head">
        <span>第 {{ index + 1 }} / {{ items.length }} 句</span>
        <span>答对 {{ correctCount }} / {{ answeredCount }}</span>
      </div>

      <div class="order-prompt">把下面的词块排成通顺的英文句子</div>
      <div class="order-zh">💡 句意：{{ currentItem.zh }}</div>

      <div class="order-slots">
        <span v-for="(t, i) in picked" :key="'p' + i" class="order-chip picked" @click="removeAt(i)">{{ t }}</span>
        <span v-if="!picked.length" class="order-placeholder">点击下方词块开始组句…</span>
      </div>

      <div class="order-tokens">
        <button
          v-for="(tok, i) in currentItem.tokens"
          :key="i"
          class="order-token"
          :class="{ used: pickedIndexes.includes(i) }"
          :disabled="revealed || pickedIndexes.includes(i)"
          @click="pick(i)"
        >{{ tok }}</button>
      </div>

      <div v-if="revealed" class="order-feedback" :class="{ ok: wasCorrect, no: !wasCorrect }">
        <template v-if="wasCorrect">回答正确！</template>
        <template v-else>正确答案：{{ currentItem.en }}</template>
      </div>

      <div class="order-actions">
        <button v-if="!revealed" class="btn btn-ghost" :disabled="!picked.length" @click="clearAll">重来</button>
        <button v-if="!revealed" class="btn btn-primary" :disabled="picked.length !== currentItem.tokens.length" @click="confirm">确定</button>
        <button v-else class="btn btn-primary btn-block" @click="next">
          {{ index === items.length - 1 ? '查看结果' : '下一句' }}
        </button>
      </div>
    </div>

    <!-- 结果页 -->
    <div v-else class="card stage-card result-card">
      <div class="result-emoji">{{ correctCount / items.length >= 0.8 ? '🎉' : '💪' }}</div>
      <h2 class="result-title">本轮成绩</h2>
      <p class="result-score">{{ correctCount }} / {{ items.length }}（{{ Math.round((correctCount / items.length) * 100) }}%）</p>
      <p class="result-tip">语序是英语表达的基础，多练几轮会更顺手。</p>
      <div class="order-actions center">
        <button class="btn btn-primary" @click="restart">再来一轮</button>
        <button class="btn btn-ghost" @click="$router.push('/practice')">返回训练场</button>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import { SENTENCE_BANKS } from '../data/sentences'
import { useProgressStore } from '../stores/progress'

const progress = useProgressStore()

const SESSION_SIZE = 8
const items = ref([])
const index = ref(0)
const picked = ref([])
const pickedIndexes = ref([])
const revealed = ref(false)
const wasCorrect = ref(false)
const correctCount = ref(0)
const answeredCount = ref(0)
const finished = ref(false)
const recorded = ref(false)

const currentItem = computed(() => items.value[index.value] || { tokens: [], en: '', zh: '' })

function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildItems() {
  const all = [...SENTENCE_BANKS.basic, ...SENTENCE_BANKS.adv]
  items.value = shuffle(all)
    .slice(0, SESSION_SIZE)
    .map((item) => {
      let tokens = shuffle(item.en.split(' '))
      if (tokens.join(' ') === item.en && tokens.length > 1) {
        tokens = tokens.slice(1).concat(tokens.slice(0, 1))
      }
      return { ...item, tokens }
    })
}

function pick(i) {
  if (revealed.value || pickedIndexes.value.includes(i)) return
  picked.value.push(currentItem.value.tokens[i])
  pickedIndexes.value.push(i)
}

function removeAt(slotIndex) {
  if (revealed.value) return
  picked.value.splice(slotIndex, 1)
  // 依据剩余词块重算原始索引，保证与 tokens 一一对应
  const taken = new Array(currentItem.value.tokens.length).fill(false)
  const out = []
  for (const t of picked.value) {
    for (let i = 0; i < currentItem.value.tokens.length; i++) {
      if (!taken[i] && currentItem.value.tokens[i] === t) {
        taken[i] = true
        out.push(i)
        break
      }
    }
  }
  pickedIndexes.value = out
}

function clearAll() {
  picked.value = []
  pickedIndexes.value = []
}

function norm(s) {
  return String(s).toLowerCase().replace(/[.,?!]/g, '').replace(/\s+/g, ' ').trim()
}

function confirm() {
  if (revealed.value) return
  const guess = picked.value.join(' ')
  revealed.value = true
  answeredCount.value += 1
  wasCorrect.value = norm(guess) === norm(currentItem.value.en)
  if (wasCorrect.value) correctCount.value += 1
}

function next() {
  if (index.value < items.value.length - 1) {
    index.value += 1
    clearAll()
    revealed.value = false
    wasCorrect.value = false
  } else {
    finished.value = true
    if (!recorded.value) {
      progress.recordQuiz({ correct: correctCount.value, total: items.value.length })
      progress.checkInToday()
      recorded.value = true
    }
  }
}

function restart() {
  buildItems()
  index.value = 0
  clearAll()
  revealed.value = false
  wasCorrect.value = false
  correctCount.value = 0
  answeredCount.value = 0
  finished.value = false
  recorded.value = false
}

buildItems()
</script>

<style scoped>
.stage-card {
  margin-top: var(--space-md);
}

.order-prompt {
  font-weight: 600;
  margin-bottom: var(--space-xs);
}

.order-zh {
  font-size: 13px;
  color: var(--c-text-secondary);
  margin-bottom: var(--space-md);
}

.order-slots {
  min-height: 52px;
  border: 1px dashed var(--c-border);
  border-radius: 10px;
  padding: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: var(--space-md);
  background: var(--c-bg-soft);
}

.order-chip {
  background: var(--c-primary);
  color: #fff;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
}

.order-placeholder {
  color: var(--c-text-muted);
  font-size: 13px;
}

.order-tokens {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: var(--space-md);
}

.order-token {
  background: var(--c-bg-card);
  border: 1px solid var(--c-border);
  border-radius: 8px;
  padding: 7px 13px;
  font-size: 14px;
  cursor: pointer;
  color: var(--c-text);
  transition: opacity 0.15s;
}

.order-token.used {
  opacity: 0.35;
  cursor: not-allowed;
}

.order-feedback {
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: var(--space-md);
}

.order-feedback.ok {
  background: var(--c-primary-light);
  color: var(--c-primary-dark);
}

.order-feedback.no {
  background: rgba(231, 76, 60, 0.1);
  color: var(--c-danger);
}

.order-actions {
  display: flex;
  gap: var(--space-sm);
}

.order-actions.center {
  justify-content: center;
}

.result-card {
  text-align: center;
  padding: var(--space-lg);
}

.result-emoji {
  font-size: 42px;
}

.result-title {
  margin: var(--space-sm) 0 4px;
}

.result-score {
  font-size: 22px;
  font-weight: 700;
  color: var(--c-primary);
}

.result-tip {
  color: var(--c-text-secondary);
  font-size: 13px;
  margin-bottom: var(--space-md);
}
</style>
