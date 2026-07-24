# Implementation Plan: Admin Balance-Request Queue And Approve/Reject Decisions

**Story of epic:** `ai-research/add-balance.epic.md` (Story 4, `add-balance.epic.md:135-152`)
**Source research:** `ai-research/balance-addition/admin-request-queue-decisions.story-4.md`
**Research sign-off:** Complete. Every recorded Open Question (Backend I–IV, UI I–V, Authorization I) is answered; the only deferred item is the admin screen's internal visual layout, which the supplied comps (`comps/admin-request-comp-*.png`) resolve.
**Planning date:** 2026-07-24

## Assumptions

- `GET /balance/requests/admin` and `PATCH /balance/requests/{id}/decision` are served from `BACKEND_URI` and accept the existing bearer token, following the Story 1/2/3 Balance proxy pattern.
- The admin list envelope is `{ version, data: { requests, total, page, limit, totalPages }, message, error }`; each item is the user request shape plus always-present `userEmail`/`userName`, nullable `adminInCharge`, and conditional `paymentReference`/`decisionReason`/`decisionAt`. Timestamps stay raw UTC ISO strings (Open Question Backend I).
- Decision success is `200` with the decided request under `data.request`. A non-`pending` decision returns `409` with a **flat** KraftError `{ code, message, technicalDetails, statusCode }` — **not** nested under `error`, unlike Story 3's cancel `409` (Open Question Backend II).
- Balance BFF routes preserve upstream status/body verbatim; they never flatten to `400` like the guides-db routes. Missing token stays local `400 { message: 'missing access token' }`.
- Approving moves money, so decision success invalidates both `['balance', 'requests']` and `['balance']`. Story 3's cancel deliberately never touched `['balance']`; this is the one balance mutation that does.
- The admin query key is `['balance', 'requests', 'admin', month, year, page, limit, status]`, nested under the `['balance', 'requests']` prefix so one prefix invalidation covers user and admin lists.
- The detail surface displays the opaque Mongo ObjectId `id`; `SOL-2098` in the comp is a design placeholder (Open Question Backend III).
- The reject reason is user-facing (decision email + `decisionReason` in the user's history), so reject copy addresses the user (Open Question Backend IV).
- Balance nav entries are mutually exclusive by role: admins see only "Solicitudes de saldo", non-admins only "Mis solicitudes" (Open Question UI II).
- `NEXT_PUBLIC_BUSINESS_TIMEZONE=America/Mexico_City` is already enforced by Story 6; this story only consumes `date.utils.ts`. No dependency or lockfile change.

### Comp-driven display decisions

The comps (`comps/admin-request-comp-desktop.png`, `-desktop-drawer`, `-confirm-approval`, `-confirm-reject`, `-mobile`, `-mobile-drawer`, `-tablet`, `-tablet-drawer`) fix:

- Eyebrow **"Panel administrativo"**, H1 **"Solicitudes de saldo"**, subtitle "Revisa las solicitudes enviadas por usuarios y registra cada decisión desde un único flujo."
- A filter panel with `Mes` / `Año` selects, an `Estado` segmented toggle (`Pendientes` | `Todas`), and an explicit **`Aplicar filtros`** button.
- Section header **"Pendientes por revisar"** (pending mode) with a `data.total` count line ("3 solicitudes").
- Row fields: `Monto solicitado` (+ MXN), user name + email, `Creada`, `Referencia` (`Por asignar`), `Admin a cargo` (`Sin asignar`), status badge, and a `Ver detalle` action.
- A right-side drawer titled **"Detalle de solicitud"**: amount + badge, `Información de la solicitud` (`ID de solicitud`, `Creada`, `Usuario`, `Última actualización`, `Admin a cargo`), then `Registrar decisión` with two persistent buttons and their revealed forms.

## Acceptance Criteria

1. An authenticated admin queries requests with month, year, page, limit, and `status=pending|all`; every server-affecting value is represented in the TanStack Query key, and the query is gated by admin role and the active admin surface.
2. The queue shows request amount (zero-safe MXN), Spanish status, timezone-correct timestamps, user name/email, payment reference when present, and admin in charge when present, retrieved through an authenticated Next route handler that proxies `GET /balance/requests/admin`.
3. For a `pending` request the detail surface presents a positive `Aprobar` action requiring a non-empty `paymentReference` and a negative `Rechazar` action permitting an optional reason; both post to `PATCH /balance/requests/{balance-id}/decision`, and other statuses are read-only.
4. After a successful decision, affected request lists and current balance data are invalidated so authoritative backend state is refetched; the UI never optimistically mutates financial state.
5. Non-admin users do not see the admin queue, its navigation entry, or the decision controls, while the backend remains the authorization source of truth for direct calls; the admin BFF routes additionally apply a defensive Next-side role check.

## Delivery Sequence

1. **Phase 1 — Shared contract:** admin DTOs, the decision payload union, the flat conflict type, endpoint + admin copy constants, and the two browser callbacks. Type-check only.
2. **Phase 2 — BFF routes:** admin list route and decision route, both with the defensive `getUserInfo()` guard and status-preserving proxying, plus focused route tests.
3. **Phase 3 — Feature surface:** admin card, detail drawer, reusable decision form, admin queue screen, plus focused feature tests.
4. **Phase 4 — Dashboard wiring:** the new screen value, role-gated sidebar/drawer entries, render in both responsive branches, and final full verification.

Phase 2 depends on Phase 1's DTOs. Phase 3 depends on Phases 1–2. Phase 4 depends on Phase 3.

## Affected Files

### `src/app/api/**`

- Create `src/app/api/balance/requests/admin/route.ts` (`GET`).
- Create `src/app/api/balance/requests/[requestId]/decision/route.ts` (`PATCH`).

### `src/features/**`

- Create `src/features/Balance/BalanceAdminScreen.tsx`.
- Create `src/features/Balance/BalanceAdminRequestCard.tsx` (card + `BalanceAdminRequestCardSkeleton`).
- Create `src/features/Balance/BalanceAdminRequestDrawer.tsx`.
- Create `src/features/Balance/BalanceDecisionForm.tsx` (reused by Story 5).
- Modify `src/features/Dashboard/Dashboard.tsx`.

### `src/shared/**`

- Modify `src/shared/types/balance.types.ts`.
- Modify `src/shared/utils/balance.utils.ts`.
- Modify `src/shared/constants/global.constants.ts`.
- Modify `src/shared/constants/balance.constants.ts`.
- Modify `src/shared/types/dashboard.types.ts`.
- Modify `src/shared/ui/organisms/Aside.tsx`.
- Modify `src/shared/ui/organisms/HeaderMenuDrawer.tsx`.

### `__tests__/**`

- Create `__tests__/api/balance.requests.admin.route.test.ts`.
- Create `__tests__/feature/Balance/BalanceAdminScreen.test.tsx`.

### Deliberately Unchanged

- `src/app/api/balance/route.ts`, `src/app/api/balance/requests/route.ts`, `src/app/api/balance/requests/[requestId]/cancel/route.ts` — Story 1/2/3 behavior stays as-is.
- `src/features/Balance/BalanceRequestsScreen.tsx`, `BalanceRequestCard.tsx`, `BalanceRequestDialog.tsx`, `BalanceDisplay.tsx` — the user surface is untouched; the admin card is a separate component, not an adaptation of `BalanceRequestCard`.
- `src/features/QueryProviderWrapper.tsx` — reuse the per-provider `QueryClient`; do not add or move one.
- `src/app/dashboard/page.tsx` — the drawer theme override stays; see the Phase 3 edge case for how the detail drawer avoids it.
- `src/shared/utils/date.utils.ts` — no new helper; the drawer composes the two existing exports.
- `__tests__/api/balance.requests.route.test.ts` and existing Balance feature tests — no changes.
- The `marginProfit` entry in `HeaderMenuDrawer.tsx` stays ungated (a pre-existing desktop-hidden/mobile-exposed asymmetry outside this story's ACs). See Open Questions.
- `package.json`, `pnpm-lock.yaml`, env vars, `DESIGN.md`, backend code.

## Phase 1: Shared Contract (Types, Constants, Callbacks)

### Changes Required

#### `src/shared/types/balance.types.ts`

**Action:** Modify — append after `CancelBalanceRequestResponse`. Reuse `BalanceRequestStatus`; do not alter `BalanceRequestDto` or any existing export.

```ts
export type AdminBalanceRequestStatusFilter = 'pending' | 'all'

export interface AdminBalanceRequestDto {
  id: string
  amount: number
  paymentReference?: string | null
  status: BalanceRequestStatus
  decisionReason?: string | null
  decisionAt?: string | null
  createdAt: string
  updatedAt: string
  userEmail: string
  userName: string
  adminInCharge: string | null
}

export interface AdminBalanceRequestListParams {
  month?: number
  year?: number
  page?: number
  limit?: number
  status?: AdminBalanceRequestStatusFilter
}

export interface AdminBalanceRequestListData {
  requests: AdminBalanceRequestDto[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface GetAdminBalanceRequestsResponse {
  version: string
  data: AdminBalanceRequestListData
  message: null
  error: null
}

export type BalanceDecisionPayload =
  | { action: 'approve'; paymentReference: string }
  | { action: 'reject'; reason?: string }

// Decision success mirrors create/cancel (data.request), but with the admin item shape.
export interface DecideBalanceRequestResponse {
  version: string
  data: { request: AdminBalanceRequestDto }
  message: null
  error: null
}

// The decision 409 body is FLAT — not nested under `error` like Story 3's cancel conflict.
export interface BalanceDecisionConflictError {
  code: string
  message: string
  technicalDetails: object | null
  statusCode: number
}
```

- `AdminBalanceRequestDto` keeps every timestamp typed `string`; `adminInCharge` is `string | null` (never `undefined`).
- Do not widen the status filter beyond `pending | all`.

#### `src/shared/constants/global.constants.ts`

**Action:** Modify — add beside `BALANCE_REQUESTS_API_ENDPOINT` (line 19).

```ts
export const BALANCE_REQUESTS_ADMIN_API_ENDPOINT = "/api/balance/requests/admin";
```

- The decision URL is derived per-request from `BALANCE_REQUESTS_API_ENDPOINT`; no separate constant.

#### `src/shared/constants/balance.constants.ts`

**Action:** Modify — append an admin block. Reuse `BALANCE_STATUS_LABELS`, `BALANCE_STATUS_BADGE_COLOR`, `BALANCE_FIELD_AMOUNT`, `BALANCE_FIELD_CREATED`, and `BALANCE_PAYMENT_REFERENCE_PENDING_PLACEHOLDER`; do not duplicate them.

```ts
// Admin queue page copy (comps/admin-request-comp-desktop.png).
export const BALANCE_ADMIN_EYEBROW = 'Panel administrativo';
export const BALANCE_ADMIN_HEADING = 'Solicitudes de saldo';
export const BALANCE_ADMIN_SUBTITLE =
  'Revisa las solicitudes enviadas por usuarios y registra cada decisión desde un único flujo.';
export const BALANCE_ADMIN_SECTION_TITLE_PENDING = 'Pendientes por revisar';
export const BALANCE_ADMIN_SECTION_TITLE_ALL = 'Todas las solicitudes';

// Filter controls.
export const BALANCE_ADMIN_FILTER_STATUS_LABEL = 'Estado';
export const BALANCE_ADMIN_STATUS_FILTER_LABELS: Record<AdminBalanceRequestStatusFilter, string> = {
  pending: 'Pendientes',
  all: 'Todas',
};
export const BALANCE_ADMIN_APPLY_FILTERS = 'Aplicar filtros';

// Card / drawer field labels.
export const BALANCE_ADMIN_FIELD_REFERENCE = 'Referencia';
export const BALANCE_ADMIN_FIELD_ADMIN_IN_CHARGE = 'Admin a cargo';
export const BALANCE_ADMIN_FIELD_REQUEST_ID = 'ID de solicitud';
export const BALANCE_ADMIN_FIELD_USER = 'Usuario';
export const BALANCE_ADMIN_FIELD_UPDATED = 'Última actualización';
export const BALANCE_ADMIN_ADMIN_UNASSIGNED = 'Sin asignar';
export const BALANCE_ADMIN_VIEW_DETAIL = 'Ver detalle';

// Drawer.
export const BALANCE_ADMIN_DRAWER_TITLE = 'Detalle de solicitud';
export const BALANCE_ADMIN_DRAWER_CLOSE = 'Cerrar detalle';
export const BALANCE_ADMIN_DRAWER_INFO_TITLE = 'Información de la solicitud';

// Decision section (comps/admin-request-comp-confirm-approval|reject.png).
export const BALANCE_DECISION_SECTION_TITLE = 'Registrar decisión';
export const BALANCE_DECISION_APPROVE_ACTION = 'Aprobar solicitud';
export const BALANCE_DECISION_REJECT_ACTION = 'Rechazar solicitud';
export const BALANCE_DECISION_REFERENCE_LABEL = 'Referencia de pago';
export const BALANCE_DECISION_REFERENCE_PLACEHOLDER = 'Ej. KRF-843210';
export const BALANCE_DECISION_REASON_LABEL = 'Motivo (opcional)';
export const BALANCE_DECISION_REASON_PLACEHOLDER = 'Agrega contexto para el usuario';
export const BALANCE_DECISION_REASON_HELPER =
  'El usuario verá este motivo en su historial y en el correo de decisión.';
export const BALANCE_DECISION_DISMISS_ACTION = 'Cancelar';
export const BALANCE_DECISION_CONFIRM_APPROVE = 'Confirmar aprobación';
export const BALANCE_DECISION_CONFIRM_REJECT = 'Confirmar rechazo';
export const BALANCE_DECISION_CONFLICT_MESSAGE =
  'La solicitud ya cambió de estado y no se puede decidir. Actualiza la lista para ver el estado actual.';
export const BALANCE_DECISION_ERROR_MESSAGE =
  'No pudimos registrar la decisión. Inténtalo de nuevo.';

// Admin queue states.
export const BALANCE_ADMIN_LOADING_MESSAGE = 'Cargando solicitudes de saldo...';
export const BALANCE_ADMIN_EMPTY_PENDING = 'No hay solicitudes pendientes en este periodo.';
export const BALANCE_ADMIN_EMPTY_ALL = 'No hay solicitudes en este periodo.';
export const BALANCE_ADMIN_ERROR_TITLE = 'No pudimos cargar las solicitudes de saldo';
export const BALANCE_ADMIN_ERROR_BODY =
  'Ocurrió un problema al consultar la información. Revisa tu conexión e inténtalo de nuevo.';
export const BALANCE_ADMIN_ERROR_RETRY = 'Reintentar';

// Nav label (Aside + mobile drawer).
export const BALANCE_ADMIN_NAV_LABEL = 'Solicitudes de saldo';
```

- Add `AdminBalanceRequestStatusFilter` to the existing type import at the top of the file.
- The month option list stays local to the screen, mirroring `Order.tsx` and `BalanceRequestsScreen.tsx`; do not introduce a shared `MONTHS` constant.

#### `src/shared/utils/balance.utils.ts`

**Action:** Modify — add two callbacks beside the existing four; keep `formatBalanceMxn` and all existing callbacks unchanged.

```ts
export const getAdminBalanceRequestsCb = async (
  params: AdminBalanceRequestListParams
): Promise<AdminBalanceRequestListData> => {
  const query: AdminBalanceRequestListParams = {}
  if (params.month !== undefined) query.month = params.month
  if (params.year !== undefined) query.year = params.year
  if (params.page !== undefined) query.page = params.page
  if (params.limit !== undefined) query.limit = params.limit
  if (params.status !== undefined) query.status = params.status

  const response: AxiosResponse<GetAdminBalanceRequestsResponse> = await axios.get(
    BALANCE_REQUESTS_ADMIN_API_ENDPOINT,
    { params: query }
  )
  return response.data.data
}

export const decideBalanceRequestCb = async ({
  requestId,
  payload
}: {
  requestId: string
  payload: BalanceDecisionPayload
}): Promise<AdminBalanceRequestDto> => {
  const response: AxiosResponse<DecideBalanceRequestResponse> = await axios.patch(
    `${BALANCE_REQUESTS_API_ENDPOINT}/${encodeURIComponent(requestId)}/decision`,
    payload
  )
  return response.data.data.request
}
```

- `decideBalanceRequestCb` takes a single object argument so it plugs directly into `useMutation`'s single-variable signature.
- The list callback serializes only the five allowed keys, so undefined filters never reach the querystring.

### Success Criteria

- **Automated:** `pnpm exec tsc --noEmit`.
- **Manual:** none.

### Test Coverage

Covered indirectly by Phases 2–3; no dedicated test file for pure types/constants/callbacks.

## Phase 2: Authenticated Admin BFF Routes

### Changes Required

#### `src/app/api/balance/requests/admin/route.ts`

**Action:** Create — `GET`. Combine the status-preserving proxy shape of `src/app/api/balance/requests/route.ts` with the `getUserInfo()` admin guard from `src/app/api/guides-db/[kraftId]/hard/route.ts`.

- Signature: `export async function GET(request: NextRequest): Promise<NextResponse>`.
- Order of checks: token first (local `400`), then the admin guard (`403`), then upstream.

```ts
const ALLOWED_PARAMS = ['month', 'year', 'page', 'limit', 'status'] as const

const accessToken = await getAccessToken()
if (!accessToken) {
  return NextResponse.json({ message: 'missing access token' }, { status: 400 })
}

// ponytail: defensive guard, backend authorization is the source of truth
const userInfo = await getUserInfo()
const isAdmin = Array.isArray(userInfo?.data?.user?.role) && userInfo.data.user.role.includes('admin')
if (!isAdmin) {
  return NextResponse.json({ message: 'admin only' }, { status: 403 })
}

const forwarded: Record<string, string> = {}
for (const key of ALLOWED_PARAMS) {
  const value = request.nextUrl.searchParams.get(key)
  if (value !== null) forwarded[key] = value
}

const response: AxiosResponse<GetAdminBalanceRequestsResponse> = await axios.get(
  `${process.env.BACKEND_URI}/balance/requests/admin`,
  { headers: { Authorization: `Bearer ${accessToken}` }, params: forwarded }
)
return NextResponse.json(response.data, { status: response.status })
```

- `catch`: `axios.isAxiosError(error) && error.response` → `NextResponse.json(error.response.data, { status: error.response.status })`; else `NextResponse.json({ message: 'Failed to fetch admin balance requests' }, { status: 500 })`.

**Edge case:** this static `admin` segment sits alongside the existing dynamic `[requestId]` segment under `src/app/api/balance/requests/`. Next.js resolves the static segment first, so `/api/balance/requests/admin` never matches `[requestId]`; no route conflict, but do not rename the folder.

#### `src/app/api/balance/requests/[requestId]/decision/route.ts`

**Action:** Create — `PATCH` with a JSON body. Mirror the dynamic-param + `encodeURIComponent` shape of the sibling `cancel` route, add the admin guard, and keep status-preserving error handling.

- Signature: `export async function PATCH(request: NextRequest, context: { params: { requestId: string } }): Promise<NextResponse>`.
- Missing token → local `400`. Non-admin → `403 { message: 'admin only' }`. Missing `requestId` → local `400 { message: 'missing requestId' }`.
- Build an explicit payload from the parsed body rather than forwarding it wholesale, matching the `{ amount }` allowlist style of `src/app/api/balance/route.ts` POST:

```ts
const body = (await request.json()) as BalanceDecisionPayload
const payload: BalanceDecisionPayload =
  body.action === 'approve'
    ? { action: 'approve', paymentReference: body.paymentReference }
    : { action: 'reject', ...(body.reason ? { reason: body.reason } : {}) }

const uri = `${process.env.BACKEND_URI}/balance/requests/${encodeURIComponent(requestId)}/decision`
const response: AxiosResponse<DecideBalanceRequestResponse> = await axios.patch(uri, payload, {
  headers: { Authorization: `Bearer ${accessToken}` }
})
return NextResponse.json(response.data, { status: response.status })
```

- `catch`: preserve `error.response.data` + `error.response.status` — critical for the flat `409 BAL-BUS-002` conflict and for `401`/`403`/`404`. Fallback local `500 { message: 'Failed to decide balance request' }`.

**Edge cases:** the httpOnly session token is read server-side; the browser never calls the backend directly. `getUserInfo()` reads the non-authoritative `user-info` cookie — it is a secondary control only, and the `// ponytail:` comment must say so. The `409` body must survive verbatim so the UI can read the flat `data.code`.

### Success Criteria

- **Automated:** `pnpm test -- __tests__/api/balance.requests.admin.route.test.ts`.
- **Manual:** none.

### Test Coverage

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `src/app/api/balance/requests/admin/route.ts` | forwards only allowlisted `month`/`year`/`page`/`limit`/`status` with the bearer header and drops unrelated keys; missing token → local `400` without calling upstream; non-admin caller → `403` without calling upstream; upstream `401`/`404` status+body preserved; transport failure → local `500` | `__tests__/api/balance.requests.route.test.ts` (axios + `NextResponse.json` + `getAccessToken` mock, real `NextRequest` for `nextUrl.searchParams`) |
| `src/app/api/balance/requests/[requestId]/decision/route.ts` | PATCHes the URL-encoded id to `/balance/requests/{id}/decision` with the bearer header; approve body forwards `{ action, paymentReference }`; reject body omits `reason` when empty and includes it when supplied; missing token → `400`; non-admin → `403` without upstream; flat `409 BAL-BUS-002` status+body preserved verbatim (not flattened to `400`); transport failure → local `500` | Same mock pattern; build the request with a JSON body so `request.json()` resolves |

- Extend the `jest.mock('../../src/shared/lib/auth.lib', ...)` factory to expose **both** `getAccessToken` and `getUserInfo` as `jest.fn()`.
- Use a `requestId` containing a character needing encoding (e.g. `req/with space`) to prove `encodeURIComponent`.
- Assert an unrelated key (e.g. `userId`) is not forwarded by the list route.
- Type fixtures with `AdminBalanceRequestDto` / `GetAdminBalanceRequestsResponse` / `BalanceDecisionConflictError`; no `any`/`unknown`.

## Phase 3: Admin Queue Screen, Detail Drawer, And Decision Flow

### Changes Required

#### `src/features/Balance/BalanceAdminRequestCard.tsx`

**Action:** Create — presentational row for one admin request. Props:

```ts
interface BalanceAdminRequestCardProps {
  request: AdminBalanceRequestDto
  onViewDetail: (request: AdminBalanceRequestDto) => void
}
```

Field rules (comps; columnar on desktop/tablet, stacked on mobile via responsive Tailwind — never asserted in tests):

- **Monto solicitado:** `formatBalanceMxn(request.amount)` with a trailing "MXN" (zero renders `$0.00`).
- **User:** `request.userName` (prominent) above `request.userEmail`.
- **Creada:** `formatBusinessDateShort(request.createdAt)`.
- **Referencia:** `request.paymentReference` when truthy; otherwise `BALANCE_PAYMENT_REFERENCE_PENDING_PLACEHOLDER` ("Por asignar") on a `pending` request and `BALANCE_DECISION_NONE` ("—") on any other status with no reference.
- **Admin a cargo:** `request.adminInCharge` when non-null; otherwise `BALANCE_ADMIN_ADMIN_UNASSIGNED` ("Sin asignar").
- **Status badge:** `BALANCE_STATUS_LABELS[request.status]` with `BALANCE_STATUS_BADGE_COLOR[request.status]`.
- **Ver detalle:** a `Button` (or link-styled button) whose accessible name includes `BALANCE_ADMIN_VIEW_DETAIL`, calling `onViewDetail(request)`. It renders for **every** status — read-only statuses still open the drawer, just without decision controls.

Also export **`BalanceAdminRequestCardSkeleton`**: the same frame with `animate-pulse bg-gray-200 dark:bg-gray-700` blocks, `aria-hidden="true"`, mirroring `BalanceRequestCardSkeleton`.

**Rationale:** a separate component rather than extending `BalanceRequestCard`, because the admin row adds user/admin columns and replaces the cancel footer with `Ver detalle`; forking avoids branching the user card on an admin flag.

#### `src/features/Balance/BalanceDecisionForm.tsx`

**Action:** Create — `'use client'`. The reusable approve/reject surface Story 5's full page will mount unchanged. It owns its own mutation and invalidation so the consumer only supplies the request id.

```ts
interface BalanceDecisionFormProps {
  requestId: string
  onDecided?: () => void
}

type DecisionMode = 'idle' | 'approve' | 'reject'
```

Structure:

- Section heading `BALANCE_DECISION_SECTION_TITLE` ("Registrar decisión").
- Two **persistent** buttons, always visible: `BALANCE_DECISION_APPROVE_ACTION` and `BALANCE_DECISION_REJECT_ACTION`. Clicking one sets `mode` and calls `mutation.reset()`.
- `mode === 'approve'` reveals a required `Referencia de pago` `TextInput` (visible `Label` bound with `htmlFor`, placeholder `BALANCE_DECISION_REFERENCE_PLACEHOLDER`), plus `Cancelar` and `Confirmar aprobación`.
- `mode === 'reject'` reveals an optional `Motivo (opcional)` `Textarea` (visible `Label`, placeholder `BALANCE_DECISION_REASON_PLACEHOLDER`, helper text `BALANCE_DECISION_REASON_HELPER`), plus `Cancelar` and a danger `Confirmar rechazo`.
- `Cancelar` returns to `idle` and clears the local field values.

Mutation:

```ts
const mutation = useMutation<
  AdminBalanceRequestDto,
  AxiosError<BalanceDecisionConflictError>,
  { requestId: string; payload: BalanceDecisionPayload }
>({
  mutationFn: decideBalanceRequestCb,
  onSuccess: () => {
    setMode('idle')
    queryClient.invalidateQueries({ queryKey: ['balance', 'requests'] })
    queryClient.invalidateQueries({ queryKey: ['balance'] })
    onDecided?.()
  }
})
```

Submit rules:

- Approve: `disabled` while `paymentReference.trim()` is empty **or** `mutation.isPending`; submits `{ action: 'approve', paymentReference: paymentReference.trim() }`.
- Reject: enabled regardless of the reason, disabled only while `mutation.isPending`; submits `{ action: 'reject' }` when the trimmed reason is empty, `{ action: 'reject', reason: reason.trim() }` otherwise.
- On error, keep the current mode and field values and render `role="alert"` text: `BALANCE_DECISION_CONFLICT_MESSAGE` when `error.response?.status === 409 && error.response?.data?.code === 'BAL-BUS-002'` (read the **flat** `data.code`, not `data.error.code`), otherwise `BALANCE_DECISION_ERROR_MESSAGE`. Never show a decided state on failure.
- No optimistic edits; the new status comes from the invalidated refetch.

**Edge case:** both invalidations are required — `['balance', 'requests']` covers the admin queue and every mounted user history (the admin key nests under that prefix), and `['balance']` covers current balance because an approval moves money. This is the only balance mutation that touches `['balance']`.

#### `src/features/Balance/BalanceAdminRequestDrawer.tsx`

**Action:** Create — `'use client'`. Right-side Flowbite `Drawer` rendering the already-fetched row data; no per-request fetch.

```ts
interface BalanceAdminRequestDrawerProps {
  request: AdminBalanceRequestDto | null
  onClose: () => void
}
```

- `<Drawer open={request !== null} onClose={onClose} position="right" className="w-full max-w-md">`; render nothing when `request` is null.
- **Do not use `DrawerHeader`.** `src/app/dashboard/page.tsx` applies a `createTheme` override forcing `drawer.header.inner.titleText`/`titleCloseIcon` to `text-white`, which is correct for the blue mobile menu drawer but would render this drawer's title invisible on a white surface. Instead render a custom header row inside `DrawerItems`: an `h2` with `BALANCE_ADMIN_DRAWER_TITLE` plus a close `Button` carrying `aria-label={BALANCE_ADMIN_DRAWER_CLOSE}` that calls `onClose`.
- Body sections:
  1. Amount block: `formatBalanceMxn(request.amount)` + "MXN" and the status `Badge`.
  2. `BALANCE_ADMIN_DRAWER_INFO_TITLE` ("Información de la solicitud") with `ID de solicitud` → `request.id` (the opaque ObjectId), `Creada` → date+time, `Usuario` → `userName` + `userEmail`, `Última actualización` → date+time, `Admin a cargo` → `adminInCharge ?? BALANCE_ADMIN_ADMIN_UNASSIGNED`.
  3. `request.status === 'pending'` → `<BalanceDecisionForm requestId={request.id} onDecided={onClose} />`. Any other status → read-only detail with **no** decision controls; additionally render `decisionReason` (labeled with the existing `BALANCE_FIELD_DECISION_REASON`) when present.
- Date+time cells compose the two existing `date.utils.ts` exports rather than adding a helper:

```ts
const formatDetailTimestamp = (timestamp: string): string => {
  const date = formatBusinessDateShort(timestamp)
  if (date === '--') return BALANCE_DECISION_NONE
  return `${date} · ${formatDateToSpanish(timestamp).time}`
}
```

  This yields `22 jul 2026 · 10:42 am`. The comp shows `22 jul 2026 · 10:42` (24-hour); the am/pm suffix is a deliberate, minor deviation that keeps `date.utils.ts` the single timezone boundary with no new export. See Open Questions.

#### `src/features/Balance/BalanceAdminScreen.tsx`

**Action:** Create — `'use client'`. Owns filters, query, pagination, and drawer selection.

```ts
interface BalanceAdminScreenProps {
  userInfo: LoginData | null
}
```

Gating and state:

```ts
const isAdmin = Array.isArray(userInfo?.data?.user?.role) && userInfo?.data?.user?.role.includes('admin')

const { month: currentMonth, year: currentYear } = getBusinessCalendarMonthYear()
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i)
const LIMIT = 10

// Staged (draft) filter values edited by the controls.
const [draftMonth, setDraftMonth] = useState(currentMonth)
const [draftYear, setDraftYear] = useState(currentYear)
const [draftStatus, setDraftStatus] = useState<AdminBalanceRequestStatusFilter>('pending')

// Applied filter values that feed the query key.
const [month, setMonth] = useState(currentMonth)
const [year, setYear] = useState(currentYear)
const [status, setStatus] = useState<AdminBalanceRequestStatusFilter>('pending')
const [page, setPage] = useState(1)

const [selectedRequest, setSelectedRequest] = useState<AdminBalanceRequestDto | null>(null)
```

- Return `null` when `!isAdmin` (AC5: non-admins see no queue and no decision controls). The unauthorized *screen* is Story 5.
- `handleApplyFilters` copies the three drafts into the applied values and resets `page` to 1. Editing a draft alone must not change the query key.
- Pagination buttons change `page` only, leaving applied filters intact.
- Opening the drawer stores the row object; closing clears it.

Query (AC1 — every server-affecting value in the key; `enabled` gates on role, and mounting only happens on the active admin surface):

```ts
const { data, isPending, isError, refetch } = useQuery({
  queryKey: ['balance', 'requests', 'admin', month, year, page, LIMIT, status],
  queryFn: () => getAdminBalanceRequestsCb({ month, year, page, limit: LIMIT, status }),
  enabled: isAdmin
})
```

Render (Spanish copy from `balance.constants`):

- Header block: eyebrow `BALANCE_ADMIN_EYEBROW`, H1 `BALANCE_ADMIN_HEADING`, subtitle `BALANCE_ADMIN_SUBTITLE`.
- Filter panel (stays mounted in every state, matching the comps): `Mes` `Select` (`Enero`…`Diciembre`, local array as in `BalanceRequestsScreen`), `Año` `Select` from `YEARS`, an `Estado` segmented control, and the `BALANCE_ADMIN_APPLY_FILTERS` button. Each control has a visible `Label` bound via `htmlFor`.
- `Estado` control: a Flowbite `ButtonGroup` of two `Button`s labeled from `BALANCE_ADMIN_STATUS_FILTER_LABELS`, each carrying `aria-pressed={draftStatus === value}` so tests can query by role/name and assert selection without touching CSS. Mirrors the `Order.tsx` source-toggle idiom.
- Section header: `BALANCE_ADMIN_SECTION_TITLE_PENDING` when the **applied** status is `pending`, else `BALANCE_ADMIN_SECTION_TITLE_ALL`, with a count line derived from `data.total` (`${total} ${total === 1 ? 'solicitud' : 'solicitudes'}`).
- **Loading (`isPending`):** ~3 `BalanceAdminRequestCardSkeleton` inside a `role="status" aria-live="polite"` wrapper with an sr-only `BALANCE_ADMIN_LOADING_MESSAGE`. Non-blocking — the shell and filters stay usable.
- **Error (`isError`):** a bordered centered panel with `role="alert"` containing `BALANCE_ADMIN_ERROR_TITLE` / `BALANCE_ADMIN_ERROR_BODY` and a `BALANCE_ADMIN_ERROR_RETRY` button calling `refetch()`. No fabricated rows.
- **Empty:** settled with `data.requests.length === 0` → `BALANCE_ADMIN_EMPTY_PENDING` when the applied status is `pending`, else `BALANCE_ADMIN_EMPTY_ALL`.
- **Populated:** map `data.requests` to `BalanceAdminRequestCard` with `onViewDetail={setSelectedRequest}`.
- **Pagination:** Anterior / numbered / Siguiente from `data.totalPages`, rendered only when `> 1`, reusing the `BalanceRequestsScreen` button pattern.
- Always render `<BalanceAdminRequestDrawer request={selectedRequest} onClose={() => setSelectedRequest(null)} />` at the end.

**Edge cases:** client component (hooks + TanStack Query). Keep DTO timestamps raw and hand them to the date helpers. Month/year/status filtering happens on the backend across the full result set — never filter the current page client-side. A stale queue can offer a decision on an already-transitioned request; the `409` surfaces through `BalanceDecisionForm` and the invalidated refetch reconciles. Admin accounts have no requests of their own, so this screen must query only the admin endpoint.

### Success Criteria

- **Automated:** `pnpm test -- __tests__/feature/Balance/BalanceAdminScreen.test.tsx`.
- **Manual:** deferred to Phase 4 (screen not yet reachable).

### Test Coverage

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `__tests__/feature/Balance/BalanceAdminScreen.test.tsx` | non-admin `userInfo` renders no queue and issues no admin request; admin `userInfo` renders the queue; default month/year derived from Mexico City when the browser-local month differs; editing filters does **not** refetch until `Aplicar filtros`, which then requests the new `month`/`year`/`status` and resets `page` to 1; populated cards show amount, user name/email, Spanish status, timezone-correct `Creada`, `Por asignar` and `Sin asignar` placeholders, and a real `paymentReference`/`adminInCharge` when present; `Ver detalle` opens the drawer with the reused row data (id, user, timestamps); a non-`pending` request shows read-only detail with no `Aprobar solicitud`/`Rechazar solicitud` controls; `Confirmar aprobación` is disabled until `Referencia de pago` is non-empty and then PATCHes exactly `{ action: 'approve', paymentReference }`; reject with an empty textarea PATCHes `{ action: 'reject' }` and with text PATCHes `{ action: 'reject', reason }`; a successful decision invalidates `['balance', 'requests']` and `['balance']`; a flat `409 BAL-BUS-002` preserves state and shows the conflict alert with no false decided state; loading shows `role="status"` skeletons not real rows; error state shows `Reintentar` and clicking it refetches; empty state copy differs between `Pendientes` and `Todas`; pagination changes `page` without resetting applied filters | Fresh retry-disabled `QueryClient` from `__tests__/feature/Balance/BalanceRequestsScreen.test.tsx`; mock `axios` only; render the real `BalanceAdminRequestCard` / drawer / `BalanceDecisionForm` |

- **Timezone default:** use `jest.useFakeTimers`/`setSystemTime` with an instant whose UTC month differs from the Mexico City month (e.g. `2026-02-01T05:30:00.000Z` → January in `America/Mexico_City`) and assert the `Mes` select defaults to `Enero`. Keep the real `date.utils` helpers; never mock `Intl`, Luxon, or `BUSINESS_TIMEZONE`.
- **Invalidation:** spy the fresh client's `invalidateQueries` and assert both `['balance', 'requests']` and `['balance']`, or seed both keys and assert both refetch.
- **Conflict fixture:** reject `axios.patch` with `{ response: { status: 409, data: { code: 'BAL-BUS-002', message: '…', technicalDetails: null, statusCode: 409 } } }` — flat, not nested under `error`.
- Drive every interaction with `userEvent`; query by role, accessible name, label, or visible text only. No `container`/`querySelector`, no CSS assertions. Type all fixtures with `AdminBalanceRequestDto` / `LoginData`; no `any`/`unknown`.

## Phase 4: Dashboard Wiring And Role-Gated Navigation

### Changes Required

#### `src/shared/types/dashboard.types.ts`

**Action:** Modify — add the admin value.

```ts
export type DashboardScreens = 'quotes' | 'overview' | 'marginProfit' | 'addresses' | 'balance' | 'balanceAdmin';
```

#### `src/shared/ui/organisms/Aside.tsx`

**Action:** Modify — `isAdmin` already exists (line 20). Gate the existing user entry to non-admins and add the admin entry, so the two audiences see mutually exclusive Balance entries.

```tsx
{ !isAdmin && (
  <DashboardAsideLink isSelected={screen === 'balance'} onClickCb={() => updateScreen('balance')}>
    <RiWalletLine />
    Mis solicitudes
  </DashboardAsideLink>
) }
{ isAdmin && (
  <DashboardAsideLink isSelected={screen === 'balanceAdmin'} onClickCb={() => updateScreen('balanceAdmin')}>
    <RiInboxLine />
    {BALANCE_ADMIN_NAV_LABEL}
  </DashboardAsideLink>
) }
```

- Place the admin entry in the same slot as the current "Mis solicitudes" link (after Direcciones, before the admin-gated "Margen de ganancia"), matching the comp's sidebar order.
- Confirm the `@remixicon/react` export name for the inbox glyph before use.

#### `src/shared/ui/organisms/HeaderMenuDrawer.tsx`

**Action:** Modify — the component currently receives no `userInfo`, so add it and derive `isAdmin` with the same expression used by `Aside.tsx`/`Order.tsx`. Without this, the admin entry would be exposed on mobile to non-admins.

```ts
interface HeaderMenuMobileProps {
  screen: DashboardScreens | null
  userInfo: LoginData | null
  updateScreen: (newScreen: DashboardScreens) => Promise<void>
  handleSignOut: () => Promise<void>
}
```

- Gate the existing `Mis solicitudes` `MenuMobileLink` with `{ !isAdmin && ( … ) }` and add the paired admin entry under `{ isAdmin && ( … ) }` targeting `'balanceAdmin'`, in the same order as `Aside.tsx`.
- Leave the `marginProfit` entry as-is; see Open Questions.

#### `src/features/Dashboard/Dashboard.tsx`

**Action:** Modify — import `BalanceAdminScreen`, render it for `screen === 'balanceAdmin'` in **both** branches passing `userInfo`, and pass `userInfo` to `HeaderMenuMobile`.

```tsx
<HeaderMenuMobile screen={screen} userInfo={userInfo} updateScreen={updateScreen} handleSignOut={handleSignOut} />
…
{ screen === 'balanceAdmin' && (<BalanceAdminScreen userInfo={userInfo} />) }
```

**Edge cases:** `saveDashboardScreen` persists any `DashboardScreens` value as a cookie, so `'balanceAdmin'` stores with no further change. The screen self-gates on `isAdmin` (returns `null`), so a non-admin reaching this state renders nothing and fires no admin query. The mobile branch renders `BalanceDisplay` above content; the admin screen adds no second `['balance']` query.

### Success Criteria

- **Automated:**
  - `pnpm test` (crosses routes, feature, and dashboard shell; coverage always collected).
  - `pnpm exec tsc --noEmit`.
  - `pnpm lint`.
  - `pnpm build`.
- **Manual (desktop + mobile/tablet):**
  1. Sign in as an **admin**: the sidebar and mobile drawer show "Solicitudes de saldo" and **not** "Mis solicitudes".
  2. Sign in as a **non-admin**: the reverse — "Mis solicitudes" only, with no admin entry in either shell.
  3. On the admin queue, confirm the filters default to the current Mexico City month/year with `Pendientes` selected, and that changing a filter does nothing until `Aplicar filtros` is pressed (page then resets to 1).
  4. Confirm rows show amount, user name/email, `Creada`, `Por asignar`, and `Sin asignar`; open `Ver detalle` and verify the drawer title and body are legible in both light and dark mode (the dashboard drawer theme override does not affect it).
  5. Approve a pending request with a payment reference; confirm the queue and the sidebar/mobile balance card both refresh from the backend.
  6. Reject another request with a reason; confirm the new status appears after refetch.
  7. Decide a request that was already transitioned elsewhere and confirm the conflict message appears with no false approved/rejected state.
  8. Open a non-`pending` request's detail and confirm it is read-only with no decision controls.

### Test Coverage

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `__tests__/feature/Dashboard/Dashboard.test.tsx` | only if the existing suite asserts nav membership: admin sees the admin Balance entry and not "Mis solicitudes"; non-admin sees the reverse | Existing `Dashboard.test.tsx` (admin `userInfo` fixture, mocked `useMediaQuery`, mocked `preferences.lib`) |

- The existing suite's `userInfo` fixture is already `role: ['admin']`, and no current test asserts on "Mis solicitudes", so the gating change should not break existing expectations — verify with `pnpm test` and adjust the fixture only if a failure proves otherwise.
- Do not assert styling or icon classes.

## Cross-Cutting Concerns

- **Auth/cookies:** both new routes read `getAccessToken()` server-side and forward a bearer token; the browser never reads the httpOnly session cookie or calls the backend directly.
- **Defensive authorization:** the `getUserInfo()` guard reads the non-authoritative `user-info` cookie and is a secondary control only. Backend authorization remains mandatory. These become the second and third Next-side role-guarded routes after `/api/guides-db/[kraftId]/hard`; do not retrofit the pattern onto other routes.
- **Upstream status preservation:** the admin routes preserve upstream status and body (especially the **flat** `409 BAL-BUS-002` and `401`/`403`/`404`), unlike the guides-db routes that flatten to `400`.
- **Conflict-shape divergence:** the decision `409` is a top-level flat KraftError read via `data.code`; Story 3's cancel `409` nests the same code under `data.error.code`. Both must keep working.
- **Cache:** the admin key nests under `['balance', 'requests']`, so one prefix invalidation covers user and admin lists. Decision success additionally invalidates `['balance']` because approval moves money. No optimistic edits to any financial value.
- **Cross-session:** invalidation in the admin session cannot push an update into the requesting user's open browser; that is out of scope.
- **Timezone:** all timestamps and the default month/year use `America/Mexico_City` through `date.utils.ts`; never browser-local time or a fixed offset.
- **Responsive:** the admin screen renders in both `Dashboard` branches, and nav entries are added to both the desktop sidebar and the mobile drawer with matching role gating.
- **Flowbite drawer theme:** `src/app/dashboard/page.tsx` forces white drawer header text globally; the detail drawer must supply its own header instead of `DrawerHeader`.
- **Reuse for Story 5:** `BalanceDecisionForm` is self-contained (own mutation + invalidation, `requestId` + `onDecided` props) so Story 5's `/dashboard/requests/{requestId}` page can mount it unchanged.

## Open Questions / Out-Of-Scope

**Open (non-blocking, confirm during implementation):**

- **Drawer timestamp format.** The plan composes `formatBusinessDateShort` + `formatDateToSpanish().time`, producing `22 jul 2026 · 10:42 am`; the comp shows `22 jul 2026 · 10:42` (24-hour). If exact comp fidelity is required, add a `formatBusinessDateTimeShort` export to `date.utils.ts` instead of composing — but that is a new date helper, so it needs a deliberate call.
- **`Año` control type.** The comp renders the year in a plain box with no chevron. This plan uses a `Select` for consistency with `Order.tsx` and `BalanceRequestsScreen`; flag if a free-text year input is wanted.
- **Icon export names.** Confirm `RiInboxLine` (admin nav) resolves in `@remixicon/react` before use.
- **Ungated mobile `marginProfit`.** `HeaderMenuDrawer.tsx` renders "Margen de ganancia" unconditionally while `Aside.tsx` gates it to admins — a pre-existing asymmetry. This story threads `isAdmin` into the drawer but deliberately leaves that entry alone (it traces to no AC here). Say the word and it becomes a one-line fix in Phase 4.

**Out of scope (per research):**

- Story 5 entirely: the email deep link, the full-page `/dashboard/requests/{requestId}` route, the single-request admin fetch (`GET /balance/requests/admin/{requestId}`), the `Volver al panel de control` back button, and unauthenticated-redirect / unauthorized-screen behavior. Story 4 only makes the decision UI reusable.
- Admin filtering by user (the endpoint has no server-side user filter) and status filters beyond `pending`/`all`.
- Changing or optimistically updating any balance value; pushing updates into the requesting user's separate open session.
- New dependencies, a state store, a service layer, a query-key factory, or a shared role hook.
- Normalizing unrelated API route response/error shapes, including the guides-db flatten-to-`400` behavior.
