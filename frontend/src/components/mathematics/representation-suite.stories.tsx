import type { Meta, StoryObj } from '@storybook/react';
import { QuestionRepresentationSuite } from './representation-suite';
import { Question } from '@/types';

const meta = {
  title: 'Mathematics/QuestionRepresentationSuite',
  component: QuestionRepresentationSuite,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof QuestionRepresentationSuite>;

export default meta;
type Story = StoryObj<typeof meta>;

const fractionQuestion: Question = {
  id: 'demo-fraction',
  type: 'multiple_choice',
  content: 'Which fraction is larger: 1/4 or 1/8?',
  options: ['1/4', '1/8', 'They are equal'],
  correctAnswer: '1/4',
  explanation:
    '1/4 means the whole is divided into 4 parts, 1/8 means it\'s divided into 8 parts.',
  marks: 2,
  skillIds: ['skill-fraction-comparison'],
  misconceptionIds: ['MISC-006'],
  difficulty: 2,
  bloomsLevel: 'comprehension',
  representations: ['diagram', 'manipulative'],
};

const decimalQuestion: Question = {
  id: 'demo-decimal',
  type: 'multiple_choice',
  content: 'Which decimal is larger: 0.7 or 0.23?',
  options: ['0.7', '0.23', 'They are equal'],
  correctAnswer: '0.7',
  explanation: '0.7 is the same as 0.70, which is larger than 0.23.',
  marks: 2,
  skillIds: ['skill-decimal-comparison'],
  misconceptionIds: ['MISC-003'],
  difficulty: 2,
  bloomsLevel: 'comprehension',
  representations: ['diagram'],
};

const wordProblemQuestion: Question = {
  id: 'demo-word',
  type: 'word_problem',
  content: 'Sarah has R12.50. She buys a sandwich for R6.75. How much money does she have left?',
  correctAnswer: 'R5.75',
  explanation: 'Subtract the cost from her total: R12.50 - R6.75 = R5.75.',
  marks: 3,
  skillIds: ['skill-decimal-place-value'],
  misconceptionIds: [],
  difficulty: 2,
  bloomsLevel: 'application',
  representations: ['storyContext', 'diagram'],
};

const algebraQuestion: Question = {
  id: 'demo-algebra',
  type: 'multiple_choice',
  content: 'Simplify: 2x + 3x',
  options: ['5x', '5x²', '6x', '5'],
  correctAnswer: '5x',
  explanation: 'When adding like terms, add the coefficients: 2x + 3x = 5x.',
  marks: 2,
  skillIds: ['skill-like-terms'],
  misconceptionIds: ['MISC-009'],
  difficulty: 3,
  bloomsLevel: 'application',
  representations: ['manipulative'],
};

const negativeNumberQuestion: Question = {
  id: 'demo-negative',
  type: 'numeric',
  content: 'What is 5 - 8? (Use negative numbers if needed)',
  correctAnswer: '-3',
  explanation: 'When subtracting a larger number from a smaller one, the result is negative.',
  marks: 2,
  skillIds: ['skill-negative-numbers'],
  misconceptionIds: ['MISC-005'],
  difficulty: 3,
  bloomsLevel: 'application',
  representations: ['diagram', 'manipulative'],
};

export const FractionComparison: Story = {
  args: {
    question: fractionQuestion,
    onInteraction: (representationType, action, data) => {
      console.log('Interaction:', { representationType, action, data });
    },
  },
};

export const DecimalComparison: Story = {
  args: {
    question: decimalQuestion,
  },
};

export const WordProblem: Story = {
  args: {
    question: wordProblemQuestion,
  },
};

export const AlgebraExpression: Story = {
  args: {
    question: algebraQuestion,
  },
};

export const NegativeNumbers: Story = {
  args: {
    question: negativeNumberQuestion,
  },
};

export const NoRepresentations: Story = {
  args: {
    question: {
      ...fractionQuestion,
      representations: undefined,
    },
  },
};

export const AllRepresentationTypes: Story = {
  args: {
    question: {
      id: 'demo-all',
      type: 'word_problem',
      content:
        'A farmer has 3/4 of a field planted. If the field is divided into 8 equal sections, how many sections are planted?',
      correctAnswer: '6',
      explanation: '3/4 is equivalent to 6/8, so 6 sections are planted.',
      marks: 3,
      skillIds: ['skill-fraction-equivalence'],
      misconceptionIds: [],
      difficulty: 3,
      bloomsLevel: 'application',
      representations: ['diagram', 'manipulative', 'storyContext'],
    },
  },
};
