#!/usr/bin/env python3
"""
CLI Script: Generate CAPS-Compliant Grade 4 Questions

Generates 20 AI-powered diagnostic mathematics questions using OpenAI GPT-4,
validates them against CAPS curriculum standards, saves to database, and
builds adaptive decision tree for question routing.

Usage:
    python scripts/generate_questions.py

Requirements:
    - OPENAI_API_KEY environment variable set
    - Database initialized with 004_ai_questions.sql migration
"""

import asyncio
import os
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.services.ai_question_generator import (
    generate_caps_grade4_questions,
    save_questions_to_database,
    build_adaptive_decision_tree,
)

# Database configuration
DATABASE_URL = "sqlite:///./app.db"

def main():
    """Main execution flow for question generation."""

    print("=" * 70)
    print("🤖 CAPS Grade 4 AI Question Generator")
    print("=" * 70)
    print()

    # Step 1: Validate environment
    print("📋 Step 1: Validating environment...")
    if not os.getenv("OPENAI_API_KEY"):
        print("❌ ERROR: OPENAI_API_KEY environment variable not set")
        print("   Please set it with: export OPENAI_API_KEY='your-key-here'")
        sys.exit(1)
    print("✅ OpenAI API key found")
    print()

    # Step 2: Connect to database
    print("📋 Step 2: Connecting to database...")
    try:
        engine = create_engine(DATABASE_URL, echo=False)
        SessionLocal = sessionmaker(bind=engine)
        db = SessionLocal()
        print(f"✅ Connected to database: {DATABASE_URL}")
    except Exception as e:
        print(f"❌ Failed to connect to database: {e}")
        sys.exit(1)
    print()

    # Step 3: Generate questions with OpenAI
    print("📋 Step 3: Generating 20 CAPS Grade 4 questions with OpenAI GPT-4...")
    print("   This may take 30-60 seconds...")
    print()

    try:
        # Generate questions (async function)
        questions = asyncio.run(generate_caps_grade4_questions(
            count=20,
            difficulty_distribution={
                "easy": 7,    # 35%
                "medium": 9,  # 45%
                "hard": 4     # 20%
            }
        ))

        if not questions:
            print("❌ No questions were generated")
            sys.exit(1)

        print(f"✅ Generated {len(questions)} validated questions")
        print()

        # Display summary
        print("📊 Generation Summary:")
        easy_count = sum(1 for q in questions if q["difficulty_level"] == "easy")
        medium_count = sum(1 for q in questions if q["difficulty_level"] == "medium")
        hard_count = sum(1 for q in questions if q["difficulty_level"] == "hard")
        print(f"   - Easy: {easy_count} questions")
        print(f"   - Medium: {medium_count} questions")
        print(f"   - Hard: {hard_count} questions")
        print()

        # Show sample questions
        print("📝 Sample Questions:")
        for i, q in enumerate(questions[:3], 1):
            print(f"   {i}. [{q['difficulty_level'].upper()}] {q['stem'][:60]}...")
        print()

    except Exception as e:
        print(f"❌ Question generation failed: {e}")
        sys.exit(1)

    # Step 4: Save to database
    print("📋 Step 4: Saving questions to database...")
    try:
        saved_count = save_questions_to_database(db, questions)
        print(f"✅ Saved {saved_count}/{len(questions)} questions to database")
        print()
    except Exception as e:
        print(f"❌ Failed to save questions: {e}")
        db.rollback()
        sys.exit(1)

    # Step 5: Build adaptive decision tree
    print("📋 Step 5: Building adaptive decision tree...")
    form_id = "diagnostic-form-g4-week12"
    try:
        edges_created = build_adaptive_decision_tree(db, form_id, questions)
        print(f"✅ Created {edges_created} decision tree edges")
        print()
    except Exception as e:
        print(f"❌ Failed to build decision tree: {e}")
        db.rollback()
        sys.exit(1)

    # Step 6: Verify database contents
    print("📋 Step 6: Verifying database contents...")
    try:
        from sqlalchemy import text

        # Count questions
        result = db.execute(text("SELECT COUNT(*) FROM ai_generated_questions"))
        question_count = result.scalar()

        # Count misconceptions
        result = db.execute(text("SELECT COUNT(*) FROM ai_generated_misconceptions"))
        misconception_count = result.scalar()

        # Count decision tree edges
        result = db.execute(text("SELECT COUNT(*) FROM adaptive_decision_tree WHERE form_id = :form_id"), {"form_id": form_id})
        edge_count = result.scalar()

        print(f"✅ Database verification:")
        print(f"   - Questions: {question_count}")
        print(f"   - Misconceptions: {misconception_count}")
        print(f"   - Decision tree edges: {edge_count}")
        print()

    except Exception as e:
        print(f"⚠️  Could not verify database contents: {e}")
        print()

    # Success summary
    print("=" * 70)
    print("🎉 SUCCESS! AI question generation complete")
    print("=" * 70)
    print()
    print("Next Steps:")
    print("1. Review questions in database (ai_generated_questions table)")
    print("2. Update diagnostic_router.py to serve AI questions instead of mock")
    print("3. Test adaptive routing with real learner sessions")
    print()

    db.close()

if __name__ == "__main__":
    main()
