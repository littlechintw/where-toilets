<template>
  <div id="app">
    <nav style="background: #2c3e50; color: white; padding: 1rem;">
      <h2>🚽 台灣廁所地圖</h2>
      <router-link to="/" style="color: white; margin-right: 1rem;">首頁</router-link>
      <router-link to="/map" style="color: white;">地圖</router-link>
    </nav>
    
    <main style="min-height: 80vh;">
      <router-view />
    </main>
    
    <footer style="background: #34495e; color: white; text-align: center; padding: 1rem;">
      <p>資料來源：環保署開放資料</p>
    </footer>
  </div>
</template>

<script setup>
// 簡化版本，暫時移除複雜功能
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

a {
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>