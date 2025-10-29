/**
 * Diagnostic Mode Toggle Component
 *
 * Allows learners/teachers to switch between:
 * - Standard Assessment: Fixed questions, all learners get same items
 * - Diagnostic Mode: Adaptive questions, AI-powered misconception detection
 */

import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

export type AssessmentMode = 'standard' | 'diagnostic';

interface DiagnosticModeToggleProps {
  mode: AssessmentMode;
  onModeChange: (mode: AssessmentMode) => void;
  disabled?: boolean;
}

export function DiagnosticModeToggle({
  mode,
  onModeChange,
  disabled = false
}: DiagnosticModeToggleProps) {
  return (
    <Card className="p-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--ufs-navy)] to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
          <span className="text-white text-xl font-bold">AI</span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-[var(--ufs-navy)] mb-1">
            Assessment Mode
          </h3>
          <p className="text-sm text-neutral-600">
            Choose how you want to be assessed
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Standard Mode */}
        <button
          onClick={() => !disabled && onModeChange('standard')}
          disabled={disabled}
          className={`p-4 rounded-lg border-2 transition-all text-left ${
            mode === 'standard'
              ? 'border-[var(--ufs-maroon)] bg-[var(--ufs-maroon)]/5 ring-2 ring-[var(--ufs-maroon)] ring-offset-2'
              : 'border-neutral-200 hover:border-[var(--ufs-maroon)]/50 hover:bg-neutral-50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-[var(--ufs-maroon)]">
              Standard Assessment
            </span>
            {mode === 'standard' && (
              <Badge tone="success" className="text-xs">Active</Badge>
            )}
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed mb-2">
            Complete all {10} questions in the assessment. Fixed question set.
          </p>
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>~30 minutes</span>
          </div>
        </button>

        {/* Diagnostic Mode */}
        <button
          onClick={() => !disabled && onModeChange('diagnostic')}
          disabled={disabled}
          className={`p-4 rounded-lg border-2 transition-all text-left ${
            mode === 'diagnostic'
              ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-600 ring-offset-2'
              : 'border-neutral-200 hover:border-purple-400 hover:bg-purple-50/50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-purple-900">
                AI Diagnostic
              </span>
              <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs border-0">
                Recommended
              </Badge>
            </div>
            {mode === 'diagnostic' && (
              <Badge tone="success" className="text-xs">Active</Badge>
            )}
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed mb-2">
            Adaptive questions that adjust based on your responses. AI identifies specific learning gaps.
          </p>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1 text-purple-700">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Adaptive</span>
            </div>
            <div className="flex items-center gap-1 text-neutral-500">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>5-10 min</span>
            </div>
          </div>
        </button>
      </div>

      {/* Diagnostic Mode Benefits */}
      {mode === 'diagnostic' && (
        <div className="mt-4 pt-4 border-t border-purple-200">
          <div className="flex items-start gap-2 text-xs text-purple-900 bg-purple-100/50 rounded-lg p-3">
            <svg className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="font-semibold mb-1">How AI Diagnostic Works:</p>
              <ul className="space-y-1 text-neutral-700">
                <li>• Questions adapt based on your answers</li>
                <li>• AI detects specific mathematical misconceptions</li>
                <li>• Shorter and more efficient than standard tests</li>
                <li>• Provides targeted learning recommendations</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
