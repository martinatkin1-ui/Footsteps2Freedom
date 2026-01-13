import React, { useState, useEffect, useRef, useMemo } from 'react';
import { getModuleReflection } from '../geminiService';
import ModuleReflection from './ModuleReflection';
import SpeakButton from './SpeakButton';
import { triggerHaptic } from '../haptics';

type BreathingType = 'box' | 'relax' | 'calm' | 'coherence';
type AmbientSound = 'none' | 'rain' | 'ocean' | 'forest' | 'zen';

interface BreathingExerciseProps {
  onExit: (rating?: number, reflection?: string, artUrl?: string) => void;
  onAskGuide?: () => void;
}

const CONFIG = {
  box: {
    title: 'Box Breathing',
    science: 'Used by elite performers to stabilise the autonomic nervous system. It balances the sympathetic (fight-or-flight) and parasympathetic (rest-and-digest) branches.',
    description: 'Inhale 4, Hold 4, Exhale 4, Hold 4. Tactical grounding.',
    steps: [
      { action: 'Inhale', duration: 4, instruction: 'Fill your lungs slowly' },
      { action: 'Hold', duration: 4, instruction: 'Suspend the breath' },
      { action: 'Exhale', duration: 4, instruction: 'Release all tension' },
      { action: 'Hold', duration: 4, instruction: 'Rest in the empty space' },
    ]
  },
  relax: {
    title: '4-7-8 Relaxing Breath',
    science: 'A natural tranquiliser for the nervous system. By making the exhale twice as long as the inhale, we force the heart rate to slow down biologically.',
    description: 'Inhale 4, Hold 7, Exhale 8. Deep tranquilisation.',
    steps: [
      { action: 'Inhale', duration: 4, instruction: 'Breathe in through your nose' },
      { action: 'Hold', duration: 7, instruction: 'Let the oxygen circulate' },
      { action: 'Exhale', duration: 8, instruction: 'Sigh it out slowly' },
    ]
  },
  calm: {
    title: '4-6 Calming Breath',
    science: 'Focused on the vagus nerve. Extended exhales signal "safety" directly to the brain stem, bypassing anxious thoughts.',
    description: 'Focus on the long exhale. Inhale 4, Exhale 6.',
    steps: [
      { action: 'Inhale', duration: 4, instruction: 'Gentle intake' },
      { action: 'Exhale', duration: 6, instruction: 'Slow, steady release' },
    ]
  },
  coherence: {
    title: '5-5 Coherence Breath',
    science: 'Aligns the heart rhythm with the breath. This coherence state reduces cortisol and creates emotional stability.',
    description: 'Balanced 5s Inhale and 5s Exhale.',
    steps: [
      { action: 'Inhale', duration: 5, instruction: 'Steady rise' },
      { action: 'Exhale', duration: 5, instruction: 'Steady fall' },
    ]
  }
};

const SOUNDS: { id: AmbientSound; icon: string; label: string }[] = [
  { id: 'none', icon: '🔇', label: 'Silent' },
  { id: 'zen', icon: '🎵', label: 'Zen' },
  { id: 'rain', icon: '🌧️', label: 'Rain' },
  { id: 'ocean', icon: '🌊', label: 'Ocean' },
  { id: 'forest', icon: '🌲', label: 'Forest' },
];

const BreathingExercise: React.FC<BreathingExerciseProps> = ({ onExit, onAskGuide }) => {
  const [view, setView] = useState<'selection' | 'intro' | 'active' | 'assessment-before' | 'assessment-after'>('selection');
  const [selectedType, setSelectedType] = useState<BreathingType | null>(null);
  const [ambientSound, setAmbientSound] = useState<AmbientSound>('none');
  const [stepIndex, setStepIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [showReflection, setShowReflection] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Post-assessment states
  const [feltBefore, setFeltBefore] = useState('');
  const [feltNow, setFeltNow] = useState('');
  const [isListening, setIsListening] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientNodesRef = useRef<AudioNode[]>([]);
  const ambientGainRef = useRef<GainNode | null>(null);
  const timerRef = useRef<any>(null);

  const config = selectedType ? CONFIG[selectedType] : null;

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  const stopAmbient = () => {
    ambientNodesRef.current.forEach(node => {
      try {
        (node as any).stop?.();
        node.disconnect();
      } catch (e) {}
    });
    ambientNodesRef.current = [];
    if (ambientGainRef.current) {
      ambientGainRef.current.disconnect();
      ambientGainRef.current = null;
    }
  };

  const startAmbient = (type: AmbientSound) => {
    stopAmbient();
    if (type === 'none') return;

    const ctx = initAudio();
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 2);
    gain.connect(ctx.destination);
    ambientGainRef.current = gain;

    if (type === 'zen') {
      const frequencies = [110, 164.81, 220, 329.63, 440, 659.25];
      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const oGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        const detune = ctx.createOscillator();
        const detuneGain = ctx.createGain();
        detune.frequency.setValueAtTime(0.1 + i * 0.02, ctx.currentTime);
        detuneGain.gain.setValueAtTime(2, ctx.currentTime);
        detune.connect(detuneGain);
        detuneGain.connect(osc.detune);
        detune.start();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.05 + i * 0.01, ctx.currentTime);
        lfoGain.gain.setValueAtTime(0.01, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(oGain.gain);
        lfo.start();
        oGain.gain.setValueAtTime(0.02 / frequencies.length, ctx.currentTime);
        osc.connect(oGain);
        oGain.connect(gain);
        osc.start();
        ambientNodesRef.current.push(osc, detune, lfo);
      });
    } else {
      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const filter = ctx.createBiquadFilter();
      if (type === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);
      } else if (type === 'ocean') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, ctx.currentTime);
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.12, ctx.currentTime);
        lfoGain.gain.setValueAtTime(0.06, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);
        lfo.start();
        ambientNodesRef.current.push(lfo);
      } else if (type === 'forest') {
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(600, ctx.currentTime);
        filter.Q.setValueAtTime(2, ctx.currentTime);
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.07, ctx.currentTime);
        lfoGain.gain.setValueAtTime(300, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();
        ambientNodesRef.current.push(lfo);
      }
      noise.connect(filter);
      filter.connect(gain);
      noise.start();
      ambientNodesRef.current.push(noise);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopAmbient();
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  useEffect(() => {
    if (isActive && config) {
      const currentAction = config.steps[stepIndex].action;
      if (currentAction === 'Inhale' || currentAction === 'Exhale') {
        triggerHaptic('CALM');
      } else if (currentAction === 'Hold') {
        triggerHaptic('TAP');
      }
    }
  }, [stepIndex, isActive, config]);

  useEffect(() => {
    if (isActive && config) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0.1) {
            const nextIdx = (stepIndex + 1) % config.steps.length;
            if (nextIdx === 0) setCycles(c => c + 1);
            setStepIndex(nextIdx);
            return config.steps[nextIdx].duration;
          }
          return Math.max(0, prev - 0.1);
        });
      }, 100);

      if (ambientSound !== 'none' && ambientNodesRef.current.length === 0) {
        startAmbient(ambientSound);
      }
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      stopAmbient();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, stepIndex, config, ambientSound]);

  const handleSelect = (type: BreathingType) => {
    setSelectedType(type);
    setView('intro');
  };

  const handleStart = () => {
    if (!selectedType) return;
    initAudio();
    setStepIndex(0);
    setTimeLeft(CONFIG[selectedType].steps[0].duration);
    setCycles(0);
    setIsActive(true);
    setView('active');
  };

  const handleFinish = () => {
    setIsActive(false);
    setView('assessment-before');
  };

  const toggleListening = (field: 'before' | 'after') => {
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
      if (field === 'before') setFeltBefore(prev => prev ? `${prev} ${transcript}` : transcript);
      else setFeltNow(prev => prev ? `${prev} ${transcript}` : transcript);
    };
    recognition.start();
  };

  if (showReflection && config) {
    return (
      <ModuleReflection 
        moduleName={config.title} 
        context={`User completed ${cycles} cycles of ${config.title}. 
        Initial state: "${feltBefore}". 
        Current state: "${feltNow}".`} 
        onClose={(r, refl, art) => onExit(r, refl, art)} 
      />
    );
  }

  if (view === 'selection') {
    return (
      <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-700 pb-24">
        <div className="text-center mb-12 space-y-4">
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">Breathing Sanctuary</h2>
            <div className="flex items-center gap-2">
              <SpeakButton text="Breathing Sanctuary. Bio-physical tools to override the stress response. Choose a rhythm that resonates with your current state." />
              {onAskGuide && (
                <button 
                  onClick={onAskGuide}
                  className="mt-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800 shadow-sm transition-all hover:scale-105 active:scale-95 animate-pulse"
                >
                  Need Clarity? Ask Guide
                </button>
              )}
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">Bio-physical tools to override the stress response.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
          {(Object.entries(CONFIG) as [BreathingType, typeof CONFIG['box']][]).map(([type, c]) => (
            <button
              key={type}
              onClick={() => handleSelect(type)}
              className="bg-white dark:bg-slate-900 rounded-[48px] p-10 border-2 border-slate-100 dark:border-slate-800 text-left hover:shadow-2xl hover:border-teal-500/50 transition-all group relative overflow-hidden"
              aria-label={`Select ${c.title}`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 dark:bg-teal-900/10 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
              <div className="relative z-10 space-y-6">
                <div className="w-16 h-16 bg-teal-50 dark:bg-teal-900/30 text-teal-600 rounded-3xl flex items-center justify-center text-3xl shadow-inner group-hover:rotate-6 transition-transform" aria-hidden="true">🌬️</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">{c.title}</h3>
                    <SpeakButton text={c.description} size={10} className="opacity-0 group-hover:opacity-100" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">{c.description}</p>
                </div>
                <div className="flex items-center gap-3 text-teal-600 font-black text-xs uppercase tracking-widest pt-4">
                  Select Rhythm <span className="group-hover:translate-x-2 transition-transform" aria-hidden="true">→</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'intro' && config) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-in zoom-in-95 duration-500">
        <div className="bg-white dark:bg-slate-900 rounded-[50px] p-10 md:p-16 border-4 border-teal-50 dark:border-teal-900/30 shadow-2xl text-center space-y-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-2 bg-gradient-to-r from-teal-500 to-indigo-500"></div>
          
          <div className="space-y-4">
            <div className="w-20 h-20 bg-teal-100 dark:bg-teal-900/50 text-teal-600 rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-inner">
               💡
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">{config.title}</h2>
            <p className="text-teal-600 dark:text-teal-400 font-black uppercase text-[10px] tracking-[0.4em]">The Science of Breath</p>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Select Atmosphere</h4>
            <div className="flex flex-wrap justify-center gap-2">
              {SOUNDS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setAmbientSound(s.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${
                    ambientSound === s.id 
                      ? 'bg-teal-600 border-teal-600 text-white shadow-md scale-105' 
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:border-teal-300'
                  }`}
                  aria-pressed={ambientSound === s.id}
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-inner group/sci">
             <SpeakButton text={config.science} size={14} className="opacity-0 group-hover/sci:opacity-100 mb-4" />
             <p className="text-slate-700 dark:text-slate-300 text-lg font-medium leading-relaxed italic">
               "{config.science}"
             </p>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={handleStart}
              className="w-full py-6 bg-teal-600 text-white font-black rounded-3xl shadow-xl shadow-teal-600/30 hover:bg-teal-700 transition-all hover:scale-105 active:scale-95 uppercase tracking-[0.2em] text-sm"
            >
              Enter Sanctuary
            </button>
            <button onClick={() => setView('selection')} className="text-slate-400 font-bold text-xs hover:underline mt-2">Go Back</button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'assessment-before') {
    const question = "Gently recall: How were you feeling just before you entered this sanctuary?";
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-in slide-in-from-right-10 duration-700">
        <div className="bg-white dark:bg-slate-900 rounded-[50px] p-10 md:p-14 shadow-2xl space-y-10 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-64 h-64 bg-slate-100 dark:bg-slate-800 rounded-full -ml-32 -mt-32 opacity-30 blur-3xl pointer-events-none" />
           
           <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Initial Check-in</h3>
                <SpeakButton text={question} size={14} />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-bold italic text-lg leading-relaxed">
                "{question}"
              </p>
           </div>

           <div className="relative group">
              <textarea 
               value={feltBefore}
               onChange={(e) => setFeltBefore(e.target.value)}
               placeholder={isListening ? "Listening..." : "Describe your baseline state..."}
               className={`w-full h-40 bg-slate-50 dark:bg-slate-950 border-2 rounded-3xl p-8 text-lg font-bold shadow-inner resize-none focus:ring-8 focus:ring-teal-500/10 outline-none transition-all dark:text-white ${isListening ? 'border-rose-400' : 'border-slate-100 dark:border-slate-800'}`}
              />
              <button onClick={() => toggleListening('before')} className={`absolute bottom-4 right-4 p-4 rounded-2xl transition-all shadow-xl ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-white dark:bg-slate-800 text-slate-400'}`}>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 006 0V5a3 3 0 00-3-3z" /></svg>
              </button>
           </div>

           <button 
             onClick={() => setView('assessment-after')}
             disabled={!feltBefore.trim() || isListening}
             className="w-full py-6 bg-teal-600 text-white font-black rounded-3xl shadow-xl hover:bg-teal-700 disabled:opacity-30 transition-all uppercase tracking-widest text-sm"
           >
             Continue to Current State
           </button>
        </div>
      </div>
    );
  }

  if (view === 'assessment-after') {
    const question = "Notice the shift: How does your True-Self feel in this exact moment?";
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-in slide-in-from-right-10 duration-700">
        <div className="bg-white dark:bg-slate-900 rounded-[50px] p-10 md:p-14 shadow-2xl space-y-10 relative overflow-hidden border-4 border-teal-500/20">
           <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl pointer-events-none" />
           
           <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Post-Vagal Assessment</h3>
                <SpeakButton text={question} size={14} />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-bold italic text-lg leading-relaxed">
                "{question}"
              </p>
           </div>

           <div className="relative group">
              <textarea 
               value={feltNow}
               onChange={(e) => setFeltNow(e.target.value)}
               placeholder={isListening ? "Listening..." : "Describe your current presence..."}
               className={`w-full h-40 bg-slate-50 dark:bg-slate-950 border-2 rounded-3xl p-8 text-lg font-bold shadow-inner resize-none focus:ring-8 focus:ring-teal-500/10 outline-none transition-all dark:text-white ${isListening ? 'border-rose-400' : 'border-slate-100 dark:border-slate-800'}`}
              />
              <button onClick={() => toggleListening('after')} className={`absolute bottom-4 right-4 p-4 rounded-2xl transition-all shadow-xl ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-white dark:bg-slate-800 text-slate-400'}`}>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 006 0V5a3 3 0 00-3-3z" /></svg>
              </button>
           </div>

           <div className="flex flex-col gap-4">
             <button 
               onClick={() => setShowReflection(true)}
               disabled={!feltNow.trim() || isListening}
               className="w-full py-6 bg-teal-600 text-white font-black rounded-3xl shadow-xl hover:bg-teal-700 disabled:opacity-30 transition-all uppercase tracking-widest text-sm"
             >
               Finalise Reflection & Rate
             </button>
             <button onClick={() => setView('assessment-before')} className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-teal-600">Previous Reflection</button>
           </div>
        </div>
      </div>
    );
  }

  const currentStep = config!.steps[stepIndex];
  const progress = (1 - (timeLeft / currentStep.duration)) * 100;
  
  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-colors duration-[2000ms] ${
      isFocusMode ? 'bg-black' : 'bg-slate-50 dark:bg-slate-950'
    }`} role="main" aria-label="Breathing session in progress">
      {/* Immersive Background Elements */}
      {!isFocusMode && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20" aria-hidden="true">
          <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[100px] transition-colors duration-[3000ms] ${
            currentStep.action === 'Inhale' ? 'bg-teal-500 scale-150' : currentStep.action === 'Exhale' ? 'bg-sky-500 scale-75' : 'bg-indigo-500 scale-110'
          }`} />
          <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[100px] transition-colors duration-[3000ms] delay-500 ${
            currentStep.action === 'Inhale' ? 'bg-emerald-500 scale-150' : currentStep.action === 'Exhale' ? 'bg-blue-500 scale-75' : 'bg-purple-500 scale-110'
          }`} />
        </div>
      )}

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-lg px-6 flex flex-col items-center text-center">
        
        {/* Step Indicator Header */}
        {!isFocusMode && (
          <div className="mb-12 space-y-2 animate-in fade-in duration-1000">
             <h2 className="text-teal-600 dark:text-teal-400 font-black uppercase tracking-[0.4em] text-[10px]">{config!.title}</h2>
             <div className="flex items-center justify-center gap-2">
               <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Cycle {cycles + 1}</p>
               {ambientSound !== 'none' && (
                 <span className="text-teal-500 text-[10px]">✨ {SOUNDS.find(s => s.id === ambientSound)?.label}</span>
               )}
             </div>
          </div>
        )}

        {/* The Animated Breathing Orb */}
        <div className="relative flex items-center justify-center w-80 h-80 md:w-96 md:h-96 mb-16">
          
          {/* Fluid Orb SVG */}
          <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full drop-shadow-2xl" aria-hidden="true">
            <defs>
              <filter id="goo">
                <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
              </filter>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#2dd4bf', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#0891b2', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <g filter="url(#goo)">
              <circle 
                cx="100" cy="100" 
                r={currentStep.action === 'Inhale' ? 70 : currentStep.action === 'Exhale' ? 40 : 60} 
                className="transition-all ease-in-out"
                style={{ 
                  fill: 'url(#grad)',
                  transitionDuration: `${currentStep.duration}s`,
                  transformOrigin: 'center'
                }} 
              />
              <circle 
                cx="100" cy="100" 
                r={currentStep.action === 'Inhale' ? 75 : currentStep.action === 'Exhale' ? 35 : 65} 
                className="transition-all ease-in-out opacity-40"
                style={{ 
                  fill: 'white',
                  transitionDuration: `${currentStep.duration}s`,
                  transformOrigin: 'center',
                  scale: isActive ? '1.05' : '1'
                }} 
              />
            </g>
          </svg>

          {/* Text Center */}
          <div className="relative z-20 flex flex-col items-center">
            <span className={`text-3xl md:text-4xl font-black uppercase tracking-[0.3em] transition-all duration-700 ${
              isFocusMode ? 'text-white/80' : 'text-slate-800 dark:text-white'
            }`}>
              {currentStep.action}
            </span>
            <div className={`mt-4 font-black tabular-nums transition-all ${
              isFocusMode ? 'text-white text-5xl' : 'text-slate-900 dark:text-teal-400 text-6xl'
            }`} aria-live="polite">
              {Math.ceil(timeLeft)}
            </div>
          </div>

          {/* Progress Circular Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" aria-hidden="true">
             <circle 
              cx="50%" cy="50%" r="48%" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              className="text-slate-200 dark:text-slate-800" 
              opacity={isFocusMode ? 0.1 : 0.2}
             />
             <circle 
              cx="50%" cy="50%" r="48%" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="4" 
              strokeDasharray="100 100"
              strokeDashoffset={100 - progress}
              className="text-teal-500 transition-all duration-100 ease-linear"
              pathLength="100"
             />
          </svg>
        </div>

        {/* Phase Instruction Text */}
        <div className="min-h-[60px] mb-12">
           <div className="flex flex-col items-center gap-2">
             <p className={`text-xl md:text-2xl font-bold transition-opacity duration-1000 ${
               isFocusMode ? 'text-white/40' : 'text-slate-600 dark:text-slate-300'
             }`}>
               "{currentStep.instruction}"
             </p>
             <SpeakButton text={currentStep.instruction} size={12} className="opacity-40" />
           </div>
        </div>

        {/* Dynamic Controls */}
        <div className="w-full flex flex-col gap-6">
           <div className="flex gap-4">
              <button
                onClick={() => setIsActive(!isActive)}
                className={`flex-1 py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95 ${
                  isActive 
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' 
                    : 'bg-teal-600 text-white shadow-teal-600/40 hover:bg-teal-700'
                }`}
              >
                {isActive ? 'Pause Sanctuary' : 'Resume Flow'}
              </button>
              
              {cycles > 0 && (
                <button
                  onClick={handleFinish}
                  className="px-8 py-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-slate-50 transition-all text-slate-800 dark:text-white"
                >
                  Finish
                </button>
              )}
           </div>

           <div className="flex justify-between items-center px-2">
              <button 
                onClick={() => setIsFocusMode(!isFocusMode)}
                className={`text-[10px] font-black uppercase tracking-widest transition-all ${
                  isFocusMode ? 'text-white/30 hover:text-white' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {isFocusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
              </button>
              <button 
                onClick={() => {
                  setIsActive(false);
                  setView('selection');
                }}
                className={`text-[10px] font-black uppercase tracking-widest transition-all ${
                  isFocusMode ? 'text-white/30 hover:text-rose-400' : 'text-slate-400 hover:text-rose-600'
                }`}
              >
                Exit Session
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default BreathingExercise;