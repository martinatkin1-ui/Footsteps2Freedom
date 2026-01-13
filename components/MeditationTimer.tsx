
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { getModuleReflection } from '../geminiService';
import ModuleReflection from './ModuleReflection';

interface MeditationTimerProps {
  onComplete: (rating?: number, reflection?: string, artUrl?: string) => void;
  onAskGuide?: () => void;
}

type AmbientSound = 'none' | 'rain' | 'ocean' | 'wind' | 'zen';

const WAITING_MESSAGES = [
  "Preparing your visual sanctuary...",
  "Setting the scene for your peace.",
  "Almost ready for your session."
];

const PRESET_PROMPTS = {
  rain: "Cinematic slow motion rain falling on a lush garden, soft bokeh, peaceful and calming.",
  ocean: "Cinematic gentle waves rolling on a sunset beach, soft sand, high resolution.",
  wind: "Cinematic golden wheat field swaying in a gentle breeze under a blue sky.",
  zen: "Abstract ethereal flowing light in teal and gold, meditative and slow, high resolution."
};

const MeditationTimer: React.FC<MeditationTimerProps> = ({ onComplete, onAskGuide }) => {
  const [duration, setDuration] = useState(5); // in minutes
  const [timeLeft, setTimeLeft] = useState(5 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [ambientSound, setAmbientSound] = useState<AmbientSound>('none');
  
  // Video Sanctuary States
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [videoStatus, setVideoStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [waitingIndex, setWaitingIndex] = useState(0);

  useEffect(() => {
    const checkKey = async () => {
      const selected = await (window as any).aistudio.hasSelectedApiKey();
      setHasKey(selected);
    };
    checkKey();
  }, []);

  const generateSanctuary = async () => {
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
      setHasKey(true);
    }
    
    setVideoStatus('generating');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = PRESET_PROMPTS[ambientSound as keyof typeof PRESET_PROMPTS] || "Abstract peaceful slow-moving soft teal and gold clouds, meditative, high resolution.";
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 8000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        setVideoUrl(URL.createObjectURL(blob));
        setVideoStatus('done');
      }
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("Requested entity was not found")) {
        setHasKey(false);
        await (window as any).aistudio.openSelectKey();
        setHasKey(true);
      }
      setVideoStatus('error');
    }
  };

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const stopAmbient = () => {
    activeNodesRef.current.forEach(node => {
      try {
        (node as any).stop?.();
        node.disconnect();
      } catch (e) {}
    });
    activeNodesRef.current = [];
    
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }
  };

  const startAmbient = (type: AmbientSound) => {
    stopAmbient();
    if (type === 'none') return;

    const ctx = initAudio();
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 2); // Fade in
    gain.connect(ctx.destination);
    gainNodeRef.current = gain;

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
        activeNodesRef.current.push(osc, detune, lfo);
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
        activeNodesRef.current.push(lfo);
      } else if (type === 'wind') {
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
        activeNodesRef.current.push(lfo);
      }
      noise.connect(filter);
      filter.connect(gain);
      noise.start();
      activeNodesRef.current.push(noise);
    }
  };

  const playBell = () => {
    const ctx = initAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 3);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 3);
  };

  const timerRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeNodesRef = useRef<AudioNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      if (ambientSound !== 'none' && activeNodesRef.current.length === 0) {
        startAmbient(ambientSound);
      }
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      stopAmbient();
      if (timeLeft === 0 && isActive) {
        setIsActive(false);
        setIsFinished(true);
        playBell();
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopAmbient();
    };
  }, [isActive, timeLeft, ambientSound]);

  const toggleTimer = () => {
    initAudio();
    if (!isActive && timeLeft === duration * 60) playBell();
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsFinished(false);
    setTimeLeft(duration * 60);
    stopAmbient();
  };

  const changeDuration = (mins: number) => {
    setDuration(mins);
    setTimeLeft(mins * 60);
    setIsActive(false);
    setIsFinished(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleFinish = () => {
    setShowReflection(true);
  };

  if (showReflection) {
    return (
      <ModuleReflection 
        moduleName="Meditation Timer" 
        context={`User completed a ${duration} minute mindfulness session.`} 
        onClose={(r, refl, art) => onComplete(r, refl, art)} 
      />
    );
  }

  const sounds: { id: AmbientSound; icon: string; label: string }[] = [
    { id: 'none', icon: '🔇', label: 'Silent' },
    { id: 'zen', icon: '🎵', label: 'Music' },
    { id: 'rain', icon: '🌧️', label: 'Rain' },
    { id: 'ocean', icon: '🌊', label: 'Ocean' },
    { id: 'wind', icon: '🍃', label: 'Wind' },
  ];

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 animate-in fade-in duration-700">
      <div className={`rounded-[40px] border shadow-xl text-center relative overflow-hidden transition-all duration-1000 ${videoUrl ? 'bg-black border-white/10 min-h-[500px]' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-10'}`}>
        
        {/* Background Video */}
        {videoUrl && (
          <video 
            src={videoUrl} 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover opacity-60 z-0"
          />
        )}

        <div className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none z-1 ${isActive ? (videoUrl ? 'bg-black/20' : 'bg-teal-50 dark:bg-teal-900/10 opacity-100') : 'opacity-0'}`}></div>
        
        <div className={`relative z-10 space-y-8 ${videoUrl ? 'p-10 backdrop-blur-[2px] h-full flex flex-col justify-center' : ''}`}>
          <div className="flex flex-col items-center gap-2">
            <h2 className={`text-3xl font-black ${videoUrl ? 'text-white drop-shadow-md' : 'text-slate-800 dark:text-white tracking-tight'}`}>Mindful Moment</h2>
            {onAskGuide && (
              <button 
                onClick={onAskGuide}
                className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800 shadow-sm transition-all hover:scale-105 active:scale-95 animate-pulse"
              >
                Need Clarity? Ask Guide
              </button>
            )}
            <p className={`${videoUrl ? 'text-teal-50 drop-shadow-sm' : 'text-slate-500 dark:text-slate-400'} text-sm font-medium`}>Find a comfortable position and close your eyes.</p>
          </div>

          <div className="flex justify-center items-center py-6">
            <div className={`relative flex items-center justify-center w-64 h-64 rounded-full border-4 transition-all duration-1000 ${videoUrl ? 'border-white/20 glass' : 'border-slate-100 dark:border-slate-800'} ${isActive ? 'scale-105 border-teal-500' : ''}`}>
              <div className={`text-6xl font-black tabular-nums ${videoUrl ? 'text-white' : 'text-slate-800 dark:text-white tracking-tighter'}`}>
                {formatTime(timeLeft)}
              </div>
              {isActive && (
                <div className="absolute inset-0 rounded-full border-4 border-teal-500/20 animate-ping"></div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ${videoUrl ? 'text-teal-200' : 'text-slate-400 dark:text-slate-500'}`}>Atmosphere</h3>
              <div className="flex flex-wrap justify-center gap-3">
                <div className={`flex bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 ${videoUrl ? 'bg-white/10 backdrop-blur-md border-white/10' : ''}`}>
                  {sounds.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setAmbientSound(s.id)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        ambientSound === s.id 
                          ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm scale-105' 
                          : `${videoUrl ? 'text-white/60 hover:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`
                      }`}
                    >
                      {s.icon} {s.label}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={generateSanctuary}
                  disabled={videoStatus === 'generating'}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
                    videoStatus === 'generating' 
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600' 
                      : videoUrl 
                        ? 'bg-emerald-600 text-white shadow-lg' 
                        : 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 hover:scale-105'
                  }`}
                >
                  {videoStatus === 'generating' ? (
                    <>
                      <span className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                      Generating...
                    </>
                  ) : videoUrl ? '✨ Sanctuary Active' : '🎬 Add Visual Sanctuary'}
                </button>
              </div>
              {videoStatus === 'generating' && (
                <p className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 animate-pulse uppercase tracking-widest">
                  {WAITING_MESSAGES[waitingIndex]}
                </p>
              )}
            </div>

            {!isActive && !isFinished && (
              <div className="space-y-4">
                <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ${videoUrl ? 'text-teal-200' : 'text-slate-400 dark:text-slate-500'}`}>Duration</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {[1, 5, 10, 15, 20].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => changeDuration(mins)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${
                        duration === mins 
                          ? 'bg-teal-600 border-teal-600 text-white shadow-lg scale-105' 
                          : `${videoUrl ? 'bg-white/10 border-white/5 text-white/80' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-teal-500/30'}`
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4 max-w-sm mx-auto">
              {!isFinished ? (
                <>
                  <button
                    onClick={toggleTimer}
                    className={`flex-1 py-6 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-2xl transition-all active:scale-95 ${
                      isActive 
                        ? 'bg-slate-800 dark:bg-slate-950 text-white border-2 border-white/10' 
                        : 'bg-teal-600 text-white shadow-teal-600/30 hover:bg-teal-700'
                    }`}
                  >
                    {isActive ? 'Pause Ride' : 'Start Session'}
                  </button>
                  {(isActive || timeLeft < duration * 60) && (
                    <button
                      onClick={resetTimer}
                      className={`p-6 rounded-[24px] transition-all flex items-center justify-center border-2 ${videoUrl ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-teal-600'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  )}
                </>
              ) : (
                <div className="w-full space-y-4">
                  <p className={`font-black uppercase text-[10px] tracking-widest ${videoUrl ? 'text-white' : 'text-teal-600 dark:text-teal-400'}`}>Session Complete. Gently come back.</p>
                  <button
                    onClick={handleFinish}
                    className="w-full py-6 bg-teal-600 text-white font-black rounded-3xl shadow-xl shadow-teal-600/30 hover:bg-teal-700 transition-all active:scale-95 uppercase tracking-widest text-xs"
                  >
                    Integrate Reflection
                  </button>
                </div>
              )}
            </div>
            
            <button
              onClick={() => onComplete()}
              className={`text-[9px] font-black uppercase tracking-[0.3em] transition-colors py-4 ${videoUrl ? 'text-white/40 hover:text-white' : 'text-slate-400 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400'}`}
            >
              Terminate Tool
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeditationTimer;
