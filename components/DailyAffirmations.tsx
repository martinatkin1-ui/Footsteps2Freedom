
import React, { useState, useEffect, useRef } from 'react';
import { getDailyAffirmation } from '../geminiService';
import ModuleReflection from './ModuleReflection';
import SocialShare from './SocialShare';
import SpeakButton from './SpeakButton';

interface DailyAffirmationsProps {
  onAwardFootsteps: (count: number) => void;
  onExit: (rating?: number) => void;
  onAskGuide?: () => void;
}

const DailyAffirmations: React.FC<DailyAffirmationsProps> = ({ onAwardFootsteps, onExit, onAskGuide }) => {
  const [affirmation, setAffirmation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [hasResonated, setHasResonated] = useState(false);
  const [showReflection, setShowReflection] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('last_affirmation');
    const savedDate = localStorage.getItem('last_affirmation_date');
    const resonateDate = localStorage.getItem('last_resonate_ai_date');
    const today = new Date().toDateString();

    if (saved && savedDate === today) {
      setAffirmation(saved);
      setHasClaimed(true);
    }

    if (resonateDate === today) {
      setHasResonated(true);
    }
  }, []);

  const fetchAffirmation = async () => {
    setIsLoading(true);
    const footsteps = 0; // Simulated
    const phase = 1;
    
    const getRankTitle = (pts: number) => {
      if (pts >= 150) return 'Wayfinder';
      if (pts >= 71) return 'Guardian';
      if (pts >= 31) return 'Resilient';
      if (pts >= 11) return 'Builder';
      return 'Seeker';
    };

    const res = await getDailyAffirmation(getRankTitle(footsteps), phase);
    setAffirmation(res);
    setIsLoading(false);
  };

  const handleClaim = () => {
    const today = new Date().toDateString();
    localStorage.setItem('last_affirmation', affirmation!);
    localStorage.setItem('last_affirmation_date', today);
    setHasClaimed(true);
    onAwardFootsteps(10);
    if ('vibrate' in navigator) navigator.vibrate(100);
  };

  const handleResonate = () => {
    if (hasResonated) return;
    const today = new Date().toDateString();
    localStorage.setItem('last_resonate_ai_date', today);
    setHasResonated(true);
    onAwardFootsteps(5);
    if ('vibrate' in navigator) navigator.vibrate(50);
  };

  if (showReflection) {
    return <ModuleReflection moduleName="Daily Beacon" context={`User claimed their daily beacon: "${affirmation}"`} onClose={onExit} />;
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-white overflow-hidden">
      {/* Immersive Background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-3xl flex flex-col items-center text-center space-y-12">
        <header className="space-y-3 animate-in fade-in duration-1000">
           <h2 className="text-amber-500 font-black uppercase tracking-[0.6em] text-[12px]">True-Self Beacon</h2>
           <div className="flex items-center justify-center gap-4 text-slate-500 font-bold text-xs uppercase tracking-widest">
             <span>UK Sanctuary Uplink</span>
             <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
             <span>Active Phase: Foundations</span>
           </div>
        </header>

        {/* Central Focus Orb */}
        <div className="relative flex items-center justify-center w-[340px] h-[340px] md:w-[450px] md:h-[450px]">
           <div className={`absolute inset-0 rounded-full border-2 border-white/5 transition-all duration-1000 ${isLoading ? 'animate-spin border-t-amber-500' : ''}`} />
           <div className={`absolute inset-4 rounded-full border border-white/10 transition-all duration-1000 delay-300 ${isLoading ? 'animate-spin-slow border-b-indigo-500' : ''}`} />
           
           <div className="relative z-20 px-8 py-12 flex flex-col items-center justify-center h-full">
             {isLoading ? (
               <div className="flex flex-col items-center gap-4">
                  <div className="text-4xl animate-bounce">⏳</div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 animate-pulse">Consulting the Guide...</p>
               </div>
             ) : affirmation ? (
               <div className="space-y-8 animate-in zoom-in-95 duration-700 relative">
                 <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                   <SpeakButton text={affirmation} size={24} className="shadow-2xl scale-125" />
                 </div>
                 <p className="text-3xl md:text-5xl font-black leading-tight italic tracking-tighter drop-shadow-2xl">
                   "{affirmation}"
                 </p>
               </div>
             ) : (
               <div className="space-y-6">
                 <div className="w-20 h-20 bg-white/5 rounded-[32px] border border-white/10 flex items-center justify-center text-4xl mx-auto shadow-2xl">☀️</div>
                 <p className="text-slate-500 font-bold text-lg max-w-xs mx-auto italic">Your daily transformation statement is ready for retrieval.</p>
                 <button 
                  onClick={fetchAffirmation}
                  className="px-10 py-5 bg-amber-600 text-white font-black rounded-3xl shadow-2xl hover:bg-amber-700 transition-all uppercase tracking-widest text-xs"
                 >
                   Summon Wisdom
                 </button>
               </div>
             )}
           </div>
        </div>

        {affirmation && !isLoading && (
          <div className="w-full flex flex-col gap-6 animate-in slide-in-from-bottom-8 duration-1000">
             <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {!hasClaimed ? (
                  <button
                    onClick={handleClaim}
                    className="w-full py-6 bg-teal-600 text-white font-black rounded-3xl shadow-xl hover:bg-teal-700 transition-all uppercase tracking-[0.2em] text-sm active:scale-95"
                  >
                    Claim This Identity (+10)
                  </button>
                ) : (
                  <div className="w-full py-6 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-3xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3">
                    <span>✨</span> Beacon Claimed
                  </div>
                )}
             </div>

             <div className="flex flex-wrap justify-center gap-4 items-center">
                <button 
                  onClick={handleResonate}
                  disabled={hasResonated}
                  className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${hasResonated ? 'bg-indigo-600 text-white opacity-80' : 'bg-white/5 border border-white/10 hover:bg-white/10 text-indigo-400'}`}
                >
                  {hasResonated ? '✨ Resonated' : 'Mark Resonance (+5)'}
                </button>
                <SocialShare 
                  title="Daily True-Self Beacon"
                  text={`My recovery beacon for today: "${affirmation}"`}
                />
                <button 
                  onClick={() => setShowReflection(true)}
                  className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em] hover:text-white transition-colors"
                >
                  Exit Sanctuary
                </button>
             </div>
          </div>
        )}
      </div>
      
      {/* Decorative footer */}
      <footer className="fixed bottom-10 left-0 right-0 flex justify-center opacity-30 pointer-events-none">
         <p className="text-[10px] font-black uppercase tracking-[1em] text-slate-700">Footsteps / Identity / Architecture</p>
      </footer>
    </div>
  );
};

export default DailyAffirmations;
