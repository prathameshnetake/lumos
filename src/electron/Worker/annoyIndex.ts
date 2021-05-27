import { parentPort } from "worker_threads";
import AnnoyIndex, { Metric } from "annoy-node";
import { AsyncWorker, queue } from "async";
import { WorkerData } from "./manager";

export interface AnnoyIndexWorkerData extends WorkerData {
  annoy: any;
}

const worker: AsyncWorker<AnnoyIndexWorkerData> = async (
  task
): Promise<void> => {
  try {
    console.log(task);
  } catch (e) {}
};

const init = async () => {
  const annoy = new AnnoyIndex(256, Metric.ANGULAR);
  const cargoQ = queue(worker);
  parentPort?.postMessage({ initiated: "initiated" });
  return { annoy, cargoQ };
};

init().then(({ annoy, cargoQ }) => {
  parentPort?.on("message", async (task: WorkerData) => {
    const annoyIndexTask: AnnoyIndexWorkerData = { ...task, annoy };
    cargoQ.push(annoyIndexTask);
  });
});
