import { Misconception, MisconceptionSeverity } from '@/types';

export const misconceptions: Misconception[] = [
  {
    id: 'MISC-001',
    code: 'MISC-001',
    name: 'Multiplication Always Increases',
    description: 'Belief that multiplication always results in a larger number',
    category: 'Numbers, Operations and Relationships',
    affectedGrades: [3, 4, 5, 6],
    severity: 'medium',
    manifestations: [
      'Surprised when 0.5 × 4 = 2',
      'Thinks multiplication by fractions is impossible',
      'Confused about "times" vs "groups of"',
      'States "multiplication makes things bigger"',
    ],
    rootCause: 'Over-generalization from whole number multiplication',
    detectionPatterns: [
      'uses addition when multiplication by fraction required',
      'incorrect operation selection in word problems',
      'confusion with scaling concepts',
    ],
    remediationStrategies: [
      {
        title: 'Area Model with Fractions',
        description: 'Use rectangular area models to show multiplication by fractions visually',
        type: 'visual',
        resources: ['area-model-fractions', 'fraction-multiplication-video'],
        estimatedDuration: 20,
      },
      {
        title: 'Real-World Context',
        description: 'Connect to scenarios like "half of a group" or recipe scaling',
        type: 'real_world',
        resources: ['recipe-scaling-worksheet', 'sharing-food-activity'],
        estimatedDuration: 30,
      },
      {
        title: 'Number Line Visualization',
        description: 'Show multiplication as jumps on a number line',
        type: 'visual',
        resources: ['number-line-multiplication'],
        estimatedDuration: 15,
      },
    ],
    relatedSkillIds: ['skill-mult-fractions', 'skill-mult-decimals'],
  },
  {
    id: 'MISC-002',
    code: 'MISC-002',
    name: 'Division Always Makes Smaller',
    description: 'Belief that division always results in a smaller number',
    category: 'Numbers, Operations and Relationships',
    affectedGrades: [4, 5, 6, 7],
    severity: 'medium',
    manifestations: [
      'Surprised when 4 ÷ 0.5 = 8',
      'Confused when dividing by fractions less than 1',
      'Incorrect operation selection in word problems',
    ],
    rootCause: 'Limited exposure to division by fractions and decimals < 1',
    detectionPatterns: [
      'always expects smaller result',
      'uses multiplication instead of division',
    ],
    remediationStrategies: [
      {
        title: 'Division as "How Many Groups"',
        description: 'Show division as counting how many groups fit into a quantity',
        type: 'concrete',
        resources: ['fraction-bars', 'grouping-activity'],
        estimatedDuration: 25,
      },
      {
        title: 'Inverse Relationship',
        description: 'Explore the relationship between multiplication and division',
        type: 'worked_example',
        resources: ['mult-div-relationship-video'],
        estimatedDuration: 20,
      },
    ],
    relatedSkillIds: ['skill-div-fractions', 'skill-div-decimals'],
  },
  {
    id: 'MISC-003',
    code: 'MISC-003',
    name: 'Decimal Place Value Confusion',
    description: '0.5 is larger than 0.23 because 5 > 23',
    category: 'Numbers, Operations and Relationships',
    affectedGrades: [4, 5, 6, 7],
    severity: 'high',
    manifestations: [
      'Compares decimals by number of digits',
      'Thinks 0.7 < 0.23',
      'Adds zeros incorrectly: 0.5 + 0.23 = 0.28',
    ],
    rootCause: 'Treating decimals as separate whole numbers rather than place value',
    detectionPatterns: [
      'incorrect decimal comparison',
      'wrong ordering of decimals',
      'addition/subtraction errors with decimals',
    ],
    remediationStrategies: [
      {
        title: 'Place Value Chart',
        description: 'Use expanded place value charts to show tenths, hundredths, thousandths',
        type: 'visual',
        resources: ['decimal-place-value-chart', 'decimal-blocks'],
        estimatedDuration: 25,
      },
      {
        title: 'Number Line Ordering',
        description: 'Place decimals on a number line to visualize magnitude',
        type: 'visual',
        resources: ['decimal-number-line'],
        estimatedDuration: 20,
      },
      {
        title: 'Money Context',
        description: 'Use South African Rands and cents to understand decimal place value',
        type: 'real_world',
        resources: ['money-decimals-worksheet'],
        estimatedDuration: 30,
      },
    ],
    relatedSkillIds: ['skill-decimal-place-value', 'skill-decimal-comparison'],
  },
  {
    id: 'MISC-004',
    code: 'MISC-004',
    name: 'Equals Sign Means "Answer Is"',
    description: 'Viewing = as an operator to give an answer, not as a balance/equivalence',
    category: 'Patterns, Functions and Algebra',
    affectedGrades: [3, 4, 5, 6, 7, 8],
    severity: 'high',
    manifestations: [
      'Cannot solve 8 = 3 + ?',
      'Writes 3 + 4 = 7 + 2 = 9 (chaining)',
      'Confused by equations like 3 + 4 = 2 + 5',
    ],
    rootCause: 'Early exposure only to computation format (e.g., 3 + 4 = )',
    detectionPatterns: [
      'left-to-right evaluation only',
      'cannot interpret reversed equations',
      'chaining equals signs incorrectly',
    ],
    remediationStrategies: [
      {
        title: 'Balance Scale Model',
        description: 'Use physical or virtual balance scales to show equivalence',
        type: 'concrete',
        resources: ['balance-scale-activity', 'algebra-tiles'],
        estimatedDuration: 25,
      },
      {
        title: 'True/False Number Sentences',
        description: 'Evaluate whether equations are true or false',
        type: 'practice',
        resources: ['true-false-equations-worksheet'],
        estimatedDuration: 20,
      },
    ],
    relatedSkillIds: ['skill-algebra-equivalence', 'skill-solving-equations'],
  },
  {
    id: 'MISC-005',
    code: 'MISC-005',
    name: 'Subtraction Directionality',
    description: 'You cannot subtract a larger number from a smaller one',
    category: 'Numbers, Operations and Relationships',
    affectedGrades: [4, 5, 6, 7],
    severity: 'medium',
    manifestations: [
      'States "5 - 8 is impossible"',
      'Reverses numbers: 5 - 8 = 3',
      'Confused by negative numbers',
    ],
    rootCause: 'Limited to physical/counting model of subtraction',
    detectionPatterns: [
      'reverses minuend and subtrahend',
      'states negative results are impossible',
    ],
    remediationStrategies: [
      {
        title: 'Number Line with Negatives',
        description: 'Extend number line to include negative numbers',
        type: 'visual',
        resources: ['negative-number-line', 'thermometer-model'],
        estimatedDuration: 25,
      },
      {
        title: 'Real-World Contexts',
        description: 'Use contexts like temperature, debt, elevation',
        type: 'real_world',
        resources: ['temperature-problems', 'debt-scenarios'],
        estimatedDuration: 30,
      },
    ],
    relatedSkillIds: ['skill-negative-numbers', 'skill-integers'],
  },
  {
    id: 'MISC-006',
    code: 'MISC-006',
    name: 'Fraction Size Misconception',
    description: 'Larger denominator means larger fraction',
    category: 'Numbers, Operations and Relationships',
    affectedGrades: [4, 5, 6, 7],
    severity: 'high',
    manifestations: [
      'Believes 1/8 > 1/4 because 8 > 4',
      'Orders fractions by denominator only',
      'Confused when comparing fractions',
    ],
    rootCause: 'Overgeneralizing whole number comparison rules',
    detectionPatterns: [
      'incorrect fraction ordering',
      'denominator-only comparison',
    ],
    remediationStrategies: [
      {
        title: 'Fraction Bars Visual',
        description: 'Use fraction bars/strips to compare sizes visually',
        type: 'visual',
        resources: ['fraction-bars-set', 'fraction-wall'],
        estimatedDuration: 25,
      },
      {
        title: 'Pizza/Pie Sharing',
        description: 'Use context of sharing pizza to understand fractions',
        type: 'real_world',
        resources: ['pizza-fractions-activity'],
        estimatedDuration: 20,
      },
    ],
    relatedSkillIds: ['skill-fraction-comparison', 'skill-equivalent-fractions'],
  },
  {
    id: 'MISC-007',
    code: 'MISC-007',
    name: 'Perimeter and Area Confusion',
    description: 'Perimeter and area are the same thing or always related',
    category: 'Space and Shape (Geometry)',
    affectedGrades: [4, 5, 6, 7, 8],
    severity: 'medium',
    manifestations: [
      'Uses perimeter formula for area',
      'Thinks same perimeter means same area',
      'Adds all sides for area',
    ],
    rootCause: 'Insufficient understanding of what each measurement represents',
    detectionPatterns: [
      'formula confusion',
      'incorrect application of formulas',
    ],
    remediationStrategies: [
      {
        title: 'Grid Paper Exploration',
        description: 'Draw different shapes with same perimeter but different areas',
        type: 'concrete',
        resources: ['grid-paper-activity', 'geoboard'],
        estimatedDuration: 30,
      },
      {
        title: 'Real-World Applications',
        description: 'Fencing vs painting scenarios',
        type: 'real_world',
        resources: ['perimeter-area-word-problems'],
        estimatedDuration: 25,
      },
    ],
    relatedSkillIds: ['skill-perimeter', 'skill-area'],
  },
  {
    id: 'MISC-008',
    code: 'MISC-008',
    name: 'Variable as Unknown Specific',
    description: 'Letters in algebra represent specific single-digit numbers',
    category: 'Patterns, Functions and Algebra',
    affectedGrades: [6, 7, 8, 9],
    severity: 'high',
    manifestations: [
      'Believes x can only be one value',
      'Confused by expressions like 2x + 3x',
      'Cannot work with variables as generalizations',
    ],
    rootCause: 'Early introduction only as "find x" problems',
    detectionPatterns: [
      'tries to find specific value immediately',
      'cannot manipulate expressions',
    ],
    remediationStrategies: [
      {
        title: 'Function Machines',
        description: 'Use function machines to show variables as inputs',
        type: 'visual',
        resources: ['function-machine-activity'],
        estimatedDuration: 25,
      },
      {
        title: 'Pattern Generalization',
        description: 'Start with number patterns and generalize with variables',
        type: 'practice',
        resources: ['pattern-to-algebra-worksheet'],
        estimatedDuration: 30,
      },
    ],
    relatedSkillIds: ['skill-algebra-variables', 'skill-expressions'],
  },
  {
    id: 'MISC-009',
    code: 'MISC-009',
    name: 'Concatenation in Algebra',
    description: '2x + 3x = 5x² (treating as concatenation)',
    category: 'Patterns, Functions and Algebra',
    affectedGrades: [7, 8, 9],
    severity: 'critical',
    manifestations: [
      'Writes 2x + 3x = 5x²',
      'Combines coefficients and powers incorrectly',
      'Treats algebraic expressions like numbers to concatenate',
    ],
    rootCause: 'Misunderstanding of algebraic notation and operations',
    detectionPatterns: [
      'incorrect combining of like terms',
      'power errors in simplification',
    ],
    remediationStrategies: [
      {
        title: 'Algebra Tiles',
        description: 'Use algebra tiles to show like terms physically',
        type: 'concrete',
        resources: ['algebra-tiles-set', 'virtual-algebra-tiles'],
        estimatedDuration: 30,
      },
      {
        title: 'Worked Examples',
        description: 'Step-by-step simplification of expressions',
        type: 'worked_example',
        resources: ['simplifying-expressions-examples'],
        estimatedDuration: 25,
      },
    ],
    relatedSkillIds: ['skill-like-terms', 'skill-simplifying-expressions'],
  },
  {
    id: 'MISC-010',
    code: 'MISC-010',
    name: 'Probability Greater Than One',
    description: 'Believing probability can be greater than 1 or expressed as percentages >100%',
    category: 'Data Handling',
    affectedGrades: [6, 7, 8, 9],
    severity: 'medium',
    manifestations: [
      'States probability as 150%',
      'Adds probabilities incorrectly',
      'Confuses probability with frequency',
    ],
    rootCause: 'Confusion between probability, frequency, and percentages',
    detectionPatterns: [
      'probability values > 1',
      'incorrect probability calculations',
    ],
    remediationStrategies: [
      {
        title: 'Probability Scale',
        description: 'Use 0-1 scale visualization',
        type: 'visual',
        resources: ['probability-scale-poster', 'likelihood-line'],
        estimatedDuration: 20,
      },
      {
        title: 'Hands-On Experiments',
        description: 'Conduct experiments with dice, coins, spinners',
        type: 'concrete',
        resources: ['probability-experiment-kit'],
        estimatedDuration: 35,
      },
    ],
    relatedSkillIds: ['skill-probability-basics', 'skill-theoretical-probability'],
  },
];

// Helper function to get misconceptions by grade
export function getMisconceptionsByGrade(grade: number): Misconception[] {
  return misconceptions.filter((misc) => misc.affectedGrades.includes(grade));
}

// Helper function to get misconceptions by severity
export function getMisconceptionsBySeverity(severity: MisconceptionSeverity): Misconception[] {
  return misconceptions.filter((misc) => misc.severity === severity);
}

// Helper function to get misconceptions by category
export function getMisconceptionsByStrand(strand: string): Misconception[] {
  return misconceptions.filter((misc) => misc.category === strand);
}















