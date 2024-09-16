const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 2000,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),  // If using preload script (optional)
            nodeIntegration: true,
            contextIsolation: false,  // Make sure this is false to allow communication between processes
            webviewTag: true          // Enable webview tag
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});