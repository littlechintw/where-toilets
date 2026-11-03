import { useI18n } from 'vue-i18n'
import { DEFAULT_LANG } from '../i18n/seo'

// 站內連結：依目前語言帶上網址前綴（中文不帶）。用法：<router-link :to="to('Map')">
export function useLocalizedTo() {
  const { locale } = useI18n()
  return (name) => ({
    name,
    params: { lang: locale.value === DEFAULT_LANG ? undefined : locale.value }
  })
}
