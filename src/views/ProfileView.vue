<template>
  <div class="page-container profile">
    <h1 class="page-title">个人中心</h1>
    <p class="page-subtitle">资料、主题与账号</p>

    <!-- 资料卡 -->
    <div class="card profile-card">
      <div class="profile-head">
        <div class="avatar">{{ avatarChar }}</div>
        <div class="profile-info">
          <div class="profile-name">{{ auth.nickname }}</div>
          <div class="profile-username">@{{ auth.username }}</div>
          <div class="profile-since">注册于 {{ createdDate }}</div>
        </div>
      </div>
      <form class="profile-edit" @submit.prevent="saveProfile">
        <div class="form-field">
          <label class="form-label">昵称</label>
          <input v-model.trim="nickname" class="form-input" type="text" placeholder="修改昵称" />
        </div>
        <div class="form-field">
          <label class="form-label">头像字符（首字母）</label>
          <input v-model.trim="avatar" class="form-input" type="text" maxlength="1" placeholder="如 A" />
        </div>
        <button class="btn btn-primary" type="submit">保存资料</button>
      </form>
    </div>

    <!-- 主题切换 -->
    <div class="card profile-theme">
      <h2 class="card-title">主题切换</h2>
      <div class="theme-grid">
        <button
          v-for="t in THEMES"
          :key="t.id"
          class="theme-item"
          :class="{ active: themeStore.theme === t.id }"
          @click="themeStore.setTheme(t.id)"
        >
          <div class="theme-swatch" :style="swatchStyle(t.id)"></div>
          <div class="theme-name">{{ t.name }}</div>
          <div class="theme-desc">{{ t.desc }}</div>
        </button>
      </div>
    </div>

    <!-- 学习模式：关卡模式（顺序解锁）/ 自由模式（全部开放） -->
    <div class="card profile-mode">
      <h2 class="card-title">学习模式</h2>
      <p class="data-tip">
        决定等级与关卡的开放方式，切换后立即生效（不影响已有进度和星级）。
      </p>
      <div class="mode-grid">
        <button
          class="mode-item"
          :class="{ active: studyMode === 'stage' }"
          @click="chooseMode('stage')"
        >
          <div class="mode-icon">🔒</div>
          <div class="mode-name">关卡模式</div>
          <div class="mode-desc">按顺序闯关解锁：完成前一关才能进入下一关，上一等级完成 80% 解锁下一等级。循序渐进，默认模式。</div>
        </button>
        <button
          class="mode-item"
          :class="{ active: studyMode === 'free' }"
          @click="chooseMode('free')"
        >
          <div class="mode-icon">🔓</div>
          <div class="mode-name">自由模式</div>
          <div class="mode-desc">所有 16 个等级、全部关卡一次性开放，可任意挑选想学的内容自由跳转，适合复习或有基础的学习者。</div>
        </button>
      </div>
      <p class="mode-current">
        当前模式：<strong>{{ studyMode === 'free' ? '自由模式（全部开放）' : '关卡模式（顺序解锁）' }}</strong>
      </p>
    </div>

    <!-- 发音声音：男声 / 女声（含发音说明） -->
    <div class="card profile-voice">
      <h2 class="card-title">发音声音</h2>
      <p class="data-tip">单词与例句使用系统内置英语语音朗读（无需下载任何资源），选择朗读声音后立即生效并试听。若听不到声音，请在系统设置中安装英语语音（Windows：设置 → 时间和语言 → 语言和区域 → 添加语言 "English"，勾选"语音"）后刷新页面。</p>
      <div class="voice-grid">
        <button
          v-for="g in VOICE_OPTIONS"
          :key="g.value"
          class="voice-item"
          :class="{ active: currentGender === g.value }"
          @click="chooseVoice(g.value)"
        >
          <div class="voice-icon">{{ g.value === 'male' ? '👨' : '👩' }}</div>
          <div class="voice-name">{{ g.label }}</div>
          <div class="voice-desc">{{ g.value === 'male' ? '沉稳标准男声' : '清晰自然女声' }}</div>
        </button>
      </div>
      <p v-if="maleMissingTip" class="voice-hint">⚠️ 本机未安装男声英语语音，切换后仍会使用女声。</p>
      <button class="btn btn-soft preview-btn" :disabled="previewing" @click="previewVoice">
        {{ previewing ? '播放中…' : '🔊 试听当前声音' }}
      </button>
    </div>

    <!-- 每日学习目标 -->
    <div class="card profile-goal">
      <h2 class="card-title">每日学习目标</h2>
      <p class="data-tip">设定每天要完成的题量，首页会用进度环跟踪今日完成情况。</p>
      <div class="goal-options">
        <button
          v-for="opt in GOAL_OPTIONS"
          :key="opt.value"
          class="goal-option"
          :class="{ active: progress.dailyGoal === opt.value }"
          @click="chooseGoal(opt.value)"
        >
          <span class="goal-option-num">{{ opt.value === 0 ? '不设' : opt.value }}</span>
          <span class="goal-option-label">{{ opt.label }}</span>
        </button>
      </div>
      <p class="goal-today" v-if="progress.dailyGoal > 0">
        今日已完成 <strong>{{ progress.todayStudyCount }}</strong> / {{ progress.dailyGoal }} 题（{{ progress.todayGoalPercent }}%）
      </p>
    </div>

    <!-- 进度管理：重置学习进度（学习进度已自动云同步，无需手动备份） -->
    <div class="card profile-data">
      <h2 class="card-title">学习进度</h2>
      <p class="data-tip">学习进度已自动同步云端，登录即可在任意设备恢复，无需手动备份。</p>
      <button class="btn btn-danger btn-block" @click="doResetProgress">
        🗑️ 重置学习进度
      </button>
      <p class="data-tip reset-tip">
        清空关卡进度、复习池、打卡、徽章、学习统计与水平自测记录（云端同步归零，不可恢复）；账号资料、主题与每日目标保留。
      </p>
    </div>

    <!-- 学习入口 -->
    <div class="card profile-links">
      <button class="profile-link" @click="router.push('/onboarding')">重新查看入学引导</button>
      <button class="profile-link" @click="router.push('/placement')">重新进行水平自测</button>
    </div>

    <!-- 退出 -->
    <button class="btn btn-ghost btn-block logout-btn" @click="doLogout">退出登录</button>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useProgressStore } from '../stores/progress'
import { useThemeStore, THEMES } from '../stores/theme'
import { studyMode, setStudyMode } from '../services/studyMode'
import {
  speak,
  stopSpeak,
  getVoiceGender,
  setVoiceGender,
  hasSystemMaleVoice,
  waitForVoices,
} from '../services/tts'

const router = useRouter()
const auth = useAuthStore()
const progress = useProgressStore()
const themeStore = useThemeStore()

const nickname = ref(auth.nickname)
const avatar = ref(auth.profile.avatar || '')

const avatarChar = computed(() => (auth.profile.avatar || auth.nickname || auth.username || '学').charAt(0).toUpperCase())

const createdDate = computed(() => {
  const t = auth.profile.createdAt
  if (!t) return '-'
  const d = new Date(t)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

const swatches = {
  blue: { background: '#2F7CF6' },
  night: { background: '#1e1e1e', border: '#3c3c3c' },
  warm: { background: '#d98e2b' }
}

function swatchStyle(id) {
  return swatches[id] || { background: '#ccc' }
}

function saveProfile() {
  auth.updateProfile({ nickname: nickname.value, avatar: avatar.value })
  alert('资料已保存')
}

/* ---------- 发音声音切换 ---------- */

const VOICE_OPTIONS = [
  { value: 'female', label: '女声', desc: '清晰自然女声' },
  { value: 'male', label: '男声', desc: '沉稳标准男声' }
]

const currentGender = ref(getVoiceGender())
const previewing = ref(false)

/* 每日目标档位 */
const GOAL_OPTIONS = [
  { value: 10, label: '轻松' },
  { value: 20, label: '标准' },
  { value: 30, label: '进阶' },
  { value: 50, label: '冲刺' },
  { value: 0, label: '关闭' }
]

/* 学习模式切换（关卡模式 / 自由模式），立即生效 */
function chooseMode(m) {
  setStudyMode(m)
}

function chooseGoal(n) {
  progress.setDailyGoal(n)
}

function chooseVoice(gender) {
  currentGender.value = setVoiceGender(gender)
  if (gender === 'male') {
    maleMissingTip.value = !hasSystemMaleVoice()
  } else {
    maleMissingTip.value = false
  }
  previewVoice()
}

async function previewVoice() {
  if (previewing.value) {
    stopSpeak()
    previewing.value = false
    return
  }
  previewing.value = true
  try {
    await speak('Hello! This is my English voice.', { rate: 0.85 })
  } finally {
    previewing.value = false
  }
}

/* ---------- 发音提示：男声可用性检测（发音使用系统语音，无需下载） ---------- */

const maleMissingTip = ref(false)

async function initVoiceHint() {
  try {
    await waitForVoices(3000)
    if (currentGender.value === 'male' && !hasSystemMaleVoice()) {
      maleMissingTip.value = true
    }
  } catch { /* ignore */ }
}

initVoiceHint()

function doLogout() {
  auth.logout()
  progress.clearData()
  router.push('/login')
}

/* 重置学习进度：二次确认后清零（本地 + 云端），保留账号资料与设置 */
function doResetProgress() {
  const ok = confirm(
    '确定要重置学习进度吗？\n\n' +
      '将清空：关卡进度、复习池、打卡、徽章、学习统计、水平自测记录\n' +
      '将保留：账号资料、主题、每日学习目标\n\n' +
      '重置会同步到云端，且无法恢复！'
  )
  if (!ok) return
  progress.resetProgress()
  alert('学习进度已重置（云端同步归零）。')
}
</script>

<style scoped>
.card-title {
  font-size: 16px;
  margin-bottom: var(--space-md);
}

.profile-card,
.profile-theme,
.profile-mode,
.profile-voice,
.profile-goal,
.profile-links,
.profile-data {
  margin-bottom: var(--space-md);
}

/* 学习模式切换 */
.mode-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-sm);
}

.mode-item {
  border: 2px solid var(--c-border, #e0e0e0);
  background: transparent;
  border-radius: 10px;
  padding: 14px 12px;
  text-align: left;
  cursor: pointer;
  color: var(--c-text-primary);
  transition: border-color 0.2s, background 0.2s;
}

.mode-item.active {
  border-color: var(--c-primary);
  background: var(--c-primary-soft, rgba(59, 130, 246, 0.08));
}

.mode-icon {
  font-size: 22px;
  margin-bottom: 6px;
}

.mode-name {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 4px;
}

.mode-item.active .mode-name {
  color: var(--c-primary);
}

.mode-desc {
  font-size: 12px;
  line-height: 1.6;
  color: var(--c-text-secondary);
}

.mode-current {
  margin-top: var(--space-sm);
  font-size: 13px;
  color: var(--c-text-secondary);
}

.mode-current strong {
  color: var(--c-primary);
}

/* 每日目标档位 */
.goal-options {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-xs);
}

.goal-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 4px;
  border: 2px solid var(--c-border);
  border-radius: var(--radius-md);
  background: var(--c-bg-card);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.goal-option.active {
  border-color: var(--c-primary);
  background: var(--c-primary-light);
}

.goal-option-num {
  font-size: 18px;
  font-weight: 800;
  color: var(--c-text);
}

.goal-option.active .goal-option-num {
  color: var(--c-primary);
}

.goal-option-label {
  font-size: 12px;
  color: var(--c-text-muted);
}

.goal-today {
  font-size: 13px;
  color: var(--c-text-secondary);
  margin-top: var(--space-sm);
}

.goal-today strong {
  color: var(--c-primary);
}

@media (max-width: 420px) {
  .goal-options {
    grid-template-columns: repeat(3, 1fr);
  }
}

.voice-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-sm);
}

.voice-item {
  border: 2px solid var(--c-border);
  border-radius: var(--radius-md);
  padding: var(--space-sm);
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s;
  background: var(--c-bg-card);
}

.voice-item.active {
  border-color: var(--c-primary);
}

.voice-icon {
  font-size: 28px;
  line-height: 1;
  margin-bottom: var(--space-xs);
}

.voice-name {
  font-weight: 700;
  font-size: 14px;
}

.voice-desc {
  font-size: 12px;
  color: var(--c-text-muted);
  margin-top: 2px;
}

.preview-btn {
  margin-top: var(--space-sm);
}

.voice-hint {
  margin-top: var(--space-sm);
  font-size: 12px;
  line-height: 1.6;
  color: #8a5a00;
  background: #fff6e5;
  border: 1px solid #f0c674;
  border-radius: 8px;
  padding: 8px 10px;
}

[data-theme='night'] .voice-hint {
  color: #ffd98a;
  background: #3a2f14;
  border-color: #6b5a2a;
}

.data-tip {
  font-size: 13px;
  color: var(--c-text-secondary);
  margin-bottom: var(--space-sm);
}

.btn-danger {
  background: #d9534f;
  color: #fff;
}

.reset-tip {
  margin-top: var(--space-xs);
  font-size: 12px;
}

.profile-head {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--c-primary);
  color: #fff;
  font-size: 30px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.profile-name {
  font-size: 20px;
  font-weight: 800;
}

.profile-username {
  font-size: 14px;
  color: var(--c-text-secondary);
}

.profile-since {
  font-size: 13px;
  color: var(--c-text-muted);
}

.profile-edit {
  border-top: 1px solid var(--c-border);
  padding-top: var(--space-md);
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm);
}

.theme-item {
  border: 2px solid var(--c-border);
  border-radius: var(--radius-md);
  padding: var(--space-sm);
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s;
  background: var(--c-bg-card);
}

.theme-item.active {
  border-color: var(--c-primary);
}

.theme-swatch {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin: 0 auto var(--space-xs);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.theme-name {
  font-weight: 700;
  font-size: 14px;
}

.theme-desc {
  font-size: 12px;
  color: var(--c-text-muted);
  margin-top: 2px;
}

.profile-link {
  display: block;
  width: 100%;
  text-align: left;
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--c-border);
  color: var(--c-text);
  cursor: pointer;
}

.profile-link:last-child {
  border-bottom: none;
}

.logout-btn {
  margin-top: var(--space-md);
}

@media (max-width: 767px) {
  .theme-grid {
    grid-template-columns: 1fr;
  }

  .voice-grid {
    grid-template-columns: 1fr;
  }
}
</style>
