'use client';

import { motion } from 'framer-motion';
import { FileText, Star, Trash2, Search, ChevronDown, BookOpen } from 'lucide-react';

interface GoodNotesSidebarProps {
  activeSection: 'documents' | 'favorites' | 'trash';
  onSectionChange: (s: 'documents' | 'favorites' | 'trash') => void;
  onSearch?: () => void;
}

const NAV = [
  { id: 'documents' as const, label: 'Documents', icon: FileText },
  { id: 'favorites' as const, label: 'Favorites', icon: Star },
  { id: 'trash'     as const, label: 'Trash',     icon: Trash2 },
];

export default function GoodNotesSidebar({
  activeSection,
  onSectionChange,
  onSearch,
}: GoodNotesSidebarProps) {
  return (
    <aside
      className="flex-shrink-0 h-screen sticky top-0 flex flex-col"
      style={{
        width: 220,
        background: 'var(--pal-tan)',
        borderRight: '2px solid var(--pal-cafenoir)',
      }}
    >
      {/* Wordmark */}
      <div
        className="px-5 pt-5 pb-3 flex items-center gap-2"
        style={{ borderBottom: '2px solid var(--pal-cafenoir)' }}
      >
        <BookOpen size={18} style={{ color: 'var(--duo-green)' }} />
        <span className="font-black text-base" style={{ color: 'var(--pal-cafenoir)' }}>Tala</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 pt-2 space-y-0.5">
        {NAV.map(({ id, label, icon: Icon }) => {
          const isActive = activeSection === id;
          return (
            <motion.button
              key={id}
              onClick={() => onSectionChange(id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{
                background: isActive ? 'var(--pal-paper)' : 'transparent',
                color: isActive ? 'var(--pal-cafenoir)' : 'var(--pal-moss)',
                border: isActive ? '2px solid var(--pal-cafenoir)' : '2px solid transparent',
                borderBottomWidth: isActive ? '4px' : '2px',
                textAlign: 'left',
              }}
              whileHover={{ 
                scale: 1.02, 
                background: isActive ? 'var(--pal-paper)' : 'var(--pal-bone)',
                color: 'var(--pal-cafenoir)'
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Icon size={16} style={{ color: isActive ? 'var(--pal-cafenoir)' : 'var(--pal-moss)' }} />
              {label}
            </motion.button>
          );
        })}
      </nav>

      {/* Search */}
      <div className="px-3 pb-5">
        <motion.button
          onClick={onSearch}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-black border-2"
          style={{
            background: 'var(--pal-paper)',
            color: 'var(--pal-moss)',
            borderColor: 'var(--pal-cafenoir)',
            borderBottomWidth: '4px'
          }}
          whileHover={{ 
            scale: 1.02, 
            background: 'var(--pal-bone)',
            color: 'var(--pal-cafenoir)'
          }}
          whileTap={{ scale: 0.98 }}
        >
          <Search size={14} />
          Search notes…
        </motion.button>
      </div>
    </aside>
  );
}
