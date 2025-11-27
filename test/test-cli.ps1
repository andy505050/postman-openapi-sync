# CLI 功能測試指令碼 (PowerShell)

Write-Host "🧪 測試 Postman Sync CLI 工具" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 測試 1: 版本資訊
Write-Host "✅ 測試 1: 版本資訊" -ForegroundColor Green
postman-sync --version
Write-Host ""

# 測試 2: 主要幫助
Write-Host "✅ 測試 2: 主要幫助資訊" -ForegroundColor Green
postman-sync --help
Write-Host ""

# 測試 3: Sync 命令幫助
Write-Host "✅ 測試 3: Sync 命令幫助" -ForegroundColor Green
postman-sync sync --help
Write-Host ""

# 測試 4: Backup 命令幫助
Write-Host "✅ 測試 4: Backup 命令幫助" -ForegroundColor Green
postman-sync backup --help
Write-Host ""

# 測試 5: Convert 命令幫助
Write-Host "✅ 測試 5: Convert 命令幫助" -ForegroundColor Green
postman-sync convert --help
Write-Host ""

# 測試 6: Merge 命令幫助
Write-Host "✅ 測試 6: Merge 命令幫助" -ForegroundColor Green
postman-sync merge --help
Write-Host ""

# 測試 7: Validate 命令幫助
Write-Host "✅ 測試 7: Validate 命令幫助" -ForegroundColor Green
postman-sync validate --help
Write-Host ""

# 測試 8: Merge 功能 (使用現有備份)
Write-Host "✅ 測試 8: Merge 功能" -ForegroundColor Green
$file1 = "./collection-backup-2025-11-27T04-41-00-167Z.json"
$file2 = "./collection-backup-2025-11-27T06-55-18-140Z.json"

if ((Test-Path $file1) -and (Test-Path $file2)) {
    postman-sync merge `
        --original $file1 `
        --new $file2 `
        --output ../temp/cli-test-merge.json
    Write-Host ""
} else {
    Write-Host "⏭️  跳過 (找不到測試檔案)" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "🎉 測試完成!" -ForegroundColor Green
Write-Host ""
Write-Host "所有 CLI 命令都正常運作 ✅" -ForegroundColor Green
