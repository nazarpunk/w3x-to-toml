const {
    app,
    BrowserWindow,
    ipcMain,
    dialog
} = require('electron');

const path = require('path');
const fs = require("fs");

if (!app.isPackaged) {
    require('electron-reloader')(module, {
        ignore: ['./renderer.js']
    })
}

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        alwaysOnTop: true,
        darkTheme: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            enableRemoteModule: false,
            contextIsolation: true,
            devTools: !app.isPackaged,
        }
    });

    win.loadFile('index.html').then();
}


app.whenReady().then(() => {
    ipcMain.handle('showOpenDialogSync', (event, options) => dialog.showOpenDialogSync(options));
    ipcMain.handle('readFileSync', (event, path, options) => fs.readFileSync(path, options));

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})