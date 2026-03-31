'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Target, BookOpen, ChevronRight, Play, Lock, ArrowLeft } from 'lucide-react';
import { EXAM_REGISTRY, type ExamMeta } from '@/data/exams/registry';

const FAMILY_LABELS: Record<string, string> = {
  USTET: 'UST Entrance Test',
  UPCAT: 'UP College Admission Test',
  ACET: 'Ateneo College Entrance Test',
  PUPCET: 'PUP College Entrance Test',
  DCAT: 'De La Salle College Aptitude Test',
  DOST: 'DOST Scholarship Examination',
};

const UNIVERSITIES = [
  { id: 'UPCAT', name: 'University of the Philippines', short: 'UP', emoji: '✊', passingRate: '12%', takers: '100,000+', color: '#800000', colSpan: 'col-span-1 md:col-span-2' },
  { id: 'USTET', name: 'University of Santo Tomas', short: 'UST', emoji: '🐯', passingRate: '18%', takers: '60,000+', color: '#eab308', colSpan: 'col-span-1 md:row-span-2' },
  { id: 'ACET', name: 'Ateneo de Manila University', short: 'Ateneo', emoji: '🦅', passingRate: '15%', takers: '30,000+', color: '#3b82f6', colSpan: 'col-span-1' },
  { id: 'DCAT', name: 'De La Salle University', short: 'DLSU', emoji: '🏹', passingRate: '25%', takers: '20,000+', color: '#22c55e', colSpan: 'col-span-1' },
  { id: 'PUPCET', name: 'Polytechnic University of the Philippines', short: 'PUP', emoji: '🎒', passingRate: '10%', takers: '80,000+', color: '#800000', colSpan: 'col-span-1 md:col-span-2' },
  { id: 'DOST', name: 'DOST Scholarship', short: 'DOST', emoji: '🔬', passingRate: '8%', takers: '50,000+', color: '#8b5cf6', colSpan: 'col-span-1' },
];

export default function MockExam() {
  const router = useRouter();
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);

  // Group exams by family
  const grouped = EXAM_REGISTRY.reduce<Record<string, ExamMeta[]>>((acc, exam) => {
    if (!acc[exam.examFamily]) acc[exam.examFamily] = [];
    acc[exam.examFamily].push(exam);
    return acc;
  }, {});

  const selectedExams = selectedUniversity ? (grouped[selectedUniversity] || []) : [];
  const selectedUniData = UNIVERSITIES.find(u => u.id === selectedUniversity);

  // If there are no mock exams yet for the selection (e.g. DOST), pad with locked exams
  const mockLockedExams = [
    { id: 'mock-1', subject: 'Science Proficiency', year: '2024', questions: 60, durationMinutes: 50, status: 'locked' },
    { id: 'mock-2', subject: 'Mathematics Proficiency', year: '2024', questions: 60, durationMinutes: 50, status: 'locked' },
    { id: 'mock-3', subject: 'English & Logic', year: '2024', questions: 60, durationMinutes: 50, status: 'locked' },
  ] as any[];
  
  const examsToRender = selectedExams.length === 0 && selectedUniversity ? mockLockedExams : selectedExams;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--pal-bone)' }}>
      <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">
        <div className="max-w-[1440px] mx-auto w-full space-y-4 pb-8">
          
          {/* Header (Study Buddy Style) */}
          <div className="max-w-[1440px] mx-auto w-full mb-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider mb-3"
                  style={{
                    background: 'var(--pal-tan)',
                    color: 'var(--pal-kombu)',
                    border: '2px solid var(--pal-cafenoir)',
                    borderBottom: '4px solid var(--pal-cafenoir)'
                  }}
                >
                  🔥 Overtake Engine — Mock Exams
                </div>
                <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--pal-cafenoir)' }}>Mock Exams</h1>
                <p className="text-base mt-2 font-bold max-w-2xl" style={{ color: 'var(--pal-moss)' }}>
                  Timed simulations from real Philippine college entrance exam test banks.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full border-b-2 mb-4" style={{ borderColor: 'var(--pal-tan)' }} />

          <AnimatePresence mode="wait">
            {!selectedUniversity ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-6xl mx-auto w-full"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 h-[calc(100vh-280px)]" style={{ gridTemplateRows: '1fr 1fr 1fr' }}>
                  {UNIVERSITIES.map((uni, i) => (
                    <motion.button
                      key={uni.id}
                      onClick={() => setSelectedUniversity(uni.id)}
                      className={`card-paper p-4 md:p-5 flex flex-col justify-between text-left transition-transform hover:-translate-y-1 overflow-hidden ${uni.colSpan}`}
                      style={{ border: '3px solid var(--pal-cafenoir)', borderBottomWidth: '5px', background: 'white', borderRadius: '24px', minHeight: 0 }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-2xl md:text-3xl">{uni.emoji}</span>
                        <div className="text-right shrink-0">
                          <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--pal-moss)' }}>Passing Rate</p>
                          <p className="text-xl md:text-2xl font-black" style={{ color: uni.color }}>{uni.passingRate}</p>
                        </div>
                      </div>
                      <div className="mt-auto pt-1">
                        <h3 className="text-xl md:text-2xl font-black tracking-tight leading-tight" style={{ color: 'var(--pal-cafenoir)' }}>{uni.short}</h3>
                        <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider mt-0.5 opacity-70 line-clamp-1" style={{ color: 'var(--pal-cafenoir)' }}>{uni.name}</p>
                        <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-0.5 bg-pal-bone rounded-lg border" style={{ borderColor: 'rgba(56, 43, 33, 0.1)' }}>
                          <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--pal-moss)' }}>{uni.takers}</span>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl mx-auto"
              >
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setSelectedUniversity(null)}
                      className="p-3 bg-white rounded-xl border-2 transition-transform hover:-translate-x-1 shadow-sm"
                      style={{ borderColor: 'var(--pal-cafenoir)', color: 'var(--pal-cafenoir)', borderBottomWidth: '4px' }}
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-3 h-3 rounded-full" style={{ background: selectedUniData?.color }} />
                        <h2 className="text-xl font-black tracking-widest uppercase" style={{ color: 'var(--pal-cafenoir)' }}>
                          {selectedUniversity}
                        </h2>
                        <span className="text-sm font-bold hidden sm:inline" style={{ color: 'var(--pal-moss)' }}>— {FAMILY_LABELS[selectedUniversity]}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  {examsToRender.map((exam, i) => {
                    const isReady = exam.status === 'ready';
                    const color = selectedUniData?.color || '#38bdf8';
                    return (
                      <motion.div
                        key={exam.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.35 }}
                        onClick={() => isReady && router.push(`/mock-exam/${exam.id}`)}
                        className={`card-paper p-5 flex items-center justify-between transition-all duration-200 ${isReady
                            ? 'cursor-pointer hover:scale-[1.01] active:scale-[0.99] bg-white'
                            : 'bg-pal-paper cursor-not-allowed grayscale-[0.5] opacity-80'
                          }`}
                        style={{
                          border: `3px solid var(--pal-cafenoir)`,
                          borderBottomWidth: '6px'
                        }}
                        onMouseEnter={e => {
                          if (isReady) (e.currentTarget as HTMLElement).style.borderColor = color;
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.borderColor = 'var(--pal-cafenoir)';
                        }}
                      >
                        <div className="flex items-center gap-5 sm:gap-6">
                          <div
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 border-2"
                            style={{ 
                              background: isReady ? 'var(--pal-tan)' : 'var(--pal-bone)', 
                              color: isReady ? color : 'var(--pal-moss)',
                              borderColor: isReady ? color : 'var(--pal-cafenoir)' 
                            }}
                          >
                            {isReady ? <Play size={26} fill="currentColor" /> : <Lock size={22} />}
                          </div>
                          <div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                              <p className="font-black text-lg sm:text-xl" style={{ color: 'var(--pal-cafenoir)' }}>
                                {exam.subject}
                              </p>
                              {exam.year && (
                                <span
                                  className="text-[10px] w-max font-black uppercase px-2 py-1 rounded-lg border-2 shadow-sm"
                                  style={{ background: 'var(--pal-tan)', color: 'var(--pal-cafenoir)', borderColor: 'var(--pal-tan)' }}
                                >
                                  {exam.year}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-4 text-[10px] sm:text-xs font-black uppercase tracking-widest" style={{ color: 'var(--pal-moss)' }}>
                              <span className="flex items-center gap-1.5"><Target size={14} /> {exam.questions} items</span>
                              <span className="flex items-center gap-1.5"><Clock size={14} /> {exam.durationMinutes} mins</span>
                            </div>
                          </div>
                        </div>

                        <ChevronRight
                          size={24}
                          className="transition-transform opacity-40 hidden sm:block"
                          style={{ color: isReady ? color : 'var(--pal-cafenoir)' }}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
