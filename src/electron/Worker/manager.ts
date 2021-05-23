import async from "async";
// import sharp from "sharp";
// import Face from "../ML/faceDetection";
import { Worker } from "worker_threads";
import path from "path";

require("@babel/register");

export default class Manager {
  file_queue!: async.QueueObject<string>;

  faceDetectionWorker: Worker;

  async init() {
    this.file_queue = async.queue(this.processFile.bind(this), 1);
    this.faceDetectionWorker = new Worker(
      path.resolve(__dirname, "worker.js"),
      {
        workerData: {
          path: path.resolve(__dirname, "faceExtraction.ts"),
        },
      }
    );

    this.faceDetectionWorker.on("message", (data) => {
      console.log(data);
    });
  }

  async processFile(filePath: string, callback: (e?: Error) => void) {
    try {
      this.faceDetectionWorker.postMessage(filePath);
      callback();
    } catch (e) {
      console.log("ERR: Processing file", filePath);
      console.log(e);
      callback(e);
    }
  }

  addFileToQueue(path: string) {
    this.file_queue.push(path);
  }
}
