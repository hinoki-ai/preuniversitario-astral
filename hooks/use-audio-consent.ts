'use client';

import { useState, useEffect } from 'react';

export interface AudioConsentPreferences {
  musicEnabled: boolean;
  soundEffects: boolean;
  hasConsented: boolean;
}

const AUDIO_CONSENT_KEY = 'preuniversitario_audio_consent';
const DEFAULT_PREFERENCES: AudioConsentPreferences = {
  musicEnabled: false, // Start with music disabled until user consents
  soundEffects: true,
  hasConsented: false,
};

export function useAudioConsent() {
  const [preferences, setPreferences] = useState<AudioConsentPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUDIO_CONSENT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed, hasConsented: true });
      }
    } catch (error) {
      console.warn('Failed to load audio preferences:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save preferences to localStorage
  const savePreferences = (newPreferences: Partial<AudioConsentPreferences>) => {
    try {
      const updated = { ...preferences, ...newPreferences };
      console.log('💾 Saving preferences:', updated);
      localStorage.setItem(AUDIO_CONSENT_KEY, JSON.stringify(updated));
      setPreferences(updated);
      console.log('💾 Preferences saved successfully');
    } catch (error) {
      console.warn('Failed to save audio preferences:', error);
    }
  };

  // Enable music (typically called after user consent)
  const enableMusic = () => {
    console.log('🔊 Enabling music...');
    console.log('Current preferences before enable:', preferences);
    savePreferences({ musicEnabled: true, hasConsented: true });
    console.log('✅ Music enabled, preferences updated');
  };

  // Disable music
  const disableMusic = () => {
    savePreferences({ musicEnabled: false, hasConsented: true });
  };

  // Toggle music
  const toggleMusic = () => {
    savePreferences({
      musicEnabled: !preferences.musicEnabled,
      hasConsented: true
    });
  };

  // Toggle sound effects
  const toggleSoundEffects = () => {
    savePreferences({ soundEffects: !preferences.soundEffects });
  };

  // Reset all preferences
  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
    try {
      localStorage.removeItem(AUDIO_CONSENT_KEY);
    } catch (error) {
      console.warn('Failed to reset audio preferences:', error);
    }
  };

  return {
    preferences,
    isLoaded,
    enableMusic,
    disableMusic,
    toggleMusic,
    toggleSoundEffects,
    resetPreferences,
    savePreferences,
  };
}