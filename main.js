const {
    app,
    BrowserWindow,
    ipcMain,
    dialog
} = require('electron');

const path = require('path');

const electron = require('electron');

if (!electron.app.isPackaged) {
    require('electron-reloader')(module, {
        ignore: ['./renderer.js']
    })

    console.log('reload');
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
}

app.whenReady().then(() => {
    ipcMain.handle('dialog', async (event, method, params) => await dialog[method](params));

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