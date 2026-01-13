import React, { useState, useMemo, useEffect } from 'react';
import { MoodEntry, SobrietyData, AppRoute, RelapsePreventionPlan as RPPType, HaltLog } from '../types';
import { RECOVERY_PHASES, getRankData, COPING_EXERCISES } from '../constants.tsx';
import DailyAffirmationCard from './DailyAffirmationCard';
import { useRecoveryStore } from '../store';
import SpeakButton from './SpeakButton';

interface DashboardProps {
  sobriety: SobrietyData;
  moods: MoodEntry[];
  rppData: RPPType | null;
  onAddMood: (mood: MoodEntry) => void;
  onHelpMe: () => void;
  onOpenMoodModal: () => void;
  onAddMilestone: (milestone: string) => void;
  onUpdateSobrietyDate: (newDate: string) => void;
  onUpdateDailySpend: (spend: number) => void;
  onStartJourney: () => void;
  onStartExercise: (id: string) => void;
  onAwardFootsteps: (count: number) => void;
  onSetRoute: (route: AppRoute) => void;
  isDarkMode: boolean;
}

const CopingBar = ({ onStart }: { onStart: (id: string) => void }) => {
  const tools = [
    { id: 'stop-skill', icon: '🛑', label: 'STOP' },
    { id: 'tipp-skill', icon: '🌊', label: 'TIPP' },
    { id: 'breathing-exercises', icon: '🌬️', label: 'Breathe' },
    { id: 'grounding', icon: '🌍', label: 'Ground' }
  ];

  return (
    <div className="flex justify-between gap-2 px-2 pb-6">
      {tools.map(tool => (
        <button 
          key={tool.id}
          onClick={() => onStart(tool.id)}
          className="flex-1 bg-white/10 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 p-4 rounded-3xl flex flex-col items-center gap-2 active:scale-95 transition-all shadow-lg"
        >
          <span className="text-2xl">{tool.icon}</span>
          <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">{tool.label}</span>
        </button>
      ))}
    </div>
  );
};

const TopographicLines = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <filter id="distort-dash">
      <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="10" />
    </filter>
    <g filter="url(#distort-dash)">
      {[...Array(20)].map((_, i) => (
        <path key={i} d={`M-100 ${i * 50} Q 500 ${i * 50 - 50} 1100 ${i * 50}`} fill="none" stroke="currentColor" strokeWidth={0.5} />
      ))}
    </g>
  </svg>
);

const NatureBloom = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
    {[...Array(15)].map((_, i) => (
      <div 
        key={`bloom-${i}`}
        className="absolute bottom-[-10px] transition-all duration-[4000ms] ease-out"
        style={{
          left: `${i * 7}%`,
          height: `${25 + Math.random() * 35}%`,
          width: '3px',
          background: 'linear-gradient(to top, transparent, rgba(20, 184, 166, 0.15))',
          transformOrigin: 'bottom center',
          animation: `sway ${6 + Math.random() * 4}s ease-in-out infinite alternate`,
          animationDelay: `${i * 0.2}s`
        }}
      >
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-teal-300/30 rounded-full blur-[2px] animate-pulse"
          style={{
            background: i % 2 === 0 ? 'rgba(45, 212, 191, 0.3)' : 'rgba(129, 140, 248, 0.3)',
            animationDuration: `${3 + Math.random() * 2}s`
          }}
        >
          <div className="absolute inset-1 bg-white/20 rounded-full blur-[1px]" />
        </div>
      </div>
    ))}
    {[...Array(20)].map((_, i) => (
      <div 
        key={`glimmer-${i}`}
        className="absolute w-1 h-1 bg-teal-200/40 rounded-full blur-[0.5px]"
        style={{
          bottom: '0%',
          left: `${Math.random() * 100}%`,
          animation: `float-up ${12 + Math.random() * 12}s linear infinite`,
          animationDelay: `${Math.random() * 5}s`
        }}
      />
    ))}
  </div>
);

const JungleFoliage = () => (
  <svg className="absolute bottom-0 left-0 w-full h-[180px] opacity-[0.08] pointer-events-none" viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden="true">
    <path d="M0 200 C 50 120 150 180 200 100 C 250 160 350 80 400 140 C 450 60 550 120 600 80 C 650 140 750 60 800 120 C 850 40 950 100 1000 60 L 1000 200 Z" fill="currentColor" />
    <path d="M0 200 C 100 150 200 190 300 130 C 400 180 500 110 600 160 C 700 90 800 150 1000 100 L 1000 200 Z" fill="currentColor" opacity="0.5" />
  </svg>
);

const PhaseEnvironment = ({ phaseId }: { phaseId: number }) => {
  const themes = {
    1: "from-teal-900/40 via-slate-900 to-slate-950",
    2: "from-emerald-900/40 via-slate-900 to-slate-950",
    3: "from-amber-900/30 via-slate-900 to-slate-950",
    4: "from-indigo-900/40 via-slate-900 to-slate-950",
    5: "from-slate-800 via-slate-900 to-slate-950"
  };

  const currentGradient = themes[phaseId as keyof typeof themes] || themes[1];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none bg-slate-950" aria-hidden="true">
      <div className={`absolute inset-0 bg-gradient-to-br ${currentGradient}`} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 animate-pulse-slow bg-teal-500/20" />
      <TopographicLines />
      <NatureBloom />
      <JungleFoliage />
    </div>
  );
};

const HaltSliders = ({ onCommit }: { onCommit: (halt: Omit<HaltLog, 'date'>) => void }) => {
  const [scores, setScores] = useState({ hunger: 5, anger: 5, lonely: 5, tired: 5 });
  const [isSealing, setIsSealing] = useState(false);

  const maxVal = Math.max(...(Object.values(scores) as number[]));
  const isHighIntensity = maxVal >= 8;

  const handleSeal = () => {
    setIsSealing(true);
    setTimeout(() => {
      onCommit(scores);
      setIsSealing(false);
      setScores({ hunger: 5, anger: 5, lonely: 5, tired: 5 });
    }, 800);
  };

  const sections = [
    { key: 'hunger', label: 'Hunger', icon: '🍎', color: 'accent-emerald-400' },
    { key: 'anger', label: 'Anger', icon: '⚡', color: 'accent-orange-400' },
    { key: 'lonely', label: 'Lonely', icon: '👤', color: 'accent-indigo-400' },
    { key: 'tired', label: 'Tired', icon: '😴', color: 'accent-rose-400' }
  ];

  return (
    <div className="space-y-4 relative z-10 w-full" role="group" aria-labelledby="halt-title">
      <h4 id="halt-title" className="sr-only">Biological HALT Diagnostic</h4>
      <div className="grid grid-cols-1 gap-3">
        {sections.map((s) => {
          const score = scores[s.key as keyof typeof scores];
          const isCritical = score >= 8;
          return (
            <div key={s.key} className="space-y-1">
              <div className="flex justify-between items-center px-1">
                <label htmlFor={`halt-${s.key}`} className={`text-[11px] font-black uppercase flex items-center gap-2 ${isCritical ? 'text-rose-400 animate-pulse' : 'text-white/70'}`}>
                  <span aria-hidden="true">{s.icon}</span> {s.label}
                </label>
                <span className={`text-[11px] font-black transition-colors duration-500 ${isCritical ? 'text-rose-500 scale-110' : 'text-white'}`} aria-live="polite">
                  {score}/10
                </span>
              </div>
              <input 
                id={`halt-${s.key}`}
                type="range" min="1" max="10" 
                value={score}
                onChange={(e) => setScores({ ...scores, [s.key]: parseInt(e.target.value) })}
                className={`w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer focus-visible:ring-2 focus-visible:ring-white outline-none ${s.color}`}
                aria-valuemin={1}
                aria-valuemax={10}
                aria-valuenow={score}
              />
            </div>
          );
        })}
      </div>
      <button 
        onClick={handleSeal}
        disabled={isSealing}
        className={`w-full py-4 mt-2 font-black rounded-2xl shadow-lg transition-all uppercase tracking-widest text-[11px] active:scale-95 disabled:opacity-50 border border-white/5 focus-visible:ring-4 focus-visible:ring-white outline-none ${isHighIntensity ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse' : 'bg-white/10 text-white hover:bg-white/20'}`}
      >
        {isSealing ? 'Archiving Pulse...' : isHighIntensity ? 'Protocol Intervention Required' : 'Seal Biological Data'}
      </button>
    </div>
  );
};

// Fix: Added missing 'moods' prop to the component's destructuring to resolve the 'Cannot find name moods' error
const Dashboard: React.FC<DashboardProps> = ({ 
  sobriety, 
  moods,
  onOpenMoodModal, 
  onSetRoute,
  onAddMood,
  onStartJourney,
  onUpdateSobrietyDate,
  onUpdateDailySpend,
  onStartExercise
}) => {
  const store = useRecoveryStore();
  const user = store.user;
  const activePhaseId = store.activePhaseId;
  const completedIds = store.completedExercises;
  const goals = store.goals;
  const favoriteToolIds = store.favoriteToolIds;
  const completedLessons = store.completedLessons;
  
  const currentPhase = RECOVERY_PHASES.find(p => p.id === activePhaseId) || RECOVERY_PHASES[0];
  const rank = getRankData(sobriety.footsteps || 0);

  const sortedFavorites = useMemo(() => {
    const usageMap: Record<string, number> = {};
    completedLessons.forEach(lesson => {
      usageMap[lesson.exerciseId] = (usageMap[lesson.exerciseId] || 0) + 1;
    });

    return favoriteToolIds
      .map(id => COPING_EXERCISES.find(ex => ex.id === id))
      .filter((ex): ex is NonNullable<typeof ex> => !!ex)
      .sort((a, b) => (usageMap[b.id] || 0) - (usageMap[a.id] || 0));
  }, [favoriteToolIds, completedLessons]);

  const [timeState, setTimeState] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [newStartDate, setNewStartDate] = useState(sobriety.startDate.split('T')[0]);

  const [isEditingWealth, setIsEditingWealth] = useState(false);
  const [tempSpend, setTempSpend] = useState(sobriety.dailySpend?.toString() || '0');

  const [oneSentenceText, setOneSentenceText] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const start = new Date(sobriety.startDate).getTime();
      const now = new Date().getTime();
      const diff = now - start;
      setTimeState({
        days: Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24))),
        hours: Math.max(0, Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))),
        mins: Math.max(0, Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))),
        secs: Math.max(0, Math.floor((diff % (1000 * 60)) / 1000))
      });
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [sobriety.startDate]);

  const moneySaved = useMemo(() => {
    const totalDays = (new Date().getTime() - new Date(sobriety.startDate).getTime()) / (1000 * 60 * 60 * 24);
    return (Math.max(0, totalDays) * (sobriety.dailySpend || 0)).toFixed(2);
  }, [sobriety.startDate, sobriety.dailySpend]);

  const phaseProgress = useMemo(() => {
    const recommendedToolIds = currentPhase.recommendedToolIds || [];
    if (recommendedToolIds.length === 0) return 100;
    const completed = recommendedToolIds.filter(id => completedIds.includes(id)).length;
    return Math.round((completed / recommendedToolIds.length) * 100);
  }, [currentPhase, completedIds]);

  const handleHaltCommit = (halt: Omit<HaltLog, 'date'>) => {
    const maxVal = Math.max(...(Object.values(halt) as number[]));
    const isStruggling = maxVal >= 8;
    
    onAddMood({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      mood: isStruggling ? 'struggling' : 'neutral',
      note: isStruggling 
        ? `High biological intensity detected (${maxVal}/10). Protocol override suggested.` 
        : 'Bio-Log slider update.',
      halt: { ...halt, date: new Date().toISOString() }
    });

    if (isStruggling) {
      if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
    }
  };

  const handleUpdateDate = () => {
    onUpdateSobrietyDate(new Date(newStartDate).toISOString());
    setIsEditingDate(false);
    if ('vibrate' in navigator) navigator.vibrate(50);
  };

  const handleUpdateWealth = () => {
    onUpdateDailySpend(parseFloat(tempSpend) || 0);
    setIsEditingWealth(false);
    if ('vibrate' in navigator) navigator.vibrate(50);
  };

  const handleCommitTruth = () => {
    if (!oneSentenceText.trim()) return;
    store.oneSentenceTruth(oneSentenceText);
    setOneSentenceText('');
  };

  const activeGoal = goals.find(g => !g.isCompleted);

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 pb-32">
      
      {/* 3. Widget-Like Dashboards (Coping Bar) */}
      <CopingBar onStart={onStartExercise} />

      {/* Expedition Gate (Hero) */}
      <section className="bg-slate-950 rounded-[64px] border-4 border-white/5 shadow-2xl overflow-hidden relative min-h-[520px] flex flex-col items-center justify-center text-center p-8 md:p-12" aria-labelledby="welcome-heading">
        <PhaseEnvironment phaseId={activePhaseId} />
        
        <div className="relative z-10 space-y-10 w-full max-w-4xl">
          <div className="space-y-8">
             <div className="flex flex-col items-center gap-4">
               <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl px-6 py-2 rounded-full border border-white/10 shadow-sm" aria-hidden="true">
                 <span className="w-2 h-2 bg-teal-500 rounded-full animate-ping shadow-[0_0_10px_#14b8a6]" />
                 <span className="text-[11px] font-black text-white uppercase tracking-[0.6em]">Expedition Link Active</span>
               </div>
               <h1 id="welcome-heading" className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-none">
                 Welcome, <span className="bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">{user?.name.split(' ')[0] || 'Traveller'}</span>
               </h1>
             </div>

             <div className="space-y-3">
                <div className="flex items-center justify-center gap-4">
                   <span className="h-px w-8 bg-white/10" aria-hidden="true" />
                   <h2 className="text-xl md:text-3xl font-black text-white/90 uppercase tracking-[0.2em] italic">
                     {currentPhase.subtitle.split(':')[0]}
                   </h2>
                   <span className="h-px w-8 bg-white/10" aria-hidden="true" />
                </div>
                <p className="text-slate-300 text-lg md:text-xl font-medium italic opacity-90 leading-relaxed max-w-xl mx-auto font-serif">
                  "{currentPhase.atmosphere}"
                </p>
             </div>

             <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom-4 duration-1000 delay-500">
               <button 
                onClick={onStartJourney}
                className="px-12 py-5 bg-teal-600 hover:bg-teal-500 text-white rounded-3xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-teal-500/20 active:scale-95 focus-visible:ring-4 focus-visible:ring-white outline-none transition-all group"
                aria-label="Continue your recovery expedition"
               >
                 Continue My Expedition <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true">→</span>
               </button>
               
               {/* 4. Audio-Only "Sanctuary Mode" Trigger */}
               <button 
                onClick={() => onSetRoute(AppRoute.WALKING_MEDITATION)}
                className="px-12 py-5 bg-white/5 hover:bg-white/10 text-white border border-white/20 rounded-3xl font-black uppercase tracking-widest text-[11px] shadow-2xl active:scale-95 transition-all flex items-center gap-3"
                aria-label="Start guided walking meditation"
               >
                 <span>🚶</span> Guided Sanctuary
               </button>
             </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 md:gap-16 border-t border-white/5 pt-10 px-4">
             <div className="text-center group">
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2 group-hover:text-teal-400 transition-colors">Current Mantle</p>
                <p className="text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white">{rank.title}</p>
             </div>
             <div className="hidden md:block w-px h-12 bg-white/5" aria-hidden="true" />
             <div className="text-center group">
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2 group-hover:text-teal-400 transition-colors">Sector Integrity</p>
                <p className="text-xl font-black text-white tabular-nums tracking-tighter" aria-live="polite">{phaseProgress}%</p>
             </div>
          </div>
        </div>
      </section>

      {/* 5. Micro-Journaling (One-Sentence Truth) */}
      <section className="bg-white dark:bg-slate-900 rounded-[48px] p-8 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-6">
           <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900 rounded-2xl flex items-center justify-center text-xl shadow-inner shrink-0">💎</div>
           <div className="flex-grow w-full relative">
             <input 
              value={oneSentenceText}
              onChange={(e) => setOneSentenceText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCommitTruth()}
              placeholder="Record a 'Victory of the Moment' (One Sentence Truth)..."
              className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 py-4 pr-16 font-bold text-slate-700 dark:text-white focus:ring-4 focus:ring-teal-500/10 border-transparent outline-none transition-all"
             />
             <button 
              onClick={handleCommitTruth}
              disabled={!oneSentenceText.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-teal-600 text-white rounded-xl shadow-lg disabled:opacity-30 active:scale-95"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" /></svg>
             </button>
           </div>
        </div>
      </section>

      {/* Bento Expedition Modules */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 px-2">
        
        {/* Days of Freedom Widget */}
        <section className="md:col-span-4 bg-teal-950/40 backdrop-blur-3xl border border-white/10 p-10 rounded-[56px] shadow-2xl text-white flex flex-col justify-between group active:scale-[0.98] transition-all relative overflow-hidden h-[360px]" aria-labelledby="freedom-days-title">
           <div className="absolute top-0 right-0 w-48 h-48 bg-teal-400/10 rounded-full -mr-24 -mt-24 blur-3xl group-hover:scale-150 transition-transform duration-[4000ms]" />
           <div className="space-y-2 relative z-10 flex justify-between items-start">
              <div>
                <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-3xl shadow-inner group-hover:rotate-6 transition-transform" aria-hidden="true">🕊️</div>
                <h3 id="freedom-days-title" className="text-[11px] font-black uppercase tracking-[0.5em] text-teal-300 mt-2">Days of Freedom</h3>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsEditingDate(!isEditingDate); }}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all focus-visible:ring-2 focus-visible:ring-white outline-none"
                aria-label="Edit Start Date"
                aria-expanded={isEditingDate}
              >
                <span className="text-base" aria-hidden="true">📅</span>
              </button>
           </div>
           
           <div className="relative z-10 flex flex-col items-center justify-center flex-grow">
              {isEditingDate ? (
                <div className="space-y-4 w-full animate-in fade-in duration-300">
                  <label htmlFor="start-date-input" className="sr-only">New Start Date</label>
                  <input 
                    id="start-date-input"
                    type="date" 
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full bg-white/10 border-2 border-white/20 rounded-xl px-4 py-3 text-white text-center font-black outline-none focus:ring-4 focus:ring-teal-500/50"
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleUpdateDate(); }}
                      className="flex-grow py-3 bg-teal-600 rounded-xl text-[11px] font-black uppercase tracking-widest focus-visible:ring-2 focus-visible:ring-white outline-none"
                    >
                      Confirm Seal
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setIsEditingDate(false); }}
                      className="px-4 py-3 bg-white/5 rounded-xl text-[11px] font-black uppercase tracking-widest focus-visible:ring-2 focus-visible:ring-white outline-none"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-9xl font-black tracking-tighter leading-none tabular-nums drop-shadow-2xl" aria-live="polite">
                    {timeState.days}
                  </span>
                  <div className="flex gap-4 text-[11px] font-black text-teal-100/50 uppercase tracking-widest mt-6" aria-label={`${timeState.hours} hours, ${timeState.mins} minutes, ${timeState.secs} seconds`}>
                    <span className="group-hover:text-white transition-colors">{timeState.hours}H</span>
                    <span className="group-hover:text-white transition-colors">{timeState.mins}M</span>
                    <span className="text-teal-400/70">{timeState.secs}S</span>
                  </div>
                </div>
              )}
           </div>
           
           <div className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-400/30 pt-4 border-t border-white/5 relative z-10" aria-hidden="true">
             UK PROTOCOL // CONTINUOUS PRESENCE
           </div>
        </section>

        {/* Instant Relief Widget (Sorted by Most Used) */}
        <section className="md:col-span-8 bg-rose-950/20 backdrop-blur-3xl p-10 rounded-[56px] border border-white/10 shadow-2xl flex flex-col justify-between group transition-all relative overflow-hidden h-[360px]" aria-labelledby="relief-title">
           <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-125 transition-transform duration-[3000ms]" />
           
           <div className="relative z-10 flex items-center justify-between mb-6">
              <div className="flex items-center gap-5">
                 <div className="w-14 h-14 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-3xl shadow-inner group-hover:rotate-6 transition-transform" aria-hidden="true">🩹</div>
                 <div>
                    <h3 id="relief-title" className="text-2xl font-black text-white tracking-tight">Instant Relief</h3>
                    <p className="text-[11px] font-black text-rose-400 uppercase tracking-widest">Most Used Anchors</p>
                 </div>
              </div>
           </div>

           <div className="relative z-10 flex-grow overflow-y-auto no-scrollbar" role="list">
              {sortedFavorites.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sortedFavorites.slice(0, 4).map((tool) => {
                    const usageCount = completedLessons.filter(l => l.exerciseId === tool.id).length;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => onStartExercise(tool.id)}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl p-6 flex items-center justify-between group/tool active:scale-[0.98] focus-visible:ring-4 focus-visible:ring-rose-500/30 outline-none transition-all text-left"
                        role="listitem"
                        aria-label={`Start ${tool.title}, used ${usageCount} times`}
                      >
                         <div className="flex items-center gap-4">
                            <span className="text-3xl" aria-hidden="true">{tool.id.includes('breathing') ? '🌬️' : tool.id.includes('meditation') ? '🧘' : '🩹'}</span>
                            <div>
                               <h4 className="text-sm font-black text-white uppercase tracking-tight">{tool.title}</h4>
                               <p className="text-[10px] font-bold text-rose-300 uppercase tracking-widest">{usageCount} Successful Rides</p>
                            </div>
                         </div>
                         <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover/tool:bg-rose-600 transition-colors" aria-hidden="true">
                            <span className="text-xs">→</span>
                         </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                   <div className="text-5xl grayscale" aria-hidden="true">🔖</div>
                   <p className="text-slate-300 font-bold italic text-sm px-10 leading-relaxed">"Bookmark your favorite tactical tools to access them instantly during a storm."</p>
                </div>
              )}
           </div>

           <div className="relative z-10 pt-6 mt-4 border-t border-white/5">
              <button 
                onClick={() => onSetRoute(AppRoute.ALL_TOOLS)}
                className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-white outline-none rounded p-1"
              >
                Expand Recovery Library <span aria-hidden="true">↗</span>
              </button>
           </div>
        </section>

        {/* Strategic Marker Indicator */}
        <section 
          className="md:col-span-8 bg-indigo-950/40 backdrop-blur-3xl p-10 rounded-[56px] border border-white/10 shadow-2xl flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer overflow-hidden relative h-[260px]"
          onClick={() => onSetRoute(AppRoute.SMART_GOALS)}
          aria-labelledby="goal-title"
        >
           <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none group-hover:bg-indigo-400/10 transition-colors" />
           <div className="flex items-center gap-10 relative z-10">
              <div className="w-24 h-24 bg-white/5 text-indigo-100 rounded-3xl border border-white/10 flex items-center justify-center text-5xl shadow-inner group-hover:scale-110 transition-transform" aria-hidden="true">🧭</div>
              <div className="space-y-3">
                 <h3 id="goal-title" className="text-[11px] font-black text-indigo-300 uppercase tracking-[0.4em]">Active Marker</h3>
                 <p className="text-3xl font-black text-white tracking-tight leading-tight max-w-md">
                   {activeGoal ? activeGoal.title : "No Markers Set"}
                 </p>
                 {activeGoal && <p className="text-sm font-bold text-indigo-200/50 italic">Target: {activeGoal.timeBound}</p>}
              </div>
           </div>
           <button 
            className="hidden sm:block text-white font-black text-[11px] uppercase tracking-widest border-2 border-white/10 px-8 py-4 rounded-2xl group-hover:bg-white group-hover:text-indigo-950 transition-all relative z-10 focus-visible:ring-4 focus-visible:ring-white outline-none"
            aria-label={activeGoal ? "Update current marker" : "Set your first marker"}
           >
             {activeGoal ? "Update Marker" : "Set Marker"}
           </button>
        </section>

        {/* Bio-Pulse Module (HALT) */}
        <section className="md:col-span-4 bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[56px] border border-white/10 shadow-2xl flex flex-col justify-between group transition-all relative overflow-hidden h-[340px]" aria-labelledby="biopulse-title">
           <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-[2000ms]" />
           <div className="space-y-6 relative z-10 flex-grow">
              <div className="flex justify-between items-start">
                 <div className="w-14 h-14 bg-white/5 text-rose-300 rounded-2xl border border-white/10 flex items-center justify-center text-2xl shadow-inner group-hover:rotate-6 transition-transform" aria-hidden="true">🪷</div>
                 <div className="text-right">
                    <h3 id="biopulse-title" className="text-xl font-black text-white tracking-tight">Bio Pulse</h3>
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest" aria-hidden="true">HALT SCANNER</span>
                 </div>
              </div>
              <HaltSliders onCommit={handleHaltCommit} />
           </div>
        </section>

        {/* Freedom Wealth (Linked with Days) */}
        <section 
          className="md:col-span-4 bg-emerald-950/40 backdrop-blur-3xl p-10 rounded-[56px] border border-white/10 shadow-2xl text-white flex flex-col justify-between group active:scale-[0.98] transition-all relative overflow-hidden h-[260px]" 
          aria-labelledby="wealth-title"
        >
           <div className="absolute inset-0 bg-emerald-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
           <div className="space-y-8 relative z-10">
              <div className="flex justify-between items-start">
                <div className="w-16 h-16 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center text-4xl shadow-inner" aria-hidden="true">🌱</div>
                <button 
                  onClick={() => setIsEditingWealth(!isEditingWealth)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all focus-visible:ring-2 focus-visible:ring-white outline-none"
                  aria-label="Update Daily Expenditure"
                  aria-expanded={isEditingWealth}
                >
                  <span className="text-base" aria-hidden="true">🪙</span>
                </button>
              </div>
              
              <div className="space-y-1">
                 <div className="flex justify-between items-end">
                    <h3 id="wealth-title" className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-300">Freedom Wealth</h3>
                    {!isEditingWealth && (
                      <p className="text-[10px] font-black text-emerald-500/70 uppercase tracking-widest mb-0.5" aria-hidden="true">
                        {timeState.days}D x £{sobriety.dailySpend || 0}
                      </p>
                    )}
                 </div>
                 
                 {isEditingWealth ? (
                   <div className="space-y-4 w-full animate-in slide-in-from-top-2 duration-300 pt-2">
                     <div className="flex flex-col gap-1">
                        <label htmlFor="wealth-input" className="text-[10px] font-black uppercase text-emerald-500/80 ml-2">Daily Expenditure (£)</label>
                        <input 
                          id="wealth-input"
                          autoFocus
                          type="number" 
                          value={tempSpend}
                          onChange={(e) => setTempSpend(e.target.value)}
                          className="w-full bg-white/10 border-2 border-white/20 rounded-xl px-4 py-3 text-white text-center font-black outline-none focus:ring-4 focus:ring-emerald-500"
                        />
                     </div>
                     <div className="flex gap-2">
                        <button 
                          onClick={handleUpdateWealth}
                          className="flex-grow py-2 bg-emerald-600 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg focus-visible:ring-2 focus-visible:ring-white outline-none"
                        >
                          Archive
                        </button>
                        <button 
                          onClick={() => setIsEditingWealth(false)}
                          className="px-4 py-2 bg-white/5 rounded-xl text-[11px] font-black uppercase tracking-widest focus-visible:ring-2 focus-visible:ring-white outline-none"
                        >
                          ✕
                        </button>
                     </div>
                   </div>
                 ) : (
                   <div aria-live="polite">
                     <p className="text-5xl font-black tabular-nums tracking-tighter drop-shadow-xl">£{moneySaved}</p>
                     <p className="text-[11px] font-bold italic opacity-60 mt-2 tracking-widest uppercase text-emerald-100">Reclaimed Capital Accumulated</p>
                   </div>
                 )}
              </div>
           </div>
        </section>
      </div>

      {/* Biological Shield Bar */}
      <section 
        onClick={() => onSetRoute(AppRoute.FIRST_AID)}
        className="bg-rose-950/60 backdrop-blur-3xl rounded-[56px] p-10 md:p-14 text-white flex flex-col md:flex-row items-center justify-between gap-12 shadow-[0_40px_80px_rgba(0,0,0,0.6)] group cursor-pointer active:scale-[0.99] transition-all border-t border-l border-white/10 border-b-[12px] border-rose-950/80 relative overflow-hidden"
        aria-labelledby="shield-title"
      >
        <div className="absolute inset-0 bg-white/5 animate-shimmer pointer-events-none opacity-10" />
        <div className="flex flex-col md:flex-row items-center gap-10 text-center md:text-left relative z-10">
           <div className="w-28 h-28 bg-white/5 backdrop-blur-xl rounded-[44px] flex items-center justify-center text-6xl shadow-inner border border-white/10 group-hover:scale-110 transition-transform duration-700" aria-hidden="true">🛡️</div>
           <div className="space-y-3">
              <div className="flex items-center justify-center md:justify-start gap-4">
                 <h3 id="shield-title" className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">BIOLOGICAL SHIELD</h3>
                 <div className="w-5 h-5 bg-white rounded-full animate-ping" aria-hidden="true" />
              </div>
              <p className="text-rose-100 text-xl md:text-2xl font-bold italic opacity-90 max-w-2xl font-serif">
                "Immediate biological overrides and direct UK emergency support for the heaviest moments."
              </p>
           </div>
        </div>
        <div className="shrink-0 relative z-10">
           <button 
            className="bg-white text-rose-950 px-14 py-7 rounded-[28px] font-black uppercase tracking-[0.3em] text-sm shadow-2xl group-hover:bg-rose-50 transition-all border-b-4 border-slate-300 active:border-b-0 active:translate-y-1 focus-visible:ring-8 focus-visible:ring-rose-500/50 outline-none"
            aria-label="Deploy Biological Shield"
           >
             DEPLOY SHIELD
           </button>
        </div>
      </section>

      {/* Mantra of Presence */}
      <footer className="bg-slate-950/80 backdrop-blur-3xl rounded-[64px] p-16 text-center relative overflow-hidden group border border-white/5 shadow-2xl" role="contentinfo">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.03),transparent)]" aria-hidden="true" />
         <p className="text-slate-500 text-[12px] font-black uppercase tracking-[0.8em] mb-6 animate-pulse">Mantra of Presence</p>
         <h3 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter leading-tight max-w-4xl mx-auto font-serif">
           "I am not my thoughts, I am the observer of them."
         </h3>
      </footer>
    </div>
  );
};

export default Dashboard;
