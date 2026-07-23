# Review And Cancel Own Balance Requests Story Research

## Story Definition

### Story Title

Review and cancel own balance-addition requests.

### Story Description

Give an authenticated user a paginated, month/year-filterable list of their own balance-addition requests from `GET /balance/requests`, showing amount, Spanish status, creation date, and decision date when supplied, and let the user cancel a request through `PATCH /balance/requests/{balance-id}/cancel` while it is still `pending`.

This document researches Story 3 from `ai-research/add-balance.epic.md`. Story 1 (display current balance) and Story 2 (create a balance request) are complete. Story 6 (business-timezone configuration) is also complete, so the shared date-display and business-calendar primitives this story depends on already exist in `src/shared/utils/date.utils.ts`. Story 2 already invalidates the `['balance', 'requests']` query prefix on create; this story mounts the compatible history query that consumes that seam.

### Scope Classification

Single-feature story covering the Balance feature, its Next route handlers, shared balance types/utilities/constants, and focused tests.

### Research Mode

Full research, prioritizing the list/cancel contract, cache/invalidation behavior, and timezone-correct timestamp display through the delivered shared helpers.

### User-Confirmed Decisions

- The own-requests list exposes a month/year filter UI plus pagination, mirroring `Order.tsx`: default to the current Mexico City month/year via `getBusinessCalendarMonthYear()`, then page/limit pagination. This uses the backend's optional `month`/`year` queries.
- Cancellation is available only while a request is `pending` and requires an explicit confirmation before the mutation.
- Timestamp display and month/year defaults use the delivered `America/Mexico_City` primitives, never browser-local time or a fixed UTC offset.
- Rejection reasons are not shown; the documented list response does not return them.
- Approved payment references are shown when present on an approved request.

### Acceptance Criteria

1. An authenticated user sees only their own requests with amount (zero-safe MXN), Spanish status label, creation date, and decision date when supplied, retrieved through an authenticated Next route handler that proxies `GET /balance/requests`.
2. The list supports backend pagination (`page`, `limit`, `total`, `totalPages`) and an optional month/year filter defaulting to the current `America/Mexico_City` calendar month/year; all server-affecting values are represented in the TanStack Query key.
3. A cancellation action appears only while a request status is `pending`, requires confirmation before the mutation, and posts no body to `PATCH /balance/requests/{balance-id}/cancel`.
4. Successful cancellation reflects `cancelled` from authoritative backend data via query invalidation; a failed or conflicting cancellation preserves the prior authoritative state and shows an error without optimistically mutating the list or current balance.
5. Loading, empty, error, and populated states work on desktop and mobile/tablet, and all rendered timestamps display in `America/Mexico_City` independent of browser timezone.

### Task Breakdown

1. Add own-request list/pagination and cancel DTOs to `src/shared/types/balance.types.ts` and Spanish status-label constants to a balance constants module.
2. Add a `GET /api/balance/requests` list route and a `PATCH /api/balance/requests/{requestId}/cancel` route, both authenticated, allowlisting only `month`, `year`, `page`, `limit`, URL-encoding the request ID, and preserving meaningful upstream statuses/bodies.
3. Add browser callbacks: a list callback serializing only the allowed queries and a cancel callback posting no body.
4. Add a responsive Balance-domain history surface: month/year + pagination controls, request cards/rows, status labels, a confirmation dialog for cancellation, and the loading/empty/error/populated states.
5. Wire a `useQuery` keyed on `['balance', 'requests', month, year, page, limit]` and a cancel `useMutation` that invalidates `['balance', 'requests']` on success without touching `['balance']`.
6. Add focused route and feature coverage for query serialization, pagination, timezone-correct timestamp display, cancel eligibility, confirmation, success invalidation, and conflict handling.

### Out Of Scope

- Admin queue, approval, rejection, payment-reference entry, admin single-request lookup, and email deep links (Stories 4 and 5).
- Increasing or optimistically changing the displayed current balance after cancellation.
- Showing rejection reasons in the user's history (not returned by the documented contract).
- Status filtering for the user list (the documented user query DTO has no status parameter).
- Backend timezone/month-boundary implementation (owned by the backend; frontend consumes UTC strings).
- New dependencies, a state store, a service layer, or a query-key factory.
- Final visual placement; the design phase resolves the exact surface while this research fixes functional/responsive states.
- Normalizing unrelated API route response/error shapes.

## Technical Research

### Current State

- Story 1: `src/features/Balance/BalanceDisplay.tsx` owns `useQuery({ queryKey: ['balance'] })` and renders loading/error/zero/positive states.
- Story 2: `src/features/Balance/BalanceRequestDialog.tsx` creates a request and already calls `queryClient.invalidateQueries({ queryKey: ['balance', 'requests'] })` on success. No history query exists yet, so that invalidation currently has no consumer.
- Story 6 (complete): `src/shared/utils/date.utils.ts` exports `formatDateToSpanish(timestamp)`, `getBusinessCalendarMonthYear(instant?)`, and `toBusinessDateRange(...)`, all pinned to `BUSINESS_TIMEZONE`. `NEXT_PUBLIC_BUSINESS_TIMEZONE=America/Mexico_City` is enforced at Next config load, and `jest.config.ts` sets it for tests.
- `src/shared/types/balance.types.ts` already defines `BalanceRequestDto` (`id`, `amount`, `paymentReference?`, `status`, `decisionReason`, `decisionAt`, `createdAt`, `updatedAt`) and `BalanceRequestStatus` (`pending | approved | rejected | cancelled`). No list-response, list-params, or cancel DTOs exist yet.
- `src/app/api/balance/route.ts` exports `GET` (current balance) and `POST` (create request → `/balance/requests`). It preserves upstream status/body and returns local `400` for a missing token. There is no list or cancel route.
- `src/shared/utils/balance.utils.ts` exposes `getBalanceCb()`, `createBalanceRequestCb()`, and the zero-safe `formatBalanceMxn()`. No list or cancel callback exists.
- `BALANCE_API_ENDPOINT = "/api/balance"` is the only balance frontend endpoint constant. There is no balance constants module for status labels or messages yet.
- `src/features/Dashboard/subscreens/Order.tsx` is the closest active precedent for month/year + pagination + query-key identity + card list + responsive filter row, and it already consumes `getBusinessCalendarMonthYear()`.
- `QueryProviderWrapper` provides a per-mounted-provider `QueryClient` with a 60-second default `staleTime`; keep it unchanged.

### Affected Areas

Routes/pages:

- No new App Router page is required. `src/app/dashboard/page.tsx` remains the authenticated boundary; the deep-link route belongs to Story 5.
- Final placement (dashboard screen, section near `BalanceDisplay`, or modal) is a design decision. Functionally this story needs one responsive Balance-domain surface with an entry point on both desktop and mobile/tablet shells. If a new dashboard screen is chosen, note `DashboardScreens` in `src/shared/types/dashboard.types.ts` currently allows only `quotes | overview | marginProfit | addresses`, and both `src/shared/ui/organisms/Aside.tsx` and the mobile drawer would need paired navigation entries to avoid a one-sided role/nav change.

API route handlers:

- Add `src/app/api/balance/requests/route.ts` with `GET` → `${BACKEND_URI}/balance/requests`, forwarding an explicit allowlist of `month`, `year`, `page`, `limit` and the bearer token, following the completed Balance GET behavior (preserve upstream status/body; local `400` for a missing token).
- Add `src/app/api/balance/requests/[requestId]/cancel/route.ts` with `PATCH` → `${BACKEND_URI}/balance/requests/{requestId}/cancel`, no request body, URL-encoding `requestId` like `src/app/api/guides-db/[kraftId]/route.ts`.
- Preserve meaningful upstream statuses (epic Open Question VII answered "yes"): a `409`-style conflict when a request is no longer `pending`, `401`/`403` authorization, and `404` for an unknown ID must not be flattened to `400`.

Feature UI:

- New history UI belongs in `src/features/Balance/`.
- Reuse `formatBalanceMxn()` for amounts and `formatDateToSpanish()` for `createdAt`/`decisionAt`.
- Reuse Flowbite modal patterns (as in `BalanceRequestDialog`) for the cancellation confirmation.
- Reuse the `Order.tsx` month/year `Select` + pagination `Button` pattern; do not introduce a new list abstraction.

Shared code:

- Add list-params, list-response, and cancel DTOs beside the existing request DTOs in `src/shared/types/balance.types.ts`.
- Add the list and cancel browser callbacks beside `createBalanceRequestCb()` in `src/shared/utils/balance.utils.ts`.
- Add Spanish status labels and list copy in a balance constants module (new `src/shared/constants/balance.constants.ts` or the existing global constants file); this mirrors `guides.constants.ts` housing Guides DB copy.

Tests:

- Extend `__tests__/api/balance.route.test.ts` or add `__tests__/api/balance.requests.route.test.ts` for list query allowlisting, cancel URL encoding, missing token, upstream conflict/auth status preservation, and transport failure.
- Add focused history/cancel coverage under `__tests__/feature/Balance/`, following the fresh retry-disabled QueryClient + real callback pattern in `BalanceDisplay.test.tsx` and `BalanceRequestDialog.test.tsx`.

### Existing Patterns To Follow

App Router server/client split:

- Keep token and `BACKEND_URI` access in the route handlers; keep list state, filters, mutation, and invalidation in client components.
- Do not read the httpOnly session cookie from Balance UI or call the backend directly from the browser.

TanStack Query:

- Use the existing provider; do not add another `QueryClient` or move it to module scope.
- Key the history query on `['balance', 'requests', month, year, page, limit]` so it is compatible with Story 2's `['balance', 'requests']` prefix invalidation.
- Reset `page` to 1 when month or year changes, matching `Order.tsx`.
- On successful cancel, invalidate `['balance', 'requests']` by prefix. Do not invalidate or optimistically change `['balance']`: cancelling never changes funds.
- Avoid optimistic list edits; reflect authoritative `cancelled` state from a refetch.

Timezone display (delivered by Story 6):

- Import `formatDateToSpanish` and `getBusinessCalendarMonthYear` from `@/shared/utils/date.utils`.
- Pass raw backend UTC ISO strings directly to `formatDateToSpanish`; keep DTO/state timestamps as raw strings.
- Derive default month/year from `getBusinessCalendarMonthYear()`; derive the year-option list from that business year, as `Order.tsx` does.
- A `null` `decisionAt` renders no decision date; do not pass `null`/offsetless values expecting a formatted result (the helper returns a `--` placeholder for non-instant input).

Forms, Flowbite, Tailwind, accessibility:

- Use existing Flowbite `Select`, `Button`, and `Modal` components; preserve Geist font, dark mode, neutral surfaces, and responsive dashboard behavior from `DESIGN.md`.
- Give month/year selects visible Spanish labels; expose loading/error/empty and confirmation copy through accessible status/alert semantics.
- Keep the confirm action disabled during the pending cancel mutation, matching `BalanceRequestDialog`.

Route-handler proxy style:

- Explicitly allowlist forwarded query parameters; drop unrelated browser-supplied keys.
- URL-encode the dynamic request ID before constructing the upstream URL.
- Preserve upstream success envelope and status; return a compact local `500` only when no upstream HTTP response is available.
- Do not alter the existing `GET`/`POST` behavior in `src/app/api/balance/route.ts`.

### Backend Contract

Own request list (confirmed in the epic):

- Method/path: `GET /balance/requests`.
- Optional queries: integer `month` (1-12), integer `year` (>= 1), positive integer `page` (default 1), positive integer `limit` (default 10). No status query is documented for the user list.
- Response (confirmed, Open Question I): `data.requests` array plus sibling `data.total`, `data.page`, `data.limit`, `data.totalPages`, all under the standard `{ version, data, message, error }` envelope.
- Each request carries `id`, `amount`, `status`, `createdAt`, `updatedAt`, and conditional `paymentReference`, `decisionReason`, `decisionAt` (and, for admin responses, `userEmail`/`userName`/`adminInCharge`). Timestamps are UTC ISO 8601 strings.
- Backend month/year boundaries use `America/Mexico_City` local-month start (inclusive) and next-month start (exclusive) via Luxon; timestamps remain UTC (epic Questions IX/X answered).

Cancel (confirmed in the epic):

- Method/path: `PATCH /balance/requests/{balance-id}/cancel`, no request body.
- Allowed only while status is `pending`; other statuses are read-only.
- Success (confirmed, Open Question II): `200 OK` with the single request under `data.request` (status `cancelled`, `decisionReason`/`decisionAt` null), distinct from the list's `data.requests` array.
- Non-`pending` conflict: `409 Conflict` with `error.code = "BAL-BUS-002"` and the Spanish message "La solicitud de saldo no se encuentra en un estado válido para esta operación."; the BFF preserves this status/body verbatim.

Amount contract (unchanged from Story 2): MXN major units; effective range `0.01`-`100000.00`; zero renders as `$0.00` via `formatBalanceMxn()`.

Status labels (from the epic):

- `pending` → `Pendiente`
- `approved` → `Aprobada`
- `rejected` → `Rechazada`
- `cancelled` → `Cancelada`

### Data And Cache Behavior

- Creating (Story 2) and cancelling both affect own request history but never change current balance; only backend approval (Story 4) changes `['balance']`.
- The history query and current-balance query are distinct server state and must stay independent (one may load/fail while the other succeeds).
- Cancel invalidates `['balance', 'requests']` by prefix so any mounted history page refetches authoritative state; it must not invalidate `['balance']`.
- A request may transition (approved/rejected by an admin, or cancelled in another tab) between list render and cancel submission; the UI must show the backend's authoritative status rather than assume the requested transition succeeded.
- User-sensitive query data stays isolated by the existing per-mounted-provider `QueryClient`.

### UX States And Copy

- Loading: show a non-blocking loading indicator; do not block the independent balance display or dashboard navigation.
- Empty: show a mode-aware Spanish empty message for the selected month/year (e.g. "No tienes solicitudes de saldo para el periodo seleccionado.").
- Error: show a stable Spanish error state without fabricating list rows.
- Populated: show amount (zero-safe MXN), Spanish status label, creation date, decision date when `decisionAt` is present, and payment reference when present on an approved request.
- Cancel eligibility: render the cancel action only for `pending` requests.
- Cancel confirmation: require an explicit confirm step (Flowbite modal) before mutating; disable confirm while pending.
- Cancel success: reflect `cancelled` from authoritative refetch; keep the surface open.
- Cancel conflict/failure: preserve the prior authoritative state and show a Spanish error; do not present the request as cancelled.

### Edge Cases And Constraints

- All rendered timestamps must use `America/Mexico_City`; a UTC instant such as `2026-02-01T05:59:59.999Z` belongs to January and `2026-02-01T06:00:00.000Z` to February in the business zone.
- `decisionAt` is `null` for `pending` requests; render no decision date rather than a placeholder where a value is absent.
- The documented user list has no status query; do not add client-side status filtering that implies a full-record filter across pages.
- Month/year filtering happens on the backend across the full result set; the frontend must not filter only the current page.
- A stale list can offer cancel on a request the backend already transitioned; tolerate the conflict by surfacing authoritative status.
- Session cookies are httpOnly; all authenticated browser traffic goes through the BFF.
- Balance uses `BACKEND_URI`; the external `product-sat` URI is unrelated.
- Tests always collect coverage, including focused runs.

### Dependencies And Integration Points

- No new frontend dependency is required. `axios`, TanStack Query, Flowbite, Tailwind, and the delivered Luxon-based `date.utils.ts` are sufficient.
- No `package.json` / `pnpm-lock.yaml` change is expected.
- `NEXT_PUBLIC_BUSINESS_TIMEZONE=America/Mexico_City` is already required and enforced by Story 6; this story consumes it through `date.utils.ts`.
- `BACKEND_URI` remains the only relevant upstream env var for this story.
- Story 2's create invalidation and this story's history query must share the `['balance', 'requests']` prefix to interoperate.
- Final UI work must consult `DESIGN.md` and preserve both desktop and mobile/tablet shells.

### Testing Rules To Follow

From `.github/copilot-instructions.md`:

- Use `userEvent`, not `fireEvent`; render real internal Balance components rather than mocking them.
- Mock only network callbacks or unavailable browser APIs; use relative paths in `jest.mock()`.
- Use a fresh QueryClient with retries disabled for query-driven feature tests.
- Do not assert CSS classes, colors, or layout; query by role, accessible name, label, or visible text.
- Use explicit balance DTO fixtures; do not use `any`/`unknown`; match mock data to the unwrapped callback shape.
- Keep the real `date.utils.ts` helpers active; do not mock `Intl`, Luxon, or the timezone constant. Assert timezone-correct visible dates.
- Preserve existing skipped tests.

Smallest useful route coverage:

- Authenticated list forwards only allowlisted `month`/`year`/`page`/`limit` with the bearer header; unrelated keys are dropped.
- Cancel forwards the URL-encoded ID to `/balance/requests/{id}/cancel` with no body and the bearer header.
- Missing token prevents the upstream call.
- Upstream conflict/auth/not-found statuses and bodies are preserved (not flattened to `400`).
- A transport failure returns the local server-error response.
- Existing balance GET/POST tests remain unchanged and passing.

Smallest useful feature coverage:

- Default filter derives the Mexico City month/year from a fixed system instant whose browser-local month could differ.
- Populated list renders amount, Spanish status, and timezone-correct creation/decision dates.
- Payment reference shows only when present on an approved request; rejection reason is never shown.
- Cancel action appears only for `pending` rows; confirmation is required before the callback runs.
- Successful cancel invalidates `['balance', 'requests']` and reflects `cancelled`; it does not change `['balance']`.
- A cancel conflict preserves prior state and shows an error without a false cancelled state.
- Empty, error, and pagination interactions behave and reset page on month/year change.

## Open Questions

### Backend Contract

I: Question: What is the exact success envelope and nesting for `GET /balance/requests`?

Status: answered

Answer: Pagination fields sit directly under `data` alongside `requests`, under the standard envelope:

```
{
  version: string,
  data: {
    requests: BalanceRequestDto[],
    total: number,
    page: number,
    limit: number,
    totalPages: number
  },
  message: string | null,
  error: string | object | null
}
```

Each request item always carries `id`, `amount`, `status`, `createdAt`, `updatedAt`; `paymentReference`, `decisionReason`, and `decisionAt` are optional and present based on request state. Status enum is `'pending' | 'approved' | 'rejected' | 'cancelled'`. The callback unwraps `data.requests` plus the sibling pagination fields. (This is the user endpoint; the admin endpoint `GET /balance/requests/admin` returns the same shape plus `userEmail`/`userName` per item and optional `adminInCharge` — admin is Stories 4/5, out of scope here.)

II: Question: What status and body does `PATCH /balance/requests/{balance-id}/cancel` return on success and on a non-`pending` conflict?

Status: answered

Answer: Success returns `200 OK` with a `BalanceRequestResponseDto` — the single request nested under `data.request` (not `data.requests`), matching the create/single-request shape:

```
{
  version: string,
  data: { request: { id, amount, paymentReference?, status: "cancelled", decisionReason: null, decisionAt: null, createdAt, updatedAt } },
  message: null,
  error: null
}
```

A non-`pending` cancel (approved, rejected, or already cancelled) returns `409 Conflict` with a KraftError:

```
{
  version: string,
  data: null,
  message: null,
  error: { code: "BAL-BUS-002", message: "La solicitud de saldo no se encuentra en un estado válido para esta operación.", technicalDetails: null }
}
```

The BFF must preserve the `409` status and this error body verbatim so the UI can surface the authoritative state rather than a false `cancelled`. Note the success payload nests the single request under `data.request`, distinct from the list's `data.requests` array.

III: Question: Which query parameters does `GET /balance/requests` accept?

Status: answered

Answer: Optional integer `month` (1-12), optional integer `year` (>= 1), optional positive integer `page` (default 1), optional positive integer `limit` (default 10). No status query is documented. (Epic Open Question III.)

### UI And Product Decisions

I: Question: Should the user list expose a month/year filter or paginate only?

Status: answered

Answer: Expose a month/year filter plus pagination, defaulting to the current `America/Mexico_City` month/year via `getBusinessCalendarMonthYear()`, mirroring `Order.tsx`. (User-confirmed for this story.)

II: Question: Should cancellation require a confirmation dialog?

Status: answered

Answer: Yes. Cancellation requires confirmation before the mutation. (Epic UI Open Question III.)

III: Question: Should users see rejection reasons or approved payment references?

Status: answered

Answer: Do not show rejection reasons (not returned by the documented contract). Show the payment reference when present on an approved request. (Epic UI Open Questions IV and V.)

IV: Question: Where does the request-history surface live?

Status: pending

Context: The epic defers visual placement to the design phase. Functionally this story needs one responsive Balance surface with an entry point on both desktop and mobile/tablet; the choice between a new dashboard screen, a section near `BalanceDisplay`, or a modal is a design decision, but it determines whether `DashboardScreens` and the two navigation shells change.

### Authorization

I: Question: How is list/cancel access authorized?

Status: answered

Answer: The browser calls the local Next BFF, which reads the httpOnly session token and forwards it as a bearer token. The backend enforces that a user lists and cancels only their own requests. (Epic Authorization and Security.)

## Assumptions

- `GET /balance/requests` and `PATCH /balance/requests/{id}/cancel` are served from `BACKEND_URI` and accept the existing bearer token.
- The list response wraps `requests` plus pagination siblings under `data` in the standard `{ version, data, message, error }` envelope (confirmed). The cancel success response nests the single request under `data.request` instead.
- Timestamps are UTC ISO 8601 strings and are rendered through `formatDateToSpanish` without mutating stored values.
- Cancelling never changes current balance; only backend approval does.
- The history query adopts `['balance', 'requests', month, year, page, limit]`, keeping Story 2's `['balance', 'requests']` invalidation seam effective.
- Final responsive placement is resolved during design without changing the behavioral acceptance criteria.

## Non-Obvious Findings

- Story 2 already fires `['balance', 'requests']` invalidation on create with no consumer; this story's history query is the first consumer, so the prefix must match exactly for creates to refresh the list.
- The frontend timezone dependency for this story is already satisfied: `date.utils.ts` (`formatDateToSpanish`, `getBusinessCalendarMonthYear`) is delivered and enforced at Next config load, so no new date/timezone plumbing is needed here.
- `Order.tsx` is a near-complete template for this story's month/year + pagination + query-key identity; the main differences are the balance list/cancel contract and the confirmation dialog.
- Cancellation must reflect authoritative `cancelled` state via refetch rather than optimistic edits, because a request can transition between list render and submission and because financial state must come from the backend.
- The user list has no status query, so a status filter cannot be implemented correctly from the paginated response; only pagination and month/year filtering are supported for this delivery.
- The list and cancel responses nest differently: the list unwraps `data.requests` (array + pagination siblings) while cancel success unwraps `data.request` (a single object). The two callbacks must not share an unwrap path.
- The non-`pending` cancel conflict is a stable `409` with error code `BAL-BUS-002`; the BFF must preserve it (not flatten to `400`) so the UI can detect the stale-cancel case by status/code and surface authoritative state.
