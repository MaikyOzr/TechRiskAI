import type { PerformAIRiskAnalysisOutput } from '@/ai/flows/perform-ai-risk-analysis';

export type AnalysisReport = PerformAIRiskAnalysisOutput;

export type RiskReportItem = AnalysisReport['riskReport'][number];
