
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import SpeakButton from './SpeakButton';

interface VideoSanctuaryProps {
  onExit: () => void;
}

const PRESETS = [
  { id: 'waves', title: 'Gentle Teal Waves', prompt: 'Cinematic slow motion gentle turquoise waves washing over a soft sandy beach at sunrise, high resolution, meditative, calming.', icon: '🌊' },
  { id: 'forest', title: 'Misty British Forest', prompt: 'Cinematic sunlight filtering through misty tall pine trees in a British forest, dust motes dancing in the light, soft bokeh, peaceful and calming.', icon: '🌲' },
  { id: 'nebula', title: 'Floating Nebula', prompt: 'Abstract peaceful teal and violet nebula clouds slowly drifting in deep space, soft glowing particles, ethereal atmosphere.', icon: '🌌' },
  { id: 'clouds', title: 'Golden Hour Clouds', prompt: 'Slow moving fluffy clouds during golden hour over a peaceful valley, soft warm light, cinematic wide shot.', icon: '☁️' }
];

const WAITING_MESSAGES = [
  "Breathe in deeply... hold... and release.",
  "Your visual safe space is being created.",
  "Visualising calm footpaths for your mind.",
  "Patience is a cornerstone of healing.",
  "You are doing something brave for yourself right now.",
  "Almost there. Let the anticipation be a form of mindfulness."
];

const VideoSanctuary: React.FC<VideoSanctuaryProps> = ({ onExit }) => {
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [waitingIndex, setWaitingIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      const selected = await (window as any).aistudio.hasSelectedApiKey();
      setHasKey(selected);
    };
    checkKey();
  }, []);

  useEffect(() => {
    let interval: any;
    if (status === 'generating') {
      interval = setInterval(() => {
        setWaitingIndex((prev) => (prev + 1) % WAITING_MESSAGES.length);
      }, 8000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (isListening) { setIsListening(false); return; }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-GB';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      setPrompt(prev => prev ? `${prev} ${t}` : t);
    };
    recognition.start();
  };

  const handleSelectKey = async () => {
    await (window as any).aistudio.openSelectKey();
    setHasKey(true);
  };

  const generateVideo = async (selectedPrompt?: string) => {
    const finalPrompt = selectedPrompt || prompt;
    if (!finalPrompt.trim()) return;

    setStatus('generating');
    setErrorMessage('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: finalPrompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        setVideoUrl(URL.createObjectURL(blob));
        setStatus('done');
      } else {
        throw new Error("Failed to retrieve video link.");
      }
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("Requested entity was not found")) {
        setHasKey(false);
        await (window as any).aistudio.openSelectKey();
        setHasKey(true);
      }
      setStatus('error');
      setErrorMessage(err.message || "An unexpected error occurred during generation.");
    }
  };

  if (!hasKey) {
    return (
      <div className="max-w-2xl mx-auto py-12 animate-in fade-in duration-700">
        <div className="bg-white dark:bg-slate-900 rounded-[48px] p-10 md:p-16 border-2 border-slate-100 dark:border-slate-800 shadow-2xl text-center space-y-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 dark:bg-teal-900/10 rounded-full -mr-16 -mt-16 opacity-50 blur-3xl"></div>
          <div className="w-24 h-24 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-[32px] flex items-center justify-center text-5xl mx-auto shadow-inner">🔑</div>
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Vault Access Required</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-sm mx-auto">
              Visual generation requires a validated connection to the expedition network. Please select an API key from a <strong>paid UK/GCP project</strong>.
            </p>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="inline-block text-teal-600 font-black text-[10px] uppercase tracking-widest underline decoration-2 underline-offset-4 hover:text-teal-700">
              View Billing Protocol →
            </a>
          </div>
          <div className="flex flex-col gap-4">
            <button
              onClick={handleSelectKey}
              className="w-full py-6 bg-teal-600 text-white font-black rounded-3xl shadow-xl shadow-teal-600/30 hover:bg-teal-700 transition-all active:scale-95 uppercase tracking-widest text-xs"
            >
              Select Authorised Key
            </button>
            <button onClick={onExit} className="text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-600">Close Tool</button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'generating') {
    return (
      <div className="max-w-4xl mx-auto py-12 animate-in fade-in duration-500">
        <div className="bg-slate-950 rounded-[60px] p-16 text-center space-y-12 shadow-2xl relative overflow-hidden border-b-[12px] border-slate-900 ring-1 ring-white/10">
          <div className="absolute inset-0 bg-teal-500/[0.02] animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-600/5 rounded-full blur-[120px]" />
          
          <div className="relative z-10 space-y-10">
             <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-white/5"></div>
                <div className="absolute inset-0 rounded-full border-t-4 border-teal-500 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-5xl">🎬</div>
             </div>
             
             <div className="space-y-4">
                <span className="text-[10px] font-black text-teal-500 uppercase tracking-[0.6em]">Generating Sanctuary</span>
                <div className="min-h-[80px] flex items-center justify-center">
                   <div className="flex flex-col items-center gap-2">
                     <p className="text-white text-2xl md:text-3xl font-black italic tracking-tight leading-snug animate-in fade-in slide-in-from-bottom-2 duration-1000">
                       "{WAITING_MESSAGES[waitingIndex]}"
                     </p>
                     <SpeakButton text={WAITING_MESSAGES[waitingIndex]} size={12} className="opacity-40" />
                   </div>
                </div>
             </div>

             <div className="max-w-md mx-auto bg-white/5 border border-white/10 p-8 rounded-[40px] shadow-inner backdrop-blur-xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-relaxed italic">
                  Digital landscape rendering... Usually takes 2-4 minutes. Keep your browser open to catch the visual stream.
                </p>
             </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'done' && videoUrl) {
    return (
      <div className="max-w-5xl mx-auto py-8 animate-in fade-in duration-700">
        <div className="bg-white dark:bg-slate-900 rounded-[60px] border-4 border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden">
          <video 
            src={videoUrl} 
            controls 
            autoPlay 
            loop 
            playsInline
            className="w-full aspect-video bg-black shadow-inner"
          />
          <div className="p-10 md:p-16 flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="space-y-2">
               <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-teal-500 rounded-xl flex items-center justify-center text-white text-sm shadow-lg">✨</span>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Sanctuary Online</h3>
               </div>
               <p className="text-slate-500 dark:text-slate-400 font-bold ml-11">A 5-minute visual anchor for your nervous system.</p>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <button 
                onClick={() => setStatus('idle')}
                className="flex-1 md:flex-none px-8 py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-[24px] font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all active:scale-95"
              >
                Reset Scene
              </button>
              <button 
                onClick={onExit}
                className="flex-[2] md:flex-none px-12 py-5 bg-teal-600 text-white rounded-[24px] font-black shadow-xl shadow-teal-600/30 hover:bg-teal-700 transition-all active:scale-95 uppercase tracking-widest text-xs"
              >
                Exit Sanctuary
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-40 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg">🎬</div>
            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.4em]">Atmospheric Engineering</span>
          </div>
          <div className="flex items-center gap-4">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Video Sanctuary</h2>
            <SpeakButton text="Video Sanctuary. Generating visual peace to down-regulate your system. The mind cannot distinguish between a vividly imagined sanctuary and a physical one." />
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-lg leading-relaxed italic">"Generating visual peace to down-regulate your system."</p>
        </div>
        <button onClick={onExit} className="text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-rose-500 transition-colors">Terminate Hub</button>
      </div>

      {errorMessage && (
        <div className="bg-rose-50 dark:bg-rose-950/30 border-2 border-rose-100 dark:border-rose-900/40 p-8 rounded-[32px] text-rose-700 dark:text-rose-300 font-bold text-sm animate-in slide-in-from-top-4 flex items-center gap-4">
          <span className="text-2xl">⚠️</span> {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => generateVideo(p.prompt)}
            className="group bg-white dark:bg-slate-900 p-10 rounded-[48px] border-2 border-slate-100 dark:border-slate-800 text-left hover:shadow-2xl hover:border-teal-400/50 transition-all flex flex-col h-full relative overflow-hidden active:scale-[0.98]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 dark:bg-teal-900/10 rounded-full -mr-16 -mt-16 opacity-30 group-hover:scale-150 transition-transform duration-1000" />
            <div className="flex justify-between items-start mb-10 relative z-10">
               <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950 rounded-[28px] flex items-center justify-center text-4xl shadow-inner group-hover:rotate-6 transition-transform">
                  {p.icon}
               </div>
               <div className="flex items-center gap-2">
                 <SpeakButton text={p.prompt} size={10} className="opacity-0 group-hover:opacity-100" />
                 <span className="text-[9px] font-black text-teal-600 dark:text-teal-400 uppercase bg-teal-50 dark:bg-teal-900/40 px-3 py-1.5 rounded-full border border-teal-100 dark:border-teal-800 tracking-[0.2em]">Preset</span>
               </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight group-hover:text-teal-600 transition-colors">{p.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-10 flex-grow italic">"{p.prompt}"</p>
            <div className="text-teal-600 dark:text-teal-400 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 mt-auto pt-6 border-t border-slate-50 dark:border-slate-800/50 group-hover:gap-6 transition-all">
              Initiate Render <span>→</span>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[60px] p-8 md:p-16 border-4 border-slate-50 dark:border-slate-800 shadow-xl space-y-10 relative overflow-hidden mx-4">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-teal-500" />
         <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.5em] mb-4">Custom Atmosphere Laboratory</h4>
         
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={isListening ? "I'm listening to your sanctuary description..." : "Describe a peaceful place... (e.g. 'A soft sunset over the rolling hills of Cornwall')"}
                className={`w-full bg-slate-50 dark:bg-slate-800/50 border-2 rounded-[40px] p-10 h-64 focus:ring-8 focus:ring-indigo-500/10 text-slate-800 dark:text-white text-xl font-medium leading-relaxed resize-none transition-all duration-500 shadow-inner ${isListening ? 'border-rose-400 bg-rose-50/20 ring-8 ring-rose-500/10' : 'border-slate-100 dark:border-slate-700 hover:border-indigo-400/30'}`}
              />
              <button
                type="button"
                onClick={toggleListening}
                className={`absolute bottom-8 right-8 p-5 rounded-2xl shadow-2xl transition-all z-20 active:scale-90 ${
                  isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-indigo-500/20 hover:scale-110'
                }`}
                title="Vocalise Scene"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isListening ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 006 0V5a3 3 0 00-3-3z" />
                </svg>
              </button>
            </div>
            
            <div className="flex flex-col justify-center space-y-6">
               <div className="bg-slate-50 dark:bg-slate-950 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800">
                  <h5 className="font-black text-[9px] uppercase tracking-widest text-indigo-600 mb-3">Field Report</h5>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Use high-quality descriptors: "Cinematic", "High Resolution", "Peaceful", "Wide Shot".</p>
               </div>
               <button
                onClick={() => generateVideo()}
                disabled={!prompt.trim() || isListening}
                className={`w-full py-6 font-black rounded-3xl shadow-xl transition-all uppercase tracking-[0.3em] text-xs active:scale-[0.98] ${
                  prompt.trim() && !isListening ? 'bg-indigo-600 text-white shadow-indigo-600/30 hover:bg-indigo-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-700'
                }`}
              >
                Synthesize Scene
              </button>
            </div>
         </div>
      </div>

      <div className="bg-slate-950 rounded-[48px] p-12 text-white relative overflow-hidden shadow-2xl text-center border-b-[12px] border-slate-900 ring-1 ring-white/5 mx-4">
         <div className="absolute inset-0 bg-indigo-500/[0.02] animate-pulse pointer-events-none" />
         <span className="text-5xl block mb-6 transform hover:scale-125 transition-transform duration-1000">🧩</span>
         <p className="text-2xl md:text-3xl font-black italic text-slate-400 dark:text-slate-500 leading-tight max-w-4xl mx-auto tracking-tighter">
           "The mind cannot distinguish between a vividly imagined sanctuary and a physical one. Use this tool to build a mental library of peace."
         </p>
      </div>
    </div>
  );
};

export default VideoSanctuary;
