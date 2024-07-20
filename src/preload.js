const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  redeemGiftCode: (args) => ipcRenderer.invoke("redeem-gift-code", args),
  onProgressUpdate: (callback) =>
    ipcRenderer.on("progress-update", (event, progress) => callback(progress)),
});
