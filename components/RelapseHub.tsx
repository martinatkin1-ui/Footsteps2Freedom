import React, { useState } from 'react';
import { AppRoute } from '../types';
import { useRecoveryStore } from '../store';
import SpeakButton from './SpeakButton';

interface RelapseHubProps {
  onSetRoute: (route: AppRoute) => void;
  onClose: () => void;
}

const RelapseHub: React.FC<RelapseHubProps> = ({ onSetRoute, onClose }) => {
  const { updateSobrietyDate } = useRecoveryStore();
  const [step, setStep] = useState<'compassion' | 'avoidance' | 'options'>('compassion');

  const handleResetCounter = () => {
    const now = new Date().toISOString();
    updateSobrietyDate(now);
    if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
    setStep('avoidance');
  };

  const skipReset = () => {
    setStep('avoidance');
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in duration-700 pb-32">
      <div className="bg-white dark:bg-slate-900 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full -mr-40 -mt-40 blur-3xl opacity-60 pointer-events-none" />
        
        {/* Completed truncated section: compassion step */}
        {step === 'compassion' && (
          <div className="p-10 md:p-20 text-center space-y-10 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="w-24 h-24 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-[32px] flex items-center justify-center text-5xl mx-auto shadow-inner border border-rose-100 dark:border-rose-800">🕊️</div>
             <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Gently, Brave Soul.</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xl font-medium leading-relaxed max-w-2xl mx-auto italic">
                  "A slip is a piece of data, not a definition of your worth. You are here, and that is a victory for your True-Self."
                </p>
                <SpeakButton text="Gently, Brave Soul. A slip is a piece of data, not a definition of your worth. You are here, and that is a victory for your True-Self. Let's navigate this moment with compassion." />
             </div>
             <div className="flex flex-col gap-4 max-w-sm mx-auto pt-6">
                <button 
                  onClick={handleResetCounter}
                  className="w-full py-6 bg-rose-600 text-white font-black rounded-3xl shadow-xl hover:bg-rose-700 transition-all uppercase tracking-widest text-xs"
                >
                  Reset Counter (New Day 1)
                </button>
                <button 
                  onClick={skipReset}
                  className="w-full py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-600"
                >
                  Keep Existing Date (Small Slip)
                </button>
             </div>
          </div>
        )}

        {/* Completed truncated section: avoidance and clinical options step */}
        {step === 'avoidance' && (
           <div className="p-10 md:p-20 text-center space-y-10 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="w-24 h-24 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-[32px] flex items-center justify-center text-5xl mx-auto shadow-inner border border-amber-100 dark:border-amber-800">🛡️</div>
             <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Stabilising the Path</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xl font-medium leading-relaxed max-w-2xl mx-auto italic">
                  "Let's identify how we can make the next 24 hours predictably safe for you."
                </p>
                <SpeakButton text="Let's identify how we can make the next 24 hours predictably safe for you. Which clinical protocol should we initialize?" />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                <button 
                  onClick={() => onSetRoute(AppRoute.CHAIN_ANALYSIS)}
                  className="p-8 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[40px] text-left hover:border-indigo-400 transition-all group"
                >
                   <span className="text-3xl mb-4 block group-hover:rotate-12 transition-transform">🔍</span>
                   <h4 className="font-black text-slate-900 dark:text-white mb-2">Chain Analysis</h4>
                   <p className="text-xs text-slate-500 dark:text-slate-400">Deconstruct the slip to find the 'Link of Choice'.</p>
                </button>
                <button 
                  onClick={() => onSetRoute(AppRoute.RPP_BUILDER)}
                  className="p-8 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[40px] text-left hover:border-teal-400 transition-all group"
                >
                   <span className="text-3xl mb-4 block group-hover:rotate-12 transition-transform">🛡️</span>
                   <h4 className="font-black text-slate-900 dark:text-white mb-2">Refine Safety Plan</h4>
                   <p className="text-xs text-slate-500 dark:text-slate-400">Update your triggers and supports based on new data.</p>
                </button>
             </div>
             <button onClick={onClose} className="text-slate-400 font-black uppercase text-[10px] tracking-widest pt-6 hover:text-slate-600">Return to Dashboard</button>
          </div>
        )}
      </div>
    </div>
  );
};

/* Fix: Added missing default export */
export default RelapseHub;