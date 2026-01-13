
import React, { useState } from 'react';
import { getModuleReflection } from '../geminiService';
import ModuleReflection from './ModuleReflection';
import SpeakButton from './SpeakButton';

const CATEGORIES = [
  { key: 'behaviours', label: 'Behaviours (Branches)', prompt: 'What specific actions are observable? (e.g. Procrastination, Avoidance, Overworking)', icon: '🌿' },
  { key: 'triggers', label: 'Triggers (Wind)', prompt: 'What external situations activate these behaviours? (e.g. Pressure, Change, Uncertainty)', icon: '🌬️' },
  { key: 'emotions', label: 'Emotions (Leaves)', prompt: 'What emotions accompany these patterns? (e.g. Anxiety, Guilt, Shame)', icon: '🍂' },
  { key: 'beliefs', label: 'Core Beliefs (Roots)', prompt: 'What underlying beliefs drive this? (e.g. "I\'m not good enough", "Mistakes are unacceptable")', icon: '🌳' },
  { key: 'traumas', label: 'Traumas/Experiences (Soil)', prompt: 'What past experiences shaped these current behaviours?', icon: '🌑' }
];

const BehaviourTree: React.FC<{ onExit: (rating?: number, reflection?: string) => void, onAskGuide?: () => void }> = ({ onExit, onAskGuide }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ behaviours: '', triggers: '', emotions: '', beliefs: '', traumas: '' });
  const [isListening, setIsListening] = useState(false);
  const [reflection, setReflection] = useState('');
  const [showReflection, setShowReflection] = useState(false);

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (isListening) { setIsListening(false); return; }
    const rec = new SpeechRecognition();
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onresult = (e: any) => {
      const key = CATEGORIES[step].key as keyof typeof data;
      const t = e.results[0][0].transcript;
      setData(prev => ({ ...prev, [key]: prev[key] ? `${prev[key]} ${t}` : t }));
    };
    rec.start();
  };

  const handleNext = async () => {
    if (step < CATEGORIES.length - 1) setStep(step + 1);
    else {
      const res = await getModuleReflection("Behaviour Tree Map", "User mapped their external behaviours to deep-rooted beliefs and past traumas.");
      setReflection(res);
      setShowReflection(true);
    }
  };

  if (showReflection) return <ModuleReflection moduleName="Behaviour Tree Map" context="Complex pattern mapping completed." initialReflection={reflection} onClose={onExit} title="Tree Mapping Complete" />;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 border border-slate-200 shadow-xl space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/10 rounded-full -mr-16 -mt-16 opacity-50" />
        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <span className="text-5xl">{CATEGORIES[step].icon}</span>
               <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{CATEGORIES[step].label}</h2>
            </div>
            <div className="flex items-center gap-2">
              <SpeakButton text={CATEGORIES[step].prompt} />
              {onAskGuide && (
                <button 
                  onClick={onAskGuide}
                  className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800 shadow-sm transition-all hover:scale-105"
                >
                  Ask Guide
                </button>
              )}
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">{CATEGORIES[step].prompt}</p>
          <div className="relative">
            <textarea
              value={data[CATEGORIES[step].key as keyof typeof data]}
              onChange={(e) => setData({ ...data, [CATEGORIES[step].key]: e.target.value })}
              className="w-full h-48 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl p-6 focus:ring-2 focus:ring-emerald-500 text-slate-700 dark:text-white resize-none transition-all"
              placeholder="Start mapping..."
            />
            <button onClick={toggleListening} className={`absolute bottom-4 right-4 p-4 rounded-full transition-all z-20 ${isListening ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 006 0V5a3 3 0 00-3-3z" /></svg>
            </button>
          </div>
          <div className="flex gap-4">
            {step > 0 && <button onClick={() => setStep(step - 1)} className="px-8 py-5 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800">Back</button>}
            <button onClick={handleNext} className="flex-grow py-5 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg">
              {step === 4 ? "Complete Map" : "Next Section"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BehaviourTree;
