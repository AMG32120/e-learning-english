/* ============================================================
   services/asr.js —— 浏览器语音识别（Web Speech API）封装
   说明：
   * Chrome 桌面版识别走谷歌服务器，国内网络可能不可达（报 network 错误）
   * Edge 走微软服务、Safari 走苹果服务，国内通常可用
   * 不支持该 API 的浏览器返回 null，UI 隐藏麦克风按钮
   ============================================================ */

export function isSpeechRecognitionSupported() {
  return typeof window !== 'undefined' && (typeof window.SpeechRecognition !== 'undefined' || typeof window.webkitSpeechRecognition !== 'undefined')
}

/* 创建识别器；回调：onInterim(临时文本) / onFinal(最终文本) / onError(code) / onEnd() */
export function createRecognizer({ lang = 'en-US', onInterim, onFinal, onError, onEnd } = {}) {
  if (!isSpeechRecognitionSupported()) return null
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  const rec = new SR()
  rec.lang = lang
  rec.interimResults = true
  rec.continuous = false
  rec.maxAlternatives = 1

  rec.onresult = (e) => {
    let interim = ''
    let finalText = ''
    for (let i = 0; i < e.results.length; i += 1) {
      const r = e.results[i]
      if (r.isFinal) finalText += r[0].transcript
      else interim += r[0].transcript
    }
    if (finalText && onFinal) onFinal(finalText.trim())
    else if (interim && onInterim) onInterim(interim.trim())
  }
  if (onError) rec.onerror = (e) => onError(e.error || 'unknown')
  if (onEnd) rec.onend = () => onEnd()
  return rec
}

/* 错误码 → 用户可读提示 */
export function asrErrorText(code) {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return '麦克风权限被拒绝：请在浏览器地址栏允许麦克风后重试。'
    case 'network':
      return '语音识别服务连不上（Chrome 需要访问谷歌服务，国内网络常被拦截）。建议改用 Edge 或 Safari 浏览器的语音输入。'
    case 'no-speech':
      return '没有检测到说话声，请靠近麦克风再试一次。'
    case 'audio-capture':
      return '未找到可用麦克风，请检查设备连接。'
    case 'aborted':
      return '' // 用户主动取消，静默
    default:
      return '语音识别暂时不可用，请重试或直接打字。'
  }
}
