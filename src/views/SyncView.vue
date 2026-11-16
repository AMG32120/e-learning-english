<template>
  <div>
    <main class="page-container">
      <h1 class="page-title">跨设备同步</h1>
      <p class="page-sub">用同步码或二维码，把学习进度搬到另一台设备</p>

      <!-- ① 生成同步码 -->
      <section class="card sync-card">
        <h2 class="card-title">① 在当前设备生成同步码</h2>
        <p class="sync-tip">
          同步码是一份经过压缩编码的进度快照，包含账号与全部学习记录（关卡、打卡、生词本、统计等）。
        </p>

        <button
          v-if="!code"
          class="btn btn-primary btn-block"
          :disabled="generating"
          @click="generate"
        >
          {{ generating ? '生成中…' : '生成我的同步码' }}
        </button>

        <template v-else>
          <div class="sync-meta">
            <span>已完成 {{ summary.completedStages }} 关</span>
            <span>打卡 {{ summary.checkinDays }} 天</span>
            <span>徽章 {{ summary.badges }} 枚</span>
            <span>码长 {{ code.length }} 字符</span>
          </div>

          <textarea class="sync-code" readonly :value="code" @focus="selectCode" @click="selectCode"></textarea>

          <div class="sync-row">
            <button class="btn btn-primary" @click="copyCode">{{ copied ? '✅ 已复制' : '复制同步码' }}</button>
            <button class="btn btn-ghost" :disabled="generating" @click="generate">重新生成</button>
          </div>

          <div v-if="qr.ok" class="qr-box">
            <svg
              class="qr-svg"
              :viewBox="`0 0 ${qr.size} ${qr.size}`"
              shape-rendering="crispEdges"
              role="img"
              aria-label="学习进度同步二维码"
            >
              <rect :width="qr.size" :height="qr.size" fill="#ffffff" />
              <path :d="qr.path" fill="#000000" />
            </svg>
            <p class="qr-hint">在另一台设备打开本页，点「📷 扫码导入」扫描此二维码</p>
            <p v-if="qrLite" class="qr-hint qr-lite">
              二维码为精简版（不含学习统计曲线）；如需完整迁移，请复制上方同步码发到新设备
            </p>
          </div>
          <p v-else class="qr-fallback">⚠️ {{ qr.reason }}</p>
        </template>
      </section>

      <!-- ② 导入 -->
      <section class="card sync-card">
        <h2 class="card-title">② 在新设备导入</h2>
        <p class="sync-tip">粘贴同步码，或直接扫描二维码。</p>

        <textarea
          v-model="importText"
          class="sync-code sync-input"
          placeholder="在此粘贴以 QC1. 开头的同步码…"
          spellcheck="false"
        ></textarea>

        <div class="sync-row">
          <button class="btn btn-soft" @click="toggleScan">{{ scanning ? '关闭摄像头' : '📷 扫码导入' }}</button>
          <button class="btn btn-primary" :disabled="!importText.trim() || parsing" @click="doParse">
            {{ parsing ? '解析中…' : '解析同步码' }}
          </button>
        </div>

        <p v-if="scanError" class="sync-error">{{ scanError }}</p>

        <div v-show="scanning" class="scan-box">
          <video ref="videoEl" class="scan-video" muted playsinline></video>
          <p class="scan-hint">把二维码放入取景框，识别成功后会自动解析</p>
        </div>

        <!-- 解析结果预览 -->
        <div v-if="parsed" class="sync-preview">
          <p class="preview-title">
            同步码属于账号 <b>{{ parsed.summary.username }}</b>
            <span v-if="parsed.summary.nickname">（{{ parsed.summary.nickname }}）</span>
          </p>
          <ul class="preview-list">
            <li>已完成关卡：{{ parsed.summary.completedStages }} 关</li>
            <li>打卡记录：{{ parsed.summary.checkinDays }} 天</li>
            <li>徽章：{{ parsed.summary.badges }} 枚</li>
            <li>生成时间：{{ formatTime(parsed.summary.exportedAt) }}</li>
          </ul>
          <p v-if="parsed.summary.username !== auth.username" class="sync-warn">
            当前登录的是「{{ auth.username }}」，导入后会切换到「{{ parsed.summary.username }}」账号。
          </p>
          <p v-else class="sync-warn sync-warn-soft">
            导入会与本机进度合并（进度取较高值、集合取并集），或选择覆盖本机进度。
          </p>
          <div class="sync-row">
            <button class="btn btn-primary" :disabled="applying" @click="apply('merge')">合并导入（推荐）</button>
            <button class="btn btn-danger" :disabled="applying" @click="apply('overwrite')">覆盖导入</button>
          </div>
        </div>

        <p v-if="parseError" class="sync-error">{{ parseError }}</p>
        <p v-if="msg" class="sync-success">{{ msg }}</p>
      </section>

      <!-- 说明 -->
      <section class="card sync-card sync-note">
        <h2 class="card-title">说明</h2>
        <ul class="note-list">
          <li>同步码是<b>静态快照</b>：导入后若旧设备继续学习，需要重新生成并再次导入。</li>
          <li>同步码包含账号名与密码哈希，<b>请勿发给他人或公开分享</b>。</li>
          <li>新设备导入时会自动创建同名账号，仍可用原密码登录。</li>
          <li>扫码需要摄像头权限（仅在 HTTPS 下可用）；数据量过大时二维码放不下，请改用同步码文本。</li>
          <li>数据只在本机生成与解析，不会上传到任何服务器。</li>
        </ul>
      </section>
    </main>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useProgressStore } from '../stores/progress'
import { useThemeStore } from '../stores/theme'
import { createSyncCode, parseSyncCode, parseQrBinary, buildQrForPayload, applySyncCode } from '../services/syncCode'

const router = useRouter()
const auth = useAuthStore()
const progress = useProgressStore()
const themeStore = useThemeStore()

const generating = ref(false)
const code = ref('')
const summary = ref({ completedStages: 0, checkinDays: 0, badges: 0 })
const qr = ref({ ok: false, reason: '' })
const qrLite = ref(false)
const copied = ref(false)

const importText = ref('')
const parsing = ref(false)
const parsed = ref(null)
const parseError = ref('')
const msg = ref('')
const applying = ref(false)

const scanning = ref(false)
const scanError = ref('')
const videoEl = ref(null)
let mediaStream = null
let scanTimer = 0
let scanCanvas = null

/* ---------- 生成 ---------- */

async function generate() {
  if (generating.value) return
  generating.value = true
  copied.value = false
  msg.value = ''
  try {
    const res = await createSyncCode(auth.username)
    if (!res.ok) {
      qr.value = { ok: false, reason: res.reason || '生成失败' }
      return
    }
    code.value = res.code
    summary.value = res.summary
    qr.value = await buildQrForPayload(res.payload)
    qrLite.value = !!qr.value.lite
  } catch {
    qr.value = { ok: false, reason: '生成失败，请重试或改用「导出进度」文件备份' }
  } finally {
    generating.value = false
  }
}

function selectCode(e) {
  if (e && e.target && e.target.select) e.target.select()
}

async function copyCode() {
  const text = code.value
  if (!text) return
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    alert('复制失败，请手动长按/框选文本框内容复制')
  }
}

/* ---------- 解析与导入 ---------- */

async function doParse() {
  if (parsing.value) return
  parsing.value = true
  parseError.value = ''
  msg.value = ''
  parsed.value = null
  try {
    const res = await parseSyncCode(importText.value)
    if (!res.ok) {
      parseError.value = res.reason || '同步码解析失败'
      return
    }
    parsed.value = res
  } finally {
    parsing.value = false
  }
}

async function apply(mode) {
  if (!parsed.value || applying.value) return
  applying.value = true
  msg.value = ''
  try {
    const res = await applySyncCode(parsed.value.payload, mode)
    if (!res.ok) {
      parseError.value = res.reason || '导入失败'
      return
    }
    parsed.value = null
    importText.value = ''
    auth.refresh()
    progress.loadForCurrentUser()
    themeStore.init()
    msg.value = `${res.message}，即将进入应用…`
    setTimeout(() => router.push('/'), 900)
  } catch {
    parseError.value = '导入过程中出现异常，请重试'
  } finally {
    applying.value = false
  }
}

function formatTime(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

/* ---------- 摄像头扫码 ---------- */

async function toggleScan() {
  if (scanning.value) {
    stopScan()
    return
  }
  await startScan()
}

async function startScan() {
  scanError.value = ''
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    scanError.value = '当前浏览器不支持摄像头扫码，请手动粘贴同步码'
    return
  }
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    })
  } catch {
    scanError.value = '无法访问摄像头：请允许摄像头权限（摄像头仅在 HTTPS 下可用），或手动粘贴同步码'
    return
  }
  scanning.value = true
  await nextTick()
  if (videoEl.value) {
    videoEl.value.srcObject = mediaStream
    try {
      await videoEl.value.play()
    } catch {
      /* 自动播放被拦截时忽略，画面仍会随用户交互显示 */
    }
  }
  let jsQR
  try {
    const mod = await import('jsqr')
    jsQR = mod.default || mod
  } catch {
    scanError.value = '扫码组件加载失败，请手动粘贴同步码'
    stopScan()
    return
  }
  scanCanvas = document.createElement('canvas')
  const tick = () => {
    if (!scanning.value || !videoEl.value) return
    const v = videoEl.value
    if (v.readyState >= 2 && v.videoWidth) {
      const w = v.videoWidth
      const h = v.videoHeight
      scanCanvas.width = w
      scanCanvas.height = h
      const ctx = scanCanvas.getContext('2d', { willReadFrequently: true })
      ctx.drawImage(v, 0, 0, w, h)
      const img = ctx.getImageData(0, 0, w, h)
      const found = jsQR(img.data, w, h, { inversionAttempts: 'dontInvert' })
      if (found && (found.binaryData || found.data)) {
        stopScan()
        onScanFound(found)
        return
      }
    }
    scanTimer = setTimeout(tick, 180)
  }
  tick()
}

function stopScan() {
  scanning.value = false
  if (scanTimer) {
    clearTimeout(scanTimer)
    scanTimer = 0
  }
  if (mediaStream) {
    mediaStream.getTracks().forEach((t) => t.stop())
    mediaStream = null
  }
  if (videoEl.value) videoEl.value.srcObject = null
}

/* 扫码结果：优先按二进制同步码解析，其次按文本同步码解析 */
async function onScanFound(found) {
  parseError.value = ''
  msg.value = ''
  parsed.value = null
  const bytes = found.binaryData
  if (bytes && bytes.length > 4) {
    const head = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3])
    if (head === 'QCB1') {
      parsing.value = true
      try {
        const res = await parseQrBinary(bytes)
        if (res.ok) {
          parsed.value = res
          return
        }
        parseError.value = res.reason
        return
      } finally {
        parsing.value = false
      }
    }
  }
  const text = String(found.data || '').trim()
  if (!text) {
    parseError.value = '未识别到有效内容，请对准二维码重试'
    return
  }
  importText.value = text
  doParse()
}

onBeforeUnmount(() => {
  stopScan()
})
</script>

<style scoped>
.page-title {
  margin-bottom: 4px;
}

.page-sub {
  font-size: 14px;
  color: var(--c-text-secondary);
  margin-bottom: var(--space-md);
}

.sync-card {
  margin-bottom: var(--space-md);
}

.card-title {
  font-size: 16px;
  margin-bottom: var(--space-xs);
}

.sync-tip {
  font-size: 13px;
  color: var(--c-text-muted);
  line-height: 1.6;
  margin-bottom: var(--space-sm);
}

.sync-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 12px;
  font-size: 12px;
  color: var(--c-text-secondary);
  background: var(--c-bg-soft);
  border-radius: 8px;
  padding: 8px 10px;
  margin-bottom: var(--space-sm);
}

.sync-code {
  width: 100%;
  min-height: 96px;
  max-height: 180px;
  resize: vertical;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.5;
  word-break: break-all;
  background: var(--c-bg-soft);
  color: var(--c-text);
  border: 1px solid var(--c-border);
  border-radius: 10px;
  padding: 10px;
  box-sizing: border-box;
}

.sync-input {
  min-height: 110px;
  margin-bottom: var(--space-sm);
}

.sync-row {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-sm);
}

.sync-row .btn {
  flex: 1;
}

.qr-box {
  margin-top: var(--space-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.qr-svg {
  width: min(260px, 70vw);
  height: auto;
  border-radius: 8px;
  border: 1px solid var(--c-border);
  background: #fff;
  padding: 4px;
}

[data-theme='night'] .qr-svg {
  border-color: #6b5a2a;
}

.qr-hint,
.qr-fallback {
  font-size: 12px;
  color: var(--c-text-muted);
  text-align: center;
  line-height: 1.6;
}

.qr-fallback {
  margin-top: var(--space-md);
}

.qr-lite {
  color: var(--c-warning, #d97706);
  padding: 0 8px;
}

.scan-box {
  margin-top: var(--space-sm);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--c-border);
  background: #000;
}

.scan-video {
  width: 100%;
  max-height: 320px;
  object-fit: cover;
  display: block;
}

.scan-hint {
  font-size: 12px;
  color: var(--c-text-muted);
  text-align: center;
  padding: 8px 0;
  background: var(--c-bg-card);
}

.sync-preview {
  margin-top: var(--space-md);
  border: 1px solid var(--c-primary);
  border-radius: 10px;
  padding: var(--space-sm) var(--space-md);
  background: var(--c-bg-soft);
}

.preview-title {
  font-size: 14px;
  margin-bottom: 6px;
}

.preview-list {
  list-style: none;
  padding: 0;
  margin: 0 0 8px;
  font-size: 13px;
  color: var(--c-text-secondary);
  line-height: 1.8;
}

.sync-warn {
  font-size: 12px;
  color: var(--c-danger, #ef4444);
  line-height: 1.6;
  margin-bottom: 4px;
}

.sync-warn-soft {
  color: var(--c-text-muted);
}

.sync-error {
  margin-top: var(--space-sm);
  font-size: 13px;
  color: var(--c-danger, #ef4444);
  line-height: 1.6;
}

.sync-success {
  margin-top: var(--space-sm);
  font-size: 13px;
  color: var(--c-success, #16a34a);
  line-height: 1.6;
}

.note-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  color: var(--c-text-secondary);
  line-height: 1.9;
}

@media (max-width: 767px) {
  .sync-row {
    flex-direction: column;
  }
}
</style>
