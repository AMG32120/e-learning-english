<template>
  <div>
    <main class="page-container">
      <h1 class="page-title">跟读对比</h1>
      <p class="page-sub">听标准发音 → 自己录音 → 回放对比，找出差距（需要麦克风权限）</p>

      <!-- 准备页 -->
      <section v-if="phase === 'setup'" class="card">
        <div class="setup-info">
          <p class="setup-title">🎙️ 跟读训练</p>
          <p class="setup-desc">选择一个单词或句子，先听标准发音，再录下自己的声音回放对比。浏览器只能对比不能打分，请相信自己的耳朵。</p>
          <p class="setup-pool">练习内容：{{ poolLabel }}</p>
          <button class="btn btn-primary btn-block" :disabled="!pool.length" @click="start">
            开始跟读（{{ Math.min(10, pool.length || 0) }} 条）
          </button>
          <p v-if="!pool.length" class="setup-hint">词池为空：先闯关学习或收藏生词。</p>
        </div>
      </section>

      <!-- 跟读页 -->
      <section v-else-if="phase === 'train'" class="card">
        <div class="train-progress">
          <div class="train-bar"><div class="train-bar-fill" :style="{ width: (index / list.length) * 100 + '%' }"></div></div>
          <span class="train-num">{{ index + 1 }} / {{ list.length }}</span>
        </div>

        <div v-if="current" class="sh-body">
          <div class="sh-content">
            <div class="sh-text">{{ current.word }}</div>
            <div v-if="current.ipa" class="sh-ipa ipa">{{ current.ipa }}</div>
            <div v-if="current.zh" class="sh-zh">{{ current.zh }}</div>
          </div>

          <!-- 步骤 1：标准发音 -->
          <div class="sh-step">
            <div class="sh-step-label">第 1 步 · 听标准发音（可重复听）</div>
            <button class="sh-play-btn" :class="{ playing: stdPlaying }" @click="playStandard">
              {{ stdPlaying ? '⏹ 停止' : '🔊 播放标准发音' }}
            </button>
          </div>

          <!-- 步骤 2：录音 -->
          <div class="sh-step">
            <div class="sh-step-label">第 2 步 · 录下你的声音</div>
            <button v-if="!recording && !recordingUrl" class="sh-rec-btn" @click="startRecord">🎙️ 开始录音</button>
            <button v-else-if="recording" class="sh-rec-btn rec" @click="stopRecord">
              <span class="rec-dot"></span> 录音中… 点击停止
            </button>
          </div>

          <!-- 步骤 3：对比回放 -->
          <div v-if="recordingUrl" class="sh-step">
            <div class="sh-step-label">第 3 步 · 回放对比</div>
            <div class="sh-compare">
              <button class="sh-cmp-btn" @click="playStandard">🔊 标准发音</button>
              <button class="sh-cmp-btn me" @click="playMine">🎧 我的录音</button>
            </div>
            <div v-if="waveform && waveform.length" class="sh-wave">
              <svg :viewBox="`0 0 ${waveform.length} 40`" preserveAspectRatio="none">
                <rect
                  v-for="(h, i) in waveform"
                  :key="i"
                  :x="i"
                  :y="20 - h"
                  width="0.8"
                  :height="h * 2"
                  fill="var(--c-primary)"
                  rx="0.4"
                />
              </svg>
              <div class="sh-wave-caption">你的录音波形</div>
            </div>
            <div class="sh-redo-row">
              <button class="btn btn-ghost" @click="resetRecord">🔄 重新录音</button>
              <button class="btn btn-primary" @click="next">下一个</button>
            </div>
          </div>
        </div>
      </section>

      <!-- 结果页 -->
      <section v-else class="card">
        <div class="result">
          <p class="result-icon">🎤</p>
          <p class="result-text">本轮跟读完成（{{ list.length }} 条）</p>
          <p class="result-hint">跟读练习已计入学习统计。多听多模仿，发音会越来越自然。</p>
          <div class="result-actions">
            <button class="btn btn-ghost" @click="phase = 'setup'">再来一轮</button>
            <router-link class="btn btn-primary" to="/">返回首页</router-link>
          </div>
        </div>
      </section>

      <p v-if="micError" class="sh-error">🎤 {{ micError }}</p>
    </main>
    <BottomTab />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import BottomTab from '../components/BottomTab.vue'
import { useProgressStore } from '../stores/progress'
import { findWord } from '../services/dictionary'
import { speak, stopSpeak } from '../services/tts'

const progress = useProgressStore()

const phase = ref('setup') // setup | train | result
const list = ref([])
const index = ref(0)
const stdPlaying = ref(false)
const recording = ref(false)
const recordingUrl = ref('')
const waveform = ref(null)
const micError = ref('')

let mediaRecorder = null
let mediaStream = null
let chunks = []
let audioCtx = null
let stdAudio = null
let mineAudio = null

/* 词池：与训练场一致 */
const pool = computed(() => {
  if (!progress.data) return []
  const keys = new Set()
  if (Array.isArray(progress.data.wordbook)) progress.data.wordbook.forEach((k) => keys.add(k))
  Object.keys(progress.data.reviewPool || {}).forEach((k) => keys.add(k.split(':')[1] || k))
  if (Array.isArray(progress.data.stats?.masteredWords)) {
    progress.data.stats.masteredWords.forEach((w) => keys.add(`${w}|`))
  }
  const items = []
  const seen = new Set()
  for (const key of keys) {
    const e = findWord(key)
    if (!e || !e.word) continue
    const w = e.word.toLowerCase()
    if (seen.has(w) || !/^[a-z][a-z-]{1,18}$/i.test(e.word)) continue
    seen.add(w)
    items.push(e)
  }
  return items
})

const poolLabel = computed(() => `生词本 + 复习池 + 已掌握词汇（${pool.value.length} 条）`)
const current = computed(() => list.value[index.value] || null)

function start() {
  list.value = shuffle(pool.value.slice()).slice(0, 10)
  if (!list.value.length) return
  index.value = 0
  resetRecord()
  phase.value = 'train'
}

function resetRecord() {
  stopSpeak()
  stdPlaying.value = false
  if (recordingUrl.value) URL.revokeObjectURL(recordingUrl.value)
  recordingUrl.value = ''
  waveform.value = null
  recording.value = false
  micError.value = ''
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/* ---------- 标准发音 ---------- */

async function playStandard() {
  if (stdPlaying.value) {
    stopSpeak()
    stdPlaying.value = false
    return
  }
  stopSpeak()
  stdPlaying.value = true
  try {
    await speak(current.value.word, { rate: 0.8, onEnd: () => (stdPlaying.value = false), onError: () => (stdPlaying.value = false) })
  } finally {
    stdPlaying.value = false
  }
}

/* ---------- 录音（MediaRecorder） ---------- */

async function startRecord() {
  micError.value = ''
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
  } catch {
    micError.value = '无法访问麦克风：请在浏览器地址栏允许麦克风权限后重试。'
    return
  }
  chunks = []
  try {
    mediaRecorder = new MediaRecorder(mediaStream)
  } catch {
    micError.value = '当前浏览器不支持录音功能（MediaRecorder）。'
    cleanupStream()
    return
  }
  mediaRecorder.ondataavailable = (ev) => {
    if (ev.data && ev.data.size) chunks.push(ev.data)
  }
  mediaRecorder.onstop = () => {
    const blob = new Blob(chunks, { type: mediaRecorder.mimeType || 'audio/webm' })
    if (recordingUrl.value) URL.revokeObjectURL(recordingUrl.value)
    recordingUrl.value = URL.createObjectURL(blob)
    buildWaveform(blob)
    cleanupStream()
  }
  mediaRecorder.start()
  recording.value = true
}

function stopRecord() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
  recording.value = false
}

function cleanupStream() {
  if (mediaStream) {
    mediaStream.getTracks().forEach((t) => t.stop())
    mediaStream = null
  }
}

/* 播放我的录音 */
function playMine() {
  if (!recordingUrl.value) return
  if (mineAudio) {
    mineAudio.pause()
    mineAudio = null
  }
  mineAudio = new Audio(recordingUrl.value)
  mineAudio.play().catch(() => {})
}

/* 解码录音生成波形峰值 */
async function buildWaveform(blob) {
  try {
    if (!audioCtx) audioCtx = new AudioContext()
    const buf = await blob.arrayBuffer()
    const audio = await audioCtx.decodeAudioData(buf)
    const data = audio.getChannelData(0)
    const bars = 120
    const block = Math.floor(data.length / bars)
    const peaks = []
    for (let i = 0; i < bars; i++) {
      let max = 0
      for (let j = 0; j < block; j++) {
        const v = Math.abs(data[i * block + j] || 0)
        if (v > max) max = v
      }
      peaks.push(Math.min(19, Math.round(max * 19)))
    }
    waveform.value = peaks
  } catch {
    waveform.value = null
  }
}

function next() {
  stopSpeak()
  resetRecord()
  if (index.value + 1 >= list.value.length) {
    progress.recordDaily('shadow', list.value.length)
    phase.value = 'result'
    return
  }
  index.value += 1
}

onMounted(() => {
  progress.loadForCurrentUser()
})

onBeforeUnmount(() => {
  stopRecord()
  cleanupStream()
  stopSpeak()
  if (stdAudio) stdAudio.pause()
  if (mineAudio) mineAudio.pause()
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
  line-height: 1.7;
  margin: 8px 0 4px;
}

.setup-pool {
  font-size: 13px;
  color: var(--c-text-muted);
  margin-bottom: 14px;
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

.sh-body {
  text-align: center;
}

.sh-content {
  background: var(--c-bg-soft);
  border-radius: 14px;
  padding: 18px;
  margin-bottom: var(--space-md);
}

.sh-text {
  font-size: 30px;
  font-weight: 800;
  color: var(--c-primary);
  word-break: break-all;
}

.sh-ipa {
  font-size: 15px;
  color: var(--c-text-secondary);
  margin-top: 4px;
}

.sh-zh {
  font-size: 14px;
  color: var(--c-text);
  margin-top: 6px;
}

.sh-step {
  margin-bottom: var(--space-md);
}

.sh-step-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text-secondary);
  margin-bottom: 8px;
}

.sh-play-btn,
.sh-rec-btn {
  padding: 12px 22px;
  border-radius: 12px;
  border: 1px solid var(--c-border);
  background: var(--c-bg-card);
  color: var(--c-text);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.sh-rec-btn.rec {
  border-color: var(--c-danger, #ef4444);
  color: var(--c-danger, #b91c1c);
  background: rgba(239, 68, 68, 0.08);
}

.rec-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--c-danger, #ef4444);
  margin-right: 8px;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.sh-compare {
  display: flex;
  gap: var(--space-sm);
  justify-content: center;
}

.sh-cmp-btn {
  padding: 10px 18px;
  border-radius: 10px;
  border: 1px solid var(--c-primary);
  background: var(--c-primary);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
}

.sh-cmp-btn.me {
  background: var(--c-bg-card);
  color: var(--c-primary);
}

.sh-wave {
  margin: 14px auto 4px;
  max-width: 360px;
}

.sh-wave svg {
  width: 100%;
  height: 40px;
  display: block;
  background: var(--c-bg-soft);
  border-radius: 8px;
}

.sh-wave-caption {
  font-size: 11px;
  color: var(--c-text-muted);
  margin-top: 4px;
}

.sh-redo-row {
  display: flex;
  gap: var(--space-sm);
  justify-content: center;
  margin-top: var(--space-sm);
}

.sh-error {
  margin-top: var(--space-sm);
  font-size: 13px;
  color: var(--c-danger, #ef4444);
  text-align: center;
}

.result {
  text-align: center;
  padding: 16px 0;
}

.result-icon {
  font-size: 44px;
  margin-bottom: 8px;
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
