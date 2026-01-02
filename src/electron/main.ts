import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load .env from the app directory in production, or root in dev
const dotEnvPath = app.isPackaged
  ? path.join(process.resourcesPath, '.env') // If you copied it to resources
  : path.join(process.cwd(), '.env');

if (fs.existsSync(dotEnvPath)) {
  dotenv.config({ path: dotEnvPath });
} else {
  // Fallback to app path for nsis installs where it might be inside the asar or next to it
  const fallbackPath = path.join(app.getAppPath(), '.env');
  if (fs.existsSync(fallbackPath)) {
    dotenv.config({ path: fallbackPath });
  }
}
import Stripe from 'stripe';
import serve from 'electron-serve';
import { performAIRiskAnalysis } from '../ai/flows/perform-ai-risk-analysis';
import { strategyConsultationFlow } from '../ai/flows/consult-risk';
import { generateFixFlow } from '../ai/flows/generate-fix';
import { ai } from '../ai/genkit';

const appServe = serve({ directory: 'out' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

let mainWindow: BrowserWindow | null = null;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'TechRiskAI - Enterprise Risk Analysis',
    icon: path.join(__dirname, '../../assets/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false // Disable webSecurity to allow local resource fetching if needed
    },
  });

  mainWindow.removeMenu();

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
  ipcMain.handle('perform-analysis', async (event, input: { technicalContext: string; projectName?: string }) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing. Please add it to your .env file.");
      }
      console.log("Analyzing project:", input.projectName || 'Untitled');
      const result = await performAIRiskAnalysis(input);
      return { success: true, data: result, projectName: input.projectName };
    } catch (error: any) {
      console.error("AI Analysis Failed:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('consult-risk', async (event, input) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
      console.log("IPC: Consulting AI... API Key present:", !!apiKey);

      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing in your .env file. Please add it to enable the Strategy Consultant.");
      }

      const result = await strategyConsultationFlow({
        riskSummary: input.riskDescription || 'Unknown risk',
        suggestedAction: input.recommendation || 'Review technical integrity',
        projectContext: input.technicalContext || '',
        question: input.userQuestion || 'How to fix this?'
      });

      console.log("IPC: AI Consultation successful.");
      return { success: true, data: result };
    } catch (error: any) {
      console.error("IPC Error in consult-risk:", error.message);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('generate-fix', async (event, input) => {
    try {
      console.log("IPC: Generating fix for:", input.riskDescription?.substring(0, 50));
      const result = await generateFixFlow(input);
      return { success: true, data: result };
    } catch (error: any) {
      console.error("IPC Error in generate-fix:", error.message);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('create-checkout-session', async () => {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'TechRisk Pro Lifetime',
              },
              unit_amount: 4900,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: 'http://localhost:9002?payment=success',
        cancel_url: 'http://localhost:9002?payment=cancel',
      });
      return { url: session.url };
    } catch (error: any) {
      console.error('Stripe session creation failed:', error);
      return { error: error.message };
    }
  });

  ipcMain.handle('validate-promo-code', (event, code) => {
    const validCodes = (process.env.PROMO_CODES || 'TRIAL12,TESTDRIVE,WELCOME12').split(',');
    if (validCodes.includes(code.toUpperCase())) {
      return { success: true };
    }
    return { success: false, message: 'Invalid promo code.' };
  });

  ipcMain.on('open-external', (event, url) => {
    shell.openExternal(url);
  });

  ipcMain.handle('save-pdf', async (event, filename) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return { success: false, error: 'Window not found' };

    const { filePath } = await dialog.showSaveDialog(win, {
      title: 'Save Report as PDF',
      defaultPath: filename,
      filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
    });

    if (!filePath) return { success: false, error: 'Cancelled' };

    try {
      const data = await win.webContents.printToPDF({
        printBackground: true,
        margins: {
          marginType: 'default'
        }
      });
      fs.writeFileSync(filePath, data);
      return { success: true, path: filePath };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('fetch-url-content', async (event, url: string) => {
    try {
      const cleanUrl = url.trim();
      let targetUrl = cleanUrl;

      // GitHub URL rewriting logic
      if (cleanUrl.includes('github.com') && !cleanUrl.includes('raw.githubusercontent.com')) {
        if (cleanUrl.includes('/blob/')) {
          // Handle direct file links
          targetUrl = cleanUrl
            .replace('github.com', 'raw.githubusercontent.com')
            .replace('/blob/', '/');
        } else {
          // If it looks like a repo root (no '/blob/', '/tree/', etc.)
          // Try to append /main/README.md as a sensible default
          const parts = cleanUrl.split('/');
          if (parts.length <= 5) { // https://github.com/user/repo
            targetUrl = cleanUrl.replace('github.com', 'raw.githubusercontent.com') + '/main/README.md';
          }
        }
      }

      console.log(`[IPC] Fetching context from: ${targetUrl}`);
      const response = await fetch(targetUrl);

      if (!response.ok) {
        if (response.status === 400 || response.status === 404) {
          throw new Error(`Failed to fetch (Status ${response.status}). If this is a GitHub link, ensure it's a direct link to a file (e.g. including /blob/branch/file).`);
        }
        throw new Error(`Failed to fetch: ${response.statusText} (HTTP ${response.status})`);
      }
      const text = await response.text();
      return { success: true, content: text, fileName: cleanUrl.split('/').pop() || 'remote-file' };
    } catch (error: any) {
      console.error('URL Fetch Error:', error);
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
