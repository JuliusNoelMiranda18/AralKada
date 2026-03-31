'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Clock, CreditCard, Shield, Zap, Info, Bus, Train, Footprints, ChevronRight, AlertCircle, Bookmark } from 'lucide-react';
import { UNIVERSITIES, University } from './university-data';

// Dynamically import map
const CommuterMap = dynamic(() => import('./commuter-map'), { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl font-bold text-gray-400">Loading Map...</div> });

interface TransitStep {
  type: string;
  instruction: string;
  lineName: string;
  duration: string;
  cost: string;
}

interface RouteResult {
  totalTime: string;
  totalCost: string;
  optimizationNote: string;
  steps: TransitStep[];
}

export function CommuterGuide() {
  const [origin, setOrigin] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [optimization, setOptimization] = useState<'Price' | 'Safety'>('Price');

  const [bookmarkedUnis, setBookmarkedUnis] = useState<University[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [error, setError] = useState('');
  const [dropOpen, setDropOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('university_bookmarks');
    if (saved) {
      try {
        const ids = JSON.parse(saved);
        const unis = UNIVERSITIES.filter(u => ids.includes(u.shortName));
        setBookmarkedUnis(unis);
        if (unis.length > 0) {
          setDestinationId(unis[0].shortName);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleLocationSelect = (loc: { lat: number; lng: number; address: string }) => {
    setOrigin(loc.address);
  };

  const handleFindRoute = async () => {
    if (!origin) return setError('Please provide an origin location.');
    if (!destinationId) return setError('Please select a destination university.');

    setError('');
    setIsLoading(true);
    setRouteResult(null);

    const uni = bookmarkedUnis.find(u => u.shortName === destinationId);
    const destString = uni ? `${uni.name}, ${uni.location}` : destinationId;

    try {
      const res = await fetch('/api/commute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ origin, destination: destString, optimization })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch route');
      setRouteResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStepIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('walk')) return <Footprints size={20} />;
    if (t.includes('lrt') || t.includes('mrt') || t.includes('train')) return <Train size={20} />;
    if (t.includes('bus') || t.includes('jeep')) return <Bus size={20} />;
    return <Navigation size={20} />;
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-6 px-6 pb-6 h-[calc(100vh-240px)] min-h-[400px] overflow-hidden">

      {/* ── Left Box: Origin ── */}
      <div
        className="w-full md:w-1/2 rounded-[32px] p-6 flex flex-col gap-4 border-2 border-b-8 h-full"
        style={{ background: 'var(--pal-bone)', borderColor: 'var(--pal-cafenoir)' }}
      >
        {/* Header Block inside Left Box */}
        <div className="rounded-[24px] p-4 relative overflow-hidden" style={{ background: 'var(--pal-tan)', border: '2px solid var(--pal-cafenoir)' }}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -mt-6 -mr-6 blur-xl pointer-events-none" />
          <h2 className="text-xl font-black" style={{ color: 'var(--pal-cafenoir)' }}>Commuter Guide</h2>
          <p className="text-xs font-bold" style={{ color: 'var(--pal-moss)' }}>Find the best way to campus via public transit.</p>
        </div>

        <div className="space-y-1 relative">
          <label className="text-[11px] font-black uppercase tracking-wider pl-1" style={{ color: 'var(--pal-cafenoir)' }}>
            1. Where are you starting?
          </label>
          <div className="flex bg-white rounded-[24px] items-center px-4 py-2.5 border-2" style={{ borderColor: 'var(--pal-cafenoir)' }}>
            <MapPin size={16} style={{ color: 'var(--pal-moss)' }} className="mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search origin or pin on map..."
              className="w-full bg-transparent outline-none text-sm font-bold"
              style={{ color: 'var(--pal-cafenoir)' }}
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
            />
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 min-h-0 w-full rounded-[24px] border-2 overflow-hidden mt-1 relative bg-white" style={{ borderColor: 'var(--pal-cafenoir)' }}>
          <CommuterMap onLocationSelect={handleLocationSelect} />
        </div>
      </div>

      {/* ── Right Box: Destination & Results ── */}
      <div
        className="w-full md:w-1/2 rounded-[32px] p-6 flex flex-col gap-4 border-2 border-b-8 h-full"
        style={{ background: 'var(--pal-bone)', borderColor: 'var(--pal-cafenoir)' }}
      >
        <div className="flex gap-4 items-start shrink-0">
          {/* Destination */}
          <div className="space-y-1 flex-1">
            <label className="text-[11px] font-black uppercase tracking-wider pl-1" style={{ color: 'var(--pal-cafenoir)' }}>
              2. Choose Destination
            </label>
            <div className="relative z-50">
              <button
                onClick={() => setDropOpen(!dropOpen)}
                className="w-full flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border-2 text-sm outline-none transition-colors"
                style={{
                  borderColor: 'var(--pal-cafenoir)',
                  borderBottom: dropOpen ? '2px solid var(--pal-cafenoir)' : '4px solid var(--pal-cafenoir)',
                  transform: dropOpen ? 'translateY(2px)' : 'none'
                }}
              >
                <div className="flex items-center gap-2 truncate">
                  <Bookmark size={14} style={{ color: 'var(--duo-blue)' }} className="shrink-0" />
                  <span className="font-black truncate" style={{ color: 'var(--pal-cafenoir)' }}>
                    {bookmarkedUnis.length === 0 ? 'No bookmarked schools...' : (
                      bookmarkedUnis.find(u => u.shortName === destinationId)?.shortName || 'Select a destination'
                    )}
                  </span>
                </div>
                <ChevronRight className={`shrink-0 transition-transform ${dropOpen ? '-rotate-90' : 'rotate-90'}`} size={16} style={{ color: 'var(--pal-moss)' }} />
              </button>

              <AnimatePresence>
                {dropOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border-2 overflow-hidden shadow-2xl z-50 flex flex-col max-h-48 overflow-y-auto"
                    style={{ borderColor: 'var(--pal-cafenoir)' }}
                  >
                    {bookmarkedUnis.map(u => (
                      <button
                        key={u.shortName}
                        onClick={() => { setDestinationId(u.shortName); setDropOpen(false); }}
                        className="w-full text-left px-4 py-3 border-b border-black/5 hover:bg-black/5 flex flex-col gap-0.5"
                      >
                        <span className="font-black text-sm" style={{ color: 'var(--pal-cafenoir)' }}>{u.shortName}</span>
                        <span className="text-[10px] font-bold opacity-70" style={{ color: 'var(--pal-moss)' }}>{u.location}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {bookmarkedUnis.length === 0 && (
              <p className="text-[10px] font-bold text-rose-500 pl-1 flex items-center mt-1">
                <Bookmark size={10} className="mr-1" /> Bookmark a university first.
              </p>
            )}
          </div>

          {/* Optimization Toggle */}
          <div className="space-y-1 w-[160px] shrink-0">
            <label className="text-[11px] font-black uppercase tracking-wider pl-1" style={{ color: 'var(--pal-cafenoir)' }}>
              3. Optimize
            </label>
            <div className="flex bg-white rounded-[24px] border-2 overflow-hidden" style={{ borderColor: 'var(--pal-cafenoir)' }}>
              <button
                onClick={() => setOptimization('Price')}
                className="flex-1 py-2 flex justify-center text-[10px] font-black uppercase tracking-wider transition-colors"
                style={{
                  background: optimization === 'Price' ? 'var(--pal-cafenoir)' : 'transparent',
                  color: optimization === 'Price' ? 'white' : 'var(--pal-cafenoir)',
                }}
              >
                Price
              </button>
              <button
                onClick={() => setOptimization('Safety')}
                className="flex-1 py-2 flex justify-center text-[10px] font-black uppercase tracking-wider transition-colors border-l-2 border-[#332211]"
                style={{
                  background: optimization === 'Safety' ? 'var(--pal-cafenoir)' : 'transparent',
                  color: optimization === 'Safety' ? 'white' : 'var(--pal-cafenoir)',
                }}
              >
                Safety
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleFindRoute}
          disabled={isLoading || bookmarkedUnis.length === 0}
          className="w-full shrink-0 py-4 rounded-[24px] font-black text-sm uppercase tracking-wider transition-transform active:translate-y-0.5 disabled:opacity-50"
          style={{ background: 'var(--duo-blue)', color: 'white', border: '2px solid var(--pal-cafenoir)', borderBottom: '4px solid var(--pal-cafenoir)' }}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Calculating...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Zap size={16} fill="white" /> Generate Route
            </span>
          )}
        </button>

        {error && (
          <div className="bg-rose-100 text-rose-800 shrink-0 text-xs font-bold p-2.5 rounded-xl border-2 border-rose-300 flex items-center gap-2">
            <AlertCircle size={14} className="flex-shrink-0" /> {error}
          </div>
        )}

        {/* Results Container (Scrollable) */}
        <div className="flex-1 min-h-0 bg-white rounded-[32px] border-2 relative overflow-hidden flex flex-col" style={{ borderColor: 'var(--pal-cafenoir)' }}>
          <AnimatePresence mode="wait">
            {!routeResult && !isLoading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-white"
              >
                <Navigation size={48} style={{ color: 'var(--pal-tan)' }} className="mb-3" />
                <h3 className="text-lg font-black" style={{ color: 'var(--pal-moss)' }}>Ready to find your way?</h3>
                <p className="text-xs font-bold mt-2" style={{ color: 'var(--pal-kombu)' }}>Map your route on the left and hit generate!</p>
              </motion.div>
            )}

            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-white"
              >
                <div className="w-12 h-12 relative mb-3">
                  <div className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: 'var(--duo-blue)', borderTopColor: 'transparent' }} />
                  <MapPin className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--duo-blue)' }} />
                </div>
                <h3 className="text-[15px] font-black animate-pulse" style={{ color: 'var(--pal-cafenoir)' }}>Plotting optimal route...</h3>
                <p className="text-xs font-bold mt-1 opacity-70" style={{ color: 'var(--pal-moss)' }}>Checking jeepney routes & trains</p>
              </motion.div>
            )}

            {routeResult && !isLoading && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="absolute inset-0 flex flex-col"
              >
                {/* Fixed Summary Header inside results */}
                <div className="shrink-0 p-4 border-b-2 flex justify-between bg-[var(--pal-bone)] rounded-t-[32px]" style={{ borderColor: 'var(--pal-cafenoir)' }}>
                  <div className="flex-1">
                    <p className="font-black text-sm uppercase tracking-wider" style={{ color: 'var(--pal-cafenoir)' }}>Time</p>
                    <p className="text-lg font-black flex items-center gap-1" style={{ color: 'var(--pal-kombu)' }}><Clock size={16} /> {routeResult.totalTime}</p>
                  </div>
                  <div className="flex-1 border-l-2 pl-4" style={{ borderColor: 'var(--pal-cafenoir)' }}>
                    <p className="font-black text-sm uppercase tracking-wider" style={{ color: 'var(--pal-cafenoir)' }}>Fare</p>
                    <p className="text-lg font-black flex items-center gap-1" style={{ color: 'var(--duo-green-dark)' }}><CreditCard size={16} /> {routeResult.totalCost}</p>
                  </div>
                </div>

                {/* Scrollable Steps List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                  <div className="p-3 rounded-xl flex gap-2" style={{ background: 'var(--duo-blue-light)', border: '2px solid var(--duo-blue)', color: 'var(--duo-blue-dark)' }}>
                    <Info size={16} className="shrink-0 mt-0.5" />
                    <p className="text-xs font-black">{routeResult.optimizationNote}</p>
                  </div>

                  <div className="relative pl-6 pb-2">
                    <div className="absolute top-3 bottom-0 left-[23px] w-1 -translate-x-1/2 rounded-full" style={{ background: 'var(--pal-tan)' }} />

                    <div className="space-y-6">
                      {routeResult.steps.map((step, idx) => (
                        <div key={idx} className="relative">
                          {/* Node Icon */}
                          <div className="absolute -left-9 w-6 h-6 rounded-full flex items-center justify-center z-10"
                            style={{ background: 'white', border: '2px solid var(--pal-cafenoir)', color: 'var(--pal-cafenoir)' }}>
                            <div className="scale-75">{getStepIcon(step.type)}</div>
                          </div>

                          <div className="ml-2 p-3 rounded-xl" style={{ background: 'var(--pal-bone)', border: '2px solid var(--pal-cafenoir)' }}>
                            <div className="flex gap-2 items-center justify-between mb-1.5 border-b-2 pb-1.5" style={{ borderColor: 'rgba(51, 34, 17, 0.1)' }}>
                              <span className="text-[10px] font-black uppercase tracking-wider bg-white px-1.5 py-0.5 rounded-md border" style={{ borderColor: 'var(--pal-cafenoir)', color: 'var(--pal-cafenoir)' }}>
                                {step.type}
                              </span>
                              <div className="flex gap-2 text-[10px] font-black">
                                <span className="flex items-center gap-0.5 shrink-0" style={{ color: 'var(--pal-kombu)' }}><Clock size={10} /> {step.duration}</span>
                                {step.cost && step.cost !== '₱ 0.00' && step.cost !== 'Free' && (
                                  <span className="flex items-center gap-0.5 shrink-0" style={{ color: 'var(--duo-green-dark)' }}><CreditCard size={10} /> {step.cost}</span>
                                )}
                              </div>
                            </div>

                            {step.lineName && <p className="font-black text-xs mb-0.5" style={{ color: 'var(--pal-cafenoir)' }}>{step.lineName}</p>}
                            <p className="text-xs font-bold leading-tight" style={{ color: 'var(--pal-moss)' }}>{step.instruction}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
