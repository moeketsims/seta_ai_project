/**
 * useVoiceAssessmentMode Hook
 *
 * Orchestrates fully hands-free voice-driven assessment experience.
 *
 * Features:
 * - Continuous listening for voice commands
 * - Automatic question reading via TTS
 * - Voice command parsing and execution
 * - State machine for conversation flow
 * - Visual feedback without user interaction
 *
 * Usage:
 * ```tsx
 * const voiceMode = useVoiceAssessmentMode({
 *   currentQuestion,
 *   onAnswerSelected: (optionId) => { ... },
 *   onNavigate: (action) => { ... },
 * });
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useVoiceInput, QuestionOption } from './useVoiceInput';
import { useTextToSpeech, TTSVoice } from './useTextToSpeech';
import {
  parseVoiceCommand,
  isHighConfidenceCommand,
  needsClarification,
  type ParsedVoiceCommand,
} from '@/lib/voiceCommandParser';

// ============================================================================
// Types
// ============================================================================

export type VoiceModeState =
  | 'disabled'              // Voice mode is OFF
  | 'idle'                  // Voice mode ON, waiting for question
  | 'reading_question'      // TTS is reading the question
  | 'listening'             // Listening for user's voice command
  | 'processing'            // Processing transcription
  | 'confirming'            // Waiting for user confirmation (low confidence)
  | 'executing';            // Executing the command

export interface VoiceAssessmentOptions {
  currentQuestion?: {
    stem: string;
    context?: string;
    options: { id: string; text: string }[];
  } | null;
  onAnswerSelected?: (optionId: string) => void;
  onNavigate?: (action: 'repeat' | 'next' | 'skip') => void;
  onHelp?: () => void;
  voice?: TTSVoice;
  autoEnableOnStart?: boolean;
}

export interface VoiceAssessmentState {
  isEnabled: boolean;
  state: VoiceModeState;
  currentCommand: ParsedVoiceCommand | null;
  statusMessage: string;
  error: string | null;

  // Actions
  enable: () => void;
  disable: () => void;
  toggle: () => void;
  confirmCommand: () => void;
  cancelCommand: () => void;

  // TTS control
  isQuestionPlaying: boolean;
  stopSpeaking: () => void;

  // Voice input state
  isListening: boolean;
  audioLevel: number;
  transcript: string | null;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useVoiceAssessmentMode(
  options: VoiceAssessmentOptions
): VoiceAssessmentState {
  const {
    currentQuestion,
    onAnswerSelected,
    onNavigate,
    onHelp,
    voice = 'nova',
    autoEnableOnStart = false,
  } = options;

  // State
  const [isEnabled, setIsEnabled] = useState(autoEnableOnStart);
  const [state, setState] = useState<VoiceModeState>(autoEnableOnStart ? 'idle' : 'disabled');
  const [currentCommand, setCurrentCommand] = useState<ParsedVoiceCommand | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Refs
  const hasReadQuestion = useRef(false);
  const listeningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const questionRef = useRef(currentQuestion);

  // Update question ref
  useEffect(() => {
    questionRef.current = currentQuestion;
    if (currentQuestion && isEnabled) {
      hasReadQuestion.current = false; // Reset when new question arrives
    }
  }, [currentQuestion, isEnabled]);

  // ========================================================================
  // TTS for Question Reading
  // ========================================================================

  const questionText = currentQuestion
    ? `${currentQuestion.context ? currentQuestion.context + '. ' : ''}${currentQuestion.stem}. ${currentQuestion.options.map((opt, i) => `Option ${opt.id}: ${opt.text}`).join('. ')}`
    : '';

  const tts = useTextToSpeech({
    text: questionText,
    voice,
    autoPlay: false,
    onPlaybackComplete: () => {
      if (isEnabled && state === 'reading_question') {
        setState('listening');
        setStatusMessage('Listening for your answer...');
        startContinuousListening();
      }
    },
    onError: (err) => {
      console.error('TTS error:', err);
      setError('Failed to read question. Please try manual mode.');
    },
  });

  // ========================================================================
  // Voice Input for Continuous Listening
  // ========================================================================

  const voiceInput = useVoiceInput({
    questionOptions: currentQuestion?.options.map(opt => ({
      option_id: opt.id,
      value: opt.text,
    })) || [],
    questionStem: currentQuestion?.stem || '',
    onTranscriptionComplete: handleTranscription,
    onError: (err) => {
      console.error('Voice input error:', err);
      setError(err);
      setState('listening'); // Return to listening
      scheduleNextListening();
    },
  });

  // ========================================================================
  // Continuous Listening Loop
  // ========================================================================

  const startContinuousListening = useCallback(() => {
    if (!isEnabled || state === 'disabled') return;

    // Start recording
    voiceInput.startRecording();

    // Auto-stop after 5 seconds (allow time for full answers)
    listeningTimeoutRef.current = setTimeout(() => {
      voiceInput.stopRecording();
    }, 5000);
  }, [isEnabled, state, voiceInput]);

  const scheduleNextListening = useCallback(() => {
    if (!isEnabled) return;

    // Wait 1 second before starting next listening cycle
    setTimeout(() => {
      if (isEnabled && (state === 'listening' || state === 'idle')) {
        startContinuousListening();
      }
    }, 1000);
  }, [isEnabled, state, startContinuousListening]);

  // ========================================================================
  // Transcription Handler
  // ========================================================================

  function handleTranscription(transcript: string) {
    if (!isEnabled || !currentQuestion) return;

    setState('processing');
    setStatusMessage('Processing your command...');

    // Parse voice command
    const command = parseVoiceCommand(transcript);
    console.log('📢 Parsed command:', command);

    // Handle based on command type and confidence
    if (isHighConfidenceCommand(command)) {
      // High confidence - execute immediately
      setCurrentCommand(command);
      executeCommand(command);
    } else if (needsClarification(command)) {
      // Medium confidence - ask for confirmation
      setCurrentCommand(command);
      setState('confirming');
      setStatusMessage(`Did you say "${getCommandDescription(command)}"? Say "yes" to confirm or repeat your answer.`);

      // Auto-cancel after 5 seconds if no confirmation
      setTimeout(() => {
        if (state === 'confirming') {
          cancelCommand();
        }
      }, 5000);
    } else {
      // Low confidence - ask user to repeat
      setError('I didn\'t understand that. Please try again.');
      setStatusMessage('Say "Option A", "Option B", etc., or say "Help" for more commands.');
      setState('listening');
      scheduleNextListening();
    }
  }

  // ========================================================================
  // Command Execution
  // ========================================================================

  function executeCommand(command: ParsedVoiceCommand) {
    setState('executing');

    switch (command.type) {
      case 'answer_selection':
        if (command.data?.optionId) {
          setStatusMessage(`Selecting Option ${command.data.optionId}...`);
          setTimeout(() => {
            onAnswerSelected?.(command.data.optionId);
            setState('idle');
            setCurrentCommand(null);
            hasReadQuestion.current = false; // Allow next question to be read
          }, 500);
        }
        break;

      case 'navigation':
        if (command.action === 'repeat_question') {
          setStatusMessage('Repeating question...');
          setState('reading_question');
          tts.stop();
          setTimeout(() => tts.play(), 500);
        } else if (command.action === 'next_question' || command.action === 'skip_question') {
          onNavigate?.(command.action === 'skip_question' ? 'skip' : 'next');
          setState('idle');
          setCurrentCommand(null);
          hasReadQuestion.current = false;
        }
        break;

      case 'control':
        if (command.action === 'help') {
          onHelp?.();
          setState('listening');
          scheduleNextListening();
        } else if (command.action === 'disable_voice_mode') {
          disable();
        }
        break;

      default:
        setError('Unknown command');
        setState('listening');
        scheduleNextListening();
    }
  }

  function getCommandDescription(command: ParsedVoiceCommand): string {
    if (command.type === 'answer_selection' && command.data?.optionId) {
      return `Option ${command.data.optionId}`;
    }
    if (command.type === 'navigation') {
      return command.action.replace('_', ' ');
    }
    return command.action;
  }

  // ========================================================================
  // Enable/Disable Voice Mode
  // ========================================================================

  const enable = useCallback(() => {
    setIsEnabled(true);
    setState('idle');
    setStatusMessage('Voice mode enabled. Preparing to read question...');
    setError(null);
    hasReadQuestion.current = false;
  }, []);

  const disable = useCallback(() => {
    setIsEnabled(false);
    setState('disabled');
    setStatusMessage('');
    setError(null);
    tts.stop();
    voiceInput.stopRecording();
    if (listeningTimeoutRef.current) {
      clearTimeout(listeningTimeoutRef.current);
    }
  }, [tts, voiceInput]);

  const toggle = useCallback(() => {
    if (isEnabled) {
      disable();
    } else {
      enable();
    }
  }, [isEnabled, enable, disable]);

  // ========================================================================
  // Auto-Read Question When It Changes
  // ========================================================================

  useEffect(() => {
    if (
      isEnabled &&
      currentQuestion &&
      !hasReadQuestion.current &&
      state !== 'reading_question' &&
      !tts.isPlaying
    ) {
      // New question arrived - read it
      hasReadQuestion.current = true;
      setState('reading_question');
      setStatusMessage('Reading question...');

      setTimeout(() => {
        tts.play();
      }, 500); // Small delay for smooth transition
    }
  }, [isEnabled, currentQuestion, state, tts]);

  // ========================================================================
  // Cleanup
  // ========================================================================

  useEffect(() => {
    return () => {
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current);
      }
      tts.stop();
      voiceInput.stopRecording();
    };
  }, []);

  // ========================================================================
  // Return State
  // ========================================================================

  return {
    isEnabled,
    state,
    currentCommand,
    statusMessage,
    error,

    enable,
    disable,
    toggle,
    confirmCommand: () => {
      if (currentCommand) {
        executeCommand(currentCommand);
      }
    },
    cancelCommand: () => {
      setCurrentCommand(null);
      setState('listening');
      scheduleNextListening();
    },

    isQuestionPlaying: tts.isPlaying,
    stopSpeaking: tts.stop,

    isListening: voiceInput.isRecording,
    audioLevel: voiceInput.audioLevel,
    transcript: voiceInput.transcript,
  };
}
