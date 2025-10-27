'use client';

import { useState } from 'react';
import { Button } from '../components/ui/button';
import { currentUser } from '../mocks/users';
import { ClassHealthHeatmap } from '../components/dashboard/class-health-heatmap';
import { InterventionsQueue } from '../components/dashboard/interventions-queue';
import { LearningFunnel } from '../components/dashboard/learning-funnel';
import { KPIBullets } from '../components/dashboard/kpi-bullets';
import { MisconceptionRadar } from '../components/dashboard/misconception-radar';

// Fixed mock data (no Math.random() to avoid hydration issues)
const CLASSES = ['Grade 4A', 'Grade 4B', 'Grade 5A', 'Grade 7A', 'Grade 7B', 'Grade 8B', 'Grade 9A'];
const TOPICS = ['Fractions', 'Decimals', 'Geometry', 'Algebra', 'Functions'];

const heatmapData = [
  [
    { mastery: 78, below: 3, trend: 3 },
    { mastery: 82, below: 2, trend: 5 },
    { mastery: 65, below: 5, trend: -2 },
    { mastery: 88, below: 1, trend: 4 },
    { mastery: 72, below: 4, trend: 0 },
  ],
  [
    { mastery: 85, below: 2, trend: 2 },
    { mastery: 76, below: 3, trend: -3 },
    { mastery: 68, below: 6, trend: 1 },
    { mastery: 81, below: 2, trend: 3 },
    { mastery: 79, below: 3, trend: -1 },
  ],
  [
    { mastery: 72, below: 4, trend: -4 },
    { mastery: 69, below: 5, trend: 0 },
    { mastery: 58, below: 7, trend: -5 },
    { mastery: 75, below: 4, trend: 2 },
    { mastery: 71, below: 5, trend: -2 },
  ],
  [
    { mastery: 64, below: 6, trend: -3 },
    { mastery: 71, below: 5, trend: 1 },
    { mastery: 55, below: 8, trend: -6 },
    { mastery: 68, below: 6, trend: 0 },
    { mastery: 62, below: 7, trend: -4 },
  ],
  [
    { mastery: 68, below: 5, trend: 2 },
    { mastery: 74, below: 4, trend: 3 },
    { mastery: 52, below: 8, trend: -7 },
    { mastery: 71, below: 5, trend: 1 },
    { mastery: 66, below: 6, trend: -2 },
  ],
  [
    { mastery: 58, below: 7, trend: -5 },
    { mastery: 65, below: 6, trend: -1 },
    { mastery: 48, below: 9, trend: -8 },
    { mastery: 62, below: 7, trend: 0 },
    { mastery: 55, below: 8, trend: -3 },
  ],
  [
    { mastery: 71, below: 4, trend: 4 },
    { mastery: 68, below: 5, trend: 2 },
    { mastery: 61, below: 7, trend: -1 },
    { mastery: 77, below: 3, trend: 5 },
    { mastery: 73, below: 4, trend: 3 },
  ],
];

const interventions = [
  { name: 'Sipho Ndlovu', grade: '7A', reason: 'Fraction misconception', severity: 'high' as const, time: '~5 min' },
  { name: 'Thandi Mkhize', grade: '8B', reason: 'Low practice', severity: 'medium' as const, time: '~3 min' },
  { name: 'Lwazi Dlamini', grade: '7B', reason: 'Concept gap', severity: 'high' as const, time: '~5 min' },
  { name: 'Nomsa Zulu', grade: '9A', reason: 'Absent (3 days)', severity: 'medium' as const, time: '~2 min' },
  { name: 'Bongani Khumalo', grade: '4A', reason: 'Pathway stuck', severity: 'low' as const, time: '~3 min' },
];

const funnelData = [
  { stage: 'Assigned', count: 154, percent: 100 },
  { stage: 'Attempted', count: 138, percent: 90 },
  { stage: 'Completed', count: 114, percent: 74 },
  { stage: 'Mastered', count: 92, percent: 60 },
];

const kpiTargets = [
  { label: 'Average Performance', actual: 74, target: 75, unit: '%' },
  { label: 'Pathway Completion', actual: 68, target: 80, unit: '%' },
  { label: 'Assessment Coverage', actual: 82, target: 90, unit: '%' },
];

const misconceptions = [
  { topic: 'Equivalent Fractions', count: 24, trend: [18, 20, 22, 24] },
  { topic: 'Decimal Place Value', count: 18, trend: [12, 14, 16, 18] },
  { topic: 'Area vs Perimeter', count: 15, trend: [19, 17, 16, 15] },
  { topic: 'Order of Operations', count: 12, trend: [10, 11, 12, 12] },
  { topic: 'Negative Numbers', count: 9, trend: [11, 10, 9, 9] },
];

export default function OverviewPage() {
  const [selectedClass, setSelectedClass] = useState('All');
  const [timeframe, setTimeframe] = useState('This Week');

  const greeting = `Welcome back, ${currentUser.firstName}`;
  const today = new Date().toLocaleDateString('en-ZA', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Global Header Bar */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-4 mb-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Class Filter */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Class:</span>
            <div className="flex gap-2">
              {['All', '7A', '7B', '8B', '9A'].map((cls) => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    selectedClass === cls
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

          {/* Timeframe & Actions */}
          <div className="flex items-center gap-3">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-4 py-2 text-sm font-medium border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            >
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
              <option>This Term</option>
            </select>

            {/* Split Button for Download */}
            <div className="flex">
              <Button size="sm" className="bg-primary-600 text-white hover:bg-primary-700 rounded-r-none">
                Download Summary
              </Button>
              <button className="px-2 bg-primary-700 text-white hover:bg-primary-800 rounded-r-lg border-l border-primary-800">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Container */}
      <div className="px-6 pb-6">
        {/* One-Line Hero */}
        <div className="mb-6 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <p className="text-neutral-900 dark:text-neutral-100 text-base">
            <span className="font-semibold">{greeting}</span> – {today} •{' '}
            <span className="text-neutral-500">Last updated 5 min ago</span> •{' '}
            <span className="text-neutral-500">Source: CAPS Math AI</span>
          </p>
        </div>

        {/* Priority Attention Queue - Full Width */}
        <div className="mb-6 bg-gradient-to-r from-error-50 to-warning-50 dark:from-error-950 dark:to-warning-950 border-l-4 border-error-500 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">⚠️</span>
            <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">
              Requires Your Attention Now
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-900 rounded-lg hover:shadow-md transition-all border border-error-300 dark:border-error-800 group">
              <span className="font-bold text-error-600 dark:text-error-400 text-lg">{interventions.length}</span>
              <span className="text-neutral-900 dark:text-neutral-100 font-medium">urgent interventions</span>
              <span className="text-xs text-neutral-500">≈{interventions.length * 3} min</span>
              <span className="ml-1 text-neutral-400 group-hover:text-primary-600 transition-colors">→</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-900 rounded-lg hover:shadow-md transition-all border border-warning-300 dark:border-warning-800 group">
              <span className="font-bold text-warning-600 dark:text-warning-400 text-lg">3</span>
              <span className="text-neutral-900 dark:text-neutral-100 font-medium">classes &lt;60% mastery</span>
              <span className="text-xs text-neutral-500">(7A, 8B, 9A)</span>
              <span className="ml-1 text-neutral-400 group-hover:text-primary-600 transition-colors">→</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-900 rounded-lg hover:shadow-md transition-all border border-warning-300 dark:border-warning-800 group">
              <span className="font-bold text-warning-600 dark:text-warning-400 text-lg">2</span>
              <span className="text-neutral-900 dark:text-neutral-100 font-medium">misconception spikes</span>
              <span className="text-xs text-neutral-500">(Equivalent Fractions)</span>
              <span className="ml-1 text-neutral-400 group-hover:text-primary-600 transition-colors">→</span>
            </button>
          </div>
        </div>

        {/* Row 2: L:8 / R:4 - Heatmap + Interventions */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          <div className="col-span-12 lg:col-span-8">
            <ClassHealthHeatmap classes={CLASSES} topics={TOPICS} data={heatmapData} />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <InterventionsQueue interventions={interventions} />
          </div>
        </div>

        {/* Row 3: L:8 / R:4 - Funnel + KPI Bullets */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          <div className="col-span-12 lg:col-span-8">
            <LearningFunnel data={funnelData} />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <KPIBullets kpis={kpiTargets} />
          </div>
        </div>

        {/* Row 4: Full Width - Misconceptions */}
        <div className="mb-6">
          <MisconceptionRadar misconceptions={misconceptions} />
        </div>
      </div>
    </div>
  );
}
