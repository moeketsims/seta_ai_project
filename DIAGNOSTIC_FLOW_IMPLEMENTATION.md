# End-to-End Diagnostic Flow Implementation

## Overview

This document outlines the implementation of the complete diagnostic assessment flow that connects the frontend take-assessment page with the AI diagnostic system, enabling adaptive questioning, misconception detection, and personalized intervention recommendations.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  take-assessment/page.tsx                                │   │
│  │  - Assessment landing & instructions                      │   │
│  │  - Question display & navigation                          │   │
│  │  - Results & misconception display                        │   │
│  └────────────────────┬────────────────────────────────────┘   │
│                       │                                          │
│  ┌────────────────────▼───────────────────────────────────┐   │
│  │  hooks/useDiagnosticSession.ts                          │   │
│  │  - Session state management                              │   │
│  │  - Response submission                                   │   │
│  │  - Progress tracking                                     │   │
│  │  - Event logging                                         │   │
│  └────────────────────┬────────────────────────────────────┘   │
│                       │                                          │
│  ┌────────────────────▼───────────────────────────────────┐   │
│  │  lib/diagnostic-api.ts                                   │   │
│  │  - API client methods                                    │   │
│  │  - Type definitions                                      │   │
│  │  - Helper functions                                      │   │
│  └────────────────────┬────────────────────────────────────┘   │
│                       │                                          │
└───────────────────────┼──────────────────────────────────────────┘
                        │ HTTP/REST
┌───────────────────────▼──────────────────────────────────────────┐
│                    Backend (FastAPI)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  api/v1/endpoints/diagnostic_ai.py                       │   │
│  │  - POST /diagnostic-session/start                        │   │
│  │  - POST /diagnostic-session/next                         │   │
│  │  - GET  /diagnostic-result/{session_id}                  │   │
│  │  - POST /dashboard-insights                              │   │
│  └────────────────────┬────────────────────────────────────┘   │
│                       │                                          │
│  ┌────────────────────▼───────────────────────────────────┐   │
│  │  services/diagnostic_router.py                           │   │
│  │  - Session management                                    │   │
│  │  - Decision tree navigation                              │   │
│  │  - Misconception confidence updates                      │   │
│  └────────────────────┬────────────────────────────────────┘   │
│                       │                                          │
│  ┌────────────────────▼───────────────────────────────────┐   │
│  │  services/diagnostic_analyzer.py                         │   │
│  │  - diagnose_learner_error()                              │   │
│  │  - Misconception tagging                                 │   │
│  │  - Reasoning hypothesis                                  │   │
│  │  - Prerequisite gap ranking                              │   │
│  └────────────────────┬────────────────────────────────────┘   │
│                       │                                          │
│  ┌────────────────────▼───────────────────────────────────┐   │
│  │  models/diagnostic_models.py                             │   │
│  │  - DiagnosticSession                                     │   │
│  │  - DiagnosticResult                                      │   │
│  │  - InterventionQueue                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## Implementation Status

### ✅ Completed Components

1. **Backend Infrastructure**
   - ✅ Diagnostic AI endpoints (`diagnostic_ai.py`)
   - ✅ Diagnostic router service (`diagnostic_router.py`)
   - ✅ Diagnostic analyzer service (`diagnostic_analyzer.py`)
   - ✅ Database models (`diagnostic_models.py`)
   - ✅ Misconception detection & confidence scoring
   - ✅ Adaptive decision tree navigation

2. **Frontend Infrastructure**
   - ✅ Diagnostic API client (`lib/diagnostic-api.ts`)
   - ✅ Diagnostic session hook (`hooks/useDiagnosticSession.ts`)
   - ✅ Base take-assessment page (`app/take-assessment/page.tsx`)
   - ✅ AI evaluation integration (existing)
   - ✅ Misconception display (existing)

### 🔄 In Progress / Next Steps

3. **Integration Layer**
   - 🔄 Extend take-assessment to support diagnostic mode
   - ⏳ Session initialization with form generation
   - ⏳ Adaptive question flow
   - ⏳ Result persistence to InterventionQueue

4. **Teacher Dashboard Integration**
   - ⏳ AI Insights Panel extension
   - ⏳ Learner-specific diagnostic modal
   - ⏳ Intervention recommendations display

5. **Enterprise Features**
   - ⏳ Event logging to analytics endpoint
   - ⏳ Background queue for AI calls
   - ⏳ Cost tracking and monitoring

## User Flow

### 1. Session Start

```typescript
// Frontend: User clicks "Start Assessment"
const { startSession } = useDiagnosticSession({
  learnerId: 'learner-001',
  formId: 'form-g4-num-01',
  onComplete: handleDiagnosticComplete,
});

await startSession();

// Backend: POST /diagnostic-session/start
// - Creates DiagnosticSession record
// - Loads form decision tree
// - Returns first (root) question
```

### 2. Adaptive Questioning

```typescript
// Frontend: User answers question
await submitAnswer(selectedOptionId);

// Backend: POST /diagnostic-session/next
// - Calls diagnose_learner_error() for response analysis
// - Updates misconception confidence scores
// - Navigates decision tree based on:
//   • Selected distractor's misconception_tag
//   • Current confidence levels
//   • Max depth constraints
// - Returns next probe OR terminal result
```

### 3. Session Completion

```typescript
// Backend determines terminal condition:
// - High confidence (≥0.9) in diagnosis
// - End of decision tree reached
// - Max depth limit hit

// Creates DiagnosticResult with:
// - Detected misconceptions (ranked by confidence)
// - Evidence trail (response path)
// - Recommended interventions (AI-generated)
// - Prerequisite gaps (from analyzer)

// Persists to InterventionQueue for teacher dashboard
```

### 4. Teacher Dashboard Update

```typescript
// Backend: POST /dashboard-insights
// - Aggregates class-level misconception data
// - Calculates intervention success probabilities
// - Generates teacher report with:
//   • Current mastery status
//   • Flagged misconceptions
//   • Recommended next lessons
//   • Learner-specific pathways

// Frontend: AI Insights Panel
// - Displays urgent alerts
// - Shows quick wins (high-probability interventions)
// - Learner-specific modal with:
//   • Diagnostic session trace
//   • Predicted interventions
//   • Prerequisite skills needed
```

## API Integration Points

### Frontend → Backend

1. **Start Session**
```typescript
POST /api/v1/diagnostic-ai/diagnostic-session/start
Request: { learner_id, form_id }
Response: DiagnosticSessionState with first question
```

2. **Submit Response**
```typescript
POST /api/v1/diagnostic-ai/diagnostic-session/next
Request: { session_id, response, time_spent_seconds }
Response: NextNodeResponse (next question OR final result)
```

3. **Get Result**
```typescript
GET /api/v1/diagnostic-ai/diagnostic-result/{session_id}
Response: DiagnosticResult with full analysis
```

4. **Dashboard Insights**
```typescript
POST /api/v1/diagnostic-ai/dashboard-insights
Request: { teacher_id, class_id, time_window }
Response: Aggregated insights + intervention recommendations
```

## Key Services & Methods

### Backend: DiagnosticRouter

```python
class DiagnosticRouter:
    def start_session(learner_id: str, form_id: str) -> SessionState:
        """Initialize session and return root item"""

    def next_node(session_id: str, response: str) -> NextNodeResponse:
        """Process response, update confidences, return next node"""

    def navigate_tree(current_node, response, confidences) -> str:
        """Decision tree navigation logic"""

    def is_terminal(confidences, depth, tree) -> bool:
        """Determine if session should end"""
```

### Backend: DiagnosticAnalyzer

```python
class DiagnosticAnalyzer:
    def diagnose_learner_error(
        question_content: str,
        learner_answer: str,
        correct_answer: str,
        skill_code: str
    ) -> ErrorDiagnosis:
        """
        Single-item analysis:
        - Tags misconceptions
        - Hypothesizes reasoning
        - Ranks prerequisite gaps
        - Suggests follow-up questions
        """
```

### Frontend: useDiagnosticSession Hook

```typescript
const {
  sessionId,            // Current session ID
  isActive,             // Session is running
  currentQuestion,      // Formatted question to display
  submitAnswer,         // Submit response function
  result,               // Final diagnostic result
  isComplete,           // Session finished
  suspectedMisconceptions, // Live confidence scores
} = useDiagnosticSession({
  learnerId: 'learner-001',
  formId: 'form-g4-num-01',
  onComplete: handleComplete,
});
```

## Event Logging

All diagnostic events are logged for analytics and debugging:

```typescript
{
  event_type: 'session_start' | 'item_view' | 'response_submit' | 'session_complete',
  session_id: string,
  timestamp: ISO8601,
  data: {
    // Event-specific metadata
    api_latency_ms?: number,
    misconception_detected?: string,
    confidence_score?: number,
  }
}
```

## Cost Modeling

Based on AI_DIAGNOSTIC_SYSTEM.md documentation:

- **Per Diagnostic Session**: < $0.01 USD
- **AI Calls**:
  - Form generation: $0.003 (one-time)
  - Per-response analysis: $0.0005 × avg 3-5 responses
  - Dashboard insights: $0.002 (batch processing)

**Enterprise Scalability**: Sub-cent cost per diagnostic makes the system economically viable for large-scale deployment.

## Database Schema

### Core Tables

```sql
-- Session tracking
CREATE TABLE diagnostic_sessions (
  session_id UUID PRIMARY KEY,
  learner_id VARCHAR NOT NULL,
  form_id VARCHAR NOT NULL,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  current_node_id VARCHAR,
  visited_nodes JSONB,
  suspected_misconceptions JSONB
);

-- Results & interventions
CREATE TABLE diagnostic_results (
  result_id UUID PRIMARY KEY,
  session_id UUID REFERENCES diagnostic_sessions,
  detected_misconceptions JSONB,
  recommended_interventions JSONB,
  prerequisite_gaps JSONB,
  mastery_level VARCHAR
);

-- Teacher queue
CREATE TABLE intervention_queue (
  queue_id UUID PRIMARY KEY,
  learner_id VARCHAR NOT NULL,
  misconception_tag VARCHAR NOT NULL,
  confidence FLOAT,
  priority VARCHAR,
  success_probability FLOAT,
  created_at TIMESTAMP
);
```

## Testing Strategy

### Unit Tests
- [ ] API client methods (diagnostic-api.ts)
- [ ] Session hook logic (useDiagnosticSession.ts)
- [ ] Backend router navigation
- [ ] Analyzer misconception detection

### Integration Tests
- [ ] Complete diagnostic flow (start → questions → result)
- [ ] Dashboard insights generation
- [ ] InterventionQueue persistence

### E2E Tests (Playwright)
- [ ] Learner takes diagnostic assessment
- [ ] Teacher views results in dashboard
- [ ] Intervention recommendations displayed

## Next Implementation Steps

1. **Immediate (Phase 1)**
   - [ ] Update take-assessment page to support diagnostic mode toggle
   - [ ] Integrate useDiagnosticSession hook
   - [ ] Test adaptive flow with backend endpoints

2. **Short-term (Phase 2)**
   - [ ] Create DiagnosticResultModal component
   - [ ] Extend AI Insights Panel with learner-specific view
   - [ ] Implement InterventionQueue display

3. **Medium-term (Phase 3)**
   - [ ] Add event logging to analytics endpoint
   - [ ] Implement background worker for AI calls
   - [ ] Cost tracking dashboard

4. **Long-term (Phase 4)**
   - [ ] A/B testing for intervention effectiveness
   - [ ] Predictive analytics for learner pathways
   - [ ] Multi-session progress tracking

## Performance Considerations

- **API Response Times**: Target < 500ms for next_node calls
- **Caching**: Decision trees cached in memory
- **Concurrency**: Queue AI calls through background worker for load spikes
- **Database**: Index on (learner_id, created_at) for fast queries

## Security & Privacy

- **POPIA Compliance**: All learner data anonymized in logs
- **Consent**: Diagnostic results require parent/guardian consent
- **Data Retention**: Configurable retention period (default 2 years)
- **Audit Trail**: All data access logged with teacher_id + timestamp

## References

- **Backend Docs**: `backend/app/api/v1/endpoints/diagnostic_ai.py`
- **Services**: `backend/app/services/diagnostic_router.py`, `diagnostic_analyzer.py`
- **Frontend**: `frontend/src/lib/diagnostic-api.ts`, `frontend/src/hooks/useDiagnosticSession.ts`
- **Design**: `AI_DIAGNOSTIC_SYSTEM.md`, `AI_INTEGRATION_COMPLETE.md`

---

**Status**: Foundation complete, ready for integration testing
**Last Updated**: 2025-10-28
**Implementation Owner**: AI Mathematics Teacher Assistant Team
