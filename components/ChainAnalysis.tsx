
import React, { useState, useEffect } from 'react';
import { ChainAnalysisData } from '../types';
import { summarizeChain } from '../geminiService';
import ModuleReflection from './ModuleReflection';
import SpeakButton from './SpeakButton';

interface RootNode {
  id: string;
  text: string;
  type: 'belief' | 'experience';
}

interface ChainAnalysisProps {
  onComplete: (rating?: number, reflection?: string, artUrl?: string) => void;
  onAskGuide?: () => void;
}

const ChainAnalysis: React.FC<ChainAnalysisProps> = ({ onComplete, onAskGuide }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ChainAnalysisData & { repair: string }>({
    triggers: '',
    thoughts: '',
    feelings: '',
    behaviors: '',
    consequences: '',
    repair: ''
  });
  
  const [showRootMapper, setShowRootMapper] = useState(false);
  const [roots, setRoots] = useState<RootNode[]>([]);
  const [newRootText, setNewRootText] = useState('');
  const [activeRootType, setActiveRootType] = useState<'belief' | 'experience'>('belief');

  const [summary, setSummary] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showReflection, setShowReflection] = useState(false);

  const steps = [
    { 
      key: 'triggers', 
      label: 'Vulnerability & Triggers', 
      question: 'What were the "prompting events"? Consider your physical state (HALT) and external environment.', 
      icon: '⚡',
      guidance: 'Identify the setup. Were you hungry, angry, lonely, or tired? What was the spark?'
    },
    { 
      key: 'thoughts', 
      label: 'Cognitive Appraisal', 
      question: 'What "automatic thoughts" appeared? What story was your brain telling you?', 
      icon: '🧠',
      guidance: 'The internal dialogue. Record the specific rules or "shoulds" that appeared.'
    },
    { 
      key: 'feelings', 
      label: 'Affective State', 
      question: 'What emotions and physical sensations were present in that moment?', 
      icon: '🌡️',
      guidance: 'Name the surge. Did your chest feel tight? Was there heat in your face?'
    },
    { 
      key: 'behaviors', 
      label: 'Target Behaviour', 
      question: 'What did you do? Describe the action clearly without judgment.', 
      icon: '🏃',
      guidance: 'Record the objective facts of the action taken by the using-self.'
    },
    { 
      key: 'consequences', 
      label: 'The Aftermath', 
      question: 'What were the short-term gains vs the long-term costs to your True-Self?', 
      icon: '📉',
      guidance: 'Contrast the immediate relief or numbness with the damage to your integrity.'
    },
    { 
      key: 'repair', 
      label: 'Skill Replacement', 
      question: 'Where could you have used a skill (STOP, TIPP, Breathing) to break the chain?', 
      icon: '🛠️',
      guidance: 'Identify the "Link of Choice" where a tactical reset could have changed the outcome.'
    }
  ];

  const handleNext = () => {
    if (step === 0 && !showRootMapper && data.triggers.length > 5) {
      setShowRootMapper(true);
      return;
    }

    if (step < steps.length - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    setIsAnalyzing(true);
    const enrichedData = {
      ...data,
      triggers: `${data.triggers}. Root Mapping: ${roots.map(r => `${r.type}: ${r.text}`).join('; ')}. Repair Plan: ${data.repair}`
    };
    const result = await summarizeChain(enrichedData);
    setSummary(result);
    setIsAnalyzing(false);
  };

  const addRoot = () => {
    if (!newRootText.trim()) return;
    setRoots([...roots, { id: Date.now().toString(), text: newRootText, type: activeRootType }]);
    setNewRootText('');
  };

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
      if (showRootMapper) {
        setNewRootText(prev => prev ? `${prev} ${transcript}` : transcript);
      } else {
        const currentKey = steps[step].key;
        setData(prev => ({ ...prev, [currentKey]: (prev as any)[currentKey] ? `${(prev as any)[currentKey]} ${transcript}` : transcript }));
      }
    };
    recognition.start();
  };

  if (showReflection && summary) {
    return (
      <ModuleReflection 
        moduleName="Functional Chain Analysis"
        context={`User deconstructed a craving pattern. Triggers: ${data.triggers}. Roots found: ${roots.length}. Repair: ${data.repair}`}
        onClose={(r, refl, art) => onComplete(r, refl, art)} 
        title="Behavioural Insight" 
        initialReflection={summary}
      />
    );
  }

  if (summary) {
    return (
      <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-32">
        <div className="bg-white dark:bg-slate-900 rounded-[60px] p-10 md:p-16 border-4 border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50/5 rounded-full -mr-32 -mt-32 blur-3xl" aria-hidden="true"></div>
          <div className="relative z-10 space-y-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                 <span className="text-5xl drop-shadow-xl" aria-hidden="true">💡</span>
                 <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Clinical Synthesis</h2>
                 <SpeakButton text={summary} size={24} />
              </div>
              {onAskGuide && (
                <button 
                  onClick={onAskGuide}
                  className="px-6 py-3 bg-slate-800 text-teal-400 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] border border-slate-700 hover:scale-105 transition-all focus-visible:ring-4 focus-visible:ring-teal-500 outline-none"
                >
                  Consult Guide
                </button>
              )}
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-2xl md:text-3xl text-slate-700 dark:text-slate-200 leading-relaxed font-medium italic border-l-8 border-teal-600/30 dark:border-teal-900 pl-10" aria-live="polite">
                "{summary}"
              </p>
            </div>
            <div className="mt-16 pt-10 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowReflection(true)}
                className="w-full py-6 bg-teal-600 text-white font-black rounded-3xl shadow-2xl shadow-teal-600/30 hover:bg-teal-700 transition-all active:scale-95 uppercase tracking-[0.4em] text-sm focus-visible:ring-8 focus-visible:ring-teal-500/20 outline-none"
              >
                Integrate New Awareness
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showRootMapper) {
    const beliefs = roots.filter(r => r.type === 'belief');
    const experiences = roots.filter(r => r.type === 'experience');

    return (
      <div className="max-w-5xl mx-auto space-y-12 animate-in zoom-in-95 duration-700 pb-32">
        <div className="text-center space-y-4 px-4">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Vulnerability Mapping</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-lg italic">"Triggers are symptoms; beliefs are the source. Let's map the roots."</p>
        </div>

        <div className="bg-slate-950 rounded-[60px] p-8 md:p-20 text-white shadow-2xl relative overflow-hidden min-h-[600px] flex flex-col items-center border-b-[12px] border-slate-900 ring-1 ring-white/10">
          <div className="absolute inset-0 bg-teal-500/[0.02] pointer-events-none" aria-hidden="true" />
          
          <div className="relative z-10 w-full max-w-xl text-center mb-20">
            <div className="bg-teal-600/10 px-8 py-6 rounded-[32px] border-2 border-teal-500/30 backdrop-blur-xl shadow-2xl inline-block group relative">
               <SpeakButton text={data.triggers} size={14} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100" />
               <span className="text-[11px] font-black uppercase tracking-[0.4em] text-teal-400 block mb-3 group-hover:animate-pulse">Active Prompting Event</span>
               <p className="font-black text-xl md:text-2xl text-white italic leading-snug">"{data.triggers}"</p>
            </div>
          </div>

          <div className="w-full flex flex-wrap justify-center gap-8 relative mb-24" role="list">
            {beliefs.length > 0 ? beliefs.map((b, i) => (
              <div key={b.id} className="relative group animate-in slide-in-from-top-6" style={{ animationDelay: `${i * 100}ms` }} role="listitem">
                <div className="bg-indigo-600/20 border-2 border-indigo-500/40 p-6 rounded-[28px] max-w-[220px] text-center shadow-2xl backdrop-blur-3xl hover:scale-110 transition-transform relative group/bel">
                  <SpeakButton text={b.text} size={10} className="absolute top-2 right-2 opacity-0 group-hover/bel:opacity-100" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 block mb-2">Core Belief</span>
                  <p className="text-sm font-black text-indigo-50 leading-relaxed">{b.text}</p>
                </div>
              </div>
            )) : (
              <div className="text-slate-600 text-[11px] font-black uppercase tracking-[0.5em] opacity-30 py-20 animate-pulse font-mono">_awaiting_belief_injection</div>
            )}
          </div>

          <div className="w-full mt-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" role="list">
             {experiences.map((e, i) => (
               <div key={e.id} className="bg-white/5 border border-white/10 p-5 rounded-[24px] text-center shadow-xl animate-in slide-in-from-bottom-4 transition-all hover:bg-white/10 relative group/exp" style={{ animationDelay: `${i * 150}ms` }} role="listitem">
                  <SpeakButton text={e.text} size={10} className="absolute top-2 right-2 opacity-0 group-hover/exp:opacity-100" />
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 block mb-1">Contextual Fragment</span>
                  <p className="text-xs font-bold text-slate-200">{e.text}</p>
               </div>
             ))}
          </div>

          <div className="absolute bottom-8 left-8 right-8 z-30">
             <div className="bg-white/5 backdrop-blur-3xl rounded-[40px] p-6 border border-white/10 shadow-2xl flex flex-col md:flex-row gap-4 items-center">
                <div className="flex bg-black/40 p-1.5 rounded-[20px] shrink-0 border border-white/5" role="radiogroup" aria-label="Root Node Type">
                   <button 
                    onClick={() => setActiveRootType('belief')} 
                    aria-checked={activeRootType === 'belief'}
                    role="radio"
                    className={`px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all focus-visible:ring-2 focus-visible:ring-white outline-none ${activeRootType === 'belief' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                   >
                    Link Belief
                   </button>
                   <button 
                    onClick={() => setActiveRootType('experience')} 
                    aria-checked={activeRootType === 'experience'}
                    role="radio"
                    className={`px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all focus-visible:ring-2 focus-visible:ring-white outline-none ${activeRootType === 'experience' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                   >
                    Link History
                   </button>
                </div>
                <div className="flex-grow w-full relative">
                  <label htmlFor="root-node-input" className="sr-only">New Root Node Description</label>
                  <input 
                    id="root-node-input"
                    value={newRootText} 
                    onChange={(e) => setNewRootText(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && addRoot()} 
                    placeholder={activeRootType === 'belief' ? "Describe the internal rule..." : "Describe the past trauma..."} 
                    className="w-full bg-white/[0.05] border-none rounded-2xl px-8 py-4 text-base focus:ring-4 focus:ring-teal-500/20 transition-all text-white font-medium placeholder:text-slate-600 outline-none" 
                  />
                  <button onClick={toggleListening} className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-white outline-none ${isListening ? 'text-rose-400 animate-pulse bg-rose-400/10' : 'text-slate-500 hover:text-white'}`} aria-label="Dictate root node">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 006 0V5a3 3 0 00-3-3z" /></svg>
                  </button>
                </div>
                <button 
                  onClick={addRoot} 
                  disabled={!newRootText.trim()} 
                  className="w-full md:w-auto bg-teal-600 hover:bg-teal-500 disabled:bg-slate-800 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 focus-visible:ring-4 focus-visible:ring-white outline-none"
                >
                  Archive Root
                </button>
             </div>
          </div>
        </div>

        <div className="flex gap-6">
          <button onClick={() => setShowRootMapper(false)} className="px-10 py-6 text-slate-500 dark:text-slate-400 font-black rounded-3xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all uppercase text-[11px] tracking-widest focus-visible:ring-4 focus-visible:ring-slate-300 outline-none border border-slate-100 dark:border-slate-800">Back</button>
          <button onClick={() => { setShowRootMapper(false); setStep(1); }} className="flex-grow py-6 bg-teal-600 text-white font-black rounded-3xl shadow-2xl hover:bg-teal-700 transition-all uppercase text-xs tracking-widest active:scale-95 focus-visible:ring-8 focus-visible:ring-teal-500/20 outline-none">Continue Chain Sequence</button>
        </div>
      </div>
    );
  }

  const currentStep = steps[step];

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in duration-700 pb-32">
      {/* Progress Trail Header */}
      <div className="flex justify-between items-center px-4" aria-label={`Progress: Step ${step + 1} of 6`}>
        <div className="flex gap-4 flex-grow max-w-lg">
          {steps.map((_, i) => (
            <div key={i} className={`h-2.5 flex-grow rounded-full transition-all duration-1000 relative overflow-hidden ${i < step ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-800'}`} aria-hidden="true">
              {i === step && <div className="absolute inset-0 bg-teal-600 animate-[shimmer_2s_infinite] origin-left shadow-[0_0_8px_rgba(13,148,136,0.5)]"></div>}
            </div>
          ))}
        </div>
        <div className="ml-8 flex flex-col items-end">
           <span className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-[0.3em]">Step {step + 1}/6</span>
           <span className="text-[11px] font-bold text-slate-400 uppercase">Gentle Inquiry</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 md:p-16 border-2 border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-80 h-80 bg-teal-50/5 rounded-full -mr-40 -mt-40 blur-3xl opacity-60`} aria-hidden="true" />
        
        <div className="relative z-10 space-y-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex items-center gap-10">
              <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[32px] flex items-center justify-center text-6xl shadow-inner border-2 border-slate-100 dark:border-slate-700 group-hover:rotate-6 transition-transform duration-700" aria-hidden="true">
                <span>{currentStep.icon}</span>
              </div>
              <div className="space-y-2 text-center md:text-left">
                <div className="flex items-center gap-3">
                   <span className="text-[11px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-[0.3em] block">Insight Gained</span>
                   <SpeakButton text={currentStep.question + ". " + currentStep.guidance} size={14} />
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">{currentStep.label}</h2>
              </div>
            </div>
            {onAskGuide && (
              <button 
                onClick={onAskGuide}
                className="px-4 py-2 bg-slate-800 text-teal-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-700 shadow-sm transition-all hover:scale-105 active:scale-95 focus-visible:ring-4 focus-visible:ring-teal-500 outline-none"
              >
                Consult Guide
              </button>
            )}
          </div>

          <div className="space-y-6">
            <p className="text-slate-700 dark:text-slate-200 text-2xl font-bold leading-relaxed max-w-2xl italic border-l-4 border-slate-100 dark:border-slate-800 pl-8">
              "{currentStep.question}"
            </p>
            <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
               <p className="text-slate-600 dark:text-slate-400 text-sm font-bold italic leading-relaxed">
                 <span className="font-black text-teal-600 dark:text-teal-400 uppercase text-[10px] tracking-widest block mb-1">Guidance Node:</span>
                 "{currentStep.guidance}"
               </p>
            </div>
          </div>

          <div className="relative group/input">
            <label htmlFor={`chain-${currentStep.key}`} className="sr-only">{currentStep.label} Reflection</label>
            <textarea
              id={`chain-${currentStep.key}`}
              autoFocus
              value={(data as any)[currentStep.key]}
              onChange={(e) => setData({ ...data, [currentStep.key]: e.target.value })}
              placeholder={isListening ? "Listening deeply to your reflections..." : "Share your reflections for our journey together..."}
              className={`w-full h-64 bg-slate-50 dark:bg-slate-800/50 border-2 rounded-[40px] p-10 focus:ring-8 focus:ring-teal-500/10 text-slate-800 dark:text-white text-xl font-medium leading-relaxed resize-none transition-all duration-500 shadow-inner outline-none ${isListening ? 'border-rose-400 bg-rose-50/20' : 'border-slate-100 dark:border-slate-700 group-hover/input:bg-white dark:group-hover/input:bg-slate-800'}`}
            />
            <button
               onClick={toggleListening}
               className={`absolute bottom-8 right-8 p-5 rounded-[24px] shadow-2xl transition-all active:scale-90 z-20 focus-visible:ring-4 focus-visible:ring-teal-500 outline-none ${
                 isListening 
                   ? 'bg-rose-500 text-white animate-pulse' 
                   : 'bg-white dark:bg-slate-700 text-teal-600 shadow-teal-500/20 hover:scale-110'
               }`}
               title="Vocalise Insight"
               aria-label="Dictate reflection"
             >
               <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isListening ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 006 0V5a3 3 0 00-3-3z" />
               </svg>
             </button>
          </div>

          <div className="flex gap-6">
            {step > 0 && (
              <button 
                onClick={() => setStep(step - 1)} 
                className="px-10 py-6 text-slate-500 dark:text-slate-400 font-black rounded-3xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all uppercase text-[11px] tracking-widest focus-visible:ring-4 focus-visible:ring-slate-300 outline-none border border-slate-100 dark:border-slate-800"
              >
                Back
              </button>
            )}
            <button 
              onClick={handleNext} 
              disabled={!((data as any)[currentStep.key].trim()) || isAnalyzing || isListening} 
              className={`flex-grow py-6 rounded-3xl font-black text-sm uppercase tracking-[0.4em] transition-all shadow-2xl active:scale-[0.98] focus-visible:ring-8 focus-visible:ring-teal-500/20 outline-none ${
                (data as any)[currentStep.key].trim() && !isAnalyzing && !isListening
                  ? 'bg-teal-600 text-white shadow-teal-600/30 hover:bg-teal-700 hover:scale-[1.01]' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-700 shadow-none'
              }`}
            >
              {isAnalyzing ? "Processing..." : step === steps.length - 1 ? 'Seal this Awareness' : 'Connect the Next Footstep'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-950 rounded-[48px] p-12 text-white relative overflow-hidden shadow-2xl text-center border-b-[12px] border-slate-900 ring-1 ring-white/5">
         <p className="text-slate-400 text-base font-black tracking-widest uppercase italic max-w-2xl mx-auto leading-relaxed">
           "The chain of addiction is broken not by strength, but by understanding the link where we can choose to be free."
         </p>
      </div>
    </div>
  );
};

export default ChainAnalysis;
