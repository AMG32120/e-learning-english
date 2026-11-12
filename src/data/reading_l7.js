/**
 * L7 高级阅读写作：阅读文章数据包
 * 6 篇原创短文（B1 难度，每篇 3 段），每篇 6 道阅读/词汇/仿写题。
 * 结构与 L6 听力材料对齐，供 StageView reading 模式使用。
 */

export const ARTICLES_L7 = [
  {
    id: 'a7_01',
    title: 'My Hometown',
    emoji: '🏘️',
    level: 7,
    grammarUnitId: 'l7_clause',
    text: [
      'My hometown is a small town near a quiet river. About ten thousand people live there. It is not a big city, but it has everything we need: a market, a school, a hospital, and a beautiful park.',
      'Every morning, the market opens early. People buy fresh vegetables, fruits, and bread. The school stands at the foot of a hill, where children learn and play. On weekends, my family often walks along the river and enjoys the peaceful view.',
      'I love my hometown because the people are friendly and the air is clean. Although I may live in a big city one day, this small town will always be my favorite place.'
    ],
    questions: [
      {
        q: 'What is the main idea of this passage?',
        options: ['A big city with many people', 'The writer’s hometown and why he loves it', 'How to build a new school', 'A river in the north'],
        answer: 1,
        explain: '全文围绕家乡小镇展开，最后一句点明“this small town will always be my favorite place”，即主旨是介绍家乡并表达喜爱。'
      },
      {
        q: 'Where is the writer’s hometown?',
        options: ['Near a quiet river', 'At the foot of a mountain', 'Beside the sea', 'In a big city'],
        answer: 0,
        explain: '第一段首句：My hometown is a small town near a quiet river.'
      },
      {
        q: 'The word "peaceful" in the passage most probably means ______.',
        options: ['noisy', 'quiet and calm', 'crowded', 'busy'],
        answer: 1,
        explain: '上下文“walk along the river and enjoy the peaceful view”提示 peaceful 意为“宁静的”。'
      },
      {
        q: 'What does the school look like in the writer’s hometown?',
        options: ['It is beside the market', 'It stands at the foot of a hill', 'It is very large', 'It is near the hospital'],
        answer: 1,
        explain: '第二段：The school stands at the foot of a hill. 位于山脚下。'
      },
      {
        q: 'Which sentence shows the writer may move away in the future?',
        options: ['I love my hometown.', 'The air is clean.', 'I may live in a big city one day.', 'The market opens early.'],
        answer: 2,
        explain: '最后一段：Although I may live in a big city one day... 表明未来可能搬离。'
      },
      {
        q: '仿写：请选出与原文句式最接近的正确表达 —— “这条河穿过小镇。”',
        options: ['The river run through the town.', 'The river runs through the town.', 'The river running through the town.', 'The town runs through the river.'],
        answer: 1,
        explain: '第三人称单数一般现在时：The river runs through the town. 主语 the river 为单数，动词加 -s。'
      }
    ]
  },
  {
    id: 'a7_02',
    title: 'A Day in the Life',
    emoji: '⏰',
    level: 7,
    grammarUnitId: 'l7_adverbial',
    text: [
      'Tom is a middle school student. He gets up at six thirty every morning, takes a quick shower, and has breakfast with his family. When the clock strikes seven, he rides his bike to school.',
      'At school, Tom studies English, math, and science. His favorite class is English because he enjoys reading stories. After class, he plays basketball with his friends if the weather is fine. He usually gets home at five o’clock.',
      'In the evening, Tom does his homework first. Then he reads for half an hour before he goes to bed. He always goes to bed at ten, so he can be energetic the next day.'
    ],
    questions: [
      {
        q: 'What is the passage mainly about?',
        options: ['Tom’s favorite food', 'One day in Tom’s life', 'Tom’s basketball team', 'How to ride a bike'],
        answer: 1,
        explain: '文章按时间顺序描述 Tom 从早到晚的一天，主旨即“a day in the life”。'
      },
      {
        q: 'When does Tom get up?',
        options: ['At six o’clock', 'At six thirty', 'At seven o’clock', 'At five o’clock'],
        answer: 1,
        explain: '第一段：He gets up at six thirty every morning.'
      },
      {
        q: 'Why does Tom like English best?',
        options: ['Because his teacher is kind', 'Because he enjoys reading stories', 'Because the homework is easy', 'Because his friends are in the class'],
        answer: 1,
        explain: '第二段：His favorite class is English because he enjoys reading stories.'
      },
      {
        q: 'Tom plays basketball after class ______ the weather is fine.',
        options: ['if', 'although', 'so that', 'unless'],
        answer: 0,
        explain: '原文：He plays basketball with his friends if the weather is fine. if 引导条件状语从句。'
      },
      {
        q: 'What does Tom do before he goes to bed?',
        options: ['He watches TV', 'He plays games', 'He reads for half an hour', 'He takes a shower'],
        answer: 2,
        explain: '第三段：Then he reads for half an hour before he goes to bed.'
      },
      {
        q: '仿写：请选出正确的表达 —— “如果明天不下雨，我们就去公园。”',
        options: ['If it doesn’t rain tomorrow, we will go to the park.', 'If it won’t rain tomorrow, we will go to the park.', 'If it rains tomorrow, we go to the park.', 'If it doesn’t rain tomorrow, we went to the park.'],
        answer: 0,
        explain: '条件状语从句用一般现在时表将来：If it doesn’t rain tomorrow, we will go to the park.'
      }
    ]
  },
  {
    id: 'a7_03',
    title: 'Health and Exercise',
    emoji: '💪',
    level: 7,
    grammarUnitId: 'l7_passive',
    text: [
      'Health is important for everyone. Doctors say that adults need about one hour of exercise every day. Exercise such as walking, running, and swimming can make our hearts strong and help us sleep well.',
      'A healthy diet is also necessary. We should eat more vegetables and fruit, and drink enough water. Too much sugar and fast food can cause serious problems, which many young people do not realize.',
      'Small changes can make a big difference. If you take the stairs instead of the elevator and walk to the nearby shops, your body will thank you later.'
    ],
    questions: [
      {
        q: 'What is the main idea of the passage?',
        options: ['How to lose weight quickly', 'The importance of health and how to keep it', 'Why fast food is delicious', 'The history of exercise'],
        answer: 1,
        explain: '全文围绕健康的重要性及保持健康的方法（运动、饮食、小改变）。'
      },
      {
        q: 'How much exercise do adults need every day according to doctors?',
        options: ['Thirty minutes', 'Half an hour', 'About one hour', 'Two hours'],
        answer: 2,
        explain: '第一段：adults need about one hour of exercise every day.'
      },
      {
        q: 'Which of the following can make our hearts strong?',
        options: ['Eating too much sugar', 'Watching TV all day', 'Walking and running', 'Taking the elevator'],
        answer: 2,
        explain: '第一段：Exercise such as walking, running, and swimming can make our hearts strong.'
      },
      {
        q: 'The word "necessary" in the passage means ______.',
        options: ['difficult', 'needed', 'expensive', 'common'],
        answer: 1,
        explain: 'necessary 意为“必需的、必要的”，与 needed 同义。'
      },
      {
        q: 'What advice does the writer give at the end?',
        options: ['Eat more fast food', 'Make small changes in daily life', 'Stay at home', 'Avoid all exercise'],
        answer: 1,
        explain: '第三段：Small changes can make a big difference. 并举例爬楼梯、步行购物。'
      },
      {
        q: '仿写：请选出正确的被动语态表达 —— “每天喝足够的水。”',
        options: ['Enough water should be drunk every day.', 'Enough water should drink every day.', 'We should drunk enough water.', 'Enough water is drinking every day.'],
        answer: 0,
        explain: '被动语态：should + be + 过去分词，即 Enough water should be drunk every day.'
      }
    ]
  },
  {
    id: 'a7_04',
    title: 'Technology in Daily Life',
    emoji: '📱',
    level: 7,
    grammarUnitId: 'l7_clause',
    text: [
      'Technology has changed the way we live. Twenty years ago, people sent letters by post; today, we send messages in seconds. We can also study online, shop online, and work from home because of the Internet.',
      'However, technology brings problems too. Many people spend too much time on their phones, which is bad for their eyes and sleep. Some children play games for hours instead of playing outside, which worries their parents.',
      'The key is balance. We should use technology to make life easier, but we must not let it control us. Remember to turn off your phone and enjoy the real world around you.'
    ],
    questions: [
      {
        q: 'What is the best title for this passage?',
        options: ['The History of the Internet', 'Technology: Good or Bad?', 'How to Play Games', 'Letters and Posts'],
        answer: 1,
        explain: '文章先讲科技的便利，再讲其问题，最后强调平衡，标题“Technology: Good or Bad?” 最贴切。'
      },
      {
        q: 'How did people send messages twenty years ago?',
        options: ['By email', 'By phone', 'By post letters', 'By online chat'],
        answer: 2,
        explain: '第一段：Twenty years ago, people sent letters by post.'
      },
      {
        q: 'What problem does technology bring according to the passage?',
        options: ['People have more free time', 'People spend too much time on phones', 'Letters are expensive', 'Working from home is difficult'],
        answer: 1,
        explain: '第二段：Many people spend too much time on their phones, which is bad for their eyes and sleep.'
      },
      {
        q: 'The writer’s final advice is to ______.',
        options: ['stop using technology completely', 'keep a balance between technology and real life', 'play more games', 'buy a new phone'],
        answer: 1,
        explain: '第三段：The key is balance. 建议保持平衡。'
      },
      {
        q: 'In "which worries their parents", "which" refers to ______.',
        options: ['children', 'phones', 'playing games for hours', 'parents'],
        answer: 2,
        explain: 'which 引导非限制性定语从句，指代前文“Some children play games for hours instead of playing outside”这件事。'
      },
      {
        q: '仿写：请选出正确的定语从句 —— “这是我昨天买的手机。”',
        options: ['This is the phone which I bought yesterday.', 'This is the phone what I bought yesterday.', 'This is the phone I bought it yesterday.', 'This is the phone who I bought yesterday.'],
        answer: 0,
        explain: '关系代词 which/that 引导定语从句修饰物：the phone which I bought yesterday.'
      }
    ]
  },
  {
    id: 'a7_05',
    title: 'A Story from the Past',
    emoji: '🏺',
    level: 7,
    grammarUnitId: 'l7_passive',
    text: [
      'A beautiful old castle was built on the hill in the sixteenth century. For hundreds of years, it was used as a home for a rich family. Many important meetings were held there, and travelers were welcomed warmly.',
      'In the nineteenth century, the castle was damaged by a great fire. The family left, and the building was forgotten for a long time. Grass and trees grew around it, and only birds visited the empty halls.',
      'Recently, the castle was restored by the government. Now it is open to the public. Thousands of visitors come every year to learn about its history and enjoy the wonderful view from the top of the tower.'
    ],
    questions: [
      {
        q: 'When was the castle built?',
        options: ['In the sixteenth century', 'In the nineteenth century', 'In the twentieth century', 'In the eighteenth century'],
        answer: 0,
        explain: '第一段首句：A beautiful old castle was built on the hill in the sixteenth century.'
      },
      {
        q: 'What happened to the castle in the nineteenth century?',
        options: ['It was sold', 'It was damaged by a fire', 'It became a museum', 'It was pulled down'],
        answer: 1,
        explain: '第二段：the castle was damaged by a great fire.'
      },
      {
        q: 'The passage mainly tells us ______.',
        options: ['how to build a castle', 'the history of an old castle', 'how birds live in castles', 'the life of a rich family today'],
        answer: 1,
        explain: '文章按时间顺序讲述城堡的建造、受损与修复，即城堡的历史。'
      },
      {
        q: 'The word "restored" in the passage most probably means ______.',
        options: ['repaired and made good again', 'sold to someone', 'painted in red', 'destroyed completely'],
        answer: 0,
        explain: 'restore 意为“修复、恢复”，上下文“was restored by the government. Now it is open to the public” 即修复后开放。'
      },
      {
        q: 'Who restored the castle recently?',
        options: ['A rich family', 'The birds', 'The government', 'Travelers'],
        answer: 2,
        explain: '第三段：the castle was restored by the government.'
      },
      {
        q: '仿写：请选出正确的被动语态 —— “这所学校建于 1998 年。”',
        options: ['The school built in 1998.', 'The school was built in 1998.', 'The school was build in 1998.', 'The school is build in 1998.'],
        answer: 1,
        explain: '一般过去时被动语态：was/were + 过去分词，built 是 build 的过去分词。'
      }
    ]
  },
  {
    id: 'a7_06',
    title: 'Protecting Our Environment',
    emoji: '🌿',
    level: 7,
    grammarUnitId: 'l7_subjunctive',
    text: [
      'Our planet is in danger. Forests are disappearing, rivers are polluted, and many animals are losing their homes. If we do not act now, the situation will become worse for our children.',
      'There are simple things each of us can do. We can reduce waste by using fewer plastic bags, save energy by turning off lights, and plant trees in our communities. When everyone makes a small effort, the result can be huge.',
      'Some people say one person cannot change the world, but I disagree. If every student planted one tree this year, millions of trees would grow in a few years. Our choices today shape the world of tomorrow.'
    ],
    questions: [
      {
        q: 'What is the main purpose of this passage?',
        options: ['To ask people to protect the environment', 'To introduce a new forest', 'To sell plastic bags', 'To describe a river'],
        answer: 0,
        explain: '文章说明环境危机并给出建议，目的是呼吁保护环境。'
      },
      {
        q: 'Which of the following is NOT mentioned as a way to protect the environment?',
        options: ['Using fewer plastic bags', 'Turning off lights', 'Planting trees', 'Driving cars more'],
        answer: 3,
        explain: '第二段提到减少塑料袋、关灯、植树，未提到多开车。'
      },
      {
        q: 'The sentence "If every student planted one tree this year, millions of trees would grow" shows ______.',
        options: ['a real fact', 'an imaginary situation', 'a past event', 'a question'],
        answer: 1,
        explain: '该句为虚拟语气（if + 过去时 + would），表示假设情形。'
      },
      {
        q: 'What does the writer think of "one person cannot change the world"?',
        options: ['He agrees', 'He disagrees', 'He is not sure', 'He never thinks about it'],
        answer: 1,
        explain: '第三段：but I disagree. 作者持反对意见。'
      },
      {
        q: 'The word "reduce" in the passage means ______.',
        options: ['to make something less', 'to make something more', 'to throw away', 'to buy'],
        answer: 0,
        explain: 'reduce 意为“减少”。'
      },
      {
        q: '仿写：请选出正确的虚拟语气 —— “如果我是你，我就会多锻炼。”',
        options: ['If I am you, I will exercise more.', 'If I were you, I would exercise more.', 'If I was you, I would exercise more.', 'If I were you, I will exercise more.'],
        answer: 1,
        explain: '与现在事实相反的虚拟语气：If I were you, I would exercise more. 用 were 与 would。'
      }
    ]
  }
]

export function getArticleById(id) {
  return ARTICLES_L7.find((a) => a.id === id) || null
}
