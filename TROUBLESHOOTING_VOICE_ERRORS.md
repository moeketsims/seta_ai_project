# Troubleshooting Voice Transcription Errors

## Error: "Transcription error: Transcription failed: Internal Server Error"

This error occurs when the backend `/audio/transcribe` endpoint returns a 500 error.

### Common Causes & Solutions

### 1. OpenAI API Key Not Set or Invalid

**Symptom:** 500 error on transcription requests

**Solution:**
```bash
# Verify API key is set
echo $OPENAI_API_KEY

# If not set, export it
export OPENAI_API_KEY="your-actual-key-here"

# Restart the backend server
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --reload --port 8000
```

### 2. Import Error in Backend

**Symptom:** Server logs show import errors or module not found

**Solution:**
```bash
# Check if all dependencies are installed
cd backend
pip install -r requirements.txt

# Verify imports work
python -c "from app.services.ai_answer_extractor import get_ai_answer_extractor; print('✅ Import successful')"
```

### 3. Server Reload Issues

**Symptom:** Server detects changes and fails to reload properly

**Solution:**
```bash
# Stop all running backend instances
pkill -f "uvicorn app.main:app"

# Start fresh
cd backend
source venv/bin/activate
export OPENAI_API_KEY="your-key-here"
python -m uvicorn app.main:app --reload --port 8000
```

### 4. Check Backend Logs for Specific Error

**Look for:**
```
ERROR: Exception in ASGI application
```

Then check the traceback to see the specific error.

### 5. Test Backend Directly

**Test transcription endpoint directly:**
```bash
# Create a test audio file or use an existing one
curl -X POST http://localhost:8000/api/v1/audio/transcribe \
  -F "audio_file=@test_audio.webm" \
  -F "language=en" \
  -F 'match_options=[{"option_id":"A","value":"20"},{"option_id":"B","value":"30"}]' \
  -F "question_stem=What is 10 + 10?"
```

Expected successful response:
```json
{
  "success": true,
  "transcription": "twenty",
  "language": "en",
  "duration": 1.2,
  "matched_option_id": "A",
  "matched_value": "20",
  "confidence": 0.95,
  "extraction_method": "ai_gpt4_mini",
  "student_reasoning": "Student answered twenty",
  "uncertainty_markers": [],
  "changed_mind": false
}
```

### 6. Verify Audio Service Import

The audio endpoint imports from the AI extractor. Verify it works:

```bash
cd backend
python3 << 'EOF'
try:
    from app.services.ai_answer_extractor import get_ai_answer_extractor
    extractor = get_ai_answer_extractor()
    print("✅ AI Extractor imported successfully")
except Exception as e:
    print(f"❌ Import failed: {e}")
EOF
```

### 7. Check for Missing Dependencies

The AI extractor requires:
- `openai` Python package
- `pydantic` version 2.x

```bash
pip list | grep -E "(openai|pydantic)"
```

Should show:
```
openai           1.x.x
pydantic         2.x.x
```

### 8. Frontend CORS Issues

**Symptom:** Browser console shows CORS errors

**Solution:** The backend should already have CORS configured, but verify in [backend/app/main.py](backend/app/main.py):

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 9. Frontend API URL

**Verify the frontend is calling the correct URL:**

In [frontend/src/hooks/useVoiceInput.ts:294](frontend/src/hooks/useVoiceInput.ts#L294):
```typescript
const response = await fetch('http://localhost:8000/api/v1/audio/transcribe', {
  method: 'POST',
  body: formData,
});
```

### 10. Browser Microphone Permissions

**Symptom:** Error before transcription even starts

**Solution:**
- Chrome: Settings → Privacy and Security → Site Settings → Microphone
- Firefox: Preferences → Privacy & Security → Permissions → Microphone
- Ensure `localhost:3000` has microphone access

## Quick Diagnostic Checklist

Run these checks in order:

```bash
# 1. Check backend is running
curl -s http://localhost:8000/docs | grep -q "OpenAPI" && echo "✅ Backend running" || echo "❌ Backend not running"

# 2. Check OpenAI API key
python3 -c "import os; print('✅ API key set' if os.getenv('OPENAI_API_KEY') else '❌ API key missing')"

# 3. Check imports
cd backend && python3 -c "from app.services.ai_answer_extractor import get_ai_answer_extractor; print('✅ Imports work')" 2>&1

# 4. Check frontend is running
curl -s http://localhost:3000 > /dev/null && echo "✅ Frontend running" || echo "❌ Frontend not running"
```

## Still Having Issues?

### Enable Debug Logging

In [backend/app/api/v1/endpoints/audio.py](backend/app/api/v1/endpoints/audio.py), add more logging:

```python
logger.info(f"Received audio file: {audio_file.filename}")
logger.info(f"Question options: {match_options}")
logger.info(f"Question stem: {question_stem}")
```

### Check the Browser Console

Open Chrome DevTools (F12) → Console tab

Look for:
- Network errors (red)
- JavaScript errors
- Failed fetch requests

### Check the Network Tab

Chrome DevTools → Network tab

Filter by: `transcribe`

Look at the request:
- Status code (should be 200)
- Response body (should have JSON)
- Request payload (FormData should include audio_file, question_stem, etc.)

## Expected Successful Flow

1. **User clicks microphone** → Browser requests mic permission
2. **User speaks** → Audio captured
3. **User clicks stop** → FormData created with:
   - `audio_file`: Blob
   - `language`: "en"
   - `match_options`: JSON string
   - `question_stem`: Question text
4. **POST /audio/transcribe** → Backend receives request
5. **Whisper transcribes** → Text returned
6. **AI extracts** (if question_stem provided) → Answer + metadata
7. **Response returned** → Frontend displays results
8. **2-second delay** → Auto-submit

## Contact Support

If issues persist after trying all troubleshooting steps:

1. Check backend logs for the full error traceback
2. Check browser console for frontend errors
3. Verify OpenAI API key is valid and has credits
4. Try with a simple test: saying just "A" or "B"

---

**Last Updated:** January 2025
