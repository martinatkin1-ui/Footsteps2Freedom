
import React, { useState } from 'react';
import { useRecoveryStore } from '../store';
import SpeakButton from './SpeakButton';

const Archive: React.FC = () => {
  const store = useRecoveryStore();
  const archive = store.archiveSummary;
  const isRefreshing = false; // Mocking state if needed

  if (!archive) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center space-y-8 animate-in fade-in duration-1000">
         <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[40px] flex items-center justify-center text-5xl grayscale opacity-30 shadow-inner">📖</div>
         <div className="space-y-4 max-w-md">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">The Library is Still Empty</h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold italic leading-relaxed">
              "Footpath Guide is currently gathering the threads of your journey. Please log more moods, journals, or lessons to allow the AI to synthesize your path archive."
            </p>
         </div>
         <button 
          onClick={() => store.refreshArchive()}
          className="px-10 py-5 bg-teal-600 text-white font-black rounded-3xl shadow-xl hover:bg-teal-700 transition-all uppercase tracking-widest text-xs"
         >
           Attempt Manual Synthesis
         </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-32 px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">The Archive</h2>
          <div className="flex items-center gap-3">
             <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_#f59e0b]" />
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AI Journey Memory & Pattern Detection</p>
          </div>
        </div>
        <button 
          onClick={() => store.refreshArchive()}
          className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-slate-200 dark:border-slate-700 hover:bg-white transition-all active:scale-95"
        >
          Refresh Chronicle
        </button>
      </div>

      {/* The Golden Thread Narrative */}
      <div className="bg-slate-900 rounded-[60px] p-10 md:p-20 border-4 border-slate-800 shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-indigo-500 to-amber-500 opacity-60" />
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(245,158,11,0.05),transparent)] pointer-events-none" />
         
         <div className="relative z-10 space-y-12">
            <div className="flex flex-col md:flex-row gap-12 items-center md:items-start">
               <div className="w-32 h-32 md:w-40 md:h-40 bg-white/5 rounded-[48px] border border-white/10 flex items-center justify-center text-7xl shadow-2xl animate-float shrink-0 backdrop-blur-xl relative group/thread">
                  <SpeakButton text={archive.narrative} size={24} className="absolute -bottom-4 -right-4 scale-125 shadow-2xl" />
                  🧵
               </div>
               <div className="space-y-6 text-center md:text-left">
                  <span className="text-[11px] font-black text-amber-500 uppercase tracking-[0.5em]">The Golden Thread</span>
                  <p className="text-2xl md:text-4xl text-slate-200 font-bold leading-[1.1] italic font-serif">
                    "{archive.narrative}"
                  </p>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Pattern Detection */}
        <div className="bg-white dark:bg-slate-900 rounded-[50px] p-10 md:p-12 border-2 border-indigo-50 dark:border-indigo-900/40 shadow-xl space-y-10 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />
           <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">📈</div>
              <div>
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Neural Patterns</h3>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">DETECTED BEHAVIOURAL LOOPS</p>
              </div>
           </div>

           <div className="space-y-4">
              {archive.patterns.map((pattern, i) => (
                <div key={i} className="p-6 bg-slate-50 dark:bg-slate-950/50 rounded-3xl border border-slate-100 dark:border-slate-800 flex gap-5 items-start group hover:border-indigo-400/30 transition-all relative">
                   <SpeakButton text={pattern} size={10} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100" />
                   <span className="text-xl group-hover:scale-125 transition-transform">⚠️</span>
                   <p className="text-sm font-bold text-slate-600 dark:text-slate-300 leading-relaxed italic">"{pattern}"</p>
                </div>
              ))}
           </div>
        </div>

        {/* Strengths Integration */}
        <div className="bg-white dark:bg-slate-900 rounded-[50px] p-10 md:p-12 border-2 border-teal-50 dark:border-teal-900/40 shadow-xl space-y-10 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />
           <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">💎</div>
              <div>
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Artifacts of Strength</h3>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TRUE-SELF IDENTITIES SECURED</p>
              </div>
           </div>

           <div className="space-y-4">
              {archive.strengths.map((strength, i) => (
                <div key={i} className="p-6 bg-slate-50 dark:bg-slate-950/50 rounded-3xl border border-slate-100 dark:border-slate-800 flex gap-5 items-start group hover:border-teal-400/30 transition-all relative">
                   <SpeakButton text={strength} size={10} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100" />
                   <span className="text-xl group-hover:scale-125 transition-transform">✨</span>
                   <p className="text-sm font-bold text-slate-600 dark:text-slate-300 leading-relaxed italic">"{strength}"</p>
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="bg-slate-950 rounded-[48px] p-12 text-white relative overflow-hidden shadow-2xl text-center border-b-[12px] border-slate-900 ring-1 ring-white/5 mx-4 md:mx-0">
         <p className="text-slate-500 text-sm font-bold tracking-[0.5em] uppercase italic max-w-4xl mx-auto leading-relaxed">
           "Your Archive is not a list of past mistakes, but a blueprint of your resilience. The Guide uses this memory to support your next brave step."
         </p>
         <p className="text-[9px] font-black text-slate-700 uppercase mt-8 tracking-widest">
           LAST ARCHIVE SYNC: {new Date(archive.lastUpdated).toLocaleString('en-GB')}
         </p>
      </div>
    </div>
  );
};

export default Archive;
