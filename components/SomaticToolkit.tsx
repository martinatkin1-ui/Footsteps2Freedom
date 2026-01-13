
import React, { useState } from 'react';
import ModuleReflection from './ModuleReflection';

const SOMATIC_EXERCISES = [
  {
    title: "TRE: Floor Sequence",
    icon: "🧘",
    description: "Inducing the body's natural shaking mechanism to release deep trauma-induced tension.",
    steps: [
      "Lay on the floor and bend your knees.",
      "Open your knees wide with foot soles touching and heels close to your body.",
      "Lift your hips off the ground for 30 seconds to 1 minute.",
      "Gently set your hips down and let your knees relax for a minute.",
      "Slightly close knees an inch or two and hold for 2 minutes. Tremoring is a safe release mechanism!"
    ]
  },
  {
    title: "Wall Push",
    icon: "🧱",
    description: "Releasing anger, frustration, and high-arousal energy through isometric exertion.",
    steps: [
      "Find a sturdy wall that can withstand your weight.",
      "Place palms against the wall.",
      "Start pushing into the wall as if you are trying to move it.",
      "Notice the tension in your arms and legs. Hold for 30 seconds.",
      "Slowly release and notice the contrasting feeling of biological safety."
    ]
  },
  {
    title: "Body Tapping",
    icon: "👏",
    description: "Grounding your nervous system and re-establishing physical boundaries with your True-Self.",
    steps: [
      "Cup your hands gently.",
      "Starting from your feet, gently tap your body all over.",
      "Work your way up your legs, torso, and arms.",
      "Gently tap your shoulders, neck, and head.",
      "Notice how your body feels 'contained', safe, and separate from the storm."
    ]
  }
];

interface SomaticToolkitProps {
  onExit: (rating?: number) => void;
  onAskGuide?: () => void;
}

const SomaticToolkit: React.FC<SomaticToolkitProps> = ({ onExit, onAskGuide }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [showReflection, setShowReflection] = useState(false);

  const handleFinish = () => {
    setShowReflection(true);
  };

  if (showReflection) {
    const exerciseName = selected !== null ? SOMATIC_EXERCISES[selected].title : "Somatic Toolkit";
    return (
      <ModuleReflection 
        moduleName={exerciseName}
        context={`User completed a somatic release exercise: ${exerciseName}.`}
        onClose={onExit}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700 pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="space-y-1">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Body Archive</h2>
            <div className="flex items-center gap-3">
               <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Somatic Bio-Regulation Hub</p>
            </div>
        </div>
        <div className="flex gap-3">
          {onAskGuide && (
            <button 
              onClick={onAskGuide}
              className="px-4 py-2 bg-slate-800 text-rose-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-700 shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              Consult Guide
            </button>
          )}
          <button onClick={() => onExit()} className="px-4 py-2 bg-slate-800 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-700 shadow-sm">Terminate</button>
        </div>
      </div>

      {selected === null ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2">
          {SOMATIC_EXERCISES.map((ex, i) => (
            <button 
              key={i}
              onClick={() => setSelected(i)}
              className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border-2 border-slate-100 dark:border-slate-800 text-left hover:shadow-2xl hover:border-rose-500/30 transition-all group flex flex-col h-full relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-950 rounded-[32px] flex items-center justify-center text-4xl mb-8 shadow-inner group-hover:rotate-6 transition-transform">
                {ex.icon}
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">{ex.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-10 flex-grow italic">"{ex.description}"</p>
              <div className="text-rose-600 dark:text-rose-400 font-black text-[10px] uppercase tracking-[0.2em] mt-auto flex items-center gap-2">
                Initiate Protocol <span>→</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 rounded-[60px] p-8 md:p-20 border-2 border-slate-800 shadow-2xl max-w-2xl mx-auto relative overflow-hidden">
           <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/5 rounded-full -mr-48 -mt-48 blur-[100px] pointer-events-none" />
           
           <button onClick={() => setSelected(null)} className="text-rose-400 font-black uppercase text-[10px] tracking-widest mb-12 flex items-center gap-3 hover:text-rose-300 transition-colors">
             <span className="text-xl">←</span> Return to Bio-Archive
           </button>
           
           <div className="flex items-center gap-6 mb-12">
             <div className="w-24 h-24 bg-slate-950 rounded-[32px] flex items-center justify-center text-6xl shadow-inner border border-white/5">
               {SOMATIC_EXERCISES[selected].icon}
             </div>
             <div>
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] mb-1 block">Live Engagement</span>
                <h3 className="text-4xl font-black text-white tracking-tighter leading-none">{SOMATIC_EXERCISES[selected].title}</h3>
             </div>
           </div>
           
           <div className="space-y-8 relative z-10">
             {SOMATIC_EXERCISES[selected].steps.map((step, i) => (
               <div key={i} className="flex gap-8 group">
                 <div className="w-10 h-10 rounded-2xl bg-slate-950 text-rose-500 border border-rose-900/30 flex items-center justify-center font-black text-sm shrink-0 shadow-xl group-hover:scale-110 transition-transform">
                   {i + 1}
                 </div>
                 <p className="text-slate-300 text-lg font-medium leading-relaxed pt-1 italic">"{step}"</p>
               </div>
             ))}
           </div>
           
           <div className="mt-20 pt-10 border-t border-white/5">
              <button 
                onClick={handleFinish}
                className="w-full py-6 bg-rose-600 text-white rounded-3xl font-black shadow-xl shadow-rose-600/30 hover:bg-rose-700 transition-all active:scale-95 uppercase tracking-widest text-sm"
              >
                Seal Somatic Session
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default SomaticToolkit;
