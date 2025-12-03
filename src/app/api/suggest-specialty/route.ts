// @/app/api/suggest-specialty/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAvailableSpecialties } from "@/services/courses";

// Asegúrate de que tu API Key está en el archivo .env.local o en las variables de entorno del servidor
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const { problemDescription } = await request.json();

    if (!problemDescription) {
      return new Response(JSON.stringify({ error: "La descripción del problema es requerida." }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const availableSpecialties = await getAvailableSpecialties();

    const prompt = `
      Eres un sistema experto para una app de salud mental. Tu objetivo es recomendar la mejor especialidad para un usuario basado en la descripción de su problema.

      Debes elegir exactamente una especialidad de la siguiente lista de especialidades disponibles:
      - ${availableSpecialties.join("\n- ")}

      Problema del usuario: "${problemDescription}"

      Basado en el problema del usuario, devuelve un objeto JSON con dos claves:
      1. "specialty": El nombre exacto de la especialidad recomendada de la lista.
      2. "reasoning": Una explicación breve y amigable de una sola frase para la recomendación, dirigida al usuario. Empieza con "¡Listo! ". Por ejemplo: "¡Listo! Te recomiendo 'Terapia de Pareja y Familia' porque mencionaste que tienes problemas con tu cónyuge."

      Responde únicamente con el objeto JSON, sin texto adicional ni formato de código como "'''json" o similares.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Limpieza robusta de la respuesta del modelo para asegurar que sea un JSON válido.
    // Busca el primer '{' y el último '}' para extraer el objeto JSON.
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("La respuesta de la IA no contenía un formato JSON válido.");
    }

    const jsonString = text.substring(jsonStart, jsonEnd + 1);
    
    const aiResponse = JSON.parse(jsonString);

    return new Response(JSON.stringify(aiResponse), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error("Error en la API de Gemini:", error);
    const errorMessage = error.message || "No se pudo obtener la sugerencia de la IA.";
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
