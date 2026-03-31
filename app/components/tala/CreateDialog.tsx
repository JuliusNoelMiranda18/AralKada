'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, Plus } from 'lucide-react';
import type { PaperType, PaperColor, CoverStyle, NoteType } from './types';
import { COVER_STYLES, PAPER_TYPE_GROUPS, FOLDER_COLORS } from './types';
import { getPaperThumbnailStyle } from './paperTemplates';

interface CreateDialogProps {
  open: boolean;
  type: NoteType | 'folder';
  onClose: () => void;
  onConfirm: (data: CreateData) => void;
}

export interface CreateData {
  title: string;
  coverStyle?: CoverStyle;
  paperType?: PaperType;
  paperColor?: PaperColor;
  color?: string;   // folder color
}

const PAPER_COLORS: { id: PaperColor; label: string }[] = [
  { id: 'white',  label: 'White Paper' },
  { id: 'yellow', label: 'Yellow Paper' },
  { id: 'dark',   label: 'Dark Paper' },
];

export default function CreateDialog({ open, type, onClose, onConfirm }: CreateDialogProps) {
  const [title, setTitle] = useState(
    type === 'folder' ? 'Untitled Folder'
    : type === 'document' ? 'Untitled Document'
    : type === 'whiteboard' ? 'Untitled Whiteboard'
    : 'Untitled Notebook'
  );
  const [coverStyle, setCoverStyle] = useState<CoverStyle>('simple');
  const [paperType, setPaperType] = useState<PaperType>('ruled-narrow');
  const [paperColor, setPaperColor] = useState<PaperColor>('white');
  const [folderColor, setFolderColor] = useState(FOLDER_COLORS[0]);
  const [paperColorOpen, setPaperColorOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const handleConfirm = () => {
    onConfirm({ title, coverStyle, paperType, paperColor, color: folderColor });
    onClose();
  };

  if (!open) return null;

  // ── FOLDER ────────────────────────────────────────────────────────────────
  if (type === 'folder') {
    return (
      <Overlay onClose={onClose}>
        <div className="w-80">
          <h2 className="text-lg font-black mb-4" style={{ color: '#fff' }}>New Folder</h2>
          <label className="block mb-1 text-xs font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>NAME</label>
          <input
            className="w-full rounded-xl px-3 py-2.5 text-sm font-semibold mb-4 outline-none"
            style={{ background: '#1A2028', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
          />
          <label className="block mb-2 text-xs font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>COLOR</label>
          <div className="flex gap-2 flex-wrap mb-6">
            {FOLDER_COLORS.map(c => (
              <motion.button
                key={c}
                onClick={() => setFolderColor(c)}
                className="w-8 h-8 rounded-full transition-transform"
                style={{
                  background: c,
                  boxShadow: folderColor === c ? `0 0 0 3px #fff, 0 0 0 4px ${c}` : 'none',
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                animate={{ scale: folderColor === c ? 1.2 : 1 }}
              />
            ))}
          </div>
          <div className="flex gap-3">
            <motion.button 
              onClick={onClose} 
              className="flex-1 py-2.5 rounded-xl text-sm font-bold" 
              style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
              whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            <motion.button 
              onClick={handleConfirm} 
              className="flex-1 py-2.5 rounded-xl text-sm font-black btn-duo"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              Create Folder
            </motion.button>
          </div>
        </div>
      </Overlay>
    );
  }

  // ── DOCUMENT / WHITEBOARD / QUICKNOTE ─────────────────────────────────────
  if (type === 'document' || type === 'whiteboard' || type === 'quicknote') {
    const typeLabel = type === 'document' ? 'Document' : type === 'whiteboard' ? 'Whiteboard' : 'Quick Note';
    return (
      <Overlay onClose={onClose}>
        <div className="w-80">
          <h2 className="text-lg font-black mb-4" style={{ color: '#fff' }}>New {typeLabel}</h2>
          <label className="block mb-1 text-xs font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>TITLE</label>
          <input
            className="w-full rounded-xl px-3 py-2.5 text-sm font-semibold mb-6 outline-none"
            style={{ background: '#1A2028', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
          />
          <div className="flex gap-3">
            <motion.button 
              onClick={onClose} 
              className="flex-1 py-2.5 rounded-xl text-sm font-bold" 
              style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
              whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            <motion.button 
              onClick={handleConfirm} 
              className="flex-1 py-2.5 rounded-xl text-sm font-black btn-duo"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              Create {typeLabel}
            </motion.button>
          </div>
        </div>
      </Overlay>
    );
  }

  // ── NOTEBOOK ──────────────────────────────────────────────────────────────
  return (
    <Overlay onClose={onClose} wide>
      <div className="flex gap-6 h-full max-h-[80vh]">

        {/* ── LEFT PANEL: Title + Cover + Current paper preview ── */}
        <div className="flex flex-col gap-4" style={{ width: 220, flexShrink: 0 }}>
          <div>
            <label className="block mb-1 text-xs font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>TITLE</label>
            <input
              className="w-full rounded-xl px-3 py-2 text-sm font-semibold outline-none"
              style={{ background: '#1A2028', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
              placeholder="Untitled Notebook"
            />
          </div>

          <div>
            <label className="block mb-2 text-xs font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>COVER</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(COVER_STYLES) as CoverStyle[]).map(cs => (
                <motion.button
                  key={cs}
                  onClick={() => setCoverStyle(cs)}
                  className="rounded-lg flex flex-col items-center gap-1 p-1"
                  style={{
                    border: `2px solid ${coverStyle === cs ? '#fff' : 'transparent'}`,
                  }}
                  whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.05)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div
                    className="w-full rounded-md"
                    style={{ height: 54, background: COVER_STYLES[cs].bg, border: `1px solid ${COVER_STYLES[cs].border}` }}
                  />
                  <span className="text-[10px]" style={{ color: coverStyle === cs ? '#fff' : 'rgba(255,255,255,0.4)' }}>
                    {COVER_STYLES[cs].label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Current paper preview */}
          <div>
            <label className="block mb-2 text-xs font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>PAPER</label>
            <div
              className="w-full rounded-lg"
              style={{
                height: 120,
                border: `2px solid ${COVER_STYLES[coverStyle].border}`,
                ...(getPaperThumbnailStyle(paperType, paperColor) as React.CSSProperties),
              }}
            />
          </div>
        </div>

        {/* ── RIGHT PANEL: Paper type + color selector ── */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Paper color dropdown */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setPaperColorOpen(!paperColorOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold"
              style={{ background: 'rgba(255,255,255,0.08)', color: '#fff' }}
            >
              {PAPER_COLORS.find(p => p.id === paperColor)?.label}
              <ChevronDown size={14} />
            </button>
          </div>

          <AnimatePresence>
            {paperColorOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-xl overflow-hidden mb-3"
                style={{ background: '#1A2028', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {PAPER_COLORS.map(pc => (
                  <button
                    key={pc.id}
                    onClick={() => { setPaperColor(pc.id); setPaperColorOpen(false); }}
                    className="block w-full text-left px-4 py-2.5 text-sm"
                    style={{ color: paperColor === pc.id ? 'var(--duo-green)' : 'rgba(255,255,255,0.7)' }}
                  >
                    {pc.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Paper type groups */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {PAPER_TYPE_GROUPS.map(({ group, types }) => (
              <div key={group}>
                <p className="text-xs font-black mb-2 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {group}
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {types.map(({ id, label }) => (
                    <motion.button
                      key={id}
                      onClick={() => setPaperType(id)}
                      className="flex flex-col items-center gap-1.5"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div
                        className="w-full rounded-lg"
                        style={{
                          height: 72,
                          border: `2px solid ${paperType === id ? '#1CB0F6' : 'rgba(255,255,255,0.1)'}`,
                          ...(getPaperThumbnailStyle(id, paperColor) as React.CSSProperties),
                        }}
                      />
                      <span className="text-[10px] text-center leading-tight" style={{ color: paperType === id ? '#1CB0F6' : 'rgba(255,255,255,0.5)' }}>
                        {label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-4 flex-shrink-0">
            <motion.button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
              whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            <motion.button 
              onClick={handleConfirm} 
              className="flex-1 py-2.5 rounded-xl text-sm font-black btn-duo"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              Create Notebook
            </motion.button>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

function Overlay({ onClose, children, wide }: {
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative rounded-2xl p-6"
        style={{
          background: '#161B22',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          width: wide ? 640 : 'auto',
          maxWidth: '90vw',
          maxHeight: '85vh',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        <motion.button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
          whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.15)', color: '#fff' }}
          whileTap={{ scale: 0.9 }}
        >
          <X size={14} />
        </motion.button>
        {children}
      </motion.div>
    </div>
  );
}
