// User Types
export type UserRole = 'teacher' | 'learner' | 'admin' | 'parent';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
}

export interface Teacher extends User {
  role: 'teacher';
  subjects: string[];
  classes: string[];
  schoolId: string;
}

export interface Learner extends User {
  role: 'learner';
  grade: number;
  classId: string;
  enrollmentDate: Date;
  parentId?: string;
}

// School & Class Types
export interface School {
  id: string;
  name: string;
  province: string;
  district: string;
  type: 'primary' | 'secondary' | 'combined';
}

export interface Class {
  id: string;
  name: string;
  grade: number;
  teacherId: string;
  learnerIds: string[];
  schoolId: string;
  subject: 'mathematics';
}

// Curriculum Types
export type MathematicsStrand =
  | 'Numbers, Operations and Relationships'
  | 'Patterns, Functions and Algebra'
  | 'Space and Shape (Geometry)'
  | 'Measurement'
  | 'Data Handling';

export interface CurriculumTopic {
  id: string;
  name: string;
  description: string;
  grade: number;
  strand: MathematicsStrand;
  skills: Skill[];
  learningOutcomes: string[];
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  topicId: string;
  prerequisites: string[]; // skill IDs
  difficulty: 1 | 2 | 3 | 4 | 5;
  bloomsLevel: 'knowledge' | 'comprehension' | 'application' | 'analysis' | 'synthesis' | 'evaluation';
}

// Assessment Types
export type QuestionType =
  | 'multiple_choice'
  | 'multiple_response'
  | 'numeric'
  | 'fill_blank'
  | 'true_false'
  | 'word_problem';

export type RepresentationRequirement = 'diagram' | 'manipulative' | 'storyContext';

export interface Question {
  id: string;
  type: QuestionType;
  content: string; // Can include LaTeX
  options?: string[]; // For MCQ
  correctAnswer: string | string[]; // Array for multiple response
  explanation: string;
  marks: number;
  skillIds: string[];
  misconceptionIds: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  imageUrl?: string;
  bloomsLevel: Skill['bloomsLevel'];
  representations?: RepresentationRequirement[];
}

export type AssessmentType = 'diagnostic' | 'formative' | 'summative' | 'weekly_diagnostic';

export interface Assessment {
  id: string;
  title: string;
  description: string;
  type: AssessmentType;
  grade: number;
  topics: string[]; // topic IDs
  questions: Question[];
  duration: number; // minutes
  totalMarks: number;
  createdBy: string; // teacher ID
  createdAt: Date;
  published: boolean;
}

// Assessment Session & Response Types
export type SessionStatus = 'not_started' | 'in_progress' | 'submitted';

export interface AssessmentSession {
  id: string;
  assessmentId: string;
  learnerId: string;
  startTime: Date;
  endTime?: Date;
  status: SessionStatus;
  responses: AssessmentResponse[];
  score?: number;
  percentage?: number;
}

export interface AssessmentResponse {
  questionId: string;
  answer: string | string[];
  isCorrect: boolean;
  timeSpent: number; // seconds
  flagged: boolean;
  confidence?: 1 | 2 | 3 | 4 | 5; // Optional confidence rating
  detectedMisconceptions?: string[]; // misconception IDs
}

// Misconception Types
export type MisconceptionSeverity = 'low' | 'medium' | 'high' | 'critical';
export type MisconceptionStatus = 'active' | 'resolved' | 'persistent';

export interface Misconception {
  id: string;
  code: string; // e.g., "MISC-001"
  name: string;
  description: string;
  category: MathematicsStrand;
  affectedGrades: number[];
  severity: MisconceptionSeverity;
  manifestations: string[]; // How it appears in answers
  rootCause: string;
  detectionPatterns: string[];
  remediationStrategies: RemediationStrategy[];
  relatedSkillIds: string[];
}

export interface RemediationStrategy {
  title: string;
  description: string;
  type: 'concrete' | 'visual' | 'worked_example' | 'practice' | 'real_world';
  resources: string[];
  estimatedDuration: number; // minutes
}

export interface LearnerMisconception {
  id: string;
  learnerId: string;
  misconceptionId: string;
  firstDetected: Date;
  lastDetected: Date;
  occurrences: number;
  status: MisconceptionStatus;
  confidenceScore: number; // 0-100
  evidenceExamples: string[]; // Question IDs where detected
}

// Learning Pathway Types
export type PathwayNodeType = 'lesson' | 'practice' | 'assessment' | 'game' | 'video';
export type NodeStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export interface LearningPathway {
  id: string;
  learnerId: string;
  generatedAt: Date;
  targetGoals: string[];
  estimatedDuration: number; // days
  progress: number; // 0-100
  nodes: PathwayNode[];
  adaptations: PathwayAdaptation[];
}

export interface PathwayNode {
  id: string;
  type: PathwayNodeType;
  title: string;
  description: string;
  resourceId: string;
  prerequisites: string[]; // node IDs
  estimatedTime: number; // minutes
  difficulty: 1 | 2 | 3 | 4 | 5;
  status: NodeStatus;
  completedAt?: Date;
  performanceScore?: number;
  skillIds: string[];
}

export interface PathwayAdaptation {
  timestamp: Date;
  reason: string;
  changes: string[];
  triggeredBy: 'performance' | 'misconception' | 'teacher' | 'system';
}

// Analytics Types
export interface LearnerProfile {
  learnerId: string;
  currentLevel: number;
  xp: number;
  skillMastery: SkillMastery[];
  strengths: string[]; // skill IDs
  weaknesses: string[]; // skill IDs
  learningPace: 'fast' | 'moderate' | 'slow';
  engagementScore: number; // 0-100
  riskScore: 'low' | 'medium' | 'high';
  totalTimeSpent: number; // minutes
  streakDays: number;
  lastActive: Date;
}

export interface SkillMastery {
  skillId: string;
  masteryLevel: number; // 0-100
  attempts: number;
  lastPracticed: Date;
  trend: 'improving' | 'stable' | 'declining';
}

// Analytics Dashboard Types
export interface MetricCard {
  label: string;
  value: string | number;
  change?: {
    value: number;
    direction: 'up' | 'down';
    isPositive: boolean;
  };
  icon?: string;
  color?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
}

// Intervention Types
export type InterventionType = 'one_on_one' | 'small_group' | 'whole_class' | 'parent_communication';
export type InterventionStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

export interface Intervention {
  id: string;
  type: InterventionType;
  title: string;
  description: string;
  misconceptionIds: string[];
  learnerIds: string[];
  teacherId: string;
  scheduledDate: Date;
  duration: number; // minutes
  status: InterventionStatus;
  strategies: RemediationStrategy[];
  resources: string[];
  notes: string;
  effectiveness?: number; // 0-100, measured after completion
}

// Resource Types
export type ResourceType = 'video' | 'exercise' | 'game' | 'worksheet' | 'explanation' | 'worked_example';

export interface Resource {
  id: string;
  type: ResourceType;
  title: string;
  description: string;
  grade: number;
  topicIds: string[];
  skillIds: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimatedDuration: number; // minutes
  format: 'interactive' | 'passive' | 'printable';
  url?: string;
  thumbnailUrl?: string;
  qualityRating: number; // 0-5
  usageCount: number;
  tags: string[];
}

// Notification Types
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  read: boolean;
  createdAt: Date;
}

// Achievement/Gamification Types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  category: 'skill' | 'streak' | 'speed' | 'challenge' | 'milestone';
  requirement: number;
  xpReward: number;
  unlockedBy: string[]; // learner IDs
}

export interface LearnerAchievement {
  learnerId: string;
  achievementId: string;
  unlockedAt: Date;
  progress: number; // 0-100 for partially completed achievements
}

// Report Types
export type ReportType = 'learner' | 'class' | 'parent' | 'admin';

export interface Report {
  id: string;
  type: ReportType;
  title: string;
  generatedAt: Date;
  generatedBy: string; // user ID
  targetId: string; // learner/class ID
  dateRange: {
    from: Date;
    to: Date;
  };
  sections: ReportSection[];
}

export interface ReportSection {
  title: string;
  content: any; // Can be text, charts, tables, etc.
  order: number;
}














