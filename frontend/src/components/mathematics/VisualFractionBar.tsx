import React from 'react';

export interface VisualFractionBarProps {
  numerator: number;
  denominator: number;
  label?: string;
  showValues?: boolean;
  color?: string;
}

/**
 * VisualFractionBar component displays a visual representation of a fraction
 * using a horizontal bar divided into equal parts.
 */
export function VisualFractionBar({
  numerator,
  denominator,
  label,
  showValues = true,
  color = 'bg-primary',
}: VisualFractionBarProps) {
  const segments = Array.from({ length: denominator }, (_, i) => i);
  const filledSegments = Math.min(numerator, denominator);

  return (
    <div className="space-y-2" role="img" aria-label={`Visual representation of ${numerator}/${denominator}`}>
      {label && (
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </p>
      )}

      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-0.5 min-h-[48px]">
          {segments.map((i) => (
            <div
              key={i}
              className={`flex-1 border-2 border-gray-400 dark:border-gray-600 rounded transition-colors ${
                i < filledSegments
                  ? `${color} opacity-80`
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}
              aria-hidden="true"
            />
          ))}
        </div>

        {showValues && (
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 min-w-[60px] text-right">
            <span className="text-primary">{numerator}</span>
            <span className="text-gray-400">/</span>
            <span>{denominator}</span>
          </div>
        )}
      </div>
    </div>
  );
}
