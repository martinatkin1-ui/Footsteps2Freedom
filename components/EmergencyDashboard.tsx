import React from 'react';
import { RelapsePreventionPlan, MoodEntry, AppRoute } from '../types';
import { triggerHaptic } from '../haptics';

interface EmergencyDashboardProps {
  sponsorNumber?: string;
  lastMood: MoodEntry;
  onRecover: () => void;
  onSetRoute: (route: AppRoute) => void;
  onOpenCrisisCard: () => void;
}

const EmergencyDashboard: React.FC<EmergencyDashboardProps> = ({ sponsorNumber, lastMood, onRecover, onSetRoute, onOpenCrisisCard }) => {
  
  const handleAction = (route: AppRoute) => {
    triggerHaptic('TAP');
    onSetRoute(route);
  };

  const handleCallSponsor = () => {
    triggerHaptic('URGENT');
    if (sponsorNumber && sponsorNumber.trim()) {
      window.location.href = `tel:${sponsorNumber.replace(/\s/g, '')}`;
    } else {
      onOpenCrisisCard();
    }
  };

  const handleRecovery = () => {
    triggerHaptic('CALM');
    onRecover();
  };

  return (
    <div className="fixed inset-0 z-[500] bg-black flex flex-col items-center justify-start overflow-y-auto no-scrollbar animate-in fade-in duration-500">
      {/* High Contrast Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden fixed">
        <div className="absolute -top-1/4 -left-1/4 w-full h-full bg-rose-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-1/4 -right-1/4 w-full h-full bg-teal-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-2xl px-6 py-12 flex flex-col items-center min-h-full">
        {/* Header */}
        <header className="text-center space-y-4 mb-12">
          <div className="flex items-center justify-center gap-4">
             <div className="w-3 h-3 bg-rose-600 rounded-full animate-ping" />
             <span className="text-[12px] font-black text-rose-500 uppercase tracking-[0.8em]">Emergency Protocol Active</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
            STAY PRESENT.
          </h1>
          <p className="text-slate-400 text-xl font-bold italic font-serif leading-relaxed">
            "The storm is outside. You are safe in the center."
          </p>
        </header>

        {/* Tactical Trinity Grid */}
        <div className="w-full flex-grow flex flex-col gap-6 mb-16">
          {/* TALK */}
          <button 
            onClick={() => handleAction(AppRoute.SUPPORT)}
            className="group relative flex items-center gap-8 p-10 bg-indigo-950/40 border-4 border-indigo-600 rounded-[40px] hover:bg-indigo-600 transition-all active:scale-95 shadow-2xl"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 bg-indigo-600 rounded-3xl flex items-center justify-center text-5xl md:text-6xl group-hover:scale-110 transition-transform">
              🗣️
            </div>
            <div className="text-left">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none mb-1 uppercase italic">Talk</h2>
              <p className="text-indigo-300 group-hover:text-indigo-50 font-black text-xs uppercase tracking-widest">Vocalise with Guide</p>
            </div>
          </button>

          {/* BREATHE */}
          <button 
            onClick={() => handleAction(AppRoute.BREATHING_EXERCISE)}
            className="group relative flex items-center gap-8 p-10 bg-teal-950/40 border-4 border-teal-600 rounded-[40px] hover:bg-teal-600 transition-all active:scale-95 shadow-2xl"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 bg-teal-600 rounded-3xl flex items-center justify-center text-5xl md:text-6xl group-hover:scale-110 transition-transform">
              🌬️
            </div>
            <div className="text-left">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none mb-1 uppercase italic">Breathe</h2>
              <p className="text-teal-300 group-hover:text-teal-50 font-black text-xs uppercase tracking-widest">Biological Reset</p>
            </div>
          </button>

          {/* CALL HELP */}
          <button 
            onClick={handleCallSponsor}
            className="group relative flex items-center gap-8 p-10 bg-rose-950/40 border-4 border-rose-600 rounded-[40px] hover:bg-rose-600 transition-all active:scale-95 shadow-2xl"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 bg-rose-600 rounded-3xl flex items-center justify-center text-5xl md:text-6xl group-hover:scale-110 transition-transform">
              🆘
            </div>
            <div className="text-left">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none mb-1 uppercase italic">Call Help</h2>
              <p className="text-rose-300 group-hover:text-rose-50 font-black text-xs uppercase tracking-widest">
                {sponsorNumber ? 'Call Sponsor' : 'Emergency Hub'}
              </p>
            </div>
          </button>
        </div>

        {/* Footer Actions */}
        <footer className="w-full flex flex-col items-center gap-8 pb-12">
          <button 
            onClick={handleRecovery}
            className="w-full py-7 bg-white text-black font-black rounded-3xl uppercase tracking-[0.4em] text-sm hover:bg-slate-200 transition-all shadow-2xl active:scale-95 border-b-[8px] border-slate-300 active:border-b-0 active:translate-y-1"
          >
            I AM REGULATED NOW
          </button>
          
          <div className="flex flex-col items-center gap-6">
             <button 
               onClick={handleRecovery}
               className="text-slate-600 hover:text-slate-400 font-black uppercase text-[10px] tracking-[0.3em] transition-colors"
             >
               Return to Expedition Hub
             </button>
             <p className="text-slate-800 text-[9px] font-black uppercase tracking-[0.5em] flex items-center gap-4">
                <span className="h-px w-6 bg-slate-900" />
                CHOICE PARALYSIS DEFENCE
                <span className="h-px w-6 bg-slate-900" />
             </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default EmergencyDashboard;