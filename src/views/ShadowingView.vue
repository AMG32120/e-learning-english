<template>
  <div>
    <main class="page-container">
      <h1 class="page-title">跟读对比</h1>
      <p class="page-sub">听标准发音 → 自己录音 → 回放对比，找出差距（需要麦克风权限）</p>

      <!-- 准备页 -->
      <section v-if="phase === 'setup'" class="card">
        <div class="setup-info">
          <p class="setup-title">🎙️ 跟读训练</p>
          <p class="setup-desc">选择一个单词或句子，先听标准发音，再录下自己的声音：回放对比 + 本地声学评分 + AI 转写比对（可选）。</p>
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

          <!-- 步骤 4：口语评分（本地声学分析） -->
          <div v-if="scoring" class="sh-scoring">⏳ 正在本地分析录音…</div>
          <div v-else-if="score" class="sh-step">
            <div class="sh-step-label">第 4 步 · 口语评分（本地分析，仅供参考）</div>
            <div class="sh-score">
              <div class="sh-score-head">
                <span class="sh-score-num" :class="score.overall >= 80 ? 'good' : score.overall >= 60 ? 'mid' : 'low'">{{ score.overall }}</span>
                <span class="sh-score-title">综合评分</span>
              </div>
              <div class="sh-score-bars">
                <div v-for="(label, key) in SCORE_ITEMS" :key="key" class="sh-score-row">
                  <span class="sh-score-label">{{ label }}</span>
                  <div class="sh-score-bar"><div class="sh-score-fill" :style="{ width: score.parts[key] + '%' }"></div></div>
                  <span class="sh-score-val">{{ score.parts[key] }}</span>
                </div>
              </div>
              <ul class="sh-tips">
                <li v-for="(t, i) in score.tips" :key="i">{{ t }}</li>
              </ul>
              <div class="sh-ai-row">
                <button class="btn btn-ghost" :disabled="asrBusy" @click="runAiScore">
                  {{ asrState === 'loading' ? '⏳ 模型加载中…' : asrState === 'running' ? '⏳ AI 转写中…' : '🤖 AI 转写比对' }}
                </button>
                <span class="sh-ai-hint">首次使用需下载约 45MB 模型（浏览器内运行，录音不上传）</span>
              </div>
              <div v-if="asrState === 'done'" class="sh-asr-result">
                <p>AI 听到的：<b>{{ asrText }}</b></p>
                <p>与目标「{{ current.word }}」的词汇准确率：<b>{{ asrAccuracy }}%</b></p>
              </div>
              <p v-if="asrMsg" class="sh-ai-fail">{{ asrMsg }}</p>
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
import { analyzeAcoustics, scoreSpeech, scoreTips, decodeToMono16k, wordAccuracy, preloadWhisper, transcribeWhisper } from '../services/speechScore'

const SCORE_ITEMS = { voiced: '发声完整', rate: '时长语速', pitch: '音高自然', volume: '音量饱满' }

const progress = useProgressStore()

const phase = ref('setup') // setup | train | result
const list = ref([])
const index = ref(0)
const stdPlaying = ref(false)
const recording = ref(false)
const recordingUrl = ref('')
const waveform = ref(null)
const micError = ref('')

/* 口语评分状态 */
const score = ref(null)
const scoring = ref(false)
const asrState = ref('idle') // idle | loading | running | done | fail
const asrText = ref('')
const asrAccuracy = ref(null)
const asrMsg = ref('')
const asrBusy = computed(() => asrState.value === 'loading' || asrState.value === 'running')

let mediaRecorder = null
let mediaStream = null
let chunks = []
let audioCtx = null
let stdAudio = null
let mineAudio = null
let lastBlob = null

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
  score.value = null
  scoring.value = false
  asrState.value = 'idle'
  asrText.value = ''
  asrAccuracy.value = null
  asrMsg.value = ''
  lastBlob = null
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
    lastBlob = new Blob(chunks, { type: mediaRecorder.mimeType || 'audio/webm' })
    if (recordingUrl.value) URL.revokeObjectURL(recordingUrl.value)
    recordingUrl.value = URL.createObjectURL(lastBlob)
    buildWaveform(lastBlob)
    analyzeScore(lastBlob)
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

/* ---------- 口语评分（本地声学分析） ---------- */

async function analyzeScore(blob) {
  scoring.value = true
  score.value = null
  try {
    const { samples } = await decodeToMono16k(blob)
    const a = analyzeAcoustics(samples)
    const s = scoreSpeech(a)
    score.value = { ...s, tips: scoreTips(s, a) }
  } catch {
    score.value = null /* 解码失败时静默，不影响回放对比 */
  } finally {
    scoring.value = false
  }
}

/* AI 转写比对（浏览器内 Whisper，懒加载模型） */
async function runAiScore() {
  if (!lastBlob || asrBusy.value) return
  asrMsg.value = ''
  try {
    if (asrState.value !== 'done') {
      asrState.value = 'loading'
      const ok = await preloadWhisper()
      if (!ok) {
        asrState.value = 'fail'
        asrMsg.value = '模型加载失败：需联网下载约 45MB（走国内镜像），请检查网络后重试。'
        return
      }
    }
    asrState.value = 'running'
    const { samples } = await decodeToMono16k(lastBlob)
    const text = await transcribeWhisper(samples)
    asrText.value = text.trim() || '（未识别到内容，请重录并靠近麦克风）'
    asrAccuracy.value = wordAccuracy(text, current.value ? current.value.word : '')
    asrState.value = 'done'
  } catch {
    asrState.value = 'fail'
    asrMsg.value = 'AI 转写失败：可能是模型下载未完成或设备内存不足，可稍后重试。'
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

/* ---------- 口语评分卡 ---------- */
.sh-scoring {
  font-size: 13px;
  color: var(--c-text-muted);
  text-align: center;
  padding: 10px 0;
}

.sh-score {
  background: var(--c-bg-soft);
  border-radius: 14px;
  padding: 14px;
  text-align: left;
}

.sh-score-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.sh-score-num {
  font-size: 30px;
  font-weight: 800;
  line-height: 1;
}

.sh-score-num.good { color: #16a34a; }
.sh-score-num.mid { color: #d97706; }
.sh-score-num.low { color: #ef4444; }

.sh-score-title {
  font-size: 13px;
  color: var(--c-text-secondary);
}

.sh-score-bars {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sh-score-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sh-score-label {
  width: 60px;
  font-size: 12px;
  color: var(--c-text-secondary);
  flex-shrink: 0;
}

.sh-score-bar {
  flex: 1;
  height: 8px;
  background: var(--c-bg-card);
  border-radius: 4px;
  overflow: hidden;
}

.sh-score-fill {
  height: 100%;
  background: var(--c-primary);
  border-radius: 4px;
  transition: width 0.3s;
}

.sh-score-val {
  width: 28px;
  text-align: right;
  font-size: 12px;
  color: var(--c-text-muted);
  flex-shrink: 0;
}

.sh-tips {
  margin: 10px 0 0;
  padding-left: 18px;
}

.sh-tips li {
  font-size: 12px;
  color: var(--c-text-secondary);
  line-height: 1.6;
}

.sh-ai-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.sh-ai-hint {
  font-size: 11px;
  color: var(--c-text-muted);
}

.sh-asr-result {
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.7;
  background: var(--c-bg-card);
  border-radius: 10px;
  padding: 10px 12px;
}

.sh-ai-fail {
  margin-top: 8px;
  font-size: 12px;
  color: var(--c-danger, #ef4444);
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
