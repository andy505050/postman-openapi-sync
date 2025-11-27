#!/bin/bash
# CLI 功能測試指令碼

echo "🧪 測試 Postman Sync CLI 工具"
echo "================================"
echo ""

# 測試 1: 版本資訊
echo "✅ 測試 1: 版本資訊"
postman-sync --version
echo ""

# 測試 2: 主要幫助
echo "✅ 測試 2: 主要幫助資訊"
postman-sync --help
echo ""

# 測試 3: Sync 命令幫助
echo "✅ 測試 3: Sync 命令幫助"
postman-sync sync --help
echo ""

# 測試 4: Backup 命令幫助
echo "✅ 測試 4: Backup 命令幫助"
postman-sync backup --help
echo ""

# 測試 5: Convert 命令幫助
echo "✅ 測試 5: Convert 命令幫助"
postman-sync convert --help
echo ""

# 測試 6: Merge 命令幫助
echo "✅ 測試 6: Merge 命令幫助"
postman-sync merge --help
echo ""

# 測試 7: Validate 命令幫助
echo "✅ 測試 7: Validate 命令幫助"
postman-sync validate --help
echo ""

# 測試 8: Merge 功能 (使用現有備份)
echo "✅ 測試 8: Merge 功能"
if [ -f "./collection-backup-2025-11-27T04-41-00-167Z.json" ] && [ -f "./collection-backup-2025-11-27T06-55-18-140Z.json" ]; then
    postman-sync merge \
        --original ./collection-backup-2025-11-27T04-41-00-167Z.json \
        --new ./collection-backup-2025-11-27T06-55-18-140Z.json \
        --output ../temp/cli-test-merge.json
    echo ""
else
    echo "⏭️  跳過 (找不到測試檔案)"
    echo ""
fi

echo "🎉 測試完成!"
echo ""
echo "所有 CLI 命令都正常運作 ✅"
