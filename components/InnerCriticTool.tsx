
import React, { useState } from 'react';
import { getModuleReflection } from '../geminiService';
import ModuleReflection from './ModuleReflection';
import SpeakButton from './SpeakButton';

const InnerCriticTool: React.FC<{ onExit: (rating?: number, reflection?: string) => void, onAskGuide?: () => void }> = ({ onExit, onAskGuide }) => {
  const [step, setStep] = useState(0);
  const [inputs, setInputs] = useState({ thought: '', evidence: '', reframing: '' });
  const [isListening, setIsListening] = useState(false);
  const [reflection, setReflection] = useState('');
  const [showReflection, setShowReflection] = useState(false);

  const steps = [
    { 
      key: 'thought', 
      title: 'Identify the Voice', 
      prompt: 'What is the current negative message your inner critic is feeding you? (e.g., "I\'ll never succeed")', 
      icon: '🎙️' 
    },
    { 
      key: 'evidence', 
      title: 'Question the Validity', 
      prompt: 'Is this thought based on facts or assumptions? What evidence do you have that supports or refutes this belief?', 
      subPrompt: 'Now, list specific facts that directly contradict this negative thought. What has actually happened that proves this voice wrong?',
      icon: '⚖️' 
    },
    { 
      key: 'reframing', 
      title: 'Compassionate Reframing', 
      prompt: 'Rephrase the negative thought into a more realistic and balanced perspective.', 
      icon: '🔄' 
    }
  ];

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }
    
    if (isListening) {
      setIsListening(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = 'en-GB';
    rec.interimResults = false;
    
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    
    rec.onresult = (e: any) => {
      const key = steps[step].key as keyof typeof inputs;
      const t = e.results[0][0].transcript;
      setInputs(prev => ({ ...prev, [key]: prev[key] ? `${prev[key]} ${t}` : t }));
    };
    
    rec.start();
  };

  const handleNext = async () => {
    if (step < steps.length - 1) setStep(step + 1);
    else {
      const res = await getModuleReflection("Inner Critic Challenge", `User challenged a critical thought: "${inputs.thought}". Reframed to: "${inputs.reframing}"`);
      setReflection(res);
      setShowReflection(true);
    }
  };

  if (showReflection) return <ModuleReflection moduleName="Inner Critic Challenge" context="Cognitive restructuring session completed." initialReflection={reflection} onClose={onExit} title="Critic Challenged" />;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Progress Bar */}
      <div className="flex gap-3 px-2">
        {steps.map((_, i) => (
          <div 
            key={i} 
            className={`h-2.5 flex-grow rounded-full transition-all duration-700 relative overflow-hidden ${
              i < step ? 'bg-slate-800' : i === step ? 'bg-slate-200' : 'bg-slate-100'
            }`}
          >
            {i === step && (
              <div className="absolute inset-0 bg-slate-800 animate-[shimmer_2s_infinite] origin-left"></div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 dark:bg-slate-900/50 rounded-full -mr-16 -mt-16 opacity-50" />
        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-4xl shadow-inner">
                  <span className="animate-in zoom-in duration-500">{steps[step].icon}</span>
               </div>
               <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{steps[step].title}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Step {step + 1} of {steps.length}</span>
                    <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
                    <span className="text-teal-600 text-[10px] font-bold uppercase tracking-widest">Active</span>
                  </div>
               </div>
            </div>
            <div className="flex items-center gap-2">
              <SpeakButton text={steps[step].prompt} />
              {onAskGuide && (
                <button 
                  onClick={onAskGuide}
                  className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800 shadow-sm transition-all hover:scale-105 active:scale-95"
                >
                  Ask Guide
                </button>
              )}
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-slate-600 dark:text-slate-300 text-lg font-medium leading-relaxed">{steps[step].prompt}</p>
            {(steps[step] as any).subPrompt && (
              <div className="flex items-center gap-3">
                <p className="text-teal-600 text-sm font-bold italic animate-in slide-in-from-left-2">
                  ✨ {(steps[step] as any).subPrompt}
                </p>
                <SpeakButton text={(steps[step] as any).subPrompt} size={12} />
              </div>
            )}
          </div>
          
          <div className="relative group">
            <textarea
              value={inputs[steps[step].key as keyof typeof inputs]}
              onChange={(e) => setInputs({ ...inputs, [steps[step].key]: e.target.value })}
              className={`w-full h-48 bg-slate-50 dark:bg-slate-800 border-2 rounded-3xl p-6 focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-800 text-slate-700 dark:text-white resize-none transition-all duration-300 ${isListening ? 'border-rose-400 ring-4 ring-rose-50' : 'border-transparent'}`}
              placeholder={isListening ? "I'm listening to you..." : "Type or record the voice here..."}
            />
            
            <div className="absolute bottom-4 right-4 flex items-center gap-3">
              {isListening && (
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest animate-pulse">
                  Listening...
                </span>
              )}
              <button 
                onClick={toggleListening} 
                className={`p-4 rounded-2xl transition-all z-20 relative flex items-center justify-center ${
                  isListening 
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-110' 
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 hover:scale-105'
                }`}
                title="Voice Input"
              >
                {isListening && (
                  <>
                    <span className="absolute inset-0 rounded-2xl bg-rose-500 animate-ping opacity-50"></span>
                    <span className="absolute -inset-1 rounded-2xl border-2 border-rose-500/50 animate-pulse"></span>
                  </>
                )}
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 relative z-10 ${isListening ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 006 0V5a3 3 0 00-3-3z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            {step > 0 && <button onClick={() => setStep(step - 1)} className="px-8 py-5 text-slate-500 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800">Back</button>}
            <button onClick={handleNext} className="flex-grow py-5 bg-slate-800 dark:bg-slate-700 text-white font-bold rounded-2xl shadow-lg hover:bg-slate-900 transition-all active:scale-[0.98]">
              {step === 2 ? "Finalize Reframing" : "Next Step"}
            </button>
          </div>
        </div>
      </div>
      <p className="text-center text-slate-400 text-xs font-medium italic">"Challenging the inner critic is the first step to building authentic self-esteem."</p>
    </div>
  );
};

export default InnerCriticTool;
