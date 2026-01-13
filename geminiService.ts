
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { SYSTEM_PROMPT, RECOVERY_PHASES } from "./constants";
import { ChainAnalysisData, JournalEntry, MoodEntry, BiometricData, AtmosphereData, ArchiveSummary, CompletedLesson, ShadowArchetype, BeaconMessage, Message, MeetingSession, SomaticRegion } from "./types";

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let currentAudioSource: AudioBufferSourceNode | null = null;
let currentAudioContext: AudioContext | null = null;

export const stopAllSpeech = () => {
  if (currentAudioSource) {
    try {
      currentAudioSource.stop();
    } catch (e) {}
    currentAudioSource = null;
  }
};

/**
 * SANCTUARY LOCAL CORE (SLM Fallback)
 * Provides high-quality, persona-consistent clinical feedback when the cloud API is unreachable.
 * Designed for rural UK areas (Lake District, Highlands) with poor signal.
 */
export const getSanctuaryLocalCoreResponse = (moduleName: string): string => {
  const responses: Record<string, string> = {
    "TIPP Skill": "Biological reset confirmed. Temperature shifts and intense movement have successfully bypassed the emotional firestorm. Your heart rate is beginning to synchronise with safety. You have claimed this moment of stability.",
    "STOP Skill": "The automatic loop is broken. By choosing to pause, you have shifted from the reactive 'using-self' to the observing 'True-Self'. This space between trigger and action is where your freedom lives.",
    "5-4-3-2-1 Grounding": "Sensory anchors are locked. Your brain is now processing the physical facts of your safe environment rather than the projections of anxiety. You are here, you are present, and you are secure.",
    "Breathing Sanctuary": "Vagal tone is increasing. Paced breathing has sent a direct safety signal to your nervous system. The biological storm is receding, leaving room for a clear, values-based choice.",
    "Urge Surfing": "The wave has reached its peak and is now breaking. By riding the urge without acting, you have physically weakened the neural pathway of the habit. Every surf is a victory for your future resilience.",
    "First Aid Toolkit": "Immediate tactical stability achieved. Your system is regulated and your centre is found. You are now capable of making a logical choice for your next step. The path ahead is clear.",
    "Radical Acceptance": "Reality acknowledged. By letting go of the fight against the 'now', you have eliminated the secondary suffering of resentment. You are ready to work with the truth of your situation.",
    "Wise Mind Synthesis": "Centre point achieved. You have acknowledged the heat of your emotions and the cold facts of reason. This synthesis is your most powerful tool for making high-integrity choices.",
    "Functional Chain Analysis": "Pattern deconstructed. You have identified the links in the chain of choice. Next time, your awareness of the 'prompting event' will be your shield. Choice is yours once more.",
    "SMART Goals": "Marker secured. This values-based objective acts as a compass for your expedition. You are moving closer to the True-Self you are architecting.",
    "Default": "I am operating in Local Sanctuary Mode to protect your path in this low-signal area. Your effort is valid, your progress is secure, and your True-Self remains intact. Stay present."
  };

  return responses[moduleName] || responses["Default"];
};

// Added export getOfflineResponse to fix ChatSupport.tsx error
/**
 * Provides a fallback response for the chat when offline.
 */
export const getOfflineResponse = (phaseId: number, isCrisis: boolean): string => {
  if (isCrisis) {
    return "I sense profound distress in your words. Please pause and reach out to one of the safety anchors provided in your Crisis Card. Your presence matters, and safety is our first priority.";
  }
  const phase = RECOVERY_PHASES.find(p => p.id === phaseId);
  return `I am currently in Local Sanctuary Mode to protect your path. Even without a signal, your journey through ${phase?.title || 'this phase'} continues. Every steady step you take is a win for your True-Self. Stay present.`;
};

async function callWithRetry<T>(operation: () => Promise<T>, maxRetries = 2): Promise<T | null> {
  if (!navigator.onLine) return null;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      const errorMsg = error?.message?.toLowerCase() || "";
      const isQuotaExceeded = error?.status === 429 || errorMsg.includes("429") || errorMsg.includes("quota");
      const isOverloaded = error?.status === 503 || errorMsg.includes("503") || errorMsg.includes("overloaded");
      const isInternal = error?.status === 500 || errorMsg.includes("500") || errorMsg.includes("internal error");
      
      if ((isQuotaExceeded || isOverloaded || isInternal) && i < maxRetries - 1) {
        await wait(Math.pow(2, i) * 1500);
        continue;
      }
      throw error;
    }
  }
  return null;
}

export function decodeBase64ToBytes(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

export async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

export const generateSpeech = async (text: string) => {
  return await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Persona: Footsteps Guide (Calm, British). Instruction: Read the following text clearly and slowly. Text: ${text}`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  }).catch(e => {
    console.error("Speech Error:", e);
    return null;
  });
};

export const playSpeech = async (base64Audio: string, onEnd?: () => void) => {
  stopAllSpeech();
  if (!currentAudioContext) currentAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
  else if (currentAudioContext.state === 'suspended') await currentAudioContext.resume();
  const bytes = decodeBase64ToBytes(base64Audio);
  const audioBuffer = await decodeAudioData(bytes, currentAudioContext, 24000, 1);
  const source = currentAudioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(currentAudioContext.destination);
  source.onended = () => {
    if (currentAudioSource === source) currentAudioSource = null;
    if (onEnd) onEnd();
  };
  currentAudioSource = source;
  source.start();
};

export const generateUINarration = async (route: string, pageContent: string): Promise<string | null> => {
  return await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `You are the Footsteps Guide. I will provide you with the raw text visible on the Traveller's screen.
    Current Route Context: "${route}". 
    Visible Content: "${pageContent}". 
    Task: Provide a cohesive verbal walkthrough. Max 65 words. Focus on achievement.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    return response.text;
  });
};

export const getCounselorResponseStream = async (userMessage: string, history: any[] = [], context: string = "", phaseId: number = 1, archive?: ArchiveSummary | null) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const archiveMemory = archive ? `\nArchive Context: ${archive.narrative}` : "";
  return await ai.models.generateContentStream({
    model: 'gemini-3-pro-preview',
    contents: [...history, { role: 'user', parts: [{ text: userMessage }] }],
    config: {
      systemInstruction: `${SYSTEM_PROMPT}\nPhase: ${phaseId}${archiveMemory}\nGuideline: Maintain absolute formal kindness.`,
      temperature: 0.7,
    }
  });
};

export const analyzeNervousSystemAtmosphere = async (moods: MoodEntry[], biometrics: BiometricData): Promise<AtmosphereData | null> => {
  return await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Recent Data Points: ${moods.slice(-5).map(m => m.mood).join(';')}. Heart Rate: ${biometrics.heartRate}bpm. 
    JSON Schema: { "state": "serene" | "steady" | "misty" | "stormy", "insight": "string" }`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { state: { type: Type.STRING }, insight: { type: Type.STRING } },
          required: ["state", "insight"]
        }
      }
    });
    const result = JSON.parse(response.text || '{}');
    return { state: result.state, insight: result.insight, lastUpdated: new Date().toISOString() };
  });
};

export const getJournalInsight = async (entry: Partial<JournalEntry>, currentPhase: string = 'Foundations') => {
  return await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response: any = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: `Phase: ${currentPhase}. Reflection: ${entry.content}. Offer a formal, warm insight. Max 45 words.` }] }],
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return response.text;
  });
};

export const enhanceJournalInsight = async (originalContent: string, additionalContext: string, currentPhase: string = 'Foundations') => {
  return await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Phase: ${currentPhase}. Past: "${originalContent}". Context: "${additionalContext}". Provide Retrospective Insight. Max 60 words.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return response.text;
  });
};

export const getDailyAffirmation = async (rank: string, phaseId: number) => {
  return await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Rank: ${rank}. Phase: ${phaseId}. Create a formal affirmation. Max 30 words.`,
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return response.text;
  });
};

export const getProactiveNudge = async (eventContext: string) => {
  return await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Trigger: ${eventContext}. Offer invitation to regulate. Max 18 words.`,
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return response.text;
  });
};

export const screenCommunityContent = async (text: string): Promise<{ isSafe: boolean; feedback: string }> => {
  return await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Review content for safety. JSON: { "isSafe": boolean, "feedback": "empathetic feedback if unsafe" }`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { isSafe: { type: Type.BOOLEAN }, feedback: { type: Type.STRING } },
          required: ["isSafe", "feedback"]
        }
      }
    });

    return JSON.parse(response.text || '{"isSafe": true, "feedback": ""}');
  }) || { isSafe: true, feedback: "" };
};

export const generateBeaconMessage = async (topic: string, rawAdvice: string): Promise<{ wisdom: string; advice: string } | null> => {
  return await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Topic: "${topic}". Raw: "${rawAdvice}". JSON: { "wisdom": "string", "advice": "string" }`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { wisdom: { type: Type.STRING }, advice: { type: Type.STRING } },
          required: ["wisdom", "advice"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  });
};

export const getShadowArchetype = async (description: string): Promise<ShadowArchetype | null> => {
  return await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Shadow profile: "${description}". JSON: { "name": "string", "description": "string", "originalIntent": "string", "integrationGift": "string" }`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            originalIntent: { type: Type.STRING },
            integrationGift: { type: Type.STRING }
          },
          required: ["name", "description", "originalIntent", "integrationGift"]
        }
      }
    });
    const result = JSON.parse(response.text || '{}');
    return { id: Date.now().toString(), ...result };
  });
};

export const generateShadowArt = async (archetypeName: string) => {
  return await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Symbolic charcoal and gold artwork for shadow archetype '${archetypeName}'. Cinematic.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ parts: [{ text: prompt }] }],
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    for (const part of response.candidates[0].content.parts) if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    return null;
  });
};

export const generateJourneySummary = async (moods: MoodEntry[], lessons: CompletedLesson[], journals: JournalEntry[]): Promise<ArchiveSummary | null> => {
  return await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Summary of journey. JSON: { "narrative": "string", "patterns": ["string"], "strengths": ["string"] }`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            narrative: { type: Type.STRING },
            patterns: { type: Type.ARRAY, items: { type: Type.STRING } },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["narrative", "patterns", "strengths"]
        }
      }
    });
    const result = JSON.parse(response.text || '{}');
    return { lastUpdated: new Date().toISOString(), narrative: result.narrative, patterns: result.patterns, strengths: result.strengths };
  });
};

export const generateTrueSelfArt = async (rank: string, landmarks: string[], atmosphere: string = 'steady') => {
  return await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Rank: '${rank}'. Landmarks: ${landmarks.join(', ')}. Atmosphere: ${atmosphere}. Ethereal teal and gold. Digital painting.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ parts: [{ text: prompt }] }],
      config: { imageConfig: { aspectRatio: "16:9" } }
    });
    for (const part of response.candidates[0].content.parts) if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    return null;
  });
};

export const generateCompletionArt = async (moduleName: string, rank: string) => {
  return await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Symbolic artifact for '${moduleName}'. Rank: '${rank}'. Teal and gold.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ parts: [{ text: prompt }] }],
      config: { imageConfig: { aspectRatio: "16:9" } }
    });
    for (const part of response.candidates[0].content.parts) if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    return null;
  });
};

// Added export generateMissionSynthesis to fix SmartGoals.tsx error
/**
 * Synthesizes a goal debriefing into a victory reflection.
 */
export const generateMissionSynthesis = async (title: string, debrief: string): Promise<string | null> => {
  return await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Marker: "${title}". Debrief: "${debrief}". Synthesize this victory. Max 50 words. Focus on identity shift and achievement.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return response.text;
  });
};

export const getModuleReflection = async (moduleName: string, context: string, rating?: number) => {
  if (!navigator.onLine) return getSanctuaryLocalCoreResponse(moduleName);
  return await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Module: ${moduleName}. Context: ${context}. Rating: ${rating || 'N/A'}. Reflection. Max 40 words.`,
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return response.text;
  }) || getSanctuaryLocalCoreResponse(moduleName);
};

export const recommendSomaticProtocol = async (regions: SomaticRegion[]): Promise<{ title: string; instruction: string } | null> => {
  return await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const tensionContext = regions.map(r => `${r.label} (Intensity ${r.intensity}/3)`).join(', ');
    const prompt = `Tension: ${tensionContext}. Somatic Protocol. JSON: { "title": "string", "instruction": "string" }`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { title: { type: Type.STRING }, instruction: { type: Type.STRING } },
          required: ["title", "instruction"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  });
};

export const getJournalPrompt = async (phaseId: number, mood: string): Promise<string | null> => {
  return await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: `Phase: ${phaseId}. Mood: ${mood}. Contemplative prompt. Max 25 words.` }] }],
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return response.text;
  });
};

export const getGratitudePrompt = async (phaseTitle: string, mood: string): Promise<string | null> => {
  return await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: `Phase: ${phaseTitle}. Mood: ${mood}. Glimmer prompt. Max 20 words.` }] }],
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return response.text;
  });
};

export const summarizeChain = async (data: any): Promise<string | null> => {
  return await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Chain Analysis summary. Max 60 words. Data: ${JSON.stringify(data)}`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return response.text;
  });
};

export const getLocalSupport = async (lat?: number, lng?: number): Promise<{ text: string; grounding: any[] } | null> => {
  return await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const contents = "UK recovery support centres and meetings near me.";
    const config: any = { tools: [{ googleMaps: {} }] };
    if (lat && lng) config.toolConfig = { retrievalConfig: { latLng: { latitude: lat, longitude: lng } } };
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: contents }] }],
      config
    });
    return {
      text: response.text || "Searching for support...",
      grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  });
};

export const generateMeetingReflection = async (title: string, takeaway: string): Promise<string | null> => {
  return await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Meeting: "${title}". Takeaway: "${takeaway}". Commendation. Max 40 words.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return response.text;
  });
};

export const getDiagnosticDeepDive = async (topic: string, query: string): Promise<string | null> => {
  return await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Topic: ${topic}. Query: ${query}. Clinical explanation. Max 80 words.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return response.text;
  });
};

export const generateMilestoneEmail = async (userName: string, milestone: string, type: 'streak' | 'badge'): Promise<string | null> => {
  return await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `User: ${userName}. Milestone: ${milestone}. Type: ${type}. Email body. Max 100 words.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return response.text;
  });
};

export const checkCrisisStatus = (text: string): boolean => {
  const keywords = ['kill myself', 'suicide', 'self-harm', 'end it all', 'give up', 'no reason', 'hurt myself', 'want to die', 'overdose', '999'];
  return keywords.some(k => text.toLowerCase().includes(k));
};

export function encodeAudio(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
