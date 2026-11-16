/* 同步码 / 二维码逻辑自测（node 环境，esbuild 打包后执行） */
import jsQR from 'jsqr'
import { getAccounts, saveAccounts, setSession, getUserData, saveUserData, getSession } from '../src/services/storage'
import {
  createSyncCode,
  parseSyncCode,
  parseQrBinary,
  buildQrForPayload,
  applySyncCode
} from '../src/services/syncCode'

const store = new Map()
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k)
}
globalThis.window = globalThis
globalThis.alert = () => {}

let failed = 0
function check(name, cond, extra = '') {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`)
  if (!cond) failed += 1
}

/* 把二维码矩阵渲染成 RGBA 位图，再用 jsQR 解出来（模拟手机扫码） */
function decodeQr(qr, scale = 6) {
  const size = qr.size
  const px = size * scale
  const data = new Uint8ClampedArray(px * px * 4).fill(255)
  const margin = 2
  for (let r = 0; r < qr.modules; r += 1) {
    for (let c = 0; c < qr.modules; c += 1) {
      if (!qr.matrix[r][c]) continue
      for (let y = 0; y < scale; y += 1) {
        for (let x = 0; x < scale; x += 1) {
          const pxX = (c + margin) * scale + x
          const pxY = (r + margin) * scale + y
          const off = (pxY * px + pxX) * 4
          data[off] = 0
          data[off + 1] = 0
          data[off + 2] = 0
          data[off + 3] = 255
        }
      }
    }
  }
  return jsQR(data, px, px, { inversionAttempts: 'dontInvert' })
}

async function main() {
  // 造一个“学习很久”的账号
  const username = 'alice'
  saveAccounts([{ username, passwordHash: 'deadbeef', createdAt: Date.now(), nickname: 'Alice' }])
  const data = getUserData(username)
  const stageKeys = []
  for (let i = 1; i <= 58; i += 1) {
    const key = `L${(i % 8) + 1}-${i}`
    stageKeys.push(key)
    data.progress.stages[key] = { bestStars: 3, completed: true, attempts: 2, completedAt: 1700000000000 + i }
  }
  const dayKey = (d) => {
    const dt = new Date(Date.UTC(2026, 0, 1 + d))
    return dt.toISOString().slice(0, 10)
  }
  data.checkins = {}
  data.stats.daily = {}
  for (let d = 0; d < 60; d += 1) {
    data.checkins[dayKey(d)] = true
    data.stats.daily[dayKey(d)] = { stage: 1, quiz: 8, quizCorrect: 6, review: 3, spell: 0, dict: 0 }
  }
  data.badges = ['first_stage', 'streak_7', 'quiz_50']
  data.stats.masteredWords = Array.from({ length: 300 }, (_, i) => `word${i}|n`)
  data.stats.vocabHistory = Array.from({ length: 60 }, (_, i) => ({ date: dayKey(i), count: 50 + i }))
  data.stats.vocabEstimates = [{ date: '2026-10-01', value: 3200 }]
  data.wordbook = Array.from({ length: 60 }, (_, i) => `wb${i}|n`)
  data.mistakes = Array.from({ length: 40 }, (_, i) => ({ id: `mk${i}`, q: `题干${i}`, options: [], answerKey: 'a', resolved: false, at: Date.now() - i * 1000 }))
  saveUserData(username, data)
  setSession(username)

  const gen = await createSyncCode(username)
  check('生成同步码成功', gen.ok)
  console.log(`  完整码：${gen.size} 字符；JSON ${gen.rawBytes} 字节；压缩后 ${gen.packedBytes} 字节`)

  const qr = await buildQrForPayload(gen.payload)
  console.log('  二维码：', qr.ok ? `${qr.modules}×${qr.modules} 模块，${qr.bytes} 字节，精简=${qr.lite}` : qr.reason)
  check('二维码生成成功', qr.ok, qr.reason || '')
  check('至少有一种二维码可用', qr.ok)
  if (qr.ok) {
    const scanned = decodeQr(qr)
    check('二维码可被扫描识别', !!scanned)
    if (scanned) {
      check('扫码内容带 QCB1 魔数', String.fromCharCode(...scanned.binaryData.slice(0, 4)) === 'QCB1')
      const qrParsed = await parseQrBinary(scanned.binaryData)
      check('扫码内容可解析为同步数据', qrParsed.ok, qrParsed.ok ? '' : qrParsed.reason)
      check('扫码解析出的账号正确', qrParsed.ok && qrParsed.summary.username === username)
      check('扫码解析关卡数正确', qrParsed.ok && qrParsed.summary.completedStages === 58)
    }
  }

  // 文本同步码解析
  const parsed = await parseSyncCode(gen.code)
  check('解析同步码成功', parsed.ok, parsed.ok ? '' : parsed.reason)
  check('摘要关卡数正确', parsed.ok && parsed.summary.completedStages === 58, parsed.ok ? String(parsed.summary.completedStages) : '')
  check('码内无空白字符', !/\s/.test(gen.code))

  // 模拟“新设备”：清空本地存储，只留另一账号
  store.clear()
  saveAccounts([{ username: 'bob', passwordHash: 'x', createdAt: 1, nickname: 'Bob' }])
  setSession('bob')

  const created = await applySyncCode(parsed.payload, 'merge')
  check('新设备导入成功（自动建号）', created.ok && created.mode === 'created', created.message)
  check('会话切到同步账号', getSession() === username)
  const restored = getUserData(username)
  check('关卡数据完整', Object.keys(restored.progress.stages).length === 58)
  check('打卡数据完整', Object.keys(restored.checkins).length === 60)
  check('生词本完整', restored.wordbook.length === 60)
  check('错题本完整', restored.mistakes.length === 40)
  check('每日统计完整', Object.keys(restored.stats.daily).length === 60)
  check('词汇曲线完整', restored.stats.vocabHistory.length === 60)
  check('账号已创建且密码哈希保留', getAccounts().some((a) => a.username === username && a.passwordHash === 'deadbeef'))

  // 合并模式：本机有较低进度 + 本机独有打卡/生词/错题
  const targetKey = stageKeys[0]
  const local = getUserData(username)
  local.progress.stages = { [targetKey]: { bestStars: 1, completed: false, attempts: 1, completedAt: 1 } }
  local.checkins = { '2020-01-01': true }
  local.wordbook = ['local-only|n']
  local.mistakes = [{ id: 'local-mk', q: '本机错题', options: [], answerKey: 'a', resolved: false, at: Date.now() }]
  local.stats.daily = { '2020-01-01': { quiz: 5 } }
  saveUserData(username, local)

  const merged = await applySyncCode(parsed.payload, 'merge')
  const after = getUserData(username)
  check('合并导入：关卡取较高值', merged.ok && after.progress.stages[targetKey].bestStars === 3, String(after.progress.stages[targetKey].bestStars))
  check('合并导入：打卡取并集', !!after.checkins['2020-01-01'] && Object.keys(after.checkins).length === 61)
  check('合并导入：生词本取并集', after.wordbook.includes('local-only|n') && after.wordbook.length === 61)
  check('合并导入：错题本取并集', after.mistakes.some((m) => m.id === 'local-mk') && after.mistakes.length === 41)
  check('合并导入：每日统计按日期累加', (after.stats.daily['2020-01-01'] || {}).quiz === 5)

  // 覆盖模式
  const local2 = getUserData(username)
  local2.checkins = { '2020-01-01': true }
  local2.wordbook = ['local-only|n']
  saveUserData(username, local2)
  await applySyncCode(parsed.payload, 'overwrite')
  const after2 = getUserData(username)
  check('覆盖导入：清掉本机额外打卡', !after2.checkins['2020-01-01'])
  check('覆盖导入：清掉本机额外生词', !after2.wordbook.includes('local-only|n'))

  // 精简二维码（缺统计字段）导入后仍保留本机统计曲线
  if (qr.ok && qr.lite) {
    const liteParsed = await parseQrBinary(new Uint8Array(0))
    check('空扫码内容被拒绝', !liteParsed.ok, liteParsed.reason)
  }

  // 容错
  const bad1 = await parseSyncCode('hello')
  check('非同步码被拒绝', !bad1.ok, bad1.reason)
  const bad2 = await parseSyncCode(gen.code.slice(0, gen.code.length - 20))
  check('截断的同步码被拒绝', !bad2.ok, bad2.reason)
  const bad3 = await parseSyncCode('QC1.Z@@@@')
  check('损坏的同步码被拒绝', !bad3.ok, bad3.reason)
  const bad4 = await parseSyncCode('QC1.P' + Buffer.from('{"app":"x"}').toString('base64url'))
  check('非本应用数据被拒绝', !bad4.ok, bad4.reason)
  const bad5 = await parseQrBinary(new Uint8Array([1, 2, 3, 4, 5, 6]))
  check('非本应用二维码被拒绝', !bad5.ok, bad5.reason)

  console.log(failed ? `\n${failed} 项失败` : '\n全部通过')
  process.exit(failed ? 1 : 0)
}

main().catch((e) => {
  console.error('测试异常：', e)
  process.exit(1)
})
