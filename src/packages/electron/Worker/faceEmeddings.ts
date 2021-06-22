import { parentPort } from "worker_threads";
import FaceEmbedding from "../ML/embedding-facenet";
import { AsyncWorker, queue, QueueObject } from "async";
import { WorkerData } from "./manager";
import * as _ from "lodash";
import * as Comlink from "comlink";
import nodeEndpoint from "comlink/dist/esm/node-adapter";

export interface EmbeddingsWorkerData {
  faces: Buffer[];
}

let faceEmbeddingML: FaceEmbedding;
let cargoQ: QueueObject<EmbeddingsWorkerData>;

const worker: AsyncWorker<EmbeddingsWorkerData> = async (
  task
): Promise<number[][] | null> => {
  try {
    const { faces } = task;
    const embeddingsArr: number[][] = [];
    for (let i = 0; i < faces!.length; i += 1) {
      const currentBuffer = faces![i];
      const faceEmbeddings = await faceEmbeddingML.predictBuffer(currentBuffer);
      embeddingsArr.push(faceEmbeddings);
    }
    return embeddingsArr;
  } catch (e) {
    console.log("ERR: In face embedding worker -> ", e);
    return null;
  }
};

const init = async () => {
  faceEmbeddingML = new FaceEmbedding();
  await faceEmbeddingML.load();
  cargoQ = queue(worker);
};

/**
 *
 * @param task accepts array of buffer ( faces )
 * @returns array of face encodings
 */
const addTask = async (task: EmbeddingsWorkerData): Promise<number[][]> => {
  return new Promise((resolve, reject) => {
    cargoQ.push(task, (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve(data as number[][]);
    });
  });
};

const faceEmbeddingApi = {
  init,
  addTask,
};

export type FaceEmbeddingApiType = typeof faceEmbeddingApi;

Comlink.expose(faceEmbeddingApi, nodeEndpoint(parentPort as any));
