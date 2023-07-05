const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electron', {
    showOpenDialogSync: options => ipcRenderer.invoke('showOpenDialogSync', options),
});

contextBridge.exposeInMainWorld('fs', {
    readFileSync: (path, options) => ipcRenderer.invoke('readFileSync', path, options),
});