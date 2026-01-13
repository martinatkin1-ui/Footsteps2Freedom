import React, { useState, useMemo, useEffect } from 'react';
import { COPING_EXERCISES } from '../constants';
import { AppRoute } from '../types';
import ModuleReflection from './ModuleReflection';
import { useRecoveryStore } from '../store';
import SpeakButton from './SpeakButton';

interface FirstAidToolkitProps {
  onStartExercise: (id: string) => void;
  onAskGuide: () => void;
  onStartPolyvagal: () => void;
  completedIds: string[];
  onCompleteFirstAid: (rating?: number, reflection?: string, artUrl?: string) => void;
}

const FIRST_AID_TOOL_IDS = [
  'meditation-timer',
  'breathing-exercises',
  'tipp-skill',
  'stop-skill',
  'grounding',
  'accepts-skill',
  'video-sanctuary',
  'urge-surfing',
  'somatic-toolkit',
  'butterfly-hug',
  'affirmation-deck'
];

const FirstAidToolkit: React.FC<FirstAidToolkitProps> = ({ 
  onStartExercise, onAskGuide, onStartPolyvagal, completedIds, onCompleteFirstAid 
}) => {
  const { favoriteToolIds, toggleFavoriteTool } = useRecoveryStore();
  
  // Track tools viewed in session + tools already completed historically
  const [viewedToolIds, setViewedToolIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('first_aid_viewed_session');
    const sessionIds = saved ? JSON.parse(saved) : [];
    // Merge with already completed ones from the First Aid specific list
    const completedFirstAid = completedIds.filter(id => FIRST_AID_TOOL_IDS.includes(id));
    return Array.from(new Set([...sessionIds, ...completedFirstAid]));
  });

  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean>(() => {
    // Skip onboarding if flag is set, if the module is done, or if they've already explored relevant tools
    return localStorage.getItem('first_aid_onboarded') === 'true' || 
           completedIds.includes('first_aid') || 
           viewedToolIds.length > 0;
  });

  const [view, setView] = useState<'onboarding' | 'reflection' | 'tools' | 'primary_choice'>(
    hasSeenOnboarding ? 'tools' : 'onboarding'
  );

  const firstAidTools = COPING_EXERCISES.filter(ex => FIRST_AID_TOOL_IDS.includes(ex.id));
  
  const rewardAvailable = useMemo(() => {
    return viewedToolIds.length >= 3 && !completedIds.includes('first_aid');
  }, [viewedToolIds, completedIds]);

  useEffect(() => {
    localStorage.setItem('first_aid_viewed_session', JSON.stringify(viewedToolIds));
    
    // Maintain the 'active flow' flag so App.tsx knows to return here
    if (view === 'tools' && !completedIds.includes('first_aid')) {
      sessionStorage.setItem('first_aid_active_flow', 'true');
    } else if (view !== 'tools' && view !== 'primary_choice') {
      sessionStorage.removeItem('first_aid_active_flow');
    }
  }, [viewedToolIds, view, completedIds]);

  const FirstAidVisual = ({ className = "w-10 h-10" }) => (
    <div className={`${className} bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-1/2 h-1/2">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </div>
  );

  const handleFavoriteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if ('vibrate' in navigator) navigator.vibrate(10);
    toggleFavoriteTool(id);
  };

  const handleToolClick = (id: string) => {
    if (!viewedToolIds.includes(id)) {
      setViewedToolIds(prev => [...prev, id]);
    }
    // Set a session flag so that when the exercise is finished, the app returns us here
    sessionStorage.setItem('first_aid_active_flow', 'true');
    onStartExercise(id);
  };

  const handleFamiliarise = () => {
    localStorage.setItem('first_aid_onboarded', 'true');
    setHasSeenOnboarding(true);
    setView('tools');
  };

  const handlePrimarySelection = (id: string) => {
    // Add chosen tool to favorites if not already there
    if (!favoriteToolIds.includes(id)) {
      toggleFavoriteTool(id);
    }
    
    // Clear flow flag
    sessionStorage.removeItem('first_aid_active_flow');
    
    // Finalise module
    setView('reflection');
  };

  if (view === 'reflection') {
    return (
      <ModuleReflection 
        moduleName="First Aid Protocol"
        context={`User has established a primary response plan and explored foundational regulation tools.`}
        onClose={(r, refl, art) => {
          onCompleteFirstAid(r, refl, art);
          setView('tools');
        }}
        title="Continuation Authorised"
      />
    );
  }

  if (view === 'onboarding') {
    return (
      <div className="max-w-3xl mx-auto py-12 animate-in fade-in duration-1000 pb-40">
        <div className="bg-slate-900 rounded-[60px] p-10 md:p-20 border-4 border-emerald-500/20 shadow-2xl relative overflow-hidden text-center space-y-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.1),transparent)] pointer-events-none" />
          
          <div className="relative z-10 space-y-8">
            <div className="flex flex-col items-center gap-6">
              <div className="w-32 h-32 bg-emerald-600 rounded-[40px] flex items-center justify-center text-white text-6xl shadow-[0_20px_50px_rgba(16,185,129,0.3)] animate-float">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-1/2 h-1/2">
                    <path d="M12 5v14M5 12h14" />
                 </svg>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.6em]">Expedition Landmark</span>
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">THE FIRST AID PROTOCOL</h2>
              </div>
            </div>

            <div className="prose prose-invert max-w-none text-slate-300 space-y-6">
               <p className="text-xl font-medium leading-relaxed italic border-l-4 border-emerald-500/30 pl-8 text-left">
                 "In moments of high distress, your logical mind may feel disconnected. These tools are your biological manual overrides."
               </p>
               <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 text-left space-y-6">
                 <p className="text-base font-bold leading-relaxed">
                   Take a moment now to <strong>familiarise yourself with these tactical anchors</strong>. Open at least 3 tools to confirm protocol integrity and continue your ascent.
                 </p>
               </div>
            </div>

            <button 
              onClick={handleFamiliarise}
              className="w-full py-6 bg-emerald-600 text-white font-black rounded-3xl shadow-xl shadow-emerald-600/40 hover:bg-emerald-700 transition-all active:scale-[0.98] uppercase tracking-[0.4em] text-xs"
            >
              INITIALISE PROTOCOL
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'primary_choice') {
    return (
      <div className="max-w-3xl mx-auto py-12 animate-in fade-in duration-1000 pb-40">
        <div className="bg-white dark:bg-slate-900 rounded-[60px] p-10 border-4 border-indigo-600 shadow-2xl relative overflow-hidden space-y-12">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full -mr-40 -mt-40 blur-3xl opacity-50" />
          
          <div className="relative z-10 text-center space-y-6">
            <div className="w-20 h-20 bg-indigo-600 rounded-[28px] flex items-center justify-center text-4xl text-white shadow-xl mx-auto mb-6">🛡️</div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Primary Anchor Selection</h3>
            <p className="text-slate-500 dark:text-slate-400 font-bold italic text-lg leading-relaxed px-4">
              "When the storm is at its peak, which one of these tools will be your <strong>First Responder</strong>?"
            </p>
            <SpeakButton text="Which one of these tools will be your first responder? Select the anchor you feel most connected to. I will add it to your primary favorites." size={14} className="opacity-40" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10 px-4">
            {firstAidTools.filter(t => viewedToolIds.includes(t.id)).map((tool) => (
              <button
                key={tool.id}
                onClick={() => handlePrimarySelection(tool.id)}
                className="p-6 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white border-2 border-slate-100 dark:border-slate-700 rounded-3xl transition-all group text-left flex items-center gap-4 active:scale-95 shadow-md"
              >
                <span className="text-3xl group-hover:scale-125 transition-transform">
                  {tool.id.includes('meditation') ? '🧘' : tool.id.includes('breathing') ? '🌬️' : '🩹'}
                </span>
                <span className="font-black text-sm uppercase tracking-widest">{tool.title}</span>
              </button>
            ))}
          </div>

          <button 
            onClick={() => setView('tools')}
            className="w-full text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-600 transition-colors pt-4"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-32">
      {/* Emergency Header */}
      <div className="bg-white dark:bg-slate-900 rounded-[48px] p-8 md:p-12 border-4 border-emerald-50 dark:border-emerald-900/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-50 dark:bg-emerald-900/20 rounded-full -mr-40 -mt-40 blur-3xl opacity-50 animate-pulse" />
        
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FirstAidVisual />
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.4em]">Active Protocol Scan</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[0.9]">Emergency Readiness</h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg font-medium leading-relaxed max-w-2xl">
                {rewardAvailable 
                  ? "Protocol threshold reached. You are now familiar with the foundational biological overrides. Commit to your primary anchor to proceed."
                  : completedIds.includes('first_aid')
                    ? "Protocol active. These anchors are always here to protect your stability during emotional firestorms."
                    : `Protocol status: ${viewedToolIds.length}/3 landmarks explored. Open ${3 - viewedToolIds.length} more to unlock the next sector.`}
              </p>
            </div>
            
            <div className="flex flex-col gap-3 shrink-0">
              {rewardAvailable ? (
                <button 
                  onClick={() => setView('primary_choice')}
                  className="px-10 py-6 bg-teal-600 text-white font-black rounded-3xl shadow-xl shadow-teal-600/30 hover:bg-teal-700 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-4 animate-bounce border-b-[8px] border-teal-800"
                >
                  <span>🏆</span> I AM FAMILIAR
                </button>
              ) : !completedIds.includes('first_aid') && (
                <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 text-center space-y-2 opacity-60">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Continuation Locked</p>
                   <p className="text-[9px] font-bold text-slate-400 uppercase">Explore {Math.max(0, 3 - viewedToolIds.length)} more tools</p>
                </div>
              )}
              <button 
                onClick={() => handleToolClick('somatic_mapping')}
                className="px-8 py-5 bg-amber-600 text-white font-black rounded-3xl shadow-xl shadow-amber-600/30 hover:bg-amber-700 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs flex items-center gap-3"
              >
                <span>👤</span> Somatic Mirror
              </button>
              <button 
                onClick={onStartPolyvagal}
                className="px-8 py-5 bg-rose-600 text-white font-black rounded-3xl shadow-xl shadow-rose-600/30 hover:bg-rose-700 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs flex items-center gap-3"
              >
                <span>🧪</span> Polyvagal Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <h3 className="font-black text-slate-400 dark:text-slate-500 uppercase text-xs tracking-[0.4em] flex items-center gap-4 flex-grow">
              Tactical Anchor Grid
              <span className="h-px bg-slate-200 dark:bg-slate-800 flex-grow"></span>
          </h3>
          {!completedIds.includes('first_aid') && (
            <div className="flex items-center gap-4 ml-6">
               <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest whitespace-nowrap">
                 Knowledge Level: {viewedToolIds.length}/3
               </span>
               <div className="flex gap-1">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={`w-2 h-2 rounded-full transition-all duration-700 ${i <= viewedToolIds.length ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-200 dark:bg-slate-800'}`} />
                  ))}
               </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
          {firstAidTools.map((tool) => {
            const isFavorite = favoriteToolIds.includes(tool.id);
            const isSeenInSession = viewedToolIds.includes(tool.id);
            const isHistoricallyCompleted = completedIds.includes(tool.id);
            const isScanned = isSeenInSession || isHistoricallyCompleted;

            return (
              <div 
                key={tool.id} 
                onClick={() => handleToolClick(tool.id)}
                className={`bg-white dark:bg-slate-900 rounded-[40px] p-8 border-2 transition-all group cursor-pointer flex flex-col relative overflow-hidden ${
                  isScanned 
                    ? 'border-emerald-500/20' 
                    : 'border-slate-100 dark:border-slate-800'
                } hover:shadow-2xl hover:border-emerald-500/30 active:scale-[0.98]`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 dark:bg-teal-900/10 rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-110 transition-transform duration-700" />
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className={`w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform`}>
                    {tool.id.includes('meditation') ? '🧘' : 
                      tool.id.includes('breathing') ? '🌬️' : 
                      tool.id.includes('tipp') ? '🌊' : 
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={4} className="w-1/2 h-1/2">
                        <path d="M12 5v14M5 12h14" />
                      </svg>}
                  </div>
                  <div className="flex items-center gap-2">
                    {isScanned && (
                      <span className="bg-emerald-500 text-white p-1 rounded-lg text-[8px] font-black uppercase px-2 shadow-sm">Scanned</span>
                    )}
                    <button 
                      onClick={(e) => handleFavoriteClick(e, tool.id)}
                      className={`p-3 rounded-xl transition-all ${isFavorite ? 'bg-rose-500 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-300 hover:text-rose-500'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 transition-colors relative z-10">{tool.title}</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed mb-8 flex-grow relative z-10 italic">"{tool.description}"</p>
                <div className={`flex items-center ${isScanned ? 'text-emerald-600' : 'text-slate-400'} font-black text-[10px] uppercase tracking-[0.2em] relative z-10 group-hover:gap-4 transition-all`}>
                  {isScanned ? 'Refresh Knowledge' : 'Initialise Scan'} <span>→</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FirstAidToolkit;