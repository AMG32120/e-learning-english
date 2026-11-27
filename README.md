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

「启程英语」是一个闯关式英语学习网站：从 26 个字母、48 个国际音标起步，经基础词汇、日常对话、初级语法、中级词汇、听说进阶、高级阅读写作、学术词汇，一路闯关直达托福雅思冲刺（L16 仿真题）。共 **16 个等级、1020 个关卡**，内置 **7578 词**主题词库（含语料生词表 218 词）。

账号与学习进度采用**云端权威**架构：前端 + Cloudflare Workers（D1 数据库），注册登录、密保找回、进度同步全部走云端接口；学习过程本地缓存、自动同步云端，已登录可离线学习，支持 PWA 安装。

## 功能清单

- **注册登录（云端）**：账号存 Cloudflare D1，密码 SHA-256 哈希；注册时设置密保问题，忘记密码两步式自助找回（清除浏览器数据/换设备也可）；离线时登录/注册不可用
- **云端进度同步**：学习进度本地缓存 + 自动云同步（防抖推送/失败重试/联网补推/关页冲刷）；登录与启动时拉取合并，多设备进度无缝衔接；发音性别、学习模式等偏好一并上云
- **闯关 L1~L16**：共 1020 关（L1 字母启蒙 / L2~L5 基础词汇 / L6 日常对话 / L7 初级语法+连词成句 / L8~L12 中级词汇五级细分 / L13 听说进阶 / L14 高级阅读写作 / L15 学术词汇 / L16 托福雅思冲刺）；**学习模式可选**：关卡模式（顺序解锁，默认）/ 自由模式（全部开放）
- **14 种题型**：字母认读、大小写配对、发音跟读、音标认读、自然拼读、单词选择、看图识词、拼写挑战、连词成句、场景对话、语法测验、听力理解、阅读写作、仿真题
- **发音跟读**：系统语音朗读（无需下载资源，无英语语音时提示安装）；男女声与语速可调
- **入学引导与自适应自测**：新手引导 → 6 组难度阶梯自测（最多 34 题，组内 ≥65% 升组），推荐起始等级
- **巩固复习**：通关即时巩固小测 → 错题复习池 → 间隔重复（次日 / 3 日 / 7 日），复习题只出已学内容
- **语料生词表**：日常对话 / 听说进阶 / 高级阅读语料中的生词沉淀为三级生词表（L6 / L13 / L14 共 218 词），随等级解锁进入已学内容池与复习闭环
- **练习工具箱**：生词本 / 错题本 / 训练场 / 3D 卡片快刷 / 磨耳朵 / 词汇量测试 / 连词成句专练 / 站内查词
- **AI 能力（纯前端）**：AI 对话陪练（免 Key LLM）、AI 写作批改、跟读波形对比与口语粗评、Whisper 语音转写
- **每日一句**：按学习进度每日推送 1 句（含发音 / 释义 / 例句），共 60 条
- **随机测验 / 阶段测验**：跨等级随机组卷；等级综合测验通过颁发毕业徽章
- **休息提醒**：连续使用 45 分钟自动弹窗提醒休息（切后台不计时）
- **学习数据**：今日目标进度环、学习周报（可生成分享海报）、打卡热力图、词汇量增长曲线、16 枚成就徽章
- **主题切换**：清新蓝（默认）/ 夜间护眼 / 暖阳黄 三主题，跟随账号上云
- **PWA**：可安装到桌面/主屏，词库缓存离线可用

## 技术栈

- **Vue 3**（组合式 API）+ **Vite 6** 构建
- **Pinia** 状态管理
- **Vue Router**（hash 模式，便于静态托管无需服务端配置）
- **Cloudflare Workers + D1**：Worker 承载静态站点与 `/api/cloud/*` 云端接口（注册/登录/密保找回/进度读写），D1 存账号与进度数据
- **PWA**（vite-plugin-pwa，词库 JSON 运行时缓存 CacheFirst）
- **Web Speech API** 系统语音朗读（真人发音引擎 Kokoro-82M 代码保留、默认下线）；transformers.js Whisper 语音转写（按需加载）
- 数据分层：学习内容打包在 `src/data/` 与 `public/data/`，用户进度本地缓存（localStorage）+ 云端权威（D1 自动同步）

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

- **账号体系全云端**：登录/注册/忘记密码需联网；断网时已登录会话可继续离线学习，进度联网后自动补推
- **密码找回依赖密保**：未设置密保问题的老账号无法自助找回，需管理员直接更新 D1 密码哈希
- **密保问题仅在注册时设置**：注册后暂无修改入口
- **跟读为自评模式**：Web Speech API 只能合成播放、不能识别发音，跟读采用"播放示范 + 自评（好 / 一般 / 需重练）"方案
- **本地缓存约 5MB**：学习内容不打入 localStorage，仅存账号缓存与进度副本（云端为权威数据源）

## 部署方式

**Cloudflare Workers Builds（当前方案，推荐）**

Worker 同时承载静态站点与云端 API（`worker/index.js` + `worker/cloud.js`），绑定 D1 数据库（`wrangler.jsonc`），Git push 自动部署：

1. 仓库推到 GitHub / Gitee
2. Cloudflare Dashboard → **Workers & Pages** → 创建 Worker → **Settings → Build** → 连接 Git 仓库
3. 构建配置：Build command `npm run build`，部署 `dist/`（wrangler.jsonc 定义 assets 与 D1 绑定）
4. 创建 D1 数据库并执行 `d1/schema.sql` 初始化表结构

线上接口：`/api/cloud/register|auth|question|reset-secure|security-update|data|reset`（`run_worker_first` 保证 API 优先路由）。

### 纯静态托管（无云端功能）

`npm run build` 产出 `dist/`（`base: './'` + hash 路由），可上传 GitHub Pages / Vercel / Netlify / 任意静态托管；但 `/api/cloud/*` 不存在，注册登录与云同步不可用。

注意：
- **必须 HTTPS**——PWA 的 Service Worker 仅在 HTTPS（或 localhost）下注册，`file://` 直接打开无法离线与安装
- 静态托管若支持自定义响应头，请保持 `sw.js` 为 `no-cache`，否则发版后用户可能长期停留在旧版本

详细功能清单见 [FEATURES.md](FEATURES.md)，完整规划与验收记录见 [PLAN.md](PLAN.md)。
*（内容由AI生成，仅供参考）*
