# Timezone Configuration Story Research

## Story Definition

### Story Title

Configure the canonical business timezone for frontend dates.

### Story Number And Epic Placement

Story 6 in the Add Balance epic.

This is a blocking prerequisite for Story 3, Review And Cancel Own Requests, and Story 4, Admin Request Queue And Decisions. It also corrects existing guide timestamp display and prepares Guides DB date-range filters for the same backend timezone contract.

### Story Description

The frontend needs one configured IANA timezone for business-calendar filters and timestamp display. API timestamp strings remain UTC instants in client state and request handling. Presentation converts those instants to `America/Mexico_City`, while month/year filters remain plain business-calendar values and Guides DB date ranges become explicit ISO 8601 instants derived from selected Mexico City calendar dates.

The backend deployment currently uses `BUSINESS_TIMEZONE=America/Mexico_City`. The frontend counterpart is `NEXT_PUBLIC_BUSINESS_TIMEZONE=America/Mexico_City` so browser code can use the same named zone.

### Scope Classification

Single cross-cutting enabling story with four high-level tasks:

1. Add and validate frontend timezone configuration.
2. Centralize named-zone timestamp display without mutating API DTOs.
3. Align guide and balance business-calendar filter behavior.
4. Add deterministic UTC-boundary and DST regression coverage.

### Research Mode

Full research, prioritizing date conversion, configuration, guide filters, and balance filters.

### User-Confirmed Decisions

- Apply the canonical display timezone to all frontend timestamps, not only balance timestamps.
- Keep this as Story 6 under the existing Add Balance epic.
- Use `America/Mexico_City` as the canonical IANA timezone.
- Apply `startDate` and `endDate` range filters to Guides DB own/admin list requests, not the external guide list.
- Treat selected range dates as inclusive calendar dates by submitting the next business-calendar midnight as the exclusive `endDate` instant.
- Luxon is allowed for named-zone calendar-date-to-instant conversion.
- Month/year queries remain business-calendar numbers; the browser does not derive UTC month boundaries.
- Missing or non-canonical frontend timezone configuration must fail Next.js configuration loading rather than ship a runtime fallback.

### Acceptance Criteria

1. Frontend runtime configuration exposes and validates `NEXT_PUBLIC_BUSINESS_TIMEZONE=America/Mexico_City`; timestamp behavior never silently falls back to the browser timezone or a fixed UTC offset.
2. Every rendered API timestamp is parsed as an instant and displayed in the configured timezone while its original API string remains unchanged in DTOs, TanStack Query data, component state, and proxy responses.
3. Existing guide month/year requests submit integer business-calendar values only, default current month/year values are derived in `America/Mexico_City`, and the same shared behavior is available to the later balance list stories.
4. Guides DB range filters omit both `month` and `year`, convert selected calendar dates in `America/Mexico_City` to complete ISO 8601 instants with `Z` or a numeric offset, and use the next-day local midnight as the exclusive end when an end date is selected.
5. Focused tests prove `2026-02-01T06:00:00.000Z` displays as Mexico City local midnight independent of browser timezone and cover a historical named-zone DST transition without fixed-offset assumptions.

### Out Of Scope

- Backend implementation of `BUSINESS_TIMEZONE` or backend month-boundary queries.
- Deriving UTC start/end boundaries for month/year filters in the browser.
- Localizing timestamps in backend responses or replacing UTC storage.
- Reformatting raw API timestamps before storing them in TanStack Query or React state.
- Date ranges for the external `/guides` source.
- Adding balance request history, admin queue, cancellation, decisions, or deep-link UI in this story.
- Redesigning the guide filters or changing existing Spanish date copy beyond timezone correctness.
- A user-selectable timezone preference.
- A runtime backend configuration endpoint for timezone discovery.
- Global locale, language, or currency changes.
- Correcting backend range validation, exception handling, or silent filter precedence.

## Technical Research

### Current State Summary

- No frontend timezone environment variable exists in `.env.example` or executable configuration.
- The existing Add Balance epic already records `NEXT_PUBLIC_BUSINESS_TIMEZONE=America/Mexico_City`, no browser-local fallback, and UTC API timestamp preservation as the accepted contract.
- Every currently rendered timestamp ultimately uses `formatDateToSpanish()` in `src/shared/utils/guides.utils.ts`.
- `formatDateToSpanish()` uses local `Date` getters, so the same UTC instant displays differently in browsers with different timezones.
- Guides DB timestamps are correctly typed as strings and remain unchanged through route handlers and client callbacks.
- External guide `startDate` is incorrectly typed as `Date`, although JSON transport supplies a string value.
- Guides DB month/year filters already travel as integer query values and are represented in TanStack Query keys.
- Guides DB default month/year values come from browser-local `Date` getters and can disagree with Mexico City near a month or year boundary.
- No current source file contains a guide `endDate` field or a Guides DB range-filter contract.
- The supplied backend implementation supports independent `startDate` and `endDate` fields, but the frontend does not expose or forward them.
- Balance request DTO timestamps are strings, but no implemented balance surface displays them yet.
- No date library is installed. The user has approved Luxon for correct named-zone calendar-date conversion.
- Jest does not pin or vary the process timezone, and existing exact date assertions use offsetless timestamps.

### Affected Areas

#### Environment And Executable Configuration

- `.env.example`: does not list `NEXT_PUBLIC_BUSINESS_TIMEZONE`.
- `next.config.mjs`: contains Flowbite wrapping and `jose` transpilation only; there is no environment validation.
- `package.json`: contains no date/time package. Adding Luxon requires dependency and `pnpm-lock.yaml` changes during implementation.
- `jest.config.ts` and `jest.setup.ts`: contain no timezone-specific setup.

The timezone must be public because formatting and date-filter interaction occur in client components. Next.js replaces `NEXT_PUBLIC_*` references at build time, so deployment values must be present when the frontend bundle is built.

#### Shared Date Utilities

- `src/shared/utils/guides.utils.ts:452-490`: `formatDateToSpanish()` manually maps Spanish month names and reads `getMonth()`, `getDate()`, `getHours()`, and `getMinutes()` in the runtime-local timezone.
- The helper returns `fullDateTime`, `date`, and `time`, which lets existing consumers retain their current visible shape.
- The helper currently accepts a `Date`, so callers parse strings before formatting. A shared presentation boundary must continue to avoid replacing raw DTO fields.
- Invalid dates are not detected and can render malformed text.
- Cross-feature timezone configuration belongs under `src/shared/constants` or another existing shared boundary, not inside Balance or Guides.
- Cross-feature date conversion/formatting belongs under `src/shared/utils`.

#### Existing Timestamp Consumers

- `src/features/Dashboard/subscreens/GuideDbDetails.tsx:40-43` displays `createdAt` and `updatedAt`.
- `src/features/Dashboard/subscreens/GuideDbDetails.tsx:229-240` displays `failureInfo.timestamp`.
- `src/features/Dashboard/subscreens/GuideDbDetails.tsx:245-253` displays the date portion of `deletedAt`.
- `src/features/Dashboard/subscreens/GuideDbCard.tsx:128-134` displays the date portion of `deletedAt`.
- `src/features/Guides/ViewGuides/GuideCard.tsx:44-45` displays external PKK `startDate`.
- `src/features/Guides/ViewGuides/GuideCardPkk.tsx:54-55` displays external PKK `startDate` on desktop and mobile.
- `src/shared/types/balance.types.ts:30-39` already models `decisionAt`, `createdAt`, and `updatedAt` as strings for future request-history UI.
- SAT metadata has `created_at` and `updated_at` string fields, but no current UI renders them.

These are all current display consumers found in `src`. Centralizing timezone behavior in the existing shared formatter avoids per-component conversion rules.

#### Guide Month And Year Filters

- `src/features/Dashboard/subscreens/Order.tsx:37-53` defines numeric month values and a five-year list based on the browser-local current year.
- `src/features/Dashboard/subscreens/Order.tsx:67-69` defaults month and year through browser-local `Date` getters.
- `src/features/Dashboard/subscreens/Order.tsx:86-104` includes month and year in own/admin Guides DB query keys and callback parameters.
- `src/features/Dashboard/subscreens/Order.tsx:179-189` resets pagination and selected details when either value changes.
- `src/shared/types/guides.types.ts:463-471` requires numeric `month` and `year` in `GetGuidesDbParams`.
- `src/shared/utils/guides.utils.ts:749-770` serializes the numeric values with `URLSearchParams` and returns the response data without timestamp conversion.
- `src/app/api/guides-db/route.ts:15-33` allowlists and forwards `month` and `year` unchanged to own/admin backend paths.

The existing transport shape already satisfies the backend rule: submit month/year business-calendar values, not browser-derived UTC boundaries. Only the initial/current calendar calculation is timezone-dependent today.

#### Guides DB Range Filters

- There is no current Guides DB `startDate`/`endDate` UI state.
- There are no range fields in `GetGuidesDbParams`.
- The browser callback does not serialize range fields.
- The Guides DB route allowlist drops unknown range fields.
- TanStack Query keys do not include range values.
- No current test covers range selection or explicit-offset transport.

The accepted frontend range semantics are:

- A selected start date means `00:00:00.000` on that calendar date in `America/Mexico_City`.
- A selected end date includes the whole selected calendar day.
- The submitted `endDate` is `00:00:00.000` on the following calendar date in `America/Mexico_City`.
- Both values are serialized as complete ISO instants with `Z` or an explicit numeric offset.
- Range mode must omit both `month` and `year`; sending either one makes the backend silently ignore both range values.
- Adjacent ranges therefore meet at an exclusive boundary without `23:59:59.999` precision assumptions.
- Range values are server-affecting and must be represented in every applicable query key.
- URL serialization must preserve positive offsets correctly; `URLSearchParams` handles `+` as `%2B`.

#### Balance Month And Year Filters

- `src/features/Balance/BalanceDisplay.tsx` only queries current balance under `['balance']`.
- `src/features/Balance/BalanceRequestDialog.tsx` creates amount-only requests and invalidates the future `['balance', 'requests']` prefix.
- `src/app/api/balance/route.ts` supports current-balance GET and request-creation POST only.
- Balance request history and admin queue month/year filters are not implemented yet.
- `ai-research/add-balance.epic.md` defines optional regular-user `month`/`year` and admin `month`/`year` queries.

This story establishes shared business-calendar defaults and query semantics for Stories 3 and 4. Those later stories still own their screens, list route handlers, pagination, status filtering, and mutations.

### Backend And Frontend Contract

#### Backend Handoff

- Backend month/year filters are interpreted in configured `BUSINESS_TIMEZONE`.
- Current backend deployment value is `America/Mexico_City`.
- Stored timestamps remain UTC instants.
- Response `Date` values serialize to UTC ISO 8601 strings ending in `Z`.
- Backend responses do not contain localized timestamp strings.
- Frontend owns display localization.
- Backend Guides DB filtering selects month/year mode when either `month` or `year` is present.
- Month/year mode ignores `startDate` and `endDate` without returning an error.
- Range mode runs only when both month and year are absent and at least one range boundary is present.
- With no month, year, start, or end value, the backend defaults to the current business month.
- `startDate` and `endDate` are independently optional; one boundary produces an open-ended Mongo query.
- A reversed range is accepted and returns `200` with an empty result rather than a validation error.
- DTO validation rejects clearly malformed or offsetless values with Nest validation `400` responses.
- A pattern-matching but invalid calendar date can reach `parseOffsetDateTime()`, throw a plain `Error`, and fall through to an unstructured `500`.

#### Frontend Configuration Contract

- Public environment key: `NEXT_PUBLIC_BUSINESS_TIMEZONE`.
- Required value for coordinated deployments: `America/Mexico_City`.
- The value is an IANA timezone identifier, not `UTC-6`, `CST`, or another fixed-offset alias.
- Missing or invalid configuration is a configuration error, not permission to use the browser timezone.
- Next.js configuration loading must fail when the variable is missing or differs from `America/Mexico_City`; dev, build, and start must not proceed with ambiguous date semantics.
- Jest must set the canonical value explicitly before loading application/configuration code.
- Luxon can validate and consume the configured named zone for date-range conversion.
- Native `Intl.DateTimeFormat` can format UTC instants in the configured named zone without a dependency.

#### Timestamp State Contract

- API DTO timestamp fields remain strings.
- Route handlers preserve backend envelopes and timestamp strings.
- Axios callbacks preserve timestamp strings.
- TanStack Query caches raw values.
- React state preserves raw values when records are selected or transformed.
- Display code creates a temporary instant representation and formatted text only.
- Offsetless timestamp strings are outside the supplied backend contract and must not be treated as implicit browser-local values.

### Existing Patterns To Follow

#### App Router And Client Boundaries

- Client components own interactive date inputs and TanStack Query state.
- Browser code calls local `/api` handlers and does not call `BACKEND_URI` directly.
- Route handlers explicitly allowlist forwarded query parameters.
- Public build-time configuration is appropriate for browser display and calendar conversion.

#### TanStack Query

- Keep `QueryClient` creation inside `QueryProviderWrapper`.
- Include all server-affecting date filters in each query key.
- Preserve raw API records in cache instead of replacing timestamp strings with localized values.
- Reset page to `1` when range, month, or year filters change, matching current guide behavior.

#### Forms And Native Inputs

- The range requirement concerns calendar dates, so native date input values in `YYYY-MM-DD` form are sufficient unless later design requirements say otherwise.
- Do not parse a date-only value with `new Date('YYYY-MM-DD')` and then apply browser-local getters; ECMAScript treats that form as UTC, not Mexico City calendar midnight.
- Range validation must reject an end date before the start date.
- The exclusive end is derived by adding one calendar day in the named zone, not by adding a fixed 24 hours to an instant.

#### Display Formatting

- Preserve existing Spanish month/date/time output unless product design requests a copy change.
- Use the configured `timeZone` explicitly for every display formatter.
- Named-zone formatting must handle day/month changes at UTC boundaries.
- Invalid or contract-breaking timestamp input needs one consistent non-misleading fallback rather than malformed date text.

### Dependency And Integration Analysis

- `Intl.DateTimeFormat` already handles instant-to-display conversion in an IANA timezone.
- Native `Intl` does not expose a direct zoned-calendar-date-to-instant constructor.
- Luxon is approved for converting `YYYY-MM-DD` business dates to local start-of-day instants and adding one calendar day for the exclusive end.
- Adding Luxon later changes `package.json` and `pnpm-lock.yaml`, plus TypeScript declarations if required by the selected version; no install occurs during research.
- Frontend and backend deployment configuration must carry matching IANA values.
- No backend timezone discovery endpoint is required for this delivery.
- Balance routes continue using `BACKEND_URI`; the external SAT URI is unrelated.

### Edge Cases And Constraints

- `2026-02-01T06:00:00.000Z` is `2026-02-01 00:00` in Mexico City and must display as February 1 midnight in every browser timezone.
- `2026-02-01T05:59:59.999Z` is still January 31 in Mexico City.
- A browser-local current month can differ from Mexico City's month around midnight at month end.
- A browser-local current year can differ from Mexico City's year around New Year.
- Historical Mexico City DST rules differ from the current UTC-06:00 behavior; fixed offsets cannot satisfy the named-zone regression.
- On Mexico City's 2021 spring DST transition, consecutive local midnights can be 23 elapsed hours apart. Adding one calendar day in the zone is not equivalent to adding 24 elapsed hours.
- Offsetless API strings do not prove an instant and are not part of the backend timestamp contract.
- Invalid IANA identifiers must fail validation.
- Invalid timestamp strings must not produce `undefined NaN` output.
- Date-range values must be URL encoded, especially any positive numeric offset.
- `startDate` must precede the exclusive `endDate`.
- Range requests must omit month/year because backend month/year precedence otherwise drops the range silently.
- The backend accepts partial open-ended ranges, but frontend product behavior for a single selected boundary remains undecided.
- The frontend must reject reversed ranges even though the backend returns a misleading successful empty result.
- Semantically invalid calendar dates can trigger an unstructured backend `500`; native date inputs and frontend parsing reduce normal exposure but do not fix the backend trust boundary.
- Existing tests always collect coverage, so focused runs remain slower than a no-coverage unit runner.

### Testing Rules To Follow

From `.github/copilot-instructions.md`:

- Use `userEvent` for filter interactions.
- Do not mock internal feature/shared components.
- Import pure date utilities directly rather than mocking them.
- Use relative paths when a Jest module mock is unavoidable.
- Use a fresh QueryClient with retries disabled for query-driven feature tests.
- Assert visible text, accessible controls, callback parameters, and request URLs rather than CSS.
- Use explicit DTO fixture types; do not use `any` or `unknown`.
- Preserve existing skipped tests.

Smallest useful timezone coverage:

- A focused shared utility test for `2026-02-01T06:00:00.000Z` rendering as `Feb 1, 12:00 am` under `America/Mexico_City`.
- The same assertion must not depend on the machine or browser timezone.
- A named-zone DST regression using historical `America/Mexico_City` rules, such as the 2021 spring transition.
- A range conversion assertion proving local start midnight and exclusive next-day midnight can be 23 elapsed hours apart across that transition.
- A malformed timestamp/configuration case proving no browser-local fallback.
- Existing PKK card assertions updated from offsetless `Date` fixtures to explicit UTC strings.
- A Guides DB filter test proving business-zone month/year defaults.
- A Guides DB callback/route test proving `startDate` and `endDate` are included and encoded.
- A range-mode request test proving neither `month` nor `year` is sent.
- A month/year-mode request test proving range fields are not sent, avoiding reliance on silent backend precedence.
- A reversed-range test proving the frontend does not submit the request.
- A query behavior test proving range changes reset pagination and alter query identity.
- Future balance history/admin tests reuse the same business-calendar default and display utilities rather than duplicating timezone assertions per component.

### Task Breakdown For Planning

1. Establish required public timezone configuration and validation behavior.
2. Define shared instant-display and business-calendar helpers.
3. Correct the external guide `startDate` transport type.
4. Route all current timestamp displays through the configured zone while preserving raw DTOs.
5. Derive guide current month/year in the configured business calendar.
6. Extend Guides DB range state, mutually exclusive filter serialization, parameter types, query keys, callback serialization, and route allowlist.
7. Add focused shared conversion tests and update affected guide tests.
8. Expose the shared behavior for future balance request history and admin queue stories.

## Open Questions

### Backend Contract

- I: Question: Which guide endpoint receives `startDate` and `endDate`?
  - Status: answered
  - Answer: Guides DB own/admin list requests through `/api/guides-db` and their corresponding backend paths.
- II: Question: What frontend range boundary semantics apply?
  - Status: answered
  - Answer: Start at selected-date midnight and end at the next calendar day's midnight in the business timezone, producing an inclusive selected-date range with an exclusive instant boundary.
- III: Question: May Guides DB range parameters be sent together with `month` and `year`, or does range mode replace month/year mode?
  - Status: answered
  - Answer: Range mode replaces month/year mode on the frontend. The backend uses month/year mode whenever either field is present and silently ignores range values; range mode runs only when neither is present.
  - Context: The current frontend callback always requires month/year, so it must support a range request that omits both values.
- IV: Question: Are both `startDate` and `endDate` required together, and what validation/error status does the backend return for a partial or reversed range?
  - Status: answered
  - Answer: The fields are independently optional. A partial range returns `200` using only `$gte` or `$lte`; a reversed range returns `200` with no matches. Clearly malformed values fail DTO validation with `400`, while some pattern-matching invalid calendar dates can escape as an unstructured `500`.
  - Context: Frontend validation should reject reversed ranges, but the backend still has a trust-boundary validation and exception-handling gap.
- V: Question: Will the backend reject semantically invalid calendar dates with a structured `400` instead of allowing `parseOffsetDateTime()` to produce an unstructured `500`?
  - Status: pending
  - Context: The current plain `Error` is not handled by the backend's `HttpException` filter and conflicts with its no-500 convention.
  - Explanation: Frontend validation does not replace backend validation for direct or non-browser callers.

### Configuration

- I: Question: What canonical frontend timezone is required?
  - Status: answered
  - Answer: `America/Mexico_City` through `NEXT_PUBLIC_BUSINESS_TIMEZONE`.
- II: Question: May implementation add a timezone dependency?
  - Status: answered
  - Answer: Yes. Luxon is allowed for named-zone calendar-date-to-instant conversion.
- III: Question: What visible production behavior should occur if the public timezone is missing or invalid?
  - Status: answered
  - Answer: Fail Next.js configuration loading for dev, build, and start unless `NEXT_PUBLIC_BUSINESS_TIMEZONE` exactly equals `America/Mexico_City`. Tests set the canonical value explicitly.
  - Context: This prevents deployment of a bundle with ambiguous date semantics and avoids a runtime browser fallback or error screen.
- IV: Question: Does the frontend need to fetch the effective backend timezone at runtime?
  - Status: answered
  - Answer: No. Coordinated frontend/backend deployment configuration is sufficient for this delivery.

### UI And Product Decisions

- I: Question: Which timestamp surfaces use the canonical display timezone?
  - Status: answered
  - Answer: All current and future frontend timestamp displays.
- II: Question: Should existing Spanish date formatting change as part of timezone work?
  - Status: answered
  - Answer: No product format change was requested; preserve the current visible shape while correcting timezone semantics.
- III: Question: Are Guides DB range filters required for external guides too?
  - Status: answered
  - Answer: No. They apply only to Guides DB own/admin lists.
- IV: Question: Should users choose a display timezone?
  - Status: answered
  - Answer: No. `America/Mexico_City` is canonical configuration, not a user preference.
- V: Question: Should the Guides DB UI permit an open-ended range with only a start date or only an end date?
  - Status: pending
  - Context: The backend accepts either boundary independently, while the confirmed end-date behavior only defines how to include a selected end calendar day.
  - Explanation: Product behavior must decide whether to expose backend open-ended filtering or require both dates in the UI.

### Testing

- I: Question: Which instant proves the required UTC-to-business-timezone boundary?
  - Status: answered
  - Answer: `2026-02-01T06:00:00.000Z` must display as February 1 at local midnight in Mexico City.
- II: Question: Which named-zone DST case should guard against fixed-offset conversion?
  - Status: answered
  - Answer: Use a historical `America/Mexico_City` transition, with the 2021 spring transition as the representative regression unless implementation discovers an ICU compatibility issue.

## Assumptions

- Backend timestamp strings follow the handoff and include `Z` as UTC ISO 8601 instants.
- Guides DB backend endpoints accept complete ISO instant strings as independent range boundaries when month and year are omitted.
- Frontend range mode omits both month and year rather than relying on the backend's silent precedence rule.
- Existing visible Spanish date shapes remain product-approved.
- The browser bundle has full IANA timezone data through its `Intl` implementation; Luxon uses that platform support.
- Range inputs use calendar-date values rather than user-entered time-of-day values.
- Future balance request history and admin queue work will consume the shared timezone contract but remains owned by Stories 3 and 4.
- No source, test, dependency, or deployment configuration changes are part of this research phase.

## Non-Obvious Findings

- All currently rendered timestamps share one formatter, so canonical display timezone behavior can be fixed centrally rather than component by component.
- `new Date(utcString)` identifies the correct instant; the defect is the subsequent use of browser-local getters, not the initial parsing of valid `Z` strings.
- External PKK `startDate` is typed as `Date` even though JSON transport cannot preserve a JavaScript `Date`; this weakens the raw-string contract.
- Guides DB already sends correct month/year value shapes, but its default selection uses the wrong calendar near timezone boundaries.
- Native `Intl` is sufficient for display but does not directly construct an instant from a named-zone calendar date; this is why Luxon is allowed specifically for range boundaries.
- Adding 24 elapsed hours to produce an exclusive end can be wrong across DST. The operation must add one calendar day in the named zone.
- Mexico City no longer observes seasonal DST in current rules, but historical named-zone data still provides a valid regression against fixed UTC-06:00 assumptions.
- The backend accepts contradictory filters but silently chooses month/year mode, so frontend filter modes must be mutually exclusive in transport even though the API does not enforce that contract.
- Backend range fields are independently optional and reversed ranges are not errors; frontend UX constraints cannot be inferred from backend validation.
- Backend DTO format validation does not guarantee a valid calendar instant, and the resulting plain parsing error can bypass the structured exception envelope.
