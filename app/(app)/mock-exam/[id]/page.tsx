'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Flag, ChevronLeft, ChevronRight, CheckCircle,
  AlertTriangle, X, Loader2, BookOpen, LayoutGrid, Lightbulb, RefreshCw
} from 'lucide-react';
import { getExamMeta } from '@/data/exams/registry';

// ─── Types ──────────────────────────────────────────────────────────────────
interface Question {
  id: number;
  text: string;
  options: string[];
  answer: string;       // "A" | "B" | "C" | "D"
  explanation: string;
  hasDiagram?: boolean;
}

interface ExamData {
  id: string;
  name: string;
  subject: string;
  durationMinutes: number;
  totalQuestions: number;
  questions: Question[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const getLetter = (index: number) => String.fromCharCode(65 + index);

// ─── Component ────────────────────────────────────────────────────────────────
export default function ExamSession() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;

  // ── Data State ─────────────────────────────────────────────────
  const [examData, setExamData]   = useState<ExamData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Session State ──────────────────────────────────────────────
  const [currentIdx, setCurrentIdx]           = useState(0);
  const [answers, setAnswers]                 = useState<Record<number, string>>({});
  const [flags, setFlags]                     = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft]               = useState(0);
  const [isSubmitModalOpen, setIsSubmitModal] = useState(false);
  const [isFinished, setIsFinished]           = useState(false);
  const [isGridOpen, setIsGridOpen]           = useState(false);

  // ── Hints State ────────────────────────────────────────────────
  const [hintsRemaining, setHintsRemaining] = useState(5);
  const [showHintModal, setShowHintModal] = useState(false);
  const [activeHints, setActiveHints] = useState<Record<number, string>>({});
  const [isGeneratingHint, setIsGeneratingHint] = useState(false);

  // ── Similar Questions State (Results) ──────────────────────────
  const [similarQuestions, setSimilarQuestions] = useState<Record<number, any>>({});
  const [similarStates, setSimilarStates] = useState<Record<number, 'idle' | 'loading' | 'active'>>({});
  const [similarAnswers, setSimilarAnswers] = useState<Record<number, string>>({}); // user's answer to similar q

  // ── Load exam data ─────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/exam/${examId}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load exam');
        setExamData(json);
        setTimeLeft(json.durationMinutes * 60);
      } catch (e: any) {
        setLoadError(e.message);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [examId]);

  // ── Timer ──────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    setIsFinished(true);
    setIsSubmitModal(false);
  }, []);

  useEffect(() => {
    if (isFinished || !examData) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) { clearInterval(timer); handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isFinished, examData, handleSubmit]);

  // ── Actions ────────────────────────────────────────────────────
  const handleSelectAnswer = (optionIndex: number) => {
    if (!examData) return;
    const q = examData.questions[currentIdx];
    setAnswers(prev => ({ ...prev, [q.id]: getLetter(optionIndex) }));
  };

  const toggleFlag = () => {
    if (!examData) return;
    const q = examData.questions[currentIdx];
    setFlags(prev => ({ ...prev, [q.id]: !prev[q.id] }));
  };

  const handleUseHint = async () => {
    if (!examData || hintsRemaining <= 0) return;
    setIsGeneratingHint(true);
    const q = examData.questions[currentIdx];
    try {
      const res = await fetch('/api/mock-exam/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'hint',
          questionText: q.text,
          questionOptions: q.options,
          examContext: examData.name
        })
      });
      const data = await res.json();
      if (res.ok && data.hint) {
        setHintsRemaining(prev => prev - 1);
        setActiveHints(prev => ({ ...prev, [q.id]: data.hint }));
        setShowHintModal(false);
      } else {
        alert("Failed to generate hint.");
      }
    } catch(e) {
      alert("Failed to connect to AI.");
    } finally {
      setIsGeneratingHint(false);
    }
  };

  const loadSimilarQuestion = async (originalQ: Question) => {
    setSimilarStates(prev => ({ ...prev, [originalQ.id]: 'loading' }));
    try {
      const res = await fetch('/api/mock-exam/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'similar',
          questionText: originalQ.text,
          questionOptions: originalQ.options,
          questionAnswer: originalQ.answer,
          examContext: examData?.name
        })
      });
      const data = await res.json();
      if (res.ok && data.text) {
        setSimilarQuestions(prev => ({ ...prev, [originalQ.id]: data }));
        setSimilarStates(prev => ({ ...prev, [originalQ.id]: 'active' }));
      } else {
        setSimilarStates(prev => ({ ...prev, [originalQ.id]: 'idle' }));
        alert("Failed to generate similar question.");
      }
    } catch(e) {
      setSimilarStates(prev => ({ ...prev, [originalQ.id]: 'idle' }));
      alert("Failed to connect to AI.");
    }
  };


  // ─────────────────────────────────────────────────────────────────────────
  // LOADING / FALLBACK / PLACEHOLDER STATE
  // ─────────────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: 'var(--pal-bone)' }}>
        <Loader2 size={48} className="animate-spin text-pal-cafenoir" style={{ color: 'var(--pal-cafenoir)' }} />
        <div className="text-center">
          <p className="text-xl font-black uppercase tracking-widest mb-2" style={{ color: 'var(--pal-cafenoir)' }}>Initializing Session</p>
          <p className="text-sm font-bold" style={{ color: 'var(--pal-moss)' }}>Loading test bank data...</p>
        </div>
      </div>
    );
  }

  if (loadError || !examData) {
    const meta = getExamMeta(examId);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8" style={{ background: 'var(--pal-bone)' }}>
        <div className="card-paper max-w-lg w-full text-center p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-pal-moss opacity-20" />
          <div className="w-20 h-20 bg-pal-bone border-4 border-pal-tan text-pal-cafenoir rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
            <BookOpen size={40} />
          </div>
          <h2 className="text-3xl font-black mb-4 tracking-tight" style={{ color: 'var(--pal-cafenoir)' }}>Ready to Parse</h2>
          <p className="text-lg font-bold mb-8 leading-relaxed" style={{ color: 'var(--pal-moss)' }}>
            The PDF bank for <span className="text-pal-cafenoir">"{meta?.name ?? examId}"</span> is available in the system but hasn't been processed into interactive questions yet.
          </p>
          
          <div className="bg-pal-bone/50 border-2 border-pal-tan rounded-2xl p-6 text-left mb-8">
            <p className="text-xs font-black uppercase tracking-widest mb-3 opacity-60" style={{ color: 'var(--pal-cafenoir)' }}>Developer Command</p>
            <code className="text-[13px] font-mono break-all" style={{ color: 'var(--pal-cafenoir)' }}>
              node scripts/parse-exam.mjs {examId} "public/Exams/..."
            </code>
          </div>

          <button
            onClick={() => router.push('/mock-exam')}
            className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'var(--pal-cafenoir)' }}
          >
            Return to Registry
          </button>
        </div>
      </div>
    );
  }

  const { questions } = examData;
  const currentQuestion = questions[currentIdx];
  const answeredCount   = Object.keys(answers).length;
  const progress        = (answeredCount / questions.length) * 100;
  const meta            = getExamMeta(examId);

  // ─────────────────────────────────────────────────────────────────────────
  // RESULTS SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  if (isFinished) {
    const score = questions.reduce(
      (acc, q) => acc + (answers[q.id] === q.answer ? 1 : 0), 0
    );
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= 50;

    return (
      <div className="min-h-screen p-4 md:p-8 flex flex-col items-center" style={{ background: 'var(--pal-bone)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-paper max-w-xl w-full text-center !p-8 md:!p-12 shadow-xl"
        >
          <div className={`w-24 h-24 rounded-[28px] flex items-center justify-center mx-auto mb-6 border-4 ${passed ? 'bg-pal-bone border-pal-moss text-pal-moss' : 'bg-pal-bone border-pal-tan text-pal-tan'}`}>
            <CheckCircle size={56} />
          </div>
          <h1 className="text-3xl font-black mb-2 tracking-tight" style={{ color: 'var(--pal-cafenoir)' }}>
            {passed ? 'Score Accomplished! 🎉' : 'Session Completed! 💪'}
          </h1>
          <p className="text-base font-bold mb-8" style={{ color: 'var(--pal-moss)' }}>
            {examData.name} — {examData.subject}
          </p>

          <div className="grid grid-cols-3 gap-3 md:gap-5 mb-10">
            <div className="p-4 rounded-2xl bg-pal-bone/30 border-2 border-pal-tan">
              <p className="text-[9px] uppercase font-black mb-1 opacity-60" style={{ color: 'var(--pal-cafenoir)' }}>Raw Score</p>
              <p className="text-3xl font-black" style={{ color: 'var(--pal-cafenoir)' }}>{score}</p>
              <p className="text-[10px] font-bold" style={{ color: 'var(--pal-moss)' }}>out of {questions.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-pal-bone/30 border-2 border-pal-tan">
              <p className="text-[9px] uppercase font-black mb-1 opacity-60" style={{ color: 'var(--pal-cafenoir)' }}>Accuracy</p>
              <p className="text-3xl font-black" style={{ color: passed ? 'var(--pal-moss)' : '#c2410c' }}>{pct}%</p>
            </div>
            <div className="p-4 rounded-2xl bg-pal-bone/30 border-2 border-pal-tan">
              <p className="text-[9px] uppercase font-black mb-1 opacity-60" style={{ color: 'var(--pal-cafenoir)' }}>Skips</p>
              <p className="text-3xl font-black" style={{ color: 'var(--pal-cafenoir)', opacity: 0.4 }}>{questions.length - answeredCount}</p>
            </div>
          </div>

          {/* Per-question review */}
          <div className="text-left mb-8 max-h-[450px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {questions.map((q, i) => {
              const userAns  = answers[q.id];
              const isCorrect = userAns === q.answer;
              const wasSkipped = !userAns;
              
              const simQ = similarQuestions[q.id];
              const simState = similarStates[q.id] || 'idle';
              const simAns = similarAnswers[q.id];

              return (
                <div key={q.id} className={`flex items-start gap-4 p-5 rounded-[20px] border-2 transition-all ${
                  wasSkipped ? 'border-pal-tan bg-white/40'
                  : isCorrect ? 'border-pal-moss bg-pal-moss/5'
                  : 'border-[#ef444430] bg-red-50/30'
                }`}>
                  <span className={`mt-0.5 w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 ${
                    wasSkipped ? 'bg-pal-tan text-pal-cafenoir'
                    : isCorrect ? 'bg-pal-moss text-white'
                    : 'bg-red-500 text-white'
                  }`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold leading-snug mb-3" style={{ color: 'var(--pal-cafenoir)' }}>{q.text}</p>
                    {!wasSkipped && !isCorrect && (
                      <div className="flex gap-4 p-2.5 rounded-xl bg-red-50 border border-red-100 mb-3">
                        <p className="text-[12px] font-bold text-red-700">Your: {userAns}</p>
                        <p className="text-[12px] font-bold text-pal-moss">Correct: {q.answer}</p>
                      </div>
                    )}
                    {isCorrect && (
                       <p className="text-[12px] font-bold text-pal-moss mb-3">✓ Correct: {q.answer}</p>
                    )}
                    {q.explanation && (
                      <div className="text-[13px] leading-relaxed font-bold italic opacity-80 mb-2" style={{ color: 'var(--pal-cafenoir)' }}>
                         {q.explanation}
                      </div>
                    )}

                    {(!isCorrect && !wasSkipped) && !simQ && (
                      <button 
                        onClick={() => loadSimilarQuestion(q)}
                        disabled={simState === 'loading'}
                        className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 border-2 border-pal-moss text-pal-moss hover:bg-pal-moss hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50"
                      >
                        {simState === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                        Ask Another Question
                      </button>
                    )}

                    {simQ && (
                      <div className="mt-5 p-4 rounded-xl border-2 border-dashed border-pal-cafenoir/30 bg-pal-bone/30 relative">
                        <div className="absolute top-0 right-6 -translate-y-1/2 px-2 py-0.5 bg-pal-bone border-2 border-pal-cafenoir/30 text-[9px] font-black uppercase tracking-widest text-pal-cafenoir rounded-md">Practice Item</div>
                        <p className="text-[13px] font-bold mb-3 mt-1" style={{ color: 'var(--pal-cafenoir)' }}>{simQ.text}</p>
                        <div className="grid gap-2 mb-3">
                          {simQ.options.map((opt: string, oi: number) => {
                             const letter = getLetter(oi);
                             const isSimSelected = simAns === letter;
                             const isSimCorrect = simQ.answer === letter;
                             const showResult = !!simAns;
                             
                             let btnStyle = "border-pal-tan hover:border-pal-cafenoir bg-white";
                             if (showResult) {
                                if (isSimCorrect) btnStyle = "border-pal-moss bg-pal-moss text-white";
                                else if (isSimSelected) btnStyle = "border-red-500 bg-red-500 text-white";
                                else btnStyle = "border-pal-tan opacity-50";
                             }

                             return (
                               <button
                                 key={oi}
                                 disabled={showResult}
                                 onClick={() => setSimilarAnswers(prev => ({ ...prev, [q.id]: letter }))}
                                 className={`flex items-center gap-3 p-2.5 text-left border-2 rounded-xl transition-all ${btnStyle}`}
                               >
                                 <span className="w-6 h-6 rounded-md border-2 border-current flex items-center justify-center text-[10px] font-black flex-shrink-0">{letter}</span>
                                 <span className="text-[12px] font-bold flex-1">{opt}</span>
                               </button>
                             );
                          })}
                        </div>
                        {simAns && (
                           <div className="text-[12px] font-bold opacity-90 mt-2 bg-pal-bone border border-pal-tan p-3 rounded-lg leading-snug">
                             {simAns === simQ.answer ? '🎉 Correct! ' : '❌ Incorrect. '} {simQ.explanation}
                           </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-6 border-t-2 border-pal-tan/30">
            <button
              onClick={() => router.push('/mock-exam')}
              className="py-3.5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-widest border-2 transition-all hover:bg-pal-bone/50 shadow-sm"
              style={{ borderColor: 'var(--pal-cafenoir)', color: 'var(--pal-cafenoir)' }}
            >
              Back to Hub
            </button>
            <button
              onClick={() => {
                setAnswers({});
                setFlags({});
                setCurrentIdx(0);
                setActiveHints({});
                setHintsRemaining(5);
                setSimilarQuestions({});
                setSimilarStates({});
                setSimilarAnswers({});
                setTimeLeft(examData.durationMinutes * 60);
                setIsFinished(false);
              }}
              className="py-3.5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-widest text-white transition-all shadow-md hover:scale-[1.02]"
              style={{ background: 'var(--pal-cafenoir)' }}
            >
              Retake Lab
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EXAM SESSION
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--pal-bone)' }}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 p-4 border-b-2 border-pal-cafenoir bg-pal-bone/90 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          <button
            onClick={() => setIsSubmitModal(true)}
            className="text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl border-2 hover:opacity-80 transition-all font-bold text-white shadow-sm"
            style={{ background: 'var(--pal-cafenoir)', borderColor: 'var(--pal-cafenoir)' }}
          >
            End Lab
          </button>

          <div className="flex-1 max-w-xl hidden md:block">
            <div className="w-full h-3 bg-pal-tan/30 rounded-full border border-pal-cafenoir/20 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'var(--pal-moss)' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between items-center mt-1.5 px-1">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60" style={{ color: 'var(--pal-cafenoir)' }}>Progress</p>
              <p className="text-[10px] font-black" style={{ color: 'var(--pal-cafenoir)' }}>
                {answeredCount}/{questions.length} Items Complete
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsGridOpen(true)}
              className="p-3 rounded-2xl border-2 border-pal-cafenoir bg-pal-paper text-pal-cafenoir hover:bg-pal-bone transition-all shadow-sm"
              title="Question Navigator"
            >
              <LayoutGrid size={20} />
            </button>

            <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border-2 shadow-sm transition-all ${
              timeLeft < 300 ? 'border-red-500 bg-red-50 text-red-600' : 'border-pal-cafenoir bg-pal-paper text-pal-cafenoir'
            }`}>
              <Clock size={16} className={timeLeft < 60 ? 'animate-pulse' : ''} />
              <span className="font-black text-sm">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ─────────────────────────────────────────────────── */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto">

          {/* Question meta row */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1.5 rounded-full bg-pal-moss" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60" style={{ color: 'var(--pal-cafenoir)' }}>{examData.name}</p>
                <p className="text-sm font-black" style={{ color: 'var(--pal-cafenoir)' }}>{examData.subject}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHintModal(true)}
                disabled={activeHints[currentQuestion.id] !== undefined || hintsRemaining <= 0}
                className={`flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.1em] px-3 py-2 sm:px-4 sm:py-2 rounded-xl transition-all border-2 shadow-sm ${
                  activeHints[currentQuestion.id] !== undefined 
                    ? 'bg-pal-tan border-pal-tan text-pal-cafenoir opacity-60'
                    : 'bg-yellow-50 border-yellow-400 text-yellow-700 hover:bg-yellow-100 disabled:opacity-40'
                }`}
              >
                <Lightbulb size={14} className={activeHints[currentQuestion.id] === undefined && hintsRemaining > 0 ? "text-yellow-500" : ""} />
                Hint ({hintsRemaining})
              </button>

              <button
                onClick={toggleFlag}
                className={`flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.1em] px-3 py-2 sm:px-4 sm:py-2 rounded-xl transition-all border-2 shadow-sm ${
                  flags[currentQuestion.id]
                    ? 'bg-pal-tan border-pal-cafenoir text-pal-cafenoir'
                    : 'bg-pal-bone border-pal-tan text-pal-moss hover:border-pal-cafenoir'
                }`}
              >
                <Flag size={14} fill={flags[currentQuestion.id] ? 'currentColor' : 'none'} />
                {flags[currentQuestion.id] ? 'Marked' : 'Mark'}
              </button>
            </div>
          </div>

          <div className="mb-4">
             <span className="text-[11px] font-black px-3 py-1.5 rounded-lg border-2 border-pal-tan bg-pal-bone shadow-sm" style={{ color: 'var(--pal-cafenoir)' }}>
               Item {currentIdx + 1} of {questions.length}
             </span>
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="mb-12 pt-2"
            >
              {currentQuestion.hasDiagram && (
                <div className="flex items-center gap-3 mb-8 px-6 py-4 rounded-3xl border-2 border-pal-tan bg-pal-paper shadow-sm">
                  <div className="p-2 rounded-xl bg-pal-bone text-pal-moss">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black" style={{ color: 'var(--pal-cafenoir)' }}>Reference Diagram Required</p>
                    <p className="text-xs font-bold leading-tight" style={{ color: 'var(--pal-moss)' }}>Please refer to the source PDF for the illustration related to this question.</p>
                  </div>
                </div>
              )}

              {/* Unboxed question text */}
              <div className="min-h-[100px] flex items-center mb-6 pb-4 border-b-2 border-pal-tan/30 transition-all">
                <h2 className="text-lg md:text-xl font-black leading-[1.4] text-pal-cafenoir tracking-tight">
                  {currentQuestion.text.split('\n').map((line, i) => <div key={i} className="mb-2 last:mb-0">{line}</div>)}
                </h2>
              </div>

              {/* Display active hint if exists */}
              <AnimatePresence>
                {activeHints[currentQuestion.id] && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, y: -10 }} 
                    animate={{ opacity: 1, height: 'auto', y: 0 }} 
                    className="mb-8 p-5 rounded-[24px] bg-yellow-50/50 border-2 border-yellow-200/50 flex gap-4 items-start shadow-sm"
                  >
                     <div className="p-2 bg-yellow-100 rounded-xl text-yellow-600 flex-shrink-0">
                       <Lightbulb size={20} />
                     </div>
                     <div>
                        <span className="font-black uppercase tracking-widest text-[10px] opacity-60 block mb-1 text-yellow-800">Guided Hint</span>
                        <p className="text-sm font-bold text-yellow-900 leading-relaxed">
                          {activeHints[currentQuestion.id]}
                        </p>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid gap-3">
                {currentQuestion.options.map((option, i) => {
                  const letter  = getLetter(i);
                  const isSelected = answers[currentQuestion.id] === letter;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelectAnswer(i)}
                      className={`card-paper !p-3 md:!p-4 flex items-center gap-4 text-left group transition-all duration-200 !rounded-[20px] ${
                        isSelected ? 'scale-[1.01] bg-pal-bone' : 'hover:bg-pal-paper/80'
                      }`}
                      style={{
                        borderColor: isSelected ? 'var(--pal-moss)' : 'var(--pal-cafenoir)',
                        boxShadow: isSelected ? '0 6px 0 rgba(136, 144, 99, 0.2)' : '0 6px 0 rgba(76, 61, 25, 0.05)'
                      }}
                    >
                      <div
                        className={`w-8 h-8 md:w-9 md:h-9 rounded-xl border-2 flex items-center justify-center font-black flex-shrink-0 transition-all text-xs md:text-sm ${
                          isSelected
                            ? 'bg-pal-moss border-pal-moss text-white rotate-6'
                            : 'border-pal-tan bg-pal-bone text-pal-cafenoir group-hover:border-pal-cafenoir'
                        }`}
                      >
                        {letter}
                      </div>
                      <span className="text-sm md:text-base font-bold leading-snug" style={{ color: isSelected ? 'var(--pal-cafenoir)' : 'var(--pal-cafenoir)' }}>{option}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ── Footer nav ───────────────────────────────────────────── */}
      <footer className="p-4 md:p-6 border-t-2 border-pal-cafenoir bg-pal-bone/50 backdrop-blur-sm z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-6">
          <button
            onClick={() => setCurrentIdx(p => Math.max(0, p - 1))}
            disabled={currentIdx === 0}
            className="flex items-center gap-2 md:gap-3 px-4 py-3 md:px-6 md:py-3.5 rounded-[16px] border-2 border-pal-cafenoir bg-pal-paper text-pal-cafenoir hover:bg-pal-bone disabled:opacity-20 disabled:scale-95 transition-all text-xs md:text-sm font-black uppercase tracking-widest shadow-sm"
          >
            <ChevronLeft size={18} /> <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="flex gap-2.5 overflow-x-auto max-w-[200px] md:max-w-sm px-4 hide-scrollbar">
            {questions.map((q, i) => (
              <button
                key={i}
                onClick={() => setCurrentIdx(i)}
                className={`flex-shrink-0 rounded-full transition-all border ${
                  i === currentIdx ? 'w-8 h-3 border-pal-cafenoir scale-110' : 'w-3 h-3 border-pal-tan'
                } ${
                  flags[q.id] ? 'bg-orange-400 !border-orange-600'
                  : answers[q.id] ? 'bg-pal-moss'
                  : i === currentIdx ? 'bg-pal-cafenoir'
                  : 'bg-pal-tan/30'
                }`}
              />
            ))}
          </div>

          {currentIdx === questions.length - 1 ? (
            <button
              onClick={() => setIsSubmitModal(true)}
              className="px-6 py-3 md:px-10 md:py-3.5 rounded-[16px] text-xs md:text-sm font-black uppercase tracking-[0.15em] text-white transition-all shadow-lg hover:scale-[1.05] active:scale-[0.95]"
              style={{ background: 'var(--pal-moss)' }}
            >
              Submit Lab
            </button>
          ) : (
            <button
              onClick={() => setCurrentIdx(p => Math.min(questions.length - 1, p + 1))}
              className="flex items-center gap-2 md:gap-3 px-6 py-3 md:px-10 md:py-3.5 rounded-[16px] text-xs md:text-sm font-black uppercase tracking-widest text-white transition-all shadow-md hover:scale-[1.05] active:scale-[0.95]"
              style={{ background: 'var(--pal-cafenoir)' }}
            >
              <span className="hidden sm:inline">Next</span> <ChevronRight size={18} />
            </button>
          )}
        </div>
      </footer>

      {/* ── Question Grid Navigator ──────────────────────────────── */}
      <AnimatePresence>
        {isGridOpen && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGridOpen(false)}
              className="absolute inset-0 bg-pal-cafenoir/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="card-paper relative w-full max-w-2xl !p-6 md:!p-10 shadow-2xl !rounded-[32px] md:!rounded-[40px]"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-pal-bone border-2 border-pal-tan text-pal-cafenoir">
                     <LayoutGrid size={24} />
                  </div>
                  <h3 className="font-black text-2xl tracking-tight" style={{ color: 'var(--pal-cafenoir)' }}>Question Navigator</h3>
                </div>
                <button onClick={() => setIsGridOpen(false)} className="p-2 rounded-xl border-2 border-pal-tan hover:border-pal-cafenoir transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-wrap gap-4 md:gap-6 text-[10px] md:text-xs font-black uppercase tracking-widest mb-8 p-4 bg-pal-bone/50 rounded-2xl border-2 border-pal-tan">
                <span className="flex items-center gap-2"><span className="w-3 h-3 md:w-4 md:h-4 rounded-lg bg-pal-moss ring-2 ring-pal-moss/20" />Answered</span>
                <span className="flex items-center gap-2"><span className="w-3 h-3 md:w-4 md:h-4 rounded-lg bg-orange-400 ring-2 ring-orange-400/20" />Marked</span>
                <span className="flex items-center gap-2"><span className="w-3 h-3 md:w-4 md:h-4 rounded-lg bg-pal-tan/30 border-2 border-pal-tan" />Pending</span>
                <span className="flex items-center gap-2 ml-auto"><span className="w-1.5 h-1.5 rounded-full bg-pal-moss" /> {answeredCount}/{questions.length} Ready</span>
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {questions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrentIdx(i); setIsGridOpen(false); }}
                    className={`h-10 md:h-12 rounded-xl md:rounded-2xl text-[12px] md:text-[13px] font-black transition-all border-2 ${
                      i === currentIdx
                        ? 'border-pal-cafenoir bg-pal-bone scale-110 z-10 shadow-md'
                        : flags[q.id]
                        ? 'border-orange-500 text-orange-600 bg-orange-50'
                        : answers[q.id]
                        ? 'border-pal-moss text-pal-moss bg-pal-moss/5'
                        : 'border-pal-tan text-pal-tan hover:border-pal-cafenoir hover:text-pal-cafenoir'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <div className="mt-8 md:mt-10 pt-6 md:pt-8 border-t-2 border-pal-tan/30 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-xs md:text-sm font-bold italic opacity-60 text-center md:text-left" style={{ color: 'var(--pal-cafenoir)' }}>
                   Hover to preview item status
                </p>
                <button
                  onClick={() => { setIsGridOpen(false); setIsSubmitModal(true); }}
                  className="w-full md:w-auto px-8 py-3 rounded-xl font-black uppercase tracking-widest text-white shadow-md hover:scale-[1.02] active:scale-[0.98] text-xs md:text-sm"
                  style={{ background: 'var(--pal-moss)' }}
                >
                  Confirm Submission
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Hint Confirm Modal ───────────────────────────────────── */}
      <AnimatePresence>
        {showHintModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isGeneratingHint && setShowHintModal(false)}
              className="absolute inset-0 bg-pal-cafenoir/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="card-paper relative max-w-[340px] w-full !p-8 text-center !rounded-[32px] shadow-2xl"
            >
              <div className="w-16 h-16 bg-yellow-50 border-[3px] border-yellow-300 text-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Lightbulb size={32} />
              </div>
              <h3 className="text-xl font-black mb-3 tracking-tight" style={{ color: 'var(--pal-cafenoir)' }}>Use a Hint?</h3>
              <p className="text-sm font-bold mb-8 leading-relaxed" style={{ color: 'var(--pal-moss)' }}>
                In the real test there is no hint so use it on your own discretion.
                <span className="block mt-2 opacity-60">({hintsRemaining} hints remaining)</span>
              </p>
              <div className="grid gap-3">
                <button 
                  onClick={handleUseHint} 
                  disabled={isGeneratingHint}
                  className="py-3.5 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-md hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 bg-yellow-600"
                >
                  {isGeneratingHint ? <Loader2 size={16} className="animate-spin" /> : 'Confirm'}
                </button>
                <button
                  onClick={() => setShowHintModal(false)}
                  disabled={isGeneratingHint}
                  className="py-3.5 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition-all hover:bg-pal-bone/50 disabled:opacity-50"
                  style={{ borderColor: 'var(--pal-tan)', color: 'var(--pal-moss)' }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Submit Confirm Modal ─────────────────────────────────── */}
      <AnimatePresence>
        {isSubmitModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSubmitModal(false)}
              className="absolute inset-0 bg-pal-cafenoir/50 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="card-paper relative max-w-[380px] w-full !p-10 text-center !rounded-[40px] shadow-2xl"
            >
              <div className="w-20 h-20 bg-pal-bone border-4 border-pal-tan text-pal-tan rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-sm">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-2xl font-black mb-4 tracking-tight" style={{ color: 'var(--pal-cafenoir)' }}>Finalize Session?</h3>
              <p className="text-base font-bold mb-8 leading-relaxed" style={{ color: 'var(--pal-moss)' }}>
                You have addressed {answeredCount} out of {questions.length} items. 
                {answeredCount < questions.length && (
                  <span className="block mt-2 text-red-600">Caution: {questions.length - answeredCount} items remaining.</span>
                )}
              </p>
              <div className="grid gap-3">
                <button 
                  onClick={handleSubmit} 
                  className="py-4 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-md hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: 'var(--pal-cafenoir)' }}
                >
                  Submit Answers
                </button>
                <button
                  onClick={() => setIsSubmitModal(false)}
                  className="py-4 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition-all hover:bg-pal-bone/50"
                  style={{ borderColor: 'var(--pal-tan)', color: 'var(--pal-moss)' }}
                >
                  Return to Lab
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
