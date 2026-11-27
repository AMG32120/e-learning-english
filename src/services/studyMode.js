/* ---------- 学习模式：关卡模式（顺序解锁）/ 自由模式（全部开放） ----------
   默认关卡模式。localStorage 持久化 + Vue ref 响应式：
   progress store 的解锁 getter 读取此 ref，切换后地图/关卡列表即时刷新。 */

import { ref, watch } from 'vue'
import { getSession } from './storage'
import { queuePush } from './cloudSync'

const KEY = 'study-mode' // 'stage' | 'free'

/** 切换后立即触发云端推送（doPush 会把当前值快照进 prefs 一起上云；未登录时静默跳过） */
function syncToCloud() {
  const username = getSession()
  if (username) queuePush(username)
}

function readSaved() {
  try {
    return localStorage.getItem(KEY) === 'free' ? 'free' : 'stage'
  } catch {
    return 'stage'
  }
}

export const studyMode = ref(readSaved())

watch(studyMode, (v) => {
  try {
    localStorage.setItem(KEY, v)
  } catch { /* ignore */ }
})

/* 云端同步落地偏好（cloudSync 拉取合并后派发）：刷新响应式状态，
   地图/关卡列表随即按新模式刷新 */
if (typeof window !== 'undefined') {
  window.addEventListener('app:prefs-synced', (e) => {
    const m = e.detail && e.detail.prefs && e.detail.prefs.studyMode
    if (m === 'stage' || m === 'free') studyMode.value = m
  })
}

export function setStudyMode(mode) {
  studyMode.value = mode === 'free' ? 'free' : 'stage'
  syncToCloud()
}

export function isFreeMode() {
  return studyMode.value === 'free'
}
