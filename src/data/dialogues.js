/* ============================================================
   src/data/dialogues.js —— L3 日常对话场景数据
   首期 4 场景（问候、点餐、购物、问路）+ 2 篇场景相关慢速听力
   场景结构：{ id, title, emoji, lines: [{ en, zh, note }], tips: [] }
   ============================================================ */

export const DIALOGUES_L3 = [
  {
    id: 'greeting',
    title: '问候与自我介绍',
    emoji: '👋',
    lines: [
      { en: 'Hello! Nice to meet you.', zh: '你好！很高兴认识你。', note: '初次见面的标准问候' },
      { en: 'Hi, I am Tom. What is your name?', zh: '嗨，我是汤姆。你叫什么名字？', note: '自我介绍句型：I am + 名字' },
      { en: 'My name is Lily. I am from China.', zh: '我叫莉莉。我来自中国。', note: '介绍国籍：be from + 国家' },
      { en: 'How are you today?', zh: '你今天怎么样？', note: '询问近况的常用句' },
      { en: 'I am fine, thank you. And you?', zh: '我很好，谢谢。你呢？', note: '回应问候：And you? 反问对方' },
      { en: 'I am great. It is nice to talk to you.', zh: '我很好。很高兴和你聊天。', note: '表达开心：nice to talk to you' },
      { en: 'Nice to meet you too. See you later!', zh: '我也很高兴认识你。回头见！', note: '道别用语：See you later' },
      { en: 'Goodbye! Have a nice day!', zh: '再见！祝你今天愉快！', note: '道别祝福：Have a nice day' }
    ],
    tips: ['见面问候先说 Hello / Hi', '自我介绍用 I am + 名字', '道别用 See you later / Goodbye']
  },
  {
    id: 'ordering',
    title: '餐厅点餐',
    emoji: '🍜',
    lines: [
      { en: 'Welcome! Here is the menu.', zh: '欢迎光临！这是菜单。', note: '服务员开场用语' },
      { en: 'Can I have the menu, please?', zh: '请给我看一下菜单好吗？', note: '礼貌请求：Can I have...?' },
      { en: 'What would you like to eat?', zh: '您想吃什么？', note: '询问需求：What would you like?' },
      { en: 'I would like a bowl of noodles.', zh: '我想要一碗面条。', note: '表达想要：I would like + 食物' },
      { en: 'Would you like something to drink?', zh: '您想喝点什么吗？', note: '询问饮品：something to drink' },
      { en: 'Yes, a glass of water, please.', zh: '好的，请来一杯水。', note: '量词：a glass of（一杯）' },
      { en: 'Here you are. Enjoy your meal!', zh: '给您。请慢用！', note: '上菜用语：Enjoy your meal' },
      { en: 'Thank you. Can I have the bill, please?', zh: '谢谢。请给我账单。', note: '结账：the bill（账单）' },
      { en: 'Sure. That will be twenty yuan.', zh: '好的。一共二十元。', note: '价格表达：That will be + 金额' },
      { en: 'Here is the money. Keep the change.', zh: '这是钱。不用找了。', note: 'Keep the change 表示零钱不用找' }
    ],
    tips: ['点餐常用 Would like 表达意愿', 'a bowl of / a glass of 为常用量词', '结账用 Can I have the bill?']
  },
  {
    id: 'shopping',
    title: '购物',
    emoji: '🛒',
    lines: [
      { en: 'Can I help you?', zh: '需要帮忙吗？', note: '店员开场：Can I help you?' },
      { en: 'Yes, I am looking for a T-shirt.', zh: '是的，我在找一件 T 恤。', note: '寻找商品：look for + 商品' },
      { en: 'What size do you wear?', zh: '您穿什么尺码？', note: '询问尺码：size（尺码）' },
      { en: 'I wear size M.', zh: '我穿 M 码。', note: '尺码表达：size M' },
      { en: 'How much is this T-shirt?', zh: '这件 T 恤多少钱？', note: '询价：How much is...?' },
      { en: 'It is fifty yuan. It is on sale today.', zh: '五十元。今天打折。', note: '打折：on sale' },
      { en: 'Great! I will take it.', zh: '太好了！我要买它。', note: '决定购买：I will take it' },
      { en: 'Do you need a bag?', zh: '您需要袋子吗？', note: '服务用语：need a bag' },
      { en: 'Yes, please. Here is the money.', zh: '好的。这是钱。', note: '付款：Here is the money' },
      { en: 'Thank you. Here is your change.', zh: '谢谢。这是找零。', note: '找零：change（零钱）' }
    ],
    tips: ['询问价格用 How much is...?', '尺码用 size S/M/L', 'on sale 表示打折']
  },
  {
    id: 'directions',
    title: '问路',
    emoji: '🗺️',
    lines: [
      { en: 'Excuse me, where is the subway station?', zh: '打扰一下，地铁站在哪里？', note: '礼貌开场：Excuse me' },
      { en: 'Go straight and turn left at the corner.', zh: '直走，在拐角处左转。', note: '指路：go straight（直走）turn left（左转）' },
      { en: 'Is it far from here?', zh: '离这里远吗？', note: '询问距离：far from here' },
      { en: 'No, it is about five minutes on foot.', zh: '不远，步行大约五分钟。', note: '步行时间：on foot（步行）' },
      { en: 'How can I get there?', zh: '我该怎么去那里？', note: '询问路线：How can I get there?' },
      { en: 'You can take Bus No. 5.', zh: '你可以坐 5 路公交车。', note: '乘坐公交：take Bus No. 5' },
      { en: 'Where is the bus stop?', zh: '公交站在哪里？', note: '寻找车站：bus stop' },
      { en: 'It is next to the bank.', zh: '在银行旁边。', note: '方位表达：next to（在...旁边）' },
      { en: 'Thank you very much!', zh: '非常感谢！', note: '表达感谢：Thank you very much' },
      { en: 'You are welcome. Have a nice trip!', zh: '不客气。祝您旅途愉快！', note: '回应感谢：You are welcome' }
    ],
    tips: ['问路先 Excuse me 礼貌开场', '方位词：turn left / turn right / go straight', 'next to 表示“在...旁边”']
  }
]

/* ---------- L3 场景相关慢速听力 ---------- */
export const L3_LISTENING = [
  {
    id: 'l3-listening-1',
    title: '问候场景慢速听力',
    emoji: '🎧',
    scripts: [
      {
        en: 'Good morning. How are you today?',
        zh: '早上好。你今天怎么样？',
        q: '说话者说的是什么时候的问候？',
        options: ['早上', '中午', '晚上', '深夜'],
        answer: 0
      },
      {
        en: 'My name is Lily. I am from China.',
        zh: '我叫莉莉。我来自中国。',
        q: '莉莉来自哪里？',
        options: ['美国', '英国', '中国', '日本'],
        answer: 2
      },
      {
        en: 'Nice to meet you. See you later!',
        zh: '很高兴认识你。回头见！',
        q: '这句话最可能出现在什么时候？',
        options: ['见面打招呼', '告别离开', '吃饭时', '睡觉时'],
        answer: 1
      }
    ]
  },
  {
    id: 'l3-listening-2',
    title: '点餐与购物慢速听力',
    emoji: '🎧',
    scripts: [
      {
        en: 'I would like a bowl of noodles and a glass of water.',
        zh: '我想要一碗面条和一杯水。',
        q: '顾客点了什么？',
        options: ['米饭和茶', '面条和水', '面包和牛奶', '蛋糕和咖啡'],
        answer: 1
      },
      {
        en: 'How much is this T-shirt? It is fifty yuan.',
        zh: '这件 T 恤多少钱？五十元。',
        q: 'T 恤多少钱？',
        options: ['十五元', '五十元', '五元', '五百元'],
        answer: 1
      },
      {
        en: 'Go straight and turn left at the corner.',
        zh: '直走，在拐角处左转。',
        q: '根据提示，应该怎么走？',
        options: ['直走然后左转', '直走然后右转', '后退再左转', '原地不动'],
        answer: 0
      }
    ]
  }
]

export function getDialogueById(id) {
  return DIALOGUES_L3.find((d) => d.id === id) || null
}

export default { DIALOGUES_L3, L3_LISTENING, getDialogueById }
