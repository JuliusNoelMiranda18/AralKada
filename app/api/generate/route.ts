import { NextResponse } from 'next/server';

// ── Mermaid sanitizer ─────────────────────────────────────────────────────────
// Fixes the most common AI-generated Mermaid errors before they reach the client.
function sanitizeMermaid(diagram: string | null | undefined): string | null {
  if (!diagram) return null;

  let d = diagram.trim();

  // 1. Strip any markdown code fences the model may have added
  d = d.replace(/^```(?:mermaid)?\s*/i, '').replace(/\s*```$/i, '').trim();

  // 2. Ensure it starts with a valid graph declaration
  if (!d.match(/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitGraph)/i)) {
    d = 'graph TD\n' + d;
  }

  // 3. Fix rogue characters after closing brackets (e.g. "B[Server]B -->" → "B[Server] -->")
  d = d.replace(/\](.+?)(\s+(-->|---|-\.\->))/g, (match, junk, arrowGroup) => {
    return ']' + arrowGroup;
  });

  // 3b. Fix duplicated node IDs and labels at the end of definitions (e.g. "B[Server]B[Server]")
  d = d.replace(/([A-Za-z0-9_-]+\[[^\]]*\])\s*\1/g, '$1')
       .replace(/([A-Za-z0-9_-]+\(\([^)]*\)\))\s*\1/g, '$1')
       .replace(/([A-Za-z0-9_-]+\{[^}]*\})\s*\1/g, '$1');
  
  // 3c. Fix repeated node IDs after the label (e.g. "E[Chlorophyll]E" or "E[Chlorophyll] E -->")
  d = d.replace(/([A-Za-z0-9_-]+)(\s*(?:\[[^\]]*\]|\([^)]*\)|\(\([^)]*\)\)|\{[^}]*\}))\s*\1\b/g, '$1$2');

  // 3d. Strip any OTHER rogue characters trailing a node declaration at the end of a line
  d = d.replace(/([\]})])\s*[A-Za-z0-9_-]+$/gm, '$1');

  // 3e. Auto-quote labels that contain special characters like parentheses
  d = d.replace(/([A-Za-z0-9_-]+)\[([^"\]]*[\(\)][^"\]]*)\]/g, '$1["$2"]');

  // 4. Fix double spaces in edge labels  -->|  X  | → -->|X|
  d = d.replace(/\|\s{2,}/g, '| ').replace(/\s{2,}\|/g, ' |');

  // 5. Remove unsupported keywords that crash older mermaid parsers
  d = d.replace(/^mindmap\s*\n/i, 'graph TD\n');
  d = d.replace(/^timeline\s*\n/i, 'graph TD\n');

  return d;
}

export async function POST(req: Request) {
  try {
    const { text, prompt, learningStyle, mode } = await req.json();

    let learningStyleContext = '';
    
    if (mode === 'teacher') {
      const style = learningStyle || 'Visual';
      learningStyleContext = `
YOU ARE IN TEACHER MODE. YOUR GOAL IS TO TEACH THE TOPIC: "${prompt}" using the ${style} method.

SPECIFIC METHODS PER STYLE:
- Visual: Use Mind mapping, Graphic organizers, Color coding, Flashcards, Concept mapping, and Timelines.
- Auditory: Use Read aloud scripts, Teach it out loud scenarios, Audio recordings descriptions, Feynman technique, Verbal repetition, and Songs/mnemonics.
- Reading/Writing: Use Active recall, Spaced repetition, Summarizing, Cornell notes, Reflective journaling, and Elaborative interrogation.

${style === 'Visual' ? 'IMPORTANT: You MUST generate a valid Mermaid.js diagram string (flowchart, mindmap, or timeline) based on the topic. Wrap it in the "mermaidDiagram" JSON field.' : ''}
${style === 'Auditory' ? 'Generate a PODCAST SCRIPT where Lilo (the assistant) explains the topic using the Feynman technique. Include realistic timestamps like [00:15].' : ''}
${style === 'Reading/Writing' ? 'Format the teacherContent using the Cornell Notes system (Cues, Notes, Summary).' : ''}
`;
    }

    const systemPrompt = `You are Lilo, a friendly and expert AI study buddy. 
    Analyze the following topic/text and generate a comprehensive study guide in JSON format.
    
    ### STRICT JSON FORMATTING RULES:
    1. Your response MUST be a single, valid JSON object.
    2. DO NOT add extra closing braces "}" at the end of objects inside arrays.
    3. Ensure all strings are properly escaped, especially the "mermaidDiagram" field.
    4. Follow the exact schema below without deviation.

    SPECIAL INSTRUCTIONS FOR MODES:
    ${mode === 'teacher' ? `
    The user is a ${learningStyle} learner. Tailor the 'teacherContent' field EXCLUSIVELY for this style using these scientific sub-methods:
    - Visual: Select the BEST sub-method for the topic:
        * Mind Mapping (ideal for brainstorming/related ideas)
        * Timelines (ideal for history/processes)
        * Concept Mapping (ideal for linking complex theories)
        * Graphic Organizers (ideal for comparisons/charts)
      Provide a 'visualStrategy' field naming the choice, and a 'mermaidDiagram' field with the corresponding Mermaid string.
    - Auditory: Use Feynman Technique (explaining to a child) or Songs/Mnemonics. Use podcast scripts with [00:15] timestamps.
    - Reading/Writing: Use Cornell Notes (Cues, Notes, Summary) or Active Recall/Spaced Repetition formatting.
    ` : 'Balance the content for a general learner.'}

    EXPECTED JSON SCHEMA:
    {
      "outline": ["string", "string"],
      "summary": "string",
      "teacherContent": "string",
      "pedagogicalStrategy": "string",
      "mermaidDiagram": "string or null",
      "sections": [
        {
          "sectionTitle": "string (must exactly match one item from the outline array)",
          "cards": [
            {
              "title": "string (sub-topic title)",
              "content": "string (detailed paragraph explaining this sub-topic)",
              "explainLikeIm5": "string (simple, fun analogy a 5-year-old would understand)",
              "knowledgeCheck": {
                "question": "string",
                "answer": "string"
              }
            }
          ]
        }
      ],
      "flashcards": [{"question": "string", "answer": "string"}],
      "quiz": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string (must exactly match one of the options)",
          "hint": "string (a helpful clue without giving away the answer)",
          "explanation": "string (detailed explanation of WHY the correct answer is right, for use when a user gets it wrong)"
        }
      ]
    }

    Requirements:
    - "outline" must have at least 4-6 items representing major sections.
    - "sections" must have one entry per outline item, with "sectionTitle" matching exactly.
    - Each section's "cards" array MUST have AT LEAST 3 cards.
    - Generate at least 10 flashcards.
    - Generate EXACTLY 10 quiz questions.
    - For each quiz question, "options" must have exactly 4 choices.
    - CRITICAL: ALL 4 OPTIONS MUST BE COMPLETELY UNIQUE AND DISTINCT. No two options may be the same or say essentially the same thing. Each option must test a genuinely different understanding — use specific, plausible distractors that a student might realistically confuse.
    - "correctAnswer" must be the EXACT TEXT of one of the 4 options.
    - "hint" should guide without revealing the answer directly.
    - "explanation" should explain the concept thoroughly for learning purposes.
    - For style=Visual, "mermaidDiagram" MUST be a RAW STRING with NO markdown fences.
    - MERMAID SYNTAX RULES — FOLLOW THESE EXACTLY OR THE DIAGRAM WILL CRASH:
        1. ALWAYS start with \`graph TD\` on its own line. NEVER use \`mindmap\`, \`timeline\`, or any other diagram type keyword.
        2. Each node must follow the pattern: ID[Label] where ID is a single letter or short word (A, B, C, Node1).
        3. NEVER repeat the ID or Label immediately after the closing bracket. WRONG: \`B[Server]B\`, \`B[Server]B[Server]\`. CORRECT: \`B[Server]\`.
        4. Arrows use exactly one of: \`-->\`, \`---\`, or \`-->|label|\`. Do NOT use double spaces inside labels.
        5. Keep all labels short (max 5 words). 
        6. CRITICAL: If a label contains parentheses or commas, you MUST wrap it in double quotes: \`NodeID["Label (with Parens)"]\`.
        7. Each line must contain exactly ONE arrow statement. Do NOT chain multiple arrows on one line.
    - Use clear, professional, yet friendly language.`;

    if (!text && !prompt) {
      return NextResponse.json({ error: 'No text or prompt provided' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not set' }, { status: 500 });
    }

    // Truncate extracted text to stay within Groq's token window (~12k chars ≈ ~3k tokens)
    const MAX_TEXT_CHARS = 12000;
    const truncatedText = text && text.length > MAX_TEXT_CHARS
      ? text.substring(0, MAX_TEXT_CHARS) + '\n\n[Content truncated for length]'
      : text;

    const userMessage = prompt
      ? `Topic: ${prompt}\nMaterial: ${truncatedText || 'N/A'}`
      : `Material: ${truncatedText}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorDetail = errorData?.error?.message || await response.text();
      console.error('Groq Error:', errorDetail);
      return NextResponse.json(
        { error: `Groq API Error: ${errorDetail}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);

    // ── Sanitize Mermaid diagram before returning ──
    if (parsed.mermaidDiagram) {
      parsed.mermaidDiagram = sanitizeMermaid(parsed.mermaidDiagram);
    }

    // ── Backward compat: convert old "lessons" array format ──
    if (parsed.lessons && !parsed.sections) {
      parsed.sections = (parsed.outline || []).map((title: string, i: number) => ({
        sectionTitle: title,
        cards: parsed.lessons.slice(i * 3, i * 3 + 3).length > 0
          ? parsed.lessons.slice(i * 3, i * 3 + 3)
          : [parsed.lessons[i] || parsed.lessons[0]],
      })).filter((s: any) => s.cards.length > 0);
    }

    // ── Ensure every outline section has at least one lesson card ──
    const outline: string[] = parsed.outline || [];
    const sections: any[] = parsed.sections || [];
    if (outline.length > 0) {
      parsed.sections = outline.map((title: string, i: number) => {
        const existing = sections.find(
          (s: any) => s.sectionTitle === title || s.sectionTitle?.includes(title.substring(0, 20))
        ) || sections[i];
        return existing || {
          sectionTitle: title,
          cards: [{
            title: title,
            content: `This section covers: ${title}. Review the material for more details.`,
            explainLikeIm5: `Think of ${title} like a chapter in a book — it has important ideas to learn!`,
            knowledgeCheck: {
              question: `What is the main topic covered in "${title}"?`,
              answer: `The main topic is ${title}.`,
            },
          }],
        };
      });
    }

    // ── Deduplicate quiz options ──
    if (Array.isArray(parsed.quiz)) {
      parsed.quiz = parsed.quiz.map((q: any) => {
        if (!Array.isArray(q.options)) return q;
        const seen = new Set<string>();
        const deduped: string[] = [];
        for (const opt of q.options) {
          const norm = opt.trim().toLowerCase();
          if (!seen.has(norm)) { seen.add(norm); deduped.push(opt); }
        }
        // If duplicates were removed, pad with generic placeholders until we have 4
        const placeholders = ['None of the above', 'All of the above', 'Cannot be determined', 'Insufficient information'];
        let pi = 0;
        while (deduped.length < 4 && pi < placeholders.length) {
          const p = placeholders[pi++];
          if (!seen.has(p.toLowerCase())) { seen.add(p.toLowerCase()); deduped.push(p); }
        }
        return { ...q, options: deduped.slice(0, 4) };
      });
    }

    // ── Warn if quiz has fewer than 10 questions (best-effort, not a failure) ──
    if (!parsed.quiz || parsed.quiz.length < 10) {
      console.warn(`Quiz had only ${parsed.quiz?.length ?? 0} questions (expected 10).`);
    }

    return NextResponse.json(parsed);

  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}


