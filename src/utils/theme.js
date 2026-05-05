/**
 * 主題（亮 / 暗 / 跟隨系統）工具。
 *
 * 設計：
 *   - 三種偏好：'light' | 'dark' | 'system'
 *   - 'system' 會跟著 OS / 瀏覽器的 prefers-color-scheme 決定實際呈現
 *   - 偏好存在 localStorage('theme')；未設定預設為 'system'
 *   - 套用方式是在 <html> 上加 data-theme 屬性，CSS 用 [data-theme="dark"] 覆寫變數
 */

const STORAGE_KEY = 'theme'
const VALID = ['light', 'dark', 'system']

/** 目前儲存的偏好（含 system） */
export function getThemePreference() {
  if (typeof localStorage === 'undefined') return 'system'
  const v = localStorage.getItem(STORAGE_KEY)
  return VALID.includes(v) ? v : 'system'
}

/** 系統實際偏好（dark / light） */
export function getSystemTheme() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** 解析使用者偏好為實際呈現的主題（dark / light） */
export function resolveTheme(pref = getThemePreference()) {
  if (pref === 'dark' || pref === 'light') return pref
  return getSystemTheme()
}

/** 把主題套用到 document 上 */
export function applyTheme(pref = getThemePreference()) {
  if (typeof document === 'undefined') return
  const resolved = resolveTheme(pref)
  document.documentElement.setAttribute('data-theme', resolved)
  document.documentElement.style.colorScheme = resolved // 影響原生 scrollbar、表單元件
}

/** 寫入偏好並套用 */
export function setThemePreference(pref) {
  if (!VALID.includes(pref)) pref = 'system'
  if (typeof localStorage !== 'undefined') {
    if (pref === 'system') localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, pref)
  }
  applyTheme(pref)
}

/**
 * 在系統偏好變化時自動更新（只在使用者選 'system' 時才有作用）。
 * 回傳一個 cleanup 函式。
 */
export function watchSystemTheme() {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {}
  const mql = window.matchMedia('(prefers-color-scheme: dark)')
  const handler = () => {
    if (getThemePreference() === 'system') applyTheme('system')
  }
  // Safari 14+ 用 addEventListener；舊版用 addListener
  if (mql.addEventListener) mql.addEventListener('change', handler)
  else mql.addListener(handler)
  return () => {
    if (mql.removeEventListener) mql.removeEventListener('change', handler)
    else mql.removeListener(handler)
  }
}

/**
 * 在 app 啟動時呼叫（main.js）。
 * 立刻套用儲存的偏好並開始監聽系統變化。
 */
export function initTheme() {
  applyTheme()
  return watchSystemTheme()
}
