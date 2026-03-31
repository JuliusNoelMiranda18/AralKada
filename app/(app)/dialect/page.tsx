'use client';

import { motion } from 'framer-motion';
import { MapPin, Volume2, MessageSquare, Flame, Zap, Heart, Trophy, Target, Smile } from 'lucide-react';
import Link from 'next/link';

const DIALECTS = [
  { name: 'Tagalog', region: 'Metro Manila, Luzon', emoji: '🏙️' },
  { name: 'Cebuano', region: 'Visayas, Mindanao', emoji: '🌊' },
  { name: 'Ilocano', region: 'Northern Luzon', emoji: '⛰️' },
  { name: 'Hiligaynon', region: 'Western Visayas', emoji: '🌺' },
  { name: 'Bicolano', region: 'Bicol Region', emoji: '🌋' },
  { name: 'Waray', region: 'Eastern Visayas', emoji: '🎋' },
];

export default function Dialect() {
  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--pal-bone)' }}>
      {/* ── Page Header ── */}
      <div className="max-w-7xl mx-auto w-full pt-6">
        <div className="px-6 md:px-8 mb-12">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider mb-3"
            style={{ background: 'var(--pal-tan)', color: 'var(--pal-kombu)', border: '2px solid var(--pal-cafenoir)', borderBottom: '4px solid var(--pal-cafenoir)' }}
          >
            🗺️ Cultural Exchange
          </div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--pal-cafenoir)' }}>Philippine Dialects</h1>
          <p className="text-base mt-2 font-bold max-w-2xl" style={{ color: 'var(--pal-moss)' }}>
            Learn regional languages through bite-sized, procedurally generated lessons.
          </p>
        </div>

        <div className="w-full border-b-2 mb-8 mx-6 md:mx-8" style={{ borderColor: 'var(--pal-tan)' }} />

        {/* Dialect selector Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-8 px-6 md:px-8">
          {DIALECTS.map((d, i) => (
            <Link key={i} href={`/dialect/${d.name.toLowerCase()}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 100 }}
                className="relative group cursor-pointer"
              >
                <div className="relative p-6 md:p-10 rounded-2xl md:rounded-[2rem] border-2 border-pal-cafenoir bg-white flex flex-col items-center text-center gap-4 transition-all group-hover:-translate-y-1 group-active:translate-y-1 group-active:shadow-none shadow-[0_5px_0_0_var(--pal-cafenoir)] group-hover:bg-pal-bone">
                  <span className="text-5xl md:text-6xl mb-2 group-hover:scale-110 transition-transform duration-300">
                    {d.emoji}
                  </span>
                  <div>
                    <p className="font-black text-xl md:text-2xl mb-1" style={{ color: 'var(--pal-cafenoir)' }}>{d.name}</p>
                    <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]" style={{ color: 'var(--pal-moss)' }}>
                      {d.region}
                    </p>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
