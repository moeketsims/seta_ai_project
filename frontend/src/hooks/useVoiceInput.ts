/**
 * useVoiceInput Hook
 *
 * Custom React hook for voice input using browser MediaRecorder API
 * and OpenAI Whisper transcription backend.
 *
 * Features:
 * - Start/stop audio recording
 * - Upload audio to backend for transcription
 * - Smart answer matching to question options
 * - Loading states and error handling
 *
 * Usage:
 * ```tsx
 * const { startRecording, stopRecording, isRecording, transcript, matchedOption, error } = useVoiceInput({
 *   questionOptions: [{ option_id: 'A', value: '20' }, ...]
 * });
 * ```
 */

import { useState, useRef, useCallback } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface QuestionOption {
  option_id: string;
  value: string;
}

export interface VoiceInputOptions {
  questionOptions?: QuestionOption[];
  questionStem?: string;
  language?: string;
  onTranscriptionComplete?: (transcript: string, matchedOption?: MatchedOption) => void;
  onError?: (error: string) => void;
}

export interface MatchedOption {
  matched_option_id: string | null;
  matched_value: string | null;
  confidence: number;
  method: string;
  suggestions?: string[];
  // AI-powered extraction fields
  student_reasoning?: string | null;
  uncertainty_markers?: string[];
  changed_mind?: boolean;
  extraction_method?: string;
}

export interface TranscriptionResponse {
  success: boolean;
  transcription: string;
  language: string;
  duration: number;
  // Flat structure matching backend EnhancedTranscriptionResponse
  matched_option_id?: string | null;
  matched_value?: string | null;
  confidence?: number;
  extraction_method?: string;
  student_reasoning?: string | null;
  uncertainty_markers?: string[];
  changed_mind?: boolean;
  error?: string;
}

export interface VoiceInputState {
  isRecording: boolean;
  isProcessing: boolean;
  transcript: string | null;
  matchedOption: MatchedOption | null;
  error: string | null;
  audioLevel: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  reset: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useVoiceInput(options: VoiceInputOptions = {}): VoiceInputState {
  const {
    questionOptions = [],
    questionStem = '',
    language = 'en',
    onTranscriptionComplete,
    onError,
  } = options;

  // State
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [matchedOption, setMatchedOption] = useState<MatchedOption | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // ========================================================================
  // Audio Level Monitoring (Visual Feedback)
  // ========================================================================

  const startAudioLevelMonitoring = useCallback((stream: MediaStream) => {
    try {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 256;
      microphone.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateAudioLevel = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        const normalized = Math.min(average / 128, 1); // Normalize to 0-1

        setAudioLevel(normalized);
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };

      updateAudioLevel();
    } catch (err) {
      console.error('Audio level monitoring failed:', err);
    }
  }, []);

  const stopAudioLevelMonitoring = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    setAudioLevel(0);
  }, []);

  // ========================================================================
  // Recording Control
  // ========================================================================

  const startRecording = useCallback(async () => {
    try {
      // Reset previous state
      setError(null);
      setTranscript(null);
      setMatchedOption(null);
      audioChunksRef.current = [];

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000, // Whisper optimized sample rate
        },
      });

      // Start audio level monitoring
      startAudioLevelMonitoring(stream);

      // Determine best supported audio format
      let mimeType = 'audio/webm;codecs=opus'; // Default for Chrome/Firefox
      let fileExtension = 'webm';

      // Check browser support and use fallback formats
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        // Try webm without codec
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
          fileExtension = 'webm';
        }
        // Safari fallback - mp4 with AAC
        else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
          fileExtension = 'mp4';
        }
        // Older Safari - m4a
        else if (MediaRecorder.isTypeSupported('audio/mp4;codecs=mp4a')) {
          mimeType = 'audio/mp4;codecs=mp4a';
          fileExtension = 'm4a';
        }
        // Last resort - let browser decide
        else {
          mimeType = '';
          fileExtension = 'webm';
        }
      }

      console.log(`🎤 Using audio format: ${mimeType || 'browser default'}`);

      // Create MediaRecorder with supported format
      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop monitoring
        stopAudioLevelMonitoring();

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());

        // Process recorded audio with correct file extension
        await processRecording(fileExtension);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);

      console.log(`🎤 Recording started with format: ${mimeType}`);
    } catch (err: any) {
      const errorMessage = err.name === 'NotAllowedError'
        ? 'Microphone access denied. Please allow microphone permissions.'
        : `Failed to start recording: ${err.message}`;

      setError(errorMessage);
      onError?.(errorMessage);
      console.error('Recording error:', err);
    }
  }, [startAudioLevelMonitoring, stopAudioLevelMonitoring, onError]);

  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log('🛑 Recording stopped');
    }
  }, [isRecording]);

  // ========================================================================
  // Audio Processing & Transcription
  // ========================================================================

  const processRecording = useCallback(async (fileExtension: string = 'webm') => {
    if (audioChunksRef.current.length === 0) {
      setError('No audio recorded');
      return;
    }

    setIsProcessing(true);

    try {
      // Determine MIME type based on extension
      const mimeTypeMap: Record<string, string> = {
        'webm': 'audio/webm',
        'mp4': 'audio/mp4',
        'm4a': 'audio/mp4',
        'wav': 'audio/wav',
      };
      const mimeType = mimeTypeMap[fileExtension] || 'audio/webm';

      // Create audio blob with correct MIME type
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
      console.log(`📦 Audio blob created: ${audioBlob.size} bytes (${mimeType})`);

      // Create FormData for upload
      const formData = new FormData();
      formData.append('audio_file', audioBlob, `recording.${fileExtension}`);
      formData.append('language', language);

      // Include question options for smart matching
      if (questionOptions.length > 0) {
        const optionsStr = JSON.stringify(questionOptions);
        console.log('📤 Sending match_options:', optionsStr);
        formData.append('match_options', optionsStr);
      }

      // Include question stem for AI-powered extraction
      if (questionStem && questionStem.trim()) {
        console.log('📤 Sending question_stem:', questionStem.trim());
        formData.append('question_stem', questionStem.trim());
      }

      // Upload to backend for transcription
      const response = await fetch('http://localhost:8000/api/v1/audio/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`);
      }

      const result: TranscriptionResponse = await response.json();
      console.log('📥 Full backend response:', JSON.stringify(result, null, 2));

      if (!result.success) {
        throw new Error(result.error || 'Transcription failed');
      }

      console.log('✅ Transcription:', result.transcription);

      // Construct MatchedOption from flat API response fields
      let matchedOptionObj: MatchedOption | null = null;
      if (result.matched_option_id) {
        matchedOptionObj = {
          matched_option_id: result.matched_option_id,
          matched_value: result.matched_value || null,
          confidence: result.confidence || 0,
          method: result.extraction_method || 'unknown',
          student_reasoning: result.student_reasoning || null,
          uncertainty_markers: result.uncertainty_markers || [],
          changed_mind: result.changed_mind || false,
          extraction_method: result.extraction_method || 'unknown'
        };
      }

      console.log('🎯 Matched option:', matchedOptionObj);

      setTranscript(result.transcription);
      setMatchedOption(matchedOptionObj);

      // Callback
      onTranscriptionComplete?.(result.transcription, matchedOptionObj);

    } catch (err: any) {
      const errorMessage = `Transcription error: ${err.message}`;
      setError(errorMessage);
      onError?.(errorMessage);
      console.error('Transcription error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [language, questionOptions, onTranscriptionComplete, onError]);

  // ========================================================================
  // Reset
  // ========================================================================

  const reset = useCallback(() => {
    setTranscript(null);
    setMatchedOption(null);
    setError(null);
    setAudioLevel(0);
    audioChunksRef.current = [];
  }, []);

  // ========================================================================
  // Return State
  // ========================================================================

  return {
    isRecording,
    isProcessing,
    transcript,
    matchedOption,
    error,
    audioLevel,
    startRecording,
    stopRecording,
    reset,
  };
}
