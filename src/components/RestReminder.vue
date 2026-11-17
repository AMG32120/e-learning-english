<template>
  <transition name="rest-fade">
    <div v-if="visible" class="rest-overlay" @click.self="snooze">
      <div class="rest-card" role="alertdialog" aria-label="休息提醒">
        <div class="rest-emoji">☕</div>
        <h2 class="rest-title">该休息一下啦</h2>
        <p class="rest-desc">
          你今天已经学习了 <strong>{{ minutes }}</strong> 分钟，
          <br />适当休息能让记忆更牢固哦。
        </p>
        <div class="rest-actions">
          <button class="rest-btn primary" @click="takeBreak">好，去休息</button>
          <button class="rest-btn ghost" @click="snooze">再学一会儿</button>
        </div>
        <p class="rest-tip">选择「再学一会儿」将在 10 分钟后再次提醒</p>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '../stores/auth'

// 每累计学习 45 分钟提醒一次；「再学一会儿」延后 10 分钟
const THRESHOLD_SEC = 45 * 60
const SNOOZE_SEC = 10 * 60
const STORE_KEY = 'qc-rest-reminder'

const auth = useAuthStore()
const visible = ref(false)
const seconds = ref(0)
let snoozeUntil = 0
let timer = null

const minutes = computed(() => Math.max(1, Math.round(seconds.value / 60)))

function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) || 'null')
    const today = new Date().toISOString().slice(0, 10)
    if (raw && raw.date === today && typeof raw.seconds === 'number') {
      seconds.value = raw.seconds
    } else {
      seconds.value = 0
    }
  } catch {
    seconds.value = 0
  }
}

function saveState() {
  try {
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({ date: new Date().toISOString().slice(0, 10), seconds: seconds.value })
    )
  } catch {
    /* 存储失败不影响计时 */
  }
}

function tick() {
  if (visible.value) return
  if (!auth.isLoggedIn) return
  // 页面切走或最小化时不计时
  if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return
  seconds.value += 1
  if (seconds.value % 15 === 0) saveState()
  if (seconds.value >= THRESHOLD_SEC && Date.now() >= snoozeUntil) {
    visible.value = true
    saveState()
  }
}

// 确认休息：清零今日累计，重新开始计时
function takeBreak() {
  seconds.value = 0
  snoozeUntil = 0
  visible.value = false
  saveState()
}

// 延后 10 分钟再提醒
function snooze() {
  snoozeUntil = Date.now() + SNOOZE_SEC * 1000
  visible.value = false
}

onMounted(() => {
  loadState()
  timer = setInterval(tick, 1000)
  document.addEventListener('visibilitychange', onVisibility)
})

function onVisibility() {
  // 从后台回到前台时立即补一次检查，避免错过提醒时机
  if (document.visibilityState === 'visible') tick()
}

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  document.removeEventListener('visibilitychange', onVisibility)
  saveState()
})
</script>

<style scoped>
.rest-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 30, 55, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  padding: 20px;
}

.rest-card {
  background: var(--c-bg-card);
  color: var(--c-text);
  border-radius: 16px;
  padding: 28px 24px 20px;
  max-width: 340px;
  width: 100%;
  text-align: center;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
}

.rest-emoji {
  font-size: 44px;
  line-height: 1;
  margin-bottom: 12px;
}

.rest-title {
  margin: 0 0 8px;
  font-size: 19px;
  font-weight: 700;
}

.rest-desc {
  margin: 0 0 18px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--c-text-secondary);
}

.rest-desc strong {
  color: var(--c-primary);
  font-size: 17px;
}

.rest-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rest-btn {
  border: none;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.rest-btn:hover {
  opacity: 0.88;
}

.rest-btn.primary {
  background: var(--c-primary);
  color: #fff;
}

.rest-btn.ghost {
  background: var(--c-bg-soft);
  color: var(--c-text-secondary);
}

.rest-tip {
  margin: 14px 0 0;
  font-size: 12px;
  color: var(--c-text-muted);
}

.rest-fade-enter-active,
.rest-fade-leave-active {
  transition: opacity 0.25s;
}

.rest-fade-enter-from,
.rest-fade-leave-to {
  opacity: 0;
}
</style>
