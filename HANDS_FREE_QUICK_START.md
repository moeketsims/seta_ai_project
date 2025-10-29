# Hands-Free Voice Assessment - Quick Start Guide

**Get started with the fully voice-driven assessment system in 5 minutes.**

---

## Quick Demo

### 1. Start the Backend

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python -m uvicorn app.main:app --reload --port 8000
```

**Verify backend is running:**
```bash
curl http://localhost:8000/api/v1/audio/voices
```

### 2. Start the Frontend

```bash
cd frontend
npm run dev
```

**Open browser:**
http://localhost:3000/take-assessment

### 3. Enable Voice Mode

1. Click **"Start Diagnostic Assessment"**
2. Look for the **floating "Enable Voice Mode"** button (bottom-right corner)
3. Click it (or just say **"Enable voice mode"** if manual voice button is visible)

### 4. Experience Hands-Free Assessment

**What happens next:**

1. 🗣️ System reads: *"What is 12 plus 8? Option A: 18. Option B: 20. Option C: 22. Option D: 24."*
2. 🎤 Microphone activates automatically (pulsing green icon)
3. 🎙️ **You speak:** "Option B"
4. ✅ System confirms: "Selecting Option B..."
5. ➡️ Answer submitted, next question loads
6. 🔄 Process repeats - **NO clicking required!**

---

## Voice Commands Cheat Sheet

### Answer a Question

| Say This | Result |
|----------|--------|
| **"Option A"** | Selects A |
| **"B"** | Selects B |
| **"The answer is C"** | Selects C |
| **"First one"** | Selects A |
| **"Twenty"** (direct answer) | Matches to option with value "20" |

### Navigation

| Say This | Result |
|----------|--------|
| **"Repeat"** | Reads question again |
| **"Skip"** | Skips to next question |
| **"Help"** | Shows available commands |

### Control

| Say This | Result |
|----------|--------|
| **"Disable voice mode"** | Returns to manual controls |

---

## Troubleshooting (60-Second Fixes)

### Issue: No voice detected

**Fix 1:** Check microphone permissions
- Chrome: Look for 🎤 icon in address bar → Click → Allow

**Fix 2:** Speak louder or closer to microphone
- Audio level bars should pulse when you speak

### Issue: Wrong answer selected

**Fix:** Speak more clearly
- Try: **"Option A"** (explicit) instead of just **"A"** (ambiguous)

### Issue: Question not reading

**Fix:** Click anywhere on page first (browser auto-play policy)

### Issue: "Error" message appears

**Fix:** Check backend is running
```bash
curl http://localhost:8000/api/v1/audio/voices
```

If error persists, check backend logs for OpenAI API key errors.

---

## Visual Indicators

### What You See

| Icon/Color | Meaning |
|------------|---------|
| 🔵 Blue pulsing icon | Reading question (TTS) |
| 🟢 Green pulsing icon | Listening for your answer |
| 🟡 Amber spinning icon | Processing your voice |
| 🟣 Purple bouncing icon | Needs confirmation ("Did you say Option A?") |
| 🔴 Red icon | Error occurred |

### Audio Level Bars

```
████████████████████ ← High volume (good)
████████░░░░░░░░░░░░ ← Medium volume (okay)
██░░░░░░░░░░░░░░░░░░ ← Low volume (speak louder)
```

---

## Comparison: Manual vs. Hands-Free

### Manual Mode (Old Way)

1. Read question visually
2. Click option radio button
3. Click "Submit Answer" button
4. Wait for next question
5. Repeat

**Total clicks per question:** 2
**Total time:** ~5-10 seconds

### Hands-Free Mode (New Way)

1. Listen to question (auto TTS)
2. Speak answer
3. Auto-submit
4. Wait for next question
5. Repeat

**Total clicks per question:** 0 ✅
**Total time:** ~10-15 seconds (includes TTS reading)

---

## Pro Tips

### Tip 1: Pre-enable Voice Mode

Enable voice mode **before** starting the assessment for a fully conversational experience from question 1.

### Tip 2: Use Clear Phrases

**Good:**
- "Option A"
- "The answer is B"
- "I choose C"

**Avoid:**
- "Um... maybe... possibly... A?" (low confidence → requires confirmation)
- "I think it's... wait... no..." (ambiguous → may not match)

### Tip 3: Natural Pauses

Speak naturally with brief pauses between words:
- **"Option [pause] A"** ← Clear
- **"OptiiiooonAaaaa"** ← Hard to parse

### Tip 4: Background Noise

Works best in quiet environments:
- ✅ Library, quiet room
- ❌ Busy classroom, traffic noise

### Tip 5: Microphone Quality

Better microphone = better accuracy:
- ✅ Headset microphone (best)
- ✅ Built-in laptop mic (good)
- ⚠️ Phone/tablet mic (okay, but test first)

---

## What's Next?

### After Testing

1. **Check backend logs** - See Whisper transcriptions in real-time
2. **Review documentation** - Read `HANDS_FREE_VOICE_ASSESSMENT.md` for full details
3. **Test edge cases** - Try accents, background noise, rapid speech
4. **User testing** - Let Grade 4 learners try it!

### Customization

Edit configuration in `take-assessment/page.tsx`:

```typescript
const voiceMode = useVoiceAssessmentMode({
  voice: 'nova',              // Change TTS voice
  autoEnableOnStart: true,    // Auto-enable on start
});
```

### Feedback

Report issues or suggestions to the development team. Include:
- Browser version
- Microphone type
- Voice command that failed
- Expected vs. actual result

---

## Need Help?

**📖 Full Documentation:** `HANDS_FREE_VOICE_ASSESSMENT.md`
**🧪 Testing Guide:** `AI_VOICE_TESTING_GUIDE.md`
**🔧 Troubleshooting:** `TROUBLESHOOTING_VOICE_ERRORS.md`

**Happy testing! 🎤✨**
