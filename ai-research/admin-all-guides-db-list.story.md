# Admin All Guides DB List Research

## Story Definition

### Story Title

Admin All Guides DB List.

### Story Description

Admin users need a `Ver todas las guias` view from the existing `Ver guias` dashboard screen. The third Flowbite button-group option, currently rendered disabled in `Order`, should become enabled for admins and fetch app-owned Guides DB records from the admin backend endpoint `GET /guides/db/admin`. The admin endpoint supports `scope=all|own` plus the same month/year/page/limit query params as the regular list, and can return soft-deleted guides for auditing. Non-admin users must not see or call this source; backend authorization still enforces it.

This research is scoped to Story 3 from `ai-research/guides-db-epic.md`, lines 42-52. It builds directly on top of Story 2, which is already implemented in `src/features/Dashboard/subscreens/Order.tsx` and `src/app/api/guides-db/route.ts`.

### Acceptance Criteria

1. Admin users can use the `Ver todas las guias` button-group option; non-admin users do not fetch or access this source.
2. Admin users can see guides that regular users have soft-deleted for auditing.
3. The route handler proxies admin query params and preserves auth through the session token.
4. Admin UI can switch between regular-user view behavior and all-guides/admin behavior where required by the guides screen.
5. Admin list filters include month, year, pagination, and a scope select with `Todas las guías` and `Mis guías`.
6. Admin UI can show soft-deleted metadata when present (`deletedAt`, `deletedBy`) without breaking normal guide cards.
7. Non-admin access is hidden in UI and should still rely on backend authorization for enforcement.

### Scope Classification

Single story.

### Research Mode

Full template.

### User-Confirmed Scope

- Full template research doc.
- Prioritize: admin role gating in `Order`, admin route handler + `scope` param, test strategy for admin vs non-admin.
- Reuse the existing `src/app/api/guides-db/route.ts` GET handler by adding a `scope` query param that branches the upstream path between `/guides/db` and `/guides/db/admin`. Do not create a separate `/api/guides-db/admin/route.ts` file.

### Out Of Scope

- Delete (soft or hard) UI/workflow; the backend supports delete but no delete action is included.
- Retry failed guide creation.
- Changes to Story 1 create flow or Story 2 regular list behavior beyond reusing their types/constants/callbacks.
- Global response-envelope normalization.
- Admin-only screens outside the existing `Order` subscreen; no new dashboard screen entry.
- Hard-delete auditing UI distinct from showing `deletedAt`/`deletedBy` metadata on existing cards/details.

## Technical Research

### Current State Summary

Story 2 is already implemented in this checkout and provides the direct scaffold for Story 3:

- `src/features/Dashboard/subscreens/Order.tsx` already has:
  - A `GuideListSource = 'external' | 'ownDb'` type and `selectedSource` state.
  - A Flowbite `ButtonGroup` rendering `Ver guias externas`, `Ver mis guias`, and `Ver todas las guias`; the third button is currently `disabled` (Order.tsx:189-194).
  - Month/year/limit selects and `dbPage`/`dbLimit` state.
  - A TanStack `useQuery` for the regular DB list keyed `['guides', 'db', selectedMonth, selectedYear, dbPage, dbLimit]` and `enabled: selectedSource === 'ownDb'` (Order.tsx:66-70).
  - `GuideDbCard` list rendering and `GuideDbDetails` detail view with back button.
- `src/app/api/guides-db/route.ts` already proxies `GET /guides/db` with `page`, `month`, `year`, `limit` query params, `getAccessToken()` guard, and `Authorization: Bearer <token>` (route.ts:8-43).
- `src/shared/utils/guides.utils.ts` exposes `getGuidesDbCb(params: GetGuidesDbParams)` building `URLSearchParams` for `page`, `month`, `year`, and `limit` (only when not 10) and calling `GET_GUIDES_DB_ENDPOINT` (guides.utils.ts:583-596).
- `src/shared/types/guides.types.ts` defines `GetGuidesDbParams`, `GetGuidesDbResponseData`, `GetGuidesDbResponse`, and `GuideDbRecord` (including optional `deletedAt?: string | null` and `deletedBy?: string | null`) (guides.types.ts:384-428).
- `src/shared/constants/guides.constants.ts` defines `GET_GUIDES_DB_ENDPOINT = '/api/guides-db'`, `GUIDES_DB_EMPTY_MESSAGE`, `GUIDES_DB_ERROR_MESSAGE` (guides.constants.ts:260, 282-284).
- `src/shared/ui/organisms/Aside.tsx` already computes `isAdmin = Array.isArray(userInfo?.data?.user?.role) && userInfo?.data?.user?.role.includes('admin')` and uses it to gate the admin-only margin screen (Aside.tsx:19, 40-45).
- `src/shared/types/global.types.ts` defines `UserRoles = 'user' | 'admin'` (global.types.ts:37); `LoginData.data.user.role` is `UserRoles[]`.
- `Dashboard` passes `userInfo: LoginData | null` down to `Order` (Dashboard.tsx:46, 57), so `Order` can derive `isAdmin` locally with the same pattern `Aside` uses.

### Affected Areas

Routes/pages:

- `src/app/dashboard/page.tsx` already reads auth/user cookies server-side and renders `Dashboard`; no change needed for admin role plumbing because `userInfo` already flows to `Order`.
- `src/features/Dashboard/Dashboard.tsx` passes `userInfo` to `Order` on both mobile/tablet and desktop branches; no change needed.

API route handlers:

- `src/app/api/guides-db/route.ts` GET branch: extend to accept an optional `scope` query param and, when `scope` is present (and equal to `all` or `own`), proxy to `${BACKEND_URI}/guides/db/admin` instead of `${BACKEND_URI}/guides/db`. Add `scope` to the `entries` allowlist (currently `['page', 'month', 'year', 'limit']`). Keep the existing `getAccessToken()` 400 guard, `Authorization` header, and `error.response.data.error.message` unwrap.
- POST branch in the same file is the Story 1 create handler and is not touched by Story 3.

Feature UI:

- `src/features/Dashboard/subscreens/Order.tsx`:
  - Extend `GuideListSource` to include `'allDb'` (admin source).
  - Compute `isAdmin` from `userInfo?.data?.user?.role` with the same `Array.isArray(...) && role.includes('admin')` check used in `Aside`.
  - Enable the `Ver todas las guias` button only when `isAdmin`; keep it disabled (or hidden) for non-admins to satisfy AC 1 and AC 7.
  - Add an admin DB list `useQuery` keyed distinctly, e.g. `['guides', 'db', 'admin', scope, selectedMonth, selectedYear, dbPage, dbLimit]`, `enabled: selectedSource === 'allDb' && isAdmin`, calling an admin-capable callback.
  - Add a scope `Select` with options `Todas las guías` (`all`) and `Mis guías` (`own`), visible only when `selectedSource === 'allDb'`. Default to `all` per epic AC 5.
  - Render admin list results through the same `GuideDbCard` + `GuideDbDetails` components used by Story 2 to keep card shape consistent (AC 6).
- `src/features/Dashboard/subscreens/GuideDbCard.tsx` and `GuideDbDetails.tsx`:
  - Optionally surface `deletedAt`/`deletedBy` metadata when present and when the active source is admin. `GuideDbRecord` already types both fields as optional `string | null`, so rendering can be gated on `guide.deletedAt != null` without a type change.
  - Keep cards/details rendering identical for non-deleted records so normal guide cards are unaffected (AC 6).

Shared code:

- `src/shared/types/guides.types.ts`:
  - Extend `GetGuidesDbParams` with an optional `scope?: 'all' | 'own'` field, or add a dedicated `GetGuidesDbAdminParams` type. Reusing the same type with an optional `scope` is the smaller diff and matches the user-confirmed route layout.
  - `GetGuidesDbResponseData` and `GetGuidesDbResponse` already match the admin endpoint's documented shape (`{ guides, total, page, limit, totalPages }`); no change needed.
- `src/shared/utils/guides.utils.ts`:
  - Extend `getGuidesDbCb` to append `scope` to `URLSearchParams` only when present, so the regular path is unchanged and the admin path reuses the same callback. Alternatively add a sibling `getGuidesDbAdminCb`; one callback with optional `scope` is the smaller diff.
- `src/shared/constants/guides.constants.ts`:
  - Add admin source selector labels if not already present (e.g. `Todas las guías`, `Mis guías`) and any admin-specific user-facing copy (e.g. a soft-deleted badge label, an admin empty/error message if distinct from Story 2's).

Tests:

- `__tests__/feature/Dashboard/Order.test.tsx` already mocks `getGuidesDbCb` and `useMediaQuery`, wraps `Order` in `QueryClientProvider`, and asserts the disabled state of `Ver todas las guias` for a `role: ['user']` mock (Order.test.tsx:577-583). Extend with:
  - An admin `mockUserInfo` variant (`role: ['admin']`) asserting the `Ver todas las guias` button is enabled.
  - A test that clicking `Ver todas las guias` calls `getGuidesDbCb` (or the admin callback) with `scope: 'all'` and the current month/year/page/limit.
  - A test that non-admin users cannot trigger the admin fetch (button stays disabled, admin query never fires).
  - A test rendering a soft-deleted admin record (non-null `deletedAt`/`deletedBy`) and asserting the soft-delete metadata is visible.
- Test helpers `__tests__/mocks/` and `__tests__/utils-test/` remain ignored as suites; reuse existing `createMockDbRecord`/`createMockDbResponse` factories already in `Order.test.tsx` (lines 471-550) for admin fixtures.

### Existing Patterns To Follow

App Router and client split:

- Keep all admin list UI in the client `Order` subscreen; do not read auth cookies in client code. `userInfo` is already passed in from the server dashboard page via `Dashboard`.
- Keep the backend admin call in the existing BFF route handler; client code calls `/api/guides-db` only.

TanStack Query:

- Use a distinct query key for the admin source so switching between `Ver mis guias` and `Ver todas las guias` does not serve stale regular-user data. Include `scope` in the key when admin source is active.
- Keep `enabled` gated on both `selectedSource === 'allDb'` and `isAdmin` so a non-admin can never trigger the admin fetch even transiently.

Route handler proxy style:

- Preserve the existing 400-on-missing-token behavior; do not switch to 401 for Story 3 (consistency with the rest of the BFF).
- Keep the `error.response.data.error.message` unwrap fallback for non-2xx backend errors.
- The admin endpoint uses the same `{ version, message, error, data }` envelope as the regular list, so no new unwrap logic is needed.

Flowbite React:

- The `ButtonGroup` already exists; only the third button's `disabled` prop needs to become conditional on `isAdmin`.
- The new scope `Select` reuses the same Flowbite `Select`/`Label` styling already used for month/year/limit.

Admin gating:

- Reuse the exact `Array.isArray(role) && role.includes('admin')` check from `Aside.tsx:19` to keep role detection consistent across the dashboard. Do not invent a new role signal.

### Backend Contract For Admin Endpoint

Endpoint path:

- `GET /guides/db/admin`.

Query params:

- `scope`: `all | own`. `own` returns guides owned by that admin user (not other users' guides); `all` returns all guides including soft-deleted for auditing.
- `page`: optional number.
- `limit`: optional number; backend default is 10; UI exposes default, 50, 100 (matching Story 2).
- `month`: optional number 1-12 (e.g. `3`, not `03`).
- `year`: optional full year (e.g. `2026`, not `26`).

Response envelope (same shape as regular list):

- `{ version, message, error, data }`.
- `data.guides`: array of Guides DB records (same `GuideDbRecord` shape).
- `data.total`, `data.page`, `data.limit`, `data.totalPages`.
- Admin list can include soft-deleted guides; soft-deleted records carry non-null `deletedAt` and `deletedBy`.

Authorization:

- Backend enforces admin authorization on `GET /guides/db/admin`; frontend gating is convenience, not security (AC 7).
- A non-admin calling the admin endpoint should be rejected by the backend; the UI must not call it for non-admins regardless.

### Edge Cases And Constraints

- The existing `Order` DB query is keyed without `scope`; adding `scope` to the key (or using a separate admin query key) is required to avoid cache collisions between `Ver mis guias` and `Ver todas las guias`.
- `GuideDbCard` currently derives `price` from `guide.price ?? guide.quote.total` and `logoSrc` from `guide.quote.courier`; soft-deleted admin records use the same shape, so no card change is needed for price/logo. Only soft-delete metadata is additive.
- `GuideDbDetails` already has a failure-info block gated on `guide.status === 'failed' && guide.failureInfo`; a soft-deleted-but-created record will not show that block, which is correct. Soft-delete metadata should render in a separate, admin-only block to avoid confusing regular records.
- The `Ver todas las guias` button is currently `disabled` unconditionally (Order.tsx:190); making it conditional on `isAdmin` is the smallest diff and preserves the button-group's three-button layout for non-admins (AC 1, AC 7).
- Default filters: per epic open question II (already answered), month/year default to current month/year. The admin source should inherit the same defaults so switching sources does not reset filters unexpectedly.
- Default scope: `all` per AC 5 wording (`Todas las guías` listed first).
- Mobile/tablet vs desktop: `Order` is rendered in both `Dashboard` branches; the admin source, scope select, and soft-delete metadata must work in both. Story 2 already proved the layout works in both branches.
- Coverage is always collected on `pnpm test`; do not run tests during research.
- `product-sat` uses `NEXT_PUBLIC_GET_SAT_PRODUCT_URI`, not `BACKEND_URI`; not relevant to Story 3 but preserved here as a boundary note.

### Dependencies And Integration Points

- No new dependency required.
- Flowbite React, TanStack Query, and Axios are already installed and used by Story 2.
- No new env var required; the admin endpoint is served by the same `BACKEND_URI`.
- `.env.example` does not change.

### Testing Rules To Follow

From `.github/copilot-instructions.md`:

- Use `userEvent` for interactions, not `fireEvent`.
- Do not mock internal components from `@/features` or `@/shared`; `GuideDbCard` and `GuideDbDetails` should render for real.
- Mock network callbacks (`getGuidesDbCb`) and browser APIs (`useMediaQuery`) only.
- When mocking hooks with `jest.mock()`, use relative imports (`../../../src/...`) instead of `@/` aliases. `Order.test.tsx` already follows this pattern (lines 11-16).
- Do not use `any` or `unknown` in new test types; reuse `GuideDbRecord`/`GetGuidesDbResponseData` for admin fixtures.
- Mock data must match real return shapes; the existing `createMockDbRecord`/`createMockDbResponse` factories already match `GuideDbRecord` and `GetGuidesDbResponseData` and can be reused for admin fixtures, including non-null `deletedAt`/`deletedBy`.
- Preserve `it.skip()`/`test.skip()` if encountered.

Smallest useful tests:

- Admin role enables `Ver todas las guias` button; non-admin role keeps it disabled.
- Clicking `Ver todas las guias` triggers the admin fetch with `scope: 'all'` and current month/year/page/limit.
- Changing scope to `own` triggers a fetch with `scope: 'own'`.
- Non-admin cannot trigger the admin fetch (button disabled, admin query never fires).
- Admin list renders a soft-deleted record with visible `deletedAt`/`deletedBy` metadata without breaking non-deleted cards.

## Open Questions

Backend contract:

- I: Question: Does `GET /guides/db/admin` with `scope=own` return the admin's own guides including the admin's own soft-deleted guides, or only non-deleted own guides?
  - Status: answered (epic).
  - Answer: It returns guides owned by that admin user and does not show other users' guides. Soft-deleted visibility for auditing applies to the `all` scope.
  - Context: Epic Authorization question II confirmed `scope=own` returns the admin's own guides; the epic notes admin can see soft-deleted records for auditing.
- II: Question: Are `deletedAt` and `deletedBy` always present (possibly null) on every admin record, or only present on soft-deleted records?
  - Status: answered.
  - Answer: The prop may not exist at all on non-deleted records; the fields are only present on soft-deleted guides.
  - Context: UI should gate the soft-delete metadata block on `guide.deletedAt != null` (or `'deletedAt' in guide`) rather than assuming the key is always present with a null value.
- III: Question: Does the admin endpoint accept the same `limit` default of 10 and the same `page`/`month`/`year` semantics as the regular endpoint?
  - Status: answered (epic).
  - Answer: Yes; admin and regular list examples use the same response shape and query param semantics.

UI/product decisions:

- I: Question: Should the `Ver todas las guias` button be hidden for non-admins or kept visible-but-disabled?
  - Status: answered.
  - Answer: Hidden for non-admin users.
  - Context: Matches `Aside`'s admin-only link pattern. Admin users see the full three-button group; non-admin users only see `Ver guias externas` and `Ver mis guias`.
- II: Question: Should switching from `Ver todas las guias` back to `Ver mis guias` reset `scope` to `all`, or preserve the last selection?
  - Status: answered.
  - Answer: Scope is only meaningful for admin users on the `Ver todas las guias` source. The `scope` query param should only be sent when the active source is admin; `Ver mis guias` calls the regular endpoint with no `scope` at all.
  - Context: `getGuidesDbCb` should only append `scope` to `URLSearchParams` when `selectedSource === 'allDb'`. No reset logic is needed because `scope` is irrelevant to the regular source.
- III: Question: What copy should the soft-deleted metadata block show (e.g. "Eliminada el {date} por {deletedBy}")?
  - Status: pending.
  - Context: No existing soft-delete copy constant; a small constant in `guides.constants.ts` is the likely home.
- IV: Question: Should the scope `Select` default to `Todas las guías` (`all`) as AC 5 listing order implies?
  - Status: answered.
  - Answer: Yes, default to `all` (`Todas las guías`) instead of `own`.
  - Context: AC 5 lists `Todas las guías` first; default `all` matches that order.

Authorization:

- I: Question: Is admin role still determined only by `userInfo.data.user.role.includes('admin')` on the frontend?
  - Status: answered (epic).
  - Answer: Yes for frontend gating; the role comes from the backend login response, is saved in the `user-info` httpOnly cookie, and is read back into `userInfo.data.user.role`. `Aside` already uses `role.includes('admin')`.
- II: Question: Should the BFF admin path (`/guides/db/admin`) be callable by the existing `/api/guides-db` handler when `scope` is present, or does the backend want a dedicated header/param to distinguish admin calls?
  - Status: answered.
  - Answer: The backend does not need a dedicated header, param, or anything beyond `scope` to distinguish admin calls. The existing session bearer token is sufficient.
  - Context: The BFF branches on the `scope` query param alone to pick the upstream path; no extra auth signaling is required.

## Assumptions

- The admin endpoint is served by the same `BACKEND_URI` as the regular list.
- The existing `/api/guides-db` GET handler can be extended in place to branch on `scope` without breaking Story 2 callers (Story 2 never sends `scope`).
- `GuideDbRecord`, `GetGuidesDbResponseData`, and `GetGuidesDbResponse` types already match the admin endpoint's response shape and need no structural change.
- `GuideDbCard` and `GuideDbDetails` can render admin records unchanged except for an additive soft-delete metadata block.
- `userInfo` already reaching `Order` is sufficient for admin gating; no new cookie or server-side plumbing is needed.
- The `Array.isArray(role) && role.includes('admin')` check from `Aside` is the canonical admin signal and should be reused.
- Default month/year are the current month/year (inherited from Story 2 defaults).
- Default scope is `all`.
- Retry, delete UI, and hard-delete auditing are explicitly out of scope.

## Non-Obvious Findings

- Story 2 already wired the three-button group with `Ver todas las guias` disabled, so Story 3's UI change is essentially flipping `disabled` to `disabled={!isAdmin}` plus adding the scope select and admin query. The scaffold is in place.
- `GuideDbRecord` already types `deletedAt` and `deletedBy` as optional, so admin soft-delete metadata rendering needs no type addition—only a conditional block.
- The existing `Order` DB query key lacks `scope`; adding the admin source without extending the key would cause cache collisions between `Ver mis guias` and `Ver todas las guias`.
- `Aside.tsx:19` is the canonical admin-detection expression; duplicating it in `Order` keeps role logic consistent without introducing a shared hook (which would be over-engineering for two call sites).
- The existing `getGuidesDbCb` already builds `URLSearchParams` from `GetGuidesDbParams`; adding an optional `scope` field and conditionally appending it is a one-line change that keeps a single callback for both regular and admin lists.
