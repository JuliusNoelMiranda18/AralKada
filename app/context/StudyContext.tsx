'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface StudyContextType {
  studyData: any;
  setStudyData: (data: any) => void;
  activeTopic: string;
  setActiveTopic: (topic: string) => void;
  textContext: string;
  setTextContext: (text: string) => void;
  resetSession: () => void;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [studyData, setStudyData] = useState<any>(null);
  const [activeTopic, setActiveTopic] = useState<string>('');
  const [textContext, setTextContext] = useState<string>('');

  // Persist to session storage so refresh doesn't immediately kill it
  useEffect(() => {
    const saved = sessionStorage.getItem('aralkada-active-study');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStudyData(parsed.studyData);
        setActiveTopic(parsed.activeTopic);
        setTextContext(parsed.textContext);
      } catch (e) {
        console.error('Failed to load study context', e);
      }
    }
  }, []);

  useEffect(() => {
    if (activeTopic || studyData) {
      sessionStorage.setItem('aralkada-active-study', JSON.stringify({
        studyData,
        activeTopic,
        textContext
      }));
    }
  }, [studyData, activeTopic, textContext]);

  const resetSession = () => {
    setStudyData(null);
    setActiveTopic('');
    setTextContext('');
    sessionStorage.removeItem('aralkada-active-study');
  };

  return (
    <StudyContext.Provider value={{ 
      studyData, setStudyData, 
      activeTopic, setActiveTopic,
      textContext, setTextContext,
      resetSession 
    }}>
      {children}
    </StudyContext.Provider>
  );
}

export function useStudy() {
  const context = useContext(StudyContext);
  if (context === undefined) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
}
