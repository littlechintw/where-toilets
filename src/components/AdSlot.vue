<template>
  <div
    v-if="enabled || showDevPlaceholder"
    class="ad-slot"
    :class="{ 'ad-slot-dev': !enabled }"
    role="complementary"
    :aria-label="$t('ads.label')"
  >
    <span class="ad-slot-label" aria-hidden="true">{{ $t('ads.label') }}</span>

    <!-- 固定尺寸單元：不帶 data-ad-format，尺寸由下方 CSS 的 media query 決定，零版面跳動 -->
    <ins
      v-if="enabled"
      ref="insEl"
      class="adsbygoogle ad-slot-unit"
      style="display: inline-block"
      :data-ad-client="ADSENSE_CLIENT"
      :data-ad-slot="slot"
    ></ins>

    <!-- 只有開發模式、且尚未設定 ID 時才會看到的佔位框 -->
    <div v-else class="ad-slot-unit ad-slot-dev-box">
      AdSense 版位「{{ location }}」（尚未設定 ID，正式環境不會顯示）
    </div>
  </div>
</template>

<script setup>
/**
 * 單一 AdSense 固定尺寸版位（低調：小尺寸、放頁底、不固定在螢幕上）。
 *
 * 用法：<AdSlot location="home" :slot="AD_SLOTS.home" />
 * 設定全部在 src/config/ads.js；沒設定時這個元件在正式環境什麼都不渲染。
 */
import { ref, computed, onMounted } from 'vue'
import { ADSENSE_CLIENT, adsEnabled } from '../config/ads'
import { loadAdSense } from '../utils/adsense'

const props = defineProps({
  /** 廣告單元 ID（data-ad-slot） */
  slot: { type: String, default: '' },
  /** 版位名稱，只用於開發佔位框與除錯訊息 */
  location: { type: String, required: true }
})

const enabled = computed(() => adsEnabled(props.slot))
const showDevPlaceholder = import.meta.env.DEV
const insEl = ref(null)

onMounted(async () => {
  if (!enabled.value) return
  try {
    await loadAdSense(ADSENSE_CLIENT)
    // 同一個 <ins> 只能被填一次；路由切換回來會是新的元素，所以每次 mount 都 push 一次即可
    if (!insEl.value || insEl.value.dataset.adsbygoogleStatus) return
    ;(window.adsbygoogle = window.adsbygoogle || []).push({})
  } catch (error) {
    // 多半是廣告阻擋器，靜默即可，不影響任何功能
    console.debug('[ads]', props.location, error?.message || error)
  }
})
</script>

<style scoped>
.ad-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem 0.75rem;
}

.ad-slot-label {
  font-size: 0.66rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--md-sys-color-outline);
}

/* 手機 320×50（最小的標準橫幅），桌機 728×90；高度固定所以不會有版面跳動。
   想要手機大一點可改成 320×100。 */
.ad-slot-unit {
  width: 320px;
  height: 50px;
  max-width: 100%;
}

/* 820 = 728 + 頁面左右 padding 48 + 版位左右 padding 32 再留一點餘裕，確保單元不會被壓成非標準尺寸 */
@media (min-width: 820px) {
  .ad-slot-unit {
    width: 728px;
    height: 90px;
  }
}

/* AdSense 沒有廣告可填（新單元前幾小時、或沒有合適廣告）時會標 data-ad-status="unfilled"，
   整個版位連「廣告」小字一起收起來，不留空白框 */
.ad-slot:has(ins.adsbygoogle[data-ad-status="unfilled"]) {
  display: none;
}

.ad-slot-dev-box {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  text-align: center;
  font-size: 0.74rem;
  line-height: 1.3;
  color: var(--md-sys-color-on-surface-variant);
  background: var(--md-sys-color-surface-container-low);
  border: 1px dashed var(--md-sys-color-outline-variant);
  border-radius: var(--radius-sm);
}
</style>
