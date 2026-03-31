'use client';

import { use } from 'react';
import RichTextEditor from '../../../../components/tala/RichTextEditor';

export default function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <RichTextEditor noteId={id} />;
}
