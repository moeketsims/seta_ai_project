# Repository Guidelines

This guide sets shared expectations for contributors and tools. It applies to the entire repository.

## Project Structure & Module Organization
- Current: root contains documentation (e.g., `project.md`).
- When adding code, use:
  - `src/` – application/library code
  - `tests/` – unit/integration tests
  - `docs/` – long‑form docs and ADRs
  - `scripts/` – utility scripts and one‑liners
- Keep modules small; add a brief `README.md` for non‑obvious packages.

## Build, Test, and Development Commands
- No build tooling is committed yet. Prefer Make targets that proxy language tools.
- Examples (adopt as needed):
  - `make setup` – install dependencies (`pip install -r requirements.txt` or `npm ci`).
  - `make test` – run the test suite locally.
  - `make fmt` – auto‑format (Black/isort or Prettier).
  - `make lint` – static checks (flake8/ruff or ESLint).
- Without Make:
  - Python: `python -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt && pytest -q`
  - Node: `npm ci && npm test`

## Coding Style & Naming Conventions
- Markdown: one `#` H1 per file, 80–100 col soft wrap, kebab‑case filenames (e.g., `getting-started.md`).
- Python (if used): 4‑space indent; `snake_case` functions/vars; `PascalCase` classes; format with Black; sort imports with isort.
- JS/TS (if used): Prettier + ESLint; `camelCase` variables; `PascalCase` components.
- Prefer pure helpers in `src/utils/`; keep functions under ~40 lines where practical.

## Testing Guidelines
- Place tests under `tests/`; mirror `src/` paths (e.g., `src/foo/bar.py` → `tests/foo/test_bar.py`).
- Names: `test_*.py` (pytest) or `*.spec.ts` (Jest/Vitest).
- Aim for ≥80% line coverage; include one happy‑path and one edge‑case per public function.

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`.
- Subject in imperative mood, ≤72 chars; add rationale in body when non‑trivial.
- PRs: link issues, describe changes/risks, include screenshots for UI, note test coverage, and update docs.

## Security & Configuration Tips
- Never commit secrets. Use `.env.local`; provide `example.env` for templates.
- Ignore large artifacts: `.venv/`, `node_modules/`, `dist/`, `*.log`, and generated data.

## Agent‑Specific Instructions
- Scope: these rules apply across this repository. Keep changes minimal and focused; avoid unrelated refactors; update docs and tests with any code change.

