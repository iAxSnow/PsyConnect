// @/lib/gemini.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

const generationConfig = {
  temperature: 0.9,
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048,
};

async function getSpecialtySuggestion(problem: string): Promise<{ specialty: string; reasoning: string }> {
  if (!API_KEY) {
    throw new Error("Gemini API Key is missing");
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro", safetySettings });

  const prompt = `
    Actúa como un psicólogo experto orientador. Tu única tarea es analizar el siguiente problema de un paciente y sugerir la especialidad psicológica más adecuada para tratarlo.

    Problema del paciente: "${problem}"

    Debes responder ÚNICAMENTE con un objeto JSON válido que siga esta estructura, sin absolutamente nada más antes o después del JSON:
    {
      "specialty": "Nombre de la Especialidad Sugerida",
      "reasoning": "Una explicación breve y concisa de 1 a 2 frases del porqué de tu sugerencia."
    }

    Ejemplo de respuesta correcta:
    {
      "specialty": "Terapia Cognitivo-Conductual (TCC)",
      "reasoning": "La TCC es efectiva para abordar patrones de pensamiento negativos y comportamientos ansiosos como los que describes en tu entorno laboral."
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean the response text to ensure it's a valid JSON
    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(jsonString);

  } catch (error) {
    console.error("Error fetching specialty suggestion:", error);
    throw new Error("No se pudo obtener la sugerencia de la IA.");
  }
}

export const useGemini = () => {
    return { getSpecialtySuggestion };
};
