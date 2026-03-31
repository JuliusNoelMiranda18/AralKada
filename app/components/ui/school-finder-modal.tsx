'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, MapPin, CheckCircle, GraduationCap, Banknote } from 'lucide-react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

const MapPicker = dynamic(() => import('./map-picker').then(mod => mod.default), { 
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center font-bold text-sm text-gray-500">Loading map...</div>
});

const SPECIALIZATIONS = [
  'Engineering', 'Medicine', 'Business', 'Architecture', 'Information Technology', 
  'Nursing', 'Law', 'Accountancy', 'Education', 'Agriculture', 'Science',
  'Fine Arts', 'Psychology', 'Communication', 'Hospitality', 'Maritime', 'Aviation'
];

interface SchoolFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (specializations: string[], hasLocationFilter: boolean) => void;
}

export function SchoolFinderModal({ isOpen, onClose, onApplyFilters }: SchoolFinderModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);
  const [budgetTier, setBudgetTier] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setStep(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleSpec = (spec: string) => {
    if (selectedSpecs.includes(spec)) {
      setSelectedSpecs(selectedSpecs.filter(s => s !== spec));
    } else {
      setSelectedSpecs([...selectedSpecs, spec]);
    }
  };

  const handleApply = () => {
    onApplyFilters(selectedSpecs, mapPosition !== null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div 
        className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative flex flex-col"
        style={{ 
          background: 'var(--pal-bone)', 
          border: '2px solid var(--pal-cafenoir)', 
          borderBottom: '6px solid var(--pal-cafenoir)',
          maxHeight: '85vh'
        }}
      >
        <div className="flex items-center justify-between p-4 border-b-2" style={{ borderColor: 'var(--pal-cafenoir)' }}>
          <h3 className="font-black text-xl flex items-center gap-2" style={{ color: 'var(--pal-cafenoir)' }}>
            <Search size={22} />
            Find Me a School
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full transition-colors hover:bg-black/5"
          >
            <X size={24} style={{ color: 'var(--pal-cafenoir)' }} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto hide-scrollbar flex-1">
          
          {/* Progress Indicator */}
          <div className="flex justify-center mb-8 gap-2">
            <div className="flex-1 h-3 rounded-full transition-colors" style={{ background: step >= 1 ? 'var(--pal-moss)' : 'var(--pal-tan)', border: '1px solid var(--pal-cafenoir)' }} />
            <div className="flex-1 h-3 rounded-full transition-colors" style={{ background: step >= 2 ? 'var(--pal-moss)' : 'var(--pal-tan)', border: '1px solid var(--pal-cafenoir)' }} />
            <div className="flex-1 h-3 rounded-full transition-colors" style={{ background: step >= 3 ? 'var(--pal-moss)' : 'var(--pal-tan)', border: '1px solid var(--pal-cafenoir)' }} />
          </div>

          {step === 1 ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h4 className="font-black text-2xl mb-2" style={{ color: 'var(--pal-cafenoir)' }}>Step 1: Choose Your Field</h4>
              <p className="font-bold text-sm mb-6" style={{ color: 'var(--pal-kombu)' }}>
                Select the degree programs or fields you are interested in. We'll find schools that specialize in these.
              </p>
              
              <div className="flex flex-wrap gap-3">
                {SPECIALIZATIONS.map(spec => {
                  const isSelected = selectedSpecs.includes(spec);
                  return (
                    <button
                      key={spec}
                      onClick={() => toggleSpec(spec)}
                      className="px-4 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider transition-transform active:translate-y-0 active:border-b-[2px] flex items-center gap-2"
                      style={{ 
                        background: isSelected ? 'var(--duo-green)' : 'var(--pal-tan)',
                        color: isSelected ? '#fff' : 'var(--pal-cafenoir)',
                        border: `2px solid ${isSelected ? 'var(--duo-green-dark)' : 'var(--pal-cafenoir)'}`,
                        borderBottom: `4px solid ${isSelected ? 'var(--duo-green-dark)' : 'var(--pal-cafenoir)'}`,
                        transform: isSelected ? 'translateY(-2px)' : 'none'
                      }}
                    >
                      {isSelected ? <CheckCircle size={16} /> : <GraduationCap size={16} />}
                      {spec}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : step === 2 ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col h-full">
              <h4 className="font-black text-2xl mb-2" style={{ color: 'var(--pal-cafenoir)' }}>Step 2: Set Location</h4>
              <p className="font-bold text-sm mb-4" style={{ color: 'var(--pal-kombu)' }}>
                Click on the map to drop a pin. We'll prioritize universities near this location.
              </p>
              
              <div 
                className="w-full h-64 rounded-xl overflow-hidden relative z-0" 
                style={{ border: '2px solid var(--pal-cafenoir)' }}
              >
                <MapPicker position={mapPosition} setPosition={setMapPosition} />
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h4 className="font-black text-2xl mb-2" style={{ color: 'var(--pal-cafenoir)' }}>Step 3: Financial Capabilities</h4>
              <p className="font-bold text-sm mb-6" style={{ color: 'var(--pal-kombu)' }}>
                Select your expected tuition budget per semester to help us narrow down practical choices.
              </p>

              <div className="flex flex-col gap-3">
                {[
                  { id: 'public', label: 'Public & State (Free / Minimal Tuition)' },
                  { id: 'low', label: 'Below ₱40,000 / semester' },
                  { id: 'mid', label: '₱40,000 - ₱90,000 / semester' },
                  { id: 'high', label: 'Above ₱90,000 / semester' }
                ].map(opt => {
                  const isSelected = budgetTier === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setBudgetTier(opt.id)}
                      className="w-full text-left p-4 rounded-xl text-base font-black transition-transform active:translate-y-0 active:border-b-[2px] flex items-center gap-3"
                      style={{ 
                        background: isSelected ? 'var(--duo-blue)' : 'var(--pal-tan)',
                        color: isSelected ? '#fff' : 'var(--pal-cafenoir)',
                        border: `2px solid ${isSelected ? 'var(--duo-blue-dark)' : 'var(--pal-cafenoir)'}`,
                        borderBottom: `4px solid ${isSelected ? 'var(--duo-blue-dark)' : 'var(--pal-cafenoir)'}`,
                        transform: isSelected ? 'translateY(-2px)' : 'none'
                      }}
                    >
                      <Banknote size={20} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t-2 flex justify-between gap-3" style={{ borderColor: 'var(--pal-cafenoir)', background: 'var(--pal-tan)' }}>
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1 as 1 | 2)}
              className="px-6 py-3 rounded-xl font-black uppercase tracking-wider transition-transform hover:-translate-y-0.5 active:translate-y-0 active:border-b-[2px]"
              style={{ background: 'var(--pal-bone)', color: 'var(--pal-cafenoir)', border: '2px solid var(--pal-cafenoir)', borderBottom: '4px solid var(--pal-cafenoir)' }}
            >
              Back
            </button>
          )}
          <div className="flex-1" />
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1 as 2 | 3)}
              disabled={step === 1 && selectedSpecs.length === 0}
              className={`px-8 py-3 rounded-xl font-black uppercase tracking-wider transition-transform ${(step === 1 && selectedSpecs.length === 0) ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5 active:translate-y-0 active:border-b-[2px]'}`}
              style={{ background: 'var(--duo-blue)', color: '#fff', border: `2px solid var(--pal-cafenoir)`, borderBottom: '5px solid var(--pal-cafenoir)' }}
            >
              Next Step
            </button>
          ) : (
            <button
              onClick={handleApply}
              disabled={!budgetTier}
              className={`px-8 py-3 rounded-xl font-black uppercase tracking-wider transition-transform ${!budgetTier ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5 active:translate-y-0 active:border-b-[2px]'} flex items-center gap-2`}
              style={{ background: 'var(--duo-gold)', color: 'var(--pal-cafenoir)', border: `2px solid var(--pal-cafenoir)`, borderBottom: '5px solid var(--pal-cafenoir)' }}
            >
              <MapPin size={18} />
              Find Schools
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
