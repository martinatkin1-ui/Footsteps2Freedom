
import React, { useState } from 'react';
import { getModuleReflection } from '../geminiService';
import ModuleReflection from './ModuleReflection';
import SpeakButton from './SpeakButton';

const STEPS = [
  { id: 'A', label: 'Activating Event', prompt: 'What happened? Describe the objective facts of the situation that triggered the distress.', icon: '🎬' },
  { id: 'B', label: 'Beliefs', prompt: 'What was your automatic internal reaction? What "rules" or "shoulds" were running through your mind?', icon: '💭' },
  { id: 'C', label: 'Consequences', prompt: 'How did those beliefs make you feel emotionally and physically? What did you feel like doing?', icon: '🌊' },
  { id: 'D', label: 'Dispute & Challenge', prompt: 'Look for evidence. Is there a thinking error (Catastrophising, All-or-Nothing)? What is the counter-evidence?', icon: '🔍' },
  { id: 'E', label: 'Effective New Belief', prompt: 'Replace the original belief with a more balanced, factual perspective. How do you feel now?', icon: '🌱' }
];

interface CognitiveReframingProps {
  onExit: () => void;
  onAskGuide?: () => void;
}

const CognitiveReframing: React.FC<CognitiveReframingProps> = ({ onExit, onAskGuide }) => {
  const [step, setStep] = useState(0);
  const [inputs, setInputs] = useState(Array(STEPS.length).fill(''));
  const [reflection, setReflection] = useState('');
  const [showReflection, setShowReflection] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (isListening) { setIsListening(false); return; }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-GB';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const next = [...inputs];
      next[step] = next[step] ? `${next[step]} ${transcript}` : transcript;
      setInputs(next);
    };
    recognition.start();
  };

  const handleNext = async () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else {
      const res = await getModuleReflection("ABCDE Thought Record", `User reframed a situation. Event: "${inputs[0]}". Balanced belief: "${inputs[4]}"`);
      setReflection(res);
      setShowReflection(true);
    }
  };

  if (showReflection) return <ModuleReflection reflection={reflection} onClose={onExit} title="Cognitive Integration Complete" />;

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in duration-500 pb-32">
      {/* Progress Bar */}
      <div className="flex gap-3 px-2">
        {STEPS.map((_, i) => (
          <div 
            key={i} 
            className={`h-2.5 flex-grow rounded-full transition-all duration-700 relative overflow-hidden ${
              i <= step ? 'bg-orange-600 shadow-sm' : 'bg-slate-100 dark:bg-slate-800'
            }`}
          />
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 md:p-16 border-2 border-slate-100 dark:border-slate-800 shadow-xl space-y-12 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full -mr-40 -mt-40 blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between relative z-10">
           <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-[28px] flex items-center justify-center text-4xl font-black shadow-inner border-2 border-orange-100 dark:border-orange-800 group-hover:scale-110 transition-transform">
                {STEPS[step].id}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-[0.4em] mb-1">Process Node</span>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white leading-tight tracking-tight">{STEPS[step].label}</h2>
              </div>
           </div>
           <div className="flex items-center gap-2">
             <SpeakButton text={STEPS[step].prompt} />
             {onAskGuide && (
                <button 
                  onClick={onAskGuide}
                  className="hidden sm:block px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800 shadow-sm transition-all hover:scale-105 active:scale-95 animate-pulse"
                >
                  Ask Guide
                </button>
              )}
           </div>
        </div>

        <div className="space-y-6 relative z-10">
           <p className="text-slate-700 dark:text-slate-200 text-2xl font-bold leading-relaxed max-w-xl italic border-l-4 border-slate-100 dark:border-slate-800 pl-8">
             "{STEPS[step].prompt}"
           </p>
        </div>

        <div className="relative z-10 group/input">
          <textarea
            autoFocus
            value={inputs[step]}
            onChange={(e) => {
              const next = [...inputs];
              next[step] = e.target.value;
              setInputs(next);
            }}
            placeholder={isListening ? "Listening deeply to your thoughts..." : "Document the truth here..."}
            className={`w-full h-64 bg-slate-50 dark:bg-slate-800/50 border-2 rounded-[40px] p-10 focus:ring-8 focus:ring-orange-500/10 text-slate-700 dark:text-white text-xl font-medium leading-relaxed resize-none transition-all duration-500 shadow-inner ${isListening ? 'border-rose-400 bg-rose-50/20' : 'border-slate-100 dark:border-slate-700 group-hover/input:bg-white dark:group-hover/input:bg-slate-800'}`}
          />
          <button
            onClick={toggleListening}
            className={`absolute bottom-8 right-8 p-5 rounded-2xl shadow-2xl transition-all z-20 ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-orange-500/20 hover:scale-110'}`}
            title="Voice Input"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 006 0V5a3 3 0 00-3-3z" /></svg>
          </button>
        </div>

        <div className="flex gap-6 relative z-10">
          {step > 0 && (
            <button 
              onClick={() => setStep(step - 1)} 
              className="px-10 py-6 text-slate-500 dark:text-slate-400 font-black rounded-3xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all uppercase text-[11px] tracking-widest"
            >
              Back
            </button>
          )}
          <button 
            onClick={handleNext} 
            disabled={!inputs[step].trim() || isListening} 
            className={`flex-grow py-6 font-black rounded-3xl shadow-xl uppercase text-xs tracking-[0.4em] transition-all active:scale-[0.98] ${(inputs[step].trim() && !isListening) ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-600/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-700'}`}
          >
            {step === STEPS.length - 1 ? "Archive Balanced Thought" : "Proceed to Analysis"}
          </button>
        </div>
      </div>
      
      <div className="bg-slate-900 rounded-[48px] p-10 text-white flex gap-8 items-center shadow-2xl border-b-[12px] border-slate-800 ring-1 ring-white/5">
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl shrink-0 backdrop-blur-md">🔍</div>
        <p className="text-base text-slate-300 leading-relaxed font-medium italic">
          "The aim of a thought record is not to think positively, but to think realistically. Truth is the foundation of the True-Self."
        </p>
      </div>
    </div>
  );
};

export default CognitiveReframing;
