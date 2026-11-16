<template>
  <div>
    <main class="page-container">
      <h1 class="page-title">卡片快刷</h1>
      <p class="page-sub">快速过一遍生词与已学词汇，标记「认识 / 不认识」</p>

      <!-- 准备页 -->
      <section v-if="phase === 'setup'" class="card">
        <div class="setup-info">
          <p class="setup-title">🃏 快闪卡片</p>
          <p class="setup-desc">点击卡片翻面看释义；认识就过，不认识自动加入复习池。</p>
          <p class="setup-pool">词池：{{ poolLabel }}</p>
          <div class="setup-options">
            <button
              v-for="opt in rangeOptions"
              :key="opt.value"
              class="setup-opt"
              :class="{ active: range === opt.value }"
              @click="range = opt.value"
            >{{ opt.label }}</button>
          </div>
          <button class="btn btn-primary btn-block" :disabled="!poolSize" @click="start">
            开始快刷（{{ Math.min(20, poolSize || 0) }} 张）
          </button>
          <p v-if="!poolSize" class="setup-hint">词池为空：先闯关学习或收藏生词。</p>
        </div>
      </section>

      <!-- 卡片页 -->
      <section v-else-if="phase === 'train'" class="card">
        <div class="train-progress">
          <div class="train-bar"><div class="train-bar-fill" :style="{ width: (index / deck.length) * 100 + '%' }"></div></div>
          <span class="train-num">{{ index + 1 }} / {{ deck.length }}</span>
        </div>

        <div v-if="current" class="card-stage">
          <div class="flash-card" :class="{ flipped: flipped }" @click="flipped = !flipped">
            <!-- 正面：单词 -->
            <div class="face front">
              <div class="fc-word">{{ current.word }}</div>
              <div v-if="current.ipa" class="fc-ipa ipa">{{ current.ipa }}</div>
              <div class="fc-hint">点击卡片看释义</div>
            </div>
            <!-- 背面：释义 -->
            <div class="face back">
              <div class="fc-zh">{{ current.zh || '（无释义）' }}</div>
              <div v-if="current.pos" class="fc-pos">{{ current.pos }}</div>
            </div>
          </div>
          <div class="fc-tts"><TtsButton :text="current.word" aria-label="播放发音" /></div>

          <div class="fc-actions">
            <button class="btn fc-btn no" @click="mark(false)">❌ 不认识</button>
            <button class="btn fc-btn yes" @click="mark(true)">✅ 认识</button>
          </div>
          <p class="fc-stats">已过：认识 {{ knownCount }} · 不认识 {{ unknownCount }}</p>
        </div>
      </section>

      <!-- 结果页 -->
      <section v-else class="card">
        <div class="result">
          <p class="result-icon">{{ rate >= 70 ? '🎉' : '💪' }}</p>
          <p class="result-num">{{ knownCount }} / {{ deck.length }}</p>
          <p class="result-text">认识率 {{ rate }}%</p>
          <p v-if="unknownCount" class="result-hint">{{ unknownCount }} 个不认识的单词已加入复习池，明天会出现在间隔复习里。</p>
          <p v-else class="result-hint">全部认识，太棒了！</p>
          <div class="result-actions">
            <button class="btn btn-ghost" @click="phase = 'setup'">再来一轮</button>
            <router-link class="btn btn-primary" to="/">返回首页</router-link>
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
import TtsButton from '../components/TtsButton.vue'
import { useProgressStore } from '../stores/progress'
import { findWord } from '../services/dictionary'

const progress = useProgressStore()

const phase = ref('setup') // setup | train | result
const range = ref('wordbook')
const deck = ref([])
const index = ref(0)
const flipped = ref(false)
const knownCount = ref(0)
const unknownCount = ref(0)

/* ---------- 词池（与训练场一致的三个来源） ---------- */

const allPool = computed(() => {
  if (!progress.data) return []
  const keys = new Set()
  if (Array.isArray(progress.data.wordbook)) progress.data.wordbook.forEach((k) => keys.add(k))
  Object.keys(progress.data.reviewPool || {}).forEach((k) => keys.add(k.split(':')[1] || k))
  if (Array.isArray(progress.data.stats?.masteredWords)) {
    progress.data.stats.masteredWords.forEach((w) => keys.add(`${w}|`))
  }
  const items = []
  for (const key of keys) {
    const e = findWord(key)
    if (e && e.word) items.push(e)
  }
  return dedupeByWord(items)
})

const wordbookPool = computed(() => dedupeByWord(progress.wordbookEntries.filter((e) => e.word)))

const rangeOptions = computed(() => {
  const opts = [{ value: 'all', label: '全部已学内容' }]
  if (wordbookPool.value.length) opts.unshift({ value: 'wordbook', label: `我的生词本（${wordbookPool.value.length}）` })
  return opts
})

const poolSize = computed(() => (range.value === 'wordbook' ? wordbookPool.value.length : allPool.value.length))
const poolLabel = computed(() =>
  range.value === 'wordbook' ? `生词本收藏（${wordbookPool.value.length} 张）` : `生词本 + 复习池 + 已掌握词汇（${allPool.value.length} 张）`
)

function dedupeByWord(items) {
  const seen = new Set()
  return items.filter((e) => {
    const w = e.word.toLowerCase()
    if (seen.has(w)) return false
    seen.add(w)
    return true
  })
}

const current = computed(() => deck.value[index.value] || null)
const rate = computed(() => (deck.value.length ? Math.round((knownCount.value / deck.value.length) * 100) : 0))

function start() {
  const pool = shuffle(range.value === 'wordbook' ? [...wordbookPool.value] : [...allPool.value])
  deck.value = pool.slice(0, 20)
  if (!deck.value.length) return
  index.value = 0
  flipped.value = false
  knownCount.value = 0
  unknownCount.value = 0
  phase.value = 'train'
}

function mark(known) {
  if (!current.value) return
  if (known) {
    knownCount.value += 1
  } else {
    unknownCount.value += 1
    progress.addToReviewPool([`flashcard:${current.value.word}`])
  }
  progress.recordDaily('flash', 1)
  if (index.value + 1 >= deck.value.length) {
    phase.value = 'result'
    return
  }
  index.value += 1
  flipped.value = false
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
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

.setup-info {
  padding: 8px 0;
}

.setup-title {
  font-size: 20px;
  font-weight: 800;
}

.setup-desc {
  font-size: 14px;
  color: var(--c-text-secondary);
  margin: 8px 0 4px;
}

.setup-pool {
  font-size: 13px;
  color: var(--c-text-muted);
  margin-bottom: 14px;
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
}

.train-progress {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.train-bar {
  flex: 1;
  height: 8px;
  border-radius: 4px;
  background: var(--c-bg-soft);
  overflow: hidden;
}

.train-bar-fill {
  height: 100%;
  background: var(--c-primary);
  transition: width 0.2s;
}

.train-num {
  font-size: 13px;
  color: var(--c-text-muted);
  flex-shrink: 0;
}

/* 卡片翻转 */
.card-stage {
  text-align: center;
}

.flash-card {
  position: relative;
  width: 100%;
  max-width: 360px;
  height: 220px;
  margin: 0 auto;
  cursor: pointer;
  perspective: 1000px;
}

.flash-card .face {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  border: 2px solid var(--c-border);
  background: var(--c-bg-card);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  backface-visibility: hidden;
  transition: transform 0.45s;
}

.flash-card .back {
  transform: rotateY(180deg);
  background: var(--c-bg-soft);
}

.flash-card.flipped .front {
  transform: rotateY(180deg);
}

.flash-card.flipped .back {
  transform: rotateY(0deg);
}

.fc-word {
  font-size: 38px;
  font-weight: 800;
  color: var(--c-primary);
  letter-spacing: 1px;
  word-break: break-all;
}

.fc-ipa {
  font-size: 17px;
  color: var(--c-text-secondary);
}

.fc-hint {
  font-size: 12px;
  color: var(--c-text-muted);
}

.fc-zh {
  font-size: 24px;
  font-weight: 700;
}

.fc-pos {
  font-size: 13px;
  color: var(--c-text-muted);
  font-style: italic;
}

.fc-tts {
  margin: 12px 0;
}

.fc-actions {
  display: flex;
  gap: var(--space-sm);
  justify-content: center;
  margin-top: var(--space-sm);
}

.fc-btn {
  flex: 1;
  max-width: 160px;
  font-size: 15px;
}

.fc-btn.no {
  background: rgba(239, 68, 68, 0.1);
  color: var(--c-danger, #b91c1c);
  border: 1px solid rgba(239, 68, 68, 0.4);
}

.fc-btn.yes {
  background: rgba(34, 197, 94, 0.12);
  color: var(--c-success, #15803d);
  border: 1px solid rgba(34, 197, 94, 0.4);
}

.fc-stats {
  font-size: 13px;
  color: var(--c-text-muted);
  margin-top: var(--space-sm);
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
