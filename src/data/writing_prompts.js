/**
 * src/data/writing_prompts.js —— 写作与翻译练习题目库
 * type: 'writing'（英文作文，带提示与要求）/ 'translation'（汉译英，逐句批改）
 * 每题含写作提示（hints）与参考答案（reference），供 AI 批改对照。
 */

export const WRITING_PROMPTS = [
  {
    id: 'w01',
    type: 'writing',
    genre: '应用文',
    emoji: '📧',
    title: '给笔友的介绍信',
    prompt: '写一封 80–120 词的英文短信给你的英国笔友 Tom，介绍你最近的一次周末活动，并邀请他暑假来你的城市游玩。',
    hints: ['开头问候并说明写信目的', '描述周末做了什么（1–2 件事）', '发出邀请并说明理由', '结尾期待回信'],
    reference: 'Dear Tom, I hope you are doing well. Last weekend I visited the new science museum with my classmates, and we watched a wonderful show about the stars. In the afternoon we walked along the river and took many photos. I would love to invite you to visit my city this summer. You could stay at my home and we could visit the museum together. Please write back soon. Best wishes, Li Hua'
  },
  {
    id: 'w02',
    type: 'writing',
    genre: '议论文',
    emoji: '📱',
    title: '中学生该不该带手机上学',
    prompt: 'Write a short essay (100–130 words) about whether middle school students should be allowed to bring smartphones to school. Give two reasons for your opinion and one suggestion to your school.',
    hints: ['先表明你的观点', '用 First / Second 组织两个理由', '可以承认对方的观点再反驳', '结尾给学校一条具体建议'],
    reference: 'In my opinion, students should not bring smartphones to school. First, phones distract us from lessons: notifications and games are hard to resist during class. Second, carrying an expensive phone can lead to comparison or even theft, which is bad for a friendly campus atmosphere. Instead of banning phones completely, our school could offer tablets in the library so that students can look up information when they truly need it. In this way we keep the benefits of technology while protecting our attention.'
  },
  {
    id: 'w03',
    type: 'writing',
    genre: '看图描述',
    emoji: '🏞️',
    title: '描述一次难忘的旅行',
    prompt: 'Describe a memorable trip in 90–120 words: where you went, what you saw or did, and why it was unforgettable.',
    hints: ['交代时间地点', '用过去时叙述一两个具体场景', '加入一两个感官细节（声音、气味、景色）', '结尾点明难忘的原因'],
    reference: 'Last October, my family travelled to a small mountain village for three days. On the first morning, we climbed a narrow path through golden trees and reached a quiet waterfall. The air was cold and fresh, and I could hear nothing except water and birds. We tasted local bread baked by an old grandmother, who told us stories about the mountain. The trip was unforgettable because it was the first time I felt so far from city noise — for three days, time seemed to slow down.'
  },
  {
    id: 'w04',
    type: 'writing',
    genre: '议论文',
    emoji: '🤖',
    title: 'AI 会取代翻译工作吗',
    prompt: 'Some people think AI translation tools will soon replace human translators. Write an essay of 110–140 words stating whether you agree, with two supporting reasons.',
    hints: ['开头改写题目观点并亮明态度', 'Reason 1: 语言的文化细节、幽默、语气', 'Reason 2: 专业场合的责任与准确性（合同、医疗）', '结尾承认 AI 的作用但总结人的价值'],
    reference: 'AI translation tools have improved rapidly, but I do not believe they will replace human translators soon. First, language carries culture: humour, politeness and double meanings still confuse machines, while a human reader feels them immediately. Second, in serious fields such as law or medicine, a single wrong sentence may cause real harm, so a responsible professional must check every word. Of course, AI is a powerful helper — translators now work faster with it. Yet the final judgement about meaning, tone and risk remains a human task.'
  },
  {
    id: 'w05',
    type: 'writing',
    genre: '应用文',
    emoji: '📋',
    title: '英文社团招募启事',
    prompt: 'Your school English club needs new members. Write a notice (80–110 words): what the club does, when it meets, who can join, and how to sign up.',
    hints: ['标题写 Notice', '介绍社团活动（演讲、电影、辩论等）', '写清楚时间地点', '写报名方式与截止日期'],
    reference: 'Notice: The English Club is now looking for new members! We practise spoken English through free talks, movie nights and friendly debates every Wednesday afternoon in Room 302. Members also help organise the school English festival in December. Any student who is interested in English is welcome — no perfect pronunciation required, just curiosity and team spirit. To join, write your name and class on the sign-up sheet outside the library before 20 September, or send a message to our teacher, Ms. Wang. Come and make English fun!'
  },
  {
    id: 'w06',
    type: 'writing',
    genre: '议论文',
    emoji: '🌍',
    title: '个人如何参与环保',
    prompt: 'Write about what ordinary people can do to protect the environment (100–130 words). Choose two actions and explain why they matter.',
    hints: ['不要写成空喊口号', 'Action 1: 减少一次性塑料（自带杯子/布袋）', 'Action 2: 绿色出行或节约用电', '用具体的数字或场景增强说服力'],
    reference: 'Ordinary people can protect the environment through small daily choices. First, refusing single-use plastics makes a real difference: one reusable bottle can replace hundreds of plastic ones every year, and less plastic means cleaner rivers and oceans. Second, choosing greener transport matters. Walking, cycling or taking the bus for short trips cuts both air pollution and traffic noise in our neighbourhoods. These actions look tiny from one person\'s view, but when thousands of families do them together, they change the city we all live in.'
  },
  {
    id: 't01',
    type: 'translation',
    genre: '汉译英',
    emoji: '🈶',
    title: '日常表达翻译（5 句）',
    prompt: '把下面 5 句中文翻译成英文，注意时态与搭配：\n1. 我已经三年没有见过他了。\n2. 这部电影比我想象的更感人。\n3. 只要坚持练习，你的发音就会进步。\n4. 他不仅会说英语，还会说日语。\n5. 雨停之后我们就出发。',
    hints: ['第 1 句用现在完成时 + for', '第 2 句用比较级 + than', '第 3 句用 as long as 条件句', '第 4 句用 not only...but also', '第 5 句用 after / as soon as 时间从句'],
    reference: '1. I have not seen him for three years. 2. This film is more moving than I expected. 3. As long as you keep practising, your pronunciation will improve. 4. He can speak not only English but also Japanese. 5. We will set off as soon as the rain stops.'
  },
  {
    id: 't02',
    type: 'translation',
    genre: '汉译英',
    emoji: '🈶',
    title: '观点表达翻译（5 句）',
    prompt: '把下面 5 句中文翻译成英文，注意句式多样化：\n1. 越来越多的年轻人选择在家工作。\n2. 这次展览值得一看。\n3. 无论多忙，他每天都会读书。\n4. 正是他的努力使这个项目成功了。\n5. 毫无疑问，科技改变了我们的生活方式。',
    hints: ['第 1 句用 more and more / an increasing number of', '第 2 句用 be worth doing', '第 3 句用 no matter how + adj.', '第 4 句用强调句 It is...that', '第 5 句用 There is no doubt that'],
    reference: '1. More and more young people choose to work from home. 2. This exhibition is worth visiting. 3. No matter how busy he is, he reads every day. 4. It was his effort that made the project a success. 5. There is no doubt that technology has changed the way we live.'
  }
]

export function getWritingPromptById(id) {
  return WRITING_PROMPTS.find((p) => p.id === id) || null
}

export default { WRITING_PROMPTS, getWritingPromptById }
