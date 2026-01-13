
import React, { useEffect, useState } from 'react';
import { getModuleReflection, generateCompletionArt } from '../geminiService';
import { useRecoveryStore } from '../store';
import { getRankData } from '../constants';
import SpeakButton from './SpeakButton';

interface ModuleReflectionProps {
  moduleName: string;
  context: string;
  onClose: (rating?: number, reflection?: string, artUrl?: string) => void;
  title?: string;
  initialReflection?: string; 
}

const RATING_LABELS = [
  "Not for me",
  "Somewhat helpful",
  "Good tool",
  "Very helpful",
  "Life changing"
];

const ModuleReflection: React.FC<ModuleReflectionProps> = ({ 
  moduleName, 
  context, 
  onClose, 
  title = "Footpath Guide's Reflection",
  initialReflection 
}) => {
  const store = useRecoveryStore();
  const [step, setStep] = useState<'rating' | 'loading' | 'reflection'>(initialReflection ? 'reflection' : 'rating');
  const [reflection, setReflection] = useState(initialReflection || '');
  const [artUrl, setArtUrl] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  const fetchData = async (selectedRating: number) => {
    setStep('loading');
    const rankData = getRankData(store.sobriety.footsteps || 0);
    
    try {
      // getModuleReflection now internally handles the SLM fallback
      const [textRes, artRes] = await Promise.all([
        getModuleReflection(moduleName, context, selectedRating),
        isOffline ? Promise.resolve(null) : generateCompletionArt(moduleName, rankData.title)
      ]);
      
      setReflection(textRes);
      setArtUrl(artRes);
    } catch (err) {
      console.error("Error fetching reflection data:", err);
      setReflection("Your effort today is a sacred step on your path.");
    }
    
    setStep('reflection');
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-xl mx-auto px-4 pb-20 mt-10">
      <div className="bg-white dark:bg-slate-900 rounded-[40px] border-4 border-teal-50 dark:border-slate-800 shadow-2xl overflow-hidden relative">
        <div className={`relative ${step === 'reflection' && artUrl ? 'h-64' : 'bg-teal-600 p-6'} transition-all duration-1000 overflow-hidden`}>
          {step === 'reflection' && artUrl ? (
            <>
              <img src={artUrl} className="w-full h-full object-cover animate-in fade-in zoom-in-105 duration-[2000ms]" alt="Symbolic milestone art" />
              <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-transparent to-transparent" />
              <div className="absolute top-6 left-6 flex items-center gap-3">
                 <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-xl text-white shadow-xl" aria-hidden="true">🏔️</div>
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white drop-shadow-md">Landmark Discovered</span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-xl backdrop-blur-sm" aria-hidden="true">🧘</div>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em]">Activity Complete</span>
              </div>
              {isOffline && (
                <div className="flex items-center gap-2 px-3 py-1 bg-black/20 rounded-full border border-white/20">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                  <span className="text-[8px] font-black uppercase">Local Protocol</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-8 md:p-10 space-y-8 text-center" role="region">
          {step === 'rating' && (
            <div className="space-y-8 animate-in zoom-in-95 duration-500">
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">How was this for you?</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  Your feedback helps me suggest better tools for your unique journey.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => setRating(num)}
                      className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl font-black text-xl transition-all ${
                        rating === num 
                          ? 'bg-teal-600 text-white scale-110 shadow-xl ring-4 ring-teal-500/20' 
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-teal-50'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                {rating && (
                  <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest animate-in fade-in">
                    {RATING_LABELS[rating - 1]}
                  </p>
                )}
              </div>

              <button
                onClick={() => rating && fetchData(rating)}
                disabled={rating === null}
                className={`w-full py-5 rounded-2xl font-black shadow-xl transition-all active:scale-95 uppercase tracking-widest text-sm ${
                  rating !== null 
                    ? 'bg-teal-600 text-white shadow-teal-600/30 hover:bg-teal-700' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-300 cursor-not-allowed'
                }`}
              >
                Reveal Landmark & Reflection
              </button>
            </div>
          )}

          {step === 'loading' && (
            <div className="py-12 flex flex-col items-center gap-6 animate-in fade-in">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-teal-100 dark:border-slate-800 border-t-teal-600 rounded-full animate-spin"></div>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-bold italic">
                {isOffline ? "Accessing Sanctuary Local Core..." : "Consulting with the Guide..."}
              </p>
            </div>
          )}

          {step === 'reflection' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <h3 className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em]">{title}</h3>
                  <SpeakButton text={reflection} size={14} className="opacity-60" />
                </div>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-relaxed italic px-2">
                  "{reflection}"
                </p>
              </div>

              <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                 {isOffline && (
                   <div className="mb-6 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl">
                      <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest italic">
                        Feedback generated in Offline Sanctuary Mode.
                      </p>
                   </div>
                 )}
                 <button 
                   onClick={() => onClose(rating || undefined, reflection, artUrl || undefined)}
                   className="w-full py-5 bg-teal-600 text-white font-black rounded-2xl shadow-xl shadow-teal-600/30 hover:bg-teal-700 transition-all active:scale-95 uppercase tracking-widest text-sm"
                 >
                   Integrate & Archive
                 </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuleReflection;
