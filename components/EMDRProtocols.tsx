
import React, { useState, useEffect } from 'react';
import ModuleReflection from './ModuleReflection';

interface EMDRProtocolsProps {
  onExit: (rating?: number) => void;
  onAskGuide?: () => void;
}

const EMDRProtocols: React.FC<EMDRProtocolsProps> = ({ onExit, onAskGuide }) => {
  const [activeTab, setActiveTab] = useState<'butterfly' | 'spiral' | 'light'>('butterfly');
  const [isTapping, setIsTapping] = useState(false);
  const [tapSide, setTapSide] = useState<'left' | 'right'>('left');
  const [showReflection, setShowReflection] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isTapping) {
      interval = setInterval(() => {
        setTapSide(s => s === 'left' ? 'right' : 'left');
      }, 750); 
    }
    return () => clearInterval(interval);
  }, [isTapping]);

  if (showReflection) {
    return (
      <ModuleReflection 
        moduleName="EMDR Protocols"
        context={`User completed an EMDR session using the ${activeTab} technique.`}
        onClose={onExit}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700 pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Neural Reprocessing</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-lg leading-relaxed">Bilateral stimulation for trauma resolution.</p>
        </div>
        <div className="flex gap-3">
          {onAskGuide && (
            <button 
              onClick={onAskGuide}
              className="px-4 py-2 bg-slate-800 text-teal-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-700 shadow-sm hover:scale-105 transition-all"
            >
              Ask Guide
            </button>
          )}
          <button onClick={() => onExit()} className="px-4 py-2 bg-slate-800 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-700 shadow-sm">Terminate</button>
        </div>
      </div>

      <div className="flex bg-slate-950 p-2 rounded-[32px] w-fit mx-auto border-2 border-slate-900 shadow-2xl">
        {[
          { id: 'butterfly', label: 'Butterfly Hug', icon: '🦋' },
          { id: 'spiral', label: 'Spiral Protocol', icon: '🌀' },
          { id: 'light', label: 'Light Stream', icon: '✨' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setIsTapping(false); }}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === tab.id ? 'bg-teal-600 text-white shadow-xl scale-105' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'butterfly' && (
        <div className="bg-slate-900 rounded-[60px] p-8 md:p-20 border-2 border-slate-800 shadow-2xl text-center space-y-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full -mr-48 -mt-48 blur-[100px] pointer-events-none" />
          
          <div className="max-w-xl mx-auto space-y-8 relative z-10">
            <div className="space-y-4">
               <h3 className="text-3xl font-black text-white tracking-tight">The Butterfly Wing</h3>
               <p className="text-slate-400 text-lg leading-relaxed font-medium">Cross your arms, resting palms on opposite shoulders. You are creating your own container for reprocessing.</p>
            </div>
            
            <div className="flex justify-center items-center h-64 gap-10">
              <div className={`w-40 h-40 rounded-[48px] transition-all duration-700 flex items-center justify-center text-6xl shadow-2xl border-4 ${isTapping && tapSide === 'left' ? 'bg-teal-600 border-teal-400 text-white scale-110 shadow-teal-500/40' : 'bg-slate-950 border-slate-800 text-slate-800 grayscale'}`}>
                🦋
              </div>
              <div className={`w-40 h-40 rounded-[48px] transition-all duration-700 flex items-center justify-center text-6xl shadow-2xl border-4 ${isTapping && tapSide === 'right' ? 'bg-teal-600 border-teal-400 text-white scale-110 shadow-teal-500/40' : 'bg-slate-950 border-slate-800 text-slate-800 grayscale'}`}>
                🦋
              </div>
            </div>

            <button 
              onClick={() => setIsTapping(!isTapping)}
              className={`w-full py-6 rounded-3xl font-black text-sm uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-95 ${isTapping ? 'bg-rose-600 text-white shadow-rose-600/20' : 'bg-teal-600 text-white shadow-teal-600/30 hover:bg-teal-700'}`}
            >
              {isTapping ? 'Stop Rhythm' : 'Initiate Bilateral Sync'}
            </button>

            {!isTapping && (
               <button 
                 onClick={() => setShowReflection(true)}
                 className="w-full py-4 text-teal-400 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors"
               >
                 Complete Session & Get Feedback
               </button>
            )}

            <div className="bg-slate-950 p-8 rounded-[40px] border border-white/5 text-left shadow-inner">
              <span className="text-[10px] font-black text-teal-500 uppercase tracking-widest block mb-3">Protocol Narrative</span>
              <p className="text-sm text-slate-400 leading-relaxed font-bold italic">"Alternate tapping lightly. Take slow breaths. Observe the distressing memory as if it were a landscape seen through a moving train window."</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'spiral' && (
        <div className="bg-slate-900 rounded-[60px] p-8 md:p-20 border-2 border-slate-800 shadow-2xl space-y-12 text-center animate-in zoom-in-95">
          <h3 className="text-3xl font-black text-white tracking-tight">The Reverse Spiral</h3>
          <div className="relative w-64 h-64 mx-auto group">
             <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-3xl animate-pulse" />
             <div className="w-full h-full border-8 border-teal-900/50 rounded-full flex items-center justify-center relative z-10 bg-slate-950 shadow-inner">
                <div className="w-[90%] h-[90%] border-t-8 border-teal-500 rounded-full animate-[spin_3s_linear_infinite]" />
                <span className="absolute text-7xl drop-shadow-2xl">🌀</span>
             </div>
          </div>
          <div className="max-w-md mx-auto space-y-4">
            {[
              "Locate the physical sensation of the trauma.",
              "If it were a spiral, which way is it moving?",
              "Gently use your mind to reverse that direction.",
              "Notice the shift in density and intensity."
            ].map((step, i) => (
              <div key={i} className="flex gap-4 items-center p-4 bg-slate-950 rounded-2xl border border-white/5 text-left">
                <span className="font-black text-teal-600 text-xs">{i+1}</span>
                <p className="text-sm font-bold text-slate-300">{step}</p>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setShowReflection(true)}
            className="w-full py-6 bg-teal-600 text-white font-black rounded-3xl shadow-xl hover:bg-teal-700 transition-all uppercase tracking-widest text-xs"
          >
            Complete Reprocessing
          </button>
        </div>
      )}

      {activeTab === 'light' && (
        <div className="bg-slate-900 rounded-[60px] p-8 md:p-20 border-2 border-slate-800 shadow-2xl space-y-12 text-center relative overflow-hidden">
           <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-teal-500 via-sky-500 to-indigo-500 opacity-80" />
           <h3 className="text-3xl font-black text-white tracking-tight">Light Stream Visualisation</h3>
           <div className="max-w-2xl mx-auto space-y-10 text-left">
              <p className="text-slate-300 text-2xl font-bold leading-relaxed italic border-l-4 border-teal-500 pl-8">
                "Envision a beam of healing light entering through the crown of your head, directed from the source of your True-Self..."
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 bg-slate-950 rounded-[40px] border border-white/5 shadow-inner">
                  <h4 className="font-black text-teal-500 text-[10px] uppercase tracking-widest mb-2">Saturation</h4>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">Imagine the light saturating the densest parts of the emotional block within your body.</p>
                </div>
                <div className="p-8 bg-slate-950 rounded-[40px] border border-white/5 shadow-inner">
                  <h4 className="font-black text-teal-500 text-[10px] uppercase tracking-widest mb-2">Transmutation</h4>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">Observe as the light turns the density into a fluid, manageable energy that flows out of your system.</p>
                </div>
              </div>
           </div>
           <button onClick={() => setShowReflection(true)} className="px-12 py-5 bg-teal-600 text-white font-black rounded-3xl shadow-xl hover:bg-teal-700 transition-all uppercase tracking-widest text-xs">Integrate Reprocessing</button>
        </div>
      )}
    </div>
  );
};

export default EMDRProtocols;
