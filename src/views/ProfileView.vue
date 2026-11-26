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

    <!-- 发音声音：男声 / 女声 -->
    <div class="card profile-voice">
      <h2 class="card-title">发音声音</h2>
      <p class="data-tip">切换单词与例句的朗读声，点击后立即生效并试听。</p>
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
      <p v-if="maleMissingTip" class="voice-hint">⚠️ 本机未安装男声英语语音，切换后仍会使用女声。下载下方的真人发音引擎后即可使用男声。</p>
      <button class="btn btn-soft preview-btn" :disabled="previewing" @click="previewVoice">
        {{ previewing ? '播放中…' : '🔊 试听当前声音' }}
      </button>
    </div>

    <!-- 真人发音引擎（Kokoro）：下载状态与入口 -->
    <div class="card profile-engine">
      <h2 class="card-title">真人发音引擎</h2>
      <p class="data-tip">神经网络合成（Kokoro-82M），真人级音质、支持男女声，仅首次需下载约 88MB，之后离线可用。未下载时使用系统发音（音质因设备而异）。</p>
      <div class="engine-status">
        <template v-if="engineState === 'ready'">
          ✅ 已下载并启用
          <span v-if="engineDevice" class="engine-device">（运行设备：{{ engineDevice }}）</span>
        </template>
        <template v-else-if="engineState === 'downloading'">⏳ 下载中（{{ engineMsg }}）</template>
        <template v-else-if="engineState === 'error'">❌ 下载失败：{{ engineMsg }}</template>
        <template v-else>⬇️ 未下载</template>
      </div>
      <p v-if="engineDevice && /WASM/i.test(engineDevice)" class="data-tip engine-slow-tip">
        当前设备使用 CPU 模式合成，首次合成每句需 10~30 秒，重复播放不受影响（已缓存）。
      </p>
      <div class="device-select">
        <span class="device-select-label">推理设备</span>
        <button
          class="device-opt"
          :class="{ active: devicePref === 'auto' }"
          @click="chooseDevice('auto')"
        >自动检测</button>
        <button
          class="device-opt"
          :class="{ active: devicePref === 'cpu' }"
          @click="chooseDevice('cpu')"
        >仅用 CPU（无显卡设备推荐）</button>
      </div>
      <p v-if="deviceJustSwitched" class="data-tip engine-slow-tip">
        设备已切换，下次播放时生效（模型无需重新下载）。
      </p>
      <button
        v-if="engineState !== 'ready' && engineState !== 'downloading'"
        class="btn btn-primary btn-block"
        :disabled="engineBusy"
        @click="downloadEngine"
      >
        {{ engineState === 'error' ? '重试下载' : '下载真人发音引擎（约 88MB）' }}
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

    <!-- 数据管理：导出 / 导入用户进度 -->
    <div class="card profile-data">
      <h2 class="card-title">数据管理</h2>
      <p class="data-tip">学习进度可导出为 JSON 文件备份，也可生成同步码/二维码在设备之间迁移（仅限同一账号）。</p>
      <div class="data-actions">
        <button class="btn btn-primary" @click="doExport">导出进度</button>
        <label class="btn btn-soft import-btn">
          导入进度
          <input ref="importInput" type="file" accept=".json,application/json" @change="doImport" />
        </label>
      </div>
      <button class="btn btn-ghost btn-block sync-entry" @click="router.push('/sync')">
        📱 跨设备同步（同步码 / 二维码）
      </button>
      <div class="import-mode" v-if="showImportMode">
        <p class="data-tip">检测到当前账号已有学习进度，请选择导入方式：</p>
        <div class="data-actions">
          <button class="btn btn-soft" @click="confirmImport('merge')">合并导入（取较高值）</button>
          <button class="btn btn-danger" @click="confirmImport('overwrite')">覆盖导入（整体替换）</button>
        </div>
        <button class="btn btn-ghost cancel-import" @click="cancelImport">取消</button>
      </div>
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
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useProgressStore } from '../stores/progress'
import { useThemeStore, THEMES } from '../stores/theme'
import { exportUserDataJson, importUserData } from '../services/storage'
import {
  speak,
  stopSpeak,
  getVoiceGender,
  setVoiceGender,
  isKokoroModelCached,
  preloadKokoro,
  resetKokoroEngine,
  getEngineDevicePref,
  setEngineDevicePref,
  setModelSkipped,
  hasSystemMaleVoice,
  waitForVoices,
} from '../services/tts'

const router = useRouter()
const auth = useAuthStore()
const progress = useProgressStore()
const themeStore = useThemeStore()

const nickname = ref(auth.nickname)
const avatar = ref(auth.profile.avatar || '')

const importInput = ref(null)
const showImportMode = ref(false)
let pendingImportText = ''

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

/* ---------- 真人发音引擎状态与下载入口 ---------- */

const engineState = ref('checking') // checking | ready | missing | downloading | error
const engineMsg = ref('')
const engineBusy = ref(false)
const engineDevice = ref('')
const maleMissingTip = ref(false)
const devicePref = ref(getEngineDevicePref())
const deviceJustSwitched = ref(false)

/* 切换推理设备（自动检测 / 仅用 CPU）：重置引擎实例，下次播放按新设置加载 */
function chooseDevice(v) {
  if (devicePref.value === v) return
  devicePref.value = setEngineDevicePref(v)
  resetKokoroEngine()
  engineDevice.value = ''
  deviceJustSwitched.value = true
}

function onKokoroEvent(e) {
  const d = e.detail || {}
  if (d.phase === 'progress') {
    engineState.value = 'downloading'
    engineMsg.value = d.message || '下载中…'
  } else if (d.phase === 'warming') {
    engineState.value = 'downloading'
    engineMsg.value = d.message || '预热中…'
  } else if (d.phase === 'ready') {
    engineState.value = 'ready'
    engineMsg.value = ''
    deviceJustSwitched.value = false
    if (d.device) engineDevice.value = d.device
  } else if (d.phase === 'error') {
    engineState.value = 'error'
    engineMsg.value = d.message || '下载失败'
  }
}

async function initEngineStatus() {
  window.addEventListener('tts-kokoro', onKokoroEvent)
  const cached = await isKokoroModelCached().catch(() => false)
  if (cached) {
    engineState.value = 'ready'
    setModelSkipped(false) // 模型已在缓存中，历史跳过标记失效
  } else {
    engineState.value = 'missing'
  }
  /* 男声可用性：等系统语音列表就绪后检测（仅系统语音参与） */
  try {
    await waitForVoices(3000)
    if (currentGender.value === 'male' && !hasSystemMaleVoice()) {
      maleMissingTip.value = true
    }
  } catch { /* ignore */ }
}

async function downloadEngine() {
  engineBusy.value = true
  engineMsg.value = '准备中…'
  engineState.value = 'downloading'
  try {
    await preloadKokoro()
    engineState.value = 'ready'
  } catch (e) {
    engineState.value = 'error'
    engineMsg.value = (e && e.message) || '下载失败'
  }
  engineBusy.value = false
}

onBeforeUnmount(() => {
  window.removeEventListener('tts-kokoro', onKokoroEvent)
})

initEngineStatus()

/* 导出用户进度：下载 JSON 备份文件 */
function doExport() {
  const json = exportUserDataJson(auth.username)
  if (!json) {
    alert('暂无数据可导出')
    return
  }
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `elearning-backup-${auth.username}-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/* 选择备份文件后：读取内容并校验账号匹配，再进入导入方式确认 */
function doImport(ev) {
  const file = ev.target.files && ev.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    pendingImportText = String(reader.result || '')
    showImportMode.value = true
  }
  reader.readAsText(file)
  if (importInput.value) importInput.value.value = ''
}

function cancelImport() {
  showImportMode.value = false
  pendingImportText = ''
}

function confirmImport(mode) {
  const res = importUserData(auth.username, pendingImportText, mode)
  if (res && res.ok) {
    showImportMode.value = false
    pendingImportText = ''
    progress.loadForCurrentUser()
    themeStore.init()
    alert(res.message || '导入成功')
  } else {
    showImportMode.value = false
    pendingImportText = ''
    alert((res && res.reason) || '导入失败，请检查备份文件')
  }
}

function doLogout() {
  auth.logout()
  progress.clearData()
  router.push('/login')
}
</script>

<style scoped>
.card-title {
  font-size: 16px;
  margin-bottom: var(--space-md);
}

.profile-card,
.profile-theme,
.profile-voice,
.profile-goal,
.profile-links,
.profile-data {
  margin-bottom: var(--space-md);
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

.engine-status {
  font-size: 14px;
  font-weight: 700;
  color: var(--c-text-primary);
  background: var(--c-bg-soft);
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: var(--space-sm);
  font-variant-numeric: tabular-nums;
}

.engine-device {
  font-size: 12px;
  font-weight: 500;
  color: var(--c-text-muted, #93a1b3);
}

.engine-slow-tip {
  margin-top: calc(var(--space-sm) * -1);
  margin-bottom: var(--space-sm);
}

/* 推理设备切换（自动检测 / 仅用 CPU） */
.device-select {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
  margin-bottom: var(--space-sm);
}

.device-select-label {
  font-size: 13px;
  color: var(--c-text-secondary);
}

.device-opt {
  border: 1px solid var(--c-border, #e0e0e0);
  background: transparent;
  color: var(--c-text-secondary);
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
}

.device-opt.active {
  border-color: var(--c-primary);
  background: var(--c-primary-soft, rgba(59, 130, 246, 0.1));
  color: var(--c-primary);
  font-weight: 600;
}

.data-tip {
  font-size: 13px;
  color: var(--c-text-secondary);
  margin-bottom: var(--space-sm);
}

.data-actions {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
  margin-bottom: var(--space-sm);
}

.import-btn {
  position: relative;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}

.import-btn input[type='file'] {
  display: none;
}

.sync-entry {
  margin-top: var(--space-xs);
}

.import-mode {
  border-top: 1px solid var(--c-border);
  padding-top: var(--space-sm);
  margin-top: var(--space-sm);
}

.cancel-import {
  margin-top: var(--space-xs);
}

.btn-danger {
  background: #d9534f;
  color: #fff;
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
