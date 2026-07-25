# Email Deep Link To Admin Review Story Research

Story of epic: `ai-research/add-balance.epic.md` (Story 5, `add-balance.epic.md:154-179`).

## Story Definition

### Story Title

Email deep link to a full-page admin review of one balance request.

### Story Description

Give the backend's admin notification email a stable frontend destination, `/dashboard/requests/{requestId}`, that loads one balance request by its opaque ID from `GET /balance/requests/admin/{requestId}` and lets an authenticated admin approve or reject it without first locating it in the monthly queue.

This is the last story of the epic. Stories 1, 2, 3, 4, and 6 are complete, so the Balance DTOs, admin callbacks, admin BFF routes, timezone-aware date helpers, and the reusable `BalanceDecisionForm` already exist. Story 4 deliberately built `BalanceDecisionForm` to take only `requestId`/`onDecided` so this story can mount it unchanged on a full page. What is genuinely new here: an App Router page outside the dashboard's local-state shell, a single-request admin BFF route and callback, an unauthenticated redirect that preserves the request URL through login, and an unauthorized screen for loaded non-admin users.

### Scope Classification

Single-feature story (Balance) with one deliberate cross-feature touchpoint: the Login feature must accept and honor a post-login return URL so AC4's "preserving the request URL" is actually satisfied.

### Research Mode

Full research, prioritizing the new route boundary, the single-request backend contract, the auth/redirect and unauthorized behaviors, and reuse of the Story 4 decision component.

### User-Confirmed Decisions

- **Standalone full page, not the dashboard shell.** `/dashboard/requests/{requestId}` is its own server page that reads auth cookies and renders only the request detail plus a `Volver al panel` back action. It does not render `Aside`/`HeaderMenuMobile`; the dashboard shell chrome lives inside the client-only `Dashboard` component and is not extracted for this story.
- **Login return URL is in scope.** The page redirects unauthenticated visitors to the login route carrying the request URL, and the login flow sends the admin back to that URL after a successful login, falling back to `/dashboard`. An open-redirect guard restricts accepted values to same-origin dashboard paths.
- **After a successful decision the admin stays on the page**, and the comps add a confirmation step: a success panel replaces the detail card, and a secondary action reveals the refetched decided detail. No redirect, no false optimistic state.
- **The comps' dashboard sidebar is not adopted.** All three comps render `Aside` around the content, but the page stays standalone; shell alignment is deferred until a dashboard layout exists.
- **The back action reads `Volver al panel` and links to `/dashboard`**, diverging from the comps' `Volver a solicitudes` label because the admin queue has no URL to link to.
- **`BalanceDecisionForm` is reused unchanged**, accepting that the comp's button order and colors differ from the shipped drawer's.
- Full research template.

### Acceptance Criteria

1. `/dashboard/requests/{requestId}` exists as an App Router page that takes the opaque request ID from the URL and loads that one request through an authenticated Next route handler proxying `GET /balance/requests/admin/{requestId}` — not by scanning a page of the monthly admin list.
2. An authenticated admin sees the request detail (zero-safe MXN amount, Spanish status, timezone-correct timestamps, user name/email, payment reference and admin in charge when present) and, only while the request is `pending`, the approve/reject decision controls; `approved`, `rejected`, and `cancelled` requests render read-only, and a missing request renders a not-found state with no actionable controls.
3. Unauthenticated access redirects to the login route preserving `/dashboard/requests/{requestId}` as the post-login destination; after a successful login the admin lands back on that URL. Only same-origin dashboard paths are accepted as return destinations.
4. A loaded non-admin user sees the Spanish unauthorized screen with a `Volver al panel` action; the frontend gate is presentation only and the backend remains the authorization source of truth for both retrieval and decisions.
5. After a successful approve or reject from this page, the admin stays on the same URL and sees a `Decisión registrada` confirmation panel with a back-to-dashboard action and a `Ver solicitud actualizada` action that reveals the refetched read-only decided detail; the request lists and current balance are invalidated so authoritative state is refetched elsewhere, and a conflict never reaches the confirmation panel.

### Task Breakdown

1. Add the single-request admin DTO/response type to `src/shared/types/balance.types.ts` (`GetAdminBalanceRequestResponse` = `{ version, data: { request: AdminBalanceRequestDto }, message, error }`), reusing the existing `AdminBalanceRequestDto`.
2. Add `src/app/api/balance/requests/admin/[requestId]/route.ts`: `GET` → `${BACKEND_URI}/balance/requests/admin/{encodeURIComponent(requestId)}`, bearer forwarded, the same defensive `getUserInfo()` admin guard as the sibling admin routes, upstream status/body preserved (notably `401`/`403`/`404`), local `400` for a missing token, local `500` when no upstream response exists.
3. Add `getAdminBalanceRequestCb(requestId)` to `src/shared/utils/balance.utils.ts`, unwrapping `data.request`.
4. Add the route/copy constants: `BALANCE_REQUEST_DETAIL_ROUTE` helper (or a `DASHBOARD_REQUESTS_ROUTE` base) in `global.constants.ts`, and the page copy in `balance.constants.ts` — eyebrow/heading/subtitle, `Monto solicitado`, the `Selecciona una acción para continuar.` decision subtitle, back action, unauthorized heading/body/action, not-found copy, decided/read-only copy (today an inline string in `BalanceAdminRequestDrawer`), and the success-panel heading/body/actions.
5. Add `src/app/dashboard/requests/[requestId]/page.tsx` as an async server component: read `getAccessToken()` and `getUserInfo()`; no token → redirect to the login route with the encoded return URL; loaded non-admin → unauthorized screen; otherwise render the client detail component with `requestId`.
6. Build the client detail component in `src/features/Balance/` (e.g. `BalanceAdminRequestDetail`): `useQuery` keyed `['balance', 'requests', 'admin', requestId]`, loading/error/not-found/populated states, the comp's card structure, `Volver al panel`, `BalanceDecisionForm` mounted unchanged when `status === 'pending'`, and the post-decision success panel driven by local view state off the component's `onDecided` callback, with `Ver solicitud actualizada` returning to the refetched read-only detail.
7. Add the return-URL plumbing: `src/app/page.tsx` reads the redirect search param, sanitizes it, redirects already-authenticated visitors to it instead of `/dashboard`, and passes it through `Login` to `LoginCard`, which pushes it on login success with a `/dashboard` fallback. Add the sanitizer as a small shared util so both the page and the card use one rule.
8. Add focused route, page-boundary, and feature coverage (see Testing Rules).

### Out Of Scope

- The backend email template, CTA label, and the `FRONTEND_URI` + encoded route composition. That is backend work; this story only fixes and delivers the URL shape.
- Rendering the dashboard sidebar/mobile drawer around this page, or extracting the dashboard shell into a layout. The page is standalone by decision, against the comps' chrome; shell alignment is follow-up work.
- Making the admin queue URL-addressable (a `screen` param on `/dashboard`, or reading the existing unread `dashboard-screen` cookie on mount) so the back action could land on `Solicitudes de saldo`. Follow-up work; the back action links to `/dashboard` and is labelled accordingly.
- Changing `BalanceDecisionForm`'s button order or colors to match the comp, or adding a variant prop to it.
- A regular-user route for their own request detail. The route is admin-only (epic Authorization Open Question III).
- Changing `BalanceDecisionForm` behavior, the admin queue screen, or the existing admin list/decision BFF routes.
- Making the dashboard's `Solicitudes de saldo` screen URL-addressable. `Volver al panel` links to `/dashboard`, which restores the default screen; the admin queue remains local state.
- Replacing `LoginRequiredModal` on `/dashboard`, or applying the return-URL pattern to any other route.
- Cross-session push of an approval into the requesting user's open browser.
- New dependencies, a state store, a service layer, a query-key factory, or a shared role hook.

## Technical Research

### Current State

- `src/features/Balance/BalanceDecisionForm.tsx` already takes only `{ requestId, onDecided? }`, owns its own `useMutation` on `decideBalanceRequestCb`, and on success invalidates `['balance', 'requests']` and `['balance']`. It reads the flat `409 BAL-BUS-002` conflict via `error.response.data.code`. It is mountable on a full page with no change.
- `src/features/Balance/BalanceAdminRequestDrawer.tsx` is the closest visual/behavioral precedent for the detail surface: amount + status badge, `Información de la solicitud` fields (created, user name/email, last updated, admin in charge, decision reason when present), then `BalanceDecisionForm` for `pending` or an inline read-only sentence otherwise. That inline sentence (`Esta solicitud ya fue decidida y no admite más acciones.`) is the one piece of Balance copy not yet in `balance.constants.ts`.
- `src/app/api/balance/requests/admin/route.ts` and `src/app/api/balance/requests/[requestId]/decision/route.ts` are the exact BFF template for the new handler: token check → `// ponytail:` `getUserInfo()` admin guard returning `403` → upstream call → `NextResponse.json(response.data, { status: response.status })` → axios-error passthrough → local `500`.
- `src/shared/types/balance.types.ts` already defines `AdminBalanceRequestDto` (`id`, `amount`, optional `paymentReference`, `status`, optional `decisionReason`/`decisionAt`, `createdAt`, `updatedAt`, `userEmail`, `userName`, nullable `adminInCharge`). Only the single-request response envelope is missing.
- `src/shared/utils/balance.utils.ts` has `getAdminBalanceRequestsCb` (list) and `decideBalanceRequestCb`; both URL-encode IDs where relevant. No single-request getter exists.
- `src/shared/constants/balance.constants.ts` already provides `BALANCE_STATUS_LABELS`, `BALANCE_STATUS_BADGE_COLOR`, `BALANCE_FIELD_*`, `BALANCE_ADMIN_FIELD_*`, `BALANCE_ADMIN_ADMIN_UNASSIGNED`, and every `BALANCE_DECISION_*` string. Only page-specific copy is new.
- `src/app/dashboard/page.tsx` is the only page under `/dashboard`. There is no `src/app/dashboard/layout.tsx`, so a nested page inherits only the root layout — it must read its own cookies and cannot rely on the dashboard's `ThemeProvider` or `LoginRequiredModal`.
- `src/app/page.tsx` reads `getAccessToken()` and hard-redirects authenticated visitors to `DASHBOARD_ROUTE`. `src/features/Login/LoginCard.tsx` hard-pushes `DASHBOARD_ROUTE` one second after a successful login mutation. Nothing in the repo currently reads a search param — `useSearchParams` appears nowhere in `src/`.
- `src/shared/ui/organisms/LoginRequiredModal.tsx` is dismissible and links to `LOGIN_ROUTE` with no return URL. The epic explicitly flagged it as unsuitable for a deep link.
- `src/shared/utils/date.utils.ts` supplies `formatBusinessDateShort` and `formatDateToSpanish`, both pinned to `BUSINESS_TIMEZONE`. The drawer composes them as `` `${short} · ${time}` `` — the page should reuse that same composition rather than inventing a third format.
- There is no unauthorized/403 screen component anywhere in `src/`; this story introduces the first one.

### Affected Areas

Routes and pages:

- New `src/app/dashboard/requests/[requestId]/page.tsx`, an async server component. It owns the auth boundary for this route: `getAccessToken()` + `getUserInfo()`, redirect when unauthenticated, unauthorized screen when the loaded user is not an admin, otherwise render the client detail component with the `requestId` param.
- `src/app/page.tsx` gains a `searchParams` read: an authenticated visitor arriving with a sanitized return URL is redirected there instead of `/dashboard`, and the sanitized value is passed down to the login UI.
- No `src/app/dashboard/layout.tsx` is added; the standalone page does not share chrome with `/dashboard`.

API route handlers:

- New `src/app/api/balance/requests/admin/[requestId]/route.ts` (`GET`). Next resolves the static `admin` segment ahead of `[requestId]`, so this file coexists with `src/app/api/balance/requests/[requestId]/{cancel,decision}/route.ts` without conflict. The only shadowed case is a literal request ID of `admin`, which Mongo ObjectIds never produce.
- Existing balance handlers are untouched.

Feature UI (`src/features/Balance/`):

- New client detail component, structured after `BalanceAdminRequestDrawer`'s body: amount + status badge, request fields, decision section for `pending` / read-only otherwise, plus page-level loading, error, and not-found states and the `Volver al panel` link.
- New unauthorized screen — either a small Balance-local component or a `src/shared/ui/organisms/` component if it is worth reusing. Copy is fixed by the epic (`add-balance.epic.md:173-179`).
- `BalanceDecisionForm` is imported unchanged.

Login feature:

- `src/features/Login/Login.tsx` and `LoginCard.tsx` accept an optional return URL prop and push it on success, falling back to `DASHBOARD_ROUTE`. Passing it as a prop from the server page avoids `useSearchParams` in a client component entirely — worth preferring, since `useSearchParams` in an App Router client component can force a Suspense boundary at build time.

Shared code:

- `balance.types.ts`: single-request response envelope.
- `balance.utils.ts`: `getAdminBalanceRequestCb`.
- `global.constants.ts`: the dashboard requests route base / detail-path helper.
- `balance.constants.ts`: back, unauthorized, not-found, read-only, and post-decision copy.
- A small return-URL sanitizer (login or global utils) shared by `src/app/page.tsx` and `LoginCard`.

Tests:

- `__tests__/api/` for the new handler, alongside `balance.requests.admin.route.test.ts`.
- `__tests__/feature/Balance/` for the detail component and its states.
- Login coverage for the return-URL push and the `/dashboard` fallback.

### Existing Patterns To Follow

App Router server/client split:

- Cookies are read only in the server page; the client component receives `requestId` (and nothing sensitive) as props and talks only to `/api/**`.
- `redirect()` from `next/navigation` in the server page for the unauthenticated case — a server redirect, not a dismissible client modal.
- Flowbite components render fine without an explicit `ThemeProvider`; the standalone page deliberately does not inherit the dashboard's `createTheme` drawer override, which is correct here because the page uses no `Drawer`.

TanStack Query:

- Key the detail query `['balance', 'requests', 'admin', requestId]`. It nests under the `['balance', 'requests']` prefix that `BalanceDecisionForm` already invalidates, so the post-decision refetch of this page requires no change to the decision component.
- Keep the per-mounted-provider `QueryClient` in `QueryProviderWrapper` untouched.
- No optimistic edits; render only authoritative backend state.

Route-handler proxy style:

- URL-encode `requestId` before building the upstream URL (`src/app/api/guides-db/[kraftId]/route.ts` precedent).
- Preserve upstream status and body verbatim — balance routes are stricter than guides-db routes, and epic Open Question VII requires it. `404` in particular must survive as `404` so the page can render a not-found state instead of a generic error.
- Apply the `// ponytail:` defensive admin guard, with the backend remaining authoritative.

Role gating:

- `Array.isArray(userInfo?.data?.user?.role) && userInfo.data.user.role.includes('admin')` — the same expression used by `Order.tsx`, `Aside.tsx`, `BalanceAdminScreen`, and the admin BFF routes.

Timezone display:

- Pass raw UTC ISO strings to `formatBusinessDateShort` / `formatDateToSpanish`; never mutate stored timestamps. Reuse the drawer's `date · time` composition and its `'--'` → `BALANCE_DECISION_NONE` fallback.

Flowbite, Tailwind, accessibility:

- Follow `DESIGN.md`: Geist, neutral surfaces, primary blue actions, danger styling for reject, dark mode.
- Expose loading with `role="status"`/`aria-live`, errors and the unauthorized/not-found states with `role="alert"` where appropriate; query by role/label/text in tests.

### Backend Contract

Single admin request lookup (supplied by the backend, `add-balance.epic.md:314-320`):

- `GET /balance/requests/admin/{requestId}` for an authorized admin.
- Success: `200` with `{ version, data: { request }, message: null, error: null }`, where `request` matches the existing `AdminBalanceRequestDto`: `id`, `amount`, `status`, `createdAt`, `updatedAt`, `userEmail`, `userName`, `adminInCharge`. A `pending` example returns `adminInCharge: null` and omits `paymentReference`/`decisionAt`/`decisionReason`, consistent with the conditional-field pattern already modeled in the DTO.
- The `/admin/` path segment makes the endpoint admin-only, matching the admin-only route decision.
- **Missing request → `404`** with a **flat** KraftError body: `{ code: "BAL_NF_001", message: "No se encontro la solicitud de saldo.", technicalDetails: null, statusCode: 404 }`. The same `404` is returned for a syntactically invalid ObjectId, so a mangled email link lands in the not-found state rather than an unhandled error.
- **Authenticated non-admin → `403`** with an **enveloped** body: `{ version, data: null, message: null, error: { message: "Forbidden", statusCode: 403 } }`. This comes from Nest's `RolesGuard`/`ForbiddenException` wrapped by the app exception filter — a generic English "Forbidden", not a Spanish KraftError. The frontend supplies its own Spanish copy and never surfaces this message.
- **Decided or cancelled requests** return the same admin item shape as the list. Approved/rejected populate `decisionReason`, `decisionAt`, and `adminInCharge` (the deciding admin's email); cancelled leaves `decisionReason`/`decisionAt` undefined and `adminInCharge` `null`, because the owner cancelled it and no admin was ever assigned. `AdminBalanceRequestDto` already models all of these as conditional/nullable, so no DTO change is needed.

Error-shape inconsistency to respect (three distinct shapes now live in this one domain):

| Case | Status | Body shape | Read the code at |
| --- | --- | --- | --- |
| Request not found | `404` | flat KraftError | `data.code` → `BAL_NF_001` |
| Non-admin (backend) | `403` | standard envelope | `data.error.statusCode` (no `code` field) |
| Decision on non-`pending` | `409` | flat KraftError | `data.code` → `BAL-BUS-002` |

Note the code separator differs between the two KraftErrors: `BAL_NF_001` uses underscores, `BAL-BUS-002` uses hyphens. Branch on HTTP status first; treat any code string as an exact literal, never a parsed pattern.

Decision (unchanged from Story 4):

- `PATCH /balance/requests/{requestId}/decision`; approve `{ action: 'approve', paymentReference }`, reject `{ action: 'reject', reason? }`; `200` with the decided request under `data.request`; non-`pending` returns a **flat** `409 BAL-BUS-002` KraftError read via `data.code`. Already implemented and preserved by the existing BFF route.

Amounts and labels: MXN major units through `formatBalanceMxn` (zero-safe); `pending → Pendiente`, `approved → Aprobada`, `rejected → Rechazada`, `cancelled → Cancelada`.

### Authentication, Redirect, And Authorization Behavior

Four distinct cases, resolved in the server page before anything renders:

1. **No access token** → `redirect()` to the login route carrying the encoded return URL (`/?redirect=%2Fdashboard%2Frequests%2F{id}` or the agreed param name). The admin logs in and is pushed back to the request URL.
2. **Token present, `user-info` loaded, no `admin` role** → the Spanish unauthorized screen from the epic, with `Volver al panel`. No request fetch is attempted.
3. **Token present, `user-info` missing or unparseable** → `getUserInfo()` returns `null`. Treat as non-admin (unauthorized screen) rather than assuming admin; the BFF guard would return `403` for the fetch anyway.
4. **Token present and admin** → render the detail component.

Return-URL safety:

- Accept only values that start with a single `/`, reject `//` and `/\` (protocol-relative and backslash-smuggled absolute URLs), and reject anything containing a scheme. Recommended: additionally allowlist the `/dashboard` prefix so the parameter cannot be repurposed into a general open-redirect surface.
- Sanitize in one shared helper used by both `src/app/page.tsx` (server redirect for the already-authenticated case) and `LoginCard` (client push after login), so the two cannot drift.
- The frontend gate is presentation only. The backend verifies the admin role against the database for both the single-request read and the decision; a non-admin who forges the URL still gets nothing.

### Data And Cache Behavior

- The detail query `['balance', 'requests', 'admin', requestId]` sits under the `['balance', 'requests']` prefix, so `BalanceDecisionForm`'s existing invalidation refetches this page's own data automatically — this is why the post-decision read-only state needs no new invalidation code.
- The same invalidation also covers `['balance']`, because an approval moves money. That behavior is already correct and is not re-implemented here.
- The request may have been cancelled by its owner or decided by another admin between the email being sent and the link being opened. The page must render whatever status the backend returns, and a decision attempted on a stale page must surface the preserved flat `409 BAL-BUS-002` conflict rather than a false success — `BalanceDecisionForm` already does this.
- Admin and requesting-user sessions are separate clients with separate `QueryClient`s; invalidation here cannot push anything into the user's browser.

### UX States And Copy

- **Loading**: skeleton/spinner for the single request with an accessible status region; the back link is available immediately.
- **Populated, `pending`**: amount + `Pendiente` badge, request ID, created, user name/email, last updated, admin in charge (`Sin asignar` when null), then `Registrar decisión` with the existing approve/reject flow.
- **Populated, decided or cancelled**: same detail fields plus payment reference and decision reason when present; no decision controls; a read-only sentence (promote the drawer's inline string to a constant). A cancelled request legitimately shows `Sin asignar` for admin in charge and no decision-reason row — nobody decided it.
- **Post-decision** (fixed by `story-5-email-deep-link-comp-decision-taken.png`): the detail card is replaced by a success panel — success icon, heading `Decisión registrada`, body confirming the request was updated and is available in the admin queue, and two actions: primary `Volver al panel` (→ `/dashboard`; the comp labels it `Volver a solicitudes`, relabelled for the same reason as the back link) and secondary `Ver solicitud actualizada`, which reveals the refetched decided read-only detail on the same URL. The success panel is local view state after a successful mutation; it never stands in for authoritative data.
- **Not found (`404`)**: a distinct Spanish state saying the request does not exist or is unavailable, with `Volver al panel` — not the generic error state. This also covers a malformed request ID from a truncated email link, which the backend answers with the same `404`. Use the frontend's own copy; do not render the backend's `No se encontro la solicitud de saldo.` string, which is missing its accent.
- **Error (other failures)**: stable Spanish error with a retry, without fabricating request fields.
- **Unauthorized (loaded non-admin)**: per `story-5-email-deep-link-comp-unauthorized.png`, a centered panel with a lock icon, heading `Acceso no autorizado`, and the epic-approved copy folded into one body paragraph — *No tienes acceso a esta solicitud. Esta página está disponible únicamente para administradores. Inicia sesión con una cuenta de administrador o vuelve al panel principal.* — with a single `Volver al panel` action. Note the comp promotes `Acceso no autorizado` to the heading and demotes the epic's bold title into the body; both strings are kept.

Comp-derived structure for the populated detail (`story-5-email-deep-link-comp.png`):

- Eyebrow `REVISIÓN ADMINISTRATIVA`, `h1` `Detalle de solicitud`, subtitle `Revisa la información antes de registrar una decisión.`
- One card: `Monto solicitado` label above the amount with a small `MXN` suffix, status badge top-right; then `Información de la solicitud` as a two-column grid (`ID de solicitud` / `Creada`, `Usuario` with name over email, `Última actualización` / `Admin a cargo` showing `Sin asignar` when null); then `Registrar decisión` with the subtitle `Selecciona una acción para continuar.` and the two decision buttons.
- `Creada` and `Última actualización` use the drawer's `22 jul 2026 · 10:42` date+time composition, confirming the existing `formatBusinessDateShort` + `formatDateToSpanish().time` pairing.
- No payment-reference row appears while pending, consistent with the conditional-field contract.

### Edge Cases And Constraints

- No `src/app/dashboard/layout.tsx` exists, so the nested page inherits nothing from `/dashboard`: no cookie read, no `ThemeProvider`, no `LoginRequiredModal`. Everything the page needs, it does itself.
- `Volver al panel` can only land on `/dashboard`, which restores the default screen — the admin queue is local `Dashboard` state and is not URL-addressable. This is accepted, not a defect to fix here.
- `user-info` is httpOnly JSON and not an authoritative security boundary; a stale or hand-edited cookie must never be the only thing standing between a non-admin and the data. Backend authorization is mandatory.
- `requestId` is untrusted URL input: URL-encode it upstream, and never interpolate it into markup as anything but text.
- The static `admin` segment shadows a literal request ID of `admin` in the new BFF path. Not reachable with Mongo ObjectIds; noted for completeness.
- Reading a search param in a client component (`useSearchParams`) can force a Suspense boundary during `pnpm build`. Passing the sanitized value from the server page as a prop sidesteps the issue; if `useSearchParams` is used instead, verify the production build.
- All timestamps render in `America/Mexico_City` via the shared helpers; a UTC instant like `2026-02-01T05:59:59.999Z` is January in the business zone.
- Balance uses `BACKEND_URI`; `product-sat`'s external URI is unrelated. Tests always collect coverage, so even focused runs are slower.

### Dependencies And Integration Points

- No new frontend dependency. Next's `redirect()`, axios, TanStack Query, Flowbite, and the delivered `date.utils.ts` cover everything. No `package.json` / `pnpm-lock.yaml` change is expected.
- `BACKEND_URI` is the only upstream env var used by the new handler. `NEXT_PUBLIC_BUSINESS_TIMEZONE` is already enforced by Story 6.
- `FRONTEND_URI` is consumed by the **backend** email service to build `FRONTEND_URI + /dashboard/requests/{requestId}`. The frontend's obligation is to keep that path stable; deployment of the email change and this route should be coordinated.
- The route path is the integration contract with the backend email. Changing it later breaks already-sent emails.

### Testing Rules To Follow

From `.github/copilot-instructions.md`:

- `userEvent`, never `fireEvent`; render real internal Balance components rather than mocking them.
- Mock only network callbacks and unavailable browser APIs; use relative paths in `jest.mock()`; mock `next/navigation` router/redirect where the boundary requires it.
- Fresh `QueryClient` with retries disabled for query-driven feature tests.
- No CSS/layout assertions; query by role, accessible name, label, or visible text.
- Typed balance fixtures (`AdminBalanceRequestDto`); no `any`/`unknown`; mock data must match the callback's unwrapped shape (`data.request`, not `data`).
- Keep the real `date.utils.ts` helpers active; assert timezone-correct visible dates.
- Preserve existing skipped tests.

Smallest useful route coverage:

- Forwards the URL-encoded `requestId` to `${BACKEND_URI}/balance/requests/admin/{id}` with the bearer header, and returns the upstream body/status.
- Missing token → local `400`; non-admin caller → `403` without calling upstream.
- Upstream `404`/`401`/`403` are preserved, not flattened to `400`; the flat `404 BAL_NF_001` body and the enveloped `403 Forbidden` body both survive verbatim; a transport failure returns the local `500`.
- Existing balance route tests remain unchanged and passing.

Smallest useful feature and boundary coverage:

- Admin `userInfo` renders the detail; non-admin `userInfo` renders the unauthorized screen with `Volver al panel` and never fetches; missing `user-info` behaves as non-admin.
- Unauthenticated access redirects to the login route with the encoded return URL.
- A `pending` request shows the decision controls; `approved`/`rejected`/`cancelled` render read-only with no approve/reject affordance.
- A `404` renders the not-found state, distinct from the generic error state, for both a well-formed unknown ID and a malformed one.
- A `cancelled` request renders the `Sin asignar` admin placeholder with no decision-reason row; an `approved` one renders its payment reference and deciding admin.
- A successful decision keeps the admin on the page and renders the success panel; `Ver solicitud actualizada` then reveals the refetched decided read-only detail. A `409 BAL-BUS-002` conflict shows the conflict message and never reaches the success panel.
- Login pushes a sanitized return URL after success and falls back to `/dashboard` when absent; hostile values (`//evil.com`, `https://evil.com`, `/\evil.com`) are rejected in favor of `/dashboard`.
- Timestamps render in `America/Mexico_City` from a fixed system instant whose browser-local date could differ.

## Open Questions

### Backend Contract

I: Question: What is the success envelope and item shape for `GET /balance/requests/admin/{requestId}`?

Status: answered

Answer: `{ version, data: { request }, message: null, error: null }`, where `request` is the existing `AdminBalanceRequestDto` (`id`, `amount`, `status`, `createdAt`, `updatedAt`, `userEmail`, `userName`, `adminInCharge`, with conditional `paymentReference`/`decisionAt`/`decisionReason`). Supplied by the backend and recorded in the epic (`add-balance.epic.md:314-320`); no new DTO is needed, only the response envelope type.

II: Question: What status and body does the endpoint return for a request ID that does not exist?

Status: answered

Answer: `404 Not Found` with a **flat** KraftError body: `{ code: "BAL_NF_001", message: "No se encontro la solicitud de saldo.", technicalDetails: null, statusCode: 404 }` — top-level, not nested under `error`. `getRequestByIdAdmin` in `balance.service.ts` throws the identical error for two cases: a `requestId` that is not a valid MongoDB ObjectId, and a valid ObjectId with no matching document.

Context: Because a malformed ID produces the same `404` rather than a `400` or an unstructured `500`, a truncated or mangled email link degrades into the not-found state automatically. The BFF preserves the status, so the client branches on `404`.

Explanation: `BAL_NF_001` uses underscores while the decision conflict's `BAL-BUS-002` uses hyphens. Branch on HTTP status; if a code is checked, compare the exact literal.

III: Question: What status and body does the endpoint return when the caller is authenticated but not an admin?

Status: answered

Answer: `403 Forbidden` with the **standard envelope**: `{ version, data: null, message: null, error: { message: "Forbidden", statusCode: 403 } }`. `JwtGuard` authenticates, then `RolesGuard` (via `@Roles('admin')`) rejects, and `GeneralAppExceptionFilter` wraps Nest's `ForbiddenException` in the general response format.

Context: This is the forged/stale-cookie path — the BFF's defensive `getUserInfo()` guard already returns its own `403` before calling upstream when the cookie says non-admin. Both paths converge on `403` for the client.

Explanation: The message is Nest's generic English `"Forbidden"`, not a Spanish KraftError, and it carries no `code` field. The frontend must render its own Spanish unauthorized copy and never surface this body to the user.

IV: Question: Which fields are returned for an already-decided (`approved`/`rejected`) or `cancelled` request?

Status: answered

Answer: The same admin item shape as the list (`formatAdminRequest()` in `balance.service.ts`), differing only by status. Approved/rejected populate `decisionReason` and `decisionAt` with the decision details and `adminInCharge` with the deciding admin's email. Cancelled leaves `decisionReason`/`decisionAt` undefined and `adminInCharge` `null`, since the owner cancelled it and no admin was ever assigned.

Context: `AdminBalanceRequestDto` already types all four as conditional/nullable, so no DTO change is required. The read-only detail hides absent rows rather than rendering blanks.

Explanation: A `cancelled` request therefore renders with the `Sin asignar` admin placeholder and no decision-reason row — visually distinct from a rejected one, which is correct: nobody rejected it.

### UI And Product Decisions

I: Question: Is the deep-link surface a full page or the Story 4 drawer?

Status: answered

Answer: A full page at `/dashboard/requests/{requestId}` (epic UI Open Question VII), standalone rather than wrapped in the dashboard shell — no `Aside`, no mobile header drawer, just the detail plus a `Volver al panel` back action. (User-confirmed.)

II: Question: What does the admin see after approving or rejecting from this page?

Status: answered

Answer: They stay on the page. The single request is refetched and re-renders read-only with its new status, alongside a link back to the dashboard. No redirect and no optimistic state. (User-confirmed.)

III: Question: Where does `Volver al panel` lead, given the admin queue is not URL-addressable?

Status: answered

Answer: `/dashboard`. The `Solicitudes de saldo` queue is local `Dashboard` state with no URL of its own, and making it addressable is out of scope for this story.

IV: Question: Does the decided read-only state need an explicit success banner?

Status: answered

Answer: Yes, and it is stronger than a banner. `story-5-email-deep-link-comp-decision-taken.png` replaces the whole detail card with a success panel: success icon, heading `Decisión registrada`, a body line confirming the request was updated and is available in the admin queue, and two actions — primary back-to-dashboard and secondary `Ver solicitud actualizada`, which reveals the refetched decided read-only detail. The admin stays on the same URL throughout, so the earlier "stay on the page" decision is unchanged; the comp only inserts a confirmation step before the read-only state.

Context: This makes the read-only decided detail reachable in two ways — via `Ver solicitud actualizada` right after deciding, and directly on any later visit to the URL. Both render the same component.

V: Question: The comps render the dashboard sidebar around all three states. Does the page adopt the dashboard shell?

Status: answered

Answer: No. The page stays standalone; the comps' sidebar is treated as illustrative context, not a shell requirement. Extracting `Aside` out of the client-only `Dashboard` component into a shared shell or a dashboard layout is deliberately deferred as follow-up work. (User-confirmed, reaffirming the original decision against the comps.)

Context: The unauthorized comp additionally renders the **admin** sidebar (`Solicitudes de saldo`, `Margen de ganancia`, `Sesión administrativa`) on a screen that only non-admins ever see. That panel is internally inconsistent, which is further reason not to treat the comp chrome as binding.

VI: Question: The comps label the back action `Volver a solicitudes` and point it at the admin queue. What does the link actually do?

Status: answered

Answer: The label becomes `Volver al panel` and the link goes to `/dashboard`. The admin queue is local `Dashboard` state with no URL, so the comp's destination cannot be delivered without adding URL-state plumbing to `Dashboard` — out of scope here. Relabelling keeps the link honest rather than promising a destination it does not reach. The same relabel applies to the success panel's primary action. (User-confirmed.)

Context: A `dashboard-screen` cookie already exists via `saveDashboardScreen`, but `Dashboard` never reads it on mount, so it cannot be leaned on to restore the queue either. Making the queue addressable (a `screen` param read on mount, or reading that cookie) is the natural follow-up if the comp's destination is wanted later.

VII: Question: The comp's decision buttons differ from the shipped `BalanceDecisionForm`. Which wins?

Status: answered

Answer: The component, reused unchanged. The comp shows `Aprobar solicitud` as a primary navy button on the left and `Rechazar solicitud` as a neutral outline on the right; `BalanceDecisionForm` renders `Rechazar solicitud` (red outline) on the left and `Aprobar solicitud` (green) on the right. The page accepts that mismatch rather than modifying shipped Story 4 UI or adding a variant prop. Page and drawer stay behaviorally and visually identical. (User-confirmed.)

Context: This preserves the whole point of Story 4's reusable extraction — mounting the component costs nothing and risks nothing in the already-delivered drawer. The comp also adds a `Selecciona una acción para continuar.` subtitle under `Registrar decisión`, which the page can render around the component without touching it.

### Authorization And Routing

I: Question: How far should this story go to satisfy AC4's "preserving the request URL when feasible"?

Status: answered

Answer: All the way. The server page redirects to the login route carrying the encoded request URL; `src/app/page.tsx` passes the sanitized value into the login UI and redirects an already-authenticated visitor straight to it; `LoginCard` pushes it after a successful login, falling back to `DASHBOARD_ROUTE`. This is the one cross-feature change in the story. (User-confirmed.)

II: Question: What prevents the return-URL parameter from becoming an open redirect?

Status: answered

Answer: A single shared sanitizer used by both the server page and `LoginCard`: accept only same-origin paths beginning with one `/`, reject `//`, `/\`, and any value containing a scheme, and allowlist the `/dashboard` prefix. Anything else falls back to `DASHBOARD_ROUTE`.

III: Question: Can a regular user open `/dashboard/requests/{requestId}` for their own request?

Status: answered

Answer: No. The route is admin-only (epic Authorization Open Question III). A loaded non-admin sees the Spanish unauthorized screen, and the backend's database role check remains authoritative.

IV: Question: How is a missing or unparseable `user-info` cookie treated?

Status: answered

Answer: As non-admin — the unauthorized screen. `getUserInfo()` returns `null` in both cases, and the BFF guard would reject the fetch regardless. Failing closed is the correct default.

V: Question: Should `LoginRequiredModal` be reused for the unauthenticated case?

Status: answered

Answer: No. It is dismissible and carries no return URL, which the epic flagged as unsuitable for a deep link. This route uses a server-side `redirect()` instead. `/dashboard`'s existing modal behavior is unchanged.

## Assumptions

- `GET /balance/requests/admin/{requestId}` is served from `BACKEND_URI`, accepts the existing bearer token, and enforces the admin role against the database.
- A missing or malformed-ID request returns a flat `404 BAL_NF_001`, and a non-admin caller returns an enveloped `403 Forbidden`; both are preserved verbatim by the BFF (confirmed, Open Questions II and III).
- A decided request returns the same field set as its admin-list counterpart with `decisionReason`/`decisionAt`/`adminInCharge` populated; a cancelled request leaves those undefined/`null` (confirmed, Open Question IV).
- Timestamps remain UTC ISO 8601 strings rendered through the shared business-timezone helpers.
- `AdminBalanceRequestDto` needs no change; only a single-request response envelope is added.
- `BalanceDecisionForm` is mounted unchanged, and its existing `['balance', 'requests']` invalidation is what refetches this page after a decision.
- Request IDs are opaque strings, safe as URL path segments once encoded.
- The backend builds the email CTA as `FRONTEND_URI` + `/dashboard/requests/{requestId}`; the frontend's only obligation is keeping that path stable.
- The design phase resolves the standalone page's visual layout without changing the behavioral acceptance criteria above.

## Non-Obvious Findings

- The comps render the dashboard sidebar around all three states, but the story deliberately does not adopt it — the chrome lives inside the client-only `Dashboard` component and extracting it is a separate refactor. The unauthorized comp is itself evidence the chrome is not binding: it shows the **admin** sidebar and `Sesión administrativa` on a screen only non-admins ever reach.
- The comps' `Volver a solicitudes` back destination cannot be delivered: the admin queue is local `Dashboard` state with no URL, and the existing `dashboard-screen` cookie is written by `saveDashboardScreen` but never read on mount. The link is relabelled `Volver al panel` → `/dashboard` rather than lying about where it goes; making the queue addressable is logged as follow-up.
- The comp's decision buttons invert the shipped component — `Aprobar` primary-navy on the left and `Rechazar` outline on the right, versus `BalanceDecisionForm`'s red-outline `Rechazar` left and green `Aprobar` right. Reusing the component unchanged accepts that mismatch, which is the cheaper trade than editing shipped Story 4 UI and its tests.
- The comp repeats Story 4's `SOL-2098` placeholder in the `ID de solicitud` row. It remains stylistic; the backend returns only the opaque ObjectId, which is also what the email link carries.
- Story 4 already paid this story's largest cost: `BalanceDecisionForm` takes only `requestId`/`onDecided` and owns its own mutation and invalidation, so the full page reuses the entire approve/reject flow — including the flat `409 BAL-BUS-002` conflict handling — with zero changes to it.
- The detail query key `['balance', 'requests', 'admin', requestId]` nests under the prefix `BalanceDecisionForm` already invalidates, so the post-decision read-only state comes for free from the existing invalidation. No new cache wiring is needed to satisfy AC5.
- There is no `src/app/dashboard/layout.tsx`, so this nested page inherits nothing from `/dashboard` — not the cookie read, not the Flowbite `createTheme` override, not `LoginRequiredModal`. That is an advantage here: the dashboard's theme override forces drawer header text to white and would have been a hazard for any light-surface drawer, but the standalone page uses none.
- Nothing in `src/` currently reads a search param — `useSearchParams` appears nowhere. AC4's return-URL preservation is genuinely new plumbing, and passing the sanitized value down from the server page as a prop avoids introducing the first `useSearchParams` (and its potential build-time Suspense requirement) into the codebase.
- `LoginCard` pushes `DASHBOARD_ROUTE` inside a one-second `setTimeout` after login success; the return-URL change must go inside that same callback, not alongside it, or the redirect races the success animation.
- `Volver al panel` cannot land on the admin queue: `Solicitudes de saldo` is local `Dashboard` state with no URL. An admin arriving from email and clicking back lands on the default dashboard screen — accepted for this story, and the reason the deep link exists at all.
- The static `admin` segment in `/api/balance/requests/admin/[requestId]` shadows a literal request ID of `admin` in the sibling `[requestId]` routes. Unreachable with Mongo ObjectIds, but it is the reason the new handler nests under `admin/` rather than reusing the existing `[requestId]` folder.
- The drawer's read-only sentence (`Esta solicitud ya fue decidida y no admite más acciones.`) is the only Balance string still inlined in a component rather than living in `balance.constants.ts`; the page needs it too, which is the natural moment to promote it.
- The frontend cannot verify admin access before authentication, so the unauthenticated case must redirect to login rather than showing the unauthorized screen — the two states answer different questions and must not be collapsed.
- Balance now has **three** distinct backend error shapes across three statuses: a flat `404` KraftError (`data.code === 'BAL_NF_001'`), an enveloped `403` (`data.error.statusCode`, no `code` field at all), and a flat `409` KraftError (`data.code === 'BAL-BUS-002'`). The two KraftError codes do not even share a separator — `BAL_NF_001` uses underscores, `BAL-BUS-002` uses hyphens. Any error handling here must branch on HTTP status first and treat codes as exact literals; a shared "read `data.code`" helper would silently return `undefined` for the `403`.
- A malformed `requestId` and an unknown-but-valid one both return `404 BAL_NF_001`, so the frontend needs no separate ID-format validation — a truncated email link degrades into the not-found state on its own.
- A `cancelled` request carries `adminInCharge: null` and no `decisionReason`/`decisionAt`, because the owner cancelled it and no admin was ever assigned. It is the one non-`pending` status that renders with the `Sin asignar` placeholder, which is correct rather than a missing-data bug.
