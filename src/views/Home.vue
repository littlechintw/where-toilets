<template>
  <div class="home">
    <section class="hero">
      <div class="hero-inner">
        <span class="eyebrow">{{ $t('home.badge') }}</span>

        <h1 class="title">{{ $t('home.subtitle') }}</h1>
        <p class="lede">{{ $t('home.description') }}</p>

        <div class="actions">
          <router-link to="/map" class="cta" @click="onCtaClick">
            {{ $t('home.startButton') }}
            <span class="arrow" aria-hidden="true">→</span>
          </router-link>
        </div>

        <p v-if="stats" class="meta">
          <span>
            <strong>{{ stats.total_count?.toLocaleString() || '40,000+' }}</strong>
            {{ $t('home.stats.toilets') }}
          </span>
          <span class="dot" aria-hidden="true">·</span>
          <span>
            <strong>{{ stats.counties?.length || '22' }}</strong>
            {{ $t('home.stats.counties') }}
          </span>
        </p>

        <ul class="trust-badges" aria-label="">
          <li><span aria-hidden="true">✓</span> {{ $t('home.trust.free') }}</li>
          <li><span aria-hidden="true">✓</span> {{ $t('home.trust.noSignup') }}</li>
          <li><span aria-hidden="true">✓</span> {{ $t('home.trust.weeklyUpdate') }}</li>
        </ul>
      </div>

      <div class="bg-decor" aria-hidden="true">
        <div class="blob blob-a"></div>
        <div class="blob blob-b"></div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { trackEvent } from '../utils/analytics'

const stats = ref(null)

const onCtaClick = () => {
  trackEvent('cta_get_started', { location: 'home_hero' })
}

onMounted(async () => {
  try {
    const response = await fetch('./data/index.json')
    if (response.ok) {
      stats.value = await response.json()
    }
  } catch (error) {
    console.warn('無法載入統計資料:', error)
  }
})
</script>

<style scoped>
.home {
  /* 使用 dvh 避免 iOS 網址列影響；舊瀏覽器 fallback 到 vh */
  height: calc(100vh - var(--nav-h) - var(--footer-h));
  height: calc(100dvh - var(--nav-h) - var(--footer-h));
  min-height: 480px; /* 在很短的視窗（例如手機橫向）才會啟用 */
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  overscroll-behavior: contain;
}

/* Hero */
.hero {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1.5rem;
  overflow: hidden;
}

.hero-inner {
  position: relative;
  z-index: 1;
  max-width: 640px;
  width: 100%;
  text-align: center;
}

.eyebrow {
  display: inline-block;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--color-primary);
  background: var(--color-primary-soft);
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  margin-bottom: 1.5rem;
}

.title {
  font-size: clamp(2.25rem, 5vw, 3.5rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--color-text);
  margin-bottom: 1rem;
}

.lede {
  font-size: 1.15rem;
  line-height: 1.6;
  color: var(--color-text-muted);
  margin: 0 auto 2.5rem;
  max-width: 520px;
}

.actions {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.cta {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: var(--color-cta-bg);
  color: var(--color-cta-fg);
  text-decoration: none;
  font-size: 1.05rem;
  font-weight: 600;
  padding: 1rem 2rem;
  border-radius: 999px;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
}

.cta:hover {
  background: var(--color-cta-bg-hover);
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.24);
}

.cta:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 3px;
}

.cta .arrow {
  transition: transform 0.2s ease;
}

.cta:hover .arrow {
  transform: translateX(4px);
}

.meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.5rem 0.75rem;
  font-size: 0.95rem;
  color: var(--color-text-soft);
  margin: 0;
}

.meta strong {
  color: var(--color-text);
  font-weight: 700;
}

.meta .dot {
  color: var(--color-border-strong);
}

/* Trust micro-badges：自成一行（block flex），三個徽章水平單行排列 */
.trust-badges {
  list-style: none;
  padding: 0;
  margin: 0.85rem 0 0;
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  gap: 0.85rem;
  font-size: 0.82rem;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.trust-badges li {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  line-height: 1.4;
}

/* 手機螢幕字級略縮，確保三個徽章塞得進單行 */
@media (max-width: 420px) {
  .trust-badges {
    gap: 0.55rem;
    font-size: 0.72rem;
  }
}

@media (max-width: 340px) {
  .trust-badges {
    gap: 0.4rem;
    font-size: 0.66rem;
  }
}

.trust-badges li span[aria-hidden] {
  /* 用語意色：暗模式自動切到較亮的綠 */
  color: var(--color-success);
  font-weight: 700;
}

/* Decorative background blobs */
.bg-decor {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.45;
}

.blob-a {
  width: 420px;
  height: 420px;
  background: radial-gradient(circle, #c7d2fe 0%, transparent 70%);
  top: -120px;
  left: -80px;
}

.blob-b {
  width: 480px;
  height: 480px;
  background: radial-gradient(circle, #ddd6fe 0%, transparent 70%);
  bottom: -160px;
  right: -100px;
}

/* Dark mode：把粉嫩色塊改成深紫，避免在暗背景上太刺眼且降低對比 */
[data-theme="dark"] .blob-a {
  background: radial-gradient(circle, rgba(99, 102, 241, 0.55) 0%, transparent 70%);
  opacity: 0.35;
}

[data-theme="dark"] .blob-b {
  background: radial-gradient(circle, rgba(139, 92, 246, 0.45) 0%, transparent 70%);
  opacity: 0.3;
}

/* Responsive */
@media (max-width: 640px) {
  .hero {
    padding: 3rem 1.25rem;
  }

  .lede {
    font-size: 1.02rem;
    margin-bottom: 2rem;
  }

  .cta {
    padding: 0.9rem 1.6rem;
    font-size: 1rem;
  }

  .meta {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
