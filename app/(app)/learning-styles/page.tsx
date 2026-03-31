'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, MessageSquare, ChevronDown, Send,
  Upload, Loader2, ArrowRight, Eye, AudioLines, Sparkles, X,
  FileText, Zap, BookOpen, RotateCcw, Volume2
} from 'lucide-react';
import { useStudy } from '@/app/context/StudyContext';
import WaveformPlayer from '@/app/components/ui/waveform-player';
import ReactMarkdown from 'react-markdown';
import MermaidDiagram from '@/app/components/ui/MermaidDiagram';

const STYLE_INFO: Record<string, { emoji: string; desc: string; techniques: string[]; color: string }> = {
  Visual: {
    emoji: '👁️',
    color: '#1CB0F6',
    desc: 'You learn best through seeing and visualizing relationships between concepts.',
    techniques: [
      'Mind Mapping (Draw ideas as branches)',
      'Graphic Organizers (Charts, Venn diagrams)',
      'Concept Mapping (Link related ideas)',
      'Timelines (Sequence events in order)',
      'Color Coding (Highlight by category)',
      'Flashcards (Image + word pairs)'
    ],
  },
  Auditory: {
    emoji: '🎧',
    color: '#CE82FF',
    desc: 'You learn best by hearing information and explaining it out loud.',
    techniques: [
      'Read Aloud (Hear your own words)',
      'Teach it Out Loud (Explain to others)',
      'Audio Recordings (Replay lessons)',
      'Feynman Technique (Simplify & explain)',
      'Verbal Repetition (Repeat key facts)',
      'Songs / Mnemonics (Rhymes & melodies)'
    ],
  },
  'Reading/Writing': {
    emoji: '📖',
    color: '#FF9600',
    desc: 'You learn best through text-based interaction, writing, and structured notes.',
    techniques: [
      'Active Recall (Test from memory)',
      'Spaced Repetition (Review at intervals)',
      'Summarizing (Rewrite in own words)',
      'Cornell Notes (Cues, notes, summary)',
      'Reflective Journaling (Write what you learned)',
      'Elaborative Interrogation (Ask why/how)'
    ],
  },
};

export default function LearningStyles() {
  const router = useRouter();
  const { activeTopic, setActiveTopic, textContext } = useStudy();

  const [result, setResult] = useState<string>('Visual');
  const [loadingTeacher, setLoadingTeacher] = useState(false);
  const [teacherContent, setTeacherContent] = useState<any>(null);
  const [showStyleDropdown, setShowStyleDropdown] = useState(false);

  // Standalone Input State
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState<File | null>(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('aralkada-learning-style');
    if (saved) setResult(saved);
  }, []);

  useEffect(() => {
    if (activeTopic) {
      generateTeacherContent(activeTopic, result);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTopic]);

  const generateTeacherContent = async (topic: string, style: string) => {
    setLoadingTeacher(true);
    setTeacherContent(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: topic,
          learningStyle: style,
          mode: 'teacher',
          text: textContext || ''
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to prep lesson');
      setTeacherContent(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingTeacher(false);
    }
  };

  const handleStandaloneStart = async () => {
    if (!prompt && !file) return;
    setActiveTopic(prompt || 'Custom Topic');
  };

  const handleStyleChange = (newStyle: string) => {
    setResult(newStyle);
    if (activeTopic) generateTeacherContent(activeTopic, newStyle);
    setShowStyleDropdown(false);
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
          documentContext: textContext || activeTopic,
          learningStyle: result,
          mode: 'teacher'
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

  // ── LANDING PAGE ──────────────────────────────────────────────────────────
  if (!activeTopic) {
    return (
      <div className="flex h-screen overflow-hidden" style={{ background: 'var(--pal-bone)' }}>
        <div className="flex-1 overflow-y-auto p-6 md:p-8">

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-[1440px] mx-auto w-full mb-6"
          >
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
                  ✨ Master Mode
                </div>
                <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--pal-cafenoir)' }}>Learning Style Teacher</h1>
                <p className="text-base mt-2 font-bold max-w-2xl" style={{ color: 'var(--pal-moss)' }}>
                  Transform any topic into a personalized {result} learning adventure.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Divider Line */}
          <div className="max-w-[1440px] mx-auto w-full border-b-2 mb-16" style={{ borderColor: 'var(--pal-tan)' }} />

          <div className="max-w-5xl mx-auto space-y-12 pb-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
              className="space-y-8 w-full"
            >
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8 items-stretch w-full min-h-[280px]">
                {/* Upload zone */}
                <label
                  className="flex flex-col items-center justify-center gap-4 rounded-[32px] p-10 cursor-pointer transition-all hover:scale-[1.01] h-full"
                  style={{
                    background: 'var(--pal-tan)',
                    border: '3px solid var(--pal-cafenoir)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--duo-green)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--pal-cafenoir)')}
                >
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center border-2 border-pal-cafenoir shadow-md">
                    <Upload size={28} style={{ color: 'var(--duo-green)' }} />
                  </div>
                  <div className="text-center mt-2">
                    <p className="font-black text-xl" style={{ color: 'var(--pal-cafenoir)' }}>
                      {file ? file.name : 'Drop your study material here'}
                    </p>
                    <p className="text-sm font-black uppercase tracking-widest mt-3" style={{ color: 'var(--pal-moss)' }}>
                      PDF • POWERPOINT • TEXT
                    </p>
                  </div>
                  <input type="file" className="hidden" accept=".pdf,.ppt,.pptx" onChange={(e) => e.target.files && setFile(e.target.files[0])} />
                </label>

                {/* Divider */}
                <div className="flex flex-row md:flex-col items-center justify-center gap-4 py-4 md:py-0 px-2 w-full md:w-auto">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap" style={{ color: 'var(--pal-cafenoir)' }}>
                    OR / AND
                  </span>
                </div>

                {/* Text Input */}
                <div className="flex flex-col rounded-[32px] p-10 transition-all h-full" style={{ background: 'var(--pal-tan)', border: '3px solid var(--pal-cafenoir)', borderBottomWidth: '6px' }}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-white rounded-xl border-2 border-pal-cafenoir">
                      <Send size={20} style={{ color: 'var(--duo-blue)' }} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: 'var(--pal-cafenoir)' }}>
                      Custom Topic Entry
                    </span>
                  </div>
                  <div className="bg-white rounded-2xl flex-1 border-2 border-pal-bone shadow-sm overflow-hidden flex flex-col">
                    <textarea
                      className="w-full h-full flex-1 p-6 text-base outline-none resize-none font-medium placeholder:text-gray-400"
                      placeholder="What are we studying? (e.g. 'Photosynthesis', 'World War II')"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <motion.button
                onClick={handleStandaloneStart}
                className="btn-duo w-full h-14 text-sm font-black uppercase shadow-xl"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                Generate Study Guide
              </motion.button>
            </motion.div>

            {/* Style Definitions */}
            <div className="pt-12 space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1" style={{ background: 'var(--pal-tan)' }} />
                <h2 className="text-xs font-black uppercase tracking-widest text-paper-muted">Discover Styles</h2>
                <div className="h-px flex-1" style={{ background: 'var(--pal-tan)' }} />
              </div>

              <div className="space-y-6">
                {Object.entries(STYLE_INFO).map(([key, info], i) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    whileHover={{ x: 4 }}
                    className="card-paper border-l-4 p-5 flex gap-4 cursor-default"
                    style={{ borderLeftColor: info.color }}
                  >
                    <div className="text-4xl flex-shrink-0 pt-1">{info.emoji}</div>
                    <div className="space-y-1">
                      <h3 className="font-black text-paper-primary text-lg">{key} Learner</h3>
                      <p className="text-sm text-paper-muted leading-relaxed">{info.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── TEACHER VIEW ──────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--pal-bone)' }}>
      <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">
        <div className="max-w-[1440px] mx-auto w-full space-y-6 pb-28">

          {/* Header */}
          <div className="max-w-[1440px] mx-auto w-full mb-6">
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
                  📚 Aralkada Study Hub
                </div>
                <h1 className="text-3xl font-black tracking-tight capitalize" style={{ color: 'var(--pal-cafenoir)' }}>{activeTopic}</h1>
                <p className="text-base mt-2 font-bold max-w-2xl" style={{ color: 'var(--pal-moss)' }}>
                  Exploring this topic through the lens of a <span className="font-black underline decoration-2 underline-offset-4">{result}</span> learner.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <motion.button
                  onClick={() => setActiveTopic('')}
                  className="flex items-center gap-2 text-sm font-black uppercase tracking-widest px-6 h-[52px] rounded-xl transition-transform shadow-sm bg-pal-tan text-pal-cafenoir"
                  style={{ border: '2px solid var(--pal-cafenoir)', borderBottom: '4px solid var(--pal-cafenoir)' }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RotateCcw size={16} /> New Session
                </motion.button>

                <div className="relative">
                  <motion.button
                    onClick={() => setShowStyleDropdown(!showStyleDropdown)}
                    className="flex items-center gap-3 px-6 h-[52px] rounded-xl transition-all shadow-sm group bg-white text-pal-cafenoir"
                    style={{ border: '2px solid var(--pal-cafenoir)', borderBottom: '4px solid var(--pal-cafenoir)' }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-xl">{STYLE_INFO[result].emoji}</span>
                    <span className="text-sm font-black uppercase tracking-widest">{result}</span>
                    <ChevronDown className={`text-pal-moss transition-transform duration-200 ml-1 ${showStyleDropdown ? 'rotate-180' : ''}`} size={16} />
                  </motion.button>
                  <AnimatePresence>
                    {showStyleDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full right-0 mt-3 w-64 p-2 rounded-2xl z-50 shadow-2xl"
                        style={{ background: 'var(--pal-paper)', border: '2px solid var(--pal-cafenoir)' }}
                      >
                        <p className="text-[10px] font-black uppercase tracking-widest text-paper-muted p-2 border-b mb-2" style={{ borderColor: 'var(--pal-tan)' }}>Switch Style</p>
                        {Object.keys(STYLE_INFO).map(s => (
                          <motion.button
                            key={s} onClick={() => handleStyleChange(s)}
                            className="flex items-center gap-4 w-full p-4 rounded-xl transition-colors"
                            style={{ background: s === result ? 'var(--pal-tan)' : 'rgba(255, 255, 255, 0)' }}
                            whileHover={{ background: 'var(--pal-tan)' }}
                          >
                            <span className="text-2xl">{STYLE_INFO[s].emoji}</span>
                            <span className="font-bold text-sm text-paper-primary">{s}</span>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {showStyleDropdown && <div className="fixed inset-0 z-40" onClick={() => setShowStyleDropdown(false)} />}
                </div>
              </div>
            </div>
          </div>

          {/* Divider Line */}
          <div className="w-full border-b-2 mb-6" style={{ borderColor: 'var(--pal-tan)' }} />

          {loadingTeacher ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-6">
              <div className="relative">
                <Loader2 className="animate-spin" size={64} strokeWidth={3} style={{ color: 'var(--pal-cafenoir)' }} />
                <Brain className="absolute inset-0 m-auto" size={24} style={{ color: 'rgba(53,64,36,0.2)' }} />
              </div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-500 animate-pulse">Cardo is crafting your {result} experience...</p>
            </div>
          ) : teacherContent ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* ── AUDITORY: Waveform + Transcript only ── */}
              {result === 'Auditory' && (
                <div className="space-y-8">
                  {/* Pedagogical Strategy Badge */}
                  {teacherContent.pedagogicalStrategy && (
                    <div className="flex items-center gap-3 mb-4">
                      <div className="px-4 py-1.5 rounded-full bg-pal-moss text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                        Recommended Strategy: {teacherContent.pedagogicalStrategy}
                      </div>
                      <div className="flex-1 h-px bg-pal-cafenoir/10" />
                    </div>
                  )}

                  <div className="card-paper p-8 flex flex-col items-center text-center space-y-6" style={{ background: 'var(--pal-tan)' }}>
                    <div className="w-32 h-32 rounded-3xl bg-white flex items-center justify-center shadow-2xl relative border-2 border-pal-cafenoir">
                      <img src="/mascot.png" alt="Cardo" className="w-24 h-24 object-contain" />
                      <div className="absolute -bottom-2 -right-2 p-2 rounded-xl shadow-lg border-4" style={{ background: 'var(--pal-tan)', borderColor: 'var(--pal-cafenoir)' }}>
                        <AudioLines size={20} className="text-pal-cafenoir" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-paper-primary">Podcast Session</h3>
                      <p className="text-paper-muted text-sm max-w-sm mx-auto font-bold">Follow along with the visual waveform as Cardo explains <span className="font-extrabold" style={{ color: 'var(--duo-blue)' }}>{activeTopic}</span>.</p>
                    </div>

                    <WaveformPlayer
                      summaryText={teacherContent.summary || (typeof teacherContent.teacherContent === 'string' ? teacherContent.teacherContent.substring(0, 400) : `A summary of ${activeTopic}.`)}
                      className="max-w-xl mx-auto"
                    />
                  </div>

                  {/* Feynman Lab */}
                  <div className="card-paper p-8 space-y-6" style={{ background: 'var(--pal-paper)', borderTop: '4px solid var(--duo-purple)' }}>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-duo-purple mb-1">Pedagogical Technique</p>
                        <h4 className="text-xl font-black text-paper-primary">Feynman Technique Lab</h4>
                      </div>
                      <div className="p-3 bg-pal-bone rounded-2xl border-2 border-pal-cafenoir">
                        <Brain size={24} className="text-duo-purple" />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <p className="text-sm font-bold text-paper-muted leading-relaxed flex-1">
                        Cardo has prepared a simplified explanation to help you teach this concept back. Auditory learners master topics by <span className="text-duo-purple">explaining them simply</span>.
                      </p>
                      <button
                        onClick={() => {
                          const eli5 = teacherContent.explainLikeIm5 || teacherContent.sections?.[0]?.cards?.[0]?.explainLikeIm5 || teacherContent.summary || "Summary loading...";
                          if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
                          const ut = new SpeechSynthesisUtterance(eli5);
                          ut.rate = 0.95;
                          window.speechSynthesis.speak(ut);
                        }}
                        className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-[16px] border-2 border-duo-purple/20 bg-duo-purple/10 text-duo-purple font-black text-[10px] uppercase tracking-widest hover:bg-duo-purple hover:text-white transition-all shadow-sm"
                      >
                        <Volume2 size={14} /> Read Aloud
                      </button>
                    </div>
                    <div className="p-6 rounded-[24px] bg-pal-bone border-2 border-dashed border-pal-cafenoir text-sm font-medium text-paper-primary leading-relaxed">
                      {(() => {
                        const eli5 = teacherContent.explainLikeIm5
                          || teacherContent.sections?.[0]?.cards?.[0]?.explainLikeIm5
                          || teacherContent.sections?.flatMap((s: any) => s.cards || []).find((c: any) => c.explainLikeIm5)?.explainLikeIm5
                          || teacherContent.summary;
                        return eli5
                          ? <><span className="text-lg mr-2">🧒</span>{eli5}</>
                          : <span className="italic opacity-60">Cardo is preparing a simplified explanation...</span>;
                      })()}
                    </div>
                  </div>

                  {/* Transcript */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={18} style={{ color: 'var(--pal-moss)' }} />
                      <span className="text-xs font-black uppercase tracking-widest text-paper-primary">Narrative Breakdown</span>
                    </div>
                    <div className="card-paper max-h-[500px] overflow-y-auto p-0 border-2" style={{ background: 'var(--pal-paper)' }}>
                      <div className="p-8 space-y-8">
                        {typeof teacherContent.teacherContent === 'string'
                          ? teacherContent.teacherContent.split('\n\n').map((para: string, idx: number) => {
                            const match = para.match(/^\[(\d{2}:\d{2})\]/);
                            const timestamp = match ? match[1] : null;
                            const cleanText = para.replace(/^\[\d{2}:\d{2}\]\s*/, '');

                            return (
                              <div key={idx} className="flex gap-6 group">
                                <div className="flex flex-col items-center">
                                  <div className="w-10 h-10 rounded-full bg-pal-bone border-2 border-pal-cafenoir flex items-center justify-center shrink-0">
                                    <AudioLines size={16} className="text-pal-moss" />
                                  </div>
                                  <div className="flex-1 w-0.5 bg-pal-tan mt-2" />
                                </div>
                                <div className="pb-4">
                                  {timestamp && <span className="text-[10px] font-black font-mono block mb-2 opacity-60" style={{ color: 'var(--pal-moss)' }}>TIMESTAMP: {timestamp}</span>}
                                  <p className={`text-base leading-relaxed font-bold ${timestamp ? 'text-paper-primary' : 'text-paper-muted italic'}`}>
                                    {cleanText}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                          : <p className="text-paper-muted text-sm text-center py-10 font-bold">Cardo's narration is being transcribed...</p>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── VISUAL: AI Diagram + Knowledge Map ── */}
              {result === 'Visual' && (
                <div className="grid grid-cols-1 gap-8">
                  {teacherContent.mermaidDiagram && (
                    <div className="card-paper p-10 space-y-6" style={{ background: 'white', borderTop: '4px solid var(--pal-cafenoir)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="section-label flex items-center gap-2" style={{ color: 'var(--pal-cafenoir)' }}>
                          <Eye size={14} /> {teacherContent.pedagogicalStrategy || 'Concept Diagram'}
                        </p>
                        <div className="px-4 py-1.5 rounded-full bg-pal-moss/10 text-pal-moss text-[9px] font-black uppercase tracking-widest border border-pal-moss/20">
                          Recommended Strategy
                        </div>
                      </div>
                      <div className="p-8 bg-white rounded-[32px] border-2 border-pal-tan/30 shadow-inner flex justify-center">
                        <MermaidDiagram chart={teacherContent.mermaidDiagram} />
                      </div>
                      <p className="text-[10px] text-center text-paper-muted font-black uppercase tracking-widest mt-4 italic">
                        Cardo used {teacherContent.pedagogicalStrategy || 'a Visual Map'} to explain {activeTopic}
                      </p>
                    </div>
                  )}

                  <div className="card-paper" style={{ borderTop: '3px solid var(--pal-cafenoir)' }}>
                    <div className="flex items-center justify-between mb-6">
                      <p className="section-label flex items-center gap-2" style={{ color: 'var(--pal-cafenoir)' }}>
                        <Zap size={14} /> Step-by-Step Breakdown
                      </p>
                    </div>
                    <div className="space-y-3">
                      {(() => {
                        // Prefer sections cards for richer data, fall back to outline strings
                        const items: Array<{ title: string; content?: string }> =
                          teacherContent.sections?.flatMap((s: any) =>
                            (s.cards || []).slice(0, 1).map((c: any) => ({ title: c.title || s.sectionTitle, content: c.content }))
                          ) ||
                          (teacherContent.outline || []).map((t: string) => ({ title: t }));
                        return items.map((item: { title: string; content?: string }, idx: number) => (
                          <motion.div
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.08 }}
                            key={idx} className="flex items-start gap-4 group"
                          >
                            <div className="w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center font-black transition-all group-hover:bg-pal-cafenoir group-hover:text-white mt-1" style={{ background: 'var(--pal-bone)', border: '2px solid var(--pal-cafenoir)', color: 'var(--pal-cafenoir)' }}>
                              {idx + 1}
                            </div>
                            <div className="flex-1 p-5 rounded-[24px] transition-all border-2" style={{ background: 'white', borderColor: 'var(--pal-cafenoir)' }}>
                              <p className="text-sm font-bold text-paper-primary leading-snug">{item.title}</p>
                              {item.content && (
                                <p className="text-xs font-medium mt-2 leading-relaxed" style={{ color: 'var(--pal-moss)' }}>
                                  {item.content.length > 160 ? item.content.substring(0, 160) + '…' : item.content}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        ));
                      })()}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                    <div className="card-paper flex flex-col" style={{ background: 'var(--pal-paper)', borderTop: '3px solid var(--pal-cafenoir)', minHeight: 320 }}>
                      <p className="section-label mb-4 flex items-center gap-2" style={{ color: 'var(--pal-moss)' }}>
                        <Zap size={14} /> Color Coded Concepts
                      </p>
                      <div className="space-y-3 flex-1">
                        {(() => {
                          const COLORS = [
                            { bg: 'rgba(53,64,36,0.1)', border: 'var(--pal-moss)', label: 'Core Process', text: 'var(--pal-moss)' },
                            { bg: 'rgba(28,176,246,0.1)', border: '#1CB0F6', label: 'Key Term', text: '#1CB0F6' },
                            { bg: 'rgba(206,130,255,0.1)', border: '#CE82FF', label: 'Support Detail', text: '#CE82FF' },
                          ];
                          const cards = (teacherContent.sections || [])
                            .slice(0, 3)
                            .map((s: any) => (s.cards || [])[0])
                            .filter(Boolean);
                          if (cards.length === 0) return <p className="text-xs text-paper-muted font-bold italic">No concept data yet.</p>;
                          return cards.map((c: any, i: number) => (
                            <div key={i} className="p-4 rounded-[24px] border-l-8 shadow-sm" style={{ background: COLORS[i].bg, borderColor: COLORS[i].border }}>
                              <p className="text-[10px] font-black uppercase mb-1" style={{ color: COLORS[i].text }}>{COLORS[i].label}</p>
                              <p className="text-sm font-bold text-paper-primary">{c.title}</p>
                              {c.content && <p className="text-xs font-medium mt-1 leading-relaxed" style={{ color: 'var(--pal-moss)', opacity: 0.85 }}>{c.content.substring(0, 100)}{c.content.length > 100 ? '…' : ''}</p>}
                            </div>
                          ));
                        })()}
                      </div>
                    </div>

                    <div className="card-paper flex flex-col" style={{ background: 'var(--pal-paper)', borderTop: '3px solid var(--pal-cafenoir)', minHeight: 320 }}>
                      <p className="section-label mb-4 flex items-center gap-2" style={{ color: 'var(--pal-moss)' }}>
                        <Eye size={14} /> Visual Flashcards
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        {teacherContent.flashcards?.slice(0, 4).map((f: any, i: number) => (
                          <div key={i} className="aspect-square p-5 rounded-[32px] border-2 flex flex-col items-center justify-center text-center group cursor-help transition-all hover:bg-pal-tan" style={{ borderColor: 'var(--pal-tan)' }}>
                            <span className="text-3xl mb-3">📸</span>
                            <p className="text-[11px] font-black text-paper-primary leading-tight">{f.question}</p>
                            <div className="mt-3 h-0 overflow-hidden group-hover:h-auto transition-all">
                              <p className="text-[9px] text-paper-muted font-bold">{f.answer}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="card-paper" style={{ background: 'var(--pal-paper)', borderTop: '3px solid var(--pal-cafenoir)' }}>
                    <p className="section-label mb-4" style={{ color: 'var(--pal-moss)' }}>Full Visual Context</p>
                    <div className="text-paper-primary text-sm leading-relaxed whitespace-pre-wrap font-bold">
                      {typeof teacherContent.teacherContent === 'string'
                        ? teacherContent.teacherContent.trim()
                        : 'Visual map description ready.'}
                    </div>
                  </div>
                </div>
              )}

              {/* READ/WRITE: Cornell Note Layout */}
              {result === 'Reading/Writing' && (
                <div className="space-y-8">
                  {/* Pedagogical Strategy Badge */}
                  {teacherContent.pedagogicalStrategy && (
                    <div className="flex items-center gap-3 mb-4">
                      <div className="px-4 py-1.5 rounded-full bg-pal-moss text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                        Recommended Strategy: {teacherContent.pedagogicalStrategy}
                      </div>
                      <div className="flex-1 h-px bg-pal-cafenoir/10" />
                    </div>
                  )}

                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column: Cues & Keywords */}
                    <div className="w-full lg:w-1/4 space-y-4">
                      <div className="card-paper h-full p-6 border-l-8" style={{ background: 'var(--pal-tan)', borderLeftColor: 'var(--pal-cafenoir)' }}>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-4 text-paper-primary opacity-60">Keywords & Cues</p>
                        <div className="space-y-6">
                          {teacherContent.flashcards?.slice(0, 5).map((f: any, i: number) => (
                            <div key={i} className="space-y-2">
                              <p className="text-sm font-black" style={{ color: 'var(--pal-cafenoir)' }}>{f.question}</p>
                              <div className="h-px w-full bg-paper-primary/10" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Main Notes */}
                    <div className="w-full lg:w-3/4 flex flex-col gap-6">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                        className="card-paper p-10 flex-1"
                        style={{ borderTop: '6px solid var(--pal-cafenoir)', background: 'var(--pal-paper)' }}
                      >
                        <div className="flex items-center justify-between mb-8 pb-4 border-b-2" style={{ borderColor: 'var(--pal-bone)' }}>
                          <div className="flex items-center gap-4">
                            <span className="text-3xl">📝</span>
                            <h3 className="text-2xl font-black text-paper-primary">Study Notes</h3>
                          </div>
                          <div className="hidden sm:block text-[10px] font-black uppercase text-paper-muted bg-pal-bone px-3 py-1 rounded-full">Cornell System</div>
                        </div>
                        <div className="prose prose-invert prose-sm max-w-none">
                          <ReactMarkdown
                            components={{
                              h1: ({ children }) => <h1 className="text-xl font-black text-paper-primary mt-6 mb-3 border-b-2 pb-2" style={{ borderColor: 'var(--pal-bone)' }}>{children}</h1>,
                              h2: ({ children }) => <h2 className="text-lg font-black text-paper-primary mt-8 mb-4 flex items-center gap-3"><div className="w-3 h-3 rounded-md rotate-45" style={{ background: 'var(--pal-cafenoir)' }} /> {children}</h2>,
                              h3: ({ children }) => <h3 className="text-sm font-black mt-5 mb-2 px-3 py-1 bg-pal-bone rounded-lg w-fit" style={{ color: 'var(--pal-cafenoir)' }}>{children}</h3>,
                              p: ({ children }) => <p className="text-paper-primary text-sm leading-loose mb-6 font-bold">{children}</p>,
                              ul: ({ children }) => <ul className="space-y-3 mb-6 pl-2">{children}</ul>,
                              ol: ({ children }) => <ol className="space-y-3 mb-6 pl-6 list-decimal">{children}</ol>,
                              li: ({ children }) => <li className="text-paper-primary text-sm flex items-start gap-3 font-bold group"><ArrowRight size={14} className="mt-1 shrink-0" style={{ color: 'var(--pal-cafenoir)' }} /><span>{children}</span></li>,
                              strong: ({ children }) => <strong className="font-black text-paper-primary underline decoration-2 decoration-pal-tan underline-offset-4">{children}</strong>,
                              blockquote: ({ children }) => <blockquote className="border-l-4 pl-6 py-3 italic text-paper-muted text-base font-bold my-8" style={{ borderColor: 'var(--pal-cafenoir)', background: 'var(--pal-bone)' }}>{children}</blockquote>,
                              code: ({ children }) => <code className="px-2 py-1 rounded text-xs font-mono font-black border" style={{ background: 'var(--pal-bone)', color: 'var(--pal-cafenoir)', borderColor: 'var(--pal-tan)' }}>{children}</code>,
                            }}
                          >
                            {typeof teacherContent.teacherContent === 'string' ? teacherContent.teacherContent : `# Study Guide\n\n${JSON.stringify(teacherContent.teacherContent)}`}
                          </ReactMarkdown>
                        </div>
                      </motion.div>

                      {/* Summary Section (Cornell Style) */}
                      <div className="card-paper p-8 border-t-8 shadow-2xl" style={{ borderTopColor: 'var(--pal-cafenoir)', background: 'var(--pal-tan)' }}>
                        <div className="flex items-center gap-3 mb-6">
                          <Brain size={20} className="text-paper-primary opacity-60" />
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-paper-primary opacity-60">Synthesis & Summary</p>
                        </div>
                        <div className="p-6 bg-white/60 rounded-[32px] border-2 border-pal-cafenoir/10 backdrop-blur-sm">
                          <p className="text-sm font-bold text-paper-primary leading-relaxed">
                            {teacherContent.summary || "Summary generation in progress..."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          ) : null}

          {/* Floating Bottom Actions */}
          <AnimatePresence>
            {teacherContent && (
              <motion.div
                initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-8 right-8 z-40 flex items-center gap-3"
              >
                <motion.button
                  onClick={() => setChatOpen(true)}
                  className="flex items-center gap-3 h-14 pl-4 pr-6 rounded-2xl text-paper-primary font-black overflow-hidden shadow-xl border-2"
                  style={{ background: 'var(--pal-bone)', borderColor: 'var(--pal-cafenoir)', borderBottomWidth: '6px' }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-8 h-8 rounded-lg bg-white p-0.5 border-2 border-pal-cafenoir">
                    <img src="/mascot.png" alt="Cardo" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-xs uppercase tracking-widest text-pal-cafenoir">Ask Cardo</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* ── ASK Cardo CHAT PANEL ── */}
        <AnimatePresence>
          {chatOpen && (
            <div className="fixed inset-0 z-[100] flex justify-end">
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setChatOpen(false)}
              />
              <motion.div
                initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="relative w-full max-w-md flex flex-col overflow-hidden h-full shadow-2xl"
                style={{ background: 'var(--pal-tan)', borderLeft: '2px solid var(--pal-cafenoir)' }}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b-2" style={{ borderColor: 'var(--pal-cafenoir)', background: 'var(--pal-bone)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white p-1 overflow-hidden" style={{ border: '2px solid var(--pal-cafenoir)' }}>
                      <img src="/mascot.png" alt="Cardo" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-paper-primary">Ask Cardo</p>
                      <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--duo-blue)' }}>Specialized {result} Assistant</p>
                    </div>
                  </div>
                  <motion.button onClick={() => setChatOpen(false)} className="text-gray-500 hover:text-white transition-colors" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <X size={20} />
                  </motion.button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                  {chatMessages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full opacity-40 text-center space-y-4 px-10">
                      <MessageSquare size={48} />
                      <p className="text-sm font-medium">Ask Cardo anything about your {result} study materials.</p>
                    </div>
                  )}
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium ${msg.role === 'user'
                          ? 'self-end text-white'
                          : 'self-start text-gray-200'
                        }`}
                      style={msg.role === 'user' ? {
                        background: 'var(--pal-tan)',
                        color: 'var(--pal-cafenoir)',
                        borderRadius: '18px 18px 4px 18px',
                        border: '2px solid var(--pal-cafenoir)',
                        borderBottomWidth: '4px'
                      } : {
                        background: 'var(--pal-paper)',
                        border: '2px solid var(--pal-cafenoir)',
                        borderBottomWidth: '4px',
                        borderRadius: '18px 18px 18px 4px',
                        color: 'var(--pal-cafenoir)',
                      }}
                    >
                      <span className="whitespace-pre-wrap">{msg.content}</span>
                    </div>
                  ))}
                  {isChatting && (
                    <div className="self-start p-4 rounded-2xl flex items-center gap-2" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
                      <Loader2 size={16} className="animate-spin" style={{ color: 'var(--duo-blue)' }} />
                      <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Cardo is thinking...</span>
                    </div>
                  )}
                </div>

                {/* Input */}
                <form onSubmit={sendChatMessage} className="p-4 flex items-center gap-2" style={{ borderTop: '2px solid var(--pal-cafenoir)', background: 'var(--pal-bone)' }}>
                  <input
                    type="text"
                    className="input-paper flex-1 h-12"
                    placeholder="Ask a question..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={isChatting}
                  />
                  <motion.button
                    type="submit"
                    disabled={isChatting || !chatInput.trim()}
                    className="btn-duo h-12 w-12 p-0 flex items-center justify-center shrink-0 shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send size={18} />
                  </motion.button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
