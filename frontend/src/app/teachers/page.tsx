"use client";

import { CardSection } from '../../components/card-section';
import { DashboardGrid } from '../../components/layout/dashboard-grid';
import { PageHeader } from '../../components/layout/page-header';
import { StatusPill } from '../../components/status-pill';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { useMemo } from 'react';
import {
  classHealth,
  interventionQueue,
  upcomingAssessments
} from '../../mocks/teachers';
import { useNarrationPreview } from '../../hooks/useNarrationPreview';
import {
  createClassHealthPayload,
  createInterventionQueuePayload,
} from '../../lib/narration-builders';

export default function TeachersPage() {
  const dataTimestamp = useMemo(() => new Date().toISOString(), []);

  const interventionPayload = useMemo(
    () =>
      createInterventionQueuePayload({
        queueName: 'Teacher Workspace',
        interventions: interventionQueue,
        dataTimestamp,
      }),
    [dataTimestamp, interventionQueue]
  );

  const classHealthPayload = useMemo(
    () =>
      createClassHealthPayload({
        snapshotTitle: 'Class Health Snapshot',
        items: classHealth,
        dataTimestamp,
      }),
    [classHealth, dataTimestamp]
  );

  useNarrationPreview(interventionPayload);
  useNarrationPreview(classHealthPayload);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Teacher Workspace"
        description="Organise high-priority interventions and upcoming assessments for every class."
        action={<Button size="sm">Schedule support</Button>}
      />
      <DashboardGrid columns="two-third-split">
        <Card>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Intervention Queue</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                  Prioritise learners flagged by weekly diagnostics.
                </p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {interventionQueue.length} learners
              </span>
            </div>
            <ul className="space-y-3">
              {interventionQueue.map((item) => (
                <li
                  key={`${item.learner}-${item.misconception}`}
                  className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {item.learner} · {item.grade}
                      </p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-300">
                        {item.misconception}
                      </p>
                    </div>
                    <StatusPill status={item.status} />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <div className="space-y-4">
          <CardSection
            title="Upcoming Assessments"
            items={upcomingAssessments.map((assessment) => ({
              heading: `${assessment.title} · ${assessment.grade}`,
              body: `${assessment.focus} · Due ${new Date(assessment.due).toLocaleDateString()}`
            }))}
          />
          <Card>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Class Health Snapshot
              </h3>
              <ul className="space-y-3">
                {classHealth.map((klass) => (
                  <li key={klass.className} className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {klass.className}
                      </p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-300">
                        {klass.misconceptionHotspot}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-primary">{klass.mastery}%</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </DashboardGrid>
    </div>
  );
}
