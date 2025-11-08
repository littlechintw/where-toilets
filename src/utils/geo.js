/**
 * 計算兩點間的 Haversine 距離（公里）
 * @param {number} lat1 - 第一點緯度
 * @param {number} lon1 - 第一點經度
 * @param {number} lat2 - 第二點緯度
 * @param {number} lon2 - 第二點經度
 * @returns {number} 距離（公里）
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // 地球半徑（公里）
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 角度轉弧度
 */
function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * 找到最近的廁所
 * @param {Array} userLocation - [緯度, 經度]
 * @param {Array} toilets - 廁所資料陣列
 * @param {number} limit - 返回數量限制
 * @returns {Array} 按距離排序的廁所陣列
 */
export function findNearestToilets(userLocation, toilets, limit = 10) {
  const [userLat, userLon] = userLocation;
  
  return toilets
    .map(toilet => ({
      ...toilet,
      distance: haversineDistance(userLat, userLon, toilet.latitude, toilet.longitude)
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

/**
 * 根據使用者位置判斷所在縣市
 * @param {Array} userLocation - [緯度, 經度]
 * @param {Array} counties - 縣市邊界資料
 * @returns {string|null} 縣市英文名稱
 */
export function detectUserCounty(userLocation, counties) {
  const [lat, lng] = userLocation;
  
  for (const county of counties) {
    const { bounds } = county;
    if (
      lat >= bounds.minLat && lat <= bounds.maxLat &&
      lng >= bounds.minLng && lng <= bounds.maxLng
    ) {
      return county.name_en;
    }
  }
  
  return null;
}

/**
 * 取得鄰近縣市
 * @param {string} currentCounty - 目前縣市
 * @param {Array} counties - 所有縣市資料
 * @param {Array} userLocation - 使用者位置
 * @returns {Array} 鄰近縣市列表
 */
export function getNearbyCounties(currentCounty, counties, userLocation) {
  if (!currentCounty || !userLocation) return [];
  
  const [userLat, userLng] = userLocation;
  const currentCountyData = counties.find(c => c.name_en === currentCounty);
  
  if (!currentCountyData) return [];
  
  // 計算與其他縣市的距離（使用縣市中心點）
  const nearbyCounties = counties
    .filter(county => county.name_en !== currentCounty)
    .map(county => {
      const centerLat = (county.bounds.minLat + county.bounds.maxLat) / 2;
      const centerLng = (county.bounds.minLng + county.bounds.maxLng) / 2;
      const distance = haversineDistance(userLat, userLng, centerLat, centerLng);
      
      return {
        ...county,
        distance
      };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3); // 最近的 3 個縣市
  
  return nearbyCounties;
}

/**
 * 格式化距離顯示
 * @param {number} distance - 距離（公里）
 * @returns {string} 格式化的距離字串
 */
export function formatDistance(distance) {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else {
    return `${distance.toFixed(1)}km`;
  }
}

/**
 * 取得使用者位置
 * @returns {Promise<Array>} [緯度, 經度]
 */
export function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('瀏覽器不支援定位功能'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve([
          position.coords.latitude,
          position.coords.longitude
        ]);
      },
      (error) => {
        let errorMessage;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '定位權限被拒絕';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '無法取得位置資訊';
            break;
          case error.TIMEOUT:
            errorMessage = '定位請求超時';
            break;
          default:
            errorMessage = '定位發生未知錯誤';
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 分鐘快取
      }
    );
  });
}