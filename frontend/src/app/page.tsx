'use client';

import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { currentUser } from '../mocks/users';
import { ClassHealthHeatmap } from '../components/dashboard/class-health-heatmap';
import { InterventionsQueue } from '../components/dashboard/interventions-queue';
import { WeeklySnapshot } from '../components/dashboard/weekly-snapshot';
import {
  getAtRiskLearners,
  getInterventions,
  getSkillHeatmap,
  getDashboardInsights
} from '../lib/api';

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
  const [apiInterventions, setApiInterventions] = useState<any[]>([]);
  const [apiAtRisk, setApiAtRisk] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);

  // Fetch data from backend on mount
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true);

        // Try to fetch real data from API
        const [interventionsData, atRiskData] = await Promise.all([
          getInterventions().catch(() => []),
          getAtRiskLearners().catch(() => [])
        ]);

        if (interventionsData.length > 0 || atRiskData.length > 0) {
          setApiInterventions(interventionsData);
          setApiAtRisk(atRiskData);
          setUsingMockData(false);
        } else {
          // Use mock data as fallback
          setUsingMockData(true);
          console.log('📊 Using mock data - no data available from API yet');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setUsingMockData(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [selectedClass, timeframe]);

  const greeting = `Welcome back, ${currentUser.firstName}`;
  const today = new Date().toLocaleDateString('en-ZA', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Use API data if available, otherwise use mock data
  const displayInterventions = apiInterventions.length > 0 ? apiInterventions : interventions;

  return (
    <div className="space-y-12 pb-12">
      {/* BRUTALIST HERO: Massive Navy Block */}
      <div className="-mx-6 -mt-6 mb-16">
        <div className="bg-[var(--ufs-navy)] text-white px-12 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-6xl font-bold mb-4 tracking-tight leading-tight">
                  {greeting}
                </h1>
                <p className="text-xl text-white/60 font-light">
                  {today} · Last updated 5 min ago
                </p>
              </div>
              <div className="flex gap-4 items-center">
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="px-5 py-3 rounded-lg border-2 border-white/20 bg-transparent text-white font-medium hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all cursor-pointer"
                >
                  <option className="bg-[var(--ufs-navy)] text-white">Today</option>
                  <option className="bg-[var(--ufs-navy)] text-white">This Week</option>
                  <option className="bg-[var(--ufs-navy)] text-white">This Month</option>
                  <option className="bg-[var(--ufs-navy)] text-white">This Term</option>
                </select>
                <button className="px-8 py-3 rounded-lg bg-[var(--ufs-maroon)] text-white hover:brightness-90 transition-all font-bold text-sm shadow-xl">
                  Download Summary
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BRUTALIST FILTERS */}
      <div className="flex items-center justify-between mb-12 pb-6 border-b-2 border-ufs-gray-200">
        <div className="flex items-center gap-8">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ufs-gray-500 mb-2">Class Filter</label>
            <div className="flex gap-2">
              {['All', '7A', '7B', '8B', '9A'].map((cls) => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-5 py-2.5 text-sm font-bold transition-all rounded-lg ${
                    selectedClass === cls
                      ? 'bg-[var(--ufs-maroon)] text-white'
                      : 'border-2 border-ufs-gray-300 text-ufs-gray-700 hover:border-[var(--ufs-navy)] hover:text-[var(--ufs-navy)]'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BRUTALIST GRID - Generous Spacing */}
      <div className="grid grid-cols-12 gap-8 mb-16">
        <div className="col-span-12 lg:col-span-8">
          <ClassHealthHeatmap 
            classes={selectedClass === 'All' ? CLASSES : CLASSES.filter(c => c.includes(selectedClass))} 
            topics={TOPICS} 
            data={selectedClass === 'All' ? heatmapData : heatmapData.filter((_, i) => CLASSES[i].includes(selectedClass))} 
          />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <InterventionsQueue
            interventions={selectedClass === 'All' ? displayInterventions : displayInterventions.filter(i => i.grade === selectedClass)}
          />
          {usingMockData && (
            <div className="mt-2 text-xs text-center text-gray-500">
              Using mock data (API has no data yet)
            </div>
          )}
        </div>
      </div>

      {/* UNIFIED WEEKLY SNAPSHOT - Replaces 3 repetitive sections */}
      <div className="mb-16">
        <WeeklySnapshot
          assigned={funnelData[0].count}
          mastered={funnelData[funnelData.length - 1].count}
          avgPerformance={74}
          atRisk={5}
          topGaps={misconceptions.map(m => ({ topic: m.topic, count: m.count }))}
          performanceTrend={2}
        />
      </div>
    </div>
  );
}
