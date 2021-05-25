import { parentPort } from "worker_threads";
import FaceEmbedding from "../ML/embedding";
import { AsyncWorker, queue } from "async";

const worker: AsyncWorker<{
  faces: Buffer[];
  faceEmbedding: FaceEmbedding;
  fileId: string;
  filePath: string;
}> = async (task: {
  faces: Buffer[];
  faceEmbedding: FaceEmbedding;
  fileId: string;
  filePath: string;
}): Promise<void> => {
  try {
    const { fileId, filePath, faces, faceEmbedding } = task;
    for (let i = 0; i < faces.length; i += 1) {
      const currentBuffer = faces[i];
      const embeddings = await faceEmbedding.predictBuffer(currentBuffer);
      console.log(embeddings);
    }
    parentPort?.postMessage({ error: null, fileId, filePath });
  } catch (e) {}
};

const init = async () => {
  const faceEmbedding = new FaceEmbedding();
  await faceEmbedding.load();
  const cargoQ = queue(worker);
  parentPort?.postMessage("initiated");
  return { faceEmbedding, cargoQ };
};

init().then(({ faceEmbedding, cargoQ }) => {
  parentPort?.on("message", async ({ faces, fileId, filePath }) => {
    cargoQ.push({
      faces,
      faceEmbedding,
      fileId,
      filePath,
    });
  });
});
