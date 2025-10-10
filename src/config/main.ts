import { app, BrowserWindow, ipcMain, IpcMainEvent, dialog } from 'electron';
import path from 'path';
import { spawn } from 'child_process';

let selectedFilePath: string | null = null;

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
        console.log('File received in main process:', filePath);
        const absolutePath = path.dirname(filePath);
        console.log('File path resolved:', absolutePath);
    });

    ipcMain.handle('select-file', async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{ name: 'Data Files', extensions: ['xlsx', 'xls', 'csv'] }]
        });

        if (canceled || filePaths.length === 0) {
            selectedFilePath = null;
            return null; // Return null if the user cancels
        }

        selectedFilePath = filePaths[0]; // Store the full path securely here
        return path.basename(selectedFilePath); // Return only the file's name to the UI
    });

    ipcMain.handle('run-parser', async () => {
        if (!selectedFilePath) {
            // If no file was stored, return an error object
            return { status: 'error', message: 'No file has been selected to parse.' };
        }

        // Wrap the child process in a Promise to handle async behavior
        return new Promise((resolve, reject) => {
            const scriptPath = path.join(app.getAppPath(), 'engine', 'parser.py');
            const pythonProcess = spawn('python', [scriptPath, selectedFilePath!]);

            let result = '';
            pythonProcess.stdout.on('data', (data) => {
                // The Python script will print its JSON output, which we collect here.
                result += data.toString();
            });

            let error = '';
            pythonProcess.stderr.on('data', (data) => {
                // Collect any errors that the Python script might print.
                error += data.toString();
            });

            pythonProcess.on('close', (code) => {
                if (code === 0) {
                    // If the script exits successfully (code 0), parse the JSON result.
                    //resolve(JSON.parse(result));
                    console.log('Result: ', result)
                    resolve(result);
                } else {
                    // If the script exits with an error, reject the promise.
                    reject(new Error(error));
                }
                console.log('Python exited with code: ', code)                
            });
        });
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
