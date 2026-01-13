
import React, { useState, useMemo } from 'react';
import { Goal } from '../types';
import { getModuleReflection, generateMissionSynthesis, generateCompletionArt } from '../geminiService';
import { PERSONAL_VALUES_LIST } from '../constants';
import ModuleReflection from './ModuleReflection';
import SpeakButton from './SpeakButton';

interface SmartGoalsProps {
  goals: Goal[];
  onAddGoal: (goal: Goal) => void;
  onUpdateGoal: (goal: Goal) => void;
  onExit: () => void;
  phaseId: number;
  onAskGuide?: () => void;
}

const getExamplesByPhase = (phaseId: number) => {
  const isEarly = phaseId <= 2;
  return {
    title: isEarly ? 'Stability Anchor' : 'True-Self Outreach',
    specific: isEarly 
      ? 'I will attend 3 recovery meetings and commit to staying for the full duration of each.' 
      : 'I will volunteer to chair the local Tuesday meeting once this month to practice leadership.',
    measurable: isEarly 
      ? 'I will check off each meeting on my Footpath Daily Planner immediately after it finishes.' 
      : 'I will confirm the date with the meeting secretary and record it in my calendar.',
    achievable: isEarly 
      ? 'This is realistic because there are meetings near my workplace during lunch hours.' 
      : 'I have been attending this meeting for 6 months and understand the format well.',
    relevant: isEarly 
      ? 'Connecting with peers reduces the isolation that usually triggers my cravings in Phase 1.' 
      : 'Service work helps shift my focus from someone who needs help to someone who provides it.',
    timeBound: isEarly 
      ? 'I will complete this by next Sunday evening.' 
      : 'The volunteering will happen before the end of this calendar month.'
  };
};

const STEPS = [
  { key: 'specific', label: 'Specific', icon: '🧭', prompt: 'What exactly do you want to accomplish?', guidance: 'Avoid vague goals like "get better." Focus on a concrete action you can see yourself doing.', placeholder: 'I want to...' },
  { key: 'measurable', label: 'Measurable', icon: '📊', prompt: 'How will you know you have succeeded?', guidance: 'In recovery, we need data. Is it a number? A physical feeling? A task you can check off?', placeholder: 'I will track this by...' },
  { key: 'achievable', label: 'Achievable', icon: '⛰️', prompt: 'Is this realistic for you right now?', guidance: 'Recovery is a marathon. If you are struggling, scale it down. A small win builds momentum.', placeholder: 'This is possible because...' },
  { key: 'relevant', label: 'Relevant', icon: '🔑', prompt: 'Why does this goal matter to your recovery?', guidance: 'Does this align with your current phase goals? How does it protect your freedom today?', placeholder: 'This helps my recovery by...' },
  { key: 'timeBound', label: 'Time-bound', icon: '⏰', prompt: 'When do you want to finish this?', guidance: 'Give yourself a deadline. "By Friday night" or "Within the next 24 hours."', placeholder: 'I will achieve this by...' }
];

const SmartGoals: React.FC<SmartGoalsProps> = ({ goals, onAddGoal, onUpdateGoal, onExit, phaseId, onAskGuide }) => {
  const [view, setView] = useState<'list' | 'value-select' | 'create' | 'debrief' | 'reflection'>('list');
  const [currentStep, setCurrentStep] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [reflection, setReflection] = useState('');
  const [showReflection, setShowReflection] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  
  // Verification States
  const [debriefingGoal, setDebriefingGoal] = useState<Goal | null>(null);
  const [debriefText, setDebriefText] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    title: '', specific: '', measurable: '', achievable: '', relevant: '', timeBound: '', isCompleted: false
  });

  const examples = useMemo(() => getExamplesByPhase(phaseId), [phaseId]);

  const useExample = (key: keyof typeof examples) => {
    setNewGoal(prev => ({ ...prev, [key]: examples[key] }));
  };

  const initiateDebrief = (goal: Goal) => {
    if (goal.isCompleted) return; // Already done
    setDebriefingGoal(goal);
    setView('debrief');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVerifyMission = async () => {
    if (!debriefText.trim() || !debriefingGoal) return;
    setIsVerifying(true);
    try {
      const [aiRes, artUrl] = await Promise.all([
        generateMissionSynthesis(debriefingGoal.title, debriefText),
        generateCompletionArt(debriefingGoal.title, "Wayfinder")
      ]);
      
      const updatedGoal: Goal = {
        ...debriefingGoal,
        isCompleted: true,
        completedAt: new Date().toISOString(),
        verificationReflection: aiRes || undefined,
        verificationArtUrl: artUrl || undefined
      };
      
      onUpdateGoal(updatedGoal);
      setReflection(aiRes || "This victory is a testament to your growing True-Self.");
      setView('reflection');
    } catch (e) {
      console.error(e);
    }
    setIsVerifying(false);
  };

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      const finalizedGoal: Goal = {
        ...newGoal as Goal,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        isCompleted: false,
        relevant: `${selectedValue ? `[Value: ${selectedValue}] ` : ''}${newGoal.relevant}`
      };
      onAddGoal(finalizedGoal);
      const aiRes = await getModuleReflection("SMART Marker Setting", `User set a marker: "${finalizedGoal.title}" anchored in the value of ${selectedValue}.`);
      setReflection(aiRes);
      setView('reflection');
    }
  };

  const toggleListening = (mode: 'create' | 'debrief') => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (isListening) { setIsListening(false); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-GB';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (mode === 'create') {
        const key = STEPS[currentStep].key as keyof Goal;
        setNewGoal(prev => ({ ...prev, [key]: prev[key] ? `${prev[key]} ${transcript}` : transcript }));
      } else {
        setDebriefText(prev => prev ? `${prev} ${transcript}` : transcript);
      }
    };
    recognition.start();
  };

  if (view === 'reflection') {
    return <ModuleReflection 
      moduleName="Marker Secured" 
      context={`User successfully verified completion of marker: ${debriefingGoal?.title || newGoal.title}`} 
      reflection={reflection} 
      onClose={() => setView('list')} 
      title="Strategic Integration" 
    />;
  }

  if (view === 'debrief' && debriefingGoal) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 animate-in fade-in duration-1000 pb-32">
         <div className="bg-slate-900 rounded-[60px] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden border-b-[12px] border-indigo-600 ring-1 ring-white/10">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] -mr-40 -mt-40" />
            
            <div className="relative z-10 space-y-12">
               <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-white/5 rounded-[40px] flex items-center justify-center text-5xl mx-auto shadow-2xl border border-white/10 animate-float">🎖️</div>
                  <div className="space-y-2">
                     <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.6em]">Protocol: Marker Closeout</span>
                     <h2 className="text-4xl font-black italic tracking-tighter">Debrief: {debriefingGoal.title}</h2>
                  </div>
               </div>

               <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 shadow-inner relative group">
                  <SpeakButton text="The win is in the memory. Describe how securing this marker strengthens your True-Self. How did it feel to hold this boundary?" size={14} className="absolute top-2 right-2 opacity-40 group-hover:opacity-100" />
                  <p className="text-slate-300 text-lg font-medium italic leading-relaxed text-center">
                    "The win is in the memory. Describe how securing this marker strengthens your True-Self. How did it feel to hold this boundary?"
                  </p>
               </div>

               <div className="relative group">
                  <textarea 
                    value={debriefText}
                    onChange={(e) => setDebriefText(e.target.value)}
                    placeholder={isListening ? "Listening to your victory report..." : "Archive the experience of this win..."}
                    className={`w-full h-64 bg-black/40 border-2 rounded-[40px] p-10 text-white text-xl font-medium italic leading-relaxed resize-none transition-all shadow-inner focus:ring-8 focus:ring-indigo-500/10 ${isListening ? 'border-rose-500 ring-rose-500/20' : 'border-white/10 focus:border-indigo-500/50'}`}
                  />
                  <button
                    onClick={() => toggleListening('debrief')}
                    className={`absolute bottom-8 right-8 p-5 rounded-2xl shadow-xl transition-all z-20 ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-white/5 text-indigo-400 hover:bg-white/10'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 00-3-3z" /></svg>
                  </button>
               </div>

               <div className="flex flex-col gap-4">
                  <button 
                    onClick={handleVerifyMission}
                    disabled={!debriefText.trim() || isVerifying}
                    className="w-full py-6 bg-indigo-600 text-white font-black rounded-3xl shadow-xl hover:bg-indigo-700 transition-all active:scale-[0.98] uppercase tracking-widest text-sm"
                  >
                    {isVerifying ? "Synthesising Victory Patch..." : "Finalise Marker & Seal Artifact"}
                  </button>
                  <button onClick={() => setView('list')} className="text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors">Discard Debrief</button>
               </div>
            </div>
         </div>
      </div>
    );
  }

  if (view === 'value-select') {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
         <div className="text-center space-y-4">
           <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Anchor Your Marker</h2>
           <p className="text-slate-500 dark:text-slate-400 font-bold">Markers without values are just tasks. Which core value does this marker serve?</p>
         </div>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {PERSONAL_VALUES_LIST.map((v) => (
             <button key={v} onClick={() => setSelectedValue(v)} className={`p-6 rounded-[32px] border-2 transition-all font-black text-xs uppercase tracking-widest ${selectedValue === v ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl scale-105' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-300'}`}>{v}</button>
           ))}
         </div>
         <button onClick={() => setView('create')} disabled={!selectedValue} className={`w-full py-6 rounded-3xl font-black uppercase text-xs tracking-widest transition-all ${selectedValue ? 'bg-teal-600 text-white shadow-xl hover:bg-teal-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-300'}`}>Start Architecture</button>
         <button onClick={() => setView('list')} className="w-full text-slate-400 font-black uppercase text-[10px] tracking-widest">Cancel</button>
      </div>
    );
  }

  if (view === 'create') {
    const step = STEPS[currentStep];
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 md:p-16 border-2 border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 dark:bg-teal-900/10 rounded-full -mr-16 -mt-16 opacity-50" />
          <div className="relative z-10 space-y-10">
            <div className="flex items-center justify-between">
               <span className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800">Value: {selectedValue}</span>
               <div className="flex gap-1.5">
                  {STEPS.map((_, i) => (
                    <div key={i} className={`h-1.5 w-6 rounded-full transition-all ${i <= currentStep ? 'bg-teal-500' : 'bg-slate-100 dark:bg-slate-800'}`} />
                  ))}
               </div>
            </div>

            {currentStep === 0 && (
              <div className="mb-8 animate-in slide-in-from-top-2">
                <div className="flex justify-between items-end mb-2 ml-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Short Title</label>
                  <button onClick={() => useExample('title')} className="text-[9px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest hover:underline">✨ Try Example</button>
                </div>
                <input type="text" value={newGoal.title} onChange={(e) => setNewGoal({...newGoal, title: e.target.value})} placeholder="e.g. My Recovery Habit" className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-teal-500/10 font-bold text-slate-700 dark:text-slate-200 shadow-inner outline-none" />
              </div>
            )}

            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-5xl shadow-inner border-2 border-slate-100 dark:border-slate-700">{step.icon}</div>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-[0.3em]">Marker Blueprint</span>
                <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{step.label}</h3>
              </div>
            </div>

            <div className="bg-teal-50 dark:bg-teal-900/20 p-8 rounded-[32px] border-2 border-teal-100 dark:border-teal-900/30 relative group">
               <SpeakButton text={step.guidance} size={14} className="absolute top-2 right-2 opacity-40 group-hover:opacity-100" />
               <p className="text-teal-800 dark:text-teal-300 text-base font-bold italic leading-relaxed">"{step.guidance}"</p>
            </div>

            <div className="space-y-4">
               <div className="flex justify-between items-end px-2">
                 <div className="flex items-center gap-3">
                   <p className="text-slate-700 dark:text-slate-200 text-xl font-black leading-tight">{step.prompt}</p>
                   <SpeakButton text={step.prompt} size={14} />
                 </div>
                 <button onClick={() => useExample(step.key as keyof typeof examples)} className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline flex items-center gap-1.5"><span>✨</span> Use Example</button>
               </div>
               <div className="relative group/input">
                <textarea value={newGoal[step.key as keyof Goal] as string} onChange={(e) => setNewGoal({...newGoal, [step.key]: e.target.value})} placeholder={step.placeholder} className={`w-full h-48 bg-slate-50 dark:bg-slate-800/50 border-2 rounded-[32px] p-8 h-48 focus:ring-8 focus:ring-teal-500/10 text-slate-800 dark:text-white text-lg font-medium leading-relaxed resize-none transition-all shadow-inner ${isListening ? 'border-rose-400 ring-rose-100 bg-rose-50/20' : 'border-slate-100 dark:border-slate-700 group-hover/input:bg-white dark:group-hover/input:bg-slate-800'}`} />
                <button onClick={() => toggleListening('create')} className={`absolute bottom-6 right-6 p-4 rounded-2xl shadow-xl transition-all z-20 ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-white dark:bg-slate-700 text-teal-600 shadow-teal-500/10'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 00-3-3z" /></svg>
                </button>
              </div>
            </div>

            <button onClick={handleNext} disabled={!newGoal[step.key as keyof Goal] || (currentStep === 0 && !newGoal.title) || isListening} className={`w-full py-6 rounded-3xl font-black text-sm uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-[0.98] ${(newGoal[step.key as keyof Goal] && !isListening) ? 'bg-teal-600 text-white shadow-teal-600/30 hover:bg-teal-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 shadow-none cursor-not-allowed'}`}>
              {currentStep === STEPS.length - 1 ? 'Archive Strategic Marker' : 'Proceed to Next Step'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-teal-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg">🧭</div>
            <span className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-[0.4em]">Marker Hub</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white tracking-tighter">True-Self Markers</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-lg leading-relaxed italic">"Measuring progress by securing markers of values-based action."</p>
        </div>
        <button onClick={() => { setNewGoal({ title: '', specific: '', measurable: '', achievable: '', relevant: '', timeBound: '', isCompleted: false }); setCurrentStep(0); setView('value-select'); }} className="bg-teal-600 text-white px-10 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-teal-600/30 hover:bg-teal-700 transition-all active:scale-95 flex items-center gap-3">
          <span>✨</span> Set New Marker
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {goals.length === 0 ? (
          <div className="md:col-span-2 py-32 bg-white dark:bg-slate-900 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[60px] text-center space-y-6 shadow-sm">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center text-5xl mx-auto opacity-40 shadow-inner grayscale">🧭</div>
            <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No active markers found.</p>
          </div>
        ) : (
          goals.map((goal) => (
            <div key={goal.id} className={`bg-white dark:bg-slate-900 rounded-[40px] p-8 md:p-10 border-2 transition-all group ${goal.isCompleted ? 'border-teal-100 dark:border-teal-900/30 bg-teal-50/10 shadow-sm' : 'border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl'}`}>
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-6">
                   <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner transition-all duration-500 ${goal.isCompleted ? 'bg-teal-600 text-white shadow-teal-600/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:scale-110'}`}>
                     {goal.isCompleted ? (
                       <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                         <path d="M20 6L9 17L4 12" className="animate-checkmark-path" />
                       </svg>
                     ) : '🧭'}
                   </div>
                   <div>
                     <div className="flex items-center gap-3">
                       <h3 className={`font-black text-2xl leading-tight tracking-tight ${goal.isCompleted ? 'line-through text-slate-400 opacity-60' : 'text-slate-900 dark:text-slate-100'}`}>{goal.title}</h3>
                       <SpeakButton text={goal.title + ". " + goal.specific} size={14} />
                     </div>
                     <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">Target Date: {goal.timeBound}</p>
                   </div>
                </div>
                {!goal.isCompleted && (
                  <button 
                    onClick={() => initiateDebrief(goal)} 
                    className="px-6 py-3 bg-teal-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg hover:bg-teal-700 transition-all active:scale-90"
                  >
                    Secure Marker
                  </button>
                )}
                {goal.isCompleted && (
                  <div className="bg-emerald-500 text-white p-3 rounded-full shadow-lg animate-checkmark-pop">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17L4 12" className="animate-checkmark-path" />
                    </svg>
                  </div>
                )}
              </div>

              {goal.isCompleted && goal.verificationReflection && (
                <div className="mb-6 p-6 bg-emerald-50 dark:bg-emerald-950/40 rounded-3xl border border-emerald-100 dark:border-emerald-800 animate-in slide-in-from-top-4 duration-500 relative group/refl">
                  <SpeakButton text={goal.verificationReflection} size={10} className="absolute top-2 right-2 opacity-0 group-hover/refl:opacity-100" />
                  <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-2">Commendation</span>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 italic">"{goal.verificationReflection}"</p>
                </div>
              )}

              <div className="space-y-6">
                <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-[32px] border-2 border-transparent dark:border-slate-800 shadow-inner group-hover:border-teal-500/10 transition-all">
                  <p className="text-base text-slate-700 dark:text-slate-300 font-bold italic leading-relaxed">"{goal.specific}"</p>
                </div>
                <div className="flex items-center gap-3">
                   <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
                   <p className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-[0.3em]">{goal.relevant}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SmartGoals;
