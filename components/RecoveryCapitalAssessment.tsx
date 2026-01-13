
import React, { useState } from 'react';
import { RecoveryCapital } from '../types';
import { useRecoveryStore } from '../store';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import ModuleReflection from './ModuleReflection';
import SpeakButton from './SpeakButton';

const DOMAINS = [
  { id: 'housing', label: 'Safe Housing', icon: '🏠' },
  { id: 'social', label: 'Social Support', icon: '🤝' },
  { id: 'physical', label: 'Physical Health', icon: '🍎' },
  { id: 'human', label: 'Mental Health', icon: '🧠' },
  { id: 'community', label: 'Community', icon: '🔥' },
  { id: 'work', label: 'Meaningful Work', icon: '🏗️' },
  { id: 'financial', label: 'Financial Security', icon: '💷' },
  { id: 'lifeSkills', label: 'Life Skills', icon: '🛠️' },
  { id: 'legal', label: 'Legal Stability', icon: '⚖️' },
  { id: 'relationships', label: 'Relationships', icon: '💖' }
];

const RecoveryCapitalAssessment: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const store = useRecoveryStore();
  const [showReflection, setShowReflection] = useState(false);
  const [scores, setScores] = useState<RecoveryCapital>(store.recoveryCapital || {
    housing: 5, social: 5, physical: 5, human: 5, community: 5, work: 5, financial: 5, lifeSkills: 5, legal: 5, relationships: 5,
    lastUpdated: new Date().toISOString()
  });

  const chartData = DOMAINS.map(d => ({
    subject: d.label,
    A: scores[d.id as keyof RecoveryCapital] as number,
    fullMark: 10
  }));

  const handleUpdate = (domain: keyof RecoveryCapital, val: number) => {
    setScores(prev => ({ ...prev, [domain]: val }));
  };

  const handleSave = () => {
    store.updateRecoveryCapital({ ...scores, lastUpdated: new Date().toISOString() });
    setShowReflection(true);
  };

  if (showReflection) {
    const totalScore = Object.values(scores)
      .filter(v => typeof v === 'number')
      .reduce((a, b) => (a as number) + (b as number), 0);
    
    return (
      <ModuleReflection 
        moduleName="Recovery Capital Assessment"
        title="Growth Map Synthesis"
        context={`User completed a resource assessment. Total Score: ${totalScore}/100. Specific strengths identified in domains with high scores. Low score domains indicate areas for expedition focus.`}
        onClose={onExit}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20 px-4">
      <div className="flex justify-between items-center px-4">
        <div>
           <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Recovery Capital</h2>
           <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px]">Measuring Growth Capacity</p>
        </div>
        <button onClick={onExit} className="text-slate-400 font-black hover:text-slate-600 transition-colors">Close</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Chart View */}
        <div className="bg-white dark:bg-slate-900 rounded-[48px] p-10 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col items-center">
           <h3 className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-8">Evolution Radar</h3>
           <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid stroke={store.theme === 'dark' ? '#1e293b' : '#f1f5f9'} />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8, fontWeight: 900, fill: '#64748b' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} hide />
                  <Radar name="Capital" dataKey="A" stroke="#0d9488" fill="#0d9488" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
           </div>
           <div className="flex flex-col items-center gap-3 mt-8">
             <p className="text-slate-500 text-xs text-center leading-relaxed italic max-w-sm">
               "Recovery Capital is the sum of resources that sustain your freedom. Focus on growing the areas with smaller scores."
             </p>
             <SpeakButton text="Recovery Capital is the sum of resources that sustain your freedom. Focus on growing the areas with smaller scores to ensure your expedition is well-supplied for the higher peaks." size={12} />
           </div>
        </div>

        {/* Assessment Form */}
        <div className="space-y-6">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto max-h-[70vh] no-scrollbar pr-2">
              {DOMAINS.map(d => (
                <div key={d.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800 shadow-sm space-y-4 transition-all hover:border-teal-500/30 group">
                   <div className="flex justify-between items-center">
                      <span className="text-2xl">{d.icon}</span>
                      <span className="text-lg font-black text-teal-600">{scores[d.id as keyof RecoveryCapital] as number}/10</span>
                   </div>
                   <div className="flex items-center justify-between">
                    <h4 className="font-black text-xs text-slate-800 dark:text-slate-200 uppercase tracking-widest">{d.label}</h4>
                    <SpeakButton text={d.label + ". Current rating is " + scores[d.id as keyof RecoveryCapital] + " out of 10."} size={8} className="opacity-0 group-hover:opacity-100" />
                   </div>
                   <input 
                      type="range" min="1" max="10" 
                      value={scores[d.id as keyof RecoveryCapital] as number}
                      onChange={(e) => handleUpdate(d.id as keyof RecoveryCapital, parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none accent-teal-600 cursor-pointer"
                   />
                </div>
              ))}
           </div>
           <button 
             onClick={handleSave}
             className="w-full py-5 bg-teal-600 text-white font-black rounded-2xl shadow-xl shadow-teal-600/30 hover:bg-teal-700 transition-all active:scale-[0.98] uppercase tracking-widest text-xs flex items-center justify-center gap-3"
           >
             <span>💾</span> Archive Assessment & Get Feedback
           </button>
        </div>
      </div>
    </div>
  );
};

export default RecoveryCapitalAssessment;
