import { parentPort } from "worker_threads";
import FaceDetection from "../ML/faceDetection";
import sharp from "sharp";
import { AsyncWorker, queue } from "async";

const worker: AsyncWorker<{ filePath: string; face: FaceDetection }> = async (
  task: { filePath: string; face: FaceDetection },
  callback: (err?: Error) => void
) => {
  try {
    const sharpImage = sharp(task.filePath);
    const faces = await task.face.getFacesAsImageBuffer(sharpImage);
    console.log(faces);
    callback();
  } catch (e) {
    callback(e);
  }
};

const init = async () => {
  const face = new FaceDetection();
  await face.load();
  const cargoQ = queue(worker);
  return { face, cargoQ };
};

init().then(({ face, cargoQ }) => {
  parentPort?.on("message", async (filePath) => {
    cargoQ.push({
      filePath,
      face,
    });
  });
});
