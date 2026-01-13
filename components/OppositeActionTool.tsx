
import React, { useState } from 'react';
import ModuleReflection from './ModuleReflection';
import SpeakButton from './SpeakButton';

const OPPOSITE_CHART = [
  { emotion: 'Fear/Anxiety', urge: 'Flee or Avoid', opposite: 'Approach the trigger gently' },
  { emotion: 'Anger', urge: 'Attack or Shout', opposite: 'Gently avoid or be kind' },
  { emotion: 'Sadness/Depression', urge: 'Isolate and Withdraw', opposite: 'Be active and social' },
  { emotion: 'Shame', urge: 'Hide or Lie', opposite: 'Be open and transparent' },
  { emotion: 'Guilt', urge: 'Over-apologize or Hide', opposite: 'Make amends and stand tall' }
];

const CHALLENGES = [
  {
    scenario: "You feel profound shame about a minor relapse and want to hide in your room and block everyone.",
    options: [
      { label: "Journal about your failures", correct: false },
      { label: "Call a sponsor and be radically honest", correct: true, feedback: "Correct. The opposite of hiding is being seen. Shame dies in the light of connection." },
      { label: "Stay in bed and watch TV", correct: false }
    ],
    hint: "What is the literal opposite of hiding?"
  },
  {
    scenario: "You feel intense anger at a family member who criticized your recovery progress.",
    options: [
      { label: "Argue and explain why they are wrong", correct: false },
      { label: "Gently excuse yourself and wish them well", correct: true, feedback: "Correct. Anger's urge is to attack. The opposite is gentle restraint and kindness." },
      { label: "Write a long angry email then delete it", correct: false }
    ],
    hint: "Anger wants to fight. What action would lower the volume?"
  }
];

const OppositeActionTool: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [view, setView] = useState<'intro' | 'challenge' | 'reflection'>('intro');
  const [quizIdx, setQuizIdx] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleAnswer = (correct: boolean, f: string) => {
    if (correct) {
      setFeedback(f);
      setTimeout(() => {
        if (quizIdx < CHALLENGES.length - 1) {
          setQuizIdx(quizIdx + 1);
          setFeedback(null);
        } else {
          setView('reflection');
        }
      }, 3000);
    } else {
      setFeedback("That matches the urge. Try the literal opposite.");
    }
  };

  if (view === 'reflection') {
    return <ModuleReflection moduleName="Opposite Action" context="User mastered the Opposite Action challenge, identifying neural rewiring paths for shame and anger." onClose={onExit} />;
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in duration-1000 pb-32">
      <div className="bg-white dark:bg-slate-900 rounded-[60px] p-8 md:p-12 border-2 border-slate-100 dark:border-slate-800 shadow-2xl relative overflow-hidden group">
        {view === 'intro' ? (
          <div className="space-y-12">
            <header className="text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center text-4xl text-white shadow-xl mx-auto">🔄</div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Rewiring Your Reactions: Opposite Action</h2>
              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 text-left">
                <h3 className="text-sm font-black uppercase text-emerald-600 mb-2 tracking-widest">The 'Why'</h3>
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  Emotions trigger urges (depression = urge to isolate; anger = urge to attack). In addiction, acting on these urges often leads to relapse. Doing the literal opposite of the urge sends a signal to the brain that changes the emotion itself.
                </p>
              </div>
            </header>

            <div className="space-y-6">
               <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">The 'How' Chart:</h4>
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm border-collapse">
                    <thead>
                       <tr className="border-b-2 border-slate-100 dark:border-slate-800">
                          <th className="py-4 font-black uppercase text-xs text-slate-400">Emotion</th>
                          <th className="py-4 font-black uppercase text-xs text-slate-400">Urge</th>
                          <th className="py-4 font-black uppercase text-xs text-emerald-600">Opposite Action</th>
                       </tr>
                    </thead>
                    <tbody className="font-bold text-slate-700 dark:text-slate-300">
                       {OPPOSITE_CHART.map((row, i) => (
                         <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50">
                            <td className="py-4">{row.emotion}</td>
                            <td className="py-4">{row.urge}</td>
                            <td className="py-4 text-emerald-600 dark:text-emerald-400">{row.opposite}</td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
               </div>
            </div>

            <button 
              onClick={() => setView('challenge')}
              className="w-full py-6 bg-emerald-600 text-white font-black rounded-3xl shadow-xl hover:bg-emerald-700 transition-all uppercase tracking-widest text-xs"
            >
              Start Opposite Action Challenge
            </button>
          </div>
        ) : (
          <div className="space-y-12 relative z-10">
             <div className="flex justify-between items-center px-4">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em]">Neural Rewiring {quizIdx + 1}/2</span>
                <div className="flex gap-2">
                   <div className={`h-1.5 w-8 rounded-full ${quizIdx >= 0 ? 'bg-emerald-500' : 'bg-slate-100'}`} />
                   <div className={`h-1.5 w-8 rounded-full ${quizIdx >= 1 ? 'bg-emerald-500' : 'bg-slate-100'}`} />
                </div>
             </div>

             <div className="bg-slate-950 p-10 rounded-[50px] border border-white/10 shadow-inner">
                <p className="text-2xl md:text-3xl text-white font-black italic leading-tight text-center px-6">
                  "{CHALLENGES[quizIdx].scenario}"
                </p>
             </div>

             <div className="grid grid-cols-1 gap-4">
                {CHALLENGES[quizIdx].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(opt.correct, opt.feedback || '')}
                    className={`p-6 rounded-3xl border-2 transition-all font-black uppercase text-xs tracking-widest text-left flex items-center justify-between group ${
                      feedback && opt.correct ? 'bg-emerald-500 border-emerald-500 text-white' : 
                      'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:border-emerald-400'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span className="text-xl transition-transform group-hover:translate-x-2">→</span>
                  </button>
                ))}
             </div>

             {feedback && (
               <div className={`p-6 rounded-3xl text-center font-bold italic animate-in fade-in ${feedback.includes('Correct') ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                 "{feedback}"
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OppositeActionTool;
