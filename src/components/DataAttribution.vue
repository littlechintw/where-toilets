<template>
  <!-- 政府資料開放授權條款第 1 版「顯名聲明」；格式依條款附件，須保持原文 -->
  <div class="data-attribution">
    <p>提供機關／環境部環境管理署 [{{ year }}] [全國公廁建檔資料{{ updatedDate ? ' ' + updatedDate : '' }}]</p>
    <p>
      此開放資料依政府資料開放授權條款 (Open Government Data License) 進行公眾釋出，使用者於遵守本條款各項規定之前提下，得利用之。
      政府資料開放授權條款：<a href="https://data.gov.tw/licenses" target="_blank" rel="noopener noreferrer">https://data.gov.tw/licenses</a>
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDataMeta } from '../composables/useDataMeta'

const { updatedDate } = useDataMeta()
const year = computed(() => updatedDate.value.slice(0, 4) || new Date().getFullYear())
</script>

<style scoped>
.data-attribution {
  font-size: 0.82rem;
  line-height: 1.6;
  color: var(--md-sys-color-on-surface-variant);
  overflow-wrap: anywhere;
}
.data-attribution p { margin: 0 0 0.4rem; }
.data-attribution a { color: var(--md-sys-color-primary); }
</style>
