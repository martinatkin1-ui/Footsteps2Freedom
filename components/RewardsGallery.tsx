
import React, { useState, useMemo } from 'react';
import { SobrietyData, Badge } from '../types';
import { BADGE_LIBRARY, getRankData } from '../constants.tsx';

interface RewardsGalleryProps {
  sobriety: SobrietyData;
}

const CATEGORY_MAP = {
  consistency: { label: 'Temporal Resilience', icon: '🔥', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  wisdom: { label: 'Cognitive Insight', icon: '🔍', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  body: { label: 'Biological Alchemy', icon: '🐚', color: 'text-teal-500', bg: 'bg-teal-500/10' },
  community: { label: 'Collective Shield', icon: '🤝', color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
};

const RewardsGallery: React.FC<RewardsGalleryProps> = ({ sobriety }) => {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const rank = getRankData(sobriety.footsteps || 0);
  const progressToNext = Math.min(100, Math.round((sobriety.footsteps / rank.nextThreshold) * 100));

  const categorizedBadges = useMemo(() => {
    return BADGE_LIBRARY.reduce((acc, libBadge) => {
      const cat = libBadge.category || 'wisdom';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push({
        ...libBadge,
        earned: sobriety.badges.find(b => b.id === libBadge.id)
      });
      return acc;
    }, {} as Record<string, any[]>);
  }, [sobriety.badges]);

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-32 animate-in fade-in duration-700 px-4">
      
      {/* Cinematic Rank Hero */}
      <div className="relative bg-slate-900 rounded-[64px] border-4 border-slate-800 shadow-[0_50px_100px_rgba(0,0,0,0.4)] overflow-hidden group">
        <div className={`absolute inset-0 bg-gradient-to-br ${rank.color.replace('bg-', 'from-')}/20 via-slate-950 to-slate-950 opacity-80`} />
        
        {/* Dynamic Rank Background Art */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
           {sobriety.trueSelfTotem ? (
             <img src={sobriety.trueSelfTotem} className="w-full h-full object-cover animate-pulse-slow" alt="" />
           ) : (
             <div className="w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(20,184,166,0.1),transparent)]" />
           )}
        </div>

        <div className="relative z-10 p-10 md:p-20 flex flex-col lg:flex-row items-center justify-between gap-16">
           <div className="text-center lg:text-left space-y-6 max-w-xl">
              <div className="flex flex-col lg:flex-row items-center gap-6">
                 <div className={`w-32 h-32 md:w-40 md:h-40 ${rank.color} rounded-[48px] flex items-center justify-center text-7xl md:text-8xl shadow-2xl border-4 border-white/10 group-hover:rotate-6 transition-all duration-1000`}>
                   {rank.icon}
                 </div>
                 <div className="space-y-2">
                   <span className="text-teal-400 font-black uppercase tracking-[0.6em] text-[10px] animate-pulse">Expedition Status</span>
                   <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">{rank.title}</h2>
                 </div>
              </div>
              <p className="text-slate-400 text-xl font-medium italic leading-relaxed font-serif pt-4">
                "Every footprint recorded is a defiant act against old cycles. You are no longer just surviving; you are architecting a legacy."
              </p>
           </div>

           <div className="w-full lg:w-96 space-y-10">
              <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-[48px] border border-white/10 shadow-inner">
                 <div className="flex justify-between items-end mb-4">
                    <div>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mastery Level</p>
                       <p className="text-3xl font-black text-white tabular-nums">{sobriety.footsteps} <span className="text-xs text-slate-500">👣</span></p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-teal-500 uppercase tracking-widest">{progressToNext}% to {rank.nextTitle.split(' ')[1]}</p>
                    </div>
                 </div>
                 <div className="h-4 w-full bg-black/40 rounded-full overflow-hidden p-1 border border-white/5 relative">
                    <div 
                      className={`h-full ${rank.color} rounded-full transition-all duration-2000 ease-out shadow-[0_0_20px_rgba(20,184,166,0.4)] relative`} 
                      style={{ width: `${progressToNext}%` }}
                    >
                       <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                    </div>
                 </div>
              </div>

              {/* Presence Streaks UI */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-orange-500/10 p-6 rounded-[32px] border border-orange-500/20 text-center space-y-1">
                    <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest">Active Streak</p>
                    <p className="text-4xl font-black text-orange-500 tabular-nums">{sobriety.currentStreak} <span className="text-xs">🔥</span></p>
                 </div>
                 <div className="bg-indigo-500/10 p-6 rounded-[32px] border border-indigo-500/20 text-center space-y-1">
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Longest Ride</p>
                    <p className="text-4xl font-black text-indigo-500 tabular-nums">{sobriety.longestStreak} <span className="text-xs">🏔️</span></p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Categorized Artifacts Grid */}
      <div className="space-y-16">
        {(Object.entries(CATEGORY_MAP) as [string, any][]).map(([catKey, catInfo]) => (
          <div key={catKey} className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
             <div className="flex items-center gap-6 px-4">
                <div className={`w-12 h-12 ${catInfo.bg} rounded-2xl flex items-center justify-center text-2xl shadow-inner`}>
                   {catInfo.icon}
                </div>
                <div>
                   <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">{catInfo.label}</h3>
                   <div className="h-1 w-24 bg-gradient-to-r from-teal-500 to-transparent rounded-full mt-1" />
                </div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-2">
                {categorizedBadges[catKey]?.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedBadge(item.earned || item)}
                    className={`relative p-8 rounded-[48px] border-2 text-center transition-all group overflow-hidden flex flex-col h-full active:scale-95 ${
                      item.earned 
                        ? 'bg-white dark:bg-slate-900 border-teal-500/20 shadow-xl hover:shadow-teal-500/10' 
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 opacity-40 grayscale scale-[0.98]'
                    }`}
                  >
                    <div className={`absolute top-0 right-0 w-24 h-24 ${item.earned ? 'bg-teal-500/5' : ''} rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-150 transition-transform duration-1000`} />
                    
                    <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center text-4xl mb-6 mx-auto transition-all duration-700 ${
                      item.earned ? 'bg-slate-950 shadow-inner border border-white/5 scale-110 group-hover:rotate-12' : 'bg-slate-200 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700'
                    }`}>
                      {item.icon}
                    </div>

                    <h4 className={`text-lg font-black mb-2 tracking-tight ${item.earned ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{item.title}</h4>
                    <p className="text-[10px] text-slate-400 font-bold leading-relaxed flex-grow italic">
                      "{item.earned ? item.description : 'Condition Hidden'}"
                    </p>

                    {item.earned && (
                      <div className="mt-8 pt-4 border-t border-slate-50 dark:border-slate-800 flex flex-col items-center gap-1">
                        <span className="text-[8px] font-black uppercase text-teal-600 dark:text-teal-400 tracking-[0.2em]">Archived Landmark</span>
                        <p className="text-[9px] font-bold text-slate-400">{new Date(item.earned.earnedAt).toLocaleDateString('en-GB')}</p>
                      </div>
                    )}
                  </button>
                ))}
             </div>
          </div>
        ))}
      </div>

      {/* Artifact Lore Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 rounded-[60px] p-10 md:p-16 max-w-xl w-full shadow-2xl relative overflow-hidden border-4 border-slate-100 dark:border-slate-800 animate-in zoom-in-95">
              <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-500 via-indigo-500 to-rose-500`} />
              
              <button 
                onClick={() => setSelectedBadge(null)}
                className="absolute top-8 right-8 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              <div className="text-center space-y-10">
                 <div className="relative inline-block">
                    <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="w-32 h-32 bg-slate-950 rounded-[48px] border-4 border-white/10 flex items-center justify-center text-7xl relative z-10 shadow-2xl animate-float">
                       {selectedBadge.icon}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <span className={`text-[11px] font-black uppercase tracking-[0.5em] ${selectedBadge.earnedAt ? 'text-teal-600' : 'text-slate-400'}`}>
                       {selectedBadge.earnedAt ? 'Landmark Integrated' : 'Restricted Knowledge'}
                    </span>
                    <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{selectedBadge.title}</h3>
                 </div>

                 <div className="bg-slate-50 dark:bg-slate-950 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-inner text-left space-y-4">
                    <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Clinical Lore</h4>
                    <p className="text-lg text-slate-600 dark:text-slate-300 font-bold leading-relaxed italic">
                      "{selectedBadge.lore || "This artifact holds wisdom only revealed once the associated milestone is reached."}"
                    </p>
                 </div>

                 {selectedBadge.earnedAt ? (
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Earned on {new Date(selectedBadge.earnedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                 ) : (
                   <button 
                     onClick={() => setSelectedBadge(null)}
                     className="w-full py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 font-black rounded-3xl uppercase text-xs tracking-widest"
                   >
                     Return to Path
                   </button>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Sanctuary Summary - Vertical stacked visual */}
      <div className="bg-slate-950 rounded-[60px] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl border-b-[12px] border-slate-900 ring-1 ring-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/[0.03] rounded-full blur-[120px] animate-pulse" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-16">
           <div className="w-32 h-32 bg-white/10 rounded-[40px] flex items-center justify-center text-7xl shadow-inner backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform duration-1000">💎</div>
           <div className="space-y-6 text-center md:text-left flex-grow">
              <h3 className="text-4xl md:text-5xl font-black tracking-tighter leading-none uppercase italic">Treasury Integrity</h3>
              <p className="text-slate-400 text-xl font-medium leading-relaxed max-w-2xl italic">
                "You have secured {sobriety.badges.length} therapeutic artifacts. Each one represents a neural footpath strengthened, a boundary held, and a promise kept to your True-Self."
              </p>
              <div className="pt-6 border-t border-white/5 flex flex-wrap justify-center md:justify-start gap-4">
                 <div className="px-6 py-2 bg-white/5 rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-teal-400">Archived Wins: {sobriety.footsteps}</div>
                 <div className="px-6 py-2 bg-white/5 rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-indigo-400">Total Artifacts: {sobriety.badges.length}</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default RewardsGallery;
