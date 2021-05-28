import { parentPort } from "worker_threads";
import { AsyncWorker, queue } from "async";
import { WorkerData } from "./manager";
import { createFaceIfNotExists, FaceBlob, insertFaceItem } from "../DB/face";
import { createSessionIfNotExists, inserSessiontItem } from "../DB/session";
import * as _ from "lodash";

const worker: AsyncWorker<WorkerData> = async (task): Promise<void> => {
  try {
    const { fileId, filePath, sessionId, annoyItemIndex } = task;
    const faceBlob: FaceBlob = {
      fileId,
      filePath,
      sessionId: sessionId,
      annoyItemIndex: annoyItemIndex!,
    };

    await insertFaceItem(faceBlob);
    const replyData: WorkerData = { ..._.omit(task, ["annoyItemIndex"]) };

    parentPort?.postMessage(replyData);
  } catch (e) {}
};

const init = async () => {
  const cargoQ = queue(worker);

  // ensure all tables are exists
  try {
    await createFaceIfNotExists();
    parentPort?.postMessage({ initiated: "initiated" });
  } catch (e) {
    // pending worker init failure initialization
  }
  return { cargoQ };
};

init().then(({ cargoQ }) => {
  parentPort?.on("message", async (task: WorkerData) => {
    if (task.misc?.action === "finish-session") {
      try {
        if (await createSessionIfNotExists()) {
          await inserSessiontItem(task.misc.data);
        }

        const finishData: WorkerData = {
          ..._.omit(task),
          misc: { action: "session_saved" },
        };
        parentPort?.postMessage(finishData);
      } catch (e) {
        console.log(e);
      }
    }
    const databaseTask: WorkerData = { ...task };
    cargoQ.push(databaseTask);
  });
});
