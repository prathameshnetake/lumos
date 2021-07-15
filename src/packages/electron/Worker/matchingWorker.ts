import sharp from "sharp";
import { SessionBlob } from "../DB/session";
import { findFacesByAnnoyIndex } from "../DB/face";
import FaceDetection from "../ML/faceDetection";
import FaceEmbeddings from "../ML/embedding-facenet";
import Annoy, { Metric } from "annoy-node";
import { parentPort } from "worker_threads";
import fs from "fs-extra";
import { v4 as uuid } from "uuid";
import * as Comlink from "comlink";
import nodeEndpoint from "comlink/dist/esm/node-adapter";
import { Knex } from "knex";
import { getKnexInstance } from "../DB/knex";

let knexInstance: Knex<any, unknown[]>;

export default class MatchingWorker {
  faceDetection!: FaceDetection;

  faceEmbeddings!: FaceEmbeddings;

  async getFacesFromImage(path: string) {
    const sharpImage = sharp(path);
    this.faceDetection = new FaceDetection();
    await this.faceDetection.load();
    return this.faceDetection.getFacesAsImageBuffer(sharpImage);
  }

  async getMatches(path: string, session: SessionBlob) {
    // get embeddings
    this.faceEmbeddings = new FaceEmbeddings();
    const buf = await sharp(path).toBuffer();
    await this.faceEmbeddings.load();
    const embeddings = await this.faceEmbeddings.predictBuffer(buf);
    this.faceEmbeddings.destruct();

    const annoy = new Annoy(128, Metric.EUCLIDEAN);
    annoy.load(session.indexFilePath);
    const { neighbours } = annoy.get_nns_by_vector(
      Float64Array.from(embeddings),
      20,
      true
    );
    annoy.unload();
    const matchIndexlist = [];
    for (let i = 0; i < neighbours.length; i++) {
      matchIndexlist[i] = Number(neighbours[i]);
    }

    const pathList = await findFacesByAnnoyIndex(
      knexInstance,
      session.sessionId,
      matchIndexlist
    );

    return pathList;
  }
}

const getFaces = async (
  filePath: string,
  tempLocation: string,
  appName: string
) => {
  const matchingWorker = new MatchingWorker();
  const faces = await matchingWorker.getFacesFromImage(filePath);
  const paths = [];
  await fs.ensureDir(`${tempLocation}/${appName}`);

  for (let i = 0; i < faces.length; i += 1) {
    const writePath = `${tempLocation}/${appName}/${uuid()}.jpg`;
    await sharp(faces[i]!).toFile(writePath);
    paths.push(writePath);
  }

  return paths;
};

const getMatches = async (path: string, session: SessionBlob) => {
  const matchingWorker = new MatchingWorker();
  return await matchingWorker.getMatches(path, session);
};

const init = (dbFilePath: string) => {
  knexInstance = getKnexInstance(dbFilePath);
};

const machingWorkerApi = {
  init,
  getFaces,
  getMatches,
};

export type MatchingWorkerApiType = typeof machingWorkerApi;

Comlink.expose(machingWorkerApi, nodeEndpoint(parentPort as any));
