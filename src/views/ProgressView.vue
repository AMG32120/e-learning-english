<template>
  <div class="page-container progress-page">
    <h1 class="page-title">学习进度</h1>
    <p class="page-subtitle">闯关记录、打卡与成就</p>

    <!-- 统计 -->
    <div class="card progress-stats">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-num">{{ progress.totalCompletedStages }}/{{ availableTotal }}</div>
          <div class="stat-label">已通关关卡</div>
        </div>
        <div class="stat-item">
          <div class="stat-num">{{ quizAccuracy }}%</div>
          <div class="stat-label">答题正确率</div>
        </div>
        <div class="stat-item">
          <div class="stat-num">{{ reviewPoolCount }}</div>
          <div class="stat-label">复习池项目</div>
        </div>
      </div>
    </div>

    <!-- 打卡 -->
    <div class="card progress-checkin">
      <h2 class="card-title">打卡记录</h2>
      <div class="checkin-week">
        <div v-for="(d, i) in last7Days" :key="i" class="checkin-day">
          <div class="checkin-dot" :class="{ active: isChecked(d.key), today: d.key === today }"></div>
          <div class="checkin-date">{{ d.label }}</div>
        </div>
      </div>
      <div class="checkin-total">累计打卡 {{ checkinTotal }} 天</div>
    </div>

    <!-- 各等级进度 -->
    <div class="card progress-levels">
      <h2 class="card-title">等级进度</h2>
      <div v-for="lv in LEVELS" :key="lv.level" class="level-row">
        <div class="level-row-name">L{{ lv.level }} {{ lv.name }}</div>
        <div class="level-row-bar">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: lvp(lv.level).percent + '%' }"
            ></div>
          </div>
        </div>
        <div class="level-row-num">{{ lvp(lv.level).completed }}/{{ lvp(lv.level).total }}</div>
      </div>
    </div>

    <!-- 徽章 -->
    <div class="card progress-badges">
      <h2 class="card-title">成就徽章</h2>
      <div v-if="progress.badges.length" class="badge-list">
        <span
          v-for="b in progress.badges"
          :key="b"
          class="badge-chip"
        >{{ badgeLabel(b) }}</span>
      </div>
      <div v-else class="empty-state">还没有徽章，完成关卡即可获得</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { LEVELS } from '../data/levels'
import { useProgressStore } from '../stores/progress'

const progress = useProgressStore()

const availableTotal = LEVELS.reduce(
  (sum, lv) => sum + lv.stages.filter((s) => s.available !== false).length,
  0
)

const quizAccuracy = computed(() => {
  const stats = progress.data ? progress.data.stats : null
  if (!stats || !stats.quizCount) return 0
  return Math.round((stats.quizCorrect / stats.quizCount) * 100)
})

const reviewPoolCount = computed(() => {
  return progress.data ? Object.keys(progress.data.reviewPool || {}).length : 0
})

const today = (() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})()

const last7Days = computed(() => {
  const arr = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()]
    arr.push({ key, label: i === 0 ? '今天' : week })
  }
  return arr
})

function isChecked(key) {
  return !!(progress.data && progress.data.checkins && progress.data.checkins[key])
}

const checkinTotal = computed(() => {
  return progress.data ? Object.keys(progress.data.checkins || {}).length : 0
})

function lvp(level) {
  return progress.getLevelProgress(level)
}

function badgeLabel(id) {
  const map = {
    first_stage: '初次通关',
    full_score: '满分之星'
  }
  return map[id] || id
}
</script>

<style scoped>
.card-title {
  font-size: 16px;
  margin-bottom: var(--space-md);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm);
}

.stat-item {
  text-align: center;
}

.stat-num {
  font-size: 24px;
  font-weight: 800;
  color: var(--c-primary);
}

.stat-label {
  font-size: 13px;
  color: var(--c-text-secondary);
}

.progress-checkin,
.progress-levels,
.progress-badges {
  margin-top: var(--space-md);
}

.checkin-week {
  display: flex;
  gap: var(--space-sm);
  justify-content: space-between;
}

.checkin-day {
  text-align: center;
  flex: 1;
}

.checkin-dot {
  width: 28px;
  height: 28px;
  margin: 0 auto 4px;
  border-radius: 50%;
  background: var(--c-bg-soft);
  border: 2px solid var(--c-border);
}

.checkin-dot.active {
  background: var(--c-accent);
  border-color: var(--c-accent);
}

.checkin-date {
  font-size: 12px;
  color: var(--c-text-muted);
}

.checkin-total {
  margin-top: var(--space-md);
  font-size: 14px;
  color: var(--c-text-secondary);
}

.level-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
}

.level-row-name {
  width: 180px;
  font-size: 14px;
  flex-shrink: 0;
}

.level-row-bar {
  flex: 1;
}

.level-row-num {
  width: 48px;
  text-align: right;
  font-size: 13px;
  color: var(--c-text-secondary);
}

.badge-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

@media (max-width: 767px) {
  .level-row {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-xxs);
  }

  .level-row-name {
    width: auto;
  }

  .level-row-num {
    width: auto;
    text-align: left;
  }
}
</style>
