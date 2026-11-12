<template>
  <div class="dialogue-panel">
    <div class="dialogue-head">
      <span class="dialogue-emoji">{{ scene.emoji }}</span>
      <div>
        <div class="dialogue-title">{{ scene.title }}</div>
        <div class="dialogue-hint">逐句播放示范并跟读，完成后自评</div>
      </div>
      <button class="btn btn-soft dialogue-play-all" @click="playAll">
        播放全篇
      </button>
    </div>

    <TtsButton v-if="allText" :text="allText" :rate="0.75" ref="allBtn" class="dialogue-hidden-trigger" />

    <div class="dialogue-lines">
      <div v-for="(line, i) in scene.lines" :key="i" class="dialogue-line" :class="{ done: scores[i] }">
        <div class="line-main">
          <span class="line-en">{{ line.en }}</span>
          <TtsButton :text="line.en" :rate="0.7" aria-label="播放本句" />
        </div>
        <div class="line-sub">
          <span class="line-zh">{{ line.zh }}</span>
          <span v-if="line.note" class="line-note">💡 {{ line.note }}</span>
        </div>
        <div class="line-rate">
          <span class="line-rate-label">跟读自评：</span>
          <button class="btn btn-soft btn-sm" :disabled="scores[i]" @click="rate(i, 3)">好（3）</button>
          <button class="btn btn-soft btn-sm" :disabled="scores[i]" @click="rate(i, 2)">一般（2）</button>
          <button class="btn btn-ghost btn-sm" :disabled="scores[i]" @click="rate(i, 1)">需重练（1）</button>
          <span v-if="scores[i]" class="line-rated">✓ 已评 {{ scores[i] }} 星</span>
        </div>
      </div>
    </div>

    <div v-if="scene.tips && scene.tips.length" class="dialogue-tips">
      <div class="dialogue-tips-title">知识点备注</div>
      <ul>
        <li v-for="(tip, i) in scene.tips" :key="i">{{ tip }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import TtsButton from './TtsButton.vue'

const props = defineProps({
  scene: { type: Object, required: true }
})
const emit = defineEmits(['done'])

const scores = ref([])
const allBtn = ref(null)

const allText = computed(() => props.scene.lines.map((l) => l.en).join(' '))

function rate(i, score) {
  if (scores.value[i]) return
  scores.value[i] = score
  if (scores.value.every((s) => s !== undefined)) {
    const avg = scores.value.reduce((a, b) => a + b, 0) / scores.value.length
    emit('done', Math.max(1, Math.round(avg)))
  }
}

function playAll() {
  if (allBtn.value) allBtn.value.speak()
}
</script>

<style scoped>
.dialogue-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.dialogue-head {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--c-border);
}

.dialogue-emoji {
  font-size: 32px;
}

.dialogue-title {
  font-size: 18px;
  font-weight: 800;
}

.dialogue-hint {
  font-size: 13px;
  color: var(--c-text-secondary);
}

.dialogue-play-all {
  margin-left: auto;
}

.dialogue-hidden-trigger {
  display: none;
}

.dialogue-lines {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.dialogue-line {
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  padding: var(--space-sm);
  background: var(--c-card);
}

.dialogue-line.done {
  border-color: var(--c-primary);
}

.line-main {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.line-en {
  font-size: 16px;
  font-weight: 700;
}

.line-sub {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: var(--space-xs);
  color: var(--c-text-secondary);
  font-size: 14px;
}

.line-note {
  font-size: 13px;
}

.line-rate {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-top: var(--space-xs);
  flex-wrap: wrap;
}

.line-rate-label {
  font-size: 13px;
  color: var(--c-text-secondary);
}

.line-rated {
  font-size: 13px;
  color: var(--c-primary);
  font-weight: 600;
}

.dialogue-tips {
  border-left: 3px solid var(--c-primary);
  background: var(--c-primary-light);
  border-radius: var(--radius-sm);
  padding: var(--space-sm);
}

.dialogue-tips-title {
  font-weight: 700;
  margin-bottom: var(--space-xs);
  font-size: 14px;
}

.dialogue-tips ul {
  margin: 0;
  padding-left: var(--space-md);
  font-size: 13px;
  color: var(--c-text-secondary);
}

@media (max-width: 767px) {
  .dialogue-play-all {
    margin-left: 0;
  }
}
</style>
