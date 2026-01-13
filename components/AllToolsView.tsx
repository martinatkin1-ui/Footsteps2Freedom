
import React from 'react';
import { COPING_EXERCISES } from '../constants';
import { AppRoute } from '../types';

interface AllToolsViewProps {
  onStartExercise: (id: string) => void;
  setRoute: (route: AppRoute) => void;
}

const CATEGORIES = [
  {
    id: 'dbt',
    title: 'DBT Mastery Hub',
    subtitle: 'Distress Tolerance & Regulation',
    icon: '🛠️',
    description: 'Practical tactics to survive emotional storms and build effective relationships.',
    toolIds: ['tipp-skill', 'accepts-skill', 'improve-skill', 'radical-acceptance', 'stop-skill', 'assertiveness-tool', 'emotional-boundaries'],
    color: 'bg-indigo-600',
    lightBg: 'bg-indigo-50 dark:bg-indigo-900/20',
    border: 'border-indigo-100 dark:border-indigo-800',
    route: AppRoute.DBT_HUB
  },
  {
    id: 'cbt',
    title: 'CBT Patterns Lab',
    subtitle: 'Cognitive Rehearsal & Reframing',
    icon: '🧠',
    description: 'Deconstruct the interplay between your thoughts, feelings, and actions.',
    toolIds: ['chain-analysis', 'cost-benefit-analysis', 'problem_solving', 'exposure_tool', 'inner-critic-challenge', 'cognitive-reframing', 'behaviour-tree', 'progress-monitoring'],
    color: 'bg-orange-600',
    lightBg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-100 dark:border-orange-800',
    route: AppRoute.CBT_HUB
  },
  {
    id: 'mindfulness',
    title: 'Presence Sanctuary',
    subtitle: 'Mindfulness & Grounding',
    icon: '🧘',
    description: 'Tools to quiet the mind and build the "Observing Self" for urge management.',
    toolIds: ['meditation-timer', 'video-sanctuary', 'breathing-exercises', 'grounding', 'urge-surfing'],
    color: 'bg-teal-600',
    lightBg: 'bg-teal-50 dark:bg-teal-900/20',
    border: 'border-teal-100 dark:border-teal-800',
    route: AppRoute.MINDFULNESS_HUB
  },
  {
    id: 'somatic',
    title: 'Somatic Recovery Lab',
    subtitle: 'Body-Based Bio-Regulation',
    icon: '🐚',
    description: 'Regulate your nervous system from the bottom up. Release stored body tension.',
    toolIds: ['somatic-toolkit', 'butterfly-hug', 'pain_management', 'window-of-tolerance'],
    color: 'bg-rose-600',
    lightBg: 'bg-rose-50 dark:bg-rose-950/20',
    border: 'border-rose-100 dark:border-rose-800',
    route: AppRoute.SOMATIC_HUB
  },
  {
    id: 'act',
    title: 'True-Self Sanctuary',
    subtitle: 'Identity, Values & Purpose',
    icon: '🔑',
    description: 'Connect with your core values and commit to the person you are becoming.',
    toolIds: ['smart-goals', 'spirituality', 'affirmation-deck', 'daily-affirmations', 'working_backwards', 'trust_steps', 'self-esteem-foundations', 'shadow-work'],
    color: 'bg-amber-600',
    lightBg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-100 dark:border-amber-800',
    route: AppRoute.ACT_HUB
  },
  {
    id: 'strategy',
    title: 'Stability Ops Hub',
    subtitle: 'Logistics & Safety Planning',
    icon: '🗺️',
    description: 'Build the structural foundations of a stable and predictable recovery lifestyle.',
    toolIds: ['daily-planner', 'rpp-builder', 'accountability-journey', 'self-criticism-workshop'],
    color: 'bg-slate-700',
    lightBg: 'bg-slate-50 dark:bg-slate-800/40',
    border: 'border-slate-100 dark:border-slate-800',
    route: AppRoute.STRATEGY_HUB
  }
];

const AllToolsView: React.FC<AllToolsViewProps> = ({ onStartExercise, setRoute }) => {
  return (
    <div className="space-y-16 pb-40 animate-in fade-in duration-1000">
      <div className="text-center space-y-4 px-4">
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Support Library</h2>
          <span className="text-[11px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-[0.5em]">The Keys to Freedom</span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-bold text-xl max-w-3xl mx-auto leading-relaxed italic">
          "Every tool is a footprint toward your True-Self. Choose the framework that resonates with your current moment."
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-4">
        {CATEGORIES.map((cat, idx) => (
          <button 
            key={cat.id}
            onClick={() => setRoute(cat.route)}
            className="group text-left relative active:scale-[0.98] transition-all duration-500"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className={`bg-white dark:bg-slate-900 rounded-[60px] p-10 border-4 border-slate-50 dark:border-slate-800 h-full flex flex-col shadow-xl hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] transition-all overflow-hidden`}>
              <div className={`absolute top-0 right-0 w-64 h-64 ${cat.color} opacity-5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-150 transition-transform duration-1000`} />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-6 mb-10">
                  <div className={`w-20 h-20 ${cat.color} rounded-[28px] flex items-center justify-center text-4xl text-white shadow-2xl group-hover:rotate-6 transition-transform duration-700`}>
                    {cat.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">{cat.title}</h3>
                    <p className={`${cat.color.replace('bg-', 'text-')} font-black uppercase tracking-[0.3em] text-[9px] mt-1`}>{cat.subtitle}</p>
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-300 text-lg font-medium leading-relaxed mb-12 flex-grow italic">
                  "{cat.description}"
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-8">
                   <div className={`flex items-center gap-3 ${cat.color.replace('bg-', 'text-')} font-black text-[10px] uppercase tracking-[0.4em] group-hover:gap-6 transition-all`}>
                     Enter Hub <span>→</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{cat.toolIds.length} Tools</span>
                   </div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-950 rounded-[60px] p-16 text-white text-center space-y-8 shadow-2xl relative overflow-hidden border-b-[12px] border-slate-900 ring-1 ring-white/10 mx-4">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/5 rounded-full blur-[120px] animate-pulse" />
        <span className="text-6xl block transform hover:scale-125 transition-transform duration-1000">🗺️</span>
        <div className="space-y-4">
          <h3 className="text-3xl md:text-5xl font-black tracking-tighter leading-none italic uppercase">Expedition Complete?</h3>
          <p className="text-slate-400 max-w-3xl mx-auto text-xl font-medium leading-relaxed border-t border-white/5 pt-8">
            These hubs are living archives. Revisit them often to solidify the neural pathways of your recovery.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AllToolsView;
