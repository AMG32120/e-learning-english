/* ============================================================
   services/speechScore.js —— 口语粗略评分（纯前端，无后端）
   两层评分：
   1) 声学特征分析（本地 DSP，瞬时完成）：
      发声完整度 / 时长与语速 / 音高自然度 / 音量是否饱满
   2) AI 转写比对（可选，浏览器内 Whisper，首次下载约 45MB 模型）：
      转写文本与目标文本逐词比对 → 词汇准确率
   这是「粗略评分」，只能反映说了多少、多快、音调是否正常，
   不能精确评判发音是否地道，结果仅供参考。
   ============================================================ */

/* ---------- 音频解码：任意格式 → 单声道 16kHz Float32 ---------- */

let sharedCtx = null
function getCtx() {
  if (!sharedCtx) sharedCtx = new (window.AudioContext || window.webkitAudioContext)()
  return sharedCtx
}

export async function decodeToMono16k(blob) {
  const ctx = getCtx()
  const buf = await ctx.decodeAudioData(await blob.arrayBuffer())
  const sr = buf.sampleRate
  const src = buf.getChannelData(0)
  const targetSr = 16000
  if (sr === targetSr) return { samples: src, sampleRate: sr }
  /* 线性插值重采样（OfflineAudioContext 在部分浏览器对重采样支持不一致，手动实现最稳） */
  const ratio = sr / targetSr
  const len = Math.floor(src.length / ratio)
  const out = new Float32Array(len)
  for (let i = 0; i < len; i += 1) {
    const pos = i * ratio
    const i0 = Math.floor(pos)
    const i1 = Math.min(i0 + 1, src.length - 1)
    const frac = pos - i0
    out[i] = src[i0] * (1 - frac) + src[i1] * frac
  }
  return { samples: out, sampleRate: targetSr }
}

/* ---------- 声学特征分析 ---------- */

/* 自相关法基音检测（单帧）：返回 Hz 或 0（未发声） */
function detectPitch(frame, sampleRate) {
  const minF = 70
  const maxF = 500
  const minLag = Math.floor(sampleRate / maxF)
  const maxLag = Math.floor(sampleRate / minF)
  let bestLag = -1
  let bestCorr = 0
  let energy = 0
  for (let i = 0; i < frame.length; i += 1) energy += frame[i] * frame[i]
  if (energy < frame.length * 0.00002) return 0 /* 静音帧 */
  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let corr = 0
    for (let i = 0; i < frame.length - lag; i += 1) corr += frame[i] * frame[i + lag]
    corr /= frame.length - lag
    if (corr > bestCorr) {
      bestCorr = corr
      bestLag = lag
    }
  }
  if (bestLag < 0 || bestCorr < 0.001) return 0
  return sampleRate / bestLag
}

export function analyzeAcoustics(samples, sampleRate = 16000) {
  const frameSize = Math.floor(sampleRate * 0.04) /* 40ms 帧 */
  const hop = Math.floor(frameSize / 2)
  const pitches = []
  const rmsList = []
  for (let start = 0; start + frameSize <= samples.length; start += hop) {
    const frame = samples.subarray(start, start + frameSize)
    let rms = 0
    for (let i = 0; i < frame.length; i += 1) rms += frame[i] * frame[i]
    rms = Math.sqrt(rms / frame.length)
    rmsList.push(rms)
    if (rms > 0.02) {
      const f = detectPitch(frame, sampleRate)
      if (f >= 70 && f <= 500) pitches.push(f)
    }
  }
  const duration = samples.length / sampleRate
  const totalFrames = rmsList.length || 1
  const activeFrames = rmsList.filter((r) => r > 0.02).length
  const avgRms = rmsList.reduce((a, b) => a + b, 0) / totalFrames
  const sortedP = pitches.slice().sort((a, b) => a - b)
  const medianPitch = sortedP.length ? sortedP[Math.floor(sortedP.length / 2)] : 0
  const pitchSpread = sortedP.length ? sortedP[Math.floor(sortedP.length * 0.9)] - sortedP[Math.floor(sortedP.length * 0.1)] : 0
  return {
    duration,
    voicedRatio: activeFrames / totalFrames,
    avgRms,
    medianPitch,
    pitchSpread,
    pitchCount: pitches.length
  }
}

/* ---------- 评分（0-100） ---------- */

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

/* 语速合理度：英语单词发音 0.3~2.5s 都属正常，越靠中间越高 */
function rateScore(duration) {
  if (duration < 0.15) return 20 /* 几乎没录到 */
  if (duration > 6) return 55 /* 拖太长 */
  if (duration >= 0.3 && duration <= 2.5) return 100
  return clamp(100 - Math.abs(duration - 1.4) * 30, 40, 100)
}

export function scoreSpeech(a) {
  const parts = {}

  /* 发声完整度：有声帧占比。说话时通常 >0.35 */
  parts.voiced = a.voicedRatio >= 0.35 ? 100 : clamp(Math.round((a.voicedRatio / 0.35) * 100), 0, 95)
  if (a.duration < 0.15) parts.voiced = 10

  /* 语速与时长 */
  parts.rate = rateScore(a.duration)

  /* 音高自然度：有效发声且中位音高在 70~450Hz（人声范围） */
  if (a.medianPitch >= 70 && a.medianPitch <= 450) parts.pitch = 100
  else if (a.medianPitch > 0) parts.pitch = 60
  else parts.pitch = 25

  /* 音量饱满度：平均 RMS 过低说明离麦太远 */
  parts.volume = a.avgRms >= 0.05 ? 100 : clamp(Math.round((a.avgRms / 0.05) * 100), 20, 95)

  const overall = Math.round(parts.voiced * 0.35 + parts.rate * 0.3 + parts.pitch * 0.2 + parts.volume * 0.15)
  return { overall, parts }
}

/* 评分 → 提示语 */
export function scoreTips(score, a) {
  const tips = []
  if (score.parts.voiced < 60) tips.push('有声片段偏少：请对着麦克风完整说出单词，避免太安静。')
  if (score.parts.rate < 60) tips.push(a.duration > 2.5 ? '有点拖长：尽量自然一口气读完。' : '稍快了点：放慢节奏，把每个音节说清楚。')
  if (score.parts.volume < 70) tips.push('音量偏小：靠近一点麦克风，声音放开说。')
  if (score.parts.pitch <= 25) tips.push('没检测到清晰的人声：检查麦克风是否被遮挡。')
  if (!tips.length) tips.push('表现不错！再对照标准发音听听细节差异吧。')
  return tips
}

/* ---------- 词级准确率（转写文本 vs 目标文本） ---------- */

function normalizeWords(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z'\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

function levenshtein(a, b) {
  const m = a.length
  const n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)])
  for (let j = 0; j <= n; j += 1) dp[0][j] = j
  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    }
  }
  return dp[m][n]
}

export function wordAccuracy(transcript, target) {
  const t = normalizeWords(transcript)
  const g = normalizeWords(target)
  if (!g.length) return 0
  if (!t.length) return 0
  const dist = levenshtein(t, g)
  return Math.round(clamp(1 - dist / Math.max(t.length, g.length), 0, 1) * 100)
}

/* ---------- 浏览器内 Whisper（Web Worker 懒加载） ---------- */

let whisperWorker = null
let msgSeq = 0
const pending = new Map()

function ensureWhisperWorker() {
  if (whisperWorker) return whisperWorker
  whisperWorker = new Worker(new URL('../workers/whisper.worker.js', import.meta.url), { type: 'module' })
  whisperWorker.onmessage = (e) => {
    const { type, id, text, message } = e.data || {}
    const p = pending.get(id)
    if (p) {
      pending.delete(id)
      if (type === 'result') p.resolve(text)
      else p.reject(new Error(message || 'whisper error'))
    }
    if (type === 'ready' && pending.has('ready')) {
      pending.get('ready').resolve()
      pending.delete('ready')
    }
  }
  whisperWorker.onerror = () => {
    /* 拒绝所有等待中的请求 */
    pending.forEach((p) => p.reject(new Error('worker failed')))
    pending.clear()
  }
  return whisperWorker
}

/* 预热模型（下载 + 初始化），供 UI 提前触发；超时/失败返回 false */
export function preloadWhisper(timeoutMs = 120000) {
  const w = ensureWhisperWorker()
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      pending.delete('ready')
      resolve(false)
    }, timeoutMs)
    pending.set('ready', {
      resolve: () => {
        clearTimeout(timer)
        resolve(true)
      },
      reject: () => {
        clearTimeout(timer)
        resolve(false)
      }
    })
    w.postMessage({ type: 'load' })
  })
}

/* 转写 16kHz Float32 音频；失败抛错（调用方降级为纯声学评分） */
export async function transcribeWhisper(samples, timeoutMs = 60000) {
  const w = ensureWhisperWorker()
  const id = `t${(msgSeq += 1)}`
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(id)
      reject(new Error('transcribe timeout'))
    }, timeoutMs)
    pending.set(id, {
      resolve: (text) => {
        clearTimeout(timer)
        resolve(text)
      },
      reject: (e) => {
        clearTimeout(timer)
        reject(e)
      }
    })
    w.postMessage({ type: 'transcribe', id, audio: samples })
  })
}
