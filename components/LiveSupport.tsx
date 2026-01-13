import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { decodeAudioData, decodeBase64ToBytes, encodeAudio } from '../geminiService';

interface LiveSupportProps {
  onExit: () => void;
}

const LiveSupport: React.FC<LiveSupportProps> = ({ onExit }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const startSession = async () => {
    setIsConnecting(true);
    // Create new instance right before use to ensure API key freshness
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
          },
          systemInstruction: 'You are "Footsteps Guide." Your persona is calm, warm, formal, and deeply empathetic. Speak slowly and clearly in a standard British dialect. Your focus is on the Traveller\'s capacity for achievement and growth.'
        },
        callbacks: {
          onopen: () => {
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const sum = inputData.reduce((a, b) => a + Math.abs(b), 0);
              setAudioLevel(sum / inputData.length);

              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              
              sessionPromise.then(s => s.sendRealtimeInput({
                media: { data: encodeAudio(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' }
              }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
            setIsActive(true);
            setIsConnecting(false);
          },
          onmessage: async (msg) => {
            const audioBase64 = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioBase64) {
              const bytes = decodeBase64ToBytes(audioBase64);
              const buffer = await decodeAudioData(bytes, outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputCtx.destination);
              
              const now = outputCtx.currentTime;
              const start = Math.max(now, nextStartTimeRef.current);
              source.start(start);
              nextStartTimeRef.current = start + buffer.duration;
              
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }
            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: () => setIsConnecting(false),
          onclose: () => setIsActive(false)
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setIsConnecting(false);
    }
  };

  const endSession = () => {
    sessionRef.current?.close();
    setIsActive(false);
    onExit();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-white animate-in fade-in duration-500">
      <div className="relative w-full max-w-lg aspect-square flex items-center justify-center">
        <div 
          className={`absolute w-64 h-64 rounded-full transition-all duration-300 blur-[80px] opacity-40 ${
            isActive ? 'bg-teal-500 scale-125' : 'bg-indigo-500'
          }`}
          style={{ transform: `scale(${1 + audioLevel * 10})` }}
        />
        <div className={`relative w-48 h-48 rounded-full border-4 border-white/20 flex items-center justify-center z-10 transition-transform ${isActive ? 'animate-pulse' : ''}`}>
           <span className="text-6xl">{isActive ? '🧘' : '⏳'}</span>
        </div>
      </div>

      <div className="mt-12 text-center space-y-4 max-w-sm">
        <h2 className="text-3xl font-black tracking-tight">
          {isConnecting ? 'Initialising Guide...' : isActive ? 'Direct Uplink Active' : 'Sacred Link'}
        </h2>
        <p className="text-slate-400 font-medium leading-relaxed">
          {isActive ? 'Speak freely, Traveller. I am listening to your progress with absolute focus.' : 'Ready for a formal vocal session with the Footsteps Guide?'}
        </p>
      </div>

      <div className="mt-16 w-full max-w-xs space-y-4">
        {!isActive ? (
          <button
            onClick={startSession}
            disabled={isConnecting}
            className="w-full py-5 bg-teal-600 text-white font-black rounded-3xl shadow-xl hover:bg-teal-700 transition-all active:scale-95 disabled:bg-slate-800 disabled:text-slate-500"
          >
            {isConnecting ? 'Initialising...' : 'Begin Protocol'}
          </button>
        ) : (
          <button
            onClick={endSession}
            className="w-full py-5 bg-rose-600 text-white font-black rounded-3xl shadow-xl hover:bg-rose-700 transition-all active:scale-95"
          >
            Terminate Uplink
          </button>
        )}
        <button onClick={onExit} className="w-full text-slate-500 font-bold uppercase tracking-widest text-[10px]">Return to Sanctuary</button>
      </div>
    </div>
  );
};

export default LiveSupport;
