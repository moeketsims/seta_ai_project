# Frontend-Backend Integration Test Guide

**Date:** October 28, 2025  
**Status:** ✅ **WIRED & READY TO TEST**

---

## 🔌 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                      │
│                                                             │
│  take-assessment/page.tsx                                  │
│    ├─ DiagnosticModeToggle (user switches to "AI Diagnostic")
│    └─ useDiagnosticSession hook                            │
│         ├─ startDiagnosticSession()                        │
│         ├─ nextDiagnosticNode()                            │
│         └─ getDiagnosticResult()                           │
│                        │                                    │
│                        │ HTTP Calls                         │
│                        │                                    │
│           ┌────────────▼────────────┐                      │
│           │  API Client Lib         │                      │
│           │ (diagnostic-api.ts)     │                      │
│           └────────────┬────────────┘                      │
└─────────────────────────────────────────────────────────────┘
                         │
              API Base URL: http://localhost:8000/api/v1
                         │
┌─────────────────────────────────────────────────────────────┐
│                   Backend (FastAPI)                         │
│                                                             │
│  POST /diagnostic-ai/generate-diagnostic-form              │
│    ├─ DiagnosticGenerator                                  │
│    └─ OpenAI API (gpt-4o-mini)                             │
│                                                             │
│  POST /diagnostic-ai/diagnostic-session/start              │
│    ├─ DiagnosticRouter.start_session()                     │
│    └─ Returns: current_node (first question)               │
│                                                             │
│  POST /diagnostic-ai/diagnostic-session/next               │
│    ├─ Process learner response                             │
│    ├─ Route through decision tree                          │
│    ├─ Update misconception confidence                      │
│    └─ Return: next_node OR final result                    │
│                                                             │
│  GET /diagnostic-ai/diagnostic-result/{session_id}         │
│    └─ Return: final diagnostic findings & recommendations  │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ What's Wired

### Frontend Components

| Component | Location | Status |
|-----------|----------|--------|
| DiagnosticModeToggle | `components/assessment/DiagnosticModeToggle.tsx` | ✅ Implemented |
| useDiagnosticSession | `hooks/useDiagnosticSession.ts` | ✅ Implemented |
| TakeAssessmentPage | `app/take-assessment/page.tsx` | ✅ Wired |
| API Client | `lib/diagnostic-api.ts` | ✅ Implemented |

### Backend Endpoints

| Endpoint | Method | Status | Response Includes |
|----------|--------|--------|-------------------|
| `/generate-diagnostic-form` | POST | ✅ Fixed | Form with probes & decision tree |
| `/diagnostic-session/start` | POST | ✅ Fixed | `current_node` (**NEW**) |
| `/diagnostic-session/next` | POST | ✅ Fixed | Next node with `estimated_time_seconds` |
| `/diagnostic-result/{session_id}` | GET | ✅ Ready | Findings & recommendations |

---

## 🚀 Full Integration Test (30 minutes)

### Phase 1: Setup (5 min)

#### Backend Setup
```bash
cd /Users/mosiams/Desktop/ETDP_SETA_Repo/backend

# Add OpenAI key
echo "OPENAI_API_KEY=sk-YOUR_KEY" > .env

# Install deps
pip install -r requirements.txt

# Start backend
python -m uvicorn app.main:app --reload
# Expected: ✅ Startup validation passed
```

#### Frontend Setup
```bash
cd /Users/mosiams/Desktop/ETDP_SETA_Repo/frontend

# Install deps (if needed)
npm install

# Start frontend
npm run dev
# Expected: ▲ Next.js running on http://localhost:3000
```

---

### Phase 2: Verify Backend Health (2 min)

```bash
# Check backend is running
curl http://localhost:8000/health
# Expected: {"status":"healthy"}

# Check API docs
open http://localhost:8000/docs
# Should see all diagnostic-ai endpoints
```

---

### Phase 3: Navigate Frontend & Enable Diagnostic Mode (5 min)

1. **Open Frontend**
   ```bash
   open http://localhost:3000
   ```

2. **Navigate to Take Assessment**
   - Click "Take Assessment" in navigation
   - You should see the test assessment

3. **Start Assessment**
   - Click "Start Assessment" button
   - Assessment should initialize

4. **Toggle to Diagnostic Mode**
   - Look for "Assessment Mode" card at top
   - You'll see two options:
     - ✅ Standard Assessment (default)
     - 🤖 AI Diagnostic (recommended)
   - **Click "AI Diagnostic" button**

---

### Phase 4: Verify Frontend Calls Backend (10 min)

#### Step A: Watch Console Logs
```bash
# Terminal 3: Watch frontend console
# Open DevTools (F12) → Console tab
# You should see:

[Diagnostic Event] session_start_attempt {
  sessionId: null,
  timestamp: "2025-10-28T...",
  learnerId: "test-learner-001",
  formId: "diagnostic-form-g4-week12"
}
```

#### Step B: Watch Backend Logs
```bash
# Terminal 1 (backend) should show:
# POST /api/v1/diagnostic-ai/diagnostic-session/start - 201 Created
# Response includes: current_node with stem, options, etc.
```

#### Step C: Check Network Requests
```bash
# DevTools → Network tab
# Filter: XHR

Look for these requests:
✅ POST /api/v1/diagnostic-ai/diagnostic-session/start
   - Status: 201 Created
   - Response: {session_id, current_node, ...}

✅ Request Headers: Content-Type: application/json

✅ Response Body should have:
   {
     "session_id": "SESSION-...",
     "current_node": {
       "stem": "Question text here...",
       "distractors": [
         {"option_id": "A", "value": "..."},
         {"option_id": "B", "value": "..."}
       ],
       "estimated_time_seconds": 60  // ✅ NEW FIELD
     }
   }
```

#### Step D: First Question Appears
✅ Frontend should display the first question from backend
- Stem visible
- Answer options clickable
- Timer running

---

### Phase 5: Submit Answer & Navigate (8 min)

1. **Select an Answer**
   - Click one of the answer options
   - Button should highlight

2. **Check Network Request**
   - DevTools → Network tab
   - Look for `POST /diagnostic-session/next`
   - Request body should include:
     ```json
     {
       "session_id": "SESSION-...",
       "response": "B",
       "time_spent_seconds": 45
     }
     ```

3. **Backend Processing**
   - Backend logs should show:
     ```
     POST /api/v1/diagnostic-ai/diagnostic-session/next - 200 OK
     ```

4. **Next Question or Result**
   - If not terminal: New question appears
     - Should have different stem
     - Should be a probe (follow-up)
   - If terminal: Result screen appears
     - Shows misconception findings
     - Shows teacher summary
     - Shows learner feedback

5. **Verify Response Data**
   - DevTools → Network tab → Response tab
   ```json
   {
     "terminal": false,
     "next_node": {
       "probe_id": "PROBE-...",
       "stem": "Follow-up question...",
       "estimated_time_seconds": 45,  // ✅ NEW
       "distractors": [...]
     },
     "progress": {
       "nodes_visited": 1,
       "completion": 0.33
     }
   }
   ```

---

### Phase 6: Complete Full Diagnostic (Until Terminal)

1. **Continue answering** questions
   - Answer 2-3 probes
   - Each time observe:
     - Question changes
     - Progress bar updates
     - No errors in console

2. **Reach Terminal**
   - After max questions or high-confidence diagnosis
   - Result screen appears showing:
     - ✅ Primary misconception
     - ✅ All misconceptions with confidence scores
     - ✅ Severity level
     - ✅ Teacher summary
     - ✅ Learner feedback
     - ✅ Recommended interventions

3. **Final Network Request**
   - Look for: `GET /api/v1/diagnostic-ai/diagnostic-result/{session_id}`
   - Status: 200 OK
   - Response has complete diagnostic result

---

## ✅ Success Validation Checklist

### Backend Validation
- [ ] Backend starts with "✅ Startup validation passed"
- [ ] Health check returns `{"status":"healthy"}`
- [ ] POST /generate-diagnostic-form returns form (with probes having `estimated_time_seconds`)
- [ ] POST /diagnostic-session/start returns session with `current_node` populated
- [ ] POST /diagnostic-session/next processes answer and returns next node
- [ ] GET /diagnostic-result returns complete findings

### Frontend Validation  
- [ ] Frontend starts without errors
- [ ] Assessment page loads
- [ ] DiagnosticModeToggle visible
- [ ] Can toggle to "AI Diagnostic" mode
- [ ] First question displays immediately after toggle
- [ ] Question has:
  - [ ] Stem/text
  - [ ] Answer options
  - [ ] Time estimate
- [ ] Can click answer options
- [ ] Answer submission triggers next question
- [ ] Questions change (new probes generated)
- [ ] Final result displays correctly

### Network Validation
- [ ] No CORS errors in console
- [ ] All API calls succeed (200/201 status)
- [ ] Request/Response JSON properly formatted
- [ ] New field `estimated_time_seconds` present on probes
- [ ] No network timeouts (< 5 seconds per request)

### Integration Validation
- [ ] Data flows from backend → frontend correctly
- [ ] Frontend correctly displays backend data
- [ ] Session state persists across requests
- [ ] Misconception tracking accurate
- [ ] Time tracking works
- [ ] Progress bar updates

---

## 🐛 Common Issues & Fixes

### Issue: CORS Error in Console

**Error:** `Access to XMLHttpRequest at 'http://localhost:8000/api/...' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Solution:**
1. Backend has CORS enabled (should work)
2. If still fails, check backend CORS config:
   ```python
   # backend/app/main.py line ~20
   CORS_ORIGINS = "http://localhost:3000,..."
   ```
3. Restart backend if you added new origins

---

### Issue: 404 Not Found on `/diagnostic-session/start`

**Error:** `404 Not Found: {detail: "Not Found"}`

**Solution:**
1. Backend might not have loaded the diagnostic router
2. Check backend includes the router:
   ```bash
   curl http://localhost:8000/docs | grep diagnostic-ai
   ```
3. If missing, restart backend
4. Verify endpoint path: Should be `/api/v1/diagnostic-ai/diagnostic-session/start`

---

### Issue: "Form not found" Error

**Error:** `Error: Form diagnostic-form-g4-week12 not found`

**Solution:**
This is normal! The router auto-creates a mock form if not found. If you want real forms:
1. Generate a form first:
   ```bash
   curl -X POST http://localhost:8000/api/v1/diagnostic-ai/generate-diagnostic-form \
     -H "Content-Type: application/json" \
     -d '{
       "caps_objective_id": "CAPS-G4-NR-1",
       "grade_level": 4,
       "content_area": "Numbers.Operations.Addition",
       "max_items": 2,
       "max_time_minutes": 5
     }'
   ```
2. Copy the `form_id` from response
3. Update frontend code in `take-assessment/page.tsx` line 36:
   ```typescript
   formId: 'FORM-CAPS-G4-NR-1-...'  // Use real form ID
   ```
4. Refresh page

---

### Issue: "Field required" in Backend Logs

**Error:** `ValidationError: field required`

**Solution:**
This means the LLM response is missing fields. Check:
1. OpenAI API key is valid
2. Model is `gpt-4o-mini` (or later)
3. Check backend logs for LLM response format
4. May be transient - try again

---

### Issue: Questions Always the Same

**Error:** Same question appears every time

**Solution:**
1. This is actually the mock form (auto-created)
2. Generate a real form to get AI-generated questions
3. Or accept the mock for testing (it has 3 different questions)

---

## 📊 Data Flow Verification

### Expected Request/Response Cycle

```
1. User toggles to "AI Diagnostic"
   │
2. Frontend calls: POST /diagnostic-ai/diagnostic-session/start
   Body: {learner_id: "test-learner-001", form_id: "..."}
   │
3. Backend:
   ├─ Creates session in database
   ├─ Loads form (creates mock if needed)
   ├─ Sets current_node to root item
   └─ Returns session with current_node
   │
4. Frontend receives:
   {
     session_id: "SESSION-ABC...",
     current_node: {
       stem: "Question...",
       options: [...],
       estimated_time_seconds: 60  // ✅ NEW
     }
   }
   │
5. Frontend displays first question
   │
6. User selects answer
   │
7. Frontend calls: POST /diagnostic-ai/diagnostic-session/next
   Body: {
     session_id: "SESSION-ABC...",
     response: "B",
     time_spent_seconds: 45
   }
   │
8. Backend:
   ├─ Records response
   ├─ Updates misconception confidence
   ├─ Finds next node via decision tree
   ├─ Checks if terminal (high confidence or max depth)
   └─ Returns next_node OR result
   │
9. Frontend receives:
   {
     terminal: false,
     next_node: {
       probe_id: "PROBE-...",
       stem: "Follow-up question...",
       estimated_time_seconds: 45  // ✅ NEW
     }
   }
   │
10. Loop back to step 5, or if terminal:
    {
      terminal: true,
      result: {
        primary_misconception: "ADD-001",
        confidence_score: 0.85,
        ...
      }
    }
    │
    Frontend shows result screen
```

---

## 🎯 Expected Outcomes

### ✅ Everything Works If:

1. **Quick Start (First Request)**
   - Click "AI Diagnostic" button
   - Question appears within 2-3 seconds
   - No console errors
   - Network tab shows 201 Created for `/start`

2. **Question Flow**
   - Each answer triggers new question (or result)
   - Questions are different (not stuck)
   - Time estimates shown
   - Progress bar moves

3. **Final Result**
   - Shows misconception(s) detected
   - Has confidence scores
   - Has recommendations
   - Has teacher/learner feedback

4. **No Errors**
   - Console clean (no red errors)
   - Network requests all 200/201
   - Backend logs show successful processing

---

## 📈 Performance Metrics

### Target Response Times

| Endpoint | Expected | Notes |
|----------|----------|-------|
| `/start` | < 3 sec | Session creation fast |
| `/next` | < 2 sec | Navigation quick |
| `/result` | < 1 sec | Result retrieval |
| Form generation | 10-30 sec | AI generation slower |

### Monitor with DevTools

```
Open DevTools → Network tab → Timeline
Each request should show:
- DNS lookup: ~1-50ms
- Initial connection: ~1-100ms  
- Content Download: ~100-1000ms
- Total: < 3 seconds
```

---

## 🎓 Testing Scenarios

### Scenario 1: Quick Happy Path (3 min)
- Enable diagnostic mode
- See first question
- Select answer
- See next question
- ✅ Confirms integration works

### Scenario 2: Full Assessment (10 min)
- Enable diagnostic mode
- Answer 3-5 questions
- Reach terminal
- View result
- ✅ Confirms end-to-end flow

### Scenario 3: Error Recovery
- Break network (DevTools throttle)
- Try to answer question
- See error message
- Restore network
- ✅ Confirms error handling

### Scenario 4: Multiple Sessions
- Complete one session
- Refresh page
- Start new session
- ✅ Confirms session isolation

---

## 📝 Test Results Template

```
Date: ____________
Tester: __________
Backend URL: http://localhost:8000
Frontend URL: http://localhost:3000

Phase 1 - Setup: [ ] PASS [ ] FAIL
Phase 2 - Health: [ ] PASS [ ] FAIL
Phase 3 - Frontend: [ ] PASS [ ] FAIL
Phase 4 - API Calls: [ ] PASS [ ] FAIL
Phase 5 - Navigation: [ ] PASS [ ] FAIL
Phase 6 - Terminal: [ ] PASS [ ] FAIL

Issues Found:
1. ________________
2. ________________

Overall: [ ] PASS [ ] FAIL

Comments:
```

---

## 🚀 Next Steps After Integration Test Passes

1. ✅ Unit tests
2. ✅ E2E tests (Playwright)
3. ✅ Load tests
4. ✅ Deploy to staging
5. ✅ User acceptance testing

---

**Integration is fully wired and ready for testing!** 🎉

EOF

