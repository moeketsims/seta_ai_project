'use client';

import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

export interface SkillNode {
  skillId: string;
  name: string;
  topic: string;
  masteryLevel: number; // 0-100
  prerequisites: string[]; // IDs of prerequisite skills
  learnersAtLevel: {
    notStarted: number;
    developing: number;
    proficient: number;
    mastered: number;
  };
  averageTimeToMaster: number; // days
  commonBlockers: string[]; // Misconception IDs that prevent progress
  nextSkills: string[]; // IDs of skills unlocked by mastering this
}

export interface LearningPathway {
  pathwayId: string;
  name: string;
  description: string;
  targetGrade: number;
  skills: SkillNode[];
  completionRate: number;
  estimatedDuration: number; // weeks
}

export interface SkillProgressionMapProps {
  pathway: LearningPathway;
  selectedLearnerId?: string;
  onSkillClick?: (skillId: string) => void;
  onCreateIntervention?: (skillId: string) => void;
}

/**
 * SkillProgressionMap visualizes the learning pathway showing skill dependencies
 * and learner progress through prerequisite chains
 */
export function SkillProgressionMap({
  pathway,
  selectedLearnerId,
  onSkillClick,
  onCreateIntervention,
}: SkillProgressionMapProps) {
  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(null);
  const [viewMode, setViewMode] = useState<'flow' | 'list'>('flow');

  const getMasteryColor = (masteryLevel: number) => {
    if (masteryLevel >= 80) return 'bg-green-500';
    if (masteryLevel >= 60) return 'bg-blue-500';
    if (masteryLevel >= 40) return 'bg-yellow-500';
    if (masteryLevel > 0) return 'bg-orange-500';
    return 'bg-gray-300';
  };

  const getMasteryTextColor = (masteryLevel: number) => {
    if (masteryLevel >= 80) return 'text-green-700 dark:text-green-400';
    if (masteryLevel >= 60) return 'text-blue-700 dark:text-blue-400';
    if (masteryLevel >= 40) return 'text-yellow-700 dark:text-yellow-400';
    if (masteryLevel > 0) return 'text-orange-700 dark:text-orange-400';
    return 'text-gray-500';
  };

  const getMasteryLabel = (masteryLevel: number) => {
    if (masteryLevel >= 80) return 'Mastered';
    if (masteryLevel >= 60) return 'Proficient';
    if (masteryLevel >= 40) return 'Developing';
    if (masteryLevel > 0) return 'Emerging';
    return 'Not Started';
  };

  // Group skills by level (based on prerequisite depth)
  const getSkillLevel = (skill: SkillNode, skills: SkillNode[], visited = new Set<string>()): number => {
    if (visited.has(skill.skillId)) return 0; // Circular dependency guard
    visited.add(skill.skillId);

    if (skill.prerequisites.length === 0) return 0;

    const prereqLevels = skill.prerequisites
      .map((preId) => {
        const prereqSkill = skills.find((s) => s.skillId === preId);
        return prereqSkill ? getSkillLevel(prereqSkill, skills, visited) : 0;
      });

    return Math.max(...prereqLevels) + 1;
  };

  const skillsByLevel = pathway.skills.reduce((acc, skill) => {
    const level = getSkillLevel(skill, pathway.skills);
    if (!acc[level]) acc[level] = [];
    acc[level].push(skill);
    return acc;
  }, {} as Record<number, SkillNode[]>);

  const maxLevel = Math.max(...Object.keys(skillsByLevel).map(Number));

  // Calculate pathway stats
  const totalLearners = pathway.skills[0]
    ? Object.values(pathway.skills[0].learnersAtLevel).reduce((sum, count) => sum + count, 0)
    : 0;
  const avgMastery =
    pathway.skills.reduce((sum, s) => sum + s.masteryLevel, 0) / pathway.skills.length;
  const blockedLearners = pathway.skills.reduce(
    (sum, s) => sum + s.learnersAtLevel.developing + s.learnersAtLevel.emerging,
    0
  );

  return (
    <div className="space-y-6">
      {/* Pathway Header */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">{pathway.name}</h2>
            <p className="text-sm text-neutral-600">{pathway.description}</p>
            <p className="text-xs text-neutral-500 mt-1">
              Grade {pathway.targetGrade} • {pathway.skills.length} skills • Est.{' '}
              {pathway.estimatedDuration} weeks
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{Math.round(avgMastery)}%</p>
            <p className="text-sm text-neutral-600">Avg Mastery</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-neutral-600 mb-1">Total Learners</p>
            <p className="text-2xl font-bold">{totalLearners}</p>
          </div>
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-neutral-600 mb-1">Pathway Completion</p>
            <p className="text-2xl font-bold text-success">{pathway.completionRate}%</p>
          </div>
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-neutral-600 mb-1">Skills Mastered</p>
            <p className="text-2xl font-bold text-green-600">
              {pathway.skills.filter((s) => s.masteryLevel >= 80).length}
            </p>
          </div>
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-neutral-600 mb-1">Needs Support</p>
            <p className="text-2xl font-bold text-warning">{blockedLearners}</p>
          </div>
        </div>
      </Card>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Skill Dependency Map</h3>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'flow' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('flow')}
          >
            Flow View
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List View
          </Button>
        </div>
      </div>

      {/* Flow View - Visual Pathway */}
      {viewMode === 'flow' && (
        <Card className="p-8 overflow-x-auto">
          <div className="relative" style={{ minWidth: `${(maxLevel + 1) * 250}px` }}>
            {/* Render each level */}
            {Object.entries(skillsByLevel)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([level, skills]) => (
                <div key={level} className="mb-8">
                  <p className="text-xs font-semibold text-neutral-500 mb-3">
                    LEVEL {Number(level) + 1}
                  </p>
                  <div className="flex gap-4 flex-wrap">
                    {skills.map((skill) => (
                      <div
                        key={skill.skillId}
                        className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
                          selectedSkill?.skillId === skill.skillId
                            ? 'border-primary bg-primary/5'
                            : 'border-neutral-200 bg-white dark:bg-gray-800'
                        }`}
                        style={{ width: '220px' }}
                        onClick={() => {
                          setSelectedSkill(skill);
                          onSkillClick?.(skill.skillId);
                        }}
                      >
                        {/* Mastery Badge */}
                        <div
                          className={`absolute -top-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm ${getMasteryColor(skill.masteryLevel)}`}
                        >
                          {skill.masteryLevel}%
                        </div>

                        <div className="mb-2">
                          <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                            {skill.name}
                          </h4>
                          <p className="text-xs text-neutral-600">{skill.topic}</p>
                        </div>

                        <div className="mb-3">
                          <p className={`text-xs font-semibold ${getMasteryTextColor(skill.masteryLevel)}`}>
                            {getMasteryLabel(skill.masteryLevel)}
                          </p>
                        </div>

                        {/* Learner Distribution Mini Chart */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-neutral-600">
                              {skill.learnersAtLevel.mastered} mastered
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-neutral-600">
                              {skill.learnersAtLevel.proficient} proficient
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span className="text-neutral-600">
                              {skill.learnersAtLevel.developing} developing
                            </span>
                          </div>
                        </div>

                        {/* Prerequisites indicator */}
                        {skill.prerequisites.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                            <p className="text-xs text-neutral-500">
                              Requires {skill.prerequisites.length} skill(s)
                            </p>
                          </div>
                        )}

                        {/* Blocker warning */}
                        {skill.commonBlockers.length > 0 && (
                          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-700 dark:text-red-400">
                            ⚠️ {skill.commonBlockers.length} blocker(s)
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <p className="text-xs font-semibold text-neutral-600 mb-2">Mastery Levels:</p>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <span>Not Started (0%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span>Emerging (1-39%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span>Developing (40-59%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>Proficient (60-79%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Mastered (80-100%)</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* List View - Detailed Table */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {pathway.skills.map((skill) => (
            <Card
              key={skill.skillId}
              className={`p-5 cursor-pointer transition-all hover:shadow-md ${
                selectedSkill?.skillId === skill.skillId ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => {
                setSelectedSkill(skill);
                onSkillClick?.(skill.skillId);
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-white font-bold ${getMasteryColor(skill.masteryLevel)}`}
                >
                  {skill.masteryLevel}%
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                        {skill.name}
                      </h4>
                      <p className="text-sm text-neutral-600">{skill.topic}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${getMasteryTextColor(skill.masteryLevel)}`}>
                        {getMasteryLabel(skill.masteryLevel)}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {skill.averageTimeToMaster} days to master
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-3">
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
                      <p className="text-xs text-neutral-600 mb-1">Mastered</p>
                      <p className="text-lg font-bold text-green-700 dark:text-green-400">
                        {skill.learnersAtLevel.mastered}
                      </p>
                    </div>
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <p className="text-xs text-neutral-600 mb-1">Proficient</p>
                      <p className="text-lg font-bold text-blue-700 dark:text-blue-400">
                        {skill.learnersAtLevel.proficient}
                      </p>
                    </div>
                    <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                      <p className="text-xs text-neutral-600 mb-1">Developing</p>
                      <p className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
                        {skill.learnersAtLevel.developing}
                      </p>
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <p className="text-xs text-neutral-600 mb-1">Not Started</p>
                      <p className="text-lg font-bold text-gray-700 dark:text-gray-400">
                        {skill.learnersAtLevel.notStarted}
                      </p>
                    </div>
                  </div>

                  {skill.commonBlockers.length > 0 && (
                    <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 rounded">
                      <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">
                        ⚠️ Common Blockers ({skill.commonBlockers.length})
                      </p>
                      <p className="text-xs text-neutral-700 dark:text-neutral-300">
                        {skill.commonBlockers.join(', ')}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button size="sm" variant="outline">
                      View Learners
                    </Button>
                    {skill.commonBlockers.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreateIntervention?.(skill.skillId);
                        }}
                      >
                        Create Intervention
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
