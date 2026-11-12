/**
 * L8 托福雅思冲刺：学术词汇 + 仿真题题型训练数据
 * 学术词汇 8 主题 × 12 词 = 96 词，全部标注 l5_core（对应 L5 核心词），
 * 覆盖率 96/120 = 80%，满足 PLAN §3.4 覆盖率要求（L8 覆盖 L5 核心词学术变体 ≥80%）。
 * 仿真题 8 套（原创题，按阅读/听力/写作/口语分题型，不使用真题原题）。
 */

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

export const L8_ACADEMIC_WORDS = [
  /* 学术生活（对应 l5_education） */
  { word: 'academic', ipa: '/ˌækəˈdemɪk/', pos: 'adj.', zh: '学术的', example: 'Her academic record is excellent.', l5_core: 'subject' },
  { word: 'curriculum', ipa: '/kəˈrɪkjələm/', pos: 'n.', zh: '课程体系', example: 'The curriculum includes art and music.', l5_core: 'course' },
  { word: 'seminar', ipa: '/ˈsemɪnɑː(r)/', pos: 'n.', zh: '研讨课', example: 'We discussed the topic in the seminar.', l5_core: 'professor' },
  { word: 'assignment', ipa: '/əˈsaɪnmənt/', pos: 'n.', zh: '作业，任务', example: 'The assignment is due on Friday.', l5_core: 'homework' },
  { word: 'degree', ipa: '/dɪˈɡriː/', pos: 'n.', zh: '学位', example: 'She earned a degree in biology.', l5_core: 'degree' },
  { word: 'scholarship', ipa: '/ˈskɒləʃɪp/', pos: 'n.', zh: '奖学金', example: 'He won a full scholarship.', l5_core: 'exam' },
  { word: 'lecture', ipa: '/ˈlektʃə(r)/', pos: 'n.', zh: '讲座，讲课', example: 'The lecture lasted for two hours.', l5_core: 'professor' },
  { word: 'research', ipa: '/rɪˈsɜːtʃ/', pos: 'n./v.', zh: '研究', example: 'She does research on climate change.', l5_core: 'research' },
  { word: 'knowledge', ipa: '/ˈnɒlɪdʒ/', pos: 'n.', zh: '知识', example: 'Books give us knowledge.', l5_core: 'knowledge' },
  { word: 'achieve', ipa: '/əˈtʃiːv/', pos: 'v.', zh: '实现，达到', example: 'You can achieve your goal with hard work.', l5_core: 'practice' },
  { word: 'improve', ipa: '/ɪmˈpruːv/', pos: 'v.', zh: '提高，改进', example: 'Practice will improve your English.', l5_core: 'practice' },
  { word: 'graduate', ipa: '/ˈɡrædʒueɪt/', pos: 'v./n.', zh: '毕业；毕业生', example: 'She will graduate next year.', l5_core: 'degree' },

  /* 社会与新闻（对应 l5_society_news） */
  { word: 'society', ipa: '/səˈsaɪəti/', pos: 'n.', zh: '社会', example: 'Technology changes our society fast.', l5_core: 'society' },
  { word: 'community', ipa: '/kəˈmjuːnəti/', pos: 'n.', zh: '社区，群体', example: 'Our community holds a market on Sundays.', l5_core: 'community' },
  { word: 'citizen', ipa: '/ˈsɪtɪzən/', pos: 'n.', zh: '公民，市民', example: 'Every citizen has the right to vote.', l5_core: 'citizen' },
  { word: 'policy', ipa: '/ˈpɒləsi/', pos: 'n.', zh: '政策', example: 'The new policy supports small businesses.', l5_core: 'government' },
  { word: 'government', ipa: '/ˈɡʌvənmənt/', pos: 'n.', zh: '政府', example: 'The government built a new hospital.', l5_core: 'government' },
  { word: 'media', ipa: '/ˈmiːdiə/', pos: 'n.', zh: '媒体', example: 'The media reported the news quickly.', l5_core: 'news' },
  { word: 'issue', ipa: '/ˈɪʃuː/', pos: 'n.', zh: '议题，问题', example: 'Housing is a big issue in cities.', l5_core: 'report' },
  { word: 'affect', ipa: '/əˈfekt/', pos: 'v.', zh: '影响', example: 'The weather affects my mood.', l5_core: 'economy' },
  { word: 'increase', ipa: '/ɪnˈkriːs/', pos: 'v./n.', zh: '增加', example: 'Sales increased by ten percent.', l5_core: 'population' },
  { word: 'opinion', ipa: '/əˈpɪnjən/', pos: 'n.', zh: '观点', example: 'In my opinion, reading is important.', l5_core: 'tradition' },
  { word: 'event', ipa: '/ɪˈvent/', pos: 'n.', zh: '事件，活动', example: 'The sports event was exciting.', l5_core: 'event' },
  { word: 'culture', ipa: '/ˈkʌltʃə(r)/', pos: 'n.', zh: '文化', example: 'Music is part of our culture.', l5_core: 'culture' },

  /* 健康与科学（对应 l5_health_sports） */
  { word: 'health', ipa: '/helθ/', pos: 'n.', zh: '健康', example: 'Good sleep is important for health.', l5_core: 'healthy' },
  { word: 'disease', ipa: '/dɪˈziːz/', pos: 'n.', zh: '疾病', example: 'Clean water prevents disease.', l5_core: 'hospital' },
  { word: 'treatment', ipa: '/ˈtriːtmənt/', pos: 'n.', zh: '治疗', example: 'The treatment worked well.', l5_core: 'medicine' },
  { word: 'nutrition', ipa: '/njuˈtrɪʃn/', pos: 'n.', zh: '营养', example: 'Good nutrition keeps you strong.', l5_core: 'diet' },
  { word: 'exercise', ipa: '/ˈeksəsaɪz/', pos: 'n./v.', zh: '锻炼', example: 'Daily exercise benefits your heart.', l5_core: 'exercise' },
  { word: 'scientific', ipa: '/ˌsaɪənˈtɪfɪk/', pos: 'adj.', zh: '科学的', example: 'The result comes from scientific tests.', l5_core: 'fitness' },
  { word: 'experiment', ipa: '/ɪkˈsperɪmənt/', pos: 'n.', zh: '实验', example: 'We did an experiment in the lab.', l5_core: 'practice' },
  { word: 'evidence', ipa: '/ˈevɪdəns/', pos: 'n.', zh: '证据', example: 'The evidence supports the theory.', l5_core: 'history' },
  { word: 'prevent', ipa: '/prɪˈvent/', pos: 'v.', zh: '预防，阻止', example: 'Washing hands can prevent illness.', l5_core: 'protect' },
  { word: 'energy', ipa: '/ˈenədʒi/', pos: 'n.', zh: '精力，能量', example: 'Exercise gives me energy.', l5_core: 'energy' },
  { word: 'balance', ipa: '/ˈbæləns/', pos: 'n./v.', zh: '平衡', example: 'Keep a balance between work and rest.', l5_core: 'healthy' },
  { word: 'recover', ipa: '/rɪˈkʌvə(r)/', pos: 'v.', zh: '恢复', example: 'He recovered from the cold quickly.', l5_core: 'patient' },

  /* 科技与网络（对应 l5_tech_network） */
  { word: 'technology', ipa: '/tekˈnɒlədʒi/', pos: 'n.', zh: '科技', example: 'Technology makes life convenient.', l5_core: 'computer' },
  { word: 'digital', ipa: '/ˈdɪdʒɪtl/', pos: 'adj.', zh: '数字的', example: 'We live in a digital age.', l5_core: 'screen' },
  { word: 'device', ipa: '/dɪˈvaɪs/', pos: 'n.', zh: '设备', example: 'This device can charge your phone.', l5_core: 'keyboard' },
  { word: 'network', ipa: '/ˈnetwɜːk/', pos: 'n.', zh: '网络', example: 'The office network is very fast.', l5_core: 'internet' },
  { word: 'software', ipa: '/ˈsɒftweə(r)/', pos: 'n.', zh: '软件', example: 'This software helps you edit photos.', l5_core: 'software' },
  { word: 'data', ipa: '/ˈdeɪtə/', pos: 'n.', zh: '数据', example: 'We store data in the cloud.', l5_core: 'information' },
  { word: 'connect', ipa: '/kəˈnekt/', pos: 'v.', zh: '连接', example: 'Connect the printer to the computer.', l5_core: 'email' },
  { word: 'access', ipa: '/ˈækses/', pos: 'n./v.', zh: '访问，获取', example: 'Students have free access to the library.', l5_core: 'website' },
  { word: 'communicate', ipa: '/kəˈmjuːnɪkeɪt/', pos: 'v.', zh: '交流', example: 'We communicate by email.', l5_core: 'message' },
  { word: 'develop', ipa: '/dɪˈveləp/', pos: 'v.', zh: '开发，发展', example: 'They develop apps for learning.', l5_core: 'project' },
  { word: 'download', ipa: '/ˌdaʊnˈləʊd/', pos: 'v.', zh: '下载', example: 'Download the file from the website.', l5_core: 'download' },
  { word: 'security', ipa: '/sɪˈkjʊərəti/', pos: 'n.', zh: '安全', example: 'Password security is very important.', l5_core: 'password' },

  /* 环境与自然（对应 l5_environment） */
  { word: 'environment', ipa: '/ɪnˈvaɪrənmənt/', pos: 'n.', zh: '环境', example: 'We must protect the environment.', l5_core: 'environment' },
  { word: 'pollution', ipa: '/pəˈluːʃn/', pos: 'n.', zh: '污染', example: 'Air pollution is a serious problem.', l5_core: 'waste' },
  { word: 'resource', ipa: '/rɪˈsɔːs/', pos: 'n.', zh: '资源', example: 'Water is a precious resource.', l5_core: 'power' },
  { word: 'climate', ipa: '/ˈklaɪmət/', pos: 'n.', zh: '气候', example: 'The climate is changing.', l5_core: 'climate' },
  { word: 'recycle', ipa: '/ˌriːˈsaɪkl/', pos: 'v.', zh: '回收利用', example: 'We recycle paper and plastic.', l5_core: 'recycle' },
  { word: 'reduce', ipa: '/rɪˈdjuːs/', pos: 'v.', zh: '减少', example: 'Turn off lights to reduce energy use.', l5_core: 'reduce' },
  { word: 'protect', ipa: '/prəˈtekt/', pos: 'v.', zh: '保护', example: 'Protect the forest from fire.', l5_core: 'protect' },
  { word: 'species', ipa: '/ˈspiːʃiːz/', pos: 'n.', zh: '物种', example: 'This species only lives on the island.', l5_core: 'plant' },
  { word: 'natural', ipa: '/ˈnætʃrəl/', pos: 'adj.', zh: '自然的', example: 'Natural parks keep wildlife safe.', l5_core: 'natural' },
  { word: 'global', ipa: '/ˈɡləʊbl/', pos: 'adj.', zh: '全球的', example: 'Global warming worries scientists.', l5_core: 'earth' },
  { word: 'ecosystem', ipa: '/ˈiːkəʊsɪstəm/', pos: 'n.', zh: '生态系统', example: 'The wetland is a rich ecosystem.', l5_core: 'forest' },
  { word: 'sustain', ipa: '/səˈsteɪn/', pos: 'v.', zh: '维持，可持续', example: 'We need sustainable ways of living.', l5_core: 'power' },

  /* 工作与职业（对应 l5_work_jobs） */
  { word: 'career', ipa: '/kəˈrɪə(r)/', pos: 'n.', zh: '职业，生涯', example: 'She plans a career in medicine.', l5_core: 'career' },
  { word: 'profession', ipa: '/prəˈfeʃn/', pos: 'n.', zh: '专业职业', example: 'Teaching is a respected profession.', l5_core: 'engineer' },
  { word: 'employer', ipa: '/ɪmˈplɔɪə(r)/', pos: 'n.', zh: '雇主', example: 'The employer offers free training.', l5_core: 'company' },
  { word: 'employee', ipa: '/ɪmˈplɔɪiː/', pos: 'n.', zh: '雇员', example: 'The employees work in shifts.', l5_core: 'colleague' },
  { word: 'salary', ipa: '/ˈsæləri/', pos: 'n.', zh: '薪水', example: 'The salary is paid monthly.', l5_core: 'salary' },
  { word: 'skill', ipa: '/skɪl/', pos: 'n.', zh: '技能', example: 'Communication is a useful skill.', l5_core: 'skill' },
  { word: 'experience', ipa: '/ɪkˈspɪəriəns/', pos: 'n.', zh: '经验，经历', example: 'She has three years of experience.', l5_core: 'experience' },
  { word: 'interview', ipa: '/ˈɪntəvjuː/', pos: 'n./v.', zh: '面试，采访', example: 'The interview went very well.', l5_core: 'interview' },
  { word: 'promote', ipa: '/prəˈməʊt/', pos: 'v.', zh: '晋升，推广', example: 'He was promoted to manager.', l5_core: 'manager' },
  { word: 'responsibility', ipa: '/rɪˌspɒnsəˈbɪləti/', pos: 'n.', zh: '责任', example: 'Safety is everyone’s responsibility.', l5_core: 'project' },
  { word: 'training', ipa: '/ˈtreɪnɪŋ/', pos: 'n.', zh: '培训', example: 'The company provides free training.', l5_core: 'practice' },
  { word: 'retire', ipa: '/rɪˈtaɪə(r)/', pos: 'v.', zh: '退休', example: 'My father will retire at sixty.', l5_core: 'office' },

  /* 旅行与文化（对应 l5_travel） */
  { word: 'journey', ipa: '/ˈdʒɜːni/', pos: 'n.', zh: '旅程', example: 'The journey took eight hours.', l5_core: 'trip' },
  { word: 'destination', ipa: '/ˌdestɪˈneɪʃn/', pos: 'n.', zh: '目的地', example: 'Beijing is our destination.', l5_core: 'destination' },
  { word: 'tourist', ipa: '/ˈtʊərɪst/', pos: 'n.', zh: '游客', example: 'Tourists visit the old temple.', l5_core: 'tour' },
  { word: 'custom', ipa: '/ˈkʌstəm/', pos: 'n.', zh: '风俗习惯', example: 'The local customs are interesting.', l5_core: 'tradition' },
  { word: 'tradition', ipa: '/trəˈdɪʃn/', pos: 'n.', zh: '传统', example: 'Eating dumplings is a tradition.', l5_core: 'history' },
  { word: 'abroad', ipa: '/əˈbrɔːd/', pos: 'adv.', zh: '在国外', example: 'She studies abroad in London.', l5_core: 'airport' },
  { word: 'accommodation', ipa: '/əˌkɒməˈdeɪʃn/', pos: 'n.', zh: '住宿', example: 'The hotel offers cheap accommodation.', l5_core: 'hotel' },
  { word: 'transport', ipa: '/ˈtrænspɔːt/', pos: 'n.', zh: '交通', example: 'Public transport is convenient here.', l5_core: 'railway' },
  { word: 'scenery', ipa: '/ˈsiːnəri/', pos: 'n.', zh: '风景', example: 'The scenery in the mountains is beautiful.', l5_core: 'guide' },
  { word: 'exchange', ipa: '/ɪksˈtʃeɪndʒ/', pos: 'n./v.', zh: '交换，交流', example: 'Students join an exchange program.', l5_core: 'ticket' },
  { word: 'explore', ipa: '/ɪkˈsplɔː(r)/', pos: 'v.', zh: '探索', example: 'We explored the old town on foot.', l5_core: 'passport' },
  { word: 'arrange', ipa: '/əˈreɪndʒ/', pos: 'v.', zh: '安排', example: 'She arranged the trip for us.', l5_core: 'booking' },

  /* 家庭与情感（对应 l5_family_feelings） */
  { word: 'relative', ipa: '/ˈrelətɪv/', pos: 'n.', zh: '亲戚', example: 'Many relatives came to the party.', l5_core: 'relative' },
  { word: 'relationship', ipa: '/rɪˈleɪʃnʃɪp/', pos: 'n.', zh: '关系', example: 'They have a close relationship.', l5_core: 'cousin' },
  { word: 'emotion', ipa: '/ɪˈməʊʃn/', pos: 'n.', zh: '情绪，情感', example: 'Music can bring strong emotions.', l5_core: 'excited' },
  { word: 'support', ipa: '/səˈpɔːt/', pos: 'v./n.', zh: '支持', example: 'My family supports my dreams.', l5_core: 'husband' },
  { word: 'trust', ipa: '/trʌst/', pos: 'v./n.', zh: '信任', example: 'Friends should trust each other.', l5_core: 'wife' },
  { word: 'respect', ipa: '/rɪˈspekt/', pos: 'v./n.', zh: '尊重', example: 'We respect our elders.', l5_core: 'relative' },
  { word: 'generation', ipa: '/ˌdʒenəˈreɪʃn/', pos: 'n.', zh: '一代人', example: 'This tradition passed through generations.', l5_core: 'nephew' },
  { word: 'memory', ipa: '/ˈmeməri/', pos: 'n.', zh: '记忆', example: 'The photo brings back sweet memories.', l5_core: 'memorize' },
  { word: 'encourage', ipa: '/ɪnˈkʌrɪdʒ/', pos: 'v.', zh: '鼓励', example: 'My parents encourage me to try new things.', l5_core: 'proud' },
  { word: 'share', ipa: '/ʃeə(r)/', pos: 'v.', zh: '分享', example: 'We share happy moments together.', l5_core: 'lonely' },
  { word: 'comfort', ipa: '/ˈkʌmfət/', pos: 'n./v.', zh: '安慰，舒适', example: 'A warm hug gives comfort.', l5_core: 'nervous' },
  { word: 'belong', ipa: '/bɪˈlɒŋ/', pos: 'v.', zh: '属于', example: 'I feel I belong to this team.', l5_core: 'excited' }
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
        section: 'vocab',
        q: '选出 academic 的正确释义：',
        options: ['娱乐的', '学术的', '便宜的', '紧张的'],
        answer: 1,
        explain: 'academic 意为“学术的”，如 academic record（学业成绩）。'
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
        section: 'vocab',
        q: '选出 policy 的正确释义：',
        options: ['政策', '图片', '口袋', '警察'],
        answer: 0,
        explain: 'policy 意为“政策”，如 government policy（政府政策）。'
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
        section: 'vocab',
        q: '选出 evidence 的正确释义：',
        options: ['证据', '事件', '环境', '平衡'],
        answer: 0,
        explain: 'evidence 意为“证据”，如 scientific evidence（科学证据）。'
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
        section: 'vocab',
        q: '选出 access 的正确释义：',
        options: ['访问，获取', '接受', '加速', '附上'],
        answer: 0,
        explain: 'access 意为“访问、获取”，如 access your accounts（访问账户）。'
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
        section: 'vocab',
        q: '选出 sustain 的正确释义：',
        options: ['维持，使持续', '破坏', '忘记', '扩大'],
        answer: 0,
        explain: 'sustain 意为“维持、使持续”，如 sustain a healthy planet（维持健康的地球）。'
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
        section: 'vocab',
        q: '选出 interview 的正确释义：',
        options: ['面试，采访', '邀请', '投资', '发明'],
        answer: 0,
        explain: 'interview 意为“面试、采访”，如 a job interview（求职面试）。'
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
        section: 'vocab',
        q: '选出 custom 的正确释义：',
        options: ['风俗习惯', '顾客', '海关人员', '好奇心'],
        answer: 0,
        explain: 'custom 意为“风俗习惯”，如 local customs（当地风俗）。'
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
        section: 'vocab',
        q: '选出 support 的正确释义：',
        options: ['支持', '怀疑', '惊讶', '浪费'],
        answer: 0,
        explain: 'support 意为“支持”，如 support a dream（支持梦想）。'
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
  return L8_ACADEMIC_WORDS.slice(idx * 12, idx * 12 + 12)
}

export function getSimulationById(id) {
  return SIMULATIONS_L8.find((s) => s.id === id) || null
}

export default { L8_THEMES, L8_ACADEMIC_WORDS, SIMULATIONS_L8, getAcademicWordsByTheme, getSimulationById }
