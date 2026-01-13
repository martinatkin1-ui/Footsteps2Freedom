
import React, { useState } from 'react';
import { getModuleReflection } from '../geminiService';
import ModuleReflection from './ModuleReflection';

interface StopSkillProps {
  onExit: (rating?: number, reflection?: string, artUrl?: string) => void;
  onAskGuide?: () => void;
}

const STEPS = [
  {
    id: 'S',
    title: 'Stop',
    icon: '✋',
    prompt: 'Pause whatever you are doing. Mentally tell yourself "Stop!".',
    guidance: 'Interrupt the automatic response pattern by consciously choosing to pause for just a moment.'
  },
  {
    id: 'T',
    title: 'Take a Breath',
    icon: '🌬️',
    prompt: 'Shift your focus to your breath. Take a slow, deep breath in... and out.',
    guidance: 'Take a few deep breaths to help calm your nervous system and center yourself in the present moment.'
  },
  {
    id: 'O',
    title: 'Observe',
    icon: '👁️',
    prompt: 'Notice what is happening inside and outside of you right now.',
    guidance: 'Bring awareness to your internal experience and external environment. Notice thoughts, emotions, and sensations without judgment.'
  },
  {
    id: 'V',
    title: 'Value Align',
    icon: '🔑',
    prompt: 'Which of your core values are you protecting by pausing right now?',
    guidance: 'Remind yourself why this moment of restraint matters. Is it for your children? Your health? Your self-respect?',
    requiresInput: true
  },
  {
    id: 'P',
    title: 'Proceed Mindfully',
    icon: '🧘',
    prompt: 'Decide how you want to act based on your values.',
    guidance: 'Choose a response that aligns with your long-term goals and well-being. Consider the consequences before taking action.'
  }
];

const StopSkill: React.FC<StopSkillProps> = ({ onExit, onAskGuide }) => {
  const [step, setStep] = useState(0);
  const [valueInput, setValueInput] = useState('');
  const [reflection, setReflection] = useState('');
  const [showReflection, setShowReflection] = useState(false);

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      const res = await getModuleReflection("STOP Skill", `User successfully practiced the STOP skill. In the Values Alignment step, they identified protecting: "${valueInput}".`);
      setReflection(res);
      setShowReflection(true);
    }
  };

  if (showReflection) {
    return (
      <ModuleReflection 
        moduleName="STOP Skill" 
        context="Mindfulness centering and biological pause completed." 
        reflection={reflection} 
        onClose={(rating, refl, art) => onExit(rating, refl, art)} 
        title="STOP Skill Complete" 
      />
    );
  }

  const currentStep = STEPS[step];

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 border-2 border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden text-center group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 dark:bg-rose-900/10 rounded-full -mr-16 -mt-16 opacity-50 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="w-20 hidden md:block"></div>
             <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-3xl flex items-center justify-center text-6xl font-black shadow-inner border-2 border-rose-100 dark:border-rose-800 mb-6 group-hover:scale-110 transition-transform">
                  {currentStep.id}
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{currentStep.title}</h2>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-1">Protocol Scan {step + 1} of {STEPS.length}</p>
             </div>
             {onAskGuide && (
                <button 
                  onClick={onAskGuide}
                  className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800 shadow-sm transition-all hover:scale-105 active:scale-95"
                >
                  Ask Guide
                </button>
              )}
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[32px] border-2 border-slate-100 dark:border-slate-700 shadow-inner">
            <p className="text-slate-700 dark:text-slate-300 font-bold italic text-base leading-relaxed">
              "{currentStep.guidance}"
            </p>
          </div>

          <div className="py-2 space-y-8">
            <span className="text-6xl block transform hover:rotate-12 transition-transform duration-700">{currentStep.icon}</span>
            <p className="text-2xl text-slate-900 dark:text-white font-black leading-relaxed">"{currentStep.prompt}"</p>
            
            {currentStep.requiresInput && (
              <div className="relative">
                <input 
                  autoFocus
                  type="text"
                  value={valueInput}
                  onChange={(e) => setValueInput(e.target.value)}
                  placeholder="e.g., My integrity, my daughter's trust..."
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-rose-100 dark:border-rose-900/30 rounded-[28px] px-8 py-5 focus:ring-8 focus:ring-rose-500/10 focus:border-rose-500 font-bold text-slate-800 dark:text-white text-center text-lg shadow-inner outline-none transition-all"
                />
              </div>
            )}
          </div>

          <button
            onClick={handleNext}
            disabled={currentStep.requiresInput && !valueInput.trim()}
            className="w-full py-6 bg-rose-600 text-white font-black rounded-3xl shadow-xl shadow-rose-600/30 hover:bg-rose-700 transition-all active:scale-95 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:shadow-none uppercase tracking-[0.3em] text-sm"
          >
            {step === STEPS.length - 1 ? "I am centered" : "Continue Sequence"}
          </button>

          <button onClick={() => onExit()} className="text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-600 transition-colors">Terminate Protocol</button>
        </div>
      </div>
    </div>
  );
};

export default StopSkill;
