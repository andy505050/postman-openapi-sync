require('dotenv').config();
const { backupCollection } = require('./backup-collection');
const { convertOpenApiToPostman } = require('./convert-openapi');
const { mergeCollections } = require('./merge-collections');
const axios = require('axios');
const fs = require('fs').promises;

async function syncCollection(openapiPath, collectionId) {
    console.log('🚀 開始 Postman 集合同步流程...\n');

    try {
        // 步驟 1: 備份現有集合
        console.log('📦 步驟 1/5: 備份現有集合...');
        const originalCollection = await backupCollection(collectionId);
        console.log('✓ 備份完成\n');

        // 步驟 2: 轉換 OpenAPI 規格
        console.log('🔄 步驟 2/5: 轉換 OpenAPI 規格...');
        const newCollection = await convertOpenApiToPostman(openapiPath);
        console.log('✓ 轉換完成\n');

        // 步驟 3: 合併集合
        console.log('🔀 步驟 3/5: 合併集合並保留自訂設定...');
        const { merged, changes } = mergeCollections(originalCollection, newCollection);
        console.log('✓ 合併完成\n');

        // 步驟 4: 產生變更報告
        console.log('📊 步驟 4/5: 產生變更報告...');
        const report = generateReport(changes);
        const reportDir = './reports';
        await fs.mkdir(reportDir, { recursive: true });
        await fs.writeFile('./reports/sync-report.md', report);
        console.log('✓ 報告已儲存至 reports/sync-report.md\n');

        // 步驟 5: 更新 Postman 集合
        console.log('📤 步驟 5/5: 更新 Postman 集合...');
        await updateCollection(collectionId, merged);
        console.log('✓ 集合已更新\n');

        console.log('🎉 同步完成!');
        console.log(`\n變更摘要:`);
        console.log(`  • 新增: ${changes.added.length} 個端點`);
        console.log(`  • 修改: ${changes.modified.length} 個端點`);
        console.log(`  • 移除: ${changes.removed.length} 個端點`);

    } catch (error) {
        console.error('❌ 同步失敗:', error.message);
        if (error.response) {
            console.error('API 回應:', error.response.data);
        }
        throw error;
    }
}

async function updateCollection(collectionId, mergedCollection) {
    const apiKey = process.env.POSTMAN_API_KEY;

    if (!apiKey) {
        throw new Error('POSTMAN_API_KEY 未設定在環境變數中');
    }

    await axios.put(
        `https://api.getpostman.com/collections/${collectionId}`,
        mergedCollection,
        {
            headers: {
                'X-Api-Key': apiKey,
                'Content-Type': 'application/json'
            }
        }
    );
}

function generateReport(changes) {
    const timestamp = new Date().toISOString();
    return `# Postman 集合同步報告

生成時間: ${timestamp}

## 變更摘要

- **新增端點**: ${changes.added.length}
- **修改端點**: ${changes.modified.length}
- **移除端點**: ${changes.removed.length}

## 詳細變更

### 新增的端點
${changes.added.map(e => `- ${e}`).join('\n') || '無'}

### 修改的端點
${changes.modified.map(e => `- ${e}`).join('\n') || '無'}

### 移除的端點
${changes.removed.map(e => `- ${e}`).join('\n') || '無'}

## 保留的自訂設定

- ✓ 測試指令碼 (test events)
- ✓ 預請求指令碼 (prerequest events)
- ✓ 自訂標頭 (X-* headers)
- ✓ 集合變數
- ✓ 驗證設定
- ✓ 請求描述
`;
}

// CLI 執行
if (require.main === module) {
    const openapiPath = process.argv[2] || process.env.OPENAPI_PATH;
    const collectionId = process.argv[3] || process.env.POSTMAN_COLLECTION_ID;

    if (!openapiPath || !collectionId) {
        console.error('使用方式: node sync-collection.js <openapi-path> <collection-id>');
        console.error('或設定 OPENAPI_PATH 和 POSTMAN_COLLECTION_ID 環境變數');
        process.exit(1);
    }

    syncCollection(openapiPath, collectionId)
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}

module.exports = { syncCollection };
