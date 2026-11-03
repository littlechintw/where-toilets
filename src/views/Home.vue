<template>
  <div class="home">
    <section class="hero">
      <div class="hero-inner">
        <h1 class="title">{{ $t('home.subtitle') }}</h1>
        <p class="lede">{{ $t('home.description') }}</p>

        <div class="actions">
          <router-link :to="to('Map')" class="cta" @click="onCtaClick">
            <span class="material-symbols-outlined cta-icon" aria-hidden="true">explore</span>
            {{ $t('home.startButton') }}
          </router-link>
        </div>

        <!-- 一開始就渲染（用保底數字），等 index.json 回來再換成實際值，避免插入時整段往下推造成 CLS -->
        <div class="stats-card">
          <p class="meta">
            <span class="stat-item">
              <strong class="stat-num">{{ stats?.total_count?.toLocaleString() || '45,000+' }}</strong>
              <span class="stat-label">{{ $t('home.stats.toilets') }}</span>
            </span>
            <span class="dot" aria-hidden="true">·</span>
            <span class="stat-item">
              <strong class="stat-num">{{ stats?.counties?.length || '22' }}</strong>
              <span class="stat-label">{{ $t('home.stats.counties') }}</span>
            </span>
            <!-- 一開始就渲染（資料沒回來時用隱藏的佔位），避免 index.json 載入後多出一項把卡片撐高、整個垂直置中的 hero 跟著位移（CLS） -->
            <span class="dot" aria-hidden="true" :class="{ 'is-pending': updatedDays === null }">·</span>
            <span class="stat-item" :class="{ 'is-pending': updatedDays === null }" :title="updatedDate" :aria-hidden="updatedDays === null">
              <i18n-t v-if="shownDays > 0" keypath="home.stats.updatedDaysAgo" tag="span" class="stat-label">
                <template #n><strong class="stat-num">{{ shownDays }}</strong></template>
              </i18n-t>
              <span v-else class="stat-label">{{ $t('home.stats.updatedToday') }}</span>
            </span>
          </p>
          <p class="source-note">
            <a href="https://data.gov.tw/dataset/30794" target="_blank" rel="noopener noreferrer">{{ $t('home.dataSource') }}</a>
          </p>
        </div>
      </div>

      <div class="bg-decor" aria-hidden="true">
        <div class="blob blob-a"></div>
        <div class="blob blob-b"></div>
      </div>
    </section>

    <!-- 廣告只放這裡（頁面最底、頁尾上方一條固定高度的版位，離 CTA 很遠）；沒設定 ID 時正式環境不會渲染 -->
    <AdSlot location="home" :slot="AD_SLOTS.home" class="home-ad" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { trackEvent } from '../utils/analytics'
import AdSlot from '../components/AdSlot.vue'
import { AD_SLOTS } from '../config/ads'
import { useDataMeta } from '../composables/useDataMeta'
import { useLocalizedTo } from '../composables/useLocalizedTo'

const stats = ref(null)
const to = useLocalizedTo()
const { meta, updatedDate } = useDataMeta()

// 以臺灣日曆日計算「N 天前」，避免跨時區誤差
const shownDays = computed(() => updatedDays.value ?? 1)
const updatedDays = computed(() => {
  if (!meta.value?.last_updated) return null
  const day = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei' }).format(d)
  return Math.max(0, Math.round((Date.parse(day(new Date())) - Date.parse(day(new Date(meta.value.last_updated)))) / 86400000))
})

const onCtaClick = () => {
  trackEvent('cta_get_started', { location: 'home_hero' })
}

onMounted(async () => {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}data/index.json`)
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
  /* 用 min-height 而不是固定 height：加了廣告列後小螢幕可以往下捲，不會被切掉 */
  min-height: calc(100vh - var(--nav-h) - var(--footer-h));
  min-height: calc(100dvh - var(--nav-h) - var(--footer-h));
  background: var(--md-sys-color-background);
  display: flex;
  flex-direction: column;
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

.source-note a {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-color: var(--md-sys-color-outline);
}
.source-note a:hover {
  color: var(--md-sys-color-primary);
  text-decoration-color: currentColor;
}

.source-note {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  margin: 0.85rem 0 0;
  padding-top: 0.85rem;
  border-top: 1px solid var(--md-sys-color-outline-variant);
  font-size: 0.78rem;
  line-height: 1.5;
  color: var(--md-sys-color-on-surface-variant);
}

.title {
  font-size: clamp(2.25rem, 5vw, 3.5rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--md-sys-color-on-surface);
  margin-bottom: 0.5rem;
}

.lede {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--md-sys-color-on-surface-variant);
  margin: 0 auto 1.75rem;
  max-width: 520px;
}

.actions {
  display: flex;
  justify-content: center;
  margin-bottom: 1.25rem;
}

/* M3 Extended FAB for CTA */
.cta {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
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
  max-width: 100%;
  text-align: center;
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

.meta .is-pending {
  visibility: hidden;
}

.meta .dot {
  color: var(--md-sys-color-outline-variant);
  font-weight: bold;
}

.home-ad {
  flex-shrink: 0;
}

/* 底下的廣告版位佔了高度，內容會被推到偏上；桌機版在 hero 上方補同樣高度讓內容對整個可視區垂直置中 */
@media (min-width: 641px) {
  .hero {
    padding-top: calc(2.5rem + 8.5rem);
  }
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
  /* 不用 filter: blur()：兩個 450–500px 的模糊圖層在手機上繪製很貴，radial-gradient 本身就已經是漸層邊緣 */
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
    margin-bottom: 0.4rem;
  }

  .lede {
    font-size: 0.95rem;
    margin-bottom: 1.5rem;
  }

  .cta {
    padding: 1rem 1.8rem;
    font-size: 1rem;
  }

  .stats-card {
    padding: 0.75rem 1.25rem;
  }
}
</style>
