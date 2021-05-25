import async from "async";
import { Worker } from "worker_threads";
import path from "path";
import { mainWindow } from "../main";
import { v4 as uuid } from "uuid";

require("@babel/register");

export default class Manager {
  file_queue!: async.QueueObject<string>;

  faceDetectionWorker: Worker;

  faceEmbeddingsWorker: Worker;

  callbackMap = new Map<string, (e?: Error) => void>();

  sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  finish = (data: { error: Error; fileId: string; filePath: string }) => {
    const cb = this.callbackMap.get(data.fileId as string);
    if (data.error && cb) {
      cb(data.error);
    } else if (cb) {
      cb();
    }
    this.callbackMap.delete(data.fileId);
    mainWindow?.webContents.send("embeddings-tip-update", data.filePath);
  };

  async init(): Promise<void> {
    return new Promise((res, rej) => {
      this.file_queue = async.queue(this.processFile.bind(this), 1);
      this.file_queue.drain(this.drain.bind(this));

      let faceDetectionWorkerReady = false;
      let faceEmbeddingsWorkerReady = false;

      const checkResolve = () => {
        if (faceDetectionWorkerReady && faceEmbeddingsWorkerReady) {
          res();
        }
      };

      this.faceDetectionWorker = new Worker(
        path.resolve(__dirname, "worker.js"),
        {
          workerData: {
            path: path.resolve(__dirname, "faceExtraction.ts"),
          },
        }
      );

      this.faceEmbeddingsWorker = new Worker(
        path.resolve(__dirname, "worker.js"),
        {
          workerData: {
            path: path.resolve(__dirname, "faceEmeddings.ts"),
          },
        }
      );

      this.faceDetectionWorker.on("message", (data) => {
        if (data === "initiated") {
          faceDetectionWorkerReady = true;
          return checkResolve();
        }

        console.log(data);

        if (data.error) {
          this.finish(data);
        }

        if (data.faces.length) {
          this.faceEmbeddingsWorker.postMessage(data);
        } else {
          this.finish(data);
        }
      });

      this.faceEmbeddingsWorker.on("message", (data) => {
        if (data === "initiated") {
          faceEmbeddingsWorkerReady = true;
          return checkResolve();
        }

        console.log(data);
        this.finish(data);
      });
    });
  }

  async drain() {
    console.log("All files finished processing");
    this.faceDetectionWorker.terminate();
    this.faceEmbeddingsWorker.terminate();
    mainWindow?.webContents.send("embeddings-finished", {
      sessionId: this.sessionId,
    });
  }

  processFile(filePath: string, callback: (e?: Error) => void) {
    const fileId = uuid();
    this.callbackMap.set(fileId, callback);

    try {
      this.faceDetectionWorker.postMessage({ filePath, fileId });
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
