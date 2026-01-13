
import React, { useState, useRef, useEffect } from 'react';
import { COPING_EXERCISES } from '../constants';
import { useRecoveryStore } from '../store';
import SpeakButton from './SpeakButton';

export type TherapyType = 'cbt' | 'dbt' | 'mindfulness' | 'somatic' | 'act' | 'strategy';

interface TherapySkillsHubProps {
  type: TherapyType;
  onStartExercise: (id: string) => void;
  onAskGuide: (title: string, framework: string) => void;
  onBack: () => void;
}

const Cairn: React.FC<{ total: number; completed: number; colorClass: string }> = ({ total, completed, colorClass }) => {
  const stones = Array.from({ length: total }, (_, i) => i);
  return (
    <div className="flex flex-col-reverse items-center gap-1 scale-125 md:scale-150">
      {stones.map((i) => {
        const isDone = i < completed;
        const scale = 1 - (i * 0.1);
        return (
          <div 
            key={i}
            style={{ width: `${48 * scale}px`, height: `${18 * scale}px` }}
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

const HUB_CONFIG: Record<TherapyType, {
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  theoryTitle: string;
  theoryContent: string;
  theoryIcon: string;
  accentColor: string;
  lightBg: string;
  buttonColor: string;
  toolIds: string[];
}> = {
  dbt: {
    title: 'DBT Skills Hub',
    subtitle: 'Dialectical Behaviour Therapy',
    icon: '🛠️',
    description: 'Focused on distress tolerance and emotional regulation. DBT helps you survive crisis moments without making them worse.',
    theoryTitle: 'Dialectics: The Middle Path',
    theoryContent: 'The core of DBT is accepting that two opposite things can be true at once. You are doing the best you can AND you need to do better. This balance of acceptance and change is the bridge to a life worth living.',
    theoryIcon: '☯️',
    accentColor: 'indigo',
    lightBg: 'bg-indigo-50 dark:bg-indigo-950/40',
    buttonColor: 'bg-indigo-600',
    toolIds: ['tipp-skill', 'accepts-skill', 'improve-skill', 'radical-acceptance', 'stop-skill', 'assertiveness-tool', 'emotional-boundaries']
  },
  cbt: {
    title: 'CBT Patterns Hub',
    subtitle: 'Cognitive Behavioural Therapy',
    icon: '🧠',
    description: 'Deconstruct the loop between your thoughts, feelings, and actions. Learn to challenge thinking errors and restructure your True-Self reality.',
    theoryTitle: 'The Cognitive Model',
    theoryContent: 'CBT suggests that it is not events that disturb us, but our interpretation of them. By identifying "automatic thoughts" and testing them against evidence, we can break the cycle of anxiety and compulsion.',
    theoryIcon: '🔬',
    accentColor: 'orange',
    lightBg: 'bg-orange-50 dark:bg-orange-950/40',
    buttonColor: 'bg-orange-600',
    toolIds: ['chain-analysis', 'cost-benefit-analysis', 'problem_solving', 'exposure_tool', 'inner-critic-challenge', 'cognitive-reframing', 'behaviour-tree', 'progress-monitoring', 'attachment-quiz']
  },
  mindfulness: {
    title: 'Presence Sanctuary',
    subtitle: 'Mindfulness & Grounding',
    icon: '🧘',
    description: 'Build the "Observing Self." Learn to stay in the present moment without judgment, allowing cravings to pass like clouds.',
    theoryTitle: 'Non-Judgmental Awareness',
    theoryContent: 'Mindfulness isn\'t about clearing the mind; it\'s about noticing the mind. When we stop fighting our thoughts and start observing them, they lose their power to dictate our actions.',
    theoryIcon: '🌊',
    accentColor: 'teal',
    lightBg: 'bg-teal-50 dark:bg-teal-950/40',
    buttonColor: 'bg-teal-600',
    toolIds: ['meditation-timer', 'video-sanctuary', 'breathing-exercises', 'grounding', 'urge-surfing']
  },
  somatic: {
    title: 'Somatic Recovery Lab',
    subtitle: 'Body-Based Regulation',
    icon: '🐚',
    description: 'Regulate your nervous system from the bottom up. Release trauma stored in the body and find safety in your physical presence.',
    theoryTitle: 'The Vagus Nerve & Safety',
    theoryContent: 'Your body often reacts before your mind. Somatic work focuses on the autonomic nervous system. By calming the body, we signal "safety" to the brain, ending the fight-or-flight response.',
    theoryIcon: '🧬',
    accentColor: 'rose',
    lightBg: 'bg-rose-50 dark:bg-rose-950/40',
    buttonColor: 'bg-rose-600',
    toolIds: ['somatic-toolkit', 'butterfly-hug', 'pain_management', 'window-of-tolerance']
  },
  act: {
    title: 'True-Self & Values Hub',
    subtitle: 'Acceptance & Commitment',
    icon: '🔑',
    description: 'Identify your core values and commit to actions that align with them. Shift your True-Self from "struggle" to "strength."',
    theoryTitle: 'Psychological Flexibility',
    theoryContent: 'ACT is about moving toward what matters, even when pain is present. Instead of trying to eliminate "bad" feelings, we focus on increasing our capacity to live a rich and meaningful life.',
    theoryIcon: '🧭',
    accentColor: 'amber',
    lightBg: 'bg-amber-50 dark:bg-amber-950/40',
    buttonColor: 'bg-amber-600',
    toolIds: ['smart-goals', 'spirituality', 'affirmation-deck', 'daily-affirmations', 'working_backwards', 'trust_steps', 'self-esteem-foundations', 'shadow-work']
  },
  strategy: {
    title: 'Stability Ops Hub',
    subtitle: 'Strategy & Environmental Control',
    icon: '🗺️',
    description: 'Master the logistics of recovery. Build safety plans, routines, and accountability structures to protect your path.',
    theoryTitle: 'Environmental Engineering',
    theoryContent: 'Stability isn\'t just internal; it\'s structural. By designing your day and your network for success, you reduce the amount of "willpower" needed to stay free.',
    theoryIcon: '🏗️',
    accentColor: 'slate',
    lightBg: 'bg-slate-50 dark:bg-slate-800/40',
    buttonColor: 'bg-slate-700',
    toolIds: ['daily-planner', 'rpp-builder', 'accountability-journey', 'self-criticism-workshop']
  }
};

const TherapySkillsHub: React.FC<TherapySkillsHubProps> = ({ type, onStartExercise, onAskGuide, onBack }) => {
  const config = HUB_CONFIG[type];
  const { completedExercises: completedIds, favoriteToolIds, toggleFavoriteTool } = useRecoveryStore();
  const relevantTools = COPING_EXERCISES.filter(ex => config.toolIds.includes(ex.id));
  
  const total = relevantTools.length;
  const completed = relevantTools.filter(t => completedIds.includes(t.id)).length;
  const masteryProgress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const colorMap: Record<string, string> = {
    indigo: 'text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900 bg-indigo-500',
    orange: 'text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-800 bg-orange-500',
    teal: 'text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-900 bg-teal-500',
    rose: 'text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900 bg-rose-500',
    amber: 'text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900 bg-amber-500',
    slate: 'text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 bg-slate-500'
  };

  const handleFavoriteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if ('vibrate' in navigator) navigator.vibrate(10);
    toggleFavoriteTool(id);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-32">
      <button 
        onClick={onBack}
        className="flex items-center gap-3 text-slate-400 font-black uppercase text-[11px] tracking-[0.3em] hover:text-teal-600 transition-all hover:-translate-x-1"
      >
        <span>←</span> Back to Library
      </button>

      <div className={`bg-white dark:bg-slate-900 rounded-[40px] p-8 md:p-16 border-4 border-slate-50 dark:border-slate-800 shadow-2xl relative overflow-hidden`}>
        <div className={`absolute top-0 right-0 w-[500px] h-[500px] ${config.buttonColor} opacity-5 rounded-full -mr-64 -mt-64 blur-[100px] animate-pulse`} />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
          <div className="space-y-8 flex-grow">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 ${config.buttonColor} rounded-[24px] flex items-center justify-center text-white text-3xl shadow-2xl shadow-indigo-600/20`}>
                  {config.icon}
                </div>
                <div>
                  <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{config.title}</h2>
                  <p className={`${colorMap[config.accentColor].split(' ')[0]} font-black uppercase tracking-[0.4em] text-[10px] mt-2`}>{config.subtitle}</p>
                </div>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-xl font-medium leading-relaxed max-w-3xl border-l-4 border-slate-100 dark:border-slate-800 pl-8 italic">
              "{config.description}"
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => onAskGuide(config.title, config.subtitle)}
                className={`px-10 py-5 ${config.buttonColor} text-white font-black rounded-[24px] shadow-2xl transition-all uppercase tracking-widest text-xs flex items-center gap-3 hover:scale-105 active:scale-95`}
              >
                <span>💡</span> Consult the Guide
              </button>
              <SpeakButton text={config.description} className="scale-125 ml-2" />
            </div>
          </div>

          <div className={`${config.lightBg} p-12 rounded-[50px] border border-white/20 min-w-[300px] flex flex-col items-center text-center shadow-inner relative group`}>
             <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
             <div className="relative z-10 space-y-10">
                <Cairn total={total} completed={completed} colorClass={colorMap[config.accentColor].split(' ').pop() || 'bg-indigo-500'} />
                <div className="space-y-1">
                  <p className={`text-6xl font-black ${colorMap[config.accentColor].split(' ')[0]} tracking-tighter tabular-nums`}>{masteryProgress}%</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Hub Integrity</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        <div className="flex items-center gap-6 px-4">
          <h3 className="font-black text-slate-400 dark:text-slate-500 uppercase text-[10px] tracking-[0.5em] whitespace-nowrap">Tactical Protocols</h3>
          <div className="h-[2px] bg-slate-100 dark:bg-slate-800 flex-grow rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-2">
          {relevantTools.map((tool, idx) => {
            const isDone = completedIds.includes(tool.id);
            const isFavorite = favoriteToolIds.includes(tool.id);
            const accent = colorMap[config.accentColor].split(' ')[0];
            return (
              <button 
                key={tool.id} 
                onClick={() => onStartExercise(tool.id)}
                className={`bg-white dark:bg-slate-900 rounded-[40px] p-8 border-2 transition-all group text-left flex flex-col relative overflow-hidden active:scale-[0.98] ${
                  isDone 
                    ? 'border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/5 shadow-sm' 
                    : 'border-slate-100 dark:border-slate-800 hover:border-indigo-400/30 hover:shadow-2xl'
                }`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 ${config.lightBg} opacity-0 group-hover:opacity-40 rounded-full -mr-16 -mt-16 blur-2xl transition-opacity duration-1000`} />
                
                <div className="flex justify-between items-center mb-6 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner transition-all duration-700 ${
                    isDone ? 'bg-emerald-600 text-white shadow-indigo-600/20' : `${config.lightBg} ${accent} group-hover:rotate-6`
                  }`}>
                    {isDone ? '✓' : (
                       tool.id.includes('breathing') ? '🌬️' :
                       tool.id.includes('meditation') ? '🧘' :
                       tool.id.includes('planner') ? '📅' :
                       tool.id.includes('rpp') ? '🛡️' :
                       tool.id.includes('goals') ? '🎯' :
                       tool.id.includes('chain') ? '🔍' :
                       tool.id.includes('affirmation') ? '✨' :
                       tool.id.includes('shadow') ? '🌑' : '🛠️'
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <SpeakButton text={tool.description} size={14} className="scale-90" />
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

                <div className="space-y-4 flex-grow relative z-10">
                  <h4 className={`text-2xl font-black tracking-tight transition-colors ${isDone ? 'text-slate-900 dark:text-emerald-400' : 'text-slate-900 dark:text-white group-hover:text-indigo-600'}`}>{tool.title}</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed line-clamp-3 italic">"{tool.description}"</p>
                </div>
                
                <div className={`mt-12 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between relative z-10 ${isDone ? 'text-emerald-600' : accent}`}>
                  <div className={`flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.3em] group-hover:gap-6 transition-all`}>
                    {isDone ? 'Revisit Landmark' : 'Conquer Ridge'} <span>→</span>
                  </div>
                  {isDone && (
                    <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">Mastered</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-slate-950 rounded-[60px] p-10 md:p-20 text-white relative overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.4)] border-b-[12px] border-slate-900 mx-4 md:mx-0">
        <div className={`absolute inset-0 ${config.buttonColor} opacity-[0.03] animate-[pulse_10s_infinite]`} />
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-20 items-center">
          <div className="md:col-span-1 flex flex-col items-center text-center space-y-6">
             <div className="relative group/theory">
                <div className={`w-24 h-24 bg-white/5 rounded-[32px] border border-white/10 flex items-center justify-center text-5xl shadow-2xl backdrop-blur-3xl transition-transform hover:rotate-0 duration-1000 -rotate-12`}>
                  {config.theoryIcon}
                </div>
                <SpeakButton text={config.theoryContent} className="absolute -bottom-2 -right-2 scale-110 shadow-2xl" />
             </div>
             <h4 className={`text-[11px] font-black ${colorMap[config.accentColor].split(' ')[0]} uppercase tracking-[0.5em] leading-tight`}>{config.subtitle.split(' ')[0]}<br/>Logic Core</h4>
          </div>
          <div className="md:col-span-3 space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl md:text-5xl font-black leading-none tracking-tighter italic">{config.theoryTitle}</h3>
              <div className="h-1.5 w-24 bg-indigo-600 rounded-full" />
            </div>
            <p className="text-slate-300 font-medium leading-relaxed text-xl lg:text-2xl max-w-4xl italic">
              "{config.theoryContent}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapySkillsHub;
