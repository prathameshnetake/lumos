import * as Comlink from "comlink";
import nodeEndpoint from "comlink/dist/esm/node-adapter";
import MachingWorker from "./matchingWorker?worker";
import { MatchingWorkerApiType } from "./matchingWorker";
import { app } from "electron";
import { SessionBlob } from "../DB/session";
import settings from "electron-settings";

export default class Manager {
  async getFaces(filePath: string): Promise<string[]> {
    const matchingWorker = new MachingWorker();
    const matchingWorkerApi: MatchingWorkerApiType = Comlink.wrap(
      nodeEndpoint(matchingWorker as any)
    );

    matchingWorkerApi.init(settings.getSync("dbFilePath") as string);
    const faces = await matchingWorkerApi.getFaces(
      filePath,
      app.getPath("temp"),
      app.getName()
    );

    return faces;
  }

  async getMatches(path: string, session: SessionBlob) {
    const matchingWorker = new MachingWorker();
    const matchingWorkerApi: MatchingWorkerApiType = Comlink.wrap(
      nodeEndpoint(matchingWorker as any)
    );

    matchingWorkerApi.init(settings.getSync("dbFilePath") as string);

    return await matchingWorkerApi.getMatches(path, session);
  }
}
