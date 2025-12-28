import { contextBridge, ipcRenderer } from 'electron';
import type { PerformAIRiskAnalysisInput } from '../ai/flows/perform-ai-risk-analysis';

contextBridge.exposeInMainWorld('electronAPI', {
  performAnalysis: (input: PerformAIRiskAnalysisInput) => ipcRenderer.invoke('perform-analysis', input),
});
