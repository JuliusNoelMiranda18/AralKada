'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface LessonNodeProps {
  icon: string;
  label: string;
  state: 'completed' | 'current' | 'locked';
  onClick?: () => void;
  mascotSide?: 'left' | 'right';
  showMascot?: boolean;
}

const STATE_STYLES = {
  completed: {
    bg: 'var(--duo-green)',
    border: 'var(--duo-green-dark)',
    iconColor: '#fff',
    ringColor: 'var(--duo-green-dark)',
  },
  current: {
    bg: 'var(--duo-green)',
    border: 'var(--duo-green-dark)',
    iconColor: '#fff',
    ringColor: '#fff',
  },
  locked: {
    bg: 'var(--dark-surface)',
    border: 'var(--dark-border)',
    iconColor: 'var(--text-muted)',
    ringColor: 'transparent',
  },
};

export default function LessonNode({
  icon,
  label,
  state,
  onClick,
  mascotSide = 'right',
  showMascot = false,
}: LessonNodeProps) {
  const styles = STATE_STYLES[state];

  return (
    <div className="flex flex-col items-center relative" style={{ userSelect: 'none' }}>
      {/* Mascot beside current node */}
      <AnimatePresence>
        {showMascot && state === 'current' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.4, y: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }}
            className="absolute"
            style={{
              [mascotSide === 'right' ? 'left' : 'right']: '88px',
              top: -8,
              zIndex: 10,
            }}
          >
            {/* Speech bubble */}
            <div
              className="relative mb-1 px-3 py-1.5 rounded-xl text-xs font-black"
              style={{
                background: '#fff',
                color: 'var(--dark-bg)',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              START
              {/* Triangle */}
              <div
                style={{
                  position: 'absolute',
                  bottom: -6,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0, height: 0,
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderTop: '6px solid #fff',
                }}
              />
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/mascot.png"
              alt="Aralkada"
              width={64}
              height={64}
              style={{ mixBlendMode: 'multiply', objectFit: 'contain' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Node ring */}
      <motion.button
        onClick={onClick}
        disabled={state === 'locked'}
        className="relative flex items-center justify-center rounded-full cursor-pointer"
        style={{
          width: 72, height: 72,
          background: styles.bg,
          border: '4px solid',
          borderColor: styles.border,
          boxShadow: state === 'current'
            ? `0 0 0 5px var(--dark-border), 0 0 0 8px var(--duo-green)`
            : `0 4px 0 ${styles.border}`,
        }}
        whileHover={state !== 'locked' ? { scale: 1.06 } : undefined}
        whileTap={state !== 'locked' ? { scale: 0.95 } : undefined}
        animate={state === 'current' ? { scale: [1, 1.06, 1] } : {}}
        transition={state === 'current' ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } : {}}
      >
        <span className="text-2xl">{icon}</span>
      </motion.button>

      {/* Label */}
      <span
        className="mt-2 text-xs font-800 text-center max-w-[80px]"
        style={{
          color: state === 'locked' ? 'var(--text-muted)' : '#fff',
          fontWeight: 800,
          lineHeight: 1.3,
        }}
      >
        {label}
      </span>
    </div>
  );
}
