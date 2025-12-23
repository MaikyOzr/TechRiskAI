const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

let performAIRiskAnalysis;
if (isDev) {
  // In development, require the compiled JS file from the 'out' directory.
  // This assumes you've run 'npm run build:ai' as part of the dev script.
  try {
    performAIRiskAnalysis = require(path.join(app.getAppPath(), 'out', 'ai', 'flows', 'perform-ai-risk-analysis.js')).performAIRiskAnalysis;
  } catch (e) {
    console.error('Failed to load performAIRiskAnalysis in dev mode.', e);
    // Exit gracefully if the file isn't there, as the app can't function.
    app.quit();
  }
} else {
  // In production, require the file from the asar archive.
  performAIRiskAnalysis = require(path.join(process.resourcesPath, 'app.asar', 'out', 'ai', 'flows', 'perform-ai-risk-analysis.js')).performAIRiskAnalysis;
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

  const startUrl = isDev
    ? 'http://localhost:9002'
    : `file://${path.join(__dirname, '../../index.html')}`;
  
  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  ipcMain.handle('perform-analysis', async (event, args) => {
    if (!performAIRiskAnalysis) {
      const errorMsg = 'AI analysis function is not loaded.';
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
