export type Intervention = {
  learner: string;
  grade: string;
  misconception: string;
  status: 'pending' | 'resolved';
};

export type AssessmentPrep = {
  title: string;
  grade: string;
  focus: string;
  due: string;
};

export const interventionQueue: Intervention[] = [
  {
    learner: 'Ayanda M.',
    grade: 'Grade 7',
    misconception: 'Confuses numerator/denominator when simplifying fractions',
    status: 'pending'
  },
  {
    learner: 'Thabo K.',
    grade: 'Grade 10',
    misconception: 'Struggles to solve simultaneous linear equations',
    status: 'pending'
  },
  {
    learner: 'Naledi P.',
    grade: 'Grade 6',
    misconception: 'Misreads word problems involving area vs. perimeter',
    status: 'resolved'
  }
];

export const upcomingAssessments: AssessmentPrep[] = [
  {
    title: 'Number Patterns Diagnostic',
    grade: 'Grade 8',
    focus: 'Identify rule from sequence, extend algebraically',
    due: '2025-10-10'
  },
  {
    title: 'Geometry Quick Check',
    grade: 'Grade 5',
    focus: 'Classify triangles and calculate missing angles',
    due: '2025-10-12'
  }
];

export const classHealth = [
  {
    className: 'Grade 9A',
    mastery: 71,
    misconceptionHotspot: 'Gradient interpretation in linear graphs'
  },
  {
    className: 'Grade 11B',
    mastery: 83,
    misconceptionHotspot: 'Factorisation of quadratic expressions'
  },
  {
    className: 'Grade 4C',
    mastery: 65,
    misconceptionHotspot: 'Place value above thousands'
  }
];
