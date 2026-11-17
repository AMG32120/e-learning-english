/* 休息提醒弹窗功能验证脚本（临时） */
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
  await inputs[0].type('resttest3')
  if (inputs[1]) await inputs[1].type('resttest3') // 昵称
  if (inputs[2]) await inputs[2].type('test1234') // 密码
  if (inputs[3]) await inputs[3].type('test1234') // 确认密码
  const btns = await page.$$('button[type="submit"]')
  for (const b of btns) {
    const t = await b.evaluate((el) => el.textContent)
    if (/注册|登录|开始/.test(t)) { await b.click(); break }
  }
  await new Promise((r) => setTimeout(r, 1500))
  console.log('注册后 URL:', page.url())
  console.log('登录态:', await page.evaluate(() => Object.keys(localStorage).join(',')))

  // 预置今日累计学习 2699 秒（差 1 秒到 45 分钟）
  await page.evaluate(() => {
    localStorage.setItem('qc-rest-reminder', JSON.stringify({ date: new Date().toISOString().slice(0, 10), seconds: 2699 }))
  })
  await page.reload({ waitUntil: 'networkidle2' })
  await new Promise((r) => setTimeout(r, 3000))

  const shown = await page.evaluate(() => !!document.querySelector('.rest-card'))
  console.log('弹窗出现:', shown)
  if (shown) {
    await page.screenshot({ path: 'tests/shots/rest-reminder.png' })
    const txt = await page.evaluate(() => (document.querySelector('.rest-desc') || {}).innerText)
    console.log('弹窗文案:', String(txt).replace(/\n/g, ' '))
    const rbtns = await page.$$('.rest-btn')
    for (const b of rbtns) {
      if ((await b.evaluate((el) => el.textContent)) === '好，去休息') { await b.click(); break }
    }
    await new Promise((r) => setTimeout(r, 500))
    const after = await page.evaluate(() => ({
      closed: !document.querySelector('.rest-card'),
      stored: JSON.parse(localStorage.getItem('qc-rest-reminder') || '{}').seconds
    }))
    console.log('点击后关闭:', after.closed, '| 计时已清零:', after.stored === 0)
  }
  await browser.close()
})().catch((e) => { console.error('FAIL', e.message); process.exit(1) })
