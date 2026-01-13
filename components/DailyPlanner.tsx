
import React, { useState, useEffect, useMemo } from 'react';
import { getModuleReflection } from '../geminiService';
import ModuleReflection from './ModuleReflection';
import { TimeSlot } from '../types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const CATEGORIES = {
  rest: { label: 'Rest', icon: '😴', color: 'bg-slate-100 text-slate-700', active: 'bg-slate-600 text-white' },
  recovery: { label: 'Recovery', icon: '🧘', color: 'bg-teal-50 text-teal-700', active: 'bg-teal-600 text-white' },
  nutrition: { label: 'Food', icon: '🥗', color: 'bg-emerald-50 text-emerald-700', active: 'bg-emerald-600 text-white' },
  work: { label: 'Goals', icon: '🏗️', color: 'bg-amber-50 text-amber-700', active: 'bg-amber-600 text-white' },
  social: { label: 'People', icon: '🤝', color: 'bg-indigo-50 text-indigo-700', active: 'bg-indigo-600 text-white' },
  leisure: { label: 'Fun', icon: '🎨', color: 'bg-sky-50 text-sky-700', active: 'bg-sky-600 text-white' },
};

const DEFAULT_SCHEDULE: TimeSlot[] = [
  { id: '1', time: '07:00', activity: 'Morning Meditation', category: 'recovery' },
  { id: '2', time: '08:00', activity: 'Healthy Breakfast', category: 'nutrition' },
  { id: '3', time: '09:00', activity: 'Work / Major Objective', category: 'work' },
  { id: '4', time: '12:30', activity: 'Lunch & Fresh Air', category: 'nutrition' },
  { id: '5', time: '17:30', activity: 'Recovery Meeting', category: 'recovery' },
  { id: '6', time: '21:30', activity: 'Journaling & Sleep Prep', category: 'rest' },
];

interface DailyPlannerProps {
  onExit: (rating?: number, reflection?: string, artUrl?: string) => void;
  onAskGuide?: () => void;
}

const DailyPlanner: React.FC<DailyPlannerProps> = ({ onExit, onAskGuide }) => {
  const [activeDay, setActiveDay] = useState(DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);
  const [fullWeekSchedule, setFullWeekSchedule] = useState<Record<string, TimeSlot[]>>(() => {
    const saved = localStorage.getItem('recovery_planner_weekly_v1');
    if (saved) return JSON.parse(saved);
    
    const initial: Record<string, TimeSlot[]> = {};
    DAYS.forEach(day => initial[day] = [...DEFAULT_SCHEDULE]);
    return initial;
  });

  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const [isListening, setIsListening] = useState<number | null>(null);
  const [reflection, setReflection] = useState('');
  const [showReflection, setShowReflection] = useState(false);

  useEffect(() => {
    localStorage.setItem('recovery_planner_weekly_v1', JSON.stringify(fullWeekSchedule));
  }, [fullWeekSchedule]);

  const currentSchedule = useMemo(() => fullWeekSchedule[activeDay] || [], [fullWeekSchedule, activeDay]);

  const requestNotificationPermission = async () => {
    if (typeof Notification === 'undefined') return;
    const permission = await Notification.requestPermission();
    setNotificationStatus(permission);
    if (permission === 'granted') {
      new Notification("Footpath Protocol Initialised", {
        body: "I will now notify you of your scheduled recovery commitments.",
        icon: "https://cdn-icons-png.flaticon.com/192/3209/3209949.png"
      });
    }
  };

  const toggleListening = (index: number) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening === index) {
      setIsListening(null);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-GB';
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(index);
    recognition.onend = () => setIsListening(null);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      updateActivity(index, transcript);
    };
    recognition.start();
  };

  const updateActivity = (index: number, val: string) => {
    const newDaySchedule = [...currentSchedule];
    newDaySchedule[index].activity = val;
    setFullWeekSchedule({ ...fullWeekSchedule, [activeDay]: newDaySchedule });
  };

  const updateCategory = (index: number, cat: TimeSlot['category']) => {
    const newDaySchedule = [...currentSchedule];
    newDaySchedule[index].category = cat;
    setFullWeekSchedule({ ...fullWeekSchedule, [activeDay]: newDaySchedule });
  };

  const addSlot = () => {
    const newDaySchedule = [
      ...currentSchedule, 
      { id: Date.now().toString(), time: '12:00', activity: '', category: 'recovery' } as TimeSlot
    ].sort((a, b) => a.time.localeCompare(b.time));
    setFullWeekSchedule({ ...fullWeekSchedule, [activeDay]: newDaySchedule });
  };

  const removeSlot = (index: number) => {
    const newDaySchedule = currentSchedule.filter((_, i) => i !== index);
    setFullWeekSchedule({ ...fullWeekSchedule, [activeDay]: newDaySchedule });
  };

  const handleFinish = async () => {
    // Fix: Explicitly type the reduce parameters 'acc' and 'curr' to avoid 'unknown' type error on curr.length (line 116)
    const totalSlots = Object.values(fullWeekSchedule).reduce((acc: number, curr: TimeSlot[]) => acc + curr.length, 0);
    const res = await getModuleReflection(
      "Weekly Routine Architect", 
      `User structured their entire week with ${totalSlots} total slots across 7 days. Current active day: ${activeDay}.`
    );
    setReflection(res);
    setShowReflection(true);
  };

  const copyScheduleToAll = () => {
    if (!confirm(`This will copy your ${activeDay} schedule to every other day. Continue?`)) return;
    const newWeek: Record<string, TimeSlot[]> = {};
    DAYS.forEach(day => {
      newWeek[day] = currentSchedule.map(slot => ({ ...slot, id: `${day}-${slot.id}` }));
    });
    setFullWeekSchedule(newWeek);
  };

  if (showReflection) return <ModuleReflection moduleName="Weekly Routine Architect" context="Weekly structure finalized." reflection={reflection} onClose={(r, refl, art) => onExit(r, refl, art)} title="Master Schedule Solidified" />;

  return (
    <div className="max-w-3xl mx-auto space-y-6 md:space-y-10 animate-in fade-in duration-700 pb-32 px-2">
      {/* Header & Notification Control */}
      <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 dark:bg-teal-900/10 rounded-full -mr-32 -mt-32 opacity-30 group-hover:scale-110 transition-transform duration-[3000ms]" />
        
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
               <div className="flex items-center gap-3 mb-1">
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-ping" />
                  <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Week Architect</h2>
               </div>
               <p className="text-slate-500 dark:text-slate-400 font-bold text-sm italic">Designing a predictable path for the True-Self.</p>
            </div>
            <div className="flex gap-3">
              {notificationStatus !== 'granted' && (
                <button 
                  onClick={requestNotificationPermission}
                  className="px-6 py-3 bg-amber-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all flex items-center gap-2"
                >
                  🔔 Enable Notifications
                </button>
              )}
              {onAskGuide && (
                <button 
                  onClick={() => onAskGuide()}
                  className="px-6 py-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800 shadow-sm transition-all hover:scale-105"
                >
                  Consult Guide
                </button>
              )}
            </div>
          </div>

          {/* Week Selector Tabs */}
          <div className="flex overflow-x-auto no-scrollbar gap-2 py-2 -mx-4 px-4 snap-x">
            {DAYS.map((day) => (
              <button
                key={day}
                onClick={() => {
                  if ('vibrate' in navigator) navigator.vibrate(5);
                  setActiveDay(day);
                }}
                className={`flex-shrink-0 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all snap-center ${
                  activeDay === day 
                    ? 'bg-teal-600 text-white shadow-xl scale-105' 
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border border-slate-100 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {day.substring(0, 3)}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/30 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Quick Actions for {activeDay}</span>
             <div className="flex gap-2">
                <button onClick={addSlot} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[9px] font-black uppercase text-teal-600 hover:bg-teal-50 transition-all">+ Add Slot</button>
                <button onClick={copyScheduleToAll} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[9px] font-black uppercase text-indigo-600 hover:bg-indigo-50 transition-all">Copy to All Days</button>
             </div>
          </div>
        </div>
      </div>

      {/* The Day's Timeline */}
      <div className="space-y-4 px-1">
        {currentSchedule.length === 0 ? (
          <div className="py-20 text-center space-y-4 opacity-40">
             <span className="text-6xl">🗓️</span>
             <p className="text-slate-500 font-black uppercase tracking-widest text-xs">No tasks for {activeDay}.</p>
          </div>
        ) : (
          currentSchedule.map((slot, idx) => (
            <div key={slot.id} className="flex gap-4 group animate-in slide-in-from-right-4" style={{ animationDelay: `${idx * 40}ms` }}>
              {/* Time Input */}
              <div className="flex flex-col items-center w-16 shrink-0 pt-2">
                <input 
                  type="time" 
                  value={slot.time} 
                  onChange={(e) => {
                     const ns = [...currentSchedule];
                     ns[idx].time = e.target.value;
                     setFullWeekSchedule({ ...fullWeekSchedule, [activeDay]: ns.sort((a,b) => a.time.localeCompare(b.time)) });
                  }}
                  className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-[11px] font-black text-slate-700 dark:text-slate-300 p-2 w-full text-center focus:ring-4 focus:ring-teal-500/10 shadow-sm outline-none"
                />
                <div className="w-0.5 h-full bg-slate-100 dark:bg-slate-800 mt-2 rounded-full min-h-[40px]"></div>
              </div>

              {/* Activity Card */}
              <div className="flex-grow bg-white dark:bg-slate-900 rounded-[32px] p-6 border-2 border-slate-100 dark:border-slate-800 hover:border-teal-500/30 transition-all shadow-sm group-hover:shadow-xl relative overflow-hidden">
                 <div className="flex flex-wrap gap-2 mb-4">
                    {(Object.entries(CATEGORIES) as [keyof typeof CATEGORIES, any][]).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => updateCategory(idx, key)}
                        className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                          slot.category === key ? config.active : `${config.color} dark:bg-slate-800 dark:text-slate-500 opacity-50`
                        }`}
                      >
                        {config.icon} <span className="ml-1">{config.label}</span>
                      </button>
                    ))}
                    <button 
                      onClick={() => removeSlot(idx)}
                      className="ml-auto p-2 text-slate-200 hover:text-rose-500 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                 </div>
                 
                 <div className="relative">
                    <input 
                      value={slot.activity}
                      onChange={(e) => updateActivity(idx, e.target.value)}
                      placeholder="Commit to an action..."
                      className="w-full bg-transparent border-none text-slate-900 dark:text-white text-xl font-bold placeholder:text-slate-200 dark:placeholder:text-slate-700 focus:ring-0"
                    />
                    <button
                      onClick={() => toggleListening(idx)}
                      className={`absolute right-0 top-1/2 -translate-y-1/2 p-3 rounded-2xl transition-all ${
                        isListening === idx ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-300 dark:text-slate-700 hover:text-teal-600'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 006 0V5a3 3 0 00-3-3z" /></svg>
                    </button>
                 </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pt-10 flex flex-col gap-4">
        <button 
          onClick={handleFinish}
          className="w-full py-6 bg-teal-600 text-white font-black rounded-3xl shadow-xl shadow-teal-600/30 hover:bg-teal-700 transition-all active:scale-[0.98] uppercase tracking-[0.4em] text-xs flex items-center justify-center gap-3"
        >
          <span>🏁</span> Finalise Full Week Protocol
        </button>
        <p className="text-center text-slate-400 font-black uppercase text-[9px] tracking-widest">
          The brain loves a roadmap. You have just built a shield against impulse.
        </p>
      </div>

      {/* Global Notification Logic Inject (Simple periodic check) */}
      <NotificationChecker schedules={fullWeekSchedule} activeDay={activeDay} />
    </div>
  );
};

/**
 * A background component to check for upcoming events
 */
const NotificationChecker: React.FC<{ schedules: Record<string, TimeSlot[]>, activeDay: string }> = ({ schedules, activeDay }) => {
  useEffect(() => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

    const checkInterval = setInterval(() => {
      const now = new Date();
      const currentDay = DAYS[now.getDay() === 0 ? 6 : now.getDay() - 1];
      const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      
      const daySchedule = schedules[currentDay] || [];
      const match = daySchedule.find(slot => slot.time === currentTime && slot.activity.trim() !== '');

      if (match) {
        // Prevent spam by checking if we already notified for this today
        const lastNotifiedKey = `notified_${currentDay}_${match.id}_${currentTime}`;
        if (!sessionStorage.getItem(lastNotifiedKey)) {
          new Notification(`Footpath Commitment: ${CATEGORIES[match.category].label}`, {
            body: `It is time for: ${match.activity}`,
            icon: "https://cdn-icons-png.flaticon.com/192/3209/3209949.png",
            tag: match.id,
            requireInteraction: true
          });
          sessionStorage.setItem(lastNotifiedKey, 'true');
        }
      }
    }, 30000); // Check every 30s

    return () => clearInterval(checkInterval);
  }, [schedules]);

  return null;
};

export default DailyPlanner;
