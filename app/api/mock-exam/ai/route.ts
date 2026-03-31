import { NextResponse } from 'next/server';

export const maxDuration = 60; // Extend duration for AI responses

export async function POST(req: Request) {
  try {
    const { action, questionText, questionOptions, questionAnswer, examContext } = await req.json();

    if (!action || !questionText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: 'Missing GROQ_API_KEY' }, { status: 500 });
    }

    let systemPrompt = '';
    let userMessage = '';

    if (action === 'hint') {
      systemPrompt = `You are an expert tutor helping a student prepare for the ${examContext || 'college entrance exam'}.
Your Goal: Provide a VERY brief, helpful hint for the multiple-choice question provided.
CRITICAL RULES:
1. Do NOT give away the exact answer.
2. Only point the student in the right direction or suggest a concept/formula to recall.
3. Keep it under 2 sentences. Max 30 words.`;

      userMessage = `Question: ${questionText}\nOptions: ${questionOptions?.join(', ')}`;

    } else if (action === 'similar') {
      systemPrompt = `You are an expert test creator for the ${examContext || 'college entrance exam'}.
Your Goal: The student got a question wrong. Generate exactly ONE new question that tests the EXACT SAME concept but uses different numbers, a different scenario, or a different sentence structure.
CRITICAL RULES:
1. You must respond in valid JSON format only. No markdown formatting, no intro/outro text.
2. The JSON structure MUST be:
{
  "text": "The new question text here",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "answer": "A", // (Must be exactly "A", "B", "C", or "D")
  "explanation": "Brief explanation of why this answer is correct."
}`;

      userMessage = `Original Question: ${questionText}\nOriginal Options: ${questionOptions?.join(', ')}\nOriginal Answer: ${questionAnswer}`;
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        response_format: action === 'similar' ? { type: "json_object" } : undefined
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API Error:', errorText);
      return NextResponse.json({ error: 'Failed to generate response' }, { status: response.status });
    }

    const data = await response.json();
    const result = data.choices[0].message.content.trim();

    if (action === 'hint') {
      return NextResponse.json({ hint: result });
    } else {
      // similar question parsing
      try {
        const parsed = JSON.parse(result);
        return NextResponse.json(parsed);
      } catch (e) {
        console.error('Failed to parse AI JSON:', result);
        return NextResponse.json({ error: 'AI returned invalid JSON format' }, { status: 500 });
      }
    }

  } catch (error: any) {
    console.error('API /mock-exam/ai Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
