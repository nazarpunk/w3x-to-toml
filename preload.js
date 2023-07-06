const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electron', {
    showOpenDialogSync: options => ipcRenderer.invoke('showOpenDialogSync', options),
});

contextBridge.exposeInMainWorld('fs', {
    readFileSync: (path, options) => ipcRenderer.invoke('readFileSync', path, options),
    writeFileSync: (path, data, options) => ipcRenderer.invoke('writeFileSync', path, data, options),
});

contextBridge.exposeInMainWorld('path', {
    parse: path => ipcRenderer.invoke('path-parse', path),
    join: (...paths) => ipcRenderer.invoke('path-join', ...paths),
});