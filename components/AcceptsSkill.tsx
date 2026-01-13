import React, { useState, useMemo } from 'react';
import ModuleReflection from './ModuleReflection';
import SpeakButton from './SpeakButton';

const SKILLS = [
  { id: 'A', title: 'Activities', icon: '🎮', desc: 'Do something that fully occupies your mind.', example: 'Play a game, clean a drawer, or walk the dog.' },
  { id: 'C', title: 'Contributing', icon: '🤝', desc: 'Focus on someone else to shift focus from yourself.', example: 'Help a friend, act of service, or send a kind text.' },
  { id: 'Co', title: 'Comparisons', icon: '⚖️', desc: 'Compare your current situation to a past harder time.', example: 'Think of a time you survived a greater challenge.' },
  { id: 'E', title: 'Emotions', icon: '🎭', desc: 'Create a different emotion to push out the pain.', example: 'Watch a funny video or listen to high-energy music.' },
  { id: 'P', title: 'Pushing Away', icon: '📦', desc: 'Temporarily put the problem on a mental shelf.', example: 'Tell yourself "I will deal with this tomorrow morning."' },
  { id: 'T', title: 'Thoughts', icon: '🧠', desc: 'Force your brain into a logic-heavy task.', example: 'Count backwards from 1000 by 7s or solve a puzzle.' },
  { id: 'S', title: 'Sensations', icon: '❄️', desc: 'Engage your physical body to ground your nerves.', example: 'Squeeze a stress ball or take a very hot/cold shower.' }
];

interface AcceptsSkillProps {
  onExit: (rating?: number, reflection?: string, artUrl?: string) => void;
  onAskGuide?: () => void;
}

const AcceptsSkill: React.FC<AcceptsSkillProps> = ({ onExit, onAskGuide }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [commitments, setCommitments] = useState<Record<string, string>>({});
  const [currentDraft, setCurrentDraft] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showReflection, setShowReflection] = useState(false);

  const progressCount = useMemo(() => Object.keys(commitments).filter(k => commitments[k].trim().length > 0).length, [commitments]);
  const isComplete = progressCount === SKILLS.length;

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setCurrentDraft(commitments[id] || '');
  };

  const saveCommitment = () => {
    if (selectedId && currentDraft.trim()) {
      setCommitments(prev => ({ ...prev, [selectedId]: currentDraft }));
      setSelectedId(null);
      setCurrentDraft('');
      if ('vibrate' in navigator) navigator.vibrate(10);
    }
  };

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (isListening) { setIsListening(false); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-GB';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setCurrentDraft(prev => prev ? `${prev} ${transcript}` : transcript);
    };
    recognition.start();
  };

  const handleFinish = async () => {
    if (!isComplete) return;
    setShowReflection(true);
  };

  const activeSkill = useMemo(() => SKILLS.find(s => s.id === selectedId), [selectedId]);

  if (showReflection) {
    const summary = SKILLS.map(s => `${s.title}: ${commitments[s.id]}`).join(' | ');
    return (
      <ModuleReflection 
        moduleName="ACCEPTS Toolkit"
        context={`User constructed a complete distraction protocol: ${summary}`}
        onClose={onExit}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-700 pb-40 px-4">
      {/* Acronym Progress Tracker */}
      <div className="max-w-xl mx-auto mb-12 space-y-4">
        <div className="flex justify-between items-end px-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400">Distress Protocol Status</h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{progressCount} of 7 COMMITMENTS</span>
        </div>
        <div className="flex gap-1.5 h-3">
          {SKILLS.map((s) => (
            <div 
              key={s.id} 
              className={`flex-1 rounded-full transition-all duration-500 relative overflow-hidden ${
                commitments[s.id]?.trim() ? 'bg-indigo-600 shadow-sm' : 'bg-slate-100 dark:bg-slate-800'
              }`}
            >
              {selectedId === s.id && <div className="absolute inset-0 bg-white/40 animate-pulse" />}
            </div>
          ))}
        </div>
        <div className="flex justify-between px-1">
          {SKILLS.map(s => (
            <span key={s.id} className={`text-[8px] font-black w-3 text-center ${commitments[s.id]?.trim() ? 'text-indigo-600' : 'text-slate-300'}`}>
              {s.id.charAt(0)}
            </span>
          ))}
        </div>
      </div>

      <div className="text-center space-y-4 mb-10 px-4">
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">The ACCEPTS Toolkit</h2>
          {onAskGuide && (
            <button 
              onClick={onAskGuide}
              className="mt-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800 shadow-sm transition-all hover:scale-105 active:scale-95 animate-pulse"
            >
              Consult Guide
            </button>
          )}
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-bold max-w-lg mx-auto italic">"Distraction is not avoidance; it is a tactical choice to lower arousal before taking action. Commit to one plan for every link in the chain."</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {SKILLS.map((s) => {
          const hasCommitment = !!commitments[s.id]?.trim();
          const isActive = selectedId === s.id;
          
          return (
            <button
              key={s.id}
              onClick={() => handleSelect(s.id)}
              className={`p-8 rounded-[40px] border-2 text-left transition-all relative overflow-hidden group h-full flex flex-col ${
                isActive 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl scale-[1.03] z-10' 
                  : hasCommitment
                    ? 'bg-white dark:bg-slate-900 border-emerald-100 dark:border-emerald-900 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-200'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-4xl group-hover:scale-110 transition-transform">{s.icon}</span>
                {hasCommitment && (
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center animate-in zoom-in ${isActive ? 'bg-white/20' : 'bg-emerald-50 dark:bg-emerald-900/50'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isActive ? 'text-white' : 'text-emerald-600'}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <h3 className={`text-xl font-black mb-2 ${isActive ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{s.title}</h3>
              <p className={`text-[11px] leading-relaxed font-medium flex-grow ${isActive ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
                {hasCommitment ? `"${commitments[s.id].slice(0, 70)}..."` : s.desc}
              </p>
              {!hasCommitment && !isActive && (
                <span className="text-[8px] font-black text-indigo-500 uppercase mt-4">Required Action →</span>
              )}
            </button>
          );
        })}
      </div>

      {selectedId && activeSkill && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[60px] p-8 md:p-12 shadow-2xl border-4 border-indigo-600 space-y-8 animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 rounded-[28px] flex items-center justify-center text-4xl shadow-inner">
                       {activeSkill.icon}
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{activeSkill.title}</h3>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Entry Point</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedId(null)} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500">✕</button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700 relative group">
                 <SpeakButton text={activeSkill.desc + " For example: " + activeSkill.example} size={14} className="absolute top-2 right-2 opacity-40 group-hover:opacity-100" />
                 <p className="text-sm text-slate-600 dark:text-slate-300 font-bold italic leading-relaxed">
                   "{activeSkill.desc} e.g. {activeSkill.example}"
                 </p>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center gap-3 px-2">
                    <p className="text-slate-800 dark:text-white font-black text-lg tracking-tight">Your Action Commitment:</p>
                 </div>
                 <div className="relative group/input">
                    <textarea
                       autoFocus
                       value={currentDraft}
                       onChange={(e) => setCurrentDraft(e.target.value)}
                       placeholder="I commit to..."
                       className={`w-full h-48 bg-slate-50 dark:bg-slate-950 border-2 rounded-[32px] p-8 text-slate-800 dark:text-white text-lg font-medium leading-relaxed resize-none transition-all shadow-inner focus:ring-8 focus:ring-indigo-500/10 ${isListening ? 'border-rose-400 ring-rose-100' : 'border-slate-100 dark:border-slate-800'}`}
                    />
                    <button
                       onClick={toggleListening}
                       className={`absolute bottom-6 right-6 p-4 rounded-2xl shadow-xl transition-all z-20 ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:scale-110 shadow-indigo-500/10'}`}
                    >
                       <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isListening ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 00-3-3z" />
                       </svg>
                    </button>
                 </div>
              </div>

              <button 
                onClick={saveCommitment}
                disabled={!currentDraft.trim() || isListening}
                className={`w-full py-6 rounded-3xl font-black text-sm uppercase tracking-widest transition-all shadow-xl active:scale-[0.98] ${currentDraft.trim() && !isListening ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-300'}`}
              >
                Seal this Commitment
              </button>
           </div>
        </div>
      )}

      {/* Completion Anchor */}
      <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 z-40 transition-all duration-700 ${isComplete ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
        <button 
          onClick={handleFinish}
          className="w-full py-6 bg-emerald-600 text-white font-black rounded-3xl shadow-2xl shadow-emerald-600/40 hover:bg-emerald-700 transition-all active:scale-[0.98] uppercase tracking-[0.4em] text-xs flex items-center justify-center gap-4 group"
        >
          <span>🏁</span> Finalise ACCEPTS Blueprint
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {!selectedId && (
        <div className="mt-12 text-center flex flex-col items-center gap-6">
           <div className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 transition-all shadow-sm ${isComplete ? 'border-emerald-500/20' : 'border-amber-100 dark:border-amber-900/30'}`}>
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isComplete ? 'text-emerald-600' : 'text-amber-600'}`}>
                 {isComplete ? 'Protocol Ready for Archival' : `Action Required: Complete ${SKILLS.length - progressCount} more nodes to seal the protocol`}
              </p>
           </div>
           <button onClick={() => onExit()} className="text-slate-400 font-bold hover:text-rose-500 uppercase text-[9px] tracking-widest transition-colors">Discard Progress & Exit</button>
        </div>
      )}
    </div>
  );
};

export default AcceptsSkill;