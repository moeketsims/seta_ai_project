'use client';

import React from 'react';
import { Question } from '@/types';
import { VisualFractionBar } from './VisualFractionBar';
import { NumberLine } from './NumberLine';
import { VirtualManipulativePanel, ManipulativeType } from './VirtualManipulativePanel';
import { StoryContextCard } from './StoryContextCard';
import { DraggableCounters } from './DraggableCounters';
import { InteractiveFractionCircle } from './InteractiveFractionCircle';
import { NumberBalance } from './NumberBalance';

export interface QuestionRepresentationSuiteProps {
  question: Question;
  onInteraction?: (representationType: string, action: string, data: any) => void;
}

/**
 * QuestionRepresentationSuite is a dispatcher component that renders
 * appropriate representation components based on the question's representation requirements.
 */
export function QuestionRepresentationSuite({
  question,
  onInteraction,
}: QuestionRepresentationSuiteProps) {
  if (!question.representations || question.representations.length === 0) {
    return null;
  }

  const handleInteraction = (representationType: string) => (action: string, data: any) => {
    onInteraction?.(representationType, action, data);
  };

  // Helper function to extract numbers from question content for diagram rendering
  const extractNumbersFromContent = (content: string): number[] => {
    const numbers = content.match(/\d+\.?\d*/g);
    return numbers ? numbers.map(Number) : [];
  };

  // Helper function to extract fractions from question content
  const extractFractionFromContent = (
    content: string
  ): { numerator: number; denominator: number } | null => {
    const fractionMatch = content.match(/(\d+)\/(\d+)/);
    if (fractionMatch) {
      return {
        numerator: parseInt(fractionMatch[1]),
        denominator: parseInt(fractionMatch[2]),
      };
    }
    return null;
  };

  // Helper function to determine manipulative type based on question content
  const determineManipulativeType = (content: string): ManipulativeType => {
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('fraction') || content.includes('/')) {
      return 'fraction-tiles';
    }
    if (lowerContent.includes('algebra') || /\d*x/.test(content)) {
      return 'algebra-tiles';
    }
    if (lowerContent.includes('tens') || lowerContent.includes('hundreds')) {
      return 'base-ten';
    }
    return 'counters';
  };

  // Helper function to extract story context from word problems
  const extractStoryContext = (question: Question) => {
    if (question.type !== 'word_problem') {
      return null;
    }

    // Extract names, monetary values, and objects from the question
    const nameMatch = question.content.match(/([A-Z][a-z]+)/);
    const moneyMatch = question.content.match(/R\d+\.?\d*/g);
    const name = nameMatch ? nameMatch[1] : 'A learner';

    return {
      scenario: question.content,
      culturalContext: 'South African context using Rand (R) currency',
      vocabulary: moneyMatch ? ['Rand (R)', 'money', 'cost', 'change'] : [],
      comprehensionPrompts: [
        `What information are we given in the problem?`,
        `What are we trying to find out?`,
        `What operation(s) do we need to use?`,
      ],
    };
  };

  return (
    <div
      className="space-y-4 my-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-700"
      role="region"
      aria-label="Visual representations to help understand the question"
    >
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
        Visual Representations
      </h3>

      {question.representations.map((representation) => {
        switch (representation) {
          case 'diagram': {
            const fraction = extractFractionFromContent(question.content);
            const numbers = extractNumbersFromContent(question.content);

            // Render fraction bar for fraction questions
            if (fraction) {
              return (
                <div key="diagram-fraction">
                  <VisualFractionBar
                    numerator={fraction.numerator}
                    denominator={fraction.denominator}
                    label={`Visual representation of ${fraction.numerator}/${fraction.denominator}`}
                  />
                </div>
              );
            }

            // Render number line for comparison and number questions
            if (numbers.length >= 2) {
              const min = Math.min(...numbers);
              const max = Math.max(...numbers);
              const range = max - min;
              const step = range > 10 ? Math.ceil(range / 10) : 1;

              return (
                <div key="diagram-numberline">
                  <NumberLine
                    min={Math.floor(min - range * 0.2)}
                    max={Math.ceil(max + range * 0.2)}
                    step={step}
                    markedValues={numbers}
                    highlightValue={numbers[0]}
                    label="Number line showing values from the question"
                  />
                </div>
              );
            }

            return null;
          }

          case 'manipulative': {
            const content = question.content.toLowerCase();
            const fraction = extractFractionFromContent(question.content);
            const numbers = extractNumbersFromContent(question.content);

            // Use interactive fraction circles for fraction questions
            if (fraction || content.includes('fraction')) {
              return (
                <div key="manipulative-fraction">
                  <InteractiveFractionCircle
                    prompt="Explore fractions by adding and rotating pieces"
                    denominators={[2, 3, 4, 6, 8]}
                  />
                </div>
              );
            }

            // Use number balance for equations and equality
            if (content.includes('=') || content.includes('equation') || content.includes('equal')) {
              const leftValue = numbers.length > 0 ? numbers[0] : 5;
              const rightValue = numbers.length > 1 ? numbers[1] : 5;
              return (
                <div key="manipulative-balance">
                  <NumberBalance
                    prompt="Balance the equation by adjusting both sides"
                    targetEquation={{ left: leftValue, right: rightValue }}
                  />
                </div>
              );
            }

            // Use draggable counters for counting, addition, subtraction, multiplication
            // For multiplication, use the whole number (not the decimal)
            let initialCount = 5;
            let contextPrompt = "Drag counters around to explore the problem. Group them to help solve it!";

            if (content.includes('×') || content.includes('multiply')) {
              // For multiplication, show groups based on the larger whole number
              const wholeNumbers = numbers.filter(n => n >= 1);
              const multiplier = wholeNumbers.length > 0 ? wholeNumbers[wholeNumbers.length - 1] : 4;

              if (content.includes('0.5') || content.includes('1/2') || content.includes('half')) {
                // For 0.5 × N, we want N counters to show "half of N"
                initialCount = Math.min(multiplier, 20);
                contextPrompt = `0.5 × ${multiplier} means "half of ${multiplier}". Start with ${multiplier} counters. Put half in Group A and half in Group B. Count one group for your answer!`;
              } else {
                initialCount = Math.min(multiplier * 2, 20);
                contextPrompt = `Try making ${multiplier} equal groups to visualize the multiplication!`;
              }
            } else if (content.includes('+') || content.includes('add')) {
              initialCount = numbers.length > 0 ? Math.min(numbers[0], 15) : 5;
              contextPrompt = "Put some counters in Group A, the rest in Group B. Combine them to find the total!";
            } else if (content.includes('-') || content.includes('subtract')) {
              initialCount = numbers.length > 0 ? Math.min(numbers[0], 15) : 8;
              contextPrompt = "Start with all counters in one group, then move some to the other group. Count what's left!";
            } else if (content.includes('÷') || content.includes('divide')) {
              initialCount = numbers.length > 0 ? Math.min(numbers[0], 20) : 8;
              contextPrompt = "Divide these counters into equal groups. How many are in each group?";
            } else {
              initialCount = numbers.length > 0 ? Math.min(Math.floor(numbers[0]), 15) : 6;
            }

            return (
              <div key="manipulative-counters">
                <DraggableCounters
                  prompt={contextPrompt}
                  initialCount={initialCount}
                  maxCount={30}
                  onCountChange={(count) => handleInteraction('manipulative')('countChange', { count })}
                />
              </div>
            );
          }

          case 'storyContext': {
            const storyContext = extractStoryContext(question);
            if (!storyContext) return null;

            return (
              <div key="storyContext">
                <StoryContextCard {...storyContext} />
              </div>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
}
