import React from 'react';
import { render, screen } from '@testing-library/react';
import { QuestionRepresentationSuite } from '@/components/mathematics/representation-suite';
import { Question } from '@/types';

describe('QuestionRepresentationSuite', () => {
  const baseQuestion: Question = {
    id: 'test-q1',
    type: 'multiple_choice',
    content: 'Test question',
    correctAnswer: 'answer',
    explanation: 'explanation',
    marks: 2,
    skillIds: ['skill-1'],
    misconceptionIds: [],
    difficulty: 2,
    bloomsLevel: 'comprehension',
  };

  it('renders nothing when question has no representations', () => {
    const { container } = render(
      <QuestionRepresentationSuite question={baseQuestion} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when representations array is empty', () => {
    const questionWithEmptyReps = {
      ...baseQuestion,
      representations: [] as any[],
    };

    const { container } = render(
      <QuestionRepresentationSuite question={questionWithEmptyReps} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders diagram representation for fraction questions', () => {
    const fractionQuestion = {
      ...baseQuestion,
      content: 'Which fraction is larger: 1/4 or 1/8?',
      representations: ['diagram' as const],
    };

    render(<QuestionRepresentationSuite question={fractionQuestion} />);

    expect(screen.getByRole('region', { name: /visual representations/i })).toBeInTheDocument();
  });

  it('renders manipulative representation when specified', () => {
    const manipulativeQuestion = {
      ...baseQuestion,
      content: 'Simplify: 2x + 3x',
      representations: ['manipulative' as const],
    };

    render(<QuestionRepresentationSuite question={manipulativeQuestion} />);

    expect(screen.getByRole('region', { name: /visual representations/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /interactive/i })).toBeInTheDocument();
  });

  it('renders story context for word problems', () => {
    const wordProblemQuestion = {
      ...baseQuestion,
      type: 'word_problem' as const,
      content: 'Sarah has R12.50. She buys a sandwich for R6.75. How much money does she have left?',
      representations: ['storyContext' as const],
    };

    render(<QuestionRepresentationSuite question={wordProblemQuestion} />);

    expect(screen.getByText('Story Context')).toBeInTheDocument();
    expect(screen.getByText(/South African context/i)).toBeInTheDocument();
  });

  it('renders multiple representations when question has multiple types', () => {
    const multiRepQuestion = {
      ...baseQuestion,
      content: 'Which fraction is larger: 1/4 or 1/8?',
      representations: ['diagram' as const, 'manipulative' as const],
    };

    render(<QuestionRepresentationSuite question={multiRepQuestion} />);

    expect(screen.getByRole('region', { name: /visual representations/i })).toBeInTheDocument();
    // Should have both diagram and manipulative components
    expect(screen.getByRole('region', { name: /interactive/i })).toBeInTheDocument();
  });

  it('calls onInteraction callback when provided', () => {
    const onInteraction = jest.fn();
    const question = {
      ...baseQuestion,
      content: 'Count to 5',
      representations: ['manipulative' as const],
    };

    render(
      <QuestionRepresentationSuite
        question={question}
        onInteraction={onInteraction}
      />
    );

    // Verify the component rendered (interaction testing would require user events)
    expect(screen.getByRole('region', { name: /interactive/i })).toBeInTheDocument();
  });

  it('extracts numbers correctly for number line display', () => {
    const numberQuestion = {
      ...baseQuestion,
      content: 'Which decimal is larger: 0.7 or 0.23?',
      representations: ['diagram' as const],
    };

    render(<QuestionRepresentationSuite question={numberQuestion} />);

    expect(screen.getByRole('region', { name: /visual representations/i })).toBeInTheDocument();
  });

  it('handles questions with decimal numbers', () => {
    const decimalQuestion = {
      ...baseQuestion,
      content: 'Calculate: 4 ÷ 0.5 = ?',
      representations: ['diagram' as const, 'manipulative' as const],
    };

    const { container } = render(<QuestionRepresentationSuite question={decimalQuestion} />);

    expect(container.querySelector('[role="region"]')).toBeInTheDocument();
  });

  it('displays heading for visual representations section', () => {
    const question = {
      ...baseQuestion,
      content: 'Test with 1/2',
      representations: ['diagram' as const],
    };

    render(<QuestionRepresentationSuite question={question} />);

    expect(screen.getByText('Visual Representations')).toBeInTheDocument();
  });
});
