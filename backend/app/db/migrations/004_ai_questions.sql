-- Migration: AI-Generated Questions System
-- Description: Tables for storing AI-generated CAPS-compliant questions and misconceptions
-- Date: 2025-01-29

-- Table 1: AI-Generated Questions
CREATE TABLE IF NOT EXISTS ai_generated_questions (
    id TEXT PRIMARY KEY,
    item_id TEXT UNIQUE NOT NULL,
    stem TEXT NOT NULL,
    correct_answer_option TEXT NOT NULL,
    correct_answer_value TEXT NOT NULL,
    correct_answer_reasoning TEXT,
    distractors TEXT NOT NULL,  -- JSON array of distractor objects
    grade_level INTEGER DEFAULT 4,
    caps_topic TEXT DEFAULT 'Numbers, Operations & Relationships',
    caps_objective TEXT,  -- Specific CAPS objective code (e.g., CAPS-G4-NUM-02)
    difficulty_level TEXT CHECK(difficulty_level IN ('easy', 'medium', 'hard')),
    prerequisite_skills TEXT,  -- JSON array of prerequisite skill codes
    estimated_time_seconds INTEGER DEFAULT 45,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    generated_by TEXT DEFAULT 'openai-gpt4',
    validated BOOLEAN DEFAULT FALSE,
    validation_notes TEXT,
    usage_count INTEGER DEFAULT 0,
    success_rate FLOAT DEFAULT NULL,  -- Percentage of learners who answer correctly
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: AI-Generated Misconceptions
CREATE TABLE IF NOT EXISTS ai_generated_misconceptions (
    id TEXT PRIMARY KEY,
    misconception_tag TEXT UNIQUE NOT NULL,
    question_id TEXT NOT NULL,
    description TEXT NOT NULL,
    distractor_option TEXT NOT NULL,  -- Which option (A, B, C, D) reveals this misconception
    rationale TEXT NOT NULL,  -- Why learner might select this
    confidence_weight FLOAT DEFAULT 0.5,  -- How much to increase misconception confidence
    remediation_strategy TEXT,  -- What teacher should do
    grade_level INTEGER DEFAULT 4,
    caps_topic TEXT DEFAULT 'Numbers, Operations & Relationships',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES ai_generated_questions(id) ON DELETE CASCADE
);

-- Table 3: Adaptive Decision Tree
CREATE TABLE IF NOT EXISTS adaptive_decision_tree (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    form_id TEXT NOT NULL,
    from_node_id TEXT NOT NULL,  -- Source question ID
    option_selected TEXT NOT NULL,  -- A, B, C, or D
    to_node_id TEXT,  -- Next question ID (NULL if terminal)
    misconception_tag TEXT,  -- Misconception revealed by this choice
    confidence_delta FLOAT DEFAULT 0.0,  -- How much to adjust misconception confidence
    difficulty_progression TEXT CHECK(difficulty_progression IN ('increase', 'maintain', 'decrease', 'terminal')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_questions_difficulty ON ai_generated_questions(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_ai_questions_grade ON ai_generated_questions(grade_level);
CREATE INDEX IF NOT EXISTS idx_ai_questions_validated ON ai_generated_questions(validated);
CREATE INDEX IF NOT EXISTS idx_ai_questions_caps_topic ON ai_generated_questions(caps_topic);

CREATE INDEX IF NOT EXISTS idx_ai_misconceptions_tag ON ai_generated_misconceptions(misconception_tag);
CREATE INDEX IF NOT EXISTS idx_ai_misconceptions_question ON ai_generated_misconceptions(question_id);

CREATE INDEX IF NOT EXISTS idx_decision_tree_form ON adaptive_decision_tree(form_id);
CREATE INDEX IF NOT EXISTS idx_decision_tree_from_node ON adaptive_decision_tree(from_node_id);

-- View: Questions with misconception count
CREATE VIEW IF NOT EXISTS ai_questions_summary AS
SELECT
    q.id,
    q.item_id,
    q.stem,
    q.difficulty_level,
    q.validated,
    q.usage_count,
    q.success_rate,
    COUNT(m.id) as misconception_count
FROM ai_generated_questions q
LEFT JOIN ai_generated_misconceptions m ON q.id = m.question_id
GROUP BY q.id;
