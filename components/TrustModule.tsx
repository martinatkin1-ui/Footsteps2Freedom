
import React, { useState } from 'react';
import { getModuleReflection } from '../geminiService';
import ModuleReflection from './ModuleReflection';
import SpeakButton from './SpeakButton';

const TRUST_STEPS = [
  {
    id: 1,
    title: 'Transparency',
    subtitle: 'The Glass Wall',
    icon: '🪟',
    prompt: 'How are you practicing radical honesty today? Is there anything still hidden in the shadows?',
    guidance: 'Trust cannot grow in the dark. Transparency means proactively sharing your whereabouts, finances, and feelings without being asked.',
    placeholder: 'I am being open about...'
  },
  {
    id: 2,
    title: 'Consistency',
    subtitle: 'The Predictable Self',
    icon: '🔄',
    prompt: 'What small promise can you keep every single day this week?',
    guidance: 'In addiction, we were unpredictable. Rebuilding trust requires a "boring" consistency. Small actions, repeated, are the only proof of change.',
    placeholder: 'My daily commitment is...'
  },
  {
    id: 3,
    title: 'Accountability',
    subtitle: 'Ownership Without Defense',
    icon: '⚖️',
    prompt: 'Reflect on a recent mistake. Did you own it immediately, or did you make an excuse?',
    guidance: 'Accountability is taking the hit for your actions. "I did this, and I understand why it hurt you." No "buts" allowed.',
    placeholder: 'I take ownership of...'
  },
  {
    id: 4,
    title: 'Reliability',
    subtitle: 'The Anchor Point',
    icon: '⚓',
    prompt: 'How can you show someone today that you are where you say you will be?',
    guidance: 'Being reliable means being an anchor. If you say 5:00 PM, be there at 4:55 PM. Every kept appointment is a brick in the wall of trust.',
    placeholder: 'I will be reliable by...'
  },
  {
    id: 5,
    title: 'Empathy',
    subtitle: 'Validating the Hurt',
    icon: '👂',
    prompt: 'Can you sit with a loved one’s anger or doubt without trying to "fix" it or silence it?',
    guidance: 'They were hurt while you were away. Empathy means allowing them their timeline for healing, even if you feel you are "cured."',
    placeholder: 'I am listening to...'
  },
  {
    id: 6,
    title: 'Patience',
    subtitle: 'The Long Harvest',
    icon: '⏳',
    prompt: 'How do you handle the frustration when others don’t trust you yet?',
    guidance: 'Trust is lost in buckets but earned in drops. You must be willing to work for a harvest you may not see for months.',
    placeholder: 'I practice patience by...'
  },
  {
    id: 7,
    title: 'Vulnerability',
    subtitle: 'The Authentic Heart',
    icon: '🌱',
    prompt: 'What is one "scary" truth or fear you can share with a safe person today?',
    guidance: 'The final step is letting people see the real you—struggles and all. Perfection isn’t required; authenticity is.',
    placeholder: 'I am sharing that...'
  }
];

interface TrustModuleProps {
  onExit: (rating?: number) => void;
  onAskGuide?: () => void;
}

const TrustModule: React.FC<TrustModuleProps> = ({ onExit, onAskGuide }) => {
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState<string[]>(Array(7).fill(''));
  const [isListening, setIsListening] = useState(false);
  const [reflection, setReflection] = useState('');
  const [view, setView] = useState<'intro' | 'active' | 'reflection'>('intro');

  const current = TRUST_STEPS[step];

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (isListening) { setIsListening(false); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-GB';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(null);
    recognition.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      const nr = [...responses];
      nr[step] = nr[step] ? `${nr[step]} ${t}` : t;
      setResponses(nr);
    };
    recognition.start();
  };

  const handleNext = async () => {
    if (step < 6) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    } else {
      const context = responses.map((r, i) => `${TRUST_STEPS[i].title}: ${r}`).join('\n');
      const res = await getModuleReflection("7 Steps of Trust", `User completed a comprehensive trust-building roadmap. Key intentions: ${context}`);
      setReflection(res);
      setView('reflection');
    }
  };

  if (view === 'reflection') {
    return <ModuleReflection moduleName="7 Steps of Trust" context="Relationship healing roadmap completed." reflection={reflection} onClose={onExit} title="Manifesto of Integrity" />;
  }

  if (view === 'intro') {
    return (
      <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-700 pb-20">
        <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-xl space-y-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-50 dark:bg-amber-900/10 rounded-full -mr-40 -mt-40 blur-3xl opacity-50" />
          <div className="relative z-10 space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center text-4xl shadow-inner">🤝</div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">7 Steps of Rebuilding Trust</h2>
                  <p className="text-amber-600 dark:text-amber-400 font-black uppercase tracking-widest text-[10px] mt-1">Interpersonal Repair Framework</p>
                </div>
              </div>
              {onAskGuide && (
                <button 
                  onClick={onAskGuide}
                  className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800 shadow-sm transition-all hover:scale-105 active:scale-95"
                >
                  Ask Guide
                </button>
              )}
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed text-lg font-medium space-y-6">
              <div className="flex items-center gap-4">
                <p>In addiction, trust is often the first casualty. It is destroyed quickly but rebuilt with painstaking slowness. This module is a strategic roadmap to restoring your integrity with yourself and those you love.</p>
                <SpeakButton text="In addiction, trust is often the first casualty. It is destroyed quickly but rebuilt with painstaking slowness. This module is a strategic roadmap to restoring your integrity with yourself and those you love." size={20} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                 <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 relative group">
                    <SpeakButton text="Self-Trust First. You cannot be trusted by others until you prove to yourself that you can keep your own promises." size={10} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100" />
                    <h4 className="font-black text-slate-800 dark:text-slate-100 uppercase text-xs mb-3 tracking-widest">Self-Trust First</h4>
                    <p className="text-sm">You cannot be trusted by others until you prove to yourself that you can keep your own promises.</p>
                 </div>
                 <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-3xl border border-amber-100 dark:border-amber-800 relative group">
                    <SpeakButton text="The Consistency Loop. Reliability is a biological safety signal. By being predictable, you lower the 'threat response' of those you hurt." size={10} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100" />
                    <h4 className="font-black text-amber-800 dark:text-amber-400 uppercase text-xs mb-3 tracking-widest">The Consistency Loop</h4>
                    <p className="text-sm">Reliability is a biological safety signal. By being predictable, you lower the "threat response" of those you hurt.</p>
                 </div>
              </div>
            </div>

            <button 
              onClick={() => setView('active')}
              className="w-full py-6 bg-amber-600 text-white font-black rounded-3xl shadow-xl shadow-amber-600/30 hover:bg-amber-700 transition-all uppercase tracking-[0.2em] text-sm"
            >
              Begin Relationship Healing
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-24">
      {/* Progress Bar */}
      <div className="flex gap-2 mb-10 px-2">
        {TRUST_STEPS.map((_, i) => (
          <div key={i} className={`h-2 flex-grow rounded-full transition-all duration-700 ${i <= step ? 'bg-amber-500 shadow-md' : 'bg-slate-100 dark:bg-slate-800'}`} />
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[48px] p-8 md:p-12 border-2 border-slate-100 dark:border-slate-800 shadow-2xl relative overflow-hidden transition-all duration-500">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 dark:bg-amber-900/10 rounded-full -mr-16 -mt-16 opacity-50" />
        
        <div className="relative z-10 space-y-10">
          <div className="flex items-center gap-6">
             <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-[32px] flex items-center justify-center text-5xl shadow-inner animate-in zoom-in duration-500">
               {current.icon}
             </div>
             <div>
                <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.4em]">Step {step + 1} of 7</span>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">{current.title}</h3>
                <p className="text-slate-400 font-bold italic text-sm">{current.subtitle}</p>
             </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 relative group">
             <SpeakButton text={current.guidance} size={14} className="absolute top-2 right-2 opacity-40 group-hover:opacity-100" />
             <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed font-medium">
               <span className="font-black text-amber-600 dark:text-amber-50 uppercase text-[10px] tracking-widest block mb-2">Guidance</span>
               "{current.guidance}"
             </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                {current.prompt}
              </h4>
              <SpeakButton text={current.prompt} size={14} />
            </div>
            <div className="relative group">
               <textarea
                 autoFocus
                 key={step}
                 value={responses[step]}
                 onChange={(e) => {
                   const nr = [...responses];
                   nr[step] = e.target.value;
                   setResponses(nr);
                 }}
                 placeholder={isListening ? "Listening deeply..." : current.placeholder}
                 className={`w-full h-48 bg-slate-50 dark:bg-slate-800/50 border-2 rounded-[32px] p-8 text-slate-800 dark:text-slate-100 text-lg leading-relaxed resize-none transition-all shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-700 ${isListening ? 'border-rose-400 ring-4 ring-rose-50 dark:ring-rose-900/20' : 'border-transparent focus:border-amber-500/30 focus:bg-white dark:focus:bg-slate-800'}`}
               />
               <button
                  onClick={toggleListening}
                  className={`absolute bottom-6 right-6 p-4 rounded-2xl shadow-lg transition-all z-20 ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-amber-500/10'}`}
                  title="Voice Reflection"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 00-3-3z" />
                  </svg>
                </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            {step > 0 && (
              <button 
                onClick={() => setStep(step - 1)}
                className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest text-xs"
              >
                Back to {TRUST_STEPS[step - 1].title}
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!responses[step].trim() || isListening}
              className={`flex-[2] py-5 font-black rounded-2xl shadow-xl transition-all uppercase tracking-[0.2em] text-sm ${!responses[step].trim() || isListening ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 cursor-not-allowed' : 'bg-amber-600 text-white shadow-amber-600/30 hover:bg-amber-700 active:scale-[0.98]'}`}
            >
              {step === 6 ? 'Seal Trust Roadmap' : 'Next Threshold'}
            </button>
          </div>
          
          <button onClick={() => onExit()} className="w-full text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-slate-600 transition-colors">Discard Draft</button>
        </div>
      </div>
    </div>
  );
};

export default TrustModule;
