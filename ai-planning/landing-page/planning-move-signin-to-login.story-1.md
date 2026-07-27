# Planning — Move The Sign-In Screen From `/` To `/login`

**Story of epic** — epic research: `ai-research/landing-page.epic.md`
**Source research doc:** `ai-research/landing-page/move-signin-to-login.story-1.md`
**Story number:** 1 of 2
**Planned:** 2026-07-25
**Sign-off status:** research answered (all open questions `Status: answered`); this plan awaits human sign-off.

## Assumptions & Decisions Beyond The Research Doc

1. **Copy retitle is in scope.** Research Open Question III raised it as a *recommendation*, not an accepted decision. Confirmed in planning: retitle the "Regresar al inicio" / "Volver al inicio" CTAs to **"Iniciar sesión"**, in the same story as the route move, so copy and destination never disagree in a shipped state. This is Phase 4.
2. **The `/` redirect stub stays.** Confirmed in planning: Story 1 ships a temporary `src/app/page.tsx` that redirects to `LOGIN_ROUTE`, carrying an explicit removal comment naming Story 2. `/` must not 404 between stories.
3. **Research undercounted the copy-affected tests.** The research doc names only `ResultCard.test.tsx`. Verified during planning that **three** test files assert on the affected link text:
   - `__tests__/feature/Login/Register/ResultCard.test.tsx` — lines 54, 55, 83, 116, 117, 151, 199
   - `__tests__/feature/Login/Register/Register.test.tsx` — lines 61, 122, 183 (renders `ResultCard` through the real component tree)
   - `__tests__/feature/Login/ResetPassword/ResetPasswordCard.test.tsx` — line 24

   `ResetPasswordStatusCard.tsx` has no dedicated test file, and `LoginRequiredModal.tsx` has no test file at all — neither is a test-migration target.
4. **No collision risk from the new copy.** The retitled elements are `role="link"` (`LinkButton` renders an anchor). The existing `/iniciar sesión/i` queries in `Login.test.tsx` and `LoginCard.test.tsx` target `role="button"` inside `LoginCard.tsx:109`, a different component. No ambiguous-query breakage.
5. **`ForgotPasswordCard.tsx:76` reads "Volver", not "Volver al inicio"** — verified. It needs no copy change; its `href` follows the constant automatically.
6. No backend change, no env change, no dependency change, no `middleware.ts` (none exists in this repo).

## Acceptance Criteria

Copied in order from the research doc:

1. Navigating to `/login` renders the sign-in screen with identical behavior to today's `/`: anonymous visitors see the login form; authenticated admins are redirected to the sanitized `?redirect=` destination; every other authenticated user is redirected to `/dashboard`; a hostile or missing `?redirect=` falls back to `/dashboard`.
2. `/login?redirect=/dashboard/requests/{id}` still round-trips an admin to that request page after a successful sign-in, preserving the balance email deep-link flow end to end.
3. Every in-app "back to sign-in" affordance resolves to `/login`: register result and personal-information back-links, forgot-password success redirect and back-link, reset-password back-link and status card, the dashboard sign-out redirect, and the `LoginRequiredModal`.
4. Signing out revalidates the sign-in route and lands the user on `/login` with session and user-info cookies cleared.
5. `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`, and `pnpm test` pass, with `__tests__/home.test.tsx` migrated to the new route.

**Added by decision 1** (traces to research Open Question III):

6. No in-app CTA labelled "Regresar al inicio" / "Volver al inicio" points at the sign-in screen. Those five CTAs read "Iniciar sesión".

## Affected Files

### `src/app/**`

| File | Action |
| --- | --- |
| `src/app/login/page.tsx` | Create — verbatim move of today's `src/app/page.tsx`. |
| `src/app/page.tsx` | Modify — replaced by a temporary redirect stub (deleted in Story 2). |

### `src/app/api/**`

None. `src/app/api/auth/sign-out/route.ts:11` calls `revalidatePath(LOGIN_ROUTE)` and follows the constant. **Verify, do not edit.**

### `src/shared/**`

| File | Action |
| --- | --- |
| `src/shared/constants/global.constants.ts` | Modify — line 29, `LOGIN_ROUTE` `"/"` → `"/login"`. |
| `src/shared/ui/organisms/LoginRequiredModal.tsx` | **Verify only** — line 29 already reads "Iniciar sesión". |

### `src/features/**`

| File | Action |
| --- | --- |
| `src/features/Login/Register/ResultCard.tsx` | Modify — copy at lines 24, 45. |
| `src/features/Login/ResetPassword/ResetPasswordStatusCard.tsx` | Modify — copy at line 28. |
| `src/features/Login/ResetPassword/ResetPasswordCard.tsx` | Modify — copy at line 82. |
| `src/features/Login/Register/PersonalInformation.tsx` | **Verify only** — line 83 reads "Volver"; href follows the constant. |
| `src/features/Login/ForgotPassword/ForgotPasswordCard.tsx` | **Verify only** — lines 36, 76; copy reads "Volver". |
| `src/features/Dashboard/Dashboard.tsx` | **Verify only** — line 38 `router.push(LOGIN_ROUTE)`. |
| `src/features/Balance/BalanceAdminRequestDetail.tsx` | **Verify only** — line 93 builds the `400`-fallback redirect URL. |

### `__tests__/**`

| File | Action |
| --- | --- |
| `__tests__/home.test.tsx` | Delete (content moves). |
| `__tests__/login.test.tsx` | Create — migrated from `home.test.tsx`, importing the page from `../src/app/login/page`. |
| `__tests__/feature/Login/Register/ResultCard.test.tsx` | Modify — link-name queries at 54, 55, 83, 116, 117, 151, 199. |
| `__tests__/feature/Login/Register/Register.test.tsx` | Modify — link-name queries at 61, 122, 183. |
| `__tests__/feature/Login/ResetPassword/ResetPasswordCard.test.tsx` | Modify — link-name query at 24. |
| `__tests__/feature/Login/ForgotPassword/ForgotPasswordCard.test.tsx` | **Verify only** — line 110 asserts against `LOGIN_ROUTE`; no edit. |
| `__tests__/feature/Login/Register/PersonalInformation.test.tsx` | **Verify only** — line 75 asserts against `LOGIN_ROUTE`; no edit. |

### Docs

| File | Action |
| --- | --- |
| `REPO_CONTEXT.md` | Modify — four statements naming `src/app/page.tsx` as the login entrypoint. |
| `AGENTS.md` | Modify — "App Structure" bullet, line 19. |

---

## Phase 1 — Move the page and flip the constant

The whole routing mechanism. One file moved, one string changed.

### Changes Required

**`src/app/login/page.tsx` — Create**

Verbatim copy of the current `src/app/page.tsx`. Nothing about the body changes: same `async` server component, same imports, same `HomePageProps` with **optional** `searchParams`, same `// ponytail:` comment on the admin-role guard.

```tsx
interface HomePageProps {
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default async function Home({ searchParams }: HomePageProps) {
  const returnUrl = sanitizeDashboardReturnUrl(searchParams?.[LOGIN_REDIRECT_PARAM])

  const accessToken = await getAccessToken()
  if (accessToken) {
    // ponytail: defensive guard, backend authorization is the source of truth
    const userInfo = await getUserInfo()
    const isAdmin = Array.isArray(userInfo?.data?.user?.role) && userInfo.data.user.role.includes('admin')
    redirect(isAdmin ? returnUrl : DASHBOARD_ROUTE)
  }

  return (
    <Login returnUrl={returnUrl} />
  );
}
```

Constraints, all load-bearing:

- Keep it a **server** component. Do not add `'use client'`.
- Keep `searchParams` **optional**. `REPO_CONTEXT.md` records that page tests invoke pages as bare async functions; a required prop breaks the test's destructure.
- Keep the `// ponytail:` marker verbatim — it is the repo's convention for defensive frontend authorization guards.
- Do not touch `sanitizeDashboardReturnUrl()`. It allowlists same-origin `/dashboard` paths and is independent of where the login page lives.
- The exported function name may stay `Home`; renaming it is cosmetic and would churn the test import. Leave it.

**`src/shared/constants/global.constants.ts` — Modify, line 29**

```ts
export const LOGIN_ROUTE = "/login";
```

Nothing else in the file changes. `REGISTER_ROUTE`, `FORGOT_PASSWORD_ROUTE`, `DASHBOARD_ROUTE`, `DASHBOARD_REQUESTS_ROUTE`, `buildBalanceRequestDetailRoute`, and `LOGIN_REDIRECT_PARAM` are untouched.

**`src/app/page.tsx` — Modify (temporary stub)**

```tsx
// TODO(landing epic, Story 2): delete this file. `/` becomes the public
// marketing landing page. This stub exists only so Story 1 can ship without
// leaving the site root broken. Do not add logic here.
import { redirect } from 'next/navigation'
import { LOGIN_ROUTE } from '@/shared/constants/global.constants'

export default function RootRedirect() {
  redirect(LOGIN_ROUTE)
}
```

Edge cases:

- **Not `async`, and no cookie read.** The stub must not call `getAccessToken()`. Adding a cookie read would opt `/` into dynamic rendering, which is precisely what Story 2 needs `/` *not* to be. Keeping the stub cookie-free means the "confirm `/` is static after Story 2" check in Phase 5 is meaningful.
- **No logic creep.** The removal comment is part of the deliverable, not a nicety — the stub is a deliberate temporary liability.

### Success Criteria

**Automated**

```bash
pnpm exec tsc --noEmit
```

**Manual** — deferred to Phase 5; Phase 1 leaves `__tests__/home.test.tsx` importing a path that no longer exports the login page, so the suite is expected to fail until Phase 2. Do not run `pnpm test` here.

### Test Coverage

None added in this phase. Test migration is Phase 2.

---

## Phase 2 — Migrate the page test

### Changes Required

**`__tests__/login.test.tsx` — Create; `__tests__/home.test.tsx` — Delete**

Move the file with exactly one substantive edit:

```ts
import HomePage from '../src/app/login/page'
```

Everything else is preserved as-is:

- The two `jest.mock()` calls, both with **relative** paths (`next/navigation`'s `redirect`, and `../src/shared/lib/auth.lib`), per `.github/copilot-instructions.md`.
- The `Home` test wrapper that composes `QueryProviderWrapper` → `AppRouterContextProviderMock` → `await HomePage({ searchParams })`.
- The `adminUserInfo` / `nonAdminUserInfo` fixtures, typed as `LoginData` from `src/shared/types/login.types`.
- All five `it()` cases and their assertions.
- Do **not** mock `features/Login/Login` or any internal component.
- Do **not** inline `'/login'` anywhere — these tests assert on redirect *destinations* (`/dashboard`, `/dashboard/requests/abc`), not on the login path, so nothing here needs to know the route moved.

The `describe` block name (`'Login page'`) is already correct and needs no change.

### Success Criteria

**Automated**

```bash
pnpm test -- __tests__/login.test.tsx
```

All five cases pass. Confirm `__tests__/home.test.tsx` no longer exists (a stale copy would fail on the removed import path).

### Test Coverage

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `__tests__/login.test.tsx` | Anonymous render of the login form; authenticated-admin redirect to the sanitized `?redirect=`; authenticated-non-admin redirect to `/dashboard`; missing/unparseable `user-info` cookie → `/dashboard`; hostile `?redirect=` → `/dashboard` | Direct migration of `__tests__/home.test.tsx`; router/query wrappers per `.github/copilot-instructions.md` |

---

## Phase 3 — Verify the nine constant consumers

No source edits. This phase exists because AC 2, 3, and 4 are behavioral claims about code this story does not modify, and "it imports the constant" is a hypothesis until checked.

### Changes Required

None. Confirm each of the nine consumers resolves to `/login` and behaves correctly:

| File | Line | What to confirm |
| --- | --- | --- |
| `src/app/api/auth/sign-out/route.ts` | 11 | `revalidatePath(LOGIN_ROUTE)` now revalidates `/login`. AC 4. |
| `src/features/Dashboard/Dashboard.tsx` | 38 | Post-sign-out `router.push(LOGIN_ROUTE)` lands on `/login`, not a stale cached render of the old `/`. AC 4. |
| `src/features/Balance/BalanceAdminRequestDetail.tsx` | 93 | The `400`-fallback builds `/login?redirect=<encoded>`. AC 2. |
| `src/features/Login/ForgotPassword/ForgotPasswordCard.tsx` | 36, 76 | Post-submit `router.push` and the "Volver" `LinkButton href`. AC 3. |
| `src/features/Login/Register/ResultCard.tsx` | 24, 45 | Both `LinkButton href`. AC 3. |
| `src/features/Login/Register/PersonalInformation.tsx` | 83 | "Volver" `LinkButton href`. AC 3. |
| `src/features/Login/ResetPassword/ResetPasswordCard.tsx` | 82 | `LinkButton href`. AC 3. |
| `src/features/Login/ResetPassword/ResetPasswordStatusCard.tsx` | 28 | `LinkButton href`. AC 3. |
| `src/shared/ui/organisms/LoginRequiredModal.tsx` | 29 | "Iniciar sesión" `LinkButton href`. AC 3. |

If any consumer turns out to hardcode `"/"` instead of importing the constant, fix it there — but a repo-wide grep during research returned zero hardcoded root-navigation hits, so expect none.

### Success Criteria

**Automated**

```bash
grep -rn "LOGIN_ROUTE" src
pnpm test -- __tests__/feature/Login
```

The grep must show every consumer importing from `@/shared/constants/global.constants` and no literal `"/"` navigation. `__tests__/feature/Login/ForgotPassword/ForgotPasswordCard.test.tsx:110` and `__tests__/feature/Login/Register/PersonalInformation.test.tsx:75` assert against the constant and must pass **with no edit** — that is the signal the migration mechanism works. If either needs editing, something hardcoded a path.

**Manual** — full pass is Phase 5.

### Test Coverage

No new tests. This phase verifies that existing constant-based assertions still hold. Per the research doc: **do not "clarify" any assertion by inlining `'/login'`.**

---

## Phase 4 — Retitle the sign-in CTAs

Traces to AC 6 / research Open Question III. "El inicio" now means the marketing landing; these five CTAs go to the sign-in form, so their labels must say so.

### Changes Required

**`src/features/Login/Register/ResultCard.tsx` — Modify, lines 24 and 45**

Both `LinkButton` children change from `Regresar al inicio` to `Iniciar sesión`. Line 24 is the error branch (`type="secondary"`, sits next to a "Volver a intentar." button); line 45 is the success branch. `href={LOGIN_ROUTE}` and all props stay as they are.

**`src/features/Login/ResetPassword/ResetPasswordStatusCard.tsx` — Modify, line 28**

`Regresar al inicio` → `Iniciar sesión`. Note this component renders in both `status === 'success'` and `status === 'error'` states, and in the error state it sits below a `FORGOT_PASSWORD_ROUTE` button reading "Ir a olvidé mi contraseña". "Iniciar sesión" is accurate in both states. Leave the `type={type}` prop and the forgot-password button untouched.

**`src/features/Login/ResetPassword/ResetPasswordCard.tsx` — Modify, line 82**

`Volver al inicio` → `Iniciar sesión`. Keep `className="mt-4"` and `type="secondary"`.

**Not changed:** `ForgotPasswordCard.tsx:76` reads "Volver" (no "inicio"), and `PersonalInformation.tsx:83` reads "Volver". Both are correct as-is — they mean "back one step", not "go to the start".

**`__tests__/feature/Login/Register/ResultCard.test.tsx` — Modify**

Update the link-name queries and the text assertion. Seven sites:

```ts
// lines 54, 55, 116, 117, 151, 199
screen.getByRole('link', { name: /iniciar sesión/i })
// line 83
expect(linkButtons[0]).toHaveTextContent('Iniciar sesión')
```

Lines 55 and 117 keep their `toHaveAttribute('href', LOGIN_ROUTE)` assertion against the **constant**, unchanged.

**`__tests__/feature/Login/Register/Register.test.tsx` — Modify, lines 61, 122, 183**

Same query rename. These render `ResultCard` through the real `Register` tree (no internal-component mocking), which is why the copy change reaches them.

**`__tests__/feature/Login/ResetPassword/ResetPasswordCard.test.tsx` — Modify, line 24**

```ts
expect(screen.getByRole('link', { name: /iniciar sesión/i })).toBeInTheDocument()
```

Edge case worth naming: `/iniciar sesión/i` is also the accessible name of the submit button in `LoginCard.tsx:109`. No conflict here — these queries scope to `role: 'link'`, and `LoginCard` is not in any of these three trees. Do not relax the queries to `getByText`.

`ResetPasswordStatusCard.tsx` and `LoginRequiredModal.tsx` have no test files; nothing to update for them.

### Success Criteria

**Automated**

```bash
pnpm test -- __tests__/feature/Login
grep -rn "al inicio" src/features src/shared
```

The grep must return no navigational hits (date-picker "Fecha de inicio" copy is unrelated and lives elsewhere; confirm any remaining match is not a sign-in CTA).

**Manual**

1. Register a new account → success card reads "Iniciar sesión" and navigates to `/login`.
2. Trigger the register error branch → error card's secondary button reads "Iniciar sesión".
3. Complete a password reset → status card reads "Iniciar sesión" and navigates to `/login`.
4. On the reset-password form, the secondary button reads "Iniciar sesión".

### Test Coverage

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `__tests__/feature/Login/Register/ResultCard.test.tsx` | Success and error branches both expose an "Iniciar sesión" link whose `href` equals `LOGIN_ROUTE` | Existing file; Testing Library `screen` queries by role |
| `__tests__/feature/Login/Register/Register.test.tsx` | Register flow reaches the result card and its renamed CTA through the real component tree | Existing file; no internal-component mocking |
| `__tests__/feature/Login/ResetPassword/ResetPasswordCard.test.tsx` | Reset-password card renders the renamed secondary link | Existing file |

---

## Phase 5 — Docs and full verification

### Changes Required

**`REPO_CONTEXT.md` — Modify, four statements**

| Location | Current | New |
| --- | --- | --- |
| "Key invariants" bullet (line 44) | "`src/app/page.tsx` is the login entrypoint. It redirects authenticated users to `/dashboard`, otherwise renders `features/Login/Login`." | `src/app/login/page.tsx` is the login entrypoint. Note that `src/app/page.tsx` is currently a temporary redirect stub pending the landing page (Story 2). |
| `src/app/` directory table (line 55) | "`page.tsx` \| Login route `/`; redirects to `/dashboard`…" | Split into two rows: `page.tsx` (temporary `/` → `/login` redirect stub, removed by the landing story) and `login/page.tsx` (login route `/login`; redirects authenticated users). |
| "Key Files" table (line 220) | "`src/app/page.tsx` \| Login entrypoint and authenticated redirect." | `src/app/login/page.tsx` — login entrypoint and authenticated redirect. |
| Post-login return-URL bullet (line 203) | names `src/app/page.tsx` as the server-side `?redirect=` reader, and says `BalanceAdminRequestDetail.tsx` constructs a `/?redirect=...` URL | `src/app/login/page.tsx`; the constructed URL is now `/login?redirect=...`. |

Also worth correcting while in the file: the API route inventory entry for `/api/auth/sign-out` (line 98) says it "revalidates `/` and `/dashboard`" — it now revalidates `/login` and `/dashboard`.

**`AGENTS.md` — Modify, line 19**

```md
- `src/app/login/page.tsx` is the login entrypoint and redirects authenticated users to `/dashboard`.
```

Add a short note that `src/app/page.tsx` is a temporary redirect stub until the landing page lands.

Do **not** update `.opencode/command/*` or `.github/prompts/*`; this story changes no prompt instructions, so `pnpm sync:prompts` is not needed.

### Success Criteria

**Automated**

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm test
pnpm build
```

In the `pnpm build` output, confirm `/login` is marked **dynamic** (ƒ — it reads cookies via `getAccessToken()`) and `/` is **not** dynamic. Record the `/` marking; Story 2's own build check will assert `/` is fully static once the stub is replaced by the landing.

**Manual** — the AC-tracing regression pass:

1. **AC 1** — Visit `/login` signed out → login form renders. Visit `/login` as a non-admin with a live session → lands on `/dashboard`. Visit `/login?redirect=/dashboard/requests/abc` as a non-admin → still `/dashboard` (existing behavior; this story does not reconsider it). Visit `/login?redirect=https://evil.com` as an admin → `/dashboard`.
2. **AC 2 — balance email deep link, end to end.** Sign out (or let the session expire), open a balance email link to `/dashboard/requests/{id}`. `BalanceAdminRequestDetail`'s query returns `400` → client pushes `/login?redirect=/dashboard/requests/{id}`. Sign in as an admin → land on the request detail page. Confirm the URL in the address bar is `/login?redirect=…`, not `/?redirect=…`.
3. **AC 3** — Walk each affordance: register result card, register personal-information "Volver", forgot-password submit + "Volver", reset-password "Iniciar sesión", reset-password status card, and the `LoginRequiredModal`'s "Iniciar sesión". All land on `/login`.
4. **AC 4** — Sign out from the dashboard. Confirm you land on `/login`, that a login form (not a cached authenticated render) is shown, and that the `session` and `user-info` cookies are gone in devtools. Check desktop and the mobile drawer, since `Dashboard.tsx` renders separate branches via `useMediaQuery()`.
5. **`/` stub** — Visit `/` → 302 to `/login`. Confirm it does this for both anonymous and authenticated visitors (the stub reads no cookies, so it cannot behave differently).

### Test Coverage

No new tests. `pnpm test` is the full-suite gate for AC 5.

---

## Cross-Cutting Concerns

- **Auth cookies.** Nothing about session/user-info cookie handling changes. `getAccessToken()` and `getUserInfo()` move with the page; the sign-out route's cookie deletion is untouched.
- **Open-redirect sanitization.** `sanitizeDashboardReturnUrl()` in `src/shared/utils/global.utils.ts` is security-sensitive and stays untouched. Both sanitize sites (the moved page, server-side, and `LoginCard.tsx`, client-side as defense in depth) keep their current shape.
- **Rendering mode divergence.** `/login` is dynamic (cookie read); `/` is not. This is intentional and sets up Story 2's static landing.
- **Cache invalidation.** `revalidatePath(LOGIN_ROUTE)` now targets `/login`. The old `/` render is no longer revalidated by sign-out — acceptable, because after Story 2 `/` is a static public landing with no auth-dependent content. During the stub window, `/` is a bare redirect with nothing to cache staleley.
- **Dashboard mobile branch.** `Dashboard.tsx` has separate mobile/tablet and desktop rendering; verify sign-out on both (Phase 5, manual step 4).
- **External links.** Any sign-in link outside this repo pointing at `/` now hits the stub (and, after Story 2, the landing). Research confirmed no backend email links to `/`; the only other frontend deep link is `/reset-password/{token}`, which this story does not touch, so already-sent password-reset emails keep working. Still worth telling whoever owns the backend email templates before Story 2 ships.

## Out Of Scope

- Building the landing page itself — Story 2 (`ai-research/landing-page/public-landing-page.story-2.md`).
- Deleting the `/` stub — Story 2's responsibility, and the stub's comment says so.
- Reconsidering why non-admin authenticated users bypass `?redirect=`. Existing behavior, covered by two of the five migrated tests. Preserve it.
- Normalizing the `LinkButton` / back-navigation copy anywhere outside the five sign-in CTAs. "Volver" in `ForgotPasswordCard`, `PersonalInformation`, and the Guides/Tone flows means "back one step" and is correct.
- Adding a `middleware.ts`, a legacy `/` → `/login` permanent redirect, or any other sign-in alias. Research Open Question II answered: no.
- Adding tests for `ResetPasswordStatusCard.tsx` or `LoginRequiredModal.tsx`. Neither has a test file today; creating one is not required by any AC.
- Any `REPO_CONTEXT.md` cleanup beyond the five statements listed in Phase 5.

## Open Questions

None blocking. Both planning decisions (copy retitle in scope; keep the `/` stub) were confirmed before this doc was written and are recorded under Assumptions.
