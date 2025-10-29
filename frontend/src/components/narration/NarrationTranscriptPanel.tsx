'use client';

import { useState } from 'react';
import { Maximize2, Minimize2, SendHorizontal, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';
import type { NarrationPayload } from '../../lib/narration';
import type { NarrationChatMessage } from '../../lib/api';
import { NarrationAudioButton } from './NarrationAudioButton';

interface NarrationTranscriptPanelProps {
  open: boolean;
  onClose: () => void;
  payload: NarrationPayload | null;
  transcript: string | null;
  isGenerating: boolean;
  error?: string | null;
  onRetry?: () => void;
  chatMessages: NarrationChatMessage[];
  onSendQuestion: (question: string) => Promise<void>;
  isSendingQuestion: boolean;
  chatError?: string | null;
  isMaximized: boolean;
  onToggleMaximize: () => void;
}

export function NarrationTranscriptPanel({
  open,
  onClose,
  payload,
  transcript,
  isGenerating,
  error,
  onRetry,
  chatMessages,
  onSendQuestion,
  isSendingQuestion,
  chatError,
  isMaximized,
  onToggleMaximize,
}: NarrationTranscriptPanelProps) {
  const [question, setQuestion] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!question.trim()) {
      return;
    }
    await onSendQuestion(question.trim());
    setQuestion('');
  };

  return (
    <div
      className={cn(
        'fixed inset-y-0 right-0 z-50 w-full transform border-l border-neutral-200 bg-white shadow-2xl transition-transform duration-300 dark:border-neutral-800 dark:bg-neutral-950',
        isMaximized ? 'max-w-5xl md:w-[70vw]' : 'max-w-md',
        open ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              AI Explanation
            </p>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              {payload?.widgetLabel ?? 'Widget'}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleMaximize}
              aria-label={isMaximized ? 'Restore panel size' : 'Maximise panel'}
            >
              {isMaximized ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close transcript">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className={cn('flex-1 overflow-y-auto px-6 py-6 space-y-6', isMaximized ? 'md:px-10' : '')}>
          {isGenerating && (
            <div className="space-y-3">
              <div className="h-3 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            </div>
          )}

          {!isGenerating && error && (
            <Card className="border border-red-200 bg-red-50/60 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
              <p className="font-semibold">We couldn’t verify this narration.</p>
              <p className="mt-1">{error}</p>
              {onRetry && (
                <Button size="sm" variant="outline" className="mt-3" onClick={onRetry}>
                  Try again
                </Button>
              )}
            </Card>
          )}

          {!isGenerating && transcript && (
            <article className="space-y-4 text-sm leading-relaxed text-neutral-800 dark:text-neutral-200">
              {transcript.split('\n').map((paragraph, index) => (
                <p key={index}>
                  {paragraph}
                </p>
              ))}
            </article>
          )}

          {!isGenerating && !transcript && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No narration available yet.
            </p>
          )}

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Follow-up questions
            </h3>
            <div className="space-y-3">
              {chatMessages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={cn(
                    'rounded-2xl px-4 py-3 text-sm shadow-sm',
                    message.role === 'assistant'
                      ? 'bg-[var(--ufs-navy)] text-white'
                      : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="flex-1 whitespace-pre-line">{message.content}</p>
                    {message.role === 'assistant' && (
                      <NarrationAudioButton
                        text={message.content}
                        showLabel={false}
                        variant="ghost"
                        className={cn(
                          'h-8 w-8 rounded-full flex items-center justify-center',
                          'bg-[var(--ufs-maroon)] text-white hover:bg-[var(--ufs-maroon)]/90'
                        )}
                      />
                    )}
                  </div>
                </div>
              ))}
              {chatError && (
                <Card className="border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                  {chatError}
                </Card>
              )}
            </div>
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <Input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask a question about this data..."
                disabled={isSendingQuestion || !payload}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={isSendingQuestion || !payload || !question.trim()}>
                <SendHorizontal className="h-4 w-4" />
              </Button>
            </form>
            {isSendingQuestion && (
              <p className="text-xs text-neutral-400">Generating follow-up...</p>
            )}
          </div>
        </div>

        <div className="border-t border-neutral-200 px-6 py-4 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
          <p>Scripts update when dashboard data refreshes. Audit trail is logged in dev console.</p>
        </div>
      </div>
    </div>
  );
}
