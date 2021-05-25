import { parentPort } from "worker_threads";
import FaceDetection from "../ML/faceDetection";
import sharp from "sharp";
import { AsyncWorker, queue } from "async";

const worker: AsyncWorker<{
  filePath: string;
  face: FaceDetection;
  fileId: string;
}> = async (task: {
  filePath: string;
  face: FaceDetection;
  fileId: string;
}): Promise<void> => {
  try {
    const sharpImage = sharp(task.filePath);
    const faces = await task.face.getFacesAsImageBuffer(sharpImage);

    parentPort?.postMessage({
      error: null,
      filePath: task.filePath,
      fileId: task.fileId,
      faces,
    });
  } catch (e) {
    parentPort?.postMessage({
      error: e,
      filePath: task.filePath,
      fileId: task.fileId,
    });
  }
};

const init = async () => {
  const face = new FaceDetection();
  await face.load();
  const cargoQ = queue(worker);
  parentPort?.postMessage("initiated");
  return { face, cargoQ };
};

init().then(({ face, cargoQ }) => {
  parentPort?.on("message", async ({ filePath, fileId }) => {
    cargoQ.push({
      filePath,
      face,
      fileId,
    });
  });
});
