const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  selectChrome: () => ipcRenderer.invoke("select-chrome"),
  redeemGiftCode: (data) => ipcRenderer.invoke("redeem-gift-code", data),
});
