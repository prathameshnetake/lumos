import { parentPort } from "worker_threads";
import FaceEmbedding from "../ML/embedding";
import { AsyncWorker, queue } from "async";
import { WorkerData } from "./manager";
import * as _ from "lodash";

export interface EmbeddingsWorkerData extends WorkerData {
  faceEmbedding: FaceEmbedding;
}

const worker: AsyncWorker<EmbeddingsWorkerData> = async (
  task
): Promise<void> => {
  try {
    const { faces, faceEmbedding } = task;
    for (let i = 0; i < faces!.length; i += 1) {
      const currentBuffer = faces![i];
      const faceEmbeddings = await faceEmbedding.predictBuffer(currentBuffer);

      const replyData: WorkerData = {
        ..._.omit(task, ["faceEmbedding", "faces"]), // faces are processed no need to forward
        faceEmbeddings,
      };
      parentPort?.postMessage(replyData);
    }
  } catch (e) {
    const errReply: WorkerData = { ...task, error: new Error(e) };
    parentPort?.postMessage(errReply);
  }
};

const init = async () => {
  const faceEmbedding = new FaceEmbedding();
  await faceEmbedding.load();
  const cargoQ = queue(worker);
  parentPort?.postMessage({ initiated: "initiated" });
  return { faceEmbedding, cargoQ };
};

init().then(({ faceEmbedding, cargoQ }) => {
  parentPort?.on("message", async (task: WorkerData) => {
    cargoQ.push({ ...task, faceEmbedding });
  });
});
