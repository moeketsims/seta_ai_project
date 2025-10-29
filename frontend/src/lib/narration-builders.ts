import { NarrationPayload } from './narration';

export interface WeeklyPerformanceDetail {
  week: number;
  performance: number;
  dateRange: string;
  learnersAssessed: number;
  assessmentsCompleted: number;
  avgTimeSpent: number;
  topTopic: string;
  strugglingTopic: string;
  interventions: number;
  change: number;
}

interface PerformanceNarrationConfig {
  className: string;
  timeframeLabel: string;
  averagePerformance: number;
  performanceTrend: number;
  latestWeek: WeeklyPerformanceDetail;
  weeklySeries: WeeklyPerformanceDetail[];
  totalLearners: number;
  targetPercent?: number;
  dataTimestamp: string;
}

export function createPerformanceOverviewPayload({
  className,
  timeframeLabel,
  averagePerformance,
  performanceTrend,
  latestWeek,
  weeklySeries,
  totalLearners,
  targetPercent = 80,
  dataTimestamp,
}: PerformanceNarrationConfig): NarrationPayload {
  const direction = performanceTrend >= 0 ? 'up' : 'down';
  const trendText = `${direction} ${Math.abs(performanceTrend)}%`;
  const coveragePercent = Math.round((latestWeek.learnersAssessed / Math.max(totalLearners, 1)) * 100);
  const targetGap = targetPercent - latestWeek.performance;
  const targetContext = targetGap > 0 ? `Needs ${targetGap}% to hit target` : 'Meeting or exceeding target';

  const timelineDetail = weeklySeries
    .map((week) => `W${week.week}: ${week.performance}%`)
    .join(', ');

  return {
    widgetId: 'performance-trend',
    widgetLabel: `${className} · Performance Trend`,
    audience: 'teacher',
    timeframe: timeframeLabel,
    summary: `${className} averaged ${averagePerformance}% over ${timeframeLabel}, trending ${trendText} across the period.`,
    metrics: [
      {
        label: 'Latest week',
        value: `${latestWeek.performance}%`,
        context: `Week ${latestWeek.week} (${latestWeek.dateRange})`,
      },
      {
        label: 'Learners assessed',
        value: `${latestWeek.learnersAssessed}`,
        context: `${coveragePercent}% of class`,
      },
      {
        label: 'Struggling topic',
        value: latestWeek.strugglingTopic,
        context: `${latestWeek.interventions} interventions launched`,
      },
      {
        label: 'Top topic',
        value: latestWeek.topTopic,
        context: `${latestWeek.avgTimeSpent} min avg time`,
      },
      {
        label: 'Target line',
        value: `${targetPercent}%`,
        context: targetContext,
      },
    ],
    callouts: [
      {
        title: 'Weekly timeline',
        detail: timelineDetail,
      },
    ],
    recommendations: [
      `Revisit ${latestWeek.strugglingTopic} with targeted practice`,
      `Celebrate progress by sharing success in ${latestWeek.topTopic}`,
    ],
    dataTimestamp,
  };
}

interface LearnerProgressConfig {
  className: string;
  onTrack: number;
  needsSupport: number;
  atRisk: number;
  total: number;
  dataTimestamp: string;
}

export function createLearnerProgressPayload({
  className,
  onTrack,
  needsSupport,
  atRisk,
  total,
  dataTimestamp,
}: LearnerProgressConfig): NarrationPayload {
  const riskPercent = Math.round((atRisk / Math.max(total, 1)) * 100);
  const supportPercent = Math.round((needsSupport / Math.max(total, 1)) * 100);
  const highlightGroup = atRisk > needsSupport ? 'at-risk' : 'needs-support';

  return {
    widgetId: 'learner-progress-donut',
    widgetLabel: `${className} · Learner Progress`,
    audience: 'teacher',
    summary: `${className} has ${total} learners: ${onTrack} on track, ${needsSupport} needing support, and ${atRisk} marked at risk.`,
    metrics: [
      {
        label: 'On track',
        value: `${onTrack}`,
        context: `${Math.round((onTrack / Math.max(total, 1)) * 100)}% of cohort`,
      },
      {
        label: 'Needs support',
        value: `${needsSupport}`,
        context: `${supportPercent}% require check-ins`,
      },
      {
        label: 'At risk',
        value: `${atRisk}`,
        context: `${riskPercent}% need urgent action`,
      },
    ],
    recommendations: [
      highlightGroup === 'at-risk'
        ? 'Schedule urgent interventions with at-risk learners'
        : 'Plan small-group conferences for the needs-support segment',
    ],
    dataTimestamp,
  };
}

interface SkillMasteryConfig {
  className: string;
  skills: Array<{ label: string; value: number }>;
  dataTimestamp: string;
}

export function createSkillMasteryPayload({
  className,
  skills,
  dataTimestamp,
}: SkillMasteryConfig): NarrationPayload {
  if (!skills.length) {
    return {
      widgetId: 'skill-mastery-grid',
      widgetLabel: `${className} · Skill Mastery`,
      audience: 'teacher',
      summary: `No skill mastery data available for ${className}.`,
      metrics: [],
      dataTimestamp,
    };
  }

  const sorted = [...skills].sort((a, b) => b.value - a.value);
  const topSkill = sorted[0];
  const lowestSkill = sorted[sorted.length - 1];
  const average = Math.round(
    skills.reduce((total, skill) => total + skill.value, 0) / Math.max(skills.length, 1)
  );

  return {
    widgetId: 'skill-mastery-grid',
    widgetLabel: `${className} · Skill Mastery`,
    audience: 'teacher',
    summary: `${className} averages ${average}% mastery; strongest in ${topSkill.label} at ${topSkill.value}% and weakest in ${lowestSkill.label} at ${lowestSkill.value}%.`,
    metrics: skills.map((skill) => ({
      label: skill.label,
      value: `${skill.value}%`,
      context: skill.value >= 70 ? 'strength' : skill.value < 60 ? 'needs focus' : 'developing',
    })),
    recommendations: [
      `Prioritise reteaching in ${lowestSkill.label}`,
      `Extend ${topSkill.label} with enrichment for high performers`,
    ],
    dataTimestamp,
  };
}

interface InterventionQueueConfig {
  queueName: string;
  interventions: Array<{
    learner: string;
    grade: string;
    misconception: string;
    status: 'pending' | 'resolved';
  }>;
  dataTimestamp: string;
}

export function createInterventionQueuePayload({
  queueName,
  interventions,
  dataTimestamp,
}: InterventionQueueConfig): NarrationPayload {
  const total = interventions.length;
  const pending = interventions.filter((item) => item.status === 'pending');
  const resolved = interventions.filter((item) => item.status === 'resolved');
  const topItem = pending[0] ?? interventions[0];

  return {
    widgetId: 'intervention-queue',
    widgetLabel: `${queueName} · Intervention Queue`,
    audience: 'teacher',
    summary: `${queueName} has ${total} learners flagged, with ${pending.length} awaiting action and ${resolved.length} recently resolved.`,
    metrics: interventions.slice(0, 3).map((item) => ({
      label: item.learner,
      value: item.misconception,
      context: `${item.grade} · ${item.status === 'pending' ? 'needs support' : 'resolved'}`,
    })),
    recommendations: topItem
      ? [`Start with ${topItem.learner} (${topItem.misconception}) to clear the queue.`]
      : undefined,
    dataTimestamp,
  };
}

interface ClassHealthSnapshotItem {
  className: string;
  mastery: number;
  misconceptionHotspot: string;
}

interface ClassHealthConfig {
  snapshotTitle: string;
  items: ClassHealthSnapshotItem[];
  dataTimestamp: string;
}

export function createClassHealthPayload({
  snapshotTitle,
  items,
  dataTimestamp,
}: ClassHealthConfig): NarrationPayload {
  if (!items.length) {
    return {
      widgetId: 'class-health-snapshot',
      widgetLabel: `${snapshotTitle} · Class Health`,
      audience: 'teacher',
      summary: `No class health data available.`,
      metrics: [],
      dataTimestamp,
    };
  }

  const weakest = [...items].sort((a, b) => a.mastery - b.mastery)[0];
  const strongest = [...items].sort((a, b) => b.mastery - a.mastery)[0];

  return {
    widgetId: 'class-health-snapshot',
    widgetLabel: `${snapshotTitle} · Class Health`,
    audience: 'teacher',
    summary: `${snapshotTitle} spans ${items.length} classes: top mastery is ${strongest.className} at ${strongest.mastery}% while ${weakest.className} trails at ${weakest.mastery}%.`,
    metrics: items.slice(0, 3).map((item) => ({
      label: item.className,
      value: `${item.mastery}%`,
      context: item.misconceptionHotspot,
    })),
    recommendations: [
      `Prioritise coaching for ${weakest.className} on ${weakest.misconceptionHotspot}.`,
    ],
    dataTimestamp,
  };
}

interface EngagementSummaryConfig {
  className: string;
  engagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    averageSessionDuration: number;
    completionRate: number;
  };
  completionTrend: number;
  totalLearners: number;
  dataTimestamp: string;
}

export function createEngagementSummaryPayload({
  className,
  engagement,
  completionTrend,
  totalLearners,
  dataTimestamp,
}: EngagementSummaryConfig): NarrationPayload {
  const dailyPercent = engagement.weeklyActiveUsers
    ? Math.round((engagement.dailyActiveUsers / engagement.weeklyActiveUsers) * 100)
    : 0;
  const weeklyCoverage = totalLearners
    ? Math.round((engagement.weeklyActiveUsers / totalLearners) * 100)
    : 0;

  return {
    widgetId: 'engagement-summary',
    widgetLabel: `${className} · Engagement Summary`,
    audience: 'teacher',
    summary: `${className} shows ${engagement.dailyActiveUsers} daily learners out of ${engagement.weeklyActiveUsers} active this week, averaging ${engagement.averageSessionDuration} minutes per session with a ${engagement.completionRate}% completion rate.`,
    metrics: [
      {
        label: 'Daily active',
        value: `${engagement.dailyActiveUsers}`,
        context: `${dailyPercent}% of weekly cohort`,
      },
      {
        label: 'Weekly coverage',
        value: `${engagement.weeklyActiveUsers}`,
        context: `${weeklyCoverage}% of learners`,
      },
      {
        label: 'Avg session',
        value: `${engagement.averageSessionDuration}m`,
        context: 'Per learner per day',
      },
      {
        label: 'Completion',
        value: `${engagement.completionRate}%`,
        context: `${completionTrend >= 0 ? '↑' : '↓'} ${Math.abs(completionTrend)}% trend`,
      },
    ],
    recommendations: [
      completionTrend >= 0
        ? 'Share high completion habits across other classes'
        : 'Schedule nudges for learners below completion targets',
    ],
    dataTimestamp,
  };
}

interface MisconceptionSummaryConfig {
  className: string;
  misconceptions: Array<{ label: string; count: number }>;
  dataTimestamp: string;
}

export function createMisconceptionSummaryPayload({
  className,
  misconceptions,
  dataTimestamp,
}: MisconceptionSummaryConfig): NarrationPayload {
  if (!misconceptions.length) {
    return {
      widgetId: 'misconception-ranking',
      widgetLabel: `${className} · Top Misconceptions`,
      audience: 'teacher',
      summary: `No misconception incidents recorded for ${className}.`,
      metrics: [],
      dataTimestamp,
    };
  }

  const totalAffected = misconceptions.reduce((sum, item) => sum + item.count, 0);
  const top = misconceptions[0];

  return {
    widgetId: 'misconception-ranking',
    widgetLabel: `${className} · Top Misconceptions`,
    audience: 'teacher',
    summary: `${totalAffected} misconception incidents flagged, led by ${top.label} at ${top.count} learners. Prioritise targeted reteaching before misconceptions spread.`,
    metrics: misconceptions.slice(0, 3).map((item, index) => ({
      label: `#${index + 1} ${item.label}`,
      value: `${item.count} learners`,
      context: index === 0 ? 'highest impact' : 'monitor',
    })),
    recommendations: [
      `Design a mini-lesson to tackle ${top.label} immediately`,
    ],
    dataTimestamp,
  };
}
