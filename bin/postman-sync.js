#!/usr/bin/env node

const { Command } = require('commander');
const { syncCollection } = require('../scripts/sync-collection');
const { backupCollection } = require('../scripts/backup-collection');
const { validateCollection } = require('../scripts/validate-collection');
const { convertOpenApiToPostman } = require('../scripts/convert-openapi');
const { mergeCollections } = require('../scripts/merge-collections');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const program = new Command();

program
    .name('postman-sync')
    .description('Postman 集合與 OpenAPI 規格同步工具')
    .version('1.0.0');

// Sync 命令
program
    .command('sync')
    .description('同步 OpenAPI 規格到 Postman 集合')
    .option('-o, --openapi <path>', 'OpenAPI 規格檔案路徑')
    .option('-c, --collection <id>', 'Postman Collection ID')
    .option('-k, --api-key <key>', 'Postman API Key')
    .action(async (options) => {
        try {
            const openapiPath = options.openapi || process.env.OPENAPI_PATH;
            const collectionId = options.collection || process.env.POSTMAN_COLLECTION_ID;
            const apiKey = options.apiKey || process.env.POSTMAN_API_KEY;

            if (!openapiPath) {
                console.error('❌ 錯誤: 請提供 OpenAPI 規格檔案路徑 (--openapi 或設定 OPENAPI_PATH 環境變數)');
                process.exit(1);
            }

            if (!collectionId) {
                console.error('❌ 錯誤: 請提供 Collection ID (--collection 或設定 POSTMAN_COLLECTION_ID 環境變數)');
                process.exit(1);
            }

            if (!apiKey) {
                console.error('❌ 錯誤: 請提供 API Key (--api-key 或設定 POSTMAN_API_KEY 環境變數)');
                process.exit(1);
            }

            // 暫時設定環境變數
            if (apiKey) process.env.POSTMAN_API_KEY = apiKey;

            await syncCollection(openapiPath, collectionId);
        } catch (error) {
            console.error('❌ 同步失敗:', error.message);
            process.exit(1);
        }
    });

// Backup 命令
program
    .command('backup')
    .description('備份 Postman 集合')
    .option('-c, --collection <id>', 'Postman Collection ID')
    .option('-k, --api-key <key>', 'Postman API Key')
    .action(async (options) => {
        try {
            const collectionId = options.collection || process.env.POSTMAN_COLLECTION_ID;
            const apiKey = options.apiKey || process.env.POSTMAN_API_KEY;

            if (!collectionId) {
                console.error('❌ 錯誤: 請提供 Collection ID (--collection 或設定 POSTMAN_COLLECTION_ID 環境變數)');
                process.exit(1);
            }

            if (!apiKey) {
                console.error('❌ 錯誤: 請提供 API Key (--api-key 或設定 POSTMAN_API_KEY 環境變數)');
                process.exit(1);
            }

            if (apiKey) process.env.POSTMAN_API_KEY = apiKey;

            await backupCollection(collectionId);
            console.log('\n✅ 備份完成!');
        } catch (error) {
            console.error('❌ 備份失敗:', error.message);
            process.exit(1);
        }
    });

// Convert 命令
program
    .command('convert')
    .description('轉換 OpenAPI 規格為 Postman Collection')
    .option('-o, --openapi <path>', 'OpenAPI 規格檔案路徑')
    .option('-d, --output <path>', '輸出檔案路徑', './temp/converted-collection.json')
    .action(async (options) => {
        try {
            const openapiPath = options.openapi || process.env.OPENAPI_PATH;

            if (!openapiPath) {
                console.error('❌ 錯誤: 請提供 OpenAPI 規格檔案路徑 (--openapi 或設定 OPENAPI_PATH 環境變數)');
                process.exit(1);
            }

            console.log('🔄 正在轉換 OpenAPI 規格...');
            const collection = await convertOpenApiToPostman(openapiPath);

            // 確保輸出目錄存在
            const outputDir = path.dirname(options.output);
            await fs.mkdir(outputDir, { recursive: true });

            await fs.writeFile(options.output, JSON.stringify(collection, null, 2));
            console.log(`✅ 轉換完成! 檔案已儲存至: ${options.output}`);
        } catch (error) {
            console.error('❌ 轉換失敗:', error.message);
            process.exit(1);
        }
    });

// Validate 命令
program
    .command('validate')
    .description('驗證 Postman 集合')
    .option('-c, --collection <path>', '集合檔案路徑', './temp/merged-collection.json')
    .option('-e, --environment <path>', '環境檔案路徑')
    .action(async (options) => {
        try {
            await validateCollection(options.collection, options.environment);
            console.log('\n✅ 驗證完成!');
        } catch (error) {
            console.error('❌ 驗證失敗:', error.message);
            process.exit(1);
        }
    });

// Merge 命令
program
    .command('merge')
    .description('合併兩個 Postman 集合')
    .option('-o, --original <path>', '原始集合檔案路徑')
    .option('-n, --new <path>', '新集合檔案路徑')
    .option('-d, --output <path>', '輸出檔案路徑', './temp/merged-collection.json')
    .action(async (options) => {
        try {
            if (!options.original || !options.new) {
                console.error('❌ 錯誤: 請提供原始集合和新集合的檔案路徑');
                process.exit(1);
            }

            console.log('🔀 正在合併集合...');
            const originalData = await fs.readFile(options.original, 'utf-8');
            const newData = await fs.readFile(options.new, 'utf-8');

            const original = JSON.parse(originalData);
            const newCollection = JSON.parse(newData);

            const { merged, changes } = mergeCollections(original, newCollection);

            // 確保輸出目錄存在
            const outputDir = path.dirname(options.output);
            await fs.mkdir(outputDir, { recursive: true });

            await fs.writeFile(options.output, JSON.stringify(merged, null, 2));

            console.log('✅ 合併完成!');
            console.log(`  • 新增: ${changes.added.length} 個端點`);
            console.log(`  • 修改: ${changes.modified.length} 個端點`);
            console.log(`  • 移除: ${changes.removed.length} 個端點`);
            console.log(`  • 檔案已儲存至: ${options.output}`);
        } catch (error) {
            console.error('❌ 合併失敗:', error.message);
            process.exit(1);
        }
    });

program.parse();
