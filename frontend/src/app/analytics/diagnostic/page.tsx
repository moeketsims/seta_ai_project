'use client';

import { useState } from 'react';
import { PageHeader } from '../../../components/layout/page-header';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import {
  DiagnosticDeepDive,
  MisconceptionDashboard,
  InterventionEffectiveness,
  SkillProgressionMap,
  PredictiveRiskAnalytics,
} from '../../../components/analytics';
import {
  mockWeeklyDiagnostic,
  mockMisconceptions,
  mockInterventions,
  mockLearningPathway,
  mockAtRiskLearners,
} from '../../../mocks/enhanced-analytics';

type AnalyticsView =
  | 'diagnostic'
  | 'misconceptions'
  | 'interventions'
  | 'progression'
  | 'predictive';

export default function DiagnosticAnalyticsPage() {
  const [activeView, setActiveView] = useState<AnalyticsView>('diagnostic');

  const navigationItems: { key: AnalyticsView; label: string; icon: string }[] = [
    { key: 'diagnostic', label: 'Diagnostic Deep Dive', icon: '🔍' },
    { key: 'misconceptions', label: 'Misconception Trends', icon: '⚠️' },
    { key: 'interventions', label: 'Intervention Impact', icon: '📊' },
    { key: 'progression', label: 'Skill Progression', icon: '🗺️' },
    { key: 'predictive', label: 'Predictive Analytics', icon: '🔮' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deep Diagnostic Analytics"
        description="Advanced insights into learner performance, misconceptions, and predictive interventions"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Export Full Report
            </Button>
            <Button size="sm">Schedule Report</Button>
          </div>
        }
      />

      {/* Navigation Tabs */}
      <Card className="p-2">
        <div className="flex gap-2 overflow-x-auto">
          {navigationItems.map((item) => (
            <Button
              key={item.key}
              variant={activeView === item.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView(item.key)}
              className="whitespace-nowrap"
            >
              {item.icon} {item.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Content Area */}
      <div className="min-h-screen">
        {activeView === 'diagnostic' && (
          <div>
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-600">
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
                📋 Question-Level Performance Analysis
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Drill down into each question to identify misconceptions, analyze wrong answers, and
                create targeted interventions. Click on any question card to see detailed analysis.
              </p>
            </div>
            <DiagnosticDeepDive
              diagnosticData={mockWeeklyDiagnostic}
              onQuestionClick={(questionId) => {
                console.log('View question details:', questionId);
              }}
              onInterventionCreate={(questionId, misconceptionId) => {
                console.log('Create intervention for:', { questionId, misconceptionId });
              }}
            />
          </div>
        )}

        {activeView === 'misconceptions' && (
          <div>
            <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-600">
              <h3 className="font-semibold text-orange-900 dark:text-orange-200 mb-1">
                ⚠️ Misconception Tracking & Trends
              </h3>
              <p className="text-sm text-orange-700 dark:text-orange-400">
                Monitor mathematical misconceptions over time, track resolution rates, and implement
                evidence-based interventions. Identify patterns and prevent misconceptions from
                spreading.
              </p>
            </div>
            <MisconceptionDashboard
              misconceptions={mockMisconceptions}
              onCreateIntervention={(misconceptionId) => {
                console.log('Create intervention for misconception:', misconceptionId);
              }}
              onViewLearners={(misconceptionId) => {
                console.log('View affected learners:', misconceptionId);
              }}
            />
          </div>
        )}

        {activeView === 'interventions' && (
          <div>
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-600">
              <h3 className="font-semibold text-green-900 dark:text-green-200 mb-1">
                📊 Intervention Effectiveness Analysis
              </h3>
              <p className="text-sm text-green-700 dark:text-green-400">
                Measure before/after metrics for every intervention. Discover which teaching
                strategies work best for specific misconceptions. Data-driven instructional
                decisions.
              </p>
            </div>
            <InterventionEffectiveness
              interventions={mockInterventions}
              onViewDetails={(interventionId) => {
                console.log('View intervention details:', interventionId);
              }}
              onDuplicate={(interventionId) => {
                console.log('Duplicate successful intervention:', interventionId);
              }}
            />
          </div>
        )}

        {activeView === 'progression' && (
          <div>
            <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-600">
              <h3 className="font-semibold text-purple-900 dark:text-purple-200 mb-1">
                🗺️ Skill Progression & Learning Pathways
              </h3>
              <p className="text-sm text-purple-700 dark:text-purple-400">
                Visualize skill dependencies and prerequisite chains. Identify blockers preventing
                learners from progressing. Ensure foundational skills are mastered before advancing.
              </p>
            </div>
            <SkillProgressionMap
              pathway={mockLearningPathway}
              onSkillClick={(skillId) => {
                console.log('View skill details:', skillId);
              }}
              onCreateIntervention={(skillId) => {
                console.log('Create intervention for skill:', skillId);
              }}
            />
          </div>
        )}

        {activeView === 'predictive' && (
          <div>
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-600">
              <h3 className="font-semibold text-red-900 dark:text-red-200 mb-1">
                🔮 Predictive Early Warning System
              </h3>
              <p className="text-sm text-red-700 dark:text-red-400">
                AI-powered predictions identify at-risk learners BEFORE they fail. Proactive
                interventions based on engagement patterns, performance trends, and risk factors.
                Prevent failure rather than react to it.
              </p>
            </div>
            <PredictiveRiskAnalytics
              atRiskLearners={mockAtRiskLearners}
              onViewLearner={(learnerId) => {
                console.log('View learner profile:', learnerId);
              }}
              onCreateIntervention={(learnerId) => {
                console.log('Create intervention plan for:', learnerId);
              }}
              onSendAlert={(learnerId) => {
                console.log('Send alert to guardian for:', learnerId);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
