<template>
  <div class="quiz-box">
    <div v-if="question" class="quiz-question">{{ question }}</div>
    <div class="quiz-options">
      <button
        v-for="opt in options"
        :key="opt.key"
        class="quiz-option"
        :class="{
          selected: selectedKey === opt.key,
          correct: reveal && opt.key === answerKey,
          wrong: reveal && selectedKey === opt.key && opt.key !== answerKey
        }"
        :disabled="reveal"
        @click="$emit('select', opt.key)"
      >
        <span class="quiz-option-label">{{ opt.label }}</span>
        <span v-if="reveal && opt.key === answerKey" class="quiz-option-mark">✓</span>
        <span v-else-if="reveal && selectedKey === opt.key && opt.key !== answerKey" class="quiz-option-mark">✗</span>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  question: { type: String, default: '' },
  options: { type: Array, required: true }, // [{ key, label }]
  selectedKey: { type: [String, Number], default: null },
  answerKey: { type: [String, Number], default: null },
  reveal: { type: Boolean, default: false }
})

defineEmits(['select'])
</script>

<style scoped>
.quiz-question {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: var(--space-md);
}

.quiz-option-label {
  flex: 1;
}

.quiz-option-mark {
  font-weight: 800;
}
</style>
