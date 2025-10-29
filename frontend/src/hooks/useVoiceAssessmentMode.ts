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
import { useVoiceInput } from './useVoiceInput';
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
  const stateRef = useRef(state);
  const isEnabledRef = useRef(isEnabled);
  const voiceInputRef = useRef<any>(null);
  const isPlayingTTSRef = useRef(false); // Guard against concurrent TTS calls

  // Update refs
  useEffect(() => {
    stateRef.current = state;
    isEnabledRef.current = isEnabled;
  }, [state, isEnabled]);

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
    ? `${currentQuestion.context ? currentQuestion.context + '. ' : ''}${currentQuestion.stem}. ${currentQuestion.options.map((opt) => `Option ${opt.id}: ${opt.text}`).join('. ')}`
    : '';

  // Audio element ref for TTS playback
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);

  // ========================================================================
  // Continuous Listening Loop (defined before playQuestionTTS to avoid reference errors)
  // ========================================================================

  const startContinuousListening = useCallback(() => {
    console.log('🎤 startContinuousListening called');
    console.log('📊 isEnabled:', isEnabledRef.current, 'state:', stateRef.current);

    if (!isEnabledRef.current || stateRef.current === 'disabled') {
      console.warn('⚠️ Skipping recording - voice mode disabled or wrong state');
      return;
    }

    console.log('✅ Starting voice recording...');
    // Start recording using ref
    if (voiceInputRef.current) {
      voiceInputRef.current.startRecording();

      // Auto-stop after 5 seconds (allow time for full answers)
      listeningTimeoutRef.current = setTimeout(() => {
        console.log('⏱️ Auto-stopping recording after 5 seconds');
        if (voiceInputRef.current) {
          voiceInputRef.current.stopRecording();
        }
      }, 5000);
    }
  }, []);

  const scheduleNextListening = useCallback(() => {
    if (!isEnabledRef.current) return;

    // Wait 1 second before starting next listening cycle
    setTimeout(() => {
      const currentState = stateRef.current;
      if (isEnabledRef.current && (currentState === 'listening' || currentState === 'idle')) {
        startContinuousListening();
      }
    }, 1000);
  }, [startContinuousListening]);

  // ========================================================================
  // TTS for Question Reading
  // ========================================================================

  const playQuestionTTS = useCallback(async () => {
    if (!questionText || !isEnabledRef.current) return;

    // Guard against concurrent TTS calls
    if (isPlayingTTSRef.current) {
      console.warn('⚠️ TTS already playing, skipping duplicate call');
      return;
    }

    console.log('🔊 Starting TTS playback');
    isPlayingTTSRef.current = true;

    // CRITICAL: Stop any active recording before TTS to prevent audio feedback
    if (voiceInputRef.current) {
      console.log('🛑 Stopping active recording before TTS');
      voiceInputRef.current.stopRecording();
    }

    // Clear any pending listening timeouts
    if (listeningTimeoutRef.current) {
      clearTimeout(listeningTimeoutRef.current);
      listeningTimeoutRef.current = null;
    }

    setState('reading_question');
    setStatusMessage('Reading question...');
    setError(null); // Clear any previous errors

    try {
      // Fetch TTS audio from backend
      const response = await fetch('http://localhost:8000/api/v1/audio/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: questionText,
          voice,
          speed: 1.0,
        }),
      });

      if (!response.ok) {
        throw new Error('TTS synthesis failed');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create and play audio
      const audio = new Audio(audioUrl);
      ttsAudioRef.current = audio;

      audio.onended = () => {
        console.log('🎵 TTS Playback complete');
        URL.revokeObjectURL(audioUrl);
        isPlayingTTSRef.current = false;

        // Transition to listening with 1-second delay to let audio settle
        if (isEnabledRef.current) {
          console.log('✅ Transitioning to listening mode (1s delay)');
          setState('listening');
          setStatusMessage('Listening for your answer...');

          setTimeout(() => {
            startContinuousListening();
          }, 1000); // Increased from 500ms to 1000ms
        }
      };

      audio.onerror = (e) => {
        console.error('❌ TTS playback error:', e);
        setError('Failed to play question audio');
        setState('idle');
        isPlayingTTSRef.current = false;
      };

      try {
        await audio.play();
        console.log('▶️ TTS audio playing...');
      } catch (playErr: any) {
        console.error('❌ Audio play() failed:', playErr.message);
        setError(`Audio playback blocked: ${playErr.message}. Please check browser permissions.`);
        setState('idle');
        isPlayingTTSRef.current = false;
        URL.revokeObjectURL(audioUrl);
      }

    } catch (err: any) {
      console.error('TTS error:', err);
      setError(`Failed to read question: ${err.message}. Please try manual mode.`);
      setState('idle');
      isPlayingTTSRef.current = false;
    }
  }, [questionText, voice]); // Don't include startContinuousListening to avoid circular dependency

  // ========================================================================
  // Helper Functions (defined early to avoid reference errors)
  // ========================================================================

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
  // Confirmation Handlers (defined early)
  // ========================================================================

  const cancelCommand = useCallback(() => {
    setCurrentCommand(null);
    setState('listening');
    scheduleNextListening();
  }, [scheduleNextListening]);

  // ========================================================================
  // Command Execution (defined before handleTranscription)
  // ========================================================================

  const executeCommand = useCallback((command: ParsedVoiceCommand) => {
    console.log('⚡ Executing command:', command);
    setState('executing');

    // Stop any ongoing recording
    if (listeningTimeoutRef.current) {
      clearTimeout(listeningTimeoutRef.current);
    }
    if (voiceInputRef.current) {
      voiceInputRef.current.stopRecording();
    }

    switch (command.type) {
      case 'answer_selection':
        if (command.data?.optionId) {
          setStatusMessage(`Selecting Option ${command.data.optionId}...`);
          setTimeout(() => {
            console.log('✅ Submitting answer:', command.data.optionId);
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
          // Stop current TTS if playing
          if (ttsAudioRef.current) {
            ttsAudioRef.current.pause();
            ttsAudioRef.current = null;
          }
          hasReadQuestion.current = false;
          setTimeout(() => playQuestionTTS(), 500);
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
          // Will be defined later
          setIsEnabled(false);
          setState('disabled');
        }
        break;

      default:
        setError('Unknown command');
        setState('listening');
        scheduleNextListening();
    }
  }, [onAnswerSelected, onNavigate, onHelp, playQuestionTTS, scheduleNextListening]);

  // ========================================================================
  // Transcription Handler (defined before useVoiceInput to avoid reference errors)
  // ========================================================================

  const handleTranscription = useCallback((transcript: string) => {
    console.log('🎙️ handleTranscription called with:', transcript);

    if (!isEnabledRef.current || !currentQuestion) {
      console.warn('⚠️ Ignoring transcription - voice mode disabled or no question');
      return;
    }

    // Blocklist of common false transcriptions (TTS audio feedback)
    const blocklist = ['you', 'thank you', 'thanks', 'thank'];
    const normalizedTranscript = transcript.trim().toLowerCase();

    // Ignore very short transcriptions (increased from 2 to 5 characters)
    if (!transcript || transcript.trim().length < 5) {
      console.warn('⚠️ Ignoring very short transcription (<5 chars)');
      setState('listening');
      // Wait 3 seconds before trying again (longer delay to avoid tight loop)
      setTimeout(() => {
        if (isEnabledRef.current && stateRef.current === 'listening') {
          startContinuousListening();
        }
      }, 3000);
      return;
    }

    // Ignore blocklisted phrases (likely TTS audio feedback)
    if (blocklist.includes(normalizedTranscript)) {
      console.warn('⚠️ Ignoring blocklisted phrase:', transcript);
      setState('listening');
      // Wait 3 seconds before trying again (longer delay to let audio clear)
      setTimeout(() => {
        if (isEnabledRef.current && stateRef.current === 'listening') {
          startContinuousListening();
        }
      }, 3000);
      return;
    }

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
        if (stateRef.current === 'confirming') {
          cancelCommand();
        }
      }, 5000);
    } else {
      // Low confidence - ask user to repeat with longer delay
      setError(`I heard "${transcript}" but didn't understand. Please say "Option A", "Option B", etc.`);
      setStatusMessage('Waiting for your answer...');
      setState('listening');
      // Wait 5 seconds before trying again (much longer to give user time)
      setTimeout(() => {
        if (isEnabledRef.current && stateRef.current === 'listening') {
          startContinuousListening();
        }
      }, 5000);
    }
  }, [startContinuousListening, currentQuestion, executeCommand, cancelCommand]);

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

  // Store voiceInput in ref for access in callbacks
  voiceInputRef.current = voiceInput;

  // ========================================================================
  // Enable/Disable Voice Mode
  // ========================================================================

  const enable = useCallback(() => {
    setIsEnabled(true);
    setState('idle');
    setStatusMessage('Voice mode enabled. Preparing to read question...');
    setError(null);
    hasReadQuestion.current = false;
    // Note: useEffect will trigger TTS when question is detected
  }, []);

  const disable = useCallback(() => {
    setIsEnabled(false);
    setState('disabled');
    setStatusMessage('');
    setError(null);

    // Stop TTS
    if (ttsAudioRef.current) {
      ttsAudioRef.current.pause();
      ttsAudioRef.current = null;
    }

    // Stop voice recording
    voiceInput.stopRecording();

    // Clear timeouts
    if (listeningTimeoutRef.current) {
      clearTimeout(listeningTimeoutRef.current);
    }
  }, [voiceInput]);

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
      state !== 'reading_question'
    ) {
      // New question arrived - read it
      hasReadQuestion.current = true;

      setTimeout(() => {
        playQuestionTTS();
      }, 500); // Small delay for smooth transition
    }
  }, [isEnabled, currentQuestion, state, playQuestionTTS]);

  // ========================================================================
  // Cleanup
  // ========================================================================

  useEffect(() => {
    return () => {
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current);
      }
      if (ttsAudioRef.current) {
        ttsAudioRef.current.pause();
        ttsAudioRef.current = null;
      }
      voiceInput.stopRecording();
    };
  }, [voiceInput]);

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
    cancelCommand,

    isQuestionPlaying: state === 'reading_question',
    stopSpeaking: () => {
      if (ttsAudioRef.current) {
        ttsAudioRef.current.pause();
        ttsAudioRef.current = null;
      }
    },

    isListening: voiceInput.isRecording,
    audioLevel: voiceInput.audioLevel,
    transcript: voiceInput.transcript,
  };
}
