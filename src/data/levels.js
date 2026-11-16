/* ============================================================
   src/data/levels.js —— 等级与关卡结构定义（L1~L8）
   L1 关卡完整实现；L2 基础词汇已开放；L3~L8 逐步开放。
   关卡模型：{ id, level, stage, title, type, desc, available, content }
   ============================================================ */
import { LETTERS, IPA_VOWELS, IPA_CONSONANTS, PHONICS_WORDS } from './letters'
import { getWordsL2, getAllL5Words, getL5Themes, getL8Words } from '../services/wordData'

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

/* ---------- 词汇关卡生成器（L2 / L5） ----------
   词库按主题组织，每个主题 12 词拆成 2 关（每关 6 词）：
   第 1 关「认词」用选择/听音，第 2 关「巩固」用看图或拼写。
   新增主题只要往词库 JSON 加数据，关卡自动出现，无需改本文件。 */

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

function wordThemesFor(prefix) {
  if (prefix === 'L2') {
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
  return getL5Themes().map((t) => ({
    key: t.id,
    pool: t.id,
    title: t.title || t.id,
    emoji: t.emoji || '📗',
    words: Array.isArray(t.words) ? t.words : []
  }))
}

function buildWordStages(prefix) {
  const themes = wordThemesFor(prefix)
  const signature = themes.map((t) => t.words.length).join(',')
  const cached = WORD_STAGE_CACHE.get(prefix)
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
      /* 词组包（id 形如 ph_*）：不含 emoji 看图义，也不做字母拼写，
         两关都用选择题——先看英文选释义，再看中文选英文表达。 */
      const isPhrase = String(t.key).startsWith('ph_')
      const listenMode = first && !isPhrase && ti % 3 === 2
      let type = 'word_choice'
      let mode = ''
      let desc = `认识「${t.title}」的 ${group.length} 个词`
      if (isPhrase) {
        mode = first ? 'en2zh' : 'zh2en'
        desc = first
          ? `理解「${t.title}」的 ${group.length} 个搭配`
          : `看中文，选出「${t.title}」的 ${group.length} 个搭配`
      } else if (!first) {
        if (prefix === 'L2') {
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
        id: `${prefix}-U${ti + 1}-S${gi + 1}`,
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
  if (themes.some((t) => t.words.length)) WORD_STAGE_CACHE.set(prefix, result)
  return stages
}

/* ---------- L2 基础词汇（主题驱动，22 主题 × 2 关） ---------- */
const L2 = {
  level: 2,
  name: '基础词汇',
  desc: '主题基础词汇，每个主题 2 关：先认词，再巩固',
  available: true,
  get stages() {
    return buildWordStages('L2')
  }
}

/* ---------- L3 日常对话（6 关：4 场景 + 2 听力） ---------- */
const L3 = {
  level: 3,
  name: '日常对话',
  desc: '问候、点餐、购物、问路等生活场景对话（首期 4 场景 + 2 篇慢速听力）',
  available: true,
  stages: [
    {
      id: 'L3-1',
      stage: 1,
      title: '问候与自我介绍',
      type: 'dialogue',
      desc: '学习见面问候、自我介绍与道别用语',
      available: true,
      content: { scene: 'greeting' }
    },
    {
      id: 'L3-2',
      stage: 2,
      title: '餐厅点餐',
      type: 'dialogue',
      desc: '学习点餐、询价与结账的常用表达',
      available: true,
      content: { scene: 'ordering' }
    },
    {
      id: 'L3-3',
      stage: 3,
      title: '购物',
      type: 'dialogue',
      desc: '学习购物问价、尺码与付款表达',
      available: true,
      content: { scene: 'shopping' }
    },
    {
      id: 'L3-4',
      stage: 4,
      title: '问路',
      type: 'dialogue',
      desc: '学习问路、指路与方位表达',
      available: true,
      content: { scene: 'directions' }
    },
    {
      id: 'L3-5',
      stage: 5,
      title: '场景听力（一）',
      type: 'listening',
      desc: '听场景相关慢速短句，回答理解题',
      available: true,
      content: { script: 'l3-listening-1' }
    },
    {
      id: 'L3-6',
      stage: 6,
      title: '场景听力（二）',
      type: 'listening',
      desc: '听点餐与购物场景短句，回答理解题',
      available: true,
      content: { script: 'l3-listening-2' }
    }
  ]
}

/* ---------- L4 初级语法（6 关） ---------- */
const L4 = {
  level: 4,
  name: '初级语法',
  desc: 'be 动词、一般现在时、名词复数等基础语法（6 个语法单元）',
  available: true,
  stages: [
    {
      id: 'L4-1',
      stage: 1,
      title: 'be 动词',
      type: 'grammar_quiz',
      desc: '掌握 am / is / are 的用法',
      available: true,
      content: { unit: 'be_verbs' }
    },
    {
      id: 'L4-2',
      stage: 2,
      title: '一般现在时',
      type: 'grammar_quiz',
      desc: '掌握一般现在时与第三人称单数变化',
      available: true,
      content: { unit: 'present_simple' }
    },
    {
      id: 'L4-3',
      stage: 3,
      title: '名词复数',
      type: 'grammar_quiz',
      desc: '掌握名词复数的规则与不规则变化',
      available: true,
      content: { unit: 'plural_nouns' }
    },
    {
      id: 'L4-4',
      stage: 4,
      title: '代词',
      type: 'grammar_quiz',
      desc: '掌握主格、宾格与物主代词',
      available: true,
      content: { unit: 'pronouns' }
    },
    {
      id: 'L4-5',
      stage: 5,
      title: 'there be 句型',
      type: 'grammar_quiz',
      desc: '掌握 there is / there are 的用法',
      available: true,
      content: { unit: 'there_be' }
    },
    {
      id: 'L4-6',
      stage: 6,
      title: '简单句型',
      type: 'grammar_quiz',
      desc: '掌握基本句型结构与祈使句',
      available: true,
      content: { unit: 'simple_sentences' }
    }
  ]
}

/* ---------- L5 中级词汇（主题驱动，每主题 2 关） ---------- */
const L5 = {
  level: 5,
  name: '中级词汇',
  desc: 'B1 话题词汇，每个主题 2 关：先认词，再巩固',
  available: true,
  get stages() {
    return buildWordStages('L5')
  }
}

/* ---------- L6 听说进阶（8 关：每关 1 篇听力） ---------- */
const L6 = {
  level: 6,
  name: '听说进阶',
  desc: '8 篇中速听力课文 + 听力理解题（AudioPlayer 播放）',
  available: true,
  stages: [
    {
      id: 'L6-1',
      stage: 1,
      title: '我的自我介绍',
      type: 'listening',
      desc: '听自我介绍课文，回答理解题',
      available: true,
      content: { script: 'l6_01' }
    },
    {
      id: 'L6-2',
      stage: 2,
      title: '我的家庭',
      type: 'listening',
      desc: '听家庭介绍课文，回答理解题',
      available: true,
      content: { script: 'l6_02' }
    },
    {
      id: 'L6-3',
      stage: 3,
      title: '一日三餐',
      type: 'listening',
      desc: '听饮食话题课文，回答理解题',
      available: true,
      content: { script: 'l6_03' }
    },
    {
      id: 'L6-4',
      stage: 4,
      title: '学校生活',
      type: 'listening',
      desc: '听校园生活课文，回答理解题',
      available: true,
      content: { script: 'l6_04' }
    },
    {
      id: 'L6-5',
      stage: 5,
      title: '周末计划',
      type: 'listening',
      desc: '听周末计划课文，回答理解题',
      available: true,
      content: { script: 'l6_05' }
    },
    {
      id: 'L6-6',
      stage: 6,
      title: '一次购物经历',
      type: 'listening',
      desc: '听购物经历课文，回答理解题',
      available: true,
      content: { script: 'l6_06' }
    },
    {
      id: 'L6-7',
      stage: 7,
      title: '天气与旅行',
      type: 'listening',
      desc: '听天气旅行课文，回答理解题',
      available: true,
      content: { script: 'l6_07' }
    },
    {
      id: 'L6-8',
      stage: 8,
      title: '我的梦想',
      type: 'listening',
      desc: '听梦想话题课文，回答理解题',
      available: true,
      content: { script: 'l6_08' }
    }
  ]
}

const L7 = {
  level: 7,
  name: '高级阅读写作',
  desc: '长文章阅读、复杂语法（从句 / 虚拟语气）与写作仿写基础',
  available: true,
  stages: [
    { id: 'L7-1', stage: 1, title: '我的家乡', type: 'reading', desc: '短文阅读：主旨 / 细节题 + 定语从句', available: true, content: { article: 'a7_01', grammarUnitId: 'l7_clause' } },
    { id: 'L7-2', stage: 2, title: '学生的一天', type: 'reading', desc: '短文阅读：细节题 + 状语从句', available: true, content: { article: 'a7_02', grammarUnitId: 'l7_adverbial' } },
    { id: 'L7-3', stage: 3, title: '健康与运动', type: 'reading', desc: '短文阅读：词汇题 + 被动语态', available: true, content: { article: 'a7_03', grammarUnitId: 'l7_passive' } },
    { id: 'L7-4', stage: 4, title: '科技生活', type: 'reading', desc: '短文阅读：推断题 + 定语从句', available: true, content: { article: 'a7_04', grammarUnitId: 'l7_clause' } },
    { id: 'L7-5', stage: 5, title: '城堡的故事', type: 'reading', desc: '短文阅读：被动语态综合', available: true, content: { article: 'a7_05', grammarUnitId: 'l7_passive' } },
    { id: 'L7-6', stage: 6, title: '保护环境', type: 'reading', desc: '短文阅读：观点题 + 虚拟语气', available: true, content: { article: 'a7_06', grammarUnitId: 'l7_subjunctive' } }
  ]
}

const L8 = {
  level: 8,
  name: '托福雅思冲刺',
  desc: '学术词汇与托福 / 雅思仿真题题型训练（阅读 / 听力 / 写作 / 口语分题型）',
  available: true,
  stages: [
    { id: 'L8-1', stage: 1, title: '学术生活 · 阅读仿真', type: 'simulation', desc: '仿真题题型训练：学术生活主题阅读', available: true, content: { simulation: 's8_01' } },
    { id: 'L8-2', stage: 2, title: '社会新闻 · 听力仿真', type: 'simulation', desc: '仿真题题型训练：社会新闻主题听力', available: true, content: { simulation: 's8_02' } },
    { id: 'L8-3', stage: 3, title: '健康科学 · 阅读仿真', type: 'simulation', desc: '仿真题题型训练：健康科学主题阅读', available: true, content: { simulation: 's8_03' } },
    { id: 'L8-4', stage: 4, title: '科技网络 · 听力仿真', type: 'simulation', desc: '仿真题题型训练：科技网络主题听力', available: true, content: { simulation: 's8_04' } },
    { id: 'L8-5', stage: 5, title: '环境自然 · 阅读仿真', type: 'simulation', desc: '仿真题题型训练：环境自然主题阅读', available: true, content: { simulation: 's8_05' } },
    { id: 'L8-6', stage: 6, title: '工作职业 · 听力仿真', type: 'simulation', desc: '仿真题题型训练：工作职业主题听力', available: true, content: { simulation: 's8_06' } },
    { id: 'L8-7', stage: 7, title: '旅行文化 · 阅读仿真', type: 'simulation', desc: '仿真题题型训练：旅行文化主题阅读', available: true, content: { simulation: 's8_07' } },
    { id: 'L8-8', stage: 8, title: '家庭情感 · 听力仿真', type: 'simulation', desc: '仿真题题型训练：家庭情感主题听力', available: true, content: { simulation: 's8_08' } }
  ]
}

export const LEVELS = [L1, L2, L3, L4, L5, L6, L7, L8]

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

/* 关卡词条收集：单词类关卡取 pool 词条，L8 仿真关取对应主题学术词，
   其余类型（对话/语法/听力/阅读）无独立词条返回 []。
   词条唯一键 = word|pos（与词库去重规则一致）。 */
export function getStageWords(stageId) {
  const st = getStageById(stageId)
  if (!st) return []
  if (st.type === 'simulation') {
    // 每主题 12 词，按仿真题序号切片
    const idx = Number(String((st.content && st.content.simulation) || '').replace('s8_', ''))
    if (!idx || idx < 1 || idx > 8) return []
    const slice = getL8Words().slice((idx - 1) * 12, idx * 12)
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
  return getAllL5Words().filter((w) => w.theme === theme)
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
    /* L5 中级词汇 */
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
  /* 通用规则：l2_ 开头取单主题词表；l5*（l5_/l5b_/l5c_）与 ph_ 开头取主题包 */
  if (typeof pool === 'string') {
    if (pool.startsWith('l2_')) return getWordsL2()[pool.slice(3)] || []
    if (pool.startsWith('l5') || pool.startsWith('ph_')) return wordsByTheme(pool)
  }
  return []
}

export default { LEVELS, STAGE_TYPES, LEVEL_UNLOCK_RATIO, getLevel, getStageById, getStageWords, getPoolData }
