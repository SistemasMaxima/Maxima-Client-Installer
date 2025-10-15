import { contextBridge, ipcRenderer } from 'electron';

const electronAPI = {
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
  
  // 1. Expose the function to open the file dialog
  selectFile: () => ipcRenderer.invoke('select-file'),
  
  // 2. Expose the function to run the parser on the selected file
  runParser: () => ipcRenderer.invoke('run-parser'),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

