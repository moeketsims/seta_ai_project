'use client';

import { PageHeader } from '../../components/layout/page-header';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import {
  getPerformanceTrendData,
  getSkillMasteryData,
  getMisconceptionData,
  classPerformanceData,
  getTimeSpentData,
  getClassAnalytics,
  generateSkillMasteryHeatmap,
} from '../../mocks/analytics';
import { currentUser, classes } from '../../mocks/users';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SkillRadialGroup } from '../../components/analytics/skill-radial';
import { SkillHexagonGrid } from '../../components/analytics/skill-hexagon';
import { MisconceptionImpact } from '../../components/analytics/misconception-impact';
import { MisconceptionBloomberg } from '../../components/analytics/misconception-bloomberg';
import { useNarrationPreview } from '../../hooks/useNarrationPreview';
import {
  createLearnerProgressPayload,
  createPerformanceOverviewPayload,
  createSkillMasteryPayload,
  createEngagementSummaryPayload,
  createMisconceptionSummaryPayload,
  WeeklyPerformanceDetail,
} from '../../lib/narration-builders';
import { useNarrationTranscript } from '../../hooks/useNarrationTranscript';
import { NarrationTranscriptPanel } from '../../components/narration/NarrationTranscriptPanel';
import type { NarrationPayload } from '../../lib/narration';
import { useNarrationChat } from '../../hooks/useNarrationChat';

type GuardrailFn = (payload: NarrationPayload) => { ok: boolean; message?: string };

export default function AnalyticsPage() {
  const [selectedClass, setSelectedClass] = useState(currentUser.classes[0]);
  const [timeRange, setTimeRange] = useState('12weeks');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [isTranscriptOpen, setTranscriptOpen] = useState(false);
  const [isTranscriptMaximized, setTranscriptMaximized] = useState(false);
  const [activePayload, setActivePayload] = useState<NarrationPayload | null>(null);
  const [activeGuardrail, setActiveGuardrail] = useState<GuardrailFn | undefined>(undefined);

  const dataTimestamp = useMemo(() => new Date().toISOString(), [selectedClass]);

  const classAnalytics = useMemo(() => getClassAnalytics(selectedClass), [selectedClass]);
  const performanceTrendData = useMemo(
    () => getPerformanceTrendData(selectedClass),
    [selectedClass]
  );
  const skillMasteryData = useMemo(
    () => getSkillMasteryData(selectedClass),
    [selectedClass]
  );
  const misconceptionFrequencyData = useMemo(
    () => getMisconceptionData(selectedClass),
    [selectedClass]
  );
  const timeSpentData = useMemo(() => getTimeSpentData(selectedClass), [selectedClass]);

  const learnerProgressDistribution = classAnalytics.learnerDistribution;

  const engagementMetrics = useMemo(
    () => ({
      dailyActiveUsers: classAnalytics.dailyActiveUsers,
      weeklyActiveUsers: classAnalytics.weeklyActiveUsers,
      averageSessionDuration: classAnalytics.averageSessionDuration,
      completionRate: classAnalytics.completionRate,
    }),
    [classAnalytics]
  );

  const heatmapData = useMemo(
    () => generateSkillMasteryHeatmap(selectedClass),
    [selectedClass]
  );

  const weeklyDetails = useMemo<WeeklyPerformanceDetail[]>(() => {
    const skillLabels = skillMasteryData.labels;
    const fallbackTopics = ['Fractions', 'Equations', 'Angles', 'Probability'];

    return performanceTrendData.datasets[0].data.map((value, i) => {
      const learnersFraction = 0.35 + (i % 3) * 0.05;
      const weeklyLearners = Math.round(classAnalytics.totalLearners * learnersFraction);
      const avgTimeOffset = [-8, -4, 0, 4, 8][i % 5];
      const topTopicIndex = skillLabels.length ? i % skillLabels.length : 0;
      const strugglingTopicIndex = fallbackTopics.length ? i % fallbackTopics.length : 0;
      const interventionShare = 0.3 + (i % 4) * 0.1;

      return {
        week: i + 1,
        performance: value,
        dateRange: `Jan ${i * 7 + 1}-${i * 7 + 7}`,
        learnersAssessed: weeklyLearners,
        assessmentsCompleted: Math.round(weeklyLearners * (1.1 + (i % 2) * 0.1)),
        avgTimeSpent: classAnalytics.averageSessionDuration + avgTimeOffset,
        topTopic: skillLabels[topTopicIndex] ?? 'Key skill',
        strugglingTopic: fallbackTopics[strugglingTopicIndex],
        interventions: Math.round(learnerProgressDistribution.atRisk * interventionShare),
        change: i > 0 ? value - performanceTrendData.datasets[0].data[i - 1] : 0,
      };
    });
  }, [classAnalytics, learnerProgressDistribution.atRisk, performanceTrendData, skillMasteryData.labels]);

  const previousPeriodData = useMemo(
    () => performanceTrendData.datasets[0].data.map((v, i) => v - 3 - (i % 5)),
    [performanceTrendData]
  );

  // Calculate additional metrics from class analytics
  const totalLearners = classAnalytics.totalLearners;
  const averagePerformance = classAnalytics.avgPerformance;
  const firstWeekPerf = performanceTrendData.datasets[0].data[0];
  const lastWeekPerf = performanceTrendData.datasets[0].data[11];
  const performanceTrend = Math.round(((lastWeekPerf - firstWeekPerf) / firstWeekPerf) * 100);
  const assessmentsThisWeek = classAnalytics.assessmentsThisWeek;
  const completionTrend = Math.round((classAnalytics.completionRate - 88) * 2); // Relative to baseline 88%

  const classInfo = useMemo(
    () => classes.find((cls) => cls.id === selectedClass),
    [selectedClass]
  );
  const classDisplayName = classInfo?.name ?? selectedClass;

  const timeframeLabel = useMemo(() => {
    switch (timeRange) {
      case '4weeks':
        return 'the last 4 weeks';
      case 'year':
        return 'the academic year';
      default:
        return 'the last 12 weeks';
    }
  }, [timeRange]);

  const latestWeekDetail = useMemo(() => {
    if (!weeklyDetails.length) {
      return null;
    }

    const index = selectedWeek
      ? Math.min(Math.max(selectedWeek - 1, 0), weeklyDetails.length - 1)
      : weeklyDetails.length - 1;

    return weeklyDetails[index];
  }, [selectedWeek, weeklyDetails]);

  const performancePayload = useMemo(() => {
    if (!latestWeekDetail) {
      return null;
    }

    return createPerformanceOverviewPayload({
      className: classDisplayName,
      timeframeLabel,
      averagePerformance,
      performanceTrend,
      latestWeek: latestWeekDetail,
      weeklySeries: weeklyDetails,
      totalLearners,
      targetPercent: 80,
      dataTimestamp,
    });
  }, [
    averagePerformance,
    classDisplayName,
    dataTimestamp,
    latestWeekDetail,
    weeklyDetails,
    performanceTrend,
    timeframeLabel,
    totalLearners,
  ]);

  const { onTrack, needsSupport, atRisk, total } = learnerProgressDistribution;

  const learnerProgressPayload = useMemo(
    () =>
      createLearnerProgressPayload({
        className: classDisplayName,
        onTrack,
        needsSupport,
        atRisk,
        total,
        dataTimestamp,
      }),
    [atRisk, classDisplayName, dataTimestamp, needsSupport, onTrack, total]
  );

  const skillMasteryPairs = useMemo(
    () => {
      const dataset = skillMasteryData.datasets[0];
      if (!dataset) {
        return [];
      }

      return skillMasteryData.labels.map((label, i) => ({
        label,
        value: dataset.data[i] ?? 0,
      }));
    },
    [skillMasteryData]
  );

  const skillMasteryPayload = useMemo(
    () =>
      createSkillMasteryPayload({
        className: classDisplayName,
        skills: skillMasteryPairs,
        dataTimestamp,
      }),
    [classDisplayName, dataTimestamp, skillMasteryPairs]
  );

  useNarrationPreview(performancePayload);
  useNarrationPreview(learnerProgressPayload);
  useNarrationPreview(skillMasteryPayload);

  const engagementSummaryPayload = useMemo(
    () =>
      createEngagementSummaryPayload({
        className: classDisplayName,
        engagement: engagementMetrics,
        completionTrend,
        totalLearners,
        dataTimestamp,
      }),
    [classDisplayName, completionTrend, dataTimestamp, engagementMetrics, totalLearners]
  );

  const misconceptionPairs = useMemo(() => {
    const dataset = misconceptionFrequencyData.datasets[0];
    if (!dataset) {
      return [];
    }

    return misconceptionFrequencyData.labels.map((label, index) => ({
      label,
      count: dataset.data[index] ?? 0,
    }));
  }, [misconceptionFrequencyData]);

  const misconceptionSummaryPayload = useMemo(
    () =>
      createMisconceptionSummaryPayload({
        className: classDisplayName,
        misconceptions: misconceptionPairs,
        dataTimestamp,
      }),
    [classDisplayName, dataTimestamp, misconceptionPairs]
  );

  useNarrationPreview(engagementSummaryPayload);
  useNarrationPreview(misconceptionSummaryPayload);

  const performanceGuardrail = useCallback(
    (payload: NarrationPayload) => {
      if (!latestWeekDetail) {
        return { ok: false, message: 'Latest week context missing.' };
      }

      const latestMetric = payload.metrics.find((metric) => metric.label === 'Latest week');
      const learnersMetric = payload.metrics.find((metric) => metric.label === 'Learners assessed');

      if (!latestMetric || !learnersMetric) {
        return { ok: false, message: 'Narration payload missing required metrics.' };
      }

      const numericFromString = (value: string) => {
        const cleaned = value.replace(/[^0-9.-]/g, '');
        return Number.parseFloat(cleaned);
      };

      const latestValue = numericFromString(latestMetric.value);
      if (!Number.isFinite(latestValue) || Math.abs(latestValue - latestWeekDetail.performance) > 0.5) {
        return {
          ok: false,
          message: `Narration week performance (${latestMetric.value}) does not match source data (${latestWeekDetail.performance}%).`,
        };
      }

      const learnersValue = Number.parseInt(learnersMetric.value.replace(/[^0-9]/g, ''), 10);
      if (!Number.isFinite(learnersValue) || learnersValue !== latestWeekDetail.learnersAssessed) {
        return {
          ok: false,
          message: `Learner count (${learnersMetric.value}) diverges from weekly data (${latestWeekDetail.learnersAssessed}).`,
        };
      }

      if (learnersValue > totalLearners) {
        return {
          ok: false,
          message: 'Learner count exceeds cohort size.',
        };
      }

      if (!payload.summary.includes(`${averagePerformance}%`)) {
        return {
          ok: false,
          message: 'Narration summary missing cohort average.',
        };
      }

      return { ok: true };
    },
    [averagePerformance, latestWeekDetail, totalLearners]
  );

  const {
    transcript: activeTranscript,
    isGenerating: isTranscriptGenerating,
    error: transcriptError,
    generateTranscript,
    reset: resetTranscript,
  } = useNarrationTranscript(activePayload, { guardrail: activeGuardrail });

  const {
    messages: chatMessages,
    isSending: isSendingQuestion,
    error: chatError,
    sendQuestion,
    resetConversation,
  } = useNarrationChat(activePayload, activeTranscript);

  useEffect(() => {
    if (!activeTranscript) {
      return;
    }
    resetConversation();
  }, [activeTranscript, resetConversation]);

  const handleExplainClick = useCallback(
    (payload: NarrationPayload | null, guardrail?: GuardrailFn) => {
      if (!payload) {
        return;
      }
      const clonedPayload: NarrationPayload = {
        ...payload,
        metrics: [...payload.metrics],
        callouts: payload.callouts ? [...payload.callouts] : undefined,
        recommendations: payload.recommendations ? [...payload.recommendations] : undefined,
      };

      setActiveGuardrail(() => guardrail);
      setActivePayload(clonedPayload);
      setTranscriptMaximized(false);
      setTranscriptOpen(true);
      resetTranscript();
      resetConversation();
      void generateTranscript(clonedPayload, guardrail ?? null);
    },
    [generateTranscript, resetConversation, resetTranscript]
  );

  const handleCloseTranscript = () => {
    setTranscriptOpen(false);
    setTranscriptMaximized(false);
  };

  const ExplainButton = ({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) => (
    <Button
      size="sm"
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className="rounded-full border-[var(--ufs-maroon)] text-[var(--ufs-maroon)] hover:bg-[var(--ufs-maroon)] hover:text-white"
    >
      Explain
    </Button>
  );

  return (
    <>
      <div className="space-y-12 pb-12">
      {/* BRUTALIST HERO: Massive Navy Block - Commanding Authority */}
      <div className="-mx-6 -mt-6 mb-16">
        <div className="bg-[var(--ufs-navy)] text-white px-12 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-6xl font-bold mb-4 tracking-tight leading-tight">
                  Analytics & Insights
                </h1>
                <p className="text-xl text-white/60 font-light">
                  Performance data · Updated 5 min ago
                </p>
              </div>
              <div className="flex gap-4 items-center">
                <button className="px-6 py-3 rounded-lg border-2 border-white/20 text-white hover:bg-white/10 transition-all font-medium text-sm">
                  Deep Diagnostics
                </button>
                <button className="px-6 py-3 rounded-lg border-2 border-white/20 text-white hover:bg-white/10 transition-all font-medium text-sm">
                  Export Report
                </button>
                <button className="px-8 py-3 rounded-lg bg-[var(--ufs-maroon)] text-white hover:brightness-90 transition-all font-bold text-sm shadow-xl">
                  Download CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BRUTALIST KPI CARDS: Huge Numbers, Vertical Navy Bars, Pure White */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
        {/* Total Learners */}
        <div className="bg-white rounded-lg shadow-card hover:shadow-xl transition-shadow relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-[var(--ufs-navy)]"></div>
          <div className="p-8 pl-10">
            <div className="text-xs font-bold uppercase tracking-wider text-ufs-gray-500 mb-3">Total Learners</div>
            <div className="text-7xl font-bold text-[var(--ufs-navy)] mb-2 tabular-nums">{totalLearners}</div>
            <div className="text-sm text-ufs-gray-500 font-medium">Across {currentUser.classes.length} classes</div>
          </div>
        </div>

        {/* Average Performance */}
        <div className="bg-white rounded-lg shadow-card hover:shadow-xl transition-shadow relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-[var(--ufs-navy)]"></div>
          <div className="p-8 pl-10">
            <div className="text-xs font-bold uppercase tracking-wider text-ufs-gray-500 mb-3">Avg Performance</div>
            <div className="text-7xl font-bold text-[var(--ufs-navy)] mb-2 tabular-nums">{averagePerformance}<span className="text-4xl">%</span></div>
            <div className="text-sm text-[var(--ufs-navy)] font-bold">↑ {performanceTrend}% this month</div>
          </div>
        </div>

        {/* Assessments */}
        <div className="bg-white rounded-lg shadow-card hover:shadow-xl transition-shadow relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-[var(--ufs-navy)]"></div>
          <div className="p-8 pl-10">
            <div className="text-xs font-bold uppercase tracking-wider text-ufs-gray-500 mb-3">Assessments</div>
            <div className="text-7xl font-bold text-[var(--ufs-navy)] mb-2 tabular-nums">{assessmentsThisWeek}</div>
            <div className="text-sm text-ufs-gray-500 font-medium">This week</div>
          </div>
        </div>

        {/* At Risk - ONLY Maroon Card */}
        <div className="bg-white rounded-lg shadow-card hover:shadow-xl transition-shadow relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-[var(--ufs-maroon)]"></div>
          <div className="p-8 pl-10">
            <div className="text-xs font-bold uppercase tracking-wider text-ufs-gray-500 mb-3 flex items-center gap-2">
              At Risk <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--ufs-maroon)]"></span>
            </div>
            <div className="text-7xl font-bold text-[var(--ufs-maroon)] mb-2 tabular-nums">{learnerProgressDistribution.atRisk}</div>
            <div className="text-sm text-[var(--ufs-maroon)] font-bold">
              {Math.round((learnerProgressDistribution.atRisk / totalLearners) * 100)}% of total
            </div>
          </div>
        </div>
      </div>

      {/* POLISHED FILTERS: With Subtle Dividers */}
      <div className="flex items-center justify-between mb-12 pb-6 border-b-2 border-ufs-gray-200">
        <div className="flex items-center gap-8 divide-x divide-ufs-gray-300">
          <div className="pr-8">
            <label className="block text-xs font-bold uppercase tracking-wider text-ufs-gray-500 mb-2">Class</label>
            <select
              className="rounded-lg border-2 border-[var(--ufs-navy)] bg-white px-6 py-2.5 text-sm font-bold text-[var(--ufs-navy)] hover:bg-[var(--ufs-navy)] hover:text-white focus:bg-[var(--ufs-navy)] focus:text-white focus:outline-none transition-all cursor-pointer"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              {currentUser.classes.map((classId) => {
                const cls = classes.find((c) => c.id === classId);
                return (
                  <option key={classId} value={classId}>
                    {cls?.name || classId}
                  </option>
                );
              })}
            </select>
          </div>
          
          <div className="pl-8 pr-8">
            <label className="block text-xs font-bold uppercase tracking-wider text-ufs-gray-500 mb-2">Time Range</label>
            <div className="flex gap-2">
              {[
                { value: '12weeks', label: '12 Weeks' },
                { value: '4weeks', label: '1 Month' },
                { value: 'year', label: 'Year' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTimeRange(option.value)}
                  className={`px-6 py-2.5 text-sm font-bold transition-all rounded-lg ${
                    timeRange === option.value
                      ? 'bg-[var(--ufs-maroon)] text-white shadow-sm'
                      : 'border-2 border-ufs-gray-300 text-ufs-gray-700 hover:border-[var(--ufs-navy)] hover:text-[var(--ufs-navy)]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pl-8">
            <label className="block text-xs font-bold uppercase tracking-wider text-ufs-gray-500 mb-2">View</label>
            <div className="flex gap-0 border-2 border-[var(--ufs-navy)] rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('overview')}
                className={`px-7 py-2.5 text-sm font-bold transition-all ${
                  viewMode === 'overview'
                    ? 'bg-[var(--ufs-navy)] text-white'
                    : 'bg-white text-[var(--ufs-navy)] hover:bg-[var(--ufs-navy)]/5'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setViewMode('detailed')}
                className={`px-7 py-2.5 text-sm font-bold border-l-2 border-[var(--ufs-navy)] transition-all ${
                  viewMode === 'detailed'
                    ? 'bg-[var(--ufs-navy)] text-white'
                    : 'bg-white text-[var(--ufs-navy)] hover:bg-[var(--ufs-navy)]/5'
                }`}
              >
                Detailed
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* POLISHED SECONDARY METRICS: Clean, Bold, Consistent */}
      <div className="flex justify-end mb-4">
        <ExplainButton onClick={() => handleExplainClick(engagementSummaryPayload)} />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-16">
        {/* Daily Active Users */}
        <div className="bg-white rounded-lg shadow-card p-7">
          <div className="text-xs font-bold uppercase tracking-wider text-ufs-gray-500 mb-3">Daily Active</div>
          <div className="text-7xl font-bold text-[var(--ufs-navy)] mb-2 tabular-nums">{engagementMetrics.dailyActiveUsers}</div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-sm text-ufs-gray-500">of {engagementMetrics.weeklyActiveUsers}</span>
            <span className="text-xs font-bold text-[var(--ufs-navy)]">
              {Math.round((engagementMetrics.dailyActiveUsers / engagementMetrics.weeklyActiveUsers) * 100)}%
            </span>
          </div>
          <div className="w-full h-2 bg-ufs-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--ufs-navy)] rounded-full transition-all duration-500"
              style={{ width: `${(engagementMetrics.dailyActiveUsers / engagementMetrics.weeklyActiveUsers) * 100}%` }}
            />
          </div>
        </div>

        {/* Avg Session Duration */}
        <div className="bg-white rounded-lg shadow-card p-7">
          <div className="text-xs font-bold uppercase tracking-wider text-ufs-gray-500 mb-3">Avg Session</div>
          <div className="text-7xl font-bold text-[var(--ufs-navy)] mb-2 tabular-nums">
            {engagementMetrics.averageSessionDuration}<span className="text-3xl">m</span>
          </div>
          <div className="text-sm text-ufs-gray-500 mb-3">Target: 45min</div>
          <div className="w-full h-2 bg-ufs-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--ufs-navy)] rounded-full transition-all duration-500"
              style={{ width: `${(engagementMetrics.averageSessionDuration / 60) * 100}%` }}
            />
          </div>
        </div>

        {/* Completion Rate - Education Green */}
        <div className="bg-white rounded-lg shadow-card p-7">
          <div className="text-xs font-bold uppercase tracking-wider text-ufs-gray-500 mb-3">Completion Rate</div>
          <div className="text-7xl font-bold text-[var(--edu-green)] mb-2 tabular-nums">
            {engagementMetrics.completionRate}<span className="text-3xl">%</span>
          </div>
          <div className="text-sm font-bold text-[var(--edu-green)] mb-3">↑ {completionTrend}% trend</div>
          <div className="w-full h-2 bg-ufs-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--edu-green)] rounded-full transition-all duration-500"
              style={{ width: `${engagementMetrics.completionRate}%` }}
            />
          </div>
        </div>

        {/* Weekly Active */}
        <div className="bg-white rounded-lg shadow-card p-7">
          <div className="text-xs font-bold uppercase tracking-wider text-ufs-gray-500 mb-3">Weekly Active</div>
          <div className="text-7xl font-bold text-[var(--ufs-navy)] mb-2 tabular-nums">{engagementMetrics.weeklyActiveUsers}</div>
          <div className="text-sm text-ufs-gray-500 mb-3">Learners this week</div>
          <div className="w-full h-2 bg-ufs-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--ufs-navy)] rounded-full transition-all duration-500"
              style={{ width: `${(engagementMetrics.weeklyActiveUsers / totalLearners) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* BRUTALIST CHARTS: Monochromatic, Elegant */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        {/* Performance Trend - Navy Monochromatic */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-card p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[var(--ufs-navy)] mb-2">Performance Trend</h2>
              <p className="text-sm text-ufs-gray-500">
                {selectedWeek ? `Week ${selectedWeek} breakdown below` : '12-week performance overview'}
              </p>
            </div>
            <div className="flex flex-col items-end gap-3 text-right md:flex-row md:items-center md:gap-6">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-ufs-gray-500 mb-1">Average</div>
                <div className="text-5xl font-bold text-[var(--ufs-navy)] tabular-nums">{averagePerformance}<span className="text-2xl">%</span></div>
                <div className="text-sm font-bold text-[var(--ufs-navy)] mt-1">
                  {performanceTrend >= 0 ? '↑' : '↓'} {Math.abs(performanceTrend)}%
                </div>
              </div>
              <ExplainButton
                onClick={() => handleExplainClick(performancePayload, performanceGuardrail)}
                disabled={!performancePayload}
              />
            </div>
          </div>

          {/* Hover Details - Fixed Height to Prevent Flicker */}
          <div className="mb-6 h-[120px] flex items-center">
            {hoveredWeek !== null && weeklyDetails[hoveredWeek] && (
              <div className="w-full p-5 bg-[rgba(15,32,75,0.04)] rounded-lg border-l-4 border-[var(--ufs-navy)] pointer-events-none">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <div className="text-xs font-bold uppercase text-ufs-gray-500 mb-2">Week {weeklyDetails[hoveredWeek].week}</div>
                    <div className="text-3xl font-bold text-[var(--ufs-navy)] tabular-nums">
                      {weeklyDetails[hoveredWeek].performance}%
                    </div>
                    <div className="text-sm font-bold text-[var(--ufs-navy)] mt-1">
                      {weeklyDetails[hoveredWeek].change >= 0 ? '↑' : '↓'} {Math.abs(weeklyDetails[hoveredWeek].change).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase text-ufs-gray-500 mb-2">Learners</div>
                    <div className="text-2xl font-bold text-[var(--ufs-navy)] tabular-nums">
                      {weeklyDetails[hoveredWeek].learnersAssessed}
                    </div>
                    <div className="text-xs text-ufs-gray-500 mt-1">{weeklyDetails[hoveredWeek].assessmentsCompleted} assessments</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase text-ufs-gray-500 mb-2">Top Topic</div>
                    <div className="text-sm font-bold text-[var(--edu-green)]">
                      {weeklyDetails[hoveredWeek].topTopic}
                    </div>
                    <div className="text-xs text-ufs-gray-500 mt-1">{weeklyDetails[hoveredWeek].avgTimeSpent} min avg</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase text-ufs-gray-500 mb-2">At Risk</div>
                    <div className="text-sm font-bold text-[var(--ufs-maroon)]">
                      {weeklyDetails[hoveredWeek].strugglingTopic}
                    </div>
                    <div className="text-xs text-ufs-gray-500 mt-1">{weeklyDetails[hoveredWeek].interventions} interventions</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Line Chart with SVG */}
          <div className="relative h-72 border-l-2 border-b-2 border-ufs-gray-300 p-4">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-ufs-gray-500 pr-2">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>

            {/* Grid lines */}
            <div className="absolute left-12 right-0 top-0 bottom-8 flex flex-col justify-between">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="w-full border-t border-ufs-gray-200 border-dashed" />
              ))}
            </div>

            {/* Target line at 80% - Education Green */}
            <div className="absolute left-12 right-0" style={{ bottom: 'calc(8px + 80% * (100% - 32px) / 100)' }}>
              <div className="w-full border-t-2 border-[var(--edu-green)] border-dashed opacity-40" />
            </div>

            {/* Chart area */}
            <div className="relative h-full ml-12">
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 1000 280"
                preserveAspectRatio="none"
              >
                {/* Gradients - Navy Monochromatic */}
                <defs>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgb(15, 32, 75)" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="rgb(15, 32, 75)" stopOpacity="0.02" />
                  </linearGradient>
                  <linearGradient id="previousPeriodGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgb(15, 32, 75)" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="rgb(15, 32, 75)" stopOpacity="0.01" />
                  </linearGradient>
                </defs>

                {/* Previous period - Navy dashed */}
                <path
                  d={`
                    M 0,${280 - (previousPeriodData[0] / 100) * 280}
                    ${previousPeriodData.map((value, i) => {
                      const x = (i / (previousPeriodData.length - 1)) * 1000;
                      const y = 280 - (value / 100) * 280;
                      return `L ${x},${y}`;
                    }).join(' ')}
                    L 1000,280 L 0,280 Z
                  `}
                  fill="url(#previousPeriodGradient)"
                />
                <path
                  d={`
                    M 0,${280 - (previousPeriodData[0] / 100) * 280}
                    ${previousPeriodData.map((value, i) => {
                      const x = (i / (previousPeriodData.length - 1)) * 1000;
                      const y = 280 - (value / 100) * 280;
                      return `L ${x},${y}`;
                    }).join(' ')}
                  `}
                  fill="none"
                  stroke="rgb(15, 32, 75)"
                  strokeWidth="2"
                  strokeDasharray="6,6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.3"
                />

                {/* Current period area fill */}
                <path
                  d={`
                    M 0,${280 - (performanceTrendData.datasets[0].data[0] / 100) * 280}
                    ${performanceTrendData.datasets[0].data.map((value, i) => {
                      const x = (i / (performanceTrendData.datasets[0].data.length - 1)) * 1000;
                      const y = 280 - (value / 100) * 280;
                      return `L ${x},${y}`;
                    }).join(' ')}
                    L 1000,280 L 0,280 Z
                  `}
                  fill="url(#areaGradient)"
                />

                {/* Current period line - Bold Navy */}
                <path
                  d={`
                    M 0,${280 - (performanceTrendData.datasets[0].data[0] / 100) * 280}
                    ${performanceTrendData.datasets[0].data.map((value, i) => {
                      const x = (i / (performanceTrendData.datasets[0].data.length - 1)) * 1000;
                      const y = 280 - (value / 100) * 280;
                      return `L ${x},${y}`;
                    }).join(' ')}
                  `}
                  fill="none"
                  stroke="rgb(15, 32, 75)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow-lg"
                />

                {/* Data points with enhanced interactivity */}
                {performanceTrendData.datasets[0].data.map((value, i) => {
                  const x = (i / (performanceTrendData.datasets[0].data.length - 1)) * 1000;
                  const y = 280 - (value / 100) * 280;
                  const isHovered = hoveredWeek === i;
                  const isSelected = selectedWeek === i + 1;
                  return (
                    <g key={i}>
                      {/* Selected point highlight - Navy */}
                      {isSelected && (
                        <>
                          <circle
                            cx={x}
                            cy={y}
                            r="20"
                            fill="rgb(15, 32, 75)"
                            opacity="0.08"
                          />
                          <circle
                            cx={x}
                            cy={y}
                            r="15"
                            fill="rgb(15, 32, 75)"
                            opacity="0.12"
                          />
                        </>
                      )}
                      {/* Hover glow - Navy */}
                      {isHovered && !isSelected && (
                        <circle
                          cx={x}
                          cy={y}
                          r="14"
                          fill="rgb(15, 32, 75)"
                          opacity="0.15"
                        />
                      )}
                      {/* Hit area - Larger for easier interaction */}
                      <circle
                        cx={x}
                        cy={y}
                        r="30"
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredWeek(i)}
                        onMouseLeave={() => setHoveredWeek(null)}
                        onClick={() => setSelectedWeek(selectedWeek === i + 1 ? null : i + 1)}
                      />
                      {/* Data point - Navy */}
                      <circle
                        cx={x}
                        cy={y}
                        r={isHovered || isSelected ? '9' : '7'}
                        fill="white"
                        stroke="rgb(15, 32, 75)"
                        strokeWidth={isSelected ? '5' : '4'}
                        className="transition-all duration-150 pointer-events-none"
                      />
                      {/* Inner dot */}
                      <circle
                        cx={x}
                        cy={y}
                        r="3"
                        fill={isSelected ? "rgb(15, 32, 75)" : isHovered ? "rgb(15, 32, 75)" : "transparent"}
                        className="transition-all duration-150 pointer-events-none"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* X-axis labels */}
              <div className="absolute inset-0 flex items-end justify-between pointer-events-none" style={{ top: 'auto', bottom: '-32px' }}>
                {performanceTrendData.datasets[0].data.map((value, i) => {
                      const isActive = hoveredWeek === i || selectedWeek === i + 1;
                      return (
                        <div
                          key={i}
                          className="flex flex-col items-center transition-all"
                          style={{ transform: 'translateX(-50%)', position: 'relative', left: `${(i / (performanceTrendData.datasets[0].data.length - 1)) * 100}%` }}
                        >
                          <span className={`text-[11px] font-bold transition-all ${isActive ? 'text-[var(--ufs-navy)] text-sm' : 'text-ufs-gray-500'}`}>
                            W{i + 1}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

          {/* Legend - Navy Minimalist */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t-2 border-ufs-gray-200">
            <div className="flex items-center gap-8 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-1 rounded-full bg-[var(--ufs-navy)]" />
                <span className="text-ufs-gray-700 font-medium">Current Period</span>
              </div>
              <div className="flex items-center gap-3">
                <svg width="40" height="4">
                  <line x1="0" y1="2" x2="40" y2="2" stroke="rgb(15, 32, 75)" strokeWidth="2" strokeDasharray="6,6" opacity="0.4" />
                </svg>
                <span className="text-ufs-gray-500 font-medium">Previous</span>
              </div>
            </div>
            {selectedWeek && (
              <button
                onClick={() => setSelectedWeek(null)}
                className="text-sm text-[var(--ufs-navy)] hover:text-[var(--ufs-maroon)] font-bold transition-colors"
              >
                Clear ×
              </button>
            )}
          </div>

          {/* Week Deep Dive - Fixed Height */}
          <div className="mt-8 h-[240px] flex items-start">
            {selectedWeek && weeklyDetails[selectedWeek - 1] && (
              <div className="w-full p-8 bg-[rgba(15,32,75,0.02)] rounded-lg border-l-4 border-[var(--ufs-navy)]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[var(--ufs-navy)]">
                  Week {selectedWeek} Breakdown
                </h3>
                <span className="text-xs font-bold uppercase tracking-wider text-ufs-gray-500">
                  {weeklyDetails[selectedWeek - 1].dateRange}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-ufs-gray-500 mb-2">Performance</div>
                  <div className="text-4xl font-bold text-[var(--ufs-navy)] tabular-nums">
                    {weeklyDetails[selectedWeek - 1].performance}<span className="text-xl">%</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-ufs-gray-500 mb-2">Change</div>
                  <div className="text-2xl font-bold text-[var(--ufs-navy)] tabular-nums">
                    {weeklyDetails[selectedWeek - 1].change >= 0 ? '+' : ''}{weeklyDetails[selectedWeek - 1].change.toFixed(1)}<span className="text-base">%</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-ufs-gray-500 mb-2">Learners</div>
                  <div className="text-2xl font-bold text-[var(--ufs-navy)] tabular-nums">
                    {weeklyDetails[selectedWeek - 1].learnersAssessed}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-ufs-gray-500 mb-2">Assessments</div>
                  <div className="text-2xl font-bold text-[var(--ufs-navy)] tabular-nums">
                    {weeklyDetails[selectedWeek - 1].assessmentsCompleted}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-ufs-gray-500 mb-2">Avg Time</div>
                  <div className="text-2xl font-bold text-[var(--ufs-navy)] tabular-nums">
                    {weeklyDetails[selectedWeek - 1].avgTimeSpent}<span className="text-base">m</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-ufs-gray-200">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-ufs-gray-500 mb-2">Top Topic</div>
                  <div className="text-lg font-bold text-[var(--edu-green)]">
                    {weeklyDetails[selectedWeek - 1].topTopic}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-ufs-gray-500 mb-2">At Risk</div>
                  <div className="text-lg font-bold text-[var(--ufs-maroon)]">
                    {weeklyDetails[selectedWeek - 1].strugglingTopic}
                    <span className="text-sm font-medium text-ufs-gray-500 ml-2">({weeklyDetails[selectedWeek - 1].interventions})</span>
                  </div>
                </div>
              </div>
              </div>
            )}
          </div>
        </div>

        {/* Learner Distribution - UFS Donut */}
        <div className="bg-white rounded-lg shadow-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[var(--ufs-navy)]">Learner Progress</h2>
            <ExplainButton onClick={() => handleExplainClick(learnerProgressPayload)} disabled={!learnerProgressPayload} />
          </div>
          <div className="relative w-56 h-56 mx-auto mb-8">
            {/* Donut Chart - UFS Colors */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* At Risk - Maroon */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="rgb(167, 25, 48)"
                strokeWidth="18"
                strokeDasharray={`${(learnerProgressDistribution.atRisk / totalLearners) * 251.2} 251.2`}
              />
              {/* Needs Support - Navy */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="rgb(15, 32, 75)"
                strokeWidth="18"
                strokeDasharray={`${(learnerProgressDistribution.needsSupport / totalLearners) * 251.2} 251.2`}
                strokeDashoffset={`-${(learnerProgressDistribution.atRisk / totalLearners) * 251.2}`}
                opacity="0.5"
              />
              {/* On Track - Education Green */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="rgb(0, 103, 90)"
                strokeWidth="18"
                strokeDasharray={`${(learnerProgressDistribution.onTrack / totalLearners) * 251.2} 251.2`}
                strokeDashoffset={`-${((learnerProgressDistribution.atRisk + learnerProgressDistribution.needsSupport) / totalLearners) * 251.2}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <div className="text-6xl font-bold text-[var(--ufs-navy)] tabular-nums">{totalLearners}</div>
              <div className="text-xs font-bold uppercase tracking-wider text-ufs-gray-500 mt-2">Total</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-ufs-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[var(--edu-green)]" />
                <span className="text-sm font-bold text-ufs-gray-900">On Track</span>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-[var(--edu-green)] tabular-nums">{learnerProgressDistribution.onTrack}</div>
                <div className="text-xs text-ufs-gray-500 font-medium">
                  {Math.round((learnerProgressDistribution.onTrack / totalLearners) * 100)}%
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-ufs-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[var(--ufs-navy)] opacity-50" />
                <span className="text-sm font-bold text-ufs-gray-900">Needs Support</span>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-[var(--ufs-navy)] tabular-nums">{learnerProgressDistribution.needsSupport}</div>
                <div className="text-xs text-ufs-gray-500 font-medium">
                  {Math.round((learnerProgressDistribution.needsSupport / totalLearners) * 100)}%
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[var(--ufs-maroon)]" />
                <span className="text-sm font-bold text-ufs-gray-900">At Risk</span>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-[var(--ufs-maroon)] tabular-nums">{learnerProgressDistribution.atRisk}</div>
                <div className="text-xs text-ufs-gray-500 font-medium">
                  {Math.round((learnerProgressDistribution.atRisk / totalLearners) * 100)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EXTRAORDINARY: Hexagon Grid + Bloomberg Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {/* Skill Mastery - HEXAGON GRID (Extraordinary!) */}
        <div className="bg-white rounded-lg shadow-card p-8">
          <div className="mb-8 pb-4 border-b-2 border-ufs-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[var(--ufs-navy)]">Skill Mastery</h2>
              <p className="text-sm text-ufs-gray-500 mt-1">CAPS strands • Geometric view</p>
            </div>
            <ExplainButton onClick={() => handleExplainClick(skillMasteryPayload)} disabled={!skillMasteryPayload} />
          </div>
          <SkillHexagonGrid 
            skills={skillMasteryData.labels.map((label, i) => ({
              label: label.split(' ')[0], // Short labels
              value: skillMasteryData.datasets[0].data[i]
            }))}
          />
        </div>

        {/* Top Misconceptions - BLOOMBERG BARS (Premium!) */}
        <div className="bg-white rounded-lg shadow-card p-8">
          <div className="mb-8 pb-4 border-b-2 border-ufs-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[var(--ufs-navy)]">Top Misconceptions</h2>
              <p className="text-sm text-ufs-gray-500 mt-1">Ranked by learner impact</p>
            </div>
            <ExplainButton onClick={() => handleExplainClick(misconceptionSummaryPayload)} />
          </div>
          
          <MisconceptionBloomberg 
            misconceptions={misconceptionFrequencyData.labels.map((label, i) => ({
              label,
              count: misconceptionFrequencyData.datasets[0].data[i]
            }))}
          />
        </div>
      </div>

      {viewMode === 'detailed' && (
        <>
          {/* Skill Mastery Heatmap - Detailed View Only */}
          <Card className="shadow-md hover:shadow-xl transition-shadow">
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-neutral-900 dark:text-neutral-100">Skill Mastery Heatmap</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Individual learner performance across skills</p>
                </div>
                <Button size="sm" variant="outline">
                  📥 Export Data
                </Button>
              </div>
            </div>
            <div className="p-6 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-neutral-300 dark:border-neutral-700">
                    <th className="text-left text-sm font-bold px-3 py-3 sticky left-0 bg-white dark:bg-neutral-900">
                      Learner
                    </th>
                    {heatmapData[0]?.masteryLevels.map((skill) => (
                      <th
                        key={skill.skillId}
                        className="text-xs font-semibold px-2 py-3 min-w-[70px] text-center"
                        title={skill.skillName}
                      >
                        {skill.skillName.split(' ')[0]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatmapData.map((row) => (
                    <tr key={row.learnerId} className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                      <td className="text-sm px-3 py-3 font-semibold sticky left-0 bg-white dark:bg-neutral-900">
                        {row.learnerName}
                      </td>
                      {row.masteryLevels.map((skill) => {
                        const getColor = (mastery: number) => {
                          if (mastery >= 80) return 'bg-success-500';
                          if (mastery >= 60) return 'bg-info-500';
                          if (mastery >= 40) return 'bg-warning-500';
                          return 'bg-error-500';
                        };
                        const getGrade = (mastery: number) => {
                          if (mastery >= 80) return 'A';
                          if (mastery >= 60) return 'B';
                          if (mastery >= 40) return 'C';
                          return 'D';
                        };
                        return (
                          <td key={skill.skillId} className="px-2 py-2">
                            <div
                              className={`h-12 rounded-lg ${getColor(skill.mastery)} flex flex-col items-center justify-center text-white font-bold shadow-sm hover:scale-110 hover:shadow-md transition-all cursor-pointer group relative`}
                              title={`${skill.skillName}: ${skill.mastery}%`}
                            >
                              <span className="text-xs">{skill.mastery}%</span>
                              <span className="text-[10px] opacity-75">Grade {getGrade(skill.mastery)}</span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-6 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-error-500 rounded" />
                    <span className="font-medium">0-39% (D)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-warning-500 rounded" />
                    <span className="font-medium">40-59% (C)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-info-500 rounded" />
                    <span className="font-medium">60-79% (B)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-success-500 rounded" />
                    <span className="font-medium">80-100% (A)</span>
                  </div>
                </div>
                <span className="text-xs text-neutral-500">
                  Showing {heatmapData.length} learners × {heatmapData[0]?.masteryLevels.length || 0} skills
                </span>
              </div>
            </div>
          </Card>
        </>
      )}
      </div>
      <NarrationTranscriptPanel
        open={isTranscriptOpen}
        onClose={handleCloseTranscript}
        payload={activePayload}
        transcript={activeTranscript}
        isGenerating={isTranscriptGenerating}
        error={transcriptError}
        onRetry={() => generateTranscript()}
        chatMessages={chatMessages}
        onSendQuestion={sendQuestion}
        isSendingQuestion={isSendingQuestion}
        chatError={chatError}
        isMaximized={isTranscriptMaximized}
        onToggleMaximize={() => setTranscriptMaximized((value) => !value)}
      />
    </>
  );
}
