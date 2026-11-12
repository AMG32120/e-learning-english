<template>
  <button
    class="tts-btn"
    :class="{ playing }"
    :aria-label="ariaLabel || '播放发音'"
    title="点击播放发音"
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
import { ref, watch, onBeforeUnmount } from 'vue'
import { speak, stopSpeak } from '../services/tts'

const props = defineProps({
  text: { type: String, required: true },
  rate: { type: Number, default: 0.85 },
  ariaLabel: { type: String, default: '' }
})

const playing = ref(false)

async function play() {
  if (playing.value) {
    stopSpeak()
    playing.value = false
    return
  }
  const result = await speak(props.text, {
    rate: props.rate,
    onStart: () => (playing.value = true),
    onEnd: () => (playing.value = false),
    onError: () => (playing.value = false)
  })
  // result.engine: system=系统引擎播放；offline=离线合成兜底（正常播放，不提示）；none=全部不可用
  if (!result.started || result.engine === 'none') {
    alert('未检测到可用的英语语音引擎，系统语音与离线合成均不可用，无法播放发音。请检查系统语音设置（安装英语语音）后刷新页面重试。')
  }
}

watch(
  () => props.text,
  () => {
    stopSpeak()
    playing.value = false
  }
)

onBeforeUnmount(() => {
  stopSpeak()
})
</script>
