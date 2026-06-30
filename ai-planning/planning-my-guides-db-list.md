# My Guides DB List Implementation Plan

Source research: `ai-research/my-guides-db-list.story.md`

Sign-off status/date: treated as signed off from the `/plan` request input; open questions in the research doc are answered. Planning date: 2026-06-30.

Assumptions:

- Backend `GET /guides/db` is reachable through `BACKEND_URI` and uses the same bearer token session flow as existing guide routes.
- `GET /guides/db` excludes soft-deleted records for regular users; the frontend will not filter `deletedAt` client-side.
- `limit=10` is the backend default and should be omitted from the query string; send `limit` only for `50` or `100`.
- No backend-provided friendly error-code catalog exists in this repo. Use existing friendly Guides DB failure copy or a tiny local code-to-message map if known codes are present in implementation; never show `failureInfo.errorDetails` as the primary message.
- Story 3 admin list is out of scope. `Ver todas las guias` must not fetch anything in this story.

## Acceptance Criteria

1. A regular user can switch between `Ver guias externas` and `Ver mis guias` from the existing guides screen.
2. The DB-backed list supports month, year, and pagination query params.
3. The UI displays saved guide data including failed guide records when the backend returns them.
4. Soft-deleted guides are not returned by `GET /guides/db`, so regular users do not see deleted guides.
5. Loading, empty, and error states remain clear on desktop and mobile/tablet layouts.
6. The button group includes `Ver guias externas`, `Ver mis guias`, and `Ver todas las guias`; `Ver todas las guias` is admin-only Story 3 scope and should be hidden or disabled for regular users in Story 2.

## Affected Files

`src/app/api/**`:

- `src/app/api/guides-db/route.ts` - add `GET` list proxy while preserving existing `POST` create proxy.

`src/features/**`:

- `src/features/Dashboard/subscreens/Order.tsx` - add source selector, DB list query, DB filters/pagination, DB record rendering, explicit states.
- `src/features/ProfitMargin/SubscreenManagerGroupButton.tsx` - reference only; no changes planned.
- `src/features/Guides/ViewGuides/GuideCard.tsx` - reference only; no changes planned unless implementation proves a tiny shared status helper is safer.

`src/shared/**`:

- `src/shared/types/guides.types.ts` - add Guides DB list DTOs and query params.
- `src/shared/constants/guides.constants.ts` - add DB list endpoint constant and any minimal display constants needed by the UI.
- `src/shared/utils/guides.utils.ts` - add DB list callback and tiny DB status/failure display helper if keeping it out of `Order` reduces duplicated conditionals.

`__tests__/**`:

- `__tests__/feature/Dashboard/Order.test.tsx` - extend existing focused tests for source switching, DB params, states, failed records, and pagination.

Docs/config:

- No config changes expected.
- `REPO_CONTEXT.md` does not need a planning-time update; no new broadly useful verified repo fact was discovered beyond what it already records.

## Phase 1 - Types, Endpoint, And Callback

### Changes Required

`src/shared/types/guides.types.ts`

- Action: Modify near existing `CreateGuideDb*` and guide response types.
- Add `GetGuidesDbParams` with `page: number`, `month: number`, `year: number`, and optional `limit?: 10 | 50 | 100` or `number` if the backend type should stay less restrictive.
- Add `GuidesDbStatus = 'created' | 'failed'`.
- Add `GuideDbFailureInfo` with `errorCode: string`, optional `errorDetails?: string | null`, optional `timestamp?: string | null`.
- Add `GuideDbRecord` using persisted fields from research:
  - `kraftId: string`
  - `quoteId?: string | null`
  - nullable external fields: `externalId`, `trackingNumber`, `shipmentNumber`, `carrier`, `price`, `guideLink`, `labelUrl`, `file`
  - `status: GuidesDbStatus`
  - `provider: ProviderSource`
  - `isProviderTrackingSynced: boolean`
  - `failureInfo: GuideDbFailureInfo | null`
  - `origin`, `destination`, `parcel` using the existing Guides DB create payload shapes where they match; keep only fields the UI reads typed strictly.
  - `createdAt`, `updatedAt`, nullable `deletedAt`, nullable `deletedBy`.
- Add `GetGuidesDbResponse` matching `{ version, message, error, data: { guides, total, page, limit, totalPages } }`.
- Rationale: DB list records are not safe to coerce into `GetGuidesData` because failed records may have null external-provider fields.

`src/shared/constants/guides.constants.ts`

- Action: Modify near endpoint constants.
- Add `GET_GUIDES_DB_ENDPOINT = '/api/guides-db'`.
- If needed for UI copy, add constants for:
  - `GUIDES_DB_EMPTY_MESSAGE = 'No hay guias para el mes seleccionado.'`
  - `GUIDES_DB_ERROR_MESSAGE = 'Ha sucedido un error. Intentelo nuevamente'`
- Do not rename `CREATE_GUIDE_DB_ENDPOINT`; existing create flow must keep working.

`src/shared/utils/guides.utils.ts`

- Action: Modify imports and add callback near `getGuidesCb`.
- Add `getGuidesDbCb(params: GetGuidesDbParams): Promise<GetGuidesDbResponse['data']>`.
- Build the query string with `URLSearchParams`:
  - Always append `page`, `month`, and `year`.
  - Append `limit` only when the value is present and not `10`.
- Call `axios.get(`${GET_GUIDES_DB_ENDPOINT}?${params}`)` and return `res.data.data`.
- Optional helper: `getGuideDbStatusLabel(status: GuidesDbStatus): string` returning `Creado` or `Fallido`.
- Optional helper: `getGuideDbFailureMessage(failureInfo: GuideDbFailureInfo | null): string | null`, using friendly copy and not raw `errorDetails`.
- Edge cases:
  - Month must be `1` through `12`, not zero-padded.
  - Year must be full year number.
  - Do not change `getGuidesCb` or `generateGuideId`; DB records use `kraftId` instead.

### Success Criteria

Automated:

- `pnpm exec tsc --noEmit`
- `pnpm lint`

Manual:

- None for this phase; it is not user-visible until wired into `Order`.

### Test Coverage

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `src/shared/utils/guides.utils.ts` | DB callback sends `page`, `month`, `year`; omits default `limit`; sends `limit` for `50`/`100`; returns `data` envelope | Mock network callback style from existing feature tests; keep mock return shape aligned with implementation |

## Phase 2 - Guides DB BFF `GET`

### Changes Required

`src/app/api/guides-db/route.ts`

- Action: Modify near existing imports and before/after `POST`.
- Add `GET(request: NextRequest)`.
- Follow existing route-handler style:
  - `const accessToken = await getAccessToken()`.
  - Return `NextResponse.json({ message: 'missing access token' }, { status: 400 })` when missing.
  - Read `request.nextUrl.searchParams` for `page`, `month`, `year`, and `limit`.
  - Forward only present params to `${process.env.BACKEND_URI}/guides/db`.
  - Attach `Authorization: Bearer ${accessToken}`.
  - Return upstream data unchanged with status `200` so the shared callback can read `res.data.data`.
  - Use the same axios error fallback as `POST`, preferring `error.response.data.error.message || error.message`.
- Preserve existing `POST` behavior, including `201` for saved failed-provider records.
- Rationale: Reusing `/api/guides-db` is the smallest BFF surface and keeps Guides DB create/list together.

### Success Criteria

Automated:

- `pnpm exec tsc --noEmit`
- `pnpm lint`

Manual:

- With a valid session and backend available, request `/api/guides-db?page=1&month=6&year=2026` in the browser/devtools and confirm a `200` response with `data.guides`.
- Confirm an unauthenticated request returns `400` with `missing access token`.

### Test Coverage

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `src/app/api/guides-db/route.ts` | Optional route-handler coverage for success, missing access token, upstream error shape | Existing `src/app/api/guides/get-guides/route.ts` and `src/app/api/guides-db/route.ts` styles; no current API-route test directory exists, so skip route tests unless the team wants to establish one |

## Phase 3 - Source Selector And Query Wiring In `Order`

### Changes Required

`src/features/Dashboard/subscreens/Order.tsx`

- Action: Modify inside `Order` component.
- Add a local source union, e.g. `type GuideListSource = 'external' | 'ownDb'`.
- Add source state defaulting to `'external'`.
- Add current date defaults:
  - `selectedMonth` initialized to `new Date().getMonth() + 1`.
  - `selectedYear` initialized to `new Date().getFullYear()`.
  - `dbPage` initialized to `1`.
  - `dbLimit` initialized to `10`.
- Update external query:
  - Query key should become `['guides', 'external']`.
  - Use `enabled: selectedSource === 'external'`.
- Add DB query:
  - Query key `['guides', 'db', selectedMonth, selectedYear, dbPage, dbLimit]`.
  - Query fn calls `getGuidesDbCb({ page: dbPage, month: selectedMonth, year: selectedYear, limit: dbLimit })`.
  - Use `enabled: selectedSource === 'ownDb'`.
- Add a Flowbite `ButtonGroup` near the welcome title:
  - `Ver guias externas` sets source to `'external'`.
  - `Ver mis guias` sets source to `'ownDb'` and page `1`.
  - `Ver todas las guias` renders disabled in Story 2 and does not call any handler.
- Do not create or wire an admin/all-guides fetch.
- Ensure external provider notifications only inspect external `messages` while `selectedSource === 'external'`.
- Edge cases:
  - Switching back to external should keep existing external list behavior and PKK lazy fetch behavior.
  - DB records must never pass through `generateGuideId` or set `hasBeenFetched: false`.

### Success Criteria

Automated:

- `pnpm test -- __tests__/feature/Dashboard/Order.test.tsx`
- `pnpm exec tsc --noEmit`
- `pnpm lint`

Manual:

- Desktop: open dashboard guides screen, confirm external guides load by default.
- Desktop: click `Ver mis guias`, confirm external cards are replaced by DB list states/data.
- Mobile/tablet viewport: repeat source switching and confirm controls remain usable.
- Click disabled `Ver todas las guias`; confirm no request is made and no screen change occurs.

### Test Coverage

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `__tests__/feature/Dashboard/Order.test.tsx` | Source selector renders fixed labels; external source calls `getGuidesCb`; selecting `Ver mis guias` calls `getGuidesDbCb`; `Ver todas las guias` is disabled/no-op | Existing QueryClientProvider and `useMediaQuery` mock in `Order.test.tsx`; use `userEvent`, not `fireEvent`; mock network callbacks with relative `jest.mock()` |

## Phase 4 - DB Filters, Pagination, And DB Record Rendering

### Changes Required

`src/features/Dashboard/subscreens/Order.tsx`

- Action: Modify JSX under the non-error content branch.
- Show DB-only controls when `selectedSource === 'ownDb'`:
  - Month select with numeric values `1` to `12`.
  - Year input/select using full year values; keep it local and simple.
  - Page-size select with `10`, `50`, `100`; callback should omit `limit` for `10` through Phase 1 behavior.
  - On month/year/limit change, reset `dbPage` to `1`.
- Add pagination when DB response has `totalPages > 1`:
  - Previous button disabled on page `1`.
  - Number buttons for pages `1..totalPages`.
  - Next button disabled on `page >= totalPages`.
- Render DB records without using `GuideCard` unless implementation proves all nullable fields are safe.
- Prefer a tiny local renderer inside `Order` or a colocated component only if `Order` becomes hard to read. Required visible fields:
  - Primary identifier: `kraftId`.
  - Secondary `externalId` in smaller muted text when present.
  - Provider badge/value from `provider`.
  - Status label for `created`/`failed`.
  - Friendly failure message for failed records.
  - Origin and destination names/cities.
  - Parcel content when present.
  - Label link only when `labelUrl` exists.
  - Price only when present.
- Loading state:
  - Keep existing external skeletons for external source.
  - For DB source, show a clear loading message or simple Flowbite skeleton/cards; do not trigger PKK lazy fetch.
- Empty state:
  - DB empty list shows `No hay guias para el mes seleccionado.`.
  - External empty state can remain minimal unless the final JSX needs a shared empty branch; do not invent new external behavior beyond AC 5.
- Error state:
  - DB query error shows `Oops!` and `Ha sucedido un error. Intentelo nuevamente`.
  - External error behavior remains unchanged.
- Edge cases:
  - Failed DB records may have null `trackingNumber`, `shipmentNumber`, `carrier`, `price`, `guideLink`, `labelUrl`, and `file`; rendering must not crash.
  - `failureInfo` may be null; show status only or generic friendly failure copy.
  - Backend owns soft-delete filtering; no client-side `deletedAt` condition in this story.

### Success Criteria

Automated:

- `pnpm test -- __tests__/feature/Dashboard/Order.test.tsx`
- `pnpm exec tsc --noEmit`
- `pnpm lint`

Manual:

- Desktop: select `Ver mis guias`; change month/year and confirm requests include numeric `month`, full numeric `year`, and reset `page=1`.
- Desktop: change page size to `50` and `100`; confirm `limit` is sent. Change back to `10`; confirm `limit` is omitted.
- Desktop: use previous/next and page-number controls; confirm the requested page changes.
- Mobile/tablet: repeat DB empty, failed-record, and pagination flows.
- Confirm a failed DB record with no external tracking still shows `kraftId` and a failed status/message.

### Test Coverage

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `__tests__/feature/Dashboard/Order.test.tsx` | DB default params use current month/year and page 1; month/year changes reset page; limit select sends non-default limits; previous/next and page numbers change page; failed record with null external fields renders `kraftId` and friendly failure copy; empty DB list renders exact empty copy; DB query error renders error state; external provider messages do not appear for DB source | Existing `Order` tests; Testing Library `screen`; `userEvent`; do not assert classes or visual styling; preserve skipped tests if any are added later |

## Phase 5 - Focused Test Updates

### Changes Required

`__tests__/feature/Dashboard/Order.test.tsx`

- Action: Modify existing test file; do not create a broad new suite unless the file becomes unreadable.
- Extend the existing guides utils mock to include `getGuidesDbCb` as a named mocked export, using the current relative `jest.mock('../../../src/shared/utils/guides.utils')` pattern.
- Import `userEvent` from `@testing-library/user-event` for source switching and filter/pagination interactions.
- Add mock DB response builders matching `GetGuidesDbResponse['data']`, not backend envelope or invented shapes.
- Keep existing external tests green by defaulting external callback mocks to `{ guides: mockGuides, messages: [] }` where needed.
- Add focused tests for:
  - Source selector labels and disabled `Ver todas las guias` behavior.
  - Switching to `Ver mis guias` calls DB callback with current month/year and page `1`.
  - Changing month/year resets page to `1`.
  - Page-size `10` does not require a `limit` query from callback behavior; `50` and `100` do.
  - Failed DB record with null external fields renders `kraftId`, provider, failed status, and friendly message.
  - Empty DB response renders `No hay guias para el mes seleccionado.`.
  - DB query rejection renders the existing error copy.
  - External provider messages stay tied to the external source.
- Respect project test constraints:
  - Use `screen` queries only.
  - Use `userEvent`, not `fireEvent`.
  - Do not mock internal components like `GuideCard`.
  - Do not assert CSS classes or visual styling.
  - Do not include file extensions in imports.
  - Preserve any existing `it.skip()` / `test.skip()` if encountered.

### Success Criteria

Automated:

- `pnpm test -- __tests__/feature/Dashboard/Order.test.tsx`
- `pnpm exec tsc --noEmit`
- `pnpm lint`

Manual:

- None beyond Phases 3 and 4; this phase verifies behavior already covered manually there.

### Test Coverage

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `__tests__/feature/Dashboard/Order.test.tsx` | Full Story 2 UI behavior: source switching, DB params, failed DB records, empty/error/loading-safe rendering, mobile/tablet branch through mocked media query | Existing `Order` test wrapper; `.github/copilot-instructions.md` unit test rules |

## Cross-Cutting Concerns

- Auth cookies: only the route handler reads the session via `getAccessToken()`; client code calls `/api/guides-db`.
- API response shape: external guides return `{ guides, messages }`; DB guides return backend envelope `data`. Keep these callbacks separate instead of normalizing globally.
- React Query cache: include source and filters in keys so external and DB data never share `['guides']` cache.
- Dashboard responsive behavior: `Order` is used in both desktop and mobile/tablet dashboard branches; test both through `useMediaQuery` mock and manual viewport checks.
- Provider failures: external provider partial-fetch messages remain external-only. DB `status: failed` is saved data, not a transport error.
- Admin boundary: `Ver todas las guias` is displayed disabled/no-op for Story 2; no admin fetch, scope param, or backend admin contract is planned.

## Open Questions / Out-of-Scope Items

Open questions:

- None blocking. The only implementation assumption is the exact friendly mapping for `failureInfo.errorCode`; use existing friendly copy unless a code catalog is present by implementation time.

Out of scope:

- Admin `Todas las guías DB` fetch and `scope=all|own` behavior.
- Delete, soft-delete, hard-delete, or retry actions.
- Backend changes or client-side soft-delete filtering.
- Global API envelope normalization.
- New pagination/filter component library or state library.
- Refactoring existing external guide cards, PKK lazy-fetch behavior, or unrelated route handlers.
