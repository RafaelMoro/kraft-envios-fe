# Add Balance Epic Research

## Story Definition

### Epic Title

Add balance visibility, funding requests, and administrative approval.

### Epic Description

Authenticated users need to see their current account balance, create an addition request, make the bank payment, review their requests, and cancel requests that are still pending. Administrators need to review requests across users, filter the queue by the backend-supported month, year, and `pending | all` status, and approve or reject a pending request.

The backend sends administrators an email when a request is created. That email must gain a button linking to a specific request in this frontend. The accepted URL direction is a dynamic route such as `/dashboard/requests/{requestId}`. The supplied backend contract does not include a way to fetch one request by ID, so that deep-link flow has an unresolved backend dependency.

Visual design is intentionally outside this research document. A design tool will decide the final surfaces and presentation after receiving the UX requirements, states, copy, responsive constraints, and existing design-system references documented here.

### Scope Classification

Epic spanning five independently deliverable stories.

### Research Mode

Full research, with contracts and architecture prioritized.

### User-Confirmed Decisions

- Research the complete epic rather than one story.
- Document UX requirements but defer visual design and exact placement to a design tool.
- Use MXN amounts greater than zero with up to two decimal places.
- Prefer a dynamic request route and record the missing single-request API as a backend gap.
- Defer admin filtering by user because the paginated endpoint has no user-filter query.
- Admin status filtering means `pending` or `all`, matching the supplied endpoint contract.
- Only `pending` requests can be cancelled, approved, or rejected.
- Users may have multiple pending requests, including duplicate amounts.
- The user makes the bank payment after creating the balance-addition request.
- The canonical business and display timezone is `America/Mexico_City`; backend and frontend deployments must use the same configured value.

### Epic Acceptance Criteria

1. An authenticated user can see an accurate MXN balance on the dashboard on desktop and mobile/tablet, including an explicit `$0.00` state.
2. A user can submit a valid balance-addition request, receive clear Spanish confirmation that bank-payment verification and admin approval are pending, and see the new request in their history.
3. A user can review their own paginated requests and cancel an eligible request, with status changes reflected from authoritative backend data.
4. An admin can review requests for a selected month/year using `pending` or `all`, open a request, and approve it with a payment reference or reject it with an optional reason.
5. An authenticated admin can follow an email button to a deep-linkable request detail route; non-admin and unauthenticated access remains blocked by backend authorization and appropriate frontend access handling.

### Out Of Scope

- Visual design, component mockups, and final choice between header, sidebar, card, drawer, modal, or full-page presentation.
- Admin filtering by user until the backend supports filtering across the full paginated result set.
- Admin status filters beyond `pending` and `all`.
- Uploading payment receipts or other proof-of-payment files; no endpoint supports it.
- Editing a request amount after creation.
- Automatic bank reconciliation, payment-provider integration, refunds, withdrawals, debits, or a transaction ledger.
- Real-time updates through WebSockets or server-sent events.
- Changes to the external backend email implementation; this repository can only define the frontend URL contract it must target.
- Global normalization of existing BFF response or error shapes.

## Epic Structure

### Story 1: Display Current Balance

Status: Completed

Description:

Expose the authenticated user's current balance throughout the dashboard with responsive parity.

Acceptance criteria:

1. The UI retrieves the current user's balance from `GET /balance` through an authenticated Next route handler.
2. The amount is formatted as MXN with two decimal places, and zero is rendered as `$0.00` rather than hidden.
3. Loading, error, and loaded states do not block unrelated dashboard navigation.
4. The balance surface is available in equivalent desktop and mobile/tablet experiences.

### Story 2: Create A Balance Request

Description:

Allow a user to request a positive MXN addition through `POST /balance/requests`, then make the bank payment, and explain the manual verification process in Spanish.

Acceptance criteria:

1. The form accepts MXN values from `0.01` through `100000.00` with no more than two decimal places and submits `{ "amount": number }`.
2. Duplicate network submission is prevented while the create mutation is in flight; this does not prevent the user from creating multiple pending requests afterward.
3. A successful response shows the amount and a Spanish message explaining that the payment will be checked in the bank account before an admin approves the request.
4. The successful request becomes visible in the user's request history without requiring a full-page reload.
5. Backend validation or transport failures are shown without presenting a false success state.

Recommended confirmation copy for design review:

> **Solicitud recibida**
>
> Recibimos tu solicitud para agregar **{amount} MXN** a tu saldo. Después de que realices el pago, verificaremos que se refleje en nuestra cuenta bancaria. Cuando lo confirmemos, un administrador aprobará la solicitud y actualizaremos tu saldo. Puedes consultar el estado en **Solicitudes de saldo**.

Short variant for a toast or compact result:

> Recibimos tu solicitud. Después de que realices el pago, lo verificaremos en nuestra cuenta bancaria antes de aprobar la solicitud y agregar el monto a tu saldo.

Copy guidance:

- Use `solicitud recibida`, not `saldo agregado`, because creation does not change the balance.
- Do not promise an approval time until an operational service level is defined.
- Keep the amount visible so the user can verify what was submitted.
- Point to request history so the message does not imply email or real-time notification behavior that is not specified.

### Story 3: Review And Cancel Own Requests

Status: Completed

Description:

Give users a list of their own requests from `GET /balance/requests`, including status and date information, and allow cancellation through `PATCH /balance/requests/{balance-id}/cancel` when the request is eligible.

Acceptance criteria:

1. A user sees only their own requests with amount, Spanish status, creation date, and decision date when supplied.
2. The list supports backend pagination using `page`, `limit`, `total`, and `totalPages` once the request-query contract is confirmed.
3. A cancellation action is available only while the request status is `pending` and requires confirmation before the mutation.
4. Successful cancellation updates the request to `cancelled`; failed or conflicting cancellation preserves the authoritative prior state and shows an error.
5. Loading, empty, error, and populated states work on desktop and mobile/tablet.

Backend dependency for this story:

- Add a validated `BUSINESS_TIMEZONE=America/Mexico_City` backend environment variable and implement regular-user month filtering with Luxon, using an inclusive local-month start and exclusive next-month start.
- Continue returning UTC ISO 8601 timestamps so the frontend can display them in the same agreed IANA timezone.
- Frontend side is delivered: Story 6 shipped `NEXT_PUBLIC_BUSINESS_TIMEZONE` enforcement and `date.utils.ts`; this story consumes `formatDateToSpanish`/`getBusinessCalendarMonthYear`. See `review-cancel-own-requests.story-3.md`.

Suggested status labels:

- `pending`: `Pendiente`
- `approved`: `Aprobada`
- `rejected`: `Rechazada`
- `cancelled`: `Cancelada`

### Story 4: Admin Request Queue And Decisions

Description:

Allow admins to query all requests for a selected month and year, switch between `pending` and `all`, inspect a request, and make one approve/reject decision.

Acceptance criteria:

1. Admin queries include month, year, page, limit, and `status=pending|all`; all server-affecting values are represented in cached query identity.
2. The queue shows request amount, status, timestamps, user name/email, payment reference when present, and admin in charge when present.
3. For a `pending` request, the detail UI presents a positive `Aprobar` action requiring a non-empty `paymentReference` and a negative `Rechazar` action permitting an optional reason; other statuses are read-only.
4. After either successful decision, affected request lists and current balance data are treated as stale and authoritative backend state is retrieved.
5. Non-admin users do not see admin controls, while the backend remains the authorization source of truth for direct calls.

Backend dependency for this story:

- Add a validated `BUSINESS_TIMEZONE=America/Mexico_City` backend environment variable and implement admin month filtering with Luxon, using an inclusive local-month start and exclusive next-month start.
- Continue returning UTC ISO 8601 timestamps so the frontend can display them in the same agreed IANA timezone.

### Story 5: Email Deep Link To Admin Review

Description:

Provide a stable frontend destination for the email button so an admin can open the specific request and approve or reject it without first locating it in the queue.

Acceptance criteria:

1. The frontend exposes a route shaped as `/dashboard/requests/{requestId}` using the opaque request ID from the email.
2. The route loads the identified request from an authenticated, admin-authorized backend contract rather than searching only the current page of a monthly list.
3. An authenticated admin sees request details and eligible decision actions; an already-decided, cancelled, or missing request shows its current state without actionable approval controls.
4. Unauthenticated access redirects to login while preserving the request URL when feasible. A loaded non-admin user sees an unauthorized screen, and backend database authorization still prevents request retrieval or decisions.
5. The backend email button uses `FRONTEND_URI` plus the encoded request route and request ID.

Follow-up dependency owned by this story:

- Add or confirm an authenticated, admin-authorized backend GET endpoint that returns one balance request by `requestId`, so `/dashboard/requests/{requestId}` can render request details before showing `Aprobar` and `Rechazar`.
- The endpoint contract must define its response envelope and behavior for missing, forbidden, cancelled, and already-decided requests.

Recommended unauthorized copy for design review:

> **No tienes acceso a esta solicitud**
>
> Esta página está disponible únicamente para administradores. Inicia sesión con una cuenta de administrador o vuelve al panel principal.

Suggested action: `Volver al panel`.

## Technical Research

### Current State Summary

- Story 1 is complete: `src/features/Balance/BalanceDisplay.tsx` retrieves the current balance through `src/app/api/balance/route.ts`, formats zero-safe MXN values, and is covered by focused route, feature, and dashboard tests.
- Story 2 is complete: `src/features/Balance/BalanceRequestDialog.tsx` creates a request through `src/app/api/balance/route.ts` `POST` and already invalidates the `['balance', 'requests']` query prefix on success; no history query consumes that seam yet.
- Story 6 (business-timezone configuration) is complete: `src/shared/utils/date.utils.ts` exports `formatDateToSpanish`, `getBusinessCalendarMonthYear`, and `toBusinessDateRange`, all pinned to `BUSINESS_TIMEZONE`. `NEXT_PUBLIC_BUSINESS_TIMEZONE=America/Mexico_City` is enforced at Next config load and set in `jest.config.ts`. Stories 3 and 4 consume these primitives directly; no new frontend timezone plumbing remains.
- `src/app/dashboard/page.tsx` is the only dashboard page. It reads auth cookies server-side and dynamically renders the client-only `Dashboard`.
- `src/features/Dashboard/Dashboard.tsx` switches dashboard content with local `DashboardScreens` state. Screen selection does not alter the URL, browser history, or deep-link state.
- `src/shared/types/dashboard.types.ts` only permits `quotes`, `overview`, `marginProfit`, and `addresses`.
- Desktop and mobile/tablet use separate shell branches. Persistent desktop UI is the sidebar in `src/shared/ui/organisms/Aside.tsx`; persistent mobile UI is the header and `HeaderMenuDrawer`.
- There is no common content header shared by every dashboard screen. Existing subscreens repeat their own welcome heading.
- Admin role is represented by `LoginData.data.user.role: ('user' | 'admin')[]` and checked with `role.includes('admin')`.
- `src/features/QueryProviderWrapper.tsx` provides TanStack Query with a per-provider `QueryClient` and a default 60-second `staleTime`.
- Existing paginated admin UI in `Order.tsx` already models month/year/limit state, query keys, responsive filters, cards/details, and pagination.
- Existing BFF handlers proxy `BACKEND_URI` with `getAccessToken()` and a bearer token. `src/app/api/guides-db/route.ts` is the closest collection/list precedent.
- Existing backend envelopes are inconsistent. Guides DB returns `{ version, data, message, error }` unchanged and is the closest match to the supplied balance responses.
- Balance uses the dedicated zero-safe `formatBalanceMxn()` formatter in `src/shared/utils/balance.utils.ts`; `formatNumberToCurrency()` remains unsuitable for this domain because it formats USD and hides `0`.
- The supplied examples mix API versions `1.5.0` and `1.6.0`; frontend DTOs should not branch behavior on those example version values.

### Affected Areas

Routes/pages:

- `src/app/dashboard/page.tsx`: existing authenticated dashboard boundary and Flowbite theme context.
- `src/app/dashboard/requests/[requestId]/page.tsx`: likely route boundary for the accepted deep link. This path does not exist and cannot be represented by current local dashboard screen state alone.
- Any nested route must preserve the auth, theme, desktop/mobile shell, and role context currently owned directly by `dashboard/page.tsx`; there is no `src/app/dashboard/layout.tsx` today.

API route handlers:

- Authenticated current-balance and create-request proxy coverage exists; further handlers are needed for own request collection, cancellation, admin request collection, decision, and the now-available admin single-request lookup (`GET /balance/requests/admin/{requestId}`).
- Existing route layout under `src/app/api/**/route.ts` supports collection and dynamic-ID handlers.
- Dynamic IDs should be URL encoded before constructing upstream URLs, matching `src/app/api/guides-db/[kraftId]/route.ts`.
- Admin decision and single-request access may use a defensive Next-side role check like the hard-delete guide route, but backend authorization remains mandatory because the `user-info` cookie is not an authoritative security boundary.

Feature UI:

- Further balance domain UI belongs in the existing `src/features/Balance/` boundary rather than expanding unrelated quote, guide, or margin components.
- Dashboard shell integration affects `src/features/Dashboard/Dashboard.tsx`, `src/shared/ui/organisms/Aside.tsx`, and `src/shared/ui/organisms/HeaderMenuDrawer.tsx` if requests become a dashboard destination.
- Desktop and mobile navigation must be handled together. The existing margin screen is hidden for non-admins on desktop but exposed in the mobile drawer, demonstrating the risk of one-sided role changes.
- `Order.tsx` is the closest active precedent for user/admin list modes, month/year filters, query enablement, cards/details, and pagination.
- Existing Flowbite modal patterns support request creation, cancellation confirmation, and decisions if design chooses modals. Existing in-place `GuideDbDetails` supports a list/detail alternative. Final choice is deferred.

Shared code:

- Balance request/status/response types belong under `src/shared/types`.
- API endpoint constants belong under `src/shared/constants`.
- Axios callbacks that call only the local `/api` BFF belong under `src/shared/utils`, following guides and addresses.
- No centralized service layer, query-key factory, role hook, or state store exists; none is required for research scope.
- The existing dedicated Balance formatter is zero-safe and reusable for balance-request confirmation amounts.

Tests:

- Feature behavior belongs under `__tests__/feature/Balance/` or the matching dashboard feature boundary.
- Shared reusable UI tests belong under `__tests__/components/`.
- `__tests__/mocks/` may hold typed fixtures but is ignored as a suite.
- `__tests__/api/balance.route.test.ts` is the focused route-handler precedent for further balance BFF methods.

### Existing Patterns To Follow

App Router server/client split:

- Read session and user cookies only in server code.
- Browser code calls local `/api` handlers and never exposes `BACKEND_URI` or the bearer token.
- Client components own TanStack Query, forms, filters, mutations, and interactive Flowbite components.
- A deep link must be represented by an App Router path, not only `Dashboard` local state.

TanStack Query:

- Keep the `QueryClient` inside `QueryProviderWrapper`; do not move it to module scope.
- Include month, year, page, limit, status, role/scope, and request ID in the relevant query keys.
- Gate admin queries by role and active surface with `enabled` where appropriate.
- After create, cancel, approve, or reject, invalidate the common balance/request query prefix rather than maintaining speculative money state.
- Avoid optimistic balance updates; the bank-verification and admin-decision flow requires authoritative server results.

Forms and validation:

- Existing forms use `react-hook-form`, `yup`, and `@hookform/resolvers`; no new form dependency is needed.
- Amount validation must enforce `0.01` through `100000.00` and reject zero, negative, malformed, and over-precision input so users do not encounter the backend's silent truncation behavior.
- Approval must require `paymentReference`; rejection reason remains optional according to the supplied contract.

Flowbite, Tailwind, and design:

- `DESIGN.md` requires Flowbite React, Tailwind v4, Geist Sans, neutral dashboard surfaces, primary blue actions, danger styling for destructive actions, and existing dark-mode behavior.
- Balance and request experiences need explicit loading, error, empty, populated, submitting, success, stale/conflict, and unauthorized states for design input.
- Cards are the active responsive dashboard list pattern; the only Flowbite table is unused. This is context for design, not a mandated final layout.

Route-handler proxy style:

- Preserve authenticated bearer forwarding and the direct balance backend envelope.
- Explicitly allowlist forwarded query parameters rather than forwarding arbitrary search params.
- Existing handlers commonly collapse errors to HTTP 400; decision/cancellation conflicts and forbidden access need contract confirmation before deciding whether this domain preserves upstream statuses.
- Do not normalize unrelated existing routes as part of this epic.

### Backend Contracts Supplied By The User

Current balance:

- `GET /balance`
- Data: `{ balance: { amount: number } }`

Amount contract:

- API values are MXN major-unit numbers; backend storage uses integer cents with a safe-integer guard.
- Effective minimum is `0.01`; maximum is `100000.00` through backend `@Max(100000)` validation.
- Backend conversion truncates rather than rounds after two decimal places: `1.159` becomes `1.15`, and `1.999` becomes `1.99`.

Own requests:

- `POST /balance/requests` with `{ amount: number }`
- POST success is `201 Created` with `{ version, data: { request }, message: null, error: null }`.
- The created request has `id`, `amount`, optional `paymentReference`, `status: 'pending'`, `decisionReason: null`, `decisionAt: null`, and UTC ISO `createdAt`/`updatedAt` values.
- POST DTO validation returns `400` with Nest's raw `{ statusCode, message: string[], error }` body nested under the standard envelope's `error`.
- POST domain failures use `{ code, message, technicalDetails? }` under the standard envelope's `error`: `401 BAL-AUTH-001`, `400 BAL-BUS-003`, or `400 BAL-BDN-001`.
- Admin notification is best-effort after request creation, and the service has no duplicate-pending-request check.
- `GET /balance/requests` returning `{ requests, total, page, limit, totalPages }`
- Optional GET queries: integer `month` from 1-12, integer `year` greater than or equal to 1, positive integer `page` defaulting to 1, and positive integer `limit` defaulting to 10.
- `PATCH /balance/requests/{balance-id}/cancel` with no body

Admin requests:

- `GET /balance/requests/admin`
- Queries: `month`, `year`, `page`, `limit`, `status=pending|all`
- `PATCH /balance/requests/{balance-id}/decision`
- Approve body: `{ action: "approve", paymentReference: string }`
- Reject body: `{ action: "reject", reason?: string }`

Common request fields observed across responses:

- Required: `id`, `amount`, `status`, `createdAt`, `updatedAt`
- Conditional: `paymentReference`, `decisionAt`, `userEmail`, `userName`, `adminInCharge`
- Status values observed: `pending`, `approved`, `rejected`, `cancelled`

Admin single-request lookup (supplied by the backend; unblocks Story 5):

- `GET /balance/requests/admin/{requestId}` for an authorized admin.
- Success envelope: `{ version, data: { request }, message: null, error: null }`.
- Example `data.request`: `{ id, amount, status, createdAt, updatedAt, userEmail, userName, adminInCharge }`; a `pending` example returns `adminInCharge: null` and omits `paymentReference`/`decisionAt`/`decisionReason`, consistent with the conditional-field pattern.
- The `/admin/` path segment makes this admin-only, matching the epic decision that `/dashboard/requests/{requestId}` is admin-only (Authorization Open Question III). A regular user does not use this endpoint.
- Still to confirm with the backend: exact status/body for missing (`404`), forbidden (`401`/`403`), and the fields returned for already-decided (`approved`/`rejected`) or `cancelled` requests.

### Data And Cache Relationships

- Creating a request affects own request history but does not immediately increase current balance.
- Cancelling affects own request history but should not change current balance.
- Rejecting affects admin request lists and the request detail but should not change current balance.
- Approving affects admin request lists, request detail, the request owner's history, and the owner's current balance.
- Because admin and user sessions are separate clients, local invalidation after admin approval cannot push an update into the user's open browser. Refresh behavior remains a product decision.
- Query data is user-sensitive. The existing per-mounted-provider QueryClient prevents module-level sharing and must remain unchanged.

### Authorization And Security

- The access token is held in an httpOnly session cookie and extracted by Next server code.
- `user-info` is a separate httpOnly JSON cookie used for UI role gating. It is not sufficient as the only authorization control.
- Loaded `user-info` without the `admin` role is sufficient to present an unauthorized screen, but not to make the final authorization decision.
- Backend enforcement is required for admin list, single-request review, approve, and reject.
- The backend validates the current user's admin role against the database rather than trusting a role claim from the bearer JWT.
- Backend enforcement is required to ensure a regular user can list and cancel only their own requests.
- Request IDs in URLs must be treated as untrusted input and URL encoded for upstream requests.
- Decision actions should tolerate stale links and concurrent admin decisions by displaying the backend's authoritative status rather than assuming the requested transition succeeded.

### Edge Cases And Constraints

- Zero balance must display; the current shared formatter hides it.
- MXN request values have an effective range of `0.01` through `100000.00`. Backend storage uses integer cents guarded by `Number.isSafeInteger`-equivalent validation.
- The backend truncates over-precision values to two decimal places rather than rounding. FE should reject more than two decimal places to avoid silently changing a user's requested amount.
- A request may be approved, rejected, or cancelled between list rendering and action submission.
- Cancellation, approval, and rejection are allowed only while the request status is `pending`.
- The reject response does not include the submitted reason, so own/admin history cannot reliably display it from the shown contract.
- `paymentReference` appears only after approval and is mandatory in the approve payload; no additional format, length, or uniqueness rule exists yet.
- The regular-user list supports optional month/year filters and positive page/limit values; status filtering is not part of its documented query DTO.
- Admin month/year filters currently use the Node host-local timezone, so behavior is deployment-dependent until the backend adopts `BUSINESS_TIMEZONE=America/Mexico_City` with Luxon.
- Backend dates remain UTC ISO 8601 strings. FE must convert them with `NEXT_PUBLIC_BUSINESS_TIMEZONE=America/Mexico_City` rather than browser-local time or a fixed UTC offset.
- Month filters must use inclusive local-month start and exclusive next-month start boundaries converted with timezone-aware rules. Records belong to the month in the business timezone, including across DST and UTC month boundaries.
- Browser-local timezone is not an allowed fallback. Missing or invalid frontend timezone configuration must surface as a configuration error rather than silently changing date semantics.
- The current dashboard has no nested layout and no shared responsive header, so design must account for desktop sidebar and mobile header separately.
- The dashboard's saved screen cookie is written but not read on initial load. Request navigation must not rely on preference restoration.
- Existing `LoginRequiredModal` can be dismissed while the dashboard remains mounted. Deep-link authentication behavior needs an explicit decision rather than inheriting that behavior unnoticed.
- Tests always collect coverage, which can make even focused runs slower.
- `product-sat` uses a separate external URI; it is unrelated to this epic. Balance routes use `BACKEND_URI`.

### Dependencies And Integration Points

- No new frontend dependency is required.
- Existing dependencies cover HTTP, server routing, queries, forms, validation, responsive Flowbite UI, icons, and tests.
- Add `NEXT_PUBLIC_BUSINESS_TIMEZONE=America/Mexico_City` to frontend deployment configuration and `.env.example`. Next.js exposes this value to browser code at build time.
- Backend deployment configuration must set and validate `BUSINESS_TIMEZONE=America/Mexico_City` as an IANA timezone.
- Both deployments must use the same timezone value; browser-local timezone must not be used as fallback policy.
- A public backend configuration endpoint may expose the effective timezone for stronger runtime consistency, but it is optional when deployments are managed together.
- `BACKEND_URI` is the upstream base for all supplied balance endpoints.
- `FRONTEND_URI` is the existing origin the backend email service can use to construct the dynamic request URL.
- Backend/email work must place the request ID in the button URL and needs deployment coordination with the frontend route.
- The separate design tool needs this document plus `DESIGN.md` and representative dashboard files before producing UI artifacts.

### Testing Rules To Follow

From `.github/copilot-instructions.md`:

- Use `userEvent`, not `fireEvent`.
- Do not mock internal feature/shared components to avoid rendering their behavior.
- Mock network callbacks and unavailable browser APIs only.
- Use relative paths in `jest.mock()` for project hooks/modules.
- Use a fresh QueryClient with retries disabled for query-driven feature tests.
- Do not assert CSS classes, colors, layout, or other visual implementation details.
- Query by role, accessible name, label, visible text, or a justified test ID.
- Use explicit balance DTO types in fixtures; do not use `any` or `unknown`.
- Ensure mock data matches the callback's actual unwrapped shape.
- Preserve existing skipped tests.

Smallest useful coverage by story:

- Balance: loading/error/zero/positive display and desktop/mobile access behavior.
- Create: amount validation, exact payload, duplicate-submit prevention, success copy, and request-list invalidation.
- Own list: populated/empty/error/pagination states, cancellation success/conflict behavior, and timestamp display using `America/Mexico_City` rather than browser-local time.
- Admin: role gating, month/year/status query values, timezone-boundary records, approval reference validation, optional rejection reason, and decision invalidation.
- Deep link: request ID loading, admin/unauthorized states, already-decided state, and approve/reject from the direct route.

## Story Readiness And Blockers

- Story 1, Display Current Balance: completed.
- Story 2, Create A Balance Request: completed.
- Story 6, Business-Timezone Configuration: completed. Frontend `NEXT_PUBLIC_BUSINESS_TIMEZONE` is enforced and the shared `date.utils.ts` primitives are delivered. Researched and planned as `timezone-configuration.story-6.md`.
- Story 3, Review And Cancel Own Requests: completed. Implementation delivered with timezone-aware date display and cancellation workflows; relies on backend delivery of validated `BUSINESS_TIMEZONE=America/Mexico_City` and Luxon-based month boundaries.
- Story 4, Admin Request Queue And Decisions: completed. Implemented per `ai-planning/balance-addition/planning-admin-request-queue-decisions.story-4.md`: admin DTOs/callbacks/constants (Phase 1); the `GET /api/balance/requests/admin` and `PATCH /api/balance/requests/[requestId]/decision` BFF routes with a defensive `getUserInfo()` admin guard and status-preserving proxying, including the flat `409 BAL-BUS-002` conflict (Phase 2); the `BalanceAdminScreen`/`BalanceAdminRequestCard`/`BalanceAdminRequestDrawer`/`BalanceDecisionForm` feature surface, with `BalanceDecisionForm` built for reuse by Story 5 (Phase 3); and dashboard wiring — the `balanceAdmin` screen value, mutually-exclusive role-gated nav entries in `Aside.tsx`/`HeaderMenuDrawer.tsx`, and closing the previously-ungated mobile "Margen de ganancia" entry (Phase 4). Full verification passed: `pnpm test` (92 suites, 1122 passed/3 pre-existing skipped), `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build`.
- Story 5, Email Deep Link To Admin Review: no longer blocked. The backend now supplies `GET /balance/requests/admin/{requestId}` to render `/dashboard/requests/{requestId}`; remaining confirmation is limited to status/body for missing, forbidden, and already-decided/cancelled requests.

## Open Questions

### Backend Contract

- I: Question: How does the email CTA open and act on a balance request?
  - Status: answered
  - Answer: The email CTA opens `/dashboard/requests/{requestId}`. That frontend UI shows Approve and Reject actions, and each action calls `PATCH /balance/requests/{balance-id}/decision` using the supplied decision contract.
- II: Question: What endpoint returns one request by ID so `/dashboard/requests/{requestId}` can load its details before a decision?
  - Status: answered
  - Answer: The backend now exposes `GET /balance/requests/admin/{requestId}` for authorized admins. It returns `{ version, data: { request }, message: null, error: null }`, where `request` includes `id`, `amount`, `status`, `createdAt`, `updatedAt`, `userEmail`, `userName`, and `adminInCharge` (a `pending` example returns `adminInCharge: null` and omits `paymentReference`/`decisionAt`/`decisionReason`). The `/admin/` path makes it admin-only, matching the admin-only `/dashboard/requests/{requestId}` decision.
  - Context: This resolves the previously missing single-request contract and unblocks Story 5. The BFF should URL-encode `requestId`, forward the bearer token, and preserve upstream statuses.
  - Explanation: Remaining backend confirmation is limited to exact status/body for missing (`404`), forbidden (`401`/`403`), and the fields returned for already-decided or cancelled requests.
- III: Question: Which query parameters does regular-user `GET /balance/requests` accept?
  - Status: answered
  - Answer: It accepts optional integer `month` (1-12), optional integer `year` (minimum 1), optional positive integer `page` (default 1), and optional positive integer `limit` (default 10). It does not document a status query.
  - Context: The response pagination fields correspond to the optional `page` and `limit` queries.
- IV: Question: Which decision controls should the admin UI show?
  - Status: answered
  - Answer: Show a positive `Aprobar` button and a negative `Rechazar` button. Both call `PATCH /balance/requests/{balance-id}/decision` with their corresponding action payload.
- V: Question: From which request statuses are cancel, approve, and reject legally allowed?
  - Status: answered
  - Answer: Only requests with status `pending` can be cancelled, approved, or rejected. Other statuses are read-only.
- VI: Question: Does the admin endpoint support only `status=pending|all` for the first delivery?
  - Status: answered
  - Answer: Yes. An admin can visualize all requests or only pending requests.
- VII: Question: Should backend HTTP statuses such as 401, 403, 404, 409, and validation failures be preserved by new BFF handlers?
  - Status: answered
  - Answer: Yes. New balance BFF handlers should preserve the relevant upstream HTTP status.
  - Context: Decision conflicts, authorization failures, missing requests, and validation failures require distinct frontend handling even though older BFF handlers often collapse errors to 400.
- VIII: Question: Is the rejection reason persisted and available from list/detail responses?
  - Status: answered
  - Answer: No. The rejection reason is not available from the documented list/detail response data and should not be shown as persisted history in the frontend.
- IX: Question: What timezone normalization contract will FE and BE follow for balance-request month filters and timestamp display?
  - Status: answered
  - Answer: The backend will continue returning UTC ISO 8601 timestamps. Backend month/year filters will use `America/Mexico_City` local-month boundaries with an inclusive start and exclusive next-month start, converted with Luxon. The frontend will convert UTC timestamps to `America/Mexico_City` for display. Fixed UTC offsets must not be used; DST and month-boundary records follow the business timezone.
  - Context: Filters currently use the Node host-local timezone and are deployment-dependent. For example, if `America/Mexico_City` at UTC-06:00 is selected, `2026-02-01T05:59:59.999Z` belongs to January and `2026-02-01T06:00:00.000Z` belongs to February. The backend team recorded this research in its `ai-research/timezone-month-filters.md` document.
- X: Question: What canonical IANA business and display timezone should FE and BE use?
  - Status: answered
  - Answer: Use `America/Mexico_City`. Backend sets and validates `BUSINESS_TIMEZONE`; frontend uses public `NEXT_PUBLIC_BUSINESS_TIMEZONE`; both deployments must configure the same value.
  - Context: Backend Stories 3 and 4 implement timezone-aware month boundaries with Luxon. Frontend date display uses the configured IANA timezone and never falls back to browser-local timezone. An optional public backend configuration endpoint can provide stronger runtime consistency.

### Create Payload And Payment Flow

- I: Question: What currency and client amount format should be used?
  - Status: answered
  - Answer: MXN, greater than zero, with up to two decimal places.
- II: Question: What backend minimum, maximum, and rounding policy applies to `amount`?
  - Status: answered
  - Answer: Effective minimum is `0.01`, maximum is `100000.00`, and values are truncated to two decimal places rather than rounded. Backend storage uses integer cents with an additional safe-integer guard.
  - Context: `1.159` becomes `1.15`; `1.999` becomes `1.99`. FE should reject over-precision input instead of silently relying on truncation.
- III: Question: When does the user make the bank payment relative to creating the request?
  - Status: answered
  - Answer: The user creates the balance-addition request first and makes the bank payment afterward.
- IV: Question: How does the admin know whether the user made the bank payment?
  - Status: answered
  - Answer: The admin receives a notification outside the web app and independently confirms the payment before choosing `Aprobar` or `Rechazar`.
  - Context: The frontend request payload remains amount-only; bank instructions, receipts, and user-entered transfer references are not part of this web-app flow.
- V: Question: May one user have multiple pending requests, including duplicate amounts?
  - Status: answered
  - Answer: Yes. Multiple pending requests and duplicate amounts are allowed.
- VI: Question: What validation rules apply to the admin `paymentReference`?
  - Status: answered
  - Answer: No specific validation rule exists yet beyond the field being mandatory for approval.

### UI And Product Decisions

- I: Question: Where should current balance and the request entry point appear?
  - Status: answered
  - Answer: Research documents responsive UX needs only; the design tool will decide exact placement.
  - Context: There is no shared desktop/mobile dashboard header. Persistent candidates differ: desktop sidebar and mobile header/drawer.
- II: Question: Should the recommended Spanish confirmation copy be accepted as written?
  - Status: answered
  - Answer: Yes. The default confirmation variant is approved.
  - Context: It avoids claiming the balance was already added and avoids an unconfirmed approval timeframe.
- III: Question: Should cancelling a request require a confirmation dialog?
  - Status: answered
  - Answer: Yes. Cancellation requires confirmation before the mutation.
- IV: Question: Should users see rejection reasons in their own history?
  - Status: answered
  - Answer: No. Rejection reasons are not returned by the documented list/detail contract.
- V: Question: Should users see approved payment references in their own history?
  - Status: answered
  - Answer: Yes. Show the payment reference when it is present on an approved request.
- VI: Question: How does a user learn that an admin approved the request?
  - Status: answered
  - Answer: The user receives an approval confirmation email.
- VII: Question: Should the direct admin request route render a full page, drawer, or modal-like detail surface?
  - Status: answered
  - Answer: Render the direct admin request route as a full page.
  - Context: It remains deep-linkable from the admin email CTA.

### Authorization And Routing

- I: Question: How is admin role detected for frontend presentation?
  - Status: answered
  - Answer: Use the existing `userInfo.data.user.role.includes('admin')` signal for presentation; backend authorization remains authoritative.
- II: Question: What should happen when an unauthenticated admin follows the email link?
  - Status: answered
  - Answer: Recommend redirecting to login and preserving `/dashboard/requests/{requestId}` as the post-login return destination when feasible. The frontend cannot determine authoritative admin access before authentication; the backend verifies the user's admin role against the database rather than trusting the JWT role.
  - Context: This intentionally differs from the current dismissible `LoginRequiredModal`, which does not preserve a return URL.
- III: Question: May a regular user open `/dashboard/requests/{requestId}` for one of their own requests, or is that route admin-only?
  - Status: answered
  - Answer: The route is admin-only. If loaded `userInfo.data.user.role` does not include `admin`, show the Spanish unauthorized screen. The backend database role check remains authoritative.
- IV: Question: Is backend authorization required even if admin controls are hidden in the frontend?
  - Status: answered
  - Answer: Yes. Frontend role checks are presentation controls only.

### Admin Filtering

- I: Question: Should the first delivery filter admin requests by user?
  - Status: answered
  - Answer: No. Defer user filtering because the backend endpoint has no server-side user-filter query.
  - Context: Filtering only the current page would miss matching requests on other pages and would not satisfy a true all-record user filter.
- II: Question: Which admin status filters are included?
  - Status: answered
  - Answer: `pending` and `all`, matching the backend contract.
- III: Question: What month and year should the admin queue use when those queries are omitted?
  - Status: answered
  - Answer: The backend uses the current month and year when they are not provided.
- IV: Question: What defaults should the admin queue use when `page` and `limit` are omitted?
  - Status: answered
  - Answer: Both queries are optional. The frontend does not need to send `page` or `limit` for the initial/default request and can use the pagination values returned by the backend response.
  - Context: Month and year may also be omitted for the default filter, in which case the backend uses the current month and year.

### Email Integration

- I: Question: What frontend URL shape should the email button use?
  - Status: answered
  - Answer: Prefer `/dashboard/requests/{requestId}` and require a backend single-request lookup contract.

Email template ownership, generation, and CTA label are backend implementation details. They are not frontend research questions; the only frontend integration requirement is the stable request URL above.

## Assumptions

- All supplied balance endpoints are served from the existing `BACKEND_URI` and accept the current bearer token.
- Supplied balance responses retain the `{ version, data, message, error }` envelope; Story 2's endpoint-specific success and error nesting is confirmed above.
- The frontend exchanges JSON numbers in MXN major units; the backend stores them as integer cents.
- Request IDs are opaque strings and safe to use as URL path segments after encoding.
- Creating a request does not change balance; only backend approval changes it.
- Cancellation and decision actions use authoritative backend responses and do not optimistically change financial data.
- The design tool will account for both desktop and mobile/tablet shells and all functional states listed in this document.
- No new frontend package, state manager, or date library is required. The frontend does require `NEXT_PUBLIC_BUSINESS_TIMEZONE` configuration.
- User filtering is absent from the first admin delivery, not approximated on the current page.
- Status filtering is limited to `pending` and `all`.

## Non-Obvious Findings

- The existing dashboard cannot satisfy an email deep link through `DashboardScreens`; it has only `/dashboard` plus local state. A real nested App Router route is required for bookmarkable request identity.
- There is no shared dashboard header. A globally visible balance requires separate desktop and mobile design treatment unless a later design introduces a shared shell.
- The current money formatter is actively unsafe for this feature because it formats USD and turns a valid zero balance into an empty string.
- The closest reusable architecture is the Guides DB flow: direct backend envelope, explicit query allowlist, paginated TanStack Query keys, responsive list/detail states, and prefix invalidation.
- Correct user filtering cannot be implemented from the documented paginated admin response without backend query support; deferring it avoids a misleading current-page-only filter.
- The email button itself is not frontend code in this repository. Frontend delivery can provide the route contract, but the sending service must be changed elsewhere.
- The admin single-request lookup is now available as `GET /balance/requests/admin/{requestId}`, so Story 5's `/dashboard/requests/{requestId}` route can render request details from an authoritative admin endpoint rather than scanning a paginated monthly list.
- The frontend business-timezone work (Story 6) is delivered, so Stories 3 and 4 reuse the shared `date.utils.ts` primitives instead of introducing any new date-conversion boundary.
