import en from './locales/en.json'
import ar from './locales/ar.json'

type LocaleKey = keyof typeof en

const locales: Record<string, typeof en> = { en, ar }
let current: 'en' | 'ar' = 'en'

export function setLocale(lang: 'en' | 'ar') {
  current = lang
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n') as LocaleKey
    if (key && locales[lang][key]) el.textContent = locales[lang][key]
  })
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder') as LocaleKey
    if (key && locales[lang][key]) (el as HTMLInputElement).placeholder = locales[lang][key]
  })
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html') as LocaleKey
    if (key && locales[lang][key]) el.innerHTML = locales[lang][key]
  })
  localStorage.setItem('locale', lang)
}

export function t(key: LocaleKey): string {
  return locales[current][key] ?? key
}

export function initI18n() {
  const saved = localStorage.getItem('locale') as 'en' | 'ar' | null
  const browser = navigator.language.startsWith('ar') ? 'ar' : 'en'
  setLocale(saved ?? browser)
}

export { locales }
export type { LocaleKey }
