# Implementation Plan: Review And Cancel Own Balance Requests

**Source research:** `ai-research/balance-addition/review-cancel-own-requests.story-3.md`
**Research sign-off:** Complete; every recorded Open Question is answered. Open Question UI-IV is answered with the entry point decided (a new "Saldo" sidebar/drawer screen) and only the screen's internal visual layout deferred to design.
**Sign-off confirmation date:** 2026-07-23
**Planning date:** 2026-07-23

## Assumptions

- `GET /balance/requests` and `PATCH /balance/requests/{id}/cancel` are served from `BACKEND_URI` and accept the existing bearer token, following the Story 1/2 Balance proxy.
- The list envelope nests `requests` plus sibling pagination fields (`total`, `page`, `limit`, `totalPages`) under `data`; the list callback unwraps `data` (array + pagination). Cancel success nests a single request under `data.request`; the cancel callback unwraps `data.request`. The two callbacks do not share an unwrap path.
- The cancel success body is structurally identical to Story 2's create success (`data.request`), and the non-`pending` conflict body is a `409` KraftError with `error.code = "BAL-BUS-002"`. The BFF preserves upstream status and body verbatim (the Story 1/2 Balance-route pattern), never flattening to `400` like the guides-db routes.
- Timestamps are UTC ISO 8601 strings and render through `formatDateToSpanish` without mutating stored values; default month/year comes from `getBusinessCalendarMonthYear()`.
- Cancelling never changes current balance. On successful cancel we invalidate `['balance', 'requests']` only; we never touch `['balance']`.
- The history query key is `['balance', 'requests', month, year, page, limit]`, keeping Story 2's `['balance', 'requests']` prefix-invalidation seam effective.
- Current balance already renders persistently via `BalanceDisplay` (desktop aside + mobile header region). The new Saldo screen therefore focuses on the requests history and does not mount a second `['balance']` query. See Open Questions.
- The Saldo nav entry is visible to all authenticated users (not admin-gated), matching the user list being self-scoped by the backend.
- Existing local missing-token behavior remains `400` with `{ message: 'missing access token' }`.

## Acceptance Criteria

1. An authenticated user sees only their own requests with amount (zero-safe MXN), Spanish status label, creation date, and decision date when supplied, retrieved through an authenticated Next route handler that proxies `GET /balance/requests`.
2. The list supports backend pagination (`page`, `limit`, `total`, `totalPages`) and an optional month/year filter defaulting to the current `America/Mexico_City` calendar month/year; all server-affecting values are represented in the TanStack Query key.
3. A cancellation action appears only while a request status is `pending`, requires confirmation before the mutation, and posts no body to `PATCH /balance/requests/{balance-id}/cancel`.
4. Successful cancellation reflects `cancelled` from authoritative backend data via query invalidation; a failed or conflicting cancellation preserves the prior authoritative state and shows an error without optimistically mutating the list or current balance.
5. Loading, empty, error, and populated states work on desktop and mobile/tablet, and all rendered timestamps display in `America/Mexico_City` independent of browser timezone.

## Delivery Sequence

1. **Phase 1 — Shared contract:** list/cancel DTOs, endpoint + status-label/copy constants, and the two browser callbacks. Type-check only.
2. **Phase 2 — BFF routes:** authenticated list route and dynamic cancel route with status-preserving proxying, plus focused route tests.
3. **Phase 3 — Feature surface:** the Balance history screen (query, filters, pagination, request rows, cancel confirmation + mutation) and focused feature tests.
4. **Phase 4 — Dashboard wiring:** new `balance` screen value, paired sidebar/drawer nav entries, render in both responsive branches, and final full verification.

Phase 2 depends on Phase 1's callback/DTO/constant contracts. Phase 3 depends on Phases 1–2. Phase 4 depends on Phase 3. Each phase has focused automated checks; the completed feature receives lint, type, and production-build verification at the end of Phase 4.

## Affected Files

### `src/app/api/**`

- Create `src/app/api/balance/requests/route.ts` (`GET`).
- Create `src/app/api/balance/requests/[requestId]/cancel/route.ts` (`PATCH`).

### `src/features/**`

- Create `src/features/Balance/BalanceRequestsScreen.tsx`.
- Create `src/features/Balance/BalanceRequestCard.tsx`.
- Modify `src/features/Dashboard/Dashboard.tsx`.

### `src/shared/**`

- Modify `src/shared/types/balance.types.ts`.
- Modify `src/shared/utils/balance.utils.ts`.
- Modify `src/shared/constants/global.constants.ts` (add list endpoint constant).
- Create `src/shared/constants/balance.constants.ts`.
- Modify `src/shared/types/dashboard.types.ts`.
- Modify `src/shared/ui/organisms/Aside.tsx`.
- Modify `src/shared/ui/organisms/HeaderMenuDrawer.tsx`.

### `__tests__/**`

- Create `__tests__/api/balance.requests.route.test.ts`.
- Create `__tests__/feature/Balance/BalanceRequestsScreen.test.tsx`.

### Deliberately Unchanged

- `src/app/api/balance/route.ts`: Story 1/2 `GET`/`POST` behavior stays as-is; the new list/cancel handlers live under `balance/requests/`.
- `src/features/Balance/BalanceDisplay.tsx` and `BalanceRequestDialog.tsx`: current-balance display and create flow are untouched; the create dialog already invalidates the shared prefix.
- `src/features/QueryProviderWrapper.tsx`: reuse the per-provider `QueryClient`; do not add or move a client.
- `__tests__/api/balance.route.test.ts` and existing Balance feature tests: no changes.
- `src/app/dashboard/page.tsx`, `DESIGN.md`, dependencies, lockfile, env vars, and backend code.

## Phase 1: Shared Contract (Types, Constants, Callbacks)

### Changes Required

#### `src/shared/types/balance.types.ts`

**Action:** Modify — add after the existing request DTOs. Reuse `BalanceRequestDto`, `BalanceRequestStatus`, and `CreateBalanceRequestErrorResponse` (its `BalanceDomainError` variant already models the `409` `BAL-BUS-002` body).

```ts
export interface BalanceRequestListParams {
  month?: number
  year?: number
  page?: number
  limit?: number
}

export interface BalanceRequestListData {
  requests: BalanceRequestDto[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface GetBalanceRequestsResponse {
  version: string
  data: BalanceRequestListData
  message: null
  error: null
}

// Cancel success mirrors the create/single-request shape (data.request).
export interface CancelBalanceRequestResponse {
  version: string
  data: { request: BalanceRequestDto }
  message: null
  error: null
}
```

- Do not add a status query field; the documented user list has no status parameter.

#### `src/shared/constants/global.constants.ts`

**Action:** Modify — add beside `BALANCE_API_ENDPOINT`.

```ts
export const BALANCE_REQUESTS_API_ENDPOINT = "/api/balance/requests";
```

#### `src/shared/constants/balance.constants.ts`

**Action:** Create — Spanish status labels and list/cancel copy. No new abstraction beyond string/label constants.

```ts
import { BalanceRequestStatus } from "@/shared/types/balance.types";

export const BALANCE_STATUS_LABELS: Record<BalanceRequestStatus, string> = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada',
  cancelled: 'Cancelada',
};

export const BALANCE_REQUESTS_HEADING = 'Solicitudes de saldo';
export const BALANCE_REQUESTS_EMPTY_MESSAGE =
  'No tienes solicitudes de saldo para el periodo seleccionado.';
export const BALANCE_REQUESTS_ERROR_MESSAGE =
  'No pudimos cargar tus solicitudes de saldo. Intenta más tarde.';
export const BALANCE_REQUESTS_LOADING_MESSAGE = 'Cargando solicitudes...';

export const BALANCE_CANCEL_CONFIRM_TITLE = 'Cancelar solicitud de saldo';
export const BALANCE_CANCEL_CONFIRM_BODY =
  '¿Seguro que quieres cancelar esta solicitud de saldo? Esta acción no se puede deshacer.';
export const BALANCE_CANCEL_CONFIRM_ACTION = 'Sí, cancelar';
export const BALANCE_CANCEL_DISMISS_ACTION = 'No, volver';
export const BALANCE_CANCEL_ERROR_MESSAGE =
  'No pudimos cancelar la solicitud. Es posible que ya haya cambiado de estado. Actualiza e inténtalo de nuevo.';
```

- The month option list (`Enero`…`Diciembre`) is defined locally in the screen mirroring `Order.tsx`; do not introduce a shared `MONTHS` constant.

#### `src/shared/utils/balance.utils.ts`

**Action:** Modify — add two callbacks; keep `formatBalanceMxn` and existing callbacks unchanged.

```ts
export const getBalanceRequestsCb = async (
  params: BalanceRequestListParams
): Promise<BalanceRequestListData> => {
  const query: BalanceRequestListParams = {}
  if (params.month !== undefined) query.month = params.month
  if (params.year !== undefined) query.year = params.year
  if (params.page !== undefined) query.page = params.page
  if (params.limit !== undefined) query.limit = params.limit

  const response: AxiosResponse<GetBalanceRequestsResponse> = await axios.get(
    BALANCE_REQUESTS_API_ENDPOINT,
    { params: query }
  )
  return response.data.data
}

export const cancelBalanceRequestCb = async (
  requestId: string
): Promise<BalanceRequestDto> => {
  const response: AxiosResponse<CancelBalanceRequestResponse> = await axios.patch(
    `${BALANCE_REQUESTS_API_ENDPOINT}/${encodeURIComponent(requestId)}/cancel`
  )
  return response.data.data.request
}
```

- The list callback serializes only the four allowed keys, so undefined filters are dropped from the querystring.
- The cancel callback sends no request body.

### Success Criteria

- **Automated:** `pnpm exec tsc --noEmit`.
- **Manual:** none.

### Test Coverage

Covered indirectly by Phases 2–3; no dedicated test file for pure types/constants.

## Phase 2: Authenticated BFF Routes

### Changes Required

#### `src/app/api/balance/requests/route.ts`

**Action:** Create — `GET`, following the status-preserving pattern in `src/app/api/balance/route.ts` (preserve `error.response.data` + `error.response.status`; local `500` only when no upstream response).

- Signature: `export async function GET(request: NextRequest): Promise<NextResponse>`.
- Read `getAccessToken()`; return local `400 { message: 'missing access token' }` when absent (before any upstream call).
- Allowlist forwarded params from `request.nextUrl.searchParams`: only `month`, `year`, `page`, `limit`. Drop any other browser-supplied key.

```ts
const allowed = ['month', 'year', 'page', 'limit'] as const
const forwarded: Record<string, string> = {}
for (const key of allowed) {
  const value = request.nextUrl.searchParams.get(key)
  if (value !== null) forwarded[key] = value
}

const response: AxiosResponse<GetBalanceRequestsResponse> = await axios.get(
  `${process.env.BACKEND_URI}/balance/requests`,
  { headers: { Authorization: `Bearer ${accessToken}` }, params: forwarded }
)
return NextResponse.json(response.data, { status: response.status })
```

- `catch`: if `axios.isAxiosError(error) && error.response`, return `NextResponse.json(error.response.data, { status: error.response.status })`; else `NextResponse.json({ message: 'Failed to fetch balance requests' }, { status: 500 })`.

#### `src/app/api/balance/requests/[requestId]/cancel/route.ts`

**Action:** Create — `PATCH`, no request body. Mirror the dynamic-param + `encodeURIComponent` shape of `src/app/api/guides-db/[kraftId]/route.ts` but keep the **status-preserving** error handling from the Balance route (do **not** flatten to `400`).

- Signature: `export async function PATCH(_request: NextRequest, context: { params: { requestId: string } }): Promise<NextResponse>`.
- Missing token → local `400`. Missing `requestId` → local `400 { message: 'missing requestId' }`.

```ts
const requestId = context?.params?.requestId
const uri = `${process.env.BACKEND_URI}/balance/requests/${encodeURIComponent(requestId)}/cancel`
const response: AxiosResponse<CancelBalanceRequestResponse> = await axios.patch(
  uri,
  undefined,
  { headers: { Authorization: `Bearer ${accessToken}` } }
)
return NextResponse.json(response.data, { status: response.status })
```

- `catch`: preserve `error.response.data` + `error.response.status` (critical for the `409` `BAL-BUS-002` conflict and `401`/`403`/`404`); fallback local `500 { message: 'Failed to cancel balance request' }`.

**Edge cases:** httpOnly session token is read server-side via `getAccessToken()`; the browser never calls the backend directly. The `409` conflict body must survive verbatim so the UI can detect the stale-cancel case.

### Success Criteria

- **Automated:** `pnpm test -- __tests__/api/balance.requests.route.test.ts`.
- **Manual:** none.

### Test Coverage

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `src/app/api/balance/requests/route.ts` | list forwards only allowlisted `month`/`year`/`page`/`limit` with bearer header; unrelated keys dropped; missing token skips upstream; upstream `401`/`404` status+body preserved; transport failure → local `500` | Mock/`NextResponse` pattern from `__tests__/api/balance.route.test.ts`; build `NextRequest`-like object exposing `nextUrl.searchParams` |
| `src/app/api/balance/requests/[requestId]/cancel/route.ts` | cancel PATCHes URL-encoded id to `/balance/requests/{id}/cancel` with no body + bearer; missing token skips upstream; `409` `BAL-BUS-002` status+body preserved (not `400`); transport failure → local `500` | Same mock/`getAccessToken` mock pattern; assert `axios.patch` called with `undefined` body and encoded id |

- Use a request id containing a character needing encoding (e.g. a value with `/` or space) to prove `encodeURIComponent`.
- Assert unrelated keys (e.g. `status`, `userId`) are not forwarded.

## Phase 3: Balance History Screen And Cancellation

### Changes Required

#### `src/features/Balance/BalanceRequestCard.tsx`

**Action:** Create — presentational row for one request. Props: `{ request: BalanceRequestDto; onRequestCancel: (request: BalanceRequestDto) => void; isCancelling: boolean }`.

- Render amount via `formatBalanceMxn(request.amount)`, status label via `BALANCE_STATUS_LABELS[request.status]`, creation date via `formatDateToSpanish(request.createdAt).fullDateTime`.
- Render decision date only when `request.decisionAt` is a non-null string with an explicit offset; otherwise render nothing (do not print the `--` placeholder for absent decisions).
- Render payment reference only when `request.status === 'approved'` and `request.paymentReference` is present. Never render `decisionReason`.
- Render a "Cancelar" `Button` only when `request.status === 'pending'`, calling `onRequestCancel(request)`; disable it while `isCancelling` is true.
- Expose amount/status/dates as visible text queryable by role/text (no styling assertions).

#### `src/features/Balance/BalanceRequestsScreen.tsx`

**Action:** Create — `'use client'` screen owning list state, query, pagination, and cancel mutation. Propless.

State and derived values (mirror `Order.tsx`):

```ts
const { month: currentMonth, year: currentYear } = getBusinessCalendarMonthYear()
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i)
const [selectedMonth, setSelectedMonth] = useState(currentMonth)
const [selectedYear, setSelectedYear] = useState(currentYear)
const [page, setPage] = useState(1)
const limit = 10
const [requestToCancel, setRequestToCancel] = useState<BalanceRequestDto | null>(null)
```

- `handleMonthChange` / `handleYearChange` set the value **and** reset `page` to 1 (matching `Order.tsx`).

Query:

```ts
const { data, isPending, isError } = useQuery({
  queryKey: ['balance', 'requests', selectedMonth, selectedYear, page, limit],
  queryFn: () => getBalanceRequestsCb({ month: selectedMonth, year: selectedYear, page, limit }),
})
```

Cancel mutation:

```ts
const mutation = useMutation<BalanceRequestDto, AxiosError<CreateBalanceRequestErrorResponse>, string>({
  mutationFn: cancelBalanceRequestCb,
  onSuccess: () => {
    setRequestToCancel(null)
    queryClient.invalidateQueries({ queryKey: ['balance', 'requests'] })
  },
})
```

- Confirmation flow: a `pending` row's cancel button sets `requestToCancel`, opening a Flowbite `Modal`. The confirm button calls `mutation.mutate(requestToCancel.id)`; it is disabled while `mutation.isPending`. The dismiss button clears `requestToCancel` and calls `mutation.reset()`. The callback must not run before the user confirms.
- On mutation error, keep the modal context and show `BALANCE_CANCEL_ERROR_MESSAGE` via `role="alert"`; do **not** present the request as cancelled. Authoritative state comes from the invalidated refetch, not an optimistic edit.
- Do **not** invalidate or mutate `['balance']`.

Render states (Spanish copy from `balance.constants`):
- Heading `BALANCE_REQUESTS_HEADING`.
- Month `Select` (`Enero`…`Diciembre`) + year `Select` with visible `Label`s, mirroring `Order.tsx`.
- Loading: `isPending` → `BALANCE_REQUESTS_LOADING_MESSAGE` in a `role="status"` region (non-blocking).
- Error: `isError` → `BALANCE_REQUESTS_ERROR_MESSAGE`; no fabricated rows.
- Empty: settled + `data.requests.length === 0` → `BALANCE_REQUESTS_EMPTY_MESSAGE`.
- Populated: map `data.requests` to `BalanceRequestCard`, passing `isCancelling = mutation.isPending && requestToCancel?.id === request.id`.
- Pagination: render Anterior / page numbers / Siguiente from `data.totalPages` only when `> 1`, reusing the `Order.tsx` button pattern.

**Edge cases:** client component (hooks + TanStack Query). Keep DTO timestamps as raw strings and pass them straight to `formatDateToSpanish`. Month/year filtering happens on the backend across the full result set — never filter the current page client-side. A stale list may offer cancel on an already-transitioned request; tolerate the `409` by surfacing the error and letting the refetch reconcile.

#### `src/features/Dashboard/Dashboard.tsx`

**Action:** Modify (in Phase 4) — deferred to Phase 4 alongside nav wiring.

### Success Criteria

- **Automated:** `pnpm test -- __tests__/feature/Balance/BalanceRequestsScreen.test.tsx`.
- **Manual:** deferred to Phase 4 (screen not yet reachable).

### Test Coverage

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `src/features/Balance/BalanceRequestsScreen.test.tsx` | default month/year derived from Mexico City when browser-local month differs; populated rows show amount, Spanish status, timezone-correct creation/decision dates; payment reference only on approved + present; rejection reason never shown; cancel action only on `pending`; confirmation required before the cancel callback runs; successful cancel invalidates `['balance', 'requests']` and reflects `cancelled` without touching `['balance']`; conflict (`409`) preserves prior state and shows the error; empty and error states; pagination resets page on month/year change | Fresh retry-disabled `QueryClient` + real callbacks from `BalanceDisplay.test.tsx` / `BalanceRequestDialog.test.tsx`; mock `axios` only |

- **Timezone default:** set a fixed system instant whose UTC month differs from the Mexico City month (e.g. `2026-02-01T05:30:00.000Z` → January in `America/Mexico_City`) via `jest.useFakeTimers`/`setSystemTime`, then assert the month `Select` defaults to `Enero`. Keep the real `date.utils` helpers active; do not mock `Intl`/Luxon/`BUSINESS_TIMEZONE`.
- **Invalidation assertion:** spy the fresh client's `invalidateQueries` (or seed both `['balance']` and `['balance','requests',…]` and assert only the requests prefix refetches).
- **Confirmation:** assert `axios.patch` is not called until the modal confirm button is clicked; drive interactions with `userEvent`.
- Query by role/label/text only; no CSS or `container`/`querySelector` assertions.

## Phase 4: Dashboard Navigation Wiring

### Changes Required

#### `src/shared/types/dashboard.types.ts`

**Action:** Modify — add `'balance'` to the union.

```ts
export type DashboardScreens = 'quotes' | 'overview' | 'marginProfit' | 'addresses' | 'balance';
```

#### `src/shared/ui/organisms/Aside.tsx`

**Action:** Modify — add a Saldo link in the always-visible nav group (e.g. after Direcciones, before the admin-only Margen de ganancia). Import a wallet icon from `@remixicon/react` (e.g. `RiWallet3Line`; fall back to `RiWalletLine` if the former is unavailable).

```tsx
<DashboardAsideLink isSelected={screen === 'balance'} onClickCb={() => updateScreen('balance')}>
  <RiWallet3Line />
  Saldo
</DashboardAsideLink>
```

#### `src/shared/ui/organisms/HeaderMenuDrawer.tsx`

**Action:** Modify — add the paired mobile entry in the same order so desktop and mobile stay in sync.

```tsx
<MenuMobileLink isSelected={screen === 'balance'} onClickCb={() => handleClick(updateScreen, 'balance')}>
  <RiWallet3Line />
  Saldo
</MenuMobileLink>
```

#### `src/features/Dashboard/Dashboard.tsx`

**Action:** Modify — import `BalanceRequestsScreen` and render it for `screen === 'balance'` in **both** the mobile/tablet and desktop branches, matching the existing per-screen conditionals.

```tsx
{ screen === 'balance' && (<BalanceRequestsScreen />) }
```

**Edge cases:** `saveDashboardScreen` persists the selected screen as a cookie and accepts any `DashboardScreens` value, so `'balance'` is stored on selection with no further change. The mobile branch renders `BalanceDisplay` above content and the desktop branch renders it inside `Aside`; the new screen does not add a second current-balance query.

### Success Criteria

- **Automated:**
  - `pnpm test` (crosses routes, feature, and dashboard shell; coverage always collected).
  - `pnpm exec tsc --noEmit`.
  - `pnpm lint`.
  - `pnpm build`.
- **Manual (desktop + mobile/tablet):**
  1. Sign in, open the dashboard, and select **Saldo** from the sidebar (desktop) and the drawer (mobile).
  2. Confirm the list defaults to the current Mexico City month/year and shows amount, Spanish status, and creation date; decision date appears only when present; payment reference appears only on approved requests.
  3. Change month/year and confirm the page resets to 1 and results refetch.
  4. On a `pending` request, click Cancelar, confirm in the modal, and verify it becomes `Cancelada` after refetch while the current balance is unchanged.
  5. Trigger a conflict (cancel a request already transitioned) and confirm the error message shows without a false cancelled state.

### Test Coverage

Dashboard shell screen-switching is exercised by `pnpm test`; add a `balance`-screen assertion only if an existing `Dashboard`/`Aside`/drawer test already asserts screen membership and would otherwise omit the new value. Do not assert styling or icon classes.

## Cross-Cutting Concerns

- **Auth/cookies:** both new routes read `getAccessToken()` server-side and forward a bearer token; the browser never reads the httpOnly session cookie or calls the backend directly.
- **Upstream status preservation:** unlike the guides-db routes, these routes preserve upstream status and body (especially the `409` `BAL-BUS-002` conflict and `401`/`403`/`404`) so the UI can surface authoritative state.
- **Cache independence:** the history query (`['balance','requests',…]`) and current-balance query (`['balance']`) are distinct server state; cancel invalidates only the requests prefix. The per-provider `QueryClient` keeps user-sensitive data isolated.
- **Prefix interop:** the history query is the first consumer of Story 2's `['balance','requests']` create-invalidation; the prefix must match exactly.
- **Timezone:** all timestamps and the default month/year use `America/Mexico_City` through `date.utils.ts`; never browser-local time or a fixed offset.
- **Responsive:** the Saldo screen renders in both `Dashboard` branches; nav entries are added to both the desktop sidebar and mobile drawer.
- **Envelope diversity:** list unwraps `data` (array + pagination siblings); cancel unwraps `data.request` (single object). Keep the two unwrap paths separate.

## Open Questions / Out-Of-Scope

**Open (non-blocking):**
- The Saldo screen's internal visual layout is deferred to design (research Open Question UI-IV). This plan fixes behavior, states, and entry-point placement; the design phase refines layout without changing the acceptance criteria.
- Whether to also render current balance *inside* the Saldo screen. This plan keeps the single persistent `BalanceDisplay` (aside/header) and does not duplicate the `['balance']` query on the screen. If design requires an in-screen balance panel, reuse `BalanceDisplay` rather than mounting a second query.
- Icon choice for the Saldo nav entry (`RiWallet3Line` proposed); confirm the exact `@remixicon/react` export during implementation.

**Out of scope (per research):**
- Admin queue, approval, rejection, payment-reference entry, admin single-request lookup, and email deep links (Stories 4/5).
- Increasing or optimistically changing current balance after cancellation.
- Showing rejection reasons; client-side status filtering; backend timezone/month-boundary implementation.
- New dependencies, a state store, a service layer, or a query-key factory.
- Normalizing unrelated API route response/error shapes (including the guides-db flatten-to-`400` behavior).
