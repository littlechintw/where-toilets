export default {
  title: '주변 화장실',
  panelTitle: '검색 및 필터',
  locate: '위치',
  locating: '위치 확인 중…',
  customLocation: {
    title: '사용자 위치',
    placeholder: '주소, 지표, 좌표 입력 (예: 타이베이101, 25.0340,121.5645)',
    searchTip: '주소, 지표, 위도/경도 좌표로 검색 가능',
    searching: '검색 중…',
    errorOutOfRange: '좌표가 대만 범위를 벗어났습니다',
    errorNotFound: '주소를 찾을 수 없습니다. 더 구체적으로 입력해 주세요',
    errorService: '주소 검색에 실패했습니다'
  },
  usageTips: {
    title: '사용 방법',
    tip1: '지도의 파란색 핀을 드래그해 위치 지정',
    tip2: '지도를 이동·확대하면 화장실이 자동 업데이트',
    tip3: '"위치" 버튼으로 GPS 사용',
    tip4: '겹치는 화장실은 파란 원으로 묶이며, 클릭해 목록 보기',
    tip5: '상단 검색창에서 주소 검색도 가능',
    tip6: '필터로 더 정밀하게 검색'
  },
  filters: {
    title: '필터',
    grade: {
      label: '등급',
      all: '전체',
      excellent: '특우수',
      good: '우수',
      fair: '보통',
      needsImprovement: '개선 필요',
      fail: '불합격'
    },
    type: {
      label: '종류',
      all: '전체',
      male: '남성',
      female: '여성',
      mixed: '공용',
      accessible: '장애인용',
      family: '가족용'
    },
    diaper: '기저귀 교환대 있는 곳만',
    reset: '초기화'
  },
  toiletList: {
    title: '지도 범위 내 화장실',
    count: '',
    countSuffix: '개',
    viewAll: '모두 보기',
    viewAllN: '전체 {count}개 보기',
    noData: '지도 범위 내 화장실이 없습니다',
    needLocation: '위치 권한을 허용하거나 지도를 움직여 주세요',
    cluster: {
      title: '이 지역의 화장실',
      count: '',
      summary: '이 위치에 {count}개의 화장실'
    }
  },
  toiletInfo: {
    grade: '등급',
    type: '종류',
    category: '카테고리',
    diaper: '기저귀 교환대',
    diaperBadge: '기저귀 교환대 있음',
    distance: '거리',
    manager: '관리 기관',
    address: '주소',
    hasDialper: '있음',
    noDialper: '없음',
    navigation: '길찾기'
  },
  errors: {
    locationFailed: '위치 확인 실패',
    dataLoadFailed: '데이터 로딩 실패',
    mapUpdateFailed: '지도 업데이트 실패'
  },
  loading: {
    detectingCounty: '지역 감지 중…',
    loadingCounty: '{county} 화장실 데이터 로딩 중…',
    nearby: '주변',
    processing: '데이터 처리 중…',
    processingToilets: '화장실 데이터 처리 중…',
    done: '완료',
    failed: '로딩 실패'
  }
}
