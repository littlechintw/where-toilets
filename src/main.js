import { createApp, nextTick } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import i18n from './i18n'
import App from './App.vue'
import Home from './views/Home.vue'
import Map from './views/Map.vue'
import { trackPageView } from './utils/analytics'

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
      component: Map,
      meta: { title: '廁所地圖｜地圖檢視 - 附近的公共廁所' }
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