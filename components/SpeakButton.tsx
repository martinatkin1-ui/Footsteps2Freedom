
import React, { useState, useEffect } from 'react';
import { generateSpeech, playSpeech, stopAllSpeech } from '../geminiService';
import { useRecoveryStore } from '../store';

interface SpeakButtonProps {
  text: string;
  className?: string;
  size?: number;
}

const SpeakButton: React.FC<SpeakButtonProps> = ({ text, className = "", size = 18 }) => {
  const audioCache = useRecoveryStore(state => state.audioCache);
  const cacheAudio = useRecoveryStore(state => state.cacheAudio);
  const currentlySpeakingText = useRecoveryStore(state => state.currentlySpeakingText);
  const setCurrentlySpeakingText = useRecoveryStore(state => state.setCurrentlySpeakingText);
  const isQuietMode = useRecoveryStore(state => state.settings.isQuietMode);

  // This specific button is playing if the global state matches its specific text
  const isThisButtonPlaying = currentlySpeakingText === text;

  const handleSpeak = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Silence check
    if (isQuietMode) return;

    // If THIS button is already playing, stop everything
    if (isThisButtonPlaying) {
      stopAllSpeech();
      setCurrentlySpeakingText(null);
      return;
    }

    // Stop anything else first
    stopAllSpeech();
    setCurrentlySpeakingText(text);

    try {
      let base64 = audioCache[text];
      if (!base64) {
        base64 = await generateSpeech(text) || "";
        if (base64) cacheAudio(text, base64);
      }
      
      if (base64) {
        await playSpeech(base64, () => {
          // Check if we are still the intended audio to clear
          setCurrentlySpeakingText(null);
        });
      } else {
        setCurrentlySpeakingText(null);
      }
    } catch (e) {
      console.error("Speech playback failed", e);
      setCurrentlySpeakingText(null);
    }
  };

  return (
    <button 
      onClick={handleSpeak}
      disabled={isQuietMode}
      className={`p-2 rounded-xl transition-all active:scale-90 focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none ${isQuietMode ? 'opacity-20 cursor-not-allowed' : isThisButtonPlaying ? 'bg-indigo-600 text-white animate-pulse' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100'} ${className}`}
      aria-label={isThisButtonPlaying ? "Stop reading text" : `Read aloud: ${text.slice(0, 30)}...`}
      aria-pressed={isThisButtonPlaying}
    >
      {isThisButtonPlaying ? (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 9h6v6H9V9z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
        </svg>
      )}
    </button>
  );
};

export default SpeakButton;
