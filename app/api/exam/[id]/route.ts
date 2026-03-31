import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Sanitize to prevent path traversal
  const safeId = id.replace(/[^a-z0-9-]/gi, '');
  if (!safeId) {
    return NextResponse.json({ error: 'Invalid exam ID' }, { status: 400 });
  }

  const filePath = path.resolve(process.cwd(), `data/exams/processed/${safeId}.json`);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json(
      { error: `Exam "${safeId}" has not been processed yet. Run: node scripts/parse-exam.mjs ${safeId} <pdf-path>` },
      { status: 404 }
    );
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to read exam data' }, { status: 500 });
  }
}
