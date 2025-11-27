# Postman collection 與 OpenAPI 規格同步工具

自動化工具, 用於將 Postman collection 與 OpenAPI 規格同步, 同時保留所有自訂測試、指令碼和設定。

## 快速開始

### 1. 安裝相依套件

```bash
yarn install
```

### 2. 設定環境變數

複製 `.env.example` 為 `.env` 並填入您的 Postman API 資訊:

```bash
cp .env.example .env
```

編輯 `.env` 檔案:

```env
POSTMAN_API_KEY=your_actual_api_key
POSTMAN_COLLECTION_ID=your_collection_id
OPENAPI_PATH=./openapi.yaml
```

### 3. 執行同步

```bash
# 方法 1: 使用命令列參數
yarn sync path/to/your/openapi.yaml your-collection-id

# 方法 2: 使用環境變數 (在 .env 中設定)
yarn sync
```

## 可用指令

### 完整同步流程

自動執行備份、轉換、合併、上傳的完整流程。

```bash
# 使用命令列參數
yarn sync <openapi-path> <collection-id>

# 使用環境變數
yarn sync
```

### 僅備份 collection

從 Postman API 下載並備份 collection。

```bash
# 使用命令列參數
yarn backup <collection-id>

# 使用環境變數
yarn backup
```

### 僅轉換 OpenAPI 規格

```bash
# 使用命令列參數
yarn convert <openapi-path>

# 使用環境變數
yarn convert
```

### 合併 collection

```bash
# 合併兩個collection檔案
yarn merge <原始collection> <新collection> [輸出路徑]

# 範例
yarn merge ./backups/collection-backup.json ./temp/converted-collection.json
yarn merge ./backups/backup.json ./temp/new.json ./output/merged.json
```

### 驗證 collection

```bash
# 驗證本地collection檔案
yarn validate <collection-path> [environment-path]

# 驗證預設暫存collection
yarn validate
```

## 使用範例

### 範例 1: 首次同步

```bash
# 1. 設定環境變數
cp .env.example .env
# 編輯 .env 填入 API 金鑰和collection ID

# 2. 執行同步
yarn sync ./api/openapi.yaml

# 3. 檢查報告
cat reports/sync-report.md
```

### 範例 2: 定期更新

```bash
# API 規格更新後,直接執行
yarn sync ./api/openapi.yaml

# 系統會自動:
# - 備份現有collection
# - 轉換新的 OpenAPI 規格
# - 智慧合併保留測試
# - 更新 Postman collection
# - 產生變更報告
```

### 範例 3: 僅測試轉換

```bash
# 不更新 Postman,僅本地轉換測試

# 本地檔案
yarn convert ./api/openapi.yaml
yarn convert ./api/openapi.json

# 從網址下載並轉換
yarn convert https://petstore3.swagger.io/api/v3/openapi.json
yarn convert https://api.example.com/openapi.yaml

# 轉換結果會儲存在 temp/converted-collection.json
```

### 範例 4: 手動合併 collection

```bash
# 如果需要手動控制合併過程
yarn backup  # 先備份現有collection
yarn convert ./api/openapi.yaml  # 轉換新的規格
yarn merge ./backups/collection-backup-2025-11-27T04-41-00-167Z.json ./temp/converted-collection.json

# 檢查合併結果後再手動上傳到 Postman
```

### 範例 5: 驗證更新後的 collection

```bash
# 執行collection中的所有測試
yarn validate ./temp/merged-collection.json ./environment.json
```

## 功能特色

- ✅ 自動備份現有 collection
- ✅ 智慧合併, 保留測試指令碼
- ✅ 保留自訂變數和驗證設定
- ✅ 詳細的變更追蹤報告
- ✅ 自動驗證更新後的 collection
- ✅ 支援本地檔案 (JSON/YAML)
- ✅ 支援從網址下載 OpenAPI 規格
- ✅ 可獨立使用各個步驟 (備份 / 轉換 / 合併 / 驗證)

## 專案結構

```
.
├── scripts/                  # 指令碼目錄
│   ├── backup-collection.js  # 備份指令碼
│   ├── convert-openapi.js    # 轉換指令碼
│   ├── merge-collections.js  # 合併指令碼
│   ├── sync-collection.js    # 主要同步指令碼
│   └── validate-collection.js # 驗證指令碼
├── backups/                  # 備份檔案 (自動建立)
├── temp/                     # 暫存檔案 (自動建立)
├── package.json
├── .env.example
└── README.md
```

## 取得 Postman API 金鑰

1. 登入 [Postman](https://www.postman.com/)
2. 進入 Settings > API Keys
3. 產生新的 API 金鑰
4. 複製並貼到 `.env` 檔案

## 取得 collection ID

在 Postman 中:

1. 開啟您的 collection
2. 點擊 collection 名稱旁的 "..." 選單
3. 選擇 "Share Collection"
4. 在 URL 中可以看到 collection ID (格式: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

## 環境變數說明

```env
# Postman API 金鑰 (必要)
POSTMAN_API_KEY=your_api_key

# Postman collection ID (必要)
POSTMAN_COLLECTION_ID=your_collection_id

# OpenAPI 規格路徑或 URL (可選)
OPENAPI_PATH=./openapi.yaml

# SSL 憑證驗證 (可選,預設為 true)
# 設定為 false 可允許自簽憑證
REJECT_UNAUTHORIZED=true
```

## 授權

MIT
