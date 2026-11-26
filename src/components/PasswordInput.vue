<template>
  <div class="pwd-wrap">
    <input
      class="form-input pwd-input"
      :type="visible ? 'text' : 'password'"
      :id="id"
      :value="modelValue"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <button
      type="button"
      class="pwd-toggle"
      :aria-label="visible ? '隐藏密码' : '显示密码'"
      :title="visible ? '隐藏密码' : '显示密码'"
      @click="visible = !visible"
    >
      <!-- 睁眼：当前可见，点击隐藏 -->
      <svg v-if="visible" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 4.5C7 4.5 2.7 7.6 1 12c1.7 4.4 6 7.5 11 7.5s9.3-3.1 11-7.5c-1.7-4.4-6-7.5-11-7.5zM12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
      </svg>
      <!-- 闭眼：当前隐藏，点击显示 -->
      <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  modelValue: { type: String, default: '' },
  id: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  autocomplete: { type: String, default: '' }
})

defineEmits(['update:modelValue'])

const visible = ref(false)   // 默认隐藏密码，点眼睛切换
</script>

<style scoped>
.pwd-wrap {
  position: relative;
}

.pwd-input {
  padding-right: 42px;   /* 给眼睛按钮留位，避免文字压到图标 */
  width: 100%;
}

.pwd-toggle {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  color: var(--c-text-muted, #93a1b3);
  cursor: pointer;
  border-radius: 8px;
  padding: 0;
}

.pwd-toggle:hover {
  color: var(--c-primary, #2F7CF6);
}
</style>
