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
            <span class="big-chip-icon" aria-hidden="true">{{ opt.icon }}</span>
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
          <h2><span aria-hidden="true">💡</span> {{ $t('map.usageTips.title') }}</h2>
          <p>{{ $t('settings.usageTips.lede') }}</p>
        </div>
        <ul class="usage-tip-list">
          <li><span class="tip-icon" aria-hidden="true">📍</span> {{ $t('map.usageTips.tip1') }}</li>
          <li><span class="tip-icon" aria-hidden="true">🗺️</span> {{ $t('map.usageTips.tip2') }}</li>
          <li><span class="tip-icon" aria-hidden="true">📱</span> {{ $t('map.usageTips.tip3') }}</li>
          <li><span class="tip-icon" aria-hidden="true">🎯</span> {{ $t('map.usageTips.tip4') }}</li>
          <li><span class="tip-icon" aria-hidden="true">🔎</span> {{ $t('map.usageTips.tip5') }}</li>
          <li><span class="tip-icon" aria-hidden="true">🔍</span> {{ $t('map.usageTips.tip6') }}</li>
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
              <span aria-hidden="true">↗</span>
            </a>
          </li>
          <li>
            <a href="https://littlechin.tw" target="_blank" rel="noopener noreferrer">
              {{ $t('footer.author') }}：littlechin.tw
              <span aria-hidden="true">↗</span>
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
  { value: 'light', icon: '☀️', label: t('settings.theme.light'), hint: t('settings.theme.lightHint') },
  { value: 'dark', icon: '🌙', label: t('settings.theme.dark'), hint: t('settings.theme.darkHint') },
  { value: 'system', icon: '🖥️', label: t('settings.theme.system'), hint: t('settings.theme.systemHint') }
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
  background: var(--color-bg);
}

.settings-container {
  max-width: 720px;
  margin: 0 auto;
}

.settings-header {
  margin-bottom: 2rem;
  text-align: center;
}

.settings-title {
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-text);
  margin: 0 0 0.4rem;
}

.settings-lede {
  font-size: 1rem;
  color: var(--color-text-soft);
  margin: 0;
}

.setting-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.25rem;
  box-shadow: 0 1px 2px rgba(var(--color-shadow), 0.04);
}

.setting-card-head {
  margin-bottom: 1.25rem;
}

.setting-card-head h2 {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 0.25rem;
}

.setting-card-head p {
  font-size: 0.88rem;
  color: var(--color-text-soft);
  margin: 0;
  line-height: 1.5;
}

/* Chip row（與 Map.vue 篩選器一致） */
.chip-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.6rem;
}

.big-chip {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
  padding: 0.85rem 1rem;
  background: var(--color-surface);
  color: var(--color-text-muted);
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  font: inherit;
  transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease, transform 0.1s ease;
}

.big-chip:hover {
  background: var(--color-surface-2);
  border-color: var(--color-border-strong);
  color: var(--color-text);
}

.big-chip:active {
  transform: scale(0.99);
}

.big-chip-active,
.big-chip[aria-pressed="true"] {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
  color: var(--color-text);
  box-shadow: 0 0 0 1px var(--color-primary) inset;
}

.big-chip-active .big-chip-label,
.big-chip[aria-pressed="true"] .big-chip-label {
  color: var(--color-primary);
}

.big-chip-icon {
  font-size: 1.25rem;
  line-height: 1;
  margin-bottom: 0.15rem;
}

.big-chip-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text);
}

.big-chip-hint {
  font-size: 0.78rem;
  color: var(--color-text-soft);
}

/* 使用說明 */
.usage-tip-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.usage-tip-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  font-size: 0.92rem;
  color: var(--color-text-muted);
  line-height: 1.5;
  padding: 0.5rem 0.75rem;
  background: var(--color-surface-2);
  border-radius: 8px;
}

.tip-icon {
  flex-shrink: 0;
  font-size: 1.1rem;
  line-height: 1.4;
}

/* 關於 */
.about-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.about-links a {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--color-text);
  text-decoration: none;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.92rem;
  transition: background 0.18s ease;
}

.about-links a:hover {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

@media (max-width: 480px) {
  .settings-page {
    padding: 1.5rem 1rem 2.5rem;
  }
  .setting-card {
    padding: 1.25rem;
  }
}
</style>
