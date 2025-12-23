const { contextBridge, ipcRenderer } = require('electron');

// Expose a safe, limited API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  performAnalysis: (args) => ipcRenderer.invoke('perform-analysis', args),
});
