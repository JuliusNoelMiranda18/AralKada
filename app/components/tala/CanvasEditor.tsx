'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Download, Plus, ChevronLeft, ChevronRight, PanelLeft, FileDown, Settings2, X } from 'lucide-react';
import DrawingToolbar, { DrawTool, EraserMode } from './DrawingToolbar';
import { useNoteStorage } from './useNoteStorage';
import { getPaperStyle } from './paperTemplates';
import type { NoteItem, CanvasPage } from './types';

// ── Shared eraser utilities ───────────────────────────────────────────────
function circleCursor(radius: number) {
  const r = Math.max(4, radius);
  const d = r * 2 + 4;
  return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${d}' height='${d}'%3E%3Ccircle cx='${r + 2}' cy='${r + 2}' r='${r}' fill='none' stroke='%23888' stroke-width='1.5'/%3E%3C/svg%3E") ${r + 2} ${r + 2}, crosshair`;
}
function standardErase(fc: any, pointer: { x: number; y: number }, radius: number) {
  const objects = [...fc.getObjects()];
  let changed = false;
  for (const obj of objects) {
    const b = obj.getBoundingRect(true);
    const cx = Math.max(b.left, Math.min(pointer.x, b.left + b.width));
    const cy = Math.max(b.top,  Math.min(pointer.y, b.top + b.height));
    const dist = Math.sqrt((cx - pointer.x) ** 2 + (cy - pointer.y) ** 2);
    if (dist <= radius) { fc.remove(obj); changed = true; }
  }
  if (changed) fc.renderAll();
}
function strokeErase(fc: any, pointer: { x: number; y: number }) {
  const objects = [...fc.getObjects()];
  let changed = false;
  for (const obj of objects) {
    const b = obj.getBoundingRect(true);
    if (pointer.x >= b.left && pointer.x <= b.left + b.width &&
        pointer.y >= b.top  && pointer.y <= b.top + b.height) {
      fc.remove(obj); changed = true;
    }
  }
  if (changed) fc.renderAll();
}

interface CanvasEditorProps { noteId: string; }

let fabricModule: any = null;
async function getFabric() {
  if (!fabricModule) fabricModule = await import('fabric');
  return fabricModule;
}

const HISTORY_LIMIT = 50;
const CANVAS_W = 794;
const CANVAS_H = 1123;

function loadItemFromStorage(id: string): NoteItem | null {
  try {
    const all: NoteItem[] = JSON.parse(localStorage.getItem('aralkada-tala') || '[]');
    return all.find(i => i.id === id) ?? null;
  } catch { return null; }
}

// ── Per-page Fabric canvas manager ───────────────────────────────────────────
interface PageFabric { fc: any; isErasing: boolean; }

export default function CanvasEditor({ noteId }: CanvasEditorProps) {
  const router = useRouter();
  const { updateItem, updatePage, addPage } = useNoteStorage();

  // Paginated mode refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<any>(null);
  const pageFabricsRef = useRef<Map<string, PageFabric>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [note, setNote] = useState<NoteItem | null>(null);
  const noteRef = useRef<NoteItem | null>(null);
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [pages, setPages] = useState<CanvasPage[]>([]);
  const pagesRef = useRef<CanvasPage[]>([]);
  const currentPageIdxRef = useRef(0);

  const [activeTool, setActiveTool] = useState<DrawTool>('pen');
  const activeToolRef = useRef<DrawTool>('pen');
  const [eraserMode, setEraserMode] = useState<EraserMode>('stroke');
  const eraserModeRef = useRef<EraserMode>('stroke');
  const [color, setColor] = useState('#1A1A1A');
  const colorRef = useRef('#1A1A1A');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const strokeWidthRef = useRef(4);
  const [pagesPanelOpen, setPagesPanelOpen] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [title, setTitle] = useState('Untitled Notebook');
  const [layoutMode, setLayoutMode] = useState<'paginated' | 'continuous'>('paginated');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const historyRef = useRef<string[]>([]);
  const historyIdxRef = useRef(-1);

  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const isLoadingPage = useRef(false);

  // Sync state → refs
  useEffect(() => { colorRef.current = color; applyToolToFabric(fabricRef.current); }, [color]);
  useEffect(() => { strokeWidthRef.current = strokeWidth; applyToolToFabric(fabricRef.current); }, [strokeWidth]);
  useEffect(() => { activeToolRef.current = activeTool; applyToolToFabric(fabricRef.current); }, [activeTool]);
  useEffect(() => { eraserModeRef.current = eraserMode; applyToolToFabric(fabricRef.current); }, [eraserMode]);
  useEffect(() => { pagesRef.current = pages; }, [pages]);
  useEffect(() => { currentPageIdxRef.current = currentPageIdx; }, [currentPageIdx]);

  const refreshUndoRedo = useCallback(() => {
    setCanUndo(historyIdxRef.current > 0);
    setCanRedo(historyIdxRef.current < historyRef.current.length - 1);
  }, []);

  // ── Apply tool to a given Fabric instance ─────────────────────────────────
  const applyToolToFabric = useCallback((fc: any) => {
    if (!fc) return;
    getFabric().then(({ PencilBrush }) => {
      const tool = activeToolRef.current;
      const c = colorRef.current;
      const sw = strokeWidthRef.current;
      const erMode = eraserModeRef.current;
      switch (tool) {
        case 'pen':
          fc.isDrawingMode = true; fc.selection = false;
          fc.freeDrawingBrush = new PencilBrush(fc);
          fc.freeDrawingBrush.color = c;
          fc.freeDrawingBrush.width = sw;
          fc.defaultCursor = 'crosshair';
          break;
        case 'highlighter':
          fc.isDrawingMode = true; fc.selection = false;
          fc.freeDrawingBrush = new PencilBrush(fc);
          fc.freeDrawingBrush.color = c + '80';
          fc.freeDrawingBrush.width = sw * 3;
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
        default:
          fc.isDrawingMode = false; fc.selection = true;
          fc.defaultCursor = 'default';
          break;
      }
    });
  }, []);

  // ── LOAD NOTE ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const item = loadItemFromStorage(noteId);
    if (item) {
      setNote(item);
      noteRef.current = item;
      setPages(item.pages || []);
      pagesRef.current = item.pages || [];
      setTitle(item.title);
      if ((item as any).layoutMode) setLayoutMode((item as any).layoutMode);
    }
  }, [noteId]);

  // ── INIT FABRIC (paginated mode) ──────────────────────────────────────────
  useEffect(() => {
    if (layoutMode !== 'paginated') return;
    if (!canvasRef.current) return;
    let disposed = false;

    getFabric().then(({ Canvas, PencilBrush }) => {
      if (disposed) return;
      if (fabricRef.current) { fabricRef.current.dispose(); fabricRef.current = null; }

      const fc = new Canvas(canvasRef.current, {
        width: CANVAS_W, height: CANVAS_H,
        backgroundColor: 'transparent',
        selection: true, preserveObjectStacking: true,
      });

      fc.freeDrawingBrush = new PencilBrush(fc);
      fc.freeDrawingBrush.color = colorRef.current;
      fc.freeDrawingBrush.width = strokeWidthRef.current;
      fc.isDrawingMode = true;
      fabricRef.current = fc;

      // Load first page
      const item = loadItemFromStorage(noteId);
      const firstPages = item?.pages || [];
      if (firstPages.length > 0) loadPage(fc, firstPages[0]);

      setupFabricEvents(fc);
    });

    return () => {
      disposed = true;
      if (fabricRef.current) { fabricRef.current.dispose(); fabricRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId, layoutMode]);

  const setupFabricEvents = (fc: any) => {
    const pushHistory = () => {
      if (isLoadingPage.current) return;
      const json = JSON.stringify(fc.toJSON());
      historyRef.current = historyRef.current.slice(0, historyIdxRef.current + 1);
      historyRef.current.push(json);
      if (historyRef.current.length > HISTORY_LIMIT) historyRef.current.shift();
      historyIdxRef.current = historyRef.current.length - 1;
      refreshUndoRedo();
    };
    fc.on('object:added', pushHistory);
    fc.on('object:modified', pushHistory);
    fc.on('object:removed', pushHistory);

    // Stroke eraser hover deletion
    let isErasing = false;
    fc.on('mouse:down', () => { if (activeToolRef.current === 'eraser' && eraserModeRef.current === 'stroke') isErasing = true; });
    fc.on('mouse:up',   () => { isErasing = false; });
    fc.on('mouse:move', (opt: any) => {
      if (!isErasing || activeToolRef.current !== 'eraser' || eraserModeRef.current !== 'stroke') return;
      const pointer = fc.getPointer(opt.e);
      strokeErase(fc, pointer);
    });

    // Shape insert on click
    fc.on('mouse:down', async (opt: any) => {
      if (['pen', 'highlighter', 'eraser', 'select'].includes(activeToolRef.current)) return;
      const pointer = fc.getPointer(opt.e);
      const fabric = await getFabric();
      const c = colorRef.current; const sw = strokeWidthRef.current;
      switch (activeToolRef.current) {
        case 'text': { const t = new fabric.IText('Type here', { left: pointer.x, top: pointer.y, fontSize: 18, fill: c, fontFamily: 'Nunito, sans-serif', editable: true }); fc.add(t); fc.setActiveObject(t); t.enterEditing(); fc.renderAll(); break; }
        case 'rect': { const r = new fabric.Rect({ left: pointer.x, top: pointer.y, width: 100, height: 70, fill: 'transparent', stroke: c, strokeWidth: sw }); fc.add(r); fc.setActiveObject(r); fc.renderAll(); break; }
        case 'circle': { const ci = new fabric.Circle({ left: pointer.x, top: pointer.y, radius: 50, fill: 'transparent', stroke: c, strokeWidth: sw }); fc.add(ci); fc.setActiveObject(ci); fc.renderAll(); break; }
        case 'line': { const l = new fabric.Line([pointer.x, pointer.y, pointer.x + 100, pointer.y], { stroke: c, strokeWidth: sw }); fc.add(l); fc.setActiveObject(l); fc.renderAll(); break; }
        case 'arrow': { const al = new fabric.Line([pointer.x, pointer.y, pointer.x + 100, pointer.y], { stroke: c, strokeWidth: sw }); const ah = new fabric.Triangle({ left: pointer.x + 90, top: pointer.y - 8, width: 16, height: 16, angle: 90, fill: c }); fc.add(al, ah); fc.renderAll(); break; }
      }
    });
  };

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
      if (e.ctrlKey && (e.key === 'y' || e.key === 'Y')) { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPage = async (fc: any, page: CanvasPage) => {
    if (!fc || !page) return;
    isLoadingPage.current = true;
    try {
      if (fc.contextContainer) fc.clear();
      await fc.loadFromJSON(JSON.parse(page.fabricJSON || '{"version":"6.0.0","objects":[]}'));
      fc.renderAll();
      historyRef.current = [JSON.stringify(fc.toJSON())];
      historyIdxRef.current = 0;
    } catch {
      try { if (fc.contextContainer) { fc.clear(); fc.renderAll(); } } catch {}
      historyRef.current = []; historyIdxRef.current = -1;
    }
    isLoadingPage.current = false;
    refreshUndoRedo();
    applyToolToFabric(fc);
  };

  // Image upload
  const handleImageUpload = useCallback(async (file: File) => {
    const fc = fabricRef.current;
    if (!fc) return;
    const fabric = await getFabric();
    const url = URL.createObjectURL(file);
    const img = await fabric.FabricImage.fromURL(url);
    const s = Math.min(400 / (img.width || 400), 300 / (img.height || 300));
    img.scale(s); img.set({ left: 50, top: 50 });
    fc.add(img); fc.setActiveObject(img); fc.renderAll();
  }, []);

  // ── Undo / Redo ───────────────────────────────────────────────────────────
  // ── Thumbnail builder ─────────────────────────────────────────────────────
  const buildThumbnail = useCallback(async (fc: any): Promise<string> => {
    const n = noteRef.current;
    if (!n) return fc.toDataURL({ format: 'png', quality: 0.5 });
    const offscreen = document.createElement('canvas');
    offscreen.width = CANVAS_W; offscreen.height = CANVAS_H;
    const ctx = offscreen.getContext('2d')!;
    const paperStyle = getPaperStyle(n.paperType ?? 'ruled-narrow', n.paperColor ?? 'white');
    ctx.fillStyle = (paperStyle as any).backgroundColor ?? '#FAFAF5';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    const bgSvg = (paperStyle as any).backgroundImage;
    if (bgSvg) {
      await new Promise<void>(resolve => {
        const img = new Image();
        img.onload = () => { ctx.drawImage(img, 0, 0, CANVAS_W, CANVAS_H); resolve(); };
        img.onerror = () => resolve();
        img.src = bgSvg.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
      });
    }
    // Guard: canvas might be disposed when autosave fires
    try {
      const fabricDataUrl = fc.toDataURL({ format: 'png', quality: 0.9 });
      await new Promise<void>(resolve => {
        const img = new Image();
        img.onload = () => { ctx.drawImage(img, 0, 0); resolve(); };
        img.src = fabricDataUrl;
      });
    } catch { /* canvas disposed — use background only */ }
    return offscreen.toDataURL('image/png', 0.5);
  }, []);

  // ── Save ──────────────────────────────────────────────────────────────────
  const save = useCallback(async () => {
    const fc = fabricRef.current;
    const idx = currentPageIdxRef.current;
    const pg = pagesRef.current[idx];
    if (!fc || !pg) return;
    const json = JSON.stringify(fc.toJSON());
    const thumbnail = await buildThumbnail(fc);
    updatePage(noteId, pg.id, json, thumbnail);
    const updated = [...pagesRef.current];
    updated[idx] = { ...updated[idx], fabricJSON: json, thumbnail };
    setPages(updated);
  }, [noteId, updatePage, buildThumbnail]);

  // ── Undo / Redo ───────────────────────────────────────────────────────────
  const undo = useCallback(async () => {
    const fc = fabricRef.current;
    if (!fc || historyIdxRef.current <= 0) return;
    isLoadingPage.current = true;
    historyIdxRef.current--;
    try { await fc.loadFromJSON(JSON.parse(historyRef.current[historyIdxRef.current])); fc.renderAll(); } catch {}
    isLoadingPage.current = false;
    refreshUndoRedo();
    save(); // Instant sync
  }, [refreshUndoRedo, save]);

  const redo = useCallback(async () => {
    const fc = fabricRef.current;
    if (!fc || historyIdxRef.current >= historyRef.current.length - 1) return;
    isLoadingPage.current = true;
    historyIdxRef.current++;
    try { await fc.loadFromJSON(JSON.parse(historyRef.current[historyIdxRef.current])); fc.renderAll(); } catch {}
    isLoadingPage.current = false;
    refreshUndoRedo();
    save(); // Instant sync
  }, [refreshUndoRedo, save]);

  useEffect(() => {
    autoSaveTimer.current = setInterval(save, 3000);
    return () => { if (autoSaveTimer.current) clearInterval(autoSaveTimer.current); };
  }, [save]);

  // ── Page nav ─────────────────────────────────────────────────────────────
  const switchPage = useCallback(async (idx: number) => {
    await save();
    setCurrentPageIdx(idx);
    currentPageIdxRef.current = idx;
    const fc = fabricRef.current;
    const pg = pagesRef.current[idx];
    if (!fc || !pg) return;
    await loadPage(fc, pg);
  }, [save]); // eslint-disable-line react-hooks/exhaustive-deps

  const addNewPage = useCallback(async () => {
    await save();
    const newPage = addPage(noteId);
    const updated = [...pagesRef.current, newPage];
    setPages(updated); pagesRef.current = updated;
    const nextIdx = updated.length - 1;
    setCurrentPageIdx(nextIdx); currentPageIdxRef.current = nextIdx;
    const fc = fabricRef.current;
    if (fc) {
      isLoadingPage.current = true;
      try { if (fc.contextContainer) fc.clear(); fc.renderAll(); } catch {}
      historyRef.current = []; historyIdxRef.current = -1;
      isLoadingPage.current = false;
      refreshUndoRedo();
    }
  }, [addPage, noteId, save, refreshUndoRedo]);

  // ── Export PNG ────────────────────────────────────────────────────────────
  const exportPNG = useCallback(async () => {
    const fc = fabricRef.current;
    const n = noteRef.current;
    if (!fc || !n) return;
    const offscreen = document.createElement('canvas');
    offscreen.width = CANVAS_W; offscreen.height = CANVAS_H;
    const ctx = offscreen.getContext('2d')!;
    const paperStyle = getPaperStyle(n.paperType ?? 'ruled-narrow', n.paperColor ?? 'white');
    ctx.fillStyle = (paperStyle as any).backgroundColor ?? '#FAFAF5';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    const bgSvg = (paperStyle as any).backgroundImage;
    if (bgSvg) {
      await new Promise<void>(resolve => {
        const img = new Image();
        img.onload = () => { ctx.drawImage(img, 0, 0, CANVAS_W, CANVAS_H); resolve(); };
        img.onerror = () => resolve();
        img.src = bgSvg.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
      });
    }
    await new Promise<void>(resolve => {
      const img = new Image();
      img.onload = () => { ctx.drawImage(img, 0, 0); resolve(); };
      img.src = fc.toDataURL({ format: 'png', quality: 1 });
    });
    const link = document.createElement('a');
    link.download = `${title || 'note'}.png`;
    link.href = offscreen.toDataURL('image/png', 1.0);
    link.click();
  }, [title]);

  const exportPDF = useCallback(async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pgs = pagesRef.current;
    const n = noteRef.current;
    if (!n) return;
    const paperStyle = getPaperStyle(n.paperType ?? 'ruled-narrow', n.paperColor ?? 'white');
    await save();
    for (let i = 0; i < pgs.length; i++) {
      if (i > 0) doc.addPage();
      const pg = pgs[i];
      const offscreen = document.createElement('canvas');
      offscreen.width = CANVAS_W; offscreen.height = CANVAS_H;
      const ctx = offscreen.getContext('2d')!;
      ctx.fillStyle = (paperStyle as any).backgroundColor ?? '#FAFAF5';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      if (pg.thumbnail) {
        await new Promise<void>(resolve => {
          const img = new Image();
          img.onload = () => { ctx.drawImage(img, 0, 0); resolve(); };
          img.src = pg.thumbnail!;
        });
      }
      const dataUrl = offscreen.toDataURL('image/jpeg', 0.9);
      doc.addImage(dataUrl, 'JPEG', 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight());
    }
    doc.save(`${title || 'note'}.pdf`);
  }, [save, title]);

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.25, 0.25));

  const paperStyle = note
    ? getPaperStyle(note.paperType ?? 'ruled-narrow', note.paperColor ?? 'white')
    : { backgroundColor: '#FAFAF5' };

  const handleLayoutChange = (mode: 'paginated' | 'continuous') => {
    setLayoutMode(mode);
    updateItem(noteId, { ...(note || {}), layoutMode: mode } as any);
    setSettingsOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--pal-bone)' }}>
      {/* LEFT: Pages panel */}
      <AnimatePresence>
        {pagesPanelOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }} animate={{ width: 140, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
            className="flex-shrink-0 flex flex-col h-full overflow-y-auto gap-3 py-4 px-2"
            style={{ background: 'var(--pal-tan)', borderRight: '2px solid var(--pal-cafenoir)' }}
          >
            {pages.map((page, idx) => (
              <button key={page.id} onClick={() => layoutMode === 'paginated' ? switchPage(idx) : undefined}
                className="flex flex-col items-center gap-1.5">
                <div className="w-full rounded-lg overflow-hidden relative shadow-md" style={{
                  height: 90,
                  border: `2px solid ${idx === currentPageIdx ? 'var(--duo-green)' : 'var(--pal-cafenoir)'}`,
                  ...(paperStyle as React.CSSProperties),
                }}>
                  {page.thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={page.thumbnail} alt={`Page ${idx + 1}`} className="w-full h-full object-cover absolute inset-0" />
                  )}
                </div>
                <span className="text-[10px] font-black" style={{ color: idx === currentPageIdx ? 'var(--duo-green)' : 'var(--pal-moss)' }}>{idx + 1}</span>
              </button>
            ))}
            <button onClick={addNewPage} className="flex flex-col items-center gap-1 mt-1">
              <div className="w-full rounded-lg flex items-center justify-center" style={{ height: 52, border: '2px dashed var(--pal-cafenoir)', background: 'var(--pal-bone)' }}>
                <Plus size={16} style={{ color: 'var(--pal-cafenoir)' }} />
              </div>
              <span className="text-[10px] font-black" style={{ color: 'var(--pal-moss)' }}>Add page</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden" ref={containerRef}>
        {/* Top bar */}
        <div className="flex items-center px-4 py-2 gap-3 flex-shrink-0 relative"
          style={{ background: 'var(--pal-tan)', borderBottom: '2px solid var(--pal-cafenoir)' }}>
          <motion.button 
            onClick={() => { save(); router.push('/tala'); }} 
            className="w-8 h-8 rounded-lg flex items-center justify-center border-2 border-pal-cafenoir" 
            style={{ background: 'var(--pal-paper)', color: 'var(--pal-cafenoir)' }}
            whileHover={{ scale: 1.1, background: 'var(--pal-bone)' }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft size={16} />
          </motion.button>
          <motion.button 
            onClick={() => setPagesPanelOpen(o => !o)} 
            className="w-8 h-8 rounded-lg flex items-center justify-center border-2 border-pal-cafenoir" 
            style={{ background: 'var(--pal-paper)', color: 'var(--pal-cafenoir)' }}
            whileHover={{ scale: 1.1, background: 'var(--pal-bone)' }}
            whileTap={{ scale: 0.9 }}
          >
            <PanelLeft size={16} />
          </motion.button>
          <input value={title} onChange={e => { setTitle(e.target.value); updateItem(noteId, { title: e.target.value }); }} className="flex-1 bg-transparent text-sm font-black outline-none" style={{ color: 'var(--pal-cafenoir)' }} />
          <span className="text-xs font-bold" style={{ color: 'var(--pal-moss)' }}>Page {currentPageIdx + 1} of {pages.length}</span>
          <motion.button 
            onClick={() => setSettingsOpen(o => !o)} 
            className="w-8 h-8 rounded-lg flex items-center justify-center border-2 border-pal-cafenoir" 
            title="Layout Settings" 
            style={{ background: settingsOpen ? 'var(--pal-bone)' : 'var(--pal-paper)', color: 'var(--pal-cafenoir)' }}
            whileHover={{ scale: 1.1, background: 'var(--pal-bone)' }}
            whileTap={{ scale: 0.9 }}
          >
            <Settings2 size={16} />
          </motion.button>
          <motion.button 
            onClick={save} 
            className="px-3 py-1.5 rounded-lg text-xs font-black uppercase border-2" 
            style={{ background: 'var(--duo-green)', color: '#fff', borderColor: 'var(--pal-cafenoir)' }}
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
          >
            Save
          </motion.button>
          <motion.button 
            onClick={exportPNG} 
            className="w-8 h-8 rounded-lg flex items-center justify-center border-2 border-pal-cafenoir" 
            title="Export PNG" 
            style={{ background: 'var(--pal-paper)', color: 'var(--pal-cafenoir)' }}
            whileHover={{ scale: 1.1, background: 'var(--pal-bone)' }}
            whileTap={{ scale: 0.9 }}
          >
            <Download size={16} />
          </motion.button>
          <motion.button 
            onClick={exportPDF} 
            className="w-8 h-8 rounded-lg flex items-center justify-center border-2 border-pal-cafenoir" 
            title="Export PDF" 
            style={{ background: 'var(--pal-paper)', color: 'var(--pal-cafenoir)' }}
            whileHover={{ scale: 1.1, background: 'var(--pal-bone)' }}
            whileTap={{ scale: 0.9 }}
          >
            <FileDown size={16} />
          </motion.button>

          {/* Settings panel */}
          <AnimatePresence>
            {settingsOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setSettingsOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-4 top-12 z-40 rounded-2xl p-4 border-2 border-pal-cafenoir shadow-2xl"
                  style={{ background: 'var(--pal-paper)', minWidth: 240 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--pal-cafenoir)' }}>Page Layout</p>
                    <button onClick={() => setSettingsOpen(false)}><X size={14} style={{ color: 'var(--pal-cafenoir)' }} /></button>
                  </div>
                  {(['paginated', 'continuous'] as const).map(mode => (
                    <button key={mode} onClick={() => handleLayoutChange(mode)}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl mb-1 transition-colors"
                      style={{ background: layoutMode === mode ? 'var(--pal-tan)' : 'transparent', border: `2px solid ${layoutMode === mode ? 'var(--pal-cafenoir)' : 'transparent'}` }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-lg">
                        {mode === 'paginated' ? '📄' : '📜'}
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--pal-cafenoir)' }}>
                          {mode === 'paginated' ? 'Page by Page' : 'Continuous Scroll'}
                        </p>
                        <p className="text-[10px] font-bold mt-0.5" style={{ color: 'var(--pal-moss)' }}>
                          {mode === 'paginated' ? 'Navigate with arrows' : 'All pages visible'}
                        </p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Toolbar */}
        <div className="flex justify-center px-4 pt-3 pb-2 flex-shrink-0">
          <DrawingToolbar
            activeTool={activeTool} onToolChange={setActiveTool}
            color={color} onColorChange={setColor}
            strokeWidth={strokeWidth} onStrokeWidthChange={setStrokeWidth}
            onUndo={undo} onRedo={redo}
            onZoomIn={handleZoomIn} onZoomOut={handleZoomOut}
            onImageUpload={handleImageUpload}
            canUndo={canUndo} canRedo={canRedo}
            eraserMode={eraserMode} onEraserModeChange={setEraserMode}
          />
        </div>

        {/* Canvas area — Paginated */}
        {layoutMode === 'paginated' && (
          <div className="flex-1 overflow-auto flex items-start justify-center py-8" style={{ background: 'var(--pal-bone)' }}>
            <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.2s ease' }}>
              <div className="relative shadow-2xl" style={{ width: CANVAS_W, height: CANVAS_H, border: '2px solid var(--pal-cafenoir)', borderBottom: '8px solid var(--pal-cafenoir)', ...(paperStyle as React.CSSProperties) }}>
                <canvas ref={canvasRef} className="absolute inset-0" />
              </div>
            </div>
          </div>
        )}

        {/* Canvas area — Continuous scroll */}
        {layoutMode === 'continuous' && (
          <div ref={scrollContainerRef} className="flex-1 overflow-auto py-8 px-8" style={{ background: 'var(--pal-bone)' }}>
            <div className="flex flex-col items-center gap-6">
              {pages.map((page, idx) => (
                <ContinuousPageCanvas
                  key={page.id}
                  page={page}
                  idx={idx}
                  noteId={noteId}
                  zoom={zoom}
                  paperStyle={paperStyle}
                  activeTool={activeTool}
                  activeToolRef={activeToolRef}
                  colorRef={colorRef}
                  strokeWidthRef={strokeWidthRef}
                  eraserModeRef={eraserModeRef}
                  applyToolToFabric={applyToolToFabric}
                  updatePage={updatePage}
                  buildThumbnail={buildThumbnail}
                  isCurrentPage={idx === currentPageIdx}
                  onPageFocus={() => setCurrentPageIdx(idx)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Bottom page nav — only in paginated mode */}
        {layoutMode === 'paginated' && (
          <div className="flex items-center justify-center gap-4 py-2 flex-shrink-0" style={{ background: 'var(--pal-tan)', borderTop: '2px solid var(--pal-cafenoir)' }}>
            <button onClick={() => currentPageIdx > 0 && switchPage(currentPageIdx - 1)} disabled={currentPageIdx === 0} style={{ color: currentPageIdx === 0 ? 'var(--pal-moss)' : 'var(--pal-cafenoir)' }}><ChevronLeft size={18} /></button>
            <span className="text-xs font-black" style={{ color: 'var(--pal-cafenoir)' }}>{currentPageIdx + 1} / {pages.length}</span>
            <button onClick={() => currentPageIdx < pages.length - 1 && switchPage(currentPageIdx + 1)} disabled={currentPageIdx >= pages.length - 1} style={{ color: currentPageIdx >= pages.length - 1 ? 'var(--pal-moss)' : 'var(--pal-cafenoir)' }}><ChevronRight size={18} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-component for continuous scroll page ──────────────────────────────────
function ContinuousPageCanvas({ page, idx, noteId, zoom, paperStyle, activeTool, activeToolRef, colorRef, strokeWidthRef, eraserModeRef, applyToolToFabric, updatePage, buildThumbnail, isCurrentPage, onPageFocus }: any) {
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<any>(null);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    if (!canvasEl.current) return;
    let disposed = false;

    getFabric().then(async ({ Canvas, PencilBrush }) => {
      if (disposed) return;
      const fc = new Canvas(canvasEl.current, {
        width: CANVAS_W, height: CANVAS_H,
        backgroundColor: 'transparent', selection: true, preserveObjectStacking: true,
      });
      fc.freeDrawingBrush = new PencilBrush(fc);
      fabricRef.current = fc;

      // Load page data
      isLoadingRef.current = true;
      try {
        await fc.loadFromJSON(JSON.parse(page.fabricJSON || '{"version":"6.0.0","objects":[]}'));
        fc.renderAll();
      } catch {}
      isLoadingRef.current = false;

      // Apply current tool
      applyToolToFabric(fc);

      // Eraser
      let isErasing = false;
      fc.on('mouse:down', () => { if (activeToolRef.current === 'eraser' && eraserModeRef.current === 'stroke') isErasing = true; });
      fc.on('mouse:up', () => { isErasing = false; });
      fc.on('mouse:move', (opt: any) => {
        if (activeToolRef.current !== 'eraser' || eraserModeRef.current !== 'stroke' || !isErasing) return;
        const target = fc.findTarget(opt.e);
        if (target) { fc.remove(target); fc.renderAll(); }
      });

      // Auto-save every 5s
      const timer = setInterval(async () => {
        if (!fc || isLoadingRef.current) return;
        const json = JSON.stringify(fc.toJSON());
        const thumb = await buildThumbnail(fc);
        updatePage(noteId, page.id, json, thumb);
      }, 5000);

      return () => clearInterval(timer);
    });

    return () => { disposed = true; if (fabricRef.current) { fabricRef.current.dispose(); fabricRef.current = null; } };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.id]);

  // Re-apply tool whenever activeTool changes
  useEffect(() => {
    applyToolToFabric(fabricRef.current);
  }, [activeTool, applyToolToFabric]);

  return (
    <div
      onClick={onPageFocus}
      className="relative shadow-2xl"
      style={{
        width: CANVAS_W * zoom,
        height: CANVAS_H * zoom,
        transform: `scale(${zoom})`,
        transformOrigin: 'top center',
        marginBottom: (CANVAS_H * zoom) - CANVAS_H,
        outline: isCurrentPage ? '4px solid var(--duo-green)' : '2px solid var(--pal-cafenoir)',
        outlineOffset: 4,
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        ...(paperStyle as React.CSSProperties),
      }}
    >
      <canvas ref={canvasEl} className="absolute inset-0" />
    </div>
  );
}
