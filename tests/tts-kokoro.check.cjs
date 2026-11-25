/* 主站 TTS（Kokoro 主引擎）无头验证：
   启动 speak() 后轮询结果（避免一次性 evaluate 长等待超时）。
   无头 Chrome 每次全新 profile，会重新走一遍 88MB 模型下载（hf-mirror）。 */
const puppeteer = require('puppeteer-core')

const BASE = 'http://localhost:5173'

async function main() {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    protocolTimeout: 600000,
    args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--enable-unsafe-webgpu', '--mute-audio'],
  })
  const page = await browser.newPage()
  const logs = []
  page.on('console', (m) => logs.push(m.text()))
  await page.setViewport({ width: 1100, height: 800 })
  await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 30000 })

  // 页面内启动测试（不等待），结果写入 window.__ttsTest
  await page.evaluate(() => {
    window.__ttsTest = { done: false, events: [] }
    window.addEventListener('tts-kokoro', (e) => window.__ttsTest.events.push(e.detail))
    ;(async () => {
      try {
        const tts = await import('/src/services/tts.js')
        const r = await tts.speak('The Northern Lights are a natural phenomenon.')
        window.__ttsTest = {
          ...window.__ttsTest,
          done: true,
          engine: r.engine,
          started: r.started,
          voiceName: r.voiceName,
          reason: r.reason || '',
        }
      } catch (e) {
        window.__ttsTest = { ...window.__ttsTest, done: true, error: e && e.message }
      }
    })()
  })

  const t0 = Date.now()
  let lastLog = 0
  let result = null
  for (;;) {
    await new Promise((r) => setTimeout(r, 4000))
    result = await page.evaluate(() => {
      const t = window.__ttsTest
      const progress = t.events.filter((x) => x.phase === 'progress').pop()
      return {
        done: t.done,
        engine: t.engine,
        started: t.started,
        voiceName: t.voiceName,
        reason: t.reason || '',
        error: t.error || '',
        progress: progress ? `${(progress.loaded / 1048576).toFixed(1)}/${(progress.total / 1048576).toFixed(1)}MB` : '',
        ready: t.events.some((x) => x.phase === 'ready'),
        eventCount: t.events.length,
      }
    })
    const elapsed = Math.round((Date.now() - t0) / 1000)
    if (elapsed - lastLog >= 15) {
      lastLog = elapsed
      console.log(`  [${elapsed}s] ${result.progress || ''} ready=${result.ready} done=${result.done}`)
    }
    if (result.done) break
    if (elapsed > 720) break // 12 分钟上限
  }

  console.log('结果:', JSON.stringify(result))
  const engineLog = logs.find((l) => l.includes('引擎选择=kokoro'))
  console.log('引擎日志:', engineLog || '(未找到)')
  const ok = result.done && result.engine === 'kokoro' && result.started
  console.log(ok ? 'PASS  Kokoro 主引擎在主站正常工作' : 'FAIL  主站 TTS 验证失败')
  await browser.close()
  process.exit(ok ? 0 : 1)
}

main().catch((e) => { console.error('验证脚本异常：', e); process.exit(1) })
