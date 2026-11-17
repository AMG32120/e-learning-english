/* ============================================================
   src/data/sentences.js —— 连词成句句库
   basic：陈述句语序（配合 L4/L5 基础语法）
   adv：疑问句 / 否定句 / 更长句（配合 L5 后半语法）
   en 字段不含句尾标点（词块交互不需要标点），
   判定时不区分大小写与标点。
   ============================================================ */

export const SENTENCE_BANKS = {
  basic: [
    { en: 'I am a student', zh: '我是一名学生' },
    { en: 'She is my sister', zh: '她是我姐姐' },
    { en: 'We are good friends', zh: '我们是好朋友' },
    { en: 'This is my book', zh: '这是我的书' },
    { en: 'My father works in a bank', zh: '我爸爸在银行工作' },
    { en: 'I like apples very much', zh: '我非常喜欢苹果' },
    { en: 'He plays football after school', zh: '他放学后踢足球' },
    { en: 'They live in a small town', zh: '他们住在一个小镇上' },
    { en: 'The cat sleeps on the sofa', zh: '猫在沙发上睡觉' },
    { en: 'I go to school by bus', zh: '我坐公交车上学' },
    { en: 'My mother cooks dinner every day', zh: '我妈妈每天做晚饭' },
    { en: 'There are five books on the desk', zh: '桌子上有五本书' },
    { en: 'There is a park near my home', zh: '我家附近有一个公园' },
    { en: 'Water the flowers every morning', zh: '每天早上浇花' },
    { en: 'Open the window please', zh: '请打开窗户' },
    { en: 'These shoes are too expensive', zh: '这双鞋太贵了' },
    { en: 'My brother wants a new bike', zh: '我弟弟想要一辆新自行车' },
    { en: 'The weather is nice today', zh: '今天天气很好' },
    { en: 'I usually get up at seven', zh: '我通常七点起床' },
    { en: 'She drinks tea in the afternoon', zh: '她下午喝茶' },
    { en: 'Our teacher is very kind', zh: '我们的老师非常和善' },
    { en: 'The supermarket opens at eight', zh: '超市八点开门' },
    { en: 'I do my homework after dinner', zh: '我晚饭后做作业' },
    { en: 'Birds fly in the sky', zh: '鸟在天上飞' }
  ],
  adv: [
    { en: 'Does he like playing basketball', zh: '他喜欢打篮球吗' },
    { en: 'Do you often watch movies at home', zh: '你经常在家看电影吗' },
    { en: 'Where did you go last weekend', zh: '上周末你去了哪里' },
    { en: 'What time does the train leave', zh: '火车几点出发' },
    { en: 'How many students are there in your class', zh: '你们班有多少学生' },
    { en: 'I do not like cold weather', zh: '我不喜欢寒冷的天气' },
    { en: 'She does not eat meat at all', zh: '她完全不吃肉' },
    { en: 'Can you help me with my homework', zh: '你能帮我做作业吗' },
    { en: 'My sister can swim very well', zh: '我姐姐游泳游得很好' },
    { en: 'Why are you late for school today', zh: '你今天上学为什么迟到' },
    { en: 'Please do not touch the wet paint', zh: '请不要触碰未干的油漆' },
    { en: 'How do you go to work every day', zh: '你每天怎么去上班' },
    { en: 'There is not any milk in the fridge', zh: '冰箱里没有牛奶了' },
    { en: 'What does your mother do on Sundays', zh: '你妈妈周日做什么' },
    { en: 'The library closes at nine in the evening', zh: '图书馆晚上九点关门' },
    { en: 'Learning English takes time and patience', zh: '学英语需要时间和耐心' }
  ]
}

export function getSentences(bank) {
  return SENTENCE_BANKS[bank] || []
}

export default { SENTENCE_BANKS, getSentences }
