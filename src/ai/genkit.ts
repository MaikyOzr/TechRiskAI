import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import path from 'path';
import dotenv from 'dotenv';

// Load .env explicitly to ensure it's available in both dev and prod
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY
    })
  ],
  model: 'googleai/gemini-2.5-flash',
});
