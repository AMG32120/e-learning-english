/* ============================================================
   services/ai.js —— AI 对话陪练（纯前端免费方案）
   使用 Pollinations.AI 匿名接口（OpenAI 兼容协议）：
   - 无需注册、无需 API Key，CORS 已开放，可直接从浏览器 fetch
   - 免费层约 1 次/15 秒（匿名），超出返回 429，需提示稍后重试
   - 备选升级方案（需配置后接入）：Groq / Google Gemini /
     Cloudflare Workers AI 免费额度
   ============================================================ */

const AI_ENDPOINT = 'https://text.pollinations.ai/openai'
const AI_MODEL = 'openai'

/* 学习场景预设（system 提示词） */
export const SCENARIOS = [
  {
    id: 'free',
    name: '自由聊天',
    icon: '💬',
    prompt:
      'You are a warm, encouraging English tutor helping a Chinese beginner learn English. ' +
      'Reply in SIMPLE English (max 3 short sentences), then add one line starting with "💡" in Chinese explaining key words or phrases. ' +
      'If the user makes mistakes, gently show the corrected sentence first ("✏️ 更正: ..."). Keep replies short and friendly.'
  },
  {
    id: 'restaurant',
    name: '餐厅点餐',
    icon: '🍽️',
    prompt:
      'Role-play: you are a waiter at a small cafe. The user is a customer learning English (beginner level). ' +
      'Stay in character, use simple English (max 3 short sentences per turn), then add one line starting with "💡" in Chinese with useful phrases. ' +
      'If the user makes mistakes, gently show the corrected sentence ("✏️ 更正: ...").'
  },
  {
    id: 'directions',
    name: '问路出行',
    icon: '🗺️',
    prompt:
      'Role-play: you are a friendly local giving directions in a city. The user is a tourist learning English (beginner level). ' +
      'Stay in character, use simple English (max 3 short sentences), then add one line starting with "💡" in Chinese with key phrases. ' +
      'If the user makes mistakes, gently show the corrected sentence ("✏️ 更正: ...").'
  },
  {
    id: 'interview',
    name: '模拟面试',
    icon: '💼',
    prompt:
      'Role-play: you are an interviewer at a company having a simple English job interview. The user is a candidate learning English (beginner level). ' +
      'Ask one question at a time, use simple English (max 3 short sentences), then add one line starting with "💡" in Chinese with useful expressions. ' +
      'If the user makes mistakes, gently show the corrected sentence ("✏️ 更正: ...").'
  },
  {
    id: 'travel',
    name: '旅行情景',
    icon: '✈️',
    prompt:
      'Role-play: you are a hotel receptionist / airport staff helping a traveler. The user is learning English (beginner level). ' +
      'Stay in character, use simple English (max 3 short sentences), then add one line starting with "💡" in Chinese with key phrases. ' +
      'If the user makes mistakes, gently show the corrected sentence ("✏️ 更正: ...").'
  }
]

/**
 * 发送对话请求（带完整历史）
 * @param {Array<{role:'system'|'user'|'assistant', content:string}>} messages
 * @returns {Promise<string>} AI 回复文本
 */
export async function chatWithAI(messages, { signal } = {}) {
  const res = await fetch(AI_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      model: AI_MODEL,
      messages,
      referrer: 'qicheng-english-learning'
    })
  })
  if (res.status === 429) {
    throw new Error('RATE_LIMIT')
  }
  if (!res.ok) {
    throw new Error(`HTTP_${res.status}`)
  }
  const data = await res.json()
  const text =
    data && data.choices && data.choices[0] && data.choices[0].message
      ? String(data.choices[0].message.content || '').trim()
      : ''
  if (!text) throw new Error('EMPTY_REPLY')
  return text
}
