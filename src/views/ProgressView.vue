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

    <!-- 学习统计图表 -->
    <div class="card progress-charts">
      <h2 class="card-title">学习统计</h2>

      <!-- 打卡热力图（近 12 周） -->
      <div class="chart-subtitle">打卡热力图（近 12 周）</div>
      <div class="heatmap" aria-label="打卡热力图">
        <div v-for="col in heatmap" :key="col.week" class="heatmap-col">
          <div
            v-for="cell in col.days"
            :key="cell.key"
            class="heatmap-cell"
            :class="{ 'l1': cell.level === 1, 'l2': cell.level === 2, 'l3': cell.level === 3, future: cell.future }"
            :title="cell.key + (cell.count ? `（${cell.count} 项练习）` : '')"
          ></div>
        </div>
      </div>
      <div class="heatmap-legend">
        <span>少</span>
        <div class="heatmap-cell"></div>
        <div class="heatmap-cell l1"></div>
        <div class="heatmap-cell l2"></div>
        <div class="heatmap-cell l3"></div>
        <span>多</span>
      </div>

      <!-- 近 14 天学习量 -->
      <div class="chart-subtitle">近 14 天学习量</div>
      <div class="daily-chart">
        <div v-for="d in dailyBars" :key="d.key" class="daily-col">
          <div class="daily-bar-wrap">
            <div class="daily-bar" :style="{ height: d.height + '%' }" :title="`${d.key}：${d.count} 项`"></div>
          </div>
          <div class="daily-label">{{ d.label }}</div>
        </div>
      </div>

      <!-- 词汇量增长曲线 -->
      <div class="chart-subtitle">词汇量增长曲线</div>
      <div v-if="vocabLine && vocabLine.points.length >= 2" class="vocab-chart">
        <svg :viewBox="`0 0 ${vocabLine.w} ${vocabLine.h}`" preserveAspectRatio="none" class="vocab-svg">
          <polyline :points="vocabLine.line" fill="none" stroke="var(--c-primary)" stroke-width="2.5" stroke-linejoin="round" />
          <polygon :points="vocabLine.area" fill="var(--c-primary)" opacity="0.12" />
          <circle :cx="vocabLine.points[vocabLine.points.length - 1].x" :cy="vocabLine.points[vocabLine.points.length - 1].y" r="3.5" fill="var(--c-primary)" />
        </svg>
        <div class="vocab-caption">
          当前掌握 <strong>{{ progress.masteredWordCount }}</strong> 词
          <template v-if="vocabGrowth > 0">（近段时间 +{{ vocabGrowth }}）</template>
        </div>
      </div>
      <div v-else class="chart-empty">完成关卡后这里会出现词汇量增长曲线</div>

      <div class="vocab-test-row">
        <router-link class="btn btn-soft" to="/vocabtest">📏 测测词汇量</router-link>
        <span v-if="lastVocabEstimate" class="vocab-est">
          上次估算：约 <strong>{{ lastVocabEstimate.value }}</strong> 词
        </span>
      </div>
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

/* ---------- 学习统计图表 ---------- */

/* 热力图：近 12 周（周一到周日排列），按当日学习项数分 4 档 */
const heatmap = computed(() => {
  const daily = (progress.data && progress.data.stats && progress.data.stats.daily) || {}
  const checkins = (progress.data && progress.data.checkins) || {}
  const cols = []
  const end = new Date()
  // 对齐到本周周日为最后一列
  const weekStart = new Date(end)
  weekStart.setDate(end.getDate() - ((end.getDay() + 6) % 7) - 7 * 11) // 12 周前的周一
  for (let w = 0; w < 12; w++) {
    const days = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart)
      d.setDate(weekStart.getDate() + w * 7 + i)
      const key = fmt(d)
      const count = countOfDay(daily[key])
      const future = d > end
      let level = 0
      if (!future && (checkins[key] || count > 0)) {
        level = count >= 20 ? 3 : count >= 8 ? 2 : 1
      }
      days.push({ key, count, level, future })
    }
    cols.push({ week: w, days })
  }
  return cols
})

function fmt(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function countOfDay(day) {
  if (!day) return 0
  return (day.quiz || 0) + (day.review || 0) + (day.spell || 0) + (day.dict || 0) + (day.stage || 0)
}

/* 近 14 天每日学习量柱状图 */
const dailyBars = computed(() => {
  const daily = (progress.data && progress.data.stats && progress.data.stats.daily) || {}
  const arr = []
  let max = 0
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = fmt(d)
    const count = countOfDay(daily[key])
    max = Math.max(max, count)
    arr.push({ key, count, label: `${d.getMonth() + 1}/${d.getDate()}` })
  }
  return arr.map((x) => ({ ...x, height: max ? Math.round((x.count / max) * 100) : 0 }))
})

/* 词汇量增长曲线（SVG 折线 + 渐变面积） */
const vocabLine = computed(() => {
  const history = (progress.data && progress.data.stats && progress.data.stats.vocabHistory) || []
  if (history.length < 2) return null
  const w = 320
  const h = 120
  const pad = 8
  const maxCount = Math.max(...history.map((p) => p.count))
  const minCount = Math.min(...history.map((p) => p.count))
  const span = Math.max(maxCount - minCount, 10)
  const step = history.length > 1 ? (w - pad * 2) / (history.length - 1) : 0
  const points = history.map((p, i) => ({
    x: Math.round(pad + i * step),
    y: Math.round(h - pad - ((p.count - minCount) / span) * (h - pad * 2)),
    count: p.count
  }))
  const line = points.map((p) => `${p.x},${p.y}`).join(' ')
  const first = points[0]
  const last = points[points.length - 1]
  const area = `${line} ${last.x},${h - pad} ${first.x},${h - pad}`
  return { w, h, points, line, area }
})

const vocabGrowth = computed(() => {
  const history = (progress.data && progress.data.stats && progress.data.stats.vocabHistory) || []
  if (history.length < 2) return 0
  return history[history.length - 1].count - history[0].count
})

const lastVocabEstimate = computed(() => {
  const list = (progress.data && progress.data.stats && progress.data.stats.vocabEstimates) || []
  return list.length ? list[list.length - 1] : null
})

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
.progress-badges,
.progress-charts {
  margin-top: var(--space-md);
}

/* 图表 */
.chart-subtitle {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text-secondary);
  margin: 18px 0 10px;
}

.chart-subtitle:first-of-type {
  margin-top: 0;
}

.heatmap {
  display: flex;
  gap: 3px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.heatmap-col {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.heatmap-cell {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background: var(--c-bg-soft);
  border: 1px solid var(--c-border);
  flex-shrink: 0;
}

.heatmap-cell.l1 {
  background: color-mix(in srgb, var(--c-primary) 35%, white);
  border-color: transparent;
}

.heatmap-cell.l2 {
  background: color-mix(in srgb, var(--c-primary) 60%, white);
  border-color: transparent;
}

.heatmap-cell.l3 {
  background: var(--c-primary);
  border-color: transparent;
}

.heatmap-cell.future {
  opacity: 0.35;
}

.heatmap-legend {
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: flex-end;
  margin-top: 8px;
  font-size: 11px;
  color: var(--c-text-muted);
}

.daily-chart {
  display: flex;
  gap: 6px;
  align-items: flex-end;
  height: 110px;
}

.daily-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
}

.daily-bar-wrap {
  flex: 1;
  display: flex;
  align-items: flex-end;
}

.daily-bar {
  width: 100%;
  min-height: 2px;
  border-radius: 4px 4px 0 0;
  background: var(--c-primary);
  transition: height 0.3s;
}

.daily-label {
  font-size: 10px;
  color: var(--c-text-muted);
  text-align: center;
  transform: rotate(0deg);
  white-space: nowrap;
  overflow: hidden;
  margin-top: 4px;
}

.vocab-chart {
  width: 100%;
}

.vocab-svg {
  width: 100%;
  height: 120px;
  display: block;
}

.vocab-caption {
  font-size: 13px;
  color: var(--c-text-secondary);
  margin-top: 6px;
}

.vocab-caption strong {
  color: var(--c-primary);
  font-size: 15px;
}

.chart-empty {
  font-size: 13px;
  color: var(--c-text-muted);
  text-align: center;
  padding: 16px 0;
}

.vocab-test-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-top: var(--space-md);
  flex-wrap: wrap;
}

.vocab-est {
  font-size: 13px;
  color: var(--c-text-secondary);
}

.vocab-est strong {
  color: var(--c-primary);
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
