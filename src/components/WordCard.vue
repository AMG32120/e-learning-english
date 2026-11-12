<template>
  <div class="word-card card">
    <div v-if="title" class="word-card-title">{{ title }}</div>
    <div class="word-card-main">
      <span v-if="word" class="word-card-word">{{ word }}</span>
      <span v-if="phonetic" class="word-card-ipa ipa">{{ phonetic }}</span>
    </div>
    <div v-if="zh" class="word-card-zh">{{ zh }}</div>
    <div v-if="extra" class="word-card-extra">{{ extra }}</div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  word: { type: String, default: '' },
  phonetic: { type: String, default: '' },
  zh: { type: String, default: '' },
  extra: { type: String, default: '' }
})
</script>

<style scoped>
.word-card {
  text-align: center;
  padding: var(--space-lg);
}

.word-card-title {
  font-size: 13px;
  color: var(--c-text-muted);
  margin-bottom: var(--space-xs);
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
