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
  setCloudToken
} from '../services/cloudSync'

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

    /* 注册：本地查重 → 云端查重/注册 → 密码哈希 → 自动登录 */
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
      const nick = String(nickname || '').trim() || username

      /* 云端查重与注册（在线时云端权威：用户名已被云端占用则提前失败，
         避免本地注册成功而云端冲突；离线时跳过，联网后自动迁移上云） */
      const cloud = await cloudRegister(username, hash, nick)
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
        nickname: nick
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

    /* 忘记密码：本地重置 + 云端同步（旧哈希派生凭证，云端无账号则直接注册） */
    async resetPassword({ username, newPassword }) {
      username = String(username || '').trim()
      const acc = findAccount(username)
      if (!acc) {
        return { ok: false, msg: '用户名不存在，无法重置' }
      }
      if (String(newPassword || '').length < 6) {
        return { ok: false, msg: '新密码长度至少 6 位' }
      }
      const newHash = await sha256(String(newPassword))
      const oldHash = acc.passwordHash

      /* 云端更新（在线时执行；失败不阻塞本地重置） */
      const cloud = await afterReset(username, oldHash, newHash)
      const cloudMsg = cloud && cloud.ok === false ? '（云端更新失败，联网后请重新重置）' : ''

      const accounts = getAccounts()
      const target = accounts.find((a) => a.username === username)
      target.passwordHash = newHash
      saveAccounts(accounts)
      return { ok: true, msg: `密码已重置，请使用新密码登录${cloudMsg}` }
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
