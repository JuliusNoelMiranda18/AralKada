'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, AlertCircle, ZoomIn, ZoomOut } from 'lucide-react';
import DrawingToolbar, { DrawTool, EraserMode } from './DrawingToolbar';
import { useNoteStorage } from './useNoteStorage';
import type { NoteItem } from './types';

let fabricModule: any = null;
async function getFabric() {
  if (!fabricModule) fabricModule = await import('fabric');
  return fabricModule;
}

let pdfjsModule: any = null;
async function getPDFJS() {
  if (!pdfjsModule) {
    const lib = await import('pdfjs-dist');
    lib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    pdfjsModule = lib;
  }
  return pdfjsModule;
}

function loadFromStorage(id: string): NoteItem | null {
  try {
    const all: NoteItem[] = JSON.parse(localStorage.getItem('aralkada-tala') || '[]');
    return all.find(i => i.id === id) ?? null;
  } catch { return null; }
}

// Shared eraser helpers — work on any Fabric canvas instance
function circleCursor(radius: number) {
  const r = Math.max(4, radius);
  const d = r * 2 + 4;
  return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${d}' height='${d}'%3E%3Ccircle cx='${r + 2}' cy='${r + 2}' r='${r}' fill='none' stroke='%23888' stroke-width='1.5'/%3E%3C/svg%3E") ${r + 2} ${r + 2}, crosshair`;
}

/** Standard eraser: remove objects whose bounding rect overlaps eraser circle */
function standardErase(fc: any, pointer: { x: number; y: number }, radius: number) {
  const objects = [...fc.getObjects()];
  let changed = false;
  for (const obj of objects) {
    const b = obj.getBoundingRect(true);
    const cx = Math.max(b.left, Math.min(pointer.x, b.left + b.width));
    const cy = Math.max(b.top,  Math.min(pointer.y, b.top  + b.height));
    const dist = Math.sqrt((cx - pointer.x) ** 2 + (cy - pointer.y) ** 2);
    if (dist <= radius) { fc.remove(obj); changed = true; }
  }
  if (changed) fc.renderAll();
}

/** Stroke eraser: remove the ENTIRE object whose bounding rect contains pointer */
function strokeErase(fc: any, pointer: { x: number; y: number }) {
  const objects = [...fc.getObjects()];
  let changed = false;
  for (const obj of objects) {
    const b = obj.getBoundingRect(true);
    if (pointer.x >= b.left && pointer.x <= b.left + b.width &&
        pointer.y >= b.top  && pointer.y <= b.top  + b.height) {
      fc.remove(obj); changed = true;
    }
  }
  if (changed) fc.renderAll();
}

/** Apply the active tool/color/stroke to a Fabric canvas instance */
async function applyTool(fc: any, tool: DrawTool, erMode: EraserMode, color: string, sw: number) {
  if (!fc) return;
  const { PencilBrush } = await getFabric();
  switch (tool) {
    case 'pen':
      fc.isDrawingMode = true; fc.selection = false;
      fc.freeDrawingBrush = new PencilBrush(fc);
      fc.freeDrawingBrush.color = color;
      fc.freeDrawingBrush.width = sw;
      fc.defaultCursor = 'crosshair';
      break;
    case 'highlighter':
      fc.isDrawingMode = true; fc.selection = false;
      fc.freeDrawingBrush = new PencilBrush(fc);
      fc.freeDrawingBrush.color = color + '55';
      fc.freeDrawingBrush.width = sw * 4;
      fc.defaultCursor = 'crosshair';
      break;
    case 'eraser':
      if (erMode === 'standard') {
        fc.isDrawingMode = true; fc.selection = false;
        try {
          const eb = new (fabricModule as any).EraserBrush(fc);
          eb.width = sw * 4;
          fc.freeDrawingBrush = eb;
        } catch {
          fc.freeDrawingBrush = new PencilBrush(fc);
          fc.freeDrawingBrush.color = 'rgba(0,0,0,0)';
          fc.freeDrawingBrush.width = sw * 4;
        }
        fc.defaultCursor = circleCursor(sw * 2);
      } else {
        fc.isDrawingMode = false; fc.selection = false;
        fc.defaultCursor = circleCursor(sw * 2);
      }
      break;
    case 'select':
      fc.isDrawingMode = false; fc.selection = true;
      fc.defaultCursor = 'default';
      break;
    default:
      fc.isDrawingMode = false; fc.selection = true;
      fc.defaultCursor = 'default';
  }
}

interface PDFAnnotatorProps { noteId: string; }

export default function PDFAnnotator({ noteId }: PDFAnnotatorProps) {
  const router = useRouter();
  const { updatePDFAnnotation } = useNoteStorage();

  const [title, setTitle] = useState('PDF');
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [noteItem, setNoteItem] = useState<NoteItem | null>(null);
  const [scale, setScale] = useState(1.5);
  const scaleRef = useRef(1.5);

  const [activeTool, setActiveTool] = useState<DrawTool>('pen');
  const activeToolRef = useRef<DrawTool>('pen');
  const [eraserMode, setEraserMode] = useState<EraserMode>('stroke');
  const eraserModeRef = useRef<EraserMode>('stroke');
  const [color, setColor] = useState('#FF4B4B');
  const colorRef = useRef('#FF4B4B');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const strokeWidthRef = useRef(3);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // All page Fabric instances (keyed by pageNum)
  const fabricMap = useRef<Map<number, any>>(new Map());
  const historyMap = useRef<Map<number, { stack: string[]; idx: number }>>(new Map());

  useEffect(() => { activeToolRef.current = activeTool; notifyToolChange(); }, [activeTool]);
  useEffect(() => { eraserModeRef.current = eraserMode; notifyToolChange(); }, [eraserMode]);
  useEffect(() => { colorRef.current = color; notifyToolChange(); }, [color]);
  useEffect(() => { strokeWidthRef.current = strokeWidth; notifyToolChange(); }, [strokeWidth]);

  const notifyToolChange = () => {
    fabricMap.current.forEach(fc => applyTool(fc, activeToolRef.current, eraserModeRef.current, colorRef.current, strokeWidthRef.current));
  };

  const refreshUR = useCallback((pageNum: number) => {
    const h = historyMap.current.get(pageNum);
    if (h) {
      setCanUndo(h.idx > 0);
      setCanRedo(h.idx < h.stack.length - 1);
    } else {
      setCanUndo(false);
      setCanRedo(false);
    }
  }, []);

  useEffect(() => {
    refreshUR(currentPage);
  }, [currentPage, refreshUR]);

  // ── LOAD PDF ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const item = loadFromStorage(noteId);
    if (!item || !item.pdfData) {
      setError('PDF not found. Please re-import the file.');
      setLoading(false);
      return;
    }
    setNoteItem(item);
    setTitle(item.title);

    getPDFJS().then(async (lib) => {
      try {
        const raw = item.pdfData!;
        const base64 = raw.includes(',') ? raw.split(',')[1] : raw;
        const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const doc = await lib.getDocument({ data: bytes }).promise;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setError('Failed to load PDF. It may be corrupted or too large.');
        setLoading(false);
      }
    });
  }, [noteId]);

  // ── Register fabric instance from child ───────────────────────────────────
  const onPageFabricReady = useCallback((pageNum: number, fc: any) => {
    fabricMap.current.set(pageNum, fc);
    historyMap.current.set(pageNum, { stack: [JSON.stringify(fc.toJSON())], idx: 0 });
    // Apply current tool
    applyTool(fc, activeToolRef.current, eraserModeRef.current, colorRef.current, strokeWidthRef.current);
    
    // Register events
    let isHistoryLock = false; // Prevent pushing during undo/redo

    const pushHistory = () => {
      if (isHistoryLock) return;
      const h = historyMap.current.get(pageNum)!;
      h.stack = h.stack.slice(0, h.idx + 1);
      h.stack.push(JSON.stringify(fc.toJSON()));
      if (h.stack.length > 50) h.stack.shift();
      h.idx = h.stack.length - 1;
      historyMap.current.set(pageNum, h);
      refreshUR(pageNum);
    };
    fc.on('object:added', pushHistory);
    fc.on('object:modified', pushHistory);
    fc.on('object:removed', pushHistory);

    // Store the lock setter on the fabric instance so undo/redo can access it
    (fc as any)._setIsHistoryLock = (val: boolean) => { isHistoryLock = val; };

    // Eraser mouse events
    let isErasing = false;
    const onDown  = () => { if (activeToolRef.current === 'eraser' && eraserModeRef.current === 'stroke') isErasing = true; };
    const onUp    = () => { isErasing = false; };
    const onMove  = (opt: any) => {
      if (!isErasing || activeToolRef.current !== 'eraser' || eraserModeRef.current !== 'stroke') return;
      const pointer = fc.getPointer(opt.e);
      strokeErase(fc, pointer);
    };
    fc.on('mouse:down', onDown);
    fc.on('mouse:up', onUp);
    fc.on('mouse:move', onMove);

    // Autosave
    const timer = setInterval(() => {
      try { updatePDFAnnotation(noteId, pageNum, JSON.stringify(fc.toJSON())); } catch {}
    }, 5000);
    return () => { clearInterval(timer); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId, updatePDFAnnotation]);

  // ── Undo / Redo ───────────────────────────────────────────────────────────
  const undo = useCallback(async () => {
    const fc = fabricMap.current.get(currentPage);
    const h = historyMap.current.get(currentPage);
    if (!fc || !h || h.idx <= 0) return;
    h.idx--;
    
    if ((fc as any)._setIsHistoryLock) (fc as any)._setIsHistoryLock(true);
    await fc.loadFromJSON(JSON.parse(h.stack[h.idx])); 
    fc.renderAll();
    if ((fc as any)._setIsHistoryLock) (fc as any)._setIsHistoryLock(false);
    
    setCanUndo(h.idx > 0); setCanRedo(true);
    // Instant sync
    try { updatePDFAnnotation(noteId, currentPage, h.stack[h.idx]); } catch {}
  }, [currentPage, noteId, updatePDFAnnotation]);

  const redo = useCallback(async () => {
    const fc = fabricMap.current.get(currentPage);
    const h = historyMap.current.get(currentPage);
    if (!fc || !h || h.idx >= h.stack.length - 1) return;
    h.idx++;
    
    if ((fc as any)._setIsHistoryLock) (fc as any)._setIsHistoryLock(true);
    await fc.loadFromJSON(JSON.parse(h.stack[h.idx])); 
    fc.renderAll();
    if ((fc as any)._setIsHistoryLock) (fc as any)._setIsHistoryLock(false);
    
    setCanRedo(h.idx < h.stack.length - 1); setCanUndo(true);
    // Instant sync
    try { updatePDFAnnotation(noteId, currentPage, h.stack[h.idx]); } catch {}
  }, [currentPage, noteId, updatePDFAnnotation]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
      if (e.ctrlKey && (e.key === 'y' || e.key === 'Y')) { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  // ── Zoom ──────────────────────────────────────────────────────────────────
  const changeScale = (delta: number) => {
    const ns = Math.max(0.5, Math.min(scaleRef.current + delta, 3));
    scaleRef.current = ns;
    setScale(ns);
  };

  const saveAll = () => {
    fabricMap.current.forEach((fc, pn) => {
      try { updatePDFAnnotation(noteId, pn, JSON.stringify(fc.toJSON())); } catch {}
    });
  };

  useEffect(() => () => { saveAll(); fabricMap.current.forEach(fc => { try { fc.dispose(); } catch {} }); }, []);

  if (error) return (
    <div className="flex h-screen items-center justify-center flex-col gap-4" style={{ background: 'var(--pal-bone)' }}>
      <AlertCircle size={40} style={{ color: '#FF4B4B' }} />
      <p className="text-sm text-center max-w-xs font-bold" style={{ color: 'var(--pal-moss)' }}>{error}</p>
      <button onClick={() => router.push('/tala')} className="px-6 py-2 rounded-xl font-black text-xs uppercase tracking-wider border-2" style={{ background: 'var(--duo-green)', color: '#fff', borderColor: 'var(--pal-cafenoir)' }}>Back to Tala</button>
    </div>
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--pal-bone)' }}>
      {/* Top bar */}
      <div className="flex items-center px-4 py-2 gap-3 flex-shrink-0"
        style={{ background: 'var(--pal-tan)', borderBottom: '2px solid var(--pal-cafenoir)', minHeight: 48 }}>
        <motion.button 
          onClick={() => { saveAll(); router.push('/tala'); }}
          className="w-8 h-8 rounded-lg flex items-center justify-center border-2 border-pal-cafenoir"
          style={{ background: 'var(--pal-paper)', color: 'var(--pal-cafenoir)' }}
          whileHover={{ scale: 1.1, background: 'var(--pal-bone)' }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft size={16} />
        </motion.button>
        <span className="flex-1 text-sm font-black truncate" style={{ color: 'var(--pal-cafenoir)' }}>{title}</span>
        <motion.button 
          onClick={() => changeScale(-0.25)} 
          className="w-8 h-8 rounded-lg flex items-center justify-center border-2 border-pal-cafenoir" 
          style={{ background: 'var(--pal-paper)', color: 'var(--pal-cafenoir)' }}
          whileHover={{ scale: 1.1, background: 'var(--pal-bone)' }}
          whileTap={{ scale: 0.9 }}
        >
          <ZoomOut size={14} />
        </motion.button>
        <span className="text-xs font-black w-12 text-center" style={{ color: 'var(--pal-cafenoir)' }}>{Math.round(scale * 100)}%</span>
        <motion.button 
          onClick={() => changeScale(0.25)} 
          className="w-8 h-8 rounded-lg flex items-center justify-center border-2 border-pal-cafenoir" 
          style={{ background: 'var(--pal-paper)', color: 'var(--pal-cafenoir)' }}
          whileHover={{ scale: 1.1, background: 'var(--pal-bone)' }}
          whileTap={{ scale: 0.9 }}
        >
          <ZoomIn size={14} />
        </motion.button>
        <span className="text-xs font-black" style={{ color: 'var(--pal-moss)' }}>{currentPage} / {totalPages || '…'}</span>
        <motion.button 
          onClick={saveAll}
          className="px-3 py-1.5 rounded-lg text-xs font-black uppercase border-2"
          style={{ background: 'var(--duo-green)', color: '#fff', borderColor: 'var(--pal-cafenoir)' }}
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.95 }}
        >
          Save
        </motion.button>
      </div>

      {/* Toolbar */}
      <div className="flex justify-center px-4 pt-3 pb-2 flex-shrink-0">
        <DrawingToolbar
          activeTool={activeTool} onToolChange={setActiveTool}
          color={color} onColorChange={setColor}
          strokeWidth={strokeWidth} onStrokeWidthChange={setStrokeWidth}
          onUndo={undo} onRedo={redo}
          canUndo={canUndo} canRedo={canRedo}
          eraserMode={eraserMode} onEraserModeChange={setEraserMode}
        />
      </div>

      {/* Continuous scroll viewer */}
      <div className="flex-1 overflow-y-auto" style={{ background: 'var(--pal-bone)' }}>
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-20" style={{ color: 'var(--pal-moss)' }}>
            <Loader2 size={28} className="animate-spin" />
            <span className="text-sm font-bold">Loading PDF…</span>
          </div>
        ) : (
          <div className="flex flex-col items-center py-6 gap-4">
            {pdfDoc && noteItem && Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <PDFPage
                key={`${pageNum}-${scale}`}
                pageNum={pageNum}
                totalPages={totalPages}
                pdfDoc={pdfDoc}
                noteItem={noteItem}
                scale={scale}
                noteId={noteId}
                onFabricReady={onPageFabricReady}
                onVisible={() => setCurrentPage(pageNum)}
                updatePDFAnnotation={updatePDFAnnotation}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Self-contained PDF page component ────────────────────────────────────────
function PDFPage({ pageNum, totalPages, pdfDoc, noteItem, scale, noteId, onFabricReady, onVisible, updatePDFAnnotation }: {
  pageNum: number;
  totalPages: number;
  pdfDoc: any;
  noteItem: NoteItem;
  scale: number;
  noteId: string;
  onFabricReady: (n: number, fc: any) => void;
  onVisible: () => void;
  updatePDFAnnotation: (id: string, page: number, json: string) => void;
}) {
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const annotContainerRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const fcRef = useRef<any>(null);

  // Intersection observer for page tracking
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) onVisible(); },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [onVisible]);

  // Render PDF page
  useEffect(() => {
    let cancelled = false;
    let renderTask: any = null;
    (async () => {
      if (!pdfContainerRef.current || !annotContainerRef.current) return;

      // 1. Render PDF to the background canvas
      const page = await pdfDoc.getPage(pageNum);
      const vp = page.getViewport({ scale, rotation: page.rotate }); // Respect page rotation to fix upside down docs
      const { width, height } = vp;

      const pdfContainer = pdfContainerRef.current;
      pdfContainer.innerHTML = '';
      const pdfCanvas = document.createElement('canvas');
      pdfCanvas.style.display = 'block';
      pdfCanvas.style.position = 'absolute';
      pdfCanvas.style.top = '0px';
      pdfCanvas.style.left = '0px';
      pdfCanvas.style.pointerEvents = 'none';
      pdfContainer.appendChild(pdfCanvas);

      pdfCanvas.width = width;
      pdfCanvas.height = height;
      
      const pageContainer = wrapRef.current?.querySelector('.pdf-page-container') as HTMLDivElement;
      if (pageContainer) {
        pageContainer.style.width = `${width}px`;
        pageContainer.style.height = `${height}px`;
      }

      const ctx = pdfCanvas.getContext('2d')!;
      renderTask = page.render({ canvasContext: ctx, viewport: vp });
      try { await renderTask.promise; } catch (e: any) { if (e?.name !== 'RenderingCancelledException') console.error(e); }
      if (cancelled) return;

      // 2. Destroy old fabric if re-rendering (scale change)
      if (fcRef.current) { try { fcRef.current.dispose(); } catch {} fcRef.current = null; }

      // 3. Create a fresh <canvas> for Fabric inside the annotation container
      const container = annotContainerRef.current;
      container.innerHTML = '';
      const fc_canvas = document.createElement('canvas');
      fc_canvas.width = width;
      fc_canvas.height = height;
      container.appendChild(fc_canvas);

      const { Canvas, PencilBrush } = await getFabric();
      if (cancelled) return;

      const fc = new Canvas(fc_canvas, {
        width, height,
        backgroundColor: 'transparent',
        selection: true,
      });

      // ── Fix: make all Fabric-internal elements transparent ───────────────
      const makeTransparent = (el: HTMLElement | undefined) => {
        if (el) { el.style.background = 'transparent'; }
      };
      makeTransparent(fc.wrapperEl);
      makeTransparent(fc.lowerCanvasEl);
      makeTransparent(fc.upperCanvasEl);
      if (fc.wrapperEl) {
        fc.wrapperEl.style.position = 'absolute';
        fc.wrapperEl.style.top = '0';
        fc.wrapperEl.style.left = '0';
      }

      // Set default brush
      fc.freeDrawingBrush = new PencilBrush(fc);
      fc.isDrawingMode = true;

      // Load existing annotations
      const anno = noteItem.pdfAnnotations?.[pageNum];
      if (anno) {
        try { await fc.loadFromJSON(JSON.parse(anno)); fc.renderAll(); } catch {}
      }

      fcRef.current = fc;
      onFabricReady(pageNum, fc);
    })();
    return () => { 
      cancelled = true; 
      if (renderTask) try { renderTask.cancel(); } catch {}
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfDoc, pageNum, scale]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fcRef.current) {
        try { updatePDFAnnotation(noteId, pageNum, JSON.stringify(fcRef.current.toJSON())); } catch {}
        try { fcRef.current.dispose(); } catch {}
        fcRef.current = null;
      }
    };
  }, [noteId, pageNum, updatePDFAnnotation]);

  return (
    <div ref={wrapRef} className="flex flex-col items-center">
      <div
        className="relative shadow-2xl pdf-page-container"
        style={{
          width: 200,
          height: 300,
          background: '#fff',
          overflow: 'hidden',
        }}
      >
        {/* PDF background container */}
        <div ref={pdfContainerRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
        {/* Annotation layer (Fabric creates its canvas inside here) */}
        <div
          ref={annotContainerRef}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'transparent' }}
        />
      </div>
      <p className="text-xs mt-2 font-bold" style={{ color: 'var(--pal-moss)' }}>{pageNum} / {totalPages}</p>
    </div>
  );
}
