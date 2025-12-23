'use server';

import {
  performAIRiskAnalysis,
  type PerformAIRiskAnalysisInput,
  type PerformAIRiskAnalysisOutput,
} from '@/ai/flows/perform-ai-risk-analysis';

export async function analyzeAction(
  input: PerformAIRiskAnalysisInput
): Promise<PerformAIRiskAnalysisOutput> {
  return await performAIRiskAnalysis(input);
}
