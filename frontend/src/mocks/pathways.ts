import { LearningPathway, PathwayNode, Achievement } from '@/types';

// Sample Learning Pathways
export const samplePathways: LearningPathway[] = [
  {
    id: 'pathway-001',
    learnerId: 'learner-class-g4a-001',
    generatedAt: new Date('2024-10-01'),
    targetGoals: [
      'Master multiplication tables to 10',
      'Understand fractions (halves, quarters)',
      'Solve word problems with addition and subtraction',
    ],
    estimatedDuration: 21, // days
    progress: 45,
    nodes: [
      {
        id: 'node-001',
        type: 'lesson',
        title: 'Introduction to Multiplication',
        description: 'Learn what multiplication means and how it relates to addition',
        resourceId: 'res-001',
        prerequisites: [],
        estimatedTime: 15,
        difficulty: 1,
        status: 'completed',
        completedAt: new Date('2024-10-02'),
        performanceScore: 85,
        skillIds: ['skill-mult-fractions'],
      },
      {
        id: 'node-002',
        type: 'practice',
        title: 'Multiplication Tables 2-5',
        description: 'Practice and memorize multiplication facts for 2, 3, 4, and 5',
        resourceId: 'res-002',
        prerequisites: ['node-001'],
        estimatedTime: 20,
        difficulty: 2,
        status: 'completed',
        completedAt: new Date('2024-10-04'),
        performanceScore: 78,
        skillIds: ['skill-mult-fractions'],
      },
      {
        id: 'node-003',
        type: 'game',
        title: 'Multiplication Challenge Game',
        description: 'Fun game to reinforce multiplication skills',
        resourceId: 'res-003',
        prerequisites: ['node-002'],
        estimatedTime: 15,
        difficulty: 2,
        status: 'in_progress',
        skillIds: ['skill-mult-fractions'],
      },
      {
        id: 'node-004',
        type: 'assessment',
        title: 'Multiplication Quiz',
        description: 'Check your understanding of multiplication',
        resourceId: 'res-004',
        prerequisites: ['node-003'],
        estimatedTime: 10,
        difficulty: 2,
        status: 'available',
        skillIds: ['skill-mult-fractions'],
      },
      {
        id: 'node-005',
        type: 'lesson',
        title: 'Introduction to Fractions',
        description: 'Understanding halves and quarters',
        resourceId: 'res-005',
        prerequisites: ['node-004'],
        estimatedTime: 20,
        difficulty: 2,
        status: 'locked',
        skillIds: ['skill-fraction-comparison'],
      },
      {
        id: 'node-006',
        type: 'practice',
        title: 'Fraction Practice',
        description: 'Practice identifying and comparing fractions',
        resourceId: 'res-006',
        prerequisites: ['node-005'],
        estimatedTime: 25,
        difficulty: 3,
        status: 'locked',
        skillIds: ['skill-fraction-comparison'],
      },
    ],
    adaptations: [
      {
        timestamp: new Date('2024-10-05'),
        reason: 'Learner showing strong performance, increased difficulty',
        changes: ['Added challenge activities', 'Skipped remedial content'],
        triggeredBy: 'performance',
      },
    ],
  },
];

// Achievements
export const achievements: Achievement[] = [
  {
    id: 'achieve-001',
    name: 'Multiplication Master',
    description: 'Master all multiplication tables to 10',
    iconUrl: '/achievements/mult-master.svg',
    category: 'skill',
    requirement: 100,
    xpReward: 500,
    unlockedBy: [],
  },
  {
    id: 'achieve-002',
    name: '7-Day Streak',
    description: 'Complete activities for 7 consecutive days',
    iconUrl: '/achievements/7-day-streak.svg',
    category: 'streak',
    requirement: 7,
    xpReward: 300,
    unlockedBy: [],
  },
  {
    id: 'achieve-003',
    name: 'Speed Demon',
    description: 'Complete an assessment in record time',
    iconUrl: '/achievements/speed.svg',
    category: 'speed',
    requirement: 1,
    xpReward: 200,
    unlockedBy: [],
  },
  {
    id: 'achieve-004',
    name: 'Fraction Expert',
    description: 'Complete all fraction activities with 90%+ score',
    iconUrl: '/achievements/fraction-expert.svg',
    category: 'skill',
    requirement: 90,
    xpReward: 400,
    unlockedBy: [],
  },
  {
    id: 'achieve-005',
    name: '30-Day Warrior',
    description: 'Maintain a 30-day learning streak',
    iconUrl: '/achievements/30-day.svg',
    category: 'streak',
    requirement: 30,
    xpReward: 1000,
    unlockedBy: [],
  },
  {
    id: 'achieve-006',
    name: 'Problem Solver',
    description: 'Solve 50 word problems',
    iconUrl: '/achievements/problem-solver.svg',
    category: 'milestone',
    requirement: 50,
    xpReward: 600,
    unlockedBy: [],
  },
  {
    id: 'achieve-007',
    name: 'Challenge Champion',
    description: 'Complete all challenge activities',
    iconUrl: '/achievements/challenge.svg',
    category: 'challenge',
    requirement: 100,
    xpReward: 800,
    unlockedBy: [],
  },
  {
    id: 'achieve-008',
    name: 'Perfect Score',
    description: 'Get 100% on any assessment',
    iconUrl: '/achievements/perfect.svg',
    category: 'milestone',
    requirement: 1,
    xpReward: 500,
    unlockedBy: [],
  },
];

// Helper functions
export function getPathwayByLearnerId(learnerId: string): LearningPathway | undefined {
  return samplePathways.find((p) => p.learnerId === learnerId);
}

export function getNodesByStatus(pathway: LearningPathway, status: string): PathwayNode[] {
  return pathway.nodes.filter((n) => n.status === status);
}

export function calculatePathwayProgress(pathway: LearningPathway): number {
  const completed = pathway.nodes.filter((n) => n.status === 'completed').length;
  return Math.round((completed / pathway.nodes.length) * 100);
}















