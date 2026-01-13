
import React, { useState, useEffect } from 'react';
import { getDailyAffirmation } from '../geminiService';
import { useRecoveryStore } from '../store';
import SocialShare from './SocialShare';

const DailyAffirmationCard: React.FC = () => {
  const { sobriety, activePhaseId, awardFootsteps } = useRecoveryStore();
  const [affirmation, setAffirmation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasResonated, setHasResonated] = useState(false);

  const getRankTitle = (footsteps: number) => {
    if (footsteps >= 150) return 'Wayfinder';
    if (footsteps >= 71) return 'Guardian';
    if (footsteps >= 31) return 'Resilient';
    if (footsteps >= 11) return 'Builder';
    return 'Seeker';
  };

  /**
   * Calculates a unique string representing the current affirmation cycle.
   * A cycle starts at 6:00 AM local time. 
   */
  const getAffirmationCycle = () => {
    const now = new Date();
    // Shift current time back by 6 hours.
    // 5:59 AM becomes 11:59 PM of the previous day cycle.
    // 6:00 AM becomes 12:00 AM of the current day cycle.
    const shiftedTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
    return shiftedTime.toDateString();
  };

  useEffect(() => {
    const cycle = getAffirmationCycle();
    const saved = localStorage.getItem('dashboard_ai_affirmation');
    const savedCycle = localStorage.getItem('dashboard_ai_affirmation_cycle');
    const resonateCycle = localStorage.getItem('dashboard_ai_resonate_cycle');

    if (saved && savedCycle === cycle) {
      setAffirmation(saved);
    } else {
      fetchAffirmation();
    }

    if (resonateCycle === cycle) {
      setHasResonated(true);
    }
  }, []);

  const fetchAffirmation = async () => {
    setIsLoading(true);
    const cycle = getAffirmationCycle();
    const rank = getRankTitle(sobriety.footsteps || 0);
    const res = await getDailyAffirmation(rank, activePhaseId);
    if (res) {
      setAffirmation(res);
      localStorage.setItem('dashboard_ai_affirmation', res);
      localStorage.setItem('dashboard_ai_affirmation_cycle', cycle);
      setHasResonated(false);
    }
    setIsLoading(false);
  };

  const handleResonate = () => {
    if (hasResonated) return;
    const cycle = getAffirmationCycle();
    localStorage.setItem('dashboard_ai_resonate_cycle', cycle);
    setHasResonated(true);
    awardFootsteps(5);
    if ('vibrate' in navigator) navigator.vibrate(50);
  };

  return (
    <div className="bg-amber-950/40 backdrop-blur-3xl border border-white/10 p-10 rounded-[56px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] relative group overflow-hidden h-auto flex flex-col transition-all duration-700">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-[4000ms]" />
      
      <div className="space-y-4 relative z-10 mb-6">
         <div className="w-14 h-14 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-2xl shadow-inner animate-float">☀️</div>
         <h4 className="text-[10px] font-black text-amber-300 uppercase tracking-[0.5em]">True-Self Beacon</h4>
      </div>
      
      <div className="flex-grow flex items-center justify-center relative z-10 py-4 px-2">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-amber-300 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-amber-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 bg-amber-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
            <span className="text-[10px] font-black text-amber-200/20 uppercase tracking-[0.4em]">Consulting the Archive...</span>
          </div>
        ) : affirmation ? (
          <div className="space-y-4 max-w-xl">
            <p className="text-white font-black italic text-xl md:text-2xl leading-snug tracking-tight text-center font-serif drop-shadow-2xl animate-in fade-in zoom-in-95 duration-1000">
              "{affirmation}"
            </p>
            <div className="h-1 w-12 bg-amber-500/20 rounded-full mx-auto" />
          </div>
        ) : (
          <button onClick={fetchAffirmation} className="text-amber-300 font-black text-[10px] uppercase tracking-widest hover:underline decoration-2 underline-offset-4 py-12">
            Summon New Beacon
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 relative z-10 pt-8 mt-4 border-t border-white/5">
        <button 
          onClick={handleResonate}
          disabled={hasResonated || isLoading || !affirmation}
          className={`flex-[2] py-4 rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] transition-all border shadow-xl ${
            hasResonated 
              ? 'bg-emerald-600/20 text-emerald-300 border-emerald-400/20 shadow-none' 
              : !affirmation || isLoading
                ? 'bg-white/5 text-white/20 border-white/5 cursor-not-allowed shadow-none'
                : 'bg-white text-amber-950 border-white shadow-amber-600/20 hover:bg-amber-50 active:scale-95'
          }`}
        >
          {hasResonated ? '✨ INTEGRATED' : 'MARK RESONANCE (+5)'}
        </button>
        {affirmation && (
          <div className="flex-1">
             <SocialShare 
                title="Daily True-Self Beacon"
                text={`My AI-generated daily beacon from Footpath Guide: "${affirmation}"`}
                variant="ghost"
              />
          </div>
        )}
      </div>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none">
        <span className="text-[6px] font-black uppercase text-amber-500 tracking-[0.4em]">Next Update: 06:00 AM UK</span>
      </div>
    </div>
  );
};

export default DailyAffirmationCard;
