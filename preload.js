const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electron', {
    openDialog: (method, config) => ipcRenderer.invoke('dialog', method, config),
});

contextBridge.exposeInMainWorld('fs', {
    readFile: path => ipcRenderer.invoke('readFile', path),
});