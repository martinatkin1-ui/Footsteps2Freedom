
import React, { useState } from 'react';
import { PERSONAL_VALUES_LIST } from '../constants';
import { getModuleReflection } from '../geminiService';
import ModuleReflection from './ModuleReflection';
import SpeakButton from './SpeakButton';

const STRENGTHS_GUIDANCE = [
  "What is one challenge you've navigated recently with courage?",
  "Think of a moment you were genuinely kind to yourself this week.",
  "What skills or resilience have you built since taking your first step?",
  "How would a trusted friend describe your best qualities?"
];

const VISION_GUIDANCE = [
  "Imagine a typical 'Peaceful Tuesday'—what are you doing?",
  "Who is in your inner circle in this ideal future?",
  "What values are you living out most clearly in this vision?",
  "How does your body feel in a life completely free from old patterns?"
];

const SelfEsteemFoundations: React.FC<{ onExit: (rating?: number, reflection?: string) => void, onAskGuide?: () => void }> = ({ onExit, onAskGuide }) => {
  const [step, setStep] = useState(0);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [strengths, setStrengths] = useState('');
  const [vision, setVision] = useState('');
  const [reflection, setReflection] = useState('');
  const [showReflection, setShowReflection] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const toggleValue = (v: string) => {
    if (selectedValues.includes(v)) setSelectedValues(prev => prev.filter(i => i !== v));
    else if (selectedValues.length < 5) setSelectedValues(prev => [...prev, v]);
  };

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
      if (step === 1) setStrengths(prev => prev ? `${prev} ${transcript}` : transcript);
      else if (step === 2) setVision(prev => prev ? `${prev} ${transcript}` : transcript);
    };
    recognition.start();
  };

  const handleFinish = async () => {
    const res = await getModuleReflection("Self-Esteem Foundations", `User identified values: ${selectedValues.join(', ')}. Strengths: ${strengths}. Future Vision: ${vision}`);
    setReflection(res);
    setShowReflection(true);
  };

  if (showReflection) return <ModuleReflection moduleName="Self-Esteem Foundations" context="True-Self exploration completed." initialReflection={reflection} onClose={onExit} title="True-Self Rooted" />;

  if (step === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
        <div className="text-center space-y-4">
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-white tracking-tighter">Identity Landmarks</h2>
            <div className="flex items-center gap-2">
              <SpeakButton text="Identity Landmarks. Select up to 5 values that will serve as the compass for your True-Self. These values are the bedrock of your self-esteem." />
              {onAskGuide && (
                <button 
                  onClick={onAskGuide}
                  className="mt-1 px-6 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800 shadow-sm transition-all hover:scale-105 active:scale-95"
                >
                  Need Clarity? Ask Guide
                </button>
              )}
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-lg max-w-2xl mx-auto">"Select up to 5 values that will serve as the compass for your True-Self."</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {PERSONAL_VALUES_LIST.map((v) => (
            <button
              key={v}
              onClick={() => toggleValue(v)}
              className={`p-6 rounded-[32px] border-2 transition-all font-black text-xs uppercase tracking-widest ${selectedValues.includes(v) ? 'bg-teal-600 border-teal-600 text-white shadow-xl scale-105' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-teal-200'}`}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="flex justify-center pt-12">
          <button 
            onClick={() => setStep(1)} 
            disabled={selectedValues.length === 0} 
            className={`px-16 py-6 rounded-[32px] font-black uppercase tracking-[0.2em] text-xs transition-all shadow-2xl ${selectedValues.length > 0 ? 'bg-teal-600 text-white hover:bg-teal-700 active:scale-95' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
          >
            Advance to Exploration
          </button>
        </div>
      </div>
    );
  }

  const currentGuidance = step === 1 ? STRENGTHS_GUIDANCE : VISION_GUIDANCE;

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-in slide-in-from-right-4 duration-700 pb-32">
       <div className="bg-white dark:bg-slate-900 rounded-[56px] p-10 md:p-16 border-2 border-slate-100 dark:border-slate-800 shadow-2xl space-y-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
          
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-[0.4em]">Exploration Mode</span>
                <div className="h-px bg-slate-100 dark:bg-slate-800 flex-grow" />
             </div>
             <div className="flex items-center gap-3">
              <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                  {step === 1 ? "Strengths & Glimmers" : "Vision for Tomorrow"}
              </h3>
              <SpeakButton text={step === 1 ? "Acknowledge the parts of your True-Self that have survived and thrived. What resilience is already present?" : "Allow your mind to drift toward a life built on your values. What does freedom look like for you?"} />
             </div>
             <p className="text-slate-500 dark:text-slate-300 text-lg font-medium leading-relaxed italic border-l-4 border-teal-500/20 pl-6">
                {step === 1 
                  ? "Acknowledge the parts of your True-Self that have survived and thrived. What resilience is already present?" 
                  : "Allow your mind to drift toward a life built on your values. What does freedom look like for you?"}
             </p>
          </div>

          {/* Contextual Guidance Prompts */}
          <div className="bg-slate-50 dark:bg-slate-950 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 space-y-6">
             <h4 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] mb-4">Suggested Inquiries</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentGuidance.map((q, i) => (
                  <div key={i} className="flex gap-3 items-start group cursor-default">
                    <span className="text-teal-500 font-bold group-hover:animate-pulse">✨</span>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic">"{q}"</p>
                    <SpeakButton text={q} size={8} className="opacity-0 group-hover:opacity-100" />
                  </div>
                ))}
             </div>
          </div>

          <div className="relative group">
            <textarea
              autoFocus
              value={step === 1 ? strengths : vision}
              onChange={(e) => step === 1 ? setStrengths(e.target.value) : setVision(e.target.value)}
              className={`w-full h-72 bg-slate-50 dark:bg-slate-950 border-2 rounded-[40px] p-10 focus:ring-8 focus:ring-teal-500/10 text-slate-800 dark:text-white text-xl font-medium leading-relaxed resize-none transition-all duration-500 shadow-inner ${isListening ? 'border-rose-400 ring-rose-100' : 'border-slate-100 dark:border-slate-800 group-hover:border-teal-500/20'}`}
              placeholder={isListening ? "I am listening to your truth..." : "Document your reflections here..."}
            />
            <button
              onClick={toggleListening}
              className={`absolute bottom-8 right-8 p-6 rounded-[28px] shadow-2xl transition-all active:scale-90 z-20 ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-teal-500/20 hover:scale-110'}`}
              title="Vocalise Reflection"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 006 0V5a3 3 0 00-3-3z" />
              </svg>
            </button>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              onClick={() => setStep(step - 1)} 
              className="px-10 py-6 text-slate-500 dark:text-slate-400 font-black rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all uppercase tracking-widest text-xs"
            >
              Previous Landmark
            </button>
            <button 
              onClick={() => step === 1 ? setStep(2) : handleFinish()} 
              disabled={isListening || (step === 1 ? !strengths.trim() : !vision.trim())}
              className={`flex-grow py-6 rounded-3xl font-black text-xs uppercase tracking-[0.4em] transition-all shadow-xl active:scale-[0.98] ${(!isListening && (step === 1 ? strengths.trim() : vision.trim())) ? 'bg-teal-600 text-white shadow-teal-600/30 hover:bg-teal-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-300'}`}
            >
              {step === 2 ? "Finalise Expedition Report" : "Continue Ascent"}
            </button>
          </div>
       </div>
       <p className="text-center text-slate-400 text-xs font-black uppercase tracking-[0.4em] opacity-40">
          "The True-Self is not discovered; it is architected."
       </p>
    </div>
  );
};

export default SelfEsteemFoundations;
