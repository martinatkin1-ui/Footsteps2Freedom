
import React, { useEffect, useState } from 'react';

interface GuideNudgeProps {
  message: string;
  onCallSponsor: () => void;
  onAcceptTool: () => void;
  onDecline: () => void;
  hasSponsor: boolean;
}

const GuideNudge: React.FC<GuideNudgeProps> = ({ message, onCallSponsor, onAcceptTool, onDecline, hasSponsor }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!message) return null;

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="bg-white dark:bg-slate-900 rounded-[50px] p-8 md:p-12 max-w-xl w-full shadow-2xl text-center relative overflow-hidden animate-in zoom-in-95 duration-500 border border-teal-100 dark:border-teal-900/40">
        
        {/* Animated Sacred Presence */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] -mt-32 animate-pulse" />
        
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
             <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center text-3xl shadow-xl mx-auto transform -rotate-3 animate-bounce shadow-teal-500/20">🛡️</div>
             <div className="space-y-1">
                <span className="text-[9px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-[0.4em]">Protective Presence</span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Support Required?</h2>
             </div>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-inner relative group">
             <p className="text-lg md:text-xl text-slate-800 dark:text-slate-100 font-bold italic leading-relaxed">
               "{message}"
             </p>
          </div>

          <div className="flex flex-col gap-3">
             <div className="flex flex-col gap-3">
                <button 
                  onClick={onCallSponsor}
                  disabled={!hasSponsor}
                  className={`py-5 ${hasSponsor ? 'bg-emerald-600 shadow-emerald-600/30 hover:bg-emerald-700' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'} text-white font-black rounded-2xl shadow-xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3`}
                >
                  <span className="text-xl">📞</span> {hasSponsor ? 'Call Sponsor' : 'No Sponsor Set'}
                </button>
                <button 
                  onClick={onAcceptTool}
                  className="py-5 bg-teal-600 text-white font-black rounded-2xl shadow-xl shadow-teal-600/30 hover:bg-teal-700 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3"
                >
                  <span className="text-xl">🩹</span> First Aid Toolkit
                </button>
             </div>
             <button 
              onClick={onDecline}
              className="text-slate-400 dark:text-slate-600 font-black uppercase text-[10px] tracking-[0.3em] hover:text-slate-600 transition-colors pt-4"
             >
               I am steady right now
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideNudge;
