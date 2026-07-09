<template>
  <div class="home">
    <section class="hero">
      <div class="hero-inner">
        <span class="eyebrow">{{ $t('home.badge') }}</span>

        <h1 class="title">{{ $t('home.subtitle') }}</h1>
        <p class="lede">{{ $t('home.description') }}</p>

        <div class="actions">
          <router-link to="/map" class="cta" @click="onCtaClick">
            <span class="material-symbols-outlined cta-icon" aria-hidden="true">explore</span>
            {{ $t('home.startButton') }}
          </router-link>
        </div>

        <div v-if="stats" class="stats-card">
          <p class="meta">
            <span class="stat-item">
              <strong class="stat-num">{{ stats.total_count?.toLocaleString() || '40,000+' }}</strong>
              <span class="stat-label">{{ $t('home.stats.toilets') }}</span>
            </span>
            <span class="dot" aria-hidden="true">·</span>
            <span class="stat-item">
              <strong class="stat-num">{{ stats.counties?.length || '22' }}</strong>
              <span class="stat-label">{{ $t('home.stats.counties') }}</span>
            </span>
          </p>
        </div>

        <ul class="trust-badges" aria-label="">
          <li>
            <span class="material-symbols-outlined trust-icon" aria-hidden="true">check_circle</span>
            {{ $t('home.trust.free') }}
          </li>
          <li>
            <span class="material-symbols-outlined trust-icon" aria-hidden="true">check_circle</span>
            {{ $t('home.trust.noSignup') }}
          </li>
          <li>
            <span class="material-symbols-outlined trust-icon" aria-hidden="true">check_circle</span>
            {{ $t('home.trust.weeklyUpdate') }}
          </li>
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
  height: calc(100vh - var(--nav-h) - var(--footer-h));
  height: calc(100dvh - var(--nav-h) - var(--footer-h));
  min-height: 480px;
  background: var(--md-sys-color-background);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  overscroll-behavior: contain;
  transition: background-color var(--transition);
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
  letter-spacing: 0.06em;
  color: var(--md-sys-color-on-primary-container);
  background: var(--md-sys-color-primary-container);
  padding: 0.5rem 1.2rem;
  border-radius: var(--radius-pill);
  margin-bottom: 1.75rem;
}

.title {
  font-size: clamp(2.25rem, 5vw, 3.5rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--md-sys-color-on-surface);
  margin-bottom: 1.25rem;
}

.lede {
  font-size: 1.15rem;
  line-height: 1.6;
  color: var(--md-sys-color-on-surface-variant);
  margin: 0 auto 2.5rem;
  max-width: 520px;
}

.actions {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

/* M3 Extended FAB for CTA */
.cta {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--md-sys-color-primary);
  color: #ffffff;
  text-decoration: none;
  font-size: 1.05rem;
  font-weight: 600;
  padding: 1.1rem 2.2rem;
  border-radius: var(--radius-pill);
  transition: all var(--transition);
  box-shadow: var(--shadow-md);
}

.cta:hover {
  background: var(--md-sys-color-primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.cta:focus-visible {
  outline: 3px solid var(--md-sys-color-primary);
  outline-offset: 3px;
}

.cta-icon {
  font-size: 20px;
}

/* Stats Card - M3 Outlined Card Style */
.stats-card {
  display: inline-block;
  margin: 0.5rem auto 2rem;
  padding: 0.85rem 1.75rem;
  background: var(--md-sys-color-surface-container-low);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: background-color var(--transition), border-color var(--transition);
}

.meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.75rem 1rem;
  font-size: 0.95rem;
  color: var(--md-sys-color-on-surface-variant);
  margin: 0;
}

.stat-item {
  display: inline-flex;
  align-items: baseline;
  gap: 0.35rem;
}

.stat-num {
  color: var(--md-sys-color-primary);
  font-size: 1.15rem;
  font-weight: 700;
}

.stat-label {
  font-weight: 500;
}

.meta .dot {
  color: var(--md-sys-color-outline-variant);
  font-weight: bold;
}

/* Trust badges using Material Icons */
.trust-badges {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0;
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  gap: 1.25rem;
  font-size: 0.88rem;
  color: var(--md-sys-color-on-surface-variant);
  white-space: nowrap;
}

.trust-badges li {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  line-height: 1.4;
  font-weight: 500;
}

.trust-icon {
  font-size: 18px;
  color: var(--md-sys-color-success);
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
  opacity: 0.5;
}

.blob-a {
  width: 450px;
  height: 450px;
  background: radial-gradient(circle, var(--md-sys-color-primary-container) 0%, transparent 70%);
  top: -120px;
  left: -80px;
}

.blob-b {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, var(--md-sys-color-secondary-container) 0%, transparent 70%);
  bottom: -160px;
  right: -100px;
}

/* Dark mode blob tweaks */
[data-theme="dark"] .blob-a {
  background: radial-gradient(circle, rgba(168, 199, 250, 0.25) 0%, transparent 70%);
  opacity: 0.3;
}

[data-theme="dark"] .blob-b {
  background: radial-gradient(circle, rgba(0, 99, 155, 0.2) 0%, transparent 70%);
  opacity: 0.25;
}

/* Responsive */
@media (max-width: 640px) {
  .hero {
    padding: 3rem 1.25rem;
  }

  .title {
    margin-bottom: 1rem;
  }

  .lede {
    font-size: 1.02rem;
    margin-bottom: 2rem;
  }

  .cta {
    padding: 1rem 1.8rem;
    font-size: 1rem;
  }

  .stats-card {
    padding: 0.75rem 1.25rem;
  }

  .trust-badges {
    gap: 0.75rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 440px) {
  .trust-badges {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem 0.8rem;
  }
}
</style>
