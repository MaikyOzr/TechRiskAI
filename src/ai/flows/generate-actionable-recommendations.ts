/**
 * @fileOverview This file defines a Genkit flow for generating actionable recommendations based on a risk analysis report.
 *
 * - generateActionableRecommendations - A function that triggers the actionable recommendations generation flow.
 * - GenerateActionableRecommendationsInput - The input type for the generateActionableRecommendations function.
 * - GenerateActionableRecommendationsOutput - The return type for the generateActionableRecommendations function.
 */
import { z } from 'zod';
import { ai } from '@/ai/genkit';

const GenerateActionableRecommendationsInputSchema = z.object({
  riskReport: z.string().describe('The structured risk report from the AI analysis.'),
});
export type GenerateActionableRecommendationsInput = z.infer<typeof GenerateActionableRecommendationsInputSchema>;

const GenerateActionableRecommendationsOutputSchema = z.object({
  recommendations: z.array(
    z.object({
      description: z.string().describe('A clear description of the recommendation.'),
      estimatedEffort: z
        .enum(['low', 'medium', 'high'])
        .describe('The estimated effort required to implement the recommendation.'),
      expectedBusinessBenefit: z.string().describe('The expected business benefit of implementing the recommendation (stability, cost reduction, scalability).'),
    })
  ).describe('A list of actionable recommendations.'),
});
export type GenerateActionableRecommendationsOutput = z.infer<typeof GenerateActionableRecommendationsOutputSchema>;

export async function generateActionableRecommendations(input: GenerateActionableRecommendationsInput): Promise<GenerateActionableRecommendationsOutput> {
  return generateActionableRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateActionableRecommendationsPrompt',
  input: {schema: GenerateActionableRecommendationsInputSchema},
  output: {schema: GenerateActionableRecommendationsOutputSchema},
  prompt: `You are a CTO expert in identifying actionable recommendations from risk assessments.
  Based on the following risk report, provide a list of actionable recommendations.
  Each recommendation should include a clear description, an estimated effort (low, medium, or high), and the expected business benefit (stability, cost reduction, scalability).

  Risk Report:
  {{riskReport}}`,
});

const generateActionableRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateActionableRecommendationsFlow',
    inputSchema: GenerateActionableRecommendationsInputSchema,
    outputSchema: GenerateActionableRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
