'use client';

import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

export interface InterventionData {
  interventionId: string;
  name: string;
  type: 'video' | 'practice' | 'manipulative' | 'one-on-one' | 'group-work' | 'peer-tutoring';
  targetMisconception: string;
  targetSkill: string;
  created: Date;
  duration: number; // days
  learnersEnrolled: number;
  learnersCompleted: number;
  beforeMetrics: {
    averageScore: number;
    masteryLevel: number;
    confidenceScore: number;
  };
  afterMetrics: {
    averageScore: number;
    masteryLevel: number;
    confidenceScore: number;
  };
  improvement: {
    scoreGain: number;
    masteryGain: number;
    confidenceGain: number;
  };
  effectiveness: 'excellent' | 'good' | 'moderate' | 'poor';
  costPerLearner: number; // in Rand
  timeInvestment: number; // hours
  teacherFeedback?: string;
  learnerSatisfaction: number; // 1-5
  recommendationScore: number; // 1-10 calculated metric
}

export interface InterventionEffectivenessProps {
  interventions: InterventionData[];
  onViewDetails?: (interventionId: string) => void;
  onDuplicate?: (interventionId: string) => void;
}

/**
 * InterventionEffectiveness tracks before/after metrics for targeted interventions
 * showing which teaching strategies work best for specific misconceptions
 */
export function InterventionEffectiveness({
  interventions,
  onViewDetails,
  onDuplicate,
}: InterventionEffectivenessProps) {
  const [sortBy, setSortBy] = useState<'effectiveness' | 'improvement' | 'satisfaction'>(
    'effectiveness'
  );
  const [filterType, setFilterType] = useState<string>('all');

  const interventionTypes = [
    'all',
    'video',
    'practice',
    'manipulative',
    'one-on-one',
    'group-work',
    'peer-tutoring',
  ];

  const filteredInterventions = interventions.filter(
    (i) => filterType === 'all' || i.type === filterType
  );

  const sortedInterventions = [...filteredInterventions].sort((a, b) => {
    switch (sortBy) {
      case 'effectiveness':
        const effectivenessOrder = { excellent: 4, good: 3, moderate: 2, poor: 1 };
        return effectivenessOrder[b.effectiveness] - effectivenessOrder[a.effectiveness];
      case 'improvement':
        return b.improvement.scoreGain - a.improvement.scoreGain;
      case 'satisfaction':
        return b.learnerSatisfaction - a.learnerSatisfaction;
      default:
        return 0;
    }
  });

  const getEffectivenessColor = (effectiveness: string) => {
    switch (effectiveness) {
      case 'excellent':
        return 'bg-green-600 text-white';
      case 'good':
        return 'bg-blue-600 text-white';
      case 'moderate':
        return 'bg-yellow-600 text-white';
      case 'poor':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return '🎥';
      case 'practice':
        return '📝';
      case 'manipulative':
        return '🔧';
      case 'one-on-one':
        return '👥';
      case 'group-work':
        return '👨‍👩‍👧‍👦';
      case 'peer-tutoring':
        return '🤝';
      default:
        return '📚';
    }
  };

  // Calculate overall stats
  const totalLearners = interventions.reduce((sum, i) => sum + i.learnersEnrolled, 0);
  const avgImprovement =
    interventions.reduce((sum, i) => sum + i.improvement.scoreGain, 0) / interventions.length;
  const excellentCount = interventions.filter((i) => i.effectiveness === 'excellent').length;
  const avgSatisfaction =
    interventions.reduce((sum, i) => sum + i.learnerSatisfaction, 0) / interventions.length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-neutral-600 mb-1">Total Interventions</p>
          <p className="text-3xl font-bold">{interventions.length}</p>
          <p className="text-xs text-neutral-500 mt-1">
            {excellentCount} excellent performers
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-neutral-600 mb-1">Learners Reached</p>
          <p className="text-3xl font-bold text-primary">{totalLearners}</p>
          <p className="text-xs text-neutral-500 mt-1">across all interventions</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-neutral-600 mb-1">Avg Score Gain</p>
          <p className="text-3xl font-bold text-success">+{Math.round(avgImprovement)}%</p>
          <p className="text-xs text-neutral-500 mt-1">before vs after</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-neutral-600 mb-1">Learner Satisfaction</p>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-bold">{avgSatisfaction.toFixed(1)}</p>
            <span className="text-lg text-neutral-500">/5</span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">average rating</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Intervention Type</label>
            <div className="flex gap-2 flex-wrap">
              {interventionTypes.map((type) => (
                <Button
                  key={type}
                  variant={filterType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType(type)}
                  className="capitalize"
                >
                  {getTypeIcon(type)} {type}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex-1"></div>
          <div>
            <label className="block text-sm font-medium mb-2">Sort By</label>
            <div className="flex gap-2">
              <Button
                variant={sortBy === 'effectiveness' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('effectiveness')}
              >
                Effectiveness
              </Button>
              <Button
                variant={sortBy === 'improvement' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('improvement')}
              >
                Improvement
              </Button>
              <Button
                variant={sortBy === 'satisfaction' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('satisfaction')}
              >
                Satisfaction
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Intervention Cards */}
      <div className="space-y-4">
        {sortedInterventions.map((intervention) => (
          <Card key={intervention.interventionId} className="p-6">
            <div className="flex items-start gap-4">
              {/* Effectiveness Badge */}
              <div
                className={`flex-shrink-0 px-3 py-1 rounded-full text-sm font-bold uppercase ${getEffectivenessColor(intervention.effectiveness)}`}
              >
                {intervention.effectiveness}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                        {intervention.name}
                      </h3>
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded capitalize">
                        {getTypeIcon(intervention.type)} {intervention.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-neutral-600">
                      <span>Target: {intervention.targetMisconception}</span>
                      <span>•</span>
                      <span>Duration: {intervention.duration} days</span>
                      <span>•</span>
                      <span>
                        Completion: {intervention.learnersCompleted}/{intervention.learnersEnrolled}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      {'⭐'.repeat(Math.round(intervention.learnerSatisfaction))}
                      <span className="text-sm text-neutral-600 ml-1">
                        ({intervention.learnerSatisfaction.toFixed(1)})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Before/After Comparison */}
                <div className="grid grid-cols-3 gap-6 mb-4">
                  {/* Score */}
                  <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
                    <p className="text-xs text-neutral-500 mb-2 font-medium">Average Score</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-neutral-600">Before</p>
                        <p className="text-2xl font-bold">{intervention.beforeMetrics.averageScore}%</p>
                      </div>
                      <div className="text-2xl text-success font-bold">→</div>
                      <div>
                        <p className="text-sm text-neutral-600">After</p>
                        <p className="text-2xl font-bold text-success">
                          {intervention.afterMetrics.averageScore}%
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <span className="text-lg font-bold text-success">
                        +{intervention.improvement.scoreGain}%
                      </span>
                    </div>
                  </div>

                  {/* Mastery Level */}
                  <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
                    <p className="text-xs text-neutral-500 mb-2 font-medium">Mastery Level</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-neutral-600">Before</p>
                        <p className="text-2xl font-bold">
                          {intervention.beforeMetrics.masteryLevel}%
                        </p>
                      </div>
                      <div className="text-2xl text-success font-bold">→</div>
                      <div>
                        <p className="text-sm text-neutral-600">After</p>
                        <p className="text-2xl font-bold text-success">
                          {intervention.afterMetrics.masteryLevel}%
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <span className="text-lg font-bold text-success">
                        +{intervention.improvement.masteryGain}%
                      </span>
                    </div>
                  </div>

                  {/* Confidence */}
                  <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
                    <p className="text-xs text-neutral-500 mb-2 font-medium">Confidence Score</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-neutral-600">Before</p>
                        <p className="text-2xl font-bold">
                          {intervention.beforeMetrics.confidenceScore}%
                        </p>
                      </div>
                      <div className="text-2xl text-success font-bold">→</div>
                      <div>
                        <p className="text-sm text-neutral-600">After</p>
                        <p className="text-2xl font-bold text-success">
                          {intervention.afterMetrics.confidenceScore}%
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <span className="text-lg font-bold text-success">
                        +{intervention.improvement.confidenceGain}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cost Effectiveness */}
                <div className="flex items-center gap-6 mb-4 text-sm">
                  <div>
                    <span className="text-neutral-600">Cost per Learner:</span>{' '}
                    <span className="font-semibold">R{intervention.costPerLearner.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-neutral-600">Time Investment:</span>{' '}
                    <span className="font-semibold">{intervention.timeInvestment}h per learner</span>
                  </div>
                  <div>
                    <span className="text-neutral-600">Recommendation Score:</span>{' '}
                    <span className="font-bold text-primary">
                      {intervention.recommendationScore}/10
                    </span>
                  </div>
                </div>

                {/* Teacher Feedback */}
                {intervention.teacherFeedback && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">
                      Teacher Feedback
                    </p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 italic">
                      "{intervention.teacherFeedback}"
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button size="sm" onClick={() => onViewDetails?.(intervention.interventionId)}>
                    View Full Report
                  </Button>
                  {intervention.effectiveness === 'excellent' ||
                  intervention.effectiveness === 'good' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDuplicate?.(intervention.interventionId)}
                    >
                      🔄 Duplicate This Intervention
                    </Button>
                  ) : null}
                  <Button size="sm" variant="outline">
                    Export Data
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {sortedInterventions.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-neutral-500">No interventions found for this filter.</p>
        </Card>
      )}
    </div>
  );
}
