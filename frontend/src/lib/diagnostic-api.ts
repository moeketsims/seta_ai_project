/**
 * API client for AI-powered diagnostic assessment system.
 *
 * Provides methods for:
 * - Generating diagnostic forms
 * - Starting/managing diagnostic sessions
 * - Navigating adaptive decision trees
 * - Retrieving diagnostic results
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// ============================================================================
// Type Definitions
// ============================================================================

export type MisconceptionSeverity = "low" | "medium" | "high" | "critical";
export type ProbeType = "quick_confirmer" | "error_model_probe" | "transfer_probe" | "prerequisite_check";
export type DOKLevel = "recall" | "skill_concept" | "strategic" | "extended";

export interface DiagnosticDistractor {
  option_id: string;
  value: string;
  misconception_tag: string;
  rationale: string;
  evidence_suggests: string;
  confidence_weight: number;
  next_probe_id?: string;
  teacher_note?: string;
}

export interface DiagnosticCorrectAnswer {
  option_id: string;
  value: string;
  reasoning: string;
  mastery_evidence: string;
}

export interface DiagnosticItem {
  item_id: string;
  caps_objective_id: string;
  grade_level: number;
  content_area: string;
  stem: string;
  context?: string;
  visual_aid_url?: string;
  dok_level: DOKLevel;
  estimated_time_seconds: number;
  reading_level?: number;
  correct_answer: DiagnosticCorrectAnswer;
  distractors: DiagnosticDistractor[];
  generated_at: string;
  validated: boolean;
  validation_notes?: string;
}

export interface DiagnosticProbe {
  probe_id: string;
  probe_type: ProbeType;
  parent_item_id: string;
  misconception_tag: string;
  stem: string;
  correct_answer: DiagnosticCorrectAnswer;
  distractors: DiagnosticDistractor[];
  confirms_misconception: boolean;
  scaffolding_hint?: string;
  micro_intervention_id?: string;
}

export interface DecisionEdge {
  from_node_id: string;
  option_selected: string;
  to_node_id?: string;
  misconception_tag?: string;
  confidence_delta: number;
}

export interface DiagnosticForm {
  form_id: string;
  title: string;
  caps_objective_id: string;
  grade_level: number;
  root_item_id: string;
  items: DiagnosticItem[];
  probes: DiagnosticProbe[];
  edges: DecisionEdge[];
  max_time_minutes: number;
  max_depth: number;
  created_at: string;
  created_by?: string;
  validated: boolean;
  pilot_approved: boolean;
  version: number;
}

export interface GenerateDiagnosticFormRequest {
  caps_objective_id: string;
  grade_level: number;
  content_area: string;
  max_items?: number;
  max_time_minutes?: number;
  include_visuals?: boolean;
  reading_level_max?: number;
  focus_misconceptions?: string[];
  avoid_contexts?: string[];
}

export interface GenerateDiagnosticFormResponse {
  form: DiagnosticForm;
  generation_metadata: Record<string, any>;
  warnings: string[];
}

export interface DiagnosticSessionState {
  session_id: string;
  learner_id: string;
  form_id: string;
  current_node_id: string;
  visited_nodes: string[];
  responses: Record<string, string>;
  suspected_misconceptions: Record<string, number>;
  confirmed_misconceptions: string[];
  started_at: string;
  completed_at?: string;
  total_time_seconds?: number;
}

export interface DiagnosticResult {
  session_id: string;
  learner_id: string;
  form_id: string;
  primary_misconception?: string;
  all_misconceptions: Record<string, number>;
  severity: MisconceptionSeverity;
  response_path: string[];
  key_evidence: string[];
  recommended_interventions: string[];
  teacher_summary: string;
  learner_feedback: string;
  completed_at: string;
  total_time_seconds: number;
  confidence_score: number;
}

export interface NextNodeRequest {
  session_id: string;
  response: string;
  time_spent_seconds: number;
}

export interface NextNodeResponse {
  session_id: string;
  terminal: boolean;
  next_node?: DiagnosticItem | DiagnosticProbe;
  result?: DiagnosticResult;
  progress: {
    nodes_visited: number;
    max_nodes?: number;
    completion: number;
    path_description?: string;
  };
}

// ============================================================================
// API Client Functions
// ============================================================================

/**
 * Generate a new diagnostic assessment form using AI.
 *
 * @param request - Form generation parameters
 * @returns Generated diagnostic form with items and decision tree
 */
export async function generateDiagnosticForm(
  request: GenerateDiagnosticFormRequest
): Promise<GenerateDiagnosticFormResponse> {
  const response = await fetch(`${API_BASE_URL}/diagnostic-ai/generate-diagnostic-form`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to generate diagnostic form");
  }

  return response.json();
}

/**
 * Start a new diagnostic assessment session for a learner.
 *
 * @param learnerId - ID of the learner
 * @param formId - ID of the diagnostic form to take
 * @returns Initial session state
 */
export async function startDiagnosticSession(
  learnerId: string,
  formId: string
): Promise<DiagnosticSessionState> {
  const response = await fetch(
    `${API_BASE_URL}/diagnostic-ai/diagnostic-session/start?learner_id=${learnerId}&form_id=${formId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to start diagnostic session");
  }

  return response.json();
}

/**
 * Submit learner's response and get the next item/probe.
 *
 * @param request - Contains session_id, selected option, time spent
 * @returns Next node to display OR final result if terminal
 */
export async function nextDiagnosticNode(
  request: NextNodeRequest
): Promise<NextNodeResponse> {
  const response = await fetch(`${API_BASE_URL}/diagnostic-ai/diagnostic-session/next`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to get next diagnostic node");
  }

  return response.json();
}

/**
 * Get current state of a diagnostic session.
 *
 * @param sessionId - Session ID
 * @returns Current session state
 */
export async function getDiagnosticSession(
  sessionId: string
): Promise<DiagnosticSessionState> {
  const response = await fetch(
    `${API_BASE_URL}/diagnostic-ai/diagnostic-session/${sessionId}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to get diagnostic session");
  }

  return response.json();
}

/**
 * Get final diagnostic result for a completed session.
 *
 * @param sessionId - Session ID
 * @returns Diagnostic result with findings and recommendations
 */
export async function getDiagnosticResult(
  sessionId: string
): Promise<DiagnosticResult> {
  const response = await fetch(
    `${API_BASE_URL}/diagnostic-ai/diagnostic-result/${sessionId}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to get diagnostic result");
  }

  return response.json();
}

/**
 * Get all diagnostic results for a specific learner.
 *
 * @param learnerId - Learner ID
 * @param limit - Maximum number of results (default 10)
 * @returns List of diagnostic results, most recent first
 */
export async function getLearnerDiagnosticResults(
  learnerId: string,
  limit: number = 10
): Promise<DiagnosticResult[]> {
  const response = await fetch(
    `${API_BASE_URL}/diagnostic-ai/learner/${learnerId}/diagnostic-results?limit=${limit}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to get learner diagnostic results");
  }

  return response.json();
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format a diagnostic item/probe for display in the UI.
 *
 * @param node - Diagnostic item or probe
 * @returns Formatted node for rendering
 */
export function formatDiagnosticNode(node: DiagnosticItem | DiagnosticProbe) {
  const allOptions = [
    { id: node.correct_answer.option_id, text: node.correct_answer.value, correct: true },
    ...node.distractors.map((d) => ({ id: d.option_id, text: d.value, correct: false })),
  ];

  // Shuffle options (in production, seed shuffle for consistency)
  const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);

  return {
    stem: node.stem,
    context: "context" in node ? node.context : undefined,
    visualAidUrl: "visual_aid_url" in node ? node.visual_aid_url : undefined,
    options: shuffledOptions,
    estimatedTimeSeconds: "estimated_time_seconds" in node ? node.estimated_time_seconds : 45,
  };
}

/**
 * Calculate progress percentage for a diagnostic session.
 *
 * @param progress - Progress object from NextNodeResponse
 * @returns Progress percentage (0-100)
 */
export function calculateProgressPercentage(
  progress: NextNodeResponse["progress"]
): number {
  return Math.round(progress.completion * 100);
}

/**
 * Format misconception confidence as percentage.
 *
 * @param confidence - Confidence score (0-1)
 * @returns Formatted percentage string
 */
export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

/**
 * Get severity badge color for UI.
 *
 * @param severity - Misconception severity level
 * @returns Tailwind color class
 */
export function getSeverityColor(severity: MisconceptionSeverity): string {
  const colors = {
    low: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950",
    medium: "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950",
    high: "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950",
    critical: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950",
  };

  return colors[severity];
}
