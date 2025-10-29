/**
 * AudioControls Component
 *
 * Audio playback controls for question text-to-speech.
 *
 * Features:
 * - Play/pause/stop controls
 * - Progress bar with time display
 * - Volume control
 * - Speed control
 * - Auto-play option
 *
 * Usage:
 * ```tsx
 * <AudioControls
 *   text="What is 12 + 8?"
 *   voice="nova"
 *   autoPlay={true}
 * />
 * ```
 */

'use client';

import React, { useState } from 'react';
import { Play, Pause, Square, Volume2, Settings } from 'lucide-react';
import { useTextToSpeech, TTSVoice } from '@/hooks/useTextToSpeech';
import { Button } from '@/components/ui/button';

// ============================================================================
// Types
// ============================================================================

interface AudioControlsProps {
  text: string;
  voice?: TTSVoice;
  speed?: number;
  autoPlay?: boolean;
  className?: string;
  showSettings?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function AudioControls({
  text,
  voice = 'nova',
  speed: initialSpeed = 1.0,
  autoPlay = false,
  className = '',
  showSettings = false,
}: AudioControlsProps) {
  // State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [speed, setSpeedState] = useState(initialSpeed);

  // Text-to-Speech Hook
  const {
    isLoading,
    isPlaying,
    isPaused,
    progress,
    duration,
    error,
    play,
    pause,
    stop,
    setVolume: setTTSVolume,
    setSpeed: setTTSSpeed,
  } = useTextToSpeech({
    text,
    voice,
    speed,
    autoPlay,
  });

  // ========================================================================
  // Handlers
  // ========================================================================

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handleStop = () => {
    stop();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setTTSVolume(newVolume);
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseFloat(e.target.value);
    setSpeedState(newSpeed);
    setTTSSpeed(newSpeed);
  };

  // ========================================================================
  // Formatting
  // ========================================================================

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTime = (progress / 100) * duration;

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <div className={`flex flex-col gap-3 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border-2 border-neutral-200 dark:border-neutral-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-[var(--ufs-navy)]" />
          <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            Listen to Question
          </span>
        </div>

        {/* Settings Toggle */}
        {showSettings && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="h-8 w-8 p-0"
          >
            <Settings className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Playback Controls */}
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <Button
          onClick={handlePlayPause}
          disabled={isLoading || !!error}
          size="sm"
          className="h-10 w-10 rounded-full bg-[var(--ufs-maroon)] hover:brightness-110"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </Button>

        {/* Stop Button */}
        {(isPlaying || isPaused) && (
          <Button
            onClick={handleStop}
            size="sm"
            variant="outline"
            className="h-10 w-10 rounded-full"
          >
            <Square className="w-4 h-4" />
          </Button>
        )}

        {/* Progress Bar */}
        <div className="flex-1 flex flex-col gap-1">
          <div className="relative h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-[var(--ufs-maroon)] transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Time Display */}
          {duration > 0 && (
            <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Settings */}
      {showSettings && showAdvanced && (
        <div className="pt-3 border-t border-neutral-300 dark:border-neutral-600 space-y-3">
          {/* Volume Control */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 w-16">
              Volume
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs font-mono text-neutral-600 dark:text-neutral-400 w-8">
              {Math.round(volume * 100)}%
            </span>
          </div>

          {/* Speed Control */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 w-16">
              Speed
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={speed}
              onChange={handleSpeedChange}
              className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs font-mono text-neutral-600 dark:text-neutral-400 w-8">
              {speed}x
            </span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-300 dark:border-red-700">
          <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
          <div className="w-3 h-3 border-2 border-[var(--ufs-maroon)] border-t-transparent rounded-full animate-spin" />
          Loading audio...
        </div>
      )}
    </div>
  );
}
