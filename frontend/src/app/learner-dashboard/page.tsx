'use client';

import { PageHeader } from '../../components/layout/page-header';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { learners } from '../../mocks/users';
import { learnerProfiles } from '../../mocks/analytics';
import { samplePathways, achievements } from '../../mocks/pathways';
import { sampleAssessments } from '../../mocks/assessments';

export default function LearnerDashboardPage() {
  // Use first learner as example
  const learner = learners[0];
  const profile = learnerProfiles[0];
  const pathway = samplePathways[0];

  const nextLevel = Math.floor(profile.xp / 1000) + 1;
  const xpToNextLevel = (nextLevel * 1000) - profile.xp;
  const xpProgress = ((profile.xp % 1000) / 1000) * 100;

  const upcomingAssessments = sampleAssessments.slice(0, 3);
  const recentActivities = [
    {
      title: 'Completed Multiplication Quiz',
      time: '2 hours ago',
      xp: '+50 XP',
      icon: '✓',
      color: 'text-success',
    },
    {
      title: 'Started Fraction Lesson',
      time: '1 day ago',
      xp: '+30 XP',
      icon: '📚',
      color: 'text-info',
    },
    {
      title: 'Achieved 7-Day Streak!',
      time: '2 days ago',
      xp: '+300 XP',
      icon: '🔥',
      color: 'text-warning',
    },
  ];

  const skillsData = profile.skillMastery.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {learner.firstName}! 👋
            </h1>
            <p className="text-white/90 mb-4">
              You're doing great! Keep up the excellent work.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="opacity-90">Streak:</span>
                <span className="font-bold ml-2">{profile.streakDays} days 🔥</span>
              </div>
              <div>
                <span className="opacity-90">Level:</span>
                <span className="font-bold ml-2">{profile.currentLevel}</span>
              </div>
              <div>
                <span className="opacity-90">XP:</span>
                <span className="font-bold ml-2">{profile.xp}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur">
              <span className="text-4xl">🎓</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-neutral-600">Current Level</p>
            <span className="text-2xl">⭐</span>
          </div>
          <p className="text-3xl font-bold text-primary">{profile.currentLevel}</p>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-neutral-600">Progress to Level {nextLevel}</span>
              <span className="font-semibold">{Math.round(xpProgress)}%</span>
            </div>
            <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <p className="text-xs text-neutral-600 mt-1">{xpToNextLevel} XP to next level</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-neutral-600">Skills Mastered</p>
            <span className="text-2xl">🎯</span>
          </div>
          <p className="text-3xl font-bold text-success">
            {profile.skillMastery.filter((s) => s.masteryLevel >= 80).length}
          </p>
          <p className="text-xs text-neutral-600 mt-2">
            of {profile.skillMastery.length} skills
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-neutral-600">Learning Streak</p>
            <span className="text-2xl">🔥</span>
          </div>
          <p className="text-3xl font-bold text-warning">{profile.streakDays}</p>
          <p className="text-xs text-neutral-600 mt-2">consecutive days</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-neutral-600">Total XP</p>
            <span className="text-2xl">💎</span>
          </div>
          <p className="text-3xl font-bold text-secondary">{profile.xp}</p>
          <p className="text-xs text-neutral-600 mt-2">experience points</p>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Continue Learning */}
          <Card>
            <div className="p-6 border-b border-neutral-200">
              <h3 className="font-semibold text-lg">Continue Learning</h3>
            </div>
            <div className="p-6">
              {pathway.nodes
                .filter((n) => n.status === 'in_progress' || n.status === 'available')
                .slice(0, 2)
                .map((node) => (
                  <div
                    key={node.id}
                    className="flex items-start gap-4 p-4 border-2 border-primary rounded-lg mb-4 last:mb-0 hover:shadow-md transition-all"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                      {node.type === 'lesson' && '📚'}
                      {node.type === 'practice' && '✏️'}
                      {node.type === 'game' && '🎮'}
                      {node.type === 'assessment' && '📝'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{node.title}</h4>
                      <p className="text-sm text-neutral-600 mb-3">{node.description}</p>
                      <div className="flex items-center gap-4 text-xs text-neutral-600">
                        <span>⏱️ {node.estimatedTime} min</span>
                        <span>⭐ Level {node.difficulty}</span>
                      </div>
                    </div>
                    <Button size="sm">
                      {node.status === 'in_progress' ? 'Continue' : 'Start'}
                    </Button>
                  </div>
                ))}
            </div>
          </Card>

          {/* Upcoming Assessments */}
          <Card>
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Upcoming Assessments</h3>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>
            </div>
            <div className="divide-y divide-neutral-200">
              {upcomingAssessments.map((assessment) => (
                <div key={assessment.id} className="p-6 hover:bg-neutral-50 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{assessment.title}</h4>
                      <p className="text-sm text-neutral-600 mb-3">{assessment.description}</p>
                      <div className="flex items-center gap-4 text-xs text-neutral-600">
                        <span>⏱️ {assessment.duration} min</span>
                        <span>📝 {assessment.questions.length} questions</span>
                        <span>🎯 {assessment.totalMarks} marks</span>
                      </div>
                    </div>
                    <Button size="sm">Take Assessment</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Skill Progress */}
          <Card>
            <div className="p-6 border-b border-neutral-200">
              <h3 className="font-semibold text-lg">Your Skill Progress</h3>
            </div>
            <div className="p-6 space-y-4">
              {skillsData.map((skill) => {
                const getColor = (level: number) => {
                  if (level >= 80) return { bg: 'bg-success', text: 'text-success' };
                  if (level >= 60) return { bg: 'bg-info', text: 'text-info' };
                  if (level >= 40) return { bg: 'bg-warning', text: 'text-warning' };
                  return { bg: 'bg-error', text: 'text-error' };
                };
                const color = getColor(skill.masteryLevel);

                return (
                  <div key={skill.skillId}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{skill.skillId.split('-').pop()}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${color.text}`}>
                          {Math.round(skill.masteryLevel)}%
                        </span>
                        <span className="text-xs text-neutral-500">
                          {skill.trend === 'improving' && '↑'}
                          {skill.trend === 'declining' && '↓'}
                          {skill.trend === 'stable' && '→'}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color.bg} rounded-full transition-all`}
                        style={{ width: `${skill.masteryLevel}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Today's Goal */}
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
            <div className="p-6">
              <h3 className="font-semibold mb-4">🎯 Today's Goal</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center text-white text-xs">
                    ✓
                  </div>
                  <span className="text-sm">Complete 2 activities</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-neutral-300 flex items-center justify-center text-white text-xs">
                    1
                  </div>
                  <span className="text-sm">Earn 100 XP</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-neutral-300 flex items-center justify-center text-white text-xs">
                    2
                  </div>
                  <span className="text-sm">Practice for 30 minutes</span>
                </div>
              </div>
              <Button className="w-full mt-4" size="sm">
                View All Goals
              </Button>
            </div>
          </Card>

          {/* Achievements */}
          <Card>
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Achievements</h3>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-3 mb-4">
                {achievements.slice(0, 6).map((achievement, i) => {
                  const unlocked = i < 3; // Mock: first 3 unlocked
                  return (
                    <div
                      key={achievement.id}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center p-2 ${
                        unlocked
                          ? 'bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-400'
                          : 'bg-neutral-100 opacity-50'
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
                      <p className="text-xs text-center font-medium leading-tight">
                        {achievement.name.split(' ')[0]}
                      </p>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-center text-neutral-600">
                3 of {achievements.length} achievements unlocked
              </p>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card>
            <div className="p-6 border-b border-neutral-200">
              <h3 className="font-semibold">Recent Activity</h3>
            </div>
            <div className="p-6 space-y-3">
              {recentActivities.map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center ${activity.color}`}
                  >
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-neutral-600">{activity.time}</p>
                  </div>
                  <span className="text-xs font-semibold text-secondary">{activity.xp}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Weekly Calendar */}
          <Card>
            <div className="p-6 border-b border-neutral-200">
              <h3 className="font-semibold">Activity Calendar</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                  <div key={i} className="text-center text-xs font-medium text-neutral-600">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 28 }).map((_, i) => {
                  const hasActivity = Math.random() > 0.3;
                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded ${
                        hasActivity ? 'bg-success' : 'bg-neutral-200'
                      }`}
                      title={hasActivity ? 'Active day' : 'No activity'}
                    />
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-xs mt-3">
                <span className="text-neutral-600">Less</span>
                <div className="flex gap-1">
                  <div className="w-4 h-4 bg-neutral-200 rounded" />
                  <div className="w-4 h-4 bg-success/40 rounded" />
                  <div className="w-4 h-4 bg-success/70 rounded" />
                  <div className="w-4 h-4 bg-success rounded" />
                </div>
                <span className="text-neutral-600">More</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}














