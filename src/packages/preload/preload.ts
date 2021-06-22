import { contextBridge, ipcRenderer, app } from "electron";
import { pathToFileURL } from "url";
import { getKnexInstance } from "../electron/DB/knex";
import { getSync } from "electron-settings";
import { getAllSessions } from "../electron/DB/session";
import { readFileSync } from "fs-extra";

contextBridge.exposeInMainWorld("db", {
  getAllSessions: async () => {
    console.log(
      readFileSync(`${__dirname}/../dist_main/DB_FILE_PATH`).toString()
    );

    let knexInstance = getKnexInstance(
      readFileSync(`${__dirname}/../dist_main/DB_FILE_PATH`).toString()
    );
    return await getAllSessions(knexInstance);
  },
});

contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    send: (channel: string, data: any) => {
      // whitelist channels
      console.log(process.env.dbFilePath);

      ipcRenderer.send(channel, data);
    },
    on: (channel: string, func: any) => {
      ipcRenderer.on(channel, (event, data: any) => func(event, data));
    },
    off: (channel: string, func: any) => {
      ipcRenderer.off(channel, (event, data: any) => func(event, data));
    },
  },
});

contextBridge.exposeInMainWorld("url", {
  pathToFileURL: (path: string) => {
    return pathToFileURL(path).toString();
  },
});
