/**
 * Exam Registry
 * Single source of truth for all available mock exams.
 * Add a new entry here when you add a new processed JSON file to data/exams/processed/.
 */

export interface ExamMeta {
  id: string;
  examFamily: string;       // e.g. "USTET", "UPCAT"
  name: string;             // Full display name
  subject: string;          // Subject label
  year?: number;
  questions: number;        // Expected number of questions
  durationMinutes: number;
  status: 'ready' | 'coming-soon';
  color: string;            // Tailwind-compatible hex for accent
}

export const EXAM_REGISTRY: ExamMeta[] = [
// ── USTET ─────────────────────────────────────────────────────────────────
  {
    id: 'ustet-math-2014',
    examFamily: 'USTET',
    name: 'USTET 2014',
    subject: 'Mathematics Proficiency',
    year: 2014,
    questions: 60,
    durationMinutes: 50,
    status: 'ready',
    color: '#38bdf8', // sky-400
  },
  {
    id: 'ustet-english-2014',
    examFamily: 'USTET',
    name: 'USTET 2014',
    subject: 'English Proficiency',
    year: 2014,
    questions: 100,
    durationMinutes: 60,
    status: 'ready',
    color: '#38bdf8',
  },
  {
    id: 'ustet-science-2014',
    examFamily: 'USTET',
    name: 'USTET 2014',
    subject: 'Science Proficiency',
    year: 2014,
    questions: 60,
    durationMinutes: 50,
    status: 'ready',
    color: '#38bdf8',
  },
  {
    id: 'ustet-mental-2014',
    examFamily: 'USTET',
    name: 'USTET 2014',
    subject: 'Mental Ability',
    year: 2014,
    questions: 60,
    durationMinutes: 40,
    status: 'coming-soon',
    color: '#38bdf8',
  },
  {
    id: 'ustet-english-2015',
    examFamily: 'USTET',
    name: 'USTET 2015',
    subject: 'English Proficiency',
    year: 2015,
    questions: 100,
    durationMinutes: 60,
    status: 'ready',
    color: '#38bdf8',
  },
  {
    id: 'ustet-mental-2015',
    examFamily: 'USTET',
    name: 'USTET 2015',
    subject: 'Mental Ability',
    year: 2015,
    questions: 60,
    durationMinutes: 40,
    status: 'ready',
    color: '#38bdf8',
  },
  {
    id: 'ustet-science-2015',
    examFamily: 'USTET',
    name: 'USTET 2015',
    subject: 'Science Proficiency',
    year: 2015,
    questions: 60,
    durationMinutes: 50,
    status: 'coming-soon',
    color: '#38bdf8',
  },
  {
    id: 'ustet-math-2015',
    examFamily: 'USTET',
    name: 'USTET 2015',
    subject: 'Mathematics Proficiency',
    year: 2015,
    questions: 60,
    durationMinutes: 50,
    status: 'coming-soon',
    color: '#38bdf8',
  },

  // ── UPCAT ─────────────────────────────────────────────────────────────────
  {
    id: 'upcat-language',
    examFamily: 'UPCAT',
    name: 'UPCAT',
    subject: 'Language Proficiency',
    questions: 80,
    durationMinutes: 45,
    status: 'ready',
    color: '#a78bfa', // violet-400
  },
  {
    id: 'upcat-science',
    examFamily: 'UPCAT',
    name: 'UPCAT',
    subject: 'Science Proficiency',
    questions: 80,
    durationMinutes: 60,
    status: 'coming-soon',
    color: '#a78bfa',
  },
  {
    id: 'upcat-math',
    examFamily: 'UPCAT',
    name: 'UPCAT',
    subject: 'Mathematics Proficiency',
    questions: 60,
    durationMinutes: 45,
    status: 'ready',
    color: '#a78bfa',
  },
  {
    id: 'upcat-reading',
    examFamily: 'UPCAT',
    name: 'UPCAT',
    subject: 'Reading Proficiency',
    questions: 60,
    durationMinutes: 45,
    status: 'coming-soon',
    color: '#a78bfa',
  },
  {
    id: 'upcat-general',
    examFamily: 'UPCAT',
    name: 'UPCAT',
    subject: 'General Information',
    questions: 50,
    durationMinutes: 30,
    status: 'coming-soon',
    color: '#a78bfa',
  },

  // ── ACET ──────────────────────────────────────────────────────────────────
  {
    id: 'acet-english-2014',
    examFamily: 'ACET',
    name: 'ACET 2014',
    subject: 'English Proficiency',
    year: 2014,
    questions: 60,
    durationMinutes: 30,
    status: 'coming-soon',
    color: '#34d399', // emerald-400
  },
  {
    id: 'acet-math-2014',
    examFamily: 'ACET',
    name: 'ACET 2014',
    subject: 'Math Proficiency',
    year: 2014,
    questions: 40,
    durationMinutes: 30,
    status: 'coming-soon',
    color: '#34d399',
  },
  {
    id: 'acet-reading-2014',
    examFamily: 'ACET',
    name: 'ACET 2014',
    subject: 'Reading Comprehension',
    year: 2014,
    questions: 40,
    durationMinutes: 25,
    status: 'coming-soon',
    color: '#34d399',
  },
  {
    id: 'acet-verbal-2014',
    examFamily: 'ACET',
    name: 'ACET 2014',
    subject: 'Verbal Analogy',
    year: 2014,
    questions: 30,
    durationMinutes: 15,
    status: 'coming-soon',
    color: '#34d399',
  },
  {
    id: 'acet-vocab-2014',
    examFamily: 'ACET',
    name: 'ACET 2014',
    subject: 'Vocabulary Proficiency',
    year: 2014,
    questions: 30,
    durationMinutes: 15,
    status: 'coming-soon',
    color: '#34d399',
  },
  {
    id: 'acet-abstract-2014',
    examFamily: 'ACET',
    name: 'ACET 2014',
    subject: 'Abstract Reasoning',
    year: 2014,
    questions: 40,
    durationMinutes: 20,
    status: 'coming-soon',
    color: '#34d399',
  },
  {
    id: 'acet-logical-2014',
    examFamily: 'ACET',
    name: 'ACET 2014',
    subject: 'Logical Reasoning',
    year: 2014,
    questions: 30,
    durationMinutes: 20,
    status: 'coming-soon',
    color: '#34d399',
  },
  {
    id: 'acet-numerical-2014',
    examFamily: 'ACET',
    name: 'ACET 2014',
    subject: 'Numerical Ability',
    year: 2014,
    questions: 30,
    durationMinutes: 20,
    status: 'coming-soon',
    color: '#34d399',
  },
  {
    id: 'acet-english-2015',
    examFamily: 'ACET',
    name: 'ACET 2015',
    subject: 'English Proficiency',
    year: 2015,
    questions: 60,
    durationMinutes: 30,
    status: 'coming-soon',
    color: '#34d399',
  },

  // ── PUPCET ────────────────────────────────────────────────────────────────
  {
    id: 'pupcet-reviewer',
    examFamily: 'PUPCET',
    name: 'PUPCET',
    subject: 'Full Reviewer',
    questions: 100,
    durationMinutes: 120,
    status: 'coming-soon',
    color: '#fb923c', // orange-400
  },

  // ── DCAT ──────────────────────────────────────────────────────────────────
  {
    id: 'dcat-aptitude-2014',
    examFamily: 'DCAT',
    name: 'DCAT 2014',
    subject: 'General Aptitude',
    year: 2014,
    questions: 60,
    durationMinutes: 40,
    status: 'coming-soon',
    color: '#f472b6', // pink-400
  },
  {
    id: 'dcat-math-2014',
    examFamily: 'DCAT',
    name: 'DCAT 2014',
    subject: 'Mathematics Proficiency',
    year: 2014,
    questions: 50,
    durationMinutes: 40,
    status: 'coming-soon',
    color: '#f472b6',
  },
  {
    id: 'dcat-reading-2014',
    examFamily: 'DCAT',
    name: 'DCAT 2014',
    subject: 'Reading Comprehension',
    year: 2014,
    questions: 40,
    durationMinutes: 30,
    status: 'coming-soon',
    color: '#f472b6',
  },
  {
    id: 'dcat-english-2014',
    examFamily: 'DCAT',
    name: 'DCAT 2014',
    subject: 'English Proficiency',
    year: 2014,
    questions: 40,
    durationMinutes: 30,
    status: 'coming-soon',
    color: '#f472b6',
  },
  {
    id: 'dcat-science-2014',
    examFamily: 'DCAT',
    name: 'DCAT 2014',
    subject: 'Science Proficiency',
    year: 2014,
    questions: 40,
    durationMinutes: 30,
    status: 'coming-soon',
    color: '#f472b6',
  },
];

/** Quick lookup by id */
export function getExamMeta(id: string): ExamMeta | undefined {
  return EXAM_REGISTRY.find(e => e.id === id);
}

/** All unique exam families */
export const EXAM_FAMILIES = [...new Set(EXAM_REGISTRY.map(e => e.examFamily))];
