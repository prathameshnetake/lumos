import { parentPort } from "worker_threads";
import FaceDetection from "../ML/faceDetection";
import sharp from "sharp";
import { AsyncWorker, queue } from "async";
import { WorkerData } from "./manager";
import * as _ from "lodash";

export interface FaceWorkerData extends WorkerData {
  face: FaceDetection;
}

const worker: AsyncWorker<FaceWorkerData> = async (
  task: FaceWorkerData
): Promise<void> => {
  try {
    const sharpImage = sharp(task.filePath);
    const faces = await task.face.getFacesAsImageBuffer(sharpImage);

    const replyData: WorkerData = {
      ..._.omit(task, ["face"]),
      faces: faces as Buffer[],
    };

    parentPort?.postMessage(replyData);
  } catch (e) {
    const errReply: WorkerData = { ...task, error: new Error(e) };
    parentPort?.postMessage(errReply);
  }
};

const init = async () => {
  const face = new FaceDetection();
  await face.load();
  const cargoQ = queue(worker);
  parentPort?.postMessage({ initiated: "initiated" });
  return { face, cargoQ };
};

init().then(({ face, cargoQ }) => {
  parentPort?.on("message", async (task: WorkerData) => {
    cargoQ.push({ ...task, face });
  });
});
