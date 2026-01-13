import React, { useEffect, useRef } from 'react';
import SpeakButton from './SpeakButton';

interface CrisisCardProps {
  isOpen: boolean;
  onClose: () => void;
  sponsorNumber?: string;
}

const CrisisCard: React.FC<CrisisCardProps> = ({ isOpen, onClose, sponsorNumber }) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    
    // Focus management
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 100);

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!focusableElements) return;
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const resources = [
    { title: "Emergency Services", number: "999", desc: "For immediate danger to life or medical emergencies.", color: "bg-rose-600" },
    { title: "NHS 111", number: "111", desc: "For urgent mental health support and non-emergencies.", color: "bg-blue-700" },
    { title: "Samaritans", number: "116 123", desc: "24/7 confidential listening service for anyone in distress.", color: "bg-indigo-600" },
    { title: "Shout", number: "85258", desc: "Text 'SHOUT' for free, 24/7 text-based crisis support.", color: "bg-slate-800" },
  ];

  const handleCall = (num: string) => {
    window.location.href = `tel:${num.replace(/\s/g, '')}`;
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300" role="dialog" aria-modal="true" aria-labelledby="crisis-title" ref={modalRef}>
      <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="bg-rose-600 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" aria-hidden="true"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3">
                <h2 id="crisis-title" className="text-3xl font-black tracking-tight leading-tight">Safety & Crisis Support</h2>
                <SpeakButton text="Safety and Crisis Support. You are not alone. Help is available 24/7 in the UK. This is a temporary storm. Your presence matters." />
              </div>
              <p className="text-rose-100 font-bold mt-2">You are not alone. Help is available 24/7 in the UK.</p>
            </div>
            <button 
              ref={closeButtonRef}
              onClick={onClose} 
              aria-label="Close safety hub"
              className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-rose-600 outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map((res) => (
              <button
                key={res.title}
                onClick={() => handleCall(res.number)}
                className="group p-6 rounded-3xl border-2 border-slate-100 hover:border-rose-200 hover:bg-rose-50 transition-all text-left flex flex-col justify-between h-full focus-visible:ring-2 focus-visible:ring-rose-500 outline-none relative"
                aria-label={`Call ${res.title} at ${res.number}`}
              >
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <SpeakButton text={res.desc} size={10} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 mb-1 text-base">{res.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4 font-medium">{res.desc}</p>
                </div>
                <div className={`mt-auto py-3 px-4 ${res.color} text-white text-center rounded-xl font-black text-[11px] uppercase tracking-widest transition-transform group-hover:scale-[1.02] group-active:scale-95`}>
                  CALL {res.number}
                </div>
              </button>
            ))}
          </div>

          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
            <h3 className="font-black text-slate-800 uppercase text-[11px] tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full" aria-hidden="true"></span> Your Recovery Network
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => sponsorNumber && handleCall(sponsorNumber)}
                disabled={!sponsorNumber}
                className="flex-1 py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-lg shadow-emerald-600/20 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none hover:bg-emerald-700 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none uppercase text-xs tracking-widest"
              >
                {sponsorNumber ? `Call Sponsor` : "No Sponsor Set"}
              </button>
              <button 
                onClick={onClose}
                className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl font-black text-xs hover:bg-slate-50 transition-all focus-visible:ring-2 focus-visible:ring-slate-500 outline-none uppercase tracking-widest"
              >
                Return to Path
              </button>
            </div>
          </div>

          <div className="text-center pt-4">
            <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.2em]">
              "This is a temporary storm. Your presence matters."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrisisCard;