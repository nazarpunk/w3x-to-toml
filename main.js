const {
    app,
    BrowserWindow,
    ipcMain,
    dialog
} = require('electron');
const path = require('path');

try {
    require('electron-reloader')(module)
} catch (_) {
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
            enableRemoteModule: true,
            contextIsolation: true,
            //devTools: true,
            //disableDialogs: false,
            //sandbox: false,
        }
    });

    win.loadFile('index.html').then();

    ipcMain.on('DialogPreload-send', () => {
        dialog.showOpenDialogSync({
                properties: ['openFile', 'multiSelections'],
                filters: [
                    {name: 'Game data', extensions: ['w3a', 'w3u', 'toml']},
                ],
            }
        );
    });
}

app.whenReady().then(() => {
    ipcMain.handle('dialog', (event, method, params) => dialog[method](params));

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