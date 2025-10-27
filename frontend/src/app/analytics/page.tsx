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
import { useState } from 'react';

export default function AnalyticsPage() {
  const [selectedClass, setSelectedClass] = useState(currentUser.classes[0]);
  const [timeRange, setTimeRange] = useState('12weeks');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  // Get class-specific analytics
  const classAnalytics = getClassAnalytics(selectedClass);
  const performanceTrendData = getPerformanceTrendData(selectedClass);
  const skillMasteryData = getSkillMasteryData(selectedClass);
  const misconceptionFrequencyData = getMisconceptionData(selectedClass);
  const timeSpentData = getTimeSpentData(selectedClass);
  const learnerProgressDistribution = classAnalytics.learnerDistribution;
  const engagementMetrics = {
    dailyActiveUsers: classAnalytics.dailyActiveUsers,
    weeklyActiveUsers: classAnalytics.weeklyActiveUsers,
    averageSessionDuration: classAnalytics.averageSessionDuration,
    completionRate: classAnalytics.completionRate,
  };

  const heatmapData = generateSkillMasteryHeatmap(selectedClass);

  // Enhanced weekly data with additional context (using class-specific data)
  const weeklyDetails = performanceTrendData.datasets[0].data.map((value, i) => {
    const weeklyLearners = Math.round(classAnalytics.totalLearners * (0.35 + Math.random() * 0.15)); // 35-50% assessed weekly
    return {
      week: i + 1,
      performance: value,
      dateRange: `Jan ${i * 7 + 1}-${i * 7 + 7}`,
      learnersAssessed: weeklyLearners,
      assessmentsCompleted: Math.round(weeklyLearners * (1 + Math.random() * 0.3)), // Some learners do multiple assessments
      avgTimeSpent: engagementMetrics.averageSessionDuration + Math.floor((Math.random() - 0.5) * 10),
      topTopic: skillMasteryData.labels[Math.floor(Math.random() * skillMasteryData.labels.length)],
      strugglingTopic: ['Fractions', 'Equations', 'Angles', 'Probability'][Math.floor(Math.random() * 4)],
      interventions: Math.round(learnerProgressDistribution.atRisk * (0.3 + Math.random() * 0.4)), // 30-70% of at-risk learners
      change: i > 0 ? value - performanceTrendData.datasets[0].data[i - 1] : 0,
    };
  });

  // Previous period comparison data (consistently lower)
  const previousPeriodData = performanceTrendData.datasets[0].data.map(v => v - 3 - Math.random() * 5);

  // Calculate additional metrics from class analytics
  const totalLearners = classAnalytics.totalLearners;
  const averagePerformance = classAnalytics.avgPerformance;
  const firstWeekPerf = performanceTrendData.datasets[0].data[0];
  const lastWeekPerf = performanceTrendData.datasets[0].data[11];
  const performanceTrend = Math.round(((lastWeekPerf - firstWeekPerf) / firstWeekPerf) * 100);
  const assessmentsThisWeek = classAnalytics.assessmentsThisWeek;
  const completionTrend = Math.round((classAnalytics.completionRate - 88) * 2); // Relative to baseline 88%

  return (
    <div className="space-y-6 pb-8">
      {/* Enhanced Header with Quick Stats */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-900 dark:to-secondary-900 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-extrabold mb-2">Analytics & Insights</h1>
            <p className="text-primary-100 dark:text-primary-200">
              Comprehensive performance analytics • Last updated 5 min ago
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              🔍 Deep Diagnostics
            </Button>
            <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              📊 Export Report
            </Button>
            <Button size="sm" className="bg-white text-primary-600 hover:bg-white/90">
              💾 Download CSV
            </Button>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="text-xs text-primary-100 mb-1">Total Learners</div>
            <div className="text-2xl font-bold">{totalLearners}</div>
            <div className="text-xs text-primary-200">Across {currentUser.classes.length} classes</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="text-xs text-primary-100 mb-1">Avg Performance</div>
            <div className="text-2xl font-bold">{averagePerformance}%</div>
            <div className="text-xs text-success-200">↑ {performanceTrend}% this month</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="text-xs text-primary-100 mb-1">Assessments</div>
            <div className="text-2xl font-bold">{assessmentsThisWeek}</div>
            <div className="text-xs text-primary-200">Completed this week</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="text-xs text-primary-100 mb-1">Completion Rate</div>
            <div className="text-2xl font-bold">{engagementMetrics.completionRate}%</div>
            <div className="text-xs text-success-200">↑ {completionTrend}% improvement</div>
          </div>
        </div>
      </div>

      {/* Advanced Filters & View Mode */}
      <Card className="p-4 shadow-md">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Class</label>
              <select
                className="rounded-lg border-2 border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium bg-white dark:bg-neutral-900 hover:border-primary-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
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
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Time Range</label>
              <select
                className="rounded-lg border-2 border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium bg-white dark:bg-neutral-900 hover:border-primary-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="1week">Last Week</option>
                <option value="4weeks">Last Month</option>
                <option value="12weeks">Last 12 Weeks</option>
                <option value="year">This Year</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">View Mode</label>
              <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('overview')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    viewMode === 'overview'
                      ? 'bg-white dark:bg-neutral-700 shadow-sm text-primary-600 dark:text-primary-400'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                >
                  📊 Overview
                </button>
                <button
                  onClick={() => setViewMode('detailed')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    viewMode === 'detailed'
                      ? 'bg-white dark:bg-neutral-700 shadow-sm text-primary-600 dark:text-primary-400'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                >
                  🔍 Detailed
                </button>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="h-[42px]">
            ⚖️ Compare Classes
          </Button>
        </div>
      </Card>

      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5 shadow-md hover:shadow-xl transition-all border-l-4 border-l-primary-500">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-950 flex items-center justify-center text-2xl">
              👥
            </div>
            <span className="text-xs font-bold text-success bg-success-100 dark:bg-success-950 px-2 py-1 rounded-full">
              ↑ 12%
            </span>
          </div>
          <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-1">Daily Active Users</p>
          <p className="text-4xl font-extrabold text-neutral-900 dark:text-neutral-100 mb-2">
            {engagementMetrics.dailyActiveUsers}
          </p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500">of {engagementMetrics.weeklyActiveUsers} weekly</span>
            <div className="flex items-center gap-1">
              <div className="w-20 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full"
                  style={{ width: `${(engagementMetrics.dailyActiveUsers / engagementMetrics.weeklyActiveUsers) * 100}%` }}
                />
              </div>
              <span className="font-semibold">
                {Math.round((engagementMetrics.dailyActiveUsers / engagementMetrics.weeklyActiveUsers) * 100)}%
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-5 shadow-md hover:shadow-xl transition-all border-l-4 border-l-secondary-500">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-secondary-100 dark:bg-secondary-950 flex items-center justify-center text-2xl">
              ⏱️
            </div>
            <span className="text-xs font-bold text-success bg-success-100 dark:bg-success-950 px-2 py-1 rounded-full">
              ↑ 8%
            </span>
          </div>
          <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-1">Avg Session Duration</p>
          <p className="text-4xl font-extrabold text-neutral-900 dark:text-neutral-100 mb-2">
            {engagementMetrics.averageSessionDuration}
            <span className="text-lg text-neutral-500">min</span>
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-secondary-500 rounded-full"
                style={{ width: `${(engagementMetrics.averageSessionDuration / 60) * 100}%` }}
              />
            </div>
            <span className="text-xs text-neutral-500">Target: 45min</span>
          </div>
        </Card>

        <Card className="p-5 shadow-md hover:shadow-xl transition-all border-l-4 border-l-success-500">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-success-100 dark:bg-success-950 flex items-center justify-center text-2xl">
              ✅
            </div>
            <span className="text-xs font-bold text-success bg-success-100 dark:bg-success-950 px-2 py-1 rounded-full">
              ↑ 5%
            </span>
          </div>
          <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-1">Completion Rate</p>
          <p className="text-4xl font-extrabold text-neutral-900 dark:text-neutral-100 mb-2">
            {engagementMetrics.completionRate}%
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-success-500 rounded-full"
                style={{ width: `${engagementMetrics.completionRate}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-success">{engagementMetrics.completionRate}%</span>
          </div>
        </Card>

        <Card className="p-5 shadow-md hover:shadow-xl transition-all border-l-4 border-l-error-500">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-error-100 dark:bg-error-950 flex items-center justify-center text-2xl">
              ⚠️
            </div>
            <span className="text-xs font-bold text-success bg-success-100 dark:bg-success-950 px-2 py-1 rounded-full">
              ↓ 3%
            </span>
          </div>
          <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-1">At Risk Learners</p>
          <p className="text-4xl font-extrabold text-neutral-900 dark:text-neutral-100 mb-2">
            {learnerProgressDistribution.atRisk}
          </p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500">require intervention</span>
            <span className="font-semibold text-error">
              {Math.round((learnerProgressDistribution.atRisk / totalLearners) * 100)}% of total
            </span>
          </div>
        </Card>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Trend - Interactive Line Chart */}
        <Card className="lg:col-span-2 p-6 shadow-md hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-extrabold text-neutral-900 dark:text-neutral-100">Performance Trend</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                {selectedWeek ? `Week ${selectedWeek} Details` : 'Hover over points for details • Click to drill down'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Average</div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{averagePerformance}%</div>
              <div className={`text-xs font-semibold ${performanceTrend >= 0 ? 'text-success' : 'text-error'}`}>
                {performanceTrend >= 0 ? '↑' : '↓'} {Math.abs(performanceTrend)}% improvement
              </div>
            </div>
          </div>

          {/* Interactive Tooltip - Fixed height container to prevent layout shift */}
          <div className="mb-4 min-h-[120px]">
            {hoveredWeek !== null && weeklyDetails[hoveredWeek] && (
              <div className="p-4 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-950 dark:to-primary-900 rounded-lg border-l-4 border-primary-500 transition-opacity duration-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Week {weeklyDetails[hoveredWeek].week}</div>
                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {weeklyDetails[hoveredWeek].performance}%
                    </div>
                    <div className={`text-xs font-semibold ${weeklyDetails[hoveredWeek].change >= 0 ? 'text-success' : 'text-error'}`}>
                      {weeklyDetails[hoveredWeek].change >= 0 ? '↑' : '↓'} {Math.abs(weeklyDetails[hoveredWeek].change).toFixed(1)}% from prev
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Learners Assessed</div>
                    <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                      {weeklyDetails[hoveredWeek].learnersAssessed}
                    </div>
                    <div className="text-xs text-neutral-500">{weeklyDetails[hoveredWeek].assessmentsCompleted} assessments</div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Top Performing</div>
                    <div className="text-sm font-bold text-success-600 dark:text-success-400">
                      🎯 {weeklyDetails[hoveredWeek].topTopic}
                    </div>
                    <div className="text-xs text-neutral-500">{weeklyDetails[hoveredWeek].avgTimeSpent} min avg</div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Needs Support</div>
                    <div className="text-sm font-bold text-warning-600 dark:text-warning-400">
                      ⚠️ {weeklyDetails[hoveredWeek].strugglingTopic}
                    </div>
                    <div className="text-xs text-neutral-500">{weeklyDetails[hoveredWeek].interventions} interventions</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Line Chart with SVG */}
          <div className="relative h-72 border-l-2 border-b-2 border-neutral-300 dark:border-neutral-700 p-4">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-neutral-500 pr-2">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>

            {/* Grid lines */}
            <div className="absolute left-12 right-0 top-0 bottom-8 flex flex-col justify-between">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="w-full border-t border-neutral-200 dark:border-neutral-800 border-dashed" />
              ))}
            </div>

            {/* Target line at 80% */}
            <div className="absolute left-12 right-0" style={{ bottom: 'calc(8px + 80% * (100% - 32px) / 100)' }}>
              <div className="w-full border-t-2 border-success-300 dark:border-success-700 border-dashed opacity-50" />
            </div>

            {/* Chart area */}
            <div className="relative h-full ml-12">
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 1000 280"
                preserveAspectRatio="none"
              >
                {/* Gradients */}
                <defs>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.05" />
                  </linearGradient>
                  <linearGradient id="previousPeriodGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgb(156, 163, 175)" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="rgb(156, 163, 175)" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {/* Previous period comparison (dashed line with area) */}
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
                  stroke="rgb(156, 163, 175)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.4"
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

                {/* Current period line */}
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
                  stroke="rgb(59, 130, 246)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow-md"
                />

                {/* Data points with enhanced interactivity */}
                {performanceTrendData.datasets[0].data.map((value, i) => {
                  const x = (i / (performanceTrendData.datasets[0].data.length - 1)) * 1000;
                  const y = 280 - (value / 100) * 280;
                  const isHovered = hoveredWeek === i;
                  const isSelected = selectedWeek === i + 1;
                  return (
                    <g key={i}>
                      {/* Static highlight circle for selected point - no animation */}
                      {isSelected && (
                        <>
                          <circle
                            cx={x}
                            cy={y}
                            r="20"
                            fill="rgb(59, 130, 246)"
                            opacity="0.1"
                          />
                          <circle
                            cx={x}
                            cy={y}
                            r="15"
                            fill="rgb(59, 130, 246)"
                            opacity="0.15"
                          />
                        </>
                      )}
                      {/* Subtle glow on hover - no ping animation */}
                      {isHovered && !isSelected && (
                        <circle
                          cx={x}
                          cy={y}
                          r="12"
                          fill="rgb(59, 130, 246)"
                          opacity="0.2"
                        />
                      )}
                      {/* Interactive hit area */}
                      <circle
                        cx={x}
                        cy={y}
                        r="20"
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredWeek(i)}
                        onMouseLeave={() => setHoveredWeek(null)}
                        onClick={() => setSelectedWeek(selectedWeek === i + 1 ? null : i + 1)}
                      />
                      {/* Main data point */}
                      <circle
                        cx={x}
                        cy={y}
                        r={isHovered || isSelected ? '8' : '6'}
                        fill="white"
                        stroke="rgb(59, 130, 246)"
                        strokeWidth={isSelected ? '4' : '3'}
                        className="transition-all duration-150 pointer-events-none"
                      />
                      {/* Inner dot */}
                      <circle
                        cx={x}
                        cy={y}
                        r="3"
                        fill={isSelected ? "rgb(59, 130, 246)" : isHovered ? "rgb(59, 130, 246)" : "transparent"}
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
                      <span className={`text-[10px] font-medium transition-all ${isActive ? 'text-primary-600 dark:text-primary-400 font-bold text-xs' : 'text-neutral-600 dark:text-neutral-400'}`}>
                        W{i + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Enhanced Legend */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-6 text-xs flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary-500" />
                <span className="text-neutral-600 dark:text-neutral-400">Current Period</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 border-t-2 border-dashed border-neutral-400" />
                <span className="text-neutral-600 dark:text-neutral-400">Previous Period</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 border-t-2 border-dashed border-success-500" />
                <span className="text-neutral-600 dark:text-neutral-400">Target: 80%</span>
              </div>
            </div>
            {selectedWeek ? (
              <button
                onClick={() => setSelectedWeek(null)}
                className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-semibold underline"
              >
                Clear Selection
              </button>
            ) : (
              <div className="text-xs text-neutral-500">
                From W1 ({performanceTrendData.datasets[0].data[0]}%) to W12 ({performanceTrendData.datasets[0].data[11]}%)
              </div>
            )}
          </div>

          {/* Detailed Week Breakdown (when clicked) - Fixed container to prevent layout shift */}
          <div className="mt-4 min-h-[240px]">
            {selectedWeek && weeklyDetails[selectedWeek - 1] && (
              <div className="p-5 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-neutral-900 dark:to-secondary-950 rounded-xl border-2 border-primary-200 dark:border-primary-800 transition-opacity duration-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  Week {selectedWeek} Deep Dive
                </h4>
                <span className="text-xs px-3 py-1 bg-primary-600 text-white rounded-full font-semibold">
                  {weeklyDetails[selectedWeek - 1].dateRange}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-3 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                  <div className="text-xs text-neutral-500 mb-1">Performance</div>
                  <div className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">
                    {weeklyDetails[selectedWeek - 1].performance}%
                  </div>
                </div>
                <div className="p-3 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                  <div className="text-xs text-neutral-500 mb-1">Change</div>
                  <div className={`text-xl font-bold ${weeklyDetails[selectedWeek - 1].change >= 0 ? 'text-success' : 'text-error'}`}>
                    {weeklyDetails[selectedWeek - 1].change >= 0 ? '+' : ''}{weeklyDetails[selectedWeek - 1].change.toFixed(1)}%
                  </div>
                </div>
                <div className="p-3 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                  <div className="text-xs text-neutral-500 mb-1">Learners</div>
                  <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                    {weeklyDetails[selectedWeek - 1].learnersAssessed}
                  </div>
                </div>
                <div className="p-3 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                  <div className="text-xs text-neutral-500 mb-1">Assessments</div>
                  <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                    {weeklyDetails[selectedWeek - 1].assessmentsCompleted}
                  </div>
                </div>
                <div className="p-3 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                  <div className="text-xs text-neutral-500 mb-1">Avg Time</div>
                  <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                    {weeklyDetails[selectedWeek - 1].avgTimeSpent}m
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-3 bg-success-50 dark:bg-success-950 rounded-lg border border-success-200 dark:border-success-800">
                  <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">🎯 Top Performing Topic</div>
                  <div className="text-lg font-bold text-success-600 dark:text-success-400">
                    {weeklyDetails[selectedWeek - 1].topTopic}
                  </div>
                </div>
                <div className="p-3 bg-warning-50 dark:bg-warning-950 rounded-lg border border-warning-200 dark:border-warning-800">
                  <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">⚠️ Needs Attention</div>
                  <div className="text-lg font-bold text-warning-600 dark:text-warning-400">
                    {weeklyDetails[selectedWeek - 1].strugglingTopic}
                    <span className="text-sm font-normal ml-2">({weeklyDetails[selectedWeek - 1].interventions} interventions)</span>
                  </div>
                </div>
              </div>
              </div>
            )}
          </div>
        </Card>

        {/* Learner Distribution - Enhanced with Donut */}
        <Card className="p-6 shadow-md hover:shadow-xl transition-shadow">
          <h3 className="text-lg font-extrabold text-neutral-900 dark:text-neutral-100 mb-4">Learner Distribution</h3>
          <div className="relative w-48 h-48 mx-auto mb-6">
            {/* Donut Chart SVG */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* At Risk - Red */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="20"
                strokeDasharray={`${(learnerProgressDistribution.atRisk / totalLearners) * 251.2} 251.2`}
                className="text-error-500"
              />
              {/* Needs Support - Yellow */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="20"
                strokeDasharray={`${(learnerProgressDistribution.needsSupport / totalLearners) * 251.2} 251.2`}
                strokeDashoffset={`-${(learnerProgressDistribution.atRisk / totalLearners) * 251.2}`}
                className="text-warning-500"
              />
              {/* On Track - Green */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="20"
                strokeDasharray={`${(learnerProgressDistribution.onTrack / totalLearners) * 251.2} 251.2`}
                strokeDashoffset={`-${((learnerProgressDistribution.atRisk + learnerProgressDistribution.needsSupport) / totalLearners) * 251.2}`}
                className="text-success-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <div className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100">{totalLearners}</div>
              <div className="text-xs text-neutral-500">Total</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-success-50 dark:bg-success-950 border border-success-200 dark:border-success-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success-500" />
                <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">On Track</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{learnerProgressDistribution.onTrack}</div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400">
                  {Math.round((learnerProgressDistribution.onTrack / totalLearners) * 100)}%
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-warning-50 dark:bg-warning-950 border border-warning-200 dark:border-warning-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-warning-500" />
                <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Needs Support</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{learnerProgressDistribution.needsSupport}</div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400">
                  {Math.round((learnerProgressDistribution.needsSupport / totalLearners) * 100)}%
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-error-50 dark:bg-error-950 border border-error-200 dark:border-error-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-error-500" />
                <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">At Risk</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{learnerProgressDistribution.atRisk}</div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400">
                  {Math.round((learnerProgressDistribution.atRisk / totalLearners) * 100)}%
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Second Row - Skills and Misconceptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Mastery by Strand - Enhanced */}
        <Card className="p-6 shadow-md hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-extrabold text-neutral-900 dark:text-neutral-100">Skill Mastery by Strand</h3>
              <p className="text-xs text-neutral-500 mt-0.5">CAPS Mathematics curriculum</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-100">72%</div>
              <div className="text-xs text-neutral-500">Overall</div>
            </div>
          </div>

          <div className="space-y-4">
            {skillMasteryData.labels.map((label, i) => {
              const value = skillMasteryData.datasets[0].data[i];
              const colors = ['bg-primary-500', 'bg-secondary-500', 'bg-success-500', 'bg-warning-500', 'bg-info-500'];
              return (
                <div key={label} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{label}</span>
                    <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{value}%</span>
                  </div>
                  <div className="relative h-4 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors[i % colors.length]} rounded-full transition-all duration-500 group-hover:scale-105`}
                      style={{ width: `${value}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] font-semibold text-white drop-shadow">{value}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Top Misconceptions - Enhanced */}
        <Card className="p-6 shadow-md hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-extrabold text-neutral-900 dark:text-neutral-100">Top Misconceptions</h3>
              <p className="text-xs text-neutral-500 mt-0.5">Most common errors detected</p>
            </div>
            <Button size="sm" variant="outline" className="text-xs">
              View All
            </Button>
          </div>
          <div className="space-y-4">
            {misconceptionFrequencyData.labels.map((label, i) => {
              const value = misconceptionFrequencyData.datasets[0].data[i];
              const maxValue = Math.max(...misconceptionFrequencyData.datasets[0].data);
              const percentage = (value / maxValue) * 100;
              return (
                <div key={label} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-error-100 dark:bg-error-950 text-error-600 dark:text-error-400 flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </div>
                      <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-neutral-500">{value} learners</span>
                      <span className="text-lg font-bold text-error">{value}</span>
                    </div>
                  </div>
                  <div className="relative h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-error-600 to-error-400 rounded-full transition-all duration-500 group-hover:scale-105"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Class Performance Comparison - Skill-Level Heatmap */}
      <Card className="p-6 shadow-md hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-extrabold text-neutral-900 dark:text-neutral-100">Skill Mastery Comparison Across Classes</h3>
            <p className="text-xs text-neutral-500 mt-0.5">CAPS curriculum strands • Compare performance across your classes</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-600 dark:text-neutral-400">Legend:</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-error-500" title="0-49%" />
                <div className="w-4 h-4 rounded bg-warning-500" title="50-69%" />
                <div className="w-4 h-4 rounded bg-info-500" title="70-79%" />
                <div className="w-4 h-4 rounded bg-success-500" title="80-100%" />
              </div>
            </div>
          </div>
        </div>

        {/* Skill comparison table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-neutral-300 dark:border-neutral-700">
                <th className="text-left text-sm font-bold px-4 py-3 bg-neutral-50 dark:bg-neutral-900 sticky left-0 z-10">
                  CAPS Strand
                </th>
                {currentUser.classes.map((classId) => {
                  const cls = classes.find((c) => c.id === classId);
                  const classData = getSkillMasteryData(classId);
                  const avgPerf = Math.round(classData.datasets[0].data.reduce((a, b) => a + b, 0) / classData.datasets[0].data.length);
                  return (
                    <th key={classId} className="text-center text-sm font-bold px-4 py-3 min-w-[140px]">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-neutral-900 dark:text-neutral-100">{cls?.name}</span>
                        <span className="text-xs font-normal text-neutral-500">{avgPerf}% avg</span>
                      </div>
                    </th>
                  );
                })}
                <th className="text-center text-sm font-bold px-4 py-3 bg-neutral-50 dark:bg-neutral-900 sticky right-0 z-10">
                  🚩 Red Flag
                </th>
              </tr>
            </thead>
            <tbody>
              {skillMasteryData.labels.map((skillLabel, skillIdx) => {
                const skillValues = currentUser.classes.map((classId) => {
                  const classData = getSkillMasteryData(classId);
                  return classData.datasets[0].data[skillIdx];
                });
                const minVal = Math.min(...skillValues);
                const maxVal = Math.max(...skillValues);
                const range = maxVal - minVal;

                const getColorClass = (value: number) => {
                  if (value >= 80) return 'bg-success-500 text-white';
                  if (value >= 70) return 'bg-info-500 text-white';
                  if (value >= 50) return 'bg-warning-500 text-white';
                  return 'bg-error-500 text-white';
                };

                return (
                  <tr key={skillLabel} className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                    <td className="text-sm font-semibold px-4 py-4 bg-neutral-50 dark:bg-neutral-900 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-900 dark:text-neutral-100">{skillLabel}</span>
                      </div>
                    </td>
                    {currentUser.classes.map((classId, idx) => {
                      const cls = classes.find((c) => c.id === classId);
                      const classData = getSkillMasteryData(classId);
                      const value = classData.datasets[0].data[skillIdx];
                      const isLowest = value === minVal && range > 5;
                      const isHighest = value === maxVal && range > 5;

                      return (
                        <td key={classId} className="px-4 py-3">
                          <div className="relative group">
                            <div
                              className={`h-16 rounded-lg ${getColorClass(value)} flex flex-col items-center justify-center font-bold shadow-sm hover:scale-105 hover:shadow-md transition-all cursor-pointer relative`}
                              title={`${cls?.name}: ${value}% in ${skillLabel}`}
                            >
                              {isHighest && (
                                <div className="absolute -top-2 -right-2 text-lg">⭐</div>
                              )}
                              {isLowest && range > 10 && (
                                <div className="absolute -top-2 -right-2 text-lg">⚠️</div>
                              )}
                              <span className="text-2xl">{value}%</span>
                              <span className="text-[10px] opacity-75">
                                {value >= 80 ? 'Excellent' : value >= 70 ? 'Good' : value >= 50 ? 'Fair' : 'Needs Help'}
                              </span>
                            </div>
                            {/* Tooltip on hover */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-20 shadow-lg">
                              {cls?.name}: {value}%
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900 dark:border-t-neutral-100" />
                            </div>
                          </div>
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-center bg-neutral-50 dark:bg-neutral-900 sticky right-0 z-10">
                      {(() => {
                        // Find the class with lowest performance for this skill
                        const classPerformances = currentUser.classes.map((classId, idx) => {
                          const cls = classes.find((c) => c.id === classId);
                          const classData = getSkillMasteryData(classId);
                          const value = classData.datasets[0].data[skillIdx];
                          return { classId, className: cls?.name, value };
                        });
                        const lowest = classPerformances.reduce((min, curr) => curr.value < min.value ? curr : min);
                        
                        return (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">{lowest.className}</span>
                            <span className={`text-lg font-bold ${lowest.value < 60 ? 'text-error-600 dark:text-error-400' : lowest.value < 70 ? 'text-warning-600 dark:text-warning-400' : 'text-neutral-600 dark:text-neutral-400'}`}>
                              {lowest.value}%
                            </span>
                            {lowest.value < 70 && (
                              <span className="text-xs px-2 py-0.5 bg-error-100 dark:bg-error-950 text-error-700 dark:text-error-400 rounded-full font-semibold">
                                Needs support
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary insights */}
        <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(() => {
              // Calculate strongest skill across all classes
              const skillAverages = skillMasteryData.labels.map((_, skillIdx) => {
                const values = currentUser.classes.map((classId) => {
                  const classData = getSkillMasteryData(classId);
                  return classData.datasets[0].data[skillIdx];
                });
                return {
                  skill: skillMasteryData.labels[skillIdx],
                  avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
                  variance: Math.max(...values) - Math.min(...values)
                };
              });

              const strongest = skillAverages.reduce((max, curr) => curr.avg > max.avg ? curr : max);
              const weakest = skillAverages.reduce((min, curr) => curr.avg < min.avg ? curr : min);
              const mostVaried = skillAverages.reduce((max, curr) => curr.variance > max.variance ? curr : max);

              return (
                <>
                  <div className="p-4 rounded-lg bg-success-50 dark:bg-success-950 border border-success-200 dark:border-success-800">
                    <div className="text-2xl mb-2">💪</div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Strongest Skill</div>
                    <div className="text-sm font-bold text-success-700 dark:text-success-400">{strongest.skill}</div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">{strongest.avg}% average</div>
                  </div>

                  <div className="p-4 rounded-lg bg-warning-50 dark:bg-warning-950 border border-warning-200 dark:border-warning-800">
                    <div className="text-2xl mb-2">📚</div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Needs Focus</div>
                    <div className="text-sm font-bold text-warning-700 dark:text-warning-400">{weakest.skill}</div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">{weakest.avg}% average</div>
                  </div>

                  <div className="p-4 rounded-lg bg-error-50 dark:bg-error-950 border border-error-200 dark:border-error-800">
                    <div className="text-2xl mb-2">⚖️</div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Most Inconsistent</div>
                    <div className="text-sm font-bold text-error-700 dark:text-error-400">{mostVaried.skill}</div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">{mostVaried.variance}% variance</div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </Card>

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
  );
}



