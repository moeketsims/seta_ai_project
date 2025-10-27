# Phase 2: Dashboard AI Wiring - Implementation Status

**Date:** October 26, 2025
**Status:** In Progress - Database Setup Required

---

## 🎯 Goal

Transform your beautiful mock dashboard into a fully AI-powered intelligence platform by wiring real learner data from AI assessments into:
1. **Intervention Queue** - Auto-populated from AI-detected misconceptions
2. **Class Health Heatmap** - Real-time mastery calculations per class×topic
3. **Priority Alerts** - Live counts of urgent interventions & at-risk classes
4. **Misconception Radar** - Trending misconception frequency over time

---

## ✅ Completed So Far

### 1. Database Model Created
**File:** [backend/app/models/models.py](backend/app/models/models.py:223-261)

Added `InterventionQueue` model to track AI-detected misconceptions that need teacher attention:

```python
class InterventionQueue(Base):
    """
    Teacher's intervention queue - tracks individual learner misconceptions
    that need teacher attention.
    """
    __tablename__ = "intervention_queue"

    # Core fields
    id = Column(Integer, primary_key=True, index=True)
    learner_id = Column(String, ForeignKey("learners.id"), nullable=False)
    teacher_id = Column(String, ForeignKey("users.id"), nullable=False)
    misconception_id = Column(String, ForeignKey("misconceptions.id"))
    assessment_result_id = Column(Integer, ForeignKey("assessment_results.id"))

    # Detection metadata
    detected_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    severity = Column(SQLEnum(RiskLevel), default=RiskLevel.MEDIUM)  # CRITICAL/HIGH/MEDIUM/LOW
    confidence = Column(Float, default=0.85)  # AI confidence score (0-1)

    # Intervention status
    status = Column(String, default='pending')  # pending, in_progress, resolved
    assigned_at = Column(DateTime)
    started_at = Column(DateTime)
    resolved_at = Column(DateTime)

    # AI-generated content
    misconception_name = Column(String)  # Human-readable name (e.g., "Longer Decimal is Larger")
    remediation_strategy = Column(Text)  # AI-generated intervention plan
    estimated_time_weeks = Column(Integer, default=3)  # From taxonomy
    prerequisite_skills = Column(JSON, default=[])  # Skills to address first

    # Teacher notes & effectiveness tracking
    notes = Column(Text)
    effectiveness_rating = Column(Integer)  # 1-5 after resolution

    # Relationships
    learner = relationship("Learner")
    teacher = relationship("User")
    assessment_result = relationship("AssessmentResult")
    misconception = relationship("Misconception")
```

**Why This Matters:**
- **Severity-based prioritization:** CRITICAL misconceptions appear first in queue
- **AI-generated remediation:** Not just "review fractions" but specific 3-week plan
- **Trackable workflow:** Teachers can mark pending → in_progress → resolved
- **Effectiveness feedback loop:** Teachers rate what worked to improve AI recommendations

---

## 🔄 Next Steps (Requires Database)

### **Prerequisite: Start PostgreSQL Database**

The backend crashed because PostgreSQL isn't running. To continue:

```bash
# Option 1: If Docker is running
cd /Users/mosiams/Desktop/ETDP_SETA_Repo/backend
docker-compose up -d

# Option 2: If using local PostgreSQL
brew services start postgresql@15

# Verify database is accessible
psql -U postgres -c "SELECT 1"
```

Once database is running:
```bash
# Backend will auto-create tables on next restart
cd /Users/mosiams/Desktop/ETDP_SETA_Repo/backend
source venv/bin/activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 📋 Implementation Roadmap (Post-Database Setup)

### **Step 1: Create Intervention Service** (2-3 hours)

**File to create:** `backend/app/services/intervention_service.py`

```python
"""
Intervention Service
Automatically creates intervention queue items from AI-detected misconceptions.
"""

from sqlalchemy.orm import Session
from app.models.models import InterventionQueue, Learner, Misconception, RiskLevel
from app.services.ai_service import get_ai_service
from app.data.misconceptions_taxonomy import MISCONCEPTIONS_TAXONOMY
import logging

logger = logging.getLogger(__name__)

class InterventionService:
    def __init__(self, db: Session):
        self.db = db
        self.ai_service = get_ai_service()

    async def create_intervention_from_misconception(
        self,
        learner_id: str,
        assessment_result_id: int,
        misconception_name: str,
        confidence: float = 0.85
    ) -> InterventionQueue:
        """
        Create an intervention queue item from AI-detected misconception.

        Args:
            learner_id: ID of learner who showed misconception
            assessment_result_id: Which assessment detected it
            misconception_name: Name from CAPS taxonomy (e.g., "Longer Decimal is Larger")
            confidence: AI confidence score (0-1)

        Returns:
            InterventionQueue item for teacher dashboard
        """
        # 1. Get learner's teacher
        learner = self.db.query(Learner).filter(Learner.id == learner_id).first()
        if not learner:
            raise ValueError(f"Learner {learner_id} not found")

        teacher_id = learner.class_obj.teacher_id

        # 2. Find misconception in CAPS taxonomy
        misconception_data = self._find_misconception_in_taxonomy(misconception_name)
        if not misconception_data:
            logger.warning(f"Misconception '{misconception_name}' not in taxonomy - using defaults")
            severity = RiskLevel.MEDIUM
            estimated_weeks = 3
            prerequisites = []
        else:
            severity = self._map_severity(misconception_data['severity'])
            estimated_weeks = misconception_data.get('estimated_remediation_time', 3)
            prerequisites = misconception_data.get('prerequisite_skills', [])

        # 3. Generate AI remediation strategy
        remediation_strategy = await self._generate_remediation_plan(
            misconception_name=misconception_name,
            misconception_data=misconception_data,
            learner_grade=learner.grade
        )

        # 4. Check for duplicate (don't create if already pending)
        existing = self.db.query(InterventionQueue).filter(
            InterventionQueue.learner_id == learner_id,
            InterventionQueue.misconception_name == misconception_name,
            InterventionQueue.status == 'pending'
        ).first()

        if existing:
            logger.info(f"Intervention already exists for {learner_id} + {misconception_name}")
            return existing

        # 5. Create intervention queue item
        intervention = InterventionQueue(
            learner_id=learner_id,
            teacher_id=teacher_id,
            assessment_result_id=assessment_result_id,
            misconception_name=misconception_name,
            severity=severity,
            confidence=confidence,
            estimated_time_weeks=estimated_weeks,
            prerequisite_skills=prerequisites,
            remediation_strategy=remediation_strategy,
            status='pending'
        )

        self.db.add(intervention)
        self.db.commit()
        self.db.refresh(intervention)

        logger.info(f"✅ Created intervention for {learner_id}: {misconception_name} (severity: {severity.value})")

        return intervention

    def _find_misconception_in_taxonomy(self, name: str):
        """Find misconception details in CAPS taxonomy by name (fuzzy match)."""
        name_lower = name.lower()
        for misc in MISCONCEPTIONS_TAXONOMY:
            if name_lower in misc['name'].lower() or misc['name'].lower() in name_lower:
                return misc
        return None

    def _map_severity(self, taxonomy_severity: str) -> RiskLevel:
        """Map CAPS taxonomy severity to database enum."""
        mapping = {
            'CRITICAL': RiskLevel.CRITICAL,
            'HIGH': RiskLevel.HIGH,
            'MEDIUM': RiskLevel.MEDIUM,
            'LOW': RiskLevel.LOW
        }
        return mapping.get(taxonomy_severity, RiskLevel.MEDIUM)

    async def _generate_remediation_plan(
        self,
        misconception_name: str,
        misconception_data: dict,
        learner_grade: int
    ) -> str:
        """Use AI to generate specific remediation strategy."""

        if not misconception_data:
            # Fallback if not in taxonomy
            return f"Review foundational concepts related to {misconception_name}. Use visual models and real-world examples."

        prompt = f"""Generate a specific, actionable 3-week remediation plan for a Grade {learner_grade} learner who shows this misconception:

**Misconception:** {misconception_name}
**Description:** {misconception_data['description']}
**Typical Errors:** {', '.join(misconception_data.get('example_errors', []))}

**Suggested Strategy (from CAPS):** {misconception_data.get('remediation_strategy', '')}

Generate a structured plan with:
- Week 1: Focus and activities
- Week 2: Focus and activities
- Week 3: Focus and activities
- Assessment method to confirm mastery

Keep it concise (3-4 sentences per week). Use South African context and CAPS-aligned resources."""

        messages = [
            {"role": "system", "content": "You are an expert mathematics educator specializing in the South African CAPS curriculum."},
            {"role": "user", "content": prompt}
        ]

        try:
            response = await self.ai_service.get_completion(messages, temperature=0.7, max_tokens=500)
            return response['content']
        except Exception as e:
            logger.error(f"Failed to generate remediation plan: {e}")
            return misconception_data.get('remediation_strategy', 'Review foundational concepts with visual models.')
```

---

### **Step 2: Create Intervention API Endpoints** (1-2 hours)

**File to create:** `backend/app/api/v1/endpoints/interventions.py`

```python
"""
Intervention Queue API Endpoints
Provides teacher dashboard with intervention queue data.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import case, func
from typing import List
from app.db.database import get_db
from app.models.models import InterventionQueue, Learner, User, Misconception
from app.services.intervention_service import InterventionService
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

# Request/Response models
class CreateInterventionRequest(BaseModel):
    learner_id: str
    assessment_result_id: int
    misconception_name: str
    confidence: float = 0.85

class InterventionResponse(BaseModel):
    id: int
    name: str  # Learner full name
    grade: str  # Class name (e.g., "7A")
    reason: str  # Misconception name
    severity: str  # high, medium, low
    time: str  # Estimated time (e.g., "~3 weeks")
    remediation_strategy: str
    detected_at: datetime
    status: str

@router.post("/interventions", response_model=InterventionResponse)
async def create_intervention(
    request: CreateInterventionRequest,
    db: Session = Depends(get_db)
):
    """
    Create intervention from AI-detected misconception.
    Called by frontend after learner submits assessment.
    """
    service = InterventionService(db)

    try:
        intervention = await service.create_intervention_from_misconception(
            learner_id=request.learner_id,
            assessment_result_id=request.assessment_result_id,
            misconception_name=request.misconception_name,
            confidence=request.confidence
        )

        # Format for dashboard
        learner = intervention.learner
        return InterventionResponse(
            id=intervention.id,
            name=f"{learner.user.first_name} {learner.user.last_name}",
            grade=learner.class_obj.name,
            reason=intervention.misconception_name,
            severity=intervention.severity.value.lower(),
            time=f"~{intervention.estimated_time_weeks} weeks",
            remediation_strategy=intervention.remediation_strategy,
            detected_at=intervention.detected_at,
            status=intervention.status
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/interventions", response_model=List[InterventionResponse])
def get_teacher_interventions(
    teacher_id: str,
    status: str = Query("pending", regex="^(pending|in_progress|resolved)$"),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Get prioritized intervention queue for teacher dashboard.
    Sorted by severity (CRITICAL first) then recency.
    """
    interventions = (
        db.query(InterventionQueue)
        .join(Learner, InterventionQueue.learner_id == Learner.id)
        .join(User, Learner.user_id == User.id)
        .filter(InterventionQueue.teacher_id == teacher_id)
        .filter(InterventionQueue.status == status)
        .order_by(
            # Sort by severity: CRITICAL=1, HIGH=2, MEDIUM=3, LOW=4
            case(
                (InterventionQueue.severity == 'CRITICAL', 1),
                (InterventionQueue.severity == 'HIGH', 2),
                (InterventionQueue.severity == 'MEDIUM', 3),
                else_=4
            ),
            InterventionQueue.detected_at.desc()
        )
        .limit(limit)
        .all()
    )

    return [
        InterventionResponse(
            id=i.id,
            name=f"{i.learner.user.first_name} {i.learner.user.last_name}",
            grade=i.learner.class_obj.name,
            reason=i.misconception_name,
            severity=i.severity.value.lower(),
            time=f"~{i.estimated_time_weeks} weeks",
            remediation_strategy=i.remediation_strategy,
            detected_at=i.detected_at,
            status=i.status
        )
        for i in interventions
    ]

@router.patch("/interventions/{intervention_id}/status")
def update_intervention_status(
    intervention_id: int,
    status: str = Query(..., regex="^(pending|in_progress|resolved)$"),
    notes: str = None,
    effectiveness_rating: int = Query(None, ge=1, le=5),
    db: Session = Depends(get_db)
):
    """
    Update intervention status (teacher marks as in_progress or resolved).
    """
    intervention = db.query(InterventionQueue).filter(InterventionQueue.id == intervention_id).first()

    if not intervention:
        raise HTTPException(status_code=404, detail="Intervention not found")

    intervention.status = status

    if status == 'in_progress' and not intervention.started_at:
        intervention.started_at = datetime.utcnow()

    if status == 'resolved':
        intervention.resolved_at = datetime.utcnow()
        if effectiveness_rating:
            intervention.effectiveness_rating = effectiveness_rating

    if notes:
        intervention.notes = notes

    db.commit()

    return {"success": True, "intervention_id": intervention_id, "new_status": status}
```

**Register endpoints in:** `backend/app/api/v1/api.py`
```python
from app.api.v1.endpoints import interventions

api_router.include_router(interventions.router, prefix="/interventions", tags=["interventions"])
```

---

### **Step 3: Wire Assessment Submission to Create Interventions** (1 hour)

**Modify:** [frontend/src/app/take-assessment/page.tsx](frontend/src/app/take-assessment/page.tsx:62-122)

**After AI evaluations complete, add:**

```typescript
// After line 99: console.log('🎉 All evaluations complete:', evaluations);

// CREATE INTERVENTIONS FOR DETECTED MISCONCEPTIONS
for (const [index, evaluation] of Object.entries(evaluations)) {
  if (evaluation.misconception_detected) {
    try {
      const response = await fetch('http://localhost:8000/api/v1/interventions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learner_id: 'current-learner-id',  // TODO: Get from auth context
          assessment_result_id: resultId,     // TODO: Save assessment result first
          misconception_name: evaluation.misconception_detected,
          confidence: 0.85
        })
      });

      if (response.ok) {
        console.log(`✅ Intervention created for misconception: ${evaluation.misconception_detected}`);
      } else {
        console.error(`❌ Failed to create intervention:`, await response.text());
      }
    } catch (error) {
      console.error('Error creating intervention:', error);
    }
  }
}
```

---

### **Step 4: Replace Mock Intervention Queue with Real API** (1 hour)

**Modify:** [frontend/src/app/page.tsx](frontend/src/app/page.tsx:68-74)

**Replace mock interventions:**
```typescript
// REMOVE:
const interventions = [
  { name: 'Sipho Ndlovu', grade: '7A', reason: 'Fraction misconception', severity: 'high', time: '~5 min' },
  ...hardcoded mock data
];

// ADD:
const [interventions, setInterventions] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function fetchInterventions() {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/interventions?teacher_id=${currentUser.id}&status=pending&limit=10`);
      const data = await response.json();
      setInterventions(data);
    } catch (error) {
      console.error('Failed to load interventions:', error);
    } finally {
      setLoading(false);
    }
  }

  fetchInterventions();

  // Refresh every 30 seconds
  const interval = setInterval(fetchInterventions, 30000);
  return () => clearInterval(interval);
}, [currentUser.id]);
```

---

### **Step 5: Build Class Health Heatmap Service** (3-4 hours)

**File to create:** `backend/app/services/class_analytics_service.py`

```python
"""
Class Analytics Service
Calculates class health heatmap and other analytics for teacher dashboard.
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import Class, Learner, SkillMastery, Skill
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

# CAPS Mathematics topics
CAPS_TOPICS = [
    "Fractions",
    "Decimals",
    "Geometry",
    "Algebra",
    "Functions"
]

class ClassAnalyticsService:
    def __init__(self, db: Session):
        self.db = db

    def calculate_class_health_heatmap(self, teacher_id: str, timeframe: str = "this_week"):
        """
        Calculate mastery heatmap: Classes × CAPS Topics

        Returns:
            {
                "classes": ["Grade 4A", "Grade 5A", ...],
                "topics": ["Fractions", "Decimals", ...],
                "data": [
                    [
                        {"mastery": 82, "below": 2, "trend": 5},  # Grade 4A × Fractions
                        {"mastery": 76, "below": 3, "trend": -2}, # Grade 4A × Decimals
                        ...
                    ],
                    [...] # Grade 5A row
                ]
            }
        """
        # Get all classes for this teacher
        classes = (
            self.db.query(Class)
            .filter(Class.teacher_id == teacher_id)
            .order_by(Class.grade, Class.name)
            .all()
        )

        heatmap_data = []

        for class_obj in classes:
            row = []
            learner_ids = [l.id for l in class_obj.learners]

            for topic in CAPS_TOPICS:
                # Calculate average mastery for this class×topic
                mastery_avg = (
                    self.db.query(func.avg(SkillMastery.mastery_level))
                    .join(Skill, SkillMastery.skill_id == Skill.id)
                    .filter(
                        SkillMastery.learner_id.in_(learner_ids),
                        Skill.topic == topic
                    )
                    .scalar()
                ) or 0

                # Count learners below 60% mastery
                below_threshold = (
                    self.db.query(func.count(SkillMastery.id))
                    .join(Skill, SkillMastery.skill_id == Skill.id)
                    .filter(
                        SkillMastery.learner_id.in_(learner_ids),
                        Skill.topic == topic,
                        SkillMastery.mastery_level < 60
                    )
                    .scalar()
                ) or 0

                # Calculate trend (compare to 1 week ago)
                trend = self._calculate_mastery_trend(learner_ids, topic, days=7)

                row.append({
                    "mastery": round(mastery_avg, 1),
                    "below": below_threshold,
                    "trend": trend
                })

            heatmap_data.append(row)

        return {
            "classes": [c.name for c in classes],
            "topics": CAPS_TOPICS,
            "data": heatmap_data
        }

    def _calculate_mastery_trend(self, learner_ids: list, topic: str, days: int = 7) -> int:
        """
        Calculate trend: current average - average from N days ago.
        Returns integer (+5 means improved 5%, -3 means declined 3%).
        """
        # Current mastery
        current = (
            self.db.query(func.avg(SkillMastery.mastery_level))
            .join(Skill)
            .filter(
                SkillMastery.learner_id.in_(learner_ids),
                Skill.topic == topic
            )
            .scalar()
        ) or 0

        # Mastery from N days ago (using last_practiced timestamp as proxy)
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        previous = (
            self.db.query(func.avg(SkillMastery.mastery_level))
            .join(Skill)
            .filter(
                SkillMastery.learner_id.in_(learner_ids),
                Skill.topic == topic,
                SkillMastery.last_practiced < cutoff_date
            )
            .scalar()
        ) or current  # If no historical data, assume no change

        return round(current - previous)
```

**Create API endpoint:** `backend/app/api/v1/endpoints/analytics.py`

```python
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.class_analytics_service import ClassAnalyticsService

router = APIRouter()

@router.get("/analytics/class-health")
def get_class_health_heatmap(
    teacher_id: str,
    timeframe: str = Query("this_week", regex="^(today|this_week|this_month|this_term)$"),
    db: Session = Depends(get_db)
):
    """Get class health heatmap for teacher dashboard."""
    service = ClassAnalyticsService(db)
    return service.calculate_class_health_heatmap(teacher_id, timeframe)
```

**Wire to frontend:** [frontend/src/app/page.tsx](frontend/src/app/page.tsx:16-66)

```typescript
// REMOVE mock heatmapData
// ADD:
const [heatmapData, setHeatmapData] = useState([]);
const [classes, setClasses] = useState([]);
const [topics, setTopics] = useState([]);

useEffect(() => {
  async function fetchHeatmap() {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/analytics/class-health?teacher_id=${currentUser.id}&timeframe=${timeframe.toLowerCase().replace(' ', '_')}`);
      const data = await response.json();

      setClasses(data.classes);
      setTopics(data.topics);
      setHeatmapData(data.data);
    } catch (error) {
      console.error('Failed to load heatmap:', error);
    }
  }

  fetchHeatmap();
}, [currentUser.id, timeframe]);
```

---

## 🎓 Educational Value

### What This Achieves:

**For Teachers:**
- **Automatic triage:** CRITICAL misconceptions surface immediately
- **No manual analysis:** AI detects patterns across all assessments
- **Actionable intelligence:** Specific remediation plans, not generic advice
- **Visible trends:** Heat map shows which classes struggle with which topics

**For Learners:**
- **Targeted support:** Teacher knows exactly where they need help
- **Faster interventions:** Detected within seconds of assessment submission
- **Personalized plans:** 3-week remediation tailored to their grade level

**For System:**
- **Feedback loop:** Teacher ratings improve AI recommendations over time
- **Scalable:** Works for 10 learners or 10,000
- **Evidence-based:** All interventions linked to specific assessment results

---

## 🚀 Testing Plan (Once Database is Running)

### Test 1: Intervention Creation
1. Learner submits assessment with wrong answer showing misconception
2. Check backend logs: Should see `✅ Created intervention for {learner}: {misconception}`
3. Check teacher dashboard: Intervention appears in queue within 5 seconds
4. Verify: Shows learner name, grade, specific misconception, severity, estimated time

### Test 2: Intervention Priority
1. Create 3 interventions with different severities (CRITICAL, HIGH, MEDIUM)
2. Check dashboard: CRITICAL appears first, then HIGH, then MEDIUM
3. Mark CRITICAL as "in_progress"
4. Refresh: Should move to "In Progress" section

### Test 3: Class Health Heatmap
1. Create skill mastery records for learners in different classes
2. Call heatmap API: `/api/v1/analytics/class-health?teacher_id=X`
3. Verify: Returns matrix with correct mastery percentages
4. Check color coding: Red (<60%), Yellow (60-80%), Green (>80%)

### Test 4: Real-Time Updates
1. Submit assessment
2. Intervention appears in queue
3. Teacher clicks intervention to view details
4. Shows AI-generated 3-week remediation plan
5. Teacher marks as "resolved" after intervention
6. Disappears from "Pending" queue

---

## 📊 Success Metrics

✅ **Dashboard shows real data** (not mock)
✅ **Interventions auto-populate** within 5 seconds of assessment submission
✅ **Severity sorting works** (CRITICAL first)
✅ **Heatmap colors accurate** (green/yellow/red based on mastery)
✅ **Trend arrows correct** (↑ improving, ↓ declining)
✅ **AI remediation plans specific** (not generic "review topic X")
✅ **Teachers can mark interventions** (pending → resolved workflow)

---

## 🔧 Current Blocker

**PostgreSQL database not running.**

To unblock and continue implementation:

```bash
# Start Docker Desktop (if using Docker)
open -a Docker

# Then start database
cd /Users/mosiams/Desktop/ETDP_SETA_Repo/backend
docker-compose up -d

# Verify
docker ps  # Should show postgres container running

# Backend will auto-restart and create tables
# Check: http://localhost:8000/health
```

Once database is running, backend will:
1. Auto-create `intervention_queue` table from model
2. Accept `/api/v1/interventions POST` requests
3. Return intervention queue data for dashboard

---

## 📝 Summary

**Phase 2 Status:** 20% Complete
- ✅ Database model designed
- ⏳ Intervention service (pending database)
- ⏳ API endpoints (pending database)
- ⏳ Frontend wiring (pending database)
- ⏳ Class health heatmap (pending database)

**Next Action:** Start PostgreSQL database, then continue with intervention service implementation.

**Estimated Time to Complete:** 6-8 hours after database is running (split across 2-3 sessions)

**End Result:** Your beautiful dashboard will display **real AI intelligence** instead of mock data, making it a genuinely valuable teaching assistant tool. 🎯