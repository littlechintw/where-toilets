// 各語言的網址前綴與 SEO 文字（title / description）。
// 純資料、不依賴 Vue，所以 vite.config.js 在 build 時也會 import 這份檔案來產生各語言的靜態 HTML 與 sitemap。
// 中文是預設語言，網址不帶前綴（/、/map）；其他語言用 /en/、/en/map…

export const SITE = 'https://toilets.littlechin.tw'

export const LANGS = [
  { code: 'zh', htmlLang: 'zh-TW', og: 'zh_TW' },
  { code: 'en', htmlLang: 'en', og: 'en_US' },
  { code: 'ja', htmlLang: 'ja', og: 'ja_JP' },
  { code: 'ko', htmlLang: 'ko', og: 'ko_KR' },
  { code: 'vi', htmlLang: 'vi', og: 'vi_VN' },
  { code: 'id', htmlLang: 'id', og: 'id_ID' },
  { code: 'th', htmlLang: 'th', og: 'th_TH' },
  { code: 'fil', htmlLang: 'fil', og: 'fil_PH' }
]

export const DEFAULT_LANG = 'zh'
export const PREFIXED_LANGS = LANGS.filter(l => l.code !== DEFAULT_LANG).map(l => l.code)

// 與 src/main.js 的路由對應：key 是路由名稱，path 是不含語言前綴的路徑
export const PAGES = [
  { key: 'Home', path: '/', changefreq: 'weekly', priority: '1.0', dataDriven: true },
  { key: 'Map', path: '/map', changefreq: 'weekly', priority: '0.9', dataDriven: true },
  { key: 'Settings', path: '/settings', changefreq: 'monthly', priority: '0.3' },
  { key: 'Privacy', path: '/privacy', changefreq: 'yearly', priority: '0.2' }
]

/** 'en' + '/map' → '/en/map'；'zh' + '/map' → '/map'；'en' + '/' → '/en/' */
export function localizedPath(lang, path) {
  if (!lang || lang === DEFAULT_LANG) return path
  return path === '/' ? `/${lang}/` : `/${lang}${path}`
}

export function isLang(code) {
  return LANGS.some(l => l.code === code)
}

const homeDesc = {
  zh: '廁所地圖是一個免費的公廁查找工具，使用環境部環境管理署開放資料，一鍵定位，快速找到附近的公共廁所，含無障礙、親子廁所、尿布台等資訊，覆蓋全臺 22 縣市超過 4 萬座廁所。',
  en: 'Taiwan Toilet Map is a free tool for finding public restrooms across Taiwan. One tap to locate the nearest toilet, with accessible, family and baby-changing facility info for over 40,000 toilets in 22 counties and cities. Unofficial; based on government open data.',
  ja: '台湾全土の公衆トイレを探せる無料ツール。ワンタップで現在地から最寄りのトイレを検索でき、バリアフリー・ファミリー向け・おむつ交換台の情報も確認できます。22の県市・4万か所以上を収録。非公式ツール（政府オープンデータ使用）。',
  ko: '대만 전역의 공중화장실을 찾을 수 있는 무료 도구입니다. 한 번의 터치로 가까운 화장실을 찾고 장애인·가족용·기저귀 교환대 정보까지 확인하세요. 22개 시·현, 4만 곳 이상 수록. 비공식 도구(정부 공공데이터 사용).',
  vi: 'Công cụ miễn phí tìm nhà vệ sinh công cộng trên khắp Đài Loan. Một chạm để tìm nhà vệ sinh gần nhất, kèm thông tin lối đi người khuyết tật, nhà vệ sinh gia đình và bàn thay tã, hơn 40.000 địa điểm tại 22 huyện/thành phố. Công cụ không chính thức, dùng dữ liệu mở của chính phủ.',
  id: 'Alat gratis untuk mencari toilet umum di seluruh Taiwan. Sekali ketuk untuk menemukan toilet terdekat, lengkap dengan info akses disabilitas, toilet keluarga, dan meja ganti popok untuk lebih dari 40.000 toilet di 22 kabupaten/kota. Alat tidak resmi, menggunakan data terbuka pemerintah.',
  th: 'เครื่องมือฟรีสำหรับค้นหาห้องน้ำสาธารณะทั่วไต้หวัน แตะครั้งเดียวก็พบห้องน้ำใกล้ที่สุด พร้อมข้อมูลห้องน้ำสำหรับผู้พิการ ห้องน้ำครอบครัว และที่เปลี่ยนผ้าอ้อม กว่า 40,000 แห่งใน 22 เมือง/เทศมณฑล เป็นเครื่องมือไม่เป็นทางการที่ใช้ข้อมูลเปิดของรัฐบาล',
  fil: 'Libreng tool para maghanap ng pampublikong toilet sa buong Taiwan. Isang tap lang para mahanap ang pinakamalapit, may impormasyon sa accessible, pampamilya, at diaper-changing facilities para sa mahigit 40,000 toilet sa 22 county at lungsod. Hindi opisyal; gumagamit ng open data ng pamahalaan.'
}

const mapDesc = {
  zh: '在地圖上查看全臺公共廁所位置，可依等級、類型與親子設施篩選，並用目前位置或地址搜尋附近的廁所。',
  en: 'View public toilets across Taiwan on a map. Filter by rating, type and family facilities, and search nearby by your current location or an address.',
  ja: '台湾全土の公衆トイレを地図で確認。評価・種類・ファミリー向け設備で絞り込み、現在地や住所から周辺のトイレを検索できます。',
  ko: '대만 전역의 공중화장실을 지도에서 확인하세요. 등급·유형·가족 시설로 필터링하고 현재 위치나 주소로 주변 화장실을 검색할 수 있습니다.',
  vi: 'Xem nhà vệ sinh công cộng trên khắp Đài Loan trên bản đồ. Lọc theo xếp hạng, loại và tiện ích gia đình, tìm gần bạn theo vị trí hiện tại hoặc địa chỉ.',
  id: 'Lihat toilet umum di seluruh Taiwan di peta. Saring berdasarkan peringkat, jenis, dan fasilitas keluarga, lalu cari yang terdekat dari lokasi Anda atau alamat.',
  th: 'ดูห้องน้ำสาธารณะทั่วไต้หวันบนแผนที่ กรองตามระดับ ประเภท และสิ่งอำนวยความสะดวกสำหรับครอบครัว ค้นหาใกล้ตำแหน่งปัจจุบันหรือที่อยู่',
  fil: 'Tingnan sa mapa ang mga pampublikong toilet sa buong Taiwan. I-filter ayon sa rating, uri, at pampamilyang pasilidad, at maghanap malapit sa iyong lokasyon o address.'
}

const t = (home, map, settings, privacy) => ({
  Home: { title: home, description: null },
  Map: { title: map, description: null },
  Settings: { title: settings, description: null },
  Privacy: { title: privacy, description: null }
})

const titles = {
  zh: t('廁所地圖｜快速找到附近的公共廁所（臺灣全島）', '廁所地圖｜地圖檢視 - 附近的公共廁所', '廁所地圖｜設定', '廁所地圖｜隱私權政策'),
  en: t('Taiwan Toilet Map | Find Nearby Public Toilets in Taiwan', 'Map View | Taiwan Toilet Map', 'Settings | Taiwan Toilet Map', 'Privacy Policy | Taiwan Toilet Map'),
  ja: t('台湾トイレマップ｜台湾の近くの公衆トイレを探す', '地図表示｜台湾トイレマップ', '設定｜台湾トイレマップ', 'プライバシーポリシー｜台湾トイレマップ'),
  ko: t('대만 화장실 지도｜가까운 공중화장실 찾기', '지도 보기｜대만 화장실 지도', '설정｜대만 화장실 지도', '개인정보 처리방침｜대만 화장실 지도'),
  vi: t('Bản đồ nhà vệ sinh Đài Loan｜Tìm nhà vệ sinh công cộng gần bạn', 'Xem bản đồ｜Bản đồ nhà vệ sinh Đài Loan', 'Cài đặt｜Bản đồ nhà vệ sinh Đài Loan', 'Chính sách quyền riêng tư｜Bản đồ nhà vệ sinh Đài Loan'),
  id: t('Peta Toilet Taiwan｜Cari Toilet Umum Terdekat', 'Tampilan Peta｜Peta Toilet Taiwan', 'Pengaturan｜Peta Toilet Taiwan', 'Kebijakan Privasi｜Peta Toilet Taiwan'),
  th: t('แผนที่ห้องน้ำไต้หวัน｜ค้นหาห้องน้ำสาธารณะใกล้คุณ', 'มุมมองแผนที่｜แผนที่ห้องน้ำไต้หวัน', 'การตั้งค่า｜แผนที่ห้องน้ำไต้หวัน', 'นโยบายความเป็นส่วนตัว｜แผนที่ห้องน้ำไต้หวัน'),
  fil: t('Mapa ng Toilet sa Taiwan｜Maghanap ng Malapit na Pampublikong Toilet', 'Tingin sa Mapa｜Mapa ng Toilet sa Taiwan', 'Mga Setting｜Mapa ng Toilet sa Taiwan', 'Patakaran sa Privacy｜Mapa ng Toilet sa Taiwan')
}

/** 取得某語言某頁的 { title, description } */
export function seoFor(lang, key) {
  const l = titles[lang] ? lang : DEFAULT_LANG
  const title = titles[l][key]?.title || titles[l].Home.title
  // 地圖頁用地圖說明，其餘頁沿用首頁說明
  const description = (key === 'Map' ? mapDesc : homeDesc)[l]
  return { title, description }
}
