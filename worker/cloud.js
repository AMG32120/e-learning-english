/* ============================================================
   worker/cloud.js —— 云端数据 API（Cloudflare D1）
   路由前缀 /api/cloud/*，账号与学习进度的云端存取。
   安全模型：与本地单机版同级——密码在前端做 SHA-256，
   云端只存哈希；数据接口要求携带 token =
   SHA-256(`cloud-token-v1|${username}|${passwordHash}`)，
   服务端用库内哈希重算比对（无需额外会话存储）。
   ============================================================ */

const USERNAME_RE = /^[a-zA-Z0-9_]{2,20}$/
const TOKEN_SALT = 'cloud-token-v1'
/* 用户进度 JSON 上限：约 5MB（正常几十~几百 KB） */
const MAX_DATA_BYTES = 5 * 1024 * 1024

/* ---------- 工具 ---------- */

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  })
}

async function sha256Hex(text) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(text)))
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function makeToken(username, passwordHash) {
  return sha256Hex(`${TOKEN_SALT}|${username}|${passwordHash}`)
}

async function readJson(request) {
  try {
    return await request.json()
  } catch {
    return null
  }
}

/* 数据库未绑定（配置遗漏）时的统一降级响应 */
function dbUnavailable() {
  return json({ ok: false, msg: '云端数据库未配置' }, 503)
}

/* ---------- 路由处理 ---------- */

/* 注册：POST /api/cloud/register  { username, passwordHash, nickname } */
async function handleRegister(request, db) {
  const body = await readJson(request)
  const username = String((body && body.username) || '').trim()
  const passwordHash = String((body && body.passwordHash) || '')
  const nickname = String((body && body.nickname) || '').trim()
  if (!USERNAME_RE.test(username)) return json({ ok: false, msg: '用户名需为 2~20 位字母、数字或下划线' }, 400)
  if (passwordHash.length !== 64) return json({ ok: false, msg: '密码哈希无效' }, 400)

  const exists = await db
    .prepare('SELECT username FROM users WHERE username = ?1')
    .bind(username)
    .first()
  if (exists) return json({ ok: false, msg: '该用户名已被注册，请换一个' }, 409)

  await db
    .prepare('INSERT INTO users (username, password_hash, nickname, created_at) VALUES (?1, ?2, ?3, ?4)')
    .bind(username, passwordHash, nickname || username, Date.now())
    .run()
  return json({ ok: true, msg: '注册成功' })
}

/* 登录校验：POST /api/cloud/auth  { username, passwordHash }
   返回 token 与云端进度（如有），供前端合并进本地。 */
async function handleAuth(request, db) {
  const body = await readJson(request)
  const username = String((body && body.username) || '').trim()
  const passwordHash = String((body && body.passwordHash) || '')
  if (!username || passwordHash.length !== 64) return json({ ok: false, msg: '参数无效' }, 400)

  const user = await db
    .prepare('SELECT username, password_hash, nickname FROM users WHERE username = ?1')
    .bind(username)
    .first()
  if (!user) return json({ ok: false, msg: '用户名不存在', code: 'no_user' }, 404)
  if (user.password_hash !== passwordHash) return json({ ok: false, msg: '密码错误' }, 401)

  const token = await makeToken(username, passwordHash)
  const row = await db
    .prepare('SELECT data, updated_at FROM user_data WHERE username = ?1')
    .bind(username)
    .first()
  return json({
    ok: true,
    token,
    nickname: user.nickname,
    data: row ? JSON.parse(row.data) : null,
    updatedAt: row ? row.updated_at : 0
  })
}

/* 读进度：GET /api/cloud/data?u=<username>&t=<token> */
async function handleGetData(url, db) {
  const username = url.searchParams.get('u') || ''
  const token = url.searchParams.get('t') || ''
  if (!username || !token) return json({ ok: false, msg: '参数无效' }, 400)

  const user = await db
    .prepare('SELECT password_hash FROM users WHERE username = ?1')
    .bind(username)
    .first()
  if (!user) return json({ ok: false, msg: '用户名不存在' }, 404)
  if ((await makeToken(username, user.password_hash)) !== token) {
    return json({ ok: false, msg: '凭证无效' }, 401)
  }

  const row = await db
    .prepare('SELECT data, updated_at FROM user_data WHERE username = ?1')
    .bind(username)
    .first()
  if (!row) return json({ ok: true, data: null, updatedAt: 0 })
  return json({ ok: true, data: JSON.parse(row.data), updatedAt: row.updated_at })
}

/* 存进度：POST /api/cloud/data  { username, token, data } */
async function handleSaveData(request, db) {
  const body = await readJson(request)
  const username = String((body && body.username) || '').trim()
  const token = String((body && body.token) || '')
  const data = body && body.data
  if (!username || !token || !data || typeof data !== 'object') {
    return json({ ok: false, msg: '参数无效' }, 400)
  }
  const payload = JSON.stringify(data)
  if (payload.length > MAX_DATA_BYTES) return json({ ok: false, msg: '进度数据过大' }, 413)

  const user = await db
    .prepare('SELECT password_hash FROM users WHERE username = ?1')
    .bind(username)
    .first()
  if (!user) return json({ ok: false, msg: '用户名不存在' }, 404)
  if ((await makeToken(username, user.password_hash)) !== token) {
    return json({ ok: false, msg: '凭证无效' }, 401)
  }

  await db
    .prepare(
      `INSERT INTO user_data (username, data, updated_at) VALUES (?1, ?2, ?3)
       ON CONFLICT(username) DO UPDATE SET data = ?2, updated_at = ?3`
    )
    .bind(username, payload, Date.now())
    .run()
  return json({ ok: true, updatedAt: Date.now() })
}

/* 重置密码：POST /api/cloud/reset  { username, token(旧凭证), passwordHash(新哈希) } */
async function handleReset(request, db) {
  const body = await readJson(request)
  const username = String((body && body.username) || '').trim()
  const token = String((body && body.token) || '')
  const passwordHash = String((body && body.passwordHash) || '')
  if (!username || !token || passwordHash.length !== 64) return json({ ok: false, msg: '参数无效' }, 400)

  const user = await db
    .prepare('SELECT password_hash FROM users WHERE username = ?1')
    .bind(username)
    .first()
  if (!user) return json({ ok: false, msg: '用户名不存在', code: 'no_user' }, 404)
  if ((await makeToken(username, user.password_hash)) !== token) {
    return json({ ok: false, msg: '凭证无效' }, 401)
  }

  await db
    .prepare('UPDATE users SET password_hash = ?2 WHERE username = ?1')
    .bind(username, passwordHash)
    .run()
  const newToken = await makeToken(username, passwordHash)
  return json({ ok: true, token: newToken })
}

/* ---------- 总入口：返回 null 表示非本模块路由 ---------- */
export async function handleCloudApi(request, env) {
  const url = new URL(request.url)
  if (!url.pathname.startsWith('/api/cloud/')) return null
  const db = env.DB
  if (!db) return dbUnavailable()

  try {
    switch (url.pathname) {
      case '/api/cloud/register':
        return await handleRegister(request, db)
      case '/api/cloud/auth':
        return await handleAuth(request, db)
      case '/api/cloud/data':
        return request.method === 'GET'
          ? await handleGetData(url, db)
          : await handleSaveData(request, db)
      case '/api/cloud/reset':
        return await handleReset(request, db)
      default:
        return json({ ok: false, msg: '未知接口' }, 404)
    }
  } catch (e) {
    console.error('[cloud] API 错误：', e && e.message)
    return json({ ok: false, msg: '云端服务异常' }, 500)
  }
}
