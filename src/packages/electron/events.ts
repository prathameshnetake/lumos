import {
  ipcMain,
  dialog,
  BrowserWindow,
  session,
  shell,
  Menu,
  app,
} from "electron";
import { mainWindow } from "./main";
import getAllImageFiles from "./utils/fileIterator";
import { v4 as uuid } from "uuid";
import Manager from "./Worker/comlink_manager";
import IndexingManager from "./Worker/indexing_manager";
import { SessionBlob } from "./DB/session";
import { pathToFileURL } from "url";

export const addListeners = () => {
  ipcMain.on("test", async (event) => {
    const res = await dialog.showOpenDialog(mainWindow as BrowserWindow, {
      properties: ["openDirectory"],
    });

    event.reply("directory-selected", res);
  });

  ipcMain.on("start-images-indexing", async (event, directoryPath) => {
    const sessionId = uuid();
    event.reply("embeddings-tip-update", "Initiating the worker manager");
    const indexingManager = new IndexingManager(sessionId);
    await indexingManager.init();
    event.reply("embeddings-tip-update", "worker manager is online");
    for await (const file of getAllImageFiles(`${directoryPath}/`)) {
      indexingManager.addTask({ fileId: uuid(), filePath: file.path });
    }
  });

  ipcMain.on("select-query-file", async (event) => {
    const res = await dialog.showOpenDialog(mainWindow as BrowserWindow, {
      properties: ["openFile"],
    });

    event.reply("selected-query-file", res);
  });

  // get faces from selected file
  ipcMain.on("get-faces", async (event, filePath) => {
    try {
      const manager = new Manager();
      const faces = await manager.getFaces(filePath);
      event.reply("get-faces", faces);
    } catch (e) {
      console.log(e);
    }
  });

  // get matches for provided data
  ipcMain.on(
    "get-matches",
    async (event, data: { facePath: string; session: SessionBlob }) => {
      try {
        console.log("getting you matches");
        const manager = new Manager();
        const matchPaths = await manager.getMatches(
          data.facePath,
          data.session
        );
        event.reply("get-matches", matchPaths);
      } catch (e) {
        console.log(e);
      }
    }
  );

  ipcMain.on(
    "show-context-menu-face-search-result",
    (event, filePath: string) => {
      const template = [
        {
          label: "Open file location",
          click: () => {
            shell.showItemInFolder(pathToFileURL(filePath).toString());
          },
        },
      ];
      const menu = Menu.buildFromTemplate(template);
      menu.popup(BrowserWindow.fromWebContents(event.sender) as any);
    }
  );

  ipcMain.on("close", () => {
    mainWindow?.close();
    app.exit();
  });

  ipcMain.on("minimize", () => {
    mainWindow?.minimize();
  });
};
