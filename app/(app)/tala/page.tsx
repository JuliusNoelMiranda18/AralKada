'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, ChevronDown, BookOpen, FileText, LayoutTemplate,
  FolderPlus, StickyNote, Upload, CalendarClock, Trash2,
  RotateCcw, Search, X, ArrowLeft,
} from 'lucide-react';
import TalaSidebar from '../../components/tala/GoodNotesSidebar';
import DocumentCard from '../../components/tala/DocumentCard';
import CreateDialog from '../../components/tala/CreateDialog';
import type { CreateData } from '../../components/tala/CreateDialog';
import { useNoteStorage } from '../../components/tala/useNoteStorage';
import type { NoteItem, NoteType } from '../../components/tala/types';

type Section = 'documents' | 'favorites' | 'trash';
type SortBy = 'date' | 'name';

const NEW_MENU = [
  { id: 'notebook',   label: 'Notebook',       icon: BookOpen },
  { id: 'document',   label: 'Text Document',   icon: FileText },
  { id: 'whiteboard', label: 'Whiteboard',      icon: LayoutTemplate },
  { id: 'folder',     label: 'Folder',          icon: FolderPlus },
  { id: 'quicknote',  label: 'Quick Note',      icon: StickyNote },
  { id: 'pdf',        label: 'Import PDF',      icon: Upload },
] as const;

export default function TalaLibrary() {
  const router = useRouter();
  const storage = useNoteStorage();

  const [section, setSection] = useState<Section>('documents');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderStack, setFolderStack] = useState<NoteItem[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOpen, setSortOpen] = useState(false);
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const [createType, setCreateType] = useState<NoteType | 'folder' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const pdfInputRef = useRef<HTMLInputElement>(null);

  // ── Derived items (FIXES INFINITE LOOP) ──────────────────────────────────
  const displayItems = useMemo(() => {
    let base: NoteItem[] = [];
    if (section === 'favorites') {
      base = storage.items.filter(i => !i.deleted && i.favorite);
    } else if (section === 'trash') {
      base = storage.items.filter(i => i.deleted);
    } else {
      base = storage.items.filter(i => !i.deleted && i.folderId === currentFolderId);
    }

    const sortFn = (a: NoteItem, b: NoteItem) =>
      sortBy === 'name'
        ? a.title.localeCompare(b.title)
        : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();

    return [...base].sort(sortFn);
  }, [storage.items, section, currentFolderId, sortBy]);

  const filtered = searchQuery.trim()
    ? displayItems.filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : displayItems;

  const folders = filtered.filter(i => i.type === 'folder');
  const nonFolders = filtered.filter(i => i.type !== 'folder');

  const sectionTitle =
    section === 'favorites' ? 'Favorites'
    : section === 'trash' ? 'Trash'
    : folderStack.length > 0 ? folderStack[folderStack.length - 1].title
    : 'Documents';

  // ── Handlers ────────────────────────────────────────────────────────────
  const openItem = (item: NoteItem) => {
    if (section === 'trash') return;
    if (item.type === 'folder') {
      setFolderStack(s => [...s, item]);
      setCurrentFolderId(item.id);
    } else if (item.type === 'notebook') {
      router.push(`/tala/notebook/${item.id}`);
    } else if (item.type === 'document' || item.type === 'quicknote') {
      router.push(`/tala/document/${item.id}`);
    } else if (item.type === 'whiteboard') {
      router.push(`/tala/whiteboard/${item.id}`);
    } else if (item.type === 'pdf') {
      router.push(`/tala/pdf/${item.id}`);
    }
  };

  const navigateUp = () => {
    const newStack = folderStack.slice(0, -1);
    setFolderStack(newStack);
    setCurrentFolderId(newStack.length > 0 ? newStack[newStack.length - 1].id : null);
  };

  const handleCreate = useCallback((data: CreateData) => {
    if (!createType) return;
    let item: NoteItem;
    if (createType === 'folder') {
      storage.createFolder(data.title, data.color, currentFolderId);
    } else if (createType === 'notebook') {
      item = storage.createNotebook({
        title: data.title, folderId: currentFolderId,
        coverStyle: data.coverStyle, paperType: data.paperType, paperColor: data.paperColor,
      });
      router.push(`/tala/notebook/${item.id}`);
    } else if (createType === 'document') {
      item = storage.createDocument(data.title, currentFolderId);
      router.push(`/tala/document/${item.id}`);
    } else if (createType === 'whiteboard') {
      item = storage.createWhiteboard(data.title, currentFolderId);
      router.push(`/tala/whiteboard/${item.id}`);
    } else if (createType === 'quicknote') {
      item = storage.createQuickNote(currentFolderId);
      router.push(`/tala/document/${item.id}`);
    }
  }, [createType, currentFolderId, router, storage]);

  const handlePDFImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = ev.target?.result as string;
      const item = storage.importPDF(file.name.replace('.pdf', ''), data, currentFolderId);
      router.push(`/tala/pdf/${item.id}`);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const startRename = (item: NoteItem) => {
    setRenameTarget(item.id);
    setRenameValue(item.title);
  };

  const commitRename = () => {
    if (renameTarget && renameValue.trim()) {
      storage.updateItem(renameTarget, { title: renameValue.trim() });
    }
    setRenameTarget(null);
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--pal-bone)' }}>
      <TalaSidebar
        activeSection={section}
        onSectionChange={(s) => { setSection(s); setCurrentFolderId(null); setFolderStack([]); }}
        onSearch={() => setSearchOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 flex-shrink-0" style={{ borderBottom: '2px solid var(--pal-tan)' }}>
          <div className="flex items-center gap-2">
            {folderStack.length > 0 && section === 'documents' && (
              <motion.button 
                onClick={navigateUp} 
                className="w-8 h-8 rounded-lg flex items-center justify-center border-2 border-pal-cafenoir" 
                style={{ background: 'var(--pal-tan)', color: 'var(--pal-cafenoir)' }}
                whileHover={{ scale: 1.1, background: 'var(--pal-paper)' }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowLeft size={16} />
              </motion.button>
            )}
            <h1 className="text-xl font-black" style={{ color: 'var(--pal-cafenoir)' }}>{sectionTitle}</h1>
          </div>

          <div className="flex items-center gap-2">
            <motion.button 
              onClick={() => setSearchOpen(o => !o)} 
              className="w-9 h-9 rounded-xl flex items-center justify-center border-2" 
              style={{ background: searchOpen ? 'var(--pal-tan)' : 'var(--pal-paper)', borderColor: 'var(--pal-cafenoir)', color: 'var(--pal-cafenoir)' }}
              whileHover={{ scale: 1.05, background: 'var(--pal-tan)' }}
              whileTap={{ scale: 0.95 }}
            >
              <Search size={16} />
            </motion.button>

            <div className="relative">
              <motion.button 
                onClick={() => setSortOpen(o => !o)} 
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black border-2 transition-transform" 
                style={{ background: 'var(--pal-paper)', borderColor: 'var(--pal-cafenoir)', color: 'var(--pal-cafenoir)', borderBottomWidth: '4px' }}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                {sortBy === 'date' ? 'Date' : 'Name'} <ChevronDown size={12} />
              </motion.button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute right-0 top-11 z-30 rounded-xl overflow-hidden shadow-xl border-2 border-pal-cafenoir" style={{ background: 'var(--pal-paper)', minWidth: 140 }}>
                    {['date', 'name'].map(s => (
                      <button key={s} onClick={() => { setSortBy(s as SortBy); setSortOpen(false); }} className="block w-full text-left px-4 py-2.5 text-xs font-black capitalize transition-colors" style={{ color: sortBy === s ? 'var(--duo-blue)' : 'var(--pal-cafenoir)', background: sortBy === s ? 'var(--pal-tan)' : 'transparent' }}>
                        {s === 'date' ? 'Date Modified' : 'Name'}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              {sortOpen && <div className="fixed inset-0 z-20" onClick={() => setSortOpen(false)} />}
            </div>

            {section === 'documents' && (
              <div className="relative">
                <motion.button 
                  onClick={() => setNewMenuOpen(o => !o)} 
                  className="btn-duo flex items-center gap-1.5 px-4 py-2 text-sm font-black rounded-xl"
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <Plus size={16} /> New
                </motion.button>
                <AnimatePresence>
                  {newMenuOpen && (
                    <motion.div initial={{ opacity: 0, scale: 0.92, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92 }} className="absolute right-0 top-11 z-40 rounded-2xl py-2 overflow-hidden shadow-2xl border-2 border-pal-cafenoir" style={{ background: 'var(--pal-paper)', minWidth: 200 }}>
                      {NEW_MENU.map(({ id, label, icon: Icon }) => (
                        <button key={id} onClick={() => { setNewMenuOpen(false); if (id === 'pdf') pdfInputRef.current?.click(); else setCreateType(id as NoteType | 'folder'); }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-black transition-colors hover:bg-pal-tan" style={{ color: 'var(--pal-cafenoir)' }}>
                          <Icon size={16} style={{ color: 'var(--duo-green)' }} /> {label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                {newMenuOpen && <div className="fixed inset-0 z-30" onClick={() => setNewMenuOpen(false)} />}
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 py-2 flex-shrink-0 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border-2" style={{ background: 'var(--pal-paper)', borderColor: 'var(--pal-cafenoir)' }}>
                <Search size={14} style={{ color: 'var(--pal-moss)' }} />
                <input autoFocus placeholder="Search notes…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 bg-transparent text-sm outline-none font-bold" style={{ color: 'var(--pal-cafenoir)' }} />
                {searchQuery && <button onClick={() => setSearchQuery('')} style={{ color: 'var(--pal-moss)' }}><X size={14} /></button>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {section === 'trash' && displayItems.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{displayItems.length} item(s) in trash</p>
              <button onClick={() => { displayItems.forEach(i => storage.permanentlyDelete(i.id)); }} className="text-sm font-bold" style={{ color: '#FF4B4B' }}>Empty Trash</button>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="text-6xl opacity-30">{section === 'trash' ? '🗑️' : section === 'favorites' ? '⭐' : '📓'}</div>
              <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {section === 'trash' ? 'Trash is empty' : section === 'favorites' ? 'No favorites yet' : searchQuery ? 'No results found' : 'No notes yet. Click + New to get started!'}
              </p>
            </div>
          )}

          {folders.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: 'var(--pal-moss)' }}>Folders</p>
              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
                {folders.map(item => (
                  <RenameWrapper key={item.id} item={item} isRenaming={renameTarget === item.id} renameValue={renameValue} onRenameChange={setRenameValue} onRenameCommit={commitRename}>
                    <DocumentCard item={item} onClick={() => openItem(item)} onRename={() => startRename(item)} onFavorite={() => storage.toggleFavorite(item.id)} onTrash={() => storage.trashItem(item.id)} />
                  </RenameWrapper>
                ))}
              </div>
            </div>
          )}

          {nonFolders.length > 0 && (
            <div>
              {folders.length > 0 && <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: 'var(--pal-moss)' }}>Notes</p>}
              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
                {nonFolders.map(item => (
                  section === 'trash' ? (
                    <TrashCard key={item.id} item={item} onRestore={() => storage.restoreItem(item.id)} onDelete={() => storage.permanentlyDelete(item.id)} />
                  ) : (
                    <RenameWrapper key={item.id} item={item} isRenaming={renameTarget === item.id} renameValue={renameValue} onRenameChange={setRenameValue} onRenameCommit={commitRename}>
                      <DocumentCard item={item} onClick={() => openItem(item)} onRename={() => startRename(item)} onFavorite={() => storage.toggleFavorite(item.id)} onTrash={() => storage.trashItem(item.id)} />
                    </RenameWrapper>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <input ref={pdfInputRef} type="file" accept=".pdf" className="hidden" onChange={handlePDFImport} />

      <AnimatePresence>
        {createType && (
          <CreateDialog open={!!createType} type={createType} onClose={() => setCreateType(null)} onConfirm={(data) => { handleCreate(data); setCreateType(null); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

function RenameWrapper({ item, isRenaming, renameValue, onRenameChange, onRenameCommit, children }: { item: NoteItem; isRenaming: boolean; renameValue: string; onRenameChange: (v: string) => void; onRenameCommit: () => void; children: React.ReactNode }) {
  if (!isRenaming) return <>{children}</>;
  return (
    <div className="flex flex-col">
      {children}
      <input autoFocus value={renameValue} onChange={e => onRenameChange(e.target.value)} onBlur={onRenameCommit} onKeyDown={e => e.key === 'Enter' && onRenameCommit()} className="mt-1 text-xs px-2 py-1 rounded-lg outline-none" style={{ background: '#1A2028', border: '1px solid var(--duo-green)', color: '#fff' }} />
    </div>
  );
}

function TrashCard({ item, onRestore, onDelete }: { item: NoteItem; onRestore: () => void; onDelete: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-full h-28 rounded-lg flex items-center justify-center text-4xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', opacity: 0.6 }}>
        {item.type === 'folder' ? '📁' : item.type === 'notebook' ? '📓' : item.type === 'pdf' ? '📕' : '📄'}
      </div>
      <p className="text-xs font-bold text-center truncate w-full" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.title}</p>
      <div className="flex gap-1">
        <button onClick={onRestore} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold" style={{ background: 'rgba(88,204,2,0.12)', color: 'var(--duo-green)' }}><RotateCcw size={10} /> Restore</button>
        <button onClick={onDelete} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold" style={{ background: 'rgba(255,75,75,0.12)', color: '#FF4B4B' }}><Trash2 size={10} /> Delete</button>
      </div>
    </div>
  );
}
