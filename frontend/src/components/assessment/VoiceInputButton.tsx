/**
 * VoiceInputButton Component
 *
 * Microphone button with visual feedback for voice input.
 *
 * Features:
 * - Click to record, click again to stop
 * - Visual feedback: pulsing animation during recording
 * - Audio level indicator
 * - Loading state during transcription
 * - Error handling
 *
 * Usage:
 * ```tsx
 * <VoiceInputButton
 *   questionOptions={[{ option_id: 'A', value: '20' }, ...]}
 *   onTranscriptionComplete={(transcript, matchedOption) => {
 *     console.log('Transcript:', transcript);
 *     console.log('Matched:', matchedOption);
 *   }}
 * />
 * ```
 */

'use client';

import React, { useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useVoiceInput, QuestionOption, MatchedOption } from '@/hooks/useVoiceInput';
import { Button } from '@/components/ui/button';

// ============================================================================
// Types
// ============================================================================

interface VoiceInputButtonProps {
  questionOptions: QuestionOption[];
  questionStem?: string;
  onTranscriptionComplete?: (transcript: string, matchedOption?: MatchedOption) => void;
  onError?: (error: string) => void;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'secondary';
}

// ============================================================================
// Component
// ============================================================================

export function VoiceInputButton({
  questionOptions,
  questionStem = '',
  onTranscriptionComplete,
  onError,
  className = '',
  size = 'default',
  variant = 'default',
}: VoiceInputButtonProps) {
  const {
    isRecording,
    isProcessing,
    transcript,
    matchedOption,
    error,
    audioLevel,
    startRecording,
    stopRecording,
    reset,
  } = useVoiceInput({
    questionOptions,
    questionStem,
    onTranscriptionComplete,
    onError,
  });

  // ========================================================================
  // Effects
  // ========================================================================

  // Reset voice state when question changes (after answer submission)
  useEffect(() => {
    reset();
  }, [questionStem, reset]); // Reset when question stem changes

  // ========================================================================
  // Handlers
  // ========================================================================

  const handleClick = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      reset();
      await startRecording();
    }
  };

  // ========================================================================
  // Visual States
  // ========================================================================

  const isActive = isRecording || isProcessing;
  const buttonText = isProcessing
    ? 'Processing...'
    : isRecording
    ? 'Stop Recording'
    : 'Voice Answer';

  const buttonIcon = isProcessing ? (
    <Loader2 className="w-5 h-5 animate-spin" />
  ) : isRecording ? (
    <MicOff className="w-5 h-5" />
  ) : (
    <Mic className="w-5 h-5" />
  );

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Microphone Button */}
      <div className="relative">
        {/* Pulsing Ring (During Recording) */}
        {isRecording && (
          <div className="absolute inset-0 rounded-full animate-ping bg-red-500/30" />
        )}

        {/* Audio Level Visualizer (During Recording) */}
        {isRecording && (
          <div
            className="absolute inset-0 rounded-full border-4 border-red-500 transition-all duration-100"
            style={{
              transform: `scale(${1 + audioLevel * 0.3})`,
              opacity: 0.5 + audioLevel * 0.5,
            }}
          />
        )}

        {/* Button */}
        <Button
          onClick={handleClick}
          disabled={isProcessing}
          size={size}
          variant={variant}
          className={`
            relative z-10
            ${isRecording ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-[var(--ufs-maroon)] hover:brightness-110'}
            transition-all duration-200
            ${className}
          `}
        >
          {buttonIcon}
          <span className="ml-2">{buttonText}</span>
        </Button>
      </div>

      {/* Transcript Display (After Processing) */}
      {transcript && (
        <div className="w-full p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border-2 border-neutral-200 dark:border-neutral-700">
          <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
            You said:
          </p>
          <p className="text-base text-neutral-900 dark:text-neutral-100 italic">
            "{transcript}"
          </p>

          {/* Matched Option Display with AI Features */}
          {matchedOption && matchedOption.matched_option_id && (
            <div className="mt-3 pt-3 border-t border-neutral-300 dark:border-neutral-600">
              {/* Confidence Badge */}
              {(() => {
                const confidence = matchedOption.confidence;
                const badge = confidence >= 0.8 ? '🟢' : confidence >= 0.6 ? '🟡' : '🔴';
                const textColor = confidence >= 0.8
                  ? 'text-green-700 dark:text-green-400'
                  : confidence >= 0.6
                  ? 'text-amber-700 dark:text-amber-400'
                  : 'text-red-700 dark:text-red-400';

                return (
                  <p className={`text-sm font-semibold ${textColor} mb-1`}>
                    {badge} Matched Answer: Option {matchedOption.matched_option_id}
                  </p>
                );
              })()}

              {/* Student Reasoning (if provided by AI) */}
              {matchedOption.student_reasoning && (
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">
                    💭 Your Thinking:
                  </p>
                  <p className="text-xs text-blue-900 dark:text-blue-200 italic">
                    {matchedOption.student_reasoning}
                  </p>
                </div>
              )}

              {/* Uncertainty Warning */}
              {matchedOption.uncertainty_markers && matchedOption.uncertainty_markers.length > 0 && (
                <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
                    ⚠️ You seem uncertain
                  </p>
                  <p className="text-xs text-amber-900 dark:text-amber-200">
                    You said: {matchedOption.uncertainty_markers.slice(0, 3).map(m => `"${m}"`).join(', ')}
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    Take your time! You can change your answer before submitting.
                  </p>
                </div>
              )}

              {/* Changed Mind Indicator */}
              {matchedOption.changed_mind && (
                <div className="mt-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-800">
                  <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-1">
                    🔄 You changed your mind
                  </p>
                  <p className="text-xs text-purple-900 dark:text-purple-200">
                    That's okay! We captured your final answer.
                  </p>
                </div>
              )}

              {/* Confidence & Method Info */}
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">
                Confidence: {Math.round(matchedOption.confidence * 100)}% •{' '}
                {matchedOption.extraction_method === 'ai_gpt4_mini' ? 'AI-powered' : 'Pattern matching'}
              </p>

              {/* Auto-submit indicator */}
              <div className="mt-2 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                <div className="w-3 h-3 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
                Auto-submitting answer in 2 seconds...
              </div>
            </div>
          )}

          {/* No Match Warning */}
          {matchedOption && !matchedOption.matched_option_id && (
            <div className="mt-3 pt-3 border-t border-neutral-300 dark:border-neutral-600">
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-1">
                ⚠️ Could not match answer
              </p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Please try again or click an option manually.
              </p>
              {matchedOption.suggestions && matchedOption.suggestions.length > 0 && (
                <p className="text-xs text-neutral-500 mt-1">
                  Suggestions: {matchedOption.suggestions.join(', ')}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="w-full p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-300 dark:border-red-700">
          <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">
            ❌ Error
          </p>
          <p className="text-xs text-red-600 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Recording Indicator */}
      {isRecording && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 font-medium">
          <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
          Recording... Speak your answer clearly
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-medium">
          <Loader2 className="w-4 h-4 animate-spin" />
          Transcribing your answer...
        </div>
      )}
    </div>
  );
}
