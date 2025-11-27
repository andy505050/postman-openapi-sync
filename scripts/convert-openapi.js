const Converter = require('openapi-to-postmanv2');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const https = require('https');

async function convertOpenApiToPostman(openapiPath, options = {}) {
    console.log(`正在讀取 OpenAPI 規格: ${openapiPath}...`);

    let openapiSpec;

    // 判斷是 URL 還是本地檔案
    if (openapiPath.startsWith('http://') || openapiPath.startsWith('https://')) {
        // 從網址下載
        console.log('從網址下載 OpenAPI 規格...');

        // 讀取環境變數,判斷是否驗證 SSL 憑證
        const rejectUnauthorized = process.env.REJECT_UNAUTHORIZED !== 'false';

        // 建立 axios 實例
        const axiosInstance = axios.create({
            httpsAgent: new https.Agent({
                rejectUnauthorized: rejectUnauthorized
            })
        });

        if (!rejectUnauthorized) {
            console.log('⚠️  已停用 SSL 憑證驗證 (允許自簽憑證)');
        }

        const response = await axiosInstance.get(openapiPath);
        openapiSpec = response.data;
    } else {
        // 從本地檔案讀取
        const openapiContent = await fs.readFile(openapiPath, 'utf8');

        // 判斷是 JSON 還是 YAML
        if (openapiPath.endsWith('.yaml') || openapiPath.endsWith('.yml')) {
            const yaml = require('js-yaml');
            openapiSpec = yaml.load(openapiContent);
        } else {
            openapiSpec = JSON.parse(openapiContent);
        }
    }

    console.log('正在轉換為 Postman 集合格式...');

    // 設定轉換選項
    const convertOptions = {
        requestNameSource: 'Fallback', // 使用 summary/operationId 作為請求名稱
        folderStrategy: 'Paths', // 按路徑分組
        includeAuthInfoInExample: true,
        enableOptionalParameters: true,
        keepImplicitHeaders: true,
        ...options
    };

    return new Promise((resolve, reject) => {
        Converter.convert(
            { type: 'json', data: openapiSpec },
            convertOptions,
            async (err, conversionResult) => {
                if (err || !conversionResult.result) {
                    reject(err || new Error('轉換失敗'));
                    return;
                }

                // 儲存轉換後的集合
                const outputPath = path.join(__dirname, '../temp/converted-collection.json');
                await fs.mkdir(path.dirname(outputPath), { recursive: true });
                await fs.writeFile(
                    outputPath,
                    JSON.stringify(conversionResult.output[0].data, null, 2)
                );

                console.log('✓ OpenAPI 規格已轉換為 Postman 集合');
                console.log(`  儲存於: ${outputPath}`);
                resolve(conversionResult.output[0].data);
            }
        );
    });
}

// CLI 執行
if (require.main === module) {
    require('dotenv').config();
    const openapiPath = process.argv[2] || process.env.OPENAPI_PATH;

    if (!openapiPath) {
        console.error('使用方式: node convert-openapi.js <openapi-path>');
        console.error('或設定 OPENAPI_PATH 環境變數');
        process.exit(1);
    }

    convertOpenApiToPostman(openapiPath)
        .then(() => {
            console.log('\n轉換完成!');
        })
        .catch(err => {
            console.error('轉換失敗:', err.message);
            process.exit(1);
        });
}

module.exports = { convertOpenApiToPostman };
