/* 连词成句关卡实机验证（临时脚本） */
const puppeteer = require('puppeteer-core')

;(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe'
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 390, height: 844 })
  await page.goto('http://localhost:4173/#/register', { waitUntil: 'networkidle2' })

  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle2' })
  await page.waitForSelector('input', { timeout: 10000 })
  const inputs = await page.$$('input')
  await inputs[0].type('ordertest3')
  if (inputs[1]) await inputs[1].type('ordertest')
  if (inputs[2]) await inputs[2].type('test1234')
  if (inputs[3]) await inputs[3].type('test1234')
  const submit = await page.$$('button[type="submit"]')
  await submit[0].click()
  await new Promise((r) => setTimeout(r, 1500))
  console.log('注册后 URL:', page.url())

  // 注入解锁进度：L1~L4 全部完成 + L5-1..6 完成
  await page.evaluate(() => {
    const key = 'user_ordertest3'
    const data = JSON.parse(localStorage.getItem(key))
    const stages = {}
    const mark = (id) => { stages[id] = { bestStars: 3, completed: true, attempts: 1, completedAt: Date.now() } }
    for (let i = 1; i <= 6; i++) mark(`L1-${i}`)
    for (let i = 1; i <= 41; i++) { mark(`L2-U${i}-S1`); mark(`L2-U${i}-S2`) }
    for (let i = 1; i <= 40; i++) { mark(`L3-U${i}-S1`); mark(`L3-U${i}-S2`) }
    for (let i = 1; i <= 6; i++) mark(`L4-${i}`)
    for (let i = 1; i <= 6; i++) mark(`L5-${i}`)
    data.progress.stages = stages
    data.onboardingDone = true
    localStorage.setItem(key, JSON.stringify(data))
  })
  await page.reload({ waitUntil: 'networkidle2' })
  await new Promise((r) => setTimeout(r, 1000))
  await page.goto('http://localhost:4173/#/stage/L5-7', { waitUntil: 'networkidle2' })
  await new Promise((r) => setTimeout(r, 1500))

  const state = await page.evaluate(() => ({
    title: document.querySelector('.page-title')?.textContent,
    locked: !!document.querySelector('.alert-warn'),
    zh: document.querySelector('.order-zh')?.textContent,
    tokens: [...document.querySelectorAll('.spell-letters .spell-key')].map((b) => b.textContent)
  }))
  console.log('关卡标题:', state.title, '| 被锁:', state.locked)
  console.log('句意:', state.zh)
  console.log('词块:', state.tokens.join(' | '))

  if (!state.locked && state.tokens.length) {
    // 根据词块多重集匹配句库原句，按正确语序点选
    const fs = require('fs')
    const src = fs.readFileSync('src/data/sentences.js', 'utf8')
    const ens = [...src.matchAll(/en: '([^']+)'/g)].map((m) => m[1])
    const norm = (arr) => arr.slice().sort().join(' ')
    const target = ens.find((s) => norm(s.split(' ')) === norm(state.tokens))
    if (!target) throw new Error('词块无法匹配句库原句: ' + state.tokens.join(' '))
    console.log('目标句:', target)
    const used = new Set()
    for (const word of target.split(' ')) {
      const idx = state.tokens.findIndex((t, i) => !used.has(i) && t === word)
      if (idx < 0) throw new Error('词块不足: ' + word)
      used.add(idx)
      await page.click(`.spell-letters .spell-key:nth-child(${idx + 1})`)
    }
    await page.click('.spell-actions .btn-primary')
    await new Promise((r) => setTimeout(r, 400))
    const fb = await page.evaluate(() => ({
      feedback: document.querySelector('.stage-feedback')?.innerText.replace(/\n/g, ' '),
      nextBtn: document.querySelector('.stage-card > .btn-primary')?.textContent
    }))
    console.log('作答反馈:', fb.feedback)
    console.log('下一步按钮:', fb.nextBtn)
    await page.screenshot({ path: 'tests/shots/word-order-stage.png' })
  }
  await browser.close()
})().catch((e) => { console.error('FAIL', e.message); process.exit(1) })
