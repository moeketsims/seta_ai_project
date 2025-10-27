import React from 'react';
import { Card } from '@/components/ui/card';

export interface StoryContextCardProps {
  scenario: string;
  culturalContext?: string;
  vocabulary?: string[];
  comprehensionPrompts?: string[];
  imageUrl?: string;
}

/**
 * StoryContextCard highlights culturally relevant scenarios for word problems,
 * providing vocabulary support and comprehension prompts.
 */
export function StoryContextCard({
  scenario,
  culturalContext,
  vocabulary = [],
  comprehensionPrompts = [],
  imageUrl,
}: StoryContextCardProps) {
  return (
    <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 border-2 border-amber-200 dark:border-amber-900">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="text-3xl" role="img" aria-label="Story context">
            📖
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
              Story Context
            </h3>
            {culturalContext && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                {culturalContext}
              </p>
            )}
          </div>
        </div>

        {/* Image if provided */}
        {imageUrl && (
          <div className="rounded-lg overflow-hidden border-2 border-amber-300 dark:border-amber-800">
            <img
              src={imageUrl}
              alt="Story illustration"
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        {/* Scenario */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-amber-200 dark:border-amber-900">
          <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
            {scenario}
          </p>
        </div>

        {/* Vocabulary section */}
        {vocabulary.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <span role="img" aria-label="Key vocabulary">
                📚
              </span>
              Key Vocabulary
            </h4>
            <div className="flex flex-wrap gap-2">
              {vocabulary.map((word, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 rounded-full text-sm font-medium border border-amber-300 dark:border-amber-700"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Comprehension prompts */}
        {comprehensionPrompts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <span role="img" aria-label="Think about">
                💡
              </span>
              Think About
            </h4>
            <ul className="space-y-1.5">
              {comprehensionPrompts.map((prompt, index) => (
                <li
                  key={index}
                  className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2"
                >
                  <span className="text-amber-600 dark:text-amber-400 mt-0.5">
                    •
                  </span>
                  <span className="flex-1">{prompt}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}
