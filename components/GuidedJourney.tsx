
import React, { useMemo } from 'react';
import { COPING_EXERCISES, RECOVERY_PHASES } from '../constants';
import { useRecoveryStore } from '../store';

const JungleFoliage = ({ opacity = "opacity-[0.1]" }: { opacity?: string }) => (
  <svg className={`absolute bottom-0 left-0 w-full h-[600px] ${opacity} pointer-events-none`} viewBox="0 0 1000 600" preserveAspectRatio="none">
    <path d="M0 600 C 100 300 200 500 300 250 C 400 450 500 150 600 350 C 700 200 800 450 900 150 C 1000 300 1100 600 0 600" fill="#064e3b" />
    <path d="M0 600 C 150 400 250 550 350 300 C 450 500 550 200 650 400 C 750 250 850 450 1000 250 L 1000 600 Z" fill="#065f46" opacity="0.5" />
    <circle cx="100" cy="500" r="40" fill="#0d9488" opacity="0.2" />
    <circle cx="800" cy="400" r="60" fill="#0d9488" opacity="0.1" />
  </svg>
);

const TopographicLines = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <filter id="distort">
      <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="25" />
    </filter>
    <g filter="url(#distort)">
      {[...Array(30)].map((_, i) => (
        <path key={i} d={`M-100 ${i * 200} Q 500 ${i * 200 - 100} 1100 ${i * 200}`} fill="none" stroke="white" strokeWidth="1" />
      ))}
    </g>
  </svg>
);

const CairnMarker: React.FC<{ count: number, isCompleted: boolean, isLocked: boolean, isNext: boolean, theme: any, onClick: () => void }> = ({ count, isCompleted, isLocked, isNext, theme, onClick }) => {
  const stones = useMemo(() => {
    const num = 4 + (count % 3);
    return Array.from({ length: num }).map((_, i) => ({
      width: 48 - (i * 8),
      height: 16 - (i * 1.2),
      rotate: Math.sin(i * 2.2) * 20,
      offset: Math.cos(i * 1.5) * 8
    }));
  }, [count]);

  return (
    <div 
      onClick={!isLocked ? onClick : undefined}
      className={`relative flex flex-col-reverse items-center group/cairn transition-all duration-500 ${isLocked ? 'cursor-not-allowed opacity-20 grayscale' : 'cursor-pointer hover:scale-110 active:scale-95'}`}
    >
      {stones.map((s, i) => (
        <div 
          key={i}
          style={{ 
            width: `${s.width}px`, 
            height: `${s.height}px`,
            transform: `rotate(${s.rotate}deg) translateX(${s.offset}px)`,
            marginBottom: '-6px',
            zIndex: 10 - i
          }}
          className={`rounded-[45%_55%_65%_35%_/45%_45%_65%_45%] border-2 transition-all duration-1000 ${
            isCompleted 
              ? `${theme.marker} border-white/40 shadow-[0_0_25px_rgba(255,255,255,0.3)]` 
              : isNext
                ? 'bg-white border-white shadow-[0_0_20px_white] scale-110'
                : isLocked 
                  ? 'bg-slate-900 border-white/5'
                  : 'bg-slate-800 border-white/10 group-hover/cairn:border-white/20'
          }`}
        />
      ))}
      
      {isCompleted && (
        <div className="absolute -top-12 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white/50 animate-in zoom-in duration-700 z-30">
           <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010.0 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
           </svg>
        </div>
      )}

      {isLocked && (
        <div className="absolute -top-10 text-slate-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      )}

      <div className={`mt-8 text-[10px] font-black tracking-widest transition-colors ${isCompleted ? 'text-teal-300 drop-shadow-md' : isNext ? 'text-white scale-125' : isLocked ? 'text-slate-800' : 'text-slate-500 group-hover:text-white'}`}>
        {count.toString().padStart(2, '0')}
      </div>
    </div>
  );
};

interface GuidedJourneyProps {
  completedIds: string[];
  onStartExercise: (id: string) => void;
}

const GuidedJourney: React.FC<GuidedJourneyProps> = ({ completedIds, onStartExercise }) => {
  const store = useRecoveryStore();
  const { favoriteToolIds, toggleFavoriteTool } = store;
  
  const journeySteps = useMemo(() => 
    [...COPING_EXERCISES].sort((a, b) => (a.recommendedPhase || 0) - (b.recommendedPhase || 0)), 
  []);
  
  const completionPercentage = Math.round((completedIds.length / journeySteps.length) * 100);

  // Identify the absolute next step to highlight
  const nextStepId = useMemo(() => {
    return journeySteps.find(s => !completedIds.includes(s.id))?.id;
  }, [journeySteps, completedIds]);

  const getPhaseTheme = (phaseId: number) => {
    switch (phaseId) {
      case 1:
        return { 
          accent: 'text-emerald-400', 
          marker: 'bg-emerald-600', 
          trail: 'from-emerald-900/40 via-teal-800/20 to-teal-900/10',
          bg: 'from-slate-950 via-emerald-950/30 to-slate-950',
          glow: 'bg-emerald-900/40', 
          icon: '🌴', 
          elevation: '0m'
        };
      case 2:
        return { 
          accent: 'text-teal-400', 
          marker: 'bg-teal-50', 
          trail: 'from-teal-800/40 via-cyan-800/20 to-cyan-900/10',
          bg: 'from-slate-950 via-teal-950/20 to-slate-950',
          glow: 'bg-teal-900/30', 
          icon: '🌿', 
          elevation: '1,200m' 
        };
      case 3:
        return { 
          accent: 'text-amber-400', 
          marker: 'bg-amber-500', 
          trail: 'from-cyan-800/40 via-amber-800/20 to-amber-900/10',
          bg: 'from-slate-950 via-amber-950/20 to-slate-950',
          glow: 'bg-amber-900/30', 
          icon: '🌲', 
          elevation: '2,800m' 
        };
      case 4:
        return { 
          accent: 'text-indigo-400', 
          marker: 'bg-indigo-500', 
          trail: 'from-amber-800/40 via-indigo-800/20 to-indigo-900/10',
          bg: 'from-slate-950 via-indigo-950/30 to-slate-950',
          glow: 'bg-indigo-900/40', 
          icon: '🌌', 
          elevation: '4,100m' 
        };
      case 5:
        return { 
          accent: 'text-white', 
          marker: 'bg-white', 
          trail: 'from-indigo-800/40 via-white/10 to-transparent',
          bg: 'from-slate-950 via-slate-800/20 to-slate-950',
          glow: 'bg-slate-700/50', 
          icon: '🏔️', 
          elevation: '5,895m' 
        };
      default:
        return { accent: 'text-white', marker: 'bg-white', trail: 'from-white/10 to-white/10', bg: 'bg-slate-950', glow: 'bg-white/10', icon: '📍', elevation: '???' };
    }
  };

  return (
    <div className="relative min-h-screen rounded-[60px] overflow-hidden bg-slate-950 text-white shadow-[0_0_120px_rgba(0,0,0,0.6)] selection:bg-teal-500/30">
      {/* Immersive Vertical Backdrop */}
      <div className="absolute inset-0 z-0 flex flex-col pointer-events-none">
         {RECOVERY_PHASES.map(p => (
           <div key={p.id} className={`flex-1 w-full bg-gradient-to-b ${getPhaseTheme(p.id).bg}`} />
         ))}
      </div>
      
      <TopographicLines />
      <JungleFoliage opacity="opacity-[0.15]" />
      
      {/* Upper Jungle Layer */}
      <div className="absolute top-0 left-0 w-full h-[300px] opacity-[0.05] pointer-events-none rotate-180">
        <JungleFoliage />
      </div>

      {/* Global Progress Header */}
      <header className="sticky top-0 z-50 px-6 md:px-12 py-8 bg-slate-950/60 backdrop-blur-3xl border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
        <div className="space-y-2 group w-full md:w-auto">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 bg-teal-500 rounded-full animate-pulse shadow-[0_0_15px_#14b8a6]"></span>
            <h2 className="text-2xl font-black tracking-[0.5em] uppercase italic bg-gradient-to-r from-white via-slate-400 to-white bg-clip-text text-transparent group-hover:via-teal-400 transition-all duration-1000">The Ascent</h2>
          </div>
          <div className="flex items-center gap-8">
             <div className="flex flex-col">
               <span className="text-[9px] font-black uppercase tracking-[0.6em] text-slate-500 mb-1">Elevation</span>
               <span className="text-xl font-black text-teal-400 tabular-nums">{(completionPercentage * 58.95).toFixed(0)}m</span>
             </div>
             <div className="w-px h-10 bg-white/10" />
             <div className="flex flex-col">
               <span className="text-[9px] font-black uppercase tracking-[0.6em] text-slate-500 mb-1">Zone Status</span>
               <span className="text-base font-black text-slate-200 uppercase tracking-tight">{RECOVERY_PHASES.find(p => p.id === store.activePhaseId)?.environment || 'Basecamp'}</span>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-12 w-full md:w-auto justify-between md:justify-end">
           <div className="text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Discovered Footpath</p>
              <p className="text-3xl font-black text-white">{completionPercentage}%</p>
           </div>
           <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 drop-shadow-[0_0_20px_rgba(20,184,166,0.3)]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth={10} fill="transparent" className="text-white/5" />
                <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth={10} fill="transparent" 
                  strokeDasharray={276} strokeDashoffset={276 - (276 * completionPercentage) / 100}
                  strokeLinecap="round"
                  className="text-teal-400 transition-all duration-2000 ease-out" 
                />
              </svg>
              <span className="absolute text-xl">🎋</span>
           </div>
        </div>
      </header>

      {/* The Actual Path Scroll */}
      <div className="relative z-10 px-4 md:px-12 lg:px-24 pt-20 pb-96 max-w-7xl mx-auto">
        {RECOVERY_PHASES.map((phase) => {
          const theme = getPhaseTheme(phase.id);
          const phaseSteps = journeySteps.filter(s => s.recommendedPhase === phase.id);
          
          return (
            <section key={phase.id} className="relative mb-80 last:mb-0">
              {/* Phase Header Intro */}
              <div className="flex flex-col md:flex-row items-end justify-between gap-12 mb-48 animate-in slide-in-from-left-12 duration-1000">
                <div className={`p-10 md:p-14 rounded-[56px] ${theme.glow} border-4 border-white/10 backdrop-blur-3xl shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative group overflow-hidden max-w-2xl w-full`}>
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  <div className="text-8xl mb-8 drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] animate-float">{theme.icon}</div>
                  <span className="text-[11px] font-black uppercase tracking-[0.8em] text-teal-500/80 mb-4 block">{phase.environment}</span>
                  <h3 className={`text-5xl md:text-6xl font-black tracking-tighter ${theme.accent} mb-6 leading-none`}>{phase.title.split(': ')[1]}</h3>
                  <p className="text-slate-300 text-xl font-medium leading-relaxed italic border-l-4 border-white/10 pl-8">
                    "{phase.atmosphere}"
                  </p>
                </div>
                
                <div className="text-right space-y-4 pr-6">
                   <div className="flex flex-col items-end">
                      <span className="text-[12px] text-white/30 font-black uppercase tracking-[0.6em]">{phase.subtitle}</span>
                      <div className="h-1 w-24 bg-gradient-to-l from-teal-500 to-transparent rounded-full mt-2" />
                   </div>
                   <div className="flex items-center justify-end gap-4">
                      <div className="flex flex-col">
                        <span className="text-10 font-black uppercase tracking-[0.4em] text-slate-500">Altitude Reading</span>
                        <span className="text-2xl font-black text-white tabular-nums">{theme.elevation}</span>
                      </div>
                   </div>
                </div>
              </div>

              {/* The Vertical Trail of Steps */}
              <div className="relative ml-2 md:ml-16 space-y-56">
                {phaseSteps.map((step, idx) => {
                  const isCompleted = completedIds.includes(step.id);
                  const isFavorite = favoriteToolIds.includes(step.id);
                  const stepGlobalIdx = journeySteps.findIndex(s => s.id === step.id);
                  const displayNum = stepGlobalIdx + 1;
                  
                  // Unlock logic: First item is always unlocked, others require previous item completed
                  const isUnlocked = stepGlobalIdx === 0 || completedIds.includes(journeySteps[stepGlobalIdx - 1].id);
                  const isLocked = !isUnlocked && !isCompleted;
                  const isNext = step.id === nextStepId;

                  const lessonHistory = store.completedLessons.filter(l => l.exerciseId === step.id);
                  const latestArt = lessonHistory.length > 0 ? lessonHistory[lessonHistory.length - 1].artUrl : undefined;
                  
                  return (
                    <div key={step.id} className={`relative flex items-stretch gap-10 md:gap-20 group transition-all duration-1000 ${isNext ? 'scale-105' : ''}`}>
                      {/* Visual Trail Connector */}
                      <div className={`absolute left-0 -translate-x-1/2 top-24 bottom-[-224px] w-[5px] rounded-full transition-all duration-[2000ms] z-0 overflow-hidden ${
                        isCompleted ? 'opacity-100' : 'opacity-20'
                      }`}>
                         <div className={`w-full h-full bg-gradient-to-b ${theme.trail}`} />
                         {isCompleted && (
                           <div className="absolute inset-0 bg-white/30 animate-[shimmer_3s_infinite]" />
                         )}
                      </div>

                      {/* Marker Column */}
                      <div className="relative z-20 shrink-0 w-24 flex flex-col items-center pt-4 pb-4">
                        <CairnMarker 
                          count={displayNum} 
                          isCompleted={isCompleted} 
                          isLocked={isLocked}
                          isNext={isNext}
                          theme={theme} 
                          onClick={() => onStartExercise(step.id)}
                        />
                        
                        {!isLocked && (
                          <div className="mt-auto">
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleFavoriteTool(step.id); }}
                              className={`p-4 rounded-3xl transition-all shadow-2xl active:scale-90 border-2 backdrop-blur-xl ${isFavorite ? 'bg-rose-600 border-rose-400 text-white shadow-rose-600/30 scale-110' : 'bg-white/5 text-white/20 border-white/5 hover:text-rose-400 hover:bg-white/10'}`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Content Card */}
                      <div 
                        onClick={() => !isLocked && onStartExercise(step.id)}
                        className={`flex-grow rounded-[64px] border-4 p-10 md:p-14 transition-all duration-1000 relative overflow-hidden h-fit flex flex-col justify-center items-center text-center min-w-0 ${
                          isLocked 
                            ? 'bg-slate-950/60 border-white/5 opacity-40 cursor-not-allowed grayscale scale-[0.97]' 
                            : isCompleted 
                              ? 'border-teal-400/50 shadow-[0_0_80px_rgba(20,184,166,0.5)] cursor-pointer bg-white/5 backdrop-blur-[20px]' 
                              : isNext
                                ? 'bg-white/10 border-white/40 cursor-pointer shadow-[0_0_40px_rgba(255,255,255,0.2)] ring-4 ring-white/10'
                                : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.08] hover:border-white/20 cursor-pointer backdrop-blur-3xl group-hover:-translate-y-4 shadow-2xl'
                        }`}
                      >
                         {latestArt && !isLocked && (
                           <>
                             <img src={latestArt} className="absolute inset-0 w-full h-full object-cover opacity-90 z-0 scale-110 group-hover:scale-100 transition-transform duration-[6000ms] saturate-[1.2]" alt="" />
                             <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] z-[1]" />
                             <div className="absolute inset-0 bg-gradient-to-b from-slate-950/10 via-transparent to-slate-950/90 z-[2]" />
                           </>
                         )}

                         <div className="relative z-10 space-y-8 w-full max-w-4xl flex flex-col items-center">
                            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-2">
                              <div className="flex items-center gap-4">
                                <span className={`text-[10px] font-black uppercase tracking-[0.5em] ${isLocked ? 'text-slate-700' : theme.accent} opacity-90 px-6 py-2.5 rounded-full border border-white/10 bg-black/60 backdrop-blur-2xl shadow-xl`}>
                                  {step.category}
                                </span>
                                {isCompleted && (
                                  <div className="flex items-center gap-2 bg-emerald-500 text-white border-2 border-emerald-400 px-5 py-2 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)] animate-in zoom-in">
                                    <span className="text-[10px] font-black uppercase tracking-widest">RECORD_INTEGRATED</span>
                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_white]" />
                                  </div>
                                )}
                              </div>
                              {isLocked && (
                                <div className="bg-slate-900/80 p-3 rounded-2xl border border-white/10 shadow-inner">
                                  <span className="text-slate-500 text-2xl">🔒</span>
                                </div>
                              )}
                            </div>

                            <div className="space-y-6 flex flex-col items-center">
                               <h4 className={`text-4xl md:text-7xl font-black transition-all duration-700 tracking-tighter leading-[0.9] text-center max-w-3xl ${isLocked ? 'text-slate-800' : isCompleted ? 'text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]' : 'text-slate-100 group-hover:text-white'}`}>
                                 {step.title}
                               </h4>
                               <div className={`h-1.5 w-40 bg-gradient-to-r ${isCompleted ? 'from-emerald-400 via-white to-emerald-400 shadow-[0_0_25px_white]' : 'from-teal-600 via-indigo-500 to-teal-600'} rounded-full mx-auto shadow-lg animate-pulse`} />
                            </div>
                            
                            <p className={`text-xl md:text-2xl font-medium leading-relaxed group-hover:text-white transition-colors italic whitespace-normal break-words max-w-3xl text-center drop-shadow-lg ${isLocked ? 'text-slate-900' : isCompleted ? 'text-white font-bold' : 'text-slate-400'}`}>
                              "{isLocked ? 'Sector restricted. Complete previous landmarks to unlock this path.' : step.description}"
                            </p>

                            <div className={`pt-10 mt-8 border-t border-white/20 w-full flex flex-col sm:flex-row items-center justify-center gap-10 ${isLocked ? 'text-slate-900' : isCompleted ? 'text-white' : 'text-slate-500'}`}>
                               <div className={`flex items-center gap-4 text-xs font-black uppercase tracking-[0.6em] transition-all ${!isLocked && 'group-hover:gap-10 group-hover:text-white'}`}>
                                 {isLocked ? 'PROTOCOLS_SUSPENDED' : isCompleted ? 'Visit Archived Artifact' : 'Initiate Ascent'} {!isLocked && <span className="text-4xl">→</span>}
                               </div>
                               
                               <div className="flex items-center gap-3 opacity-80">
                                  <span className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 bg-black/40 rounded-xl border border-white/10 backdrop-blur-md shadow-sm">FW: {step.framework}</span>
                               </div>
                            </div>
                         </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        <section className="relative mt-96 pb-80 text-center space-y-24 animate-in fade-in duration-1000">
           <div className="relative inline-block group">
              <div className="absolute inset-0 bg-teal-400/40 rounded-full blur-[100px] animate-pulse group-hover:scale-150 transition-transform duration-[4000ms]" />
              <div className="w-56 h-56 md:w-64 md:h-64 bg-slate-900 border-8 border-white/10 backdrop-blur-3xl rounded-[72px] flex items-center justify-center text-[100px] mx-auto shadow-[0_0_150px_rgba(255,255,255,0.15)] relative z-10 rotate-45 hover:rotate-[225deg] transition-transform duration-[5000ms] cursor-default">
                <span className="-rotate-45 group-hover:rotate-[-225deg] transition-transform duration-[5000ms]">🌴</span>
              </div>
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-48 h-4 bg-teal-500/30 rounded-full blur-2xl" />
           </div>
           
           <div className="space-y-8 px-6 max-w-5xl mx-auto">
             <h3 className="text-6xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.8] bg-gradient-to-b from-white via-white to-slate-700 bg-clip-text text-transparent">Peak of Potential</h3>
             <p className="text-slate-400 text-3xl leading-relaxed font-medium italic border-t-2 border-white/10 pt-12 tracking-tight">
               "The summit is not the end of the journey, but the viewpoint where you finally see the vast world you have reclaimed from the storm."
             </p>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto px-6 pt-12">
              {[
                { label: 'Artifacts Secured', value: completedIds.length, sub: 'Landmark Insights', icon: '🎨' },
                { label: 'Vertical Gain', value: `${(completionPercentage * 58.95).toFixed(0)}m`, sub: 'Total Elevation', icon: '📈' },
                { label: 'True-Self Mastery', value: `${completionPercentage}%`, sub: 'Integration Status', icon: '💎' }
              ].map((stat, i) => (
                <div key={i} className="group p-12 bg-white/[0.03] backdrop-blur-3xl rounded-[56px] border-2 border-white/5 text-center transition-all hover:bg-white/[0.08] hover:border-white/20 hover:-translate-y-4 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mt-12 group-hover:scale-150 transition-transform duration-1000" />
                  <div className="text-5xl mb-8 opacity-30 group-hover:opacity-100 transition-opacity duration-1000 transform group-hover:rotate-12">{stat.icon}</div>
                  <p className="text-[11px] font-black uppercase text-slate-500 tracking-[0.6em] mb-4">{stat.label}</p>
                  <p className="text-6xl font-black text-white tabular-nums tracking-tighter drop-shadow-2xl">
                    {stat.value}
                  </p>
                  <p className="text-[10px] font-bold text-teal-400 uppercase tracking-[0.5em] mt-6 opacity-80">{stat.sub}</p>
                </div>
              ))}
           </div>
        </section>
      </div>

      <div className="fixed inset-0 pointer-events-none z-30 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,10,0,0.5)_100%)]" />
      <div className="fixed bottom-0 left-0 right-0 h-[40vh] bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent pointer-events-none z-30" />
    </div>
  );
};

export default GuidedJourney;
    