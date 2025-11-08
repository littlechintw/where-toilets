export default {
  title: '範圍內廁所',
  locate: '定位',
  locating: '定位中...',
  customLocation: {
    title: '自訂位置',
    placeholder: '輸入地址、地標或座標 (例：台北101, 25.0340,121.5645)',
    searchTip: '可輸入地址、地標名稱或經緯度座標',
    searching: '搜尋中...',
    errorOutOfRange: '座標超出台灣範圍',
    errorNotFound: '找不到該地址，請嘗試更具體的描述',
    errorService: '地址搜尋失敗'
  },
  usageTips: {
    title: '使用說明',
    tip1: '拖曳地圖上的藍色大頭針到想搜尋的位置',
    tip2: '移動或縮放地圖會自動更新範圍內的廁所',
    tip3: '點擊「定位」使用您的GPS位置',
    tip4: '重疊的廁所會自動聚合成藍色圓形，點擊查看清單',
    tip5: '也可在上方輸入地址搜尋',
    tip6: '使用篩選器可進一步縮小搜尋範圍'
  },
  filters: {
    title: '篩選條件',
    grade: {
      label: '等級',
      all: '全部',
      excellent: '特優級',
      good: '優等級',
      fair: '普通級',
      needsImprovement: '加強級',
      fail: '不合格'
    },
    type: {
      label: '類型',
      all: '全部',
      male: '男廁',
      female: '女廁',
      mixed: '男女廁',
      accessible: '無障礙廁所',
      family: '親子廁所'
    },
    diaper: '只顯示有尿布台',
    reset: '重置篩選'
  },
  toiletList: {
    title: '地圖範圍內廁所',
    count: '個',
    viewAll: '查看全部',
    noData: '地圖範圍內沒有找到廁所',
    needLocation: '請先允許定位或拖動地圖以顯示廁所',
    cluster: {
      title: '此區域廁所',
      count: '個'
    }
  },
  toiletInfo: {
    grade: '等級',
    type: '類型',
    category: '類別',
    diaper: '尿布台',
    distance: '距離',
    manager: '管理單位',
    address: '地址',
    hasDialper: '有',
    noDialper: '無',
    navigation: '開啟導航'
  },
  errors: {
    locationFailed: '定位失敗',
    dataLoadFailed: '載入資料失敗',
    mapUpdateFailed: '更新地圖範圍廁所失敗'
  }
}