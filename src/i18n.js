import { createI18n } from 'vue-i18n'
import en from './locales/en.js'
import zhCN from './locales/zh-CN.js'
import ja from './locales/ja.js'
import ko from './locales/ko.js'
import th from './locales/th.js'
import es from './locales/es.js'
import fr from './locales/fr.js'
import vi from './locales/vi.js'

// Language display names and flags
export const LANGUAGES = [
  { code: 'zh-CN', label: '中文', flag: '🇨🇳' },
  { code: 'en',    label: 'English', flag: '🇺🇸' },
  { code: 'ja',    label: '日本語', flag: '🇯🇵' },
  { code: 'ko',    label: '한국어', flag: '🇰🇷' },
  { code: 'th',    label: 'ไทย', flag: '🇹🇭' },
  { code: 'es',    label: 'Español', flag: '🇪🇸' },
  { code: 'fr',    label: 'Français', flag: '🇫🇷' },
  { code: 'vi',    label: 'Tiếng Việt', flag: '🇻🇳' },
]

// Detect browser language and find best match
function detectLocale() {
  const saved = localStorage.getItem('mao_lang')
  if (saved) return saved
  const browserLang = navigator.language || 'en'
  if (browserLang.startsWith('zh')) return 'zh-CN'
  if (browserLang.startsWith('ja')) return 'ja'
  if (browserLang.startsWith('ko')) return 'ko'
  if (browserLang.startsWith('th')) return 'th'
  if (browserLang.startsWith('es')) return 'es'
  if (browserLang.startsWith('fr')) return 'fr'
  if (browserLang.startsWith('vi')) return 'vi'
  return 'en'
}

const i18n = createI18n({
  legacy: false,
  locale: detectLocale(),
  fallbackLocale: 'en',
  messages: { en, 'zh-CN': zhCN, ja, ko, th, es, fr, vi },
})

export function setLocale(lang) {
  i18n.global.locale.value = lang
  localStorage.setItem('mao_lang', lang)
  document.documentElement.lang = lang
}

export default i18n
