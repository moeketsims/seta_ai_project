# Diagnostic Flow Integration Guide

## Quick Start: Adding Diagnostic Mode to Take Assessment

This guide shows how to integrate the diagnostic flow into the existing take-assessment page.

## Status: Ready for Integration ✅

- ✅ Backend running on http://127.0.0.1:8000
- ✅ Frontend running on http://localhost:3001
- ✅ Diagnostic API endpoints available
- ✅ `useDiagnosticSession` hook created
- ✅ All type definitions in place

## Integration Steps

### Step 1: Add Diagnostic Mode Toggle

Add a mode selector to the assessment landing page:

```typescript
// In take-assessment/page.tsx, add state for assessment mode
const [assessmentMode, setAssessmentMode] = useState<'standard' | 'diagnostic'>('standard');
```

### Step 2: Conditional Hook Usage

Use the diagnostic hook when in diagnostic mode:

```typescript
// Import the hook
import { useDiagnosticSession } from '@/hooks/useDiagnosticSession';

// Conditionally initialize based on mode
const diagnosticSession = assessmentMode === 'diagnostic'
  ? useDiagnosticSession({
      learnerId: 'learner-001', // Replace with actual learner ID
      formId: 'diagnostic-form-g4', // Replace with form selection
      autoStart: false,
      onComplete: (result) => {
        console.log('Diagnostic complete:', result);
        // Handle completion - show results, save to DB, etc.
      },
      onError: (error) => {
        console.error('Diagnostic error:', error);
      },
    })
  : null;
```

### Step 3: Update Start Button Handler

Modify the start assessment handler:

```typescript
const handleStartAssessment = async () => {
  if (assessmentMode === 'diagnostic' && diagnosticSession) {
    // Start diagnostic session
    await diagnosticSession.startSession();
    setAssessmentStarted(true);
  } else {
    // Standard assessment flow (existing)
    setAssessmentStarted(true);
  }
};
```

### Step 4: Update Question Display

Replace static questions with dynamic diagnostic questions:

```typescript
// In the main assessment interface
if (assessmentMode === 'diagnostic' && diagnosticSession) {
  const { currentQuestion, isLoading, submitAnswer } = diagnosticSession;

  if (!currentQuestion) {
    return <div>Loading question...</div>;
  }

  // Display current diagnostic question
  return (
    <Card className="p-8">
      <p className="text-lg mb-6">{currentQuestion.stem}</p>

      {currentQuestion.context && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm">{currentQuestion.context}</p>
        </div>
      )}

      {/* Render options */}
      <div className="space-y-3">
        {currentQuestion.options.map((option) => (
          <label
            key={option.id}
            className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-primary"
          >
            <input
              type="radio"
              name="diagnostic-answer"
              value={option.id}
              onChange={() => handleDiagnosticAnswer(option.id)}
              className="w-5 h-5"
            />
            <span className="flex-1">{option.text}</span>
          </label>
        ))}
      </div>

      {/* Submit button */}
      <Button
        onClick={() => submitAnswer(selectedOptionId)}
        disabled={isLoading || !selectedOptionId}
        className="mt-6"
      >
        {isLoading ? 'Analyzing...' : 'Submit Answer'}
      </Button>
    </Card>
  );
}
```

### Step 5: Display Progress & Misconceptions

Show live misconception detection:

```typescript
{diagnosticSession && !diagnosticSession.isComplete && (
  <Card className="p-4">
    <h3 className="font-semibold text-sm mb-3">Progress</h3>

    {/* Questions answered */}
    <div className="mb-4">
      <p className="text-xs text-neutral-600">Questions Answered</p>
      <p className="text-2xl font-bold text-primary">
        {diagnosticSession.questionsAnswered}
      </p>
    </div>

    {/* Suspected misconceptions */}
    {Object.keys(diagnosticSession.suspectedMisconceptions).length > 0 && (
      <div>
        <p className="text-xs text-neutral-600 mb-2">Suspected Patterns</p>
        {Object.entries(diagnosticSession.suspectedMisconceptions).map(([tag, confidence]) => (
          <div key={tag} className="flex items-center justify-between text-xs mb-1">
            <span className="truncate">{tag}</span>
            <span className="font-semibold">{Math.round(confidence * 100)}%</span>
          </div>
        ))}
      </div>
    )}
  </Card>
)}
```

### Step 6: Display Final Results

Handle completion and show diagnostic results:

```typescript
if (diagnosticSession?.isComplete && diagnosticSession.result) {
  const { result } = diagnosticSession;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="p-8 text-center mb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-4">
          <svg className="w-10 h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold mb-2">Diagnostic Complete!</h1>
        <p className="text-neutral-600 mb-6">
          AI analysis has identified your learning patterns
        </p>

        {/* Severity indicator */}
        <div className="inline-block px-4 py-2 rounded-full bg-amber-100 text-amber-800 font-semibold mb-6">
          Severity: {result.severity}
        </div>

        {/* Primary misconception */}
        {result.primary_misconception && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-bold text-lg text-amber-900 mb-2">
              Primary Learning Gap Detected
            </h3>
            <p className="text-sm text-amber-800 mb-4">
              {result.primary_misconception}
            </p>
            <p className="text-xs text-amber-700">
              Confidence: {Math.round(result.confidence_score * 100)}%
            </p>
          </div>
        )}

        {/* Recommended interventions */}
        {result.recommended_interventions.length > 0 && (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 text-left">
            <h3 className="font-bold text-lg text-blue-900 mb-3">
              Recommended Next Steps
            </h3>
            <ul className="space-y-2">
              {result.recommended_interventions.map((intervention, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">→</span>
                  <span className="text-sm text-blue-800">{intervention}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Teacher summary */}
        {result.teacher_summary && (
          <div className="mt-6 p-4 bg-neutral-50 rounded-lg text-left">
            <p className="text-xs font-semibold text-neutral-600 mb-2">
              Teacher Note
            </p>
            <p className="text-sm text-neutral-700">
              {result.teacher_summary}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
```

## Testing the Integration

### 1. Test Backend Endpoints

```bash
# Check backend health
curl http://localhost:8000/api/v1/ai/health

# Start a test session (replace with actual form_id)
curl -X POST http://localhost:8000/api/v1/diagnostic-ai/diagnostic-session/start \
  -H "Content-Type: application/json" \
  -d '{"learner_id": "test-learner-001", "form_id": "test-form-001"}'
```

### 2. Test Frontend Integration

1. Navigate to http://localhost:3001/take-assessment
2. Toggle to "Diagnostic Mode"
3. Click "Start Assessment"
4. Answer questions - observe adaptive flow
5. View final diagnostic result

### 3. Check Browser Console

The `useDiagnosticSession` hook logs all events in development:

```
[Diagnostic Event] session_start_attempt
[Diagnostic Event] session_started
[Diagnostic Event] response_submit
[Diagnostic Event] next_question
[Diagnostic Event] session_complete
```

## Key Features to Highlight

### 🎯 Adaptive Questioning
- Questions adapt based on learner responses
- Probes target suspected misconceptions
- Efficient: stops when confident in diagnosis

### 🧠 AI-Powered Analysis
- Real-time misconception detection
- Confidence scoring for each pattern
- Evidence-based recommendations

### 📊 Teacher Insights
- Detailed diagnostic reports
- Intervention recommendations with success probabilities
- Prerequisite gap identification

### 💰 Cost-Effective
- < $0.01 per diagnostic session
- Scalable for large deployments
- Background queue prevents load spikes

## Troubleshooting

### Backend Not Starting
```bash
cd backend
source venv/bin/activate
pip install "pydantic[email]"
python -m uvicorn app.main:app --reload --port 8000
```

### Frontend Build Errors
```bash
cd frontend
npm install
npm run dev
```

### CORS Issues
If you encounter CORS errors, the backend already has CORS middleware configured in `app/main.py`.

### Session Not Starting
Check that:
1. Backend is running on port 8000
2. `NEXT_PUBLIC_API_URL` is set correctly
3. Form ID exists in database (or use generated form)

## Next Steps

1. **Generate Test Form**
   ```typescript
   // Use the generateDiagnosticForm function
   import { generateDiagnosticForm } from '@/lib/diagnostic-api';

   const form = await generateDiagnosticForm({
     grade: 4,
     difficulty: 'medium',
     num_items: 5,
   });
   ```

2. **Integrate with User Authentication**
   - Replace hardcoded learner IDs with session data
   - Add permission checks for accessing diagnostics

3. **Add to Teacher Dashboard**
   - Create learner diagnostic history view
   - Show intervention queue
   - Display class-level insights

4. **Enable Analytics**
   - Send events to analytics endpoint
   - Track API latency
   - Monitor AI costs

## Resources

- **API Documentation**: http://localhost:8000/docs
- **Type Definitions**: `/frontend/src/lib/diagnostic-api.ts`
- **Hook Implementation**: `/frontend/src/hooks/useDiagnosticSession.ts`
- **Full Architecture**: `/DIAGNOSTIC_FLOW_IMPLEMENTATION.md`

---

**Status**: Ready for integration testing ✅
**Both servers running**: Frontend (3001) | Backend (8000)
**Next Action**: Add diagnostic mode toggle to take-assessment page
