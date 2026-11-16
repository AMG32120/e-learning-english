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

/* 词库清单：name 与 public/data/ 文件名对应 */
const WORD_DATA_FILES = [
  { key: 'l2', file: 'words-l2.json' },
  { key: 'l5', file: 'words-l5.json' },
  { key: 'l8', file: 'words-l8.json' }
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

/* 预加载全部词库 JSON（幂等；失败后可重新调用以重试） */
export function preloadWordData() {
  if (isLoaded()) return Promise.resolve(cache)
  if (!loadPromise) {
    loadPromise = Promise.all(WORD_DATA_FILES.map((f) => fetchJsonWithRetry(f.file)))
      .then(([l2, l5, l8]) => {
        cache.l2 = l2
        cache.l5 = l5
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

/* 测试/离线兜底：同步注入词库数据 */
export function hydrateWordData({ l2, l5, l8 }) {
  if (l2) cache.l2 = l2
  if (l5) cache.l5 = l5
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
