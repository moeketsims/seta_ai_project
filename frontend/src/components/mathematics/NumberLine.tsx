import React from 'react';

export interface NumberLineProps {
  min: number;
  max: number;
  markedValues?: number[];
  highlightValue?: number;
  step?: number;
  label?: string;
}

/**
 * NumberLine component displays a horizontal number line with optional markers
 * and highlighted values.
 */
export function NumberLine({
  min,
  max,
  markedValues = [],
  highlightValue,
  step = 1,
  label,
}: NumberLineProps) {
  const range = max - min;
  const ticks = [];
  for (let i = min; i <= max; i += step) {
    ticks.push(i);
  }

  const getPosition = (value: number) => {
    return ((value - min) / range) * 100;
  };

  return (
    <div className="space-y-4" role="img" aria-label={label || `Number line from ${min} to ${max}`}>
      {label && (
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </p>
      )}

      <div className="relative px-4 py-8">
        {/* Main line */}
        <div className="absolute top-1/2 left-4 right-4 h-1 bg-gray-400 dark:bg-gray-600 -translate-y-1/2" aria-hidden="true" />

        {/* Ticks and labels */}
        {ticks.map((tick) => {
          const position = getPosition(tick);
          const isHighlighted = highlightValue === tick;
          const isMarked = markedValues.includes(tick);

          return (
            <div
              key={tick}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `calc(${position}% + 1rem)` }}
            >
              {/* Tick mark */}
              <div
                className={`w-0.5 h-4 mx-auto ${
                  isHighlighted
                    ? 'bg-primary h-6'
                    : isMarked
                    ? 'bg-secondary h-5'
                    : 'bg-gray-400 dark:bg-gray-600'
                }`}
                aria-hidden="true"
              />

              {/* Label */}
              <div
                className={`text-center mt-2 text-sm ${
                  isHighlighted
                    ? 'font-bold text-primary'
                    : isMarked
                    ? 'font-semibold text-secondary'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {tick}
              </div>

              {/* Highlight marker */}
              {isHighlighted && (
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary border-2 border-white dark:border-gray-900"
                  aria-label={`Highlighted value: ${tick}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
