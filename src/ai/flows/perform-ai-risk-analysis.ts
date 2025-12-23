/**
 * @fileOverview This file defines a Genkit flow for performing AI-powered risk analysis on technical input.
 *
 * - performAIRiskAnalysis - A function that triggers the risk analysis flow.
 * - PerformAIRiskAnalysisInput - The input type for the performAIRiskAnalysis function.
 * - PerformAIRiskAnalysisOutput - The return type for the performAIRiskAnalysis function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PerformAIRiskAnalysisInputSchema = z.object({
  technicalContext: z
    .string()
    .describe(
      'Technical context for risk analysis, including code snippets, logs, or configuration fragments.'
    ),
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
});

const PerformAIRiskAnalysisOutputSchema = z.object({
  riskReport: z.array(RiskReportItemSchema).describe('A structured report of identified risks.'),
  executiveSummary: z.string().describe('A non-technical summary of the risk analysis.'),
});
export type PerformAIRiskAnalysisOutput = z.infer<typeof PerformAIRiskAnalysisOutputSchema>;

export async function performAIRiskAnalysis(
  input: PerformAIRiskAnalysisInput
): Promise<PerformAIRiskAnalysisOutput> {
  return performAIRiskAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'performAIRiskAnalysisPrompt',
  input: {schema: PerformAIRiskAnalysisInputSchema},
  output: {schema: PerformAIRiskAnalysisOutputSchema},
  prompt: `You are an AI-powered risk analysis tool. Analyze the provided technical context and generate a structured report of technical risks.

Technical Context: {{{technicalContext}}}

Your analysis should identify technical risks, architecture problems, scalability limitations, security concerns, and potential improvement opportunities.  Provide clear descriptions, evidence (based only on the provided data), business impact (cost, downtime, growth limits), and a severity level (low, medium, or high) for each identified risk. Also include concrete "quick wins", estimated effort (low, medium, or high), and expected business benefit (stability, cost reduction, scalability).

Finally, generate a non-technical executive summary explaining the overall system health, risk level, business urgency, and high-level recommendations, designed specifically for CEOs, CTOs, and product owners. Adhere to the schema descriptions strictly when producing the output.`,
});

const performAIRiskAnalysisFlow = ai.defineFlow(
  {
    name: 'performAIRiskAnalysisFlow',
    inputSchema: PerformAIRiskAnalysisInputSchema,
    outputSchema: PerformAIRiskAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
