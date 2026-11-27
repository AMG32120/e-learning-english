/* ============================================================
   stores/progress.js —— 闯关进度 / 打卡 / 复习池 / 徽章状态
   按账号隔离：仅操作当前登录用户的 user_<username> 数据。
   解锁逻辑（动态推导，不冗余存储）：
   - 同一等级：第 1 关默认解锁；前一关 completed 后解锁下一关；
   - 跨等级：上一等级完成度 ≥ 80% 关卡通关后解锁下一等级。
   徽章规则表：按 PLAN §3.5 的 16 项规则实现，本地进度数据触发。
   ============================================================ */
import { defineStore } from 'pinia'
import { LEVELS, getStageById, getStageWords, getLevel, LEVEL_UNLOCK_RATIO } from '../data/levels'
import { getUserData, saveUserData } from '../services/storage'
import { getWordsL2, getL5Themes } from '../services/wordData'
import { findWord } from '../services/dictionary'
import { useAuthStore } from './auth'
import { isFreeMode } from '../services/studyMode'

function pad(n) {
  return n < 10 ? `0${n}` : `${n}`
}

export function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function addDays(base, n) {
  const d = new Date(base)
  d.setDate(d.getDate() + n)
  return d
}

/* 单日学习量口径：题目/拼写/听写/复习次数；关卡本身按 5 题折算（未记录题数时） */
export function dailyVolume(rec) {
  if (!rec) return 0
  const direct = (rec.quiz || 0) + (rec.spell || 0) + (rec.dict || 0) + (rec.review || 0)
  if (direct > 0) return direct
  return (rec.stage || 0) * 5
}

/* ---------- 徽章规则表（PLAN §3.5） ---------- */
export const BADGES = [
  { id: 'first_stage', name: '初次通关', icon: 'star', desc: '完成第 1 个关卡' },
  { id: 'letter_graduate', name: '字母毕业', icon: 'letter', desc: '通关 L1 等级综合测验' },
  { id: 'vocab_newbie', name: '词汇新手', icon: 'book', desc: '累计掌握 100 个单词' },
  { id: 'vocab_elite', name: '词汇达人', icon: 'books', desc: '累计掌握 500 个单词' },
  { id: 'vocab_master', name: '词汇大师', icon: 'crown', desc: '累计掌握 2000+ 个单词' },
  { id: 'dialogue_star', name: '对话之星', icon: 'chat', desc: '完成 L6 全部场景关卡' },
  { id: 'grammar_scholar', name: '语法学者', icon: 'pen', desc: '通关 L7 等级综合测验' },
  { id: 'listening_pro', name: '听力达人', icon: 'headphone', desc: '完成 L13 全部听力材料' },
  { id: 'reading_pioneer', name: '阅读先锋', icon: 'bookopen', desc: '完成 L14 全部阅读文章' },
  { id: 'exam_sprint', name: '应试冲刺', icon: 'target', desc: '通关 L16 全部仿真题关卡' },
  { id: 'all_graduate', name: '全站毕业', icon: 'trophy', desc: '通关全部 16 个等级' },
  { id: 'streak_3', name: '连续打卡 3 天', icon: 'fire', desc: '打卡连续 3 天' },
  { id: 'streak_7', name: '连续打卡 7 天', icon: 'shine', desc: '打卡连续 7 天' },
  { id: 'streak_30', name: '连续打卡 30 天', icon: 'clock', desc: '打卡连续 30 天' },
  { id: 'full_score', name: '满分挑战', icon: 'hundred', desc: '任意关卡 3 星完全通关' },
  { id: 'review_master', name: '复习标兵', icon: 'loop', desc: '累计完成 50 次复习任务' }
]

export function badgeInfo(id) {
  return BADGES.find((b) => b.id === id) || { id, name: id, icon: 'star', desc: '' }
}

/* 等级综合测验毕业徽章映射（PLAN §3.4.4 / §3.5；等级细分后 1=字母、7=语法） */
export const LEVEL_EXAM_BADGES = {
  1: 'letter_graduate',
  7: 'grammar_scholar'
}

/* ============================================================
   进度兼容迁移：旧关卡 ID（12 级结构）→ 新关卡 ID（16 级结构）
   迁移规则（近似迁移，不丢进度）：
   1. 非词汇关固定平移：L4 对话→L6、L5 语法→L7、L10 听说→L13、
      L11 阅读→L14、L12 仿真→L16（各自序号不变；L1 字母不变）；
   2. 词汇关按「主题池 + 分组」近似映射：用旧分段算法（L2/L3 对半分、
      L6~L9 四等分且词组归 L9）基于当前词库重建旧关卡主题分配，
      再在新结构中查找同 pool 且同分组（S1 认词 / S2 巩固）的关卡。
      因等级细分改变了主题切段位置，个别旧关可能映射到不同等级的
      同主题关卡，属合理的近似迁移；
   3. 无法匹配的旧键保留原值（新结构下自然失效，不覆盖其他进度）；
   4. 等级综合测验 levelExams 按近似表迁移（4→6、5→7、6→8、7→9、
      8→10、9→12、10→13、11→14、12→16，2/3 保留）；
   5. recommendedStage 同步映射。
   函数为幂等：重复调用时旧键已不存在，不产生二次变更。
   ============================================================ */
const LEGACY_FIXED_MAP = { 4: 6, 5: 7, 10: 13, 11: 14, 12: 16 }
const LEGACY_FIXED_COUNTS = { 4: 6, 5: 8, 10: 16, 11: 16, 12: 8 }
const LEGACY_EXAM_MAP = { 4: 6, 5: 7, 6: 8, 7: 9, 8: 10, 9: 12, 10: 13, 11: 14, 12: 16 }

/* 按旧分段算法重建旧词汇关的「pool + 分组」归属 */
function rebuildLegacyStageMap() {
  const map = new Map()
  const pushLevel = (lv, themes) => {
    themes.forEach((t, ti) => {
      const words = t.words || []
      if (!words.length) return
      const half = Math.ceil(words.length / 2)
      const groups = [words.slice(0, half), words.slice(half)]
      groups.forEach((g, gi) => {
        if (!g.length) return
        map.set(`L${lv}-U${ti + 1}-S${gi + 1}`, { pool: t.pool, group: gi === 0 ? 'first' : 'second' })
      })
    })
  }
  const l2 = getWordsL2() || {}
  const l2Keys = Object.keys(l2)
  const mid = Math.ceil(l2Keys.length / 2)
  pushLevel(2, l2Keys.slice(0, mid).map((k) => ({ pool: `l2_${k}`, words: l2[k] || [] })))
  pushLevel(3, l2Keys.slice(mid).map((k) => ({ pool: `l2_${k}`, words: l2[k] || [] })))
  const all = getL5Themes() || []
  const wordPacks = all.filter((t) => !String(t.id).startsWith('ph_'))
  const phrasePacks = all.filter((t) => String(t.id).startsWith('ph_'))
  const per = Math.ceil(wordPacks.length / 4)
  const segs = [0, 1, 2, 3].map((i) => wordPacks.slice(i * per, (i + 1) * per))
  segs[3] = segs[3].concat(phrasePacks)
  segs.forEach((seg, idx) => {
    pushLevel(6 + idx, seg.map((t) => ({ pool: t.id, words: t.words || [] })))
  })
  return map
}

/* 新结构词汇关的「pool + 分组」→ 新关卡 ID 索引 */
function buildNewStageIndex() {
  const idx = new Map()
  for (const lv of LEVELS) {
    for (const st of lv.stages) {
      if (!['word_choice', 'word_match', 'word_spell'].includes(st.type)) continue
      const pool = st.content && st.content.pool
      if (!pool) continue
      const group = /-S1$/.test(st.id) ? 'first' : 'second'
      const key = `${pool}|${group}`
      if (!idx.has(key)) idx.set(key, st.id)
    }
  }
  return idx
}

/* 执行迁移：有变更返回 true */
export function migrateProgress(data) {
  if (!data || !data.progress || !data.progress.stages) return false
  const stages = data.progress.stages
  let changed = false

  const fixed = {}
  for (const [oldLv, newLv] of Object.entries(LEGACY_FIXED_MAP)) {
    for (let n = 1; n <= LEGACY_FIXED_COUNTS[oldLv]; n++) fixed[`L${oldLv}-${n}`] = `L${newLv}-${n}`
  }
  const legacy = rebuildLegacyStageMap()
  const newIdx = buildNewStageIndex()

  const next = {}
  for (const [key, rec] of Object.entries(stages)) {
    let target = fixed[key]
    if (!target && legacy.has(key)) {
      const info = legacy.get(key)
      target = newIdx.get(`${info.pool}|${info.group}`)
    }
    if (target && target !== key) {
      // 冲突时保留原键，避免覆盖其他进度
      if (!next[target]) {
        next[target] = rec
        changed = true
        continue
      }
    }
    next[key] = rec
  }
  data.progress.stages = next

  // recommendedStage 同步映射
  const rec = data.progress.recommendedStage
  if (rec) {
    let target = fixed[rec]
    if (!target && legacy.has(rec)) {
      const info = legacy.get(rec)
      target = newIdx.get(`${info.pool}|${info.group}`)
    }
    if (target && target !== rec) {
      data.progress.recommendedStage = target
      changed = true
    }
  }

  // 等级综合测验迁移（仅补缺失键）
  if (data.levelExams) {
    for (const [oldLv, newLv] of Object.entries(LEGACY_EXAM_MAP)) {
      if (data.levelExams[`L${oldLv}`] && !data.levelExams[`L${newLv}`]) {
        data.levelExams[`L${newLv}`] = data.levelExams[`L${oldLv}`]
        changed = true
      }
    }
  }

  return changed
}

export const useProgressStore = defineStore('progress', {
  state: () => ({
    data: null // 当前用户数据（含 progress / reviewPool / checkins / badges / stats）
  }),

  getters: {
    ready: (s) => !!s.data,

    stages(s) {
      return s.data ? s.data.progress.stages : {}
    },

    /* 关卡是否解锁（自由模式下全部开放） */
    isStageUnlocked(s) {
      const self = this
      return (stageId) => {
        if (isFreeMode()) return true
        if (!s.data) return false
        const stage = getStageById(stageId)
        if (!stage) return false
        if (!self.isLevelUnlocked(stage.level)) return false
        if (stage.stage === 1) return true
        // 按等级内关卡顺序取前一关（兼容 L2-1 与 L2-U1-S1 两种 ID 形态）
        const lv = getLevel(stage.level)
        if (!lv) return false
        const idx = lv.stages.findIndex((x) => x.id === stage.id)
        if (idx <= 0) return true
        const prev = s.data.progress.stages[lv.stages[idx - 1].id]
        return !!(prev && prev.completed)
      }
    },

    /* 等级是否解锁（自由模式下全部开放） */
    isLevelUnlocked: (s) => (level) => {
      if (isFreeMode()) return true
      if (!s.data) return false
      if (level <= 1) return true
      const prevLevel = getLevel(level - 1)
      if (!prevLevel) return false
      const total = prevLevel.stages.length
      const completed = prevLevel.stages.filter(
        (st) => s.data.progress.stages[st.id] && s.data.progress.stages[st.id].completed
      ).length
      return total > 0 && completed / total >= LEVEL_UNLOCK_RATIO
    },

    /* 等级进度 */
    getLevelProgress: (s) => (level) => {
      const lv = getLevel(level)
      if (!lv) return { total: 0, completed: 0, percent: 0 }
      const total = lv.stages.length
      const completed = lv.stages.filter(
        (st) => s.data && s.data.progress.stages[st.id] && s.data.progress.stages[st.id].completed
      ).length
      return { total, completed, percent: total ? Math.round((completed / total) * 100) : 0 }
    },

    /* 等级完成度是否达到综合测验解锁阈值（≥80%） */
    isLevelExamUnlocked(s) {
      const self = this
      return (level) => {
        if (!s.data) return false
        if (!self.isLevelUnlocked(level)) return false
        const p = self.getLevelProgress(level)
        return p.total > 0 && p.completed / p.total >= LEVEL_UNLOCK_RATIO
      }
    },

    /* 等级综合测验是否已通过 */
    isLevelExamPassed: (s) => (level) => {
      return !!(s.data && s.data.levelExams && s.data.levelExams[`L${level}`])
    },

    /* 当前推荐关卡 */
    recommendedStage(s) {
      if (!s.data) return 'L1-1'
      return s.data.progress.recommendedStage || 'L1-1'
    },

    /* 今日是否已打卡 */
    checkedInToday(s) {
      return !!(s.data && s.data.checkins && s.data.checkins[todayKey()])
    },

    /* 今日待复习项数（dueDate <= 今日） */
    reviewDueCount(s) {
      if (!s.data) return 0
      const now = todayKey()
      return Object.values(s.data.reviewPool || {}).filter((r) => r.dueDate <= now).length
    },

    /* 复习池总项数 */
    reviewPoolCount(s) {
      return s.data ? Object.keys(s.data.reviewPool || {}).length : 0
    },

    /* 明日待复习项数（用于空状态预览，激励回访） */
    reviewTomorrowCount(s) {
      if (!s.data) return 0
      const d = new Date()
      d.setDate(d.getDate() + 1)
      const key = todayKey(d)
      return Object.values(s.data.reviewPool || {}).filter((r) => r.dueDate === key).length
    },

    totalCompletedStages(s) {
      if (!s.data) return 0
      return Object.values(s.data.progress.stages).filter((r) => r.completed).length
    },

    /* 累计掌握单词数（已通关关卡词条去重并集） */
    masteredWordCount(s) {
      return s.data && s.data.stats && Array.isArray(s.data.stats.masteredWords) ? s.data.stats.masteredWords.length : 0
    },

    /* 连续打卡天数（含今日；从今天向前连续） */
    streakDays(s) {
      if (!s.data || !s.data.checkins) return 0
      let n = 0
      const d = new Date()
      if (!s.data.checkins[todayKey(d)]) return 0
      while (s.data.checkins[todayKey(d)]) {
        n += 1
        d.setDate(d.getDate() - 1)
      }
      return n
    },

    /* ---------- 生词本 / 错题本 ---------- */

    wordbookCount(s) {
      return s.data && Array.isArray(s.data.wordbook) ? s.data.wordbook.length : 0
    },

    /* 未消化的错题数（重练答对后移除） */
    mistakeCount(s) {
      return s.data && Array.isArray(s.data.mistakes)
        ? s.data.mistakes.filter((m) => !m.resolved).length
        : 0
    },

    /* 生词本条目（附带词条信息，含已删除词条的容错） */
    wordbookEntries(s) {
      if (!s.data || !Array.isArray(s.data.wordbook)) return []
      return s.data.wordbook
        .map((key) => ({ itemKey: key, ...findWord(key) }))
        .filter((e) => e.word)
    },

    /* 累计复习完成次数 */
    reviewDoneCount(s) {
      return s.data && s.data.stats ? s.data.stats.reviewDone || 0 : 0
    },

    /* ---------- 每日目标 / 学习量 ---------- */

    /* 每日目标题/词次；0 表示不设目标 */
    dailyGoal: (s) => (s.data && typeof s.data.dailyGoal === 'number' ? s.data.dailyGoal : 20),

    /* 今日学习明细 */
    todayStats(s) {
      const empty = { stage: 0, quiz: 0, quizCorrect: 0, review: 0, spell: 0, dict: 0, flash: 0 }
      if (!s.data || !s.data.stats || !s.data.stats.daily) return empty
      return { ...empty, ...(s.data.stats.daily[todayKey()] || {}) }
    },

    /* 今日学习量（做题 + 拼写 + 听写 + 复习；关卡按 5 题折算） */
    todayStudyCount() {
      return dailyVolume(this.todayStats)
    },

    /* 今日目标进度 0-100 */
    todayGoalPercent() {
      const goal = this.dailyGoal
      if (!goal) return 0
      return Math.min(100, Math.round((this.todayStudyCount / goal) * 100))
    },

    /* ---------- 易错词分析 ---------- */

    /* 易错词排行：[{ itemKey, word, zh, ipa, wrongCount }]，按错误次数降序 */
    errorWordRanking(s) {
      if (!s.data) return []
      const map = new Map()
      // 1) 复习池的 wrongCount 是主要来源
      for (const [key, item] of Object.entries(s.data.reviewPool || {})) {
        const info = findWord(key)
        if (!info) continue
        const prev = map.get(info.word) || { itemKey: key, word: info.word, zh: info.zh, ipa: info.ipa, wrongCount: 0 }
        prev.wrongCount += item.wrongCount || 1
        map.set(info.word, prev)
      }
      // 2) 错题本里未消化的题目也按单词归类（q 为单词的题）
      for (const m of s.data.mistakes || []) {
        if (m.resolved) continue
        const key = String(m.q || '').match(/^[a-zA-Z][a-zA-Z'-]*$/) ? m.q : ''
        if (!key) continue
        const info = findWord(key)
        if (!info) continue
        const prev = map.get(info.word) || { itemKey: key, word: info.word, zh: info.zh, ipa: info.ipa, wrongCount: 0 }
        prev.wrongCount += 1
        map.set(info.word, prev)
      }
      return [...map.values()].sort((a, b) => b.wrongCount - a.wrongCount)
    },

    /* 拼写/听写正确率（用于薄弱点提示） */
    practiceAccuracy(s) {
      let total = 0
      let correct = 0
      const daily = (s.data && s.data.stats && s.data.stats.daily) || {}
      for (const d of Object.values(daily)) {
        total += (d.spell || 0) + (d.dict || 0)
        correct += d.spellCorrect || 0
        correct += d.dictCorrect || 0
      }
      return { total, correct, percent: total ? Math.round((correct / total) * 100) : 0 }
    },

    badges(s) {
      return s.data ? s.data.badges : []
    },

    /* 通过等级总数（等级完成度 ≥80%） */
    passedLevelCount(s) {
      if (!s.data) return 0
      return LEVELS.filter((lv) => {
        const total = lv.stages.length
        const completed = lv.stages.filter((st) => s.data.progress.stages[st.id] && s.data.progress.stages[st.id].completed).length
        return total > 0 && completed / total >= LEVEL_UNLOCK_RATIO
      }).length
    }
  },

  actions: {
    /* 加载当前用户进度（登录后 / 刷新后调用） */
    loadForCurrentUser() {
      const auth = useAuthStore()
      if (auth.isLoggedIn) {
        this.data = getUserData(auth.username)
        // 等级细分后的进度兼容迁移（幂等；有变更即持久化）
        if (migrateProgress(this.data)) this._persist()
        this._normalizeReviewPool()
      } else {
        this.data = null
      }
    },

    /* 复习池键归一化：清理历史遗留的不可读键（L3-2:1 / quiz-123 / exam-L1-0） */
    _normalizeReviewPool() {
      if (!this.data || !this.data.reviewPool) return
      const pool = this.data.reviewPool
      const next = {}
      let changed = false
      for (const [key, item] of Object.entries(pool)) {
        let clean = key
        if (key.startsWith('flashcard:')) clean = key.slice(10)
        else if (key.startsWith('practice:')) clean = key.slice(9)
        const isLegacyJunk = /^(quiz|exam)-\d/.test(clean) || /^L\d+-\d+:\d+$/.test(clean)
        if (isLegacyJunk) {
          changed = true
          continue
        }
        if (clean !== key) changed = true
        if (!next[clean]) next[clean] = { ...item, itemKey: clean }
        else next[clean].wrongCount = (next[clean].wrongCount || 1) + (item.wrongCount || 1)
      }
      if (changed) {
        this.data.reviewPool = next
        this._persist()
      }
    },

    _persist() {
      const auth = useAuthStore()
      if (auth.isLoggedIn && this.data) {
        // 同步 auth 层最新字段，避免用旧快照覆盖引导状态 / 主题
        if (auth.userData) {
          this.data.onboardingDone = auth.userData.onboardingDone
          this.data.placementDone = auth.userData.placementDone
          this.data.theme = auth.userData.theme
        }
        saveUserData(auth.username, this.data)
      }
    },

    _touchCheckin() {
      // 完成 1 个关卡或 1 次复习任务即算当日打卡
      if (!this.data) return
      this.data.checkins = this.data.checkins || {}
      this.data.checkins[todayKey()] = true
    },

    _grantBadge(badgeId) {
      if (!this.data) return
      this.data.badges = this.data.badges || []
      if (!this.data.badges.includes(badgeId)) {
        this.data.badges.push(badgeId)
      }
    },

    _ensureStats() {
      if (!this.data) return
      this.data.stats = this.data.stats || { quizCount: 0, quizCorrect: 0, dailySentence: { date: '', key: '' }, masteredWords: [], reviewDone: 0 }
      if (!Array.isArray(this.data.stats.masteredWords)) this.data.stats.masteredWords = []
      if (typeof this.data.stats.reviewDone !== 'number') this.data.stats.reviewDone = 0
      if (!this.data.stats.daily || typeof this.data.stats.daily !== 'object') this.data.stats.daily = {}
      if (!Array.isArray(this.data.stats.vocabHistory)) this.data.stats.vocabHistory = []
    },

    _ensureWordbook() {
      if (!this.data) return
      if (!Array.isArray(this.data.wordbook)) this.data.wordbook = []
    },

    _ensureMistakes() {
      if (!this.data) return
      if (!Array.isArray(this.data.mistakes)) this.data.mistakes = []
    },

    /* ---------- 每日学习统计（拼写/听写/测验/关卡/复习） ---------- */

    /* 设置每日学习目标（0 = 不设目标） */
    setDailyGoal(n) {
      if (!this.data) return
      const v = Number(n) || 0
      this.data.dailyGoal = Math.max(0, Math.min(500, Math.round(v)))
      this._persist()
    },

    recordDaily(field, n = 1) {
      if (!this.data) return
      this._ensureStats()
      const key = todayKey()
      const day = this.data.stats.daily[key] || { stage: 0, quiz: 0, quizCorrect: 0, review: 0, spell: 0, dict: 0 }
      day[field] = (day[field] || 0) + n
      this.data.stats.daily[key] = day
    },

    /* 词汇量快照（增长曲线用；同日覆盖，数量变化才记录） */
    snapshotVocab() {
      if (!this.data) return
      this._ensureStats()
      const count = this.data.stats.masteredWords.length
      const h = this.data.stats.vocabHistory
      const t = todayKey()
      if (h.length && h[h.length - 1].date === t) {
        h[h.length - 1].count = count
        return
      }
      if (h.length && h[h.length - 1].count === count) return
      h.push({ date: t, count })
    },

    /* ---------- 生词本 ---------- */

    isInWordbook(itemKey) {
      return !!(this.data && Array.isArray(this.data.wordbook) && this.data.wordbook.includes(itemKey))
    },

    /* 收藏/取消收藏生词；返回收藏后状态 */
    toggleWordbook(itemKey) {
      if (!this.data) return false
      this._ensureWordbook()
      const arr = this.data.wordbook
      const i = arr.indexOf(itemKey)
      if (i >= 0) {
        arr.splice(i, 1)
        this._persist()
        return false
      }
      arr.push(itemKey)
      this._persist()
      return true
    },

    /* ---------- 错题本 ---------- */

    /**
     * 收录错题快照（重复题去重；上限 100 条）
     * @param {{q:string, options:Array<{key,label}>, answerKey, explain?:string, source?:string}} snap
     */
    addMistake(snap) {
      if (!this.data || !snap || !snap.q) return
      this._ensureMistakes()
      const list = this.data.mistakes
      if (list.some((m) => !m.resolved && m.q === snap.q)) return
      list.unshift({
        id: `${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        q: snap.q,
        options: Array.isArray(snap.options) ? snap.options : [],
        answerKey: snap.answerKey,
        explain: snap.explain || '',
        source: snap.source || '',
        addedAt: Date.now(),
        resolved: false
      })
      while (list.length > 100) list.pop()
      this._persist()
    },

    removeMistake(id) {
      if (!this.data) return
      this._ensureMistakes()
      this.data.mistakes = this.data.mistakes.filter((m) => m.id !== id)
      this._persist()
    },

    /* 错题重练答对：标记已消化 */
    resolveMistake(id) {
      if (!this.data) return
      this._ensureMistakes()
      const m = this.data.mistakes.find((x) => x.id === id)
      if (m) {
        m.resolved = true
        this._persist()
      }
    },

    clearResolvedMistakes() {
      if (!this.data) return
      this._ensureMistakes()
      this.data.mistakes = this.data.mistakes.filter((m) => !m.resolved)
      this._persist()
    },

    /* 徽章规则评估：按 PLAN §3.5 的 16 项规则全量触发 */
    _evaluateBadges() {
      if (!this.data) return
      const d = this.data

      // 等级毕业徽章
      for (const [lv, badge] of Object.entries(LEVEL_EXAM_BADGES)) {
        if (d.levelExams && d.levelExams[`L${lv}`]) this._grantBadge(badge)
      }
      // 词汇三档
      const words = d.stats && Array.isArray(d.stats.masteredWords) ? d.stats.masteredWords.length : 0
      if (words >= 100) this._grantBadge('vocab_newbie')
      if (words >= 500) this._grantBadge('vocab_elite')
      if (words >= 2000) this._grantBadge('vocab_master')

      // 内容类徽章：按关卡完成情况
      const completedAll = (lv) => {
        const level = getLevel(lv)
        return !!level && level.stages.length > 0 && level.stages.every((st) => d.progress.stages[st.id] && d.progress.stages[st.id].completed)
      }
      if (completedAll(6)) this._grantBadge('dialogue_star')
      if (completedAll(13)) this._grantBadge('listening_pro')
      if (completedAll(14)) this._grantBadge('reading_pioneer')
      if (completedAll(16)) this._grantBadge('exam_sprint')

      // 全站毕业：L1~L16 全部关卡完成
      const allDone = LEVELS.every((lv) => lv.stages.length > 0 && lv.stages.every((st) => d.progress.stages[st.id] && d.progress.stages[st.id].completed))
      if (allDone) this._grantBadge('all_graduate')

      // 连续打卡
      const streak = this.streakDays
      if (streak >= 3) this._grantBadge('streak_3')
      if (streak >= 7) this._grantBadge('streak_7')
      if (streak >= 30) this._grantBadge('streak_30')

      // 复习标兵
      if (d.stats && d.stats.reviewDone >= 50) this._grantBadge('review_master')
    },

    /* 通关：记录星星/通关状态/历史最高分，打卡，解锁下一关并刷新推荐 */
    completeStage(stageId, stars) {
      if (!this.data) return null
      const stage = getStageById(stageId)
      if (!stage) return null
      const record = this.data.progress.stages[stageId] || {
        bestStars: 0,
        completed: false,
        attempts: 0,
        completedAt: 0
      }
      record.attempts += 1
      record.bestStars = Math.max(record.bestStars, stars)
      record.completed = true
      record.completedAt = Date.now()
      this.data.progress.stages[stageId] = record

      // 打卡
      this._touchCheckin()

      // 徽章：初次通关 / 满分
      if (this.totalCompletedStages === 1) this._grantBadge('first_stage')
      if (stars === 3) this._grantBadge('full_score')

      // 词汇掌握：单词类关卡通关后，将本关词条并入 masteredWords（去重）
      const words = getStageWords(stageId)
      if (words && words.length) {
        this._ensureStats()
        for (const w of words) {
          if (!this.data.stats.masteredWords.includes(w)) {
            this.data.stats.masteredWords.push(w)
          }
        }
      }
      this.recordDaily('stage', 1)
      this.snapshotVocab()

      // 推荐关卡推进：若下一关存在则推荐下一关
      const next = getLevel(stage.level).stages.find((st) => st.stage === stage.stage + 1)
      if (next) {
        this.data.progress.recommendedStage = next.id
      } else {
        // 当前等级最后一关：推荐下一等级第 1 关（若已解锁且该等级确实有关卡）
        const nextLevel = getLevel(stage.level + 1)
        if (nextLevel && nextLevel.stages.length && this.isLevelUnlocked(nextLevel.level)) {
          this.data.progress.recommendedStage = nextLevel.stages[0].id
        }
      }

      this._evaluateBadges()
      this._persist()
      return record
    },

    /* 打卡：完成关卡/复习后调用（公开入口） */
    checkInToday() {
      this._touchCheckin()
      this._persist()
    },

    /* 等级综合测验通过：发毕业徽章并记录 */
    completeLevelExam(level) {
      if (!this.data) return
      this.data.levelExams = this.data.levelExams || {}
      this.data.levelExams[`L${level}`] = { passedAt: Date.now() }
      this._touchCheckin()
      this._evaluateBadges()
      this._persist()
    },

    /* 添加错题/错词到复习池（框架）：itemKey 唯一，更新间隔调度 */
    addToReviewPool(items) {
      if (!this.data) return
      this.data.reviewPool = this.data.reviewPool || {}
      for (const key of items) {
        const item = this.data.reviewPool[key]
        if (!item) {
          const next = new Date()
          next.setDate(next.getDate() + 1)
          this.data.reviewPool[key] = {
            itemKey: key,
            wrongCount: 1,
            dueDate: next.toISOString().slice(0, 10),
            intervalStage: 1
          }
        } else {
          item.wrongCount += 1
          item.intervalStage = Math.min(item.intervalStage + 1, 3)
          const gap = [1, 3, 7][item.intervalStage - 1] || 7
          const next = new Date()
          next.setDate(next.getDate() + gap)
          item.dueDate = next.toISOString().slice(0, 10)
        }
      }
      this._persist()
    },

    /* 复习答对处理：连续 2 次答对出池；复习任务计入打卡与统计 */
    reviewCorrect(itemKey) {
      if (!this.data) return
      const item = this.data.reviewPool[itemKey]
      if (!item) return
      item.correctStreak = (item.correctStreak || 0) + 1
      if (item.correctStreak >= 2) {
        delete this.data.reviewPool[itemKey]
      } else {
        item.dueDate = todayKey() // 今日已复习
      }
      this._ensureStats()
      this.data.stats.reviewDone += 1
      this.recordDaily('review', 1)
      this.recordDaily('quizCorrect', 1)
      this.recordDaily('quiz', 1)
      this._touchCheckin()
      this._evaluateBadges()
      this._persist()
    },

    /* 复习答错处理：重置连续答对，并按间隔调度延后 */
    reviewWrong(itemKey) {
      if (!this.data) return
      const item = this.data.reviewPool[itemKey]
      if (!item) return
      item.correctStreak = 0
      item.wrongCount += 1
      item.intervalStage = Math.min(item.intervalStage + 1, 3)
      const gap = [1, 3, 7][item.intervalStage - 1] || 7
      item.dueDate = addDays(new Date(), gap).toISOString().slice(0, 10)
      this._persist()
    },

    /* 记录测验/小测统计（按题数口径累计） */
    recordQuiz({ correct = 0, total = 0 } = {}) {
      if (!this.data) return
      this._ensureStats()
      this.data.stats.quizCount += total
      this.data.stats.quizCorrect += correct
      if (total > 0) {
        this.recordDaily('quiz', total)
        this.recordDaily('quizCorrect', correct)
        this._touchCheckin()
        this._evaluateBadges()
      }
      this._persist()
    },

    /* 记录每日一句（自然日去重） */
    recordDailySentence(key) {
      if (!this.data) return
      this._ensureStats()
      this.data.stats.dailySentence = { date: todayKey(), key }
      this._persist()
    },

    /* 退出登录时清空内存中的进度数据，防止账号串号 */
    clearData() {
      this.data = null
    }
  }
})
