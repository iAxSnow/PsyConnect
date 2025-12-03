// @/lib/gemini.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { getAvailableSpecialties } from "@/services/courses";

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

async function getSpecialtySuggestion(problem: string): Promise<{ specialty: string; reasoning: string }> {
  if (!API_KEY) {
    throw new Error("Gemini API Key is missing");
  }

  // Fetch real available specialties from Firestore to guide the AI
  let availableSpecialties: string[] = [];
  try {
     availableSpecialties = await getAvailableSpecialties();
  } catch (e) {
     console.warn("Could not fetch specialties for prompt context", e);
  }

  const specialtiesList = availableSpecialties.length > 0 
    ? `Las únicas especialidades disponibles en la plataforma son: ${availableSpecialties.join(", ")}. DEBES elegir una de esta lista si es aplicable.`
    : "";

  const genAI = new GoogleGenerativeAI(API_KEY);
  // Using gemini-pro which is generally available and stable for text tasks
  const model = genAI.getGenerativeModel({ model: "gemini-pro", safetySettings });

  const prompt = `
    Actúa como un psicólogo experto orientador. Tu tarea es analizar el problema de un paciente y sugerir la especialidad psicológica más adecuada.

    ${specialtiesList}

    Problema del paciente: "${problem}"

    Instrucciones estrictas:
    1. Si el problema descrito coincide claramente con una de las especialidades disponibles, SUGIERE ESA EXACTAMENTE.
    2. Si ninguna coincide exactamente, sugiere la más cercana estándar (ej: Terapia Cognitivo-Conductual, Psicoanálisis, Terapia de Pareja, etc.).
    3. Responde ÚNICAMENTE con un objeto JSON válido.

    Estructura JSON requerida:
    {
      "specialty": "Nombre Exacto de la Especialidad",
      "reasoning": "Explicación breve (máx 2 oraciones) dirigida al paciente."
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonString);

  } catch (error) {
    console.error("Error fetching specialty suggestion:", error);
    throw new Error("No se pudo obtener la sugerencia de la IA.");
  }
}

export { getSpecialtySuggestion };
