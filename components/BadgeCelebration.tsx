import React from 'react';
import { Badge } from '../types';
import SocialShare from './SocialShare';
import SpeakButton from './SpeakButton';

interface BadgeCelebrationProps {
  badge: Badge | null;
  onClose: () => void;
}

const BadgeCelebration: React.FC<BadgeCelebrationProps> = ({ badge, onClose }) => {
  if (!badge) return null;

  return (
    <div 
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-500"
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebration-title"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-500/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-500/20 rounded-full blur-[100px] animate-pulse delay-700"></div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[50px] p-10 md:p-16 max-w-lg w-full shadow-2xl text-center relative overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-500 via-amber-500 to-indigo-500" aria-hidden="true"></div>
        
        <div className="relative z-10 space-y-8">
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-3">
              <span className="text-[10px] font-black text-teal-600 uppercase tracking-[0.4em]" id="celebration-subtitle">Achievement Unlocked</span>
              <SpeakButton text={"True-Self Evolution Unlocked! You earned the " + badge.title + " badge. " + badge.description} />
            </div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight" id="celebration-title">True-Self Evolution</h2>
          </div>

          <div className="relative" aria-hidden="true">
            <div className="w-32 h-32 bg-slate-50 dark:bg-slate-800 rounded-[40px] flex items-center justify-center text-6xl mx-auto shadow-inner relative z-10 animate-bounce">
              {badge.icon}
            </div>
            <div className="absolute inset-0 bg-teal-400/20 rounded-full blur-2xl scale-150 animate-pulse"></div>
          </div>

          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{badge.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic">
              "{badge.description}"
            </p>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <button
              onClick={onClose}
              autoFocus
              className="w-full py-5 bg-teal-600 text-white font-black rounded-2xl shadow-xl shadow-teal-600/30 hover:bg-teal-700 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-sm focus:ring-4 focus:ring-teal-50 focus:outline-none"
            >
              Continue My Journey
            </button>
            
            <SocialShare 
              title="True-Self Evolution Unlocked!"
              text={`I just earned the "${badge.title}" badge on my recovery journey! ${badge.description}`}
              variant="secondary"
            />

            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Earned on {new Date(badge.earnedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeCelebration;