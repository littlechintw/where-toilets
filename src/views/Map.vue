<template>
  <div class="map-page">
    <!-- 控制面板 -->
    <div class="control-panel" :class="{ collapsed: isPanelCollapsed }">
      <div class="panel-header">
        <h2><span aria-hidden="true">🚽</span> {{ $t('map.title') }}</h2>
        <button
          @click="isPanelCollapsed = !isPanelCollapsed"
          class="collapse-btn"
          type="button"
          :aria-label="isPanelCollapsed ? $t('a11y.openPanel') : $t('a11y.closePanel')"
          :aria-expanded="(!isPanelCollapsed).toString()"
        >
          <span aria-hidden="true">{{ isPanelCollapsed ? '▶' : '◀' }}</span>
        </button>
      </div>

      <div class="panel-content" v-show="!isPanelCollapsed">
        <!-- 自訂位置搜尋 -->
        <div class="custom-location">
          <h3>{{ $t('map.customLocation.title') }}</h3>
          <div class="location-input">
            <input v-model="customLocationInput" @keyup.enter="searchCustomLocation"
              :placeholder="$t('map.customLocation.placeholder')"
              :aria-label="$t('map.customLocation.title')"
              class="location-search-input">
            <button
              @click="searchCustomLocation"
              class="btn-search"
              type="button"
              :disabled="isSearching"
              :aria-label="$t('a11y.search')"
            >
              <span aria-hidden="true">{{ isSearching ? '🔄' : '🔍' }}</span>
            </button>
          </div>
          <div class="search-tips">
            <small><span aria-hidden="true">💡</span> {{ $t('map.customLocation.searchTip') }}</small>
          </div>
          <div v-if="searchError" class="error-message" role="alert">
            {{ searchError }}
          </div>
        </div>

        <!-- 定位按鈕 -->
        <button
          @click="locateUser"
          class="btn btn-primary"
          type="button"
          :disabled="isLocating"
          :aria-label="$t('a11y.locate')"
        >
          <span v-if="isLocating" aria-hidden="true">🔄</span>
          <span v-else aria-hidden="true">📍</span>
          {{ isLocating ? $t('map.locating') : $t('map.locate') }}
        </button>

        <!-- 篩選器 -->
        <div class="filters">
          <h3>{{ $t('map.filters.title') }}</h3>

          <div class="filter-group">
            <label class="filter-label">{{ $t('map.filters.grade.label') }}</label>
            <div class="chip-row" role="group" :aria-label="$t('map.filters.grade.label')">
              <button
                v-for="opt in gradeOptions"
                :key="opt.value || 'all'"
                type="button"
                class="chip"
                :class="{ 'chip-active': filters.grade === opt.value }"
                :aria-pressed="(filters.grade === opt.value).toString()"
                @click="filters.grade = opt.value"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <div class="filter-group">
            <label class="filter-label">{{ $t('map.filters.type.label') }}</label>
            <div class="chip-row" role="group" :aria-label="$t('map.filters.type.label')">
              <button
                v-for="opt in typeOptions"
                :key="opt.value || 'all'"
                type="button"
                class="chip"
                :class="{ 'chip-active': filters.type === opt.value }"
                :aria-pressed="(filters.type === opt.value).toString()"
                @click="filters.type = opt.value"
              >
                <span v-if="opt.icon" aria-hidden="true">{{ opt.icon }}</span>
                {{ opt.label }}
              </button>
            </div>
          </div>

          <div class="filter-group">
            <button
              type="button"
              class="toggle-row"
              :class="{ 'toggle-active': filters.hasDiaper }"
              :aria-pressed="filters.hasDiaper.toString()"
              @click="filters.hasDiaper = !filters.hasDiaper"
            >
              <span class="toggle-text">
                <span aria-hidden="true">🍼</span> {{ $t('map.filters.diaper') }}
              </span>
              <span class="toggle-switch" aria-hidden="true">
                <span class="toggle-knob"></span>
              </span>
            </button>
          </div>

          <div class="filter-group filter-actions">
            <button
              @click="resetFilters"
              class="btn-reset-link"
              type="button"
              :aria-label="$t('a11y.resetFilters')"
              :disabled="!hasActiveFilters"
            >
              <span aria-hidden="true">↻</span> {{ $t('map.filters.reset') }}
            </button>
          </div>
        </div>

        <!-- 移除效能警告和設定 - 不再限制廁所顯示數量 -->

        <!-- 地圖範圍資訊 
        <div class="map-range-info">
          <h3>🗺️ 地圖範圍資訊</h3>
          <div class="range-stats">
            <div class="stat-item">
              <span class="stat-label">總載入廁所:</span>
              <span class="stat-value">{{ totalLoadedToilets }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">可見範圍內:</span>
              <span class="stat-value">{{ visibleToiletsCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">篩選後顯示:</span>
              <span class="stat-value">{{ filteredToilets.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">地圖標記:</span>
              <span class="stat-value">{{ mapMarkersCount }}</span>
            </div>
          </div>
          <div class="range-explanation">
            <small>
              💡 <strong>說明：</strong><br>
              • <strong>總載入</strong>：從資料庫載入的所有廁所<br>
              • <strong>可見範圍</strong>：地圖視窗內的廁所<br>
              • <strong>篩選後</strong>：套用篩選條件後的廁所<br>
              • <strong>地圖標記</strong>：實際顯示在地圖上的標記數
            </small>
          </div>
        </div>-->

        <!-- 廁所列表 -->
        <div class="toilet-list" v-if="filteredToilets.length > 0">
          <h3>{{ $t('map.toiletList.title') }} ({{ filteredToilets.length }})</h3>

          <!-- 控制面板列表（與彈窗共用同一套 result-item 樣式） -->
          <div class="result-list result-list-inline">
            <button
              v-for="toilet in displayedToilets"
              :key="toilet.id"
              type="button"
              class="result-item"
              :class="{ 'result-item-active': selectedToilet?.id === toilet.id }"
              @click="focusToilet(toilet)"
            >
              <div class="result-item-main">
                <div class="result-item-row">
                  <h4 class="result-item-name">{{ toilet.name_zh }}</h4>
                  <span v-if="toilet.distance" class="result-item-distance">
                    {{ formatDistance(toilet.distance) }}
                  </span>
                </div>
                <p class="result-item-address">{{ toilet.address_zh }}</p>
                <div class="result-item-badges">
                  <span
                    v-if="toilet.grade_zh"
                    class="badge"
                    :class="`badge-grade-${(toilet.grade || '').toLowerCase()}`"
                  >
                    {{ toilet.grade_zh }}
                  </span>
                  <span v-if="toilet.type_zh" class="badge badge-soft">{{ toilet.type_zh }}</span>
                  <span v-if="hasChangingTable(toilet)" class="badge badge-soft">
                    <span aria-hidden="true">🍼</span> {{ $t('map.toiletInfo.diaperBadge') }}
                  </span>
                </div>
              </div>
              <span
                class="result-item-nav"
                role="button"
                tabindex="0"
                :aria-label="$t('map.toiletInfo.navigation')"
                @click.stop="openNavigation(toilet)"
                @keydown.enter.stop="openNavigation(toilet)"
                @keydown.space.stop.prevent="openNavigation(toilet)"
              >
                <span aria-hidden="true">🧭</span>
              </span>
            </button>
          </div>

          <!-- 查看全部按鈕（當有更多項目時顯示） -->
          <div class="view-all-btn-container" v-if="filteredToilets.length > displayLimit">
            <button @click="showAllToiletsList = true" class="btn-view-all">
              {{ $t('map.toiletList.viewAllN', { count: filteredToilets.length }) }}
            </button>
          </div>

          <!-- 移除效能提示 - 不再限制顯示模式 -->
        </div>

        <div v-else-if="!isLoading && filteredToilets.length === 0" class="no-data">
          <div class="empty-icon" aria-hidden="true">📍</div>
          <p>{{ userLocation ? $t('map.toiletList.noData') : $t('map.toiletList.needLocation') }}</p>
        </div>

        <!-- 載入中：用 skeleton 卡片預覽，比純 spinner 感受更好 -->
        <div v-if="isLoading" class="skeleton-list" :aria-label="$t('common.loading')" aria-busy="true">
          <div v-for="n in 4" :key="n" class="skeleton-card">
            <div class="skeleton skeleton-line w-70"></div>
            <div class="skeleton skeleton-line w-90"></div>
            <div class="skeleton-row">
              <div class="skeleton skeleton-pill"></div>
              <div class="skeleton skeleton-pill"></div>
            </div>
          </div>
          <p class="skeleton-status" v-if="loadingStatus">{{ loadingStatus }}</p>
        </div>
      </div>
    </div>

    <!-- 地圖容器 -->
    <div class="map-container">
      <div id="map" ref="mapContainer"></div>

      <!-- 地圖控制 -->
      <div class="map-controls">
        <button
          @click="locateUser"
          class="map-control-btn"
          type="button"
          :disabled="isLocating"
          :aria-label="$t('a11y.locate')"
          :title="$t('a11y.locate')"
        >
          <span aria-hidden="true">{{ isLocating ? '⏳' : '📍' }}</span>
        </button>
      </div>
    </div>

    <!-- 聚合廁所列表彈窗 -->
    <div
      v-if="showClusterList"
      class="toilet-modal"
      role="dialog"
      aria-modal="true"
      :aria-label="$t('map.toiletList.cluster.title')"
      @click="closeClusterModal"
    >
      <div class="modal-content modal-content-v2 cluster-modal" @click.stop>
        <button
          @click="closeClusterModal"
          class="close-btn"
          type="button"
          :aria-label="$t('common.close')"
        >
          <span aria-hidden="true">✕</span>
        </button>

        <header class="modal-header">
          <h3 class="modal-title">
            <span aria-hidden="true">📍</span>
            {{ $t('map.toiletList.cluster.title') }}
          </h3>
          <p class="modal-subtitle">
            {{ $t('map.toiletList.cluster.summary', { count: clusteredToilets.length }) }}
          </p>
        </header>

        <div class="result-list">
          <button
            v-for="toilet in clusteredToilets"
            :key="toilet.id"
            type="button"
            class="result-item"
            @click="selectClusterToilet(toilet)"
          >
            <div class="result-item-main">
              <div class="result-item-row">
                <h4 class="result-item-name">{{ toilet.name_zh }}</h4>
                <span v-if="toilet.distance" class="result-item-distance">
                  {{ formatDistance(toilet.distance) }}
                </span>
              </div>
              <p class="result-item-address">{{ toilet.address_zh }}</p>
              <div class="result-item-badges">
                <span
                  v-if="toilet.grade_zh"
                  class="badge"
                  :class="`badge-grade-${(toilet.grade || '').toLowerCase()}`"
                >
                  {{ toilet.grade_zh }}
                </span>
                <span v-if="toilet.type_zh" class="badge badge-soft">{{ toilet.type_zh }}</span>
                <span v-if="hasChangingTable(toilet)" class="badge badge-soft">
                  <span aria-hidden="true">🍼</span> {{ $t('map.toiletInfo.diaperBadge') }}
                </span>
              </div>
            </div>
            <span
              class="result-item-nav"
              role="button"
              tabindex="0"
              :aria-label="$t('map.toiletInfo.navigation')"
              @click.stop="openNavigation(toilet)"
              @keydown.enter.stop="openNavigation(toilet)"
              @keydown.space.stop.prevent="openNavigation(toilet)"
            >
              <span aria-hidden="true">🧭</span>
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- 全部廁所列表彈窗（與聚合彈窗共用同一套樣式） -->
    <div
      v-if="showAllToiletsList"
      class="toilet-modal"
      role="dialog"
      aria-modal="true"
      :aria-label="$t('map.toiletList.title')"
      @click="closeAllToiletsModal"
    >
      <div class="modal-content modal-content-v2 all-toilets-modal" @click.stop>
        <button
          @click="closeAllToiletsModal"
          class="close-btn"
          type="button"
          :aria-label="$t('common.close')"
        >
          <span aria-hidden="true">✕</span>
        </button>

        <header class="modal-header">
          <h3 class="modal-title">
            <span aria-hidden="true">🗺️</span>
            {{ $t('map.toiletList.title') }}
          </h3>
          <p class="modal-subtitle">
            {{ $t('map.toiletList.cluster.summary', { count: filteredToilets.length }) }}
          </p>
        </header>

        <div class="result-list">
          <button
            v-for="toilet in filteredToilets"
            :key="toilet.id"
            type="button"
            class="result-item"
            @click="selectToiletFromList(toilet)"
          >
            <div class="result-item-main">
              <div class="result-item-row">
                <h4 class="result-item-name">{{ toilet.name_zh }}</h4>
                <span v-if="toilet.distance" class="result-item-distance">
                  {{ formatDistance(toilet.distance) }}
                </span>
              </div>
              <p class="result-item-address">{{ toilet.address_zh }}</p>
              <div class="result-item-badges">
                <span
                  v-if="toilet.grade_zh"
                  class="badge"
                  :class="`badge-grade-${(toilet.grade || '').toLowerCase()}`"
                >
                  {{ toilet.grade_zh }}
                </span>
                <span v-if="toilet.type_zh" class="badge badge-soft">{{ toilet.type_zh }}</span>
                <span v-if="hasChangingTable(toilet)" class="badge badge-soft">
                  <span aria-hidden="true">🍼</span> {{ $t('map.toiletInfo.diaperBadge') }}
                </span>
              </div>
            </div>
            <span
              class="result-item-nav"
              role="button"
              tabindex="0"
              :aria-label="$t('map.toiletInfo.navigation')"
              @click.stop="openNavigation(toilet)"
              @keydown.enter.stop="openNavigation(toilet)"
              @keydown.space.stop.prevent="openNavigation(toilet)"
            >
              <span aria-hidden="true">🧭</span>
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- 廁所詳情彈窗 -->
    <div
      v-if="selectedToilet"
      class="toilet-modal"
      role="dialog"
      aria-modal="true"
      :aria-label="selectedToilet.name_zh"
      @click="closeModal"
    >
      <div class="modal-content modal-content-v2" @click.stop>
        <button
          @click="closeModal"
          class="close-btn"
          type="button"
          :aria-label="$t('common.close')"
        >
          <span aria-hidden="true">✕</span>
        </button>

        <header class="modal-header">
          <h3 class="modal-title">{{ selectedToilet.name_zh }}</h3>
          <div class="modal-badges">
            <span
              v-if="selectedToilet.grade_zh"
              class="badge"
              :class="`badge-grade-${(selectedToilet.grade || '').toLowerCase()}`"
            >
              {{ selectedToilet.grade_zh }}
            </span>
            <span v-if="selectedToilet.type_zh" class="badge badge-soft">
              {{ selectedToilet.type_zh }}
            </span>
            <span v-if="hasChangingTable(selectedToilet)" class="badge badge-soft">
              <span aria-hidden="true">🍼</span> {{ $t('map.filters.diaper') }}
            </span>
          </div>
        </header>

        <div v-if="selectedToilet.distance" class="distance-callout">
          <span aria-hidden="true">📏</span>
          <span class="distance-value">{{ formatDistance(selectedToilet.distance) }}</span>
          <span class="distance-label">{{ $t('map.toiletInfo.distance') }}</span>
        </div>

        <dl class="modal-info">
          <div class="info-row">
            <dt><span aria-hidden="true">📍</span> {{ $t('map.toiletInfo.address') }}</dt>
            <dd>{{ selectedToilet.address_zh }}</dd>
          </div>
          <div class="info-row" v-if="selectedToilet.category_zh">
            <dt><span aria-hidden="true">🏷️</span> {{ $t('map.toiletInfo.category') }}</dt>
            <dd>{{ selectedToilet.category_zh }}</dd>
          </div>
          <div class="info-row" v-if="selectedToilet.manager">
            <dt><span aria-hidden="true">🏢</span> {{ $t('map.toiletInfo.manager') }}</dt>
            <dd>{{ selectedToilet.manager }}</dd>
          </div>
        </dl>

        <div class="modal-actions">
          <button
            @click="openNavigation(selectedToilet)"
            class="btn-nav-primary"
            type="button"
          >
            <span aria-hidden="true">🧭</span> {{ $t('map.toiletInfo.navigation') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import L from 'leaflet'
import { getUserLocation, findNearestToilets, detectUserCounty, getNearbyCounties, formatDistance, sanitizeBounds } from '../utils/geo'
import { trackEvent } from '../utils/analytics'
import { hasChangingTable, toToiletEventParams } from '../utils/toilet'
import { geocodeAddress, tryParseTwCoordinate } from '../composables/useGeocoding'
import { useTheme } from '../composables/useTheme'

const { resolved: themeResolved } = useTheme()

const { t } = useI18n()

// 響應式變數
const mapContainer = ref(null)
const map = ref(null)
const userLocation = ref(null)
const userMarker = ref(null)
const centerMarker = ref(null) // 中心點拖曳標記
const toiletMarkers = ref([])
const nearbyToilets = ref([])
const selectedToilet = ref(null)
const clusteredToilets = ref([]) // 聚合廁所列表
const showClusterList = ref(false) // 顯示聚合列表
const showAllToiletsList = ref(false) // 顯示所有廁所列表彈窗
const displayLimit = ref(5) // 預設顯示數量
const counties = ref([])
const currentCounty = ref(null)
const isLoading = ref(false)
const isLocating = ref(false)
const isPanelCollapsed = ref(false)

// 載入狀態
const loadingStatus = ref('')

// 地圖範圍統計
const totalLoadedToilets = ref(0) // 總載入廁所數量
const visibleToiletsCount = ref(0) // 可見範圍內廁所數量  
const mapMarkersCount = ref(0) // 地圖標記數量

// 移除效能限制 - 不再根據縮放層級限制廁所數量

// 自訂位置搜尋
const customLocationInput = ref('')
const isSearching = ref(false)
const searchError = ref('')
// (使用說明已移至 /settings 頁面)
// (已移除) showPerformanceSettings

// 更新延遲計時器
let updateTimeout = null
// 用來標記非同步載入請求，避免舊的結果覆蓋新的畫面狀態
let currentUpdateRequestId = 0

// 篩選器
const filters = ref({
  grade: '',
  type: '',
  hasDiaper: false
})

// 篩選器選項（chip-style UI 用）。空字串代表「全部」。
const gradeOptions = computed(() => [
  { value: '', label: t('map.filters.grade.all') },
  { value: '特優', label: t('map.filters.grade.excellent') },
  { value: '優等', label: t('map.filters.grade.good') },
  { value: '普通', label: t('map.filters.grade.fair') },
  { value: '加強', label: t('map.filters.grade.needsImprovement') },
  { value: '不合格', label: t('map.filters.grade.fail') }
])

const typeOptions = computed(() => [
  { value: '', label: t('map.filters.type.all') },
  { value: '男', label: t('map.filters.type.male'), icon: '🚹' },
  { value: '女', label: t('map.filters.type.female'), icon: '🚺' },
  { value: '男女', label: t('map.filters.type.mixed'), icon: '🚻' },
  { value: '無障礙', label: t('map.filters.type.accessible'), icon: '♿' },
  { value: '親子', label: t('map.filters.type.family'), icon: '👶' }
])

const hasActiveFilters = computed(() =>
  Boolean(filters.value.grade) ||
  Boolean(filters.value.type) ||
  filters.value.hasDiaper
)

// 計算過濾後的廁所
const filteredToilets = computed(() => {
  console.log('開始篩選, 原始廁所數量:', nearbyToilets.value.length)
  console.log('篩選條件:', filters.value)

  if (nearbyToilets.value.length > 0) {
    console.log('第一個廁所範例:', nearbyToilets.value[0])
  }

  const filtered = nearbyToilets.value.filter(toilet => {
    // 等級篩選 - 使用包含匹配而不是完全匹配
    if (filters.value.grade) {
      const toiletGrade = toilet.grade || toilet.level || toilet.rating || ''
      const gradeMatch = toiletGrade.includes(filters.value.grade) ||
        filters.value.grade.includes(toiletGrade) ||
        toiletGrade === filters.value.grade
      if (!gradeMatch) {
        console.log('等級篩選失敗:', toiletGrade, 'vs', filters.value.grade)
        return false
      }
    }

    // 類型篩選 - 根據名稱和類型欄位智慧判斷
    if (filters.value.type) {
      const toiletType = toilet.type || toilet.toilet_type || toilet.category || ''
      const toiletName = toilet.name_zh || toilet.name || ''

      let typeMatch = false

      // 根據篩選條件檢查
      if (filters.value.type === '女') {
        typeMatch = toiletName.includes('女') ||
          toiletType === 'female' ||
          toiletType.includes('female')
      } else if (filters.value.type === '男') {
        typeMatch = toiletName.includes('男') ||
          toiletType === 'male' ||
          toiletType.includes('male')
      } else if (filters.value.type === '男女') {
        typeMatch = (toiletName.includes('男') && toiletName.includes('女')) ||
          toiletType === 'mixed' ||
          toiletType === 'unisex' ||
          toiletType.includes('mixed')
      } else if (filters.value.type === '無障礙') {
        typeMatch = toiletName.includes('無障礙') ||
          toiletName.includes('身障') ||
          toiletType === 'accessible' ||
          toiletType.includes('accessible')
      } else if (filters.value.type === '親子') {
        typeMatch = toiletName.includes('親子') ||
          toiletName.includes('育嬰') ||
          toiletName.includes('baby') ||
          toiletType === 'family' ||
          toiletType.includes('family')
      } else {
        // 一般包含匹配
        typeMatch = toiletType.includes(filters.value.type) ||
          filters.value.type.includes(toiletType) ||
          toiletName.includes(filters.value.type)
      }

      if (!typeMatch) {
        console.log('類型篩選失敗:', toiletType, 'name:', toiletName, 'vs', filters.value.type)
        return false
      }
    }

    // 尿布台篩選 - 使用智慧判斷函數
    if (filters.value.hasDiaper) {
      if (!hasChangingTable(toilet)) {
        console.log('尿布台篩選失敗 - 智慧判斷結果為無尿布台')
        return false
      }
    }

    return true
  })

  // 依距離由近到遠排序：
  //   - 有 distance 的廁所優先顯示，距離小的在前
  //   - 沒有 distance 的（例如尚未定位）放最後，依原順序
  const sorted = filtered.slice().sort((a, b) => {
    const da = typeof a.distance === 'number' ? a.distance : Number.POSITIVE_INFINITY
    const db = typeof b.distance === 'number' ? b.distance : Number.POSITIVE_INFINITY
    return da - db
  })

  console.log('篩選後廁所數量:', sorted.length)
  return sorted
})

// 計算顯示用的廁所列表（虛擬化列表）
const virtualListSettings = ref({
  itemHeight: 120, // 每個項目的高度(px)
  containerHeight: 400, // 容器高度(px)
  visibleCount: 0, // 可見項目數量
  startIndex: 0, // 開始索引
  endIndex: 0, // 結束索引
  scrollTop: 0 // 滾動位置
})

// 計算虛擬列表參數
const calculateVirtualList = () => {
  const { itemHeight, containerHeight } = virtualListSettings.value
  const visibleCount = Math.ceil(containerHeight / itemHeight) + 2 // 多渲染2個作為緩衝
  const startIndex = Math.floor(virtualListSettings.value.scrollTop / itemHeight)
  const endIndex = Math.min(startIndex + visibleCount, filteredToilets.value.length)

  virtualListSettings.value.visibleCount = visibleCount
  virtualListSettings.value.startIndex = Math.max(0, startIndex)
  virtualListSettings.value.endIndex = endIndex
}

// 虛擬列表顯示項目
const virtualizedToilets = computed(() => {
  // 虛擬列表只在大量項目時使用，此時應該顯示所有項目（用於modal）
  calculateVirtualList()
  return filteredToilets.value.slice(
    virtualListSettings.value.startIndex,
    virtualListSettings.value.endIndex
  )
})

// 虛擬列表容器樣式
const virtualListStyles = computed(() => ({
  height: `${virtualListSettings.value.containerHeight}px`,
  overflow: 'auto'
}))

// 虛擬列表項目容器樣式
const virtualItemsContainerStyles = computed(() => ({
  height: `${filteredToilets.value.length * virtualListSettings.value.itemHeight}px`,
  position: 'relative'
}))

// 虛擬列表項目樣式
const getVirtualItemStyles = (index) => ({
  position: 'absolute',
  top: `${(virtualListSettings.value.startIndex + index) * virtualListSettings.value.itemHeight}px`,
  width: '100%',
  height: `${virtualListSettings.value.itemHeight}px`
})

// 處理虛擬列表滾動
const onVirtualListScroll = (event) => {
  virtualListSettings.value.scrollTop = event.target.scrollTop
  calculateVirtualList()
}

// 計算顯示用的廁所列表（限制數量版本，用於非虛擬化場景）
const displayedToilets = computed(() => {
  // 控制面板預設只顯示前5個
  return filteredToilets.value.slice(0, displayLimit.value)
})

// 地圖瓦片：固定使用 OSM 原圖；深色模式用 CSS filter 反轉（道路變亮、背景變暗，
// 不會像 Dark Matter 那樣連街道都看不見）。詳見 .leaflet-tile-pane filter。
let tileLayer = null

const applyTileLayer = () => {
  if (!map.value || tileLayer) return
  tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  })
  tileLayer.addTo(map.value)
}

// 初始化地圖
const initMap = () => {
  // 統一使用 zoom 16 作為標準找廁所層級
  map.value = L.map(mapContainer.value).setView([23.8, 121], 12)

  applyTileLayer()

  // 建立可拖曳的中心標記，初始位置在台北，使用標準縮放層級
  createCenterMarker([25.0330, 121.5654])

  // 地圖點擊事件
  map.value.on('click', () => {
    selectedToilet.value = null
  })

  // 縮放或移動改變時重新載入廁所
  map.value.on('zoomend moveend', () => {
    // 延遲更新廁所列表以避免過於頻繁的請求
    clearTimeout(updateTimeout)
    updateTimeout = setTimeout(updateNearbyToilets, 500)
  })

  // 移除地圖移動和縮放的自動更新事件
}

// 建立中心點可拖曳標記
const createCenterMarker = (position) => {
  centerMarker.value = L.marker(position, {
    draggable: true,
    icon: L.divIcon({
      className: 'center-marker',
      html: '📍',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    })
  }).addTo(map.value)

  // 立即將地圖移動到台北並放大到實用層級
  map.value.setView(position, 16)

  // 拖曳結束事件
  centerMarker.value.on('dragend', async () => {
    const position = centerMarker.value.getLatLng()
    userLocation.value = [position.lat, position.lng]

    // 拖曳時只更新位置，不改變縮放層級
    // 移除自動縮放，讓用戶控制縮放

    // 自動載入該位置的附近廁所
    await updateNearbyToilets()
  })

  // 設定初始搜尋位置
  userLocation.value = position
}

// 更新中心標記位置（移除自動跟隨地圖中心的功能）
const updateCenterMarker = () => {
  // 移除這個功能，讓用戶手動控制大頭針位置
}

// 載入縣市索引
const loadCounties = async () => {
  try {
    const response = await fetch('./data/index.json')
    if (response.ok) {
      const data = await response.json()
      counties.value = data.counties || []
    }
  } catch (error) {
    console.error('載入縣市資料失敗:', error)
  }
}

// 緩存已載入的縣市資料
const countyDataCache = new Map()

// 載入廁所資料
const loadToiletData = async (countyList) => {
  const allToilets = []

  for (const county of countyList) {
    try {
      // 檢查緩存
      if (countyDataCache.has(county.filename)) {
        // console.info('loadToiletData - using cache:', county.filename)
        allToilets.push(...countyDataCache.get(county.filename))
        continue
      }

      console.info('loadToiletData - fetching:', county.filename)
      const response = await fetch(`./data/counties/${county.filename}`)
      if (response.ok) {
        const toilets = await response.json()
        // 存入緩存
        countyDataCache.set(county.filename, toilets)
        allToilets.push(...toilets)
      }
      else {
        console.warn('loadToiletData - fetch failed for', county.filename, 'status', response.status)
      }
    } catch (error) {
      console.warn(`載入 ${county.name_zh} 資料失敗:`, error)
    }
  }

  return allToilets
}

/**
 * 使用者定位
 * @param {object} opts
 * @param {boolean} opts.silent  失敗時不要彈出 alert（適合自動定位情境）
 * @returns {Promise<boolean>}   是否成功
 */
const locateUser = async (opts = {}) => {
  const { silent = false } = opts
  isLocating.value = true
  trackEvent('locate_me', { stage: 'start', source: silent ? 'auto' : 'manual' })

  try {
    const location = await getUserLocation()

    // 統一使用 zoom 16，找廁所的最佳層級
    map.value.setView(location, 16)
    centerMarker.value.setLatLng(location)
    userLocation.value = location

    // 移除舊的使用者標記（如果存在）
    if (userMarker.value) {
      map.value.removeLayer(userMarker.value)
      userMarker.value = null
    }

    // 載入附近廁所
    await updateNearbyToilets()
    trackEvent('locate_me', { stage: 'success', source: silent ? 'auto' : 'manual' })
    return true

  } catch (error) {
    trackEvent('locate_me', {
      stage: 'fail',
      source: silent ? 'auto' : 'manual',
      message: String(error?.message || error)
    })
    if (!silent) {
      alert(`${t('map.errors.locationFailed')}: ${error.message}`)
    } else {
      console.info('自動定位未通過，使用預設視野', error.message)
    }
    return false
  } finally {
    isLocating.value = false
  }
}

// 搜尋自訂位置
const searchCustomLocation = async () => {
  if (!customLocationInput.value.trim()) return

  isSearching.value = true
  searchError.value = ''
  const _searchType = /^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/.test(customLocationInput.value.trim())
    ? 'coordinate'
    : 'address'
  trackEvent('search_location', { stage: 'start', type: _searchType })

  try {
    let location = null
    const input = customLocationInput.value.trim()

    // 嘗試解析為「緯度,經度」座標，否則走地址 geocode
    const parsed = tryParseTwCoordinate(input)
    if (Array.isArray(parsed)) {
      location = parsed
    } else if (parsed && parsed.outOfRange) {
      throw new Error(t('map.customLocation.errorOutOfRange'))
    } else {
      location = await geocodeAddress(input, {
        notFoundMessage: t('map.customLocation.errorNotFound'),
        serviceMessage: t('map.customLocation.errorService')
      })
    }

    if (location) {
      // 設定為新的搜尋位置
      userLocation.value = location

      // 統一使用 zoom 16
      map.value.setView(location, 16)
      centerMarker.value.setLatLng(location)

      // 移除舊的使用者標記（如果存在）
      if (userMarker.value) {
        map.value.removeLayer(userMarker.value)
        userMarker.value = null
      }

      // 載入附近廁所
      await updateNearbyToilets()

      // 清空搜尋框
      customLocationInput.value = ''
      trackEvent('search_location', { stage: 'success', type: _searchType })
    }

  } catch (error) {
    searchError.value = error.message || '搜尋失敗，請檢查輸入格式'
    trackEvent('search_location', { stage: 'fail', type: _searchType, message: String(error?.message || error) })
  } finally {
    isSearching.value = false
  }
}

// geocodeAddress 已抽到 src/composables/useGeocoding.js

// 更新地圖範圍內的廁所
const updateNearbyToilets = async () => {
  if (!map.value || counties.value.length === 0) return

  isLoading.value = true
  loadingStatus.value = t('map.loading.detectingCounty')
  const loadingStartTime = Date.now()

  try {
    // 取得地圖可見範圍與中心，搜尋依據目前畫面（map center & bounds）
    const bounds = map.value.getBounds()
    const center = map.value.getCenter()

    // 判斷地圖中心所在縣市
    currentCounty.value = detectUserCounty([center.lat, center.lng], counties.value)
    console.info('updateNearbyToilets center:', { lat: center.lat, lng: center.lng }, 'currentCounty:', currentCounty.value)
    loadingStatus.value = t('map.loading.loadingCounty', {
      county: currentCounty.value || t('map.loading.nearby')
    })

    // 找出與當前地圖 bounds 有交集的縣市
    const overlappingCounties = counties.value.filter(c => {
      const cb = sanitizeBounds(c.bounds)
      
      // 增加緩衝區 (約 5km ~ 0.05度)，解決邊界縫隙問題
      // 避免因為資料點不足導致的邊界空白區域無法載入正確縣市
      const buffer = 0.05 
      const countyMinLat = cb.minLat - buffer
      const countyMaxLat = cb.maxLat + buffer
      const countyMinLng = cb.minLng - buffer
      const countyMaxLng = cb.maxLng + buffer

      // map bounds
      const mapSouth = bounds.getSouth()
      const mapNorth = bounds.getNorth()
      const mapWest = bounds.getWest()
      const mapEast = bounds.getEast()

      // 判斷矩形是否相交
      const latOverlap = !(countyMaxLat < mapSouth || countyMinLat > mapNorth)
      const lngOverlap = !(countyMaxLng < mapWest || countyMinLng > mapEast)
      return latOverlap && lngOverlap
    })

    let countiesData = []
    
    if (overlappingCounties.length > 0) {
      // 優先使用與地圖範圍重疊的所有縣市
      countiesData = overlappingCounties
      console.info('Using overlapping counties:', countiesData.map(c => c.name_en))
    } else {
      // 回退機制：如果找不到重疊的縣市（例如縮放層級過大或資料問題），
      // 使用中心點所在縣市及其鄰近縣市
      const countiesToLoad = [currentCounty.value]
      if (currentCounty.value) {
        const nearbyCounties = getNearbyCounties(currentCounty.value, counties.value, [center.lat, center.lng])
        countiesToLoad.push(...nearbyCounties.slice(0, 2).map(c => c.name_en))
        countiesData = counties.value.filter(c => countiesToLoad.includes(c.name_en))
      }
      
      // 如果還是沒有，使用距離最近的縣市
      if (countiesData.length === 0) {
        const centerLat = center.lat
        const centerLng = center.lng
        const scored = counties.value.map(c => {
          const sb = sanitizeBounds(c.bounds)
          const cLat = (sb.minLat + sb.maxLat) / 2
          const cLng = (sb.minLng + sb.maxLng) / 2
          const dist = calculateDistance(centerLat, centerLng, cLat, cLng)
          return { county: c, dist }
        }).sort((a, b) => a.dist - b.dist)

        countiesData = scored.slice(0, 3).map(s => s.county)
      }
    }
    console.info('countiesData to load:', countiesData.map(c => ({ name_en: c.name_en, filename: c.filename })))

    loadingStatus.value = t('map.loading.processing')

    // 每次更新都增加 requestId，接收結果時檢查是否為最後一次請求，避免 race condition
    const thisRequestId = ++currentUpdateRequestId

    // 載入廁所資料
    const toilets = await loadToiletData(countiesData)

    // 如果在等待資料期間已有更新請求發出，放棄使用這次舊的結果
    if (thisRequestId !== currentUpdateRequestId) {
      console.info('updateNearbyToilets - 遺失的舊請求結果已被忽略', { thisRequestId, currentUpdateRequestId })
      return
    }
    totalLoadedToilets.value = toilets.length

    // 篩選地圖可見範圍內的廁所
    const visibleToilets = toilets.filter(toilet => {
      return bounds.contains([toilet.latitude, toilet.longitude])
    })

    visibleToiletsCount.value = visibleToilets.length

    console.log(`載入了 ${toilets.length} 個廁所，可見範圍內有 ${visibleToilets.length} 個`)

    // 不再需要效能警告 - 顯示所有廁所
    loadingStatus.value = t('map.loading.processingToilets')

    // 移除智慧限制 - 顯示地圖範圍內的所有廁所
    let finalToilets = visibleToilets

    // 如果有用戶位置，計算距離並排序，否則按名稱排序
    if (userLocation.value && !finalToilets[0]?.distance) {
      finalToilets.forEach(toilet => {
        toilet.distance = calculateDistance(
          userLocation.value[0],
          userLocation.value[1],
          toilet.latitude,
          toilet.longitude
        )
      })
      finalToilets.sort((a, b) => a.distance - b.distance)
    } else if (!userLocation.value) {
      finalToilets.sort((a, b) => (a.name_zh || a.name || '').localeCompare(b.name_zh || b.name || ''))
    }

    nearbyToilets.value = finalToilets

    // 更新地圖標記
    updateMapMarkers()

    // 載入時間分析（僅記錄，不再顯示警告）
    const loadingTime = Date.now() - loadingStartTime
    console.log(`資料載入完成，耗時：${loadingTime}ms`)

    loadingStatus.value = t('map.loading.done')

  } catch (error) {
    console.error('更新地圖範圍廁所失敗:', error)
    loadingStatus.value = t('map.loading.failed')
    // 移除自動重試機制 - 避免無限循環
  } finally {
    isLoading.value = false
    setTimeout(() => {
      loadingStatus.value = ''
    }, 1000)
  }
}

// 計算兩點間距離（公里）
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371 // 地球半徑（公里）
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// 更新地圖標記 - 智能聚合以優化渲染效能
const updateMapMarkers = () => {
  // 清除現有標記
  toiletMarkers.value.forEach(marker => map.value.removeLayer(marker))
  toiletMarkers.value = []

  if (filteredToilets.value.length === 0) {
    mapMarkersCount.value = 0
    return
  }

  const toiletCount = filteredToilets.value.length
  const currentZoom = map.value.getZoom()

  // 根據縮放層級和廁所密度動態決定聚合距離
  let baseClusterDistance = 30
  if (currentZoom >= 18) {
    baseClusterDistance = 12 // 極高縮放：最小聚合
  } else if (currentZoom >= 17) {
    baseClusterDistance = 18 // 很高縮放：減少聚合
  } else if (currentZoom >= 16) {
    baseClusterDistance = 25 // 高縮放：適度聚合
  } else if (currentZoom >= 15) {
    baseClusterDistance = 35 // 中高縮放
  } else if (currentZoom >= 14) {
    baseClusterDistance = 45 // 中縮放
  } else if (currentZoom >= 13) {
    baseClusterDistance = 60 // 中低縮放
  } else if (currentZoom >= 12) {
    baseClusterDistance = 80 // 低縮放
  } else {
    baseClusterDistance = 100 // 極低縮放：最大聚合
  }

  // 根據廁所密度動態調整聚合距離
  const density = toiletCount / 1000 // 每1000個廁所為基準
  const densityFactor = Math.min(2, Math.max(0.5, 1 + density * 0.3)) // 密度係數 0.5-2
  const clusterDistance = baseClusterDistance * densityFactor

  console.log(`標記更新: ${toiletCount} 個廁所, zoom: ${currentZoom}, 聚合距離: ${clusterDistance}px`)

  // 執行智能聚合
  const clusters = createToiletClusters(filteredToilets.value, clusterDistance, currentZoom)

  // 渲染聚合結果
  clusters.forEach(cluster => {
    if (cluster.toilets.length === 1) {
      // 單個廁所，顯示普通標記
      createSingleToiletMarker(cluster.toilets[0])
    } else {
      // 多個廁所，顯示聚合標記
      createClusterMarker(cluster)
    }
  })

  // 更新標記數量統計
  mapMarkersCount.value = toiletMarkers.value.length
  console.log(`實際渲染標記數: ${mapMarkersCount.value}, 聚合數: ${clusters.length}`)
}

// 移除聚合標記函數 - 不再使用

// 建立單個廁所標記
const createSingleToiletMarker = (toilet) => {
  const marker = L.marker([toilet.latitude, toilet.longitude], {
    icon: L.divIcon({
      className: `toilet-marker grade-${toilet.grade}`,
      html: getToiletIcon(toilet),
      iconSize: [25, 25],
      iconAnchor: [12, 12]
    })
  })

  marker.on('click', () => {
    selectedToilet.value = toilet
  })

  marker.addTo(map.value)
  toiletMarkers.value.push(marker)
}

// 建立聚合標記 - 動態大小和顏色
const createClusterMarker = (cluster) => {
  const count = cluster.toilets.length
  const center = cluster.center

  // 根據聚合數量決定標記大小和顏色
  let iconSize = 40
  let fontSize = 14
  let bgGradient = 'linear-gradient(135deg, #007bff, #0056b3)'

  if (count >= 100) {
    iconSize = 60
    fontSize = 16
    bgGradient = 'linear-gradient(135deg, #dc3545, #c82333)' // 紅色：超大聚合
  } else if (count >= 50) {
    iconSize = 55
    fontSize = 15
    bgGradient = 'linear-gradient(135deg, #fd7e14, #e8590c)' // 橙色：大聚合
  } else if (count >= 20) {
    iconSize = 50
    fontSize = 14
    bgGradient = 'linear-gradient(135deg, #ffc107, #e0a800)' // 黃色：中聚合
  } else if (count >= 10) {
    iconSize = 45
    fontSize = 14
    bgGradient = 'linear-gradient(135deg, #28a745, #1e7e34)' // 綠色：小聚合
  } else {
    iconSize = 40
    fontSize = 13
    bgGradient = 'linear-gradient(135deg, #007bff, #0056b3)' // 藍色：微聚合
  }

  const marker = L.marker([center.lat, center.lng], {
    icon: L.divIcon({
      className: 'cluster-marker',
      html: `
        <div class="cluster-icon" style="
          background: ${bgGradient} !important; 
          width: ${iconSize}px !important; 
          height: ${iconSize}px !important;
        ">
          <span class="cluster-count" style="font-size: ${fontSize}px !important;">${count}</span>
          <span class="cluster-emoji" style="font-size: ${Math.max(10, fontSize - 2)}px !important;">🚽</span>
        </div>
      `,
      iconSize: [iconSize, iconSize],
      iconAnchor: [iconSize / 2, iconSize / 2]
    })
  })

  marker.on('click', () => {
    showClusterModal(cluster.toilets)
  })

  marker.addTo(map.value)
  toiletMarkers.value.push(marker)
}

// 智能廁所聚合算法 - 多輪動態聚合優化
const createToiletClusters = (toilets, pixelDistance, currentZoom) => {
  let clusters = []
  const processed = new Set()

  // 第一輪：基礎聚合
  toilets.forEach((toilet, index) => {
    if (processed.has(index)) return

    const cluster = {
      toilets: [toilet],
      center: { lat: toilet.latitude, lng: toilet.longitude }
    }

    // 尋找附近的廁所進行聚合
    for (let i = index + 1; i < toilets.length; i++) {
      if (processed.has(i)) continue

      const other = toilets[i]
      const distance = calculatePixelDistance(
        { lat: toilet.latitude, lng: toilet.longitude },
        { lat: other.latitude, lng: other.longitude }
      )

      // 如果在聚合距離內就聚合
      if (distance < pixelDistance) {
        cluster.toilets.push(other)
        processed.add(i)

        // 更新聚合中心（簡單平均）
        updateClusterCenter(cluster)

        // 根據縮放層級動態限制聚合大小
        let maxClusterSize
        if (currentZoom >= 18) {
          maxClusterSize = 15
        } else if (currentZoom >= 16) {
          maxClusterSize = 30
        } else if (currentZoom >= 14) {
          maxClusterSize = 60
        } else if (currentZoom >= 12) {
          maxClusterSize = 100
        } else {
          maxClusterSize = 200
        }
        if (cluster.toilets.length >= maxClusterSize) break
      }
    }

    clusters.push(cluster)
    processed.add(index)
  })

  // 第二輪：聚合群組間的二次聚合
  clusters = performSecondaryCluster(clusters, pixelDistance * 1.5, currentZoom)

  return clusters
}

// 二次聚合：處理相近的聚合群組
const performSecondaryCluster = (initialClusters, secondaryDistance, currentZoom) => {
  if (initialClusters.length <= 1) return initialClusters

  const finalClusters = []
  const processed = new Set()

  initialClusters.forEach((cluster, index) => {
    if (processed.has(index)) return

    let mergedCluster = { ...cluster, toilets: [...cluster.toilets] }

    // 尋找可以合併的其他聚合群組
    for (let i = index + 1; i < initialClusters.length; i++) {
      if (processed.has(i)) continue

      const otherCluster = initialClusters[i]
      const distance = calculatePixelDistance(
        mergedCluster.center,
        otherCluster.center
      )

      // 如果兩個聚合群組很近，就合併它們
      if (distance < secondaryDistance) {
        // 合併聚合群組
        mergedCluster.toilets.push(...otherCluster.toilets)
        processed.add(i)

        // 重新計算中心點
        updateClusterCenter(mergedCluster)

        // 檢查合併後的大小限制
        let maxTotalSize
        if (currentZoom >= 16) {
          maxTotalSize = 50
        } else if (currentZoom >= 14) {
          maxTotalSize = 100
        } else if (currentZoom >= 12) {
          maxTotalSize = 150
        } else {
          maxTotalSize = 300
        }

        // 如果合併後太大就停止
        if (mergedCluster.toilets.length >= maxTotalSize) break
      }
    }

    finalClusters.push(mergedCluster)
    processed.add(index)
  })

  return finalClusters
}

// 計算兩點在當前縮放層級下的像素距離
const calculatePixelDistance = (point1, point2) => {
  if (!map.value) return Infinity

  try {
    const p1 = map.value.latLngToLayerPoint([point1.lat, point1.lng])
    const p2 = map.value.latLngToLayerPoint([point2.lat, point2.lng])
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
  } catch (error) {
    // 如果座標轉換失敗，使用地理距離估算
    const latDiff = point1.lat - point2.lat
    const lngDiff = point1.lng - point2.lng
    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 100000 // 轉換為大概的像素距離
  }
}

// 更新聚合中心點（簡單平均）
const updateClusterCenter = (cluster) => {
  let totalLat = 0
  let totalLng = 0

  cluster.toilets.forEach(toilet => {
    totalLat += toilet.latitude
    totalLng += toilet.longitude
  })

  cluster.center = {
    lat: totalLat / cluster.toilets.length,
    lng: totalLng / cluster.toilets.length
  }
}

// 顯示聚合廁所列表模態框
const showClusterModal = (toilets) => {
  clusteredToilets.value = toilets
  showClusterList.value = true
}

// 取得廁所圖標
const getToiletIcon = (toilet) => {
  const baseIcon = '🚽'
  if (toilet.grade === 'excellent') return '🌟'
  if (toilet.type === 'family') return '👶'
  if (toilet.has_diaper) return '🍼'
  return baseIcon
}

// 聚焦到特定廁所
const focusToilet = (toilet) => {
  selectedToilet.value = toilet
  map.value.setView([toilet.latitude, toilet.longitude], 16)
  trackEvent('toilet_open', toToiletEventParams(toilet))
}

// 重置篩選條件
const resetFilters = () => {
  filters.value = {
    grade: '',
    type: '',
    hasDiaper: false
  }
  trackEvent('reset_filters')
  console.log('篩選條件已重置')
}

// hasChangingTable 已抽到 src/utils/toilet.js

// 開啟導航
const openNavigation = (toilet) => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${toilet.latitude},${toilet.longitude}`
  trackEvent('navigation_open', {
    provider: 'google_maps',
    ...toToiletEventParams(toilet)
  })
  window.open(url, '_blank')
}

// 關閉彈窗
const closeModal = () => {
  selectedToilet.value = null
}

// 關閉聚合列表
const closeClusterModal = () => {
  showClusterList.value = false
  clusteredToilets.value = []
}

// 從聚合列表選擇廁所
const selectClusterToilet = (toilet) => {
  selectedToilet.value = toilet
  showClusterList.value = false
  clusteredToilets.value = []

  // 聚焦到選定的廁所
  map.value.setView([toilet.latitude, toilet.longitude], 16)
}

// 關閉全部廁所列表彈窗
const closeAllToiletsModal = () => {
  showAllToiletsList.value = false
}

// 從全部廁所列表選擇廁所
const selectToiletFromList = (toilet) => {
  selectedToilet.value = toilet
  showAllToiletsList.value = false

  // 聚焦到選定的廁所，使用統一的縮放層級
  map.value.setView([toilet.latitude, toilet.longitude], 16)
}

// 主題切換時不需要重建瓦片（用 CSS filter 處理深色），只送一筆事件
watch(themeResolved, (val) => {
  trackEvent('theme_applied_to_map', { resolved: val })
})

// 監聽篩選器變化
watch(filters, (newVal, oldVal) => {
  updateMapMarkers()
  // 找出變動的欄位送出 GA 事件（避免一次送多筆）
  try {
    if (newVal.grade !== oldVal?.grade) {
      trackEvent('filter_change', { filter: 'grade', value: newVal.grade || 'all' })
    }
    if (newVal.type !== oldVal?.type) {
      trackEvent('filter_change', { filter: 'type', value: newVal.type || 'all' })
    }
    if (newVal.hasDiaper !== oldVal?.hasDiaper) {
      trackEvent('filter_change', { filter: 'has_diaper', value: String(newVal.hasDiaper) })
    }
  } catch (_) { /* noop */ }
}, { deep: true })

// 組件生命週期
onMounted(async () => {
  await loadCounties()
  initMap()

  // 進入地圖頁直接嘗試定位：
  //   - 已授權：立即取得位置並載入附近廁所
  //   - 未授權：瀏覽器跳出原生權限提示，使用者選擇後處理
  //   - 拒絕 / 失敗：silent 模式不彈 alert，fallback 到預設視野
  const ok = await locateUser({ silent: true })
  if (!ok) {
    // 沒有定位成功時也至少載入預設視野的資料，避免畫面空白
    await updateNearbyToilets()
  }
})

onUnmounted(() => {
  if (updateTimeout) {
    clearTimeout(updateTimeout)
  }
  if (map.value) {
    map.value.remove()
  }
})
</script>

<style scoped>
.map-page {
  display: flex;
  /* dvh 解決 iOS Safari 網址列造成的高度問題 */
  height: calc(100vh - var(--nav-h) - var(--footer-h));
  height: calc(100dvh - var(--nav-h) - var(--footer-h));
  position: relative;
  overflow: hidden;
  overscroll-behavior: contain;
}

.control-panel {
  width: 350px;
  background: var(--color-surface);
  color: var(--color-text);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  z-index: 1000;
}

.control-panel.collapsed {
  width: 50px;
}

.panel-header {
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-surface-2);
}

.panel-header h2 {
  margin: 0;
  font-size: 1.2rem;
}

.collapse-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  color: var(--color-text-muted);
  border-radius: 6px;
}

.collapse-btn:hover {
  background: var(--color-primary-soft);
  color: var(--color-text);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  /* 重要：防止內部捲動到底時把外部一起拉動（iOS 上會把 body 帶起來，
     讓內容滑到 navbar 後面看起來像被覆蓋） */
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  padding: 1rem;
}

.custom-location {
  margin-bottom: 1.5rem;
}

.custom-location h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: var(--color-text);
}

.location-input {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.location-search-input {
  flex: 1;
  padding: 0.75rem;
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.9rem;
}

.location-search-input::placeholder {
  color: var(--color-text-soft);
}

.location-search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-soft);
}

.btn-search {
  padding: 0.75rem 1rem;
  background: var(--color-cta-bg);
  color: var(--color-cta-fg);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  min-width: 50px;
  transition: background-color 0.18s ease;
}

.btn-search:hover:not(:disabled) {
  background: var(--color-cta-bg-hover);
}

.btn-search:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-tips {
  margin-bottom: 0.5rem;
}

.search-tips small {
  color: var(--color-text-soft);
  font-style: italic;
}

.usage-tips {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  margin: 1rem 0;
  overflow: hidden;
}

.usage-tips-header {
  width: 100%;
  padding: 1rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.18s ease;
  /* override 預設按鈕樣式，因為這是用 button 取代 div */
  background: transparent;
  border: none;
  color: inherit;
  font: inherit;
  text-align: left;
}

.usage-tips-header:hover {
  background: var(--color-primary-soft);
}

.usage-tips-header h4 {
  margin: 0;
  font-size: 1rem;
  color: var(--color-text);
}

.toggle-icon {
  font-size: 0.9rem;
  color: var(--color-text-soft);
  transition: transform 0.3s ease;
}

.usage-tips-content {
  padding: 0 1rem 1rem 1rem;
  animation: slideDown 0.3s ease;
}

.usage-tips-content ul {
  margin: 0;
  padding-left: 1.2rem;
}

.usage-tips-content li {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }

  to {
    opacity: 1;
    max-height: 200px;
  }
}

.error-message {
  background: rgba(185, 28, 28, 0.08);
  color: var(--color-danger);
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  border: 1px solid rgba(185, 28, 28, 0.2);
}

[data-theme="dark"] .error-message {
  background: rgba(248, 113, 113, 0.12);
  border-color: rgba(248, 113, 113, 0.35);
}

.btn {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: background 0.18s ease, transform 0.1s ease;
}

.btn-primary {
  background: var(--color-cta-bg);
  color: var(--color-cta-fg);
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-cta-bg-hover);
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.filters h3 {
  margin: 1.5rem 0 1rem 0;
  font-size: 1.1rem;
  color: var(--color-text);
}

.filter-group {
  margin-bottom: 1rem;
}

.filter-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--color-text-soft, #64748b);
  letter-spacing: 0.02em;
}

/* ===== Chip-style filter ===== */
.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: var(--color-surface);
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill, 999px);
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  min-height: 32px;
  transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease, transform 0.1s ease;
}

.chip:hover {
  background: var(--color-primary-soft);
  color: var(--color-text);
  border-color: var(--color-primary);
}

.chip:active {
  transform: scale(0.97);
}

.chip-active,
.chip[aria-pressed="true"] {
  background: var(--color-cta-bg);
  color: var(--color-cta-fg);
  border-color: var(--color-cta-bg);
}

.chip-active:hover {
  background: var(--color-cta-bg-hover);
  color: var(--color-cta-fg);
  border-color: var(--color-cta-bg-hover);
}

/* ===== Toggle row（取代 checkbox） ===== */
.toggle-row {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.6rem 0.85rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md, 10px);
  cursor: pointer;
  font: inherit;
  color: var(--color-text);
  transition: background 0.18s ease, border-color 0.18s ease;
}

.toggle-row:hover {
  background: var(--color-surface-2);
}

.toggle-row.toggle-active {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
}

.toggle-text {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.toggle-switch {
  position: relative;
  width: 36px;
  height: 20px;
  background: #cbd5e1;
  border-radius: 999px;
  flex-shrink: 0;
  transition: background 0.18s ease;
}

.toggle-row.toggle-active .toggle-switch {
  background: var(--color-text, #0f172a);
}

.toggle-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: #fff;
  border-radius: 999px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  transition: transform 0.18s ease;
}

.toggle-row.toggle-active .toggle-knob {
  transform: translateX(16px);
}

/* ===== Reset link button（不再是大紅按鈕） ===== */
.filter-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

.btn-reset-link {
  background: transparent;
  color: var(--color-text-soft, #64748b);
  border: none;
  padding: 0.4rem 0.6rem;
  font-size: 0.85rem;
  cursor: pointer;
  border-radius: var(--radius-sm, 6px);
  transition: background 0.18s ease, color 0.18s ease;
}

.btn-reset-link:hover:not(:disabled) {
  background: var(--color-primary-soft, rgba(91, 108, 255, 0.08));
  color: var(--color-text, #0f172a);
}

.btn-reset-link:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* 效能設定樣式 */
.performance-settings {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  margin: 1rem 0;
  overflow: hidden;
}

.performance-settings-header {
  padding: 1rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.3s ease;
}

.performance-settings-header:hover {
  background: #e9ecef;
}

.performance-settings-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #495057;
}

.performance-settings-content {
  padding: 0 1rem 1rem 1rem;
  animation: slideDown 0.3s ease;
}

.setting-item {
  margin-bottom: 1rem;
}

.setting-item label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

.setting-description {
  display: block;
  color: #6c757d;
  font-style: italic;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.range-slider {
  width: 100%;
  margin: 0.5rem 0;
}

.range-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #666;
}

.performance-info {
  background: #e3f2fd;
  padding: 0.75rem;
  border-radius: 6px;
  margin: 1rem 0;
}

.btn-reset-small {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background-color 0.3s;
}

.btn-reset-small:hover {
  background: #c82333;
}

/* 虛擬列表樣式 */
.toilet-virtual-list {
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
}

.virtual-items-container {
  width: 100%;
}

.virtual-item {
  border-bottom: 1px solid #eee;
  box-sizing: border-box;
  padding: 0.75rem !important;
}

.virtual-item:last-child {
  border-bottom: none;
}

/* 載入狀態樣式 */
.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.loading-progress {
  width: 100%;
  height: 4px;
  background: #f3f3f3;
  border-radius: 2px;
  margin: 1rem 0;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  animation: progress 2s ease-in-out infinite;
}

@keyframes progress {
  0% {
    width: 0%;
  }

  50% {
    width: 70%;
  }

  100% {
    width: 100%;
  }
}

/* 移除效能警告樣式 - 不再使用 */

/* 移除效能提示樣式 - 不再使用 */

/* 地圖範圍資訊樣式 */
.map-range-info {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  margin: 1rem 0;
  padding: 1rem;
}

.map-range-info h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: #495057;
}

.range-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.stat-label {
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 500;
}

.stat-value {
  font-size: 0.9rem;
  font-weight: bold;
  color: #495057;
  background: #e3f2fd;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  min-width: 40px;
  text-align: center;
}

.range-explanation {
  background: #e8f5e8;
  padding: 0.75rem;
  border-radius: 6px;
  border-left: 4px solid #28a745;
}

.range-explanation small {
  color: #2d5016;
  line-height: 1.4;
}

.toilet-list h3 {
  margin: 1.5rem 0 1rem 0;
  font-size: 1.1rem;
  color: var(--color-text);
}

.toilet-item {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease;
}

.toilet-item:hover {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
}

.toilet-item.active {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary) inset;
}

.toilet-compact-info {
  width: 100%;
}

.toilet-name-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.3rem;
}

.toilet-name-row h4 {
  margin: 0;
  font-size: 0.95rem;
  color: var(--color-text);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 0.5rem;
}

.distance-badge {
  background: var(--color-primary);
  color: var(--color-text-on-primary);
  font-size: 0.75rem;
  padding: 0.2rem 0.4rem;
  border-radius: 12px;
  white-space: nowrap;
  font-weight: 600;
}

.address-compact {
  font-size: 0.8rem;
  color: var(--color-text-soft);
  margin: 0 0 0.4rem 0;
  line-height: 1.2;
  display: -webkit-box;
  line-clamp: 1;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.toilet-meta-compact {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

/* 等級徽章——維持以顏色 + 文字雙重編碼，符合色盲友善 */
.grade-compact,
.type-compact {
  font-size: 0.7rem;
  padding: 0.15rem 0.4rem;
  border-radius: 8px;
  background: var(--color-surface);
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  white-space: nowrap;
  font-weight: 600;
}

/* 等級色：背景柔和、文字深，光模式下對比 ≥ 4.5:1 */
.grade-compact.excellent { background: #d1fae5; color: #065f46; border-color: transparent; }
.grade-compact.good      { background: #dbeafe; color: #1e40af; border-color: transparent; }
.grade-compact.fair      { background: #fef3c7; color: #854d0e; border-color: transparent; }
.grade-compact.needs_improvement { background: #ffedd5; color: #9a3412; border-color: transparent; }
.grade-compact.fail      { background: #fee2e2; color: #991b1b; border-color: transparent; }

[data-theme="dark"] .grade-compact.excellent { background: rgba(74, 222, 128, 0.18); color: #6ee7b7; }
[data-theme="dark"] .grade-compact.good      { background: rgba(96, 165, 250, 0.18); color: #93c5fd; }
[data-theme="dark"] .grade-compact.fair      { background: rgba(251, 191, 36, 0.18); color: #fcd34d; }
[data-theme="dark"] .grade-compact.needs_improvement { background: rgba(251, 146, 60, 0.18); color: #fdba74; }
[data-theme="dark"] .grade-compact.fail      { background: rgba(248, 113, 113, 0.20); color: #fca5a5; }

.feature-compact {
  font-size: 0.85rem;
  background: var(--color-primary-soft);
  padding: 0.1rem 0.3rem;
  border-radius: 6px;
}

.btn-nav-compact {
  background: var(--color-cta-bg);
  color: var(--color-cta-fg);
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  margin-left: auto;
  transition: background-color 0.18s ease, transform 0.1s ease;
}

.btn-nav-compact:hover {
  background: var(--color-cta-bg-hover);
  transform: translateY(-1px);
}

.view-all-btn-container {
  margin-top: 1rem;
  text-align: center;
}

.btn-view-all {
  background: var(--color-cta-bg);
  color: var(--color-cta-fg);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  font-weight: 600;
  width: 100%;
  transition: background-color 0.18s ease;
}

.btn-view-all:hover {
  background: var(--color-cta-bg-hover);
}

.map-container {
  flex: 1;
  position: relative;
}

#map {
  width: 100%;
  height: 100%;
}

.map-controls {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.map-control-btn {
  width: 48px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  line-height: 1;
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border-strong);
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18), 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.1s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.map-control-btn:hover:not(:disabled) {
  background: var(--color-primary-soft);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.22), 0 1px 3px rgba(0, 0, 0, 0.1);
}

.map-control-btn:active:not(:disabled) {
  transform: scale(0.96);
}

.map-control-btn:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

.map-control-btn:disabled {
  opacity: 0.7;
  cursor: progress;
}

/* 深色：用較亮的邊框 + 強陰影，讓按鈕在深色地圖上仍然明顯 */
[data-theme="dark"] .map-control-btn {
  background: #1c2742;
  color: #f8fafc;
  border-color: #4a5b80;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.04) inset;
}

[data-theme="dark"] .map-control-btn:hover:not(:disabled) {
  background: #2a3858;
  border-color: #6b7ba6;
}

.toilet-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: var(--color-surface);
  color: var(--color-text);
  border-radius: 12px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  max-height: 80vh;
  max-height: 80dvh;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text-soft);
}

.toilet-details {
  margin: 1rem 0;
}

.detail-item {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.modal-actions {
  margin-top: 1.5rem;
}

.loading,
.no-data {
  text-align: center;
  color: var(--color-text-soft);
  margin: 2rem 0;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .map-page {
    flex-direction: column;
    height: calc(100vh - var(--nav-h) - var(--footer-h));
    height: calc(100dvh - var(--nav-h) - var(--footer-h));
  }

  .control-panel {
    width: 100%;
    height: 45%;
    border-right: none;
    border-bottom: 1px solid #ddd;
  }

  .control-panel.collapsed {
    height: 56px;
    width: 100%;
  }

  .map-container {
    height: 55%;
  }

  .location-input {
    flex-direction: column;
    gap: 0.75rem;
  }

  .location-search-input {
    width: 100%;
  }

  .btn-search {
    width: 100%;
  }

  .modal-content {
    margin: 1rem;
    width: calc(100% - 2rem);
  }
}

/* ===== Skeleton loading ===== */
.skeleton-list {
  padding: 0.5rem 0;
}

.skeleton-card {
  background: #fff;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 10px);
  padding: 0.85rem 1rem;
  margin-bottom: 0.65rem;
}

.skeleton {
  background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.4s ease-in-out infinite;
  border-radius: 6px;
}

.skeleton-line {
  height: 12px;
  margin-bottom: 0.5rem;
}

.w-70 { width: 70%; }
.w-90 { width: 90%; }

.skeleton-row {
  display: flex;
  gap: 0.4rem;
  margin-top: 0.4rem;
}

.skeleton-pill {
  width: 56px;
  height: 18px;
  border-radius: 999px;
}

.skeleton-status {
  text-align: center;
  font-size: 0.8rem;
  color: var(--color-text-soft, #64748b);
  margin: 0.5rem 0 0;
}

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 尊重使用者偏好：減少動畫 */
@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
  }
}

/* ===== Empty state ===== */
.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  opacity: 0.6;
}

/* ===== Modal v2 ===== */
.modal-content-v2 {
  padding: 1.5rem 1.5rem 1.25rem;
  max-width: 440px;
  border-radius: 16px;
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.18), 0 4px 12px rgba(15, 23, 42, 0.06);
  border: 1px solid var(--color-border, #e5e7eb);
}

.modal-header {
  margin-bottom: 1rem;
  padding-right: 2rem; /* 給右上角 close-btn 留位 */
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.3;
  color: var(--color-text, #0f172a);
  margin: 0 0 0.65rem 0;
}

.modal-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background: #f1f5f9;
  color: var(--color-text-muted, #475569);
}

.badge-soft {
  background: var(--color-primary-soft, rgba(91, 108, 255, 0.08));
  color: var(--color-primary, #5b6cff);
}

/* 等級徽章顏色 */
.badge-grade-excellent,
.badge-grade-special,
.badge-grade-特優 {
  background: #ecfdf5;
  color: #047857;
}
.badge-grade-good,
.badge-grade-優等 {
  background: #eff6ff;
  color: #1d4ed8;
}
.badge-grade-fair,
.badge-grade-普通 {
  background: #fef3c7;
  color: #92400e;
}
.badge-grade-needsImprovement,
.badge-grade-加強 {
  background: #fff7ed;
  color: #c2410c;
}
.badge-grade-fail,
.badge-grade-不合格 {
  background: #fef2f2;
  color: #b91c1c;
}

.distance-callout {
  display: inline-flex;
  align-items: baseline;
  gap: 0.4rem;
  margin-bottom: 1rem;
  padding: 0.5rem 0.85rem;
  background: var(--color-primary-soft, rgba(91, 108, 255, 0.08));
  border-radius: var(--radius-md, 10px);
  color: var(--color-primary, #5b6cff);
}

.distance-value {
  font-size: 1.1rem;
  font-weight: 700;
}

.distance-label {
  font-size: 0.8rem;
  color: var(--color-text-soft, #64748b);
}

.modal-info {
  margin: 0 0 1.25rem;
  padding: 0;
}

.info-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.15rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row dt {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-text-soft, #64748b);
  letter-spacing: 0.02em;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.info-row dd {
  margin: 0;
  font-size: 0.95rem;
  color: var(--color-text, #0f172a);
  line-height: 1.5;
}

.btn-nav-primary {
  display: inline-flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.85rem 1.25rem;
  background: var(--color-text, #0f172a);
  color: #fff;
  border: none;
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s ease, transform 0.1s ease, box-shadow 0.18s ease;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.18);
}

.btn-nav-primary:hover {
  background: #1e293b;
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.24);
}

.btn-nav-primary:active {
  transform: translateY(0);
}

.modal-content-v2 .close-btn {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 1.1rem;
  color: var(--color-text-soft, #64748b);
  transition: background 0.18s ease, color 0.18s ease;
}

.modal-content-v2 .close-btn:hover {
  background: #f1f5f9;
  color: var(--color-text, #0f172a);
}

/* =============================================
   Dark mode 覆寫
   原本 Map.vue 大量使用寫死的色碼（#fff、#f8f9fa、#666...），
   這裡集中一次覆寫，避免動到散在各處的 selector。
   所有色彩對 #0b1220 背景對比度都通過 WCAG AA（>= 4.5:1）。
   ============================================= */

/* 廣泛文字色覆寫（針對 Map.vue 內各種寫死的灰階） */
[data-theme="dark"] .filters h3,
[data-theme="dark"] .panel-header h2,
[data-theme="dark"] .filter-group label,
[data-theme="dark"] .toilet-item h4,
[data-theme="dark"] .modal-content h3,
[data-theme="dark"] .modal-content h4,
[data-theme="dark"] .toilet-info h4,
[data-theme="dark"] .grade-compact,
[data-theme="dark"] .type-compact {
  color: var(--color-text);
}

[data-theme="dark"] .address,
[data-theme="dark"] .address-compact,
[data-theme="dark"] .toilet-meta-compact,
[data-theme="dark"] .toilet-meta,
[data-theme="dark"] .search-tips small,
[data-theme="dark"] .filter-label,
[data-theme="dark"] .detail-item,
[data-theme="dark"] .modal-content p {
  color: var(--color-text-muted);
}

[data-theme="dark"] .no-data,
[data-theme="dark"] .skeleton-status,
[data-theme="dark"] .toggle-icon,
[data-theme="dark"] .loading,
[data-theme="dark"] small {
  color: var(--color-text-soft);
}

[data-theme="dark"] .panel-header,
[data-theme="dark"] .filters,
[data-theme="dark"] .usage-tips {
  background: var(--color-surface-2);
}

[data-theme="dark"] .usage-tips {
  border-color: var(--color-border);
}

[data-theme="dark"] .usage-tips-header:hover {
  background: rgba(255, 255, 255, 0.04);
}

[data-theme="dark"] .filters h3,
[data-theme="dark"] .panel-header h2 {
  color: var(--color-text);
}

[data-theme="dark"] .toilet-item {
  background: var(--color-surface);
  border-color: var(--color-border);
  color: var(--color-text);
}

[data-theme="dark"] .toilet-item:hover {
  background: var(--color-surface-2);
}

[data-theme="dark"] .toilet-item.active {
  background: var(--color-primary-soft);
}

[data-theme="dark"] .toilet-item h4 {
  color: var(--color-text);
}

[data-theme="dark"] .address-compact,
[data-theme="dark"] .toilet-meta-compact {
  color: var(--color-text-soft);
}

[data-theme="dark"] .chip {
  background: var(--color-surface-2);
  color: var(--color-text-muted);
  border-color: var(--color-border);
}

[data-theme="dark"] .chip:hover {
  background: rgba(129, 140, 248, 0.12);
  color: var(--color-text);
  border-color: var(--color-primary);
}

[data-theme="dark"] .chip-active,
[data-theme="dark"] .chip[aria-pressed="true"] {
  background: var(--color-primary);
  color: #0b1220;
  border-color: var(--color-primary);
}

[data-theme="dark"] .toggle-row {
  background: var(--color-surface-2);
  border-color: var(--color-border);
  color: var(--color-text);
}

[data-theme="dark"] .toggle-row:hover {
  background: rgba(255, 255, 255, 0.04);
}

[data-theme="dark"] .toggle-row.toggle-active {
  background: rgba(129, 140, 248, 0.1);
  border-color: var(--color-primary);
}

[data-theme="dark"] .toggle-row.toggle-active .toggle-switch {
  background: var(--color-primary);
}

[data-theme="dark"] .toilet-modal {
  background: rgba(0, 0, 0, 0.65);
}

[data-theme="dark"] .modal-content-v2 {
  background: var(--color-surface);
  border-color: var(--color-border);
  color: var(--color-text);
}

[data-theme="dark"] .info-row {
  border-color: var(--color-border);
}

[data-theme="dark"] .info-row dd {
  color: var(--color-text);
}

[data-theme="dark"] .badge {
  background: var(--color-surface-2);
  color: var(--color-text-muted);
}

[data-theme="dark"] .modal-content-v2 .close-btn:hover {
  background: var(--color-surface-2);
  color: var(--color-text);
}

[data-theme="dark"] .skeleton {
  background: linear-gradient(90deg, #1a2238 0%, #243049 50%, #1a2238 100%);
  background-size: 200% 100%;
}

[data-theme="dark"] .skeleton-card {
  background: var(--color-surface);
  border-color: var(--color-border);
}

[data-theme="dark"] .no-data,
[data-theme="dark"] .skeleton-status {
  color: var(--color-text-soft);
}

[data-theme="dark"] .location-search-input {
  background: var(--color-surface-2);
  border-color: var(--color-border);
  color: var(--color-text);
}

[data-theme="dark"] .location-search-input::placeholder {
  color: var(--color-text-soft);
}

[data-theme="dark"] .btn-search {
  background: var(--color-primary);
  color: #0b1220;
}

/* map-control-btn 的深色覆寫已移到該元件附近 */

[data-theme="dark"] .toggle-icon {
  color: var(--color-text-soft);
}

[data-theme="dark"] .search-tips small,
[data-theme="dark"] .filter-label {
  color: var(--color-text-soft);
}

[data-theme="dark"] .error-message {
  background: rgba(220, 53, 69, 0.15);
  color: #f87171;
}

[data-theme="dark"] .distance-callout {
  background: rgba(129, 140, 248, 0.12);
}

/* ===== Cluster modal v2 ===== */
.cluster-modal {
  max-width: 520px;
}

.modal-subtitle {
  font-size: 0.88rem;
  color: var(--color-text-soft, #64748b);
  margin: 0;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0.5rem 0 0;
  max-height: 56vh;
  max-height: 56dvh;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

/* 在側邊面板內顯示時，外面已經有 .panel-content 在處理捲動，
   不需要再一層內捲，也不限制高度 */
.result-list-inline {
  max-height: none;
  overflow: visible;
  margin-top: 0.75rem;
}

/* 使用者點選一筆時的 active 狀態（從 .toilet-item 對應移植過來） */
.result-item.result-item-active {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary) inset;
  background: var(--color-primary-soft);
}

.result-item {
  width: 100%;
  display: flex;
  align-items: stretch;
  gap: 0.75rem;
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 12px;
  padding: 0.85rem 1rem;
  cursor: pointer;
  font: inherit;
  text-align: left;
  color: inherit;
  transition: background 0.18s ease, border-color 0.18s ease, transform 0.1s ease;
}

.result-item:hover {
  background: var(--color-primary-soft, rgba(91, 108, 255, 0.06));
  border-color: var(--color-primary, #5b6cff);
}

.result-item:active {
  transform: scale(0.99);
}

.result-item-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.result-item-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}

.result-item-name {
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--color-text, #0f172a);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-item-distance {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-primary, #5b6cff);
  flex-shrink: 0;
}

.result-item-address {
  font-size: 0.82rem;
  color: var(--color-text-soft, #64748b);
  margin: 0;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-item-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-top: 0.25rem;
}

.result-item-nav {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  flex-shrink: 0;
  background: var(--color-text, #0f172a);
  color: #fff;
  border-radius: 999px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.18s ease, transform 0.1s ease;
}

.result-item-nav:hover {
  background: #1e293b;
}

.result-item-nav:active {
  transform: scale(0.94);
}

[data-theme="dark"] .result-item {
  background: var(--color-surface);
  border-color: var(--color-border);
}

[data-theme="dark"] .result-item:hover {
  background: var(--color-primary-soft);
}

[data-theme="dark"] .result-item-name,
[data-theme="dark"] .result-item-address {
  color: inherit;
}

[data-theme="dark"] .result-item-nav {
  background: var(--color-primary);
  color: #0b1220;
}
</style>

<style>
/* =============================================
   Leaflet 自定義樣式
   ============================================= */

/* Dark mode：用 CSS filter 反轉地圖瓦片
   - invert(1) 把白底/灰路 → 黑底/亮路
   - hue-rotate(180deg) 把藍色海洋與綠色公園的色相轉回來
   - brightness(0.95) 微降亮度避免太刺眼
   - 只套在 tile-pane，不影響 markers/popups/controls */
[data-theme="dark"] .leaflet-tile-pane {
  filter: invert(1) hue-rotate(180deg) brightness(0.95) contrast(0.85) saturate(0.8);
}

/* attribution 文字在反轉的背景上反過來會看不見，獨立處理 */
[data-theme="dark"] .leaflet-control-attribution {
  background: rgba(19, 28, 48, 0.85) !important;
  color: #b3c0d1 !important;
}

[data-theme="dark"] .leaflet-control-attribution a {
  color: #a5b4fc !important;
}

/* Leaflet 預設 zoom 控制按鈕也順手調整，免得淺色按鈕在深底地圖上太突兀 */
[data-theme="dark"] .leaflet-bar a,
[data-theme="dark"] .leaflet-bar a:hover {
  background: #131c30 !important;
  color: #f8fafc !important;
  border-color: #28324d !important;
}

[data-theme="dark"] .leaflet-bar a:hover {
  background: #1c2742 !important;
}

.user-marker {
  background: none !important;
  border: none !important;
  text-align: center;
  line-height: 30px;
  font-size: 20px;
}

.user-marker.custom {
  background: rgba(255, 255, 255, 0.9) !important;
  border: 2px solid #28a745 !important;
  border-radius: 50% !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
}

.center-marker {
  background: rgba(255, 255, 255, 0.95) !important;
  border: 3px solid #007bff !important;
  border-radius: 50% !important;
  text-align: center;
  line-height: 34px;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
  cursor: move !important;
  z-index: 1000 !important;
  position: relative !important;
}

.center-marker:hover {
  transform: scale(1.1);
  transition: transform 0.2s ease;
  animation: none;
}

@keyframes bounce {

  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }

  40% {
    transform: translateY(-5px);
  }

  60% {
    transform: translateY(-3px);
  }
}

.toilet-marker {
  background: white !important;
  border: 2px solid #007bff !important;
  border-radius: 50% !important;
  text-align: center;
  line-height: 21px;
  font-size: 14px;
}

.toilet-marker.grade-excellent {
  border-color: #28a745 !important;
}

.toilet-marker.grade-fail {
  border-color: #dc3545 !important;
}

.cluster-marker {
  background: none !important;
  border: none !important;
}

.cluster-icon {
  background: linear-gradient(135deg, #007bff, #0056b3) !important;
  border: 3px solid white !important;
  border-radius: 50% !important;
  width: 40px !important;
  height: 40px !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
  overflow: hidden !important;
  position: relative !important;
}

.cluster-icon:hover {
  transform: scale(1.15) !important;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5) !important;
}

.cluster-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
  border-radius: 50%;
  pointer-events: none;
}

.cluster-count {
  color: white !important;
  font-weight: bold !important;
  font-size: 14px !important;
  line-height: 1 !important;
}

.cluster-emoji {
  font-size: 12px !important;
  line-height: 1 !important;
}

/* 兩個彈窗（聚合 / 全部）都用 modal-content-v2 + result-list 共用樣式，
   下面只保留各自寬度上限的差異 */
.cluster-modal {
  max-width: 520px;
}

.all-toilets-modal {
  max-width: 600px;
}
</style>
