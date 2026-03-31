'use client';

import { use } from 'react';
import CanvasEditor from '../../../../components/tala/CanvasEditor';

export default function NotebookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <CanvasEditor noteId={id} />;
}
