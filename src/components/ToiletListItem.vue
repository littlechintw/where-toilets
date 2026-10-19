<template>
  <div class="result-item" :class="{ 'result-item-active': active }">
    <button
      type="button"
      class="result-item-main"
      :aria-pressed="active ? 'true' : undefined"
      @click="$emit('select', toilet)"
    >
      <span class="result-item-row">
        <span class="result-item-name">{{ toilet.name_zh }}</span>
        <span v-if="hasDistance" class="result-item-distance">
          {{ formatDistance(toilet.distance) }}
        </span>
      </span>
      <span class="result-item-address">{{ toilet.address_zh }}</span>
      <span class="result-item-badges">
        <span v-if="toilet.grade_zh" class="badge" :class="gradeClass">
          {{ toilet.grade_zh }}
        </span>
        <span v-if="toilet.type_zh" class="badge badge-soft">{{ toilet.type_zh }}</span>
        <span v-if="hasChangingTable(toilet)" class="badge badge-soft">
          <span class="material-symbols-outlined badge-icon-symbol" aria-hidden="true">baby_changing_station</span>
          {{ $t('map.toiletInfo.diaperBadge') }}
        </span>
      </span>
    </button>
    <button
      type="button"
      class="result-item-nav"
      :aria-label="$t('map.toiletInfo.navigation')"
      :title="$t('map.toiletInfo.navigation')"
      @click="$emit('navigate', toilet)"
    >
      <span class="material-symbols-outlined" aria-hidden="true">directions</span>
    </button>
  </div>
</template>

<script setup>
/**
 * 廁所清單項目（側欄清單、聚合清單、全部清單共用）。
 *
 * 以前是「button 裡面再包一個 role=button 的 span」，這在 HTML 規範裡是不合法的
 * 巢狀互動元素，螢幕閱讀器與鍵盤操作行為會不一致。
 * 現在改成一個容器裡放兩個平行的 button：主要區塊（選取）與導航按鈕。
 */
import { computed } from 'vue'
import { formatDistance } from '../utils/geo'
import { hasChangingTable, getGradeKey } from '../utils/toilet'

const props = defineProps({
  toilet: { type: Object, required: true },
  active: { type: Boolean, default: false }
})

defineEmits(['select', 'navigate'])

const gradeClass = computed(() => {
  const key = getGradeKey(props.toilet)
  return key ? `badge-grade-${key}` : ''
})

const hasDistance = computed(() =>
  typeof props.toilet.distance === 'number' && Number.isFinite(props.toilet.distance)
)
</script>

<style scoped>
/* M3 List Item style */
.result-item {
  display: flex;
  align-items: stretch;
  width: 100%;
  background: var(--md-sys-color-surface);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--radius-md);
  transition: background-color var(--transition), border-color var(--transition);
}

.result-item:hover {
  background: var(--md-sys-color-surface-container-high);
  border-color: var(--md-sys-color-outline);
}

.result-item-active {
  background: var(--md-sys-color-primary-container);
  border-color: var(--md-sys-color-primary);
  box-shadow: 0 0 0 1px var(--md-sys-color-primary) inset;
}

/* 主要可點擊區塊：重設 button 預設樣式，把 padding 放在這裡讓整塊都能點 */
.result-item-main {
  flex: 1;
  min-width: 0;
  display: block;
  padding: 1rem 0.5rem 1rem 1.15rem;
  background: none;
  border: none;
  border-radius: var(--radius-md) 0 0 var(--radius-md);
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.result-item-main:focus-visible {
  outline-offset: -3px;
  border-radius: var(--radius-md);
}

.result-item-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.result-item-name {
  display: block;
  min-width: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--md-sys-color-on-surface);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-item-distance {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--md-sys-color-primary);
  flex-shrink: 0;
}

.result-item-address {
  display: block;
  margin: 0 0 0.5rem 0;
  font-size: 0.82rem;
  color: var(--md-sys-color-on-surface-variant);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-item-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

/* Nav Button in List Item */
.result-item-nav {
  align-self: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin: 0 0.9rem 0 0.25rem;
  border-radius: var(--radius-pill);
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  border: none;
  cursor: pointer;
  transition: all var(--transition);
  flex-shrink: 0;
}

.result-item-nav:hover {
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  transform: scale(1.05);
}

.result-item-nav .material-symbols-outlined {
  font-size: 18px;
}
</style>
