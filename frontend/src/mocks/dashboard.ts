export type Metric = {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'flat';
};

export const weeklyMetrics: Metric[] = [
  {
    label: 'Learners Assessed',
    value: '420',
    change: '+12%',
    trend: 'up'
  },
  {
    label: 'Misconceptions Resolved',
    value: '68',
    change: '+5%',
    trend: 'up'
  },
  {
    label: 'Pathway Completion',
    value: '74%',
    change: '+3%',
    trend: 'flat'
  }
];

export const upcomingFocus = [
  {
    grade: 'Grade 6',
    topic: 'Fractions and Decimals',
    action: 'Launch revision pathway for < 60% mastery cohort.'
  },
  {
    grade: 'Grade 9',
    topic: 'Linear Functions',
    action: 'Schedule diagnostic targeting multi-step problems.'
  }
];

export const alerts = [
  {
    title: 'High misconception rate: Equivalent Fractions',
    detail: '32% of Grade 7 learners selected distractor B indicating denominator confusion.'
  },
  {
    title: 'Inactive pathway segment',
    detail: '15 learners have not started the Measurement remediation tasks.'
  }
];
