// ─────────────────────────────────────────────────────
//  Good Notes — Shared TypeScript Types
// ─────────────────────────────────────────────────────

export type NoteType =
  | 'notebook'
  | 'document'
  | 'whiteboard'
  | 'folder'
  | 'quicknote'
  | 'pdf';

export type PaperType =
  | 'blank'
  | 'dotted'
  | 'ruled-narrow'
  | 'ruled-wide'
  | 'squared'
  | 'cornell'
  | 'legal'
  | 'single-column'
  | 'three-column'
  | 'monthly'
  | 'weekly'
  | 'todos';

export type PaperColor = 'white' | 'yellow' | 'dark';

export type CoverStyle = 'simple' | 'linen' | 'kraft' | 'black' | 'navy' | 'rose' | 'sage';

export interface CanvasPage {
  id: string;
  fabricJSON: string;    // Fabric.js canvas JSON
  thumbnail?: string;    // base64 PNG preview
}

export interface NoteItem {
  id: string;
  type: NoteType;
  title: string;
  folderId: string | null;   // null = root level
  createdAt: string;          // ISO string
  updatedAt: string;
  favorite: boolean;
  deleted: boolean;

  // Visual
  color?: string;             // folder color
  coverStyle?: CoverStyle;
  paperType?: PaperType;
  paperColor?: PaperColor;

  // Content
  pages?: CanvasPage[];       // notebook / whiteboard pages
  richContent?: string;       // Tiptap HTML

  // PDF
  pdfName?: string;
  pdfData?: string;            // base64 encoded PDF
  pdfAnnotations?: Record<number, string>; // pageIndex → fabric JSON

  // Thumbnail
  thumbnail?: string;          // base64 PNG for card preview
}

// Cover style definitions
export const COVER_STYLES: Record<CoverStyle, { label: string; bg: string; border: string }> = {
  simple:  { label: 'Simple',  bg: '#D4C5B0',        border: '#B8A898' },
  linen:   { label: 'Linen',   bg: '#E8DDD0',        border: '#C4B8A8' },
  kraft:   { label: 'Kraft',   bg: '#C4A882',        border: '#A89068' },
  black:   { label: 'Black',   bg: '#1A1A1A',        border: '#2C2C2C' },
  navy:    { label: 'Navy',    bg: '#1B2A4A',        border: '#2C3D5C' },
  rose:    { label: 'Rose',    bg: '#E8B4B8',        border: '#D4A0A4' },
  sage:    { label: 'Sage',    bg: '#8FAF8F',        border: '#7A9A7A' },
};

export const FOLDER_COLORS = [
  '#58CC02', '#1CB0F6', '#FF4B4B', '#FFD900',
  '#CE82FF', '#FF9600', '#00B8D9', '#E8E8E8',
];

export const PAPER_TYPE_GROUPS = [
  {
    group: 'Essentials',
    types: [
      { id: 'blank',       label: 'Blank' },
      { id: 'dotted',      label: 'Dotted' },
      { id: 'ruled-narrow', label: 'Ruled Narrow' },
      { id: 'ruled-wide',  label: 'Ruled Wide' },
      { id: 'squared',     label: 'Squared' },
    ] as { id: PaperType; label: string }[],
  },
  {
    group: 'Writing Papers',
    types: [
      { id: 'cornell',         label: 'Cornell' },
      { id: 'legal',           label: 'Legal' },
      { id: 'single-column',   label: 'Single Column' },
      { id: 'three-column',    label: 'Three Column' },
    ] as { id: PaperType; label: string }[],
  },
  {
    group: 'Planner',
    types: [
      { id: 'monthly', label: 'Monthly' },
      { id: 'weekly',  label: 'Weekly' },
      { id: 'todos',   label: 'Todos' },
    ] as { id: PaperType; label: string }[],
  },
];
