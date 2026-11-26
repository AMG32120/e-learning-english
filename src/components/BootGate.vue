<template>
  <transition name="gate-fade">
    <div v-if="phase !== 'hidden'" class="boot-gate">
      <!-- 词库加载画面（真人发音引擎已下线，发音走系统语音，无需下载） -->
      <div class="gate-panel gate-loading">
        <div class="gate-logo">启程英语</div>
        <div class="gate-spinner"></div>
        <p class="gate-tip">{{ wordError ? '词库加载失败' : '正在加载学习词库…' }}</p>
        <div class="gate-bar-track">
          <div class="gate-bar" :style="{ width: wordPct + '%' }"></div>
        </div>
        <p class="gate-num">词库 {{ wordProgress.loaded }} / {{ wordProgress.total }}</p>
        <p v-if="wordError" class="gate-error">
          词库加载失败，请检查网络后重试。
          <button class="btn btn-primary" @click="retryWordData">重试</button>
        </p>
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

const phase = ref('checking') // checking | loading | hidden
const wordProgress = ref(getWordDataProgress())
const wordError = ref(false)
const wordDone = ref(false)

const wordPct = computed(() => {
  const { loaded, total } = wordProgress.value
  return total ? Math.round((loaded / total) * 100) : 0
})

/* ---------- 事件监听：词库文件数进度 ---------- */

function onWordProgress(e) {
  wordProgress.value = { ...e.detail }
}
function onOnline() {
  if (wordError.value) retryWordData()
}

onMounted(() => {
  window.addEventListener('worddata-progress', onWordProgress)
  window.addEventListener('online', onOnline)

  /* 词库下载在 main.js 已启动，这里只接管其结果 */
  preloadWordData()
    .then(() => {
      wordDone.value = true
      wordError.value = false
    })
    .catch(() => {
      wordError.value = true
    })

  if (isWordDataReady()) {
    // 二次访问：词库已就绪，直接进入
    phase.value = 'hidden'
    return
  }

  phase.value = 'loading'

  /* 词库完成后自动退出引导 */
  const finishWhenReady = () => {
    if (wordDone.value && phase.value === 'loading') {
      phase.value = 'hidden'
      return
    }
    setTimeout(finishWhenReady, 200)
  }
  finishWhenReady()
})

onBeforeUnmount(() => {
  window.removeEventListener('worddata-progress', onWordProgress)
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

.gate-bar-track {
  height: 8px;
  background: var(--c-border, #e5ecf7);
  border-radius: 999px;
  overflow: hidden;
}

.gate-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--c-primary, #2F7CF6), var(--c-primary-light, #8fbcfd));
  border-radius: 999px;
  transition: width 0.3s ease;
}

.gate-num {
  font-size: 12px;
  color: var(--c-text-muted, #93a1b3);
  margin-top: 8px;
  font-variant-numeric: tabular-nums;
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

.gate-fade-enter-active,
.gate-fade-leave-active { transition: opacity 0.35s ease; }
.gate-fade-enter-from,
.gate-fade-leave-to { opacity: 0; }
</style>
