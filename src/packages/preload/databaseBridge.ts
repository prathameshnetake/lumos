import { contextBridge } from "electron";
import { getKnexInstance } from "../electron/DB/knex";
import { getSync } from "electron-settings";
import { getAllSessions } from "../electron/DB/session";

export const databaseBridgeInit = () => {
  console.log(getSync("dbFilePath"));
  let knexInstance = getKnexInstance(getSync("dbFilePath") as string);
  contextBridge.exposeInMainWorld("db", {
    getAllSessions: async () => {
      return await getAllSessions(knexInstance);
    },
  });
};
