// @/lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini with API Key from environment variables
// Make sure to add NEXT_PUBLIC_GEMINI_API_KEY to your .env file
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export interface SuggestionResult {
  specialty: string;
  reasoning: string;
}

export async function getSpecialtySuggestion(problemDescription: string): Promise<SuggestionResult> {
  if (!apiKey) {
    throw new Error("Gemini API Key is missing");
  }

  const prompt = `
    Actúa como un psicólogo experto orientador. Analiza el siguiente problema de un paciente y sugiere la especialidad psicológica más adecuada para tratarlo.
    
    Problema del paciente: "${problemDescription}"
    
    Responde ÚNICAMENTE con un objeto JSON válido con la siguiente estructura, sin bloques de código ni texto adicional:
    {
      "specialty": "Nombre de la especialidad (ej: Psicología Clínica, Terapia Cognitivo-Conductual, Psicoanálisis, etc.)",
      "reasoning": "Breve explicación de por qué esta especialidad es la adecuada (máximo 2 oraciones)."
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up potential markdown formatting if Gemini adds it
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(cleanText) as SuggestionResult;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("No se pudo generar una sugerencia en este momento.");
  }
}
