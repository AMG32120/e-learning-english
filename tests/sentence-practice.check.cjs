/* 连词成句独立练习页验证（临时脚本） */
const puppeteer = require('puppeteer-core')

;(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe'
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 390, height: 844 })
  await page.goto('http://localhost:4173/#/register', { waitUntil: 'networkidle2' })
  await page.waitForSelector('input', { timeout: 10000 })
  const inputs = await page.$$('input')
  await inputs[0].type('sentest')
  if (inputs[1]) await inputs[1].type('sentest')
  if (inputs[2]) await inputs[2].type('test1234')
  if (inputs[3]) await inputs[3].type('test1234')
  await page.click('button[type="submit"]')
  await new Promise((r) => setTimeout(r, 1200))
  await page.goto('http://localhost:4173/#/sentence', { waitUntil: 'networkidle2' })
  await new Promise((r) => setTimeout(r, 1200))
  console.log('当前 URL:', page.url())
  console.log('页面文本:', (await page.evaluate(() => document.body.innerText.slice(0, 200))).replace(/\n/g, ' | '))

  const state = await page.evaluate(() => ({
    title: document.querySelector('.page-title')?.textContent,
    zh: document.querySelector('.order-zh')?.textContent,
    tokens: [...document.querySelectorAll('.order-token')].map((b) => b.textContent)
  }))
  console.log('页面标题:', state.title)
  console.log('句意:', state.zh)
  console.log('词块:', state.tokens.join(' | '))

  if (state.tokens.length) {
    // 按 token 多重集匹配原句并正确作答
    const fs = require('fs')
    const src = fs.readFileSync('src/data/sentences.js', 'utf8')
    const ens = [...src.matchAll(/en: '([^']+)'/g)].map((m) => m[1])
    const norm = (arr) => arr.slice().sort().join(' ')
    const target = ens.find((s) => norm(s.split(' ')) === norm(state.tokens))
    console.log('目标句:', target)
    const used = new Set()
    for (const word of target.split(' ')) {
      const idx = state.tokens.findIndex((t, i) => !used.has(i) && t === word)
      used.add(idx)
      await page.click(`.order-tokens .order-token:nth-child(${idx + 1})`)
    }
    await page.click('.order-actions .btn-primary')
    await new Promise((r) => setTimeout(r, 400))
    const fb = await page.evaluate(() => document.querySelector('.order-feedback')?.textContent)
    console.log('反馈:', fb)
    await page.screenshot({ path: 'tests/shots/sentence-practice.png' })
  }
  await browser.close()
})().catch((e) => { console.error('FAIL', e.message); process.exit(1) })
