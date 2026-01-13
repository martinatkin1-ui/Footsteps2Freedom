import { create } from 'https://esm.sh/zustand@^5.0.0';
import { persist, createJSONStorage, StateStorage } from 'https://esm.sh/zustand@^5.0.0/middleware';
import { MoodEntry, JournalEntry, SobrietyData, RelapsePreventionPlan, Goal, Badge, CompletedLesson, User, RecoveryCapital, CommunityPost, PostComment, BiometricData, ZohoState, ArchiveSummary, BeaconMessage, MeetingSession, AppRoute } from './types';
import { BADGE_LIBRARY, RECOVERY_PHASES, COPING_EXERCISES, RANKS } from './constants';
import { analyzeNervousSystemAtmosphere, generateJourneySummary, generateMilestoneEmail } from './geminiService';
import { triggerHaptic } from './haptics';

const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const request = indexedDB.open('footpath_db', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('store');
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction('store', 'readonly');
        const store = tx.objectStore('store');
        const getRequest = store.get(name);
        getRequest.onsuccess = () => resolve(getRequest.result || null);
        getRequest.onerror = () => resolve(null);
      };
      request.onerror = () => resolve(null);
    });
  },
  setItem: async (name: string, value: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('footpath_db', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('store');
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction('store', 'readwrite');
        const store = tx.objectStore('store');
        const putRequest = store.put(value, name);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
      request.onerror = () => reject(request.error);
    });
  },
  removeItem: async (name: string): Promise<void> => {
    return new Promise((resolve) => {
      const request = indexedDB.open('footpath_db', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('store');
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction('store', 'readwrite');
        const store = tx.objectStore('store');
        const deleteRequest = store.delete(name);
        deleteRequest.onsuccess = () => resolve();
      };
    });
  },
};

const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    author: 'Anonymous Traveller',
    isAnonymous: true,
    content: "Just hit 30 days today. The morning air feels different when you aren't chasing a ghost. Keep going everyone, it's worth it.",
    type: 'milestone',
    milestoneTag: '30 Days',
    reactions: { footstep: 12, love: 8, celebrate: 15 },
    comments: [
      { id: 'c1', author: 'Brave Soul', text: 'So proud of you! This is my goal too.', date: new Date().toISOString() }
    ],
    date: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'post-2',
    author: 'Serenity Seeker',
    isAnonymous: false,
    authorTotem: 'https://images.unsplash.com/photo-1518005020411-38b81210a7ab?q=80&w=200&h=200&auto=format&fit=crop',
    content: "Using the TIPP skill helped me survive a massive craving tonight. Instead of picking up, I held ice cubes until the storm passed. My True-Self is winning.",
    type: 'glimmer',
    reactions: { footstep: 45, love: 22, celebrate: 5 },
    comments: [],
    date: new Date(Date.now() - 7200000).toISOString()
  }
];

interface RecoveryState {
  user: User | null;
  isAuthenticated: boolean;
  settings: {
    handsFreeEnabled: boolean;
    bioNudgesEnabled: boolean;
    isQuietMode: boolean;
    emailNotificationsEnabled: boolean;
  };
  sobriety: SobrietyData;
  moods: MoodEntry[];
  journalEntries: JournalEntry[];
  goals: Goal[];
  completedLessons: CompletedLesson[];
  rppData: RelapsePreventionPlan | null;
  recoveryCapital: RecoveryCapital | null;
  biometrics: BiometricData;
  completedExercises: string[];
  favoriteToolIds: string[];
  communityPosts: CommunityPost[];
  activePhaseId: number;
  theme: 'dark'; // Hardcoded to dark
  zoho: ZohoState;
  archiveSummary: ArchiveSummary | null;
  audioCache: Record<string, string>;
  currentlySpeakingText: string | null;
  navigationOrigin: AppRoute | null;
  lastEmailDispatch: { milestone: string; content: string; timestamp: string } | null;

  login: (email: string, name: string) => void;
  logout: () => void;
  updateSettings: (settings: Partial<RecoveryState['settings']>) => void;
  completeOnboarding: () => void;
  updateAvatar: (url: string) => void;
  updateSponsorNumber: (num: string) => void;
  setActivePhaseId: (id: number) => void;
  awardFootsteps: (count: number) => void;
  awardServiceFootsteps: (count: number) => void;
  addMilestone: (milestone: string) => void;
  updateSobrietyDate: (newDate: string) => void;
  updateDailySpend: (spend: number) => void;
  updateTrueSelfTotem: (totem: string, landmarks: string[]) => void;
  addMood: (entry: MoodEntry) => void;
  addJournalEntry: (entry: JournalEntry) => void;
  updateJournalEntry: (entry: JournalEntry) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (goal: Goal) => void;
  markExerciseComplete: (id: string, lesson?: Omit<CompletedLesson, 'id' | 'date' | 'exerciseId'>) => void;
  toggleFavoriteTool: (id: string) => void;
  saveRPP: (data: RelapsePreventionPlan) => void;
  updateRecoveryCapital: (capital: RecoveryCapital) => void;
  updateBiometrics: (data: Partial<BiometricData>) => void;
  addCommunityPost: (post: CommunityPost) => void;
  reactToPost: (postId: string, reaction: 'footstep' | 'love' | 'celebrate') => void;
  addComment: (postId: string, comment: PostComment) => void;
  addBeacon: (beacon: BeaconMessage) => void;
  addMeetingSession: (session: MeetingSession) => void;
  checkBadges: () => Badge | null;
  updateZoho: (data: Partial<ZohoState>) => void;
  updateStreak: () => void;
  refreshAtmosphere: () => Promise<void>;
  refreshArchive: () => Promise<void>;
  cacheAudio: (text: string, base64: string) => void;
  setCurrentlySpeakingText: (text: string | null) => void;
  updateSomaticMap: (map: Record<string, number>) => void;
  oneSentenceTruth: (text: string) => void;
  setNavigationOrigin: (route: AppRoute | null) => void;
  dispatchMilestoneEmail: (milestone: string, type: 'streak' | 'badge') => Promise<void>;
  clearEmailToast: () => void;
}

export const useRecoveryStore = create<RecoveryState>()(
  persist(
    (set, get) => ({
      user: {
        id: 'default-traveller',
        email: 'traveller@footpath.uk',
        name: 'Traveller',
        pinEnabled: false,
        joinedDate: new Date().toISOString(),
        onboardingCompleted: true
      },
      isAuthenticated: true, 
      settings: {
        handsFreeEnabled: false,
        bioNudgesEnabled: true,
        isQuietMode: false,
        emailNotificationsEnabled: true
      },
      sobriety: { 
        startDate: new Date().toISOString(), 
        milestones: [], 
        footsteps: 0, 
        serviceFootsteps: 0,
        badges: [],
        dailySpend: 0,
        sanctuaryLandmarks: [],
        currentStreak: 0,
        longestStreak: 0,
        atmosphere: { state: 'steady', insight: 'Establishing a clear path.', lastUpdated: new Date().toISOString() },
        beacons: [],
        meetingHistory: [],
        somaticMap: {}
      },
      moods: [],
      journalEntries: [],
      goals: [],
      completedLessons: [],
      rppData: null,
      recoveryCapital: null,
      biometrics: {
        heartRate: 0,
        lastSync: new Date().toISOString(),
        isSynced: false
      },
      completedExercises: [],
      favoriteToolIds: [],
      communityPosts: INITIAL_COMMUNITY_POSTS,
      activePhaseId: 1,
      theme: 'dark', // Always dark
      zoho: {
        isConnected: false
      },
      archiveSummary: null,
      audioCache: {},
      currentlySpeakingText: null,
      navigationOrigin: null,
      lastEmailDispatch: null,

      login: (email, name) => set({ 
        isAuthenticated: true, 
        user: { 
          id: Math.random().toString(36).substr(2, 9), 
          email, 
          name: name || 'Traveller', 
          pinEnabled: false, 
          joinedDate: new Date().toISOString(),
          onboardingCompleted: true 
        } 
      }),
      
      logout: () => set({ isAuthenticated: false }),

      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      completeOnboarding: () => set((state) => ({
        user: state.user ? { ...state.user, onboardingCompleted: true } : null
      })),

      updateAvatar: (avatarUrl) => set((state) => ({
        user: state.user ? { ...state.user, avatarUrl } : null
      })),

      updateSponsorNumber: (sponsorNumber) => set((state) => ({
        user: state.user ? { ...state.user, sponsorNumber } : null
      })),

      setActivePhaseId: (activePhaseId) => set({ activePhaseId }),

      awardFootsteps: (count) => {
        triggerHaptic('LANDMARK');
        set((state) => ({
          sobriety: { ...state.sobriety, footsteps: state.sobriety.footsteps + count }
        }));
      },

      awardServiceFootsteps: (count) => {
        triggerHaptic('LANDMARK');
        set((state) => ({
          sobriety: { ...state.sobriety, serviceFootsteps: state.sobriety.serviceFootsteps + count }
        }));
      },

      addMilestone: (milestone) => {
        triggerHaptic('LANDMARK');
        set((state) => ({
          sobriety: { 
            ...state.sobriety, 
            milestones: [...state.sobriety.milestones, milestone],
            footsteps: state.sobriety.footsteps + 15
          }
        }));
      },

      updateSobrietyDate: (startDate) => set((state) => ({
        sobriety: { ...state.sobriety, startDate }
      })),

      updateDailySpend: (dailySpend) => set((state) => ({
        sobriety: { ...state.sobriety, dailySpend, footsteps: state.sobriety.footsteps + 5 }
      })),

      updateTrueSelfTotem: (trueSelfTotem, sanctuaryLandmarks) => set((state) => ({
        sobriety: { ...state.sobriety, trueSelfTotem, sanctuaryLandmarks }
      })),

      updateRecoveryCapital: (recoveryCapital) => set((state) => ({
        recoveryCapital,
        sobriety: { ...state.sobriety, footsteps: state.sobriety.footsteps + 20 }
      })),

      updateBiometrics: (data) => {
        set((state) => ({
          biometrics: { ...state.biometrics, ...data, lastSync: new Date().toISOString() }
        }));
        if (data.heartRate && data.heartRate > 105) get().refreshAtmosphere();
      },

      updateStreak: () => {
        const { sobriety, settings, user } = get();
        const last = sobriety.lastActivityDate ? new Date(sobriety.lastActivityDate) : null;
        const now = new Date();
        const todayStr = now.toDateString();
        
        if (last && last.toDateString() === todayStr) return;

        let newStreak = 1;
        if (last) {
          const diffTime = Math.abs(now.getTime() - last.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            newStreak = sobriety.currentStreak + 1;
            triggerHaptic('LANDMARK');
            
            // Streak Email Detection
            if (settings.emailNotificationsEnabled && [3, 7, 30, 90, 365].includes(newStreak)) {
              get().dispatchMilestoneEmail(`${newStreak}-Day Presence Streak`, 'streak');
            }
          }
        }

        set({
          sobriety: {
            ...sobriety,
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, sobriety.longestStreak),
            lastActivityDate: now.toISOString()
          }
        });
      },

      refreshAtmosphere: async () => {
        const { moods, biometrics, sobriety } = get();
        try {
          const newAtmosphere = await analyzeNervousSystemAtmosphere(moods, biometrics);
          if (newAtmosphere) {
            set({ sobriety: { ...sobriety, atmosphere: newAtmosphere } });
          }
        } catch (e) {
          console.error("Atmosphere refresh failed", e);
        }
      },

      refreshArchive: async () => {
        const { moods, completedLessons, journalEntries } = get();
        if (moods.length < 5 && journalEntries.length < 3) return;
        try {
          const summary = await generateJourneySummary(moods, completedLessons, journalEntries);
          if (summary) set({ archiveSummary: summary });
        } catch (e) {
          console.error("Archive refresh failed", e);
        }
      },

      addMood: (entry) => {
        get().updateStreak();
        set((state) => ({
          moods: [...state.moods, entry],
          sobriety: { ...state.sobriety, footsteps: state.sobriety.footsteps + 2 }
        }));
        get().refreshAtmosphere();
        if (get().moods.length % 5 === 0) get().refreshArchive();
      },

      addJournalEntry: (entry) => {
        get().updateStreak();
        set((state) => ({
          journalEntries: [...state.journalEntries, entry],
          sobriety: { ...state.sobriety, footsteps: state.sobriety.footsteps + 5 }
        }));
        if (get().journalEntries.length % 3 === 0) get().refreshArchive();
      },

      updateJournalEntry: (updated) => set((state) => ({
        journalEntries: state.journalEntries.map(e => e.id === updated.id ? updated : e),
        sobriety: { ...state.sobriety, footsteps: state.sobriety.footsteps + 1 }
      })),

      addGoal: (goal) => set((state) => ({
        goals: [...state.goals, goal],
        sobriety: { ...state.sobriety, footsteps: state.sobriety.footsteps + 10 }
      })),

      updateGoal: (updated) => set((state) => ({
        goals: state.goals.map(g => g.id === updated.id ? updated : g)
      })),

      markExerciseComplete: (id, lesson) => {
        get().updateStreak();
        triggerHaptic('LANDMARK');
        set((state) => {
          const alreadyDone = state.completedExercises.includes(id);
          const newLessons = lesson ? [
            ...state.completedLessons, 
            { ...lesson, id: `${id}-${Date.now()}`, exerciseId: id, date: new Date().toISOString() }
          ] : [
            ...state.completedLessons,
            { id: `${id}-${Date.now()}`, exerciseId: id, date: new Date().toISOString(), moduleName: COPING_EXERCISES.find(ex => ex.id === id)?.title || 'Unknown', rating: 5, reflection: 'Auto-completed step.' }
          ];

          const limitedLessons = newLessons.length > 100 
            ? newLessons.slice(-100)
            : newLessons;

          return {
            completedExercises: alreadyDone ? state.completedExercises : [...state.completedExercises, id],
            completedLessons: limitedLessons,
            sobriety: { ...state.sobriety, footsteps: state.sobriety.footsteps + (alreadyDone ? 2 : 10) }
          };
        });
        if (get().completedExercises.length % 3 === 0) get().refreshArchive();
      },

      toggleFavoriteTool: (id) => set((state) => {
        const isFavorite = state.favoriteToolIds.includes(id);
        const newFavorites = isFavorite 
          ? state.favoriteToolIds.filter(fid => fid !== id)
          : [...state.favoriteToolIds, id];
        return { favoriteToolIds: newFavorites };
      }),

      saveRPP: (rppData) => set((state) => ({
        rppData,
        sobriety: { ...state.sobriety, footsteps: state.sobriety.footsteps + 10 }
      })),

      addCommunityPost: (post) => {
        get().updateStreak();
        set((state) => ({
          communityPosts: [post, ...state.communityPosts],
          sobriety: { ...state.sobriety, footsteps: state.sobriety.footsteps + 15 }
        }));
      },

      reactToPost: (postId, reaction) => set((state) => ({
        communityPosts: state.communityPosts.map(p => 
          p.id === postId ? { ...p, reactions: { ...p.reactions, [reaction]: p.reactions[reaction] + 1 } } : p
        )
      })),

      addComment: (postId, comment) => {
        get().updateStreak();
        set((state) => ({
          communityPosts: state.communityPosts.map(p => 
            p.id === postId ? { ...p, comments: [...p.comments, comment] } : p
          ),
          sobriety: { ...state.sobriety, footsteps: state.sobriety.footsteps + 2 }
        }));
      },

      addBeacon: (beacon) => set((state) => ({
        sobriety: { ...state.sobriety, beacons: [beacon, ...state.sobriety.beacons], serviceFootsteps: state.sobriety.serviceFootsteps + 50 }
      })),

      addMeetingSession: (session) => set((state) => ({
        sobriety: { 
          ...state.sobriety, 
          meetingHistory: [session, ...state.sobriety.meetingHistory],
          footsteps: state.sobriety.footsteps + 25 
        }
      })),

      checkBadges: () => {
        const { sobriety, journalEntries, completedExercises, completedLessons, communityPosts, moods, settings } = get() as RecoveryState;
        const currentBadgeIds = sobriety.badges.map(b => b.id);
        let newlyEarned: Badge | null = null;

        const somaticIds = COPING_EXERCISES.filter(ex => ex.category === 'Somatic' || ex.category === 'EMDR Tools' || ex.framework === 'Somatic').map(ex => ex.id);
        const somaticCount = completedLessons.filter(l => somaticIds.includes(l.exerciseId)).length;
        const breathingCount = completedLessons.filter(l => l.exerciseId === 'breathing-exercises').length;

        BADGE_LIBRARY.forEach(libBadge => {
          if (currentBadgeIds.includes(libBadge.id)) return;
          let met = false;
          
          if (libBadge.id === 'first-step' && (sobriety.footsteps as number) >= 1) met = true;
          if (libBadge.id === 'streak-3' && sobriety.currentStreak >= 3) met = true;
          if (libBadge.id === 'streak-7' && sobriety.currentStreak >= 7) met = true;
          if (libBadge.id === 'streak-30' && sobriety.currentStreak >= 30) met = true;
          
          if (libBadge.id === 'truth-seeker' && completedExercises.includes('chain-analysis')) met = true;
          if (libBadge.id === 'zen-master') {
             const count = completedExercises.filter(id => ['breathing-exercises', 'meditation-timer', 'video-sanctuary', 'grounding'].includes(id)).length;
             if (count >= 3) met = true;
          }
          if (libBadge.id === 'vagus-guardian' && breathingCount >= 10) met = true;
          if (libBadge.id === 'hope-scribe' && journalEntries.length >= 3) met = true;
          if (libBadge.id === 'somatic-sage' && somaticCount >= 5) met = true;
          
          if (libBadge.id === 'boundary-architect') {
            if (completedExercises.includes('emotional-boundaries') && completedExercises.includes('assertiveness-tool')) met = true;
          }

          if (libBadge.id === 'connector') {
            const userComments = communityPosts.reduce((acc, p) => acc + p.comments.filter(c => c.author === get().user?.name).length, 0);
            const userPosts = communityPosts.filter(p => p.author === get().user?.name).length;
            if (userComments + userPosts >= 3) met = true;
          }

          if (libBadge.id === 'beacon-of-hope' && sobriety.beacons.length >= 5) met = true;
          if (libBadge.id === 'shadow-walker' && completedExercises.includes('shadow-work')) met = true;
          
          if (libBadge.id === 'stoic-anchor') {
            const wasStormy = sobriety.atmosphere?.state === 'stormy';
            const lastMood = moods[moods.length - 1];
            if (wasStormy && (lastMood?.mood === 'good' || lastMood?.mood === 'great')) met = true;
          }

          if (met) {
            const { requirement, ...badgeData } = libBadge;
            newlyEarned = { 
              ...badgeData,
              category: badgeData.category as any,
              earnedAt: new Date().toISOString() 
            };
          }
        });

        if (newlyEarned) {
          triggerHaptic('LANDMARK');
          set((state) => ({ sobriety: { ...state.sobriety, badges: [...state.sobriety.badges, newlyEarned!] } }));
          
          // Badge Email Notification
          if (settings.emailNotificationsEnabled) {
            get().dispatchMilestoneEmail(`Badge Earned: ${newlyEarned.title}`, 'badge');
          }
        }
        return newlyEarned;
      },

      updateZoho: (data) => set((state) => ({
        zoho: { ...state.zoho, ...data }
      })),

      cacheAudio: (text, base64) => set((state) => ({
        audioCache: { ...state.audioCache, [text]: base64 }
      })),

      setCurrentlySpeakingText: (currentlySpeakingText) => set({ currentlySpeakingText }),

      updateSomaticMap: (somaticMap) => set((state) => ({
        sobriety: { ...state.sobriety, somaticMap }
      })),

      oneSentenceTruth: (text) => {
        const entry: JournalEntry = {
          id: `truth-${Date.now()}`,
          date: new Date().toISOString(),
          content: `Victory of the Moment: ${text}`,
          mood: 'great'
        };
        get().addJournalEntry(entry);
        triggerHaptic('LANDMARK');
      },

      setNavigationOrigin: (navigationOrigin) => set({ navigationOrigin }),

      dispatchMilestoneEmail: async (milestone, type) => {
        const user = get().user;
        if (!user) return;
        
        try {
          const content = await generateMilestoneEmail(user.name, milestone, type);
          if (content) {
            set({ 
              lastEmailDispatch: { 
                milestone, 
                content, 
                timestamp: new Date().toISOString() 
              } 
            });
            // In a real app, this is where we'd fetch an external mailing API
            console.log(`[SIMULATED EMAIL DISPATCH TO ${user.email}]:`, content);
          }
        } catch (e) {
          console.error("Email dispatch simulation failed", e);
        }
      },

      clearEmailToast: () => set({ lastEmailDispatch: null })
    }),
    { 
      name: 'footpath-recovery-storage',
      storage: createJSONStorage(() => idbStorage) 
    }
  )
);