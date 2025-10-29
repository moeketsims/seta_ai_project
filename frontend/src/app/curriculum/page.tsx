'use client';

import { PageHeader } from '../../components/layout/page-header';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import {
  curriculumTopics,
  getTopicsByGrade,
  getTopicsByStrand,
  mathematicsStrands,
  gradeLevels,
} from '../../mocks/curriculum';
import { useState } from 'react';

export default function CurriculumPage() {
  const [selectedGrade, setSelectedGrade] = useState<number>(4);
  const [selectedStrand, setSelectedStrand] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const filteredTopics =
    selectedStrand === 'all'
      ? getTopicsByGrade(selectedGrade)
      : getTopicsByGrade(selectedGrade).filter((t) => t.strand === selectedStrand);

  const selectedTopicData = selectedTopic
    ? curriculumTopics.find((t) => t.id === selectedTopic)
    : null;

  const strandColors: Record<string, string> = {
    'Numbers, Operations and Relationships': 'bg-blue-500',
    'Patterns, Functions and Algebra': 'bg-purple-500',
    'Space and Shape (Geometry)': 'bg-green-500',
    Measurement: 'bg-yellow-500',
    'Data Handling': 'bg-red-500',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="CAPS Mathematics Curriculum"
        description="Browse and explore the South African mathematics curriculum"
        action={
          <Button size="sm">Download Curriculum PDF</Button>
        }
      />

      {/* Grade Selection */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium mr-2">Grade:</span>
          {gradeLevels
            .filter((g) => g.number >= 4 && g.number <= 9)
            .map((grade) => (
              <button
                key={grade.id}
                onClick={() => {
                  setSelectedGrade(grade.number);
                  setSelectedTopic(null);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedGrade === grade.number
                    ? 'bg-primary text-white'
                    : 'bg-neutral-100 hover:bg-neutral-200'
                }`}
              >
                Grade {grade.number}
              </button>
            ))}
        </div>
      </Card>

      {/* Strand Filter */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium mr-2">Strand:</span>
          <button
            onClick={() => setSelectedStrand('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedStrand === 'all'
                ? 'bg-primary text-white'
                : 'bg-neutral-100 hover:bg-neutral-200'
            }`}
          >
            All Strands
          </button>
          {mathematicsStrands.map((strand) => (
            <button
              key={strand}
              onClick={() => setSelectedStrand(strand)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedStrand === strand
                  ? 'bg-primary text-white'
                  : 'bg-neutral-100 hover:bg-neutral-200'
              }`}
            >
              {strand.split(' ')[0]}
            </button>
          ))}
        </div>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Topic List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="p-4 border-b border-neutral-200">
              <h3 className="font-semibold">
                Grade {selectedGrade} Mathematics Topics ({filteredTopics.length})
              </h3>
              <p className="text-sm text-neutral-600">
                {selectedStrand === 'all'
                  ? 'All mathematics strands'
                  : selectedStrand}
              </p>
            </div>
            <div className="divide-y divide-neutral-200">
              {filteredTopics.length > 0 ? (
                filteredTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className={`p-4 cursor-pointer transition-all hover:bg-neutral-50 ${
                      selectedTopic === topic.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                    }`}
                    onClick={() => setSelectedTopic(topic.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-3 h-3 rounded-full mt-1 ${
                          strandColors[topic.strand] || 'bg-neutral-400'
                        }`}
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{topic.name}</h4>
                        <p className="text-xs text-neutral-600 mt-1">{topic.description}</p>
                        <div className="mt-2 flex items-center gap-3 text-xs text-neutral-500">
                          <span>{topic.strand}</span>
                          <span>•</span>
                          <span>{topic.skills.length} skills</span>
                          <span>•</span>
                          <span>{topic.learningOutcomes.length} outcomes</span>
                        </div>
                      </div>
                      <span className="text-xs font-medium px-2 py-1 bg-neutral-100 rounded">
                        Grade {topic.grade}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <p className="text-neutral-600">
                    No topics found for selected grade and strand
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Topic Details Sidebar */}
        <div className="space-y-4">
          {selectedTopicData ? (
            <>
              <Card className="p-4">
                <h3 className="font-semibold mb-3">{selectedTopicData.name}</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-medium text-neutral-600">Strand</span>
                    <p className="text-sm mt-1">{selectedTopicData.strand}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-neutral-600">Description</span>
                    <p className="text-sm mt-1">{selectedTopicData.description}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-neutral-600">Grade Level</span>
                    <p className="text-sm mt-1">Grade {selectedTopicData.grade}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-3 text-sm">Learning Outcomes</h4>
                <ul className="space-y-2">
                  {selectedTopicData.learningOutcomes.map((outcome, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-success mt-1">✓</span>
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-3 text-sm">
                  Skills ({selectedTopicData.skills.length})
                </h4>
                <div className="space-y-2">
                  {selectedTopicData.skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="p-3 border border-neutral-200 rounded-lg hover:border-primary transition-all"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-sm font-medium">{skill.name}</p>
                        <span className="text-xs px-2 py-0.5 bg-secondary/10 text-secondary rounded">
                          L{skill.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600">{skill.description}</p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
                        <span className="capitalize">{skill.bloomsLevel}</span>
                        {skill.prerequisites.length > 0 && (
                          <>
                            <span>•</span>
                            <span>{skill.prerequisites.length} prerequisites</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-3 text-sm">Quick Actions</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    📝 Create Assessment
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    📊 View Progress
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    📚 Browse Resources
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    🎯 Create Learning Pathway
                  </Button>
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-8 text-center">
              <div className="text-neutral-400 mb-3">
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
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <p className="text-sm text-neutral-600">
                Select a topic to view details, learning outcomes, and skills
              </p>
            </Card>
          )}

          {/* Curriculum Legend */}
          <Card className="p-4">
            <h4 className="font-semibold mb-3 text-sm">Strand Legend</h4>
            <div className="space-y-2 text-xs">
              {mathematicsStrands.map((strand) => (
                <div key={strand} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${strandColors[strand]}`} />
                  <span>{strand}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Curriculum Overview Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
        <Card className="p-4">
          <p className="text-sm text-neutral-600">Total Topics</p>
          <p className="mt-1 text-2xl font-bold">{curriculumTopics.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-neutral-600">Grade 4-6</p>
          <p className="mt-1 text-2xl font-bold">
            {curriculumTopics.filter((t) => t.grade >= 4 && t.grade <= 6).length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-neutral-600">Grade 7-9</p>
          <p className="mt-1 text-2xl font-bold">
            {curriculumTopics.filter((t) => t.grade >= 7 && t.grade <= 9).length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-neutral-600">Total Skills</p>
          <p className="mt-1 text-2xl font-bold">
            {curriculumTopics.reduce((acc, t) => acc + t.skills.length, 0)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-neutral-600">Strands</p>
          <p className="mt-1 text-2xl font-bold">{mathematicsStrands.length}</p>
        </Card>
      </div>
    </div>
  );
}















