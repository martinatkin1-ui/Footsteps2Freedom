import React, { useState, useEffect, useRef } from 'react';
import { MoodEntry, TimeSlot } from '../types';
import { MOOD_CONFIG } from '../constants.tsx';
import SpeakButton from './SpeakButton';

interface MoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (mood: MoodEntry) => void;
}

const MoodModal: React.FC<MoodModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [selectedMood, setSelectedMood] = useState<MoodEntry['mood']>('good');
  const [moodNote, setMoodNote] = useState('');
  const [associatedActivity, setAssociatedActivity] = useState<string>('');
  const [plannerSlots, setPlannerSlots] = useState<TimeSlot[]>([]);
  const [isListening, setIsListening] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('recovery_planner_v2');
      if (saved) {
        setPlannerSlots(JSON.parse(saved));
      }
      setSelectedMood('good');
      setMoodNote('');
      setAssociatedActivity('');
      
      const timer = setTimeout(() => {
        modalRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-GB';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setMoodNote(prev => prev ? `${prev} ${transcript}` : transcript);
    };
    recognition.start();
  };

  const handleSubmit = () => {
    onSubmit({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      mood: selectedMood,
      note: moodNote,
      associatedActivity: associatedActivity || undefined
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mood-modal-title"
      ref={modalRef}
      tabIndex={-1}
    >
      <div className="bg-white rounded-[40px] p-8 md:p-10 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 overflow-y-auto max-h-[90vh] outline-none">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-slate-900" id="mood-modal-title">Internal Weather Report</h2>
          <SpeakButton text="Internal Weather Report. Select your current mood. This check in builds the foundation of your self awareness." />
        </div>
        
        <div className="flex justify-between mb-10" role="radiogroup" aria-labelledby="mood-label">
          <span id="mood-label" className="sr-only">Select your current internal mood state</span>
          {(Object.keys(MOOD_CONFIG) as Array<keyof typeof MOOD_CONFIG>).map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMood(m)}
              aria-checked={selectedMood === m}
              role="radio"
              aria-label={MOOD_CONFIG[m].label}
              className={`flex flex-col items-center gap-3 p-4 rounded-3xl transition-all focus-visible:ring-4 focus-visible:ring-teal-500 outline-none ${
                selectedMood === m ? 'bg-teal-50 scale-110 shadow-lg ring-2 ring-teal-500/20' : 'opacity-100 hover:opacity-100'
              }`}
            >
              <span className={`text-2xl ${MOOD_CONFIG[m].textColor}`} aria-hidden="true">{MOOD_CONFIG[m].icon}</span>
              <span className={`text-[11px] font-black uppercase tracking-widest ${selectedMood === m ? 'text-teal-700' : 'text-slate-400'}`}>{MOOD_CONFIG[m].label}</span>
            </button>
          ))}
        </div>

        {plannerSlots.length > 0 && (
          <div className="mb-8 space-y-3">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2" id="activity-linker-label">What were you doing? (Optional)</h4>
            <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2" role="listbox" aria-labelledby="activity-linker-label">
               {plannerSlots.map((slot, i) => (
                 <button
                    key={i}
                    onClick={() => setAssociatedActivity(associatedActivity === slot.activity ? '' : slot.activity)}
                    role="option"
                    aria-selected={associatedActivity === slot.activity}
                    className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all border-2 focus-visible:ring-2 focus-visible:ring-teal-500 outline-none ${
                      associatedActivity === slot.activity 
                        ? 'bg-teal-600 border-teal-600 text-white shadow-md' 
                        : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200'
                    }`}
                 >
                   {slot.activity}
                 </button>
               ))}
            </div>
          </div>
        )}

        <div className="space-y-2 mb-8 relative">
          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2" htmlFor="mood-note-input">
            Contribution (Optional)
          </label>
          <div className="relative group">
            <textarea
                id="mood-note-input"
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                placeholder={isListening ? "Listening deeply..." : "What's contributing to this weather?"}
                className={`w-full bg-slate-50 rounded-3xl p-6 border-2 h-32 resize-none transition-all placeholder:text-slate-400 font-medium focus:outline-none focus:ring-4 focus:ring-teal-500/20 ${isListening ? 'border-teal-400 ring-4 ring-teal-50' : 'border-transparent focus:border-teal-500/30'}`}
              />
              <button
                onClick={toggleListening}
                className={`absolute bottom-3 right-3 p-3 rounded-2xl transition-all shadow-lg focus-visible:ring-2 focus-visible:ring-teal-500 outline-none ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-white text-teal-600 hover:bg-teal-50 shadow-teal-500/10'}`}
                title="Dictate note"
                aria-label="Dictate mood note"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 005.93 6.93V17H7a1 1 0 100 2h6a1 1 0 100-2h-1.93v-2.07z" clipRule="evenodd" />
                </svg>
              </button>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={onClose} 
            className="flex-1 py-4 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-300 outline-none border border-slate-100"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            className="flex-1 py-4 bg-teal-600 text-white font-black rounded-2xl shadow-xl hover:bg-teal-700 focus-visible:ring-4 focus-visible:ring-teal-500 outline-none uppercase text-xs tracking-widest"
          >
            Log Pulse
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoodModal;