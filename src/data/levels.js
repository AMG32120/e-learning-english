/* ============================================================
   src/data/levels.js —— 等级与关卡结构定义（L1~L16）
   16 级结构：词汇大关按主题量/难度梯度拆分为多级，关卡不再堆积。
   L2~L5 基础词汇按主导 CEFR 四段（A1/A2·上/A2·下/B1）；
   L8~L12 中级词汇按主题包五等分，词组包归入 L12；
   L15 学术词汇按 L8 词库每 12 词一段切分（504 词全量进入关卡）；
   词汇类关卡（L2~L5/L8~L12/L15）由词库主题数据驱动自动生成，
   新增主题只要往词库 JSON 加数据，关卡自动出现，无需改本文件。
   关卡模型：{ id, level, stage, title, type, desc, available, content }
   ============================================================ */
import { LETTERS, IPA_VOWELS, IPA_CONSONANTS, PHONICS_WORDS } from './letters'
import { L6_LISTENING } from './listening_l6'
import { ARTICLES_L7 } from './reading_l7'
import { getWordsL2, getL5Themes, getL8Words, getCorpusWords } from '../services/wordData'

export const LEVEL_UNLOCK_RATIO = 0.8

/* 关卡类型说明（题型引擎分发依据） */
export const STAGE_TYPES = {
  letter_recognize: { name: '字母认读', component: 'letter_recognize' },
  letter_match: { name: '大小写配对', component: 'letter_match' },
  read_along: { name: '发音跟读', component: 'read_along' },
  ipa_recognize: { name: '音标认读', component: 'ipa_recognize' },
  phonics: { name: '自然拼读', component: 'phonics' },
  word_choice: { name: '单词选择', component: 'word_choice' },
  word_match: { name: '看图识词', component: 'word_match' },
  word_spell: { name: '拼写挑战', component: 'word_spell' },
  word_order: { name: '连词成句', component: 'word_order' },
  dialogue: { name: '场景对话', component: 'dialogue' },
  grammar_quiz: { name: '语法测验', component: 'grammar_quiz' },
  listening: { name: '听力理解', component: 'listening' },
  reading: { name: '阅读写作', component: 'reading' },
  simulation: { name: '仿真题训练', component: 'simulation' },
  coming_soon: { name: '后续开放', component: 'coming_soon' }
}

/* ---------- L1 完整关卡 ---------- */
const L1 = {
  level: 1,
  name: '字母启蒙',
  desc: '26 个英文字母、48 个国际音标与自然拼读入门',
  stages: [
    {
      id: 'L1-1',
      stage: 1,
      title: '字母认读入门',
      type: 'letter_recognize',
      desc: '听音选字母，认读 26 个英文字母',
      content: { pool: 'letters', count: 10, mode: 'listen' }
    },
    {
      id: 'L1-2',
      stage: 2,
      title: '大小写配对',
      type: 'letter_match',
      desc: '将大写字母与小写字母正确配对',
      content: { pool: 'letters', count: 10 }
    },
    {
      id: 'L1-3',
      stage: 3,
      title: '字母发音跟读',
      type: 'read_along',
      desc: '播放示范后跟读，并自评：好 / 一般 / 需重练',
      content: { pool: 'letters', count: 8 }
    },
    {
      id: 'L1-4',
      stage: 4,
      title: '元音音标认读',
      type: 'ipa_recognize',
      desc: '认读 20 个元音音标（单元音 + 双元音）',
      content: { pool: 'vowels', count: 10 }
    },
    {
      id: 'L1-5',
      stage: 5,
      title: '辅音音标认读',
      type: 'ipa_recognize',
      desc: '认读 28 个辅音音标',
      content: { pool: 'consonants', count: 10 }
    },
    {
      id: 'L1-6',
      stage: 6,
      title: '自然拼读入门',
      type: 'phonics',
      desc: 'CVC 拼读与常见字母组合（sh / ch / th / ee / oo）',
      content: { pool: 'phonics', count: 10 }
    }
  ]
}

/* ---------- 词汇关卡生成器（L2~L5 基础词汇、L8~L12 中级词汇、L15 学术词汇） ----------
   词库按主题组织，每个主题 12 词拆成 2 关（每关 6 词）：
   第 1 关「认词」用选择/听音，第 2 关「巩固」用看图或拼写。
   词库主题按难度顺序等分为多段，每段对应一个等级，避免关卡堆积。
   - L2~L5 基础词汇：L2 词库 81 主题按主导 CEFR（A1/A2/B1）分四段；
   - L8~L12 中级词汇：L5 词库 330 词包五等分，词组包归入 L12 末尾；
   - L15 学术词汇：L8 词库 504 词按 12 词/段切 42 段（无 emoji，仅选择题）。 */

const L2_THEME_META = {
  numbers: { title: '数字', emoji: '🔢' },
  colors: { title: '颜色', emoji: '🎨' },
  family: { title: '家庭', emoji: '👨‍👩‍👧' },
  food: { title: '食物', emoji: '🍎' },
  animals: { title: '动物', emoji: '🐶' },
  body: { title: '身体', emoji: '🙋' },
  weather: { title: '天气', emoji: '🌦️' },
  time: { title: '时间', emoji: '🕐' },
  transport: { title: '交通', emoji: '🚌' },
  daily: { title: '日常用品', emoji: '🧴' },
  clothes: { title: '衣物', emoji: '👕' },
  school: { title: '学校', emoji: '🏫' },
  jobs: { title: '职业', emoji: '👮' },
  house: { title: '家居', emoji: '🏠' },
  sports: { title: '运动', emoji: '⚽' },
  feelings: { title: '情绪', emoji: '😊' },
  city: { title: '城市场所', emoji: '🏙️' },
  verbs: { title: '常用动词', emoji: '🏃' },
  adjectives: { title: '常用形容词', emoji: '📏' },
  nature: { title: '自然', emoji: '🌳' },
  health: { title: '健康', emoji: '💊' },
  tech: { title: '科技', emoji: '📱' },
  fruits: { title: '水果', emoji: '🍓' },
  vegetables: { title: '蔬菜', emoji: '🥕' },
  drinks: { title: '饮料', emoji: '☕' },
  meals: { title: '三餐', emoji: '🍱' },
  kitchen: { title: '厨房', emoji: '🍳' },
  bathroom: { title: '浴室', emoji: '🛁' },
  appliances: { title: '家电', emoji: '🔌' },
  toys: { title: '玩具', emoji: '🧸' },
  pets: { title: '宠物', emoji: '🐱' },
  farm: { title: '农场', emoji: '🐄' },
  insects: { title: '昆虫', emoji: '🐝' },
  plants: { title: '花草', emoji: '🌷' },
  trees: { title: '树木', emoji: '🌲' },
  space: { title: '太空', emoji: '🌌' },
  sea: { title: '海洋', emoji: '🌊' },
  landforms: { title: '地形', emoji: '⛰️' },
  materials: { title: '材料', emoji: '🧱' },
  shapes: { title: '形状', emoji: '🔷' },
  sizes: { title: '大小度量', emoji: '📐' },
  positions: { title: '方位', emoji: '🧭' },
  directions: { title: '方向', emoji: '➡️' },
  money: { title: '钱币', emoji: '💵' },
  shopping: { title: '购物', emoji: '🛒' },
  restaurant: { title: '餐厅', emoji: '🍴' },
  hotel: { title: '酒店', emoji: '🏨' },
  airport: { title: '机场', emoji: '✈️' },
  station: { title: '车站', emoji: '🚉' },
  post: { title: '邮局', emoji: '📮' },
  phone: { title: '电话', emoji: '📞' },
  screen: { title: '电脑操作', emoji: '🖱️' },
  network: { title: '网络', emoji: '🌐' },
  music: { title: '音乐', emoji: '🎵' },
  movies: { title: '电影', emoji: '🎬' },
  reading: { title: '阅读', emoji: '📖' },
  painting: { title: '绘画', emoji: '🖼️' },
  party: { title: '聚会', emoji: '🎉' },
  festival: { title: '节日', emoji: '🎊' },
  wedding: { title: '婚礼', emoji: '💒' },
  sickness: { title: '病症', emoji: '🤒' },
  safety: { title: '安全', emoji: '🚨' },
  berries: { title: '浆果', emoji: '🫐' },
  seafood: { title: '海鲜水产', emoji: '🦐' },
  sweets: { title: '甜食点心', emoji: '🍬' },
  tools: { title: '工具五金', emoji: '🔧' },
  birds: { title: '鸟类', emoji: '🦅' },
  weather2: { title: '天气现象', emoji: '⛅' },
  writing: { title: '文具办公', emoji: '✒️' },
  grains: { title: '谷物坚果', emoji: '🥜' },
  instruments: { title: '乐器', emoji: '🎻' },
  furniture: { title: '家具', emoji: '🛋️' },
  accessories: { title: '服饰配件', emoji: '🧣' },
  vehicles: { title: '车辆', emoji: '🚗' },
  occupations: { title: '职业人物', emoji: '🧑‍🔧' },
  wild_animals: { title: '野生动物', emoji: '🦊' },
  body_parts: { title: '身体部位', emoji: '🦵' },
  buildings: { title: '建筑物', emoji: '🏛️' },
  disaster: { title: '自然灾害', emoji: '🌪️' },
  colors2: { title: '颜色扩展', emoji: '🟣' },
  hand_actions: { title: '手部动作', emoji: '✋' },
  move_verbs: { title: '移动动词', emoji: '🏃' }
}

const WORD_STAGE_CACHE = new Map()

/* L2 主题（对象结构 → 统一主题描述） */
function l2Themes() {
  const data = getWordsL2()
  return Object.keys(data).map((key) => {
    const meta = L2_THEME_META[key] || {}
    return {
      key,
      pool: `l2_${key}`,
      title: meta.title || key,
      emoji: meta.emoji || '📘',
      words: Array.isArray(data[key]) ? data[key] : []
    }
  })
}

/* L5 词主题 / 词组主题（词组包 id 形如 ph_*） */
function l5WordThemes() {
  return getL5Themes()
    .filter((t) => !String(t.id).startsWith('ph_'))
    .map((t) => ({
      key: t.id,
      pool: t.id,
      title: t.title || t.id,
      emoji: t.emoji || '📗',
      words: Array.isArray(t.words) ? t.words : []
    }))
}

function phraseThemes() {
  return getL5Themes()
    .filter((t) => String(t.id).startsWith('ph_'))
    .map((t) => ({
      key: t.id,
      pool: t.id,
      title: t.title || t.id,
      emoji: t.emoji || '💬',
      words: Array.isArray(t.words) ? t.words : []
    }))
}

function chunk(arr, n) {
  const per = Math.ceil(arr.length / n)
  const out = []
  for (let i = 0; i < n; i++) out.push(arr.slice(i * per, (i + 1) * per))
  return out
}

/* 等级 → 主题序列：
   L2~L5 基础词汇按主导 CEFR 四段；L8~L12 中级词汇五等分，词组包归入 L12 末尾；
   L15 学术词汇按 L8 词库 12 词/段切片 */
const L2_LEVEL_THEMES = [null, null, null, null] // 惰性填充：[A1, A2·上, A2·下, B1]
const L5_LEVEL_THEMES = [null, null, null, null, null] // 惰性填充：[L8~L12 主题段]
const L8_THEMES = [null] // 惰性填充：学术词汇 42 段

/* L2 主题主导 CEFR：统计主题内词条 cefr 数量取众数（A1>A2>B1 平局偏好） */
function l2ThemeDominantCefr(key) {
  const words = getWordsL2()[key]
  if (!Array.isArray(words) || !words.length) return 'A2'
  const cnt = { A1: 0, A2: 0, B1: 0 }
  for (const w of words) {
    const c = w && w.cefr
    if (cnt[c] !== undefined) cnt[c] += 1
  }
  const order = ['A1', 'A2', 'B1']
  let best = 'A2'
  let bestN = -1
  for (const c of order) {
    if (cnt[c] > bestN) {
      best = c
      bestN = cnt[c]
    }
  }
  return best
}

/* L2 主题四段：A1 → A2·上 → A2·下 → B1（各段内部保持词库原顺序） */
function segmentL2Themes() {
  const all = l2Themes()
  const a1 = []
  const a2 = []
  const b1 = []
  for (const t of all) {
    const c = l2ThemeDominantCefr(t.key)
    if (c === 'A1') a1.push(t)
    else if (c === 'B1') b1.push(t)
    else a2.push(t)
  }
  const mid = Math.ceil(a2.length / 2)
  return [a1, a2.slice(0, mid), a2.slice(mid), b1]
}

/* L8 学术词汇主题段：12 词/段，池名 l8_seg_N（无 emoji/theme 字段，仅选择题） */
function l8Themes() {
  const words = getL8Words()
  const segs = []
  for (let i = 0; i * 12 < words.length; i++) {
    const slice = words.slice(i * 12, (i + 1) * 12)
    if (!slice.length) break
    segs.push({
      key: `l8_seg_${i + 1}`,
      pool: `l8_seg_${i + 1}`,
      title: `学术词汇 ${String(i + 1).padStart(2, '0')}`,
      emoji: '📖',
      words: slice
    })
  }
  return segs
}

/* 分段是否为空（词库未加载时建出的空分段，数据到位后需要重建） */
function segmentsEmpty(segs) {
  return !segs || !segs.length || segs.every((seg) => !seg || !seg.words || !seg.words.length)
}

function ensureThemeSegments() {
  /* 注意：不能只用"是否为 null"判断。应用现在立即挂载、词库后台加载，
     挂载瞬间的首次访问可能在词库就绪前建出全空分段并被永久锁死
     （表现为词汇等级零关卡、通关 L1 后推荐下一关时报 reading 'id'）。
     这里改为：分段为空时（首次或词库后到）都重建。 */
  if (segmentsEmpty(L2_LEVEL_THEMES[0])) {
    const segs = segmentL2Themes()
    segs.forEach((seg, i) => {
      L2_LEVEL_THEMES[i] = seg
    })
  }
  if (segmentsEmpty(L5_LEVEL_THEMES[0])) {
    const segs = chunk(l5WordThemes(), 5)
    segs[4] = segs[4].concat(phraseThemes())
    segs.forEach((seg, i) => {
      L5_LEVEL_THEMES[i] = seg
    })
  }
  if (segmentsEmpty(L8_THEMES[0])) {
    L8_THEMES[0] = l8Themes()
  }
}

function themesForWordLevel(levelNum) {
  ensureThemeSegments()
  if (levelNum === 2) return L2_LEVEL_THEMES[0]
  if (levelNum === 3) return L2_LEVEL_THEMES[1]
  if (levelNum === 4) return L2_LEVEL_THEMES[2]
  if (levelNum === 5) return L2_LEVEL_THEMES[3]
  if (levelNum === 15) return L8_THEMES[0]
  return L5_LEVEL_THEMES[levelNum - 8]
}

function buildWordStages(levelNum, source) {
  const themes = themesForWordLevel(levelNum)
  const signature = `${levelNum}:` + themes.map((t) => t.words.length).join(',')
  const cached = WORD_STAGE_CACHE.get(levelNum)
  // 词库未加载（签名全 0）时不读写缓存，避免启动早期锁死空关卡
  if (cached && cached.signature === signature && themes.some((t) => t.words.length)) {
    return cached.stages
  }

  const stages = []
  let seq = 0
  themes.forEach((t, ti) => {
    if (!t.words.length) return
    const half = Math.ceil(t.words.length / 2)
    const groups = [t.words.slice(0, half), t.words.slice(half)]
    groups.forEach((group, gi) => {
      if (!group.length) return
      seq += 1
      const first = gi === 0
      /* 词组包（id 形如 ph_*）与学术词汇（source='l8'）：不含 emoji 看图义，
         也不做字母拼写，两关都用选择题——先看英文选释义，再看中文选英文表达。 */
      const isPhrase = String(t.key).startsWith('ph_')
      const choiceOnly = isPhrase || source === 'l8'
      const listenMode = first && !choiceOnly && ti % 3 === 2
      let type = 'word_choice'
      let mode = ''
      let desc = `认识「${t.title}」的 ${group.length} 个词`
      if (choiceOnly) {
        mode = first ? 'en2zh' : 'zh2en'
        desc = first
          ? `理解「${t.title}」的 ${group.length} 个${source === 'l8' ? '学术词汇' : '搭配'}`
          : `看中文，选出「${t.title}」的 ${group.length} 个${source === 'l8' ? '学术词汇' : '搭配'}`
      } else if (!first) {
        if (source === 'l2') {
          type = 'word_match'
          desc = `看图巩固这 ${group.length} 个词`
        } else {
          type = ti % 2 === 1 ? 'word_spell' : 'word_match'
          desc = type === 'word_spell' ? `用字母盘拼出这 ${group.length} 个词` : `看图巩固这 ${group.length} 个词`
        }
      } else if (listenMode) {
        desc = `听发音选出「${t.title}」的 ${group.length} 个词`
      }

      stages.push({
        id: `L${levelNum}-U${ti + 1}-S${gi + 1}`,
        stage: seq,
        unit: ti + 1,
        unitTitle: t.title,
        unitEmoji: t.emoji,
        title: `${t.title} · ${first ? (isPhrase ? '理解' : '认词') : '巩固'}`,
        type,
        desc,
        available: true,
        content: {
          pool: t.pool,
          focus: group.map((w) => `${w.word}|${w.pos || ''}`),
          focusWords: group,
          count: group.length,
          ...(mode ? { mode } : {}),
          ...(listenMode ? { mode: 'listen' } : {})
        }
      })
    })
  })

  const result = { signature, stages }
  if (themes.some((t) => t.words.length)) WORD_STAGE_CACHE.set(levelNum, result)
  return stages
}

/* ---------- L2~L5 基础词汇（主题驱动，按主导 CEFR 四段） ---------- */
function baseWordLevelConfig(levelNum, name, sub) {
  return {
    level: levelNum,
    name,
    desc: `主题基础词汇（${sub}），每个主题 2 关：先认词，再巩固`,
    available: true,
    get stages() {
      return buildWordStages(levelNum, 'l2')
    }
  }
}

const L2 = baseWordLevelConfig(2, '基础词汇 · A1', 'A1 入门篇')
const L3 = baseWordLevelConfig(3, '基础词汇 · A2 · 上', 'A2 提升篇（上）')
const L4 = baseWordLevelConfig(4, '基础词汇 · A2 · 下', 'A2 提升篇（下）')
const L5 = baseWordLevelConfig(5, '基础词汇 · B1', 'B1 进阶层')

/* ---------- L6 日常对话（6 关：4 场景 + 2 听力；原 L4 平移） ---------- */
const L6 = {
  level: 6,
  name: '日常对话',
  desc: '问候、点餐、购物、问路等生活场景对话（4 场景 + 2 篇慢速听力）',
  available: true,
  stages: [
    {
      id: 'L6-1',
      stage: 1,
      title: '问候与自我介绍',
      type: 'dialogue',
      desc: '学习见面问候、自我介绍与道别用语',
      available: true,
      content: { scene: 'greeting' }
    },
    {
      id: 'L6-2',
      stage: 2,
      title: '餐厅点餐',
      type: 'dialogue',
      desc: '学习点餐、询价与结账的常用表达',
      available: true,
      content: { scene: 'ordering' }
    },
    {
      id: 'L6-3',
      stage: 3,
      title: '购物',
      type: 'dialogue',
      desc: '学习购物问价、尺码与付款表达',
      available: true,
      content: { scene: 'shopping' }
    },
    {
      id: 'L6-4',
      stage: 4,
      title: '问路',
      type: 'dialogue',
      desc: '学习问路、指路与方位表达',
      available: true,
      content: { scene: 'directions' }
    },
    {
      id: 'L6-5',
      stage: 5,
      title: '场景听力（一）',
      type: 'listening',
      desc: '听场景相关慢速短句，回答理解题',
      available: true,
      content: { script: 'l3-listening-1' }
    },
    {
      id: 'L6-6',
      stage: 6,
      title: '场景听力（二）',
      type: 'listening',
      desc: '听点餐与购物场景短句，回答理解题',
      available: true,
      content: { script: 'l3-listening-2' }
    }
  ]
}

/* ---------- L7 初级语法（6 语法单元 + 2 连词成句；原 L5 平移） ---------- */
const L7 = {
  level: 7,
  name: '初级语法',
  desc: 'be 动词、一般现在时等基础语法 + 连词成句训练',
  available: true,
  stages: [
    {
      id: 'L7-1',
      stage: 1,
      title: 'be 动词',
      type: 'grammar_quiz',
      desc: '掌握 am / is / are 的用法',
      available: true,
      content: { unit: 'be_verbs' }
    },
    {
      id: 'L7-2',
      stage: 2,
      title: '一般现在时',
      type: 'grammar_quiz',
      desc: '掌握一般现在时与第三人称单数变化',
      available: true,
      content: { unit: 'present_simple' }
    },
    {
      id: 'L7-3',
      stage: 3,
      title: '名词复数',
      type: 'grammar_quiz',
      desc: '掌握名词复数的规则与不规则变化',
      available: true,
      content: { unit: 'plural_nouns' }
    },
    {
      id: 'L7-4',
      stage: 4,
      title: '代词',
      type: 'grammar_quiz',
      desc: '掌握主格、宾格与物主代词',
      available: true,
      content: { unit: 'pronouns' }
    },
    {
      id: 'L7-5',
      stage: 5,
      title: 'there be 句型',
      type: 'grammar_quiz',
      desc: '掌握 there is / there are 的用法',
      available: true,
      content: { unit: 'there_be' }
    },
    {
      id: 'L7-6',
      stage: 6,
      title: '简单句型',
      type: 'grammar_quiz',
      desc: '掌握基本句型结构与祈使句',
      available: true,
      content: { unit: 'simple_sentences' }
    },
    {
      id: 'L7-7',
      stage: 7,
      title: '连词成句 · 基础',
      type: 'word_order',
      desc: '把乱序单词排成通顺的句子（陈述句语序）',
      available: true,
      content: { bank: 'basic', count: 8 }
    },
    {
      id: 'L7-8',
      stage: 8,
      title: '连词成句 · 挑战',
      type: 'word_order',
      desc: '更长的句子与疑问句、否定句语序',
      available: true,
      content: { bank: 'adv', count: 6 }
    }
  ]
}

/* ---------- L8~L12 中级词汇（主题驱动，五等分） ---------- */
function wordLevelConfig(levelNum, name, sub) {
  return {
    level: levelNum,
    name,
    desc: `B1–C1 话题词汇（${sub}），每个主题 2 关：先认词，再巩固`,
    available: true,
    get stages() {
      return buildWordStages(levelNum, 'l5')
    }
  }
}

const L8 = wordLevelConfig(8, '中级词汇 · 起步', '起步篇')
const L9 = wordLevelConfig(9, '中级词汇 · 进阶', '进阶篇')
const L10 = wordLevelConfig(10, '中级词汇 · 提高', '提高篇')
const L11 = wordLevelConfig(11, '中级词汇 · 强化', '强化篇')
const L12 = wordLevelConfig(12, '中级词汇 · 精通', '精通篇（含词组搭配）')

/* ---------- L13 听说进阶（16 关：每关 1 篇听力；原 L10 平移） ---------- */
const L13 = {
  level: 13,
  name: '听说进阶',
  desc: '16 篇中速听力课文 + 听力理解题（AudioPlayer 播放）',
  available: true,
  get stages() {
    return L6_LISTENING.map((m, i) => ({
      id: `L13-${i + 1}`,
      stage: i + 1,
      title: m.title,
      type: 'listening',
      desc: `听「${m.title}」课文，回答理解题`,
      available: true,
      content: { script: m.id }
    }))
  }
}

/* ---------- L14 高级阅读写作（16 关：每关 1 篇长文阅读；原 L11 平移） ---------- */
const L14 = {
  level: 14,
  name: '高级阅读写作',
  desc: '16 篇长文章阅读、复杂语法（从句 / 虚拟语气）与写作仿写基础',
  available: true,
  get stages() {
    return ARTICLES_L7.map((a, i) => ({
      id: `L14-${i + 1}`,
      stage: i + 1,
      title: a.title,
      type: 'reading',
      desc: `短文阅读「${a.title}」：主旨 / 细节 / 词汇题 + 语法要点`,
      available: true,
      content: { article: a.id, grammarUnitId: a.grammarUnitId }
    }))
  }
}

/* ---------- L15 学术词汇（主题驱动，L8 词库 504 词全量进入关卡） ---------- */
const L15 = {
  level: 15,
  name: '学术词汇',
  desc: '学术词汇全量消化：每段 12 词，先认词，再巩固（选择题）',
  available: true,
  get stages() {
    return buildWordStages(15, 'l8')
  }
}

/* ---------- L16 托福雅思冲刺（8 仿真关；原 L12 平移，保留 s8_01~s8_08） ---------- */
const L16 = {
  level: 16,
  name: '托福雅思冲刺',
  desc: '托福 / 雅思冲刺 · 综合复习关：覆盖 L15 高阶学术词汇（学术词库后 96 词），仿真题题型训练（阅读 / 听力分题型）',
  available: true,
  stages: [
    { id: 'L16-1', stage: 1, title: '学术生活 · 阅读仿真', type: 'simulation', desc: '仿真冲刺：学术生活主题阅读（L15 高阶学术词综合复习）', available: true, content: { simulation: 's8_01' } },
    { id: 'L16-2', stage: 2, title: '社会新闻 · 听力仿真', type: 'simulation', desc: '仿真冲刺：社会新闻主题听力（L15 高阶学术词综合复习）', available: true, content: { simulation: 's8_02' } },
    { id: 'L16-3', stage: 3, title: '健康科学 · 阅读仿真', type: 'simulation', desc: '仿真冲刺：健康科学主题阅读（L15 高阶学术词综合复习）', available: true, content: { simulation: 's8_03' } },
    { id: 'L16-4', stage: 4, title: '科技网络 · 听力仿真', type: 'simulation', desc: '仿真冲刺：科技网络主题听力（L15 高阶学术词综合复习）', available: true, content: { simulation: 's8_04' } },
    { id: 'L16-5', stage: 5, title: '环境自然 · 阅读仿真', type: 'simulation', desc: '仿真冲刺：环境自然主题阅读（L15 高阶学术词综合复习）', available: true, content: { simulation: 's8_05' } },
    { id: 'L16-6', stage: 6, title: '工作职业 · 听力仿真', type: 'simulation', desc: '仿真冲刺：工作职业主题听力（L15 高阶学术词综合复习）', available: true, content: { simulation: 's8_06' } },
    { id: 'L16-7', stage: 7, title: '旅行文化 · 阅读仿真', type: 'simulation', desc: '仿真冲刺：旅行文化主题阅读（L15 高阶学术词综合复习）', available: true, content: { simulation: 's8_07' } },
    { id: 'L16-8', stage: 8, title: '家庭情感 · 听力仿真', type: 'simulation', desc: '仿真冲刺：家庭情感主题听力（L15 高阶学术词综合复习）', available: true, content: { simulation: 's8_08' } }
  ]
}

export const LEVELS = [L1, L2, L3, L4, L5, L6, L7, L8, L9, L10, L11, L12, L13, L14, L15, L16]

/* ---------- 查询辅助 ---------- */
export function getLevel(level) {
  return LEVELS.find((l) => l.level === Number(level)) || null
}

export function getStageById(stageId) {
  for (const lv of LEVELS) {
    const st = lv.stages.find((s) => s.id === String(stageId))
    if (st) return { ...st, level: lv.level }
  }
  return null
}

/* 关卡词条收集：单词类关卡取 pool 词条，L12 仿真关取对应主题学术词，
   其余类型（对话/语法/听力/阅读）无独立词条返回 []。
   词条唯一键 = word|pos（与词库去重规则一致）。 */
export function getStageWords(stageId) {
  const st = getStageById(stageId)
  if (!st) return []
  /* 固定内容等级（L6 日常对话 / L13 听说进阶 / L14 高级阅读写作）：
     返回该关语料生词（按 content.source 过滤），通关后并入掌握词并进入复习池。
     词条唯一键 = word|pos（与词库去重规则一致）。 */
  if (st.level === 6 || st.level === 13 || st.level === 14) {
    const src = (st.content && (st.content.scene || st.content.script || st.content.article)) || ''
    const levelKey = `l${st.level}`
    return getCorpusWords(levelKey)
      .filter((w) => w.source === src)
      .map((w) => `${w.word}|${w.pos || ''}`)
  }
  if (st.type === 'simulation') {
    // 每主题 12 词，按仿真题序号切片；L16 冲刺复习取 L15 学术词库后 96 词（当前 L8 总量后 96 词）
    const idx = Number(String((st.content && st.content.simulation) || '').replace('s8_', ''))
    if (!idx || idx < 1 || idx > 8) return []
    const l8Total = getL8Words().length
    const slice = getL8Words().slice(l8Total - 96 + (idx - 1) * 12, l8Total - 96 + idx * 12)
    return slice.map((w) => `${w.word}|${w.pos || ''}`)
  }
  if (['word_choice', 'word_match', 'word_spell'].includes(st.type)) {
    // 细分关卡只掌握本关聚焦的词（content.focus），否则取整个词池
    if (st.content && Array.isArray(st.content.focus) && st.content.focus.length) {
      return st.content.focus
    }
    const pool = st.content && st.content.pool
    const data = getPoolData(pool)
    if (!Array.isArray(data)) return []
    return data
      .map((w) => {
        const key = w.word || w.en || w.text
        return key ? `${key}|${w.pos || ''}` : ''
      })
      .filter(Boolean)
  }
  return []
}

/* 内容池映射：关卡 content.pool → 数据源 */
function wordsByTheme(theme) {
  return getL5Themes().flatMap((t) => (t.id === theme ? t.words.map((w) => ({ ...w, theme: t.id })) : []))
}

export function getPoolData(pool) {
  switch (pool) {
    case 'letters':
      return LETTERS
    case 'vowels':
      return IPA_VOWELS
    case 'consonants':
      return IPA_CONSONANTS
    case 'phonics':
      return PHONICS_WORDS
    /* L2 基础词汇 */
    case 'l2_numbers_time':
      return [...getWordsL2().numbers, ...getWordsL2().time]
    case 'l2_colors':
      return getWordsL2().colors
    case 'l2_family':
      return getWordsL2().family
    case 'l2_food':
      return getWordsL2().food
    case 'l2_animals':
      return getWordsL2().animals
    case 'l2_body':
      return getWordsL2().body
    case 'l2_weather':
      return getWordsL2().weather
    case 'l2_transport_daily':
      return [...getWordsL2().transport, ...getWordsL2().daily]
    /* L5 中级词汇（旧主题 ID，兼容保留） */
    case 'l5_family_feelings':
      return wordsByTheme('l5_family_feelings')
    case 'l5_education':
      return wordsByTheme('l5_education')
    case 'l5_health_sports':
      return wordsByTheme('l5_health_sports')
    case 'l5_work_jobs':
      return wordsByTheme('l5_work_jobs')
    case 'l5_tech_network':
      return wordsByTheme('l5_tech_network')
    case 'l5_travel':
      return wordsByTheme('l5_travel')
    case 'l5_food_restaurant':
      return wordsByTheme('l5_food_restaurant')
    case 'l5_shopping':
      return wordsByTheme('l5_shopping')
    case 'l5_environment':
      return wordsByTheme('l5_environment')
    case 'l5_society_news':
      return wordsByTheme('l5_society_news')
    default:
      break
  }
  /* 通用规则：l2_ 开头取单主题词表；l8_seg_ 开头取 L8 学术词段；
     l5/l5b/l6 等数字前缀与 ph_ 开头取主题包 */
  if (typeof pool === 'string') {
    if (pool.startsWith('l2_')) return getWordsL2()[pool.slice(3)] || []
    if (pool.startsWith('l8_seg_')) {
      const n = Number(pool.replace('l8_seg_', ''))
      if (!n || n < 1) return []
      return getL8Words().slice((n - 1) * 12, n * 12)
    }
    if (/^l\d/.test(pool) || pool.startsWith('ph_')) return wordsByTheme(pool)
  }
  return []
}

export default { LEVELS, STAGE_TYPES, LEVEL_UNLOCK_RATIO, getLevel, getStageById, getStageWords, getPoolData }
