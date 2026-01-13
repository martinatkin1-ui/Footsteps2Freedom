
import React, { useState, useEffect } from 'react';
import ModuleReflection from './ModuleReflection';

const UrgeSurfing: React.FC<{ onExit: (rating?: number) => void, onAskGuide?: () => void }> = ({ onExit, onAskGuide }) => {
  const [timer, setTimer] = useState(600); // 10 minutes default
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'info' | 'active' | 'reflective' | 'reflection'>('info');
  const [narrative, setNarrative] = useState('');
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isActive && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0 && isActive) {
      setIsActive(false);
      setMode('reflective');
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
      setNarrative(prev => prev ? `${prev} ${transcript}` : transcript);
    };
    recognition.start();
  };

  const handleFinish = () => {
    setMode('reflection');
  };

  if (mode === 'reflection') {
    return (
      <ModuleReflection 
        moduleName="Urge Surfing" 
        context={`User successfully rode the wave. Their description of the "Peak" experience was: "${narrative}".`} 
        onClose={onExit} 
      />
    );
  }

  if (mode === 'info') {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 dark:bg-teal-900/10 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Master the Tide</h2>
              {onAskGuide && (
                <button 
                  onClick={onAskGuide}
                  className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800 shadow-sm transition-all hover:scale-105 active:scale-95"
                >
                  Need Clarity? Ask Guide
                </button>
              )}
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed mb-8 font-medium">
              <p className="text-lg italic">Urge surfing isn't about *fighting* a craving—it's about *observing* it. Like a wave, it has a beginning, a middle (peak), and an end. If you don't fight it, it can't knock you over.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <div className="p-6 bg-teal-50 dark:bg-teal-900/20 rounded-3xl border border-teal-100 dark:border-teal-800 shadow-inner">
                  <h4 className="font-black text-teal-800 dark:text-teal-400 text-[10px] uppercase tracking-[0.3em] mb-2">The Rule</h4>
                  <p className="text-xs leading-relaxed font-bold">Do not act. Just watch where the urge sits in your body (Chest? Throat? Hands?).</p>
                </div>
                <div className="p-6 bg-rose-50 dark:bg-rose-900/20 rounded-3xl border border-rose-100 dark:border-rose-800 shadow-inner">
                  <h4 className="font-black text-rose-800 dark:text-rose-400 text-[10px] uppercase tracking-[0.3em] mb-2">The Truth</h4>
                  <p className="text-xs leading-relaxed font-bold">No matter how intense, an urge peaks around 20 minutes and then *must* subside.</p>
                </div>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={() => setMode('active')} className="flex-[2] py-5 bg-teal-700 text-white font-black rounded-2xl shadow-xl shadow-teal-600/30 hover:bg-teal-800 transition-all uppercase tracking-widest text-xs active:scale-95">Start 10 Min Wave</button>
              <button onClick={() => onExit()} className="flex-1 py-5 text-slate-500 dark:text-slate-400 font-black rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all uppercase tracking-widest text-[10px]">Not Today</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'reflective') {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-6 duration-700">
        <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 md:p-12 border-4 border-teal-50 dark:border-teal-900/30 shadow-2xl space-y-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/5 rounded-full -mr-24 -mt-24 blur-3xl pointer-events-none" />
           <div className="text-center space-y-4 relative z-10">
             <div className="w-24 h-24 bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400 rounded-[32px] flex items-center justify-center text-5xl mx-auto shadow-inner border border-teal-100 dark:border-teal-800">🌊</div>
             <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">The Wave has Broken</h3>
             <p className="text-slate-600 dark:text-slate-400 font-bold italic">"You did it. Now, de-personalize the experience from your True-Self."</p>
           </div>
           <div className="space-y-4 relative z-10">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">Externalization Journal</label>
             <div className="relative group">
               <textarea 
                 value={narrative}
                 onChange={(e) => setNarrative(e.target.value)}
                 placeholder={isListening ? "Listening to your experience..." : "Describe the urge as a 'visitor.' Where did it sit? What was its 'voice'?"}
                 className={`w-full h-48 bg-slate-50 dark:bg-slate-800/50 border-2 rounded-[32px] p-8 focus:ring-8 transition-all font-bold text-slate-800 dark:text-white text-lg leading-relaxed shadow-inner resize-none ${isListening ? 'border-rose-400 ring-rose-500/10' : 'border-transparent focus:border-teal-500/30'}`}
               />
               <button
                  onClick={toggleListening}
                  className={`absolute bottom-6 right-6 p-4 rounded-2xl transition-all shadow-xl active:scale-90 ${
                    isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-teal-500/10'
                  }`}
                  title="Voice Input"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 006 0V5a3 3 0 00-3-3z" />
                  </svg>
                </button>
             </div>
           </div>
           <button 
             onClick={handleFinish}
             disabled={!narrative.trim() || isListening}
             className="w-full py-6 bg-teal-700 text-white font-black rounded-3xl shadow-xl shadow-teal-600/30 hover:bg-teal-800 transition-all active:scale-[0.98] uppercase tracking-widest text-sm disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 relative z-10"
           >
             Continue to Reflection
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-slate-900 text-white rounded-[60px] p-12 text-center shadow-2xl relative overflow-hidden border-b-[12px] border-slate-950 ring-1 ring-white/10">
        <div className={`absolute inset-0 bg-teal-500/10 transition-all duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>
        <div className="relative z-10 space-y-8">
          <h2 className="text-[10px] font-black opacity-60 uppercase tracking-[0.5em]">Surfing Awareness</h2>
          <div className="text-8xl font-black tabular-nums tracking-tighter py-8 drop-shadow-2xl">
            {formatTime(timer)}
          </div>
          <p className="text-teal-200 text-lg font-bold italic font-serif leading-relaxed px-4">
            "Notice the urge, but do not own it. It is just a sensation, like an itch or a temperature change. It is not your 'True-Self'."
          </p>
          <div className="flex flex-col gap-4 max-w-xs mx-auto">
            <button 
              onClick={() => setIsActive(!isActive)}
              className={`w-full py-6 rounded-[28px] font-black text-xl transition-all shadow-xl uppercase tracking-widest active:scale-95 ${isActive ? 'bg-slate-800 text-white border-2 border-white/10' : 'bg-teal-600 text-white shadow-teal-500/20 hover:bg-teal-700'}`}
            >
              {isActive ? 'Pause Ride' : 'Start Surfing'}
            </button>
            <button onClick={() => setMode('reflective')} className="text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors pt-2">I'm safe now (Skip to end)</button>
          </div>
        </div>
        <div className={`absolute bottom-0 left-0 right-0 h-2 bg-teal-500 shadow-[0_0_10px_#2dd4bf] transition-all duration-[600s] ease-linear`} style={{width: `${(timer/600)*100}%`}}></div>
      </div>
    </div>
  );
};

export default UrgeSurfing;
