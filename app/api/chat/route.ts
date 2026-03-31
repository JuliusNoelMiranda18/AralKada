import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, documentContext, learningStyle } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages must be a valid array' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not set' }, { status: 500 });
    }

    const learningStyleContext = learningStyle ? `
TAILOR CONVERSATION FOR: ${learningStyle} Learner.
${learningStyle === 'Visual' ? 'Use analogies that are easy to visualize and describe things in a structured, observable way.' : ''}
${learningStyle === 'Auditory' ? 'Use conversational and rhythmic language. Explain as if you are telling a story.' : ''}
${learningStyle === 'Reading/Writing' ? 'Use precise vocabulary and well-structured, logical explanations with lists where helpful.' : ''}
${learningStyle === 'Kinesthetic' ? 'Focus on practical application, "how-to" steps, and real-world experiments/scenarios.' : ''}
` : '';

    const systemPromptMessage = {
      role: 'system',
      content: `You are an AI Study Buddy mascot named Cardo holding a conversation with a student.
Use ONLY the context provided below to answer the user's questions. Do NOT hallucinate or bring in outside information. 
If the answer is not contained primarily within the context, inform the user kindly. Keep answers concise.
Explain clearly and simply like a helpful companion.
${learningStyleContext}

CONVTEXT / STUDY MATERIAL:
${documentContext || 'None provided.'}`
    };

    const groqMessages = [systemPromptMessage, ...messages];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: groqMessages,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Groq Chat API Error:', errorData);
      return NextResponse.json({ error: 'Failed to get chat response' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ message: data.choices[0].message });
  } catch (error: any) {
    console.error('Error in chat route:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
