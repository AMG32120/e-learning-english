<template>
  <button
    class="tts-btn"
    :class="{ playing, loading }"
    :aria-label="ariaLabel || '播放发音'"
    :title="loading ? `神经音质首次加载中 ${progressText}` : '点击播放发音'"
    @click="play"
  >
    <svg v-if="!playing" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z" />
    </svg>
    <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 9v6h4l5 5V4L7 9H3zm18 3-2-2-2 2-1.4-1.4 2-2-2-2L17 6.2l2 2 2-2 1.4 1.4-2 2 2 2L21 12z" />
    </svg>
  </button>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { speak, stopSpeak, queueKokoroPrefetch } from '../services/tts'

const props = defineProps({
  text: { type: String, required: true },
  rate: { type: Number, default: 0.85 },
  ariaLabel: { type: String, default: '' }
})

const playing = ref(false)
const loading = ref(false)
const progressText = ref('')

/* Kokoro 模型首次下载进度（约 88MB，完成后永久缓存，不再提示） */
function onKokoroEvent(e) {
  const d = e.detail || {}
  if (d.phase === 'progress') {
    loading.value = true
    const pct = d.total ? Math.round((d.loaded / d.total) * 100) : 0
    progressText.value = pct + '%'
  } else if (d.phase === 'warming') {
    loading.value = true
    progressText.value = '预热'
  } else if (d.phase === 'ready') {
    loading.value = false
  } else if (d.phase === 'error') {
    loading.value = false
  }
}

onMounted(() => {
  window.addEventListener('tts-kokoro', onKokoroEvent)
  // 课程页面渲染出按钮后，把文本加入后台预合成队列：
  // 空闲时提前合成入缓存，用户点播放直接秒出（弱设备首次合成需数秒）
  queueKokoroPrefetch([{ text: props.text, rate: props.rate }])
})
onBeforeUnmount(() => window.removeEventListener('tts-kokoro', onKokoroEvent))

async function play() {
  if (playing.value) {
    stopSpeak()
    playing.value = false
    return
  }
  await speak(props.text, {
    rate: props.rate,
    onStart: () => (playing.value = true),
    onEnd: () => (playing.value = false),
    onError: () => (playing.value = false)
  })
  // result.engine: kokoro=神经合成（正常播放，不提示）；system=系统语音兜底；
  // none=全部不可用 → speak() 内部已弹全局 toast 引导下载，无需在此 alert
}

watch(
  () => props.text,
  (t) => {
    stopSpeak()
    playing.value = false
    if (t) queueKokoroPrefetch([{ text: t, rate: props.rate }])
  }
)

onBeforeUnmount(() => {
  stopSpeak()
})
</script>

<style scoped>
.tts-btn.loading {
  animation: tts-pulse 1.2s ease-in-out infinite;
}
@keyframes tts-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}
</style>
