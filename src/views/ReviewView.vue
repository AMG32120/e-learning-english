<template>
  <div>
    <main class="page-container">
      <h1 class="page-title">间隔重复复习</h1>
      <p class="page-sub">按次日 / 3 日 / 7 日节奏巩固错词错题，连续 2 次答对移出复习池</p>

      <!-- 空状态 -->
      <section v-if="!reviewDue.length && !reviewing" class="card">
        <div class="empty-state">
          <p class="empty-icon">🗒️</p>
          <p>复习池暂无到期项目。</p>
          <p v-if="progress.reviewTomorrowCount > 0" class="empty-hint">
            明天将有 {{ progress.reviewTomorrowCount }} 项到期，记得回来巩固。
          </p>
          <p v-else class="empty-hint">闯关中答错的单词会自动加入复习池，明天记得回来巩固。</p>
        </div>
      </section>

      <!-- 待复习总览 -->
      <section v-else-if="!reviewing" class="card">
        <div class="review-summary">
          <div class="summary-num">{{ reviewDue.length }}</div>
          <div class="summary-text">今日待复习项目（池内共 {{ reviewTotal }} 项）</div>
        </div>
        <ul class="due-list">
          <li v-for="item in reviewDue" :key="item.itemKey" class="due-item">
            <span class="due-word">{{ displayWord(item.itemKey) }}</span>
            <span class="due-meta">错 {{ item.wrongCount }} 次 · 第 {{ item.intervalStage }} 阶段</span>
          </li>
        </ul>
        <button class="btn btn-primary btn-block" @click="startReview">开始复习</button>
      </section>

      <!-- 复习卡片流 -->
      <section v-else class="card review-card">
        <template v-if="current">
          <div class="review-progress">第 {{ doneCount + 1 }} / {{ reviewDue.length }} 项</div>
          <div class="review-word">
            <span class="word-en">{{ current.word }}</span>
            <TtsButton :text="current.word" />
          </div>
          <p class="word-ipa">{{ current.ipa || '' }}</p>
          <p v-if="revealed" class="word-zh">{{ current.zh }}</p>
          <p v-if="revealed && current.example" class="word-example">{{ current.example }}</p>

          <div v-if="!revealed" class="review-actions">
            <button class="btn btn-ghost btn-block" @click="reveal">显示释义</button>
          </div>
          <div v-else class="review-actions two">
            <button class="btn btn-danger" @click="markWrong">答错了，再记一次</button>
            <button class="btn btn-primary" @click="markRight">答对了</button>
          </div>
        </template>
        <div v-else class="empty-state">
          <p class="empty-icon">🎉</p>
          <p>本轮复习完成！</p>
          <p class="empty-hint">连续答对的项目已移出复习池，其余项目将在下次到期时继续复习。</p>
          <button class="btn btn-primary" @click="reviewing = false">返回总览</button>
        </div>
      </section>
    </main>
    <BottomTab />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import BottomTab from '../components/BottomTab.vue'
import TtsButton from '../components/TtsButton.vue'
import { useProgressStore, todayKey } from '../stores/progress'
import { findWord } from '../services/dictionary'

const progress = useProgressStore()

const reviewing = ref(false)
const revealed = ref(false)
const doneCount = ref(0)
const current = ref(null)
let reviewItems = []

const reviewDue = computed(() => {
  if (!progress.data) return []
  const now = todayKey()
  return Object.entries(progress.data.reviewPool || {})
    .filter(([, r]) => r.dueDate <= now)
    .sort((a, b) => (a[1].dueDate < b[1].dueDate ? -1 : 1))
    .map(([itemKey, r]) => ({ itemKey, ...r }))
})

const reviewTotal = computed(() => (progress.data ? Object.keys(progress.data.reviewPool || {}).length : 0))

function displayWord(itemKey) {
  const info = findWord(itemKey)
  return info ? info.word : itemKey
}

function startReview() {
  doneCount.value = 0
  revealed.value = false
  reviewing.value = true
  reviewItems = reviewDue.value.slice()
  advance()
}

function advance() {
  const items = reviewItems
  if (doneCount.value >= items.length) {
    current.value = null
    return
  }
  revealed.value = false
  const info = findWord(items[doneCount.value].itemKey)
  current.value = {
    itemKey: items[doneCount.value].itemKey,
    word: info ? info.word : items[doneCount.value].itemKey,
    ipa: info ? info.ipa : '',
    zh: info ? info.zh : '',
    example: info ? info.example : ''
  }
}

function reveal() {
  revealed.value = true
}

function markRight() {
  progress.reviewCorrect(current.value.itemKey)
  doneCount.value += 1
  advance()
}

function markWrong() {
  progress.reviewWrong(current.value.itemKey)
  doneCount.value += 1
  advance()
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
}
.review-summary {
  text-align: center;
  padding: 12px 0 16px;
}
.summary-num {
  font-size: 40px;
  font-weight: 800;
  color: var(--c-primary);
}
.summary-text {
  color: var(--c-text-secondary);
  font-size: 14px;
  margin-top: 4px;
}
.due-list {
  list-style: none;
  padding: 0;
  margin: 0 0 16px;
}
.due-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--c-border);
}
.due-word {
  font-weight: 600;
}
.due-meta {
  font-size: 12px;
  color: var(--c-text-muted);
}
.review-card {
  text-align: center;
  padding-top: 20px;
}
.review-progress {
  font-size: 13px;
  color: var(--c-text-muted);
  margin-bottom: 16px;
}
.review-word {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}
.word-en {
  font-size: 32px;
  font-weight: 800;
  color: var(--c-text);
}
.word-ipa {
  color: var(--c-text-secondary);
  margin-top: 4px;
}
.word-zh {
  font-size: 20px;
  font-weight: 600;
  margin-top: 16px;
}
.word-example {
  color: var(--c-text-secondary);
  font-size: 14px;
  margin-top: 8px;
}
.review-actions {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
.review-actions.two {
  flex-direction: row;
}
.review-actions.two .btn {
  flex: 1;
}
.btn-block {
  width: 100%;
}
</style>
