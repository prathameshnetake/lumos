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
import { getAllFiles } from "./utils/fileIterator";
import { v4 as uuid } from "uuid";
import Manager from "./Worker/comlink_manager";
import IndexingManager from "./Worker/indexing_manager";
import { SessionBlob } from "./DB/session";
import { pathToFileURL } from "url";
import { extname } from "path";

export interface IndexPayload {
  direcorySource: string;
  sessionName: string;
}

export const addListeners = () => {
  ipcMain.on("test", async (event) => {
    const res = await dialog.showOpenDialog(mainWindow as BrowserWindow, {
      properties: ["openDirectory"],
    });

    event.reply("directory-selected", res);
  });

  ipcMain.on("start-images-indexing", async (event, data: IndexPayload) => {
    const { direcorySource, sessionName } = data;
    const sessionId = uuid();
    event.reply("embeddings-tip-update", "Initiating the worker manager");
    // count number of files
    const files = getAllFiles(`${direcorySource}/`);

    const indexingManager = new IndexingManager(
      sessionId,
      sessionName,
      files.length
    );
    await indexingManager.init();

    files.forEach((filePath, index) => {
      console.log(filePath);

      indexingManager.addTask({ fileId: uuid(), filePath, index });
    });

    event.reply("embeddings-tip-update", "worker manager is online");
  });

  ipcMain.on("select-query-file", async (event) => {
    const res = await dialog.showOpenDialog(mainWindow as BrowserWindow, {
      properties: ["openFile"],
      message: "Select Image",
    });

    const ext = extname(res.filePaths[0]);

    if (
      ext.toLocaleLowerCase() === ".jpg" ||
      ext.toLocaleLowerCase() === ".jpeg" ||
      ext === ".png"
    ) {
      event.reply("selected-query-file", res);
    } else {
      dialog.showErrorBox("Invalid file", "File should be either png or jpg");
    }
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
