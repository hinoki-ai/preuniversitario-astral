'use client';

import { useRef, useEffect } from 'react';

export function HomepageMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);

  // Auto-play music when component mounts (homepage arrival)
  useEffect(() => {
    if (!audioRef.current) {
      console.log('🎵 Audio element not ready');
      return;
    }

    const playAudio = async () => {
      try {
        console.log('🎵 Attempting to play homepage music...');
        audioRef.current!.volume = 0.3; // Slightly quieter for background
        audioRef.current!.loop = true; // Loop the background music

        if (audioRef.current!.paused) {
          await audioRef.current!.play();
          console.log('✅ Homepage music playing successfully');
        } else {
          console.log('🎵 Music already playing');
        }
      } catch (error) {
        console.log('❌ Music autoplay prevented by browser:', error);
        console.log('💡 This is expected - user must interact with page first');
      }
    };

    // Small delay to ensure audio element is ready
    const timer = setTimeout(playAudio, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Hidden audio element - no controls visible */}
      <audio
        ref={audioRef}
        src="/landing.mp3"
        preload="auto"
        className="hidden"
        onEnded={() => {
          console.log('🎵 Homepage audio ended');
        }}
        onPlay={() => {
          console.log('🎵 Homepage audio started playing');
        }}
        onPause={() => {
          console.log('🎵 Homepage audio paused');
        }}
        onLoadStart={() => console.log('🎵 Homepage audio loading started')}
        onLoadedData={() => console.log('🎵 Homepage audio loaded successfully')}
        onError={(e) => console.error('🎵 Homepage audio error:', e)}
      />
    </>
  );
}