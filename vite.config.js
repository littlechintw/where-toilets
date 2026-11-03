import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import { SITE, LANGS, PAGES, localizedPath, seoFor } from './src/i18n/seo.js'

// GitHub Pages 沒有 rewrite 規則，/map、/en/map 這類深層路徑伺服器會回 404
// （靠 404.html 才畫得出來），對 SEO、AdSense 爬蟲與 health-check 都不好。
// 所以 build 完把 index.html 複製成「每個語言 × 每個頁面」的靜態 HTML
// （/map → map.html、/en/ → en/index.html、/en/map → en/map.html …，GitHub Pages 會自動對應），
// 並把 head 換成該語言的 title / description / canonical / hreflang / OG，
// 讓不執行 JS 的爬蟲與連結預覽也拿得到正確資料。內容本身仍由瀏覽器端渲染。
// 新增路由或語言時，改 src/i18n/seo.js（與 src/main.js 的 routes 對應）。

const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

function localizeHtml(html, lang, page) {
  const meta = LANGS.find((l) => l.code === lang)
  const { title, description } = seoFor(lang, page.key)
  const url = `${SITE}${localizedPath(lang, page.path)}`
  const alternates = [
    ...LANGS.map((l) => `  <link rel="alternate" hreflang="${l.htmlLang}" href="${SITE}${localizedPath(l.code, page.path)}" />`),
    `  <link rel="alternate" hreflang="x-default" href="${SITE}${page.path}" />`
  ].join('\n')

  const setContent = (out, attr, name, value) =>
    out.replace(new RegExp(`(<meta ${attr}="${name}" content=")[^"]*(")`), (_, a, b) => `${a}${esc(value)}${b}`)

  let out = html
    .replace(/<html lang="[^"]*"/, `<html lang="${meta.htmlLang}"`)
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
  out = setContent(out, 'name', 'description', description)
  out = setContent(out, 'property', 'og:title', title)
  out = setContent(out, 'property', 'og:description', description)
  out = setContent(out, 'property', 'og:url', url)
  out = setContent(out, 'property', 'og:locale', meta.og)
  out = setContent(out, 'name', 'twitter:title', title)
  out = setContent(out, 'name', 'twitter:description', description)
  // canonical + 原本寫死的 hreflang 區塊整段換掉
  out = out.replace(/<link rel="alternate" hreflang="[^"]*" href="[^"]*" \/>\s*/g, '')
  out = out.replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />\n${alternates}`)
  return out
}

function staticPages() {
  let root = process.cwd()
  let outDir = 'dist'
  return {
    name: 'static-pages',
    apply: 'build',
    configResolved(config) {
      root = config.root
      outDir = path.resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      const html = fs.readFileSync(path.join(outDir, 'index.html'), 'utf-8')

      for (const l of LANGS) {
        for (const page of PAGES) {
          const rel = localizedPath(l.code, page.path)
          // '/' → index.html、'/map' → map.html、'/en/' → en/index.html、'/en/map' → en/map.html
          const file = path.join(outDir, rel.endsWith('/') ? `${rel}index.html` : `${rel}.html`)
          fs.mkdirSync(path.dirname(file), { recursive: true })
          fs.writeFileSync(file, localizeHtml(html, l.code, page))
        }
      }
      fs.writeFileSync(path.join(outDir, '404.html'), html)

      // sitemap：lastmod 取自 public/data/index.json 的 last_updated（資料每週更新、deploy 會重新 build）
      let lastmod = ''
      try {
        const data = JSON.parse(fs.readFileSync(path.join(root, 'public/data/index.json'), 'utf-8'))
        const d = new Date(data.last_updated)
        if (!Number.isNaN(d.getTime())) lastmod = d.toISOString().slice(0, 10)
      } catch { /* 沒有資料檔就不寫 lastmod */ }

      const urls = []
      for (const page of PAGES) {
        const alt = [
          ...LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l.htmlLang}" href="${SITE}${localizedPath(l.code, page.path)}" />`),
          `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${page.path}" />`
        ].join('\n')
        for (const l of LANGS) {
          const lines = [`    <loc>${SITE}${localizedPath(l.code, page.path)}</loc>`]
          if (page.dataDriven && lastmod) lines.push(`    <lastmod>${lastmod}</lastmod>`)
          lines.push(`    <changefreq>${page.changefreq}</changefreq>`, `    <priority>${page.priority}</priority>`, alt)
          urls.push(`  <url>\n${lines.join('\n')}\n  </url>`)
        }
      }
      fs.writeFileSync(
        path.join(outDir, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`
      )
    }
  }
}

export default defineConfig({
  plugins: [vue(), staticPages()],
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
