/* 诊断线上发音引擎：抓取控制台日志、引擎设备、预热/合成耗时 */
const puppeteer = require('puppeteer-core')

const BASE = 'https://qicheng.worldorigin.dpdns.org/'

async function main() {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    protocolTimeout: 600000,
    args: [
      '--no-sandbox',
      '--autoplay-policy=no-user-gesture-required',
      '--enable-unsafe-webgpu',
      '--mute-audio',
    ],
  })
  const page = await browser.newPage()
  page.on('console', (m) => {
    const t = m.text()
    if (/TTS|kokoro|Kokoro|WebGPU|wasm|error|Error|CSP|Refused/i.test(t)) {
      console.log('[页面]', t.slice(0, 300))
    }
  })
  page.on('pageerror', (e) => console.log('[异常]', e.message.slice(0, 300)))
  page.on('requestfailed', (r) => {
    const u = r.url()
    if (/api\/hf|jsdelivr|kokoro/i.test(u)) console.log('[请求失败]', u.slice(0, 120), r.failure() && r.failure().errorText)
  })
  await page.setViewport({ width: 1100, height: 800 })

  console.log('=== 打开线上站点 ===')
  await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 60000 })

  // 监听引擎事件
  await page.evaluate(() => {
    window.__kokoroEvents = []
    window.addEventListener('tts-kokoro', (e) => {
      const d = e.detail || {}
      window.__kokoroEvents.push({ phase: d.phase, message: d.message, device: d.device, t: Date.now() })
    })
  })

  console.log('=== 等待引擎就绪（模型已缓存则很快） ===')
  const state = await page.evaluate(async () => {
    const t0 = Date.now()
    for (;;) {
      const evts = window.__kokoroEvents
      const ready = evts.find((e) => e.phase === 'ready')
      const err = evts.find((e) => e.phase === 'error')
      if (ready || err || Date.now() - t0 > 300000) {
        return { events: evts, waited: Math.round((Date.now() - t0) / 1000) }
      }
      await new Promise((r) => setTimeout(r, 1000))
    }
  })
  console.log(`等待 ${state.waited}s，事件流:`, JSON.stringify(state.events))

  console.log('=== WebGPU 支持探测 ===')
  const gpu = await page.evaluate(async () => {
    if (!navigator.gpu) return { hasApi: false }
    try {
      const adapter = await navigator.gpu.requestAdapter()
      if (!adapter) return { hasApi: true, adapter: false }
      return { hasApi: true, adapter: true, features: [...adapter.features].slice(0, 6), isFallback: adapter.isFallbackAdapter }
    } catch (e) {
      return { hasApi: true, adapterError: e.message }
    }
  })
  console.log('WebGPU:', JSON.stringify(gpu))

  console.log('=== 实测两次 speak 耗时 ===')
  const r1 = await page.evaluate(async () => {
    const tts = await import('/src/services/tts.js')
    const t0 = Date.now()
    const r = await tts.speak('Hello world.')
    return { ms: Date.now() - t0, ...r }
  }).catch((e) => ({ error: e.message }))
  console.log('第 1 次 speak:', JSON.stringify(r1))
  const r2 = await page.evaluate(async () => {
    const tts = await import('/src/services/tts.js')
    const t0 = Date.now()
    const r = await tts.speak('Hello world.')
    return { ms: Date.now() - t0, ...r }
  }).catch((e) => ({ error: e.message }))
  console.log('第 2 次 speak(同文本应命中缓存):', JSON.stringify(r2))
  const r3 = await page.evaluate(async () => {
    const tts = await import('/src/services/tts.js')
    const t0 = Date.now()
    const r = await tts.speak('The weather is nice today.')
    return { ms: Date.now() - t0, ...r }
  }).catch((e) => ({ error: e.message }))
  console.log('第 3 次 speak(新文本):', JSON.stringify(r3))

  await browser.close()
}

main().catch((e) => { console.error('诊断脚本失败:', e.message); process.exit(1) })
