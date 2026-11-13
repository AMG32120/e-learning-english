<template>
  <div class="page-container home">
    <h1 class="page-title">你好，{{ auth.nickname }}</h1>
    <p class="page-subtitle">{{ todayGreeting }}，今天也要加油闯关！</p>

    <!-- 今日推荐 -->
    <div class="card home-recommend" @click="goRecommended">
      <div class="recommend-label">今日推荐关卡</div>
      <div class="recommend-title">{{ recommendStage.title }}</div>
      <div class="recommend-desc">{{ recommendStage.desc }}</div>
      <button class="btn btn-primary">开始闯关</button>
    </div>

    <!-- 复习提醒 -->
    <router-link v-if="progress.reviewDueCount > 0" to="/review" class="alert alert-warn home-review">
      你有 {{ progress.reviewDueCount }} 个待复习内容，点击开始间隔复习
    </router-link>

    <!-- 每日一句 -->
    <div class="card home-daily">
      <div class="daily-head">
        <span class="daily-label">每日一句</span>
        <span v-if="!dailyUnlocked" class="daily-lock">完成 L1 第 1 关后开放</span>
      </div>
      <template v-if="dailyUnlocked">
        <div class="daily-en">
          <span>{{ dailySentence.en }}</span>
          <TtsButton :text="dailySentence.en" :rate="0.8" />
        </div>
        <p class="daily-zh">{{ dailySentence.zh }}</p>
        <p class="daily-tip">{{ dailySentence.tip }}</p>
      </template>
      <p v-else class="daily-zh">🔒 每日一句尚未开放</p>
    </div>

    <!-- 总体进度 -->
    <div class="card home-stats">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-num">{{ progress.totalCompletedStages }}/{{ availableTotal }}</div>
          <div class="stat-label">已通关关卡</div>
        </div>
        <div class="stat-item">
          <div class="stat-num">{{ progress.checkedInToday ? '已打卡' : '未打卡' }}</div>
          <div class="stat-label">今日打卡</div>
        </div>
        <div class="stat-item">
          <div class="stat-num">{{ progress.badges.length }}</div>
          <div class="stat-label">成就徽章</div>
        </div>
      </div>
      <div class="home-progress-bar">
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: overallPercent + '%' }"
          ></div>
        </div>
        <div class="home-progress-text">总体完成度 {{ overallPercent }}%</div>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="home-actions">
      <router-link to="/map" class="btn btn-soft">闯关地图</router-link>
      <router-link to="/quiz" class="btn btn-soft">随机测验</router-link>
      <router-link to="/review" class="btn btn-soft">间隔复习</router-link>
      <router-link to="/progress" class="btn btn-ghost">学习进度</router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useProgressStore } from '../stores/progress'
import { LEVELS, getStageById } from '../data/levels'
import { getDailySentenceByDate } from '../data/daily'
import TtsButton from '../components/TtsButton.vue'

const router = useRouter()
const auth = useAuthStore()
const progress = useProgressStore()

const availableTotal = LEVELS.reduce(
  (sum, lv) => sum + lv.stages.filter((s) => s.available !== false).length,
  0
)

/* 每日一句：完成 L1 第 1 关后开放 */
const dailyUnlocked = computed(() => {
  const st = progress.data && progress.data.progress.stages['L1-1']
  return !!(st && st.completed)
})

const dailySentence = computed(() => getDailySentenceByDate(new Date()))

const recommendStage = computed(() => getStageById(progress.recommendedStage) || { title: '未知关卡', desc: '' })

const overallPercent = computed(() => {
  if (!availableTotal) return 0
  return Math.round((progress.totalCompletedStages / availableTotal) * 100)
})

const todayGreeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 12) return '早上好'
  if (h < 18) return '下午好'
  return '晚上好'
})

function goRecommended() {
  const st = recommendStage.value
  if (st && st.available !== false && progress.isStageUnlocked(st.id)) {
    router.push(`/stage/${st.id}`)
  } else {
    router.push('/map')
  }
}
</script>

<style scoped>
.home-recommend {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  margin-bottom: var(--space-md);
}

.recommend-label {
  font-size: 13px;
  color: var(--c-text-muted);
}

.recommend-title {
  font-size: 22px;
  font-weight: 800;
  color: var(--c-primary);
}

.recommend-desc {
  font-size: 14px;
  color: var(--c-text-secondary);
  margin-bottom: var(--space-xs);
}

.home-review {
  margin-bottom: var(--space-md);
}

.home-daily {
  margin-bottom: var(--space-md);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.stat-item {
  text-align: center;
}

.stat-num {
  font-size: 22px;
  font-weight: 800;
  color: var(--c-primary);
}

.stat-label {
  font-size: 13px;
  color: var(--c-text-secondary);
}

.home-progress-text {
  font-size: 13px;
  color: var(--c-text-secondary);
  margin-top: var(--space-xs);
}

.home-actions {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-md);
}
</style>
