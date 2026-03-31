'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pen, Highlighter, Eraser, MousePointer2, Minus, Square,
  Circle, Type, Image as ImageIcon, Undo2, Redo2, ZoomIn, ZoomOut,
  ArrowRight, ChevronDown,
} from 'lucide-react';

export type DrawTool = 'pen' | 'highlighter' | 'eraser' | 'select' | 'text'
  | 'line' | 'arrow' | 'rect' | 'circle' | 'image';
export type EraserMode = 'standard' | 'stroke';

interface DrawingToolbarProps {
  activeTool: DrawTool;
  onToolChange: (t: DrawTool) => void;
  color: string;
  onColorChange: (c: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (w: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onImageUpload?: (file: File) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  eraserMode?: EraserMode;
  onEraserModeChange?: (m: EraserMode) => void;
}

const PRESET_COLORS = [
  '#1A1A1A', '#FFFFFF', '#FF4B4B', '#FF9600',
  '#FFD900', '#58CC02', '#1CB0F6', '#CE82FF',
];

const STROKE_WIDTHS = [2, 4, 7, 12, 20];

const TOOLS: { id: DrawTool; icon: any; label: string; group: number }[] = [
  { id: 'select',      icon: MousePointer2, label: 'Select',    group: 0 },
  { id: 'pen',         icon: Pen,           label: 'Pen',       group: 1 },
  { id: 'highlighter', icon: Highlighter,   label: 'Highlight', group: 1 },
  { id: 'eraser',      icon: Eraser,        label: 'Eraser',    group: 1 },
  { id: 'text',        icon: Type,          label: 'Text',      group: 2 },
  { id: 'line',        icon: Minus,         label: 'Line',      group: 2 },
  { id: 'arrow',       icon: ArrowRight,    label: 'Arrow',     group: 2 },
  { id: 'rect',        icon: Square,        label: 'Rect',      group: 2 },
  { id: 'circle',      icon: Circle,        label: 'Circle',    group: 2 },
  { id: 'image',       icon: ImageIcon,     label: 'Image',     group: 3 },
];

export default function DrawingToolbar({
  activeTool, onToolChange, color, onColorChange,
  strokeWidth, onStrokeWidthChange, onUndo, onRedo,
  onZoomIn, onZoomOut, onImageUpload,
  canUndo = true, canRedo = true,
  eraserMode = 'stroke', onEraserModeChange,
}: DrawingToolbarProps) {
  const [eraserMenuOpen, setEraserMenuOpen] = useState(false);
  const eraserTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleImageClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && onImageUpload) onImageUpload(file);
    };
    input.click();
  };

  const handleEraserClick = () => {
    if (activeTool === 'eraser') {
      setEraserMenuOpen(o => !o);
    } else {
      onToolChange('eraser');
      setEraserMenuOpen(false); // Only activate the tool, do not open dropdown
    }
  };

  const groups = [0, 1, 2, 3];

  return (
    <div
      className="flex items-center gap-1 px-3 py-2 rounded-2xl border-2 shadow-xl"
      style={{
        background: 'var(--pal-tan)',
        borderColor: 'var(--pal-cafenoir)',
        flexWrap: 'wrap',
        gap: 4,
        position: 'relative',
      }}
    >
      {groups.map((g, gi) => (
        <div key={g} className="flex items-center gap-1">
          {gi > 0 && (
            <div style={{ width: 1, height: 24, background: 'var(--pal-cafenoir)', opacity: 0.2, margin: '0 4px' }} />
          )}

          {TOOLS.filter(t => t.group === g).map(({ id, icon: Icon, label }) => {
            const isActive = activeTool === id;

            // Special eraser button with sub-menu
            if (id === 'eraser') {
              return (
                <div key={id} className="relative">
                    <style>{`
                      .tool-btn-active { background: var(--pal-paper) !important; color: var(--pal-cafenoir) !important; border: 1.5px solid var(--pal-cafenoir) !important; }
                      .tool-btn-inactive { background: transparent; color: var(--pal-moss); border: 1.5px solid transparent; }
                    `}</style>
                    <motion.button
                      title={label}
                      onClick={handleEraserClick}
                      className={`relative w-9 h-9 rounded-xl flex items-center justify-center ${isActive ? 'tool-btn-active' : 'tool-btn-inactive'}`}
                      whileHover={{ scale: 1.1, background: 'var(--pal-bone)', color: 'var(--pal-cafenoir)' }}
                      whileTap={{ scale: 0.9 }}
                    >
                    <Icon size={17} />
                    {isActive && (
                      <ChevronDown size={8} style={{ position: 'absolute', bottom: 1, right: 2, opacity: 0.6 }} />
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {eraserMenuOpen && isActive && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setEraserMenuOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="absolute top-11 left-1/2 z-50 rounded-2xl py-2 px-2 border-2 border-pal-cafenoir shadow-2xl"
                          style={{
                            transform: 'translateX(-50%)',
                            background: 'var(--pal-paper)',
                            minWidth: 210,
                          }}
                        >
                          <p className="text-[10px] font-black uppercase tracking-wider px-2 py-1 mb-1"
                            style={{ color: 'var(--pal-moss)' }}>Eraser Type</p>

                          {/* Standard Eraser */}
                          <button
                            onClick={() => { onEraserModeChange?.('standard'); setEraserMenuOpen(false); }}
                            className="flex items-start gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-colors"
                            style={{
                              background: eraserMode === 'standard' ? 'var(--pal-tan)' : 'transparent',
                              border: eraserMode === 'standard' ? '2px solid var(--pal-cafenoir)' : '2px solid transparent',
                            }}
                          >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--pal-bone)' }}>
                              <div className="rounded-full border-2" style={{ width: 18, height: 18, borderColor: eraserMode === 'standard' ? 'var(--duo-green)' : 'var(--pal-cafenoir)' }} />
                            </div>
                            <div>
                              <p className="text-xs font-black uppercase" style={{ color: 'var(--pal-cafenoir)' }}>Standard Eraser</p>
                              <p className="text-[10px] font-bold mt-0.5" style={{ color: 'var(--pal-moss)' }}>Erases pixel by pixel</p>
                            </div>
                          </button>

                          {/* Stroke Eraser */}
                          <button
                            onClick={() => { onEraserModeChange?.('stroke'); setEraserMenuOpen(false); }}
                            className="flex items-start gap-3 w-full px-3 py-2.5 rounded-xl text-left mt-1 transition-colors"
                            style={{
                              background: eraserMode === 'stroke' ? 'var(--pal-tan)' : 'transparent',
                              border: eraserMode === 'stroke' ? '2px solid var(--pal-cafenoir)' : '2px solid transparent',
                            }}
                          >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--pal-bone)' }}>
                              <Eraser size={16} style={{ color: 'var(--pal-cafenoir)' }} />
                            </div>
                            <div>
                              <p className="text-xs font-black uppercase" style={{ color: 'var(--pal-cafenoir)' }}>Stroke Eraser</p>
                              <p className="text-[10px] font-bold mt-0.5" style={{ color: 'var(--pal-moss)' }}>Removes entire strokes</p>
                            </div>
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return (
              <motion.button
                key={id}
                title={label}
                onClick={() => id === 'image' ? handleImageClick() : onToolChange(id)}
                className={`relative w-9 h-9 rounded-xl flex items-center justify-center ${isActive ? 'tool-btn-active' : 'tool-btn-inactive'}`}
                whileHover={{ background: 'var(--pal-bone)', color: 'var(--pal-cafenoir)' }}
                whileTap={{ scale: 0.9 }}
              >
                <Icon size={17} />
              </motion.button>
            );
          })}
        </div>
      ))}

      {/* Color separator */}
      <div style={{ width: 1, height: 24, background: 'var(--pal-cafenoir)', opacity: 0.2, margin: '0 4px' }} />

      {/* Color presets */}
      <div className="flex items-center gap-1.5">
        {PRESET_COLORS.map(c => (
          <motion.button
            key={c}
            onClick={() => onColorChange(c)}
            className="rounded-full transition-transform"
            style={{
              width: 20, height: 20,
              background: c,
              border: `2px solid ${color === c ? '#fff' : 'rgba(255,255,255,0.15)'}`,
            }}
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.9 }}
            animate={{ scale: color === c ? 1.3 : 1 }}
          />
        ))}
        <motion.label 
          title="Custom color" 
          className="w-5 h-5 rounded-full overflow-hidden cursor-pointer border-2"
          style={{ borderColor: 'var(--pal-cafenoir)' }}
          whileHover={{ scale: 1.25 }}
          whileTap={{ scale: 0.9 }}
        >
          <input type="color" className="opacity-0 w-0 h-0" value={color} onChange={e => onColorChange(e.target.value)} />
          <div style={{ width: 20, height: 20, background: `conic-gradient(red, yellow, lime, cyan, blue, magenta, red)` }} />
        </motion.label>
      </div>

      {/* Separator */}
      <div style={{ width: 1, height: 24, background: 'var(--pal-cafenoir)', opacity: 0.2, margin: '0 4px' }} />

      {/* Stroke widths */}
      <div className="flex items-center gap-1.5">
        {STROKE_WIDTHS.map(w => (
          <motion.button
            key={w}
            onClick={() => onStrokeWidthChange(w)}
            className="flex items-center justify-center rounded-full transition-all"
            style={{
              width: w + 10, height: w + 10,
              background: strokeWidth === w ? 'var(--pal-paper)' : 'var(--pal-bone)',
              border: `2px solid ${strokeWidth === w ? 'var(--pal-cafenoir)' : 'transparent'}`,
              minWidth: 18, minHeight: 18,
            }}
            whileHover={{ scale: 1.1, background: 'var(--pal-tan)' }}
            whileTap={{ scale: 0.9 }}
          >
            <div style={{ width: Math.min(w, 12), height: Math.min(w, 12), borderRadius: '50%', background: 'var(--pal-cafenoir)', opacity: strokeWidth === w ? 1 : 0.4 }} />
          </motion.button>
        ))}
      </div>

      {/* Separator */}
      <div style={{ width: 1, height: 24, background: 'var(--pal-cafenoir)', opacity: 0.2, margin: '0 4px' }} />

      {/* Undo / Redo */}
      <motion.button 
        onClick={onUndo} title="Undo (Ctrl+Z)" disabled={!canUndo}
        className="w-9 h-9 rounded-xl flex items-center justify-center border-2"
        style={{ 
          background: 'var(--pal-paper)', 
          borderColor: canUndo ? 'var(--pal-cafenoir)' : 'transparent',
          color: canUndo ? 'var(--pal-cafenoir)' : 'var(--pal-moss)',
          opacity: canUndo ? 1 : 0.4,
        }}
        whileHover={canUndo ? { scale: 1.1, background: 'var(--pal-bone)' } : {}}
        whileTap={canUndo ? { scale: 0.9 } : {}}
      >
        <Undo2 size={17} />
      </motion.button>
      <motion.button 
        onClick={onRedo} title="Redo (Ctrl+Y)" disabled={!canRedo}
        className="w-9 h-9 rounded-xl flex items-center justify-center border-2"
        style={{ 
          background: 'var(--pal-paper)', 
          borderColor: canRedo ? 'var(--pal-cafenoir)' : 'transparent',
          color: canRedo ? 'var(--pal-cafenoir)' : 'var(--pal-moss)',
          opacity: canRedo ? 1 : 0.4,
        }}
        whileHover={canRedo ? { scale: 1.1, background: 'var(--pal-bone)' } : {}}
        whileTap={canRedo ? { scale: 0.9 } : {}}
      >
        <Redo2 size={17} />
      </motion.button>

      {/* Zoom */}
      {(onZoomIn || onZoomOut) && (
        <>
          <div style={{ width: 1, height: 24, background: 'var(--pal-cafenoir)', opacity: 0.2, margin: '0 4px' }} />
          <motion.button 
            onClick={onZoomOut} 
            className="w-9 h-9 rounded-xl flex items-center justify-center border-2 border-pal-cafenoir" 
            style={{ background: 'var(--pal-paper)', color: 'var(--pal-cafenoir)' }}
            whileHover={{ scale: 1.1, background: 'var(--pal-bone)' }}
            whileTap={{ scale: 0.9 }}
          >
            <ZoomOut size={17} />
          </motion.button>
          <motion.button 
            onClick={onZoomIn} 
            className="w-9 h-9 rounded-xl flex items-center justify-center border-2 border-pal-cafenoir" 
            style={{ background: 'var(--pal-paper)', color: 'var(--pal-cafenoir)' }}
            whileHover={{ scale: 1.1, background: 'var(--pal-bone)' }}
            whileTap={{ scale: 0.9 }}
          >
            <ZoomIn size={17} />
          </motion.button>
        </>
      )}
    </div>
  );
}
