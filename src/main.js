import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { preloadWordData } from './services/wordData'
import './styles/base.css'
import './styles/layout.css'
import './styles/components.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)

/* 立即挂载：首屏不再等待词库下载。
   词库（约 2MB / 46 个文件）后台异步预载——
   * 首次访问由 BootGate 准备页展示进度并在完成后进入
   * 二次访问 SW 缓存命中，秒级完成无感
   * 失败不阻塞启动，online 时自动重试 */
app.mount('#app')

preloadWordData().catch((e) =>
  console.warn('[wordData] 词库预载失败（将在联网后重试）:', e && e.message)
)
