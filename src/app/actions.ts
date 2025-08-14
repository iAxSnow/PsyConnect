// @/app/actions.ts
"use server"

import { suggestTutors as suggestTutorsFlow, SuggestTutorsInput } from "@/ai/flows/suggest-tutors"

export async function suggestTutors(
  input: SuggestTutorsInput
): Promise<{ success: boolean; data?: { tutorSuggestions: string[] }; error?: string }> {
  try {
    const result = await suggestTutorsFlow(input)
    return { success: true, data: result }
  } catch (error) {
    console.error("Error in suggestTutors action:", error)
    return { success: false, error: "An unexpected error occurred while fetching tutor suggestions." }
  }
}
