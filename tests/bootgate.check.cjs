/* BootGate 首次资源准备引导自动化验证
   覆盖：①首访弹出询问层 ②跳过→仅载词库→进入 ③跳过后 speak 走系统语音
        ④确认下载→进入 downloading 阶段并出现进度 ⑤二次访问不再询问 */
const puppeteer = require('puppeteer-core')
const fs = require('fs')
const os = require('os')
const path = require('path')

const BASE = 'http://localhost:5173/'
/* Windows 下 vite dev 对源码引用转为 /@fs/ 绝对路径，动态 import 必须用
   同一 URL 才能拿到与应用相同的模块实例（否则是两个独立的词库缓存） */
const WORD_MODULE = '/@fs/E:/zProject/project/Marvis/e-learning-english/src/services/wordData.js'
const TTS_MODULE = '/@fs/E:/zProject/project/Marvis/e-learning-english/src/services/tts.js'
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const results = []
function record(name, ok, detail) {
  results.push({ name, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`)
}

async function newPage(browser, userDataDir) {
  const context = await browser.createBrowserContext()
  const page = await context.newPage()
  await page.setViewport({ width: 420, height: 800 })
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 })
  return { context, page }
}

async function waitForPhase(page, phases, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs
  for (;;) {
    const phase = await page.evaluate(() => {
      const el = document.querySelector('.boot-gate')
      if (!el) return 'hidden'
      if (el.querySelector('.gate-ask')) return 'ask'
      if (el.querySelector('.gate-loading')) return 'loading'
      if (el.querySelector('[class*="downloading"]') || [...el.querySelectorAll('div')].some((d) => d.textContent.includes('资源准备中'))) return 'downloading'
      return 'unknown'
    })
    if (phases.includes(phase)) return phase
    if (Date.now() > deadline) throw new Error(`等待阶段 [${phases}] 超时，当前: ${phase}`)
    await new Promise((r) => setTimeout(r, 200))
  }
}

;(async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bootgate-'))
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    protocolTimeout: 300000,
    args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--mute-audio'],
    userDataDir: tmpDir,
  })

  try {
    /* ① 首次访问：应出现询问层（checking 阶段很快过去，直接等 ask） */
    const { context, page } = await newPage(browser)
    const phase1 = await waitForPhase(page, ['ask'], 40000)
    record('首访出现 BootGate 询问层', phase1 === 'ask', `phase=${phase1}`)
    if (phase1 === 'ask') {
      const listText = await page.evaluate(() => document.querySelector('.gate-ask').textContent)
      record('资源清单含词库与发音引擎', listText.includes('学习词库') && listText.includes('真人发音引擎'))
    }

    /* ② 跳过真人发音 → 词库加载完成后进入 */
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('.gate-ask button')].find((b) => b.textContent.includes('跳过'))
      if (btn) btn.click()
    })
    await waitForPhase(page, ['hidden'], 60000)
    const appVisible = await page.evaluate(() => !!document.querySelector('.app-shell') && !document.querySelector('.boot-gate'))
    record('跳过后引导消失、应用可见', appVisible)
    const skipFlag = await page.evaluate(() => localStorage.getItem('qc-boot-model-skip'))
    record('跳过标记已持久化', skipFlag === '1', `值=${skipFlag}`)
    const wordState = await page.evaluate(async (wordUrl) => {
      const m = await import(wordUrl)
      return { ready: m.isWordDataReady(), progress: m.getWordDataProgress() }
    }, WORD_MODULE)
    record('词库已加载就绪', wordState.ready === true, JSON.stringify(wordState.progress))

    /* ③ 跳过后 speak() 应直接走系统语音且不触发模型下载 */
    const speakRes = await page.evaluate(async (ttsUrl) => {
      const tts = await import(ttsUrl)
      const before = performance.now()
      const r = await tts.speak('Hello world.')
      return { engine: r.engine, elapsed: Math.round(performance.now() - before) }
    }, TTS_MODULE)
    record('跳过后 speak 走系统语音', speakRes.engine === 'system', `engine=${speakRes.engine} 耗时=${speakRes.elapsed}ms`)
    const modelNotDownloaded = await page.evaluate(async (ttsUrl) => {
      const tts = await import(ttsUrl)
      return !(await tts.isKokoroModelCached())
    }, TTS_MODULE)
    record('跳过路径未偷跑模型下载', modelNotDownloaded === true)

    /* ④ 二次访问：不再询问（跳过标记生效） */
    const page2 = await context.newPage()
    await page2.setViewport({ width: 420, height: 800 })
    await page2.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 })
    const phase2 = await waitForPhase(page2, ['loading', 'hidden'], 40000)
    record('二次访问不再弹出询问', phase2 !== 'ask', `phase=${phase2}`)
    await context.close()

    /* ⑤ 确认下载路径：新 context 首访点击"开始下载并进入"→进入 downloading 且有进度事件 */
    const ctx2 = await browser.createBrowserContext()
    const page3 = await ctx2.newPage()
    await page3.setViewport({ width: 420, height: 800 })
    await page3.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 })
    const phase3 = await waitForPhase(page3, ['ask'], 40000)
    record('新环境首访再次出现询问层', phase3 === 'ask')
    let progressSeen = false
    page3.on('window', () => {})
    await page3.evaluate(() => {
      window.__kokoroEvents = []
      window.addEventListener('tts-kokoro', (e) => window.__kokoroEvents.push(e.detail.phase))
    })
    await page3.evaluate(() => {
      const btn = [...document.querySelectorAll('.gate-ask button')].find((b) => b.textContent.includes('开始下载'))
      if (btn) btn.click()
    })
    // 轮询观察 downloading 状态与进度事件（不等待 88MB 全部下载完）
    const deadline = Date.now() + 90000
    let sawDownloading = false
    while (Date.now() < deadline) {
      const st = await page3.evaluate(() => ({
        downloading: !!document.querySelector('.boot-gate') && document.querySelector('.boot-gate').textContent.includes('资源准备中'),
        events: (window.__kokoroEvents || []).filter((x) => x === 'progress').length,
      })).catch(() => null)
      if (st && st.downloading) sawDownloading = true
      if (st && st.events > 0) progressSeen = true
      if (sawDownloading && progressSeen) break
      await new Promise((r) => setTimeout(r, 500))
    }
    record('确认下载进入 downloading 阶段', sawDownloading)
    record('下载进度事件正常派发', progressSeen)
    await ctx2.close()
  } finally {
    await browser.close()
  }

  const failed = results.filter((r) => !r.ok)
  console.log(`\n结果: ${results.length - failed.length} 通过, ${failed.length} 失败`)
  process.exit(failed.length ? 1 : 0)
})().catch((e) => {
  console.error('测试执行异常:', e.message)
  process.exit(1)
})
