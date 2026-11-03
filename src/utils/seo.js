// 依目前路由與語言更新 <head>（title、description、canonical、hreflang、OG）。
// build 時 vite.config.js 已經為每個語言與頁面產生同樣內容的靜態 HTML，
// 這裡負責在 SPA 內切換路由／語言時保持一致。
import { SITE, LANGS, DEFAULT_LANG, PAGES, localizedPath, seoFor } from '../i18n/seo'

function setMeta(selector, attr, value) {
  const el = document.head.querySelector(selector)
  if (el) el.setAttribute(attr, value)
}

export function applySeo(route) {
  if (typeof document === 'undefined') return
  const lang = route.params?.lang || DEFAULT_LANG
  const page = PAGES.find(p => p.key === route.name)
  if (!page) return
  const meta = LANGS.find(l => l.code === lang) || LANGS[0]
  const { title, description } = seoFor(lang, page.key)
  const url = `${SITE}${localizedPath(lang, page.path)}`

  document.title = title
  document.documentElement.lang = meta.htmlLang
  setMeta('meta[name="description"]', 'content', description)
  setMeta('meta[property="og:title"]', 'content', title)
  setMeta('meta[property="og:description"]', 'content', description)
  setMeta('meta[property="og:url"]', 'content', url)
  setMeta('meta[property="og:locale"]', 'content', meta.og)
  setMeta('meta[name="twitter:title"]', 'content', title)
  setMeta('meta[name="twitter:description"]', 'content', description)

  let canonical = document.head.querySelector('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.rel = 'canonical'
    document.head.appendChild(canonical)
  }
  canonical.href = url

  document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove())
  const add = (hreflang, href) => {
    const el = document.createElement('link')
    el.rel = 'alternate'
    el.hreflang = hreflang
    el.href = href
    document.head.appendChild(el)
  }
  for (const l of LANGS) add(l.htmlLang, `${SITE}${localizedPath(l.code, page.path)}`)
  add('x-default', `${SITE}${page.path}`)
}
