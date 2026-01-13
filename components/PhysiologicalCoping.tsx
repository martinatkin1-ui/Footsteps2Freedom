
import React, { useState, useEffect } from 'react';
import ModuleReflection from './ModuleReflection';
import SpeakButton from './SpeakButton';

const PhysiologicalCoping: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [view, setView] = useState<'intro' | 'breathing' | 'reflection'>('intro');
  const [timer, setTimer] = useState(180); // 3 mins
  const [isActive, setIsActive] = useState(false);
  const [breathState, setBreathState] = useState<'inhale' | 'exhale'>('inhale');

  useEffect(() => {
    let interval: any;
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(t => t - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsActive(false);
      setView('reflection');
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  useEffect(() => {
    let breathInterval: any;
    if (isActive) {
      breathInterval = setInterval(() => {
        setBreathState(s => s === 'inhale' ? 'exhale' : 'inhale');
      }, breathState === 'inhale' ? 4000 : 6000);
    }
    return () => clearInterval(breathInterval);
  }, [isActive, breathState]);

  if (view === 'reflection') {
    return <ModuleReflection moduleName="Physiological Coping" context="User completed 3 minutes of 4/6 paced breathing." onClose={onExit} />;
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in duration-1000 pb-32">
      {view === 'intro' ? (
        <div className="bg-white dark:bg-slate-900 rounded-[60px] p-8 md:p-12 border-2 border-slate-100 dark:border-slate-800 shadow-2xl space-y-10 relative overflow-hidden">
          <header className="text-center space-y-4">
             <div className="w-20 h-20 bg-teal-600 rounded-3xl flex items-center justify-center text-4xl text-white shadow-xl mx-auto">🧪</div>
             <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Hacking Your Nervous System</h2>
             <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 text-left">
                <h3 className="text-sm font-black uppercase text-teal-600 mb-2 tracking-widest">The 'Why'</h3>
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  Addiction and withdrawal keep the body in "fight or flight." These physiological skills physically force the body into a relaxed state using biology and the mammalian dive reflex, not just willpower.
                </p>
             </div>
          </header>

          <div className="space-y-6">
             <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">The 'When'</h4>
             <p className="text-slate-500 font-bold italic px-2">Use during panic attacks, extreme withdrawal anxiety, or intense fight/flight activation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
             <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-[40px] border border-slate-100 dark:border-slate-700 space-y-4">
                <div className="flex items-center gap-3">
                   <span className="text-2xl">❄️</span>
                   <h4 className="font-black text-slate-800 dark:text-white uppercase text-xs tracking-widest">Temperature Shift</h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-bold italic">"Splash face with ice-cold water while holding your breath to trigger the 'diving response', instantly slowing your heart rate."</p>
             </div>
             <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-[40px] border border-slate-100 dark:border-slate-700 space-y-4">
                <div className="flex items-center gap-3">
                   <span className="text-2xl">⚡</span>
                   <h4 className="font-black text-slate-800 dark:text-white uppercase text-xs tracking-widest">Intense Exercise (HIIT)</h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-bold italic">"Short bursts of high-intensity movement release natural endorphins to combat low tonic dopamine levels."</p>
             </div>
          </div>

          <button 
            onClick={() => setView('breathing')}
            className="w-full py-6 bg-teal-600 text-white font-black rounded-3xl shadow-xl hover:bg-teal-700 transition-all uppercase tracking-widest text-xs"
          >
            Start Paced Breathing Visualizer (3 Mins)
          </button>
        </div>
      ) : (
        <div className="bg-slate-950 rounded-[60px] p-16 text-center space-y-16 shadow-2xl relative overflow-hidden border-b-[12px] border-slate-900 ring-1 ring-white/10">
           <div className="space-y-4">
              <span className="text-[10px] font-black text-teal-500 uppercase tracking-[0.6em]">Vagus Nerve Anchor</span>
              <h3 className="text-6xl font-black text-white italic tracking-tighter uppercase">{breathState}</h3>
           </div>

           <div className="relative flex items-center justify-center h-80">
              <div className={`absolute w-64 h-64 rounded-full border-8 border-teal-500/20 shadow-[0_0_100px_rgba(20,184,166,0.1)] transition-all duration-[4000ms] ${breathState === 'inhale' ? 'scale-150 opacity-60' : 'scale-100 opacity-20'}`} />
              <div className={`w-40 h-40 rounded-full bg-teal-500 shadow-[0_0_50px_#14b8a6] transition-all duration-[6000ms] ease-in-out ${breathState === 'inhale' ? 'scale-125' : 'scale-75'}`} />
           </div>

           <div className="space-y-8">
              <div className="text-white text-5xl font-black tabular-nums">{Math.floor(timer/60)}:{(timer%60).toString().padStart(2, '0')}</div>
              {!isActive ? (
                <button 
                  onClick={() => setIsActive(true)}
                  className="px-14 py-6 bg-teal-600 text-white font-black rounded-3xl shadow-xl hover:bg-teal-700 transition-all active:scale-95 uppercase tracking-widest text-sm"
                >
                  Initiate Reset
                </button>
              ) : (
                <button 
                  onClick={() => setIsActive(false)}
                  className="px-10 py-4 bg-white/5 border border-white/10 text-white font-black rounded-2xl transition-all"
                >
                  Pause Session
                </button>
              )}
           </div>
           <button onClick={() => setView('intro')} className="text-slate-500 font-black uppercase text-[10px] tracking-widest mt-4">Back</button>
        </div>
      )}
    </div>
  );
};

export default PhysiologicalCoping;
