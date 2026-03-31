'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Brain, MessageSquare, BookOpen, ArrowLeft, RefreshCw, MapPin, Target, Sparkles, Lightbulb } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

const DIALECT_INFO: Record<string, { desc: string; regions: string[]; provinces: string[] }> = {
  tagalog: {
    desc: "The primary language of the National Capital Region and the foundation of the Filipino national language.",
    regions: ["NCR", "CALABARZON", "MIMAROPA", "Central Luzon"],
    provinces: ["Manila", "Cavite", "Laguna", "Batangas", "Rizal", "Quezon", "Bulacan", "Bataan"]
  },
  cebuano: {
    desc: "Also known as Bisaya, it is the most widely spoken native language in the Philippines by number of native speakers.",
    regions: ["Central Visayas", "Eastern Visayas", "Northern Mindanao", "Davao Region", "Caraga"],
    provinces: ["Cebu", "Bohol", "Negros Oriental", "Siquijor", "Davao", "Misamis Oriental", "Leyte"]
  },
  ilocano: {
    desc: "The third most-spoken native language of the Philippines and the lingua franca of Northern Luzon.",
    regions: ["Ilocos Region", "Cagayan Valley", "Cordillera Administrative Region"],
    provinces: ["Ilocos Norte", "Ilocos Sur", "La Union", "Pangasinan", "Abra", "Isabela", "Cagayan"]
  },
  hiligaynon: {
    desc: "Often referred to as Ilonggo, it is known for its gentle, melodic intonation.",
    regions: ["Western Visayas", "SOCCSKSARGEN"],
    provinces: ["Iloilo", "Negros Occidental", "Guimaras", "Capiz", "South Cotabato", "Sultan Kudarat"]
  },
  bicolano: {
    desc: "A group of languages spoken primarily in the Bicol Peninsula and nearby islands.",
    regions: ["Bicol Region"],
    provinces: ["Albay", "Camarines Sur", "Camarines Norte", "Sorsogon", "Catanduanes", "Masbate"]
  },
  waray: {
    desc: "The native language of the Waray people, known for its strong and direct character.",
    regions: ["Eastern Visayas"],
    provinces: ["Samar", "Northern Samar", "Eastern Samar", "Leyte", "Biliran"]
  }
};

type LessonData = { englishPhrase: string; dialectPhrase: string; hint?: string; explanation: string; validTranslations: string[]; wrongOptions?: string[] };

export default function DialectDashboard() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const dialectName = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Dialect';

  const [activeView, setActiveView] = useState<'dashboard' | 'lessons' | 'phrase' | 'skill'>('dashboard');

  // Curriculum state
  const [units, setUnits] = useState<{ id: number; title: string; topics: string[] }[]>([]);
  const [isCurriculumLoading, setIsCurriculumLoading] = useState(false);

  // Lesson tab alternating flow state
  const [lessonPhase, setLessonPhase] = useState<'lesson' | 'question'>('lesson');
  const [lessonTopicQueue, setLessonTopicQueue] = useState<string[]>([]);
  const [lessonTopicIndex, setLessonTopicIndex] = useState(0);

  // Shared state for procedural generation
  const [isLoading, setIsLoading] = useState(false);
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [answer, setAnswer] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [currentTopic, setCurrentTopic] = useState<string>('random');
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    if (activeView === 'lessons' && units.length === 0) {
      fetchCurriculum();
    }
  }, [activeView, dialectName]);

  const fetchCurriculum = async () => {
    setIsCurriculumLoading(true);
    try {
      const res = await fetch('/api/dialect/curriculum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dialect: dialectName })
      });
      const data = await res.json();
      setUnits(data.units || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCurriculumLoading(false);
    }
  };

  const fetchProceduralContent = async (topicType: string | null = null) => {
    setIsLoading(true);
    const targetTopic = topicType || currentTopic;
    if (topicType) setCurrentTopic(topicType);

    setLesson(null);
    setAnswer('');
    setIsChecked(false);
    setIsCorrect(false);
    setShowHint(false);
    try {
      const res = await fetch(`/api/dialect/lesson`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dialect: dialectName,
          topic: targetTopic,
          seed: Math.random() + Date.now(),
          exclude: history.slice(-15),
          isStrict: activeView === 'phrase' && currentTopic !== 'random'
        })
      });
      if (!res.ok) {
        throw new Error('API_FALLBACK');
      }
      const data = await res.json();
      setLesson(data);
      if (data.englishPhrase) {
        setHistory(prev => [...prev, data.englishPhrase].slice(-20));
      }

      if (data.wrongOptions) {
        const options = [data.dialectPhrase, ...data.wrongOptions.slice(0, 3)];
        setShuffledOptions(options.sort(() => Math.random() - 0.5));
      } else {
        setShuffledOptions([]);
      }
    } catch (e) {
      setLesson({
        englishPhrase: 'Good morning',
        dialectPhrase: 'Magandang umaga',
        explanation: "API fallback. 'Maganda' means beautiful/good.",
        validTranslations: ['Magandang umaga'],
        wrongOptions: ['Magandang gabi', 'Salamat po', 'Kamusta ka']
      });
      setShuffledOptions(['Magandang umaga', 'Magandang gabi', 'Salamat po', 'Kamusta ka'].sort(() => Math.random() - 0.5));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartActivity = (view: 'phrase' | 'skill') => {
    // Clear lesson flow queue when entering from dashboard
    setLessonTopicQueue([]);
    setLessonTopicIndex(0);
    setActiveView(view);
    fetchProceduralContent(view === 'skill' ? 'quiz' : 'random');
  };

  const TopBar = ({ title }: { title: string }) => (
    <div className="p-4 flex items-center justify-between max-w-[1440px] mx-auto w-full">
      <button
        onClick={() => activeView === 'dashboard' ? router.push('/dialect') : setActiveView('dashboard')}
        className="p-3 hover:bg-black/5 rounded-[20px] transition-colors shrink-0"
      >
        {activeView === 'dashboard' ? <X size={24} className="text-paper-muted" /> : <ArrowLeft size={24} className="text-paper-muted" />}
      </button>
      <h1 className="font-black text-xs uppercase tracking-[0.3em] text-paper-muted/60">{title}</h1>
      <div className="w-10"></div>
    </div>
  );

  if (activeView === 'dashboard') {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--pal-bone)', color: 'var(--pal-cafenoir)' }}>
        <TopBar title={`${dialectName} Hub`} />
        <div className="flex-1 flex flex-col max-w-[1440px] mx-auto w-full px-4 pt-8">

          {/* Enhanced Info Card */}
          <div className="card-paper mb-10 p-8 relative overflow-hidden group" style={{ background: 'var(--pal-tan)' }}>
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <MapPin size={120} />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-4 rounded-[24px] bg-white text-pal-moss border-2 border-pal-cafenoir shadow-md">
                  <MapPin size={24} />
                </div>
                <h2 className="text-3xl font-black text-paper-primary tracking-tight">{dialectName}</h2>
              </div>

              <p className="text-paper-primary/80 leading-relaxed mb-8 italic text-base border-l-4 border-pal-moss/40 pl-5">
                "{DIALECT_INFO[slug.toLowerCase()]?.desc || "Connecting you to the local culture and language of the Philippines."}"
              </p>

              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-pal-cafenoir/10">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-pal-moss mb-3">Major Regions</p>
                  <p className="text-sm text-paper-muted leading-relaxed font-bold">
                    {DIALECT_INFO[slug.toLowerCase()]?.regions.join(" • ") || "Philippines"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-pal-moss mb-3">Key Provinces</p>
                  <p className="text-sm text-paper-muted leading-relaxed font-bold line-clamp-2">
                    {DIALECT_INFO[slug.toLowerCase()]?.provinces.join(", ") || "Multiple Provinces"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-paper-muted/60 mb-6">Learning Pathways</p>

          <div className="grid gap-5">
            {[
              { id: 'lessons', icon: <BookOpen className="text-[#ce82ff]" />, title: 'Lesson Tabs', desc: 'Step-by-step curriculum modules' },
              { id: 'phrase', icon: <MessageSquare className="text-[#1cb0f6]" />, title: 'Phrase Explorer', desc: 'Discover random conversational phrases' },
              { id: 'skill', icon: <Brain className="text-[#ff9600]" />, title: 'Skill Test', desc: 'Test your knowledge with AI quizzes' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => item.id === 'lessons' ? setActiveView('lessons') : handleStartActivity(item.id as any)}
                className="relative group cursor-pointer"
              >
                <div className="card-paper relative p-6 flex items-center justify-between transition-all group-hover:-translate-y-1 group-active:translate-y-1 group-active:shadow-none shadow-xl" style={{ background: 'var(--pal-paper)' }}>
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[24px] bg-white flex items-center justify-center border-2 border-pal-cafenoir shadow-inner">
                      {item.icon}
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-black text-paper-primary">{item.title}</h3>
                      <p className="text-paper-muted/60 text-xs font-bold mt-1 uppercase tracking-wider">{item.desc}</p>
                    </div>
                  </div>
                  <Sparkles size={20} className="text-pal-cafenoir/10 group-hover:text-pal-cafenoir/30 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeView === 'lessons') {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--pal-bone)', color: 'var(--pal-cafenoir)' }}>
        <TopBar title="Interactive Curriculum" />
        <div className="flex-1 flex flex-col max-w-[1440px] mx-auto w-full px-4 pt-8 pb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-pal-moss mb-8">Unit Selection</p>

          {isCurriculumLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <RefreshCw className="animate-spin text-pal-moss" size={32} />
              <p className="text-paper-muted font-black uppercase tracking-[0.2em] text-[10px]">Designing your path...</p>
            </div>
          ) : (
            <div className="grid gap-5">
              {units.map((unit) => (
                <button
                  key={unit.id}
                  onClick={() => {
                    // Start alternating lesson-question flow
                    setLessonTopicQueue(unit.topics);
                    setLessonTopicIndex(0);
                    setLessonPhase('lesson');
                    setActiveView('phrase');
                    const firstTopic = unit.topics[0] || 'random';
                    fetchProceduralContent(firstTopic);
                  }}
                  className="relative group cursor-pointer"
                >
                  <div className="card-paper relative p-6 flex items-center gap-6 transition-all group-hover:-translate-y-1 group-active:translate-y-1 group-active:shadow-none shadow-xl" style={{ background: 'var(--pal-tan)' }}>
                    <div
                      className="w-16 h-16 rounded-[24px] flex items-center justify-center text-xl font-black bg-white text-pal-cafenoir border-2 border-pal-cafenoir shadow-md"
                    >
                      {unit.id}
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="font-black text-lg text-paper-primary group-hover:text-pal-moss transition-colors">{unit.title}</h3>
                      <p className="text-[10px] uppercase font-black tracking-widest text-paper-muted mt-1">
                        {unit.topics.join(' • ')}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Activity View (Phrase/Skill)
  const isQuiz = activeView === 'skill';
  const isLessonFlow = lessonTopicQueue.length > 0 && !isQuiz;
  const showLessonSlide = isLessonFlow && lessonPhase === 'lesson';
  const showQuestionSlide = isQuiz || (isLessonFlow && lessonPhase === 'question');

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--pal-bone)', color: 'var(--pal-cafenoir)' }}>
      <TopBar title={isQuiz ? 'Skill Check' : (isLessonFlow ? `Section ${lessonTopicIndex + 1} — ${lessonPhase === 'lesson' ? 'Learn' : 'Practice'}` : 'Quick Lesson')} />
      <div className="flex-1 flex flex-col max-w-[1440px] mx-auto w-full px-6 pt-12 pb-32">

        {/* Section topic badge for lesson flow */}
        {isLessonFlow && lessonTopicQueue[lessonTopicIndex] && (
          <div className="flex items-center gap-3 mb-6 max-w-2xl mx-auto w-full">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider"
              style={{ background: 'var(--pal-tan)', color: 'var(--pal-kombu)', border: '2px solid var(--pal-cafenoir)', borderBottom: '4px solid var(--pal-cafenoir)' }}
            >
              📖 Section {lessonTopicIndex + 1}: {lessonTopicQueue[lessonTopicIndex]}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-pal-moss">
              {lessonPhase === 'lesson' ? 'Learn the phrase' : 'Test your knowledge'}
            </span>
          </div>
        )}

        <div className="mb-12">
          <div className="flex items-center justify-between mb-8 max-w-2xl mx-auto">
            <h2 className="text-3xl font-black text-center flex-1 text-paper-primary uppercase tracking-tight">
              {showQuestionSlide ? 'Translate this sentence' : 'New Expression Found!'}
            </h2>
            {showQuestionSlide && lesson?.hint && (
              <button
                onClick={() => setShowHint(true)}
                disabled={showHint}
                className={`flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.1em] px-3 py-2 sm:px-4 sm:py-2 rounded-xl transition-all border-2 shadow-sm ${
                  showHint 
                    ? 'bg-pal-tan/50 border-pal-tan/50 text-pal-cafenoir opacity-60'
                    : 'bg-yellow-50 border-yellow-400 text-yellow-700 hover:bg-yellow-100 disabled:opacity-40'
                }`}
              >
                <Lightbulb size={14} className={!showHint ? "text-yellow-500" : ""} />
                Hint
              </button>
            )}
          </div>
          <div className="relative group mx-auto w-fit">
            <div className="absolute -left-14 top-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-300">
               <img 
                 src="/mascot.png" 
                 alt="Mascot" 
                 className="w-24 h-24 object-contain"
               />
            </div>
            <div className="ml-16 p-6 rounded-[2rem] bg-white border-2 border-pal-cafenoir shadow-xl relative">
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-l-2 border-b-2 border-pal-cafenoir rotate-45" />
              {isLoading ? (
                <div className="flex gap-2 p-2 px-6">
                  <div className="w-2 h-2 rounded-full bg-pal-cafenoir/30 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-pal-cafenoir/30 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-pal-cafenoir/30 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              ) : (
                <p className="text-2xl font-black italic text-paper-primary">
                  &quot;{lesson?.englishPhrase}&quot;
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Display active hint if exists */}
        {showQuestionSlide && (
          <AnimatePresence>
            {showHint && lesson?.hint && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -10 }} 
                animate={{ opacity: 1, height: 'auto', y: 0 }} 
                className="mb-8 max-w-2xl mx-auto p-5 rounded-[24px] bg-yellow-50/50 border-2 border-yellow-200/50 flex gap-4 items-start shadow-sm"
              >
                  <div className="p-2 bg-yellow-100 rounded-xl text-yellow-600 flex-shrink-0">
                    <Lightbulb size={20} />
                  </div>
                  <div>
                    <span className="font-black uppercase tracking-widest text-[10px] opacity-60 block mb-1 text-yellow-800">Guided Hint</span>
                    <p className="text-sm font-bold text-yellow-900 leading-relaxed">
                      {lesson.hint}
                    </p>
                  </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Lesson phase: show the lesson content */}
        {(showLessonSlide || (!isQuiz && !isLessonFlow)) ? (
          <motion.div
            key={`lesson-${lessonTopicIndex}-${lesson?.englishPhrase}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-paper p-10 relative overflow-hidden"
            style={{ borderTop: '6px solid var(--pal-moss)', background: 'var(--pal-tan)' }}
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 text-pal-moss">
              <Sparkles size={120} />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-pal-moss mb-4">
                {isLessonFlow && lessonTopicQueue[lessonTopicIndex] ? `${lessonTopicQueue[lessonTopicIndex]} — Native Dialect` : 'Native Dialect'}
              </p>
              <p className="text-5xl font-black text-paper-primary mb-8 tracking-tighter">
                {lesson?.dialectPhrase}
              </p>
              <div className="p-6 rounded-3xl bg-white/40 border-2 border-pal-cafenoir backdrop-blur-sm">
                <p className="text-sm font-bold text-paper-muted leading-relaxed uppercase tracking-wider mb-2 opacity-50">Context & Breakdown</p>
                <p className="text-paper-primary leading-relaxed font-medium">
                  {lesson?.explanation}
                </p>
              </div>
            </div>
          </motion.div>
        ) : showQuestionSlide ? (
          <motion.div
            key={`question-${lessonTopicIndex}-${lesson?.englishPhrase}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 transition-opacity">
              {shuffledOptions.map((opt, i) => {
                const isValid = lesson?.validTranslations.some(v => v.toLowerCase() === opt.toLowerCase());
                let btnStyle = "border-pal-cafenoir bg-white text-paper-primary shadow-lg";
                if (answer === opt && !isChecked) btnStyle = "border-pal-moss bg-pal-moss/10 text-pal-moss shadow-xl";
                if (isChecked && isValid) btnStyle = "border-[#58cc02] bg-[#58cc02]/10 text-[#58cc02]";
                if (isChecked && answer === opt && !isValid) btnStyle = "border-[#ff4b4b] bg-[#ff4b4b]/10 text-[#ff4b4b]";

                return (
                  <button
                    key={i}
                    onClick={() => setAnswer(opt)}
                    disabled={isLoading || isChecked}
                    className={`p-6 rounded-3xl border-2 text-left font-black text-lg transition-all active:translate-y-1 active:shadow-none ${btnStyle}`}
                    style={{ borderBottomWidth: '4px' }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </div>

      {/* Persistent Action Bar */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 p-6 md:p-8 bg-paper-bg/95 border-t-4 border-pal-cafenoir z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
        <div className="max-w-[1440px] mx-auto flex justify-end">
          {!isChecked ? (
            <button
              onClick={() => {
                if (showQuestionSlide) {
                  handleCheckSkill();
                } else if (showLessonSlide) {
                  // Transition from lesson to question phase (same content)
                  setLessonPhase('question');
                  setAnswer('');
                  setIsChecked(false);
                  setIsCorrect(false);
                  setShowHint(false);
                  // Re-shuffle options for the quiz
                  if (lesson?.wrongOptions) {
                    const options = [lesson.dialectPhrase, ...lesson.wrongOptions.slice(0, 3)];
                    setShuffledOptions(options.sort(() => Math.random() - 0.5));
                  }
                } else {
                  // Phrase explorer: go to skill check
                  setActiveView('skill');
                }
              }}
              disabled={isLoading || (showQuestionSlide && !answer)}
              className={`py-4 px-10 rounded-[20px] font-black uppercase tracking-[0.2em] text-xs transition-all border-2 border-pal-cafenoir
                ${(isLoading || (showQuestionSlide && !answer))
                  ? 'bg-pal-bone text-paper-muted cursor-not-allowed border-pal-cafenoir/20'
                  : 'bg-pal-moss text-white shadow-xl hover:brightness-110 active:translate-y-1 active:shadow-none'}`}
              style={{ borderBottomWidth: '4px' }}
            >
              {isLoading ? 'Wait...' : (showQuestionSlide ? 'Check Answer' : (showLessonSlide ? 'Test This →' : 'Test Knowledge'))}
            </button>
          ) : (
            <div className="flex flex-col lg:flex-row items-center gap-4 w-full">
              <div className={`flex-1 flex items-start sm:items-center gap-4 p-4 rounded-[24px] w-full border-2 ${isCorrect ? 'bg-[#58cc02]/10 text-[#58cc02] border-[#58cc02]/20' : 'bg-[#ff4b4b]/10 text-[#ff4b4b] border-[#ff4b4b]/20'}`}>
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border-2 border-pal-cafenoir mt-1 sm:mt-0">
                  {isCorrect ? <Check size={20} color="#58cc02" /> : <X size={20} color="#ff4b4b" />}
                </div>
                <div>
                  <p className="font-black text-[12px] md:text-[14px] uppercase tracking-widest mb-1">{isCorrect ? 'Brilliant!' : 'Not quite right'}</p>
                  {!isCorrect && (
                    <div className="text-[12px] md:text-[13px] font-bold text-paper-primary/80 mt-1">
                      <span className="opacity-70 italic block mb-1 font-medium">Proper: {lesson?.dialectPhrase}</span>
                      <span className="inline-block px-2 py-1 bg-white/50 rounded-md border border-[#ff4b4b]/20 text-[#ff4b4b] mt-1">{lesson?.explanation}</span>
                    </div>
                  )}
                  {isCorrect && (
                    <p className="text-[11px] font-bold opacity-70 italic">Keep it up!</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  if (isLessonFlow) {
                    // Advance to next topic in lesson phase
                    const nextIndex = lessonTopicIndex + 1;
                    if (nextIndex < lessonTopicQueue.length) {
                      setLessonTopicIndex(nextIndex);
                      setLessonPhase('lesson');
                      fetchProceduralContent(lessonTopicQueue[nextIndex]);
                    } else {
                      // Loop back to first topic with fresh content
                      setLessonTopicIndex(0);
                      setLessonPhase('lesson');
                      fetchProceduralContent(lessonTopicQueue[0]);
                    }
                  } else {
                    fetchProceduralContent(isQuiz ? 'quiz' : 'random');
                  }
                }}
                className="w-full lg:w-auto py-4 px-12 rounded-[20px] bg-pal-tan text-pal-cafenoir border-2 border-pal-cafenoir font-black uppercase tracking-[0.2em] text-xs shadow-xl active:translate-y-1 active:shadow-none transition-all"
                style={{ borderBottomWidth: '4px' }}
              >
                {isLessonFlow ? 'Next Lesson →' : 'Next Challenge'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  function handleCheckSkill() {
    if (!lesson) return;
    const isValid = lesson.validTranslations.some(v => v.toLowerCase() === answer.toLowerCase());
    setIsCorrect(isValid);
    setIsChecked(true);
  }
}

