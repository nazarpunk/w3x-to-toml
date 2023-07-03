const {ipcRenderer, contextBridge} = require('electron');

contextBridge.exposeInMainWorld('DialogPreload', {
    async fileDialog() {
        ipcRenderer.send('DialogPreload-send');
    }
});