import {
  type PerformAIRiskAnalysisInput,
  type PerformAIRiskAnalysisOutput,
} from '@/ai/flows/perform-ai-risk-analysis';

export async function analyzeAction(
  input: PerformAIRiskAnalysisInput
): Promise<PerformAIRiskAnalysisOutput> {
  if (typeof window !== 'undefined' && window.electronAPI) {
      const response = await window.electronAPI.performAnalysis(input);
      if (response.error) {
          throw new Error(response.error);
      }
      return response.data!;
  }
  // Fallback for non-electron environment or dev mode if not bridged
  console.warn("Electron API not found, returning mock or throwing error.");
  throw new Error("Electron API is not available.");
}
