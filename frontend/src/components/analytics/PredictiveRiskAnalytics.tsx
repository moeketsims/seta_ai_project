'use client';

import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

export interface RiskFactor {
  factor: string;
  weight: number; // 0-100
  description: string;
}

export interface AtRiskLearner {
  learnerId: string;
  name: string;
  grade: number;
  riskScore: number; // 0-100, higher = more at risk
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  trendDirection: 'improving' | 'stable' | 'declining';
  riskFactors: RiskFactor[];
  predictedOutcome: {
    nextAssessmentScore: number;
    confidenceInterval: [number, number];
    probabilityOfFailure: number;
    daysUntilIntervention: number;
  };
  recommendedActions: {
    priority: 'urgent' | 'high' | 'medium';
    action: string;
    estimatedImpact: number; // 0-100
  }[];
  recentPerformance: {
    week: number;
    score: number;
  }[];
  engagementMetrics: {
    attendanceRate: number;
    completionRate: number;
    timeOnTask: number; // minutes per day
    lastActive: Date;
  };
}

export interface PredictiveRiskAnalyticsProps {
  atRiskLearners: AtRiskLearner[];
  onViewLearner?: (learnerId: string) => void;
  onCreateIntervention?: (learnerId: string) => void;
  onSendAlert?: (learnerId: string) => void;
}

/**
 * PredictiveRiskAnalytics uses ML-powered early warning system
 * to identify learners at risk before they fall behind
 */
export function PredictiveRiskAnalytics({
  atRiskLearners,
  onViewLearner,
  onCreateIntervention,
  onSendAlert,
}: PredictiveRiskAnalyticsProps) {
  const [sortBy, setSortBy] = useState<'riskScore' | 'engagement' | 'trend'>('riskScore');
  const [filterLevel, setFilterLevel] = useState<string>('all');

  const riskLevels = ['all', 'critical', 'high', 'medium', 'low'];

  const filteredLearners = atRiskLearners.filter(
    (l) => filterLevel === 'all' || l.riskLevel === filterLevel
  );

  const sortedLearners = [...filteredLearners].sort((a, b) => {
    switch (sortBy) {
      case 'riskScore':
        return b.riskScore - a.riskScore;
      case 'engagement':
        return a.engagementMetrics.attendanceRate - b.engagementMetrics.attendanceRate;
      case 'trend':
        const trendOrder = { declining: 3, stable: 2, improving: 1 };
        return trendOrder[b.trendDirection] - trendOrder[a.trendDirection];
      default:
        return 0;
    }
  });

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return '📈';
      case 'stable':
        return '➡️';
      case 'declining':
        return '📉';
      default:
        return '➖';
    }
  };

  // Calculate overall stats
  const criticalCount = atRiskLearners.filter((l) => l.riskLevel === 'critical').length;
  const highCount = atRiskLearners.filter((l) => l.riskLevel === 'high').length;
  const decliningCount = atRiskLearners.filter((l) => l.trendDirection === 'declining').length;
  const avgRiskScore =
    atRiskLearners.reduce((sum, l) => sum + l.riskScore, 0) / atRiskLearners.length;

  return (
    <div className="space-y-6">
      {/* Alert Banner for Critical Cases */}
      {criticalCount > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 p-4 rounded">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <p className="font-bold text-red-900 dark:text-red-200">
                Critical Alert: {criticalCount} learner(s) require immediate intervention
              </p>
              <p className="text-sm text-red-700 dark:text-red-400">
                These learners are predicted to fail their next assessment without support
              </p>
            </div>
            <Button size="sm" className="ml-auto">
              View All Critical Cases
            </Button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-neutral-600 mb-1">Total At-Risk</p>
          <p className="text-3xl font-bold text-error">{atRiskLearners.length}</p>
          <p className="text-xs text-neutral-500 mt-1">learners need monitoring</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-neutral-600 mb-1">Critical + High</p>
          <p className="text-3xl font-bold text-red-600">{criticalCount + highCount}</p>
          <p className="text-xs text-neutral-500 mt-1">urgent action required</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-neutral-600 mb-1">Declining Trend</p>
          <p className="text-3xl font-bold text-orange-600">{decliningCount}</p>
          <p className="text-xs text-neutral-500 mt-1">performance dropping</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-neutral-600 mb-1">Avg Risk Score</p>
          <p className="text-3xl font-bold">{Math.round(avgRiskScore)}</p>
          <p className="text-xs text-neutral-500 mt-1">out of 100</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Risk Level</label>
            <div className="flex gap-2">
              {riskLevels.map((level) => (
                <Button
                  key={level}
                  variant={filterLevel === level ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterLevel(level)}
                  className="capitalize"
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex-1"></div>
          <div>
            <label className="block text-sm font-medium mb-2">Sort By</label>
            <div className="flex gap-2">
              <Button
                variant={sortBy === 'riskScore' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('riskScore')}
              >
                Risk Score
              </Button>
              <Button
                variant={sortBy === 'engagement' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('engagement')}
              >
                Engagement
              </Button>
              <Button
                variant={sortBy === 'trend' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('trend')}
              >
                Trend
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Learner Risk Cards */}
      <div className="space-y-4">
        {sortedLearners.map((learner) => (
          <Card key={learner.learnerId} className="p-6">
            <div className="flex items-start gap-4">
              {/* Risk Badge */}
              <div className="flex-shrink-0">
                <div
                  className={`w-20 h-20 rounded-full flex flex-col items-center justify-center ${getRiskColor(learner.riskLevel)}`}
                >
                  <span className="text-2xl font-bold">{learner.riskScore}</span>
                  <span className="text-xs uppercase">{learner.riskLevel}</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                        {learner.name}
                      </h3>
                      <span className="text-xs px-2 py-1 bg-neutral-200 dark:bg-neutral-700 rounded">
                        Grade {learner.grade}
                      </span>
                      <span className="text-sm">
                        {getTrendIcon(learner.trendDirection)} {learner.trendDirection}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Predicted Outcome */}
                <div className="mb-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <p className="text-xs font-semibold text-neutral-600 mb-2">
                    🔮 Predicted Next Assessment
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-neutral-600">Predicted Score</p>
                      <p className="text-2xl font-bold text-error">
                        {learner.predictedOutcome.nextAssessmentScore}%
                      </p>
                      <p className="text-xs text-neutral-500">
                        CI: {learner.predictedOutcome.confidenceInterval[0]}-
                        {learner.predictedOutcome.confidenceInterval[1]}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Failure Probability</p>
                      <p className="text-2xl font-bold text-red-600">
                        {learner.predictedOutcome.probabilityOfFailure}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Intervention Window</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {learner.predictedOutcome.daysUntilIntervention}d
                      </p>
                    </div>
                  </div>
                </div>

                {/* Performance Trend Mini Chart */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-neutral-600 mb-2">
                    Recent Performance (8 weeks)
                  </p>
                  <div className="h-16 flex items-end gap-1">
                    {learner.recentPerformance.map((week) => {
                      const height = week.score;
                      const color =
                        week.score >= 60 ? 'bg-success' : week.score >= 40 ? 'bg-warning' : 'bg-error';
                      return (
                        <div
                          key={week.week}
                          className="flex-1 flex flex-col items-center gap-1"
                          title={`Week ${week.week}: ${week.score}%`}
                        >
                          <div
                            className={`w-full ${color} rounded-t transition-all`}
                            style={{ height: `${height}%`, minHeight: '10%' }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top Risk Factors */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-neutral-600 mb-2">Top Risk Factors</p>
                  <div className="space-y-2">
                    {learner.riskFactors.slice(0, 3).map((factor, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-16 text-right">
                          <span className="text-sm font-bold text-error">{factor.weight}%</span>
                        </div>
                        <div className="flex-1">
                          <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-error rounded-full"
                              style={{ width: `${factor.weight}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {factor.factor}
                          </p>
                          <p className="text-xs text-neutral-600">{factor.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Engagement Metrics */}
                <div className="mb-4 grid grid-cols-4 gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-center">
                    <p className="text-xs text-neutral-600">Attendance</p>
                    <p className="text-lg font-bold text-blue-700 dark:text-blue-400">
                      {learner.engagementMetrics.attendanceRate}%
                    </p>
                  </div>
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded text-center">
                    <p className="text-xs text-neutral-600">Completion</p>
                    <p className="text-lg font-bold text-purple-700 dark:text-purple-400">
                      {learner.engagementMetrics.completionRate}%
                    </p>
                  </div>
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded text-center">
                    <p className="text-xs text-neutral-600">Time/Day</p>
                    <p className="text-lg font-bold text-green-700 dark:text-green-400">
                      {learner.engagementMetrics.timeOnTask}m
                    </p>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-center">
                    <p className="text-xs text-neutral-600">Last Active</p>
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-400">
                      {Math.floor(
                        (Date.now() - learner.engagementMetrics.lastActive.getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}
                      d ago
                    </p>
                  </div>
                </div>

                {/* Recommended Actions */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-neutral-600 mb-2">
                    Recommended Actions (by Impact)
                  </p>
                  <div className="space-y-2">
                    {learner.recommendedActions.map((action, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg ${
                          action.priority === 'urgent'
                            ? 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600'
                            : action.priority === 'high'
                            ? 'bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-600'
                            : 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <span className="text-xs font-semibold uppercase text-neutral-600">
                              {action.priority}
                            </span>
                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                              {action.action}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-success">
                              +{action.estimatedImpact}%
                            </p>
                            <p className="text-xs text-neutral-600">est. impact</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button size="sm" onClick={() => onViewLearner?.(learner.learnerId)}>
                    View Full Profile
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => onCreateIntervention?.(learner.learnerId)}
                  >
                    Create Intervention Plan
                  </Button>
                  {learner.riskLevel === 'critical' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-600 text-red-600"
                      onClick={() => onSendAlert?.(learner.learnerId)}
                    >
                      🚨 Send Alert to Guardian
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {sortedLearners.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-xl mb-2">🎉 No learners at this risk level!</p>
          <p className="text-neutral-500">Great work supporting your students.</p>
        </Card>
      )}
    </div>
  );
}
