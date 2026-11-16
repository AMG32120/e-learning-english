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
  },
  {
    id: 'a7_07',
    title: 'The Power of Small Habits',
    emoji: '🌱',
    level: 7,
    grammarUnitId: 'l7_clause',
    text: [
      'Many people believe that big changes require big effort. They set difficult goals, work hard for a few days, and then give up when the excitement fades. Research on behaviour suggests a different approach: start with something so small that it feels almost too easy.',
      'A student who wants to read more might begin with just one page a day. A runner might start with a five-minute walk around the block. These actions seem tiny, but they do something important: they remove the fear of starting. Once a small habit becomes automatic, it grows naturally without pressure.',
      'The real power of small habits lies in time. Ten minutes of practice a day becomes sixty hours a year. Nobody can master a language or a skill in a week, but almost anyone can show up for ten minutes. Success, in the end, belongs not to the most talented people, but to those who simply refuse to stop.'
    ],
    questions: [
      {
        q: 'What is the main idea of the passage?',
        options: ['Big goals are useless', 'Small daily habits lead to lasting change', 'Excitement guarantees success', 'Reading is better than running'],
        answer: 1,
        explain: '全文围绕“从小习惯开始并坚持”展开，首段点题、末段总结时间累积的力量。'
      },
      {
        q: 'Why do people often give up on big goals?',
        options: ['The goals are too expensive', 'The initial excitement fades', 'They lack talent', 'Nobody supports them'],
        answer: 1,
        explain: '第一段：work hard for a few days, and then give up when the excitement fades。'
      },
      {
        q: 'The word "automatic" in paragraph 2 is closest in meaning to ______.',
        options: ['difficult to do', 'done without thinking', 'unusual', 'tiring'],
        answer: 1,
        explain: 'automatic 意为“自动的”，指习惯形成后无需刻意坚持。'
      },
      {
        q: 'How many hours of practice does ten minutes a day add up to in a year?',
        options: ['About thirty hours', 'About sixty hours', 'About a hundred hours', 'About three hundred hours'],
        answer: 1,
        explain: '10 分钟 × 365 天 ≈ 60.8 小时，第二段明确写了 sixty hours a year。'
      },
      {
        q: 'According to the writer, who finally succeeds?',
        options: ['The most talented people', 'Those who never fail', 'Those who keep showing up', 'Those with more free time'],
        answer: 2,
        explain: '末段：Success belongs not to the most talented people, but to those who simply refuse to stop。'
      },
      {
        q: '仿写：请选出正确的虚拟语气 —— “如果昨天有足够的时间，我就开始练习了。”',
        options: ['If I had had enough time yesterday, I would have started practising.', 'If I have enough time yesterday, I will start practising.', 'If I had enough time yesterday, I would start practising.', 'If I had had enough time yesterday, I will start practising.'],
        answer: 0,
        explain: '与过去事实相反的虚拟语气：If + had done, would have done。'
      }
    ]
  },
  {
    id: 'a7_08',
    title: 'Learning a Second Language',
    emoji: '🗣️',
    level: 7,
    grammarUnitId: 'l7_clause',
    text: [
      'Adults often say that children learn languages faster. It is true that young learners pick up pronunciation easily, but adults have advantages that are often ignored. They can already read, they understand grammar in an abstract way, and they know how to study on their own.',
      'The biggest mistake adult learners make is waiting until they are "ready" before they speak. Language is a skill, not a pile of facts: it grows through use, not through silent preparation. Learners who speak from the first day, even with many mistakes, build fluency far faster than those who only listen and read.',
      'Mistakes deserve a better reputation, too. A wrong sentence is useful information — it shows exactly where a learner needs to improve. Teachers who correct gently, and learners who laugh at their own errors instead of hiding them, turn every conversation into free practice. In language learning, the courage to be imperfect is worth more than a perfect memory.'
    ],
    questions: [
      {
        q: 'What advantage do adult learners have?',
        options: ['They hear sounds better', 'They can study independently', 'They learn grammar faster than children', 'They have more free time'],
        answer: 1,
        explain: '第一段列出 adults 的优势：能阅读、理解抽象语法、know how to study on their own。'
      },
      {
        q: 'What is "the biggest mistake" adult learners make?',
        options: ['Studying grammar too hard', 'Waiting to be ready before speaking', 'Reading too slowly', 'Choosing easy courses'],
        answer: 1,
        explain: '第二段首句：waiting until they are "ready" before they speak。'
      },
      {
        q: 'The writer compares language to ______.',
        options: ['a pile of facts', 'a skill that grows through use', 'a memory test', 'a musical instrument'],
        answer: 1,
        explain: '第二段：Language is a skill, not a pile of facts: it grows through use。'
      },
      {
        q: 'Why are mistakes described as "useful information"?',
        options: ['They make classes fun', 'They show what needs improvement', 'They prove the learner is clever', 'They reduce the cost of study'],
        answer: 1,
        explain: '第三段：it shows exactly where a learner needs to improve。'
      },
      {
        q: 'Which attitude does the writer recommend?',
        options: ['Avoid speaking until perfect', 'Copy native speakers exactly', 'Accept imperfection bravely', 'Memorise everything first'],
        answer: 2,
        explain: '末段：the courage to be imperfect is worth more than a perfect memory。'
      },
      {
        q: '仿写：请选出正确的虚拟语气 —— “要是我们早些开口说，现在就更流利了。”',
        options: ['If we had spoken earlier, we would be more fluent now.', 'If we spoke earlier, we would be more fluent now.', 'If we had spoken earlier, we will be more fluent now.', 'If we speak earlier, we were more fluent now.'],
        answer: 0,
        explain: '错综时间虚拟句：过去条件（had spoken）+ 现在结果（would be）。'
      }
    ]
  },
  {
    id: 'a7_09',
    title: 'Why Cities Need Trees',
    emoji: '🌳',
    level: 7,
    grammarUnitId: 'l7_clause',
    text: [
      'Walk down a street with old trees on both sides, and the air feels several degrees cooler. This is not imagination. Leaves catch sunlight before it reaches the ground, and water released from the leaves cools the air around them. In a warming world, this natural air conditioning is becoming a matter of public health.',
      'Trees also work quietly beneath the surface. Their roots hold soil that would otherwise wash into drains after every storm, reducing the risk of flooding in crowded districts. A single mature tree can absorb thousands of litres of water in a heavy rain — work that no pipe network can perform so cheaply.',
      'The benefits are not only physical. Studies in several countries have found that people recover from stress faster when they can see green from a window, and patients in hospital rooms facing trees often need less medicine. Planting a tree today is one of the cheapest investments a city can make, and the return grows taller every year.'
    ],
    questions: [
      {
        q: 'What is the main purpose of the passage?',
        options: ['To describe how trees grow', 'To explain the benefits of urban trees', 'To compare cities and villages', 'To introduce garden design'],
        answer: 1,
        explain: '全文从降温、防涝、身心健康三方面说明城市树木的价值。'
      },
      {
        q: 'How do trees cool the street?',
        options: ['By blocking the wind', 'By catching sunlight and releasing water', 'By absorbing carbon dioxide only', 'By making the air humid at night'],
        answer: 1,
        explain: '第一段：Leaves catch sunlight before it reaches the ground, and water released from the leaves cools the air。'
      },
      {
        q: 'The phrase "a matter of public health" suggests that street trees ______.',
        options: ['cost too much money', 'affect citizens\' wellbeing', 'are hard to plant', 'belong to parks only'],
        answer: 1,
        explain: '在变暖的世界里，树荫降温已经关系公众健康。'
      },
      {
        q: 'What do tree roots do during storms?',
        options: ['They drink all the rain', 'They hold soil and reduce flood risk', 'They block the drains', 'They attract birds'],
        answer: 1,
        explain: '第二段：Their roots hold soil... reducing the risk of flooding。'
      },
      {
        q: 'What did hospital studies find?',
        options: ['Patients with a green view needed less medicine', 'Trees in hospitals spread disease', 'Patients refused to open windows', 'Nurses preferred rooms without trees'],
        answer: 0,
        explain: '第三段：patients in hospital rooms facing trees often need less medicine。'
      },
      {
        q: '仿写：请选出正确的定语从句 —— “长在街边的树让城市更凉爽。”',
        options: ['Trees which grow along streets make cities cooler.', 'Trees what grow along streets make cities cooler.', 'Trees grow along streets make cities cooler.', 'Trees which grow along streets makes cities cooler.'],
        answer: 0,
        explain: '定语从句用 which/that 引导且主语 Trees 是复数，动词用 make。'
      }
    ]
  },
  {
    id: 'a7_10',
    title: 'A Short History of Money',
    emoji: '💰',
    level: 7,
    grammarUnitId: 'l7_clause',
    text: [
      'Before money existed, people traded goods directly: a bag of rice for a sheep, a basket of fruit for a tool. Such bartering worked in small villages, but it had an obvious problem — you might not want what your neighbour has, and your neighbour might not want yours.',
      'Coins solved this by giving everything a common value. Early coins were made of metals that people already trusted, such as gold and silver. Later, paper money appeared, backed by a promise rather than by metal. Today, most money is simply numbers moving between computers, faster than any coin could travel.',
      'Yet the purpose of money has never changed: it is a tool for trading, saving and planning. Money becomes dangerous only when people forget that it is a tool and treat it as the goal itself. Every generation has to learn the same lesson — earn money honestly, spend it wisely, and remember what it was invented for.'
    ],
    questions: [
      {
        q: 'What was the main problem with bartering?',
        options: ['Goods were too heavy to carry', 'People might not want each other\'s goods', 'Prices changed every hour', 'There were not enough goods'],
        answer: 1,
        explain: '第一段末句：you might not want what your neighbour has, and vice versa。'
      },
      {
        q: 'What were early coins made of?',
        options: ['Paper and cloth', 'Trusted metals like gold and silver', 'Common stones', 'Wood'],
        answer: 1,
        explain: '第二段：Early coins were made of metals that people already trusted。'
      },
      {
        q: 'The word "backed" in paragraph 2 is closest in meaning to ______.',
        options: ['hidden', 'supported', 'printed', 'banned'],
        answer: 1,
        explain: 'paper money appeared, backed by a promise —— backed 意为“由…支撑/担保”。'
      },
      {
        q: 'How is most money moved today?',
        options: ['By gold coins', 'By paper notes', 'By numbers between computers', 'By barter again'],
        answer: 2,
        explain: '第二段末句：most money is simply numbers moving between computers。'
      },
      {
        q: 'According to the writer, when does money become dangerous?',
        options: ['When it is printed too fast', 'When people treat it as the goal itself', 'When banks close early', 'When coins disappear'],
        answer: 1,
        explain: '第三段：Money becomes dangerous only when people forget it is a tool and treat it as the goal。'
      },
      {
        q: '仿写：请选出正确的宾语从句 —— “他解释了货币是如何被发明的。”',
        options: ['He explained how money was invented.', 'He explained how was money invented.', 'He explained how money invented.', 'He explained what money was invented.'],
        answer: 0,
        explain: '宾语从句用陈述语序 how money was invented。'
      }
    ]
  },
  {
    id: 'a7_11',
    title: 'Working from Home',
    emoji: '🏠',
    level: 7,
    grammarUnitId: 'l7_clause',
    text: [
      'For millions of workers, the daily journey to an office has been replaced by a ten-second walk to a desk at home. Remote work saves commuting time, allows quieter concentration, and gives people the freedom to live where housing is affordable rather than where the office happens to be.',
      'However, working from home is not perfect for everyone. Some people find it hard to separate work from rest when both happen in the same room. Others miss the informal conversations in a corridor — the quick questions and small jokes that make teams feel like teams. Managers report that new employees, who have never met their colleagues in person, sometimes struggle to ask for help.',
      'The most successful arrangements are usually mixed ones. A few days at the office provide contact and cooperation, while the rest of the week at home protects deep, focused work. The future of work may not be "remote versus office" at all; it may be about designing each week so that the right activities happen in the right place.'
    ],
    questions: [
      {
        q: 'What is one advantage of remote work mentioned in the passage?',
        options: ['Higher salary', 'No commuting and quieter concentration', 'More meetings', 'Better food'],
        answer: 1,
        explain: '第一段：saves commuting time, allows quieter concentration。'
      },
      {
        q: 'Why do some people struggle when working from home?',
        options: ['Their homes are too small', 'Work and rest mix in one room', 'They dislike computers', 'The internet is slow'],
        answer: 1,
        explain: '第二段：hard to separate work from rest when both happen in the same room。'
      },
      {
        q: 'Which group is reported to have more difficulty asking for help?',
        options: ['Managers', 'Experienced staff', 'New employees who have never met colleagues in person', 'Freelancers'],
        answer: 2,
        explain: '第二段末句：new employees... sometimes struggle to ask for help。'
      },
      {
        q: 'The word "mixed" in paragraph 3 refers to ______.',
        options: ['a confused team', 'partly office and partly home work', 'difficult colleagues', 'part-time jobs'],
        answer: 1,
        explain: '后文解释：a few days at the office... the rest of the week at home。'
      },
      {
        q: 'What does the writer think about the future of work?',
        options: ['Everyone will work from home', 'Offices will disappear', 'Each week should place the right activity in the right place', 'Remote work is just a fashion'],
        answer: 2,
        explain: '末段：designing each week so that the right activities happen in the right place。'
      },
      {
        q: '仿写：请选出正确的定语从句 —— “这是他从来没用过的办公桌。”',
        options: ['This is the desk that he has never used.', 'This is the desk what he has never used.', 'This is the desk he has never used it.', 'This is the desk which he has never used it.'],
        answer: 0,
        explain: 'that/which 作从句宾语可省略，但不能再保留 it。'
      }
    ]
  },
  {
    id: 'a7_12',
    title: 'Food and Culture',
    emoji: '🍜',
    level: 7,
    grammarUnitId: 'l7_clause',
    text: [
      'Ask people what they miss most when they move abroad, and many will not mention their family first — they will mention food. Meals carry memory. The smell of a familiar dish can transport a person back to a childhood kitchen in a single second, faster than any photograph.',
      'Food is also a quiet form of history. Spices that once travelled thousands of kilometres along trade roads changed national cuisines forever: chillies arrived in China from the Americas, tea moved from Asia to Europe, and noodles took countless local forms along the way. What we eat today is the result of centuries of exchange.',
      'Sharing food remains one of the simplest ways to build trust between strangers. Inviting someone to a meal says, without words, that we are willing to spend time together. Perhaps this is why, in almost every culture, important agreements are sealed not in offices but around tables — with something delicious in front of everyone.'
    ],
    questions: [
      {
        q: 'What do many people miss most when moving abroad, according to the passage?',
        options: ['Their jobs', 'Their pets', 'Food from home', 'The local weather'],
        answer: 2,
        explain: '第一段：many will not mention family first — they will mention food。'
      },
      {
        q: 'Why can the smell of a familiar dish be powerful?',
        options: ['It reminds people of childhood quickly', 'It helps people sleep', 'It makes photos look real', 'It cures homesickness'],
        answer: 0,
        explain: '第一段：can transport a person back to a childhood kitchen in a single second。'
      },
      {
        q: 'Where did chillies originally come from?',
        options: ['China', 'Europe', 'The Americas', 'Africa'],
        answer: 2,
        explain: '第二段：chillies arrived in China from the Americas。'
      },
      {
        q: 'What does the passage say food is, besides memory?',
        options: ['A form of history', 'A kind of medicine', 'A sign of wealth', 'A simple habit'],
        answer: 0,
        explain: '第二段首句：Food is also a quiet form of history。'
      },
      {
        q: 'Why are important agreements often made around tables?',
        options: ['Tables are more comfortable', 'Sharing food builds trust between strangers', 'Offices are too noisy', 'Food makes meetings shorter'],
        answer: 1,
        explain: '第三段：Sharing food remains one of the simplest ways to build trust。'
      },
      {
        q: '仿写：请选出正确的被动语态 —— “这道菜是由祖母做的。”',
        options: ['The dish was made by my grandmother.', 'The dish was made from my grandmother.', 'The dish is made by my grandmother yesterday.', 'The dish made by my grandmother was.'],
        answer: 0,
        explain: '过去时被动：was made by + 施动者。'
      }
    ]
  },
  {
    id: 'a7_13',
    title: 'The Ocean in Danger',
    emoji: '🌊',
    level: 7,
    grammarUnitId: 'l7_clause',
    text: [
      'The ocean covers more than seventy per cent of our planet, yet we know the surface of the moon better than we know the deep sea. Millions of species live there, from the largest animal that has ever existed — the blue whale — to creatures too small to see without a microscope.',
      'Today the ocean is under pressure from many directions. Plastic waste floats in enormous patches; rising temperatures push fish towards colder waters; and overfishing removes species faster than they can reproduce. Coral reefs, which support about a quarter of all marine life, are turning white in warming seas, a sign that the ecosystem inside them is dying.',
      'The situation is serious but not hopeless. Marine protected areas have proven that fish populations can recover within a few years when fishing is limited. Reducing single-use plastic, choosing seafood from sustainable sources, and supporting such protected areas are ordinary actions that together add up. The ocean has survived for billions of years; what happens next depends on us.'
    ],
    questions: [
      {
        q: 'What comparison does the writer make in paragraph 1?',
        options: ['The ocean is larger than the moon', 'We know the moon better than the deep sea', 'The moon has more species', 'The ocean is easier to study'],
        answer: 1,
        explain: '第一段：we know the surface of the moon better than we know the deep sea。'
      },
      {
        q: 'Which is the largest animal that has ever existed?',
        options: ['The elephant', 'The blue whale', 'The giant squid', 'The coral reef'],
        answer: 1,
        explain: '第一段：the largest animal that has ever existed — the blue whale。'
      },
      {
        q: 'What do coral reefs turning white indicate?',
        options: ['They are growing fast', 'The ecosystem inside them is dying', 'They are attracting more fish', 'They are being cleaned'],
        answer: 1,
        explain: '第二段末句：a sign that the ecosystem inside them is dying。'
      },
      {
        q: 'The word "sustainable" in paragraph 3 is closest in meaning to ______.',
        options: ['expensive', 'able to continue without harm', 'freshly caught', 'deep-frozen'],
        answer: 1,
        explain: 'sustainable 意为“可持续的”，即不破坏资源。'
      },
      {
        q: 'What have marine protected areas proven?',
        options: ['Fishing bans are too costly', 'Fish populations can recover when fishing is limited', 'Corals recover faster than fish', 'Plastic disappears in protected areas'],
        answer: 1,
        explain: '第三段：fish populations can recover within a few years when fishing is limited。'
      },
      {
        q: '仿写：请选出正确的状语从句 —— “只要我们采取行动，海洋就能恢复。”',
        options: ['As long as we act, the ocean can recover.', 'As long we act, the ocean can recover.', 'As long as we will act, the ocean can recover.', 'As long as we act, the ocean could recover yesterday.'],
        answer: 0,
        explain: 'as long as 引导条件从句，主句用 can 表示一般可能。'
      }
    ]
  },
  {
    id: 'a7_14',
    title: 'Sleep and Screens',
    emoji: '😴',
    level: 7,
    grammarUnitId: 'l7_clause',
    text: [
      'Sleep experts recommend that teenagers get eight to ten hours of sleep a night, yet surveys in many countries show that most fall short of this goal. One obvious suspect is the smartphone glowing beside the pillow, but the picture is more complex than it first appears.',
      'Screens affect sleep in two main ways. First, they steal time: every hour spent watching videos after midnight is an hour not spent sleeping. Second, the bright light of a screen delays the release of melatonin, the hormone that tells the body it is time to rest. Scrolling through short, exciting clips keeps the brain alert exactly when it should be winding down.',
      'The solution does not have to be extreme. Researchers suggest keeping screens out of the bedroom, stopping stimulating content an hour before bed, and replacing late scrolling with reading or gentle music. Students who made only these small changes reported falling asleep faster — proof that better sleep often begins with better habits, not stronger willpower.'
    ],
    questions: [
      {
        q: 'How much sleep do experts recommend for teenagers?',
        options: ['Six to eight hours', 'Eight to ten hours', 'Ten to twelve hours', 'Seven hours'],
        answer: 1,
        explain: '第一段首句：eight to ten hours of sleep a night。'
      },
      {
        q: 'The writer says the picture is "more complex" because ______.',
        options: ['phones are not the only cause', 'students dislike sleeping', 'experts disagree completely', 'melatonin is unknown'],
        answer: 0,
        explain: '第二段列出屏幕影响睡眠的两条路径，说明不只是"手机在枕边"这么简单。'
      },
      {
        q: 'What does melatonin do?',
        options: ['It wakes the body up', 'It tells the body it is time to rest', 'It makes people hungry', 'It improves eyesight'],
        answer: 1,
        explain: '第二段：the hormone that tells the body it is time to rest。'
      },
      {
        q: 'The phrase "winding down" in paragraph 2 is closest in meaning to ______.',
        options: ['becoming excited', 'relaxing toward sleep', 'climbing upstairs', 'turning off lights'],
        answer: 1,
        explain: 'wind down 意为“逐渐放松/平静下来”。'
      },
      {
        q: 'What did students report after making small changes?',
        options: ['They fell asleep faster', 'They needed less food', 'Their grades dropped', 'They used phones more'],
        answer: 0,
        explain: '第三段：Students who made only these small changes reported falling asleep faster。'
      },
      {
        q: '仿写：请选出正确的建议句型 —— “专家建议睡前一小时停止使用手机。”',
        options: ['Experts suggest stopping phone use an hour before bed.', 'Experts suggest to stop phone use an hour before bed.', 'Experts suggest that stopping phone use an hour before bed.', 'Experts suggest stop phone use an hour before bed.'],
        answer: 0,
        explain: 'suggest 后接动名词（suggest doing），不接不定式。'
      }
    ]
  },
  {
    id: 'a7_15',
    title: 'The Joy of Volunteering',
    emoji: '🤝',
    level: 7,
    grammarUnitId: 'l7_clause',
    text: [
      'Every summer, thousands of students give up part of their holiday to work without pay — cleaning beaches, teaching children, or visiting elderly people who live alone. Asked why, few of them mention their résumés. Most say the same thing in different words: it simply feels meaningful.',
      'Science offers some support for that feeling. Studies have found that people who regularly help others report lower stress and a stronger sense of purpose. Helping also builds skills that classrooms rarely teach: how to talk to a stranger, how to organise a team in a hurry, how to stay patient when plans fall apart.',
      'Volunteering does not require heroism. An hour a week at a local library, or a monthly visit to a nursing home, already matters to the people who receive it. What matters even more, perhaps, is what changes in the volunteer: someone who has served food to those who need it looks at ordinary life — and ordinary work — with new gratitude.'
    ],
    questions: [
      {
        q: 'Why do most student volunteers say they do it?',
        options: ['To improve their résumés', 'Because it feels meaningful', 'To earn pocket money', 'Because schools force them'],
        answer: 1,
        explain: '第一段末句：Most say the same thing... it simply feels meaningful。'
      },
      {
        q: 'What have studies found about people who help others regularly?',
        options: ['They earn more money', 'They report lower stress and stronger purpose', 'They sleep less', 'They travel more'],
        answer: 1,
        explain: '第二段：report lower stress and a stronger sense of purpose。'
      },
      {
        q: 'Which skill does the passage say classrooms rarely teach?',
        options: ['Doing maths quickly', 'Talking to strangers and organising teams', 'Reading old books', 'Using computers'],
        answer: 1,
        explain: '第二段：builds skills that classrooms rarely teach。'
      },
      {
        q: 'The word "heroism" in paragraph 3 is closest in meaning to ______.',
        options: ['great brave action', 'long study', 'hard exercise', 'deep sleep'],
        answer: 0,
        explain: 'heroism 意为“英雄行为”，此处指志愿活动不需要惊天动地。'
      },
      {
        q: 'What changes most in a volunteer, according to the writer?',
        options: ['Their bank account', 'Their view of ordinary life', 'Their timetable', 'Their circle of friends'],
        answer: 1,
        explain: '末段：looks at ordinary life — and ordinary work — with new gratitude。'
      },
      {
        q: '仿写：请选出正确的动名词用法 —— “他每周花一小时在图书馆做志愿者。”',
        options: ['He spends an hour a week volunteering at the library.', 'He spends an hour a week to volunteer at the library.', 'He takes an hour a week volunteering at the library.', 'He spends an hour a week volunteer at the library.'],
        answer: 0,
        explain: 'spend + 时间 + doing sth 为固定搭配。'
      }
    ]
  },
  {
    id: 'a7_16',
    title: 'Travel Teaches What Books Cannot',
    emoji: '✈️',
    level: 7,
    grammarUnitId: 'l7_clause',
    text: [
      'We can read a hundred pages about desert life, but standing in a desert at noon teaches something no page can: the dry heat pressing on the skin, the endless silence, the shock of seeing life survive in sand. Travel turns abstract knowledge into physical memory.',
      'Travel also corrects prejudice more effectively than any lecture. Meeting people from a place we had only imagined often reveals that our picture was wrong — the "dangerous" city turns out friendly, the "boring" town hides a proud history. When we eat local food, learn a few words of the language and get lost in unfamiliar streets, respect grows naturally where stereotypes once stood.',
      'This does not mean distant travel is the only teacher. Curiosity can turn a nearby village into a foreign land if we look carefully enough: ask the baker how the recipe arrived here, trace where the river really flows, count how many languages you hear in one market hour. The real journey, as the saying goes, is not measured in kilometres but in the questions we learn to ask.'
    ],
    questions: [
      {
        q: 'What does standing in a desert give a person that reading cannot?',
        options: ['A cheaper holiday', 'Physical memory of abstract knowledge', 'Better photographs', 'Faster reading speed'],
        answer: 1,
        explain: '第一段末句：Travel turns abstract knowledge into physical memory。'
      },
      {
        q: 'According to the passage, what corrects prejudice most effectively?',
        options: ['Reading lectures', 'Meeting real people from the place', 'Watching news reports', 'Avoiding strangers'],
        answer: 1,
        explain: '第二段首句：Travel also corrects prejudice more effectively than any lecture。'
      },
      {
        q: 'The word "stereotypes" in paragraph 2 is closest in meaning to ______.',
        options: ['simple fixed ideas about a group', 'local dishes', 'travel maps', 'dangerous animals'],
        answer: 0,
        explain: 'stereotype 意为“刻板印象”。'
      },
      {
        q: 'What example of local curiosity is given for a nearby village?',
        options: ['Asking the baker about the recipe\'s origin', 'Buying more bread', 'Learning to bake', 'Opening a shop'],
        answer: 0,
        explain: '第三段：ask the baker how the recipe arrived here。'
      },
      {
        q: 'How does the writer say the real journey is measured?',
        options: ['In kilometres', 'In the questions we learn to ask', 'In photos taken', 'In money spent'],
        answer: 1,
        explain: '末段：not measured in kilometres but in the questions we learn to ask。'
      },
      {
        q: '仿写：请选出正确的比较结构 —— “读一百页不如亲眼见一次。”',
        options: ['Reading a hundred pages is not as good as seeing it once yourself.', 'Reading a hundred pages is not so good than seeing it once yourself.', 'Reading a hundred pages are not as good as seeing it once yourself.', 'Read a hundred pages is not as good as seeing it once yourself.'],
        answer: 0,
        explain: 'not as...as 比较结构；动名词短语作主语谓语用单数 is。'
      }
    ]
  }
]

export function getArticleById(id) {
  return ARTICLES_L7.find((a) => a.id === id) || null
}
