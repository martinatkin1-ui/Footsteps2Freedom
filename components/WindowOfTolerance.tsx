
import React, { useState } from 'react';
import ModuleReflection from './ModuleReflection';
import SpeakButton from './SpeakButton';

const ZONES = [
  {
    id: 'hyper',
    title: 'Hyperarousal',
    label: 'Fight or Flight',
    color: 'bg-rose-950/30 text-rose-200 border-rose-900/50',
    accent: 'bg-rose-500',
    icon: '🌩️',
    description: 'Anxious, angry, overwhelmed. Your nervous system is in overdrive, seeking a threat that may no longer be there.',
    strategies: ['Box Breathing', 'Splash cold water', 'Shaking limbs', 'Wall Push', 'Paced Exhale']
  },
  {
    id: 'optimal',
    title: 'Optimal Zone',
    label: 'Window of Tolerance',
    color: 'bg-teal-950/30 text-teal-200 border-teal-900/50',
    accent: 'bg-teal-500',
    icon: '🧘',
    description: 'Calm, focused, capable of handling challenges. You are present in your True-Self and able to process emotions effectively.',
    strategies: ['Stay present', 'Mindful observation', 'Gratitude practice', 'Values alignment', 'Compassionate Scan']
  },
  {
    id: 'hypo',
    title: 'Hypoarousal',
    label: 'Freeze or Shutdown',
    color: 'bg-slate-900 text-slate-200 border-slate-800',
    accent: 'bg-slate-600',
    icon: '🌫️',
    description: 'Numb, exhausted, disconnected. Your nervous system is shutting down to protect you from perceived overwhelming stress.',
    strategies: ['Strong scents', 'Walking outside', 'Mindful movement', 'Cold exposure', 'Social connection']
  }
];

interface WindowOfToleranceProps {
  onExit: (rating?: number, reflection?: string, artUrl?: string) => void;
  onAskGuide?: () => void;
}

const WindowOfTolerance: React.FC<WindowOfToleranceProps> = ({ onExit, onAskGuide }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<'selection' | 'commitment'>('selection');
  const [description, setDescription] = useState('');
  const [commitment, setCommitment] = useState('');
  const [isListening, setIsListening] = useState<'description' | 'commitment' | null>(null);
  const [showReflection, setShowReflection] = useState(false);

  const selectedZone = ZONES.find(z => z.id === selectedId);

  const toggleListening = (field: 'description' | 'commitment') => {
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
      if (field === 'description') setDescription(prev => prev ? `${prev} ${transcript}` : transcript);
      else setCommitment(prev => prev ? `${prev} ${transcript}` : transcript);
    };
    recognition.start();
  };

  const handleArchive = () => {
    setShowReflection(true);
  };

  if (showReflection) {
    return (
      <ModuleReflection 
        moduleName="Window of Tolerance"
        context={`User identified as being in ${selectedZone?.title}. They described their state as: "${description}". They committed to this regulation exercise: "${commitment}".`}
        onClose={onExit}
      />
    );
  }

  if (view === 'commitment' && selectedZone) {
    return (
      <div className="max-w-3xl mx-auto space-y-12 animate-in slide-in-from-right-8 duration-700 pb-32">
        <div className="bg-slate-950 rounded-[60px] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden border-b-[12px] border-slate-900 ring-1 ring-white/10">
          <div className={`absolute top-0 right-0 w-80 h-80 ${selectedZone.accent} opacity-5 rounded-full -mr-40 -mt-40 blur-[100px] pointer-events-none`} />
          
          <div className="relative z-10 space-y-12">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white/5 rounded-[28px] flex items-center justify-center text-5xl shadow-inner border border-white/10 animate-float">
                {selectedZone.icon}
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-teal-400 uppercase tracking-[0.4em]">Personal Anchor</span>
                <h3 className="text-3xl font-black tracking-tight">{selectedZone.title}</h3>
              </div>
            </div>

            <div className="space-y-12">
              {/* Step 1: Describe State */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h4 className="text-xl font-black text-slate-100 italic tracking-tight">"Where are you right now? Describe the sensations in your body."</h4>
                  <SpeakButton text="Describe where you are right now. What sensations or thoughts are anchoring you in this zone?" size={14} className="opacity-40" />
                </div>
                <div className="relative group">
                  <textarea 
                    autoFocus
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={isListening === 'description' ? "I am listening deeply..." : "e.g. My chest is tight and my mind is racing with 'what-ifs'..."}
                    className={`w-full h-32 bg-white/5 border-2 rounded-3xl p-6 text-slate-100 placeholder:text-slate-600 focus:ring-8 focus:ring-teal-500/10 transition-all resize-none shadow-inner ${isListening === 'description' ? 'border-rose-500' : 'border-white/10 focus:border-teal-500/30'}`}
                  />
                  <button onClick={() => toggleListening('description')} className={`absolute bottom-4 right-4 p-3 rounded-2xl transition-all ${isListening === 'description' ? 'bg-rose-500 animate-pulse' : 'bg-white/5 text-slate-500 hover:text-white'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 00-3-3z" /></svg>
                  </button>
                </div>
              </div>

              {/* Step 2: Commit to Exercise */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <h4 className="text-xl font-black text-slate-100 italic tracking-tight">"Which regulation protocol do you commit to trying right now?"</h4>
                  <SpeakButton text="Which regulation protocol do you commit to trying right now to help find your center?" size={14} className="opacity-40" />
                </div>
                <div className="flex flex-wrap gap-3 mb-4">
                  {selectedZone.strategies.map(s => (
                    <button 
                      key={s}
                      onClick={() => setCommitment(s)}
                      className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border-2 ${commitment === s ? 'bg-teal-600 border-teal-500 text-white shadow-xl scale-105' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-teal-500/30'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div className="relative group">
                  <input 
                    value={commitment}
                    onChange={(e) => setCommitment(e.target.value)}
                    placeholder={isListening === 'commitment' ? "Listening..." : "Or type a custom intention..."}
                    className={`w-full bg-white/5 border-2 rounded-[28px] px-8 py-5 text-slate-100 placeholder:text-slate-600 focus:ring-8 focus:ring-teal-500/10 transition-all shadow-inner ${isListening === 'commitment' ? 'border-rose-500' : 'border-white/10 focus:border-teal-500/30'}`}
                  />
                  <button onClick={() => toggleListening('commitment')} className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-2xl transition-all ${isListening === 'commitment' ? 'bg-rose-500 animate-pulse' : 'bg-white/5 text-slate-500 hover:text-white'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 00-3-3z" /></svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-8 flex flex-col gap-4">
              <button 
                onClick={handleArchive}
                disabled={!description.trim() || !commitment.trim() || !!isListening}
                className="w-full py-6 bg-teal-600 text-white font-black rounded-3xl shadow-xl hover:bg-teal-700 transition-all active:scale-[0.98] uppercase tracking-[0.3em] text-sm disabled:bg-slate-800 disabled:text-slate-600 disabled:shadow-none"
              >
                Seal Commitment & Reveal Landmark
              </button>
              <button onClick={() => setView('selection')} className="text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors">Abort & Return to Terrain Selection</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700 pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Vagal Terrain</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">"Locating your nervous system on the map is the first act of freedom."</p>
        </div>
        <div className="flex gap-3">
          {onAskGuide && (
            <button 
              onClick={onAskGuide}
              className="px-6 py-3 bg-slate-800 text-indigo-400 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-slate-700 shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              Consult Guide
            </button>
          )}
          <button onClick={() => onExit()} className="px-6 py-3 bg-slate-800 text-slate-400 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-slate-700 shadow-sm">Exit Tool</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 px-2">
        {ZONES.map((zone) => (
          <button 
            key={zone.id}
            onClick={() => setSelectedId(zone.id)}
            className={`p-10 rounded-[48px] border-2 text-left transition-all relative overflow-hidden group ${zone.id === 'hypo' ? 'bg-slate-950' : zone.color} ${selectedId === zone.id ? 'scale-[1.02] shadow-2xl ring-4 ring-indigo-500/20' : 'opacity-90 hover:opacity-100 hover:scale-[1.01]'}`}
          >
            <div className={`absolute top-0 right-0 w-48 h-48 ${zone.accent} opacity-5 rounded-full -mr-24 -mt-24 blur-3xl`} />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center text-5xl shadow-inner border-2 bg-slate-800/50 border-white/5 transition-transform group-hover:rotate-6`}>
                {zone.icon}
              </div>
              <div className="flex-grow space-y-4">
                <div>
                   <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-50 mb-1 block">{zone.label}</span>
                   <h3 className="text-3xl font-black tracking-tight leading-none">{zone.title}</h3>
                </div>
                <p className="text-lg leading-relaxed font-medium opacity-80">{zone.description}</p>
                
                {selectedId === zone.id && (
                  <div className="pt-8 border-t border-white/10 animate-in slide-in-from-top-4 duration-500 space-y-6">
                    <div>
                      <h4 className="font-black text-[10px] uppercase tracking-[0.4em] mb-4 opacity-50">Resilience Protocols</h4>
                      <div className="flex flex-wrap gap-2">
                        {zone.strategies.map((s, idx) => (
                          <span key={idx} className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-sm">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setView('commitment'); }}
                      className="w-full py-5 bg-teal-600 text-white font-black rounded-3xl shadow-xl hover:bg-teal-700 transition-all uppercase tracking-widest text-xs active:scale-95"
                    >
                      Commit to Observation & Reset
                    </button>
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-950 rounded-[48px] p-12 text-white text-center space-y-4 border-b-[12px] border-slate-900 ring-1 ring-white/5">
          <span className="text-5xl block mb-4 transform hover:scale-125 transition-transform duration-1000">🧬</span>
          <p className="text-slate-400 text-xl font-bold italic leading-relaxed max-w-3xl mx-auto font-serif">
            "Your Window of Tolerance is not a fixed boundary. Every time you consciously regulate yourself during a storm, you are biologically expanding your capacity to live as your True-Self."
          </p>
      </div>
    </div>
  );
};

export default WindowOfTolerance;
