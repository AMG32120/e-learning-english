/* ============================================================
   services/tts.js —— 发音引擎封装（Kokoro 神经音质版）
   播放优先级：Kokoro-82M 神经网络离线合成（v1.0 ONNX，Apache-2.0）
              → 系统 Web Speech API（speechSynthesis）兜底 → 失败
   - Kokoro 是浏览器端可跑的离线神经 TTS 中真人感最强的开源模型
     （TTS Arena 浏览器可跑榜第 1），按需加载（WebGPU+fp16 约 88MB，
     回退 WASM+q8），模型/声音文件存入浏览器 Cache API，二次访问免下载。
   - 国内网络对 huggingface.co 直连不可靠：模块加载时安装 fetch 垫片，
     将 HF 请求重定向到 hf-mirror.com（模型与声音向量文件均改走镜像）。
   - 长文本经 kokoro stream() 按句切分，边合成边播放（流水线，首句
     合成完即出声，不等整段）。
   - speak() 返回 Promise<{ engine, started, voiceName, reason }>
     engine 取值：kokoro | system | none
   - 进度事件：模型下载期间派发 window CustomEvent('tts-kokoro')，
     detail = { phase: 'progress'|'ready'|'error', loaded, total, message }
     供 UI（如 TtsButton）展示首次加载进度。
   ============================================================ */

let voicesCache = []
let voicesLoaded = false
const VOICE_WAIT_TIMEOUT = 3000   // 语音列表等待上限（毫秒）
const SPEAK_DELAY_MS = 150        // Chrome 缺陷 workaround 延迟（毫秒）
const VOICE_POLL_INTERVAL = 100   // 语音列表轮询间隔（毫秒）

/* ---------- 声音性别偏好（男声/女声，本地记忆） ---------- */

const GENDER_KEY = 'tts-voice-gender'   // localStorage 存储键
export const VOICE_GENDERS = ['female', 'male']  // 支持的取值
export const DEFAULT_VOICE_GENDER = 'female'     // 默认女声（自然，适合跟读）
let voiceGender = null

function loadVoiceGender() {
  if (voiceGender) return voiceGender
  try {
    const g = localStorage.getItem(GENDER_KEY)
    if (g === 'female' || g === 'male') voiceGender = g
  } catch { /* localStorage 不可用时忽略 */ }
  return voiceGender || DEFAULT_VOICE_GENDER
}

/** 获取当前声音性别偏好：'female' | 'male'（未设置时返回默认值） */
export function getVoiceGender() {
  return loadVoiceGender()
}

/** 设置声音性别偏好并持久化（'female' | 'male' | null 恢复默认） */
export function setVoiceGender(gender) {
  voiceGender = gender === 'female' || gender === 'male' ? gender : null
  try {
    if (voiceGender) localStorage.setItem(GENDER_KEY, voiceGender)
    else localStorage.removeItem(GENDER_KEY)
  } catch { /* ignore */ }
  return voiceGender || DEFAULT_VOICE_GENDER
}

/* Kokoro 音色映射（延续 f2/m3 男女声概念）：
   女声 Heart（A 级，最自然），男声 Michael（C+ 级中最佳男声） */
const KOKORO_VOICES = { female: 'af_heart', male: 'am_michael' }
const KOKORO_VOICE_LABELS = { af_heart: 'Heart 女声', am_michael: 'Michael 男声' }

function emitKokoroEvent(detail) {
  try {
    window.dispatchEvent(new CustomEvent('tts-kokoro', { detail }))
  } catch { /* ignore */ }
}

/* ---------- Kokoro 模型缓存检测与用户跳过标记 ---------- */

const MODEL_SKIP_KEY = 'qc-boot-model-skip'   // 用户在首次准备页选择"跳过真人发音"

/* 模型本体是否已下载进浏览器 Cache API（transformers 的缓存名为
   transformers-cache，缓存键为模型文件 URL，含 onnx 模型文件） */
export async function isKokoroModelCached() {
  if (typeof caches === 'undefined') return false
  try {
    const cache = await caches.open('transformers-cache')
    const keys = await cache.keys()
    return keys.some((req) => /Kokoro-82M.*\.onnx/i.test(req.url))
  } catch {
    return false
  }
}

function isModelSkipped() {
  try {
    return localStorage.getItem(MODEL_SKIP_KEY) === '1'
  } catch {
    return false
  }
}

/* 记录/清除"跳过真人发音"标记（BootGate 与设置页使用） */
export function setModelSkipped(v) {
  try {
    if (v) localStorage.setItem(MODEL_SKIP_KEY, '1')
    else localStorage.removeItem(MODEL_SKIP_KEY)
  } catch { /* ignore */ }
}

/* 用户是否选择过"跳过真人发音"（同步近似，只看用户标记；
   speak() 内部会再异步确认模型是否已缓存，缓存命中则不受标记影响） */
export function shouldSkipKokoro() {
  return isModelSkipped()
}

/* 系统语音中是否存在可用的男声英语语音（供设置页提示用）。
   getEnglishVoice('male') 匹配不到男声时会退回全部候选，
   这里再用启发式二次确认是否真的匹配到男声。 */
export function hasSystemMaleVoice() {
  const voice = getEnglishVoice('male')
  if (!voice) return false
  return MALE_NAME_RE.test(voice.name) && !FEMALE_NAME_RE.test(voice.name)
}

/* ---------- HF 镜像垫片（模块加载即安装） ----------
   兜底用：任何仍直连 huggingface.co 的请求改写到 hf-mirror.com。
   模型/音色的主路径已走同源代理 /api/hf（见 HF_PROXY_BASE）。 */
const HF_HOST = 'https://huggingface.co'
const HF_MIRROR = 'https://hf-mirror.com'
if (typeof window !== 'undefined' && typeof window.fetch === 'function' && !window.__ttsHfShimInstalled) {
  const origFetch = window.fetch.bind(window)
  window.fetch = (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input && input.url
    if (typeof url === 'string' && url.startsWith(HF_HOST)) {
      return origFetch(url.replace(HF_HOST, HF_MIRROR), init)
    }
    return origFetch(input, init)
  }
  window.__ttsHfShimInstalled = true
}

/* ---------- Kokoro 引擎（惰性加载，WebGPU 优先） ---------- */

function makeKokoroProgress() {
  const files = new Map()
  return (p) => {
    if (p.status === 'progress' && p.total) {
      files.set(p.file, { loaded: p.loaded, total: p.total })
    } else if (p.status === 'done' && p.file) {
      const f = files.get(p.file)
      if (f) f.loaded = f.total
    }
    let loaded = 0
    let total = 0
    for (const f of files.values()) { loaded += f.loaded; total += f.total }
    if (total > 0) {
      emitKokoroEvent({
        phase: 'progress',
        loaded,
        total,
        message: `${(loaded / 1048576).toFixed(1)}MB / ${(total / 1048576).toFixed(1)}MB`,
      })
    }
  }
}

function webgpuAvailable() {
  return typeof navigator !== 'undefined' && typeof navigator.gpu !== 'undefined'
}

/* WebGPU 适配器探测：navigator.gpu 存在不代表能拿到适配器（如浏览器
   GPU 加速被禁用、驱动黑名单等），必须 requestAdapter 实测；返回适配器
   或 null（供后续按 shader-f16 特性决定 fp16 是否可用）。 */
async function webgpuAdapterReady() {
  if (!webgpuAvailable()) return null
  try {
    return await navigator.gpu.requestAdapter()
  } catch {
    return null
  }
}

/* ---------- Kokoro 直连实现 ----------
   不用 kokoro-js 的 generate/stream 包装层（实测其对 q8/wasm 返回空
   waveform，见 2026-11-25 诊断记录），改为基于主站已有
   @huggingface/transformers 直接驱动 StyleTextToSpeech2 ONNX 会话：
   phonemize → tokenizer → style 切片 → session.run → waveform。
   声音向量（voices/*.bin，约 26KB/个）经镜像拉取并 Cache API 持久化。 */

const KOKORO_MODEL = 'onnx-community/Kokoro-82M-v1.0-ONNX'
/* 同源代理基址：dev 由 vite 中间件、生产由 Cloudflare Worker
   提供 /api/hf/* → hf-mirror.com（回退 huggingface.co）的同源转发，
   规避镜像站重定向响应缺失跨域头导致的 CORS 失败。 */
const HF_PROXY_BASE = `${typeof location !== 'undefined' ? location.origin : ''}/api/hf`
/* ONNX 运行时同样走同源代理：transformers 4.3.2 默认让浏览器直连
   jsdelivr CDN 拉 ort-wasm-simd-threaded.asyncify mjs/wasm（约 26MB），
   国内直连不稳定且失败会静默掉进不可用状态。 */
const ORT_VERSION = '1.31.0-dev.20260914-8d85527a0'
const KOKORO_SR = 24000

let kokoroEnginePromise = null

async function fetchVoiceBin(name) {
  const url = `${HF_PROXY_BASE}/${KOKORO_MODEL}/resolve/main/voices/${name}.bin`
  try {
    const cache = await caches.open('kokoro-voices')
    const hit = await cache.match(url)
    if (hit) return new Float32Array(await hit.arrayBuffer())
  } catch { /* Cache API 不可用时直连 */ }
  const res = await fetch(url)
  if (!res.ok) throw new Error(`音色向量下载失败：${name} (${res.status})`)
  const buf = await res.arrayBuffer()
  try {
    const cache = await caches.open('kokoro-voices')
    await cache.put(url, new Response(buf))
  } catch { /* ignore */ }
  return new Float32Array(buf)
}

/* 句子切分：按终止符切句；超长句再按逗号/分号细分（Kokoro 单次合成
   上限约 510 phoneme token，控制每段长度以保证韵律与稳定） */
function splitSentences(text) {
  const parts = text.match(/[^.!?…。？！\n]+[.!?…。？！]*[\s]*/g) || [text]
  const out = []
  for (const p of parts) {
    const s = p.trim()
    if (!s) continue
    if (s.length <= 300) { out.push(s); continue }
    let buf = ''
    for (const seg of s.split(/(?<=[,;:、，；：])\s*/)) {
      if ((buf + seg).length > 280 && buf) { out.push(buf.trim()); buf = seg } else { buf += seg }
    }
    if (buf.trim()) out.push(buf.trim())
  }
  return out
}

/* Float32 PCM → 16bit mono WAV Blob（供 Audio 元素播放） */
function encodeWavBlob(pcm, sampleRate) {
  const n = pcm.length
  const buf = new ArrayBuffer(44 + n * 2)
  const v = new DataView(buf)
  const str = (off, s) => { for (let i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i)) }
  str(0, 'RIFF')
  v.setUint32(4, 36 + n * 2, true)
  str(8, 'WAVE')
  str(12, 'fmt ')
  v.setUint32(16, 16, true)
  v.setUint16(20, 1, true)   // PCM
  v.setUint16(22, 1, true)   // mono
  v.setUint32(24, sampleRate, true)
  v.setUint32(28, sampleRate * 2, true)
  v.setUint16(32, 2, true)
  v.setUint16(34, 16, true)
  str(36, 'data')
  v.setUint32(40, n * 2, true)
  for (let i = 0; i < n; i++) {
    const x = Math.max(-1, Math.min(1, pcm[i]))
    v.setInt16(44 + i * 2, x < 0 ? x * 0x8000 : x * 0x7fff, true)
  }
  return new Blob([buf], { type: 'audio/wav' })
}

function ensureKokoro() {
  if (!kokoroEnginePromise) {
    kokoroEnginePromise = (async () => {
      const [t, p] = await Promise.all([
        import('@huggingface/transformers'),
        import('phonemizer'),
      ])
      const { AutoTokenizer, StyleTextToSpeech2Model, Tensor, env } = t
      const { phonemize } = p
      // transformers 的模型/分词器文件统一走同源代理（transformers 按
      // remoteHost + remotePathTemplate 拼接 URL，须带尾斜杠）
      env.remoteHost = `${HF_PROXY_BASE}/`
      // ONNX 运行时（胶水 mjs + wasm）也改走同源代理，不再直连 jsdelivr
      if (env.backends && env.backends.onnx && env.backends.onnx.wasm) {
        env.backends.onnx.wasm.wasmPaths = {
          mjs: `/api/ort/ort-wasm-simd-threaded.asyncify.mjs?v=${ORT_VERSION}`,
          wasm: `/api/ort/ort-wasm-simd-threaded.asyncify.wasm?v=${ORT_VERSION}`,
        }
      }
      const progress = makeKokoroProgress()
      const adapter = await webgpuAdapterReady()
      const hasF16 = !!(adapter && adapter.features && adapter.features.has('shader-f16'))
      /* 设备降级链：fp16+WebGPU（最快）→ q8+WebGPU（真 GPU 但不支持
         fp16，如部分核显/软件适配器）→ q8+WASM（纯 CPU，较慢）。
         每次失败记日志并继续降级，绝不静默卡死。 */
      const candidates = [
        adapter && hasF16 ? { dtype: 'fp16', device: 'webgpu', label: 'WebGPU / fp16' } : null,
        adapter ? { dtype: 'q8', device: 'webgpu', label: 'WebGPU / q8' } : null,
        { dtype: 'q8', device: 'wasm', label: 'WASM / q8' },
      ].filter(Boolean)
      const tokenizer = await AutoTokenizer.from_pretrained(KOKORO_MODEL, { progress_callback: progress })
      let model = null
      let deviceLabel = ''
      for (const c of candidates) {
        try {
          model = await StyleTextToSpeech2Model.from_pretrained(KOKORO_MODEL, {
            ...c,
            progress_callback: progress,
          })
          deviceLabel = c.label
          break
        } catch (e) {
          console.warn(`[TTS] Kokoro ${c.label} 加载失败，尝试下一档：`, e && e.message)
          model = null
        }
      }
      if (!model) throw new Error('所有设备档位（WebGPU fp16/q8、WASM q8）均加载失败')
      console.info(`[TTS] Kokoro 神经引擎就绪（${deviceLabel}），开始首次合成预热…`)
      emitKokoroEvent({ phase: 'warming', message: '首次合成预热中…', device: deviceLabel })
      /* 首次推理预热：ORT 首次会话编译（尤其 WebGPU 管线）耗时 20~60 秒，
         在加载阶段静默完成，避免用户第一次点播放时长时间无响应。 */
      const eng = { tokenizer, model, Tensor, phonemize, deviceLabel }
      try {
        const voiceData = await fetchVoiceBin('af_heart')
        await synthSentence(eng, 'Hello.', 'af_heart', voiceData, 1)
      } catch (e) {
        console.warn('[TTS] 预热合成失败（不影响后续使用）：', e && e.message)
      }
      console.info(`[TTS] Kokoro 神经引擎预热完成（${deviceLabel}）`)
      emitKokoroEvent({ phase: 'ready', message: 'Kokoro 就绪', device: deviceLabel })
      return eng
    })().catch((e) => {
      kokoroEnginePromise = null // 允许下次重试
      emitKokoroEvent({ phase: 'error', message: (e && e.message) || '加载失败' })
      throw e
    })
  }
  return kokoroEnginePromise
}

/* 合成单句 → WAV Blob（内部直接驱动 ONNX 会话，绕开包装层） */
async function synthSentence(eng, text, voiceName, voiceData, speed) {
  const phonemes = (await eng.phonemize(text, 'en-us')).join(' ')
  if (!phonemes.trim()) throw new Error('音素转换结果为空')
  const { input_ids } = eng.tokenizer(phonemes, { truncation: true })
  const tokenLen = input_ids.dims.at(-1)
  const offset = 256 * Math.min(Math.max(tokenLen - 2, 0), 509)
  const style = new eng.Tensor('float32', voiceData.slice(offset, offset + 256), [1, 256])
  const spd = new eng.Tensor('float32', [speed], [1])
  const out = await eng.model({ input_ids, style, speed: spd })
  const waveform = out && out.waveform
  const pcm = waveform && waveform.data
  if (!pcm || !pcm.length) throw new Error('Kokoro 输出音频为空（waveform 缺失）')
  const flat = pcm.length !== 1 && pcm[0] instanceof Float32Array ? null : pcm
  return encodeWavBlob(flat || pcm, KOKORO_SR)
}

/* 合成结果缓存：同一 (音色, 语速, 文本) 的 WAV 永久存 Cache API。
   学习场景对同一单词/例句反复点播，命中后零合成等待。 */
async function synthCached(eng, text, voiceName, voiceData, speed) {
  const key = `https://kokoro.cache/${voiceName}/${speed}/${encodeURIComponent(text)}`
  let cache = null
  try {
    cache = await caches.open('kokoro-audio')
    const hit = await cache.match(key)
    if (hit) return new Blob([await hit.arrayBuffer()], { type: 'audio/wav' })
  } catch { /* Cache API 不可用时直接合成 */ }
  const blob = await synthSentence(eng, text, voiceName, voiceData, speed)
  try {
    if (cache) await cache.put(key, new Response(blob))
  } catch { /* ignore */ }
  return blob
}

/* Kokoro 整段播放：逐句合成入队，首句合成完立即出声 */
async function playWithKokoro(eng, text, { rate = 0.85, gender, onStart, onEnd }) {
  const myToken = ++playToken
  const voiceName = KOKORO_VOICES[gender] || KOKORO_VOICES.female
  const speed = Math.min(1.4, Math.max(0.6, rate))
  const voiceData = await fetchVoiceBin(voiceName)
  if (myToken !== playToken) return { ok: true, started: false, superseded: true }

  const queue = []
  let producerDone = false
  let producerErr = null
  const sentences = splitSentences(text)
    ; (async () => {
      try {
        for (const sentence of sentences) {
          if (myToken !== playToken) return
          queue.push(await synthCached(eng, sentence, voiceName, voiceData, speed))
        }
      } catch (e) {
        producerErr = e
      }
      producerDone = true
    })()

  let started = false
  for (;;) {
    if (myToken !== playToken) {
      if (currentAudio) { try { currentAudio.pause() } catch { /* ignore */ } }
      if (started) { try { onEnd && onEnd() } catch { /* ignore */ } }
      return { ok: true, started, superseded: true }
    }
    if (!queue.length) {
      if (producerDone) break
      await new Promise((r) => setTimeout(r, 60))
      continue
    }
    const blob = queue.shift()
    if (!started) {
      started = true
      try { onStart && onStart() } catch { /* ignore */ }
    }
    await playAudioBlob(blob, myToken)
  }
  if (producerErr) throw producerErr
  if (started) {
    try { onEnd && onEnd() } catch { /* ignore */ }
    return { ok: true, started: true, superseded: false }
  }
  throw new Error('Kokoro 未生成任何音频')
}

/** 预加载 Kokoro 引擎（可在应用空闲期调用，提前完成首次下载） */
export function preloadKokoro() {
  try {
    return ensureKokoro()
  } catch (e) {
    return Promise.reject(e)
  }
}

/* ---------- 系统语音（兜底） ---------- */

function refreshVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return []
  try {
    const voices = window.speechSynthesis.getVoices()
    if (voices && voices.length && !voicesLoaded) {
      voicesCache = voices
      voicesLoaded = true
      console.info(`[TTS] 语音列表已就绪：${voices.length} 个语音`)
    } else if (voices && voices.length) {
      voicesCache = voices
    }
  } catch (e) {
    console.warn('[TTS] getVoices() 异常：', e && e.message)
  }
  return voicesCache
}

// 部分浏览器语音列表异步加载：主动监听 voiceschanged + 兜底轮询
if (typeof window !== 'undefined' && window.speechSynthesis) {
  refreshVoices()
  window.speechSynthesis.onvoiceschanged = () => refreshVoices()
  setTimeout(refreshVoices, 300)
}

/**
 * 等待语音列表就绪（最多 timeout 毫秒，轮询重试）
 * @returns {Promise<SpeechSynthesisVoice[]>}
 */
export function waitForVoices(timeout = VOICE_WAIT_TIMEOUT) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      resolve([])
      return
    }
    refreshVoices()
    if (voicesCache.length) {
      resolve(voicesCache)
      return
    }
    const deadline = Date.now() + timeout
    const tick = () => {
      refreshVoices()
      if (voicesCache.length || Date.now() >= deadline) {
        if (!voicesCache.length) {
          console.warn(`[TTS] 等待 ${timeout}ms 后语音列表仍为空`)
        }
        resolve(voicesCache)
      } else {
        setTimeout(tick, VOICE_POLL_INTERVAL)
      }
    }
    setTimeout(tick, VOICE_POLL_INTERVAL)
  })
}

export function isTtsSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

/* 系统语音的性别启发式识别（按引擎名称猜测，Windows/macOS 常见语音名） */
const FEMALE_NAME_RE = /female|zira|susan|hazel|samantha|karen|aria|jenny|sonia|eva|anna|kate|victoria|tessa|linda|heather|fiona|moira|tina|serena|allison|ava|nicky|joana|catherine|vicki/i
const MALE_NAME_RE = /(?<![a-z])male|david|mark(?!us)|daniel|alex|fred|tom|george|ryan|guy|james|oliver|arthur|reed|rocko|grandpa|ralph|mohammad|aaron/i

/* 择优选择英语语音（可按性别偏好过滤） */
export function getEnglishVoice(preferGender) {
  refreshVoices()
  if (!voicesCache.length) {
    console.warn('[TTS] 语音列表为空（浏览器语音引擎可能尚未加载完成）')
    return null
  }
  const gender = preferGender || loadVoiceGender()
  const lower = (v) => (v.lang || '').toLowerCase()
  const isEn = (v) => lower(v).startsWith('en')
  const enVoices = voicesCache.filter((v) => isEn(v) || /^en/i.test(v.name))
  const pool = enVoices.length ? enVoices : voicesCache

  // 按性别偏好优先筛选（按名称启发式猜测，猜不出则退回全部候选）
  let candidates = pool
  if (gender === 'female') {
    const matched = pool.filter((v) => FEMALE_NAME_RE.test(v.name))
    if (matched.length) candidates = matched
  } else if (gender === 'male') {
    const matched = pool.filter((v) => !FEMALE_NAME_RE.test(v.name) && MALE_NAME_RE.test(v.name))
    if (matched.length) candidates = matched
  }

  const isEnOf = (v) => isEn(v) || /^en/i.test(v.name)
  const preferred = candidates.find((v) => lower(v) === 'en-us' || lower(v) === 'en_us')
    || candidates.find((v) => lower(v) === 'en-gb' || lower(v) === 'en_gb')
    || candidates.find(isEnOf)
    || candidates.find((v) => /^en/i.test(v.name))
  return preferred || null
}

/* ---------- 播放管理：token 化，支持打断/切换 ---------- */

let playToken = 0      // 每次 speak() 递增；旧 token 的播放即失效
let currentAudio = null

function playAudioBlob(blob, myToken) {
  return new Promise((resolve) => {
    let done = false
    const finish = () => {
      if (done) return
      done = true
      if (currentAudio) currentAudio = null
      resolve()
    }
    const audio = new Audio(URL.createObjectURL(blob))
    currentAudio = audio
    // 被新 speak/stopSpeak 打断时（pause 且 token 失效）立即结束
    audio.addEventListener('pause', () => {
      if (myToken !== playToken) finish()
    })
    audio.onended = finish
    audio.onerror = finish
    audio.play().catch(finish)
  })
}

/* ---------- 系统引擎播放（兜底） ---------- */

function speakWithSystem(text, voice, { rate = 0.85, pitch = 1, onStart, onEnd }) {
  return new Promise((resolve) => {
    const utter = new SpeechSynthesisUtterance(text)
    utter.voice = voice
    utter.lang = voice.lang
    utter.rate = rate
    utter.pitch = pitch
    let done = false
    let started = false   // 是否真正开始发声（onstart 触发过）
    const finish = (ok) => { if (!done) { done = true; resolve(ok) } }

    utter.onstart = () => {
      started = true
      console.info(`[TTS] 播放开始：${text.slice(0, 30)}`)
      try { onStart && onStart() } catch { /* ignore */ }
    }
    utter.onend = () => {
      console.info('[TTS] 播放结束')
      try { onEnd && onEnd() } catch { /* ignore */ }
      finish(true)
    }
    utter.onerror = (e) => {
      const err = e && (e.error || (e instanceof Error ? e.message : ''))
      if (err === 'canceled' || err === 'interrupted' || err === 'cancel' || err === 'interrupt') {
        if (started) {
          // 已开始后被打断：视为用户主动停止/切换，正常结束
          console.info('[TTS] 播放被用户停止（' + err + '）')
          try { onEnd && onEnd() } catch { /* ignore */ }
          finish(true)
        } else {
          // 从未开始就被打断（如 Google 网络语音在国内不可达）：
          // 这是「播放失败」，必须返回 false 触发兜底引擎
          console.warn('[TTS] 系统语音未开始即被打断（' + err + '），判定为播放失败：' + voice.name)
          finish(false)
        }
      } else {
        console.warn('[TTS] 系统引擎播放失败：', err)
        try { onEnd && onEnd() } catch { /* ignore */ }
        finish(false)
      }
    }

    // Chrome 已知缺陷 workaround：先 cancel 清空队列，再 resume 唤醒
    try { window.speechSynthesis.cancel() } catch { /* ignore */ }
    try { window.speechSynthesis.resume() } catch { /* ignore */ }
    // 看门狗：网络语音不可达时可能长时间无 onstart/onerror，超时判定失败以触发兜底
    const watchdog = setTimeout(() => {
      if (!started) {
        console.warn('[TTS] 系统语音超时未开始（网络语音可能不可达），判定为播放失败')
        finish(false)
      }
    }, 4000)
    const _finish = (ok) => { clearTimeout(watchdog); finish(ok) }
    // 延迟 100~200ms 再 speak，避免 utterance 入队后不出声
    setTimeout(() => {
      try {
        window.speechSynthesis.speak(utter)
        console.info(`[TTS] 已调用 speak()：${text.slice(0, 30)} -> ${voice.name} (${voice.lang})`)
      } catch (e) {
        console.warn('[TTS] speak() 抛异常：', e && e.message)
        _finish(false)
      }
    }, SPEAK_DELAY_MS)
  })
}

/* ---------- 对外主入口 ---------- */

/**
 * 播放文本（自动降级：Kokoro → 系统 → 失败）
 * @param {string} text 要朗读的文本
 * @param {object} opts { rate, pitch, onStart, onEnd, onError }
 * @returns {Promise<{engine: 'kokoro'|'system'|'none', started: boolean, voiceName: string|null, reason?: string}>}
 */
export async function speak(text, opts = {}) {
  const t = String(text == null ? '' : text).trim()
  const { rate = 0.85, pitch = 1, gender, onStart, onEnd, onError } = opts
  const genderPref = gender === 'female' || gender === 'male' ? gender : loadVoiceGender()

  if (!t) {
    console.warn('[TTS] 播放失败：文本为空')
    return { engine: 'none', started: false, voiceName: null, reason: 'empty' }
  }

  // 1) Kokoro 神经合成（主引擎）：首次调用触发模型下载（进度见 tts-kokoro 事件）
  //    用户选择过"跳过真人发音"且模型尚未缓存时不尝试，避免点击播放
  //    意外触发 88MB 下载（缓存命中则标记自动失效）
  let kokoroAvailable = true
  if (isModelSkipped() && typeof caches !== 'undefined') {
    try {
      const cached = await isKokoroModelCached()
      if (!cached) kokoroAvailable = false
    } catch { /* 缓存 API 异常时按未跳过处理 */ }
  }
  if (kokoroAvailable) {
    try {
      playToken += 1 // 使上一轮播放失效
      const eng = await ensureKokoro()
      const res = await playWithKokoro(eng, t, { rate, gender: genderPref, onStart, onEnd })
      const vName = KOKORO_VOICE_LABELS[KOKORO_VOICES[genderPref]] || KOKORO_VOICES[genderPref]
      if (res.ok && !res.superseded) {
        console.info(`[TTS] 引擎选择=kokoro，音色=${KOKORO_VOICES[genderPref]}，结果=成功`)
        return { engine: 'kokoro', started: res.started, voiceName: `Kokoro ${vName}` }
      }
      // superseded：被新的 speak/stop 打断，视为正常结束
      return { engine: 'kokoro', started: res.started, voiceName: null, reason: 'superseded' }
    } catch (e) {
      console.warn('[TTS] Kokoro 合成不可用，尝试系统语音兜底：', e && e.message)
    }
  } else {
    console.info('[TTS] 用户已跳过真人发音且模型未缓存，直接使用系统语音')
  }

  // 2) 系统引擎兜底：等待语音列表就绪（最多 3 秒）并尝试英语语音
  if (isTtsSupported()) {
    await waitForVoices(VOICE_WAIT_TIMEOUT)
    const voice = getEnglishVoice(genderPref)
    if (voice) {
      const started = await speakWithSystem(t, voice, { rate, pitch, onStart, onEnd })
      if (started) {
        console.info(`[TTS] 引擎选择=system，语音=${voice.name} (${voice.lang})，结果=成功`)
        return { engine: 'system', started: true, voiceName: voice.name }
      }
      console.warn('[TTS] 系统引擎播放失败')
    } else {
      console.warn('[TTS] 无系统英语语音')
    }
  } else {
    console.warn('[TTS] speechSynthesis 不可用')
  }

  // 3) 彻底失败
  console.error('[TTS] 播放失败：Kokoro 与系统引擎均不可用')
  try { onError && onError(new Error('TTS unavailable: kokoro engine failed and no usable system voice')) } catch { /* ignore */ }
  return { engine: 'none', started: false, voiceName: null, reason: 'no_engine' }
}

/* 停止播放（使当前 token 失效 + 暂停音频 + 取消系统合成） */
export function stopSpeak() {
  playToken += 1
  if (currentAudio) {
    try { currentAudio.pause() } catch { /* ignore */ }
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try { window.speechSynthesis.cancel() } catch { /* ignore */ }
  }
}

/* ---------- 空闲预热：仅当模型已缓存时才后台预热 ----------
   未缓存时不再自动下载（88MB 需用户在首次准备页或设置页确认后
   主动触发 preloadKokoro()），避免移动端偷跑流量。 */
if (typeof window !== 'undefined') {
  setTimeout(() => {
    isKokoroModelCached()
      .then((cached) => {
        if (!cached) return
        return preloadKokoro().catch((e) => {
          console.info('[TTS] Kokoro 预热未完成（将在首次播放时重试）：', e && e.message)
        })
      })
      .catch(() => { /* ignore */ })
  }, 8000)
}
