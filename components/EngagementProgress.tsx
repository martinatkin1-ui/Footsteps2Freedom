
import React, { useMemo } from 'react';
import { MoodEntry, Goal, CompletedLesson } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import SpeakButton from './SpeakButton';

interface EngagementProgressProps {
  moods: MoodEntry[];
  goals: Goal[];
  completedLessons: CompletedLesson[];
  startDate: string;
  theme: 'light' | 'dark';
}

const EngagementProgress: React.FC<EngagementProgressProps> = ({ moods, goals, completedLessons, startDate, theme }) => {
  const stats = useMemo(() => {
    const start = new Date(startDate).getTime();
    const now = new Date().getTime();
    const days = Math.max(1, Math.ceil((now - start) / (1000 * 60 * 60 * 24)));

    const moodFrequency = Math.min(100, Math.round((moods.length / days) * 100));
    const goalMastery = goals.length > 0 
      ? Math.round((goals.filter(g => g.isCompleted).length / goals.length) * 100) 
      : 0;
    const exerciseVariety = new Set(completedLessons.map(l => l.exerciseId)).size;

    // Calculate activity over the last 7 days for the sparkline
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toDateString();
      const count = moods.filter(m => new Date(m.date).toDateString() === dayStr).length +
                    completedLessons.filter(l => new Date(l.date).toDateString() === dayStr).length;
      return { day: dayStr.split(' ')[0], value: count };
    }).reverse();

    return { moodFrequency, goalMastery, exerciseVariety, last7Days, days };
  }, [moods, goals, completedLessons, startDate]);

  const summaryText = `Your engagement protocol is operating at ${stats.moodFrequency}% consistency. You have secured ${stats.exerciseVariety} unique therapeutic landmarks and reached ${goals.filter(g => g.isCompleted).length} strategic markers.`;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[56px] p-8 md:p-10 border border-slate-100 dark:border-slate-800 shadow-2xl relative overflow-hidden h-full flex flex-col group">
      <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/5 rounded-full -mr-24 -mt-24 blur-3xl group-hover:scale-150 transition-transform duration-[4000ms]" />
      
      <div className="relative z-10 space-y-6 flex-grow">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Engagement Pulse</h3>
            <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Growth Analytics</p>
          </div>
          <SpeakButton text={summaryText} size={14} className="bg-teal-50 dark:bg-teal-900/30 text-teal-600" />
        </div>

        {/* Sparkline of recent activity */}
        <div className="h-24 w-full opacity-80 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.last7Days}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              <XAxis dataKey="day" hide />
              <YAxis hide domain={[0, 'dataMax + 2']} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 'bold' }}
                itemStyle={{ color: '#0d9488' }}
                cursor={{ stroke: '#0d9488', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Consistency</span>
            <p className="text-3xl font-black text-teal-600 tabular-nums">{stats.moodFrequency}%</p>
            <p className="text-[8px] font-bold text-slate-500 italic mt-1">Check-in Frequency</p>
          </div>
          <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tool Variety</span>
            <p className="text-3xl font-black text-indigo-600 tabular-nums">{stats.exerciseVariety}</p>
            <p className="text-[8px] font-bold text-slate-500 italic mt-1">Unique Landmarks</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-50 dark:border-slate-800">
          <div className="flex justify-between items-end mb-2 px-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Goal Mastery</span>
            <span className="text-sm font-black text-slate-900 dark:text-white tabular-nums">{stats.goalMastery}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(79,70,229,0.3)]" 
              style={{ width: `${stats.goalMastery}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngagementProgress;
