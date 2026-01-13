
import React, { useState } from 'react';
import { HaltLog, MoodEntry, AppRoute } from '../types';
import ModuleReflection from './ModuleReflection';
import SpeakButton from './SpeakButton';

const HALT_STEPS = [
  {
    id: 'hunger',
    title: 'Hunger Check',
    icon: '🍎',
    description: 'Have you had a nourishing meal recently? A dip in blood sugar can mimic anxiety or irritability. Your True-Self needs fuel.',
    color: 'bg-emerald-500',
    accent: 'text-emerald-500'
  },
  {
    id: 'anger',
    title: 'Anger Check',
    icon: '⚡',
    description: 'Is there a flicker of resentment or frustration? Identifying the heat allows us to vent it safely before it becomes a storm.',
    color: 'bg-orange-500',
    accent: 'text-orange-500'
  },
  {
    id: 'lonely',
    title: 'Lonely Check',
    icon: '👤',
    description: 'Do you feel disconnected or unheard? Connection is the antidote to addiction. Reach out to your support pillar if needed.',
    color: 'bg-indigo-500',
    accent: 'text-indigo-500'
  },
  {
    id: 'tired',
    title: 'Tired Check',
    icon: '😴',
    description: 'Are you carrying too much weight? Exhaustion weakens your prefrontal cortex—the "CEO" of your recovery.',
    color: 'bg-rose-500',
    accent: 'text-rose-500'
  }
];

interface HaltCheckProps {
  onComplete: (entry: MoodEntry) => void;
  onExit: () => void;
  onSetRoute: (route: AppRoute) => void;
}

type InterventionType = 'hungry' | 'angry' | 'lonely' | 'tired';

const HaltCheck: React.FC<HaltCheckProps> = ({ onComplete, onExit, onSetRoute }) => {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<HaltLog>({
    date: new Date().toISOString(),
    hunger: 5,
    anger: 5,
    lonely: 5,
    tired: 5
  });
  const [showReflection, setShowReflection] = useState(false);
  const [intervention, setIntervention] = useState<{ type: InterventionType; score: number } | null>(null);

  const current = HALT_STEPS[step];
  const currentScore = scores[current.id as keyof HaltLog] as number;
  const isCritical = currentScore >= 8;

  const handleNext = () => {
    if (step < HALT_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      evaluateIntervention();
    }
  };

  const evaluateIntervention = () => {
    // Priority: Anger > Lonely > Tired > Hungry (If multiple are > 7)
    if (scores.anger > 7) {
      setIntervention({ type: 'angry', score: scores.anger });
    } else if (scores.lonely > 7) {
      setIntervention({ type: 'lonely', score: scores.lonely });
    } else if (scores.tired > 7) {
      setIntervention({ type: 'tired', score: scores.tired });
    } else if (scores.hunger > 7) {
      setIntervention({ type: 'hungry', score: scores.hunger });
    } else {
      finishCheck();
    }
  };

  const finishCheck = () => {
    const highIntensity = Object.values(scores).some(v => typeof v === 'number' && v >= 8);
    onComplete({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      mood: highIntensity ? 'struggling' : 'neutral',
      note: `Biological HALT diagnostic complete. Peak intensity: ${Math.max(...(Object.values(scores).filter(v => typeof v === 'number') as number[]))}/10.`,
      halt: scores
    });
    setShowReflection(true);
  };

  if (showReflection) {
    return (
      <ModuleReflection 
        moduleName="Biological Pulse"
        context={`User completed a HALT diagnostic. Scores: H:${scores.hunger}, A:${scores.anger}, L:${scores.lonely}, T:${scores.tired}.`}
        onClose={onExit}
        title="Body Scan Complete"
      />
    );
  }

  if (intervention) {
    const data = {
      angry: {
        title: "Diverting to TIPP Protocol",
        desc: "Your anger intensity is high. This makes the Prefrontal Cortex go offline. We must use a biological manual override to cool your system.",
        actionLabel: "Begin TIPP Reset",
        route: AppRoute.TIPP_SKILL,
        icon: "🌊"
      },
      lonely: {
        title: "Connection Required",
        desc: "Isolation is a high-risk state for your True-Self. Please reach out to your Sponsor or call the Samaritans (116 123) for an immediate anchor.",
        actionLabel: "Access Safety Network",
        route: AppRoute.FIRST_AID,
        icon: "📞"
      },
      tired: {
        title: "Restoration Protocol",
        desc: "Exhaustion leaves you vulnerable. Practice the 5-7-8 wind-down breath and consider a brief journal entry to clear your mind before rest.",
        actionLabel: "Start 5-7-8 Breathing",
        route: AppRoute.BREATHING_EXERCISE,
        icon: "😴"
      },
      hungry: {
        title: "Nutritional Anchor",
        desc: "Your energy levels are low. Try eating something small and easy, like a piece of fruit. Remember, a nourished body is the bedrock of recovery.",
        actionLabel: "I Will Eat Now",
        route: null,
        icon: "🍏"
      }
    }[intervention.type];

    return (
      <div className="min-h-full flex flex-col items-center justify-center p-4 md:p-12 animate-in zoom-in-95 duration-500">
        <div className="bg-slate-950 rounded-[60px] p-10 md:p-16 text-center border-4 border-slate-800 shadow-2xl space-y-8 w-full max-w-2xl relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-30" />
           <div className="relative z-10 space-y-6">
              <div className="w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center text-6xl mx-auto border border-white/10 animate-pulse">
                {data.icon}
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.6em]">Protocol Divergence Required</span>
                <h2 className="text-3xl font-black text-white tracking-tighter">{data.title}</h2>
              </div>
              <p className="text-slate-400 text-lg font-medium leading-relaxed italic max-w-lg mx-auto font-serif">
                "{data.desc}"
              </p>
              <div className="pt-6 flex flex-col gap-3">
                <button 
                  onClick={() => {
                    if (data.route) {
                      onSetRoute(data.route);
                    } else {
                      finishCheck();
                    }
                  }}
                  className="w-full py-6 bg-teal-600 text-white font-black rounded-3xl shadow-xl hover:bg-teal-700 transition-all uppercase tracking-widest text-xs active:scale-95"
                >
                  {data.actionLabel}
                </button>
                {data.route === AppRoute.BREATHING_EXERCISE && (
                   <button 
                    onClick={() => onSetRoute(AppRoute.JOURNAL)}
                    className="w-full py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-white"
                   >
                     Skip to Wind-Down Journal
                   </button>
                )}
                {data.route && (
                  <button 
                    onClick={finishCheck}
                    className="text-slate-600 font-black uppercase text-[9px] tracking-widest hover:text-slate-400 pt-4"
                  >
                    Proceed without protocol
                  </button>
                )}
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-4 md:p-12 animate-in fade-in duration-700 overflow-y-auto no-scrollbar">
      <div className="bg-slate-900 rounded-[60px] p-8 md:p-16 text-center border-4 border-slate-800 shadow-2xl relative overflow-hidden space-y-10 w-full max-w-2xl">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/20 to-slate-950 pointer-events-none" />
        
        <button 
          onClick={onExit}
          className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-rose-500 transition-all z-30"
          aria-label="Exit Diagnostic"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <header className="relative z-10 space-y-2">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.6em]">System Protocol</span>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter italic">**HALT** Diagnostic</h2>
        </header>

        <div className="relative z-10 space-y-10">
           <div className={`w-32 h-32 rounded-[40px] flex items-center justify-center text-6xl mx-auto shadow-2xl border-2 transition-all duration-700 ${isCritical ? 'bg-rose-950/40 border-rose-500/50 scale-110' : 'bg-slate-800/50 border-white/5 animate-float'}`}>
             {current.icon}
           </div>

           <div className="space-y-4">
              <div className="flex justify-center items-center gap-3">
                <h3 className={`text-4xl font-black tracking-tighter transition-colors duration-500 ${isCritical ? 'text-rose-500 animate-pulse' : current.accent}`}>
                  {current.title}
                </h3>
                <SpeakButton text={current.description} size={14} className="opacity-40" />
              </div>
              <p className="text-slate-300 text-lg font-medium leading-relaxed italic max-w-lg mx-auto font-serif">
                "{current.description}"
              </p>
           </div>

           <div className="space-y-6 py-4">
              <div className="flex justify-between items-end px-4">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Internal Reading</span>
                <span className={`text-5xl font-black tabular-nums transition-all duration-500 ${isCritical ? 'text-rose-500 scale-125' : 'text-white'}`}>
                  {currentScore}/10
                </span>
              </div>
              <input 
                type="range" 
                min="1" max="10" 
                value={currentScore}
                onChange={(e) => setScores({ ...scores, [current.id]: parseInt(e.target.value) })}
                className={`w-full h-2 rounded-full appearance-none cursor-pointer transition-colors duration-500 ${isCritical ? 'bg-rose-900 accent-rose-500' : 'bg-slate-800 accent-teal-500'}`}
              />
              {isCritical && (
                <p className="text-rose-400 text-[10px] font-black uppercase tracking-widest animate-pulse">Critical Intensity Detected</p>
              )}
           </div>

           <div className="flex flex-col gap-4 pt-6">
             <button 
               onClick={handleNext}
               className={`w-full py-6 rounded-3xl font-black uppercase tracking-[0.4em] text-xs transition-all shadow-xl active:scale-95 ${isCritical ? 'bg-rose-600 text-white shadow-rose-600/40' : `${current.color} text-white hover:brightness-110 shadow-lg`}`}
             >
               {step === HALT_STEPS.length - 1 ? 'Archive Protocol' : 'Proceed to Next Node'}
             </button>
             <button onClick={onExit} className="text-slate-600 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors">Abort Diagnostic</button>
           </div>
        </div>

        {/* Progress Navigation */}
        <div className="flex justify-center gap-3 relative z-10 pt-4">
           {HALT_STEPS.map((_, i) => (
             <div key={i} className={`h-1.5 rounded-full transition-all duration-700 ${i === step ? 'w-10 bg-white shadow-lg' : i < step ? 'w-3 bg-teal-500' : 'w-3 bg-white/10'}`} />
           ))}
        </div>
      </div>
    </div>
  );
};

export default HaltCheck;
