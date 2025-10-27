'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export interface NumberBalanceProps {
  prompt?: string;
  targetEquation?: { left: number; right: number };
}

/**
 * NumberBalance provides an interactive balance scale for exploring
 * equations and equality concepts.
 */
export function NumberBalance({ prompt, targetEquation }: NumberBalanceProps) {
  const [leftSide, setLeftSide] = useState(targetEquation?.left || 5);
  const [rightSide, setRightSide] = useState(targetEquation?.right || 5);

  const difference = leftSide - rightSide;
  const isBalanced = difference === 0;

  // Calculate tilt angle (-30 to +30 degrees)
  const tiltAngle = Math.max(-30, Math.min(30, difference * 5));

  const handleAddLeft = () => {
    setLeftSide((prev) => Math.min(prev + 1, 20));
  };

  const handleRemoveLeft = () => {
    setLeftSide((prev) => Math.max(prev - 1, 0));
  };

  const handleAddRight = () => {
    setRightSide((prev) => Math.min(prev + 1, 20));
  };

  const handleRemoveRight = () => {
    setRightSide((prev) => Math.max(prev - 1, 0));
  };

  const handleReset = () => {
    setLeftSide(targetEquation?.left || 5);
    setRightSide(targetEquation?.right || 5);
  };

  return (
    <div className="border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
      {prompt && (
        <div className="p-4 border-b border-gray-300 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <span className="text-lg">⚖️</span>
            {prompt}
          </p>
        </div>
      )}

      <div className="p-8 bg-white dark:bg-gray-800">
        {/* Status indicator */}
        <div className="text-center mb-6">
          {isBalanced ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-full font-semibold">
              <span className="text-xl">✓</span>
              Balanced! {leftSide} = {rightSide}
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-warning/10 text-warning rounded-full font-semibold">
              <span className="text-xl">⚠</span>
              Not balanced: {leftSide} ≠ {rightSide}
            </div>
          )}
        </div>

        {/* Balance visualization */}
        <div className="relative h-64 flex items-center justify-center">
          {/* Stand */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-32 bg-gray-400 dark:bg-gray-600 rounded-t-full" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-gray-400 dark:bg-gray-600 rounded-full" />

          {/* Balance beam */}
          <div
            className="absolute top-24 left-1/2 -translate-x-1/2 transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-50%) rotate(${tiltAngle}deg)`,
              transformOrigin: 'center center',
            }}
          >
            {/* Beam */}
            <div className="relative w-96 h-3 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 dark:from-gray-500 dark:via-gray-400 dark:to-gray-500 rounded-full shadow-lg">
              {/* Center pivot */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-800 dark:bg-gray-300 rounded-full border-2 border-white dark:border-gray-900" />

              {/* Left pan */}
              <div className="absolute -bottom-16 left-8 -translate-x-1/2 w-32 h-3 bg-gray-600 dark:bg-gray-500 rounded-full shadow-md">
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-28 h-20 bg-gradient-to-b from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-2xl border-4 border-blue-700 dark:border-blue-800 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">{leftSide}</span>
                </div>
              </div>

              {/* Right pan */}
              <div className="absolute -bottom-16 right-8 translate-x-1/2 w-32 h-3 bg-gray-600 dark:bg-gray-500 rounded-full shadow-md">
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-28 h-20 bg-gradient-to-b from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-2xl border-4 border-green-700 dark:border-green-800 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">{rightSide}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-8 mt-12">
          {/* Left side controls */}
          <div className="space-y-3">
            <div className="text-center font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Left Side
            </div>
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveLeft}
                disabled={leftSide === 0}
                className="w-20"
              >
                - 1
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleAddLeft}
                disabled={leftSide >= 20}
                className="w-20 bg-blue-600 hover:bg-blue-700"
              >
                + 1
              </Button>
            </div>
          </div>

          {/* Right side controls */}
          <div className="space-y-3">
            <div className="text-center font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Right Side
            </div>
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveRight}
                disabled={rightSide === 0}
                className="w-20"
              >
                - 1
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleAddRight}
                disabled={rightSide >= 20}
                className="w-20 bg-green-600 hover:bg-green-700"
              >
                + 1
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-300 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          💡 Add or remove weights to balance the scale
        </div>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          Reset
        </Button>
      </div>
    </div>
  );
}
