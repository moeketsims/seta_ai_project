import type { NarrationPayload } from './narration';

export type HealthResponse = {
  status: 'ok';
  timestamp: string;
};

// AI API Types
export type EvaluateAnswerRequest = {
  question_id?: string;
  question_content: string;
  correct_answer: string;
  learner_answer: string;
  question_type?: string;
  max_score?: number;
  grade?: number;
  show_work?: string;
  learner_id?: string;
};

export type EvaluationResponse = {
  question_id?: string;
  learner_id?: string;
  is_correct: boolean;
  score: number;
  max_score: number;
  percentage: number;
  feedback: string;
  partial_credit: boolean;
  equivalent_answer: boolean;
  error_type?: string;
  methodology_correct?: boolean;
  strengths?: string[];
  improvements?: string[];
  misconception_detected?: string;
  requires_teacher_review: boolean;
  ai_evaluation: {
    used: boolean;
    cost?: number;
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
  timestamp: string;
};

export type DetectMisconceptionRequest = {
  question_id?: string;
  question_content: string;
  correct_answer: string;
  learner_answer: string;
  question_type?: string;
  grade?: number;
  show_work?: string;
  topic?: string;
  learner_id?: string;
};

export type MisconceptionResponse = {
  detected: boolean;
  misconception_id?: string;
  misconception?: {
    name: string;
    description: string;
    category: string;
    severity: string;
    example_errors: string[];
    detection_patterns: string[];
  };
  confidence: number;
  in_taxonomy: boolean;
  remediation?: {
    strategy: string;
    prerequisite_skills: string[];
    estimated_time_weeks: number;
  };
  ai_analysis?: {
    error_pattern?: string;
    alternative_explanations?: string[];
    cost?: number;
    usage?: any;
  };
  message?: string;
  error?: string;
  timestamp: string;
};

export type CreatePathwayRequest = {
  learner_id: string;
  current_skills: string[];
  target_skills: string[];
  grade: number;
  diagnostic_results?: any;
  misconceptions?: any[];
  timeframe_weeks?: number;
  learning_style?: string;
};

export type PathwayResponse = {
  pathway_id: string;
  learner_id: string;
  name: string;
  description: string;
  duration_weeks: number;
  difficulty_progression: string;
  steps: Array<{
    week: number;
    skill: string;
    description: string;
    activities: Array<{
      type: string;
      title: string;
      description: string;
      duration_minutes: number;
    }>;
    misconceptions_addressed: string[];
    success_criteria: string;
    estimated_hours: number;
  }>;
  prerequisites: string[];
  milestones: Array<{
    week: number;
    title: string;
    criteria: string;
  }>;
  created_at: string;
  status: string;
  progress: number;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export async function fetchHealth(): Promise<HealthResponse> {
  if (BASE_URL) {
    try {
      return await get<HealthResponse>('/health');
    } catch (error) {
      console.warn('Primary health check request failed, falling back to Next API route.', error);
    }
  }

  const response = await fetch('/api/health', { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Fallback health check failed: ${response.status}`);
  }

  return response.json() as Promise<HealthResponse>;
}

export async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function post<T>(path: string, data: any): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

// AI API Functions
export async function evaluateAnswer(request: EvaluateAnswerRequest): Promise<EvaluationResponse> {
  return post<EvaluationResponse>('/api/v1/ai/evaluate-answer', request);
}

export async function detectMisconception(request: DetectMisconceptionRequest): Promise<MisconceptionResponse> {
  return post<MisconceptionResponse>('/api/v1/ai/detect-misconception', request);
}

export async function createPathway(request: CreatePathwayRequest): Promise<PathwayResponse> {
  return post<PathwayResponse>('/api/v1/ai/create-pathway', request);
}

export async function getAIFeatures() {
  return get<any>('/api/v1/ai/features');
}

export async function getAIStatus() {
  return get<any>('/api/v1/ai/status');
}

export type GenerateNarrationResponse = {
  transcript: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  cost?: number;
  model: string;
  timestamp: string;
};

export async function generateNarration(payload: NarrationPayload): Promise<GenerateNarrationResponse> {
  return post<GenerateNarrationResponse>('/api/v1/ai/dashboard-narration', payload);
}

export type NarrationChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type NarrationChatResponse = {
  answer: string;
  usage?: GenerateNarrationResponse['usage'];
  cost?: number;
  model: string;
  timestamp: string;
};

export async function chatNarration(
  payload: NarrationPayload,
  question: string,
  history: NarrationChatMessage[]
): Promise<NarrationChatResponse> {
  return post<NarrationChatResponse>('/api/v1/ai/dashboard-narration/chat', {
    payload,
    question,
    history,
  });
}

// Diagnostic AI Types
export type DiagnosticRequest = {
  question_content: string;
  correct_answer: string;
  learner_answer: string;
  question_type: string;
  grade: number;
  topic: string;
  show_work?: string;
  learner_history?: Array<{
    topic: string;
    score: number;
    error_pattern?: string;
  }>;
};

export type DiagnosticResponse = {
  error_pattern: string;
  learner_reasoning_hypothesis: string;
  misconception_identified: {
    name: string;
    description: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    confidence: number;
  };
  prerequisite_gaps: Array<{
    skill: string;
    importance: 'HIGH' | 'MEDIUM' | 'LOW';
    CAPS_strand: string;
  }>;
  root_cause_analysis: {
    category: 'CONCEPTUAL' | 'PROCEDURAL' | 'FOUNDATIONAL';
    explanation: string;
    evidence: string;
  };
  intervention_strategies: Array<{
    strategy_type: 'CONCRETE_MANIPULATIVES' | 'VISUAL_MODELS' | 'WORKED_EXAMPLES' | 'PEER_TEACHING' | 'ONE_ON_ONE';
    description: string;
    duration_minutes: number;
    success_likelihood: number;
    resources_needed: string[];
    teaching_points: string[];
  }>;
  personalized_talking_points: string[];
  similar_learners_pattern: string;
  progression_pathway: Array<{
    step: number;
    milestone: string;
    estimated_days: number;
  }>;
  red_flags: string[];
  quick_win_opportunity: string;
  ai_analysis: {
    cost: number;
    usage: any;
    timestamp: string;
  };
};

export type DashboardInsightsRequest = {
  dashboard_data: {
    total_learners: number;
    avg_performance: number;
    at_risk_count: number;
    at_risk_percent: number;
    struggling_topics: string[];
    last_assessment_date: string;
    completion_rate: number;
    engagement_trend: string;
  };
};

export type DashboardInsightsResponse = {
  urgent_alerts: Array<{
    type: 'AT_RISK_LEARNER' | 'CLASS_PATTERN' | 'MISCONCEPTION_SPIKE' | 'ENGAGEMENT_DROP';
    message: string;
    learners_affected: string[];
    recommended_action: string;
    urgency: 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH';
    impact_if_ignored: string;
  }>;
  positive_highlights: Array<{
    message: string;
    evidence: string;
  }>;
  pattern_observations: Array<{
    pattern: string;
    interpretation: string;
    suggested_investigation: string;
  }>;
  quick_wins: Array<{
    action: string;
    estimated_time: string;
    expected_outcome: string;
  }>;
  predictive_warnings: Array<{
    prediction: string;
    probability: number;
    prevention_strategy: string;
  }>;
  ai_analysis: {
    cost: number;
    usage: any;
    timestamp: string;
    generated_at: string;
  };
};

// Diagnostic AI Functions
export async function diagnoseError(request: DiagnosticRequest): Promise<DiagnosticResponse> {
  return post<DiagnosticResponse>('/api/v1/ai/diagnose-error', request);
}

export async function getDashboardInsights(request: DashboardInsightsRequest): Promise<DashboardInsightsResponse> {
  return post<DashboardInsightsResponse>('/api/v1/ai/dashboard-insights', request);
}

// ============================================================================
// Analytics API Functions
// ============================================================================

export async function getAnalyticsMetrics(teacherId: string) {
  return get<any>(`/api/v1/analytics/metrics?teacher_id=${teacherId}`);
}

export async function getPerformanceTrend(classId?: string, teacherId?: string) {
  const params = new URLSearchParams();
  if (classId) params.append('class_id', classId);
  if (teacherId) params.append('teacher_id', teacherId);
  return get<any>(`/api/v1/analytics/performance-trend?${params.toString()}`);
}

export async function getSkillMastery(classId?: string, teacherId?: string) {
  const params = new URLSearchParams();
  if (classId) params.append('class_id', classId);
  if (teacherId) params.append('teacher_id', teacherId);
  return get<any>(`/api/v1/analytics/skill-mastery?${params.toString()}`);
}

export async function getMisconceptionFrequency(classId?: string, teacherId?: string) {
  const params = new URLSearchParams();
  if (classId) params.append('class_id', classId);
  if (teacherId) params.append('teacher_id', teacherId);
  return get<any>(`/api/v1/analytics/misconception-frequency?${params.toString()}`);
}

export async function getLearnerDistribution(classId?: string, teacherId?: string) {
  const params = new URLSearchParams();
  if (classId) params.append('class_id', classId);
  if (teacherId) params.append('teacher_id', teacherId);
  return get<any>(`/api/v1/analytics/learner-distribution?${params.toString()}`);
}

export async function getSkillHeatmap(classId?: string, teacherId?: string) {
  const params = new URLSearchParams();
  if (classId) params.append('class_id', classId);
  if (teacherId) params.append('teacher_id', teacherId);
  return get<any>(`/api/v1/analytics/skill-heatmap?${params.toString()}`);
}

// ============================================================================
// Learner Management API Functions
// ============================================================================

export async function getLearners() {
  return get<any>('/api/v1/learners/');
}

export async function getLearner(learnerId: string) {
  return get<any>(`/api/v1/learners/${learnerId}`);
}

export async function getLearnerSkills(learnerId: string) {
  return get<any>(`/api/v1/learners/${learnerId}/skills`);
}

// ============================================================================
// Assessment API Functions
// ============================================================================

export async function getAssessments() {
  return get<any>('/api/v1/assessments/');
}

export async function getAssessment(assessmentId: string) {
  return get<any>(`/api/v1/assessments/${assessmentId}`);
}

export async function getAllQuestions() {
  return get<any>('/api/v1/assessments/questions/all');
}

export async function getQuestion(questionId: string) {
  return get<any>(`/api/v1/assessments/questions/${questionId}`);
}

// ============================================================================
// Diagnostic API Functions
// ============================================================================

export async function getAtRiskLearners() {
  return get<any>('/api/v1/diagnostic/at-risk');
}

export async function getWeeklyDiagnostic(assessmentId: string) {
  return get<any>(`/api/v1/diagnostic/weekly/${assessmentId}`);
}

export async function getLearnerDiagnosticResults(learnerId: string) {
  return get<any>(`/api/v1/diagnostic-ai/learner/${learnerId}/diagnostic-results`);
}

// ============================================================================
// Misconception API Functions
// ============================================================================

export async function getMisconceptions() {
  return get<any>('/api/v1/misconceptions/');
}

export async function analyzeClassMisconceptions(request: any) {
  return post<any>('/api/v1/ai/class-misconceptions', request);
}

// ============================================================================
// Intervention API Functions
// ============================================================================

export async function getInterventions() {
  return get<any>('/api/v1/interventions/');
}

export async function predictIntervention(request: any) {
  return post<any>('/api/v1/ai/predict-intervention', request);
}

// ============================================================================
// Skills & Pathways API Functions
// ============================================================================

export async function getSkills() {
  return get<any>('/api/v1/skills/');
}

export async function getPathway(pathwayId: string) {
  return get<any>(`/api/v1/skills/pathway/${pathwayId}`);
}

// ============================================================================
// AI Analysis API Functions
// ============================================================================

export async function analyzeClassPatterns(request: any) {
  return post<any>('/api/v1/ai/analyze-class-patterns', request);
}
