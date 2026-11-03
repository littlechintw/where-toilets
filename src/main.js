import { createApp, nextTick } from 'vue'
import { createRouter, createWebHistory, START_LOCATION } from 'vue-router'
import i18n from './i18n'
import App from './App.vue'
import Home from './views/Home.vue'

// 其他頁面延後載入：首頁不需要 Leaflet（44KB gzip）與地圖頁程式碼，
// 拆成獨立 chunk，進到那一頁才下載
const MapView = () => import('./views/Map.vue')
const Settings = () => import('./views/Settings.vue')
const Privacy = () => import('./views/Privacy.vue')
import { trackPageView } from './utils/analytics'
import { applySeo } from './utils/seo'
import { PREFIXED_LANGS, DEFAULT_LANG } from './i18n/seo'
import { initTheme } from './utils/theme'
import ICON_NAMES from './assets/material-symbols-icons.json'

// 啟動時就套用主題，避免閃白
initTheme()

// 路由設定：中文不帶前綴（/、/map），其他語言用 /en/、/en/map…（語言清單在 src/i18n/seo.js）
const LANG_PARAM = `:lang(${PREFIXED_LANGS.join('|')})?`
const route = (name, path, component) => ({ name, path: `/${LANG_PARAM}${path}`, component })

const router = createRouter({
  history: createWebHistory('/'), // 自訂網域使用根路徑
  routes: [
    route('Home', '/', Home),
    route('Map', '/map', MapView),
    route('Settings', '/settings', Settings),
    route('Privacy', '/privacy', Privacy)
  ]
})

router.beforeEach((to, from) => {
  // 舊版網址 ?lang=xx → 導到 /xx/ 路徑式網址（並拿掉參數）
  const rawLang = Array.isArray(to.query.lang) ? to.query.lang[0] : to.query.lang
  if (rawLang !== undefined) {
    const code = String(rawLang).toLowerCase().split('-')[0]
    const { lang: _drop, ...query } = to.query
    const lang = PREFIXED_LANGS.includes(code) ? code : undefined
    return { name: to.name, params: { ...to.params, lang }, query, hash: to.hash, replace: true }
  }

  // 第一次進站、網址是中文（無前綴），但使用者之前主動選過其他語言 → 導到該語言
  if (from === START_LOCATION && !to.params.lang) {
    let saved = null
    try { saved = localStorage.getItem('locale') } catch (_) { /* noop */ }
    if (PREFIXED_LANGS.includes(saved)) {
      return { name: to.name, params: { ...to.params, lang: saved }, query: to.query, hash: to.hash, replace: true }
    }
  }

  i18n.global.locale.value = to.params.lang || DEFAULT_LANG
})

// 路由切換時更新 <head> 並送出 GA page_view
router.afterEach((to) => {
  applySeo(to)
  // 等到 DOM 與 title 更新完再送
  nextTick(() => {
    trackPageView(to.fullPath, document.title)
  })
})

const app = createApp(App)
app.use(router)
app.use(i18n)
app.mount('#app')

// 開發模式：檢查畫面上的 Material Symbols 是否都在自家託管的子集字型裡，
// 漏掉的圖示在正式環境會顯示成文字（修法：npm run icons 重新產生子集）
if (import.meta.env.DEV) {
  const allowed = new Set(ICON_NAMES)
  const checkIcons = () => {
    const used = [...document.querySelectorAll('.material-symbols-outlined')].map(el => el.textContent.trim()).filter(Boolean)
    const missing = [...new Set(used.filter(name => !allowed.has(name)))]
    if (missing.length) console.warn('[icons] 這些圖示不在子集字型裡，會顯示成文字，請執行 npm run icons：', missing.join(', '))
  }
  router.afterEach(() => setTimeout(checkIcons, 2000))
}