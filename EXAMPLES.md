# 使用範例

## 情境 1: 首次設定並同步

```bash
# 1. 安裝工具
npm install -g postman-openapi-sync

# 2. 進入您的專案目錄
cd my-api-project

# 3. 建立環境變數檔案
cat > .env << EOF
POSTMAN_API_KEY=your_api_key_here
POSTMAN_COLLECTION_ID=your_collection_id_here
OPENAPI_PATH=./docs/openapi.yaml
# REJECT_UNAUTHORIZED=false  # 選用: 允許自簽憑證
EOF

# 4. 執行同步
postman-sync sync

# 5. 查看結果
cat reports/sync-report.md
```

輸出範例:

```
🚀 開始 Postman 集合同步流程...

📦 步驟 1/5: 備份現有集合...
✓ 備份完成

🔄 步驟 2/5: 轉換 OpenAPI 規格...
✓ 轉換完成

🔀 步驟 3/5: 合併集合並保留自訂設定...
✓ 合併完成

📊 步驟 4/5: 產生變更報告...
✓ 報告已儲存至 reports/sync-report.md

📤 步驟 5/5: 更新 Postman 集合...
✓ 集合已更新

🎉 同步完成!

變更摘要:
  • 新增: 3 個端點
  • 修改: 2 個端點
  • 移除: 0 個端點
```

## 情境 2: 使用命令列參數(不用設定 .env)

```bash
# 直接在命令列提供所有參數
postman-sync sync \
  --openapi ./docs/openapi.yaml \
  --collection your_collection_id_here \
  --api-key your_api_key_here
```

## 情境 3: 僅備份 Collection

```bash
# 定期備份 Collection
postman-sync backup \
  --collection your_collection_id_here \
  --api-key your_api_key_here

# 備份檔案會儲存在 backups/ 目錄
# 檔名格式: collection-backup-2025-11-27T07-00-54-491Z.json
```

## 情境 4: 轉換 OpenAPI 但不上傳

```bash
# 只想看轉換結果,不更新 Postman
postman-sync convert \
  --openapi ./docs/openapi.yaml \
  --output ./preview/collection.json

# 查看轉換後的檔案
cat ./preview/collection.json
```

支援多種格式:

```bash
# YAML 格式
postman-sync convert -o ./api.yaml

# JSON 格式
postman-sync convert -o ./api.json

# 從網址下載
postman-sync convert -o https://petstore3.swagger.io/api/v3/openapi.json

# 從使用自簽憑證的 HTTPS 網址下載
postman-sync convert -o https://internal-api.company.local/openapi.yaml --no-reject-unauthorized
```

## 情境 5: 手動合併兩個 Collection

```bash
# 1. 先準備兩個 collection 檔案
# original.json - 包含您的測試指令碼
# new.json - 從 OpenAPI 轉換的新版本

# 2. 合併
postman-sync merge \
  --original ./collections/original.json \
  --new ./collections/new.json \
  --output ./collections/merged.json

# 3. 查看合併結果
cat ./collections/merged.json
```

輸出範例:

```
🔀 正在合併集合...
✅ 合併完成!
  • 新增: 5 個端點
  • 修改: 3 個端點
  • 移除: 1 個端點
  • 檔案已儲存至: ./collections/merged.json
```

## 情境 6: 驗證 Collection

```bash
# 執行 Collection 中的所有測試
postman-sync validate \
  --collection ./collections/api.json \
  --environment ./environments/staging.json
```

輸出範例:

```
🧪 開始驗證集合...

📊 驗證結果:
  • 請求: 25
  • 測試: 48
  • 通過: 46
  • 失敗: 2
  • 斷言: 120

⚠️ 有測試失敗,請檢查 reports/validation-report.json

✅ 驗證完成!
```

## 情境 7: CI/CD 整合

### GitHub Actions

```yaml
# .github/workflows/sync-postman.yml
name: Sync Postman Collection

on:
  push:
    paths:
      - "docs/openapi.yaml"

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install postman-sync
        run: npm install -g postman-openapi-sync

      - name: Sync to Postman
        env:
          POSTMAN_API_KEY: ${{ secrets.POSTMAN_API_KEY }}
          POSTMAN_COLLECTION_ID: ${{ secrets.POSTMAN_COLLECTION_ID }}
          # REJECT_UNAUTHORIZED: false  # 如需允許自簽憑證,取消註解
        run: postman-sync sync --openapi ./docs/openapi.yaml

      - name: Upload report
        uses: actions/upload-artifact@v3
        with:
          name: sync-report
          path: reports/sync-report.md
```

### GitLab CI

```yaml
# .gitlab-ci.yml
sync-postman:
  image: node:18
  script:
    - npm install -g postman-openapi-sync
    - postman-sync sync --openapi ./docs/openapi.yaml
  only:
    changes:
      - docs/openapi.yaml
  variables:
    POSTMAN_API_KEY: $POSTMAN_API_KEY
    POSTMAN_COLLECTION_ID: $POSTMAN_COLLECTION_ID
    # REJECT_UNAUTHORIZED: "false"  # 如需允許自簽憑證,取消註解
  artifacts:
    paths:
      - reports/sync-report.md
```

## 情境 8: 本地開發工作流程

```bash
# 開發時的完整流程

# 1. 修改 OpenAPI 規格
vim docs/openapi.yaml

# 2. 先備份現有 Collection (以防萬一)
postman-sync backup

# 3. 本地轉換測試
postman-sync convert -o ./docs/openapi.yaml -d ./temp/preview.json

# 4. 手動檢查轉換結果
code ./temp/preview.json

# 5. 如果滿意,執行完整同步
postman-sync sync

# 6. 執行驗證確保沒問題
postman-sync validate
```

## 情境 9: 團隊協作

```bash
# 團隊成員 A: 更新 API 規格
git checkout -b feature/new-endpoint
vim docs/openapi.yaml
postman-sync sync
git add docs/openapi.yaml reports/sync-report.md
git commit -m "Add new endpoint"
git push

# 團隊成員 B: 同步到自己的環境
git pull
postman-sync sync  # 自動同步到 Postman

# 團隊成員 C: 只想看變更內容
postman-sync convert -o ./docs/openapi.yaml
diff backups/latest.json temp/converted-collection.json
```

## 情境 10: 多環境管理

```bash
# 開發環境
postman-sync sync \
  --openapi ./openapi.yaml \
  --collection $DEV_COLLECTION_ID

# 測試環境
postman-sync sync \
  --openapi ./openapi.yaml \
  --collection $STAGING_COLLECTION_ID

# 生產環境
postman-sync sync \
  --openapi ./openapi.yaml \
  --collection $PROD_COLLECTION_ID
```

## 除錯技巧

### 查看詳細錯誤資訊

```bash
# 設定 Node.js 為 debug 模式
NODE_DEBUG=* postman-sync sync
```

### 檢查 OpenAPI 規格是否有效

```bash
# 先轉換看是否成功
postman-sync convert -o ./openapi.yaml

# 檢查轉換後的檔案
jq . temp/converted-collection.json
```

### 比較變更內容

```bash
# 使用 diff 工具比較
diff -u backups/collection-backup-*.json temp/converted-collection.json

# 或使用 jq 格式化後比較
jq -S . backups/latest.json > /tmp/old.json
jq -S . temp/converted-collection.json > /tmp/new.json
diff -u /tmp/old.json /tmp/new.json
```

## 進階技巧

### 批次處理多個 Collection

```bash
#!/bin/bash
# sync-all-collections.sh

COLLECTIONS=(
  "12345678-1234-1234-1234-123456789abc:api-v1.yaml"
  "87654321-4321-4321-4321-cba987654321:api-v2.yaml"
)

for item in "${COLLECTIONS[@]}"; do
  IFS=':' read -r collection_id openapi_file <<< "$item"
  echo "Syncing $openapi_file to $collection_id..."
  postman-sync sync \
    --openapi "./specs/$openapi_file" \
    --collection "$collection_id"
done
```

### 自動產生變更日誌

```bash
#!/bin/bash
# generate-changelog.sh

postman-sync sync
cat reports/sync-report.md >> CHANGELOG.md
git add CHANGELOG.md
git commit -m "Update API changelog"
```
