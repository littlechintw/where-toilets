export default {
  title: 'Mga toilet sa lugar',
  locate: 'Lokasyon',
  locating: 'Naghahanap ng lokasyon…',
  customLocation: {
    title: 'Custom na lokasyon',
    placeholder: 'Ilagay ang address, landmark, o coordinate (hal. Taipei 101, 25.0340,121.5645)',
    searchTip: 'Maaaring mag-input ng address, pangalan ng landmark, o coordinate',
    searching: 'Naghahanap…',
    errorOutOfRange: 'Coordinate ay nasa labas ng Taiwan',
    errorNotFound: 'Hindi nahanap ang address, mas detalye pa',
    errorService: 'Pagsearch ng address ay nabigo'
  },
  usageTips: {
    title: 'Paano gamitin',
    tip1: 'I-drag ang asul na pin sa mapa papunta sa nais na lokasyon',
    tip2: 'Awtomatikong mag-uupdate kapag inilipat o nag-zoom ang mapa',
    tip3: 'Pindutin ang "Lokasyon" para gamitin ang GPS',
    tip4: 'Mga magkakapatong na toilet ay magiging asul na bilog',
    tip5: 'Maaari ring maghanap ng address sa itaas',
    tip6: 'Gamitin ang filter para paliitin ang resulta'
  },
  filters: {
    title: 'Mga Filter',
    grade: {
      label: 'Baitang',
      all: 'Lahat',
      excellent: 'Pambihira',
      good: 'Mahusay',
      fair: 'Karaniwan',
      needsImprovement: 'Kailangang pagbutihin',
      fail: 'Hindi pumasa'
    },
    type: {
      label: 'Uri',
      all: 'Lahat',
      male: 'Lalaki',
      female: 'Babae',
      mixed: 'Magkakahalo',
      accessible: 'Para sa may kapansanan',
      family: 'Pampamilya'
    },
    diaper: 'Ipakita lang ang may changing table',
    reset: 'I-reset'
  },
  toiletList: {
    title: 'Mga toilet sa lugar ng mapa',
    count: '',
    countSuffix: 'toilet',
    viewAll: 'Tingnan lahat',
    viewAllN: 'Tingnan lahat ng {count} toilet',
    noData: 'Walang nahanap na toilet sa lugar',
    needLocation: 'Pakipayagan ang lokasyon o i-drag ang mapa',
    cluster: {
      title: 'Mga toilet sa lugar na ito',
      count: '',
      summary: '{count} toilet sa lugar na ito'
    }
  },
  toiletInfo: {
    grade: 'Baitang',
    type: 'Uri',
    category: 'Kategorya',
    diaper: 'Changing table',
    diaperBadge: 'May changing table',
    distance: 'Distansya',
    manager: 'Namamahala',
    address: 'Address',
    hasDialper: 'May',
    noDialper: 'Wala',
    navigation: 'Buksan ang navigation'
  },
  errors: {
    locationFailed: 'Hindi nakapag-locate',
    dataLoadFailed: 'Nabigo ang pag-load',
    mapUpdateFailed: 'Nabigo ang pag-update ng mapa'
  },
  loading: {
    detectingCounty: 'Tinutukoy ang lugar…',
    loadingCounty: 'Naglo-load ng datos sa {county}…',
    nearby: 'malapit',
    processing: 'Pinoproseso ang datos…',
    processingToilets: 'Pinoproseso ang datos ng toilet…',
    done: 'Tapos na',
    failed: 'Nabigo'
  }
}
