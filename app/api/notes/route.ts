import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const FORMAT_PROMPTS: Record<string, string> = {
  Cornell: `Transform the following notes into Cornell Note format with:
1. TOPIC (top line)
2. CUE QUESTIONS (left column — key questions per concept)
3. NOTES (right column — detailed notes for each cue)
4. SUMMARY (bottom — 3-sentence summary of entire topic)
Use the exact Cornell format with clear section headers.`,

  Outline: `Transform the following notes into a clean hierarchical outline with:
- Roman numeral main topics (I, II, III...)
- Capital letter subtopics (A, B, C...)
- Numbered supporting details (1, 2, 3...)
- Lowercase letter examples (a, b, c...)
Make it organized, thorough, and structured.`,

  Flashcard: `Transform the following notes into a set of study flashcards.
Format each card exactly as:
Q: [question]
A: [concise answer]
---
Create at least 8-12 flashcards covering all key concepts.`,
};

export async function POST(req: NextRequest) {
  try {
    const { notes, format } = await req.json();

    if (!notes || !format) {
      return NextResponse.json({ error: 'Notes and format are required' }, { status: 400 });
    }

    const prompt = FORMAT_PROMPTS[format];
    if (!prompt) {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    }

    const chat = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are Aralkada's smart note organizer. ${prompt}`,
        },
        {
          role: 'user',
          content: `Here are my notes:\n\n${notes}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 2048,
    });

    const output = chat.choices[0]?.message?.content ?? '';
    return NextResponse.json({ output });
  } catch (err: any) {
    console.error('Notes API error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
