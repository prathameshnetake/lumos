import { parentPort } from "worker_threads";
import FaceDetection from "../ML/faceDetection";
import sharp from "sharp";

const init = async () => {
  const face = new FaceDetection();
  await face.load();
  return face;
};

init().then((face) => {
  parentPort?.on("message", async (filePath) => {
    const image = sharp(filePath);
    await face.getFacesAsImageBuffer(image);

    parentPort?.postMessage(filePath);
  });
});
