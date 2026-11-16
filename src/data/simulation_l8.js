/**
 * L8 托福雅思冲刺：仿真题题型训练数据
 * 学术词汇已抽至 public/data/words-l8.json（经 services/wordData.js 按需加载），
 * 8 主题 × 12 词 = 96 词，全部标注 l5_core（对应 L5 核心词），
 * 覆盖率 96/120 = 80%，满足 PLAN §3.4 覆盖率要求（L8 覆盖 L5 核心词学术变体 ≥80%）。
 * 仿真题按阅读/听力/写作/口语分题型（原创题，不使用真题原题）。
 */
import { getL8Words } from '../services/wordData'

export const L8_THEMES = [
  { id: 's8_01', title: '学术生活', emoji: '🎓', l5_theme: 'l5_education' },
  { id: 's8_02', title: '社会与新闻', emoji: '📰', l5_theme: 'l5_society_news' },
  { id: 's8_03', title: '健康与科学', emoji: '🧬', l5_theme: 'l5_health_sports' },
  { id: 's8_04', title: '科技与网络', emoji: '💻', l5_theme: 'l5_tech_network' },
  { id: 's8_05', title: '环境与自然', emoji: '🌏', l5_theme: 'l5_environment' },
  { id: 's8_06', title: '工作与职业', emoji: '💼', l5_theme: 'l5_work_jobs' },
  { id: 's8_07', title: '旅行与文化', emoji: '🗺️', l5_theme: 'l5_travel' },
  { id: 's8_08', title: '家庭与情感', emoji: '🏡', l5_theme: 'l5_family_feelings' }
]

export const SIMULATIONS_L8 = [
  {
    id: 's8_01',
    title: '学术生活 · 阅读',
    emoji: '🎓',
    themeId: 's8_01',
    section: 'reading',
    description: '阅读短文，完成主旨与细节题；题材围绕学术生活。',
    questions: [
      {
        section: 'reading',
        context: 'Many students worry that a heavy curriculum leaves no time for hobbies. However, research shows that balanced schedules actually improve learning. A student who exercises for thirty minutes often concentrates better in lectures. Meanwhile, joining a seminar group encourages deeper discussion, which turns passive listening into active thinking. Schools that offer both academic courses and creative activities usually report higher satisfaction among learners.',
        q: 'According to the passage, what helps students learn better?',
        options: ['A heavier curriculum', 'Balanced schedules with hobbies and study', 'Studying alone all day', 'Avoiding all exercise'],
        answer: 1,
        explain: '原文：balanced schedules actually improve learning，且运动与研讨课都利于学习。'
      },
      {
        section: 'reading',
        q: 'Why does the writer mention joining a seminar group?',
        options: ['To show seminars are easier than lectures', 'To explain how discussion turns passive listening into active thinking', 'To recommend skipping lectures', 'To prove hobbies are useless'],
        answer: 1,
        explain: '原文：joining a seminar group encourages deeper discussion, which turns passive listening into active thinking.'
      },
      {
        section: 'reading',
        q: 'The word "improve" in the passage is closest in meaning to ______.',
        options: ['worsen', 'make better', 'ignore', 'repeat'],
        answer: 1,
        explain: 'improve 意为“改进、使更好”。'
      },
      {
        section: 'reading',
        q: 'According to the passage, which schools report higher satisfaction among learners?',
        options: ['Schools with only academic courses', 'Schools offering both academic courses and creative activities', 'Schools without any activities', 'Schools that ban hobbies'],
        answer: 1,
        explain: '原文：Schools that offer both academic courses and creative activities usually report higher satisfaction among learners.'
      },
      {
        section: 'vocab',
        q: '选出 academic 的正确释义：',
        options: ['娱乐的', '学术的', '便宜的', '紧张的'],
        answer: 1,
        explain: 'academic 意为“学术的”，如 academic record（学业成绩）。'
      },
      {
        section: 'vocab',
        q: '选出 curriculum 的正确释义：',
        options: ['课程体系', '计算机', '社区', '走廊'],
        answer: 0,
        explain: 'curriculum 意为“课程体系”，如 a heavy curriculum（繁重的课程）。'
      },
      {
        section: 'speaking',
        q: '口语题（话题卡：Describe your favourite subject）：请选出最自然的表达 —— “我最喜欢的科目是英语，因为它很有趣。”',
        options: ['My favourite subject is English because it is fun.', 'My favourite subject is English because it very funny.', 'English my favourite subject, it is fun.', 'I favourite subject is English because interesting.'],
        answer: 0,
        explain: '主系表 + because 从句表达自然；fun 意为“有趣的”，funny 意为“滑稽的”。'
      },
      {
        section: 'writing',
        q: '写作题：请选出最佳开头句 —— “均衡的课表对学生有益。”',
        options: ['A balanced curriculum benefits students.', 'A balance curriculum benefit students.', 'The curriculum balanced is good for student.', 'Students benefit for balanced curriculum.'],
        answer: 0,
        explain: '主谓宾结构正确且用词地道：A balanced curriculum benefits students.'
      },
      {
        section: 'speaking',
        q: '口语题（话题卡：Describe your study plan）：请选出最自然的表达 —— “我通常先完成作业，然后复习笔记。”',
        options: ['I usually finish my homework first, then I review my notes.', 'I first finish homework, then notes review.', 'Homework I finish, notes I review.', 'I usually finishing homework, reviewing notes.'],
        answer: 0,
        explain: '口语中自然连贯的表达：I usually finish my homework first, then I review my notes.'
      }
    ]
  },
  {
    id: 's8_02',
    title: '社会与新闻 · 听力',
    emoji: '📰',
    themeId: 's8_02',
    section: 'listening',
    description: '听一段短新闻或对话，完成理解题（点击喇叭听发音）。',
    questions: [
      {
        section: 'listening',
        audio: 'A local community has started a free evening class to help citizens learn digital skills. The government supports the program and provides computers. Organizers say the classes will increase job chances for older workers. The first lesson begins next Monday at the community center.',
        q: '听力题：What is the evening class about?',
        options: ['Cooking', 'Digital skills', 'Driving', 'Painting'],
        answer: 1,
        explain: '听力内容：a free evening class to help citizens learn digital skills.'
      },
      {
        section: 'listening',
        audio: 'The government supports the program and provides computers.',
        q: '听力题：Who provides computers for the class?',
        options: ['The community center', 'The students', 'The government', 'A local shop'],
        answer: 2,
        explain: '听力内容：The government supports the program and provides computers.'
      },
      {
        section: 'listening',
        audio: 'Organizers say the classes will increase job chances for older workers.',
        q: '听力题：According to the news, how will the classes help older workers?',
        options: ['They will earn more money', 'They will increase job chances', 'They will travel more', 'They will learn cooking'],
        answer: 1,
        explain: '听力内容：the classes will increase job chances for older workers.'
      },
      {
        section: 'listening',
        audio: 'The media reported the news quickly, and many citizens shared their opinions online.',
        q: '听力题：What did many citizens do after the news was reported?',
        options: ['They ignored it', 'They shared their opinions online', 'They traveled abroad', 'They bought newspapers'],
        answer: 1,
        explain: '听力内容：many citizens shared their opinions online.'
      },
      {
        section: 'vocab',
        q: '选出 policy 的正确释义：',
        options: ['政策', '图片', '口袋', '警察'],
        answer: 0,
        explain: 'policy 意为“政策”，如 government policy（政府政策）。'
      },
      {
        section: 'vocab',
        q: '选出 media 的正确释义：',
        options: ['媒体', '米饭', '市场', '记忆'],
        answer: 0,
        explain: 'media 意为“媒体”，如 social media（社交媒体）。'
      },
      {
        section: 'speaking',
        q: '口语题（话题卡：Talk about how you get news）：请选出最自然的表达 —— “我通常在手机上看新闻，因为很方便。”',
        options: ['I usually read the news on my phone because it is convenient.', 'I usually read news on phone because convenient.', 'On my phone I read the news, very convenient it is.', 'I usually reading news on my phone because it convenient.'],
        answer: 0,
        explain: '一般现在时 + because 从句表达自然；convenient 意为“方便的”。'
      },
      {
        section: 'writing',
        q: '写作题：请选出最佳表达 —— “在我看来，新闻媒体应该报道真实信息。”',
        options: ['In my opinion, the media should report true information.', 'In my opinion, the media must reports truth news.', 'To my mind, media should reporting real.', 'I opinion media should true information.'],
        answer: 0,
        explain: '地道表达：In my opinion, the media should report true information.'
      },
      {
        section: 'speaking',
        q: '口语题（话题卡：Talk about a news event）：请选出最自然的表达 —— “这个事件影响了很多人，大家都很关心。”',
        options: ['This event affected many people, and everyone cares about it.', 'This event affect many people and everyone caring.', 'Affected many people this event, everyone care.', 'This event was affect many people, everyone care about.'],
        answer: 0,
        explain: '过去时 affect 用 affected，后句用并列连接，表达自然。'
      }
    ]
  },
  {
    id: 's8_03',
    title: '健康与科学 · 阅读',
    emoji: '🧬',
    themeId: 's8_03',
    section: 'reading',
    description: '阅读科学短文，完成理解与词汇题。',
    questions: [
      {
        section: 'reading',
        context: 'Scientists have found new evidence that simple daily habits can prevent many diseases. For example, walking for thirty minutes every day improves heart health and helps people recover from stress. Nutrition also plays a key role: a balanced diet with more vegetables and less sugar gives the body energy it needs. The researchers suggest that small changes, such as taking stairs instead of elevators, can make a real difference over time.',
        q: 'What is the main idea of the passage?',
        options: ['Diseases cannot be prevented', 'Daily habits can improve health and prevent disease', 'Scientists dislike exercise', 'Sugar is good for health'],
        answer: 1,
        explain: '文章围绕“简单的日常习惯可以防病并改善健康”展开。'
      },
      {
        section: 'reading',
        q: 'According to the passage, what can walking every day do?',
        options: ['Cause stress', 'Improve heart health and help recovery', 'Replace all meals', 'Increase sugar intake'],
        answer: 1,
        explain: '原文：walking for thirty minutes every day improves heart health and helps people recover from stress.'
      },
      {
        section: 'reading',
        q: 'The word "prevent" in the passage means ______.',
        options: ['to cause', 'to stop something from happening', 'to ignore', 'to speed up'],
        answer: 1,
        explain: 'prevent 意为“预防、阻止”，如 prevent diseases（预防疾病）。'
      },
      {
        section: 'reading',
        q: 'What do the researchers suggest about small changes, such as taking stairs?',
        options: ['They make a real difference over time', 'They are useless for health', 'They only help young people', 'They can replace all medicine'],
        answer: 0,
        explain: '原文：small changes, such as taking stairs instead of elevators, can make a real difference over time.'
      },
      {
        section: 'vocab',
        q: '选出 evidence 的正确释义：',
        options: ['证据', '事件', '环境', '平衡'],
        answer: 0,
        explain: 'evidence 意为“证据”，如 scientific evidence（科学证据）。'
      },
      {
        section: 'vocab',
        q: '选出 nutrition 的正确释义：',
        options: ['营养', '噪音', '数字', '名称'],
        answer: 0,
        explain: 'nutrition 意为“营养”，如 good nutrition（良好的营养）。'
      },
      {
        section: 'speaking',
        q: '口语题（话题卡：Describe your daily routine）：请选出最自然的表达 —— “我每天走路上学，这有助于保持健康。”',
        options: ['I walk to school every day, which helps me stay healthy.', 'I walking to school every day, helps me stay healthy.', 'Walk to school every day I, which keep healthy.', 'I walk to school every day, which helps me staying healthy.'],
        answer: 0,
        explain: '非限制性定语从句 which 指代整个主句，stay healthy 用动词原形。'
      },
      {
        section: 'writing',
        q: '写作题：请选出最佳表达 —— “充足的睡眠对健康非常重要。”',
        options: ['Enough sleep is very important for health.', 'Sleep enough is very important to healths.', 'Very important enough sleep for health.', 'Enough sleeping are very important for health.'],
        answer: 0,
        explain: '主系表结构正确：Enough sleep is very important for health.'
      },
      {
        section: 'speaking',
        q: '口语题（话题卡：Describe a healthy habit）：请选出最自然的表达 —— “我每天喝水很多，这让我精力充沛。”',
        options: ['I drink plenty of water every day, which keeps me energetic.', 'I drink many water every day, it keep me energy.', 'Water I drink lots, makes me energetic day.', 'I drinking plenty water everyday, keeps energy me.'],
        answer: 0,
        explain: '非限制性定语从句 which 指代前文，表达自然连贯。'
      }
    ]
  },
  {
    id: 's8_04',
    title: '科技与网络 · 听力',
    emoji: '💻',
    themeId: 's8_04',
    section: 'listening',
    description: '听一段科技讲座片段，完成理解题（点击喇叭听发音）。',
    questions: [
      {
        section: 'listening',
        audio: 'Today I want to talk about digital security. Many people use the same password for every website, which is very dangerous. If a thief steals one password, they can access all your accounts. Experts advise using different passwords and turning on two-step verification. Remember: your data is valuable, so protect it like your wallet.',
        q: '听力题：What is the lecture mainly about?',
        options: ['How to build websites', 'Digital security', 'The history of computers', 'How to download software'],
        answer: 1,
        explain: '讲座开头点明主题：I want to talk about digital security.'
      },
      {
        section: 'listening',
        audio: 'Many people use the same password for every website, which is very dangerous. If a thief steals one password, they can access all your accounts.',
        q: '听力题：Why is using the same password dangerous?',
        options: ['It is hard to remember', 'A thief can access all accounts with one password', 'Websites do not allow it', 'It makes the internet slow'],
        answer: 1,
        explain: '听力内容：If a thief steals one password, they can access all your accounts.'
      },
      {
        section: 'listening',
        audio: 'Experts advise using different passwords and turning on two-step verification.',
        q: '听力题：What does the expert advise people to do?',
        options: ['Use one password for everything', 'Use different passwords and two-step verification', 'Share passwords with friends', 'Stop using the Internet'],
        answer: 1,
        explain: '听力内容：Experts advise using different passwords and turning on two-step verification.'
      },
      {
        section: 'listening',
        audio: 'Turning on two-step verification adds an extra layer of protection to your accounts.',
        q: '听力题：What does two-step verification add to your accounts?',
        options: ['An extra layer of protection', 'More advertisements', 'A faster network', 'A new password every day'],
        answer: 0,
        explain: '听力内容：adds an extra layer of protection to your accounts.'
      },
      {
        section: 'vocab',
        q: '选出 access 的正确释义：',
        options: ['访问，获取', '接受', '加速', '附上'],
        answer: 0,
        explain: 'access 意为“访问、获取”，如 access your accounts（访问账户）。'
      },
      {
        section: 'vocab',
        q: '选出 device 的正确释义：',
        options: ['设备', '决定', '发展', '距离'],
        answer: 0,
        explain: 'device 意为“设备”，如 a digital device（数字设备）。'
      },
      {
        section: 'speaking',
        q: '口语题（话题卡：Talk about technology in your life）：请选出最自然的表达 —— “科技让我们的生活更方便，但也带来了新问题。”',
        options: ['Technology makes our lives more convenient, but it also brings new problems.', 'Technology make our lives more convenient, but it also bring new problems.', 'Technology our lives makes convenient, also brings problems new.', 'Technology makes our life more convenient, but also bringing new problems.'],
        answer: 0,
        explain: 'makes 用第三人称单数，but 并列转折表达自然。'
      },
      {
        section: 'writing',
        q: '写作题：请选出最佳表达 —— “这款软件帮助我们快速处理数据。”',
        options: ['This software helps us process data quickly.', 'This software help us to processing data quick.', 'This software helps us data process quickly.', 'Software this helps we process data fastly.'],
        answer: 0,
        explain: 'helps sb. do sth. 结构正确：helps us process data quickly.'
      },
      {
        section: 'speaking',
        q: '口语题（话题卡：Talk about your favorite app）：请选出最自然的表达 —— “这个应用让我能和远方的朋友交流。”',
        options: ['This app lets me communicate with friends far away.', 'This app makes me can communicate with friends far.', 'This app letting me communicating friends far away.', 'This app lets I to communicate with friends far away.'],
        answer: 0,
        explain: 'lets me communicate with 是地道表达，far away 修饰 friends。'
      }
    ]
  },
  {
    id: 's8_05',
    title: '环境与自然 · 阅读',
    emoji: '🌏',
    themeId: 's8_05',
    section: 'reading',
    description: '阅读环境类短文，完成理解与词汇题。',
    questions: [
      {
        section: 'reading',
        context: 'Climate change is a global problem, but local action matters too. Communities that reduce waste and recycle plastic see cleaner rivers and streets. Protecting natural areas keeps many species safe from danger. Experts say every small step counts: using less energy at home, choosing public transport, and planting trees all help. If we act together, we can sustain a healthier planet for the next generation.',
        q: 'What is the main idea of the passage?',
        options: ['Climate change is impossible to solve', 'Local actions can help protect the environment', 'Only governments can help', 'Plastic is harmless'],
        answer: 1,
        explain: '文章强调地方行动也能改善环境：local action matters too. 并给出具体做法。'
      },
      {
        section: 'reading',
        q: 'Which of the following is mentioned as a helpful action?',
        options: ['Using more energy at home', 'Choosing public transport', 'Burning plastic', 'Cutting down trees'],
        answer: 1,
        explain: '原文：choosing public transport 是被提到的环保行动。'
      },
      {
        section: 'reading',
        q: 'Why should we protect natural areas?',
        options: ['To build more houses', 'To keep many species safe', 'To create more pollution', 'To reduce the number of trees'],
        answer: 1,
        explain: '原文：Protecting natural areas keeps many species safe from danger.'
      },
      {
        section: 'reading',
        q: 'The word "sustain" in the last sentence is closest in meaning to ______.',
        options: ['maintain', 'destroy', 'forget', 'increase'],
        answer: 0,
        explain: 'sustain 与 maintain 近义，意为“维持、使持续”。'
      },
      {
        section: 'vocab',
        q: '选出 sustain 的正确释义：',
        options: ['维持，使持续', '破坏', '忘记', '扩大'],
        answer: 0,
        explain: 'sustain 意为“维持、使持续”，如 sustain a healthy planet（维持健康的地球）。'
      },
      {
        section: 'vocab',
        q: '选出 species 的正确释义：',
        options: ['物种', '速度', '车站', '标准'],
        answer: 0,
        explain: 'species 意为“物种”，单复数同形，如 an endangered species（濒危物种）。'
      },
      {
        section: 'speaking',
        q: '口语题（话题卡：Talk about recycling）：请选出最自然的表达 —— “在我们家，我们把塑料瓶回收利用，而不是扔掉。”',
        options: ['In our family, we recycle plastic bottles instead of throwing them away.', 'In our family, we recycle plastic bottles instead of throw them away.', 'Our family we recycle plastic bottles, not throwing them away.', 'In our family, we recycling plastic bottles instead of throw away them.'],
        answer: 0,
        explain: 'instead of 后接动名词 throwing，表达地道自然。'
      },
      {
        section: 'writing',
        q: '写作题：请选出最佳表达 —— “保护环境是每个人的责任。”',
        options: ['Protecting the environment is everyone’s responsibility.', 'Protect environment is everyone responsibility.', 'The environment protecting is responsible everyone.', 'It is responsibility everyone protect environment.'],
        answer: 0,
        explain: '动名词作主语结构正确：Protecting the environment is everyone’s responsibility.'
      },
      {
        section: 'speaking',
        q: '口语题（话题卡：Describe what you do to help the environment）：请选出最自然的表达 —— “我出门时总是自带购物袋，以减少塑料垃圾。”',
        options: ['I always bring my own shopping bag to reduce plastic waste.', 'I always bring my shopping bag for reducing plastic wastes.', 'Always I bring bag my to reduce plastic waste.', 'I always bring my shopping bag to reducing plastic waste.'],
        answer: 0,
        explain: 'bring sth. to do sth. 目的状语自然：to reduce plastic waste.'
      }
    ]
  },
  {
    id: 's8_06',
    title: '工作与职业 · 听力',
    emoji: '💼',
    themeId: 's8_06',
    section: 'listening',
    description: '听一段职场对话，完成理解题（点击喇叭听发音）。',
    questions: [
      {
        section: 'listening',
        audio: 'A: Congratulations on your new job! How did you find it? B: Thanks! I had a great interview last month. The employer asked about my experience and skills, and I showed some projects I had finished. A: Did they offer a good salary? B: Yes, and they also give training every week. I feel my career is moving in the right direction.',
        q: '听力题：Where does the conversation most probably take place?',
        options: ['In a restaurant', 'At a job interview / workplace talk', 'In a hospital', 'At a train station'],
        answer: 1,
        explain: '对话围绕新工作、面试、雇主、薪水，最可能发生在职场/求职场景。'
      },
      {
        section: 'listening',
        audio: 'The employer asked about my experience and skills, and I showed some projects I had finished.',
        q: '听力题：What did B show during the interview?',
        options: ['Some photos', 'Some projects he had finished', 'His new car', 'A cooking menu'],
        answer: 1,
        explain: '听力内容：I showed some projects I had finished.'
      },
      {
        section: 'listening',
        audio: 'They also give training every week.',
        q: '听力题：What does the new job provide besides salary?',
        options: ['Free meals', 'Weekly training', 'A company car', 'A free phone'],
        answer: 1,
        explain: '听力内容：they also give training every week.'
      },
      {
        section: 'listening',
        audio: 'A good interview is a two-way conversation: the employer asks questions, and you also ask about the role and the team.',
        q: '听力题：According to the speaker, what should you also do in an interview?',
        options: ['Stay silent all the time', 'Ask about the role and the team', 'Talk about salary only', 'Avoid all questions'],
        answer: 1,
        explain: '听力内容：you also ask about the role and the team.'
      },
      {
        section: 'vocab',
        q: '选出 interview 的正确释义：',
        options: ['面试，采访', '邀请', '投资', '发明'],
        answer: 0,
        explain: 'interview 意为“面试、采访”，如 a job interview（求职面试）。'
      },
      {
        section: 'vocab',
        q: '选出 employer 的正确释义：',
        options: ['雇主', '员工', '电梯', '邮件'],
        answer: 0,
        explain: 'employer 意为“雇主”，与 employee（雇员）相对。'
      },
      {
        section: 'speaking',
        q: '口语题（话题卡：Describe your work style）：请选出最自然的表达 —— “我喜欢和同事合作，因为团队协作能完成更大的项目。”',
        options: ['I like working with my colleagues because teamwork can finish bigger projects.', 'I like working with my colleagues because teamworking can finish more big projects.', 'With colleagues I like work, because teamwork finish bigger projects.', 'I like work with my colleagues because teamwork can finishing bigger projects.'],
        answer: 0,
        explain: 'like doing sth. + because 从句，teamwork 用词准确。'
      },
      {
        section: 'writing',
        q: '写作题：请选出最佳表达 —— “她拥有五年的工作经验。”',
        options: ['She has five years of work experience.', 'She have five years work experiences.', 'Her has five years of working experienced.', 'She has experience work of five year.'],
        answer: 0,
        explain: 'have 的第三人称单数 has + work experience 固定搭配。'
      },
      {
        section: 'speaking',
        q: '口语题（话题卡：Describe your dream job）：请选出最自然的表达 —— “我想成为一名医生，因为我想帮助别人。”',
        options: ['I want to be a doctor because I want to help people.', 'I want become doctor, because I help people want.', 'I wanting to be a doctor because helping people.', 'I want to be doctor because I want help people.'],
        answer: 0,
        explain: 'want to be + because 原因状语从句，表达自然。'
      }
    ]
  },
  {
    id: 's8_07',
    title: '旅行与文化 · 阅读',
    emoji: '🗺️',
    themeId: 's8_07',
    section: 'reading',
    description: '阅读旅行文化短文，完成理解与词汇题。',
    questions: [
      {
        section: 'reading',
        context: 'Traveling abroad teaches us more than sightseeing. When tourists visit a new place, they meet local customs and traditions. Trying local food, joining festivals, and talking with residents help visitors understand a culture deeply. Experts suggest that travelers arrange their trips to support local communities, for example by choosing small hotels and local transport. In this way, exchange between cultures becomes meaningful for both sides.',
        q: 'What does the passage mainly talk about?',
        options: ['Why travel is expensive', 'How travel helps us understand other cultures', 'The best hotels in the world', 'How to avoid tourists'],
        answer: 1,
        explain: '文章主旨：旅行不仅是观光，还能深入了解当地文化。'
      },
      {
        section: 'reading',
        q: 'According to the passage, how can visitors understand a culture deeply?',
        options: ['By staying in their hotel all day', 'By trying local food and talking with residents', 'By taking the same route as tourists', 'By ignoring local customs'],
        answer: 1,
        explain: '原文：Trying local food, joining festivals, and talking with residents help visitors understand a culture deeply.'
      },
      {
        section: 'reading',
        q: 'What does the writer suggest about choosing hotels?',
        options: ['Always choose international chains', 'Choose small hotels to support local communities', 'Choose the cheapest hotel', 'Avoid hotels completely'],
        answer: 1,
        explain: '原文：arrange their trips to support local communities, for example by choosing small hotels and local transport.'
      },
      {
        section: 'reading',
        q: 'The word "exchange" in the last sentence is closest in meaning to ______.',
        options: ['giving and receiving', 'buying and selling', 'coming and going', 'hiding and seeking'],
        answer: 0,
        explain: 'exchange 意为“交换、交流”，即给予并获得。'
      },
      {
        section: 'vocab',
        q: '选出 custom 的正确释义：',
        options: ['风俗习惯', '顾客', '海关人员', '好奇心'],
        answer: 0,
        explain: 'custom 意为“风俗习惯”，如 local customs（当地风俗）。'
      },
      {
        section: 'vocab',
        q: '选出 destination 的正确释义：',
        options: ['目的地', '字典', '发展', '方向'],
        answer: 0,
        explain: 'destination 意为“目的地”，如 the final destination（最终目的地）。'
      },
      {
        section: 'speaking',
        q: '口语题（话题卡：Describe a trip you took）：请选出最自然的表达 —— “旅途虽然很长，但一路的风景值得。”',
        options: ['Although the journey was long, the scenery along the way was worth it.', 'Although the journey was long, but the scenery was worth it.', 'The journey although long, scenery along way worth it.', 'Although the journey long, the scenery along the way worth.'],
        answer: 0,
        explain: 'although 不能与 but 连用，这是中文学习者最典型的错误之一。'
      },
      {
        section: 'writing',
        q: '写作题：请选出最佳表达 —— “去年我和家人去了一次难忘的旅行。”',
        options: ['Last year I went on an unforgettable trip with my family.', 'Last year I go on an unforgettable trip with my family.', 'Last year me and my family went on unforgettable trip.', 'I with my family go a unforgettable trip last year.'],
        answer: 0,
        explain: '过去时 went on a trip 搭配正确，unforgettable trip 地道。'
      },
      {
        section: 'speaking',
        q: '口语题（话题卡：Describe a place you want to visit）：请选出最自然的表达 —— “我想去云南，因为那里的风景太美了。”',
        options: ['I want to visit Yunnan because the scenery there is amazing.', 'I want visit Yunnan because scenery there amazing.', 'Yunnan I want to visit, scenery there is too beautiful.', 'I want to visiting Yunnan, because there scenery amazing.'],
        answer: 0,
        explain: 'want to visit + because 从句，scenery 用词准确。'
      }
    ]
  },
  {
    id: 's8_08',
    title: '家庭与情感 · 听力',
    emoji: '🏡',
    themeId: 's8_08',
    section: 'listening',
    description: '听一段家庭对话，完成理解题（点击喇叭听发音）。',
    questions: [
      {
        section: 'listening',
        audio: 'Mom: How was school today, Lily? Lily: Pretty good. We had a group project, and my classmates supported me a lot. Mom: That’s wonderful. Remember to thank them. Lily: I will. You know, I feel lucky to have such good friends. Mom: Friends are like family. We should trust each other and share happiness together.',
        q: '听力题：What did Lily do at school today?',
        options: ['She had a group project', 'She took a math test', 'She went on a trip', 'She played alone'],
        answer: 0,
        explain: '听力内容：We had a group project, and my classmates supported me a lot.'
      },
      {
        section: 'listening',
        audio: 'That’s wonderful. Remember to thank them.',
        q: '听力题：What does Mom tell Lily to do?',
        options: ['Stay quiet', 'Thank her classmates', 'Do more homework', 'Avoid her friends'],
        answer: 1,
        explain: '听力内容：Remember to thank them.'
      },
      {
        section: 'listening',
        audio: 'Friends are like family. We should trust each other and share happiness together.',
        q: '听力题：What does Mom compare friends to?',
        options: ['Teachers', 'Books', 'Family', 'Games'],
        answer: 2,
        explain: '听力内容：Friends are like family.'
      },
      {
        section: 'listening',
        audio: 'Mom: Do you remember Grandma’s birthday next week? Lily: Of course. I want to prepare a small gift and write her a card.',
        q: '听力题：What does Lily want to do for Grandma’s birthday?',
        options: ['Have a big party', 'Prepare a small gift and write a card', 'Buy a new phone', 'Take a trip'],
        answer: 1,
        explain: '听力内容：I want to prepare a small gift and write her a card.'
      },
      {
        section: 'vocab',
        q: '选出 support 的正确释义：',
        options: ['支持', '怀疑', '惊讶', '浪费'],
        answer: 0,
        explain: 'support 意为“支持”，如 support a dream（支持梦想）。'
      },
      {
        section: 'vocab',
        q: '选出 generation 的正确释义：',
        options: ['一代人', '礼物', '花园', '游戏'],
        answer: 0,
        explain: 'generation 意为“一代人”，如 the next generation（下一代）。'
      },
      {
        section: 'speaking',
        q: '口语题（话题卡：Describe a family tradition）：请选出最自然的表达 —— “每年春节，我们全家人一起包饺子。”',
        options: ['Every Spring Festival, our whole family makes dumplings together.', 'Every Spring Festival, our whole family making dumplings together.', 'Every Spring Festival our whole family make dumplings, together we.', 'In Spring Festival every year, our whole family makes dumpling together.'],
        answer: 0,
        explain: 'family 作整体用单数 makes，dumplings 用复数，表达自然。'
      },
      {
        section: 'writing',
        q: '写作题：请选出最佳表达 —— “家人总是鼓励我尝试新事物。”',
        options: ['My family always encourages me to try new things.', 'My family always encourage I to try new things.', 'My family always encouraging me trying new things.', 'My family always encourages me try new thing.'],
        answer: 0,
        explain: 'encourage sb. to do sth. 搭配正确，family 作整体用单数 encourages。'
      },
      {
        section: 'speaking',
        q: '口语题（话题卡：Describe a person you trust）：请选出最自然的表达 —— “我信任我最好的朋友，因为他总是诚实的。”',
        options: ['I trust my best friend because he is always honest.', 'I trust my best friend because he always honest.', 'My best friend I trust, because always he is honest.', 'I trusting my best friend, because he is honesty.'],
        answer: 0,
        explain: 'trust 后用 because 原因从句，honest 形容词作表语，表达自然。'
      }
    ]
  }
]

export function getAcademicWordsByTheme(themeId) {
  const idx = L8_THEMES.findIndex((t) => t.id === themeId)
  if (idx < 0) return []
  return getL8Words().slice(idx * 12, idx * 12 + 12)
}

export function getSimulationById(id) {
  return SIMULATIONS_L8.find((s) => s.id === id) || null
}

export default { L8_THEMES, SIMULATIONS_L8, getAcademicWordsByTheme, getSimulationById }
