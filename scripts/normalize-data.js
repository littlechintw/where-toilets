import fs from 'fs';
import path from 'path';

const INPUT_FILE = './public/data/raw-toilets.json';
const OUTPUT_DIR = './public/data';
const COUNTIES_DIR = path.join(OUTPUT_DIR, 'counties');
const INDEX_FILE = path.join(OUTPUT_DIR, 'index.json');

// 縣市代碼對照表（根據政府開放資料標準）
const COUNTY_CODE_MAP = {
  '10002': '台北市',
  '10003': '新北市',
  '10004': '桃園市',
  '10005': '台中市',
  '10006': '台南市',
  '10007': '高雄市',
  '10008': '基隆市',
  '10009': '新竹市',
  '10010': '嘉義市',
  '10018': '新竹縣',
  '10013': '苗栗縣',
  '10015': '彰化縣',
  '10016': '南投縣',
  '10017': '雲林縣',
  '10019': '嘉義縣',
  '10020': '屏東縣',
  '10021': '宜蘭縣',
  '10022': '花蓮縣',
  '10023': '台東縣',
  '10014': '澎湖縣',
  '10024': '金門縣',
  '10025': '連江縣'
};

// 縣市英文名稱對照
const COUNTY_EN_MAP = {
  '台北市': 'Taipei',
  '新北市': 'NewTaipei',
  '桃園市': 'Taoyuan',
  '台中市': 'Taichung',
  '台南市': 'Tainan',
  '高雄市': 'Kaohsiung',
  '基隆市': 'Keelung',
  '新竹市': 'HsinchuCity',
  '嘉義市': 'ChiayiCity',
  '新竹縣': 'HsinchuCounty',
  '苗栗縣': 'Miaoli',
  '彰化縣': 'Changhua',
  '南投縣': 'Nantou',
  '雲林縣': 'Yunlin',
  '嘉義縣': 'ChiayiCounty',
  '屏東縣': 'Pingtung',
  '宜蘭縣': 'Yilan',
  '花蓮縣': 'Hualien',
  '台東縣': 'Taitung',
  '澎湖縣': 'Penghu',
  '金門縣': 'Kinmen',
  '連江縣': 'Lienchiang'
};

// 等級對照
const GRADE_MAP = {
  '特優': 'excellent',
  '優等': 'good',
  '普通': 'fair',
  '加強': 'needs_improvement',
  '不合格': 'fail'
};

// 類型對照
const TYPE_MAP = {
  '男廁': 'male',
  '女廁': 'female',
  '混合廁所': 'mixed',
  '親子廁所': 'family'
};

const CATEGORY_MAP = {
  '商業營業場所': 'commercial',
  '公園綠地': 'park',
  '風景遊憩': 'tourist',
  '交通場站': 'transport',
  '其他': 'other'
};

function getCountyFromAddress(address) {
  if (!address) return null;
  
  // 取地址前三個字
  const prefix = address.substring(0, 3);
  
  // 縣市名稱對照（前三字）
  const countyMap = {
    '台北市': '台北市',
    '臺北市': '台北市',
    '新北市': '新北市',
    '桃園市': '桃園市',
    '台中市': '台中市',
    '臺中市': '台中市',
    '台南市': '台南市',
    '臺南市': '台南市',
    '高雄市': '高雄市',
    '基隆市': '基隆市',
    '新竹市': '新竹市',
    '新竹縣': '新竹縣',
    '嘉義市': '嘉義市',
    '嘉義縣': '嘉義縣',
    '苗栗縣': '苗栗縣',
    '彰化縣': '彰化縣',
    '南投縣': '南投縣',
    '雲林縣': '雲林縣',
    '屏東縣': '屏東縣',
    '宜蘭縣': '宜蘭縣',
    '花蓮縣': '花蓮縣',
    '台東縣': '台東縣',
    '臺東縣': '台東縣',
    '澎湖縣': '澎湖縣',
    '金門縣': '金門縣',
    '連江縣': '連江縣'
  };
  
  return countyMap[prefix] || null;
}

function normalizeToiletData(rawData) {
  // 優先使用地址前三字判斷縣市，若無法判斷才使用 county 欄位
  let countyName = getCountyFromAddress(rawData.address);
  
  // 如果地址判斷不出來，使用 COUNTY_CODE_MAP
  if (!countyName) {
    countyName = COUNTY_CODE_MAP[rawData.county] || rawData.county;
  }
  
  // 處理座標 - 某些資料欄位錯位
  let latitude = parseFloat(rawData.latitude) || 0;
  let longitude = parseFloat(rawData.longitude) || 0;
  
  // 如果 latitude 不是有效數字，檢查是否欄位錯位
  if (!latitude && rawData.latitude && typeof rawData.latitude === 'string') {
    // 情況1: longitude -> latitude, grade -> longitude
    const altLat1 = parseFloat(rawData.longitude);
    const altLng1 = parseFloat(rawData.grade);
    
    if (altLat1 && altLng1 && altLat1 > 20 && altLat1 < 30 && altLng1 > 115 && altLng1 < 125) {
      latitude = altLat1;
      longitude = altLng1;
    }
  }
  
  // 如果還是沒有座標，檢查另一種錯位情況
  if (!latitude || !longitude) {
    // 情況2: grade -> latitude, type2 -> longitude
    const altLat2 = parseFloat(rawData.grade);
    const altLng2 = parseFloat(rawData.type2);
    
    if (altLat2 && altLng2 && altLat2 > 20 && altLat2 < 30 && altLng2 > 115 && altLng2 < 125) {
      latitude = altLat2;
      longitude = altLng2;
    }
  }
  
  return {
    // 基本資訊
    id: rawData.number,
    name_zh: rawData.name,
    name_en: '', // 可以之後加翻譯
    address_zh: rawData.address,
    address_en: '', // 可以之後加翻譯
    
    // 位置資訊
    county_zh: countyName,
    county_en: COUNTY_EN_MAP[countyName] || countyName,
    area_zh: rawData.village || '',
    latitude: latitude,
    longitude: longitude,
    
    // 廁所資訊
    grade: GRADE_MAP[rawData.grade] || rawData.grade,
    grade_zh: rawData.grade,
    type: TYPE_MAP[rawData.type] || 'mixed',
    type_zh: rawData.type,
    category: CATEGORY_MAP[rawData.type2] || 'other',
    category_zh: rawData.type2,
    
    // 設施
    has_diaper: rawData.diaper === '1' || rawData.diaper === 1,
    
    // 管理資訊
    administration: rawData.administration,
    manager: rawData.exec,
    
    // 元資料
    last_updated: new Date().toISOString().split('T')[0]
  };
}

function generateCountyBounds(toilets) {
  const bounds = {};
  
  toilets.forEach(toilet => {
    const county = toilet.county_en;
    if (!bounds[county]) {
      bounds[county] = {
        minLat: toilet.latitude,
        maxLat: toilet.latitude,
        minLng: toilet.longitude,
        maxLng: toilet.longitude,
        count: 0
      };
    }
    
    bounds[county].minLat = Math.min(bounds[county].minLat, toilet.latitude);
    bounds[county].maxLat = Math.max(bounds[county].maxLat, toilet.latitude);
    bounds[county].minLng = Math.min(bounds[county].minLng, toilet.longitude);
    bounds[county].maxLng = Math.max(bounds[county].maxLng, toilet.longitude);
    bounds[county].count++;
  });
  
  return bounds;
}

async function normalizeData() {
  console.log('🔄 開始正規化資料...');
  
  try {
    // 讀取原始資料
    if (!fs.existsSync(INPUT_FILE)) {
      throw new Error(`找不到原始資料檔案: ${INPUT_FILE}`);
    }
    
    const rawData = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
    console.log(`📖 讀取了 ${rawData.length} 筆原始資料`);
    
    // 確保輸出目錄存在
    if (!fs.existsSync(COUNTIES_DIR)) {
      fs.mkdirSync(COUNTIES_DIR, { recursive: true });
    }
    
    // 正規化資料並追蹤被過濾的資料
    const normalizedData = [];
    const filteredOut = {
      noCoordinates: [],
      unknownCounty: [],
      invalidData: []
    };
    
    rawData.forEach((raw, index) => {
      try {
        const toilet = normalizeToiletData(raw);
        
        // 檢查是否有座標
        if (!toilet.latitude || !toilet.longitude) {
          filteredOut.noCoordinates.push({
            index,
            id: raw.number,
            name: raw.name,
            address: raw.address,
            reason: '缺少座標資訊'
          });
          return;
        }
        
        // 檢查是否有有效的縣市
        if (!toilet.county_zh || !COUNTY_EN_MAP[toilet.county_zh]) {
          filteredOut.unknownCounty.push({
            index,
            id: raw.number,
            name: raw.name,
            address: raw.address,
            county_code: raw.county,
            county_name: toilet.county_zh,
            reason: '無法辨識縣市'
          });
          return;
        }
        
        normalizedData.push(toilet);
      } catch (error) {
        filteredOut.invalidData.push({
          index,
          raw: raw,
          error: error.message,
          reason: '資料格式錯誤'
        });
      }
    });
    
    console.log(`✅ 正規化完成，有效資料 ${normalizedData.length} 筆`);
    
    // 顯示被過濾的資料統計
    const totalFiltered = filteredOut.noCoordinates.length + 
                          filteredOut.unknownCounty.length + 
                          filteredOut.invalidData.length;
    
    // 總是儲存過濾報告（即使是空的）
    const filteredReportPath = path.join(OUTPUT_DIR, 'filtered-data-report.json');
    fs.writeFileSync(filteredReportPath, JSON.stringify(filteredOut, null, 2));
    
    if (totalFiltered > 0) {
      console.log(`\n⚠️  被過濾的資料: ${totalFiltered} 筆`);
      
      if (filteredOut.noCoordinates.length > 0) {
        console.log(`\n❌ 缺少座標 (${filteredOut.noCoordinates.length} 筆):`);
        filteredOut.noCoordinates.slice(0, 5).forEach(item => {
          console.log(`  - [${item.id}] ${item.name}`);
          console.log(`    地址: ${item.address || '無'}`);
        });
        if (filteredOut.noCoordinates.length > 5) {
          console.log(`  ... 還有 ${filteredOut.noCoordinates.length - 5} 筆`);
        }
      }
      
      if (filteredOut.unknownCounty.length > 0) {
        console.log(`\n❌ 無法辨識縣市 (${filteredOut.unknownCounty.length} 筆):`);
        filteredOut.unknownCounty.slice(0, 10).forEach(item => {
          console.log(`  - [${item.id}] ${item.name}`);
          console.log(`    地址: ${item.address || '無'}`);
          console.log(`    縣市代碼: ${item.county_code}, 解析結果: ${item.county_name}`);
        });
        if (filteredOut.unknownCounty.length > 10) {
          console.log(`  ... 還有 ${filteredOut.unknownCounty.length - 10} 筆`);
        }
      }
      
      if (filteredOut.invalidData.length > 0) {
        console.log(`\n❌ 資料格式錯誤 (${filteredOut.invalidData.length} 筆):`);
        filteredOut.invalidData.slice(0, 3).forEach(item => {
          console.log(`  - Index ${item.index}: ${item.error}`);
        });
        if (filteredOut.invalidData.length > 3) {
          console.log(`  ... 還有 ${filteredOut.invalidData.length - 3} 筆`);
        }
      }
      
      console.log(`\n📄 詳細過濾報告已儲存: ${filteredReportPath}`);
    } else {
      console.log(`\n✅ 所有資料都成功處理，沒有被過濾的資料！`);
      console.log(`📄 空白過濾報告已儲存: ${filteredReportPath}`);
    }
    
    // 按縣市分組
    const countiesData = {};
    normalizedData.forEach(toilet => {
      const county = toilet.county_en;
      if (!countiesData[county]) {
        countiesData[county] = [];
      }
      countiesData[county].push(toilet);
    });
    
    // 生成縣市邊界資訊
    const countyBounds = generateCountyBounds(normalizedData);
    
    // 儲存各縣市資料
    const countyList = [];
    for (const [countyEn, toilets] of Object.entries(countiesData)) {
      const countyZh = toilets[0]?.county_zh || countyEn;
      const fileName = `${countyEn.toLowerCase()}.json`;
      const filePath = path.join(COUNTIES_DIR, fileName);
      
      // 按距離中心點排序（可選）
      const centerLat = (countyBounds[countyEn].minLat + countyBounds[countyEn].maxLat) / 2;
      const centerLng = (countyBounds[countyEn].minLng + countyBounds[countyEn].maxLng) / 2;
      
      toilets.sort((a, b) => {
        const distA = Math.sqrt(Math.pow(a.latitude - centerLat, 2) + Math.pow(a.longitude - centerLng, 2));
        const distB = Math.sqrt(Math.pow(b.latitude - centerLat, 2) + Math.pow(b.longitude - centerLng, 2));
        return distA - distB;
      });
      
      fs.writeFileSync(filePath, JSON.stringify(toilets, null, 2));
      console.log(`💾 ${countyZh} (${countyEn}): ${toilets.length} 筆資料 → ${fileName}`);
      
      countyList.push({
        name_zh: countyZh,
        name_en: countyEn,
        filename: fileName,
        count: toilets.length,
        bounds: countyBounds[countyEn]
      });
    }
    
    // 產生索引檔案
    const indexData = {
      last_updated: new Date().toISOString(),
      total_count: normalizedData.length,
      counties: countyList.sort((a, b) => a.name_zh.localeCompare(b.name_zh, 'zh-TW')),
      data_source: '環保署開放資料',
      version: '1.0.0'
    };
    
    fs.writeFileSync(INDEX_FILE, JSON.stringify(indexData, null, 2));
    console.log(`📋 索引檔案已建立: ${INDEX_FILE}`);
    
    // 產生部署標記檔案（用於觸發網站部署）
    const deployFlag = {
      updated_at: new Date().toISOString(),
      trigger_deploy: true,
      data_version: indexData.version,
      total_toilets: normalizedData.length
    };
    
    const deployFlagPath = path.join(OUTPUT_DIR, 'deploy-flag.json');
    fs.writeFileSync(deployFlagPath, JSON.stringify(deployFlag, null, 2));
    console.log(`🚀 部署標記檔案已建立: ${deployFlagPath}`);
    
    // 產生統計報告
    console.log('\n📊 資料統計:');
    console.log(`總計: ${normalizedData.length} 筆廁所資料`);
    console.log(`縣市數: ${countyList.length} 個`);
    countyList.forEach(county => {
      console.log(`  ${county.name_zh}: ${county.count} 筆`);
    });
    
    return {
      total: normalizedData.length,
      counties: countyList.length,
      indexFile: INDEX_FILE
    };
    
  } catch (error) {
    console.error('❌ 正規化資料時發生錯誤:', error);
    throw error;
  }
}

// 執行正規化
if (import.meta.url === `file://${process.argv[1]}`) {
  normalizeData()
    .then((stats) => {
      console.log('🎉 資料正規化完成！');
      console.log(`📈 處理了 ${stats.total} 筆資料，分為 ${stats.counties} 個縣市檔案`);
    })
    .catch((error) => {
      console.error('💥 程序執行失敗:', error);
      process.exit(1);
    });
}

export { normalizeData };
