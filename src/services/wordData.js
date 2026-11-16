/* ============================================================
   services/wordData.js —— 词库 JSON 按需加载服务
   词库数据存放于 public/data/*.json，首次启动时并行 fetch，
   加载完成后所有 getter 同步可用（保持 levels/dictionary/quizBank
   等既有同步 API 兼容，无需改造调用方为 async）。

   加载策略：
   * main.js 在应用挂载前 await ensureWordData()（失败不阻塞启动）
   * 失败后 promise 复位，下次调用自动重试；监听 online 事件重试
   * 测试环境用 hydrateWordData() 直接注入 JSON 数据
   ============================================================ */

/* 词库清单：file 与 public/data/ 文件名对应
   optional 为分批扩展词库（缺失时降级为空，不阻塞主流程），
   合并策略：group=l2 按主题对象合并，group=l5 按主题包数组拼接。 */
const WORD_DATA_FILES = [
  { group: 'l2', file: 'words-l2.json', type: 'object' },
  { group: 'l2', file: 'words-l2-extra.json', type: 'object', optional: true },
  { group: 'l2', file: 'words-l2-b2a.json', type: 'object', optional: true },
  { group: 'l2', file: 'words-l2-b2b.json', type: 'object', optional: true },
  { group: 'l2', file: 'words-l2-b2c.json', type: 'object', optional: true },
  { group: 'l2', file: 'words-l2-b2d.json', type: 'object', optional: true },
  { group: 'l2', file: 'words-l2-b2e.json', type: 'object', optional: true },
  { group: 'l2', file: 'words-l2-b3a.json', type: 'object', optional: true },
  { group: 'l5', file: 'words-l5.json', type: 'array' },
  { group: 'l5', file: 'words-l5-extra.json', type: 'array', optional: true },
  { group: 'l5', file: 'words-l5-b2a.json', type: 'array', optional: true },
  { group: 'l5', file: 'words-l5-b2b.json', type: 'array', optional: true },
  { group: 'l5', file: 'words-l5-b2c.json', type: 'array', optional: true },
  { group: 'l5', file: 'words-l5-b2d.json', type: 'array', optional: true },
  { group: 'l5', file: 'words-l5-b2e.json', type: 'array', optional: true },
  { group: 'l5', file: 'words-l5-b3a.json', type: 'array', optional: true },
  { group: 'l5', file: 'words-l5-b3b.json', type: 'array', optional: true },
  { group: 'l5', file: 'words-l5-b4a.json', type: 'array', optional: true },
  { group: 'l5', file: 'words-l5-b4b.json', type: 'array', optional: true },
  { group: 'l5', file: 'words-l5-b4c.json', type: 'array', optional: true },
  { group: 'l5', file: 'words-l5-b4d.json', type: 'array', optional: true },
  { group: 'l5', file: 'words-l5-b4e.json', type: 'array', optional: true },
  { group: 'l5', file: 'words-l5-b5a.json', type: 'array', optional: true },
  { group: 'l5', file: 'words-l5-b5b.json', type: 'array', optional: true },
  { group: 'l5', file: 'words-l5-b6a.json', type: 'array', optional: true },
  { group: 'l5', file: 'words-l5-b6b.json', type: 'array', optional: true },
  { group: 'l5', file: 'words-l5-b6c.json', type: 'array', optional: true },
  { group: 'l5', file: 'words-l5-b6d.json', type: 'array', optional: true },
  /* 词组搭配（动词短语 / 介词搭配）：与 L5 共用主题包结构与关卡生成逻辑 */
  { group: 'l5', file: 'phrases-1.json', type: 'array', optional: true },
  { group: 'l5', file: 'phrases-2.json', type: 'array', optional: true },
  { group: 'l5', file: 'phrases-3.json', type: 'array', optional: true },
  { group: 'l5', file: 'phrases-4.json', type: 'array', optional: true },
  { group: 'l5', file: 'phrases-5.json', type: 'array', optional: true },
  { group: 'l8', file: 'words-l8.json', type: 'array' }
]

const RETRY_DELAYS = [0, 600, 2000] // 首次 + 两次重试的等待毫秒数

/* 已加载缓存：{ l2: WORDS_L2, l5: L5_THEMES, l8: L8_ACADEMIC_WORDS } */
const cache = { l2: null, l5: null, l8: null }
let loadPromise = null

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function fileUrl(file) {
  if (typeof document !== 'undefined' && document.baseURI) {
    return new URL(`data/${file}`, document.baseURI).href
  }
  return `data/${file}`
}

/* 单文件带重试加载 */
async function fetchJsonWithRetry(file) {
  let lastErr = null
  for (const delay of RETRY_DELAYS) {
    if (delay) await sleep(delay)
    try {
      const res = await fetch(fileUrl(file), { cache: 'force-cache' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } catch (e) {
      lastErr = e
    }
  }
  throw lastErr || new Error(`词库加载失败: ${file}`)
}

function isLoaded() {
  return cache.l2 && cache.l5 && cache.l8
}

/* 等级内去重：同一单词只在首次出现的主题里保留，
   避免不同主题包收进同一个词导致重复出题。
   （跨等级不去重：L5 的进阶复现是刻意设计） */
function dedupeL2(source) {
  const seen = new Set()
  const out = {}
  Object.keys(source).forEach((key) => {
    const list = Array.isArray(source[key]) ? source[key] : []
    out[key] = list.filter((w) => {
      const word = String(w && w.word ? w.word : '').toLowerCase().trim()
      if (!word || seen.has(word)) return false
      seen.add(word)
      return true
    })
  })
  return out
}

function dedupeL5(source) {
  const seen = new Set()
  return source.map((t) => {
    const words = Array.isArray(t && t.words) ? t.words : []
    return {
      ...t,
      words: words.filter((w) => {
        const word = String(w && w.word ? w.word : '').toLowerCase().trim()
        if (!word || seen.has(word)) return false
        seen.add(word)
        return true
      })
    }
  })
}

/* 预加载全部词库 JSON（幂等；失败后可重新调用以重试）
   分批扩展文件（optional）加载失败时降级为空数据，不阻塞主词库。 */
export function preloadWordData() {
  if (isLoaded()) return Promise.resolve(cache)
  if (!loadPromise) {
    loadPromise = Promise.all(
      WORD_DATA_FILES.map((f) =>
        fetchJsonWithRetry(f.file).catch((e) => {
          if (f.optional) return f.type === 'array' ? [] : {}
          throw e
        })
      )
    )
      .then((results) => {
        const l2 = {}
        const l5 = []
        let l8 = []
        results.forEach((data, i) => {
          const meta = WORD_DATA_FILES[i]
          if (meta.group === 'l2') Object.assign(l2, data || {})
          else if (meta.group === 'l5') l5.push(...(data || []))
          else l8 = data || []
        })
        cache.l2 = dedupeL2(l2)
        cache.l5 = dedupeL5(l5)
        cache.l8 = l8
        return cache
      })
      .catch((e) => {
        loadPromise = null // 复位，允许下次重试
        throw e
      })
  }
  return loadPromise
}

/* 确保词库可用（应用启动与关键视图调用） */
export function ensureWordData() {
  return preloadWordData()
}

/* 测试/离线兜底：同步注入词库数据
   l2/l5 可直接传入多文件合并后的结果；l2x/l5x 兼容旧写法。
   注入后同样执行等级内去重，与线上加载行为一致。 */
export function hydrateWordData({ l2, l5, l8, l2x, l5x }) {
  if (l2) cache.l2 = dedupeL2(l2x ? { ...l2, ...l2x } : l2)
  if (l5) cache.l5 = dedupeL5(l5x ? [...l5, ...l5x] : l5)
  if (l8) cache.l8 = l8
  return cache
}

/* ---------- 同步 getter（数据未就绪时返回 []，主流程已在挂载前预载） ---------- */

/* L2 基础词汇：{ numbers: [...], colors: [...], ... } */
export function getWordsL2() {
  return cache.l2 || {}
}

export function getAllL2Words() {
  return Object.values(getWordsL2()).flat()
}

/* L5 主题数组（含 extends_from 标注） */
export function getL5Themes() {
  return cache.l5 || []
}

export function getAllL5Words() {
  return getL5Themes().flatMap((t) =>
    t.words.map((w) => ({ ...w, theme: t.id, extends_from: t.extends_from }))
  )
}

/* L8 学术词汇数组 */
export function getL8Words() {
  return cache.l8 || []
}

/* 浏览器恢复联网时自动重试一次（应用启动失败兜底） */
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('online', () => {
    if (!isLoaded()) preloadWordData().catch(() => {})
  })
}

export default { preloadWordData, ensureWordData, hydrateWordData, getWordsL2, getAllL2Words, getL5Themes, getAllL5Words, getL8Words }
