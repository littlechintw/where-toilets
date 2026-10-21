import { createApp, nextTick } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import i18n from './i18n'
import App from './App.vue'
import Home from './views/Home.vue'

// 其他頁面延後載入：首頁不需要 Leaflet（44KB gzip）與地圖頁程式碼，
// 拆成獨立 chunk，進到那一頁才下載
const MapView = () => import('./views/Map.vue')
const Settings = () => import('./views/Settings.vue')
const Privacy = () => import('./views/Privacy.vue')
import { trackPageView } from './utils/analytics'
import { initTheme } from './utils/theme'
import ICON_NAMES from './assets/material-symbols-icons.json'

// 啟動時就套用主題，避免閃白
initTheme()

// 路由設定
const router = createRouter({
  history: createWebHistory('/'), // 自訂網域使用根路徑
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: { title: '廁所地圖｜快速找到附近的公共廁所（臺灣全島）' }
    },
    {
      path: '/map',
      name: 'Map',
      component: MapView,
      meta: { title: '廁所地圖｜地圖檢視 - 附近的公共廁所' }
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings,
      meta: { title: '廁所地圖｜設定' }
    },
    {
      path: '/privacy',
      name: 'Privacy',
      component: Privacy,
      meta: { title: '廁所地圖｜隱私權政策' }
    }
  ]
})

// 路由切換時更新標題並送出 GA page_view
router.afterEach((to) => {
  if (to.meta?.title && typeof document !== 'undefined') {
    document.title = to.meta.title
  }
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