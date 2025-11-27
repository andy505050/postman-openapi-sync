require('dotenv').config();
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

async function backupCollection(collectionId) {
    const apiKey = process.env.POSTMAN_API_KEY;
    const backupDir = path.join(__dirname, '../backups');

    if (!apiKey) {
        throw new Error('POSTMAN_API_KEY 未設定在環境變數中');
    }

    // 建立備份目錄
    await fs.mkdir(backupDir, { recursive: true });

    console.log(`正在從 Postman API 匯出集合 ${collectionId}...`);

    // 從 Postman API 匯出集合
    const response = await axios.get(
        `https://api.getpostman.com/collections/${collectionId}`,
        {
            headers: { 'X-Api-Key': apiKey }
        }
    );

    // 儲存備份檔案(含時間戳記)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `collection-backup-${timestamp}.json`;
    const filepath = path.join(backupDir, filename);

    await fs.writeFile(
        filepath,
        JSON.stringify(response.data, null, 2)
    );

    console.log(`✓ 集合已備份至: ${filename}`);
    return response.data;
}

// CLI 執行
if (require.main === module) {
    const collectionId = process.argv[2] || process.env.POSTMAN_COLLECTION_ID;

    if (!collectionId) {
        console.error('使用方式: node backup-collection.js <collection-id>');
        console.error('或設定 POSTMAN_COLLECTION_ID 環境變數');
        process.exit(1);
    }

    backupCollection(collectionId)
        .then(() => {
            console.log('\n備份完成!');
        })
        .catch(err => {
            console.error('備份失敗:', err.message);
            process.exit(1);
        });
}

module.exports = { backupCollection };
