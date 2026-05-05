/**
 * 地理編碼 composable
 *
 * 把原本散在 Map.vue 的 geocodeAddress 抽到這裡。
 * 之後若想換 provider（Google Maps Geocoding API、Mapbox 等），
 * 只要改這個檔案即可，畫面層完全不用動。
 */

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

/**
 * 把地址 / 地標名稱轉成 [lat, lng]。
 * @param {string} address      使用者輸入
 * @param {object} options
 * @param {string} options.countrycodes  ISO 國碼，預設 'tw'
 * @param {string} options.bias           給 Nominatim 的提示詞，會接在地址後面，預設 '臺灣'
 * @returns {Promise<[number, number]>}
 * @throws  Error  訊息已經 i18n 化過或可直接顯示給使用者
 */
export async function geocodeAddress(address, options = {}) {
  const {
    countrycodes = 'tw',
    bias = '臺灣',
    notFoundMessage = '找不到該地址，請嘗試更具體的描述',
    serviceMessage = '地理編碼服務無法連接'
  } = options

  const params = new URLSearchParams({
    q: `${address}, ${bias}`,
    format: 'json',
    limit: '1',
    countrycodes
  })

  const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`)
  if (!response.ok) {
    throw new Error(serviceMessage)
  }

  const data = await response.json()
  if (!data || data.length === 0) {
    throw new Error(notFoundMessage)
  }

  const result = data[0]
  return [parseFloat(result.lat), parseFloat(result.lon)]
}

/**
 * 給定一段使用者輸入，判斷是否為「lat,lng」座標格式。
 * 同時做臺灣範圍檢查。
 */
export function tryParseTwCoordinate(input) {
  const m = input.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/)
  if (!m) return null
  const lat = parseFloat(m[1])
  const lng = parseFloat(m[2])
  if (lat >= 20 && lat <= 26 && lng >= 118 && lng <= 122) {
    return [lat, lng]
  }
  return { outOfRange: true }
}
