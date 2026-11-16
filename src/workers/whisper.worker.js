/* ============================================================
   workers/whisper.worker.js —— 浏览器内 Whisper 语音识别 Worker
   使用 transformers.js（ONNX Runtime WebAssembly）在本地推理，
   不依赖任何后端。模型首次从镜像站下载（约 45MB）后浏览器缓存。
   ============================================================ */
import { pipeline, env } from '@huggingface/transformers'

/* 国内网络优先走 hf-mirror 镜像；不缓存本地模型文件 */
env.allowLocalModels = false
env.remoteHost = 'https://hf-mirror.com'

let transcriber = null
let loadingPromise = null

function load() {
  if (transcriber) return Promise.resolve(transcriber)
  if (!loadingPromise) {
    /* whisper-tiny.en 量化版：体积小、英语识别够用，纯浏览器可跑 */
    loadingPromise = pipeline('automatic-speech-recognition', 'onnx-community/whisper-tiny.en', { dtype: 'q8' })
      .then((p) => {
        transcriber = p
        return p
      })
      .catch((e) => {
        loadingPromise = null
        throw e
      })
  }
  return loadingPromise
}

async function ensureReady() {
  await load()
  self.postMessage({ type: 'ready' })
}

async function transcribe(id, audio) {
  const out = await (await load())(audio, { language: 'en', task: 'transcribe' })
  self.postMessage({ type: 'result', id, text: (out && out.text) || '' })
}

self.onmessage = async (e) => {
  const { type, id, audio } = e.data || {}
  try {
    if (type === 'load') await ensureReady()
    else if (type === 'transcribe') await transcribe(id, audio)
  } catch (err) {
    self.postMessage({ type: 'error', id, message: (err && err.message) || String(err) })
  }
}
