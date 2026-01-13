
import React, { useState } from 'react';
import { getModuleReflection } from '../geminiService';
import ModuleReflection from './ModuleReflection';
import SpeakButton from './SpeakButton';

const AssertivenessTool: React.FC<{ onExit: (rating?: number, reflection?: string) => void }> = ({ onExit }) => {
  const [view, setView] = useState<'intro' | 'builder' | 'reflection'>('intro');
  const [step, setStep] = useState(0);
  const [inputs, setInputs] = useState({ fact: '', emotion: '', change: '', selfcare: '' });

  const builderSteps = [
    { key: 'fact', label: 'I Think [Fact]', prompt: 'Describe the objective situation without judgment.', placeholder: 'e.g. "You have asked me to come to a party where I know alcohol will be served..."' },
    { key: 'emotion', label: 'I Feel [Emotion]', prompt: 'Express your feeling clearly without blaming.', placeholder: 'e.g. "I feel anxious and concerned about my sobriety commitment..."' },
    { key: 'change', label: 'I Want [Change]', prompt: 'Ask for a specific behavioral change or state your "No".', placeholder: 'e.g. "I want to decline the invitation this time..."' },
    { key: 'selfcare', label: 'Self-Care Solution', prompt: 'What will you do if they say no or push back?', placeholder: 'e.g. "If you continue to pressure me, I will need to hang up the phone to protect my peace."' }
  ];

  const handleNext = () => {
    if (step < builderSteps.length - 1) setStep(step + 1);
    else handleFinish();
  };

  const handleFinish = async () => {
    const summary = `Fact: ${inputs.fact}. Emotion: ${inputs.emotion}. Change: ${inputs.change}. Self-care: ${inputs.selfcare}`;
    const res = await getModuleReflection("Assertiveness Script Builder", `User built a script: ${summary}`);
    onExit(5, res);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 animate-in fade-in duration-700 pb-40">
      {view === 'intro' ? (
        <div className="bg-white dark:bg-slate-900 rounded-[50px] p-8 md:p-12 border-2 border-slate-200 dark:border-slate-800 shadow-xl space-y-10 relative overflow-hidden">
          <header className="space-y-4">
            <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-3xl text-white shadow-xl">🛡️</div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Saying No & Setting Boundaries</h2>
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-black uppercase text-indigo-600 mb-2 tracking-widest">The 'Why'</h3>
              <p className="text-slate-700 dark:text-slate-300 font-medium">
                Recovering addicts often struggle with boundaries. Aggression destroys relationships, while passivity leads to resentment and relapse. Assertiveness is the middle ground that allows you to protect your path with dignity.
              </p>
            </div>
          </header>

          <div className="space-y-6">
             <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">The 'When'</h4>
             <p className="text-slate-500 font-bold italic px-2">Use when refusing drugs/alcohol, setting boundaries with toxic friends, or asking for support.</p>
          </div>

          <button 
            onClick={() => setView('builder')}
            className="w-full py-6 bg-indigo-600 text-white font-black rounded-3xl shadow-xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs"
          >
            Start Script Builder
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[60px] p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-12">
           <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-xl flex items-center justify-center text-2xl font-black text-indigo-600">
                 {builderSteps[step].label.charAt(2)}
              </div>
              <div className="flex gap-2">
                 {builderSteps.map((_, i) => (
                   <div key={i} className={`h-1 w-8 rounded-full ${i <= step ? 'bg-indigo-600' : 'bg-slate-100'}`} />
                 ))}
              </div>
           </div>

           <div className="space-y-6">
              <h3 className="text-3xl font-black text-slate-800 dark:text-white">{builderSteps[step].label}</h3>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed italic border-l-4 border-indigo-500 pl-6">"{builderSteps[step].prompt}"</p>
              <textarea 
                autoFocus
                key={step}
                value={inputs[builderSteps[step].key as keyof typeof inputs]}
                onChange={(e) => setInputs({...inputs, [builderSteps[step].key]: e.target.value})}
                className="w-full h-40 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-3xl p-8 text-lg font-bold shadow-inner focus:border-indigo-500 outline-none transition-all"
                placeholder={builderSteps[step].placeholder}
              />
           </div>

           <div className="flex gap-4">
              {step > 0 && <button onClick={() => setStep(step - 1)} className="px-8 py-5 text-slate-500 font-black uppercase text-[10px] tracking-widest">Back</button>}
              <button 
                onClick={handleNext}
                disabled={!inputs[builderSteps[step].key as keyof typeof inputs].trim()}
                className="flex-grow py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs"
              >
                {step === builderSteps.length - 1 ? "Archive Final Script" : "Next Step"}
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default AssertivenessTool;
