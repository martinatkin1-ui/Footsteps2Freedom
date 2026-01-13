
import React, { useState } from 'react';
import { getModuleReflection } from '../geminiService';
import ModuleReflection from './ModuleReflection';

interface CostBenefitAnalysisProps {
  onExit: (rating?: number, reflection?: string, artUrl?: string) => void;
  onAskGuide?: () => void;
}

const CostBenefitAnalysis: React.FC<CostBenefitAnalysisProps> = ({ onExit, onAskGuide }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    prosUsing: '',
    consUsing: '',
    prosRecovery: '',
    consRecovery: ''
  });
  const [isListening, setIsListening] = useState<string | null>(null);
  const [reflection, setReflection] = useState('');
  const [showReflection, setShowReflection] = useState(false);

  const steps = [
    { 
      key: 'prosUsing', 
      title: 'Benefits of Using', 
      subtitle: 'Short-term Perceived Gains',
      prompt: 'What are the "benefits" you perceive from using? Be honest with yourself. Is it numbing, social ease, or a quick escape?', 
      icon: '🍭',
      color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900/30'
    },
    { 
      key: 'consUsing', 
      title: 'Costs of Using', 
      subtitle: 'Long-term Consequences',
      prompt: 'What are the actual costs? Consider your health, relationships, finances, and self-respect.', 
      icon: '💸',
      color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900/30'
    },
    { 
      key: 'prosRecovery', 
      title: 'Benefits of Recovery', 
      subtitle: 'Long-term Freedom',
      prompt: 'What will you gain by staying sober? Think about your values, your future self, and the peace of mind.', 
      icon: '🌿',
      color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20 border-teal-100 dark:border-teal-900/30'
    },
    { 
      key: 'consRecovery', 
      title: 'Costs of Recovery', 
      subtitle: 'Short-term Challenges',
      prompt: 'What is the "cost" of recovery? Be realistic about the hard work, the emotional discomfort, and the changes required.', 
      icon: '🧗',
      color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20 border-teal-100 dark:border-teal-900/30'
    }
  ];

  const toggleListening = (field: string) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening === field) {
      setIsListening(null);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-GB';
    recognition.onstart = () => setIsListening(field);
    recognition.onend = () => setIsListening(null);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setData(prev => ({
        ...prev,
        [field]: (prev as any)[field] ? `${(prev as any)[field]} ${transcript}` : transcript
      }));
    };
    recognition.start();
  };

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const context = `User analyzed their motivation. Pros of using: ${data.prosUsing}. Cons of using: ${data.consUsing}. Pros of recovery: ${data.prosRecovery}. Cons of recovery: ${data.consRecovery}.`;
      const res = await getModuleReflection("Cost-Benefit Analysis", context);
      setReflection(res);
      setShowReflection(true);
    }
  };

  if (showReflection) return <ModuleReflection reflection={reflection} onClose={(r, refl, art) => onExit(r, refl, art)} title="Motivation Clarified" />;

  const currentStep = steps[step];

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in duration-700 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div className="flex gap-2 flex-grow max-w-lg">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 flex-grow rounded-full transition-all duration-700 ${
                i <= step ? 'bg-teal-600 shadow-sm' : 'bg-slate-200 dark:bg-slate-800'
              }`}
            />
          ))}
        </div>
        {onAskGuide && (
          <button 
            onClick={onAskGuide}
            className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800 shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            Consult Guide
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 md:p-16 border-2 border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-80 h-80 ${currentStep.color.split(' ')[1]} opacity-5 rounded-full -mr-40 -mt-40 blur-3xl`} />
        
        <div className="relative z-10 space-y-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center text-5xl shadow-inner border-2 ${currentStep.color}`}>
              {currentStep.icon}
            </div>
            <div className="text-center md:text-left">
              <span className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 block ${currentStep.color.split(' ')[0]}`}>{currentStep.subtitle}</span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{currentStep.title}</h2>
            </div>
          </div>

          <p className="text-slate-700 dark:text-slate-200 text-2xl font-bold leading-relaxed max-w-2xl italic border-l-4 border-slate-100 dark:border-slate-800 pl-8">
            "{currentStep.prompt}"
          </p>

          <div className="relative group/input">
            <textarea
              autoFocus
              value={(data as any)[currentStep.key]}
              onChange={(e) => setData({ ...data, [currentStep.key]: e.target.value })}
              placeholder="Reflect here..."
              className={`w-full h-64 bg-slate-50 dark:bg-slate-800/50 border-2 rounded-[32px] p-10 focus:ring-8 focus:ring-teal-500/10 text-slate-800 dark:text-white text-xl font-medium leading-relaxed resize-none transition-all duration-500 shadow-inner ${
                isListening === currentStep.key 
                  ? 'border-rose-400 bg-rose-50/20' 
                  : 'border-slate-100 dark:border-slate-700 group-hover/input:bg-white dark:group-hover/input:bg-slate-800'
              }`}
            />
            
            <button
              onClick={() => toggleListening(currentStep.key)}
              className={`absolute bottom-8 right-8 p-5 rounded-2xl shadow-2xl transition-all z-20 ${
                isListening === currentStep.key
                  ? 'bg-rose-500 text-white animate-pulse' 
                  : 'bg-white dark:bg-slate-700 text-teal-600 shadow-teal-500/20 hover:scale-110 active:scale-95'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isListening === currentStep.key ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 006 0V5a3 3 0 00-3-3z" />
              </svg>
            </button>
          </div>

          <div className="flex gap-4">
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
              disabled={!(data as any)[currentStep.key].trim() || isListening}
              className={`flex-grow py-6 rounded-3xl font-black text-sm uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-[0.98] ${
                (data as any)[currentStep.key].trim() && !isListening
                  ? 'bg-teal-600 text-white shadow-teal-600/30 hover:bg-teal-700'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              {step === steps.length - 1 ? 'Archive Strategy' : 'Next Step'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-[48px] p-10 text-white flex gap-8 items-center shadow-2xl border-b-[12px] border-slate-800 ring-1 ring-white/5">
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl shrink-0 backdrop-blur-md">⚖️</div>
        <p className="text-base text-slate-300 leading-relaxed font-medium italic">
          "The goal is to shift from emotional impulse to logical decision-making. Seeing the costs written down builds the neural bridge to your True-Self."
        </p>
      </div>
    </div>
  );
};

export default CostBenefitAnalysis;
