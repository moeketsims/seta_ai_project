# Quick Start: Testing the OpenAI Integration

**Time Required:** 10 minutes  
**Prerequisites:** OpenAI API key, Python 3.8+

---

## 🚀 Fast Track

### 1. Setup (2 min)
```bash
cd /Users/mosiams/Desktop/ETDP_SETA_Repo/backend

# Add your OpenAI key
echo "OPENAI_API_KEY=sk-YOUR_KEY_HERE" > .env

# Install deps (if needed)
pip install -r requirements.txt
```

### 2. Start Backend (1 min)
```bash
# Terminal 1 - Start server
python -m uvicorn app.main:app --reload

# Expected output:
# ✅ Startup validation passed
# Uvicorn running on http://127.0.0.1:8000
```

### 3. Test Startup Validation (1 min)
```bash
# Terminal 2 - Check health
curl http://localhost:8000/health
# Expected: {"status":"healthy"}
```

### 4. Generate a Form (2 min)
```bash
curl -X POST http://localhost:8000/api/v1/diagnostic-ai/generate-diagnostic-form \
  -H "Content-Type: application/json" \
  -d '{
    "caps_objective_id": "CAPS-G4-NR-1",
    "grade_level": 4,
    "content_area": "Numbers.Operations.Addition",
    "max_items": 2,
    "max_time_minutes": 5
  }' | jq '.form | {form_id, title, root_item_id, items: [.items[].stem], probes: [.probes[].estimated_time_seconds]}'

# Expected output:
# {
#   "form_id": "FORM-CAPS-G4-NR-1-...",
#   "title": "Grade 4 Diagnostic: Numbers.Operations.Addition",
#   "root_item_id": "ITEM-...",
#   "items": ["What is 345 + 278?"],
#   "probes": [45]  // ✅ NEW - estimated_time_seconds
# }
```

### 5. Start Session (2 min)
```bash
FORM_ID="FORM-CAPS-G4-NR-1-..."  # From above

curl -X POST "http://localhost:8000/api/v1/diagnostic-ai/diagnostic-session/start?learner_id=test&form_id=$FORM_ID" \
  -H "Content-Type: application/json" | \
  jq '{session_id: .session_id, current_node: .current_node | {stem, distractors: [.distractors[].option_id]}}'

# Expected output:
# {
#   "session_id": "SESSION-ABC...",
#   "current_node": {
#     "stem": "What is 345 + 278?",
#     "distractors": ["B", "C", "D"]
#   }
# }
```

### 6. Submit Answer (2 min)
```bash
SESSION_ID="SESSION-ABC..."  # From above

curl -X POST http://localhost:8000/api/v1/diagnostic-ai/diagnostic-session/next \
  -H "Content-Type: application/json" \
  -d "{
    \"session_id\": \"$SESSION_ID\",
    \"response\": \"B\",
    \"time_spent_seconds\": 45
  }" | jq '{terminal: .terminal, next_node_has_estimated_time: (.next_node.estimated_time_seconds != null)}'

# Expected output:
# {
#   "terminal": false,
#   "next_node_has_estimated_time": true  // ✅ NEW
# }
```

---

## ✅ Success Indicators

All tests pass if you see:

- ✅ Server starts with "Startup validation passed"
- ✅ Health check returns `{"status":"healthy"}`
- ✅ Form generated with probes that have `estimated_time_seconds`
- ✅ Session starts and includes full `current_node` data
- ✅ Navigation returns next node with `estimated_time_seconds`

---

## 🐛 Troubleshooting

| Error | Solution |
|-------|----------|
| `RuntimeError: Missing OPENAI_API_KEY` | Add to `.env`: `OPENAI_API_KEY=sk-...` |
| `curl: (7) Failed to connect` | Server not running. Run Step 2 |
| `ValidationError: field required` | LLM response incomplete. Check OpenAI status |
| `Form not found` | This is normal - auto-creates mock form |

---

## 📊 What Changed

| Item | Before | After |
|------|--------|-------|
| Probe schema | Missing 5 fields | ✅ Complete |
| Startup validation | Lazy (first request) | ✅ Immediate (startup) |
| Error messages | Unclear | ✅ Detailed |
| Time tracking | Items only | ✅ Items + Probes |

---

## 🎯 Next: Full Testing

See `INTEGRATION_TEST_GUIDE.md` for comprehensive tests.

---

**All issues fixed. Ready to test!** 🚀
