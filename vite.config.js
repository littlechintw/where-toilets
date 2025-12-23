import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
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
