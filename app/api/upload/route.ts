import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const type = file.type;
    const name = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());

    let extractedText = '';

    if (type === 'application/pdf' || name.endsWith('.pdf')) {
      const PDFParser = require('pdf2json');
      extractedText = await new Promise<string>((resolve, reject) => {
        const pdfParser = new PDFParser(null, 1);
        pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", () => resolve(pdfParser.getRawTextContent()));
        pdfParser.parseBuffer(buffer);
      });
    } else if (
      name.endsWith('.ppt') || 
      name.endsWith('.pptx') || 
      type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      type === 'application/vnd.ms-powerpoint'
    ) {
      // officeparser requires a file path, so we write the buffer to a temp file
      const tempPath = path.join(os.tmpdir(), `temp-${Date.now()}-${name}`);
      fs.writeFileSync(tempPath, buffer);
      
      try {
        const officeParser = require('officeparser');
        extractedText = await officeParser.parseOfficeAsync(tempPath);
      } finally {
        fs.unlinkSync(tempPath);
      }
    } else {
      return NextResponse.json({ error: 'Unsupported file type. Please upload a PDF or PPT/PPTX file.' }, { status: 400 });
    }

    return NextResponse.json({ text: extractedText });
  } catch (error: any) {
    console.error('Error parsing file:', error);
    return NextResponse.json({ error: error.message || 'Error parsing file' }, { status: 500 });
  }
}
