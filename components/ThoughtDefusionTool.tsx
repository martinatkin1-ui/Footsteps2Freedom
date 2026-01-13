
import React, { useState, useEffect } from 'react';
import ModuleReflection from './ModuleReflection';
import SpeakButton from './SpeakButton';

const VISUALIZATIONS = [
  { id: 'leaves', title: 'Leaves on a Stream', icon: '🍃', desc: 'Place each craving or thought on a leaf and watch it float away.' },
  { id: 'clouds', title: 'Clouds in the Sky', icon: '☁️', desc: 'See your thoughts as passing clouds that change shape and drift by.' },
  { id: 'billboard', title: 'Roadside Billboards', icon: '🛣️', desc: 'Observe thoughts as messages on billboards you pass at speed.' }
];

const ThoughtDefusionTool: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [view, setView] = useState<'intro' | 'active' | 'reflection'>('intro');
  const [selected, setSelected] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  const steps = [
    { title: "Close your eyes.", prompt: "Identify the current loop of negative thinking or the obsessive craving." },
    { title: "Don't interact.", prompt: "Do not judge, analyze, or fight the thought. Simply acknowledge it exists." },
    { title: "Place it on the object.", prompt: `Imagine placing that thought on a ${selected === 'leaves' ? 'leaf' : selected === 'clouds' ? 'cloud' : 'billboard'}.` },
    { title: "Let it drift.", prompt: "Watch it slowly float or drive away until it is out of sight. Repeat for every new thought." }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else setView('reflection');
  };

  if (view === 'reflection') {
    return <ModuleReflection moduleName="Thought Defusion" context={`User practiced the '${selected}' visualization to unhook from cravings.`} onClose={onExit} />;
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in duration-1000 pb-32">
      <div className="bg-white dark:bg-slate-900 rounded-[60px] p-10 md:p-16 border-2 border-slate-100 dark:border-slate-800 shadow-2xl space-y-12 relative overflow-hidden">
        {view === 'intro' ? (
          <div className="space-y-10">
            <header className="text-center space-y-4">
               <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-4xl text-white shadow-xl mx-auto">☁️</div>
               <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Unhooking from Cravings: Thought Defusion</h2>
               <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 text-left">
                  <h3 className="text-sm font-black uppercase text-indigo-600 mb-2 tracking-widest">The 'Why'</h3>
                  <p className="text-slate-700 dark:text-slate-300 font-medium">
                    Recovering addicts often get "hooked" by obsessive thoughts about using. Defusion teaches you that **you are not your thoughts**. Thoughts are just passing events in your mind, like clouds in the sky, that do not require your action.
                  </p>
               </div>
            </header>

            <div className="space-y-6">
               <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">The 'When'</h4>
               <p className="text-slate-500 font-bold italic px-2">Use when experiencing repetitive loops of negative thinking or obsessive cravings.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              {VISUALIZATIONS.map(v => (
                <button
                  key={v.id}
                  onClick={() => setSelected(v.id)}
                  className={`p-10 rounded-[48px] border-2 transition-all flex flex-col items-center text-center gap-6 group ${
                    selected === v.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl scale-105' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:border-indigo-400'
                  }`}
                >
                  <span className="text-5xl group-hover:animate-bounce">{v.icon}</span>
                  <div className="space-y-2">
                     <h4 className="text-lg font-black tracking-tight">{v.title}</h4>
                     <p className="text-[10px] font-bold leading-relaxed opacity-80 italic">"{v.desc}"</p>
                  </div>
                </button>
              ))}
            </div>

            <button 
              disabled={!selected}
              onClick={() => setView('active')}
              className="w-full py-6 bg-indigo-600 text-white font-black rounded-3xl shadow-xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs disabled:opacity-30"
            >
              Begin Guided Defusion
            </button>
          </div>
        ) : (
          <div className="space-y-12 relative z-10 text-center">
             <div className="space-y-2">
                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.6em]">Step {step + 1} of 4</span>
                <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none italic uppercase">{steps[step].title}</h3>
             </div>

             <div className="bg-slate-50 dark:bg-slate-950 p-10 rounded-[50px] border border-slate-100 dark:border-slate-800 shadow-inner group">
                <p className="text-2xl md:text-3xl text-slate-700 dark:text-slate-300 font-black italic leading-tight">
                  "{steps[step].prompt}"
                </p>
                <SpeakButton text={steps[step].prompt} size={14} className="mt-8 opacity-40 group-hover:opacity-100" />
             </div>

             <div className="flex gap-4 pt-4">
                <button onClick={handleNext} className="w-full py-6 bg-indigo-600 text-white font-black rounded-3xl shadow-xl hover:bg-indigo-700 transition-all active:scale-95 uppercase tracking-widest text-xs">
                  {step === steps.length - 1 ? "Thought has Dissolved" : "Breathe & Continue"}
                </button>
             </div>
             <button onClick={() => setView('intro')} className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Restart Protocol</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThoughtDefusionTool;
