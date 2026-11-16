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
  },
  {
    id: 'l6_09',
    title: '在餐厅点餐',
    emoji: '🍽️',
    script: [
      { en: 'Good evening, table for two, please.', zh: '晚上好，请给我们一张两人桌。' },
      { en: 'Sure, this way please. Here is the menu.', zh: '好的，这边请。这是菜单。' },
      { en: 'What would you recommend?', zh: '你有什么推荐吗？' },
      { en: 'The grilled fish is very popular today.', zh: '今天的烤鱼很受欢迎。' },
      { en: 'That sounds good. I will have the fish and a green salad.', zh: '听起来不错，我要烤鱼和一份蔬菜沙拉。' },
      { en: 'Would you like anything to drink?', zh: '想喝点什么吗？' },
      { en: 'Two glasses of sparkling water, please.', zh: '请给我们两杯气泡水。' }
    ],
    questions: [
      { q: 'How many people are dining?', options: ['Two', 'Three', 'Four'], answer: 0 },
      { q: 'What does the waiter recommend?', options: ['The soup', 'The grilled fish', 'The steak'], answer: 1 },
      { q: 'What does the customer order besides the fish?', options: ['A green salad', 'Some rice', 'French fries'], answer: 0 },
      { q: 'What do they drink?', options: ['Coffee', 'Orange juice', 'Sparkling water'], answer: 2 }
    ]
  },
  {
    id: 'l6_10',
    title: '机场办理登机',
    emoji: '✈️',
    script: [
      { en: 'Good morning. May I see your passport and ticket?', zh: '早上好，请出示您的护照和机票。' },
      { en: 'Here you are. I am flying to London.', zh: '给您，我要飞往伦敦。' },
      { en: 'Do you have any bags to check in?', zh: '您有行李要托运吗？' },
      { en: 'Yes, one suitcase and one backpack.', zh: '有一个行李箱和一个背包。' },
      { en: 'Your suitcase is a little heavy, but it is within the limit.', zh: '您的箱子有点重，但在限额之内。' },
      { en: 'Great. Which gate should I go to?', zh: '太好了，我应该去哪个登机口？' },
      { en: 'Gate 12. Boarding starts at ten thirty.', zh: '12 号登机口，十点半开始登机。' }
    ],
    questions: [
      { q: 'Where is the passenger flying to?', options: ['Paris', 'London', 'New York'], answer: 1 },
      { q: 'How many bags does the passenger check in?', options: ['One', 'Two', 'Three'], answer: 1 },
      { q: 'What does the clerk say about the suitcase?', options: ['It is too heavy', 'It is within the limit', 'It is lost'], answer: 1 },
      { q: 'When does boarding start?', options: ['At ten thirty', 'At eleven thirty', 'At twelve thirty'], answer: 0 }
    ]
  },
  {
    id: 'l6_11',
    title: '看病就诊',
    emoji: '🏥',
    script: [
      { en: 'What seems to be the problem?', zh: '您哪里不舒服？' },
      { en: 'I have had a sore throat and a headache for three days.', zh: '我喉咙痛、头疼已经三天了。' },
      { en: 'Do you have a fever as well?', zh: '您也发烧吗？' },
      { en: 'Yes, my temperature was thirty-eight degrees last night.', zh: '是的，昨晚量到三十八度。' },
      { en: 'Let me have a look. Open your mouth and say ah.', zh: '让我看看，张开嘴说啊。' },
      { en: 'It looks like a throat infection. Take this medicine twice a day.', zh: '看起来是咽喉感染，这药一天服两次。' },
      { en: 'Thank you, doctor. Should I stay at home?', zh: '谢谢医生，我需要待在家里吗？' }
    ],
    questions: [
      { q: 'How long has the problem lasted?', options: ['One day', 'Two days', 'Three days'], answer: 2 },
      { q: 'What was the patient’s temperature last night?', options: ['36 degrees', '37 degrees', '38 degrees'], answer: 2 },
      { q: 'What does the doctor find?', options: ['A cold', 'A throat infection', 'A broken arm'], answer: 1 },
      { q: 'How often should the medicine be taken?', options: ['Once a day', 'Twice a day', 'Three times a day'], answer: 1 }
    ]
  },
  {
    id: 'l6_12',
    title: '银行业务',
    emoji: '🏦',
    script: [
      { en: 'Hello, I would like to open a savings account.', zh: '你好，我想开一个储蓄账户。' },
      { en: 'Sure. Please fill in this form first.', zh: '好的，请先填这张表。' },
      { en: 'Do I need to show my ID card?', zh: '需要出示身份证吗？' },
      { en: 'Yes, and please set a password with six numbers.', zh: '需要，另外请设置一个六位数字的密码。' },
      { en: 'Done. Is there any service charge?', zh: '填好了，有手续费吗？' },
      { en: 'There is no charge for the first year.', zh: '第一年免收手续费。' },
      { en: 'Perfect. When can I get my bank card?', zh: '太好了，我什么时候能拿到银行卡？' }
    ],
    questions: [
      { q: 'What does the customer want to do?', options: ['Exchange money', 'Open a savings account', 'Report a lost card'], answer: 1 },
      { q: 'How many numbers should the password have?', options: ['Four', 'Five', 'Six'], answer: 2 },
      { q: 'What about the service charge?', options: ['Free for the first year', 'Ten yuan a month', 'No free service'], answer: 0 },
      { q: 'What does the customer ask at the end?', options: ['About the interest rate', 'About the bank card', 'About the opening hours'], answer: 1 }
    ]
  },
  {
    id: 'l6_13',
    title: '电话预订酒店',
    emoji: '🏨',
    script: [
      { en: 'Grand Hotel, how may I help you?', zh: '格兰德酒店，有什么可以帮您？' },
      { en: 'I would like to book a double room for two nights.', zh: '我想订一间双人房，住两晚。' },
      { en: 'For which dates?', zh: '请问哪两天？' },
      { en: 'From the fifteenth to the seventeenth of June.', zh: '6 月 15 日到 17 日。' },
      { en: 'We have a room with a sea view for 380 yuan a night.', zh: '我们有一间海景房，每晚 380 元。' },
      { en: 'Does that include breakfast?', zh: '含早餐吗？' },
      { en: 'Yes, breakfast is included. May I have your name?', zh: '含早餐。请问您的姓名？' }
    ],
    questions: [
      { q: 'What kind of room does the caller want?', options: ['A single room', 'A double room', 'A family room'], answer: 1 },
      { q: 'How many nights will the caller stay?', options: ['One', 'Two', 'Three'], answer: 1 },
      { q: 'How much is the room per night?', options: ['280 yuan', '380 yuan', '480 yuan'], answer: 1 },
      { q: 'What is included in the price?', options: ['Dinner', 'Breakfast', 'Airport pickup'], answer: 1 }
    ]
  },
  {
    id: 'l6_14',
    title: '网上购物咨询',
    emoji: '📱',
    script: [
      { en: 'Hello, I have a question about my order.', zh: '你好，我想咨询一下我的订单。' },
      { en: 'Sure, could you tell me the order number?', zh: '好的，请告诉我订单号。' },
      { en: 'It is 20260358. The shoes have not arrived yet.', zh: '订单号 20260358，鞋子还没到。' },
      { en: 'Let me check. They were sent out two days ago.', zh: '我查一下，鞋子两天前已经发出。' },
      { en: 'How long does delivery usually take?', zh: '配送一般要多久？' },
      { en: 'Usually three to five working days.', zh: '一般三到五个工作日。' },
      { en: 'OK, I will wait a bit longer. Thank you.', zh: '好的，我再等等，谢谢。' }
    ],
    questions: [
      { q: 'What is the customer asking about?', options: ['A refund', 'A delayed order', 'A discount'], answer: 1 },
      { q: 'When were the shoes sent out?', options: ['Yesterday', 'Two days ago', 'Last week'], answer: 1 },
      { q: 'How long does delivery usually take?', options: ['Two to three days', 'Three to five working days', 'A week'], answer: 1 },
      { q: 'What does the customer decide to do?', options: ['Cancel the order', 'Wait a bit longer', 'Change the address'], answer: 1 }
    ]
  },
  {
    id: 'l6_15',
    title: '天气预报',
    emoji: '⛅',
    script: [
      { en: 'Here is the weather report for tomorrow.', zh: '这里是明天的天气预报。' },
      { en: 'In the morning, it will be cloudy with light rain.', zh: '上午多云，有小雨。' },
      { en: 'The rain will stop around noon, and the sun will come out.', zh: '中午前后雨会停，太阳出来。' },
      { en: 'In the afternoon, temperatures will reach twenty-two degrees.', zh: '下午气温将升至 22 度。' },
      { en: 'However, a strong wind will blow along the coast.', zh: '不过，沿海将有强风。' },
      { en: 'Drivers should be careful on the bridges.', zh: '司机过桥时要小心。' },
      { en: 'The weekend looks sunny and warm.', zh: '周末看起来晴朗温暖。' }
    ],
    questions: [
      { q: 'What will the weather be like in the morning?', options: ['Sunny', 'Cloudy with light rain', 'Snowy'], answer: 1 },
      { q: 'When will the rain stop?', options: ['Around noon', 'In the evening', 'Late at night'], answer: 0 },
      { q: 'What will the afternoon temperature be?', options: ['12 degrees', '22 degrees', '32 degrees'], answer: 1 },
      { q: 'What warning does the report give?', options: ['Strong wind along the coast', 'Heavy snow in the mountains', 'Fog on the roads'], answer: 0 }
    ]
  },
  {
    id: 'l6_16',
    title: '问路与交通',
    emoji: '🚦',
    script: [
      { en: 'Excuse me, how can I get to the science museum?', zh: '打扰一下，去科技博物馆怎么走？' },
      { en: 'Take Line 2 and get off at Green Park station.', zh: '乘 2 号线，在 Green Park 站下车。' },
      { en: 'How many stops is that from here?', zh: '从这里坐几站？' },
      { en: 'About six stops, around fifteen minutes.', zh: '大约六站，十五分钟左右。' },
      { en: 'Do I need to change trains?', zh: '需要换乘吗？' },
      { en: 'No, but the museum is ten minutes on foot from the station.', zh: '不用换乘，但从车站步行到博物馆要十分钟。' },
      { en: 'Thanks a lot. Is there a map nearby?', zh: '非常感谢，附近有地图吗？' }
    ],
    questions: [
      { q: 'Which line should the visitor take?', options: ['Line 1', 'Line 2', 'Line 3'], answer: 1 },
      { q: 'At which station should the visitor get off?', options: ['City Hall', 'Green Park', 'Museum Square'], answer: 1 },
      { q: 'How long does the ride take?', options: ['About ten minutes', 'About fifteen minutes', 'About twenty minutes'], answer: 1 },
      { q: 'How far is the museum from the station?', options: ['Five minutes by bus', 'Ten minutes on foot', 'Fifteen minutes by taxi'], answer: 1 }
    ]
  }
]

export function getL6ListeningById(id) {
  return L6_LISTENING.find((m) => m.id === id) || null
}

export default { L6_LISTENING, getL6ListeningById }
