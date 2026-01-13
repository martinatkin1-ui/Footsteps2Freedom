
import React, { useState } from 'react';
import ModuleReflection from './ModuleReflection';

const PolyvagalGrounding: React.FC<{ onExit: (rating?: number) => void }> = ({ onExit }) => {
  const [state, setState] = useState<'selection' | 'active'>('selection');
  const [vagalMode, setVagalMode] = useState<'hyper' | 'hypo' | 'optimal'>('optimal');
  const [showReflection, setShowReflection] = useState(false);

  const startGrounding = (mode: 'hyper' | 'hypo' | 'optimal') => {
    setVagalMode(mode);
    setState('active');
  };

  if (showReflection) {
    return (
      <ModuleReflection 
        moduleName="Polyvagal Reset"
        context={`User completed a biological nervous system reset for ${vagalMode} state.`}
        onClose={onExit}
      />
    );
  }

  if (state === 'active') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-1000">
         <div className="relative w-64 h-64 mb-12">
            <div className={`absolute inset-0 rounded-full blur-[60px] opacity-30 animate-pulse ${vagalMode === 'hyper' ? 'bg-rose-500' : vagalMode === 'hypo' ? 'bg-sky-500' : 'bg-teal-500'}`} />
            <div className="relative w-full h-full rounded-full border-8 border-white/20 flex items-center justify-center">
               <span className="text-6xl">🧘</span>
            </div>
         </div>
         <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4">Vagal Reset Active</h2>
         <p className="text-slate-500 font-bold mb-10 text-center max-w-sm">Focus on your physical sensations and take slow, even breaths.</p>
         <button 
           onClick={() => setShowReflection(true)} 
           className="px-12 py-5 bg-teal-600 text-white font-black rounded-2xl shadow-xl hover:bg-teal-700 transition-all uppercase tracking-widest text-xs"
         >
           I feel grounded now
         </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 space-y-12 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black text-slate-900 dark:text-white">Polyvagal Grounding</h2>
        <p className="text-slate-500 font-bold text-lg">Biologically override your nervous system's current state.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <button onClick={() => startGrounding('hyper')} className="bg-rose-50 dark:bg-rose-950/20 p-10 rounded-[48px] border-2 border-rose-100 dark:border-rose-900 hover:shadow-2xl transition-all group text-left">
           <span className="text-5xl mb-6 block">🌩️</span>
           <h3 className="text-2xl font-black text-rose-800 dark:text-rose-200 mb-2">Sympathetic</h3>
           <p className="text-sm text-rose-600 dark:text-rose-400 font-bold mb-8">Fight or Flight. Racing heart, panic, or intense anger.</p>
           <span className="text-[10px] font-black uppercase text-rose-500 tracking-widest border-b-2 border-rose-200">Start Reset Protocol</span>
        </button>
        <button onClick={() => startGrounding('hypo')} className="bg-sky-50 dark:bg-sky-950/20 p-10 rounded-[48px] border-2 border-sky-100 dark:border-sky-900 hover:shadow-2xl transition-all group text-left">
           <span className="text-5xl mb-6 block">🌫️</span>
           <h3 className="text-2xl font-black text-sky-800 dark:text-sky-200 mb-2">Dorsal Vagal</h3>
           <p className="text-sm text-sky-600 dark:text-sky-400 font-bold mb-8">Shut down. Numb, exhausted, or feeling "erased".</p>
           <span className="text-[10px] font-black uppercase text-sky-500 tracking-widest border-b-2 border-sky-200">Start Reset Protocol</span>
        </button>
        <button onClick={() => startGrounding('optimal')} className="bg-teal-50 dark:bg-teal-950/20 p-10 rounded-[48px] border-2 border-teal-100 dark:border-teal-900 hover:shadow-2xl transition-all group text-left">
           <span className="text-5xl mb-6 block">🌿</span>
           <h3 className="text-2xl font-black text-teal-800 dark:text-teal-200 mb-2">Ventral Vagal</h3>
           <p className="text-sm text-teal-600 dark:text-teal-400 font-bold mb-8">Safe and Social. Calm, connected, and present.</p>
           <span className="text-[10px] font-black uppercase text-teal-500 tracking-widest border-b-2 border-teal-200">Start Reset Protocol</span>
        </button>
      </div>
    </div>
  );
};

export default PolyvagalGrounding;
