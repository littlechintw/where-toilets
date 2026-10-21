import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// GitHub Pages 沒有 rewrite 規則，/map、/settings 這類深層路徑伺服器會回 404
// （靠 404.html 才畫得出來），對 SEO、AdSense 爬蟲與 health-check 都不好。
// GitHub Pages 會把 /map 對應到 map.html，所以 build 完把 index.html 複製成各路由的 .html，
// 深層路徑就會正常回 200。新增路由時記得同步這個清單（與 src/main.js 的 routes 對應）。
const SPA_ROUTES = ['map', 'settings', 'privacy']

function spaRouteCopies() {
  let outDir = 'dist'
  return {
    name: 'spa-route-copies',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      const html = fs.readFileSync(path.join(outDir, 'index.html'))
      for (const route of [...SPA_ROUTES, '404']) {
        fs.writeFileSync(path.join(outDir, `${route}.html`), html)
      }
    }
  }
}

export default defineConfig({
  plugins: [vue(), spaRouteCopies()],
  base: '/', // 自訂網域使用根路徑
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'vue-i18n'],
          'leaflet': ['leaflet']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 3001,
    open: true
  }
})
