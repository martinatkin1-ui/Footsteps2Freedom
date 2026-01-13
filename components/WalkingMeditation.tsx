import React, { useState, useEffect, useRef, useMemo } from 'react';
import { generateSpeech, playSpeech, stopAllSpeech } from '../geminiService';
import { useRecoveryStore } from '../store';
import { triggerHaptic } from '../haptics';

interface MeditationSegment {
  id: string;
  text: string;
  pauseAfter: number; // seconds
}

const MEDITATION_SEGMENTS: MeditationSegment[] = [
  {
    id: 'intro',
    text: "Welcome to your Walking Sanctuary. As you take your first steps, feel the transition from stillness to motion. This is a seven-minute transit for your True-Self. Adjust your pace to a comfortable, steady rhythm. Focus on the simple act of moving forward.",
    pauseAfter: 40
  },
  {
    id: 'breathing',
    text: "Shift your awareness to your breath. Inhale clarity for four seconds... hold for two... and exhale the old patterns for six seconds. Let your breath synchronize with the rhythm of your stride. Use this time to establish biological stability.",
    pauseAfter: 50
  },
  {
    id: 'feet',
    text: "Now, bring your focus to the soles of your feet. Feel the contact with the earth. Heel... to toe. Heel... to toe. Each step is a deliberate choice for freedom. You are architecting a new identity with every pace you take. Walk as the person you are becoming.",
    pauseAfter: 50
  },
  {
    id: 'senses',
    text: "Look around your environment. Identify one colour you find soothing. Follow it with your eyes. Notice the textures, the light, and the space around you. These are the physical facts of your safety. You are part of a larger, living connection.",
    pauseAfter: 50
  },
  {
    id: 'urges',
    text: "If a craving or a heavy thought enters your mind, do not fight it. Simply notice it, as if it were a leaf floating down a stream. You are the bank of the river, steady and unmoving. Let the thought pass by. You are the observer, not the impulse.",
    pauseAfter: 50
  },
  {
    id: 'strengths',
    text: "Recall a moment of strength from this week. A boundary you held, or a kind word you spoke to yourself. Breathe that resilience into your lungs. You have survived every hard day so far. Your persistent effort is your greatest victory.",
    pauseAfter: 50
  },
  {
    id: 'outro',
    text: "We are nearing the end of this transit. Begin to slow your pace. Know that the peace you've cultivated here is portable. You can return to this rhythm whenever the storm feels too loud. Well done, Traveller. You have honoured your path today. May you carry this integrity into your next footstep. Go gently.",
    pauseAfter: 0
  }
];

const TOTAL_TIME = 420; // 7 minutes

const WalkingMeditation: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const { audioCache, cacheAudio } = useRecoveryStore();
  const [isActive, setIsActive] = useState(false);
  const [currentSegment, setCurrentSegment] = useState(0);
  const [isGuidancePlaying, setIsGuidancePlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [isLoading, setIsLoading] = useState(false);
  
  const timerRef = useRef<any>(null);
  const segmentTimeoutRef = useRef<any>(null);

  const totalSegments = MEDITATION_SEGMENTS.length;

  const playSegment = async (index: number) => {
    if (index >= totalSegments) {
      setIsActive(false);
      return;
    }

    const segment = MEDITATION_SEGMENTS[index];
    setIsGuidancePlaying(true);
    triggerHaptic('CALM');

    try {
      const cacheKey = `walking_v7_seg_${index}`;
      let audio = audioCache[cacheKey];

      if (!audio) {
        const prompt = `Persona: Footsteps Guide. Instructions: Speak slowly, warmly and clearly in a British dialect. Read this: ${segment.text}`;
        audio = await generateSpeech(prompt) || "";
        if (audio) cacheAudio(cacheKey, audio);
      }

      if (audio) {
        await playSpeech(audio, () => {
          setIsGuidancePlaying(false);
          if (segment.pauseAfter > 0) {
            triggerHaptic('TAP');
            segmentTimeoutRef.current = setTimeout(() => {
              playSegment(index + 1);
            }, segment.pauseAfter * 1000);
          } else {
            // End of meditation logic handled by timer completion usually,
            // but we ensure isActive goes false if speech ends after timer.
            if (timeLeft <= 0) setIsActive(false);
          }
        });
        setCurrentSegment(index);
      }
    } catch (err) {
      console.error("Meditation Segment Error:", err);
      setIsGuidancePlaying(false);
    }
  };

  const startMeditation = () => {
    setIsActive(true);
    setCurrentSegment(0);
    setTimeLeft(TOTAL_TIME);
    
    // Start global countdown
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    playSegment(0);
  };

  const stopMeditation = () => {
    stopAllSpeech();
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (segmentTimeoutRef.current) clearTimeout(segmentTimeoutRef.current);
  };

  useEffect(() => {
    return () => stopMeditation();
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = ((TOTAL_TIME - timeLeft) / TOTAL_TIME) * 100;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-8 text-white overflow-hidden">
      {/* Immersive Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute inset-0 bg-gradient-to-b from-teal-900/10 via-slate-950 to-slate-950 transition-colors duration-[3000ms] ${isActive ? 'opacity-100' : 'opacity-40'}`} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px] transition-all duration-[5000ms] ${isActive ? 'bg-teal-500/5' : 'bg-indigo-500/5'} animate-pulse`} />
      </div>

      <div className="relative z-10 w-full max-w-lg text-center space-y-12">
        <header className="space-y-4">
           <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-white/5 rounded-[32px] border border-white/10 flex items-center justify-center text-5xl shadow-2xl animate-float">🚶</div>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-teal-500 uppercase tracking-[0.6em] animate-pulse">Walking Sanctuary</span>
                <h2 className="text-3xl font-black tracking-tight leading-none uppercase italic">The 7-Minute Transit</h2>
              </div>
           </div>
        </header>

        {/* Dynamic Timer & Status */}
        <div className="relative py-12">
           <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="48" stroke="white" strokeWidth="1" fill="none" />
                <circle cx="50" cy="50" r="48" stroke="teal" strokeWidth="2" fill="none" 
                  strokeDasharray="301.59" strokeDashoffset={301.59 - (301.59 * progressPercentage / 100)} 
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
           </div>
           
           <div className="space-y-4">
              <div className={`text-8xl font-black tabular-nums tracking-tighter transition-all duration-1000 ${isActive ? 'text-white drop-shadow-[0_0_20px_rgba(20,184,166,0.3)]' : 'text-slate-800'}`}>
                 {formatTime(timeLeft)}
              </div>
              
              {isActive && (
                <div className="flex flex-col items-center gap-3 animate-in fade-in duration-700">
                   <div className="flex items-center gap-3 bg-white/5 px-6 py-2 rounded-full border border-white/10">
                      <span className={`w-2 h-2 rounded-full ${isGuidancePlaying ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                        {isGuidancePlaying ? 'Guide Transmission' : 'Period of Reflection'}
                      </span>
                   </div>
                   <p className="text-sm text-slate-500 font-bold italic max-w-[280px] mx-auto leading-relaxed">
                     {isGuidancePlaying ? "Listen to the snippet..." : "Maintain your pace and focus on the breath."}
                   </p>
                </div>
              )}
           </div>
        </div>

        <div className="w-full max-w-xs mx-auto space-y-6">
           {!isActive ? (
             <button 
              onClick={startMeditation}
              className="w-full py-6 bg-teal-600 text-white font-black rounded-[32px] shadow-2xl hover:bg-teal-700 transition-all uppercase tracking-[0.2em] text-sm active:scale-95 border-b-[8px] border-teal-800"
             >
               Initialise Protocol
             </button>
           ) : (
             <button 
              onClick={stopMeditation}
              className="w-full py-6 bg-rose-600/10 text-rose-500 border-2 border-rose-500/20 font-black rounded-[32px] hover:bg-rose-600/20 transition-all uppercase tracking-widest text-xs"
             >
               Terminate Session
             </button>
           )}
           
           <button 
            onClick={onExit}
            className="text-slate-600 hover:text-slate-400 font-black uppercase text-[10px] tracking-[0.4em] transition-colors"
           >
             Abort & Return to Hub
           </button>
        </div>
      </div>

      <footer className="fixed bottom-12 left-0 right-0 flex flex-col items-center gap-4 opacity-30 pointer-events-none">
         <div className="flex gap-2">
            {MEDITATION_SEGMENTS.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= currentSegment && isActive ? 'bg-teal-400 shadow-[0_0_5px_teal]' : 'bg-slate-800'}`} />
            ))}
         </div>
         <p className="text-[10px] font-black uppercase tracking-[1em] text-slate-700">Footsteps / Movement / Sanctuary</p>
      </footer>
    </div>
  );
};

export default WalkingMeditation;