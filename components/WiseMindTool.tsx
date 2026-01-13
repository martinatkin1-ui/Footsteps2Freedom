
import React, { useState } from 'react';
import { getModuleReflection } from '../geminiService';
import ModuleReflection from './ModuleReflection';
import SpeakButton from './SpeakButton';

const WiseMindTool: React.FC<{ onExit: (rating?: number, reflection?: string) => void }> = ({ onExit }) => {
  const [view, setView] = useState<'intro' | 'helper' | 'reflection'>('intro');
  const [inputs, setInputs] = useState({ question: '', emotion: '', reason: '', wise: '' });
  const [reflection, setReflection] = useState('');
  const [showReflection, setShowReflection] = useState(false);

  const handleFinish = async () => {
    const context = `Decision: ${inputs.question}. Emotion Mind: ${inputs.emotion}. Reasonable Mind: ${inputs.reason}. Wise Mind: ${inputs.wise}.`;
    const res = await getModuleReflection("Wise Mind Synthesis", context);
    setReflection(res);
    setShowReflection(true);
  };

  if (showReflection) {
    return <ModuleReflection moduleName="Wise Mind Synthesis" context="Decision analysis completed." reflection={reflection} onClose={onExit} title="Wisdom Found" />;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-700 pb-24 px-4">
      {view === 'intro' ? (
        <div className="bg-white dark:bg-slate-900 rounded-[50px] p-8 md:p-12 border-2 border-slate-200 dark:border-slate-800 shadow-xl space-y-10 relative overflow-hidden">
          <header className="space-y-4">
            <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-3xl text-white shadow-xl">💎</div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Finding Your Wise Mind</h2>
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-black uppercase text-indigo-600 mb-2 tracking-widest">The 'Why'</h3>
              <p className="text-slate-700 dark:text-slate-300 font-medium">
                "Emotion Mind" is governed by cravings and mood. "Reasonable Mind" is focused on cold logic and facts. Recovery happens in **Wise Mind**—the synthesis of both. It's the point of intuition and clarity where you know what is both true and healthy for your True-Self.
              </p>
            </div>
          </header>

          <div className="space-y-6">
             <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">The 'When'</h4>
             <p className="text-slate-500 font-bold italic px-2">Use when making difficult decisions (e.g., "Should I go to that party?") or when feeling torn between a craving and a long-term goal.</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-inner">
             <h4 className="text-[10px] font-black uppercase text-indigo-500 mb-4 tracking-widest">Wise Mind Meditation</h4>
             <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed">
               "Locate the center of your gut or your breath. Breathe into that center. Ask your inner intuitive self for guidance. Notice what thoughts or solutions arise without judging them."
             </p>
          </div>

          <button 
            onClick={() => setView('helper')}
            className="w-full py-6 bg-indigo-600 text-white font-black rounded-3xl shadow-xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs"
          >
            Begin Decision Helper
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[60px] p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden space-y-12">
           <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Decision Helper</h3>
              <p className="text-slate-500 dark:text-slate-400 font-bold italic">Synthesize reason and emotion into wisdom.</p>
           </div>

           <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">What is the question/decision?</label>
                <input 
                  value={inputs.question}
                  onChange={(e) => setInputs({...inputs, question: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 font-bold text-slate-800 dark:text-white"
                  placeholder="e.g. Should I meet up with my old using friend?"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-rose-500 tracking-widest ml-2">What does Emotion Mind say?</label>
                    <textarea 
                      value={inputs.emotion}
                      onChange={(e) => setInputs({...inputs, emotion: e.target.value})}
                      className="w-full h-32 bg-rose-50/20 dark:bg-rose-950/10 border-2 border-rose-100 dark:border-rose-900/30 rounded-2xl p-6 text-sm font-medium italic resize-none"
                      placeholder="My cravings want to go. I feel lonely and miss the old times..."
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-sky-500 tracking-widest ml-2">What does Reasonable Mind say?</label>
                    <textarea 
                      value={inputs.reason}
                      onChange={(e) => setInputs({...inputs, reason: e.target.value})}
                      className="w-full h-32 bg-sky-50/20 dark:bg-sky-950/10 border-2 border-sky-100 dark:border-sky-900/30 rounded-2xl p-6 text-sm font-medium italic resize-none"
                      placeholder="The risk of relapse is 90%. I have work tomorrow. I am safe today..."
                    />
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest ml-2">Your Wise Mind Synthesis</label>
                 <textarea 
                   value={inputs.wise}
                   onChange={(e) => setInputs({...inputs, wise: e.target.value})}
                   className="w-full h-40 bg-indigo-50/20 dark:bg-indigo-950/20 border-2 border-indigo-200 dark:border-indigo-900/50 rounded-3xl p-8 text-lg font-black italic shadow-inner outline-none transition-all focus:border-indigo-500"
                   placeholder="Acknowledge the feeling AND the facts. What is the path of integrity?"
                 />
              </div>
           </div>

           <div className="flex flex-col gap-4">
              <button 
                onClick={handleFinish}
                disabled={!inputs.wise.trim()}
                className="w-full py-6 bg-indigo-600 text-white font-black rounded-3xl shadow-xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs disabled:opacity-30"
              >
                Seal Wise Mind Artifact
              </button>
              <button onClick={() => setView('intro')} className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Back</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default WiseMindTool;
