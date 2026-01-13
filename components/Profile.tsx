
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { SobrietyData, MoodEntry, JournalEntry, AppRoute, CompletedLesson, RecoveryCapital, HaltLog, Goal } from '../types';
import { MOOD_CONFIG, getRankData, COPING_EXERCISES, RECOVERY_PHASES } from '../constants.tsx';
import { generateTrueSelfArt } from '../geminiService';
import { initiateZohoAuth } from '../zohoService';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { useRecoveryStore } from '../store';
import CameraCapture from './CameraCapture';
import SpeakButton from './SpeakButton';

interface ProfileProps {
  sobriety: SobrietyData;
  moods: MoodEntry[];
  journalEntries: JournalEntry[];
  completedLessons: CompletedLesson[];
  recoveryCapital: RecoveryCapital | null;
  currentPhaseId: number;
  onUpdateSobrietyDate: (newDate: string) => void;
  onUpdateTrueSelfTotem: (totem: string, landmarks: string[]) => void;
  onOpenMoodModal: () => void;
  onStartExercise: (id: string) => void;
  setRoute: (route: AppRoute) => void;
}

const Profile: React.FC<ProfileProps> = ({ sobriety, moods, journalEntries, completedLessons, recoveryCapital, currentPhaseId, onUpdateTrueSelfTotem, onOpenMoodModal, onStartExercise, setRoute }) => {
  const [isGeneratingTotem, setIsGeneratingTotem] = useState(false);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const store = useRecoveryStore();
  const user = store.user;
  const updateAvatar = store.updateAvatar;
  const logout = store.logout;
  const biometrics = store.biometrics;
  const goals = store.goals;
  const zoho = store.zoho;
  const { favoriteToolIds, toggleFavoriteTool, updateSponsorNumber, settings, updateSettings } = store;
  
  const [sponsorInput, setSponsorInput] = useState(user?.sponsorNumber || '');
  const [isSavingSponsor, setIsSavingSponsor] = useState(false);
  const [hasSavedSponsor, setHasSavedSponsor] = useState(false);

  const rank = getRankData(sobriety.footsteps || 0);

  const daysSober = useMemo(() => {
    const start = new Date(sobriety.startDate).getTime();
    const now = new Date().getTime();
    return Math.max(1, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
  }, [sobriety.startDate]);

  const currentPhase = useMemo(() => 
    RECOVERY_PHASES.find(p => p.id === currentPhaseId) || RECOVERY_PHASES[0], 
  [currentPhaseId]);

  const recentMoods = useMemo(() => 
    moods.slice().reverse().slice(0, 5), 
  [moods]);

  const completedGoals = useMemo(() => 
    goals.filter(g => g.isCompleted), 
  [goals]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowPhotoMenu(false);
      }
    };
    if (showPhotoMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPhotoMenu]);

  const handleGenerateTotem = async () => {
    setIsGeneratingTotem(true);
    const newLandmarks = [...sobriety.sanctuaryLandmarks];
    
    if (sobriety.footsteps > 20 && !newLandmarks.includes('Stream of Clarity')) newLandmarks.push('Stream of Clarity');
    if (sobriety.footsteps > 50 && !newLandmarks.includes('Mountains of Resilience')) newLandmarks.push('Mountains of Resilience');
    if (sobriety.footsteps > 100 && !newLandmarks.includes('Temple of Wisdom')) newLandmarks.push('Temple of Wisdom');
    if (sobriety.currentStreak >= 30 && !newLandmarks.includes('Ever-burning Hearth')) newLandmarks.push('Ever-burning Hearth');

    const totem = await generateTrueSelfArt(rank.title, newLandmarks, sobriety.atmosphere?.state);
    if (totem) onUpdateTrueSelfTotem(totem, newLandmarks);
    setIsGeneratingTotem(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          updateAvatar(reader.result as string);
          setShowPhotoMenu(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCaptureSelfie = (dataUrl: string) => {
    updateAvatar(dataUrl);
    setShowPhotoMenu(false);
  };

  const handleSaveSponsor = () => {
    setIsSavingSponsor(true);
    setHasSavedSponsor(false);
    updateSponsorNumber(sponsorInput);
    if ('vibrate' in navigator) navigator.vibrate(50);
    setTimeout(() => {
      setIsSavingSponsor(false);
      setHasSavedSponsor(true);
      // Success feedback stays for 3 seconds
      setTimeout(() => setHasSavedSponsor(false), 3000);
    }, 800);
  };

  return (
    <div className="space-y-12 pb-24 animate-in fade-in duration-700">
      {isCameraOpen && (
        <CameraCapture 
          onCapture={handleCaptureSelfie} 
          onClose={() => setIsCameraOpen(false)} 
        />
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => { handleImageUpload(e); e.target.value = ''; }} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Traveller Tile */}
      <div className="relative bg-slate-900 rounded-[60px] border-4 border-slate-800 shadow-2xl overflow-hidden min-h-[420px] flex flex-col items-center justify-center p-12 text-center group">
        <div className="absolute inset-0 pointer-events-none">
          {sobriety.trueSelfTotem ? (
            <img src={sobriety.trueSelfTotem} className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-1000" alt="" />
          ) : (
            <div className={`w-full h-full bg-slate-950`} />
          )}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-900 to-transparent" />
        </div>
        
        <div className="relative z-30 space-y-10 w-full max-sm px-4 mx-auto">
           <div className="relative group/avatar" ref={menuRef}>
              <button 
                onClick={() => setShowPhotoMenu(!showPhotoMenu)}
                className="w-40 h-40 md:w-48 md:h-48 bg-slate-800 backdrop-blur-xl rounded-full border-[6px] border-slate-700 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden cursor-pointer active:scale-95 transition-all relative mx-auto"
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} className="w-full h-full object-cover" alt="Identity Avatar" />
                ) : (
                  <div className="text-7xl md:text-8xl drop-shadow-2xl grayscale group-hover/avatar:grayscale-0 transition-all duration-700">
                    {rank.icon}
                  </div>
                )}
              </button>

              {showPhotoMenu && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-[110%] mb-4 w-72 bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border-2 border-slate-100 dark:border-slate-800 p-2 z-50 animate-in slide-in-from-bottom-4 duration-500">
                   <button 
                    onClick={() => { setIsCameraOpen(true); setShowPhotoMenu(false); }} 
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-teal-50 dark:hover:bg-teal-900/40 rounded-2xl transition-all group/btn text-left"
                   >
                      <span className="text-2xl">📸</span>
                      <div className="flex flex-col">
                         <span className="text-xs font-black uppercase text-slate-800 dark:text-slate-100">Capture Presence</span>
                         <span className="text-[9px] text-slate-500">Selfie mirroring</span>
                      </div>
                   </button>
                   <button 
                    onClick={() => { fileInputRef.current?.click(); setShowPhotoMenu(false); }} 
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-2xl transition-all group/btn text-left"
                   >
                      <span className="text-2xl">🖼️</span>
                      <div className="flex flex-col">
                         <span className="text-xs font-black uppercase text-slate-800 dark:text-slate-100">Select Artifact</span>
                         <span className="text-[9px] text-slate-500">Upload from gallery</span>
                      </div>
                   </button>
                </div>
              )}
           </div>

           <div className="space-y-6">
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-white drop-shadow-2xl">
                {user?.name || 'Traveller'}
              </h2>
              
              <div className="flex flex-col items-center gap-4">
                <div className={`px-8 py-2.5 rounded-full border-2 border-teal-500/30 ${rank.pill} font-black text-xs uppercase tracking-[0.4em] shadow-2xl`}>
                  LEVEL: {rank.title.toUpperCase()}
                </div>

                <button 
                  onClick={handleGenerateTotem}
                  disabled={isGeneratingTotem}
                  className="px-10 py-4 bg-white/10 hover:bg-white/20 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest border border-white/10 transition-all flex items-center gap-3 backdrop-blur-md shadow-2xl active:scale-95 disabled:opacity-50"
                >
                  {isGeneratingTotem ? (
                    <>
                      <span className="w-3 h-3 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"></span>
                      Synthesizing Identity...
                    </>
                  ) : (
                    <>
                      <span>✨</span> Evolve True-Self Totem
                    </>
                  )}
                </button>
           </div>
        </div>
      </div>
      </div>

      {/* Emergency Support Pillar */}
      <section className="bg-white dark:bg-slate-900 rounded-[50px] p-8 md:p-12 border-2 border-emerald-100 dark:border-emerald-900/30 shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-4 mb-4">
               <span className="text-4xl">📞</span>
               <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Support Network Pillar</h3>
            </div>
            
            <div className="flex flex-col md:flex-row items-end gap-6">
               <div className="flex-grow w-full space-y-2">
                  <label htmlFor="sponsor-input" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Immediate Responder (Sponsor Number)</label>
                  <input 
                    id="sponsor-input"
                    type="tel" 
                    value={sponsorInput}
                    onChange={(e) => setSponsorInput(e.target.value)}
                    placeholder="e.g. 07700 900555"
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-3xl px-8 py-5 text-slate-900 dark:text-white font-bold focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500/50 transition-all outline-none shadow-inner"
                  />
               </div>
               <button 
                 onClick={handleSaveSponsor}
                 disabled={isSavingSponsor || hasSavedSponsor}
                 className={`w-full md:w-auto px-12 py-5 rounded-3xl shadow-xl transition-all active:scale-95 disabled:opacity-90 flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] font-black ${
                   hasSavedSponsor 
                    ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-2 border-emerald-500/50' 
                    : 'bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-emerald-700'
                 }`}
               >
                 {isSavingSponsor ? (
                   <>
                     <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                     Sealing Node...
                   </>
                 ) : hasSavedSponsor ? (
                   <>
                     <span className="text-lg">✓</span> Number Secured
                   </>
                 ) : 'Secure Number'}
               </button>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-bold italic px-4">
              "This number will be readily available in your Crisis Card and during First Aid protocols. Reliability is a biological safety signal."
            </p>
          </div>
      </section>

      {/* Privacy and Alert Protocol Controls */}
      <section className="bg-white dark:bg-slate-900 rounded-[50px] p-8 md:p-12 border-2 border-rose-100 dark:border-rose-900/30 shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-4 mb-4">
               <span className="text-4xl">🔐</span>
               <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Privacy & Protocol Settings</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
                  <div className="space-y-1 pr-4">
                     <h4 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-tight">Hands-Free Detection</h4>
                     <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed italic">
                        Listen for "Guide, I'm struggling" to trigger First Aid.
                     </p>
                  </div>
                  <button 
                    onClick={() => updateSettings({ handsFreeEnabled: !settings.handsFreeEnabled })}
                    className={`shrink-0 w-14 h-8 rounded-full transition-all relative ${settings.handsFreeEnabled ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                  >
                     <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${settings.handsFreeEnabled ? 'left-7' : 'left-1'}`} />
                  </button>
               </div>

               <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
                  <div className="space-y-1 pr-4">
                     <h4 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-tight">Proactive Bio-Nudges</h4>
                     <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed italic">
                        Allow the Guide to offer tools if high stress is detected.
                     </p>
                  </div>
                  <button 
                    onClick={() => updateSettings({ bioNudgesEnabled: !settings.bioNudgesEnabled })}
                    className={`shrink-0 w-14 h-8 rounded-full transition-all relative ${settings.bioNudgesEnabled ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                  >
                     <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${settings.bioNudgesEnabled ? 'left-7' : 'left-1'}`} />
                  </button>
               </div>

               <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
                  <div className="space-y-1 pr-4">
                     <h4 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-tight">Email Milestones</h4>
                     <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed italic">
                        Receive formal commendations via email for streaks and badges.
                     </p>
                  </div>
                  <button 
                    onClick={() => updateSettings({ emailNotificationsEnabled: !settings.emailNotificationsEnabled })}
                    className={`shrink-0 w-14 h-8 rounded-full transition-all relative ${settings.emailNotificationsEnabled ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                  >
                     <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${settings.emailNotificationsEnabled ? 'left-7' : 'left-1'}`} />
                  </button>
               </div>

               <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
                  <div className="space-y-1 pr-4">
                     <h4 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-tight">Quiet Mode</h4>
                     <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed italic">
                        Disable all automatic audio narrations and feedback.
                     </p>
                  </div>
                  <button 
                    onClick={() => updateSettings({ isQuietMode: !settings.isQuietMode })}
                    className={`shrink-0 w-14 h-8 rounded-full transition-all relative ${settings.isQuietMode ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                  >
                     <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${settings.isQuietMode ? 'left-7' : 'left-1'}`} />
                  </button>
               </div>
            </div>
          </div>
      </section>

      {/* Zoho CRM Uplink */}
      <section className="bg-white dark:bg-slate-900 rounded-[50px] p-8 md:p-12 border-2 border-indigo-100 dark:border-indigo-900/30 shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-4 text-center md:text-left">
               <div className="flex items-center justify-center md:justify-start gap-4">
                  <span className="text-4xl">📡</span>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Zoho CRM Uplink</h3>
               </div>
               <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-sm">
                 Securely sync your recovery milestones and growth data with professional Zoho-powered clinics or coaches.
               </p>
               {zoho.isConnected && (
                 <div className="flex items-center gap-3 justify-center md:justify-start">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_#6366f1]" />
                    <span className="text-xl font-black text-slate-900 dark:text-white">Active Professional Sync</span>
                 </div>
               )}
            </div>
            <button 
              onClick={() => zoho.isConnected ? null : initiateZohoAuth()}
              className={`px-12 py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${zoho.isConnected ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-indigo-600 text-white shadow-indigo-600/20 hover:bg-indigo-700'}`}
            >
               {zoho.isConnected ? '⚙️ Manage Connection' : '🔗 Link Zoho CRM'}
            </button>
          </div>
      </section>

      {/* Expedition Narrative */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-[50px] p-8 md:p-12 border-2 border-slate-100 dark:border-slate-800 shadow-xl space-y-10 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/5 rounded-full blur-[60px] pointer-events-none" />
           <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-4">
                <span className="text-4xl">🗺️</span>
                <div className="space-y-1">
                   <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Expedition Narrative</h3>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CURRENT PHASE PROGRESS</p>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 flex flex-col sm:raw-row items-center gap-6">
                 <div className="w-20 h-20 bg-teal-100 dark:bg-teal-900/40 rounded-2xl flex items-center justify-center text-4xl shadow-inner border border-teal-500/20">
                    {currentPhase.id === 1 ? '🌴' : currentPhase.id === 2 ? '🌿' : currentPhase.id === 3 ? '🌲' : currentPhase.id === 4 ? '🌌' : '🏔️'}
                 </div>
                 <div className="flex-grow text-center sm:text-left">
                    <h4 className="text-xl font-black text-slate-800 dark:text-white">{currentPhase.title}</h4>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 italic leading-relaxed">"{currentPhase.environment}: {currentPhase.focus}"</p>
                 </div>
              </div>
              <div className="space-y-4">
                 <div className="flex justify-between items-end px-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Journey Threshold</span>
                    <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Phase {currentPhaseId} of 5</span>
                 </div>
                 <div className="flex gap-2 h-2.5">
                    {RECOVERY_PHASES.map((p) => (
                      <div key={p.id} className={`flex-1 rounded-full transition-all duration-1000 ${p.id <= currentPhaseId ? 'bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.3)]' : 'bg-slate-100 dark:bg-slate-800'}`} />
                    ))}
                 </div>
              </div>
           </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-[50px] p-8 md:p-10 border-2 border-slate-100 dark:border-slate-800 shadow-xl space-y-8 relative overflow-hidden">
           <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Weather Log</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RECENT INTERNAL PULSE</p>
           </div>
           <div className="space-y-4">
              {recentMoods.length > 0 ? (
                recentMoods.map((entry, i) => (
                  <div key={entry.id} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700 animate-in slide-in-from-right-4" style={{ animationDelay: `${i * 100}ms` }}>
                     <div className="text-2xl">{MOOD_CONFIG[entry.mood].icon}</div>
                     <div className="flex-grow min-w-0">
                        <p className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">{MOOD_CONFIG[entry.mood].label}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(entry.date).toLocaleDateString('en-GB')}</p>
                     </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center opacity-30 italic text-xs font-bold">No weather reports filed.</div>
              )}
           </div>
           <button onClick={onOpenMoodModal} className="w-full py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase text-teal-600 hover:bg-teal-50 transition-all">Log New Pulse</button>
        </div>
      </section>

      {/* Set Marker Section */}
      <section className="bg-slate-900 rounded-[50px] p-8 md:p-14 border border-slate-800 shadow-2xl relative overflow-hidden group">
         <div className="absolute inset-0 bg-indigo-500/[0.02] pointer-events-none" />
         <div className="relative z-10 space-y-12">
            <div className="flex flex-col md:flex-row gap-12 items-start">
               <div className="space-y-6 md:w-1/3">
                  <div className="w-16 h-16 bg-indigo-600 rounded-[28px] flex items-center justify-center text-3xl text-white shadow-xl shadow-indigo-600/20">🧭</div>
                  <div className="space-y-2">
                     <h3 className="text-4xl font-black text-white tracking-tighter leading-none">Set Marker</h3>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">MARKER STATUS</p>
                  </div>
                  <div className="pt-4 space-y-2">
                     <p className="text-2xl font-black text-white">{completedGoals.length} / {goals.length}</p>
                     <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">MARKERS REACHED</p>
                  </div>
                  <button 
                     onClick={() => setRoute(AppRoute.SMART_GOALS)}
                     className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/10 transition-all w-full"
                   >
                     Manage Markers
                   </button>
               </div>

               <div className="flex-grow w-full space-y-4">
                  {completedGoals.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {completedGoals.slice(0, 4).map(goal => (
                         <div key={goal.id} className="p-6 bg-slate-950 border border-emerald-500/20 rounded-3xl flex items-center gap-4 group/mission hover:border-emerald-500/40 transition-all">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">✓</div>
                            <div className="min-w-0">
                               <h4 className="text-sm font-black text-white truncate">{goal.title}</h4>
                               <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">CLOSED: {new Date(goal.createdAt).toLocaleDateString()}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                  ) : (
                    <div className="h-full min-h-[160px] bg-slate-950/50 rounded-3xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center p-8 text-center space-y-3 opacity-50">
                       <p className="text-slate-400 font-bold italic">"No markers archived yet. Start building your path by setting a new marker."</p>
                       <button 
                         onClick={() => setRoute(AppRoute.SMART_GOALS)}
                         className="text-indigo-400 font-black uppercase text-[10px] tracking-widest hover:underline"
                       >
                         Set First Marker →
                       </button>
                    </div>
                  )}
               </div>
            </div>
         </div>
      </section>

      {/* Profile Info Section (Beacon) */}
      <section className="bg-slate-900 rounded-[50px] p-8 md:p-14 border border-slate-800 shadow-2xl overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-2.5 h-full bg-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all" />
          <div className="relative z-10 space-y-12">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-4xl font-black text-white tracking-tighter leading-none">True-Self Beacon</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">EXPEDITION PROTOCOL SETTINGS</p>
              </div>
              <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center text-4xl shadow-inner border border-slate-700">🛡️</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="space-y-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 block ml-2">IDENTITY SIGNATURE</label>
                     <div className="text-2xl font-black text-white px-8 py-6 bg-slate-950 rounded-3xl border border-slate-800 shadow-inner group-hover:border-teal-500/20 transition-colors">{user?.name}</div>
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 block ml-2">UPLINK ADDRESS</label>
                     <div className="text-sm font-bold text-slate-400 px-8 py-6 bg-slate-950 rounded-3xl border border-slate-800 shadow-inner truncate">{user?.email}</div>
                  </div>
               </div>
               <div className="space-y-8 flex flex-col justify-between">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 block ml-2">PATH INITIATION DATE</label>
                     <div className="text-lg font-black text-teal-500 px-8 py-6 bg-slate-950 rounded-3xl border border-slate-800 shadow-inner">
                        {user?.joinedDate ? new Date(user.joinedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'PROTOCOL_PENDING'}
                     </div>
                  </div>
                  <button onClick={() => logout()} className="w-full py-6 bg-slate-800 hover:bg-rose-600/10 text-rose-500 border-2 border-slate-700 hover:border-rose-500/30 rounded-3xl font-black text-[11px] uppercase tracking-[0.4em] transition-all active:scale-95 shadow-lg">TERMINATE_SESSION.sh</button>
               </div>
            </div>
          </div>
      </section>

      {/* Profile Identity Archive (Artifact Upload) - Fixed at the very bottom */}
      <section className="bg-white dark:bg-slate-900 rounded-[50px] p-8 md:p-12 border-4 border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6 text-center sm:text-left">
               <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-indigo-100 dark:border-indigo-800 group-hover:scale-110 transition-transform">
                  📂
               </div>
               <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Archive Profile Artifact</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium italic text-sm">
                    Manually update your True-Self visual anchor from your local device.
                  </p>
               </div>
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 uppercase tracking-widest text-[10px]"
            >
              Upload Identity Artifact
            </button>
          </div>
      </section>
    </div>
  );
};

export default Profile;
