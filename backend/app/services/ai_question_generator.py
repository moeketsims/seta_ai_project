"""
AI-Powered CAPS-Compliant Question Generator

Generates adaptive diagnostic mathematics questions for South African Grade 4 learners
using OpenAI GPT-4, ensuring compliance with CAPS curriculum standards.

Features:
- CAPS Grade 4 "Numbers, Operations & Relationships" questions
- Adaptive difficulty levels (easy, medium, hard)
- Misconception-targeted distractors
- South African cultural context
- Age-appropriate language (9-10 years old)
- Validation and quality checks
"""

import json
import os
import uuid
from typing import List, Dict, Tuple, Optional
from datetime import datetime
import openai
from sqlalchemy.orm import Session

# OpenAI client
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ============================================================================
# CAPS Grade 4 Curriculum Specification
# ============================================================================

CAPS_GRADE4_CURRICULUM = """
**CAPS GRADE 4: Numbers, Operations & Relationships**

NUMBER RANGE:
- Whole numbers: 0 to 10,000
- Counting: in 1s, 2s, 3s, 5s, 10s, 25s, 50s, 100s
- Place value: thousands, hundreds, tens, ones

OPERATIONS:
1. **Addition & Subtraction**
   - Add and subtract numbers with at least 4 digits
   - Use appropriate strategies (column method, breaking down, compensation)
   - With and without regrouping/borrowing
   - Check calculations using inverse operations

2. **Multiplication**
   - Multiply 2-digit by 1-digit numbers
   - Progress to 3-digit by 1-digit numbers
   - Multiples up to 10 × 10
   - Use strategies: repeated addition, arrays, doubling

3. **Division**
   - Divide 2-digit by 1-digit numbers
   - Remainders expressed as whole numbers
   - Relate to multiplication (inverse)

SKILLS:
- Number comparison (>, <, =)
- Ordering numbers
- Rounding to nearest 5, 10, 100
- Problem-solving in context
- Number patterns and sequences

COMMON MISCONCEPTIONS:
- Place value errors (treating digits independently)
- Regrouping/borrowing mistakes
- Adding instead of multiplying in word problems
- Ignoring remainders in division
- Confusion with zero in operations
"""

# ============================================================================
# OpenAI Prompts
# ============================================================================

SYSTEM_PROMPT = f"""You are a South African CAPS curriculum specialist and experienced Grade 4 mathematics teacher.

**YOUR ROLE:**
Generate diagnostic assessment questions that:
1. Comply EXACTLY with CAPS Grade 4 curriculum standards
2. Use age-appropriate language for 9-10 year old learners
3. Include South African cultural context (names, currency, scenarios)
4. Reveal specific mathematical misconceptions through carefully designed distractors
5. Provide actionable remediation strategies for teachers

**CAPS CURRICULUM REQUIREMENTS:**
{CAPS_GRADE4_CURRICULUM}

**SOUTH AFRICAN CONTEXT:**
- Currency: South African Rand (R)
- Names: Common South African names (Thabo, Lerato, Sipho, Zanele, Ayanda, etc.)
- Scenarios: Local context (tuck shop, taxi rides, school fundraiser, sports day)
- Language: Simple English with culturally familiar examples

**QUESTION QUALITY STANDARDS:**
- Stem: One clear question, 10-25 words, no ambiguity
- Numbers: Within CAPS Grade 4 range (up to 10,000)
- Distractors: Each reveals a SPECIFIC misconception (not random wrong answers)
- Remediation: Concrete teaching strategies with manipulatives/visuals
- Difficulty: Matches specified level (easy/medium/hard)

**DIFFICULTY DEFINITIONS:**
- **Easy**: 2-digit numbers, no regrouping, basic operations, straightforward context
- **Medium**: 3-digit numbers, regrouping required, multi-step thinking
- **Hard**: 4-digit numbers, complex regrouping, abstract problem-solving

**MISCONCEPTION TAG FORMAT:**
- Addition: ADD-G4-001, ADD-G4-002, etc.
- Subtraction: SUB-G4-001, SUB-G4-002, etc.
- Multiplication: MUL-G4-001, MUL-G4-002, etc.
- Division: DIV-G4-001, DIV-G4-002, etc.
- Place Value: PV-G4-001, PV-G4-002, etc.

**OUTPUT FORMAT: JSON only, no markdown, no explanations**
"""

def get_user_prompt(count: int, difficulty_distribution: Dict[str, int]) -> str:
    """Generate user prompt for OpenAI."""
    return f"""Generate {count} unique CAPS-compliant Grade 4 mathematics questions:

**DISTRIBUTION:**
- Easy: {difficulty_distribution['easy']} questions
- Medium: {difficulty_distribution['medium']} questions
- Hard: {difficulty_distribution['hard']} questions

**VARIETY REQUIREMENTS:**
- Mix of: addition, subtraction, multiplication, division problems
- Mix of: word problems, number sentences, comparison questions
- Use different South African names/contexts for each question
- Ensure progressive complexity within each difficulty level

**EACH QUESTION MUST INCLUDE:**
1. Unique item_id (format: AI-G4-XXX where XXX is sequential)
2. Clear stem (question text)
3. ONE correct answer with:
   - option_id (A)
   - value (the correct answer)
   - reasoning (why it's correct, using CAPS methods)
4. THREE distractors (B, C, D) with:
   - option_id
   - value (the incorrect answer)
   - misconception_tag (unique, format: TYPE-G4-XXX)
   - rationale (why learner might choose this)
   - confidence_weight (0.3 to 0.8, how strongly it indicates misconception)
   - remediation (concrete teaching strategy)
5. caps_objective (e.g., "CAPS-G4-NUM-02: Addition with regrouping")
6. prerequisite_skills (array of required skills)
7. estimated_time_seconds (30-60 seconds)

**OUTPUT FORMAT (JSON OBJECT WITH "questions" ARRAY):**
{{
  "questions": [
    {{
      "item_id": "AI-G4-001",
      "stem": "Thabo has 345 marbles. He gives 178 to his sister. How many marbles does he have left?",
      "difficulty_level": "medium",
      "correct_answer": {{
        "option_id": "A",
        "value": "167",
        "reasoning": "Subtract using column method with regrouping: 345 - 178 = 167"
      }},
      "distractors": [
        {{
          "option_id": "B",
          "value": "177",
          "misconception_tag": "SUB-G4-001",
          "rationale": "Failed to regroup from hundreds when subtracting tens",
          "confidence_weight": 0.7,
          "remediation": "Use base-10 blocks to visualize regrouping from hundreds to tens"
        }},
        {{
          "option_id": "C",
          "value": "523",
          "misconception_tag": "SUB-G4-002",
          "rationale": "Added instead of subtracted",
          "confidence_weight": 0.8,
          "remediation": "Review operation keywords: 'gives away' means subtract, 'gets' means add"
        }},
        {{
          "option_id": "D",
          "value": "233",
          "misconception_tag": "SUB-G4-003",
          "rationale": "Subtracted smaller from larger digit in each place value position (8-5, 7-4, 3-1)",
          "confidence_weight": 0.6,
          "remediation": "Practice consistent subtraction direction: always subtract bottom from top in column method"
        }}
      ],
      "caps_objective": "CAPS-G4-NUM-03: Subtraction with regrouping up to 10,000",
      "prerequisite_skills": ["subtraction-2digit", "place-value-hundreds", "regrouping-concept"],
      "estimated_time_seconds": 45
    }},
    ... (repeat for all {count} questions)
  ]
}}

**CRITICAL:
1. You MUST generate exactly {count} complete questions
2. Each question MUST be unique with different numbers, names, and contexts
3. Return as JSON object with "questions" array containing all {count} questions
4. No markdown code blocks, no explanations, just pure JSON**
"""

# ============================================================================
# AI Question Generation
# ============================================================================

async def generate_caps_grade4_questions(
    count: int = 20,
    difficulty_distribution: Optional[Dict[str, int]] = None
) -> List[Dict]:
    """
    Generate CAPS-compliant Grade 4 questions using OpenAI GPT-4.

    Generates questions in batches of 5 to fit within token limits.

    Args:
        count: Total number of questions to generate
        difficulty_distribution: Dict with 'easy', 'medium', 'hard' counts

    Returns:
        List of question dictionaries

    Raises:
        ValueError: If OpenAI API key not set or generation fails
    """
    if not os.getenv("OPENAI_API_KEY"):
        raise ValueError("OPENAI_API_KEY environment variable not set")

    if difficulty_distribution is None:
        # Default distribution: 35% easy, 45% medium, 20% hard
        difficulty_distribution = {
            "easy": int(count * 0.35),
            "medium": int(count * 0.45),
            "hard": count - int(count * 0.35) - int(count * 0.45)
        }

    print(f"🤖 Generating {count} CAPS Grade 4 questions via OpenAI...")
    print(f"   Distribution: {difficulty_distribution}")
    print(f"   Strategy: Batching 5 questions per API call")
    print()

    all_questions = []
    batch_size = 5
    batches = (count + batch_size - 1) // batch_size  # Ceiling division

    for batch_idx in range(batches):
        batch_start = batch_idx * batch_size
        batch_count = min(batch_size, count - batch_start)

        # Calculate distribution for this batch
        batch_dist = {
            "easy": min(difficulty_distribution["easy"] - sum(1 for q in all_questions if q.get("difficulty_level") == "easy"), batch_count),
            "medium": 0,
            "hard": 0
        }
        batch_dist["medium"] = min(difficulty_distribution["medium"] - sum(1 for q in all_questions if q.get("difficulty_level") == "medium"), batch_count - batch_dist["easy"])
        batch_dist["hard"] = batch_count - batch_dist["easy"] - batch_dist["medium"]

        print(f"📦 Batch {batch_idx + 1}/{batches}: Generating {batch_count} questions ({batch_dist})...")

        try:
            response = client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": get_user_prompt(batch_count, batch_dist)}
                ],
                temperature=0.8,
                max_tokens=4000,
                response_format={"type": "json_object"}
            )

            content = response.choices[0].message.content

            # Parse JSON response
            try:
                data = json.loads(content)

                if isinstance(data, dict) and "questions" in data:
                    questions = data["questions"]
                elif isinstance(data, list):
                    questions = data
                elif isinstance(data, dict) and "item_id" in data:
                    questions = [data]
                else:
                    first_val = list(data.values())[0] if data else []
                    if isinstance(first_val, list):
                        questions = first_val
                    elif isinstance(first_val, dict):
                        questions = [first_val]
                    else:
                        questions = []
            except json.JSONDecodeError as e:
                print(f"❌ JSON parse error in batch {batch_idx + 1}: {e}")
                continue

            # Validate and collect questions from this batch
            for idx, q in enumerate(questions):
                is_valid, errors = validate_question_quality(q)
                if is_valid:
                    # Update item_id to be unique across batches
                    q["item_id"] = f"AI-G4-{len(all_questions) + 1:03d}"
                    all_questions.append(q)
                else:
                    print(f"⚠️  Batch {batch_idx + 1}, Question {idx + 1} failed validation: {errors[:2]}...")

            print(f"✅ Batch {batch_idx + 1} complete: {len(questions)} generated, {len(all_questions)} total validated")
            print()

        except Exception as e:
            print(f"❌ Batch {batch_idx + 1} failed: {e}")
            continue

    print(f"🎉 Generation complete: {len(all_questions)}/{count} questions validated")
    return all_questions

# ============================================================================
# Question Validation
# ============================================================================

def validate_question_quality(question: Dict) -> Tuple[bool, List[str]]:
    """
    Validate that a generated question meets CAPS standards.

    Args:
        question: Question dictionary from OpenAI

    Returns:
        Tuple of (is_valid, list_of_errors)
    """
    errors = []

    # Required fields
    required_fields = [
        "item_id", "stem", "difficulty_level", "correct_answer",
        "distractors", "caps_objective", "prerequisite_skills"
    ]
    for field in required_fields:
        if field not in question:
            errors.append(f"Missing required field: {field}")

    if errors:
        return False, errors

    # Validate difficulty level
    if question["difficulty_level"] not in ["easy", "medium", "hard"]:
        errors.append(f"Invalid difficulty: {question['difficulty_level']}")

    # Validate correct answer structure
    ca = question.get("correct_answer", {})
    if not all(k in ca for k in ["option_id", "value", "reasoning"]):
        errors.append("Correct answer missing required fields")

    # Validate distractors
    distractors = question.get("distractors", [])
    if len(distractors) != 3:
        errors.append(f"Expected 3 distractors, got {len(distractors)}")

    for idx, d in enumerate(distractors):
        required_distractor_fields = [
            "option_id", "value", "misconception_tag",
            "rationale", "confidence_weight", "remediation"
        ]
        if not all(k in d for k in required_distractor_fields):
            errors.append(f"Distractor {idx + 1} missing required fields")

        # Validate misconception tag format
        tag = d.get("misconception_tag", "")
        if not tag or not tag.endswith("-G4-" + tag.split("-G4-")[-1] if "-G4-" in tag else ""):
            errors.append(f"Invalid misconception tag format: {tag}")

        # Validate confidence weight
        weight = d.get("confidence_weight", 0)
        if not isinstance(weight, (int, float)) or not (0.0 <= weight <= 1.0):
            errors.append(f"Confidence weight must be 0.0-1.0, got {weight}")

    # Validate stem length (should be reasonable)
    stem = question.get("stem", "")
    if len(stem.split()) < 5:
        errors.append("Stem too short (< 5 words)")
    if len(stem.split()) > 50:
        errors.append("Stem too long (> 50 words)")

    return len(errors) == 0, errors

# ============================================================================
# Database Persistence
# ============================================================================

def save_questions_to_database(db: Session, questions: List[Dict]) -> int:
    """
    Save generated questions and misconceptions to database.

    Args:
        db: SQLAlchemy database session
        questions: List of validated question dictionaries

    Returns:
        Number of questions saved
    """
    from app.models import models  # Avoid circular import

    saved_count = 0

    for q in questions:
        try:
            # Create question record
            question_id = str(uuid.uuid4())
            question_record = models.AIGeneratedQuestion(
                id=question_id,
                item_id=q["item_id"],
                stem=q["stem"],
                correct_answer_option=q["correct_answer"]["option_id"],
                correct_answer_value=q["correct_answer"]["value"],
                correct_answer_reasoning=q["correct_answer"]["reasoning"],
                distractors=json.dumps(q["distractors"]),  # Store as JSON string
                grade_level=4,
                caps_topic="Numbers, Operations & Relationships",
                caps_objective=q.get("caps_objective"),
                difficulty_level=q["difficulty_level"],
                prerequisite_skills=json.dumps(q.get("prerequisite_skills", [])),
                estimated_time_seconds=q.get("estimated_time_seconds", 45),
                generated_at=datetime.utcnow(),
                generated_by="openai-gpt4",
                validated=True,  # Auto-approve (hybrid review)
                validation_notes="Auto-validated on generation"
            )

            db.add(question_record)

            # Create misconception records for each distractor
            for distractor in q["distractors"]:
                misc_id = str(uuid.uuid4())
                # Make misconception tag unique by appending question item_id
                unique_misc_tag = f"{distractor['misconception_tag']}-{q['item_id']}"
                misc_record = models.AIGeneratedMisconception(
                    id=misc_id,
                    misconception_tag=unique_misc_tag,
                    question_id=question_id,
                    description=distractor["rationale"],
                    distractor_option=distractor["option_id"],
                    rationale=distractor["rationale"],
                    confidence_weight=distractor["confidence_weight"],
                    remediation_strategy=distractor.get("remediation", ""),
                    grade_level=4,
                    caps_topic="Numbers, Operations & Relationships"
                )

                db.add(misc_record)

            db.commit()
            saved_count += 1
            print(f"✅ Saved question: {q['item_id']}")

        except Exception as e:
            db.rollback()
            print(f"❌ Failed to save question {q.get('item_id', 'unknown')}: {e}")

    return saved_count

# ============================================================================
# Adaptive Decision Tree Builder
# ============================================================================

def build_adaptive_decision_tree(
    db: Session,
    form_id: str,
    questions: List[Dict]
) -> int:
    """
    Build adaptive decision tree for question routing.

    Strategy (Option C):
    - Correct answer → Progress to harder difficulty
    - Wrong answer → Probe same difficulty for misconception
    - After 3 questions → Terminal (generate result)

    Args:
        db: Database session
        form_id: Diagnostic form identifier
        questions: List of questions sorted by difficulty

    Returns:
        Number of edges created
    """
    from app.models import models

    # Sort questions by difficulty: easy → medium → hard
    easy = [q for q in questions if q["difficulty_level"] == "easy"]
    medium = [q for q in questions if q["difficulty_level"] == "medium"]
    hard = [q for q in questions if q["difficulty_level"] == "hard"]

    edges_created = 0

    # Start with first easy question
    if not easy:
        print("⚠️  No easy questions found for decision tree")
        return 0

    start_question = easy[0]

    # Easy question routing
    for eq in easy[:2]:  # First 2 easy questions
        # Correct (A) → Medium question
        if medium:
            edge = models.AdaptiveDecisionTree(
                form_id=form_id,
                from_node_id=eq["item_id"],
                option_selected=eq["correct_answer"]["option_id"],
                to_node_id=medium[0]["item_id"] if medium else None,
                misconception_tag=None,
                confidence_delta=0.0,
                difficulty_progression="increase"
            )
            db.add(edge)
            edges_created += 1

        # Wrong answers (B, C, D) → Another easy question (probe)
        for distractor in eq["distractors"]:
            next_easy = easy[1] if len(easy) > 1 and eq != easy[1] else None
            edge = models.AdaptiveDecisionTree(
                form_id=form_id,
                from_node_id=eq["item_id"],
                option_selected=distractor["option_id"],
                to_node_id=next_easy["item_id"] if next_easy else None,
                misconception_tag=distractor["misconception_tag"],
                confidence_delta=distractor["confidence_weight"],
                difficulty_progression="maintain"
            )
            db.add(edge)
            edges_created += 1

    # Medium question routing
    for mq in medium[:2]:
        # Correct → Hard question
        if hard:
            edge = models.AdaptiveDecisionTree(
                form_id=form_id,
                from_node_id=mq["item_id"],
                option_selected=mq["correct_answer"]["option_id"],
                to_node_id=hard[0]["item_id"] if hard else None,
                misconception_tag=None,
                confidence_delta=0.0,
                difficulty_progression="increase"
            )
            db.add(edge)
            edges_created += 1

        # Wrong → Terminal (enough evidence)
        for distractor in mq["distractors"]:
            edge = models.AdaptiveDecisionTree(
                form_id=form_id,
                from_node_id=mq["item_id"],
                option_selected=distractor["option_id"],
                to_node_id=None,  # Terminal
                misconception_tag=distractor["misconception_tag"],
                confidence_delta=distractor["confidence_weight"],
                difficulty_progression="terminal"
            )
            db.add(edge)
            edges_created += 1

    # Hard question routing
    for hq in hard[:1]:  # Just one hard question
        # All options → Terminal
        edge = models.AdaptiveDecisionTree(
            form_id=form_id,
            from_node_id=hq["item_id"],
            option_selected=hq["correct_answer"]["option_id"],
            to_node_id=None,
            misconception_tag=None,
            confidence_delta=0.0,
            difficulty_progression="terminal"
        )
        db.add(edge)
        edges_created += 1

        for distractor in hq["distractors"]:
            edge = models.AdaptiveDecisionTree(
                form_id=form_id,
                from_node_id=hq["item_id"],
                option_selected=distractor["option_id"],
                to_node_id=None,
                misconception_tag=distractor["misconception_tag"],
                confidence_delta=distractor["confidence_weight"],
                difficulty_progression="terminal"
            )
            db.add(edge)
            edges_created += 1

    db.commit()
    print(f"✅ Created {edges_created} decision tree edges")

    return edges_created
