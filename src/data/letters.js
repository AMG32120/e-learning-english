/* ============================================================
   src/data/letters.js —— L1 字母启蒙内容数据（只读，随构建发布）
   26 字母 / 48 音标（元音 20 + 辅音 28）/ 自然拼读规则与词表
   ============================================================ */

/* ---------- 26 个英文字母 ---------- */
export const LETTERS = [
  { lower: 'a', upper: 'A', name: 'A', letterIpa: '/eɪ/', example: 'apple', exampleIpa: '/ˈæpl/', zh: '苹果' },
  { lower: 'b', upper: 'B', name: 'B', letterIpa: '/biː/', example: 'boy', exampleIpa: '/bɔɪ/', zh: '男孩' },
  { lower: 'c', upper: 'C', name: 'C', letterIpa: '/siː/', example: 'cat', exampleIpa: '/kæt/', zh: '猫' },
  { lower: 'd', upper: 'D', name: 'D', letterIpa: '/diː/', example: 'dog', exampleIpa: '/dɒg/', zh: '狗' },
  { lower: 'e', upper: 'E', name: 'E', letterIpa: '/iː/', example: 'egg', exampleIpa: '/eɡ/', zh: '鸡蛋' },
  { lower: 'f', upper: 'F', name: 'F', letterIpa: '/ef/', example: 'fish', exampleIpa: '/fɪʃ/', zh: '鱼' },
  { lower: 'g', upper: 'G', name: 'G', letterIpa: '/dʒiː/', example: 'girl', exampleIpa: '/ɡɜːl/', zh: '女孩' },
  { lower: 'h', upper: 'H', name: 'H', letterIpa: '/eɪtʃ/', example: 'hat', exampleIpa: '/hæt/', zh: '帽子' },
  { lower: 'i', upper: 'I', name: 'I', letterIpa: '/aɪ/', example: 'ink', exampleIpa: '/ɪŋk/', zh: '墨水' },
  { lower: 'j', upper: 'J', name: 'J', letterIpa: '/dʒeɪ/', example: 'jump', exampleIpa: '/dʒʌmp/', zh: '跳' },
  { lower: 'k', upper: 'K', name: 'K', letterIpa: '/keɪ/', example: 'kite', exampleIpa: '/kaɪt/', zh: '风筝' },
  { lower: 'l', upper: 'L', name: 'L', letterIpa: '/el/', example: 'leg', exampleIpa: '/leɡ/', zh: '腿' },
  { lower: 'm', upper: 'M', name: 'M', letterIpa: '/em/', example: 'milk', exampleIpa: '/mɪlk/', zh: '牛奶' },
  { lower: 'n', upper: 'N', name: 'N', letterIpa: '/en/', example: 'nose', exampleIpa: '/nəʊz/', zh: '鼻子' },
  { lower: 'o', upper: 'O', name: 'O', letterIpa: '/əʊ/', example: 'orange', exampleIpa: '/ˈɒrɪndʒ/', zh: '橙子' },
  { lower: 'p', upper: 'P', name: 'P', letterIpa: '/piː/', example: 'pen', exampleIpa: '/pen/', zh: '钢笔' },
  { lower: 'q', upper: 'Q', name: 'Q', letterIpa: '/kjuː/', example: 'queen', exampleIpa: '/kwiːn/', zh: '女王' },
  { lower: 'r', upper: 'R', name: 'R', letterIpa: '/ɑː/', example: 'red', exampleIpa: '/red/', zh: '红色' },
  { lower: 's', upper: 'S', name: 'S', letterIpa: '/es/', example: 'sun', exampleIpa: '/sʌn/', zh: '太阳' },
  { lower: 't', upper: 'T', name: 'T', letterIpa: '/tiː/', example: 'tea', exampleIpa: '/tiː/', zh: '茶' },
  { lower: 'u', upper: 'U', name: 'U', letterIpa: '/juː/', example: 'up', exampleIpa: '/ʌp/', zh: '向上' },
  { lower: 'v', upper: 'V', name: 'V', letterIpa: '/viː/', example: 'van', exampleIpa: '/væn/', zh: '货车' },
  { lower: 'w', upper: 'W', name: 'W', letterIpa: '/ˈdʌbljuː/', example: 'water', exampleIpa: '/ˈwɔːtə/', zh: '水' },
  { lower: 'x', upper: 'X', name: 'X', letterIpa: '/eks/', example: 'box', exampleIpa: '/bɒks/', zh: '盒子' },
  { lower: 'y', upper: 'Y', name: 'Y', letterIpa: '/waɪ/', example: 'yellow', exampleIpa: '/ˈjeləʊ/', zh: '黄色' },
  { lower: 'z', upper: 'Z', name: 'Z', letterIpa: '/zed/', example: 'zoo', exampleIpa: '/zuː/', zh: '动物园' }
]

/* ---------- 20 个元音音标 ---------- */
export const IPA_VOWELS = [
  // 单元音 12 个
  { symbol: '/iː/', kind: '单元音', example: 'see', exampleIpa: '/siː/', zh: '看见' },
  { symbol: '/ɪ/', kind: '单元音', example: 'sit', exampleIpa: '/sɪt/', zh: '坐' },
  { symbol: '/e/', kind: '单元音', example: 'bed', exampleIpa: '/bed/', zh: '床' },
  { symbol: '/æ/', kind: '单元音', example: 'cat', exampleIpa: '/kæt/', zh: '猫' },
  { symbol: '/ɑː/', kind: '单元音', example: 'car', exampleIpa: '/kɑː/', zh: '汽车' },
  { symbol: '/ɒ/', kind: '单元音', example: 'dog', exampleIpa: '/dɒg/', zh: '狗' },
  { symbol: '/ɔː/', kind: '单元音', example: 'door', exampleIpa: '/dɔː/', zh: '门' },
  { symbol: '/ʊ/', kind: '单元音', example: 'book', exampleIpa: '/bʊk/', zh: '书' },
  { symbol: '/uː/', kind: '单元音', example: 'food', exampleIpa: '/fuːd/', zh: '食物' },
  { symbol: '/ʌ/', kind: '单元音', example: 'cup', exampleIpa: '/kʌp/', zh: '杯子' },
  { symbol: '/ɜː/', kind: '单元音', example: 'bird', exampleIpa: '/bɜːd/', zh: '鸟' },
  { symbol: '/ə/', kind: '单元音', example: 'about', exampleIpa: '/əˈbaʊt/', zh: '关于' },
  // 双元音 8 个
  { symbol: '/eɪ/', kind: '双元音', example: 'day', exampleIpa: '/deɪ/', zh: '白天' },
  { symbol: '/aɪ/', kind: '双元音', example: 'my', exampleIpa: '/maɪ/', zh: '我的' },
  { symbol: '/ɔɪ/', kind: '双元音', example: 'boy', exampleIpa: '/bɔɪ/', zh: '男孩' },
  { symbol: '/aʊ/', kind: '双元音', example: 'house', exampleIpa: '/haʊs/', zh: '房子' },
  { symbol: '/əʊ/', kind: '双元音', example: 'go', exampleIpa: '/ɡəʊ/', zh: '去' },
  { symbol: '/ɪə/', kind: '双元音', example: 'ear', exampleIpa: '/ɪə/', zh: '耳朵' },
  { symbol: '/eə/', kind: '双元音', example: 'air', exampleIpa: '/eə/', zh: '空气' },
  { symbol: '/ʊə/', kind: '双元音', example: 'tour', exampleIpa: '/tʊə/', zh: '旅行' }
]

/* ---------- 28 个辅音音标 ---------- */
export const IPA_CONSONANTS = [
  // 爆破音 6
  { symbol: '/p/', kind: '爆破音', example: 'pen', exampleIpa: '/pen/', zh: '钢笔' },
  { symbol: '/b/', kind: '爆破音', example: 'bus', exampleIpa: '/bʌs/', zh: '公共汽车' },
  { symbol: '/t/', kind: '爆破音', example: 'tea', exampleIpa: '/tiː/', zh: '茶' },
  { symbol: '/d/', kind: '爆破音', example: 'dog', exampleIpa: '/dɒg/', zh: '狗' },
  { symbol: '/k/', kind: '爆破音', example: 'cat', exampleIpa: '/kæt/', zh: '猫' },
  { symbol: '/ɡ/', kind: '爆破音', example: 'go', exampleIpa: '/ɡəʊ/', zh: '去' },
  // 摩擦音 10
  { symbol: '/f/', kind: '摩擦音', example: 'fish', exampleIpa: '/fɪʃ/', zh: '鱼' },
  { symbol: '/v/', kind: '摩擦音', example: 'van', exampleIpa: '/væn/', zh: '货车' },
  { symbol: '/θ/', kind: '摩擦音', example: 'think', exampleIpa: '/θɪŋk/', zh: '思考' },
  { symbol: '/ð/', kind: '摩擦音', example: 'this', exampleIpa: '/ðɪs/', zh: '这个' },
  { symbol: '/s/', kind: '摩擦音', example: 'sun', exampleIpa: '/sʌn/', zh: '太阳' },
  { symbol: '/z/', kind: '摩擦音', example: 'zoo', exampleIpa: '/zuː/', zh: '动物园' },
  { symbol: '/ʃ/', kind: '摩擦音', example: 'she', exampleIpa: '/ʃiː/', zh: '她' },
  { symbol: '/ʒ/', kind: '摩擦音', example: 'vision', exampleIpa: '/ˈvɪʒn/', zh: '视觉' },
  { symbol: '/h/', kind: '摩擦音', example: 'hat', exampleIpa: '/hæt/', zh: '帽子' },
  { symbol: '/r/', kind: '摩擦音', example: 'red', exampleIpa: '/red/', zh: '红色' },
  // 破擦音 6
  { symbol: '/tʃ/', kind: '破擦音', example: 'chair', exampleIpa: '/tʃeə/', zh: '椅子' },
  { symbol: '/dʒ/', kind: '破擦音', example: 'jump', exampleIpa: '/dʒʌmp/', zh: '跳' },
  { symbol: '/tr/', kind: '破擦音', example: 'tree', exampleIpa: '/triː/', zh: '树' },
  { symbol: '/dr/', kind: '破擦音', example: 'drink', exampleIpa: '/drɪŋk/', zh: '喝' },
  { symbol: '/ts/', kind: '破擦音', example: 'cats', exampleIpa: '/kæts/', zh: '猫（复数）' },
  { symbol: '/dz/', kind: '破擦音', example: 'beds', exampleIpa: '/bedz/', zh: '床（复数）' },
  // 鼻音 3
  { symbol: '/m/', kind: '鼻音', example: 'milk', exampleIpa: '/mɪlk/', zh: '牛奶' },
  { symbol: '/n/', kind: '鼻音', example: 'nose', exampleIpa: '/nəʊz/', zh: '鼻子' },
  { symbol: '/ŋ/', kind: '鼻音', example: 'sing', exampleIpa: '/sɪŋ/', zh: '唱歌' },
  // 边音与半元音 3
  { symbol: '/l/', kind: '边音/半元音', example: 'leg', exampleIpa: '/leɡ/', zh: '腿' },
  { symbol: '/j/', kind: '边音/半元音', example: 'yes', exampleIpa: '/jes/', zh: '是的' },
  { symbol: '/w/', kind: '边音/半元音', example: 'water', exampleIpa: '/ˈwɔːtə/', zh: '水' }
]

/* ---------- 自然拼读规则（首期 5 条） ---------- */
export const PHONICS_RULES = [
  {
    name: 'CVC 拼读',
    desc: '辅音 + 元音 + 辅音（Consonant-Vowel-Consonant）结构，短元音直接拼读：如 c-a-t → cat /kæt/。',
    examples: [
      { word: 'cat', ipa: '/kæt/', zh: '猫' },
      { word: 'dog', ipa: '/dɒg/', zh: '狗' },
      { word: 'bus', ipa: '/bʌs/', zh: '公共汽车' }
    ]
  },
  {
    name: '组合 sh → /ʃ/',
    desc: '字母组合 sh 发 /ʃ/ 音，如 ship。',
    examples: [
      { word: 'ship', ipa: '/ʃɪp/', zh: '轮船' },
      { word: 'fish', ipa: '/fɪʃ/', zh: '鱼' },
      { word: 'she', ipa: '/ʃiː/', zh: '她' }
    ]
  },
  {
    name: '组合 ch → /tʃ/',
    desc: '字母组合 ch 发 /tʃ/ 音，如 chair。',
    examples: [
      { word: 'chair', ipa: '/tʃeə/', zh: '椅子' },
      { word: 'chicken', ipa: '/ˈtʃɪkɪn/', zh: '鸡肉' },
      { word: 'much', ipa: '/mʌtʃ/', zh: '许多' }
    ]
  },
  {
    name: '组合 th → /θ/ 或 /ð/',
    desc: '字母组合 th 可发清音 /θ/（think）或浊音 /ð/（this）。',
    examples: [
      { word: 'think', ipa: '/θɪŋk/', zh: '思考' },
      { word: 'this', ipa: '/ðɪs/', zh: '这个' },
      { word: 'three', ipa: '/θriː/', zh: '三' }
    ]
  },
  {
    name: '组合 ee / oo',
    desc: 'ee 常发长音 /iː/（see），oo 常发 /uː/（moon）或 /ʊ/（book）。',
    examples: [
      { word: 'see', ipa: '/siː/', zh: '看见' },
      { word: 'moon', ipa: '/muːn/', zh: '月亮' },
      { word: 'book', ipa: '/bʊk/', zh: '书' }
    ]
  }
]

/* ---------- 自然拼读词表（CVC 与组合词，关卡选题池） ---------- */
export const PHONICS_WORDS = [
  { word: 'cat', ipa: '/kæt/', zh: '猫', rule: 'CVC' },
  { word: 'dog', ipa: '/dɒg/', zh: '狗', rule: 'CVC' },
  { word: 'bus', ipa: '/bʌs/', zh: '公共汽车', rule: 'CVC' },
  { word: 'pen', ipa: '/pen/', zh: '钢笔', rule: 'CVC' },
  { word: 'sun', ipa: '/sʌn/', zh: '太阳', rule: 'CVC' },
  { word: 'hat', ipa: '/hæt/', zh: '帽子', rule: 'CVC' },
  { word: 'pig', ipa: '/pɪg/', zh: '猪', rule: 'CVC' },
  { word: 'cup', ipa: '/kʌp/', zh: '杯子', rule: 'CVC' },
  { word: 'bed', ipa: '/bed/', zh: '床', rule: 'CVC' },
  { word: 'red', ipa: '/red/', zh: '红色', rule: 'CVC' },
  { word: 'sit', ipa: '/sɪt/', zh: '坐', rule: 'CVC' },
  { word: 'map', ipa: '/mæp/', zh: '地图', rule: 'CVC' },
  { word: 'fox', ipa: '/fɒks/', zh: '狐狸', rule: 'CVC' },
  { word: 'box', ipa: '/bɒks/', zh: '盒子', rule: 'CVC' },
  { word: 'leg', ipa: '/leɡ/', zh: '腿', rule: 'CVC' },
  { word: 'ten', ipa: '/ten/', zh: '十', rule: 'CVC' },
  { word: 'run', ipa: '/rʌn/', zh: '跑', rule: 'CVC' },
  { word: 'big', ipa: '/bɪg/', zh: '大的', rule: 'CVC' },
  { word: 'hot', ipa: '/hɒt/', zh: '热的', rule: 'CVC' },
  { word: 'wet', ipa: '/wet/', zh: '湿的', rule: 'CVC' },
  { word: 'ship', ipa: '/ʃɪp/', zh: '轮船', rule: 'sh → /ʃ/' },
  { word: 'fish', ipa: '/fɪʃ/', zh: '鱼', rule: 'sh → /ʃ/' },
  { word: 'chair', ipa: '/tʃeə/', zh: '椅子', rule: 'ch → /tʃ/' },
  { word: 'three', ipa: '/θriː/', zh: '三', rule: 'th → /θ/' },
  { word: 'this', ipa: '/ðɪs/', zh: '这个', rule: 'th → /ð/' },
  { word: 'see', ipa: '/siː/', zh: '看见', rule: 'ee → /iː/' },
  { word: 'moon', ipa: '/muːn/', zh: '月亮', rule: 'oo → /uː/' },
  { word: 'book', ipa: '/bʊk/', zh: '书', rule: 'oo → /ʊ/' }
]

export default {
  LETTERS,
  IPA_VOWELS,
  IPA_CONSONANTS,
  PHONICS_RULES,
  PHONICS_WORDS
}
