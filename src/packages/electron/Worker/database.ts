import { parentPort } from "worker_threads";
import { AsyncWorker, queue, QueueObject } from "async";
import { createFaceIfNotExists, FaceBlob, insertFaceItem } from "../DB/face";
import {
  createSessionIfNotExists,
  inserSessiontItem,
  SessionBlob,
} from "../DB/session";
import * as _ from "lodash";
import * as Comlink from "comlink";
import nodeEndpoint from "comlink/dist/esm/node-adapter";
import { Knex } from "knex";
import { getKnexInstance } from "../DB/knex";

export interface DatabaseWorkerData {
  fileId: string;
  filePath: string;
  sessionId: string;
  annoyItemIndex: number;
}

let cargoQ: QueueObject<DatabaseWorkerData>;
let knexInstance: Knex<any, unknown[]>;

const worker: AsyncWorker<DatabaseWorkerData> = async (task): Promise<void> => {
  try {
    const { fileId, filePath, sessionId, annoyItemIndex } = task;
    const faceBlob: FaceBlob = {
      fileId,
      filePath,
      sessionId: sessionId,
      annoyItemIndex: annoyItemIndex!,
    };

    await insertFaceItem(knexInstance, faceBlob);
  } catch (e) {
    console.error(e);
  }
};

const init = async (dbFilePath: string) => {
  knexInstance = getKnexInstance(dbFilePath);

  try {
    cargoQ = queue(worker);
    await createFaceIfNotExists(knexInstance);
  } catch (e) {
    console.log(e);
  }
};

const addTask = async (data: DatabaseWorkerData): Promise<void> => {
  return new Promise((resolve, reject) => {
    cargoQ.push(data, (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
};

const saveSessionData = async (data: SessionBlob) => {
  try {
    await createSessionIfNotExists(knexInstance);
    await inserSessiontItem(knexInstance, data);
  } catch (e) {
    console.log("ERR: While saving session");
  }
};

const databaseApi = {
  init,
  addTask,
  saveSessionData,
};

export type DatabaseApiType = typeof databaseApi;

Comlink.expose(databaseApi, nodeEndpoint(parentPort as any));
