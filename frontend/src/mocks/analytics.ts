import { LearnerProfile, SkillMastery, MetricCard, ChartData } from '@/types';
import { learners } from './users';
import { getAllSkills } from './curriculum';

// Generate learner profiles with realistic data
export function generateLearnerProfile(learnerId: string): LearnerProfile {
  const allSkills = getAllSkills();
  const randomPerformance = 40 + Math.random() * 50; // 40-90 range

  // Generate skill mastery data
  const skillMastery: SkillMastery[] = allSkills.slice(0, 15).map((skill) => ({
    skillId: skill.id,
    masteryLevel: Math.max(0, Math.min(100, randomPerformance + (Math.random() * 30 - 15))),
    attempts: Math.floor(Math.random() * 20) + 5,
    lastPracticed: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    trend: ['improving', 'stable', 'declining'][Math.floor(Math.random() * 3)] as
      | 'improving'
      | 'stable'
      | 'declining',
  }));

  // Identify strengths and weaknesses
  const sortedSkills = [...skillMastery].sort((a, b) => b.masteryLevel - a.masteryLevel);
  const strengths = sortedSkills.slice(0, 5).map((s) => s.skillId);
  const weaknesses = sortedSkills.slice(-5).map((s) => s.skillId);

  return {
    learnerId,
    currentLevel: Math.floor(randomPerformance / 10) + 1,
    xp: Math.floor(randomPerformance * 10) + Math.floor(Math.random() * 500),
    skillMastery,
    strengths,
    weaknesses,
    learningPace:
      randomPerformance > 70 ? 'fast' : randomPerformance > 50 ? 'moderate' : 'slow',
    engagementScore: Math.floor(randomPerformance + (Math.random() * 20 - 10)),
    riskScore: randomPerformance < 50 ? 'high' : randomPerformance < 70 ? 'medium' : 'low',
    totalTimeSpent: Math.floor(Math.random() * 2000) + 500,
    streakDays: Math.floor(Math.random() * 30),
    lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
  };
}

// Generate all learner profiles
export const learnerProfiles: LearnerProfile[] = learners
  .slice(0, 50)
  .map((l) => generateLearnerProfile(l.id));

// Teacher Dashboard Metrics
export const teacherDashboardMetrics: MetricCard[] = [
  {
    label: 'Total Learners',
    value: 154,
    change: {
      value: 8,
      direction: 'up',
      isPositive: true,
    },
    icon: 'Users',
    color: 'primary',
  },
  {
    label: 'Assessments This Week',
    value: 12,
    change: {
      value: 3,
      direction: 'up',
      isPositive: true,
    },
    icon: 'FileText',
    color: 'secondary',
  },
  {
    label: 'Average Performance',
    value: '74%',
    change: {
      value: 5,
      direction: 'up',
      isPositive: true,
    },
    icon: 'TrendingUp',
    color: 'success',
  },
  {
    label: 'Urgent Interventions',
    value: 7,
    change: {
      value: 2,
      direction: 'down',
      isPositive: true,
    },
    icon: 'AlertCircle',
    color: 'warning',
  },
];

// Class-specific data storage (keyed by classId)
const classDataCache: Record<string, any> = {};

// Generate performance trend for a specific class
export function getPerformanceTrendData(classId: string): ChartData {
  const basePerformance: Record<string, number> = {
    'class-g4a': 73,
    'class-g4b': 68,
    'class-g5a': 76,
    'class-g6a': 72,
    'class-g7a': 70,
  };

  const base = basePerformance[classId] || 70;
  const trend = 0.8; // Weekly improvement
  const variance = 3; // Random fluctuation

  const data = Array.from({ length: 12 }, (_, i) => {
    const trendValue = base + i * trend;
    const random = (Math.random() - 0.5) * variance;
    return Math.round(trendValue + random);
  });

  return {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12'],
    datasets: [
      {
        label: classId,
        data,
        color: '#0066CC',
      },
    ],
  };
}

// Legacy export for backwards compatibility
export const performanceTrendData: ChartData = getPerformanceTrendData('class-g4a');

// Skill mastery distribution
export const skillMasteryData: ChartData = {
  labels: ['Numbers', 'Algebra', 'Geometry', 'Measurement', 'Data'],
  datasets: [
    {
      label: 'Class Average',
      data: [75, 68, 72, 70, 65],
      color: '#0066CC',
    },
    {
      label: 'Expected',
      data: [70, 70, 70, 70, 70],
      color: '#E5E7EB',
    },
  ],
};

// Misconception frequency data
export const misconceptionFrequencyData: ChartData = {
  labels: [
    'Mult Always Increases',
    'Decimal Confusion',
    'Equals Sign',
    'Fraction Size',
    'Division Makes Smaller',
    'Perimeter/Area',
  ],
  datasets: [
    {
      label: 'Occurrences',
      data: [23, 18, 15, 12, 10, 8],
      color: '#EF4444',
    },
  ],
};

// Assessment completion rates
export const assessmentCompletionData = {
  completed: 142,
  inProgress: 8,
  notStarted: 4,
  total: 154,
};

// Time spent distribution (hours)
export const timeSpentData: ChartData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Hours',
      data: [45, 52, 48, 55, 50, 20, 15],
      color: '#7C3AED',
    },
  ],
};

// Learner progress distribution
export const learnerProgressDistribution = {
  onTrack: 89,
  needsSupport: 42,
  atRisk: 23,
  total: 154,
};

// Class performance comparison
export const classPerformanceData: ChartData = {
  labels: ['Grade 4A', 'Grade 4B', 'Grade 5A', 'Grade 6A', 'Grade 7A'],
  datasets: [
    {
      label: 'Average Score (%)',
      data: [81, 76, 82, 79, 75],
      color: '#0066CC',
    },
  ],
};

// Get class-specific analytics data
export function getClassAnalytics(classId: string) {
  // Get learners for this class
  const classLearners = learners.filter((l) => l.classId === classId);
  const totalLearners = classLearners.length;

  // Base performance varies by class
  const basePerformance: Record<string, number> = {
    'class-g4a': 73,
    'class-g4b': 68,
    'class-g5a': 76,
    'class-g6a': 72,
    'class-g7a': 70,
  };

  const avgPerformance = basePerformance[classId] || 70;

  // Calculate engagement metrics based on performance
  const engagementFactor = avgPerformance / 75; // Higher performance = higher engagement
  const dailyActive = Math.round(totalLearners * 0.6 * engagementFactor);
  const weeklyActive = Math.round(totalLearners * 0.92);

  // Distribution based on performance
  const onTrackPercent = avgPerformance > 75 ? 0.6 : avgPerformance > 70 ? 0.55 : 0.5;
  const atRiskPercent = avgPerformance < 70 ? 0.18 : avgPerformance < 75 ? 0.15 : 0.12;
  const needsSupportPercent = 1 - onTrackPercent - atRiskPercent;

  return {
    totalLearners,
    avgPerformance,
    assessmentsThisWeek: Math.floor(totalLearners * 0.90), // ~90% completion rate (students who completed assessments)
    completionRate: Math.round(88 + (avgPerformance - 70) * 0.5), // Higher performance = higher completion
    dailyActiveUsers: dailyActive,
    weeklyActiveUsers: weeklyActive,
    averageSessionDuration: Math.round(38 + (avgPerformance - 70) * 0.4), // 38-46 minutes
    learnerDistribution: {
      onTrack: Math.round(totalLearners * onTrackPercent),
      needsSupport: Math.round(totalLearners * needsSupportPercent),
      atRisk: Math.round(totalLearners * atRiskPercent),
      total: totalLearners,
    },
  };
}

// Get skill mastery data for a class
export function getSkillMasteryData(classId: string): ChartData {
  const analytics = getClassAnalytics(classId);
  const basePerf = analytics.avgPerformance;

  // Generate realistic skill distribution
  const skills = ['Numbers', 'Algebra', 'Geometry', 'Measurement', 'Data'];
  const data = skills.map((_, i) => {
    const variance = (Math.random() - 0.5) * 10;
    return Math.round(basePerf + variance);
  });

  return {
    labels: skills,
    datasets: [
      {
        label: 'Class Average',
        data,
        color: '#0066CC',
      },
      {
        label: 'Expected',
        data: [70, 70, 70, 70, 70],
        color: '#E5E7EB',
      },
    ],
  };
}

// Get misconception frequency for a class
export function getMisconceptionData(classId: string): ChartData {
  const analytics = getClassAnalytics(classId);
  const totalLearners = analytics.totalLearners;
  const performanceInverse = 100 - analytics.avgPerformance; // More misconceptions with lower performance

  const misconceptions = [
    'Mult Always Increases',
    'Decimal Confusion',
    'Equals Sign',
    'Fraction Size',
    'Division Makes Smaller',
  ];

  const data = misconceptions.map((_, i) => {
    const baseFactor = (performanceInverse / 100) * totalLearners;
    const decreaseFactor = i * 0.2; // Each subsequent misconception is less common
    return Math.round(baseFactor * 0.3 * (1 - decreaseFactor) + Math.random() * 3);
  });

  return {
    labels: misconceptions,
    datasets: [
      {
        label: 'Occurrences',
        data,
        color: '#EF4444',
      },
    ],
  };
}

// Get time spent data for a class
export function getTimeSpentData(classId: string): ChartData {
  const analytics = getClassAnalytics(classId);
  const avgDaily = analytics.dailyActiveUsers * 0.7; // Average hours per day

  return {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Hours',
        data: [
          Math.round(avgDaily * 1.1),
          Math.round(avgDaily * 1.2),
          Math.round(avgDaily * 1.15),
          Math.round(avgDaily * 1.25),
          Math.round(avgDaily * 1.18),
          Math.round(avgDaily * 0.5),
          Math.round(avgDaily * 0.4),
        ],
        color: '#7C3AED',
      },
    ],
  };
}

// Engagement metrics (legacy - now generated per class)
export const engagementMetrics = {
  dailyActiveUsers: 89,
  weeklyActiveUsers: 142,
  averageSessionDuration: 42, // minutes
  completionRate: 92, // percentage
};

// Helper functions
export function getLearnerProfileById(learnerId: string): LearnerProfile | undefined {
  return learnerProfiles.find((p) => p.learnerId === learnerId);
}

export function getClassAveragePerformance(classId: string): number {
  // Mock calculation - in real app would be calculated from actual data
  return 70 + Math.random() * 20;
}

export function getSkillMasteryByClass(classId: string, skillId: string): number {
  // Mock calculation
  return 60 + Math.random() * 30;
}

// Generate heatmap data for skill mastery
export function generateSkillMasteryHeatmap(classId: string) {
  const classLearners = learners.filter((l) => l.classId === classId).slice(0, 20);
  const skills = getAllSkills().slice(0, 10);

  return classLearners.map((learner) => ({
    learnerId: learner.id,
    learnerName: `${learner.firstName} ${learner.lastName}`,
    masteryLevels: skills.map((skill) => ({
      skillId: skill.id,
      skillName: skill.name,
      mastery: Math.floor(Math.random() * 100),
    })),
  }));
}









