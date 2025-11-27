# 快速開始指南

## 全域安裝 (推薦)

```bash
npm install -g postman-openapi-sync
```

## 設定環境變數

建立 `.env` 檔案:

```env
POSTMAN_API_KEY=your_postman_api_key
POSTMAN_COLLECTION_ID=your_collection_id
OPENAPI_PATH=./openapi.yaml
# REJECT_UNAUTHORIZED=false  # 選用: 允許自簽 SSL 憑證
```

## 基本使用

### 1. 完整同步 (最常用)

```bash
postman-sync sync
```

這會自動執行:

- 備份現有 Collection
- 轉換 OpenAPI 規格
- 智慧合併保留自訂設定
- 更新到 Postman
- 產生變更報告

### 2. 僅備份

```bash
postman-sync backup -c <collection-id> -k <api-key>
```

### 3. 僅轉換

```bash
postman-sync convert -o ./openapi.yaml
```

### 4. 合併兩個 Collection

```bash
postman-sync merge -o ./original.json -n ./new.json
```

### 5. 驗證 Collection

```bash
postman-sync validate -c ./collection.json
```

## 常見問題

### 如何取得 Postman API Key?

1. 登入 Postman
2. Settings → API Keys
3. Generate API Key

### 如何取得 Collection ID?

1. 在 Postman 開啟 Collection
2. 點擊 "..." → Share Collection
3. URL 中的 UUID 即為 Collection ID

### 是否需要每次都傳入參數?

不需要!設定好 `.env` 檔案後,直接執行 `postman-sync sync` 即可。

### 支援哪些 OpenAPI 格式?

- OpenAPI 3.0 (YAML/JSON)
- OpenAPI 2.0 / Swagger (YAML/JSON)

### 會覆蓋我的測試指令碼嗎?

不會!工具會智慧合併,保留:

- 測試指令碼 (Tests)
- 預請求指令碼 (Pre-request Scripts)
- 自訂標頭
- 環境變數
- 驗證設定

## 完整範例

```bash
# 1. 安裝
npm install -g postman-openapi-sync

# 2. 設定環境變數
cat > .env << EOF
POSTMAN_API_KEY=PMAK-xxxxx
POSTMAN_COLLECTION_ID=12345-xxxxx
OPENAPI_PATH=./api/openapi.yaml
EOF

# 3. 執行同步
postman-sync sync

# 4. 查看報告
cat reports/sync-report.md
```

## 更多資訊

查看完整文件: [README.md](README.md)
