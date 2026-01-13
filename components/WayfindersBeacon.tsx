
import React, { useState } from 'react';
import { generateBeaconMessage, screenCommunityContent } from '../geminiService';
import { useRecoveryStore } from '../store';
import { BeaconMessage, CommunityPost } from '../types';
import ModuleReflection from './ModuleReflection';
import SpeakButton from './SpeakButton';

const TOPICS = [
  "Riding the First Wave of Cravings",
  "Dealing with Relapse Shame",
  "Building Your First Boundary",
  "Finding Peace in the Morning",
  "Reclaiming Your Identity"
];

const WayfindersBeacon: React.FC<{ onExit: (rating?: number, refl?: string) => void }> = ({ onExit }) => {
  const store = useRecoveryStore();
  const [view, setView] = useState<'intro' | 'draft' | 'mirror' | 'reflection'>('intro');
  const [topic, setTopic] = useState(TOPICS[0]);
  const [rawAdvice, setRawAdvice] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [safetyFeedback, setSafetyFeedback] = useState<string | null>(null);
  const [beacon, setBeacon] = useState<{ wisdom: string; advice: string } | null>(null);

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (isListening) { setIsListening(false); return; }
    const rec = new SpeechRecognition();
    rec.lang = 'en-GB';
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      setRawAdvice(prev => prev ? `${prev} ${t}` : t);
    };
    rec.start();
  };

  const handleSynthesize = async () => {
    if (!rawAdvice.trim()) return;
    setIsLoading(true);
    setSafetyFeedback(null);
    
    // Step 1: Pre-screen for safety
    const safety = await screenCommunityContent(rawAdvice);
    if (!safety.isSafe) {
      setSafetyFeedback(safety.feedback);
      setIsLoading(false);
      return;
    }

    // Step 2: Generate beacon if safe
    const result = await generateBeaconMessage(topic, rawAdvice);
    if (result) {
      setBeacon(result);
      setView('mirror');
    }
    setIsLoading(false);
  };

  const handleBroadcast = async () => {
    if (!beacon) return;
    setIsBroadcasting(true);
    
    // Final safety check on the synthesized content to be sure
    const fullText = `[WAYFINDER BEACON: ${topic}]\n\n"${beacon.wisdom}"\n\nPractical Advice: ${beacon.advice}`;
    const safety = await screenCommunityContent(fullText);
    
    if (!safety.isSafe) {
      setSafetyFeedback(safety.feedback);
      setIsBroadcasting(false);
      return;
    }

    // Add to personal archive
    const msg: BeaconMessage = {
      id: Date.now().toString(),
      topic,
      wisdom: beacon.wisdom,
      advice: beacon.advice,
      date: new Date().toISOString()
    };
    store.addBeacon(msg);

    // Broadcast to community
    const post: CommunityPost = {
      id: `beacon-${Date.now()}`,
      author: store.user?.name || 'Wayfinder',
      authorTotem: store.sobriety.trueSelfTotem,
      isAnonymous: false,
      content: fullText,
      type: 'beacon',
      reactions: { footstep: 0, love: 0, celebrate: 0 },
      comments: [],
      date: new Date().toISOString()
    };
    store.addCommunityPost(post);
    
    if ('vibrate' in navigator) navigator.vibrate([50, 100, 150]);
    setIsBroadcasting(false);
    setView('reflection');
  };

  if (view === 'intro') {
    const introText = "We keep what we have by giving it away. You have reached the maintenance summit; now, send a beam of light to those still navigating the undergrowth.";
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in duration-1000">
        <div className="bg-slate-900 rounded-[60px] p-10 md:p-20 text-center border-b-[12px] border-amber-600 shadow-2xl space-y-12 relative overflow-hidden ring-1 ring-white/10 group">
          <SpeakButton text={introText} size={24} className="absolute top-8 right-8 scale-125 opacity-40 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.1),transparent)] pointer-events-none" />
          <div className="w-32 h-32 bg-white/5 rounded-[40px] flex items-center justify-center text-7xl mx-auto shadow-2xl border border-white/10 animate-float">🕯️</div>
          <div className="space-y-6">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic">The Wayfinder Beacon</h2>
            <p className="text-slate-400 text-xl font-medium leading-relaxed italic max-w-2xl mx-auto font-serif">
              "{introText}"
            </p>
          </div>
          <button 
            onClick={() => setView('draft')}
            className="px-14 py-6 bg-amber-600 text-white font-black rounded-3xl shadow-xl hover:bg-amber-700 transition-all uppercase tracking-widest text-sm active:scale-95"
          >
            Draft a Wisdom Signal
          </button>
        </div>
      </div>
    );
  }

  if (view === 'draft') {
    const draftText = "Pick a topic and share your raw truth. What did you wish you knew on Day 1? The Guide will polish your experience into a Beacon Message.";
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 animate-in slide-in-from-bottom-8 duration-700">
        <div className="bg-white dark:bg-slate-900 rounded-[50px] p-10 md:p-16 space-y-10 border border-slate-100 dark:border-slate-800 shadow-2xl relative group">
          <SpeakButton text={draftText} size={14} className="absolute top-4 right-4 opacity-40 group-hover:opacity-100" />
          <div className="space-y-4">
             <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.5em]">Service Mode</span>
             <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">The Legacy Draft</h3>
             <p className="text-slate-500 dark:text-slate-400 font-bold italic leading-relaxed">
               "{draftText}"
             </p>
          </div>

          <div className="space-y-4">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-2">Topic of Focus</label>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map(t => (
                <button 
                  key={t}
                  onClick={() => { setTopic(t); setSafetyFeedback(null); }}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${topic === t ? 'bg-amber-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {safetyFeedback && (
            <div className="p-6 bg-rose-50 dark:bg-rose-950/40 rounded-3xl border-2 border-rose-100 dark:border-rose-900/50 animate-in slide-in-from-top-2">
               <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">🛡️</span>
                  <h4 className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">Safety Intervention</h4>
               </div>
               <p className="text-sm font-bold text-rose-800 dark:text-rose-200 italic leading-relaxed">"{safetyFeedback}"</p>
            </div>
          )}

          <div className="relative">
             <textarea 
               value={rawAdvice}
               onChange={(e) => { setRawAdvice(e.target.value); setSafetyFeedback(null); }}
               placeholder={isListening ? "Listening to your wisdom..." : "Write your advice here... (e.g. 'I found that checking my pulse every hour saved me from several relapses...')"}
               className={`w-full h-64 bg-slate-50 dark:bg-slate-950 border-2 rounded-[32px] p-8 text-slate-800 dark:text-white text-lg font-medium leading-relaxed italic resize-none transition-all shadow-inner ${isListening ? 'border-rose-500 ring-rose-500/10' : safetyFeedback ? 'border-rose-300' : 'border-slate-100 dark:border-slate-800 focus:border-amber-500/50'}`}
             />
             <button onClick={toggleListening} className={`absolute bottom-6 right-6 p-4 rounded-2xl shadow-xl ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-white dark:bg-slate-800 text-slate-400 hover:text-amber-600 shadow-amber-500/10'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 006 0V5a3 3 0 00-3-3z" /></svg>
             </button>
          </div>

          <button 
            onClick={handleSynthesize}
            disabled={!rawAdvice.trim() || isLoading}
            className="w-full py-6 bg-amber-600 text-white font-black rounded-3xl shadow-xl hover:bg-amber-700 transition-all uppercase tracking-widest text-xs active:scale-95 disabled:opacity-30 flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Validating Protocol...
              </>
            ) : "Create Beacon Pattern"}
          </button>
        </div>
      </div>
    );
  }

  if (view === 'mirror' && beacon) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 animate-in zoom-in-95 duration-700">
        <div className="bg-slate-950 rounded-[60px] p-10 md:p-20 text-white border-b-[12px] border-amber-600 shadow-2xl space-y-12 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[80px]" />
           
           <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <span className="text-[11px] font-black text-amber-500 uppercase tracking-[0.6em]">The Beacon Result</span>
                <SpeakButton text={beacon.wisdom + ". " + beacon.advice} size={18} />
              </div>
              <h2 className="text-4xl font-black italic tracking-tighter">"Your Experience, Distilled"</h2>
           </div>

           <div className="bg-white/5 p-10 rounded-[48px] border border-white/10 shadow-inner space-y-8">
              <div className="space-y-4 relative group/wis">
                 <SpeakButton text={beacon.wisdom} size={10} className="absolute top-2 right-2 opacity-0 group-hover/wis:opacity-100" />
                 <h4 className="text-[9px] font-black text-amber-400 uppercase tracking-[0.4em]">Wisdom Artifact</h4>
                 <p className="text-3xl md:text-4xl font-black italic leading-tight text-white font-serif">"{beacon.wisdom}"</p>
              </div>
              <div className="h-px bg-white/10 w-24" />
              <div className="space-y-4 relative group/adv">
                 <SpeakButton text={beacon.advice} size={10} className="absolute top-2 right-2 opacity-0 group-hover/adv:opacity-100" />
                 <h4 className="text-[9px] font-black text-teal-400 uppercase tracking-[0.4em]">Wayfinder's Action</h4>
                 <p className="text-lg text-slate-300 font-medium leading-relaxed italic">"{beacon.advice}"</p>
              </div>
           </div>

           {safetyFeedback && (
             <div className="p-6 bg-rose-600/20 border-2 border-rose-500/30 rounded-3xl animate-in shake duration-500">
                <p className="text-sm font-bold text-rose-200 text-center italic">"{safetyFeedback}"</p>
             </div>
           )}

           <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => setView('draft')}
                className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-white rounded-3xl font-black uppercase text-[10px] tracking-widest border border-white/10"
              >
                Refine Raw Signal
              </button>
              <button 
                onClick={handleBroadcast}
                disabled={isBroadcasting}
                className="flex-[2] py-6 bg-amber-600 text-white font-black rounded-3xl shadow-xl hover:bg-amber-700 transition-all uppercase tracking-[0.3em] text-xs active:scale-95 flex items-center justify-center gap-3"
              >
                {isBroadcasting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Broadcasting...
                  </>
                ) : "Broadcast to Seekers (+50 Service pts)"}
              </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <ModuleReflection 
      moduleName="Wayfinder's Beacon"
      title="Legacy Architecture"
      context={`Wayfinder broadcasted wisdom to the community regarding ${topic}. This act of service strengthens their own mantle of maintenance.`}
      onClose={(r, refl) => onExit(r, refl)}
    />
  );
};

export default WayfindersBeacon;
