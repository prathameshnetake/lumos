import async from "async";
import { app } from "electron";
import { Worker as NodeWorker } from "worker_threads";
import path from "path";
import { mainWindow } from "../main";
import { v4 as uuid } from "uuid";
import { SessionBlob } from "../DB/session";
import { Worker, spawn } from "threads";

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

  faceDetectionWorker: NodeWorker;

  faceEmbeddingsWorker: NodeWorker;

  annoyIndexWorkder: NodeWorker;

  databaseWorker: NodeWorker;

  callbackMap = new Map<string, (e?: Error) => void>();

  sessionId?: string;

  constructor(sessionId?: string) {
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

      this.faceDetectionWorker = new NodeWorker("./worker.js", {
        workerData: {
          path: path.join(
            getRootPath(),
            "src/electron/Worker/faceExtraction.ts"
          ),
        },
      });

      this.faceEmbeddingsWorker = new NodeWorker("./worker.js", {
        workerData: {
          path: path.join(
            getRootPath(),
            "src/electron/Worker/faceEmeddings.ts"
          ),
        },
      });

      this.annoyIndexWorkder = new NodeWorker("./worker.js", {
        workerData: {
          path: path.join(getRootPath(), "src/electron/Worker/annoyIndex.ts"),
        },
      });

      this.databaseWorker = new NodeWorker("./worker.js", {
        workerData: {
          path: path.join(getRootPath(), "src/electron/Worker/database.ts"),
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

        console.log(data);
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
      sessionId: this.sessionId!,
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
        sessionId: this.sessionId!,
      };
      this.faceDetectionWorker.postMessage(faceTask);
    } catch (e) {
      console.log("ERR: Processing file", filePath);
      console.log(e);
      callback(e);
    }
  }

  async getMatches(data: {
    facePath: string;
    session: SessionBlob;
  }): Promise<void> {
    const matchWorker = new NodeWorker(Manager.getWorkerPath(), {
      workerData: {
        path: path.join(getRootPath(), "src/electron/Worker/matchingWorker.ts"),
      },
    });

    const workerData = { ...data, action: "getMatches" };

    matchWorker.postMessage(workerData);
    matchWorker.once("message", (data) => {
      if (Array.isArray(data)) {
        mainWindow?.webContents.send("get-matches", data);
      }
      matchWorker.terminate();
    });
  }

  async getFaces(filePath: string): Promise<void> {
    // const matchWorker = new Worker(
    //   new URL("./worker.js", import.meta.url) as any,
    //   {
    //     workerData: {
    //       path: path.join(
    //         getRootPath(),
    //         "src/electron/Worker/matchingWorker.ts"
    //       ),
    //     },
    //   }
    // );

    // const workerData = {
    //   filePath,
    //   action: "getFaces",
    //   tempLocation: app.getPath("temp"),
    //   appName: app.getName(),
    // };

    // matchWorker.postMessage(workerData);
    // matchWorker.once("message", (data) => {
    //   if (Array.isArray(data)) {
    //     mainWindow?.webContents.send("get-faces", data);
    //   }
    //   matchWorker.terminate();
    // });

    const worker = await spawn(new Worker("./matchingWorker.ts"));
    const a = await worker.test("sdsdsd");
    console.log(a);
  }

  addFileToQueue(path: string): void {
    this.file_queue.push(path);
  }
}
