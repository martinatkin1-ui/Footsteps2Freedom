
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
    const prompt = `You are the Footsteps Guide. I will provide you with the raw text visible on the Traveller's screen (including any open windows, modals, or calculators).
    
    Current Route Context: "${route}". 
    Visible Content: "${pageContent}". 
    
    Your Task:
    1. Provide a cohesive verbal walkthrough of the current landscape. 
    2. Read out the key text accurately but formatted for natural speech.
    3. Crucially, provide specific clinical feedback or encouragement if you see progress data (e.g., money saved, sobriety days, completed exercises) or signs of struggle (e.g., HALT scores).
    4. Maintain a warm, formal, British mentor persona. Avoid reading out navigation UI (like 'Home', 'Support') unless it is relevant to the feedback.
    
    Max 65 words. Focus on the achievement of the Traveller's current state.`;
    
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
      systemInstruction: `${SYSTEM_PROMPT}\nPhase: ${phaseId}${archiveMemory}\nGuideline: Maintain absolute formal kindness. Always frame responses around what the Traveller is currently achieving and their capacity for the next victory.`,
      temperature: 0.7,
    }
  });
};

export const generateMissionSynthesis = async (goalTitle: string, userReflection: string): Promise<string | null> => {
  return await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Mission Marker: "${goalTitle}". Traveller's Reflection: "${userReflection}". Provide a formal commendation. Focus on how this victory solidifies their True-Self and future potential. Max 50 words. Persona: Puck Guide.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    return response.text;
  });
};

export const analyzeNervousSystemAtmosphere = async (moods: MoodEntry[], biometrics: BiometricData): Promise<AtmosphereData | null> => {
  return await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Recent Data Points: ${moods.slice(-5).map(m => m.mood).join(';')}. Heart Rate: ${biometrics.heartRate}bpm. 
    Determine the current nervous system atmosphere. 
    Provide a formal, calm insight on what the Traveller can achieve now to maintain stability. 
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
      contents: [{ role: 'user', parts: [{ text: `Phase: ${currentPhase}. Reflection: ${entry.content}. Offer a formal, warm, and sophisticated insight focused on the Traveller's emerging strengths and growth markers. Max 45 words.` }] }],
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return response.text;
  });
};

/**
 * Deepens insight for past journal entries by incorporating retrospective user context.
 */
export const enhanceJournalInsight = async (originalContent: string, additionalContext: string, currentPhase: string = 'Foundations') => {
  return await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Phase: ${currentPhase}. 
    Original Reflection from the Past: "${originalContent}". 
    Retrospective Context Provided Today: "${additionalContext}". 
    
    Task: Provide a sophisticated, formal, and deeply empathetic "Retrospective Insight". 
    Analyze the gap between then and now. Identify patterns or strengths that the Traveller was blind to then, but can see now through your mirror. 
    Focus on the achievement of growth. UK English. Max 60 words. Persona: Footsteps Guide.`;
    
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
      contents: `Rank: ${rank}. Phase: ${phaseId}. Create a formal, calm affirmation of potential and capacity. UK English. Focus on the achievement of the coming 24 hours. Max 30 words.`,
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
      contents: `Event Trigger: ${eventContext}. Offer a formal, calm invitation to regulate and achieve biological stability. Max 18 words. UK English.`,
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return response.text;
  });
};

export const checkCrisisStatus = (text: string): boolean => {
  const crisisKeywords = ['kill myself', 'suicide', 'self-harm', 'end it all', 'give up on life', 'no reason to live', 'hurt myself', 'want to die', 'overdose', '999', 'hospital'];
  return crisisKeywords.some(keyword => text.toLowerCase().includes(keyword));
};

export const screenCommunityContent = async (text: string): Promise<{ isSafe: boolean; feedback: string }> => {
  return await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `You are the Footsteps Safety Monitor. Your goal is to ensure the community remains a safe, recovery-oriented sanctuary. 
    
    Review the following text for:
    1. "War Stories": Graphic descriptions of drug/alcohol use that glorify the experience.
    2. Triggering Language: Specific details that could trigger a relapse in others.
    3. Abusive or non-recovery-oriented language.
    4. Mention of self-harm or immediate crisis (if found, flag as unsafe).

    TEXT TO REVIEW: "${text}"

    JSON Output Format: { "isSafe": boolean, "feedback": "empathetic UK English feedback if unsafe, explaining why we must hold the sanctuary's safety, otherwise empty string" }`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isSafe: { type: Type.BOOLEAN },
            feedback: { type: Type.STRING }
          },
          required: ["isSafe", "feedback"]
        }
      }
    });

    const result = JSON.parse(response.text || '{"isSafe": true, "feedback": ""}');
    return result;
  }) || { isSafe: true, feedback: "" };
};

export const getOfflineResponse = (phaseId: number = 1, isCrisis: boolean = false): string => {
  const responses = [
    "I am currently operating in local sanctuary mode. Take a slow breath: 4 seconds in, 6 seconds out. You are capable of achieving stability.",
    "The path ahead is clear if we focus on the present step. Biological regulation is your only objective in this moment.",
    "Patience is a cornerstone of healing. Your potential remains intact, even in the silence."
  ];
  return responses[Math.floor(Math.random() * responses.length)];
};

export const generateBeaconMessage = async (topic: string, rawAdvice: string): Promise<{ wisdom: string; advice: string } | null> => {
  return await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Topic: "${topic}". Raw Experience: "${rawAdvice}". 
    Synthesise into: 
    1. A formal Wisdom Artifact (max 15 words). 
    2. A concrete Wayfinder's Action (max 40 words) that another Traveller can achieve. 
    Persona: Wise British mentor. UK English. JSON: { "wisdom": "string", "advice": "string" }`;
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
    const prompt = `Shadow profile: "${description}". 
    Assign a formal UK Archetype name. 
    Focus on the achievement of integration. 
    JSON Schema: { "name": "string", "description": "string", "originalIntent": "string", "integrationGift": "string" }`;
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
    const prompt = `Symbolic formal charcoal and gold artwork for the shadow archetype '${archetypeName}'. Cinematic, high contrast, elegant, no faces.`;
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
    const prompt = `Create a formal 'Golden Thread' summary of this journey. 
    Focus on achievements and strengths. 
    JSON Schema: { "narrative": "string", "patterns": ["string"], "strengths": ["string"] }`;
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
    const prompt = `Formal digital painting. Rank: '${rank}'. Landmarks: ${landmarks.join(', ')}. Atmosphere: ${atmosphere}. Ethereal teal and gold. Cinematic lighting.`;
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
    const prompt = `Formal symbolic artifact for achievement in '${moduleName}'. Rank: '${rank}'. Style: Ancient geometric, teal and gold, cinematic lighting, no text.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ parts: [{ text: prompt }] }],
      config: { imageConfig: { aspectRatio: "16:9" } }
    });
    for (const part of response.candidates[0].content.parts) if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    return null;
  });
};

export const getModuleReflection = async (moduleName: string, context: string, rating?: number) => {
  const localFallback = getSanctuaryLocalCoreResponse(moduleName);
  
  if (!navigator.onLine) {
    return localFallback;
  }

  return await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Module: ${moduleName}. Context: ${context}. Rating: ${rating || 'N/A'}. 
      Provide a formal, warm reflection on the achievement of this step. Max 40 words. UK English.`,
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return response.text;
  }) || localFallback;
};

export const recommendSomaticProtocol = async (regions: SomaticRegion[]): Promise<{ title: string; instruction: string } | null> => {
  return await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const tensionContext = regions.map(r => `${r.label} (Intensity ${r.intensity}/3)`).join(', ');
    const prompt = `Tension: ${tensionContext}. Provide a formal 3-step Somatic Reset Protocol focusing on the achievement of biological calm. JSON: { "title": "string", "instruction": "string" }`;
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
      contents: [{ role: 'user', parts: [{ text: `Phase: ${phaseId}. Mood: ${mood}. Provide a formal, contemplative journal prompt that encourages the Traveller to explore their True-Self. Max 25 words.` }] }],
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
      contents: [{ role: 'user', parts: [{ text: `Phase: ${phaseTitle}. Current Mood: ${mood}. Offer a formal prompt to help the Traveller identify a "Glimmer" of gratitude in their current surroundings. Max 20 words.` }] }],
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return response.text;
  });
};

export const summarizeChain = async (data: any): Promise<string | null> => {
  return await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Deconstruct the following Chain Analysis data and provide a formal clinical summary focusing on the "Link of Choice" where the Traveller can intervene next time.
    Data: ${JSON.stringify(data)}
    Format: Formal, empathetic British mentor. Max 60 words.`;
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
    const contents = "Find local recovery support centres, NHS mental health hubs, and AA/NA meetings near me in the UK. Provide a supportive summary and specific locations.";
    const config: any = {
      tools: [{ googleMaps: {} }],
    };
    
    if (lat && lng) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: { latitude: lat, longitude: lng }
        }
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: contents }] }],
      config
    });

    return {
      text: response.text || "I am searching for local support landmarks in your vicinity.",
      grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  });
};

export const generateMeetingReflection = async (title: string, takeaway: string): Promise<string | null> => {
  return await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Meeting: "${title}". Traveller's Takeaway: "${takeaway}". Provide a formal commendation on the value of this shared wisdom. Max 40 words. Persona: Puck Guide.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return response.text;
  });
};

export function encodeAudio(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export const getDiagnosticDeepDive = async (topic: string, query: string): Promise<string | null> => {
  return await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Topic: ${topic}. Specific Query: ${query}. 
    Provide a formal, clinical deep-dive explanation based on UK recovery standards and neuroscience. 
    Maintain a calm, sophisticated tone. Max 80 words.`;
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
    const prompt = `Traveller Name: ${userName}. Milestone Reached: ${milestone}. Type: ${type}.
    Your Task: Write a formal, deeply encouraging, and warm UK-English congratulatory email body. 
    Persona: Footsteps Guide. 
    Include: 
    1. A sophisticated subject line. 
    2. Deep clinical mirroring of why this milestone matters for their True-Self. 
    3. A values-based encouraging closing. 
    Max 100 words.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return response.text;
  });
};
