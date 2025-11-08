<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-container">
        <router-link to="/" class="nav-logo">
          🚽 {{ $t('home.title') }}
        </router-link>
        <div class="nav-menu">
          <router-link to="/" class="nav-link">{{ $t('nav.home') }}</router-link>
          <router-link to="/map" class="nav-link">{{ $t('nav.map') }}</router-link>
          <button @click="toggleLanguage" class="lang-toggle">
            {{ locale === 'zh' ? 'EN' : '中文' }}
          </button>
        </div>
      </div>
    </nav>
    
    <main class="main-content">
      <router-view />
    </main>
    
    <footer class="footer">
      <p>{{ $t('footer.dataSource') }}：<a href="https://data.gov.tw/dataset/30794" target="_blank" rel="noopener noreferrer">{{ $t('footer.epa') }}</a> | {{ $t('footer.author') }}：<a href="https://littlechin.tw" target="_blank" rel="noopener noreferrer">littlechin.tw</a></p>
      <!--<p>{{ $t('footer.lastUpdate') }}：{{ lastUpdate }}</p>-->
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale, t } = useI18n()
const lastUpdate = ref('2024-01-01') // 這會由 GitHub Actions 更新

const toggleLanguage = () => {
  locale.value = locale.value === 'zh' ? 'en' : 'zh'
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
}

.navbar {
  background: #2c3e50;
  color: white;
  padding: 1rem 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
}

.nav-logo {
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
  color: white;
}

.nav-menu {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  color: white;
  text-decoration: none;
  transition: color 0.3s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #3498db;
}

.lang-toggle {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.lang-toggle:hover {
  background: #2980b9;
}

.main-content {
  margin-top: 70px; /* navbar 高度 */
  margin-bottom: 45px; /* footer 高度 - 調整為更小 */
  min-height: calc(100vh - 115px); /* 總高度減去 navbar 和 footer */
}

.footer {
  background: #34495e;
  color: white;
  text-align: center;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.footer p {
  margin: 0.25rem 0;
}

.footer a {
  color: #74b9ff;
  text-decoration: none;
}

.footer a:hover {
  text-decoration: underline;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .nav-container {
    padding: 0 1rem;
  }
  
  .nav-menu {
    gap: 1rem;
  }
  
  .nav-logo {
    font-size: 1.2rem;
  }
}
</style>