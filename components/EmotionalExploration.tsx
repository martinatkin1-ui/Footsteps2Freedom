
import React, { useState } from 'react';
import { getModuleReflection } from '../geminiService';
import ModuleReflection from './ModuleReflection';
import SpeakButton from './SpeakButton';

interface EmotionalExplorationProps {
  onExit: (rating?: number, reflection?: string) => void;
  onAskGuide?: () => void;
}

const EmotionalExploration: React.FC<EmotionalExplorationProps> = ({ onExit, onAskGuide }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ surface: '', root: '', sensations: '' });
  const [reflection, setReflection] = useState('');
  const [showReflection, setShowReflection] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const steps = [
    { title: 'Surface Emotion', prompt: 'What conscious emotion are you feeling right now? (e.g. Frustration, irritation)', icon: '🌊', key: 'surface' },
    { title: 'Root Emotion', prompt: 'What deeper emotion is driving the surface one? (e.g. Feeling unimportant, linked to past neglect)', icon: '⚓', key: 'root' },
    { title: 'Body Awareness', prompt: 'Where do you feel this in your body? Describe the physical sensations (e.g. Tight chest, heat in face)', icon: '🧘', key: 'sensations' }
  ];

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-GB';
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const currentKey = steps[step].key;
      setData(prev => ({
        ...prev,
        [currentKey]: (prev as any)[currentKey] ? `${(prev as any)[currentKey]} ${transcript}` : transcript
      }));
    };
    recognition.start();
  };

  const handleFinish = async () => {
    const res = await getModuleReflection("Emotional Exploration", `User explored layers of emotion: Surface (${data.surface}), Root (${data.root}), and sensations (${data.sensations}).`);
    setReflection(res);
    setShowReflection(true);
  };

  if (showReflection) return <ModuleReflection moduleName="Emotional Exploration" context="Deep dive into emotional roots completed." initialReflection={reflection} onClose={onExit} title="Deep Insights" />;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/10 rounded-full -mr-16 -mt-16 opacity-50" />
        
        <div className="space-y-4 relative z-10">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{steps[step].icon}</span>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{steps[step].title}</h2>
              </div>
              <div className="flex items-center gap-2">
                <SpeakButton text={steps[step].prompt} />
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
           <p className="text-slate-600 dark:text-slate-300 text-lg font-medium leading-relaxed">{steps[step].prompt}</p>
        </div>

        <div className="relative z-10">
          <textarea
            value={(data as any)[steps[step].key]}
            onChange={(e) => setData({...data, [steps[step].key]: e.target.value})}
            className="w-full h-48 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl p-6 focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-white resize-none transition-all"
            placeholder="Reflect deeply..."
          />
          <button
            onClick={toggleListening}
            className={`absolute bottom-4 right-4 p-4 rounded-full transition-all z-20 ${
              isListening 
                ? 'bg-rose-100 text-rose-600 shadow-inner' 
                : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200'
            }`}
            title="Voice Input"
          >
            {isListening && (
              <span className="absolute inset-0 rounded-full bg-rose-400 animate-ping opacity-30"></span>
            )}
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 relative z-10 ${isListening ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 006 0V5a3 3 0 00-3-3z" />
            </svg>
          </button>
        </div>

        <div className="flex gap-4 relative z-10">
          {step > 0 && <button onClick={() => setStep(step - 1)} className="px-8 py-5 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800">Back</button>}
          <button
            onClick={() => step < 2 ? setStep(step + 1) : handleFinish()}
            className="flex-grow py-5 bg-indigo-600 text-white font-bold rounded-2xl"
          >
            {step === 2 ? "Explore more" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmotionalExploration;
