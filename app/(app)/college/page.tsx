'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Search, ExternalLink, Megaphone, MapPin, GraduationCap } from 'lucide-react';
import { UniversityScrollFeed } from '@/app/components/ui/university-scroll';
import CalendarDashboard from '@/app/components/ui/calendar-dashboard';
import { CommuterGuide } from '@/app/components/ui/commuter-guide';
import { ScholarshipFeed } from '@/app/components/ui/scholarship-feed';

const EXAMS = [
  {
    name: 'UPCAT',
    school: 'University of the Philippines',
    date: 'Aug 10–11, 2026',
    deadline: 'Jun 1, 2026',
    results: 'Dec 2026',
    open: true,
  },
  {
    name: 'ACET',
    school: 'Ateneo de Manila University',
    date: 'Sep 2026',
    deadline: 'Aug 15, 2026',
    results: 'Nov 2026',
    open: false,
  },
  {
    name: 'DLSU-CET',
    school: 'De La Salle University',
    date: 'Oct 2026',
    deadline: 'Sep 15, 2026',
    results: 'Dec 2026',
    open: false,
  },
  {
    name: 'USTET',
    school: 'University of Santo Tomas',
    date: 'Oct 2026',
    deadline: 'Sep 30, 2026',
    results: 'Nov 2026',
    open: false,
  },
  {
    name: 'PUPCET',
    school: 'Polytechnic University of the Philippines',
    date: 'Nov 2026',
    deadline: 'Oct 1, 2026',
    results: 'Jan 2027',
    open: false,
  },
];

type TabId = 'universities' | 'calendar' | 'commuter' | 'scholarships';

export default function College() {
  const [activeTab, setActiveTab] = useState<TabId>('universities');

  const tabs = [
    { id: 'universities', label: 'Top Universities' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'commuter', label: 'Commuters Guide' },
    { id: 'scholarships', label: 'Scholarship Finder' }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center pb-6" style={{ background: 'var(--pal-bone)' }}>

      {/* ── Page Header & Tabs ── */}
      <div className="max-w-7xl mx-auto w-full sticky top-0 z-50 pt-6" style={{ background: 'var(--pal-bone)' }}>
        <div className="px-6 md:px-8 mb-6">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider mb-3"
            style={{ background: 'var(--pal-tan)', color: 'var(--pal-kombu)', border: '2px solid var(--pal-cafenoir)', borderBottom: '4px solid var(--pal-cafenoir)' }}
          >
            🎓 College Prep Hub
          </div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--pal-cafenoir)' }}>College Application</h1>
          <p className="text-base mt-2 font-bold max-w-2xl" style={{ color: 'var(--pal-moss)' }}>
            Explore Philippine universities — entrance exams, deadlines, requirements, and more.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex px-6 md:px-8 gap-6 border-b-2 overflow-x-auto hide-scrollbar" style={{ borderColor: 'var(--pal-tan)' }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`pb-3 text-sm font-black uppercase tracking-wider transition-colors whitespace-nowrap`}
                style={{
                  color: isActive ? 'var(--duo-blue)' : 'var(--pal-moss)',
                  borderBottom: isActive ? '4px solid var(--duo-blue)' : '4px solid transparent',
                  marginBottom: '-2px' // Overlap the container border
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab Content Container ── */}
      <div className="pt-6 pb-2 w-full">

        {/* TAB: UNIVERSITIES */}
        {activeTab === 'universities' && (
          <section className="animate-in fade-in slide-in-from-bottom-2 duration-300 w-full overflow-hidden flex flex-col justify-center pb-12" style={{ minHeight: 'calc(100vh - 220px)' }}>
            <UniversityScrollFeed />
          </section>
        )}

        {/* TAB: CALENDAR & CHECKLIST */}
        {activeTab === 'calendar' && (
          <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CalendarDashboard />
          </section>
        )}

        {/* TAB: COMMUTERS GUIDE */}
        {activeTab === 'commuter' && (
          <section className="animate-in fade-in slide-in-from-bottom-2 duration-300 w-full">
            <CommuterGuide />
          </section>
        )}

        {/* TAB: SCHOLARSHIP FINDER */}
        {activeTab === 'scholarships' && (
          <section className="animate-in fade-in slide-in-from-bottom-2 duration-300 w-full overflow-hidden">
            <ScholarshipFeed />
          </section>
        )}

      </div>
    </div>
  );
}
