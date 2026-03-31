import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Disable Next.js aggressive caching for this route

const TOPICS = [
  'ordering street food', 'asking for a discount at a market', 'describing the weather',
  'talking about family members', 'counting fruits', 'asking for directions to the beach',
  'expressing feelings like tired or happy', 'talking about household chores',
  'discussing farm animals', 'identifying body parts', 'ordering coffee or tea',
  'asking for the time', 'talking about clothes and colors', 'weekend plans',
  'describing a pet', 'talking about the sea or mountains', 'traditional festivals',
  'common verbs like running or sleeping', 'kitchen utensils', 'transportation like jeepneys',
  'emergency words like help or lost', 'shopping for souvenirs', 'hobbies like singing',
  'typical breakfast items', 'common adjectives like big or small'
];

export async function POST(request: Request) {
  const body = await request.json();
  const dialect = body.dialect;
  const unitTopic = body.topic;
  const seed = body.seed || Math.random();
  const exclude = body.exclude || [];
  const isStrict = body.isStrict || false; // New flag from frontend
  
  // If strict, use the provided unit topic. Otherwise, pick a random topic from the broad pool.
  const finalTopic = isStrict ? unitTopic : TOPICS[Math.floor(Math.random() * TOPICS.length)];

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
            content: `You are an expert language teacher and native speaker of ${dialect} (a Philippine language).
Your task is to generate a SINGLE beginner-level testing module.
CRITICAL: The phrase generated MUST be STRICTLY and EXCLUSIVELY about the following topic: "${finalTopic}". 
If the topic is "Ordering Food", the phrase MUST be about food or ordering. 

${exclude.length > 0 ? `DO NOT REPEAT any of these existing phrases (already used): ${exclude.join(', ')}.` : ""}
YOUR GOAL is to explore DIFFERENT vocabulary and sentence structures within the theme to maximize variety.

52. Topic: ${finalTopic}.
53. Provide the phrase in English ("englishPhrase").
54. Provide the EXACT correct translation in ${dialect} ("dialectPhrase").
55. Provide a helpful hint ("hint") without giving away the direct answer.
56. Provide a short grammatical explanation ("explanation").
57. Provide an array of all valid ways to say this correctly in ${dialect} ("validTranslations").
58. Provide exactly 3 grammatically correct but semantically DIFFERENT sentences in ${dialect} to act as wrong multiple-choice distractors ("wrongOptions").
59. CRITICAL: The 'dialectPhrase' MUST be the undeniably correct translation of 'englishPhrase'. 
60. Return ONLY valid JSON: {"englishPhrase": "string", "dialectPhrase": "string", "hint": "string", "explanation": "string", "validTranslations": ["string"], "wrongOptions": ["string", "string", "string"]}`
          },
          {
            role: 'user',
            content: `Generate 1 unique simple beginner-level testing module about ${finalTopic}. Ensure it is highly relevant to the unit theme. (Request ID: ${seed})`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 1.0,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
       console.error("Groq API Error:", data.error);
       return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const result = JSON.parse(data.choices[0].message.content);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Internal API Error:", error);
    return NextResponse.json({ error: 'Failed to generate lesson' }, { status: 500 });
  }
}
