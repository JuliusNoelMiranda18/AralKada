'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Bold, Italic, Underline, List, ListOrdered, Heading1, Heading2, Heading3, AlignLeft, AlignCenter, AlignRight, Quote, Code2, Table as TableIcon, Link2, Image as ImageIcon, Strikethrough, Undo2, Redo2, Minus } from 'lucide-react';
import type { NoteItem } from './types';
import { useNoteStorage } from './useNoteStorage';

// Tiptap — imported at component level (client-only)
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExt from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import ExtLink from '@tiptap/extension-link';
import ExtImage from '@tiptap/extension-image';
import CharacterCount from '@tiptap/extension-character-count';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';

interface RichTextEditorProps {
  noteId: string;
}

// ── TOOLBAR BUTTON ──────────────────────────────────────────────────────────
function TB({
  title, icon: Icon, active, onClick, disabled,
}: { title: string; icon: any; active?: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <motion.button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors"
      style={{
        background: active ? 'var(--pal-paper)' : 'transparent',
        color: active ? 'var(--pal-cafenoir)' : disabled ? 'var(--pal-moss)' : 'var(--pal-cafenoir)',
        border: active ? '1px solid var(--pal-cafenoir)' : '1px solid transparent',
      }}
      whileHover={!disabled ? { scale: 1.1, background: active ? 'var(--pal-bone)' : 'var(--pal-tan)', color: 'var(--pal-cafenoir)' } : {}}
      whileTap={!disabled ? { scale: 0.9 } : {}}
    >
      <Icon size={15} />
    </motion.button>
  );
}

function Sep() {
  return <div style={{ width: 1, height: 22, background: 'var(--pal-cafenoir)', opacity: 0.2, margin: '0 3px' }} />;
}

export default function RichTextEditorPage({ noteId }: RichTextEditorProps) {
  const router = useRouter();
  const { getItem, updateItem } = useNoteStorage();
  const [note, setNote] = useState<NoteItem | null>(null);
  const [title, setTitle] = useState('Untitled Document');
  const saveTimer = useRef<NodeJS.Timeout | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      UnderlineExt,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      ExtLink.configure({ openOnClick: false }),
      ExtImage.configure({ inline: false, allowBase64: true }),
      CharacterCount,
      Placeholder.configure({ placeholder: 'Start writing your notes here…' }),
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    editorProps: {
      attributes: {
        class: 'prose-custom focus:outline-none min-h-full p-10',
        style: 'font-family: Nunito, sans-serif; font-size: 15px; line-height: 1.8; color: #1A1A1A;',
      },
    },
    onUpdate: ({ editor }) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        updateItem(noteId, { richContent: editor.getHTML() });
      }, 2000);
    },
  });

  const contentSetRef = useRef(false);

  useEffect(() => {
    contentSetRef.current = false;
  }, [noteId]);

  // Load content
  useEffect(() => {
    if (!editor || contentSetRef.current) return;
    const item = getItem(noteId);
    if (item) {
      setNote(item);
      setTitle(item.title);
      if (item.richContent) {
        editor.commands.setContent(item.richContent);
      }
      contentSetRef.current = true;
    }
  }, [noteId, getItem, editor]);

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file || !editor) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        editor.chain().focus().setImage({ src }).run();
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const addTable = () => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const exportHTML = () => {
    if (!editor) return;
    const blob = new Blob([editor.getHTML()], { type: 'text/html' });
    const link = document.createElement('a');
    link.download = `${title}.html`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const save = () => {
    if (editor) updateItem(noteId, { richContent: editor.getHTML(), title });
  };

  if (!editor) return null;

  const charCount = editor.storage.characterCount?.characters() ?? 0;
  const wordCount = editor.storage.characterCount?.words() ?? 0;

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--pal-bone)' }}>
      {/* Top bar */}
      <div
        className="flex items-center px-4 py-2 gap-3 flex-shrink-0"
        style={{ background: 'var(--pal-tan)', borderBottom: '2px solid var(--pal-cafenoir)' }}
      >
        <motion.button
          onClick={() => { save(); router.push('/tala'); }}
          className="w-8 h-8 rounded-lg flex items-center justify-center border-2"
          style={{ background: 'var(--pal-paper)', borderColor: 'var(--pal-cafenoir)', color: 'var(--pal-cafenoir)' }}
          whileHover={{ scale: 1.1, background: 'var(--pal-bone)' }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft size={16} />
        </motion.button>

        <input
          value={title}
          onChange={e => { setTitle(e.target.value); updateItem(noteId, { title: e.target.value }); }}
          className="flex-1 bg-transparent text-sm font-black outline-none"
          style={{ color: 'var(--pal-cafenoir)' }}
        />

        <motion.button
          onClick={save}
          className="px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border-2"
          style={{ background: 'var(--duo-green)', color: '#fff', borderColor: 'var(--pal-cafenoir)' }}
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.95 }}
        >
          Save
        </motion.button>

        <motion.button
          onClick={exportHTML}
          className="w-8 h-8 rounded-lg flex items-center justify-center border-2 border-pal-cafenoir"
          style={{ background: 'var(--pal-paper)', color: 'var(--pal-cafenoir)' }}
          title="Export HTML"
          whileHover={{ scale: 1.1, background: 'var(--pal-bone)' }}
          whileTap={{ scale: 0.9 }}
        >
          <Download size={16} />
        </motion.button>
      </div>

      {/* Formatting Toolbar */}
      <div
        className="flex items-center gap-1 px-4 py-2 flex-shrink-0 flex-wrap"
        style={{ background: 'var(--pal-tan)', borderBottom: '2px solid var(--pal-cafenoir)' }}
      >
        <TB title="Bold" icon={Bold} active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} />
        <TB title="Italic" icon={Italic} active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <TB title="Underline" icon={Underline} active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} />
        <TB title="Strikethrough" icon={Strikethrough} active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} />
        <TB title="Inline Code" icon={Code2} active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} />
        <Sep />
        <TB title="Heading 1" icon={Heading1} active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
        <TB title="Heading 2" icon={Heading2} active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
        <TB title="Heading 3" icon={Heading3} active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
        <Sep />
        <TB title="Bullet List" icon={List} active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <TB title="Numbered List" icon={ListOrdered} active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
        <TB title="Blockquote" icon={Quote} active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
        <TB title="Code Block" icon={Code2} active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()} />
        <Sep />
        <TB title="Align Left" icon={AlignLeft} active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} />
        <TB title="Align Center" icon={AlignCenter} active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} />
        <TB title="Align Right" icon={AlignRight} active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} />
        <Sep />
        <TB title="Link" icon={Link2} active={editor.isActive('link')} onClick={addLink} />
        <TB title="Image" icon={ImageIcon} active={false} onClick={addImage} />
        <TB title="Table" icon={TableIcon} active={false} onClick={addTable} />
        <TB title="Horizontal Rule" icon={Minus} active={false} onClick={() => editor.chain().focus().setHorizontalRule().run()} />
        <Sep />
        <TB title="Undo" icon={Undo2} active={false} onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} />
        <TB title="Redo" icon={Redo2} active={false} onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} />
      </div>

      {/* Editor area — white page */}
      <div className="flex-1 overflow-auto py-8 flex justify-center" style={{ background: 'var(--pal-bone)' }}>
        <div
          className="w-full shadow-2xl"
          style={{
            maxWidth: 794,
            minHeight: 1123,
            background: '#fff',
            borderRadius: 4,
            border: '2px solid var(--pal-cafenoir)',
            borderBottom: '8px solid var(--pal-cafenoir)',
          }}
        >
          <style>{`
            .prose-custom h1 { font-size: 2rem; font-weight: 900; margin: 1rem 0 0.5rem; color: #131F24; }
            .prose-custom h2 { font-size: 1.5rem; font-weight: 800; margin: 0.875rem 0 0.4rem; color: #131F24; }
            .prose-custom h3 { font-size: 1.2rem; font-weight: 700; margin: 0.75rem 0 0.35rem; color: #131F24; }
            .prose-custom p { margin: 0.4rem 0; }
            .prose-custom ul, .prose-custom ol { padding-left: 1.5rem; margin: 0.5rem 0; }
            .prose-custom li { margin: 0.2rem 0; }
            .prose-custom blockquote { border-left: 4px solid #58CC02; padding-left: 1rem; margin: 0.75rem 0; color: #555; font-style: italic; }
            .prose-custom code { background: #F0F4F8; padding: 0.1em 0.4em; border-radius: 4px; font-size: 0.875em; color: #c7254e; }
            .prose-custom pre { background: #1A2028; color: #ccc; padding: 1rem; border-radius: 8px; overflow-x: auto; margin: 0.75rem 0; }
            .prose-custom pre code { background: transparent; color: inherit; padding: 0; }
            .prose-custom table { border-collapse: collapse; width: 100%; margin: 0.75rem 0; }
            .prose-custom th { background: #F0F9E8; padding: 8px 12px; border: 1px solid #D4D4D4; font-weight: 800; text-align: left; }
            .prose-custom td { padding: 8px 12px; border: 1px solid #D4D4D4; }
            .prose-custom a { color: #1CB0F6; text-decoration: underline; }
            .prose-custom hr { border: none; border-top: 2px solid #E0E0E0; margin: 1rem 0; }
            .prose-custom img { max-width: 100%; border-radius: 8px; margin: 0.5rem 0; }
            .ProseMirror-placeholder { color: rgba(0,0,0,0.3); pointer-events: none; }
          `}</style>
          <EditorContent editor={editor} className="h-full" />
        </div>
      </div>

      {/* Status bar */}
      <div
        className="flex items-center justify-end gap-4 px-6 py-1.5 flex-shrink-0"
        style={{ background: 'var(--pal-tan)', borderTop: '2px solid var(--pal-cafenoir)' }}
      >
        <span className="text-xs font-bold" style={{ color: 'var(--pal-moss)' }}>{wordCount} words</span>
        <span className="text-xs font-bold" style={{ color: 'var(--pal-moss)' }}>{charCount} characters</span>
      </div>
    </div>
  );
}
