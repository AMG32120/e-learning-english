/* ============================================================
   services/cloudSync.js —— 云端账号与进度同步（Cloudflare D1）
   架构：本地优先（localStorage 为运行时数据源，离线可玩），
   云端为准（在线时登录校验与跨设备进度以云端权威）。

   - 推送：storage.saveUserData 的保存钩子触发，防抖 3s 后推送
     整份用户进度 JSON（失败标记 dirty，联网/下次保存时重试）
   - 拉取：登录成功后与应用启动时各拉一次，与本地数据
     mergeUserData 合并（进度取较高值/集合取并集），安全无冲突
   - 凭证：token = SHA-256(`cloud-token-v1|用户名|密码哈希`)，
     服务端用库内哈希重算比对，无需会话存储
   ============================================================ */

import {
  getUserData,
  saveUserData,
  setSaveHook,
  getAccounts,
  saveAccounts,
  findAccount,
  mergeUserData,
  getSession
} from './storage'
import { sha256 } from './crypto'

const TOKEN_KEY = 'cloud_token'
const API_BASE = '/api/cloud'
const PUSH_DELAY_MS = 3000   // 保存后防抖推送延迟
const RETRY_DELAY_MS = 10000 // 推送失败重试延迟
const TIMEOUT_MS = 10000     // 单次请求超时

/* ---------- 偏好同步（发音性别 / 学习模式） ----------
   偏好平时存独立 localStorage 键（tts.js / studyMode.js 各自读写），
   推送时快照进 user_data.prefs 一并上云；拉取合并后写回这些键并
   派发 app:prefs-synced，由 tts.js / studyMode.js 监听刷新运行时状态。 */

const GENDER_KEY = 'tts-voice-gender'
const STUDY_MODE_KEY = 'study-mode'

/** 读取当前生效的偏好（仅读取实际存在的键，未设置的字段不覆盖） */
function readLivePrefs() {
  const prefs = {}
  try {
    const g = localStorage.getItem(GENDER_KEY)
    if (g === 'female' || g === 'male') prefs.ttsGender = g
    const m = localStorage.getItem(STUDY_MODE_KEY)
    if (m === 'stage' || m === 'free') prefs.studyMode = m
  } catch { /* ignore */ }
  return prefs
}

/** 把合并后的偏好写回各服务的 localStorage 键并通知刷新 */
function applyPrefs(prefs) {
  if (!prefs || typeof window === 'undefined') return
  try {
    if (prefs.ttsGender === 'female' || prefs.ttsGender === 'male') {
      localStorage.setItem(GENDER_KEY, prefs.ttsGender)
    }
    if (prefs.studyMode === 'stage' || prefs.studyMode === 'free') {
      localStorage.setItem(STUDY_MODE_KEY, prefs.studyMode)
    }
  } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent('app:prefs-synced', { detail: { prefs } }))
}

/* ---------- 凭证 ---------- */

export function getCloudToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

export function setCloudToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch { /* ignore */ }
}

export function clearCloudToken() {
  setCloudToken('')
}

/* 与 worker/cloud.js 的 makeToken 保持同一公式 */
export async function computeToken(username, passwordHash) {
  return sha256(`cloud-token-v1|${username}|${passwordHash}`)
}

/* ---------- 底层请求（带超时；网络失败返回 null 以区分"在线拒绝"） ---------- */

async function api(path, { method = 'POST', body = null, query = '' } = {}) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(`${API_BASE}${path}${query}`, {
      method,
      headers: body ? { 'content-type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal
    })
    const data = await res.json().catch(() => null)
    return { status: res.status, data: data || {} }
  } catch {
    return null // 网络不可达 / 超时
  } finally {
    clearTimeout(timer)
  }
}

/* ---------- 拉取并合并 ---------- */

/**
 * 拉取云端进度并与本地合并（进度取较高值/集合取并集）。
 * @returns {Promise<{pulled: boolean, offline: boolean}>}
 */
export async function pullAndMerge(username, token) {
  const res = await api(`/data?u=${encodeURIComponent(username)}&t=${encodeURIComponent(token)}`, { method: 'GET' })
  if (!res) return { pulled: false, offline: true }
  if (!res.data.ok || !res.data.data) return { pulled: false, offline: false }
  const local = getUserData(username)
  const merged = mergeUserData(local, res.data.data)
  saveUserData(username, merged)   // 会经保存钩子把合并结果推回云端
  applyPrefs(merged.prefs)         // 云端偏好落地到各服务的 localStorage 键
  return { pulled: true, offline: false }
}

/* ---------- 推送（防抖 + 失败重试） ---------- */

let pushTimer = null
let pushRetries = 0

/** 把当前本地进度排队推送云端（登录/合并完成后调用） */
export function queuePush(username) {
  if (!getCloudToken()) return
  if (pushTimer) clearTimeout(pushTimer)
  pushTimer = setTimeout(() => doPush(username), pushRetries ? RETRY_DELAY_MS : PUSH_DELAY_MS)
}

/** 供登录合并后落地云端偏好（与 pullAndMerge 内部同一逻辑） */
export function applyCloudPrefs(prefs) {
  applyPrefs(prefs)
}

async function doPush(username) {
  pushTimer = null
  const token = getCloudToken()
  if (!token) return
  const data = getUserData(username)
  // 推送前把偏好快照并入（偏好平时存独立键，不在 user_data 实时落盘）
  data.prefs = { ...(data.prefs || {}), ...readLivePrefs() }
  const res = await api('/data', { body: { username, token, data } })
  if (res && res.data && res.data.ok) {
    pushRetries = 0
    return
  }
  if (res && res.status === 401) {
    // 凭证失效（如云端密码已变）：静默放弃本次推送，等下次登录重建凭证
    return
  }
  // 网络失败 / 服务异常：标记重试（最多 5 次，避免无限循环）
  if (pushRetries < 5) {
    pushRetries += 1
    queuePush(username)
  }
}

/* ---------- 登录 / 注册 / 重置流程的云端协作 ---------- */

/**
 * 云端登录校验（不产生本地副作用，供 auth store 组合决策）。
 * @returns {{kind:'ok',token,data,nickname}|{kind:'no_user'}|{kind:'denied',msg}|{kind:'offline'}}
 */
export async function checkCloudAuth(username, passwordHash) {
  const res = await api('/auth', { body: { username, passwordHash } })
  if (!res) return { kind: 'offline' }
  if (res.data.ok) {
    return {
      kind: 'ok',
      token: res.data.token,
      data: res.data.data,
      nickname: res.data.nickname
    }
  }
  if (res.data.code === 'no_user') return { kind: 'no_user' }
  return { kind: 'denied', msg: res.data.msg || '云端校验失败' }
}

/** 本地账号缺失时，用云端账号信息补写本地账号表（新设备首次登录） */
export function ensureLocalAccount(username, passwordHash, nickname, createdAt) {
  if (findAccount(username)) return
  saveAccounts([
    ...getAccounts(),
    { username, passwordHash, nickname: nickname || username, createdAt: createdAt || Date.now() }
  ])
}

/** 云端无此账号时，把本地老账号迁移上云（注册 + 推送全量数据），失败静默 */
export async function migrateLocalAccount(username, passwordHash, nickname) {
  const reg = await api('/register', {
    body: { username, passwordHash, nickname: nickname || username }
  })
  if (!reg || !reg.data.ok) return
  setCloudToken(await computeToken(username, passwordHash))
  pushRetries = 0
  queuePush(username)
}

/**
 * 注册后的云端写入。在线时若用户名已被云端占用则失败（需在本地写入之前调用）。
 * @returns {Promise<{ok: boolean, msg?: string, offline?: boolean}>}
 */
export async function cloudRegister(username, passwordHash, nickname, securityQuestion, securityAnswerHash) {
  const res = await api('/register', {
    body: { username, passwordHash, nickname, securityQuestion, securityAnswerHash }
  })
  if (!res) return { ok: true, offline: true } // 离线：仅本地注册，联网后迁移
  if (res.data.ok) {
    setCloudToken(await computeToken(username, passwordHash))
    return { ok: true }
  }
  return { ok: false, msg: res.data.msg || '云端注册失败' }
}

/**
 * 注册完成（本地数据就绪）后的首次推送。
 */
export function afterRegister(username) {
  pushRetries = 0
  queuePush(username)
}

/**
 * 重置密码后的云端更新（使用旧哈希派生凭证）。
 * @returns {Promise<{ok: boolean, offline?: boolean}>}
 */
export async function afterReset(username, oldPasswordHash, newPasswordHash) {
  const oldToken = await computeToken(username, oldPasswordHash)
  const res = await api('/reset', { body: { username, token: oldToken, passwordHash: newPasswordHash } })
  if (!res) return { ok: true, offline: true }
  if (res.data.ok) {
    setCloudToken(res.data.token)
    queuePush(username)
    return { ok: true }
  }
  if (res.data.code === 'no_user' || res.status === 404) {
    // 云端还没有这个账号：直接以新密码注册上云
    const reg = await api('/register', { body: { username, passwordHash: newPasswordHash, nickname: username } })
    if (reg && reg.data.ok) {
      setCloudToken(await computeToken(username, newPasswordHash))
      queuePush(username)
    }
    return { ok: true, offline: !reg }
  }
  return { ok: false, msg: res.data.msg || '云端密码更新失败' }
}

/* ---------- 密保问题（忘记密码的身份验证通道） ---------- */

/**
 * 查询账号的密保问题（仅问题文本）。
 * @returns {{kind:'ok',question}|{kind:'no_user'}|{kind:'no_question'}|{kind:'offline'}}
 */
export async function fetchSecurityQuestion(username) {
  const res = await api(`/question?u=${encodeURIComponent(username)}`, { method: 'GET' })
  if (!res) return { kind: 'offline' }
  if (res.data.ok) return { kind: 'ok', question: res.data.question }
  if (res.data.code === 'no_user') return { kind: 'no_user' }
  return { kind: 'no_question' }
}

/**
 * 凭密保答案重置云端密码（未登录/忘密码场景）。
 * @returns {Promise<{ok: boolean, msg?: string, offline?: boolean}>}
 */
export async function cloudResetSecure(username, answerHash, newPasswordHash) {
  const res = await api('/reset-secure', { body: { username, answerHash, passwordHash: newPasswordHash } })
  if (!res) return { ok: true, offline: true }
  if (res.data.ok) {
    setCloudToken(res.data.token)
    return { ok: true }
  }
  return { ok: false, msg: res.data.msg || '云端密码重置失败' }
}

/**
 * 登录态下修改密保问题。
 * @returns {Promise<{ok: boolean, msg?: string, offline?: boolean}>}
 */
export async function cloudSecurityUpdate(username, question, answerHash) {
  const token = getCloudToken()
  if (!token) return { ok: true, offline: true }
  const res = await api('/security-update', { body: { username, token, question, answerHash } })
  if (!res) return { ok: true, offline: true }
  if (res.data.ok) return { ok: true }
  if (res.status === 404 && res.data.code === 'no_user') return { ok: true, offline: true }
  return { ok: false, msg: res.data.msg || '云端密保更新失败' }
}

/* ---------- 初始化 ---------- */

/* 页面关闭/切后台时冲刷仍在防抖等待中的推送（fetch keepalive 允许
   在页面卸载后继续发送；仅在有排队推送时触发，避免无谓请求） */
function flushPendingPush() {
  if (!pushTimer) return
  clearTimeout(pushTimer)
  pushTimer = null
  const username = getSession()
  const token = getCloudToken()
  if (!username || !token) return
  try {
    const data = getUserData(username)
    data.prefs = { ...(data.prefs || {}), ...readLivePrefs() }
    fetch(`${API_BASE}/data`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username, token, data }),
      keepalive: true
    }).catch(() => { /* 离线遗留数据下次启动补推 */ })
  } catch { /* ignore */ }
}

/** 浏览器恢复联网时补推离线期间遗留的改动 */
function setupOnlineRecovery() {
  if (typeof window === 'undefined') return
  window.addEventListener('online', () => {
    if (!getCloudToken()) return
    const username = getSession()
    if (!username) return
    pushRetries = 0
    queuePush(username)
  })
  window.addEventListener('pagehide', flushPendingPush)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushPendingPush()
  })
}

/**
 * 应用启动时调用：注册保存钩子；已登录且有凭证时拉取云端进度合并。
 * 合并完成后派发 app:cloud-synced 事件，供 App.vue 刷新界面数据。
 */
export function initCloudSync() {
  setSaveHook((username) => queuePush(username))
  setupOnlineRecovery()

  const token = getCloudToken()
  if (!token) return
  const username = getSession()
  if (!username) return

  pullAndMerge(username, token)
    .then((r) => {
      if (r.pulled && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('app:cloud-synced', { detail: { username } }))
      }
      /* 离线遗留的未推送数据：联网初始化时补推一次 */
      queuePush(username)
    })
    .catch(() => { /* ignore */ })
}
