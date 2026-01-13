
import React from 'react';

interface ErrorDisplayProps {
  error?: Error | string;
  resetErrorBoundary?: () => void;
  onHome?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, resetErrorBoundary, onHome }) => {
  const errorMessage = typeof error === 'string' ? error : error?.message;

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 animate-in fade-in duration-700">
      <div className="bg-white dark:bg-slate-900 rounded-[50px] p-10 md:p-16 max-w-xl w-full shadow-2xl text-center relative overflow-hidden border border-amber-100 dark:border-amber-900/40">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] -mt-32" />
        
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
             <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-3xl flex items-center justify-center text-4xl shadow-xl mx-auto transform rotate-3 shadow-amber-500/10">🌫️</div>
             <div className="space-y-1">
                <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.4em]">The Path is Obscured</span>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">Gently Finding Our Way Back</h2>
             </div>
          </div>

          <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-inner">
             <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed italic">
               "I've encountered a temporary obstacle in the digital landscape. Let's take a deep breath and return to familiar ground."
             </p>
             {errorMessage && (
               <p className="mt-4 text-[10px] font-mono text-slate-400 dark:text-slate-600 uppercase tracking-widest break-all">
                 Reference: {errorMessage}
               </p>
             )}
          </div>

          <div className="flex flex-col gap-3">
             <button 
               onClick={resetErrorBoundary || onHome}
               className="py-5 bg-teal-600 text-white font-black rounded-2xl shadow-xl shadow-teal-600/30 hover:bg-teal-700 transition-all uppercase tracking-widest text-xs"
             >
               Return to Dashboard
             </button>
             <button 
              onClick={() => window.location.reload()}
              className="text-slate-400 dark:text-slate-600 font-black uppercase text-[10px] tracking-[0.3em] hover:text-teal-600 transition-colors pt-2"
             >
               Refresh the Sanctuary
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
