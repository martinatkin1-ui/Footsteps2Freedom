
import React, { useState, useRef } from 'react';
import { RelapsePreventionPlan as RPPType } from '../types';
import { getModuleReflection } from '../geminiService';
import ModuleReflection from './ModuleReflection';
import SpeakButton from './SpeakButton';

interface RPPBuilderProps {
  initialData: RPPType | null;
  onSave: (data: RPPType) => void;
  onExit: () => void;
  onAskGuide?: () => void;
}

const RelapsePreventionPlan: React.FC<RPPBuilderProps> = ({ initialData, onSave, onExit, onAskGuide }) => {
  const [mode, setMode] = useState<'view' | 'edit'>(initialData ? 'view' : 'edit');
  const [step, setStep] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [reflection, setReflection] = useState('');
  const [showReflection, setShowReflection] = useState(false);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  
  const [data, setData] = useState<RPPType>(initialData || {
    personalTriggers: '',
    earlyWarningSigns: '',
    copingToolbox: '',
    supportNetwork: '',
    sponsorNumber: '',
    emergencyActionSteps: '',
    joyActivities: '',
    lastUpdated: new Date().toISOString()
  });

  const sections = [
    { 
      key: 'personalTriggers', 
      label: 'Triggers', 
      fullLabel: 'Personal Triggers',
      icon: '🚩', 
      prompt: 'What situations, people, or places tempt you?',
      guidance: 'Triggers are "High Risk Situations." Identifying them is a survival skill, not a sign of weakness.',
      examples: [
        'Social: Old friends who still use or "drinking buddies."',
        'Environmental: Payday, Friday nights, or specific routes home.',
        'Emotional: Feeling lonely, unappreciated, or very stressed.',
        'Physical: Hunger, fatigue (HALT), or chronic pain.'
      ],
      placeholder: 'List your specific triggers...'
    },
    { 
      key: 'earlyWarningSigns', 
      label: 'Warning Signs', 
      fullLabel: 'Early Warning Signs',
      icon: '⚠️', 
      prompt: 'What happens inside you before a slip?',
      guidance: 'Slips usually start in the mind days or weeks before the actual act. Look for shifts in your patterns.',
      examples: [
        'Thoughts: "Just one won\'t hurt," or "I\'ve cured myself."',
        'Behaviour: Stopping meetings, avoiding sober friends, or lying.',
        'Emotions: Increased irritability, boredom, or a "numb" feeling.'
      ],
      placeholder: 'What are your internal red flags?'
    },
    { 
      key: 'copingToolbox', 
      label: 'Toolbox', 
      fullLabel: 'Coping Toolbox',
      icon: '🛠️', 
      prompt: 'Which skills work best to ground you?',
      guidance: 'These are your "Internal Stabilizers." Keep a mix of physical resets and mental shifts.',
      examples: [
        'Quick Reset: Cold water on face (TIPP), or holding an ice cube.',
        'Distraction: 5-4-3-2-1 grounding or a high-energy playlist.',
        'Processing: Writing a "Pros/Cons" list or playing the tape to the end.'
      ],
      placeholder: 'List your most effective tools...'
    },
    { 
      key: 'joyActivities', 
      label: 'Activities', 
      fullLabel: 'Activities I Enjoy',
      icon: '🌈', 
      prompt: 'What brings you peace or fulfillment?',
      guidance: 'Recovery isn\'t just about "not using"; it\'s about building a life you actually enjoy living.',
      examples: [
        'Creative: Drawing, photography, or cooking a new UK recipe.',
        'Physical: Swimming at the local pool, hiking, or gardening.',
        'Connection: Volunteering or a board game night with family.'
      ],
      placeholder: 'What makes life feel worth it?'
    },
    { 
      key: 'supportNetwork', 
      label: 'Support', 
      fullLabel: 'Support Network',
      icon: '🤝', 
      prompt: 'Who are your "Safe People"?',
      guidance: 'Connection is the opposite of addiction. These people should know your plan and support your sobriety.',
      examples: [
        'Peer Support: Your sponsor or friends from recovery groups.',
        'Professional: Your GP, counselor, or key worker.',
        'Inner Circle: Family members who respect your boundaries.'
      ],
      placeholder: 'Name your support pillars...'
    },
    { 
      key: 'emergencyActionSteps', 
      label: 'Emergency', 
      fullLabel: 'Emergency Action Steps',
      icon: '🆘', 
      prompt: 'If a crisis hits, what are the first 3 steps?',
      guidance: 'In a moment of intense craving, your "thinking brain" may go offline. You need a pre-written script to follow.',
      examples: [
        '1. Immediate Exit: Leave the situation or room physically.',
        '2. Phone First: Call your sponsor or a crisis line (e.g. Shout 85258).',
        '3. Safe Ground: Go to a library, cafe, or meeting until it passes.'
      ],
      placeholder: 'Write your 3-step emergency protocol...'
    }
  ];

  const handleNext = async () => {
    if (step < sections.length - 1) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    } else {
      const now = new Date().toISOString();
      const updatedData = { ...data, lastUpdated: now };
      setData(updatedData);
      onSave(updatedData);
      
      const res = await getModuleReflection("Relapse Prevention Plan", "User updated their personal triggers, warning signs, joyful activities, and action steps.");
      setReflection(res);
      setShowConfirmation(true);
    }
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
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const currentKey = sections[step].key as keyof RPPType;
      setData(prev => ({
        ...prev,
        [currentKey]: prev[currentKey] ? `${prev[currentKey]} ${transcript}` : transcript
      }));
    };
    recognition.start();
  };

  const handleCallSponsor = () => {
    if (data.sponsorNumber && data.sponsorNumber.trim()) {
      window.location.href = `tel:${data.sponsorNumber.trim()}`;
    } else {
      alert("No sponsor number found. Please edit your plan to add one in the Support section.");
      setMode('edit');
      setStep(4); 
    }
  };

  if (showReflection) {
    return <ModuleReflection moduleName="Relapse Prevention Plan" context="RPP update completed." reflection={reflection} onClose={() => { setShowReflection(false); setMode('view'); }} />;
  }

  if (showConfirmation) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 animate-in fade-in zoom-in duration-500">
        <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 border border-slate-200 dark:border-slate-800 shadow-xl text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 dark:bg-teal-900/10 rounded-full -mr-16 -mt-16 opacity-50"></div>
          <div className="relative z-10 space-y-6">
            <div className="w-20 h-20 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center text-4xl mx-auto shadow-inner">✓</div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Plan Saved!</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Your strategy for freedom is secure and ready whenever you need it.</p>
            <button
              onClick={() => setShowReflection(true)}
              className="w-full py-5 bg-teal-600 text-white font-bold rounded-2xl shadow-lg hover:bg-teal-700 transition-all"
            >
              Get Footpath Guidance
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'view') {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">My Prevention Plan</h2>
            <SpeakButton text={"Relapse Prevention Plan. Status: Active. Personal Triggers include " + data.personalTriggers + ". Emergency steps include " + data.emergencyActionSteps} />
            {onAskGuide && (
              <button 
                onClick={onAskGuide}
                className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800 shadow-sm transition-all hover:scale-105 active:scale-95"
              >
                Ask Guide
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => { setMode('edit'); setStep(0); }}
              className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              Update Plan
            </button>
            <button onClick={onExit} className="text-slate-400 font-bold hover:text-slate-600">Close</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[32px] p-8 text-white shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-125"></div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl mb-4 backdrop-blur-sm">📞</div>
            <h3 className="text-xl font-bold mb-1">Need Support?</h3>
            <p className="text-emerald-50 text-xs mb-6 opacity-80">Immediate connection is your safety net.</p>
            <button 
              onClick={handleCallSponsor}
              className="w-full py-4 bg-white text-teal-700 rounded-2xl font-black shadow-lg hover:bg-emerald-50 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 005.105 5.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              Call Sponsor
            </button>
            {data.sponsorNumber && (
              <p className="mt-4 text-[10px] font-bold tracking-widest text-emerald-100/60">{data.sponsorNumber}</p>
            )}
          </div>

          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sections.map((sec) => (
              <div key={sec.key} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[24px] shadow-sm hover:shadow-md transition-shadow relative group">
                <SpeakButton text={data[sec.key as keyof RPPType] || sec.label} size={10} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100" />
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{sec.icon}</span>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{sec.label}</h4>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-xs line-clamp-3 leading-relaxed whitespace-pre-wrap font-medium">
                  {data[sec.key as keyof RPPType] || <span className="italic opacity-40 font-normal">Section not yet filled.</span>}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-8 rounded-[40px] flex items-start gap-6 relative overflow-hidden group">
          <SpeakButton text={data.emergencyActionSteps || "No protocol defined."} size={14} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16"></div>
          <div className="w-14 h-14 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center text-3xl shrink-0">🆘</div>
          <div>
            <h4 className="text-rose-900 dark:text-rose-100 font-bold mb-1">Emergency Protocol</h4>
            <p className="text-rose-800/70 dark:text-rose-200/70 text-sm leading-relaxed whitespace-pre-wrap font-medium">
              {data.emergencyActionSteps || "No steps defined yet. Please update your plan to include an emergency protocol."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentSection = sections[step];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">RPP Builder</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium italic">Building your blueprint for stability</p>
        </div>
        <button onClick={() => setMode('view')} className="text-slate-400 hover:text-slate-600 font-bold transition-colors">Cancel</button>
      </div>

      {/* Guidance and Example Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-indigo-600 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="relative z-10 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">Guidance</h4>
                  <SpeakButton text={currentSection.guidance} size={12} className="opacity-60" />
                </div>
                <p className="text-sm font-medium leading-relaxed">{currentSection.guidance}</p>
              </div>
              
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200 mb-4 flex items-center gap-2">
                  <span className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center text-[8px]">?</span>
                  Examples
                </h4>
                <ul className="space-y-3">
                  {currentSection.examples.map((ex, i) => (
                    <li key={i} className="text-xs bg-white/10 p-3 rounded-xl border border-white/5 font-medium leading-relaxed relative group">
                      <SpeakButton text={ex} size={10} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100" />
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 right-0 w-48 h-48 bg-teal-50 dark:bg-teal-900/10 rounded-full -mr-24 -mt-24 opacity-30"></div>
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-5xl drop-shadow-sm">{currentSection.icon}</span>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white">{currentSection.fullLabel}</h3>
                    <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Section {step + 1} of {sections.length}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <p className="text-slate-600 dark:text-slate-200 text-lg leading-relaxed font-bold">
                  {currentSection.prompt}
                </p>
                <SpeakButton text={currentSection.prompt} size={16} />
              </div>

              {currentSection.key === 'supportNetwork' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 bg-slate-50 dark:bg-slate-800 p-6 rounded-[24px] border border-slate-100 dark:border-slate-700">
                  <div className="flex flex-col sm:flex-row gap-3 items-end">
                    <div className="flex-grow w-full">
                      <label htmlFor="sponsorPhone" className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-2">
                        Immediate Support Number (Sponsor)
                      </label>
                      <input
                        ref={phoneInputRef}
                        id="sponsorPhone"
                        type="tel"
                        value={data.sponsorNumber || ''}
                        onChange={(e) => setData({ ...data, sponsorNumber: e.target.value })}
                        placeholder="e.g. 07700 900XXX"
                        className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-teal-500 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-teal-50 dark:focus:ring-teal-900/20 font-bold text-slate-700 dark:text-white transition-all shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="relative">
                <textarea
                  key={currentSection.key}
                  value={data[currentSection.key as keyof RPPType] as string}
                  onChange={(e) => setData({ ...data, [currentSection.key]: e.target.value })}
                  placeholder={currentSection.placeholder}
                  className={`w-full h-80 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-3xl p-8 h-80 focus:ring-4 focus:ring-teal-50 dark:focus:ring-teal-900/10 focus:border-teal-500 text-slate-700 dark:text-slate-200 font-medium leading-relaxed resize-none transition-all placeholder:text-slate-300 animate-in fade-in duration-500 shadow-inner`}
                />
                <button
                  onClick={toggleListening}
                  className={`absolute bottom-4 right-4 p-4 rounded-full transition-all relative z-20 ${
                    isListening 
                      ? 'bg-rose-500 text-white shadow-lg animate-pulse' 
                      : 'bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400 hover:bg-teal-200'
                  }`}
                  title="Voice Input"
                >
                  {isListening && (
                    <span className="absolute inset-0 rounded-full bg-rose-400 animate-ping opacity-30"></span>
                  )}
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 relative z-10 ${isListening ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 00-3-3z" />
                  </svg>
                </button>
              </div>

              <div className="flex gap-4">
                {step > 0 && (
                  <button
                    onClick={() => { setStep(step - 1); window.scrollTo(0, 0); }}
                    className="px-8 py-5 text-slate-500 dark:text-slate-400 font-black rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all uppercase tracking-widest text-xs"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={isListening}
                  className={`flex-grow py-5 font-black rounded-2xl shadow-xl transition-all uppercase tracking-[0.2em] text-sm ${
                    isListening 
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' 
                      : 'bg-teal-600 text-white shadow-teal-600/20 hover:bg-teal-700 active:scale-[0.98]'
                  }`}
                >
                  {step === sections.length - 1 ? 'Save & Review' : 'Next Step'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[24px] flex overflow-x-auto no-scrollbar gap-1 max-w-2xl mx-auto">
        {sections.map((sec, i) => (
          <button
            key={sec.key}
            onClick={() => { setStep(i); window.scrollTo(0, 0); }}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all whitespace-nowrap flex-1 min-w-[100px] justify-center ${
              step === i 
                ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-400 shadow-md font-black scale-[1.02]' 
                : 'text-slate-400 dark:text-slate-500 hover:bg-white/50 font-bold'
            }`}
          >
            <span className="text-lg">{sec.icon}</span>
            <span className="text-[10px] uppercase tracking-wider">{sec.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RelapsePreventionPlan;
