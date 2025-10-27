# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AI Mathematics Teacher Assistant System** – An intelligent platform for South African CAPS mathematics education (Grades R-12) that provides weekly diagnostic assessments, identifies mathematical misconceptions, and creates personalized learning pathways for learners.

**Target Users:** Mathematics Teachers, Learners, School Administrators
**Tech Stack:** Python (FastAPI) + Next.js 14 + PostgreSQL + AI/ML Layer

## Common Commands

### Frontend Development (Next.js)
```bash
cd frontend
npm install              # Install dependencies
npm run dev              # Start dev server (port 3000)
npm run build            # Production build
npm run lint             # Run ESLint
npm run format           # Format with Prettier
npm test                 # Run Jest unit tests
npm run test:e2e         # Run Playwright e2e tests
npm run storybook        # Launch Storybook (port 6006)
npm run storybook:build  # Build static Storybook
```

### Backend Development (when implemented)
```bash
# Python setup (planned)
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows
pip install -r requirements.txt
pytest                     # Run tests
```

### General Commands
```bash
make setup  # Install dependencies (when Makefile added)
make test   # Run all tests
make fmt    # Auto-format code
make lint   # Run linters
```

## Architecture Overview

### High-Level Structure
```
ETDP_SETA_Repo/
├── frontend/           # Next.js 14 TypeScript application
│   ├── src/app/       # App Router pages and API routes
│   ├── src/components/# UI components (ui, layout, mathematics, shared)
│   ├── src/lib/       # Client utilities (API, design tokens, utils)
│   ├── src/mocks/     # Mock data for development
│   └── tests/         # Jest unit + Playwright e2e tests
├── docs/              # Documentation (frontend-readme.md)
├── project.md         # Comprehensive project specification & roadmap
└── AGENTS.md          # Repository contribution guidelines
```

### Current State (Pilot Phase)
- **Frontend:** Next.js 14 scaffold with design system foundation
- **Backend:** Not yet implemented (planned: FastAPI/Django)
- **Database:** Not yet implemented (planned: PostgreSQL + TimescaleDB)
- **AI/ML:** Not yet implemented (planned: OpenAI/Claude API + misconception detection)

### Key Design Decisions

1. **Design System**
   - Tailwind CSS with custom theme (colors defined in `design-tokens.ts`)
   - shadcn/ui + Radix UI primitives for accessibility
   - Dark/light mode support via `next-themes`
   - Component library documented in Storybook
   - Color palette: Primary #0066CC (blue), Secondary #7C3AED (purple), Success #10B981, Warning #F59E0B, Error #EF4444

2. **Frontend Architecture**
   - Next.js 14 App Router for routing
   - TypeScript strict mode enabled
   - Component organization: `/ui` (primitives), `/layout` (shells), `/mathematics` (domain), `/shared` (cross-cutting)
   - Mock data in `src/mocks/` until backend integration
   - API layer in `src/lib/api.ts` for future FastAPI integration

3. **Routes (Mocked)**
   - `/` – Network-wide overview with diagnostic metrics
   - `/teachers` – Intervention queue, assessments, class health
   - `/learners` – Personalized pathways, engagement, feedback

4. **Component Conventions**
   - All UI components should have corresponding `.stories.tsx` for Storybook
   - Use TypeScript interfaces for all props
   - Follow shadcn/ui patterns for component composition
   - Components should support dark mode via CSS variables

### Mathematics-Specific Features

The platform centers on mathematics education with:
- **CAPS Curriculum Integration:** Aligned with SA curriculum (Grades R-12)
- **Weekly Diagnostics:** Automated adaptive assessments
- **Misconception Detection:** AI-powered analysis of learner errors (200+ documented misconceptions)
- **Personalized Pathways:** Adaptive learning sequences based on skill gaps
- **Mathematics Components:** `FormulaCallout` for LaTeX rendering, specialized input types

### Testing Strategy

- **Unit Tests:** Jest + React Testing Library for components (`tests/unit/`)
- **E2E Tests:** Playwright for critical user journeys (`tests/e2e/`)
- **Target Coverage:** 80%+ for unit tests, 70%+ for integration
- **Component Testing:** Storybook for visual regression and documentation

## Key Files & Locations

### Documentation
- `project.md` – Comprehensive 17-week project breakdown with all epics
- `docs/frontend-readme.md` – Frontend-specific setup and architecture
- `AGENTS.md` – Repository contribution guidelines
- `frontend/src/lib/design-tokens.ts` – Centralized design tokens

### Configuration
- `frontend/package.json` – npm scripts and dependencies
- `frontend/tsconfig.json` – TypeScript configuration (strict mode, ES2022)
- `frontend/tailwind.config.ts` – Theme customization
- `.nvmrc` – Node version specification

### Component Library
- `frontend/src/components/ui/` – Base primitives (Button, Card, Input, Badge)
- `frontend/src/components/layout/` – Layout shells (AppShell, PageHeader, DashboardGrid)
- `frontend/src/components/mathematics/` – Math-specific (FormulaCallout)
- `frontend/src/components/shared/` – Shared utilities (EmptyState)

### Current Pages
- `frontend/src/app/page.tsx` – Dashboard overview
- `frontend/src/app/teachers/page.tsx` – Teacher dashboard
- `frontend/src/app/learners/page.tsx` – Learner management

## Development Workflow

### Adding New Features
1. Check `project.md` for the relevant EPIC and acceptance criteria
2. Create components in appropriate `src/components/` subdirectory
3. Add Storybook stories for UI components (`.stories.tsx`)
4. Write unit tests in `tests/unit/` mirroring the `src/` structure
5. Update mock data in `src/mocks/` if needed
6. Follow Conventional Commits (`feat:`, `fix:`, `docs:`, etc.)

### Component Development
1. Start Storybook: `npm run storybook`
2. Create component in `src/components/[category]/`
3. Define TypeScript interface for props
4. Add `.stories.tsx` file for documentation
5. Ensure dark mode support using theme tokens
6. Write unit tests with React Testing Library

### Backend Integration (Future)
- API calls will go through `src/lib/api.ts`
- Replace mock data imports with API endpoint calls
- Backend will be FastAPI with endpoints like `/api/auth/*`, `/api/learners/*`, `/api/assessments/*`

## Code Style & Conventions

### TypeScript/React
- Strict TypeScript with no `any` types
- Functional components with hooks
- Props interfaces prefixed with component name: `ButtonProps`, `CardProps`
- Use `camelCase` for variables/functions, `PascalCase` for components
- Prefer named exports for components
- Format with Prettier (80-100 col wrap)

### CSS/Styling
- Tailwind utility classes preferred over custom CSS
- Use design tokens from `design-tokens.ts` for consistency
- Support dark mode: `dark:` prefix or CSS variables
- Component-specific styles in same file (Tailwind)
- Spacing: 4px base unit (Tailwind default)

### File Naming
- Components: `PascalCase.tsx` (e.g., `MetricCard.tsx`)
- Utilities: `kebab-case.ts` (e.g., `design-tokens.ts`)
- Tests: `*.test.tsx` or `*.spec.ts`
- Stories: `*.stories.tsx`

### Testing
- Test files mirror source structure: `src/foo/Bar.tsx` → `tests/unit/foo/bar.test.tsx`
- One happy path + one edge case per public function/component
- Use `@testing-library/react` queries (prefer `getByRole`)
- Mock API calls consistently

## Important Context

### CAPS Curriculum Structure
The SA mathematics curriculum is organized into:
1. **Numbers, Operations, and Relationships**
2. **Patterns, Functions, and Algebra**
3. **Space and Shape (Geometry)**
4. **Measurement**
5. **Data Handling and Probability**

Across grade bands:
- Grades R-3: Foundation Phase
- Grades 4-6: Intermediate Phase
- Grades 7-9: Senior Phase
- Grades 10-12: FET Phase

### Misconception Detection Philosophy
The platform identifies common mathematical misconceptions (e.g., "multiplication always makes bigger", "0.5 > 0.23 because 5 > 23") and provides targeted remediation through personalized pathways.

### Data Privacy (POPIA Compliance)
South African Protection of Personal Information Act (POPIA) compliance is critical:
- User consent management required
- Data minimization principles
- Right to data export and deletion
- Audit trails for all data access
- Security safeguards for learner information

## Next Implementation Steps

According to `project.md`, the roadmap follows these EPICs:

1. **EPIC 1-2 (Weeks 1-3):** Foundation complete – authentication, design system, layouts ✓
2. **EPIC 3 (Week 3):** User management – teacher/learner dashboards, profiles
3. **EPIC 4 (Week 4):** CAPS curriculum integration – seed database with SA mathematics curriculum
4. **EPIC 5-6 (Weeks 5-8):** Assessment system + AI misconception detection
5. **EPIC 7-8 (Weeks 9-12):** Personalized pathways + analytics
6. **EPIC 9-13 (Weeks 13-17):** Communication, testing, deployment

### Immediate Priorities
1. Replace mocked data with backend API integration (when FastAPI endpoints available)
2. Implement learner management CRUD operations
3. Build CAPS curriculum browser UI
4. Create assessment builder interface
5. Integrate AI/ML layer for misconception detection

## References

- **Project Specification:** `project.md` (comprehensive 3500+ line breakdown)
- **Frontend Guide:** `docs/frontend-readme.md`
- **Contribution Guidelines:** `AGENTS.md`
- **Design System:** Storybook at `http://localhost:6006` (after `npm run storybook`)
