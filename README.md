# Postman OpenAPI Sync CLI

自動化 Postman Collection 與 OpenAPI 規格同步的命令列工具。

## 功能特色

- 🔄 自動同步 OpenAPI 規格到 Postman Collection
- 📦 備份現有 Postman Collection
- 🔀 智慧合併,保留自訂設定(測試指令碼、標頭、變數等)
- 🧪 執行 Newman 驗證集合
- 📊 產生詳細的變更報告
- 🚀 簡單易用的 CLI 介面

## 重要說明

⚠️ **Collection 格式限制**: 合併功能僅支援使用本工具的 converter 轉換或從 Postman 匯入時的 collection 格式。手動編輯的 collection 可能因資料夾結構不符合內建規則而無法正常合併。並且 converter 和 Postman 匯入的 collection 也會有細微差異。

## 系統需求

- Node.js 22.20.0 或更高版本 (較低版本未經測試, 可能無法正常運作)

### 安裝 Node.js

#### 方法 1: 直接安裝

前往 [Node.js 官方網站](https://nodejs.org/) 下載並安裝適合您作業系統的版本。建議安裝 LTS (長期支援) 版本。

#### 方法 2: 使用 nvm (推薦)

使用 [nvm (Node Version Manager)](https://github.com/nvm-sh/nvm) 可以輕鬆管理多個 Node.js 版本:

**Windows**:

```bash
# 安裝 nvm-windows
# 從 https://github.com/coreybutler/nvm-windows/releases 下載安裝程式

# 安裝 Node.js LTS 版本
nvm install lts
nvm use lts
```

**macOS/Linux**:

```bash
# 安裝 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 安裝 Node.js LTS 版本
nvm install --lts
nvm use --lts
```

#### 確認安裝

安裝完成後, 可以在終端機執行以下指令確認版本:

```bash
node --version
npm --version
```

## 安裝

### 全域安裝

```bash
npm install -g postman-openapi-sync
```

### 本地安裝

```bash
npm install postman-openapi-sync
```

### 開發模式

```bash
git clone <repository-url>
cd postman-openapi-sync
npm install
npm link
```

## 設定

建立 `.env` 檔案並設定以下環境變數:

```env
POSTMAN_API_KEY=your_postman_api_key
POSTMAN_COLLECTION_ID=your_collection_id
OPENAPI_PATH=./path/to/openapi.yaml
# REJECT_UNAUTHORIZED=false  # 選用: 允許自簽 SSL 憑證 (預設為 true)
```

## 使用方式

### 同步集合

將 OpenAPI 規格同步到 Postman Collection:

```bash
postman-sync sync --openapi ./openapi.yaml --collection <collection-id>
```

或使用環境變數:

```bash
postman-sync sync
```

### 備份集合

備份現有的 Postman Collection:

```bash
postman-sync backup --collection <collection-id>
```

備份檔案會儲存在 `backups/` 目錄中,包含時間戳記。

### 轉換 OpenAPI

將 OpenAPI 規格轉換為 Postman Collection 格式:

```bash
postman-sync convert --openapi ./openapi.yaml --output ./output/collection.json
```

### 合併集合

合併兩個 Postman Collection,保留自訂設定:

```bash
postman-sync merge --original ./original.json --new ./new.json --output ./merged.json
```

### 驗證集合

使用 Newman 執行集合測試:

```bash
postman-sync validate --collection ./collection.json --environment ./env.json
```

## 命令列選項

### sync

| 選項                       | 簡寫 | 說明                             | 預設值                           |
| -------------------------- | ---- | -------------------------------- | -------------------------------- |
| `--openapi <path>`         | `-o` | OpenAPI 規格檔案路徑             | `OPENAPI_PATH` 環境變數          |
| `--collection <id>`        | `-c` | Postman Collection ID            | `POSTMAN_COLLECTION_ID` 環境變數 |
| `--api-key <key>`          | `-k` | Postman API Key                  | `POSTMAN_API_KEY` 環境變數       |
| `--no-reject-unauthorized` | 無   | 停用 SSL 憑證驗證 (允許自簽憑證) | 預設啟用憑證驗證                 |

### backup

| 選項                | 簡寫 | 說明                  | 預設值                           |
| ------------------- | ---- | --------------------- | -------------------------------- |
| `--collection <id>` | `-c` | Postman Collection ID | `POSTMAN_COLLECTION_ID` 環境變數 |
| `--api-key <key>`   | `-k` | Postman API Key       | `POSTMAN_API_KEY` 環境變數       |

### convert

| 選項                       | 簡寫 | 說明                             | 預設值                             |
| -------------------------- | ---- | -------------------------------- | ---------------------------------- |
| `--openapi <path>`         | `-o` | OpenAPI 規格檔案路徑             | `OPENAPI_PATH` 環境變數            |
| `--output <path>`          | `-d` | 輸出檔案路徑                     | `./temp/converted-collection.json` |
| `--no-reject-unauthorized` | 無   | 停用 SSL 憑證驗證 (允許自簽憑證) | 預設啟用憑證驗證                   |

### merge

| 選項                | 簡寫 | 說明             | 預設值                          |
| ------------------- | ---- | ---------------- | ------------------------------- |
| `--original <path>` | `-o` | 原始集合檔案路徑 | 必填                            |
| `--new <path>`      | `-n` | 新集合檔案路徑   | 必填                            |
| `--output <path>`   | `-d` | 輸出檔案路徑     | `./temp/merged-collection.json` |

### validate

| 選項                   | 簡寫 | 說明         | 預設值                          |
| ---------------------- | ---- | ------------ | ------------------------------- |
| `--collection <path>`  | `-c` | 集合檔案路徑 | `./temp/merged-collection.json` |
| `--environment <path>` | `-e` | 環境檔案路徑 | 無                              |

## 工作流程

完整的同步流程包含以下步驟:

1. **備份**: 自動備份現有 Postman Collection
2. **轉換**: 將 OpenAPI 規格轉換為 Postman Collection 格式
3. **合併**: 智慧合併新舊集合,保留自訂設定
4. **報告**: 產生詳細的變更報告
5. **更新**: 將合併後的集合更新到 Postman

## 保留的自訂設定

同步時會保留以下自訂設定:

- ✅ 測試指令碼 (test events)
- ✅ 預請求指令碼 (prerequest events)
- ✅ 自訂標頭 (X-\* headers)
- ✅ 集合變數
- ✅ 驗證設定
- ✅ 請求描述

## 範例

### 完整同步流程

```bash
# 設定環境變數
export POSTMAN_API_KEY=your_api_key
export POSTMAN_COLLECTION_ID=your_collection_id
export OPENAPI_PATH=./openapi.yaml

# 執行同步
postman-sync sync

# 查看變更報告
cat reports/sync-report.md
```

### 手動工作流程

```bash
# 1. 備份現有集合
postman-sync backup -c <collection-id>

# 2. 轉換 OpenAPI 規格
postman-sync convert -o ./openapi.yaml -d ./temp/new-collection.json

# 3. 合併集合
postman-sync merge -o ./backups/latest-backup.json -n ./temp/new-collection.json

# 4. 驗證合併結果
postman-sync validate -c ./temp/merged-collection.json
```

### 使用本地 npm scripts (開發模式)

如果您是在專案目錄下開發,也可以使用原有的 npm scripts:

```bash
# 完整同步流程
npm run sync
# 或
yarn sync

# 其他命令
npm run backup
npm run convert ./openapi.yaml
npm run validate
```

## 程式化使用

也可以在 Node.js 程式碼中使用:

```javascript
const { syncCollection } = require("postman-openapi-sync");

async function main() {
  await syncCollection("./openapi.yaml", "collection-id");
}

main().catch(console.error);
```

## 取得 Postman API 金鑰

1. 登入 [Postman](https://www.postman.com/)
2. 進入 Settings > API Keys
3. 產生新的 API 金鑰
4. 複製並貼到 `.env` 檔案或使用 `--api-key` 參數

## 取得 Collection ID

在 Postman 中:

1. 開啟您的 collection
2. 點擊 collection 名稱旁的 "..." 選單
3. 選擇 "Share Collection"
4. 在 URL 中可以看到 collection ID (格式: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

## 專案結構

```
.
├── bin/
│   └── postman-sync.js       # CLI 入口
├── scripts/                  # 核心指令碼
│   ├── backup-collection.js
│   ├── convert-openapi.js
│   ├── merge-collections.js
│   ├── sync-collection.js
│   └── validate-collection.js
├── backups/                  # 備份檔案 (自動建立)
├── temp/                     # 暫存檔案 (自動建立)
├── reports/                  # 報告檔案 (自動建立)
├── package.json
└── README.md
```

## 授權

MIT License

## 作者

andy505050
