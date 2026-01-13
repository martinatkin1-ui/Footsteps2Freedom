
import React, { useState } from 'react';
import { getModuleReflection } from '../geminiService';
import ModuleReflection from './ModuleReflection';

interface MeaningMap {
  self: string;
  others: string;
  nature: string;
  greater: string;
}

interface SpiritualityModuleProps {
  onExit: () => void;
  onAskGuide?: () => void;
}

const SpiritualityModule: React.FC<SpiritualityModuleProps> = ({ onExit, onAskGuide }) => {
  const [view, setView] = useState<'intro' | 'map' | 'reflection'>('intro');
  const [map, setMap] = useState<MeaningMap>({ self: '', others: '', nature: '', greater: '' });
  const [isListening, setIsListening] = useState<keyof MeaningMap | null>(null);
  const [reflection, setReflection] = useState('');

  const toggleListening = (field: keyof MeaningMap) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening === field) {
      setIsListening(null);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-GB';
    recognition.onstart = () => setIsListening(field);
    recognition.onend = () => setIsListening(null);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setMap(prev => ({ ...prev, [field]: prev[field] ? `${prev[field]} ${transcript}` : transcript }));
    };
    recognition.start();
  };

  const handleFinish = async () => {
    const context = `User identified meaning in: Self (${map.self}), Others (${map.others}), Nature (${map.nature}), and a Greater Power/Purpose (${map.greater}).`;
    const res = await getModuleReflection("Spirituality & Meaning", context);
    setReflection(res);
    setView('reflection');
  };

  if (view === 'reflection') {
    return <ModuleReflection moduleName="Spirituality & Meaning" context="Spiritual reflection completed." reflection={reflection} onClose={onExit} title="Spiritual Reflection" />;
  }

  if (view === 'intro') {
    return (
      <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-700">
        <div className="bg-white dark:bg-slate-900 rounded-[48px] p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full -mr-40 -mt-40 blur-3xl opacity-60 animate-pulse" />
          
          <div className="relative z-10 space-y-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-indigo-600 rounded-[28px] flex items-center justify-center text-3xl text-white shadow-xl">✨</div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">The Search for Meaning</h2>
                  <p className="text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] mt-1">Spirituality in Recovery</p>
                </div>
              </div>
              {onAskGuide && (
                <button 
                  onClick={onAskGuide}
                  className="px-6 py-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800 shadow-sm transition-all hover:scale-105 active:scale-95 animate-pulse"
                >
                  Need Clarity? Ask Guide
                </button>
              )}
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed space-y-6">
              <p className="text-xl font-medium">
                Spirituality isn't necessarily about religion—though it can be. In recovery, it's about <strong>connection</strong>. Addiction isolates us; spirituality reunites us with the world.
              </p>
              <div className="bg-indigo-50/50 dark:bg-indigo-950/30 p-10 rounded-[40px] border border-indigo-100 dark:border-indigo-800 shadow-inner">
                <p className="text-indigo-900 dark:text-indigo-200 italic font-bold text-2xl leading-relaxed font-serif text-center">
                  "Spirituality is the recognition of a feeling or sense that there is something greater than myself... connecting the pieces of a fragmented soul back to the whole."
                </p>
              </div>
              <p className="text-lg">
                Whether you find "Higher Power" in a deity, the collective strength of your group, the vastness of the ocean, or the human capacity for love, this connection is a shield against hopelessness.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
              {[
                { label: 'Connection', desc: 'Ending the isolation of the "addicted self".', icon: '🔗' },
                { label: 'Purpose', desc: 'Finding a "why" that is stronger than the "urge".', icon: '🎯' },
                { label: 'Peace', desc: 'Accepting what we cannot change.', icon: '🕊️' }
              ].map((item, i) => (
                <div key={i} className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] border border-slate-100 dark:border-slate-800 text-center hover:shadow-lg transition-all group">
                  <span className="text-4xl block mb-4 group-hover:rotate-12 transition-transform">{item.icon}</span>
                  <h4 className="font-black text-slate-800 dark:text-white text-base mb-2">{item.label}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-bold italic">"{item.desc}"</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setView('map')}
              className="w-full py-6 bg-indigo-600 text-white font-black rounded-3xl shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-sm"
            >
              Begin Your Meaning Map
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const InputSection = ({ id, label, icon, placeholder }: { id: keyof MeaningMap, label: string, icon: string, placeholder: string }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
          <span className="text-xl grayscale group-focus-within:grayscale-0 transition-all">{icon}</span> {label}
        </label>
        <button
          onClick={() => toggleListening(id)}
          className={`p-3 rounded-xl transition-all shadow-md ${isListening === id ? 'bg-rose-500 text-white animate-pulse' : 'bg-indigo-50 dark:bg-slate-800 text-indigo-400 hover:text-indigo-600'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 006 0V5a3 3 0 00-3-3z" />
          </svg>
        </button>
      </div>
      <textarea
        value={map[id]}
        onChange={(e) => setMap({ ...map, [id]: e.target.value })}
        placeholder={placeholder}
        className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent dark:border-slate-800 focus:border-indigo-500/30 dark:focus:border-indigo-500/50 rounded-[32px] p-6 focus:ring-8 focus:ring-indigo-500/5 text-slate-800 dark:text-white text-base leading-relaxed resize-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 h-28 shadow-inner"
      />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-8 animate-in fade-in duration-500 pb-40 px-4">
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-[60px] p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-teal-500" />
            <div className="mb-12">
               <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">The Meaning Map</h3>
               <p className="text-slate-500 dark:text-slate-400 font-bold italic mt-1">"Charting your internal landscape of connection."</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              <InputSection 
                id="self" 
                label="Connection to Self" 
                icon="🧘" 
                placeholder="What strengths or values in yourself give you hope?" 
              />
              <InputSection 
                id="others" 
                label="Connection to Others" 
                icon="🤝" 
                placeholder="Who or what community anchors you?" 
              />
              <InputSection 
                id="nature" 
                label="Connection to Nature" 
                icon="🌿" 
                placeholder="How does the world around you provide peace?" 
              />
              <InputSection 
                id="greater" 
                label="A Greater Power" 
                icon="🌌" 
                placeholder="What force bigger than your addiction do you trust?" 
              />
            </div>

            <button
              onClick={handleFinish}
              disabled={!map.self && !map.others && !map.nature && !map.greater}
              className={`w-full mt-16 py-6 rounded-3xl font-black text-xs uppercase tracking-[0.4em] transition-all shadow-2xl active:scale-[0.98] ${
                map.self || map.others || map.nature || map.greater 
                  ? 'bg-indigo-600 text-white shadow-indigo-600/30 hover:bg-indigo-700' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
              }`}
            >
              Seal Map Architecture
            </button>
          </div>
        </div>

        <div className="w-full lg:w-96 space-y-6">
          <div className="bg-indigo-900 dark:bg-slate-950 rounded-[48px] p-10 text-white relative overflow-hidden shadow-2xl border-b-[12px] border-indigo-950 dark:border-slate-900 ring-1 ring-white/10">
            <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
            <div className="relative z-10 space-y-6">
              <div className="w-16 h-16 bg-white/10 rounded-[24px] flex items-center justify-center text-4xl shadow-inner backdrop-blur-md">📿</div>
              <div className="space-y-2">
                <h4 className="font-black text-xl tracking-tight uppercase italic">The Why</h4>
                <p className="text-indigo-100/80 dark:text-slate-400 text-sm leading-relaxed font-medium">
                  Addiction thrives on the belief that "this is all there is." Spirituality introduces <strong>Transcendence</strong>—the truth that you can rise above.
                </p>
              </div>
              <div className="pt-6 border-t border-white/10">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-2">Guide Wisdom</p>
                <p className="text-xs italic text-indigo-50 font-bold leading-relaxed">
                  Try "Act as if." If you don't believe in a power greater than yourself yet, just act as if one exists and notice if your internal weather shifts.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onExit}
            className="w-full py-5 text-slate-400 dark:text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] hover:text-rose-500 transition-colors"
          >
            Abort Protocol
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpiritualityModule;
