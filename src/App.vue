<template>
  <div id="app">
    <a href="#main-content" class="skip-link">{{ $t('a11y.skipToContent') }}</a>

    <nav class="navbar" role="navigation" :aria-label="$t('nav.home')">
      <div class="nav-container">
        <router-link to="/" class="nav-logo" :aria-label="$t('home.title')">
          <span class="nav-logo-mark" aria-hidden="true">🚽</span>
          <span class="nav-logo-text">{{ $t('home.title') }}</span>
        </router-link>
        <div class="nav-menu">
          <router-link to="/" class="nav-link">{{ $t('nav.home') }}</router-link>
          <router-link to="/map" class="nav-link">{{ $t('nav.map') }}</router-link>
          <router-link
            to="/settings"
            class="nav-icon-link"
            :aria-label="$t('nav.settings')"
            :title="$t('nav.settings')"
          >
            <span class="material-symbols-outlined" aria-hidden="true">settings</span>
          </router-link>
        </div>
      </div>
    </nav>

    <main id="main-content" class="main-content" tabindex="-1">
      <router-view />
    </main>

    <footer class="footer" role="contentinfo">
      <p>
        <span class="footer-label">{{ $t('footer.dataSource') }}</span>
        <a href="https://data.gov.tw/dataset/30794" target="_blank" rel="noopener noreferrer">{{ $t('footer.epa') }}</a>
        <span class="footer-sep" aria-hidden="true">·</span>
        <span class="footer-label">{{ $t('footer.author') }}</span>
        <a href="https://littlechin.tw" target="_blank" rel="noopener noreferrer">littlechin.tw</a>
      </p>
    </footer>
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { SUPPORTED_LOCALES } from './i18n'

const { locale } = useI18n()

// 語言變動時同步 <html lang>（對 SEO 與螢幕閱讀器都重要）並記入 localStorage
watch(locale, (val) => {
  const meta = SUPPORTED_LOCALES.find(l => l.code === val)
  if (typeof document !== 'undefined') {
    document.documentElement.lang = meta?.htmlLang || val
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('locale', val)
  }
}, { immediate: true })
</script>

<style>
/* ===== Google Material Design 3 Design Tokens ===== */
:root {
  --nav-h: 64px;
  --footer-h: 48px;
  --nav-h-mobile: 56px;
  --footer-h-mobile: 44px;

  /* Material Design 3 Design Tokens (Light Theme) */
  --md-sys-color-primary: #0b57d0; /* M3 Key Blue / Google Blue */
  --md-sys-color-primary-hover: #0842a0;
  --md-sys-color-primary-container: #d3e3fd;
  --md-sys-color-on-primary-container: #041e49;
  
  --md-sys-color-secondary: #00639b;
  --md-sys-color-secondary-container: #c2e7ff;
  --md-sys-color-on-secondary-container: #001d35;

  --md-sys-color-surface: #ffffff;
  --md-sys-color-surface-dim: #dedfec;
  --md-sys-color-surface-container-lowest: #ffffff;
  --md-sys-color-surface-container-low: #f8fafd;
  --md-sys-color-surface-container: #f0f4f9;
  --md-sys-color-surface-container-high: #e9eef6;
  --md-sys-color-surface-container-highest: #d7e3f4;
  
  --md-sys-color-on-surface: #1f1f1f;
  --md-sys-color-on-surface-variant: #444746;
  
  --md-sys-color-outline: #747775;
  --md-sys-color-outline-variant: #c4c7c5;
  
  --md-sys-color-background: #f8fafd;
  --md-sys-color-on-background: #1f1f1f;

  --md-sys-color-error: #ba1a1a;
  --md-sys-color-on-error: #ffffff;
  --md-sys-color-error-container: #ffdad6;
  --md-sys-color-on-error-container: #410002;

  --md-sys-color-success: #146c2e;
  --md-sys-color-success-container: #c4eed0;
  --md-sys-color-on-success-container: #002107;

  --md-sys-color-warning: #8d4f00;
  --md-sys-color-warning-container: #ffe0db;
  --md-sys-color-on-warning-container: #2e1600;

  /* Legacy variables for compatibility */
  --color-bg: var(--md-sys-color-background);
  --color-surface: var(--md-sys-color-surface);
  --color-surface-2: var(--md-sys-color-surface-container-low);
  
  --color-text: var(--md-sys-color-on-surface);
  --color-text-muted: var(--md-sys-color-on-surface-variant);
  --color-text-soft: var(--md-sys-color-outline);
  --color-text-on-primary: #ffffff;

  --color-border: var(--md-sys-color-outline-variant);
  --color-border-strong: var(--md-sys-color-outline);

  --color-primary: var(--md-sys-color-primary);
  --color-primary-hover: var(--md-sys-color-primary-hover);
  --color-primary-soft: rgba(11, 87, 208, 0.08);

  --color-cta-bg: var(--md-sys-color-primary);
  --color-cta-bg-hover: var(--md-sys-color-primary-hover);
  --color-cta-fg: #ffffff;

  --color-success: var(--md-sys-color-success);
  --color-warning: var(--md-sys-color-warning);
  --color-danger: var(--md-sys-color-error);

  --color-nav-bg: var(--md-sys-color-surface-container);
  --color-footer-bg: var(--md-sys-color-surface-container);

  /* Elevation and Shadows */
  --md-elevation-1: 0 1px 3px 1px rgba(0, 0, 0, 0.08), 0 1px 2px 0 rgba(0, 0, 0, 0.12);
  --md-elevation-2: 0 2px 6px 2px rgba(0, 0, 0, 0.08), 0 1px 2px 0 rgba(0, 0, 0, 0.12);
  --md-elevation-3: 0 4px 12px 3px rgba(0, 0, 0, 0.08), 0 1px 3px 0 rgba(0, 0, 0, 0.12);
  
  --shadow-sm: var(--md-elevation-1);
  --shadow-md: var(--md-elevation-2);
  --shadow-lg: var(--md-elevation-3);

  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 28px;
  --radius-pill: 999px;

  --transition: 0.25s cubic-bezier(0.2, 0, 0, 1);
}

/* ===== Dark theme overrides ===== */
[data-theme="dark"] {
  /* Material Design 3 Design Tokens (Dark Theme) */
  --md-sys-color-primary: #a8c7fa;
  --md-sys-color-primary-hover: #c2e7ff;
  --md-sys-color-primary-container: #0842a0;
  --md-sys-color-on-primary-container: #d3e3fd;

  --md-sys-color-secondary: #c2e7ff;
  --md-sys-color-secondary-container: #004a77;
  --md-sys-color-on-secondary-container: #c2e7ff;

  --md-sys-color-surface: #0f131a;
  --md-sys-color-surface-dim: #0a0e14;
  --md-sys-color-surface-container-lowest: #0a0e14;
  --md-sys-color-surface-container-low: #131720;
  --md-sys-color-surface-container: #1b202a;
  --md-sys-color-surface-container-high: #272c38;
  --md-sys-color-surface-container-highest: #323846;

  --md-sys-color-on-surface: #e2e2e6;
  --md-sys-color-on-surface-variant: #c4c7c5;

  --md-sys-color-outline: #8e918f;
  --md-sys-color-outline-variant: #444746;

  --md-sys-color-background: #0b0e14;
  --md-sys-color-on-background: #e2e2e6;

  --md-sys-color-error: #ffb4ab;
  --md-sys-color-on-error: #690005;
  --md-sys-color-error-container: #93000a;
  --md-sys-color-on-error-container: #ffb4ab;

  --md-sys-color-success: #6be190;
  --md-sys-color-success-container: #00531b;
  --md-sys-color-on-success-container: #e8f5e9;

  --md-sys-color-warning: #ffb865;
  --md-sys-color-warning-container: #663600;
  --md-sys-color-on-warning-container: #fff3e0;

  --color-primary-soft: rgba(168, 199, 250, 0.15);
  --color-cta-bg: var(--md-sys-color-primary);
  --color-cta-bg-hover: var(--md-sys-color-primary-hover);
  --color-cta-fg: var(--md-sys-color-surface-dim);
  
  --md-elevation-1: 0 1px 3px 1px rgba(0, 0, 0, 0.2), 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --md-elevation-2: 0 2px 6px 2px rgba(0, 0, 0, 0.2), 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --md-elevation-3: 0 4px 12px 3px rgba(0, 0, 0, 0.2), 0 1px 3px 0 rgba(0, 0, 0, 0.3);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
}

body {
  font-family: 'Roboto', 'Noto Sans TC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  line-height: 1.6;
  color: var(--color-text);
  background: var(--color-bg);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
  overscroll-behavior: none;
}

/* Global focus ring (a11y) */
:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Skip link */
.skip-link {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  background: var(--md-sys-color-on-surface);
  color: var(--md-sys-color-surface);
  padding: 0.6rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  text-decoration: none;
  transform: translateY(-150%);
  transition: transform var(--transition);
  z-index: 2000;
}
.skip-link:focus,
.skip-link:focus-visible {
  transform: translateY(0);
}

/* ===== App Bar (Navbar) ===== */
.navbar {
  background: var(--color-nav-bg);
  backdrop-filter: saturate(180%) blur(12px);
  -webkit-backdrop-filter: saturate(180%) blur(12px);
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
  box-shadow: var(--shadow-sm);
  height: var(--nav-h);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: background-color var(--transition), border-color var(--transition);
}

.nav-container {
  max-width: 1200px;
  height: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1.5rem;
}

.nav-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  text-decoration: none;
  color: var(--md-sys-color-on-surface);
  transition: color var(--transition);
}

.nav-logo-mark {
  font-size: 1.4rem;
}

.nav-logo:hover {
  color: var(--md-sys-color-primary);
}

.nav-menu {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.nav-link {
  color: var(--md-sys-color-on-surface-variant);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  padding: 0.5rem 1.2rem;
  border-radius: var(--radius-xl);
  transition: all var(--transition);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.nav-link:hover {
  color: var(--md-sys-color-on-surface);
  background: rgba(11, 87, 208, 0.08);
}

.nav-link.router-link-active {
  color: var(--md-sys-color-on-primary-container);
  background: var(--md-sys-color-primary-container);
  font-weight: 700;
}

.nav-icon-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-pill);
  color: var(--md-sys-color-on-surface-variant);
  text-decoration: none;
  transition: all var(--transition);
}

.nav-icon-link:hover {
  background: rgba(11, 87, 208, 0.08);
  color: var(--md-sys-color-on-surface);
}

.nav-icon-link.router-link-active {
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
}

.nav-icon-link .material-symbols-outlined {
  font-size: 22px;
}

/* ===== Main ===== */
.main-content {
  margin-top: var(--nav-h);
  margin-bottom: var(--footer-h);
  min-height: calc(100vh - var(--nav-h) - var(--footer-h));
  min-height: calc(100dvh - var(--nav-h) - var(--footer-h));
}

.main-content:focus {
  outline: none;
}

/* ===== Footer ===== */
.footer {
  background: var(--color-footer-bg);
  backdrop-filter: saturate(180%) blur(8px);
  -webkit-backdrop-filter: saturate(180%) blur(8px);
  border-top: 1px solid var(--md-sys-color-outline-variant);
  color: var(--md-sys-color-on-surface-variant);
  height: var(--footer-h);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 1rem;
  font-size: 0.82rem;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: background-color var(--transition), border-color var(--transition);
}

.footer p {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  margin: 0;
  line-height: 1.4;
}

.footer .footer-label {
  opacity: 0.8;
}

.footer .footer-sep {
  color: var(--md-sys-color-outline-variant);
}

.footer a {
  color: var(--md-sys-color-primary);
  text-decoration: none;
  font-weight: 500;
  transition: color var(--transition);
}

.footer a:hover {
  color: var(--md-sys-color-primary-hover);
  text-decoration: underline;
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  :root {
    --nav-h: var(--nav-h-mobile);
    --footer-h: var(--footer-h-mobile);
  }

  .nav-container {
    padding: 0 1rem;
  }

  .nav-menu {
    gap: 0.4rem;
  }

  .nav-logo-text {
    font-size: 1.05rem;
  }

  .nav-link {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }

  .footer {
    font-size: 0.75rem;
    padding: 0 0.75rem;
  }

  .footer .footer-label {
    display: none;
  }
}

@media (max-width: 380px) {
  .nav-logo-text {
    display: none;
  }
}
</style>
