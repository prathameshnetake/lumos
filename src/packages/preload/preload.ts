import { contextBridge, ipcRenderer, app } from "electron";
import { pathToFileURL } from "url";
import { databaseBridgeInit } from "./databaseBridge";

databaseBridgeInit();

contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    send: (channel: string, data: any) => {
      // whitelist channels
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
