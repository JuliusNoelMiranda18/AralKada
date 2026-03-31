'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal, Star, Trash2, FolderOpen, Copy, Pencil } from 'lucide-react';
import type { NoteItem } from './types';
import { COVER_STYLES } from './types';
import { getPaperStyle } from './paperTemplates';

interface DocumentCardProps {
  item: NoteItem;
  onClick: () => void;
  onRename: () => void;
  onFavorite: () => void;
  onTrash: () => void;
  onDuplicate?: () => void;
}

const TYPE_ICON: Record<string, string> = {
  notebook:   '📓',
  document:   '📄',
  whiteboard: '⬜',
  folder:     '📁',
  quicknote:  '📝',
  pdf:        '📕',
};

export default function DocumentCard({
  item, onClick, onRename, onFavorite, onTrash, onDuplicate,
}: DocumentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (item.type === 'folder') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -4 }}
        className="relative group cursor-pointer"
        onClick={onClick}
      >
        {/* Folder shape */}
        <div className="relative">
          {/* Tab */}
          <div
            className="absolute -top-2 left-2 w-16 h-4 rounded-t-lg border-2 border-pal-cafenoir border-b-0"
            style={{ background: item.color || '#F3F4F6' }}
          />
          <div
            className="w-full rounded-lg rounded-tl-none p-4 pt-5 border-2 border-pal-cafenoir"
            style={{
              background: item.color || '#F3F4F6',
              minHeight: 100,
              boxShadow: `0 4px 0 var(--pal-cafenoir)`,
            }}
          >
            {item.favorite && (
              <Star size={12} className="absolute top-3 right-3" style={{ color: 'var(--pal-cafenoir)', fill: 'var(--pal-cafenoir)' }} />
            )}
          </div>
        </div>

        {/* Label */}
        <div className="mt-2 px-0.5 flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-xs font-black truncate" style={{ color: 'var(--pal-cafenoir)' }}>{item.title}</p>
            <p className="text-[10px] font-bold mt-0.5" style={{ color: 'var(--pal-moss)' }}>{formatDate(item.updatedAt)}</p>
          </div>
          <ContextMenuButton item={item} onRename={onRename} onFavorite={onFavorite} onTrash={onTrash} />
        </div>
      </motion.div>
    );
  }

  // Notebook / Document / Whiteboard / etc.
  const cover = item.coverStyle ? COVER_STYLES[item.coverStyle] : COVER_STYLES.simple;
  const paperStyle = item.paperType
    ? getPaperStyle(item.paperType, item.paperColor ?? 'white')
    : { backgroundColor: '#FAFAF5' };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className="relative group cursor-pointer"
      onClick={onClick}
    >
      {/* Cover / Preview */}
      <div
        className="relative rounded-lg overflow-hidden flex items-center justify-center border-2"
        style={{
          background: cover.bg,
          borderColor: 'var(--pal-cafenoir)',
          height: 140,
          boxShadow: `0 4px 0 var(--pal-cafenoir)`,
        }}
      >
        {/* Paper background preview */}
        {item.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
        ) : (
          <div
            className="absolute inset-0 opacity-60"
            style={paperStyle as React.CSSProperties}
          />
        )}

        {/* Center icon if no thumbnail */}
        {!item.thumbnail && (
          <span className="relative z-10 text-3xl">{TYPE_ICON[item.type] || '📄'}</span>
        )}

        {/* Favorite star */}
        {item.favorite && (
          <div className="absolute top-2 right-2">
            <Star size={12} fill="#FFD900" color="#FFD900" />
          </div>
        )}
      </div>

      {/* Info row */}
      <div className="mt-2 px-0.5 flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black truncate" style={{ color: 'var(--pal-cafenoir)' }}>{item.title}</p>
          <p className="text-[10px] font-bold mt-0.5" style={{ color: 'var(--pal-moss)' }}>{formatDate(item.updatedAt)}</p>
        </div>
        <ContextMenuButton item={item} onRename={onRename} onFavorite={onFavorite} onTrash={onTrash} />
      </div>
    </motion.div>
  );
}

function ContextMenuButton({ item, onRename, onFavorite, onTrash }: {
  item: NoteItem;
  onRename: () => void;
  onFavorite: () => void;
  onTrash: () => void;
}) {
  const [open, setOpen] = useState(false);

  const ACTIONS = [
    { label: 'Rename', icon: Pencil, action: onRename },
    { label: item.favorite ? 'Remove from Favorites' : 'Add to Favorites', icon: Star, action: onFavorite },
    { label: 'Move to Trash', icon: Trash2, action: onTrash, danger: true },
  ];

  return (
    <div className="relative flex-shrink-0 ml-1" onClick={(e) => e.stopPropagation()}>
      <motion.button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="w-6 h-6 rounded-md flex items-center justify-center border transition-all"
        style={{ background: 'var(--pal-paper)', borderColor: 'var(--pal-cafenoir)', color: 'var(--pal-cafenoir)' }}
        whileHover={{ scale: 1.1, background: 'var(--pal-tan)' }}
        whileTap={{ scale: 0.9 }}
      >
        <MoreHorizontal size={12} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-7 z-50 rounded-xl overflow-hidden py-1 min-w-max border-2 border-pal-cafenoir shadow-2xl"
            style={{
              background: 'var(--pal-paper)',
            }}
          >
            {ACTIONS.map(({ label, icon: Icon, action, danger }) => (
              <motion.button
                key={label}
                onClick={() => { action(); setOpen(false); }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-black transition-colors"
                style={{ color: danger ? '#FF4B4B' : 'var(--pal-cafenoir)' }}
                whileHover={{ background: 'var(--pal-tan)', color: danger ? '#FF5B5B' : 'var(--pal-cafenoir)' }}
              >
                <Icon size={13} />
                {label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click-outside overlay */}
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}
