import { app, BrowserWindow } from "electron";
import { join } from "path";
import { URL } from "url";
import { addListeners } from "./events";
import { configureSettings } from "./configure";
import { getSync } from "electron-settings";
import { writeFileSync } from "fs-extra";

const isSingleInstance = app.requestSingleInstanceLock();

if (!isSingleInstance) {
  app.quit();
  process.exit(0);
}

/**
 * Workaround for TypeScript bug
 * @see https://github.com/microsoft/TypeScript/issues/41468#issuecomment-727543400
 */
const env = import.meta.env;

export let mainWindow: BrowserWindow | null = null;

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    show: false, // Use 'ready-to-show' event to show window
    frame: false,
    minHeight: 768,
    minWidth: 1024,
    webPreferences: {
      preload: join(__dirname, "../dist_preload/preload.cjs"),
      webSecurity: false,
    },
  });

  /**
   * If you install `show: true` then it can cause issues when trying to close the window.
   * Use `show: false` and listener events `ready-to-show` to fix these issues.
   *
   * @see https://github.com/electron/electron/issues/25012
   */
  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();

    if (env.MODE === "development") {
      mainWindow?.webContents.openDevTools();
    }
  });

  /**
   * URL for main window.
   * Vite dev server for development.
   * `file://../renderer/index.html` for production and test
   */
  const pageUrl =
    env.MODE === "development"
      ? env.VITE_DEV_SERVER_URL
      : new URL("./dist_renderer/index.html", "file://" + __dirname).toString();

  await mainWindow.loadURL(pageUrl as string);
};

app.on("second-instance", () => {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app
  .whenReady()
  .then(createWindow)
  .catch((e) => console.error("Failed create window:", e));

// Auto-updates
// if (env.PROD) {
//   app.whenReady()
//     .then(() => import('electron-updater'))
//     .then(({autoUpdater}) => autoUpdater.checkForUpdatesAndNotify())
//     .catch((e) => console.error('Failed check updates:', e));
// }

// add all renderer communication events
configureSettings();
addListeners();

// set default db path
writeFileSync(`${__dirname}/DB_FILE_PATH`, getSync("dbFilePath") as string);
