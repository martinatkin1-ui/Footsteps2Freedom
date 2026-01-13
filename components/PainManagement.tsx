
import React, { useState } from 'react';
import { getModuleReflection } from '../geminiService';
import ModuleReflection from './ModuleReflection';

interface PainManagementProps {
  onComplete: (rating?: number) => void;
  onAskGuide?: () => void;
}

const PainManagement: React.FC<PainManagementProps> = ({ onComplete, onAskGuide }) => {
  const [view, setView] = useState<'intro' | 'meditation' | 'reflection'>('intro');
  const [reflection, setReflection] = useState('');

  const handleFinish = async () => {
    const res = await getModuleReflection("Pain Management Somatic", "User practiced a visualization and release session for physical pain.");
    setReflection(res);
    setView('reflection');
  };

  if (view === 'reflection') return <ModuleReflection moduleName="Somatic Pain Release" context="Pain release visualization completed." reflection={reflection} onClose={onComplete} title="Somatic Release" />;

  if (view === 'intro') {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-700">
        <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 dark:bg-rose-900/10 rounded-full -mr-32 -mt-32 opacity-50" />
          <div className="relative z-10 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-5xl">🧘‍♀️</span>
                <div>
                  <h2 className="text-3xl font-black text-slate-800 dark:text-white">Pain Management</h2>
                  <p className="text-rose-600 dark:text-rose-400 font-black uppercase tracking-widest text-[10px]">Somatic Acceptance</p>
                </div>
              </div>
              {onAskGuide && (
                <button 
                  onClick={onAskGuide}
                  className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800 shadow-sm transition-all hover:scale-105 active:scale-95"
                >
                  Need Clarity? Ask Guide
                </button>
              )}
            </div>
            <div className="prose prose-rose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed space-y-6 text-lg">
              <p>Addressing physical pain is crucial because the body's reaction—change in breathing and muscle tension—can reinforce a sense of panic and anxiety.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="p-6 bg-rose-50 dark:bg-rose-950/30 rounded-3xl border border-rose-100 dark:border-rose-900/30">
                    <h4 className="font-black text-rose-800 dark:text-rose-200 text-[10px] uppercase mb-2">Hurt vs Harm</h4>
                    <p className="text-xs">Individuals with chronic pain often confuse "hurt" with "harm." Pain does not always mean the body is being damaged further.</p>
                 </div>
                 <div className="p-6 bg-rose-50 dark:bg-rose-950/30 rounded-3xl border border-rose-100 dark:border-rose-900/30">
                    <h4 className="font-black text-rose-800 dark:text-rose-200 text-[10px] uppercase mb-2">Self-Efficacy</h4>
                    <p className="text-xs">Believing you have some control over your pain experience makes you more likely to engage in positive coping.</p>
                 </div>
              </div>
            </div>
            <button onClick={() => setView('meditation')} className="w-full py-5 bg-rose-600 text-white font-black rounded-2xl shadow-xl hover:bg-rose-700 uppercase tracking-widest text-xs transition-all">Start Meditation Script</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-6 duration-1000">
       <div className="bg-slate-900 text-white rounded-[50px] p-12 text-center shadow-2xl relative overflow-hidden border-8 border-slate-800">
          <div className="absolute inset-0 bg-rose-500/5 animate-pulse pointer-events-none" />
          <div className="relative z-10 space-y-10">
             <h2 className="text-[10px] font-black opacity-60 uppercase tracking-[0.4em]">Guided Release</h2>
             
             <div className="space-y-12">
                <div className="space-y-4">
                   <h4 className="text-rose-400 font-bold">1. Locate the Sensation</h4>
                   <p className="text-slate-300 italic font-serif text-lg leading-relaxed">"Now, take a moment to locate your pain. resides in your head, your neck, the back or somewhere else. Just notice it, without judgment. Observe the pain as it is, without trying to push it away."</p>
                </div>
                <div className="space-y-4">
                   <h4 className="text-rose-400 font-bold">2. Breath and Light</h4>
                   <p className="text-slate-300 italic font-serif text-lg leading-relaxed">"Imagine the breath bringing healing and comfort into the area where your pain is located. Imagine a healing light hitting the area and then surrounding it."</p>
                </div>
                <div className="space-y-4">
                   <h4 className="text-rose-400 font-bold">3. Release</h4>
                   <p className="text-slate-300 italic font-serif text-lg leading-relaxed">"If the pain is in a muscle, imagine the muscle softening and releasing any tension. Visualize the area softening, strengthening and letting go of any hurt."</p>
                </div>
             </div>

             <button onClick={handleFinish} className="w-full py-6 bg-rose-600 text-white font-black rounded-3xl shadow-xl hover:bg-rose-700 transition-all uppercase tracking-widest text-xs">I am at ease</button>
          </div>
       </div>
    </div>
  );
};

export default PainManagement;
