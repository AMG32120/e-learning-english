import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // base: './' 保证静态部署（含本地直接打开 dist）时资源路径正确
  base: './',
  plugins: [
    vue(),
    /* PWA：预缓存构建产物，断网可练、可安装到桌面 */
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-512-maskable.png'],
      manifest: {
        name: '启程英语 · From A to World',
        short_name: '启程英语',
        description: '零基础闯关式英语学习，L1 字母启蒙到 L8 托福雅思冲刺。',
        lang: 'zh-CN',
        theme_color: '#2F7CF6',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: './',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        /* json：预缓存 public/data 词库 JSON，离线也可学习 */
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,json}'],
        navigateFallback: 'index.html'
      }
    })
  ],
  server: {
    host: true,
    port: 5173,
    open: false
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    /* 兼容较旧的 Safari/移动浏览器（可选链、空值合并等语法转译） */
    target: 'es2019',
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        /* 分包：vendor（框架）与 data（词库/题库）独立 chunk，
           提升并行加载与长期缓存（数据更新不影响框架缓存） */
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // mespeak 配置/音库由动态 import 按需加载，不并入 vendor
            if (id.includes('mespeak')) return undefined
            return 'vendor'
          }
          if (id.includes('/src/data/')) return 'data'
        }
      }
    }
  }
})
