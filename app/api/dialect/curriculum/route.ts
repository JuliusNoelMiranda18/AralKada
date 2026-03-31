import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const FIXED_UNITS = [
  { id: 1, topic: 'Greetings & Introductions', defaultTitle: 'First Encounters' },
  { id: 2, topic: 'Daily Routine', defaultTitle: 'Daily Life' },
  { id: 3, topic: 'Food & Ordering', defaultTitle: 'Food & Market' },
  { id: 4, topic: 'Navigation & Travel', defaultTitle: 'Travel & Directions' },
  { id: 5, topic: 'Family & People', defaultTitle: 'Family & People' },
  { id: 6, topic: 'Emotions & Socializing', defaultTitle: 'Feelings & Socializing' },
];

export async function POST(request: Request) {
  const body = await request.json();
  const dialect = body.dialect;

  if (!dialect) {
    return NextResponse.json({ error: 'Dialect is required' }, { status: 400 });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are an expert translator for ${dialect}. 
            Translate the following 6 unit titles into ${dialect}. 
            Keep them natural and engaging for a language learner.
            Return ONLY a JSON object with a "units" array. 
            Each unit MUST have "id", "title" (the translation), and "topics" (the English original topic name as a single-element array).`
          },
          {
            role: 'user',
            content: JSON.stringify(FIXED_UNITS.map(u => ({ id: u.id, title: u.defaultTitle, topic: u.topic })))
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    // Ensure "topics" is an array as expected by the frontend
    const formattedUnits = result.units.map((u: any, i: number) => ({
      ...u,
      topics: [FIXED_UNITS[i].topic] 
    }));

    return NextResponse.json({ units: formattedUnits });
  } catch (error) {
    console.error("Curriculum API Error:", error);
    // Fallback if AI fails
    return NextResponse.json({ 
      units: FIXED_UNITS.map(u => ({ id: u.id, title: u.defaultTitle, topics: [u.topic] })) 
    });
  }
}
