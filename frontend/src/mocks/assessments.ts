import { Assessment, Question } from '@/types';

// Sample Questions
export const sampleQuestions: Question[] = [
  {
    id: 'q-001',
    type: 'multiple_choice',
    content: 'What is 0.5 × 4?',
    options: ['0.2', '2', '4.5', '20'],
    correctAnswer: '2',
    explanation:
      'When multiplying 0.5 by 4, think of it as "half of 4", which equals 2. Multiplication by fractions less than 1 results in a smaller number.',
    marks: 2,
    skillIds: ['skill-mult-fractions'],
    misconceptionIds: ['MISC-001'],
    difficulty: 2,
    bloomsLevel: 'application',
    representations: ['diagram', 'manipulative'],
  },
  {
    id: 'q-002',
    type: 'multiple_choice',
    content: 'Which decimal is larger: 0.7 or 0.23?',
    options: ['0.7', '0.23', 'They are equal', 'Cannot determine'],
    correctAnswer: '0.7',
    explanation:
      '0.7 is the same as 0.70, which is larger than 0.23. Compare decimals by looking at place value: tenths, hundredths, etc.',
    marks: 2,
    skillIds: ['skill-decimal-comparison'],
    misconceptionIds: ['MISC-003'],
    difficulty: 2,
    bloomsLevel: 'comprehension',
    representations: ['diagram'],
  },
  {
    id: 'q-003',
    type: 'multiple_choice',
    content: 'Is this equation true or false? 8 = 3 + 5',
    options: ['True', 'False'],
    correctAnswer: 'True',
    explanation:
      'The equals sign means both sides have the same value. 3 + 5 = 8, so 8 = 3 + 5 is also true.',
    marks: 1,
    skillIds: ['skill-algebra-equivalence'],
    misconceptionIds: ['MISC-004'],
    difficulty: 2,
    bloomsLevel: 'comprehension',
    representations: ['manipulative'],
  },
  {
    id: 'q-004',
    type: 'numeric',
    content: 'Calculate: 4 ÷ 0.5 = ?',
    correctAnswer: '8',
    explanation:
      'Dividing by 0.5 is the same as asking "how many halves are in 4?" There are 8 halves in 4.',
    marks: 3,
    skillIds: ['skill-div-fractions'],
    misconceptionIds: ['MISC-002'],
    difficulty: 3,
    bloomsLevel: 'application',
    representations: ['diagram', 'manipulative'],
  },
  {
    id: 'q-005',
    type: 'multiple_choice',
    content: 'Which fraction is larger: 1/4 or 1/8?',
    options: ['1/4', '1/8', 'They are equal'],
    correctAnswer: '1/4',
    explanation:
      '1/4 means the whole is divided into 4 parts, 1/8 means it\'s divided into 8 parts. Fewer parts means each part is larger.',
    marks: 2,
    skillIds: ['skill-fraction-comparison'],
    misconceptionIds: ['MISC-006'],
    difficulty: 2,
    bloomsLevel: 'comprehension',
    representations: ['diagram', 'manipulative'],
  },
  {
    id: 'q-006',
    type: 'true_false',
    content: 'True or False: Perimeter and area measure the same thing.',
    correctAnswer: 'False',
    explanation:
      'Perimeter measures the distance around a shape, while area measures the space inside it.',
    marks: 1,
    skillIds: ['skill-perimeter', 'skill-area'],
    misconceptionIds: ['MISC-007'],
    difficulty: 2,
    bloomsLevel: 'knowledge',
    representations: ['diagram'],
  },
  {
    id: 'q-007',
    type: 'multiple_choice',
    content: 'Simplify: 2x + 3x',
    options: ['5x', '5x²', '6x', '5'],
    correctAnswer: '5x',
    explanation:
      'When adding like terms, add the coefficients: 2x + 3x = (2 + 3)x = 5x. The variable stays the same.',
    marks: 2,
    skillIds: ['skill-like-terms'],
    misconceptionIds: ['MISC-009'],
    difficulty: 3,
    bloomsLevel: 'application',
    representations: ['manipulative'],
  },
  {
    id: 'q-008',
    type: 'numeric',
    content: 'What is 5 - 8? (Use negative numbers if needed)',
    correctAnswer: '-3',
    explanation:
      'When subtracting a larger number from a smaller one, the result is negative. 5 - 8 = -3.',
    marks: 2,
    skillIds: ['skill-negative-numbers', 'skill-integers'],
    misconceptionIds: ['MISC-005'],
    difficulty: 3,
    bloomsLevel: 'application',
    representations: ['diagram', 'manipulative'],
  },
  {
    id: 'q-009',
    type: 'multiple_choice',
    content: 'What is the probability of rolling a 3 on a standard die?',
    options: ['1/6', '3/6', '1/3', '50%'],
    correctAnswer: '1/6',
    explanation:
      'A standard die has 6 faces, and only one shows a 3. So the probability is 1 out of 6, or 1/6.',
    marks: 2,
    skillIds: ['skill-probability-basics', 'skill-theoretical-probability'],
    misconceptionIds: ['MISC-010'],
    difficulty: 2,
    bloomsLevel: 'application',
    representations: ['diagram', 'storyContext'],
  },
  {
    id: 'q-010',
    type: 'word_problem',
    content:
      'Sarah has R12.50. She buys a sandwich for R6.75. How much money does she have left?',
    correctAnswer: 'R5.75',
    explanation:
      'Subtract the cost from her total: R12.50 - R6.75 = R5.75. This involves decimal subtraction.',
    marks: 3,
    skillIds: ['skill-decimal-place-value', 'skill-g4-num-002-2'],
    misconceptionIds: [],
    difficulty: 2,
    bloomsLevel: 'application',
    representations: ['storyContext', 'diagram'],
  },
];

// Sample Assessments
export const sampleAssessments: Assessment[] = [
  {
    id: 'assess-001',
    title: 'Week 12 Diagnostic - Grade 4',
    description:
      'Comprehensive diagnostic with interactive manipulatives covering all topics',
    type: 'weekly_diagnostic',
    grade: 4,
    topics: ['topic-g4-num-003', 'topic-g4-num-004'],
    questions: sampleQuestions, // ALL 10 QUESTIONS with full manipulatives
    duration: 60,
    totalMarks: 20,
    createdBy: 'teacher-001',
    createdAt: new Date('2024-10-01'),
    published: true,
  },
  {
    id: 'assess-002',
    title: 'Decimal Numbers Assessment - Grade 5',
    description: 'Understanding decimal place value and operations',
    type: 'formative',
    grade: 5,
    topics: ['topic-g5-num-001'],
    questions: [sampleQuestions[1], sampleQuestions[7], sampleQuestions[9]],
    duration: 25,
    totalMarks: 7,
    createdBy: 'teacher-002',
    createdAt: new Date('2024-09-28'),
    published: true,
  },
  {
    id: 'assess-003',
    title: 'Algebra Basics - Grade 7',
    description: 'Introduction to algebraic expressions and equations',
    type: 'formative',
    grade: 7,
    topics: ['topic-g7-alg-001', 'topic-g6-alg-002'],
    questions: [sampleQuestions[2], sampleQuestions[6]],
    duration: 20,
    totalMarks: 3,
    createdBy: 'teacher-003',
    createdAt: new Date('2024-09-25'),
    published: true,
  },
  {
    id: 'assess-004',
    title: 'Misconception Check: Division & Fractions',
    description:
      'Targeted assessment for common misconceptions in division and fractions',
    type: 'diagnostic',
    grade: 5,
    topics: ['topic-g4-num-003', 'topic-g4-num-004'],
    questions: [sampleQuestions[0], sampleQuestions[3], sampleQuestions[4]],
    duration: 25,
    totalMarks: 7,
    createdBy: 'teacher-002',
    createdAt: new Date('2024-10-03'),
    published: false,
  },
];

// Question Templates
export const questionTemplates = [
  {
    id: 'template-mcq',
    name: 'Multiple Choice',
    type: 'multiple_choice',
    description: 'Standard multiple choice with 4 options',
    icon: '📝',
  },
  {
    id: 'template-numeric',
    name: 'Numeric Answer',
    type: 'numeric',
    description: 'Learners enter a number as answer',
    icon: '🔢',
  },
  {
    id: 'template-true-false',
    name: 'True/False',
    type: 'true_false',
    description: 'Binary choice question',
    icon: '✓✗',
  },
  {
    id: 'template-word',
    name: 'Word Problem',
    type: 'word_problem',
    description: 'Real-world application problem',
    icon: '📖',
  },
  {
    id: 'template-fill',
    name: 'Fill in the Blank',
    type: 'fill_blank',
    description: 'Complete the sentence or equation',
    icon: '___',
  },
];

// Helper functions
export function getAssessmentById(id: string): Assessment | undefined {
  return sampleAssessments.find((a) => a.id === id);
}

export function getAssessmentsByGrade(grade: number): Assessment[] {
  return sampleAssessments.filter((a) => a.grade === grade);
}

export function getAssessmentsByType(type: string): Assessment[] {
  return sampleAssessments.filter((a) => a.type === type);
}

export function getQuestionById(id: string): Question | undefined {
  return sampleQuestions.find((q) => q.id === id);
}














