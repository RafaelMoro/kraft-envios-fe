---
description: "Convert a research doc into an implementation plan. Reads ai-research/*.md, defines phases, specifies file-level changes, and writes ai-planning/planning-*.md"
---

# /plan - Story Planning workflow

You are running the **planning phase** for a story on `clean-next-budget-master` (Next.js 14 App Router + React 18 + TypeScript, pnpm, Zustand, TanStack Query, Tailwind v4 + flowbite-react, Jest). Input is a completed, sign-offed research document; output is an actionable implementation plan under `ai-planning/`.

## Inputs the user may provide

- A research doc path (e.g. `ai-research/{story-name}.md`) — ideal
- Nothing — list available research docs under `ai-research/*.md` and ask which one to plan

## Step 1 - Load shared context first

Read in order:

1. **The research document** (provided by the user, or selected from `ai-research/*.md`). This is the source of truth for scope, affected files, ACs, and open questions. **If the research doc is not yet sign-offed, stop and ask the user** — do not plan over a draft.
2. `REPO_CONTEXT.md` (at the repo root) — full architecture map: directory layout, BFF/auth flow, route handler inventory, state strategy, conventions for adding new code, external backend reference. **Especially read the "Adding new code" and "External backend reference" sections.**
3. `AGENTS.md` — toolchain, commands, env vars, branch flow (PRs target `develop`; one of `major | minor | patch` label is required).
4. `.github/copilot-instructions.md` — unit test conventions and reference test files. **Treat the rules here as hard constraints** (no mocking the component under test, no `fireEvent`, no `querySelector`, no CSS-class assertions, no mocking `sonner` or `next/navigation`, no `require()`, always `userEvent`, always query via `screen`).
5. `package.json` — dependencies and scripts (`pnpm dev | build | start | lint | test | test:watch`).
6. `__tests__/mocks/{accounts,budgets,categories,records}.mock.ts` and the reference test files cited in `REPO_CONTEXT.md` → Testing conventions (e.g. `__tests__/home.test.tsx` for cookies, `__tests__/features/Dashboard/StatisticsSubscreen.test.tsx` for `ResizeObserver`).

If the research flagged a need for backend info (e.g. a new BFF route to a not-yet-proxied endpoint), confirm the user has already run the delegation at `.opencode/command/backend-research.md` (Copilot equivalent: `.github/prompts/backend-research.prompt.md`) and pasted the response. **If not, stop and tell the user to do that first** — do not invent backend contracts.

## Step 2 - Verify research is plan-ready

Before drafting the plan, confirm:

- All "Open Questions" in the research doc are resolved **or** explicitly deferred with a recorded assumption.
- Each acceptance criterion is unambiguous, testable, and traces to a concrete change in this repo.
- The "Affected areas" list in the research doc is consistent with the current `src/` layout (no files moved since research).
- Backend dependencies are resolved (DTOs known, no version bumps needed, CORS pre-cleared) — or, if not, an explicit assumption is recorded.

If anything is unresolved, ask the user before proceeding. **Do not guess answers to open questions — that's what the research phase was for.**

## Step 2.5 - Scope discipline (do this before any phase work)

The plan covers **only** what the story explicitly asks for. For every concrete item you're about to add (a constant, a file, a test, a helper, a refactor, a prop, a piece of error handling), it must trace to one of:

1. A specific acceptance criterion in the story, **or**
2. A direct technical prerequisite of an AC, **or**
3. A repo convention enforced by `REPO_CONTEXT.md` / `AGENTS.md` / `.github/copilot-instructions.md`, **or**
4. A research-doc finding the user explicitly accepted in the research Q&A.

If an item doesn't trace to one of those, it is **out of scope**. Common temptations to refuse:

- **Speculative error handling.** Don't add try/catches, fallbacks, or alerts for failure modes the story doesn't mention. Trust internal code; only handle errors at boundaries the story implies.
- **Telemetry / logging / caching** that the story doesn't mention.
- **Refactors of nearby code** that the story doesn't ask for, even if they look tempting (e.g. "while we're here, let's also clean up that other route handler").
- **Tests for invented behavior.** Tests cover what the plan actually builds. If the behavior isn't planned, neither is the test.
- **Nice-to-haves** that aren't required by an AC.
- **Backend changes.** This repo is the BFF. If a needed change lives in `BE_Personal_Finances`, do not include it in this plan — surface it as an open question for the user to take to the backend agent.

When tempted to include something speculative, instead:

- Note it under "Open Questions" in the research doc for future phases, **or**
- If it's a technical prerequisite, trace it to the AC it supports and ask the user to confirm it's in scope before including it, **or**
- Drop it entirely.

The story's own words are the highest authority. Repo conventions are second. Research findings the user accepted are third.

## Step 3 - Define phases

Break into phases, each independently testable. Common patterns for this repo:

| Story type                                                 | Phase pattern                                                                                                                                                       |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **New feature domain** (e.g. new `src/features/<Domain>/`) | Scaffolding (folders, types, store if needed) → UI (atoms/molecules/organisms + `accounts` of feature) → wiring to BFF route handler → tests                        |
| **New BFF route handler**                                  | Types (request/response) → handler (`src/app/api/<domain>/route.ts`, mirror `accounts/route.ts` pattern) → tests for handler → update `REPO_CONTEXT.md` route table |
| **New page**                                               | `src/app/<route>/page.tsx` + supporting components → integration with existing layouts/nav → tests                                                                  |
| **New Zustand store**                                      | `store/<name>.store.ts` + `provider/<name>-store-provider.tsx` → seed in test mock → consumer component wiring → tests                                              |
| **Form feature**                                           | Yup schema → `react-hook-form` integration → form components → submission + success/error UI → tests                                                                |
| **Bug fix**                                                | Root cause + fix → regression test → verification (manual or automated)                                                                                             |
| **Test-only / refactor**                                   | Identify scope → change → run `pnpm test` (coverage is always collected) → verify no behavior change                                                                |

Don't create a phase for "lint/format" or "code review" — those are PR concerns, not phases.

## Step 4 - Specify changes per phase

For each phase, include a **"Changes Required"** section that specifies:

For each file change:

- **Exact path** — e.g. `src/app/api/categories/route.ts`, `src/features/Categories/CreateCategoryButton.tsx`, `src/zustand/store/categories.store.ts`, `__tests__/app/api/categories/route.test.ts`.
- **Action**: Create / Modify / Delete.
- **For modifications**: line range or "after line x".
- **Code structure**: function signatures, key logic, critical conditionals. **Not full implementations.**
- **Edge cases** worth flagging (only the non-obvious ones — SSR vs client, `force-dynamic` interaction, httpOnly cookie flow, Zustand provider requirement).
- **Rationale**: a 1-2 sentence "why" only when not self-evident.

Stay concise. Show the implementer what to build; don't write it for them. Target **500-700 lines** for the whole plan.

## Step 5 - Specify success criteria per phase

Each phase needs:

- **Automated** — exact commands using pnpm. For this repo, typical:
  - `pnpm test` (always collects coverage; targeted: `pnpm test -- __tests__/path/to/file.test.tsx`)
  - `pnpm dev` (visually check no console errors / no `force-dynamic` warnings)
  - `pnpm build` (catches type errors since there's no separate `typecheck` script)
  - `pnpm lint`
- **Manual** — specific user-facing steps (click X, see Y, refresh, log out and back in, etc.).

## Step 6 - Specify test coverage (not test code)

Add a table like this example:

| File                                              | Coverage areas                                                    | Pattern reference                                                                                                 |
| ------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `src/app/api/categories/route.ts`                 | POST 201, POST 400 (validation), unauth 401 path                  | Mirror `__tests__/app/api/accounts/route.test.ts` (if it exists) or `__tests__/home.test.tsx` cookie-mock pattern |
| `src/features/Categories/CreateCategoryModal.tsx` | Open/close, form submit calls mutation, error toast, success path | Wrap with `QueryProviderWrapper`; use `userEvent`; query via `screen`                                             |
| `src/zustand/store/categories.store.ts`           | Initial state, add/remove action, selector behavior               | Mirror `__tests__/zustand/dashboard.store.test.ts` (if it exists)                                                 |

Test patterns to follow (cite the reference file in the table):

- **Router mocks** — `AppRouterContextProviderMock` from `src/shared/ui/organisms/AppRouterContextProviderMock.tsx`.
- **Query mocks** — `QueryProviderWrapper` from `src/app/QueryProviderWrapper.tsx`.
- **Zustand mocks** — `DashboardStoreProvider` + `mockAccounts` from `__tests__/mocks/accounts.mock.ts`.
- **Cookie mocks** — `__tests__/home.test.tsx` (lines 13-18 style) using `jest.mock('next/headers', ...)`.
- **`ResizeObserver` mock** — `__tests__/features/Dashboard/StatisticsSubscreen.test.tsx`.

**Hard rules** (from `.github/copilot-instructions.md`): never mock the component under test, never mock `sonner` or `next/navigation`, never assert on CSS classes, never extract `container` from `render()` or use `querySelector`, never use `require()`, always use `userEvent` (not `fireEvent`), always query via `screen`.

Describe **what** to test, not how. Full test code belongs in the implementation phase.

## Step 7 - Write the planning doc

File path: `ai-planning/planning-{story-name}.md` (create the directory if it does not exist).
Length target: **500-700 lines**. If you exceed it, you're writing implementation, not a plan. The AC is probably too broad and needs to be broken into multiple stories.

The planning doc should follow the structure implied by Steps 3-6:

1. **Header** — story name, source research doc path, sign-off date, PR label.
2. **Acceptance Criteria** — copied from the research doc, in order.
3. **Affected files** — full inventory grouped by area (`src/app/api/**`, `src/features/<Domain>/**`, `src/zustand/**`, `src/shared/**`, `__tests__/**`).
4. **Phases** — one section per phase, each with **Changes Required**, **Success Criteria**, and **Test Coverage**.
5. **Cross-cutting concerns** — only those the AC actually implies (e.g. "this feature needs the user to be logged in, so wrap the page in the dashboard layout").
6. **Open Questions / Out-of-scope items** — anything the research left dangling, plus any near-temptations you deliberately refused.

## Step 8 - Capture planning insights to memory

If planning reveals non-obvious technical decisions or constraints that future work would benefit from, write a short note under a memory location the project uses (the repo does not ship with one — skip this step unless the user has set one up). Focus on insights that would not be easily discovered from the code alone (e.g. "the BFF's `getAccessToken` returns null during static prerender — wrap any page that calls it with a Suspense boundary").

## Step 9 - Present for review

End the turn with:

1. **Path to the planning doc.**
2. **Phase summary** — one line per phase.
3. **Assumptions made** — bullet list of anything the research didn't fully cover and you decided to assume.
4. **Unresolved questions** — bullet list of anything the user still needs to answer before implementation.
5. **Decisions beyond the research doc** — bullet list of any calls you made the research didn't make (and why).
6. **PR flow reminder** — target branch is `develop`; the PR must carry exactly one of `major | minor | patch`; `CHANGELOG.md` and `package.json` version are managed by `develop-pipeline.yml`, not by the PR.

Do **not** start implementing. Wait for human sign-off.

## Don'ts

- Don't write source files, tests, or run commands.
- Don't include full code implementations — show structure.
- Don't repeat content already in the research doc — link to it.
- Don't add phases for things tooling handles (linting, formatting, the CI version bump, the CHANGELOG entry).
- Don't invent answers to open questions left unresolved by research.
- Don't invent specifics the story doesn't supply. If the story says "do X" without specifying how, don't invent the how — note it as an open question for the user to answer.
- Don't propose changes to `BE_Personal_Finances`. If a needed change lives there, surface it as an open question and use the `.opencode/command/backend-research.md` delegation template (Copilot: `.github/prompts/backend-research.prompt.md`) when the user is ready.
- Don't edit `CHANGELOG.md` or manually bump `package.json` — `develop-pipeline.yml` does that on merge to `develop`.
