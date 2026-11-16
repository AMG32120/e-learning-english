<template>
  <div>
    <main class="page-container">
      <h1 class="page-title">训练场</h1>
      <p class="page-sub">拼写练习与听写训练，强化单词记忆</p>

      <!-- 页签 -->
      <div class="wb-tabs">
        <button class="wb-tab" :class="{ active: mode === 'spell' }" @click="switchMode('spell')">拼写练习</button>
        <button class="wb-tab" :class="{ active: mode === 'dict' }" @click="switchMode('dict')">听写训练</button>
      </div>

      <!-- 准备页 -->
      <section v-if="phase === 'setup'" class="card">
        <div class="setup-info">
          <p class="setup-title">{{ mode === 'spell' ? '🔤 拼写练习' : '✍️ 听写训练' }}</p>
          <p class="setup-desc">
            {{ mode === 'spell'
              ? '看中文释义和发音提示，用打乱的字母块拼出单词。'
              : '听发音后键入你听到的单词，检验耳朵和拼写。' }}
          </p>
          <p class="setup-pool">练习词池：{{ poolLabel }}</p>
          <div class="setup-options">
            <button
              v-for="opt in rangeOptions"
              :key="opt.value"
              class="setup-opt"
              :class="{ active: range === opt.value }"
              @click="range = opt.value"
            >{{ opt.label }}</button>
          </div>
          <button class="btn btn-primary btn-block" :disabled="!poolSize" @click="start">
            开始训练（{{ Math.min(10, poolSize || 0) }} 词）
          </button>
          <p v-if="!poolSize" class="setup-hint">词池为空：先闯关学习或收藏生词，再来训练。</p>
        </div>
      </section>

      <!-- 练习页 -->
      <section v-else-if="phase === 'train'" class="card">
        <div class="train-progress">
          <div class="train-bar"><div class="train-bar-fill" :style="{ width: (index / list.length) * 100 + '%' }"></div></div>
          <span class="train-num">{{ index + 1 }} / {{ list.length }}</span>
        </div>

        <!-- 拼写：字母块组词 -->
        <div v-if="mode === 'spell' && current" class="train-body">
          <p class="train-zh">{{ current.zh || '听发音，拼出单词' }}</p>
          <p v-if="current.ipa" class="train-ipa ipa">{{ current.ipa }}</p>
          <div class="train-tts"><TtsButton :text="current.word" aria-label="播放发音" /></div>

          <div class="spell-answer" :class="{ ok: revealed, bad: revealed && !isCorrect }">
            <span
              v-for="(ch, i) in answerChars"
              :key="i"
              class="spell-slot"
              :class="{ filled: ch, clickable: !revealed && ch }"
              @click="removeChar(i)"
            >{{ ch }}</span>
          </div>
          <div v-if="revealed && !isCorrect" class="train-correct">
            正确拼写：<strong>{{ current.word }}</strong>
          </div>

          <div v-if="!revealed" class="spell-tiles">
            <button
              v-for="(t, i) in tiles"
              :key="i"
              class="spell-tile"
              :class="{ used: t.used }"
              :disabled="t.used"
              @click="addChar(i)"
            >{{ t.ch }}</button>
          </div>
          <div v-else class="train-feedback" :class="isCorrect ? 'ok' : 'bad'">
            {{ isCorrect ? '✅ 拼写正确！' : '❌ 再接再厉，已加入复习池' }}
          </div>

          <div class="train-actions">
            <button v-if="!revealed" class="btn btn-soft" @click="replay">🔊 再听一次</button>
            <button v-if="!revealed" class="btn btn-ghost" @click="reveal">不会，看答案</button>
            <button v-else class="btn btn-primary btn-block" @click="next">下一个</button>
          </div>
        </div>

        <!-- 听写：键入单词 -->
        <div v-else-if="mode === 'dict' && current" class="train-body">
          <p class="train-zh">听发音，键入单词</p>
          <div class="train-tts big"><TtsButton :text="current.word" aria-label="播放发音" /></div>
          <input
            ref="dictInput"
            v-model="typed"
            class="form-input dict-input"
            type="text"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            :disabled="revealed"
            placeholder="输入你听到的单词"
            @keyup.enter="confirmDict"
          />
          <template v-if="revealed">
            <div v-if="!isCorrect" class="train-correct">
              正确答案：<strong>{{ current.word }}</strong>
              <span v-if="current.zh" class="train-correct-zh">{{ current.zh }}</span>
            </div>
            <div class="train-feedback" :class="isCorrect ? 'ok' : 'bad'">
              {{ isCorrect ? '✅ 听写正确！' : '❌ 已加入复习池' }}
            </div>
          </template>

          <div class="train-actions">
            <button v-if="!revealed" class="btn btn-soft" @click="replay">🔊 再听一次</button>
            <button v-if="!revealed" class="btn btn-primary btn-block" @click="confirmDict">提交</button>
            <button v-else class="btn btn-primary btn-block" @click="next">下一个</button>
          </div>
        </div>
      </section>

      <!-- 结果页 -->
      <section v-else class="card">
        <div class="result">
          <p class="result-icon">{{ correctCount >= Math.ceil(list.length * 0.7) ? '🎉' : '💪' }}</p>
          <p class="result-num">{{ correctCount }} / {{ list.length }}</p>
          <p class="result-text">
            {{ mode === 'spell' ? '拼写' : '听写' }}正确 {{ correctCount }} 个，正确率 {{ accuracy }}%
          </p>
          <p class="result-hint">练习成绩已计入学习统计，答错单词已加入复习池。</p>
          <div class="result-actions">
            <button class="btn btn-ghost" @click="phase = 'setup'">再来一组</button>
            <router-link class="btn btn-primary" to="/">返回首页</router-link>
          </div>
        </div>
      </section>
    </main>
    <BottomTab />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import BottomTab from '../components/BottomTab.vue'
import TtsButton from '../components/TtsButton.vue'
import { useProgressStore } from '../stores/progress'
import { findWord } from '../services/dictionary'
import { speak } from '../services/tts'

const route = useRoute()
const progress = useProgressStore()

/* 页签模式：支持 /practice?mode=spell|dict */
const mode = ref(route.query.mode === 'dict' ? 'dict' : 'spell')

function switchMode(m) {
  mode.value = m
  phase.value = 'setup'
}

const phase = ref('setup') // setup | train | result
const range = ref(route.query.source === 'wordbook' ? 'wordbook' : 'all')
const list = ref([])
const index = ref(0)
const revealed = ref(false)
const correctCount = ref(0)

/* 拼写状态 */
const tiles = ref([])
const answerChars = ref([])

/* 听写状态 */
const typed = ref('')
const dictInput = ref(null)

/* ---------- 词池 ---------- */

const allPool = computed(() => {
  if (!progress.data) return []
  const keys = new Set()
  if (Array.isArray(progress.data.wordbook)) progress.data.wordbook.forEach((k) => keys.add(k))
  Object.keys(progress.data.reviewPool || {}).forEach((k) => keys.add(k.split(':')[1] || k))
  if (Array.isArray(progress.data.stats?.masteredWords)) {
    progress.data.stats.masteredWords.forEach((w) => keys.add(`${w}|`))
  }
  const items = []
  for (const key of keys) {
    const e = findWord(key)
    if (e && e.word && /^[a-z][a-z-]{1,14}$/i.test(e.word)) items.push(e)
  }
  return dedupeByWord(items)
})

const wordbookPool = computed(() => {
  const items = []
  for (const e of progress.wordbookEntries) {
    if (e.word && /^[a-z][a-z-]{1,14}$/i.test(e.word)) items.push(e)
  }
  return dedupeByWord(items)
})

const rangeOptions = computed(() => {
  const opts = [{ value: 'all', label: '全部已学内容' }]
  if (wordbookPool.value.length) opts.unshift({ value: 'wordbook', label: `我的生词本（${wordbookPool.value.length}）` })
  return opts
})

const poolSize = computed(() => (range.value === 'wordbook' ? wordbookPool.value.length : allPool.value.length))
const poolLabel = computed(() =>
  range.value === 'wordbook' ? `生词本收藏（${wordbookPool.value.length} 词）` : `生词本 + 复习池 + 已掌握词汇（${allPool.value.length} 词）`
)

function dedupeByWord(items) {
  const seen = new Set()
  return items.filter((e) => {
    const w = e.word.toLowerCase()
    if (seen.has(w)) return false
    seen.add(w)
    return true
  })
}

const current = computed(() => list.value[index.value] || null)
const isCorrect = computed(() => {
  if (mode.value === 'spell') return answerChars.value.join('').toLowerCase() === current.value?.word.toLowerCase()
  return typed.value.trim().toLowerCase() === current.value?.word.toLowerCase()
})
const accuracy = computed(() => (list.value.length ? Math.round((correctCount.value / list.value.length) * 100) : 0))

function pickWords() {
  const pool = shuffle(range.value === 'wordbook' ? [...wordbookPool.value] : [...allPool.value])
  list.value = pool.slice(0, 10)
}

function start() {
  pickWords()
  if (!list.value.length) return
  index.value = 0
  revealed.value = false
  correctCount.value = 0
  phase.value = 'train'
  initQuestion()
}

function initQuestion() {
  revealed.value = false
  if (mode.value === 'spell') {
    answerChars.value = []
    const letters = current.value.word.toLowerCase().split('')
    const extraPool = allPool.value
      .filter((e) => e.word.toLowerCase() !== current.value.word.toLowerCase())
      .map((e) => e.word.toLowerCase().split(''))
      .flat()
    const extras = shuffle([...new Set(extraPool)]).filter((ch) => !letters.includes(ch)).slice(0, 3)
    tiles.value = shuffle([...letters, ...extras]).map((ch) => ({ ch, used: false }))
  } else {
    typed.value = ''
    nextTick(() => dictInput.value && dictInput.value.focus())
    replay()
  }
}

/* 拼写交互 */
function addChar(i) {
  if (revealed.value || tiles.value[i].used) return
  const answerLen = current.value.word.toLowerCase().length
  if (answerChars.value.length >= answerLen) return
  tiles.value[i].used = true
  answerChars.value.push(tiles.value[i].ch)
  // 字母填满自动判卷
  if (answerChars.value.length >= answerLen) setTimeout(reveal, 250)
}

function removeChar(i) {
  if (revealed.value) return
  const ch = answerChars.value[i]
  answerChars.value.splice(i, 1)
  const t = tiles.value.find((x) => x.ch === ch && x.used)
  if (t) t.used = false
}

function replay() {
  if (!current.value) return
  speak(current.value.word, { rate: 0.8 }).catch(() => {})
}

function reveal() {
  if (revealed.value || !current.value) return
  revealed.value = true
  const ok = isCorrect.value
  if (ok) {
    correctCount.value += 1
  } else {
    progress.addToReviewPool([`practice:${current.value.word}`])
  }
  recordDailyMode(ok)
}

/* 听写交互 */
function confirmDict() {
  if (revealed.value || !typed.value.trim()) return
  reveal()
}

function recordDailyMode(ok) {
  const field = mode.value === 'spell' ? 'spell' : 'dict'
  progress.recordDaily(field, 1)
  if (ok) progress.recordDaily(field + 'Correct', 1)
}

function next() {
  if (index.value + 1 >= list.value.length) {
    phase.value = 'result'
    return
  }
  index.value += 1
  initQuestion()
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
  margin: 8px 0 4px;
}

.setup-pool {
  font-size: 13px;
  color: var(--c-text-muted);
  margin-bottom: 14px;
}

.setup-options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  margin-bottom: 8px;
}

.setup-opt {
  padding: 9px 14px;
  border: 1px solid var(--c-border);
  border-radius: 20px;
  background: var(--c-bg-soft);
  color: var(--c-text);
  font-size: 14px;
  cursor: pointer;
}

.setup-opt.active {
  border-color: var(--c-primary);
  background: var(--c-primary);
  color: #fff;
}

.setup-hint {
  font-size: 13px;
  color: var(--c-text-muted);
  margin-top: 10px;
  text-align: center;
}

.btn-block {
  width: 100%;
}

/* 训练页 */
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

.train-body {
  text-align: center;
}

.train-zh {
  font-size: 20px;
  font-weight: 700;
}

.train-ipa {
  font-size: 15px;
  color: var(--c-text-secondary);
  margin-top: 4px;
}

.train-tts {
  margin: 12px 0;
}

.train-tts.big {
  margin: 20px 0;
}

/* 拼写 */
.spell-answer {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  margin: 14px 0;
  min-height: 44px;
}

.spell-slot {
  width: 36px;
  height: 44px;
  border: 2px solid var(--c-border);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  background: var(--c-bg-soft);
  text-transform: lowercase;
}

.spell-slot.clickable {
  cursor: pointer;
}

.spell-answer.ok .spell-slot {
  border-color: var(--c-success, #22c55e);
  color: var(--c-success, #22c55e);
}

.spell-answer.bad .spell-slot {
  border-color: var(--c-danger, #ef4444);
  color: var(--c-danger, #ef4444);
}

.spell-tiles {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin: 14px 0;
}

.spell-tile {
  width: 44px;
  height: 48px;
  border: 1px solid var(--c-border);
  border-radius: 10px;
  background: var(--c-bg-card);
  color: var(--c-text);
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.1s;
}

.spell-tile:not(:disabled):active {
  transform: scale(0.92);
}

.spell-tile.used {
  opacity: 0.25;
  cursor: default;
}

.train-correct {
  font-size: 15px;
  color: var(--c-text);
  margin: 10px 0;
}

.train-correct strong {
  color: var(--c-primary);
  font-size: 18px;
}

.train-correct-zh {
  margin-left: 8px;
  font-size: 13px;
  color: var(--c-text-secondary);
}

.train-feedback {
  font-size: 15px;
  font-weight: 600;
  margin: 10px 0;
}

.train-feedback.ok {
  color: var(--c-success, #22c55e);
}

.train-feedback.bad {
  color: var(--c-danger, #ef4444);
}

.train-actions {
  margin-top: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  align-items: stretch;
}

/* 听写 */
.dict-input {
  width: 100%;
  max-width: 280px;
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 1px;
  margin: 4px auto 8px;
  display: block;
}

/* 结果 */
.result {
  text-align: center;
  padding: 16px 0;
}

.result-icon {
  font-size: 44px;
  margin-bottom: 8px;
}

.result-num {
  font-size: 36px;
  font-weight: 800;
  color: var(--c-primary);
}

.result-text {
  font-size: 16px;
  font-weight: 600;
  margin-top: 8px;
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
