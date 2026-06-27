# /research - Research Workflow

You are running the **research phase** (Next.js 14 App Router + React 18 + TypeScript, pnpm, Zustand, TanStack Query, Tailwind v4 + flowbite-react, Jest). Your goal is to gather information, ask clarifying questions, and write a research document under `ai-research/`.

## Inputs the user may provide

- A free-form description of the work
- Neither (ask for at least one before proceeding)

Parse whatever the user supplied.

## Step 1 - Load shared context first

Before any codebase exploration, read these files (do not re-discover what is already documented):

1. `REPO_CONTEXT.md` - full architecture map: directory layout, BFF/auth flow, route handler inventory, state strategy, backend-discovery procedure, conventions, open questions
2. `AGENTS.md` - toolchain, commands, architecture overview, env vars, branch flow
3. `.github/copilot-instructions.md` - unit test conventions and reference test files
4. `package.json` - dependencies and npm scripts (`pnpm dev | build | start | lint | test | test:watch`)

## Step 2 - Story quality check

Skim the task and flag any of these **before** spending tool calls on exploration:

- Missing or vague requirements
- Unclear success criteria / acceptance criteria
- Ambiguous user needs
- Lack of constraints or assumptions
- Undefined terms

If any flag fires, ask the user before continuing. Do not invent answers.

## Step 3 - Assess scope and formalize story

Before deep exploration, assess whether this is:

- **Single story** - 1-3 phases, clear ACs (e.g. add a new chart variant, fix a form validation bug)
- **Multiple stories** - needs to be broken down into separate deliverables
- **Epic** - complex initiative spanning several features (e.g. introducing a new domain like `Goals` requires routing + store + UI + tests)

If the requirement is too broad or complex:

1. Break it into an **epic** with multiple stories
2. Each story should have 2-5 acceptance criteria
3. Each story should be independently deliverable
4. Ask the user which story to research first

## Step 4 - Scope discipline

Apply these constraints **before** exploration:

- Only research what the story explicitly requests
- Don't explore tangential refactors or "while we're here" cleanups
- Don't invent features the story doesn't mention
- If scope seems unclear, ask before exploring
- Respect the feature-sliced layout: changes belong in `src/features/<Domain>/` unless they are genuinely cross-cutting (in which case they go in `src/shared/`)
- **Do not clone or shell into the backend repo** (`BE_Personal_Finances`). It is private and lives outside this workspace. When the story needs backend info you cannot infer from the BFF code or `REPO_CONTEXT.md`, use the delegation procedure in `REPO_CONTEXT.md` → "When you need to learn more or add a proxied endpoint" and the template at `.opencode/command/backend-research.md` (Copilot equivalent: `.github/prompts/backend-research.prompt.md`). Draft the prompt, hand it to the user, and **wait** for their response — do not invent answers.

## Step 5 - Ask about scope and complexity

Use the `question` tool to resolve at minimum:

1. **Quick or full research?** Estimate complexity. For a small bug fix or one-line behavioral change:

   > "This looks small. Want a quick research note (~200 lines, lightweight template) or the full template (300-1000 lines)?"
   > Default to **full template** if unclear.

2. **Cross-feature or single-feature?** If the story seems to touch multiple features or areas:

   > "This looks like it might touch multiple features or areas of the codebase. Is that right? If so, I can do a more comprehensive research note that covers all relevant areas."
   > Default to **single feature** if unclear.

3. **Specific areas to focus on?** If the story is complex, ask:

   > "Are there any specific areas of the codebase or specific questions you want me to focus on during the research? This can help me prioritize and tailor the research note to your needs."

4. **Other story-specific clarifications** - e.g. UI library choices (flowbite vs custom atoms/molecules/organisms), accessibility expectations, i18n, date handling (`date-fns` vs `dayjs` vs `@internationalized/date`).

Batch all of these into a single `question` call to minimize back-and-forth. Do not invent answers. Default to the most comprehensive research if unclear.

## Step 6 - Write the research doc

File path: `ai-research/{story-name}.md` (create the directory if it does not exist).
Length target: **300-1000 lines** for full mode, **~200 lines** for quick mode.

The research doc must include:

### Story Definition

- Story title and description
- Acceptance Criteria (ACs) - 2-5 clear, testable criteria
- Task breakdown - if complex, break into subtasks
- Epic structure - if scope is too large, define constituent stories

### Technical Research

- **Affected areas** - reference the existing layout:
  - Routes / pages: `src/app/**` (note `export const dynamic = 'force-dynamic'` in `layout.tsx`)
  - API route handlers (proxy to backend via `process.env.BACKEND_URI`, auth via `jose` session cookie): `src/app/api/**`
  - Feature UI: `src/features/<Domain>/` (Accounts, Budgets, Categories, Charts, Dashboard, Login, Records)
  - Shared UI: `src/shared/ui/{atoms,molecules,organisms,tremor,icons}` (the last two are excluded from coverage)
  - Cross-cutting: `src/shared/{hooks,lib,utils,constants,types}`
  - State: `src/zustand/{store,provider}/` (components using `useDashboardStore` MUST be inside `DashboardStoreProvider`)
  - Tests: `__tests__/` mirroring `src/`; `__tests__/mocks/` and `__tests__/utils-test/` are ignored by the runner
- **Existing patterns to follow** - feature-sliced components, Zustand store + provider, TanStack Query via `QueryProviderWrapper`, Tailwind v4 + flowbite-react
- **Dependencies / integration points** - new deps must be added to `package.json` (pnpm); remember the env vars in `AGENTS.md` (CI only sets `REACT_APP_LOCAL_STORAGE=BUDGET_MASTER`)
- **Edge cases and constraints** - SSR vs client components (`'use client'`), `force-dynamic` layout, httpOnly session cookie flow, coverage always collected on test runs

### Open Questions

- List unresolved decisions
- Flag ambiguous requirements
- Note missing information

Focus on **high-level actions** needed to accomplish the task. No implementation details, no code snippets beyond illustrative file references.

## Step 7 - Capture non-obvious findings to memory

If research surfaces a non-obvious constraint, conflict or domain fact that future work would benefit from, write a short note under a memory location the project uses (skip this step if there is no established memory directory - the repo does not ship with one). Focus on insights that would not be easily discovered through code exploration alone (e.g. "the `next.config.mjs` is wrapped by the flowbite-react plugin, so any `next.config` edits must remain compatible").

## Step 8 - Present for review

End the turn with:

1. The path to the research doc
2. Story / Epic structure (if broken down)
3. A bullet list of unresolved open questions
4. A bullet list of assumptions made
5. A reminder that PRs target `develop` and must carry exactly one of `major | minor | patch` label

Do **not** start planning or writing code. Wait for human sign-off.

## Don'ts

- Don't propose implementation - that is the planning phase
- Don't write or modify source files (other than the research doc)
- Don't run tests, builds, or `pnpm install`
- Don't write a 1,000-line research doc when the story is small; cut sections aggressively
- Don't suggest edits to `CHANGELOG.md` or a manual version bump in `package.json` - `develop-pipeline.yml` handles that on merge to `develop`
