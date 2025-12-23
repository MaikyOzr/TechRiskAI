const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

// Define the base path for AI flows depending on the environment
const flowsBasePath = isDev
  ? path.join(__dirname, '../ai/flows')
  : path.join(__dirname, '../../out/ai/flows');

// Helper function to require AI flows safely
function requireFlow(flowName) {
  try {
    require(path.join(flowsBasePath, `${flowName}.js`));
  } catch (error) {
    console.error(`Failed to load AI flow: ${flowName}`, error);
  }
}

// Load AI flows
if (isDev) {
  // In development, we need to register ts-node to transpile TS files on the fly
  try {
    require('ts-node').register({
      project: path.join(__dirname, '../../tsconfig.server.json'),
      transpileOnly: true,
    });
    require(path.join(__dirname, '../ai/dev.ts'));
  } catch (e) {
    console.error('ts-node registration failed. Please ensure ts-node is installed if running in dev.', e);
  }
} else {
  // In production, require the compiled JS files
  requireFlow('perform-ai-risk-analysis');
  requireFlow('generate-executive-summary');
  requireFlow('generate-actionable-recommendations');
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
    : `file://${path.join(__dirname, '../../out/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  ipcMain.handle('perform-analysis', async (event, args) => {
    try {
      // The flow is loaded dynamically based on environment
      const flowPath = isDev 
        ? path.join(flowsBasePath, 'perform-ai-risk-analysis.ts')
        : path.join(flowsBasePath, 'perform-ai-risk-analysis.js');

      const { performAIRiskAnalysis } = require(flowPath);
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
