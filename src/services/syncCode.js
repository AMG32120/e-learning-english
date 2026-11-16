/* ============================================================
   services/syncCode.js —— 跨设备同步码 / 二维码
   纯前端方案：把用户进度 JSON 压缩（deflate-raw）后 Base64URL 编码，
   生成一段可复制的文本同步码；同时可渲染成二维码供另一台设备扫码。

   同步码格式：QC1.<Z|P><base64url>
     Z = deflate-raw 压缩（现代浏览器）
     P = 未压缩（不支持 CompressionStream 时的兜底）
   ============================================================ */

import qrcode from 'qrcode-generator'
import {
  exportUserData,
  validateImportPayload,
  mergeUserData,
  getUserData,
  saveUserData,
  findAccount,
  getAccounts,
  saveAccounts,
  setSession,
  getSession
} from './storage'

const PREFIX = 'QC1'

/* ---------- Base64URL 编解码（兼容大数组，分块处理） ---------- */

function bytesToBase64Url(bytes) {
  let binary = ''
  const CHUNK = 0x8000
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK))
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlToBytes(str) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const pad = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4))
  const binary = atob(base64 + pad)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function deflate(bytes) {
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

async function inflate(bytes) {
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

/* ---------- 摘要信息（展示用） ---------- */

export function summarizeExport(payload) {
  const d = (payload && payload.data) || {}
  const stages = (d.progress && d.progress.stages) || {}
  const completed = Object.values(stages).filter((s) => s && s.completed).length
  return {
    username: (payload && payload.user && payload.user.username) || '',
    nickname: (d.profile && d.profile.nickname) || '',
    completedStages: completed,
    checkinDays: Object.keys(d.checkins || {}).length,
    badges: (d.badges || []).length,
    exportedAt: (payload && payload.exportedAt) || ''
  }
}

/* ---------- 生成同步码 ---------- */

/** 把导出数据编码为同步码文本（压缩 + Base64URL） */
export async function encodePayload(payload) {
  const json = JSON.stringify(payload)
  const raw = new TextEncoder().encode(json)

  let body = ''
  let compressed = false
  if (typeof CompressionStream === 'function') {
    try {
      const packed = await deflate(raw)
      body = `Z${bytesToBase64Url(packed)}`
      compressed = true
    } catch {
      body = ''
    }
  }
  if (!body) body = `P${bytesToBase64Url(raw)}`

  const code = `${PREFIX}.${body}`
  return {
    code,
    compressed,
    rawBytes: raw.length,
    packedBytes: Math.round((code.length * 3) / 4),
    size: code.length
  }
}

/** 二维码专用精简数据：去掉学习统计曲线与每日统计（体积大、非核心进度） */
export function stripStats(payload) {
  const clone = JSON.parse(JSON.stringify(payload))
  const stats = clone.data && clone.data.stats
  if (stats) {
    delete stats.daily
    delete stats.vocabHistory
    delete stats.vocabEstimates
  }
  return clone
}

/** 生成完整同步码（含同步码本身与解析用 payload） */
export async function createSyncCode(username) {
  if (!username) return { ok: false, reason: '未登录，无法生成同步码' }
  const payload = exportUserData(username)
  if (!payload) return { ok: false, reason: '暂无可同步的数据' }
  const encoded = await encodePayload(payload)
  return {
    ok: true,
    ...encoded,
    payload,
    summary: summarizeExport(payload)
  }
}

/* ---------- 解析同步码 ---------- */

export async function parseSyncCode(codeText) {
  const code = String(codeText || '').replace(/\s+/g, '')
  if (!code) return { ok: false, reason: '请先粘贴同步码' }
  if (!code.startsWith(`${PREFIX}.`)) {
    return { ok: false, reason: '同步码格式不正确（应以 QC1. 开头），请确认复制完整' }
  }
  const body = code.slice(PREFIX.length + 1)
  const flag = body.charAt(0)
  if (flag !== 'Z' && flag !== 'P') {
    return { ok: false, reason: '同步码版本不受支持，请确认复制完整' }
  }
  let bytes
  try {
    bytes = base64UrlToBytes(body.slice(1))
  } catch {
    return { ok: false, reason: '同步码内容已损坏（编码解析失败），请重新复制' }
  }
  let json
  try {
    if (flag === 'Z') {
      if (typeof DecompressionStream !== 'function') {
        return { ok: false, reason: '当前浏览器不支持解压该同步码，请更换新版浏览器（Chrome/Edge 103+、Safari 16.4+）' }
      }
      json = new TextDecoder().decode(await inflate(bytes))
    } else {
      json = new TextDecoder().decode(bytes)
    }
  } catch {
    return { ok: false, reason: '同步码解压失败，请重新生成后再试' }
  }
  return payloadFromJson(json, '同步码内容解析失败，可能复制不完整')
}

/** JSON 文本 → 校验后的 payload（同步码与二维码共用） */
function payloadFromJson(json, parseFailReason = '内容解析失败') {
  let payload
  try {
    payload = JSON.parse(json)
  } catch {
    return { ok: false, reason: parseFailReason }
  }
  const check = validateImportPayload(payload)
  if (!check.ok) return check
  return { ok: true, payload, summary: summarizeExport(payload) }
}

/* ---------- 应用同步码 ---------- */

/**
 * 把同步码中的进度写入本机
 * @param {object} payload parseSyncCode 返回的 payload
 * @param {'merge'|'overwrite'} mode 合并（取较高值/并集）或覆盖
 */
export async function applySyncCode(payload, mode = 'merge') {
  const check = validateImportPayload(payload)
  if (!check.ok) return check
  const username = payload.user.username
  const account = findAccount(username)
  const current = getSession()

  // 本机没有该账号：用同步码里的密码哈希创建（保证之后能用原密码登录）
  if (!account) {
    const accounts = getAccounts()
    accounts.push({
      username,
      passwordHash: payload.user.passwordHash || '',
      createdAt: payload.user.createdAt || Date.now(),
      nickname: (payload.data.profile && payload.data.profile.nickname) || username
    })
    saveAccounts(accounts)
  }

  if (mode === 'overwrite' || !account) {
    saveUserData(username, payload.data)
  } else {
    saveUserData(username, mergeUserData(getUserData(username), payload.data))
  }
  setSession(username)

  return {
    ok: true,
    username,
    mode: !account ? 'created' : mode,
    switched: current !== username,
    message: !account ? '已创建本地账号并导入进度' : mode === 'merge' ? '已合并导入（取较高值）' : '已覆盖导入'
  }
}

/* ---------- 二维码生成 ---------- */

const QR_BYTE_LIMIT = 1800 // 超过该字节数二维码会非常密集，优先改用精简数据
const QR_MAX_BYTES = 2900 // QR 字节模式理论上限（版本 40 / 纠错 L）
const QR_MAGIC = [0x51, 0x43, 0x42, 0x31] // 'QCB1'

function bytesToLatin1(bytes) {
  let out = ''
  const CHUNK = 0x2000
  for (let i = 0; i < bytes.length; i += CHUNK) {
    out += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK))
  }
  return out
}

/**
 * 把字节序列渲染成二维码（qrcode-generator 的 Byte 模式按 charCode & 0xff 取字节，
 * 因此 latin1 字符串可以无损承载二进制数据，比 Base64 省 1/3 体积）
 */
function qrFromBytes(bytes, ecc = 'L') {
  if (!bytes || !bytes.length) return { ok: false, reason: '没有可生成二维码的内容' }
  if (bytes.length > QR_MAX_BYTES) {
    return { ok: false, reason: `数据量较大（${bytes.length} 字节），二维码容量不足，请改用同步码文本复制粘贴` }
  }
  let qr
  try {
    qr = qrcode(0, ecc)
    qr.addData(bytesToLatin1(bytes), 'Byte')
    qr.make()
  } catch {
    return { ok: false, reason: '数据量超出二维码容量，请改用同步码文本复制粘贴' }
  }
  const count = qr.getModuleCount()
  const margin = 2
  const parts = []
  const matrix = []
  for (let r = 0; r < count; r += 1) {
    const row = new Uint8Array(count)
    for (let c = 0; c < count; c += 1) {
      if (qr.isDark(r, c)) {
        parts.push(`M${c + margin} ${r + margin}h1v1h-1z`)
        row[c] = 1
      }
    }
    matrix.push(row)
  }
  return { ok: true, size: count + margin * 2, path: parts.join(''), modules: count, matrix }
}

/** 文本 → 二维码（手动复制的同步码文本也能生成二维码） */
export function buildQrSvg(text, ecc = 'L') {
  const value = String(text || '')
  if (!value) return { ok: false, reason: '没有可生成二维码的内容' }
  if (value.length > QR_MAX_BYTES) {
    return {
      ok: false,
      reason: `数据量较大（${value.length} 字符），二维码容量不足，请改用同步码文本复制粘贴`
    }
  }
  return qrFromBytes(new TextEncoder().encode(value), ecc)
}

/** 把 payload 压成二进制（带 QCB1 魔数），供二维码使用 */
export async function encodePayloadBytes(payload) {
  if (typeof CompressionStream !== 'function') return null
  try {
    const packed = await deflate(new TextEncoder().encode(JSON.stringify(payload)))
    const out = new Uint8Array(packed.length + QR_MAGIC.length)
    out.set(QR_MAGIC, 0)
    out.set(packed, QR_MAGIC.length)
    return out
  } catch {
    return null
  }
}

/**
 * 为当前进度挑选最合适的二维码：
 * 数据不大 → 完整数据；数据较大 → 精简数据（去掉统计曲线）；都不行 → 提示改用文本同步码
 */
export async function buildQrForPayload(payload) {
  const full = await encodePayloadBytes(payload)
  const lite = await encodePayloadBytes(stripStats(payload))
  const make = (bytes, isLite) => {
    const res = qrFromBytes(bytes)
    return res.ok ? { ...res, lite: isLite, bytes: bytes.length } : null
  }
  if (full && full.length <= QR_BYTE_LIMIT) {
    const res = make(full, false)
    if (res) return res
  }
  if (lite && lite.length <= QR_MAX_BYTES) {
    const res = make(lite, true)
    if (res) return res
  }
  if (full && full.length <= QR_MAX_BYTES) {
    const res = make(full, false)
    if (res) return res
  }
  return {
    ok: false,
    reason: `学习数据较多（压缩后 ${full ? full.length : '-'} 字节），二维码放不下，请改用同步码文本复制粘贴`
  }
}

/** 解析扫码得到的二进制内容（QCB1 魔数 + deflate 数据） */
export async function parseQrBinary(rawBytes) {
  // jsQR 返回的是普通数组，统一转成 Uint8Array 再交给 Blob/解压流
  const binaryData = rawBytes instanceof Uint8Array ? rawBytes : new Uint8Array(rawBytes || [])
  if (!binaryData.length || binaryData.length < QR_MAGIC.length + 2) {
    return { ok: false, reason: '二维码内容为空' }
  }
  const magic = String.fromCharCode(...binaryData.slice(0, QR_MAGIC.length))
  if (magic !== 'QCB1') {
    return { ok: false, reason: '扫到的不是本应用的同步二维码，请对准二维码重试' }
  }
  if (typeof DecompressionStream !== 'function') {
    return { ok: false, reason: '当前浏览器不支持解压二维码数据，请改用同步码文本' }
  }
  let json
  try {
    json = new TextDecoder().decode(await inflate(binaryData.slice(QR_MAGIC.length)))
  } catch {
    return { ok: false, reason: '二维码数据解压失败，请重新扫描'}
  }
  return payloadFromJson(json)
}

/* qrcode-generator 由 SyncView 懒加载路由引入，不影响首屏体积 */
