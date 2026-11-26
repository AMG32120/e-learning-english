<template>
  <div class="app-shell">
    <!-- 首次资源准备引导（词库 + 真人发音引擎），完成后自动消失 -->
    <BootGate />

    <TopNav v-if="auth.isLoggedIn" />
    <main class="app-main">
      <router-view />
    </main>
    <BottomTab v-if="auth.isLoggedIn && isMobile" />

    <!-- 学习时长休息提醒 -->
    <RestReminder />

    <!-- localStorage 存储超限提示（每次会话最多出现一次） -->
    <transition name="toast-fade">
      <div v-if="quotaToast" class="quota-toast" role="alert">
        <span class="quota-icon">⚠️</span>
        <span class="quota-text">浏览器存储空间不足，最近的进度可能未保存。建议前往「个人中心 → 数据管理」导出进度备份。</span>
        <button class="quota-close" @click="quotaToast = false">×</button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import TopNav from './components/TopNav.vue'
import BottomTab from './components/BottomTab.vue'
import RestReminder from './components/RestReminder.vue'
import BootGate from './components/BootGate.vue'
import { useAuthStore } from './stores/auth'
import { useThemeStore } from './stores/theme'
import { useProgressStore } from './stores/progress'

const auth = useAuthStore()
const theme = useThemeStore()
const progress = useProgressStore()

const isMobile = ref(false)
const quotaToast = ref(false)
let mq = null

function updateMobile(e) {
  isMobile.value = e.matches
}

function onStorageQuota() {
  quotaToast.value = true
  // 15 秒后自动消失，避免长期遮挡
  setTimeout(() => { quotaToast.value = false }, 15000)
}

onMounted(() => {
  auth._loadUserData()
  theme.init()
  if (auth.isLoggedIn) {
    progress.loadForCurrentUser()
  }
  if (typeof window !== 'undefined' && window.matchMedia) {
    mq = window.matchMedia('(max-width: 767px)')
    isMobile.value = mq.matches
    mq.addEventListener('change', updateMobile)
  }
  window.addEventListener('app:storage-quota', onStorageQuota)
})

onBeforeUnmount(() => {
  if (mq && mq.removeEventListener) {
    mq.removeEventListener('change', updateMobile)
  }
  window.removeEventListener('app:storage-quota', onStorageQuota)
})
</script>

<style scoped>
.quota-toast {
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  max-width: min(560px, calc(100vw - 32px));
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #fff6e5;
  color: #8a5a00;
  border: 1px solid #f0c674;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 13px;
  line-height: 1.5;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  z-index: 999;
}

.quota-icon {
  flex-shrink: 0;
}

.quota-text {
  flex: 1;
}

.quota-close {
  flex-shrink: 0;
  background: none;
  border: none;
  font-size: 16px;
  color: #8a5a00;
  cursor: pointer;
  padding: 0 2px;
  line-height: 1.2;
}

[data-theme='night'] .quota-toast {
  background: #3a2f14;
  color: #ffd98a;
  border-color: #6b5a2a;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}
</style>
