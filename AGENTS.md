# Repository Guidelines

## Project Structure & Module Organization
- `frontend/` contains the active application: a Vite + React + TypeScript prototype with Tailwind styling and shadcn-style UI primitives.
- Main entry points live in `frontend/src/main.tsx` and `frontend/src/App.tsx`.
- Reusable UI components live in `frontend/src/components/ui/`; orchestration-specific views live in `frontend/src/components/orchestration/`.
- Demo data and view models live in `frontend/src/data/`; shared helpers live in `frontend/src/lib/`.
- `backend/` exists as a placeholder for future server work and is currently empty.
- Ignore generated or local-only content such as `frontend/dist/`, `frontend/node_modules/`, and `.codex/`.

## Build, Test, and Development Commands
- Run from `frontend/` unless noted otherwise.
- `npm install` installs frontend dependencies.
- `npm run dev` starts the local Vite dev server.
- `npm run build` performs a strict TypeScript check with `tsc --noEmit` and then creates a production build.
- `npm run preview` serves the built app locally for a final smoke check.

## Coding Style & Naming Conventions
- Use TypeScript with `strict` mode expectations; keep types explicit when inference is unclear.
- Follow the existing style: 2-space indentation, single quotes, and no semicolons.
- Use the `@/` alias for imports from `frontend/src/` (for example, `@/components/ui/button`).
- Export React components in PascalCase, but keep file names lowercase or kebab-case, matching the current pattern such as `flow-node.tsx` and `button.tsx`.
- Prefer small, focused modules: UI primitives in `components/ui`, feature-specific code near the feature.

## Testing Guidelines
- No automated test runner is configured yet.
- Until tests are added, use `npm run build` as the required verification step before opening a PR.
- When adding tests, place them next to the feature or under `frontend/src/` using `*.test.ts` or `*.test.tsx`.

## Commit & Pull Request Guidelines
- The current history only contains `Initial commit`; use short, imperative commit subjects like `Add workflow node badge states`.
- Keep commits scoped to one change set and include context in the body when behavior or structure changes.
- PRs should include: a concise description, impacted paths, manual verification steps, and screenshots or short recordings for UI changes.
- Link related issues when available and note any follow-up work explicitly.
