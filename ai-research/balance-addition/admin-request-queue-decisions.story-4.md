# Admin Request Queue And Decisions Story Research

Story of epic: `ai-research/add-balance.epic.md` (Story 4, `add-balance.epic.md:135-152`).

## Story Definition

### Story Title

Admin balance-request queue and approve/reject decisions.

### Story Description

Give an authenticated admin a paginated, month/year-filterable queue of all users' balance-addition requests from `GET /balance/requests/admin`, with a `pending | all` status filter, plus a detail surface where the admin can approve a `pending` request with a required `paymentReference` or reject it with an optional user-facing reason through `PATCH /balance/requests/{balance-id}/decision`.

This document researches Story 4 from `ai-research/add-balance.epic.md`. Stories 1, 2, 3, and 6 are complete, so the shared Balance types/constants/callbacks, the date/timezone primitives in `src/shared/utils/date.utils.ts`, and the `Order.tsx` month/year + pagination precedent already exist. Story 4 adds the admin-only queue and the single decision flow; Story 5 (email deep link to a full-page `/dashboard/requests/{requestId}`) reuses the decision UX built here.

### Scope Classification

Single-feature story covering the Balance feature (new admin-only surface), its new Next route handlers, shared admin balance types/utilities/constants, dashboard-shell navigation gating, and focused tests.

### Research Mode

Full research, prioritizing the admin list/decision contract, admin role gating (presentation plus a defensive BFF guard), cache/invalidation on decisions, and reuse of the decision UI by Story 5.

### User-Confirmed Decisions

- The admin queue is a **new, admin-only dashboard screen** ("Solicitudes de saldo" per comps), separate from the Story 3 user screen ("Mis solicitudes"). Admins have no balance requests of their own, so this option hits only admin endpoints (`GET /balance/requests/admin`) and is gated to admin users. The Balance nav entries are **mutually exclusive by role**: admins see only "Solicitudes de saldo" (not "Mis solicitudes"), non-admins see only "Mis solicitudes".
- Filters are month, year, and a `Pendientes | Todas` status toggle (`status=pending|all`), committed with an explicit **"Aplicar filtros"** button (per comps), defaulting to the current `America/Mexico_City` month/year. Backend defaults to the current month/year when omitted.
- The queue rows expose a **"Ver detalle"** action that opens a right-side **detail drawer** (per comps). The drawer reuses the already-fetched list-row data; no per-request fetch is added in Story 4 (single-request fetch is Story 5).
- The drawer's "Registrar decisión" section is a segmented flow: two persistent buttons `Aprobar solicitud` / `Rechazar solicitud`, each revealing its own form below. Approve reveals a **required** `Referencia de pago` input; reject reveals an **optional** `Motivo del rechazo` textarea (user-facing). Both call `PATCH /balance/requests/{id}/decision`.
- The reject reason **is surfaced to the requesting user** (via a decision email and the `decisionReason` field in their `GET /balance/requests` history), so the reject copy is user-facing: the admin writes context the user will read.
- The admin list + decision BFF routes carry a **defensive `getUserInfo()` admin guard** (mirroring `/api/guides-db/[kraftId]/hard`), with the backend remaining the authoritative authorization source.
- The decision section is built as a **reusable component** so Story 5's full-page deep-link route can consume it.

### Acceptance Criteria

1. An authenticated admin queries requests with month, year, page, limit, and `status=pending|all`; every server-affecting value is represented in the TanStack Query key, and the query is gated by admin role and the active admin surface.
2. The queue shows request amount (zero-safe MXN), Spanish status, timezone-correct timestamps, user name/email, payment reference when present, and admin in charge when present, retrieved through an authenticated Next route handler that proxies `GET /balance/requests/admin`.
3. For a `pending` request the detail surface presents a positive `Aprobar` action requiring a non-empty `paymentReference` and a negative `Rechazar` action permitting an optional reason; both post to `PATCH /balance/requests/{balance-id}/decision`, and other statuses are read-only.
4. After a successful decision, affected request lists and current balance data are invalidated so authoritative backend state is refetched; the UI never optimistically mutates financial state.
5. Non-admin users do not see the admin queue, its navigation entry, or the decision controls, while the backend remains the authorization source of truth for direct calls; the admin BFF routes additionally apply a defensive Next-side role check.

### Task Breakdown

1. Add admin balance DTOs to `src/shared/types/balance.types.ts`: an admin request item shape (base fields plus always-present `userEmail`/`userName`, nullable `adminInCharge`, and conditional `paymentReference`/`decisionReason`/`decisionAt`; keep all timestamps typed as `string`), admin list params (`month`, `year`, `page`, `limit`, `status`), the admin list response envelope, the `status` filter union (`'pending' | 'all'`), and the decision payload union (`{ action: 'approve'; paymentReference: string } | { action: 'reject'; reason?: string }`).
2. Add `src/app/api/balance/requests/admin/route.ts` (`GET` → `${BACKEND_URI}/balance/requests/admin`, allowlisting `month`, `year`, `page`, `limit`, `status`) and `src/app/api/balance/requests/[requestId]/decision/route.ts` (`PATCH` → `${BACKEND_URI}/balance/requests/{requestId}/decision`, URL-encoded id, forwarding the decision body). Both apply the defensive `getUserInfo()` admin guard and preserve meaningful upstream statuses/bodies.
3. Add browser callbacks in `src/shared/utils/balance.utils.ts`: `getAdminBalanceRequestsCb(params)` and `decideBalanceRequestCb({ requestId, payload })`.
4. Add the admin endpoint constant and admin screen/decision copy (status-filter labels `Pendientes`/`Todas`, drawer field labels, reject-reason copy) in the balance constants modules.
5. Add a new admin `DashboardScreens` value (e.g. `balanceAdmin`) in `src/shared/types/dashboard.types.ts`, wire a conditional render in both branches of `Dashboard.tsx` passing `userInfo`, add an admin-gated `DashboardAsideLink` in `Aside.tsx`, gate the existing user "Mis solicitudes" entry to non-admins (`!isAdmin`), and thread `userInfo`/`isAdmin` into `HeaderMenuDrawer.tsx` so both the admin and user Balance entries are correctly gated on mobile.
6. Build the admin queue screen in `src/features/Balance/`: month/year selects + status toggle + "Aplicar filtros", request cards, pagination, loading/empty/error/populated states, the detail drawer, and a reusable decision component (idle/approve/reject) with the decision mutation.
7. Wire a `useQuery` keyed on `['balance', 'requests', 'admin', month, year, page, limit, status]` (enabled by `isAdmin` and the active surface) and a decision `useMutation` that on success invalidates `['balance', 'requests']` and `['balance']`.
8. Add focused route and feature coverage (see Testing Rules).

### Out Of Scope

- The email deep link and the full-page `/dashboard/requests/{requestId}` route, the single-request admin fetch (`GET /balance/requests/admin/{requestId}`), the `Volver al panel de control` back button, unauthenticated-redirect and unauthorized-screen behavior — all Story 5. Story 4 only makes the decision UI reusable by Story 5.
- Admin filtering by user (deferred; the endpoint has no server-side user filter).
- Admin status filters beyond `pending` and `all`.
- Showing the rejection reason anywhere after submission (not returned by the documented contract).
- Changing or optimistically updating any balance value; only authoritative backend state is shown.
- Pushing an update into the requesting user's separate open session after an approval (cross-session real-time updates are out of scope).
- New dependencies, a state store, a service layer, a query-key factory, or a shared role hook.
- The admin screen's exact internal visual layout; the design phase resolves it. The comps fix the entry point, filter controls, card fields, drawer, and decision flow; this research fixes behavior and functional states.
- Normalizing unrelated API route response/error shapes.

## Technical Research

### Current State

- Story 3 delivered `src/features/Balance/BalanceRequestsScreen.tsx` (the user "Mis solicitudes" screen), `BalanceRequestCard.tsx` (+ skeleton), month/year + pagination, and the cancel confirmation flow. This is the closest Balance-domain precedent; the admin screen mirrors it with a status filter, extra card fields (user, admin-in-charge), a detail drawer, and a decision flow instead of cancel.
- `src/shared/types/balance.types.ts` defines `BalanceRequestStatus`, `BalanceRequestDto` (`id`, `amount`, `paymentReference?`, `status`, `decisionReason`, `decisionAt`, `createdAt`, `updatedAt`), `BalanceRequestListParams`, `BalanceRequestListData`, response envelopes, and error types. No admin item type (with `userEmail`/`userName`/`adminInCharge`), admin params, `status` filter, or decision payload exists yet.
- `src/shared/constants/balance.constants.ts` provides `BALANCE_STATUS_LABELS` (`Pendiente`/`Aprobada`/`Rechazada`/`Cancelada`), `BALANCE_STATUS_BADGE_COLOR`, and screen/card copy. `src/shared/constants/global.constants.ts` provides `BALANCE_API_ENDPOINT`, `BALANCE_REQUESTS_API_ENDPOINT`, and `BUSINESS_TIMEZONE`.
- `src/shared/utils/balance.utils.ts` provides `getBalanceCb`, `createBalanceRequestCb`, `getBalanceRequestsCb`, `cancelBalanceRequestCb`, and `formatBalanceMxn`. No admin list or decision callback exists.
- `src/app/api/balance/requests/route.ts` (`GET`, allowlist `month`/`year`/`page`/`limit`) and `src/app/api/balance/requests/[requestId]/cancel/route.ts` (`PATCH`, URL-encoded id, preserves upstream `409` `BAL-BUS-002`) are the route precedents. Balance routes **preserve upstream status/body** (stricter than guides-db routes, which collapse to `400`).
- The admin precedents are `src/features/Dashboard/subscreens/Order.tsx` (admin role gating via `role.includes('admin')`, separate admin query key + `enabled` gate, admin-only filter controls, master/detail view, pagination) and `src/app/api/guides-db/route.ts` (`scope=all|own` → `/guides/db/admin` path branch) plus `src/app/api/guides-db/[kraftId]/hard/route.ts` (the "ponytail" `getUserInfo()` admin `403` guard).
- `date.utils.ts` exports `formatBusinessDateShort(ts)` (e.g. `18 jul 2026`, used by `BalanceRequestCard`), `formatDateToSpanish(ts)` (→ `{ fullDateTime, date, time }`, requires an explicit offset), and `getBusinessCalendarMonthYear(instant?)`. The drawer timestamps that show time (`22 jul 2026 · 10:42`) need a date+time rendering; `formatDateToSpanish` returns `date`/`time`/`fullDateTime` and is the candidate — confirm exact glyph formatting during design/plan.
- `QueryProviderWrapper` provides a per-mounted-provider `QueryClient` with a 60-second default `staleTime`; keep it unchanged.

### Affected Areas

Routes/pages:

- No new App Router page in Story 4. `src/app/dashboard/page.tsx` remains the authenticated boundary; the admin queue is a new dashboard screen selected by local state. The `/dashboard/requests/[requestId]` page is Story 5.

API route handlers:

- Add `src/app/api/balance/requests/admin/route.ts`: `GET` → `${BACKEND_URI}/balance/requests/admin`, forwarding an explicit allowlist of `month`, `year`, `page`, `limit`, `status` plus the bearer token; apply the defensive `getUserInfo()` admin guard (`403` when not admin); preserve upstream status/body; local `400` for a missing token.
- Add `src/app/api/balance/requests/[requestId]/decision/route.ts`: `PATCH` → `${BACKEND_URI}/balance/requests/{requestId}/decision`, URL-encoding `requestId` like `src/app/api/guides-db/[kraftId]/route.ts`, forwarding the JSON decision body; apply the defensive admin guard; preserve upstream statuses — notably a `409`-style conflict when a request is no longer `pending`, and `401`/`403`/`404` — rather than flattening to `400`.

Feature UI (all under `src/features/Balance/`):

- Admin queue screen (new component, e.g. `BalanceAdminScreen`): responsive filter row (month/year `Select` + status toggle + "Aplicar filtros"), request cards, pagination, and the detail drawer. Reuse `formatBalanceMxn`, `formatBusinessDateShort`, `BALANCE_STATUS_LABELS`, `BALANCE_STATUS_BADGE_COLOR`, and the `Order.tsx`/`BalanceRequestsScreen` month-year + pagination pattern; do not introduce a new list abstraction.
- Admin request card (new or an adapted `BalanceRequestCard`): amount, user name/email, created date, payment reference (`Por asignar` when absent on a pending request), admin in charge (`Sin asignar` when absent), status badge, "Ver detalle". The user card's footer "Cancelar" action is replaced by "Ver detalle".
- Detail drawer: use the Flowbite `Drawer` (the dashboard already customizes the Flowbite `drawer` theme in `src/app/dashboard/page.tsx`). Header `Detalle de solicitud` + close; "Información de la solicitud" (id, created, user, last updated, admin in charge); "Registrar decisión" section only for `pending` requests, read-only otherwise.
- Reusable decision component (e.g. `BalanceDecisionForm`): `decisionMode: 'idle' | 'approve' | 'reject'`; approve → required `paymentReference` input + `Confirmar aprobación`; reject → optional `Motivo del rechazo` textarea + `Confirmar rechazo` (danger); `Cancelar` returns to idle. Built so Story 5's full page can reuse it.

Shared code:

- Add admin item/params/response DTOs, the `status` filter union, and the decision payload union beside the existing balance DTOs in `src/shared/types/balance.types.ts`.
- Add `getAdminBalanceRequestsCb` and `decideBalanceRequestCb` beside the existing callbacks in `src/shared/utils/balance.utils.ts`.
- Add `BALANCE_REQUESTS_ADMIN_API_ENDPOINT = "/api/balance/requests/admin"` in `global.constants.ts` and admin screen/decision copy in `balance.constants.ts`.

Dashboard shell:

- Add an admin `DashboardScreens` value in `src/shared/types/dashboard.types.ts`.
- Render the admin screen in both the mobile and desktop branches of `Dashboard.tsx`, passing `userInfo` for gating.
- Add an admin-gated `DashboardAsideLink` in `Aside.tsx` (wrap in `{ isAdmin && ( ... ) }`, matching the `marginProfit` precedent), and gate the existing (currently unconditional) user "Mis solicitudes" entry to non-admins (`{ !isAdmin && ( ... ) }`) so admins see only "Solicitudes de saldo".
- Thread `userInfo`/`isAdmin` into `HeaderMenuDrawer.tsx` (which currently receives none) so both the admin entry (`isAdmin`) and the user "Mis solicitudes" entry (`!isAdmin`) are correctly gated on mobile — otherwise it would repeat the known "desktop-hidden-for-non-admin but mobile-exposed" asymmetry.

Tests:

- Route tests near `__tests__/api/balance.requests.admin.route.test.ts` (or extend the existing admin/requests area).
- Feature tests under `__tests__/feature/Balance/` for the admin screen and decision flow.

### Existing Patterns To Follow

App Router server/client split:

- Keep token and `BACKEND_URI` access in route handlers; keep list state, filters, mutation, and invalidation in client components. Do not read the httpOnly session cookie from Balance UI or call the backend directly from the browser.

TanStack Query:

- Use the existing provider; do not add another `QueryClient` or move it to module scope.
- Key the admin query on `['balance', 'requests', 'admin', month, year, page, limit, status]`. It shares the `['balance', 'requests']` prefix, so a prefix invalidation refetches both user and admin lists.
- Gate the admin query with `enabled: isAdmin && <admin screen active>`, mirroring `Order.tsx`'s admin `enabled` gate.
- Reset `page` to 1 when filters change; commit filter changes on "Aplicar filtros".
- On a successful decision, invalidate `['balance', 'requests']` (covers the admin queue) and `['balance']` (an approval changes funds; AC4 requires current balance to be treated as stale). Cancel invalidated only the request prefix; decisions differ because approval moves money.
- Avoid optimistic list/balance edits; reflect authoritative state from a refetch.

Admin role gating:

- Presentation gate: `const isAdmin = Array.isArray(userInfo?.data?.user?.role) && userInfo.data.user.role.includes('admin')` — the same expression used by `Order.tsx`, `Aside.tsx`, and the hard-delete route.
- Defensive BFF gate: the admin routes call `getUserInfo()` and return `403` when the caller is not an admin, with the `// ponytail:` comment noting the backend is authoritative.

Timezone display (delivered by Story 6):

- Pass raw backend UTC ISO strings to the date helpers; keep DTO/state timestamps raw.
- Use `formatBusinessDateShort` for card dates and `formatDateToSpanish` where the drawer needs date + time; both render in `America/Mexico_City`.
- Derive default month/year from `getBusinessCalendarMonthYear()`; derive the year-option list from that business year, as `Order.tsx` and `BalanceRequestsScreen` do.

Forms, Flowbite, Tailwind, accessibility:

- Use existing Flowbite `Select`, `Button`, `ToggleSwitch`/`ButtonGroup`, `Drawer`, `Textarea`, and `TextInput`; preserve Geist font, dark mode, neutral surfaces, and responsive dashboard behavior from `DESIGN.md`.
- Approve confirm is disabled while `paymentReference` is empty/whitespace and while the mutation is pending; reject confirm is always enabled (reason optional) but disabled while pending.
- Expose loading/error/empty and decision states through accessible status/alert semantics; give filter controls visible Spanish labels; query by role/label/text in tests.

Route-handler proxy style:

- Explicitly allowlist forwarded query parameters (`month`, `year`, `page`, `limit`, `status`); drop unrelated keys.
- URL-encode the dynamic `requestId` before constructing the upstream URL.
- Preserve upstream success envelope and status; return a compact local `500` only when no upstream HTTP response is available.
- Do not alter existing balance route behavior.

### Backend Contract

Admin request list (from the epic):

- Method/path: `GET /balance/requests/admin`.
- Queries: `month`, `year`, `page`, `limit`, and `status=pending|all`. Month/year/page/limit default on the backend (current month/year, page 1, limit 10) when omitted.
- Response (confirmed): `data.requests` array plus sibling `data.total`, `data.page`, `data.limit`, `data.totalPages`, under the standard `{ version, data, message, error }` envelope. Each item carries `id` (opaque Mongo ObjectId string), `amount` (MXN major units), `status`, `createdAt`, `updatedAt`, always-present `userEmail`/`userName`, nullable `adminInCharge` (an admin email string or `null`), and conditional `paymentReference`/`decisionReason`/`decisionAt`. Timestamps serialize as UTC ISO 8601 strings; keep FE DTO timestamps as `string`.

Decision (confirmed):

- Method/path: `PATCH /balance/requests/{balance-id}/decision`.
- Approve body: `{ action: "approve", paymentReference: string }` (paymentReference mandatory and non-empty).
- Reject body: `{ action: "reject", reason?: string }` (reason optional; omit when empty). A submitted reason is persisted as `decisionReason` and surfaced to the user via a decision email and their history.
- Success: `200 OK` with the decided request nested under `data.request` (the full admin item shape, with `status`, `decisionReason`, `decisionAt`, and `adminInCharge` now populated), under the standard envelope.
- Non-`pending` conflict: `409 Conflict` with a **flat** KraftError body `{ code: "BAL-BUS-002", message: "La solicitud de saldo no se encuentra en un estado válido para esta operación.", technicalDetails: null, statusCode: 409 }`. Note this is a top-level flat shape — **not** nested under the `{ version, data, message, error }` envelope like Story 3's cancel `409` (which put the KraftError under `error`). The BFF preserves this status/body verbatim, and the decision UI must read the flat `data.code` rather than `data.error.code`.
- Allowed only while status is `pending`; other statuses are read-only.

Amount contract (unchanged): MXN major units; effective range `0.01`-`100000.00`; zero renders as `$0.00` via `formatBalanceMxn`.

Status labels (from the epic): `pending → Pendiente`, `approved → Aprobada`, `rejected → Rechazada`, `cancelled → Cancelada`. Status filter labels: `pending → Pendientes`, `all → Todas`.

### Data And Cache Behavior

- Approving affects the admin queue, the request detail, the request owner's history, and the owner's current balance. Rejecting affects the admin queue and the request detail but not any balance. Both are authoritative backend transitions; no optimistic edits.
- On decision success, invalidate `['balance', 'requests']` and `['balance']`. The admin key `['balance', 'requests', 'admin', ...]` is covered by the request-prefix invalidation.
- Because admin and requesting-user sessions are separate clients with separate `QueryClient`s, invalidation in the admin session cannot push an update into the user's open browser; that refresh behavior is a product decision and out of scope.
- A request may transition (cancelled by the owner, or decided by another admin) between list render and decision submission; the UI must surface the backend's authoritative status via the preserved conflict rather than assume the transition succeeded.
- Query data is user-sensitive; the per-mounted-provider `QueryClient` isolation must remain unchanged.

### UX States And Copy

- Loading: non-blocking loading indicator (skeleton rows), not blocking dashboard navigation.
- Empty: mode-aware Spanish empty message for the selected month/year/status (e.g. no pending requests for the period).
- Error: stable Spanish error state with a retry, without fabricating rows.
- Populated: cards with amount, user name/email, created date, payment reference (or `Por asignar` on pending), admin in charge (or `Sin asignar`), status badge, "Ver detalle".
- Detail drawer: request info (id, created, user, last updated, admin in charge). For `pending`, show "Registrar decisión"; for other statuses, show read-only detail with no decision actions.
- Approve: reveal a required `Referencia de pago` input (placeholder e.g. `Ej. KRF-843210`); confirm disabled until non-empty; submit `{ action: "approve", paymentReference }`.
- Reject: reveal an optional reason textarea. The reason is shown to the user (decision email + `decisionReason` in history), so copy is user-facing — label `Motivo del rechazo (opcional)`, placeholder `Agrega contexto para el usuario` (the comp copy), optionally a caption like `El usuario verá este motivo en su historial y en el correo de decisión.`; submit `{ action: "reject", reason }` omitting `reason` when empty.
- Decision success: reflect the new status from an authoritative refetch; keep or close the drawer per design.
- Decision conflict/failure: preserve the prior authoritative state and show a Spanish error; do not present a false approved/rejected state.

### Edge Cases And Constraints

- All rendered timestamps use `America/Mexico_City`; a UTC instant such as `2026-02-01T05:59:59.999Z` belongs to January and `2026-02-01T06:00:00.000Z` to February in the business zone. Month/year filtering happens on the backend across the full result set; the frontend must not filter only the current page.
- Admin accounts have no balance requests of their own; the admin queue must not be conflated with the user "Mis solicitudes" screen, and admin queries must hit only the admin endpoint.
- `adminInCharge` is nullable (an admin email string or `null`) and `paymentReference` is conditional; render `Sin asignar` / `Por asignar` placeholders when absent on a pending request rather than blank cells.
- `decisionReason` is returned on decided items and is user-visible, so the admin queue/drawer may show it for rejected/approved requests in the `Todas` view; the reject textarea is user-facing copy.
- A stale queue can offer a decision on a request the backend already transitioned; tolerate the conflict by surfacing authoritative status.
- Frontend role checks are presentation only; the defensive BFF guard reads the non-authoritative `user-info` cookie and is a secondary control — backend authorization is mandatory for the admin list and decisions.
- The `SOL-2098` value shown in the drawer comp is stylistic; the real identifier is the opaque `id` (the email deep link uses `/dashboard/requests/6a61648b998ef7a461cf4ff6`). Display the opaque `id` unless the backend adds a human-friendly reference (Open Question III).
- Session cookies are httpOnly; all authenticated browser traffic goes through the BFF. Balance uses `BACKEND_URI`; the external `product-sat` URI is unrelated. Tests always collect coverage.

### Dependencies And Integration Points

- No new frontend dependency. `axios`, TanStack Query, Flowbite (incl. `Drawer`), Tailwind, and the delivered `date.utils.ts` are sufficient. No `package.json` / `pnpm-lock.yaml` change is expected.
- `NEXT_PUBLIC_BUSINESS_TIMEZONE=America/Mexico_City` is already required/enforced by Story 6; this story consumes it through `date.utils.ts`. `BACKEND_URI` is the only relevant upstream env var.
- The admin query shares the `['balance', 'requests']` prefix with the user history and create/cancel invalidations, so decision invalidation refetches any mounted list. The decision UI is designed for reuse by Story 5's full-page route.
- Final UI work must consult `DESIGN.md` and preserve both desktop and mobile/tablet shells.

### Testing Rules To Follow

From `.github/copilot-instructions.md`:

- Use `userEvent`, not `fireEvent`; render real internal Balance components rather than mocking them.
- Mock only network callbacks or unavailable browser APIs; use relative paths in `jest.mock()`.
- Use a fresh QueryClient with retries disabled for query-driven feature tests.
- Do not assert CSS classes, colors, or layout; query by role, accessible name, label, or visible text.
- Use explicit balance DTO fixtures (including the admin item shape); do not use `any`/`unknown`; match mock data to the unwrapped callback shape.
- Keep the real `date.utils.ts` helpers active; do not mock `Intl`, Luxon, or the timezone constant. Assert timezone-correct visible dates.
- Preserve existing skipped tests.

Smallest useful route coverage:

- Admin list forwards only allowlisted `month`/`year`/`page`/`limit`/`status` with the bearer header; unrelated keys are dropped.
- The defensive guard returns `403` for a non-admin caller (and does not call upstream); a missing token returns local `400`.
- Decision route forwards the URL-encoded id and the exact approve/reject body with the bearer header; approve and reject bodies are distinguished.
- Upstream conflict/auth/not-found statuses and bodies are preserved (not flattened to `400`).
- A transport failure returns the local server-error response. Existing balance route tests remain unchanged and passing.

Smallest useful feature coverage:

- Non-admin `userInfo` hides the admin navigation entry and screen; admin `userInfo` shows them.
- Default filter derives the Mexico City month/year from a fixed system instant whose browser-local month could differ; changing filters and pressing "Aplicar filtros" updates the query and resets page to 1.
- Populated cards render amount, user name/email, status, timezone-correct dates, payment reference, and admin-in-charge placeholders.
- "Ver detalle" opens the drawer with the reused row data; a non-`pending` request shows read-only detail with no decision controls.
- Approve confirm is disabled until `paymentReference` is non-empty and sends the exact approve payload; reject sends an omitted `reason` when empty and an optional reason when provided.
- A successful decision invalidates `['balance', 'requests']` and `['balance']`; a `409`-style conflict preserves state and shows an error without a false decided state.
- Empty and error states behave; pagination interactions reset page appropriately.

## Open Questions

### Backend Contract

I: Question: What is the exact success envelope and per-item shape for `GET /balance/requests/admin`?

Status: answered

Answer: `{ version, data: { requests: AdminBalanceRequestItemDto[], total, page, limit, totalPages }, message, error }`. Each `AdminBalanceRequestItemDto` = `{ id: string; amount: number; paymentReference?: string; status: 'pending'|'approved'|'rejected'|'cancelled'; decisionReason?: string; decisionAt?: string; createdAt: string; updatedAt: string; userEmail: string; userName: string; adminInCharge: string | null }`. `userEmail`/`userName` are always present; `adminInCharge` is `null` until a decision assigns an admin email; `paymentReference`/`decisionReason`/`decisionAt` are `null`/absent while pending. Timestamps serialize as UTC ISO strings (typed `Date` server-side; keep FE DTO `string`). The callback unwraps `data.requests` + sibling pagination fields.

II: Question: What status and body does `PATCH /balance/requests/{balance-id}/decision` return on success and on a non-`pending` conflict?

Status: answered

Answer: Success is `200 OK` with the decided request nested under `data.request` (full admin item, `status`/`decisionReason`/`decisionAt`/`adminInCharge` populated) under the standard envelope. A non-`pending` decision returns `409 Conflict` with a **flat** KraftError body `{ code: "BAL-BUS-002", message: "La solicitud de saldo no se encuentra en un estado válido para esta operación.", technicalDetails: null, statusCode: 409 }` — top-level, not nested under `error`. The BFF preserves it verbatim; the decision UI reads `data.code` (flat), unlike Story 3's cancel conflict which read `data.error.code`.

Context: This flat conflict shape differs from the enveloped conflict Story 3 documented for cancel; both are `409 BAL-BUS-002` but nested differently. Epic Open Question VII requires the BFF to preserve upstream statuses (not collapse to `400`).

III: Question: Should the detail surface display the opaque request `id`, or does the backend provide a human-friendly reference (as `SOL-2098` in the comp suggests)?

Status: answered

Answer: Display the opaque `id`. The backend returns only the Mongo ObjectId string (e.g. `507f1f77bcf86cd799439011`) via `formatRequest()`; there is no `referenceNumber` field. `SOL-2098` in the comp is a design placeholder, and the email deep link uses the opaque id. A friendly reference would be a new backend field (out of scope).

IV: Question: Is the rejection reason ever surfaced to the requesting user?

Status: answered

Answer: Yes. The reason is surfaced in two places: (1) the decision email (`Motivo: {reason}` when present) and (2) the `decisionReason` field returned by `GET /balance/requests`, shown in the user's own history. The reason is optional but always shown when present. Therefore the admin reject textarea uses **user-facing** copy (the comp's `Agrega contexto para el usuario` is correct), reversing the earlier internal-only assumption and superseding epic Open Question VIII for this field. (Story 3's `BalanceRequestCard` already renders `decisionReason` when present, consistent with this.)

### UI And Product Decisions

I: Question: Where does the admin queue live and how is it gated?

Status: answered

Answer: A new admin-only dashboard screen ("Solicitudes de saldo" per comps), separate from the Story 3 user "Mis solicitudes" screen, reached from an admin-gated desktop sidebar entry and mobile drawer entry. It introduces a new `DashboardScreens` value and requires threading `userInfo`/`isAdmin` into the mobile drawer (currently ungated). (User-confirmed.)

II: Question: Should admins still see the user "Mis solicitudes" screen?

Status: answered

Answer: No. Admins have no balance requests of their own, so "Mis solicitudes" is hidden for admin users; admins see only "Solicitudes de saldo". This means the existing (currently unconditional) user Balance nav entry in `Aside.tsx` and the mobile drawer must be gated to non-admins (`{ !isAdmin && ... }`), and the admin entry gated to admins (`{ isAdmin && ... }`), so the two audiences see mutually exclusive Balance entries. (User-confirmed.)

III: Question: How are the approve and reject inputs captured?

Status: answered

Answer: A segmented "Registrar decisión" section with two persistent buttons; selecting Aprobar reveals a required `Referencia de pago` input + `Confirmar aprobación`, selecting Rechazar reveals an optional user-facing `Motivo del rechazo` textarea + `Confirmar rechazo` (danger), and `Cancelar` returns to idle. Confirmed by `admin-request-comp-confirm-approval.png` and `admin-request-comp-confirm-reject.png`. (User-confirmed.)

IV: Question: Should the queue filters auto-apply or use an explicit apply button?

Status: answered

Answer: Explicit "Aplicar filtros" button (per comps), unlike the Story 3 user list. Filter selections are staged and committed on the button, updating the query key and resetting page to 1. (User-confirmed via comps.)

V: Question: Is the detail surface a drawer or a full page?

Status: answered

Answer: In Story 4 it is a right-side detail drawer opened from "Ver detalle" (per comps). Story 5's email deep link is a separate full page reusing the same decision UI. (User-confirmed.)

### Authorization

I: Question: How is admin list/decision access authorized on the frontend and BFF?

Status: answered

Answer: Presentation gating uses `userInfo.data.user.role.includes('admin')`. The admin BFF routes additionally apply a defensive `getUserInfo()` admin check returning `403` (mirroring `/api/guides-db/[kraftId]/hard`). The backend remains the authoritative authorization source for the admin list and decisions. (User-confirmed.)

## Assumptions

- `GET /balance/requests/admin` and `PATCH /balance/requests/{id}/decision` are served from `BACKEND_URI` and accept the existing bearer token.
- The admin list response matches the user list envelope plus always-present `userEmail`/`userName` and nullable `adminInCharge` per item, with conditional `paymentReference`/`decisionReason`/`decisionAt` (confirmed, Open Question I).
- The decision success response nests the decided request under `data.request`; a non-`pending` decision returns a preserved flat `409 BAL-BUS-002` KraftError read via `data.code` (confirmed, Open Question II).
- Timestamps are UTC ISO 8601 strings rendered through the shared date helpers without mutating stored values.
- Approving changes the request owner's balance; the admin session cannot push that change into the user's separate open session.
- The admin query adopts `['balance', 'requests', 'admin', month, year, page, limit, status]`, keeping the `['balance', 'requests']` invalidation prefix effective; decision success also invalidates `['balance']`.
- The admin surface is a new admin-only dashboard screen; only its internal visual layout remains for design, without changing the behavioral acceptance criteria.
- The reject reason is user-facing (shown via email and history); the admin writes context the user will read.

## Non-Obvious Findings

- Admins have no balance of their own, so the admin queue is a distinct surface hitting only the admin endpoint; it must not reuse the user "Mis solicitudes" query or screen. The Balance nav entries are mutually exclusive by role: admins see only "Solicitudes de saldo", non-admins see only "Mis solicitudes". This requires gating the currently-unconditional Story 3 user entry to `!isAdmin`.
- Decision invalidation must include `['balance']` (approval moves money), unlike Story 3's cancel which deliberately never touched `['balance']`. This is the one balance mutation that invalidates current balance.
- The admin query key nests under the `['balance', 'requests']` prefix, so a single prefix invalidation covers both user and admin lists — no separate admin invalidation is required.
- The comps resolve four decisions the epic left to design: an explicit "Aplicar filtros" button (vs the user list's implicit apply), a detail drawer (vs full page — the full page is Story 5), the segmented approve/reject reveal, and the required-reference / optional-user-facing-reason split.
- The reject reason IS surfaced to the user (decision email + `decisionReason` in `GET /balance/requests`), so the reject textarea is user-facing (`Agrega contexto para el usuario`). This reverses the earlier internal-only assumption and supersedes epic Open Question VIII for this field; Story 3 already renders `decisionReason` when present, so the behavior is consistent.
- The decision `409 BAL-BUS-002` conflict body is a **flat** KraftError (`{ code, message, technicalDetails, statusCode }`), unlike Story 3's cancel `409` which nests the same code under `error`. The decision error handling must read the flat `data.code`, not `data.error.code`, even though both are `409 BAL-BUS-002`.
- `SOL-2098` in the drawer comp is stylistic; the backend returns only the opaque Mongo ObjectId string with no `referenceNumber` field, so the detail surface displays the opaque `id`.
- The mobile drawer (`HeaderMenuDrawer.tsx`) currently receives no `userInfo` and renders `marginProfit` unconditionally; a correctly admin-gated mobile entry for the admin queue requires threading `userInfo`/`isAdmin` into it, avoiding the existing desktop-hidden/mobile-exposed asymmetry.
- The decision UI is intentionally extracted as a reusable component so Story 5's full-page `/dashboard/requests/{requestId}` route can reuse the exact approve/reject behavior with a `Volver al panel de control` back button.
