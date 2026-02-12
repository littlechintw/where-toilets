import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// 環保署廁所資料 API 設定
const API_BASE_URL = 'https://data.moenv.gov.tw/api/v2';
const API_ENDPOINT = '/fac_p_07';
const API_KEY = process.env.MOENV_API_KEY; // 需要在 GitHub Secrets 設定

if (!API_KEY) {
  console.error('❌ 請設定 MOENV_API_KEY 環境變數');
  process.exit(1);
}

const OUTPUT_DIR = './public/data';
const RAW_DATA_FILE = path.join(OUTPUT_DIR, 'raw-toilets.json');

// 確保輸出目錄存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function fetchToiletData() {
  console.log('🚀 開始抓取廁所資料...');
  
  const allToilets = [];
  let offset = 0;
  const limit = 1000;
  let hasMore = true;
  
  try {
    while (hasMore) {
      const url = `${API_BASE_URL}${API_ENDPOINT}?language=zh&limit=${limit}&offset=${offset}&api_key=${API_KEY}`;
      
      console.log(`📥 抓取第 ${offset / limit + 1} 批資料 (offset: ${offset})`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API 請求失敗: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // 檢查回應格式 - API 可能直接返回陣列或包含 records 的物件
      let records;
      if (Array.isArray(data)) {
        // 新格式：直接返回陣列
        records = data;
      } else if (data.records && Array.isArray(data.records)) {
        // 舊格式：包含 records 屬性
        records = data.records;
      } else {
        console.error('❌ API 回應格式不正確:', data);
        break;
      }
      
      if (records.length === 0) {
        console.log('✅ 已抓取完所有資料');
        hasMore = false;
        break;
      }
      
      // 顯示總數資訊
      if (offset === 0) {
        if (data.total) {
          console.log(`📊 總計 ${data.total} 筆資料需要抓取`);
        } else {
          console.log(`📊 開始抓取資料（無總數資訊）`);
        }
      }
      
      allToilets.push(...records);
      offset += limit;
      
      console.log(`✅ 已抓取 ${allToilets.length} 筆資料`);
      
      // 檢查是否已達到總數（如果有 total 資訊的話）
      if (data.total && allToilets.length >= parseInt(data.total)) {
        console.log('✅ 已抓取完所有資料');
        hasMore = false;
        break;
      }
      
      // 如果返回的資料少於 limit，表示已經是最後一批
      if (records.length < limit) {
        console.log('✅ 已抓取完所有資料');
        hasMore = false;
        break;
      }
      
      // 避免過快請求被限流
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 儲存原始資料
    fs.writeFileSync(RAW_DATA_FILE, JSON.stringify(allToilets, null, 2));
    console.log(`💾 原始資料已儲存到 ${RAW_DATA_FILE}`);
    console.log(`📊 總共抓取 ${allToilets.length} 筆廁所資料`);
    
    return allToilets;
    
  } catch (error) {
    console.error('❌ 抓取資料時發生錯誤:', error);
    throw error;
  }
}

// 執行抓取
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchToiletData()
    .then(() => {
      console.log('🎉 資料抓取完成！');
    })
    .catch((error) => {
      console.error('💥 程序執行失敗:', error);
      process.exit(1);
    });
}

export { fetchToiletData };
