
import React, { useState } from 'react';
import { getModuleReflection } from '../geminiService';
import ModuleReflection from './ModuleReflection';

const STEPS = [
  { id: 1, title: 'Future-Self Archetype', prompt: 'Visualize your future-self 1 year from now. What is this ideal version of you doing differently?', icon: '🏁' },
  { id: 2, title: 'Start Timing', prompt: 'When do you need to leave or start working on this to hit that goal?', icon: '⏰' },
  { id: 3, title: 'Required Items', prompt: 'What specific items or resources do you need to reach this solution?', icon: '🎒' },
  { id: 4, title: 'Anticipated Obstacles', prompt: 'What obstacles might get in your way towards this goal?', icon: '🚧' },
  { id: 5, title: 'Preparation', prompt: 'What else might you need to prepare for reaching your solution?', icon: '🛡️' }
];

interface WorkingBackwardsProps {
  onComplete: (rating?: number) => void;
  onAskGuide?: () => void;
}

const WorkingBackwards: React.FC<WorkingBackwardsProps> = ({ onComplete, onAskGuide }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(Array(5).fill(''));
  const [showReflection, setShowReflection] = useState(false);
  const [reflection, setReflection] = useState('');
  const [isListening, setIsListening] = useState(false);

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (isListening) {
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-GB';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const nd = [...data];
      nd[step] = nd[step] ? `${nd[step]} ${transcript}` : transcript;
      setData(nd);
    };
    recognition.start();
  };

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const res = await getModuleReflection("Backward Planning", `Goal: ${data[0]}. Start: ${data[1]}. Obstacles: ${data[3]}.`);
      setReflection(res);
      setShowReflection(true);
    }
  };

  if (showReflection) return <ModuleReflection moduleName="Backward Planning" context="Future blueprint crystallised." reflection={reflection} onClose={onComplete} title="Plan Crystallised" />;

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in duration-500 pb-32">
      <div className="flex justify-between items-center px-4">
        <div className="flex gap-2 flex-grow max-w-xs">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-2 flex-grow rounded-full transition-all duration-700 ${i <= step ? 'bg-teal-600 shadow-sm' : 'bg-slate-200 dark:bg-slate-800'}`} />
          ))}
        </div>
        {onAskGuide && (
          <button 
            onClick={onAskGuide}
            className="ml-6 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800 shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            Ask Guide
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 md:p-16 border-2 border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-500 to-indigo-600" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/5 rounded-full -mr-40 -mt-40 blur-3xl opacity-60" />
        
        <div className="relative z-10 space-y-10 pt-6">
          <div className="flex items-center gap-8">
             <div className="w-20 h-20 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-[28px] flex items-center justify-center text-4xl shadow-inner border-2 border-teal-100 dark:border-teal-800 font-black animate-in zoom-in duration-500">
               {STEPS[step].icon}
             </div>
             <div className="space-y-1">
                <span className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-[0.4em]">Strategic Mapping</span>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{STEPS[step].title}</h2>
             </div>
          </div>

          <p className="text-slate-700 dark:text-slate-200 text-2xl font-bold leading-relaxed italic border-l-4 border-slate-100 dark:border-slate-800 pl-8">
            "{STEPS[step].prompt}"
          </p>

          <div className="relative group/input">
            <textarea 
              autoFocus
              value={data[step]}
              onChange={(e) => {
                const nd = [...data];
                nd[step] = e.target.value;
                setData(nd);
              }}
              placeholder={isListening ? "Listening to your plan..." : "Input strategic details..."}
              className={`w-full h-64 bg-slate-50 dark:bg-slate-800/50 border-2 rounded-[32px] p-10 text-slate-800 dark:text-white text-xl font-medium shadow-inner transition-all duration-500 resize-none ${
                isListening 
                  ? 'border-rose-400 bg-rose-50/20 ring-8 ring-rose-500/10' 
                  : 'border-slate-100 dark:border-slate-700 group-hover/input:bg-white dark:group-hover/input:bg-slate-800'
              }`}
            />
            <button
              onClick={toggleListening}
              className={`absolute bottom-8 right-8 p-5 rounded-2xl shadow-2xl transition-all active:scale-90 z-20 ${
                isListening 
                  ? 'bg-rose-500 text-white animate-pulse' 
                  : 'bg-white dark:bg-slate-700 text-teal-600 shadow-teal-500/20 hover:scale-110'
              }`}
              title="Vocalise Insight"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isListening ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 006 0V5a3 3 0 00-3-3z" />
              </svg>
            </button>
          </div>

          <div className="flex gap-4">
             {step > 0 && (
               <button onClick={() => setStep(step - 1)} className="px-10 py-6 text-slate-500 dark:text-slate-400 font-black rounded-3xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all uppercase text-[11px] tracking-widest">Back</button>
             )}
             <button 
                onClick={handleNext}
                disabled={!data[step].trim() || isListening}
                className={`flex-grow py-6 rounded-3xl font-black text-sm uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-[0.98] ${
                  data[step].trim() && !isListening
                    ? 'bg-teal-600 text-white shadow-teal-600/30 hover:bg-teal-700'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                {step === 4 ? "Finalise Blueprint" : "Next Step"}
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkingBackwards;
