# Move The Sign-In Screen From `/` To `/login`

**Story of epic** — see `ai-research/landing-page.epic.md`.

**Date:** 2026-07-25
**Mode:** Full research (short — the change is mechanical, the risk is in the redirect surface)
**Story number:** 1 of 2

## Story Definition

### Title

Relocate the sign-in screen to `/login` and free up `/` for the public landing page.

### Description

`src/app/page.tsx` is the sign-in entrypoint today. It reads `?redirect=`, sanitizes it, checks `getAccessToken()`, sends authenticated admins to the sanitized destination and everyone else authenticated to `/dashboard`, and otherwise renders `features/Login/Login`.

This story moves that page — behavior unchanged — to `src/app/login/page.tsx`, and repoints every "go to sign-in" affordance in the app at `/login`. `/` is left temporarily rendering nothing meaningful; Story 2 fills it with the landing. To avoid shipping a broken root in isolation, this story includes a minimal placeholder at `/` that redirects to `/login` **only until Story 2 lands** (see Task 5 and its explicit removal note).

The good news the research turned up: `LOGIN_ROUTE` in `src/shared/constants/global.constants.ts` is the single definition of the sign-in path, every consumer imports it, and a repo-wide grep for hardcoded root navigation returns zero hits. Changing one constant moves the entire app. There is no `middleware.ts` to update.

### Acceptance Criteria

1. Navigating to `/login` renders the sign-in screen with identical behavior to today's `/`: anonymous visitors see the login form; authenticated admins are redirected to the sanitized `?redirect=` destination; every other authenticated user is redirected to `/dashboard`; a hostile or missing `?redirect=` falls back to `/dashboard`.
2. `/login?redirect=/dashboard/requests/{id}` still round-trips an admin to that request page after a successful sign-in, preserving the balance email deep-link flow end to end.
3. Every in-app "back to sign-in" affordance resolves to `/login`: register result and personal-information back-links, forgot-password success redirect and back-link, reset-password back-link and status card, the dashboard sign-out redirect, and the `LoginRequiredModal`.
4. Signing out revalidates the sign-in route and lands the user on `/login` with session and user-info cookies cleared.
5. `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`, and `pnpm test` pass, with `__tests__/home.test.tsx` migrated to the new route.

### Task Breakdown

1. Create `src/app/login/page.tsx` by moving `src/app/page.tsx` verbatim.
2. Change `LOGIN_ROUTE` from `"/"` to `"/login"` in `src/shared/constants/global.constants.ts`.
3. Verify all nine source consumers still behave correctly with the new value (none should need edits — they all import the constant).
4. Migrate `__tests__/home.test.tsx` → `__tests__/login.test.tsx`, importing the page from its new path.
5. Add a temporary `src/app/page.tsx` that redirects to `LOGIN_ROUTE`, with a comment marking it for removal by Story 2.
6. Update `REPO_CONTEXT.md` and `AGENTS.md`, both of which currently state that `src/app/page.tsx` is the login entrypoint.

## Technical Research

### Affected areas

**Routes/pages**

| File | Change |
| --- | --- |
| `src/app/page.tsx` | Moves to `src/app/login/page.tsx`; replaced by a temporary redirect stub (removed in Story 2). |
| `src/app/login/page.tsx` | New. Contents identical to today's root page, including the `HomePageProps` optional-`searchParams` shape. |

**Shared constants**

| File | Change |
| --- | --- |
| `src/shared/constants/global.constants.ts` | `LOGIN_ROUTE` `"/"` → `"/login"`. Single-line change; this is the whole mechanism. |

**Consumers of `LOGIN_ROUTE` — verify, do not edit**

All nine import the constant, so they follow automatically. Each still needs a behavioral check:

| File | Line | Use |
| --- | --- | --- |
| `src/app/api/auth/sign-out/route.ts` | 11 | `revalidatePath(LOGIN_ROUTE)` |
| `src/features/Balance/BalanceAdminRequestDetail.tsx` | 93 | `router.push(\`${LOGIN_ROUTE}?${LOGIN_REDIRECT_PARAM}=…\`)` on a `400` from its data query |
| `src/features/Dashboard/Dashboard.tsx` | 38 | `router.push(LOGIN_ROUTE)` after sign-out |
| `src/features/Login/ForgotPassword/ForgotPasswordCard.tsx` | 36, 76 | Post-submit `router.push` and a `LinkButton href` |
| `src/features/Login/Register/ResultCard.tsx` | 24, 45 | Two `LinkButton href` |
| `src/features/Login/Register/PersonalInformation.tsx` | 83 | "Volver" `LinkButton href` |
| `src/features/Login/ResetPassword/ResetPasswordCard.tsx` | 82 | "Volver al inicio" `LinkButton href` |
| `src/features/Login/ResetPassword/ResetPasswordStatusCard.tsx` | 28 | `LinkButton href` |
| `src/shared/ui/organisms/LoginRequiredModal.tsx` | 29 | "Iniciar sesión" `LinkButton href` |

**Tests**

| File | Change |
| --- | --- |
| `__tests__/home.test.tsx` | Rename to `__tests__/login.test.tsx`; update the `import HomePage from '../src/app/page'` to the new path. Its five cases (render, admin-redirect, non-admin-redirect, missing-user-info, hostile-redirect) all still apply unchanged. |
| `__tests__/feature/Login/ForgotPassword/ForgotPasswordCard.test.tsx` | Line 110 asserts `push` was called with `LOGIN_ROUTE`. Because it imports the constant, it passes with no edit — this is the pattern to preserve. |
| `__tests__/feature/Login/Register/PersonalInformation.test.tsx` | Line 75 asserts `href` equals `LOGIN_ROUTE`. Same — no edit. |
| `__tests__/feature/Login/Register/ResultCard.test.tsx` | Lines 55, 117 assert `href` equals `LOGIN_ROUTE`. Same — no edit. |

That the existing tests assert against the constant rather than a literal `"/"` is what makes this migration cheap. Keep it that way: do not "clarify" any assertion by inlining `'/login'`.

**Docs**

| File | Change |
| --- | --- |
| `REPO_CONTEXT.md` | Three statements to correct: the "Key invariants" bullet about `src/app/page.tsx`, the `src/app/` directory table row for `page.tsx`, and the "Key Files" table row. The post-login return-URL bullet also names `src/app/page.tsx`. |
| `AGENTS.md` | The "App Structure" bullet stating `src/app/page.tsx` is the login entrypoint. |

### Existing patterns to follow

- **Server page, `redirect()` from `next/navigation`.** The moved page keeps its `async` server-component form; do not convert it to a client component.
- **`searchParams` must stay optional.** `HomePageProps` declares `searchParams?`, and the destructure in the test calls the page as `await HomePage({ searchParams })`. `REPO_CONTEXT.md` records that page tests invoke pages as bare async functions, so any prop must remain optional with a default.
- **Sanitization is unchanged.** `sanitizeDashboardReturnUrl()` in `src/shared/utils/global.utils.ts` allowlists same-origin `/dashboard` paths only. It is independent of where the login page lives; it must not be touched.
- **The `ponytail:` comment convention.** `src/app/page.tsx` line 17 carries a `// ponytail:` marker on the defensive admin-role guard. Preserve it verbatim in the move.

### Testing rules to follow

Per `.github/copilot-instructions.md`:

- Wrap in `AppRouterContextProviderMock` and `QueryProviderWrapper` exactly as `__tests__/home.test.tsx` already does.
- Mock `next/navigation`'s `redirect` and `../../src/shared/lib/auth.lib` with **relative** paths inside `jest.mock()`, as the existing file does.
- Do not mock `features/Login/Login` or any internal component.
- Keep the mocked `LoginData` shapes matching `src/shared/types/login.types.ts`.

### Dependencies and integration points

- No new packages, no lockfile change, no env change.
- No `src/app/api/**` handler needs edits. `sign-out/route.ts` reads the constant, so its `revalidatePath` follows automatically.
- No `middleware.ts` exists — nothing to add.

### Edge cases and constraints

- **The temporary `/` stub is a deliberate liability.** If Story 2 slips, `/` permanently 302s to `/login`, which is worse than today for anyone with a `/` bookmark expecting a page. Mark it with a removal comment naming Story 2, and do not let it acquire logic.
- **The balance email deep link is unaffected but must be regression-tested.** `buildBalanceRequestDetailRoute` is marked in `REPO_CONTEXT.md` as a stable destination that already-sent emails depend on. This story does not change it. The path that *does* change is the `400`-fallback in `BalanceAdminRequestDetail.tsx`, which now pushes `/login?redirect=…`. Verify: expired session + email link → `/login?redirect=/dashboard/requests/{id}` → sign in as admin → lands on the request page.
- **Sign-out double-check.** `Dashboard.tsx` pushes `LOGIN_ROUTE` *after* calling the sign-out endpoint, and the endpoint also calls `revalidatePath(LOGIN_ROUTE)`. Both now target `/login`. Confirm no stale cached render of the old `/` login page is served.
- **Non-admin authenticated users still bypass `?redirect=`.** The current page only honors the sanitized redirect for admins; everyone else goes to `/dashboard`. This is existing behavior, verified by two of the five tests. Preserve it; this story is not the place to reconsider it.
- **Static-vs-dynamic rendering.** `src/app/page.tsx` reads cookies via `getAccessToken()`, which opts the route into dynamic rendering. Moving that to `/login` means `/` loses its cookie read — which is exactly what Story 2 wants (a fully static landing), but it also means `/` and `/login` will have different rendering modes. Confirm the build output marks `/login` dynamic and `/` static after Story 2.
- **External links.** Any sign-in link that exists outside this repo (backend email templates, bookmarks, marketing) pointing at `/` will now hit the landing rather than a login form. The landing's header carries an "Iniciar sesión" CTA, so the user is one click away — acceptable, but worth telling whoever owns the backend email templates.

## Open Questions

### UI/product decisions

**I:** Question: Should `/` permanently redirect to `/login` for authenticated users, or always serve the landing?
Status: answered
Answer: Always serve the landing. Confirmed in epic scoping — the landing is public to everyone and performs no auth read and no redirect.
Context: This is why the `/` stub in Task 5 is explicitly temporary rather than the final state.

**II:** Question: Should there be a permanent redirect from any other legacy path to `/login`?
Status: answered
Answer: No. No legacy sign-in aliases exist and none need to be created. `/` becomes the landing and does not redirect anywhere.

### Authorization

**III:** Question: Does the backend send any email containing a link to `/`?
Status: answered
Answer: No email links to `/`. The only frontend deep link the backend sends besides the balance one is the **forgot-password email → `/reset-password/{token}`**.
Context: Verified against this repo. `src/app/reset-password/[slug]/page.tsx` reads `params.slug` and renders `features/Login/ResetPassword/ResetPassword`; this story does not touch that route, its path, or its param shape, so **every already-sent password-reset email keeps working**. The path is not derived from `LOGIN_ROUTE`.
Explanation: The change does reach the reset flow, but only in the right direction — it improves it. Three CTAs inside the reset/forgot screens point at `LOGIN_ROUTE` and will now land on the sign-in form instead of the marketing landing:

| File | Line | Element |
| --- | --- | --- |
| `ResetPasswordStatusCard.tsx` | 28 | "Regresar al inicio" after a successful (or failed) reset |
| `ResetPasswordCard.tsx` | 82 | "Volver al inicio" secondary button |
| `ForgotPasswordCard.tsx` | 36, 76 | `router.push(LOGIN_ROUTE)` after submit, plus its "volver" button |

All four resolve through the constant, so they move for free. **But the copy no longer matches the destination**: "Regresar al inicio" / "Volver al inicio" meant "go back to the sign-in screen" when `/` *was* sign-in. After this story "el inicio" is the marketing landing, and these buttons go to `/login`. Recommendation: retitle them to "Iniciar sesión" — a one-word copy change in three files, cheapest to do inside this story rather than as landing polish. A grep for `inicio` across `src/features` and `src/shared` (excluding "iniciar sesión") finds exactly **five** navigational occurrences, all in the Login domain — the four above plus two in `src/features/Login/Register/ResultCard.tsx:25,46` ("Regresar al inicio" after register success/failure). Everything else that matches is date-picker copy ("Fecha de inicio") and is unrelated.

So the full copy fix is four files: `ResetPasswordStatusCard.tsx`, `ResetPasswordCard.tsx`, `ForgotPasswordCard.tsx`, `Register/ResultCard.tsx`. Note `ResultCard.test.tsx` already asserts on link text and hrefs, so retitling means updating that test in the same change.
