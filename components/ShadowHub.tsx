
import React, { useState } from 'react';
import { getShadowArchetype, generateShadowArt } from '../geminiService';
import { ShadowArchetype } from '../types';
import ModuleReflection from './ModuleReflection';
import SpeakButton from './SpeakButton';

const ShadowHub: React.FC<{ onExit: (rating?: number, refl?: string, art?: string) => void }> = ({ onExit }) => {
  const [view, setView] = useState<'intro' | 'describe' | 'mirror' | 'integrate' | 'reflection'>('intro');
  const [description, setDescription] = useState('');
  const [archetype, setArchetype] = useState<ShadowArchetype | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [letter, setLetter] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleAnalyze = async () => {
    if (!description.trim()) return;
    setIsLoading(true);
    const result = await getShadowArchetype(description);
    if (result) {
      const art = await generateShadowArt(result.name);
      setArchetype({ ...result, artUrl: art || undefined });
      setView('mirror');
    }
    setIsLoading(false);
  };

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (isListening) { setIsListening(false); return; }
    const rec = new SpeechRecognition();
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      if (view === 'describe') setDescription(prev => prev ? `${prev} ${t}` : t);
      else if (view === 'integrate') setLetter(prev => prev ? `${prev} ${t}` : t);
    };
    rec.start();
  };

  if (view === 'intro') {
    const introText = "We do not become enlightened by imagining figures of light, but by making the darkness conscious. Your 'Using-Self' was not a villain, but a survivalist who got lost.";
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in duration-1000">
        <div className="bg-slate-950 rounded-[60px] p-10 md:p-20 text-center border-b-[12px] border-slate-900 shadow-2xl space-y-12 relative overflow-hidden ring-1 ring-white/10 group">
          <SpeakButton text={introText} size={24} className="absolute top-8 right-8 scale-125 opacity-40 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.05),transparent)] pointer-events-none" />
          <div className="w-32 h-32 bg-white/5 rounded-[40px] flex items-center justify-center text-7xl mx-auto shadow-2xl border border-white/10 animate-float">🌑</div>
          <div className="space-y-6">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic">The Shadow Lab</h2>
            <p className="text-slate-400 text-xl font-medium leading-relaxed italic max-w-2xl mx-auto font-serif">
              "{introText}"
            </p>
          </div>
          <button 
            onClick={() => setView('describe')}
            className="px-14 py-6 bg-amber-600 text-white font-black rounded-3xl shadow-xl hover:bg-amber-700 transition-all uppercase tracking-widest text-sm active:scale-95"
          >
            Enter the Depth
          </button>
        </div>
      </div>
    );
  }

  if (view === 'describe') {
    const describeText = "Describe the version of you that used substances or harmful loops. How did they act? What did they fear? What was their 'superpower' in the chaos?";
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 animate-in slide-in-from-bottom-8 duration-700">
        <div className="bg-slate-900 rounded-[50px] p-10 md:p-16 space-y-10 border border-white/5 shadow-2xl relative group">
          <SpeakButton text={describeText} size={14} className="absolute top-4 right-4 opacity-40 group-hover:opacity-100" />
          <div className="space-y-4">
             <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.5em]">The Confessional</span>
             <h3 className="text-3xl font-black text-white tracking-tight">Externalise the Burden</h3>
             <p className="text-slate-400 font-bold italic leading-relaxed">
               "{describeText}"
             </p>
          </div>
          <div className="relative">
             <textarea 
               value={description}
               onChange={(e) => setDescription(e.target.value)}
               placeholder={isListening ? "Listening deeply to your story..." : "Start describing the Using-Self..."}
               className={`w-full h-64 bg-black/40 border-2 rounded-[32px] p-8 text-white text-lg font-medium leading-relaxed italic resize-none transition-all shadow-inner ${isListening ? 'border-rose-500' : 'border-white/10 focus:border-amber-500/50'}`}
             />
             <button onClick={toggleListening} className={`absolute bottom-6 right-6 p-4 rounded-2xl transition-all ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-white/5 text-slate-500 hover:text-white'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 00-3-3z" /></svg>
             </button>
          </div>
          <button 
            onClick={handleAnalyze}
            disabled={!description.trim() || isLoading}
            className="w-full py-6 bg-amber-600 text-white font-black rounded-3xl shadow-xl hover:bg-amber-700 transition-all uppercase tracking-widest text-xs disabled:opacity-30"
          >
            {isLoading ? "Consulting the Void..." : "Request Mirror Analysis"}
          </button>
        </div>
      </div>
    );
  }

  if (view === 'mirror' && archetype) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 animate-in zoom-in-95 duration-700 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
           <div className="relative group">
              <div className="absolute inset-0 bg-amber-500/20 rounded-[60px] blur-3xl animate-pulse group-hover:scale-110 transition-transform duration-[3000ms]" />
              <div className="relative aspect-square rounded-[60px] overflow-hidden border-8 border-slate-900 shadow-2xl bg-black">
                 {archetype.artUrl ? (
                   <img src={archetype.artUrl} className="w-full h-full object-cover opacity-80" alt="Shadow Archetype" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-8xl">👤</div>
                 )}
                 <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-black to-transparent">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.6em]">Archetype Found</span>
                    <h4 className="text-4xl font-black text-white tracking-tighter">{archetype.name}</h4>
                 </div>
              </div>
           </div>
           
           <div className="space-y-8">
              <div className="bg-slate-900/80 p-8 rounded-[40px] border border-white/5 space-y-4 relative group/desc">
                 <SpeakButton text={archetype.description} size={14} className="absolute top-4 right-4 opacity-40 group-hover/desc:opacity-100" />
                 <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</h5>
                 <p className="text-lg text-slate-200 leading-relaxed font-medium italic">"{archetype.description}"</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="bg-rose-950/20 p-6 rounded-3xl border border-rose-900/30 relative group/int">
                    <SpeakButton text={archetype.originalIntent} size={10} className="absolute top-2 right-2 opacity-40 group-hover/int:opacity-100" />
                    <h5 className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-2">Original Intent</h5>
                    <p className="text-xs text-slate-300 font-bold">{archetype.originalIntent}</p>
                 </div>
                 <div className="bg-teal-950/20 p-6 rounded-3xl border border-teal-900/30 relative group/gift">
                    <SpeakButton text={archetype.integrationGift} size={10} className="absolute top-2 right-2 opacity-40 group-hover/gift:opacity-100" />
                    <h5 className="text-[9px] font-black text-teal-400 uppercase tracking-widest mb-2">Integration Gift</h5>
                    <p className="text-xs text-slate-300 font-bold">{archetype.integrationGift}</p>
                 </div>
              </div>
              <button 
                onClick={() => setView('integrate')}
                className="w-full py-6 bg-white text-slate-900 font-black rounded-3xl shadow-xl hover:bg-slate-100 transition-all uppercase tracking-widest text-xs"
              >
                Initiate Integration Dialogue
              </button>
           </div>
        </div>
      </div>
    );
  }

  if (view === 'integrate' && archetype) {
    const integrateText = `Write a letter to ${archetype.name}. Thank it for its protection, acknowledge its pain, and invite it to become part of your True-Self's strength.`;
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 animate-in fade-in duration-700 pb-32">
         <div className="bg-slate-950 rounded-[60px] p-10 md:p-16 border border-white/10 shadow-2xl space-y-12 relative group">
            <SpeakButton text={integrateText} size={14} className="absolute top-4 right-4 opacity-40 group-hover:opacity-100" />
            <div className="text-center space-y-4">
               <h3 className="text-3xl font-black text-white tracking-tight leading-none italic uppercase">Integration Protocol</h3>
               <p className="text-slate-500 font-bold leading-relaxed">
                 "{integrateText}"
               </p>
            </div>
            <div className="relative">
               <textarea 
                 value={letter}
                 onChange={(e) => setLetter(e.target.value)}
                 placeholder="Dearest..."
                 className={`w-full h-80 bg-white/5 border-none rounded-[40px] p-10 text-white text-xl font-medium leading-relaxed italic resize-none transition-all shadow-inner focus:ring-4 focus:ring-amber-500/10 ${isListening ? 'ring-rose-500 ring-4' : ''}`}
               />
               <button onClick={toggleListening} className={`absolute bottom-8 right-8 p-5 rounded-2xl shadow-xl transition-all ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-white/10 text-slate-400'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 00-3-3z" /></svg>
               </button>
            </div>
            <button 
              onClick={() => setView('reflection')}
              disabled={!letter.trim() || isListening}
              className="w-full py-6 bg-amber-600 text-white font-black rounded-3xl shadow-xl hover:bg-amber-700 transition-all active:scale-[0.98] uppercase tracking-widest text-sm"
            >
              Seal Integration & Reclaim Power
            </button>
         </div>
      </div>
    );
  }

  return (
    <ModuleReflection 
      moduleName="Shadow Integration"
      title="The Whole Self"
      context={`User confronted their shadow archetype '${archetype?.name}'. They identified its original intent to protect and successfully integrated its gift into their True-Self vision.`}
      onClose={(r, refl, art) => onExit(r, refl, archetype?.artUrl)}
    />
  );
};

export default ShadowHub;
