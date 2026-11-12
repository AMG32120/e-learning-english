/* ============================================================
   src/data/grammar.js —— L4 初级语法单元数据
   结构：{ id, title, emoji, intro, rules: [{title, body}], questions: [{prompt, options, answer, explain}] }
   ============================================================ */

export const GRAMMAR_UNITS_L4 = [
  {
    id: 'be_verbs',
    title: 'be 动词',
    emoji: '🧑‍🏫',
    intro: 'be 动词是英语最基础的动词，有 am / is / are 三种形式，随主语人称变化。',
    rules: [
      { title: '基本搭配', body: 'I 用 am；he / she / it 用 is；you / we / they 用 are。' },
      { title: '句型', body: '肯定：I am a teacher. 否定：She is not here. 疑问：Are you ready?' }
    ],
    questions: [
      { prompt: 'I ___ a student.', options: ['am', 'is', 'are'], answer: 0, explain: '主语 I 后必须用 am。' },
      { prompt: 'She ___ my sister.', options: ['am', 'is', 'are'], answer: 1, explain: '主语 She 是第三人称单数，用 is。' },
      { prompt: 'They ___ from China.', options: ['am', 'is', 'are'], answer: 2, explain: '主语 They 是复数，用 are。' },
      { prompt: '___ you a teacher?', options: ['Am', 'Is', 'Are'], answer: 2, explain: '疑问句中 you 用 Are。' },
      { prompt: 'My parents ___ at home.', options: ['am', 'is', 'are'], answer: 2, explain: 'My parents 是复数，用 are。' },
      { prompt: 'He ___ not here today.', options: ['am', 'is', 'are'], answer: 1, explain: '主语 He 是单数，否定用 is not。' },
      { prompt: 'We ___ good friends.', options: ['am', 'is', 'are'], answer: 2, explain: '主语 We 是复数，用 are。' },
      { prompt: 'The cat ___ on the sofa.', options: ['am', 'is', 'are'], answer: 1, explain: 'The cat 是单数，用 is。' }
    ]
  },
  {
    id: 'present_simple',
    title: '一般现在时',
    emoji: '🕐',
    intro: '一般现在时表示经常发生的动作或客观事实，主语是第三人称单数时动词加 -s / -es。',
    rules: [
      { title: '第三人称单数', body: 'he / she / it 后动词加 -s（如 play → plays）；以 s/x/ch/sh/o 结尾加 -es（如 go → goes）。' },
      { title: '否定与疑问', body: '借助助动词 do / does：I do not like it. Does he like it?' }
    ],
    questions: [
      { prompt: 'He ___ to school every day.', options: ['go', 'goes', 'going'], answer: 1, explain: '主语 He 是第三人称单数，go → goes。' },
      { prompt: 'They ___ football on Sundays.', options: ['play', 'plays', 'playing'], answer: 0, explain: 'They 是复数，动词用原形 play。' },
      { prompt: 'She ___ English very well.', options: ['speak', 'speaks', 'speaking'], answer: 1, explain: '主语 She 单数，speak → speaks。' },
      { prompt: 'My father ___ TV after dinner.', options: ['watch', 'watches', 'watching'], answer: 1, explain: '主语 My father 单数，watch 以 ch 结尾加 -es。' },
      { prompt: 'I ___ like coffee.', options: ['do not', 'does not', 'not'], answer: 0, explain: '主语 I 用助动词 do not。' },
      { prompt: '___ he play basketball?', options: ['Do', 'Does', 'Is'], answer: 1, explain: '主语 he 用 Does 提问。' },
      { prompt: 'The sun ___ in the east.', options: ['rise', 'rises', 'rising'], answer: 1, explain: '客观事实用一般现在时，The sun 单数，rise → rises。' },
      { prompt: 'We ___ breakfast at seven.', options: ['have', 'has', 'having'], answer: 0, explain: 'We 是复数，动词用原形 have。' }
    ]
  },
  {
    id: 'plural_nouns',
    title: '名词复数',
    emoji: '🔢',
    intro: '英语名词有单数和复数形式，复数一般加 -s，特殊结尾有不同变化。',
    rules: [
      { title: '规则变化', body: '一般加 -s：book → books；以 s/x/ch/sh 结尾加 -es：box → boxes；辅音字母 + y 变 y 为 i 加 -es：baby → babies。' },
      { title: '不规则变化', body: 'man → men；child → children；foot → feet；tooth → teeth；mouse → mice。' }
    ],
    questions: [
      { prompt: 'one book, two ___', options: ['books', 'bookes', 'book'], answer: 0, explain: '一般名词直接加 -s。' },
      { prompt: 'one box, three ___', options: ['boxs', 'boxes', 'box'], answer: 1, explain: '以 x 结尾加 -es。' },
      { prompt: 'one baby, two ___', options: ['babys', 'babies', 'babyes'], answer: 1, explain: '辅音字母 + y 变 y 为 i 加 -es。' },
      { prompt: 'one man, two ___', options: ['mans', 'men', 'manes'], answer: 1, explain: 'man 是不规则变化 → men。' },
      { prompt: 'one child, three ___', options: ['childs', 'children', 'childes'], answer: 1, explain: 'child 的不规则复数 → children。' },
      { prompt: 'one foot, two ___', options: ['foots', 'feet', 'feets'], answer: 1, explain: 'foot → feet 是不规则变化。' },
      { prompt: 'There are many ___ in the zoo.', options: ['monkey', 'monkeys', 'monkeies'], answer: 1, explain: '元音字母 + y 直接加 -s → monkeys。' },
      { prompt: 'We have three ___ in our family.', options: ['dog', 'dogs', 'doges'], answer: 1, explain: '一般名词直接加 -s → dogs。' }
    ]
  },
  {
    id: 'pronouns',
    title: '代词',
    emoji: '👤',
    intro: '代词用来代替名词，分为主格（I / he / she）、宾格（me / him / her）和物主代词（my / his / her）。',
    rules: [
      { title: '主格与宾格', body: '主格作主语：I like it. 宾格作宾语：He helps me.' },
      { title: '物主代词', body: 'my（我的）、your（你的）、his（他的）、her（她的）、our（我们的）、their（他们的）。' }
    ],
    questions: [
      { prompt: '___ am a student.', options: ['I', 'Me', 'My'], answer: 0, explain: '作主语用主格 I。' },
      { prompt: 'Please help ___.', options: ['I', 'me', 'my'], answer: 1, explain: '作宾语用宾格 me。' },
      { prompt: 'This is ___ book.', options: ['I', 'me', 'my'], answer: 2, explain: '修饰名词 book 用物主代词 my。' },
      { prompt: '___ is my teacher.', options: ['She', 'Her', 'Hers'], answer: 0, explain: '作主语用主格 She。' },
      { prompt: 'I love ___ parents.', options: ['I', 'me', 'my'], answer: 2, explain: '修饰 parents 用 my。' },
      { prompt: 'Give it to ___.', options: ['they', 'them', 'their'], answer: 1, explain: '介词 to 后用宾格 them。' },
      { prompt: '___ dog is very cute.', options: ['You', 'Your', 'Yours'], answer: 1, explain: '修饰 dog 用物主代词 Your。' },
      { prompt: 'We are ___ classmates.', options: ['you', 'your', 'yours'], answer: 1, explain: '修饰 classmates 用 your。' }
    ]
  },
  {
    id: 'there_be',
    title: 'there be 句型',
    emoji: '📍',
    intro: 'there be 句型表示“某地有某物”，be 的形式由后面名词的单复数决定。',
    rules: [
      { title: '用法', body: '单数名词用 there is；复数名词用 there are。' },
      { title: '否定与疑问', body: '否定：There is not ...；疑问：Is there ...? / Are there ...?' }
    ],
    questions: [
      { prompt: 'There ___ a book on the desk.', options: ['is', 'are', 'am'], answer: 0, explain: 'a book 是单数，用 there is。' },
      { prompt: 'There ___ many apples in the basket.', options: ['is', 'are', 'am'], answer: 1, explain: 'many apples 是复数，用 there are。' },
      { prompt: 'There ___ two cats under the chair.', options: ['is', 'are', 'am'], answer: 1, explain: 'two cats 是复数，用 there are。' },
      { prompt: '___ there a hospital near here?', options: ['Is', 'Are', 'Am'], answer: 0, explain: 'a hospital 是单数，疑问用 Is there。' },
      { prompt: 'There ___ not any milk in the fridge.', options: ['is', 'are', 'am'], answer: 0, explain: 'milk 是不可数名词，用 there is。' },
      { prompt: 'There ___ some students in the classroom.', options: ['is', 'are', 'am'], answer: 1, explain: 'some students 是复数，用 there are。' },
      { prompt: 'There ___ a pen and two pencils on the table.', options: ['is', 'are', 'am'], answer: 0, explain: '就近原则：最近的名词 a pen 是单数，用 is。' },
      { prompt: 'There ___ a park near my home.', options: ['is', 'are', 'am'], answer: 0, explain: 'a park 是单数，用 there is。' }
    ]
  },
  {
    id: 'simple_sentences',
    title: '简单句型',
    emoji: '📝',
    intro: '简单句的基本结构：主语 + 谓语（+ 宾语 / 表语），还有 there be、祈使句等常见句型。',
    rules: [
      { title: '基本结构', body: '主 + 谓：I run. 主 + 谓 + 宾：I like apples. 主 + 系 + 表：She is happy.' },
      { title: '祈使句', body: '动词原形开头：Open the door. 否定：Don’t be late.' }
    ],
    questions: [
      { prompt: '选出正确的句子：', options: ['He like apples.', 'He likes apples.', 'He liking apples.'], answer: 1, explain: '主语 He 单数，动词用 likes。' },
      { prompt: '选出正确的句子：', options: ['I am a doctor.', 'I is a doctor.', 'I are a doctor.'], answer: 0, explain: 'I 后用 am。' },
      { prompt: '“请开门”的正确英文是：', options: ['Open the door.', 'Opens the door.', 'Opening the door.'], answer: 0, explain: '祈使句用动词原形开头。' },
      { prompt: '选出正确的句子：', options: ['They is happy.', 'They are happy.', 'They am happy.'], answer: 1, explain: 'They 复数，用 are。' },
      { prompt: '选出正确的句子：', options: ['She go to school.', 'She goes to school.', 'She going to school.'], answer: 1, explain: 'She 单数，动词加 -es。' },
      { prompt: '“不要迟到”的正确英文是：', options: ['Don’t be late.', 'Not be late.', 'No be late.'], answer: 0, explain: '否定祈使句用 Don’t + 动词原形。' },
      { prompt: '选出正确的句子：', options: ['There is many birds.', 'There are many birds.', 'There am many birds.'], answer: 1, explain: 'many birds 是复数，用 there are。' },
      { prompt: '选出正确的句子：', options: ['We like English.', 'We likes English.', 'We liking English.'], answer: 0, explain: 'We 复数，动词用原形 like。' }
    ]
  }
]

export const GRAMMAR_UNITS_L7 = [
  {
    id: 'l7_clause',
    title: '定语从句',
    emoji: '🔗',
    intro: '定语从句用来修饰名词，相当于一个"大形容词"。常用关系词：that / which / who / whose / where。',
    rules: [
      { title: '关系词选择', body: '指人用 who/that；指物用 which/that；所属关系用 whose；表地点用 where。' },
      { title: '例句', body: 'The girl who is singing is my sister. / This is the book which I bought yesterday.' }
    ],
    questions: [
      { prompt: 'The man ___ helped us is my teacher.', options: ['which', 'who', 'where', 'whose'], answer: 1, explain: '先行词 the man 指人，用 who。' },
      { prompt: 'I like the house ___ has a big garden.', options: ['who', 'where', 'which', 'whose'], answer: 2, explain: '先行词 the house 指物，用 which。' },
      { prompt: 'This is the park ___ I often play.', options: ['which', 'who', 'where', 'whose'], answer: 2, explain: '先行词 the park 表地点且在从句中作状语，用 where。' },
      { prompt: 'The student ___ father is a doctor studies very hard.', options: ['which', 'who', 'whose', 'where'], answer: 2, explain: '表示"那个学生的父亲"，所属关系用 whose。' },
      { prompt: '仿写：请选出正确的定语从句 —— "我昨天读的那本书很有趣。"', options: ['The book that I read yesterday is interesting.', 'The book who I read yesterday is interesting.', 'The book where I read yesterday is interesting.', 'The book I read it yesterday is interesting.'], answer: 0, explain: '先行词 the book 指物，可用 that/which 引导定语从句。' }
    ]
  },
  {
    id: 'l7_adverbial',
    title: '状语从句',
    emoji: '🌪️',
    intro: '状语从句在句中作状语，表示时间、原因、条件、让步等关系。',
    rules: [
      { title: '常见引导词', body: '时间：when / before / after / while；原因：because / since；条件：if / unless；让步：although / though。' },
      { title: '主将从现', body: '主句用将来时，if/when 引导的从句用一般现在时：If it rains, we will stay at home.' }
    ],
    questions: [
      { prompt: '___ it rains tomorrow, we will stay at home.', options: ['If', 'Although', 'Because', 'So'], answer: 0, explain: '表示条件"如果明天下雨"，用 if。' },
      { prompt: 'He was late ___ he missed the bus.', options: ['although', 'because', 'if', 'while'], answer: 1, explain: '迟到与错过公交是因果关系，用 because。' },
      { prompt: '___ he is young, he knows a lot.', options: ['If', 'Although', 'Because', 'Until'], answer: 1, explain: '前后为转折关系，用 although（虽然）。' },
      { prompt: 'Please call me ___ you arrive.', options: ['although', 'because', 'when', 'if'], answer: 2, explain: '"到达时给我打电话"，表时间用 when。' },
      { prompt: '仿写：请选出正确的表达 —— "如果你努力学习，你就会通过考试。"', options: ['If you study hard, you will pass the exam.', 'If you will study hard, you pass the exam.', 'If you study hard, you pass the exam tomorrow.', 'If you studied hard, you will pass the exam.'], answer: 0, explain: '主将从现：条件从句用一般现在时，主句用 will。' }
    ]
  },
  {
    id: 'l7_passive',
    title: '被动语态',
    emoji: '🏗️',
    intro: '被动语态表示主语是动作的承受者，结构为 be + 过去分词。',
    rules: [
      { title: '时态变化', body: '一般现在时：am/is/are + done；一般过去时：was/were + done；含情态动词：can/should + be + done。' },
      { title: '例句', body: 'The bridge was built in 1990. / English is spoken in many countries.' }
    ],
    questions: [
      { prompt: 'The window ___ broken by Tom yesterday.', options: ['is', 'was', 'are', 'were'], answer: 1, explain: 'yesterday 表过去，window 单数，用 was broken。' },
      { prompt: 'English ___ in many countries.', options: ['speak', 'speaks', 'is spoken', 'was spoken'], answer: 2, explain: '一般现在时被动：is spoken，表示"被说"。' },
      { prompt: 'The work must ___ before Friday.', options: ['finish', 'finished', 'be finished', 'finishing'], answer: 2, explain: '含情态动词的被动：must + be + 过去分词。' },
      { prompt: 'These flowers ___ by my grandmother every morning.', options: ['water', 'are watered', 'watered', 'watering'], answer: 1, explain: '一般现在时被动（主语 flowers 复数）：are watered。' },
      { prompt: '仿写：请选出正确的被动语态 —— "这台电脑是去年买的。"', options: ['The computer bought last year.', 'The computer was bought last year.', 'The computer is bought last year.', 'The computer was buy last year.'], answer: 1, explain: '一般过去时被动：was + bought（过去分词）。' }
    ]
  },
  {
    id: 'l7_subjunctive',
    title: '虚拟语气',
    emoji: '💭',
    intro: '虚拟语气用来表达与事实相反的假设或愿望，与现在事实相反用 if + 过去时，主句用 would/could + 动词原形。',
    rules: [
      { title: '与现在事实相反', body: 'If I were you, I would study harder.（事实：我不是你）' },
      { title: 'be 动词用 were', body: '虚拟语气中 be 动词一律用 were：If I were rich...（即使主语是 I）' }
    ],
    questions: [
      { prompt: 'If I ___ you, I would take the job.', options: ['am', 'was', 'were', 'be'], answer: 2, explain: '虚拟语气中 be 动词用 were。' },
      { prompt: 'If it ___ sunny tomorrow, we would go hiking.', options: ['is', 'was', 'were', 'will be'], answer: 2, explain: '表与将来可能相反的假设，用 if + were。' },
      { prompt: 'If she had more time, she ___ travel around the world.', options: ['would', 'will', 'can', 'must'], answer: 0, explain: '虚拟语气主句用 would + 动词原形。' },
      { prompt: 'I wish I ___ taller.', options: ['am', 'was', 'were', 'be'], answer: 2, explain: 'wish 后用虚拟语气，be 动词用 were。' },
      { prompt: '仿写：请选出正确的虚拟语气 —— "如果明天下雨，我们就会待在家里。"', options: ['If it rained tomorrow, we would stay at home.', 'If it rains tomorrow, we would stay at home.', 'If it will rain tomorrow, we would stay at home.', 'If it is raining tomorrow, we stayed at home.'], answer: 0, explain: '与将来事实相反或可能性较低的假设：If it rained tomorrow, we would stay at home.' }
    ]
  }
]

export function getGrammarUnitById(id) {
  const l4 = GRAMMAR_UNITS_L4.find((u) => u.id === id)
  if (l4) return l4
  return GRAMMAR_UNITS_L7.find((u) => u.id === id) || null
}

export default { GRAMMAR_UNITS_L4, GRAMMAR_UNITS_L7, getGrammarUnitById }
