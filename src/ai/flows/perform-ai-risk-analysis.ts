/**
 * @fileOverview This file defines a Genkit flow for performing AI-powered risk analysis on technical input.
 *
 * - performAIRiskAnalysis - A function that triggers the risk analysis flow.
 * - PerformAIRiskAnalysisInput - The input type for the performAIRiskAnalysis function.
 * - PerformAIRiskAnalysisOutput - The return type for the performAIRiskAnalysis function.
 */
import { z } from 'zod';
import { ai } from '../genkit';

const PerformAIRiskAnalysisInputSchema = z.object({
  technicalContext: z
    .string()
    .describe(
      'Technical context for risk analysis, including code snippets, logs, or configuration fragments.'
    ),
  projectName: z.string().optional().describe('The name of the project being analyzed.'),
});
export type PerformAIRiskAnalysisInput = z.infer<typeof PerformAIRiskAnalysisInputSchema>;

const RiskReportItemSchema = z.object({
  description: z.string().describe('A clear description of the risk.'),
  evidence: z
    .string()
    .describe(
      'Evidence from the provided technical context supporting the identified risk.'
    ),
  businessImpact: z
    .string()
    .describe(
      'The potential business impact of the risk, including cost, downtime, and growth limits.'
    ),
  severity: z.enum(['low', 'medium', 'high']).describe('The severity level of the risk.'),
  recommendation: z.string().describe('Actionable recommendation to mitigate the risk.'),
  effort: z.enum(['low', 'medium', 'high']).describe('Estimated effort to implement the recommendation'),
  benefit: z.string().describe('Expected business benefit of implementing the recommendation'),
  complianceMapping: z.object({
    soc2: z.string().optional().describe('SOC2 control reference if applicable.'),
    iso27001: z.string().optional().describe('ISO27001 control reference if applicable.'),
    gdpr: z.string().optional().describe('GDPR article reference if applicable.'),
  }).optional().describe('Mapping to compliance standards.'),
});

const PerformAIRiskAnalysisOutputSchema = z.object({
  riskReport: z.array(RiskReportItemSchema).describe('A structured report of identified risks.'),
  executiveSummary: z.string().describe('A non-technical summary of the risk analysis.'),
  riskScores: z.object({
    security: z.number().min(0).max(100),
    scalability: z.number().min(0).max(100),
    stability: z.number().min(0).max(100),
    cost: z.number().min(0).max(100),
    architecture: z.number().min(0).max(100),
  }).describe('Technical health scores (0-100) for visualization, where 100 is perfect health.'),
  architectureCode: z.string().describe('Mermaid.js code representing the system architecture. Use a flowchart (graph LR). Highlight risky components in red.'),
  financialImpact: z.object({
    potentialLoss: z.string().describe('Estimated monetary loss in USD if risks are not addressed (e.g., "$10k - $50k").'),
    costToFix: z.string().describe('Estimated investment required to mitigate key risks.'),
    businessUrgency: z.enum(['Critical', 'High', 'Medium', 'Low']),
    riskSummary: z.string().describe('A 1-sentence punchy summary of the financial danger.'),
  }).optional(),
  technicalContext: z.string().optional().describe('The original technical context provided by the user.'),
});
export type PerformAIRiskAnalysisOutput = z.infer<typeof PerformAIRiskAnalysisOutputSchema>;

export async function performAIRiskAnalysis(
  input: PerformAIRiskAnalysisInput
): Promise<PerformAIRiskAnalysisOutput> {
  return performAIRiskAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'performAIRiskAnalysisPrompt',
  input: { schema: PerformAIRiskAnalysisInputSchema },
  output: { schema: PerformAIRiskAnalysisOutputSchema },
  prompt: `You are an AI-powered risk analysis tool. Analyze the provided technical context and generate a structured report of technical risks.

Technical Context: {{{technicalContext}}}

Your analysis should identify technical risks, architecture problems, scalability limitations, security concerns, and potential improvement opportunities.  Provide clear descriptions, evidence (based only on the provided data), business impact (cost, downtime, growth limits), and a severity level (low, medium, or high) for each identified risk. Also include concrete "quick wins", estimated effort (low, medium, or high), and expected business benefit (stability, cost reduction, scalability).

Finally, generate a non-technical executive summary explaining the overall system health, risk level, business urgency, and high-level recommendations, designed specifically for CEOs, CTOs, and product owners. 

Additionally, calculate "Health Scores" (0-100, where 100 is best) for the following categories using these exact keys:
- "security": Security level
- "scalability": Scalability and performance
- "stability": Error handling and reliability
- "cost": Cost optimization
- "architecture": General architecture quality

NEW PREMIUM FEATURES:
1. "architectureCode": Generate a Mermaid.js flowchart (graph LR) that maps out the system components mentioned. Use styles to highlight risky parts with white text on red background (e.g., style componentName fill:#ef4444,stroke:#333,color:#fff).
2. "financialImpact": Provide a hard-hitting financial assessment. Estimate potential revenue loss, recovery costs, or legal fines based on the tech risks identified.
3. "complianceMapping": For each risk, map it to specific compliance controls in the "complianceMapping" object ONLY if applicable. Be specific (e.g., "SOC2 CC6.1", "GDPR Article 32", "ISO27001 A.12.1.2").

Adhere to the schema descriptions strictly when producing the output.`,
});

const performAIRiskAnalysisFlow = ai.defineFlow(
  {
    name: 'performAIRiskAnalysisFlow',
    inputSchema: PerformAIRiskAnalysisInputSchema,
    outputSchema: PerformAIRiskAnalysisOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return {
      ...output!,
      technicalContext: input.technicalContext
    } as PerformAIRiskAnalysisOutput;
  }
);
