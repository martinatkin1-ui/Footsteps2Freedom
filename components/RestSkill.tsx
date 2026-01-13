
import React, { useState } from 'react';
import ModuleReflection from './ModuleReflection';
import SpeakButton from './SpeakButton';

const SCENARIOS = [
  { id: 'craving', label: 'Sudden Craving', desc: 'When you feel a high-intensity urge to use or return to an old pattern.' },
  { id: 'anger', label: 'Sudden Anger', desc: 'When conflict arises with a loved one and you feel like lashing out.' },
  { id: 'pain', label: 'Withdrawal/Physical Pain', desc: 'When physical discomfort starts to cloud your logical judgment.' }
];

const STEPS = [
  { id: 'R', title: 'Relax', icon: '💆', guidance: 'Stop what you are doing. Freeze. Take a breath. Pause. Just don\'t do what you normally do. Create space between the desire and the reaction.' },
  { id: 'E', title: 'Evaluate', icon: '⚖️', guidance: 'Ask: What is the truth of this moment? Am I in danger? What are the facts? Observe your physical and emotional sensations without judging them.' },
  { id: 'S', title: 'Set an Intention', icon: '🎯', guidance: 'What do you need right now? Choose a coping skill or a values-based goal. It doesn\'t have to be the final solution, just a healthy next step.' },
  { id: 'T', title: 'Take Action', icon: '✅', guidance: 'Put your plan into motion mindfully. Move ahead slowly and with awareness. Act from your True-Self, not your impulsive Using-Self.' }
];

const RestSkill: React.FC<{ onExit: (rating?: number, refl?: string) => void }> = ({ onExit }) => {
  const [view, setView] = useState<'intro' | 'simulation' | 'reflection'>('intro');
  const [step, setStep] = useState(0);
  const [inputs, setInputs] = useState<string[]>(Array(4).fill(''));

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else setView('reflection');
  };

  if (view === 'reflection') {
    return <ModuleReflection 
      moduleName="REST Strategy" 
      context={`User simulated a response to a trigger. REST Inputs: ${inputs.join(' | ')}`} 
      onClose={onExit} 
    />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-700 pb-32">
      {view === 'intro' ? (
        <div className="bg-white dark:bg-slate-900 rounded-[50px] p-8 md:p-12 border-4 border-teal-50 dark:border-slate-800 shadow-2xl space-y-10 relative overflow-hidden">
          <header className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-teal-600 rounded-3xl flex items-center justify-center text-4xl text-white shadow-xl">🛑</div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Stop the Slide: The REST Strategy</h2>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-black uppercase text-teal-600 mb-2 tracking-widest">The 'Why'</h3>
              <p className="text-slate-700 dark:text-slate-300 font-medium">
                In addiction recovery, the time between a trigger and a reaction (relapse) is often instant. REST is a distress tolerance strategy designed to buy you time and prevent impulsive self-destructive behaviors by creating space between the urge and the action.
              </p>
            </div>
          </header>
          
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase text-teal-600 px-2 tracking-widest">When to use:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SCENARIOS.map(s => (
                <div key={s.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <h4 className="text-xs font-black uppercase text-slate-800 dark:text-white mb-1">{s.label}</h4>
                  <p className="text-[10px] text-slate-500 italic leading-relaxed">"{s.desc}"</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase text-teal-600 px-2 tracking-widest">How it works:</h3>
            <div className="grid grid-cols-2 gap-4">
              {STEPS.map(s => (
                <div key={s.id} className="flex items-center gap-3 p-3 bg-teal-50 dark:bg-teal-900/10 rounded-2xl border border-teal-100 dark:border-teal-900/30">
                  <span className="text-2xl">{s.icon}</span>
                  <div className="flex flex-col">
                    <span className="font-black text-teal-700 dark:text-teal-400">{s.id}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{s.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => setView('simulation')}
            className="w-full py-6 bg-teal-600 text-white font-black rounded-3xl shadow-xl hover:bg-teal-700 transition-all uppercase tracking-widest text-sm"
          >
            Start Interaction Simulation
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          <div className="flex gap-4 px-2">
            {STEPS.map((s, i) => (
              <div key={i} className={`h-2 flex-grow rounded-full transition-all duration-700 ${i <= step ? 'bg-teal-600 shadow-md' : 'bg-slate-200 dark:bg-slate-800'}`} />
            ))}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[50px] p-8 md:p-12 border border-slate-100 dark:border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="bg-rose-50 dark:bg-rose-950/20 p-6 rounded-3xl border border-rose-100 dark:border-rose-900/30 mb-8">
               <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-rose-600 mb-2">Scenario Simulation</h4>
               <p className="text-lg font-bold text-slate-800 dark:text-slate-100">"You have just walked past your old dealer's house. You feel the pulse in your throat and the urge to look back."</p>
            </div>

            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-16 bg-teal-600 text-white rounded-2xl flex items-center justify-center text-3xl shadow-xl">{STEPS[step].icon}</div>
              <div>
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic">{STEPS[step].title}</h3>
                 <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Step {step + 1} of 4</span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-inner mb-8">
                <p className="text-slate-600 dark:text-slate-300 font-bold italic leading-relaxed">
                  "{STEPS[step].guidance}"
                </p>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Your Simulation Response</label>
              <textarea
                autoFocus
                key={step}
                value={inputs[step]}
                onChange={(e) => {
                  const next = [...inputs];
                  next[step] = e.target.value;
                  setInputs(next);
                }}
                placeholder="What action do you take for this step?"
                className="w-full h-32 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-teal-500 rounded-3xl p-6 text-slate-800 dark:text-white font-medium resize-none shadow-inner outline-none transition-all"
              />
            </div>

            <div className="flex gap-4 mt-8">
              {step > 0 && <button onClick={() => setStep(step - 1)} className="px-8 py-5 text-slate-500 font-black rounded-2xl uppercase tracking-widest text-[10px]">Back</button>}
              <button 
                onClick={handleNext} 
                disabled={!inputs[step].trim()}
                className="flex-grow py-5 bg-teal-600 text-white font-black rounded-2xl shadow-xl hover:bg-teal-700 active:scale-95 disabled:opacity-30 transition-all uppercase tracking-widest text-xs"
              >
                {step === 3 ? "Finalize Protocol" : "Next Step"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestSkill;
