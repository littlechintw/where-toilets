export default {
  title: 'ห้องน้ำในพื้นที่',
  locate: 'ตำแหน่ง',
  locating: 'กำลังระบุตำแหน่ง…',
  customLocation: {
    title: 'ตำแหน่งกำหนดเอง',
    placeholder: 'ใส่ที่อยู่ สถานที่ หรือพิกัด (เช่น Taipei 101, 25.0340,121.5645)',
    searchTip: 'ใส่ที่อยู่ ชื่อสถานที่ หรือพิกัด',
    searching: 'กำลังค้นหา…',
    errorOutOfRange: 'พิกัดนอกพื้นที่ไต้หวัน',
    errorNotFound: 'ไม่พบที่อยู่ โปรดระบุให้ละเอียดขึ้น',
    errorService: 'ค้นหาที่อยู่ล้มเหลว'
  },
  usageTips: {
    title: 'วิธีใช้งาน',
    tip1: 'ลากหมุดสีน้ำเงินบนแผนที่ไปยังตำแหน่งที่ต้องการ',
    tip2: 'เลื่อนหรือซูมแผนที่จะอัปเดตห้องน้ำอัตโนมัติ',
    tip3: 'กด "ตำแหน่ง" เพื่อใช้ GPS',
    tip4: 'ห้องน้ำที่อยู่ใกล้กันจะรวมเป็นวงกลมสีน้ำเงิน',
    tip5: 'สามารถค้นหาที่อยู่ในแถบด้านบนได้',
    tip6: 'ใช้ตัวกรองเพื่อค้นหาแบบเจาะจง'
  },
  filters: {
    title: 'ตัวกรอง',
    grade: {
      label: 'ระดับ',
      all: 'ทั้งหมด',
      excellent: 'ดีเยี่ยม',
      good: 'ดี',
      fair: 'พอใช้',
      needsImprovement: 'ควรปรับปรุง',
      fail: 'ไม่ผ่าน'
    },
    type: {
      label: 'ประเภท',
      all: 'ทั้งหมด',
      male: 'ชาย',
      female: 'หญิง',
      mixed: 'รวม',
      accessible: 'ผู้พิการ',
      family: 'ครอบครัว'
    },
    diaper: 'แสดงเฉพาะที่มีโต๊ะเปลี่ยนผ้าอ้อม',
    reset: 'รีเซ็ต'
  },
  toiletList: {
    title: 'ห้องน้ำในพื้นที่แผนที่',
    count: '',
    countSuffix: 'ห้องน้ำ',
    viewAll: 'ดูทั้งหมด',
    viewAllN: 'ดูทั้งหมด {count} ห้องน้ำ',
    noData: 'ไม่พบห้องน้ำในพื้นที่',
    needLocation: 'อนุญาตการระบุตำแหน่งหรือเลื่อนแผนที่',
    cluster: {
      title: 'ห้องน้ำในจุดนี้',
      count: '',
      summary: 'มีห้องน้ำ {count} แห่งที่จุดนี้'
    }
  },
  toiletInfo: {
    grade: 'ระดับ',
    type: 'ประเภท',
    category: 'หมวดหมู่',
    diaper: 'โต๊ะเปลี่ยนผ้าอ้อม',
    diaperBadge: 'มีโต๊ะเปลี่ยนผ้าอ้อม',
    distance: 'ระยะทาง',
    manager: 'ผู้จัดการ',
    address: 'ที่อยู่',
    hasDialper: 'มี',
    noDialper: 'ไม่มี',
    navigation: 'เปิดนำทาง'
  },
  errors: {
    locationFailed: 'ระบุตำแหน่งไม่สำเร็จ',
    dataLoadFailed: 'โหลดข้อมูลไม่สำเร็จ',
    mapUpdateFailed: 'อัปเดตแผนที่ไม่สำเร็จ'
  },
  loading: {
    detectingCounty: 'กำลังตรวจหาเขต…',
    loadingCounty: 'กำลังโหลดข้อมูล {county}…',
    nearby: 'บริเวณใกล้เคียง',
    processing: 'กำลังประมวลผล…',
    processingToilets: 'กำลังประมวลผลข้อมูลห้องน้ำ…',
    done: 'เสร็จสิ้น',
    failed: 'โหลดล้มเหลว'
  }
}
