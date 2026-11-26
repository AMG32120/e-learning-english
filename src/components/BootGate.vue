<template>
  <transition name="gate-fade">
    <div v-if="phase !== 'hidden'" class="boot-gate">
      <!-- 检查中 / 纯词库加载：轻量加载画面 -->
      <div v-if="phase === 'checking' || phase === 'loading'" class="gate-panel gate-loading">
        <div class="gate-logo">启程英语</div>
        <div class="gate-spinner"></div>
        <p class="gate-tip">正在加载学习词库…</p>
        <div class="gate-bar-track">
          <div class="gate-bar" :style="{ width: wordPct + '%' }"></div>
        </div>
        <p class="gate-num">词库 {{ wordProgress.loaded }} / {{ wordProgress.total }}</p>
        <p v-if="wordError" class="gate-error">
          词库加载失败，请检查网络后重试。
          <button class="btn btn-primary" @click="retryWordData">重试</button>
        </p>
      </div>

      <!-- 首次访问询问：是否下载真人发音引擎 -->
      <div v-else-if="phase === 'ask'" class="gate-panel gate-ask">
        <div class="gate-logo">欢迎使用启程英语 🎓</div>
        <p class="gate-desc">首次使用需要准备以下资源（仅下载一次，之后离线可用）：</p>
        <ul class="gate-list">
          <li>
            <span class="gate-item-icon">📚</span>
            <div>
              <div class="gate-item-name">学习词库 <em>必需</em></div>
              <div class="gate-item-desc">约 2MB · 4600+ 词条与全部关卡内容</div>
            </div>
          </li>
          <li>
            <span class="gate-item-icon">🔊</span>
            <div>
              <div class="gate-item-name">真人发音引擎 <em>推荐</em></div>
              <div class="gate-item-desc">约 88MB · 神经网络真人级发音，支持男女声切换</div>
            </div>
          </li>
        </ul>
        <button class="btn btn-primary btn-block" :disabled="busy" @click="downloadAll">
          开始下载并进入
        </button>
        <button class="btn btn-ghost btn-block" :disabled="busy" @click="skipModel">
          跳过真人发音，直接进入（使用系统发音）
        </button>
        <p class="gate-fine">跳过后可随时在「个人中心」补下载发音引擎</p>
      </div>

      <!-- 下载中：双进度条 -->
      <div v-else-if="phase === 'downloading'" class="gate-panel gate-loading">
        <div class="gate-logo">资源准备中…</div>
        <div class="gate-dl-row">
          <span class="gate-dl-label">📚 词库</span>
          <div class="gate-bar-track">
            <div class="gate-bar" :style="{ width: wordPct + '%' }"></div>
          </div>
          <span class="gate-num">{{ wordPct }}%</span>
        </div>
        <div class="gate-dl-row">
          <span class="gate-dl-label">🔊 发音引擎</span>
          <div class="gate-bar-track">
            <div class="gate-bar" :style="{ width: modelPct + '%' }"></div>
          </div>
          <span class="gate-num">{{ modelProgress.message || '…' }}</span>
        </div>
        <p v-if="modelError" class="gate-error">
          发音引擎下载失败：{{ modelError }}
          <button class="btn btn-soft" @click="skipModel">跳过并进入</button>
          <button class="btn btn-primary" @click="downloadAll">重试</button>
        </p>
        <p class="gate-tip">{{ modelDone ? '发音引擎就绪！' : '下载完成后自动进入' }}</p>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  isWordDataReady,
  preloadWordData,
  getWordDataProgress,
} from '../services/wordData'
import {
  isKokoroModelCached,
  preloadKokoro,
  setModelSkipped,
  shouldSkipKokoro,
} from '../services/tts'

const phase = ref('checking') // checking | ask | loading | downloading | hidden
const wordProgress = ref(getWordDataProgress())
const modelProgress = ref({ loaded: 0, total: 0, message: '等待中' })
const wordError = ref(false)
const modelError = ref('')
const wordDone = ref(false)
const modelDone = ref(false)
const busy = ref(false)

const wordPct = computed(() => {
  const { loaded, total } = wordProgress.value
  return total ? Math.round((loaded / total) * 100) : 0
})
const modelPct = computed(() => {
  const { loaded, total } = modelProgress.value
  if (!total) return 0
  return Math.min(100, Math.round((loaded / total) * 100))
})

/* ---------- 事件监听：词库文件数进度 + Kokoro 字节进度 ---------- */

function onWordProgress(e) {
  wordProgress.value = { ...e.detail }
}
function onKokoroProgress(e) {
  const d = e.detail || {}
  if (d.phase === 'progress') {
    modelProgress.value = { loaded: d.loaded || 0, total: d.total || 0, message: d.message }
  } else if (d.phase === 'ready') {
    modelDone.value = true
    modelProgress.value = { loaded: 1, total: 1, message: '完成' }
  } else if (d.phase === 'error') {
    modelError.value = d.message || '下载失败'
  }
}
function onOnline() {
  if (wordError.value) retryWordData()
}

onMounted(async () => {
  window.addEventListener('worddata-progress', onWordProgress)
  window.addEventListener('tts-kokoro', onKokoroProgress)
  window.addEventListener('online', onOnline)

  /* 词库下载在 main.js 已启动，这里只接管其结果 */
  const wordPromise = preloadWordData()
  wordPromise
    .then(() => {
      wordDone.value = true
      wordError.value = false
    })
    .catch(() => {
      wordError.value = true
    })

  const modelCached = await isKokoroModelCached().catch(() => false)

  if (isWordDataReady() && modelCached) {
    // 老用户/二次访问：词库与模型都已就绪，直接进入
    phase.value = 'hidden'
    return
  }

  if (!modelCached && !shouldSkipKokoro()) {
    // 首次访问：询问是否下载真人发音引擎
    phase.value = 'ask'
  } else {
    // 已跳过模型或模型已缓存：静默加载词库后进入
    phase.value = 'loading'
    if (modelCached) preloadKokoro().catch(() => {})
  }

  /* 词库完成后自动退出引导：
     - loading 阶段（词库即全部所需）→ 词库完成即进入
     - downloading 阶段 → 需词库与模型都成功；模型失败时停留展示
       重试/跳过按钮，由用户决定 */
  const finishWhenReady = () => {
    if (phase.value === 'loading' && wordDone.value) {
      phase.value = 'hidden'
      return
    }
    if (phase.value === 'downloading' && wordDone.value && modelDone.value) {
      phase.value = 'hidden'
      return
    }
    setTimeout(finishWhenReady, 200)
  }
  finishWhenReady()
})

onBeforeUnmount(() => {
  window.removeEventListener('worddata-progress', onWordProgress)
  window.removeEventListener('tts-kokoro', onKokoroProgress)
  window.removeEventListener('online', onOnline)
})

function retryWordData() {
  wordError.value = false
  preloadWordData()
    .then(() => {
      wordDone.value = true
      wordError.value = false
    })
    .catch(() => {
      wordError.value = true
    })
}

async function downloadAll() {
  busy.value = true
  modelError.value = ''
  setModelSkipped(false)
  phase.value = 'downloading'
  try {
    await preloadKokoro()
    modelDone.value = true
  } catch (e) {
    modelError.value = (e && e.message) || '下载失败'
  }
  busy.value = false
}

function skipModel() {
  setModelSkipped(true)
  modelError.value = ''
  if (wordDone.value) {
    phase.value = 'hidden'
  } else {
    phase.value = 'loading'
  }
}
</script>

<style scoped>
.boot-gate {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: var(--c-bg-page, #f4f7fc);
}

.gate-panel {
  width: min(420px, 100%);
  background: var(--c-bg-card, #fff);
  border: 1px solid var(--c-border, #e3eaf5);
  border-radius: 16px;
  padding: 28px 24px;
  box-shadow: 0 10px 40px rgba(31, 45, 61, 0.12);
  text-align: center;
}

.gate-logo {
  font-size: 20px;
  font-weight: 800;
  color: var(--c-primary, #2F7CF6);
  margin-bottom: 14px;
}

.gate-spinner {
  width: 34px;
  height: 34px;
  margin: 8px auto 12px;
  border: 3px solid var(--c-border, #d5e2f7);
  border-top-color: var(--c-primary, #2F7CF6);
  border-radius: 50%;
  animation: gate-spin 0.9s linear infinite;
}

@keyframes gate-spin { to { transform: rotate(360deg); } }

.gate-tip {
  font-size: 13px;
  color: var(--c-text-secondary, #5b6b7f);
  margin-top: 10px;
}

.gate-desc {
  font-size: 14px;
  color: var(--c-text-secondary, #5b6b7f);
  text-align: left;
  margin-bottom: 12px;
}

.gate-list {
  list-style: none;
  margin: 0 0 18px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.gate-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  background: var(--c-bg-soft, #f4f7fc);
  border-radius: 10px;
  padding: 12px 14px;
}

.gate-item-icon { font-size: 24px; }

.gate-item-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--c-text-primary, #1f2d3d);
}

.gate-item-name em {
  font-style: normal;
  font-size: 11px;
  color: var(--c-primary, #2F7CF6);
  background: var(--c-primary-light, #e8f1ff);
  border-radius: 999px;
  padding: 1px 8px;
  margin-left: 6px;
}

.gate-item-desc {
  font-size: 12px;
  color: var(--c-text-secondary, #5b6b7f);
  margin-top: 3px;
}

.gate-bar-track {
  height: 8px;
  background: var(--c-border, #e5ecf7);
  border-radius: 999px;
  overflow: hidden;
  flex: 1;
  min-width: 0;
}

.gate-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--c-primary, #2F7CF6), var(--c-primary-light, #8fbcfd));
  border-radius: 999px;
  transition: width 0.3s ease;
}

.gate-loading .gate-bar-track,
.gate-loading .gate-num {
  margin-top: 8px;
}

.gate-num {
  font-size: 12px;
  color: var(--c-text-muted, #93a1b3);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.gate-dl-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
}

.gate-dl-label {
  font-size: 13px;
  color: var(--c-text-secondary, #5b6b7f);
  width: 76px;
  text-align: left;
  flex-shrink: 0;
}

.gate-error {
  margin-top: 14px;
  font-size: 13px;
  color: #c0392b;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

.gate-fine {
  margin-top: 10px;
  font-size: 12px;
  color: var(--c-text-muted, #93a1b3);
}

.gate-ask .btn + .btn { margin-top: 10px; }

.gate-fade-enter-active,
.gate-fade-leave-active { transition: opacity 0.35s ease; }
.gate-fade-enter-from,
.gate-fade-leave-to { opacity: 0; }
</style>
