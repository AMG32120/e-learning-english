<template>
  <div>
    <main class="page-container">
      <h1 class="page-title">AI 写作批改</h1>
      <p class="page-sub">写英文作文或翻译句子，AI 老师按考试标准逐条点评（免费 AI 服务，请勿发送个人隐私信息）</p>

      <!-- 题目选择 -->
      <div class="prompt-bar">
        <button
          v-for="p in prompts"
          :key="p.id"
          class="prompt-chip"
          :class="{ active: current.id === p.id }"
          @click="switchPrompt(p.id)"
        >{{ p.emoji }} {{ p.title }}</button>
      </div>

      <!-- 题目卡 -->
      <section class="card prompt-card">
        <div class="prompt-head">
          <span class="prompt-genre">{{ current.genre }} · {{ current.type === 'writing' ? '英文作文' : '汉译英' }}</span>
          <button class="btn btn-ghost btn-sm" @click="showHints = !showHints">💡 写作提示</button>
        </div>
        <p class="prompt-text">{{ current.prompt }}</p>
        <ul v-if="showHints" class="hint-list">
          <li v-for="(h, i) in current.hints" :key="i">{{ h }}</li>
        </ul>
      </section>

      <!-- 写作区 -->
      <section class="card write-card">
        <div class="write-head">
          <span class="word-count" :class="{ ok: wordCount >= minWords }">{{ wordCount }} 词</span>
          <span class="write-tip">建议不少于 {{ minWords }} 词</span>
        </div>
        <textarea
          v-model="draft"
          class="write-area"
          :placeholder="current.type === 'writing' ? 'Start writing here...' : '逐句翻译，用 1. 2. 3. 编号'"
          rows="10"
          spellcheck="false"
        ></textarea>
        <div class="write-actions">
          <button class="btn btn-primary" :disabled="loading || !draft.trim()" @click="submit">
            {{ loading ? 'AI 老师批改中…' : '提交批改' }}
          </button>
          <button v-if="draft && !loading" class="btn btn-ghost" @click="clearDraft">清空</button>
        </div>
        <p v-if="error" class="write-error">{{ error }}</p>
      </section>

      <!-- 批改结果 -->
      <section v-if="feedback || loading" class="card feedback-card">
        <h2 class="feedback-title">📝 批改反馈</h2>
        <div v-if="loading" class="feedback-loading">AI 老师正在逐句阅读…（约 10–30 秒）</div>
        <div v-else class="feedback-body">
          <div v-for="(line, i) in feedbackLines" :key="i" class="feedback-line" :class="lineClass(line)">{{ line }}</div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { WRITING_PROMPTS } from '../data/writing_prompts'
import { chatWithAI } from '../services/ai'

const prompts = WRITING_PROMPTS
const current = ref(prompts[0])
const draft = ref('')
const feedback = ref('')
const loading = ref(false)
const error = ref('')
const showHints = ref(false)

const minWords = computed(() => (current.value.type === 'writing' ? 80 : 40))

const wordCount = computed(() => {
  const t = draft.value.trim()
  if (!t) return 0
  return t.split(/\s+/).length
})

const feedbackLines = computed(() =>
  (feedback.value || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
)

function switchPrompt(id) {
  const p = prompts.find((x) => x.id === id)
  if (!p) return
  current.value = p
  draft.value = ''
  feedback.value = ''
  error.value = ''
  showHints.value = false
}

function clearDraft() {
  draft.value = ''
  feedback.value = ''
  error.value = ''
}

function lineClass(line) {
  if (/^(总评|分数|评分|总体|Overall|Score)/i.test(line)) return 'head'
  if (/^[·•-]\s|^✅|^❌|^⚠️/.test(line)) return 'point'
  if (/^(参考|Reference|范例)/i.test(line)) return 'ref'
  return ''
}

async function submit() {
  const text = draft.value.trim()
  if (!text || loading.value) return
  loading.value = true
  error.value = ''
  feedback.value = ''
  const isWriting = current.value.type === 'writing'
  const system = [
    '你是一位严格但友善的英语写作老师，为中国学生批改英语作业。',
    '请用中文输出批改，英文例句保留英文。',
    '输出格式：',
    '总评：一句话点评整体质量',
    '分数：X/10（按考试作文标准）',
    '❌ 问题点：逐条列出语法、用词、搭配问题，每条先引用原句片段，再给修改建议',
    '✅ 亮点：列出写得好的地方（若有）',
    '参考润色：给出修改后的完整范文',
    isWriting
      ? `题目要求：${current.value.prompt}；参考范文（仅供对照，不必完全一致）：${current.value.reference}`
      : `题目：${current.value.prompt.replace(/\n/g, ' ')}；参考答案：${current.value.reference}`
  ].join('\n')
  const user = `学生作答（约 ${wordCount.value} 词）：\n${text}`
  try {
    const reply = await chatWithAI(
      [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ]
    )
    feedback.value = reply
  } catch (e) {
    if (e.message === 'RATE_LIMIT') {
      error.value = 'AI 服务暂时限流，请等 15–30 秒再试。'
    } else {
      error.value = '批改失败：' + (e.message || '网络异常') + '，请检查网络后重试。'
    }
  } finally {
    loading.value = false
  }
}

</script>

<style scoped>
.prompt-bar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  margin-bottom: var(--space-md);
}

.prompt-chip {
  padding: 6px 12px;
  border: 1px solid var(--c-border);
  border-radius: 999px;
  background: var(--c-bg-card);
  font-size: 13px;
  color: var(--c-text);
  cursor: pointer;
  transition: all 0.15s ease;
}

.prompt-chip:hover {
  background: var(--c-primary-light);
}

.prompt-chip.active {
  background: var(--c-primary);
  border-color: var(--c-primary);
  color: #fff;
}

.prompt-card {
  margin-bottom: var(--space-md);
}

.prompt-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-xs);
}

.prompt-genre {
  font-size: 12px;
  color: var(--c-text-muted);
  background: var(--c-primary-light);
  border-radius: 999px;
  padding: 2px 10px;
}

.prompt-text {
  font-size: 15px;
  line-height: 1.7;
  white-space: pre-line;
}

.hint-list {
  margin: var(--space-sm) 0 0;
  padding-left: 20px;
  font-size: 13px;
  color: var(--c-text-muted);
  line-height: 1.8;
}

.write-card {
  margin-bottom: var(--space-md);
}

.write-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: var(--space-xs);
}

.word-count {
  font-weight: 500;
  color: var(--c-danger);
}

.word-count.ok {
  color: #2e9e5b;
}

.write-tip {
  font-size: 12px;
  color: var(--c-text-muted);
}

.write-area {
  width: 100%;
  padding: var(--space-sm);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  line-height: 1.7;
  font-family: inherit;
  resize: vertical;
  background: var(--c-bg-card);
  color: var(--c-text);
}

.write-area:focus {
  outline: none;
  border-color: var(--c-primary);
}

.write-actions {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-sm);
}

.write-error {
  margin-top: var(--space-sm);
  font-size: 13px;
  color: var(--c-danger);
}

.feedback-card {
  border-color: var(--c-primary);
}

.feedback-title {
  font-size: 15px;
  margin: 0 0 var(--space-sm);
}

.feedback-loading {
  color: var(--c-text-muted);
  font-size: 14px;
}

.feedback-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: var(--space-sm);
}

.feedback-line {
  font-size: 14px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}

.feedback-line.head {
  font-weight: 500;
  color: var(--c-primary);
  margin-top: 4px;
}

.feedback-line.ref {
  color: var(--c-text-muted);
}

.feedback-line.point {
  padding-left: 4px;
}

.btn-sm {
  padding: 4px 10px;
  font-size: 12px;
}
</style>
