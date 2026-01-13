
import { 
  IconMoodGreat, 
  IconMoodGood, 
  IconMoodNeutral, 
  IconMoodStruggling, 
  IconMoodCrisis 
} from './components/Icons';
import React from 'react';

export const SYSTEM_PROMPT = `You are "Footsteps Guide," a calm, warm, formal, and deeply empathetic AI recovery companion. 

Persona Guidelines:
- Tone: Formal yet kind. Use sophisticated, encouraging language. Avoid slang or overly casual contractions.
- Focus: Always orient the Traveller toward what they *can* achieve. Highlight their potential for growth and the integrity of their next step.
- Style: Your presence should feel like a stable, wise mentor—a "holding space" for the complexities of recovery.

Phase-Adaptive Architecture:
- Phase 1-2 (Foundations/Coping): High support. Focus on immediate biological safety and the achievement of basic stability.
- Phase 3 (Growth): Focus on mirroring strengths. Highlight the Traveller's emerging True-Self and their capacity for values-based living.
- Phase 4-5 (Meaning/Actualisation): High challenge. Discuss legacy, purpose, and the profound achievement of self-actualisation.

Therapeutic Framework:
- CBT: Identify cognitive distortions as "missteps" and point toward more realistic, empowering path-finding.
- DBT: Prioritise biological regulation. Use TIPP for high arousal.
- ACT: Emphasise values as a compass for achievement.
- MI: Roll with resistance using curiosity.

Operational Guidelines:
- Language: Use UK English exclusively (e.g., colour, programme, centre, behaviour).
- Context: Reference UK support like NHS 111, Samaritans (116 123).
- Address: Refer to the user as "Traveller." Never use clinical labels. 
- Output: Format for clear, slow-paced TTS reading.`;

export const MOOD_CONFIG = {
  great: { label: 'Serene', color: 'bg-emerald-500', textColor: 'text-emerald-500', icon: <IconMoodGreat /> },
  good: { label: 'Steady', color: 'bg-teal-400', textColor: 'text-teal-500', icon: <IconMoodGood /> },
  neutral: { label: 'Present', color: 'bg-slate-300', textColor: 'text-slate-400', icon: <IconMoodNeutral /> },
  struggling: { label: 'Heavy', color: 'bg-orange-400', textColor: 'text-orange-500', icon: <IconMoodStruggling /> },
  crisis: { label: 'Overwhelmed', color: 'bg-rose-500', textColor: 'text-rose-500', icon: <IconMoodCrisis /> }
};

export const RANKS = [
  { id: 'seeker', threshold: 0, title: 'The Seeker', icon: '🔍', color: 'bg-slate-700', text: 'text-slate-400', glow: 'shadow-slate-500/20' },
  { id: 'builder', threshold: 11, title: 'The Builder', icon: '🏗️', color: 'bg-teal-600', text: 'text-teal-600', glow: 'shadow-teal-500/20' },
  { id: 'resilient', threshold: 31, title: 'The Resilient', icon: '🌳', color: 'bg-emerald-600', text: 'text-emerald-600', glow: 'shadow-emerald-500/20' },
  { id: 'guardian', threshold: 71, title: 'The Guardian', icon: '🛡️', color: 'bg-amber-600', text: 'text-amber-600', glow: 'shadow-amber-500/20' },
  { id: 'wayfinder', threshold: 150, title: 'The Wayfinder', icon: '🌌', color: 'bg-indigo-600', text: 'text-indigo-600', glow: 'shadow-indigo-500/20' }
];

export const getRankData = (footsteps: number) => {
  const reversed = [...RANKS].reverse();
  const current = reversed.find(r => footsteps >= r.threshold) || RANKS[0];
  const nextIdx = RANKS.findIndex(r => r.id === current.id) + 1;
  const next = nextIdx < RANKS.length ? RANKS[nextIdx] : null;
  
  return { 
    ...current, 
    pill: current.id === 'wayfinder' ? 'bg-indigo-500/20 text-indigo-400' : 
          current.id === 'guardian' ? 'bg-amber-500/20 text-amber-400' :
          current.id === 'resilient' ? 'bg-emerald-500/20 text-emerald-400' :
          current.id === 'builder' ? 'bg-teal-500/20 text-teal-400' :
          'bg-slate-500/20 text-slate-400',
    nextThreshold: next?.threshold || footsteps + 500,
    nextTitle: next?.title || 'The Eternal Path'
  };
};

export const RECOVERY_AFFIRMATIONS = [
  "My worth is not defined by my past, but by the gentle steps I take today.",
  "I am building a life I no longer need to escape from.",
  "Every craving I ride out is a victory for my future True-Self.",
  "I choose peace over the chaos of my old patterns.",
  "My boundaries are a sacred act of True-Self respect.",
  "I am learning to sit with my feelings without needing to numb them.",
  "Recovery is a journey of 1,000 small, brave choices.",
  "I am worthy of a life filled with clarity and connection.",
  "Small progress is still progress. I am moving forward.",
  "I trust my capacity to heal and evolve.",
  "My True-Self is shifting from struggle to strength.",
  "I deserve the kindness I so freely give to others.",
  "I am not my urges; I am the observer of them.",
  "Today, I choose to protect my peace above all else.",
  "My strength grows in the quiet moments of choosing health.",
  "I am part of a community of resilience.",
  "Mistakes Dora just data on the path to mastery.",
  "I am worthy of love, respect, and a clear mind.",
  "I can do hard things. I have survived 100% of my hardest days.",
  "My voice matters. My journey matters. I matter.",
  "I am becoming the True-Self I was always meant to be.",
  "Stability is the foundation of my freedom.",
  "I am grateful for the clarity that sobriety brings.",
  "One day at a time is a strategy for success, not a limitation.",
  "I am proud of the courage it took to start this path.",
  "I am capable of handling discomfort without reverting to old habits.",
  "My future is bright, and I am the one holding the torch.",
  "I am enough, exactly as I am in this moment.",
  "Transformation is a process, and I am patient with my heart.",
  "I am rooted in my values and guided by my hope.",
  "I am free to change my story at any time."
];

export const BADGE_LIBRARY = [
  { 
    id: 'first-step', 
    title: 'The First Footprint', 
    icon: '👣', 
    category: 'wisdom',
    description: 'Begin your journey with your first recorded reflection.', 
    lore: 'Recovery starts with the courage to be honest. This artifact represents the "unfreezing" of the True-Self.',
    requirement: 'footsteps >= 1' 
  },
  { 
    id: 'streak-3', 
    title: 'Trinity of Presence', 
    icon: '🔥', 
    category: 'consistency',
    description: 'Maintain a 3-day presence streak.', 
    lore: 'The brain begins to build new neural defaults after 72 hours of consistent effort. You are warming the engine of change.',
    requirement: 'currentStreak >= 3' 
  },
  { 
    id: 'streak-7', 
    title: 'Architect of Habit', 
    icon: '🏛️', 
    category: 'consistency',
    description: 'Complete one full week of continuous engagement.', 
    lore: 'A week of presence is a powerful shield against impulse. You have navigated a full cycle of triggers.',
    requirement: 'currentStreak >= 7' 
  },
  { 
    id: 'streak-30', 
    title: 'Alchemist of Time', 
    icon: '⏳', 
    category: 'consistency',
    description: 'Archive 30 days of continuous presence.', 
    lore: 'At thirty days, the physical fog has largely cleared. You are no longer just surviving; you are beginning to exist.',
    requirement: 'currentStreak >= 30' 
  },
  { 
    id: 'zen-master', 
    title: 'Quiet Observer', 
    icon: '🧘', 
    category: 'body',
    description: 'Honour 3 mindfulness or breathing sessions.', 
    lore: 'By quieting the mind, you strengthen the Prefrontal Cortex, the "CEO" of your brain, allowing for wise choices.',
    requirement: 'mindfulness_count >= 3' 
  },
  { 
    id: 'vagus-guardian', 
    title: 'Vagus Guardian', 
    icon: '🌬️', 
    category: 'body',
    description: 'Complete 10 biological breathing resets.', 
    lore: 'You have mastered the manual override for your nervous system. You can signal safety to your brain even in the storm.',
    requirement: 'breathing_count >= 10' 
  },
  { 
    id: 'truth-seeker', 
    title: 'Pattern Breaker', 
    icon: '🔍', 
    category: 'wisdom',
    description: 'Gently face the patterns with your first Chain Analysis.', 
    lore: 'To break a chain, one must first see the links. You have moved from "Compulsion" to "Observation."',
    requirement: 'chain_analysis_count >= 1' 
  },
  { 
    id: 'scientist-of-self', 
    title: 'Scientist of Self', 
    icon: '🔬', 
    category: 'wisdom',
    description: 'Query the Science Hub 5 times for clinical understanding.', 
    lore: 'By understanding the neurobiology of your struggle, you have successfully detached your worth from your symptoms.',
    requirement: 'science_queries >= 5' 
  },
  { 
    id: 'hope-scribe', 
    title: 'Scribe of Hope', 
    icon: '✍️', 
    category: 'wisdom',
    description: 'Maintain a 3-day journaling rhythm.', 
    lore: 'Language is the tool of the soul. By writing, you are narrating a new story for your future self.',
    requirement: 'journal_streak >= 3' 
  },
  { 
    id: 'somatic-sage', 
    title: 'Biological Alchemist', 
    icon: '🐚', 
    category: 'body',
    description: 'Honour 5 body-based (Somatic) sessions.', 
    lore: 'Trauma and addiction live in the tissues. By regulating the body, you are cleaning the soil for your True-Self to grow.',
    requirement: 'somatic_count >= 5' 
  },
  { 
    id: 'boundary-architect', 
    title: 'Boundary Architect', 
    icon: '🧱', 
    category: 'community',
    description: 'Complete both Emotional Boundaries and Assertiveness tools.', 
    lore: 'You have constructed a sanctuary for your energy. You no longer allow external chaos to dictate your internal peace.',
    requirement: 'completed_interpersonal >= 2' 
  },
  { 
    id: 'connector', 
    title: 'Village Weaver', 
    icon: '🕸️', 
    category: 'community',
    description: 'Share 3 glimmers or comments in the community.', 
    lore: 'Isolation is the fuel of addiction. Connection is the antidote. You are strengthening the collective shield.',
    requirement: 'community_contributions >= 3' 
  },
  { 
    id: 'beacon-of-hope', 
    title: 'Beacon of Hope', 
    icon: '🕯️', 
    category: 'community',
    description: 'Broadcast 5 Beacon messages as a Wayfinder.', 
    lore: 'By sharing your wisdom, you ensure the path is lit for those behind you. This is the ultimate act of maintenance.',
    requirement: 'beacon_count >= 5' 
  },
  { 
    id: 'shadow-walker', 
    title: 'Shadow Walker', 
    icon: '🌑', 
    category: 'wisdom',
    description: 'Complete the Shadow Integration Hub session.', 
    lore: 'You have dared to look into the void and reclaimed the power hidden there. You are becoming a whole person.',
    requirement: 'shadow_complete >= 1' 
  },
  { 
    id: 'stoic-anchor', 
    title: 'Stoic Anchor', 
    icon: '⚓', 
    category: 'consistency',
    description: 'Logged a neutral or good mood during a "Stormy" atmosphere event.', 
    lore: 'The external weather was violent, but your internal sanctuary remained steady. You have achieved true biological resilience.',
    requirement: 'stormy_sobriety >= 1' 
  }
];

export const RECOVERY_PHASES = [
  {
    id: 1,
    title: "Phase 1: Foundations",
    subtitle: "Undergrowth: Biological Safety",
    environment: "The Deep Undergrowth",
    atmosphere: "Dense, earthy, and bioluminescent. Survival via grounding is the objective.",
    description: "Stabilisation begins by calming the nervous system. This phase is about gently deconstructing loops and finding biological safety.",
    focus: "Nervous System Regulation, HALT Awareness, & Values Identification.",
    accent: "teal",
    elevation: 0,
    benefitSummary: "biological stabilisation",
    recommendedToolIds: ["window-of-tolerance", "first_aid", "rest-skill", "grounding", "breathing-exercises", "cost-benefit-analysis", "chain-analysis", "self-esteem-foundations", "daily-planner", "reducing-vulnerability"],
    reasons: "You cannot build a new life while the body feels under constant threat. Stability is the soil for your True-Self."
  },
  {
    id: 2,
    title: "Phase 2: Regulation",
    subtitle: "Canopy: Skills Acquisition",
    environment: "The High Canopy",
    atmosphere: "Vibrant and green, with light breaking through. Finding a steady footing.",
    description: "Equipping your tactical toolkit. We focus on DBT skills to navigate intense emotional firestorms and ride out carvings safely.",
    focus: "Distress Tolerance (TIPP/ACCEPTS), Urge Surfing, and Mindfulness Mastery.",
    accent: "emerald",
    elevation: 1200,
    benefitSummary: "emotional mastery",
    recommendedToolIds: ["urge-surfing", "tipp-skill", "somatic-toolkit", "butterfly-hug", "accepts-skill", "improve-skill", "wise-mind", "radical-acceptance", "video-sanctuary", "meditation-timer", "rpp-builder", "inner-critic-challenge", "exposure_tool", "crisis-survival-kit", "physiological-coping", "thought-defusion"],
    reasons: "Cravings are temporary waves. Learning to ride them without acting is the bridge from survival to freedom."
  },
  {
    id: 3,
    title: "Phase 3: Identity",
    subtitle: "Plateau: Relational Repair",
    environment: "The Mist Highland",
    atmosphere: "Cooler, misty, and earthy. Your sense of self is starting to broaden.",
    description: "Honouring the person you are becoming. This phase shifts from 'not doing' to 'proactively living' through boundaries and goals.",
    focus: "Assertiveness (DEAR MAN), SMART Goals, and Schema Pattern Recognition.",
    accent: "amber",
    elevation: 2800,
    benefitSummary: "identity synthesis",
    recommendedToolIds: ["attachment-quiz", "emotional-boundaries", "assertiveness-tool", "smart-goals", "cognitive-reframing", "problem_solving", "accountability-journey", "trust_steps", "opposite-action"],
    reasons: "Recovery isn't just a pause in behaviour; it is the architecture of a life that is beautiful enough to choose every day."
  },
  {
    id: 4,
    title: "Phase 4: Meaning",
    subtitle: "Peaks: Depth Integration",
    environment: "The High Peaks",
    atmosphere: "Indigo skies, thin air, and high winds. Connecting to the greater whole.",
    description: "Integrating the darkness into light. Here we use Shadow Work and Spiritual Mapping to find a purpose beyond the struggle.",
    focus: "Shadow Integration, Meaning Mapping, and Backward Planning.",
    accent: "indigo",
    elevation: 4100,
    benefitSummary: "purpose alignment",
    recommendedToolIds: ["behaviour-tree", "emotional-exploration", "spirituality", "shadow-work", "affirmation-deck", "working_backwards", "cognitive-rehearsal"],
    reasons: "When your life has deep meaning, the old patterns lose their space to grow. You are becoming a whole person."
  },
  {
    id: 5,
    title: "Phase 5: Legacy",
    subtitle: "Summit: Mentorship & Vigilance",
    environment: "The Pinnacle",
    atmosphere: "Eternal sunrise and glacial clarity. A state of sustainable freedom.",
    description: "Living the journey and lighting the way for others. This phase is about maintenance, service, and long-term vigilance.",
    focus: "Wayfinder Beacons, Community Mentorship, and Lifestyle Refinement.",
    accent: "slate",
    elevation: 5895,
    benefitSummary: "legacy building",
    recommendedToolIds: ["pain_management", "progress-monitoring", "wayfinder-beacon"],
    reasons: "Freedom is maintained through service and persistent curiosity. You are now a guardian of the path."
  }
];

export const COPING_EXERCISES = [
  // PHASE 1: FOUNDATIONS (Ordered by Scaffolding)
  { id: "window-of-tolerance", title: "Window of Tolerance", description: "Identify your current nervous system state and find your centre.", category: "Self-Regulation", recommendedPhase: 1, framework: "Somatic" },
  { id: "first_aid", title: "First Aid Toolkit", description: "Immediate tactical tools for crisis regulation and stability.", category: "Emergency", recommendedPhase: 1, framework: "DBT/Somatic" },
  { id: "rest-skill", title: "Stop the Slide: REST", description: "Relax, Evaluate, Set Intention, and Take Action to prevent relapse.", category: "Prevention", recommendedPhase: 1, framework: "DBT" },
  { id: "reducing-vulnerability", title: "Body Balance: HALT", description: "Manage physical vulnerabilities like sleep, diet, and physical health.", category: "Stability", recommendedPhase: 1, framework: "DBT/HALT" },
  { id: "grounding", title: "5-4-3-2-1 Grounding", description: "Anchor your True-Self in the present by engaging your senses.", category: "Mindfulness", recommendedPhase: 1, framework: "Somatic" },
  { id: "breathing-exercises", title: "Breathing Sanctuary", description: "Gentle techniques to regulate your system and find your centre.", category: "Breathing", recommendedPhase: 1, framework: "Somatic" },
  { id: "cost-benefit-analysis", title: "Motivation Balance", description: "A gentle tool to weigh the costs of old patterns versus the gifts of recovery.", category: "Motivation", recommendedPhase: 1, framework: "MI" },
  { id: "chain-analysis", title: "Understand Patterns", description: "Deconstruct an urge using the Triggers → Choice model.", category: "CBT Basics", recommendedPhase: 1, framework: "CBT" },
  { id: "self-esteem-foundations", title: "Self-Worth Foundations", description: "Explore your core values and the strengths of your True-Self.", category: "True-Self", recommendedPhase: 1, framework: "ACT" },
  { id: "daily-planner", title: "Daily Routine Architect", description: "Design a gentle plan to build recovery habits and protect your time.", category: "Stability", recommendedPhase: 1, framework: "CBT" },

  // PHASE 2: COPING TOOLS (Ordered by Scaffolding)
  { id: "crisis-survival-kit", title: "Crisis Survival Kit", description: "Survive high-intensity cravings with harm reduction and self-soothing.", category: "Emergency", recommendedPhase: 2, framework: "DBT" },
  { id: "physiological-coping", title: "Neural Bio-Hacking", description: "Physically force your body into calm using temperature and breath.", category: "Somatic", recommendedPhase: 2, framework: "DBT/Biology" },
  { id: "thought-defusion", title: "Thought Defusion", description: "Unhook from repetitive negative thoughts and cravings.", category: "Mindfulness", recommendedPhase: 2, framework: "ACT" },
  { id: "urge-surfing", title: "Urge Surfing", description: "Learn to ride the wave of cravings without needing to act.", category: "Mindfulness", recommendedPhase: 2, framework: "DBT" },
  { id: "tipp-skill", title: "TIPP: Biological Reset", description: "Fast-acting skills to physically lower emotional arousal.", category: "Distress Tolerance", recommendedPhase: 2, framework: "DBT" },
  { id: "somatic-toolkit", title: "Body-Based Resets", description: "Body tapping and somatic techniques to release tension.", category: "Somatic Therapy", recommendedPhase: 2, framework: "Somatic" },
  { id: "butterfly-hug", title: "The Butterfly Hug", description: "Gentle bilateral stimulation for emotional regulation.", category: "EMDR Tools", recommendedPhase: 2, framework: "Somatic" },
  { id: "accepts-skill", title: "ACCEPTS: Gentle Distraction", description: "Proven ways to temporarily shift your focus during emotional peaks.", category: "Distress Tolerance", recommendedPhase: 2, framework: "DBT" },
  { id: "improve-skill", title: "IMPROVE: Perspective Shift", description: "Strategies that create meaning and calm during difficult moments.", category: "Distress Tolerance", recommendedPhase: 2, framework: "DBT" },
  { id: "wise-mind", title: "Wise Mind Synthesis", description: "The core DBT skill for balancing logic and emotion into wisdom.", category: "Core DBT", recommendedPhase: 2, framework: "DBT" },
  { id: "radical-acceptance", title: "Accepting Reality", description: "Shift from 'Willful' to 'Willing' to stop unnecessary suffering.", category: "Distress Tolerance", recommendedPhase: 2, framework: "DBT" },
  { id: "video-sanctuary", title: "Video Sanctuary", description: "Immerse yourself in a calming atmosphere to soothe your mind.", category: "Mindfulness", recommendedPhase: 2, framework: "Mindfulness" },
  { id: "meditation-timer", title: "Meditation Sanctuary", description: "A quiet space for mindfulness with gentle chimes.", category: "Mindfulness", recommendedPhase: 2, framework: "Mindfulness" },
  { id: "rpp-builder", title: "Safety Blueprint (RPP)", description: "Build your living guide for triggers and support.", category: "Planning", recommendedPhase: 2, framework: "CBT" },
  { id: "inner-critic-challenge", title: "Inner Critic Challenge", description: "Gently question the negative voices that undermine your peace.", category: "Anxiety", recommendedPhase: 2, framework: "CBT" },
  { id: "exposure_tool", title: "Confidence Hierarchy", description: "Gently facing specific fears or triggers one rung at a time.", category: "Anxiety", recommendedPhase: 2, framework: "CBT" },

  // PHASE 3: GROWTH (Ordered by Scaffolding)
  { id: "opposite-action", title: "Rewiring Reactions", description: "Do the opposite of a destructive urge to change the underlying emotion.", category: "Regulation", recommendedPhase: 3, framework: "DBT" },
  { id: "attachment-quiz", title: "Connection Style Insight", description: "A gentle reflection on how you relate to others.", category: "Assessment", recommendedPhase: 3, framework: "CBT" },
  { id: "emotional-boundaries", title: "Saying No & Boundaries", description: "Master the art of setting limits without guilt or aggression.", category: "Interpersonal", recommendedPhase: 3, framework: "DBT" },
  { id: "assertiveness-tool", title: "Kind Communication (DEAR MAN)", description: "Master the art of asking for what you need with respect and confidence.", category: "Interpersonal", recommendedPhase: 3, framework: "DBT" },
  { id: "smart-goals", title: "True-Self SMART Goals", description: "Break down your intentions into clear, achievable steps.", category: "Planning", recommendedPhase: 3, framework: "ACT" },
  { id: "cognitive-reframing", title: "Thought Restructuring", description: "Identify and gently shift unhelpful thought patterns.", category: "CBT Tools", recommendedPhase: 3, framework: "CBT" },
  { id: "problem_solving", title: "SOLVE Model", description: "A structured approach to navigating challenges without feeling overwhelmed.", category: "Skill Building", recommendedPhase: 3, framework: "CBT" },
  { id: "accountability-journey", title: "Accountability Journey", description: "Take ownership of your path and embrace the power of responsibility.", category: "Character Growth", recommendedPhase: 3, framework: "Character" },
  { id: "trust_steps", title: "Steps to Rebuild Trust", description: "A roadmap to healing relationships and restoring integrity.", category: "Interpersonal", recommendedPhase: 3, framework: "Gottman/ACT" },

  // PHASE 4: MEANING & ACTUALISATION (Ordered by Scaffolding)
  { id: "cognitive-rehearsal", title: "Practice Under Pressure", description: "Visualize and rehearse coping skills under simulated high-stress scenarios.", category: "Mastery", recommendedPhase: 4, framework: "DBT/CBT" },
  { id: "behaviour-tree", title: "Behaviour Tree Map", description: "Gently map your actions to underlying beliefs and needs.", category: "Self-Awareness", recommendedPhase: 4, framework: "CBT" },
  { id: "emotional-exploration", title: "Emotional Exploration", description: "Explore the layers of your emotions with curiosity and kindness.", category: "Self-Awareness", recommendedPhase: 4, framework: "CBT" },
  { id: "spirituality", title: "Spirituality & Meaning", description: "Connect with your sense of purpose and the wider world.", category: "True-Self", recommendedPhase: 4, framework: "ACT" },
  { id: "shadow-work", title: "Shadow Integration Hub", description: "Advanced archetypal work to integrate the 'Using-Self' into your True-Self.", category: "Deep Identity", recommendedPhase: 4, framework: "Jungian/ACT" },
  { id: "affirmation-deck", title: "Affirmation Cards", description: "Browse hand-crafted affirmations to strengthen your heart.", category: "Mindset", recommendedPhase: 4, framework: "ACT" },
  { id: "working-backwards", title: "Backward Planning", description: "Define a vision for your future True-Self and chart the path toward it.", category: "Actualisation", recommendedPhase: 4, framework: "ACT" },

  // PHASE 5: MAINTENANCE (Ordered by Scaffolding)
  { id: "pain_management", title: "Somatic Ease", description: "Targeted visualisation and acceptance for managing physical discomfort.", category: "Somatic", recommendedPhase: 5, framework: "Somatic" },
  { id: "progress-monitoring", title: "Pattern Progress Hub", description: "A gentle dashboard to track your healthy choices and glimmers.", category: "Maintenance", recommendedPhase: 5, framework: "CBT" },
  { id: "wayfinder-beacon", title: "The Wayfinder Beacon", description: "Synthesise your wisdom into messages for those earlier on the path.", category: "Service", recommendedPhase: 5, framework: "Altruism/Legacy" }
];

export const PHASE_ONE_CONTENT = {
  title: "Phase 1: Foundations",
  welcome: "Welcome to the beginning of your journey. This phase is about stabilization and biological grounding.",
  description: "We use the Bio-Psycho-Social model to understand the roots of patterns.",
  focus: "Your focus here is on identifying core values and ensuring physical safety.",
  reminders: "Small steps are victories. Be gentle with your True-Self."
};

export const INTERVENTIONS = {
  tipp: {
    title: "TIPP Skills",
    steps: [
      { label: "Temperature", text: "Splash your face with cold water or hold an ice cube." },
      { label: "Intense Exercise", text: "Engage in 60 seconds of vigorous movement." },
      { label: "Paced Breathing", text: "Slowly inhale for 4s and exhale for 6s." },
      { label: "Paired Relaxation", text: "Tense and release major muscle groups." }
    ]
  },
  grounding: {
    title: "5-4-3-2-1 Grounding",
    steps: [
      { label: "See", text: "Identify 5 things you can see right now." },
      { label: "Feel", text: "Identify 4 things you can feel physically." },
      { label: "Hear", text: "Identify 3 things you can hear in your environment." },
      { label: "Smell", text: "Identify 2 things you can smell or like the smell of." },
      { label: "Taste", text: "Identify 1 thing you can taste or your favorite taste." }
    ]
  },
  breathing: {
    title: "Paced Breathing",
    steps: [
      { label: "Inhale", text: "Slowly breathe in through your nose for 4 seconds." },
      { label: "Hold", text: "Hold your breath gently for 2 seconds." },
      { label: "Exhale", text: "Breathe out through your mouth for 6 seconds." },
      { label: "Wait", text: "Pause for 2 seconds before the next breath." }
    ]
  }
};

export const PERSONAL_VALUES_LIST = [
  "Honesty", "Integrity", "Kindness", "Courage", "Service", "Growth", "Connection", "Patience", "Health", "Freedom"
];
