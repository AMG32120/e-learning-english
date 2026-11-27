<template>
  <div class="page-container map">
    <h1 class="page-title">闯关地图</h1>
    <p class="page-subtitle">
      <template v-if="isFree">自由模式：全部等级已开放，点击任意等级即可开始</template>
      <template v-else>关卡模式：按顺序解锁等级，从字母启蒙到托福雅思冲刺</template>
    </p>

    <div class="grid-levels">
      <button
        v-for="lv in LEVELS"
        :key="lv.level"
        class="level-card"
        :class="{ locked: !progress.isLevelUnlocked(lv.level) }"
        @click="openLevel(lv)"
      >
        <div class="level-card-top">
          <span class="level-badge">L{{ lv.level }}</span>
          <span v-if="lv.available === false" class="badge-chip">后续开放</span>
        </div>
        <div class="level-name">{{ lv.name }}</div>
        <div class="level-desc">{{ lv.desc }}</div>
        <div class="level-progress">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: lvp(lv).percent + '%' }"
            ></div>
          </div>
          <div class="level-progress-text">
            {{ progress.isLevelUnlocked(lv.level) ? `${lvp(lv).completed}/${lvp(lv).total} 关` : '未解锁' }}
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { LEVELS } from '../data/levels'
import { useProgressStore } from '../stores/progress'
import { studyMode } from '../services/studyMode'

const router = useRouter()
const progress = useProgressStore()

const isFree = computed(() => studyMode.value === 'free')

function lvp(lv) {
  return progress.getLevelProgress(lv.level)
}

function openLevel(lv) {
  if (!progress.isLevelUnlocked(lv.level)) {
    alert(`尚未解锁 L${lv.level}，请先完成上一等级 80% 的关卡`)
    return
  }
  router.push(`/map/${lv.level}`)
}
</script>

<style scoped>
.level-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.level-progress-text {
  font-size: 13px;
  color: var(--c-text-secondary);
  margin-top: var(--space-xs);
}
</style>
