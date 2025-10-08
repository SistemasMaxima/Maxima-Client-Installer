const {cpus } = require('os');
const { app , BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function CreateWindow(){
    const window = new BrowserWindow({
        width: 768,
        height: 560,
        frame: false, // Keep this as you have it
        webPreferences: {
        // Attach the preload script to the renderer process
        preload: path.join(__dirname, 'preload.js'),
        
        // These are important for security
        contextIsolation: true,
        enableRemoteModule: false,
        }
    });

    // --- HANDLERS FOR YOUR CUSTOM BUTTONS ---
    // Listen for the 'minimize-window' message from the renderer
    ipcMain.on('minimize-window', () => {
        // When received, minimize the window
        window.minimize();
    });

    // Listen for the 'maximize-window' message
    ipcMain.on('maximize-window', () => {
        // Check if the window is already maximized
        if (window.isMaximized()) {
            window.unmaximize(); // If it is, unmaximize it
        } else {
            window.maximize(); // If not, maximize it
        }
  });

  // Listen for the 'close-window' message
  ipcMain.on('close-window', () => {
    // When received, close the window
    window.close();
  });

  // Example handler for receiving a file path from your HTML page
  ipcMain.on('file-selected', (event, filePath) => {
    console.log('File path received in main process:', filePath);
    // You can now perform Node.js operations with this file path
  });

  window.loadFile('src/index111.html');
}

app.whenReady().then(CreateWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {app.quit();}
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    CreateWindow();
  }
});