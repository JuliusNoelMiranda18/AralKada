'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

/* ── Reusable scroll-reveal wrapper ── */
function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}

/* ── Alternating feature section ── */
function FeatureSection({
  heading,
  body,
  imageLeft = false,
  visual,
  delay = 0,
}: {
  heading: string;
  body: string;
  imageLeft?: boolean;
  visual: React.ReactNode;
  delay?: number;
}) {
  return (
    <section className="py-16 md:py-24 px-6 md:px-16 max-w-6xl mx-auto">
      <div
        className={`flex flex-col ${imageLeft ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 md:gap-20`}
      >
        <Reveal delay={delay} className="flex-1">
          <h2 className="land-heading mb-5">{heading}</h2>
          <p className="land-body max-w-md">{body}</p>
        </Reveal>
        <Reveal delay={delay + 0.1} className="flex-1 flex justify-center">
          {visual}
        </Reveal>
      </div>
    </section>
  );
}

/* ── SVG illustrations (inline, no external images) ── */

function StudyIllustration() {
  return (
    <Image
      src="/mascotStudy.png"
      alt="studying mascot"
      width={320}
      height={280}
      style={{ mixBlendMode: 'multiply' }}
    />
  );
}

function ScienceIllustration() {
  return (
    <Image
      src="/mascotScience.png"
      alt="Mascot with a lab coat"
      width={320}
      height={280}
      style={{ mixBlendMode: 'multiply' }}
    />
  );
}

function MotivationIllustration() {
  return (
    <Image
      src="/mascotSuccess.png"
      alt="Mascot on podium"
      width={320}
      height={280}
      style={{ mixBlendMode: 'multiply' }}
    />
  );
}

function PersonalizedIllustration() {
  return (
    <svg viewBox="0 0 320 280" width="320" height="280" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Phone frame */}
      <rect x="90" y="40" width="140" height="210" rx="20" fill="#1A1A1A" />
      <rect x="98" y="55" width="124" height="180" rx="12" fill="#131F24" />
      {/* Screen content */}
      <rect x="108" y="65" width="104" height="14" rx="4" fill="#2B2B2B" />
      {/* Cards on screen */}
      <rect x="108" y="88" width="46" height="46" rx="10" fill="#58CC02" />
      <text x="120" y="118" fontSize="20">📚</text>
      <rect x="162" y="88" width="46" height="46" rx="10" fill="#1CB0F6" />
      <text x="174" y="118" fontSize="20">📝</text>
      <rect x="108" y="142" width="46" height="46" rx="10" fill="#FFD900" />
      <text x="120" y="172" fontSize="20">🎓</text>
      <rect x="162" y="142" width="46" height="46" rx="10" fill="#CE82FF" />
      <text x="174" y="172" fontSize="20">🧠</text>
      {/* Progress bar on screen */}
      <rect x="108" y="200" width="100" height="8" rx="4" fill="#2B2B2B" />
      <rect x="108" y="200" width="65" height="8" rx="4" fill="#58CC02" />
      {/* Floating badge */}
      <rect x="190" y="30" width="60" height="26" rx="12" fill="#FFD900" />
      <text x="197" y="48" fontSize="14" fontWeight="bold" fill="#000">#1 🇵🇭</text>
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--pal-bone)', color: 'var(--pal-cafenoir)' }}>

      {/* ══════════ NAV ══════════ */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12"
        style={{ background: 'var(--pal-bone)', borderBottom: '2px solid var(--pal-cafenoir)', height: 64 }}
      >
        {/* Wordmark */}
        <div className="flex items-center gap-2">
          <Image
            src="/mascot.png"
            alt="Aralkada"
            width={36}
            height={36}
            style={{ mixBlendMode: 'multiply' }}
          />
          <span
            className="text-xl font-black tracking-tight"
            style={{ color: 'var(--pal-cafenoir)' }}
          >
            aralkada
          </span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <Link href="/onboarding" className="btn-duo" style={{ height: 40, fontSize: 13 }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* ══════════ HERO ══════════ */}
      <section className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 px-6 md:px-20 py-16 md:py-24 max-w-6xl mx-auto w-full">
        {/* Mascot float left */}
        <motion.div
          className="flex-shrink-0"
          animate={{ y: [0, -18, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Image
            src="/mascot.png"
            alt="Aralkada mascot"
            width={280}
            height={280}
            priority
            style={{ mixBlendMode: 'multiply', objectFit: 'contain', filter: 'drop-shadow(0 20px 40px rgba(88,204,2,0.2))' }}
          />
        </motion.div>

        {/* CTA right */}
        <motion.div
          className="flex flex-col items-center md:items-start gap-5 text-center md:text-left max-w-[460px]"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h1
            className="font-black leading-tight"
            style={{ fontSize: 'clamp(32px, 4.5vw, 52px)', color: 'var(--pal-cafenoir)', fontFamily: "var(--font-nunito)" }}
          >
            The free, fun, and effective way to <span style={{ color: 'var(--pal-moss)' }}>study</span>!
          </h1>
          <p className="text-lg font-bold" style={{ color: 'var(--pal-moss)', lineHeight: 1.6 }}>
            AI-powered lessons, smart notes, mock exams, and a college tracker — built for every Filipino student.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link href="/onboarding" className="btn-duo text-base px-10">
              Get Started
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ══════════ SECTION DIVIDER ══════════ */}
      <div style={{ height: 2, background: 'var(--pal-tan)' }} />

      {/* ══════════ FEATURE SECTIONS ══════════ */}
      <FeatureSection
        heading="Learn smarter."
        body="Upload your notes, slides, or any topic — get a structured lesson, knowledge checks, flashcards, and quizzes in seconds. Aralkada&apos;s AI tutor explains everything, from basic to advanced."
        imageLeft={false}
        visual={<StudyIllustration />}
        delay={0}
      />

      <div style={{ background: '#F7F7F7' }}>
        <FeatureSection
          heading="Backed by science."
          body="Aralkada uses active recall, spaced repetition, and the Feynman technique — the most research-backed learning methods proven to double retention."
          imageLeft
          visual={<ScienceIllustration />}
          delay={0}
        />
      </div>

      <FeatureSection
        heading="Stay motivated."
        body="Earn XP, maintain streaks, and unlock achievements. Daily quests keep your study habit alive with game-like challenges designed for Filipino students."
        imageLeft={false}
        visual={<MotivationIllustration />}
        delay={0}
      />

      <div style={{ background: '#F7F7F7' }}>
        <FeatureSection
          heading="Personalized learning."
          body="Take a 10-question quiz and discover your learning style — Visual, Auditory, Reading/Writing, or Kinesthetic. Aralkada adapts every lesson to how you learn best."
          imageLeft
          visual={<PersonalizedIllustration />}
          delay={0}
        />
      </div>

      {/* ══════════ GREEN WAVE CTA ══════════ */}
      <section className="relative overflow-hidden text-center py-20 px-6" style={{ background: 'var(--pal-bone)', borderTop: '2px solid var(--pal-cafenoir)' }}>
        {/* Paper texture overlay could go here, but keeping it simple */}
        <div className="relative z-10 flex flex-col items-center gap-6">
          <motion.div
            className="mb-2"
            animate={{ y: [0, -12, 0], rotate: [0, 3, -3, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Image
              src="/mascot.png"
              alt="Aralkada mascot"
              width={120}
              height={120}
              style={{ mixBlendMode: 'multiply', objectFit: 'contain' }}
            />
          </motion.div>

          <Reveal>
            <h2
              className="font-black"
              style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: 'var(--pal-cafenoir)' }}
            >
              Start learning today.
            </h2>
            <p className="text-lg mt-2 mb-8 font-bold" style={{ color: 'var(--pal-moss)' }}>
              No sign-up needed. Just pick a topic and go.
            </p>
            <Link href="/onboarding" className="btn-duo text-base px-12">
              Get Started
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer style={{ background: 'var(--pal-cafenoir)', color: 'var(--pal-tan)' }} className="py-12 px-6 md:px-16">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {[
            { heading: 'About us', links: ['Our Mission', 'Team', 'Approach', 'Efficacy', 'Research'] },
            { heading: 'Features', links: ['Study Buddy', 'Good Notes', 'Mock Exam', 'Dialect', 'Learning Styles'] },
            { heading: 'College Prep', links: ['UPCAT Guide', 'Scholarships', 'Commuter Guide', 'Calendar'] },
            { heading: 'Support', links: ['FAQs', 'Privacy', 'Terms', 'Contact'] },
          ].map((col) => (
            <div key={col.heading}>
              <h4 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: 'var(--pal-bone)', opacity: 0.6 }}>
                {col.heading}
              </h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l}>
                    <span className="text-sm font-bold" style={{ color: 'var(--pal-bone)', opacity: 0.8, cursor: 'pointer' }}>
                      {l}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div
          className="max-w-6xl mx-auto pt-8 flex flex-col md:flex-row items-center justify-between gap-3 text-xs"
          style={{ borderTop: '1px solid var(--pal-moss)', color: 'var(--pal-tan)' }}
        >
          <span>© 2026 Aralkada — TaftOverFlow++ | UP Manila BS Computer Science</span>
          <span>SDG 4: Quality Education · Overtake 2026</span>
        </div>
      </footer>
    </div>
  );
}
