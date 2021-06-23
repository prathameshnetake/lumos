declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        send: any;
        on: any;
        off: any;
      };
    };
  }
}
