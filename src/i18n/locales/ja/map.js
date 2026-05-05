export default {
  title: 'エリア内のトイレ',
  locate: '現在地',
  locating: '位置情報を取得中…',
  customLocation: {
    title: 'カスタム位置',
    placeholder: '住所、ランドマーク、座標を入力（例：台北101、25.0340,121.5645）',
    searchTip: '住所、ランドマーク名、緯度経度で検索できます',
    searching: '検索中…',
    errorOutOfRange: '座標が台湾の範囲外です',
    errorNotFound: '見つかりませんでした。より具体的に入力してください',
    errorService: '住所検索に失敗しました'
  },
  usageTips: {
    title: '使い方',
    tip1: 'マップ上の青いピンをドラッグして場所を指定',
    tip2: 'マップを移動・ズームすると自動でトイレを更新',
    tip3: '「現在地」ボタンでGPS位置を使用',
    tip4: '近接するトイレは青い丸にまとまり、タップでリスト表示',
    tip5: '上部の検索欄で住所検索も可能',
    tip6: 'フィルターでさらに絞り込み'
  },
  filters: {
    title: 'フィルター',
    grade: {
      label: '等級',
      all: 'すべて',
      excellent: '特優',
      good: '優等',
      fair: '普通',
      needsImprovement: '要改善',
      fail: '不合格'
    },
    type: {
      label: '種別',
      all: 'すべて',
      male: '男性用',
      female: '女性用',
      mixed: '共用',
      accessible: 'バリアフリー',
      family: '親子'
    },
    diaper: 'おむつ替え台ありのみ',
    reset: 'リセット'
  },
  toiletList: {
    title: 'エリア内のトイレ',
    count: '',
    countSuffix: '件',
    viewAll: 'すべて表示',
    viewAllN: 'すべて{count}件を表示',
    noData: 'エリア内にトイレが見つかりません',
    needLocation: '位置情報を許可するか、マップを動かしてください',
    cluster: {
      title: 'この場所のトイレ',
      count: '',
      summary: 'この場所に{count}件のトイレ'
    }
  },
  toiletInfo: {
    grade: '等級',
    type: '種別',
    category: 'カテゴリー',
    diaper: 'おむつ替え台',
    diaperBadge: 'おむつ替え台あり',
    distance: '距離',
    manager: '管理者',
    address: '住所',
    hasDialper: 'あり',
    noDialper: 'なし',
    navigation: 'ナビ開始'
  },
  errors: {
    locationFailed: '位置取得に失敗',
    dataLoadFailed: 'データの読み込みに失敗',
    mapUpdateFailed: 'マップ更新に失敗'
  },
  loading: {
    detectingCounty: 'エリアを検出中…',
    loadingCounty: '{county}のトイレデータを読み込み中…',
    nearby: '近隣',
    processing: 'データ処理中…',
    processingToilets: 'トイレデータ処理中…',
    done: '完了',
    failed: '読み込み失敗'
  }
}
