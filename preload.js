const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electron', {
    openDialog: (method, config) => ipcRenderer.invoke('dialog', method, config),
});