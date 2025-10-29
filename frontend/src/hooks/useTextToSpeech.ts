/**
 * useTextToSpeech Hook
 *
 * Custom React hook for text-to-speech using OpenAI TTS backend.
 *
 * Features:
 * - Play/pause/stop audio
 * - Multiple voice options
 * - Speed control
 * - Audio caching for efficiency
 * - Loading and error states
 *
 * Usage:
 * ```tsx
 * const { play, pause, stop, isPlaying, isLoading, progress } = useTextToSpeech({
 *   text: "What is 12 + 8?",
 *   voice: "nova",
 *   autoPlay: false
 * });
 * ```
 */

import { useState, useRef, useEffect, useCallback } from 'react';

// ============================================================================
// Types
// ============================================================================

export type TTSVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

export interface TextToSpeechOptions {
  text: string;
  voice?: TTSVoice;
  speed?: number;
  autoPlay?: boolean;
  onPlaybackComplete?: () => void;
  onError?: (error: string) => void;
}

export interface TextToSpeechState {
  isLoading: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  progress: number; // 0-100
  duration: number; // seconds
  error: string | null;
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  setSpeed: (speed: number) => void;
}

// ============================================================================
// Audio Cache (Avoid Re-fetching Same Audio)
// ============================================================================

const audioCache = new Map<string, Blob>();

function getCacheKey(text: string, voice: TTSVoice, speed: number): string {
  return `${text}:${voice}:${speed}`;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useTextToSpeech(options: TextToSpeechOptions): TextToSpeechState {
  const {
    text,
    voice = 'nova', // Friendly female voice (recommended for Grade 4)
    speed = 1.0,
    autoPlay = false,
    onPlaybackComplete,
    onError,
  } = options;

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  // ========================================================================
  // Audio Fetching & Playback
  // ========================================================================

  const fetchAudio = useCallback(async (): Promise<Blob> => {
    const cacheKey = getCacheKey(text, voice, speed);

    // Check cache first
    if (audioCache.has(cacheKey)) {
      console.log('🎵 Using cached audio');
      return audioCache.get(cacheKey)!;
    }

    console.log('🌐 Fetching new audio from backend...');

    try {
      const response = await fetch('http://localhost:8000/api/v1/audio/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice,
          speed,
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS failed: ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      console.log(`✅ Audio fetched: ${audioBlob.size} bytes`);

      // Cache for future use
      audioCache.set(cacheKey, audioBlob);

      return audioBlob;
    } catch (err: any) {
      throw new Error(`Failed to fetch audio: ${err.message}`);
    }
  }, [text, voice, speed]);

  const play = useCallback(async () => {
    try {
      setError(null);

      // If paused, just resume
      if (isPaused && audioRef.current) {
        audioRef.current.play();
        setIsPaused(false);
        setIsPlaying(true);
        startProgressTracking();
        return;
      }

      // Otherwise, fetch and play new audio
      setIsLoading(true);

      const audioBlob = await fetchAudio();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create new audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Event listeners
      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
        console.log(`🎵 Audio duration: ${audio.duration}s`);
      };

      audio.onplay = () => {
        setIsPlaying(true);
        setIsPaused(false);
        startProgressTracking();
      };

      audio.onpause = () => {
        setIsPlaying(false);
        setIsPaused(true);
        stopProgressTracking();
      };

      audio.onended = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setProgress(100);
        stopProgressTracking();
        onPlaybackComplete?.();
        console.log('✅ Playback complete');
      };

      audio.onerror = () => {
        const errorMessage = 'Audio playback failed';
        setError(errorMessage);
        setIsPlaying(false);
        setIsLoading(false);
        onError?.(errorMessage);
      };

      // Start playback
      await audio.play();
      setIsLoading(false);

    } catch (err: any) {
      const errorMessage = `Playback error: ${err.message}`;
      setError(errorMessage);
      setIsLoading(false);
      setIsPlaying(false);
      onError?.(errorMessage);
      console.error('TTS error:', err);
    }
  }, [isPaused, fetchAudio, onPlaybackComplete, onError]);

  const pause = useCallback(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPaused(true);
      setIsPlaying(false);
      stopProgressTracking();
      console.log('⏸️  Playback paused');
    }
  }, [isPlaying]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(0);
      stopProgressTracking();
      console.log('⏹️  Playback stopped');
    }
  }, []);

  // ========================================================================
  // Progress Tracking
  // ========================================================================

  const startProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) return;

    progressIntervalRef.current = window.setInterval(() => {
      if (audioRef.current) {
        const currentProgress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
        setProgress(Math.min(currentProgress, 100));
      }
    }, 100);
  }, []);

  const stopProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  // ========================================================================
  // Volume & Speed Control
  // ========================================================================

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  const setSpeed = useCallback((newSpeed: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = Math.max(0.25, Math.min(4, newSpeed));
    }
  }, []);

  // ========================================================================
  // Auto-play Effect
  // ========================================================================

  useEffect(() => {
    if (autoPlay && text) {
      play();
    }

    // Cleanup
    return () => {
      stopProgressTracking();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [autoPlay, text]); // eslint-disable-line react-hooks/exhaustive-deps

  // ========================================================================
  // Return State
  // ========================================================================

  return {
    isLoading,
    isPlaying,
    isPaused,
    progress,
    duration,
    error,
    play,
    pause,
    stop,
    setVolume,
    setSpeed,
  };
}
