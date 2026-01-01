import { z } from 'zod';
import { ai } from '../genkit';

const GenerateFixInputSchema = z.object({
    riskDescription: z.string(),
    recommendation: z.string(),
    technicalContext: z.string(),
});

const GenerateFixOutputSchema = z.object({
    fixCode: z.string().describe('The suggested code fix or configuration change.'),
    explanation: z.string().describe('A brief explanation of why this fix works.'),
    language: z.string().describe('The programming language or tool for syntax highlighting.'),
});

export type GenerateFixInput = z.infer<typeof GenerateFixInputSchema>;
export type GenerateFixOutput = z.infer<typeof GenerateFixOutputSchema>;

const prompt = ai.definePrompt({
    name: 'generateFixPrompt',
    input: { schema: GenerateFixInputSchema },
    output: { schema: GenerateFixOutputSchema },
    prompt: `You are an expert security and DevOps engineer. Based on the following risk and technical context, provide a specific code fix.

Risk: {{riskDescription}}
Recommendation: {{recommendation}}

Source Context:
{{technicalContext}}

Your output must be a valid, secure, and production-ready code snippet or configuration change. If the context is a cloud architecture issue, provide Terraform or CLI commands. If it's a code vulnerability, provide the fixed code block. Provide a concise explanation.`,
});

export const generateFixFlow = ai.defineFlow(
    {
        name: 'generateFixFlow',
        inputSchema: GenerateFixInputSchema,
        outputSchema: GenerateFixOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
