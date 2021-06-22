const path = require("path");
const { workerData } = require("worker_threads");
console.log(workerData);

require("ts-node").register();
require(path.resolve(__dirname, workerData.path));
