
import React, { useState, useEffect } from 'react';
import ModuleReflection from './ModuleReflection';
import SpeakButton from './SpeakButton';

const CognitiveRehearsal: React.FC<{ onExit: (rating?: number, refl?: string) => void }> = ({ onExit }) => {
  const [view, setView] = useState<'intro' | 'guided' | 'reflection'>('intro');
  const [step, setStep] = useState(0);
  const [distressBefore, setDistressBefore] = useState(5);
  const [distressAfter, setDistressAfter] = useState(5);

  const steps = [
    { title: "Visualize the Trigger", prompt: "Imagine a high-risk situation in detail (e.g. a wedding with an open bar). Who is there? What are they saying? Hold the scene until your distress reaches level 4-6.", icon: "🎞️" },
    { title: "Pause & Deploy", prompt: "Pause the movie in your mind. Take a deep diaphragmatic breath. Deploy your chosen coping skill right now while keeping the scene in your mind's eye.", icon: "🌬️" },
    { title: "Verify Dropping Distress", prompt: "Practice the skill until you feel your emotional intensity drop by at least two points. See yourself successfully walking away or saying no.", icon: "✅" }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else setView('reflection');
  };

  if (view === 'reflection') {
    return <ModuleReflection 
      moduleName="Cognitive Rehearsal" 
      context={`User practiced a simulated scenario. Distress dropped from ${distressBefore}/10 to ${distressAfter}/10.`} 
      onClose={onExit} 
    />;
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in duration-1000 pb-32">
      {view === 'intro' ? (
        <div className="bg-white dark:bg-slate-900 rounded-[60px] p-8 md:p-12 border-2 border-slate-100 dark:border-slate-800 shadow-2xl space-y-10 relative overflow-hidden">
          <header className="text-center space-y-4">
            <div className="w-20 h-20 bg-rose-600 rounded-3xl flex items-center justify-center text-4xl text-white shadow-xl mx-auto transform rotate-3">🎬</div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">Practice Under Pressure</h2>
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 text-left">
              <h3 className="text-sm font-black uppercase text-rose-600 mb-2 tracking-widest">The 'Why'</h3>
              <p className="text-slate-700 dark:text-slate-300 font-medium">
                **State-Dependent Learning**: Skills learned when calm often fail when we are stressed. We must practice skills while visualizing the trigger to "pre-wire" the brain for real-world high-risk situations.
              </p>
            </div>
          </header>

          <div className="space-y-6">
             <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">The 'When'</h4>
             <p className="text-slate-500 font-bold italic px-2">Use when anticipating a high-risk event (e.g., a holiday dinner, a stressful meeting, or passing a specific place).</p>
          </div>

          <button 
            onClick={() => setView('guided')}
            className="w-full py-6 bg-rose-600 text-white font-black rounded-3xl shadow-xl hover:bg-rose-700 transition-all uppercase tracking-widest text-xs"
          >
            Start Guided Visualization
          </button>
        </div>
      ) : (
        <div className="bg-slate-950 rounded-[60px] p-10 md:p-20 text-center space-y-12 shadow-2xl relative overflow-hidden border-b-[12px] border-slate-900 ring-1 ring-white/10">
           <div className="space-y-4">
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.6em]">Neural Rehearsal Step {step + 1}</span>
              <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase">{steps[step].title}</h3>
           </div>

           <div className="bg-white/5 p-10 rounded-[50px] border border-white/10 shadow-inner group">
              <p className="text-2xl md:text-3xl text-slate-300 font-black italic leading-tight">
                "{steps[step].prompt}"
              </p>
              <SpeakButton text={steps[step].prompt} size={14} className="mt-8 opacity-40 group-hover:opacity-100 transition-opacity" />
           </div>

           {step === 0 && (
             <div className="space-y-4 max-w-xs mx-auto">
                <div className="flex justify-between items-end px-2">
                   <label className="text-[10px] font-black uppercase text-slate-500">Current Distress</label>
                   <span className="text-3xl font-black text-rose-500">{distressBefore}/10</span>
                </div>
                <input type="range" min="1" max="10" value={distressBefore} onChange={(e) => setDistressBefore(parseInt(e.target.value))} className="w-full accent-rose-600" />
             </div>
           )}

           {step === 2 && (
             <div className="space-y-4 max-w-xs mx-auto">
                <div className="flex justify-between items-end px-2">
                   <label className="text-[10px] font-black uppercase text-teal-500">Final Distress</label>
                   <span className="text-3xl font-black text-teal-500">{distressAfter}/10</span>
                </div>
                <input type="range" min="1" max="10" value={distressAfter} onChange={(e) => setDistressAfter(parseInt(e.target.value))} className="w-full accent-teal-600" />
             </div>
           )}

           <button 
             onClick={handleNext}
             className="w-full py-6 bg-white text-slate-950 font-black rounded-3xl shadow-xl hover:bg-slate-100 transition-all active:scale-95 uppercase tracking-widest text-xs"
           >
             {step === steps.length - 1 ? "Seal Memory Pattern" : "Next Protocol Node"}
           </button>
        </div>
      )}
    </div>
  );
};

export default CognitiveRehearsal;
