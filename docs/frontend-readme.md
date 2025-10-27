# Frontend Starter Guide

The `frontend/` folder hosts the Next.js 14 TypeScript app for the AI Mathematics Teacher Assistant pilot. This initial scaffold targets the enterprise-grade dashboards described in `project.md` while keeping the first slice manageable.

## Prerequisites
- Node.js 20 (configure via `.nvmrc` once the team agrees on the exact minor version)
- npm 10 or PNPM 9

## Scripts
- `npm run dev` – start the Next.js dev server on port 3000
- `npm run build` – build for production
- `npm run lint` – run ESLint with Next.js defaults plus repo rules
- `npm run test` – execute Jest unit tests (`frontend/tests/unit`)
- `npm run test:e2e` – run Playwright smoke tests (`frontend/tests/e2e`)
- `npm run format` – format files with Prettier
- `npm run storybook` – launch Storybook on port 6006 for the design system
- `npm run storybook:build` – generate the static Storybook bundle

## Project Layout
```
frontend/
  src/app/          // App Router routes and API stubs
  src/components/   // Reusable UI building blocks
  src/lib/          // Client helpers (API, utilities)
  src/mocks/        // Static data used before backend integration
  tests/            // Jest + Playwright suites
```

### Available Routes (mocked)
- `/` shows the network-wide overview with diagnostic metrics
- `/teachers` surfaces the intervention queue, upcoming assessments, and class health snapshot
- `/learners` lists personalised pathways, engagement signals, and feedback snippets

## Design System Snapshot
- Tailwind is configured with the project palette (primary #0066CC, secondary #7C3AED, success #10B981, warning #F59E0B, danger #EF4444) and neutral greys for light/dark themes.
- `src/lib/design-tokens.ts` centralises color, spacing, typography, radius, and elevation tokens for cross-platform reuse.
- Component structure follows `/components/ui`, `/components/layout`, `/components/mathematics`, `/components/shared` with Storybook coverage (`*.stories.tsx`) for rapid review.
- Dark mode is opt-in via `ThemeToggle` (powered by `next-themes`) and available across the layout shell.
- Base primitives available now: `Button`, `IconButton`, `Badge`, `Card` family, `Input`, `PageHeader`, `DashboardGrid`, `FormulaCallout`, and `EmptyState`.

## Multi-Representation Question System

The platform supports multiple visual representations for mathematics questions to enhance learner understanding and address different learning styles. This system is built around three core representation types:

### Representation Types

1. **`diagram`** - Visual representations using:
   - `VisualFractionBar` - Displays fractions as segmented bars
   - `NumberLine` - Shows numbers on a continuous line with markers

2. **`manipulative`** - Interactive virtual manipulatives:
   - `VirtualManipulativePanel` - Provides draggable/interactive tools including:
     - Counters for basic counting
     - Base-ten blocks for place value
     - Fraction tiles for fraction operations
     - Algebra tiles for algebraic expressions

3. **`storyContext`** - Culturally relevant word problem contexts:
   - `StoryContextCard` - Highlights scenarios, vocabulary, and comprehension prompts
   - Supports South African contexts (Rand currency, local scenarios)

### Using Representations in Questions

When authoring questions in `src/mocks/assessments.ts` (or via the backend), add the `representations` array to specify which visual aids should be displayed:

```typescript
{
  id: 'q-005',
  type: 'multiple_choice',
  content: 'Which fraction is larger: 1/4 or 1/8?',
  // ... other fields
  representations: ['diagram', 'manipulative'], // Add visual aids
}
```

### Representation Guidelines

- **Fraction questions**: Use `['diagram', 'manipulative']` for visual comparison
- **Decimal comparisons**: Use `['diagram']` for number line visualization
- **Word problems**: Use `['storyContext']` or `['storyContext', 'diagram']`
- **Algebra**: Use `['manipulative']` for modeling expressions
- **Geometry**: Use `['diagram']` for shapes and measurements

### Component Architecture

The `QuestionRepresentationSuite` dispatcher component automatically:
1. Reads the `question.representations` array
2. Extracts relevant data from question content (numbers, fractions, etc.)
3. Renders appropriate representation components
4. Handles interactions and provides callbacks for analytics

All representation components are exported from `src/components/mathematics/index.ts` for easy importing.

### Testing and Documentation

- **Storybook stories**: All components have `.stories.tsx` files for visual documentation
- **Jest tests**: Unit tests verify rendering and prop handling
- **Teacher preview**: Assessment authoring page shows representation previews
- **Learner experience**: Take-assessment page displays representations above answer inputs

### Accessibility

All representation components include:
- ARIA labels and roles for screen readers
- Keyboard navigation support for interactive manipulatives
- High contrast support for dark mode
- Clear labeling and instructions

## Next Steps
1. Install dependencies once network access is available: `cd frontend && npm install`
2. Replace mocked dashboard data with FastAPI responses when the backend health endpoint ships
3. Extend `teachers/` and `learners/` routes with real analytics and interventions per EPIC 3
4. Add additional Storybook stories (tables, charts) and sync with future shadcn/ui primitives when designers deliver Figma specs
5. Wire the dev server into Docker Compose alongside the backend once containers are introduced
6. Expand representation types as new question patterns emerge (e.g., coordinate grids, tables, data visualizations)
