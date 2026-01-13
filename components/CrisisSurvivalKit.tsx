
import React, { useState } from 'react';
import ModuleReflection from './ModuleReflection';

const OPTIONS = {
  harm_reduction: [
    { label: 'Hold ice cube in hand', icon: '❄️' },
    { label: 'Snap rubber band on wrist', icon: '➰' },
    { label: 'Gently dig fingernails in arm', icon: '🖐️' },
    { label: 'Cold water splash on face', icon: '🌊' }
  ],
  pleasurable: [
    { label: 'High-intensity exercise', icon: '🏃' },
    { label: 'Watch a funny movie', icon: '🎭' },
    { label: 'Listen to loud music', icon: '🎧' },
    { label: 'Play a complex video game', icon: '🎮' }
  ],
  self_soothing: [
    { label: 'Scented candle (Smell)', icon: '👃' },
    { label: 'Warm blanket (Touch)', icon: '🛌' },
    { label: 'Soothing podcast (Hearing)', icon: '👂' },
    { label: 'Favorite tea (Taste)', icon: '🍵' }
  ]
};

const CrisisSurvivalKit: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [selected, setSelected] = useState<Record<string, string[]>>({
    harm_reduction: [],
    pleasurable: [],
    self_soothing: []
  });
  const [view, setView] = useState<'build' | 'reflection'>('build');

  const toggleSelect = (cat: string, label: string) => {
    const current = selected[cat];
    if (current.includes(label)) {
      setSelected({ ...selected, [cat]: current.filter(l => l !== label) });
    } else if (current.length < 2) {
      setSelected({ ...selected, [cat]: [...current, label] });
    }
  };

  // Fix: Explicitly type the values from Object.values to ensure length property is recognized on each entry
  const isReady = (Object.values(selected) as string[][]).every(s => s.length === 2);

  if (view === 'reflection') {
    return <ModuleReflection 
      moduleName="Crisis Survival Kit" 
      context={`User built a crisis plan. Choices: ${JSON.stringify(selected)}`} 
      onClose={onExit} 
    />;
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in duration-700 pb-32">
      <div className="bg-white dark:bg-slate-900 rounded-[60px] p-8 md:p-12 border-2 border-slate-100 dark:border-slate-800 shadow-2xl space-y-12">
        <header className="text-center space-y-4">
           <div className="w-20 h-20 bg-rose-600 rounded-3xl flex items-center justify-center text-4xl text-white shadow-xl mx-auto">🩹</div>
           <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Crisis Survival Kit</h2>
           <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 text-left">
              <h3 className="text-sm font-black uppercase text-rose-600 mb-2 tracking-widest">The 'Why'</h3>
              <p className="text-slate-700 dark:text-slate-300 font-medium">
                Sometimes emotions are too "hot" to process. The goal here is simple survival: getting through the moment without substances or self-harm. This is distraction to buy time, not permanent avoidance.
              </p>
           </div>
        </header>

        <div className="space-y-6">
           <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest px-2">The 'When'</h3>
           <p className="text-slate-500 font-bold italic px-2">Use when cravings are 8/10 or higher, or when you feel an overwhelming urge to self-harm.</p>
        </div>

        <div className="space-y-12">
          {Object.entries(OPTIONS).map(([key, items]) => (
            <div key={key} className="space-y-6">
              <div className="flex items-center justify-between px-2">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">{key.replace('_', ' ')}</h4>
                 <span className="text-[9px] font-bold text-slate-400">Select 2 Favorites</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {items.map(item => (
                  <button
                    key={item.label}
                    onClick={() => toggleSelect(key, item.label)}
                    className={`p-6 rounded-[32px] border-2 transition-all flex flex-col items-center gap-4 group ${
                      selected[key].includes(item.label) 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl scale-105' 
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-indigo-200'
                    }`}
                  >
                    <span className="text-3xl transition-transform group-hover:rotate-12">{item.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest leading-tight text-center">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-10 border-t border-slate-100 dark:border-slate-800">
          <button 
            disabled={!isReady}
            onClick={() => setView('reflection')}
            className={`w-full py-6 rounded-3xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl ${
              isReady ? 'bg-teal-600 text-white shadow-teal-600/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-300'
            }`}
          >
            {isReady ? "Save Crisis Survival Plan" : "Select 2 From Each Category"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrisisSurvivalKit;
