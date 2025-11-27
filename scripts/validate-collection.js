const newman = require('newman');

async function validateCollection(collectionPath, environmentPath) {
    console.log('🧪 開始驗證集合...\n');

    return new Promise((resolve, reject) => {
        newman.run({
            collection: collectionPath,
            environment: environmentPath,
            reporters: ['cli', 'json'],
            reporter: {
                json: {
                    export: './reports/validation-report.json'
                }
            }
        }, (err, summary) => {
            if (err) {
                reject(err);
                return;
            }

            const stats = summary.run.stats;
            console.log('\n📊 驗證結果:');
            console.log(`  • 請求: ${stats.requests.total}`);
            console.log(`  • 測試: ${stats.tests.total}`);
            console.log(`  • 通過: ${stats.tests.passed}`);
            console.log(`  • 失敗: ${stats.tests.failed}`);
            console.log(`  • 斷言: ${stats.assertions.total}`);

            if (stats.tests.failed > 0) {
                console.log('\n⚠️ 有測試失敗,請檢查 reports/validation-report.json');
            } else {
                console.log('\n✓ 所有測試通過!');
            }

            resolve(summary);
        });
    });
}

// CLI 執行
if (require.main === module) {
    require('dotenv').config();
    const collectionPath = process.argv[2] || './temp/merged-collection.json';
    const environmentPath = process.argv[3];

    validateCollection(collectionPath, environmentPath)
        .then(() => {
            console.log('\n驗證完成!');
        })
        .catch(err => {
            console.error('驗證失敗:', err.message);
            process.exit(1);
        });
}

module.exports = { validateCollection };
