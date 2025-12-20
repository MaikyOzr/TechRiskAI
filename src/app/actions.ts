'use server';

import { performAIRiskAnalysis } from '@/ai/flows/perform-ai-risk-analysis';
import type { AnalysisReport } from '@/lib/types';

export async function analyzeAction(
  prevState: {
    data: AnalysisReport | null;
    error: string | null;
  },
  formData: FormData
): Promise<{
  data: AnalysisReport | null;
  error: string | null;
}> {
  const technicalContext = formData.get('technicalContext') as string;

  if (!technicalContext || technicalContext.trim().length < 50) {
    return {
      data: null,
      error: 'Please provide sufficient technical context (at least 50 characters).',
    };
  }

  try {
    const result = await performAIRiskAnalysis({ technicalContext });
    if (!result || !result.riskReport || !result.executiveSummary) {
        throw new Error("Invalid response from AI model.");
    }
    return { data: result, error: null };
  } catch (e) {
    console.error(e);
    return {
      data: null,
      error: 'An error occurred during analysis. The AI model may be unavailable. Please try again later.',
    };
  }
}
