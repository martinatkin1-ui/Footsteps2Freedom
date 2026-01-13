
import React, { useState } from 'react';
import { getModuleReflection } from '../geminiService';
import ModuleReflection from './ModuleReflection';

type GroundingMode = '54321' | 'eating' | 'scan' | 'none';

const CLASSIC_STEPS = [
  {
    count: 5,
    title: "Things You See",
    icon: "👁️",
    prompt: "Look around the room and name five things you can see right now.",
    accentColor: "bg-sky-500",
    lightAccent: "bg-sky-900/10",
    elements: ["🌳", "🪟", "💡", "📚", "🎨"]
  },
  {
    count: 4,
    title: "Things You Feel",
    icon: "✋",
    prompt: "Focus on your body. What are four things you can feel? Describe the texture mentally.",
    accentColor: "bg-teal-500",
    lightAccent: "bg-teal-900/10",
    elements: ["🧶", "🪑", "🌬️", "👟"]
  },
  {
    count: 3,
    title: "Things You Hear",
    icon: "👂",
    prompt: "Listen closely. What are three sounds you can hear? One near, one far, one internal.",
    accentColor: "bg-indigo-500",
    lightAccent: "bg-indigo-900/10",
    elements: ["🐦", "🚗", "💻"]
  },
  {
    count: 2,
    title: "Things You Smell",
    icon: "👃",
    prompt: "Name two smells in the air. If the air is neutral, imagine the scent of rain or fresh bread.",
    accentColor: "bg-amber-500",
    lightAccent: "bg-amber-900/10",
    elements: ["☕", "🌸"]
  },
  {
    count: 1,
    title: "Sensory Anchor",
    icon: "⚓",
    prompt: "Final Step: Describe one positive memory associated with your favourite scent or taste.",
    accentColor: "bg-rose-500",
    lightAccent: "bg-rose-900/10",
    elements: ["💖"],
    requiresInput: true
  }
];

const EATING_STEPS = [
  { title: "Observe", icon: "👁️", prompt: "Hold the item. Look at it as if you've never seen it before. Notice the shadows, colors, and textures.", accentColor: "bg-emerald-500" },
  { title: "Texture", icon: "✋", prompt: "Close your eyes. Roll the item between your fingers. Is it rough? Sticky? Smooth? Cold?", accentColor: "bg-teal-500" },
  { title: "Scent", icon: "👃", prompt: "Bring it to your nose. Inhale slowly. How does the aroma affect your salivary glands?", accentColor: "bg-indigo-500" },
  { title: "Taste", icon: "👅", prompt: "Place it on your tongue. Don't chew yet. Notice the initial burst of flavor. Now, chew once and feel the texture change.", accentColor: "bg-rose-500", requiresInput: true }
];

const SCAN_STEPS = [
  { title: "Foundation", icon: "👣", prompt: "Notice your feet. Feel the contact with the floor. Imagine roots growing into the earth.", accentColor: "bg-slate-700" },
  { title: "Center", icon: "⚖️", prompt: "Notice your seat. Feel the chair supporting your weight. Let your muscles soften into it.", accentColor: "bg-teal-700" },
  { title: "Breath", icon: "🌬️", prompt: "Notice your chest rising and falling. Don't change it. Just observe the rhythm of life.", accentColor: "bg-indigo-700" },
  { title: "Release", icon: "🧘", prompt: "Notice your jaw and shoulders. Drop them an inch. Imagine the tension draining out of your fingertips.", accentColor: "bg-rose-700", requiresInput: true }
];

interface GroundingToolProps {
  onExit: (rating?: number, reflection?: string, artUrl?: string) => void;
  onAskGuideMap?: () => void;
}

const GroundingTool: React.FC<GroundingToolProps> = ({ onExit, onAskGuideMap }) => {
  const [mode, setMode] = useState<GroundingMode>('none');
  const [currentStep, setCurrentStep] = useState(0);
  const [completedItems, setCompletedItems] = useState<number>(0);
  const [userInput, setUserInput] = useState('');
  const [reflection, setReflection] = useState('');
  const [showReflection, setShowReflection] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (isListening) { setIsListening(false); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-GB';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      setUserInput(prev => prev ? `${prev} ${event.results[0][0].transcript}` : event.results[0][0].transcript);
    };
    recognition.start();
  };

  const handleNext = () => {
    let steps = mode === '54321' ? CLASSIC_STEPS : mode === 'eating' ? EATING_STEPS : SCAN_STEPS;
    
    if (mode === '54321') {
      const step = CLASSIC_STEPS[currentStep];
      if (completedItems < step.count - 1) {
        setCompletedItems(prev => prev + 1);
        return;
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setCompletedItems(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    setIsFinishing(true);
    const modeName = mode === '54321' ? '5-4-3-2-1 Grounding' : mode === 'eating' ? 'Mindful Eating' : 'Body Scan Grounding';
    const res = await getModuleReflection(modeName, `User completed ${modeName} sequence. Final reflection: "${userInput}".`);
    setReflection(res);
    setShowReflection(true);
    setIsFinishing(false);
  };

  if (showReflection) {
    return <ModuleReflection reflection={reflection} onClose={(rating, refl, art) => onExit(rating, refl, art)} title="Grounding Complete" />;
  }

  if (mode === 'none') {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in duration-700 pb-32">
        <div className="text-center space-y-6 mb-16">
          <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Grounding Hub</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-xl max-w-2xl mx-auto italic leading-relaxed">
            "Anxiety pulls you into a non-existent future. Grounding pulls you back to the physical safety of NOW."
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <button 
            onClick={() => setMode('54321')}
            className="group bg-white dark:bg-slate-900 p-10 rounded-[56px] border-2 border-slate-100 dark:border-slate-800 text-left hover:border-sky-500/50 hover:shadow-2xl transition-all h-full flex flex-col relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform" />
            <span className="text-5xl mb-8 block group-hover:rotate-12 transition-transform">🌍</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">5-4-3-2-1 Method</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-10 flex-grow italic">Classic sensory countdown to disrupt panic and racing thoughts.</p>
            <span className="text-sky-600 font-black text-[10px] uppercase tracking-widest mt-auto border-b-2 border-sky-100 inline-block pb-1">Begin Protocol →</span>
          </button>

          <button 
            onClick={() => setMode('eating')}
            className="group bg-white dark:bg-slate-900 p-10 rounded-[56px] border-2 border-slate-100 dark:border-slate-800 text-left hover:border-emerald-500/50 hover:shadow-2xl transition-all h-full flex flex-col relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform" />
            <span className="text-5xl mb-8 block group-hover:rotate-12 transition-transform">🍫</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Sacred Taste</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-10 flex-grow italic">High-intensity focus using a small piece of food to reset the senses.</p>
            <span className="text-emerald-600 font-black text-[10px] uppercase tracking-widest mt-auto border-b-2 border-emerald-100 inline-block pb-1">Begin Protocol →</span>
          </button>

          <button 
            onClick={() => setMode('scan')}
            className="group bg-white dark:bg-slate-900 p-10 rounded-[56px] border-2 border-slate-100 dark:border-slate-800 text-left hover:border-indigo-500/50 hover:shadow-2xl transition-all h-full flex flex-col relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform" />
            <span className="text-5xl mb-8 block group-hover:rotate-12 transition-transform">🧘</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Body Anchor</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-10 flex-grow italic">Progressive somatic awareness to anchor the True-Self in the physical frame.</p>
            <span className="text-indigo-600 font-black text-[10px] uppercase tracking-widest mt-auto border-b-2 border-indigo-100 inline-block pb-1">Begin Protocol →</span>
          </button>
        </div>
      </div>
    );
  }

  const steps = mode === '54321' ? CLASSIC_STEPS : mode === 'eating' ? EATING_STEPS : SCAN_STEPS;
  const step = steps[currentStep];

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in duration-700 pb-32">
      <div className="flex justify-between items-center px-4">
        <button onClick={() => setMode('none')} className="text-slate-400 hover:text-slate-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
           <span>←</span> Back to Hub
        </button>
        <div className="flex gap-2 flex-grow max-w-[200px] ml-6">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 flex-grow rounded-full transition-all duration-700 ${
                i <= currentStep ? (step as any).accentColor || 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-800'
              }`}
            />
          ))}
        </div>
        {onAskGuideMap && (
          <button 
            onClick={onAskGuideMap}
            className="ml-6 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800 shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            Ask Guide
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[60px] p-8 md:p-16 border-2 border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-80 h-80 opacity-5 rounded-full -mr-40 -mt-40 blur-3xl transition-colors duration-1000 ${(step as any).accentColor || 'bg-teal-500'}`} />
        
        <div className="relative z-10 space-y-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center text-6xl shadow-inner border-2 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 transform group-hover:rotate-6 transition-transform duration-700`}>
              {step.icon}
            </div>
            <div className="text-center md:text-left">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 block text-slate-500">
                Step {currentStep + 1} of {steps.length}
              </span>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">{step.title}</h2>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-inner">
            <p className="text-slate-800 dark:text-slate-200 text-2xl font-bold leading-relaxed italic text-center">
              "{step.prompt}"
            </p>
          </div>

          {mode === '54321' && (step as any).elements && (
            <div className="flex flex-wrap justify-center gap-4 py-4">
              {(step as any).elements.map((el: string, i: number) => (
                <div 
                  key={i} 
                  className={`w-20 h-20 md:w-24 md:h-24 rounded-[32px] flex items-center justify-center text-4xl md:text-5xl shadow-xl transition-all duration-500 border-2 ${
                    i <= completedItems 
                      ? `${(step as any).accentColor} border-white/20 text-white scale-110 rotate-3` 
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-300 scale-100 rotate-0'
                  }`}
                >
                  {el}
                </div>
              ))}
            </div>
          )}

          {step.requiresInput && (
            <div className="relative group/input">
              <textarea
                autoFocus
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Describe your current reality..."
                className={`w-full h-48 bg-slate-50 dark:bg-slate-950 border-2 rounded-[32px] p-8 focus:ring-8 focus:ring-teal-500/10 text-slate-900 dark:text-white text-xl font-medium leading-relaxed resize-none transition-all duration-500 shadow-inner ${
                  isListening ? 'border-rose-400 ring-rose-500/20' : 'border-slate-100 dark:border-slate-800 group-hover/input:border-slate-200 dark:group-hover/input:border-slate-700'
                }`}
              />
              <button
                onClick={toggleListening}
                className={`absolute bottom-6 right-6 p-5 rounded-2xl shadow-2xl transition-all z-20 ${
                  isListening 
                    ? 'bg-rose-500 text-white animate-pulse' 
                    : 'bg-white dark:bg-slate-800 text-teal-600 shadow-teal-500/20 hover:scale-110'
                }`}
                title="Vocalise insight"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isListening ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 006 0V5a3 3 0 00-3-3z" />
                </svg>
              </button>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <button
              onClick={handleNext}
              disabled={isFinishing || (step.requiresInput && !userInput.trim())}
              className={`w-full py-6 rounded-[28px] font-black text-sm uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-[0.98] ${
                isFinishing || (step.requiresInput && !userInput.trim())
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' 
                  : `${(step as any).accentColor || 'bg-teal-600'} text-white shadow-teal-600/20 hover:brightness-110`
              }`}
            >
              {isFinishing ? (
                <span className="flex items-center justify-center gap-2">
                   <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                   Archiving Experience...
                </span>
              ) : (
                mode === '54321' 
                  ? (completedItems < (step as any).count - 1 ? "I've Noticed" : (currentStep < CLASSIC_STEPS.length - 1 ? "Next Sensory Link" : "Seal Protocol"))
                  : (currentStep < steps.length - 1 ? "I am Present" : "Seal Protocol")
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 rounded-[48px] p-10 text-white flex gap-8 items-center shadow-2xl border-b-[12px] border-slate-900 ring-1 ring-white/5">
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl shrink-0 backdrop-blur-md">🌍</div>
        <p className="text-base text-slate-400 leading-relaxed font-medium italic">
          "By engaging different neural networks—visual, auditory, somatic—you manually overrule the craving circuitry. You are reclaiming the driver's seat."
        </p>
      </div>
    </div>
  );
};

export default GroundingTool;
