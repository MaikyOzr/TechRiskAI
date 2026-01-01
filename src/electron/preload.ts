import { contextBridge, ipcRenderer } from 'electron';
import type { PerformAIRiskAnalysisInput } from '../ai/flows/perform-ai-risk-analysis';

contextBridge.exposeInMainWorld('electronAPI', {
  performAnalysis: (input: PerformAIRiskAnalysisInput) => ipcRenderer.invoke('perform-analysis', input),
  createCheckoutSession: () => ipcRenderer.invoke('create-checkout-session'),
  validatePromoCode: (code: string) => ipcRenderer.invoke('validate-promo-code', code),
  savePDF: (filename: string) => ipcRenderer.invoke('save-pdf', filename),
  openExternal: (url: string) => ipcRenderer.send('open-external', url),
  consultRisk: (input: any) => ipcRenderer.invoke('consult-risk', input),
  generateFix: (input: any) => ipcRenderer.invoke('generate-fix', input),
  fetchUrlContent: (url: string) => ipcRenderer.invoke('fetch-url-content', url),
});
