/**
 * 產生自家託管的 Material Symbols 子集字型。
 *
 * 整套 Material Symbols 可變字型有 3.9MB，但本站只用到四十幾個圖示。
 * 這個腳本會：
 *   1. 掃描 src/ 裡所有 .vue 檔，找出用到的圖示名稱
 *   2. 用 Google Fonts 的 icon_names 子集 API 取得只含這些圖示的 woff2（約 6KB）
 *   3. 存到 public/fonts/material-symbols-outlined.woff2
 *   4. 把名稱清單寫到 src/assets/material-symbols-icons.json（開發模式用來檢查有沒有漏掉的圖示）
 *
 * index.html 用 @font-face 直接載入這個檔案並 preload，不再向 fonts.googleapis.com 要 CSS，
 * 少一個 render-blocking 的跨網域請求。
 *
 * 新增或改用圖示後執行：npm run icons
 * （掃描是用正規表示式抓常見寫法；如果圖示名稱是用比較特別的方式組出來的，
 *   請加到下面的 EXTRA_ICONS，開發模式 console 也會警告沒列到的圖示。）
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(ROOT, 'src')
const FONT_OUT = path.join(ROOT, 'public', 'fonts', 'material-symbols-outlined.woff2')
const LIST_OUT = path.join(ROOT, 'src', 'assets', 'material-symbols-icons.json')

/** 掃描抓不到、但確定有用到的圖示可以加在這裡 */
const EXTRA_ICONS = []

// Google Fonts 要看到 Chrome 的 UA 才會回 woff2（否則給 ttf）
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (entry.name.endsWith('.vue')) out.push(full) // 只掃 .vue：.js 裡的 return 'ja' 這類字串不是圖示
  }
  return out
}

function collectIcons() {
  const names = new Set(EXTRA_ICONS)
  for (const file of walk(SRC)) {
    const s = fs.readFileSync(file, 'utf8')
    // <span class="material-symbols-outlined ...">name</span>
    for (const m of s.matchAll(/material-symbols-outlined[^>]*>\s*([a-z_]+)\s*</g)) names.add(m[1])
    // <span class="material-symbols-outlined">{{ cond ? 'a' : 'b' }}</span>
    for (const m of s.matchAll(/material-symbols-outlined[^>]*>\s*\{\{([^}]+)\}\}/g)) {
      for (const w of m[1].matchAll(/'([a-z_]+)'/g)) names.add(w[1])
    }
    // 在 script 裡回傳 / 指定圖示名稱的常見寫法：return 'x'、icon: 'x'、key: 'x'（ICONS 對照表）
    for (const m of s.matchAll(/return '([a-z_]+)'/g)) names.add(m[1])
    for (const m of s.matchAll(/\bicon: '([a-z_]+)'/g)) names.add(m[1])
    if (/const ICONS = \{/.test(s)) {
      const block = s.slice(s.indexOf('const ICONS = {'), s.indexOf('}', s.indexOf('const ICONS = {')))
      for (const m of block.matchAll(/:\s*'([a-z_]+)'/g)) names.add(m[1])
    }
  }
  // 排除明顯不是圖示的字（Map.vue 裡 return 'mixed' 這種類型 key）
  const NOT_ICONS = new Set(['mixed', 'male', 'female', 'family', 'excellent', 'good', 'fair', 'fail', 'needs_improvement'])
  return [...names].filter(n => !NOT_ICONS.has(n)).sort()
}

async function main() {
  const icons = collectIcons()
  if (icons.length === 0) throw new Error('沒有找到任何圖示名稱')
  console.log(`找到 ${icons.length} 個圖示：${icons.join(', ')}`)

  const cssUrl = `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined&icon_names=${icons.join(',')}&display=block`
  const css = await (await fetch(cssUrl, { headers: { 'User-Agent': UA } })).text()
  const fontUrl = css.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)\s*format\('woff2'\)/)?.[1]
  if (!fontUrl) throw new Error('在 Google Fonts 回應裡找不到 woff2 網址：\n' + css.slice(0, 500))

  const font = Buffer.from(await (await fetch(fontUrl, { headers: { 'User-Agent': UA } })).arrayBuffer())
  fs.mkdirSync(path.dirname(FONT_OUT), { recursive: true })
  fs.writeFileSync(FONT_OUT, font)
  fs.mkdirSync(path.dirname(LIST_OUT), { recursive: true })
  fs.writeFileSync(LIST_OUT, JSON.stringify(icons, null, 2) + '\n')
  console.log(`已寫入 ${path.relative(ROOT, FONT_OUT)}（${(font.length / 1024).toFixed(1)}KB）與 ${path.relative(ROOT, LIST_OUT)}`)
}

main().catch(err => { console.error(err); process.exit(1) })
