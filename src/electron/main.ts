import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import isDev from 'electron-is-dev';
import { performAIRiskAnalysis } from '../ai/flows/perform-ai-risk-analysis';

let mainWindow: BrowserWindow | null = null;

async function createWindow() {
  mainWindow = new BrowserWindow({
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
    : `file://${path.join(__dirname, '..', '..', 'out', 'index.html')}`;

  await mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
    // Handler for AI Analysis
    ipcMain.handle('perform-analysis', async (event, input) => {
        try {
            console.log("Analyzing risk for input length:", input.technicalContext?.length);
            const result = await performAIRiskAnalysis(input);
            return { success: true, data: result };
        } catch (error: any) {
            console.error("AI Analysis Failed:", error);
            return { success: false, error: error.message };
        }
    });

    createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
