<template>
  <div>
    <main class="page-container">
      <h1 class="page-title">生词本与错题本</h1>
      <p class="page-sub">收藏生词、整理错题，随时重练巩固</p>

      <!-- 页签 -->
      <div class="wb-tabs">
        <button class="wb-tab" :class="{ active: tab === 'words' }" @click="tab = 'words'">
          生词本 <span class="wb-tab-num">{{ entries.length }}</span>
        </button>
        <button class="wb-tab" :class="{ active: tab === 'mistakes' }" @click="tab = 'mistakes'">
          错题本 <span class="wb-tab-num">{{ progress.mistakeCount }}</span>
        </button>
      </div>

      <!-- ============ 生词本 ============ -->
      <section v-if="tab === 'words'" class="card">
        <div v-if="!entries.length" class="empty-state">
          <p class="empty-icon">📖</p>
          <p>生词本还是空的</p>
          <p class="empty-hint">在关卡学习中点击单词卡右上角的 ☆，即可收藏生词。</p>
          <router-link class="btn btn-primary" to="/map">去闯关学习</router-link>
        </div>
        <template v-else>
          <div v-for="e in entries" :key="e.itemKey" class="wb-word-row">
            <div class="wb-word-info">
              <div class="wb-word-main">
                <span class="wb-word">{{ e.word }}</span>
                <span v-if="e.ipa" class="wb-ipa ipa">{{ e.ipa }}</span>
                <span v-if="e.pos" class="wb-pos">{{ e.pos }}</span>
              </div>
              <div class="wb-zh">{{ e.zh }}</div>
            </div>
            <div class="wb-word-actions">
              <TtsButton :text="e.word" aria-label="播放发音" />
              <button class="wb-icon-btn" title="移出生词本" @click="remove(e.itemKey)">✕</button>
            </div>
          </div>
          <div class="wb-extra-actions">
            <router-link class="btn btn-soft" to="/flashcards">🃏 卡片快刷</router-link>
            <button class="btn btn-primary wb-bottom-btn" @click="startSpell">
              练一练这些生词（拼写模式）
            </button>
          </div>
        </template>
      </section>

      <!-- ============ 错题本 ============ -->
      <section v-else class="card">
        <!-- 重练模式 -->
        <template v-if="phase === 'quiz'">
          <div class="quiz-progress">错题重练 第 {{ quizIndex + 1 }} / {{ quizList.length }} 题</div>
          <div class="quiz-body">
            <p class="quiz-q">{{ currentM.q }}</p>
            <div class="quiz-options">
              <button
                v-for="opt in currentM.options"
                :key="opt.key"
                class="quiz-opt"
                :class="{
                  correct: quizPicked !== null && opt.key === currentM.answerKey,
                  wrong: quizPicked !== null && quizPicked === opt.key && opt.key !== currentM.answerKey
                }"
                :disabled="quizPicked !== null"
                @click="pickMistake(opt.key)"
              >
                <span class="opt-label">{{ opt.key }}.</span>{{ opt.label }}
              </button>
            </div>
            <p v-if="quizPicked !== null && currentM.explain" class="quiz-explain">{{ currentM.explain }}</p>
            <p v-if="quizPicked !== null" class="quiz-verdict" :class="{ ok: quizPicked === currentM.answerKey }">
              {{ quizPicked === currentM.answerKey ? '答对了！本题已从错题本移除 🎉' : '答错了，本题继续保留在错题本' }}
            </p>
            <button v-if="quizPicked !== null" class="btn btn-primary btn-block" @click="nextMistake">
              {{ quizIndex + 1 >= quizList.length ? '完成' : '下一题' }}
            </button>
          </div>
        </template>

        <!-- 列表模式 -->
        <template v-else>
          <div v-if="!activeMistakes.length" class="empty-state">
            <p class="empty-icon">✅</p>
            <p>错题本是空的</p>
            <p class="empty-hint">答错的题目会自动收录到这里，方便集中攻克。</p>
          </div>
          <template v-else>
            <div class="mistake-actions-top">
              <button class="btn btn-primary" @click="startQuiz">重练全部错题（{{ activeMistakes.length }}）</button>
              <button v-if="progress.data && progress.data.mistakes.some((m) => m.resolved)" class="btn btn-ghost" @click="progress.clearResolvedMistakes">
                清理已消化
              </button>
            </div>
            <div v-for="m in progress.data.mistakes" :key="m.id" class="mistake-item" :class="{ resolved: m.resolved }">
              <div class="mistake-head">
                <span class="mistake-source">{{ m.source }}</span>
                <button class="wb-icon-btn" title="删除" @click="progress.removeMistake(m.id)">✕</button>
              </div>
              <p class="mistake-q">{{ m.q }}</p>
              <p class="mistake-answer">正确答案：<strong>{{ labelOf(m) }}</strong></p>
              <p v-if="m.explain" class="mistake-explain">{{ m.explain }}</p>
              <span v-if="m.resolved" class="mistake-ok">已消化</span>
            </div>
          </template>
        </template>
      </section>
    </main>
    <BottomTab />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BottomTab from '../components/BottomTab.vue'
import TtsButton from '../components/TtsButton.vue'
import { useProgressStore } from '../stores/progress'

const router = useRouter()
const progress = useProgressStore()

const tab = ref('words')

/* ---------- 生词本 ---------- */
const entries = computed(() => progress.wordbookEntries)

function remove(itemKey) {
  progress.toggleWordbook(itemKey)
}

function startSpell() {
  router.push('/practice?mode=spell&source=wordbook')
}

/* ---------- 错题本 ---------- */
const phase = ref('list') // list | quiz
const quizList = ref([])
const quizIndex = ref(0)
const quizPicked = ref(null)
const quizCorrect = ref(0)

const activeMistakes = computed(() => {
  if (!progress.data || !Array.isArray(progress.data.mistakes)) return []
  return progress.data.mistakes.filter((m) => !m.resolved)
})

const currentM = computed(() => quizList.value[quizIndex.value] || null)

function labelOf(m) {
  const opt = (m.options || []).find((o) => o.key === m.answerKey)
  if (opt) return opt.label
  return typeof m.answerKey === 'string' ? m.answerKey : ''
}

function startQuiz() {
  quizList.value = shuffle([...activeMistakes.value])
  if (!quizList.value.length) return
  quizIndex.value = 0
  quizPicked.value = null
  quizCorrect.value = 0
  phase.value = 'quiz'
}

function pickMistake(key) {
  if (quizPicked.value !== null) return
  quizPicked.value = key
  if (key === currentM.value.answerKey) {
    quizCorrect.value += 1
    progress.resolveMistake(currentM.value.id)
  }
}

function nextMistake() {
  if (quizIndex.value + 1 >= quizList.value.length) {
    progress.recordQuiz({ correct: quizCorrect.value, total: quizList.value.length })
    phase.value = 'list'
    return
  }
  quizIndex.value += 1
  quizPicked.value = null
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

onMounted(() => {
  progress.loadForCurrentUser()
})
</script>

<style scoped>
.page-sub {
  color: var(--c-text-secondary);
  font-size: 13px;
  margin-top: 2px;
  margin-bottom: var(--space-md);
}

.wb-tabs {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.wb-tab {
  flex: 1;
  padding: 10px 0;
  border: 1px solid var(--c-border);
  border-radius: 12px;
  background: var(--c-bg-card);
  color: var(--c-text-secondary);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.wb-tab.active {
  border-color: var(--c-primary);
  background: var(--c-primary);
  color: #fff;
}

.wb-tab-num {
  font-size: 13px;
  opacity: 0.85;
}

.empty-state {
  text-align: center;
  padding: 24px 8px;
  color: var(--c-text-secondary);
}

.empty-icon {
  font-size: 36px;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 13px;
  color: var(--c-text-muted);
  margin-top: 6px;
  margin-bottom: 14px;
}

/* 生词行 */
.wb-word-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  padding: 12px 0;
  border-bottom: 1px solid var(--c-border);
}

.wb-word-row:last-of-type {
  border-bottom: none;
}

.wb-word-main {
  display: flex;
  align-items: baseline;
  gap: var(--space-xs);
  flex-wrap: wrap;
}

.wb-word {
  font-size: 20px;
  font-weight: 700;
  color: var(--c-primary);
}

.wb-ipa {
  font-size: 14px;
  color: var(--c-text-secondary);
}

.wb-pos {
  font-size: 12px;
  color: var(--c-text-muted);
  background: var(--c-bg-soft);
  border-radius: 6px;
  padding: 1px 6px;
  font-style: italic;
}

.wb-zh {
  font-size: 14px;
  color: var(--c-text);
  margin-top: 2px;
}

.wb-word-actions {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  flex-shrink: 0;
}

.wb-icon-btn {
  background: none;
  border: none;
  color: var(--c-text-muted);
  font-size: 15px;
  cursor: pointer;
  padding: 6px;
}

.wb-icon-btn:hover {
  color: var(--c-danger, #ef4444);
}

.wb-extra-actions {
  margin-top: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.wb-bottom-btn {
  width: 100%;
}

/* 错题列表 */
.mistake-actions-top {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.mistake-item {
  position: relative;
  border: 1px solid var(--c-border);
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: var(--space-sm);
  background: var(--c-bg-soft);
}

.mistake-item.resolved {
  opacity: 0.65;
}

.mistake-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.mistake-source {
  font-size: 12px;
  color: var(--c-text-muted);
  background: var(--c-bg-card);
  border-radius: 6px;
  padding: 2px 8px;
}

.mistake-q {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.5;
  margin-bottom: 6px;
}

.mistake-answer {
  font-size: 14px;
  color: var(--c-text);
}

.mistake-answer strong {
  color: var(--c-success, #22c55e);
}

.mistake-explain {
  font-size: 13px;
  color: var(--c-text-secondary);
  margin-top: 4px;
}

.mistake-ok {
  position: absolute;
  right: 12px;
  bottom: 10px;
  font-size: 12px;
  color: var(--c-success, #22c55e);
  font-weight: 600;
}

/* 重练 */
.quiz-progress {
  font-size: 13px;
  color: var(--c-text-muted);
  margin-bottom: 16px;
  text-align: center;
}

.quiz-q {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  line-height: 1.5;
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: 16px;
}

.quiz-opt {
  text-align: left;
  padding: 12px 14px;
  border: 1px solid var(--c-border);
  border-radius: 12px;
  background: var(--c-bg-card);
  color: var(--c-text);
  font-size: 15px;
  cursor: pointer;
}

.quiz-opt.correct {
  border-color: var(--c-success, #22c55e);
  background: rgba(34, 197, 94, 0.12);
}

.quiz-opt.wrong {
  border-color: var(--c-danger, #ef4444);
  background: rgba(239, 68, 68, 0.1);
}

.opt-label {
  display: inline-block;
  min-width: 22px;
  font-weight: 700;
}

.quiz-explain {
  background: var(--c-bg-soft);
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 14px;
  color: var(--c-text-secondary);
  margin-bottom: 12px;
}

.quiz-verdict {
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: var(--c-danger, #ef4444);
  margin-bottom: 12px;
}

.quiz-verdict.ok {
  color: var(--c-success, #22c55e);
}

.btn-block {
  width: 100%;
}
</style>
