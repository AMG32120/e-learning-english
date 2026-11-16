<template>
  <div>
    <main class="page-container">
      <h1 class="page-title">磨耳朵</h1>
      <p class="page-sub">通勤、走路、睡前听一遍，单词与例句连续自动播放</p>

      <!-- 准备页 -->
      <section v-if="phase === 'setup'" class="card">
        <p class="setup-title">🎧 连续听音</p>
        <p class="setup-desc">选择词源和播放内容，点开始后自动连播，可随时暂停或切换上下句。</p>

        <div class="setup-block">
          <div class="setup-label">听什么</div>
          <div class="setup-options">
            <button
              v-for="opt in MODES"
              :key="opt.value"
              class="setup-opt"
              :class="{ active: mode === opt.value }"
              @click="mode = opt.value"
            >{{ opt.label }}</button>
          </div>
        </div>

        <div class="setup-block">
          <div class="setup-label">词源</div>
          <div class="setup-options">
            <button
              v-for="opt in SOURCES"
              :key="opt.value"
              class="setup-opt"
              :class="{ active: source === opt.value }"
              @click="source = opt.value"
            >{{ opt.label }}（{{ counts[opt.value] }}）</button>
          </div>
        </div>

        <div class="setup-block">
          <div class="setup-label">顺序</div>
          <div class="setup-options">
            <button class="setup-opt" :class="{ active: order === 'seq' }" @click="order = 'seq'">顺序</button>
            <button class="setup-opt" :class="{ active: order === 'random' }" @click="order = 'random'">随机</button>
          </div>
        </div>

        <div class="setup-block">
          <div class="setup-label">语速</div>
          <div class="setup-options">
            <button
              v-for="opt in RATES"
              :key="opt.value"
              class="setup-opt"
              :class="{ active: rate === opt.value }"
              @click="rate = opt.value"
            >{{ opt.label }}</button>
          </div>
        </div>

        <button class="btn btn-primary btn-block start-btn" :disabled="!deckSize" @click="start">
          开始播放（{{ deckSize }} 条）
        </button>
        <p v-if="!deckSize" class="setup-hint">该词源为空：先去闯关、收藏生词或完成复习。</p>
      </section>

      <!-- 播放页 -->
      <section v-else-if="phase === 'play'" class="card listen-stage">
        <div class="listen-progress">
          <div class="listen-bar"><div class="listen-bar-fill" :style="{ width: progressPercent + '%' }"></div></div>
          <span class="listen-num">{{ index + 1 }} / {{ deck.length }}</span>
        </div>

        <div class="listen-card" :class="{ 'mode-example': mode === 'example' }">
          <div class="listen-text">{{ currentText }}</div>
          <div v-if="current.ipa" class="listen-ipa ipa">{{ current.ipa }}</div>
          <div v-if="current.zh" class="listen-zh">{{ current.zh }}</div>
          <div v-if="speaking" class="listen-wave" aria-hidden="true">
            <span></span><span></span><span></span><span></span>
          </div>
          <div v-else class="listen-idle">已暂停</div>
        </div>

        <div class="listen-actions">
          <button class="btn btn-ghost" @click="prev">⏮ 上一句</button>
          <button class="btn btn-primary listen-toggle" @click="toggle">
            {{ playing ? '⏸ 暂停' : '▶️ 继续' }}
          </button>
          <button class="btn btn-ghost" @click="next">下一句 ⏭</button>
        </div>

        <button class="btn btn-ghost btn-block listen-stop" @click="finish">结束播放</button>
      </section>

      <!-- 完成页 -->
      <section v-else class="card listen-done">
        <p class="done-emoji">🎉</p>
        <p class="done-title">本轮听完了</p>
        <p class="done-desc">共播放 {{ deck.length }} 条，耳朵会记住这些声音的。</p>
        <button class="btn btn-primary btn-block" @click="replay">再听一遍</button>
        <button class="btn btn-ghost btn-block" @click="backToSetup">换个词源</button>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { useProgressStore } from '../stores/progress'
import { findWord } from '../services/dictionary'
import { speak, stopSpeak } from '../services/tts'

const progress = useProgressStore()

const MODES = [
  { value: 'word', label: '单词' },
  { value: 'example', label: '例句（有例句的词）' }
]
const RATES = [
  { value: 0.7, label: '慢速' },
  { value: 0.85, label: '标准' },
  { value: 1, label: '原速' }
]

const phase = ref('setup') // setup | play | done
const mode = ref('word')
const source = ref('wordbook')
const order = ref('seq')
const rate = ref(0.85)
const deck = ref([])
const index = ref(0)
const playing = ref(false)
const speaking = ref(false)

let stopFlag = false
let gapTimer = 0

/* ---------- 词源 ---------- */

function wordsOf(src) {
  if (!progress.data) return []
  if (src === 'wordbook') {
    return progress.wordbookEntries.map((e) => ({ word: e.word, zh: e.zh, ipa: e.ipa, example: e.example, pos: e.pos }))
  }
  if (src === 'review') {
    return Object.keys(progress.data.reviewPool || {})
      .map((k) => findWord(k))
      .filter(Boolean)
      .map((w) => ({ word: w.word, zh: w.zh, ipa: w.ipa, example: w.example, pos: w.pos }))
  }
  return (progress.data.stats.masteredWords || [])
    .map((k) => findWord(k))
    .filter(Boolean)
    .map((w) => ({ word: w.word, zh: w.zh, ipa: w.ipa, example: w.example, pos: w.pos }))
}

const counts = computed(() => ({
  wordbook: wordsOf('wordbook').length,
  review: wordsOf('review').length,
  mastered: wordsOf('mastered').length
}))

const SOURCES = [
  { value: 'wordbook', label: '生词本' },
  { value: 'review', label: '复习池' },
  { value: 'mastered', label: '已学词汇' }
]

const pool = computed(() => wordsOf(source.value))

const deckSize = computed(() => {
  let list = pool.value
  if (mode.value === 'example') list = list.filter((w) => w.example)
  return Math.min(60, list.length)
})

const current = computed(() => deck.value[index.value] || null)
const currentText = computed(() => {
  if (!current.value) return ''
  return mode.value === 'example' ? current.value.example : current.value.word
})
const progressPercent = computed(() => {
  if (!deck.value.length) return 0
  return Math.round(((index.value + (speaking.value ? 0.5 : 0)) / deck.value.length) * 100)
})

/* ---------- 播放控制 ---------- */

function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildDeck() {
  let list = pool.value
  if (mode.value === 'example') list = list.filter((w) => w.example)
  const picked = list.slice(0, 60)
  return order.value === 'random' ? shuffle(picked) : picked
}

function start() {
  deck.value = buildDeck()
  if (!deck.value.length) return
  index.value = 0
  phase.value = 'play'
  playing.value = true
  playCurrent()
}

async function playCurrent() {
  if (!playing.value || !current.value) return
  stopFlag = false
  speaking.value = true
  const text = currentText.value
  try {
    await speak(text, { rate: rate.value })
  } catch {
    /* 忽略播放异常，继续下一句 */
  }
  speaking.value = false
  if (stopFlag || !playing.value) return
  progress.recordDaily('listen', 1)
  gapTimer = setTimeout(() => {
    if (stopFlag || !playing.value) return
    if (index.value + 1 >= deck.value.length) {
      finish()
      return
    }
    index.value += 1
    playCurrent()
  }, 900)
}

function clearGap() {
  if (gapTimer) {
    clearTimeout(gapTimer)
    gapTimer = 0
  }
}

function toggle() {
  if (playing.value) {
    playing.value = false
    stopFlag = true
    clearGap()
    stopSpeak()
    speaking.value = false
  } else {
    playing.value = true
    playCurrent()
  }
}

function next() {
  clearGap()
  stopSpeak()
  speaking.value = false
  if (index.value + 1 >= deck.value.length) {
    finish()
    return
  }
  index.value += 1
  if (playing.value) playCurrent()
}

function prev() {
  clearGap()
  stopSpeak()
  speaking.value = false
  index.value = Math.max(0, index.value - 1)
  if (playing.value) playCurrent()
}

function finish() {
  clearGap()
  stopFlag = true
  playing.value = false
  speaking.value = false
  stopSpeak()
  phase.value = 'done'
}

function replay() {
  index.value = 0
  phase.value = 'play'
  playing.value = true
  playCurrent()
}

function backToSetup() {
  phase.value = 'setup'
}

onBeforeUnmount(() => {
  stopFlag = true
  playing.value = false
  clearGap()
  stopSpeak()
})
</script>

<style scoped>
.page-sub {
  color: var(--c-text-secondary);
  font-size: 13px;
  margin-top: 2px;
  margin-bottom: var(--space-md);
}

.setup-title {
  font-size: 17px;
  font-weight: 800;
}

.setup-desc {
  font-size: 13px;
  color: var(--c-text-secondary);
  margin: 6px 0 var(--space-md);
}

.setup-block {
  margin-bottom: var(--space-md);
}

.setup-label {
  font-size: 13px;
  color: var(--c-text-muted);
  margin-bottom: var(--space-xs);
}

.setup-options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.setup-opt {
  border: 2px solid var(--c-border);
  background: var(--c-bg-card);
  color: var(--c-text-secondary);
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}

.setup-opt.active {
  border-color: var(--c-primary);
  color: var(--c-primary);
  background: var(--c-primary-light);
  font-weight: 700;
}

.start-btn {
  margin-top: var(--space-sm);
}

.setup-hint {
  font-size: 13px;
  color: var(--c-text-muted);
  text-align: center;
  margin-top: 10px;
}

/* 播放页 */
.listen-progress {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.listen-bar {
  flex: 1;
  height: 6px;
  background: var(--c-bg-soft);
  border-radius: 999px;
  overflow: hidden;
}

.listen-bar-fill {
  height: 100%;
  background: var(--c-primary);
  border-radius: 999px;
  transition: width 0.3s ease;
}

.listen-num {
  font-size: 13px;
  color: var(--c-text-muted);
  font-variant-numeric: tabular-nums;
}

.listen-card {
  text-align: center;
  padding: var(--space-lg) var(--space-md);
  background: var(--c-bg-soft);
  border-radius: var(--radius-md);
  min-height: 190px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.listen-text {
  font-size: 28px;
  font-weight: 800;
  color: var(--c-text);
  line-height: 1.3;
  word-break: break-word;
}

.mode-example .listen-text {
  font-size: 22px;
}

.listen-ipa {
  color: var(--c-text-secondary);
  font-size: 15px;
}

.listen-zh {
  font-size: 15px;
  color: var(--c-text-secondary);
}

.listen-wave {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 4px;
  height: 24px;
  margin-top: 8px;
}

.listen-wave span {
  width: 4px;
  border-radius: 2px;
  background: var(--c-primary);
  animation: listen-wave 0.9s ease-in-out infinite;
}

.listen-wave span:nth-child(1) { height: 10px; animation-delay: 0s; }
.listen-wave span:nth-child(2) { height: 20px; animation-delay: 0.15s; }
.listen-wave span:nth-child(3) { height: 14px; animation-delay: 0.3s; }
.listen-wave span:nth-child(4) { height: 22px; animation-delay: 0.45s; }

@keyframes listen-wave {
  0%, 100% { transform: scaleY(0.5); opacity: 0.6; }
  50% { transform: scaleY(1); opacity: 1; }
}

.listen-idle {
  font-size: 13px;
  color: var(--c-text-muted);
  margin-top: 6px;
}

.listen-actions {
  display: grid;
  grid-template-columns: 1fr 1.3fr 1fr;
  gap: var(--space-sm);
  margin-top: var(--space-md);
}

.listen-toggle {
  font-weight: 700;
}

.listen-stop {
  margin-top: var(--space-sm);
  color: var(--c-text-muted);
}

/* 完成页 */
.listen-done {
  text-align: center;
  padding: var(--space-lg);
}

.done-emoji {
  font-size: 44px;
  line-height: 1;
}

.done-title {
  font-size: 20px;
  font-weight: 800;
  margin-top: var(--space-sm);
}

.done-desc {
  font-size: 13px;
  color: var(--c-text-secondary);
  margin: var(--space-xs) 0 var(--space-md);
}

@media (max-width: 480px) {
  .listen-text {
    font-size: 24px;
  }
  .listen-actions {
    grid-template-columns: 1fr 1fr;
  }
  .listen-toggle {
    grid-column: 1 / -1;
    order: -1;
  }
}
</style>
