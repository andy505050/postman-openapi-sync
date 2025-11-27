# 變更記錄

## [1.0.1] - 2025-11-27

### 新增

- ✨ 新增 `--no-reject-unauthorized` 參數支援自簽 SSL 憑證
  - `sync` 命令支援 `--no-reject-unauthorized` 選項
  - `convert` 命令支援 `--no-reject-unauthorized` 選項
- 🔧 新增 `REJECT_UNAUTHORIZED` 環境變數支援
- 📚 更新所有文件,加入 SSL 憑證驗證設定說明

### 改進

- 🌐 允許從使用自簽憑證的 HTTPS 端點下載 OpenAPI 規格
- 📖 完善文件中的 SSL 憑證相關說明和範例
- 🎯 CI/CD 範例中加入 REJECT_UNAUTHORIZED 設定參考

### 技術細節

- 使用 Node.js `https.Agent` 控制 SSL 驗證行為
- 預設啟用證書驗證 (安全優先)
- 支援通過命令列或環境變數停用驗證

## [1.0.0] - 2025-11-27

### 新增

- 🎉 CLI 工具初始版本
- ✨ `postman-sync sync` - 完整同步流程
- ✨ `postman-sync backup` - 備份 Collection
- ✨ `postman-sync convert` - 轉換 OpenAPI 規格
- ✨ `postman-sync merge` - 智慧合併 Collections
- ✨ `postman-sync validate` - 驗證 Collection
- 📚 完整的 CLI 文件和範例
- 🔧 支援命令列參數和環境變數
- 🎯 全域安裝支援

### 功能

- 自動備份現有 Collection
- 智慧合併保留自訂設定
- 產生詳細變更報告
- 支援 OpenAPI 3.0 和 2.0
- 支援 YAML 和 JSON 格式
- 從本地檔案或 URL 讀取規格

### 保留設定

- 測試指令碼 (test events)
- 預請求指令碼 (prerequest events)
- 自訂標頭 (X-\* headers)
- 集合變數
- 驗證設定
- 請求描述

### 文件

- README.md - 完整使用文件
- QUICKSTART.md - 快速開始指南
- EXAMPLES.md - 詳細使用範例
- PUBLISHING.md - 發布指南
- CLI_MIGRATION.md - 轉換記錄
- COMPLETION_REPORT.md - 完成報告

### 技術細節

- 使用 Commander.js v14.0.2
- Node.js >= 22.20.0
- 完全向後相容原有 npm scripts
- 已測試所有 CLI 命令
