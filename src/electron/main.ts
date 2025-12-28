import 'dotenv/config';
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import serve from 'electron-serve';
import { performAIRiskAnalysis } from '../ai/flows/perform-ai-risk-analysis';

const appServe = serve({ directory: 'out' });

let mainWindow: BrowserWindow | null = null;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false // Disable webSecurity to allow local resource fetching if needed
    },
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    await mainWindow.loadURL('http://localhost:9002');
  } else {
    // In production, use electron-serve
    await appServe(mainWindow);
  }

  // ALWAYS open DevTools for debugging white screen issues
  mainWindow.webContents.openDevTools();
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
