/* 构建后清理：删除 dist 中未被运行时引用的超大 ONNX 运行时 wasm。
   transformers.js 默认经 jsdelivr CDN 加载 ort-wasm-simd-threaded.*，
   dist 内的副本是打包时的死产物；Cloudflare Workers 静态资产单文件
   上限 25 MiB，不清理会导致部署失败（asyncify 变体约 25.6 MiB）。 */
const fs = require('fs')
const path = require('path')

const assetsDir = path.join(__dirname, '..', 'dist', 'assets')
if (!fs.existsSync(assetsDir)) process.exit(0)

let removed = 0
for (const f of fs.readdirSync(assetsDir)) {
  if (/^ort-wasm-.*\.wasm$/i.test(f)) {
    fs.unlinkSync(path.join(assetsDir, f))
    removed++
    console.log('prune-dist: 已删除', f)
  }
}
if (!removed) console.log('prune-dist: 无 ort wasm 需清理')
