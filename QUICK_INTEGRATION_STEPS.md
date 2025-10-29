# Quick Integration: Add Diagnostic Mode to Your Assessment Page

## What You'll Add

A toggle on the assessment landing page that lets learners choose between:
- **Standard Assessment**: Your current 10-question quiz (what you have now)
- **AI Diagnostic**: Adaptive 5-10 question assessment with misconception detection (NEW)

## Step-by-Step Integration

### Step 1: Import the New Components

Add these imports at the top of `/frontend/src/app/take-assessment/page.tsx`:

```typescript
// Add these new imports
import { DiagnosticModeToggle, type AssessmentMode } from '../../components/assessment/DiagnosticModeToggle';
import { useDiagnosticSession } from '../../hooks/useDiagnosticSession';
```

### Step 2: Add State for Assessment Mode

Add this state variable near the top of your component (around line 13):

```typescript
// Add this NEW state
const [assessmentMode, setAssessmentMode] = useState<AssessmentMode>('standard');

// Initialize diagnostic session (only used when mode is 'diagnostic')
const diagnosticSession = assessmentMode === 'diagnostic'
  ? useDiagnosticSession({
      learnerId: 'test-learner-001', // TODO: Replace with actual learner ID from auth
      formId: 'diagnostic-form-g4',  // TODO: Replace with selected form ID
      autoStart: false,
      onComplete: (result) => {
        console.log('✅ Diagnostic complete:', result);
        setAssessmentSubmitted(true);
      },
      onError: (error) => {
        console.error('❌ Diagnostic error:', error);
        setEvaluationError(error.message);
      },
    })
  : null;
```

### Step 3: Add Mode Toggle to Landing Page

In the landing page section (around line 150), add the toggle BEFORE the "Before You Begin" card:

```typescript
// Inside the landing page return statement, add this BEFORE the existing Card:

{/* NEW: Assessment Mode Toggle */}
<div className="mb-6 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
  <DiagnosticModeToggle
    mode={assessmentMode}
    onModeChange={setAssessmentMode}
  />
</div>

{/* Your existing "Before You Begin" Card continues here */}
<Card className="lg:col-span-8 p-8 border-t-4 border-t-[var(--ufs-education)]">
  {/* ... existing content ... */}
</Card>
```

### Step 4: Update Start Button Handler

Modify the start button onClick handler (around line 242):

```typescript
// REPLACE the existing onClick with this:
<Button
  onClick={async () => {
    if (assessmentMode === 'diagnostic' && diagnosticSession) {
      // Start diagnostic mode
      try {
        await diagnosticSession.startSession();
        setAssessmentStarted(true);
      } catch (error) {
        console.error('Failed to start diagnostic:', error);
        setEvaluationError('Failed to start diagnostic assessment. Please try again.');
      }
    } else {
      // Standard assessment (existing behavior)
      setAssessmentStarted(true);
    }
  }}
  className="w-full sm:w-auto px-12 h-14 text-base font-bold bg-gradient-to-r from-[var(--ufs-maroon)] to-[#8B1538] hover:from-[#8B1538] hover:to-[var(--ufs-maroon)] shadow-lg hover:shadow-xl transition-all"
  size="lg"
>
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
  Start {assessmentMode === 'diagnostic' ? 'AI Diagnostic' : 'Assessment'}
</Button>
```

### Step 5: Add Diagnostic Question Display

In the main assessment interface (around line 667), add conditional rendering for diagnostic mode:

```typescript
// AFTER line 667, ADD this check at the top of the main interface:

if (assessmentMode === 'diagnostic' && diagnosticSession) {
  // DIAGNOSTIC MODE - Show adaptive questions
  const { currentQuestion, isLoading, submitAnswer, error: diagError } = diagnosticSession;

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading diagnostic question...</p>
        </Card>
      </div>
    );
  }

  // Render diagnostic question
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">AI Diagnostic Assessment</h2>
            <div className="flex items-center gap-3">
              <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                Adaptive Mode
              </Badge>
              <div className="text-lg font-bold text-neutral-700">
                ⏱️ {formatTime(timeRemaining)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-neutral-600">
              Question {diagnosticSession.questionsAnswered + 1}
            </span>
            <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all"
                style={{ width: `${Math.min(100, (diagnosticSession.questionsAnswered / 10) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question */}
          <div className="lg:col-span-3">
            <Card className="p-8">
              <div className="mb-6">
                <span className="text-sm font-medium text-neutral-600">
                  Adaptive Question
                </span>
              </div>

              <p className="text-lg mb-6">{currentQuestion.stem}</p>

              {/* Context */}
              {currentQuestion.context && (
                <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                  <p className="text-sm text-blue-900">{currentQuestion.context}</p>
                </div>
              )}

              {/* Visual Aid */}
              {currentQuestion.visualAidUrl && (
                <div className="mb-6">
                  <img
                    src={currentQuestion.visualAidUrl}
                    alt="Question visual aid"
                    className="max-w-full rounded-lg border-2 border-neutral-200"
                  />
                </div>
              )}

              {/* Answer Options */}
              <div className="space-y-3 mb-6">
                {currentQuestion.options.map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-purple-500 ${
                      answers[0] === option.id
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-neutral-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="diagnostic-answer"
                      value={option.id}
                      checked={answers[0] === option.id}
                      onChange={(e) => handleAnswer(0, e.target.value)}
                      className="w-5 h-5"
                    />
                    <span className="flex-1">{option.text}</span>
                  </label>
                ))}
              </div>

              {/* Submit Button */}
              <Button
                onClick={async () => {
                  if (answers[0]) {
                    try {
                      await submitAnswer(answers[0]);
                      setAnswers({}); // Clear for next question
                    } catch (err) {
                      console.error('Failed to submit:', err);
                    }
                  }
                }}
                disabled={isLoading || !answers[0]}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
              >
                {isLoading ? 'Analyzing...' : 'Submit Answer'}
              </Button>

              {diagError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                  {diagError.message}
                </div>
              )}
            </Card>
          </div>

          {/* Progress Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-24">
              <h3 className="font-semibold text-sm mb-3">Diagnostic Progress</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-neutral-600 mb-1">Questions Answered</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {diagnosticSession.questionsAnswered}
                  </p>
                </div>

                {Object.keys(diagnosticSession.suspectedMisconceptions).length > 0 && (
                  <div className="pt-4 border-t border-neutral-200">
                    <p className="text-xs text-neutral-600 mb-2">Detected Patterns</p>
                    <div className="space-y-2">
                      {Object.entries(diagnosticSession.suspectedMisconceptions)
                        .slice(0, 3)
                        .map(([tag, confidence]) => (
                          <div key={tag} className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                                style={{ width: `${confidence * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-neutral-700">
                              {Math.round(confidence * 100)}%
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// AFTER diagnostic mode check, your EXISTING standard assessment code continues:
const question = assessment.questions[currentQuestion];
// ... rest of your existing code ...
```

### Step 6: Update Results Display

In the results section (around line 300), check if it's diagnostic mode:

```typescript
// At the start of the results section, add this check:
if (assessmentMode === 'diagnostic' && diagnosticSession?.result) {
  const { result } = diagnosticSession;

  // Show diagnostic-specific results
  return (
    <div className="min-h-screen bg-neutral-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 text-center mb-6">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 mb-4">
            <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold mb-2">AI Diagnostic Complete!</h1>
          <p className="text-neutral-600 mb-6">
            Your personalized learning assessment is ready
          </p>

          {/* Display diagnostic results */}
          {/* ... (code from Step 6 in INTEGRATION_GUIDE.md) ... */}
        </Card>
      </div>
    </div>
  );
}

// Your existing standard results display continues below
```

## Testing Your Changes

### 1. Start Both Servers (Already Running ✅)
- Frontend: http://localhost:3001
- Backend: http://localhost:8000

### 2. Test the Flow

1. **Navigate** to http://localhost:3001/take-assessment
2. **See the new toggle** - Choose between Standard and AI Diagnostic
3. **Select "AI Diagnostic"** - See the recommended badge
4. **Click "Start AI Diagnostic"**
5. **Answer questions** - They should adapt based on your responses
6. **View results** - See detected misconceptions and recommendations

### 3. Check Browser Console

You should see:
```
✅ [Diagnostic Event] session_start_attempt
✅ [Diagnostic Event] session_started
✅ [Diagnostic Event] response_submit
✅ [Diagnostic Event] next_question
✅ [Diagnostic Event] session_complete
```

## What Your Users Will Experience

### Standard Mode (Existing):
- ✅ All 10 questions shown
- ✅ Fixed question order
- ✅ ~30 minutes duration
- ✅ Traditional assessment

### Diagnostic Mode (NEW):
- 🎯 3-8 adaptive questions
- 🧠 AI analyzes each response
- ⚡ 5-10 minute duration
- 📊 Personalized misconception report
- 🎓 Targeted learning recommendations

## Visual Preview

Your landing page will show:

```
┌─────────────────────────────────────────────────────┐
│  📊 Assessment Mode                                  │
│  Choose how you want to be assessed                 │
│                                                      │
│  ┌──────────────────┐  ┌──────────────────────────┐│
│  │ Standard         │  │ AI Diagnostic      ★     ││
│  │ Assessment       │  │ Recommended              ││
│  │                  │  │                          ││
│  │ Complete all 10  │  │ Adaptive questions       ││
│  │ questions        │  │ that adjust based on     ││
│  │                  │  │ your responses           ││
│  │ ~30 minutes      │  │ ⚡ Adaptive  ⏱ 5-10 min  ││
│  └──────────────────┘  └──────────────────────────┘│
└─────────────────────────────────────────────────────┘

How AI Diagnostic Works:
• Questions adapt based on your answers
• AI detects specific mathematical misconceptions
• Shorter and more efficient than standard tests
• Provides targeted learning recommendations
```

## Troubleshooting

### Issue: "Cannot find module DiagnosticModeToggle"
**Solution**: Make sure the file `/frontend/src/components/assessment/DiagnosticModeToggle.tsx` was created

### Issue: "diagnosticSession is null"
**Solution**: Check that you're initializing it conditionally:
```typescript
const diagnosticSession = assessmentMode === 'diagnostic' ? useDiagnosticSession(...) : null;
```

### Issue: Backend connection fails
**Solution**: Ensure backend is running and check the URL in `diagnostic-api.ts`:
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
```

## Next Steps After Integration

1. **Test with real learners** - Get feedback on the adaptive flow
2. **Add form selection** - Let teachers choose which diagnostic form to use
3. **Teacher dashboard** - Display diagnostic results in analytics
4. **Intervention queue** - Show recommended actions for teachers

---

**Status**: Ready to integrate! 🚀
**Time estimate**: 30-45 minutes
**Difficulty**: Medium (mostly copy-paste with minor adjustments)
