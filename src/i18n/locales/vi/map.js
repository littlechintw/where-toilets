export default {
  title: 'Nhà vệ sinh trong khu vực',
  panelTitle: 'Tìm kiếm & Bộ lọc',
  locate: 'Định vị',
  locating: 'Đang định vị…',
  customLocation: {
    title: 'Vị trí tùy chỉnh',
    placeholder: 'Nhập địa chỉ, địa danh hoặc tọa độ (vd: Đài Bắc 101, 25.0340,121.5645)',
    searchTip: 'Có thể nhập địa chỉ, tên địa danh hoặc tọa độ',
    searching: 'Đang tìm…',
    errorOutOfRange: 'Tọa độ ngoài phạm vi Đài Loan',
    errorNotFound: 'Không tìm thấy địa chỉ, vui lòng nhập cụ thể hơn',
    errorService: 'Tìm kiếm địa chỉ thất bại'
  },
  usageTips: {
    title: 'Hướng dẫn sử dụng',
    tip1: 'Kéo ghim xanh trên bản đồ đến vị trí muốn tìm',
    tip2: 'Di chuyển hoặc phóng to bản đồ sẽ tự động cập nhật',
    tip3: 'Bấm "Định vị" để dùng GPS',
    tip4: 'Các nhà vệ sinh chồng nhau sẽ gộp thành vòng tròn xanh, bấm để xem danh sách',
    tip5: 'Cũng có thể tìm theo địa chỉ ở thanh trên',
    tip6: 'Sử dụng bộ lọc để thu hẹp kết quả'
  },
  filters: {
    title: 'Bộ lọc',
    grade: {
      label: 'Hạng',
      all: 'Tất cả',
      excellent: 'Đặc biệt',
      good: 'Tốt',
      fair: 'Trung bình',
      needsImprovement: 'Cần cải thiện',
      fail: 'Không đạt'
    },
    type: {
      label: 'Loại',
      all: 'Tất cả',
      male: 'Nam',
      female: 'Nữ',
      mixed: 'Chung',
      accessible: 'Người khuyết tật',
      family: 'Gia đình'
    },
    diaper: 'Chỉ hiển thị có bàn thay tã',
    reset: 'Đặt lại'
  },
  toiletList: {
    title: 'Nhà vệ sinh trong khu vực',
    count: '',
    countSuffix: 'nhà vệ sinh',
    viewAll: 'Xem tất cả',
    viewAllN: 'Xem tất cả {count} nhà vệ sinh',
    noData: 'Không có nhà vệ sinh trong khu vực',
    needLocation: 'Vui lòng cho phép định vị hoặc kéo bản đồ',
    cluster: {
      title: 'Nhà vệ sinh khu vực này',
      count: '',
      summary: 'Có {count} nhà vệ sinh tại đây'
    }
  },
  toiletInfo: {
    grade: 'Hạng',
    type: 'Loại',
    category: 'Danh mục',
    diaper: 'Bàn thay tã',
    diaperBadge: 'Có bàn thay tã',
    distance: 'Khoảng cách',
    manager: 'Đơn vị quản lý',
    address: 'Địa chỉ',
    hasDialper: 'Có',
    noDialper: 'Không',
    navigation: 'Mở chỉ đường'
  },
  errors: {
    locationFailed: 'Định vị thất bại',
    dataLoadFailed: 'Tải dữ liệu thất bại',
    mapUpdateFailed: 'Cập nhật bản đồ thất bại'
  },
  loading: {
    detectingCounty: 'Đang xác định khu vực…',
    loadingCounty: 'Đang tải dữ liệu {county}…',
    nearby: 'lân cận',
    processing: 'Đang xử lý dữ liệu…',
    processingToilets: 'Đang xử lý dữ liệu nhà vệ sinh…',
    done: 'Hoàn tất',
    failed: 'Tải thất bại'
  }
}
