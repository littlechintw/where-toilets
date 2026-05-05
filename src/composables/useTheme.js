import { ref, computed, onMounted } from 'vue'
import {
  getThemePreference,
  resolveTheme,
  setThemePreference as persist
} from '../utils/theme'
import { trackEvent } from '../utils/analytics'

/**
 * 響應式主題 composable。
 *   const { preference, resolved, set } = useTheme()
 *   set('dark')
 */
export function useTheme() {
  const preference = ref(getThemePreference())
  const resolved = computed(() => resolveTheme(preference.value))

  const set = (next) => {
    preference.value = next
    persist(next)
    trackEvent('theme_change', { preference: next, resolved: resolveTheme(next) })
  }

  // 從別處（例如同分頁多視窗）改了 localStorage 也跟著更新
  onMounted(() => {
    if (typeof window === 'undefined') return
    const onStorage = (e) => {
      if (e.key === 'theme') preference.value = getThemePreference()
    }
    window.addEventListener('storage', onStorage)
  })

  return { preference, resolved, set }
}
