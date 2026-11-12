<template>
  <div class="page-container stage">
    <template v-if="stage">
      <template v-if="stage.available === false">
        <div class="alert alert-info">
          本关内容将在后续阶段开放。
          <button class="btn btn-ghost" style="margin-top: 8px" @click="goBack">返回关卡列表</button>
        </div>
      </template>

      <template v-else-if="!progress.isStageUnlocked(stage.id)">
        <div class="alert alert-warn">
          本关尚未解锁，请先完成上一关。
          <button class="btn btn-ghost" style="margin-top: 8px" @click="goBack">返回关卡列表</button>
        </div>
      </template>

      <template v-else>
        <button class="back-btn" @click="goBack">← 返回关卡列表</button>
        <h1 class="page-title">{{ stage.title }}</h1>
        <p class="page-subtitle">{{ stage.desc }}</p>

        <!-- 答题模式 -->
        <div v-if="mode === 'quiz'" class="card stage-card">
          <div class="stage-head">
            <span>第 {{ index + 1 }} / {{ questions.length }} 题</span>
            <span>答对 {{ correctCount }} / {{ answeredCount }}</span>
          </div>

          <div v-if="readingData" class="reading-panel">
            <div class="reading-panel-title">{{ readingData.title }}</div>
            <p v-for="(para, pi) in readingData.text" :key="pi" class="reading-para">{{ para }}</p>
          </div>

          <div v-if="simulationData && simulationWords.length" class="sim-words">
            <div class="sim-words-title">本关主题学术词（{{ simulationWords.length }}）</div>
            <div class="sim-words-list">
              <span v-for="w in simulationWords" :key="w.word" class="sim-word">
                <b>{{ w.word }}</b> <span class="ipa">{{ w.ipa }}</span> <i>{{ w.zh }}</i>
              </span>
            </div>
          </div>

          <div v-if="grammarUnit" class="grammar-intro">
            <div class="grammar-intro-emoji">{{ grammarUnit.emoji }}</div>
            <div class="grammar-intro-text">{{ grammarUnit.intro }}</div>
            <div v-for="(r, ri) in grammarUnit.rules" :key="ri" class="grammar-rule">
              <b>{{ r.title }}：</b>{{ r.body }}
            </div>
          </div>

          <div class="stage-question">
            <div v-if="current.context" class="reading-para">{{ current.context }}</div>
            <div class="stage-prompt">{{ current.prompt }}</div>
            <TtsButton v-if="current.audio" :text="current.audio" :rate="0.7" class="stage-listen" aria-label="播放题目发音" />
            <div v-if="current.audio && index === 0 && !revealed" class="listen-hint">💡 点击喇叭可重复收听，听清后再作答</div>
            <div v-if="current.kind === 'listening' || current.kind === 'reading' || current.kind === 'vocab' || current.kind === 'writing' || current.kind === 'speaking'" class="stage-kind">{{ current.kind }}题</div>
            <div v-if="current.display && current.display.main" class="stage-display-main">{{ current.display.main }}</div>
            <div v-if="current.display" class="stage-display-sub">
              <span v-if="current.display.ipa" class="ipa">{{ current.display.ipa }}</span>
              <span v-if="current.display.example">{{ current.display.example }}</span>
              <span v-if="current.display.word">{{ current.display.word }}</span>
              <span v-if="current.display.zh">{{ current.display.zh }}</span>
              <span v-if="current.display.kind">{{ current.display.kind }}</span>
              <span v-if="current.display.rule">{{ current.display.rule }}</span>
              <span v-if="current.display.emoji" class="stage-emoji">{{ current.display.emoji }}</span>
            </div>
          </div>

          <!-- 拼写挑战：字母盘点选 -->
          <div v-if="current.kind === 'word_spell'" class="spell-wrap">
            <div class="spell-slots">
              <span v-for="(ch, i) in spellChars" :key="'f' + i" class="spell-slot">{{ ch }}</span>
              <span v-for="i in Math.max(0, (current.hint || 0) - spellChars.length)" :key="'e' + i" class="spell-slot empty">_</span>
            </div>
            <div class="spell-letters">
              <button
                v-for="(ch, i) in current.letters"
                :key="i"
                class="spell-key"
                :class="{ used: spellPickedIndexes.includes(i) }"
                :disabled="revealed || spellPickedIndexes.includes(i)"
                @click="spellPick(i)"
              >{{ ch }}</button>
            </div>
            <div class="spell-actions">
              <button class="btn btn-ghost" :disabled="revealed" @click="spellBack">退格</button>
              <button class="btn btn-ghost" :disabled="revealed" @click="spellClear">重来</button>
              <button
                class="btn btn-primary"
                :disabled="revealed || spellChars.length !== (current.hint || 0)"
                @click="spellConfirm"
              >确定</button>
            </div>
          </div>

          <QuizBox
            v-else
            :options="current.options"
            :selected-key="selected"
            :answer-key="revealed ? current.answer : null"
            :reveal="revealed"
            @select="choose"
          />

          <div v-if="revealed" class="stage-feedback">
            <span v-if="selected === current.answer" class="feedback-ok">回答正确！</span>
            <span v-else class="feedback-no">正确答案：{{ current.correctLabel }}</span>
            <div v-if="current.explain" class="feedback-explain">解析：{{ current.explain }}</div>
          </div>

          <button class="btn btn-primary btn-block" :disabled="!revealed" @click="next">
            {{ index === questions.length - 1 ? '查看结果' : '下一题' }}
          </button>
        </div>

        <!-- 跟读模式 -->
        <div v-else-if="mode === 'readalong'" class="card stage-card">
          <div class="stage-head">第 {{ index + 1 }} / {{ readItems.length }} 个</div>

          <WordCard
            :word="currentRead.upper"
            :phonetic="currentRead.letterIpa"
            :zh="`示例：${currentRead.example}（${currentRead.zh}）`"
          />

          <div class="read-demo">
            <TtsButton :text="currentRead.example" :rate="0.65" aria-label="播放跟读示范" />
            <span>点击喇叭听示范，跟着读一遍</span>
          </div>

          <div class="read-self">
            <div class="read-self-title">跟读后请自评：</div>
            <div class="read-actions">
              <button class="btn btn-soft" @click="selfRate(3)">好（3 星）</button>
              <button class="btn btn-soft" @click="selfRate(2)">一般（2 星）</button>
              <button class="btn btn-ghost" @click="selfRate(1)">需重练（1 星）</button>
            </div>
          </div>
        </div>

        <!-- 对话模式 -->
        <div v-else-if="mode === 'dialogue'" class="card stage-card">
          <DialoguePanel v-if="sceneData" :scene="sceneData" @done="onDialogueDone" />
          <div v-else class="alert alert-warn">对话数据缺失。</div>
        </div>

        <!-- 听力模式 -->
        <div v-else-if="mode === 'audio'" class="card stage-card">
          <AudioPlayer v-if="materialData" :material="materialData" @done="onAudioDone" />
          <div v-else class="alert alert-warn">听力材料缺失。</div>
        </div>

        <!-- 结算 -->
        <div v-else-if="mode === 'result'" class="card stage-card result-card">
          <div class="result-title">「{{ stage.title }}」完成！</div>
          <div class="result-stars">
            <span v-for="i in 3" :key="i" class="star" :class="{ empty: i > stars }">★</span>
          </div>
          <div class="result-info">获得 {{ stars }} 星</div>
          <div v-if="isQuizStage" class="result-accuracy">答对 {{ correctCount }} / {{ questions.length }}</div>
          <div v-else class="result-accuracy">跟读 / 对话 / 听力完成</div>

          <!-- 低正确率提示：引导重练巩固 -->
          <div v-if="isQuizStage && accuracy < 0.7" class="result-hint">
            正确率较低（{{ Math.round(accuracy * 100) }}%），建议再练一遍巩固记忆。
          </div>

          <template v-if="!rewarded">
            <button class="btn btn-primary btn-block" @click="claim">领取奖励并继续</button>
          </template>
          <template v-else>
            <div v-if="nextStage" class="result-next">
              已解锁下一关：{{ nextStage.title }}
            </div>
            <div v-else-if="levelFinishedMsg" class="result-next">
              {{ levelFinishedMsg }}
            </div>
            <div class="result-actions">
              <button v-if="nextStage" class="btn btn-primary btn-block" @click="goNextStage">进入下一关</button>
              <button
                v-if="isQuizStage && accuracy < 0.7"
                class="btn btn-soft btn-block"
                @click="retryStage"
              >重练本关</button>
              <button class="btn btn-ghost btn-block" @click="goBack">返回关卡列表</button>
              <button class="btn btn-ghost btn-block" @click="router.push('/map')">返回闯关地图</button>
            </div>
          </template>
        </div>
      </template>
    </template>

    <div v-else class="alert alert-warn">
      关卡不存在。
      <button class="btn btn-ghost" style="margin-top: 8px" @click="router.push('/map')">返回闯关地图</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getStageById, getLevel, getPoolData } from '../data/levels'
import { useProgressStore } from '../stores/progress'
import QuizBox from '../components/QuizBox.vue'
import TtsButton from '../components/TtsButton.vue'
import WordCard from '../components/WordCard.vue'
import DialoguePanel from '../components/DialoguePanel.vue'
import AudioPlayer from '../components/AudioPlayer.vue'
import { getDialogueById, L3_LISTENING } from '../data/dialogues'
import { L6_LISTENING } from '../data/listening_l6'
import { getGrammarUnitById } from '../data/grammar'
import { ARTICLES_L7 } from '../data/reading_l7'
import { getSimulationById, getAcademicWordsByTheme } from '../data/simulation_l8'

const route = useRoute()
const router = useRouter()
const progress = useProgressStore()

const stage = computed(() => getStageById(route.params.stageId))

const mode = ref('quiz')
const questions = ref([])
const readItems = ref([])
const index = ref(0)
const selected = ref(null)
const revealed = ref(false)
const correctCount = ref(0)
const answeredCount = ref(0)
const selfScores = ref([])
const stars = ref(0)
const rewarded = ref(false)
const spellChars = ref([])
const spellPickedIndexes = ref([])
const sceneData = ref(null)
const grammarUnit = ref(null)
const readingData = ref(null)
const simulationData = ref(null)
const simulationWords = ref([])
const materialData = ref(null)

const isQuizStage = ref(false)
const current = computed(() => questions.value[index.value] || {})
const currentRead = computed(() => readItems.value[index.value] || {})
const nextStage = computed(() => {
  const s = stage.value
  if (!s) return null
  const lv = getLevel(s.level)
  const next = lv ? lv.stages.find((x) => x.stage === s.stage + 1) : null
  if (!next || next.available === false) return null
  return progress.isStageUnlocked(next.id) ? next : null
})

/* 本次答题正确率（仅测验类关卡有意义） */
const accuracy = computed(() => {
  const total = questions.value.length
  return total ? correctCount.value / total : 1
})

function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildQuiz() {
  const s = stage.value
  isQuizStage.value = !s || (s.type !== 'read_along' && s.type !== 'dialogue' && s.type !== 'listening')

  if (s.type === 'reading') {
    readingData.value = ARTICLES_L7.find((a) => a.id === s.content.article) || null
    grammarUnit.value = getGrammarUnitById(s.content.grammarUnitId) || null
    const article = readingData.value
    questions.value = article
      ? article.questions.map((item, i) => ({
          prompt: item.q,
          answer: item.answer,
          options: item.options.map((t, k) => ({ key: k, label: t })),
          correctLabel: item.options[item.answer],
          explain: item.explain,
          kind: 'reading',
          seq: i + 1,
          context: item.context || null
        }))
      : []
    mode.value = 'quiz'
    return
  }

  if (s.type === 'simulation') {
    simulationData.value = getSimulationById(s.content.simulation)
    const sim = simulationData.value
    simulationWords.value = getAcademicWordsByTheme(sim ? sim.themeId : '')
    questions.value = sim
      ? sim.questions.map((item, i) => ({
          prompt: item.q,
          answer: item.answer,
          options: item.options.map((t, k) => ({ key: k, label: t })),
          correctLabel: item.options[item.answer],
          explain: item.explain,
          kind: item.section,
          seq: i + 1,
          audio: item.audio || null,
          context: item.context || null
        }))
      : []
    mode.value = 'quiz'
    return
  }

  if (s.type === 'dialogue') {
    sceneData.value = getDialogueById(s.content.scene)
    mode.value = 'dialogue'
    return
  }

  if (s.type === 'listening') {
    const l6 = L6_LISTENING.find((x) => x.id === s.content.script)
    if (l6) {
      materialData.value = l6
      mode.value = 'audio'
      return
    }
    const script = L3_LISTENING.find((x) => x.id === s.content.script) || L3_LISTENING[0]
    questions.value = script.scripts.map((item) => ({
      prompt: item.q,
      audio: item.en,
      answer: item.answer,
      options: item.options.map((t, i) => ({ key: i, label: t })),
      display: { zh: item.zh },
      correctLabel: item.options[item.answer],
      kind: 'listening'
    }))
    mode.value = 'quiz'
    return
  }

  if (s.type === 'grammar_quiz') {
    grammarUnit.value = getGrammarUnitById(s.content.unit)
    const unit = grammarUnit.value
    if (!unit) {
      questions.value = []
      mode.value = 'quiz'
      return
    }
    questions.value = unit.questions.map((item, i) => ({
      prompt: item.prompt,
      answer: item.answer,
      options: item.options.map((t, k) => ({ key: k, label: t })),
      correctLabel: item.options[item.answer],
      explain: item.explain,
      kind: 'grammar',
      seq: i + 1
    }))
    mode.value = 'quiz'
    return
  }

  const pool = getPoolData(s.content.pool)
  const count = s.content.count || 10
  const picked = shuffle(pool).slice(0, count)

  if (s.type === 'letter_recognize') {
    questions.value = picked.map((item) => {
      const distractors = shuffle(pool.filter((x) => x.lower !== item.lower)).slice(0, 3)
      const options = shuffle([item, ...distractors]).map((x) => ({ key: x.lower, label: x.upper }))
      return {
        prompt: '听发音，选出对应的字母',
        audio: item.name,
        answer: item.lower,
        options,
        display: { main: item.upper, ipa: item.letterIpa, word: item.example, zh: item.zh },
        correctLabel: item.upper
      }
    })
  } else if (s.type === 'letter_match') {
    questions.value = picked.map((item) => {
      const upperFirst = Math.random() < 0.5
      const distractors = shuffle(pool.filter((x) => x.lower !== item.lower)).slice(0, 3)
      const options = shuffle([item, ...distractors]).map((x) => ({
        key: upperFirst ? x.lower : x.upper,
        label: upperFirst ? x.lower : x.upper
      }))
      return {
        prompt: upperFirst ? `请选出大写 ${item.upper} 对应的小写字母` : `请选出小写 ${item.lower} 对应的大写字母`,
        answer: upperFirst ? item.lower : item.upper,
        options,
        display: { main: upperFirst ? item.upper : item.lower, ipa: item.letterIpa, word: item.example, zh: item.zh },
        correctLabel: upperFirst ? item.lower : item.upper
      }
    })
  } else if (s.type === 'ipa_recognize') {
    questions.value = picked.map((item) => {
      const distractors = shuffle(pool.filter((x) => x.symbol !== item.symbol)).slice(0, 3)
      const options = shuffle([item, ...distractors]).map((x) => ({ key: x.symbol, label: x.symbol }))
      return {
        prompt: '听示例词发音，选出对应的音标',
        audio: item.example,
        answer: item.symbol,
        options,
        display: { example: item.example, ipa: item.exampleIpa, zh: item.zh, kind: item.kind },
        correctLabel: item.symbol
      }
    })
  } else if (s.type === 'phonics') {
    questions.value = picked.map((item) => {
      const distractors = shuffle(pool.filter((x) => x.word !== item.word)).slice(0, 3)
      const options = shuffle([item, ...distractors]).map((x) => ({ key: x.word, label: x.word }))
      return {
        prompt: '听发音，选出正确的单词',
        audio: item.word,
        answer: item.word,
        options,
        display: { ipa: item.ipa, zh: item.zh, rule: item.rule },
        correctLabel: item.word
      }
    })
  } else if (s.type === 'word_choice') {
    const wMode = (s.content && s.content.mode) || (Math.random() < 0.5 ? 'zh2en' : 'en2zh')
    questions.value = picked.map((item) => {
      const distractors = shuffle(pool.filter((x) => x.word !== item.word)).slice(0, 3)
      if (wMode === 'listen') {
        const options = shuffle([item, ...distractors]).map((x) => ({ key: x.word, label: x.word }))
        return {
          prompt: '听发音，选出对应的单词',
          audio: item.word,
          answer: item.word,
          options,
          display: { ipa: item.ipa, zh: item.zh, emoji: item.emoji },
          correctLabel: item.word,
          kind: 'word_choice'
        }
      }
      if (wMode === 'zh2en') {
        const options = shuffle([item, ...distractors]).map((x) => ({ key: x.word, label: x.word }))
        return {
          prompt: `选出与「${item.zh}」对应的英文单词`,
          answer: item.word,
          options,
          display: { main: item.zh, emoji: item.emoji },
          correctLabel: item.word,
          kind: 'word_choice'
        }
      }
      const options = shuffle([item, ...distractors]).map((x) => ({ key: x.word, label: x.zh }))
      return {
        prompt: `选出「${item.word}」的中文释义`,
        answer: item.word,
        options,
        display: { main: item.word, ipa: item.ipa, emoji: item.emoji },
        correctLabel: item.zh,
        kind: 'word_choice'
      }
    })
  } else if (s.type === 'word_match') {
    questions.value = picked.map((item) => {
      const distractors = shuffle(pool.filter((x) => x.word !== item.word)).slice(0, 3)
      const options = shuffle([item, ...distractors]).map((x) => ({ key: x.word, label: x.word }))
      return {
        prompt: '看图，选出对应的单词',
        audio: item.word,
        answer: item.word,
        options,
        display: { main: item.emoji, ipa: item.ipa, zh: item.zh },
        correctLabel: item.word,
        kind: 'word_match'
      }
    })
  } else if (s.type === 'word_spell') {
    questions.value = picked.map((item) => {
      const target = item.word.toLowerCase()
      const letters = target.split('')
      const extra = []
      const extras = shuffle(pool.filter((x) => x.word !== item.word))
      for (const e of extras) {
        for (const ch of e.word.toLowerCase()) {
          if (!letters.includes(ch) && !extra.includes(ch)) extra.push(ch)
          if (extra.length >= 4) break
        }
        if (extra.length >= 4) break
      }
      const alphabet = shuffle([...letters, ...extra])
      return {
        prompt: `拼出「${item.zh}」对应的英文单词`,
        answer: target,
        letters: alphabet,
        hint: target.length,
        display: { ipa: item.ipa, emoji: item.emoji },
        correctLabel: item.word,
        kind: 'word_spell'
      }
    })
  } else {
    // 未知题型兜底：字母认读
    questions.value = picked.map((item) => {
      const options = shuffle(pool.filter((x) => x.lower !== item.lower)).slice(0, 3)
      return {
        prompt: '听发音，选出对应的字母',
        audio: item.name,
        answer: item.lower,
        options: shuffle([item, ...options]).map((x) => ({ key: x.lower, label: x.upper })),
        display: { main: item.upper },
        correctLabel: item.upper
      }
    })
  }

  if (stage.value.type === 'read_along') {
    mode.value = 'readalong'
    readItems.value = picked
  } else {
    mode.value = 'quiz'
  }
}

function spellPick(i) {
  if (revealed.value) return
  if (spellPickedIndexes.value.includes(i)) return
  if (spellChars.value.length >= (current.value.hint || 0)) return
  spellChars.value.push(current.value.letters[i])
  spellPickedIndexes.value.push(i)
}

function spellBack() {
  if (revealed.value) return
  const i = spellPickedIndexes.value.pop()
  if (i !== undefined) spellChars.value.pop()
}

function spellClear() {
  if (revealed.value) return
  spellChars.value = []
  spellPickedIndexes.value = []
}

function spellConfirm() {
  if (revealed.value) return
  const guess = spellChars.value.join('').toLowerCase()
  selected.value = guess
  revealed.value = true
  answeredCount.value += 1
  if (guess === current.value.answer) {
    correctCount.value += 1
  } else {
    progress.addToReviewPool([`${stage.value.id}:${current.value.answer}`])
  }
}

function choose(k) {
  if (revealed.value) return
  selected.value = k
  revealed.value = true
  answeredCount.value += 1
  if (k === current.value.answer) {
    correctCount.value += 1
  } else {
    progress.addToReviewPool([`${stage.value.id}:${current.value.answer}`])
  }
}

function next() {
  if (index.value < questions.value.length - 1) {
    index.value += 1
    selected.value = null
    revealed.value = false
    spellChars.value = []
    spellPickedIndexes.value = []
  } else {
    finishQuiz()
  }
}

function finishQuiz() {
  const total = questions.value.length
  const ratio = total ? correctCount.value / total : 0
  stars.value = ratio >= 1 ? 3 : ratio >= 0.7 ? 2 : 1
  mode.value = 'result'
}

function selfRate(score) {
  selfScores.value.push(score)
  if (index.value < readItems.value.length - 1) {
    index.value += 1
  } else {
    finishReadAlong()
  }
}

function finishReadAlong() {
  const total = readItems.value.length
  const avg = total ? selfScores.value.reduce((a, b) => a + b, 0) / total : 1
  stars.value = Math.max(1, Math.round(avg))
  mode.value = 'result'
}

function onDialogueDone(star) {
  if (mode.value !== 'dialogue') return
  stars.value = star
  mode.value = 'result'
}

function onAudioDone(star) {
  if (mode.value !== 'audio') return
  stars.value = star
  mode.value = 'result'
}

const levelFinishedMsg = ref('')

function claim() {
  if (rewarded.value) return
  progress.completeStage(stage.value.id, stars.value)
  progress.checkInToday()
  if (isQuizStage.value && questions.value.length) {
    progress.recordQuiz({ correct: correctCount.value, total: questions.value.length })
  }
  rewarded.value = true
  if (nextStage.value) {
    // 保留结果页 900ms，让星星动效与解锁提示可见后再跳转
    const nextId = nextStage.value.id
    setTimeout(() => router.push(`/stage/${nextId}`), 900)
  } else {
    levelFinishedMsg.value = '恭喜！已完成本等级全部关卡，前往闯关地图选择下一等级。'
  }
}

/* 重练本关：重置答题状态并重新生成题目 */
function retryStage() {
  resetStageState()
}

function goNextStage() {
  if (nextStage.value) {
    router.push(`/stage/${nextStage.value.id}`)
  }
}

function goBack() {
  router.push(`/map/${stage.value ? stage.value.level : 1}`)
}

function resetStageState() {
  mode.value = 'quiz'
  questions.value = []
  readItems.value = []
  index.value = 0
  selected.value = null
  revealed.value = false
  correctCount.value = 0
  answeredCount.value = 0
  selfScores.value = []
  stars.value = 0
  rewarded.value = false
  spellChars.value = []
  spellPickedIndexes.value = []
  sceneData.value = null
  grammarUnit.value = null
  readingData.value = null
  simulationData.value = null
  simulationWords.value = []
  materialData.value = null
  buildQuiz()
}

watch(() => route.params.stageId, () => resetStageState())

buildQuiz()
</script>

<style scoped>
.stage-head {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--c-text-secondary);
  margin-bottom: var(--space-md);
}

.stage-question {
  margin-bottom: var(--space-md);
}

.stage-prompt {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: var(--space-xs);
}

.reading-panel {
  background: var(--c-bg-soft);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  margin-bottom: var(--space-md);
  max-height: 300px;
  overflow: auto;
}

.reading-panel-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: var(--space-sm);
}

.reading-para {
  font-size: 15px;
  line-height: 1.7;
  margin: 0 0 var(--space-sm);
}

.sim-words {
  background: var(--c-primary-light);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  margin-bottom: var(--space-md);
}

.sim-words-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: var(--space-xs);
}

.sim-words-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs) var(--space-md);
}

.sim-word {
  font-size: 14px;
}

.stage-kind {
  display: inline-block;
  font-size: 12px;
  color: var(--c-text-secondary);
  background: var(--c-bg-soft);
  border: 1px solid var(--c-border);
  border-radius: 999px;
  padding: 2px 10px;
  margin-bottom: var(--space-xs);
}

.stage-listen {
  margin: var(--space-xs) 0;
}

.listen-hint {
  display: inline-block;
  font-size: 12px;
  color: var(--c-text-secondary);
  background: var(--c-primary-light);
  border-radius: 999px;
  padding: 3px 10px;
  margin-top: 2px;
}

.stage-display-main {
  font-size: 48px;
  font-weight: 800;
  color: var(--c-primary);
  text-align: center;
  margin: var(--space-sm) 0;
}

.stage-display-sub {
  display: flex;
  gap: var(--space-sm);
  justify-content: center;
  flex-wrap: wrap;
  color: var(--c-text-secondary);
  font-size: 16px;
}

.stage-feedback {
  margin-top: var(--space-md);
  font-weight: 600;
}

.feedback-explain {
  margin-top: var(--space-xs);
  font-weight: 400;
  font-size: 14px;
  color: var(--c-text-secondary);
}

.grammar-intro {
  background: var(--c-primary-light);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  margin-bottom: var(--space-md);
  font-size: 14px;
  line-height: 1.6;
}

.grammar-intro-emoji {
  font-size: 22px;
  margin-bottom: var(--space-xs);
}

.grammar-intro-text {
  margin-bottom: var(--space-xs);
  font-weight: 600;
}

.grammar-rule {
  border-top: 1px dashed var(--c-border);
  padding-top: var(--space-xs);
  margin-top: var(--space-xs);
  color: var(--c-text);
}

.stage-emoji {
  font-size: 20px;
}

.spell-wrap {
  margin: var(--space-md) 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
}

.spell-slots {
  display: flex;
  gap: var(--space-xs);
  justify-content: center;
  flex-wrap: wrap;
}

.spell-slot {
  width: 40px;
  height: 48px;
  border: 2px solid var(--c-border);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
  text-transform: uppercase;
  background: var(--c-card);
}

.spell-slot.empty {
  color: var(--c-text-secondary);
  border-style: dashed;
}

.spell-letters {
  display: flex;
  gap: var(--space-xs);
  flex-wrap: wrap;
  justify-content: center;
  max-width: 360px;
}

.spell-key {
  width: 40px;
  height: 44px;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  background: var(--c-card);
  font-size: 18px;
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
  color: var(--c-text);
}

.spell-key.used {
  opacity: 0.35;
  pointer-events: none;
}

.spell-actions {
  display: flex;
  gap: var(--space-sm);
}

.read-demo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  margin: var(--space-md) 0;
  color: var(--c-text-secondary);
  font-size: 14px;
}

.read-self {
  border-top: 1px solid var(--c-border);
  padding-top: var(--space-md);
}

.read-self-title {
  font-size: 14px;
  color: var(--c-text-secondary);
  margin-bottom: var(--space-sm);
}

.read-actions {
  display: flex;
  gap: var(--space-sm);
}

.result-card {
  text-align: center;
}

.result-title {
  font-size: 22px;
  font-weight: 800;
  margin-bottom: var(--space-sm);
}

.result-stars {
  font-size: 40px;
  color: var(--c-star);
  margin-bottom: var(--space-xs);
}

/* 星星逐个弹出动画 */
.result-stars .star {
  display: inline-block;
  animation: star-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
}

.result-stars .star:nth-child(1) { animation-delay: 0.05s; }
.result-stars .star:nth-child(2) { animation-delay: 0.2s; }
.result-stars .star:nth-child(3) { animation-delay: 0.35s; }

@keyframes star-pop {
  0% { opacity: 0; transform: scale(0.2) rotate(-24deg); }
  70% { opacity: 1; transform: scale(1.18) rotate(6deg); }
  100% { opacity: 1; transform: scale(1) rotate(0); }
}

.result-hint {
  background: #fff6e5;
  color: #8a5a00;
  border: 1px solid #f0c674;
  border-radius: var(--radius-md);
  padding: var(--space-sm);
  margin-bottom: var(--space-sm);
  font-size: 13px;
  line-height: 1.5;
}

[data-theme='night'] .result-hint {
  background: #3a2f14;
  color: #ffd98a;
  border-color: #6b5a2a;
}

.result-info {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: var(--space-xs);
}

.result-accuracy {
  color: var(--c-text-secondary);
  margin-bottom: var(--space-md);
}

.result-next {
  background: var(--c-primary-light);
  border-radius: var(--radius-md);
  padding: var(--space-sm);
  margin-bottom: var(--space-sm);
  font-size: 14px;
}

.result-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

@media (max-width: 767px) {
  .read-actions {
    flex-direction: column;
  }
}
</style>
