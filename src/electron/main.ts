import 'core-js/stable';
import 'regenerator-runtime/runtime';

import {app, BrowserWindow} from "electron"
import path from "path"
import Manager from "./Worker/manager";

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')
}

app.whenReady().then(async () => {
  createWindow()
  const a = new Manager();
  await a.init()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})