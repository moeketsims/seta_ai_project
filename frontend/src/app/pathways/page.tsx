'use client';

import { PageHeader } from '../../components/layout/page-header';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { samplePathways, achievements } from '../../mocks/pathways';
import { learners } from '../../mocks/users';
import { learnerProfiles } from '../../mocks/analytics';
import { useState } from 'react';

export default function PathwaysPage() {
  const [selectedLearner, setSelectedLearner] = useState<string | null>(
    learners[0]?.id || null
  );

  const learner = selectedLearner ? learners.find((l) => l.id === selectedLearner) : null;
  const pathway = selectedLearner ? samplePathways[0] : null; // Mock: use first pathway
  const profile = selectedLearner
    ? learnerProfiles.find((p) => p.learnerId === selectedLearner)
    : null;

  const completedNodes = pathway?.nodes.filter((n) => n.status === 'completed').length || 0;
  const totalNodes = pathway?.nodes.length || 0;
  const progress = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning Pathways"
        description="Personalized learning journeys for each learner"
        action={
          <Button size="sm">Generate New Pathways</Button>
        }
      />

      {/* Learner Selection */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Select Learner:</label>
          <select
            className="flex-1 max-w-md rounded-md border border-neutral-300 px-3 py-2 text-sm"
            value={selectedLearner || ''}
            onChange={(e) => setSelectedLearner(e.target.value)}
          >
            <option value="">Choose a learner...</option>
            {learners.slice(0, 20).map((l) => (
              <option key={l.id} value={l.id}>
                {l.firstName} {l.lastName} - Grade {l.grade}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {learner && pathway ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Pathway Visualization */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Overview */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {learner.firstName}'s Learning Journey
                  </h3>
                  <p className="text-sm text-neutral-600">
                    {pathway.estimatedDuration} day pathway • {progress}% complete
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">{progress}%</div>
                  <p className="text-xs text-neutral-600">
                    {completedNodes}/{totalNodes} activities
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-4 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Target Goals */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold mb-3">Target Goals</h4>
                <ul className="space-y-2">
                  {pathway.targetGoals.map((goal, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-1">🎯</span>
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            {/* Pathway Nodes */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Learning Activities</h3>
              <div className="space-y-4">
                {pathway.nodes.map((node, index) => {
                  const statusConfig = {
                    completed: {
                      bg: 'bg-success',
                      text: 'text-success',
                      icon: '✓',
                      border: 'border-success',
                    },
                    in_progress: {
                      bg: 'bg-warning',
                      text: 'text-warning',
                      icon: '▶',
                      border: 'border-warning',
                    },
                    available: {
                      bg: 'bg-info',
                      text: 'text-info',
                      icon: '○',
                      border: 'border-info',
                    },
                    locked: {
                      bg: 'bg-neutral-400',
                      text: 'text-neutral-400',
                      icon: '🔒',
                      border: 'border-neutral-300',
                    },
                  };

                  const config = statusConfig[node.status];

                  return (
                    <div key={node.id} className="relative">
                      {/* Connection Line */}
                      {index > 0 && (
                        <div className="absolute left-6 -top-4 w-0.5 h-4 bg-neutral-300" />
                      )}

                      <div
                        className={`flex items-start gap-4 p-4 rounded-lg border-2 ${config.border} ${
                          node.status === 'locked' ? 'opacity-60' : ''
                        } hover:shadow-md transition-all`}
                      >
                        {/* Status Icon */}
                        <div
                          className={`flex-shrink-0 h-12 w-12 rounded-full ${config.bg} flex items-center justify-center text-white font-bold text-lg`}
                        >
                          {config.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-sm">{node.title}</h4>
                              <p className="text-xs text-neutral-600 mt-1">{node.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-1 bg-neutral-100 rounded capitalize">
                                {node.type}
                              </span>
                              <span className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded">
                                {node.estimatedTime} min
                              </span>
                            </div>
                          </div>

                          {/* Node Details */}
                          <div className="flex items-center gap-4 text-xs text-neutral-600">
                            <span>Difficulty: {'⭐'.repeat(node.difficulty)}</span>
                            {node.performanceScore && (
                              <span className={`font-semibold ${config.text}`}>
                                Score: {node.performanceScore}%
                              </span>
                            )}
                            {node.completedAt && (
                              <span>
                                Completed: {node.completedAt.toLocaleDateString()}
                              </span>
                            )}
                          </div>

                          {/* Action Button */}
                          {node.status !== 'locked' && node.status !== 'completed' && (
                            <div className="mt-3">
                              <Button size="sm">
                                {node.status === 'in_progress' ? 'Continue' : 'Start Activity'}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Sidebar - Achievements & Stats */}
          <div className="space-y-4">
            {/* Learner Stats */}
            <Card className="p-4">
              <h4 className="font-semibold mb-4">Learner Stats</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Current Level</span>
                  <span className="text-lg font-bold text-primary">
                    {profile?.currentLevel || 1}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">XP Points</span>
                  <span className="text-lg font-bold text-secondary">
                    {profile?.xp || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Streak Days</span>
                  <span className="text-lg font-bold text-warning">
                    {profile?.streakDays || 0} 🔥
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Skills Mastered</span>
                  <span className="text-lg font-bold text-success">
                    {profile?.skillMastery.filter((s) => s.masteryLevel >= 80).length || 0}
                  </span>
                </div>
              </div>
            </Card>

            {/* Achievements */}
            <Card className="p-4">
              <h4 className="font-semibold mb-4">Achievements</h4>
              <div className="grid grid-cols-3 gap-2">
                {achievements.slice(0, 9).map((achievement) => {
                  const unlocked = Math.random() > 0.7; // Mock unlock status
                  return (
                    <div
                      key={achievement.id}
                      className={`p-3 border-2 rounded-lg text-center ${
                        unlocked
                          ? 'border-primary bg-primary/5'
                          : 'border-neutral-200 bg-neutral-50 opacity-50'
                      }`}
                      title={achievement.description}
                    >
                      <div className="text-2xl mb-1">
                        {achievement.category === 'skill' && '🎓'}
                        {achievement.category === 'streak' && '🔥'}
                        {achievement.category === 'speed' && '⚡'}
                        {achievement.category === 'challenge' && '🏆'}
                        {achievement.category === 'milestone' && '⭐'}
                      </div>
                      <p className="text-xs font-medium leading-tight">
                        {achievement.name.split(' ')[0]}
                      </p>
                    </div>
                  );
                })}
              </div>
              <Button variant="outline" className="w-full mt-4" size="sm">
                View All Achievements
              </Button>
            </Card>

            {/* Next Steps */}
            <Card className="p-4">
              <h4 className="font-semibold mb-3">Recommended Next Steps</h4>
              <div className="space-y-2 text-sm">
                <div className="p-3 bg-info/10 border border-info rounded-lg">
                  <p className="font-medium text-info">Complete current activity</p>
                  <p className="text-xs text-neutral-600 mt-1">
                    Finish "Multiplication Challenge Game" to unlock next lesson
                  </p>
                </div>
                <div className="p-3 bg-secondary/10 border border-secondary rounded-lg">
                  <p className="font-medium text-secondary">Practice more</p>
                  <p className="text-xs text-neutral-600 mt-1">
                    Additional practice recommended for better mastery
                  </p>
                </div>
              </div>
            </Card>

            {/* Recent Adaptations */}
            {pathway.adaptations.length > 0 && (
              <Card className="p-4">
                <h4 className="font-semibold mb-3">Recent Adaptations</h4>
                <div className="space-y-2">
                  {pathway.adaptations.map((adaptation, i) => (
                    <div key={i} className="text-xs p-3 bg-neutral-50 rounded-lg">
                      <p className="font-medium mb-1">{adaptation.reason}</p>
                      <p className="text-neutral-600">
                        {adaptation.timestamp.toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="text-neutral-400 mb-4">
            <svg
              className="mx-auto h-16 w-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-neutral-600">Select a learner to view their learning pathway</p>
        </Card>
      )}
    </div>
  );
}














