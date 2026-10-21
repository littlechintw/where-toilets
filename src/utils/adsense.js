/**
 * AdSense script 的延遲載入器。
 *
 * - 全站只載入一次（回傳同一個 Promise）。
 * - 等到使用者第一次互動（點擊／按鍵／捲動）或瀏覽器閒置（最多等 3 秒）才真的插入 script，
 *   避免拖慢首屏與 LCP。
 * - 載入前先設定 requestNonPersonalizedAds = 1，要求非個人化廣告。
 * - 被廣告阻擋器擋掉時會 reject，呼叫端只需要靜默忽略。
 */

const SCRIPT_URL = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'

let loadPromise = null

function waitForIdleOrInteraction(timeout = 3000) {
  return new Promise((resolve) => {
    let done = false
    const events = ['pointerdown', 'keydown', 'scroll', 'touchstart']
    const finish = () => {
      if (done) return
      done = true
      events.forEach(name => window.removeEventListener(name, finish))
      resolve()
    }
    events.forEach(name => window.addEventListener(name, finish, { once: true, passive: true }))
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(finish, { timeout })
    } else {
      setTimeout(finish, timeout)
    }
  })
}

export function loadAdSense(client) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('AdSense: no window'))
  }
  if (loadPromise) return loadPromise

  loadPromise = waitForIdleOrInteraction().then(() => new Promise((resolve, reject) => {
    const queue = (window.adsbygoogle = window.adsbygoogle || [])
    queue.requestNonPersonalizedAds = 1

    const script = document.createElement('script')
    script.async = true
    script.crossOrigin = 'anonymous'
    script.src = `${SCRIPT_URL}?client=${encodeURIComponent(client)}`
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('AdSense: adsbygoogle.js failed to load'))
    document.head.appendChild(script)
  }))

  return loadPromise
}
