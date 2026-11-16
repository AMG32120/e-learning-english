<template>
  <div>
    <main class="page-container">
      <h1 class="page-title">学习周报</h1>
      <p class="page-sub">把这段时间的学习数据汇总成一张卡片，也可以存成图片</p>

      <div class="rp-ranges">
        <button
          v-for="r in RANGES"
          :key="r.value"
          class="rp-range"
          :class="{ active: range === r.value }"
          @click="range = r.value"
        >{{ r.label }}</button>
      </div>

      <section class="card">
        <div class="rp-head">
          <div>
            <div class="rp-period">{{ periodLabel }}</div>
            <div class="rp-summary">{{ summaryText }}</div>
          </div>
        </div>

        <div class="rp-grid">
          <div class="rp-stat">
            <div class="rp-num">{{ stats.studyDays }}</div>
            <div class="rp-label">学习天数</div>
          </div>
          <div class="rp-stat">
            <div class="rp-num">{{ stats.total }}</div>
            <div class="rp-label">完成题/词次</div>
          </div>
          <div class="rp-stat">
            <div class="rp-num">{{ stats.accuracy }}<span class="rp-unit">%</span></div>
            <div class="rp-label">正确率</div>
          </div>
          <div class="rp-stat">
            <div class="rp-num">{{ stats.review }}</div>
            <div class="rp-label">复习次数</div>
          </div>
          <div class="rp-stat">
            <div class="rp-num">{{ stats.newWords }}</div>
            <div class="rp-label">新增掌握词</div>
          </div>
          <div class="rp-stat">
            <div class="rp-num">{{ progress.streakDays }}</div>
            <div class="rp-label">当前连续打卡</div>
          </div>
        </div>

        <!-- 每日学习量 -->
        <div class="rp-chart">
          <div class="rp-chart-title">每日学习量</div>
          <div class="rp-bars">
            <div v-for="(d, i) in days" :key="d.key" class="rp-bar-col" :title="`${d.key}：${d.total}`">
              <div class="rp-bar-track">
                <div class="rp-bar" :style="{ height: barHeight(d.total) }"></div>
              </div>
              <span v-if="showLabel(i)" class="rp-bar-label">{{ d.label }}</span>
              <span v-else class="rp-bar-label rp-bar-label-empty"></span>
            </div>
          </div>
        </div>

        <p v-if="!stats.total" class="rp-empty">这段时间还没有学习记录，去闯一关试试吧。</p>
      </section>

      <!-- 分享图 -->
      <section class="card rp-share">
        <h2 class="card-title">生成分享图</h2>
        <p class="data-tip">把这份周报保存成 PNG 图片，可以发朋友圈或存下来做记录。</p>
        <button class="btn btn-primary btn-block" :disabled="generating" @click="makePoster">
          {{ generating ? '生成中…' : '🖼 生成分享图' }}
        </button>
        <div v-if="posterUrl" class="rp-poster">
          <img :src="posterUrl" alt="学习周报分享图" class="rp-poster-img" />
          <a class="btn btn-soft btn-block" :href="posterUrl" :download="posterName">下载图片</a>
        </div>
      </section>

      <div class="rp-links">
        <router-link class="btn btn-ghost" to="/progress">查看学习进度</router-link>
        <router-link class="btn btn-ghost" to="/">回到首页</router-link>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { useProgressStore, dailyVolume } from '../stores/progress'

const progress = useProgressStore()

const RANGES = [
  { value: 7, label: '近 7 天' },
  { value: 30, label: '近 30 天' }
]
const range = ref(7)

function pad(n) {
  return n < 10 ? `0${n}` : `${n}`
}
function dayKey(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
function shortLabel(d) {
  return `${d.getMonth() + 1}/${d.getDate()}`
}

const days = computed(() => {
  const daily = (progress.data && progress.data.stats && progress.data.stats.daily) || {}
  const checkins = (progress.data && progress.data.checkins) || {}
  const out = []
  for (let i = range.value - 1; i >= 0; i -= 1) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = dayKey(d)
    const rec = daily[key] || {}
    const total = dailyVolume(rec)
    out.push({
      key,
      label: shortLabel(d),
      total,
      checked: !!checkins[key],
      attempted: (rec.quiz || 0) + (rec.spell || 0) + (rec.dict || 0),
      correct: (rec.quizCorrect || 0) + (rec.spellCorrect || 0) + (rec.dictCorrect || 0),
      review: rec.review || 0
    })
  }
  return out
})

const stats = computed(() => {
  let total = 0
  let attempted = 0
  let correct = 0
  let review = 0
  let studyDays = 0
  for (const d of days.value) {
    total += d.total
    attempted += d.attempted
    correct += Math.min(d.correct, d.attempted)
    review += d.review
    if (d.total > 0 || d.checked) studyDays += 1
  }
  // 新增掌握词：区间首尾词汇量快照差
  const history = (progress.data && progress.data.stats && progress.data.stats.vocabHistory) || []
  const from = days.value.length ? days.value[0].key : ''
  const inRange = history.filter((h) => h.date >= from)
  const newWords = inRange.length >= 2 ? Math.max(0, inRange[inRange.length - 1].count - inRange[0].count) : 0
  return {
    total,
    attempted,
    correct,
    review,
    studyDays,
    newWords,
    accuracy: attempted ? Math.round((correct / attempted) * 100) : 0
  }
})

const maxTotal = computed(() => Math.max(1, ...days.value.map((d) => d.total)))

function barHeight(n) {
  if (!n) return '2px'
  return `${Math.max(4, Math.round((n / maxTotal.value) * 100))}%`
}

/* 30 天时只显示部分日期标签，避免拥挤 */
function showLabel(i) {
  const n = days.value.length
  if (n <= 7) return true
  return i % 5 === 0 || i === n - 1
}

const periodLabel = computed(() => {
  if (!days.value.length) return ''
  return `${days.value[0].key} ~ ${days.value[days.value.length - 1].key}`
})

const summaryText = computed(() => {
  if (!stats.value.total) return '本期还没有学习记录'
  if (stats.value.accuracy >= 90) return '正确率很稳，保持这个节奏！'
  if (stats.value.accuracy >= 75) return '整体不错，错题多过两遍会更牢'
  return '错题偏多，建议先复习再往前推进'
})

/* ---------- 分享图 ---------- */

const generating = ref(false)
const posterUrl = ref('')
const posterName = computed(() => `qicheng-report-${range.value}d-${dayKey(new Date())}.png`)

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function makePoster() {
  if (generating.value) return
  generating.value = true
  try {
    const W = 750
    const H = 1080
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')

    // 背景
    const bg = ctx.createLinearGradient(0, 0, W, H)
    bg.addColorStop(0, '#2F7CF6')
    bg.addColorStop(1, '#34c48b')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    // 白色卡片
    ctx.fillStyle = '#ffffff'
    roundRect(ctx, 50, 90, W - 100, H - 180, 28)
    ctx.fill()

    // 标题
    ctx.fillStyle = '#1f2d3d'
    ctx.font = '800 44px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('我的英语学习周报', W / 2, 180)
    ctx.fillStyle = '#93a1b3'
    ctx.font = '22px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif'
    ctx.fillText(periodLabel.value, W / 2, 222)

    // 三个主数字
    const cols = [
      { num: `${stats.value.studyDays}`, unit: '天', label: '学习天数' },
      { num: `${stats.value.total}`, unit: '题', label: '完成题/词次' },
      { num: `${stats.value.accuracy}`, unit: '%', label: '正确率' }
    ]
    cols.forEach((c, i) => {
      const cx = 150 + i * 225
      ctx.fillStyle = '#2F7CF6'
      ctx.font = '800 54px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif'
      const numW = ctx.measureText(c.num).width
      ctx.textAlign = 'left'
      ctx.fillText(c.num, cx - numW / 2 - 8, 330)
      ctx.fillStyle = '#5b6b7f'
      ctx.font = '600 24px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif'
      ctx.fillText(c.unit, cx - numW / 2 + numW + 0, 330)
      ctx.fillStyle = '#93a1b3'
      ctx.font = '22px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(c.label, cx, 368)
    })

    // 柱状图
    const chartX = 110
    const chartY = 430
    const chartW = W - 220
    const chartH = 260
    ctx.strokeStyle = '#e5ecf7'
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i += 1) {
      const y = chartY + (chartH / 4) * i
      ctx.beginPath()
      ctx.moveTo(chartX, y)
      ctx.lineTo(chartX + chartW, y)
      ctx.stroke()
    }
    const list = days.value
    const gap = list.length > 10 ? 4 : 10
    const bw = (chartW - gap * (list.length - 1)) / list.length
    const maxV = maxTotal.value
    list.forEach((d, i) => {
      const h = d.total ? Math.max(6, (d.total / maxV) * (chartH - 10)) : 2
      const x = chartX + i * (bw + gap)
      const y = chartY + chartH - h
      const grad = ctx.createLinearGradient(0, y, 0, chartY + chartH)
      grad.addColorStop(0, '#2F7CF6')
      grad.addColorStop(1, '#8fbcfd')
      ctx.fillStyle = d.total ? grad : '#eef2fa'
      roundRect(ctx, x, y, bw, h, Math.min(6, bw / 2))
      ctx.fill()
    })
    ctx.fillStyle = '#93a1b3'
    ctx.font = '20px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(list.length ? list[0].label : '', chartX, chartY + chartH + 30)
    ctx.textAlign = 'right'
    ctx.fillText(list.length ? list[list.length - 1].label : '', chartX + chartW, chartY + chartH + 30)

    // 底部数据条
    ctx.textAlign = 'left'
    ctx.fillStyle = '#5b6b7f'
    ctx.font = '24px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif'
    ctx.fillText(`复习 ${stats.value.review} 次 · 新增掌握 ${stats.value.newWords} 词 · 连续打卡 ${progress.streakDays} 天`, 110, 780)

    // 徽章/提示
    ctx.fillStyle = '#f5f8fd'
    roundRect(ctx, 90, 820, W - 180, 110, 18)
    ctx.fill()
    ctx.fillStyle = '#1f2d3d'
    ctx.font = '600 26px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif'
    ctx.fillText('启程英语 · 从字母到雅思', 120, 868)
    ctx.fillStyle = '#93a1b3'
    ctx.font = '22px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif'
    ctx.fillText('qicheng.worldorigin.dpdns.org', 120, 906)

    // 导出
    canvas.toBlob((blob) => {
      if (!blob) return
      if (posterUrl.value) URL.revokeObjectURL(posterUrl.value)
      posterUrl.value = URL.createObjectURL(blob)
    }, 'image/png')
  } finally {
    generating.value = false
  }
}

onBeforeUnmount(() => {
  if (posterUrl.value) URL.revokeObjectURL(posterUrl.value)
})
</script>

<style scoped>
.page-sub {
  color: var(--c-text-secondary);
  font-size: 13px;
  margin-top: 2px;
  margin-bottom: var(--space-md);
}

.rp-ranges {
  display: flex;
  gap: var(--space-xs);
  margin-bottom: var(--space-md);
}

.rp-range {
  border: 2px solid var(--c-border);
  background: var(--c-bg-card);
  color: var(--c-text-secondary);
  border-radius: 999px;
  padding: 8px 18px;
  font-size: 13px;
  cursor: pointer;
}

.rp-range.active {
  border-color: var(--c-primary);
  color: var(--c-primary);
  background: var(--c-primary-light);
  font-weight: 700;
}

.rp-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-md);
}

.rp-period {
  font-size: 13px;
  color: var(--c-text-muted);
  font-variant-numeric: tabular-nums;
}

.rp-summary {
  font-size: 15px;
  font-weight: 700;
  margin-top: 4px;
}

.rp-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.rp-stat {
  text-align: center;
  background: var(--c-bg-soft);
  border-radius: var(--radius-md);
  padding: 12px 6px;
}

.rp-num {
  font-size: 22px;
  font-weight: 800;
  color: var(--c-primary);
  font-variant-numeric: tabular-nums;
}

.rp-unit {
  font-size: 13px;
  margin-left: 1px;
}

.rp-label {
  font-size: 12px;
  color: var(--c-text-secondary);
  margin-top: 2px;
}

.rp-chart-title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: var(--space-sm);
}

.rp-bars {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 150px;
}

.rp-bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  min-width: 0;
}

.rp-bar-track {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.rp-bar {
  width: 100%;
  max-width: 26px;
  background: linear-gradient(180deg, var(--c-primary), var(--c-primary-light));
  border-radius: 4px 4px 0 0;
  transition: height 0.4s ease;
}

.rp-bar-label {
  font-size: 10px;
  color: var(--c-text-muted);
  margin-top: 6px;
  height: 14px;
  white-space: nowrap;
}

.rp-bar-label-empty {
  visibility: hidden;
}

.rp-empty {
  font-size: 13px;
  color: var(--c-text-muted);
  text-align: center;
  margin-top: var(--space-md);
}

.data-tip {
  font-size: 13px;
  color: var(--c-text-secondary);
  margin-bottom: var(--space-sm);
}

.rp-poster {
  margin-top: var(--space-md);
}

.rp-poster-img {
  width: 100%;
  border-radius: var(--radius-md);
  border: 1px solid var(--c-border);
  margin-bottom: var(--space-sm);
  display: block;
}

.rp-links {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-md);
}

@media (max-width: 480px) {
  .rp-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .rp-bars {
    gap: 3px;
  }
  .rp-bar-label {
    font-size: 9px;
  }
}
</style>
