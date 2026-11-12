/* ============================================================
   src/data/daily.js —— 每日一句（PLAN §3.4.6）
   按自然日从已解锁内容池推送 1 句，含英文/释义/重点词。
   来源覆盖：已学单词句、已学对话场景句、已学语法例句。
   开放条件：完成 L1 后开放（未开放显示锁定提示）。
   ============================================================ */

export const DAILY_SENTENCES = [
  /* L1 字母启蒙 */
  { key: 'd01', level: 1, en: 'Hello, world!', zh: '你好，世界！', tip: 'hello 是全世界最常用的问候语。' },
  { key: 'd02', level: 1, en: 'I am a student.', zh: '我是一名学生。', tip: 'am 用于 I 之后，表示"我是"。' },
  { key: 'd03', level: 1, en: 'This is a cat.', zh: '这是一只猫。', tip: 'this is 表示"这是"，用于介绍近处的事物。' },
  { key: 'd04', level: 1, en: 'A is for apple.', zh: 'A 代表苹果。', tip: '字母 A 在单词 apple 中发 /æ/。' },
  { key: 'd05', level: 1, en: 'I can read.', zh: '我会阅读。', tip: 'can 表示"能、会"，后接动词原形。' },

  /* L2 基础词汇 */
  { key: 'd06', level: 2, en: 'I have two apples.', zh: '我有两个苹果。', tip: 'two 表示数量"二"，后接名词复数。' },
  { key: 'd07', level: 2, en: 'My family is happy.', zh: '我的家人很快乐。', tip: 'family 意为"家庭、家人"。' },
  { key: 'd08', level: 2, en: 'The sky is blue.', zh: '天空是蓝色的。', tip: 'blue 意为"蓝色的"。' },
  { key: 'd09', level: 2, en: 'I like rice and eggs.', zh: '我喜欢米饭和鸡蛋。', tip: 'rice 和 egg 是常见食物词。' },
  { key: 'd10', level: 2, en: 'The dog runs fast.', zh: '狗跑得很快。', tip: 'dog 意为"狗"，fast 意为"快地"。' },
  { key: 'd11', level: 2, en: 'My head hurts.', zh: '我的头很疼。', tip: 'head 意为"头"，hurt 意为"疼痛"。' },
  { key: 'd12', level: 2, en: 'It is rainy today.', zh: '今天下雨。', tip: 'rainy 是 rain 的形容词形式，意为"下雨的"。' },
  { key: 'd13', level: 2, en: 'I go to school by bus.', zh: '我坐公交车上学。', tip: 'by bus 表示"乘坐公交车"。' },

  /* L3 日常对话 */
  { key: 'd14', level: 3, en: 'Nice to meet you.', zh: '很高兴认识你。', tip: '初次见面时的标准问候语。' },
  { key: 'd15', level: 3, en: 'Can I help you?', zh: '需要我帮忙吗？', tip: '服务员或店员常说的礼貌用语。' },
  { key: 'd16', level: 3, en: 'How much is this?', zh: '这个多少钱？', tip: '购物时询问价格的句型。' },
  { key: 'd17', level: 3, en: 'Excuse me, where is the station?', zh: '请问车站在哪里？', tip: '问路常用句式 where is...。' },
  { key: 'd18', level: 3, en: 'What would you like to eat?', zh: '你想吃点什么？', tip: '餐厅点餐时的常用问句。' },
  { key: 'd19', level: 3, en: 'See you tomorrow.', zh: '明天见。', tip: '道别用语，tomorrow 意为"明天"。' },
  { key: 'd20', level: 3, en: 'I would like a coffee, please.', zh: '请给我一杯咖啡。', tip: 'would like 比 want 更礼貌。' },

  /* L4 初级语法 */
  { key: 'd21', level: 4, en: 'She is reading a book now.', zh: '她正在读一本书。', tip: '现在进行时：be + 动词ing。' },
  { key: 'd22', level: 4, en: 'I watched a movie yesterday.', zh: '我昨天看了一部电影。', tip: '一般过去时：watched 是 watch 的过去式。' },
  { key: 'd23', level: 4, en: 'We will go to the park tomorrow.', zh: '我们明天将去公园。', tip: '一般将来时：will + 动词原形。' },
  { key: 'd24', level: 4, en: 'There are many books on the shelf.', zh: '书架上有很多书。', tip: 'there are 表示"有"（复数）。' },
  { key: 'd25', level: 4, en: 'He can swim very well.', zh: '他游泳游得很好。', tip: 'can 后接动词原形 swim。' },
  { key: 'd26', level: 4, en: 'This book is more interesting than that one.', zh: '这本书比那本更有趣。', tip: '比较级：more + 形容词 + than。' },
  { key: 'd27', level: 4, en: 'I have lived here for five years.', zh: '我在这里住了五年。', tip: '现在完成时：have + 过去分词。' },

  /* L5 中级词汇 */
  { key: 'd28', level: 5, en: 'Education changes our lives.', zh: '教育改变我们的人生。', tip: 'education 意为"教育"。' },
  { key: 'd29', level: 5, en: 'Regular exercise keeps you healthy.', zh: '规律运动使你保持健康。', tip: 'exercise 意为"锻炼"，healthy 意为"健康的"。' },
  { key: 'd30', level: 5, en: 'She is looking for a better job.', zh: '她在寻找一份更好的工作。', tip: 'look for 意为"寻找"。' },
  { key: 'd31', level: 5, en: 'Technology develops very fast.', zh: '科技发展非常快。', tip: 'technology 意为"科技"。' },
  { key: 'd32', level: 5, en: 'Travel broadens the mind.', zh: '旅行开阔眼界。', tip: 'travel 意为"旅行"。' },
  { key: 'd33', level: 5, en: 'We should protect the environment.', zh: '我们应该保护环境。', tip: 'protect 意为"保护"，environment 意为"环境"。' },
  { key: 'd34', level: 5, en: 'The restaurant is famous for its food.', zh: '这家餐厅以美食闻名。', tip: 'be famous for 意为"因……而闻名"。' },

  /* L6 听说进阶 */
  { key: 'd35', level: 6, en: 'Could you speak more slowly, please?', zh: '请你说得慢一点好吗？', tip: '听力交际中请求放慢语速的句子。' },
  { key: 'd36', level: 6, en: 'I missed the bus this morning.', zh: '今天早上我错过了公交车。', tip: 'miss 此处意为"错过"。' },
  { key: 'd37', level: 6, en: 'The train will arrive in ten minutes.', zh: '火车将在十分钟后到达。', tip: 'arrive 意为"到达"。' },
  { key: 'd38', level: 6, en: 'Could you repeat that, please?', zh: '请你再说一遍好吗？', tip: '听力中没听清时的礼貌请求。' },
  { key: 'd39', level: 6, en: 'She speaks English with confidence.', zh: '她说英语很有自信。', tip: 'confidence 意为"信心"。' },
  { key: 'd40', level: 6, en: 'I am looking forward to the trip.', zh: '我盼望着这次旅行。', tip: 'look forward to 后接名词或动名词。' },

  /* L7 高级阅读写作 */
  { key: 'd41', level: 7, en: 'Reading broadens your horizons.', zh: '阅读开阔你的视野。', tip: 'horizon 意为"视野、眼界"。' },
  { key: 'd42', level: 7, en: 'The article argues that technology brings both benefits and risks.', zh: '这篇文章主张技术既带来益处也带来风险。', tip: 'argue that 意为"主张、论证"。' },
  { key: 'd43', level: 7, en: 'A strong conclusion summarizes the main points.', zh: '有力的结论应总结要点。', tip: 'conclusion 意为"结论"。' },
  { key: 'd44', level: 7, en: 'Despite the difficulties, she never gave up.', zh: '尽管困难重重，她从未放弃。', tip: 'despite 意为"尽管"，后接名词。' },
  { key: 'd45', level: 7, en: 'The evidence supports the author\'s viewpoint.', zh: '证据支持作者的观点。', tip: 'evidence 意为"证据"。' },
  { key: 'd46', level: 7, en: 'Effective writing requires clear organization.', zh: '有效的写作需要清晰的组织结构。', tip: 'effective 意为"有效的"。' },

  /* L8 托福雅思仿真 */
  { key: 'd47', level: 8, en: 'Academic success depends on consistent effort.', zh: '学术成功取决于持续的努力。', tip: 'academic 意为"学术的"。' },
  { key: 'd48', level: 8, en: 'Researchers analyzed the data carefully.', zh: '研究者仔细分析了数据。', tip: 'analyze 意为"分析"。' },
  { key: 'd49', level: 8, en: 'The lecture provided an overview of the topic.', zh: '讲座提供了该主题的概述。', tip: 'overview 意为"概述"。' },
  { key: 'd50', level: 8, en: 'Climate change poses a global challenge.', zh: '气候变化构成全球性挑战。', tip: 'pose a challenge 意为"构成挑战"。' },
  { key: 'd51', level: 8, en: 'The study emphasizes the importance of early education.', zh: '该研究强调早期教育的重要性。', tip: 'emphasize 意为"强调"。' },
  { key: 'd52', level: 8, en: 'Applicants must submit their essays before the deadline.', zh: '申请者必须在截止日期前提交论文。', tip: 'deadline 意为"截止日期"。' },
  { key: 'd53', level: 8, en: 'Urbanization brings both opportunities and problems.', zh: '城市化既带来机遇也带来问题。', tip: 'urbanization 意为"城市化"。' },
  { key: 'd54', level: 8, en: 'The government implemented new policies to reduce pollution.', zh: '政府实施新政策以减少污染。', tip: 'implement 意为"实施"。' },
  { key: 'd55', level: 8, en: 'Experts predict a significant increase in demand.', zh: '专家预测需求将显著增长。', tip: 'predict 意为"预测"。' },
  { key: 'd56', level: 8, en: 'The experiment yielded surprising results.', zh: '实验产生了令人惊讶的结果。', tip: 'yield 意为"产生、得出"。' },
  { key: 'd57', level: 8, en: 'International trade influences economic growth.', zh: '国际贸易影响经济增长。', tip: 'influence 意为"影响"。' },
  { key: 'd58', level: 8, en: 'The author concludes that education is the key to progress.', zh: '作者得出结论：教育是进步的关键。', tip: 'conclude 意为"得出结论"。' },
  { key: 'd59', level: 8, en: 'Cultural diversity enriches our society.', zh: '文化多样性丰富我们的社会。', tip: 'diversity 意为"多样性"。' },
  { key: 'd60', level: 8, en: 'A balanced diet contributes to overall health.', zh: '均衡饮食有助于整体健康。', tip: 'contribute to 意为"有助于"。' }
]

export const DAILY_UNLOCK_LEVEL = 1 // 完成 L1 后开放

/* 按自然日取当日句子（固定 hash，同一天内稳定） */
export function getDailySentenceByDate(d = new Date()) {
  const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
  let hash = 0
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) % 1000000007
  }
  return DAILY_SENTENCES[hash % DAILY_SENTENCES.length]
}
