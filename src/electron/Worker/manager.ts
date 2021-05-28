import async from "async";
import { app } from "electron";
import { Worker } from "worker_threads";
import path from "path";
import { mainWindow } from "../main";
import { v4 as uuid } from "uuid";
import {
  createSessionIfNotExists,
  SessionBlob,
  inserSessiontItem,
} from "../DB/session";

require("@babel/register");

export interface WorkerData {
  fileId: string;
  filePath: string;
  sessionId: string;
  error?: Error;
  faceEmbeddings?: number[];
  faces?: Buffer[];
  annoyItemIndex?: number;
  initiated?: string;
  databaseId?: string;
  misc?: { action: string; data?: any };
}

export default class Manager {
  file_queue!: async.QueueObject<string>;

  faceDetectionWorker: Worker;

  faceEmbeddingsWorker: Worker;

  annoyIndexWorkder: Worker;

  databaseWorker: Worker;

  callbackMap = new Map<string, (e?: Error) => void>();

  sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  finish = (data: WorkerData) => {
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
      let annoyIndexWorkerReady = false;
      let databaseWorkerReady = false;

      const checkResolve = () => {
        if (
          faceDetectionWorkerReady &&
          faceEmbeddingsWorkerReady &&
          annoyIndexWorkerReady &&
          databaseWorkerReady
        ) {
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

      this.annoyIndexWorkder = new Worker(
        path.resolve(__dirname, "worker.js"),
        {
          workerData: {
            path: path.resolve(__dirname, "annoyIndex.ts"),
          },
        }
      );

      this.databaseWorker = new Worker(path.resolve(__dirname, "worker.js"), {
        workerData: {
          path: path.resolve(__dirname, "database.ts"),
        },
      });

      this.faceDetectionWorker.on("message", (data: WorkerData) => {
        if (data.initiated === "initiated") {
          faceDetectionWorkerReady = true;
          return checkResolve();
        }

        if (data.error) {
          this.finish(data);
        }

        if (data.faces?.length) {
          this.faceEmbeddingsWorker.postMessage(data);
        } else {
          this.finish(data);
        }
      });

      this.faceEmbeddingsWorker.on("message", (data: WorkerData) => {
        if (data.initiated === "initiated") {
          faceEmbeddingsWorkerReady = true;
          return checkResolve();
        }

        this.annoyIndexWorkder.postMessage(data);
      });

      this.annoyIndexWorkder.on("message", (data: WorkerData) => {
        if (data.initiated === "initiated") {
          annoyIndexWorkerReady = true;
          return checkResolve();
        }

        if (data.misc?.action === "build_and_saved") {
          this.annoyIndexWorkder.terminate();
          return;
        }

        this.databaseWorker.postMessage(data);
      });

      this.databaseWorker.on("message", (data: WorkerData) => {
        if (data.initiated === "initiated") {
          databaseWorkerReady = true;
          return checkResolve();
        }

        if (data.misc?.action === "session_saved") {
          this.databaseWorker.terminate();
          return;
        }

        console.log(data);
        this.finish(data);
      });
    });
  }

  async drain() {
    console.log("All files finished processing");
    const annoyIndexPath = `${app.getPath("userData")}/${this.sessionId}.ann`;

    const sessionData: SessionBlob = {
      indexFilePath: annoyIndexPath,
      sessionId: this.sessionId,
    };

    console.log(sessionData);
    const dbFinishData = {
      misc: {
        action: "finish-session",
        data: sessionData,
      },
    };
    this.databaseWorker.postMessage(dbFinishData);

    // build and save annoy index file
    const annFinishData = {
      misc: {
        action: "finish",
        data: {
          path: annoyIndexPath,
        },
      },
    };
    this.annoyIndexWorkder.postMessage(annFinishData);

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
      const faceTask: WorkerData = {
        filePath,
        fileId,
        sessionId: this.sessionId,
      };
      this.faceDetectionWorker.postMessage(faceTask);
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
