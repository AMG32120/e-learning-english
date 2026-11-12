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

「启程英语」是一个**纯前端**的闯关式英语学习网站：从 26 个字母、48 个国际音标起步，经基础词汇、日常对话、初级语法、中级词汇、听说进阶、高级阅读写作，一路闯关直达托福雅思冲刺（L8 仿真题）。无需后端服务，注册登录、学习进度全部保存在浏览器本地。

## 功能清单

- **注册登录**：账号存 localStorage，密码 SHA-256 哈希，登录态保持，忘记密码/退出；含入学引导与水平自测（可跳过）
- **闯关 L1~L8**：共 58 关（L1 字母启蒙 / L2 基础词汇 / L3 日常对话 / L4 初级语法 / L5 中级词汇 / L6 听说进阶 / L7 高级阅读写作 / L8 托福雅思冲刺），关卡按顺序解锁、等级按完成度 80% 解锁
- **发音跟读**：26 字母、48 音标、自然拼读、单词、对话、听力逐句发音；TTS 三层引擎（系统语音 → meSpeak 离线合成兜底）
- **巩固复习**：通关即时巩固小测 → 错题复习池 → 间隔重复（次日 / 3 日 / 7 日），复习题只出已学内容
- **每日一句**：按学习进度每日推送 1 句（含发音 / 释义 / 例句），共 60 条
- **随机测验**：从已解锁内容池随机抽题，可按等级范围与题量选择
- **阶段测验**：等级完成后解锁综合测验，覆盖本等级核心知识点
- **打卡徽章**：学习打卡日历 / 连续打卡统计 / 16 种成就徽章
- **主题切换**：清新蓝（默认）/ 夜间护眼 / 暖阳黄 三主题，跟随账号持久化
- **导出导入**：学习数据导出 JSON / 导入（覆盖或合并），支持换设备迁移

## 技术栈

- **Vue 3**（组合式 API）+ **Vite 6** 构建
- **Pinia** 状态管理
- **Vue Router**（hash 模式，便于静态托管无需服务端配置）
- **Web Speech API + meSpeak** 离线 TTS 发音合成
- 纯前端静态部署，数据分层：学习内容打包在 `src/data/`，用户数据存 localStorage（约 5MB）

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

`npm run build` 产出 `dist/`（`vite.config.js` 已配置 `base: './'` + hash 路由），为纯静态文件，无需服务端重写规则，上传至 GitHub Pages / Vercel / Nginx / 任意静态托管即可直接访问。完整规划与验收记录见 [PLAN.md](PLAN.md)。
*（内容由AI生成，仅供参考）*
