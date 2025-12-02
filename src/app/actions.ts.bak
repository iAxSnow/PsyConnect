// @/app/actions.ts
"use server"

import { suggestSpecialty as suggestSpecialtyFlow, SuggestSpecialtyInput, SuggestSpecialtyOutput } from "@/ai/flows/suggest-specialty"

export async function suggestSpecialty(
  input: SuggestSpecialtyInput
): Promise<{ success: boolean; data?: SuggestSpecialtyOutput; error?: string }> {
  try {
    const result = await suggestSpecialtyFlow(input)
    return { success: true, data: result }
  } catch (error) {
    console.error("Error in suggestSpecialty action:", error)
    return { success: false, error: "An unexpected error occurred while fetching suggestions." }
  }
}
