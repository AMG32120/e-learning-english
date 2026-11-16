<template>
  <div>
    <main class="page-container">
      <h1 class="page-title">词汇量测试</h1>
      <p class="page-sub">15 道快速自测题，估算你的大致词汇量（约 2 分钟）</p>

      <!-- 准备页 -->
      <section v-if="phase === 'setup'" class="card">
        <div class="setup-info">
          <p class="setup-title">📏 词汇量估算</p>
          <p class="setup-desc">
            从初级（L2 基础词汇）、中级（L5 中级词汇）、高级（L8 学术词汇）三个难度档各抽 5 词。
            只凭<strong>是否认识</strong>判断，不要猜——不确定就选「不认识」，结果更准。
          </p>
          <button class="btn btn-primary btn-block" @click="start">开始测试</button>
          <div v-if="lastEstimate" class="last-est">
            上次测试：约 <strong>{{ lastEstimate.value }}</strong> 词（{{ lastEstimate.date }}）
          </div>
        </div>
      </section>

      <!-- 测试页 -->
      <section v-else-if="phase === 'test'" class="card">
        <div class="train-progress">
          <div class="train-bar"><div class="train-bar-fill" :style="{ width: (index / samples.length) * 100 + '%' }"></div></div>
          <span class="train-num">{{ index + 1 }} / {{ samples.length }}</span>
        </div>
        <div v-if="current" class="vt-body">
          <p class="vt-question">你认识这个单词吗？</p>
          <div class="vt-word">{{ current.word }}</div>
          <div v-if="current.ipa" class="vt-ipa ipa">{{ current.ipa }}</div>
          <div class="vt-actions">
            <button class="btn vt-btn no" @click="answer(false)">😔 不认识</button>
            <button class="btn vt-btn yes" @click="answer(true)">😀 认识</button>
          </div>
          <p class="vt-hint">不确定时请选「不认识」，保证估算准确</p>
        </div>
      </section>

      <!-- 结果页 -->
      <section v-else class="card">
        <div class="result">
          <p class="result-icon">📊</p>
          <p class="result-num">≈ {{ estimate }}</p>
          <p class="result-text">估算词汇量（{{ levelLabel }}）</p>
          <div class="vt-breakdown">
            <div class="vt-row"><span>初级词汇（0-500 词档）</span><span>{{ easyKnown }} / 5</span></div>
            <div class="vt-row"><span>中级词汇（500-2000 词档）</span><span>{{ midKnown }} / 5</span></div>
            <div class="vt-row"><span>高级词汇（2000+ 词档）</span><span>{{ hardKnown }} / 5</span></div>
          </div>
          <p class="result-hint">
            结果已保存；你在本站累计掌握 {{ progress.masteredWordCount }} 词。
            想提升词汇量就去闯关、刷卡片、练听写吧！
          </p>
          <div class="result-actions">
            <button class="btn btn-ghost" @click="phase = 'setup'">再测一次</button>
            <router-link class="btn btn-primary" to="/progress">查看学习统计</router-link>
          </div>
        </div>
      </section>
    </main>
    <BottomTab />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import BottomTab from '../components/BottomTab.vue'
import { useProgressStore, todayKey } from '../stores/progress'
import { getWordsL2, getAllL5Words, getL8Words } from '../services/wordData'

const progress = useProgressStore()

const phase = ref('setup') // setup | test | result
const samples = ref([])
const index = ref(0)
const easyKnown = ref(0)
const midKnown = ref(0)
const hardKnown = ref(0)

/* 抽样：三档各 5 词 */
function sampleWords(pool, n) {
  const a = shuffle(pool.slice())
  return a.slice(0, n)
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function start() {
  const easy = sampleWords(Object.values(getWordsL2()).flat(), 5)
  const mid = sampleWords(getAllL5Words(), 5)
  const hard = sampleWords(getL8Words(), 5)
  samples.value = [...easy, ...mid, ...hard].map((w) => ({
    word: w.word || w.en || '',
    ipa: w.ipa || '',
    zh: w.zh || '',
    band: null
  }))
  // 标记难度档：0=easy 1=mid 2=hard
  samples.value.forEach((s, i) => {
    s.band = i < 5 ? 0 : i < 10 ? 1 : 2
  })
  index.value = 0
  easyKnown.value = 0
  midKnown.value = 0
  hardKnown.value = 0
  phase.value = 'test'
}

const current = computed(() => samples.value[index.value] || null)

/* 估算：每档词对应词量区间；认识数 × 档位跨度，叠加基础量 */
const estimate = computed(() => {
  const est = easyKnown.value * 100 + midKnown.value * 300 + hardKnown.value * 600
  return Math.max(50, Math.round(est / 10) * 10)
})

const levelLabel = computed(() => {
  const v = estimate.value
  if (v < 500) return '入门水平'
  if (v < 1200) return '基础水平'
  if (v < 2500) return '进阶水平'
  if (v < 4000) return '中高级水平'
  return '高级水平'
})

const lastEstimate = computed(() => {
  const list = progress.data && progress.data.stats && progress.data.stats.vocabEstimates
  return Array.isArray(list) && list.length ? list[list.length - 1] : null
})

function answer(known) {
  if (!current.value) return
  if (known) {
    if (current.value.band === 0) easyKnown.value += 1
    else if (current.value.band === 1) midKnown.value += 1
    else hardKnown.value += 1
  }
  if (index.value + 1 >= samples.value.length) {
    saveResult()
    phase.value = 'result'
    return
  }
  index.value += 1
}

function saveResult() {
  if (!progress.data) return
  progress._ensureStats()
  const list = progress.data.stats.vocabEstimates || []
  list.push({ date: todayKey(), value: estimate.value })
  progress.data.stats.vocabEstimates = list.slice(-20) // 最多留 20 条
  progress._persist()
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

.setup-info {
  padding: 8px 0;
}

.setup-title {
  font-size: 20px;
  font-weight: 800;
}

.setup-desc {
  font-size: 14px;
  color: var(--c-text-secondary);
  line-height: 1.7;
  margin: 8px 0 16px;
}

.btn-block {
  width: 100%;
}

.last-est {
  margin-top: 12px;
  font-size: 13px;
  color: var(--c-text-muted);
  text-align: center;
}

.last-est strong {
  color: var(--c-primary);
}

.train-progress {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.train-bar {
  flex: 1;
  height: 8px;
  border-radius: 4px;
  background: var(--c-bg-soft);
  overflow: hidden;
}

.train-bar-fill {
  height: 100%;
  background: var(--c-primary);
  transition: width 0.2s;
}

.train-num {
  font-size: 13px;
  color: var(--c-text-muted);
  flex-shrink: 0;
}

.vt-body {
  text-align: center;
}

.vt-question {
  font-size: 15px;
  color: var(--c-text-secondary);
}

.vt-word {
  font-size: 42px;
  font-weight: 800;
  color: var(--c-primary);
  letter-spacing: 1px;
  margin: 16px 0 4px;
  word-break: break-all;
}

.vt-ipa {
  font-size: 16px;
  color: var(--c-text-secondary);
}

.vt-actions {
  display: flex;
  gap: var(--space-sm);
  justify-content: center;
  margin-top: 24px;
}

.vt-btn {
  flex: 1;
  max-width: 160px;
  font-size: 15px;
}

.vt-btn.no {
  background: rgba(239, 68, 68, 0.1);
  color: var(--c-danger, #b91c1c);
  border: 1px solid rgba(239, 68, 68, 0.4);
}

.vt-btn.yes {
  background: rgba(34, 197, 94, 0.12);
  color: var(--c-success, #15803d);
  border: 1px solid rgba(34, 197, 94, 0.4);
}

.vt-hint {
  font-size: 12px;
  color: var(--c-text-muted);
  margin-top: 12px;
}

.result {
  text-align: center;
  padding: 16px 0;
}

.result-icon {
  font-size: 44px;
  margin-bottom: 8px;
}

.result-num {
  font-size: 42px;
  font-weight: 800;
  color: var(--c-primary);
}

.result-text {
  font-size: 16px;
  font-weight: 600;
  margin-top: 8px;
}

.vt-breakdown {
  max-width: 320px;
  margin: 16px auto;
  text-align: left;
}

.vt-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--c-text-secondary);
  padding: 6px 0;
  border-bottom: 1px dashed var(--c-border);
}

.result-hint {
  font-size: 13px;
  color: var(--c-text-muted);
  margin-top: 6px;
  margin-bottom: 20px;
}

.result-actions {
  display: flex;
  gap: var(--space-sm);
  justify-content: center;
}
</style>
