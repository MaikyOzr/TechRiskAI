import { z } from 'zod';
import { ai } from '../genkit';

export const ConsultRiskInputSchema = z.object({
    riskSummary: z.string(),
    suggestedAction: z.string(),
    projectContext: z.string(),
    question: z.string(),
});

export const ConsultRiskOutputSchema = z.object({
    answer: z.string(),
    codeSnippet: z.string().optional(),
    nextSteps: z.array(z.string()).optional(),
});

export type ConsultRiskInput = z.infer<typeof ConsultRiskInputSchema>;
export type ConsultRiskOutput = z.infer<typeof ConsultRiskOutputSchema>;

// Use ai.definePrompt - it will use the default model from genkit.ts (now gemini-2.0-flash)
const consultPrompt = ai.definePrompt({
    name: 'consultPrompt',
    input: { schema: ConsultRiskInputSchema },
    output: { schema: ConsultRiskOutputSchema },
    prompt: `
        You are a Senior Technical Consultant. Answer the user question based on the technical context provided.
        
        TECHNICAL RISK: {{riskSummary}}
        RECOMMENDATION: {{suggestedAction}}
        PROJECT CONTEXT: {{projectContext}}
        
        USER QUESTION: {{question}}
        
        Provide a detailed answer. If the question asks for code, include it in the "codeSnippet" field.
        The "answer" should be formatted in Markdown.
        List 3-5 implementation steps in the "nextSteps" array.
    `,
});

export const strategyConsultationFlow = ai.defineFlow(
    {
        name: 'strategyConsultationFlow',
        inputSchema: ConsultRiskInputSchema,
        outputSchema: ConsultRiskOutputSchema,
    },
    async (input) => {
        console.log('[AI Flow] Processing consultation request with Gemini 2.0 Flash...');

        try {
            const { output } = await consultPrompt(input);
            if (!output) {
                throw new Error('AI returned no output');
            }
            return output;
        } catch (error: any) {
            console.error('[AI Flow] Consultation Error:', error.message);
            // Fallback for safety
            return {
                answer: `I apologize, there was an issue processing your request: ${error.message}. Please ensure your API key and model settings are correct.`,
                nextSteps: ['Check internet connection', 'Try a simpler question']
            };
        }
    }
);
