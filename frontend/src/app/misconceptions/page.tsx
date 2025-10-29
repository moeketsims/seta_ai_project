'use client';

import { PageHeader } from '../../components/layout/page-header';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { misconceptions, getMisconceptionsByGrade, getMisconceptionsBySeverity } from '../../mocks/misconceptions';
import { currentUser, getLearnersByTeacher } from '../../mocks/users';
import { useState, useEffect } from 'react';
import { getMisconceptions, getMisconceptionFrequency } from '../../lib/api';

export default function MisconceptionsPage() {
  const [selectedMisconception, setSelectedMisconception] = useState<string | null>(null);
  const teacherLearners = getLearnersByTeacher(currentUser.id);
  const [apiMisconceptions, setApiMisconceptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);

  // Fetch misconceptions from backend
  useEffect(() => {
    async function fetchMisconceptions() {
      try {
        setIsLoading(true);
        const data = await getMisconceptions().catch(() => []);

        if (data && data.length > 0) {
          setApiMisconceptions(data);
          setUsingMockData(false);
        } else {
          setUsingMockData(true);
          console.log('📊 Using mock data - no misconceptions in API yet');
        }
      } catch (error) {
        console.error('Error fetching misconceptions:', error);
        setUsingMockData(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMisconceptions();
  }, []);
  
  // Use API data if available, otherwise use mock data
  const displayMisconceptions = apiMisconceptions.length > 0 ? apiMisconceptions : misconceptions;

  // Simulate misconception occurrences
  const misconceptionData = displayMisconceptions.map((misc) => ({
    ...misc,
    affectedLearnersCount: Math.floor(Math.random() * 15) + 3,
    occurrences: Math.floor(Math.random() * 30) + 5,
    trend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
    trendValue: Math.floor(Math.random() * 20) + 5,
  }));

  const sortedByFrequency = [...misconceptionData].sort((a, b) => b.occurrences - a.occurrences);
  const top10 = sortedByFrequency.slice(0, 10);

  const critical = getMisconceptionsBySeverity('critical').length;
  const high = getMisconceptionsBySeverity('high').length;
  const medium = getMisconceptionsBySeverity('medium').length;
  const totalActive = sortedByFrequency.filter(m => m.occurrences > 0).length;

  const selectedMisc = selectedMisconception
    ? misconceptionData.find((m) => m.id === selectedMisconception)
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Misconception Detection Dashboard"
        description="AI-powered identification and tracking of mathematical misconceptions"
        action={
          <Button size="sm">Generate Intervention Report</Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-sm text-neutral-600">Active Misconceptions</p>
          <p className="mt-1 text-2xl font-bold">{totalActive}</p>
          <p className="text-xs text-neutral-500 mt-1">Detected this term</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-neutral-600">Critical Priority</p>
          <p className="mt-1 text-2xl font-bold text-error">{critical}</p>
          <p className="text-xs text-error mt-1">Requires immediate action</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-neutral-600">High Priority</p>
          <p className="mt-1 text-2xl font-bold text-warning">{high}</p>
          <p className="text-xs text-warning mt-1">Address within 2 weeks</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-neutral-600">Learners Affected</p>
          <p className="mt-1 text-2xl font-bold">{Math.floor(teacherLearners.length * 0.45)}</p>
          <p className="text-xs text-neutral-500 mt-1">
            {Math.round((45 / teacherLearners.length) * 100)}% of total
          </p>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 10 Misconceptions */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="p-4 border-b border-neutral-200">
              <h3 className="font-semibold">Most Common Misconceptions</h3>
              <p className="text-sm text-neutral-600">Top 10 by frequency across all classes</p>
            </div>
            <div className="p-4 space-y-3">
              {top10.map((misc, index) => {
                const severityColor =
                  misc.severity === 'critical'
                    ? 'bg-error text-white'
                    : misc.severity === 'high'
                    ? 'bg-warning text-white'
                    : 'bg-info text-white';

                return (
                  <div
                    key={misc.id}
                    className="flex items-start gap-4 p-4 rounded-lg border border-neutral-200 hover:border-primary hover:shadow-md transition-all cursor-pointer"
                    onClick={() => setSelectedMisconception(misc.id)}
                  >
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center text-lg font-bold text-neutral-700">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm">{misc.name}</p>
                          <p className="text-xs text-neutral-600 mt-1">{misc.code}</p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${severityColor}`}
                        >
                          {misc.severity}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-6 text-sm">
                        <div>
                          <span className="text-neutral-600">Learners: </span>
                          <span className="font-semibold">{misc.affectedLearnersCount}</span>
                        </div>
                        <div>
                          <span className="text-neutral-600">Occurrences: </span>
                          <span className="font-semibold">{misc.occurrences}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-xs ${
                              misc.trend === 'increasing' ? 'text-error' : 'text-success'
                            }`}
                          >
                            {misc.trend === 'increasing' ? '↑' : '↓'} {misc.trendValue}%
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="h-2 bg-neutral-200 rounded-full">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{
                              width: `${Math.min((misc.affectedLearnersCount / teacherLearners.length) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Heatmap Preview */}
          <Card>
            <div className="p-4 border-b border-neutral-200">
              <h3 className="font-semibold">Class-Wide Misconception Heatmap</h3>
              <p className="text-sm text-neutral-600">Visual overview of misconception distribution</p>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-10 gap-1">
                {Array.from({ length: 100 }).map((_, i) => {
                  const intensity = Math.random();
                  const bgColor =
                    intensity > 0.7
                      ? 'bg-error'
                      : intensity > 0.5
                      ? 'bg-warning'
                      : intensity > 0.3
                      ? 'bg-info'
                      : 'bg-neutral-200';
                  return <div key={i} className={`h-8 ${bgColor} rounded-sm`} />;
                })}
              </div>
              <div className="mt-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-neutral-200 rounded" />
                  <span>No issues</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-info rounded" />
                  <span>Low</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-warning rounded" />
                  <span>Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-error rounded" />
                  <span>High</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Misconception Detail / Interventions */}
        <div className="space-y-4">
          {selectedMisc ? (
            <Card>
              <div className="p-4 border-b border-neutral-200">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold">{selectedMisc.name}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMisconception(null)}
                  >
                    ✕
                  </Button>
                </div>
                <p className="text-xs text-neutral-600 mt-1">{selectedMisc.code}</p>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Description</h4>
                  <p className="text-sm text-neutral-700">{selectedMisc.description}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">Affected Grades</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMisc.affectedGrades.map((grade) => (
                      <span
                        key={grade}
                        className="px-2 py-1 bg-neutral-100 rounded text-xs font-medium"
                      >
                        Grade {grade}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">Root Cause</h4>
                  <p className="text-sm text-neutral-700">{selectedMisc.rootCause}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">Common Manifestations</h4>
                  <ul className="space-y-1">
                    {selectedMisc.manifestations.map((manifest, i) => (
                      <li key={i} className="text-sm text-neutral-700 flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{manifest}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-3">Remediation Strategies</h4>
                  <div className="space-y-3">
                    {selectedMisc.remediationStrategies.map((strategy, i) => (
                      <div key={i} className="border border-neutral-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-sm font-medium">{strategy.title}</h5>
                          <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded">
                            {strategy.estimatedDuration} min
                          </span>
                        </div>
                        <p className="text-xs text-neutral-600 mb-2">{strategy.description}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-neutral-500">Type:</span>
                          <span className="text-xs font-medium capitalize">
                            {strategy.type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-200">
                  <Button className="w-full">Create Intervention Plan</Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <div className="text-neutral-400 mb-2">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-sm text-neutral-600">
                Select a misconception to view details and remediation strategies
              </p>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <div className="p-4 border-b border-neutral-200">
              <h3 className="font-semibold">Quick Actions</h3>
            </div>
            <div className="p-4 space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                📊 View Full Heatmap
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                👥 Group Learners by Misconception
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                📝 Create Intervention Schedule
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                📧 Notify Parents
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                📚 View Resources
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}















