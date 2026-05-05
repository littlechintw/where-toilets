/**
 * Google Analytics 4 包裝器
 *
 * 用法：
 *   import { trackEvent, trackPageView } from '@/utils/analytics'
 *   trackEvent('locate_me', { source: 'button' })
 *
 * 需要在 index.html 中載入 gtag.js 並 config('G-XXXXXXXXXX')。
 * 為了避免重複的 page_view，gtag config 已經 send_page_view: false，
 * 由本檔案的 trackPageView() 在 router 切換時手動送出。
 */

/** 取得 gtag 函式（如果還沒載入則安全地回傳 noop） */
function getGtag() {
  if (typeof window === 'undefined') return null
  return typeof window.gtag === 'function' ? window.gtag : null
}

/**
 * 追蹤頁面瀏覽（在 vue-router 的 afterEach 呼叫）
 * @param {string} path  例如 '/map'
 * @param {string} title 例如 document.title
 */
export function trackPageView(path, title) {
  const gtag = getGtag()
  if (!gtag) return
  gtag('event', 'page_view', {
    page_path: path,
    page_title: title || (typeof document !== 'undefined' ? document.title : ''),
    page_location: typeof window !== 'undefined' ? window.location.href : ''
  })
}

/**
 * 追蹤自訂事件
 * @param {string} name   事件名稱（建議 snake_case）
 * @param {object} params 自訂參數
 */
export function trackEvent(name, params = {}) {
  const gtag = getGtag()
  if (!gtag) {
    // 開發或尚未設定 GA 時，把事件印到 console 方便偵錯
    if (typeof console !== 'undefined') {
      console.debug('[analytics] (no gtag)', name, params)
    }
    return
  }
  try {
    gtag('event', name, params)
  } catch (err) {
    console.warn('[analytics] track event failed:', err)
  }
}

/**
 * 推薦事件命名表（保持一致才能在 GA4 報表中分組）：
 *
 *   page_view          —— 路由切換
 *   language_toggle    —— 切換中英文     { from, to }
 *   cta_get_started    —— 首頁主按鈕點擊
 *   locate_me          —— 點擊「定位」  { result: 'success' | 'fail' }
 *   search_location    —— 自訂位置搜尋  { type: 'address' | 'coordinate', success: bool }
 *   filter_change      —— 變更篩選器    { filter, value }
 *   reset_filters      —— 重置篩選
 *   toilet_open        —— 開啟廁所詳細  { grade, type }
 *   navigation_open    —— 開啟導航      { provider: 'google' | 'apple' }
 *   external_link      —— 點擊外部連結  { href }
 */
