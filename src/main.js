import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import i18n from './i18n'
import App from './App.vue'
import Home from './views/Home.vue'
import Map from './views/Map.vue'

// 路由設定
const router = createRouter({
  history: createWebHistory('/'), // 自訂網域使用根路徑
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/map',
      name: 'Map',
      component: Map
    }
  ]
})

const app = createApp(App)
app.use(router)
app.use(i18n)
app.mount('#app')