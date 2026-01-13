
import React, { useState } from 'react';
import { getDiagnosticDeepDive } from '../geminiService';
import SpeakButton from './SpeakButton';

const SCIENCE_TOPICS = [
  {
    id: 'neuro-dopamine',
    title: 'Dopamine: The Drive Molecule',
    shortTitle: 'Dopamine',
    icon: '⚡',
    summary: 'The neurobiology of "wanting" and incentive salience.',
    content: `Dopamine is the primary neurotransmitter of the reward system. Contrary to popular belief, it is not the "pleasure" molecule, but the "anticipation" molecule. It creates the drive to seek out rewards. In addiction, the brain's baseline dopamine levels (tonic dopamine) drop, while triggers cause massive, unnatural spikes (phasic dopamine), making normal life feel dull.`,
    details: [
      { label: 'The Phasic Spike', text: 'Addictive substances hijack the VTA (Ventral Tegmental Area), causing a dopamine flood that exceeds natural rewards by up to 10x.' },
      { label: 'Baseline Deficit', text: 'To compensate for chronic overstimulation, the brain "down-regulates" (removes) D2 receptors. This causes a state of "Anhedonia" where the True-Self feels grey and joyless during early recovery.' },
      { label: 'Prediction Error', text: 'Dopamine fires most when a reward is unexpected. Once a habit is formed, dopamine fires at the *cue* (the trigger), not the reward itself. This is why the "craving" is often more intense than the actual use.' }
    ],
    pathways: [
      { name: 'Mesolimbic Pathway', role: 'VTA to Nucleus Accumbens. Regulates reward, desire, and the emotional value of triggers.' },
      { name: 'Mesocortical Pathway', role: 'VTA to Prefrontal Cortex. Controls executive function, motivation, and emotional response.' }
    ],
    management: [
      'Identifying phasic triggers early',
      'Dopamine Fasting (reducing high-stimulus inputs)',
      'Sunlight exposure to support natural synthesis',
      'Low-intensity exercise to slowly raise tonic baseline'
    ]
  },
  {
    id: 'opioid-liking',
    title: 'Opioids & Endorphins: The "Liking" System',
    shortTitle: 'Pleasure',
    icon: '💎',
    summary: 'Distinguishing pleasure (liking) from desire (wanting).',
    content: `While Dopamine handles "wanting," the endogenous opioid system (endorphins and enkephalins) handles "liking." This is the system of satiation and pleasure. In many addictive cycles, the "wanting" (dopamine) remains extremely high even when the "liking" (opioids) has vanished, leading to the painful state of craving something you no longer enjoy.`,
    details: [
      { label: 'Satiation Failure', text: 'In chronic use, the brain loses its ability to feel "enough." The natural opioid system becomes suppressed, leading to chronic physical and emotional sensitivity.' },
      { label: 'The Pain-Pleasure Loop', text: 'Mu-opioid receptors regulate both pain relief and euphoria. When these are depleted, physical pain and emotional distress are magnified during the recovery process.' }
    ],
    management: [
      'Social connection (releases natural oxytocin/endorphins)',
      'Warm baths or temperature shifts (Somatic resets)',
      'Deep pressure stimulation (weighted blankets)',
      'Mindful eating to re-sensitize taste and texture'
    ]
  },
  {
    id: 'glutamate-gaba',
    title: 'Glutamate & GABA: Neural Homeostasis',
    shortTitle: 'Gas/Brakes',
    icon: '🛑',
    summary: 'The balance between excitation and inhibition.',
    content: `Glutamate is the brain's primary excitatory neurotransmitter (the gas pedal), and GABA is the primary inhibitory neurotransmitter (the brakes). Addiction creates a massive imbalance: Glutamate becomes hyper-active (racing thoughts, anxiety), while GABA becomes weak (inability to calm down). Homeostasis is the slow process of re-balancing these two forces.`,
    details: [
      { label: 'Excitotoxicity', text: 'Excess Glutamate can cause neural stress and feelings of panic. It "yells" at the brain to act on an urge.' },
      { label: 'GABA Depletion', text: 'Withdrawal often involves a lack of GABA, leading to the "shakes," insomnia, and a low threshold for emotional distress.' },
      { label: 'The Amygdala Link', text: 'High Glutamate in the Amygdala keeps the True-Self in a permanent state of "Threat Detection."' }
    ],
    management: [
      'Magnesium-rich foods (nature\'s calcium channel blocker)',
      'Slow, rhythmic breathing (manually stimulates GABA)',
      'Limiting caffeine and artificial stimulants',
      'Structured routine to reduce cognitive load'
    ]
  },
  {
    id: 'serotonin-stability',
    title: 'Serotonin: The Mood Regulator',
    shortTitle: 'Serotonin',
    icon: '🕊️',
    summary: 'Impulse control and emotional baseline.',
    content: `Serotonin acts as a broad-spectrum modulator of mood, sleep, and appetite. Critically for recovery, Serotonin provides the "Top-Down" impulse control required to say no to the Amygdala. Low Serotonin is strongly linked to impulsivity and "acting out" without thinking.`,
    details: [
      { label: 'The PFC Guard', text: 'Serotonin in the Prefrontal Cortex acts like a guard, helping you pause before reacting to an emotional surge.' },
      { label: 'Sleep/Mood Link', text: 'Addiction disrupts the circadian rhythm. Rebuilding Serotonin requires consistent sleep and light cycles.' }
    ],
    management: [
      'Morning sunlight (triggers Serotonin production)',
      'Tryptophan-rich diet (turkey, eggs, nuts)',
      'Gratitude practice (biologically increases Serotonin turnover)',
      'Consistent waking and sleeping hours'
    ]
  },
  {
    id: 'pfc-vs-amygdala',
    title: 'The Battle for Control: PFC vs Amygdala',
    shortTitle: 'The Brain War',
    icon: '⚔️',
    summary: 'Executive function versus primitive survival.',
    content: `Recovery is a struggle between the Prefrontal Cortex (PFC - The CEO) and the Amygdala (The Alarm). Addiction weakens the PFC\'s ability to inhibit the Amygdala\'s impulses. Clinical recovery tools work by manually strengthening the "Top-Down" pathways from the PFC to the lower brain centres.`,
    details: [
      { label: 'Hypofrontality', text: 'A state in addiction where the PFC is "offline" or sluggish, making logical choice nearly impossible during a craving.' },
      { label: 'Bottom-Up Hijack', text: 'When the Amygdala senses a trigger, it floods the brain with stress signals that "blind" the logical PFC.' },
      { label: 'Neural Weightlifting', text: 'Every time you use a TIPP skill or a Thought Record, you are physically strengthening the PFC fibers.' }
    ],
    management: [
      'Practicing "The Pause" (STOP Skill)',
      'Cognitive Rehearsal (planning your reaction)',
      'Journaling (forces PFC processing of emotional data)',
      'Meditation (thickens the PFC grey matter over time)'
    ]
  },
  {
    id: 'neuroplasticity',
    title: 'Neuroplasticity: Re-Routing the Mind',
    shortTitle: 'Plasticity',
    icon: '🗺️',
    summary: 'Rewiring your neural footpaths through deliberate action.',
    content: `Neuroplasticity is the brain's physical ability to change its structure. Old addictive loops are like deep trenches in a field; recovery is the process of walking new footpaths until they become the "path of least resistance." Through "Synaptic Pruning," the brain eventually deletes the connections it no longer uses.`,
    details: [
      { label: 'Hebbian Theory', text: '"Neurons that fire together, wire together." Repeated healthy choices physically thicken new neural pathways.' },
      { label: 'Synaptic Pruning', text: 'Disused addictive circuits eventually wither away, making cravings less frequent and less intense over time.' },
      { label: 'Myelination', text: 'New habits get "insulated" with myelin the more you practice them, making healthy responses faster and more automatic.' }
    ],
    management: [
      'Consistent ritual and routine practice',
      'Learning new complex skills (languages, instruments)',
      'Cognitive Rehearsal (imagining healthy responses)'
    ]
  },
  {
    id: 'spirituality-science',
    title: 'The Science of Spirituality',
    shortTitle: 'Spirituality',
    icon: '✨',
    summary: 'Neurobiological correlates of transcendence and connection.',
    content: `Spirituality in a clinical sense is the activation of brain regions associated with meaning and connection. Research shows that spiritual practice can manually de-activate the "Self-Referential" loops (shame, guilt, rumination) that fuel addiction, allowing the True-Self to connect with something larger than the urge.`,
    details: [
      { label: 'The Default Mode Network (DMN)', text: 'This is the "Me Network" responsible for rumination and ego. Spiritual practices like meditation or awe-inspiring experiences (nature/prayer) quiet the DMN, reducing the "noise" of the addicted ego.' },
      { label: 'Boundary Dissolution', text: 'The Posterior Parietal Lobe handles our sense of where we end and the world begins. Spiritual states can quiet this area, creating a sense of "Oneness" that ends the isolation of addiction.' },
      { label: 'Oxytocin & Connection', text: 'Spiritual connection with a group (fellowship) releases Oxytocin, which biologically inhibits the stress response and cravings.' }
    ],
    pathways: [
      { name: 'Anterior Cingulate Cortex', role: 'Associated with empathy and impulse control. Strengthened by spiritual and contemplative practices.' },
      { name: 'Insula', role: 'Bridges the physical body and emotional meaning. Vital for "True-Self" awareness.' }
    ],
    management: [
      'Daily meditation or contemplative prayer',
      'Seeking "Awe" (Time in nature, art, or expansive music)',
      'Selfless Service (Activating the altruism circuits)',
      'Participating in shared rituals or fellowship'
    ]
  },
  {
    id: 'cbt-core',
    title: 'Cognitive Behavioural Therapy (CBT)',
    shortTitle: 'CBT',
    icon: '🧠',
    summary: 'The interplay between thoughts, feelings, and behaviours.',
    content: `CBT is based on the idea that our thoughts, feelings, and behaviours are constantly interacting. How we interpret or think about a situation determines how we feel, which determines how we react. In recovery, identifying "thinking errors" allows the brain to choose new neural footpaths over old addictive loops.`,
    cycle: [
      { label: 'Situation', text: 'An external event (e.g. Walking into a party).' },
      { label: 'Thoughts', text: 'Your interpretation (e.g. "Everyone will judge me").' },
      { label: 'Emotions', text: 'The resulting feeling (e.g. Anxiety, Panic).' },
      { label: 'Behaviours', text: 'The action taken (e.g. Leaving or using a substance).' }
    ],
    sections: [
      { label: 'The Goal', text: 'Replacing unhelpful thought patterns to impact the ability to act differently when facing stressors.' },
      { label: 'Neuroplasticity', text: 'CBT physically strengthens the prefrontal cortex, the part of the brain responsible for logical decision-making.' }
    ]
  },
  {
    id: 'dbt-science',
    title: 'DBT & Biosocial Theory',
    shortTitle: 'DBT',
    icon: '🛠️',
    summary: 'Emotional regulation and the "Middle Path" of acceptance.',
    content: `Dialectical Behaviour Therapy (DBT) suggests that some people are biologically more sensitive to emotions. In recovery, this can lead to "emotional firestorms" that trigger cravings. DBT provides concrete tactics to survive these moments without acting out.`,
    details: [
      { label: 'Biosocial Model', text: 'Dysregulation stems from biological vulnerability plus an invalidating environment.' },
      { label: 'Dialectics', text: 'Holding two opposing truths: "I am doing my best" and "I need to do better."' },
      { label: 'The Amygdala', text: 'DBT skills (like TIPP) are designed to physically override the amygdala’s high-arousal signals.' }
    ]
  }
];

const ScienceHub: React.FC = () => {
  const [activeTopic, setActiveTopic] = useState(SCIENCE_TOPICS[0]);
  const [deepDiveQuery, setDeepDiveQuery] = useState('');
  const [deepDiveResult, setDeepDiveResult] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isListeningSearch, setIsListeningSearch] = useState(false);

  const toggleListeningSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (isListeningSearch) {
      setIsListeningSearch(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-GB';
    recognition.onstart = () => setIsListeningSearch(true);
    recognition.onend = () => setIsListeningSearch(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setDeepDiveQuery(prev => prev ? `${prev} ${transcript}` : transcript);
    };
    recognition.start();
  };

  const handleDeepDive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deepDiveQuery.trim()) return;
    setIsSearching(true);
    const result = await getDiagnosticDeepDive(activeTopic.title, deepDiveQuery);
    setDeepDiveResult(result);
    setIsSearching(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-32">
      {/* Mobile-Friendly Pill Navigation */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 px-2 pb-2 -mx-4 snap-x">
        {SCIENCE_TOPICS.map((topic) => (
          <button
            key={topic.id}
            onClick={() => { 
              if ('vibrate' in navigator) navigator.vibrate(5);
              setActiveTopic(topic); 
              setDeepDiveResult('');
            }}
            className={`flex-shrink-0 px-6 py-3 rounded-full border-2 transition-all snap-center font-black text-[10px] uppercase tracking-widest ${
              activeTopic.id === topic.id 
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500'
            }`}
          >
            {topic.icon} {topic.shortTitle}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[40px] p-6 md:p-12 border border-slate-200 dark:border-slate-800 shadow-xl space-y-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-5xl shadow-inner group transition-transform hover:scale-105">
                <span>{activeTopic.icon}</span>
              </div>
              <div>
                <h3 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">{activeTopic.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse" />
                  <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Clinical Insight</span>
                  <SpeakButton text={activeTopic.content} className="ml-2" />
                </div>
              </div>
            </div>
          </div>

          <div className="prose prose-indigo dark:prose-invert max-w-none">
             <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium italic border-l-4 border-indigo-100 dark:border-indigo-900 pl-6">
               "{activeTopic.content}"
             </p>
          </div>

          {(activeTopic as any).details && (
            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Neural Foundations</h4>
              <div className="space-y-3">
                {(activeTopic as any).details.map((detail: any, i: number) => (
                  <div key={i} className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 relative group">
                     <SpeakButton text={detail.text} className="absolute top-4 right-4 scale-75 opacity-0 group-hover:opacity-100 transition-opacity" />
                     <p className="text-[10px] font-black text-indigo-800 dark:text-indigo-300 uppercase tracking-widest mb-1">{detail.label}</p>
                     <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{detail.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(activeTopic as any).pathways && (
            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Communication Pathways</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(activeTopic as any).pathways.map((path: any, i: number) => (
                  <div key={i} className="p-5 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 relative group">
                     <SpeakButton text={path.role} className="absolute top-4 right-4 scale-75 opacity-0 group-hover:opacity-100 transition-opacity" />
                     <p className="text-[10px] font-black text-indigo-800 dark:text-indigo-300 uppercase tracking-widest mb-1">{path.name}</p>
                     <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium italic">{path.role}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Terminal */}
      <div className="bg-slate-950 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden border-b-[8px] border-slate-900 ring-1 ring-white/5 mx-4 md:mx-0">
         <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                </div>
                <h3 className="font-mono text-sm font-black text-indigo-400 tracking-tight">NEURAL_DEEP_DIVE.sh</h3>
              </div>
            </div>

            <form onSubmit={handleDeepDive} className="space-y-4">
               <div className="relative group">
                 <input 
                   value={deepDiveQuery}
                   onChange={(e) => setDeepDiveQuery(e.target.value)}
                   placeholder={`Query ${activeTopic.shortTitle} specifics...`}
                   className={`w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 font-mono text-sm pr-20 ${isSearching ? 'opacity-50' : ''} ${isListeningSearch ? 'text-rose-400 border-rose-500' : 'text-indigo-100'}`}
                 />
                 <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                   <button type="button" onClick={toggleListeningSearch} className={`p-2 rounded-lg ${isListeningSearch ? 'bg-rose-600 text-white' : 'hover:bg-white/10 text-slate-500'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 006 0V5a3 3 0 00-3-3z" /></svg>
                   </button>
                   <button type="submit" disabled={isSearching || !deepDiveQuery.trim()} className="p-2 bg-indigo-600 text-white rounded-lg disabled:opacity-30">
                      {isSearching ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" /></svg>
                      )}
                   </button>
                 </div>
               </div>
            </form>

            {deepDiveResult && (
              <div className="bg-white/5 rounded-2xl p-6 border border-white/5 animate-in slide-in-from-top-4 relative group">
                 <SpeakButton text={deepDiveResult} className="absolute top-4 right-4" />
                 <p className="text-sm font-medium leading-relaxed italic text-slate-300">"{deepDiveResult}"</p>
                 <button onClick={() => setDeepDiveResult('')} className="mt-4 text-[8px] font-black uppercase text-slate-500 hover:text-white">Clear_Response</button>
              </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default ScienceHub;
