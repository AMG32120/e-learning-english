/* 音频内容校验：拦截 createObjectURL 捕获 TTS 输出的 WAV，
   解析 PCM 采样断言非零（防止“合成成功但静音”的隐性缺陷） */
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
  page.on('console', (m) => console.log('  [页面]', m.text().slice(0, 140)))
  await page.setViewport({ width: 1100, height: 800 })
  await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 30000 })
  await new Promise((r) => setTimeout(r, 3000))

  const evalStable = async (fn) => {
    for (let i = 0; i < 5; i++) {
      try {
        return await page.evaluate(fn)
      } catch (e) {
        if (!/context was destroyed|navigation/i.test(e.message)) throw e
        await new Promise((r) => setTimeout(r, 2500))
      }
    }
    throw new Error('页面反复重载')
  }

  // 安装 WAV 捕获器
  await evalStable(() => {
    window.__wav = []
    const orig = URL.createObjectURL.bind(URL)
    URL.createObjectURL = (blob) => {
      if (blob && blob.type === 'audio/wav') {
        blob.arrayBuffer().then((ab) => window.__wav.push(new Uint8Array(ab))).catch(() => {})
      }
      return orig(blob)
    }
    return true
  })

  const result = await evalStable(async () => {
    const tts = await import('/src/services/tts.js')
    return await tts.speak('The Northern Lights are a natural phenomenon.')
  })
  console.log('speak →', JSON.stringify(result))

  // 等 WAV 捕获落袋 + 播放结束
  await new Promise((r) => setTimeout(r, 4000))
  const wavs = await evalStable(() => window.__wav.map((b) => b.length))
  console.log('捕获 WAV:', wavs, '字节')

  if (!wavs.length) {
    console.log('FAIL  未捕获到任何 WAV 输出')
    await browser.close()
    process.exit(1)
  }

  // 解析最后一个 WAV：44 字节头 + 16bit PCM
  const analysis = await evalStable(() => {
    const u8 = window.__wav[window.__wav.length - 1]
    const dv = new DataView(u8.buffer)
    const n = Math.floor((u8.length - 44) / 2)
    let peak = 0
    let nonzero = 0
    for (let i = 0; i < n; i++) {
      const s = dv.getInt16(44 + i * 2, true)
      const a = Math.abs(s)
      if (a > peak) peak = a
      if (a > 100) nonzero++
    }
    return { samples: n, peak, nonzero, seconds: (n / 24000).toFixed(2) }
  })
  console.log('音频分析 →', JSON.stringify(analysis))

  const ok = result.engine === 'kokoro' && result.started && analysis.samples > 1000 && analysis.peak > 500 && analysis.nonzero > 500
  console.log(ok ? 'PASS  Kokoro 输出真实非静音音频' : 'FAIL  音频校验未通过')
  await browser.close()
  process.exit(ok ? 0 : 1)
}

main().catch((e) => { console.error('校验异常：', e); process.exit(1) })
