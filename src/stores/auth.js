/* ============================================================
   stores/auth.js —— 登录态 / 用户信息状态
   ============================================================ */
import { defineStore } from 'pinia'
import {
  findAccount,
  getAccounts,
  getSession,
  saveAccounts,
  setSession,
  clearSession,
  getUserData,
  saveUserData,
  mergeUserData,
  getGuestTheme,
  setGuestTheme
} from '../services/storage'
import { sha256 } from '../services/crypto'
import {
  checkCloudAuth,
  ensureLocalAccount,
  migrateLocalAccount,
  cloudRegister,
  afterRegister,
  queuePush,
  clearCloudToken,
  computeToken,
  setCloudToken,
  applyCloudPrefs,
  fetchSecurityQuestion,
  cloudResetSecure,
  cloudSecurityUpdate
} from '../services/cloudSync'

/* 密保答案规范化：去首尾空白、合并连续空格、转小写后哈希，
   注册/重置/修改三处保持同一算法 */
export function normalizeAnswer(answer) {
  return String(answer || '').trim().replace(/\s+/g, ' ').toLowerCase()
}

/* 预设密保问题（注册/修改共用） */
export const SECURITY_QUESTIONS = [
  '您的出生城市是哪里？',
  '您小学的名字是什么？',
  '您母亲的姓氏是什么？',
  '您第一位老师的姓名是？'
]

export const useAuthStore = defineStore('auth', {
  state: () => ({
    session: getSession(), // 当前登录用户名（刷新保持）
    userData: null // 当前登录用户数据
  }),

  getters: {
    isLoggedIn: (s) => !!s.session,
    username: (s) => s.session || '',
    profile: (s) => (s.userData ? s.userData.profile : { nickname: '', avatar: '', createdAt: 0 }),
    nickname: (s) => (s.userData && s.userData.profile.nickname) || s.session || '学习者',
    theme: (s) => (s.userData ? s.userData.theme : 'blue')
  },

  actions: {
    _loadUserData() {
      if (this.session) {
        this.userData = getUserData(this.session)
        // 兼容旧数据：昵称默认为用户名
        if (!this.userData.profile.nickname) {
          this.userData.profile.nickname = this.session
          this._persist()
        }
      } else {
        this.userData = null
      }
    },

    _persist() {
      if (this.session && this.userData) {
        saveUserData(this.session, this.userData)
      }
    },

    /* 注册：本地查重 → 云端查重/注册（含密保）→ 密码哈希 → 自动登录 */
    async register({ username, password, nickname = '', securityQuestion = '', securityAnswer = '' }) {
      username = String(username || '').trim()
      if (!/^[a-zA-Z0-9_]{2,20}$/.test(username)) {
        return { ok: false, msg: '用户名需为 2~20 位字母、数字或下划线' }
      }
      // 用户名查重以云端为准（本地账号表只是展示缓存，可能过期）
      if (String(password || '').length < 6) {
        return { ok: false, msg: '密码长度至少 6 位' }
      }
      // 密保：选了问题就必须填答案（找回密码的唯一自助通道）
      if (securityQuestion && !normalizeAnswer(securityAnswer)) {
        return { ok: false, msg: '请填写密保问题答案' }
      }
      const hash = await sha256(password)
      const nick = String(nickname || '').trim() || username
      const answerHash = securityQuestion && normalizeAnswer(securityAnswer)
        ? await sha256(normalizeAnswer(securityAnswer))
        : ''

      /* 云端注册（账号体系全云端：占用/离线均失败，本地账号表仅写展示缓存） */
      const cloud = await cloudRegister(username, hash, nick, securityQuestion, answerHash)
      if (!cloud.ok) {
        return { ok: false, msg: cloud.msg }
      }

      const accounts = getAccounts()
      accounts.push({
        username,
        passwordHash: hash,
        createdAt: Date.now(),
        nickname: nick,
        securityQuestion,
        securityAnswerHash: answerHash
      })
      saveAccounts(accounts)

      const data = getUserData(username)
      data.profile.nickname = nick
      data.onboardingDone = false
      saveUserData(username, data)

      setSession(username)
      this.session = username
      this._loadUserData()
      afterRegister(username)
      return { ok: true, msg: '注册成功，已自动登录' }
    },

    /* 登录：完全走云端校验（账号体系全云端，离线不可登录）。
       本地账号表仅作展示缓存，不参与任何校验决策。 */
    async login({ username, password }) {
      username = String(username || '').trim()
      const hash = await sha256(String(password || ''))

      /* 1) 云端校验 */
      const cloud = await checkCloudAuth(username, hash)
      if (cloud.kind === 'ok') {
        // 本地账号表补写/更新（展示缓存），云端进度合并到本地缓存
        ensureLocalAccount(username, hash, cloud.nickname, cloud.data && cloud.data.profile && cloud.data.profile.createdAt)
        if (cloud.data) {
          const merged = mergeUserData(getUserData(username), cloud.data)
          saveUserData(username, merged)
          applyCloudPrefs(merged.prefs) // 云端偏好（发音性别/学习模式）落地
        }
        setSession(username)
        this.session = username
        this._loadUserData()
        setCloudToken(cloud.token)
        queuePush(username)
        return { ok: true, msg: '登录成功' }
      }
      if (cloud.kind === 'denied') {
        return { ok: false, msg: cloud.msg }
      }
      if (cloud.kind === 'no_user') {
        // 云端建库前注册的本地遗留老账号：凭输入的密码一次性迁移上云后正常登录
        const acc = findAccount(username)
        if (!acc) return { ok: false, msg: '用户名不存在' }
        const migrated = await migrateLocalAccount(username, hash, acc.nickname)
        if (!migrated) return { ok: false, msg: '当前离线，无法登录（账号体系已全云端，请联网后重试）' }
        setSession(username)
        this.session = username
        this._loadUserData()
        setCloudToken(await computeToken(username, hash))
        queuePush(username)
        return { ok: true, msg: '登录成功（本地老账号已迁移上云）' }
      }
      /* 离线 */
      return { ok: false, msg: '当前离线，无法登录（账号体系已全云端，请联网后重试）' }
    },

    /* 忘记密码·第一步：查询密保问题（全云端） */
    async getSecurityQuestion(username) {
      username = String(username || '').trim()
      const cloud = await fetchSecurityQuestion(username)
      if (cloud.kind === 'ok') return { kind: 'ok', question: cloud.question }
      if (cloud.kind === 'no_user') return { kind: 'no_user', msg: '用户名不存在' }
      if (cloud.kind === 'no_question') return { kind: 'no_question', msg: '该账号未设置密保问题，请联系管理员重置' }
      return { kind: 'offline', msg: '当前离线，无法验证身份（请联网后重试）' }
    },

    /* 忘记密码·第二步：凭密保答案重置（全云端，必须联网） */
    async resetPasswordSecure({ username, answer, newPassword }) {
      username = String(username || '').trim()
      if (String(newPassword || '').length < 6) {
        return { ok: false, msg: '新密码长度至少 6 位' }
      }
      const newHash = await sha256(String(newPassword))
      const answerHash = await sha256(normalizeAnswer(answer))
      const cloud = await cloudResetSecure(username, answerHash, newHash)
      if (!cloud.ok) return { ok: false, msg: cloud.msg }
      // 本地账号缓存同步改哈希；没有则补写（展示缓存）
      const accounts = getAccounts()
      const local = accounts.find((a) => a.username === username)
      if (local) {
        local.passwordHash = newHash
      } else {
        accounts.push({ username, passwordHash: newHash, createdAt: Date.now(), nickname: username })
      }
      saveAccounts(accounts)
      return { ok: true, msg: '密码已重置，请使用新密码登录' }
    },

    /* 登录态下设置/修改密保问题（全云端，必须联网） */
    async setSecurityQuestion({ question, answer }) {
      if (!this.isLoggedIn) return { ok: false, msg: '请先登录' }
      if (!question) return { ok: false, msg: '请选择或输入密保问题' }
      if (!normalizeAnswer(answer)) return { ok: false, msg: '请填写密保答案' }
      const answerHash = await sha256(normalizeAnswer(answer))

      const cloud = await cloudSecurityUpdate(this.session, question, answerHash)
      if (!cloud.ok) return { ok: false, msg: cloud.msg }
      // 云端成功后同步本地展示缓存
      const accounts = getAccounts()
      const acc = accounts.find((a) => a.username === this.session)
      if (acc) {
        acc.securityQuestion = question
        acc.securityAnswerHash = answerHash
        saveAccounts(accounts)
      }
      return { ok: true, msg: '密保问题已更新' }
    },

    /* 退出登录 */
    logout() {
      clearSession()
      this.session = null
      this.userData = null
      clearCloudToken()
    },

    /* 从本地存储重新读取登录态与用户数据（同步码导入等外部写入后调用） */
    refresh() {
      this.session = getSession()
      this._loadUserData()
    },

    /* 更新个人资料 */
    updateProfile({ nickname, avatar }) {
      if (!this.userData) return
      if (typeof nickname === 'string' && nickname.trim()) {
        this.userData.profile.nickname = nickname.trim()
        // 同步账号表昵称
        const accounts = getAccounts()
        const acc = accounts.find((a) => a.username === this.session)
        if (acc) acc.nickname = nickname.trim()
        saveAccounts(accounts)
      }
      if (typeof avatar === 'string') {
        this.userData.profile.avatar = avatar.trim()
      }
      this._persist()
    },

    /* 主题偏好：跟随账号（未登录时写入访客键） */
    setTheme(theme) {
      if (this.isLoggedIn && this.userData) {
        this.userData.theme = theme
        this._persist()
      } else {
        setGuestTheme(theme)
      }
    },

    getEffectiveTheme() {
      return this.isLoggedIn ? this.theme : getGuestTheme()
    },

    markOnboardingDone() {
      if (this.userData) {
        this.userData.onboardingDone = true
        this._persist()
      }
    },

    markPlacementDone() {
      if (this.userData) {
        this.userData.placementDone = true
        this._persist()
      }
    }
  }
})
