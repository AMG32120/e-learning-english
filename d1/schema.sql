-- ============================================================
-- schema.sql —— 启程英语云端数据库（Cloudflare D1 / SQLite）
-- 两张表：
--   users     账号表（与前端 localStorage accounts 结构对齐）
--   user_data 每用户进度 JSON 快照（与前端 user_<username> 键对齐）
-- 应用方式：npx wrangler d1 execute qceng-db --remote --file=./d1/schema.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  username      TEXT PRIMARY KEY,              -- 用户名（2~20 位字母数字下划线）
  password_hash TEXT NOT NULL,                 -- SHA-256(password) 十六进制，前端计算
  nickname      TEXT NOT NULL DEFAULT '',      -- 昵称
  created_at    INTEGER NOT NULL               -- 创建时间（毫秒时间戳）
);

CREATE TABLE IF NOT EXISTS user_data (
  username   TEXT PRIMARY KEY,                 -- 与 users.username 对应
  data       TEXT NOT NULL,                    -- 完整用户进度 JSON（前端 UserData 结构）
  updated_at INTEGER NOT NULL                  -- 最后保存时间（毫秒时间戳）
);

CREATE INDEX IF NOT EXISTS idx_user_data_updated ON user_data (updated_at);
