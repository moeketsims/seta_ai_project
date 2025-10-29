'use client';

import { useMemo } from 'react';
import { Pause, Play, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { cn } from '../../lib/utils';

interface NarrationAudioButtonProps {
  text: string | null;
  label?: string;
  className?: string;
  disabled?: boolean;
  showLabel?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export function NarrationAudioButton({
  text,
  label = 'Listen',
  className,
  disabled,
  showLabel = true,
  variant = 'outline',
}: NarrationAudioButtonProps) {
  const normalizedText = useMemo(() => (text ?? '').trim(), [text]);

  const {
    isLoading,
    isPlaying,
    play,
    pause,
    stop,
    error,
  } = useTextToSpeech({
    text: normalizedText,
    autoPlay: false,
    onError: () => {
      // Silent error handling for now; hook already logs
    },
  });

  const handleClick = async () => {
    if (!normalizedText) {
      return;
    }

    if (isPlaying) {
      pause();
      return;
    }

    await play();
  };

  return (
    <Button
      type="button"
      size="sm"
      variant={variant}
      className={cn(
        'gap-2',
        variant === 'outline'
          ? 'border-[var(--ufs-maroon)] text-[var(--ufs-maroon)] hover:bg-[var(--ufs-maroon)] hover:text-white'
          : '',
        className
      )}
      onClick={handleClick}
      disabled={!normalizedText || disabled || !!error}
      title={label}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isPlaying ? (
        <Pause className="h-4 w-4" />
      ) : (
        <Play className="h-4 w-4" />
      )}
      {showLabel && <span className="ml-2 text-xs font-semibold">{label}</span>}
    </Button>
  );
}
