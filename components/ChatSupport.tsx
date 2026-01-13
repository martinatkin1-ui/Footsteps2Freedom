
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Message, SobrietyData, MoodEntry } from '../types';
import { getCounselorResponseStream, checkCrisisStatus, getOfflineResponse } from '../geminiService';
import { useRecoveryStore } from '../store';
import SpeakButton from './SpeakButton';

interface ChatSupportProps {
  onCrisisDetected?: () => void;
  sobriety?: SobrietyData;
  recentMood?: MoodEntry;
  phaseId: number;
}

const ChatSupport: React.FC<ChatSupportProps> = ({ onCrisisDetected, sobriety, recentMood, phaseId }) => {
  const archive = useRecoveryStore(state => state.archiveSummary);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: "Welcome back to this sacred sanctuary, brave soul. I have been holding this space for you, and I am so deeply glad you've chosen to step in. There is no judgment here—only a listening heart and room for your whole truth. How are you feeling in the quiet of this moment?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  const recoveryContext = useMemo(() => {
    if (!sobriety) return "";
    const start = new Date(sobriety.startDate);
    const diff = new Date().getTime() - start.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    return `User is ${days} days into their recovery path. 
    Last reported mood was: ${recentMood?.mood || 'not specified'}.`;
  }, [sobriety, recentMood]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (customInput?: string) => {
    const textToSend = customInput || input;
    if (!textToSend.trim() || isTyping) return;

    const isCrisis = checkCrisisStatus(textToSend);
    if (isCrisis && onCrisisDetected) {
      onCrisisDetected();
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customInput) setInput('');
    setIsTyping(true);

    const tempId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: tempId,
      role: 'model',
      text: '',
      timestamp: new Date()
    }]);

    if (!isOnline) {
      // OFFLINE FALLBACK LOGIC
      await wait(1500); // Simulate local processing
      const localResponse = getOfflineResponse(phaseId, isCrisis);
      
      // Simulate typing effect for the local response
      let currentText = "";
      const words = localResponse.split(" ");
      for (const word of words) {
        currentText += word + " ";
        setMessages(prev => prev.map(m => m.id === tempId ? { ...m, text: currentText } : m));
        await wait(60);
      }
      setIsTyping(false);
      return;
    }

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const streamResponse = await getCounselorResponseStream(textToSend, history, recoveryContext, phaseId, archive);
      
      let fullText = '';
      for await (const chunk of streamResponse) {
        if (isTyping) setIsTyping(false);
        const text = chunk.text;
        if (text) {
          fullText += text;
          setMessages(prev => prev.map(m => 
            m.id === tempId ? { ...m, text: fullText } : m
          ));
        }
      }
    } catch (error) {
      console.error("Chat Error:", error);
      const localFallback = getOfflineResponse(phaseId, isCrisis);
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, text: localFallback } : m));
    } finally {
      setIsTyping(false);
    }
  };

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (isListening) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-GB';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev ? `${prev} ${transcript}` : transcript);
    };
    recognition.start();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] md:h-[calc(100vh-100px)] bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl transition-all">
      <div className={`px-6 py-4 flex items-center justify-between shadow-md relative overflow-hidden text-white transition-colors duration-1000 ${isOnline ? 'bg-gradient-to-r from-teal-600 to-indigo-600' : 'bg-slate-800 border-b-4 border-amber-600'}`}>
        <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl shadow-inner backdrop-blur-md">
              {isTyping ? "⏳" : "🧘"}
            </div>
            <div>
                <h2 className="text-white font-black leading-tight text-lg tracking-tight">Footpath Guide</h2>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${isOnline ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-50 shadow-[0_0_8px_#f59e0b]'}`}></span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
                    {isOnline ? 'Direct Uplink Active' : 'Local Sanctuary Protocol'}
                  </span>
                </div>
            </div>
        </div>
        <div className="hidden sm:flex flex-col items-end gap-1 relative z-10">
           {!isOnline && <span className="text-[8px] font-black uppercase bg-amber-600 text-white px-3 py-1 rounded-full animate-pulse">OFFLINE_CACHE_ACTIVE</span>}
           <span className="text-xs font-bold text-white px-3 py-1 bg-white/10 rounded-full border border-white/10">UK Recovery Clinical Core</span>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-6 space-y-6 scroll-smooth bg-slate-50/50 dark:bg-slate-950/20" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
            <div className={`max-w-[90%] sm:max-w-[80%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div 
                className={`message-bubble relative p-5 rounded-[24px] ${
                  msg.role === 'user' 
                    ? 'message-bubble-user text-white' 
                    : 'message-bubble-ai dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700'
                }`}
              >
                <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">{msg.text || '...'}</p>
                {msg.role === 'model' && msg.text && (
                  <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700 flex justify-end">
                    <SpeakButton text={msg.text} size={14} className="opacity-60 hover:opacity-100" />
                  </div>
                )}
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-2">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-2">
               <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
               </div>
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Guide thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className={`flex gap-3 items-end p-3 rounded-[32px] border transition-all duration-300 relative ${
          isListening ? 'bg-rose-50/30 border-rose-300' : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 shadow-inner'
        }`}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={!isOnline ? "Vocalise your needs (Local Protocol Active)..." : "Share your thoughts..."}
            className="flex-grow bg-white dark:bg-slate-800 px-6 py-4 focus:outline-none text-slate-700 dark:text-slate-100 font-bold rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-700 resize-none min-h-[60px] max-h-40 focus:ring-4 focus:ring-teal-500/10"
            rows={1}
          />
          
          <div className="flex gap-2 pb-1.5">
            <button
              onClick={toggleListening}
              className={`p-4 rounded-2xl transition-all shadow-sm ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-white dark:bg-slate-700 text-teal-600'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 006 0V5a3 3 0 00-3-3z" />
              </svg>
            </button>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className={`p-4 rounded-2xl transition-all ${input.trim() ? 'bg-teal-600 text-white shadow-xl' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSupport;
