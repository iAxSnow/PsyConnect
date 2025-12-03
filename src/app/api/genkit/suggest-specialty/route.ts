// @/app/api/genkit/suggest-specialty/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { suggestSpecialty } from '@/ai/flows/suggest-specialty';

export async function POST(req: NextRequest) {
  try {
    const { problem } = await req.json();

    if (!problem) {
      return NextResponse.json({ error: 'El campo "problem" es requerido.' }, { status: 400 });
    }

    const result = await suggestSpecialty(problem);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in API route:', error);
    return NextResponse.json({ error: error.message || 'Error al procesar la solicitud de IA.' }, { status: 500 });
  }
}
