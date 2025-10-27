import type {
  WeeklyDiagnosticData,
  QuestionAnalysis,
} from '../components/analytics/DiagnosticDeepDive';
import type { MisconceptionTrend } from '../components/analytics/MisconceptionDashboard';
import type { InterventionData } from '../components/analytics/InterventionEffectiveness';
import type {
  LearningPathway,
  SkillNode,
} from '../components/analytics/SkillProgressionMap';
import type { AtRiskLearner } from '../components/analytics/PredictiveRiskAnalytics';

// ============================================================================
// DIAGNOSTIC DEEP DIVE MOCK DATA
// ============================================================================

const sampleQuestions: QuestionAnalysis[] = [
  {
    questionId: 'q-001',
    content: 'What is 0.5 × 4?',
    correctRate: 45,
    averageTime: 85,
    misconceptionTriggered: {
      id: 'MISC-001',
      name: 'Multiplication Always Increases',
      frequency: 18,
    },
    skillsTested: ['Decimal Multiplication', 'Fractional Thinking'],
    commonWrongAnswers: [
      {
        answer: '20',
        percentage: 32,
        possibleReasoning: 'Treating 0.5 as 5, multiplying 5 × 4',
      },
      {
        answer: '4.5',
        percentage: 15,
        possibleReasoning: 'Adding 0.5 to 4 instead of multiplying',
      },
      {
        answer: '0.2',
        percentage: 8,
        possibleReasoning: 'Dividing instead of multiplying',
      },
    ],
  },
  {
    questionId: 'q-002',
    content: 'Which decimal is larger: 0.7 or 0.23?',
    correctRate: 62,
    averageTime: 45,
    misconceptionTriggered: {
      id: 'MISC-003',
      name: 'Longer Decimal = Larger Number',
      frequency: 12,
    },
    skillsTested: ['Decimal Place Value', 'Number Comparison'],
    commonWrongAnswers: [
      {
        answer: '0.23',
        percentage: 28,
        possibleReasoning: 'Thinking 23 > 7, ignoring place value',
      },
      {
        answer: 'They are equal',
        percentage: 10,
        possibleReasoning: 'Confusion about decimal equivalence',
      },
    ],
  },
  {
    questionId: 'q-003',
    content: 'Is this equation true: 8 = 3 + 5?',
    correctRate: 78,
    averageTime: 35,
    misconceptionTriggered: {
      id: 'MISC-004',
      name: 'Equals Sign Means "Answer"',
      frequency: 7,
    },
    skillsTested: ['Algebraic Thinking', 'Equation Understanding'],
    commonWrongAnswers: [
      {
        answer: 'False',
        percentage: 22,
        possibleReasoning: 'Thinking equals sign only goes at the end of calculations',
      },
    ],
  },
  {
    questionId: 'q-004',
    content: 'Calculate: 4 ÷ 0.5',
    correctRate: 38,
    averageTime: 92,
    misconceptionTriggered: {
      id: 'MISC-002',
      name: 'Division Always Makes Smaller',
      frequency: 25,
    },
    skillsTested: ['Division with Decimals', 'Inverse Operations'],
    commonWrongAnswers: [
      {
        answer: '2',
        percentage: 42,
        possibleReasoning: 'Thinking division must result in smaller number',
      },
      {
        answer: '0.8',
        percentage: 15,
        possibleReasoning: 'Incorrectly performing decimal division',
      },
    ],
  },
  {
    questionId: 'q-005',
    content: 'Which fraction is larger: 1/4 or 1/8?',
    correctRate: 71,
    averageTime: 48,
    misconceptionTriggered: {
      id: 'MISC-006',
      name: 'Larger Denominator = Larger Fraction',
      frequency: 9,
    },
    skillsTested: ['Fraction Comparison', 'Part-Whole Understanding'],
    commonWrongAnswers: [
      {
        answer: '1/8',
        percentage: 24,
        possibleReasoning: 'Thinking 8 > 4, so 1/8 > 1/4',
      },
    ],
  },
];

export const mockWeeklyDiagnostic: WeeklyDiagnosticData = {
  assessmentId: 'assess-week12-g4',
  title: 'Week 12 Diagnostic - Decimal Operations',
  weekNumber: 12,
  grade: 4,
  completionRate: 94,
  averageScore: 61,
  questions: sampleQuestions,
  participantCount: 32,
  dateCompleted: new Date('2025-10-18'),
};

// ============================================================================
// MISCONCEPTION DASHBOARD MOCK DATA
// ============================================================================

export const mockMisconceptions: MisconceptionTrend[] = [
  {
    misconceptionId: 'MISC-001',
    name: 'Multiplication Always Increases',
    description:
      'Belief that multiplying always results in a larger number, not understanding multiplication by fractions/decimals less than 1.',
    category: 'multiplication',
    weeklyOccurrences: [
      { week: 1, count: 15, affectedLearners: 12 },
      { week: 2, count: 18, affectedLearners: 14 },
      { week: 3, count: 22, affectedLearners: 17 },
      { week: 4, count: 20, affectedLearners: 16 },
      { week: 5, count: 19, affectedLearners: 15 },
      { week: 6, count: 16, affectedLearners: 13 },
      { week: 7, count: 14, affectedLearners: 11 },
      { week: 8, count: 12, affectedLearners: 10 },
      { week: 9, count: 10, affectedLearners: 8 },
      { week: 10, count: 8, affectedLearners: 7 },
      { week: 11, count: 6, affectedLearners: 5 },
      { week: 12, count: 5, affectedLearners: 4 },
    ],
    totalAffected: 23,
    interventionsCreated: 4,
    resolutionRate: 67,
    averageTimeToResolve: 21,
    severity: 'high',
    prerequisiteSkills: ['Understanding of fractions', 'Decimal place value'],
    recommendedInterventions: [
      {
        type: 'manipulative',
        description:
          'Use fraction bars and counters to visualize 0.5 × 4 as "half of 4"',
      },
      {
        type: 'video',
        description:
          'Watch conceptual video explaining multiplication as "groups of" vs "making larger"',
      },
      {
        type: 'practice',
        description:
          'Targeted practice with fractions less than 1 in real-world contexts',
      },
    ],
  },
  {
    misconceptionId: 'MISC-002',
    name: 'Division Always Makes Smaller',
    description:
      'Thinking that division always results in a smaller quotient, not understanding division by fractions less than 1.',
    category: 'division',
    weeklyOccurrences: [
      { week: 1, count: 12, affectedLearners: 10 },
      { week: 2, count: 14, affectedLearners: 11 },
      { week: 3, count: 16, affectedLearners: 13 },
      { week: 4, count: 18, affectedLearners: 14 },
      { week: 5, count: 20, affectedLearners: 16 },
      { week: 6, count: 22, affectedLearners: 17 },
      { week: 7, count: 20, affectedLearners: 16 },
      { week: 8, count: 18, affectedLearners: 14 },
      { week: 9, count: 15, affectedLearners: 12 },
      { week: 10, count: 13, affectedLearners: 10 },
      { week: 11, count: 10, affectedLearners: 8 },
      { week: 12, count: 8, affectedLearners: 7 },
    ],
    totalAffected: 28,
    interventionsCreated: 3,
    resolutionRate: 54,
    averageTimeToResolve: 28,
    severity: 'critical',
    prerequisiteSkills: ['Division basics', 'Fractional understanding'],
    recommendedInterventions: [
      {
        type: 'one-on-one',
        description: 'Individual tutoring on inverse operations and division meaning',
      },
      {
        type: 'manipulative',
        description: 'Physical demonstration: "How many halves are in 4?"',
      },
      {
        type: 'practice',
        description: 'Scaffolded problems starting with division by unit fractions',
      },
    ],
  },
  {
    misconceptionId: 'MISC-003',
    name: 'Longer Decimal = Larger Number',
    description:
      'Comparing decimals by the number of digits rather than place value (e.g., 0.23 > 0.7 because 23 > 7).',
    category: 'decimals',
    weeklyOccurrences: [
      { week: 1, count: 10, affectedLearners: 8 },
      { week: 2, count: 11, affectedLearners: 9 },
      { week: 3, count: 12, affectedLearners: 10 },
      { week: 4, count: 14, affectedLearners: 11 },
      { week: 5, count: 13, affectedLearners: 11 },
      { week: 6, count: 12, affectedLearners: 10 },
      { week: 7, count: 10, affectedLearners: 8 },
      { week: 8, count: 9, affectedLearners: 7 },
      { week: 9, count: 7, affectedLearners: 6 },
      { week: 10, count: 6, affectedLearners: 5 },
      { week: 11, count: 5, affectedLearners: 4 },
      { week: 12, count: 4, affectedLearners: 3 },
    ],
    totalAffected: 18,
    interventionsCreated: 5,
    resolutionRate: 72,
    averageTimeToResolve: 18,
    severity: 'medium',
    prerequisiteSkills: ['Decimal place value', 'Number line understanding'],
    recommendedInterventions: [
      {
        type: 'manipulative',
        description: 'Use decimal grids to visualize tenths vs hundredths',
      },
      {
        type: 'practice',
        description: 'Practice ordering decimals with visual number lines',
      },
    ],
  },
  {
    misconceptionId: 'MISC-004',
    name: 'Equals Sign Means "Answer"',
    description:
      'Viewing the equals sign as a command to "do something" rather than a relation showing both sides are equal.',
    category: 'algebra',
    weeklyOccurrences: [
      { week: 1, count: 8, affectedLearners: 7 },
      { week: 2, count: 9, affectedLearners: 8 },
      { week: 3, count: 10, affectedLearners: 8 },
      { week: 4, count: 9, affectedLearners: 7 },
      { week: 5, count: 8, affectedLearners: 7 },
      { week: 6, count: 7, affectedLearners: 6 },
      { week: 7, count: 6, affectedLearners: 5 },
      { week: 8, count: 5, affectedLearners: 4 },
      { week: 9, count: 4, affectedLearners: 3 },
      { week: 10, count: 3, affectedLearners: 3 },
      { week: 11, count: 2, affectedLearners: 2 },
      { week: 12, count: 2, affectedLearners: 2 },
    ],
    totalAffected: 12,
    interventionsCreated: 2,
    resolutionRate: 83,
    averageTimeToResolve: 14,
    severity: 'low',
    prerequisiteSkills: ['Basic arithmetic', 'Equation understanding'],
    recommendedInterventions: [
      {
        type: 'manipulative',
        description: 'Use balance scales to show equality on both sides',
      },
      {
        type: 'practice',
        description: 'True/false equation practice with non-standard formats',
      },
    ],
  },
  {
    misconceptionId: 'MISC-006',
    name: 'Larger Denominator = Larger Fraction',
    description:
      'Thinking that fractions with larger denominators are larger (e.g., 1/8 > 1/4 because 8 > 4).',
    category: 'fractions',
    weeklyOccurrences: [
      { week: 1, count: 6, affectedLearners: 5 },
      { week: 2, count: 7, affectedLearners: 6 },
      { week: 3, count: 8, affectedLearners: 7 },
      { week: 4, count: 9, affectedLearners: 8 },
      { week: 5, count: 10, affectedLearners: 8 },
      { week: 6, count: 9, affectedLearners: 7 },
      { week: 7, count: 8, affectedLearners: 7 },
      { week: 8, count: 7, affectedLearners: 6 },
      { week: 9, count: 6, affectedLearners: 5 },
      { week: 10, count: 5, affectedLearners: 4 },
      { week: 11, count: 4, affectedLearners: 3 },
      { week: 12, count: 3, affectedLearners: 3 },
    ],
    totalAffected: 15,
    interventionsCreated: 3,
    resolutionRate: 78,
    averageTimeToResolve: 16,
    severity: 'medium',
    prerequisiteSkills: ['Part-whole understanding', 'Fraction basics'],
    recommendedInterventions: [
      {
        type: 'manipulative',
        description:
          'Cut physical pizzas/circles into different-sized pieces to compare',
      },
      {
        type: 'video',
        description: 'Visual explanation of how more pieces = smaller pieces',
      },
    ],
  },
];

// ============================================================================
// INTERVENTION EFFECTIVENESS MOCK DATA
// ============================================================================

export const mockInterventions: InterventionData[] = [
  {
    interventionId: 'int-001',
    name: 'Decimal Multiplication Bootcamp',
    type: 'manipulative',
    targetMisconception: 'Multiplication Always Increases',
    targetSkill: 'Decimal Multiplication',
    created: new Date('2025-09-15'),
    duration: 14,
    learnersEnrolled: 23,
    learnersCompleted: 21,
    beforeMetrics: {
      averageScore: 42,
      masteryLevel: 38,
      confidenceScore: 35,
    },
    afterMetrics: {
      averageScore: 78,
      masteryLevel: 72,
      confidenceScore: 68,
    },
    improvement: {
      scoreGain: 36,
      masteryGain: 34,
      confidenceGain: 33,
    },
    effectiveness: 'excellent',
    costPerLearner: 15.5,
    timeInvestment: 4.5,
    teacherFeedback:
      'The hands-on manipulatives made a huge difference. Learners could physically see that 0.5 × 4 means "half of 4 groups". Breakthrough moment!',
    learnerSatisfaction: 4.6,
    recommendationScore: 9.2,
  },
  {
    interventionId: 'int-002',
    name: 'Division by Fractions Remediation',
    type: 'one-on-one',
    targetMisconception: 'Division Always Makes Smaller',
    targetSkill: 'Division with Fractions',
    created: new Date('2025-09-20'),
    duration: 21,
    learnersEnrolled: 15,
    learnersCompleted: 14,
    beforeMetrics: {
      averageScore: 35,
      masteryLevel: 32,
      confidenceScore: 28,
    },
    afterMetrics: {
      averageScore: 65,
      masteryLevel: 61,
      confidenceScore: 58,
    },
    improvement: {
      scoreGain: 30,
      masteryGain: 29,
      confidenceGain: 30,
    },
    effectiveness: 'good',
    costPerLearner: 45.0,
    timeInvestment: 8.0,
    teacherFeedback:
      'One-on-one sessions allowed me to address individual misconceptions. Effective but time-intensive.',
    learnerSatisfaction: 4.3,
    recommendationScore: 7.8,
  },
  {
    interventionId: 'int-003',
    name: 'Decimal Place Value Videos',
    type: 'video',
    targetMisconception: 'Longer Decimal = Larger Number',
    targetSkill: 'Decimal Comparison',
    created: new Date('2025-09-25'),
    duration: 7,
    learnersEnrolled: 18,
    learnersCompleted: 18,
    beforeMetrics: {
      averageScore: 52,
      masteryLevel: 48,
      confidenceScore: 50,
    },
    afterMetrics: {
      averageScore: 76,
      masteryLevel: 73,
      confidenceScore: 71,
    },
    improvement: {
      scoreGain: 24,
      masteryGain: 25,
      confidenceGain: 21,
    },
    effectiveness: 'good',
    costPerLearner: 5.0,
    timeInvestment: 2.0,
    teacherFeedback:
      'Very cost-effective and learners could watch at their own pace. Would recommend for conceptual understanding.',
    learnerSatisfaction: 4.1,
    recommendationScore: 8.3,
  },
  {
    interventionId: 'int-004',
    name: 'Algebra Balance Scale Workshop',
    type: 'group-work',
    targetMisconception: 'Equals Sign Means Answer',
    targetSkill: 'Algebraic Thinking',
    created: new Date('2025-10-01'),
    duration: 10,
    learnersEnrolled: 12,
    learnersCompleted: 11,
    beforeMetrics: {
      averageScore: 58,
      masteryLevel: 55,
      confidenceScore: 52,
    },
    afterMetrics: {
      averageScore: 82,
      masteryLevel: 79,
      confidenceScore: 76,
    },
    improvement: {
      scoreGain: 24,
      masteryGain: 24,
      confidenceGain: 24,
    },
    effectiveness: 'excellent',
    costPerLearner: 12.0,
    timeInvestment: 3.5,
    teacherFeedback:
      'Balance scales were perfect for showing equality. Learners loved the collaborative aspect.',
    learnerSatisfaction: 4.7,
    recommendationScore: 9.0,
  },
  {
    interventionId: 'int-005',
    name: 'Fraction Comparison Practice Drills',
    type: 'practice',
    targetMisconception: 'Larger Denominator = Larger Fraction',
    targetSkill: 'Fraction Comparison',
    created: new Date('2025-10-05'),
    duration: 14,
    learnersEnrolled: 20,
    learnersCompleted: 17,
    beforeMetrics: {
      averageScore: 48,
      masteryLevel: 45,
      confidenceScore: 42,
    },
    afterMetrics: {
      averageScore: 62,
      masteryLevel: 59,
      confidenceScore: 56,
    },
    improvement: {
      scoreGain: 14,
      masteryGain: 14,
      confidenceGain: 14,
    },
    effectiveness: 'moderate',
    costPerLearner: 3.0,
    timeInvestment: 5.0,
    teacherFeedback:
      'Practice helped but without conceptual foundation first, gains were modest. Should combine with manipulatives.',
    learnerSatisfaction: 3.4,
    recommendationScore: 6.2,
  },
];

// ============================================================================
// SKILL PROGRESSION MAP MOCK DATA
// ============================================================================

const sampleSkillNodes: SkillNode[] = [
  {
    skillId: 'skill-001',
    name: 'Number Recognition',
    topic: 'Numbers & Operations',
    masteryLevel: 85,
    prerequisites: [],
    learnersAtLevel: {
      notStarted: 0,
      developing: 2,
      proficient: 8,
      mastered: 22,
    },
    averageTimeToMaster: 7,
    commonBlockers: [],
    nextSkills: ['skill-002', 'skill-003'],
  },
  {
    skillId: 'skill-002',
    name: 'Place Value (Whole Numbers)',
    topic: 'Numbers & Operations',
    masteryLevel: 78,
    prerequisites: ['skill-001'],
    learnersAtLevel: {
      notStarted: 1,
      developing: 5,
      proficient: 12,
      mastered: 14,
    },
    averageTimeToMaster: 12,
    commonBlockers: [],
    nextSkills: ['skill-004', 'skill-005'],
  },
  {
    skillId: 'skill-003',
    name: 'Addition & Subtraction Basics',
    topic: 'Numbers & Operations',
    masteryLevel: 82,
    prerequisites: ['skill-001'],
    learnersAtLevel: {
      notStarted: 0,
      developing: 3,
      proficient: 10,
      mastered: 19,
    },
    averageTimeToMaster: 10,
    commonBlockers: [],
    nextSkills: ['skill-006'],
  },
  {
    skillId: 'skill-004',
    name: 'Decimal Place Value',
    topic: 'Numbers & Operations',
    masteryLevel: 65,
    prerequisites: ['skill-002'],
    learnersAtLevel: {
      notStarted: 3,
      developing: 8,
      proficient: 14,
      mastered: 7,
    },
    averageTimeToMaster: 18,
    commonBlockers: ['MISC-003'],
    nextSkills: ['skill-007', 'skill-008'],
  },
  {
    skillId: 'skill-005',
    name: 'Fraction Basics',
    topic: 'Numbers & Operations',
    masteryLevel: 70,
    prerequisites: ['skill-002'],
    learnersAtLevel: {
      notStarted: 2,
      developing: 7,
      proficient: 15,
      mastered: 8,
    },
    averageTimeToMaster: 15,
    commonBlockers: ['MISC-006'],
    nextSkills: ['skill-009'],
  },
  {
    skillId: 'skill-006',
    name: 'Multiplication Basics',
    topic: 'Numbers & Operations',
    masteryLevel: 75,
    prerequisites: ['skill-003'],
    learnersAtLevel: {
      notStarted: 1,
      developing: 6,
      proficient: 13,
      mastered: 12,
    },
    averageTimeToMaster: 14,
    commonBlockers: [],
    nextSkills: ['skill-007'],
  },
  {
    skillId: 'skill-007',
    name: 'Decimal Multiplication',
    topic: 'Numbers & Operations',
    masteryLevel: 52,
    prerequisites: ['skill-004', 'skill-006'],
    learnersAtLevel: {
      notStarted: 5,
      developing: 12,
      proficient: 10,
      mastered: 5,
    },
    averageTimeToMaster: 21,
    commonBlockers: ['MISC-001'],
    nextSkills: ['skill-010'],
  },
  {
    skillId: 'skill-008',
    name: 'Decimal Division',
    topic: 'Numbers & Operations',
    masteryLevel: 48,
    prerequisites: ['skill-004', 'skill-006'],
    learnersAtLevel: {
      notStarted: 7,
      developing: 14,
      proficient: 8,
      mastered: 3,
    },
    averageTimeToMaster: 24,
    commonBlockers: ['MISC-002'],
    nextSkills: ['skill-010'],
  },
  {
    skillId: 'skill-009',
    name: 'Fraction Operations',
    topic: 'Numbers & Operations',
    masteryLevel: 58,
    prerequisites: ['skill-005'],
    learnersAtLevel: {
      notStarted: 4,
      developing: 10,
      proficient: 12,
      mastered: 6,
    },
    averageTimeToMaster: 19,
    commonBlockers: ['MISC-006', 'MISC-001'],
    nextSkills: ['skill-010'],
  },
  {
    skillId: 'skill-010',
    name: 'Advanced Decimal & Fraction Operations',
    topic: 'Numbers & Operations',
    masteryLevel: 42,
    prerequisites: ['skill-007', 'skill-008', 'skill-009'],
    learnersAtLevel: {
      notStarted: 10,
      developing: 15,
      proficient: 5,
      mastered: 2,
    },
    averageTimeToMaster: 28,
    commonBlockers: ['MISC-001', 'MISC-002'],
    nextSkills: [],
  },
];

export const mockLearningPathway: LearningPathway = {
  pathwayId: 'pathway-g4-numbers',
  name: 'Grade 4 - Numbers & Operations Mastery',
  description:
    'Complete pathway from basic number recognition through advanced decimal and fraction operations',
  targetGrade: 4,
  skills: sampleSkillNodes,
  completionRate: 45,
  estimatedDuration: 16,
};

// ============================================================================
// PREDICTIVE RISK ANALYTICS MOCK DATA
// ============================================================================

export const mockAtRiskLearners: AtRiskLearner[] = [
  {
    learnerId: 'learner-042',
    name: 'Thabo Mabaso',
    grade: 4,
    riskScore: 87,
    riskLevel: 'critical',
    trendDirection: 'declining',
    riskFactors: [
      {
        factor: 'Declining Performance Trend',
        weight: 35,
        description: 'Scores dropped 25% over last 4 weeks',
      },
      {
        factor: 'Low Engagement',
        weight: 28,
        description: 'Attendance at 62%, completion rate 48%',
      },
      {
        factor: 'Multiple Misconceptions',
        weight: 22,
        description: 'Struggling with 4 core misconceptions',
      },
      {
        factor: 'Prerequisite Gaps',
        weight: 15,
        description: 'Missing foundational skills in place value',
      },
    ],
    predictedOutcome: {
      nextAssessmentScore: 32,
      confidenceInterval: [25, 38],
      probabilityOfFailure: 92,
      daysUntilIntervention: 3,
    },
    recommendedActions: [
      {
        priority: 'urgent',
        action: 'Schedule immediate one-on-one diagnostic assessment',
        estimatedImpact: 25,
      },
      {
        priority: 'urgent',
        action: 'Contact guardian to discuss support plan',
        estimatedImpact: 20,
      },
      {
        priority: 'high',
        action: 'Assign foundational place value remediation pathway',
        estimatedImpact: 18,
      },
    ],
    recentPerformance: [
      { week: 5, score: 65 },
      { week: 6, score: 58 },
      { week: 7, score: 52 },
      { week: 8, score: 48 },
      { week: 9, score: 42 },
      { week: 10, score: 38 },
      { week: 11, score: 35 },
      { week: 12, score: 32 },
    ],
    engagementMetrics: {
      attendanceRate: 62,
      completionRate: 48,
      timeOnTask: 15,
      lastActive: new Date('2025-10-18'),
    },
  },
  {
    learnerId: 'learner-087',
    name: 'Zanele Ndlovu',
    grade: 4,
    riskScore: 76,
    riskLevel: 'high',
    trendDirection: 'declining',
    riskFactors: [
      {
        factor: 'Conceptual Misconceptions',
        weight: 32,
        description: 'Strong misconception about multiplication making numbers larger',
      },
      {
        factor: 'Time Management',
        weight: 25,
        description: 'Taking 2x average time per question',
      },
      {
        factor: 'Low Confidence',
        weight: 22,
        description: 'Self-reported confidence score 28/100',
      },
      {
        factor: 'Irregular Practice',
        weight: 21,
        description: 'Only 3 practice sessions in last 2 weeks',
      },
    ],
    predictedOutcome: {
      nextAssessmentScore: 42,
      confidenceInterval: [36, 48],
      probabilityOfFailure: 78,
      daysUntilIntervention: 7,
    },
    recommendedActions: [
      {
        priority: 'urgent',
        action: 'Enroll in "Decimal Multiplication Bootcamp" intervention',
        estimatedImpact: 28,
      },
      {
        priority: 'high',
        action: 'Provide manipulative-based practice materials',
        estimatedImpact: 22,
      },
      {
        priority: 'high',
        action: 'Pair with peer tutor for confidence building',
        estimatedImpact: 15,
      },
    ],
    recentPerformance: [
      { week: 5, score: 58 },
      { week: 6, score: 55 },
      { week: 7, score: 52 },
      { week: 8, score: 50 },
      { week: 9, score: 48 },
      { week: 10, score: 45 },
      { week: 11, score: 43 },
      { week: 12, score: 40 },
    ],
    engagementMetrics: {
      attendanceRate: 78,
      completionRate: 65,
      timeOnTask: 22,
      lastActive: new Date('2025-10-19'),
    },
  },
  {
    learnerId: 'learner-123',
    name: 'Lerato Mokoena',
    grade: 4,
    riskScore: 64,
    riskLevel: 'medium',
    trendDirection: 'stable',
    riskFactors: [
      {
        factor: 'Stagnant Progress',
        weight: 30,
        description: 'No improvement over last 6 weeks',
      },
      {
        factor: 'Specific Skill Gaps',
        weight: 28,
        description: 'Decimal place value understanding at 35%',
      },
      {
        factor: 'Moderate Engagement',
        weight: 22,
        description: 'Completing work but not seeking help',
      },
      {
        factor: 'Test Anxiety',
        weight: 20,
        description: 'Practice scores 15% higher than assessment scores',
      },
    ],
    predictedOutcome: {
      nextAssessmentScore: 52,
      confidenceInterval: [46, 58],
      probabilityOfFailure: 62,
      daysUntilIntervention: 14,
    },
    recommendedActions: [
      {
        priority: 'high',
        action: 'Target decimal place value with visual learning tools',
        estimatedImpact: 20,
      },
      {
        priority: 'medium',
        action: 'Implement low-stakes formative assessments to reduce anxiety',
        estimatedImpact: 15,
      },
      {
        priority: 'medium',
        action: 'Encourage participation in study group',
        estimatedImpact: 12,
      },
    ],
    recentPerformance: [
      { week: 5, score: 50 },
      { week: 6, score: 52 },
      { week: 7, score: 51 },
      { week: 8, score: 53 },
      { week: 9, score: 52 },
      { week: 10, score: 51 },
      { week: 11, score: 53 },
      { week: 12, score: 52 },
    ],
    engagementMetrics: {
      attendanceRate: 88,
      completionRate: 82,
      timeOnTask: 28,
      lastActive: new Date('2025-10-20'),
    },
  },
  {
    learnerId: 'learner-201',
    name: 'Sipho Dlamini',
    grade: 4,
    riskScore: 82,
    riskLevel: 'critical',
    trendDirection: 'declining',
    riskFactors: [
      {
        factor: 'Rapid Performance Drop',
        weight: 38,
        description: 'Dropped from 72% to 38% in 8 weeks',
      },
      {
        factor: 'Very Low Engagement',
        weight: 30,
        description: 'Only 45% attendance, 32% completion',
      },
      {
        factor: 'No Recent Activity',
        weight: 20,
        description: 'Last active 6 days ago',
      },
      {
        factor: 'Guardian Contact Needed',
        weight: 12,
        description: 'Multiple missed parent meetings',
      },
    ],
    predictedOutcome: {
      nextAssessmentScore: 28,
      confidenceInterval: [20, 35],
      probabilityOfFailure: 95,
      daysUntilIntervention: 1,
    },
    recommendedActions: [
      {
        priority: 'urgent',
        action: 'Emergency guardian meeting - possible external factors',
        estimatedImpact: 30,
      },
      {
        priority: 'urgent',
        action: 'Referral to school counselor for support assessment',
        estimatedImpact: 25,
      },
      {
        priority: 'urgent',
        action: 'Comprehensive diagnostic to identify all gaps',
        estimatedImpact: 22,
      },
    ],
    recentPerformance: [
      { week: 5, score: 72 },
      { week: 6, score: 65 },
      { week: 7, score: 58 },
      { week: 8, score: 52 },
      { week: 9, score: 48 },
      { week: 10, score: 42 },
      { week: 11, score: 35 },
      { week: 12, score: 28 },
    ],
    engagementMetrics: {
      attendanceRate: 45,
      completionRate: 32,
      timeOnTask: 8,
      lastActive: new Date('2025-10-14'),
    },
  },
];
