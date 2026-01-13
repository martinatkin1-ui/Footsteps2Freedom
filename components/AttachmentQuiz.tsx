
import React, { useState } from 'react';
import ModuleReflection from './ModuleReflection';

const QUESTIONS = [
  "I fit in well with other people.",
  "I worry that people don't like me as much as I like them.",
  "I would like to trust others, but I worry that if I open up too much people might reject me.",
  "Sometimes others seem reluctant to get as close to me as I would like.",
  "I worry a lot about the well-being of my relationships.",
  "I feel scorched when a relationship takes too much time away from my personal pursuits.",
  "I worry about getting hurt if I allow myself to get too close to someone.",
  "I would like to have closer relationships but getting close makes me feel vulnerable.",
  "I tend not to take risks in relationships for fear of getting hurt or rejected.",
  "I rarely worry that I don't 'measure up' to other people.",
  "Achieving personal goals is more important to me than maintaining good relationships.",
  "I avoid getting too close to others so that I won't get hurt.",
  "I am confident that other people will like me.",
  "I worry that others do not care about me as much as I care about them.",
  "I wonder how I would cope without someone to love me.",
  "I rarely worry that others might reject me.",
  "Being independent is more important to me than having a good relationship.",
  "I am confident that others will accept me.",
  "I find it relatively easy to get close to people.",
  "Pleasing myself is much more important to me than getting along with others.",
  "I need relational partners to give me space to do 'my own thing.'",
  "I sometimes worry that my relational partners will leave me.",
  "It is easy for me to get along with others.",
  "I frequently pull away from relational partners when I need time to pursue my personal goals.",
  "I need be in a close relationship to be happy."
];

interface AttachmentQuizProps {
  onExit: (rating?: number) => void;
  onAskGuide?: () => void;
}

const AttachmentQuiz: React.FC<AttachmentQuizProps> = ({ onExit, onAskGuide }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<any>(null);
  const [showReflection, setShowReflection] = useState(false);

  const handleAnswer = (val: number) => {
    const newAnswers = [...answers, val];
    if (step < QUESTIONS.length - 1) {
      setAnswers(newAnswers);
      setStep(step + 1);
    } else {
      calculateScores(newAnswers);
    }
  };

  const calculateScores = (ans: number[]) => {
    const security = (ans[0] + ans[9] + ans[12] + ans[15] + ans[17] + ans[18] + ans[22]) / 7;
    const preoccupation = (ans[1] + ans[3] + ans[4] + ans[13] + ans[14] + ans[21] + ans[24]) / 7;
    const dismissiveness = (ans[5] + ans[10] + ans[16] + ans[19] + ans[20] + ans[23]) / 6;
    const fearful = (ans[2] + ans[6] + ans[7] + ans[8] + ans[11]) / 5;

    const scores = { security, preoccupation, dismissiveness, fearful };
    const dominant = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    
    setResult({ scores, dominant });
  };

  if (showReflection) {
    return (
      <ModuleReflection 
        moduleName="Attachment Quiz"
        context={`User completed attachment style quiz. Dominant style: ${result?.dominant}. Scores: ${JSON.stringify(result?.scores)}`}
        onClose={onExit}
      />
    );
  }

  if (result) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 animate-in zoom-in duration-500">
        <div className="bg-slate-900 rounded-[40px] p-10 border-2 border-slate-800 shadow-2xl text-center space-y-10">
          <h2 className="text-3xl font-black text-white tracking-tight">Relational Blueprint</h2>
          
          <div className="bg-teal-900/20 p-8 rounded-[32px] border-2 border-teal-900/50 shadow-inner">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-500 mb-2 block">Dominant Pattern</span>
            <h3 className="text-4xl font-black text-teal-400 capitalize mb-4 tracking-tighter">{result.dominant}</h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed italic">
              "Understanding your relational baseline allows you to intentionally bridge the gap between your 'attachment-self' and your 'True-Self'."
            </p>
          </div>

          <div className="space-y-6">
            {Object.entries(result.scores).map(([key, val]: [string, any]) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-end px-2">
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 capitalize">{key}</span>
                   <span className="text-sm font-black text-white tabular-nums">{val.toFixed(1)}/7.0</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.4)] transition-all duration-1000" style={{width: `${(val / 7) * 100}%`}}></div>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => setShowReflection(true)} 
            className="w-full py-6 bg-teal-600 text-white font-black rounded-3xl shadow-xl hover:bg-teal-700 active:scale-95 transition-all uppercase tracking-widest text-sm"
          >
            Consult Guide on Results
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-12 animate-in fade-in duration-700 pb-32">
      <div className="flex items-center justify-between px-4">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Attachment Logic</h2>
            <div className="flex items-center gap-3">
               <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Psychometric Mapping</p>
            </div>
          </div>
          <button onClick={() => onExit()} className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl border border-slate-200 dark:border-slate-700 transition-all hover:text-rose-500">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[48px] p-8 md:p-16 border-2 border-slate-100 dark:border-slate-800 shadow-xl space-y-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
        
        <div className="relative z-10">
           <div className="flex justify-between items-end mb-8 px-2">
              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.4em]">Node {step + 1} of {QUESTIONS.length}</span>
              <div className="flex gap-1">
                {QUESTIONS.map((_, i) => (
                  <div key={i} className={`h-1 w-2 rounded-full transition-all ${i <= step ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
                ))}
              </div>
           </div>
           
           <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight italic">
             "{QUESTIONS[step]}"
           </h3>
        </div>

        <div className="grid grid-cols-1 gap-3 relative z-10">
          {[1, 2, 3, 4, 5, 6, 7].map((val) => (
            <button
              key={val}
              onClick={() => handleAnswer(val)}
              className="w-full p-6 rounded-3xl border-2 border-slate-50 dark:border-slate-800 hover:border-indigo-400/50 hover:bg-indigo-50/5 dark:hover:bg-indigo-900/10 transition-all text-left flex items-center justify-between group active:scale-[0.99]"
            >
              <span className="text-slate-700 dark:text-slate-300 font-bold text-lg">
                {val === 1 ? 'Strongly Disagree' : val === 7 ? 'Strongly Agree' : `Score: ${val}`}
              </span>
              <span className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center font-black text-slate-200 dark:text-slate-700 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shadow-inner group-hover:scale-110 transition-all">{val}</span>
            </button>
          ))}
        </div>

        {onAskGuide && (
          <div className="pt-8 text-center relative z-10 border-t border-slate-50 dark:border-slate-800">
            <button 
              onClick={onAskGuide}
              className="text-slate-400 font-black text-[9px] uppercase tracking-widest hover:text-indigo-500 transition-colors"
            >
              Consult Guide on Relational Theory
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttachmentQuiz;
