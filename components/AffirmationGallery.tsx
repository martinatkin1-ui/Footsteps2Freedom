
import React, { useState } from 'react';
import ModuleReflection from './ModuleReflection';

const AFFIRMATIONS = [
  { text: "I am capable of handling whatever comes my way", icon: "🗿", color: "bg-sky-100 text-sky-800" },
  { text: "My possibilities are endless", icon: "☀️", color: "bg-stone-100 text-stone-800" },
  { text: "I am confident in my abilities", icon: "🌸", color: "bg-orange-50 text-orange-800" },
  { text: "I am deserving of love, respect, and happiness", icon: "💗", color: "bg-pink-50 text-pink-800" },
  { text: "I choose peace over worry and joy over fear", icon: "🌀", color: "bg-teal-50 text-teal-800" },
  { text: "Every day, I am becoming a better version of myself", icon: "🌿", color: "bg-orange-100 text-orange-900" },
  { text: "I am resilient, strong, and courageous", icon: "🌈", color: "bg-pink-100 text-pink-900" },
  { text: "My life is filled with abundance, and I am grateful", icon: "🌼", color: "bg-slate-200 text-slate-800" },
  { text: "I am a magnet for positive energy and experiences", icon: "✨", color: "bg-blue-50 text-blue-800" },
  { text: "I trust the process of my life's journey", icon: "🌈", color: "bg-lime-50 text-lime-800" },
  { text: "I believe in my dreams and pursue them with passion", icon: "💜", color: "bg-yellow-50 text-yellow-800" },
  { text: "I radiate beauty, grace, and strength", icon: "🌺", color: "bg-pink-200 text-pink-900" },
  { text: "I am in control of my thoughts, and I choose positivity", icon: "🧘", color: "bg-cyan-100 text-cyan-800" },
  { text: "I am worthy of success and accomplishments", icon: "⛰️", color: "bg-stone-200 text-stone-900" },
  { text: "My challenges help me grow and improve", icon: "🌳", color: "bg-orange-50 text-green-900" },
  { text: "I am surrounded by love and support", icon: "💕", color: "bg-purple-50 text-purple-800" },
  { text: "My heart is open, and I attract wonderful people", icon: "💖", color: "bg-emerald-50 text-emerald-800" },
  { text: "I am the architect of my life", icon: "🏛️", color: "bg-amber-100 text-amber-900" },
  { text: "I trust myself and my intuition", icon: "💠", color: "bg-rose-100 text-rose-800" },
  { text: "I am at peace with my past, present, and future", icon: "💝", color: "bg-slate-300 text-slate-900" }
];

interface AffirmationGalleryProps {
  onExit: (rating?: number) => void;
  onAskGuide?: () => void;
}

const AffirmationGallery: React.FC<AffirmationGalleryProps> = ({ onExit, onAskGuide }) => {
  const [index, setIndex] = useState(0);
  const [showReflection, setShowReflection] = useState(false);

  const next = () => setIndex((i) => (i + 1) % AFFIRMATIONS.length);
  const prev = () => setIndex((i) => (i - 1 + AFFIRMATIONS.length) % AFFIRMATIONS.length);

  const handleFinish = () => {
    setShowReflection(true);
  };

  if (showReflection) {
    return (
      <ModuleReflection 
        moduleName="Affirmation Deck" 
        context="User spent time reflecting on positive affirmations." 
        onClose={onExit} 
      />
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold text-slate-800">Affirmation Deck</h2>
          {onAskGuide && (
            <button 
              onClick={onAskGuide}
              className="mt-1 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[8px] font-black uppercase tracking-widest border border-indigo-100 shadow-sm transition-all hover:scale-105 active:scale-95 w-fit"
            >
              Need Clarity? Ask Guide
            </button>
          )}
        </div>
        <button onClick={() => onExit()} className="text-slate-400 font-bold hover:text-slate-600">Close</button>
      </div>

      <div className="relative aspect-[3/4] w-full max-w-sm mx-auto">
        <div className={`absolute inset-0 rounded-[40px] p-12 flex flex-col items-center justify-center text-center shadow-2xl border-4 border-white transition-all duration-700 ${AFFIRMATIONS[index].color}`}>
          <div className="text-7xl mb-12 animate-bounce">{AFFIRMATIONS[index].icon}</div>
          <p className="text-3xl font-bold leading-tight font-serif italic">
            "{AFFIRMATIONS[index].text}"
          </p>
          <div className="absolute bottom-10 text-[10px] font-bold uppercase tracking-widest opacity-40">
            Card {index + 1} of {AFFIRMATIONS.length}
          </div>
        </div>

        <button 
          onClick={prev}
          className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-400 hover:text-teal-600 transition-all active:scale-90"
        >
          ←
        </button>
        <button 
          onClick={next}
          className="absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-400 hover:text-teal-600 transition-all active:scale-90"
        >
          →
        </button>
      </div>

      <div className="text-center space-y-6">
          <p className="text-slate-400 text-sm">Take a breath. Let the words sink in.</p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => setIndex(Math.floor(Math.random() * AFFIRMATIONS.length))}
              className="text-teal-600 font-bold text-sm underline underline-offset-4"
            >
              Randomize Card
            </button>
            <button 
              onClick={handleFinish}
              className={`py-4 px-8 rounded-2xl font-bold transition-all bg-teal-600 text-white shadow-lg`}
            >
              Integrate Reflection
            </button>
          </div>
      </div>
    </div>
  );
};

export default AffirmationGallery;
