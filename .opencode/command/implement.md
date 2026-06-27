---
description: "Execute an approved planning doc phase by phase. Read ai-planning/planning-*.md, execute each phase with discipline, and write a completion report with the results of each phase and any open questions or assumptions for user review."
---

# /implement - Story implementation workflow

You are running the **implementation phase** for a story on `clean-next-budget-master` (Next.js 14 App Router + React 18 + TypeScript, pnpm, Zustand, TanStack Query, Tailwind v4 + flowbite-react, Jest). Input is a sign-offed planning document; output is a completed implementation and a structured completion report.

## Inputs the user may provide

- A planning doc path (e.g. `ai-planning/planning-{story-name}.md`) — ideal
- Nothing — list available planning docs under `ai-planning/*.md` and ask which one to implement

## Step 1 - Load shared context first

Read in order:

1. **The planning document** (provided by the user, or selected from `ai-planning/*.md`). This is the source of truth for the implementation — do not invent changes that aren't in the plan.
2. `REPO_CONTEXT.md` (at the repo root) — full architecture map. **Especially the "Adding new code" section** and the route handler table. You will update both as needed at the end.
3. `AGENTS.md` — toolchain, commands, env vars, branch flow. PRs target `develop`; the PR must carry exactly one of `major | minor | patch`; `CHANGELOG.md` and `package.json` version are managed by `develop-pipeline.yml`, never by hand.
4. `.github/copilot-instructions.md` — unit test conventions. **Treat the rules here as hard constraints** (see Step 4).
5. `package.json` — dependencies and scripts.
6. The research doc the plan was based on (`ai-research/{story-name}.md`) — for cross-referencing ACs and assumptions.
7. If the plan touches a new BFF route handler that needed backend info, confirm the user already ran `.opencode/command/backend-research.md` (Copilot equivalent: `.github/prompts/backend-research.prompt.md`) and pasted the response into the research doc.

## Step 2 - Confirm plan-ready

Before writing code, confirm:

- The plan exists at `ai-planning/planning-{story-name}.md` and all its open questions are resolved.
- The user has approved running implementation (assume yes if they invoked `/implement`).
- **Branch**: integration branch is `develop`. Ask the user whether to branch off `develop` (recommended) or work on an existing feature branch. Never base implementation on `main` (this repo does not have a `main`).
- **Working tree clean** (`git status` shows no uncommitted changes from prior work). If dirty, ask the user to stash, commit, or discard before proceeding.

## Step 3 - Execute phase by phase

For each phase in the plan:

1. **Make the file changes** specified in the "Changes Required" section. Stay faithful to the structure shown in the plan; fill the implementation details as you go. Cite the plan section you're working from as you make each change.
2. **Run the phase's automated success criteria** — `pnpm test`, `pnpm build`, `pnpm lint`, `pnpm dev` (visual smoke), per the plan. For targeted tests: `pnpm test -- __tests__/path/to/file.test.tsx`.
3. **Fix anything that fails before moving on.** Do not start the next phase with red tests or a red build.
4. **Update the implementation checklist** in the planning doc — check off completed tasks as you finish them.
5. **Pause for review between phases** unless the user explicitly said "run-all" or "no pause."

## Step 4 - Apply repo conventions while implementing

These are non-negotiable. If the plan asks for something that violates one of these, stop and ask — the plan may have an error.

- **File layout**: respect the feature-sliced structure — new domain UI goes in `src/features/<Domain>/`, new shared UI in `src/shared/ui/{atoms,molecules,organisms}`, new shared code in `src/shared/{hooks,lib,utils,constants,types}`. Cross-cutting state goes in `src/zustand/`. BFF route handlers go in `src/app/api/<domain>/route.ts`. Do not create top-level `src/components/`, `src/hooks/`, or similar.
- **Naming**: components/files in `kebab-case.tsx`; Zustand stores as `<name>.store.ts`; providers as `<name>-store-provider.tsx`; shared libs as `<name>.lib.ts`; shared utils as `<name>.utils.ts`; shared types as `<name>.types.ts`.
- **Path alias**: use `@/*` for `src/*` (see `tsconfig.json`). Never use deep relative imports like `../../../../shared/...`.
- **Server vs client components**: add `'use client'` at the top of any file using hooks, Zustand, TanStack Query, `sonner`, `motion`, browser APIs, or event handlers. Route handlers under `src/app/api/**` are server-side by default — do not add `'use client'` there.
- **State strategy**: server state → TanStack Query (`useQuery` / `useMutation`); client state → Zustand via the per-store provider; form state → `react-hook-form` + `yup`. Never duplicate server data into Zustand.
- **Auth**: never read the session cookie from a client component. All BFF route handlers funnel through `getAccessToken()` from `@/shared/lib/auth.lib`. Never store tokens in `localStorage`.
- **Styling**: Tailwind v4 utility classes first; reach for `flowbite-react` components when one exists for the use case. Do not introduce new CSS-in-JS or new utility libraries without an explicit AC.
- **Do not remove pre-existing `console.log` / `console.warn` / `console.error` statements** unless the plan explicitly says to remove them. If the plan doesn't mention them, assume they are there for a reason and leave them in.
- **Do not edit `CHANGELOG.md` or manually bump `package.json`'s `version` field.** `develop-pipeline.yml` owns both on merge to `develop`.
- **Do not clone or modify the backend repo** (`BE_Personal_Finances`). If implementation surfaces a need for backend changes, stop and use the delegation template at `.opencode/command/backend-research.md` (Copilot: `.github/prompts/backend-research.prompt.md`).

## Step 5 - Tests

Tests are part of the implementation — never skip them. Follow the rules in `.github/copilot-instructions.md` as hard constraints:

- **Wrap the right way**:
  - Components using `next/navigation` router → wrap with `AppRouterContextProviderMock` (from `src/shared/ui/organisms/AppRouterContextProviderMock.tsx`); add `push: jest.fn()`.
  - Components using `useQuery` / `useMutation` → wrap with `QueryProviderWrapper` (from `src/app/QueryProviderWrapper.tsx`).
  - Components using `useDashboardStore` → wrap with `DashboardStoreProvider`; seed with `mockAccounts` from `__tests__/mocks/accounts.mock.ts`.
  - Components touching `next/headers` cookies → mirror the `jest.mock('next/headers', ...)` pattern from `__tests__/home.test.tsx`.
  - Components depending on `ResizeObserver` → mirror the mock from `__tests__/features/Dashboard/StatisticsSubscreen.test.tsx`.
- **Don't mock**: the component under test, custom hooks, `sonner`, `next/navigation`, or utilities like `@/shared/utils/*`. Add `__tests__/mocks/<domain>.mock.ts` for new test data instead of mocking.
- **Use `userEvent`** (from `@testing-library/user-event`), not `fireEvent`.
- **Query via `screen`**, not `querySelector` or `container.querySelector(...)`. Don't extract `container` from `render(...)`.
- **Assert on behavior and rendered content**, not on CSS classes or inline styles.
- **No `require()`** — use static `import` statements at the top of every test file.
- **Silence console in tests** when the source legitimately logs (e.g. axios errors in catch blocks) and the test isn't asserting on the log: add `jest.spyOn(console, 'log').mockImplementation(() => {})` (and the same for `warn` / `error` if needed) at the top of the test file. Do not remove or comment out the `console` statements in the source — they may be there for a reason (see Step 4).
- **Test files live under `__tests__/`, mirroring `src/`**. `__tests__/mocks/` and `__tests__/utils-test/` are **ignored by the test runner** (`testPathIgnorePatterns`) — only put shared fixtures/helpers there, never real tests.
- **Coverage is always collected** — every `pnpm test` run writes to `coverage/`. CI doesn't enforce a threshold yet (see `jest.config.ts`), but try to cover any new branch.

Iterate until tests pass. If a test fails, fix the implementation (or the test setup, if the test itself was wrong) — do not weaken the assertion, mock the failing piece to make it pass, or comment out the test.

## Step 6 - Final steps (run before declaring done)

- **Update `REPO_CONTEXT.md`** if you added a route handler (move it from the "Not yet proxied" list to the route table), a new feature domain, a new Zustand store, a new shared component/helper, or any other structural change. This is a living document — keep it accurate.
- **Final test run**: `pnpm test` — must be green. Coverage report in `coverage/` is fine to skim but not required to inspect deeply unless the user asks.
- **Final build**: `pnpm build` — must be green. This is the de-facto typecheck since there is no separate `typecheck` script.
- **Final lint**: `pnpm lint` — must be clean. Do not disable rules to make it pass; fix the code or update the rule with the user's approval.
- **Implementation checklist in planning doc** — every box checked off, or any unchecked items called out as deferred in the report.
- **Do not** edit `CHANGELOG.md` or `package.json` version — CI handles those on merge to `develop`.

## Step 7 - Capture follow-ups

If implementation surfaces something that wasn't in the plan and isn't worth blocking on:

- Note it as a "Deferred follow-up" in the final report (Step 8) so the user can decide.
- If the user has set up a memory location (the repo does not ship with one), you can write a short note there. Focus on insights that would not be easily discovered through code exploration alone (e.g. "the BFF's `getAccessToken` returns null during static prerender — wrap any page that calls it with a Suspense boundary").
- Do not start a new story to address follow-ups without going through `/research` again.

## Step 8 - Present for review

End the turn with:

1. **Files created / modified / deleted** — list with paths. Use a format the user can review at a glance.
2. **Phase status** — per-phase pass/fail of the automated success criteria.
3. **Test / build / lint status** — final command results.
4. **`REPO_CONTEXT.md` updated** — yes/no and what changed.
5. **Deferred follow-ups** — bullet list of anything noted but not done.
6. **Suggested next step** — e.g. "ready to commit on a feature branch off `develop`" (but **do not** commit, push, or open a PR without explicit approval — see Don'ts).

Do **not** create the PR, push the branch, or amend any existing commit unless the user explicitly asks. Wait for human sign-off.

## Don'ts

- Don't start implementing without an approved (sign-offed) planning doc.
- Don't skip tests because they're tedious or because "the change is trivial." Every code change has a corresponding test entry in the plan.
- Don't bypass safety checks (lint, type errors via `pnpm build`, the test suite).
- Don't push, force-push, or open a PR without explicit user approval.
- Don't add features beyond what the plan specifies. If something seems missing, stop and ask — don't improvise.
- Don't remove pre-existing `console.log` / `console.warn` / `console.error` statements in source files (see Step 4 and Step 5).
- Don't edit `CHANGELOG.md` or `package.json`'s `version` field — `develop-pipeline.yml` does that on merge to `develop`.
- Don't clone or modify `BE_Personal_Finances`. If a backend change is needed, use the delegation template at `.opencode/command/backend-research.md` (Copilot: `.github/prompts/backend-research.prompt.md`) and stop until the user pastes the backend agent's response.
- Don't mock the component under test, custom hooks, `sonner`, `next/navigation`, or shared utilities (see Step 5).
- Don't assert on CSS classes, extract `container` from `render(...)`, use `querySelector`, use `require()`, or use `fireEvent` (see Step 5).
- Don't weaken a failing test to make it pass; fix the implementation or the test setup.
- Don't start a new story for a follow-up without going through `/research` again.
