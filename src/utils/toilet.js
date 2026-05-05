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
