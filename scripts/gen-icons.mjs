/* 生成 PWA 图标（无依赖 PNG 编码：圆角方块 + 字母 A） */
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const CRC_TABLE = (() => {
  const t = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeBuf = Buffer.from(type, 'ascii')
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function encodePng(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4)
  }
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))])
}

/* 距离点到线段 */
function distToSeg(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1
  const dy = y2 - y1
  const len2 = dx * dx + dy * dy
  let t = len2 ? ((px - x1) * dx + (py - y1) * dy) / len2 : 0
  t = Math.max(0, Math.min(1, t))
  const cx = x1 + t * dx
  const cy = y1 + t * dy
  return Math.hypot(px - cx, py - cy)
}

function drawIcon(size, { bleed = false } = {}) {
  const buf = Buffer.alloc(size * size * 4)
  const r = bleed ? 0 : size * 0.22          // 圆角半径
  const s = bleed ? 0.62 : 0.78              // 字母占比（maskable 留安全边距）
  const cx = size / 2
  const glyphH = size * s
  const top = cx - glyphH / 2
  const bottom = cx + glyphH / 2
  const halfW = glyphH * 0.36
  const stroke = size * 0.075
  const crossY = top + glyphH * 0.68

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      // 圆角判定
      let inside = true
      if (r > 0) {
        const inX = x < r ? r - x : x > size - r ? x - (size - r) : 0
        const inY = y < r ? r - y : y > size - r ? y - (size - r) : 0
        if (inX && inY && Math.hypot(inX, inY) > r) inside = false
      }
      if (!inside) { buf[i + 3] = 0; continue }
      // 背景：竖向渐变（#2F7CF6 → #1B5FD1）
      const t = y / size
      let cr = Math.round(47 + (27 - 47) * t)
      let cg = Math.round(124 + (95 - 124) * t)
      let cb = Math.round(246 + (209 - 246) * t)
      // 字母 A：左斜线 + 右斜线 + 横杠
      const d1 = distToSeg(x, y, cx, bottom, cx - halfW, bottom) // 占位，下面重算
      void d1
      const dLeft = distToSeg(x, y, cx, top, cx - halfW, bottom)
      const dRight = distToSeg(x, y, cx, top, cx + halfW, bottom)
      const dBar = Math.abs(y - crossY) <= stroke * 0.45 && x >= cx - halfW * 0.62 && x <= cx + halfW * 0.62
        ? 0
        : 1e9
      if (Math.min(dLeft, dRight, dBar) <= stroke / 2) { cr = 255; cg = 255; cb = 255 }
      buf[i] = cr
      buf[i + 1] = cg
      buf[i + 2] = cb
      buf[i + 3] = 255
    }
  }
  return encodePng(size, size, buf)
}

const out = join(fileURLToPath(new URL('..', import.meta.url)), 'public', 'icons')
mkdirSync(out, { recursive: true })
const targets = [
  ['icon-192.png', 192, {}],
  ['icon-512.png', 512, {}],
  ['icon-512-maskable.png', 512, { bleed: true }]
]
for (const [name, size, opt] of targets) {
  writeFileSync(join(out, name), drawIcon(size, opt))
  console.log('generated', name)
}
