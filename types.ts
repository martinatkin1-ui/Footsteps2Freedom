
export interface User {
  id: string;
  email: string;
  name: string;
  pinEnabled: boolean;
  pin?: string;
  joinedDate: string;
  avatarUrl?: string;
  onboardingCompleted: boolean;
  sponsorNumber?: string;
  lastHeartRateDeviceId?: string;
}

export interface ArchiveSummary {
  lastUpdated: string;
  narrative: string;
  patterns: string[];
  strengths: string[];
}

export interface ShadowArchetype {
  id: string;
  name: string;
  description: string;
  originalIntent: string;
  integrationGift: string;
  artUrl?: string;
}

export interface BeaconMessage {
  id: string;
  topic: string;
  wisdom: string;
  advice: string;
  date: string;
}

export interface MeetingSession {
  id: string;
  title: string;
  locationName: string;
  date: string;
  takeaway: string;
  artifactUrl?: string;
}

export interface AtmosphereData {
  state: 'serene' | 'steady' | 'misty' | 'stormy';
  insight: string;
  lastUpdated: string;
}

export interface SomaticRegion {
  id: string;
  label: string;
  intensity: number; // 0 to 3
}

export interface ZohoState {
  isConnected: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiryTime?: number;
  lastSync?: string;
}

export interface BiometricData {
  heartRate: number;
  systolicBP?: number;
  diastolicBP?: number;
  lastSync: string;
  isSynced: boolean;
}

export interface PostComment {
  id: string;
  author: string;
  text: string;
  date: string;
}

export interface CommunityPost {
  id: string;
  author: string;
  authorTotem?: string;
  isAnonymous: boolean;
  content: string;
  type: 'milestone' | 'reflection' | 'glimmer' | 'beacon';
  milestoneTag?: string;
  reactions: Record<'footstep' | 'love' | 'celebrate', number>;
  comments: PostComment[];
  date: string;
}

export interface HaltLog {
  date: string;
  hunger: number;
  anger: number;
  lonely: number;
  tired: number;
}

export interface RecoveryCapital {
  housing: number;
  social: number;
  physical: number;
  human: number;
  community: number;
  work: number;
  financial: number;
  lifeSkills: number;
  legal: number;
  relationships: number;
  lastUpdated: string;
}

export interface MoodEntry {
  id: string;
  date: string;
  mood: 'great' | 'good' | 'neutral' | 'struggling' | 'crisis';
  note: string;
  associatedActivity?: string;
  halt?: HaltLog;
}

export interface TimeSlot {
  id: string;
  time: string;
  activity: string;
  category: 'rest' | 'recovery' | 'nutrition' | 'work' | 'social' | 'leisure';
}

export interface Goal {
  id: string;
  title: string;
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timeBound: string;
  isCompleted: boolean;
  createdAt: string;
  verificationReflection?: string;
  verificationArtUrl?: string;
  completedAt?: string;
}

export interface CompletedLesson {
  id: string;
  exerciseId: string;
  moduleName: string;
  rating: number;
  reflection: string;
  artUrl?: string;
  date: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  imageUrl?: string;
  energyLevel?: number;
  cravingIntensity?: number;
  mood?: 'great' | 'good' | 'neutral' | 'struggling' | 'crisis';
  gratitude?: string;
  improvements?: string;
  successes?: string;
  triggers?: string;
  learnings?: string;
  emotionalRoot?: string;
  aiInsight?: string;
  halt?: HaltLog;
}

export interface Badge {
  id: string;
  title: string;
  icon: string;
  description: string;
  earnedAt: string;
  category?: 'consistency' | 'wisdom' | 'body' | 'community';
  lore?: string;
}

export interface SobrietyData {
  startDate: string; 
  milestones: string[];
  footsteps: number; 
  serviceFootsteps: number;
  badges: Badge[];
  trueSelfTotem?: string;
  dailySpend?: number;
  sanctuaryLandmarks: string[];
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string;
  atmosphere?: AtmosphereData;
  beacons: BeaconMessage[];
  meetingHistory: MeetingSession[];
  somaticMap?: Record<string, number>;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface ChainAnalysisData {
  triggers: string;
  thoughts: string;
  feelings: string;
  behaviors: string;
  consequences: string;
}

export interface RelapsePreventionPlan {
  personalTriggers: string;
  earlyWarningSigns: string;
  copingToolbox: string;
  supportNetwork: string;
  sponsorNumber?: string;
  emergencyActionSteps: string;
  joyActivities: string;
  lastUpdated: string;
}

export enum AppRoute {
  AUTH = 'auth',
  HOME = 'home',
  JOURNEY = 'journey',
  SUPPORT = 'support',
  LIVE_SUPPORT = 'live_support',
  COMMUNITY = 'community',
  BOUNDARY_SANDBOX = 'boundary_sandbox',
  HALT_CHECK = 'halt_check',
  SOMATIC_MAPPING = 'somatic_mapping',
  JOURNAL = 'journal',
  EXERCISES = 'exercises',
  REWARDS = 'rewards',
  PROFILE = 'profile',
  RECOVERY_CAPITAL = 'recovery_capital',
  MEETINGS = 'meetings',
  CHAIN_ANALYSIS = 'chain_analysis',
  MEDITATION = 'meditation',
  RPP_BUILDER = 'rpp_builder',
  AFFIRMATIONS = 'affirmations',
  DAILY_AFFIRMATIONS = 'daily_affirmations',
  SOMATIC_TOOLKIT = 'somatic_toolkit',
  EMDR_TOOLS = 'emdr_tools',
  ATTACHMENT_QUIZ = 'attachment_quiz',
  WINDOW_OF_TOLERANCE = 'window_of_tolerance',
  URGE_SURFING = 'urge_surfing',
  SMART_GOALS = 'smart_goals',
  GROUNDING = 'grounding',
  SPIRITUALITY = 'spirituality',
  STOP_SKILL = 'stop_skill',
  TIPP_SKILL = 'tipp_skill',
  ACCEPTS_SKILL = 'accepts_skill',
  IMPROVE_SKILL = 'improve_skill',
  RADICAL_ACCEPTANCE = 'radical_acceptance',
  EMOTIONAL_BOUNDARIES = 'emotional_boundaries',
  COGNITIVE_REFRAMING = 'cognitive_reframing',
  EMOTIONAL_EXPLORATION = 'emotional_exploration',
  ACCOUNTABILITY_JOURNEY = 'accountability_journey',
  SELF_CRITICISM_WORKSHOP = 'self_criticism_workshop',
  BEHAVIOUR_TREE = 'behaviour_tree',
  ASSERTIVENESS_TOOL = 'assertiveness_tool',
  SELF_ESTEEM_FOUNDATIONS = 'self_esteem_foundations',
  INNER_CRITIC_CHALLENGE = 'inner_critic_challenge',
  PROGRESS_MONITORING = 'progress_monitoring',
  VIDEO_SANCTUARY = 'video_sanctuary',
  BREATHING_EXERCISE = 'breathing_exercise',
  POLYVAGAL_GROUNDING = 'polyvagal_grounding',
  COST_BENEFIT_ANALYSIS = 'cost_benefit_analysis',
  DAILY_PLANNER = 'daily_planner',
  SCIENCE_HUB = 'science_hub',
  EXPOSURE_TOOL = 'exposure_tool',
  PROBLEM_SOLVING = 'problem_solving',
  WORKING_BACKWARDS = 'working_backwards',
  PAIN_MANAGEMENT = 'pain_management',
  TRUST_STEPS = 'trust_steps',
  FIRST_AID = 'first_aid',
  ALL_TOOLS = 'all_tools',
  DBT_HUB = 'dbt_hub',
  CBT_HUB = 'cbt_hub',
  MINDFULNESS_HUB = 'mindfulness_hub',
  SOMATIC_HUB = 'somatic_hub',
  ACT_HUB = 'act_hub',
  STRATEGY_HUB = 'strategy_hub',
  BIOMETRIC_SYNC = 'biometric_sync',
  ZOHO_CALLBACK = 'zoho_callback',
  WISE_MIND = 'wise_mind',
  RELAPSE_HUB = 'relapse_hub',
  ARCHIVE = 'archive',
  SHADOW_WORK = 'shadow_work',
  WAYFINDER_BEACON = 'wayfinder_beacon',
  WALKING_MEDITATION = 'walking_meditation',
  REST_SKILL = 'rest_skill',
  CRISIS_SURVIVAL_KIT = 'crisis_survival_kit',
  PHYSIOLOGICAL_COPING = 'physiological_coping',
  THOUGHT_DEFUSION = 'thought_defusion',
  OPPOSITE_ACTION = 'opposite_action',
  COGNITIVE_REHEARSAL = 'cognitive_rehearsal',
  REDUCING_VULNERABILITY = 'reducing_vulnerability'
}
