// In dev mode, this allows Electron to run TypeScript files directly.
require('ts-node/register');

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { performAIRiskAnalysis } = require('../ai/flows/perform-ai-risk-analysis.ts');

async function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load the app.
  const startUrl = isDev
    ? 'http://localhost:9002'
    : `file://${path.join(__dirname, '../../out/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Open the DevTools.
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  // Handle AI analysis requests from the renderer process
  ipcMain.handle('perform-analysis', async (event, args) => {
    try {
      const result = await performAIRiskAnalysis(args);
      return { success: true, data: result };
    } catch (error) {
      console.error('AI Analysis Error:', error);
      return { success: false, error: error.message };
    }
  });
  
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
