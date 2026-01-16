import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { spawn } from 'child_process';

let selectedFilePath: string | null = null;

// --- 1. ADD THIS LOGIC ---
// This determines the correct path to your executable
// for both development and production (packaged) app.
const isDev = !app.isPackaged;
const engineExecutableName = 'parser.exe'; // Your executable name

const enginePath = isDev
    ? path.join(__dirname, '..', '..', '..', 'engine', 'dist', engineExecutableName) // Path in development
    : path.join(process.resourcesPath, 'engine', engineExecutableName); // Path in production

// --- End of new logic ---

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
            console.log(`Running parser at: ${enginePath}`); // Good for debugging
            console.log(`With file: ${selectedFilePath}`);
            
            // --- 2. THIS LINE IS CHANGED ---
            // It now uses the 'enginePath' variable we defined above
            const parserProcess = spawn(enginePath, ['-f', selectedFilePath!]);

            let result = '';
            parserProcess.stdout.on('data', (data) => result += data.toString());
            let error = '';
            parserProcess.stderr.on('data', (data) => error += data.toString());

            parserProcess.on('close', (code) => {
                if (code === 0) {
                    try {
                        console.log(result);
                        resolve(JSON.parse(result));
                    } catch (e) {
                        reject(new Error('Failed to parse Python script output as JSON.'));
                    }
                } else {
                    console.error(`Python Error: ${error}`); // Log the error
                    reject(new Error(error));
                }
            });
            
            // Add error handler for spawn itself (e.g., "file not found")
            parserProcess.on('error', (err) => {
                console.error('Failed to spawn child process.', err);
                reject(err);
            });
        });
    });

    mainWindow.loadFile(path.join('dist', 'src', 'app', 'html', 'index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});