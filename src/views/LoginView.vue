<template>
  <div class="auth-page">
    <div class="auth-card card">
      <h1 class="auth-title">启程英语</h1>
      <p class="auth-subtitle">从 A 开始，向世界出发。零基础闯关式英语学习，直达托福雅思。</p>
      <p class="auth-subtitle auth-subtitle-en">From A to World</p>

      <!-- 登录表单 -->
      <form v-if="mode === 'login'" @submit.prevent="doLogin">
        <div class="form-field">
          <label class="form-label" for="login-username">用户名</label>
          <input
            id="login-username"
            v-model.trim="username"
            class="form-input"
            type="text"
            placeholder="请输入用户名"
            autocomplete="username"
          />
        </div>
        <div class="form-field">
          <label class="form-label" for="login-password">密码</label>
          <PasswordInput
            id="login-password"
            v-model="password"
            placeholder="请输入密码"
            autocomplete="current-password"
          />
        </div>
        <div v-if="error" class="form-error">{{ error }}</div>
        <button class="btn btn-primary btn-block" type="submit" :disabled="loading">
          {{ loading ? '登录中…' : '登录' }}
        </button>
        <div class="auth-links">
          <button type="button" class="link-btn" @click="mode = 'forgot'">忘记密码？</button>
          <router-link to="/register" class="link-btn">没有账号？去注册</router-link>
        </div>
      </form>

      <!-- 忘记密码表单：两步式（用户名 → 密保答案 → 新密码） -->
      <form v-else @submit.prevent="resetStep === 1 ? checkQuestion() : doReset()">
        <h2 class="auth-subtitle auth-reset-title">重置密码</h2>
        <template v-if="resetStep === 1">
          <p class="form-hint auth-reset-hint">输入用户名，通过密保问题验证身份后设置新密码</p>
          <div class="form-field">
            <label class="form-label" for="reset-username">用户名</label>
            <input id="reset-username" v-model.trim="resetUsername" class="form-input" type="text" placeholder="请输入用户名" />
          </div>
        </template>
        <template v-else>
          <template v-if="resetQuestion">
            <p class="form-hint auth-reset-hint">请回答注册时设置的密保问题</p>
            <div class="form-field">
              <label class="form-label" for="reset-question">密保问题</label>
              <input id="reset-question" class="form-input" type="text" :value="resetQuestion" disabled />
            </div>
            <div class="form-field">
              <label class="form-label" for="reset-answer">密保答案</label>
              <input id="reset-answer" v-model.trim="resetAnswer" class="form-input" type="text" placeholder="答案不区分大小写和空格" autocomplete="off" />
            </div>
          </template>
          <p v-else class="form-hint auth-reset-hint">当前离线或账号未设置密保：将直接重置本地密码，云端密码需联网后重新重置一次</p>
          <div class="form-field">
            <label class="form-label" for="reset-pwd">新密码</label>
            <PasswordInput id="reset-pwd" v-model="resetPassword" placeholder="至少 6 位" />
          </div>
          <div class="form-field">
            <label class="form-label" for="reset-pwd2">确认新密码</label>
            <PasswordInput id="reset-pwd2" v-model="resetPassword2" placeholder="再次输入新密码" />
          </div>
        </template>
        <div v-if="error" class="form-error">{{ error }}</div>
        <button class="btn btn-primary btn-block" type="submit" :disabled="loading">
          {{ loading ? '处理中…' : resetStep === 1 ? '下一步' : '重置密码' }}
        </button>
        <div class="auth-links">
          <button type="button" class="link-btn" @click="mode = 'login'">返回登录</button>
          <button v-if="resetStep === 2" type="button" class="link-btn" @click="backToStep1">上一步</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useProgressStore } from '../stores/progress'
import PasswordInput from '../components/PasswordInput.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const progress = useProgressStore()

const mode = ref('login')
const username = ref('')
const password = ref('')
const resetUsername = ref('')
const resetPassword = ref('')
const resetPassword2 = ref('')
const resetStep = ref(1) // 1: 输入用户名查密保问题；2: 答题 + 设置新密码
const resetQuestion = ref('')
const resetAnswer = ref('')
const resetFallback = ref(false) // 离线/未上云：走本地旧密码哈希通道
const error = ref('')
const loading = ref(false)

// 切换 登录/忘记密码 视图时清空上一步遗留的错误提示与加载态
watch(mode, () => {
  error.value = ''
  loading.value = false
  resetStep.value = 1
  resetQuestion.value = ''
  resetAnswer.value = ''
  resetFallback.value = false
})

async function doLogin() {
  error.value = ''
  if (!username.value || !password.value) {
    error.value = '请输入用户名和密码'
    return
  }
  loading.value = true
  const res = await auth.login({ username: username.value, password: password.value })
  loading.value = false
  if (!res.ok) {
    error.value = res.msg
    return
  }
  progress.loadForCurrentUser()
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
  if (redirect && redirect.startsWith('/')) {
    router.push(redirect)
  } else if (!auth.userData.onboardingDone) {
    router.push('/onboarding')
  } else {
    router.push('/map')
  }
}

async function checkQuestion() {
  error.value = ''
  if (!resetUsername.value) {
    error.value = '请输入用户名'
    return
  }
  loading.value = true
  const res = await auth.getSecurityQuestion(resetUsername.value)
  loading.value = false
  if (res.kind === 'ok') {
    resetQuestion.value = res.question
    resetFallback.value = false
    resetStep.value = 2
    return
  }
  if (res.kind === 'offline' && resetUsername.value) {
    // 离线兜底：本地存在账号时可走旧密码哈希通道（无密保问答），
    // 情况说明已由步骤 2 的提示文案展示，不再弹红色错误
    resetQuestion.value = ''
    resetFallback.value = true
    resetStep.value = 2
    return
  }
  error.value = res.msg || '无法验证该账号身份'
}

function backToStep1() {
  resetStep.value = 1
  resetQuestion.value = ''
  resetAnswer.value = ''
  resetFallback.value = false
  error.value = ''
}

async function doReset() {
  error.value = ''
  if (!resetPassword.value.length || resetPassword.value.length < 6) {
    error.value = '新密码长度至少 6 位'
    return
  }
  if (resetPassword.value !== resetPassword2.value) {
    error.value = '两次输入的密码不一致'
    return
  }
  if (!resetFallback.value && !resetAnswer.value) {
    error.value = '请输入密保答案'
    return
  }
  loading.value = true
  const res = await auth.resetPasswordSecure({
    username: resetUsername.value,
    answer: resetAnswer.value,
    newPassword: resetPassword.value,
    useLocalFallback: resetFallback.value
  })
  loading.value = false
  if (!res.ok) {
    error.value = res.msg
    return
  }
  alert(res.msg + '，请使用新密码登录。')
  mode.value = 'login'
  resetUsername.value = ''
  resetPassword.value = ''
  resetPassword2.value = ''
  resetAnswer.value = ''
  resetStep.value = 1
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-md);
  background: var(--c-bg);
}

.auth-card {
  width: 100%;
  max-width: 420px;
  padding: var(--space-xl) var(--space-lg);
}

.auth-title {
  text-align: center;
  font-size: 26px;
  color: var(--c-primary);
}

.auth-subtitle {
  text-align: center;
  color: var(--c-text-secondary);
  margin-bottom: var(--space-lg);
}

.auth-subtitle-en {
  font-size: 14px;
  margin-top: -8px;
  letter-spacing: 1px;
}

.auth-reset-title {
  font-size: 16px;
  font-weight: 700;
}

.auth-reset-hint {
  margin-bottom: 12px;
}

.auth-links {
  display: flex;
  justify-content: space-between;
  margin-top: var(--space-md);
  font-size: 14px;
}

.link-btn {
  color: var(--c-primary);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}
</style>
