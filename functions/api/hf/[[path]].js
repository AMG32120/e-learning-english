/* Cloudflare Pages Function：HF 模型同源代理
   路由：/api/hf/<repo>/resolve/<revision>/<file> → hf-mirror.com（回退 huggingface.co）
   服务端跟随 30x 重定向后流式转发，规避镜像站重定向响应缺少
   Access-Control-Allow-Origin 的问题，使浏览器同源拉取神经 TTS 模型。 */
export async function onRequestGet({ params, request }) {
  const path = (params.path || []).join('/')
  const search = new URL(request.url).search
  const headers = { 'user-agent': 'e-learning-tts-proxy' }
  const range = request.headers.get('range')
  if (range) headers.range = range
  const inm = request.headers.get('if-none-match')
  if (inm) headers['if-none-match'] = inm

  let r = null
  for (const base of ['https://hf-mirror.com', 'https://huggingface.co']) {
    try {
      r = await fetch(`${base}/${path}${search}`, { headers, redirect: 'follow' })
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
  for (const h of ['content-type', 'content-length', 'etag', 'accept-ranges', 'content-range']) {
    const v = r.headers.get(h)
    if (v) out.set(h, v)
  }
  out.set('cache-control', 'public, max-age=86400')
  return new Response(r.body, { status: r.status, headers: out })
}
