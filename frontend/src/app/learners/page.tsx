'use client';

import { useState } from 'react';
import { PageHeader } from '../../components/layout/page-header';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { learners, getLearnersByTeacher, currentUser, getClassById } from '../../mocks/users';
import { learnerProfiles } from '../../mocks/analytics';

export default function LearnersPage() {
  const teacherLearners = getLearnersByTeacher(currentUser.id);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredLearners = teacherLearners.filter((learner) => {
    const matchesSearch =
      learner.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      learner.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'all' || learner.classId === filterClass;
    return matchesSearch && matchesClass;
  });

  const statsData = {
    total: teacherLearners.length,
    onTrack: Math.floor(teacherLearners.length * 0.65),
    needsSupport: Math.floor(teacherLearners.length * 0.25),
    atRisk: Math.floor(teacherLearners.length * 0.10),
    avgPerformance: 74,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learner Management"
        description={`Managing ${teacherLearners.length} learners across ${currentUser.classes.length} classes`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Import CSV
            </Button>
            <Button size="sm">Add Learner</Button>
          </div>
        }
      />

      {/* Learner Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Card className="p-4">
          <p className="text-sm text-neutral-600">Total Learners</p>
          <p className="mt-1 text-2xl font-bold">{statsData.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-neutral-600">On Track</p>
          <p className="mt-1 text-2xl font-bold text-success">{statsData.onTrack}</p>
          <p className="text-xs text-neutral-500">{Math.round((statsData.onTrack / statsData.total) * 100)}%</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-neutral-600">Need Support</p>
          <p className="mt-1 text-2xl font-bold text-warning">{statsData.needsSupport}</p>
          <p className="text-xs text-neutral-500">{Math.round((statsData.needsSupport / statsData.total) * 100)}%</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-neutral-600">At Risk</p>
          <p className="mt-1 text-2xl font-bold text-error">{statsData.atRisk}</p>
          <p className="text-xs text-neutral-500">{Math.round((statsData.atRisk / statsData.total) * 100)}%</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-neutral-600">Avg Performance</p>
          <p className="mt-1 text-2xl font-bold">{statsData.avgPerformance}%</p>
          <p className="text-xs text-success">↑ 3% from last week</p>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search learners by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
          >
            <option value="all">All Classes</option>
            {currentUser.classes.map((classId) => (
              <option key={classId} value={classId}>
                {getClassById(classId)?.name || classId}
              </option>
            ))}
          </select>
          <select
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="on-track">On Track</option>
            <option value="needs-support">Needs Support</option>
            <option value="at-risk">At Risk</option>
          </select>
        </div>
      </Card>

      {/* Learner List */}
      <Card>
        <div className="p-4 border-b border-neutral-200">
          <h3 className="font-semibold">
            Learner List ({filteredLearners.length} learners)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">
                  Grade
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">
                  Class
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">
                  Performance
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">
                  Engagement
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredLearners.slice(0, 50).map((learner) => {
                const profile = learnerProfiles.find((p) => p.learnerId === learner.id);
                const performance = profile
                  ? Math.floor(
                      profile.skillMastery.reduce((acc, s) => acc + s.masteryLevel, 0) /
                        profile.skillMastery.length
                    )
                  : 70;
                const engagement = profile?.engagementScore || 75;
                const status =
                  profile?.riskScore === 'low'
                    ? 'On Track'
                    : profile?.riskScore === 'medium'
                    ? 'Needs Support'
                    : 'At Risk';
                const statusColor =
                  status === 'On Track'
                    ? 'bg-success/10 text-success'
                    : status === 'Needs Support'
                    ? 'bg-warning/10 text-warning'
                    : 'bg-error/10 text-error';

                return (
                  <tr key={learner.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                          {learner.firstName[0]}
                          {learner.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {learner.firstName} {learner.lastName}
                          </p>
                          <p className="text-xs text-neutral-500">{learner.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">Grade {learner.grade}</td>
                    <td className="px-4 py-3 text-sm">
                      {getClassById(learner.classId)?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-neutral-200 rounded-full max-w-[100px]">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${performance}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">{performance}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-neutral-200 rounded-full max-w-[100px]">
                          <div
                            className="h-full bg-secondary rounded-full transition-all"
                            style={{ width: `${engagement}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">{engagement}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-neutral-200 flex items-center justify-between">
          <p className="text-sm text-neutral-600">
            Showing {Math.min(50, filteredLearners.length)} of {filteredLearners.length} learners
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={filteredLearners.length <= 50}>
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
