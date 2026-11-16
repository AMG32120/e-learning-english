import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { public: true, title: '登录' }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/RegisterView.vue'),
    meta: { public: true, title: '注册' }
  },
  {
    path: '/onboarding',
    name: 'onboarding',
    component: () => import('../views/OnboardingView.vue'),
    meta: { title: '入学引导' }
  },
  {
    path: '/placement',
    name: 'placement',
    component: () => import('../views/PlacementView.vue'),
    meta: { title: '水平自测' }
  },
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/map',
    name: 'map',
    component: () => import('../views/MapView.vue'),
    meta: { title: '闯关地图' }
  },
  {
    path: '/map/:level',
    name: 'level',
    component: () => import('../views/LevelView.vue'),
    meta: { title: '关卡列表' }
  },
  {
    path: '/stage/:stageId',
    name: 'stage',
    component: () => import('../views/StageView.vue'),
    meta: { title: '关卡闯关' }
  },
  {
    path: '/progress',
    name: 'progress',
    component: () => import('../views/ProgressView.vue'),
    meta: { title: '学习进度' }
  },
  {
    path: '/review',
    name: 'review',
    component: () => import('../views/ReviewView.vue'),
    meta: { title: '间隔重复复习' }
  },
  {
    path: '/quiz',
    name: 'quiz',
    component: () => import('../views/QuizView.vue'),
    meta: { title: '随机测验' }
  },
  {
    path: '/exam/:level',
    name: 'exam',
    component: () => import('../views/ExamView.vue'),
    meta: { title: '等级综合测验' }
  },
  {
    path: '/wordbook',
    name: 'wordbook',
    component: () => import('../views/WordBookView.vue'),
    meta: { title: '生词本与错题本' }
  },
  {
    path: '/practice',
    name: 'practice',
    component: () => import('../views/PracticeView.vue'),
    meta: { title: '训练场' }
  },
  {
    path: '/chat',
    name: 'chat',
    component: () => import('../views/ChatView.vue'),
    meta: { title: 'AI 对话陪练' }
  },
  {
    path: '/flashcards',
    name: 'flashcards',
    component: () => import('../views/FlashcardView.vue'),
    meta: { title: '卡片快刷' }
  },
  {
    path: '/vocabtest',
    name: 'vocabtest',
    component: () => import('../views/VocabTestView.vue'),
    meta: { title: '词汇量测试' }
  },
  {
    path: '/shadow',
    name: 'shadow',
    component: () => import('../views/ShadowingView.vue'),
    meta: { title: '跟读对比' }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { title: '个人中心' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// 登录守卫：未登录访问除 /login、/register 外的页面重定向到 /login
router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!to.meta.public && !auth.isLoggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (to.meta.public && auth.isLoggedIn) {
    return { path: '/map' }
  }
  return true
})

router.afterEach((to) => {
  const base = to.meta.title ? to.meta.title : ''
  document.title = base ? `${base} - 启程英语` : '启程英语'
})

export default router
