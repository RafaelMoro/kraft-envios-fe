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
- **Confirmed by comps:** current balance renders persistently via `BalanceDisplay` (desktop aside bottom-left "Saldo disponible" card + mobile/tablet top card). The requests screen focuses on the history and does not mount a second `['balance']` query.
- The nav entry is visible to all authenticated users (not admin-gated), matching the user list being self-scoped by the backend.
- Existing local missing-token behavior remains `400` with `{ message: 'missing access token' }`.

### Comp-driven display decisions (supersede the research's UI scope)

The user supplied comps (`comps/*.png`) and confirmed three display rules that override the research doc:

- **Nav label is "Mis solicitudes"** (not "Saldo"). Screen uses an eyebrow "SALDO Y MOVIMIENTOS", an H1 "Mis solicitudes", a subtitle, a "Solicitudes recientes" section header, and a `data.total` count ("6 solicitudes").
- **`decisionReason` is shown** when present, labeled "Razón de la cancelación" (reverses the research "never shown" decision). The field exists on `BalanceRequestDto` and is returned by the confirmed list contract.
- **Payment reference shows whenever the `paymentReference` prop is present**, for any status (user override of both the research "approved-only" rule and the comps' "Por asignar"/"No aplica" placeholders — no placeholder text; the row is simply omitted when absent).
- Dates render in the comp format "18 jul 2026" (day, lowercase Spanish month abbrev, year) via a new business-timezone helper — see Phase 1.

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
- Create `src/features/Balance/BalanceRequestCard.tsx` (card + `BalanceRequestCardSkeleton`).
- Modify `src/features/Balance/BalanceRequestDialog.tsx` (reusable trigger for the empty-state CTA).
- Modify `src/features/Dashboard/Dashboard.tsx`.

### `src/shared/**`

- Modify `src/shared/types/balance.types.ts`.
- Modify `src/shared/utils/balance.utils.ts`.
- Modify `src/shared/utils/date.utils.ts` (add `formatBusinessDateShort`).
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
- `src/features/Balance/BalanceDisplay.tsx`: current-balance display is untouched (it renders `BalanceRequestDialog` with default props, so behavior is identical). Note: `BalanceRequestDialog` itself gains optional trigger props for the empty-state CTA — see Phase 3.
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

// Badge tone per status (comps: Pendiente amber, Aprobada green, Rechazada gray).
// Cancelada has no comp; use a neutral/red tone. Tests must NOT assert these classes.
export const BALANCE_STATUS_BADGE_COLOR: Record<BalanceRequestStatus, string> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'gray',
  cancelled: 'failure',
};

// Page-level copy (comps).
export const BALANCE_REQUESTS_EYEBROW = 'Saldo y movimientos';
export const BALANCE_REQUESTS_HEADING = 'Mis solicitudes';
export const BALANCE_REQUESTS_SUBTITLE =
  'Consulta el estado de tus solicitudes de saldo y cancela las que aún estén pendientes.';
export const BALANCE_REQUESTS_SECTION_TITLE = 'Solicitudes recientes';

// Card field labels (comps).
export const BALANCE_FIELD_AMOUNT = 'Monto solicitado';
export const BALANCE_FIELD_CREATED = 'Creada';
export const BALANCE_FIELD_DECISION = 'Decisión';
export const BALANCE_FIELD_PAYMENT_REFERENCE = 'Referencia de pago';
export const BALANCE_FIELD_DECISION_REASON = 'Razón de la cancelación';

// Neutral placeholder for a "Decisión" cell with no date on a non-pending request.
export const BALANCE_DECISION_NONE = '—';

// Empty state (comps/empty-state-comp-see-requests.png).
export const BALANCE_REQUESTS_EMPTY_TITLE = 'No tienes solicitudes todavía';
export const BALANCE_REQUESTS_EMPTY_BODY =
  'Cuando solicites saldo, podrás revisar aquí su avance y los datos de pago.';
export const BALANCE_REQUESTS_EMPTY_CTA = 'Crear solicitud';

// Error state (comps/error-comp-see-requests.png).
export const BALANCE_REQUESTS_ERROR_EYEBROW = 'Error de conexión';
export const BALANCE_REQUESTS_ERROR_TITLE = 'No pudimos cargar tus solicitudes de saldo';
export const BALANCE_REQUESTS_ERROR_BODY =
  'Ocurrió un problema al consultar la información. Revisa tu conexión e inténtalo de nuevo.';
export const BALANCE_REQUESTS_ERROR_RETRY = 'Reintentar';

// sr-only status text for the skeleton loading state.
export const BALANCE_REQUESTS_LOADING_MESSAGE = 'Cargando solicitudes...';

export const BALANCE_CANCEL_ACTION = 'Cancelar';
export const BALANCE_CANCEL_CONFIRM_TITLE = 'Cancelar solicitud de saldo';
export const BALANCE_CANCEL_CONFIRM_BODY =
  '¿Seguro que quieres cancelar esta solicitud de saldo? Esta acción no se puede deshacer.';
export const BALANCE_CANCEL_CONFIRM_ACTION = 'Sí, cancelar';
export const BALANCE_CANCEL_DISMISS_ACTION = 'No, volver';
export const BALANCE_CANCEL_ERROR_MESSAGE =
  'No pudimos cancelar la solicitud. Es posible que ya haya cambiado de estado. Actualiza e inténtalo de nuevo.';
```

- The month option list (`Enero`…`Diciembre`) is defined locally in the screen mirroring `Order.tsx`; do not introduce a shared `MONTHS` constant.
- The count line (`6 solicitudes`) renders `data.total` inline in the screen (e.g. `${total} ${total === 1 ? 'solicitud' : 'solicitudes'}`); no constant needed.

#### `src/shared/utils/date.utils.ts`

**Action:** Modify — add a business-timezone day-first date formatter matching the comps ("18 jul 2026"). Reuse the existing `getBusinessDateParts` + offset guard + `PLACEHOLDER`; do not change `formatDateToSpanish` or any existing export. This keeps `date.utils.ts` the single timezone boundary rather than formatting dates ad hoc in the card.

```ts
// Lowercase Spanish month abbreviations for the "18 jul 2026" comp format.
const MONTHS_ES_LOWER = MONTHS_ES.map((m) => m.toLowerCase());

export const formatBusinessDateShort = (timestamp: string): string => {
  if (typeof timestamp !== 'string' || !hasExplicitOffset(timestamp)) return PLACEHOLDER.date;
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return PLACEHOLDER.date;
  const parts = getBusinessDateParts(date);
  const month = MONTHS_ES_LOWER[Number(parts.month) - 1];
  return `${Number(parts.day)} ${month} ${parts.year}`;
};
```

- Returns the `--` placeholder for null/offsetless input, so the card can treat a `--` result as "no date".

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

**Action:** Create — presentational card for one request, matching the comps (columnar on desktop/tablet, stacked on mobile via responsive Tailwind; do not assert layout in tests). Props: `{ request: BalanceRequestDto; onRequestCancel: (request: BalanceRequestDto) => void; isCancelling: boolean }`.

Field rules (comps + confirmed decisions):

- **Monto solicitado:** `formatBalanceMxn(request.amount)` with a trailing "MXN".
- **Creada:** `formatBusinessDateShort(request.createdAt)`.
- **Decisión:** `formatBusinessDateShort(request.decisionAt)` when `decisionAt` is present. When absent: show `BALANCE_STATUS_LABELS.pending` ("Pendiente") for a `pending` request (matches the comp); show a neutral placeholder `BALANCE_DECISION_NONE` ("—") for any other status with no decision date (e.g. `cancelled`). Pass `decisionAt` to the formatter only when non-null.
- **Referencia de pago:** render the row **only when `request.paymentReference` is present** (truthy), for any status; omit the row entirely when absent. No "Por asignar"/"No aplica" placeholder (user override of the comp).
- **Razón de la cancelación:** render `request.decisionReason` **only when present** (truthy), for any status.
- **Status badge:** `BALANCE_STATUS_LABELS[request.status]`, tone from `BALANCE_STATUS_BADGE_COLOR` (Flowbite `Badge` `color`).
- **Cancelar action:** render only when `request.status === 'pending'`, calling `onRequestCancel(request)`; disabled while `isCancelling` is true.
- Expose amounts, status labels, dates, references, and reason as visible text queryable by role/text; use the `BALANCE_FIELD_*` label constants.

Also export a **`BalanceRequestCardSkeleton`** from this file: the same card frame with `animate-pulse` `bg-gray-200 dark:bg-gray-700` placeholder blocks in the amount/field/badge positions, `aria-hidden`. Follows the skeleton idiom already in `BalanceDisplay.tsx` (`animate-pulse rounded bg-gray-200`).

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
const { data, isPending, isError, refetch } = useQuery({
  queryKey: ['balance', 'requests', selectedMonth, selectedYear, page, limit],
  queryFn: () => getBalanceRequestsCb({ month: selectedMonth, year: selectedYear, page, limit }),
})
```

- `refetch` powers the error-state "Reintentar" button.

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
- Header block: eyebrow `BALANCE_REQUESTS_EYEBROW`, H1 `BALANCE_REQUESTS_HEADING`, subtitle `BALANCE_REQUESTS_SUBTITLE`.
- Month `Select` (`Enero`…`Diciembre`) + year `Select` with visible `Label`s ("Mes"/"Año"), mirroring `Order.tsx`.
- Section header `BALANCE_REQUESTS_SECTION_TITLE` alongside the count line derived from `data.total` (e.g. "6 solicitudes"), shown once data is available.

The header block and the Mes/Año filter row stay mounted across every state (the error comp keeps them visible so the user can change the period); only the list region below swaps between loading / error / empty / populated.

- **Loading (`isPending`):** render ~3 `BalanceRequestCardSkeleton` cards inside a `role="status"` `aria-live="polite"` wrapper carrying an sr-only `BALANCE_REQUESTS_LOADING_MESSAGE` (non-blocking; the skeletons are `aria-hidden`).
- **Error (`isError`):** the error card from `comps/error-comp-see-requests.png` — a bordered/rounded centered panel with a red circular refresh icon (`RiRefreshLine` in a light-red circle), eyebrow `BALANCE_REQUESTS_ERROR_EYEBROW`, title `BALANCE_REQUESTS_ERROR_TITLE`, body `BALANCE_REQUESTS_ERROR_BODY`, and a `BALANCE_REQUESTS_ERROR_RETRY` ("Reintentar") `Button` calling `refetch()`. Wrap the message in `role="alert"`. Same design across breakpoints — the panel is fluid width and centers on mobile/tablet (adapt spacing only; do not restyle). No fabricated rows.
- **Empty:** settled + `data.requests.length === 0` → the empty panel from `comps/empty-state-comp-see-requests.png`: a dashed-border rounded container with a gray circular inbox icon (`RiInboxLine`), title `BALANCE_REQUESTS_EMPTY_TITLE`, body `BALANCE_REQUESTS_EMPTY_BODY`, and a `Crear solicitud` CTA. The CTA reuses Story 2's create flow by rendering `<BalanceRequestDialog triggerLabel={BALANCE_REQUESTS_EMPTY_CTA} />` (see below); a successful create invalidates `['balance', 'requests']`, so this screen refetches and the new request appears. Same panel design across desktop/tablet/mobile (fluid width, centered). The header + filter row stay mounted above it.
- **Populated:** map `data.requests` to `BalanceRequestCard`, passing `isCancelling = mutation.isPending && requestToCancel?.id === request.id`.
- **Pagination:** render Anterior / page numbers / Siguiente from `data.totalPages` only when `> 1`, reusing the `Order.tsx` button pattern.

**Edge cases:** client component (hooks + TanStack Query). Keep DTO timestamps as raw strings and pass them straight to `formatDateToSpanish`. Month/year filtering happens on the backend across the full result set — never filter the current page client-side. A stale list may offer cancel on an already-transitioned request; tolerate the `409` by surfacing the error and letting the refetch reconcile.

#### `src/features/Balance/BalanceRequestDialog.tsx`

**Action:** Modify — make the trigger button reusable so the empty-state CTA opens the same create flow. Add optional props, fully backward-compatible (existing `BalanceDisplay` usage is unchanged).

```ts
interface BalanceRequestDialogProps {
  triggerLabel?: string       // default 'Solicitar saldo'
  triggerClassName?: string   // default the existing 'mt-3 w-full hover:cursor-pointer'
}
```

- Use `triggerLabel` as the trigger button text and `triggerClassName` as its className; keep all current defaults so `BalanceDisplay` renders identically.
- Do not change the mutation, success copy, or the `['balance', 'requests']` invalidation. The empty-state instance benefits from that same invalidation.

**Edge case:** two `BalanceRequestDialog` instances can be mounted at once (the persistent `BalanceDisplay` one plus the empty-state one). Each owns independent local modal state, so this is safe; both invalidate the same prefix on success.

#### `src/features/Dashboard/Dashboard.tsx`

**Action:** Modify (in Phase 4) — deferred to Phase 4 alongside nav wiring.

### Success Criteria

- **Automated:** `pnpm test -- __tests__/feature/Balance/BalanceRequestsScreen.test.tsx`.
- **Manual:** deferred to Phase 4 (screen not yet reachable).

### Test Coverage

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `src/features/Balance/BalanceRequestsScreen.test.tsx` | default month/year derived from Mexico City when browser-local month differs; populated rows show amount, Spanish status, timezone-correct creation date, and decision date when present (status label when absent); payment reference rendered when `paymentReference` present (any status) and omitted when absent; `decisionReason` rendered when present and omitted when absent; total count reflects `data.total`; cancel action only on `pending`; confirmation required before the cancel callback runs; successful cancel invalidates `['balance', 'requests']` and reflects `cancelled` without touching `['balance']`; conflict (`409`) preserves prior state and shows the error; loading shows skeleton cards (via `role="status"`) not real rows; error state shows the "Reintentar" button and clicking it refetches (assert a second `axios.get`); empty state shows the "No tienes solicitudes todavía" panel and its "Crear solicitud" CTA opens the create modal (real `BalanceRequestDialog`, not mocked); filter row stays mounted in the empty and error states; pagination resets page on month/year change | Fresh retry-disabled `QueryClient` + real callbacks from `BalanceDisplay.test.tsx` / `BalanceRequestDialog.test.tsx`; mock `axios` only |

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

**Action:** Modify — add a "Mis solicitudes" link in the always-visible nav group (comps place it after Direcciones). Import `RiWalletLine` from `@remixicon/react` to match the comp's wallet glyph.

```tsx
<DashboardAsideLink isSelected={screen === 'balance'} onClickCb={() => updateScreen('balance')}>
  <RiWalletLine />
  Mis solicitudes
</DashboardAsideLink>
```

#### `src/shared/ui/organisms/HeaderMenuDrawer.tsx`

**Action:** Modify — add the paired mobile entry in the same order so desktop and mobile stay in sync.

```tsx
<MenuMobileLink isSelected={screen === 'balance'} onClickCb={() => handleClick(updateScreen, 'balance')}>
  <RiWalletLine />
  Mis solicitudes
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

**Resolved (comps + user decisions, 2026-07-23):**
- Screen layout fixed by `comps/*.png` (desktop, tablet, two mobile, error, empty). Nav label "Mis solicitudes" with `RiWalletLine`; current balance stays in the persistent `BalanceDisplay` (no in-screen duplicate); `decisionReason` shown; payment reference shown when the prop is present. Empty state reuses Story 2's `BalanceRequestDialog` for its "Crear solicitud" CTA.
- Loading = ~3 `BalanceRequestCardSkeleton` cards. Error = the `error-comp-see-requests.png` panel with a "Reintentar" button wired to `refetch`. Empty = the `empty-state-comp-see-requests.png` dashed panel with a "Crear solicitud" CTA reusing `BalanceRequestDialog`. All three keep the same design across desktop/tablet/mobile.
- "Decisión" cell with no `decisionAt`: "Pendiente" for a pending request (comp), neutral "—" for other statuses (e.g. cancelled). User may flip cancelled back to the status label.
- Date format helper `formatBusinessDateShort` is a new `date.utils.ts` export (comp-driven "18 jul 2026"); adds behavior without changing existing exports.

**Open (non-blocking, confirm during implementation):**
- The empty-state copy ("No tienes solicitudes **todavía**") reads as "none ever," but this screen is month/year-filtered — it also shows when the *selected period* is empty while other months have requests. Using the comp verbatim; flag if period-specific copy is wanted.
- Exact icon exports (`RiRefreshLine` for error, `RiInboxLine` for empty) — confirm the `@remixicon/react` names.

**Out of scope (per research):**
- Admin queue, approval, rejection, payment-reference entry, admin single-request lookup, and email deep links (Stories 4/5).
- Increasing or optimistically changing current balance after cancellation.
- Client-side status filtering; backend timezone/month-boundary implementation.
- New dependencies, a state store, a service layer, or a query-key factory.
- Normalizing unrelated API route response/error shapes (including the guides-db flatten-to-`400` behavior).
