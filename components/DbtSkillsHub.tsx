
import React from 'react';
import { COPING_EXERCISES } from '../constants';
import { useRecoveryStore } from '../store';

interface DbtSkillsHubProps {
  onStartExercise: (id: string) => void;
  onAskGuide: () => void;
}

const DBT_TOOL_IDS = ['tipp-skill', 'accepts-skill', 'improve-skill', 'radical-acceptance', 'stop-skill', 'assertiveness-tool', 'emotional-boundaries'];

const DbtSkillsHub: React.FC<DbtSkillsHubProps> = ({ onStartExercise, onAskGuide }) => {
  const completedIds = useRecoveryStore(state => state.completedExercises);
  const dbtTools = COPING_EXERCISES.filter(ex => DBT_TOOL_IDS.includes(ex.id));
  
  const totalDbt = dbtTools.length;
  const completedDbt = dbtTools.filter(t => completedIds.includes(t.id)).length;
  const masteryProgress = Math.round((completedDbt / totalDbt) * 100);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-32">
      <div className="bg-white dark:bg-slate-900 rounded-[48px] p-8 md:p-12 border-4 border-indigo-50 dark:border-indigo-900/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50 dark:bg-indigo-900/20 rounded-full -mr-40 -mt-40 blur-3xl opacity-50 animate-pulse" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-6 flex-grow">
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">🛠️</span>
              <div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">DBT Skills Hub</h2>
                <p className="text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] mt-1">Dialectical Behaviour Therapy Mastery</p>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg font-medium leading-relaxed max-w-2xl">
              DBT is a powerhouse framework for building "a life worth living." It combines mindfulness with practical tactics for managing storms and healing relationships.
            </p>
            <button 
              onClick={onAskGuide}
              className="px-8 py-4 bg-indigo-600 text-white font-black rounded-3xl shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs flex items-center gap-3"
            >
              <span>💡</span> Ask Guide about DBT
            </button>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-950 p-8 rounded-[40px] border border-indigo-100 dark:border-indigo-900 min-w-[240px] flex flex-col items-center text-center shadow-inner">
             <div className="relative w-24 h-24 mb-4">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-indigo-200 dark:text-indigo-800" />
                  <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="6" fill="transparent" 
                    strokeDasharray={264} strokeDashoffset={264 - (264 * masteryProgress) / 100}
                    strokeLinecap="round"
                    className="text-indigo-600 dark:text-indigo-400 transition-all duration-1000 ease-out" 
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-black text-xl text-indigo-700 dark:text-indigo-300">
                  {masteryProgress}%
                </div>
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-1">Hub Mastery</p>
             <p className="text-sm font-bold text-indigo-700 dark:text-indigo-200">{completedDbt} of {totalDbt} skills used</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center gap-4 px-4">
          <h3 className="font-black text-slate-400 dark:text-slate-500 uppercase text-xs tracking-[0.4em]">Core Competencies</h3>
          <div className="h-[2px] bg-slate-200 dark:bg-slate-800 flex-grow rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 px-2">
          {dbtTools.map((tool) => {
            const isDone = completedIds.includes(tool.id);
            return (
              <button 
                key={tool.id} 
                onClick={() => onStartExercise(tool.id)}
                className={`bg-white dark:bg-slate-900 rounded-[40px] p-8 border-2 transition-all group text-left flex flex-col relative overflow-hidden active:scale-[0.98] ${
                  isDone 
                    ? 'border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/5 shadow-sm' 
                    : 'border-slate-100 dark:border-slate-800 hover:border-indigo-400/30 hover:shadow-2xl'
                }`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 dark:bg-indigo-900/10 rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-110 transition-transform duration-700" />
                
                <div className="flex justify-between items-center mb-6 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner transition-all duration-500 ${
                    isDone ? 'bg-indigo-600 text-white shadow-indigo-600/20' : 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 group-hover:rotate-6'
                  }`}>
                    {isDone ? '✓' : (
                      tool.id === 'tipp-skill' ? '🌊' : 
                      tool.id === 'accepts-skill' ? '🎮' :
                      tool.id === 'improve-skill' ? '💡' :
                      tool.id === 'radical-acceptance' ? '🧘' :
                      tool.id === 'stop-skill' ? '🛑' :
                      tool.id === 'assertiveness-tool' ? '🦁' : '🛠️'
                    )}
                  </div>
                </div>

                <div className="space-y-4 flex-grow relative z-10">
                  <h4 className={`text-2xl font-black tracking-tight transition-colors ${isDone ? 'text-slate-900 dark:text-emerald-400' : 'text-slate-900 dark:text-white group-hover:text-indigo-600'}`}>{tool.title}</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed line-clamp-3 italic">"{tool.description}"</p>
                </div>
                
                <div className={`mt-12 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between relative z-10 ${isDone ? 'text-emerald-600' : 'text-indigo-600 dark:text-indigo-400'}`}>
                  <div className={`flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.3em] group-hover:gap-6 transition-all`}>
                    {isDone ? 'Revisit Landmark' : 'Execute Step'} <span>→</span>
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

      <div className="bg-slate-950 rounded-[50px] p-10 md:p-16 text-white relative overflow-hidden shadow-2xl border border-white/5">
        <div className="absolute inset-0 bg-indigo-500/5 animate-pulse" />
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1 flex flex-col items-center text-center space-y-4">
             <div className="w-20 h-20 bg-white/10 rounded-[28px] flex items-center justify-center text-4xl shadow-inner backdrop-blur-md">☯️</div>
             <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Dialectics</h4>
          </div>
          <div className="md:col-span-3 space-y-4">
            <h3 className="text-2xl font-bold leading-tight">Finding the Middle Path</h3>
            <p className="text-slate-300 font-medium leading-relaxed italic">
              "DBT is built on the concept of 'Dialectics'—the idea that two seemingly opposite things can both be true. The primary dialectic in recovery is: I am doing the best I can AND I need to do better. By accepting yourself fully while simultaneously committing to change, you find the freedom to grow."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DbtSkillsHub;
