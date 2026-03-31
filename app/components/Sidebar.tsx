'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  FileText,
  GraduationCap,
  Swords,
  Brain,
  Languages,
  LayoutGrid,
  Flame,
  Zap,
  Heart,
  ChevronLeft,
  CheckCircle,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const NAV = [
  { label: 'Study Buddy', href: '/study-buddy', icon: BookOpen },
  { label: 'Learning Style', href: '/learning-styles', icon: Brain },
  { label: 'Tala', href: '/tala', icon: FileText },
  { label: 'College App', href: '/college', icon: GraduationCap },
  { label: 'Mock Exam', href: '/mock-exam', icon: Swords },
  { label: 'Dialect', href: '/dialect', icon: Languages },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [learningStyle, setLearningStyle] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('aralkada-learning-style');
    if (saved) setLearningStyle(saved);

    // Listen for storage changes in case they retake the quiz
    const handleStorage = () => {
      const updated = localStorage.getItem('aralkada-learning-style');
      setLearningStyle(updated);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 242 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      className="flex-shrink-0 h-screen sticky top-0 flex flex-col overflow-hidden z-40"
      style={{ background: 'var(--pal-kombu)', borderRight: '4px solid var(--pal-cafenoir)' }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              <Image
                src="/mascot.png"
                alt="Aralkada mascot"
                width={32}
                height={32}
                style={{ filter: 'brightness(10)' }}
              />
              <span
                className="text-lg font-black tracking-tight"
                style={{ color: '#fff', fontFamily: "var(--font-nunito), 'Nunito', sans-serif" }}
              >
                ARALKADA
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-xl transition-colors"
          initial={{ background: 'rgba(255,255,255,0)', color: 'rgba(255,255,255,0.4)' }}
          whileHover={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
          animate={{ rotate: collapsed ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronLeft size={18} />
        </motion.button>
      </div>

      {/* Divider */}
      <div style={{ height: 2, background: 'var(--pal-cafenoir)', opacity: 0.3, margin: '0 16px 8px' }} />

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {NAV.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href);

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className="relative flex items-center rounded-[24px] cursor-pointer"
                style={{
                  padding: collapsed ? '12px 0' : '12px 14px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  gap: 12,
                  background: isActive ? 'var(--pal-bone)' : 'transparent',
                  color: isActive ? 'var(--pal-cafenoir)' : 'rgba(255,255,255,0.7)',
                  fontWeight: isActive ? 900 : 700,
                  fontSize: 15,
                  borderBottom: isActive ? '4px solid var(--pal-cafenoir)' : '4px solid transparent',
                }}
                whileHover={{ background: isActive ? 'var(--pal-bone)' : 'rgba(255,255,255,0.08)' }}
                transition={{ duration: 0.15 }}
              >
                <item.icon
                  size={22}
                  style={{ color: isActive ? 'var(--pal-cafenoir)' : 'rgba(255,255,255,0.4)', flexShrink: 0 }}
                />

                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div style={{ height: 2, background: 'var(--pal-cafenoir)', opacity: 0.3, margin: '8px 16px' }} />

      {/* User + stats */}
      <div className="px-4 pb-5 flex flex-col gap-3">
        {!collapsed && (
          <div className="flex items-center justify-around">
            <div className="flex items-center gap-1.5">
              <Flame size={16} style={{ color: 'var(--duo-orange)' }} />
              <span className="text-sm font-800" style={{ color: 'var(--duo-orange)', fontWeight: 800 }}>0</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap size={16} style={{ color: 'var(--duo-gold)' }} />
              <span className="text-sm font-800" style={{ color: 'var(--duo-gold)', fontWeight: 800 }}>0 XP</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Heart size={16} style={{ color: 'var(--duo-red)' }} />
              <span className="text-sm font-800" style={{ color: 'var(--duo-red)', fontWeight: 800 }}>5</span>
            </div>
          </div>
        )}

        {/* Avatar Pod */}
        <div className="p-3 rounded-[24px] transition-all" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black flex-shrink-0"
              style={{ background: 'var(--duo-blue)', color: '#fff' }}
            >
              A
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="min-w-0"
                >
                  <p className="text-sm font-bold truncate" style={{ color: '#fff' }}>Aralkada User</p>
                  {learningStyle ? (
                    <div className="flex items-center gap-1 mt-0.5">
                      <CheckCircle size={10} style={{ color: 'var(--duo-green)' }} />
                      <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#fff' }}>{learningStyle}</p>
                    </div>
                  ) : (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Free plan</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
