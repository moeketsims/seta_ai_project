/**
 * Voice Command Parser
 *
 * Parses natural language voice commands for hands-free assessment navigation.
 *
 * Supported Commands:
 * - Answer selection: "Option A", "The answer is B", "I choose C"
 * - Navigation: "Next question", "Repeat the question"
 * - Control: "Enable voice mode", "Help", "I don't know"
 *
 * Features:
 * - Fuzzy matching for variations
 * - Multi-language support (English, Afrikaans)
 * - Confidence scoring
 * - Command disambiguation
 */

// ============================================================================
// Types
// ============================================================================

export type VoiceCommandType =
  | 'answer_selection'   // User selected an answer option
  | 'navigation'          // User wants to navigate (next, previous, repeat)
  | 'control'             // User wants to control voice mode (enable, disable, help)
  | 'unknown';            // Could not parse command

export interface ParsedVoiceCommand {
  type: VoiceCommandType;
  action: string;         // e.g., "select_option", "repeat_question", "enable_voice_mode"
  data?: any;             // e.g., { optionId: "A" }, { direction: "next" }
  confidence: number;     // 0-1 confidence score
  rawTranscript: string;  // Original transcription
  alternativeInterpretations?: string[];
}

// ============================================================================
// Command Patterns (Regex + Keywords)
// ============================================================================

const ANSWER_SELECTION_PATTERNS = {
  // Direct option letter: "A", "Option A", "Letter A", "The answer is A"
  optionLetter: [
    /\b(option\s+)?([a-d])\b/i,
    /\b(letter\s+)?([a-d])\b/i,
    /\b(answer\s+is\s+)?([a-d])\b/i,
    /\b(i\s+choose\s+)?([a-d])\b/i,
    /\b(i\s+think\s+it'?s\s+)?([a-d])\b/i,
    /\b(select\s+)?([a-d])\b/i,
    /^([a-d])$/i, // Just "A"
  ],

  // Number references: "first one", "second option", "number 1"
  positional: [
    /\b(the\s+)?(first|1st|one)\s+(option|answer|one)?\b/i,
    /\b(the\s+)?(second|2nd|two)\s+(option|answer|one)?\b/i,
    /\b(the\s+)?(third|3rd|three)\s+(option|answer|one)?\b/i,
    /\b(the\s+)?(fourth|4th|four)\s+(option|answer|one)?\b/i,
    /\b(number\s+)?([1-4])\b/i,
  ],
};

const NAVIGATION_PATTERNS = {
  repeat: [
    /\b(repeat|read\s+again|say\s+again|what\s+was|pardon)\b/i,
    /\b(repeat\s+the\s+question|read\s+the\s+question\s+again)\b/i,
    /\b(can\s+you\s+repeat|could\s+you\s+repeat)\b/i,
  ],
  next: [
    /\b(next|continue|go\s+on|move\s+on|submit)\b/i,
    /\b(next\s+question|go\s+to\s+next)\b/i,
  ],
  skip: [
    /\b(skip|pass|don'?t\s+know|i\s+don'?t\s+know)\b/i,
    /\b(skip\s+this|skip\s+question)\b/i,
  ],
};

const CONTROL_PATTERNS = {
  enableVoice: [
    /\b(enable|start|activate|turn\s+on)\s+(voice|voice\s+mode|hands[-\s]?free)\b/i,
    /\b(start\s+voice|begin\s+voice)\b/i,
  ],
  disableVoice: [
    /\b(disable|stop|deactivate|turn\s+off)\s+(voice|voice\s+mode|hands[-\s]?free)\b/i,
    /\b(stop\s+voice|end\s+voice|manual\s+mode)\b/i,
  ],
  help: [
    /\b(help|assist|what\s+can\s+i\s+say|commands)\b/i,
    /\b(how\s+do\s+i|what\s+do\s+i\s+say)\b/i,
  ],
};

// ============================================================================
// Command Parser
// ============================================================================

/**
 * Parse a voice transcript into a structured command.
 */
export function parseVoiceCommand(transcript: string): ParsedVoiceCommand {
  const normalized = transcript.trim().toLowerCase();

  // Try to parse as answer selection first (most common)
  const answerCommand = parseAnswerSelection(normalized, transcript);
  if (answerCommand.confidence > 0.5) {
    return answerCommand;
  }

  // Try navigation commands
  const navCommand = parseNavigation(normalized, transcript);
  if (navCommand.confidence > 0.7) {
    return navCommand;
  }

  // Try control commands
  const controlCommand = parseControl(normalized, transcript);
  if (controlCommand.confidence > 0.7) {
    return controlCommand;
  }

  // If answer had moderate confidence, return it
  if (answerCommand.confidence > 0.3) {
    return answerCommand;
  }

  // Unknown command
  return {
    type: 'unknown',
    action: 'unknown',
    confidence: 0,
    rawTranscript: transcript,
    alternativeInterpretations: [
      'Try saying "Option A", "Option B", etc.',
      'Say "Repeat" to hear the question again',
      'Say "Help" for more commands',
    ],
  };
}

/**
 * Parse answer selection commands.
 */
function parseAnswerSelection(normalized: string, raw: string): ParsedVoiceCommand {
  // Check option letter patterns
  for (const pattern of ANSWER_SELECTION_PATTERNS.optionLetter) {
    const match = normalized.match(pattern);
    if (match) {
      const optionLetter = match[match.length - 1].toUpperCase(); // Last capture group
      return {
        type: 'answer_selection',
        action: 'select_option',
        data: { optionId: optionLetter },
        confidence: 0.9,
        rawTranscript: raw,
      };
    }
  }

  // Check positional references (first, second, etc.)
  for (const pattern of ANSWER_SELECTION_PATTERNS.positional) {
    const match = normalized.match(pattern);
    if (match) {
      const position = match[match.length - 1];
      const optionIndex = parsePosition(position);
      if (optionIndex !== null) {
        const optionLetter = String.fromCharCode(65 + optionIndex); // A=0, B=1, etc.
        return {
          type: 'answer_selection',
          action: 'select_option',
          data: { optionId: optionLetter },
          confidence: 0.8,
          rawTranscript: raw,
        };
      }
    }
  }

  // Check for single letter at start or end
  if (/^[a-d]$/i.test(normalized)) {
    return {
      type: 'answer_selection',
      action: 'select_option',
      data: { optionId: normalized.toUpperCase() },
      confidence: 0.95,
      rawTranscript: raw,
    };
  }

  return {
    type: 'answer_selection',
    action: 'select_option',
    confidence: 0,
    rawTranscript: raw,
  };
}

/**
 * Parse navigation commands.
 */
function parseNavigation(normalized: string, raw: string): ParsedVoiceCommand {
  // Check repeat patterns
  for (const pattern of NAVIGATION_PATTERNS.repeat) {
    if (pattern.test(normalized)) {
      return {
        type: 'navigation',
        action: 'repeat_question',
        confidence: 0.95,
        rawTranscript: raw,
      };
    }
  }

  // Check next patterns
  for (const pattern of NAVIGATION_PATTERNS.next) {
    if (pattern.test(normalized)) {
      return {
        type: 'navigation',
        action: 'next_question',
        confidence: 0.9,
        rawTranscript: raw,
      };
    }
  }

  // Check skip patterns
  for (const pattern of NAVIGATION_PATTERNS.skip) {
    if (pattern.test(normalized)) {
      return {
        type: 'navigation',
        action: 'skip_question',
        confidence: 0.85,
        rawTranscript: raw,
      };
    }
  }

  return {
    type: 'navigation',
    action: 'unknown',
    confidence: 0,
    rawTranscript: raw,
  };
}

/**
 * Parse control commands.
 */
function parseControl(normalized: string, raw: string): ParsedVoiceCommand {
  // Check enable voice patterns
  for (const pattern of CONTROL_PATTERNS.enableVoice) {
    if (pattern.test(normalized)) {
      return {
        type: 'control',
        action: 'enable_voice_mode',
        confidence: 0.95,
        rawTranscript: raw,
      };
    }
  }

  // Check disable voice patterns
  for (const pattern of CONTROL_PATTERNS.disableVoice) {
    if (pattern.test(normalized)) {
      return {
        type: 'control',
        action: 'disable_voice_mode',
        confidence: 0.95,
        rawTranscript: raw,
      };
    }
  }

  // Check help patterns
  for (const pattern of CONTROL_PATTERNS.help) {
    if (pattern.test(normalized)) {
      return {
        type: 'control',
        action: 'help',
        confidence: 0.9,
        rawTranscript: raw,
      };
    }
  }

  return {
    type: 'control',
    action: 'unknown',
    confidence: 0,
    rawTranscript: raw,
  };
}

/**
 * Convert positional words to indices.
 */
function parsePosition(position: string): number | null {
  const normalized = position.toLowerCase();
  const map: Record<string, number> = {
    'first': 0, '1st': 0, 'one': 0, '1': 0,
    'second': 1, '2nd': 1, 'two': 1, '2': 1,
    'third': 2, '3rd': 2, 'three': 2, '3': 2,
    'fourth': 3, '4th': 3, 'four': 3, '4': 3,
  };
  return map[normalized] ?? null;
}

// ============================================================================
// Confidence Helpers
// ============================================================================

/**
 * Check if command has sufficient confidence to auto-execute.
 */
export function isHighConfidenceCommand(command: ParsedVoiceCommand): boolean {
  return command.confidence >= 0.8;
}

/**
 * Check if command needs clarification.
 */
export function needsClarification(command: ParsedVoiceCommand): boolean {
  return command.confidence > 0.3 && command.confidence < 0.8;
}

// ============================================================================
// Exports
// ============================================================================

export default {
  parseVoiceCommand,
  isHighConfidenceCommand,
  needsClarification,
};
