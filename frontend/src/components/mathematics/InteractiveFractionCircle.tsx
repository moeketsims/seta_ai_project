'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export interface InteractiveFractionCircleProps {
  denominators?: number[];
  prompt?: string;
}

interface FractionPiece {
  id: string;
  denominator: number;
  rotation: number;
  isActive: boolean;
}

/**
 * InteractiveFractionCircle allows learners to explore fractions by
 * rotating and combining circular fraction pieces.
 */
export function InteractiveFractionCircle({
  denominators = [2, 3, 4, 6, 8],
  prompt,
}: InteractiveFractionCircleProps) {
  const [selectedDenominator, setSelectedDenominator] = useState(4);
  const [pieces, setPieces] = useState<FractionPiece[]>([]);

  const colors = [
    'stroke-red-500 fill-red-500/20',
    'stroke-blue-500 fill-blue-500/20',
    'stroke-green-500 fill-green-500/20',
    'stroke-yellow-500 fill-yellow-500/20',
    'stroke-purple-500 fill-purple-500/20',
    'stroke-pink-500 fill-pink-500/20',
    'stroke-orange-500 fill-orange-500/20',
    'stroke-teal-500 fill-teal-500/20',
  ];

  const handleAddPiece = () => {
    const newPiece: FractionPiece = {
      id: `piece-${Date.now()}`,
      denominator: selectedDenominator,
      rotation: 0,
      isActive: false,
    };
    setPieces((prev) => [...prev, newPiece]);
  };

  const handleRotatePiece = (id: string) => {
    setPieces((prev) =>
      prev.map((piece) =>
        piece.id === id
          ? { ...piece, rotation: (piece.rotation + 45) % 360 }
          : piece
      )
    );
  };

  const handleRemovePiece = (id: string) => {
    setPieces((prev) => prev.filter((piece) => piece.id !== id));
  };

  const handleClearAll = () => {
    setPieces([]);
  };

  // SVG path for a circle slice
  const createSlicePath = (startAngle: number, endAngle: number, radius: number = 80) => {
    const start = polarToCartesian(100, 100, radius, endAngle);
    const end = polarToCartesian(100, 100, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M', 100, 100,
      'L', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      'Z'
    ].join(' ');
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const renderFractionPiece = (piece: FractionPiece, index: number) => {
    const sliceAngle = 360 / piece.denominator;
    const colorClass = colors[index % colors.length];

    return (
      <div
        key={piece.id}
        className="relative"
        style={{
          width: '200px',
          height: '200px',
        }}
      >
        <svg
          viewBox="0 0 200 200"
          className="cursor-pointer transition-transform hover:scale-105"
          onClick={() => handleRotatePiece(piece.id)}
          style={{
            transform: `rotate(${piece.rotation}deg)`,
            transformOrigin: 'center',
          }}
        >
          {/* Base circle */}
          <circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-300 dark:text-gray-600"
          />

          {/* Fraction slice */}
          <path
            d={createSlicePath(0, sliceAngle)}
            className={colorClass}
            strokeWidth="3"
          />

          {/* Division lines */}
          {Array.from({ length: piece.denominator }).map((_, i) => {
            const angle = (i * 360) / piece.denominator;
            const end = polarToCartesian(100, 100, 85, angle);
            return (
              <line
                key={i}
                x1="100"
                y1="100"
                x2={end.x}
                y2={end.y}
                stroke="currentColor"
                strokeWidth="1"
                className="text-gray-400 dark:text-gray-500"
              />
            );
          })}

          {/* Center label */}
          <text
            x="100"
            y="105"
            textAnchor="middle"
            className="text-sm font-bold fill-gray-700 dark:fill-gray-300"
          >
            1/{piece.denominator}
          </text>
        </svg>

        {/* Remove button */}
        <button
          onClick={() => handleRemovePiece(piece.id)}
          className="absolute top-0 right-0 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold hover:bg-red-600 transition-colors"
          aria-label="Remove piece"
        >
          ×
        </button>

        <div className="text-center text-xs text-gray-600 dark:text-gray-400 mt-1">
          Click to rotate
        </div>
      </div>
    );
  };

  return (
    <div className="border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
      {prompt && (
        <div className="p-4 border-b border-gray-300 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <span className="text-lg">🥧</span>
            {prompt}
          </p>
        </div>
      )}

      <div className="p-6 bg-white dark:bg-gray-800">
        {pieces.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 dark:text-gray-500 mb-4">
              Select a fraction size and click &quot;Add Piece&quot; to start exploring!
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-6 justify-center">
            {pieces.map((piece, index) => renderFractionPiece(piece, index))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-300 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Fraction:
          </label>
          <div className="flex gap-2">
            {denominators.map((denom) => (
              <button
                key={denom}
                onClick={() => setSelectedDenominator(denom)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedDenominator === denom
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                1/{denom}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleAddPiece}
            disabled={pieces.length >= 8}
          >
            Add Piece
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            disabled={pieces.length === 0}
          >
            Clear All
          </Button>
        </div>
      </div>

      <div className="px-4 pb-4 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900">
        💡 Try combining pieces to make whole fractions! Click pieces to rotate them.
      </div>
    </div>
  );
}
