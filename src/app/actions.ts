// @/app/actions.ts
"use server"

import { suggestPsychologists as suggestPsychologistsFlow, SuggestPsychologistsInput } from "@/ai/flows/suggest-tutors"

export async function suggestPsychologists(
  input: SuggestPsychologistsInput
): Promise<{ success: boolean; data?: { psychologistSuggestions: string[] }; error?: string }> {
  try {
    const result = await suggestPsychologistsFlow(input)
    return { success: true, data: result }
  } catch (error) {
    console.error("Error in suggestPsychologists action:", error)
    return { success: false, error: "An unexpected error occurred while fetching psychologist suggestions." }
  }
}
