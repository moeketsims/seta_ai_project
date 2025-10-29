# Hands-Free Voice Assessment System

**Complete voice-driven assessment experience for CAPS mathematics diagnostics.**

---

## Overview

The Hands-Free Voice Assessment System transforms diagnostic assessments into a fully conversational AI experience. Students can complete entire assessments by speaking naturally, without clicking any buttons.

### Key Features

✅ **Fully Hands-Free** - No buttons to click during assessment
✅ **Continuous Listening** - System listens automatically after reading questions
✅ **Auto TTS** - Questions read aloud automatically
✅ **Natural Language** - Understands variations like "Option A", "The first one", "I choose B"
✅ **Voice Commands** - Navigation, help, and control via voice
✅ **Visual Feedback** - Clear real-time indicators without interaction
✅ **Confidence-Based** - Auto-execute high confidence, confirm medium confidence
✅ **Accessible** - Works for learners with motor disabilities or reading difficulties

---

## Architecture

### Components

```
frontend/src/
├── lib/
│   └── voiceCommandParser.ts       # Natural language command parsing
├── hooks/
│   ├── useVoiceInput.ts            # Low-level voice recording (existing)
│   ├── useTextToSpeech.ts          # TTS playback (existing)
│   └── useVoiceAssessmentMode.ts   # Orchestrator for hands-free mode (NEW)
└── components/
    └── assessment/
        ├── VoiceInputButton.tsx         # Manual voice button (existing)
        ├── AudioControls.tsx            # Manual TTS controls (existing)
        └── VoiceAssessmentMode.tsx      # Floating voice UI (NEW)
```

### State Machine

```
disabled → idle → reading_question → listening → processing → executing → idle
                      ↓                   ↓            ↓
                   (TTS plays)      (continuous)  (confirming)
```

---

## Usage

### 1. Enable Voice Mode

**Option A: Click "Enable Voice Mode" button**
A floating button appears in the bottom-right corner when starting an assessment.

**Option B: Say "Enable voice mode"**
If the manual voice button is visible, say this command.

### 2. Voice Mode Flow

1. **Question Reading** - System automatically reads question and all options
2. **Listening Phase** - Microphone activates, audio visualizer shows level
3. **Speak Answer** - Say your answer naturally (see commands below)
4. **Auto-Submit** - High-confidence answers submit automatically
5. **Confirmation** - Medium-confidence answers ask for confirmation
6. **Next Question** - Process repeats for each question

### 3. Voice Commands

#### Answer Selection

| What You Say | Result |
|--------------|--------|
| "Option A" | Selects Option A |
| "The answer is B" | Selects Option B |
| "I think it's C" | Selects Option C |
| "D" | Selects Option D |
| "First one" | Selects Option A |
| "Second option" | Selects Option B |
| "Twenty" (direct answer) | Matches to option with value "20" |

#### Navigation

| Command | Action |
|---------|--------|
| "Repeat" | Reads question again |
| "Read it again" | Reads question again |
| "Next question" | Submits and moves to next |
| "Skip" / "I don't know" | Skips question |

#### Control

| Command | Action |
|---------|--------|
| "Help" | Shows available commands |
| "Disable voice mode" | Returns to manual mode |

---

## Technical Details

### Voice Command Parsing

The system uses regex-based pattern matching with confidence scoring:

```typescript
// High confidence (≥0.8) → Auto-execute
// Medium confidence (0.3-0.8) → Confirm with user
// Low confidence (<0.3) → Ask to repeat

parseVoiceCommand("Option A") → { confidence: 0.9, optionId: "A" }
parseVoiceCommand("The first option") → { confidence: 0.8, optionId: "A" }
parseVoiceCommand("Um, maybe A?") → { confidence: 0.5, optionId: "A", needsConfirmation: true }
```

### Continuous Listening Loop

```
1. Start recording (5-second window)
2. Auto-stop after timeout
3. Transcribe via Whisper API
4. Parse command
5. Execute or confirm
6. Wait 1 second
7. Start next recording cycle
```

### TTS Integration

- **Voice**: Nova (friendly female, recommended for Grade 4)
- **Speed**: 1.0x (configurable)
- **Auto-play**: Triggers automatically when new question loads
- **Caching**: Repeated questions use cached audio

### Backend Integration

**Existing endpoints** (no backend changes needed):

- `POST /api/v1/audio/transcribe` - Whisper transcription
- `POST /api/v1/audio/synthesize` - OpenAI TTS
- `POST /api/v1/audio/match-answer` - AI-powered answer extraction

---

## Testing Guide

### Manual Testing

#### Test 1: Basic Answer Selection

1. Navigate to `/take-assessment`
2. Start assessment
3. Click "Enable Voice Mode"
4. Wait for question to be read
5. Say "Option A"
6. **Expected**: Answer selected and auto-submitted within 500ms

#### Test 2: Natural Language Variations

1. Enable voice mode
2. Try these phrases for Option B:
   - "B"
   - "Option B"
   - "The answer is B"
   - "I think it's B"
   - "Second one"
3. **Expected**: All recognized as Option B with confidence ≥0.8

#### Test 3: Repeat Question

1. Enable voice mode
2. After question reads, say "Repeat"
3. **Expected**: Question reads again from beginning

#### Test 4: Low Confidence Confirmation

1. Enable voice mode
2. Say "Um... maybe... I think... perhaps A?"
3. **Expected**: Confirmation dialog: "Did you mean Option A?"
4. Say "Yes"
5. **Expected**: Option A submitted

#### Test 5: Navigation Commands

1. Enable voice mode
2. Say "Skip" or "I don't know"
3. **Expected**: Moves to next question without submitting

#### Test 6: Disable Voice Mode

1. Enable voice mode
2. Say "Disable voice mode"
3. **Expected**: Returns to manual controls

### Automated Testing (Future)

```typescript
// Example E2E test with Playwright
test('hands-free voice assessment flow', async ({ page }) => {
  await page.goto('/take-assessment');
  await page.click('text=Enable Voice Mode');

  // Mock voice input
  await page.evaluate(() => {
    window.mockVoiceInput('Option A');
  });

  await expect(page.locator('[data-testid="selected-answer"]')).toHaveText('A');
  await expect(page.locator('[data-testid="next-question"]')).toBeVisible();
});
```

---

## Accessibility Features

### Visual Indicators

- **Pulsing microphone icon** - System is listening
- **Audio level bars** - Real-time voice detection
- **Transcription preview** - Shows what system heard
- **Status messages** - Clear text descriptions of state
- **Confirmation dialogs** - Visual prompts for clarification

### Keyboard Shortcuts

- **Space Bar** - Toggle voice mode on/off
- **Escape** - Disable voice mode

### Fallback Modes

1. **Microphone permission denied** → Show manual controls
2. **Voice recognition error** → Retry with error message
3. **Low confidence repeatedly** → Suggest manual mode
4. **TTS failure** → Show text, allow reading

---

## Configuration

### Voice Settings

```typescript
const voiceMode = useVoiceAssessmentMode({
  voice: 'nova',              // TTS voice (alloy, echo, fable, onyx, nova, shimmer)
  autoEnableOnStart: false,   // Auto-enable when starting assessment
  confidenceThreshold: 0.8,   // Threshold for auto-execution
});
```

### Timing Parameters

```typescript
// Recording duration per cycle
LISTENING_DURATION = 5000ms

// Auto-submit delay (after high-confidence match)
AUTO_SUBMIT_DELAY = 500ms

// Confirmation timeout
CONFIRMATION_TIMEOUT = 5000ms

// Pause between listening cycles
LISTENING_PAUSE = 1000ms
```

---

## Troubleshooting

### Issue: Voice not detected

**Symptoms**: Microphone icon shows but no transcription
**Causes**:
- Microphone permission not granted
- Browser doesn't support MediaRecorder API
- Background noise too high

**Solutions**:
1. Check browser permissions (chrome://settings/content/microphone)
2. Use Chrome, Firefox, or Safari (latest versions)
3. Reduce background noise
4. Increase microphone volume in system settings

### Issue: Wrong answer selected

**Symptoms**: System selects Option B when you said Option A
**Causes**:
- Transcription error (Whisper API)
- Parsing ambiguity
- Background noise

**Solutions**:
1. Speak clearly and slowly
2. Use explicit phrases: "Option A" instead of just "A"
3. Wait for confirmation dialog (medium confidence)
4. Disable voice mode and use manual input

### Issue: Question not reading automatically

**Symptoms**: Voice mode enabled but TTS doesn't play
**Causes**:
- Browser auto-play policy blocking audio
- TTS synthesis error
- OpenAI API key missing

**Solutions**:
1. User interaction required first (click anywhere on page)
2. Check backend logs for OpenAI errors
3. Verify OPENAI_API_KEY in `.env`

### Issue: Continuous listening not working

**Symptoms**: System listens once then stops
**Causes**:
- State machine stuck in wrong state
- Error in transcription callback

**Solutions**:
1. Disable and re-enable voice mode
2. Check browser console for errors
3. Refresh page and try again

---

## Performance Considerations

### Latency Breakdown

| Step | Duration | Notes |
|------|----------|-------|
| TTS Generation | 500-1500ms | Cached after first generation |
| TTS Playback | 5-15s | Depends on question length |
| Recording | 5s max | Auto-stop after silence detection |
| Whisper Transcription | 1-3s | OpenAI API call |
| Command Parsing | <10ms | Client-side regex |
| Answer Submission | 200-500ms | API call to backend |

**Total per question**: ~10-25 seconds (vs. 5-10 seconds manual)

### Optimization Tips

1. **Pre-cache TTS audio** - Generate audio for all questions on form load
2. **Reduce recording duration** - Stop recording after 2 seconds of silence
3. **Local wake word detection** - Use lightweight on-device model
4. **Parallel processing** - Start transcription while TTS is playing

---

## Future Enhancements

### Phase 2: Wake Word Detection

Use lightweight model (TensorFlow.js) for "Hey Tutor" wake word:

```typescript
// Activate listening only when wake word detected
if (detectWakeWord(audioStream)) {
  startListening();
}
```

**Benefits**:
- Battery savings (mic not always active)
- Privacy (no audio sent to server until wake word)
- Natural conversation flow

### Phase 3: Multi-turn Dialogue

Support clarification dialogues:

```
System: "What is 12 + 8?"
User: "Um... I'm not sure"
System: "Would you like a hint? Say yes or no."
User: "Yes"
System: "Think about counting up from 12..."
```

### Phase 4: Emotion Detection

Analyze voice tone for:
- Confidence level (certain vs. uncertain)
- Frustration (struggling learner)
- Engagement (bored vs. excited)

Use this for adaptive interventions.

### Phase 5: Multi-language Support

- **Afrikaans**: "Opsie A", "Herhaal die vraag"
- **isiZulu**: "Inketho A", "Phinda umbuzo"
- **Sesotho**: "Kgetho A", "Bua gape potso"

---

## API Reference

### `useVoiceAssessmentMode`

```typescript
function useVoiceAssessmentMode(
  options: VoiceAssessmentOptions
): VoiceAssessmentState

interface VoiceAssessmentOptions {
  currentQuestion?: {
    stem: string;
    context?: string;
    options: { id: string; text: string }[];
  } | null;
  onAnswerSelected?: (optionId: string) => void;
  onNavigate?: (action: 'repeat' | 'next' | 'skip') => void;
  onHelp?: () => void;
  voice?: TTSVoice;
  autoEnableOnStart?: boolean;
}

interface VoiceAssessmentState {
  isEnabled: boolean;
  state: VoiceModeState;
  currentCommand: ParsedVoiceCommand | null;
  statusMessage: string;
  error: string | null;
  enable: () => void;
  disable: () => void;
  toggle: () => void;
  confirmCommand: () => void;
  cancelCommand: () => void;
  isQuestionPlaying: boolean;
  stopSpeaking: () => void;
  isListening: boolean;
  audioLevel: number;
  transcript: string | null;
}
```

### `parseVoiceCommand`

```typescript
function parseVoiceCommand(transcript: string): ParsedVoiceCommand

interface ParsedVoiceCommand {
  type: 'answer_selection' | 'navigation' | 'control' | 'unknown';
  action: string;
  data?: any;
  confidence: number;
  rawTranscript: string;
  alternativeInterpretations?: string[];
}
```

---

## License

Part of the ETDP SETA AI Mathematics Teacher Assistant System.
© 2024 University of the Free State. All rights reserved.

---

## Support

**Documentation**: See `docs/VOICE_INTEGRATION_GUIDE.md`
**Issues**: Report to project maintainer
**Testing**: See `AI_VOICE_TESTING_GUIDE.md`

**For questions or feature requests, contact the development team.**
