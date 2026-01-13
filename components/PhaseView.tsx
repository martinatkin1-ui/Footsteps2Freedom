
import React from 'react';
import { RECOVERY_PHASES, COPING_EXERCISES } from '../constants';
import { useRecoveryStore } from '../store';
import SpeakButton from './SpeakButton';

interface PhaseViewProps {
  phaseId: number;
  onStartExercise: (id: string) => void;
  completedIds: string[];
}

const PHASE_TWO_EXPLANATIONS: Record<string, string> = {
  'tipp-skill': 'T: Temperature, I: Intense Exercise, P: Paced Breathing, P: Paired Muscle Relaxation. Used for immediate biological resets.',
  'accepts-skill': 'A: Activities, C: Contributing, C: Comparisons, E: Emotions, P: Pushing away, T: Thoughts, S: Sensations. Strategies for crisis distraction.',
  'improve-skill': 'I: Imagery, M: Meaning, P: Prayer, R: Relaxation, O: One thing, V: Vacation, E: Encouragement. Mindset shifts to improve the moment.',
  'urge-surfing': 'Treating a craving like a wave; observing it from start to finish without letting it knock you over.',
  'radical-acceptance': 'The choice to stop fighting reality, which reduces the "suffering" added on top of unavoidable pain.',
  'somatic-toolkit': 'Techniques like body tapping or wall pushes that ground the nervous system through physical exertion.',
  'inner-critic-challenge': 'Identifying the harsh internal judge and replacing it with the compassionate voice of the True-Self.',
  'video-sanctuary': 'Immersive visual environments used to manually down-regulate the amygdala during high stress.',
  'rpp-builder': 'Constructing a strategic blueprint of triggers and supports to prevent a return to old patterns.',
  'exposure_tool': 'Gradually facing situations that cause anxiety to build confidence and "neural grit" in Phase 2.',
  'meditation-timer': 'Focused stillness to build the muscle of the "Observing Self," critical for noticing urges before they act.'
};

const Cairn: React.FC<{ 
  total: number; 
  completed: number; 
  colorClass: string; 
  size?: 'sm' | 'lg' 
}> = ({ total, completed, colorClass, size = 'sm' }) => {
  const stones = Array.from({ length: total }, (_, i) => i);
  const isLarge = size === 'lg';
  
  return (
    <div className={`flex flex-col-reverse items-center ${isLarge ? 'gap-1' : 'gap-0.5'}`}>
      {stones.map((i) => {
        const isDone = i < completed;
        const scale = 1 - (i * 0.05);
        const width = isLarge ? 64 * scale : 20 * scale;
        const height = isLarge ? 28 * scale : 8 * scale;
        
        return (
          <div 
            key={i}
            style={{ width: `${width}px`, height: `${height}px` }}
            className={`rounded-full transition-all duration-1000 border shadow-sm ${
              isDone 
                ? `${colorClass} border-white/20 shadow-inner opacity-100` 
                : 'bg-slate-200 dark:bg-slate-800 border-dashed border-slate-300 dark:border-slate-700 opacity-20'
            }`}
          />
        );
      })}
    </div>
  );
};

const PhaseView: React.FC<PhaseViewProps> = ({ phaseId, onStartExercise, completedIds }) => {
  const store = useRecoveryStore();
  const { favoriteToolIds, toggleFavoriteTool } = store;
  const currentPhase = RECOVERY_PHASES.find(p => p.id === phaseId) || RECOVERY_PHASES[0];

  const getAccentColors = (color: string) => {
    const map: Record<string, any> = {
      teal: { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-100', button: 'bg-teal-600', lightText: 'text-teal-600', progress: 'bg-teal-500', stone: 'bg-emerald-500', glow: 'from-teal-500/10' },
      emerald: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-100', button: 'bg-emerald-600', lightText: 'text-teal-600', progress: 'bg-emerald-500', stone: 'bg-teal-500', glow: 'from-emerald-500/10' },
      amber: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-100', button: 'bg-amber-600', lightText: 'text-amber-600', progress: 'bg-amber-500', stone: 'bg-amber-500', glow: 'from-amber-500/10' },
      indigo: { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-100', button: 'bg-indigo-600', lightText: 'text-indigo-600', progress: 'bg-indigo-500', stone: 'bg-indigo-500', glow: 'from-indigo-500/10' },
      slate: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-200', button: 'bg-slate-800', lightText: 'text-slate-50', progress: 'bg-slate-500', stone: 'bg-slate-400', glow: 'from-slate-500/10' },
    };
    return map[color] || map.teal;
  };

  const colors = getAccentColors(currentPhase.accent);

  const recommendedTools = COPING_EXERCISES.filter(ex => 
    currentPhase.recommendedToolIds.includes(ex.id)
  );

  const completedInPhase = recommendedTools.filter(tool => completedIds.includes(tool.id)).length;
  const phaseProgress = Math.round((completedInPhase / recommendedTools.length) * 100);

  const handleFavoriteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if ('vibrate' in navigator) navigator.vibrate(10);
    toggleFavoriteTool(id);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      
      {/* 1. Global Navigation Bar */}
      <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 rounded-[40px] p-6 shadow-sm overflow-hidden relative">
        <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 mb-8 text-center">Expedition Map Overview</h3>
        <div className="flex overflow-x-auto no-scrollbar gap-8 md:gap-0 md:justify-around items-end snap-x pb-4">
           {RECOVERY_PHASES.map((p) => {
             const pTools = COPING_EXERCISES.filter(ex => p.recommendedToolIds.includes(ex.id));
             const pDone = pTools.filter(t => completedIds.includes(t.id)).length;
             const pColors = getAccentColors(p.accent);
             const isActive = p.id === currentPhase.id;
             
             return (
               <button 
                 key={p.id}
                 onClick={() => {
                   if ('vibrate' in navigator) navigator.vibrate(5);
                   store.setActivePhaseId(p.id);
                 }}
                 className={`flex flex-col items-center gap-4 group transition-all snap-center min-w-[100px] md:min-w-0 ${isActive ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}
               >
                 <Cairn total={pTools.length} completed={pDone} colorClass={pColors.stone} />
                 <div className="text-center">
                    <span className={`text-[8px] font-black uppercase tracking-widest block ${isActive ? pColors.lightText : 'text-slate-400'}`}>Node {p.id}</span>
                    <span className={`text-[11px] font-black ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{p.title.split(': ')[1].toUpperCase()}</span>
                 </div>
                 {isActive && <div className={`w-2 h-2 rounded-full mt-1 ${pColors.progress} animate-pulse shadow-[0_0_8px_currentColor]`} />}
               </button>
             );
           })}
        </div>
      </div>

      {/* 2. Phase Identity Card */}
      <div className="bg-white dark:bg-slate-900 rounded-[56px] p-8 md:p-16 border-2 border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden relative group">
        <div className={`absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br ${colors.glow} to-transparent rounded-full -mr-64 -mt-64 opacity-50 blur-[100px] transition-all duration-[3000ms] group-hover:scale-110`} />
        
        <div className="relative z-10 flex flex-col lg:flex-row gap-12 lg:items-center">
            <div className="space-y-8 flex-grow">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`px-5 py-2 ${colors.button} text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl`}>
                  Sector {currentPhase.id}
                </span>
                <span className="text-slate-400 text-[11px] font-black uppercase tracking-widest italic border-l-2 border-slate-100 dark:border-slate-800 pl-3">{currentPhase.subtitle}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <h2 className="text-4xl md:text-6xl font-black text-slate-800 dark:text-white leading-[0.9] tracking-tighter italic uppercase">{currentPhase.title.split(': ')[1]}</h2>
                  <SpeakButton text={`${currentPhase.title}. ${currentPhase.description}`} size={24} />
                </div>
                <p className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-[0.4em] ml-1">Atmosphere: {currentPhase.environment}</p>
              </div>

              <p className="text-slate-600 dark:text-slate-300 text-xl font-medium leading-relaxed max-w-2xl italic font-serif">
                "{currentPhase.description}"
              </p>

              <div className="bg-slate-50 dark:bg-slate-950/40 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 space-y-6">
                 <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full" />
                    Focus Protocols
                 </h4>
                 <p className="text-lg font-bold text-slate-800 dark:text-slate-200">
                    {currentPhase.focus}
                 </p>
              </div>
            </div>

            <div className="lg:w-80 shrink-0">
               <div className="bg-white dark:bg-slate-800 p-10 rounded-[50px] border-2 border-slate-50 dark:border-slate-700 flex flex-col items-center justify-center text-center shadow-2xl relative group/stats overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 to-transparent opacity-0 group-hover/stats:opacity-100 transition-opacity" />
                  <div className="mb-6 transform group-hover/stats:-translate-y-2 transition-transform duration-700 relative z-10">
                     <Cairn total={recommendedTools.length} completed={completedInPhase} colorClass={colors.stone} size="lg" />
                  </div>
                  <div className="space-y-1 relative z-10">
                    <p className={`text-6xl font-black ${colors.lightText} tabular-nums tracking-tighter`}>{phaseProgress}%</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Sector Integrity</p>
                  </div>
               </div>
            </div>
        </div>
      </div>

      {/* 3. Therapeutic Context Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2">
         <div className="bg-indigo-600 dark:bg-indigo-900 rounded-[48px] p-10 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl opacity-40 group-hover:scale-125 transition-transform duration-1000" />
            <div className="relative z-10 space-y-6">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl shadow-inner">🎯</div>
                  <h4 className="text-xl font-black uppercase tracking-tight italic">Expected Outcomes</h4>
               </div>
               <ul className="space-y-3">
                  {[
                    `Achieving stable ${currentPhase.benefitSummary}`,
                    "Building foundational neural resilience",
                    "Mirroring strengths of the True-Self",
                    "Reducing reliance on disused patterns"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 group/li">
                       <span className="text-teal-400 group-hover/li:translate-x-1 transition-transform">→</span>
                       <span className="text-sm font-bold text-indigo-50 leading-relaxed italic">"{item}"</span>
                    </li>
                  ))}
               </ul>
            </div>
         </div>

         <div className="bg-slate-900 rounded-[48px] p-10 text-white shadow-xl relative overflow-hidden group border-2 border-slate-800">
            <div className="relative z-10 space-y-6">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-2xl shadow-inner group-hover:rotate-6 transition-transform duration-700">🔬</div>
                  <h4 className="text-xl font-black uppercase tracking-tight italic">Guide Field Logic</h4>
               </div>
               <p className="text-slate-300 text-base leading-relaxed font-medium italic border-l-4 border-white/10 pl-6">
                 "{currentPhase.reasons}"
               </p>
               <div className="pt-4 flex justify-end">
                  <SpeakButton text={currentPhase.reasons} size={14} className="opacity-40 hover:opacity-100" />
               </div>
            </div>
         </div>
      </div>

      {/* 4. Tools Checklist */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-4">
          <h3 className="font-black text-slate-400 dark:text-slate-500 uppercase text-[10px] tracking-[0.4em] flex items-center gap-4 flex-grow">
              Sector Checkpoints Checklist
              <span className="h-px bg-slate-100 dark:bg-slate-800 flex-grow rounded-full" />
          </h3>
          <div className="ml-6 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 dark:border-slate-700">
            {completedInPhase} / {recommendedTools.length} Complete
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2">
          {recommendedTools.map((ex, i) => {
            const isCompleted = completedIds.includes(ex.id);
            const isFavorite = favoriteToolIds.includes(ex.id);
            const phaseContext = PHASE_TWO_EXPLANATIONS[ex.id];

            return (
              <button 
                key={i} 
                className={`bg-white dark:bg-slate-900 rounded-[48px] p-10 border-2 transition-all text-left flex flex-col relative overflow-hidden active:scale-[0.98] ${isCompleted ? 'border-teal-100 dark:border-teal-900/30 bg-teal-50/10 shadow-sm' : 'border-slate-100 dark:border-slate-800 hover:shadow-2xl'}`}
                onClick={() => onStartExercise(ex.id)}
              >
                <div className={`absolute top-0 right-0 w-24 h-24 ${isCompleted ? 'bg-teal-500/5' : 'bg-slate-500/5'} rounded-full -mr-12 -mt-12 opacity-50 blur-2xl group-hover:scale-150 transition-transform duration-700`} />
                
                <div className="flex justify-between items-center mb-8 relative z-10">
                  <span className={`text-[10px] font-black ${isCompleted ? 'text-teal-600 bg-teal-50 dark:bg-teal-900/40' : `${colors.lightText} ${colors.bg}`} px-4 py-1.5 rounded-2xl uppercase tracking-widest border ${isCompleted ? 'border-teal-100 dark:border-teal-800' : colors.border}`}>
                    {ex.category}
                  </span>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={(e) => handleFavoriteClick(e, ex.id)}
                      className={`p-3 rounded-2xl transition-all shadow-md ${isFavorite ? 'bg-rose-500 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-300 hover:text-rose-500'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                    {isCompleted && (
                      <div className="bg-emerald-500 text-white p-2.5 rounded-full shadow-lg transform rotate-12 ring-4 ring-emerald-500/20">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 flex-grow relative z-10">
                  <h4 className={`font-black text-2xl md:text-3xl tracking-tight transition-colors ${isCompleted ? 'text-teal-900 dark:text-teal-400' : 'text-slate-900 dark:text-white'}`}>
                    {ex.title}
                  </h4>
                  
                  {phaseContext && (
                    <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/50 animate-in fade-in">
                       <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Sector Context</p>
                       <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 italic leading-relaxed">"{phaseContext}"</p>
                    </div>
                  )}

                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed italic">
                    "{ex.description}"
                  </p>
                </div>

                <div className={`mt-10 pt-6 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between relative z-10 ${isCompleted ? 'text-teal-600' : colors.lightText}`}>
                  <div className={`flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.3em] group-hover:gap-6 transition-all`}>
                    {isCompleted ? 'Revisit Archive' : 'Execute Step'} <span>→</span>
                  </div>
                  <SpeakButton text={ex.description} size={14} className="opacity-40" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Phase-Specific Affirmation Footer */}
      <div className="bg-slate-950 rounded-[64px] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl border-b-[12px] border-slate-900 mx-4 md:mx-0">
         <div className={`absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent opacity-10 animate-pulse`} />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02),transparent)]" />
         
         <div className="relative z-10 space-y-8 max-w-3xl mx-auto">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.8em] animate-pulse">Sector Finality</span>
            <h3 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter leading-tight font-serif">
              "The ascent through {currentPhase.title.split(': ')[1]} is a journey of reclaiming your own rhythm from the storm. Go gently into the next sector."
            </h3>
            <div className="pt-10 flex justify-center">
               <div className="flex gap-4">
                  <div className="w-12 h-1 h-1 bg-white/5 rounded-full" />
                  <div className={`w-24 h-1 h-1 ${colors.progress} rounded-full animate-pulse`} />
                  <div className="w-12 h-1 h-1 bg-white/5 rounded-full" />
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default PhaseView;
