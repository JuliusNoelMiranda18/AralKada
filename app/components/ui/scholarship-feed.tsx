'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, FlaskConical, Building, Briefcase, Landmark, GraduationCap, Globe, Building2, CheckCircle2, Circle, Microscope, ShieldCheck, FileText, Pickaxe, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SCHOLARSHIPS, SCHOLARSHIP_CATEGORIES, Scholarship } from './scholarship-data';

const ICONS: Record<string, React.ReactNode> = {
  'flask-conical': <FlaskConical size={18} />,
  'building': <Building size={18} />,
  'briefcase': <Briefcase size={18} />,
  'landmark': <Landmark size={18} />,
  'graduation-cap': <GraduationCap size={18} />,
  'globe': <Globe size={18} />,
  'building-2': <Building2 size={18} />,
  'microscope': <Microscope size={18} />,
};

function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: React.ReactNode; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative"
        style={{ background: 'var(--pal-bone)', border: '2px solid var(--pal-cafenoir)', borderBottom: '6px solid var(--pal-cafenoir)' }}
      >
        <div className="flex items-center justify-between p-4 border-b-2" style={{ borderColor: 'var(--pal-cafenoir)' }}>
          <h3 className="font-black text-lg flex items-center gap-2" style={{ color: 'var(--pal-cafenoir)' }}>{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full transition-colors hover:bg-black/5">
            <X size={20} style={{ color: 'var(--pal-cafenoir)' }} />
          </button>
        </div>
        <div className="p-5 max-h-[75vh] min-h-[300px] overflow-y-auto hide-scrollbar">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

export function ScholarshipFeed() {
  const [selectedDegree, setSelectedDegree] = useState<string>('All');
  const [isDropOpen, setIsDropOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<{ type: 'eligibility' | 'terms', scholar: Scholarship } | null>(null);
  const [eligibilityState, setEligibilityState] = useState<Record<string, Record<number, boolean>>>({});
  
  const [dynamicScholarships, setDynamicScholarships] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedDegree === 'All') {
      setDynamicScholarships([]);
      return;
    }

    const fetchScholarships = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/scholarships', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ degree: selectedDegree })
        });
        const data = await res.json();
        if (data.scholarships) {
          setDynamicScholarships(data.scholarships);
        }
      } catch (e) {
        console.error('Failed to fetch scholarships', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScholarships();
  }, [selectedDegree]);

  const displayedScholarships = selectedDegree === 'All' 
    ? SCHOLARSHIPS 
    : dynamicScholarships;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const handleToggleEligibility = (scholarId: string, reqIndex: number) => {
    setEligibilityState(prev => ({
      ...prev,
      [scholarId]: {
        ...(prev[scholarId] || {}),
        [reqIndex]: !prev[scholarId]?.[reqIndex]
      }
    }));
  };

  return (
    <div className="w-full flex justify-center items-center h-full min-h-[calc(100vh-220px)] flex-col relative px-4 md:px-8">
      
      {/* ── Toolbar / Filtering ── */}
      <div className="w-full max-w-7xl mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black flex items-center gap-2" style={{ color: 'var(--pal-cafenoir)' }}>
            <GraduationCap size={28} /> Fellowships & Scholarships
          </h2>
          <p className="text-sm font-bold mt-1" style={{ color: 'var(--pal-moss)' }}>Find financial aid that matches your degree program.</p>
        </div>
        
        <div className="flex items-center gap-3 relative z-[60] w-full md:w-auto">
          <Filter size={18} style={{ color: 'var(--pal-cafenoir)' }} className="hidden md:block" />
          <div className="relative w-full md:w-[280px]">
            <button 
              onClick={() => setIsDropOpen(!isDropOpen)}
              className="w-full flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border-2 text-sm outline-none transition-all"
              style={{ 
                borderColor: 'var(--pal-cafenoir)', 
                borderBottom: isDropOpen ? '2px solid var(--pal-cafenoir)' : '4px solid var(--pal-cafenoir)',
                transform: isDropOpen ? 'translateY(2px)' : 'none'
              }}
            >
              <div className="flex items-center gap-2 truncate">
                <GraduationCap size={16} style={{ color: 'var(--duo-blue)' }} className="shrink-0" />
                <span className="font-black truncate" style={{ color: 'var(--pal-cafenoir)' }}>
                  {selectedDegree === 'All' ? 'All Degree Programs' : selectedDegree}
                </span>
              </div>
              <ChevronRight className={`shrink-0 transition-transform ${isDropOpen ? '-rotate-90' : 'rotate-90'}`} size={16} style={{ color: 'var(--pal-moss)' }} />
            </button>

            <AnimatePresence>
              {isDropOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border-2 overflow-hidden shadow-2xl z-50 flex flex-col max-h-64 overflow-y-auto hide-scrollbar"
                  style={{ borderColor: 'var(--pal-cafenoir)' }}
                >
                  <button
                    onClick={() => { setSelectedDegree('All'); setIsDropOpen(false); }}
                    className={`w-full text-left px-4 py-3 border-b border-black/5 hover:bg-black/5 flex flex-col transition-colors ${selectedDegree === 'All' ? 'bg-black/5' : ''}`}
                  >
                    <span className="font-black text-sm" style={{ color: 'var(--pal-cafenoir)' }}>All Degree Programs</span>
                  </button>
                  {SCHOLARSHIP_CATEGORIES.filter(c => c !== 'All').map(c => (
                    <button
                      key={c}
                      onClick={() => { setSelectedDegree(c); setIsDropOpen(false); }}
                      className={`w-full text-left px-4 py-3 border-b border-black/5 hover:bg-black/5 flex flex-col transition-colors ${selectedDegree === c ? 'bg-black/5' : ''}`}
                    >
                      <span className="font-black text-sm" style={{ color: 'var(--pal-cafenoir)' }}>{c}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Cards Grid Container ── */}
      <div className="w-full max-w-7xl mx-auto">
        {isLoading && (
          <div className="w-full flex flex-col items-center justify-center py-20 px-4">
            <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mb-4" style={{ borderColor: 'var(--duo-blue)', borderTopColor: 'transparent' }} />
            <p className="font-black text-lg animate-pulse" style={{ color: 'var(--pal-cafenoir)' }}>AI is scanning nationwide for '{selectedDegree}' scholarships...</p>
            <p className="text-sm font-bold opacity-60 mt-1" style={{ color: 'var(--pal-moss)' }}>Querying DOST, CHED, and private institutions directly.</p>
          </div>
        )}

        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8 pt-4">
            {displayedScholarships.map((s, i) => {
              const isDark = i % 2 === 0;
              const bg = isDark ? 'var(--pal-cafenoir)' : 'white';
              const text = isDark ? 'white' : 'var(--pal-cafenoir)';
              const border = isDark ? 'transparent' : 'var(--pal-cafenoir)';
              
              return (
                <div 
                  key={s.id}
                  className="w-full rounded-[24px] p-4 flex flex-col justify-between transition-transform hover:-translate-y-1"
                  style={{ 
                    background: bg, 
                    color: text, 
                    border: isDark ? 'none' : `2px solid ${border}`,
                    boxShadow: isDark ? '0 8px 24px -10px rgba(0,0,0,0.3)' : `0 4px 0 0 ${border}`
                  }}
                >
                  <div>
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                      style={{ 
                        background: isDark ? 'rgba(255,255,255,0.1)' : 'var(--pal-bone)',
                        color: text,
                        border: isDark ? 'none' : `1.5px solid ${border}`
                      }}
                    >
                      {ICONS[s.iconIcon] || <GraduationCap size={16} />}
                    </div>

                    <h3 className="text-lg font-black leading-tight tracking-tight mb-1">{s.name}</h3>
                    <p className="text-[11px] font-bold opacity-80 leading-tight mb-3 line-clamp-2">{s.description}</p>
                  </div>

                  <div>
                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                            style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'var(--pal-tan)', border: isDark ? 'none' : `1px solid ${border}` }}>
                        {s.assessmentType}
                      </span>
                      <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                            style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'var(--pal-tan)', border: isDark ? 'none' : `1px solid ${border}` }}>
                        {s.financialAid}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mb-3">
                      <button 
                        onClick={() => setActiveModal({ type: 'eligibility', scholar: s })}
                        className="flex-1 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-wider transition-opacity hover:opacity-80 flex items-center justify-center gap-1.5"
                        style={{ background: isDark ? 'white' : 'var(--duo-blue)', color: isDark ? 'var(--pal-cafenoir)' : 'white' }}
                      >
                        <ShieldCheck size={10} /> Eligibility
                      </button>
                      <button 
                        onClick={() => setActiveModal({ type: 'terms', scholar: s })}
                        className="flex-1 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-wider transition-opacity hover:opacity-80 flex items-center justify-center gap-1.5"
                        style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'white', color: text, border: isDark ? 'none' : `1.5px solid ${border}` }}
                      >
                        <FileText size={10} /> T&C
                      </button>
                    </div>

                    {/* Footer Line */}
                    <div className="w-full h-px opacity-10 mb-2" style={{ background: text }} />
                    <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest opacity-60">
                      <span className="truncate max-w-[140px]">{s.provider}</span>
                      <span>{s.tier}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && displayedScholarships.length === 0 && (
          <div className="w-full flex justify-center py-20 opacity-50">
            <p className="text-xl font-black" style={{ color: 'var(--pal-cafenoir)' }}>No scholarships available for this filter.</p>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {activeModal?.type === 'eligibility' && (
          <Modal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            title={<><ShieldCheck size={20} style={{ color: 'var(--duo-blue)' }} /> Eligibility Checker</>}
          >
            <div className="space-y-4">
              <div className="p-4 rounded-xl mb-4 text-center" style={{ background: 'var(--pal-tan)', border: '2px dashed var(--pal-cafenoir)' }}>
                <p className="font-black text-sm" style={{ color: 'var(--pal-cafenoir)' }}>{activeModal.scholar.name}</p>
                <p className="text-xs font-bold mt-1" style={{ color: 'var(--pal-moss)' }}>Check off the requirements below to see if you qualify.</p>
              </div>

              <div className="space-y-2">
                {activeModal.scholar.eligibilityRequirements.map((req, i) => {
                  const isChecked = eligibilityState[activeModal.scholar.id]?.[i] || false;
                  return (
                    <button
                      key={i}
                      onClick={() => handleToggleEligibility(activeModal.scholar.id, i)}
                      className="w-full text-left flex items-start gap-3 p-3 rounded-xl transition-colors hover:bg-black/5"
                      style={{ border: '2px solid', borderColor: isChecked ? 'var(--duo-green)' : 'var(--pal-tan)', background: isChecked ? 'var(--duo-green-light)' : 'transparent' }}
                    >
                      {isChecked ? (
                        <CheckCircle2 size={18} className="shrink-0 mt-0.5" style={{ color: 'var(--duo-green)' }} />
                      ) : (
                        <Circle size={18} className="shrink-0 mt-0.5" style={{ color: 'var(--pal-moss)' }} />
                      )}
                      <p className={`text-sm font-bold leading-tight ${isChecked ? 'opacity-70' : ''}`} style={{ color: 'var(--pal-cafenoir)' }}>
                        {req.item}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t-2 mt-4" style={{ borderColor: 'var(--pal-cafenoir)' }}>
                {(() => {
                  const total = activeModal.scholar.eligibilityRequirements.length;
                  const checked = Object.values(eligibilityState[activeModal.scholar.id] || {}).filter(Boolean).length;
                  const percent = Math.round((checked / total) * 100) || 0;
                  return (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--pal-cafenoir)' }}>Match Score</span>
                        <span className="text-sm font-black" style={{ color: percent === 100 ? 'var(--duo-green)' : 'var(--pal-cafenoir)' }}>{percent}%</span>
                      </div>
                      <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'var(--pal-tan)' }}>
                        <div className="h-full transition-all duration-500" style={{ width: `${percent}%`, background: percent === 100 ? 'var(--duo-green)' : 'var(--duo-blue)' }} />
                      </div>
                      {percent === 100 && (
                        <p className="text-center font-black text-xs uppercase tracking-wider mt-3" style={{ color: 'var(--duo-green)' }}>You're fully eligible! Secure your requirements.</p>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </Modal>
        )}

        {activeModal?.type === 'terms' && (
          <Modal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            title={<><FileText size={20} style={{ color: 'var(--duo-gold-dark)' }} /> Terms & Conditions</>}
          >
            <div className="space-y-4">
              <div className="p-4 rounded-xl mb-4" style={{ background: 'var(--pal-tan)', border: '2px solid var(--pal-cafenoir)' }}>
                <p className="font-black text-sm" style={{ color: 'var(--pal-cafenoir)' }}>What is expected of you:</p>
                <p className="text-[11px] font-bold mt-1 leading-relaxed" style={{ color: 'var(--pal-moss)' }}>Scholarships are investments in your future. Familiarize yourself with these crucial conditions to maintain your specific grant.</p>
              </div>

              <div className="space-y-3">
                {activeModal.scholar.termsAndConditions.map((tc, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-black/10">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'var(--pal-cafenoir)', color: 'white' }}>
                      <span className="text-[10px] font-black">{i + 1}</span>
                    </div>
                    <p className="text-sm font-bold leading-relaxed" style={{ color: 'var(--pal-kombu)' }}>
                      {tc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => setActiveModal(null)}
                  className="w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider"
                  style={{ background: 'var(--pal-cafenoir)', color: 'white' }}
                >
                  I Understand
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
