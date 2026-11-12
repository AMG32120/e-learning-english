/* ============================================================
   src/data/levels.js —— 等级与关卡结构定义（L1~L8）
   L1 关卡完整实现；L2 基础词汇已开放；L3~L8 逐步开放。
   关卡模型：{ id, level, stage, title, type, desc, available, content }
   ============================================================ */
import { LETTERS, IPA_VOWELS, IPA_CONSONANTS, PHONICS_WORDS } from './letters'
import { WORDS_L2 } from './words'
import { getAllL5Words } from './words_l5'
import { L8_ACADEMIC_WORDS } from './simulation_l8'

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

/* ---------- L2 基础词汇（8 关） ---------- */
const L2 = {
  level: 2,
  name: '基础词汇',
  desc: '数字、颜色、家庭、食物等主题基础词汇（约 120 词）',
  available: true,
  stages: [
    {
      id: 'L2-1',
      stage: 1,
      title: '数字与时间',
      type: 'word_choice',
      desc: '认识数字与时间的常用词',
      available: true,
      content: { pool: 'l2_numbers_time', count: 10 }
    },
    {
      id: 'L2-2',
      stage: 2,
      title: '色彩世界',
      type: 'word_choice',
      desc: '选择颜色单词的正确释义',
      available: true,
      content: { pool: 'l2_colors', count: 10 }
    },
    {
      id: 'L2-3',
      stage: 3,
      title: '我的家庭',
      type: 'word_match',
      desc: '看图（emoji）选出对应的家庭称呼',
      available: true,
      content: { pool: 'l2_family', count: 10 }
    },
    {
      id: 'L2-4',
      stage: 4,
      title: '美味食物',
      type: 'word_spell',
      desc: '看中文释义，用字母盘拼出食物单词',
      available: true,
      content: { pool: 'l2_food', count: 8 }
    },
    {
      id: 'L2-5',
      stage: 5,
      title: '可爱动物',
      type: 'word_choice',
      desc: '听发音选出正确的动物单词',
      available: true,
      content: { pool: 'l2_animals', count: 10, mode: 'listen' }
    },
    {
      id: 'L2-6',
      stage: 6,
      title: '认识身体',
      type: 'word_match',
      desc: '看图（emoji）选出对应的身体部位',
      available: true,
      content: { pool: 'l2_body', count: 10 }
    },
    {
      id: 'L2-7',
      stage: 7,
      title: '天气变化',
      type: 'word_spell',
      desc: '看中文释义，用字母盘拼出天气单词',
      available: true,
      content: { pool: 'l2_weather', count: 8 }
    },
    {
      id: 'L2-8',
      stage: 8,
      title: '交通与日用品',
      type: 'word_choice',
      desc: '选择交通工具与日用品的正确释义',
      available: true,
      content: { pool: 'l2_transport_daily', count: 10 }
    }
  ]
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

/* ---------- L5 中级词汇（10 关） ---------- */
const L5 = {
  level: 5,
  name: '中级词汇',
  desc: '家人情感、教育、职场、科技等 10 大主题词汇（120 词）',
  available: true,
  stages: [
    {
      id: 'L5-1',
      stage: 1,
      title: '家人与情感',
      type: 'word_choice',
      desc: '认识家庭称谓与情感形容词',
      available: true,
      content: { pool: 'l5_family_feelings', count: 10 }
    },
    {
      id: 'L5-2',
      stage: 2,
      title: '教育与学习',
      type: 'word_match',
      desc: '看图（emoji）选出教育学习词汇',
      available: true,
      content: { pool: 'l5_education', count: 10 }
    },
    {
      id: 'L5-3',
      stage: 3,
      title: '健康与运动',
      type: 'word_spell',
      desc: '拼出健康运动相关单词',
      available: true,
      content: { pool: 'l5_health_sports', count: 8 }
    },
    {
      id: 'L5-4',
      stage: 4,
      title: '工作与职业',
      type: 'word_choice',
      desc: '认识职场与职业词汇',
      available: true,
      content: { pool: 'l5_work_jobs', count: 10 }
    },
    {
      id: 'L5-5',
      stage: 5,
      title: '科技与网络',
      type: 'word_match',
      desc: '看图（emoji）选出科技网络词汇',
      available: true,
      content: { pool: 'l5_tech_network', count: 10 }
    },
    {
      id: 'L5-6',
      stage: 6,
      title: '旅行与交通',
      type: 'word_spell',
      desc: '拼出旅行交通相关单词',
      available: true,
      content: { pool: 'l5_travel', count: 8 }
    },
    {
      id: 'L5-7',
      stage: 7,
      title: '食物与餐饮',
      type: 'word_choice',
      desc: '认识餐饮与食物词汇',
      available: true,
      content: { pool: 'l5_food_restaurant', count: 10 }
    },
    {
      id: 'L5-8',
      stage: 8,
      title: '购物与消费',
      type: 'word_match',
      desc: '看图（emoji）选出购物消费词汇',
      available: true,
      content: { pool: 'l5_shopping', count: 10 }
    },
    {
      id: 'L5-9',
      stage: 9,
      title: '环境与自然',
      type: 'word_spell',
      desc: '拼出环境自然相关单词',
      available: true,
      content: { pool: 'l5_environment', count: 8 }
    },
    {
      id: 'L5-10',
      stage: 10,
      title: '社会与新闻',
      type: 'word_choice',
      desc: '认识社会新闻词汇',
      available: true,
      content: { pool: 'l5_society_news', count: 12 }
    }
  ]
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
    const slice = L8_ACADEMIC_WORDS.slice((idx - 1) * 12, idx * 12)
    return slice.map((w) => `${w.word}|${w.pos || ''}`)
  }
  if (['word_choice', 'word_match', 'word_spell'].includes(st.type)) {
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
      return [...WORDS_L2.numbers, ...WORDS_L2.time]
    case 'l2_colors':
      return WORDS_L2.colors
    case 'l2_family':
      return WORDS_L2.family
    case 'l2_food':
      return WORDS_L2.food
    case 'l2_animals':
      return WORDS_L2.animals
    case 'l2_body':
      return WORDS_L2.body
    case 'l2_weather':
      return WORDS_L2.weather
    case 'l2_transport_daily':
      return [...WORDS_L2.transport, ...WORDS_L2.daily]
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
      return []
  }
}

export default { LEVELS, STAGE_TYPES, LEVEL_UNLOCK_RATIO, getLevel, getStageById, getStageWords, getPoolData }
