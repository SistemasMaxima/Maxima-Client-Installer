import { contextBridge, ipcRenderer } from 'electron';

// It's a good practice to define the shape of your API
export interface ElectronAPI {
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  sendFile: (filePath: string) => void;
}

const api: ElectronAPI = {
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
  sendFile: (filePath: string) => ipcRenderer.send('file-selected', filePath),
};

contextBridge.exposeInMainWorld('electronAPI', api);
