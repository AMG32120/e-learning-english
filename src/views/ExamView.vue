<template>
  <div>
    <main class="container page">
      <h1 class="page-title">{{ levelTitle }} · 等级综合测验</h1>
      <p class="page-sub">覆盖本等级已通关与已解锁内容，正确率 ≥ 70% 通过并发毕业徽章</p>

      <!-- 锁定 -->
      <section v-if="!progress.ready || !unlocked" class="card">
        <div class="empty-state">
          <p class="empty-icon">🔒</p>
          <p>本等级综合测验尚未解锁</p>
          <p class="empty-hint">完成本等级 80% 的关卡后开放。完成上一等级全部关卡后可进入本等级闯关。</p>
          <router-link class="btn btn-primary" :to="{ name: 'level', params: { level } }">前往闯关</router-link>
        </div>
      </section>

      <!-- 开始页 -->
      <section v-else-if="phase === 'intro'" class="card">
        <div class="intro">
          <p class="intro-num">{{ questions.length }}</p>
          <p class="intro-text">共 {{ questions.length }} 道题，涵盖已学习内容</p>
          <ul class="intro-rules">
            <li>每道题单选，答完即时判分并显示解析</li>
            <li>正确率 ≥ 70% 即通过，获得毕业徽章</li>
            <li>答错的题目会加入复习池，供间隔重复巩固</li>
          </ul>
          <div class="intro-actions">
            <router-link class="btn btn-ghost" :to="{ name: 'level', params: { level } }">返回关卡列表</router-link>
            <button class="btn btn-primary" @click="start">开始测验</button>
          </div>
        </div>
      </section>

      <!-- 答题页 -->
      <section v-else-if="phase === 'quiz'" class="card">
        <div class="quiz-progress">第 {{ index + 1 }} / {{ questions.length }} 题</div>
        <div v-if="current" class="quiz-body">
          <p class="quiz-q">{{ current.q }}</p>
          <div class="quiz-options">
            <button
              v-for="(opt, oi) in current.options"
              :key="oi"
              class="quiz-opt"
              :class="{
                correct: picked !== null && oi === current.answer,
                wrong: picked !== null && picked === oi && oi !== current.answer
              }"
              :disabled="picked !== null"
              @click="pick(oi)"
            >
              <span class="opt-label">{{ String.fromCharCode(65 + oi) }}.</span>{{ opt }}
            </button>
          </div>
          <p v-if="picked !== null && current.explain" class="quiz-explain">{{ current.explain }}</p>
          <button v-if="picked !== null" class="btn btn-primary btn-block" @click="next">下一题</button>
        </div>
      </section>

      <!-- 结果页 -->
      <section v-else class="card">
        <div class="result">
          <p class="result-icon">{{ passed ? '🎓' : '💪' }}</p>
          <p class="result-num">{{ correct }} / {{ questions.length }}</p>
          <p class="result-text">
            {{ passed ? '恭喜通过！已颁发毕业徽章。' : '未达到 70% 通过线，再试一次吧。' }}
          </p>
          <p class="result-hint">答错题目已加入复习池，建议先复习巩固再重测。</p>
          <div class="result-actions">
            <button class="btn btn-ghost" @click="phase = 'intro'">重新测验</button>
            <router-link class="btn btn-primary" :to="{ name: 'level', params: { level } }">返回关卡列表</router-link>
          </div>
        </div>
      </section>
    </main>
    <BottomTab />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import BottomTab from '../components/BottomTab.vue'
import { getLevel } from '../data/levels'
import { collectLevelQuestions, shuffle } from '../services/quizBank'
import { useProgressStore } from '../stores/progress'

const route = useRoute()
const progress = useProgressStore()
const level = Number(route.params.level) || 1

const phase = ref('intro') // intro | quiz | result
const index = ref(0)
const picked = ref(null)
const correct = ref(0)
const passed = ref(false)
const questions = ref([])

const levelTitle = computed(() => {
  const lv = getLevel(level)
  return lv ? `L${lv.level} ${lv.name}` : `L${level}`
})

const unlocked = computed(() => progress.isLevelExamUnlocked(level))
const current = computed(() => questions.value[index.value] || null)

function start() {
  questions.value = shuffle(collectLevelQuestions(progress, level)).slice(0, 12)
  index.value = 0
  picked.value = null
  correct.value = 0
  phase.value = 'quiz'
}

function pick(oi) {
  if (picked.value !== null) return
  picked.value = oi
  if (oi === current.value.answer) {
    correct.value += 1
  } else {
    progress.addToReviewPool([`exam-L${level}-${index.value}`])
  }
}

function next() {
  if (index.value + 1 >= questions.value.length) {
    finish()
    return
  }
  index.value += 1
  picked.value = null
}

function finish() {
  const total = questions.value.length || 1
  const rate = correct.value / total
  passed.value = rate >= 0.7
  progress.recordQuiz({ correct: correct.value, total })
  if (passed.value) progress.completeLevelExam(level)
  phase.value = 'result'
}

onMounted(() => {
  progress.loadForCurrentUser()
  if (!progress.isLevelExamPassed(level)) {
    // 已通过则停留在结果展示可重测，直接进入 intro
  }
})
</script>

<style scoped>
.page-sub {
  color: var(--c-text-secondary);
  font-size: 13px;
  margin-top: 2px;
  margin-bottom: var(--space-md);
}
.empty-state {
  text-align: center;
  padding: 24px 8px;
  color: var(--c-text-secondary);
}
.empty-icon {
  font-size: 36px;
  margin-bottom: 8px;
}
.empty-hint {
  font-size: 13px;
  color: var(--c-text-muted);
  margin-top: 6px;
  margin-bottom: 14px;
}
.intro {
  text-align: center;
}
.intro-num {
  font-size: 48px;
  font-weight: 800;
  color: var(--c-primary);
}
.intro-text {
  color: var(--c-text-secondary);
  margin-bottom: 16px;
}
.intro-rules {
  list-style: none;
  padding: 0;
  margin: 0 0 20px;
  text-align: left;
  color: var(--c-text-secondary);
  font-size: 14px;
}
.intro-rules li {
  padding: 6px 0;
  border-bottom: 1px solid var(--c-border);
}
.intro-actions {
  display: flex;
  gap: var(--space-sm);
  justify-content: center;
}
.quiz-progress {
  font-size: 13px;
  color: var(--c-text-muted);
  margin-bottom: 16px;
  text-align: center;
}
.quiz-q {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  line-height: 1.5;
}
.quiz-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: 16px;
}
.quiz-opt {
  text-align: left;
  padding: 12px 14px;
  border: 1px solid var(--c-border);
  border-radius: 12px;
  background: var(--c-bg-soft);
  color: var(--c-text);
  font-size: 15px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.quiz-opt:not(:disabled):hover {
  border-color: var(--c-primary);
}
.quiz-opt.correct {
  border-color: var(--c-success, #22c55e);
  background: rgba(34, 197, 94, 0.12);
  color: var(--c-success, #15803d);
}
.quiz-opt.wrong {
  border-color: var(--c-danger, #ef4444);
  background: rgba(239, 68, 68, 0.1);
  color: var(--c-danger, #b91c1c);
}
.opt-label {
  display: inline-block;
  min-width: 22px;
  font-weight: 700;
}
.quiz-explain {
  background: var(--c-bg-soft);
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 14px;
  color: var(--c-text-secondary);
  margin-bottom: 16px;
}
.btn-block {
  width: 100%;
}
.result {
  text-align: center;
  padding: 16px 0;
}
.result-icon {
  font-size: 44px;
  margin-bottom: 8px;
}
.result-num {
  font-size: 36px;
  font-weight: 800;
  color: var(--c-primary);
}
.result-text {
  font-size: 16px;
  font-weight: 600;
  margin-top: 8px;
}
.result-hint {
  font-size: 13px;
  color: var(--c-text-muted);
  margin-top: 6px;
  margin-bottom: 20px;
}
.result-actions {
  display: flex;
  gap: var(--space-sm);
  justify-content: center;
}
</style>
