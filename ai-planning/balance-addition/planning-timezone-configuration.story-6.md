# Implementation Plan: Configure The Canonical Business Timezone For Frontend Dates

**Source research:** `ai-research/balance-addition/timezone-configuration.story-6.md`  
**Research sign-off:** Complete; the user supplied the research as signed off and every recorded question is answered.  
**Sign-off confirmation date:** 2026-07-22  
**Planning date:** 2026-07-22

## Assumptions

- Coordinated frontend and backend deployments use `America/Mexico_City`; the frontend must reject every other value rather than accept another valid IANA zone.
- Backend timestamp fields covered by this story are complete ISO 8601 instants with `Z` or a numeric offset. Offsetless strings are contract violations and are not interpreted in the browser timezone.
- Existing timestamp DTO properties, route responses, Axios callback results, TanStack Query data, and selected-record state remain raw strings. Formatting occurs only while rendering.
- Guides DB range mode requires both selected calendar dates. It does not expose the backend's independent open-ended boundary behavior.
- A selected range end is inclusive at the calendar-date level and becomes the next Mexico City calendar midnight as an exclusive API instant.
- Luxon is used only where the platform lacks a named-zone calendar-date-to-instant constructor. Native `Intl.DateTimeFormat` remains the timestamp-display mechanism.
- The browser and Node runtimes provide IANA data for `America/Mexico_City`, including its historical 2021 DST rules.
- Existing Spanish timestamp output remains `MMM D, hh:mm am/pm`; invalid or offsetless timestamp input renders a stable `--` placeholder instead of malformed or browser-local text.
- The Guides DB filter uses one small mode selector with `Mes y año` and `Rango de fechas`; this is the minimum UI needed to make month/year and range transport mutually exclusive.
- Future Balance request list stories import the shared business-calendar and display helpers directly. This story does not add Balance list state, routes, query keys, or UI.

## Acceptance Criteria

1. Frontend runtime configuration exposes and validates `NEXT_PUBLIC_BUSINESS_TIMEZONE=America/Mexico_City`; timestamp behavior never silently falls back to the browser timezone or a fixed UTC offset.
2. Every rendered API timestamp is parsed as an instant and displayed in the configured timezone while its original API string remains unchanged in DTOs, TanStack Query data, component state, and proxy responses.
3. Existing guide month/year requests submit integer business-calendar values only, default current month/year values are derived in `America/Mexico_City`, and the same shared behavior is available to the later balance list stories.
4. Guides DB range filters omit both `month` and `year`, convert selected calendar dates in `America/Mexico_City` to complete ISO 8601 instants with `Z` or a numeric offset, and use the next-day local midnight as the exclusive end when an end date is selected.
5. Focused tests prove `2026-02-01T06:00:00.000Z` displays as Mexico City local midnight independent of browser timezone and cover a historical named-zone DST transition without fixed-offset assumptions.

## Delivery Sequence

1. Enforce the public timezone contract and add the shared instant-display and business-calendar primitives.
2. Extend the Guides DB typed request, browser serialization, and authenticated proxy with mutually exclusive month/year and range modes.
3. Add bounded range controls to the existing Guides DB filter surface and complete focused feature, transport, and production verification.

Phase 1 establishes the only timezone/date conversion boundary. Phase 2 consumes its range output without changing response records. Phase 3 wires the transport into the existing own/admin Guides DB queries and UI.

## Affected Files

### Environment, Dependencies, And Executable Config

- Modify `.env.example`.
- Modify `next.config.mjs`.
- Modify `jest.config.ts`.
- Modify `package.json`.
- Modify `pnpm-lock.yaml` through pnpm dependency installation.

### `src/app/api/**`

- Modify `src/app/api/guides-db/route.ts`.

### `src/features/**`

- Modify `src/features/Dashboard/subscreens/Order.tsx`.
- Modify `src/features/Dashboard/subscreens/GuideDbDetails.tsx`.
- Modify `src/features/Dashboard/subscreens/GuideDbCard.tsx`.
- Modify `src/features/Guides/ViewGuides/GuideCard.tsx`.
- Modify `src/features/Guides/ViewGuides/GuideCardPkk.tsx`.

### `src/shared/**`

- Modify `src/shared/constants/global.constants.ts`.
- Modify `src/shared/constants/guides.constants.ts`.
- Create `src/shared/utils/date.utils.ts`.
- Modify `src/shared/utils/guides.utils.ts`.
- Modify `src/shared/types/guides.types.ts`.

### `__tests__/**`

- Create `__tests__/shared/utils/date.utils.test.ts`.
- Create `__tests__/feature/Guides-DB/getGuidesDb.test.ts`.
- Create `__tests__/api/guides-db.route.test.ts`.
- Modify `__tests__/feature/Dashboard/Order.test.tsx`.
- Modify `__tests__/feature/Guides/ViewGuides/GuideCardPkk.test.tsx`.

### Documentation

- Modify `REPO_CONTEXT.md` after implementation to update the `/api/guides-db` parameter inventory. The planning-time Jest initialization note is already recorded there.

### Deliberately Unchanged

- `src/features/Balance/**` and `src/app/api/balance/route.ts`: Stories 3 and 4 own Balance history/admin list behavior; this story only exposes reusable helpers.
- `src/features/QueryProviderWrapper.tsx`: keep per-provider `QueryClient` construction and raw API records unchanged.
- External guide routes under `src/app/api/guides/**`: preserve their raw response envelopes; range filters apply only to Guides DB.
- Guides DB record timestamp types: `createdAt`, `updatedAt`, `deletedAt`, and failure timestamps already use raw strings.
- `jest.setup.ts`: timezone configuration must exist before `next/jest` loads `next.config.mjs`, so `setupFilesAfterEnv` is too late.
- `tsconfig.json` and `postcss.config.mjs`: existing strict TypeScript and Tailwind settings need no change.
- `DESIGN.md`: existing Flowbite, spacing, label, responsive, and dark-mode conventions cover the new native date controls.
- Backend code, backend timezone discovery, response localization, telemetry, logging, caching, and deployment automation.

## Phase 1: Configuration And Shared Date Primitives

### Changes Required

#### `.env.example`

**Action:** Modify near the other `NEXT_PUBLIC_*` variables.

- Document the required public business timezone with the canonical value.
- Keep it public because client components need the same build-time value for display and date-range conversion.

```env
NEXT_PUBLIC_BUSINESS_TIMEZONE=America/Mexico_City
```

#### `next.config.mjs`

**Action:** Modify before constructing/exporting `nextConfig`.

- Compare `process.env.NEXT_PUBLIC_BUSINESS_TIMEZONE` with the exact canonical string during configuration loading.
- Throw one descriptive configuration error when the variable is missing or differs, before applying the Flowbite wrapper.
- Preserve `transpilePackages: ['jose']` and `withFlowbiteReact(nextConfig)` unchanged.
- Do not add a runtime fallback, browser-timezone detection, fixed offset, or configuration endpoint.

Planned guard shape:

```js
if (process.env.NEXT_PUBLIC_BUSINESS_TIMEZONE !== 'America/Mexico_City') {
  throw new Error('NEXT_PUBLIC_BUSINESS_TIMEZONE must be America/Mexico_City')
}
```

**Edge case:** Next configuration is also loaded by `next/jest`; the test value must be established before `createJestConfig` evaluates the app configuration.

#### `jest.config.ts`

**Action:** Modify near the imports, before `nextJest({ dir: './' })` is invoked.

- Set `process.env.NEXT_PUBLIC_BUSINESS_TIMEZONE` explicitly to `America/Mexico_City` for Jest configuration loading.
- Do not defer this assignment to `jest.setup.ts` or individual suites.
- Preserve jsdom, coverage, ignored helper directories, and existing setup behavior.

#### `package.json`

**Action:** Modify dependencies and devDependencies.

- Add `luxon` as a runtime dependency for named-zone calendar-date conversion.
- Add `@types/luxon` as a development dependency required by this strict TypeScript project.
- Add no other date package or timezone-data bundle.

#### `pnpm-lock.yaml`

**Action:** Modify through pnpm when adding `luxon` and `@types/luxon`.

- Commit only the lockfile resolution changes produced by the two approved packages.
- Do not run a general dependency upgrade.

#### `src/shared/constants/global.constants.ts`

**Action:** Modify near the existing cross-feature constants.

- Export `BUSINESS_TIMEZONE` from the direct `process.env.NEXT_PUBLIC_BUSINESS_TIMEZONE` reference so Next can inline the public build-time value in client code.
- Type it as a string after the executable configuration guard; do not repeat runtime fallback logic in components.

Planned constant:

```ts
export const BUSINESS_TIMEZONE = process.env.NEXT_PUBLIC_BUSINESS_TIMEZONE as string
```

#### `src/shared/utils/date.utils.ts`

**Action:** Create as the single cross-feature date boundary.

- Export `formatDateToSpanish(timestamp: string)` for rendering complete API instants.
- Require an ISO 8601 string with `Z` or an explicit numeric offset before parsing. Return the same `fullDateTime`, `date`, and `time` shape currently consumed by guide components.
- Use `Intl.DateTimeFormat(..., { timeZone: BUSINESS_TIMEZONE })`/`formatToParts()` so every calendar field comes from Mexico City rather than local `Date` getters.
- Preserve the existing Spanish month abbreviations, 12-hour zero-padded time, lowercase `am`/`pm`, and no locale-wide copy changes.
- Return `--` fields for invalid, non-instant, or offsetless values. Never retry in the browser timezone.
- Export `getBusinessCalendarMonthYear(instant: Date = new Date())` and derive numeric `month`/`year` with the same configured `Intl` zone. This is the reusable default for Guides now and Balance list stories later.
- Export `toBusinessDateRange(startDate: string, endDate: string)` for two `YYYY-MM-DD` calendar values.
- Use Luxon with `zone: BUSINESS_TIMEZONE`, validate both date-only values and their order, add one calendar day to the selected end in-zone, and serialize both boundaries as complete UTC ISO strings ending in `Z`.
- Return `null` for missing, malformed, or reversed ranges so the caller cannot submit contradictory or incomplete range filters.

Planned public boundary:

```ts
export type FormattedBusinessTimestamp = {
  fullDateTime: string
  date: string
  time: string
}

export type BusinessMonthYear = {
  month: number
  year: number
}

export type BusinessDateRange = {
  startDate: string
  endDate: string
}

export const formatDateToSpanish = (
  timestamp: string,
): FormattedBusinessTimestamp

export const getBusinessCalendarMonthYear = (
  instant?: Date,
): BusinessMonthYear

export const toBusinessDateRange = (
  startDate: string,
  endDate: string,
): BusinessDateRange | null
```

**Edge cases:** Do not parse a date-only input with `new Date('YYYY-MM-DD')`. Calendar-day addition must occur before conversion to UTC; adding `86_400_000` milliseconds is incorrect across the 2021 Mexico City spring transition.

#### `src/shared/utils/guides.utils.ts`

**Action:** Modify around the current `formatDateToSpanish()` export.

- Delete the guide-owned formatter after callers import the shared date utility.
- Keep guide request callbacks, status helpers, and response handling unchanged in this phase.
- Do not retain a compatibility wrapper; all current callers are in this repository and are updated below.

#### Current timestamp consumers

**Action:** Modify `GuideDbDetails`, `GuideDbCard`, `GuideCard`, and `GuideCardPkk` at each `formatDateToSpanish()` call.

- Import `formatDateToSpanish` from `@/shared/utils/date.utils` rather than `guides.utils`.
- Pass the raw timestamp string directly; remove temporary `new Date(...)` construction.
- Keep DTO/state fields and existing visible placement unchanged.
- Keep conditional rendering for nullable timestamps exactly where it already exists.

Affected symbols:

- `src/features/Dashboard/subscreens/GuideDbDetails.tsx`: local `createdDate`/`updatedDate`, failure timestamp, and deleted timestamp rendering.
- `src/features/Dashboard/subscreens/GuideDbCard.tsx`: deleted metadata rendering.
- `src/features/Guides/ViewGuides/GuideCard.tsx`: PKK `startDate` rendering.
- `src/features/Guides/ViewGuides/GuideCardPkk.tsx`: desktop/mobile `startDate` rendering.

**Rationale:** Parsing inside the shared function lets it reject offsetless contract violations before JavaScript can reinterpret them as browser-local time.

#### `src/shared/types/guides.types.ts`

**Action:** Modify `GetGuidesData.startDate`.

- Change the external PKK transport field from `Date | null` to `string | null`.
- Keep `GuideUI` inheriting the transport value without localization or conversion.

```ts
startDate?: string | null
```

#### `__tests__/shared/utils/date.utils.test.ts`

**Action:** Create.

- Import the real pure helpers; do not mock `Intl`, Luxon, the timezone constant, or internal modules.
- Prove `2026-02-01T06:00:00.000Z` renders exactly as `Feb 1, 12:00 am` regardless of the host/browser timezone.
- Prove `2026-02-01T05:59:59.999Z` still renders as January 31 in Mexico City.
- Prove an offsetless timestamp and malformed timestamp produce the stable placeholder rather than local or malformed output.
- Freeze/pass an instant at a UTC month/year boundary and prove `getBusinessCalendarMonthYear()` returns Mexico City calendar numbers.
- Convert a range spanning Mexico City's 2021 spring DST transition and assert the next local midnight is 23 elapsed hours after the selected start midnight.
- Prove reversed, incomplete, and invalid date-only ranges return `null`.

#### `__tests__/feature/Guides/ViewGuides/GuideCardPkk.test.tsx`

**Action:** Modify the existing typed fixtures and exact date assertions.

- Replace both offsetless `Date` values with explicit UTC instant strings matching the corrected transport type.
- Keep the real formatter active while retaining the existing `getPkkGuide` network-boundary mock.
- Assert the timezone-correct visible result on both mobile and desktop.
- Preserve all unrelated coverage and skipped tests.

### Success Criteria

**Automated**

```bash
pnpm test -- __tests__/shared/utils/date.utils.test.ts __tests__/feature/Guides/ViewGuides/GuideCardPkk.test.tsx
pnpm exec tsc --noEmit
```

Expected configuration-failure check:

```bash
NEXT_PUBLIC_BUSINESS_TIMEZONE=UTC pnpm build
```

The expected result of the last command is a non-zero exit during Next configuration loading with the descriptive timezone error.

**Manual**

1. Start the app with `NEXT_PUBLIC_BUSINESS_TIMEZONE=America/Mexico_City` and confirm a guide instant at `2026-02-01T06:00:00.000Z` displays as `Feb 1, 12:00 am`.
2. Repeat in a browser/system timezone outside Mexico City and confirm the visible value is unchanged.
3. Remove or alter the variable and confirm Next dev/configuration loading stops instead of rendering with a fallback.
4. Inspect one fetched guide record in TanStack Query/state and confirm its timestamp remains the original API string.

### Test Coverage

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `__tests__/shared/utils/date.utils.test.ts` | UTC boundary display; explicit-zone business month/year; invalid/offsetless fallback; historical DST calendar addition; reversed/incomplete range rejection | Direct pure utility imports; no internal mocks |
| `__tests__/feature/Guides/ViewGuides/GuideCardPkk.test.tsx` | explicit string DTO fixture and identical timezone-correct date display in desktop/mobile branches | Existing fresh retry-disabled QueryClient and `screen` assertions in the same file |
| `next.config.mjs` | canonical value accepted; missing/non-canonical value rejects configuration loading | Expected-failure build command plus final canonical production build |

## Phase 2: Mutually Exclusive Guides DB Transport

### Changes Required

#### `src/shared/types/guides.types.ts`

**Action:** Modify `GetGuidesDbParams` near `GuideDbRecord`.

- Split the date-filter portion into a mutually exclusive union while preserving pagination and admin options.
- Month mode requires integer `month` and `year` and cannot carry range fields.
- Range mode requires complete instant strings for `startDate` and `endDate` and cannot carry month/year.
- Do not model partial ranges because the signed-off frontend behavior requires both boundaries.

Planned structure:

```ts
type GuidesDbMonthFilter = {
  month: number
  year: number
  startDate?: never
  endDate?: never
}

type GuidesDbRangeFilter = {
  month?: never
  year?: never
  startDate: string
  endDate: string
}

export type GetGuidesDbParams = {
  page: number
  limit?: 10 | 50 | 100
  scope?: 'all' | 'own'
  includeDeleted?: boolean
  includeInternalPricing?: boolean
} & (GuidesDbMonthFilter | GuidesDbRangeFilter)
```

#### `src/shared/utils/guides.utils.ts`

**Action:** Modify `getGuidesDbCb()`.

- Continue constructing `URLSearchParams`, returning `res.data.data`, and preserving all raw record timestamps.
- Always serialize `page`; preserve current optional `limit`, `scope`, `includeDeleted`, and `includeInternalPricing` rules.
- When the typed params contain `month`/`year`, append only those date fields as integer strings.
- Otherwise append only `startDate`/`endDate`; rely on `URLSearchParams` to encode `+` if an offset representation is ever supplied.
- Do not normalize, localize, or clone guide records.

Critical conditional:

```ts
if ('month' in params) {
  // append month and year only
} else {
  // append startDate and endDate only
}
```

#### `src/app/api/guides-db/route.ts`

**Action:** Modify the `GET` query allowlist near `entries`.

- Add `startDate` and `endDate` to the existing forwarded keys.
- Continue forwarding query values unchanged through Axios `params`.
- Preserve own/admin path selection from `scope`, bearer authentication, response envelopes, statuses, POST behavior, and existing error handling.
- Continue dropping unrelated browser-supplied query keys.

**Edge case:** The route does not resolve contradictory filters; typed browser callers prevent them. Backend precedence and direct-caller validation remain outside this frontend story.

#### `__tests__/feature/Guides-DB/getGuidesDb.test.ts`

**Action:** Create beside the existing Guides DB callback tests.

- Mock Axios as the external network boundary with `jest.Mocked<typeof axios>` and explicit response types.
- Assert month mode emits integer `month`/`year` and no range fields.
- Assert range mode emits both complete instants and no `month`/`year`.
- Include an explicit positive-offset fixture to prove `URLSearchParams` encodes `+` as `%2B`, even though the shared range helper emits UTC `Z` strings.
- Assert optional pagination/admin fields retain current serialization behavior.
- Return a fixture containing explicit UTC timestamps and assert the callback returns those strings unchanged.

#### `__tests__/api/guides-db.route.test.ts`

**Action:** Create for the real `GET` route handler.

- Follow the typed Axios, `NextResponse.json`, and auth mock structure in `__tests__/api/balance.route.test.ts`.
- Prove own-list range params reach `${BACKEND_URI}/guides/db` unchanged with the bearer header.
- Prove `scope=all`/`scope=own` range params reach `${BACKEND_URI}/guides/db/admin` and preserve admin flags.
- Include an unrelated query field and assert the allowlist drops it.
- Assert the successful upstream envelope and raw timestamp strings are returned unchanged.
- Cover missing access token without an upstream call.
- Preserve the route's current error status/body behavior; do not broaden this story into error normalization.
- Use named mocks, relative paths in `jest.mock()`, extensionless imports, and explicit DTO fixtures without `any`/`unknown`.

### Success Criteria

**Automated**

```bash
pnpm test -- __tests__/feature/Guides-DB/getGuidesDb.test.ts __tests__/api/guides-db.route.test.ts
pnpm exec tsc --noEmit
```

**Manual**

1. Call `/api/guides-db` in month mode and confirm the upstream query contains numeric `month` and `year` strings but no range boundaries.
2. Call the same local route with encoded range instants and confirm the upstream own/admin request contains `startDate` and `endDate` but no month/year.
3. Confirm the local route still returns the backend's timestamp strings and envelope without localization.

### Test Coverage

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `__tests__/feature/Guides-DB/getGuidesDb.test.ts` | mutually exclusive callback serialization; positive-offset URL encoding; existing optional fields; raw response preservation | Typed Axios callback pattern from `__tests__/feature/Guides-DB/updateGuideDb.test.ts` |
| `__tests__/api/guides-db.route.test.ts` | own/admin upstream paths; range allowlist; unrelated-key dropping; bearer auth; missing token; unchanged response timestamps/envelope | Direct route-handler pattern from `__tests__/api/balance.route.test.ts` |

## Phase 3: Guides DB Business-Calendar And Range UI

### Changes Required

#### `src/features/Dashboard/subscreens/Order.tsx`

**Action:** Modify `Order`, its current date constants/state, own/admin queries, date handlers, and filter controls.

- Import `TextInput` from Flowbite and the real `getBusinessCalendarMonthYear()`/`toBusinessDateRange()` helpers.
- Remove module-level browser-local `currentYear`/`YEARS` and both local-`Date` state initializers.
- At component initialization, obtain one business-calendar `{ month, year }`, use it for selected defaults, and derive the existing five-year option list from that business year.
- Add local `filterMode: 'month' | 'range'`, `rangeStart: string`, and `rangeEnd: string` state. Do not add a form library or shared state.
- Derive a valid converted range only through `toBusinessDateRange()`. Range-mode own/admin queries remain disabled until both boundaries are present and ordered.
- Build one local typed date-filter object and pass the same values to both own and admin `getGuidesDbCb()` calls.
- Include the active filter mode and all active server-affecting values in both TanStack Query keys. Preserve the external `['guides', 'external']` key.
- Month mode sends only numeric month/year. Range mode sends only converted instant boundaries.
- On mode, month, year, start, or end change, reset `dbPage` to `1` and clear `selectedDbGuide`, matching existing filter behavior.
- Keep `dbLimit`, admin scope, deleted/internal-pricing flags, deletion invalidation, edit behavior, and pagination unchanged.
- Add a labeled Flowbite `Select` for `Mes y año` versus `Rango de fechas` within the current wrapping filter row.
- Render the current month/year selects only in month mode.
- Render two labeled Flowbite `TextInput` controls with native `type="date"` in range mode. Store their `YYYY-MM-DD` values unchanged.
- Show one accessible text error when only one boundary is selected or the end precedes the start. Do not issue a Guides DB request in either state.
- Keep the controls usable in the existing responsive wrapping layout and dark theme; add no new panel/modal/component abstraction.

Planned state and mode boundary:

```ts
type GuideDateFilterMode = 'month' | 'range'

const [filterMode, setFilterMode] = useState<GuideDateFilterMode>('month')
const [rangeStart, setRangeStart] = useState('')
const [rangeEnd, setRangeEnd] = useState('')
```

Range validation behavior:

| State | Request behavior | Visible guidance |
| --- | --- | --- |
| Month mode | Send integer month/year only | Existing month/year controls |
| Range mode, both blank | No request | Prompt for both dates |
| One boundary selected | No request | Both dates are required |
| End before start | No request | End cannot precede start |
| Valid bounded range | Send converted start/exclusive end only | No validation error |

**Edge cases:** Switching modes must not let a stale hidden filter leak into transport. The query key must change when either selected calendar date changes, and the converted end must come from in-zone calendar addition rather than elapsed milliseconds.

#### `src/shared/constants/guides.constants.ts`

**Action:** Modify `GUIDES_DB_EMPTY_MESSAGE` near the existing Guides DB copy.

- Replace the month-only wording with one concise message valid for either active filter mode.
- Do not alter unrelated Spanish date/status copy.

Planned copy:

```ts
export const GUIDES_DB_EMPTY_MESSAGE = 'No hay guias para los filtros seleccionados.'
```

#### `__tests__/feature/Dashboard/Order.test.tsx`

**Action:** Modify the existing `When switching to DB source` coverage and typed fixtures.

- Keep the real date utilities; mock only existing network/browser boundaries.
- Use Jest fake system time at a UTC instant whose browser-local month/year could differ from Mexico City, then assert the default callback receives the Mexico City integer month/year.
- Update the current year-option test to derive expectations from the fixed business instant rather than `new Date().getFullYear()`.
- Use `userEvent` and semantic `screen` label/role queries for mode, month/year, and date controls; do not index generic combobox arrays.
- Prove month mode sends only month/year and hides/omits range fields.
- Prove range mode shows both native date controls, waits for both values, converts a valid range, and omits month/year.
- Prove the selected end becomes the next Mexico City midnight for the dates entered through the UI; leave the historical DST edge case to the shared utility test.
- Prove a partial or reversed range shows an accessible message and never calls `getGuidesDbCb()`.
- Move to a later pagination page, then change a range boundary and assert the next request uses page `1` and a changed range. Also prove selected detail state closes on a filter change.
- Cover the same range request shape through the admin source with scope/admin flags retained.
- Update the empty-state assertion to the mode-neutral constant text.
- Preserve existing real child components, explicit `GuideDbRecord` fixtures, fresh retry-disabled QueryClient, and skipped tests.

### Success Criteria

**Automated**

```bash
pnpm test -- __tests__/feature/Dashboard/Order.test.tsx
pnpm test -- __tests__/shared/utils/date.utils.test.ts __tests__/feature/Guides-DB/getGuidesDb.test.ts __tests__/api/guides-db.route.test.ts __tests__/feature/Guides/ViewGuides/GuideCardPkk.test.tsx __tests__/feature/Dashboard/Order.test.tsx
pnpm design:lint
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

**Manual**

1. At desktop width of at least `1024px`, open `Ver mis guias`, confirm the current Mexico City month/year is selected, and verify month changes send integer values only.
2. Switch to range mode, select a start and end date, and inspect the local request: it must contain complete encoded `startDate`/`endDate` instants and no `month`/`year`.
3. Select an end before the start and then only one boundary; verify visible guidance appears, no request runs, and stale month results are not presented as a new range result.
4. Navigate past page 1, change either range date, and confirm pagination returns to page 1 and open guide details close.
5. As an admin, repeat the valid range through `Ver todas las guias` for both scopes and confirm scope/deleted/internal-pricing behavior remains intact.
6. At mobile/tablet widths through `1023px`, verify the mode selector, two native date controls, validation, list, and pagination wrap without horizontal overflow in light and dark themes.
7. Confirm external guides have no range controls/request parameters and their existing source query remains unchanged.

### Test Coverage

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `__tests__/feature/Dashboard/Order.test.tsx` | business-zone defaults; mode exclusivity; bounded native-date interaction; incomplete/reversed blocking; converted params; query identity; page/detail reset; own/admin parity; generic empty copy | Existing real `Order` tree, fresh QueryClient, browser/network mocks, `userEvent`, and `screen` in the same suite |
| `src/features/Dashboard/subscreens/Order.tsx` | external source unaffected; current own/admin pagination, edit, deletion, and admin flags preserved while date filters change | Existing broad `Order.test.tsx` regression coverage |

## Cross-Cutting Concerns

- **Configuration:** `NEXT_PUBLIC_BUSINESS_TIMEZONE` is required at Next configuration load and must exactly equal `America/Mexico_City`. Tests establish it before `next/jest` loads the app config.
- **Timestamp immutability:** Route handlers, callbacks, Query data, component state, and DTO fields keep complete API strings. Only render-time helpers derive display parts.
- **Named-zone semantics:** `Intl` formats instants; Luxon constructs instants from calendar dates. No browser-local getters, fixed UTC-06:00 assumptions, or 24-hour end-date arithmetic are permitted.
- **Filter precedence:** The TypeScript union, callback serialization, and UI mode all prevent month/year and range fields from sharing one request. The proxy remains a narrow allowlist rather than a business-rule validator.
- **Cache identity:** Own/admin query keys include every active server-affecting date value and pagination/admin option. External guide and future Balance query keys remain unchanged.
- **Authentication:** Browser range requests still call `/api/guides-db`; its route reads the httpOnly session and attaches the bearer token server-side.
- **Response shapes:** Existing mixed envelopes and raw timestamp strings remain unchanged. This story does not normalize route errors or backend date validation.
- **Accessibility:** Every selector/date input has a visible associated label; invalid range guidance is discoverable through semantic text/alert behavior; native controls retain keyboard/browser accessibility.
- **Responsive design:** Add controls inside the current flex-wrapping filter row using Flowbite/Tailwind/Geist patterns. Do not add a parallel design system or alter dashboard shell branches.
- **Test conventions:** Use `userEvent`, `screen`, explicit DTO fixtures, named mocks, relative paths in `jest.mock()`, extensionless imports, no internal-component mocks, no DOM selectors, no CSS assertions, and no `any`/`unknown`.

## Open Questions / Out Of Scope

### Open Questions

- None blocking implementation. The research answers canonical zone, strict configuration failure, bounded ranges, endpoint scope, inclusive/exclusive semantics, filter precedence, and historical DST coverage.

### Out Of Scope

- Backend `BUSINESS_TIMEZONE`, backend month boundaries, backend invalid-date/reversed-range error handling, or changes to silent filter precedence.
- Browser-derived UTC boundaries for month/year filters.
- Timestamp localization in route handlers, Axios callbacks, Query caches, DTOs, or React state.
- Range filters for external `/guides` data.
- Open-ended Guides DB ranges or time-of-day inputs.
- Balance history/admin queue screens, routes, pagination, status filters, cancellation, approval, rejection, payment references, or deep links.
- User-selectable timezone preferences, browser-timezone fallback, runtime backend timezone discovery, fixed-offset aliases, or global locale/currency changes.
- Guide filter redesign beyond the required mode selector and native date controls.
- Query-key factories, date service classes, wrappers around Luxon, new state libraries, telemetry, logging, caching, broad route cleanup, release automation, changelog work, or CI assumptions.

## Decisions Beyond The Research Document

1. Move `formatDateToSpanish()` from the guide utility to one shared `date.utils.ts` module and change it to accept the raw instant string. This enforces the API-string contract once and makes the same formatter available to future Balance timestamp surfaces.
2. Return `--` for invalid or offsetless timestamp input. The research required one non-misleading fallback but did not choose copy; this preserves current component structure without inventing localized error UI per timestamp.
3. Serialize valid calendar ranges to UTC `Z` strings. The accepted contract also allows numeric offsets; UTC output is complete, deterministic, and still derives boundaries from Mexico City calendar arithmetic.
4. Use one `Filtrar por` selector and conditionally render month/year or two native date inputs. The research requires mutually exclusive modes but does not prescribe controls; this is the smallest accessible addition to the existing filter row.
5. Disable range queries until both dates form a valid ordered range. The current list fetches immediately rather than through a submit button, so query enablement is the direct equivalent of the signed-off requirement not to submit partial/reversed ranges.
6. Use a mutually exclusive TypeScript union for `GetGuidesDbParams`. This prevents contradictory requests at the existing browser boundary without adding runtime factories or backend behavior.

## Repository Context Update

- Planning added the verified `next/jest` initialization-order note to `REPO_CONTEXT.md` because required Next configuration values must be established before `setupFilesAfterEnv`.
- After implementation, update the `/api/guides-db` route inventory to list forwarded `startDate` and `endDate`; document month/range exclusivity as a typed browser-caller/UI contract, not route enforcement.
