require('ts-node/register');
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

// Directly require the TypeScript file. ts-node will handle it.
let performAIRiskAnalysis;
try {
  ({ performAIRiskAnalysis } = require('../ai/flows/perform-ai-risk-analysis.ts'));
} catch(e) {
  console.error("Failed to load performAIRiskAnalysis flow", e);
}

async function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // In development, load from the Next.js server.
  // In production, load the static export.
  const startUrl = isDev
    ? 'http://localhost:9002'
    : `file://${path.join(__dirname, '..', '..', 'out', 'index.html')}`;
  
  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  ipcMain.handle('perform-analysis', async (event, args) => {
    if (!performAIRiskAnalysis) {
      const errorMsg = 'AI analysis function is not loaded. Check logs for details.';
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }
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
