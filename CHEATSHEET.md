# 快速參考卡

## 安裝

```bash
npm install -g postman-openapi-sync
```

## 基本命令

### 同步

```bash
postman-sync sync -o <openapi-file> -c <collection-id> -k <api-key>
# 允許自簽 SSL 憑證
postman-sync sync -o <openapi-file> -c <collection-id> -k <api-key> --no-reject-unauthorized
```

### 備份

```bash
postman-sync backup -c <collection-id> -k <api-key>
```

### 轉換

```bash
postman-sync convert -o <openapi-file> -d <output-file>
# 允許自簽 SSL 憑證
postman-sync convert -o <openapi-file> -d <output-file> --no-reject-unauthorized
```

### 合併

```bash
postman-sync merge -o <original> -n <new> -d <output>
```

### 驗證

```bash
postman-sync validate -c <collection> -e <environment>
```

## 使用環境變數

設定 `.env`:

```env
POSTMAN_API_KEY=your_key
POSTMAN_COLLECTION_ID=your_id
OPENAPI_PATH=./openapi.yaml
REJECT_UNAUTHORIZED=false  # 選用: 允許自簽憑證
```

然後直接執行:

```bash
postman-sync sync
```

## 參數簡寫

| 完整            | 簡寫 |
| --------------- | ---- |
| `--openapi`     | `-o` |
| `--collection`  | `-c` |
| `--api-key`     | `-k` |
| `--output`      | `-d` |
| `--original`    | `-o` |
| `--new`         | `-n` |
| `--environment` | `-e` |

## 取得幫助

```bash
postman-sync --help
postman-sync <command> --help
```

## 常見用法

### 首次設定

```bash
npm install -g postman-openapi-sync
export POSTMAN_API_KEY=xxx
export POSTMAN_COLLECTION_ID=yyy
postman-sync sync -o ./openapi.yaml
```

### 定期更新

```bash
postman-sync sync  # 使用 .env 設定
```

### 僅本地測試

```bash
postman-sync convert -o ./openapi.yaml
postman-sync validate -c ./temp/converted-collection.json
```

### CI/CD

```bash
postman-sync sync --openapi $OPENAPI_PATH --collection $COLLECTION_ID
```

## 檔案位置

| 類型 | 位置                               |
| ---- | ---------------------------------- |
| 備份 | `backups/collection-backup-*.json` |
| 暫存 | `temp/converted-collection.json`   |
| 報告 | `reports/sync-report.md`           |
| 驗證 | `reports/validation-report.json`   |

## 更多資訊

- 完整文件: [README.md](README.md)
- 快速開始: [QUICKSTART.md](QUICKSTART.md)
- 使用範例: [EXAMPLES.md](EXAMPLES.md)
