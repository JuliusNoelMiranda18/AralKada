/**
 * parse-exam.mjs
 *
 * Extracts questions from a PDF exam file and uses Groq to structure them
 * into a JSON format compatible with the mock exam system.
 *
 * Usage:
 *   node scripts/parse-exam.mjs <exam-id> <path-to-pdf> [options]
 *
 * Examples:
 *   node scripts/parse-exam.mjs ustet-english-2014 "public/Exams/USTET/[USTET 2014] English Proficiency.pdf"
 *   node scripts/parse-exam.mjs ustet-english-2014 "public/Exams/USTET/[USTET 2014] English Proficiency.pdf" --answer-key "public/Exams/USTET/[USTET 2014] Simulated Exam Answer Key.pdf"
 *
 * Options:
 *   --answer-key <path>   Path to a separate answer key PDF
 *   --name <string>       Human-readable exam name (default: derived from id)
 *   --duration <minutes>  Exam duration in minutes (default: 60)
 *   --subject <string>    Subject label
 *   --max-q <number>      Max questions to ask Groq to extract (default: 100)
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import PDFParser from 'pdf2json';
import officeParser from 'officeparser';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ─── Args ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node scripts/parse-exam.mjs <exam-id> <pdf-path> [--answer-key <path>] [--name <name>] [--duration <mins>] [--subject <label>] [--max-q <number>]');
  process.exit(1);
}

const examId   = args[0];
const pdfPath  = path.resolve(ROOT, args[1]);

const getFlag = (flag, defaultVal = null) => {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : defaultVal;
};

const answerKeyPath = getFlag('--answer-key') ? path.resolve(ROOT, getFlag('--answer-key')) : null;
const examName      = getFlag('--name', examId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
const duration      = parseInt(getFlag('--duration', '60'), 10);
const subject       = getFlag('--subject', 'General');
const maxQ          = parseInt(getFlag('--max-q', '100'), 10);

const outputPath = path.resolve(ROOT, `data/exams/processed/${examId}.json`);

// ─── Check if already exists ────────────────────────────────────────────────
if (fs.existsSync(outputPath)) {
  console.log(`⚠️  Output already exists: ${outputPath}`);
  console.log('   Delete it first if you want to re-process.');
  process.exit(0);
}

// ─── PDF Text Extraction ────────────────────────────────────────────────────
async function extractTextFromPDF(filePath) {
  // Try officeParser first (usually more robust for text)
  try {
    const text = await officeParser.parseAsync(filePath);
    if (text && text.trim().length > 100) {
      console.log('   ✅ Extracted text via officeparser');
      return text;
    }
  } catch (e) {
    console.warn('   ⚠️  officeparser failed, trying pdf2json...');
  }

  // Fallback to pdf2json
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, 1);
    pdfParser.on('pdfParser_dataError', err => reject(err.parserError));
    pdfParser.on('pdfParser_dataReady', () => {
      const rawText = pdfParser.getRawTextContent();
      if (rawText && rawText.trim().length > 100) {
        console.log('   ✅ Extracted text via pdf2json');
      }
      resolve(rawText);
    });
    pdfParser.loadPDF(filePath);
  });
}

// ─── Groq API ───────────────────────────────────────────────────────────────
async function callGroq(systemPrompt, userContent, jsonMode = true, retries = 3) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not found in environment. Create a .env.local file.');

  const body = {
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userContent },
    ],
    temperature: 0.1,
    max_tokens: 8000,
  };
  if (jsonMode) body.response_format = { type: 'json_object' };

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get('retry-after') || '20', 10);
        console.warn(`   ⚠️  Rate limited (429). Waiting ${retryAfter}s...`);
        await new Promise(r => setTimeout(r, (retryAfter + 2) * 1000));
        continue;
      }

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Groq API error ${res.status}: ${err}`);
      }

      const data = await res.json();
      return data.choices[0].message.content;
    } catch (e) {
      if (attempt === retries) throw e;
      console.warn(`   ⚠️  Attempt ${attempt + 1} failed: ${e.message}. Retrying...`);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

// ─── Chunk text for large PDFs ──────────────────────────────────────────────
function chunkText(text, maxChars = 12000) {
  const chunks = [];
  for (let i = 0; i < text.length; i += maxChars) {
    chunks.push(text.slice(i, i + maxChars));
  }
  return chunks;
}

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
  // Load env files manually
  const envFiles = ['.env.local', '.env'];
  for (const f of envFiles) {
    const p = path.resolve(ROOT, f);
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf-8');
      for (const line of content.split('\n')) {
        const [key, ...rest] = line.split('=');
        if (key && rest.length) {
          const k = key.trim();
          if (!process.env[k]) process.env[k] = rest.join('=').trim().replace(/^["']|["']$/g, '');
        }
      }
    }
  }

  console.log(`\n🔍 Parsing: ${path.basename(pdfPath)}`);
  console.log(`   ID: ${examId} | Duration: ${duration}min | Max questions: ${maxQ}`);

  // 1. Extract text
  console.log('\n📄 Extracting PDF text...');
  let examText;
  try {
    examText = await extractTextFromPDF(pdfPath);
  } catch (e) {
    console.error('❌ Failed to extract PDF text:', e.message);
    process.exit(1);
  }
  console.log(`   Extracted ${examText.length.toLocaleString()} characters`);

  let answerKeyText = '';
  if (answerKeyPath) {
    console.log('\n📄 Extracting answer key PDF...');
    try {
      answerKeyText = await extractTextFromPDF(answerKeyPath);
      console.log(`   Extracted ${answerKeyText.length.toLocaleString()} characters from answer key`);
    } catch (e) {
      console.warn('⚠️  Could not extract answer key:', e.message);
    }
  }

  // 2. Ask Groq to structure questions
  console.log('\n🤖 Sending to Groq for structuring...');

  const SYSTEM_PROMPT = `You are an expert Philippine college entrance exam parser.
Your job is to extract multiple-choice questions from raw PDF text and return them as structured JSON.

RULES:
- Extract ALL multiple-choice questions you can find in the text.
- Each question must have EXACTLY 4 options (A, B, C, D).
- The "answer" field must be a single uppercase letter: "A", "B", "C", or "D".
- If you cannot determine the correct answer from the text, use your knowledge of the subject.
- The "explanation" field must be a concise 1-2 sentence explanation of why the answer is correct.
- If a question references a diagram/figure/table that isn't in the text, set "hasDiagram": true.
- Clean up any OCR artifacts or formatting issues in the question text.
- Do NOT include instructions, directions, or non-question content.
- Limit to ${maxQ} questions maximum.

Return ONLY a valid JSON object with this exact structure:
{
  "questions": [
    {
      "id": 1,
      "text": "Full question text here",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "answer": "A",
      "explanation": "Brief explanation of the correct answer.",
      "hasDiagram": false
    }
  ]
}`;

  const chunks = chunkText(examText, 14000);
  let allQuestions = [];

  for (let i = 0; i < chunks.length; i++) {
    if (allQuestions.length >= maxQ) break;
    console.log(`   Processing chunk ${i + 1}/${chunks.length}...`);
    
    const answerContext = answerKeyText
      ? `\n\nANSWER KEY (use this to fill in correct answers):\n${answerKeyText.slice(0, 3000)}`
      : '';
    
    const userContent = `Extract all multiple-choice questions from this exam text chunk:

EXAM TEXT (chunk ${i + 1}/${chunks.length}):
${chunks[i]}${answerContext}

Return the questions as JSON.`;

    try {
      const raw = await callGroq(SYSTEM_PROMPT, userContent, true);
      const parsed = JSON.parse(raw);
      
      if (parsed.questions && Array.isArray(parsed.questions)) {
        const newQ = parsed.questions.filter(q => 
          q.text && q.options && q.options.length === 4 && q.answer
        );
        allQuestions.push(...newQ);
        console.log(`   ✅ Found ${newQ.length} questions in chunk ${i + 1}`);
      }
    } catch (e) {
      console.warn(`   ⚠️  Chunk ${i + 1} failed: ${e.message}`);
    }

    // Small delay to avoid rate limiting
    if (i < chunks.length - 1) {
      await new Promise(r => setTimeout(r, 10000));
    }
  }

  // Deduplicate and re-number by text similarity
  const seen = new Set();
  const deduped = [];
  for (const q of allQuestions) {
    const key = q.text.slice(0, 60).toLowerCase().replace(/\s+/g, ' ');
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(q);
    }
  }

  // Re-number IDs sequentially
  const finalQuestions = deduped.slice(0, maxQ).map((q, i) => ({
    ...q,
    id: i + 1,
    answer: q.answer.toUpperCase().charAt(0),
    hasDiagram: q.hasDiagram ?? false,
  }));

  console.log(`\n✅ Total unique questions extracted: ${finalQuestions.length}`);

  if (finalQuestions.length === 0) {
    console.error('❌ No questions were extracted. The PDF might be scanned/image-based.');
    console.error('   Try a different PDF or manually create the JSON.');
    process.exit(1);
  }

  // 3. Build final JSON
  const output = {
    id: examId,
    name: examName,
    subject,
    durationMinutes: duration,
    totalQuestions: finalQuestions.length,
    questions: finalQuestions,
  };

  // 4. Save
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`\n🎉 Saved to: ${outputPath}`);
  console.log(`   ${finalQuestions.length} questions | ${duration} minutes`);
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
