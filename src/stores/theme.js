/* ============================================================
   stores/theme.js —— 三主题切换状态
   主题偏好跟随账号（user_<username>.theme）；未登录使用访客键。
   切换仅修改根节点 data-theme 属性，样式由 CSS 变量驱动。
   ============================================================ */
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const THEMES = [
  { id: 'blue', name: '清新蓝', desc: '明亮蓝白配色，白天学习' },
  { id: 'night', name: '夜间护眼', desc: '深色低亮度，夜间使用' },
  { id: 'warm', name: '暖阳黄', desc: '柔和暖色，长时间阅读' }
]

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: 'blue'
  }),

  actions: {
    /* 初始化：按当前账号/访客读取偏好并应用到 DOM */
    init() {
      const auth = useAuthStore()
      this.theme = auth.getEffectiveTheme() || 'blue'
      this.apply()
    },

    apply() {
      document.documentElement.setAttribute('data-theme', this.theme)
    },

    setTheme(t) {
      if (!THEMES.some((x) => x.id === t)) return
      this.theme = t
      const auth = useAuthStore()
      auth.setTheme(t)
      this.apply()
    }
  }
})
