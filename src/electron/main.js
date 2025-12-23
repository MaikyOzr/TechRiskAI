const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Dynamically require the AI flows using absolute paths.
// This is more robust for the Electron environment.
const flowNames = [
  'perform-ai-risk-analysis',
  'generate-executive-summary',
  'generate-actionable-recommendations',
];

// In development, we load from src. In production, from the compiled 'out' directory.
const isDev = process.env.NODE_ENV !== 'production';
const flowPathPrefix = isDev ? path.join(__dirname, '../ai/flows') : path.join(__dirname, '../ai/flows'); // Assuming build process places it similarly

flowNames.forEach(flowName => {
  try {
    // In dev, ts-node/register handles TS files if needed, but we build to JS first.
    // The build process ensures these are JS files in 'out'
    const flowPath = isDev 
      ? path.join(__dirname, `../../out/ai/flows/${flowName}.js`)
      : path.join(__dirname, `../ai/flows/${flowName}.js`);
    require(flowPath);
  } catch (error) {
    console.warn(`Could not load AI flow: ${flowName}.js. Ensure it has been built correctly. Error: ${error.message}`);
  }
});


async function createWindow() {
  const isDev = (await import('electron-is-dev')).default;
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Correctly points to preload.js in the same directory
      // It's important to consider the security implications of these settings.
      // nodeIntegration and contextIsolation are important for security.
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load the app.
  // In dev, load from the Next.js dev server.
  // In prod, load from the static export.
  const startUrl = isDev
    ? 'http://localhost:9002'
    : `file://${path.join(__dirname, '../../out/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Open the DevTools.
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Handle AI analysis requests from the renderer process
  ipcMain.handle('perform-analysis', async (event, args) => {
    try {
      // We need to dynamically get the flow function.
      const flowPath = isDev
        ? path.join(__dirname, '../../out/ai/flows/perform-ai-risk-analysis.js')
        : path.join(__dirname, '../ai/flows/perform-ai-risk-analysis.js');
      
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
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
