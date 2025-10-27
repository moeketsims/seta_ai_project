'use client';

import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import type { DashboardInsightsResponse } from '../../lib/api';

interface AIInsightsPanelProps {
  insights: DashboardInsightsResponse | null;
  loading?: boolean;
  onRefresh?: () => void;
}

export function AIInsightsPanel({ insights, loading = false, onRefresh }: AIInsightsPanelProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('alerts');

  if (loading) {
    return (
      <Card className="p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-extrabold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              🤖 AI Insights
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">Analyzing your data...</p>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-neutral-200 dark:bg-neutral-800 rounded-lg"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!insights) {
    return (
      <Card className="p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-extrabold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              🤖 AI Insights
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">Enable AI insights to see recommendations</p>
          </div>
          {onRefresh && (
            <Button onClick={onRefresh} size="sm" variant="outline">
              🔄 Load Insights
            </Button>
          )}
        </div>
      </Card>
    );
  }

  const { urgent_alerts, positive_highlights, pattern_observations, quick_wins, predictive_warnings } = insights;

  const getUrgencyColor = (urgency: string) => {
    if (urgency === 'TODAY') return 'border-error-500 bg-error-50 dark:bg-error-950';
    if (urgency === 'THIS_WEEK') return 'border-warning-500 bg-warning-50 dark:bg-warning-950';
    return 'border-info-500 bg-info-50 dark:bg-info-950';
  };

  const getUrgencyIcon = (urgency: string) => {
    if (urgency === 'TODAY') return '🚨';
    if (urgency === 'THIS_WEEK') return '⚠️';
    return 'ℹ️';
  };

  const getAlertIcon = (type: string) => {
    if (type === 'AT_RISK_LEARNER') return '👤';
    if (type === 'CLASS_PATTERN') return '📊';
    if (type === 'MISCONCEPTION_SPIKE') return '💡';
    return '📉';
  };

  return (
    <Card className="p-6 shadow-md hover:shadow-xl transition-shadow border-l-4 border-l-primary-500">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h3 className="text-xl font-extrabold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            🤖 AI Diagnostic Insights
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Real-time analysis • Cost: ${insights.ai_analysis?.cost?.toFixed(6) || '0.00'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button onClick={onRefresh} size="sm" variant="outline" className="text-xs">
              🔄 Refresh
            </Button>
          )}
          <span className="text-[10px] text-neutral-500 font-medium">
            {new Date(insights.ai_analysis?.generated_at).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Urgent Alerts */}
      {urgent_alerts && urgent_alerts.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setExpandedSection(expandedSection === 'alerts' ? null : 'alerts')}
            className="w-full flex items-center justify-between mb-3 text-left"
          >
            <h4 className="text-sm font-bold text-error-700 dark:text-error-400 flex items-center gap-2">
              🚨 Urgent Alerts
              <span className="px-2 py-0.5 bg-error-100 dark:bg-error-950 text-error-700 dark:text-error-400 rounded-full text-xs">
                {urgent_alerts.length}
              </span>
            </h4>
            <span className="text-xs text-neutral-500">{expandedSection === 'alerts' ? '▼' : '▶'}</span>
          </button>
          {expandedSection === 'alerts' && (
            <div className="space-y-3">
              {urgent_alerts.map((alert, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg border-2 ${getUrgencyColor(alert.urgency)} transition-all hover:shadow-md`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">
                      {getUrgencyIcon(alert.urgency)}
                      {getAlertIcon(alert.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{alert.message}</p>
                        <span className="text-[10px] font-bold text-error-600 dark:text-error-400 whitespace-nowrap">
                          {alert.urgency.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-700 dark:text-neutral-300 mb-3">
                        <strong>Action:</strong> {alert.recommended_action}
                      </p>
                      {alert.learners_affected && alert.learners_affected.length > 0 && (
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">
                          <strong>Affected:</strong> {alert.learners_affected.length} learners
                        </p>
                      )}
                      <details className="text-xs">
                        <summary className="cursor-pointer text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
                          Impact if ignored
                        </summary>
                        <p className="mt-1 text-neutral-600 dark:text-neutral-400 italic">{alert.impact_if_ignored}</p>
                      </details>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Wins */}
      {quick_wins && quick_wins.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setExpandedSection(expandedSection === 'wins' ? null : 'wins')}
            className="w-full flex items-center justify-between mb-3 text-left"
          >
            <h4 className="text-sm font-bold text-success-700 dark:text-success-400 flex items-center gap-2">
              ⚡ Quick Wins
              <span className="px-2 py-0.5 bg-success-100 dark:bg-success-950 text-success-700 dark:text-success-400 rounded-full text-xs">
                {quick_wins.length}
              </span>
            </h4>
            <span className="text-xs text-neutral-500">{expandedSection === 'wins' ? '▼' : '▶'}</span>
          </button>
          {expandedSection === 'wins' && (
            <div className="space-y-2">
              {quick_wins.map((win, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-success-50 dark:bg-success-950 border border-success-200 dark:border-success-800 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg flex-shrink-0">✅</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">{win.action}</p>
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="text-neutral-600 dark:text-neutral-400">⏱️ {win.estimated_time}</span>
                        <span className="text-success-600 dark:text-success-400 font-medium">→ {win.expected_outcome}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Positive Highlights */}
      {positive_highlights && positive_highlights.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setExpandedSection(expandedSection === 'highlights' ? null : 'highlights')}
            className="w-full flex items-center justify-between mb-3 text-left"
          >
            <h4 className="text-sm font-bold text-primary-700 dark:text-primary-400 flex items-center gap-2">
              🎉 Positive Highlights
            </h4>
            <span className="text-xs text-neutral-500">{expandedSection === 'highlights' ? '▼' : '▶'}</span>
          </button>
          {expandedSection === 'highlights' && (
            <div className="space-y-2">
              {positive_highlights.map((highlight, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-800"
                >
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">{highlight.message}</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">{highlight.evidence}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pattern Observations */}
      {pattern_observations && pattern_observations.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setExpandedSection(expandedSection === 'patterns' ? null : 'patterns')}
            className="w-full flex items-center justify-between mb-3 text-left"
          >
            <h4 className="text-sm font-bold text-secondary-700 dark:text-secondary-400 flex items-center gap-2">
              🔍 Pattern Observations
            </h4>
            <span className="text-xs text-neutral-500">{expandedSection === 'patterns' ? '▼' : '▶'}</span>
          </button>
          {expandedSection === 'patterns' && (
            <div className="space-y-2">
              {pattern_observations.map((pattern, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-secondary-50 dark:bg-secondary-950 border border-secondary-200 dark:border-secondary-800"
                >
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">📊 {pattern.pattern}</p>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 mb-2">
                    <strong>Analysis:</strong> {pattern.interpretation}
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 italic">
                    💡 {pattern.suggested_investigation}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Predictive Warnings */}
      {predictive_warnings && predictive_warnings.length > 0 && (
        <div className="mb-0">
          <button
            onClick={() => setExpandedSection(expandedSection === 'predictions' ? null : 'predictions')}
            className="w-full flex items-center justify-between mb-3 text-left"
          >
            <h4 className="text-sm font-bold text-warning-700 dark:text-warning-400 flex items-center gap-2">
              🔮 Predictive Warnings
            </h4>
            <span className="text-xs text-neutral-500">{expandedSection === 'predictions' ? '▼' : '▶'}</span>
          </button>
          {expandedSection === 'predictions' && (
            <div className="space-y-2">
              {predictive_warnings.map((warning, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-warning-50 dark:bg-warning-950 border border-warning-200 dark:border-warning-800"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{warning.prediction}</p>
                    <span className="text-xs font-bold text-warning-600 dark:text-warning-400 whitespace-nowrap">
                      {Math.round(warning.probability * 100)}% likely
                    </span>
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300">
                    <strong>Prevention:</strong> {warning.prevention_strategy}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No insights fallback */}
      {!urgent_alerts?.length &&
        !quick_wins?.length &&
        !positive_highlights?.length &&
        !pattern_observations?.length &&
        !predictive_warnings?.length && (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🎯</div>
            <p className="text-neutral-600 dark:text-neutral-400 font-medium">All systems healthy!</p>
            <p className="text-xs text-neutral-500 mt-1">No urgent actions needed</p>
          </div>
        )}
    </Card>
  );
}
