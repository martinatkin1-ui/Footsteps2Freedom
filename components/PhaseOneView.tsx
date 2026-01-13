
import React from 'react';
import { PHASE_ONE_CONTENT, COPING_EXERCISES } from '../constants';

interface PhaseOneViewProps {
  onStartExercise: (id: string) => void;
}

const PhaseOneView: React.FC<PhaseOneViewProps> = ({ onStartExercise }) => {
  // Fix: Updated filter titles to match the entries in COPING_EXERCISES (constants.tsx) for accurate phase rendering
  const phaseOneTools = COPING_EXERCISES.filter(ex => 
    ["5-4-3-2-1 Grounding", "Understand Patterns", "Meditation Sanctuary", "Window of Tolerance"].includes(ex.title)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-teal-600 text-white rounded-full text-[10px] font-bold uppercase tracking-widest">
              Current Phase
            </span>
            <span className="text-slate-400 text-xs font-medium">Self-Paced Healing</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-4">{PHASE_ONE_CONTENT.title}</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-6">
            {PHASE_ONE_CONTENT.welcome}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div>
              <h4 className="font-bold text-teal-800 text-sm mb-2 uppercase tracking-tight">The Bio-Psycho-Social Model</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                {PHASE_ONE_CONTENT.description}
              </p>
            </div>
            <div>
              <h4 className="font-bold text-teal-800 text-sm mb-2 uppercase tracking-tight">Focus: Personal Values</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                {PHASE_ONE_CONTENT.focus}
              </p>
            </div>
          </div>
          <p className="mt-6 text-sm italic text-teal-600 font-medium">
            ✨ {PHASE_ONE_CONTENT.reminders}
          </p>
        </div>
      </div>

      {/* Suggested Exercises */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-700 px-2 uppercase text-xs tracking-widest flex items-center gap-2">
            Recommended Tools for This Phase
            <span className="h-px bg-slate-200 flex-grow"></span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {phaseOneTools.map((ex, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-teal-300 transition-all group cursor-pointer shadow-sm" onClick={() => onStartExercise(ex.id)}>
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded uppercase">{ex.category}</span>
              </div>
              <h4 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-teal-600 transition-colors">{ex.title}</h4>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">{ex.description}</p>
              <div className="flex items-center text-teal-600 text-sm font-bold gap-2">
                Start Activity 
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bio-Psycho-Social Breakdown */}
      <div className="bg-slate-800 rounded-3xl p-8 text-white">
        <h3 className="text-xl font-bold mb-6">Understanding Your Experience</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-2xl mb-2">🧬</div>
            <h5 className="font-bold text-teal-400 mb-1">Biological</h5>
            <p className="text-xs text-slate-300 leading-relaxed">Genetic predisposition and neurochemical changes in the brain's reward system.</p>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-2xl mb-2">🧠</div>
            <h5 className="font-bold text-teal-400 mb-1">Psychological</h5>
            <p className="text-xs text-slate-300 leading-relaxed">Coping mechanisms, trauma, mental health history, and belief patterns.</p>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-2xl mb-2">🏠</div>
            <h5 className="font-bold text-teal-400 mb-1">Social</h5>
            <p className="text-xs text-slate-300 leading-relaxed">Environment, community support, economic stability, and relationships.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhaseOneView;
