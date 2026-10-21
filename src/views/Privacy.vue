<template>
  <div class="privacy-page">
    <div class="privacy-container">
      <header class="privacy-header">
        <h1 class="privacy-title">{{ $t('privacy.title') }}</h1>
        <p class="privacy-updated">{{ $t('privacy.updated') }}</p>
        <p class="privacy-intro">{{ $t('privacy.intro') }}</p>
      </header>

      <section v-for="key in SECTIONS" :key="key" class="privacy-card">
        <h2 class="privacy-card-title">
          <span class="material-symbols-outlined privacy-icon" aria-hidden="true">{{ ICONS[key] }}</span>
          {{ $t(`privacy.sections.${key}.title`) }}
        </h2>
        <p class="privacy-card-body">{{ $t(`privacy.sections.${key}.body`) }}</p>
      </section>

      <p class="privacy-links">
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
          Google
          <span class="material-symbols-outlined link-icon" aria-hidden="true">open_in_new</span>
        </a>
        <span class="privacy-sep" aria-hidden="true">·</span>
        <a href="https://osmfoundation.org/wiki/Privacy_Policy" target="_blank" rel="noopener noreferrer">
          OpenStreetMap
          <span class="material-symbols-outlined link-icon" aria-hidden="true">open_in_new</span>
        </a>
        <span class="privacy-sep" aria-hidden="true">·</span>
        <a href="https://data.gov.tw/dataset/30794" target="_blank" rel="noopener noreferrer">
          {{ $t('footer.epa') }}
          <span class="material-symbols-outlined link-icon" aria-hidden="true">open_in_new</span>
        </a>
      </p>
    </div>
  </div>
</template>

<script setup>
/**
 * 隱私權政策（AdSense 計畫政策要求網站必須有一頁）。
 * 內容在 src/i18n/locales/{zh,en}/privacy.js；其他語言會 fallback 到英文。
 */
const SECTIONS = ['location', 'search', 'analytics', 'ads', 'storage', 'data', 'contact']

const ICONS = {
  location: 'my_location',
  search: 'map',
  analytics: 'monitoring',
  ads: 'campaign',
  storage: 'save',
  data: 'dataset',
  contact: 'mail'
}
</script>

<style scoped>
.privacy-page {
  min-height: calc(100vh - var(--nav-h) - var(--footer-h));
  padding: 2.5rem 1.5rem 3rem;
  background: var(--md-sys-color-background);
  transition: background-color var(--transition);
}

.privacy-container {
  max-width: 720px;
  margin: 0 auto;
}

.privacy-header {
  margin-bottom: 2rem;
}

.privacy-title {
  margin: 0 0 0.35rem;
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--md-sys-color-on-surface);
}

.privacy-updated {
  margin: 0 0 1rem;
  font-size: 0.82rem;
  color: var(--md-sys-color-outline);
}

.privacy-intro {
  margin: 0;
  font-size: 1rem;
  line-height: 1.7;
  color: var(--md-sys-color-on-surface-variant);
}

.privacy-card {
  padding: 1.25rem 1.5rem;
  margin-bottom: 0.9rem;
  background: var(--md-sys-color-surface-container-low);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--radius-lg);
  transition: background-color var(--transition), border-color var(--transition);
}

.privacy-card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.5rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--md-sys-color-on-surface);
}

.privacy-icon {
  font-size: 20px;
  color: var(--md-sys-color-primary);
}

.privacy-card-body {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.7;
  color: var(--md-sys-color-on-surface-variant);
}

.privacy-links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 1.75rem 0 0;
  font-size: 0.85rem;
}

.privacy-links a {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--md-sys-color-primary);
  text-decoration: none;
  font-weight: 500;
}

.privacy-links a:hover {
  text-decoration: underline;
}

.link-icon {
  font-size: 14px;
  opacity: 0.8;
}

.privacy-sep {
  color: var(--md-sys-color-outline-variant);
}

@media (max-width: 480px) {
  .privacy-page {
    padding: 1.5rem 1rem 2.5rem;
  }

  .privacy-card {
    padding: 1rem 1.15rem;
  }
}
</style>
