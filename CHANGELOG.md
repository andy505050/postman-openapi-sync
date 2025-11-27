# 變更記錄

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
