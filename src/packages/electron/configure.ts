import settings from "electron-settings";
import { app } from "electron";
import { ensureFileSync } from "fs-extra";

export const configureSettings = () => {
  ensureFileSync(`${app.getPath("userData")}/db.sqlite`);
  settings.setSync("dbFilePath", `${app.getPath("userData")}/db.sqlite`);
};
