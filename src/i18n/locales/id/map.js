export default {
  title: 'Toilet di area',
  locate: 'Lokasi',
  locating: 'Mencari lokasi…',
  customLocation: {
    title: 'Lokasi kustom',
    placeholder: 'Masukkan alamat, landmark atau koordinat (mis. Taipei 101, 25.0340,121.5645)',
    searchTip: 'Bisa berupa alamat, nama landmark, atau koordinat',
    searching: 'Mencari…',
    errorOutOfRange: 'Koordinat di luar wilayah Taiwan',
    errorNotFound: 'Alamat tidak ditemukan, coba lebih spesifik',
    errorService: 'Pencarian alamat gagal'
  },
  usageTips: {
    title: 'Cara penggunaan',
    tip1: 'Geser pin biru pada peta ke lokasi yang diinginkan',
    tip2: 'Memindahkan atau zoom peta akan otomatis memperbarui',
    tip3: 'Tekan "Lokasi" untuk gunakan GPS',
    tip4: 'Toilet yang berdekatan akan dikelompokkan dalam lingkaran biru',
    tip5: 'Bisa juga cari berdasarkan alamat di atas',
    tip6: 'Gunakan filter untuk mempersempit hasil'
  },
  filters: {
    title: 'Filter',
    grade: {
      label: 'Kelas',
      all: 'Semua',
      excellent: 'Istimewa',
      good: 'Baik',
      fair: 'Cukup',
      needsImprovement: 'Perlu perbaikan',
      fail: 'Tidak lulus'
    },
    type: {
      label: 'Jenis',
      all: 'Semua',
      male: 'Pria',
      female: 'Wanita',
      mixed: 'Campuran',
      accessible: 'Difabel',
      family: 'Keluarga'
    },
    diaper: 'Hanya yang ada meja ganti popok',
    reset: 'Atur ulang'
  },
  toiletList: {
    title: 'Toilet di area peta',
    count: '',
    countSuffix: 'toilet',
    viewAll: 'Lihat semua',
    viewAllN: 'Lihat semua {count} toilet',
    noData: 'Tidak ada toilet di area peta',
    needLocation: 'Izinkan lokasi atau geser peta untuk menampilkan',
    cluster: {
      title: 'Toilet di area ini',
      count: '',
      summary: 'Ada {count} toilet di lokasi ini'
    }
  },
  toiletInfo: {
    grade: 'Kelas',
    type: 'Jenis',
    category: 'Kategori',
    diaper: 'Meja ganti popok',
    diaperBadge: 'Ada meja ganti popok',
    distance: 'Jarak',
    manager: 'Pengelola',
    address: 'Alamat',
    hasDialper: 'Ada',
    noDialper: 'Tidak ada',
    navigation: 'Buka navigasi'
  },
  errors: {
    locationFailed: 'Pencarian lokasi gagal',
    dataLoadFailed: 'Gagal memuat data',
    mapUpdateFailed: 'Gagal memperbarui peta'
  },
  loading: {
    detectingCounty: 'Mendeteksi wilayah…',
    loadingCounty: 'Memuat data toilet di {county}…',
    nearby: 'sekitar',
    processing: 'Memproses data…',
    processingToilets: 'Memproses data toilet…',
    done: 'Selesai',
    failed: 'Gagal memuat'
  }
}
