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
  getGuestTheme,
  setGuestTheme
} from '../services/storage'
import { sha256 } from '../services/crypto'

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

    /* 注册：用户名唯一性校验 → 密码哈希 → 自动登录 */
    async register({ username, password, nickname = '' }) {
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
      const hash = await sha256(password)
      const accounts = getAccounts()
      accounts.push({
        username,
        passwordHash: hash,
        createdAt: Date.now(),
        nickname: String(nickname || '').trim() || username
      })
      saveAccounts(accounts)

      const data = getUserData(username)
      data.profile.nickname = String(nickname || '').trim() || username
      data.onboardingDone = false
      saveUserData(username, data)

      setSession(username)
      this.session = username
      this._loadUserData()
      return { ok: true, msg: '注册成功，已自动登录' }
    },

    /* 登录 */
    async login({ username, password }) {
      username = String(username || '').trim()
      const acc = findAccount(username)
      if (!acc) {
        return { ok: false, msg: '用户名不存在' }
      }
      const hash = await sha256(String(password || ''))
      if (hash !== acc.passwordHash) {
        return { ok: false, msg: '密码错误' }
      }
      setSession(username)
      this.session = username
      this._loadUserData()
      return { ok: true, msg: '登录成功' }
    },

    /* 忘记密码：校验用户名存在后重置新密码 */
    async resetPassword({ username, newPassword }) {
      username = String(username || '').trim()
      const acc = findAccount(username)
      if (!acc) {
        return { ok: false, msg: '用户名不存在，无法重置' }
      }
      if (String(newPassword || '').length < 6) {
        return { ok: false, msg: '新密码长度至少 6 位' }
      }
      const hash = await sha256(String(newPassword))
      const accounts = getAccounts()
      const target = accounts.find((a) => a.username === username)
      target.passwordHash = hash
      saveAccounts(accounts)
      return { ok: true, msg: '密码已重置，请使用新密码登录' }
    },

    /* 退出登录 */
    logout() {
      clearSession()
      this.session = null
      this.userData = null
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
