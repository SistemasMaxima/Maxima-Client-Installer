import { app, BrowserWindow, ipcMain, IpcMainEvent } from 'electron';
import path from 'path';

function createWindow(): void {
    const mainWindow = new BrowserWindow({
        width: 768,
        height: 560,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // This path will be relative to the 'dist' folder
            contextIsolation: true,
        }
    });

    // --- IPC Handlers for Window Controls ---
    ipcMain.on('minimize-window', () => mainWindow.minimize());

    ipcMain.on('maximize-window', () => {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    });

    ipcMain.on('close-window', () => mainWindow.close());

    ipcMain.on('file-selected', (event: IpcMainEvent, filePath: string) => {
        console.log('File path received in main process:', filePath);
    });

    // Load the HTML file, adjusting path for 'dist' folder
    mainWindow.loadFile(path.join(__dirname, '..', 'app', 'html', 'index.html'));

    /* Uncomment this line for Dev Tools */
    //mainWindow.webContents.openDevTools(); 
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
