/**
 * Toilet 相關純函式（無副作用、可測試）
 *
 * 抽出自原本的 Map.vue。把判斷邏輯放到單一檔案有幾個好處：
 *   1. Map.vue 變短、更容易閱讀
 *   2. 之後若要寫單元測試，可以直接 import 這些函式
 *   3. 清單頁、詳細頁等其他畫面也能共用同樣的判斷邏輯
 */

/**
 * 智慧判斷一座廁所是否提供尿布台。
 *
 * 政府開放資料的欄位很雜（has_diaper、diaper、baby_care、'是'/'無'…），
 * 加上很多有尿布台的廁所其實沒有正確標註，所以這裡用三層 fallback：
 *   1. 明確的「有」標記 → true
 *   2. 名稱含「親子 / 育嬰 / 尿布 / baby」或 type === 'family' → true
 *   3. 明確的「無」標記 → false（除非名稱看起來就是親子廁所）
 *   4. 不明確 → false（保守）
 */
export function hasChangingTable(toilet) {
  if (!toilet) return false
  const toiletName = toilet.name_zh || toilet.name || ''
  if (getTypeKey(toilet) === 'family') return true

  // 1) 明確標示「有」
  if (
    toilet.has_diaper === true ||
    toilet.has_diaper === 'true' ||
    toilet.has_diaper === '是' ||
    toilet.diaper === true ||
    toilet.baby_care === true
  ) {
    return true
  }

  // 2) 從名稱或類型推斷
  if (
    toiletName.includes('親子') ||
    toiletName.includes('育嬰') ||
    toiletName.includes('尿布') ||
    toiletName.includes('baby') ||
    toilet.type === 'family'
  ) {
    return true
  }

  // 3) 明確標示「無」
  if (
    toilet.has_diaper === false ||
    toilet.has_diaper === 'false' ||
    toilet.has_diaper === '無' ||
    toilet.has_diaper === 'no'
  ) {
    // 但若名稱明顯是親子廁所，仍視為有（資料可能有誤）
    if (toiletName.includes('親子') || toilet.type === 'family') {
      return true
    }
    return false
  }

  return false
}

/**
 * 等級正規化。
 *
 * 政府 API 回傳的是「特優級 / 優等級 / 普通級 / 加強級 / 不合格」，
 * normalize-data.js 會嘗試轉成英文 key，但舊資料仍是中文原值。
 * 這裡統一轉成 CSS class 與篩選器用的 key：
 *   'excellent' | 'good' | 'fair' | 'needs-improvement' | 'fail' | ''
 */
const GRADE_ALIASES = [
  ['excellent', ['excellent', '特優']],
  ['good', ['good', '優等']],
  ['fair', ['fair', '普通']],
  ['needs-improvement', ['needs_improvement', 'needs-improvement', '加強']],
  ['fail', ['fail', '不合格']]
]

export function getGradeKey(toilet) {
  if (!toilet) return ''
  const raw = String(toilet.grade || toilet.grade_zh || '').trim()
  if (!raw) return ''
  const lower = raw.toLowerCase()
  for (const [key, aliases] of GRADE_ALIASES) {
    if (aliases.some(alias => lower === alias || raw.includes(alias))) return key
  }
  return ''
}

/**
 * 類型正規化。
 *
 * 回傳 'male' | 'female' | 'mixed' | 'accessible' | 'family' | ''
 *
 * 優先順序：
 *   1. 官方 type_zh（男廁所 / 女廁所 / 無障礙廁所 / 混合廁所 / 親子廁所 / 性別友善廁所）
 *   2. 已正規化的英文 type（舊資料幾乎全是 'mixed' 的 fallback 值，所以只採信明確的值）
 *   3. 名稱推斷
 */
const SPECIFIC_TYPES = ['family', 'accessible', 'female', 'male', 'unisex']

export function getTypeKey(toilet) {
  if (!toilet) return ''
  const typeZh = String(toilet.type_zh || '')
  const type = String(toilet.type || '').toLowerCase()
  const name = String(toilet.name_zh || toilet.name || '')

  if (typeZh) {
    if (typeZh.includes('親子')) return 'family'
    if (typeZh.includes('無障礙')) return 'accessible'
    if (
      typeZh.includes('混合') ||
      typeZh.includes('性別友善') ||
      (typeZh.includes('男') && typeZh.includes('女'))
    ) return 'mixed'
    if (typeZh.includes('女')) return 'female'
    if (typeZh.includes('男')) return 'male'
  }

  if (SPECIFIC_TYPES.includes(type)) return type === 'unisex' ? 'mixed' : type

  if (name.includes('親子') || name.includes('育嬰') || /baby/i.test(name)) return 'family'
  if (name.includes('無障礙') || name.includes('身障')) return 'accessible'
  if (name.includes('男') && name.includes('女')) return 'mixed'
  if (name.includes('女')) return 'female'
  if (name.includes('男')) return 'male'

  return type === 'mixed' ? 'mixed' : ''
}

/**
 * 取得廁所的最佳顯示名稱（中文優先 → 英文 → 「未命名」）。
 */
export function getToiletName(toilet, fallback = '未命名廁所') {
  if (!toilet) return fallback
  return toilet.name_zh || toilet.name_en || toilet.name || fallback
}

/**
 * 從廁所物件組出一個對 GA4 友善的事件參數物件。
 * 其它地方追蹤事件時可以用這個保持參數一致。
 */
export function toToiletEventParams(toilet) {
  if (!toilet) return {}
  return {
    toilet_id: toilet.id || toilet.number || '',
    grade: toilet.grade || '',
    type: toilet.type || ''
  }
}
