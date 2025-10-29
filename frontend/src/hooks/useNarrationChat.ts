'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { NarrationPayload } from '../lib/narration';
import { chatNarration, type NarrationChatMessage } from '../lib/api';

export interface UseNarrationChatResult {
  messages: NarrationChatMessage[];
  isSending: boolean;
  error: string | null;
  sendQuestion: (question: string) => Promise<void>;
  resetConversation: () => void;
}

export function useNarrationChat(
  payload: NarrationPayload | null,
  initialAssistantMessage: string | null
): UseNarrationChatResult {
  const [messages, setMessages] = useState<NarrationChatMessage[]>(() => {
    return initialAssistantMessage
      ? [{ role: 'assistant', content: initialAssistantMessage }]
      : [];
  });
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const payloadRef = useRef(payload);
  const messagesRef = useRef(messages);

  // Keep the latest payload reference in sync
  payloadRef.current = payload;

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const sendQuestion = useCallback(
    async (question: string) => {
      if (!payloadRef.current || !question.trim()) {
        return;
      }

      setIsSending(true);
      setError(null);

      const historySnapshot = messagesRef.current;
      const outgoing: NarrationChatMessage = {
        role: 'user',
        content: question.trim(),
      };

      setMessages((prev) => {
        const updated = [...prev, outgoing];
        messagesRef.current = updated;
        return updated;
      });

      try {
        const response = await chatNarration(payloadRef.current, outgoing.content, historySnapshot);

        setMessages((prev) => {
          const updated = [
            ...prev,
            { role: 'assistant', content: response.answer.trim() },
          ];
          messagesRef.current = updated;
          return updated;
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to get AI response';
        setError(message);
        setMessages((prev) => {
          const updated = prev.filter((msg) => msg !== outgoing);
          messagesRef.current = updated;
          return updated;
        });
      } finally {
        setIsSending(false);
      }
    },
    []
  );

  const resetConversation = useCallback(() => {
    const seed = initialAssistantMessage ? [{ role: 'assistant', content: initialAssistantMessage }] : [];
    setMessages(seed);
    messagesRef.current = seed;
    setError(null);
  }, [initialAssistantMessage]);

  return useMemo(
    () => ({ messages, isSending, error, sendQuestion, resetConversation }),
    [error, isSending, messages, resetConversation, sendQuestion]
  );
}
