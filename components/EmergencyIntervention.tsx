
import React, { useState } from 'react';
import { INTERVENTIONS } from '../constants';
import SpeakButton from './SpeakButton';

interface EmergencyInterventionProps {
  onComplete: () => void;
  sponsorNumber?: string;
  onStartBreathing: () => void;
}

const EmergencyIntervention: React.FC<EmergencyInterventionProps> = ({ onComplete, sponsorNumber, onStartBreathing }) => {
  const [selectedSkill, setSelectedSkill] = useState<'tipp' | 'grounding' | 'breathing' | null>(null);
  const [step, setStep] = useState(0);

  const handleCallSponsor = () => {
    if (sponsorNumber && sponsorNumber.trim()) {
      window.location.href = `tel:${sponsorNumber.trim()}`;
    } else {
      alert("No sponsor number found in your Relapse Prevention Plan. Please add one in the Tools -> RPP Builder section.");
    }
  };

  const handleCallEmergency = () => {
    window.location.href = 'tel:999';
  };

  const handleCallSamaritans = () => {
    window.location.href = 'tel:116123';
  };

  if (!selectedSkill) {
    return (
      <div className="max-w-5xl mx-auto space-y-12 py-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">I'm here. Breathe.</h2>
            <SpeakButton text="I'm here. Breathe. You're feeling overwhelmed, and that's okay. Let's find some solid ground together. Choose your immediate path to safety below." />
          </div>
          <p className="text-slate-800 text-xl font-medium leading-relaxed">You're feeling overwhelmed, and that's okay. Let's find some solid ground together. Choose your immediate path to safety below.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Emergency Services */}
          <button 
            onClick={handleCallEmergency}
            className="group bg-rose-700 p-8 rounded-[40px] border-4 border-rose-600 hover:bg-rose-800 shadow-2xl transition-all text-left text-white"
          >
            <div className="flex justify-between items-start mb-6">
              <span className="text-5xl drop-shadow-lg">🚨</span>
              <span className="text-[10px] font-black text-rose-100 uppercase bg-white/20 px-3 py-1.5 rounded-full border border-white/20 tracking-widest">Emergency Only</span>
            </div>
            <h3 className="text-2xl font-black mb-2">Police/Medical (999)</h3>
            <p className="text-white text-sm font-bold leading-relaxed opacity-90">Call immediately if you are at risk of self-harm or need urgent medical attention.</p>
          </button>

          {/* Samaritans */}
          <button 
            onClick={handleCallSamaritans}
            className="group bg-indigo-700 p-8 rounded-[40px] border-4 border-indigo-600 hover:bg-indigo-800 shadow-2xl transition-all text-left text-white"
          >
            <div className="flex justify-between items-start mb-6">
              <span className="text-5xl drop-shadow-lg">☎️</span>
              <span className="text-[10px] font-black text-indigo-100 uppercase bg-white/20 px-3 py-1.5 rounded-full border border-white/20 tracking-widest">24/7 Listening</span>
            </div>
            <h3 className="text-2xl font-black mb-2">Samaritans (116 123)</h3>
            <p className="text-white text-sm font-bold leading-relaxed opacity-90">Free, confidential support at any time. Talk to a human who cares, no matter the struggle.</p>
          </button>

          {/* Call Sponsor */}
          <button 
            onClick={handleCallSponsor}
            className="group bg-emerald-700 p-8 rounded-[40px] border-4 border-emerald-600 hover:bg-emerald-800 shadow-2xl transition-all text-left text-white"
          >
            <div className="flex justify-between items-start mb-6">
              <span className="text-5xl drop-shadow-lg">📞</span>
              <span className="text-[10px] font-black text-emerald-100 uppercase bg-white/20 px-3 py-1.5 rounded-full border border-white/20 tracking-widest">Network</span>
            </div>
            <h3 className="text-2xl font-black mb-2">Call My Sponsor</h3>
            <p className="text-white text-sm font-bold leading-relaxed opacity-90">Connect with your pre-selected safe person to talk through this specific trigger.</p>
          </button>

          {/* TIPP Skills */}
          <button 
            onClick={() => setSelectedSkill('tipp')}
            className="group bg-white p-8 rounded-[40px] border-2 border-slate-200 hover:border-teal-600 hover:shadow-2xl transition-all text-left"
          >
            <div className="flex justify-between items-start mb-6">
              <span className="text-5xl drop-shadow-sm">🌊</span>
              <span className="text-[10px] font-black text-teal-700 uppercase bg-teal-50 px-3 py-1.5 rounded-full tracking-widest">Physical Reset</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">TIPP Skills</h3>
            <p className="text-slate-700 text-sm font-bold leading-relaxed">High-intensity physical interventions for panic and severe emotional storms.</p>
          </button>

          {/* Paced Breathing */}
          <button 
            onClick={() => setSelectedSkill('breathing')}
            className="group bg-white p-8 rounded-[40px] border-2 border-slate-200 hover:border-teal-600 hover:shadow-2xl transition-all text-left"
          >
            <div className="flex justify-between items-start mb-6">
              <span className="text-5xl drop-shadow-sm">🌬️</span>
              <span className="text-[10px] font-black text-teal-700 uppercase bg-teal-50 px-3 py-1.5 rounded-full tracking-widest">Vagus Nerve</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Paced Breathing</h3>
            <p className="text-slate-700 text-sm font-bold leading-relaxed">Gently signal your brain that you are safe through rhythmic, slow breathing.</p>
          </button>

          {/* Grounding */}
          <button 
            onClick={() => setSelectedSkill('grounding')}
            className="group bg-white p-8 rounded-[40px] border-2 border-slate-200 hover:border-teal-600 hover:shadow-2xl transition-all text-left"
          >
            <div className="flex justify-between items-start mb-6">
              <span className="text-5xl drop-shadow-sm">🌳</span>
              <span className="text-[10px] font-black text-teal-700 uppercase bg-teal-50 px-3 py-1.5 rounded-full tracking-widest">Reality Check</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">5-4-3-2-1 Tool</h3>
            <p className="text-slate-700 text-sm font-bold leading-relaxed">Engage all five senses to bring your awareness back to the safe, physical present.</p>
          </button>
        </div>

        <button 
            onClick={onComplete}
            className="w-full py-6 text-slate-800 font-black uppercase tracking-[0.2em] text-sm hover:text-slate-900 transition-colors bg-slate-100 rounded-3xl border border-slate-200 shadow-sm active:scale-95"
        >
            I'm starting to feel a bit better now.
        </button>
      </div>
    );
  }

  const skill = INTERVENTIONS[selectedSkill];
  const currentStep = skill.steps[step];

  return (
    <div className="max-w-2xl mx-auto py-12 animate-in fade-in duration-1000">
      <div className="bg-white rounded-[50px] p-12 md:p-16 border-4 border-slate-100 shadow-2xl relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-teal-50/40 animate-pulse pointer-events-none"></div>
        
        <div className="relative z-10 space-y-10">
          <div className="space-y-3">
            <div className="flex justify-center items-center gap-3">
              <span className="text-[10px] font-black text-teal-700 uppercase tracking-[0.4em] bg-teal-50 px-4 py-2 rounded-full border border-teal-100 shadow-sm">{skill.title} • Step {step + 1} of {skill.steps.length}</span>
              <SpeakButton text={currentStep.text} size={12} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 pt-4">{currentStep.label}</h2>
          </div>

          <div className="min-h-[160px] flex items-center justify-center px-6 bg-slate-50 rounded-[40px] border border-slate-100 shadow-inner">
            <p className="text-2xl text-slate-900 leading-relaxed font-black animate-in fade-in slide-in-from-bottom-3 duration-1000">
              "{currentStep.text}"
            </p>
          </div>

          <div className="pt-8">
            <button 
              onClick={() => {
                if (step < skill.steps.length - 1) setStep(step + 1);
                else onComplete();
              }}
              className="px-12 py-6 bg-teal-700 text-white font-black text-xl rounded-3xl shadow-2xl shadow-teal-600/30 hover:bg-teal-800 hover:scale-105 active:scale-95 transition-all w-full uppercase tracking-widest"
            >
              {step === skill.steps.length - 1 ? "I'm back. Thank you." : "Breathe... Next Step"}
            </button>
          </div>

          <div className="flex justify-center gap-2 pt-6">
            {skill.steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-2 rounded-full transition-all duration-700 ${i === step ? 'bg-teal-600 w-16 shadow-sm' : 'bg-slate-200 w-8'}`}
              />
            ))}
          </div>
          
          <button 
            onClick={() => { setSelectedSkill(null); setStep(0); }}
            className="text-slate-900 text-xs font-black uppercase tracking-[0.2em] hover:underline underline-offset-8 mt-6 block w-full text-center"
          >
            ← Back to Help Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyIntervention;
