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
    const { degree } = await req.json();

    if (!degree || degree === 'All') {
      return NextResponse.json({ error: 'Degree is required' }, { status: 400 });
    }

    const systemPrompt = `You are a Philippine Scholarship expert database. 
Your goal is to provide a list of 9 realistic, specific scholarships available in the Philippines that apply heavily to the degree field provided by the user. 
Include niche, private, corporate, or specific university-bound scholarships. 
Provide a mix of well-known and hyper-niche options.
Return ONLY a valid JSON object matching this structure EXACTLY. Do not use markdown wrappers (\`\`\`json).
{
  "scholarships": [
    {
      "id": "string (unique kebab-case)",
      "name": "string (Title of Scholarship)",
      "provider": "string (Organization or Agency Name)",
      "description": "string (Short highly compelling description)",
      "tier": "string (e.g. 'CORPORATE', 'GOVERNMENT', 'PRIVATE', 'NGO')",
      "iconIcon": "string (Must be one of: 'flask-conical', 'building', 'briefcase', 'landmark', 'graduation-cap', 'globe', 'building-2', 'microscope')",
      "supportedDegrees": ["string (The specific field requested, plus others)"],
      "assessmentType": "string (Must be one of: 'Exam', 'Interview', 'Grade Evaluation', 'Exam & Interview', 'Grades & Interview')",
      "financialAid": "string (Short string e.g., 'Full Tuition + ₱5k stipend')",
      "eligibilityRequirements": [
        { "item": "string (Requirement 1)" },
        { "item": "string (Requirement 2)" }
      ],
      "termsAndConditions": [
        "string (Condition 1)",
        "string (Condition 2)"
      ]
    }
  ]
}
`;

    const userPrompt = `Provide 9 specific Philippine scholarships for this degree field: ${degree}`;

    const chatCompletion = await getGroqClient().chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.4,
      response_format: { type: 'json_object' }
    });

    const content = chatCompletion.choices[0]?.message?.content;
    
    if (!content) throw new Error('Empty response from Groq');

    const data = JSON.parse(content);
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Scholarships API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch scholarships' },
      { status: 500 }
    );
  }
}
