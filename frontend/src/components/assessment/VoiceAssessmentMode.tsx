/**
 * VoiceAssessmentMode Component
 *
 * Visual feedback UI for hands-free voice assessment mode.
 *
 * Features:
 * - Floating voice status indicator
 * - Animated listening visualization
 * - Real-time transcription preview
 * - Command confirmation dialogs
 * - Toggle button for enable/disable
 *
 * Usage:
 * ```tsx
 * <VoiceAssessmentMode
 *   voiceMode={voiceMode}
 *   onToggle={() => voiceMode.toggle()}
 * />
 * ```
 */

'use client';

import React from 'react';
import { Mic, MicOff, Volume2, VolumeX, CheckCircle, AlertCircle, HelpCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type VoiceAssessmentState } from '@/hooks/useVoiceAssessmentMode';

// ============================================================================
// Types
// ============================================================================

interface VoiceAssessmentModeProps {
  voiceMode: VoiceAssessmentState;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function VoiceAssessmentMode({
  voiceMode,
  className = '',
}: VoiceAssessmentModeProps) {
  const {
    isEnabled,
    state,
    currentCommand,
    statusMessage,
    error,
    toggle,
    confirmCommand,
    cancelCommand,
    isQuestionPlaying,
    stopSpeaking,
    isListening,
    audioLevel,
    transcript,
  } = voiceMode;

  // ========================================================================
  // State-based Styling
  // ========================================================================

  const getStateColor = () => {
    if (error) return 'border-red-500 bg-red-50 dark:bg-red-900/20';
    if (state === 'reading_question') return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
    if (state === 'listening') return 'border-green-500 bg-green-50 dark:bg-green-900/20';
    if (state === 'processing' || state === 'executing') return 'border-amber-500 bg-amber-50 dark:bg-amber-900/20';
    if (state === 'confirming') return 'border-purple-500 bg-purple-50 dark:bg-purple-900/20';
    return 'border-neutral-300 bg-white dark:bg-neutral-800';
  };

  const getStateIcon = () => {
    if (error) return <AlertCircle className="w-6 h-6 text-red-600" />;
    if (state === 'reading_question') return <Volume2 className="w-6 h-6 text-blue-600 animate-pulse" />;
    if (state === 'listening') return <Mic className="w-6 h-6 text-green-600 animate-pulse" />;
    if (state === 'processing' || state === 'executing') return <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />;
    if (state === 'confirming') return <HelpCircle className="w-6 h-6 text-purple-600 animate-bounce" />;
    if (isEnabled) return <Mic className="w-6 h-6 text-[var(--ufs-navy)]" />;
    return <MicOff className="w-6 h-6 text-neutral-400" />;
  };

  const getStateLabel = () => {
    if (error) return 'Error';
    if (state === 'reading_question') return 'Reading Question';
    if (state === 'listening') return 'Listening...';
    if (state === 'processing') return 'Processing...';
    if (state === 'executing') return 'Executing Command';
    if (state === 'confirming') return 'Confirm Command';
    if (isEnabled) return 'Voice Mode: Active';
    return 'Voice Mode: Inactive';
  };

  // ========================================================================
  // Render: Disabled State
  // ========================================================================

  if (!isEnabled) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <Button
          onClick={toggle}
          size="lg"
          className="rounded-full shadow-2xl bg-[var(--ufs-maroon)] hover:brightness-110 px-6"
        >
          <Mic className="w-5 h-5 mr-2" />
          Enable Voice Mode
        </Button>
      </div>
    );
  }

  // ========================================================================
  // Render: Enabled State (Floating Status Card)
  // ========================================================================

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {/* Main Status Card */}
      <div
        className={`
          rounded-2xl border-4 shadow-2xl transition-all duration-300
          ${getStateColor()}
          p-6 min-w-[320px] max-w-md
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Animated Icon */}
            <div className="relative">
              {/* Audio Level Visualizer (when listening) */}
              {isListening && (
                <div
                  className="absolute inset-0 rounded-full bg-green-500/30 transition-transform duration-100"
                  style={{
                    transform: `scale(${1 + audioLevel * 0.5})`,
                    opacity: 0.3 + audioLevel * 0.7,
                  }}
                />
              )}
              {getStateIcon()}
            </div>

            {/* State Label */}
            <div>
              <h3 className="font-bold text-sm text-[var(--ufs-navy)] dark:text-white">
                {getStateLabel()}
              </h3>
              {statusMessage && (
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                  {statusMessage}
                </p>
              )}
            </div>
          </div>

          {/* Disable Button */}
          <Button
            onClick={toggle}
            size="sm"
            variant="outline"
            className="rounded-full"
          >
            <MicOff className="w-4 h-4" />
          </Button>
        </div>

        {/* Audio Level Bars (when listening) */}
        {isListening && (
          <div className="flex items-center gap-1 mb-4">
            {[...Array(20)].map((_, i) => {
              const barHeight = audioLevel * 100;
              const isActive = (i / 20) * 100 < barHeight;
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-all duration-100 ${
                    isActive ? 'bg-green-500 h-6' : 'bg-neutral-300 h-2'
                  }`}
                />
              );
            })}
          </div>
        )}

        {/* Transcript Preview */}
        {transcript && state !== 'confirming' && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-3 mb-3 border-2 border-neutral-200 dark:border-neutral-700">
            <p className="text-xs font-semibold text-neutral-500 mb-1">You said:</p>
            <p className="text-sm text-neutral-900 dark:text-white italic">
              "{transcript}"
            </p>
          </div>
        )}

        {/* Confirmation Dialog */}
        {state === 'confirming' && currentCommand && (
          <div className="bg-purple-100 dark:bg-purple-900/30 rounded-xl p-4 mb-3 border-2 border-purple-300 dark:border-purple-700">
            <p className="text-sm font-semibold text-purple-900 dark:text-purple-200 mb-2">
              Did you mean:
            </p>
            <p className="text-base font-bold text-purple-700 dark:text-purple-300 mb-3">
              {currentCommand.data?.optionId ? `Option ${currentCommand.data.optionId}` : currentCommand.action}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={confirmCommand}
                size="sm"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Yes
              </Button>
              <Button
                onClick={cancelCommand}
                size="sm"
                variant="outline"
                className="flex-1"
              >
                No, repeat
              </Button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 rounded-xl p-3 border-2 border-red-300 dark:border-red-700">
            <p className="text-xs font-semibold text-red-700 dark:text-red-300 mb-1">
              ⚠️ Error
            </p>
            <p className="text-xs text-red-600 dark:text-red-400">
              {error}
            </p>
          </div>
        )}

        {/* TTS Controls (when playing) */}
        {isQuestionPlaying && (
          <div className="flex items-center gap-2 mt-3 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <Volume2 className="w-4 h-4 text-blue-600 animate-pulse" />
            <span className="text-sm text-blue-900 dark:text-blue-200 flex-1">
              Reading question...
            </span>
            <Button
              onClick={stopSpeaking}
              size="sm"
              variant="outline"
              className="rounded-full"
            >
              <VolumeX className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Quick Help */}
        {state === 'listening' && !error && (
          <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-700">
            <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
              Say:
            </p>
            <div className="flex flex-wrap gap-2">
              {['Option A', 'Option B', 'Repeat', 'Help'].map((cmd) => (
                <span
                  key={cmd}
                  className="px-2 py-1 bg-neutral-200 dark:bg-neutral-700 rounded-md text-xs font-medium text-neutral-700 dark:text-neutral-300"
                >
                  "{cmd}"
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pulsing Ring (when listening) */}
      {isListening && (
        <div className="absolute inset-0 rounded-2xl border-4 border-green-500 animate-ping opacity-30 pointer-events-none" />
      )}
    </div>
  );
}

export default VoiceAssessmentMode;
