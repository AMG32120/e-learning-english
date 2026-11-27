/* ============================================================
   services/storage.js —— localStorage 封装
   数据分层：学习内容放 src/data/；localStorage 仅存账号、登录态、
   用户信息、学习进度、打卡、徽章、主题偏好。
   - 账号表键：accounts
   - 会话键：session
   - 用户数据键：user_<username>
   - 访客主题键：theme_guest
   ============================================================ */

const ACCOUNTS_KEY = 'accounts'
const SESSION_KEY = 'session'
const GUEST_THEME_KEY = 'theme_guest'
const USER_DATA_VERSION = 1

function safeGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

let quotaWarned = false

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage 容量超限等场景：派发全局事件提示用户导出备份（每次会话仅提示一次）
    if (!quotaWarned && typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      quotaWarned = true
      window.dispatchEvent(new CustomEvent('app:storage-quota', { detail: { key } }))
    }
  }
}

/* ---------- 账号表 ---------- */
export function getAccounts() {
  return safeGet(ACCOUNTS_KEY, [])
}

export function saveAccounts(list) {
  safeSet(ACCOUNTS_KEY, list)
}

export function findAccount(username) {
  return getAccounts().find((a) => a.username === username) || null
}

export function accountExists(username) {
  return getAccounts().some((a) => a.username === username)
}

/* ---------- 会话 ---------- */
export function getSession() {
  const s = safeGet(SESSION_KEY, null)
  return s && typeof s.username === 'string' ? s.username : null
}

export function setSession(username) {
  safeSet(SESSION_KEY, { username, loginAt: Date.now() })
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
}

/* ---------- 用户数据 ---------- */
export function buildDefaultUserData() {
  return {
    version: USER_DATA_VERSION,
    profile: {
      nickname: '',
      avatar: '',
      createdAt: Date.now()
    },
    theme: 'blue',
    onboardingDone: false,
    placementDone: false,
    dailyGoal: 20, // 每日学习目标（题/词次），0 表示不设目标
    prefs: {
      ttsGender: 'female', // 发音偏好：'female' | 'male'
      studyMode: 'stage'   // 学习模式：'stage' 关卡模式 | 'free' 自由模式
    },
    progress: {
      stages: {}, // { [stageId]: { bestStars, completed, attempts, completedAt } }
      recommendedStage: 'L1-1'
    },
    reviewPool: {}, // { [itemKey]: { itemKey, wrongCount, dueDate, intervalStage } }
    checkins: {}, // { 'YYYY-MM-DD': true }
    badges: [], // ['first_stage']
    levelExams: {}, // { 'L1': { passedAt } } 等级综合测验通过记录
    stats: {
      quizCount: 0,
      quizCorrect: 0,
      dailySentence: { date: '', key: '' },
      masteredWords: [], // 已通关关卡词条唯一键（word|pos）去重并集
      reviewDone: 0 // 累计完成复习任务次数
    }
  }
}

export function getUserData(username) {
  if (!username) return buildDefaultUserData()
  const data = safeGet(`user_${username}`, null)
  if (data && data.version === USER_DATA_VERSION) {
    // 兼容旧数据缺字段
    const def = buildDefaultUserData()
    return {
      ...def,
      ...data,
      profile: { ...def.profile, ...(data.profile || {}) },
      progress: { ...def.progress, ...(data.progress || {}) },
      reviewPool: data.reviewPool || {},
      checkins: data.checkins || {},
      badges: data.badges || [],
      prefs: { ...def.prefs, ...(data.prefs || {}) },
      stats: { ...def.stats, ...(data.stats || {}) }
    }
  }
  return buildDefaultUserData()
}

/* 保存钩子：云同步层（cloudSync.js）注册，saveUserData 时收到通知
   以排队推送云端；避免 storage ↔ cloudSync 循环依赖 */
let saveHook = null

export function setSaveHook(fn) {
  saveHook = typeof fn === 'function' ? fn : null
}

export function saveUserData(username, data) {
  if (!username) return
  safeSet(`user_${username}`, { ...data, version: USER_DATA_VERSION })
  if (saveHook) {
    try { saveHook(username) } catch { /* ignore */ }
  }
}

/* ---------- 数据导出 / 导入（PLAN §3.2.9.1） ----------
   导出：仅账号 + 用户进度（用户名、密码哈希、创建时间、关卡进度、
   打卡、徽章、复习池、统计等），不含词库等学习内容数据。
   导入：先校验格式与版本号，再按「覆盖 / 合并」两种模式写入。 */
const EXPORT_APP = 'e-learning-english'
const EXPORT_TYPE = 'user-data'
const EXPORT_VERSION = 1

export function exportUserData(username) {
  if (!username) return null
  const account = findAccount(username)
  const data = getUserData(username)
  return {
    app: EXPORT_APP,
    exportType: EXPORT_TYPE,
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    user: {
      username,
      passwordHash: account ? account.passwordHash : '',
      createdAt: data.profile.createdAt || 0
    },
    data
  }
}

export function exportUserDataJson(username) {
  const payload = exportUserData(username)
  return payload ? JSON.stringify(payload) : ''
}

export function validateImportPayload(payload) {
  if (!payload || typeof payload !== 'object') return { ok: false, reason: '文件内容不是有效的 JSON 对象' }
  if (payload.app !== EXPORT_APP || payload.exportType !== EXPORT_TYPE) {
    return { ok: false, reason: '文件不是本应用的用户数据导出文件' }
  }
  if (payload.version !== EXPORT_VERSION) {
    return { ok: false, reason: `版本号不匹配：文件版本 ${payload.version}，当前支持版本 ${EXPORT_VERSION}` }
  }
  if (!payload.user || typeof payload.user.username !== 'string') {
    return { ok: false, reason: '文件缺少用户账号信息' }
  }
  if (!payload.data || typeof payload.data !== 'object' || !payload.data.progress || !payload.data.progress.stages) {
    return { ok: false, reason: '文件缺少进度数据结构' }
  }
  return { ok: true, payload }
}

/* 合并两套用户进度：进度取较高值 / 集合取并集（PLAN §3.2.9.1） */
export function mergeUserData(base, incoming) {
  const def = buildDefaultUserData()
  const merged = {
    ...def,
    ...base,
    ...incoming,
    profile: { ...def.profile, ...(base.profile || {}), ...(incoming.profile || {}) },
    theme: incoming.theme || base.theme || def.theme,
    progress: { ...def.progress, ...(base.progress || {}), ...(incoming.progress || {}) },
    reviewPool: { ...(base.reviewPool || {}), ...(incoming.reviewPool || {}) },
    checkins: { ...(base.checkins || {}), ...(incoming.checkins || {}) },
    badges: [...new Set([...(base.badges || []), ...(incoming.badges || [])])],
    levelExams: { ...(base.levelExams || {}), ...(incoming.levelExams || {}) }
  }
  // 偏好合并（单值标量，无法比较时间戳）：本地已改为非默认值 → 以本地为准
  // （覆盖"离线改了偏好被云端旧值冲掉"）；本地仍是默认值 → 采用云端值
  // （覆盖"新设备登录时拿到云端偏好"）
  const pa = base.prefs || def.prefs
  const pb = incoming.prefs || def.prefs
  merged.prefs = {
    ttsGender: pa.ttsGender && pa.ttsGender !== def.prefs.ttsGender ? pa.ttsGender : (pb.ttsGender || def.prefs.ttsGender),
    studyMode: pa.studyMode && pa.studyMode !== def.prefs.studyMode ? pa.studyMode : (pb.studyMode || def.prefs.studyMode)
  }
  // 关卡进度合并：bestStars / completed / completedAt 取较高或较新，attempts 相加
  const stageKeys = new Set([
    ...Object.keys(base.progress.stages || {}),
    ...Object.keys(incoming.progress.stages || {})
  ])
  merged.progress.stages = {}
  for (const key of stageKeys) {
    const a = (base.progress.stages || {})[key]
    const b = (incoming.progress.stages || {})[key]
    if (!a) merged.progress.stages[key] = b
    else if (!b) merged.progress.stages[key] = a
    else {
      merged.progress.stages[key] = {
        bestStars: Math.max(a.bestStars || 0, b.bestStars || 0),
        completed: !!(a.completed || b.completed),
        // 练习次数取较大值而非累加：刷新时云端即本机上次推送的同一份，
        // 累加会导致每刷新一次次数翻倍
        attempts: Math.max(a.attempts || 0, b.attempts || 0),
        completedAt: Math.max(a.completedAt || 0, b.completedAt || 0)
      }
    }
  }
  // 统计合并：题数/正确数/复习次数取较高值，掌握词取并集，每日一句取较新
  const sa = base.stats || def.stats
  const sb = incoming.stats || def.stats

  // 每日学习统计：按日期取较大值。不能用累加——刷新时云端数据就是
  // 本机上次推送的同一份，累加会让今日目标每次刷新翻倍（滚雪球）；
  // 同日多设备学习取较高一方，误差远小于翻倍
  const daily = {}
  const dailyKeys = new Set([...Object.keys(sa.daily || {}), ...Object.keys(sb.daily || {})])
  for (const key of dailyKeys) {
    const a = (sa.daily || {})[key] || {}
    const b = (sb.daily || {})[key] || {}
    const target = {}
    const fields = new Set([...Object.keys(a), ...Object.keys(b)])
    for (const field of fields) {
      target[field] = Math.max(Number(a[field]) || 0, Number(b[field]) || 0)
    }
    daily[key] = target
  }

  // 词汇量曲线：按日期合并取较大值，并按日期排序
  const vocabMap = new Map()
  for (const item of [...(sa.vocabHistory || []), ...(sb.vocabHistory || [])]) {
    if (!item || !item.date) continue
    const prev = vocabMap.get(item.date)
    if (!prev || (item.count || 0) > (prev.count || 0)) vocabMap.set(item.date, item)
  }
  const vocabHistory = [...vocabMap.values()].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))

  // 词汇量估算记录：按日期去重
  const estMap = new Map()
  for (const item of [...(sa.vocabEstimates || []), ...(sb.vocabEstimates || [])]) {
    if (!item || !item.date) continue
    estMap.set(item.date, item)
  }
  const vocabEstimates = [...estMap.values()].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)).slice(-20)

  merged.stats = {
    quizCount: Math.max(sa.quizCount || 0, sb.quizCount || 0),
    quizCorrect: Math.max(sa.quizCorrect || 0, sb.quizCorrect || 0),
    reviewDone: Math.max(sa.reviewDone || 0, sb.reviewDone || 0),
    masteredWords: [...new Set([...(sa.masteredWords || []), ...(sb.masteredWords || [])])],
    daily,
    vocabHistory,
    vocabEstimates,
    dailySentence:
      (sa.dailySentence && sb.dailySentence && sa.dailySentence.date >= sb.dailySentence.date
        ? sa.dailySentence
        : sb.dailySentence) || { date: '', key: '' }
  }

  // 生词本：按 itemKey 并集
  merged.wordbook = [...new Set([...(base.wordbook || []), ...(incoming.wordbook || [])])]

  // 错题本：按 id 去重（同题以未消化状态为准），最多保留 100 条（新题在前）
  const mistakeMap = new Map()
  for (const m of [...(base.mistakes || []), ...(incoming.mistakes || [])]) {
    if (!m || !m.id) continue
    const prev = mistakeMap.get(m.id)
    if (!prev) mistakeMap.set(m.id, m)
    else if (prev.resolved && !m.resolved) mistakeMap.set(m.id, m)
  }
  merged.mistakes = [...mistakeMap.values()]
    .sort((a, b) => (b.at || 0) - (a.at || 0))
    .slice(0, 100)

  return merged
}

export function importUserData(username, jsonText, mode = 'overwrite') {
  if (!username) return { ok: false, reason: '未登录，无法导入' }
  let payload
  try {
    payload = JSON.parse(jsonText)
  } catch {
    return { ok: false, reason: 'JSON 解析失败，请确认文件内容完整' }
  }
  const check = validateImportPayload(payload)
  if (!check.ok) return check
  if (payload.user.username !== username) {
    return { ok: false, reason: `导出文件属于账号「${payload.user.username}」，与当前登录账号不一致，禁止导入` }
  }
  const current = getUserData(username)
  const incoming = payload.data
  if (mode === 'merge') {
    const merged = mergeUserData(current, incoming)
    saveUserData(username, merged)
    return { ok: true, mode: 'merge', message: '合并导入成功，进度取较高值、集合已去重' }
  }
  // 默认覆盖：保留账号身份字段，整体替换进度
  saveUserData(username, incoming)
  return { ok: true, mode: 'overwrite', message: '覆盖导入成功' }
}

/* ---------- 访客主题 ---------- */
export function getGuestTheme() {
  return safeGet(GUEST_THEME_KEY, 'blue')
}

export function setGuestTheme(theme) {
  safeSet(GUEST_THEME_KEY, theme)
}
