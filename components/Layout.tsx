import React, { useState, useEffect, useRef } from 'react';
import { AppRoute } from '../types';
import { useRecoveryStore } from '../store';
import { generateUINarration, generateSpeech, playSpeech, stopAllSpeech } from '../geminiService';
import Logo from './Logo';
import { 
  IconHome, 
  IconJourney, 
  IconSupport, 
  IconJournal, 
  IconTools,
  IconPlanner,
  IconRewards,
  IconTarget,
  IconUser,
  IconUsers,
  IconLotus
} from './Icons';

interface LayoutProps {
  children: React.ReactNode;
  activeRoute: AppRoute;
  setRoute: (route: AppRoute) => void;
  onOpenMood: () => void;
  onOpenSafety: () => void;
  currentPhaseId?: number;
}

const Layout: React.FC<LayoutProps> = ({ children, activeRoute, setRoute, onOpenMood, onOpenSafety }) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const user = useRecoveryStore(state => state.user);
  const footsteps = useRecoveryStore(state => state.sobriety.footsteps);
  const audioCache = useRecoveryStore(state => state.audioCache);
  const cacheAudio = useRecoveryStore(state => state.cacheAudio);
  const logout = useRecoveryStore(state => state.logout);
  const currentlySpeakingText = useRecoveryStore(state => state.currentlySpeakingText);
  const setCurrentlySpeakingText = useRecoveryStore(state => state.setCurrentlySpeakingText);
  const isQuietMode = useRecoveryStore(state => state.settings.isQuietMode);

  const isNarrating = currentlySpeakingText?.startsWith("__PAGE_NARRATION__");

  const triggerHaptic = (style: 'light' | 'medium' = 'light') => {
    if ('vibrate' in navigator) {
      navigator.vibrate(style === 'light' ? 10 : 25);
    }
  };

  const handleNavClick = (route: AppRoute) => {
    triggerHaptic('light');
    setRoute(route);
    setShowMoreMenu(false);
  };

  const handleNarratePage = async () => {
    if (isQuietMode) return;
    
    if (isNarrating) {
      stopAllSpeech();
      setCurrentlySpeakingText(null);
      return;
    }

    triggerHaptic('medium');
    stopAllSpeech();

    try {
      const pageText = document.body.innerText?.slice(0, 2500) || "";
      const script = await generateUINarration(activeRoute, pageText);
      
      if (script) {
        const narrationKey = `__PAGE_NARRATION__${script}`;
        setCurrentlySpeakingText(narrationKey);

        let base64 = audioCache[script];
        if (!base64) {
          base64 = await generateSpeech(script) || "";
          if (base64) cacheAudio(script, base64);
        }
        
        if (base64) {
          await playSpeech(base64, () => {
            setCurrentlySpeakingText(null);
          });
        } else {
          setCurrentlySpeakingText(null);
        }
      }
    } catch (e) {
      console.error("Narration failed", e);
      setCurrentlySpeakingText(null);
    }
  };

  const FirstAidIcon = ({ className = "w-5 h-5" }) => (
    <div className={`${className} bg-emerald-600 rounded-md flex items-center justify-center text-white font-black shadow-sm`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-3/5 h-3/5" aria-hidden="true">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </div>
  );

  const desktopNavItems = [
    { route: AppRoute.HOME, label: 'Dashboard', icon: <IconHome /> },
    { route: AppRoute.JOURNEY, label: 'Guided Path', icon: <IconJourney /> },
    { route: AppRoute.ARCHIVE, label: 'True-Self Archive', icon: <span className="text-xl" aria-hidden="true">📖</span> },
    { route: AppRoute.SPIRITUALITY, label: 'Spirituality', icon: <IconLotus className="text-indigo-500" /> },
    { route: AppRoute.ALL_TOOLS, label: 'All Tools Hub', icon: <IconTools /> },
    { route: AppRoute.FIRST_AID, label: 'First Aid Toolkit', icon: <FirstAidIcon /> },
    { route: AppRoute.SCIENCE_HUB, label: 'Science Hub', icon: <span className="text-xl" aria-hidden="true">🔬</span> },
    { route: AppRoute.SUPPORT, label: 'AI Counselor', icon: <IconSupport /> },
    { route: AppRoute.JOURNAL, label: 'Journaling', icon: <IconJournal /> },
    { route: AppRoute.PROFILE, label: 'True-Self Profile', icon: <IconUser /> },
    { route: AppRoute.COMMUNITY, label: 'Community Hub', icon: <span className="text-xl" aria-hidden="true">👥</span> },
    { route: AppRoute.MEETINGS, label: 'Meetings & Community', icon: <IconUsers /> },
    { route: AppRoute.DAILY_PLANNER, label: 'Routine Planner', icon: <IconPlanner /> },
    { route: AppRoute.SMART_GOALS, label: 'SMART Goals', icon: <IconTarget /> },
    { route: AppRoute.REWARDS, label: 'True-Self Treasury', icon: <IconRewards /> },
  ];

  if (footsteps >= 150) {
    desktopNavItems.splice(2, 0, { route: AppRoute.WAYFINDER_BEACON, label: 'Wayfinder Beacon', icon: <span className="text-xl" aria-hidden="true">🕯️</span> });
  }

  const mobileNavItems = [
    { route: AppRoute.HOME, label: 'Home', icon: <IconHome /> },
    { route: AppRoute.JOURNEY, label: 'Journey', icon: <IconJourney /> },
    { route: AppRoute.FIRST_AID, label: 'First Aid', icon: <FirstAidIcon className="w-6 h-6" /> },
    { route: AppRoute.SUPPORT, label: 'Support', icon: <IconSupport /> },
    { id: 'more', label: 'More', icon: <IconTools /> },
  ];

  const menuGroups = [
    {
      title: "Sanctuary",
      items: [
        { route: AppRoute.PROFILE, label: 'Profile', icon: <IconUser className="text-teal-600" /> },
        { route: AppRoute.ARCHIVE, label: 'Archive', icon: <span className="text-xl" aria-hidden="true">📖</span> },
        { route: AppRoute.SPIRITUALITY, label: 'Meaning', icon: <IconLotus className="text-indigo-500" /> },
        { route: AppRoute.REWARDS, label: 'Treasury', icon: <IconRewards className="text-amber-500" /> },
        { route: AppRoute.JOURNAL, label: 'Journal', icon: <IconJournal className="text-indigo-600" /> },
      ]
    },
    {
      title: "Growth",
      items: [
        { route: AppRoute.DAILY_PLANNER, label: 'Routine', icon: <IconPlanner className="text-teal-600" /> },
        { route: AppRoute.SMART_GOALS, label: 'Goals', icon: <IconTarget className="text-orange-600" /> },
        { route: AppRoute.SCIENCE_HUB, label: 'Science', icon: <span className="text-xl" aria-hidden="true">🔬</span> },
      ]
    },
    {
      title: "Network",
      items: [
        { route: AppRoute.MEETINGS, label: 'Meetings', icon: <IconUsers className="text-emerald-600" /> },
        { route: AppRoute.ALL_TOOLS, label: 'Tools', icon: <IconTools className="text-slate-600" /> },
        { route: AppRoute.COMMUNITY, label: 'Community', icon: <span className="text-xl" aria-hidden="true">👥</span> },
      ]
    }
  ];

  return (
    <div className="flex h-full w-full bg-slate-950 transition-colors duration-300">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-6 focus:py-4 focus:bg-teal-600 focus:text-white focus:rounded-xl focus:font-black">
        Skip to main content
      </a>

      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-6 shadow-sm overflow-y-auto relative" role="navigation" aria-label="Desktop Navigation">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-50/20 via-transparent to-transparent pointer-events-none" />
        
        {/* Logo container: Shift left 5mm on tablet (md), 10px right on PC/Mac (lg) */}
        <div className="mb-10 relative z-10 md:-ml-[5mm] lg:ml-[10px]">
          <Logo size="sm" />
        </div>
        
        {user && (
          <div className="mb-8 p-4 bg-slate-800/50 rounded-2xl border border-slate-800 flex items-center gap-3 relative z-10">
             <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-black text-xs" aria-hidden="true">
               {user.name.charAt(0)}
             </div>
             <div className="overflow-hidden">
                <p className="text-[11px] font-black text-white truncate">{user.name}</p>
                <button 
                  onClick={() => { triggerHaptic('medium'); logout(); }} 
                  className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline focus-visible:ring-2 focus-visible:ring-rose-500 rounded px-1"
                  aria-label={`Logout ${user.name}`}
                >
                  Secure Logout
                </button>
             </div>
          </div>
        )}

        <nav className="space-y-1 flex-grow relative z-10">
          {desktopNavItems.map((item) => (
            <button
              key={item.route || (item as any).id}
              onClick={() => item.route && handleNavClick(item.route)}
              aria-current={activeRoute === item.route ? 'page' : undefined}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-teal-500 outline-none ${
                activeRoute === item.route 
                  ? 'bg-slate-800 text-teal-400 font-black shadow-inner' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 font-bold'
              }`}
            >
              <span className={activeRoute === item.route ? 'text-teal-600' : 'text-slate-400'} aria-hidden="true">
                {item.icon}
              </span>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-grow flex flex-col min-w-0 h-full relative" id="main-content">
        <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-6 py-4 flex justify-between items-center pt-safe" role="banner">
            <div className="flex items-center gap-3 md:hidden">
              <Logo size="sm" variant="horizontal" />
            </div>
            
            <div className="hidden md:block">
              <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{(activeRoute || '').replace('_', ' ')}</h2>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handleNarratePage}
                disabled={isQuietMode}
                className={`p-2.5 rounded-full shadow-sm active:scale-90 transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none ${isQuietMode ? 'opacity-20 cursor-not-allowed' : isNarrating ? 'bg-indigo-600 text-white animate-pulse' : 'bg-indigo-900/30 text-indigo-400'}`}
                title={isNarrating ? "Stop Summary" : "Explore the Landscape"}
                aria-label={isNarrating ? "Stop Page Narration" : "Read Page Details & Provide Feedback"}
                aria-pressed={isNarrating}
              >
                {isNarrating ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9h6v6H9V9z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                  </svg>
                )}
              </button>
              <button 
                onClick={() => { triggerHaptic('medium'); onOpenSafety(); }}
                className="p-2.5 bg-rose-900/20 text-rose-400 rounded-full shadow-sm active:scale-90 focus-visible:ring-2 focus-visible:ring-rose-500 outline-none"
                aria-label="Open Emergency Support"
              >
                <span className="text-lg" aria-hidden="true">🆘</span>
              </button>
              <button 
                onClick={() => handleNavClick(AppRoute.SUPPORT)}
                className="p-2.5 bg-indigo-600 text-white rounded-full shadow-lg active:scale-90 flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-white outline-none"
                aria-label="Contact AI Counselor"
              >
                <IconSupport size={18} />
                <span className="hidden sm:inline text-[11px] font-black uppercase tracking-widest pr-1">Guide</span>
              </button>
            </div>
        </header>

        <div className="main-scroll flex-grow no-scrollbar" role="main">
          <div className="p-4 md:p-8 max-w-5xl mx-auto pb-32 md:pb-8">
            {children}
          </div>
        </div>

        <button 
           onClick={() => handleNavClick(AppRoute.JOURNAL)}
           className="fixed bottom-24 right-6 md:hidden z-50 w-14 h-14 bg-teal-600 text-white rounded-full shadow-[0_15px_40px_rgba(13,148,136,0.4)] flex items-center justify-center active:scale-90 transition-all border-2 border-slate-800 focus-visible:ring-4 focus-visible:ring-teal-500 outline-none"
           aria-label="Open Journal"
        >
          <IconJournal size={28} />
        </button>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-slate-800 px-2 flex justify-around items-center z-[90] pb-safe h-[calc(64px + env(safe-area-inset-bottom))]" aria-label="Mobile Navigation">
          {mobileNavItems.map((item) => (
            <button
              key={item.id || (item as any).route}
              onClick={() => {
                if (item.id === 'more') {
                  triggerHaptic();
                  setShowMoreMenu(!showMoreMenu);
                } else {
                  handleNavClick((item as any).route);
                }
              }}
              aria-expanded={item.id === 'more' ? showMoreMenu : undefined}
              className={`flex flex-col items-center gap-1 transition-all min-w-[60px] py-2 active:scale-90 focus-visible:ring-2 focus-visible:ring-teal-500 outline-none ${
                activeRoute === (item as any).route || (item.id === 'more' && showMoreMenu)
                  ? 'text-teal-400 font-black' 
                  : 'text-slate-500 font-bold'
              }`}
            >
              <span className="text-xl" aria-hidden="true">{item.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">{item.label}</span>
            </button>
          ))}
        </nav>
      </main>

      {showMoreMenu && (
        <div className="fixed inset-0 z-[100] md:hidden" role="dialog" aria-modal="true" aria-label="Expedition Menu">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-in fade-in" onClick={() => setShowMoreMenu(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-slate-900 rounded-t-[40px] shadow-2xl animate-in slide-in-from-bottom-full duration-500 max-h-[85vh] overflow-y-auto pb-safe">
             <div className="w-10 h-1 bg-slate-800 rounded-full mx-auto mt-4 mb-6" aria-hidden="true" />
             <div className="px-8 pb-12 space-y-10">
                <h3 className="text-xl font-black text-white tracking-tight">Expedition Hub</h3>
                <div className="space-y-8">
                  {menuGroups.map((group, idx) => (
                    <div key={idx} className="space-y-4">
                       <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">{group.title}</h4>
                       <div className="grid grid-cols-3 gap-3">
                          {group.items.map((item, i) => (
                            <button
                              key={i}
                              onClick={() => handleNavClick(item.route)}
                              className="flex flex-col items-center gap-3 p-4 bg-slate-800/50 rounded-3xl active:scale-95 transition-all border border-slate-800 focus-visible:ring-2 focus-visible:ring-teal-500"
                            >
                               <div className="text-2xl" aria-hidden="true">{item.icon}</div>
                               <span className="text-[10px] font-black text-slate-300 uppercase">{item.label}</span>
                            </button>
                          ))}
                       </div>
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t border-slate-800">
                   <button 
                    onClick={() => { triggerHaptic('medium'); logout(); }} 
                    className="w-full py-5 bg-rose-900/20 text-rose-600 rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-95 focus-visible:ring-2 focus-visible:ring-rose-500"
                   >
                     Secure Logout
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;