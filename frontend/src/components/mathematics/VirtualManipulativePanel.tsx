'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export type ManipulativeType = 'base-ten' | 'fraction-tiles' | 'counters' | 'algebra-tiles';

export interface VirtualManipulativePanelProps {
  type: ManipulativeType;
  prompt?: string;
  initialCount?: number;
  maxCount?: number;
  onInteraction?: (action: string, data: any) => void;
}

/**
 * VirtualManipulativePanel provides interactive mathematical manipulatives
 * for hands-on learning experiences.
 */
export function VirtualManipulativePanel({
  type,
  prompt,
  initialCount = 0,
  maxCount = 20,
  onInteraction,
}: VirtualManipulativePanelProps) {
  const [count, setCount] = useState(initialCount);

  const handleAdd = () => {
    if (count < maxCount) {
      const newCount = count + 1;
      setCount(newCount);
      onInteraction?.('add', { count: newCount });
    }
  };

  const handleRemove = () => {
    if (count > 0) {
      const newCount = count - 1;
      setCount(newCount);
      onInteraction?.('remove', { count: newCount });
    }
  };

  const handleReset = () => {
    setCount(0);
    onInteraction?.('reset', { count: 0 });
  };

  const renderManipulative = () => {
    switch (type) {
      case 'counters':
        return (
          <div className="grid grid-cols-5 gap-2 p-4">
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className="w-12 h-12 rounded-full bg-primary border-2 border-primary-dark"
                role="img"
                aria-label={`Counter ${i + 1}`}
              />
            ))}
          </div>
        );

      case 'base-ten':
        const tens = Math.floor(count / 10);
        const ones = count % 10;
        return (
          <div className="flex gap-4 p-4 flex-wrap">
            {/* Tens */}
            <div className="flex gap-2">
              {Array.from({ length: tens }).map((_, i) => (
                <div
                  key={`ten-${i}`}
                  className="w-16 h-32 bg-secondary border-2 border-secondary-dark grid grid-rows-10 gap-0.5 p-1"
                  role="img"
                  aria-label={`Ten block ${i + 1}`}
                >
                  {Array.from({ length: 10 }).map((_, j) => (
                    <div key={j} className="bg-white/30 rounded-sm" />
                  ))}
                </div>
              ))}
            </div>
            {/* Ones */}
            <div className="flex gap-2">
              {Array.from({ length: ones }).map((_, i) => (
                <div
                  key={`one-${i}`}
                  className="w-8 h-8 bg-primary border-2 border-primary-dark"
                  role="img"
                  aria-label={`Unit block ${i + 1}`}
                />
              ))}
            </div>
          </div>
        );

      case 'fraction-tiles':
        return (
          <div className="space-y-2 p-4">
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className="h-12 bg-gradient-to-r from-primary to-primary-dark rounded border-2 border-gray-400"
                role="img"
                aria-label={`Fraction tile ${i + 1}`}
              >
                <div className="h-full flex items-center justify-center text-white font-semibold">
                  1/{count || 1}
                </div>
              </div>
            ))}
          </div>
        );

      case 'algebra-tiles':
        return (
          <div className="flex gap-2 p-4 flex-wrap">
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className="w-20 h-20 bg-secondary border-2 border-secondary-dark flex items-center justify-center text-white font-bold text-xl"
                role="img"
                aria-label={`Algebra tile ${i + 1}`}
              >
                x
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const getManipulativeLabel = () => {
    switch (type) {
      case 'counters':
        return 'Counters';
      case 'base-ten':
        return 'Base-Ten Blocks';
      case 'fraction-tiles':
        return 'Fraction Tiles';
      case 'algebra-tiles':
        return 'Algebra Tiles';
      default:
        return 'Manipulatives';
    }
  };

  return (
    <div
      className="border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
      role="region"
      aria-label={`Interactive ${getManipulativeLabel()}`}
    >
      {prompt && (
        <div className="p-4 border-b border-gray-300 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {prompt}
          </p>
        </div>
      )}

      <div className="min-h-[200px] bg-white dark:bg-gray-800 flex items-center justify-center">
        {count === 0 ? (
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            Click &quot;Add&quot; to start placing {getManipulativeLabel().toLowerCase()}
          </p>
        ) : (
          renderManipulative()
        )}
      </div>

      <div className="p-4 border-t border-gray-300 dark:border-gray-700 flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Count: <span className="text-primary text-lg">{count}</span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemove}
            disabled={count === 0}
            aria-label="Remove one item"
          >
            Remove
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleAdd}
            disabled={count >= maxCount}
            aria-label="Add one item"
          >
            Add
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={count === 0}
            aria-label="Reset all items"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
