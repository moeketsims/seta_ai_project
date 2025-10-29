# OpenAI Integration Test Guide

**Date:** October 28, 2025  
**Status:** ✅ **FIXES APPLIED & READY FOR TESTING**

---

## 🔧 Fixes Applied

All 5 critical issues have been resolved:

1. ✅ **Added `estimated_time_seconds` to DiagnosticProbeSchema** - Probes now have the same time estimation as items
2. ✅ **Updated probe generation prompt** - LLM now generates `estimated_time_seconds` and other metadata fields
3. ✅ **Improved router error handling** - `get_current_node()` now validates form exists before access
4. ✅ **Added startup validation** - Backend validates `OPENAI_API_KEY` exists at startup, not on first request
5. ✅ **Enhanced schema completeness** - Probes now have `context`, `visual_aid_url`, `dok_level`, `reading_level` matching items

---

## 📋 Pre-Test Checklist

Before running tests, ensure:

- [ ] `.env` file exists in `backend/` with `OPENAI_API_KEY` set
  ```bash
  echo "OPENAI_API_KEY=sk-..." >> backend/.env
  ```

- [ ] Python dependencies installed
  ```bash
  cd backend && pip install -r requirements.txt
  ```

- [ ] Database is initialized
  ```bash
  # Backend will auto-initialize SQLite on first run
  ```

- [ ] No other services running on ports 8000-8005
  ```bash
  lsof -i :8000
  ```

---

## 🚀 Integration Test Steps

### Step 1: Startup Validation Test

**Test:** Verify backend validates OpenAI credentials at startup

```bash
# Navigate to backend
cd /Users/mosiams/Desktop/ETDP_SETA_Repo/backend

# Test 1a: Missing API key should fail
unset OPENAI_API_KEY
python -m uvicorn app.main:app --reload 2>&1 | grep -i "startup validation failed"
# Expected: RuntimeError about missing OPENAI_API_KEY

# Test 1b: With valid key should succeed
export OPENAI_API_KEY="sk-your-test-key"
python -m uvicorn app.main:app --reload &
sleep 3
curl -s http://localhost:8000/health | grep healthy
# Expected: {"status":"healthy"}
```

**Expected Result:** 
- Without API key: **Startup fails with error message** ✅
- With API key: **Server starts successfully** ✅

---

### Step 2: Generate Diagnostic Form Test

**Test:** Generate a diagnostic form using the real OpenAI API

```bash
curl -X POST http://localhost:8000/api/v1/diagnostic-ai/generate-diagnostic-form \
  -H "Content-Type: application/json" \
  -d '{
    "caps_objective_id": "CAPS-G4-NR-1",
    "grade_level": 4,
    "content_area": "Numbers.Operations.Addition",
    "max_items": 3,
    "max_time_minutes": 8,
    "include_visuals": false
  }' | jq .
```

**Expected Response:**
```json
{
  "form": {
    "form_id": "FORM-CAPS-G4-NR-1-...",
    "title": "Grade 4 Diagnostic: Numbers.Operations.Addition",
    "root_item_id": "ITEM-CAPS-G4-NR-1-...",
    "items": [
      {
        "item_id": "ITEM-...",
        "stem": "What is 345 + 278?",
        "correct_answer": { ... },
        "distractors": [ ... ]
      }
    ],
    "probes": [
      {
        "probe_id": "PROBE-...",
        "estimated_time_seconds": 45,  // ✅ NEW FIELD
        "stem": "What is 567 + 234?"
      }
    ],
    "edges": [ ... ]
  },
  "generation_metadata": {
    "model": "gpt-4o-mini",
    "generation_timestamp": "2025-10-28T..."
  },
  "warnings": []
}
```

**Validation Checklist:**
- [ ] HTTP 201 Created response
- [ ] `form.form_id` is unique
- [ ] `form.root_item_id` matches first item
- [ ] All items have `estimated_time_seconds` (45-300 seconds)
- [ ] All probes have `estimated_time_seconds` ✅ **NEW**
- [ ] All distractors have `misconception_tag` matching database
- [ ] No validation warnings (or only minor ones)
- [ ] Decision tree edges are valid

---

### Step 3: Start Diagnostic Session Test

**Test:** Start a diagnostic session and receive the first question

```bash
# Get the form_id from previous response, or use:
FORM_ID="FORM-CAPS-G4-NR-1-20251028..." 

curl -X POST "http://localhost:8000/api/v1/diagnostic-ai/diagnostic-session/start?learner_id=learner-123&form_id=${FORM_ID}" \
  -H "Content-Type: application/json" | jq .
```

**Expected Response:**
```json
{
  "session_id": "SESSION-ABC123...",
  "learner_id": "learner-123",
  "form_id": "FORM-...",
  "current_node_id": "ITEM-...",
  "current_node": {
    "item_id": "ITEM-...",
    "stem": "What is 345 + 278?",
    "correct_answer": {
      "option_id": "A",
      "value": "623"
    },
    "distractors": [
      {
        "option_id": "B",
        "value": "513",
        "misconception_tag": "ADD-001"
      }
    ]
  },
  "visited_nodes": [],
  "responses": {},
  "suspected_misconceptions": {},
  "confirmed_misconceptions": [],
  "started_at": "2025-10-28T..."
}
```

**Validation Checklist:**
- [ ] HTTP 201 Created response
- [ ] Session ID generated and valid
- [ ] `current_node` contains full question data (not null) ✅ **CRITICAL**
- [ ] All distractors have misconception tags
- [ ] `visited_nodes` is empty (no items visited yet)

---

### Step 4: Submit Answer & Navigate Test

**Test:** Submit learner response and navigate to next node

```bash
SESSION_ID="SESSION-ABC123..."

curl -X POST http://localhost:8000/api/v1/diagnostic-ai/diagnostic-session/next \
  -H "Content-Type: application/json" \
  -d "{
    \"session_id\": \"${SESSION_ID}\",
    \"response\": \"B\",
    \"time_spent_seconds\": 45
  }" | jq .
```

**Expected Response (if not terminal):**
```json
{
  "session_id": "SESSION-ABC123...",
  "terminal": false,
  "next_node": {
    "probe_id": "PROBE-ADD-001-...",
    "stem": "What is 567 + 234?",
    "estimated_time_seconds": 45,  // ✅ NEW FIELD
    "correct_answer": { ... },
    "distractors": [ ... ]
  },
  "result": null,
  "progress": {
    "nodes_visited": 1,
    "max_nodes": 4,
    "completion": 0.25
  }
}
```

**Expected Response (if terminal):**
```json
{
  "session_id": "SESSION-ABC123...",
  "terminal": true,
  "next_node": null,
  "result": {
    "session_id": "SESSION-...",
    "primary_misconception": "ADD-001",
    "all_misconceptions": {
      "ADD-001": 0.85,
      "ADD-002": 0.4
    },
    "severity": "medium",
    "response_path": ["ITEM-001", "PROBE-ADD-001"],
    "key_evidence": ["..."],
    "recommended_interventions": ["INTERVENTION-ADD-001"],
    "teacher_summary": "Primary Misconception Detected: Failed to regroup tens correctly...",
    "learner_feedback": "Thank you for completing this diagnostic assessment...",
    "total_time_seconds": 127,
    "confidence_score": 0.85
  },
  "progress": {
    "nodes_visited": 2,
    "max_nodes": 4,
    "completion": 1.0
  }
}
```

**Validation Checklist:**
- [ ] HTTP 200 OK response
- [ ] Session ID matches request
- [ ] If terminal=false:
  - [ ] `next_node` contains probe data
  - [ ] `next_node.estimated_time_seconds` is present ✅ **NEW**
  - [ ] `progress.completion` is between 0 and 1
- [ ] If terminal=true:
  - [ ] `result` contains misconception findings
  - [ ] `result.confidence_score` is 0-1
  - [ ] Recommended interventions are provided

---

### Step 5: Full End-to-End Flow Test

**Test:** Complete a full diagnostic session from start to finish

```bash
# Create a test script to automate the full flow
cat > /tmp/test_diagnostic_flow.sh << 'SCRIPT'
#!/bin/bash

API="http://localhost:8000/api/v1/diagnostic-ai"

# Step 1: Generate form
echo "📝 Generating diagnostic form..."
FORM_RESPONSE=$(curl -s -X POST "$API/generate-diagnostic-form" \
  -H "Content-Type: application/json" \
  -d '{
    "caps_objective_id": "CAPS-G4-FRAC-1",
    "grade_level": 4,
    "content_area": "Numbers.Operations.Fractions",
    "max_items": 3,
    "max_time_minutes": 8
  }')

FORM_ID=$(echo "$FORM_RESPONSE" | jq -r '.form.form_id')
echo "✅ Form created: $FORM_ID"

# Step 2: Start session
echo "🎯 Starting diagnostic session..."
SESSION_RESPONSE=$(curl -s -X POST "$API/diagnostic-session/start?learner_id=test-learner&form_id=$FORM_ID" \
  -H "Content-Type: application/json")

SESSION_ID=$(echo "$SESSION_RESPONSE" | jq -r '.session_id')
CURRENT_NODE=$(echo "$SESSION_RESPONSE" | jq -r '.current_node_id')
echo "✅ Session started: $SESSION_ID"
echo "📍 Current node: $CURRENT_NODE"

# Step 3: Simulate answers
echo "💭 Submitting answers..."
for i in {1..3}; do
  OPTIONS=$(echo "$SESSION_RESPONSE" | jq -r '.current_node.distractors[].option_id' | head -1)
  RESPONSE=$(echo "$SESSION_RESPONSE" | jq -r '.current_node.correct_answer.option_id')
  
  # Randomly choose an answer
  if [ $((RANDOM % 2)) -eq 0 ]; then
    ANSWER=$RESPONSE
  else
    ANSWER=$(echo "$SESSION_RESPONSE" | jq -r '.current_node.distractors[0].option_id')
  fi
  
  echo "  Answer $i: $ANSWER"
  
  SESSION_RESPONSE=$(curl -s -X POST "$API/diagnostic-session/next" \
    -H "Content-Type: application/json" \
    -d "{
      \"session_id\": \"$SESSION_ID\",
      \"response\": \"$ANSWER\",
      \"time_spent_seconds\": 45
    }")
  
  TERMINAL=$(echo "$SESSION_RESPONSE" | jq -r '.terminal')
  if [ "$TERMINAL" = "true" ]; then
    echo "✅ Assessment complete!"
    break
  fi
done

# Step 4: Show final result
echo "\n📊 Final Result:"
echo "$SESSION_RESPONSE" | jq '.result | {primary_misconception, severity, confidence_score}'
SCRIPT

chmod +x /tmp/test_diagnostic_flow.sh
/tmp/test_diagnostic_flow.sh
```

---

## 🐛 Debugging Guide

### Issue: "OPENAI_API_KEY environment variable is missing"

**Solution:**
```bash
# Add to backend/.env
echo "OPENAI_API_KEY=sk-..." >> backend/.env

# Or export before running
export OPENAI_API_KEY="sk-..."
```

### Issue: "Current node not found in decision tree"

**Cause:** Form's decision_tree is malformed or empty

**Debug:**
```bash
# Check form response
curl -s http://localhost:8000/api/v1/diagnostic-ai/get-form?form_id=... | jq '.form.edges'

# Verify root_item_id matches a node
curl -s http://localhost:8000/api/v1/diagnostic-ai/get-form?form_id=... | \
  jq '.form | {root_item_id, item_ids: [.items[].item_id]}'
```

### Issue: Probe validation errors

**Cause:** LLM didn't generate all required fields

**Debug:**
```bash
# Check probe response
curl -s http://localhost:8000/api/v1/diagnostic-ai/get-form?form_id=... | \
  jq '.form.probes[] | {probe_id, estimated_time_seconds, stem}'
```

---

## ✅ Success Criteria

The integration is working correctly when:

- ✅ Backend starts without runtime errors
- ✅ OpenAI API key validation occurs at startup
- ✅ Diagnostic form generation completes in < 30 seconds
- ✅ Form contains root item + probes with all required fields
- ✅ Session starts and immediately returns `current_node` with full question data
- ✅ Answers are processed and misconceptions are tracked
- ✅ Final result includes confidence scores and recommendations
- ✅ All probes have `estimated_time_seconds` field (new)
- ✅ Total time doesn't exceed `max_time_minutes`

---

## 📊 Performance & Cost Monitoring

### Costs per API call:
- Root item generation: ~$0.0008
- Probe generation (per probe): ~0.0005
- Total per form: ~$0.002-0.003

### Monitor during testing:
1. Check OpenAI usage dashboard: https://platform.openai.com/account/usage/overview
2. Set monthly limit: https://platform.openai.com/account/billing/limits
3. Log all API calls in `backend.log`

---

## 🎯 Next Steps After Testing

1. ✅ Fix all issues (DONE)
2. ⏳ Run integration tests (THIS STEP)
3. ▶️ Run in development with `.env` properly configured
4. ▶️ Test with frontend (toggle AI Diagnostic mode on)
5. ▶️ Monitor logs for errors/costs
6. ▶️ Deploy to staging environment
7. ▶️ Full end-to-end user acceptance testing

---

## 📝 Test Results Log

Date: __________ | Tester: __________

| Test | Result | Notes |
|------|--------|-------|
| Startup validation | ✅/❌ | |
| Form generation | ✅/❌ | |
| Session start | ✅/❌ | |
| First question received | ✅/❌ | |
| Navigation works | ✅/❌ | |
| Final result correct | ✅/❌ | |
| Total time tracked | ✅/❌ | |
| Probes have estimated_time | ✅/❌ | |

---

**Questions?** Check `AI_DIAGNOSTIC_SYSTEM.md` for architecture details.


