'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/page-header';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { sampleAssessments } from '../../mocks/assessments';
import { QuestionRepresentationSuite } from '../../components/mathematics';
import { evaluateAnswer, type EvaluationResponse } from '../../lib/api';

export default function TakeAssessmentPage() {
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes in seconds
  const [showReview, setShowReview] = useState(false);
  const [assessmentSubmitted, setAssessmentSubmitted] = useState(false);
  const [aiEvaluations, setAiEvaluations] = useState<Record<number, EvaluationResponse>>({});
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);

  const assessment = sampleAssessments[0]; // Use first assessment as example

  // Timer countdown
  useEffect(() => {
    if (assessmentStarted && !assessmentSubmitted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [assessmentStarted, assessmentSubmitted, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionIndex: number, answer: string) => {
    setAnswers({ ...answers, [questionIndex]: answer });
  };

  const toggleFlag = (questionIndex: number) => {
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(questionIndex)) {
      newFlagged.delete(questionIndex);
    } else {
      newFlagged.add(questionIndex);
    }
    setFlaggedQuestions(newFlagged);
  };

  const handleSubmit = async () => {
    if (showReview) {
      // Evaluate all answers with AI before final submission
      setIsEvaluating(true);
      setEvaluationError(null);
      const evaluations: Record<number, EvaluationResponse> = {};

      try {
        console.log('🤖 Starting AI evaluation for', assessment.questions.length, 'questions');

        for (let i = 0; i < assessment.questions.length; i++) {
          const question = assessment.questions[i];
          const learnerAnswer = answers[i];

          if (learnerAnswer) {
            console.log(`📝 Evaluating Question ${i + 1}:`, {
              question: question.content,
              correctAnswer: question.correctAnswer,
              learnerAnswer,
              type: question.type,
            });

            const evaluation = await evaluateAnswer({
              question_content: question.content,
              correct_answer: question.correctAnswer,
              learner_answer: learnerAnswer,
              question_type: question.type,
              max_score: question.marks,
              grade: assessment.grade,
            });

            console.log(`✅ Question ${i + 1} evaluated:`, evaluation);
            evaluations[i] = evaluation;
          }
        }

        console.log('🎉 All evaluations complete:', evaluations);
        setAiEvaluations(evaluations);

        // Only proceed to results if we got evaluations
        if (Object.keys(evaluations).length > 0) {
          setAssessmentSubmitted(true);
        } else {
          throw new Error('No evaluations were generated');
        }
      } catch (error) {
        console.error('❌ AI evaluation failed:', error);
        setEvaluationError(
          error instanceof Error
            ? error.message
            : 'Failed to connect to AI grading service. Please try again.'
        );
        // Don't proceed to results page on error
        setIsEvaluating(false);
      } finally {
        setIsEvaluating(false);
      }
    } else {
      setShowReview(true);
    }
  };

  const calculateScore = () => {
    // Use AI evaluations if available
    if (Object.keys(aiEvaluations).length > 0) {
      let totalScore = 0;
      let totalMarks = 0;
      assessment.questions.forEach((q, i) => {
        if (aiEvaluations[i]) {
          totalScore += aiEvaluations[i].score;
          totalMarks += aiEvaluations[i].max_score;
        }
      });
      return totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0;
    }

    // Fallback to simple correct/incorrect
    let correct = 0;
    assessment.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / assessment.questions.length) * 100);
  };

  // Landing page
  if (!assessmentStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
        <Card className="max-w-2xl w-full p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <svg
                className="w-8 h-8 text-primary"
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
            <h1 className="text-2xl font-bold mb-2">{assessment.title}</h1>
            <p className="text-neutral-600">{assessment.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-neutral-100 rounded-lg text-center">
              <p className="text-sm text-neutral-600 mb-1">Duration</p>
              <p className="text-2xl font-bold">{assessment.duration} min</p>
            </div>
            <div className="p-4 bg-neutral-100 rounded-lg text-center">
              <p className="text-sm text-neutral-600 mb-1">Total Marks</p>
              <p className="text-2xl font-bold">{assessment.totalMarks}</p>
            </div>
            <div className="p-4 bg-neutral-100 rounded-lg text-center">
              <p className="text-sm text-neutral-600 mb-1">Questions</p>
              <p className="text-2xl font-bold">{assessment.questions.length}</p>
            </div>
            <div className="p-4 bg-neutral-100 rounded-lg text-center">
              <p className="text-sm text-neutral-600 mb-1">Grade</p>
              <p className="text-2xl font-bold">{assessment.grade}</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-sm mb-2">📋 Instructions</h3>
            <ul className="text-sm text-neutral-700 space-y-1">
              <li>• Read each question carefully before answering</li>
              <li>• You can navigate between questions using the Next/Previous buttons</li>
              <li>• Flag questions for review if you're unsure</li>
              <li>• Your progress is automatically saved</li>
              <li>• You can review all answers before final submission</li>
              <li>• Once submitted, you cannot change your answers</li>
            </ul>
          </div>

          <Button onClick={() => setAssessmentStarted(true)} className="w-full" size="lg">
            Start Assessment
          </Button>
        </Card>
      </div>
    );
  }

  // Submission complete
  if (assessmentSubmitted) {
    const score = calculateScore();
    const misconceptions = Object.entries(aiEvaluations)
      .filter(([_, evaluation]) => evaluation.misconception_detected)
      .map(([index, evaluation]) => ({
        questionIndex: parseInt(index),
        misconception: evaluation.misconception_detected,
        question: assessment.questions[parseInt(index)],
      }));

    if (isEvaluating) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
          <Card className="max-w-2xl w-full p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4 animate-pulse">
              <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Evaluating Your Answers...</h1>
            <p className="text-neutral-600">Our AI is reviewing your responses and providing detailed feedback</p>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-neutral-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-4">
              <svg className="w-10 h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">Assessment Completed!</h1>
            <p className="text-neutral-600 mb-6">
              Your assessment has been submitted and evaluated with AI
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-6 bg-neutral-100 rounded-lg">
                <p className="text-sm text-neutral-600 mb-1">Your Score</p>
                <p className="text-4xl font-bold text-primary">{score}%</p>
              </div>
              <div className="p-6 bg-neutral-100 rounded-lg">
                <p className="text-sm text-neutral-600 mb-1">Questions Answered</p>
                <p className="text-4xl font-bold">
                  {Object.keys(answers).length}/{assessment.questions.length}
                </p>
              </div>
            </div>

            {misconceptions.length > 0 && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg p-5 mb-6 text-left shadow-md">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center">
                      <span className="text-xl">🎯</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-amber-900 mb-1 flex items-center gap-2">
                      AI-Detected Learning Opportunities
                      <span className="text-xs bg-amber-200 text-amber-900 px-2 py-1 rounded-full font-semibold">
                        {misconceptions.length} {misconceptions.length === 1 ? 'Area' : 'Areas'} Identified
                      </span>
                    </h3>
                    <p className="text-xs text-amber-700 mb-3">
                      Our AI identified specific CAPS curriculum misconceptions that need targeted support
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {misconceptions.map(({ questionIndex, misconception }) => (
                    <div key={questionIndex} className="bg-white/70 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-800">
                        {questionIndex + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-amber-900">{misconception}</p>
                        <p className="text-xs text-amber-700 mt-1">Your teacher has been notified for intervention</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-amber-200">
                  <p className="text-xs text-amber-800 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">These are common challenges in mathematics learning. Targeted practice will help overcome them.</span>
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Button className="w-full">View Detailed Feedback</Button>
              <Button variant="outline" className="w-full">
                Back to Dashboard
              </Button>
            </div>
          </Card>

          {/* Detailed AI Feedback - Enhanced Intelligence Display */}
          {Object.keys(aiEvaluations).length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold">🤖 AI-Powered Detailed Feedback</h2>
                <div className="flex items-center gap-2 text-xs text-neutral-600">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Intelligent evaluation with partial credit & misconception detection</span>
                </div>
              </div>

              {assessment.questions.map((question, i) => {
                const evaluation = aiEvaluations[i];
                if (!evaluation) return null;

                const isCorrect = evaluation.is_correct;
                const hasPartialCredit = evaluation.partial_credit;
                const hasMisconception = evaluation.misconception_detected;

                return (
                  <Card key={i} className={`p-6 border-2 ${isCorrect ? 'border-success/20' : hasMisconception ? 'border-amber-300' : 'border-danger/20'}`}>
                    {/* Question Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold text-lg">Question {i + 1}</p>
                          {hasPartialCredit && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                              Partial Credit Awarded
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-neutral-700 mb-3 leading-relaxed">{question.content}</p>

                        {/* Answer Comparison */}
                        <div className="grid grid-cols-1 gap-2 bg-neutral-50 rounded-lg p-3 mb-3">
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide min-w-[100px]">Your Answer:</span>
                            <span className="text-sm font-mono font-semibold text-neutral-900">{answers[i]}</span>
                          </div>
                          {!isCorrect && (
                            <div className="flex items-start gap-2">
                              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide min-w-[100px]">Expected:</span>
                              <span className="text-sm font-mono text-neutral-700">{question.correctAnswer}</span>
                            </div>
                          )}
                        </div>

                        {/* Score Badge */}
                        <div className="flex items-center gap-3">
                          <Badge tone={isCorrect ? 'success' : hasPartialCredit ? 'warning' : 'danger'} className="text-sm">
                            {evaluation.score}/{evaluation.max_score} points ({evaluation.percentage.toFixed(0)}%)
                          </Badge>
                          {isCorrect && (
                            <span className="text-xs text-success flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Correct!
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* AI-Generated Feedback */}
                    <div className={`rounded-lg p-4 mb-3 ${isCorrect ? 'bg-success/10 border border-success/20' : hasPartialCredit ? 'bg-blue-50 border border-blue-200' : 'bg-neutral-50 border border-neutral-200'}`}>
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 mt-0.5">
                          {isCorrect ? (
                            <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
                              <span className="text-success text-sm">✓</span>
                            </div>
                          ) : hasPartialCredit ? (
                            <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center">
                              <span className="text-blue-700 text-sm">½</span>
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-danger/20 flex items-center justify-center">
                              <span className="text-danger text-sm">✗</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-neutral-900 leading-relaxed">{evaluation.feedback}</p>
                          {hasPartialCredit && (
                            <p className="text-xs text-blue-700 mt-2 font-medium">
                              💡 AI recognized correct methodology despite calculation error
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Misconception Detection Card */}
                    {hasMisconception && (
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center">
                              <span className="text-lg">⚠️</span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-amber-900 mb-1 flex items-center gap-2">
                              Mathematical Misconception Detected
                              <span className="text-xs bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-semibold">
                                CAPS Aligned
                              </span>
                            </p>
                            <p className="text-sm font-semibold text-amber-800 mb-2">{evaluation.misconception_detected}</p>
                            <div className="text-xs text-amber-700 bg-white/50 rounded p-2 mt-2">
                              <p className="font-medium mb-1">📚 What this means:</p>
                              <p className="leading-relaxed">
                                This is a common learning gap in the South African CAPS curriculum. Your teacher will be notified
                                and will provide targeted support to address this specific misconception.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* AI Analysis Info */}
                    {evaluation.ai_evaluation?.used && (
                      <div className="mt-3 pt-3 border-t border-neutral-200">
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span>AI-powered evaluation {evaluation.ai_evaluation.cost ? `(Cost: $${evaluation.ai_evaluation.cost.toFixed(6)})` : ''}</span>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-6">
              <div className="text-center text-neutral-600">
                <p className="text-lg font-semibold mb-2">⚠️ AI Feedback Not Available</p>
                <p className="text-sm">
                  The AI evaluation did not complete successfully. Your score is based on basic answer matching.
                </p>
                <p className="text-xs mt-2">Check the browser console (F12) for detailed error information.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Review page
  if (showReview) {
    return (
      <div className="min-h-screen bg-neutral-50 p-4">
        <div className="max-w-4xl mx-auto">
          <PageHeader
            title="Review Your Answers"
            description="Check your responses before final submission"
          />

          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Answer Summary</h3>
              <span className="text-sm text-neutral-600">
                {Object.keys(answers).length} of {assessment.questions.length} answered
              </span>
            </div>
            <div className="grid grid-cols-10 gap-2">
              {assessment.questions.map((_, i) => {
                const isAnswered = answers[i] !== undefined;
                const isFlagged = flaggedQuestions.has(i);
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setShowReview(false);
                      setCurrentQuestion(i);
                    }}
                    className={`h-12 rounded-lg font-semibold text-sm transition-all ${
                      isAnswered
                        ? isFlagged
                          ? 'bg-warning text-white'
                          : 'bg-success text-white'
                        : 'bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </Card>

          <div className="space-y-4 mb-6">
            {assessment.questions.map((question, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-sm mb-2">
                      Question {i + 1} ({question.marks} marks)
                    </p>
                    <p className="text-sm mb-3">{question.content}</p>
                    {question.options && (
                      <div className="space-y-2">
                        {question.options.map((option, j) => (
                          <div
                            key={j}
                            className={`p-2 rounded border text-sm ${
                              answers[i] === option
                                ? 'border-primary bg-primary/5'
                                : 'border-neutral-200'
                            }`}
                          >
                            {String.fromCharCode(65 + j)}. {option}
                          </div>
                        ))}
                      </div>
                    )}
                    {answers[i] === undefined && (
                      <p className="text-sm text-error">Not answered</p>
                    )}
                  </div>
                  {flaggedQuestions.has(i) && (
                    <span className="text-warning text-sm">🚩 Flagged</span>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {evaluationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm font-semibold text-red-900 mb-1">⚠️ AI Evaluation Error</p>
              <p className="text-sm text-red-800">{evaluationError}</p>
              <p className="text-xs text-red-600 mt-2">
                Please check your internet connection and try again. If the problem persists, contact support.
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setShowReview(false)} className="flex-1">
              Continue Editing
            </Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={isEvaluating}>
              {isEvaluating ? 'Evaluating...' : 'Submit & Get AI Feedback'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main assessment interface
  const question = assessment.questions[currentQuestion];
  const progress = Math.round(((currentQuestion + 1) / assessment.questions.length) * 100);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">{assessment.title}</h2>
            <div
              className={`text-lg font-bold ${
                timeRemaining < 300 ? 'text-error' : 'text-neutral-700'
              }`}
            >
              ⏱️ {formatTime(timeRemaining)}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-neutral-600">
              Question {currentQuestion + 1} of {assessment.questions.length}
            </span>
            <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-neutral-600">{progress}% Complete</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question */}
          <div className="lg:col-span-3">
            <Card className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="text-sm font-medium text-neutral-600">
                    Question {currentQuestion + 1}
                  </span>
                  <span className="ml-4 text-sm text-neutral-600">
                    {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
                  </span>
                </div>
                <button
                  onClick={() => toggleFlag(currentQuestion)}
                  className={`text-2xl ${
                    flaggedQuestions.has(currentQuestion) ? 'text-warning' : 'text-neutral-300'
                  }`}
                >
                  🚩
                </button>
              </div>

              <p className="text-lg mb-6">{question.content}</p>

              {/* Visual Representations */}
              <QuestionRepresentationSuite
                question={question}
                onInteraction={(representationType, action, data) => {
                  console.log('Representation interaction:', {
                    representationType,
                    action,
                    data,
                    questionId: question.id,
                  });
                }}
              />

              {/* Answer Options */}
              {question.type === 'multiple_choice' && question.options && (
                <div className="space-y-3">
                  {question.options.map((option, i) => (
                    <label
                      key={i}
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-primary ${
                        answers[currentQuestion] === option
                          ? 'border-primary bg-primary/5'
                          : 'border-neutral-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion}`}
                        value={option}
                        checked={answers[currentQuestion] === option}
                        onChange={(e) => handleAnswer(currentQuestion, e.target.value)}
                        className="w-5 h-5"
                      />
                      <span className="flex-1">
                        <span className="font-semibold mr-2">
                          {String.fromCharCode(65 + i)}.
                        </span>
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === 'numeric' && (
                <div>
                  <input
                    type="number"
                    value={answers[currentQuestion] || ''}
                    onChange={(e) => handleAnswer(currentQuestion, e.target.value)}
                    className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg text-lg focus:border-primary focus:outline-none"
                    placeholder="Enter your answer"
                  />
                </div>
              )}

              {question.type === 'true_false' && (
                <div className="space-y-3">
                  {['True', 'False'].map((option) => (
                    <label
                      key={option}
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-primary ${
                        answers[currentQuestion] === option
                          ? 'border-primary bg-primary/5'
                          : 'border-neutral-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion}`}
                        value={option}
                        checked={answers[currentQuestion] === option}
                        onChange={(e) => handleAnswer(currentQuestion, e.target.value)}
                        className="w-5 h-5"
                      />
                      <span className="flex-1">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-200">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                >
                  ← Previous
                </Button>
                {currentQuestion === assessment.questions.length - 1 ? (
                  <Button onClick={() => setShowReview(true)}>Review Answers</Button>
                ) : (
                  <Button
                    onClick={() =>
                      setCurrentQuestion(
                        Math.min(assessment.questions.length - 1, currentQuestion + 1)
                      )
                    }
                  >
                    Next →
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* Question Palette */}
          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-24">
              <h3 className="font-semibold text-sm mb-3">Question Palette</h3>
              <div className="grid grid-cols-5 lg:grid-cols-4 gap-2 mb-4">
                {assessment.questions.map((_, i) => {
                  const isAnswered = answers[i] !== undefined;
                  const isFlagged = flaggedQuestions.has(i);
                  const isCurrent = i === currentQuestion;
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentQuestion(i)}
                      className={`h-10 rounded font-semibold text-sm transition-all ${
                        isCurrent
                          ? 'bg-primary text-white ring-2 ring-primary ring-offset-2'
                          : isAnswered
                          ? isFlagged
                            ? 'bg-warning text-white'
                            : 'bg-success text-white'
                          : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-success rounded" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-neutral-200 rounded" />
                  <span>Not Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-warning rounded" />
                  <span>Flagged</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-primary rounded" />
                  <span>Current</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}











