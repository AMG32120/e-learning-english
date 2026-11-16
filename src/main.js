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

/* 词库 JSON 预载：并行 fetch 三个词库文件后挂载（失败不阻塞启动，online 时自动重试） */
preloadWordData()
  .catch((e) => console.warn('[wordData] 词库预载失败（将在联网后重试）:', e && e.message))
  .then(() => app.mount('#app'))
