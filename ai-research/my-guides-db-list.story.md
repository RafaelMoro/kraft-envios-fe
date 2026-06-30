# My Guides DB List Research

## Story Definition

### Story Title

My Guides DB List.

### Story Description

Regular users need a `Ver mis guias` view from the existing `Ver guias` dashboard screen. A Flowbite button group should separate the current external-provider guides fetch from the new regular-user Guides DB fetch. This view should fetch app-owned Guides DB records from the regular-user backend endpoint, support month/year/page query params, and render saved records including records whose provider creation failed.

This research is scoped to Story 2 from `ai-research/guides-db-epic.md`, lines 31-39. Admin/all-guides behavior is out of scope except where it affects boundaries for Story 3.

### Acceptance Criteria

1. A regular user can switch between `Ver guias externas` and `Ver mis guias` from the existing guides screen.
2. The DB-backed list supports month, year, and pagination query params.
3. The UI displays saved guide data including failed guide records when the backend returns them.
4. Soft-deleted guides are not returned by `GET /guides/db`, so regular users do not see deleted guides.
5. Loading, empty, and error states remain clear on desktop and mobile/tablet layouts.
6. The button group includes `Ver guias externas`, `Ver mis guias`, and `Ver todas las guias`; `Ver todas las guias` is admin-only Story 3 scope and should be hidden or disabled for regular users in Story 2.

### Scope Classification

Single story.

### Research Mode

Full template.

### User-Confirmed Scope

- Keep this to regular-user `Ver mis guias`.
- Exclude admin/all-guides behavior except as a boundary note.
- Prioritize the existing `Order` screen and regular list API contract.

### Out Of Scope

- Admin `Todas las guías DB` view.
- Admin `scope=all|own` behavior.
- Delete, soft-delete action UI, hard-delete action UI.
- Retry failed guide creation.
- Changes to the Story 1 create flow except reusing its types or constants where already present.
- Global response-envelope normalization.
- Implementing the admin data fetch for `Ver todas las guias`; only reserve the button-group slot/boundary for Story 3.

## Technical Research

### Current State Summary

- Story 1 artifacts already exist in this checkout: `src/app/api/guides-db/route.ts`, `src/features/Guides-DB/**`, `CreateGuideDb*` types, `CREATE_GUIDE_DB_ENDPOINT`, and `createGuideDbCb`.
- The existing regular guide list remains external-provider based only.
- `Order` currently calls `getGuidesCb` with query key `['guides']` and renders provider guides through `GuideCard`.
- There is no regular-user Guides DB list BFF route yet.
- There are no Guides DB list response types yet.
- There is no source selector in `Order` yet.
- The requested source selector labels are `Ver guias externas`, `Ver mis guias`, and `Ver todas las guias`.
- There is no pagination/month/year state in `Order` yet.

### Affected Areas

Routes/pages:

- `src/app/dashboard/page.tsx` is the authenticated dashboard server wrapper and should not need story-specific changes.
- `src/features/Dashboard/Dashboard.tsx` renders `Order` for `screen === 'overview'` in both desktop and mobile/tablet branches.
- Story 2 should stay inside the existing guides screen instead of adding a new dashboard screen.

API route handlers:

- Existing external list route: `src/app/api/guides/get-guides/route.ts` proxies `${BACKEND_URI}/guides` and returns `{ guides, messages }`.
- Existing Guides DB create route: `src/app/api/guides-db/route.ts` only implements `POST` to `${BACKEND_URI}/guides/db/create`.
- Story 2 needs a regular-user list proxy for backend `GET /guides/db`.
- The BFF should follow current route-handler style: `getAccessToken()`, `400` for missing token, `Authorization: Bearer <token>`, `NextResponse.json`, and existing axios error fallback.
- Query params needed for regular list are `page`, `month`, and `year`; `limit` exists in backend context but the Story 2 AC only names month, year, and pagination.

Feature UI:

- `src/features/Dashboard/subscreens/Order.tsx` is the primary target.
- `Order` currently owns list state, external guide transform, provider failure notifications, loading, error, and guide card rendering.
- `src/features/Guides/ViewGuides/GuideCard.tsx` assumes external guide fields: `source`, `trackingNumber`, `shipmentNumber`, `carrier`, `price`, `labelUrl`, `origin`, `destination`, `courier`, and status text.
- `src/features/Guides/ViewGuides/GuideCardPkk.tsx` performs an extra external PKK fetch when `guide.source === 'Pkk' && hasBeenFetched === false`; DB list records should not trigger that behavior by accident.
- `src/features/Guides/ViewGuides/GuidesTable.tsx` exists but does not appear used by `Order`; it also assumes external `GetGuidesData` shape.
- `src/features/ProfitMargin/SubscreenManagerGroupButton.tsx` is the local Flowbite `ButtonGroup` example to follow for source switching.
- Story 2 should wire `Ver guias externas` to the existing `getGuidesCb` flow and `Ver mis guias` to the new regular `GET /guides/db` flow.
- `Ver todas las guias` is reserved for the Story 3 admin implementation and should not trigger a regular-user DB fetch.

Shared code:

- `src/shared/types/guides.types.ts` already contains Story 1 DB create types but no full DB guide list type.
- `src/shared/constants/guides.constants.ts` already has `CREATE_GUIDE_DB_ENDPOINT = '/api/guides-db'` but no regular DB list endpoint constant.
- `src/shared/utils/guides.utils.ts` already has `getGuidesCb` for external guides and `createGuideDbCb`; Story 2 needs a regular DB list callback or a small extension without breaking external list callers.
- `src/shared/types/quotes.types.ts` defines `ProviderSource = 'GE' | 'TONE' | 'Pkk' | 'Mn'`, which should be reused for DB `provider`.
- `src/shared/utils/quotes.utils.ts` has `getQuoteImg`, currently used by external list transforms from `courier`; DB records may need a safe fallback when `carrier`/`courier` is null.

Tests:

- Existing `Order` tests live in `__tests__/feature/Dashboard/Order.test.tsx`.
- Existing Guides DB create tests live under `__tests__/feature/Guides-DB/*`.
- There are no API route handler tests under `__tests__/app/api/**` in this checkout.
- New focused tests should stay near `__tests__/feature/Dashboard/Order.test.tsx` for the UI and use the same QueryClientProvider pattern.

### Existing Patterns To Follow

App Router and server/client split:

- Client components should call BFF routes, not backend endpoints directly.
- Route handlers requiring session must read auth through `getAccessToken()`.
- Keep domain UI in `src/features/**`; shared DTOs/callbacks/constants live in `src/shared/**`.

TanStack Query:

- Existing `Order` uses `useQuery` for the guide list.
- DB list query keys should include source and filters so external and DB data do not share cache.
- Avoid one generic query key such as `['guides']` for both external and DB-backed sources.

Flowbite React:

- Flowbite React is already installed; no dependency is needed.
- `SubscreenManagerGroupButton` shows the local `ButtonGroup` import and active-button class pattern.
- A source selector can follow that established ButtonGroup style without adding a new design system piece.
- Button group verbiage is fixed as `Ver guias externas`, `Ver mis guias`, and `Ver todas las guias`.

Forms and filters:

- The repo already uses Flowbite controls and local React state for small filters.
- There is no existing month/year/pagination component in this codebase.
- The smallest consistent route is local state inside `Order` or a tiny colocated component if JSX gets hard to read.

Route handler proxy style:

- `src/app/api/guides/get-guides/route.ts` is the closest list proxy.
- `src/app/api/guides-db/route.ts` is the closest DB endpoint proxy and already uses Story 1 DB response types.
- Existing handlers return `400` for missing access token; do not change that behavior in this story.
- Existing route handlers commonly collapse upstream failures to `{ message }` with `400`.

Testing conventions:

- Use `userEvent`, not `fireEvent`.
- Do not mock internal components from `@/features` or `@/shared` unless unavoidable.
- Mock network callbacks and browser APIs.
- When using `jest.mock()`, use relative imports for mocked modules.
- Do not mock `next/image`.
- Do not query DOM with `document.querySelector()` or `document.getElementById()`.
- Do not assert styling/classes unless critical.
- Preserve skipped tests.
- Mock data must match real return shapes after reading implementations.

### Backend Contract Captured So Far

Regular list endpoint:

- Backend path: `GET /guides/db`.
- Regular-user list does not return soft-deleted guides.
- Auth should be preserved through the session access token.

Query params:

- `page`: optional number.
- `limit`: optional number; backend default is 10, and earlier epic answers say not to pass a page size by default.
- `month`: optional string.
- `year`: optional string.

Default filters:

- Earlier epic answer says month/year should default to the current month and year when not filled.
- This story should apply that default only for the regular DB list source unless product explicitly wants external guides filtered too.

List response envelope:

- Envelope is `{ version, message, error, data }`.
- `data.guides` is an array of Guides DB records.
- `data.total` is total matching records.
- `data.page` is current page.
- `data.limit` is current page size.
- `data.totalPages` is total pages.

DB guide record fields observed from existing epic research:

- `kraftId`: app-owned guide ID.
- `quoteId`: may exist.
- `externalId`, `shipmentNumber`, `carrier`, `price`, `guideLink`, `labelUrl`, and `file` can be `null`.
- `status`: `created | failed`.
- `provider`: provider source value.
- `isProviderTrackingSynced`: boolean.
- `createdAt`, `updatedAt`, `deletedAt`, `deletedBy` are present.
- `failureInfo`: `null` for successful provider creation; contains `errorDetails`, `errorCode`, and `timestamp` for failed provider creation.
- `origin`, `destination`, and `parcel` details are persisted on successful DB create responses and should be expected on list records unless backend says otherwise.

### Existing Order Flow Findings

Current external list behavior:

- `Order` displays `Bienvenido {userInfo?.data?.user?.name}`.
- External list fetch starts immediately on mount.
- External query key is `['guides']`.
- External callback is `getGuidesCb`.
- External callback returns `{ guides, messages }`.
- The component transforms external guides into `GuideUI[]` in a `useEffect`.
- TONE status is normalized through `getGuideStatus`.
- Each guide gets an `id` from `generateGuideId(guide)`, currently `${guide.source}-${guide.trackingNumber}`.
- PKK guides are initially `hasBeenFetched: false`; other sources are true.
- External provider partial failures are shown through `Notification` when backend messages include TONE or GE known messages.
- The new button group must keep the external list fetch isolated from the DB list fetch; selecting `Ver guias externas` uses the current external endpoint, while selecting `Ver mis guias` uses the regular Guides DB endpoint.

Implications for DB list:

- DB list failures are not the same as external provider partial-fetch messages.
- A DB record with `status: failed` should render as a saved record, not as query error.
- DB failed records may not have tracking number, shipment number, guide link, label URL, carrier, or price.
- `generateGuideId` is not safe for DB failed records because it depends on `source` and `trackingNumber`.
- DB records use `provider`, not `source`.
- DB records should use `kraftId` for stable React keys and display identity.
- DB records should not set `hasBeenFetched: false`, or they may accidentally use PKK external lazy fetch behavior.
- Existing empty state is implicit: an empty grid under the welcome title. AC 5 asks for a clear empty state, so the research flags this as a gap.

### Rendering Options For DB Records

Option A: Map DB records into existing `GuideUI`.

- Smaller surface area in `Order` because it can reuse `GuideCard`.
- Requires fake or nullable-compatible values for fields that DB failed records may not have.
- Risk: existing card labels say `Número de Guia`; failed DB records may only have `kraftId`.
- Risk: status mapping and badges expect external field names.

Option B: Add a small DB-specific card/table row.

- Cleaner display of `kraftId`, provider, status, failure info, created date, origin/destination, parcel content, optional label link.
- Avoids fake external fields and PKK special-case coupling.
- More UI code than mapping.

Research note:

- Because AC 3 explicitly requires failed DB guide records, avoid relying on fields that may be null after provider failure.
- The implementation phase should choose the smallest option that clearly handles missing external tracking data.

### Filters And Pagination Findings

- No current guide pagination exists in `Order`.
- No current guide month/year filters exist in `Order`.
- Backend list response includes `page`, `limit`, `total`, and `totalPages`.
- Earlier epic answer says not to pass `limit` by default; backend default is 10.
- Month/year default should be current month/year when filters are not filled.
- If filter values change, current page should return to page 1 to avoid empty pages for narrower filters.
- Pagination controls only need regular next/previous or page buttons sufficient to navigate `totalPages`; no dependency needed.

### Loading, Empty, And Error States

Existing external list states:

- Loading shows four `GuideCard` skeletons.
- Error shows `Oops!` and `Ha sucedido un error. Intentelo nuevamente`.
- Empty state shows no explicit message.

Story 2 needs:

- Loading state for DB list while `GET /guides/db` is pending.
- Clear empty state when `data.guides` is empty.
- Clear error state when the BFF/backend call fails.
- Desktop and mobile/tablet should work because `Order` receives `isDesktop` from `useMediaQuery` and is rendered in both dashboard branches.

### Edge Cases And Constraints

- Soft-deleted guides should not be filtered client-side for regular users; backend `GET /guides/db` is responsible for excluding them.
- If a soft-deleted record appears from regular endpoint, that is a backend contract issue; frontend should not add admin deletion logic in Story 2.
- `status: failed` means saved DB record with provider failure, not transport/query error.
- `failureInfo` may be null even when optional display fields are null; UI should not crash.
- DB records may have no `labelUrl`; label action should be conditional.
- DB records may have no `trackingNumber` or `externalId`; use `kraftId` as fallback display and key.
- Existing `getGuideStatusLabel()` does not map lowercase `failed`.
- Existing `getGuideStatus()` maps external text and defaults to `En proceso`; do not use it blindly for DB `failed`.
- Month/year query param type is documented as string; UI values can stay strings.
- `product-sat` and guide creation fields are out of scope for this story.
- Admin source visibility belongs to Story 3.

### Dependencies And Integration Points

- No new dependency appears necessary.
- `flowbite-react` already provides `ButtonGroup`, `Button`, form inputs, pagination-capable buttons, badges, cards, and spinners.
- `@tanstack/react-query` already handles fetching/caching.
- `axios` is already used by shared callbacks and route handlers.
- Existing env vars are enough; backend base should remain `BACKEND_URI`.
- No `.env.example` change is expected.

## Task Breakdown For Future Planning

High-level actions only:

1. Add regular Guides DB list types for record, response envelope, and query params.
2. Add a regular list BFF route for `GET /guides/db` that forwards month/year/page query params and auth.
3. Add a shared callback/endpoint constant for the regular DB list.
4. Add source state in `Order` so users can switch between `Ver guias externas` and `Ver mis guias`, with `Ver todas las guias` reserved for admin Story 3.
5. Add month/year/page controls for the DB source.
6. Render DB records, including failed records, without depending on nullable external guide fields.
7. Add/update focused tests for source selection, query params, failed-record rendering, empty state, error state, and pagination behavior.

## Testing Research

### Existing Test Patterns

- `__tests__/feature/Dashboard/Order.test.tsx` wraps `Order` with `QueryClientProvider` and mocks `useMediaQuery`.
- The same test mocks `getGuidesCb` from `src/shared/utils/guides.utils` as the external network callback.
- Tests assert user-visible content and avoid style checks.
- Existing tests cover welcome message, error state, external guide rendering, mobile/tablet branches, and empty external data by absence.

### Focused Story 2 Tests To Add Later

- Source selector shows `Ver guias externas` and `Ver mis guias` for regular users.
- `Ver todas las guias` remains hidden or disabled for regular users until Story 3 admin implementation.
- Selecting `Ver mis guias` calls the DB list callback with current month/year and page 1.
- Selecting `Ver guias externas` keeps using the current external guide callback.
- Changing month/year refetches DB list and resets page to 1.
- Pagination next/previous changes `page` and refetches DB list.
- A DB guide with `status: failed` and null external fields still renders as a saved DB record.
- Empty DB list shows a clear empty-state message.
- DB list query error shows a clear error-state message.
- External provider messages continue to behave only for external source, not DB source.

### Route Handler Test Note

- No existing API-route test location exists in this checkout.
- If route tests are added later, use the nearest project convention established at that time.
- For this story, UI/callback-level tests may be enough unless the team wants route handler coverage.

## Open Questions

Backend contract:

- I: Question: What is the exact BFF path preferred for regular Guides DB list: reuse `/api/guides-db` with `GET`, or add a more explicit nested path such as `/api/guides-db/list`?
  - Status: pending
  - Context: Existing `/api/guides-db` currently has `POST` for create only. Reusing the same route with `GET` is the smallest route surface, but path preference is not documented.

- II: Question: Are `month` and `year` accepted as numeric strings like `"6"`/`"2026"`, zero-padded month strings like `"06"`, or month names?
  - Status: pending
  - Context: Existing epic says month/year are optional strings and default to current month/year, but the backend format is not explicit.

- III: Question: Does regular `GET /guides/db` always include `origin`, `destination`, and `parcel` for failed records?
  - Status: pending
  - Context: Create responses include persisted fields; list examples are summarized but not shown in this repo.

- IV: Question: Can `failureInfo` be present for statuses other than `failed`, or absent for `failed` records?
  - Status: pending
  - Context: UI should avoid crashing either way, but display copy depends on this contract.

UI/product decisions:

- I: Question: What exact button group labels should be used for external, regular DB, and admin DB guide sources?
  - Status: answered
  - Answer: Use `Ver guias externas`, `Ver mis guias`, and `Ver todas las guias`.
  - Context: `Ver todas las guias` is for the admin implementation in Story 3.

- II: Question: What exact empty-state copy should appear when the current month/year has no DB guides?
  - Status: pending
  - Context: Existing external list has no explicit empty state; AC 5 requires clear states.

- III: Question: Should failed DB guide cards display `failureInfo.errorDetails` directly, a friendly error-code mapping, or only a generic failed status in the list?
  - Status: pending
  - Context: Story 1 result UI has friendly messages, but list detail level is not specified.

- IV: Question: Should users see `kraftId` as the primary identifier when no external tracking number exists?
  - Status: pending
  - Context: Failed DB records may not have tracking numbers, but users need a stable visible identifier.

Pagination and filters:

- I: Question: Should pagination expose only previous/next controls, or direct page number controls?
  - Status: pending
  - Context: No existing pagination component is present in this repo.

- II: Question: Should `limit` stay entirely omitted, or should the UI eventually expose page size?
  - Status: answered
  - Answer: Do not pass a page size by default. Backend default `limit` is 10.
  - Context: This was answered in the existing epic research.

Authorization:

- I: Question: Should frontend hide `Mis guías DB` for any user state, or is every authenticated regular user allowed to see it?
  - Status: pending
  - Context: Story says a regular user can view it; no extra frontend role restriction is documented.

## Assumptions

- `GET /guides/db` is served by the same backend base URI in `BACKEND_URI`.
- The frontend should add a BFF route handler rather than calling backend directly from `Order`.
- Regular authenticated users can access `Mis guías DB` without admin role checks.
- The button label for the regular DB list is `Ver mis guias`.
- `Ver todas las guias` is reserved for admin users in Story 3 and should not fetch admin data in Story 2.
- Backend excludes soft-deleted guides for regular `GET /guides/db`; frontend does not need delete filtering.
- Month/year default to the current month/year for the DB list source.
- `limit` should not be sent by default.
- DB list should coexist with the existing external-provider guides list through a Flowbite button group.
- Existing external guide provider-message notifications should not be applied to DB list responses.
- `kraftId` is the safest stable key for DB list records.

## Non-Obvious Findings

- Story 1 create infrastructure is already present in the checkout, but list infrastructure is not.
- `Order` has an implicit empty state today; Story 2 needs an explicit one.
- Existing `GuideCard` is tightly coupled to external guide fields and PKK lazy-fetch behavior.
- DB failed records can be valid saved records with null external-provider fields, so external guide mapping is risky unless carefully guarded.
- `ButtonGroup` already exists in the ProfitMargin feature and is the local Flowbite pattern for this selector.
- There are no API route handler tests in the current checkout, so adding route tests would establish a new test location.
