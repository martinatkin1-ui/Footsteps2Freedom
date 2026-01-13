
import React, { useState } from 'react';
import ModuleReflection from './ModuleReflection';

const STEPS = [
  { 
    id: 'T', 
    title: 'Temperature', 
    icon: '❄️', 
    prompt: 'Splash your face with very cold water or hold an ice cube in your hand.', 
    guidance: 'Changing your body temperature quickly can activate the dive reflex, which physically slows your heart rate.'
  },
  { 
    id: 'I', 
    title: 'Intense Exercise', 
    icon: '🏃', 
    prompt: 'Do 60 seconds of high-intensity movement (jumping jacks, running on spot).', 
    guidance: 'Expel the built-up "fight or flight" energy in your muscles to reset your nervous system.'
  },
  { 
    id: 'P1', 
    title: 'Paced Breathing', 
    icon: '🌬️', 
    prompt: 'Inhale for 4 seconds, then exhale for a slow 6 seconds.', 
    guidance: 'Slowing the exhale sends a "safety" signal to the brain, down-regulating the amygdala.'
  },
  { 
    id: 'P2', 
    title: 'Paired Relaxation', 
    icon: '🧘', 
    prompt: 'Tense your muscles as you inhale, and release them deeply as you exhale.', 
    guidance: 'Physically releasing tension helps the mind follow suit, breaking the cycle of physical distress.'
  }
];

interface TippSkillProps {
  onExit: (rating?: number) => void;
  onAskGuide?: () => void;
}

const TippSkill: React.FC<TippSkillProps> = ({ onExit, onAskGuide }) => {
  const [step, setStep] = useState(0);
  const [showReflection, setShowReflection] = useState(false);

  const current = STEPS[step];

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setShowReflection(true);
    }
  };

  if (showReflection) {
    return <ModuleReflection 
      moduleName="TIPP Skill" 
      context={`User completed the TIPP physical reset sequence.`} 
      onClose={onExit} 
    />;
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10 space-y-6">
        <div className="flex justify-between items-center px-1">
          <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600`}>Physical Reset</h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Step {step + 1} of 4</span>
        </div>
        <div className="flex gap-2">
          {STEPS.map((s, i) => (
            <div key={i} className="flex-1 flex flex-col gap-2">
              <div 
                className={`h-2 rounded-full transition-all duration-700 ${
                  i < step ? 'bg-emerald-500' : i === step ? 'bg-emerald-500' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              />
              <span className={`text-[8px] font-black uppercase tracking-tighter text-center transition-opacity duration-500 ${i === step ? 'opacity-100' : 'opacity-40 text-slate-400'}`}>
                {s.title.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={`bg-white dark:bg-slate-900 rounded-[40px] p-10 border-4 border-slate-100 dark:border-slate-800 shadow-xl text-center relative overflow-hidden`}>
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 opacity-50 blur-3xl bg-emerald-50`} />
        
        <div className="relative z-10 space-y-8">
          <div className="flex justify-center items-start mb-4">
             <div className="flex flex-col items-center flex-grow">
                <div className={`w-24 h-24 rounded-3xl flex items-center justify-center text-6xl font-black shadow-inner mb-4 bg-emerald-100 text-emerald-600 border border-emerald-100`}>
                  {current.icon}
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">{current.title}</h2>
             </div>
             {onAskGuide && (
                <button 
                  onClick={onAskGuide}
                  className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800 shadow-sm"
                >
                  Ask Guide
                </button>
              )}
          </div>

          <div className={`p-8 rounded-[32px] border bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-inner`}>
            <p className={`font-bold italic text-base leading-relaxed text-slate-800 dark:text-slate-200`}>
              <span className={`font-black uppercase text-[9px] tracking-widest block mb-2 text-emerald-600`}>Biological Insight</span>
              "{current.guidance}"
            </p>
          </div>

          <div className="py-2 space-y-6">
            <p className={`text-2xl font-black leading-relaxed text-slate-900 dark:text-white`}>
              {current.prompt}
            </p>
          </div>

          <button
            onClick={handleNext}
            className={`w-full py-6 font-black rounded-3xl shadow-xl transition-all uppercase tracking-widest text-sm bg-emerald-600 text-white shadow-emerald-600/30 hover:bg-emerald-700`}
          >
            {step === STEPS.length - 1 ? "I feel more grounded" : "Skip to Next Step"}
          </button>
          
          <div className="flex justify-center gap-4">
            <button onClick={() => onExit()} className="text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-600 transition-colors">Terminate Protocol</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TippSkill;
