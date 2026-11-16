<template>
  <div class="word-card card">
    <div class="word-card-head">
      <div v-if="title" class="word-card-title">{{ title }}</div>
      <button
        v-if="word"
        class="word-card-star"
        :class="{ active: saved }"
        :title="saved ? '从生词本移除' : '加入生词本'"
        :aria-label="saved ? '从生词本移除' : '加入生词本'"
        @click="toggleSave"
      >{{ saved ? '★' : '☆' }}</button>
    </div>
    <div class="word-card-main">
      <span v-if="word" class="word-card-word">{{ word }}</span>
      <span v-if="phonetic" class="word-card-ipa ipa">{{ phonetic }}</span>
    </div>
    <div v-if="zh" class="word-card-zh">{{ zh }}</div>
    <div v-if="extra" class="word-card-extra">{{ extra }}</div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useProgressStore } from '../stores/progress'

const props = defineProps({
  title: { type: String, default: '' },
  word: { type: String, default: '' },
  phonetic: { type: String, default: '' },
  zh: { type: String, default: '' },
  extra: { type: String, default: '' },
  pos: { type: String, default: '' }
})

const progress = useProgressStore()
const saved = ref(false)

const itemKey = computed(() => (props.word ? `${props.word}|${props.pos}` : ''))

watch(
  () => props.word,
  () => {
    saved.value = !!(itemKey.value && progress.isInWordbook(itemKey.value))
  },
  { immediate: true }
)

function toggleSave() {
  if (!itemKey.value) return
  saved.value = progress.toggleWordbook(itemKey.value)
}
</script>

<style scoped>
.word-card {
  text-align: center;
  padding: var(--space-lg);
}

.word-card-head {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
}

.word-card-title {
  font-size: 13px;
  color: var(--c-text-muted);
  margin-bottom: var(--space-xs);
}

.word-card-star {
  background: none;
  border: none;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  color: var(--c-text-muted);
  padding: 2px;
}

.word-card-star.active {
  color: #f5b301;
}

.word-card-main {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.word-card-word {
  font-size: 44px;
  font-weight: 800;
  color: var(--c-primary);
  letter-spacing: 2px;
}

.word-card-ipa {
  font-size: 22px;
  color: var(--c-text-secondary);
}

.word-card-zh {
  font-size: 16px;
  color: var(--c-text);
  margin-top: var(--space-xs);
}

.word-card-extra {
  font-size: 14px;
  color: var(--c-text-muted);
  margin-top: var(--space-xs);
}
</style>
