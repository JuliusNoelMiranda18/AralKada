'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Send, Loader2, X, RotateCcw, Eye, Brain, ArrowRight,
  Plus, ChevronLeft, ChevronRight, Lightbulb, CheckCircle2, XCircle, HelpCircle, BookOpen, MessageCircle
} from 'lucide-react';
import { useStudy } from '@/app/context/StudyContext';

const STYLE_PRESETS = [
  { label: 'Visual', icon: '👁️' },
  { label: 'Auditory', icon: '🎧' },
  { label: 'Reading/Writing', icon: '📖' },
  { label: 'Kinesthetic', icon: '🤸' },
];

const TABS = ['outline', 'lessons', 'flashcards', 'quiz'] as const;
type Tab = typeof TABS[number];

// ── Sub-components ──────────────────────────────────────

function LessonCard({ card, idx }: { card: any; idx: number }) {
  const [showELI5, setShowELI5] = useState(false);
  const [showKnowledge, setShowKnowledge] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="card-paper space-y-4"
    >
      <h3 className="text-base font-black" style={{ color: 'var(--pal-cafenoir)' }}>{card.title}</h3>
      {/* Hide description when knowledge check is active so user is truly tested */}
      <AnimatePresence>
        {!showKnowledge && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="whitespace-pre-wrap leading-relaxed text-sm font-bold overflow-hidden"
            style={{ color: 'var(--pal-moss)' }}
          >
            {card.content}
          </motion.p>
        )}
      </AnimatePresence>

      {/* ELI5 */}
      <div>
        <button
          onClick={() => setShowELI5((v) => !v)}
          className="flex items-center gap-2 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-xl transition-all"
          style={{
            background: showELI5 ? 'var(--pal-tan)' : 'var(--pal-paper)',
            border: '2px solid var(--pal-cafenoir)',
            color: 'var(--pal-cafenoir)',
          }}
        >
          <Brain size={13} /> {showELI5 ? 'Hide' : 'Explain Like I\'m 5'}
        </button>
        <AnimatePresence>
          {showELI5 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-[20px] p-4 mt-2" style={{ background: 'var(--pal-tan)', border: '2px solid var(--pal-cafenoir)' }}>
                <p className="text-sm font-bold" style={{ color: 'var(--pal-kombu)' }}>🧒 {card.explainLikeIm5}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Knowledge Check */}
      <div>
        <button
          onClick={() => { setShowKnowledge((v) => !v); setShowAnswer(false); }}
          className="flex items-center gap-2 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-xl transition-all"
          style={{
            background: showKnowledge ? 'var(--pal-tan)' : 'var(--pal-paper)',
            border: '2px solid var(--pal-cafenoir)',
            color: 'var(--pal-cafenoir)',
          }}
        >
          <HelpCircle size={13} /> {showKnowledge ? 'Hide' : 'Test My Knowledge'}
        </button>
        <AnimatePresence>
          {showKnowledge && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-[20px] p-5 mt-2 space-y-3" style={{ background: 'var(--pal-paper)', border: '2px solid var(--pal-cafenoir)', borderBottom: '5px solid var(--pal-cafenoir)' }}>
                <p className="text-sm font-bold" style={{ color: 'var(--pal-cafenoir)' }}>{card.knowledgeCheck?.question}</p>
                <button
                  onClick={() => setShowAnswer((v) => !v)}
                  className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider"
                  style={{ color: 'var(--pal-cafenoir)' }}
                >
                  <Eye size={13} /> {showAnswer ? 'Hide Answer' : 'Show Answer'}
                </button>
                {showAnswer && (
                  <p className="text-sm font-bold pt-1" style={{ color: 'var(--pal-moss)' }}>
                    ✓ {card.knowledgeCheck?.answer}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function FlashcardDeck({ flashcards }: { flashcards: any[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const goNext = () => { setFlipped(false); setTimeout(() => setIndex((i) => Math.min(i + 1, flashcards.length - 1)), 150); };
  const goPrev = () => { setFlipped(false); setTimeout(() => setIndex((i) => Math.max(i - 1, 0)), 150); };

  const card = flashcards[index];

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Progress */}
      <div className="flex items-center gap-2 w-full max-w-4xl">
        <span className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--pal-moss)' }}>
          {index + 1} / {flashcards.length}
        </span>
        <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--pal-tan)', border: '1px solid var(--pal-cafenoir)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${((index + 1) / flashcards.length) * 100}%`, background: 'var(--duo-green)' }}
          />
        </div>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-4xl h-[400px] cursor-pointer select-none"
        style={{ perspective: 1000 }}
        onClick={() => setFlipped((f) => !f)}
      >
        <motion.div
          className="relative w-full h-full"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center p-12 rounded-[28px] text-center"
            style={{
              backfaceVisibility: 'hidden',
              background: 'var(--pal-paper)',
              border: '2px solid var(--pal-cafenoir)',
              borderBottom: '6px solid var(--pal-cafenoir)',
            }}
          >
            <p className="text-sm font-black uppercase tracking-widest mb-4" style={{ color: 'var(--pal-moss)' }}>Question</p>
            <p className="font-bold text-2xl" style={{ color: 'var(--pal-cafenoir)' }}>{card.question}</p>
            <p className="text-sm mt-6" style={{ color: 'var(--pal-moss)' }}>tap to flip</p>
          </div>
          {/* Back */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center p-12 rounded-[28px] text-center"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'var(--pal-tan)',
              border: '2px solid var(--pal-cafenoir)',
              borderBottom: '6px solid var(--pal-cafenoir)',
            }}
          >
            <p className="text-sm font-black uppercase tracking-widest mb-4" style={{ color: 'var(--pal-cafenoir)' }}>Answer</p>
            <p className="font-bold text-2xl" style={{ color: 'var(--pal-cafenoir)' }}>{card.answer}</p>
          </div>
        </motion.div>
      </div>

      {/* Nav */}
      <div className="flex items-center gap-4">
        <button
          onClick={goPrev}
          disabled={index === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all disabled:opacity-30"
          style={{ background: 'var(--pal-paper)', border: '2px solid var(--pal-cafenoir)', borderBottom: '4px solid var(--pal-cafenoir)', color: 'var(--pal-cafenoir)' }}
        >
          <ChevronLeft size={16} /> Prev
        </button>
        <button
          onClick={goNext}
          disabled={index === flashcards.length - 1}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all disabled:opacity-30"
          style={{ background: 'var(--pal-tan)', border: '2px solid var(--pal-cafenoir)', borderBottom: '4px solid var(--pal-cafenoir)', color: 'var(--pal-cafenoir)' }}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function QuizQuestion({ q, idx, total }: { q: any; idx: number; total: number }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const answered = selected !== null;
  const isCorrect = selected === q.correctAnswer;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04 }}
      className="card-paper space-y-4"
    >
      {/* Q header */}
      <div className="flex items-start justify-between gap-4">
        <p className="font-black text-sm" style={{ color: 'var(--pal-cafenoir)' }}>
          <span
            className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-xs mr-2"
            style={{ background: 'var(--pal-cafenoir)' }}
          >
            {idx + 1}
          </span>
          {q.question}
        </p>
        <button
          onClick={() => setShowHint((v) => !v)}
          className="flex-shrink-0 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-xl transition-all"
          style={{
            background: showHint ? 'var(--pal-tan)' : 'var(--pal-paper)',
            border: '2px solid var(--pal-cafenoir)',
            color: 'var(--pal-cafenoir)',
          }}
        >
          <Lightbulb size={12} /> Hint
        </button>
      </div>

      {/* Hint */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: 'var(--pal-bone)', border: '2px dashed var(--pal-cafenoir)' }}>
              <Lightbulb size={14} style={{ color: 'var(--duo-green)', flexShrink: 0, marginTop: 1 }} />
              <p className="text-xs font-bold" style={{ color: 'var(--pal-cafenoir)' }}>{q.hint}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {q.options?.map((opt: string, i: number) => {
          const isThisCorrect = opt === q.correctAnswer;
          const isThisSelected = selected === opt;

          let bg = 'var(--pal-paper)';
          let borderColor = 'var(--pal-cafenoir)';
          let borderBottom = '2px';
          let icon = null;

          if (answered) {
            if (isThisCorrect) { bg = '#d4edda'; borderColor = '#28a745'; borderBottom = '4px'; icon = <CheckCircle2 size={14} className="text-green-600 flex-shrink-0" />; }
            else if (isThisSelected && !isThisCorrect) { bg = '#f8d7da'; borderColor = '#dc3545'; borderBottom = '4px'; icon = <XCircle size={14} className="text-red-600 flex-shrink-0" />; }
          } else if (isThisSelected) {
            bg = 'var(--pal-tan)'; borderBottom = '4px';
          }

          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => setSelected(opt)}
              className="flex items-center gap-2 text-left text-sm font-bold px-4 py-3 rounded-xl transition-all"
              style={{ background: bg, border: `2px solid ${borderColor}`, borderBottom: `${borderBottom} solid ${borderColor}`, color: 'var(--pal-cafenoir)' }}
            >
              {icon}
              {opt}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {answered && !isCorrect && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: '#fff3cd', border: '2px solid #ffc107' }}>
              <XCircle size={16} className="text-yellow-700 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black uppercase tracking-wider mb-1" style={{ color: '#856404' }}>Not quite!</p>
                <p className="text-xs font-bold" style={{ color: '#533f03' }}>{q.explanation}</p>
              </div>
            </div>
          </motion.div>
        )}
        {answered && isCorrect && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: '#d4edda', border: '2px solid #28a745' }}>
              <CheckCircle2 size={16} className="text-green-700 flex-shrink-0" />
              <p className="text-xs font-black" style={{ color: '#155724' }}>Correct! Great job! 🎉</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Page ────────────────────────────────────────────

function StudyBuddyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    studyData, setStudyData,
    activeTopic, setActiveTopic,
    textContext, setTextContext,
    resetSession
  } = useStudy();

  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState(activeTopic || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('outline');
  const [activeSection, setActiveSection] = useState(0);

  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const [learningStyle, setLearningStyle] = useState<string>('Visual');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'quiz') setActiveTab('quiz');
  }, [searchParams]);

  useEffect(() => {
    const saved = localStorage.getItem('aralkada-learning-style');
    if (saved) setLearningStyle(saved);
  }, []);

  // Reset section when switching to lessons tab
  useEffect(() => {
    if (activeTab === 'lessons') setActiveSection(0);
  }, [activeTab]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const processFile = async () => {
    if (!file && !prompt) return alert('Please provide a file or a prompt.');
    let extractedText = '';
    if (file) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');
        extractedText = data.text;
        setTextContext(extractedText);
      } catch (err: any) {
        alert(err.message);
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }
    await generateStudyGuide(extractedText || '', learningStyle);
  };

  const generateStudyGuide = async (text: string, style: string) => {
    setIsGenerating(true);
    const targetTopic = prompt || 'Study Material';
    setActiveTopic(targetTopic);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, prompt: targetTopic, learningStyle: style }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setStudyData(data);
      setActiveTab('outline');
      setActiveSection(0);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const sendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg = { role: 'user', content: chatInput };
    const updatedMessages = [...chatMessages, newMsg];
    setChatMessages(updatedMessages);
    setChatInput('');
    setIsChatting(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          documentContext: textContext || prompt,
          learningStyle: learningStyle
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chat failed');
      setChatMessages([...updatedMessages, data.message]);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsChatting(false);
    }
  };

  const sections: any[] = studyData?.sections || [];
  const currentSection = sections[activeSection];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--pal-bone)' }}>

      {/* ── MAIN AREA ── */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">

        {/* Header */}
        <div className="max-w-[1440px] mx-auto w-full mb-6">
          <div className="flex items-center justify-between">
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
                📚 Aralkada Study Hub
              </div>
              <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--pal-cafenoir)' }}>Study Buddy</h1>
              <p className="text-base mt-2 font-bold max-w-2xl" style={{ color: 'var(--pal-moss)' }}>
                Upload your material or type a topic to generate a dynamic study guide.
              </p>
            </div>
            {studyData && (
              <button
                onClick={() => resetSession()}
                className="flex items-center gap-2 text-sm font-black px-4 py-2 rounded-xl transition-transform hover:-translate-y-0.5 shadow-sm"
                style={{
                  background: 'var(--pal-tan)',
                  color: 'var(--pal-cafenoir)',
                  border: '2px solid var(--pal-cafenoir)',
                  borderBottom: '4px solid var(--pal-cafenoir)'
                }}
              >
                <RotateCcw size={14} /> New Session
              </button>
            )}
          </div>
        </div>

        {/* Divider Line - only show in initial state */}
        {!studyData && (
          <div className="w-full border-b-2 mb-6" style={{ borderColor: 'var(--pal-tan)' }} />
        )}

        {!studyData ? (
          /* ── INPUT STATE ── */
          <div className="max-w-2xl mx-auto space-y-6 py-4">
            {/* Upload zone */}
            <label
              className="flex flex-col items-center justify-center gap-4 rounded-[32px] p-10 cursor-pointer transition-all hover:scale-[1.01]"
              style={{
                background: 'var(--pal-tan)',
                border: '3px solid var(--pal-cafenoir)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--duo-green)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--pal-cafenoir)')}
            >
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center border-2 border-pal-cafenoir shadow-md">
                <Upload size={24} style={{ color: 'var(--duo-green)' }} />
              </div>
              <div className="text-center">
                <p className="font-black text-lg" style={{ color: 'var(--pal-cafenoir)' }}>
                  {file ? file.name : 'Drop your study material here'}
                </p>
                <p className="text-xs font-black uppercase tracking-widest mt-2" style={{ color: 'var(--pal-moss)' }}>
                  PDF • POWERPOINT • TEXT
                </p>
              </div>
              <input type="file" className="hidden" accept=".pdf,.ppt,.pptx" onChange={handleFileUpload} />
            </label>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div style={{ flex: 1, height: 1, background: 'var(--pal-tan)' }} />
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--pal-moss)' }}>
                OR / AND
              </span>
              <div style={{ flex: 1, height: 1, background: 'var(--pal-tan)' }} />
            </div>

            <div className="card-paper space-y-4" style={{ background: 'var(--pal-tan)' }}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl border-2 border-pal-cafenoir">
                  <Send size={18} style={{ color: 'var(--duo-blue)' }} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--pal-cafenoir)' }}>
                  Custom Topic Entry
                </span>
              </div>
              <textarea
                className="input-paper w-full"
                placeholder="What are we studying? (e.g. 'Photosynthesis', 'World War II')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                style={{ resize: 'none' }}
              />
            </div>

            {/* Generate button */}
            <button
              className="btn-duo w-full"
              onClick={processFile}
              disabled={isUploading || isGenerating || (!file && !prompt.trim())}
              style={{ fontSize: 16 }}
            >
              {(isUploading || isGenerating) && <Loader2 className="animate-spin" size={18} />}
              {isUploading ? 'Extracting text…' : isGenerating ? 'Generating guide…' : 'Generate Study Guide'}
            </button>
          </div>
        ) : (
          /* ── GENERATED CONTENT ── */
          <div className="max-w-[1440px] mx-auto w-full">
            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b-2" style={{ borderColor: 'var(--pal-tan)' }}>
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="pb-3 text-sm font-black uppercase tracking-wider capitalize transition-colors"
                  style={{
                    color: activeTab === tab ? 'var(--duo-blue)' : 'var(--pal-moss)',
                    borderBottom: activeTab === tab ? '4px solid var(--duo-blue)' : '4px solid transparent',
                    marginBottom: '-2px',
                    background: 'transparent',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                {/* ── OUTLINE ── */}
                {activeTab === 'outline' && (
                  <div className="space-y-3">
                    {/* Summary blurb */}
                    {studyData.summary && (
                      <div className="card-paper mb-4" style={{ background: 'var(--pal-tan)', borderLeft: '4px solid var(--duo-green)' }}>
                        <p className="text-sm font-bold" style={{ color: 'var(--pal-cafenoir)' }}>{studyData.summary}</p>
                      </div>
                    )}
                    <ol className="space-y-3">
                      {studyData.outline?.map((item: string, i: number) => {
                        const matchingSection = sections[i];
                        const cardCount = matchingSection?.cards?.length || 0;
                        const firstCard = matchingSection?.cards?.[0];
                        const snippet = firstCard?.content?.substring(0, 120);
                        return (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            whileHover={{ x: 4, scale: 1.005 }}
                            onClick={() => { setActiveSection(i); setActiveTab('lessons'); }}
                            className="card-paper flex items-start gap-4 cursor-pointer"
                            style={{ padding: '16px 20px' }}
                          >
                            <span
                              className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-black mt-0.5"
                              style={{ background: 'var(--duo-green)', color: '#fff' }}
                            >
                              {i + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-sm" style={{ color: 'var(--pal-cafenoir)' }}>{item}</p>
                              {snippet && (
                                <p className="text-xs font-bold mt-1 truncate" style={{ color: 'var(--pal-moss)' }}>
                                  {snippet}{snippet.length >= 120 ? '…' : ''}
                                </p>
                              )}
                              {cardCount > 0 && (
                                <span className="inline-flex items-center gap-1 mt-2 text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-lg" style={{ background: 'var(--pal-bone)', color: 'var(--pal-cafenoir)', border: '1.5px solid var(--pal-tan)' }}>
                                  {cardCount} lesson{cardCount !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                            <ChevronRight size={16} className="flex-shrink-0 mt-1 opacity-40" style={{ color: 'var(--pal-cafenoir)' }} />
                          </motion.li>
                        );
                      })}
                    </ol>
                  </div>
                )}

                {/* ── LESSONS ── */}
                {activeTab === 'lessons' && (
                  <div className="flex gap-6">
                    {/* Section Sidebar */}
                    <div className="w-56 flex-shrink-0 space-y-2">
                      <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--pal-moss)' }}>
                        Sections
                      </p>
                      {sections.map((section: any, i: number) => (
                        <button
                          key={i}
                          onClick={() => setActiveSection(i)}
                          className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-black transition-all"
                          style={{
                            background: activeSection === i ? 'var(--pal-cafenoir)' : 'var(--pal-paper)',
                            color: activeSection === i ? '#fff' : 'var(--pal-cafenoir)',
                            border: '2px solid var(--pal-cafenoir)',
                            borderBottom: activeSection === i ? '4px solid rgba(0,0,0,0.3)' : '2px solid var(--pal-cafenoir)',
                          }}
                        >
                          <span className="opacity-60 mr-1">{i + 1}.</span> {section.sectionTitle}
                        </button>
                      ))}
                    </div>

                    {/* Cards Area */}
                    <div className="flex-1 space-y-6">
                      {currentSection ? (
                        <>
                          <div className="flex items-center gap-3 mb-2">
                            <BookOpen size={18} style={{ color: 'var(--pal-cafenoir)' }} />
                            <h2 className="text-lg font-black" style={{ color: 'var(--pal-cafenoir)' }}>
                              {currentSection.sectionTitle}
                            </h2>
                          </div>
                          {(currentSection.cards || []).map((card: any, i: number) => (
                            <LessonCard key={i} card={card} idx={i} />
                          ))}
                          {/* Section nav */}
                          <div className="flex justify-between pt-4">
                            <button
                              onClick={() => setActiveSection((s) => Math.max(s - 1, 0))}
                              disabled={activeSection === 0}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider disabled:opacity-30"
                              style={{ background: 'var(--pal-paper)', border: '2px solid var(--pal-cafenoir)', borderBottom: '4px solid var(--pal-cafenoir)', color: 'var(--pal-cafenoir)' }}
                            >
                              <ChevronLeft size={14} /> Prev Section
                            </button>
                            <button
                              onClick={() => setActiveSection((s) => Math.min(s + 1, sections.length - 1))}
                              disabled={activeSection === sections.length - 1}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider disabled:opacity-30"
                              style={{ background: 'var(--pal-tan)', border: '2px solid var(--pal-cafenoir)', borderBottom: '4px solid var(--pal-cafenoir)', color: 'var(--pal-cafenoir)' }}
                            >
                              Next Section <ChevronRight size={14} />
                            </button>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm font-bold" style={{ color: 'var(--pal-moss)' }}>No section data found. Try regenerating.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* ── FLASHCARDS ── */}
                {activeTab === 'flashcards' && studyData.flashcards?.length > 0 && (
                  <FlashcardDeck flashcards={studyData.flashcards} />
                )}

                {/* ── QUIZ ── */}
                {activeTab === 'quiz' && (
                  <div className="space-y-6 pb-20">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--pal-moss)' }}>
                        {studyData.quiz?.length || 0} Questions
                      </p>
                    </div>
                    {studyData.quiz?.map((q: any, i: number) => (
                      <QuizQuestion key={i} q={q} idx={i} total={studyData.quiz.length} />
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── CHAT PANEL ── */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ x: 340, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 340, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            className="flex flex-col overflow-hidden flex-shrink-0"
            style={{
              width: 340,
              background: 'var(--dark-surface)',
              borderLeft: '2px solid var(--dark-border)',
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{ background: 'var(--pal-bone)', borderBottom: '2px solid var(--pal-cafenoir)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-white"
                  style={{ border: '2px solid var(--pal-cafenoir)' }}
                >
                  <img src="/mascot.png" alt="Cardo" className="w-full h-full object-contain" style={{ mixBlendMode: 'multiply' }} />
                </div>
                <div>
                  <p className="text-sm font-black" style={{ color: 'var(--pal-cafenoir)' }}>Ask Cardo</p>
                  <p className="text-xs font-bold" style={{ color: 'var(--pal-moss)' }}>Talking as a {learningStyle} Buddy</p>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
              {chatMessages.length === 0 && (
                <p className="text-sm text-center mt-12" style={{ color: 'var(--text-muted)' }}>
                  Ask anything about the topic — I only use the uploaded context.
                </p>
              )}
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className="max-w-[88%] p-3 text-sm rounded-2xl"
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    background: msg.role === 'user' ? 'var(--duo-green)' : 'var(--dark-card)',
                    color: '#fff',
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    border: msg.role === 'user' ? 'none' : '1px solid var(--dark-border)',
                  }}
                >
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                </div>
              ))}
              {isChatting && (
                <div
                  className="self-start p-3 rounded-2xl flex items-center gap-2 text-sm"
                  style={{ background: 'var(--dark-card)', color: 'var(--text-muted)', border: '1px solid var(--dark-border)' }}
                >
                  <Loader2 size={14} className="animate-spin" /> Thinking…
                </div>
              )}
            </div>

            <form
              onSubmit={sendChatMessage}
              className="flex items-center gap-2 p-3 flex-shrink-0"
              style={{ borderTop: '2px solid var(--pal-cafenoir)', background: 'var(--pal-bone)' }}
            >
              <input
                type="text"
                className="input-paper flex-1"
                style={{ padding: '10px 14px', fontSize: 14 }}
                placeholder="Ask a question…"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={isChatting}
              />
              <button
                type="submit"
                disabled={isChatting || !chatInput.trim()}
                className="btn-duo flex-shrink-0"
                style={{ height: 44, width: 44, padding: 0, borderRadius: 12 }}
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CHAT FAB ── */}
      {!chatOpen && (
        <motion.button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 h-14 pl-4 pr-6 rounded-full flex items-center gap-3 z-50"
          style={{
            background: 'var(--duo-green)',
            color: '#fff',
            border: '4px solid var(--duo-green-dark)',
            boxShadow: '0 4px 0 var(--duo-green-dark)',
          }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.96 }}
        >
          <div className="w-8 h-8 rounded-lg bg-white overflow-hidden p-0.5">
            <img src="/mascot.png" alt="Cardo" className="w-full h-full object-contain" style={{ mixBlendMode: 'multiply' }} />
          </div>
          <span className="font-black text-sm uppercase tracking-wider">Ask Cardo</span>
        </motion.button>
      )}
    </div>
  );
}

export default function StudyBuddy() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center bg-pal-bone">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-pal-moss" size={48} />
          <p className="font-black text-pal-cafenoir uppercase tracking-widest text-xs">Aralkada is loading...</p>
        </div>
      </div>
    }>
      <StudyBuddyContent />
    </Suspense>
  );
}
