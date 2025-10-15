import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { spawn } from 'child_process';

let selectedFilePath: string | null = null;

function createWindow(): void {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        }
    });

    // --- IPC Handlers for Window Controls ---
    ipcMain.on('minimize-window', () => mainWindow.minimize());
    ipcMain.on('maximize-window', () => {
        if (mainWindow.isMaximized()) mainWindow.unmaximize();
        else mainWindow.maximize();
    });
    ipcMain.on('close-window', () => mainWindow.close());

    // --- Handler for the 'select-file' command ---
    ipcMain.handle('select-file', async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{ name: 'Data Files', extensions: ['xlsx', 'xls', 'csv'] }]
        });

        if (canceled || filePaths.length === 0) {
            selectedFilePath = null;
            return null;
        }

        selectedFilePath = filePaths[0];
        return path.basename(selectedFilePath);
    });

    // --- Handler for the 'run-parser' command ---
    ipcMain.handle('run-parser', async () => {
        if (!selectedFilePath) {
            return { status: 'error', message: 'No file has been selected.' };
        }

        return new Promise((resolve, reject) => {
            console.log(selectedFilePath)
            const executablePath = path.join(__dirname, '..', '..', 'parser', 'parser.exe');
            const parserProcess = spawn(executablePath, ['-f', selectedFilePath!]);

            let result = '';
            parserProcess.stdout.on('data', (data) => result += data.toString());
            let error = '';
            parserProcess.stderr.on('data', (data) => error += data.toString());

            parserProcess.on('close', (code) => {
                if (code === 0) {
                    try {
                        console.log(result)
                        resolve(JSON.parse(result));
                    } catch (e) {
                        reject(new Error('Failed to parse Python script output as JSON.'));
                    }
                } else {
                    reject(new Error(error));
                }
            });
        });
    });

    // CORRECTED PATH: Load the HTML file from the 'dist/src' directory.
    mainWindow.loadFile(path.join('dist', 'src', 'app', 'html', 'index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

