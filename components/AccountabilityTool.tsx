
import React, { useState } from 'react';
import { getModuleReflection } from '../geminiService';
import ModuleReflection from './ModuleReflection';
import SpeakButton from './SpeakButton';

const STEPS = [
  { 
    title: 'Defining Accountability', 
    prompt: 'In your own words, what does being "accountable" mean to you in your recovery?', 
    icon: '⚖️',
    placeholder: 'Accountability means...'
  },
  { 
    title: 'Personal Responsibility', 
    prompt: 'How do you distinguish between your personal responsibility and external factors that influence your actions?', 
    icon: '🛡️',
    placeholder: 'I recognize that while I cannot control the weather, I can control...'
  },
  { 
    title: 'Owning Outcomes', 
    prompt: 'Reflect on a time you took ownership of a mistake. How did that shape your path?', 
    icon: '🗝️',
    placeholder: 'I remember when I...'
  },
  { 
    title: 'Action Steps', 
    prompt: 'Identify one area where you want to enhance accountability this week (e.g. meetings, self-care). How will you stay on track?', 
    icon: '🎯',
    placeholder: 'I will hold myself accountable by...'
  }
];

const AccountabilityTool: React.FC<{ onExit: (rating?: number, reflection?: string) => void, onAskGuide?: () => void }> = ({ onExit, onAskGuide }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(Array(STEPS.length).fill(''));
  const [isListening, setIsListening] = useState(false);
  const [reflection, setReflection] = useState('');
  const [showReflection, setShowReflection] = useState(false);

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (isListening) { setIsListening(false); return; }
    const rec = new SpeechRecognition();
    rec.lang = 'en-GB';
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      const next = [...data];
      next[step] = next[step] ? `${next[step]} ${t}` : t;
      setData(next);
    };
    rec.start();
  };

  const handleNext = async () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else {
      const res = await getModuleReflection("Accountability Journey", `User reflected on personal responsibility. Goal area: ${data[3]}`);
      setReflection(res);
      setShowReflection(true);
    }
  };

  if (showReflection) return <ModuleReflection moduleName="Accountability Journey" context="Ownership session completed." initialReflection={reflection} onClose={onExit} title="Accountability Complete" />;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 dark:bg-teal-900/10 rounded-full -mr-16 -mt-16 opacity-50" />
        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <span className="text-5xl">{STEPS[step].icon}</span>
               <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{STEPS[step].title}</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Step {step + 1} of 4</p>
               </div>
            </div>
            <div className="flex items-center gap-2">
              <SpeakButton text={STEPS[step].prompt} />
              {onAskGuide && (
                <button 
                  onClick={onAskGuide}
                  className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800 shadow-sm transition-all hover:scale-105"
                >
                  Ask Guide
                </button>
              )}
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-lg font-medium leading-relaxed">{STEPS[step].prompt}</p>
          <div className="relative">
            <textarea
              value={data[step]}
              onChange={(e) => {
                const next = [...data];
                next[step] = e.target.value;
                setData(next);
              }}
              className="w-full h-48 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl p-6 focus:ring-2 focus:ring-teal-500 text-slate-700 dark:text-white resize-none transition-all"
              placeholder={STEPS[step].placeholder}
            />
            <button
              onClick={toggleListening}
              className={`absolute bottom-4 right-4 p-4 rounded-full transition-all z-20 ${isListening ? 'bg-rose-100 text-rose-600' : 'bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-400'}`}
            >
              {isListening && <span className="absolute inset-0 rounded-full bg-rose-400 animate-ping opacity-30" />}
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 relative z-10 ${isListening ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 006 0V5a3 3 0 00-3-3z" /></svg>
            </button>
          </div>
          <div className="flex gap-4">
            {step > 0 && <button onClick={() => setStep(step - 1)} className="px-8 py-5 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800">Back</button>}
            <button
              onClick={handleNext}
              className="flex-grow py-5 bg-teal-600 text-white font-bold rounded-2xl shadow-lg hover:bg-teal-700"
            >
              {step === 3 ? "Finalize" : "Next Step"}
            </button>
          </div>
          <button onClick={() => onExit()} className="w-full text-slate-400 font-bold text-sm">Cancel Tool</button>
        </div>
      </div>
    </div>
  );
};

export default AccountabilityTool;
