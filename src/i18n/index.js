import { createI18n } from 'vue-i18n'
import zh from './locales/zh'
import en from './locales/en'
import ja from './locales/ja'
import ko from './locales/ko'
import vi from './locales/vi'
import id from './locales/id'
import th from './locales/th'
import fil from './locales/fil'

import { PREFIXED_LANGS, DEFAULT_LANG } from './seo'

const messages = { zh, en, ja, ko, vi, id, th, fil }

// 初始語言：網址路徑前綴（/en/map）最優先；沒有前綴（= 中文網址）時，
// 若使用者之前主動選過其他語言就先用那個，router 的 beforeEach 會接著導向對應的 /xx/ 網址。
// 刻意不依瀏覽器語言自動判斷：搜尋引擎爬蟲的語言設定不可靠，會讓 / 的內容不穩定。
function getInitialLocale() {
  if (typeof window !== 'undefined') {
    const first = window.location.pathname.split('/')[1]
    if (PREFIXED_LANGS.includes(first)) return first
    // 舊版網址 /?lang=xx：router 會導向 /xx/，這裡先用對的語言避免閃一下中文
    const q = new URLSearchParams(window.location.search).get('lang')
    const code = q ? q.toLowerCase().split('-')[0] : ''
    if (code && messages[code]) return code
  }
  if (typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem('locale')
      if (saved && messages[saved]) return saved
    } catch (_) { /* 隱私模式讀不到就算了 */ }
  }
  return DEFAULT_LANG
}

export default createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'en',
  // 隱私權政策只有 zh / en，其他語言 fallback 到英文，不要在 console 刷警告
  fallbackWarn: false,
  missingWarn: false,
  messages
})

/** 提供語言代碼對應的顯示名稱與旗幟，給 Settings 用 */
export const SUPPORTED_LOCALES = [
  { code: 'zh', label: '繁體中文', hint: 'Traditional Chinese', icon: '🇹🇼', htmlLang: 'zh-TW' },
  { code: 'en', label: 'English', hint: 'English', icon: '🌐', htmlLang: 'en' },
  { code: 'ja', label: '日本語', hint: 'Japanese', icon: '🇯🇵', htmlLang: 'ja' },
  { code: 'ko', label: '한국어', hint: 'Korean', icon: '🇰🇷', htmlLang: 'ko' },
  { code: 'vi', label: 'Tiếng Việt', hint: 'Vietnamese', icon: '🇻🇳', htmlLang: 'vi' },
  { code: 'id', label: 'Bahasa Indonesia', hint: 'Indonesian', icon: '🇮🇩', htmlLang: 'id' },
  { code: 'th', label: 'ภาษาไทย', hint: 'Thai', icon: '🇹🇭', htmlLang: 'th' },
  { code: 'fil', label: 'Filipino', hint: 'Filipino / Tagalog', icon: '🇵🇭', htmlLang: 'fil' }
]
