
import React, { useState } from 'react';
import { enhanceJournalInsight } from '../geminiService';
import ModuleReflection from './ModuleReflection';
import SpeakButton from './SpeakButton';

const AcceptanceTool: React.FC<{ onExit: (rating?: number, reflection?: string) => void }> = ({ onExit }) => {
  const [view, setView] = useState<'intro' | 'reframing' | 'reflection'>('intro');
  const [resentment, setResentment] = useState('');
  const [reframe, setReframe] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleReframe = async () => {
    if (!resentment.trim()) return;
    setIsLoading(true);
    // Use Gemini to generate a reframe based on the "chain of events" principle
    const result = await enhanceJournalInsight(
      `Current Resentment: ${resentment}`, 
      `Instruction: Generate a Radical Acceptance reframe. Principles: 1. Acknowledge the 'pain' as a fact. 2. Eliminate 'suffering' (the 'it shouldn't be this way' part). 3. Recognize the long 'chain of events' that led to this moment. 4. Focus on what can be done now. Output a single paragraph of roughly 40-50 words.`,
      "Regulation"
    );
    setReframe(result || 'Accept this moment as the result of a long chain of events. You cannot change the past, but you can choose your next step.');
    setIsLoading(false);
  };

  if (view === 'reflection') {
    return <ModuleReflection 
      moduleName="Radical Acceptance" 
      context={`User reframed a resentment: "${resentment}". Reframe: "${reframe}"`} 
      onClose={onExit} 
    />;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-700 pb-20">
      {view === 'intro' ? (
        <div className="bg-white dark:bg-slate-900 rounded-[50px] p-8 md:p-12 border-2 border-slate-200 dark:border-slate-800 shadow-xl space-y-10 relative overflow-hidden">
          <header className="space-y-4">
            <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-3xl text-white shadow-xl">🧘‍♀️</div>
            <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">Accepting Reality: Radical Acceptance</h2>
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-black uppercase text-indigo-600 mb-2 tracking-widest">The 'Why'</h3>
              <p className="text-slate-700 dark:text-slate-300 font-medium">
                Fighting reality ("It shouldn't be this way," "I shouldn't be an addict") creates suffering on top of pain. Acceptance does not mean approval, but rather acknowledging the facts of your situation so you can stop fighting the past and start changing the future.
              </p>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-black text-indigo-600 uppercase text-[10px] tracking-widest ml-2">When to use:</h4>
              <ul className="space-y-3">
                {[
                  "When you feel victimized by your past.",
                  "When you refuse to acknowledge the consequences of addiction.",
                  "When you are stuck in 'should' thinking about yourself or others."
                ].map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm font-bold text-slate-600 dark:text-slate-400 italic">
                    <span className="text-indigo-500">→</span> "{s}"
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-black text-indigo-600 uppercase text-[10px] tracking-widest ml-2">The Path:</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Shift from "Willful" (fighting reality) to "Willing" (accepting reality). Use statements like "This is the way it has to be right now" or "Fighting the past only blinds me to the present."</p>
            </div>
          </div>

          <button 
            onClick={() => setView('reframing')}
            className="w-full py-6 bg-indigo-600 text-white font-black rounded-3xl shadow-xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs"
          >
            Access Reframing Tool
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[50px] p-8 md:p-12 border-2 border-slate-200 dark:border-slate-800 shadow-xl space-y-10">
           <div className="space-y-4">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Reframing Tool</h3>
              <p className="text-slate-500 dark:text-slate-400 font-bold italic">Input a resentment or a reality you are struggling to accept:</p>
              <textarea
                autoFocus
                value={resentment}
                onChange={(e) => setResentment(e.target.value)}
                placeholder="e.g. 'I lost my job because of my addiction and I can't believe I was so stupid...'"
                className="w-full h-40 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-3xl p-8 text-lg font-medium italic resize-none transition-all outline-none focus:border-indigo-500"
              />
           </div>

           {reframe ? (
             <div className="p-8 bg-indigo-50 dark:bg-indigo-950/40 rounded-[40px] border-4 border-indigo-100 dark:border-indigo-900 animate-in slide-in-from-bottom-4 duration-700">
                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4 block">Radical Reframe</span>
                <p className="text-xl text-slate-800 dark:text-slate-100 font-bold italic">"{reframe}"</p>
                <div className="mt-8 flex justify-end">
                   <button onClick={() => setView('reflection')} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest">Archive Insight</button>
                </div>
             </div>
           ) : (
             <button 
                onClick={handleReframe}
                disabled={!resentment.trim() || isLoading}
                className="w-full py-6 bg-indigo-600 text-white font-black rounded-3xl shadow-xl hover:bg-indigo-700 disabled:opacity-30 uppercase tracking-widest text-xs flex items-center justify-center gap-3"
             >
               {isLoading ? "Analyzing Chain of Events..." : "Apply Radical Acceptance"}
             </button>
           )}
           <button onClick={() => setView('intro')} className="w-full text-slate-400 font-black text-[10px] uppercase tracking-widest">Back</button>
        </div>
      )}
    </div>
  );
};

export default AcceptanceTool;
