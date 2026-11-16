/* 全流程 E2E 测试：puppeteer-core + 本机 Chrome */
const puppeteer = require('puppeteer-core')
const fs = require('fs')
const path = require('path')

const BASE = 'http://localhost:4173'
const SHOT_DIR = path.join(__dirname, 'shots')
fs.mkdirSync(SHOT_DIR, { recursive: true })

const consoleErrors = []
const pageErrors = []
const styleIssues = []

async function shot(page, name) {
  await page.screenshot({ path: path.join(SHOT_DIR, name + '.png'), fullPage: false })
  console.log('SHOT', name)
}

async function overflowCheck(page, name, viewport) {
  const r = await page.evaluate(() => {
    const de = document.documentElement
    const horiz = de.scrollWidth - de.clientWidth
    // 找出超出视口宽度的元素
    const offenders = []
    document.querySelectorAll('body *').forEach((el) => {
      const rect = el.getBoundingClientRect()
      if (rect.right > de.clientWidth + 2 && rect.width > 30) {
        offenders.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)} right=${Math.round(rect.right)}`)
      }
    })
    return { horiz, offenders: offenders.slice(0, 5) }
  })
  if (r.horiz > 2 || r.offenders.length) {
    styleIssues.push({ page: name, viewport, ...r })
    console.log('STYLE-ISSUE', name, viewport, 'horiz=', r.horiz, r.offenders.join(' | '))
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function clickByText(page, text, tag = 'button') {
  const ok = await page.evaluate(
    (text, tag) => {
      const els = [...document.querySelectorAll(tag)]
      const el = els.find((e) => e.textContent.trim().includes(text) && e.offsetParent !== null)
      if (el) { el.click(); return true }
      return false
    },
    text,
    tag
  )
  if (!ok) throw new Error(`找不到可点击元素: "${text}"`)
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--window-size=1280,800']
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 800 })
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200)) })
  page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 200)))

  const step = async (name, fn) => {
    try { await fn(); console.log('PASS', name) }
    catch (e) { console.log('FAIL', name, '->', e.message) }
  }

  /* 1. 注册 */
  await page.goto(`${BASE}/#/register`, { waitUntil: 'networkidle0' })
  await page.type('#reg-username', 'e2euser')
  await page.type('#reg-nickname', '测试员')
  await page.type('#reg-password', 'test123456')
  await page.type('#reg-password2', 'test123456')
  await shot(page, '01-register')
  await page.click('button[type=submit]')
  await sleep(1500)
  console.log('URL after register:', page.url())
  await shot(page, '02-after-register')
  await overflowCheck(page, 'register', 1280)

  /* 2. 入学引导 */
  await step('引导页', async () => {
    await page.goto(`${BASE}/#/onboarding`, { waitUntil: 'networkidle0' })
    await sleep(600)
    await shot(page, '03-onboarding')
    await overflowCheck(page, 'onboarding', 1280)
    await clickByText(page, '开始水平自测')
    await sleep(800)
  })

  /* 3. 水平自测：连答到出结果 */
  await step('水平自测', async () => {
    for (let i = 0; i < 15; i++) {
      const done = await page.evaluate(() => document.body.textContent.includes('从推荐等级开始') || document.body.textContent.includes('仍从 L1'))
      if (done) break
      const picked = await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button.quiz-option')].filter((b) => b.offsetParent !== null && !b.disabled)
        if (btns.length) { btns[0].click(); return true }
        return false
      })
      if (!picked) break
      await sleep(300)
      const nextable = await page.evaluate(() => {
        const b = [...document.querySelectorAll('button.btn-primary')].find((x) => x.offsetParent !== null && !x.disabled)
        if (b) { b.click(); return true }
        return false
      })
      if (!nextable) break
      await sleep(400)
    }
    await sleep(600)
    await shot(page, '04-placement-result')
    await overflowCheck(page, 'placement', 1280)
    const btn = await page.evaluate(() => {
      const b = [...document.querySelectorAll('button')].find((x) => x.offsetParent !== null && x.textContent.includes('从推荐等级开始'))
      if (b) { b.click(); return true }
      return false
    })
    if (btn) await sleep(800)
    console.log('URL after placement:', page.url())
  })

  /* 3.5 通用闯关函数：进入关卡页并完成所有未完成关卡 */
  const completeStageFlow = async (levelNo, idx) => {
    await page.goto(`${BASE}/#/map/${levelNo}`, { waitUntil: 'networkidle0' })
    await sleep(700)
    await page.evaluate((i) => {
      const cards = [...document.querySelectorAll('.stage-card')].filter((c) => c.offsetParent !== null)
      cards[i - 1] && cards[i - 1].click()
    }, idx)
    await sleep(1200)
    for (let i = 0; i < 120; i++) {
      const txt = await page.evaluate(() => document.body.innerText)
      if (txt.includes('领取奖励并继续')) { await clickByText(page, '领取奖励并继续'); await sleep(900); break }
      if (txt.includes('进入下一关')) break
      const picked = await page.evaluate(() => {
        const opts = [...document.querySelectorAll('button.quiz-option, .quiz-options button')].filter((b) => b.offsetParent !== null && !b.disabled)
        if (opts.length) { opts[0].click(); return true }
        // 拼写题：点击第一个字母盘按键
        const keys = [...document.querySelectorAll('button')].filter((b) => b.offsetParent !== null && /^[A-Za-z']{1,2}$/.test(b.textContent.trim()))
        if (keys.length) { keys[0].click(); return true }
        // 跟读自评题：点击"好（3 星）"等自评按钮
        const rate = [...document.querySelectorAll('button')].filter((b) => b.offsetParent !== null && !b.disabled && b.textContent.includes('星'))
        if (rate.length) { rate[0].click(); return true }
        return false
      })
      if (!picked) { await sleep(600); continue }
      await sleep(350)
      await page.evaluate(() => {
        const b = [...document.querySelectorAll('button.btn-primary')].find((x) => x.offsetParent !== null && !x.disabled && (x.textContent.includes('下一') || x.textContent.includes('确定') || x.textContent.includes('继续') || x.textContent.includes('查看结果') || x.textContent.includes('领取')))
        if (b) b.click()
      })
      await sleep(350)
    }
    await sleep(400)
  }

  await step('通关 L1 全部 6 关', async () => {
    for (let i = 1; i <= 6; i++) {
      await completeStageFlow(1, i)
      console.log(`  L1-${i} done, url=`, page.url())
    }
    await shot(page, '07b-l1-all-done')
  })

  await step('通关 L2-U1-S1（解锁随机测验）', async () => {
    await completeStageFlow(2, 1)
    console.log('  L2-U1-S1 done, url=', page.url())
    await shot(page, '07c-l2-1-done')
  })

  /* 4. 闯关地图 + 关卡列表 */
  await page.goto(`${BASE}/#/map`, { waitUntil: 'networkidle0' })
  await sleep(800)
  await shot(page, '05-map')
  await overflowCheck(page, 'map', 1280)
  await page.goto(`${BASE}/#/map/1`, { waitUntil: 'networkidle0' })
  await sleep(800)
  await shot(page, '06-level1')
  await overflowCheck(page, 'level1', 1280)

  /* 5. 闯关 L1-1：循环答题直到完成 */
  await step('闯关 L1-1', async () => {
    await page.evaluate(() => {
      const card = [...document.querySelectorAll('.stage-card')].find((c) => c.offsetParent !== null)
      card && card.click()
    })
    await sleep(1200)
    console.log('URL in stage:', page.url())
    await shot(page, '07-stage-start')
    await overflowCheck(page, 'stage', 1280)
    for (let i = 0; i < 20; i++) {
      const txt = await page.evaluate(() => document.body.innerText)
      if (txt.includes('领取奖励并继续')) { await clickByText(page, '领取奖励并继续'); await sleep(1000); break }
      if (txt.includes('恭喜') || txt.includes('完成')) break
      // 点击第一个可见选项
      const picked = await page.evaluate(() => {
        const opts = [...document.querySelectorAll('button')].filter((b) => b.offsetParent !== null && (b.className.includes('option') || b.className.includes('choice')))
        if (opts.length) { opts[0].click(); return true }
        return false
      })
      if (!picked) { await sleep(500); continue }
      await sleep(400)
      const next = await page.evaluate(() => {
        const b = [...document.querySelectorAll('button.btn-primary')].find((x) => x.offsetParent !== null && !x.disabled && (x.textContent.includes('下一') || x.textContent.includes('确定') || x.textContent.includes('继续') || x.textContent.includes('查看结果') || x.textContent.includes('领取')))
        if (b) { b.click(); return true }
        return false
      })
      if (!next) await sleep(600)
      await sleep(300)
    }
    await shot(page, '08-stage-done')
    await overflowCheck(page, 'stage-done', 1280)
  })

  /* 6. 等级综合测验（L1 已 100% 完成，应可进入） */
  await step('L1 等级综合测验', async () => {
    await page.goto(`${BASE}/#/exam/1`, { waitUntil: 'networkidle0' })
    await sleep(800)
    await shot(page, '09b-exam-intro')
    await overflowCheck(page, 'exam-intro', 1280)
    const startable = await page.evaluate(() => {
      const b = [...document.querySelectorAll('button')].find((x) => x.offsetParent !== null && x.textContent.includes('开始测验'))
      if (b) { b.click(); return true }
      return false
    })
    if (!startable) throw new Error('综合测验未解锁或无开始按钮')
    await sleep(900)
    for (let i = 0; i < 80; i++) {
      const res = await page.evaluate(() => document.body.innerText.includes('再测一组') || document.body.innerText.includes('正确率') && document.body.innerText.includes('通过'))
      if (res) break
      const picked = await page.evaluate(() => {
        const opts = [...document.querySelectorAll('button.quiz-option, .quiz-options button')].filter((b) => b.offsetParent !== null && !b.disabled)
        if (opts.length) { opts[Math.floor(Math.random() * opts.length)].click(); return true }
        return false
      })
      if (!picked) break
      await sleep(300)
      await page.evaluate(() => {
        const b = [...document.querySelectorAll('button.btn-primary')].find((x) => x.offsetParent !== null && !x.disabled && x.textContent.includes('下一题'))
        if (b) b.click()
      })
      await sleep(300)
    }
    await shot(page, '09c-exam-result')
    await overflowCheck(page, 'exam-result', 1280)
  })

  /* 7. 随机测验（已通关 L1-1，应已解锁） */
  await step('随机测验', async () => {
    await page.goto(`${BASE}/#/quiz`, { waitUntil: 'networkidle0' })
    await sleep(800)
    await shot(page, '09-quiz-setup')
    await overflowCheck(page, 'quiz', 1280)
    await clickByText(page, '开始测验')
    await sleep(900)
    await shot(page, '10-quiz-question')
    await overflowCheck(page, 'quiz-question', 1280)
    for (let i = 0; i < 25; i++) {
      const res = await page.evaluate(() => document.body.innerText.includes('再测一组'))
      if (res) break
      const picked = await page.evaluate(() => {
        const opts = [...document.querySelectorAll('.quiz-options button, .quiz-option')].filter((b) => b.offsetParent !== null)
        if (opts.length) { opts[Math.floor(Math.random() * opts.length)].click(); return true }
        return false
      })
      if (!picked) break
      await sleep(300)
      const next = await page.evaluate(() => {
        const b = [...document.querySelectorAll('button.btn-primary')].find((x) => x.offsetParent !== null && !x.disabled && x.textContent.includes('下一题'))
        if (b) { b.click(); return true }
        return false
      })
      if (!next) await sleep(500)
    }
    await shot(page, '11-quiz-result')
    await overflowCheck(page, 'quiz-result', 1280)
  })

  /* 7. 进度 / 复习 / 个人中心 */
  for (const [name, hash] of [['progress', '/progress'], ['review', '/review'], ['profile', '/profile']]) {
    await page.goto(`${BASE}/#${hash}`, { waitUntil: 'networkidle0' })
    await sleep(800)
    await shot(page, `12-${name}`)
    await overflowCheck(page, name, 1280)
  }

  /* 8. 主题切换 */
  await step('主题切换', async () => {
    await page.goto(`${BASE}/#/profile`, { waitUntil: 'networkidle0' })
    await sleep(600)
    for (const theme of ['夜间护眼', '暖阳黄', '清新蓝']) {
      const ok = await page.evaluate((t) => {
        const b = [...document.querySelectorAll('button')].find((x) => x.offsetParent !== null && x.textContent.includes(t))
        if (b) { b.click(); return true }
        return false
      }, theme)
      if (ok) { await sleep(500); await shot(page, `13-theme-${theme}`) }
    }
  })

  /* 9. 移动端 / 平板响应式 */
  for (const [name, w, h] of [['mobile', 375, 667], ['tablet', 768, 1024]]) {
    await page.setViewport({ width: w, height: h })
    for (const [n, hash] of [['map', '/map'], ['level', '/map/1'], ['profile', '/profile'], ['quiz', '/quiz']]) {
      await page.goto(`${BASE}/#${hash}`, { waitUntil: 'networkidle0' })
      await sleep(700)
      await shot(page, `14-${name}-${n}`)
      await overflowCheck(page, n, name)
    }
  }

  await browser.close()

  console.log('\n===== 汇总 =====')
  console.log('控制台错误:', consoleErrors.length ? consoleErrors : '无')
  console.log('页面异常:', pageErrors.length ? pageErrors : '无')
  console.log('样式问题:', styleIssues.length ? JSON.stringify(styleIssues, null, 1) : '无')
  fs.writeFileSync(path.join(__dirname, 'e2e-report.json'), JSON.stringify({ consoleErrors, pageErrors, styleIssues }, null, 2))
}

main().catch((e) => { console.error('E2E 脚本异常:', e); process.exit(1) })
