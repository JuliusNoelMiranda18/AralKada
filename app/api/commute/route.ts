import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is missing in .env file.');
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { origin, destination, optimization } = body;

    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origin and destination are required' },
        { status: 400 }
      );
    }

    const optimizationFocus = optimization === 'Safety' 
      ? 'safety and comfort. You MUST explicitly avoid known unsafe routes, heavily congested dark alleys, or crime-prone areas. In your optimizationNote, you MUST describe exactly what unsafe areas or route types this path actively avoided and why it is safer.' 
      : 'the cheapest possible price.';

    const systemPrompt = `You are an expert Philippine transit routing AI similar to Sakay.ph. 
Your goal is to provide a highly detailed, realistic commuter guide using public transportation (jeepneys, buses, LRT/MRT, UV Express, tricycles, walking) in the Philippines.
CRITICAL INSTRUCTION: You MUST use accurate 2026 Philippine public transport minimum fares (e.g., Traditional Jeepney is ~₱15+, Modern Jeepney is ~₱15+, LRT/MRT is ~₱15-₱40+).
You must return ONLY a JSON object that matches this TypeScript structure exactly, with NO markdown formatting, NO extra text, and NO markdown code blocks around it.

{
  "totalTime": string (e.g. "45 mins"),
  "totalCost": string (e.g. "₱ 32.00"),
  "optimizationNote": string (a short explanation of why this route is optimal for the chosen preference. If optimized for Safety, detail what specific unsafe areas were avoided.),
  "steps": Array< {
    "type": "Walk" | "Jeepney" | "Bus" | "LRT" | "MRT" | "UV Express" | "Tricycle" | "Ferry",
    "instruction": string (e.g. "Walk to Taft Ave corner Pedro Gil St."),
    "lineName": string (e.g. "Baclaran - Monumento" for jeep, "LRT-1" for LRT),
    "duration": string (e.g. "10 mins"),
    "cost": string (e.g. "₱ 15.00")
  } >
}`;

    const userPrompt = `Origin: ${origin}
Destination: ${destination}
Optimization Preference: ${optimizationFocus}

Provide the realistic commuter route optimized for ${optimizationFocus}.`;

    const chatCompletion = await getGroqClient().chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'llama-3.3-70b-versatile', // Usually fast and cheap; llama-3.1-8b-instant or similar might also work, sticking to llama3-8b-8192 if it's standard
      temperature: 0.2, // Low temp for more factual routing
      response_format: { type: 'json_object' }
    });

    const configText = chatCompletion.choices[0]?.message?.content;
    
    if (!configText) {
      throw new Error('Groq returned empty response');
    }

    const routeData = JSON.parse(configText);

    return NextResponse.json(routeData);

  } catch (error: any) {
    console.error('Commute API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate commute route' },
      { status: 500 }
    );
  }
}
