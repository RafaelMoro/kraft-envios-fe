# Create A Balance Request Story Research

## Story Definition

### Story Title

Create a balance-addition request.

### Story Description

Allow an authenticated user to request a positive MXN balance addition through the existing frontend BFF, then explain in Spanish that the user must make the bank payment and that an administrator will verify and approve it before the balance changes.

This document researches Story 2 from `ai-research/add-balance.epic.md`. Story 1 is complete. Story 3 will own the request-history UI; this story prepares the TanStack Query cache integration needed for that later history surface.

### Scope Classification

Single-feature story covering the Balance feature, its Next route handler, shared balance types/utilities, and focused tests.

### Research Mode

Full research, prioritizing API/validation behavior and UX states/copy.

### User-Confirmed Decisions

- Keep this research within the Balance feature and direct integration points.
- Story 2 prepares request-history cache invalidation; it does not pull Story 3's history UI into scope.
- The backend-confirmed POST success/error contracts supplied after initial research are authoritative for this story.
- Use the epic's approved Spanish confirmation copy.

### Acceptance Criteria

1. An authenticated user can submit an MXN amount from `0.01` through `100000.00`, with no more than two decimal places, as `{ "amount": number }` through a local Next route handler.
2. The submission action is unavailable while the create mutation is pending, but the user may create another request, including the same amount, after the mutation settles.
3. Success shows the submitted amount and approved Spanish copy explaining that bank payment, verification, and admin approval are still required before the balance changes.
4. Success marks the future own-request-history query prefix stale without reloading the page or optimistically increasing current balance.
5. Client validation, backend validation, authentication, and transport failures remain error states and never render the success confirmation.

### Task Breakdown

1. Define the create payload, request status/record, and confirmed response DTOs in the existing Balance type boundary.
2. Extend the existing Balance BFF route with authenticated POST forwarding to `/balance/requests` while preserving meaningful upstream statuses and bodies.
3. Add a browser callback that posts only `{ amount }` to the local Balance API endpoint.
4. Add a responsive Balance-domain entry point, amount form, pending state, error state, and approved success confirmation.
5. On success, invalidate the future own-request-history query prefix without changing the current `['balance']` value.
6. Add focused route and feature coverage for contract forwarding, amount boundaries, mutation states, copy, and invalidation.

### Out Of Scope

- Request-history list, filters, pagination, and cancellation; these belong to Story 3.
- Admin queue, approval, rejection, payment-reference entry, and email links.
- Increasing or optimistically changing the displayed current balance after request creation.
- Preventing multiple pending requests or repeated amounts after a mutation settles.
- Bank instructions, receipt uploads, user-entered payment references, or payment-provider integration.
- Final visual placement or choosing between a modal, drawer, card, or page; design remains delegated.
- New dependencies, a state store, a service layer, or a query-key factory.
- Normalizing unrelated API route response/error shapes.

## Technical Research

### Current State

- Story 1 introduced `src/features/Balance/BalanceDisplay.tsx`, which owns `useQuery({ queryKey: ['balance'] })` and renders loading, error, zero, and positive-balance states.
- `src/shared/utils/balance.utils.ts` calls the local `/api/balance` route and exposes the reusable zero-safe `formatBalanceMxn()` formatter.
- `src/shared/types/balance.types.ts` currently defines only current-balance DTOs. No request payload, request record, status, or create-response type exists.
- `src/app/api/balance/route.ts` currently exports only `GET`; it already preserves available upstream response bodies and statuses.
- `BALANCE_API_ENDPOINT` is `/api/balance`; the same local collection endpoint can support GET and POST without another constant.
- Desktop renders `BalanceDisplay` from `src/shared/ui/organisms/Aside.tsx`; mobile/tablet renders it directly from `src/features/Dashboard/Dashboard.tsx`.
- No request-history query or UI exists yet.
- The app-wide QueryClient remains correctly scoped inside `src/features/QueryProviderWrapper.tsx`, with a default 60-second query stale time.

### Affected Areas

Routes/pages:

- `src/app/dashboard/page.tsx` remains the authenticated server boundary and Flowbite theme provider; no route change is required for this story.
- `src/features/Dashboard/Dashboard.tsx` already exposes `BalanceDisplay` on mobile/tablet.
- `src/shared/ui/organisms/Aside.tsx` already exposes `BalanceDisplay` on desktop.
- Keeping the create entry point within the existing Balance surface can provide responsive parity without adding a dashboard screen or changing both shell branches.

API route handlers:

- `src/app/api/balance/route.ts` is the direct BFF boundary to extend with POST.
- Browser code should continue calling `/api/balance`; server code should forward POST to `${BACKEND_URI}/balance/requests`.
- POST must retrieve the access token through `getAccessToken()` and attach `Authorization: Bearer <token>`.
- The existing GET branch establishes the Balance-domain behavior of forwarding the upstream success status/envelope and preserving available upstream error status/body.
- Missing-token handling currently returns local status `400` with `{ message: 'missing access token' }`; changing that established local behavior is outside this story unless the contract is deliberately revised.

Feature UI:

- New creation UI belongs in `src/features/Balance/`.
- `BalanceDisplay` is the smallest shared responsive integration point because both dashboard shell branches already render it exactly once.
- The final interaction surface is a design decision. Functional research requires only an accessible entry action, labeled amount input, validation feedback, pending feedback, failure feedback, and success confirmation.
- The create flow must remain usable even when the independent current-balance query is loading or has failed.

Shared code:

- Add Balance request DTOs beside current-balance DTOs in `src/shared/types/balance.types.ts`.
- Add the browser POST callback beside `getBalanceCb()` in `src/shared/utils/balance.utils.ts`.
- Reuse `BALANCE_API_ENDPOINT`; no second frontend endpoint constant is needed for the same local route.
- Reuse `formatBalanceMxn()` for the submitted amount in confirmation copy.
- No shared abstraction is justified until Story 3 introduces request-list query identity.

Tests:

- Extend `__tests__/api/balance.route.test.ts` for authenticated POST forwarding, missing auth, upstream errors, and transport failures.
- Add focused create-flow coverage under `__tests__/feature/Balance/`.
- Extend `__tests__/feature/Dashboard/Dashboard.test.tsx` only if dashboard shell composition changes; keeping creation inside the existing Balance surface should avoid that duplication.
- Existing `__tests__/feature/Balance/BalanceDisplay.test.tsx` demonstrates a fresh retry-disabled QueryClient and real Axios behavior through the utility callback.

### Existing Patterns To Follow

App Router server/client split:

- Keep token and `BACKEND_URI` access in `src/app/api/balance/route.ts`.
- Keep forms, mutation state, and query invalidation in client components.
- Do not read the httpOnly session cookie from Balance UI.
- Do not call the external backend directly from browser code.

TanStack Query:

- Use the existing provider; do not add another QueryClient or move it to module scope.
- Use a typed `useMutation` as existing create flows do.
- Disable the submit action from mutation `isPending`; do not add a permanent duplicate-amount rule.
- Reserve a request-history identity under a Balance prefix, such as `['balance', 'requests', ...filters]`, for Story 3.
- On successful creation, invalidate `['balance', 'requests']` by prefix so any mounted or later compatible own-history query is stale.
- Do not invalidate or manually increase the current `['balance']` query: request creation does not add funds.
- Do not optimistically construct financial request history when the backend can return authoritative data.

Forms and validation:

- Existing forms use `react-hook-form`, `yup`, and `yupResolver`; these dependencies are sufficient.
- Treat blank and malformed values as validation failures rather than coercing them to `0`.
- Enforce minimum `0.01` and maximum `100000.00`.
- Reject more than two decimal places before submission because the backend truncates rather than rounds.
- Convert the validated form value to the numeric `{ amount }` payload expected by the backend.
- Values at `0.01` and `100000.00` are valid; `0`, negatives, values above the maximum, and examples such as `1.159` are invalid.
- HTML numeric input attributes can improve browser affordances but do not replace schema validation.

Flowbite, Tailwind, and accessibility:

- Use existing Flowbite form/action components and Tailwind v4 styling conventions.
- Preserve the current Geist font, dark mode, neutral surfaces, primary action treatment, and responsive dashboard behavior from `DESIGN.md`.
- Give the amount field a visible Spanish label and associate validation feedback with the field.
- Expose pending and result messages through accessible status semantics where appropriate.
- Keep the submit action disabled during pending work and provide visible progress.
- Do not rely on color alone to distinguish success from failure.

Route-handler proxy style:

- Parse a typed JSON body containing only the amount payload needed upstream.
- Forward to `${BACKEND_URI}/balance/requests` with the bearer token.
- Return the upstream success body and status without transforming API version values.
- Preserve available backend validation/auth/conflict status and body, following the completed Balance GET behavior rather than older blanket-400 handlers.
- Return a compact local 500 response only when no upstream HTTP response is available.
- Do not alter GET behavior while adding POST.

### Backend Contract

Confirmed request contract:

- Method/path: `POST /balance/requests`.
- Body: `{ "amount": number }`.
- Amount unit: MXN major units.
- Effective range: `0.01` through `100000.00`.
- Precision: at most two decimal places.
- Authentication: existing bearer-token flow through `BACKEND_URI`.
- Duplicate amounts and multiple pending requests are allowed.
- Request creation precedes the user's bank payment.
- Request creation does not update current balance.

Confirmed success response:

- HTTP status: `201 Created`.
- Envelope: `{ version, data: { request }, message: null, error: null }`.
- Created request fields: `id`, `amount`, optional `paymentReference`, `status`, `decisionReason`, `decisionAt`, `createdAt`, and `updatedAt`.
- Creation always returns `status: 'pending'`, `decisionReason: null`, and `decisionAt: null`.
- `id` is a Mongo ObjectId represented as a string; timestamps are UTC ISO 8601 strings.
- The service sends the admin notification on a best-effort basis after creating the request; notification failure does not change the successful creation contract.

Confirmed DTO validation failure:

- HTTP status: `400 Bad Request`.
- Envelope: `{ version, data: null, message: null, error }`.
- `error` is Nest's raw validation body: `{ statusCode: 400, message: string[], error: 'Bad Request' }`.
- The message array can describe `@IsNumber`, `@IsPositive`, `@Max(100000)`, or non-whitelisted-property failures.
- The global ValidationPipe enables `whitelist` and `forbidNonWhitelisted`, without transform or a custom exception factory.

Confirmed business/domain failures:

- Envelope: `{ version, data: null, message: null, error: { code, message, technicalDetails? } }`.
- `401 BAL-AUTH-001`: the authenticated user could not be identified.
- `400 BAL-BUS-003`: money conversion rejected an invalid amount.
- `400 BAL-BDN-001`: database or another unexpected operation failure.
- `technicalDetails` is diagnostic data and must not be exposed as primary user-facing copy.
- There is no duplicate-pending-request domain error because the service intentionally has no duplicate check.

Backend source references supplied by the user: `balance.controller.ts:44-56`, `balance.service.ts:70-92`, `balance.service.ts:430-441`, `balance.service.ts:454-466`, `balance-responses.dto.ts:23-72`, `balance.dto.ts:25-37`, `main.ts:25-30`, and `GeneralException.filter.ts:12-31`.

### Data And Cache Behavior

- Current balance and request history are related but distinct server state.
- Creation should leave any cached current balance unchanged.
- Creation should make the own-request-history prefix stale.
- Story 2 does not render request history, so acceptance criterion 4 is an integration seam for Story 3 rather than a visible list in this delivery.
- Once Story 3 mounts a compatible request-history query, invalidation after future creates will trigger authoritative refresh without a full-page reload.
- User-sensitive query data remains isolated by the existing per-mounted-provider QueryClient.

### UX States And Copy

Idle:

- Show an understandable action for requesting a balance addition.
- Explain or label the amount as MXN.

Validation error:

- Keep the form open and identify the invalid amount.
- Do not issue a network request.

Submitting:

- Disable duplicate submission while the mutation is pending.
- Show progress without blocking unrelated dashboard navigation or the independent balance display.

Success:

- Keep the submitted amount visible using zero-safe MXN formatting.
- Use `Solicitud recibida`, never wording that implies funds were already added.
- Explain that the user makes the payment after the request, the payment is checked in the bank account, and admin approval is required.
- Point toward `Solicitudes de saldo` as the future history destination without claiming email or real-time status updates.
- Allow a later new request, including the same amount.

Approved full copy:

> **Solicitud recibida**
>
> Recibimos tu solicitud para agregar **{amount} MXN** a tu saldo. Después de que realices el pago, verificaremos que se refleje en nuestra cuenta bancaria. Cuando lo confirmemos, un administrador aprobará la solicitud y actualizaremos tu saldo. Puedes consultar el estado en **Solicitudes de saldo**.

Approved compact copy:

> Recibimos tu solicitud. Después de que realices el pago, lo verificaremos en nuestra cuenta bancaria antes de aprobar la solicitud y agregar el monto a tu saldo.

Failure:

- Show DTO validation messages from `error.message[]` or the domain message from `error.message` when safely available.
- Otherwise show a stable Spanish fallback without success styling or copy.
- Do not present `technicalDetails` to the user.
- Preserve the entered amount so the user can correct or retry it.
- Do not invalidate history or current-balance queries after failure.

### Edge Cases And Constraints

- JavaScript floating-point representation makes string-level decimal precision validation safer than inferring precision only after numeric coercion.
- Backend truncation means accepting `1.159` would silently request `1.15`; the frontend must reject it.
- Browser locale may display commas, but the backend payload remains a JSON number. Accepted input syntax must be consistent with the chosen form control and schema.
- Pending-state protection prevents concurrent accidental submissions only; it is not an idempotency guarantee against retries outside this browser state.
- A successful POST may settle while the current balance query is loading or failed; these states must remain independent.
- The create endpoint has two distinct error payloads inside the common envelope: a Nest validation body and a KraftError domain body.
- Session cookies are httpOnly; all authenticated browser traffic goes through the BFF.
- Tests always collect coverage, including focused runs.
- The external `product-sat` URI is unrelated; Balance uses `BACKEND_URI`.

### Dependencies And Integration Points

- Existing `axios`, TanStack Query, React Hook Form, Yup, resolver, Flowbite React, and Tailwind dependencies are sufficient.
- No `package.json` or `pnpm-lock.yaml` change is expected.
- `BACKEND_URI` remains the only relevant upstream environment variable for Story 2.
- Story 3 must use the same own-request-history query prefix for Story 2 invalidation to become effective.
- Final UI work must consult `DESIGN.md` and preserve both desktop and mobile/tablet behavior.
- No business-timezone configuration is required for Story 2 because this story does not render request timestamps or month filters.

### Testing Rules To Follow

- Use `userEvent` for entry and submission; do not use `fireEvent`.
- Render real internal Balance components rather than mocking them.
- Mock network boundaries or TanStack hooks only when necessary.
- Use relative paths for project modules passed to `jest.mock()`.
- Give each query-driven test a fresh QueryClient with retries disabled.
- Assert labels, roles, visible validation, pending behavior, payloads, copy, and invalidation rather than CSS classes or layout.
- Use explicit request/response DTO fixtures; do not use `any` or `unknown`.
- Match mocked callback data to the confirmed `data.request` response shape.
- Preserve existing skipped tests.

Smallest useful route coverage:

- Authenticated POST forwards the exact `{ amount }` body and bearer header to `/balance/requests`.
- Missing token prevents the upstream call.
- Upstream validation/auth status and body are preserved.
- A transport failure returns the local server-error response.
- Existing GET tests remain unchanged and passing.

Smallest useful feature coverage:

- `0.01` and `100000.00` submit successfully.
- Blank, malformed, zero, negative, over-maximum, and over-precision values do not submit.
- The callback receives exactly `{ amount: number }`.
- A pending mutation disables the action and prevents a second network call.
- Success renders the submitted MXN amount and approved Spanish confirmation.
- Success invalidates the own-request-history prefix but does not change current balance data.
- Backend and transport failures show error feedback without success confirmation or invalidation.

## Open Questions

### Backend Contract

I: Question: What exact HTTP status and response body does `POST /balance/requests` return on success?

Status: answered

Answer: It returns `201 Created` with `{ version, data: { request }, message: null, error: null }`. The request is pending and includes `id`, `amount`, optional `paymentReference`, null `decisionReason`/`decisionAt`, and UTC creation/update timestamps.

Context: Nest uses the default `@Post()` status; the service wraps `formatRequest(request)` in the standard success envelope.

II: Question: What exact error envelope and validation field structure does `POST /balance/requests` return?

Status: answered

Answer: DTO validation returns `400` with a raw Nest validation object under the outer `error`; its `message` is an array. Domain failures return KraftError `{ code, message, technicalDetails? }` under the outer `error`, with `BAL-AUTH-001` using `401` and `BAL-BUS-003`/`BAL-BDN-001` using `400`.

Context: The BFF must preserve these status/body variants. UI copy can use validation `error.message[]` or domain `error.message`, but not diagnostic `technicalDetails`.

### Create Payload

I: Question: What amount rules and payload apply?

Status: answered

Answer: Submit `{ "amount": number }` in MXN major units; accept `0.01` through `100000.00` with at most two decimal places and reject over-precision rather than relying on backend truncation.

II: Question: Are multiple pending requests or duplicate amounts allowed?

Status: answered

Answer: Yes. Prevent only concurrent duplicate submission while the current mutation is pending.

### UI And Product Decisions

I: Question: Which surface should contain the form and confirmation?

Status: answered

Answer: Research defines functional and responsive states only; the design phase chooses the final surface and placement.

II: Question: Which success copy should be used?

Status: answered

Answer: Use the approved Spanish `Solicitud recibida` copy from the epic, including the submitted amount and the manual bank-verification/admin-approval explanation.

III: Question: Does Story 2 include request-history UI?

Status: answered

Answer: No. Story 2 prepares compatible query-prefix invalidation; Story 3 supplies the history UI.

### Authorization

I: Question: How is create access authorized?

Status: answered

Answer: The browser calls the local Next BFF, which reads the httpOnly session token and forwards it as a bearer token. Backend authorization remains authoritative.

II: Question: Should missing or expired authentication preserve upstream status semantics?

Status: answered

Answer: Preserve relevant upstream statuses for new Balance BFF behavior. The existing local missing-token branch remains unchanged unless separately revised.

## Assumptions

- All Balance endpoints are served from `BACKEND_URI` and accept the existing bearer token.
- The backend exchanges amounts as JSON numbers in MXN major units and stores integer cents.
- The confirmed create callback can unwrap `data.request` from the `201` success envelope.
- Creating a request never changes current balance; only later backend approval does.
- Story 3 will adopt a query key under `['balance', 'requests']` so Story 2's invalidation seam remains compatible.
- Final responsive placement will be resolved during design without changing the behavioral acceptance criteria.

## Non-Obvious Findings

- The completed `BalanceDisplay` is already rendered once in both responsive dashboard branches, so keeping the create entry point within the Balance feature avoids duplicate shell integration.
- Reusing `/api/balance` for browser GET and POST is sufficient; the BFF can map POST to the different upstream `/balance/requests` path.
- Request creation must not invalidate current balance because doing so suggests funds may have changed before bank verification and admin approval.
- Story 2 has no remaining backend-contract question: success, validation, domain-error, payload, payment-sequence, duplicate-policy, and confirmation-copy behavior are defined.
