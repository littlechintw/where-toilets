import { createI18n } from 'vue-i18n'
import zh from './locales/zh'
import en from './locales/en'
import ja from './locales/ja'
import ko from './locales/ko'
import vi from './locales/vi'
import id from './locales/id'
import th from './locales/th'
import fil from './locales/fil'

const messages = { zh, en, ja, ko, vi, id, th, fil }

// 啟動時讀取使用者上次選的語言（App.vue 也會讀，但這裡更早，避免閃動）
function getInitialLocale() {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('locale')
    if (saved && messages[saved]) return saved
  }
  // 自動偵測瀏覽器語言
  if (typeof navigator !== 'undefined' && navigator.language) {
    const code = navigator.language.toLowerCase()
    if (code.startsWith('zh')) return 'zh'
    if (code.startsWith('ja')) return 'ja'
    if (code.startsWith('ko')) return 'ko'
    if (code.startsWith('vi')) return 'vi'
    if (code.startsWith('id') || code.startsWith('ms')) return 'id'
    if (code.startsWith('th')) return 'th'
    if (code.startsWith('fil') || code.startsWith('tl')) return 'fil'
    if (code.startsWith('en')) return 'en'
  }
  return 'zh'
}

export default createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'en',
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
