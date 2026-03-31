import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.GROQ_API_KEY?.replace(/["']/g, '').trim();

if (!apiKey) {
  console.error('ERROR: GROQ_API_KEY not found in .env');
  process.exit(1);
}

const groq = new Groq({ apiKey });

async function test() {
  console.log('Testing Groq API Key...');
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Say "Working!"' }],
      model: 'llama-3.3-70b-versatile',
    });
    console.log('RESULT:', chatCompletion.choices[0]?.message?.content);
    console.log('SUCCESS: API Key is working!');
  } catch (error) {
    console.error('FAILURE: API Key check failed.');
    console.error('Error details:', error.message);
    if (error.status === 401) {
      console.error('Suggestion: The API key appears to be invalid (Unauthorized).');
    }
  }
}

test();
