'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import type { NoteItem, NoteType, PaperType, PaperColor, CoverStyle, CanvasPage } from './types';

const STORAGE_KEY = 'aralkada-tala';

function load(): NoteItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function save(items: NoteItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useNoteStorage() {
  const [items, setItems] = useState<NoteItem[]>([]);

  useEffect(() => {
    setItems(load());
  }, []);

  const persist = useCallback((next: NoteItem[]) => {
    setItems(next);
    save(next);
  }, []);

  // ── CREATE ──────────────────────────────────────────

  const createFolder = useCallback((
    title: string,
    color: string = '#58CC02',
    folderId: string | null = null,
  ): NoteItem => {
    const item: NoteItem = {
      id: generateId(), type: 'folder', title, folderId,
      color, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      favorite: false, deleted: false,
    };
    persist([...load(), item]);
    return item;
  }, [persist]);

  const createNotebook = useCallback((opts: {
    title: string;
    folderId?: string | null;
    coverStyle?: CoverStyle;
    paperType?: PaperType;
    paperColor?: PaperColor;
  }): NoteItem => {
    const firstPage: CanvasPage = {
      id: generateId(),
      fabricJSON: JSON.stringify({ version: '6.0.0', objects: [] }),
    };
    const item: NoteItem = {
      id: generateId(), type: 'notebook',
      title: opts.title || 'Untitled Notebook',
      folderId: opts.folderId ?? null,
      coverStyle: opts.coverStyle ?? 'simple',
      paperType: opts.paperType ?? 'ruled-narrow',
      paperColor: opts.paperColor ?? 'white',
      pages: [firstPage],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      favorite: false, deleted: false,
    };
    persist([...load(), item]);
    return item;
  }, [persist]);

  const createDocument = useCallback((
    title: string = 'Untitled Document',
    folderId: string | null = null,
  ): NoteItem => {
    const item: NoteItem = {
      id: generateId(), type: 'document', title, folderId,
      richContent: '',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      favorite: false, deleted: false,
    };
    persist([...load(), item]);
    return item;
  }, [persist]);

  const createWhiteboard = useCallback((
    title: string = 'Untitled Whiteboard',
    folderId: string | null = null,
  ): NoteItem => {
    const firstPage: CanvasPage = {
      id: generateId(),
      fabricJSON: JSON.stringify({ version: '6.0.0', objects: [] }),
    };
    const item: NoteItem = {
      id: generateId(), type: 'whiteboard', title, folderId,
      pages: [firstPage],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      favorite: false, deleted: false,
    };
    persist([...load(), item]);
    return item;
  }, [persist]);

  const createQuickNote = useCallback((
    folderId: string | null = null,
  ): NoteItem => {
    const item: NoteItem = {
      id: generateId(), type: 'quicknote',
      title: 'Quick Note', folderId,
      richContent: '',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      favorite: false, deleted: false,
    };
    persist([...load(), item]);
    return item;
  }, [persist]);

  const importPDF = useCallback((
    title: string, pdfData: string,
    folderId: string | null = null,
  ): NoteItem => {
    const item: NoteItem = {
      id: generateId(), type: 'pdf', title, folderId,
      pdfName: title, pdfData, pdfAnnotations: {},
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      favorite: false, deleted: false,
    };
    persist([...load(), item]);
    return item;
  }, [persist]);

  // ── UPDATE ──────────────────────────────────────────

  const updateItem = useCallback((id: string, patch: Partial<NoteItem>) => {
    const current = load();
    const idx = current.findIndex(i => i.id === id);
    if (idx === -1) return;
    const next = [...current];
    next[idx] = { ...next[idx], ...patch, updatedAt: new Date().toISOString() };
    persist(next);
  }, [persist]);

  const updatePage = useCallback((
    notebookId: string, pageId: string,
    fabricJSON: string, thumbnail?: string,
  ) => {
    const current = load();
    const idx = current.findIndex(i => i.id === notebookId);
    if (idx === -1) return;
    const item = { ...current[idx] };
    const pages = [...(item.pages || [])];
    const pIdx = pages.findIndex(p => p.id === pageId);
    if (pIdx === -1) return;
    pages[pIdx] = { ...pages[pIdx], fabricJSON, thumbnail };
    item.pages = pages;
    item.updatedAt = new Date().toISOString();
    const next = [...current];
    next[idx] = item;
    persist(next);
  }, [persist]);

  const addPage = useCallback((notebookId: string): CanvasPage => {
    const newPage: CanvasPage = {
      id: generateId(),
      fabricJSON: JSON.stringify({ version: '6.0.0', objects: [] }),
    };
    const current = load();
    const idx = current.findIndex(i => i.id === notebookId);
    if (idx === -1) return newPage;
    const item = { ...current[idx] };
    item.pages = [...(item.pages || []), newPage];
    item.updatedAt = new Date().toISOString();
    const next = [...current];
    next[idx] = item;
    persist(next);
    return newPage;
  }, [persist]);

  const updatePDFAnnotation = useCallback((
    pdfId: string, pageIndex: number, fabricJSON: string,
  ) => {
    const current = load();
    const idx = current.findIndex(i => i.id === pdfId);
    if (idx === -1) return;
    const item = { ...current[idx] };
    item.pdfAnnotations = { ...(item.pdfAnnotations || {}), [pageIndex]: fabricJSON };
    item.updatedAt = new Date().toISOString();
    const next = [...current];
    next[idx] = item;
    persist(next);
  }, [persist]);

  // ── DELETE / RESTORE ─────────────────────────────────

  const trashItem = useCallback((id: string) => {
    updateItem(id, { deleted: true });
  }, [updateItem]);

  const restoreItem = useCallback((id: string) => {
    updateItem(id, { deleted: false });
  }, [updateItem]);

  const permanentlyDelete = useCallback((id: string) => {
    const current = load();
    persist(current.filter(i => i.id !== id));
  }, [persist]);

  const toggleFavorite = useCallback((id: string) => {
    const current = load();
    const item = current.find(i => i.id === id);
    if (item) updateItem(id, { favorite: !item.favorite });
  }, [updateItem]);

  // ── GETTERS ──────────────────────────────────────────

  const getItem = useCallback((id: string): NoteItem | undefined => {
    return items.find(i => i.id === id);
  }, [items]);

  const getRootItems = useCallback((folderId: string | null = null): NoteItem[] => {
    return items.filter(i => !i.deleted && i.folderId === folderId);
  }, [items]);

  const getFavorites = useCallback((): NoteItem[] => {
    return items.filter(i => !i.deleted && i.favorite);
  }, [items]);

  const getTrash = useCallback((): NoteItem[] => {
    return items.filter(i => i.deleted);
  }, [items]);

  return useMemo(() => ({
    items,
    createFolder, createNotebook, createDocument, createWhiteboard,
    createQuickNote, importPDF,
    updateItem, updatePage, addPage, updatePDFAnnotation,
    trashItem, restoreItem, permanentlyDelete, toggleFavorite,
    getItem, getRootItems, getFavorites, getTrash,
  }), [
    items, createFolder, createNotebook, createDocument, createWhiteboard,
    createQuickNote, importPDF, updateItem, updatePage, addPage,
    updatePDFAnnotation, trashItem, restoreItem, permanentlyDelete,
    toggleFavorite, getItem, getRootItems, getFavorites, getTrash
  ]);
}
