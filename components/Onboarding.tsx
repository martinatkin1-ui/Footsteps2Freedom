
import React, { useState, useEffect } from 'react';
import SpeakButton from './SpeakButton';
import Logo from './Logo';

interface OnboardingProps {
  userName: string;
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ userName, onComplete }) => {
  const [step, setStep] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    // Trigger initial haptic when onboarding starts
    if ('vibrate' in navigator) navigator.vibrate(20);
  }, []);

  const steps = [
    {
      id: 'gateway',
      title: `Welcome, ${userName.split(' ')[0]}`,
      subtitle: "The Sanctuary Gate",
      description: "You have stepped into a space designed for your True-Self. Here, we do not count days to measure worth; we measure the integrity of your footsteps.",
      clinicalNote: "UK Privacy Protocol: Your journals and data are encrypted and remain strictly local to this device.",
      icon: "🍃",
      color: "from-teal-600 to-emerald-900",
      accent: "text-teal-400",
      cta: "Accept Invitation"
    },
    {
      id: 'phases',
      title: "Self-Paced Healing",
      subtitle: "Phases, Not Weeks",
      description: "Recovery is not a linear climb. Our journey is divided into five 'Zones of Evolution'—from the stabilization of the Undergrowth to the legacy of the Summit.",
      bullets: [
        { icon: "🌱", text: "Phase 1-2: Biological Grounding & Safety." },
        { icon: "🌳", text: "Phase 3: Identity & Relational Growth." },
        { icon: "🏔️", text: "Phase 4-5: Meaning, Purpose & Legacy." }
      ],
      icon: "🗺️",
      color: "from-emerald-600 to-indigo-900",
      accent: "text-emerald-400",
      cta: "Understand the Map"
    },
    {
      id: 'guide',
      title: "The Footpath Guide",
      subtitle: "Your Clinical Partner",
      description: "I am your AI companion, anchored in CBT, DBT, and ACT frameworks. I am here 24/7 to narrate tools, mirror your patterns, and hold space for your truth.",
      bullets: [
        { icon: "🗣️", text: "Vocal Support: I can read every tool aloud to you." },
        { icon: "🔬", text: "Science Hub: Deconstruct the 'why' behind cravings." },
        { icon: "🧠", text: "Pattern Detection: I help you spot what the heart misses." }
      ],
      icon: "🧘",
      color: "from-indigo-600 to-slate-900",
      accent: "text-indigo-400",
      cta: "Align with Guide"
    },
    {
      id: 'shield',
      title: "The Biological Shield",
      subtitle: "Immediate Regulation",
      description: "When the 'Using-Self' creates a storm, our First Aid tools provide a manual override for your nervous system. We prioritise your safety above all else.",
      bullets: [
        { icon: "🌊", text: "TIPP: Biological reset for high arousal." },
        { icon: "🌬️", text: "Breathing: Manual vagus nerve control." },
        { icon: "🆘", text: "Crisis Card: Instant UK emergency uplink (999/111)." }
      ],
      icon: "🛡️",
      color: "from-rose-600 to-slate-900",
      accent: "text-rose-400",
      cta: "Initialise Ascent"
    }
  ];

  const current = steps[step];

  const handleNext = () => {
    if ('vibrate' in navigator) navigator.vibrate(15);
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const narrationText = current.description + (current.bullets ? ". " + current.bullets.map(b => b.text).join(". ") : "");

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-950 flex items-center justify-center p-0 md:p-12 overflow-hidden">
      {/* Immersive Atmospheric Backdrop */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute inset-0 bg-gradient-to-br ${current.color} opacity-20 transition-all duration-[2000ms]`} />
        
        {/* Pulsing Vagal Orb */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] transition-all duration-[3000ms] opacity-30 animate-pulse-slow bg-white/10`} />
        
        {/* Topographic Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="topo" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M0 50 Q 25 25 50 50 T 100 50" fill="none" stroke="white" strokeWidth="0.5" />
              <path d="M0 100 Q 25 75 50 100 T 100 100" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#topo)" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-4xl h-full md:h-auto md:max-h-[85vh] flex flex-col md:flex-row bg-white/5 backdrop-blur-3xl border-y md:border border-white/10 md:rounded-[60px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-1000">
        
        {/* Left Side: Expedition Trail Sidebar (Desktop) */}
        <div className="hidden md:flex flex-col w-48 border-r border-white/10 p-8 justify-between bg-black/20">
          <div className="space-y-12">
            {steps.map((s, i) => (
              <div key={s.id} className="relative flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-700 ${
                  i === step ? 'bg-white border-white text-black scale-125 shadow-[0_0_20px_white]' : 
                  i < step ? 'bg-teal-500/20 border-teal-500 text-teal-500' : 'bg-transparent border-white/20 text-white/20'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <div className="h-10 w-[2px] bg-white/10 absolute top-8" />
                <span className={`text-[8px] font-black uppercase tracking-widest text-center ${i === step ? 'text-white' : 'text-white/20'}`}>
                  {s.subtitle.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
          <div className="text-center">
            <span className="text-[7px] font-black text-white/20 uppercase tracking-[0.4em]">Protocol 3.1</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow flex flex-col p-8 md:p-20 relative overflow-y-auto no-scrollbar">
          <div className="flex-grow space-y-10">
            <header className="space-y-4">
              <div className="flex items-center justify-between">
                <Logo size="lg" variant="horizontal" />
                <div className="md:hidden flex gap-1.5">
                   {steps.map((_, i) => (
                     <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === step ? 'w-8 bg-white' : 'w-2 bg-white/20'}`} />
                   ))}
                </div>
                <SpeakButton text={narrationText} size={28} className="scale-125 md:scale-150" />
              </div>
              <div className="space-y-2">
                <p className={`${current.accent} font-black uppercase tracking-[0.5em] text-[10px] md:text-xs animate-pulse`}>
                  {current.subtitle}
                </p>
                <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-[0.9]">
                  {current.title}
                </h1>
              </div>
            </header>

            <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
               <p className="text-slate-300 text-lg md:text-2xl font-medium leading-relaxed italic font-serif border-l-4 border-white/10 pl-8">
                 "{current.description}"
               </p>

               {current.bullets && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {current.bullets.map((b, i) => (
                      <div key={i} className="flex items-start gap-4 p-6 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-all group">
                         <span className="text-3xl group-hover:scale-125 transition-transform">{b.icon}</span>
                         <p className="text-sm font-bold text-slate-300 leading-relaxed">{b.text}</p>
                      </div>
                    ))}
                 </div>
               )}

               {current.clinicalNote && (
                 <div className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-3xl flex items-center gap-4">
                    <span className="text-xl">🛡️</span>
                    <p className="text-[11px] font-black text-indigo-300 uppercase tracking-widest leading-relaxed">
                      {current.clinicalNote}
                    </p>
                 </div>
               )}
            </div>
          </div>

          <footer className="mt-16 pt-8 border-t border-white/10 flex flex-col items-center gap-6">
             <button 
               onClick={handleNext}
               className={`w-full py-6 md:py-8 rounded-3xl md:rounded-[32px] font-black uppercase tracking-[0.4em] text-xs md:text-sm transition-all shadow-2xl active:scale-[0.98] text-white bg-gradient-to-r ${current.color} hover:brightness-125 flex items-center justify-center gap-4 group`}
             >
               {current.cta}
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
               </svg>
             </button>
             <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] text-center">
                UK CLINICAL FRAMEWORK // GUIDED BY COMPASSION
             </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
