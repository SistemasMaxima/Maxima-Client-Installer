const { contextBridge, ipcRenderer } = require('electron');

// We are using the contextBridge to securely expose a custom API to your renderer process (your HTML page).
contextBridge.exposeInMainWorld('electronAPI', {
  // Expose a 'minimizeWindow' function that sends a message to the main process
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  
  // Expose a 'maximizeWindow' function
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  
  // Expose a 'closeWindow' function
  closeWindow: () => ipcRenderer.send('close-window'),

  getCPUs: () => ipcRenderer.invoke('get-cpus'),

  // You can also expose the file path sending functionality this way
  sendFile: (filePath) => ipcRenderer.send('file-selected', filePath)
});
