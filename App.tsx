import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ChatSupport from './components/ChatSupport';
import LiveSupport from './components/LiveSupport';
import CommunityHub from './components/CommunityHub';
import Journal from './components/Journal';
import Profile from './components/Profile';
import Meetings from './components/Meetings';
import PhaseView from './components/PhaseView';
import ChainAnalysis from './components/ChainAnalysis';
import MeditationTimer from './components/MeditationTimer';
import EmergencyIntervention from './components/EmergencyIntervention';
import RelapsePreventionPlan from './components/RelapsePreventionPlan';
import AffirmationGallery from './components/AffirmationGallery';
import DailyAffirmations from './components/DailyAffirmations';
import SomaticToolkit from './components/SomaticToolkit';
import EMDRProtocols from './components/EMDRProtocols';
import AttachmentQuiz from './components/AttachmentQuiz';
import UrgeSurfing from './components/UrgeSurfing';
import WindowOfTolerance from './components/WindowOfTolerance';
import SmartGoals from './components/SmartGoals';
import GroundingTool from './components/GroundingTool';
import SpiritualityModule from './components/SpiritualityModule';
import StopSkill from './components/StopSkill';
import TippSkill from './components/TippSkill';
import AcceptsSkill from './components/AcceptsSkill';
import ImproveSkill from './components/ImproveSkill';
import AcceptanceTool from './components/AcceptanceTool';
import EmotionalBoundaries from './components/EmotionalBoundaries';
import CognitiveReframing from './components/CognitiveReframing';
import EmotionalExploration from './components/EmotionalExploration';
import AccountabilityTool from './components/AccountabilityTool';
import SelfCriticismTool from './components/SelfCriticismTool';
import BehaviourTree from './components/BehaviourTree';
import AssertivenessTool from './components/AssertivenessTool';
import SelfEsteemFoundations from './components/SelfEsteemFoundations';
import InnerCriticTool from './components/InnerCriticTool';
import ProgressMonitoring from './components/ProgressMonitoring';
import GuidedJourney from './components/GuidedJourney';
import VideoSanctuary from './components/VideoSanctuary';
import BreathingExercise from './components/BreathingExercise';
import RewardsGallery from './components/RewardsGallery';
import CostBenefitAnalysis from './components/CostBenefitAnalysis';
import DailyPlanner from './components/DailyPlanner';
import CrisisCard from './components/CrisisCard';
import MoodModal from './components/MoodModal';
import BadgeCelebration from './components/BadgeCelebration';
import ScienceHub from './components/ScienceHub';
import ExposureTool from './components/ExposureTool';
import ProblemSolving from './components/ProblemSolving';
import WorkingBackwards from './components/WorkingBackwards';
import PainManagement from './components/PainManagement';
import ModuleSupport from './components/ModuleSupport';
import TrustModule from './components/TrustModule';
import FirstAidToolkit from './components/FirstAidToolkit';
import GuideNudge from './components/GuideNudge';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import TherapySkillsHub, { TherapyType } from './components/TherapySkillsHub';
import AllToolsView from './components/AllToolsView';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorDisplay from './components/ErrorDisplay';
import RecoveryCapitalAssessment from './components/RecoveryCapitalAssessment';
import BoundarySandbox from './components/BoundarySandbox';
import PolyvagalGrounding from './components/PolyvagalGrounding';
import BiometricSync from './components/BiometricSync';
import HaltCheck from './components/HaltCheck';
import WiseMindTool from './components/WiseMindTool';
import RelapseHub from './components/RelapseHub';
import Archive from './components/Archive';
import ShadowHub from './components/ShadowHub';
import WayfindersBeacon from './components/WayfindersBeacon';
import SomaticMapping from './components/SomaticMapping';
import EmergencyDashboard from './components/EmergencyDashboard';
import WalkingMeditation from './components/WalkingMeditation';
import RestSkill from './components/RestSkill';
import CrisisSurvivalKit from './components/CrisisSurvivalKit';
import PhysiologicalCoping from './components/PhysiologicalCoping';
import ThoughtDefusionTool from './components/ThoughtDefusionTool';
import OppositeActionTool from './components/OppositeActionTool';
import CognitiveRehearsal from './components/CognitiveRehearsal';
import ReducingVulnerability from './components/ReducingVulnerability';
import { AppRoute, MoodEntry, JournalEntry, Badge, CompletedLesson, RelapsePreventionPlan as RPPType } from './types';
import { COPING_EXERCISES, RECOVERY_PHASES } from './constants.tsx';
import { checkCrisisStatus, getProactiveNudge, generateSpeech, playSpeech, stopAllSpeech } from './geminiService';
import { useRecoveryStore } from './store';
import { triggerHaptic } from './haptics';

const HUB_ROUTES = new Set([
  AppRoute.HOME, AppRoute.JOURNEY, AppRoute.SUPPORT, AppRoute.COMMUNITY, 
  AppRoute.PROFILE, AppRoute.MEETINGS, AppRoute.ARCHIVE, AppRoute.ALL_TOOLS, 
  AppRoute.DBT_HUB, AppRoute.CBT_HUB, AppRoute.MINDFULNESS_HUB, 
  AppRoute.SOMATIC_HUB, AppRoute.ACT_HUB, AppRoute.STRATEGY_HUB, 
  AppRoute.RELAPSE_HUB, AppRoute.FIRST_AID, AppRoute.REWARDS, AppRoute.SCIENCE_HUB
]);

const App: React.FC = () => {
  const store = useRecoveryStore();
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.HOME);
  const [journeyView, setJourneyView] = useState<'phases' | 'path'>('path');
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [celebratingBadge, setCelebratingBadge] = useState<Badge | null>(null);
  const [appError, setAppError] = useState<string | null>(null);
  
  const [nudgeState, setNudgeState] = useState<{ isOpen: boolean; message: string; context: string }>({
    isOpen: false, message: '', context: ''
  });

  const lastNudgeTime = useRef<number>(0);
  const recognitionRef = useRef<any>(null);

  const [supportConfig, setSupportConfig] = useState<{
    isOpen: boolean;
    moduleName: string;
    framework: string;
    contextPrompt: string;
  }>({ isOpen: false, moduleName: '', framework: '', contextPrompt: '' });

  const openModuleSupport = useCallback((moduleName: string, framework: string, contextPrompt: string) => {
    setSupportConfig({ isOpen: true, moduleName, framework, contextPrompt });
  }, []);

  const lastMood = store.moods[store.moods.length - 1];
  const isDistressed = lastMood?.mood === 'crisis' || lastMood?.mood === 'struggling';

  const handleNavigate = (route: AppRoute) => {
    if (!HUB_ROUTES.has(route) && HUB_ROUTES.has(currentRoute)) {
      store.setNavigationOrigin(currentRoute);
    }
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReturnToOrigin = () => {
    const origin = store.navigationOrigin || AppRoute.HOME;
    setCurrentRoute(origin);
    store.setNavigationOrigin(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code && currentRoute !== AppRoute.ZOHO_CALLBACK) {
      setCurrentRoute(AppRoute.ZOHO_CALLBACK);
    }
  }, []);

  const handleVoiceIntent = async (transcript: string) => {
    const t = transcript.toLowerCase();
    let targetRoute: AppRoute | null = null;
    let confirmationMessage = "";

    if (t.includes("calm down") || t.includes("panic") || t.includes("can't breathe") || t.includes("anxious")) {
      targetRoute = AppRoute.BREATHING_EXERCISE;
      confirmationMessage = "I hear the distress in your voice, Traveller. Let's stabilise your system with a calming breath protocol.";
    }
    else if (t.includes("craving") || t.includes("urge") || t.includes("want to use") || t.includes("tempted")) {
      targetRoute = AppRoute.URGE_SURFING;
      confirmationMessage = "An urge is just a wave, Traveller. I am initiating the Urge Surfing protocol to help you ride this through.";
    }
    else if (t.includes("angry") || t.includes("frustrated") || t.includes("resentful") || t.includes("pissed off")) {
      targetRoute = AppRoute.SOMATIC_TOOLKIT;
      confirmationMessage = "I sense your frustration. Let's move that energy out of your body with a somatic reset.";
    }
    else if (t.includes("lonely") || t.includes("sad") || t.includes("depressed") || t.includes("talk to someone")) {
      targetRoute = AppRoute.SUPPORT;
      confirmationMessage = "You are not alone on this path. Opening our sacred chat sanctuary now.";
    }
    else if (t.includes("struggling") || t.includes("help") || t.includes("guide i'm struggling")) {
      targetRoute = AppRoute.FIRST_AID;
      confirmationMessage = "Initialising the First Aid protocol. We will find your centre together.";
    }

    if (targetRoute) {
      if (!store.settings.isQuietMode && confirmationMessage) {
        stopAllSpeech();
        const base64 = await generateSpeech(confirmationMessage);
        if (base64) await playSpeech(base64);
      }
      handleNavigate(targetRoute);
      triggerHaptic('URGENT');
    }
  };

  useEffect(() => {
    if (!store.isAuthenticated || !store.user?.onboardingCompleted || !store.settings.handsFreeEnabled) {
       if (recognitionRef.current) {
          recognitionRef.current.stop();
          recognitionRef.current = null;
       }
       return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const startRecognition = () => {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-GB';
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onresult = async (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('').toLowerCase();
          
          if (transcript.includes("guide")) {
            handleVoiceIntent(transcript);
          }
        };

        recognition.onend = () => {
          if (store.isAuthenticated && store.settings.handsFreeEnabled) startRecognition();
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (e) {
        console.error("Wake-word listener failed to start:", e);
      }
    };

    startRecognition();

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [store.isAuthenticated, store.user?.onboardingCompleted, store.settings.handsFreeEnabled, store.settings.isQuietMode]);

  useEffect(() => {
    if (!store.settings.bioNudgesEnabled) return;

    const checkVulnerability = async () => {
      const restrictedRoutes = [AppRoute.TIPP_SKILL, AppRoute.STOP_SKILL, AppRoute.BREATHING_EXERCISE, AppRoute.HALT_CHECK];
      if (restrictedRoutes.includes(currentRoute)) return;
      if (Date.now() - lastNudgeTime.current < 300000) return;

      if (store.biometrics.isSynced && store.biometrics.heartRate > 105) {
        lastNudgeTime.current = Date.now();
        
        if (!store.settings.isQuietMode) {
          triggerHaptic('URGENT');
        }

        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification("Biological Spike Detected", {
            body: `Traveller, your pulse is ${store.biometrics.heartRate}bpm. Your system is in high-arousal. Shall we breathe?`,
            icon: "https://cdn-icons-png.flaticon.com/192/3209/3209949.png",
            tag: "vagal-spike",
            requireInteraction: true
          });
        }

        const message = await getProactiveNudge(`Vagal Spike: User heart rate is ${store.biometrics.heartRate}bpm.`);
        setNudgeState({
          isOpen: true,
          message: message || "I've detected a significant spike in your pulse. Your system is in high-arousal. Should we pause for a TIPP reset?",
          context: `Biometric high detected: ${store.biometrics.heartRate}bpm.`
        });
      }
    };

    const interval = setInterval(checkVulnerability, 10000);
    return () => clearInterval(interval);
  }, [store.biometrics.heartRate, store.biometrics.isSynced, store.settings.bioNudgesEnabled, store.settings.isQuietMode, currentRoute]);

  const handleAddMood = async (entry: MoodEntry) => {
    try {
      store.addMood(entry);
      const isCrisis = entry.mood === 'crisis' || checkCrisisStatus(entry.note);
      if (isCrisis) {
        setIsCrisisModalOpen(true);
      } else if (entry.mood === 'struggling' && store.settings.bioNudgesEnabled) {
        const invitation = await getProactiveNudge(`Mood: Struggling. Note: ${entry.note}`);
        setNudgeState({ isOpen: true, message: invitation, context: `User logged a struggling mood.` });
      }
      
      // Post-mood check for badges
      store.checkBadges();
    } catch (err) {
      console.error("Mood check failed:", err);
    }
  };
  
  const handleAddJournalEntry = async (entry: JournalEntry) => {
    try {
      store.addJournalEntry(entry);
      if (checkCrisisStatus(entry.content)) {
        setIsCrisisModalOpen(true);
      }
      // Post-journal check for badges
      store.checkBadges();
    } catch (err) {
      console.error("Journal check failed:", err);
    }
  };

  const handleExerciseCompleteWithJournal = (id: string, rating?: number, reflection?: string, artUrl?: string) => {
    const exercise = COPING_EXERCISES.find(ex => ex.id === id);
    if (exercise) {
      store.markExerciseComplete(id, { 
        moduleName: exercise.title, 
        rating: rating ?? 5, 
        reflection: reflection ?? 'Landmark achieved.', 
        artUrl 
      });
    } else {
      store.markExerciseComplete(id);
    }

    if (exercise) {
      const newEntry: JournalEntry = {
        id: `auto-${Date.now()}`,
        date: new Date().toISOString(),
        content: `I reached a landmark at the "${exercise.title}" node. ${reflection || 'The journey continues upward.'}`,
        mood: 'neutral',
        imageUrl: artUrl
      };
      handleAddJournalEntry(newEntry);
      
      const inFirstAidFlow = sessionStorage.getItem('first_aid_active_flow') === 'true';
      if (inFirstAidFlow) {
        setCurrentRoute(AppRoute.FIRST_AID);
      } else {
        handleReturnToOrigin();
      }
    } else {
      handleReturnToOrigin();
    }
  };

  const handleStartExercise = (id: string) => {
    const routeMap: Record<string, AppRoute> = {
      'wise-mind': AppRoute.WISE_MIND,
      'chain-analysis': AppRoute.CHAIN_ANALYSIS,
      'cost-benefit-analysis': AppRoute.COST_BENEFIT_ANALYSIS,
      'daily-planner': AppRoute.DAILY_PLANNER,
      'meditation-timer': AppRoute.MEDITATION,
      'rpp-builder': AppRoute.RPP_BUILDER,
      'urge-surfing': AppRoute.URGE_SURFING,
      'window-of-tolerance': AppRoute.WINDOW_OF_TOLERANCE,
      'somatic-toolkit': AppRoute.SOMATIC_TOOLKIT,
      'butterfly-hug': AppRoute.EMDR_TOOLS,
      'affirmation-deck': AppRoute.AFFIRMATIONS,
      'daily-affirmations': AppRoute.DAILY_AFFIRMATIONS,
      'smart-goals': AppRoute.SMART_GOALS,
      'grounding': AppRoute.GROUNDING,
      'spirituality': AppRoute.SPIRITUALITY,
      'stop-skill': AppRoute.STOP_SKILL,
      'tipp-skill': AppRoute.TIPP_SKILL,
      'accepts-skill': AppRoute.ACCEPTS_SKILL,
      'improve-skill': AppRoute.IMPROVE_SKILL,
      'radical-acceptance': AppRoute.RADICAL_ACCEPTANCE,
      'emotional-boundaries': AppRoute.EMOTIONAL_BOUNDARIES,
      'cognitive-reframing': AppRoute.COGNITIVE_REFRAMING,
      'emotional-exploration': AppRoute.EMOTIONAL_EXPLORATION,
      'accountability-journey': AppRoute.ACCOUNTABILITY_JOURNEY,
      'self-criticism-workshop': AppRoute.SELF_CRITICISM_WORKSHOP,
      'behaviour-tree': AppRoute.BEHAVIOUR_TREE,
      'assertiveness-tool': AppRoute.ASSERTIVENESS_TOOL,
      'self-esteem-foundations': AppRoute.SELF_ESTEEM_FOUNDATIONS,
      'inner-critic-challenge': AppRoute.INNER_CRITIC_CHALLENGE,
      'progress-monitoring': AppRoute.PROGRESS_MONITORING,
      'video-sanctuary': AppRoute.VIDEO_SANCTUARY,
      'breathing-exercises': AppRoute.BREATHING_EXERCISE,
      'exposure_tool': AppRoute.EXPOSURE_TOOL,
      'problem_solving': AppRoute.PROBLEM_SOLVING,
      'working_backwards': AppRoute.WORKING_BACKWARDS,
      'pain_management': AppRoute.PAIN_MANAGEMENT,
      'trust_steps': AppRoute.TRUST_STEPS,
      'first_aid': AppRoute.FIRST_AID,
      'shadow-work': AppRoute.SHADOW_WORK,
      'wayfinder-beacon': AppRoute.WAYFINDER_BEACON,
      'somatic_mapping': AppRoute.SOMATIC_MAPPING,
      'walking_meditation': AppRoute.WALKING_MEDITATION,
      'rest-skill': AppRoute.REST_SKILL,
      'crisis-survival-kit': AppRoute.CRISIS_SURVIVAL_KIT,
      'physiological-coping': AppRoute.PHYSIOLOGICAL_COPING,
      'thought-defusion': AppRoute.THOUGHT_DEFUSION,
      'opposite-action': AppRoute.OPPOSITE_ACTION,
      'cognitive-rehearsal': AppRoute.COGNITIVE_REHEARSAL,
      'reducing-vulnerability': AppRoute.REDUCING_VULNERABILITY
    };
    if (routeMap[id]) {
      handleNavigate(routeMap[id]);
    }
  };

  const renderContent = () => {
    if (appError) return <ErrorDisplay error={appError} onHome={() => { setAppError(null); handleNavigate(AppRoute.HOME); }} />;

    switch (currentRoute) {
      case AppRoute.HOME:
        return <Dashboard sobriety={store.sobriety} moods={store.moods} rppData={store.rppData} onAddMood={handleAddMood} onAddMilestone={store.addMilestone} onUpdateSobrietyDate={store.updateSobrietyDate} onUpdateDailySpend={store.updateDailySpend} onHelpMe={() => setIsCrisisModalOpen(true)} onOpenMoodModal={() => setIsMoodModalOpen(true)} onAwardFootsteps={store.awardFootsteps} isDarkMode={true} onStartJourney={() => handleNavigate(AppRoute.JOURNEY)} onSetRoute={handleNavigate} onStartExercise={handleStartExercise} />;
      case AppRoute.REST_SKILL:
        return <RestSkill onExit={() => handleExerciseCompleteWithJournal('rest-skill')} />;
      case AppRoute.CRISIS_SURVIVAL_KIT:
        return <CrisisSurvivalKit onExit={() => handleExerciseCompleteWithJournal('crisis-survival-kit')} />;
      case AppRoute.PHYSIOLOGICAL_COPING:
        return <PhysiologicalCoping onExit={() => handleExerciseCompleteWithJournal('physiological-coping')} />;
      case AppRoute.THOUGHT_DEFUSION:
        return <ThoughtDefusionTool onExit={() => handleExerciseCompleteWithJournal('thought-defusion')} />;
      case AppRoute.OPPOSITE_ACTION:
        return <OppositeActionTool onExit={() => handleExerciseCompleteWithJournal('opposite-action')} />;
      case AppRoute.COGNITIVE_REHEARSAL:
        return <CognitiveRehearsal onExit={() => handleExerciseCompleteWithJournal('cognitive-rehearsal')} />;
      case AppRoute.REDUCING_VULNERABILITY:
        return <ReducingVulnerability onExit={() => handleExerciseCompleteWithJournal('reducing-vulnerability')} />;
      case AppRoute.HALT_CHECK:
        return <HaltCheck onComplete={handleAddMood} onExit={handleReturnToOrigin} onSetRoute={handleNavigate} />;
      case AppRoute.SOMATIC_MAPPING:
        return <SomaticMapping onExit={(r, refl) => handleExerciseCompleteWithJournal('somatic_mapping', r, refl)} />;
      case AppRoute.COMMUNITY:
        return <CommunityHub />;
      case AppRoute.WALKING_MEDITATION:
        return <WalkingMeditation onExit={handleReturnToOrigin} />;
      case AppRoute.JOURNEY:
        return (
            <div className="space-y-12">
                <div className="flex justify-center">
                    <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-2 rounded-[32px] border border-white/20 flex gap-2 shadow-sm">
                        <button onClick={() => setJourneyView('path')} className={`px-10 py-3 rounded-[24px] font-black text-xs transition-all uppercase tracking-widest ${journeyView === 'path' ? 'bg-teal-600 text-white shadow-xl' : 'text-slate-400 hover:text-teal-400'}`}>The Path</button>
                        <button onClick={() => setJourneyView('phases')} className={`px-10 py-3 rounded-[24px] font-black text-xs transition-all uppercase tracking-widest ${journeyView === 'phases' ? 'bg-teal-600 text-white shadow-xl' : 'text-slate-400 hover:text-teal-400'}`}>Phases</button>
                    </div>
                </div>
                {journeyView === 'path' ? <GuidedJourney completedIds={store.completedExercises} onStartExercise={handleStartExercise} /> : <PhaseView phaseId={store.activePhaseId} onStartExercise={handleStartExercise} completedIds={store.completedExercises} />}
            </div>
        );
      case AppRoute.ALL_TOOLS: return <AllToolsView onStartExercise={handleStartExercise} setRoute={handleNavigate} />;
      case AppRoute.ARCHIVE: return <Archive />;
      case AppRoute.SHADOW_WORK: return <ShadowHub onExit={(r, refl, art) => handleExerciseCompleteWithJournal('shadow-work', r, refl, art)} />;
      case AppRoute.WAYFINDER_BEACON: return <WayfindersBeacon onExit={(r, refl) => handleExerciseCompleteWithJournal('wayfinder-beacon', r, refl)} />;
      case AppRoute.DBT_HUB: return <TherapySkillsHub type="dbt" onStartExercise={handleStartExercise} onAskGuide={(title, fw) => openModuleSupport(title, fw, 'General hub inquiry')} onBack={() => handleNavigate(AppRoute.ALL_TOOLS)} />;
      case AppRoute.CBT_HUB: return <TherapySkillsHub type="cbt" onStartExercise={handleStartExercise} onAskGuide={(title, fw) => openModuleSupport(title, fw, 'General hub inquiry')} onBack={() => handleNavigate(AppRoute.ALL_TOOLS)} />;
      case AppRoute.MINDFULNESS_HUB: return <TherapySkillsHub type="mindfulness" onStartExercise={handleStartExercise} onAskGuide={(title, fw) => openModuleSupport(title, fw, 'General hub inquiry')} onBack={() => handleNavigate(AppRoute.ALL_TOOLS)} />;
      case AppRoute.SOMATIC_HUB: return <TherapySkillsHub type="somatic" onStartExercise={handleStartExercise} onAskGuide={(title, fw) => openModuleSupport(title, fw, 'General hub inquiry')} onBack={() => handleNavigate(AppRoute.ALL_TOOLS)} />;
      case AppRoute.ACT_HUB: return <TherapySkillsHub type="act" onStartExercise={handleStartExercise} onAskGuide={(title, fw) => openModuleSupport(title, fw, 'General hub inquiry')} onBack={() => handleNavigate(AppRoute.ALL_TOOLS)} />;
      case AppRoute.STRATEGY_HUB: return <TherapySkillsHub type="strategy" onStartExercise={handleStartExercise} onAskGuide={(title, fw) => openModuleSupport(title, fw, 'General hub inquiry')} onBack={() => handleNavigate(AppRoute.ALL_TOOLS)} />;
      case AppRoute.FIRST_AID: return <FirstAidToolkit onStartExercise={handleStartExercise} onAskGuide={() => openModuleSupport('Distress First Aid', 'DBT/Somatic', 'Immediate emotional regulation required.')} onStartPolyvagal={() => handleNavigate(AppRoute.POLYVAGAL_GROUNDING)} completedIds={store.completedExercises} onCompleteFirstAid={(r, refl, art) => handleExerciseCompleteWithJournal('first_aid', r, refl, art)} />;
      case AppRoute.SUPPORT: return <ChatSupport onCrisisDetected={() => setIsCrisisModalOpen(true)} sobriety={store.sobriety} recentMood={store.moods[store.moods.length-1]} phaseId={store.activePhaseId} />;
      case AppRoute.JOURNAL: return <Journal entries={store.journalEntries} onAddEntry={handleAddJournalEntry} onUpdateEntry={store.updateJournalEntry} currentPhaseTitle={RECOVERY_PHASES.find(p => p.id === store.activePhaseId)?.title} phaseId={store.activePhaseId} />;
      case AppRoute.LIVE_SUPPORT: return <LiveSupport onExit={handleReturnToOrigin} />;
      case AppRoute.SCIENCE_HUB: return <ScienceHub />;
      case AppRoute.PROFILE: return <Profile sobriety={store.sobriety} moods={store.moods} journalEntries={store.journalEntries} completedLessons={store.completedLessons} recoveryCapital={store.recoveryCapital} currentPhaseId={store.activePhaseId} onUpdateSobrietyDate={store.updateSobrietyDate} onUpdateTrueSelfTotem={store.updateTrueSelfTotem} setRoute={handleNavigate} onOpenMoodModal={() => setIsMoodModalOpen(true)} onStartExercise={handleStartExercise} />;
      case AppRoute.MEETINGS: return <Meetings />;
      case AppRoute.REWARDS: return <RewardsGallery sobriety={store.sobriety} />;
      case AppRoute.RPP_BUILDER: return <RelapsePreventionPlan initialData={store.rppData} onSave={store.saveRPP} onExit={handleReturnToOrigin} onAskGuide={() => openModuleSupport('Relapse Prevention', 'CBT/DBT', 'Safety netting')} />;
      case AppRoute.DAILY_PLANNER: return <DailyPlanner onExit={(r, refl, art) => handleExerciseCompleteWithJournal('daily-planner', r, refl, art)} onAskGuide={() => openModuleSupport('Routine Planner', 'Behavioural Activation', 'Structure in foundations')} />;
      case AppRoute.SMART_GOALS: return <SmartGoals phaseId={store.activePhaseId} goals={store.goals} onAddGoal={store.addGoal} onUpdateGoal={store.updateGoal} onExit={handleReturnToOrigin} onAskGuide={() => openModuleSupport('SMART Goals', 'ACT/CBT', 'Value-based planning')} />;
      case AppRoute.CHAIN_ANALYSIS: return <ChainAnalysis onComplete={(r, refl, art) => handleExerciseCompleteWithJournal('chain-analysis', r, refl, art)} onAskGuide={() => openModuleSupport('Chain Analysis', 'CBT Pattern Recognition', 'Deconstructing triggers')} />;
      case AppRoute.URGE_SURFING: return <UrgeSurfing onExit={(r, refl, art) => handleExerciseCompleteWithJournal('urge-surfing', r, refl, art)} onAskGuide={() => openModuleSupport('Urge Surfing', 'Mindfulness/DBT', 'Riding cravings')} />;
      case AppRoute.WINDOW_OF_TOLERANCE: return <WindowOfTolerance onExit={(r, refl, art) => handleExerciseCompleteWithJournal('window-of-tolerance', r, refl, art)} onAskGuide={() => openModuleSupport('Window of Tolerance', 'Polyvagal Theory', 'Nervous system arousal')} />;
      case AppRoute.SOMATIC_TOOLKIT: return <SomaticToolkit onExit={(r) => handleExerciseCompleteWithJournal('somatic-toolkit', r, 'Somatic tension release session.')} onAskGuide={() => openModuleSupport('Somatic Toolkit', 'Somatic Experiencing', 'Body-based tension release')} />;
      case AppRoute.EMDR_TOOLS: return <EMDRProtocols onExit={(r) => handleExerciseCompleteWithJournal('emdr-tools', r, 'Bilateral reprocessing complete.')} onAskGuide={() => openModuleSupport('EMDR Protocols', 'Bilateral Stimulation', 'Trauma reprocessing')} />;
      case AppRoute.ATTACHMENT_QUIZ: return <AttachmentQuiz onExit={(r) => handleExerciseCompleteWithJournal('attachment-quiz', r, 'Attachment style explored.')} onAskGuide={() => openModuleSupport('Attachment Theory', 'Relational Psychology', 'Relating to others')} />;
      case AppRoute.AFFIRMATIONS: return <AffirmationGallery onExit={(r) => handleExerciseCompleteWithJournal('affirmation-deck', r, 'Affirmation reflection completed.')} onAskGuide={() => openModuleSupport('Affirmation Deck', 'Positive Psychology', 'Cognitive reinforcement')} />;
      case AppRoute.DAILY_AFFIRMATIONS: return <DailyAffirmations onAwardFootsteps={store.awardFootsteps} onExit={(r, refl, art) => handleExerciseCompleteWithJournal('daily-affirmations', r, refl, art)} onAskGuide={() => openModuleSupport('Daily Anchor', 'ACT True-Self', 'Daily mindset focus')} />;
      case AppRoute.GROUNDING: return <GroundingTool onExit={(r, refl, art) => handleExerciseCompleteWithJournal('grounding', r, refl, art)} onAskGuideMap={() => openModuleSupport('5-4-3-2-1 Grounding', 'Mindfulness/Sensory', 'Immediate panic reset')} />;
      case AppRoute.STOP_SKILL: return <StopSkill onExit={(r, refl, art) => handleExerciseCompleteWithJournal('stop-skill', r, refl, art)} onAskGuideMap={() => openModuleSupport('STOP Skill', 'DBT', 'Immediate grounding')} />;
      case AppRoute.TIPP_SKILL: return <TippSkill onExit={(r) => handleExerciseCompleteWithJournal('tipp-skill', r, 'Biological reset complete.')} onAskGuide={() => openModuleSupport('TIPP Skill', 'DBT Bio-feedback', 'Physical resets')} />;
      case AppRoute.ACCEPTS_SKILL: return <AcceptsSkill onExit={(r, refl, art) => handleExerciseCompleteWithJournal('accepts-skill', r, refl, art)} onAskGuide={() => openModuleSupport('ACCEPTS Skill', 'DBT Distraction', 'Survival strategies')} />;
      case AppRoute.IMPROVE_SKILL: return <ImproveSkill onExit={(r) => handleExerciseCompleteWithJournal('improve-skill', r, 'Mindset shift completed.')} onAskGuide={() => openModuleSupport('IMPROVE Skill', 'DBT Cognition', 'Mental shifts')} />;
      case AppRoute.RADICAL_ACCEPTANCE: return <AcceptanceTool onExit={(r, refl) => handleExerciseCompleteWithJournal('radical-acceptance', r, refl)} onAskGuide={() => openModuleSupport('Radical Acceptance', 'DBT/Buddhist Psychology', 'Accepting reality')} />;
      case AppRoute.EMOTIONAL_BOUNDARIES: return <EmotionalBoundaries onExit={(r, refl) => handleExerciseCompleteWithJournal('emotional-boundaries', r, refl)} onAskGuide={() => openModuleSupport('Emotional Boundaries', 'Interpersonal Skills', 'Protecting your energy')} />;
      case AppRoute.COGNITIVE_REFRAMING: return <CognitiveReframing onExit={() => handleExerciseCompleteWithJournal('cognitive-reframing', 5, 'Reframed thinking pattern archived.')} onAskGuide={() => openModuleSupport('ABCDE Reframing', 'CBT', 'Challenging thought patterns')} />;
      case AppRoute.EMOTIONAL_EXPLORATION: return <EmotionalExploration onExit={(r, refl) => handleExerciseCompleteWithJournal('emotional-exploration', r, refl)} onAskGuideMap={() => openModuleSupport('Emotional Exploration', 'Depth Psychology', 'Connecting to roots')} />;
      case AppRoute.ACCOUNTABILITY_JOURNEY: return <AccountabilityTool onExit={(r, refl) => handleExerciseCompleteWithJournal('accountability_journey', r, refl)} onAskGuide={() => openModuleSupport('Accountability', 'Character Building', 'Owning the path')} />;
      case AppRoute.SELF_CRITICISM_WORKSHOP: return <SelfCriticismTool onExit={(r, refl) => handleExerciseCompleteWithJournal('self_criticism_workshop', r, refl)} onAskGuide={() => openModuleSupport('Self-Compassion', 'Mindful Compassion', 'Ending the inner war')} />;
      case AppRoute.BEHAVIOUR_TREE: return <BehaviourTree onExit={(r, refl) => handleExerciseCompleteWithJournal('behaviour_tree', r, refl)} onAskGuideMap={() => openModuleSupport('Behavioural Tree', 'CBT/Schema', 'Mapping deep patterns')} />;
      case AppRoute.ASSERTIVENESS_TOOL: return <AssertivenessTool onExit={(r, refl) => handleExerciseCompleteWithJournal('assertiveness_tool', r, refl)} onAskGuide={() => openModuleSupport('Assertiveness (DEAR MAN)', 'DBT Interpersonal', 'Communicating needs')} />;
      case AppRoute.SELF_ESTEEM_FOUNDATIONS: return <SelfEsteemFoundations onExit={(r, refl) => handleExerciseCompleteWithJournal('self_esteem_foundations', r, refl)} onAskGuide={() => openModuleSupport('Self-Esteem', 'ACT/Cognitive', 'Building worthiness')} />;
      case AppRoute.INNER_CRITIC_CHALLENGE: return <InnerCriticTool onExit={(r, refl) => handleExerciseCompleteWithJournal('inner-critic-challenge', r, refl)} onAskGuide={() => openModuleSupport('Inner Critic', 'CBT Challenge', 'Disputing negative voices')} title="Inner Critic Workshop" />;
      case AppRoute.PROGRESS_MONITORING: return <ProgressMonitoring onExit={() => handleExerciseCompleteWithJournal('progress_monitoring', 5, 'Progress summary reviewed.')} onAskGuide={() => openModuleSupport('Habit Tracking', 'Behavioural Activation', 'Monitoring success')} />;
      case AppRoute.VIDEO_SANCTUARY: return <VideoSanctuary onExit={() => handleExerciseCompleteWithJournal('video-sanctuary', 5, 'Sanctuary visit complete.')} onAskGuide={() => openModuleSupport('Video Sanctuary', 'Mindfulness/Visual', 'Atmospheric grounding')} />;
      case AppRoute.BREATHING_EXERCISE: return <BreathingExercise onExit={(r, refl, art) => handleExerciseCompleteWithJournal('breathing-exercises', r, refl, art)} onAskGuide={() => openModuleSupport('Paced Breathing', 'Biological Regulation', 'Calming the nervous system')} />;
      case AppRoute.MEDITATION: return <MeditationTimer onComplete={(r, refl, art) => handleExerciseCompleteWithJournal('meditation-timer', r, refl, art)} onAskGuide={() => openModuleSupport('Meditation Science', 'Mindfulness', 'Focused awareness')} />;
      case AppRoute.COST_BENEFIT_ANALYSIS: return <CostBenefitAnalysis onExit={(r, refl, art) => handleExerciseCompleteWithJournal('cost-benefit-analysis', r, refl, art)} onAskGuide={() => openModuleSupport('Cost-Benefit', 'Motivational Interviewing', 'Resolving ambivalence')} />;
      case AppRoute.EXPOSURE_TOOL: return <ExposureTool onComplete={(r) => handleExerciseCompleteWithJournal('exposure_tool', r, 'Exposure hierarchy updated.')} onAskGuide={() => openModuleSupport('Exposure Therapy', 'CBT Desensitisation', 'Facing triggers')} />;
      case AppRoute.PROBLEM_SOLVING: return <ProblemSolving onComplete={(r) => handleExerciseCompleteWithJournal('problem_solving', r, 'Problem deconstruction complete.')} onAskGuide={() => openModuleSupport('SOLVE Model', 'CBT Solutions', 'Structured resolution')} />;
      case AppRoute.WORKING_BACKWARDS: return <WorkingBackwards onComplete={(r) => handleExerciseCompleteWithJournal('working_backwards', r, 'Backward planning vision archived.')} onAskGuide={() => openModuleSupport('Backward Planning', 'ACT Visioning', 'Future True-Self planning')} />;
      case AppRoute.PAIN_MANAGEMENT: return <PainManagement onComplete={(r) => handleExerciseCompleteWithJournal('pain_management', r, 'Somatic pain management practice complete.')} onAskGuide={() => openModuleSupport('Somatic Release', 'MBSR', 'Pain/Anxiety loop')} />;
      case AppRoute.SPIRITUALITY: return <SpiritualityModule onExit={() => handleExerciseCompleteWithJournal('spirituality', 5, 'Spiritual meaning mapping complete.')} onAskGuideMap={() => openModuleSupport('Spirituality & Meaning', 'ACT/Existential', 'Finding deeper purpose')} />;
      case AppRoute.TRUST_STEPS: return <TrustModule onExit={(r, refl, art) => handleExerciseCompleteWithJournal('trust_steps', r, refl, art)} onAskGuide={() => openModuleSupport('Trust Steps', 'Gottman Interpersonal', 'Repairing connections')} />;
      case AppRoute.WISE_MIND: return <WiseMindTool onExit={(r, refl, art) => handleExerciseCompleteWithJournal('wise-mind', r, refl, art)} onAskGuide={() => openModuleSupport('Wise Mind', 'DBT Core', 'Synthesis of reason and emotion')} />;
      case AppRoute.RELAPSE_HUB: return <RelapseHub onSetRoute={handleNavigate} onClose={handleReturnToOrigin} />;
      case AppRoute.REWARDS: return <RewardsGallery sobriety={store.sobriety} />;
      case AppRoute.RECOVERY_CAPITAL: return <RecoveryCapitalAssessment onExit={handleReturnToOrigin} />;
      case AppRoute.BOUNDARY_SANDBOX: return <BoundarySandbox onExit={handleReturnToOrigin} />;
      case AppRoute.BIOMETRIC_SYNC: return <BiometricSync onExit={handleReturnToOrigin} />;
      case AppRoute.POLYVAGAL_GROUNDING: return <PolyvagalGrounding onExit={handleReturnToOrigin} />;
      default: return <Dashboard sobriety={store.sobriety} moods={store.moods} rppData={store.rppData} onAddMood={handleAddMood} onAddMilestone={store.addMilestone} onUpdateSobrietyDate={store.updateSobrietyDate} onUpdateDailySpend={store.updateDailySpend} onHelpMe={() => setIsCrisisModalOpen(true)} onOpenMoodModal={() => setIsMoodModalOpen(true)} onAwardFootsteps={store.awardFootsteps} isDarkMode={true} onStartJourney={() => handleNavigate(AppRoute.JOURNEY)} onSetRoute={handleNavigate} onStartExercise={handleStartExercise} />;
    }
  };

  const isHighVisibilityTool = currentRoute === AppRoute.SUPPORT || currentRoute === AppRoute.BREATHING_EXERCISE;
  const unifiedSponsorNumber = store.user?.sponsorNumber || store.rppData?.sponsorNumber;

  return (
    <ErrorBoundary>
      {isDistressed && !isHighVisibilityTool ? (
        <EmergencyDashboard 
          sponsorNumber={unifiedSponsorNumber}
          lastMood={lastMood} 
          onRecover={() => handleAddMood({
            id: Date.now().toString(),
            date: new Date().toISOString(),
            mood: 'good',
            note: 'System regulated. Returned to optimal zone.'
          })}
          onSetRoute={handleNavigate}
          onOpenCrisisCard={() => setIsCrisisModalOpen(true)}
        />
      ) : (
        <Layout 
          activeRoute={currentRoute} 
          setRoute={handleNavigate} 
          onOpenMood={() => setIsMoodModalOpen(true)} 
          onOpenSafety={() => setIsCrisisModalOpen(true)}
        >
          {renderContent()}
        </Layout>
      )}
      
      {store.lastEmailDispatch && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[2000] w-full max-w-sm px-4 animate-in slide-in-from-bottom-10 duration-700">
           <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-4 border-indigo-600 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 rounded-xl flex items-center justify-center text-xl">📧</div>
                   <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Email Dispatched</h4>
                </div>
                <button onClick={() => store.clearEmailToast()} className="text-slate-400">✕</button>
              </div>
              <p className="text-xs text-slate-500 font-bold italic leading-relaxed">
                "I've sent a formal commendation for your <strong>{store.lastEmailDispatch.milestone}</strong> to your secure address."
              </p>
           </div>
        </div>
      )}

      <CrisisCard isOpen={isCrisisModalOpen} onClose={() => setIsCrisisModalOpen(false)} sponsorNumber={unifiedSponsorNumber} />
      <MoodModal isOpen={isMoodModalOpen} onClose={() => setIsMoodModalOpen(false)} onSubmit={handleAddMood} />
      <BadgeCelebration badge={celebratingBadge} onClose={() => setCelebratingBadge(null)} />
      <ModuleSupport {...supportConfig} onClose={() => setSupportConfig(prev => ({ ...prev, isOpen: false }))} />
      {nudgeState.isOpen && (
        <GuideNudge 
          message={nudgeState.message} 
          hasSponsor={!!unifiedSponsorNumber}
          onCallSponsor={() => {
            if (unifiedSponsorNumber) window.location.href = `tel:${unifiedSponsorNumber.replace(/\s/g, '')}`;
            setNudgeState({ ...nudgeState, isOpen: false });
          }}
          onAcceptTool={() => { handleNavigate(AppRoute.FIRST_AID); setNudgeState({ ...nudgeState, isOpen: false }); }}
          onDecline={() => setNudgeState({ ...nudgeState, isOpen: false })}
        />
      )}
    </ErrorBoundary>
  );
};

export default App;