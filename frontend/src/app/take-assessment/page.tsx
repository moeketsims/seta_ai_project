'use client';

import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { useDiagnosticSession } from '../../hooks/useDiagnosticSession';
import { AudioControls } from '../../components/assessment/AudioControls';
import { VoiceInputButton } from '../../components/assessment/VoiceInputButton';
import type { MatchedOption } from '../../hooks/useVoiceInput';

export default function TakeAssessmentPage() {
  // Parse URL params for learner and form ID, with defaults
  const [learnerId, setLearnerId] = useState<string>('test-learner-001');
  const [formId, setFormId] = useState<string>('diagnostic-form-g4-week12');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  // Diagnostic assessment hook (always enabled)
  const diagnosticSession = useDiagnosticSession({
    learnerId,
    formId,
    enabled: true,
    autoStart: false,
  });

  // Parse URL params on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const learner = params.get('learner_id');
      const form = params.get('form_id');

      if (learner) setLearnerId(learner);
      if (form) setFormId(form);
    }
  }, []);

  // Reset selected answer when question changes
  useEffect(() => {
    setSelectedAnswer(null);
  }, [diagnosticSession.currentQuestion?.stem]);

  // Voice input handler - auto-select matched answer AND auto-submit
  const handleVoiceTranscription = (transcript: string, matchedOption?: MatchedOption) => {
    console.log('🎤 Voice transcript:', transcript);
    console.log('🎯 Matched option:', matchedOption);
    console.log('📋 Current question options:', diagnosticSession.currentQuestion?.options);

    if (!diagnosticSession.currentQuestion) {
      console.error('❌ No current question available');
      return;
    }

    // Check if we have a matched option
    if (matchedOption && matchedOption.matched_option_id) {
      // Find the option with matching ID (IDs are already "A", "B", "C", "D")
      const actualOption = diagnosticSession.currentQuestion.options.find(
        opt => opt.id === matchedOption.matched_option_id
      );

      if (actualOption) {
        console.log(`✅ Voice matched: ${matchedOption.matched_option_id} → ${actualOption.id} (${actualOption.text})`);

        // Auto-select the matched answer
        setSelectedAnswer(actualOption.id);

        // Auto-submit after 2 second delay (gives user review time)
        setTimeout(() => {
          console.log('🚀 Auto-submitting answer:', actualOption.id);
          diagnosticSession.submitAnswer(actualOption.id);
        }, 2000);
      } else {
        console.error(`❌ Could not find option with ID: ${matchedOption.matched_option_id}`);
      }
    } else {
      console.warn('⚠️ No match found. User must click submit manually.');
    }
  };

  // ========================================================================
  // DIAGNOSTIC COMPLETION SCREEN
  // ========================================================================
  if (diagnosticSession.result) {
    const result = diagnosticSession.result;
    const misconceptionCount = Object.keys(result.all_misconceptions || {}).length;
    const hasMisconceptions = misconceptionCount > 0;
    const minutes = Math.floor(result.total_time_seconds / 60);
    const seconds = result.total_time_seconds % 60;
    const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    return (
      <div className="min-h-screen bg-[#F1F3F5]">
        {/* BRUTALIST HERO: Navy Block */}
        <div className="bg-[var(--ufs-navy)] text-white px-12 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-[var(--edu-green)] flex items-center justify-center shadow-2xl">
                  <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-6xl font-bold mb-3 tracking-tight leading-none">
                    Diagnostic Complete
                  </h1>
                  <p className="text-xl text-white/60 font-light">
                    Adaptive assessment analyzed · AI-powered insights
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-white/50 font-medium mb-2">SESSION ID</div>
                <div className="text-lg font-mono text-white/80">{result.session_id.slice(-8).toUpperCase()}</div>
              </div>
            </div>

            {/* 2-column Metrics Grid with glass-morphism */}
            <div className="grid grid-cols-2 gap-8 mt-12 max-w-2xl">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/20">
                <div className="text-xs text-white/60 font-medium mb-2 uppercase tracking-wide">Questions Answered</div>
                <div className="text-4xl font-bold text-white mb-1">{diagnosticSession.questionsAnswered}</div>
                <div className="text-xs text-white/50">Adaptive pathway</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/20">
                <div className="text-xs text-white/60 font-medium mb-2 uppercase tracking-wide">Time Taken</div>
                <div className="text-4xl font-bold text-white mb-1">{timeDisplay}</div>
                <div className="text-xs text-white/50">{minutes} min {seconds} sec</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section with elevated cards */}
        <div className="max-w-6xl mx-auto px-12 -mt-8 pb-16">
          {/* Learner Feedback Card */}
          {result.learner_feedback && (
            <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(15,32,75,0.15)] p-10 mb-8 border-l-8 border-[var(--edu-green)]">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[var(--edu-green)]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💬</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-[var(--ufs-navy)] mb-2">Your Personalized Feedback</h2>
                  <p className="text-sm text-neutral-500">Based on adaptive diagnostic analysis</p>
                </div>
              </div>
              <div className="bg-[var(--edu-green)]/5 rounded-2xl p-6 border border-[var(--edu-green)]/20">
                <p className="text-base leading-relaxed text-neutral-700">{result.learner_feedback}</p>
              </div>
            </div>
          )}

          {/* Misconceptions Detected - Priority-based styling */}
          {hasMisconceptions && (
            <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(167,25,48,0.15)] p-10 mb-8 border-l-8 border-[var(--ufs-maroon)]">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-[var(--ufs-maroon)]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎯</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-[var(--ufs-navy)] mb-2 flex items-center gap-3">
                    Learning Opportunities Identified
                    <span className="text-sm bg-[var(--ufs-maroon)] text-white px-4 py-1.5 rounded-full font-semibold">
                      {misconceptionCount} {misconceptionCount === 1 ? 'Area' : 'Areas'}
                    </span>
                  </h2>
                  <p className="text-sm text-neutral-500">CAPS curriculum-aligned misconceptions requiring targeted support</p>
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries(result.all_misconceptions).map(([miscId, confidence]) => {
                  const confidencePercent = Math.round((confidence as number) * 100);
                  const isHigh = confidencePercent >= 70;
                  const isMedium = confidencePercent >= 40 && confidencePercent < 70;

                  return (
                    <div
                      key={miscId}
                      className={`bg-gradient-to-r ${
                        isHigh ? 'from-red-50 to-rose-50 border-red-300' :
                        isMedium ? 'from-amber-50 to-yellow-50 border-amber-300' :
                        'from-blue-50 to-indigo-50 border-blue-300'
                      } border-2 rounded-2xl p-6 flex items-start gap-4`}
                    >
                      <div className={`w-16 h-16 rounded-xl ${
                        isHigh ? 'bg-red-200' :
                        isMedium ? 'bg-amber-200' :
                        'bg-blue-200'
                      } flex items-center justify-center flex-shrink-0 font-bold text-lg ${
                        isHigh ? 'text-red-900' :
                        isMedium ? 'text-amber-900' :
                        'text-blue-900'
                      }`}>
                        {confidencePercent}%
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                            isHigh ? 'bg-red-200 text-red-900' :
                            isMedium ? 'bg-amber-200 text-amber-900' :
                            'bg-blue-200 text-blue-900'
                          }`}>
                            {isHigh ? 'HIGH PRIORITY' : isMedium ? 'MEDIUM' : 'LOW'}
                          </span>
                          <span className="text-xs font-mono text-neutral-500">{miscId}</span>
                        </div>
                        <p className="font-bold text-base text-neutral-900 mb-1">Area for Growth</p>
                        <p className="text-sm text-neutral-600 leading-relaxed">
                          Your teacher will help you master this concept with fun activities and practice exercises!
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t-2 border-neutral-200">
                <div className="flex items-start gap-3 bg-neutral-50 rounded-xl p-4">
                  <svg className="w-5 h-5 text-[var(--ufs-navy)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    <span className="font-semibold">Learning is a journey!</span> Your teacher will create personalized activities with games,
                    visual aids, and one-on-one support to help you become a math superstar.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Teacher Summary Card */}
          {result.teacher_summary && (
            <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(15,32,75,0.15)] p-10 mb-8 border-l-8 border-[var(--ufs-navy)]">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[var(--ufs-navy)]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">👨‍🏫</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-[var(--ufs-navy)] mb-2">Teacher Report</h2>
                  <p className="text-sm text-neutral-500">Professional analysis for intervention planning</p>
                </div>
              </div>
              <div className="bg-neutral-50 rounded-2xl p-6">
                <p className="text-sm leading-relaxed text-neutral-700 whitespace-pre-wrap">{result.teacher_summary}</p>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-center">
            <button
              onClick={() => window.location.href = '/'}
              className="px-12 py-5 rounded-2xl bg-[var(--ufs-maroon)] text-white hover:brightness-110 transition-all font-bold text-lg shadow-[0_10px_40px_-10px_rgba(167,25,48,0.4)] hover:shadow-[0_15px_50px_-10px_rgba(167,25,48,0.5)]"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================================
  // DIAGNOSTIC QUESTION INTERFACE
  // ========================================================================
  if (diagnosticSession.isActive && diagnosticSession.currentQuestion) {
    const question = diagnosticSession.currentQuestion;
    const progress = diagnosticSession.visitedNodes.length > 0 ? (diagnosticSession.visitedNodes.length / 6) * 100 : 0;

    return (
      <div className="min-h-screen bg-[#F1F3F5]">
        {/* Top Bar with UFS Navy */}
        <div className="bg-[var(--ufs-navy)] border-b-4 border-[var(--ufs-maroon)] sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-bold text-white text-lg">Adaptive Diagnostic Assessment</h2>
                <p className="text-sm text-white/60">AI-powered misconception detection</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-white/80 bg-white/10 px-4 py-2 rounded-lg">
                  Question <span className="font-bold">{diagnosticSession.questionsAnswered + 1}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--edu-green)] transition-all"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <span className="text-sm text-white/80 font-medium">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Card className="p-8 border-2 border-[var(--ufs-navy)]">
            {/* Audio Controls for TTS Question Read-Aloud */}
            <div className="mb-6">
              <AudioControls
                text={question.stem}
                voice="nova"
                autoPlay={false}
                showSettings={true}
                className="mb-6"
              />
            </div>

            <div className="mb-6">
              <div className="inline-block px-3 py-1 rounded-full bg-[var(--edu-green)]/10 text-[var(--edu-green)] text-xs font-bold mb-4">
                ADAPTIVE QUESTION
              </div>
              {question.context && (
                <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                  <p className="text-sm text-neutral-700">{question.context}</p>
                </div>
              )}
              <p className="text-xl leading-relaxed text-[var(--ufs-navy)] font-medium">{question.stem}</p>
            </div>

            {question.visualAidUrl && (
              <div className="mb-6">
                <img src={question.visualAidUrl} alt="Visual aid" className="max-w-full rounded-lg border-2 border-neutral-200" />
              </div>
            )}

            {/* Answer Options */}
            <div className="space-y-3">
              {question.options.map((option, i) => (
                <label
                  key={option.id}
                  className={`flex items-center gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all hover:border-[var(--ufs-maroon)] hover:bg-[var(--ufs-maroon)]/5 group ${
                    selectedAnswer === option.id ? 'border-[var(--ufs-maroon)] bg-[var(--ufs-maroon)]/5' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="diagnostic-question"
                    value={option.id}
                    checked={selectedAnswer === option.id}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    className="w-5 h-5 text-[var(--ufs-maroon)] focus:ring-[var(--ufs-maroon)]"
                  />
                  <span className="flex-1 text-base group-hover:text-[var(--ufs-navy)] font-medium">
                    <span className="font-bold mr-3 text-[var(--ufs-navy)]">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    {option.text}
                  </span>
                </label>
              ))}
            </div>

            {/* Voice Input Section */}
            <div className="mt-6 pt-6 border-t-2 border-neutral-200">
              <div className="text-center mb-4">
                <p className="text-sm text-neutral-600 font-medium mb-2">
                  Or answer using your voice
                </p>
              </div>
              <VoiceInputButton
                questionOptions={question.options.map((opt) => ({
                  option_id: opt.id,  // Use existing ID (A, B, C, D)
                  value: opt.text,
                }))}
                questionStem={question.stem}
                onTranscriptionComplete={handleVoiceTranscription}
                size="lg"
              />
            </div>

            {/* Submit Button */}
            <div className="mt-8 pt-6 border-t-2 border-neutral-200 flex justify-end">
              <Button
                onClick={() => {
                  if (selectedAnswer) {
                    diagnosticSession.submitAnswer(selectedAnswer);
                  }
                }}
                className="bg-[var(--ufs-maroon)] hover:brightness-110 px-8"
                size="lg"
                disabled={diagnosticSession.isLoading || !selectedAnswer}
              >
                {diagnosticSession.isLoading ? 'Analyzing...' : 'Submit Answer'}
              </Button>
            </div>

            {diagnosticSession.error && (
              <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-red-900">Error submitting answer</p>
                <p className="text-sm text-red-700">{diagnosticSession.error.message}</p>
              </div>
            )}
          </Card>

          {/* Progress Indicators */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border-2 border-neutral-200 text-center">
              <p className="text-xs text-neutral-500 mb-1 uppercase font-medium">Questions</p>
              <p className="text-2xl font-bold text-[var(--ufs-navy)]">{diagnosticSession.questionsAnswered + 1}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-neutral-200 text-center">
              <p className="text-xs text-neutral-500 mb-1 uppercase font-medium">Time</p>
              <p className="text-2xl font-bold text-[var(--ufs-navy)]">
                {Math.floor(diagnosticSession.totalTimeSeconds / 60)}:{(diagnosticSession.totalTimeSeconds % 60).toString().padStart(2, '0')}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-neutral-200 text-center">
              <p className="text-xs text-neutral-500 mb-1 uppercase font-medium">Suspected</p>
              <p className="text-2xl font-bold text-[var(--ufs-maroon)]">
                {Object.keys(diagnosticSession.suspectedMisconceptions).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================================
  // DIAGNOSTIC LANDING PAGE
  // ========================================================================
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F3F5] p-4">
      <Card className="max-w-2xl w-full p-8 border-2 border-[var(--ufs-navy)]">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[var(--ufs-navy)] mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div className="inline-block px-4 py-1 rounded-full bg-[var(--edu-green)] text-white text-xs font-bold mb-4">
            AI-POWERED ADAPTIVE ASSESSMENT
          </div>
          <h1 className="text-3xl font-bold mb-3 text-[var(--ufs-navy)]">Diagnostic Assessment</h1>
          <p className="text-neutral-600 leading-relaxed">
            This adaptive assessment will identify mathematical misconceptions and create a personalized learning pathway for you.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-neutral-100 rounded-xl text-center border-2 border-neutral-200">
            <p className="text-xs text-neutral-600 mb-1 font-medium uppercase">Assessment Type</p>
            <p className="text-xl font-bold text-[var(--ufs-navy)]">Adaptive</p>
          </div>
          <div className="p-4 bg-neutral-100 rounded-xl text-center border-2 border-neutral-200">
            <p className="text-xs text-neutral-600 mb-1 font-medium uppercase">Est. Duration</p>
            <p className="text-xl font-bold text-[var(--ufs-navy)]">3-5 min</p>
          </div>
          <div className="p-4 bg-neutral-100 rounded-xl text-center border-2 border-neutral-200">
            <p className="text-xs text-neutral-600 mb-1 font-medium uppercase">Questions</p>
            <p className="text-xl font-bold text-[var(--ufs-navy)]">3-6 items</p>
          </div>
          <div className="p-4 bg-neutral-100 rounded-xl text-center border-2 border-neutral-200">
            <p className="text-xs text-neutral-600 mb-1 font-medium uppercase">Grade Level</p>
            <p className="text-xl font-bold text-[var(--ufs-navy)]">4</p>
          </div>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 mb-6">
          <h3 className="font-bold text-sm mb-3 text-[var(--ufs-navy)]">How It Works</h3>
          <ul className="text-sm text-neutral-700 space-y-2 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-[var(--edu-green)] font-bold">•</span>
              Questions adapt based on your answers
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--edu-green)] font-bold">•</span>
              AI analyzes your thinking patterns in real-time
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--edu-green)] font-bold">•</span>
              Identifies specific misconceptions with high precision
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--edu-green)] font-bold">•</span>
              Your teacher receives detailed intervention recommendations
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--edu-green)] font-bold">•</span>
              Results guide your personalized learning pathway
            </li>
          </ul>
        </div>

        {diagnosticSession.error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4">
            <p className="text-sm font-semibold text-red-900 mb-1">Error Starting Session</p>
            <p className="text-sm text-red-700">{diagnosticSession.error.message}</p>
          </div>
        )}

        <Button
          onClick={() => diagnosticSession.startSession()}
          className="w-full bg-[var(--ufs-maroon)] hover:brightness-110"
          size="lg"
          disabled={diagnosticSession.isLoading}
        >
          {diagnosticSession.isLoading ? 'Starting...' : 'Start Diagnostic Assessment'}
        </Button>
      </Card>
    </div>
  );
}

