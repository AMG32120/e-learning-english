/* ============================================================
   stores/auth.js —— 登录态 / 用户信息状态
   ============================================================ */
import { defineStore } from 'pinia'
import {
  accountExists,
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
  afterReset,
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
      if (accountExists(username)) {
        return { ok: false, msg: '该用户名已被注册，请换一个' }
      }
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

      /* 云端查重与注册（在线时云端权威：用户名已被云端占用则提前失败，
         避免本地注册成功而云端冲突；离线时跳过，联网后自动迁移上云） */
      const cloud = await cloudRegister(username, hash, nick, securityQuestion, answerHash)
      if (!cloud.ok) {
        return { ok: false, msg: cloud.msg }
      }
      if (accountExists(username)) {
        return { ok: false, msg: '该用户名已被注册，请换一个' }
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
      if (cloud.offline) {
        // 离线注册：仍写入本地凭证，联网后由迁移/推送补同步
        setCloudToken(await computeToken(username, hash))
      }
      afterRegister(username)
      return { ok: true, msg: '注册成功，已自动登录' }
    },

    /* 登录：云端校验优先（在线时云端权威），本地兜底（离线可用） */
    async login({ username, password }) {
      username = String(username || '').trim()
      const hash = await sha256(String(password || ''))
      let acc = findAccount(username)

      /* 1) 云端校验（在线时进行） */
      const cloud = await checkCloudAuth(username, hash)
      if (cloud.kind === 'ok') {
        // 云端认可：本地账号缺失（新设备）或本地哈希过期时以云端为准
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
        // 云端存在该账号但密码不一致：若本地哈希与输入一致（曾在离线状态改过密码），
        // 以本地为准继续登录（云端同步将不可用，控制台提示）；否则按云端拒绝处理
        if (acc && acc.passwordHash === hash) {
          console.warn('[cloud] 云端密码与本地不一致，本次仅本地登录，进度暂不同步。可在云端设备改回一致密码后恢复同步。')
        } else {
          return { ok: false, msg: cloud.msg }
        }
      }

      /* 2) 本地校验（云端无此账号或离线时兜底） */
      if (!acc) {
        return { ok: false, msg: '用户名不存在' }
      }
      if (acc.passwordHash !== hash) {
        return { ok: false, msg: '密码错误' }
      }
      setSession(username)
      this.session = username
      this._loadUserData()
      setCloudToken(await computeToken(username, hash))
      if (cloud.kind === 'no_user') {
        // 本地注册的老账号尚未上云：自动迁移（后台执行，不阻塞登录）
        migrateLocalAccount(username, hash, acc.nickname).catch(() => { /* ignore */ })
      } else {
        // 离线登录：联网后由队列推送补同步
        queuePush(username)
      }
      return { ok: true, msg: '登录成功' }
    },

    /* 忘记密码·第一步：查询密保问题（云端优先，本地账号无云端问题时降级） */
    async getSecurityQuestion(username) {
      username = String(username || '').trim()
      const cloud = await fetchSecurityQuestion(username)
      if (cloud.kind === 'ok') return { kind: 'ok', question: cloud.question }
      if (cloud.kind === 'no_user') {
        // 云端无此账号：看本地（老账号离线迁移场景）
        if (findAccount(username)) return { kind: 'no_question', msg: '该账号尚未上云或未设置密保问题，仅可离线重置本地密码' }
        return { kind: 'no_user', msg: '用户名不存在' }
      }
      if (cloud.kind === 'no_question') return { kind: 'no_question', msg: '该账号未设置密保问题，请联系管理员重置' }
      // 离线：本地兜底（老密码哈希派生凭证的老流程仍可用）
      if (findAccount(username)) return { kind: 'offline', msg: '当前离线，将直接重置本地密码（联网后请重新同步）' }
      return { kind: 'offline', msg: '当前离线且本地无此账号记录，无法重置' }
    },

    /* 忘记密码·第二步：凭密保答案重置（云端密保优先，本地老流程兜底） */
    async resetPasswordSecure({ username, answer, newPassword, useLocalFallback = false }) {
      username = String(username || '').trim()
      if (String(newPassword || '').length < 6) {
        return { ok: false, msg: '新密码长度至少 6 位' }
      }
      const newHash = await sha256(String(newPassword))
      const acc = findAccount(username)

      /* 1) 云端密保通道：凭答案哈希重置 */
      if (!useLocalFallback) {
        const answerHash = await sha256(normalizeAnswer(answer))
        const cloud = await cloudResetSecure(username, answerHash, newHash)
        if (!cloud.ok) return { ok: false, msg: cloud.msg }
        // 本地有此账号则同步改本地哈希；没有则补写（新设备找回后可离线登录）
        const accounts = getAccounts()
        const local = accounts.find((a) => a.username === username)
        if (local) {
          local.passwordHash = newHash
        } else {
          accounts.push({ username, passwordHash: newHash, createdAt: Date.now(), nickname: username })
        }
        saveAccounts(accounts)
        return { ok: true, msg: '密码已重置，请使用新密码登录' }
      }

      /* 2) 本地兜底通道：旧哈希派生凭证（离线 / 老账号未上云） */
      if (!acc) {
        return { ok: false, msg: '用户名不存在，无法重置' }
      }
      const oldHash = acc.passwordHash
      const cloud = await afterReset(username, oldHash, newHash)
      const cloudMsg = cloud && cloud.ok === false ? '（云端更新失败，联网后请重新重置）' : ''
      const accounts = getAccounts()
      const local = accounts.find((a) => a.username === username)
      if (local) local.passwordHash = newHash
      saveAccounts(accounts)
      return { ok: true, msg: `密码已重置，请使用新密码登录${cloudMsg}` }
    },

    /* 登录态下设置/修改密保问题（个人中心·账号安全） */
    async setSecurityQuestion({ question, answer }) {
      if (!this.isLoggedIn) return { ok: false, msg: '请先登录' }
      if (!question) return { ok: false, msg: '请选择或输入密保问题' }
      if (!normalizeAnswer(answer)) return { ok: false, msg: '请填写密保答案' }
      const answerHash = await sha256(normalizeAnswer(answer))

      // 本地账号表同步（离线兜底）
      const accounts = getAccounts()
      const acc = accounts.find((a) => a.username === this.session)
      if (acc) {
        acc.securityQuestion = question
        acc.securityAnswerHash = answerHash
        saveAccounts(accounts)
      }
      // 云端更新（离线静默，联网后建议重新设置一次）
      const cloud = await cloudSecurityUpdate(this.session, question, answerHash)
      if (!cloud.ok) return { ok: false, msg: cloud.msg }
      return { ok: true, msg: cloud.offline ? '密保已保存到本地，联网后将同步云端（当前云端未更新）' : '密保问题已更新' }
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
