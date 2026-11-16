<template>
  <div>
    <main class="page-container chat-page">
      <h1 class="page-title">AI 对话陪练</h1>
      <p class="page-sub">和 AI 英语老师真实对话，敢说才会说（免费 AI 服务，请勿发送个人隐私信息）</p>

      <!-- 场景选择 -->
      <div class="scene-bar">
        <button
          v-for="sc in SCENARIOS"
          :key="sc.id"
          class="scene-chip"
          :class="{ active: scenario === sc.id }"
          @click="switchScenario(sc.id)"
        >{{ sc.icon }} {{ sc.name }}</button>
      </div>

      <!-- 消息区 -->
      <div ref="msgBox" class="chat-box card">
        <div v-if="!messages.length" class="chat-empty">
          <p class="chat-empty-icon">🤖</p>
          <p>选择一个场景，用英语和 AI 老师聊起来吧</p>
          <p class="chat-empty-hint">遇到不会的可以直接打中文，AI 老师会教你用英语表达</p>
        </div>
        <div
          v-for="(m, i) in messages"
          :key="i"
          class="chat-msg"
          :class="m.role"
        >
          <div class="msg-bubble">
            <div class="msg-text">{{ m.content }}</div>
            <button v-if="m.role === 'assistant'" class="msg-tts" title="朗读回复" @click="replay(m.content)">🔊</button>
          </div>
        </div>
        <div v-if="loading" class="chat-msg assistant">
          <div class="msg-bubble typing">AI 老师正在思考<span class="dot">·</span><span class="dot">·</span><span class="dot">·</span></div>
        </div>
      </div>

      <!-- 输入区 -->
      <div class="chat-input-bar">
        <input
          v-model="input"
          class="form-input chat-input"
          type="text"
          :placeholder="loading ? '请等待回复…' : '用英语或中文输入…'"
          :disabled="loading"
          @keyup.enter="send"
        />
        <button class="btn btn-primary chat-send" :disabled="loading || !input.trim()" @click="send">
          {{ loading ? '…' : '发送' }}
        </button>
      </div>
      <p v-if="errorMsg" class="chat-error">{{ errorMsg }}</p>
    </main>
    <BottomTab />
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import BottomTab from '../components/BottomTab.vue'
import { SCENARIOS, chatWithAI } from '../services/ai'
import { speak, stopSpeak } from '../services/tts'

const scenario = ref('free')
const messages = ref([])
const input = ref('')
const loading = ref(false)
const errorMsg = ref('')
const msgBox = ref(null)

let controller = null

function systemPrompt() {
  const sc = SCENARIOS.find((s) => s.id === scenario.value) || SCENARIOS[0]
  return { role: 'system', content: sc.prompt }
}

async function switchScenario(id) {
  if (loading.value) return
  scenario.value = id
  stopSpeak()
  messages.value = []
  errorMsg.value = ''
  // 场景开场白
  const greeting = {
    free: 'Hi! I am your English teacher. What would you like to talk about today? (💡 你好！我是你的英语老师，今天想聊点什么？)',
    restaurant: 'Welcome to Sunny Cafe! Here is our menu. What would you like to order? (💡 欢迎光临！请问你想点些什么？)',
    directions: 'Hi, you look a little lost. Where would you like to go? (💡 你好，你好像迷路了。你想去哪里？)',
    interview: 'Hello, please have a seat. First, could you introduce yourself briefly? (💡 你好，请坐。首先请简单自我介绍一下。)',
    travel: 'Good morning! Welcome to our hotel. How can I help you today? (💡 早上好！欢迎入住，有什么可以帮您？)'
  }
  messages.value.push({ role: 'assistant', content: greeting[id] || greeting.free })
  await nextTick()
  scrollBottom()
}

async function send() {
  const text = input.value.trim()
  if (!text || loading.value) return
  errorMsg.value = ''
  input.value = ''
  messages.value.push({ role: 'user', content: text })
  await nextTick()
  scrollBottom()

  loading.value = true
  controller = new AbortController()
  try {
    const payload = [systemPrompt(), ...messages.value.map((m) => ({ role: m.role, content: m.content }))]
    const reply = await chatWithAI(payload, { signal: controller.signal })
    messages.value.push({ role: 'assistant', content: reply })
    replay(reply)
  } catch (e) {
    if (e && e.name === 'AbortError') return
    const code = e && e.message ? e.message : ''
    errorMsg.value =
      code === 'RATE_LIMIT'
        ? 'AI 服务免费额度限流了（约每 15 秒 1 次），请稍等几秒再发送。'
        : 'AI 服务暂时不可用，请稍后重试。'
  } finally {
    loading.value = false
    await nextTick()
    scrollBottom()
  }
}

function replay(text) {
  stopSpeak()
  // 去掉 markdown 常见符号，仅朗读
  const clean = text.replace(/[#*`|>-]/g, ' ').replace(/\s+/g, ' ').trim()
  speak(clean, { rate: 0.85 }).catch(() => {})
}

function scrollBottom() {
  if (msgBox.value) msgBox.value.scrollTop = msgBox.value.scrollHeight
}

switchScenario('free')
</script>

<style scoped>
.page-sub {
  color: var(--c-text-secondary);
  font-size: 13px;
  margin-top: 2px;
  margin-bottom: var(--space-sm);
}

.scene-bar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  margin-bottom: var(--space-sm);
}

.scene-chip {
  padding: 7px 12px;
  border: 1px solid var(--c-border);
  border-radius: 20px;
  background: var(--c-bg-soft);
  color: var(--c-text);
  font-size: 13px;
  cursor: pointer;
}

.scene-chip.active {
  border-color: var(--c-primary);
  background: var(--c-primary);
  color: #fff;
}

.chat-box {
  min-height: 320px;
  max-height: 480px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: var(--space-md);
}

.chat-empty {
  text-align: center;
  color: var(--c-text-secondary);
  padding: 40px 8px;
}

.chat-empty-icon {
  font-size: 40px;
  margin-bottom: 8px;
}

.chat-empty-hint {
  font-size: 13px;
  color: var(--c-text-muted);
  margin-top: 6px;
}

.chat-msg {
  display: flex;
}

.chat-msg.user {
  justify-content: flex-end;
}

.msg-bubble {
  max-width: 82%;
  padding: 10px 13px;
  border-radius: 14px;
  font-size: 15px;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
}

.chat-msg.assistant .msg-bubble {
  background: var(--c-bg-soft);
  border: 1px solid var(--c-border);
}

.chat-msg.user .msg-bubble {
  background: var(--c-primary);
  color: #fff;
}

.msg-tts {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 0 4px;
  margin-top: 4px;
}

.typing {
  color: var(--c-text-muted);
}

.typing .dot {
  animation: blink 1.2s infinite;
  display: inline-block;
  margin-left: 2px;
}

.typing .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes blink {
  0%, 80%, 100% { opacity: 0.2; }
  40% { opacity: 1; }
}

.chat-input-bar {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-md);
}

.chat-input {
  flex: 1;
}

.chat-send {
  flex-shrink: 0;
  min-width: 72px;
}

.chat-error {
  font-size: 13px;
  color: var(--c-danger, #ef4444);
  margin-top: 8px;
}
</style>
