/* ============================================================
   src/data/listening_l6.js —— L6 听说进阶听力材料（8 篇）
   结构：{ id, title, emoji, script: [{en, zh}], questions: [{q, options, answer}] }
   ============================================================ */

export const L6_LISTENING = [
  {
    id: 'l6_01',
    title: '我的自我介绍',
    emoji: '🙋',
    script: [
      { en: 'Hello everyone, my name is Lily.', zh: '大家好，我叫莉莉。' },
      { en: 'I am twelve years old and I come from Shanghai.', zh: '我十二岁，来自上海。' },
      { en: 'I live with my parents and my little brother.', zh: '我和父母以及弟弟住在一起。' },
      { en: 'My favourite subject is English.', zh: '我最喜欢的科目是英语。' },
      { en: 'In my free time, I like reading and swimming.', zh: '空闲时间我喜欢阅读和游泳。' },
      { en: 'I want to be an English teacher in the future.', zh: '将来我想成为一名英语老师。' }
    ],
    questions: [
      { q: 'How old is Lily?', options: ['Ten', 'Twelve', 'Twenty'], answer: 1 },
      { q: 'Where is Lily from?', options: ['Beijing', 'Shanghai', 'Guangzhou'], answer: 1 },
      { q: 'What is Lily’s favourite subject?', options: ['Math', 'English', 'Music'], answer: 1 },
      { q: 'What does Lily like doing in her free time?', options: ['Reading and swimming', 'Singing and dancing', 'Running and jumping'], answer: 0 }
    ]
  },
  {
    id: 'l6_02',
    title: '我的家庭',
    emoji: '👨‍👩‍👧‍👦',
    script: [
      { en: 'There are four people in my family.', zh: '我家有四口人。' },
      { en: 'My father is a doctor and my mother is a nurse.', zh: '我爸爸是医生，妈妈是护士。' },
      { en: 'They both work in the city hospital.', zh: '他们都在市医院工作。' },
      { en: 'My older sister is a college student.', zh: '我的姐姐是大学生。' },
      { en: 'She studies art and loves drawing very much.', zh: '她学美术，非常喜欢画画。' },
      { en: 'On weekends, we often cook dinner together.', zh: '周末我们经常一起做晚饭。' },
      { en: 'I love my family very much.', zh: '我非常爱我的家人。' }
    ],
    questions: [
      { q: 'How many people are there in the family?', options: ['Three', 'Four', 'Five'], answer: 1 },
      { q: 'What does the father do?', options: ['A nurse', 'A doctor', 'A teacher'], answer: 1 },
      { q: 'What does the sister study?', options: ['Art', 'Music', 'Science'], answer: 0 },
      { q: 'What do they often do on weekends?', options: ['Go shopping', 'Cook dinner together', 'Watch movies'], answer: 1 }
    ]
  },
  {
    id: 'l6_03',
    title: '一日三餐',
    emoji: '🍚',
    script: [
      { en: 'I have three meals every day.', zh: '我每天吃三餐。' },
      { en: 'For breakfast, I usually eat eggs and drink milk.', zh: '早餐我通常吃鸡蛋、喝牛奶。' },
      { en: 'My mother thinks breakfast is the most important meal.', zh: '妈妈认为早餐最重要。' },
      { en: 'I have lunch at school with my classmates.', zh: '我在学校和同学一起吃午饭。' },
      { en: 'We often have rice, vegetables and some meat.', zh: '我们常吃米饭、蔬菜和一些肉。' },
      { en: 'Dinner is at seven in the evening at home.', zh: '晚饭晚上七点在家吃。' },
      { en: 'After dinner, I do my homework and then go to bed.', zh: '晚饭后我做作业，然后睡觉。' }
    ],
    questions: [
      { q: 'What does the speaker eat for breakfast?', options: ['Rice and meat', 'Eggs and milk', 'Bread and coffee'], answer: 1 },
      { q: 'Where does the speaker have lunch?', options: ['At home', 'At school', 'At a restaurant'], answer: 1 },
      { q: 'What time is dinner?', options: ['At six', 'At seven', 'At eight'], answer: 1 },
      { q: 'Who thinks breakfast is the most important?', options: ['The father', 'The teacher', 'The mother'], answer: 2 }
    ]
  },
  {
    id: 'l6_04',
    title: '学校生活',
    emoji: '🏫',
    script: [
      { en: 'My school is big and beautiful.', zh: '我的学校又大又漂亮。' },
      { en: 'We have classes from Monday to Friday.', zh: '我们从周一到周五上课。' },
      { en: 'Classes start at eight in the morning.', zh: '早上八点开始上课。' },
      { en: 'My favourite teacher is Mr. Wang, our English teacher.', zh: '我最喜欢的老师是英语老师王老师。' },
      { en: 'He makes his classes interesting and fun.', zh: '他把课讲得既有趣又好玩。' },
      { en: 'After class, I like playing basketball with my friends.', zh: '课后我喜欢和朋友打篮球。' },
      { en: 'There is a big library in our school too.', zh: '我们学校还有一个大图书馆。' },
      { en: 'I usually read there after lunch.', zh: '午饭后我通常在那里看书。' }
    ],
    questions: [
      { q: 'How many days do they have classes?', options: ['Five days', 'Six days', 'Seven days'], answer: 0 },
      { q: 'When do classes start?', options: ['At seven', 'At eight', 'At nine'], answer: 1 },
      { q: 'Who is Mr. Wang?', options: ['A math teacher', 'An English teacher', 'A music teacher'], answer: 1 },
      { q: 'What does the speaker do after lunch?', options: ['Plays basketball', 'Reads in the library', 'Sleeps at home'], answer: 1 }
    ]
  },
  {
    id: 'l6_05',
    title: '周末计划',
    emoji: '🗓️',
    script: [
      { en: 'The weekend is coming, and I have a nice plan.', zh: '周末快到了，我有一个不错的计划。' },
      { en: 'On Saturday morning, I will clean my room.', zh: '周六上午我要打扫房间。' },
      { en: 'In the afternoon, I will go to the park with my dog.', zh: '下午我要带狗去公园。' },
      { en: 'On Sunday, my family will visit my grandparents.', zh: '周日全家要去看望祖父母。' },
      { en: 'We will have a big lunch together.', zh: '我们会一起吃一顿丰盛的午餐。' },
      { en: 'In the evening, I will watch a movie at home.', zh: '晚上我将在家里看电影。' },
      { en: 'I think it will be a busy but happy weekend.', zh: '我觉得这将是一个忙碌而快乐的周末。' }
    ],
    questions: [
      { q: 'What will the speaker do on Saturday morning?', options: ['Clean the room', 'Go shopping', 'Visit grandparents'], answer: 0 },
      { q: 'Where will the speaker go on Saturday afternoon?', options: ['To the school', 'To the park', 'To the mall'], answer: 1 },
      { q: 'What will the family do on Sunday?', options: ['Watch a movie', 'Visit grandparents', 'Go fishing'], answer: 1 },
      { q: 'What will the speaker do on Sunday evening?', options: ['Watch a movie', 'Play games', 'Do homework'], answer: 0 }
    ]
  },
  {
    id: 'l6_06',
    title: '一次购物经历',
    emoji: '🛒',
    script: [
      { en: 'Last Saturday, I went shopping with my mother.', zh: '上周六我和妈妈去购物。' },
      { en: 'We went to a big mall near our home.', zh: '我们去了家附近的大商场。' },
      { en: 'First, we bought some fruit and vegetables.', zh: '我们先买了些水果和蔬菜。' },
      { en: 'Then my mother chose a new coat because it was on sale.', zh: '然后妈妈挑了一件新外套，因为正在打折。' },
      { en: 'I wanted to buy a pair of shoes, but they were too expensive.', zh: '我想买双鞋，但太贵了。' },
      { en: 'We also had lunch at the food court in the mall.', zh: '我们还在商场的美食广场吃了午饭。' },
      { en: 'We went home at four in the afternoon.', zh: '我们下午四点回家。' }
    ],
    questions: [
      { q: 'When did they go shopping?', options: ['Last Sunday', 'Last Saturday', 'This weekend'], answer: 1 },
      { q: 'Why did the mother buy a new coat?', options: ['It was on sale', 'It was warm', 'It was cheap food'], answer: 0 },
      { q: 'Why did the speaker NOT buy the shoes?', options: ['They were too expensive', 'They were too small', 'They were sold out'], answer: 0 },
      { q: 'Where did they have lunch?', options: ['At home', 'At the food court', 'At a friend’s house'], answer: 1 }
    ]
  },
  {
    id: 'l6_07',
    title: '天气与旅行',
    emoji: '🌦️',
    script: [
      { en: 'Next week, our class will go on a trip to the mountains.', zh: '下周我们班要去山里旅行。' },
      { en: 'The weather there is cool and sunny in autumn.', zh: '秋天那里凉爽晴朗。' },
      { en: 'We will leave early on Monday morning.', zh: '我们周一早上早早出发。' },
      { en: 'Everyone needs to bring some warm clothes.', zh: '每个人都要带些保暖的衣服。' },
      { en: 'We will climb the mountain and have a picnic.', zh: '我们会爬山并野餐。' },
      { en: 'The teacher says we should also bring enough water.', zh: '老师说我们还要带足够的水。' },
      { en: 'I am looking forward to this trip very much.', zh: '我非常期待这次旅行。' }
    ],
    questions: [
      { q: 'Where will the class go next week?', options: ['To the beach', 'To the mountains', 'To the city'], answer: 1 },
      { q: 'What is the weather like there in autumn?', options: ['Hot and rainy', 'Cool and sunny', 'Cold and windy'], answer: 1 },
      { q: 'What should everyone bring?', options: ['Warm clothes', 'New shoes', 'Books'], answer: 0 },
      { q: 'What will they do there?', options: ['Climb and have a picnic', 'Swim in the sea', 'Visit a museum'], answer: 0 }
    ]
  },
  {
    id: 'l6_08',
    title: '我的梦想',
    emoji: '🌟',
    script: [
      { en: 'Everyone has a dream, and I have one too.', zh: '每个人都有梦想，我也有一个。' },
      { en: 'My dream is to become a scientist.', zh: '我的梦想是成为一名科学家。' },
      { en: 'I want to study the stars and the universe.', zh: '我想研究星星和宇宙。' },
      { en: 'I often read books about science at night.', zh: '我经常在晚上读科学方面的书。' },
      { en: 'My science teacher always encourages me.', zh: '我的科学老师总是鼓励我。' },
      { en: 'To make my dream come true, I study hard every day.', zh: '为了实现梦想，我每天努力学习。' },
      { en: 'I believe that if I keep trying, I will succeed one day.', zh: '我相信只要不断努力，总有一天会成功。' }
    ],
    questions: [
      { q: 'What is the speaker’s dream?', options: ['To be a teacher', 'To be a scientist', 'To be a doctor'], answer: 1 },
      { q: 'What does the speaker want to study?', options: ['The sea', 'The stars and the universe', 'The history'], answer: 1 },
      { q: 'Who encourages the speaker?', options: ['The mother', 'The science teacher', 'The friend'], answer: 1 },
      { q: 'How will the speaker make the dream come true?', options: ['Study hard every day', 'Watch TV every day', 'Sleep early every day'], answer: 0 }
    ]
  }
]

export function getL6ListeningById(id) {
  return L6_LISTENING.find((m) => m.id === id) || null
}

export default { L6_LISTENING, getL6ListeningById }
