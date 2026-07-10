<template>
  <div class="map-page">
    <!-- 控制面板 -->
    <div class="control-panel" :class="{ collapsed: isPanelCollapsed }">
      <div class="panel-header">
        <h2 class="panel-header-title" v-show="!isPanelCollapsed">{{ $t('map.panelTitle') }}</h2>
        <button
          @click="isPanelCollapsed = !isPanelCollapsed"
          class="collapse-btn"
          type="button"
          :aria-label="isPanelCollapsed ? $t('a11y.openPanel') : $t('a11y.closePanel')"
          :aria-expanded="(!isPanelCollapsed).toString()"
        >
          <span class="material-symbols-outlined" aria-hidden="true">
            {{ isPanelCollapsed ? 'chevron_right' : 'chevron_left' }}
          </span>
        </button>
      </div>

      <div class="panel-content" v-show="!isPanelCollapsed">
        <!-- 自訂位置搜尋 (M3 Search Bar) -->
        <div class="custom-location">
          <h3>{{ $t('map.customLocation.title') }}</h3>
          <div class="location-input">
            <span class="material-symbols-outlined search-input-icon" aria-hidden="true">search</span>
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
              <span class="material-symbols-outlined" :class="{ 'spin-anim': isSearching }" aria-hidden="true">
                {{ isSearching ? 'sync' : 'arrow_forward' }}
              </span>
            </button>
          </div>
          <div class="search-tips">
            <small><span class="material-symbols-outlined info-symbol" aria-hidden="true">info</span> {{ $t('map.customLocation.searchTip') }}</small>
          </div>
          <div v-if="searchError" class="error-message" role="alert">
            {{ searchError }}
          </div>
        </div>

        <!-- 定位按鈕 (M3 Filled Button) -->
        <button
          @click="locateUser"
          class="btn btn-primary locate-panel-btn"
          type="button"
          :disabled="isLocating"
          :aria-label="$t('a11y.locate')"
        >
          <span class="material-symbols-outlined btn-icon" :class="{ 'spin-anim': isLocating }" aria-hidden="true">
            {{ isLocating ? 'sync' : 'my_location' }}
          </span>
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
                <span class="material-symbols-outlined chip-check-icon" v-if="filters.grade === opt.value" aria-hidden="true">check</span>
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
                <span v-if="opt.icon && filters.type !== opt.value" class="material-symbols-outlined chip-icon" aria-hidden="true">{{ opt.icon }}</span>
                <span class="material-symbols-outlined chip-check-icon" v-if="filters.type === opt.value" aria-hidden="true">check</span>
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
                <span class="material-symbols-outlined toggle-icon-left" aria-hidden="true">baby_changing_station</span>
                {{ $t('map.filters.diaper') }}
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
              <span class="material-symbols-outlined reset-icon" aria-hidden="true">restart_alt</span>
              {{ $t('map.filters.reset') }}
            </button>
          </div>
        </div>

        <!-- 廁所列表 -->
        <div class="toilet-list" v-if="filteredToilets.length > 0">
          <h3>{{ $t('map.toiletList.title') }} ({{ filteredToilets.length }})</h3>

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
                    <span class="material-symbols-outlined badge-icon-symbol" aria-hidden="true">baby_changing_station</span>
                    {{ $t('map.toiletInfo.diaperBadge') }}
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
                <span class="material-symbols-outlined" aria-hidden="true">directions</span>
              </span>
            </button>
          </div>

          <!-- 查看全部按鈕 -->
          <div class="view-all-btn-container" v-if="filteredToilets.length > displayLimit">
            <button @click="showAllToiletsList = true" class="btn-view-all">
              {{ $t('map.toiletList.viewAllN', { count: filteredToilets.length }) }}
            </button>
          </div>
        </div>

        <div v-else-if="!isLoading && filteredToilets.length === 0" class="no-data">
          <div class="empty-icon-container">
            <span class="material-symbols-outlined empty-icon" aria-hidden="true">location_off</span>
          </div>
          <p>{{ userLocation ? $t('map.toiletList.noData') : $t('map.toiletList.needLocation') }}</p>
        </div>

        <!-- 載入中 Skeleton -->
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

      <!-- 地圖控制 (M3 Floating Action Buttons) -->
      <div class="map-controls">
        <button
          @click="locateUser"
          class="map-control-btn fab-btn"
          type="button"
          :disabled="isLocating"
          :aria-label="$t('a11y.locate')"
          :title="$t('a11y.locate')"
        >
          <span class="material-symbols-outlined" :class="{ 'spin-anim': isLocating }" aria-hidden="true">
            {{ isLocating ? 'sync' : 'my_location' }}
          </span>
        </button>
      </div>
    </div>

    <!-- 聚合列表對話框 (M3 Dialog / Bottom Sheet) -->
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
          <span class="material-symbols-outlined" aria-hidden="true">close</span>
        </button>

        <header class="modal-header">
          <h3 class="modal-title">
            <span class="material-symbols-outlined modal-header-icon" aria-hidden="true">location_on</span>
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
                  <span class="material-symbols-outlined badge-icon-symbol" aria-hidden="true">baby_changing_station</span>
                  {{ $t('map.toiletInfo.diaperBadge') }}
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
              <span class="material-symbols-outlined" aria-hidden="true">directions</span>
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- 全部列表對話框 -->
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
          <span class="material-symbols-outlined" aria-hidden="true">close</span>
        </button>

        <header class="modal-header">
          <h3 class="modal-title">
            <span class="material-symbols-outlined modal-header-icon" aria-hidden="true">map</span>
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
                  <span class="material-symbols-outlined badge-icon-symbol" aria-hidden="true">baby_changing_station</span>
                  {{ $t('map.toiletInfo.diaperBadge') }}
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
              <span class="material-symbols-outlined" aria-hidden="true">directions</span>
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- 詳情對話框 (M3 Dialog) -->
    <div
      v-if="selectedToilet"
      class="toilet-modal"
      role="dialog"
      aria-modal="true"
      :aria-label="selectedToilet.name_zh"
      @click="closeModal"
    >
      <div class="modal-content modal-content-v2 detail-modal" @click.stop>
        <button
          @click="closeModal"
          class="close-btn"
          type="button"
          :aria-label="$t('common.close')"
        >
          <span class="material-symbols-outlined" aria-hidden="true">close</span>
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
              <span class="material-symbols-outlined badge-icon-symbol" aria-hidden="true">baby_changing_station</span>
              {{ $t('map.filters.diaper') }}
            </span>
          </div>
        </header>

        <div v-if="selectedToilet.distance" class="distance-callout">
          <span class="material-symbols-outlined distance-icon" aria-hidden="true">straighten</span>
          <span class="distance-value">{{ formatDistance(selectedToilet.distance) }}</span>
          <span class="distance-label">{{ $t('map.toiletInfo.distance') }}</span>
        </div>

        <dl class="modal-info">
          <div class="info-row">
            <dt>
              <span class="material-symbols-outlined detail-icon" aria-hidden="true">location_on</span>
              {{ $t('map.toiletInfo.address') }}
            </dt>
            <dd>{{ selectedToilet.address_zh }}</dd>
          </div>
          <div class="info-row" v-if="selectedToilet.category_zh">
            <dt>
              <span class="material-symbols-outlined detail-icon" aria-hidden="true">label</span>
              {{ $t('map.toiletInfo.category') }}
            </dt>
            <dd>{{ selectedToilet.category_zh }}</dd>
          </div>
          <div class="info-row" v-if="selectedToilet.manager">
            <dt>
              <span class="material-symbols-outlined detail-icon" aria-hidden="true">business</span>
              {{ $t('map.toiletInfo.manager') }}
            </dt>
            <dd>{{ selectedToilet.manager }}</dd>
          </div>
        </dl>

        <div class="modal-actions">
          <button
            @click="openNavigation(selectedToilet)"
            class="btn-nav-primary"
            type="button"
          >
            <span class="material-symbols-outlined nav-btn-icon" aria-hidden="true">directions</span>
            {{ $t('map.toiletInfo.navigation') }}
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

// 自訂位置搜尋
const customLocationInput = ref('')
const isSearching = ref(false)
const searchError = ref('')

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

// 篩選器選項
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
  { value: '男', label: t('map.filters.type.male'), icon: 'man' },
  { value: '女', label: t('map.filters.type.female'), icon: 'woman' },
  { value: '男女', label: t('map.filters.type.mixed'), icon: 'wc' },
  { value: '無障礙', label: t('map.filters.type.accessible'), icon: 'accessible' },
  { value: '親子', label: t('map.filters.type.family'), icon: 'child_care' }
])

const hasActiveFilters = computed(() =>
  Boolean(filters.value.grade) ||
  Boolean(filters.value.type) ||
  filters.value.hasDiaper
)

// 計算過濾後的廁所
const filteredToilets = computed(() => {
  const filtered = nearbyToilets.value.filter(toilet => {
    if (filters.value.grade) {
      const toiletGrade = toilet.grade || toilet.level || toilet.rating || ''
      const gradeMatch = toiletGrade.includes(filters.value.grade) ||
        filters.value.grade.includes(toiletGrade) ||
        toiletGrade === filters.value.grade
      if (!gradeMatch) return false
    }

    if (filters.value.type) {
      const toiletType = toilet.type || toilet.toilet_type || toilet.category || ''
      const toiletName = toilet.name_zh || toilet.name || ''

      let typeMatch = false

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
        typeMatch = toiletType.includes(filters.value.type) ||
          filters.value.type.includes(toiletType) ||
          toiletName.includes(filters.value.type)
      }

      if (!typeMatch) return false
    }

    if (filters.value.hasDiaper) {
      if (!hasChangingTable(toilet)) return false
    }

    return true
  })

  return filtered.slice().sort((a, b) => {
    const da = typeof a.distance === 'number' ? a.distance : Number.POSITIVE_INFINITY
    const db = typeof b.distance === 'number' ? b.distance : Number.POSITIVE_INFINITY
    return da - db
  })
})

const displayedToilets = computed(() => filteredToilets.value.slice(0, displayLimit.value))

// 初始化地圖
const initMap = () => {
  if (typeof window === 'undefined' || !mapContainer.value) return

  // 預設中心點 (台北車站)
  const defaultPos = [25.0478, 121.5170]

  map.value = L.map(mapContainer.value, {
    zoomControl: false, // 關閉 Leaflet 預設 zoom，改用自訂 M3 控制項或直接滑動
    attributionControl: true
  }).setView(defaultPos, 16)

  // 載入 OpenStreetMap 圖磚
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
  }).addTo(map.value)

  // 建立中心拖曳點標記
  createCenterMarker(defaultPos)

  // 地圖移動或縮放完成時載入廁所
  map.value.on('zoomend moveend', () => {
    clearTimeout(updateTimeout)
    updateTimeout = setTimeout(updateNearbyToilets, 500)
  })

  // 地圖點擊關閉詳情
  map.value.on('click', () => {
    selectedToilet.value = null
  })
}

// 跳轉地圖視角；Leaflet 縮放動畫進行中呼叫 setView 會在動畫結束時被蓋回原目標，
// 因此先強制結束進行中的動畫再移動
const jumpTo = (position, zoom = 16) => {
  if (!map.value) return
  if (map.value._animatingZoom) map.value._onZoomTransitionEnd()
  map.value.setView(position, zoom)
}

// 建立中心點拖曳標記 (M3 Custom Pin Target)
const createCenterMarker = (position) => {
  centerMarker.value = L.marker(position, {
    draggable: true,
    icon: L.divIcon({
      className: 'm3-center-marker',
      html: `
        <div class="center-pin">
          <span class="material-symbols-outlined center-pin-icon" aria-hidden="true">person_pin_circle</span>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    })
  }).addTo(map.value)

  centerMarker.value.on('dragend', async () => {
    const pos = centerMarker.value.getLatLng()
    userLocation.value = [pos.lat, pos.lng]
    await updateNearbyToilets()
  })

  userLocation.value = position
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
      if (countyDataCache.has(county.filename)) {
        allToilets.push(...countyDataCache.get(county.filename))
        continue
      }

      console.info('loadToiletData - fetching:', county.filename)
      const response = await fetch(`./data/counties/${county.filename}`)
      if (response.ok) {
        const toilets = await response.json()
        countyDataCache.set(county.filename, toilets)
        allToilets.push(...toilets)
      }
    } catch (error) {
      console.warn(`載入 ${county.name_zh} 資料失敗:`, error)
    }
  }

  return allToilets
}

// 使用者定位
const locateUser = async (opts = {}) => {
  const { silent = false } = opts
  isLocating.value = true
  trackEvent('locate_me', { stage: 'start', source: silent ? 'auto' : 'manual' })

  try {
    const location = await getUserLocation()

    jumpTo(location)
    centerMarker.value.setLatLng(location)
    userLocation.value = location

    if (userMarker.value) {
      map.value.removeLayer(userMarker.value)
      userMarker.value = null
    }

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
      userLocation.value = location
      jumpTo(location)
      centerMarker.value.setLatLng(location)

      if (userMarker.value) {
        map.value.removeLayer(userMarker.value)
        userMarker.value = null
      }

      await updateNearbyToilets()
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

// 更新地圖範圍內的廁所
const updateNearbyToilets = async () => {
  if (!map.value || counties.value.length === 0) return

  isLoading.value = true
  loadingStatus.value = t('map.loading.detectingCounty')

  try {
    const bounds = map.value.getBounds()
    const center = map.value.getCenter()

    currentCounty.value = detectUserCounty([center.lat, center.lng], counties.value)
    loadingStatus.value = t('map.loading.loadingCounty', {
      county: currentCounty.value || t('map.loading.nearby')
    })

    const overlappingCounties = counties.value.filter(c => {
      const cb = sanitizeBounds(c.bounds)
      const buffer = 0.05 
      const countyMinLat = cb.minLat - buffer
      const countyMaxLat = cb.maxLat + buffer
      const countyMinLng = cb.minLng - buffer
      const countyMaxLng = cb.maxLng + buffer

      const mapSouth = bounds.getSouth()
      const mapNorth = bounds.getNorth()
      const mapWest = bounds.getWest()
      const mapEast = bounds.getEast()

      const latOverlap = !(countyMaxLat < mapSouth || countyMinLat > mapNorth)
      const lngOverlap = !(countyMaxLng < mapWest || countyMinLng > mapEast)
      return latOverlap && lngOverlap
    })

    let countiesData = []
    
    if (overlappingCounties.length > 0) {
      countiesData = overlappingCounties
    } else {
      const countiesToLoad = [currentCounty.value]
      if (currentCounty.value) {
        const nearbyCounties = getNearbyCounties(currentCounty.value, counties.value, [center.lat, center.lng])
        countiesToLoad.push(...nearbyCounties.slice(0, 2).map(c => c.name_en))
        countiesData = counties.value.filter(c => countiesToLoad.includes(c.name_en))
      }
      
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

    loadingStatus.value = t('map.loading.processing')
    const thisRequestId = ++currentUpdateRequestId

    const toilets = await loadToiletData(countiesData)

    if (thisRequestId !== currentUpdateRequestId) return

    const visibleToilets = toilets.filter(toilet => {
      return bounds.contains([toilet.latitude, toilet.longitude])
    })

    loadingStatus.value = t('map.loading.processingToilets')
    let finalToilets = visibleToilets

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
    updateMapMarkers()
    loadingStatus.value = t('map.loading.done')

  } catch (error) {
    console.error('更新地圖範圍廁所失敗:', error)
    loadingStatus.value = t('map.loading.failed')
  } finally {
    isLoading.value = false
    setTimeout(() => {
      loadingStatus.value = ''
    }, 1000)
  }
}

// 計算距離
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// 更新地圖標記
const updateMapMarkers = () => {
  toiletMarkers.value.forEach(marker => map.value.removeLayer(marker))
  toiletMarkers.value = []

  if (filteredToilets.value.length === 0) return

  const toiletCount = filteredToilets.value.length
  const currentZoom = map.value.getZoom()

  let baseClusterDistance = 30
  if (currentZoom >= 18) baseClusterDistance = 12
  else if (currentZoom >= 17) baseClusterDistance = 18
  else if (currentZoom >= 16) baseClusterDistance = 25
  else if (currentZoom >= 15) baseClusterDistance = 35
  else if (currentZoom >= 14) baseClusterDistance = 45
  else if (currentZoom >= 13) baseClusterDistance = 60
  else if (currentZoom >= 12) baseClusterDistance = 80
  else baseClusterDistance = 100

  const density = toiletCount / 1000
  const densityFactor = Math.min(2, Math.max(0.5, 1 + density * 0.3))
  const clusterDistance = baseClusterDistance * densityFactor

  const clusters = createToiletClusters(filteredToilets.value, clusterDistance, currentZoom)

  clusters.forEach(cluster => {
    if (cluster.toilets.length === 1) {
      createSingleToiletMarker(cluster.toilets[0])
    } else {
      createClusterMarker(cluster)
    }
  })
}

// 取得廁所 Material Symbol 名稱
const getToiletSymbol = (toilet) => {
  if (toilet.grade === 'excellent') return 'star'
  if (toilet.type === 'family') return 'child_care'
  if (hasChangingTable(toilet)) return 'baby_changing_station'
  return 'wc'
}

// 建立單個廁所標記 (M3 Custom teardrop marker)
const createSingleToiletMarker = (toilet) => {
  const gradeClass = (toilet.grade || '').toLowerCase()
  const symbol = getToiletSymbol(toilet)

  const marker = L.marker([toilet.latitude, toilet.longitude], {
    icon: L.divIcon({
      className: 'm3-toilet-marker-container',
      html: `
        <div class="m3-pin pin-grade-${gradeClass}">
          <span class="material-symbols-outlined pin-icon" aria-hidden="true">${symbol}</span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    })
  })

  marker.on('click', () => {
    selectedToilet.value = toilet
  })

  marker.addTo(map.value)
  toiletMarkers.value.push(marker)
}

// 建立聚合標記
const createClusterMarker = (cluster) => {
  const count = cluster.toilets.length
  const center = cluster.center

  let iconSize = 40
  let fontSize = 14
  let bgGradient = 'linear-gradient(135deg, #0b57d0, #0842a0)'

  if (count >= 100) {
    iconSize = 56
    fontSize = 16
    bgGradient = 'linear-gradient(135deg, #b3261e, #8c1d18)'
  } else if (count >= 50) {
    iconSize = 50
    fontSize = 15
    bgGradient = 'linear-gradient(135deg, #e65100, #b23c17)'
  } else if (count >= 20) {
    iconSize = 46
    fontSize = 14
    bgGradient = 'linear-gradient(135deg, #e0a800, #a87e00)'
  } else if (count >= 10) {
    iconSize = 42
    fontSize = 14
    bgGradient = 'linear-gradient(135deg, #146c2e, #0f5223)'
  }

  const marker = L.marker([center.lat, center.lng], {
    icon: L.divIcon({
      className: 'cluster-marker-container',
      html: `
        <div class="m3-cluster-icon" style="
          background: ${bgGradient} !important; 
          width: ${iconSize}px !important; 
          height: ${iconSize}px !important;
        ">
          <span class="cluster-count" style="font-size: ${fontSize}px !important;">${count}</span>
          <span class="material-symbols-outlined cluster-symbol" style="font-size: ${Math.max(12, fontSize)}px !important;">wc</span>
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

// 智能廁所聚合算法
const createToiletClusters = (toilets, pixelDistance, currentZoom) => {
  let clusters = []
  const processed = new Set()

  toilets.forEach((toilet, index) => {
    if (processed.has(index)) return

    const cluster = {
      toilets: [toilet],
      center: { lat: toilet.latitude, lng: toilet.longitude }
    }

    for (let i = index + 1; i < toilets.length; i++) {
      if (processed.has(i)) continue

      const other = toilets[i]
      const distance = calculatePixelDistance(
        { lat: toilet.latitude, lng: toilet.longitude },
        { lat: other.latitude, lng: other.longitude }
      )

      if (distance < pixelDistance) {
        cluster.toilets.push(other)
        processed.add(i)
        updateClusterCenter(cluster)

        let maxClusterSize
        if (currentZoom >= 18) maxClusterSize = 15
        else if (currentZoom >= 16) maxClusterSize = 30
        else if (currentZoom >= 14) maxClusterSize = 60
        else if (currentZoom >= 12) maxClusterSize = 100
        else maxClusterSize = 200

        if (cluster.toilets.length >= maxClusterSize) break
      }
    }

    clusters.push(cluster)
    processed.add(index)
  })

  clusters = performSecondaryCluster(clusters, pixelDistance * 1.5, currentZoom)
  return clusters
}

// 二次聚合
const performSecondaryCluster = (initialClusters, secondaryDistance, currentZoom) => {
  if (initialClusters.length <= 1) return initialClusters

  const finalClusters = []
  const processed = new Set()

  initialClusters.forEach((cluster, index) => {
    if (processed.has(index)) return

    let mergedCluster = { ...cluster, toilets: [...cluster.toilets] }

    for (let i = index + 1; i < initialClusters.length; i++) {
      if (processed.has(i)) continue

      const otherCluster = initialClusters[i]
      const distance = calculatePixelDistance(
        mergedCluster.center,
        otherCluster.center
      )

      if (distance < secondaryDistance) {
        mergedCluster.toilets.push(...otherCluster.toilets)
        processed.add(i)
        updateClusterCenter(mergedCluster)

        let maxTotalSize
        if (currentZoom >= 16) maxTotalSize = 50
        else if (currentZoom >= 14) maxTotalSize = 100
        else if (currentZoom >= 12) maxTotalSize = 150
        else maxTotalSize = 300

        if (mergedCluster.toilets.length >= maxTotalSize) break
      }
    }

    finalClusters.push(mergedCluster)
    processed.add(index)
  })

  return finalClusters
}

// 計算像素距離
const calculatePixelDistance = (point1, point2) => {
  if (!map.value) return Infinity

  try {
    const p1 = map.value.latLngToLayerPoint([point1.lat, point1.lng])
    const p2 = map.value.latLngToLayerPoint([point2.lat, point2.lng])
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
  } catch (error) {
    const latDiff = point1.lat - point2.lat
    const lngDiff = point1.lng - point2.lng
    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 100000
  }
}

// 更新聚合中心點
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

const showClusterModal = (toilets) => {
  clusteredToilets.value = toilets
  showClusterList.value = true
}

const focusToilet = (toilet) => {
  selectedToilet.value = toilet
  jumpTo([toilet.latitude, toilet.longitude])
  trackEvent('toilet_open', toToiletEventParams(toilet))
}

const resetFilters = () => {
  filters.value = {
    grade: '',
    type: '',
    hasDiaper: false
  }
  trackEvent('reset_filters')
}

const openNavigation = (toilet) => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${toilet.latitude},${toilet.longitude}`
  trackEvent('navigation_open', {
    provider: 'google_maps',
    ...toToiletEventParams(toilet)
  })
  window.open(url, '_blank')
}

const closeModal = () => {
  selectedToilet.value = null
}

const closeClusterModal = () => {
  showClusterList.value = false
  clusteredToilets.value = []
}

const selectClusterToilet = (toilet) => {
  selectedToilet.value = toilet
  showClusterList.value = false
  clusteredToilets.value = []
  jumpTo([toilet.latitude, toilet.longitude])
}

const closeAllToiletsModal = () => {
  showAllToiletsList.value = false
}

const selectToiletFromList = (toilet) => {
  selectedToilet.value = toilet
  showAllToiletsList.value = false
  jumpTo([toilet.latitude, toilet.longitude])
}

watch(themeResolved, (val) => {
  trackEvent('theme_applied_to_map', { resolved: val })
})

watch(filters, (newVal, oldVal) => {
  updateMapMarkers()
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

onMounted(async () => {
  await loadCounties()
  initMap()
  const ok = await locateUser({ silent: true })
  if (!ok) {
    await updateNearbyToilets()
  }
})

onUnmounted(() => {
  if (updateTimeout) clearTimeout(updateTimeout)
  if (map.value) map.value.remove()
})
</script>

<style scoped>
.map-page {
  display: flex;
  height: calc(100vh - var(--nav-h) - var(--footer-h));
  height: calc(100dvh - var(--nav-h) - var(--footer-h));
  position: relative;
  overflow: hidden;
  overscroll-behavior: contain;
  background: var(--md-sys-color-background);
}

/* Side Sheet / Control Panel */
.control-panel {
  width: 360px;
  background: var(--md-sys-color-surface-container-low);
  color: var(--md-sys-color-on-surface);
  border-right: 1px solid var(--md-sys-color-outline-variant);
  display: flex;
  flex-direction: column;
  transition: width var(--transition), background-color var(--transition);
  z-index: 1000;
  box-shadow: var(--shadow-sm);
}

.control-panel.collapsed {
  width: 56px;
}

.panel-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--md-sys-color-surface-container);
  height: 64px;
}

.panel-header-title {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--md-sys-color-primary);
  text-transform: uppercase;
}

.collapse-btn {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  color: var(--md-sys-color-on-surface-variant);
  border-radius: var(--radius-pill);
  transition: all var(--transition);
}

.collapse-btn:hover {
  background: rgba(11, 87, 208, 0.08);
  color: var(--md-sys-color-primary);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  padding: 1.25rem;
}

/* M3 Search Bar */
.custom-location {
  margin-bottom: 1.5rem;
}

.custom-location h3 {
  margin: 0 0 0.75rem 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--md-sys-color-on-surface);
}

.location-input {
  display: flex;
  align-items: center;
  background: var(--md-sys-color-surface-container-high);
  border-radius: var(--radius-xl);
  padding: 2px 6px 2px 14px;
  border: 1px solid var(--md-sys-color-outline-variant);
  transition: all var(--transition);
}

.location-input:focus-within {
  border-color: var(--md-sys-color-primary);
  background: var(--md-sys-color-surface);
  box-shadow: 0 0 0 1px var(--md-sys-color-primary);
}

.search-input-icon {
  color: var(--md-sys-color-on-surface-variant);
  font-size: 20px;
}

.location-search-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 10px 8px;
  color: var(--md-sys-color-on-surface);
  font-size: 0.9rem;
}

.location-search-input:focus {
  outline: none;
}

.btn-search {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--md-sys-color-on-surface-variant);
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition);
}

.btn-search:hover:not(:disabled) {
  background: rgba(11, 87, 208, 0.08);
  color: var(--md-sys-color-primary);
}

.btn-search:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.search-tips {
  margin: 0.4rem 0 0.5rem;
}

.search-tips small {
  color: var(--md-sys-color-on-surface-variant);
  font-style: italic;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.info-symbol {
  font-size: 14px;
}

.error-message {
  color: var(--md-sys-color-error);
  font-size: 0.8rem;
  font-weight: 500;
  margin-top: 0.4rem;
}

/* M3 Filled Button (Locate) */
.btn-primary {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: var(--md-sys-color-primary);
  color: #ffffff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-pill);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition);
  margin-bottom: 1.5rem;
}

.btn-primary:hover:not(:disabled) {
  background: var(--md-sys-color-primary-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  background: var(--md-sys-color-outline-variant);
  color: var(--md-sys-color-on-surface-variant);
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-icon {
  font-size: 18px;
}

.spin-anim {
  animation: spin 1.2s infinite linear;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Filters & Chips */
.filters {
  border-top: 1px solid var(--md-sys-color-outline-variant);
  padding-top: 1.25rem;
  margin-bottom: 1.5rem;
}

.filters h3 {
  margin: 0 0 1rem 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--md-sys-color-on-surface);
}

.filter-group {
  margin-bottom: 1rem;
}

.filter-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--md-sys-color-on-surface-variant);
  margin-bottom: 0.5rem;
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* M3 Filter Chips */
.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.85rem;
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface-variant);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition);
}

.chip:hover {
  background: var(--md-sys-color-surface-container-high);
  border-color: var(--md-sys-color-outline);
}

.chip-active {
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
  border-color: transparent;
  font-weight: 700;
}

.chip-icon {
  font-size: 14px;
}

.chip-check-icon {
  font-size: 14px;
  color: var(--md-sys-color-primary);
}

/* M3 Toggle Switch Row */
.toggle-row {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--md-sys-color-surface);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition);
}

.toggle-row:hover {
  background: var(--md-sys-color-surface-container-high);
  border-color: var(--md-sys-color-outline);
}

.toggle-active {
  background: var(--md-sys-color-primary-container);
  border-color: var(--md-sys-color-primary);
}

.toggle-text {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.toggle-icon-left {
  font-size: 20px;
  color: var(--md-sys-color-primary);
}

/* M3 Switch Component styling */
.toggle-switch {
  position: relative;
  width: 40px;
  height: 24px;
  background: var(--md-sys-color-surface-container-highest);
  border: 1.5px solid var(--md-sys-color-outline);
  border-radius: var(--radius-pill);
  flex-shrink: 0;
  transition: all var(--transition);
}

.toggle-active .toggle-switch {
  background: var(--md-sys-color-primary);
  border-color: transparent;
}

.toggle-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 14px;
  height: 14px;
  background: var(--md-sys-color-outline);
  border-radius: var(--radius-pill);
  transition: all var(--transition);
  box-shadow: var(--shadow-sm);
}

.toggle-active .toggle-knob {
  transform: translateX(18px);
  background: var(--md-sys-color-on-primary);
  width: 16px;
  height: 16px;
  top: 2px;
  left: 4px;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.btn-reset-link {
  background: transparent;
  border: none;
  color: var(--md-sys-color-primary);
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  transition: background-color var(--transition);
}

.btn-reset-link:hover:not(:disabled) {
  background: rgba(11, 87, 208, 0.08);
}

.btn-reset-link:disabled {
  color: var(--md-sys-color-outline-variant);
  cursor: not-allowed;
}

.reset-icon {
  font-size: 16px;
}

/* Toilet List */
.toilet-list {
  border-top: 1px solid var(--md-sys-color-outline-variant);
  padding-top: 1.25rem;
}

.toilet-list h3 {
  margin: 0 0 1rem 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--md-sys-color-on-surface);
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* M3 List Item style */
.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.15rem;
  background: var(--md-sys-color-surface);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--radius-md);
  text-align: left;
  cursor: pointer;
  transition: all var(--transition);
  width: 100%;
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

.result-item-main {
  flex: 1;
  min-width: 0;
}

.result-item-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.result-item-name {
  margin: 0;
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

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-xs);
  background: var(--md-sys-color-outline-variant);
  color: var(--md-sys-color-on-surface-variant);
}

.badge-grade-excellent,
.badge-grade-特優 {
  background: var(--md-sys-color-success-container);
  color: var(--md-sys-color-on-success-container);
}

.badge-grade-good,
.badge-grade-優等 {
  background: #e3f2fd;
  color: #0d47a1;
}

.badge-grade-fair,
.badge-grade-普通 {
  background: var(--md-sys-color-warning-container);
  color: var(--md-sys-color-on-warning-container);
}

.badge-grade-fail,
.badge-grade-不合,
.badge-grade-不合格 {
  background: var(--md-sys-color-error-container);
  color: var(--md-sys-color-on-error-container);
}

.badge-soft {
  background: var(--md-sys-color-surface-container-highest);
  color: var(--md-sys-color-on-surface-variant);
}

.badge-icon-symbol {
  font-size: 12px;
}

/* Nav Button in List Item */
.result-item-nav {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-pill);
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  border: none;
  cursor: pointer;
  transition: all var(--transition);
  margin-left: 0.75rem;
  flex-shrink: 0;
}

.result-item-nav:hover {
  background: var(--md-sys-color-primary);
  color: #ffffff;
  transform: scale(1.05);
}

.result-item-nav .material-symbols-outlined {
  font-size: 18px;
}

.view-all-btn-container {
  margin-top: 1rem;
  text-align: center;
}

.btn-view-all {
  background: transparent;
  border: 1px solid var(--md-sys-color-outline);
  color: var(--md-sys-color-primary);
  font-weight: 600;
  font-size: 0.88rem;
  padding: 0.5rem 1.25rem;
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: all var(--transition);
}

.btn-view-all:hover {
  background: var(--md-sys-color-primary-container);
  border-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary-container);
}

/* Empty State */
.no-data {
  text-align: center;
  padding: 2.5rem 1rem;
  color: var(--md-sys-color-on-surface-variant);
}

.empty-icon-container {
  margin-bottom: 0.75rem;
}

.empty-icon {
  font-size: 40px;
  color: var(--md-sys-color-outline-variant);
}

.no-data p {
  font-size: 0.9rem;
  line-height: 1.5;
}

/* Skeleton Loading */
.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.skeleton-card {
  padding: 1rem 1.15rem;
  background: var(--md-sys-color-surface);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--radius-md);
}

.skeleton {
  background: linear-gradient(90deg, 
    var(--md-sys-color-surface-container) 25%, 
    var(--md-sys-color-surface-container-high) 50%, 
    var(--md-sys-color-surface-container) 75%);
  background-size: 200% 100%;
  animation: pulse-glow 1.5s infinite linear;
  border-radius: var(--radius-xs);
}

@keyframes pulse-glow {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-line {
  height: 14px;
  margin-bottom: 0.5rem;
}

.w-70 { width: 70%; }
.w-90 { width: 90%; }

.skeleton-row {
  display: flex;
  gap: 0.4rem;
}

.skeleton-pill {
  width: 45px;
  height: 20px;
  border-radius: var(--radius-xs);
}

.skeleton-status {
  text-align: center;
  font-size: 0.8rem;
  color: var(--md-sys-color-on-surface-variant);
  margin-top: 0.5rem;
}

/* Map Container */
.map-container {
  flex: 1;
  position: relative;
  height: 100%;
}

#map {
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* Map Controls (FAB) */
.map-controls {
  position: absolute;
  right: 16px;
  bottom: 16px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fab-btn {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  border: none;
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition);
}

.fab-btn:hover {
  background: var(--md-sys-color-surface-container-highest);
  box-shadow: var(--shadow-lg);
  transform: scale(1.03);
}

.fab-btn .material-symbols-outlined {
  font-size: 24px;
}

/* Dialog Modals (M3 standard style) */
.toilet-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}

.modal-content-v2 {
  background: var(--md-sys-color-surface-container-high);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 500px;
  padding: 1.75rem;
  box-shadow: var(--shadow-lg);
  position: relative;
  animation: modal-up 0.25s cubic-bezier(0.2, 0, 0, 1);
  display: flex;
  flex-direction: column;
  max-height: 85vh;
}

@keyframes modal-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-pill);
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer;
  transition: all var(--transition);
}

.close-btn:hover {
  background: rgba(11, 87, 208, 0.08);
  color: var(--md-sys-color-on-surface);
}

.close-btn .material-symbols-outlined {
  font-size: 20px;
}

.modal-header {
  margin-bottom: 1.25rem;
  padding-right: 1.5rem;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--md-sys-color-on-surface);
  margin: 0 0 0.35rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-header-icon {
  color: var(--md-sys-color-primary);
  font-size: 24px;
}

.modal-subtitle {
  font-size: 0.85rem;
  color: var(--md-sys-color-on-surface-variant);
  margin: 0;
}

.modal-content-v2 .result-list {
  overflow-y: auto;
  padding: 0.25rem 0.1rem;
}

/* Details dialog callout & data rows */
.modal-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.5rem;
}

.distance-callout {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: var(--md-sys-color-primary-container);
  border-radius: var(--radius-md);
  margin-bottom: 1.25rem;
  align-self: flex-start;
}

.distance-icon {
  font-size: 20px;
  color: var(--md-sys-color-on-primary-container);
}

.distance-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--md-sys-color-on-primary-container);
}

.distance-label {
  font-size: 0.8rem;
  color: var(--md-sys-color-on-primary-container);
  opacity: 0.85;
}

.modal-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-row dt {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--md-sys-color-on-surface-variant);
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.detail-icon {
  font-size: 16px;
  color: var(--md-sys-color-primary);
}

.info-row dd {
  font-size: 0.95rem;
  color: var(--md-sys-color-on-surface);
  margin: 0;
  padding-left: 1.5rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
}

.btn-nav-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: var(--md-sys-color-primary);
  color: #ffffff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-pill);
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all var(--transition);
  box-shadow: var(--shadow-sm);
  width: 100%;
}

.btn-nav-primary:hover {
  background: var(--md-sys-color-primary-hover);
  box-shadow: var(--shadow-md);
}

.nav-btn-icon {
  font-size: 18px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .map-page {
    flex-direction: column;
  }

  .control-panel {
    width: 100% !important;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--md-sys-color-outline-variant);
    box-shadow: var(--shadow-sm);
  }

  .control-panel.collapsed {
    height: 56px;
  }

  .panel-content {
    max-height: 40vh;
  }

  .map-container {
    height: 100%;
  }

  .modal-content-v2 {
    max-width: 100%;
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    margin-bottom: 0;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    max-height: 75vh;
  }
}
</style>

<style>
/* =============================================
   Leaflet Custom M3 Style Overrides
   ============================================= */

/* Dark mode mapping layer filter */
[data-theme="dark"] .leaflet-tile-pane {
  filter: invert(1) hue-rotate(180deg) brightness(0.95) contrast(0.85) saturate(0.8);
}

[data-theme="dark"] .leaflet-control-attribution {
  background: rgba(19, 28, 48, 0.85) !important;
  color: #b3c0d1 !important;
}

/* M3 Single Toilet Marker Pin */
.m3-toilet-marker-container {
  background: none !important;
  border: none !important;
  display: flex;
  justify-content: center;
  align-items: center;
}

.m3-pin {
  width: 32px;
  height: 32px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  background: var(--md-sys-color-primary);
  border: 2px solid #ffffff;
  box-shadow: var(--md-elevation-1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition);
}

.m3-pin:hover {
  transform: rotate(-45deg) scale(1.15);
  box-shadow: var(--md-elevation-2);
}

.pin-icon {
  transform: rotate(45deg);
  font-size: 16px !important;
  color: #ffffff;
  line-height: 1;
}

/* Marker Grade Color Schemes */
.pin-grade-excellent {
  background: var(--md-sys-color-success) !important;
}

.pin-grade-good {
  background: #0288d1 !important;
}

.pin-grade-fair {
  background: var(--md-sys-color-warning) !important;
}

.pin-grade-needsimprovement {
  background: #e91e63 !important;
}

.pin-grade-fail {
  background: var(--md-sys-color-error) !important;
}

/* M3 Center Location Marker */
.m3-center-marker {
  background: none !important;
  border: none !important;
  display: flex;
  justify-content: center;
  align-items: center;
}

.center-pin {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-pill);
  background: var(--md-sys-color-primary-container);
  border: 3px solid var(--md-sys-color-primary);
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: var(--md-elevation-2);
  animation: bounce-marker 1s infinite alternate;
}

.center-pin-icon {
  color: var(--md-sys-color-primary);
  font-size: 24px !important;
}

@keyframes bounce-marker {
  from { transform: translateY(0); }
  to { transform: translateY(-5px); }
}

/* M3 Map Cluster Badges */
.cluster-marker-container {
  background: none !important;
  border: none !important;
}

.m3-cluster-icon {
  background: linear-gradient(135deg, #0b57d0, #0842a0) !important;
  border: 3px solid #ffffff !important;
  border-radius: var(--radius-pill) !important;
  width: 40px !important;
  height: 40px !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: var(--md-elevation-2) !important;
  cursor: pointer !important;
  transition: all var(--transition) !important;
  overflow: hidden !important;
  color: #ffffff !important;
}

.m3-cluster-icon:hover {
  transform: scale(1.08) !important;
  box-shadow: var(--md-elevation-3) !important;
}

.cluster-count {
  font-weight: 700;
  line-height: 1.1 !important;
}

.cluster-symbol {
  font-size: 11px !important;
  opacity: 0.85;
}
</style>
