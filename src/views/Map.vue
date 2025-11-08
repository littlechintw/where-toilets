<template>
  <div class="map-page">
    <!-- 控制面板 -->
    <div class="control-panel" :class="{ collapsed: isPanelCollapsed }">
      <div class="panel-header">
        <h2>🚽 {{ $t('map.title') }}</h2>
        <button @click="isPanelCollapsed = !isPanelCollapsed" class="collapse-btn">
          {{ isPanelCollapsed ? '▶' : '◀' }}
        </button>
      </div>
      
      <div class="panel-content" v-show="!isPanelCollapsed">
        <!-- 自訂位置搜尋 -->
        <div class="custom-location">
          <h3>{{ $t('map.customLocation.title') }}</h3>
          <div class="location-input">
            <input 
              v-model="customLocationInput" 
              @keyup.enter="searchCustomLocation"
              :placeholder="$t('map.customLocation.placeholder')"
              class="location-search-input"
            >
            <button @click="searchCustomLocation" class="btn-search" :disabled="isSearching">
              {{ isSearching ? '🔄' : '🔍' }}
            </button>
          </div>
          <div class="search-tips">
            <small>💡 {{ $t('map.customLocation.searchTip') }}</small>
          </div>
          <div v-if="searchError" class="error-message">
            {{ searchError }}
          </div>
        </div>
        
        <!-- 定位按鈕 -->
        <button @click="locateUser" class="btn btn-primary" :disabled="isLocating">
          <span v-if="isLocating">🔄</span>
          <span v-else>📍</span>
          {{ isLocating ? $t('map.locating') : $t('map.locate') }}
        </button>
        
        <!-- 使用說明 -->
        <div class="usage-tips">
          <div class="usage-tips-header" @click="showUsageTips = !showUsageTips">
            <h4>💡 {{ $t('map.usageTips.title') }}</h4>
            <span class="toggle-icon">{{ showUsageTips ? '▼' : '▶' }}</span>
          </div>
          <div v-show="showUsageTips" class="usage-tips-content">
            <ul>
              <li>📍 {{ $t('map.usageTips.tip1') }}</li>
              <li>�️ {{ $t('map.usageTips.tip2') }}</li>
              <li>📱 {{ $t('map.usageTips.tip3') }}</li>
              <li>🎯 {{ $t('map.usageTips.tip4') }}</li>
              <li>🔎 {{ $t('map.usageTips.tip5') }}</li>
              <li>🔍 {{ $t('map.usageTips.tip6') }}</li>
            </ul>
          </div>
        </div>
        
        <!-- 篩選器 -->
        <div class="filters">
          <h3>{{ $t('map.filters.title') }}</h3>
          
          <div class="filter-group">
            <label>{{ $t('map.filters.grade.label') }}</label>
            <select v-model="filters.grade">
              <option value="">{{ $t('map.filters.grade.all') }}</option>
              <option value="特優">{{ $t('map.filters.grade.excellent') }}</option>
              <option value="優等">{{ $t('map.filters.grade.good') }}</option>
              <option value="普通">{{ $t('map.filters.grade.fair') }}</option>
              <option value="加強">{{ $t('map.filters.grade.needsImprovement') }}</option>
              <option value="不合格">{{ $t('map.filters.grade.fail') }}</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>{{ $t('map.filters.type.label') }}</label>
            <select v-model="filters.type">
              <option value="">{{ $t('map.filters.type.all') }}</option>
              <option value="男">{{ $t('map.filters.type.male') }}</option>
              <option value="女">{{ $t('map.filters.type.female') }}</option>
              <option value="男女">{{ $t('map.filters.type.mixed') }}</option>
              <option value="無障礙">{{ $t('map.filters.type.accessible') }}</option>
              <option value="親子">{{ $t('map.filters.type.family') }}</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>
              <input type="checkbox" v-model="filters.hasDiaper">
              {{ $t('map.filters.diaper') }}
            </label>
          </div>
          
          <div class="filter-group">
            <button @click="resetFilters" class="btn-reset">
              🔄 {{ $t('map.filters.reset') }}
            </button>
          </div>
        </div>
        
        <!-- 效能設定 -->
        <div class="performance-settings">
          <div class="performance-settings-header" @click="showPerformanceSettings = !showPerformanceSettings">
            <h3>⚡ 效能設定</h3>
            <span class="toggle-icon">{{ showPerformanceSettings ? '▼' : '▶' }}</span>
          </div>
          
          <div v-show="showPerformanceSettings" class="performance-settings-content">
            <div class="setting-item">
              <label>
                <input type="checkbox" v-model="performanceSettings.enableHighPerformanceMode" @change="onPerformanceSettingChange">
                🚀 高效能模式 (建議開啟)
              </label>
              <small class="setting-description">載入較少資料，提升流暢度。預設開啟以確保最佳體驗。</small>
            </div>
            
            <div class="setting-item">
              <label>每區域最大廁所數量: {{ performanceSettings.maxToiletsPerArea }}</label>
              <input 
                type="range" 
                v-model="performanceSettings.maxToiletsPerArea"
                @input="onPerformanceSettingChange"
                min="50" 
                max="1000" 
                step="50"
                class="range-slider"
              >
              <div class="range-labels">
                <span>50</span>
                <span>1000</span>
              </div>
            </div>
            
            <div class="setting-item">
              <label>地圖最大標記數量: {{ performanceSettings.maxVisibleMarkers }}</label>
              <input 
                type="range" 
                v-model="performanceSettings.maxVisibleMarkers"
                @input="onPerformanceSettingChange"
                min="50" 
                max="500" 
                step="25"
                class="range-slider"
              >
              <div class="range-labels">
                <span>50</span>
                <span>500</span>
              </div>
            </div>
            
            <div class="performance-info">
              <small>💡 已啟用高效能模式以確保流暢體驗。如需查看更多廁所，可調高數值或關閉高效能模式。</small>
            </div>
            
            <button @click="resetPerformanceSettings" class="btn-reset-small">
              🔄 恢復預設值
            </button>
          </div>
        </div>
        
        <!-- 效能警告 -->
        <div v-if="performanceWarning" class="performance-warning">
          <div class="warning-icon">⚠️</div>
          <div class="warning-content">
            <strong>效能提示</strong>
            <p>{{ performanceWarning }}</p>
            <button v-if="!performanceSettings.enableHighPerformanceMode" 
                    @click="enableHighPerformanceMode" 
                    class="btn-warning-action">
              啟用高效能模式
            </button>
            <button v-else-if="performanceWarning.includes('縮小查看範圍')" 
                    @click="zoomInForBetterPerformance" 
                    class="btn-warning-action">
              縮小查看範圍
            </button>
            <button @click="dismissPerformanceWarning" class="btn-dismiss">
              知道了
            </button>
          </div>
        </div>
        
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
          <h3>{{ $t('map.toiletList.title') }} ({{ filteredToilets.length }}個)</h3>
          
          <!-- 控制面板列表（總是只顯示前5個） -->
          <div class="control-panel-list">
            <div class="toilet-item" 
                 v-for="toilet in displayedToilets" 
                 :key="toilet.id"
                 @click="focusToilet(toilet)"
                 :class="{ active: selectedToilet?.id === toilet.id }">
              
              <div class="toilet-compact-info">
                <div class="toilet-name-row">
                  <h4>{{ toilet.name_zh }}</h4>
                  <span class="distance-badge">{{ formatDistance(toilet.distance) }}</span>
                </div>
                <p class="address-compact">{{ toilet.address_zh }}</p>
                <div class="toilet-meta-compact">
                  <span class="grade-compact" :class="toilet.grade">{{ toilet.grade_zh }}</span>
                  <span class="type-compact">{{ toilet.type_zh }}</span>
                  <span v-if="hasChangingTable(toilet)" class="feature-compact">🍼</span>
                  <button @click.stop="openNavigation(toilet)" class="btn-nav-compact">
                    🧭
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 查看全部按鈕（當有更多項目時顯示） -->
          <div class="view-all-btn-container" v-if="filteredToilets.length > displayLimit">
            <button @click="showAllToiletsList = true" class="btn-view-all">
              {{ $t('map.toiletList.viewAll') }} {{ filteredToilets.length }} 個廁所
            </button>
          </div>
          
          <!-- 效能提示 -->
          <div v-if="filteredToilets.length > 100" class="performance-notice">
            <small>💡 資料量較大，已啟用優化顯示模式</small>
          </div>
        </div>
        
        <div v-else-if="!isLoading && filteredToilets.length === 0" class="no-data">
          <p>{{ userLocation ? $t('map.toiletList.noData') : $t('map.toiletList.needLocation') }}</p>
        </div>
        
        <div v-if="isLoading" class="loading">
          <div class="loading-spinner"></div>
          <p>{{ $t('common.loading') }}...</p>
          <div class="loading-progress">
            <div class="progress-bar"></div>
          </div>
          <small>{{ loadingStatus }}</small>
        </div>
      </div>
    </div>
    
    <!-- 地圖容器 -->
    <div class="map-container">
      <div id="map" ref="mapContainer"></div>
      
      <!-- 地圖控制 -->
      <div class="map-controls">
        <button @click="locateUser" class="map-control-btn" :disabled="isLocating">
          📍
        </button>
      </div>
    </div>
    
    <!-- 聚合廁所列表彈窗 -->
    <div v-if="showClusterList" class="toilet-modal" @click="closeClusterModal">
      <div class="modal-content cluster-modal" @click.stop>
        <button @click="closeClusterModal" class="close-btn">✕</button>
        
        <h3>📍 {{ $t('map.toiletList.cluster.title') }} ({{ clusteredToilets.length }}個)</h3>
        
        <div class="cluster-toilet-list">
          <div class="cluster-toilet-item" 
               v-for="toilet in clusteredToilets" 
               :key="toilet.id"
               @click="selectClusterToilet(toilet)">
            
            <div class="toilet-info">
              <h4>{{ toilet.name_zh }}</h4>
              <p class="address">{{ toilet.address_zh }}</p>
              <div class="toilet-meta">
                <span class="grade" :class="toilet.grade">{{ toilet.grade_zh }}</span>
                <span class="type">{{ toilet.type_zh }}</span>
                <span v-if="hasChangingTable(toilet)" class="feature">🍼 尿布台</span>
                <span class="distance" v-if="toilet.distance">{{ formatDistance(toilet.distance) }}</span>
              </div>
            </div>
            
            <div class="toilet-actions">
              <button @click.stop="openNavigation(toilet)" class="btn-nav">
                🧭 導航
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 全部廁所列表彈窗 -->
    <div v-if="showAllToiletsList" class="toilet-modal" @click="closeAllToiletsModal">
      <div class="modal-content all-toilets-modal" @click.stop>
        <button @click="closeAllToiletsModal" class="close-btn">✕</button>
        
        <h3>🗺️ {{ $t('map.toiletList.title') }} ({{ filteredToilets.length }}個)</h3>
        
        <div class="all-toilets-list">
          <div class="all-toilet-item" 
               v-for="toilet in filteredToilets" 
               :key="toilet.id"
               @click="selectToiletFromList(toilet)">
            
            <div class="toilet-compact-info">
              <div class="toilet-name-row">
                <h4>{{ toilet.name_zh }}</h4>
                <span class="distance-badge" v-if="toilet.distance">{{ formatDistance(toilet.distance) }}</span>
              </div>
              <p class="address-compact">{{ toilet.address_zh }}</p>
              <div class="toilet-meta-compact">
                <span class="grade-compact" :class="toilet.grade">{{ toilet.grade_zh }}</span>
                <span class="type-compact">{{ toilet.type_zh }}</span>
                <span v-if="hasChangingTable(toilet)" class="feature-compact">🍼</span>
                <button @click.stop="openNavigation(toilet)" class="btn-nav-compact">
                  🧭
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 廁所詳情彈窗 -->
    <div v-if="selectedToilet" class="toilet-modal" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button @click="closeModal" class="close-btn">✕</button>
        
        <h3>{{ selectedToilet.name_zh }}</h3>
        <p class="address">{{ selectedToilet.address_zh }}</p>
        
        <div class="toilet-details">
          <div class="detail-item">
            <strong>{{ $t('map.toiletInfo.grade') }}：</strong>
            <span :class="selectedToilet.grade">{{ selectedToilet.grade_zh }}</span>
          </div>
          <div class="detail-item">
            <strong>{{ $t('map.toiletInfo.type') }}：</strong>
            {{ selectedToilet.type_zh }}
          </div>
          <div class="detail-item">
            <strong>{{ $t('map.toiletInfo.category') }}：</strong>
            {{ selectedToilet.category_zh }}
          </div>
          <div class="detail-item">
            <strong>{{ $t('map.toiletInfo.diaper') }}：</strong>
            {{ hasChangingTable(selectedToilet) ? $t('map.toiletInfo.hasDialper') : $t('map.toiletInfo.noDialper') }}
          </div>
          <div class="detail-item" v-if="selectedToilet.distance">
            <strong>{{ $t('map.toiletInfo.distance') }}：</strong>
            {{ formatDistance(selectedToilet.distance) }}
          </div>
          <div class="detail-item" v-if="selectedToilet.manager">
            <strong>{{ $t('map.toiletInfo.manager') }}：</strong>
            {{ selectedToilet.manager }}
          </div>
        </div>
        
        <div class="modal-actions">
          <button @click="openNavigation(selectedToilet)" class="btn btn-primary">
            🧭 {{ $t('map.toiletInfo.navigation') }}
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
import { getUserLocation, findNearestToilets, detectUserCounty, getNearbyCounties, formatDistance } from '../utils/geo'

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
const clusteredToilets = ref([]) // 聚合廁所列表（改名避免衝突）
const showClusterList = ref(false) // 顯示聚合列表
const showAllToiletsList = ref(false) // 顯示所有廁所列表彈窗
const displayLimit = ref(5) // 預設顯示數量
const counties = ref([])
const currentCounty = ref(null)
const isLoading = ref(false)
const isLocating = ref(false)
const isPanelCollapsed = ref(false)

// 載入狀態和錯誤處理
const loadingStatus = ref('')
const performanceWarning = ref('')

// 地圖範圍統計
const totalLoadedToilets = ref(0) // 總載入廁所數量
const visibleToiletsCount = ref(0) // 可見範圍內廁所數量  
const mapMarkersCount = ref(0) // 地圖標記數量

// 效能控制設定
const performanceSettings = ref({
  maxToiletsPerArea: 300, // 每個區域最大廁所數量（預設啟用高效能）
  maxVisibleMarkers: 150, // 地圖上最大標記數量（預設啟用高效能）
  autoClusterThreshold: 50, // 自動聚合閾值（預設啟用高效能）
  enableHighPerformanceMode: true // 高效能模式（預設開啟）
})

// 自訂位置搜尋
const customLocationInput = ref('')
const isSearching = ref(false)
const searchError = ref('')
const showUsageTips = ref(false) // 控制使用說明的顯示/隱藏
const showPerformanceSettings = ref(false) // 控制效能設定的顯示/隱藏

// 更新延遲計時器
let updateTimeout = null

// 篩選器
const filters = ref({
  grade: '',
  type: '',
  hasDiaper: false
})

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
  
  console.log('篩選後廁所數量:', filtered.length)
  return filtered
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

// 初始化地圖
const initMap = () => {
  // 統一使用 zoom 16 作為標準找廁所層級
  map.value = L.map(mapContainer.value).setView([23.8, 121], 12)
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map.value)
  
  // 建立可拖曳的中心標記，初始位置在台北，使用標準縮放層級
  createCenterMarker([25.0330, 121.5654])
  
  // 地圖點擊事件
  map.value.on('click', () => {
    selectedToilet.value = null
  })
  
  // 縮放或移動改變時重新載入廁所
  map.value.on('zoomend moveend', () => {
    updateMapMarkers()
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

// 載入廁所資料
const loadToiletData = async (countyList) => {
  const allToilets = []
  
  for (const county of countyList) {
    try {
      const response = await fetch(`./data/counties/${county.filename}`)
      if (response.ok) {
        const toilets = await response.json()
        allToilets.push(...toilets)
      }
    } catch (error) {
      console.warn(`載入 ${county.name_zh} 資料失敗:`, error)
    }
  }
  
  return allToilets
}

// 使用者定位
const locateUser = async () => {
  isLocating.value = true
  
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
    
  } catch (error) {
    alert(`定位失敗: ${error.message}`)
  } finally {
    isLocating.value = false
  }
}

// 搜尋自訂位置
const searchCustomLocation = async () => {
  if (!customLocationInput.value.trim()) return
  
  isSearching.value = true
  searchError.value = ''
  
  try {
    let location = null
    const input = customLocationInput.value.trim()
    
    // 檢查是否為座標格式 (緯度,經度)
    const coordPattern = /^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/
    const coordMatch = input.match(coordPattern)
    
    if (coordMatch) {
      // 直接使用座標
      const lat = parseFloat(coordMatch[1])
      const lng = parseFloat(coordMatch[2])
      
      // 驗證座標範圍（台灣範圍）
      if (lat >= 20 && lat <= 26 && lng >= 118 && lng <= 122) {
        location = [lat, lng]
      } else {
        throw new Error(t('map.customLocation.errorOutOfRange'))
      }
    } else {
      // 使用地理編碼服務搜尋地址
      location = await geocodeAddress(input)
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
    }
    
  } catch (error) {
    searchError.value = error.message || '搜尋失敗，請檢查輸入格式'
  } finally {
    isSearching.value = false
  }
}

// 地理編碼服務（將地址轉換為座標）
const geocodeAddress = async (address) => {
  try {
    // 使用免費的 Nominatim 地理編碼服務
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address + ', 台灣')}&format=json&limit=1&countrycodes=tw`
    )
    
    if (!response.ok) {
      throw new Error('地理編碼服務無法連接')
    }
    
    const data = await response.json()
    
    if (data.length === 0) {
      throw new Error(t('map.customLocation.errorNotFound'))
    }
    
    const result = data[0]
    return [parseFloat(result.lat), parseFloat(result.lon)]
    
  } catch (error) {
    throw new Error('地址搜尋失敗：' + error.message)
  }
}

// 更新地圖範圍內的廁所
const updateNearbyToilets = async () => {
  if (!map.value || counties.value.length === 0) return
  
  isLoading.value = true
  loadingStatus.value = '正在定位縣市...'
  const loadingStartTime = Date.now()
  
  try {
    // 取得地圖可見範圍
    const bounds = map.value.getBounds()
    const center = map.value.getCenter()
    
    // 判斷地圖中心所在縣市
    currentCounty.value = detectUserCounty([center.lat, center.lng], counties.value)
    loadingStatus.value = `正在載入 ${currentCounty.value || '附近'} 的廁所資料...`
    
    // 根據縮放層級動態調整載入策略
    const currentZoom = map.value.getZoom()
    let maxToiletsToLoad = performanceSettings.value.maxToiletsPerArea
    
    // 根據縮放層級調整載入數量
    if (currentZoom >= 16) {
      maxToiletsToLoad = Math.min(300, maxToiletsToLoad) // 近距離查看
    } else if (currentZoom >= 14) {
      maxToiletsToLoad = Math.min(200, maxToiletsToLoad) // 中距離
    } else if (currentZoom >= 12) {
      maxToiletsToLoad = Math.min(150, maxToiletsToLoad) // 遠距離
    } else {
      maxToiletsToLoad = Math.min(100, maxToiletsToLoad) // 很遠距離
    }
    
    // 高效能模式進一步限制
    if (performanceSettings.value.enableHighPerformanceMode) {
      maxToiletsToLoad = Math.floor(maxToiletsToLoad * 0.6)
    }
    
    // 取得需要載入的縣市（當前縣市 + 鄰近縣市）
    const countiesToLoad = [currentCounty.value]
    if (currentCounty.value) {
      const nearbyCounties = getNearbyCounties(currentCounty.value, counties.value, [center.lat, center.lng])
      // 限制同時載入的縣市數量
      const maxCounties = currentZoom >= 14 ? 3 : 2
      countiesToLoad.push(...nearbyCounties.slice(0, maxCounties - 1).map(c => c.name_en))
    }
    
    // 如果無法判斷縣市，載入少量資料作為備案
    const countiesData = countiesToLoad.length > 1 
      ? counties.value.filter(c => countiesToLoad.includes(c.name_en))
      : counties.value.slice(0, 2) // 只載入前2個縣市作為備案
    
    loadingStatus.value = '正在處理資料...'
    
    // 載入廁所資料
    const toilets = await loadToiletData(countiesData)
    totalLoadedToilets.value = toilets.length
    
    // 篩選地圖可見範圍內的廁所
    const visibleToilets = toilets.filter(toilet => {
      return bounds.contains([toilet.latitude, toilet.longitude])
    })
    
    visibleToiletsCount.value = visibleToilets.length
    
    console.log(`載入了 ${toilets.length} 個廁所，可見範圍內有 ${visibleToilets.length} 個`)
    
    // 檢查是否需要效能警告
    if (performanceSettings.value.enableHighPerformanceMode) {
      // 高效能模式下的警告
      if (visibleToilets.length > 3000) {
        performanceWarning.value = `目前區域找到 ${visibleToilets.length} 個廁所，數量極多。建議縮小查看範圍以獲得最佳體驗。`
      } else if (visibleToilets.length > 1000) {
        performanceWarning.value = `目前區域找到 ${visibleToilets.length} 個廁所，已啟用高效能模式確保流暢運行。⚠️ 關閉高效能模式可能導致速度變慢。`
      }
    } else {
      // 非高效能模式下的警告
      if (visibleToilets.length > 800) {
        performanceWarning.value = `目前區域找到 ${visibleToilets.length} 個廁所，未啟用高效能模式可能影響效能。強烈建議啟用高效能模式。`
      }
    }
    
    loadingStatus.value = '正在優化顯示...'
    
    // 智慧限制：如果廁所數量過多，優先保留高品質和離用戶較近的廁所
    let finalToilets = visibleToilets
    if (visibleToilets.length > maxToiletsToLoad) {
      console.warn(`廁所數量過多 (${visibleToilets.length})，啟用智慧篩選，限制為 ${maxToiletsToLoad} 個`)
      
      // 如果有用戶位置，計算距離
      if (userLocation.value) {
        visibleToilets.forEach(toilet => {
          toilet.distance = calculateDistance(
            userLocation.value[0],
            userLocation.value[1],
            toilet.latitude,
            toilet.longitude
          )
          
          // 計算綜合評分（距離 + 品質）
          let qualityScore = 0
          if (toilet.grade === '特優級' || toilet.grade === '特優') qualityScore = 5
          else if (toilet.grade === '優等' || toilet.grade === '優') qualityScore = 4
          else if (toilet.grade === '普通') qualityScore = 3
          else if (toilet.grade === '加強') qualityScore = 2
          else qualityScore = 1
          
          // 距離分數 (越近分數越高，最大10分)
          const maxDistance = 5 // 5公里
          const distanceScore = Math.max(0, 10 - (toilet.distance / maxDistance) * 10)
          
          // 綜合評分 = 品質分數 * 0.3 + 距離分數 * 0.7
          toilet.combinedScore = qualityScore * 0.3 + distanceScore * 0.7
        })
        
        // 按綜合評分排序並取前N個
        finalToilets = visibleToilets
          .sort((a, b) => b.combinedScore - a.combinedScore)
          .slice(0, maxToiletsToLoad)
      } else {
        // 沒有用戶位置時，優先顯示高品質廁所
        finalToilets = visibleToilets
          .sort((a, b) => {
            const gradeOrder = { '特優級': 5, '特優': 5, '優等': 4, '優': 4, '普通': 3, '加強': 2, '不合格': 1 }
            return (gradeOrder[b.grade] || 1) - (gradeOrder[a.grade] || 1)
          })
          .slice(0, maxToiletsToLoad)
      }
    }
    
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
    
    // 載入時間分析
    const loadingTime = Date.now() - loadingStartTime
    if (performanceSettings.value.enableHighPerformanceMode) {
      // 高效能模式下的載入時間警告
      if (loadingTime > 8000) {
        performanceWarning.value = `資料載入耗時 ${Math.round(loadingTime/1000)}秒，建議縮小查看範圍或檢查網路連線。`
      }
    } else {
      // 非高效能模式下的載入時間警告  
      if (loadingTime > 4000) {
        performanceWarning.value = `資料載入耗時 ${Math.round(loadingTime/1000)}秒，強烈建議啟用高效能模式以提升速度。⚠️ 當前設定可能導致應用程式變慢或當機。`
      }
    }
    
    loadingStatus.value = '載入完成'
    
  } catch (error) {
    console.error('更新地圖範圍廁所失敗:', error)
    loadingStatus.value = '載入失敗，請稍後重試'
    
    // 自動重試機制
    setTimeout(() => {
      if (map.value && counties.value.length > 0) {
        updateNearbyToilets()
      }
    }, 3000)
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
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// 更新地圖標記
const updateMapMarkers = () => {
  // 清除現有標記
  toiletMarkers.value.forEach(marker => map.value.removeLayer(marker))
  toiletMarkers.value = []
  
  if (filteredToilets.value.length === 0) {
    mapMarkersCount.value = 0
    return
  }
  
  const currentZoom = map.value.getZoom()
  const toiletCount = filteredToilets.value.length
  
  // 智慧決定是否需要聚合
  let shouldCluster = false
  let clusterDistance = 30
  
  // 高密度區域或大量標記時強制聚合
  if (toiletCount > performanceSettings.value.autoClusterThreshold) {
    shouldCluster = true
    // 根據數量動態調整聚合距離
    if (toiletCount > 300) clusterDistance = 80
    else if (toiletCount > 200) clusterDistance = 60
    else if (toiletCount > 100) clusterDistance = 40
    else clusterDistance = 30
  } else {
    // 根據縮放層級決定聚合距離
    if (currentZoom >= 17) {
      clusterDistance = 15 // 很近距離才聚合
      shouldCluster = toiletCount > 20
    } else if (currentZoom >= 15) {
      clusterDistance = 25 // 中等距離聚合
      shouldCluster = toiletCount > 15
    } else if (currentZoom >= 13) {
      clusterDistance = 40 // 較遠距離聚合
      shouldCluster = toiletCount > 10
    } else {
      clusterDistance = 60 // 很遠距離聚合
      shouldCluster = true
    }
  }
  
  // 高效能模式下更積極聚合
  if (performanceSettings.value.enableHighPerformanceMode) {
    shouldCluster = toiletCount > 10
    clusterDistance += 20
  }
  
  console.log(`標記更新: ${toiletCount} 個廁所, zoom: ${currentZoom}, 聚合: ${shouldCluster}, 距離: ${clusterDistance}`)
  
  if (shouldCluster) {
    createClusteredMarkers(clusterDistance)
  } else {
    // 直接顯示個別標記，但仍要限制數量避免效能問題
    const markersToShow = Math.min(toiletCount, performanceSettings.value.maxVisibleMarkers)
    const toiletsToShow = filteredToilets.value.slice(0, markersToShow)
    
    toiletsToShow.forEach(toilet => {
      createSingleToiletMarker(toilet)
    })
    
    if (markersToShow < toiletCount) {
      console.warn(`僅顯示前 ${markersToShow} 個標記，共有 ${toiletCount} 個廁所`)
    }
  }
  
  // 更新標記數量統計
  mapMarkersCount.value = toiletMarkers.value.length
}

// 建立聚合標記
const createClusteredMarkers = (clusterDistance = 50) => {
  const clusters = clusterToilets(filteredToilets.value, clusterDistance)
  
  clusters.forEach(cluster => {
    if (cluster.toilets.length === 1) {
      // 單個廁所，建立普通標記
      createSingleToiletMarker(cluster.toilets[0])
    } else {
      // 多個廁所，建立聚合標記
      createClusterMarker(cluster)
    }
  })
  
  // 更新標記數量統計
  mapMarkersCount.value = toiletMarkers.value.length
}

// 移除不再使用的 createIndividualMarkers 函數

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

// 建立聚合標記
const createClusterMarker = (cluster) => {
  const count = cluster.toilets.length
  const center = cluster.center
  
  const marker = L.marker([center.lat, center.lng], {
    icon: L.divIcon({
      className: 'cluster-marker',
      html: `
        <div class="cluster-icon">
          <span class="cluster-count">${count}</span>
          <span class="cluster-emoji">🚽</span>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    })
  })
  
  marker.on('click', () => {
    showClusterModal(cluster.toilets)
  })
  
  marker.addTo(map.value)
  toiletMarkers.value.push(marker)
}

// 廁所聚合算法
const clusterToilets = (toilets, pixelDistance) => {
  const clusters = []
  const processed = new Set()
  
  // 高效能模式：預先過濾距離過遠的廁所
  if (performanceSettings.value.enableHighPerformanceMode && userLocation.value) {
    const maxDistance = 10 // 10公里範圍
    toilets = toilets.filter(toilet => {
      const distance = calculateDistance(
        userLocation.value[0],
        userLocation.value[1],
        toilet.latitude,
        toilet.longitude
      )
      return distance <= maxDistance
    })
  }
  
  toilets.forEach((toilet, index) => {
    if (processed.has(index)) return
    
    const cluster = {
      toilets: [toilet],
      center: { lat: toilet.latitude, lng: toilet.longitude }
    }
    
    // 尋找附近的廁所 - 優化搜尋範圍
    const searchRange = Math.min(toilets.length, index + 50) // 限制搜尋範圍提升效能
    
    for (let i = index + 1; i < searchRange; i++) {
      if (processed.has(i)) continue
      
      const other = toilets[i]
      const distance = getPixelDistance(
        { lat: toilet.latitude, lng: toilet.longitude },
        { lat: other.latitude, lng: other.longitude }
      )
      
      // 如果距離很近就聚合
      if (distance < pixelDistance) {
        cluster.toilets.push(other)
        processed.add(i)
        
        // 更新聚合中心（加權平均，優質廁所權重更高）
        updateClusterCenter(cluster)
        
        // 防止聚合過大影響效能
        if (cluster.toilets.length >= 20) break
      }
    }
    
    clusters.push(cluster)
    processed.add(index)
  })
  
  return clusters
}

// 計算兩點在當前縮放層級下的像素距離 - 優化算法
const getPixelDistance = (point1, point2) => {
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

// 更新聚合中心點（加權平均）
const updateClusterCenter = (cluster) => {
  let totalLat = 0
  let totalLng = 0
  let totalWeight = 0
  
  cluster.toilets.forEach(toilet => {
    // 根據廁所品質設定權重
    let weight = 1
    if (toilet.grade === '特優級' || toilet.grade === '特優') weight = 1.5
    else if (toilet.grade === '優等' || toilet.grade === '優') weight = 1.3
    else if (toilet.grade === '普通') weight = 1.1
    
    totalLat += toilet.latitude * weight
    totalLng += toilet.longitude * weight
    totalWeight += weight
  })
  
  cluster.center = {
    lat: totalLat / totalWeight,
    lng: totalLng / totalWeight
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
}

// 重置篩選條件
const resetFilters = () => {
  filters.value = {
    grade: '',
    type: '',
    hasDiaper: false
  }
  console.log('篩選條件已重置')
}

// 效能設定變更處理
const onPerformanceSettingChange = () => {
  // 延遲更新避免過於頻繁的重繪
  clearTimeout(updateTimeout)
  updateTimeout = setTimeout(() => {
    updateMapMarkers()
    console.log('效能設定已更新:', performanceSettings.value)
  }, 300)
}

// 重置效能設定
const resetPerformanceSettings = () => {
  performanceSettings.value = {
    maxToiletsPerArea: 300, // 保持高效能預設值
    maxVisibleMarkers: 150, // 保持高效能預設值
    autoClusterThreshold: 50, // 保持高效能預設值
    enableHighPerformanceMode: true // 保持預設開啟
  }
  updateMapMarkers()
  console.log('效能設定已重置為高效能模式')
}

// 啟用高效能模式
const enableHighPerformanceMode = () => {
  performanceSettings.value.enableHighPerformanceMode = true
  performanceSettings.value.maxToiletsPerArea = 300
  performanceSettings.value.maxVisibleMarkers = 150
  performanceSettings.value.autoClusterThreshold = 50
  performanceWarning.value = ''
  updateNearbyToilets()
  console.log('已啟用高效能模式')
}

// 關閉效能警告
const dismissPerformanceWarning = () => {
  performanceWarning.value = ''
}

// 縮小查看範圍以提升效能
const zoomInForBetterPerformance = () => {
  if (map.value) {
    const currentZoom = map.value.getZoom()
    map.value.setZoom(currentZoom + 2) // 放大2個層級
    performanceWarning.value = ''
  }
}

// 智慧判斷是否有尿布台
const hasChangingTable = (toilet) => {
  const toiletName = toilet.name_zh || toilet.name || ''
  
  // 如果明確標示有尿布台
  if (toilet.has_diaper === true || 
      toilet.has_diaper === 'true' ||
      toilet.has_diaper === '是' ||
      toilet.diaper === true ||
      toilet.baby_care === true) {
    return true
  }
  
  // 根據名稱或類型推斷
  if (toiletName.includes('親子') ||
      toiletName.includes('育嬰') ||
      toiletName.includes('尿布') ||
      toiletName.includes('baby') ||
      toilet.type === 'family') {
    return true
  }
  
  // 如果明確標示無尿布台
  if (toilet.has_diaper === false ||
      toilet.has_diaper === 'false' ||
      toilet.has_diaper === '無' ||
      toilet.has_diaper === 'no') {
    // 但如果是親子廁所，仍然認為有尿布台（資料可能有誤）
    if (toiletName.includes('親子') || toilet.type === 'family') {
      return true
    }
    return false
  }
  
  // 預設值：沒有明確資料時返回 false
  return false
}

// 開啟導航
const openNavigation = (toilet) => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${toilet.latitude},${toilet.longitude}`
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
  
  // 聚焦到選定的廁所，使用統一的縮放層級
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

// 監聽篩選器變化
watch(filters, () => {
  updateMapMarkers()
}, { deep: true })

// 組件生命週期
onMounted(async () => {
  await loadCounties()
  initMap()
  
  // 載入初始位置的廁所資料
  await updateNearbyToilets()
  
  // 嘗試自動定位（如果使用者之前允許過）
  if (navigator.permissions) {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' })
      if (permission.state === 'granted') {
        locateUser()
      }
    } catch (error) {
      // 忽略權限查詢錯誤
    }
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
  height: calc(100vh - 115px); /* 減去 navbar 和更矮的 footer 的高度 */
  position: relative;
}

.control-panel {
  width: 350px;
  background: white;
  border-right: 1px solid #ddd;
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
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
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
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.custom-location {
  margin-bottom: 1.5rem;
}

.custom-location h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: #333;
}

.location-input {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.location-search-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
}

.location-search-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.btn-search {
  padding: 0.75rem 1rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  min-width: 50px;
  transition: background-color 0.3s;
}

.btn-search:hover:not(:disabled) {
  background: #218838;
}

.btn-search:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-tips {
  margin-bottom: 0.5rem;
}

.search-tips small {
  color: #666;
  font-style: italic;
}

.usage-tips {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  margin: 1rem 0;
  overflow: hidden;
}

.usage-tips-header {
  padding: 1rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.3s ease;
}

.usage-tips-header:hover {
  background: #e9ecef;
}

.usage-tips-header h4 {
  margin: 0;
  font-size: 1rem;
  color: #495057;
}

.toggle-icon {
  font-size: 0.9rem;
  color: #6c757d;
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
  color: #6c757d;
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
  background: #f8d7da;
  color: #721c24;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  border: 1px solid #f5c6cb;
}

.btn {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: all 0.3s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.filters h3 {
  margin: 1.5rem 0 1rem 0;
  font-size: 1.1rem;
  color: #333;
}

.filter-group {
  margin-bottom: 1rem;
}

.filter-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

.filter-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.filter-group input[type="checkbox"] {
  margin-right: 0.5rem;
}

.btn-reset {
  width: 100%;
  padding: 0.5rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.btn-reset:hover {
  background: #c82333;
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
  0% { width: 0%; }
  50% { width: 70%; }
  100% { width: 100%; }
}

/* 效能警告樣式 */
.performance-warning {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.warning-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.warning-content {
  flex: 1;
}

.warning-content strong {
  color: #856404;
  font-size: 0.9rem;
}

.warning-content p {
  margin: 0.5rem 0;
  color: #856404;
  font-size: 0.85rem;
  line-height: 1.4;
}

.btn-warning-action {
  background: #ffc107;
  color: #212529;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  margin-right: 0.5rem;
  transition: background-color 0.3s;
}

.btn-warning-action:hover {
  background: #e0a800;
}

.btn-dismiss {
  background: transparent;
  color: #856404;
  border: 1px solid #856404;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s;
}

.btn-dismiss:hover {
  background: #856404;
  color: white;
}

.performance-notice {
  background: #e8f5e8;
  padding: 0.5rem;
  border-radius: 4px;
  margin-top: 0.5rem;
  text-align: center;
}

.performance-notice small {
  color: #2d5016;
  font-style: italic;
}

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
  color: #333;
}

.toilet-item {
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.3s;
}

.toilet-item:hover {
  background: #e9ecef;
  border-color: #007bff;
}

.toilet-item.active {
  background: #e3f2fd;
  border-color: #007bff;
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
  color: #333;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 0.5rem;
}

.distance-badge {
  background: #007bff;
  color: white;
  font-size: 0.75rem;
  padding: 0.2rem 0.4rem;
  border-radius: 12px;
  white-space: nowrap;
  font-weight: 500;
}

.address-compact {
  font-size: 0.8rem;
  color: #666;
  margin: 0 0 0.4rem 0;
  line-height: 1.2;
  display: -webkit-box;
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

.grade-compact, .type-compact {
  font-size: 0.7rem;
  padding: 0.15rem 0.3rem;
  border-radius: 8px;
  background: #e9ecef;
  color: #495057;
  white-space: nowrap;
}

.grade-compact.excellent { background: #d4edda; color: #155724; }
.grade-compact.good { background: #d1ecf1; color: #0c5460; }
.grade-compact.fair { background: #fff3cd; color: #856404; }
.grade-compact.needs_improvement { background: #f8d7da; color: #721c24; }
.grade-compact.fail { background: #f5c6cb; color: #721c24; }

.feature-compact {
  font-size: 0.8rem;
  background: #fff3cd;
  padding: 0.15rem 0.25rem;
  border-radius: 6px;
  color: #856404;
}

.btn-nav-compact {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.2rem 0.4rem;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  margin-left: auto;
  transition: background-color 0.3s;
}

.btn-nav-compact:hover {
  background: #218838;
}

.view-all-btn-container {
  margin-top: 1rem;
  text-align: center;
}

.btn-view-all {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  font-weight: 500;
  width: 100%;
  transition: background-color 0.3s;
}

.btn-view-all:hover {
  background: #0056b3;
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
}

.map-control-btn {
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 40px;
  height: 40px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.toilet-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
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
  color: #666;
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

.loading, .no-data {
  text-align: center;
  color: #666;
  margin: 2rem 0;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .map-page {
    flex-direction: column;
    height: calc(100vh - 115px); /* 調整手機版高度 */
  }
  
  .control-panel {
    width: 100%;
    height: 45%;
    border-right: none;
    border-bottom: 1px solid #ddd;
  }
  
  .control-panel.collapsed {
    height: 60px;
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
</style>

<style>
/* Leaflet 自定義樣式 */
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
}

.center-marker {
  background: rgba(255, 255, 255, 0.95) !important;
  border: 3px solid #007bff !important;
  border-radius: 50% !important;
  text-align: center;
  line-height: 34px;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
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
  0%, 20%, 50%, 80%, 100% {
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
  box-shadow: 0 3px 10px rgba(0,0,0,0.3) !important;
  cursor: pointer !important;
  transition: transform 0.2s ease !important;
}

.cluster-icon:hover {
  transform: scale(1.1) !important;
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

.cluster-modal {
  max-width: 500px !important;
  max-height: 70vh !important;
}

.cluster-toilet-list {
  max-height: 400px;
  overflow-y: auto;
  margin-top: 1rem;
}

.cluster-toilet-item {
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.3s;
}

.cluster-toilet-item:hover {
  background: #e9ecef;
  border-color: #007bff;
}

.cluster-toilet-item:last-child {
  margin-bottom: 0;
}

.all-toilets-modal {
  max-width: 600px !important;
  max-height: 80vh !important;
}

.all-toilets-list {
  max-height: 500px;
  overflow-y: auto;
  margin-top: 1rem;
}

.all-toilet-item {
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0.875rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.3s;
}

.all-toilet-item:hover {
  background: #e9ecef;
  border-color: #007bff;
}

.all-toilet-item:last-child {
  margin-bottom: 0;
}
</style>