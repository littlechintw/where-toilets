/**
 * Google AdSense 設定。
 *
 * 原則（低調、不影響操作）：
 *   - 只在首頁與設定頁各放一個「固定尺寸」的手動版位，位置在頁面最底、頁尾上方，
 *     離所有可點擊的控制項都有一段距離。手機 320×50、桌機 728×90，高度預先保留，不會跳版。
 *   - 地圖頁永遠不放廣告。
 *   - 不使用自動廣告（Auto ads）。全幅／插頁（vignette）、錨定（anchor）、側邊欄這類
 *     會蓋住畫面或固定在螢幕上的廣告都屬於自動廣告，必須在 AdSense 後台針對這個網站關閉。
 *   - 要求非個人化廣告（requestNonPersonalizedAds），減少 cookie 與同意流程。
 *   - 廣告 script 延後到使用者第一次互動或瀏覽器閒置後才載入，不影響首屏。
 *
 * ADSENSE_CLIENT 或對應的 slot 只要有一個是空字串，該版位就完全不載入、不渲染
 * （正式環境連容器都不會有；開發模式會顯示虛線佔位框方便看版面）。
 *
 * 啟用步驟：
 *   1. AdSense 後台「廣告 › 依網站 › toilets.littlechin.tw」：把「自動廣告」關閉。
 *   2. 「廣告 › 依廣告單元 › 多媒體廣告」建立兩個單元（例如 home-bottom、settings-bottom），
 *      把各自的 data-ad-slot 數字填進 AD_SLOTS。
 *   3. 把發布商 ID（ca-pub-…）填進 ADSENSE_CLIENT，並確認 public/ads.txt 那一行的 pub- 數字一致。
 *   4. 「隱私權與訊息 › 歐洲法規」開啟 GDPR 訊息（Google 自家的同意工具）。
 *      只有歐洲訪客會看到同意視窗，台灣訪客不會。
 *   5. 重新 build 部署。
 */

/** 發布商 ID。後台顯示的是 pub-…，程式碼裡要加 ca- 前綴；留空 = 全站不載入廣告 */
export const ADSENSE_CLIENT = 'ca-pub-5042600791806925'

/** 各版位的廣告單元 ID（data-ad-slot），留空 = 該版位不渲染 */
export const AD_SLOTS = {
  home: '2239435857',      // home-bottom
  settings: '4597473053'   // settings-bottom
}

/** 某個版位是否應該啟用 */
export function adsEnabled(slot) {
  return Boolean(ADSENSE_CLIENT && slot)
}
