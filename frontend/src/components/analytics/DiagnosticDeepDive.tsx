'use client';

import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

export interface QuestionAnalysis {
  questionId: string;
  content: string;
  correctRate: number;
  averageTime: number; // seconds
  misconceptionTriggered?: {
    id: string;
    name: string;
    frequency: number;
  };
  skillsTested: string[];
  commonWrongAnswers: {
    answer: string;
    percentage: number;
    possibleReasoning: string;
  }[];
}

export interface WeeklyDiagnosticData {
  assessmentId: string;
  title: string;
  weekNumber: number;
  grade: number;
  completionRate: number;
  averageScore: number;
  questions: QuestionAnalysis[];
  participantCount: number;
  dateCompleted: Date;
}

export interface DiagnosticDeepDiveProps {
  diagnosticData: WeeklyDiagnosticData;
  onQuestionClick?: (questionId: string) => void;
  onInterventionCreate?: (questionId: string, misconceptionId: string) => void;
}

/**
 * DiagnosticDeepDive provides granular analysis of weekly diagnostic assessments
 * showing question-level performance, misconceptions triggered, and intervention opportunities
 */
export function DiagnosticDeepDive({
  diagnosticData,
  onQuestionClick,
  onInterventionCreate,
}: DiagnosticDeepDiveProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionAnalysis | null>(null);
  const [sortBy, setSortBy] = useState<'correctRate' | 'time' | 'misconception'>('correctRate');

  const sortedQuestions = [...diagnosticData.questions].sort((a, b) => {
    switch (sortBy) {
      case 'correctRate':
        return a.correctRate - b.correctRate; // Ascending (worst first)
      case 'time':
        return b.averageTime - a.averageTime; // Descending (longest first)
      case 'misconception':
        return (
          (b.misconceptionTriggered?.frequency || 0) -
          (a.misconceptionTriggered?.frequency || 0)
        );
      default:
        return 0;
    }
  });

  const getDifficultyColor = (correctRate: number) => {
    if (correctRate >= 80) return 'text-success';
    if (correctRate >= 60) return 'text-warning';
    return 'text-error';
  };

  const getDifficultyBg = (correctRate: number) => {
    if (correctRate >= 80) return 'bg-success/10';
    if (correctRate >= 60) return 'bg-warning/10';
    return 'bg-error/10';
  };

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">{diagnosticData.title}</h2>
            <p className="text-sm text-neutral-600">
              Week {diagnosticData.weekNumber} • Grade {diagnosticData.grade} •{' '}
              {diagnosticData.participantCount} learners participated
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{diagnosticData.averageScore}%</p>
            <p className="text-sm text-neutral-600">Average Score</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-neutral-600 mb-1">Completion Rate</p>
            <p className="text-2xl font-bold">{diagnosticData.completionRate}%</p>
          </div>
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-neutral-600 mb-1">Questions</p>
            <p className="text-2xl font-bold">{diagnosticData.questions.length}</p>
          </div>
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-neutral-600 mb-1">Misconceptions Found</p>
            <p className="text-2xl font-bold text-error">
              {diagnosticData.questions.filter((q) => q.misconceptionTriggered).length}
            </p>
          </div>
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-neutral-600 mb-1">Avg Time per Q</p>
            <p className="text-2xl font-bold">
              {Math.round(
                diagnosticData.questions.reduce((sum, q) => sum + q.averageTime, 0) /
                  diagnosticData.questions.length
              )}
              s
            </p>
          </div>
        </div>
      </Card>

      {/* Sorting Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Question-Level Analysis</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-600">Sort by:</span>
          <Button
            variant={sortBy === 'correctRate' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('correctRate')}
          >
            Difficulty
          </Button>
          <Button
            variant={sortBy === 'time' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('time')}
          >
            Time Spent
          </Button>
          <Button
            variant={sortBy === 'misconception' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('misconception')}
          >
            Misconceptions
          </Button>
        </div>
      </div>

      {/* Question Cards */}
      <div className="grid grid-cols-1 gap-4">
        {sortedQuestions.map((question, index) => (
          <Card
            key={question.questionId}
            className={`p-5 cursor-pointer transition-all hover:shadow-lg ${
              selectedQuestion?.questionId === question.questionId
                ? 'ring-2 ring-primary'
                : ''
            }`}
            onClick={() => {
              setSelectedQuestion(question);
              onQuestionClick?.(question.questionId);
            }}
          >
            <div className="flex items-start gap-4">
              {/* Question Number Badge */}
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${getDifficultyBg(question.correctRate)}`}
              >
                <span className={getDifficultyColor(question.correctRate)}>{index + 1}</span>
              </div>

              {/* Question Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 flex-1">
                    {question.content}
                  </p>
                  <div className="flex items-center gap-3 ml-4">
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getDifficultyColor(question.correctRate)}`}>
                        {question.correctRate}%
                      </p>
                      <p className="text-xs text-neutral-500">correct</p>
                    </div>
                  </div>
                </div>

                {/* Skills Tested */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {question.skillsTested.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Metrics Row */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-600">⏱️</span>
                    <span className="text-neutral-700 dark:text-neutral-300">
                      {question.averageTime}s avg
                    </span>
                  </div>

                  {question.misconceptionTriggered && (
                    <div className="flex items-center gap-2">
                      <span className="text-error">⚠️</span>
                      <span className="text-error font-medium">
                        {question.misconceptionTriggered.name} (
                        {question.misconceptionTriggered.frequency} learners)
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="ml-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          onInterventionCreate?.(
                            question.questionId,
                            question.misconceptionTriggered!.id
                          );
                        }}
                      >
                        Create Intervention
                      </Button>
                    </div>
                  )}
                </div>

                {/* Common Wrong Answers - Expandable */}
                {selectedQuestion?.questionId === question.questionId &&
                  question.commonWrongAnswers.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                      <p className="text-sm font-semibold mb-2">Common Wrong Answers:</p>
                      <div className="space-y-2">
                        {question.commonWrongAnswers.map((wrong, i) => (
                          <div key={i} className="flex items-start gap-3 text-sm">
                            <div className="flex-shrink-0 w-16 text-right">
                              <span className="font-semibold text-error">{wrong.percentage}%</span>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-neutral-900 dark:text-neutral-100">
                                "{wrong.answer}"
                              </p>
                              <p className="text-xs text-neutral-600 italic">
                                {wrong.possibleReasoning}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
