// This file configures Genkit, but it is no longer strictly necessary for the 
// specialty suggestion feature, which now uses a direct API call.
// It is kept for potential future AI features.
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY })],
  model: 'googleai/gemini-2.0-flash',
});
