<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-container">
        <div class="hero-content">
          <div class="hero-badge"><span aria-hidden="true">🚻</span> {{ $t('home.badge') }}</div>
          <h1 class="hero-title">{{ $t('home.title') }}</h1>
          <p class="hero-subtitle">{{ $t('home.subtitle') }}</p>
          <p class="hero-description">{{ $t('home.description') }}</p>
          
          <div class="hero-actions">
            <router-link to="/map" class="btn btn-primary">
              📍 {{ $t('home.startButton') }}
            </router-link>
            <button @click="scrollToFeatures" class="btn btn-secondary">
              ℹ️ {{ $t('home.learnMore') }}
            </button>
          </div>

          <div class="quick-features">
            <span class="quick-feature">🎯 {{ $t('home.features.nearest') }}</span>
            <span class="quick-feature">🔍 {{ $t('home.features.filter') }}</span>
            <span class="quick-feature">📱 {{ $t('home.features.responsive') }}</span>
          </div>
        </div>

        <aside class="hero-side-panel">
          <div class="stats" v-if="stats">
            <div class="stat-item">
              <span class="stat-number">{{ stats.total_count?.toLocaleString() || '40,000+' }}</span>
              <span class="stat-label">{{ $t('home.stats.toilets') }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ stats.counties?.length || '22' }}</span>
              <span class="stat-label">{{ $t('home.stats.counties') }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ daysSinceUpdate }}</span>
              <span class="stat-label">{{ $t('home.stats.daysAgo') }}</span>
            </div>
          </div>

          <router-link to="/map" class="panel-link">
            📍 {{ $t('home.startButton') }}
          </router-link>
        </aside>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features" ref="featuresSection">
      <div class="container">
        <h2 class="section-title">{{ $t('home.features.title') }}</h2>
        
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🎯</div>
            <h3>{{ $t('home.features.nearest') }}</h3>
            <p>{{ $t('home.features.nearestDesc') }}</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🔍</div>
            <h3>{{ $t('home.features.filter') }}</h3>
            <p>{{ $t('home.features.filterDesc') }}</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">📋</div>
            <h3>{{ $t('home.features.info') }}</h3>
            <p>{{ $t('home.features.infoDesc') }}</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🌐</div>
            <h3>{{ $t('home.features.multilingual') }}</h3>
            <p>{{ $t('home.features.multilingualDesc') }}</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3>{{ $t('home.features.responsive') }}</h3>
            <p>{{ $t('home.features.responsiveDesc') }}</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🔄</div>
            <h3>{{ $t('home.features.autoUpdate') }}</h3>
            <p>{{ $t('home.features.autoUpdateDesc') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section class="about">
      <div class="container">
        <div class="about-content">
          <div class="about-text">
            <h2>{{ $t('home.about.title') }}</h2>
            <p>
              {{ $t('home.about.description1') }}
            </p>
            <p>
              {{ $t('home.about.description2') }}
            </p>
            <p class="video-coding-note">
              <strong>{{ $t('common.developmentNote') }}：</strong>{{ $t('home.about.videoCodingNote') }}
            </p>
            
            <div class="tech-stack">
              <h3>{{ $t('home.about.techStack') }}</h3>
              <div class="tech-tags">
                <span class="tech-tag">Vue 3</span>
                <span class="tech-tag">Vite</span>
                <span class="tech-tag">Leaflet</span>
                <span class="tech-tag">GitHub Actions</span>
                <span class="tech-tag">GitHub Pages</span>
              </div>
            </div>
          </div>
          
          <div class="about-image">
            <div class="data-flow">
              <div class="flow-step">
                <div class="flow-icon">🏛️</div>
                <span>{{ $t('home.about.dataFlow.step1') }}</span>
              </div>
              <div class="flow-arrow">→</div>
              <div class="flow-step">
                <div class="flow-icon">⚙️</div>
                <span>{{ $t('home.about.dataFlow.step2') }}</span>
              </div>
              <div class="flow-arrow">→</div>
              <div class="flow-step">
                <div class="flow-icon">🗺️</div>
                <span>{{ $t('home.about.dataFlow.step3') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const stats = ref(null)
const featuresSection = ref(null)

const scrollToFeatures = () => {
  featuresSection.value?.scrollIntoView({ behavior: 'smooth' })
}

const daysSinceUpdate = computed(() => {
  if (!stats.value?.last_updated) return t('home.stats.weekly')
  
  const lastUpdate = new Date(stats.value.last_updated)
  const now = new Date()
  const diffTime = Math.abs(now - lastUpdate)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
})

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
  overflow-x: hidden;
}

/* Hero Section */
.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="40" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="40" cy="80" r="1.5" fill="rgba(255,255,255,0.1)"/></svg>');
  pointer-events: none;
}

.hero-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 2rem;
  align-items: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 999px;
  padding: 0.4rem 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  font-weight: 600;
}

.hero-content {
  text-align: left;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.hero-description {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  opacity: 0.8;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.btn {
  padding: 1rem 2rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
}

.btn:focus-visible,
.panel-link:focus-visible {
  outline: 3px solid #ffffff;
  outline-offset: 2px;
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.btn-secondary {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background: white;
  color: #667eea;
}

.quick-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.quick-feature {
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 999px;
  padding: 0.3rem 0.8rem;
  font-size: 0.9rem;
}

.hero-side-panel {
  background: rgba(19, 19, 35, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 1.5rem;
  backdrop-filter: blur(6px);
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.8rem;
  margin-bottom: 1rem;
}

@media (max-width: 1024px) {
  .stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.stat-item {
  text-align: center;
  background: rgba(255, 255, 255, 0.16);
  border-radius: 12px;
  padding: 0.9rem 0.75rem;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #ffd700;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  opacity: 0.8;
  margin-top: 0.35rem;
}

.panel-link {
  display: inline-flex;
  width: 100%;
  justify-content: center;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  text-decoration: none;
  color: #667eea;
  background: #fff;
  font-weight: 700;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.panel-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0,0,0,0.2);
}



/* Features Section */
.features {
  padding: 5rem 2rem;
  background: #f8f9fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: #333;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  border: 1px solid #eef0f4;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 14px 30px rgba(60, 72, 88, 0.14);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: #333;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

/* About Section */
.about {
  padding: 5rem 2rem;
  background: white;
}

.about-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.about-text h2 {
  font-size: 2.2rem;
  margin-bottom: 1.5rem;
  color: #333;
}

.about-text p {
  color: #666;
  line-height: 1.8;
  margin-bottom: 1.5rem;
}

.video-coding-note {
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
  padding: 1rem;
  border-radius: 4px;
  font-style: italic;
}

.video-coding-note strong {
  color: #1976d2;
}

.tech-stack h3 {
  margin: 2rem 0 1rem 0;
  color: #333;
}

.tech-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tech-tag {
  background: #4a69bd; /* 加深顏色以提高對比度，原為 #667eea */
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-size: 0.9rem;
}

.data-flow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.flow-step {
  text-align: center;
}

.flow-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.flow-arrow {
  font-size: 2rem;
  color: #667eea;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .hero {
    min-height: auto;
    padding: 2.5rem 0 3rem;
  }

  .hero-container {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .hero-content {
    text-align: center;
  }

  .hero-title {
    font-size: 2.5rem;
  }
  
  .stats {
    grid-template-columns: 1fr;
  }
  
  .about-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .data-flow {
    flex-direction: column;
  }
  
  .flow-arrow {
    transform: rotate(90deg);
  }
  
  .hero-actions {
    justify-content: center;
  }
  
  .btn {
    width: 100%;
  }
}
</style>
