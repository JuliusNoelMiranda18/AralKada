'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import Image from 'next/image';

const QUESTIONS = [
  {
    id: 1,
    q: 'How do you usually remember new information?',
    options: [
      { text: 'I see it in my head (pictures, diagrams)', icon: '👁️', style: 'Visual' },
      { text: 'I hear it repeatedly (songs, talking)', icon: '🎧', style: 'Auditory' },
      { text: 'I write it down multiple times', icon: '✍️', style: 'Reading/Writing' },
      { text: 'I do it physically (hands-on)', icon: '🛠️', style: 'Kinesthetic' },
    ],
  },
  {
    id: 2,
    q: 'What makes a lesson easy for you to follow?',
    options: [
      { text: 'Beautiful slides and clear charts', icon: '📊', style: 'Visual' },
      { text: 'Great explanations and discussions', icon: '🗣️', style: 'Auditory' },
      { text: 'Reading long texts and taking notes', icon: '📖', style: 'Reading/Writing' },
      { text: 'Doing experiments and activities', icon: '🧪', style: 'Kinesthetic' },
    ],
  },
  {
    id: 3,
    q: 'If you were lost, how would you find your way?',
    options: [
      { text: 'Look at a map or landmark photos', icon: '🗺️', style: 'Visual' },
      { text: 'Ask someone for spoken directions', icon: '🙋', style: 'Auditory' },
      { text: 'Read written street-by-street steps', icon: '📄', style: 'Reading/Writing' },
      { text: 'Walk around until it feels familiar', icon: '🚶', style: 'Kinesthetic' },
    ],
  },
  {
    id: 4,
    q: 'How do you prefer to spend your free time?',
    options: [
      { text: 'Watching movies or scrolling art', icon: '🎬', style: 'Visual' },
      { text: 'Listening to music or stories', icon: '🎵', style: 'Auditory' },
      { text: 'Reading books or journaling', icon: '📚', style: 'Reading/Writing' },
      { text: 'Playing sports or fixing things', icon: '🏀', style: 'Kinesthetic' },
    ],
  },
  {
    id: 5,
    q: 'When solving a tough problem, you...',
    options: [
      { text: 'Sketch it out on paper', icon: '✏️', style: 'Visual' },
      { text: 'Talk it through with a friend', icon: '👥', style: 'Auditory' },
      { text: 'Research and read more about it', icon: '🔍', style: 'Reading/Writing' },
      { text: 'Try different solutions in practice', icon: '⚡', style: 'Kinesthetic' },
    ],
  },
];

const STYLE_INFO: Record<string, { emoji: string; title: string; desc: string }> = {
  Visual: { emoji: '👁️', title: 'Visual Learner', desc: 'You learn best through images, diagrams, and seeing the big picture!' },
  Auditory: { emoji: '🎧', title: 'Auditory Learner', desc: 'You learn best by listening, discussing, and hearing ideas out loud!' },
  'Reading/Writing': { emoji: '📖', title: 'Read/Write Learner', desc: 'You learn best through reading texts and taking detailed notes!' },
  Kinesthetic: { emoji: '🤸', title: 'Kinesthetic Learner', desc: 'You learn best by doing, moving, and hands-on practice!' },
};

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0 = Intro, 1-5 = Questions, 6 = Result
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [finalStyle, setFinalStyle] = useState<string | null>(null);

  const progress = (step / (QUESTIONS.length + 1)) * 100;

  useEffect(() => {
    // Reset any previous style if they started onboarding again
    localStorage.removeItem('aralkada-learning-style');
  }, []);

  const handleNext = () => {
    if (step === 0) {
      setStep(1);
    } else if (step <= QUESTIONS.length) {
      if (selectedOption) {
        const newAnswers = [...answers, selectedOption];
        setAnswers(newAnswers);
        setSelectedOption(null);
        if (step === QUESTIONS.length) {
          calculateResult(newAnswers);
          setStep(step + 1);
        } else {
          setStep(step + 1);
        }
      }
    } else {
      router.push('/study-buddy');
    }
  };

  const calculateResult = (allAnswers: string[]) => {
    const counts: Record<string, number> = { Visual: 0, Auditory: 0, 'Reading/Writing': 0, Kinesthetic: 0 };
    allAnswers.forEach(s => { if (counts[s] !== undefined) counts[s]++; });
    const winner = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    setFinalStyle(winner);
    localStorage.setItem('aralkada-learning-style', winner);
  };

  const skipOnboarding = () => {
    router.push('/study-buddy');
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden" style={{ background: 'var(--pal-bone)', fontFamily: 'var(--font-nunito), Nunito, sans-serif' }}>
      <header className="fixed top-0 left-0 right-0 h-16 px-6 flex items-center gap-4 z-50" style={{ background: 'var(--pal-paper)', borderBottom: '2px solid var(--pal-cafenoir)' }}>
        <button
          onClick={skipOnboarding}
          className="p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors"
          style={{ color: 'var(--pal-cafenoir)' }}
        >
          <X size={28} />
        </button>
        <div className="flex-1 h-3 rounded-full overflow-hidden mx-2" style={{ background: 'var(--pal-tan)', border: '1px solid var(--pal-cafenoir)' }}>
          <motion.div
            className="h-full"
            style={{ background: 'var(--duo-green)' }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center pt-24 pb-32 px-6 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
              className="flex flex-col items-center text-center gap-8 w-full"
            >
              <div className="flex items-center gap-6 mt-8">
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                  <Image src="/mascot.png" alt="Aralkada" width={110} height={110} style={{ mixBlendMode: 'multiply' }} />
                </motion.div>
                <div
                  className="relative rounded-3xl p-5 text-left shadow-sm max-w-sm"
                  style={{ background: 'var(--pal-paper)', border: '3px solid var(--pal-cafenoir)', borderBottom: '6px solid var(--pal-cafenoir)' }}
                >
                  <p className="font-bold text-lg" style={{ color: 'var(--pal-cafenoir)' }}>Hi there! I&apos;m Aralkada. Let&apos;s find out how you learn best!</p>
                  <div
                    className="absolute top-1/2 -left-2.5 -translate-y-1/2 w-4 h-4 rotate-45"
                    style={{ background: 'var(--pal-paper)', borderBottom: '3px solid var(--pal-cafenoir)', borderLeft: '3px solid var(--pal-cafenoir)' }}
                  />
                </div>
              </div>
              <div className="space-y-4 pt-4">
                <h1 className="text-3xl font-black" style={{ color: 'var(--pal-cafenoir)' }}>Ready to discover your learning style?</h1>
                <p className="text-lg font-bold" style={{ color: 'var(--pal-moss)' }}>This helps me personalize your study experience to save you time and effort.</p>
              </div>
            </motion.div>
          )}

          {step > 0 && step <= QUESTIONS.length && (
            <motion.div
              key={`q-${step}`}
              initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
              className="w-full space-y-8"
            >
              <div className="flex items-center gap-5 pt-4">
                <Image src="/mascot.png" alt="Mascot" width={70} height={70} style={{ mixBlendMode: 'multiply' }} />
                <h2 className="text-2xl font-black leading-tight" style={{ color: 'var(--pal-cafenoir)' }}>{QUESTIONS[step - 1].q}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {QUESTIONS[step - 1].options.map((opt) => (
                  <button
                    key={opt.text}
                    onClick={() => setSelectedOption(opt.style)}
                    className={`relative flex flex-col items-center text-center gap-4 p-8 rounded-[24px] transition-all duration-100 ${selectedOption === opt.style
                      ? ''
                      : 'hover:bg-black/5'
                      }`}
                    style={{
                      background: selectedOption === opt.style ? 'rgba(28, 176, 246, 0.08)' : 'var(--pal-paper)',
                      border: selectedOption === opt.style ? '3px solid var(--duo-blue)' : '3px solid var(--pal-cafenoir)',
                      borderBottom: selectedOption === opt.style ? '6px solid var(--duo-blue)' : '6px solid var(--pal-cafenoir)'
                    }}
                  >
                    <span className="text-5xl">{opt.icon}</span>
                    <span
                      className="font-bold text-base tracking-wide leading-tight"
                      style={{ color: selectedOption === opt.style ? 'var(--duo-blue-dark)' : 'var(--pal-cafenoir)' }}
                    >
                      {opt.text}
                    </span>
                    {selectedOption === opt.style && (
                      <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-duo-blue flex items-center justify-center border-2 border-white shadow-sm" style={{ background: 'var(--duo-blue)' }}>
                        <Check size={16} color="#fff" strokeWidth={4} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step > QUESTIONS.length && finalStyle && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center gap-8 py-4 w-full"
            >
              <div className="text-9xl mb-4">{STYLE_INFO[finalStyle].emoji}</div>
              <div className="space-y-3">
                <p className="text-sm font-black text-duo-green uppercase tracking-widest" style={{ color: 'var(--duo-green)' }}>Your Learning Style</p>
                <h2 className="text-5xl font-black" style={{ color: 'var(--pal-cafenoir)' }}>{STYLE_INFO[finalStyle].title}</h2>
              </div>
              <p className="text-xl max-w-md leading-relaxed font-bold" style={{ color: 'var(--pal-moss)' }}>{STYLE_INFO[finalStyle].desc}</p>

              <div className="flex flex-col items-center gap-5 mt-8 max-w-sm">
                <Image src="/mascot.png" alt="Mascot" width={140} height={140} style={{ mixBlendMode: 'multiply' }} />
                <div className="rounded-[24px] p-4" style={{ background: 'var(--pal-paper)', border: '3px solid var(--pal-cafenoir)', borderBottom: '6px solid var(--pal-cafenoir)' }}>
                  <p className="font-bold" style={{ color: 'var(--pal-cafenoir)' }}>Perfect! I&apos;ll adapt the app to fit your style perfectly.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 h-28 px-6 flex items-center justify-center z-50" style={{ background: 'var(--pal-paper)', borderTop: '2px solid var(--pal-cafenoir)' }}>
        <div className="max-w-2xl w-full flex justify-between items-center" style={{ background: 'transparent' }}>
          <button
            onClick={skipOnboarding}
            className="font-extrabold uppercase tracking-widest text-sm hover:opacity-75 transition-colors px-4 py-2"
            style={{ color: 'var(--pal-moss)' }}
          >
            Skip
          </button>

          <button
            onClick={handleNext}
            disabled={step > 0 && step <= QUESTIONS.length && !selectedOption}
            className="btn-duo h-12 px-12 text-sm flex items-center justify-center"
            style={{ minWidth: 160 }}
          >
            <span>{step === 0 ? 'Start Diagnostic' : step > QUESTIONS.length ? 'Start Learning' : 'Continue'}</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
