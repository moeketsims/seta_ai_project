import { CurriculumTopic, Skill, MathematicsStrand } from '@/types';

export const curriculumTopics: CurriculumTopic[] = [
  // Grade 4 - Numbers, Operations and Relationships
  {
    id: 'topic-g4-num-001',
    name: 'Whole Numbers',
    description: 'Understanding and working with whole numbers up to 10,000',
    grade: 4,
    strand: 'Numbers, Operations and Relationships',
    learningOutcomes: [
      'Count forwards and backwards in 1s, 10s, 100s, and 1000s',
      'Recognize place value of digits in 4-digit numbers',
      'Order and compare numbers up to 10,000',
      'Round off to the nearest 10, 100, or 1000',
    ],
    skills: [
      {
        id: 'skill-g4-num-001-1',
        name: 'Place Value (4-digit)',
        description: 'Identify place value of digits in numbers up to 9999',
        topicId: 'topic-g4-num-001',
        prerequisites: [],
        difficulty: 2,
        bloomsLevel: 'knowledge',
      },
      {
        id: 'skill-g4-num-001-2',
        name: 'Ordering Numbers',
        description: 'Order and compare numbers up to 10,000',
        topicId: 'topic-g4-num-001',
        prerequisites: ['skill-g4-num-001-1'],
        difficulty: 2,
        bloomsLevel: 'comprehension',
      },
      {
        id: 'skill-g4-num-001-3',
        name: 'Rounding',
        description: 'Round numbers to nearest 10, 100, 1000',
        topicId: 'topic-g4-num-001',
        prerequisites: ['skill-g4-num-001-1'],
        difficulty: 3,
        bloomsLevel: 'application',
      },
    ],
  },
  {
    id: 'topic-g4-num-002',
    name: 'Addition and Subtraction',
    description: 'Add and subtract whole numbers up to 4 digits',
    grade: 4,
    strand: 'Numbers, Operations and Relationships',
    learningOutcomes: [
      'Add and subtract numbers up to 4 digits',
      'Use column method for addition and subtraction',
      'Solve word problems involving addition and subtraction',
      'Estimate answers by rounding',
    ],
    skills: [
      {
        id: 'skill-g4-num-002-1',
        name: 'Multi-digit Addition',
        description: 'Add numbers up to 4 digits using column method',
        topicId: 'topic-g4-num-002',
        prerequisites: ['skill-g4-num-001-1'],
        difficulty: 2,
        bloomsLevel: 'application',
      },
      {
        id: 'skill-g4-num-002-2',
        name: 'Multi-digit Subtraction',
        description: 'Subtract numbers up to 4 digits with borrowing',
        topicId: 'topic-g4-num-002',
        prerequisites: ['skill-g4-num-001-1'],
        difficulty: 3,
        bloomsLevel: 'application',
      },
    ],
  },
  {
    id: 'topic-g4-num-003',
    name: 'Multiplication and Division',
    description: 'Multiplication tables and division with remainders',
    grade: 4,
    strand: 'Numbers, Operations and Relationships',
    learningOutcomes: [
      'Know multiplication tables to 10',
      'Multiply 2-digit by 1-digit numbers',
      'Divide with remainders',
      'Solve word problems involving multiplication and division',
    ],
    skills: [
      {
        id: 'skill-mult-fractions',
        name: 'Multiplication Tables',
        description: 'Recall multiplication facts up to 10 × 10',
        topicId: 'topic-g4-num-003',
        prerequisites: [],
        difficulty: 2,
        bloomsLevel: 'knowledge',
      },
      {
        id: 'skill-g4-num-003-2',
        name: '2-digit Multiplication',
        description: 'Multiply 2-digit by 1-digit numbers',
        topicId: 'topic-g4-num-003',
        prerequisites: ['skill-mult-fractions'],
        difficulty: 3,
        bloomsLevel: 'application',
      },
      {
        id: 'skill-div-fractions',
        name: 'Division with Remainders',
        description: 'Divide and express remainder',
        topicId: 'topic-g4-num-003',
        prerequisites: ['skill-mult-fractions'],
        difficulty: 3,
        bloomsLevel: 'application',
      },
    ],
  },
  {
    id: 'topic-g4-num-004',
    name: 'Fractions',
    description: 'Introduction to fractions and basic operations',
    grade: 4,
    strand: 'Numbers, Operations and Relationships',
    learningOutcomes: [
      'Recognize and describe halves, thirds, quarters, fifths, eighths, tenths',
      'Order and compare fractions',
      'Add and subtract fractions with same denominators',
    ],
    skills: [
      {
        id: 'skill-fraction-comparison',
        name: 'Fraction Recognition',
        description: 'Identify and name common fractions',
        topicId: 'topic-g4-num-004',
        prerequisites: [],
        difficulty: 2,
        bloomsLevel: 'knowledge',
      },
      {
        id: 'skill-equivalent-fractions',
        name: 'Equivalent Fractions',
        description: 'Find and identify equivalent fractions',
        topicId: 'topic-g4-num-004',
        prerequisites: ['skill-fraction-comparison'],
        difficulty: 3,
        bloomsLevel: 'comprehension',
      },
    ],
  },

  // Grade 5 - Numbers, Operations and Relationships
  {
    id: 'topic-g5-num-001',
    name: 'Decimal Fractions',
    description: 'Understanding and working with decimal fractions',
    grade: 5,
    strand: 'Numbers, Operations and Relationships',
    learningOutcomes: [
      'Count in decimals',
      'Recognize decimal place value (tenths and hundredths)',
      'Order and compare decimal fractions',
      'Round off decimal fractions',
    ],
    skills: [
      {
        id: 'skill-decimal-place-value',
        name: 'Decimal Place Value',
        description: 'Understand place value of tenths and hundredths',
        topicId: 'topic-g5-num-001',
        prerequisites: ['skill-g4-num-001-1'],
        difficulty: 3,
        bloomsLevel: 'comprehension',
      },
      {
        id: 'skill-decimal-comparison',
        name: 'Comparing Decimals',
        description: 'Order and compare decimal numbers',
        topicId: 'topic-g5-num-001',
        prerequisites: ['skill-decimal-place-value'],
        difficulty: 3,
        bloomsLevel: 'application',
      },
    ],
  },

  // Grade 6 - Algebra
  {
    id: 'topic-g6-alg-001',
    name: 'Number Patterns',
    description: 'Identifying and extending number patterns',
    grade: 6,
    strand: 'Patterns, Functions and Algebra',
    learningOutcomes: [
      'Identify and extend number patterns',
      'Describe the rule for patterns',
      'Use variables to express generalizations',
    ],
    skills: [
      {
        id: 'skill-algebra-variables',
        name: 'Pattern Recognition',
        description: 'Identify patterns in number sequences',
        topicId: 'topic-g6-alg-001',
        prerequisites: [],
        difficulty: 2,
        bloomsLevel: 'analysis',
      },
      {
        id: 'skill-expressions',
        name: 'Pattern Generalization',
        description: 'Express pattern rules using variables',
        topicId: 'topic-g6-alg-001',
        prerequisites: ['skill-algebra-variables'],
        difficulty: 3,
        bloomsLevel: 'synthesis',
      },
    ],
  },
  {
    id: 'topic-g6-alg-002',
    name: 'Algebraic Expressions',
    description: 'Introduction to algebraic expressions',
    grade: 6,
    strand: 'Patterns, Functions and Algebra',
    learningOutcomes: [
      'Understand variables as unknowns',
      'Write algebraic expressions',
      'Simplify simple algebraic expressions',
    ],
    skills: [
      {
        id: 'skill-algebra-equivalence',
        name: 'Understanding Variables',
        description: 'Use letters to represent unknown values',
        topicId: 'topic-g6-alg-002',
        prerequisites: [],
        difficulty: 3,
        bloomsLevel: 'comprehension',
      },
      {
        id: 'skill-like-terms',
        name: 'Combining Like Terms',
        description: 'Simplify expressions by combining like terms',
        topicId: 'topic-g6-alg-002',
        prerequisites: ['skill-algebra-equivalence'],
        difficulty: 4,
        bloomsLevel: 'application',
      },
    ],
  },

  // Grade 7 - Algebra
  {
    id: 'topic-g7-alg-001',
    name: 'Equations',
    description: 'Solving simple algebraic equations',
    grade: 7,
    strand: 'Patterns, Functions and Algebra',
    learningOutcomes: [
      'Solve equations with one variable',
      'Understand equivalence and balance',
      'Apply equations to solve problems',
    ],
    skills: [
      {
        id: 'skill-solving-equations',
        name: 'Solving Simple Equations',
        description: 'Solve equations of the form x + a = b',
        topicId: 'topic-g7-alg-001',
        prerequisites: ['skill-algebra-equivalence'],
        difficulty: 3,
        bloomsLevel: 'application',
      },
      {
        id: 'skill-simplifying-expressions',
        name: 'Multi-step Equations',
        description: 'Solve equations requiring multiple steps',
        topicId: 'topic-g7-alg-001',
        prerequisites: ['skill-solving-equations', 'skill-like-terms'],
        difficulty: 4,
        bloomsLevel: 'application',
      },
    ],
  },
  {
    id: 'topic-g7-num-001',
    name: 'Integers',
    description: 'Working with negative numbers',
    grade: 7,
    strand: 'Numbers, Operations and Relationships',
    learningOutcomes: [
      'Understand negative numbers',
      'Add and subtract integers',
      'Use integers in real-world contexts',
    ],
    skills: [
      {
        id: 'skill-negative-numbers',
        name: 'Understanding Integers',
        description: 'Recognize and order negative numbers',
        topicId: 'topic-g7-num-001',
        prerequisites: [],
        difficulty: 3,
        bloomsLevel: 'comprehension',
      },
      {
        id: 'skill-integers',
        name: 'Integer Operations',
        description: 'Add and subtract integers',
        topicId: 'topic-g7-num-001',
        prerequisites: ['skill-negative-numbers'],
        difficulty: 4,
        bloomsLevel: 'application',
      },
    ],
  },

  // Grade 4-7 - Geometry
  {
    id: 'topic-g5-geo-001',
    name: 'Perimeter and Area',
    description: 'Calculate perimeter and area of 2D shapes',
    grade: 5,
    strand: 'Space and Shape (Geometry)',
    learningOutcomes: [
      'Calculate perimeter of rectangles and squares',
      'Calculate area of rectangles and squares',
      'Solve problems involving perimeter and area',
    ],
    skills: [
      {
        id: 'skill-perimeter',
        name: 'Calculating Perimeter',
        description: 'Find perimeter of rectangles and squares',
        topicId: 'topic-g5-geo-001',
        prerequisites: [],
        difficulty: 2,
        bloomsLevel: 'application',
      },
      {
        id: 'skill-area',
        name: 'Calculating Area',
        description: 'Find area of rectangles and squares',
        topicId: 'topic-g5-geo-001',
        prerequisites: ['skill-mult-fractions'],
        difficulty: 3,
        bloomsLevel: 'application',
      },
    ],
  },

  // Grade 7 - Data Handling
  {
    id: 'topic-g7-data-001',
    name: 'Probability',
    description: 'Basic probability concepts',
    grade: 7,
    strand: 'Data Handling',
    learningOutcomes: [
      'Understand theoretical probability',
      'Calculate simple probabilities',
      'Express probability as fractions, decimals, and percentages',
    ],
    skills: [
      {
        id: 'skill-probability-basics',
        name: 'Probability Concepts',
        description: 'Understand likelihood and probability scale (0-1)',
        topicId: 'topic-g7-data-001',
        prerequisites: [],
        difficulty: 3,
        bloomsLevel: 'comprehension',
      },
      {
        id: 'skill-theoretical-probability',
        name: 'Calculating Probability',
        description: 'Calculate theoretical probability of simple events',
        topicId: 'topic-g7-data-001',
        prerequisites: ['skill-probability-basics', 'skill-fraction-comparison'],
        difficulty: 3,
        bloomsLevel: 'application',
      },
    ],
  },
];

// Helper functions
export function getTopicsByGrade(grade: number): CurriculumTopic[] {
  return curriculumTopics.filter((topic) => topic.grade === grade);
}

export function getTopicsByStrand(strand: MathematicsStrand): CurriculumTopic[] {
  return curriculumTopics.filter((topic) => topic.strand === strand);
}

export function getTopicById(id: string): CurriculumTopic | undefined {
  return curriculumTopics.find((topic) => topic.id === id);
}

export function getAllSkills(): Skill[] {
  return curriculumTopics.flatMap((topic) => topic.skills);
}

export function getSkillById(id: string): Skill | undefined {
  const allSkills = getAllSkills();
  return allSkills.find((skill) => skill.id === id);
}

export function getPrerequisiteSkills(skillId: string): Skill[] {
  const skill = getSkillById(skillId);
  if (!skill) return [];
  
  return skill.prerequisites
    .map((prereqId) => getSkillById(prereqId))
    .filter((s): s is Skill => s !== undefined);
}

// Mathematics Strands
export const mathematicsStrands: MathematicsStrand[] = [
  'Numbers, Operations and Relationships',
  'Patterns, Functions and Algebra',
  'Space and Shape (Geometry)',
  'Measurement',
  'Data Handling',
];

// Grade Levels
export const gradeLevels = [
  { id: 'grade-r', name: 'Grade R', number: 0, phase: 'Foundation' },
  { id: 'grade-1', name: 'Grade 1', number: 1, phase: 'Foundation' },
  { id: 'grade-2', name: 'Grade 2', number: 2, phase: 'Foundation' },
  { id: 'grade-3', name: 'Grade 3', number: 3, phase: 'Foundation' },
  { id: 'grade-4', name: 'Grade 4', number: 4, phase: 'Intermediate' },
  { id: 'grade-5', name: 'Grade 5', number: 5, phase: 'Intermediate' },
  { id: 'grade-6', name: 'Grade 6', number: 6, phase: 'Intermediate' },
  { id: 'grade-7', name: 'Grade 7', number: 7, phase: 'Senior' },
  { id: 'grade-8', name: 'Grade 8', number: 8, phase: 'Senior' },
  { id: 'grade-9', name: 'Grade 9', number: 9, phase: 'Senior' },
  { id: 'grade-10', name: 'Grade 10', number: 10, phase: 'FET' },
  { id: 'grade-11', name: 'Grade 11', number: 11, phase: 'FET' },
  { id: 'grade-12', name: 'Grade 12', number: 12, phase: 'FET' },
];















