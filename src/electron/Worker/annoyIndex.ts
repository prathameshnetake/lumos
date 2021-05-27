import { parentPort } from "worker_threads";
import Annoy, { AnnoyIndex, Metric } from "annoy-node";
import { AsyncWorker, queue } from "async";
import { WorkerData } from "./manager";
import * as _ from "lodash";

export interface AnnoyIndexWorkerData extends WorkerData {
  annoy: AnnoyIndex;
  index: number;
}

let index = 0;

const worker: AsyncWorker<AnnoyIndexWorkerData> = async (
  task
): Promise<void> => {
  try {
    const { annoy, faceEmbeddings, index } = task;

    if (faceEmbeddings && faceEmbeddings.length) {
      annoy.addItem(index, Float64Array.from(faceEmbeddings!));
    }

    const replyData: WorkerData = {
      ..._.omit(task, ["faceEmbeddings", "annoy"]),
      annoyItemIndex: index,
    };

    parentPort?.postMessage(replyData);
  } catch (e) {}
};

const init = async () => {
  const annoy = new Annoy(256, Metric.ANGULAR);
  const cargoQ = queue(worker);
  parentPort?.postMessage({ initiated: "initiated" });
  return { annoy, cargoQ };
};

init().then(({ annoy, cargoQ }) => {
  parentPort?.on("message", async (task: WorkerData) => {
    if (task.misc?.action === "finish") {
      // build tree
      const { path } = task.misc.data;
      annoy.build(10);
      annoy.save(path);

      console.log(path);
      const finishData: WorkerData = {
        ..._.omit(task, ["faceEmbeddings"]),
        misc: { action: "build_and_saved" },
      };
      parentPort?.postMessage(finishData);
    }

    const annoyIndexTask: AnnoyIndexWorkerData = { ...task, annoy, index };
    index += 1;
    cargoQ.push(annoyIndexTask);
  });
});
