
import React, { useState, useEffect } from 'react';
import { getLocalSupport, generateMeetingReflection, generateCompletionArt } from '../geminiService';
import { useRecoveryStore } from '../store';
import { MeetingSession } from '../types';
import ModuleReflection from './ModuleReflection';

const ORGANIZATIONS = [
  {
    name: 'Alcoholics Anonymous (AA) UK',
    description: 'A fellowship of people who share their experience, strength and hope with each other that they may solve their common problem and help others to recover from alcoholism.',
    link: 'https://www.alcoholics-anonymous.org.uk/',
    icon: '🍷',
    color: 'border-teal-100 bg-teal-50 dark:bg-teal-900/20 text-teal-800 dark:text-teal-400'
  },
  {
    name: 'Cocaine Anonymous (CA) UK',
    description: 'A fellowship of people who share their experience, strength and hope with each other that they may solve their common problem and help others to recover from cocaine addiction.',
    link: 'https://ca-uk.org/',
    icon: '❄️',
    color: 'border-indigo-100 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-400'
  },
  {
    name: 'Narcotics Anonymous (NA) UK',
    description: 'A non-profit fellowship or society of men and women for whom drugs had become a major problem. We are recovering addicts who meet regularly to help each other stay clean.',
    link: 'https://ukna.org/',
    icon: '💊',
    color: 'border-emerald-100 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400'
  },
  {
    name: 'SMART Recovery UK',
    description: 'A science-based program that helps people recover from all types of addictive behaviors (including substances or activities like gambling or shopping).',
    link: 'https://smartrecovery.org.uk/',
    icon: '🧠',
    color: 'border-amber-100 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400'
  }
];

const Meetings: React.FC = () => {
  const store = useRecoveryStore();
  const [localSupport, setLocalSupport] = useState<{ text: string; grounding: any[] } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState<{ title: string; checkInTime: string } | null>(null);
  const [showReflection, setShowReflection] = useState(false);
  const [takeaway, setTakeaway] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);
  const [aiReflection, setAiReflection] = useState('');
  const [artifactUrl, setArtifactUrl] = useState<string | undefined>(undefined);

  const findLocalSupport = async () => {
    setIsSearching(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const res = await getLocalSupport(pos.coords.latitude, pos.coords.longitude);
          setLocalSupport(res);
          setIsSearching(false);
        }, async () => {
          const res = await getLocalSupport();
          setLocalSupport(res);
          setIsSearching(false);
        });
      } else {
        const res = await getLocalSupport();
        setLocalSupport(res);
        setIsSearching(false);
      }
    } catch (err) {
      setIsSearching(false);
    }
  };

  const handleCheckIn = (title: string) => {
    if ('vibrate' in navigator) navigator.vibrate([50, 100]);
    setActiveMeeting({ title, checkInTime: new Date().toISOString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEndMeeting = async () => {
    if (!takeaway.trim()) {
      alert("Please record one small takeaway to seal this landmark.");
      return;
    }
    setIsFinishing(true);
    try {
      const [refl, art] = await Promise.all([
        generateMeetingReflection(activeMeeting?.title || "Fellowship Meeting", takeaway),
        generateCompletionArt("Fellowship Meeting", "Wayfinder")
      ]);
      
      const session: MeetingSession = {
        id: Date.now().toString(),
        title: activeMeeting?.title || "Meeting",
        locationName: "Verified Venue",
        date: new Date().toISOString(),
        takeaway,
        artifactUrl: art || undefined
      };
      
      store.addMeetingSession(session);
      setAiReflection(refl || "Your presence at this meeting is a powerful act of True-Self maintenance.");
      setArtifactUrl(art || undefined);
      setShowReflection(true);
    } catch (e) {
      console.error(e);
    }
    setIsFinishing(false);
  };

  if (showReflection) {
    return (
      <ModuleReflection 
        moduleName="Fellowship Meeting"
        title="Landmark Integration"
        context={`User attended a meeting and shared this takeaway: ${takeaway}`}
        initialReflection={aiReflection}
        onClose={() => {
          setShowReflection(false);
          setActiveMeeting(null);
          setTakeaway('');
        }}
      />
    );
  }

  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-700">
      
      {activeMeeting && (
        <div className="bg-emerald-600 rounded-[48px] p-10 md:p-14 text-white shadow-2xl relative overflow-hidden animate-in slide-in-from-top-10 duration-700">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)] animate-pulse-slow" />
          <div className="relative z-10 space-y-8 text-center">
             <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-inner border border-white/30 animate-float">🤝</div>
             <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-100">Live Attendance Active</span>
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter">Attending: {activeMeeting.title}</h2>
             </div>
             <div className="max-w-xl mx-auto space-y-6">
                <p className="text-emerald-50 text-lg font-medium italic opacity-90">"You are currently shielded by the collective. Take a moment to listen for the 'Golden Nugget'—the one piece of truth you need today."</p>
                <div className="space-y-4 pt-4 border-t border-white/20">
                   <label className="text-[9px] font-black uppercase tracking-widest block text-emerald-200">The Takeaway Archive</label>
                   <textarea 
                    value={takeaway}
                    onChange={(e) => setTakeaway(e.target.value)}
                    placeholder="Record one piece of wisdom you heard..."
                    className="w-full bg-white/10 border-2 border-white/20 rounded-3xl p-6 text-white placeholder:text-emerald-200/50 text-lg italic resize-none focus:ring-4 focus:ring-white/10 outline-none transition-all"
                   />
                </div>
                <button 
                  onClick={handleEndMeeting}
                  disabled={isFinishing}
                  className="w-full py-6 bg-white text-emerald-700 font-black rounded-3xl shadow-xl hover:bg-emerald-50 transition-all active:scale-95 uppercase tracking-widest text-xs"
                >
                  {isFinishing ? "Sealing Artifact..." : "End Meeting & Archive Takeaway"}
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Community Explanation */}
      {!activeMeeting && (
        <div className="bg-white dark:bg-slate-900 rounded-[48px] p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 dark:bg-teal-900/10 rounded-full -mr-32 -mt-32 opacity-40 blur-3xl"></div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-teal-600 rounded-[28px] flex items-center justify-center text-white text-3xl shadow-lg">🤝</div>
              <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">Fellowship Navigator</h2>
                  <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Verify Presence, Anchor Wisdom</p>
              </div>
            </div>
            
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-slate-600 dark:text-slate-300 text-lg font-medium leading-relaxed">
                Isolation is the fuel of addiction. Recovery thrives in connection. Use this hub to find local sanctuaries and <strong>Check-In</strong> to verify your commitment to the path.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Local Support Finder */}
      {!activeMeeting && (
        <div className="bg-indigo-600 dark:bg-indigo-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 animate-shimmer pointer-events-none opacity-20" />
          <div className="relative z-10 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h3 className="text-2xl font-black">Verified UK Hubs</h3>
                    <p className="text-indigo-100 font-bold text-sm">Find NHS hubs, recovery centres, and local fellowships near you.</p>
                </div>
                <button 
                  onClick={findLocalSupport}
                  disabled={isSearching}
                  className="bg-white text-indigo-700 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:scale-105 transition-all active:scale-95 disabled:bg-indigo-400 disabled:text-indigo-200"
                >
                  {isSearching ? "Scanning UK Maps..." : "Find Verified Support"}
                </button>
              </div>

              {localSupport && (
                <div className="mt-8 space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white/10 backdrop-blur-md rounded-[32px] p-8 border border-white/20 whitespace-pre-wrap text-sm leading-relaxed mb-6">
                    {localSupport.text}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {localSupport.grounding.map((chunk: any, i: number) => (
                      chunk.maps && (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-xl border border-white/10 group flex flex-col justify-between">
                          <div className="flex items-start gap-4 mb-6">
                             <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">📍</div>
                             <div className="flex-grow min-w-0">
                                <h4 className="text-slate-900 dark:text-white font-black truncate">{chunk.maps.title || "Meeting Location"}</h4>
                                <a href={chunk.maps.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline">View Map Link</a>
                             </div>
                          </div>
                          <button 
                            onClick={() => handleCheckIn(chunk.maps.title || "Local Meeting")}
                            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all"
                          >
                            Engage Check-In Protocol
                          </button>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Meeting History Section */}
      {store.sobriety.meetingHistory.length > 0 && !activeMeeting && (
        <div className="space-y-6">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-4 px-2">
              Fellowship Artifact Archive
              <span className="h-px bg-slate-200 dark:bg-slate-800 flex-grow rounded-full"></span>
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
              {store.sobriety.meetingHistory.map((m) => (
                <div key={m.id} className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border-2 border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                   <div className="flex justify-between items-start">
                      <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-xl">🏺</div>
                      <span className="text-[8px] font-black text-slate-400 uppercase">{new Date(m.date).toLocaleDateString()}</span>
                   </div>
                   <h4 className="font-black text-slate-900 dark:text-white text-sm">{m.title}</h4>
                   <p className="text-xs italic text-slate-500 dark:text-slate-400 leading-relaxed">"{m.takeaway}"</p>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* Standard Links */}
      {!activeMeeting && (
        <div className="space-y-6 px-2">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-4">
              National UK Fellowships
              <span className="h-px bg-slate-200 dark:bg-slate-800 flex-grow rounded-full"></span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ORGANIZATIONS.map((org) => (
                <a 
                  key={org.name}
                  href={org.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block group p-8 rounded-[40px] border-2 transition-all hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] ${org.color}`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-5xl group-hover:scale-110 transition-transform duration-500">{org.icon}</span>
                  </div>
                  <h4 className="text-xl font-black mb-3">{org.name}</h4>
                  <p className="text-sm font-medium leading-relaxed opacity-80 mb-6">{org.description}</p>
                  <span className="inline-flex items-center gap-2 font-black text-xs uppercase tracking-[0.2em] border-b-2 border-current pb-1">
                    Visit Website
                  </span>
                </a>
              ))}
          </div>
        </div>
      )}

      {/* Encouragement Footer */}
      <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
         <p className="text-teal-50 font-bold leading-relaxed italic text-xl text-center relative z-10 font-serif">
           "The meeting after the meeting happens in your own mind. Archive your truth."
         </p>
      </div>
    </div>
  );
};

export default Meetings;
