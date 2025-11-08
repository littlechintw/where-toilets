# DNS 設定說明

本專案使用自訂網域 `toilets.littlechin.tw` 部署到 GitHub Pages。

## 🌐 DNS 設定步驟

### 1. 在你的 DNS 提供商設定 CNAME 記錄

```
類型: CNAME
名稱: toilets
值: <你的GitHub用戶名>.github.io
TTL: 3600 (或預設值)
```

例如，如果你的 GitHub 用戶名是 `littlechin`：

```
類型: CNAME  
名稱: toilets
值: littlechin.github.io
TTL: 3600
```

### 2. GitHub Pages 設定

1. 前往 Repository Settings > Pages
2. 在 "Custom domain" 輸入: `toilets.littlechin.tw`
3. 勾選 "Enforce HTTPS"（DNS 生效後）
4. 等待 DNS 檢查通過

### 3. 驗證設定

使用以下指令檢查 DNS 設定：

```bash
# 檢查 CNAME 記錄
dig toilets.littlechin.tw CNAME

# 檢查網站是否可訪問
curl -I https://toilets.littlechin.tw
```

## 🔧 常見問題

### DNS 尚未生效
- DNS 生效通常需要幾分鐘到幾小時
- 可以使用 [DNS Checker](https://dnschecker.org/) 檢查全球生效狀況

### HTTPS 證書問題
- GitHub Pages 會自動提供 Let's Encrypt 證書
- 初次設定可能需要等待幾分鐘

### 404 錯誤
- 確認 CNAME 檔案內容正確
- 確認 DNS CNAME 記錄指向正確的 GitHub Pages 網址
- 檢查 GitHub Pages 是否已啟用

## 📊 監控建議

設定以下監控來確保網站正常運作：

1. **DNS 監控**: 定期檢查 CNAME 記錄
2. **網站監控**: 使用 GitHub Actions 健康檢查
3. **SSL 監控**: 檢查 HTTPS 證書有效期

## 🔄 變更網域

如需變更到其他網域：

1. 更新 `public/CNAME` 檔案
2. 修改相關設定檔案
3. 更新 DNS 記錄
4. 在 GitHub Pages 設定中更新自訂網域

詳細步驟請參考主要 README 文件。