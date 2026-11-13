/* ============================================================
   services/tts.js —— 发音引擎封装（离线优先版）
   播放优先级：meSpeak 离线合成（程序自含，不依赖系统语音/网络）
              → 系统 Web Speech API（speechSynthesis）兜底 → 失败
   - 离线优先原因：
     1) 国内环境 Chrome 的 Google 网络语音（如 Google US English）不可达，
        合成静默失败并以 interrupted 错误收场——既无声也不报错；
     2) Windows 本地语音多为中文（zh-CN），读英语效果差；
     3) meSpeak 离线合成行为完全确定，配合 Web Audio 解锁即可稳定出声。
   - Chrome 系统引擎缺陷 workaround：speak 前 cancel() 清空队列 + resume()，
     并延迟 150ms 再 speak；utterance 未真正 onstart 就报 interrupted 时
     视为「播放失败」而非用户停止，以便触发兜底。
   - speak() 返回 Promise<{ engine, started, voiceName, reason }>
     engine 取值：offline | system | none
   ============================================================ */

let voicesCache = []
let voicesLoaded = false
let userStopped = false
let offlineEnginePromise = null

const VOICE_WAIT_TIMEOUT = 3000   // 语音列表等待上限（毫秒）
const SPEAK_DELAY_MS = 150        // Chrome 缺陷 workaround 延迟（毫秒）
const VOICE_POLL_INTERVAL = 100   // 语音列表轮询间隔（毫秒）

/* ---------- 语音加载可靠性 ---------- */

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
  window.speechSynthesis.onvoiceschanged = () => {
    console.info('[TTS] 触发 voiceschanged，重新拉取语音列表')
    refreshVoices()
  }
  // 兜底轮询一次
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

/* 择优选择英语语音 */
export function getEnglishVoice() {
  refreshVoices()
  if (!voicesCache.length) {
    console.warn('[TTS] 语音列表为空（浏览器语音引擎可能尚未加载完成）')
    return null
  }
  const lower = (v) => (v.lang || '').toLowerCase()
  const isEn = (v) => lower(v).startsWith('en')
  const preferred = voicesCache.find((v) => lower(v) === 'en-us' || lower(v) === 'en_us')
    || voicesCache.find((v) => lower(v) === 'en-gb' || lower(v) === 'en_gb')
    || voicesCache.find((v) => isEn(v))
    || voicesCache.find((v) => /^en/i.test(v.name))
  if (preferred) {
    console.info(`[TTS] 英语语音选择：${preferred.name} (${preferred.lang})`)
  } else {
    console.warn('[TTS] 未找到英语语音，可用语音：', voicesCache.map((v) => `${v.name}(${v.lang})`).join(', '))
  }
  return preferred || null
}

/* ---------- Web Audio 自动播放策略解锁 ----------
 * 浏览器自动播放策略：AudioContext 若不在用户手势的同步链路内创建/恢复，
 * 会处于 suspended 状态且不报错（source.start() 静默无声）。
 * meSpeak 在异步合成完成后才 new AudioContext()，此时手势激活已失效 → 没有声音。
 * 解法：
 *  1) speak() 入口（点击手势内同步执行）立即创建并 resume 一个「主上下文」
 *  2) 包装 window.AudioContext，让后续所有构造（包括 meSpeak 的）复用主上下文
 */
let primeAudioCtx = null
let audioCtxPatched = false

function ensurePrimeAudio() {
  if (typeof window === 'undefined') return
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return
  try {
    if (!primeAudioCtx) primeAudioCtx = new AC()
  } catch {
    return
  }
  if (primeAudioCtx && primeAudioCtx.state === 'suspended') {
    primeAudioCtx.resume().catch(() => {})
  }
  if (!audioCtxPatched) {
    audioCtxPatched = true
    const RealAC = AC
    const SharedContext = class extends RealAC {
      constructor(...args) {
        if (primeAudioCtx) return primeAudioCtx
        super(...args)
        primeAudioCtx = this
        if (this.state === 'suspended') this.resume().catch(() => {})
        return this
      }
    }
    try {
      window.AudioContext = SharedContext
      if (window.webkitAudioContext) window.webkitAudioContext = SharedContext
    } catch {
      /* 某些环境下属性只读，无法包装，忽略 */
    }
  }
}

/* ---------- meSpeak 离线引擎（惰性加载） ---------- */

async function loadOfflineEngine() {
  if (!offlineEnginePromise) {
    offlineEnginePromise = (async () => {
      try {
        const [{ default: meSpeak }, { default: config }, { default: enUs }] = await Promise.all([
          import('mespeak'),
          import('mespeak/src/mespeak_config.json'),
          import('mespeak/voices/en/en-us.json'),
        ])
        meSpeak.loadConfig(config)
        meSpeak.loadVoice(enUs)
        console.info('[TTS] meSpeak 离线引擎就绪（语音 en/en-us）')
        return meSpeak
      } catch (e) {
        console.warn('[TTS] meSpeak 离线引擎加载失败：', e && e.message)
        offlineEnginePromise = null // 允许下次重试
        return null
      }
    })()
  }
  return offlineEnginePromise
}

async function speakWithOffline(text, { rate = 0.85, onStart, onEnd }) {
  const ms = await loadOfflineEngine()
  if (!ms) return false
  try {
    const wav = ms.speak(text, {
      rawdata: 'data-url',
      voice: 'en/en-us',
      amplitude: 80,
      pitch: 45,
      speed: Math.round(175 - rate * 40),
      wordgap: 2
    })
    if (!wav) {
      console.warn('[TTS] meSpeak 未生成音频流')
      return false
    }
    // 播放前再次确保主上下文处于运行态
    if (primeAudioCtx && primeAudioCtx.state === 'suspended') {
      primeAudioCtx.resume().catch(() => {})
    }
    const ok = await new Promise((resolve) => {
      let started = false
      try {
        ms.play(wav, 1.0, (success) => {
          if (started) {
            try { onEnd && onEnd() } catch { /* ignore */ }
          }
          resolve(!!success || userStopped)
        })
        started = true
        try { onStart && onStart() } catch { /* ignore */ }
      } catch (e) {
        console.warn('[TTS] meSpeak.play() 异常：', e && e.message)
        resolve(false)
      }
    })
    return ok
  } catch (e) {
    console.warn('[TTS] meSpeak 离线播放失败：', e && e.message)
    return false
  }
}

/* ---------- 系统引擎播放 ---------- */

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
      _finish(true)
    }
    utter.onerror = (e) => {
      const err = e && (e.error || (e instanceof Error ? e.message : ''))
      if (err === 'canceled' || err === 'interrupted' || err === 'cancel' || err === 'interrupt') {
        if (started) {
          // 已开始后被打断：视为用户主动停止/切换，正常结束
          console.info('[TTS] 播放被用户停止（' + err + '）')
          try { onEnd && onEnd() } catch { /* ignore */ }
          _finish(true)
        } else {
          // 从未开始就被打断（如 Google 网络语音在国内不可达）：
          // 这是「播放失败」，必须返回 false 触发兜底引擎
          console.warn('[TTS] 系统语音未开始即被打断（' + err + '），判定为播放失败：' + voice.name)
          _finish(false)
        }
      } else {
        console.warn('[TTS] 系统引擎播放失败：', err)
        try { onEnd && onEnd() } catch { /* ignore */ }
        _finish(false)
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
 * 播放文本（自动降级）
 * @param {string} text 要朗读的文本
 * @param {object} opts { rate, pitch, onStart, onEnd, onError }
 * @returns {Promise<{engine: 'system'|'offline'|'none', started: boolean, voiceName: string|null, reason?: string}>}
 */
export async function speak(text, opts = {}) {
  const t = String(text == null ? '' : text).trim()
  const { rate = 0.85, pitch = 1, onStart, onEnd, onError } = opts
  userStopped = false

  // 在用户手势内同步解锁 Web Audio（修复 meSpeak 离线合成无声问题）
  ensurePrimeAudio()

  if (!t) {
    console.warn('[TTS] 播放失败：文本为空')
    return { engine: 'none', started: false, voiceName: null, reason: 'empty' }
  }

  // 1) meSpeak 离线合成（主引擎）：程序自含发音，不依赖系统语音与网络
  const offlineOk = await speakWithOffline(t, { rate, pitch, onStart, onEnd })
  if (offlineOk) {
    console.info('[TTS] 引擎选择=offline，语音=en/en-us（meSpeak），结果=成功')
    return { engine: 'offline', started: true, voiceName: 'meSpeak en/en-us' }
  }
  console.warn('[TTS] meSpeak 离线合成不可用，尝试系统语音兜底')

  // 2) 系统引擎兜底：等待语音列表就绪（最多 3 秒）并尝试英语语音
  if (isTtsSupported()) {
    await waitForVoices(VOICE_WAIT_TIMEOUT)
    const voice = getEnglishVoice()
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
  console.error('[TTS] 播放失败：离线引擎与系统引擎均不可用')
  try { onError && onError(new Error('TTS unavailable: offline engine failed and no usable system voice')) } catch { /* ignore */ }
  return { engine: 'none', started: false, voiceName: null, reason: 'no_engine' }
}

/* 停止播放（系统 + 离线） */
export function stopSpeak() {
  userStopped = true
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try { window.speechSynthesis.cancel() } catch { /* ignore */ }
  }
  if (offlineEnginePromise) {
    offlineEnginePromise.then((ms) => {
      if (ms && ms.stop) {
        try { ms.stop() } catch { /* ignore */ }
      }
    })
  }
}
