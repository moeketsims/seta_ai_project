# ETDP SETA AI Mathematics Teacher Assistant - Backend API

FastAPI backend with PostgreSQL database for the AI Mathematics Teacher Assistant platform.

## Quick Start

### 1. Start PostgreSQL Database

```bash
cd backend
docker-compose up -d
```

### 2. Install Python Dependencies

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Seed the Database

```bash
python -m app.db.seed
```

### 4. Run the API Server

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at: **http://localhost:8000**

API Documentation (Swagger): **http://localhost:8000/docs**

## API Endpoints

### Assessments
- `GET /api/v1/assessments/` - Get all assessments
- `GET /api/v1/assessments/{assessment_id}` - Get assessment with questions
- `GET /api/v1/assessments/questions/all` - Get all questions

### Analytics
- `GET /api/v1/analytics/metrics` - Overall analytics metrics
- `GET /api/v1/analytics/performance-trend` - 12-week performance trends
- `GET /api/v1/analytics/skill-mastery` - Skill mastery distribution
- `GET /api/v1/analytics/learner-distribution` - Learner progress distribution
- `GET /api/v1/analytics/misconception-frequency` - Top misconceptions
- `GET /api/v1/analytics/skill-heatmap?class_id={class_id}` - Skill heatmap for class

### Diagnostic Analytics
- `GET /api/v1/diagnostic/weekly/{assessment_id}` - Deep dive for weekly diagnostic
- `GET /api/v1/diagnostic/at-risk` - At-risk learners with predictions

### Interventions
- `GET /api/v1/interventions/` - All interventions
- Filter by `?type=manipulative` or `?effectiveness=excellent`

### Skills & Pathways
- `GET /api/v1/skills/` - All skills
- `GET /api/v1/skills/pathway/{pathway_id}` - Learning pathway with progression

### Misconceptions
- `GET /api/v1/misconceptions/` - All misconceptions
- Filter by `?category=multiplication` or `?severity=critical`

### Learners
- `GET /api/v1/learners/` - All learners
- `GET /api/v1/learners/{learner_id}` - Specific learner
- `GET /api/v1/learners/{learner_id}/skills` - Learner's skill mastery

## Database Schema

- **Users** - Teachers and learners
- **Classes** - Class groupings
- **Learners** - Learner profiles with risk scores
- **Skills** - Mathematics skills with prerequisites
- **SkillMastery** - Learner progress on skills
- **Misconceptions** - Mathematical misconceptions tracked over time
- **Assessments** - Weekly diagnostics and assessments
- **Questions** - Question bank with representations
- **AssessmentResults** - Learner scores and answers
- **Interventions** - Teaching interventions with effectiveness metrics
- **LearningPathways** - Skill progression pathways

## Environment Variables

Copy `.env.example` to `.env` and configure:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/etdp_seta_db
SECRET_KEY=your-secret-key
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002
```

## Development

### Reset Database

```bash
# Stop containers
docker-compose down -v

# Restart and reseed
docker-compose up -d
python -m app.db.seed
```

### Check Database

```bash
docker exec -it etdp_seta_db psql -U postgres -d etdp_seta_db

# In psql:
\dt  # List tables
SELECT * FROM learners LIMIT 5;
```

## Testing

```bash
pytest
```
