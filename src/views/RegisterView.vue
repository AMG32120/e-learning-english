<template>
  <div class="auth-page">
    <div class="auth-card card">
      <h1 class="auth-title">注册新账号</h1>
      <p class="auth-subtitle">注册后进度自动云端同步，多设备通用</p>

      <form @submit.prevent="doRegister">
        <div class="form-field">
          <label class="form-label" for="reg-username">用户名 *</label>
          <input
            id="reg-username"
            v-model.trim="username"
            class="form-input"
            type="text"
            placeholder="2~20 位字母、数字或下划线"
            autocomplete="username"
          />
        </div>
        <div class="form-field">
          <label class="form-label" for="reg-nickname">昵称（可选）</label>
          <input id="reg-nickname" v-model.trim="nickname" class="form-input" type="text" placeholder="默认与用户名相同" />
        </div>
        <div class="form-field">
          <label class="form-label" for="reg-password">密码 *</label>
          <PasswordInput
            id="reg-password"
            v-model="password"
            placeholder="至少 6 位"
            autocomplete="new-password"
          />
        </div>
        <div class="form-field">
          <label class="form-label" for="reg-password2">确认密码 *</label>
          <PasswordInput
            id="reg-password2"
            v-model="password2"
            placeholder="再次输入密码"
            autocomplete="new-password"
          />
        </div>
        <div class="form-field">
          <label class="form-label" for="reg-question">密保问题 *</label>
          <select id="reg-question" v-model="question" class="form-input form-select">
            <option v-for="q in SECURITY_QUESTIONS" :key="q" :value="q">{{ q }}</option>
          </select>
          <p class="form-tip">忘记密码时用于验证身份，请务必记住答案</p>
        </div>
        <div class="form-field">
          <label class="form-label" for="reg-answer">密保答案 *</label>
          <input
            id="reg-answer"
            v-model.trim="answer"
            class="form-input"
            type="text"
            placeholder="答案不区分大小写和空格"
            autocomplete="off"
          />
        </div>
        <div v-if="error" class="form-error">{{ error }}</div>
        <button class="btn btn-primary btn-block" type="submit" :disabled="loading">
          {{ loading ? '注册中…' : '注册并开始学习' }}
        </button>
        <div class="auth-links">
          <router-link to="/login" class="link-btn">已有账号？去登录</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, SECURITY_QUESTIONS } from '../stores/auth'
import { useProgressStore } from '../stores/progress'
import PasswordInput from '../components/PasswordInput.vue'

const router = useRouter()
const auth = useAuthStore()
const progress = useProgressStore()

const username = ref('')
const nickname = ref('')
const password = ref('')
const password2 = ref('')
const question = ref(SECURITY_QUESTIONS[0])
const answer = ref('')
const error = ref('')
const loading = ref(false)

async function doRegister() {
  error.value = ''
  if (!username.value) {
    error.value = '请输入用户名'
    return
  }
  if (password.value.length < 6) {
    error.value = '密码长度至少 6 位'
    return
  }
  if (password.value !== password2.value) {
    error.value = '两次输入的密码不一致'
    return
  }
  if (!answer.value) {
    error.value = '请填写密保答案（忘记密码时用于验证身份）'
    return
  }
  loading.value = true
  const res = await auth.register({
    username: username.value,
    password: password.value,
    nickname: nickname.value,
    securityQuestion: question.value,
    securityAnswer: answer.value
  })
  loading.value = false
  if (!res.ok) {
    error.value = res.msg
    return
  }
  // 注册成功自动登录 → 加载进度数据 → 进入入学引导
  progress.loadForCurrentUser()
  router.push('/onboarding')
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
  text-align: center;
  margin-top: var(--space-md);
  font-size: 14px;
}

.link-btn {
  color: var(--c-primary);
}

.form-tip {
  font-size: 12px;
  color: var(--c-text-secondary);
  margin-top: 4px;
}

.form-select {
  appearance: auto;
}
</style>
