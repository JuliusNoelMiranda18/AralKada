'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Grid, Plus } from 'lucide-react';
import DrawingToolbar, { DrawTool } from './DrawingToolbar';
import { useNoteStorage } from './useNoteStorage';
import type { NoteItem } from './types';

let fabricModule: any = null;
async function getFabric() {
  if (!fabricModule) fabricModule = await import('fabric');
  return fabricModule;
}

interface WhiteboardEditorProps {
  noteId: string;
}

const HISTORY_LIMIT = 50;

export default function WhiteboardEditor({ noteId }: WhiteboardEditorProps) {
  const router = useRouter();
  const { getItem, updateItem, updatePage } = useNoteStorage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [note, setNote] = useState<NoteItem | null>(null);
  const [title, setTitle] = useState('Untitled Whiteboard');
  const [activeTool, setActiveTool] = useState<DrawTool>('pen');
  const [color, setColor] = useState('#FFFFFF');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [showGrid, setShowGrid] = useState(true);
  const historyRef = useRef<string[]>([]);
  const historyIdxRef = useRef(-1);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const item = getItem(noteId);
    if (item) { setNote(item); setTitle(item.title); }
  }, [noteId, getItem]);

  useEffect(() => {
    if (!canvasRef.current) return;
    getFabric().then(({ Canvas, PencilBrush }) => {
      if (fabricRef.current) fabricRef.current.dispose();
      const fc = new Canvas(canvasRef.current, {
        width: window.innerWidth - 240,
        height: window.innerHeight - 120,
        backgroundColor: 'transparent',
        selection: true,
      });
      fc.freeDrawingBrush = new PencilBrush(fc);
      fc.freeDrawingBrush.color = color;
      fc.freeDrawingBrush.width = strokeWidth;
      fabricRef.current = fc;

      // Load saved content
      const item = getItem(noteId);
      const page = item?.pages?.[0];
      if (page?.fabricJSON) {
        try {
          fc.loadFromJSON(JSON.parse(page.fabricJSON)).then(() => fc.renderAll());
        } catch {}
      }

      const pushHistory = () => {
        const json = JSON.stringify(fc.toJSON());
        historyRef.current = historyRef.current.slice(0, historyIdxRef.current + 1);
        historyRef.current.push(json);
        if (historyRef.current.length > HISTORY_LIMIT) historyRef.current.shift();
        historyIdxRef.current = historyRef.current.length - 1;
      };
      fc.on('object:added', pushHistory);
      fc.on('object:modified', pushHistory);
    });
    return () => { if (fabricRef.current) { fabricRef.current.dispose(); fabricRef.current = null; } };
    // eslint-disable-next-line
  }, [noteId]);

  // Tool effect
  useEffect(() => {
    const fc = fabricRef.current;
    if (!fc) return;
    getFabric().then(({ PencilBrush }) => {
      if (activeTool === 'pen') {
        fc.isDrawingMode = true;
        fc.freeDrawingBrush = new PencilBrush(fc);
        fc.freeDrawingBrush.color = color;
        fc.freeDrawingBrush.width = strokeWidth;
      } else if (activeTool === 'highlighter') {
        fc.isDrawingMode = true;
        fc.freeDrawingBrush = new PencilBrush(fc);
        fc.freeDrawingBrush.color = color + '66';
        fc.freeDrawingBrush.width = strokeWidth * 3;
      } else if (activeTool === 'eraser') {
        fc.isDrawingMode = true;
        fc.freeDrawingBrush = new PencilBrush(fc);
        fc.freeDrawingBrush.color = '#111519';
        fc.freeDrawingBrush.width = strokeWidth * 3;
      } else {
        fc.isDrawingMode = false;
        fc.selection = true;
      }
    });
  }, [activeTool, color, strokeWidth]);

  const save = useCallback(() => {
    const fc = fabricRef.current;
    if (!fc) return;
    const note = getItem(noteId);
    const page = note?.pages?.[0];
    if (page) updatePage(noteId, page.id, JSON.stringify(fc.toJSON()), fc.toDataURL({ format: 'png', quality: 0.4 }));
  }, [getItem, noteId, updatePage]);

  const undo = useCallback(async () => {
    const fc = fabricRef.current;
    if (!fc || historyIdxRef.current <= 0) return;
    historyIdxRef.current--;
    await fc.loadFromJSON(JSON.parse(historyRef.current[historyIdxRef.current]));
    fc.renderAll();
    save(); // Instant sync
  }, [save]);

  const redo = useCallback(async () => {
    const fabric = fabricRef.current;
    if (!fabric || historyIdxRef.current >= historyRef.current.length - 1) return;
    historyIdxRef.current++;
    await fabric.loadFromJSON(JSON.parse(historyRef.current[historyIdxRef.current]));
    fabric.renderAll();
    save(); // Instant sync
  }, [save]);

  useEffect(() => {
    saveTimer.current = setInterval(save, 3000);
    return () => { if (saveTimer.current) clearInterval(saveTimer.current); };
  }, [save]);

  const handleImageUpload = useCallback(async (file: File) => {
    const fc = fabricRef.current;
    if (!fc) return;
    const fabric = await getFabric();
    const url = URL.createObjectURL(file);
    const img = await fabric.FabricImage.fromURL(url);
    const scale = Math.min(400 / (img.width || 400), 300 / (img.height || 300));
    img.scale(scale);
    img.set({ left: 50, top: 50 });
    fc.add(img);
    fc.setActiveObject(img);
    fc.renderAll();
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--pal-bone)' }}>
      {/* Top bar */}
      <div className="flex items-center px-4 py-2 gap-3 flex-shrink-0"
        style={{ background: 'var(--pal-tan)', borderBottom: '2px solid var(--pal-cafenoir)' }}>
        <button onClick={() => { save(); router.push('/tala'); }}
          className="w-8 h-8 rounded-lg flex items-center justify-center border-2 border-pal-cafenoir"
          style={{ background: 'var(--pal-paper)', color: 'var(--pal-cafenoir)' }}>
          <ArrowLeft size={16} />
        </button>
        <input value={title} onChange={e => { setTitle(e.target.value); updateItem(noteId, { title: e.target.value }); }}
          className="flex-1 bg-transparent text-sm font-black outline-none" style={{ color: 'var(--pal-cafenoir)' }} />
        <button onClick={() => setShowGrid(g => !g)}
          className="w-8 h-8 rounded-lg flex items-center justify-center border-2 border-pal-cafenoir"
          style={{ background: showGrid ? 'var(--pal-bone)' : 'var(--pal-paper)', color: 'var(--pal-cafenoir)' }}>
          <Grid size={16} />
        </button>
        <button onClick={save}
          className="px-3 py-1.5 rounded-lg text-xs font-black uppercase border-2"
          style={{ background: 'var(--duo-green)', color: '#fff', borderColor: 'var(--pal-cafenoir)' }}>
          Save
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex justify-center px-4 pt-3 pb-2 flex-shrink-0">
        <DrawingToolbar
          activeTool={activeTool} onToolChange={setActiveTool}
          color={color} onColorChange={setColor}
          strokeWidth={strokeWidth} onStrokeWidthChange={setStrokeWidth}
          onUndo={undo} onRedo={redo}
          onImageUpload={handleImageUpload}
          canUndo={historyIdxRef.current > 0}
          canRedo={historyIdxRef.current < historyRef.current.length - 1}
        />
      </div>

      {/* Canvas — fills remaining space */}
      <div className="flex-1 overflow-hidden relative" ref={containerRef}>
        {/* Dot grid background */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'radial-gradient(circle, var(--pal-cafenoir) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            opacity: 0.1,
          }} />
        )}
        <canvas ref={canvasRef} className="absolute inset-0" />
      </div>
    </div>
  );
}
