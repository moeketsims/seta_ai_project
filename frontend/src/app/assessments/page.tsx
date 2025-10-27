'use client';

import { PageHeader } from '../../components/layout/page-header';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { sampleAssessments, questionTemplates, sampleQuestions } from '../../mocks/assessments';
import { currentUser } from '../../mocks/users';
import { useState } from 'react';
import { QuestionRepresentationSuite } from '../../components/mathematics';

export default function AssessmentsPage() {
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'builder' | 'bank'>('list');

  const myAssessments = sampleAssessments.filter((a) => a.createdBy === currentUser.id);
  const publishedCount = myAssessments.filter((a) => a.published).length;
  const draftCount = myAssessments.filter((a) => !a.published).length;

  const selectedAssess = selectedAssessment
    ? sampleAssessments.find((a) => a.id === selectedAssessment)
    : null;

  if (view === 'builder') {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Assessment Builder"
          description="Create a new assessment or edit existing one"
          action={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setView('list')}>
                Cancel
              </Button>
              <Button size="sm">Save Draft</Button>
              <Button size="sm">Publish</Button>
            </div>
          }
        />

        {/* Builder Steps */}
        <div className="flex items-center gap-4 mb-6">
          {['Basic Info', 'Questions', 'Curriculum', 'Review'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  i === 0
                    ? 'bg-primary text-white'
                    : 'bg-neutral-200 text-neutral-600'
                }`}
              >
                {i + 1}
              </div>
              <span className={`text-sm ${i === 0 ? 'font-semibold' : 'text-neutral-600'}`}>
                {step}
              </span>
              {i < 3 && <span className="text-neutral-400 mx-2">→</span>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Builder Area */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Assessment Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                    placeholder="e.g., Week 12 Diagnostic - Grade 4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                    rows={3}
                    placeholder="Describe what this assessment covers..."
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Grade *</label>
                    <select className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm">
                      <option>Select grade</option>
                      {[4, 5, 6, 7, 8, 9].map((g) => (
                        <option key={g} value={g}>
                          Grade {g}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Duration (min)</label>
                    <input
                      type="number"
                      className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                      placeholder="30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Type *</label>
                    <select className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm">
                      <option>Diagnostic</option>
                      <option>Formative</option>
                      <option>Summative</option>
                      <option>Weekly Diagnostic</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Questions (0)</h3>
                <Button size="sm" onClick={() => setView('bank')}>
                  Add from Bank
                </Button>
              </div>
              <div className="border-2 border-dashed border-neutral-300 rounded-lg p-12 text-center">
                <p className="text-neutral-600 mb-4">No questions added yet</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {questionTemplates.map((template) => (
                    <Button key={template.id} variant="outline" size="sm">
                      {template.icon} {template.name}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="p-4">
              <h4 className="font-semibold mb-3 text-sm">Quick Stats</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Total Questions</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Total Marks</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Est. Duration</span>
                  <span className="font-semibold">0 min</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold mb-3 text-sm">Question Templates</h4>
              <div className="space-y-2">
                {questionTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-3 border border-neutral-200 rounded-lg hover:border-primary cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{template.icon}</span>
                      <span className="font-medium text-sm">{template.name}</span>
                    </div>
                    <p className="text-xs text-neutral-600">{template.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'bank') {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Question Bank"
          description="Browse and select questions for your assessment"
          action={
            <Button size="sm" onClick={() => setView('builder')}>
              Back to Builder
            </Button>
          }
        />

        <Card className="p-4">
          <div className="flex flex-wrap gap-4 mb-4">
            <input
              type="text"
              placeholder="Search questions..."
              className="flex-1 min-w-[200px] rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
            <select className="rounded-md border border-neutral-300 px-3 py-2 text-sm">
              <option>All Grades</option>
              {[4, 5, 6, 7, 8, 9].map((g) => (
                <option key={g}>Grade {g}</option>
              ))}
            </select>
            <select className="rounded-md border border-neutral-300 px-3 py-2 text-sm">
              <option>All Types</option>
              <option>Multiple Choice</option>
              <option>Numeric</option>
              <option>True/False</option>
              <option>Word Problem</option>
            </select>
            <select className="rounded-md border border-neutral-300 px-3 py-2 text-sm">
              <option>All Difficulties</option>
              <option>Easy (1-2)</option>
              <option>Medium (3)</option>
              <option>Hard (4-5)</option>
            </select>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sampleQuestions.map((question) => (
            <Card key={question.id} className="p-4 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium px-2 py-1 bg-neutral-100 rounded">
                    {question.type.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded">
                    {question.marks} marks
                  </span>
                  <span className="text-xs font-medium px-2 py-1 bg-secondary/10 text-secondary rounded">
                    Difficulty: {question.difficulty}
                  </span>
                  {question.representations && question.representations.length > 0 && (
                    <span className="text-xs font-medium px-2 py-1 bg-amber-100 text-amber-800 rounded">
                      📊 {question.representations.length} visual aids
                    </span>
                  )}
                </div>
                <Button size="sm" variant="outline">
                  Add
                </Button>
              </div>
              <p className="text-sm font-medium mb-2">{question.content}</p>
              {question.options && (
                <div className="space-y-1 mb-2">
                  {question.options.map((opt, i) => (
                    <div key={i} className="text-xs text-neutral-600 flex items-center gap-2">
                      <span className="font-medium">{String.fromCharCode(65 + i)}.</span>
                      <span>{opt}</span>
                      {opt === question.correctAnswer && (
                        <span className="text-success">✓</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Preview representations if available */}
              {question.representations && question.representations.length > 0 && (
                <details className="mb-2">
                  <summary className="text-xs font-medium text-primary cursor-pointer hover:underline">
                    Preview learner visual aids
                  </summary>
                  <div className="mt-2 scale-75 origin-top-left">
                    <QuestionRepresentationSuite question={question} />
                  </div>
                </details>
              )}

              <div className="text-xs text-neutral-500 pt-2 border-t border-neutral-200">
                <span className="font-medium">Explanation:</span> {question.explanation}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assessments"
        description="Create, manage, and schedule mathematics assessments"
        action={
          <Button size="sm" onClick={() => setView('builder')}>
            Create Assessment
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <p className="text-sm text-neutral-600">Total Assessments</p>
          <p className="mt-1 text-2xl font-bold">{sampleAssessments.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-neutral-600">Published</p>
          <p className="mt-1 text-2xl font-bold text-success">{publishedCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-neutral-600">Drafts</p>
          <p className="mt-1 text-2xl font-bold text-warning">{draftCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-neutral-600">Question Bank</p>
          <p className="mt-1 text-2xl font-bold">{sampleQuestions.length}</p>
        </Card>
      </div>

      {/* Assessment List */}
      <Card>
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">My Assessments</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setView('bank')}>
                Question Bank
              </Button>
              <select className="rounded-md border border-neutral-300 px-3 py-1 text-sm">
                <option>All Types</option>
                <option>Diagnostic</option>
                <option>Formative</option>
                <option>Summative</option>
              </select>
            </div>
          </div>
        </div>
        <div className="divide-y divide-neutral-200">
          {sampleAssessments.map((assessment) => (
            <div
              key={assessment.id}
              className="p-4 hover:bg-neutral-50 cursor-pointer"
              onClick={() => setSelectedAssessment(assessment.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{assessment.title}</h4>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        assessment.published
                          ? 'bg-success/10 text-success'
                          : 'bg-warning/10 text-warning'
                      }`}
                    >
                      {assessment.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 mb-2">{assessment.description}</p>
                  <div className="flex items-center gap-4 text-xs text-neutral-500">
                    <span>📚 Grade {assessment.grade}</span>
                    <span>⏱️ {assessment.duration} min</span>
                    <span>📝 {assessment.questions.length} questions</span>
                    <span>🎯 {assessment.totalMarks} marks</span>
                    <span className="capitalize">{assessment.type.replace('_', ' ')}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Preview
                  </Button>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    Assign
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}











