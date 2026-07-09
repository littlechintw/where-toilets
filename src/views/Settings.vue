<template>
  <div class="settings-page">
    <div class="settings-container">
      <header class="settings-header">
        <h1 class="settings-title">{{ $t('settings.title') }}</h1>
        <p class="settings-lede">{{ $t('settings.lede') }}</p>
      </header>

      <!-- 主題 -->
      <section class="setting-card">
        <div class="setting-card-head">
          <h2>{{ $t('settings.theme.title') }}</h2>
          <p>{{ $t('settings.theme.description') }}</p>
        </div>
        <div class="chip-row" role="group" :aria-label="$t('settings.theme.title')">
          <button
            v-for="opt in themeOptions"
            :key="opt.value"
            type="button"
            class="big-chip"
            :class="{ 'big-chip-active': preference === opt.value }"
            :aria-pressed="(preference === opt.value).toString()"
            @click="setTheme(opt.value)"
          >
            <span class="material-symbols-outlined big-chip-icon" aria-hidden="true">{{ opt.icon }}</span>
            <span class="big-chip-label">{{ opt.label }}</span>
            <span class="big-chip-hint">{{ opt.hint }}</span>
          </button>
        </div>
      </section>

      <!-- 語言 -->
      <section class="setting-card">
        <div class="setting-card-head">
          <h2>{{ $t('settings.language.title') }}</h2>
          <p>{{ $t('settings.language.description') }}</p>
        </div>
        <div class="chip-row" role="group" :aria-label="$t('settings.language.title')">
          <button
            v-for="opt in languageOptions"
            :key="opt.value"
            type="button"
            class="big-chip"
            :class="{ 'big-chip-active': locale === opt.value }"
            :aria-pressed="(locale === opt.value).toString()"
            @click="setLanguage(opt.value)"
          >
            <span class="big-chip-icon" aria-hidden="true">{{ opt.icon }}</span>
            <span class="big-chip-label">{{ opt.label }}</span>
            <span class="big-chip-hint">{{ opt.hint }}</span>
          </button>
        </div>
      </section>

      <!-- 使用說明 -->
      <section class="setting-card">
        <div class="setting-card-head">
          <h2 class="tips-heading">
            <span class="material-symbols-outlined title-icon" aria-hidden="true">lightbulb</span>
            {{ $t('map.usageTips.title') }}
          </h2>
          <p>{{ $t('settings.usageTips.lede') }}</p>
        </div>
        <ul class="usage-tip-list">
          <li>
            <span class="material-symbols-outlined tip-icon" aria-hidden="true">my_location</span>
            {{ $t('map.usageTips.tip1') }}
          </li>
          <li>
            <span class="material-symbols-outlined tip-icon" aria-hidden="true">map</span>
            {{ $t('map.usageTips.tip2') }}
          </li>
          <li>
            <span class="material-symbols-outlined tip-icon" aria-hidden="true">smartphone</span>
            {{ $t('map.usageTips.tip3') }}
          </li>
          <li>
            <span class="material-symbols-outlined tip-icon" aria-hidden="true">center_focus_strong</span>
            {{ $t('map.usageTips.tip4') }}
          </li>
          <li>
            <span class="material-symbols-outlined tip-icon" aria-hidden="true">search</span>
            {{ $t('map.usageTips.tip5') }}
          </li>
          <li>
            <span class="material-symbols-outlined tip-icon" aria-hidden="true">pageview</span>
            {{ $t('map.usageTips.tip6') }}
          </li>
        </ul>
      </section>

      <!-- 關於 -->
      <section class="setting-card">
        <div class="setting-card-head">
          <h2>{{ $t('settings.about.title') }}</h2>
          <p>{{ $t('settings.about.description') }}</p>
        </div>
        <ul class="about-links">
          <li>
            <a href="https://data.gov.tw/dataset/30794" target="_blank" rel="noopener noreferrer">
              {{ $t('footer.dataSource') }}：{{ $t('footer.epa') }}
              <span class="material-symbols-outlined link-icon" aria-hidden="true">open_in_new</span>
            </a>
          </li>
          <li>
            <a href="https://littlechin.tw" target="_blank" rel="noopener noreferrer">
              {{ $t('footer.author') }}：littlechin.tw
              <span class="material-symbols-outlined link-icon" aria-hidden="true">open_in_new</span>
            </a>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '../composables/useTheme'
import { trackEvent } from '../utils/analytics'
import { SUPPORTED_LOCALES } from '../i18n'

const { locale, t } = useI18n()
const { preference, set: setThemeRaw } = useTheme()

const setTheme = (val) => setThemeRaw(val)

const setLanguage = (val) => {
  const from = locale.value
  if (from === val) return
  locale.value = val
  trackEvent('language_toggle', { from, to: val, source: 'settings' })
}

const themeOptions = computed(() => [
  { value: 'light', icon: 'light_mode', label: t('settings.theme.light'), hint: t('settings.theme.lightHint') },
  { value: 'dark', icon: 'dark_mode', label: t('settings.theme.dark'), hint: t('settings.theme.darkHint') },
  { value: 'system', icon: 'desktop_windows', label: t('settings.theme.system'), hint: t('settings.theme.systemHint') }
])

const languageOptions = computed(() =>
  SUPPORTED_LOCALES.map(l => ({
    value: l.code,
    icon: l.icon,
    label: l.label,
    hint: l.hint
  }))
)
</script>

<style scoped>
.settings-page {
  min-height: calc(100vh - var(--nav-h) - var(--footer-h));
  padding: 2.5rem 1.5rem 3rem;
  background: var(--md-sys-color-background);
  transition: background-color var(--transition);
}

.settings-container {
  max-width: 720px;
  margin: 0 auto;
}

.settings-header {
  margin-bottom: 2.5rem;
  text-align: center;
}

.settings-title {
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--md-sys-color-on-surface);
  margin: 0 0 0.5rem;
}

.settings-lede {
  font-size: 1rem;
  color: var(--md-sys-color-on-surface-variant);
  margin: 0;
}

/* M3 Outlined Card */
.setting-card {
  background: var(--md-sys-color-surface-container-low);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--radius-lg);
  padding: 1.75rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-sm);
  transition: background-color var(--transition), border-color var(--transition);
}

.setting-card-head {
  margin-bottom: 1.5rem;
}

.setting-card-head h2 {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--md-sys-color-on-surface);
  margin: 0 0 0.4rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tips-heading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.title-icon {
  color: var(--md-sys-color-primary);
  font-size: 24px;
}

.setting-card-head p {
  font-size: 0.9rem;
  color: var(--md-sys-color-on-surface-variant);
  margin: 0;
  line-height: 1.5;
}

/* Chip row (M3 Layout) */
.chip-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
}

/* M3 Filter / Choice Chip */
.big-chip {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  padding: 1rem 1.25rem;
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface-variant);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--radius-md);
  cursor: pointer;
  text-align: left;
  font: inherit;
  transition: all var(--transition);
}

.big-chip:hover {
  background: var(--md-sys-color-surface-container-high);
  border-color: var(--md-sys-color-outline);
  color: var(--md-sys-color-on-surface);
}

.big-chip:active {
  transform: scale(0.98);
}

/* Active State matches M3 Selection */
.big-chip-active,
.big-chip[aria-pressed="true"] {
  background: var(--md-sys-color-primary-container);
  border-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary-container);
  box-shadow: 0 0 0 1px var(--md-sys-color-primary) inset;
}

.big-chip-active .big-chip-label,
.big-chip[aria-pressed="true"] .big-chip-label {
  color: var(--md-sys-color-primary);
}

.big-chip-icon {
  font-size: 22px;
  line-height: 1;
  margin-bottom: 0.2rem;
  color: var(--md-sys-color-primary);
}

.big-chip-active .big-chip-icon,
.big-chip[aria-pressed="true"] .big-chip-icon {
  color: var(--md-sys-color-primary);
}

.big-chip-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.big-chip-hint {
  font-size: 0.8rem;
  color: var(--md-sys-color-on-surface-variant);
  opacity: 0.85;
}

/* Usage Tips - M3 Styled Lists */
.usage-tip-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.usage-tip-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.92rem;
  color: var(--md-sys-color-on-surface-variant);
  line-height: 1.5;
  padding: 0.75rem 1rem;
  background: var(--md-sys-color-surface);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--radius-sm);
  transition: background-color var(--transition), border-color var(--transition);
}

.tip-icon {
  flex-shrink: 0;
  font-size: 20px;
  color: var(--md-sys-color-primary);
}

/* About Links - M3 Rounded buttons lists */
.about-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.about-links a {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--md-sys-color-on-surface);
  text-decoration: none;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  font-weight: 500;
  border: 1px solid var(--md-sys-color-outline-variant);
  background: var(--md-sys-color-surface);
  transition: all var(--transition);
}

.about-links a:hover {
  background: var(--md-sys-color-primary-container);
  border-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary-container);
}

.link-icon {
  font-size: 16px;
  opacity: 0.8;
}

@media (max-width: 480px) {
  .settings-page {
    padding: 1.5rem 1rem 2.5rem;
  }
  .setting-card {
    padding: 1.25rem;
  }
  .chip-row {
    grid-template-columns: 1fr;
  }
}
</style>
