'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';

export interface DraggableCountersProps {
  initialCount?: number;
  maxCount?: number;
  prompt?: string;
  onCountChange?: (count: number) => void;
}

interface Counter {
  id: string;
  x: number;
  y: number;
}

/**
 * DraggableCounters provides interactive counters that learners can drag around
 * to explore counting, addition, subtraction, and grouping concepts.
 */
export function DraggableCounters({
  initialCount = 5,
  maxCount = 30,
  prompt,
  onCountChange,
}: DraggableCountersProps) {
  const [counters, setCounters] = useState<Counter[]>(() => {
    // Initialize counters in a grid pattern with better spacing
    const initial: Counter[] = [];
    const cols = 5;
    const startX = 80;
    const startY = 60;
    const spacingX = 70;
    const spacingY = 70;

    for (let i = 0; i < initialCount; i++) {
      initial.push({
        id: `counter-${Date.now()}-${i}`,
        x: startX + (i % cols) * spacingX,
        y: startY + Math.floor(i / cols) * spacingY,
      });
    }
    return initial;
  });

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setDraggingId(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(15, Math.min(e.clientX - rect.left, rect.width - 15));
    const y = Math.max(15, Math.min(e.clientY - rect.top, rect.height - 15));

    setCounters((prev) =>
      prev.map((counter) =>
        counter.id === draggingId ? { ...counter, x, y } : counter
      )
    );
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  const handleAddCounter = () => {
    if (counters.length >= maxCount) return;

    const newCounter: Counter = {
      id: `counter-${Date.now()}`,
      x: Math.random() * 250 + 50,
      y: Math.random() * 150 + 50,
    };

    setCounters((prev) => [...prev, newCounter]);
    onCountChange?.(counters.length + 1);
  };

  const handleRemoveCounter = () => {
    if (counters.length === 0) return;

    setCounters((prev) => prev.slice(0, -1));
    onCountChange?.(counters.length - 1);
  };

  const handleReset = () => {
    setCounters([]);
    onCountChange?.(0);
  };

  return (
    <div className="border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
      {prompt && (
        <div className="p-4 border-b border-gray-300 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <span className="text-lg">🖐️</span>
            {prompt}
          </p>
        </div>
      )}

      <div
        ref={containerRef}
        className="relative bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-t-lg overflow-hidden select-none"
        style={{ height: '400px' }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        role="application"
        aria-label="Draggable counters workspace"
      >
        {/* Helper zones in background */}
        <div className="absolute inset-4 grid grid-cols-2 gap-4 pointer-events-none">
          <div className="border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg bg-blue-100/30 dark:bg-blue-900/10 flex items-center justify-center">
            <span className="text-blue-400 dark:text-blue-600 text-sm font-medium">Group A</span>
          </div>
          <div className="border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-lg bg-purple-100/30 dark:bg-purple-900/10 flex items-center justify-center">
            <span className="text-purple-400 dark:text-purple-600 text-sm font-medium">Group B</span>
          </div>
        </div>

        {counters.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-400 dark:text-gray-500 text-lg font-medium mb-2">
                No counters yet!
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                Click &quot;Add Counter&quot; below to start exploring
              </p>
            </div>
          </div>
        ) : (
          counters.map((counter) => (
            <div
              key={counter.id}
              className={`absolute w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark border-3 border-white dark:border-gray-900 shadow-lg cursor-grab active:cursor-grabbing transition-transform ${
                draggingId === counter.id ? 'scale-110 z-50' : 'hover:scale-105'
              }`}
              style={{
                left: `${counter.x}px`,
                top: `${counter.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
              onMouseDown={(e) => handleMouseDown(counter.id, e)}
              role="button"
              aria-label={`Draggable counter`}
              tabIndex={0}
            >
              <div className="absolute inset-0 rounded-full bg-white/20" />
            </div>
          ))
        )}

        {/* Instructions overlay when dragging */}
        {draggingId && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary/90 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg pointer-events-none">
            Drag to move • Release to drop
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Total Count: <span className="text-primary text-2xl">{counters.length}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveCounter}
              disabled={counters.length === 0}
            >
              Remove
            </Button>
            <Button
              size="sm"
              onClick={handleAddCounter}
              disabled={counters.length >= maxCount}
            >
              Add Counter
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={counters.length === 0}
            >
              Clear All
            </Button>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <span className="font-semibold">💡 How to use:</span> Click and drag counters to move them around.
            Group them in the zones to help solve addition, subtraction, or grouping problems!
          </p>
        </div>
      </div>
    </div>
  );
}
