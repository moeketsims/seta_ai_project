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
    if (mastery >= 80) return 'bg-[var(--edu-green)]'; // Education Green
    if (mastery >= 70) return 'bg-[var(--ufs-navy)]'; // Navy
    if (mastery >= 60) return 'bg-[var(--ufs-navy)] opacity-50'; // Navy (muted)
    return 'bg-[var(--ufs-maroon)]'; // Maroon for critical
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
    <div className="bg-white rounded-lg shadow-card p-8">
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-ufs-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-[var(--ufs-navy)]">Class Health Heatmap</h2>
          <p className="text-sm text-ufs-gray-500 mt-1">CAPS curriculum performance • This week</p>
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
                      <td key={j} className="p-2">
                        <button
                          className={`relative w-full min-h-[80px] p-4 ${getCellColor(cell.mastery)} rounded-lg flex flex-col items-center justify-center text-white font-bold hover:shadow-lg transition-all cursor-pointer`}
                          title={`${cls} - ${topic}: ${cell.mastery}%`}
                          aria-label={`${cls} ${topic}: ${cell.mastery}% mastery`}
                        >
                          {/* BRUTALIST: Just the huge number - MINIMAL */}
                          <span className="text-3xl font-bold leading-none tabular-nums">{cell.mastery}<span className="text-lg">%</span></span>
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
      
      {/* BRUTALIST LEGEND - Clean & Minimal */}
      <div className="mt-8 pt-6 border-t-2 border-ufs-gray-200">
        <div className="flex items-center gap-8 text-sm flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-8 rounded-lg bg-[var(--edu-green)]"></div>
            <span className="text-ufs-gray-900 font-bold">80-100%</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-8 rounded-lg bg-[var(--ufs-navy)]"></div>
            <span className="text-ufs-gray-700 font-medium">70-79%</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-8 rounded-lg bg-[var(--ufs-navy)] opacity-50"></div>
            <span className="text-ufs-gray-500 font-medium">60-69%</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-8 rounded-lg bg-[var(--ufs-maroon)]"></div>
            <span className="text-[var(--ufs-maroon)] font-bold">Below 60%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

