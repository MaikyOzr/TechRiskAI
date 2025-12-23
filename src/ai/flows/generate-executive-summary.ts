/**
 * @fileOverview A flow to generate an executive summary of a risk analysis.
 *
 * - generateExecutiveSummary - A function that generates the executive summary.
 * - GenerateExecutiveSummaryInput - The input type for the generateExecutiveSummary function.
 * - GenerateExecutiveSummaryOutput - The return type for the generateExecutiveSummary function.
 */
import { z } from 'zod';
import { ai } from '@/ai/genkit';

const GenerateExecutiveSummaryInputSchema = z.object({
  riskAnalysis: z
    .string()
    .describe('The detailed risk analysis report from the AI.'),
});
export type GenerateExecutiveSummaryInput = z.infer<
  typeof GenerateExecutiveSummaryInputSchema
>;

const GenerateExecutiveSummaryOutputSchema = z.object({
  executiveSummary: z
    .string()
    .describe(
      'A concise, non-technical summary of the risk analysis for executives.'
    ),
});
export type GenerateExecutiveSummaryOutput = z.infer<
  typeof GenerateExecutiveSummaryOutputSchema
>;

export async function generateExecutiveSummary(
  input: GenerateExecutiveSummaryInput
): Promise<GenerateExecutiveSummaryOutput> {
  return generateExecutiveSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateExecutiveSummaryPrompt',
  input: {schema: GenerateExecutiveSummaryInputSchema},
  output: {schema: GenerateExecutiveSummaryOutputSchema},
  prompt: `You are an AI assistant that specializes in creating executive summaries for technical risk analysis reports.

  Given the following risk analysis, create a concise, non-technical executive summary that highlights the overall system health, risk level, and business impact.

  Risk Analysis: {{{riskAnalysis}}}

  Executive Summary:`,
});

const generateExecutiveSummaryFlow = ai.defineFlow(
  {
    name: 'generateExecutiveSummaryFlow',
    inputSchema: GenerateExecutiveSummaryInputSchema,
    outputSchema: GenerateExecutiveSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
