'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ChevronLeft, ChevronRight, X, Plus, Bell, CheckCircle2, Circle, 
  Calendar, Clock, FileText, GraduationCap, AlertTriangle, 
  BookOpen, ClipboardList, Megaphone, MapPin, ExternalLink, Info
} from 'lucide-react';
import { UNIVERSITIES, University } from './university-data';

/* ═══════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════ */

type MarkingType = 'application' | 'deadline' | 'exam' | 'result';

interface CalendarMarking {
  id: string;
  date: string; // YYYY-MM-DD
  type: MarkingType;
  universityShortName: string;
  notes: string;
  checklist?: { item: string; done: boolean; howTo: string }[];
  done?: boolean; // Added for general marking strike-through
}

interface TodoItem {
  markingId: string;
  label: string;
  done: boolean;
  dueDate: string;
  type: MarkingType;
  universityShortName: string;
}

/* ═══════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════ */

const MARKING_COLORS: Record<MarkingType, { bg: string; border: string; text: string; label: string; icon: React.ReactNode }> = {
  application: { bg: 'var(--duo-green)', border: 'var(--duo-green-dark)', text: '#fff', label: 'Application', icon: <FileText size={14} /> },
  deadline:    { bg: 'var(--duo-red)',   border: 'var(--duo-red-dark)',   text: '#fff', label: 'Deadline',    icon: <AlertTriangle size={14} /> },
  exam:        { bg: 'var(--duo-blue)',  border: 'var(--duo-blue-dark)',  text: '#fff', label: 'Test Exam',   icon: <BookOpen size={14} /> },
  result:      { bg: 'var(--duo-gold)',  border: 'var(--duo-gold-dark)',  text: 'var(--pal-cafenoir)', label: 'Results', icon: <ClipboardList size={14} /> },
};

const REQUIREMENT_HOW_TO: Record<string, string> = {
  'Form 137': 'Request from your high school registrar. Bring a valid ID and allow 3–5 business days.',
  'Form 138': 'Request from your high school registrar. This is your report card for Grade 11–12.',
  'PSA Birth Certificate': 'Order online at PSA Serbilis (psaserbilis.com.ph) or visit PSA outlet. ~₱365, 5–7 days.',
  'Good Moral Character': 'Request from your school guidance office. Usually free, 1–3 days processing.',
  'Good Moral Certificate': 'Request from your school guidance office. Usually free, 1–3 days processing.',
  'Medical Certificate': 'Visit your school clinic or a licensed physician for a general health check-up.',
  'Application Form (online)': 'Visit the university\'s admissions portal and fill out the online application form.',
  'Application Form': 'Visit the university\'s admissions portal and fill out the online application form.',
  'Online Application Form': 'Go to the university website → Admissions → Apply Online.',
  'Online Application': 'Go to the university website → Admissions → Apply Online.',
  'ACET Application Form': 'Available on the Ateneo admissions website during the application window.',
  'Recommendation Letter': 'Ask a teacher or school administrator who knows you well. Give them at least 2 weeks.',
  'Grade 10 Report Card': 'Request from your school registrar if you don\'t have your copy.',
  'Grade 12 Report Card': 'Request from your school registrar once grades are finalized.',
  'School Certification': 'Request from the principal\'s office. Usually 1–2 days processing.',
  'Online Exam Permit': 'Generated after completing the online application and payment.',
  'Entrance Exam Permit': 'Generated after completing the online application and payment.',
  'Accomplished Form': 'Download from the university admissions website and fill out completely.',
};

/* ═══════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════ */

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay(); // 0=Sun
}

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseSimpleDate(dateStr: string): Date | null {
  // Try to parse "Jun 1, 2026", "Aug 15, 2026", "Sep 2026", etc.
  const full = Date.parse(dateStr);
  if (!isNaN(full)) return new Date(full);
  
  // Try "Month YYYY"
  const monthYear = dateStr.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (monthYear) {
    const d = new Date(`${monthYear[1]} 1, ${monthYear[2]}`);
    if (!isNaN(d.getTime())) return d;
  }
  
  // Try range like "Aug 10–11, 2026" — use first date
  const range = dateStr.match(/^([A-Za-z]+)\s+(\d+)/);
  if (range) {
    const yearMatch = dateStr.match(/(\d{4})/);
    if (yearMatch) {
      const d = new Date(`${range[1]} ${range[2]}, ${yearMatch[1]}`);
      if (!isNaN(d.getTime())) return d;
    }
  }
  return null;
}

function daysUntil(dateStr: string): number {
  const d = parseSimpleDate(dateStr);
  if (!d) return Infinity;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/* ═══════════════════════════════════════════════════════
   MODAL SHELL
   ═══════════════════════════════════════════════════════ */

function Modal({ isOpen, onClose, title, children, wide }: { isOpen: boolean; onClose: () => void; title: React.ReactNode; children: React.ReactNode; wide?: boolean }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div 
        onClick={e => e.stopPropagation()}
        className={`w-full ${wide ? 'max-w-lg' : 'max-w-md'} rounded-[32px] overflow-hidden shadow-2xl relative`}
        style={{ background: 'var(--pal-bone)', border: '2px solid var(--pal-cafenoir)', borderBottom: '6px solid var(--pal-cafenoir)' }}
      >
        <div className="flex items-center justify-between p-4 border-b-2" style={{ borderColor: 'var(--pal-cafenoir)' }}>
          <h3 className="font-black text-lg flex items-center gap-2" style={{ color: 'var(--pal-cafenoir)' }}>{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full transition-colors hover:bg-black/5">
            <X size={20} style={{ color: 'var(--pal-cafenoir)' }} />
          </button>
        </div>
        <div className="p-5 max-h-[75vh] overflow-y-auto hide-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   DEADLINE TOAST NOTIFICATION
   ═══════════════════════════════════════════════════════ */

function DeadlineToast({ marking, university, onDismiss }: { marking: CalendarMarking; university: University | undefined; onDismiss: () => void }) {
  const style = MARKING_COLORS[marking.type];
  const dLeft = daysUntil(marking.date);

  return (
    <div className="fixed top-6 right-6 z-[60] deadline-toast-enter" style={{ maxWidth: 380 }}>
      <div 
        className="rounded-[32px] p-5 shadow-2xl flex items-start gap-3"
        style={{ background: 'var(--pal-bone)', border: '2px solid var(--pal-cafenoir)', borderBottom: '6px solid var(--pal-cafenoir)' }}
      >
        <div className="w-12 h-12 rounded-[20px] flex items-center justify-center flex-shrink-0"
          style={{ background: style.bg, border: `2px solid ${style.border}` }}
        >
          <Bell size={18} color={style.text} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-sm" style={{ color: 'var(--pal-cafenoir)' }}>
            ⏰ Upcoming {style.label}!
          </p>
          <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--pal-kombu)' }}>
            {university?.shortName || 'Unknown'} — {marking.date}
          </p>
          <p className="text-xs font-bold mt-1" style={{ color: dLeft <= 7 ? 'var(--duo-red)' : 'var(--pal-moss)' }}>
            {dLeft <= 0 ? 'Today or past due!' : `${dLeft} day${dLeft !== 1 ? 's' : ''} away`}
          </p>
        </div>
        <button onClick={onDismiss} className="p-1 rounded-full hover:bg-black/5 flex-shrink-0">
          <X size={16} style={{ color: 'var(--pal-cafenoir)' }} />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ADD MARKING MODAL
   ═══════════════════════════════════════════════════════ */

function AddMarkingModal({ 
  isOpen, onClose, selectedDate, bookmarkedUnis, onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  selectedDate: string; 
  bookmarkedUnis: University[]; 
  onSave: (marking: CalendarMarking) => void;
}) {
  const [step, setStep] = useState<'type' | 'details'>('type');
  const [selectedType, setSelectedType] = useState<MarkingType | null>(null);
  const [selectedUni, setSelectedUni] = useState<string>('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) { setStep('type'); setSelectedType(null); setSelectedUni(''); setNotes(''); }
  }, [isOpen]);

  const handleSelectType = (type: MarkingType) => {
    setSelectedType(type);
    setStep('details');
  };

  const handleSave = () => {
    if (!selectedType || !selectedUni) return;
    const uni = UNIVERSITIES.find(u => u.shortName === selectedUni);
    const checklist = selectedType === 'application' && uni
      ? uni.requirements.map(req => ({ item: req, done: false, howTo: REQUIREMENT_HOW_TO[req] || 'Contact the university admissions office for details.' }))
      : undefined;

    onSave({
      id: generateId(),
      date: selectedDate,
      type: selectedType,
      universityShortName: selectedUni,
      notes,
      checklist,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={<><Plus size={20} style={{ color: 'var(--pal-cafenoir)' }} /> Mark {selectedDate}</>} wide>
      {step === 'type' ? (
        <div className="space-y-3">
          <p className="text-sm font-bold mb-4" style={{ color: 'var(--pal-moss)' }}>What are you marking this date for?</p>
          {(Object.entries(MARKING_COLORS) as [MarkingType, typeof MARKING_COLORS[MarkingType]][]).map(([type, style]) => (
            <button
              key={type}
              onClick={() => handleSelectType(type)}
              className="w-full flex items-center gap-3 p-4 rounded-[24px] transition-transform hover:-translate-y-0.5 active:translate-y-0"
              style={{ background: 'var(--pal-tan)', border: '2px solid var(--pal-cafenoir)', borderBottom: '4px solid var(--pal-cafenoir)' }}
            >
              <div className="w-12 h-12 rounded-[20px] flex items-center justify-center" style={{ background: style.bg, border: `2px solid ${style.border}` }}>
                <span style={{ color: style.text }}>{style.icon}</span>
              </div>
              <span className="font-black text-sm uppercase tracking-wider" style={{ color: 'var(--pal-cafenoir)' }}>{style.label}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-2" style={{ color: 'var(--pal-cafenoir)' }}>University</label>
            {bookmarkedUnis.length === 0 ? (
              <div className="p-4 rounded-xl text-center" style={{ border: '2px dashed var(--pal-moss)' }}>
                <p className="text-sm font-bold" style={{ color: 'var(--pal-moss)' }}>No bookmarked schools yet.<br/>Bookmark schools in the Universities tab first.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto hide-scrollbar">
                {bookmarkedUnis.map(uni => (
                  <button
                    key={uni.shortName}
                    onClick={() => setSelectedUni(uni.shortName)}
                    className="w-full flex items-center gap-3 p-3 rounded-[20px] transition-colors text-left"
                    style={{
                      background: selectedUni === uni.shortName ? MARKING_COLORS[selectedType!].bg : 'var(--pal-tan)',
                      color: selectedUni === uni.shortName ? MARKING_COLORS[selectedType!].text : 'var(--pal-cafenoir)',
                      border: '2px solid var(--pal-cafenoir)',
                    }}
                  >
                    <span className="font-black text-sm">{uni.shortName}</span>
                    <span className="text-xs font-bold opacity-70 truncate">{uni.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-2" style={{ color: 'var(--pal-cafenoir)' }}>Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add any notes..."
              rows={2}
              className="w-full p-4 rounded-[24px] text-sm font-bold resize-none outline-none"
              style={{ background: 'var(--pal-tan)', color: 'var(--pal-kombu)', border: '2px solid var(--pal-cafenoir)' }}
            />
          </div>

          {/* Application requirements preview */}
          {selectedType === 'application' && selectedUni && (() => {
            const uni = UNIVERSITIES.find(u => u.shortName === selectedUni);
            if (!uni) return null;
            return (
              <div className="rounded-xl p-4" style={{ background: 'var(--pal-tan)', border: '2px solid var(--pal-cafenoir)' }}>
                <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: 'var(--pal-cafenoir)' }}>
                  📋 Requirements Checklist
                </p>
                <div className="space-y-2">
                  {uni.requirements.map((req, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Circle size={14} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--pal-moss)' }} />
                      <div>
                        <p className="text-xs font-black" style={{ color: 'var(--pal-kombu)' }}>{req}</p>
                        <p className="text-[10px] font-bold mt-0.5" style={{ color: 'var(--pal-moss)' }}>
                          {REQUIREMENT_HOW_TO[req] || 'Contact the university admissions office.'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setStep('type')}
              className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider"
              style={{ background: 'var(--pal-tan)', color: 'var(--pal-cafenoir)', border: '2px solid var(--pal-cafenoir)', borderBottom: '4px solid var(--pal-cafenoir)' }}
            >
              Back
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedUni}
              className="flex-1 py-4 rounded-[20px] font-black text-xs uppercase tracking-wider transition-transform hover:-translate-y-0.5 disabled:opacity-40 disabled:transform-none"
              style={{ background: 'var(--duo-green)', color: '#fff', border: '2px solid var(--duo-green-dark)', borderBottom: '4px solid var(--duo-green-dark)' }}
            >
              Save Marking
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════════
   MARKING DETAIL MODAL
   ═══════════════════════════════════════════════════════ */

function MarkingDetailModal({ 
  isOpen, onClose, marking, onUpdateChecklist, onDelete 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  marking: CalendarMarking | null; 
  onUpdateChecklist: (markingId: string, index: number) => void;
  onDelete: (markingId: string) => void;
}) {
  if (!marking) return null;
  const uni = UNIVERSITIES.find(u => u.shortName === marking.universityShortName);
  const style = MARKING_COLORS[marking.type];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={<>{style.icon} {style.label} Details</>} wide>
      <div className="space-y-4">
        {/* Header info */}
        <div className="flex items-center gap-4 p-5 rounded-[24px]" style={{ background: style.bg, border: `2px solid ${style.border}` }}>
          <div className="flex-1">
            <p className="font-black text-lg" style={{ color: style.text }}>{uni?.shortName || marking.universityShortName}</p>
            <p className="text-sm font-bold opacity-80" style={{ color: style.text }}>{uni?.name}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-black uppercase tracking-wider" style={{ color: style.text }}>{marking.date}</p>
          </div>
        </div>

        {/* University info */}
        {uni && (
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-3 rounded-[20px]" style={{ background: 'var(--pal-tan)', border: '2px solid var(--pal-cafenoir)' }}>
              <span className="block font-black uppercase tracking-wider mb-1" style={{ color: 'var(--pal-cafenoir)', fontSize: '10px' }}>Exam</span>
              <span className="font-bold" style={{ color: 'var(--pal-kombu)' }}>{uni.examDate}</span>
            </div>
            <div className="p-3 rounded-[20px]" style={{ background: 'var(--pal-tan)', border: '2px solid var(--pal-cafenoir)' }}>
              <span className="block font-black uppercase tracking-wider mb-1" style={{ color: 'var(--pal-cafenoir)', fontSize: '10px' }}>Deadline</span>
              <span className="font-bold" style={{ color: 'var(--pal-kombu)' }}>{uni.appDeadline}</span>
            </div>
            <div className="p-3 rounded-[20px]" style={{ background: 'var(--pal-tan)', border: '2px solid var(--pal-cafenoir)' }}>
              <span className="block font-black uppercase tracking-wider mb-1" style={{ color: 'var(--pal-cafenoir)', fontSize: '10px' }}>Results</span>
              <span className="font-bold" style={{ color: 'var(--pal-kombu)' }}>{uni.resultsDate}</span>
            </div>
          </div>
        )}

        {/* Notes */}
        {marking.notes && (
          <div className="p-3 rounded-xl" style={{ background: 'var(--pal-tan)', border: '2px solid var(--pal-cafenoir)' }}>
            <p className="text-xs font-black uppercase tracking-wider mb-1" style={{ color: 'var(--pal-cafenoir)' }}>Notes</p>
            <p className="text-sm font-bold" style={{ color: 'var(--pal-kombu)' }}>{marking.notes}</p>
          </div>
        )}

        {/* Requirements Checklist (for application type) */}
        {marking.type === 'application' && marking.checklist && (
          <div className="rounded-[24px] p-5" style={{ background: 'var(--pal-tan)', border: '2px solid var(--pal-cafenoir)' }}>
            <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: 'var(--pal-cafenoir)' }}>
              📋 Requirements Progress
            </p>
            <div className="space-y-3">
              {marking.checklist.map((item, i) => (
                <button
                  key={i}
                  onClick={() => onUpdateChecklist(marking.id, i)}
                  className="w-full flex items-start gap-3 text-left group"
                >
                  {item.done ? (
                    <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--duo-green)' }} />
                  ) : (
                    <Circle size={18} className="flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" style={{ color: 'var(--pal-moss)' }} />
                  )}
                  <div className="flex-1">
                    <p className={`text-sm font-black ${item.done ? 'line-through opacity-50' : ''}`} style={{ color: 'var(--pal-kombu)' }}>
                      {item.item}
                    </p>
                    <p className="text-[11px] font-bold mt-0.5" style={{ color: 'var(--pal-moss)' }}>
                      {item.howTo}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t-2" style={{ borderColor: 'var(--pal-cafenoir)' }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black" style={{ color: 'var(--pal-cafenoir)' }}>
                  {marking.checklist.filter(c => c.done).length}/{marking.checklist.length} Complete
                </span>
                <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: 'var(--pal-bone)' }}>
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(marking.checklist.filter(c => c.done).length / marking.checklist.length) * 100}%`, 
                      background: 'var(--duo-green)' 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Visit website */}
        {uni && (
          <a 
            href={uni.website} target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-4 rounded-[20px] font-black text-xs uppercase tracking-wider transition-transform hover:-translate-y-1"
            style={{ background: 'var(--duo-blue)', color: '#fff', border: '2px solid var(--pal-cafenoir)', borderBottom: '5px solid var(--pal-cafenoir)' }}
          >
            Visit {uni.shortName} Website <ExternalLink size={14} />
          </a>
        )}

        {/* Delete marking */}
        <button
          onClick={() => { onDelete(marking.id); onClose(); }}
          className="w-full py-3 rounded-[20px] font-black text-xs uppercase tracking-wider transition-transform hover:-translate-y-0.5"
          style={{ background: 'transparent', color: 'var(--duo-red)', border: '2px solid var(--duo-red)', borderBottom: '4px solid var(--duo-red-dark)' }}
        >
          Remove Marking
        </button>
      </div>
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN CALENDAR DASHBOARD
   ═══════════════════════════════════════════════════════ */

export default function CalendarDashboard() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [markings, setMarkings] = useState<CalendarMarking[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  
  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalDate, setAddModalDate] = useState('');
  const [detailMarking, setDetailMarking] = useState<CalendarMarking | null>(null);
  const [showDeadlineToast, setShowDeadlineToast] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('university_bookmarks');
    if (savedBookmarks) {
      try { setBookmarkedIds(JSON.parse(savedBookmarks)); } catch {}
    }
    const savedMarkings = localStorage.getItem('calendar_markings');
    if (savedMarkings) {
      try { setMarkings(JSON.parse(savedMarkings)); } catch {}
    }
  }, []);

  // Save markings to localStorage
  const saveMarkings = useCallback((updated: CalendarMarking[]) => {
    setMarkings(updated);
    localStorage.setItem('calendar_markings', JSON.stringify(updated));
  }, []);

  // Bookmarked universities sorted by nearest deadline
  const bookmarkedUnis = useMemo(() => {
    return UNIVERSITIES
      .filter(u => bookmarkedIds.includes(u.shortName))
      .sort((a, b) => daysUntil(a.appDeadline) - daysUntil(b.appDeadline));
  }, [bookmarkedIds]);

  // Calendar grid data
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  // Markings map for quick lookup (auto-populates bookmarks)
  const markingsMap = useMemo(() => {
    const map: Record<string, CalendarMarking[]> = {};
    
    // Manual
    markings.forEach(m => {
      if (!map[m.date]) map[m.date] = [];
      map[m.date].push(m);
    });

    // Auto-generate from bookmarks
    bookmarkedUnis.forEach(uni => {
      const datesToMap = [
        { d: parseSimpleDate(uni.appDeadline), type: 'deadline' as MarkingType },
        { d: parseSimpleDate(uni.examDate), type: 'exam' as MarkingType },
        { d: parseSimpleDate(uni.resultsDate), type: 'result' as MarkingType }
      ];

      datesToMap.forEach(({ d, type }) => {
        if (d) {
          const dateStr = formatDateKey(d.getFullYear(), d.getMonth(), d.getDate());
          if (!map[dateStr]) map[dateStr] = [];
          
          const exists = map[dateStr].some(m => m.type === type && m.universityShortName === uni.shortName);
          if (!exists) {
            map[dateStr].push({
              id: `auto-${uni.shortName}-${type}`,
              date: dateStr,
              type,
              universityShortName: uni.shortName,
              notes: 'Auto-populated from bookmark',
            });
          }
        }
      });
    });
    return map;
  }, [markings, bookmarkedUnis]);

  // Closest upcoming deadline/marking for toast
  const closestMarking = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return markings
      .filter(m => {
        const d = new Date(m.date);
        return d >= now;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] || null;
  }, [markings]);

  // Todos derived from markings
  const todos: TodoItem[] = useMemo(() => {
    const items: TodoItem[] = [];
    markings.forEach(m => {
      if (m.type === 'application' && m.checklist) {
        m.checklist.forEach(c => {
          items.push({
            markingId: m.id,
            label: `${c.item} — ${UNIVERSITIES.find(u => u.shortName === m.universityShortName)?.shortName || m.universityShortName}`,
            done: c.done,
            dueDate: m.date,
            type: m.type,
            universityShortName: m.universityShortName,
          });
        });
      } else {
        const uni = UNIVERSITIES.find(u => u.shortName === m.universityShortName);
        items.push({
          markingId: m.id,
          label: `${MARKING_COLORS[m.type].label}: ${uni?.shortName || m.universityShortName}`,
          done: !!m.done,
          dueDate: m.date,
          type: m.type,
          universityShortName: m.universityShortName,
        });
      }
    });
    return items.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [markings]);

  // Handlers
  const handleAddMarking = (marking: CalendarMarking) => {
    saveMarkings([...markings, marking]);
  };

  const handleDeleteMarking = (id: string) => {
    saveMarkings(markings.filter(m => m.id !== id));
  };

  const handleToggleChecklist = (markingId: string, index: number) => {
    const updated = markings.map(m => {
      if (m.id === markingId && m.checklist) {
        const newChecklist = [...m.checklist];
        newChecklist[index] = { ...newChecklist[index], done: !newChecklist[index].done };
        return { ...m, checklist: newChecklist };
      }
      return m;
    });
    saveMarkings(updated);
    // Update detail modal if open
    const updatedMarking = updated.find(m => m.id === markingId);
    if (updatedMarking) setDetailMarking(updatedMarking);
  };

  const handleToggleGeneralMarking = (markingId: string) => {
    const updated = markings.map(m => {
      if (m.id === markingId) {
        return { ...m, done: !m.done };
      }
      return m;
    });
    saveMarkings(updated);
    const updatedMarking = updated.find(m => m.id === markingId);
    if (updatedMarking) setDetailMarking(updatedMarking);
  };

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  };

  const goToday = () => { setCurrentMonth(today.getMonth()); setCurrentYear(today.getFullYear()); };

  // Build calendar cells
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">

      {/* Deadline Toast */}
      {showDeadlineToast && closestMarking && (
        <DeadlineToast 
          marking={closestMarking} 
          university={UNIVERSITIES.find(u => u.shortName === closestMarking.universityShortName)}
          onDismiss={() => setShowDeadlineToast(false)} 
        />
      )}

      {/* Two-column layout */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-240px)] min-h-[450px] items-stretch">

        {/* ═══ LEFT COLUMN: Feed + To Do ═══ */}
        <div className="lg:col-span-2 flex flex-col gap-6 h-full min-h-0">

          {/* Exam Feed */}
          <div className="flex-1 flex flex-col min-h-0 rounded-[32px] p-6" style={{ background: 'var(--pal-tan)', border: '2px solid var(--pal-cafenoir)', borderBottom: '6px solid var(--pal-cafenoir)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={18} style={{ color: 'var(--pal-cafenoir)' }} className="fill-current opacity-20" />
              <p className="font-black text-base" style={{ color: 'var(--pal-cafenoir)' }}>Important Deadlines & Results</p>
            </div>

            {bookmarkedUnis.length === 0 ? (
              <div className="flex-1 min-h-0 flex flex-col justify-center items-center p-8 rounded-[24px] text-center" style={{ border: '2px dashed var(--pal-moss)' }}>
                <GraduationCap size={32} className="mx-auto mb-2" style={{ color: 'var(--pal-moss)' }} />
                <p className="text-sm font-bold" style={{ color: 'var(--pal-moss)' }}>No bookmarked schools yet.</p>
                <p className="text-xs font-bold mt-1" style={{ color: 'var(--pal-moss)' }}>Go to "Top Universities" tab and bookmark schools to see them here.</p>
              </div>
            ) : (
              <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--pal-cafenoir) transparent' }}>
                {bookmarkedUnis.map((uni, i) => {
                  const dl = daysUntil(uni.appDeadline);
                  return (
                    <div
                      key={uni.shortName}
                      className="rounded-[24px] p-5 transition-transform hover:-translate-y-0.5"
                      style={{ background: 'var(--pal-bone)', border: '2px solid var(--pal-cafenoir)', borderBottom: '4px solid var(--pal-cafenoir)', animationDelay: `${i * 60}ms` }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-sm" style={{ color: 'var(--pal-cafenoir)' }}>{uni.examName}</p>
                          <p className="text-xs font-bold mt-0.5" style={{ color: 'var(--pal-moss)' }}>{uni.name}</p>
                          <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-[11px] font-bold" style={{ color: 'var(--pal-kombu)' }}>
                            <div>
                              <span className="block font-black uppercase text-[9px] tracking-wider mb-0.5" style={{ color: 'var(--pal-cafenoir)' }}>Exam</span>
                              {uni.examDate}
                            </div>
                            <div>
                              <span className="block font-black uppercase text-[9px] tracking-wider mb-0.5" style={{ color: 'var(--pal-cafenoir)' }}>Deadline</span>
                              {uni.appDeadline}
                            </div>
                            <div>
                              <span className="block font-black uppercase text-[9px] tracking-wider mb-0.5" style={{ color: 'var(--pal-cafenoir)' }}>Results</span>
                              {uni.resultsDate}
                            </div>
                          </div>
                        </div>
                        <span
                          className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg flex-shrink-0"
                          style={{
                            background: uni.isOpen ? 'var(--duo-green)' : 'var(--pal-tan)',
                            color: uni.isOpen ? '#fff' : 'var(--pal-moss)',
                            border: `2px solid ${uni.isOpen ? 'var(--duo-green-dark)' : 'var(--pal-cafenoir)'}`,
                            borderBottom: `3px solid ${uni.isOpen ? 'var(--duo-green-dark)' : 'var(--pal-cafenoir)'}`,
                          }}
                        >
                          {uni.isOpen ? 'Open' : 'Coming Soon'}
                        </span>
                      </div>
                      {dl !== Infinity && dl > 0 && (
                        <div className="mt-2 flex items-center gap-1.5 text-[10px] font-black" style={{ color: dl <= 30 ? 'var(--duo-red)' : 'var(--pal-moss)' }}>
                          <Clock size={11} />
                          <span>{dl} day{dl !== 1 ? 's' : ''} until deadline</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* To Do Section */}
          <div className="flex-1 flex flex-col min-h-0 rounded-[32px] p-6" style={{ background: 'var(--pal-tan)', border: '2px solid var(--pal-cafenoir)', borderBottom: '6px solid var(--pal-cafenoir)' }}>
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList size={18} style={{ color: 'var(--pal-cafenoir)' }} />
              <p className="font-black text-base" style={{ color: 'var(--pal-cafenoir)' }}>To Do</p>
              {todos.length > 0 && (
                <span className="ml-auto text-[10px] font-black px-2 py-1 rounded-lg" style={{ background: 'var(--duo-blue)', color: '#fff' }}>
                  {todos.filter(t => !t.done).length} pending
                </span>
              )}
            </div>

            {todos.length === 0 ? (
              <div className="flex-1 min-h-0 flex flex-col justify-center items-center p-6 rounded-xl text-center" style={{ border: '2px dashed var(--pal-moss)' }}>
                <p className="text-sm font-bold" style={{ color: 'var(--pal-moss)' }}>No tasks yet. Mark dates on the calendar to generate to-dos.</p>
              </div>
            ) : (
              <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-2" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--pal-cafenoir) transparent' }}>
                {todos.map((todo, i) => {
                  const style = MARKING_COLORS[todo.type];
                  return (
                    <button 
                      key={`${todo.markingId}-${i}`}
                      onClick={() => {
                        if (todo.type === 'application') {
                          const m = markings.find(m => m.id === todo.markingId);
                          if (m && m.checklist) {
                            const chkIdx = m.checklist.findIndex(c => c.item === todo.label.split(' — ')[0]);
                            if (chkIdx >= 0) handleToggleChecklist(todo.markingId, chkIdx);
                          }
                        } else {
                          handleToggleGeneralMarking(todo.markingId);
                        }
                      }}
                      className="w-full flex items-start text-left gap-3 p-4 rounded-[20px] transition-colors hover:bg-[var(--pal-tan)] active:translate-y-0.5"
                      style={{ background: 'var(--pal-bone)', border: '2px solid var(--pal-cafenoir)' }}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {todo.done ? (
                          <CheckCircle2 size={16} style={{ color: 'var(--duo-green)' }} />
                        ) : (
                          <Circle size={16} style={{ color: style.bg }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-black ${todo.done ? 'line-through opacity-40' : ''}`} style={{ color: 'var(--pal-kombu)' }}>
                          {todo.label}
                        </p>
                        <p className="text-[10px] font-bold mt-0.5" style={{ color: 'var(--pal-moss)' }}>
                          Due: {todo.dueDate}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ═══ RIGHT COLUMN: Calendar ═══ */}
        <div className="lg:col-span-3 h-full min-h-0 flex flex-col">
          <div className="flex-1 min-h-0 rounded-2xl overflow-hidden flex flex-col" style={{ background: 'var(--pal-bone)', border: '2px solid var(--pal-cafenoir)', borderBottom: '6px solid var(--pal-cafenoir)' }}>

            {/* Calendar Header */}
            <div className="flex items-center justify-between p-5 border-b-2" style={{ borderColor: 'var(--pal-cafenoir)' }}>
              <div className="flex items-center gap-3">
                <button onClick={prevMonth} className="p-2 rounded-xl transition-transform active:translate-y-0.5" style={{ background: 'var(--pal-tan)', border: '2px solid var(--pal-cafenoir)', borderBottom: '4px solid var(--pal-cafenoir)' }}>
                  <ChevronLeft size={18} style={{ color: 'var(--pal-cafenoir)' }} />
                </button>
                <h2 className="font-black text-xl" style={{ color: 'var(--pal-cafenoir)' }}>
                  {MONTHS[currentMonth]} {currentYear}
                </h2>
                <button onClick={nextMonth} className="p-2 rounded-xl transition-transform active:translate-y-0.5" style={{ background: 'var(--pal-tan)', border: '2px solid var(--pal-cafenoir)', borderBottom: '4px solid var(--pal-cafenoir)' }}>
                  <ChevronRight size={18} style={{ color: 'var(--pal-cafenoir)' }} />
                </button>
              </div>
              <button
                onClick={goToday}
                className="text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-[20px] transition-transform hover:-translate-y-0.5"
                style={{ background: 'var(--duo-blue)', color: '#fff', border: '2px solid var(--duo-blue-dark)', borderBottom: '4px solid var(--duo-blue-dark)' }}
              >
                Today
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 border-b-2" style={{ borderColor: 'var(--pal-cafenoir)' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="py-2.5 text-center text-[11px] font-black uppercase tracking-wider" style={{ color: 'var(--pal-cafenoir)', background: 'var(--pal-tan)' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-y-auto hide-scrollbar">
              <div className="grid grid-cols-7">
              {calendarCells.map((day, i) => {
                if (day === null) {
                  return <div key={`empty-${i}`} className="min-h-[75px] border-r border-b" style={{ borderColor: 'var(--pal-tan)', background: 'var(--pal-tan)', opacity: 0.3 }} />;
                }

                const dateKey = formatDateKey(currentYear, currentMonth, day);
                const dayMarkings = markingsMap[dateKey] || [];
                const isToday = dateKey === todayKey;

                return (
                  <div
                    key={dateKey}
                    className="min-h-[75px] border-r border-b p-1.5 cursor-pointer transition-colors hover:bg-[var(--pal-tan)]/30 group relative"
                    style={{ borderColor: 'var(--pal-tan)', background: isToday ? 'rgba(28, 176, 246, 0.08)' : 'transparent' }}
                    onClick={() => { setAddModalDate(dateKey); setAddModalOpen(true); }}
                  >
                    {/* Day number */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs font-black w-6 h-6 flex items-center justify-center rounded-lg ${isToday ? '' : ''}`}
                        style={{
                          color: isToday ? '#fff' : 'var(--pal-cafenoir)',
                          background: isToday ? 'var(--duo-blue)' : 'transparent',
                        }}
                      >
                        {day}
                      </span>
                      {/* Add button on hover */}
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus size={12} style={{ color: 'var(--pal-moss)' }} />
                      </span>
                    </div>

                    {/* Event blocks */}
                    <div className="space-y-1">
                      {dayMarkings.slice(0, 3).map(m => {
                        const s = MARKING_COLORS[m.type];
                        const uni = UNIVERSITIES.find(u => u.shortName === m.universityShortName);
                        return (
                          <button
                            key={m.id}
                            onClick={(e) => { e.stopPropagation(); setDetailMarking(m); }}
                            className="w-full text-left px-1.5 py-0.5 rounded-md text-[9px] font-black truncate transition-transform hover:scale-[1.02] event-block"
                            style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
                          >
                            {uni?.shortName || m.universityShortName}
                          </button>
                        );
                      })}
                      {dayMarkings.length > 3 && (
                        <span className="text-[9px] font-bold block text-center" style={{ color: 'var(--pal-moss)' }}>
                          +{dayMarkings.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
            </div>

            {/* Calendar Legend */}
            <div className="flex flex-wrap items-center gap-4 p-4 border-t-2" style={{ borderColor: 'var(--pal-cafenoir)' }}>
              {(Object.entries(MARKING_COLORS) as [MarkingType, typeof MARKING_COLORS[MarkingType]][]).map(([type, s]) => (
                <div key={type} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ background: s.bg, border: `1px solid ${s.border}` }} />
                  <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--pal-cafenoir)' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddMarkingModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        selectedDate={addModalDate}
        bookmarkedUnis={bookmarkedUnis}
        onSave={handleAddMarking}
      />

      <MarkingDetailModal
        isOpen={!!detailMarking}
        onClose={() => setDetailMarking(null)}
        marking={detailMarking}
        onUpdateChecklist={handleToggleChecklist}
        onDelete={handleDeleteMarking}
      />
    </div>
  );
}
