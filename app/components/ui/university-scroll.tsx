'use client';

import React, { useRef, useState, useEffect } from 'react';
import { MapPin, Calendar, FileText, ExternalLink, GraduationCap, X, Info, Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { UNIVERSITIES, University } from './university-data';
import { SchoolFinderModal } from './school-finder-modal';

/* ─────────────────────────────────────────────
   MODALS
───────────────────────────────────────────── */
function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: React.ReactNode; 
  children: React.ReactNode; 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div 
        className="w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl relative"
        style={{ background: 'var(--pal-bone)', border: '2px solid var(--pal-cafenoir)', borderBottom: '6px solid var(--pal-cafenoir)' }}
      >
        <div className="flex items-center justify-between p-4 border-b-2" style={{ borderColor: 'var(--pal-cafenoir)' }}>
          <h3 className="font-black text-lg flex items-center gap-2" style={{ color: 'var(--pal-cafenoir)' }}>{title}</h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full transition-colors hover:bg-black/5"
          >
            <X size={20} style={{ color: 'var(--pal-cafenoir)' }} />
          </button>
        </div>
        <div className="p-5 max-h-[70vh] overflow-y-auto hide-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   LOGO COMPONENT
───────────────────────────────────────────── */
function UniversityLogo({ uni }: { uni: University }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="w-16 h-16 rounded-[24px] flex items-center justify-center flex-shrink-0 font-black text-sm text-center leading-tight select-none overflow-hidden relative"
      style={{ 
        background: imgError ? uni.color : '#fff', 
        border: '2px solid var(--pal-cafenoir)',
        borderBottom: '4px solid var(--pal-cafenoir)',
        color: imgError ? '#fff' : 'var(--pal-cafenoir)'
      }}
    >
      {!imgError && uni.logoUrl ? (
        <img 
          src={uni.logoUrl} 
          alt={`${uni.shortName} logo`}
          className="w-full h-full object-contain p-1"
          onError={() => setImgError(true)}
          draggable={false}
        />
      ) : (
        <span>{uni.shortName.substring(0, 4)}</span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SINGLE UNIVERSITY CARD
───────────────────────────────────────────── */
function UniversityCard({ 
  uni, 
  isBookmarked, 
  onToggleBookmark 
}: { 
  uni: University, 
  isBookmarked: boolean, 
  onToggleBookmark: () => void 
}) {
  const [showReqs, setShowReqs] = useState(false);
  const [showScholarships, setShowScholarships] = useState(false);

  return (
    <>
      <div
        className="flex-shrink-0 w-[340px] rounded-[32px] p-6 flex flex-col gap-4 select-none relative"
        style={{
          background: 'var(--pal-bone)',
          border: '2px solid var(--pal-cafenoir)',
          borderBottom: '6px solid var(--pal-cafenoir)',
        }}
      >
        {/* Bookmark Button */}
        <button 
          onClick={onToggleBookmark}
          className="absolute top-5 right-5 p-2 rounded-[16px] transition-transform active:translate-y-0.5 z-10"
          style={{ 
            background: isBookmarked ? 'var(--duo-gold)' : 'var(--pal-tan)',
            border: '2px solid var(--pal-cafenoir)',
            borderBottom: '4px solid var(--pal-cafenoir)'
          }}
        >
          {isBookmarked ? 
            <BookmarkCheck size={18} style={{ color: 'var(--pal-cafenoir)' }} /> : 
            <Bookmark size={18} style={{ color: 'var(--pal-cafenoir)' }} />
          }
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 pr-10">
          <UniversityLogo uni={uni} />
          <div className="flex-1 min-w-0 pt-1">
            <p className="font-black text-xl leading-tight truncate" style={{ color: 'var(--pal-cafenoir)' }}>{uni.shortName}</p>
            <p className="text-sm mt-0.5 leading-tight truncate font-bold" style={{ color: 'var(--pal-moss)' }}>
              {uni.name}
            </p>
            <div className="flex items-center gap-1 mt-2">
              <MapPin size={12} style={{ color: 'var(--pal-cafenoir)' }} />
              <span className="text-xs truncate font-bold" style={{ color: 'var(--pal-kombu)' }}>
                {uni.location}
              </span>
            </div>
          </div>
        </div>

        {/* Status & Specializations */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black px-3 py-2 rounded-[16px] uppercase tracking-wider text-center flex-1 truncate" title={uni.specializations.join(', ')} style={{ background: 'var(--pal-tan)', color: 'var(--pal-cafenoir)', border: '2px solid var(--pal-cafenoir)', borderBottom: '3px solid var(--pal-cafenoir)' }}>
            {uni.specializations[0] || 'General'} Focus
          </span>
          <span
            className="text-[10px] font-black px-3 py-2 rounded-[16px] uppercase tracking-wider flex-shrink-0 text-center flex-1"
            style={
              uni.isOpen
                ? { background: 'var(--duo-green)', color: '#fff', border: '2px solid var(--duo-green-dark)', borderBottom: '3px solid var(--duo-green-dark)' }
                : { background: 'var(--pal-tan)', color: 'var(--pal-moss)', border: '2px solid var(--pal-cafenoir)', borderBottom: '3px solid var(--pal-cafenoir)' }
            }
          >
            {uni.isOpen ? 'Apps Open' : 'Coming Soon'}
          </span>
        </div>

        {/* Exam info */}
        <div className="rounded-[24px] p-4 space-y-2 mt-1" style={{ background: 'var(--pal-tan)', border: '2px solid var(--pal-cafenoir)' }}>
          <div className="flex items-center justify-between border-b-2 pb-2 mb-2" style={{ borderColor: 'var(--pal-cafenoir)' }}>
            <span className="text-sm font-black" style={{ color: 'var(--pal-cafenoir)' }}>{uni.examName}</span>
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider" style={{ color: 'var(--pal-kombu)' }}>
              <Calendar size={14} style={{ color: 'var(--pal-cafenoir)', flexShrink: 0 }} />
              <span>{uni.examDate}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[13px] font-bold" style={{ color: 'var(--pal-moss)' }}>
            <div>
              <span className="block text-[10px] font-black uppercase tracking-wider mb-0.5" style={{ color: 'var(--pal-cafenoir)' }}>Deadline</span>
              <span style={{ color: 'var(--pal-kombu)' }}>{uni.appDeadline}</span>
            </div>
            <div>
              <span className="block text-[10px] font-black uppercase tracking-wider mb-0.5" style={{ color: 'var(--pal-cafenoir)' }}>Results</span>
              <span style={{ color: 'var(--pal-kombu)' }}>{uni.resultsDate}</span>
            </div>
          </div>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-2 gap-2 mt-auto pt-2">
          <button
            onClick={() => setShowReqs(true)}
            className="flex items-center justify-center gap-1.5 py-3 rounded-[20px] text-[11px] font-black uppercase tracking-wider transition-transform hover:-translate-y-0.5 active:translate-y-0"
            style={{ 
              background: 'var(--pal-tan)', 
              color: 'var(--pal-cafenoir)', 
              border: '2px solid var(--pal-cafenoir)', 
              borderBottom: '4px solid var(--pal-cafenoir)' 
            }}
          >
            <FileText size={14} />
            Reqs
          </button>
          <button
            onClick={() => setShowScholarships(true)}
            className="flex items-center justify-center gap-1.5 py-3 rounded-[20px] text-[11px] font-black uppercase tracking-wider transition-transform hover:-translate-y-0.5 active:translate-y-0"
            style={{ 
              background: 'var(--duo-gold)', 
              color: 'var(--pal-cafenoir)', 
              border: '2px solid var(--pal-cafenoir)', 
              borderBottom: '4px solid var(--pal-cafenoir)' 
            }}
          >
            <GraduationCap size={14} />
            Scholarships
          </button>
        </div>
      </div>

      {/* Requirements Modal */}
      <Modal isOpen={showReqs} onClose={() => setShowReqs(false)} title={<><FileText size={20} style={{ color: 'var(--pal-cafenoir)' }} /> Requirements</>}>
        <div className="space-y-4 text-sm font-bold" style={{ color: 'var(--pal-moss)' }}>
          <p>The following are the standard requirements for incoming freshmen applying to <strong style={{ color: 'var(--pal-cafenoir)' }}>{uni.name}</strong>:</p>
          <ul className="space-y-3 p-5 rounded-[24px]" style={{ background: 'var(--pal-tan)', border: '2px solid var(--pal-cafenoir)' }}>
            {uni.requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--pal-cafenoir)' }} />
                <span style={{ color: 'var(--pal-kombu)' }}>{req}</span>
              </li>
            ))}
          </ul>
          <div className="pt-2">
            <a 
              href={uni.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-4 rounded-[20px] font-black uppercase tracking-wider transition-transform hover:-translate-y-1"
              style={{ background: 'var(--duo-blue)', color: '#fff', border: '2px solid var(--pal-cafenoir)', borderBottom: '5px solid var(--pal-cafenoir)' }}
            >
              Verify on Official Website <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </Modal>

      {/* Scholarships Modal */}
      <Modal isOpen={showScholarships} onClose={() => setShowScholarships(false)} title={<><GraduationCap size={20} style={{ color: 'var(--pal-cafenoir)' }} /> Scholarships</>}>
        <div className="space-y-4 text-sm font-bold" style={{ color: 'var(--pal-moss)' }}>
          {uni.scholarships.length === 0 || (uni.scholarships.length === 1 && uni.scholarships[0].name === 'None available') ? (
            <div className="p-8 text-center rounded-[24px] flex flex-col items-center gap-3" style={{ background: 'var(--pal-tan)', border: '2px solid var(--pal-cafenoir)' }}>
              <Info size={32} style={{ color: 'var(--pal-cafenoir)' }} />
              <p style={{ color: 'var(--pal-kombu)' }}>No specific institutional scholarships are currently listed for {uni.shortName}.</p>
              <p className="text-xs" style={{ color: 'var(--pal-moss)' }}>You may still apply for external grants like CHED StuFAP, DOST-SEI, or LGU scholarships.</p>
            </div>
          ) : (
            <>
              <p>Available scholarship programs and financial aid for <strong style={{ color: 'var(--pal-cafenoir)' }}>{uni.name}</strong>:</p>
              <div className="space-y-3">
                {uni.scholarships.map((schol, i) => (
                  <div key={i} className="p-5 rounded-[24px]" style={{ background: 'var(--pal-tan)', border: '2px solid var(--pal-cafenoir)', borderBottom: '4px solid var(--pal-cafenoir)' }}>
                    <h4 className="font-black text-base mb-1" style={{ color: 'var(--pal-cafenoir)' }}>{schol.name}</h4>
                    <p className="text-sm font-bold" style={{ color: 'var(--pal-kombu)' }}>{schol.coverage}</p>
                  </div>
                ))}
              </div>
            </>
          )}
          
          <div className="pt-2">
            <a 
              href={uni.scholarshipUrl || uni.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-4 rounded-[20px] font-black uppercase tracking-wider transition-transform hover:-translate-y-1"
              style={{ background: 'var(--duo-gold)', color: 'var(--pal-cafenoir)', border: '2px solid var(--pal-cafenoir)', borderBottom: '5px solid var(--pal-cafenoir)' }}
            >
              View Scholarship Details <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </Modal>
    </>
  );
}

/* ─────────────────────────────────────────────
   UNIVERSITY LIST ITEM (For Filter/Bookmark Views)
───────────────────────────────────────────── */
function UniversityCardList({ 
  uni, 
  isBookmarked, 
  onToggleBookmark,
  matchReason
}: { 
  uni: University, 
  isBookmarked: boolean, 
  onToggleBookmark: () => void,
  matchReason?: string 
}) {
  const [showReqs, setShowReqs] = useState(false);
  const [showScholarships, setShowScholarships] = useState(false);

  return (
    <>
      <div 
        className="w-full rounded-[32px] p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center transition-transform hover:-translate-y-0.5"
        style={{
          background: 'var(--pal-bone)',
          border: '2px solid var(--pal-cafenoir)',
          borderBottom: '6px solid var(--pal-cafenoir)'
        }}
      >
        <UniversityLogo uni={uni} />
        <div className="flex-1 min-w-0 w-full pt-1 sm:pt-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
             <h3 className="font-black text-xl leading-tight truncate" style={{ color: 'var(--pal-cafenoir)' }}>
               {uni.shortName}
             </h3>
             {matchReason && (
               <span 
                 className="text-[10px] px-2.5 py-1.5 rounded-[12px] font-black uppercase tracking-wider" 
                 style={{ 
                   background: 'var(--duo-green)', 
                   color: '#fff', 
                   border: '2px solid var(--duo-green-dark)' 
                 }}
               >
                 {matchReason}
               </span>
             )}
          </div>
          <p className="text-sm font-bold mt-0.5 truncate" style={{ color: 'var(--pal-moss)' }}>
            {uni.name} <span style={{ opacity: 0.5 }}>•</span> {uni.location}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => setShowReqs(true)}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-[20px] text-[10px] font-black uppercase tracking-wider transition-transform hover:-translate-y-0.5 active:translate-y-0"
              style={{ 
                background: 'var(--pal-tan)', 
                color: 'var(--pal-cafenoir)', 
                border: '2px solid var(--pal-cafenoir)', 
                borderBottom: '4px solid var(--pal-cafenoir)' 
              }}
            >
              <FileText size={12} />
              Reqs
            </button>
            <button
              onClick={() => setShowScholarships(true)}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-[20px] text-[10px] font-black uppercase tracking-wider transition-transform hover:-translate-y-0.5 active:translate-y-0"
              style={{ 
                background: 'var(--duo-gold)', 
                color: 'var(--pal-cafenoir)', 
                border: '2px solid var(--pal-cafenoir)', 
                borderBottom: '4px solid var(--pal-cafenoir)' 
              }}
            >
              <GraduationCap size={12} />
              Scholarships
            </button>
          </div>
        </div>
        <button 
            onClick={onToggleBookmark}
            className="p-2 rounded-xl transition-transform active:translate-y-0.5 flex-shrink-0 self-end sm:self-center"
            style={{ 
              background: isBookmarked ? 'var(--duo-gold)' : 'var(--pal-tan)',
              border: '2px solid var(--pal-cafenoir)',
              borderBottom: '4px solid var(--pal-cafenoir)'
            }}
          >
            {isBookmarked ? 
              <BookmarkCheck size={20} style={{ color: 'var(--pal-cafenoir)' }} /> : 
              <Bookmark size={20} style={{ color: 'var(--pal-cafenoir)' }} />
            }
        </button>
      </div>

      <Modal isOpen={showReqs} onClose={() => setShowReqs(false)} title={<><FileText size={20} style={{ color: 'var(--pal-cafenoir)' }} /> Requirements</>}>
        <div className="space-y-4 text-sm font-bold" style={{ color: 'var(--pal-moss)' }}>
          <p>The following are the standard requirements for incoming freshmen applying to <strong style={{ color: 'var(--pal-cafenoir)' }}>{uni.name}</strong>:</p>
          <ul className="space-y-3 p-4 rounded-xl" style={{ background: 'var(--pal-tan)', border: '2px solid var(--pal-cafenoir)' }}>
            {uni.requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--pal-cafenoir)' }} />
                <span style={{ color: 'var(--pal-kombu)' }}>{req}</span>
              </li>
            ))}
          </ul>
          <div className="pt-2">
            <a 
              href={uni.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black uppercase tracking-wider transition-transform hover:-translate-y-1 active:translate-y-0 active:border-b-[2px]"
              style={{ background: 'var(--duo-blue)', color: '#fff', border: '2px solid var(--pal-cafenoir)', borderBottom: '5px solid var(--pal-cafenoir)' }}
            >
              Verify on Official Website <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showScholarships} onClose={() => setShowScholarships(false)} title={<><GraduationCap size={20} style={{ color: 'var(--pal-cafenoir)' }} /> Scholarships</>}>
        <div className="space-y-4 text-sm font-bold" style={{ color: 'var(--pal-moss)' }}>
          {uni.scholarships.length === 0 || (uni.scholarships.length === 1 && uni.scholarships[0].name === 'None available') ? (
            <div className="p-6 text-center rounded-xl flex flex-col items-center gap-3" style={{ background: 'var(--pal-tan)', border: '2px solid var(--pal-cafenoir)' }}>
              <Info size={32} style={{ color: 'var(--pal-cafenoir)' }} />
              <p style={{ color: 'var(--pal-kombu)' }}>No specific institutional scholarships are currently listed for {uni.shortName}.</p>
              <p className="text-xs" style={{ color: 'var(--pal-moss)' }}>You may still apply for external grants like CHED StuFAP, DOST-SEI, or LGU scholarships.</p>
            </div>
          ) : (
            <>
              <p>Available scholarship programs and financial aid for <strong style={{ color: 'var(--pal-cafenoir)' }}>{uni.name}</strong>:</p>
              <div className="space-y-3">
                {uni.scholarships.map((schol, i) => (
                  <div key={i} className="p-4 rounded-xl" style={{ background: 'var(--pal-tan)', border: '2px solid var(--pal-cafenoir)', borderBottom: '4px solid var(--pal-cafenoir)' }}>
                    <h4 className="font-black text-base mb-1" style={{ color: 'var(--pal-cafenoir)' }}>{schol.name}</h4>
                    <p className="text-sm font-bold" style={{ color: 'var(--pal-kombu)' }}>{schol.coverage}</p>
                  </div>
                ))}
              </div>
            </>
          )}
          
          <div className="pt-2">
            <a 
              href={uni.scholarshipUrl || uni.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black uppercase tracking-wider transition-transform hover:-translate-y-1 active:translate-y-0 active:border-b-[2px]"
              style={{ background: 'var(--duo-gold)', color: 'var(--pal-cafenoir)', border: '2px solid var(--pal-cafenoir)', borderBottom: '5px solid var(--pal-cafenoir)' }}
            >
              View Scholarship Details <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </Modal>
    </>
  )
}


/* ─────────────────────────────────────────────
   MAIN CONTAINER
───────────────────────────────────────────── */
export function UniversityScrollFeed() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [isFinderOpen, setIsFinderOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<{
    specializations: string[],
    hasLocationFilter: boolean
  } | null>(null);

  useEffect(() => {
    // Load bookmarks from local storage on mount
    const saved = localStorage.getItem('university_bookmarks');
    if (saved) {
      try { setBookmarkedIds(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const toggleBookmark = (shortName: string) => {
    const updated = bookmarkedIds.includes(shortName) 
      ? bookmarkedIds.filter(id => id !== shortName)
      : [...bookmarkedIds, shortName];
    
    setBookmarkedIds(updated);
    localStorage.setItem('university_bookmarks', JSON.stringify(updated));
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -360, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 360, behavior: 'smooth' });
    }
  };

  const handleApplyFilters = (specializations: string[], hasLocationFilter: boolean) => {
    setActiveFilters({ specializations, hasLocationFilter });
    setShowBookmarksOnly(false); // Reset bookmark view when filtering
  };

  // Top Universities logic
  const top25 = UNIVERSITIES.slice(0, 25);
  const feedUniversities = showBookmarksOnly 
    ? UNIVERSITIES.filter(u => bookmarkedIds.includes(u.shortName)) 
    : top25;

  // Search Results logic
  let searchResultsList: (University & { matchReason?: string })[] = [];
  
  if (activeFilters && activeFilters.specializations.length > 0) {
    searchResultsList = UNIVERSITIES
      .filter(u => u.specializations.some(spec => activeFilters.specializations.includes(spec)))
      .map(m => {
        const matchingSpec = m.specializations.find(s => activeFilters.specializations.includes(s));
        const isTop = top25.some(t => t.shortName === m.shortName);
        const reason = matchingSpec 
          ? `Matches ${matchingSpec} Focus ${isTop ? '• Top University' : ''}` 
          : 'Top University Match';
          
        return {
          ...m,
          matchReason: reason
        };
      }).slice(0, 10);
  }

  return (
    <div className="w-full relative group">
      
      {/* ── Toolbar & Headers ── */}
      <div className="px-6 md:px-8 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        {/* Title */}
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap size={22} style={{ color: 'var(--pal-cafenoir)' }} />
            <p className="font-black text-2xl" style={{ color: 'var(--pal-cafenoir)' }}>
              {showBookmarksOnly ? 'My Bookmarked Schools' : 'Top Universities'}
            </p>
          </div>
          <p className="text-sm mt-1 font-bold" style={{ color: 'var(--pal-moss)' }}>
            {showBookmarksOnly ? 'Your saved university profiles.' : 'Entrance exam schedules, deadlines, and requirements at a glance.'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setShowBookmarksOnly(!showBookmarksOnly);
              if (!showBookmarksOnly) setActiveFilters(null);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-transform active:translate-y-0 active:border-b-[2px]"
            style={{ 
              background: showBookmarksOnly ? 'var(--duo-gold)' : 'var(--pal-tan)', 
              color: 'var(--pal-cafenoir)', 
              border: '2px solid var(--pal-cafenoir)', 
              borderBottom: '4px solid var(--pal-cafenoir)' 
            }}
          >
           <Bookmark size={16} />
           {showBookmarksOnly ? 'Back to Top 25' : 'My Bookmarks'}
          </button>
          <button
            onClick={() => setIsFinderOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-transform hover:-translate-y-0.5 active:translate-y-0 active:border-b-[2px]"
            style={{ 
              background: activeFilters ? 'var(--duo-green)' : 'var(--duo-blue)', 
              color: '#fff', 
              border: '2px solid var(--pal-cafenoir)', 
              borderBottom: '4px solid var(--pal-cafenoir)' 
            }}
          >
           <Search size={16} />
           {activeFilters ? 'Update Search' : 'Find A School'}
          </button>
        </div>
      </div>

      {/* ── Main Feed (Cards) ── */}
      <div className="relative max-w-7xl mx-auto px-6 md:px-8 mb-4">
        {/* Navigation Arrows */}
        <button 
          onClick={scrollLeft}
          className="absolute left-10 md:left-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center transition-transform active:translate-y-0 active:border-b-2"
          style={{ background: '#fff', border: '2px solid var(--pal-cafenoir)', borderBottom: '6px solid var(--pal-cafenoir)' }}
        >
          <ChevronLeft size={24} style={{ color: 'var(--pal-cafenoir)' }} />
        </button>

        <button 
          onClick={scrollRight}
          className="absolute right-10 md:right-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center transition-transform active:translate-y-0 active:border-b-2"
          style={{ background: '#fff', border: '2px solid var(--pal-cafenoir)', borderBottom: '6px solid var(--pal-cafenoir)' }}
        >
          <ChevronRight size={24} style={{ color: 'var(--pal-cafenoir)' }} />
        </button>

        {/* Scroll Track */}
        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto hide-scrollbar pt-2 pb-6 px-4 -mx-4 items-stretch"
          style={{ 
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth'
          }}
        >
          {feedUniversities.length === 0 ? (
            <div className="w-full flex-shrink-0 flex items-center justify-center p-12 text-center rounded-2xl" style={{ border: '2px dashed var(--pal-moss)' }}>
              <p className="font-bold text-sm" style={{ color: 'var(--pal-moss)' }}>No bookmarked universities yet.</p>
            </div>
          ) : (
            feedUniversities.map((uni, i) => (
              <div key={`${uni.shortName}-card-${i}`} style={{ scrollSnapAlign: 'start' }}>
                <UniversityCard 
                  uni={uni} 
                  isBookmarked={bookmarkedIds.includes(uni.shortName)}
                  onToggleBookmark={() => toggleBookmark(uni.shortName)}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Separate Search Results Selection (List) ── */}
      {activeFilters && (
        <div className="px-6 md:px-8 max-w-4xl mx-auto mb-16 pt-6 border-t-2" style={{ borderColor: 'var(--pal-tan)' }}>
          <div className="flex items-center justify-between mb-4">
             <h2 className="font-black text-xl" style={{ color: 'var(--pal-cafenoir)' }}>Search Results (1-10)</h2>
             <button 
               onClick={() => setActiveFilters(null)}
               className="text-xs font-bold uppercase tracking-wider underline transition-opacity hover:opacity-70"
               style={{ color: 'var(--duo-red-dark)' }}
             >
               Clear Results
             </button>
          </div>
          
          <div className="space-y-4">
            {searchResultsList.length === 0 ? (
              <div className="w-full flex flex-col items-center justify-center p-12 text-center rounded-2xl" style={{ border: '2px dashed var(--pal-moss)' }}>
                <p className="font-black text-xl mb-2" style={{ color: 'var(--pal-cafenoir)' }}>No Schools Found</p>
                <p className="font-bold text-sm" style={{ color: 'var(--pal-moss)' }}>Adjust your filters to see more results.</p>
              </div>
            ) : (
              searchResultsList.map((uni, i) => (
                <UniversityCardList 
                  key={`${uni.shortName}-list-${i}`}
                  uni={uni}
                  matchReason={uni.matchReason}
                  isBookmarked={bookmarkedIds.includes(uni.shortName)}
                  onToggleBookmark={() => toggleBookmark(uni.shortName)}
                />
              ))
            )}
          </div>
        </div>
      )}

      <SchoolFinderModal 
        isOpen={isFinderOpen} 
        onClose={() => setIsFinderOpen(false)}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
}
