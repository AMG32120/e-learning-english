import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // base: './' 保证静态部署（含本地直接打开 dist）时资源路径正确
  base: './',
  plugins: [
    vue(),
    /* HF 镜像同源代理（dev）：/api/hf/* → hf-mirror.com（回退 huggingface.co）。
       服务端跟随 30x 重定向后转发，规避镜像站重定向响应缺少跨域头的问题；
       生产环境由 functions/api/hf/[[path]].js 提供同一接口。 */
    {
      name: 'hf-mirror-proxy',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (!req.url || !req.url.startsWith('/api/hf/')) return next()
          const path = req.url.slice('/api/hf'.length)
          const headers = { 'user-agent': 'e-learning-tts-proxy' }
          if (req.headers.range) headers.range = req.headers.range
          if (req.headers['if-none-match']) headers['if-none-match'] = req.headers['if-none-match']
          let r = null
          for (const base of ['https://hf-mirror.com', 'https://huggingface.co']) {
            r = await fetch(base + path, { headers, redirect: 'follow' }).catch(() => null)
            if (r && r.ok) break
            if (r && r.status === 404) break // 404 说明文件不存在，无需换源
          }
          if (!r) {
            res.statusCode = 502
            res.end('HF proxy: upstream unreachable')
            return
          }
          res.statusCode = r.status
          for (const h of ['content-type', 'content-length', 'etag', 'accept-ranges', 'content-range']) {
            const v = r.headers.get(h)
            if (v) res.setHeader(h, v)
          }
          res.setHeader('cache-control', 'public, max-age=86400')
          const { Readable } = await import('node:stream')
          Readable.fromWeb(r.body).pipe(res)
        })
      },
    },
    /* PWA：预缓存构建产物，断网可练、可安装到桌面 */
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-512-maskable.png'],
      manifest: {
        name: '启程英语',
        short_name: '启程英语',
        description: '零基础闯关式英语学习，16 级 1020 关，从 L1 字母启蒙直达托福雅思冲刺。',
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
        /* 词库 JSON 不进预缓存（体积随词表增长，会拖慢首次安装），
           改用下方 runtimeCaching 在首次请求后写入 CacheFirst 缓存，
           离线时同样可用。 */
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        /* kokoro 神经 TTS 引擎独立分包约 2.2MB，上调预缓存单文件上限
           使其进入 Service Worker 预缓存（离线也能合成；模型本体不走
           预缓存，由 Cache API 从 HF 镜像拉取后持久化） */
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: /\/data\/.*\.json$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'word-data',
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          }
        ]
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
            // 神经 TTS（transformers/onnxruntime/phonemizer）由动态 import
            // 惰性加载，独立分包不并入 vendor，避免拖慢首屏
            if (id.includes('onnxruntime') || id.includes('phonemizer') || id.includes('@huggingface')) {
              return undefined
            }
            return 'vendor'
          }
          if (id.includes('/src/data/')) return 'data'
        }
      }
    }
  }
})
