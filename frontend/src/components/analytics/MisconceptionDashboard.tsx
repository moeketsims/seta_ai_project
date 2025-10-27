'use client';

import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

export interface MisconceptionTrend {
  misconceptionId: string;
  name: string;
  description: string;
  category: 'multiplication' | 'division' | 'fractions' | 'decimals' | 'algebra' | 'geometry';
  weeklyOccurrences: {
    week: number;
    count: number;
    affectedLearners: number;
  }[];
  totalAffected: number;
  interventionsCreated: number;
  resolutionRate: number; // Percentage of learners who overcame this misconception
  averageTimeToResolve: number; // Days
  severity: 'low' | 'medium' | 'high' | 'critical';
  prerequisiteSkills: string[];
  recommendedInterventions: {
    type: 'video' | 'practice' | 'manipulative' | 'one-on-one';
    description: string;
  }[];
}

export interface MisconceptionDashboardProps {
  misconceptions: MisconceptionTrend[];
  onCreateIntervention?: (misconceptionId: string) => void;
  onViewLearners?: (misconceptionId: string) => void;
}

/**
 * MisconceptionDashboard provides deep analysis of mathematical misconceptions
 * including trends, intervention effectiveness, and resolution tracking
 */
export function MisconceptionDashboard({
  misconceptions,
  onCreateIntervention,
  onViewLearners,
}: MisconceptionDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'severity' | 'frequency' | 'resolution'>('severity');

  const categories = [
    'all',
    'multiplication',
    'division',
    'fractions',
    'decimals',
    'algebra',
    'geometry',
  ];

  const filteredMisconceptions = misconceptions.filter(
    (m) => selectedCategory === 'all' || m.category === selectedCategory
  );

  const sortedMisconceptions = [...filteredMisconceptions].sort((a, b) => {
    switch (sortBy) {
      case 'severity':
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      case 'frequency':
        return b.totalAffected - a.totalAffected;
      case 'resolution':
        return a.resolutionRate - b.resolutionRate; // Ascending (worst first)
      default:
        return 0;
    }
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'multiplication':
        return '×';
      case 'division':
        return '÷';
      case 'fractions':
        return '½';
      case 'decimals':
        return '.5';
      case 'algebra':
        return 'x';
      case 'geometry':
        return '△';
      default:
        return '📊';
    }
  };

  // Calculate overall stats
  const totalAffected = misconceptions.reduce((sum, m) => sum + m.totalAffected, 0);
  const avgResolutionRate =
    misconceptions.reduce((sum, m) => sum + m.resolutionRate, 0) / misconceptions.length;
  const criticalCount = misconceptions.filter((m) => m.severity === 'critical').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-neutral-600 mb-1">Total Misconceptions</p>
          <p className="text-3xl font-bold">{misconceptions.length}</p>
          <p className="text-xs text-neutral-500 mt-1">tracked across all topics</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-neutral-600 mb-1">Learners Affected</p>
          <p className="text-3xl font-bold text-error">{totalAffected}</p>
          <p className="text-xs text-neutral-500 mt-1">require targeted support</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-neutral-600 mb-1">Avg Resolution Rate</p>
          <p className="text-3xl font-bold text-success">{Math.round(avgResolutionRate)}%</p>
          <p className="text-xs text-neutral-500 mt-1">of learners overcame it</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-neutral-600 mb-1">Critical Issues</p>
          <p className="text-3xl font-bold text-red-600">{criticalCount}</p>
          <p className="text-xs text-neutral-500 mt-1">need immediate attention</p>
        </Card>
      </div>

      {/* Filters and Sorting */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <div className="flex gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className="capitalize"
                >
                  {getCategoryIcon(cat)} {cat}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex-1"></div>
          <div>
            <label className="block text-sm font-medium mb-2">Sort By</label>
            <div className="flex gap-2">
              <Button
                variant={sortBy === 'severity' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('severity')}
              >
                Severity
              </Button>
              <Button
                variant={sortBy === 'frequency' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('frequency')}
              >
                Frequency
              </Button>
              <Button
                variant={sortBy === 'resolution' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('resolution')}
              >
                Resolution Rate
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Misconception Cards */}
      <div className="space-y-4">
        {sortedMisconceptions.map((misconception) => (
          <Card key={misconception.misconceptionId} className="p-6">
            <div className="flex items-start gap-4">
              {/* Severity Badge */}
              <div
                className={`flex-shrink-0 px-3 py-1 rounded-full text-sm font-bold uppercase ${getSeverityColor(misconception.severity)}`}
              >
                {misconception.severity}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                        {misconception.name}
                      </h3>
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded capitalize">
                        {getCategoryIcon(misconception.category)} {misconception.category}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {misconception.description}
                    </p>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-4 gap-4 my-4">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Learners Affected</p>
                    <p className="text-2xl font-bold text-error">{misconception.totalAffected}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Resolution Rate</p>
                    <p className="text-2xl font-bold text-success">
                      {misconception.resolutionRate}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Avg Time to Resolve</p>
                    <p className="text-2xl font-bold">{misconception.averageTimeToResolve}d</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Interventions Created</p>
                    <p className="text-2xl font-bold text-primary">
                      {misconception.interventionsCreated}
                    </p>
                  </div>
                </div>

                {/* Trend Visualization */}
                <div className="mb-4">
                  <p className="text-sm font-semibold mb-2">12-Week Trend</p>
                  <div className="h-20 flex items-end gap-1">
                    {misconception.weeklyOccurrences.map((week) => {
                      const maxCount = Math.max(
                        ...misconception.weeklyOccurrences.map((w) => w.count)
                      );
                      const height = maxCount > 0 ? (week.count / maxCount) * 100 : 0;
                      return (
                        <div
                          key={week.week}
                          className="flex-1 flex flex-col items-center gap-1"
                          title={`Week ${week.week}: ${week.count} occurrences, ${week.affectedLearners} learners`}
                        >
                          <span className="text-xs font-medium text-neutral-600">
                            {week.count}
                          </span>
                          <div
                            className="w-full bg-error rounded-t transition-all hover:bg-error/80"
                            style={{ height: `${height}%`, minHeight: week.count > 0 ? '10%' : '0' }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recommended Interventions */}
                <div className="mb-4">
                  <p className="text-sm font-semibold mb-2">Recommended Interventions</p>
                  <div className="flex flex-wrap gap-2">
                    {misconception.recommendedInterventions.map((intervention, i) => (
                      <div
                        key={i}
                        className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm"
                      >
                        <span className="font-medium text-blue-700 dark:text-blue-400">
                          {intervention.type === 'video' && '🎥'}
                          {intervention.type === 'practice' && '📝'}
                          {intervention.type === 'manipulative' && '🔧'}
                          {intervention.type === 'one-on-one' && '👥'} {intervention.type}:
                        </span>{' '}
                        <span className="text-neutral-700 dark:text-neutral-300">
                          {intervention.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    size="sm"
                    onClick={() => onViewLearners?.(misconception.misconceptionId)}
                  >
                    View Affected Learners ({misconception.totalAffected})
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCreateIntervention?.(misconception.misconceptionId)}
                  >
                    Create Targeted Intervention
                  </Button>
                  <Button size="sm" variant="outline">
                    Export Report
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {sortedMisconceptions.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-neutral-500">No misconceptions found in this category.</p>
        </Card>
      )}
    </div>
  );
}
