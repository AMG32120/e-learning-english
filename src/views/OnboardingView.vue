<template>
  <div class="page-container onboarding">
    <h1 class="page-title">欢迎加入「启程英语」</h1>
    <p class="page-subtitle">先花 1 分钟了解学习方式，再选择你的起点</p>

    <div class="card onboarding-card">
      <div class="onboarding-steps">
        <div v-for="(step, i) in steps" :key="i" class="onboarding-step">
          <div class="step-num">{{ i + 1 }}</div>
          <div class="step-body">
            <div class="step-title">{{ step.title }}</div>
            <div class="step-desc">{{ step.desc }}</div>
          </div>
        </div>
      </div>

      <div class="onboarding-actions">
        <button class="btn btn-primary btn-block" @click="goPlacement">开始水平自测（推荐）</button>
        <button class="btn btn-ghost btn-block" @click="skip">跳过自测，直接进入 L1</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const steps = ref([
  { title: '闯关式学习', desc: '从 L1 字母启蒙到 L8 托福雅思冲刺，按等级逐关解锁，每关 ≥1 星即可进入下一关。' },
  { title: '发音与跟读', desc: '点击喇叭听发音示范，跟读后自评（好 / 一般 / 需重练），播放完成即可通关。' },
  { title: '巩固与复习', desc: '每关通关后巩固小测会复习错题，间隔重复调度帮您记住易错内容。' },
  { title: '三端三主题', desc: 'PC / 平板 / 手机自适应；清新蓝、夜间护眼、暖阳黄三套主题可在个人中心切换。' }
])

function skip() {
  auth.markOnboardingDone()
  router.push('/map')
}

function goPlacement() {
  router.push('/placement')
}
</script>

<style scoped>
.onboarding-card {
  max-width: 720px;
  margin: 0 auto;
}

.onboarding-steps {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.onboarding-step {
  display: flex;
  gap: var(--space-md);
  align-items: flex-start;
}

.step-num {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--c-primary-light);
  color: var(--c-primary);
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-title {
  font-weight: 700;
  font-size: 16px;
}

.step-desc {
  font-size: 14px;
  color: var(--c-text-secondary);
}

.onboarding-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
</style>
