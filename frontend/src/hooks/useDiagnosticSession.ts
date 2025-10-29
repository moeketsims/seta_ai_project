/**
 * React hook for managing diagnostic assessment sessions.
 *
 * Handles:
 * - Session initialization and state management
 * - Adaptive question navigation
 * - Response submission and validation
 * - Event logging and error handling
 * - Progress tracking
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  type DiagnosticSessionState,
  type DiagnosticItem,
  type DiagnosticProbe,
  type DiagnosticResult,
  type NextNodeResponse,
  startDiagnosticSession,
  nextDiagnosticNode,
  getDiagnosticResult,
  formatDiagnosticNode,
} from '../lib/diagnostic-api';

// ============================================================================
// Types
// ============================================================================

export interface DiagnosticSessionConfig {
  learnerId: string;
  formId: string;
  enabled?: boolean;  // NEW: Control whether the hook is active
  onComplete?: (result: DiagnosticResult) => void;
  onError?: (error: Error) => void;
  autoStart?: boolean;
}

export interface FormattedQuestion {
  stem: string;
  context?: string;
  visualAidUrl?: string;
  options: Array<{
    id: string;
    text: string;
    correct: boolean;
  }>;
  estimatedTimeSeconds: number;
}

export interface DiagnosticSessionHookReturn {
  // Session state
  sessionId: string | null;
  isActive: boolean;
  isLoading: boolean;
  error: Error | null;

  // Current question
  currentQuestion: FormattedQuestion | null;
  currentNodeId: string | null;

  // Progress
  visitedNodes: string[];
  suspectedMisconceptions: Record<string, number>;
  totalTimeSeconds: number;
  questionsAnswered: number;

  // Actions
  startSession: () => Promise<void>;
  submitAnswer: (optionId: string) => Promise<void>;
  getResult: () => Promise<DiagnosticResult | null>;

  // Diagnostic result
  result: DiagnosticResult | null;
  isComplete: boolean;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useDiagnosticSession(
  config: DiagnosticSessionConfig
): DiagnosticSessionHookReturn {
  // State
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [currentQuestion, setCurrentQuestion] = useState<FormattedQuestion | null>(null);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);

  const [visitedNodes, setVisitedNodes] = useState<string[]>([]);
  const [suspectedMisconceptions, setSuspectedMisconceptions] = useState<Record<string, number>>({});
  const [totalTimeSeconds, setTotalTimeSeconds] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // Timing
  const questionStartTimeRef = useRef<number>(Date.now());
  const sessionStartTimeRef = useRef<number>(0);

  // Event logging
  const logEvent = useCallback((eventType: string, data?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Diagnostic Event] ${eventType}`, {
        sessionId,
        timestamp: new Date().toISOString(),
        ...data,
      });
    }
    // TODO: Send to analytics endpoint
  }, [sessionId]);

  // Start session
  const startSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      logEvent('session_start_attempt', {
        learnerId: config.learnerId,
        formId: config.formId,
      });

      const sessionState: any = await startDiagnosticSession(
        config.learnerId,
        config.formId
      );

      setSessionId(sessionState.session_id);
      setCurrentNodeId(sessionState.current_node_id);
      setVisitedNodes(sessionState.visited_nodes);
      setSuspectedMisconceptions(sessionState.suspected_misconceptions);
      setIsActive(true);
      sessionStartTimeRef.current = Date.now();
      questionStartTimeRef.current = Date.now();

      // Format and set first question (backend now includes current_node in response)
      if (sessionState.current_node) {
        const formatted = formatDiagnosticNode(sessionState.current_node);
        setCurrentQuestion(formatted);
      }

      logEvent('session_started', {
        sessionId: sessionState.session_id,
        firstNodeId: sessionState.current_node_id,
        hasQuestion: !!sessionState.current_node,
      });

      setIsLoading(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to start session');
      setError(error);
      setIsLoading(false);
      logEvent('session_start_error', { error: error.message });
      config.onError?.(error);
    }
  }, [config, logEvent]);

  // Submit answer and get next question
  const submitAnswer = useCallback(async (optionId: string) => {
    if (!sessionId || !currentNodeId) {
      throw new Error('No active session');
    }

    try {
      setIsLoading(true);
      setError(null);

      // Calculate time spent on this question
      const timeSpent = Math.round((Date.now() - questionStartTimeRef.current) / 1000);

      logEvent('response_submit', {
        nodeId: currentNodeId,
        optionId,
        timeSpent,
      });

      const response: NextNodeResponse = await nextDiagnosticNode({
        session_id: sessionId,
        response: optionId,
        time_spent_seconds: timeSpent,
      });

      // Update progress state
      setVisitedNodes(response.progress?.nodes_visited as any || []);
      setSuspectedMisconceptions(response.session_id as any || {});
      setQuestionsAnswered(prev => prev + 1);
      setTotalTimeSeconds(prev => prev + timeSpent);

      if (response.terminal && response.result) {
        // Session complete
        setResult(response.result);
        setIsComplete(true);
        setIsActive(false);
        setCurrentQuestion(null);

        logEvent('session_complete', {
          totalTime: Math.round((Date.now() - sessionStartTimeRef.current) / 1000),
          questionsAnswered: questionsAnswered + 1,
          misconceptionsDetected: Object.keys(response.result.all_misconceptions || {}).length,
        });

        config.onComplete?.(response.result);
      } else if (response.next_node) {
        // Move to next question
        const formatted = formatDiagnosticNode(response.next_node);
        setCurrentQuestion(formatted);
        setCurrentNodeId((response.next_node as any).item_id || (response.next_node as any).probe_id);
        questionStartTimeRef.current = Date.now();

        logEvent('next_question', {
          nodeId: currentNodeId,
          progress: response.progress,
        });
      }

      setIsLoading(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to submit answer');
      setError(error);
      setIsLoading(false);
      logEvent('submit_error', { error: error.message });
      config.onError?.(error);
    }
  }, [sessionId, currentNodeId, questionsAnswered, config, logEvent]);

  // Get final result
  const getResult = useCallback(async (): Promise<DiagnosticResult | null> => {
    if (!sessionId) {
      return null;
    }

    try {
      const diagnosticResult = await getDiagnosticResult(sessionId);
      setResult(diagnosticResult);
      return diagnosticResult;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get result');
      setError(error);
      config.onError?.(error);
      return null;
    }
  }, [sessionId, config]);

  // Auto-start if configured and enabled
  useEffect(() => {
    if (config.enabled !== false && config.autoStart && !sessionId && !isLoading) {
      startSession();
    }
  }, [config.enabled, config.autoStart, sessionId, isLoading, startSession]);

  return {
    // Session state
    sessionId,
    isActive,
    isLoading,
    error,

    // Current question
    currentQuestion,
    currentNodeId,

    // Progress
    visitedNodes,
    suspectedMisconceptions,
    totalTimeSeconds,
    questionsAnswered,

    // Actions
    startSession,
    submitAnswer,
    getResult,

    // Result
    result,
    isComplete,
  };
}
