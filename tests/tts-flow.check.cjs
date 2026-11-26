/* 本地全流程验证：新用户下载 → 预热 → 三次播放计时 + 设备报告 */
const puppeteer = require('puppeteer-core')

const BASE = 'http://localhost:5173/'

async function main() {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    protocolTimeout: 600000,
    args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--enable-unsafe-webgpu', '--mute-audio'],
  })
  const page = await browser.newPage()
  page.on('console', (m) => {
    const t = m.text()
    if (/TTS|kokoro|WebGPU|wasm|CSP|Refused/i.test(t)) console.log('[页面]', t.slice(0, 260))
  })
  page.on('pageerror', (e) => console.log('[异常]', e.message.slice(0, 260)))
  page.on('requestfailed', (r) => {
    if (/api\/ort|api\/hf/i.test(r.url())) console.log('[请求失败]', r.url().slice(0, 100), r.failure() && r.failure().errorText)
  })
  await page.setViewport({ width: 1100, height: 800 })
  await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 60000 })

  // 记录引擎事件
  await page.evaluate(() => {
    window.__evts = []
    window.addEventListener('tts-kokoro', (e) => {
      const d = e.detail || {}
      window.__evts.push({ phase: d.phase, message: d.message, device: d.device, t: Date.now() })
    })
  })

  console.log('=== ① 点击"开始下载并进入" ===')
  const hasAsk = await page.evaluate(() => !!document.querySelector('.gate-ask'))
  console.log('BootGate 询问层出现:', hasAsk)
  if (hasAsk) {
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('.gate-ask button')].find((b) => b.textContent.includes('开始下载'))
      btn && btn.click()
    })
  }

  console.log('=== ② 等待下载+预热完成 ===')
  const done = await page.evaluate(async () => {
    const t0 = Date.now()
    for (;;) {
      const evts = window.__evts
      const ready = evts.find((e) => e.phase === 'ready')
      const err = evts.find((e) => e.phase === 'error')
      const gateGone = !document.querySelector('.boot-gate')
      if ((ready && gateGone) || err || Date.now() - t0 > 420000) {
        return { evts, totalSec: Math.round((Date.now() - t0) / 1000), err: err && err.message }
      }
      await new Promise((r) => setTimeout(r, 1000))
    }
  })
  console.log(`总耗时 ${done.totalSec}s，关键事件:`)
  const t0 = done.evts.length ? done.evts[0].t : 0
  let firstProgress = null
  let lastProgress = null
  for (const e of done.evts) {
    if (e.phase === 'progress') {
      if (!firstProgress) firstProgress = e.t
      lastProgress = e.t
      continue
    }
    console.log(`  +${Math.round((e.t - t0) / 1000)}s  ${e.phase} ${e.message || ''} ${e.device || ''}`)
  }
  if (firstProgress && lastProgress) {
    console.log(`  模型下载阶段: +${Math.round((firstProgress - t0) / 1000)}s ~ +${Math.round((lastProgress - t0) / 1000)}s`)
  }
  if (done.err) console.log('错误:', done.err)

  console.log('=== ③ 三次 speak 计时 ===')
  const tests = [
    ['Hello world. How are you today?', '新文本A'],
    ['Hello world. How are you today?', '同文本A(应命中音频缓存)'],
    ['She sells seashells by the seashore.', '新文本B'],
  ]
  for (const [text, label] of tests) {
    const r = await page.evaluate(async (text) => {
      const tts = await import('/src/services/tts.js')
      const t0 = Date.now()
      const r = await tts.speak(text, { rate: 0.85 })
      return { ms: Date.now() - t0, engine: r.engine, voice: r.voiceName, reason: r.reason }
    }, text).catch((e) => ({ error: e.message.slice(0, 200) }))
    console.log(`${label}: ${JSON.stringify(r)}`)
  }

  console.log('=== ④ /api/ort 请求记录 ===')
  const ortReqs = await page.evaluate(async () => {
    const perf = performance.getEntriesByType('resource').filter((e) => e.name.includes('/api/ort'))
    return perf.map((e) => `${e.name.split('/').pop()} ${(e.transferSize / 1048576).toFixed(1)}MB ${Math.round(e.duration / 1000)}s`)
  })
  console.log(ortReqs.length ? ortReqs.join('\n') : '(无 /api/ort 请求记录)')

  await browser.close()
}

main().catch((e) => { console.error('验证脚本失败:', e.message); process.exit(1) })
