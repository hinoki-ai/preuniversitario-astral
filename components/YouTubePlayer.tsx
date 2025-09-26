'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type YouTubePlayerProps = {
  videoId: string;
  playbackRate: number;
  onReady?: (player: any) => void;
  onTimeUpdate?: (seconds: number) => void;
  onDurationChange?: (seconds: number) => void;
};

type YouTubeApiState = {
  promise: Promise<any>;
};

let youtubeApiState: YouTubeApiState | null = null;

function loadYouTubeIframeAPI(): Promise<any> {
  if (typeof window === 'undefined') return Promise.resolve(null);

  if (window.YT && typeof window.YT.Player === 'function') {
    return Promise.resolve(window.YT);
  }

  if (youtubeApiState) return youtubeApiState.promise;

  youtubeApiState = {
    promise: new Promise(resolve => {
      const handleReady = () => {
        if (window.YT && typeof window.YT.Player === 'function') {
          resolve(window.YT);
        }
      };

      if (typeof window !== 'undefined') {
        const previous = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          previous?.();
          handleReady();
        };

        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.async = true;
        script.onload = () => {
          if (window.YT && typeof window.YT.Player === 'function') {
            resolve(window.YT);
          }
        };
        document.body.appendChild(script);
      }
    }),
  };

  return youtubeApiState.promise;
}

export function YouTubePlayer({
  videoId,
  playbackRate,
  onReady,
  onTimeUpdate,
  onDurationChange,
}: YouTubePlayerProps) {
  const containerId = useMemo(() => `yt-player-${Math.random().toString(36).slice(2)}`, []);
  const playerRef = useRef<any | null>(null);
  const intervalRef = useRef<number | null>(null);
  const [playerReady, setPlayerReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    setPlayerReady(false);

    loadYouTubeIframeAPI().then(YT => {
      if (!mounted || !YT) return;

      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      playerRef.current = new YT.Player(containerId, {
        videoId,
        playerVars: {
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          enablejsapi: 1,
          origin: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
        events: {
          onReady: (event: any) => {
            if (!mounted) return;
            try {
              event.target.setPlaybackRate(playbackRate);
            } catch (_error) {
              // ignore unsupported playback rate
            }
            setPlayerReady(true);
            onReady?.(event.target);
            if (onDurationChange) {
              const duration = event.target.getDuration?.();
              if (typeof duration === 'number' && !Number.isNaN(duration)) {
                onDurationChange(duration);
              }
            }
          },
          onStateChange: () => {
            if (!mounted || !playerRef.current) return;
            if (onDurationChange) {
              const duration = playerRef.current.getDuration?.();
              if (typeof duration === 'number' && !Number.isNaN(duration)) {
                onDurationChange(duration);
              }
            }
          },
        },
      });
    });

    return () => {
      mounted = false;
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (playerRef.current) {
        playerRef.current.destroy?.();
        playerRef.current = null;
      }
    };
  }, [containerId, onDurationChange, onReady, playbackRate, videoId]);

  useEffect(() => {
    if (!playerRef.current) return;
    try {
      playerRef.current.setPlaybackRate(playbackRate);
    } catch (_error) {
      // ignore unsupported playback rate
    }
  }, [playbackRate]);

  useEffect(() => {
    if (!onTimeUpdate) return;
    if (!playerReady || !playerRef.current) return;

    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
    }

    intervalRef.current = window.setInterval(() => {
      if (!playerRef.current) return;
      const time = playerRef.current.getCurrentTime?.();
      if (typeof time === 'number' && !Number.isNaN(time)) {
        onTimeUpdate(time);
      }
    }, 500);

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [onTimeUpdate, playerReady]);

  return <div id={containerId} className="h-full w-full" />;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}
