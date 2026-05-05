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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
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
/* ===== Design tokens =====
   所有顏色都通過 WCAG AA 對比度（>= 4.5:1 for normal text），
   主要 token 通過 AAA（>= 7:1）。請勿在元件中寫死色碼，
   一律使用變數，這樣切換亮/暗主題才會正確。 */
:root {
  --nav-h: 60px;
  --footer-h: 40px;
  --nav-h-mobile: 56px;
  --footer-h-mobile: 36px;

  /* 表面 */
  --color-bg: #fafbfc;
  --color-surface: #ffffff;
  --color-surface-2: #f8fafc;

  /* 文字（vs --color-bg 對比度）
     text:        #0f172a  → 18.7:1 (AAA)
     text-muted:  #475569  →  7.5:1 (AAA)
     text-soft:   #64748b  →  4.6:1 (AA, 大字 AAA) */
  --color-text: #0f172a;
  --color-text-muted: #475569;
  --color-text-soft: #64748b;
  --color-text-on-primary: #ffffff;

  /* 邊框 / 分隔 */
  --color-border: #e5e7eb;
  --color-border-strong: #cbd5e1;

  /* 強調色（紫藍）：5b6cff vs 白底 ≈ 4.7:1 (AA) */
  --color-primary: #4f5ee0;        /* 比 5b6cff 略深，提升對比 */
  --color-primary-hover: #3f4cc8;
  --color-primary-soft: rgba(79, 94, 224, 0.08);

  /* CTA（首頁主按鈕等深色按鈕）：亮色模式深底白字 */
  --color-cta-bg: #0f172a;
  --color-cta-bg-hover: #1e293b;
  --color-cta-fg: #ffffff;

  /* 語意色 */
  --color-success: #15803d;        /* vs 白底 4.7:1 */
  --color-warning: #b45309;
  --color-danger: #b91c1c;

  /* Chrome */
  --color-nav-bg: rgba(255, 255, 255, 0.96);
  --color-footer-bg: rgba(255, 255, 255, 0.96);

  --shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.04);
  --shadow-md: 0 4px 16px rgba(15, 23, 42, 0.06);
  --shadow-lg: 0 12px 28px rgba(15, 23, 42, 0.12);

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-pill: 999px;

  --transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ===== Dark theme overrides =====
   對 #0b1220 背景的對比度：
     text       #f8fafc → 17.4:1 (AAA)
     text-muted #d3dde9 → 12.8:1 (AAA)
     text-soft  #b3c0d1 →  8.7:1 (AAA)
     primary    #a5b4fc →  9.8:1 (AAA) */
[data-theme="dark"] {
  --color-bg: #0b1220;
  --color-surface: #131c30;
  --color-surface-2: #1c2742;

  --color-text: #f8fafc;
  --color-text-muted: #d3dde9;
  --color-text-soft: #b3c0d1;
  --color-text-on-primary: #0b1220;

  --color-border: #28324d;
  --color-border-strong: #3f4c6b;

  /* 暗色用較亮的紫色，且確保對比 ≥ 7:1 */
  --color-primary: #a5b4fc;
  --color-primary-hover: #c7d2fe;
  --color-primary-soft: rgba(165, 180, 252, 0.18);

  /* 暗模式 CTA 反向：亮底深字 */
  --color-cta-bg: #f8fafc;
  --color-cta-bg-hover: #e2e8f0;
  --color-cta-fg: #0b1220;

  --color-success: #4ade80;
  --color-warning: #fbbf24;
  --color-danger: #f87171;

  --color-nav-bg: rgba(11, 18, 32, 0.96);
  --color-footer-bg: rgba(11, 18, 32, 0.96);
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang TC',
    'Noto Sans TC', Roboto, sans-serif;
  line-height: 1.6;
  color: var(--color-text);
  background: var(--color-bg);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* 防止水平捲動，且避免 iOS 上 body 因 child overflow 連動捲動 */
  overflow-x: hidden;
  overscroll-behavior: none;
}

/* Global focus ring (a11y) */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Skip link */
.skip-link {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  background: var(--color-text);
  color: #fff;
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

/* ===== Navbar ===== */
.navbar {
  background: var(--color-nav-bg);
  backdrop-filter: saturate(180%) blur(12px);
  -webkit-backdrop-filter: saturate(180%) blur(12px);
  border-bottom: 1px solid var(--color-border);
  /* 內容滾動時透出來會看不清楚，加一道很細的陰影把 navbar 與下方內容明確分開 */
  box-shadow: 0 1px 0 rgba(15, 23, 42, 0.04), 0 4px 12px rgba(15, 23, 42, 0.04);
  height: var(--nav-h);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

[data-theme="dark"] .navbar {
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.25);
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
  gap: 0.5rem;
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  text-decoration: none;
  color: var(--color-text);
  transition: color var(--transition);
}

.nav-logo-mark {
  font-size: 1.3rem;
}

.nav-logo:hover {
  color: var(--color-primary);
}

.nav-menu {
  display: flex;
  gap: 1.25rem;
  align-items: center;
}

.nav-link {
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  padding: 0.4rem 0.6rem;
  border-radius: var(--radius-sm);
  transition: color var(--transition), background var(--transition);
}

.nav-link:hover {
  color: var(--color-text);
  background: var(--color-primary-soft);
}

.nav-link.router-link-active {
  color: var(--color-primary);
  background: var(--color-primary-soft);
}

.nav-icon-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-pill);
  color: var(--color-text-muted);
  text-decoration: none;
  transition: background var(--transition), color var(--transition);
}

.nav-icon-link:hover {
  background: var(--color-primary-soft);
  color: var(--color-text);
}

.nav-icon-link.router-link-active {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

/* ===== Main ===== */
.main-content {
  margin-top: var(--nav-h);
  margin-bottom: var(--footer-h);
  /* 改用 100dvh（dynamic viewport height）—— iOS Safari 上網址列顯示/隱藏
     會讓 100vh 比實際可視區高，造成 body 出現可滾動高度，內容因此會
     滑到 navbar 後面看起來像「覆蓋」。100dvh 會跟著實際可視區縮放。 */
  min-height: calc(100vh - var(--nav-h) - var(--footer-h));
  min-height: calc(100dvh - var(--nav-h) - var(--footer-h));
}

.main-content:focus {
  outline: none; /* programmatic focus only, no ring */
}

/* ===== Footer ===== */
.footer {
  background: var(--color-footer-bg);
  backdrop-filter: saturate(180%) blur(8px);
  -webkit-backdrop-filter: saturate(180%) blur(8px);
  border-top: 1px solid var(--color-border);
  color: var(--color-text-soft);
  height: var(--footer-h);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 1rem;
  font-size: 0.78rem;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
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
  color: var(--color-text-soft);
  opacity: 0.7;
}

.footer .footer-sep {
  color: #cbd5e1;
}

.footer a {
  color: var(--color-text);
  text-decoration: none;
  font-weight: 500;
  transition: color var(--transition);
}

.footer a:hover {
  color: var(--color-primary);
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
    gap: 0.5rem;
  }

  .nav-logo-text {
    font-size: 1rem;
  }

  .nav-link {
    padding: 0.4rem 0.5rem;
    font-size: 0.9rem;
  }

  .footer {
    font-size: 0.7rem;
    padding: 0 0.75rem;
  }

  .footer .footer-label {
    display: none; /* 手機版省空間，只留連結與分隔點 */
  }
}

@media (max-width: 380px) {
  .nav-logo-text {
    /* 在很窄的螢幕上隱藏標題文字，只留 emoji */
    display: none;
  }
}
</style>
