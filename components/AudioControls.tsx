'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { useAudioConsent } from '@/hooks/use-audio-consent';
import { motion, AnimatePresence } from 'framer-motion';

const AUDIO_PLAYED_KEY = 'preuniversitario_audio_played_once';

export function AudioControls() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const { preferences, toggleMusic } = useAudioConsent();

  // Auto-play music once when component mounts (only if user has consented)
  useEffect(() => {
    // Only auto-play if user has consented and enabled music
    if (!preferences.hasConsented || !preferences.musicEnabled || !audioRef.current) {
      console.log('🎵 Audio autoplay skipped - user consent not given or music disabled');
      return;
    }

    // Check if audio has already been played today
    const today = new Date().toDateString();
    const lastPlayed = localStorage.getItem(AUDIO_PLAYED_KEY);
    const hasPlayedToday = lastPlayed === today;

    if (hasPlayedToday) {
      console.log('🎵 Audio already played today');
      return;
    }

    const playAudio = async () => {
      try {
        console.log('🎵 Attempting to play dashboard audio once...');
        audioRef.current!.volume = 0.3;
        audioRef.current!.loop = false; // Dashboard music doesn't loop

        // Check if audio can play (browser autoplay policy)
        if (audioRef.current!.paused) {
          await audioRef.current!.play();
          console.log('✅ Dashboard audio playing successfully');

          // Mark as played for today
          localStorage.setItem(AUDIO_PLAYED_KEY, today);

          setIsPlaying(true);
        } else {
          console.log('🎵 Audio already playing');
          setIsPlaying(true);
        }
      } catch (error) {
        console.log('❌ Dashboard audio autoplay prevented by browser:', error);
        console.log('💡 User can manually play using the play button');
        setIsPlaying(false);
      }
    };

    // Small delay to ensure audio element is ready
    const timer = setTimeout(playAudio, 1000);
    return () => clearTimeout(timer);
  }, [preferences.hasConsented, preferences.musicEnabled]); // Depend on consent preferences

  // Handle play/pause toggle using consent system
  const handleToggle = async () => {
    if (!audioRef.current) return;

    try {
      // Use the consent hook's toggle function
      toggleMusic();

      // If turning music on and not currently playing, start playing
      if (!preferences.musicEnabled && !isPlaying) {
        audioRef.current.volume = 0.3;
        audioRef.current.loop = false; // Dashboard music doesn't loop
        await audioRef.current.play();
        setIsPlaying(true);
      }
      // If turning music off and currently playing, pause it
      else if (preferences.musicEnabled && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      console.log('Audio playback failed:', error);
    }
  };

  // Show controls only if user has consented to music
  const shouldShowControls = preferences.hasConsented && preferences.musicEnabled;

  console.log('🎵 AudioControls rendering - shouldShowControls:', shouldShowControls);

  if (!shouldShowControls) {
    return null;
  }

  return (
    <>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src="/landing.mp3"
        preload="auto"
        className="hidden"
        onEnded={() => {
          console.log('🎵 Audio ended');
          setIsPlaying(false);
        }}
        onPlay={() => {
          console.log('🎵 Audio started playing');
          setIsPlaying(true);
        }}
        onPause={() => {
          console.log('🎵 Audio paused');
          setIsPlaying(false);
        }}
        onLoadStart={() => console.log('🎵 Audio loading started')}
        onLoadedData={() => console.log('🎵 Audio loaded successfully')}
        onError={(e) => console.error('🎵 Audio error:', e)}
      />

      {/* Floating audio control button */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed bottom-6 right-6 z-50"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <div className="relative">
            <Button
              onClick={handleToggle}
              size="lg"
              className="h-12 w-12 rounded-full bg-amber-500/90 hover:bg-amber-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm border border-amber-400/20"
              aria-label={isPlaying ? 'Pausar música de fondo' : 'Reproducir música de fondo'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </Button>

            {/* Tooltip */}
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-black/80 text-white text-sm rounded-lg whitespace-nowrap backdrop-blur-sm border border-amber-500/20"
                >
                  {isPlaying ? 'Pausar música' : 'Reproducir música'}
                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80"></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}