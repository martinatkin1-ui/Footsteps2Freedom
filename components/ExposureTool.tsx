
import React, { useState } from 'react';
import { getModuleReflection } from '../geminiService';
import ModuleReflection from './ModuleReflection';

interface HierarchyItem {
  id: string;
  situation: string;
  distress: number;
}

interface ExposureToolProps {
  onComplete: (rating?: number) => void;
  onAskGuide?: () => void;
}

const ExposureTool: React.FC<ExposureToolProps> = ({ onComplete, onAskGuide }) => {
  const [items, setItems] = useState<HierarchyItem[]>([]);
  const [newSit, setNewSit] = useState('');
  const [newDist, setNewDist] = useState(50);
  const [showReflection, setShowReflection] = useState(false);
  const [reflection, setReflection] = useState('');
  const [isListening, setIsListening] = useState(false);

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (isListening) {
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-GB';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setNewSit(prev => prev ? `${prev} ${transcript}` : transcript);
    };
    recognition.start();
  };

  const addItem = () => {
    if (!newSit.trim()) return;
    const newItem = { id: Date.now().toString(), situation: newSit, distress: newDist };
    setItems([...items, newItem].sort((a, b) => b.distress - a.distress));
    setNewSit('');
  };

  const removeItem = (id: string) => setItems(items.filter(i => i.id !== id));

  const handleFinish = async () => {
    const res = await getModuleReflection("Exposure Hierarchy", `User built a ${items.length}-step ladder. Highest distress: ${items[0]?.situation || 'N/A'}.`);
    setReflection(res);
    setShowReflection(true);
  };

  if (showReflection) {
    return <ModuleReflection moduleName="Graded Exposure" context={`User created an exposure ladder with ${items.length} items.`} reflection={reflection} onClose={onComplete} title="Ladder of Resilience" />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
         <div className="flex flex-col items-center gap-2">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">The Exposure Ladder</h2>
            {onAskGuide && (
              <button 
                onClick={onAskGuide}
                className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800 shadow-sm transition-all hover:scale-105 active:scale-95"
              >
                Ask Guide
              </button>
            )}
         </div>
         <p className="text-slate-600 dark:text-slate-400 font-medium max-w-2xl mx-auto">Facing fears gradually is the most effective way to desensitise the brain to stress. Add situations and rate the distress you'd feel (0-100%).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Input Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 border-2 border-slate-100 dark:border-slate-800 shadow-xl h-fit lg:sticky lg:top-24">
           <div className="space-y-6">
              <h3 className="text-xl font-black text-slate-800 dark:text-white">Add Step to Ladder</h3>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest ml-2">The Situation</label>
                 <div className="relative group">
                   <textarea 
                     value={newSit}
                     onChange={(e) => setNewSit(e.target.value)}
                     placeholder={isListening ? "Listening deeply..." : "e.g. Going to the gym at peak hour by myself."}
                     className={`w-full bg-slate-50 dark:bg-slate-800 border-2 rounded-3xl p-6 text-sm font-bold shadow-inner transition-all h-32 resize-none ${isListening ? 'border-rose-400 ring-4 ring-rose-50' : 'border-transparent focus:ring-2 focus:ring-indigo-500 dark:text-white'}`}
                   />
                   <button
                      onClick={toggleListening}
                      className={`absolute bottom-4 right-4 p-3 rounded-2xl transition-all shadow-lg ${
                        isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-white dark:bg-slate-700 text-teal-600 shadow-teal-500/10'
                      }`}
                      title="Voice Input"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 006 0V5a3 3 0 00-3-3z" />
                      </svg>
                    </button>
                 </div>
              </div>
              <div className="space-y-4">
                 <div className="flex justify-between items-end px-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Anticipated Distress</label>
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{newDist}%</span>
                 </div>
                 <input 
                   type="range" min="0" max="100" 
                   value={newDist}
                   onChange={(e) => setNewDist(parseInt(e.target.value))}
                   className="w-full accent-indigo-600"
                 />
              </div>
              <button 
                onClick={addItem}
                disabled={!newSit.trim() || isListening}
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 disabled:opacity-30 transition-all uppercase tracking-widest text-xs"
              >
                Add Step to Hierarchy
              </button>
           </div>
        </div>

        {/* The Ladder Visualization */}
        <div className="space-y-6">
           <div className="flex items-center gap-4 px-4">
              <h3 className="font-black text-slate-400 dark:text-slate-500 uppercase text-xs tracking-[0.4em]">Current Hierarchy</h3>
              <div className="h-px bg-slate-100 dark:bg-slate-800 flex-grow"></div>
           </div>

           {items.length === 0 ? (
             <div className="py-24 text-center space-y-4 opacity-40">
               <span className="text-6xl">🪜</span>
               <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Your ladder is empty.</p>
             </div>
           ) : (
             <div className="space-y-4">
                {items.map((item, idx) => (
                  <div key={item.id} className="flex gap-4 group animate-in slide-in-from-right-4" style={{ animationDelay: `${idx * 50}ms` }}>
                    <div className="flex flex-col items-center w-12 shrink-0">
                       <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center font-black text-xs shadow-lg">{item.distress}%</div>
                       <div className="w-1 h-full bg-slate-100 dark:bg-slate-800 my-1 rounded-full"></div>
                    </div>
                    <div className="flex-grow bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-5 rounded-3xl flex justify-between items-center shadow-sm">
                       <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.situation}</p>
                       <button onClick={() => removeItem(item.id)} className="text-slate-200 hover:text-rose-500 transition-colors">✕</button>
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={handleFinish}
                  className="w-full mt-10 py-6 bg-teal-600 text-white font-black rounded-3xl shadow-xl hover:bg-teal-700 transition-all uppercase tracking-widest text-xs"
                >
                  Seal Hierarchy Pattern
                </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ExposureTool;
