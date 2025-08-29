'use server';
/**
 * @fileOverview An AI agent that suggests a specialty based on a user's problem.
 *
 * - suggestSpecialty - A function that handles the specialty suggestion process.
 * - SuggestSpecialtyInput - The input type for the suggestSpecialty function.
 * - SuggestSpecialtyOutput - The return type for the suggestSpecialty function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getAvailableSpecialties } from '@/services/courses';


const SuggestSpecialtyInputSchema = z.object({
  problemDescription: z.string().describe("The user's description of their problem."),
});
export type SuggestSpecialtyInput = z.infer<typeof SuggestSpecialtyInputSchema>;

const SuggestSpecialtyOutputSchema = z.object({
  specialty: z.string().describe('The single best specialty suggested for the user. This must be one of the available specialties.'),
  reasoning: z.string().describe('A brief, friendly explanation for the recommendation, to be shown to the user.'),
});
export type SuggestSpecialtyOutput = z.infer<typeof SuggestSpecialtyOutputSchema>;

export async function suggestSpecialty(input: SuggestSpecialtyInput): Promise<SuggestSpecialtyOutput> {
  return suggestSpecialtyFlow(input);
}


const prompt = ai.definePrompt({
  name: 'suggestSpecialtyPrompt',
  input: {schema: z.object({
    problemDescription: z.string(),
    availableSpecialties: z.array(z.string()),
  })},
  output: {schema: SuggestSpecialtyOutputSchema},
  prompt: `You are an expert system for a mental health app. Your goal is to recommend the best specialty for a user based on their problem description.

You must choose exactly one specialty from the following list of available specialties:
{{#each availableSpecialties}}
- {{{this}}}
{{/each}}

User's problem: "{{problemDescription}}"

Based on the user's problem, recommend the single most relevant specialty from the list provided. Also, provide a brief, friendly, one-sentence explanation for why you are recommending it, addressing the user directly.
For example: "Te recomiendo 'Terapia de Pareja y Familia' porque mencionaste que tienes problemas con tu cónyuge."
`,
});

const suggestSpecialtyFlow = ai.defineFlow(
  {
    name: 'suggestSpecialtyFlow',
    inputSchema: SuggestSpecialtyInputSchema,
    outputSchema: SuggestSpecialtyOutputSchema,
  },
  async (input) => {
    const availableSpecialties = await getAvailableSpecialties();
    
    const {output} = await prompt({
        ...input,
        availableSpecialties,
    });
    
    return output!;
  }
);
