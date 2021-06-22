import { parentPort } from "worker_threads";
import FaceDetection from "../ML/faceDetection";
import sharp from "sharp";
import { AsyncWorker, queue, QueueObject } from "async";
import * as _ from "lodash";
import * as Comlink from "comlink";
import nodeEndpoint from "comlink/dist/esm/node-adapter";

export interface FaceWorkerData {
  filePath: string;
}

let face: FaceDetection;
let cargoQ: QueueObject<FaceWorkerData>;

const worker: AsyncWorker<FaceWorkerData> = async (
  task: FaceWorkerData
): Promise<Buffer[] | null> => {
  try {
    const sharpImage = sharp(task.filePath);
    const faces = await face.getFacesAsImageBuffer(sharpImage);

    return faces as Buffer[];
  } catch (e) {
    console.error(e);
  }

  return null;
};

const init = async () => {
  face = new FaceDetection();
  await face.load();
  cargoQ = queue(worker);
};

const addTask = async (task: FaceWorkerData): Promise<Buffer[]> => {
  return new Promise((resolve, reject) => {
    cargoQ.push(task, (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve(data as Buffer[]);
    });
  });
};

const faceExtractionApi = {
  init,
  addTask,
};

export type FaceExtractionApiType = typeof faceExtractionApi;

Comlink.expose(faceExtractionApi, nodeEndpoint(parentPort as any));
