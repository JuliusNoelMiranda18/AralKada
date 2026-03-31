'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { StudyProvider } from '../context/StudyContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <StudyProvider>
      <div
        className="flex min-h-screen"
        style={{ background: 'var(--pal-bone)' }}
      >
        <Sidebar />

        <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </StudyProvider>
  );
}
