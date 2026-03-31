'use client';

import { use } from 'react';
import PDFAnnotator from '../../../../components/tala/PDFAnnotator';

export default function PDFPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <PDFAnnotator noteId={id} />;
}
