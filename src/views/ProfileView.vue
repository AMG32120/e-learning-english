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
      <p class="data-tip">切换单词与例句的朗读声（内置离线发音，无需联网），点击后立即生效并试听。</p>
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
          <div class="voice-desc">{{ g.desc }}</div>
        </button>
      </div>
      <button class="btn btn-soft preview-btn" :disabled="previewing" @click="previewVoice">
        {{ previewing ? '播放中…' : '🔊 试听当前声音' }}
      </button>
    </div>

    <!-- 数据管理：导出 / 导入用户进度 -->
    <div class="card profile-data">
      <h2 class="card-title">数据管理</h2>
      <p class="data-tip">学习进度以 JSON 文件形式导出备份，也可从备份文件导入恢复（仅限同一账号）。</p>
      <div class="data-actions">
        <button class="btn btn-primary" @click="doExport">导出进度</button>
        <label class="btn btn-soft import-btn">
          导入进度
          <input ref="importInput" type="file" accept=".json,application/json" @change="doImport" />
        </label>
      </div>
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
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useProgressStore } from '../stores/progress'
import { useThemeStore, THEMES } from '../stores/theme'
import { exportUserDataJson, importUserData } from '../services/storage'
import { speak, stopSpeak, getVoiceGender, setVoiceGender } from '../services/tts'

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

function chooseVoice(gender) {
  currentGender.value = setVoiceGender(gender)
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
.profile-links,
.profile-data {
  margin-bottom: var(--space-md);
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
