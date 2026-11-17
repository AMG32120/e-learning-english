/* 冒烟测试入口：esbuild 打包后由 node 执行 */
import fs from 'fs'
import { LEVELS, getLevel, getStageById, getStageWords, getPoolData, LEVEL_UNLOCK_RATIO } from '../src/data/levels'
import { LETTERS, IPA_VOWELS, IPA_CONSONANTS, PHONICS_RULES } from '../src/data/letters'
import { hydrateWordData, getAllL2Words, getL5Themes, getL8Words } from '../src/services/wordData'
import { DIALOGUES_L3, L3_LISTENING } from '../src/data/dialogues'
import { getGrammarUnitById } from '../src/data/grammar'
import { getL6ListeningById } from '../src/data/listening_l6'
import { getArticleById } from '../src/data/reading_l7'
import { getSimulationById } from '../src/data/simulation_l8'
import { SENTENCE_BANKS } from '../src/data/sentences'
import { DAILY_SENTENCES } from '../src/data/daily'
import { collectLevelQuestions, collectUnlockedQuestions } from '../src/services/quizBank'
import { getAccounts, saveAccounts, getSession, setSession, getUserData, saveUserData } from '../src/services/storage'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '../src/stores/auth'
import { useProgressStore } from '../src/stores/progress'

/* 词库 JSON 注入（Node 环境直接读文件，等价于浏览器的启动预载）
   分批文件按顺序合并，与 wordData.preloadWordData 的行为保持一致。 */
function readJson(file) {
  return JSON.parse(fs.readFileSync(`public/data/${file}`, 'utf8'))
}
const L2_FILES = ['words-l2.json', 'words-l2-extra.json', 'words-l2-b2a.json', 'words-l2-b2b.json', 'words-l2-b2c.json', 'words-l2-b2d.json', 'words-l2-b2e.json', 'words-l2-b3a.json']
const L5_FILES = ['words-l5.json', 'words-l5-extra.json', 'words-l5-b2a.json', 'words-l5-b2b.json', 'words-l5-b2c.json', 'words-l5-b2d.json', 'words-l5-b2e.json', 'words-l5-b3a.json', 'words-l5-b3b.json', 'words-l5-b4a.json', 'words-l5-b4b.json', 'words-l5-b4c.json', 'words-l5-b4d.json', 'words-l5-b4e.json', 'words-l5-b5a.json', 'words-l5-b5b.json', 'words-l5-b6a.json', 'words-l5-b6b.json', 'words-l5-b6c.json', 'words-l5-b6d.json', 'phrases-1.json', 'phrases-2.json', 'phrases-3.json', 'phrases-4.json', 'phrases-5.json']
const l2Merged = {}
L2_FILES.forEach((f) => Object.assign(l2Merged, readJson(f)))
const l5Merged = []
L5_FILES.forEach((f) => l5Merged.push(...readJson(f)))

hydrateWordData({
  l2: l2Merged,
  l5: l5Merged,
  l8: readJson('words-l8.json')
})

let passed = 0, failed = 0
/* 顺序执行队列，避免异步用例竞态 */
const queue = []
function t(name, fn) {
  queue.push({ name, fn })
}
async function runAll() {
  for (const { name, fn } of queue) {
    try {
      await fn()
      passed++
      console.log('PASS', name)
    } catch (e) {
      failed++
      console.log('FAIL', name, '->', e.message)
    }
  }
}
function eq(a, b, msg) { if (a !== b) throw new Error(`${msg}: 期望 ${b} 实际 ${a}`) }
function ok(v, msg) { if (!v) throw new Error(msg) }

/* ---------- 数据完整性 ---------- */
const totalStages = LEVELS.reduce((s, l) => s + l.stages.length, 0)
t('总关卡数 ≥ 550（12 级结构）', () => ok(totalStages >= 550, 'stages=' + totalStages))
t('12 个等级', () => eq(LEVELS.length, 12, 'levels'))
t('解锁比例 0.8', () => eq(LEVEL_UNLOCK_RATIO, 0.8, 'ratio'))
t('26 字母', () => eq(LETTERS.length, 26, 'letters'))
t('48 音标', () => eq(IPA_VOWELS.length + IPA_CONSONANTS.length, 48, 'ipa'))
t('L2 去重词条 ≥ 600', () => ok(getAllL2Words().length >= 600, 'L2 words=' + getAllL2Words().length))
t('L3 对话 4 场景 + 2 听力', () => {
  eq(DIALOGUES_L3.length, 4, 'dialogues')
  eq(L3_LISTENING.length, 2, 'listening')
})
t('L5 主题 ≥ 90（含词组包）', () => ok(getL5Themes().length >= 90, 'themes=' + getL5Themes().length))
t('词组搭配 ≥ 250 条且无跨包重复', () => {
  const phraseThemes = getL5Themes().filter((x) => String(x.id).startsWith('ph_'))
  ok(phraseThemes.length >= 20, 'phrase themes=' + phraseThemes.length)
  const words = phraseThemes.flatMap((x) => x.words.map((w) => w.word.toLowerCase()))
  ok(words.length >= 250, 'phrases=' + words.length)
  eq(new Set(words).size, words.length, '词组重复数')
  ok(words.every((w) => /\s/.test(w)), '存在不含空格的词组')
})
t('词组关卡只用选择题且带 mode（L9）', () => {
  const level = getLevel(9)
  const phraseStages = level.stages.filter((st) => String(st.content.pool).startsWith('ph_'))
  ok(phraseStages.length >= 40, 'phrase stages=' + phraseStages.length)
  for (const st of phraseStages) {
    eq(st.type, 'word_choice', `${st.id} type`)
    ok(['en2zh', 'zh2en'].includes(st.content.mode), `${st.id} mode=${st.content.mode}`)
  }
})
t('L12 学术词 96', () => eq(getL8Words().length, 96, 'l8 words'))
t('连词成句句库与题型', () => {
  ok(SENTENCE_BANKS.basic.length >= 20, 'basic=' + SENTENCE_BANKS.basic.length)
  ok(SENTENCE_BANKS.adv.length >= 12, 'adv=' + SENTENCE_BANKS.adv.length)
  const wo = getLevel(5).stages.filter((st) => st.type === 'word_order')
  eq(wo.length, 2, 'word_order stages')
  for (const st of wo) {
    ok(['basic', 'adv'].includes(st.content.bank), `${st.id} bank`)
  }
  // 主题分布：L2/L3/L6~L9 关卡都存在且 L9 含词组包
  for (const lv of [2, 3, 6, 7, 8, 9]) {
    ok(getLevel(lv).stages.length >= 40, `L${lv} stages=${getLevel(lv).stages.length}`)
  }
})
t('每日一句 60', () => eq(DAILY_SENTENCES.length, 60, 'daily'))
t('词汇关卡每关 3-6 词且词池可解析', () => {
  for (const lv of [2, 3, 6, 7, 8, 9]) {
    const level = getLevel(lv)
    for (const st of level.stages) {
      const n = (st.content.focus || []).length
      ok(n >= 3 && n <= 6, `${st.id} focus=${n}`)
      ok(getPoolData(st.content.pool).length >= 6, `${st.id} pool 过小`)
    }
  }
})
t('关卡 stage 序号连续', () => {
  for (const lv of LEVELS) {
    lv.stages.forEach((st, i) => eq(st.stage, i + 1, `${lv.level} 第 ${i + 1} 关`))
  }
})

/* 每关单词数校验 */
t('各关 getStageWords 非空且≤12', () => {
  for (const lv of LEVELS) {
    for (const st of lv.stages) {
      const ws = getStageWords(st)
      if (st.type === 'word') {
        ok(ws.length > 0 && ws.length <= 12, `${st.id} 词数=${ws.length}`)
      }
    }
  }
})

/* 内容引用完整性：stage.content 引用的数据必须存在 */
t('stage 引用数据完整', () => {
  for (const lv of LEVELS) {
    for (const st of lv.stages) {
      const c = st.content || {}
      if (c.theme) ok(getL5Themes().some(x => x.id === c.theme), `${st.id} theme ${c.theme} 缺失`)
      if (c.script) {
        if (lv.level === 4) ok(L3_LISTENING.some(x => x.id === c.script), `${st.id} script ${c.script} 缺失`)
        else ok(getL6ListeningById(c.script), `${st.id} script ${c.script} 缺失`)
      }
      if (c.article) ok(getArticleById(c.article), `${st.id} article ${c.article} 缺失`)
      if (c.simulation) ok(getSimulationById(c.simulation), `${st.id} simulation ${c.simulation} 缺失`)
      if (c.grammarUnitId) ok(getGrammarUnitById(c.grammarUnitId), `${st.id} grammar ${c.grammarUnitId} 缺失`)
      if (c.dialogue) ok(DIALOGUES_L3.some(d => d.id === c.dialogue), `${st.id} dialogue ${c.dialogue} 缺失`)
    }
  }
})

/* ---------- 题库生成 ---------- */
t('等级综合测验 L1-L5 题目有效', () => {
  // 构造"全解锁"进度代理：progress.isStageUnlocked 始终返回 true
  const progress = { isStageUnlocked: () => true }
  for (let lv = 1; lv <= 5; lv++) {
    const qs = collectLevelQuestions(progress, lv)
    ok(Array.isArray(qs), `L${lv} quiz 返回非数组`)
    ok(qs.length > 0, `L${lv} 题目为空`)
    for (const q of qs) {
      ok(q.q && q.options && q.options.length >= 2, `L${lv} 题目结构异常: ${JSON.stringify(q).slice(0, 80)}`)
      ok(typeof q.answer === 'number' && q.answer >= 0 && q.options[q.answer] !== undefined, `L${lv} 答案索引无效: ${q.q}`)
    }
  }
})

t('随机测验抽题上限', () => {
  const progress = { isStageUnlocked: () => true }
  const qs = collectUnlockedQuestions(progress, [1, 2, 3, 4], 20)
  ok(qs.length <= 20 && qs.length > 0, `抽题数=${qs.length}`)
})

/* ---------- storage 与 store ---------- */
// localStorage shim
const mem = {}
globalThis.localStorage = {
  getItem: k => (k in mem ? mem[k] : null),
  setItem: (k, v) => { mem[k] = String(v) },
  removeItem: k => { delete mem[k] },
  clear: () => { for (const k of Object.keys(mem)) delete mem[k] }
}
globalThis.window = globalThis

const pinia = createPinia()
setActivePinia(pinia)

t('注册→登录→用户数据读写', async () => {
  const auth = useAuthStore()
  const r = await auth.register({ username: 'tester', password: '123456' })
  ok(r && r.ok !== false, '注册失败: ' + JSON.stringify(r))
  ok(auth.isLoggedIn, '注册后未登录')
  const prog = useProgressStore()
  prog.loadForCurrentUser()
  prog.completeStage('L1-1', 3)
  const saved = getUserData('tester')
  ok(saved.progress.stages['L1-1'] && saved.progress.stages['L1-1'].completed, '进度未持久化')
})

t('重复用户名注册被拒', async () => {
  const auth = useAuthStore()
  const r = await auth.register({ username: 'tester', password: 'abc123' })
  ok(r && r.ok === false, '重复注册未拒绝')
})

t('重新登录后进度恢复', async () => {
  const auth = useAuthStore()
  auth.logout()
  const r = await auth.login({ username: 'tester', password: '123456' })
  ok(r && r.ok !== false, '登录失败: ' + JSON.stringify(r))
  const prog = useProgressStore()
  prog.loadForCurrentUser()
  ok(prog.stages['L1-1'] && prog.stages['L1-1'].completed, '进度未恢复')
})

t('关卡解锁链：完成 L1-1 后 L1-2 解锁', () => {
  const prog = useProgressStore()
  prog.loadForCurrentUser()
  ok(prog.isStageUnlocked('L1-1'), 'L1-1 应默认解锁')
  ok(prog.isStageUnlocked('L1-2'), 'L1-2 应解锁')
  ok(!prog.isStageUnlocked('L1-3'), 'L1-3 不应解锁')
})

t('跨等级解锁：L1 全通后 L2 解锁', () => {
  const prog = useProgressStore()
  prog.loadForCurrentUser()
  for (let i = 1; i <= 6; i++) prog.completeStage(`L1-${i}`, 3)
  ok(prog.isLevelUnlocked(2), 'L2 应解锁')
  ok(!prog.isLevelUnlocked(3), 'L3 不应解锁')
})

t('退出登录清空会话', () => {
  const auth = useAuthStore()
  auth.logout()
  ok(!auth.isLoggedIn, '登出后仍为登录态')
  eq(getSession(), null, 'session 未清空')
})

console.log(`\n等待异步用例...`)
runAll().then(() => {
  console.log(`\n结果: ${passed} 通过, ${failed} 失败`)
  process.exit(failed > 0 ? 1 : 0)
})
