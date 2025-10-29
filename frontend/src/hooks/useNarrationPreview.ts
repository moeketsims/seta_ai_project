'use client';

import { useEffect, useRef } from 'react';
import { buildPayloadSignature, logNarrationPreview, NarrationPayload } from '../lib/narration';

interface NarrationPreviewOptions {
  disabled?: boolean;
}

export function useNarrationPreview(
  payload: NarrationPayload | null | undefined,
  options: NarrationPreviewOptions = {}
) {
  const lastSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    if (!payload || options.disabled) {
      return;
    }

    const signature = buildPayloadSignature(payload);
    if (lastSignatureRef.current === signature) {
      return;
    }

    lastSignatureRef.current = signature;
    logNarrationPreview(payload);
  }, [payload, options.disabled]);
}
