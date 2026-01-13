
import React, { useState } from 'react';
import { useRecoveryStore } from '../store';
import ModuleReflection from './ModuleReflection';
import SpeakButton from './SpeakButton';

interface ProgressMonitoringProps {
  onExit: (rating?: number) => void;
  onAskGuide?: () => void;
}

const ProgressMonitoring: React.FC<ProgressMonitoringProps> = ({ onExit, onAskGuide }) => {
  const [successes, setSuccesses] = useState('');
  const [setbacks, setSetbacks] = useState('');
  const [isListening, setIsListening] = useState<string | null>(null);
  const [showReflection, setShowReflection] = useState(false);
  const [habits, setHabits] = useState([
    { id: 1, name: 'Mindfulness', active: false, icon: '🧘' },
    { id: 2, name: 'Sober Meetings', active: false, icon: '🤝' },
    { id: 3, name: 'Self-Care Ritual', active: false, icon: '🛁' },
    { id: 4, name: 'Healthy Boundaries', active: false, icon: '🧱' }
  ]);

  const toggleHabit = (id: number) => {
    setHabits(habits.map(h => h.id === id ? { ...h, active: !h.active } : h));
  };

  const toggleListening = (field: 'successes' | 'setbacks') => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (isListening === field) { setIsListening(null); return; }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-GB';
    recognition.onstart = () => setIsListening(field);
    recognition.onend = () => setIsListening(null);
    recognition.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      if (field === 'successes') setSuccesses(prev => prev ? `${prev} ${t}` : t);
      else setSetbacks(prev => prev ? `${prev} ${t}` : t);
    };
    recognition.start();
  };

  const handleFinish = () => {
    handleFinishAsync();
  };

  const handleFinishAsync = async () => {
    setShowReflection(true);
  };

  if (showReflection) {
    return (
      <ModuleReflection 
        moduleName="Progress Monitoring" 
        context={`User completed daily check. Habits: ${habits.filter(h => h.active).map(h => h.name).join(', ') || 'None'}. Successes: ${successes}`} 
        onClose={onExit} 
      />
    );
  }

  const VoiceButton = ({ field }: { field: 'successes' | 'setbacks' }) => (
    <button 
      onClick={() => toggleListening(field)}
      className={`absolute bottom-6 right-6 p-4 rounded-2xl transition-all shadow-xl active:scale-90 ${
        isListening === field 
          ? 'bg-rose-500 text-white animate-pulse' 
          : 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-teal-500/10'
      }`}
      title="Voice Input"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 006 0V5a3 3 0 00-3-3z" />
      </svg>
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700 pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Progress Hub</h2>
          <div className="flex items-center gap-3">
             <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Behavioural Activation Monitor</p>
             <SpeakButton text="Progress Hub. By tracking your habits regularly, you gain insights into your behavior patterns and identify areas for improvement. This is your tool for creating lasting change." size={12} className="opacity-60" />
          </div>
        </div>
        <div className="flex gap-3">
          {onAskGuide && (
            <button 
              onClick={onAskGuide}
              className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800 shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              Ask Guide
            </button>
          )}
          <button onClick={() => onExit()} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700">Close</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-2">
        {/* Left Column: Habits */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-[48px] p-8 md:p-10 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8 relative overflow-hidden h-fit">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 dark:bg-teal-900/10 rounded-full -mr-16 -mt-16 opacity-50 blur-3xl pointer-events-none"></div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <span className="text-3xl">✅</span> Daily Habit Check
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 ml-1">Non-Negotiable Stability Anchors</p>
          </div>
          
          <div className="space-y-4">
            {habits.map((h) => (
              <button
                key={h.id}
                onClick={() => toggleHabit(h.id)}
                className={`w-full p-6 rounded-[28px] border-2 transition-all flex items-center justify-between font-bold group ${
                  h.active 
                    ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-500 text-teal-900 dark:text-teal-400 shadow-inner' 
                    : 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-400 dark:text-slate-600 hover:border-slate-200 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`text-2xl transition-transform ${h.active ? 'scale-110' : 'grayscale group-hover:grayscale-0'}`}>{h.icon}</span>
                  <span className="text-base tracking-tight">{h.name}</span>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${h.active ? 'bg-teal-500 text-white shadow-lg rotate-0' : 'bg-slate-200 dark:bg-slate-700 text-transparent rotate-90'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Reflections */}
        <div className="lg:col-span-7 space-y-8">
           <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 md:p-10 border border-slate-100 dark:border-slate-800 shadow-xl relative group">
             <div className="flex justify-between items-center mb-6 px-2">
                <div className="flex items-center gap-3">
                  <h4 className="font-black text-slate-900 dark:text-white text-lg tracking-tight">Tangible Successes</h4>
                  <SpeakButton text="Tangible Successes. What went well today? Record your micro-victories." size={12} />
                </div>
                <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">Glimmers</span>
             </div>
             <div className="relative">
              <textarea 
                value={successes} 
                onChange={(e) => setSuccesses(e.target.value)} 
                className={`w-full h-44 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-teal-500/30 rounded-[32px] p-8 text-slate-800 dark:text-slate-100 text-lg leading-relaxed resize-none shadow-inner transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 ${isListening === 'successes' ? 'ring-4 ring-rose-50 border-rose-400' : ''}`} 
                placeholder={isListening === 'successes' ? "I'm listening to your wins..." : "What went well today? Record your micro-victories."} 
              />
              <VoiceButton field="successes" />
             </div>
           </div>

           <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 md:p-10 border border-slate-100 dark:border-slate-800 shadow-xl relative group">
             <div className="flex justify-between items-center mb-6 px-2">
                <div className="flex items-center gap-3">
                  <h4 className="font-black text-slate-900 dark:text-white text-lg tracking-tight">Setbacks & Observations</h4>
                  <SpeakButton text="Setbacks and Observations. Any challenges or learnings? How will the True-Self handle this next time?" size={12} />
                </div>
                <span className="text-[9px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest bg-rose-50 dark:bg-rose-900/20 px-3 py-1 rounded-full border border-rose-100 dark:border-rose-800">Learning Data</span>
             </div>
             <div className="relative">
              <textarea 
                value={setbacks} 
                onChange={(e) => setSetbacks(e.target.value)} 
                className={`w-full h-44 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500/30 rounded-[32px] p-8 text-slate-800 dark:text-slate-100 text-lg leading-relaxed resize-none shadow-inner transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 ${isListening === 'setbacks' ? 'ring-4 ring-rose-50 border-rose-400' : ''}`} 
                placeholder={isListening === 'setbacks' ? "I'm listening to the challenge..." : "Any challenges or learnings? How will the True-Self handle this next time?"} 
              />
              <VoiceButton field="setbacks" />
             </div>
           </div>
        </div>
      </div>

      {/* Footer Reflection Invite */}
      <div className="bg-slate-900 dark:bg-slate-900 rounded-[60px] p-10 md:p-16 text-white relative overflow-hidden shadow-2xl border-b-[12px] border-slate-950 ring-1 ring-white/10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
           <div className="w-24 h-24 bg-white/10 rounded-[36px] flex items-center justify-center text-5xl shadow-inner backdrop-blur-md border border-white/10 shrink-0">📈</div>
           <div className="flex-grow space-y-4 text-center md:text-left">
             <h3 className="text-3xl font-black tracking-tight">Consistency is Protocol</h3>
             <p className="text-slate-400 text-xl font-medium leading-relaxed italic max-w-2xl">
               "By tracking your habits regularly, you gain insights into your behavior patterns and identify areas for improvement. This is your tool for creating lasting change."
             </p>
           </div>
           <button 
             onClick={handleFinish} 
             className="w-full md:w-auto px-12 py-6 bg-teal-600 text-white font-black rounded-3xl shadow-xl shadow-teal-600/30 hover:bg-teal-700 transition-all active:scale-95 whitespace-nowrap uppercase tracking-[0.2em] text-xs"
           >
             Seal Daily Record
           </button>
        </div>
      </div>
    </div>
  );
};

export default ProgressMonitoring;
