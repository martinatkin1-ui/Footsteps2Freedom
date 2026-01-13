
import React from 'react';
import { COPING_EXERCISES } from '../constants';
import { AppRoute } from '../types';

interface CopingBandageProps {
  onStartExercise: (id: string) => void;
  onAskGuide: () => void;
  onStartPolyvagal: () => void;
}

const BANDAGE_TOOL_IDS = [
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

const CopingBandage: React.FC<CopingBandageProps> = ({ onStartExercise, onAskGuide, onStartPolyvagal }) => {
  const bandageTools = COPING_EXERCISES.filter(ex => BANDAGE_TOOL_IDS.includes(ex.id));

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-32">
      {/* Emergency Header */}
      <div className="bg-white dark:bg-slate-900 rounded-[48px] p-8 md:p-12 border-4 border-teal-50 dark:border-teal-900/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-50 dark:bg-teal-900/20 rounded-full -mr-40 -mt-40 blur-3xl opacity-50 animate-pulse" />
        
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 bg-teal-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg">🩹</span>
                <span className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-[0.4em]">Emergency First Aid</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">The Coping Bandage</h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg font-medium leading-relaxed max-w-2xl">
                When feelings are too loud or urges feel too heavy, use these bandages to protect your stability. These are your "in-the-moment" anchors.
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={onStartPolyvagal}
                className="px-8 py-5 bg-rose-600 text-white font-black rounded-3xl shadow-xl shadow-rose-600/30 hover:bg-rose-700 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs flex items-center gap-3"
              >
                <span>🧪</span> Polyvagal Reset
              </button>
              <button 
                onClick={onAskGuide}
                className="px-8 py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs flex items-center gap-3 group"
              >
                <span className="text-xl group-hover:animate-bounce">💡</span>
                Vocalise Distress to Guide
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="space-y-6">
        <h3 className="font-black text-slate-400 dark:text-slate-500 uppercase text-xs tracking-[0.4em] flex items-center gap-4 px-4">
            Instant Regulation Tools
            <span className="h-px bg-slate-200 dark:bg-slate-800 flex-grow"></span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
          {bandageTools.map((tool) => (
            <div 
              key={tool.id} 
              onClick={() => onStartExercise(tool.id)}
              className="bg-white dark:bg-slate-900 rounded-[40px] p-8 border-2 border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-teal-500/30 transition-all group cursor-pointer flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 dark:bg-teal-900/10 rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-110 transition-transform duration-700" />
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="w-14 h-14 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                   {tool.id.includes('meditation') ? '🧘' : tool.id.includes('breathing') ? '🌬️' : tool.id.includes('tipp') ? '🌊' : '🩹'}
                </div>
              </div>
              <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-teal-600 transition-colors relative z-10">{tool.title}</h4>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed mb-8 flex-grow relative z-10">{tool.description}</p>
              <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-black text-[10px] uppercase tracking-[0.2em] relative z-10 group-hover:gap-4 transition-all">
                Activate Bandage <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CopingBandage;
