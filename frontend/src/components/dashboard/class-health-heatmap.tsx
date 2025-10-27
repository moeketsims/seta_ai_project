'use client';

import { useState } from 'react';

interface HeatmapCell {
  mastery: number;
  below: number;
  trend?: number; // +3 means 3% improvement, -5 means 5% decline
}

interface ClassHealthHeatmapProps {
  classes: string[];
  topics: string[];
  data: HeatmapCell[][];
}

export function ClassHealthHeatmap({ classes, topics, data }: ClassHealthHeatmapProps) {
  const [showOnlyIssues, setShowOnlyIssues] = useState(false);
  const [showAllIndicators, setShowAllIndicators] = useState(true);

  const getCellColor = (mastery: number) => {
    if (mastery >= 80) return 'bg-success-500';
    if (mastery >= 70) return 'bg-success-400';
    if (mastery >= 60) return 'bg-warning-400';
    return 'bg-error-500';
  };

  const getAccessibilityGrade = (mastery: number) => {
    if (mastery >= 80) return 'A';
    if (mastery >= 70) return 'B';
    if (mastery >= 60) return 'C';
    return 'D';
  };

  const getTrendIcon = (trend?: number) => {
    if (!trend) return null;
    if (trend > 0) return <span className="text-success-200 dark:text-success-300 text-[10px] ml-1 font-bold" title={`+${trend}% from last week`}>↑{trend}%</span>;
    if (trend < 0) return <span className="text-error-200 dark:text-error-300 text-[10px] ml-1 font-bold" title={`${trend}% from last week`}>↓{Math.abs(trend)}%</span>;
    return null;
  };

  const shouldShowCell = (cell: HeatmapCell) => {
    if (!showOnlyIssues) return true;
    return cell.mastery < 70 || cell.below > 0;
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h2 className="text-xl font-extrabold text-neutral-900 dark:text-neutral-100">Class Health Heatmap</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Click any cell to see student roster • Hover for details</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-500">(this week)</span>
          <button
            onClick={() => setShowOnlyIssues(!showOnlyIssues)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              showOnlyIssues
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            {showOnlyIssues ? '✓ Issues Only' : 'Show Issues Only'}
          </button>
          <button
            onClick={() => setShowAllIndicators(!showAllIndicators)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              showAllIndicators
                ? 'bg-secondary-600 text-white shadow-sm'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
            title="Toggle detailed view with all badges"
          >
            {showAllIndicators ? 'Simple View' : 'Detailed View'}
          </button>
        </div>
      </div>

      {/* Enhanced Legend */}
      <div className="mb-4 p-3 bg-neutral-50 dark:bg-neutral-800/30 rounded-lg border border-neutral-200 dark:border-neutral-700">
        <div className="flex items-start justify-between gap-6 text-xs flex-wrap">
          <div>
            <p className="font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Performance Levels</p>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded bg-success-500 flex items-center justify-center text-white text-[10px] font-bold">A</span>
                <span className="text-neutral-600 dark:text-neutral-400">Excellent (≥80%)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded bg-success-400 flex items-center justify-center text-white text-[10px] font-bold">B</span>
                <span className="text-neutral-600 dark:text-neutral-400">Good (70-79%)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded bg-warning-400 flex items-center justify-center text-white text-[10px] font-bold">C</span>
                <span className="text-neutral-600 dark:text-neutral-400">Needs Attention (60-69%)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded bg-error-500 flex items-center justify-center text-white text-[10px] font-bold">D</span>
                <span className="text-neutral-600 dark:text-neutral-400">Critical (&lt;60%)</span>
              </span>
            </div>
          </div>
          <div>
            <p className="font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Indicators</p>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 bg-white dark:bg-neutral-900 text-error-600 dark:text-error-400 text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-error-500 shadow-sm">5</span>
                <span className="text-neutral-600 dark:text-neutral-400">Learners below 60%</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-success-600 dark:text-success-400 font-bold">↑3%</span>
                <span className="text-neutral-600 dark:text-neutral-400">Improving</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-error-600 dark:text-error-400 font-bold">↓5%</span>
                <span className="text-neutral-600 dark:text-neutral-400">Declining</span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-neutral-50 dark:bg-neutral-800/30">
              <th className="text-left p-3 font-semibold text-neutral-700 dark:text-neutral-300 min-w-[100px] sticky left-0 bg-neutral-50 dark:bg-neutral-800/30 border-r border-neutral-200 dark:border-neutral-700">
                Class
              </th>
              {topics.map((topic) => (
                <th key={topic} className="p-3 font-semibold text-neutral-700 dark:text-neutral-300 text-center min-w-[110px]">
                  {topic}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {classes.map((cls, i) => {
              const rowHasIssues = data[i].some(cell => shouldShowCell(cell));
              if (showOnlyIssues && !rowHasIssues) return null;

              return (
                <tr key={cls} className="border-t border-neutral-200 dark:border-neutral-800">
                  <td className="p-3 font-semibold text-neutral-900 dark:text-neutral-100 text-sm sticky left-0 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-700">{cls}</td>
                  {topics.map((topic, j) => {
                    const cell = data[i][j];

                    if (showOnlyIssues && !shouldShowCell(cell)) {
                      return <td key={j} className="p-1.5"><div className="w-full h-16 bg-neutral-100 dark:bg-neutral-800 rounded-lg opacity-20"></div></td>;
                    }

                    const getIcon = (mastery: number) => {
                      if (mastery >= 80) return '✓';
                      if (mastery >= 60) return '⚠';
                      return '!';
                    };

                    return (
                      <td key={j} className="p-1.5">
                        <button
                          className={`relative w-full min-h-[64px] p-3 ${getCellColor(cell.mastery)} rounded-lg flex flex-col items-center justify-center text-white font-bold hover:ring-2 hover:ring-primary-500 hover:scale-105 transition-all cursor-pointer shadow-sm hover:shadow-md group`}
                          title={`${cls} - ${topic}\n${cell.mastery}% class average\n${cell.below} learners below 60%\nGrade: ${getAccessibilityGrade(cell.mastery)}`}
                          aria-label={`${cls} ${topic}: ${cell.mastery}% mastery, ${cell.below} learners need help`}
                        >
                          {/* Accessibility Grade Badge - Top Left */}
                          <span className="absolute top-1.5 left-1.5 w-5 h-5 bg-white/20 backdrop-blur-sm text-white text-[10px] font-extrabold rounded flex items-center justify-center">
                            {getAccessibilityGrade(cell.mastery)}
                          </span>

                          {/* Main Percentage - Hero */}
                          <div className="flex items-baseline justify-center">
                            <span className="text-2xl font-extrabold leading-none">{cell.mastery}%</span>
                            {getTrendIcon(cell.trend)}
                          </div>

                          {/* Icon Indicator */}
                          <span className="text-xs opacity-80 mt-1">{getIcon(cell.mastery)}</span>

                          {/* Learner Count Badge - Conditional */}
                          {showAllIndicators && cell.below > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-[24px] h-6 px-1.5 bg-white dark:bg-neutral-900 text-error-600 dark:text-error-400 text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-error-500 shadow-md">
                              {cell.below}
                            </span>
                          )}

                          {/* Enhanced Hover Tooltip */}
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                            <div className="font-bold mb-1">{cls} • {topic}</div>
                            <div>{cell.mastery}% mastery • Grade {getAccessibilityGrade(cell.mastery)}</div>
                            {cell.below > 0 && <div className="text-error-400 dark:text-error-600 font-semibold mt-1">⚠ {cell.below} learners need support</div>}
                            {cell.trend && (
                              <div className={cell.trend > 0 ? 'text-success-400 dark:text-success-600' : 'text-error-400 dark:text-error-600'}>
                                {cell.trend > 0 ? '↑' : '↓'} {Math.abs(cell.trend)}% from last week
                              </div>
                            )}
                          </span>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

