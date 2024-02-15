require('ts-node').register();
const path = require('path');

// Adjust the path to your TypeScript worker file
const workerTSFilePath = path.join(__dirname, './StockFishWorker.ts');
require(workerTSFilePath);
