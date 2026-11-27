<template>
  <div class="page-container level">
    <button class="back-btn" @click="router.push('/map')">← 返回地图</button>
    <h1 class="page-title">L{{ lv.level }} {{ lv.name }}</h1>
    <p class="page-subtitle">{{ lv.desc }}</p>

    <div v-if="lv.available === false" class="alert alert-info">
      本等级内容将在后续阶段开放，敬请期待。
    </div>

    <!-- 阶段综合测验入口 -->
    <div v-if="lv.available !== false" class="card exam-entry">
      <div class="exam-entry-head">
        <span class="exam-entry-title">阶段综合测验</span>
        <span v-if="progress.isLevelExamPassed(lv.level)" class="badge-chip">已通过</span>
        <span v-else-if="examUnlocked" class="badge-chip">可挑战</span>
      </div>
      <p class="exam-entry-desc">
        {{ examDesc }}
      </p>
      <button
        class="btn btn-primary"
        :disabled="!examUnlocked"
        @click="router.push(`/exam/${lv.level}`)"
      >
        {{ progress.isLevelExamPassed(lv.level) ? '再次挑战' : '开始测验' }}
      </button>
    </div>

    <div v-if="hasUnits" class="unit-toolbar">
      <span class="unit-progress">已完成 {{ completedUnits }} / {{ groups.length }} 个单元</span>
      <button class="link-btn" @click="toggleAll">{{ allOpen ? '全部收起' : '展开全部' }}</button>
    </div>

    <div class="unit-list">
      <section v-for="(g, gi) in groups" :key="gi" class="unit-block">
        <button
          v-if="g.title"
          class="unit-head"
          :class="{ open: isOpen(g) }"
          @click="toggle(g)"
        >
          <span class="unit-caret" :class="{ open: isOpen(g) }">▸</span>
          <span class="unit-emoji">{{ g.emoji }}</span>
          <span class="unit-meta">
            <span class="unit-title-row">
              <span class="unit-title">单元 {{ g.unit }} · {{ g.title }}</span>
              <span class="unit-stars">{{ g.stars }} / {{ g.max }} ★</span>
            </span>
            <span class="unit-sub">
              <span class="unit-bar">
                <span
                  class="unit-bar-fill"
                  :class="{ done: g.stages.length && g.completed === g.stages.length }"
                  :style="{ width: (g.stages.length ? (g.completed / g.stages.length) * 100 : 0) + '%' }"
                ></span>
              </span>
              <span class="unit-count">{{ g.completed }} / {{ g.stages.length }} 关</span>
            </span>
          </span>
        </button>
        <div v-show="!g.title || isOpen(g)" class="grid-stages">
          <button
            v-for="st in g.stages"
            :key="st.id"
            class="stage-card"
            :class="{
              locked: !unlocked(st),
              completed: record(st) && record(st).completed,
              current: st.id === currentStageId
            }"
            :disabled="!unlocked(st)"
            @click="openStage(st)"
          >
            <div class="stage-card-head">
              <span class="stage-num">第 {{ st.stage }} 关</span>
              <span v-if="st.id === currentStageId" class="current-chip">进行中</span>
              <span v-else-if="st.available === false" class="badge-chip">后续开放</span>
              <span v-else-if="record(st)" class="stars">
                <span v-for="i in 3" :key="i" class="star" :class="{ empty: i > record(st).bestStars }">★</span>
              </span>
            </div>
            <div class="stage-title">{{ st.title }}</div>
            <div class="stage-desc">{{ st.desc }}</div>
            <div v-if="!unlocked(st)" class="stage-lock">🔒 未解锁</div>
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getLevel } from '../data/levels'
import { useProgressStore } from '../stores/progress'

const route = useRoute()
const router = useRouter()
const progress = useProgressStore()

const lv = computed(() => getLevel(Number(route.params.level)) || { level: 0, name: '', desc: '', stages: [] })

/* 按单元分组：L2/L5 主题驱动关卡带 unit 字段，其余等级平铺 */
const groups = computed(() => {
  const list = lv.value.stages || []
  if (!list.some((s) => s.unit)) {
    return [{ unit: 0, title: '', emoji: '', stages: list, stars: 0, max: list.length * 3 }]
  }
  const map = new Map()
  for (const st of list) {
    if (!map.has(st.unit)) {
      map.set(st.unit, { unit: st.unit, title: st.unitTitle || '', emoji: st.unitEmoji || '', stages: [] })
    }
    map.get(st.unit).stages.push(st)
  }
  return [...map.values()].map((g) => ({
    ...g,
    stars: g.stages.reduce((sum, st) => sum + ((progress.stages[st.id] && progress.stages[st.id].bestStars) || 0), 0),
    max: g.stages.length * 3,
    completed: g.stages.filter((st) => record(st) && record(st).completed).length
  }))
})

const examUnlocked = computed(() => {
  return lv.value.available !== false && progress.isLevelExamUnlocked(lv.value.level)
})

const examDesc = computed(() => {
  if (progress.isLevelExamPassed(lv.value.level)) {
    return '本等级综合测验已通过，可再次挑战刷新成绩。'
  }
  if (examUnlocked.value) {
    return '已完成本等级闯关，挑战综合测验检验阶段成果（正确率 ≥70% 通过）。'
  }
  const lp = progress.getLevelProgress(lv.value.level)
  return `完成本等级全部 ${lp.total} 关后可挑战阶段综合测验（当前 ${lp.completed}/${lp.total}）。`
})

/* ---------- 单元折叠：默认全部展开，用户可手动收起单个单元 ---------- */
const manualOpen = ref({})

const hasUnits = computed(() => groups.value.some((g) => g.title))

/* 进行中的关卡：全等级内第一个已解锁且未通关的关卡（用于高亮） */
const currentStageId = computed(() => {
  for (const g of groups.value) {
    for (const st of g.stages) {
      if (st.available !== false && unlocked(st) && !(record(st) && record(st).completed)) {
        return st.id
      }
    }
  }
  return ''
})

function isOpen(g) {
  if (!g.title) return true
  if (g.unit in manualOpen.value) return manualOpen.value[g.unit]
  return true
}

const allOpen = computed(() => {
  if (!hasUnits.value) return true
  return groups.value.every((g) => isOpen(g))
})

const completedUnits = computed(
  () => groups.value.filter((g) => g.stages.every((st) => record(st) && record(st).completed)).length
)

function toggle(g) {
  manualOpen.value = { ...manualOpen.value, [g.unit]: !isOpen(g) }
}

function toggleAll() {
  const next = !allOpen.value
  const map = {}
  groups.value.forEach((g) => {
    map[g.unit] = next
  })
  manualOpen.value = map
}

function record(st) {
  return progress.stages[st.id] || null
}

function unlocked(st) {
  return st.available !== false && progress.isStageUnlocked(st.id)
}

function openStage(st) {
  if (st.available === false) {
    alert('该关卡内容将在后续阶段开放')
    return
  }
  if (!progress.isStageUnlocked(st.id)) {
    alert('请先完成上一关')
    return
  }
  router.push(`/stage/${st.id}`)
}
</script>

<style scoped>
.back-btn {
  background: none;
  border: none;
  color: var(--c-primary);
  font-size: 14px;
  margin-bottom: var(--space-sm);
  cursor: pointer;
}

.stage-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-xs);
}

.unit-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.unit-block {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.unit-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
  font-size: 13px;
  color: var(--c-text-muted);
}

/* ---------- 单元头：卡片式 + 完成度进度条 ---------- */
.unit-head {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid var(--c-border);
  border-radius: 14px;
  background: var(--c-surface);
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}

.unit-head:hover {
  background: var(--c-surface-2);
  border-color: var(--c-primary, #3b82f6);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.unit-head.open {
  border-color: var(--c-primary, #3b82f6);
  background: var(--c-surface-2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.unit-caret {
  font-size: 13px;
  color: var(--c-text-muted);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.unit-caret.open {
  transform: rotate(90deg);
}

.unit-emoji {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  line-height: 1;
  background: var(--c-surface-2);
  border-radius: 10px;
  flex-shrink: 0;
}

.unit-head.open .unit-emoji {
  background: var(--c-bg-card, #fff);
}

.unit-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.unit-title-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-sm);
}

.unit-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--c-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unit-stars {
  font-size: 12px;
  color: #f5a623;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.unit-sub {
  display: flex;
  align-items: center;
  gap: 10px;
}

.unit-bar {
  flex: 1;
  height: 5px;
  border-radius: 3px;
  background: var(--c-border, #e0e0e0);
  overflow: hidden;
}

.unit-bar-fill {
  display: block;
  height: 100%;
  border-radius: 3px;
  background: var(--c-primary, #3b82f6);
  transition: width 0.3s ease;
}

.unit-bar-fill.done {
  background: #34c77b;
}

.unit-count {
  font-size: 12px;
  color: var(--c-text-muted);
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

/* ---------- 关卡卡三态 ---------- */
.stage-card {
  position: relative;
}

.stage-card.completed {
  border-color: #34c77b;
  background: rgba(52, 199, 123, 0.05);
}

.stage-card.current {
  border-color: var(--c-primary, #3b82f6);
  border-width: 2px;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.stage-card.locked {
  border-style: dashed;
  opacity: 0.55;
  cursor: not-allowed;
}

.current-chip {
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  background: var(--c-primary, #3b82f6);
  border-radius: 999px;
  padding: 2px 10px;
  line-height: 1.5;
}

.stage-lock {
  font-size: 13px;
  color: var(--c-text-muted);
}

/* 完成角标：右上角小对勾 */
.stage-card.completed::after {
  content: '✓';
  position: absolute;
  top: -7px;
  right: -7px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #34c77b;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 4px rgba(52, 199, 123, 0.4);
}

.exam-entry {
  margin-bottom: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.exam-entry-head {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.exam-entry-title {
  font-size: 16px;
  font-weight: 700;
}

.exam-entry-desc {
  font-size: 13px;
  color: var(--c-text-secondary);
}
</style>
