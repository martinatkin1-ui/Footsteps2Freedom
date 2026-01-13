
import React, { useState } from 'react';
import ModuleReflection from './ModuleReflection';

const SKILLS = [
  { id: 'I', title: 'Imagery', icon: '🏞️', desc: 'Create a mental safe place to rest.', example: 'Envision a calm beach or your favorite childhood forest.' },
  { id: 'M', title: 'Meaning', icon: '💎', desc: 'Find a purpose in the current struggle.', example: 'Remember that this discomfort is proof you are growing.' },
  { id: 'P', title: 'Prayer', icon: '🙏', desc: 'Connect to a power or purpose greater than self.', example: 'Recite the Serenity Prayer or ask the universe for strength.' },
  { id: 'R', title: 'Relaxation', icon: '🛁', desc: 'Calm the physical body to calm the mind.', example: 'Take a warm bath, stretch, or use a somatic tool.' },
  { id: 'O', title: 'One thing', icon: '🎯', desc: 'Focus entirely on the present micro-task.', example: 'Wash a single dish with absolute focus and awareness.' },
  { id: 'V', title: 'Vacation', icon: '🏖️', desc: 'Take a short, planned break from responsibility.', example: 'Sit on a park bench for 10 minutes without your phone.' },
  { id: 'E', title: 'Encouragement', icon: '📣', desc: 'Be your own cheerleader.', example: 'Say aloud: "I can do this. I have survived before."' }
];

interface ImproveSkillProps {
  onExit: (rating?: number) => void;
  onAskGuide?: () => void;
}

const ImproveSkill: React.FC<ImproveSkillProps> = ({ onExit, onAskGuide }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());
  const [showReflection, setShowReflection] = useState(false);

  const handleSelect = (id: string) => {
    setSelected(id);
    setViewedIds(prev => new Set(prev).add(id));
  };

  const progressCount = viewedIds.size;

  if (showReflection) {
    return <ModuleReflection 
      moduleName="IMPROVE Skill" 
      context={`User explored the IMPROVE mindset framework. Progress: ${progressCount}/7. Final selection: '${SKILLS.find(s => s.id === selected)?.title}'.`} 
      onClose={onExit} 
    />;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-500 pb-32">
      {/* Acronym Progress Tracker */}
      <div className="max-w-xl mx-auto mb-12 space-y-4">
        <div className="flex justify-between items-end px-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600 dark:text-amber-400">Mindset Evolution</h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{progressCount} of 7 Refined</span>
        </div>
        <div className="flex gap-1.5 h-3">
          {SKILLS.map((s) => (
            <div 
              key={s.id} 
              className={`flex-1 rounded-full transition-all duration-500 relative overflow-hidden ${
                viewedIds.has(s.id) ? 'bg-amber-500 shadow-sm' : 'bg-slate-100 dark:bg-slate-800'
              }`}
            >
              {selected === s.id && <div className="absolute inset-0 bg-white/40 animate-pulse" />}
            </div>
          ))}
        </div>
        <div className="flex justify-between px-1">
          {SKILLS.map(s => (
            <span key={s.id} className={`text-[8px] font-black w-3 text-center ${viewedIds.has(s.id) ? 'text-amber-600' : 'text-slate-300'}`}>
              {s.id}
            </span>
          ))}
        </div>
      </div>

      <div className="text-center space-y-4 mb-10 px-4">
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">The IMPROVE Skillset</h2>
          {onAskGuide && (
            <button 
              onClick={onAskGuide}
              className="mt-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800 shadow-sm transition-all hover:scale-105 active:scale-95 animate-pulse"
            >
              Ask Guide
            </button>
          )}
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-bold max-w-lg mx-auto">Shift your internal experience and find meaning in the discomfort through mindset shifts.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 px-4">
        {SKILLS.map((s) => {
          const isViewed = viewedIds.has(s.id);
          const isActive = selected === s.id;

          return (
            <button
              key={s.id}
              onClick={() => handleSelect(s.id)}
              className={`p-8 rounded-[40px] border-2 text-left transition-all relative overflow-hidden group h-full flex flex-col ${
                isActive 
                  ? 'bg-amber-500 border-amber-500 text-white shadow-2xl scale-[1.03] z-10' 
                  : isViewed
                    ? 'bg-white dark:bg-slate-900 border-amber-100 dark:border-amber-900 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-amber-200 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-4xl group-hover:scale-110 transition-transform">{s.icon}</span>
                {isViewed && (
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center animate-in zoom-in ${isActive ? 'bg-white/20' : 'bg-amber-50 dark:bg-amber-900/50'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isActive ? 'text-white' : 'text-amber-600'}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <h3 className={`text-xl font-black mb-2 ${isActive ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{s.title}</h3>
              <p className={`text-xs leading-relaxed font-medium flex-grow ${isActive ? 'text-amber-50' : 'text-slate-500 dark:text-slate-400'}`}>{s.desc}</p>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="fixed bottom-8 left-4 right-4 md:left-auto md:right-8 md:w-96 z-50 animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border-4 border-amber-500 shadow-2xl space-y-4">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 text-amber-600 rounded-xl flex items-center justify-center text-xl shadow-inner">
                 {SKILLS.find(s => s.id === selected)?.icon}
               </div>
               <div>
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chosen Mindset</h4>
                 <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{SKILLS.find(s => s.id === selected)?.title}</h3>
               </div>
             </div>
             
             <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
               <p className="text-xs text-slate-600 dark:text-slate-300 font-bold italic leading-relaxed">
                 "Implementation: {SKILLS.find(s => s.id === selected)?.example}"
               </p>
             </div>

             <button 
               onClick={() => setShowReflection(true)}
               className="w-full py-4 bg-amber-500 text-white font-black rounded-2xl shadow-xl shadow-amber-500/30 hover:bg-amber-600 active:scale-95 transition-all text-xs uppercase tracking-widest"
             >
               Integrate Perspective
             </button>
          </div>
        </div>
      )}
      
      {!selected && (
        <div className="mt-12 text-center">
           <button onClick={() => onExit()} className="text-slate-400 font-bold hover:text-slate-600 uppercase text-[10px] tracking-widest">Close Toolkit</button>
        </div>
      )}
    </div>
  );
};

export default ImproveSkill;
