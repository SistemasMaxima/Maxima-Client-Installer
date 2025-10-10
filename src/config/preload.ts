import { contextBridge, ipcRenderer } from 'electron';

// It's a good practice to define the shape of your API
export interface ElectronAPI {
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  selectFile: () => void;
  runParser: () => void;
}

const api: ElectronAPI = {
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
  selectFile: () => ipcRenderer.invoke('select-file'),
  runParser: () => ipcRenderer.invoke('run-parser'),
};

contextBridge.exposeInMainWorld('electronAPI', api);
