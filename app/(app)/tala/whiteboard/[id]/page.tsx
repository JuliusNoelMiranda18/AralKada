'use client';

import { use } from 'react';
import WhiteboardEditor from '../../../../components/tala/WhiteboardEditor';

export default function WhiteboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <WhiteboardEditor noteId={id} />;
}
