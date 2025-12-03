// @/ai/flows/suggest-specialty.ts
'use server';
/**
 * @fileOverview Flow to suggest a psychological specialty based on a problem description.
 *
 * This file defines the Genkit flow for the AI assistant feature.
 * - suggestSpecialty: The main function that takes a problem description and returns a specialty suggestion.
 * - SpecialtySuggestionInput: The Zod schema for the input.
 * - SpecialtySuggestionOutput: The Zod schema for the output.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// 1. Define the input schema
const SpecialtySuggestionInputSchema = z.string().describe("The user's description of their problem.");
export type SpecialtySuggestionInput = z.infer<typeof SpecialtySuggestionInputSchema>;

// 2. Define the output schema
const SpecialtySuggestionOutputSchema = z.object({
  specialty: z.string().describe("The suggested psychological specialty (e.g., Psicología Clínica, Terapia Cognitivo-Conductual)."),
  reasoning: z.string().describe("A brief, 1-2 sentence explanation for why the specialty is recommended."),
});
export type SpecialtySuggestionOutput = z.infer<typeof SpecialtySuggestionOutputSchema>;

// 3. Define the main exported function that clients will call
export async function suggestSpecialty(problem: SpecialtySuggestionInput): Promise<SpecialtySuggestionOutput> {
  return suggestSpecialtyFlow(problem);
}

// 4. Define the Genkit prompt
const suggestSpecialtyPrompt = ai.definePrompt({
  name: 'suggestSpecialtyPrompt',
  input: { schema: SpecialtySuggestionInputSchema },
  output: { schema: SpecialtySuggestionOutputSchema },
  prompt: `
    Actúa como un psicólogo experto orientador. Analiza el siguiente problema de un paciente y sugiere la especialidad psicológica más adecuada para tratarlo.

    Problema del paciente: "{{input}}"

    Responde ÚNICAMENTE con un objeto JSON válido con la estructura definida en el esquema de salida, sin bloques de código ni texto adicional.
  `,
});

// 5. Define the Genkit flow
const suggestSpecialtyFlow = ai.defineFlow(
  {
    name: 'suggestSpecialtyFlow',
    inputSchema: SpecialtySuggestionInputSchema,
    outputSchema: SpecialtySuggestionOutputSchema,
  },
  async (input) => {
    const { output } = await suggestSpecialtyPrompt(input);
    if (!output) {
      throw new Error('La IA no pudo generar una sugerencia.');
    }
    return output;
  }
);
