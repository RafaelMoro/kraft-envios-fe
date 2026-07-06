# Admin All Guides DB List Implementation Plan

Source research: `ai-research/admin-all-guides-db-list.story.md`

Sign-off status/date: treated as signed off from the `/plan` request input; all open questions in the research doc are answered. Planning date: 2026-07-05.

Assumptions:

- Backend `GET /guides/db/admin` is served by the same `BACKEND_URI` and uses the same bearer-token session flow as `GET /guides/db`.
- The admin endpoint shares the regular list's `{ version, message, error, data }` envelope and `GetGuidesDbResponseData` shape; no new unwrap logic is needed.
- The existing `/api/guides-db` GET handler can be extended in place to branch on `scope`; Story 2 never sends `scope`, so it is unaffected.
- `GuideDbRecord`, `GetGuidesDbResponseData`, and `GetGuidesDbResponse` already match the admin endpoint response shape (including optional `deletedAt`/`deletedBy`); no structural type change is needed.
- `userInfo` already flows from `src/app/dashboard/page.tsx` -> `Dashboard` -> `Order`, so admin gating needs no new cookie or server plumbing.
- The canonical admin signal is `Array.isArray(userInfo?.data?.user?.role) && userInfo?.data?.user?.role.includes('admin')`, reused from `src/shared/ui/organisms/Aside.tsx:19`. No shared hook is introduced for two call sites.
- `scope` is only sent when the active source is admin; `Ver mis guias` calls the regular endpoint with no `scope` at all. No scope reset logic is needed.
- Default scope is `all` (`Todas las guías`) per AC 5 ordering.
- Default month/year are the current month/year (inherited from Story 2 defaults already in `Order`).
- Soft-delete metadata copy is `"Eliminada el {date} por {deletedBy}"`, gating on `guide.deletedAt != null`.

## Acceptance Criteria

1. Admin users can use the `Ver todas las guias` button-group option; non-admin users do not fetch or access this source.
2. Admin users can see guides that regular users have soft-deleted for auditing.
3. The route handler proxies admin query params and preserves auth through the session token.
4. Admin UI can switch between regular-user view behavior and all-guides/admin behavior where required by the guides screen.
5. Admin list filters include month, year, pagination, and a scope select with `Todas las guías` and `Mis guías`.
6. Admin UI can show soft-deleted metadata when present (`deletedAt`, `deletedBy`) without breaking normal guide cards.
7. Non-admin access is hidden in UI and should still rely on backend authorization for enforcement.

## Affected Files

`src/app/api/**`:

- `src/app/api/guides-db/route.ts` - extend GET branch to accept `scope` and route to `/guides/db/admin` when present.

`src/features/**`:

- `src/features/Dashboard/subscreens/Order.tsx` - extend `GuideListSource`, compute `isAdmin`, enable/hide `Ver todas las guias`, add admin `useQuery`, add scope `Select`, render admin list through existing `GuideDbCard` + `GuideDbDetails`.
- `src/features/Dashboard/subscreens/GuideDbCard.tsx` - additive soft-delete metadata block (only when `guide.deletedAt != null`).
- `src/features/Dashboard/subscreens/GuideDbDetails.tsx` - additive soft-delete metadata block (only when `guide.deletedAt != null`).

`src/shared/**`:

- `src/shared/types/guides.types.ts` - extend `GetGuidesDbParams` with optional `scope?: 'all' | 'own'`.
- `src/shared/utils/guides.utils.ts` - extend `getGuidesDbCb` to append `scope` to `URLSearchParams` only when present.
- `src/shared/constants/guides.constants.ts` - add scope option labels and soft-delete copy constant.

`__tests__/**`:

- `__tests__/feature/Dashboard/Order.test.tsx` - extend with admin role variant, admin fetch assertions, non-admin gating, and soft-delete metadata rendering.

Docs/config:

- No config changes expected.
- `REPO_CONTEXT.md` may get a one-line note that `/api/guides-db` GET now branches on `scope` to `/guides/db/admin`; this is broadly useful for future route inventory and will be added in Step 8 if verified by implementation.

## Phases

Work is split into three independently testable phases. Phase 1 is the data-layer foundation (types, callback, route, constants). Phase 2 is the UI wiring in `Order`. Phase 3 is the additive soft-delete metadata in `GuideDbCard` / `GuideDbDetails` and its tests.

---

## Phase 1 - Data Layer: Types, Callback, Route, Constants

### Changes Required

`src/shared/types/guides.types.ts`

- Action: Modify.
- Location: `GetGuidesDbParams` (lines 408-413).
- Change: add an optional `scope?: 'all' | 'own'` field to `GetGuidesDbParams`. Reusing the same type with an optional `scope` is the smaller diff and matches the user-confirmed single-route layout. Do not add a separate `GetGuidesDbAdminParams` type.
- No change to `GetGuidesDbResponseData`, `GetGuidesDbResponse`, or `GuideDbRecord`; `deletedAt`/`deletedBy` are already optional `string | null`.

`src/shared/utils/guides.utils.ts`

- Action: Modify.
- Location: `getGuidesDbCb` (lines 583-596).
- Change: after the existing `limit` append, add `if (params.scope) { searchParams.append('scope', params.scope); }`. This keeps the regular path unchanged (Story 2 never sends `scope`) and lets the admin path reuse the same callback.
- Rationale: one callback with optional `scope` is the smaller diff and avoids a parallel `getGuidesDbAdminCb`.

`src/shared/constants/guides.constants.ts`

- Action: Modify.
- Location: near `GUIDES_DB_EMPTY_MESSAGE` / `GUIDES_DB_ERROR_MESSAGE` (lines 282-284).
- Change: add:
  - `GUIDES_DB_ADMIN_SCOPE_ALL_LABEL = 'Todas las guías'`
  - `GUIDES_DB_ADMIN_SCOPE_OWN_LABEL = 'Mis guías'`
  - `GUIDES_DB_DELETED_MESSAGE = 'Eliminada el {date} por {deletedBy}'` (template; consumer formats the date and interpolates `deletedBy`).
- Rationale: AC 5 lists `Todas las guías` first; AC 6 requires soft-delete copy. Reuse `GUIDES_DB_EMPTY_MESSAGE` / `GUIDES_DB_ERROR_MESSAGE` for the admin empty/error states since the endpoint shape is identical.

`src/app/api/guides-db/route.ts`

- Action: Modify.
- Location: GET handler (lines 8-43), specifically the `entries` allowlist (line 17) and the `uri` construction (line 25).
- Change:
  - Add `'scope'` to the `entries` array: `const entries = ['page', 'month', 'year', 'limit', 'scope']`.
  - After building `params`, compute the upstream path: `const scope = searchParams.get('scope'); const path = scope === 'all' || scope === 'own' ? '/guides/db/admin' : '/guides/db';` then `const uri = `${process.env.BACKEND_URI}${path}``.
  - Keep the existing `getAccessToken()` 400 guard, `Authorization: Bearer <token>` header, `NextResponse.json(res.data, { status: 200 })`, and the `error.response.data.error.message` unwrap. Do not switch to 401 (consistency with the rest of the BFF, per research).
  - Do not validate `scope` values beyond the path branch; unknown `scope` falls through to the regular `/guides/db` path, which is harmless because the backend ignores unknown params on the regular endpoint.
- POST handler (lines 45-70) is the Story 1 create handler and is not touched.
- Edge case: only branch on `scope === 'all' || scope === 'own'`; any other `scope` value proxies to the regular path so a malformed client request cannot accidentally reach the admin endpoint.

### Success Criteria

Automated:

- `pnpm exec tsc --noEmit` - confirms the `GetGuidesDbParams` extension typechecks across `guides.utils.ts`, `Order.tsx`, and tests.
- `pnpm lint` - confirms the route handler changes pass `next lint`.

Manual:

- None at this phase; UI behavior is not yet wired.

### Test Coverage

No new test file at this phase. The route handler and callback are exercised through Phase 2/3 `Order` tests via the mocked `getGuidesDbCb`. Route handler integration tests are not part of this repo's existing pattern (no `__tests__/app/api/**` suite exists); covering it through the `Order`-level mock matches the established convention.

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `src/shared/utils/guides.utils.ts` | `getGuidesDbCb` appends `scope` only when provided | Asserted via `mockedGetGuidesDbCb` `toHaveBeenCalledWith(objectContaining({ scope: 'all' }))` in Phase 2 tests |
| `src/app/api/guides-db/route.ts` | `scope` branch to `/guides/db/admin`; regular path unchanged when `scope` absent | Verified by the `getGuidesDbCb` mock contract in Phase 2; no direct route test per repo convention |

---

## Phase 2 - Admin UI Wiring In Order

### Changes Required

`src/features/Dashboard/subscreens/Order.tsx`

- Action: Modify.
- Location: multiple, listed below.

1. `GuideListSource` type (line 19): extend to `type GuideListSource = 'external' | 'ownDb' | 'allDb'`.

2. Component body, near the top of `Order` (after `useNotification`): compute `const isAdmin = Array.isArray(userInfo?.data?.user?.role) && userInfo?.data?.user?.role.includes('admin')`. Reuse the exact `Aside.tsx:19` expression; do not extract a shared hook for two call sites.

3. State: add `const [adminScope, setAdminScope] = useState<'all' | 'own'>('all')`. Default `all` per AC 5. No reset-on-source-switch logic; `scope` is only sent when `selectedSource === 'allDb'`.

4. Admin `useQuery`, placed after the existing `dbData` query (lines 66-70):
   - `queryKey: ['guides', 'db', 'admin', adminScope, selectedMonth, selectedYear, dbPage, dbLimit]` - distinct from the regular key to avoid cache collisions (research edge case).
   - `queryFn: () => getGuidesDbCb({ page: dbPage, month: selectedMonth, year: selectedYear, limit: dbLimit, scope: adminScope })`.
   - `enabled: selectedSource === 'allDb' && isAdmin` - double gate so a non-admin can never trigger the admin fetch even transiently (AC 1, AC 7).
   - Destructure `data: adminDbData`, `isPending: adminDbIsPending`, `isError: adminDbIsError`.

5. `Ver todas las guias` button (lines 189-194):
   - Per research open question UI-I, hide for non-admins (matches `Aside`'s admin-only link pattern). Render the third button only when `isAdmin`: wrap it in `{isAdmin && (<Button ...>)}`. Non-admin users see only `Ver guias externas` and `Ver mis guias` (AC 1, AC 7).
   - When rendered, set `disabled={selectedSource !== 'allDb' ? false : false}` is unnecessary; instead wire `onClick={handleSelectAllDbSource}` and the `clsx` active-class conditional `selectedSource === 'allDb'`.
   - Add `handleSelectAllDbSource = () => { setSelectedSource('allDb'); setDbPage(1); setSelectedDbGuide(null); }` mirroring `handleSelectOwnDbSource`.

6. Scope `Select`: render only when `selectedSource === 'allDb'`. Place it inside the existing filters row (the `flex flex-wrap gap-4` block at lines 227-267) so the admin source reuses month/year/limit selects. Add a new `<div className="flex items-center gap-2">` with `<Label htmlFor="order-admin-scope">Alcance:</Label>` and a `<Select id="order-admin-scope" value={adminScope} onChange={(e) => { setAdminScope(e.target.value as 'all' | 'own'); setDbPage(1); setSelectedDbGuide(null); }}> <option value="all">Todas las guías</option> <option value="own">Mis guías</option> </Select>`. Reset `dbPage` to 1 on scope change to avoid landing on a page that no longer exists (matches existing `handleMonthChange` pattern).

7. Admin list rendering: the admin source reuses the same card/details flow as `Ver mis guias`. Add a branch mirroring the `selectedSource === 'ownDb'` block (lines 219-341) but gated on `selectedSource === 'allDb'` and reading from `adminDbData` / `adminDbIsPending` / `adminDbIsError`. Reuse `GuideDbCard` and `GuideDbDetails` unchanged (soft-delete metadata is added in Phase 3 and renders identically for both sources). Reuse `GUIDES_DB_EMPTY_MESSAGE` / `GUIDES_DB_ERROR_MESSAGE`. Reuse the same pagination controls bound to `dbPage`/`setDbPage` and `adminDbData?.totalPages`.
   - To avoid duplicating the entire filters/list/pagination block, the implementer may extract a small `DbListSection` sub-component or compute `const activeDbData = selectedSource === 'allDb' ? adminDbData : dbData` and similar for pending/error, then render one shared block. The implementer picks whichever is the smaller, clearer diff; both trace to AC 4 (switch between regular and admin behavior) and AC 6 (consistent card shape). Either way, `onViewDetails` must set `selectedDbGuide` and the details back-button must clear it, identical to Story 2.

8. `selectedDbGuide` rendering: the `GuideDbDetails` block at lines 219-224 currently gates on `selectedSource === 'ownDb'`. Extend the condition to `selectedSource === 'ownDb' || selectedSource === 'allDb'` so admin users can open details too.

- Edge cases:
  - Mobile/tablet vs desktop: `Order` is rendered in both `Dashboard` branches; the admin source, scope select, and soft-delete metadata must work in both. Story 2 already proved the layout works in both; no media-query-specific change is needed beyond reusing the same markup.
  - `useMediaQuery` is mocked in tests; keep using `isMobileTablet`/`isDesktop` exactly as Story 2 does.
  - The admin query key includes `adminScope` so switching `Todas las guías` <-> `Mis guías` refetches rather than serving stale scope data.

### Success Criteria

Automated:

- `pnpm test -- __tests__/feature/Dashboard/Order.test.tsx` - all existing tests still pass; new admin tests pass.
- `pnpm exec tsc --noEmit` - typechecks the new state, query, and source type.
- `pnpm lint` - lint passes.

Manual (desktop and mobile/tablet):

- Log in as an admin user (`role` includes `admin`); confirm `Ver todas las guias` is visible and enabled in the button group.
- Click `Ver todas las guias`; confirm the scope `Select` appears with `Todas las guías` selected by default and the admin list loads.
- Switch scope to `Mis guías`; confirm a refetch occurs and the list updates.
- Change month/year/limit; confirm the admin list refetches with the new params and `dbPage` resets to 1.
- Open a guide's details and use the back button; confirm it returns to the admin list.
- Log in as a regular user (`role: ['user']`); confirm `Ver todas las guias` is not visible and the admin endpoint is never called (check the Network tab).
- Resize to mobile/tablet; confirm the admin source, scope select, and list render correctly.

### Test Coverage

Extend `__tests__/feature/Dashboard/Order.test.tsx`. Reuse the existing `createMockDbRecord` / `createMockDbResponse` factories (lines 471-550) for admin fixtures, including non-null `deletedAt`/`deletedBy`. Add an admin `mockUserInfo` variant with `role: ['admin']`.

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `src/features/Dashboard/subscreens/Order.tsx` | admin role shows `Ver todas las guias`; non-admin hides it; clicking it calls `getGuidesDbCb` with `scope: 'all'` and current month/year/page/limit; switching scope to `own` calls with `scope: 'own'`; non-admin never triggers admin fetch; admin list renders records through `GuideDbCard`; admin details open/close via `GuideDbDetails` | Existing `Order.test.tsx` patterns: `renderWithQueryClient`, `userEvent.click`, `waitFor` + `objectContaining`; mock setup at lines 11-22; existing `Ver mis guias` tests at lines 585-600 as the template for admin equivalents |

New tests to add (describe block `When admin user views all guides` or similar):

- Admin role renders `Ver todas las guias` enabled. `mockUserInfo` with `role: ['admin']`; assert `getByRole('button', { name: 'Ver todas las guias' })` is enabled and visible.
- Non-admin role does not render `Ver todas las guias`. Existing `mockUserInfo` (`role: ['user']`); assert `queryByRole('button', { name: 'Ver todas las guias' })` is null. This replaces the current "should disable Ver todas las guias button" test at lines 577-583, since the button is now hidden for non-admins rather than disabled. Preserve any `it.skip()` tests per copilot-instructions; do not delete them.
- Clicking `Ver todas las guias` calls `getGuidesDbCb` with `scope: 'all'` and the current month/year/page/limit. Use `mockedGetGuidesDbCb.mockResolvedValue(createMockDbResponse())`, click the button, `waitFor(() => expect(mockedGetGuidesDbCb).toHaveBeenCalledWith(objectContaining({ scope: 'all', page: 1, limit: 10 })))`.
- Switching scope to `own` calls `getGuidesDbCb` with `scope: 'own'`. Click `Ver todas las guias`, then `selectOptions` the scope `<Select>` to `Mis guías`, `waitFor` the call with `scope: 'own'`.
- Non-admin never triggers the admin fetch. Render with `role: ['user']`; after interacting with `Ver mis guias`, assert `mockedGetGuidesDbCb` was never called with `objectContaining({ scope: expect.anything() })`.
- Admin list renders a record through `GuideDbCard`. `mockedGetGuidesDbCb.mockResolvedValue(createMockDbResponse())`; click `Ver todas las guias`; assert `getByTestId('guide-db-details-button')` is visible.
- Admin details open and close. After rendering the admin list, click `guide-db-details-button`; assert `kraftId` appears; click `guide-db-details-back-button`; assert the list reappears.

Mock rules to follow (from `.github/copilot-instructions.md`):

- Keep the existing `jest.mock('../../../src/shared/utils/guides.utils', ...)` partial mock (lines 12-16); the admin path reuses `getGuidesDbCb`, so no new mock entry is needed.
- Use `userEvent` for all interactions; do not use `fireEvent`.
- Do not mock `GuideDbCard` or `GuideDbDetails`; let them render for real.
- Use `screen.getByRole` / `getByTestId` / `getByText`; do not use `querySelector`.
- Do not assert on CSS classes.
- Mock data must match `GuideDbRecord` / `GetGuidesDbResponseData`; reuse `createMockDbRecord` / `createMockDbResponse`.

---

## Phase 3 - Soft-Delete Metadata In Cards And Details

### Changes Required

`src/features/Dashboard/subscreens/GuideDbCard.tsx`

- Action: Modify.
- Location: inside the `<article>` (lines 34-91), after the existing status/provider pills block (lines 58-72) or near the bottom `Ver detalles` button block (lines 80-89).
- Change: add a soft-delete metadata block rendered only when `guide.deletedAt != null`. Render a small pill/line using `GUIDES_DB_DELETED_MESSAGE` with the formatted `deletedAt` and `deletedBy` interpolated. Use `formatDateToSpanish(new Date(guide.deletedAt))` (already used in `GuideDbDetails`) for the date. Gate on `guide.deletedAt != null` (not `guide.deletedAt`), because per research open question II the field may be absent on non-deleted records.
- Keep card rendering identical for non-deleted records so normal guide cards are unaffected (AC 6). No prop or type change.

`src/features/Dashboard/subscreens/GuideDbDetails.tsx`

- Action: Modify.
- Location: after the failure-info block (lines 151-165), before the closing `</section>`.
- Change: add a soft-delete metadata `<article>` rendered only when `guide.deletedAt != null`, using `GUIDES_DB_DELETED_MESSAGE` with `formatDateToSpanish(new Date(guide.deletedAt))` and `guide.deletedBy ?? '—'`. Use a distinct `data-testid="guide-db-details-deleted"` so tests can target it. Do not couple this block to the failure-info block; a soft-deleted-but-created record should show only the soft-delete block, not the failure block (research edge case, lines 169).
- No type or prop change.

`src/shared/constants/guides.constants.ts`

- The `GUIDES_DB_DELETED_MESSAGE` template constant was added in Phase 1. If the implementer prefers a formatter helper over a raw template string, add `formatGuideDeletedMessage(deletedAt: string, deletedBy: string | null): string` in `src/shared/utils/guides.utils.ts` returning `Eliminada el {date} por {deletedBy ?? 'desconocido'}`. Pick whichever is the smaller diff; a single template constant interpolated inline is the smaller option and is preferred unless the implementer finds the inline interpolation duplicated across card and details.

- Edge case: `deletedBy` may be a user id or email depending on backend; format as-is. Do not invent a user-lookup; out of scope.

### Success Criteria

Automated:

- `pnpm test -- __tests__/feature/Dashboard/Order.test.tsx` - soft-delete metadata tests pass.
- `pnpm exec tsc --noEmit`.
- `pnpm lint`.

Manual (desktop and mobile/tablet):

- As an admin, switch to `Ver todas las guias` with `scope=all`; confirm soft-deleted records (those with non-null `deletedAt`) show the "Eliminada el {date} por {deletedBy}" line on the card.
- Open details for a soft-deleted record; confirm the soft-delete block appears and the failure block does not appear unless the record is also `failed`.
- As a regular user on `Ver mis guias`, confirm no soft-delete block appears (the backend does not return soft-deleted records for regular users, and the block is gated on `guide.deletedAt != null` regardless).

### Test Coverage

Extend `__tests__/feature/Dashboard/Order.test.tsx` further, or add a focused `__tests__/feature/Dashboard/GuideDbCard.test.tsx` / `GuideDbDetails.test.tsx` if the implementer prefers component-level tests. The `Order`-level integration test is preferred because it reuses the existing mock factories and provider wrappers; add only if the soft-delete block is easier to assert at the component level.

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `src/features/Dashboard/subscreens/GuideDbCard.tsx` | soft-delete metadata visible when `deletedAt` is non-null; absent when `deletedAt` is null/undefined | `createMockDbRecord({ deletedAt: '2026-06-15T10:00:00Z', deletedBy: 'admin@example.com' })` rendered through `Order` admin path; assert `getByText(/Eliminada el/)` |
| `src/features/Dashboard/subscreens/GuideDbDetails.tsx` | soft-delete block visible in details when `deletedAt` non-null; failure block and soft-delete block are independent | Open details for a soft-deleted-but-created record; assert `getByTestId('guide-db-details-deleted')`; assert `queryByTestId('guide-db-details-error')` is null |

New tests to add:

- Admin card shows soft-delete metadata. `createMockDbRecord({ deletedAt: '2026-06-15T10:00:00Z', deletedBy: 'admin@example.com' })`; click `Ver todas las guias`; assert `getByText(/Eliminada el.*admin@example.com/)` (or the formatted date) is visible.
- Non-deleted admin card does not show soft-delete metadata. `createMockDbRecord({ deletedAt: null, deletedBy: null })`; assert `queryByText(/Eliminada el/)` is null.
- Admin details show soft-delete block. Render admin list with a soft-deleted record, open details, assert `getByTestId('guide-db-details-deleted')`.
- Admin details for a soft-deleted-but-created record do not show the failure block. Same fixture as above with `status: 'created'` and `failureInfo: null`; assert `queryByTestId('guide-db-details-error')` is null.

Mock rules: same as Phase 2; reuse `createMockDbRecord` with `deletedAt`/`deletedBy` overrides.

---

## Cross-Cutting Concerns

- Auth cookies: no change. The admin path uses the same `getAccessToken()` bearer-token flow as the regular path; backend enforces admin authorization (AC 7). Frontend `isAdmin` gating is convenience, not security.
- Dashboard mobile/tablet branch: `Order` is rendered in both `Dashboard` branches; the admin source, scope select, and soft-delete metadata must work in both. No `useMediaQuery`-specific change beyond reusing `isMobileTablet`/`isDesktop` as Story 2 does.
- Env vars: no new env var. The admin endpoint is served by `BACKEND_URI`.
- API response shape: the admin endpoint uses the same `{ version, message, error, data }` envelope as the regular list; `GetGuidesDbResponseData` already matches. No new unwrap logic.
- Query cache: the admin query key includes `'admin'` and `adminScope` to avoid cache collisions with `Ver mis guias` and between scope switches (research edge case).
- `product-sat` uses `NEXT_PUBLIC_GET_SAT_PRODUCT_URI`, not `BACKEND_URI`; not relevant to this story but preserved as a boundary note.

## Open Questions / Out-Of-Scope Items

Out of scope (per research):

- Delete (soft or hard) UI/workflow; the backend supports delete but no delete action is included.
- Retry failed guide creation.
- Changes to Story 1 create flow or Story 2 regular list behavior beyond reusing their types/constants/callbacks.
- Global response-envelope normalization.
- Admin-only screens outside the existing `Order` subscreen; no new dashboard screen entry.
- Hard-delete auditing UI distinct from showing `deletedAt`/`deletedBy` metadata on existing cards/details.
- Backend changes outside this repository; backend authorization is assumed to enforce admin-only access to `GET /guides/db/admin`.
- Direct route-handler integration tests; this repo has no `__tests__/app/api/**` suite and the established pattern is to cover the BFF through `Order`-level mocked callbacks.

Open questions: none. All research open questions are answered.
