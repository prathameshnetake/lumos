import { contextBridge } from "electron";
import { getKnexInstance } from "../electron/DB/knex";
import { getAllSessions } from "../electron/DB/session";
import { readFileSync } from "fs-extra";

export const databaseBridgeInit = () => {
  contextBridge.exposeInMainWorld("db", {
    getAllSessions: async () => {
      let knexInstance = getKnexInstance(
        readFileSync(`${__dirname}/../dist_main/DB_FILE_PATH`).toString()
      );
      return await getAllSessions(knexInstance);
    },
  });
};
