// @/app/api/suggest-specialty/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAvailableSpecialties } from "@/services/courses";

// Asegúrate de que tu API Key está en el archivo .env.local
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const { problemDescription } = await request.json();

    if (!problemDescription) {
      return new Response(JSON.stringify({ error: "La descripción del problema es requerida." }), { status: 400 });
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

      Responde únicamente con el objeto JSON, sin texto adicional ni formato de código.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Limpiar y parsear la respuesta JSON del modelo
    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const aiResponse = JSON.parse(jsonString);

    return new Response(JSON.stringify(aiResponse), { status: 200 });

  } catch (error) {
    console.error("Error en la API de Gemini:", error);
    return new Response(JSON.stringify({ error: "No se pudo obtener la sugerencia de la IA." }), { status: 500 });
  }
}
