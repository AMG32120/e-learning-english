/* Cloudflare Worker 入口（Workers Builds 部署模式）
   职责一：/api/hf/* → HF 模型同源代理（hf-mirror.com，回退 huggingface.co）
           服务端跟随 30x 重定向后流式转发，规避镜像站重定向响应缺少
           Access-Control-Allow-Origin 的问题，使浏览器同源拉取神经 TTS 模型。
   职责二：/api/ort/* → ONNX 运行时文件同源代理（jsdelivr）。
   职责三：/api/cloud/* → 云端账号与进度存取（D1 数据库）。
   职责四：其余请求交由 ASSETS 绑定回落到静态资产（SPA 回退由 wrangler
           assets 的 not_found_handling 配置处理，不经此脚本）。 */

import { handleCloudApi } from './cloud.js'

const UPSTREAMS = ['https://hf-mirror.com', 'https://huggingface.co']
const PROXY_PREFIX = '/api/hf/'
/* ONNX 运行时文件（transformers 4.3.2 内置版本）：
   默认由浏览器直连 jsdelivr CDN，国内不稳定；改经同源代理，
   浏览器侧再由 SW CacheFirst 持久化。 */
const ORT_PREFIX = '/api/ort/'
const ORT_VERSION = '1.31.0-dev.20260914-8d85527a0'

async function proxyOrt(url) {
  const file = url.pathname.slice(ORT_PREFIX.length)
  const r = await fetch(
    `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ORT_VERSION}/dist/${file}`,
    { redirect: 'follow', headers: { 'accept-encoding': 'identity' } }
  ).catch(() => null)
  if (!r || !r.ok) {
    return new Response('ORT proxy: upstream unreachable', { status: r ? r.status : 502 })
  }
  const out = new Headers()
  /* 不转发 content-length：上游压缩体被运行时解压后长度会错位，
     声明压缩长度会令浏览器提前截断（wasm 截断 → Unexpected end of
     input）。去掉后以 chunked 按实际流传输。 */
  for (const h of ['content-type', 'accept-ranges', 'content-range']) {
    const v = r.headers.get(h)
    if (v) out.set(h, v)
  }
  out.set('cache-control', 'public, max-age=31536000, immutable')
  return new Response(r.body, { status: r.status, headers: out })
}

async function proxyHf(request, url) {
  const path = url.pathname.slice(PROXY_PREFIX.length)
  const headers = { 'user-agent': 'e-learning-tts-proxy', 'accept-encoding': 'identity' }
  const range = request.headers.get('range')
  if (range) headers.range = range
  const inm = request.headers.get('if-none-match')
  if (inm) headers['if-none-match'] = inm

  let r = null
  for (const base of UPSTREAMS) {
    try {
      r = await fetch(`${base}/${path}${url.search}`, { headers, redirect: 'follow' })
    } catch {
      r = null
    }
    if (r && r.ok) break
    if (r && r.status === 404) break // 文件不存在，无需换源
  }
  if (!r) {
    return new Response('HF proxy: upstream unreachable', { status: 502 })
  }
  const out = new Headers()
  /* 不转发 content-length（同 proxyOrt 的压缩/解压错位截断问题） */
  for (const h of ['content-type', 'etag', 'accept-ranges', 'content-range']) {
    const v = r.headers.get(h)
    if (v) out.set(h, v)
  }
  out.set('cache-control', 'public, max-age=86400')
  return new Response(r.body, { status: r.status, headers: out })
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (url.pathname.startsWith(PROXY_PREFIX)) {
      return proxyHf(request, url)
    }
    if (url.pathname.startsWith(ORT_PREFIX)) {
      return proxyOrt(url)
    }
    const cloud = await handleCloudApi(request, env)
    if (cloud) return cloud
    return env.ASSETS.fetch(request)
  },
}
