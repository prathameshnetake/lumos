import { parentPort } from "worker_threads";
import Annoy, { AnnoyIndex, Metric } from "annoy-node";
import { AsyncWorker, queue, QueueObject, reject } from "async";
import { WorkerData } from "./manager";
import * as _ from "lodash";
import * as Comlink from "comlink";
import nodeEndpoint from "comlink/dist/esm/node-adapter";

export interface AnnoyIndexWorkerData {
  faceEmbeddings: number[];
  index: number;
}

let cargoQ: QueueObject<AnnoyIndexWorkerData>;
let annoy: AnnoyIndex;

const worker: AsyncWorker<AnnoyIndexWorkerData> = async (
  task
): Promise<number | null> => {
  try {
    const { faceEmbeddings, index } = task;

    if (faceEmbeddings && faceEmbeddings.length) {
      annoy.addItem(index, Float64Array.from(faceEmbeddings!));
    }

    return index;
  } catch (e) {}
  return null;
};

const init = async () => {
  annoy = new Annoy(128, Metric.EUCLIDEAN);
  cargoQ = queue(worker);
};

const addTask = async (data: AnnoyIndexWorkerData): Promise<number> => {
  return new Promise((resolve, reject) => {
    cargoQ.push(data, (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve(data as number);
    });
  });
};

const finish = (path: string, nTrees = 10) => {
  annoy.build(nTrees);
  annoy.save(path);
};

const annoyApi = {
  init,
  addTask,
  finish,
};

export type AnnoyApiType = typeof annoyApi;

Comlink.expose(annoyApi, nodeEndpoint(parentPort as any));
