const _ = require('lodash');

function mergeCollections(originalCollection, newCollection) {
    console.log('正在分析集合差異...');

    // 標準化集合格式(處理有或無 'collection' 包裝的情況)
    const normalizedOriginal = normalizeCollection(originalCollection);
    const normalizedNew = normalizeCollection(newCollection);

    const merged = _.cloneDeep(normalizedNew);

    // 建立請求映射(以路徑和方法為鍵)
    const originalRequests = createRequestMap(normalizedOriginal);
    const newRequests = createRequestMap(normalizedNew);

    // 追蹤變更
    const changes = {
        added: [],
        modified: [],
        removed: [],
        preserved: []
    };

    // 處理每個新請求
    traverseItems(merged.collection.item, (newItem, parent, index) => {
        if (!newItem.request) return; // 略過資料夾

        const key = getRequestKey(newItem);
        const originalItem = originalRequests.get(key);

        if (originalItem) {
            // 請求存在:保留測試和指令碼
            preserveCustomizations(newItem, originalItem);
            changes.modified.push(key);
        } else {
            // 新請求
            changes.added.push(key);
        }
    });

    // 識別已移除的端點
    originalRequests.forEach((item, key) => {
        if (!newRequests.has(key)) {
            changes.removed.push(key);
        }
    });

    // 保留集合層級的設定
    if (normalizedOriginal.collection.auth) {
        merged.collection.auth = normalizedOriginal.collection.auth;
        console.log('✓ 保留驗證設定');
    }

    if (normalizedOriginal.collection.variable) {
        merged.collection.variable = mergeVariables(
            normalizedOriginal.collection.variable,
            normalizedNew.collection.variable
        );
        console.log('✓ 合併集合變數');
    }

    // 保留原始集合的 info
    if (normalizedOriginal.collection.info) {
        merged.collection.info = {
            ...normalizedNew.collection.info,
            ...normalizedOriginal.collection.info,
            // 保持原始的 ID 和名稱
            _postman_id: normalizedOriginal.collection.info._postman_id,
            name: normalizedOriginal.collection.info.name,
            uid: normalizedOriginal.collection.info.uid
        };
        console.log('✓ 保留集合資訊');
    }

    console.log(`\n變更統計:`);
    console.log(`  新增: ${changes.added.length} 個端點`);
    console.log(`  修改: ${changes.modified.length} 個端點`);
    console.log(`  移除: ${changes.removed.length} 個端點`);

    return { merged, changes };
}

function normalizeCollection(collection) {
    // 如果已經有 'collection' 包裝,直接返回
    if (collection.collection) {
        return collection;
    }

    // 如果沒有 'collection' 包裝,建立標準格式
    return {
        collection: {
            info: collection.info || { name: 'Collection', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
            item: collection.item || [],
            variable: collection.variable,
            auth: collection.auth
        }
    };
}

function createRequestMap(collection) {
    const map = new Map();
    traverseItems(collection.collection.item, (item) => {
        if (item.request) {
            map.set(getRequestKey(item), item);
        }
    });
    return map;
}

function getRequestKey(item) {
    let path = '';

    if (typeof item.request.url === 'string') {
        // 字串格式的 URL
        path = item.request.url;
    } else if (item.request.url.raw) {
        // 有 raw 屬性
        path = item.request.url.raw;
    } else if (item.request.url.path) {
        // 有 path 陣列
        path = '/' + item.request.url.path.join('/');
    }

    // 移除 baseUrl、domain 和 query string
    path = path.replace(/^https?:\/\/[^\/]+/, '')
        .replace(/\{\{baseUrl\}\}/, '')
        .split('?')[0];

    return `${item.request.method}:${path}`;
}

function preserveCustomizations(newItem, originalItem) {
    let preserved = [];

    // 保留測試指令碼(event.listen = "test")
    if (originalItem.event) {
        const tests = originalItem.event.filter(e => e.listen === 'test');
        const prerequest = originalItem.event.filter(e => e.listen === 'prerequest');

        if (!newItem.event) newItem.event = [];

        // 移除新集合中的預設測試
        newItem.event = newItem.event.filter(
            e => e.listen !== 'test' && e.listen !== 'prerequest'
        );

        // 加入原始測試和預請求指令碼
        if (tests.length > 0) {
            newItem.event.push(...tests);
            preserved.push('測試指令碼');
        }
        if (prerequest.length > 0) {
            newItem.event.push(...prerequest);
            preserved.push('預請求指令碼');
        }
    }

    // 保留請求 body
    if (originalItem.request.body && Object.keys(originalItem.request.body).length > 0) {
        newItem.request.body = originalItem.request.body;
        preserved.push('請求 Body');
    }

    // 保留所有標頭(不只是自訂標頭)
    if (originalItem.request.header && originalItem.request.header.length > 0) {
        // 合併標頭:保留原始的,加入新的(如果不存在)
        const originalHeaderKeys = new Set(
            originalItem.request.header.map(h => h.key.toLowerCase())
        );

        // 保留原始標頭
        newItem.request.header = [...originalItem.request.header];

        // 加入新標頭(如果原始中不存在)
        if (newItem.request.header) {
            const newHeaders = newItem.request.header || [];
            newHeaders.forEach(h => {
                if (!originalHeaderKeys.has(h.key.toLowerCase())) {
                    newItem.request.header.push(h);
                }
            });
        }

        preserved.push('標頭');
    }

    // 保留查詢參數
    if (originalItem.request.url) {
        const originalQuery = typeof originalItem.request.url === 'string'
            ? null
            : originalItem.request.url.query;

        if (originalQuery && originalQuery.length > 0) {
            if (typeof newItem.request.url !== 'string') {
                newItem.request.url.query = originalQuery;
                preserved.push('查詢參數');
            }
        }
    }

    // 保留認證設定
    if (originalItem.request.auth) {
        newItem.request.auth = originalItem.request.auth;
        preserved.push('認證');
    }

    // 保留描述
    if (originalItem.request.description) {
        newItem.request.description = originalItem.request.description;
        preserved.push('描述');
    }

    // 保留項目層級的變數
    if (originalItem.variable && originalItem.variable.length > 0) {
        newItem.variable = originalItem.variable;
        preserved.push('變數');
    }

    if (preserved.length > 0) {
        console.log(`  ✓ ${getRequestKey(newItem)}: 保留 ${preserved.join(', ')}`);
    }
}

function traverseItems(items, callback, parent = null) {
    if (!items) return;
    items.forEach((item, index) => {
        callback(item, parent, index);
        if (item.item) {
            traverseItems(item.item, callback, item);
        }
    });
}

function mergeVariables(originalVars, newVars) {
    const merged = [...(newVars || [])];
    const newVarKeys = new Set(merged.map(v => v.key));

    // 加入不在新集合中的原始變數
    (originalVars || []).forEach(v => {
        if (!newVarKeys.has(v.key)) {
            merged.push(v);
        }
    });

    return merged;
}

// CLI 執行
if (require.main === module) {
    const fs = require('fs').promises;

    const originalPath = process.argv[2];
    const newPath = process.argv[3];
    const outputPath = process.argv[4] || './temp/merged-collection.json';

    if (!originalPath || !newPath) {
        console.error('使用方式: node merge-collections.js <original-collection> <new-collection> [output-path]');
        console.error('');
        console.error('範例:');
        console.error('  node merge-collections.js ./backups/collection-backup.json ./temp/converted-collection.json');
        console.error('  node merge-collections.js ./backups/collection-backup.json ./temp/converted-collection.json ./output/merged.json');
        process.exit(1);
    }

    (async () => {
        try {
            console.log('📂 讀取集合檔案...\n');

            const originalData = JSON.parse(await fs.readFile(originalPath, 'utf8'));
            const newData = JSON.parse(await fs.readFile(newPath, 'utf8'));

            console.log('🔀 開始合併集合...\n');
            const { merged, changes } = mergeCollections(originalData, newData);

            // 確保輸出目錄存在
            const path = require('path');
            await fs.mkdir(path.dirname(outputPath), { recursive: true });

            // 儲存合併結果
            await fs.writeFile(outputPath, JSON.stringify(merged, null, 2));

            console.log(`\n✓ 合併完成!`);
            console.log(`  儲存於: ${outputPath}`);

            // 顯示詳細變更
            if (changes.added.length > 0) {
                console.log('\n新增的端點:');
                changes.added.forEach(e => console.log(`  + ${e}`));
            }

            if (changes.removed.length > 0) {
                console.log('\n移除的端點:');
                changes.removed.forEach(e => console.log(`  - ${e}`));
            }

        } catch (err) {
            console.error('合併失敗:', err.message);
            process.exit(1);
        }
    })();
}

module.exports = { mergeCollections };
