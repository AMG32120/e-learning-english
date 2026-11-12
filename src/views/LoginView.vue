<template>
  <div class="auth-page">
    <div class="auth-card card">
      <h1 class="auth-title">启程英语</h1>
      <p class="auth-subtitle">从 A 开始，向世界出发。零基础闯关式英语学习，直达托福雅思。</p>
      <p class="auth-subtitle" style="font-size: 14px; margin-top: -8px; letter-spacing: 1px">From A to World</p>

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
          <input
            id="login-password"
            v-model="password"
            class="form-input"
            type="password"
            placeholder="请输入密码"
            autocomplete="current-password"
          />
        </div>
        <div class="form-error">{{ error }}</div>
        <button class="btn btn-primary btn-block" type="submit" :disabled="loading">
          {{ loading ? '登录中…' : '登录' }}
        </button>
        <div class="auth-links">
          <button type="button" class="link-btn" @click="mode = 'forgot'">忘记密码？</button>
          <router-link to="/register" class="link-btn">没有账号？去注册</router-link>
        </div>
      </form>

      <!-- 忘记密码表单 -->
      <form v-else @submit.prevent="doReset">
        <h2 class="auth-subtitle" style="font-size: 16px; font-weight: 700">重置密码</h2>
        <p class="form-hint" style="margin-bottom: 12px">纯前端单机场景：校验用户名存在后即可直接重置新密码</p>
        <div class="form-field">
          <label class="form-label" for="reset-username">用户名</label>
          <input id="reset-username" v-model.trim="resetUsername" class="form-input" type="text" placeholder="请输入用户名" />
        </div>
        <div class="form-field">
          <label class="form-label" for="reset-pwd">新密码</label>
          <input id="reset-pwd" v-model="resetPassword" class="form-input" type="password" placeholder="至少 6 位" />
        </div>
        <div class="form-field">
          <label class="form-label" for="reset-pwd2">确认新密码</label>
          <input id="reset-pwd2" v-model="resetPassword2" class="form-input" type="password" placeholder="再次输入新密码" />
        </div>
        <div class="form-error">{{ error }}</div>
        <button class="btn btn-primary btn-block" type="submit" :disabled="loading">
          {{ loading ? '处理中…' : '重置密码' }}
        </button>
        <div class="auth-links">
          <button type="button" class="link-btn" @click="mode = 'login'">返回登录</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useProgressStore } from '../stores/progress'

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
const error = ref('')
const loading = ref(false)

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

async function doReset() {
  error.value = ''
  if (!resetUsername.value) {
    error.value = '请输入用户名'
    return
  }
  if (resetPassword.value.length < 6) {
    error.value = '新密码长度至少 6 位'
    return
  }
  if (resetPassword.value !== resetPassword2.value) {
    error.value = '两次输入的密码不一致'
    return
  }
  loading.value = true
  const res = await auth.resetPassword({ username: resetUsername.value, newPassword: resetPassword.value })
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
