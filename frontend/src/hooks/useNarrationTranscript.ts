'use client';

import { useCallback, useMemo, useState } from 'react';
import type { NarrationPayload } from '../lib/narration';
import { generateNarrationScript } from '../lib/narration';
import { generateNarration } from '../lib/api';

type TranscriptGuardrail = (payload: NarrationPayload) => { ok: boolean; message?: string };

interface UseNarrationTranscriptOptions {
  guardrail?: TranscriptGuardrail;
}

interface UseNarrationTranscriptResult {
  transcript: string | null;
  isGenerating: boolean;
  error: string | null;
  generateTranscript: (
    overridePayload?: NarrationPayload | null,
    overrideGuardrail?: TranscriptGuardrail
  ) => Promise<void>;
  reset: () => void;
}

function buildDraftTranscript(payload: NarrationPayload): string {
  const base = generateNarrationScript(payload);
  const detailLines: string[] = [];
  payload.metrics.forEach((metric) => {
    detailLines.push(
      `${metric.label}: ${metric.value}${metric.context ? ` (${metric.context})` : ''}`
    );
  });
  if (payload.recommendations?.length) {
    detailLines.push(`Next steps: ${payload.recommendations.join('; ')}`);
  }
  return [base, '', ...detailLines].join('\n');
}

export function useNarrationTranscript(
  payload: NarrationPayload | null,
  options: UseNarrationTranscriptOptions = {}
): UseNarrationTranscriptResult {
  const [transcript, setTranscript] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const guardrail = options.guardrail;

  const generateTranscript = useCallback(
    async (overridePayload?: NarrationPayload | null, overrideGuardrail?: TranscriptGuardrail) => {
      const activePayload = overridePayload ?? payload;
      if (!activePayload) {
        return;
      }

      setIsGenerating(true);
      setError(null);

      const validationGuardrail = overrideGuardrail ?? guardrail;
      const validation = validationGuardrail?.(activePayload) ?? { ok: true };
      if (!validation.ok) {
        setIsGenerating(false);
        setError(validation.message ?? 'Narration failed guardrail checks.');
        return;
      }

      try {
        const response = await generateNarration(activePayload);
        setTranscript(response.transcript.trim());
      } catch (err) {
        console.error('Narration request failed, falling back to draft transcript.', err);
        const fallbackTranscript = buildDraftTranscript(activePayload);
        setTranscript(fallbackTranscript);
        const message = err instanceof Error ? err.message : 'Unexpected error generating narration';
        setError(`Showing offline draft: ${message}`);
      } finally {
        setIsGenerating(false);
      }
    },
    [guardrail, payload]
  );

  const reset = useCallback(() => {
    setTranscript(null);
    setError(null);
  }, []);

  return useMemo(
    () => ({ transcript, isGenerating, error, generateTranscript, reset }),
    [error, generateTranscript, isGenerating, reset, transcript]
  );
}
