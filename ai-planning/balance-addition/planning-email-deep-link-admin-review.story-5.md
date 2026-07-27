# Implementation Plan: Email Deep Link To A Full-Page Admin Review

**Story of epic:** `ai-research/add-balance.epic.md` (Story 5, `add-balance.epic.md:154-179`)
**Source research:** `ai-research/balance-addition/email-deep-link-admin-review.story-5.md`
**Research sign-off:** Complete. Every recorded Open Question (Backend I–IV, UI I–VII, Authorization I–V) is `answered`, and the User-Confirmed Decisions block records the standalone-page, return-URL, success-panel, back-label, and component-reuse calls. The three comps (`comps/story-5-email-deep-link-comp*.png`) resolve the visual layout.
**Planning date:** 2026-07-24
**Epic status:** last story of the epic; Stories 1, 2, 3, 4, and 6 are shipped.

## Assumptions

- `GET /balance/requests/admin/{requestId}` is served from `BACKEND_URI`, accepts the existing bearer token, and enforces the admin role against the database. Success is `200 { version, data: { request }, message: null, error: null }` with the existing `AdminBalanceRequestDto` shape (Backend Open Question I).
- A missing request **and a malformed ObjectId** both return a **flat** `404` KraftError `{ code: 'BAL_NF_001', message, technicalDetails, statusCode }` — top level, not nested under `error` (Backend Open Question II). No frontend ID-format validation is therefore needed.
- An authenticated non-admin returns an **enveloped** `403 { version, data: null, message: null, error: { message: 'Forbidden', statusCode: 403 } }` from Nest's `RolesGuard` — generic English, no `code` field. Never surfaced to the user (Backend Open Question III).
- Decided requests populate `decisionReason`/`decisionAt`/`adminInCharge`; `cancelled` leaves those `undefined`/`null` because the owner cancelled it and no admin was assigned (Backend Open Question IV). `AdminBalanceRequestDto` already models all of them; no DTO change.
- Balance BFF routes preserve upstream status and body verbatim (they never flatten to `400` like the guides-db routes). Missing token stays local `400 { message: 'missing access token' }`. `404` in particular must survive as `404`.
- `BalanceDecisionForm` is mounted unchanged. Its existing `['balance', 'requests']` + `['balance']` invalidation is what refetches this page, because the detail key nests under the `['balance', 'requests']` prefix. No new cache wiring satisfies AC5.
- The backend builds the email CTA as `FRONTEND_URI` + `/dashboard/requests/{requestId}`. The frontend's only obligation is keeping that path stable; the email template itself is backend work.
- `NEXT_PUBLIC_BUSINESS_TIMEZONE=America/Mexico_City` is already enforced by Story 6. No dependency, lockfile, or env change is expected.

### Comp-driven display decisions

`comps/story-5-email-deep-link-comp.png` (pending), `-decision-taken.png`, `-unauthorized.png` fix:

- Back link `‹ Volver a solicitudes` above an eyebrow `REVISIÓN ADMINISTRATIVA`, `h1` `Detalle de solicitud`, subtitle `Revisa la información antes de registrar una decisión.`
- One card: `Monto solicitado` over the amount with a small `MXN` suffix and the status badge top-right; `Información de la solicitud` as a two-column grid (`ID de solicitud` / `Creada`, `Usuario` name-over-email, `Última actualización` / `Admin a cargo`); then `Registrar decisión` with subtitle `Selecciona una acción para continuar.` and the two decision buttons.
- Decision-taken: the card is replaced by a success panel — check icon, `Decisión registrada`, a confirmation line, primary back action and secondary `Ver solicitud actualizada`.
- Unauthorized: lock icon, `Acceso no autorizado`, the epic copy folded into one paragraph, single `Volver al panel` action.

Deliberate divergences from the comps, all user-confirmed in research:

- **No dashboard sidebar.** All three comps render `Aside`; the page stays standalone. The chrome lives inside the client-only `Dashboard` component and extracting it is follow-up work. The unauthorized comp is itself evidence the chrome is not binding — it shows the **admin** sidebar on a screen only non-admins reach.
- **Back label is `Volver al panel` → `/dashboard`**, not `Volver a solicitudes`. The admin queue is local `Dashboard` state with no URL. Same relabel for the success panel's primary action.
- **`BalanceDecisionForm` is reused unchanged**, accepting that the comp inverts its button order and colors.
- **`SOL-2098`** in the comp's `ID de solicitud` row and success body is a placeholder; the backend returns the opaque ObjectId. The success body ships without an ID interpolation (research specifies a generic confirmation line).

## Acceptance Criteria

1. `/dashboard/requests/{requestId}` exists as an App Router page that takes the opaque request ID from the URL and loads that one request through an authenticated Next route handler proxying `GET /balance/requests/admin/{requestId}` — not by scanning a page of the monthly admin list.
2. An authenticated admin sees the request detail (zero-safe MXN amount, Spanish status, timezone-correct timestamps, user name/email, payment reference and admin in charge when present) and, only while the request is `pending`, the approve/reject decision controls; `approved`, `rejected`, and `cancelled` requests render read-only, and a missing request renders a not-found state with no actionable controls.
3. Unauthenticated access redirects to the login route preserving `/dashboard/requests/{requestId}` as the post-login destination; after a successful login the admin lands back on that URL. Only same-origin dashboard paths are accepted as return destinations.
4. A loaded non-admin user sees the Spanish unauthorized screen with a `Volver al panel` action; the frontend gate is presentation only and the backend remains the authorization source of truth for both retrieval and decisions.
5. After a successful approve or reject from this page, the admin stays on the same URL and sees a `Decisión registrada` confirmation panel with a back-to-dashboard action and a `Ver solicitud actualizada` action that reveals the refetched read-only decided detail; the request lists and current balance are invalidated so authoritative state is refetched elsewhere, and a conflict never reaches the confirmation panel.

## Delivery Sequence

1. **Phase 1 — Shared contract:** single-request response envelope, flat-404 error type, route/param constants, page copy, the single-request callback, the shared timestamp formatter, and the return-URL sanitizer. Type-check only.
2. **Phase 2 — Single-request admin BFF route:** `GET /api/balance/requests/admin/[requestId]` with the defensive admin guard and status-preserving proxying, plus focused route tests.
3. **Phase 3 — Balance detail surface:** the client detail component (loading / error / not-found / pending / read-only / success-panel states) and the unauthorized panel, plus focused feature tests.
4. **Phase 4 — Server page boundary:** `src/app/dashboard/requests/[requestId]/page.tsx` resolving the four auth cases, plus boundary tests.
5. **Phase 5 — Login return-URL plumbing and final verification:** `src/app/page.tsx`, `Login`, `LoginCard`, sanitizer tests, doc update, full build/lint/test.

Phase 2 depends on Phase 1's envelope type. Phase 3 depends on Phases 1–2. Phase 4 depends on Phase 3. Phase 5 depends on Phase 1's sanitizer and constants only, so it can be built in parallel with 2–4 but is verified last because it completes AC3.

## Affected Files

### `src/app/**`

- Create `src/app/dashboard/requests/[requestId]/page.tsx` (async server component).
- Create `src/app/api/balance/requests/admin/[requestId]/route.ts` (`GET`).
- Modify `src/app/page.tsx` (optional `searchParams` read + sanitized redirect/prop).

### `src/features/**`

- Create `src/features/Balance/BalanceAdminRequestDetail.tsx`.
- Create `src/features/Balance/BalanceRequestUnauthorized.tsx`.
- Modify `src/features/Balance/BalanceAdminRequestDrawer.tsx` (use the shared timestamp formatter and the promoted read-only copy constant; no behavior change).
- Modify `src/features/Login/Login.tsx` and `src/features/Login/LoginCard.tsx` (optional `returnUrl`).

### `src/shared/**`

- Modify `src/shared/types/balance.types.ts`.
- Modify `src/shared/utils/balance.utils.ts`.
- Modify `src/shared/utils/global.utils.ts`.
- Modify `src/shared/constants/global.constants.ts`.
- Modify `src/shared/constants/balance.constants.ts`.

### `__tests__/**`

- Create `__tests__/api/balance.requests.admin.detail.route.test.ts`.
- Create `__tests__/feature/Balance/BalanceAdminRequestDetail.test.tsx`.
- Create `__tests__/feature/Balance/BalanceRequestDetailPage.test.tsx`.
- Create `__tests__/shared/utils/global.utils.test.ts`.
- Modify `__tests__/feature/Login/LoginCard.test.tsx`.
- Modify `__tests__/home.test.tsx`.

### Docs

- Modify `REPO_CONTEXT.md` (route inventory row + two verified gotchas).

### Deliberately Unchanged

- `src/features/Balance/BalanceDecisionForm.tsx` — mounted verbatim. No variant prop, no button reordering, no recolouring.
- `src/features/Balance/BalanceAdminScreen.tsx`, `BalanceAdminRequestCard.tsx`, `BalanceRequestsScreen.tsx`, `BalanceRequestCard.tsx`, `BalanceRequestDialog.tsx`, `BalanceDisplay.tsx`.
- `src/app/api/balance/route.ts`, `src/app/api/balance/requests/route.ts`, `src/app/api/balance/requests/admin/route.ts`, `src/app/api/balance/requests/[requestId]/{cancel,decision}/route.ts`.
- `src/app/dashboard/page.tsx`, `src/features/Dashboard/Dashboard.tsx`, `src/shared/ui/organisms/{Aside,HeaderMenuDrawer,LoginRequiredModal}.tsx` — no dashboard layout, no shell extraction, no modal replacement.
- `src/shared/utils/date.utils.ts` — no new export; the shared formatter composes the two existing ones.
- `src/features/QueryProviderWrapper.tsx` — the root layout already provides it to this nested page.
- `package.json`, `pnpm-lock.yaml`, env vars, `DESIGN.md`, backend code (email template, `FRONTEND_URI` composition).

## Phase 1: Shared Contract (Types, Constants, Utils)

### Changes Required

#### `src/shared/types/balance.types.ts`

**Action:** Modify — append after `BalanceDecisionConflictError`. Reuse `AdminBalanceRequestDto` unchanged.

```ts
// Single-request admin lookup mirrors create/cancel/decision success (data.request).
export interface GetAdminBalanceRequestResponse {
  version: string
  data: { request: AdminBalanceRequestDto }
  message: null
  error: null
}

// The single-request 404 body is FLAT like the decision 409, but its code uses
// underscores (BAL_NF_001) where the conflict uses hyphens (BAL-BUS-002).
export interface BalanceRequestNotFoundError {
  code: string
  message: string
  technicalDetails: object | null
  statusCode: number
}
```

- No change to `AdminBalanceRequestDto`; the conditional/nullable fields already cover decided and cancelled requests.
- `BalanceRequestNotFoundError` exists so the detail query's error generic is typed (no `any`/`unknown`) and so the flat-vs-enveloped divergence is documented at the type level. Branch on HTTP status first; if a code is read, compare the exact literal.

#### `src/shared/constants/global.constants.ts`

**Action:** Modify — add to the `// Routes` block (after `DASHBOARD_ROUTE`, line 30).

```ts
export const DASHBOARD_REQUESTS_ROUTE = "/dashboard/requests";

/** Stable email-deep-link destination. Changing this breaks already-sent emails. */
export const buildBalanceRequestDetailRoute = (requestId: string): string =>
  `${DASHBOARD_REQUESTS_ROUTE}/${encodeURIComponent(requestId)}`;

/** Post-login return destination carried through the login route. */
export const LOGIN_REDIRECT_PARAM = "redirect";
```

- No new API endpoint constant: the callback derives its URL from the existing `BALANCE_REQUESTS_ADMIN_API_ENDPOINT`.

#### `src/shared/constants/balance.constants.ts`

**Action:** Modify — append a detail-page block. Reuse `BALANCE_ADMIN_DRAWER_TITLE` (`'Detalle de solicitud'`) as the `h1`, `BALANCE_ADMIN_DRAWER_INFO_TITLE`, `BALANCE_FIELD_AMOUNT`, `BALANCE_FIELD_CREATED`, `BALANCE_FIELD_PAYMENT_REFERENCE`, `BALANCE_FIELD_DECISION_REASON`, `BALANCE_ADMIN_FIELD_*`, `BALANCE_ADMIN_ADMIN_UNASSIGNED`, `BALANCE_STATUS_LABELS`, `BALANCE_STATUS_BADGE_COLOR`, and every `BALANCE_DECISION_*` string. Do not duplicate any of them.

```ts
// Admin request detail page copy (comps/story-5-email-deep-link-comp.png).
export const BALANCE_DETAIL_EYEBROW = 'Revisión administrativa';
export const BALANCE_DETAIL_SUBTITLE = 'Revisa la información antes de registrar una decisión.';
export const BALANCE_DETAIL_DECISION_SUBTITLE = 'Selecciona una acción para continuar.';
export const BALANCE_DETAIL_BACK_ACTION = 'Volver al panel';

// Promoted out of BalanceAdminRequestDrawer, which inlined this sentence.
export const BALANCE_DETAIL_READ_ONLY_MESSAGE =
  'Esta solicitud ya fue decidida y no admite más acciones.';

// Detail states.
export const BALANCE_DETAIL_LOADING_MESSAGE = 'Cargando solicitud de saldo...';
export const BALANCE_DETAIL_ERROR_TITLE = 'No pudimos cargar la solicitud';
export const BALANCE_DETAIL_ERROR_BODY =
  'Ocurrió un problema al consultar la información. Revisa tu conexión e inténtalo de nuevo.';
export const BALANCE_DETAIL_ERROR_RETRY = 'Reintentar';
export const BALANCE_DETAIL_NOT_FOUND_TITLE = 'Solicitud no encontrada';
export const BALANCE_DETAIL_NOT_FOUND_BODY =
  'La solicitud no existe o ya no está disponible. Revisa el enlace del correo o vuelve al panel principal.';

// Post-decision success panel (comps/story-5-email-deep-link-comp-decision-taken.png).
export const BALANCE_DETAIL_SUCCESS_TITLE = 'Decisión registrada';
export const BALANCE_DETAIL_SUCCESS_BODY =
  'La solicitud se actualizó correctamente y ya está disponible en la cola administrativa.';
export const BALANCE_DETAIL_SUCCESS_VIEW_ACTION = 'Ver solicitud actualizada';

// Unauthorized screen (comps/story-5-email-deep-link-comp-unauthorized.png + epic copy).
export const BALANCE_UNAUTHORIZED_TITLE = 'Acceso no autorizado';
export const BALANCE_UNAUTHORIZED_BODY =
  'No tienes acceso a esta solicitud. Esta página está disponible únicamente para administradores. Inicia sesión con una cuenta de administrador o vuelve al panel principal.';
```

- The eyebrow renders uppercase via Tailwind (`uppercase tracking-wide`, as in `BalanceAdminScreen`), so the constant keeps sentence case and the accessible text stays `Revisión administrativa`.
- Do **not** render the backend's `No se encontro la solicitud de saldo.` (missing accent) — the frontend owns this copy.

#### `src/shared/utils/balance.utils.ts`

**Action:** Modify — add the single-request callback and promote the drawer's local timestamp composition into a shared export. Leave every existing callback and `formatBalanceMxn` untouched.

```ts
export const getAdminBalanceRequestCb = async (
  requestId: string
): Promise<AdminBalanceRequestDto> => {
  const response: AxiosResponse<GetAdminBalanceRequestResponse> = await axios.get(
    `${BALANCE_REQUESTS_ADMIN_API_ENDPOINT}/${encodeURIComponent(requestId)}`
  )
  return response.data.data.request
}

/** `22 jul 2026 · 10:42 am` — the drawer's composition, now shared with the detail page. */
export const formatBalanceDetailTimestamp = (timestamp: string): string => {
  const date = formatBusinessDateShort(timestamp)
  if (date === '--') return BALANCE_DECISION_NONE

  return `${date} · ${formatDateToSpanish(timestamp).time}`
}
```

- New imports here: `formatBusinessDateShort` / `formatDateToSpanish` from `@/shared/utils/date.utils` and `BALANCE_DECISION_NONE` from `@/shared/constants/balance.constants`. No cycle: `balance.constants.ts` imports only types.
- **Rationale:** two components now need the identical `date · time` composition. Sharing one export keeps `date.utils.ts` the single timezone boundary with no new export there, and avoids a third date format.

#### `src/features/Balance/BalanceAdminRequestDrawer.tsx`

**Action:** Modify — delete the local `formatDetailTimestamp` helper and the inlined read-only sentence; import `formatBalanceDetailTimestamp` from `@/shared/utils/balance.utils` and `BALANCE_DETAIL_READ_ONLY_MESSAGE` from `@/shared/constants/balance.constants`. Rendered output is byte-identical; `BALANCE_DECISION_NONE`, `formatBusinessDateShort`, and `formatDateToSpanish` imports drop out of this file.

**Rationale:** the promoted constant is required by the detail page anyway, and leaving a duplicate string plus a duplicate helper in the drawer is the drift this story is best positioned to close. No behavior change, so `BalanceAdminScreen.test.tsx` (which asserts visible text) stays green unmodified.

#### `src/shared/utils/global.utils.ts`

**Action:** Modify — append the shared open-redirect guard. Import `DASHBOARD_ROUTE` from `@/shared/constants/global.constants`.

```ts
/**
 * Only same-origin dashboard paths survive as post-login destinations. Everything
 * else (protocol-relative, backslash-smuggled, scheme-bearing, or off-dashboard)
 * falls back to the dashboard, so `?redirect=` can never become an open redirect.
 */
export const sanitizeDashboardReturnUrl = (
  value: string | string[] | undefined | null
): string => {
  if (typeof value !== 'string') return DASHBOARD_ROUTE

  const candidate = value.trim()
  if (!candidate.startsWith('/')) return DASHBOARD_ROUTE
  if (candidate.startsWith('//') || candidate.startsWith('/\\')) return DASHBOARD_ROUTE
  if (/[a-z][a-z0-9+.-]*:/i.test(candidate)) return DASHBOARD_ROUTE
  if (candidate !== DASHBOARD_ROUTE && !candidate.startsWith(`${DASHBOARD_ROUTE}/`)) {
    return DASHBOARD_ROUTE
  }

  return candidate
}
```

- Rejecting a repeated `searchParams` key (`string[]`) rather than picking one is deliberate: an attacker-supplied duplicate must not decide the destination.
- The scheme check also rejects any colon in the path. Mongo ObjectIds are hex, so no legitimate deep link contains one.
- **Placed in `global.utils.ts`, not `login.utils.ts`:** this file already holds cross-domain pure helpers, and `login.utils.ts` is entirely axios callbacks — importing it into a server component would pull axios in for nothing.

### Success Criteria

- **Automated:** `pnpm exec tsc --noEmit`, plus `pnpm test -- __tests__/feature/Balance/BalanceAdminScreen.test.tsx` to prove the drawer refactor changed no rendered output.
- **Manual:** none.

### Test Coverage

Sanitizer coverage lands in Phase 5 with the rest of the return-URL work. Types, constants, and the callback are covered indirectly by Phases 2–4.

## Phase 2: Single-Request Admin BFF Route

### Changes Required

#### `src/app/api/balance/requests/admin/[requestId]/route.ts`

**Action:** Create — `GET`. Combine the `_request` + `encodeURIComponent` dynamic-param shape of `src/app/api/balance/requests/[requestId]/cancel/route.ts` with the `getUserInfo()` admin guard used by the two sibling admin routes.

- Signature: `export async function GET(_request: NextRequest, context: { params: { requestId: string } }): Promise<NextResponse>`.
- Check order: token (local `400`) → admin guard (`403`) → missing `requestId` (local `400`) → upstream.

```ts
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

const requestId = context?.params?.requestId
if (!requestId) {
  return NextResponse.json({ message: 'missing requestId' }, { status: 400 })
}

const uri = `${process.env.BACKEND_URI}/balance/requests/admin/${encodeURIComponent(requestId)}`
const response: AxiosResponse<GetAdminBalanceRequestResponse> = await axios.get(uri, {
  headers: { Authorization: `Bearer ${accessToken}` }
})

return NextResponse.json(response.data, { status: response.status })
```

- `catch`: `axios.isAxiosError(error) && error.response` → `NextResponse.json(error.response.data, { status: error.response.status })`; otherwise `NextResponse.json({ message: 'Failed to fetch admin balance request' }, { status: 500 })`.

**Edge cases:**

- Preserving `404` verbatim is load-bearing: the client branches on it to render the not-found state instead of the generic error. Do not collapse non-2xx to `400` the way the guides-db routes do.
- The static `admin` segment resolves ahead of the sibling `[requestId]` folder, so this file coexists with `/api/balance/requests/[requestId]/{cancel,decision}` with no conflict. The only shadowed case is a literal request ID of `admin`, unreachable with Mongo ObjectIds — and the reason the handler nests under `admin/` rather than reusing the existing `[requestId]` folder.
- `requestId` is untrusted URL input; `encodeURIComponent` before interpolating into the upstream URL.
- `getUserInfo()` reads the non-authoritative `user-info` cookie. It is a secondary control only, which the `// ponytail:` comment must say; the backend's database role check stays mandatory. This becomes the fourth Next-side role-guarded BFF route.

### Success Criteria

- **Automated:** `pnpm test -- __tests__/api/balance.requests.admin.detail.route.test.ts`.
- **Manual:** none.

### Test Coverage

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `src/app/api/balance/requests/admin/[requestId]/route.ts` | GETs `${BACKEND_URI}/balance/requests/admin/{encoded id}` with the bearer header and returns the upstream body/status; missing token → local `400` without calling upstream; non-admin caller → `403` without calling upstream; missing `user-info` → `403`; flat `404 BAL_NF_001` body and status preserved verbatim; enveloped `403 Forbidden` body preserved verbatim; `401` preserved; transport failure → local `500 { message: 'Failed to fetch admin balance request' }` | `__tests__/api/balance.requests.admin.route.test.ts` — `@jest-environment node`, `jest.mock('axios')`, the `NextResponse.json` stub, and the `jest.mock('../../src/shared/lib/auth.lib', () => ({ getAccessToken: jest.fn(), getUserInfo: jest.fn() }))` factory |

- Build the request with `new NextRequest('http://localhost/api/balance/requests/admin/req-1')` and pass the id through `context` as `{ params: { requestId } }`; use an id needing encoding (e.g. `req/with space` → `req%2Fwith%20space`) to prove `encodeURIComponent`.
- Type the fixtures with `GetAdminBalanceRequestResponse`, `BalanceRequestNotFoundError`, and `LoginData`. The `403` fixture is the **enveloped** shape (`{ version, data: null, message: null, error: { message: 'Forbidden', statusCode: 403 } }`); the `404` fixture is **flat** with `code: 'BAL_NF_001'`. No `any`/`unknown`.
- Existing balance route tests stay unchanged and passing.

## Phase 3: Balance Detail Surface And Unauthorized Panel

### Changes Required

#### `src/features/Balance/BalanceRequestUnauthorized.tsx`

**Action:** Create — presentational, **no `'use client'`** (no hooks, no browser APIs) so the server page can render it directly.

```ts
export const BalanceRequestUnauthorized = (): JSX.Element
```

- `<main>` wrapper, centered card: a lock glyph (`RiLockLine` from `@remixicon/react`) in a soft red circle, `h1` with `BALANCE_UNAUTHORIZED_TITLE`, one paragraph with `BALANCE_UNAUTHORIZED_BODY`, and a single primary `LinkButton href={DASHBOARD_ROUTE}` labelled `BALANCE_DETAIL_BACK_ACTION`.
- Wrap the heading + body in a `role="alert"` container, mirroring the error-panel idiom in `BalanceAdminScreen`.
- Both epic strings are kept: the comp promotes `Acceso no autorizado` to the heading and folds the epic's bold title into the body's first sentence.
- No request fetch, no props. It renders only for a loaded non-admin, never for an unauthenticated visitor.

#### `src/features/Balance/BalanceAdminRequestDetail.tsx`

**Action:** Create — `'use client'`. Owns the single-request query, all four load states, and the post-decision view state.

```ts
interface BalanceAdminRequestDetailProps {
  requestId: string
}
```

Query and local state:

```ts
const [showSuccessPanel, setShowSuccessPanel] = useState(false)

const { data, isPending, isError, error, refetch } = useQuery<
  AdminBalanceRequestDto,
  AxiosError<BalanceRequestNotFoundError>
>({
  queryKey: ['balance', 'requests', 'admin', requestId],
  queryFn: () => getAdminBalanceRequestCb(requestId)
})

const isNotFound = error?.response?.status === 404
```

- The key nests under the `['balance', 'requests']` prefix that `BalanceDecisionForm` already invalidates, so the decided detail refetches with no extra wiring (AC5).
- Branch on HTTP status, never on a shared "read `data.code`" helper — the `403` body has no `code` field at all.

Render structure:

1. **Back link, always first and always available** (including while loading): a `next/link` to `DASHBOARD_ROUTE` with a leading `RiArrowLeftSLine` and the text `BALANCE_DETAIL_BACK_ACTION`.
2. **Header block** — eyebrow `BALANCE_DETAIL_EYEBROW`, `h1` `BALANCE_ADMIN_DRAWER_TITLE`, subtitle `BALANCE_DETAIL_SUBTITLE`. Rendered in every state **except** the success panel, matching the comp.
3. **`showSuccessPanel === true`** → success card only: a check glyph (`RiCheckLine`) in a soft green circle, `BALANCE_DETAIL_SUCCESS_TITLE` as a heading, `BALANCE_DETAIL_SUCCESS_BODY`, then a primary `LinkButton href={DASHBOARD_ROUTE}` labelled `BALANCE_DETAIL_BACK_ACTION` and a secondary `Button` labelled `BALANCE_DETAIL_SUCCESS_VIEW_ACTION` whose `onClick` sets `showSuccessPanel` back to `false`.
4. **`isPending`** → a skeleton card inside `role="status" aria-live="polite"` with an sr-only `BALANCE_DETAIL_LOADING_MESSAGE`. Reuse the `animate-pulse` block idiom from `BalanceRequestCardSkeleton`; no fabricated field values.
5. **`isError && isNotFound`** → not-found panel: `BALANCE_DETAIL_NOT_FOUND_TITLE` + `BALANCE_DETAIL_NOT_FOUND_BODY` in a `role="alert"` container, with the back action and **no** retry button and no decision controls.
6. **`isError && !isNotFound`** → generic error panel: `BALANCE_DETAIL_ERROR_TITLE` + `BALANCE_DETAIL_ERROR_BODY` in `role="alert"`, plus a `BALANCE_DETAIL_ERROR_RETRY` button calling `refetch()`.
7. **Populated** → one card:
   - Amount block: `BALANCE_FIELD_AMOUNT` label above `formatBalanceMxn(request.amount)` with a small `MXN` suffix (zero renders `$0.00`), and the status `Badge` using `BALANCE_STATUS_BADGE_COLOR[status]` / `BALANCE_STATUS_LABELS[status]` top-right.
   - `BALANCE_ADMIN_DRAWER_INFO_TITLE` section as a two-column responsive grid: `BALANCE_ADMIN_FIELD_REQUEST_ID` → `request.id`, `BALANCE_FIELD_CREATED` → `formatBalanceDetailTimestamp(request.createdAt)`, `BALANCE_ADMIN_FIELD_USER` → `userName` over `userEmail`, `BALANCE_ADMIN_FIELD_UPDATED` → `formatBalanceDetailTimestamp(request.updatedAt)`, `BALANCE_ADMIN_FIELD_ADMIN_IN_CHARGE` → `adminInCharge ?? BALANCE_ADMIN_ADMIN_UNASSIGNED`.
   - Conditional rows, rendered only when the value is present so absent data never shows a blank: `BALANCE_FIELD_PAYMENT_REFERENCE` → `request.paymentReference`, and `BALANCE_FIELD_DECISION_REASON` → `request.decisionReason` when `status !== 'pending'`. No payment-reference row while pending, per the conditional-field contract and the comp.
   - Decision section: when `status === 'pending'`, a heading-free wrapper rendering `BALANCE_DETAIL_DECISION_SUBTITLE` above `<BalanceDecisionForm requestId={request.id} onDecided={() => setShowSuccessPanel(true)} />` — the component supplies its own `Registrar decisión` heading, so do not add a second one. Otherwise render `BALANCE_DETAIL_READ_ONLY_MESSAGE` and no decision controls.

**Edge cases:**

- `BalanceDecisionForm` calls `onDecided` only inside its mutation's `onSuccess`, so a flat `409 BAL-BUS-002` conflict renders its in-form alert and **never** reaches the success panel (AC5). No conflict handling is added here.
- `Ver solicitud actualizada` returns to the same URL's detail; the data comes from the invalidation-driven refetch, not from a mutation return value. If the refetch is still in flight the previous (pending) card can flash for a moment before the decided one renders — acceptable, and never an optimistic edit.
- Reuse `BALANCE_FIELD_DECISION_REASON` (`'Razón de la cancelación'`) as-is for consistency with the drawer. Relabelling it is out of scope.
- Standalone page: no dashboard `ThemeProvider`. Flowbite `Badge`/`Button` render fine without one, and the page uses no `Drawer`, so the dashboard's `createTheme` white-header override is irrelevant here.
- `request.id` is interpolated as text only, never as markup or a URL fragment.
- Pass raw UTC ISO strings to the formatter; never mutate stored timestamps.

### Success Criteria

- **Automated:** `pnpm test -- __tests__/feature/Balance/BalanceAdminRequestDetail.test.tsx`.
- **Manual:** deferred to Phase 5 (the route is not reachable until Phase 4).

### Test Coverage

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `__tests__/feature/Balance/BalanceAdminRequestDetail.test.tsx` | loading shows `role="status"` with no fabricated fields; a `pending` request renders amount + `Pendiente` + id + user name/email + timezone-correct `Creada`/`Última actualización` + `Sin asignar`, and shows `Aprobar solicitud`/`Rechazar solicitud`; `approved` renders its payment reference and deciding admin with **no** approve/reject controls plus the read-only sentence; `rejected` renders its decision reason read-only; `cancelled` renders `Sin asignar` with no decision-reason row and no controls; a `404` renders the not-found state (distinct copy, no `Reintentar`) for both a well-formed unknown id and a malformed one; a non-`404` failure renders the error state and `Reintentar` refetches; a successful approve renders the `Decisión registrada` panel and `Ver solicitud actualizada` then reveals the refetched decided read-only detail; a flat `409 BAL-BUS-002` shows the conflict message and never reaches the success panel; the request lists and `['balance']` are invalidated after a decision; `Volver al panel` points at `/dashboard` and is present in every state | Fresh retry-disabled `QueryClient` + `QueryClientProvider` and the axios-by-URL routing helper from `__tests__/feature/Balance/BalanceRequestsScreen.test.tsx`; router wrapper from `__tests__/home.test.tsx` |

- Mock only `axios`. Render the real `BalanceDecisionForm` — do not mock it or any other internal component.
- Route `axios.get` by URL so `/api/balance/requests/admin/{id}` can return a different payload per call (first `pending`, then `approved`) to prove the post-decision refetch.
- `404` fixture: `mockRejectedValue({ response: { status: 404, data: { code: 'BAL_NF_001', message: '…', technicalDetails: null, statusCode: 404 } } })` — flat. `409` fixture on `axios.patch`: flat `BAL-BUS-002`, mirroring `BalanceAdminScreen.test.tsx`.
- Invalidation: spy `invalidateQueries` on the fresh client, or seed `['balance']` and assert it refetches.
- Timezone: `jest.useFakeTimers`/`setSystemTime` at an instant whose browser-local date differs from the Mexico City date (e.g. a `createdAt` of `2026-02-01T05:59:59.999Z` must render as January). Keep the real `date.utils.ts` helpers; never mock `Intl`, Luxon, or `BUSINESS_TIMEZONE`.
- `userEvent` only; query by role, accessible name, label, or visible text. No `container`/`querySelector`, no CSS or icon assertions. Type every fixture with `AdminBalanceRequestDto` / `GetAdminBalanceRequestResponse`; no `any`/`unknown`.
- The unauthorized panel needs no dedicated file — it is asserted through the page boundary test in Phase 4, where it actually renders.

## Phase 4: Server Page Boundary

### Changes Required

#### `src/app/dashboard/requests/[requestId]/page.tsx`

**Action:** Create — async server component. It owns the entire auth boundary for this route; there is no `src/app/dashboard/layout.tsx`, so it inherits only the root layout (fonts, theme attribute, `QueryProviderWrapper`) and must do its own cookie read.

```tsx
export default async function BalanceRequestDetailPage({
  params
}: {
  params: { requestId: string }
}): Promise<JSX.Element> {
  const [accessToken, userInfo] = await Promise.all([getAccessToken(), getUserInfo()])

  if (!accessToken) {
    const returnUrl = buildBalanceRequestDetailRoute(params.requestId)
    redirect(`${LOGIN_ROUTE}?${LOGIN_REDIRECT_PARAM}=${encodeURIComponent(returnUrl)}`)
  }

  const isAdmin = Array.isArray(userInfo?.data?.user?.role) && userInfo.data.user.role.includes('admin')
  if (!isAdmin) {
    return <BalanceRequestUnauthorized />
  }

  return <BalanceAdminRequestDetail requestId={params.requestId} />
}
```

The four cases from research, all resolved before anything renders:

1. **No access token** → server `redirect()` to `/?redirect=%2Fdashboard%2Frequests%2F{id}`. `LOGIN_ROUTE` is `/`, so the template yields exactly that. Not `LoginRequiredModal`: it is dismissible and carries no return URL.
2. **Token present, loaded non-admin** → `BalanceRequestUnauthorized`. No request fetch is attempted.
3. **Token present, `user-info` missing or unparseable** → `getUserInfo()` returns `null`, treated as non-admin. Failing closed is the correct default; the BFF guard would reject the fetch anyway.
4. **Token present and admin** → the client detail component, receiving only `requestId`.

**Edge cases:**

- Cookies are read only here; the client component receives nothing sensitive and talks only to `/api/**`.
- The unauthenticated and unauthorized states answer different questions and must not be collapsed — the frontend cannot know a visitor's role before authentication.
- The route path is the integration contract with the backend email. Changing it later breaks already-sent emails.
- The page renders no `Aside`/`HeaderMenuMobile` and adds no `layout.tsx`; both child components own their own `<main>`.

### Success Criteria

- **Automated:** `pnpm test -- __tests__/feature/Balance/BalanceRequestDetailPage.test.tsx`.
- **Manual:** with `pnpm dev`, open `/dashboard/requests/<a real pending request id>` as an admin and confirm the detail renders; sign out and reopen the same URL to confirm the browser lands on `/?redirect=%2Fdashboard%2Frequests%2F<id>`.

### Test Coverage

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `__tests__/feature/Balance/BalanceRequestDetailPage.test.tsx` | no token → `redirect` called with `/?redirect=` + the encoded request URL, and nothing rendered/fetched; admin `userInfo` → the detail heading renders and the admin detail endpoint is called with the request id; non-admin `userInfo` → `Acceso no autorizado`, its `Volver al panel` action, and **no** axios call; `null` `userInfo` (missing/unparseable cookie) → the same unauthorized screen | Await the page function and render its element inside `QueryProviderWrapper` + `AppRouterContextProviderMock`, as `__tests__/home.test.tsx` does |

- Mock `next/navigation` as `{ ...jest.requireActual('next/navigation'), redirect: jest.fn() }` so `Link`/`useRouter` keep working while the redirect is observable.
- Mock `../../../src/shared/lib/auth.lib` (relative path) exposing `getAccessToken` and `getUserInfo` as `jest.fn()`; mock `axios`. Do not mock `BalanceAdminRequestDetail` or `BalanceRequestUnauthorized`.
- Use a request id needing encoding to prove the return URL is encoded once (`encodeURIComponent` over the already-encoded path segment is intentional — assert the exact expected string rather than re-deriving it in the test).
- Type `userInfo` fixtures with `LoginData`, reusing the admin/non-admin shapes from `__tests__/api/balance.requests.admin.route.test.ts`.

## Phase 5: Login Return-URL Plumbing, Docs, Final Verification

### Changes Required

#### `src/app/page.tsx`

**Action:** Modify — read the redirect param, sanitize it once, use it for both the already-authenticated redirect and the login UI prop.

```tsx
interface HomePageProps {
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default async function Home({ searchParams }: HomePageProps = {}) {
  const returnUrl = sanitizeDashboardReturnUrl(searchParams?.[LOGIN_REDIRECT_PARAM])

  const accessToken = await getAccessToken()
  if (accessToken) {
    redirect(returnUrl)
  }

  return <Login returnUrl={returnUrl} />
}
```

- **The props object must stay optional with a `= {}` default.** `__tests__/home.test.tsx` calls `HomePage()` with no arguments; a required destructured parameter would throw there. This is the whole reason for the default.
- `sanitizeDashboardReturnUrl` returns `DASHBOARD_ROUTE` when the param is absent, so the existing behavior (`redirect(DASHBOARD_ROUTE)`) is preserved exactly for a plain visit.
- Reading `searchParams` on the server keeps `useSearchParams` out of the codebase entirely — nothing in `src/` uses it today, and it can force a build-time Suspense boundary in a client component.

#### `src/features/Login/Login.tsx`

**Action:** Modify — accept and forward the value.

```ts
interface LoginProps {
  returnUrl?: string
}
```

- `export const Login = ({ returnUrl }: LoginProps = {})` … pass `returnUrl` straight to `LoginCard`. Optional so `__tests__/feature/Login/Login.test.tsx` keeps rendering `<Login />` unchanged.

#### `src/features/Login/LoginCard.tsx`

**Action:** Modify — add `returnUrl?: string` to `LoginCardProps` and push it **inside the existing one-second `setTimeout`** in the mutation's `onSuccess`:

```ts
onSuccess: () => {
  setTimeout(() => {
    router.push(sanitizeDashboardReturnUrl(returnUrl))
  }, 1000)
}
```

- Must go inside that same callback, not alongside it, or the redirect races the success-check animation.
- Re-sanitizing on the client is deliberate defense in depth: one rule, two call sites, no drift, and a hostile prop can never be pushed.

#### `REPO_CONTEXT.md`

**Action:** Modify — three small additions:

1. An API inventory row: `/api/balance/requests/admin/[requestId]` | `GET` | fetches one balance request from `${BACKEND_URI}/balance/requests/admin/{id}` (URL-encoded); admin-only via the defensive `getUserInfo()` guard; preserves upstream status/body verbatim, notably the **flat** `404 BAL_NF_001` and the **enveloped** `403 Forbidden`.
2. A `src/app/**` note that `/dashboard/requests/[requestId]` is a standalone server page owning its own cookie read and auth boundary, with no `src/app/dashboard/layout.tsx` and no dashboard chrome.
3. A gotcha: Balance now has three backend error shapes across three statuses — flat `404` (`data.code === 'BAL_NF_001'`), enveloped `403` (`data.error.statusCode`, no `code` at all), flat `409` (`data.code === 'BAL-BUS-002'`). The two KraftError codes do not share a separator. Branch on HTTP status first; a shared "read `data.code`" helper silently returns `undefined` for the `403`.

### Success Criteria

- **Automated:**
  - `pnpm test` (crosses API routes, Balance feature, the page boundary, Login, and shared utils; coverage always collected).
  - `pnpm exec tsc --noEmit`.
  - `pnpm lint`.
  - `pnpm build` — confirms no Suspense/`useSearchParams` build error was introduced and the new dynamic page compiles.
- **Manual (desktop + mobile/tablet, light and dark):**
  1. Signed out, open `/dashboard/requests/<pending id>`: the browser lands on the login page with `?redirect=%2Fdashboard%2Frequests%2F<id>`. Log in as an admin and confirm you arrive back on the request detail, not `/dashboard`.
  2. Already signed in as an admin, visit `/?redirect=%2Fdashboard%2Frequests%2F<id>` directly and confirm the immediate redirect to the request.
  3. Visit `/?redirect=https://evil.com`, `/?redirect=//evil.com`, and `/?redirect=/register` and confirm every one lands on `/dashboard`.
  4. As a non-admin, open the deep link: `Acceso no autorizado` with a working `Volver al panel`.
  5. As an admin on a `pending` request: fields, timestamps, and `Sin asignar` render correctly; approve with a payment reference and confirm the `Decisión registrada` panel appears on the same URL; click `Ver solicitud actualizada` and confirm the read-only decided detail; navigate to `/dashboard` → `Solicitudes de saldo` and confirm the queue and the balance card reflect the decision.
  6. Reject another request with a reason and confirm the same flow, then reload the URL and confirm the read-only decided detail renders directly.
  7. Open a request already decided elsewhere, attempt a decision, and confirm the conflict message appears with no success panel.
  8. Open `/dashboard/requests/notarealid` and `/dashboard/requests/abc` (malformed) and confirm both render the not-found state, not the generic error.
  9. Confirm the page has no sidebar and that `Volver al panel` returns to the default dashboard screen.

### Test Coverage

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `__tests__/shared/utils/global.utils.test.ts` | `sanitizeDashboardReturnUrl` accepts `/dashboard` and `/dashboard/requests/{id}`; falls back to `/dashboard` for `undefined`, `null`, an empty string, a `string[]`, `//evil.com`, `https://evil.com`, `/\evil.com`, `javascript:alert(1)`, `evil.com`, and `/register` | `__tests__/shared/utils/date.utils.test.ts` (pure-function table style) |
| `__tests__/feature/Login/LoginCard.test.tsx` | **Modify** — a successful login with `returnUrl="/dashboard/requests/abc"` pushes that path; with no `returnUrl` it still pushes `DASHBOARD_ROUTE` (existing test, unchanged); a hostile `returnUrl` pushes `DASHBOARD_ROUTE` | Existing file's `LoginCardWrapper` + `waitFor(..., { timeout: 2000 })` idiom for the one-second `setTimeout` |
| `__tests__/home.test.tsx` | **Modify** — the existing render assertion stays; add that an authenticated visitor with a sanitized `redirect` param is redirected to it and that a hostile param redirects to `/dashboard` | Add `jest.mock('../src/shared/lib/auth.lib', …)` and a `next/navigation` `redirect` spy; set `getAccessToken` to `''` in `beforeEach` so the existing unauthenticated test keeps passing |

- Extend `LoginCardWrapper` with an optional `returnUrl` prop rather than duplicating the wrapper.
- Do not add a `Login.test.tsx` case for prop forwarding — it is covered end-to-end by the `LoginCard` push assertions.
- Preserve every existing `it.skip()`/`test.skip()` in the touched files.

## Cross-Cutting Concerns

- **Auth/cookies:** cookies are read only in the new server page and the new route handler. The client component receives just `requestId` and calls only `/api/**`. `user-info` is httpOnly JSON and not a security boundary.
- **Defensive authorization:** the `getUserInfo()` guard is a secondary control; the backend's database role check is authoritative for both retrieval and decisions. This is the fourth Next-side role-guarded route — do not retrofit the pattern elsewhere.
- **Upstream status preservation:** `404`, `401`, and `403` must survive verbatim. The `404` in particular drives a distinct UI state, and the two error bodies have incompatible shapes (flat vs enveloped).
- **Three error shapes in one domain:** flat `404 BAL_NF_001` (underscores), enveloped `403` with no `code` field, flat `409 BAL-BUS-002` (hyphens). Branch on HTTP status first; treat codes as exact literals, never parsed patterns.
- **Cache:** the detail key `['balance', 'requests', 'admin', requestId]` nests under the prefix `BalanceDecisionForm` already invalidates, so AC5's refetch is free. `['balance']` is also already invalidated because approval moves money. No optimistic edits to any financial value.
- **Cross-session:** invalidation in the admin's client cannot push anything into the requesting user's open browser; separate `QueryClient`s, out of scope.
- **Staleness:** the request may have been cancelled by its owner or decided by another admin between the email being sent and the link being opened. The page renders whatever status the backend returns, and a stale decision surfaces the preserved `409`.
- **Open-redirect safety:** one sanitizer, two call sites (server page + login card), allowlisted to same-origin `/dashboard` paths.
- **Timezone:** all timestamps render in `America/Mexico_City` through `date.utils.ts` via the shared `formatBalanceDetailTimestamp`. A UTC instant like `2026-02-01T05:59:59.999Z` is January in the business zone.
- **Standalone page:** no `src/app/dashboard/layout.tsx`, no `ThemeProvider`, no `LoginRequiredModal`, no `Aside`. The root layout still supplies `QueryProviderWrapper`, which is what makes the client `useQuery` work.
- **Responsive:** the detail card's two-column grid stacks on mobile via Tailwind only; never asserted in tests.
- **Env:** `BACKEND_URI` is the only upstream variable the new handler uses. `FRONTEND_URI` is consumed by the **backend** email service; deployment of the email change and this route should be coordinated.

## Open Questions / Out-Of-Scope

**No open questions remain.** Research resolved all of them; the decisions this plan adds beyond the research doc are:

- **`formatBalanceDetailTimestamp` is promoted into `balance.utils.ts`** and `BalanceAdminRequestDrawer` is switched to it, instead of duplicating the four-line composition in the new component. No rendered-output change; no new `date.utils.ts` export.
- **The read-only sentence moves to `BALANCE_DETAIL_READ_ONLY_MESSAGE`** and the drawer imports it, closing the last inlined Balance string.
- **The sanitizer lives in `src/shared/utils/global.utils.ts`**, not `login.utils.ts`, so the server page does not pull axios in.
- **The unauthorized panel is a Balance-local component** (`BalanceRequestUnauthorized`), not a `src/shared/ui/organisms/` component — its copy is request-specific and it has exactly one consumer.
- **The success body carries no request ID.** The comp's `SOL-2098` is a placeholder and the real value is an opaque ObjectId, which reads badly in a sentence.
- **`src/app/page.tsx`'s props stay optional with a `= {}` default** because `__tests__/home.test.tsx` invokes the page function with no arguments.

**Out of scope (per research):**

- The backend email template, CTA label, and `FRONTEND_URI` + encoded route composition.
- Rendering the dashboard sidebar/mobile drawer around this page, or extracting the dashboard shell into a layout. The comps' chrome is not adopted; shell alignment is follow-up work.
- Making the admin queue URL-addressable (a `screen` param on `/dashboard`, or reading the written-but-never-read `dashboard-screen` cookie on mount) so the back action could land on `Solicitudes de saldo`.
- Changing `BalanceDecisionForm`'s button order or colors, or adding a variant prop.
- A regular-user route for their own request detail; the route is admin-only.
- Replacing `LoginRequiredModal` on `/dashboard`, or applying the return-URL pattern to any other route.
- Cross-session push of an approval into the requesting user's open browser.
- Relabelling `BALANCE_FIELD_DECISION_REASON`, normalizing unrelated API error shapes, or touching the guides-db flatten-to-`400` behavior.
- New dependencies, a state store, a service layer, a query-key factory, or a shared role hook.
