
import React, { useState, useRef } from 'react';
import { JournalEntry } from '../types';
import { getJournalInsight, getJournalPrompt, getGratitudePrompt, enhanceJournalInsight } from '../geminiService';
import { MOOD_CONFIG } from '../constants.tsx';
import SpeakButton from './SpeakButton';
import { triggerHaptic } from '../haptics';

interface JournalProps {
  entries: JournalEntry[];
  onAddEntry: (entry: JournalEntry) => void;
  onUpdateEntry: (entry: JournalEntry) => void;
  currentPhaseTitle?: string;
  phaseId: number;
}

const Journal: React.FC<JournalProps> = ({ entries, onAddEntry, onUpdateEntry, currentPhaseTitle = 'Foundations', phaseId }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isGeneratingGratitude, setIsGeneratingGratitude] = useState(false);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [activeGratitudePrompt, setActiveGratitudePrompt] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isJournalListening, setIsJournalListening] = useState(false);
  const [isGratitudeListening, setIsGratitudeListening] = useState(false);
  
  // Enhancement States
  const [enhancingEntryId, setEnhancingEntryId] = useState<string | null>(null);
  const [extraContext, setExtraContext] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    content: '',
    mood: 'good' as JournalEntry['mood'],
    energyLevel: 5,
    cravingIntensity: 0,
    gratitude: '',
    emotionalRoot: ''
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const fetchPrompt = async () => {
    setIsGeneratingPrompt(true);
    const p = await getJournalPrompt(phaseId, formData.mood);
    setActivePrompt(p);
    setIsGeneratingPrompt(false);
  };

  const fetchGratitudePrompt = async () => {
    setIsGeneratingGratitude(true);
    const p = await getGratitudePrompt(currentPhaseTitle, formData.mood);
    setActiveGratitudePrompt(p);
    setIsGeneratingGratitude(false);
  };

  const toggleListening = (type: 'content' | 'gratitude') => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    const isCurrentlyListening = type === 'content' ? isJournalListening : isGratitudeListening;

    if (isCurrentlyListening) {
      if (type === 'content') setIsJournalListening(false);
      else setIsGratitudeListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-GB';
    recognition.interimResults = false;

    recognition.onstart = () => {
      if (type === 'content') setIsJournalListening(true);
      else setIsGratitudeListening(true);
    };
    recognition.onend = () => {
      if (type === 'content') setIsJournalListening(false);
      else setIsGratitudeListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setFormData(prev => ({
        ...prev,
        [type]: prev[type as keyof typeof prev] ? `${prev[type as keyof typeof prev]} ${transcript}` : transcript
      }));
    };

    recognition.start();
  };

  const handleSubmit = async () => {
    if (!formData.content.trim()) return;
    setIsAnalyzing(true);
    
    const entryData = { 
      ...formData, 
      imageUrl: imagePreview || undefined,
      content: activePrompt ? `Prompt: ${activePrompt}\n\n${formData.content}` : formData.content,
      gratitude: activeGratitudePrompt ? `Inspiration: ${activeGratitudePrompt}\n${formData.gratitude}` : formData.gratitude
    };
    const insight = await getJournalInsight(entryData, currentPhaseTitle);
    
    onAddEntry({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ...entryData,
      aiInsight: insight
    });
    
    setFormData({
      content: '', mood: 'good', energyLevel: 5, cravingIntensity: 0, gratitude: '', emotionalRoot: ''
    });
    setImagePreview(null);
    setActivePrompt(null);
    setActiveGratitudePrompt(null);
    setIsAnalyzing(false);
    triggerHaptic('LANDMARK');
  };

  const handleDeepenInsight = async (entry: JournalEntry) => {
    if (!extraContext.trim()) return;
    setIsEnhancing(true);
    try {
      const deepened = await enhanceJournalInsight(entry.content, extraContext, currentPhaseTitle);
      if (deepened) {
        onUpdateEntry({
          ...entry,
          aiInsight: deepened
        });
        setEnhancingEntryId(null);
        setExtraContext('');
        triggerHaptic('SYNC');
      }
    } catch (e) {
      console.error(e);
    }
    setIsEnhancing(false);
  };

  return (
    <div className="space-y-12 pb-24 animate-in fade-in duration-700">
      <div className="bg-white dark:bg-slate-900 rounded-[48px] p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 dark:bg-teal-900/10 rounded-full -mr-32 -mt-32 opacity-40 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Record of Truth</h2>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-teal-600/10 text-teal-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-teal-600/20">
                     Phase: {currentPhaseTitle.split(': ')[1] || currentPhaseTitle}
                  </span>
                </div>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-bold mt-1">Gently capture the truth of your moment.</p>
            </div>
            <button 
              onClick={fetchPrompt}
              disabled={isGeneratingPrompt}
              className="px-6 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl font-black text-xs uppercase tracking-widest border border-indigo-100 hover:bg-indigo-100 transition-all flex items-center gap-2"
            >
              {isGeneratingPrompt ? (
                <span className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></span>
              ) : '✨'}
              Request Adaptive Prompt
            </button>
          </div>

          {activePrompt && (
            <div className={`p-8 rounded-3xl text-white shadow-xl animate-in slide-in-from-top-4 duration-500 relative overflow-hidden ${phaseId >= 4 ? 'bg-indigo-950 border-4 border-indigo-900' : 'bg-indigo-600'}`}>
               <button onClick={() => setActivePrompt(null)} className="absolute top-4 right-4 opacity-50 hover:opacity-100 z-20">✕</button>
               <div className="flex items-center gap-3 mb-3">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Guide Inquiry</h4>
                 <SpeakButton text={activePrompt} size={14} className="opacity-80" />
               </div>
               <p className="text-xl md:text-2xl font-bold italic leading-relaxed relative z-10 font-serif">"{activePrompt}"</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Energy State ({formData.energyLevel}/10)</label>
                  <input type="range" min="1" max="10" value={formData.energyLevel} onChange={(e) => setFormData({...formData, energyLevel: parseInt(e.target.value)})} className="w-full accent-teal-600" />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Cravings ({formData.cravingIntensity}/10)</label>
                  <input type="range" min="0" max="10" value={formData.cravingIntensity} onChange={(e) => setFormData({...formData, cravingIntensity: parseInt(e.target.value)})} className="w-full accent-rose-500" />
                </div>
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Internal Weather</label>
                   <div className="flex flex-wrap gap-2">
                      {(Object.keys(MOOD_CONFIG) as Array<keyof typeof MOOD_CONFIG>).map(m => (
                        <button key={m} onClick={() => setFormData({...formData, mood: m})} className={`p-3 rounded-2xl border-2 transition-all flex items-center gap-2 ${formData.mood === m ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' : 'border-slate-100 dark:border-slate-800 opacity-60'}`}>
                          <span className="text-xl">{MOOD_CONFIG[m].icon}</span>
                          <span className="text-[9px] font-black uppercase">{MOOD_CONFIG[m].label}</span>
                        </button>
                      ))}
                   </div>
                </div>
             </div>
             <button onClick={() => fileInputRef.current?.click()} className={`w-full aspect-video rounded-[32px] border-4 border-dashed transition-all flex flex-col items-center justify-center gap-3 overflow-hidden ${imagePreview ? 'border-teal-500' : 'border-slate-100 dark:border-slate-800 hover:border-teal-300'}`}>
               {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" alt="Journal preview" /> : <><span className="text-4xl">📸</span><span className="text-[10px] font-black text-slate-400 uppercase">Daily Glimmer</span></>}
               <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
             </button>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-100 rounded-[40px] p-8 md:p-10 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900 dark:text-amber-50 flex items-center gap-3">🌻 Gratitude Anchor</h3>
              <button onClick={fetchGratitudePrompt} disabled={isGeneratingGratitude} className="px-4 py-2 bg-white dark:bg-amber-950 text-amber-700 rounded-xl font-black text-[9px] uppercase border border-amber-200">{isGeneratingGratitude ? '...' : '✨ Inspiration'}</button>
            </div>
            <div className="relative group">
              <textarea value={formData.gratitude} onChange={(e) => setFormData({ ...formData, gratitude: e.target.value })} placeholder="What glimmers did you notice today?" className="w-full h-32 bg-white/50 dark:bg-slate-950/30 rounded-[32px] p-6 resize-none shadow-inner transition-all focus:ring-4 focus:ring-amber-500/10 border-transparent focus:border-amber-200" />
              <button onClick={() => toggleListening('gratitude')} className={`absolute bottom-4 right-4 p-4 rounded-2xl transition-all shadow-lg ${isGratitudeListening ? 'bg-amber-500 text-white animate-pulse' : 'bg-white text-amber-600 shadow-amber-500/10'}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 00-3-3z" /></svg></button>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.2em] ml-2">Reflection</label>
            <div className="relative group">
              <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} placeholder="Share your thoughts on your path..." className="w-full h-64 bg-slate-50 dark:bg-slate-800/50 rounded-[40px] p-8 text-lg leading-relaxed resize-none shadow-inner transition-all focus:ring-4 focus:ring-teal-500/10 border-transparent focus:border-teal-200" />
              <button onClick={() => toggleListening('content')} className={`absolute bottom-6 right-6 p-5 rounded-2xl transition-all shadow-lg ${isJournalListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-white text-teal-600 hover:bg-teal-50 shadow-teal-500/10'}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 00-3-3z" /></svg></button>
            </div>
          </div>

          <button onClick={handleSubmit} disabled={!formData.content.trim() || isAnalyzing} className={`w-full py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-xs transition-all shadow-2xl ${formData.content.trim() && !isAnalyzing ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/30' : 'bg-slate-100 text-slate-400'}`}>
            {isAnalyzing ? 'Connecting with Guide...' : 'Honour this Moment'}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-4">Transformation Timeline</h3>
        {entries.length === 0 ? <div className="text-center py-24 opacity-30 text-slate-500 font-bold">The mist is clear. Your story begins with the first page.</div> : 
          entries.slice().reverse().map((entry) => (
            <div key={entry.id} className="bg-white dark:bg-slate-900 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-8 md:p-12 space-y-8">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.2em] bg-slate-50 dark:bg-slate-800 px-5 py-2 rounded-full">{new Date(entry.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setEnhancingEntryId(enhancingEntryId === entry.id ? null : entry.id)}
                      className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${enhancingEntryId === entry.id ? 'bg-indigo-600 text-white' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100'}`}
                    >
                      ✨ Deepen Insight
                    </button>
                    <SpeakButton text={entry.content} size={14} />
                  </div>
                </div>

                {enhancingEntryId === entry.id && (
                  <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border-2 border-indigo-100 dark:border-indigo-900/50 rounded-[32px] p-8 animate-in slide-in-from-top-4 duration-500 space-y-6">
                    <div className="space-y-2">
                       <h4 className="text-lg font-black text-indigo-900 dark:text-indigo-100">Retrospective Mirroring</h4>
                       <p className="text-sm text-indigo-700/60 dark:text-indigo-300/60 italic font-medium">"Add more context or describe how your True-Self feels about this moment now. The Guide will synthesize a deeper pattern archive."</p>
                    </div>
                    <div className="relative">
                      <textarea 
                        autoFocus
                        value={extraContext}
                        onChange={(e) => setExtraContext(e.target.value)}
                        placeholder="Retrospective Context..."
                        className="w-full h-32 bg-white/50 dark:bg-slate-950/50 border-none rounded-2xl p-6 text-indigo-900 dark:text-indigo-100 font-bold italic resize-none focus:ring-4 focus:ring-indigo-500/10 outline-none"
                      />
                    </div>
                    <button 
                      onClick={() => handleDeepenInsight(entry)}
                      disabled={isEnhancing || !extraContext.trim()}
                      className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3"
                    >
                      {isEnhancing ? (
                        <>
                          <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          Deepening Reflection...
                        </>
                      ) : "Apply Retrospective Context"}
                    </button>
                  </div>
                )}

                <div className="flex flex-col lg:flex-row gap-10">
                   {entry.imageUrl && <div className="w-full lg:w-80 h-64 rounded-3xl overflow-hidden shadow-lg flex-shrink-0"><img src={entry.imageUrl} className="w-full h-full object-cover" alt="Glimmer" /></div>}
                   <div className="flex-grow space-y-6">
                      {entry.gratitude && <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-[32px] border border-amber-100 relative group">
                        <SpeakButton text={entry.gratitude} size={12} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100" />
                        <h4 className="text-[9px] font-black text-amber-600 uppercase mb-2">🌻 Glimmer</h4><p className="text-sm italic">"{entry.gratitude}"</p>
                      </div>}
                      <p className="text-slate-900 dark:text-slate-100 text-xl font-medium border-l-4 border-teal-100 dark:border-teal-900 pl-8 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                   </div>
                </div>
              </div>
              {entry.aiInsight && (
                <div className="bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start relative group">
                    <SpeakButton text={entry.aiInsight} size={14} className="absolute top-8 right-8" />
                    <div className="w-16 h-16 bg-teal-600 rounded-3xl flex-shrink-0 flex items-center justify-center text-4xl text-white shadow-lg">💡</div>
                    <div className="space-y-3 flex-grow">
                      <h4 className="text-teal-600 font-black text-[10px] uppercase tracking-[0.4em]">Guide's Perspective</h4>
                      <p className="text-slate-800 dark:text-slate-200 text-lg font-medium leading-relaxed italic">"{entry.aiInsight}"</p>
                    </div>
                </div>
              )}
            </div>
          ))
        }
      </div>
    </div>
  );
};

export default Journal;
