import * as Comlink from "comlink";
import nodeEndpoint, { NodeEndpoint } from "comlink/dist/esm/node-adapter";
import { FaceExtractionApiType } from "./faceExtraction";
import FaceExtraction from "./faceExtraction?worker";
import { FaceEmbeddingApiType } from "./faceEmeddings";
import FaceEmbeddingWorker from "./faceEmeddings?worker";
import { AnnoyApiType } from "./annoyIndex";
import AnnoyIndexWorker from "./annoyIndex?worker";
import { DatabaseApiType } from "./database";
import DatabaseWorker from "./database?worker";
import async from "async";
import { mainWindow } from "../main";
import { SessionBlob } from "../DB/session";
import { app } from "electron";
import settings from "electron-settings";

export type IndexTask = {
  filePath: string;
  fileId: string;
};

export default class IndexingManager {
  file_queue!: async.QueueObject<IndexTask>;
  faceExtractionWorker!: Worker;
  faceEmbeddingWorker!: Worker;
  annoyIndexWorker!: Worker;
  databaseWorker!: Worker;

  faceExtractionApi!: FaceExtractionApiType;
  faceEmbeddingApi!: FaceEmbeddingApiType;
  annoyIndexApi!: AnnoyApiType;
  databaseApi!: DatabaseApiType;
  private index = 0;
  private sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  private createWorkerInstance() {
    this.faceExtractionWorker = new FaceExtraction();
    this.faceEmbeddingWorker = new FaceEmbeddingWorker();
    this.annoyIndexWorker = new AnnoyIndexWorker();
    this.databaseWorker = new DatabaseWorker();
  }

  private createComlinkApi() {
    this.faceExtractionApi = Comlink.wrap(
      nodeEndpoint(this.faceExtractionWorker as any)
    );
    this.faceEmbeddingApi = Comlink.wrap(
      nodeEndpoint(this.faceEmbeddingWorker as any)
    );
    this.annoyIndexApi = Comlink.wrap(
      nodeEndpoint(this.annoyIndexWorker as any)
    );
    this.databaseApi = Comlink.wrap(nodeEndpoint(this.databaseWorker as any));
  }

  private async initAllWorker() {
    await this.faceExtractionApi.init();
    await this.faceEmbeddingApi.init();
    await this.annoyIndexApi.init();
    await this.databaseApi.init(settings.getSync("dbFilePath") as string);
  }

  async init() {
    this.file_queue = async.queue(this.processFile.bind(this), 1);
    this.file_queue.drain(this.drain.bind(this));

    this.createWorkerInstance();
    this.createComlinkApi();
    await this.initAllWorker();

    console.log("All workers initiated");
  }

  private terminateAllWorkers() {
    this.faceExtractionWorker.terminate();
    this.faceEmbeddingWorker.terminate();
    this.annoyIndexWorker.terminate();
    this.databaseWorker.terminate();
  }

  addTask(task: IndexTask) {
    this.file_queue.push(task, (err, fileName) => {
      if (err) {
        return console.log(err);
      }

      // notify to renderer
      mainWindow?.webContents.send("embeddings-tip-update", fileName);
    });
  }

  private async processFile(data: IndexTask): Promise<string> {
    const faces = await this.faceExtractionApi.addTask({
      filePath: data.filePath,
    });
    if (faces.length) {
      const embeddings = await this.faceEmbeddingApi.addTask({ faces });
      for (let i = 0; i < embeddings.length; i++) {
        const annoyItemIndex = await this.annoyIndexApi.addTask({
          faceEmbeddings: embeddings[i],
          index: (this.index += 1),
        });
        await this.databaseApi.addTask({
          annoyItemIndex,
          fileId: data.fileId,
          filePath: data.filePath,
          sessionId: this.sessionId,
        });
      }
    }

    return data.filePath;
  }

  private async drain() {
    const annoyIndexPath = `${app.getPath("userData")}/${this.sessionId}.ann`;
    console.log(annoyIndexPath);

    const sessionData: SessionBlob = {
      indexFilePath: annoyIndexPath,
      sessionId: this.sessionId!,
    };
    this.annoyIndexApi.finish(annoyIndexPath, 10);
    await this.databaseApi.saveSessionData(sessionData);

    this.terminateAllWorkers();
    mainWindow?.webContents.send("embeddings-finished", {
      sessionId: this.sessionId,
    });
  }
}
