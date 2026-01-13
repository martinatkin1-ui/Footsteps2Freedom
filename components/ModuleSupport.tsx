
import React, { useState, useRef, useEffect } from 'react';
import { getCounselorResponseStream } from '../geminiService';

interface ModuleSupportProps {
  isOpen: boolean;
  onClose: () => void;
  moduleName: string;
  framework: string;
  contextPrompt: string;
}

const ModuleSupport: React.FC<ModuleSupportProps> = ({ isOpen, onClose, moduleName, framework, contextPrompt }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [response]);

  const handleAsk = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() || isThinking) return;

    const userQuery = query;
    setQuery('');
    setResponse('');
    setIsThinking(true);

    try {
      const history = [
        { 
          role: 'user' as const, 
          parts: [{ text: `I am currently using the ${moduleName} module which is based on ${framework}. ${contextPrompt}` }] 
        },
        { 
          role: 'model' as const, 
          parts: [{ text: `Understood. I am ready to provide deep-dives or answer questions about the theory and application of ${moduleName}. What would you like to know?` }] 
        }
      ];

      const stream = await getCounselorResponseStream(userQuery, history);
      let fullText = '';
      for await (const chunk of stream) {
        setIsThinking(false);
        const text = chunk.text;
        if (text) {
          fullText += text;
          setResponse(fullText);
        }
      }
    } catch (error) {
      setResponse("I'm sorry, I'm having trouble connecting to the guidance library. Please try asking again in a moment.");
      setIsThinking(false);
    }
  };

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (isListening) { setIsListening(false); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-GB';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      setQuery(event.results[0][0].transcript);
    };
    recognition.start();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-t-[40px] sm:rounded-[40px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-10 duration-500">
        <div className="bg-gradient-to-r from-teal-600 to-indigo-600 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-md shadow-inner">
               💡
             </div>
             <div>
                <h3 className="font-black text-lg leading-tight">Subject Matter Guide</h3>
                <p className="text-teal-100 text-[10px] font-bold uppercase tracking-widest">Insights for: {moduleName}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div 
            ref={scrollRef}
            className="bg-slate-50 dark:bg-slate-950 rounded-[32px] p-6 h-64 overflow-y-auto border border-slate-100 dark:border-slate-800 shadow-inner relative group"
          >
            {!response && !isThinking ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                <span className="text-4xl">📚</span>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 px-10">Ask about the theory behind this tool, or for a deeper explanation of a specific step.</p>
              </div>
            ) : (
              <>
                <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed font-medium pr-10">
                  {isThinking ? (
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap italic">"{response}"</p>
                  )}
                </div>
              </>
            )}
          </div>

          <form onSubmit={handleAsk} className="relative">
             <input 
               autoFocus
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               placeholder={isListening ? "Listening..." : "Ask your question..."}
               className={`w-full bg-slate-100 dark:bg-slate-800 border-2 rounded-2xl px-6 py-4 pr-32 focus:ring-4 focus:ring-teal-500/10 transition-all font-bold dark:text-white ${isListening ? 'border-rose-400 ring-4 ring-rose-50' : 'border-transparent focus:border-teal-500/30'}`}
             />
             <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
               <button 
                type="button" 
                onClick={toggleListening}
                className={`p-3 rounded-xl transition-all ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-white dark:bg-slate-700 text-slate-400 hover:text-teal-600'}`}
               >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 006 0V5a3 3 0 00-3-3z" /></svg>
               </button>
               <button 
                type="submit" 
                disabled={!query.trim() || isThinking}
                className="p-3 bg-teal-600 text-white rounded-xl shadow-lg hover:bg-teal-700 disabled:bg-slate-300"
               >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
               </button>
             </div>
          </form>
          
          <div className="flex justify-center gap-2">
            {["Explain the theory", "How does this help?", "Give an example"].map((s) => (
              <button 
                key={s} 
                type="button"
                onClick={() => { setQuery(s); }}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-teal-600"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleSupport;
