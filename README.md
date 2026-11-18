---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: b4eff1f2b76652841b78f03c143df293_6a77cc90de4211f1bc42525400638852
    ReservedCode1: 6oKGSrcqyNMi8x9c9/4Gxgn5XQInYrKRoPA3a6EYQtil97qULMyZUsOCCAK7ff8RByLyQaHW8yCievJQoOy411A0ImEysmMafKd/lhaXXlZWzTyvZPslfUVWpWNuYKd9+taPvEYBvpQklzIvGv5JAIHjfQoucYnBWoSccUWqPPAV4AAlpAibbRBsuMg=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: b4eff1f2b76652841b78f03c143df293_6a77cc90de4211f1bc42525400638852
    ReservedCode2: 6oKGSrcqyNMi8x9c9/4Gxgn5XQInYrKRoPA3a6EYQtil97qULMyZUsOCCAK7ff8RByLyQaHW8yCievJQoOy411A0ImEysmMafKd/lhaXXlZWzTyvZPslfUVWpWNuYKd9+taPvEYBvpQklzIvGv5JAIHjfQoucYnBWoSccUWqPPAV4AAlpAibbRBsuMg=
---

# 启程英语

从 A 开始，向世界出发。零基础闯关式英语学习，直达托福雅思。（From A to World）

## 项目简介

「启程英语」是一个**纯前端**的闯关式英语学习网站：从 26 个字母、48 个国际音标起步，经基础词汇、日常对话、初级语法、中级词汇（四级细分）、听说进阶、高级阅读写作，一路闯关直达托福雅思冲刺（L12 仿真题）。共 **12 个等级、616 个关卡**，内置 **4600+ 词**主题词库。无需后端服务，注册登录、学习进度全部保存在浏览器本地，支持 PWA 安装与离线使用。

## 功能清单

- **注册登录**：账号存 localStorage，密码 SHA-256 哈希，登录态保持，忘记密码/退出；含入学引导与水平自测（可跳过）
- **闯关 L1~L12**：共 616 关（L1 字母启蒙 / L2~L3 基础词汇 / L4 日常对话 / L5 初级语法+连词成句 / L6~L9 中级词汇四级细分 / L10 听说进阶 / L11 高级阅读写作 / L12 托福雅思冲刺），关卡按顺序解锁、等级按完成度 80% 解锁
- **14 种题型**：字母认读、大小写配对、发音跟读、音标认读、自然拼读、单词选择、看图识词、拼写挑战、连词成句、场景对话、语法测验、听力理解、阅读写作、仿真题
- **发音跟读**：字母、音标、单词、对话、听力逐句发音；TTS 三层引擎（系统语音 → meSpeak 离线合成兜底），男女声与语速可调
- **巩固复习**：通关即时巩固小测 → 错题复习池 → 间隔重复（次日 / 3 日 / 7 日），复习题只出已学内容
- **练习工具箱**：生词本 / 错题本 / 训练场 / 3D 卡片快刷 / 磨耳朵 / 词汇量测试 / 连词成句专练 / 站内查词
- **AI 能力（纯前端）**：AI 对话陪练（免 Key LLM）、AI 写作批改、跟读波形对比与口语粗评、Whisper 语音转写
- **每日一句**：按学习进度每日推送 1 句（含发音 / 释义 / 例句），共 60 条
- **随机测验 / 阶段测验**：跨等级随机组卷；等级综合测验通过颁发毕业徽章
- **休息提醒**：连续使用 45 分钟自动弹窗提醒休息（切后台不计时）
- **学习数据**：今日目标进度环、学习周报（可生成分享海报）、打卡热力图、词汇量增长曲线、15 枚成就徽章
- **导出导入**：JSON 导出导入之外，还支持压缩同步码与二维码跨设备迁移（含摄像头扫码）
- **主题切换**：清新蓝（默认）/ 夜间护眼 / 暖阳黄 三主题，跟随账号持久化
- **PWA**：可安装到桌面/主屏，词库缓存离线可用

## 技术栈

- **Vue 3**（组合式 API）+ **Vite 6** 构建
- **Pinia** 状态管理
- **Vue Router**（hash 模式，便于静态托管无需服务端配置）
- **PWA**（vite-plugin-pwa，词库 JSON 运行时缓存 CacheFirst）
- **Web Speech API + meSpeak** 离线 TTS 发音合成；transformers.js Whisper 语音转写（按需加载）
- 纯前端静态部署，数据分层：学习内容打包在 `src/data/` 与 `public/data/`，用户数据存 localStorage

## 本地运行

```bash
# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:5173/）
npm run dev

# 构建生产产物（输出 dist/）
npm run build

# 本地预览构建产物
npm run preview
```

## 三端适配

移动端优先响应式设计，断点：移动端 <768px、平板 768~1024px、PC >1024px；闯关、拼写、跟读等交互针对触屏优化（拼写题移动端优先"点选字母盘"模式）。

## 已知限制

- **纯前端凭据安全局限**：账号密码哈希仅存浏览器 localStorage，无真实后端鉴权，安全强度为演示 / 个人学习级别，无法防本地篡改
- **TTS 发音兜底**：系统无英语语音时自动降级 meSpeak 离线合成；双引擎均不可用时发音功能不可用（界面有降级提示）
- **localStorage 容量约 5MB**：学习内容不打入 localStorage，仅存账号与进度；仍建议定期导出备份
- **跟读为自评模式**：Web Speech API 只能合成播放、不能识别发音，跟读采用"播放示范 + 自评（好 / 一般 / 需重练）"方案

## 部署方式

`npm run build` 产出 `dist/`，为纯静态文件（`vite.config.js` 已配置 `base: './'` + hash 路由），无需服务端重写规则。

### Cloudflare Pages（推荐）

免费额度：带宽无限、500 次构建/月、允许商用、自动 HTTPS。

**方式一：Git 集成（推荐，push 即自动部署）**

1. 把本仓库推到 GitHub（私有仓库也可以）
2. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. 选择仓库，构建配置填：

   | 配置项 | 值 |
   |---|---|
   | Framework preset | `Vue`（或 `None`，行为一致） |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Node version | 由 `.nvmrc` 自动指定为 `22` |

4. 点 **Save and Deploy**，1~2 分钟后获得 `https://<项目名>.pages.dev`

无需配置任何环境变量。`public/_headers` 会自动生效（构建产物长缓存 + `sw.js` 不缓存）。应用使用 hash 路由，所有导航都在 `/` 下，无需服务端 404 回落规则。

**方式二：命令行直传（不接 GitHub）**

```bash
npm run build
npx wrangler pages deploy dist --project-name=e-learning-english
```

首次执行会打开浏览器要求登录 Cloudflare 账号授权，之后同一台机器无需再登录。

### 其他平台

产物同样可直接上传至 GitHub Pages / Vercel / Netlify / Nginx / 任意静态托管。

注意：
- **必须 HTTPS**——PWA 的 Service Worker 仅在 HTTPS（或 localhost）下注册，`file://` 直接打开无法离线与安装
- 静态托管若支持自定义响应头，请保持 `sw.js` 为 `no-cache`，否则发版后用户可能长期停留在旧版本

详细功能清单见 [FEATURES.md](FEATURES.md)，完整规划与验收记录见 [PLAN.md](PLAN.md)。
*（内容由AI生成，仅供参考）*
