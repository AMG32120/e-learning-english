<template>
  <div class="audio-player">
    <template v-if="phase === 'study'">
      <div class="ap-head">
        <span class="ap-emoji">{{ material.emoji }}</span>
        <span class="ap-title">{{ material.title }}</span>
      </div>

      <div class="ap-demo">
        <TtsButton :text="material.script.map((s) => s.en).join(' ')" :rate="0.7" aria-label="播放全文" />
        <span>点击喇叭播放全文，也可逐句点击重听</span>
      </div>

      <div class="ap-script">
        <div v-for="(line, i) in material.script" :key="i" class="ap-line">
          <div class="ap-line-en">
            <TtsButton :text="line.en" :rate="0.7" aria-label="播放本句" />
            <span>{{ line.en }}</span>
          </div>
          <div class="ap-line-zh">{{ line.zh }}</div>
        </div>
      </div>

      <button class="btn btn-primary btn-block" @click="startQuiz">我已听完，开始答题</button>
    </template>

    <template v-else>
      <div class="ap-quiz-head">
        <span>听力理解 {{ qIndex + 1 }} / {{ questions.length }}</span>
        <span>答对 {{ correctCount }} / {{ answeredCount }}</span>
      </div>

      <div class="ap-question">
        <div class="stage-prompt">{{ current.prompt }}</div>
        <TtsButton
          v-if="current.audioLine"
          :text="current.audioLine"
          :rate="0.7"
          aria-label="重听相关句子"
        />
      </div>

      <QuizBox
        :options="current.options"
        :selected-key="selected"
        :answer-key="revealed ? current.answer : null"
        :reveal="revealed"
        @select="choose"
      />

      <div v-if="revealed" class="stage-feedback">
        <span v-if="selected === current.answer" class="feedback-ok">回答正确！</span>
        <span v-else class="feedback-no">正确答案：{{ current.correctLabel }}</span>
      </div>

      <button class="btn btn-primary btn-block" :disabled="!revealed" @click="nextQ">
        {{ qIndex === questions.length - 1 ? '完成' : '下一题' }}
      </button>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import QuizBox from './QuizBox.vue'
import TtsButton from './TtsButton.vue'

const props = defineProps({
  material: { type: Object, required: true }
})
const emit = defineEmits(['done'])

const phase = ref('study')
const qIndex = ref(0)
const selected = ref(null)
const revealed = ref(false)
const correctCount = ref(0)
const answeredCount = ref(0)

const questions = computed(() =>
  props.material.questions.map((item) => ({
    prompt: item.q,
    audioLine: (props.material.script || []).map((s) => s.en).join(' '),
    answer: item.answer,
    options: item.options.map((t, k) => ({ key: k, label: t })),
    correctLabel: item.options[item.answer]
  }))
)
const current = computed(() => questions.value[qIndex.value] || {})

function startQuiz() {
  phase.value = 'quiz'
}

function choose(k) {
  if (revealed.value) return
  selected.value = k
  revealed.value = true
  answeredCount.value += 1
  if (k === current.value.answer) correctCount.value += 1
}

function nextQ() {
  if (qIndex.value < questions.value.length - 1) {
    qIndex.value += 1
    selected.value = null
    revealed.value = false
  } else {
    finish()
  }
}

function finish() {
  const total = questions.value.length
  const ratio = total ? correctCount.value / total : 0
  const stars = ratio >= 1 ? 3 : ratio >= 0.7 ? 2 : 1
  emit('done', stars)
}
</script>

<style scoped>
.ap-head {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 18px;
  font-weight: 700;
  margin-bottom: var(--space-md);
}

.ap-emoji {
  font-size: 26px;
}

.ap-demo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
  color: var(--c-text-secondary);
  font-size: 14px;
}

.ap-script {
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  margin-bottom: var(--space-md);
  max-height: 380px;
  overflow-y: auto;
  background: var(--c-card);
}

.ap-line {
  padding: var(--space-xs) 0;
  border-bottom: 1px dashed var(--c-border);
}

.ap-line:last-child {
  border-bottom: none;
}

.ap-line-en {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 16px;
  font-weight: 500;
}

.ap-line-zh {
  margin-top: 2px;
  padding-left: 40px;
  font-size: 14px;
  color: var(--c-text-secondary);
}

.ap-quiz-head {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--c-text-secondary);
  margin-bottom: var(--space-md);
}

.ap-question {
  margin-bottom: var(--space-md);
}
</style>
