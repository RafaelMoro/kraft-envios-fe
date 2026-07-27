# Implementation Plan: Create a Balance-Addition Request

**Source research:** `ai-research/add-balance-request.story.md`  
**Research sign-off:** Complete; the user supplied the research as signed off and all recorded questions are answered.  
**Sign-off confirmation date:** 2026-07-21  
**Planning date:** 2026-07-21

## Assumptions

- Balance request creation uses the existing local `/api/balance` collection endpoint, which maps POST requests to `${BACKEND_URI}/balance/requests`.
- The backend success and failure contracts recorded in the research are authoritative. The create callback unwraps `data.request` from the successful `201` envelope.
- `paymentReference` is typed as optional and nullable because the confirmed contract permits it but does not specify whether a pending create omits it or returns `null`.
- The amount control accepts a trimmed dot-decimal string matching whole digits with an optional one- or two-digit fractional part. Comma decimals, exponent notation, `.01`, and values with more than two decimal places are rejected rather than normalized.
- Story 3 will use query keys prefixed by `['balance', 'requests']`. Story 2 calls prefix invalidation after each successful create; it cannot persist stale state for a query that does not yet exist in the cache.
- The create form remains available after a settled mutation, so the same amount can be submitted again without adding duplicate-request rules.
- Existing local missing-token behavior remains status `400` with `{ message: 'missing access token' }`.

## Acceptance Criteria

1. An authenticated user can submit an MXN amount from `0.01` through `100000.00`, with no more than two decimal places, as `{ "amount": number }` through a local Next route handler.
2. The submission action is unavailable while the create mutation is pending, but the user may create another request, including the same amount, after the mutation settles.
3. Success shows the submitted amount and approved Spanish copy explaining that bank payment, verification, and admin approval are still required before the balance changes.
4. Success marks the future own-request-history query prefix stale without reloading the page or optimistically increasing current balance.
5. Client validation, backend validation, authentication, and transport failures remain error states and never render the success confirmation.

## Delivery Sequence

1. Extend the typed Balance boundary, authenticated BFF route, browser callback, and focused route coverage.
2. Add the Balance-owned request modal, mutation/cache behavior, responsive integration, and focused feature coverage.

Phase 2 depends on the payload, response, error, and callback contracts from Phase 1. Each phase has focused automated checks; the completed feature receives lint, type, design, and production-build verification at the end of Phase 2.

## Affected Files

### `src/app/api/**`

- Modify `src/app/api/balance/route.ts`.

### `src/features/**`

- Create `src/features/Balance/BalanceRequestDialog.tsx`.
- Modify `src/features/Balance/BalanceDisplay.tsx`.

### `src/shared/**`

- Modify `src/shared/types/balance.types.ts`.
- Modify `src/shared/utils/balance.utils.ts`.

### `__tests__/**`

- Modify `__tests__/api/balance.route.test.ts`.
- Create `__tests__/feature/Balance/BalanceRequestDialog.test.tsx`.

### Deliberately Unchanged

- `src/features/Dashboard/Dashboard.tsx` and `src/shared/ui/organisms/Aside.tsx`: both responsive branches already render the real `BalanceDisplay` exactly once.
- `src/features/QueryProviderWrapper.tsx`: continue using its per-provider `QueryClient`; do not create or move a query client.
- `src/shared/constants/global.constants.ts`: reuse `BALANCE_API_ENDPOINT` for GET and POST.
- `src/shared/ui/atoms/ErrorMessage.tsx`: use a local associated error paragraph rather than broadening a shared atom for one form.
- `__tests__/feature/Dashboard/Dashboard.test.tsx`: shell composition does not change.
- `src/app/dashboard/page.tsx`, global styles, dependencies, lockfile, environment variables, backend code, and `DESIGN.md`.

## Phase 1: Create Contract And Authenticated BFF

### Changes Required

#### `src/shared/types/balance.types.ts`

**Action:** Modify after the existing current-balance DTOs.

- Add the request status and record DTO used by the confirmed create response.
- Add separate string form values and numeric API payload types so lexical decimal validation happens before numeric conversion.
- Add the successful create envelope and explicit Balance error-envelope variants. Do not reuse `GeneralApiError`, which cannot represent the nested validation/domain bodies.
- Add a Yup schema for required dot-decimal syntax, maximum two-place precision, and inclusive `0.01` to `100000.00` bounds.
- Keep the schema in the Balance type boundary, following the repository precedent for colocated typed form schemas. Do not add a schema/helper module.

Planned type structure:

```ts
export type BalanceRequestStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'

export interface BalanceRequestFormValues {
  amount: string
}

export interface CreateBalanceRequestPayload {
  amount: number
}

export interface BalanceRequestDto {
  id: string
  amount: number
  paymentReference?: string | null
  status: BalanceRequestStatus
  decisionReason: string | null
  decisionAt: string | null
  createdAt: string
  updatedAt: string
}
```

The successful backend envelope remains unmodified at the route boundary:

```ts
export interface CreateBalanceRequestResponse {
  version: string
  data: {
    request: BalanceRequestDto
  }
  message: null
  error: null
}
```

Model the two confirmed upstream failures plus the local route fallback without `any` or `unknown`:

```ts
export interface BalanceValidationError {
  statusCode: 400
  message: string[]
  error: 'Bad Request'
}

export interface BalanceDomainError {
  code: string
  message: string
  technicalDetails?: object
}

export interface CreateBalanceRequestErrorResponse {
  version?: string
  data?: null
  message: string | null
  error?: BalanceValidationError | BalanceDomainError | null
}
```

Schema behavior:

| Input | Result |
| --- | --- |
| `0.01` | Valid minimum |
| `100000`, `100000.00` | Valid maximum |
| blank or malformed text | Required/format error |
| `0`, negative values | Minimum/format error |
| `100000.01` | Maximum error |
| `1.159` | Precision error; never rounded or truncated |
| `1,50`, `1e2`, `.01` | Format error |

**Edge cases:** Validation must inspect the string before `Number()` conversion. Trim surrounding whitespace consistently, but do not convert comma decimals or exponent notation.

#### `src/app/api/balance/route.ts`

**Action:** Modify beside the existing `GET` export.

- Add an exported `POST(request)` handler without changing any GET path, status, body, or fallback behavior.
- Resolve `getAccessToken()` before parsing or forwarding the body. If absent, return the existing local status/body and make no upstream call.
- Parse the request as `CreateBalanceRequestPayload`, then construct a fresh `{ amount }` body so no extra browser properties are forwarded.
- POST the numeric payload to `${process.env.BACKEND_URI}/balance/requests` with `Authorization: Bearer <token>`.
- Return the successful upstream `CreateBalanceRequestResponse` body and status unchanged, including `201 Created` and its version value.
- When Axios provides an upstream response, preserve its validation, authentication, or domain body and exact status.
- When no upstream HTTP response exists, return status `500` with one compact local `{ message }` response.

Planned handler boundary:

```ts
export async function POST(request: Request): Promise<NextResponse>
```

Forwarded request shape:

```json
{
  "amount": 31.45
}
```

Successful response shape:

```json
{
  "version": "1.0",
  "data": {
    "request": {
      "id": "507f1f77bcf86cd799439011",
      "amount": 31.45,
      "paymentReference": null,
      "status": "pending",
      "decisionReason": null,
      "decisionAt": null,
      "createdAt": "2026-07-21T12:00:00.000Z",
      "updatedAt": "2026-07-21T12:00:00.000Z"
    }
  },
  "message": null,
  "error": null
}
```

**Edge cases:** Keep token and `BACKEND_URI` access server-only. Do not call the unrelated SAT URI, add Next-side role checks, normalize other routes, or add BFF range/precision behavior that the signed-off scope assigns to the client and backend.

#### `src/shared/utils/balance.utils.ts`

**Action:** Modify beside `getBalanceCb()` and `formatBalanceMxn()`.

- Add a typed browser callback that calls `axios.post(BALANCE_API_ENDPOINT, payload)`.
- Return only the authoritative `response.data.data.request` DTO needed by the mutation.
- Rely on Axios rejection for error-state handling; do not wrap or erase the typed response body.
- Keep the current GET callback and formatter unchanged.

Planned callback:

```ts
export const createBalanceRequestCb = async (
  payload: CreateBalanceRequestPayload,
): Promise<BalanceRequestDto>
```

**Rationale:** The existing local endpoint and Axios utility pattern already cover the browser boundary; a service layer or second endpoint constant would add no behavior.

#### `__tests__/api/balance.route.test.ts`

**Action:** Modify the existing route suite and its typed `NextResponse.json`, Axios, and auth mocks.

- Preserve every current GET case and fixture.
- Add explicit typed create-success, Nest validation, domain-authentication, and local transport-error fixtures.
- Import and call the real `POST` handler with a request body exposing `.json()`.
- Verify authenticated forwarding uses the exact upstream path, exact `{ amount }` body, and bearer header.
- Include an extra input property in one route test and verify only `amount` reaches the backend.
- Verify missing auth prevents body parsing and upstream POST.
- Verify upstream `400` validation and `401` authentication bodies/statuses are returned unchanged.
- Verify a rejection without `error.response` produces the local `500` fallback.
- Keep mocks named, typed, extensionless, and declared through relative paths where `jest.mock()` is required.

### Success Criteria

**Automated**

```bash
pnpm test -- __tests__/api/balance.route.test.ts
pnpm exec tsc --noEmit
```

**Manual**

1. With a valid session, submit one local `POST /api/balance` request and confirm the browser does not call `BACKEND_URI` directly.
2. Inspect the proxied backend request and confirm it contains only a JSON number at `amount` plus the bearer header.
3. Exercise one backend validation failure and confirm the local route preserves its HTTP status and body rather than converting it to success.

### Test Coverage

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `__tests__/api/balance.route.test.ts` | exact payload/path/header forwarding; unchanged 201 envelope; property allowlisting; missing token; preserved validation/auth failures; transport fallback; unchanged GET behavior | Existing mocks and direct-handler pattern in the same file |
| `src/shared/utils/balance.utils.ts` | POSTs through `BALANCE_API_ENDPOINT` and unwraps `data.request` | Real callback exercised through `BalanceRequestDialog`; mock Axios only |

## Phase 2: Responsive Request Flow And Cache Invalidation

### Changes Required

#### `src/features/Balance/BalanceRequestDialog.tsx`

**Action:** Create as a client component.

- Build one Balance-owned component containing the entry action, Flowbite modal, amount form, mutation state, error state, and success confirmation. Do not split trigger, form, and result into speculative abstractions.
- Use Flowbite `Button`, `Modal`, `ModalHeader`, `ModalBody`, `Label`, `TextInput`, and `Spinner` where they match existing usage; reuse the existing primary action treatment and Tailwind dark-mode conventions from `DESIGN.md`.
- Use `useForm<BalanceRequestFormValues>()` with `yupResolver(balanceRequestSchema)` and a string-valued amount field.
- Render a visible Spanish label such as `Monto a solicitar (MXN)`. Use `type="text"`, `inputMode="decimal"`, `aria-invalid`, and `aria-describedby` tied to a local validation paragraph.
- On valid submit, convert the already validated string once and call the mutation with exactly `{ amount: Number(values.amount) }`.
- Type `useMutation` with the unwrapped request DTO, Axios Balance error response, and numeric payload.
- Disable only the submit action while `isPending`; show visible progress and prevent a second mutation call during that interval.
- Keep the form usable after settlement. Do not prevent a second request or repeated amount.
- On success, call prefix invalidation for `['balance', 'requests']` and no other Balance key.
- Keep success content in an accessible polite status region. Display `Solicitud recibida`, the submitted amount through `formatBalanceMxn()`, explicit MXN context, and the approved full copy.
- Keep validation/server failures in an error alert/status that never shares success heading or styling.
- Select user-facing backend text in this order: validation `error.message[]`, domain `error.message`, local top-level `message`, stable Spanish fallback.
- Never render `technicalDetails`.
- Preserve the entered amount on backend, auth, or transport failure for correction/retry.

Planned component boundary:

```tsx
export const BalanceRequestDialog = (): JSX.Element => {}
```

Mutation and cache boundary:

```ts
useMutation<
  BalanceRequestDto,
  AxiosError<CreateBalanceRequestErrorResponse>,
  CreateBalanceRequestPayload
>()

queryClient.invalidateQueries({
  queryKey: ['balance', 'requests'],
})
```

Approved success content:

> **Solicitud recibida**
>
> Recibimos tu solicitud para agregar **{amount} MXN** a tu saldo. Después de que realices el pago, verificaremos que se refleje en nuestra cuenta bancaria. Cuando lo confirmemos, un administrador aprobará la solicitud y actualizaremos tu saldo. Puedes consultar el estado en **Solicitudes de saldo**.

The visual emphasis may use styled spans where it is presentational; preserve semantic heading/status structure for assistive technology.

State behavior:

| State | Form/action | Visible result | Cache effect |
| --- | --- | --- | --- |
| Idle | Enabled | No success/error | None |
| Client invalid | Enabled | Field-associated Spanish validation | No request; none |
| Pending | Submit disabled; input/modal do not block dashboard navigation | Visible progress | None |
| Success | Submit enabled after settlement | Submitted amount and approved confirmation | Invalidate `['balance', 'requests']` only |
| Backend/auth/transport error | Submit enabled after settlement; amount retained | Safe error text; no confirmation | None |

**Edge cases:** The create flow must work while the independent `['balance']` query is loading or failed. A successful create must not call `setQueryData(['balance'], ...)`, invalidate `['balance']`, reload the page, or construct optimistic history data.

#### `src/features/Balance/BalanceDisplay.tsx`

**Action:** Modify inside `BalanceDisplay`, around its existing query-state rendering.

- Import and render `BalanceRequestDialog` as part of the persistent Balance surface.
- Refactor the existing early query-state returns only as much as needed so the request entry remains mounted for loading, error, zero, and positive-balance states.
- Keep current query key, callback, loading/error wording, formatter behavior, and current-balance cache semantics unchanged.
- Preserve the compact sidebar/mobile footprint and avoid adding dashboard props or shell-specific branches.

**Rationale:** Both responsive dashboard branches already render this component exactly once, so this one integration provides desktop, tablet, and mobile parity without touching shell composition.

#### `__tests__/feature/Balance/BalanceRequestDialog.test.tsx`

**Action:** Create.

- Render the real dialog with a fresh `QueryClientProvider` per test; disable query and mutation retries.
- Mock Axios as the external network boundary. Do not mock `BalanceRequestDialog`, `BalanceDisplay`, the Balance callback, formatter, React Hook Form, Yup, or Flowbite components.
- Use `userEvent.setup()` and `screen` label, role, heading, alert, status, and text queries. Do not use `fireEvent`, DOM selectors, container queries, CSS assertions, or styling assertions.
- Use explicit request/response/error DTO fixtures matching the callback's actual unwrapped return shape.
- Test the inclusive `0.01` and `100000.00` boundaries and assert Axios receives numeric `{ amount }` only.
- Consolidate blank, malformed, zero, negative, over-maximum, over-precision, comma, exponent, and `.01` values in a validation table; each must remain client-side and visible as an error.
- Control a deferred Axios promise to prove pending disables submit and prevents a second POST.
- After settlement, submit the same amount again and prove a second POST is allowed.
- On success, assert the submitted formatted MXN amount, `Solicitud recibida`, bank-payment verification, and administrator-approval copy.
- Seed both `['balance']` and a matching history key such as `['balance', 'requests', { page: 1 }]`; spy on or inspect invalidation to prove the history prefix is invalidated while current balance data remains unchanged.
- Cover Nest validation-message arrays, domain message text, local/transport fallback, input preservation, absence of `technicalDetails`, absence of success confirmation, and absence of invalidation on every failure path.
- Preserve any existing skipped tests elsewhere.

### Success Criteria

**Automated**

```bash
pnpm test -- __tests__/feature/Balance/BalanceRequestDialog.test.tsx
pnpm test -- __tests__/api/balance.route.test.ts __tests__/feature/Balance/BalanceDisplay.test.tsx __tests__/feature/Balance/BalanceRequestDialog.test.tsx
pnpm design:lint
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

**Manual**

1. At desktop width of at least `1024px`, open the Balance request action from the sidebar, verify the modal fits the viewport in light and dark themes, and submit both a valid boundary value and an invalid over-precision value.
2. At mobile and tablet widths through `1023px`, open the same flow below the persistent header and verify the modal, amount input, validation, action, progress, and confirmation remain usable without horizontal overflow.
3. While current balance is loading and again while it is failed, open and submit the request form; verify the create flow remains available and unrelated dashboard navigation remains usable.
4. During a delayed POST, verify submit is visibly unavailable and repeated activation does not send another request. After settlement, submit the same amount again and verify it is accepted.
5. On success, verify the submitted MXN amount and approved Spanish copy are visible, the page does not reload, and displayed current balance does not increase or refetch because of creation.
6. Exercise client validation, backend validation, expired authentication, and transport failure; verify each remains an error state, retains the amount where submission occurred, and never shows `Solicitud recibida`.

### Test Coverage

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `__tests__/feature/Balance/BalanceRequestDialog.test.tsx` | modal entry; validation grammar and bounds; numeric payload; pending lock; repeat-after-settlement; approved success copy; safe error variants; history-only invalidation | Fresh retry-disabled QueryClient and Axios mock from `__tests__/feature/Balance/BalanceDisplay.test.tsx`; Testing Library `userEvent` and `screen` |
| `__tests__/feature/Balance/BalanceDisplay.test.tsx` | existing loading, error, zero, and positive states remain intact after request entry integration | Existing real-component Balance tests; no new internal mocks |
| `src/features/Balance/BalanceDisplay.tsx` | request action remains reachable in both responsive branches and independent of current-balance query state | Existing shell coverage in `__tests__/feature/Dashboard/Dashboard.test.tsx` |

## Cross-Cutting Concerns

- **Authentication:** The browser calls only `/api/balance`. The route handler reads the httpOnly session through `getAccessToken()` and attaches the bearer token server-side.
- **Response contracts:** Preserve the complete upstream success/error body and status at the BFF. The browser callback unwraps only successful `data.request`; UI errors account for both Nest validation and Kraft domain envelopes.
- **Financial behavior:** Request creation records intent before bank payment. It never updates, invalidates, or optimistically increments current `['balance']` data.
- **Cache identity:** Successful creation invalidates by the exact `['balance', 'requests']` prefix. Filters and pagination remain Story 3 concerns.
- **Validation:** String-level validation prevents backend truncation of over-precision values. Numeric conversion occurs only after lexical, range, and precision checks pass.
- **Responsive UI:** `BalanceDisplay` remains the shared integration point for desktop and mobile/tablet. The modal uses existing Flowbite/Tailwind/Geist conventions and preserves dark mode.
- **Accessibility:** The input has a visible associated label and described validation; pending/success/error messages use semantic status/alert behavior; disabled state and text supplement color.
- **Test conventions:** Use `userEvent`, `screen`, explicit DTO fixtures, named mock exports, relative paths in `jest.mock()`, no import extensions, no internal-component mocks, no CSS assertions, and no `any`/`unknown`.
- **Environment and dependencies:** Continue using `BACKEND_URI`, Axios, TanStack Query, React Hook Form, Yup, Flowbite React, and Tailwind v4. Add no package or environment variable.

## Open Questions / Out Of Scope

### Open Questions

- None blocking implementation. Dot-decimal syntax, optional/nullable `paymentReference`, and the future-query invalidation semantics are recorded as planning assumptions above.

### Out Of Scope

- Request-history list, filters, pagination, cancellation controls, or a `Solicitudes de saldo` destination; Story 3 owns them.
- Admin queue, approval, rejection, payment-reference entry, email links, bank instructions, receipt upload, and payment-provider integration.
- Optimistic history records, current-balance updates/refetches, page reloads, polling, cache persistence, or a new state store.
- Duplicate-amount or multiple-pending-request prevention after the active mutation settles.
- BFF validation beyond payload allowlisting, broad API-response normalization, unrelated route cleanup, or backend changes.
- Dashboard navigation/screens, shell layout, root document language, current-balance background-fetch behavior, and shared error-component refactors.
- New dependencies, service layers, query-key factories, shared form abstractions, telemetry, logging, caching, release automation, changelog work, or CI assumptions.

## Decisions Beyond The Research Document

1. Use one `BalanceRequestDialog` rendered by `BalanceDisplay`. The research delegated the final surface; a Flowbite modal preserves the compact persistent balance display and automatically covers both responsive shell branches.
2. Accept trimmed dot-decimal syntax only. This makes precision validation deterministic before numeric conversion and avoids silently guessing whether a comma is a decimal or grouping separator.
3. Use a local field-error paragraph instead of changing `ErrorMessage`. The shared atom cannot receive the required association attributes, and broadening it is not required by another caller.
4. Keep the form and submit action available after success rather than replacing the modal with a terminal result screen. This directly permits another request, including the same amount, after settlement with no extra reset flow.

## Repository Context Update

No `REPO_CONTEXT.md` change is planned during planning. POST support and the request-history cache prefix are intended behavior, not verified repository facts until implementation; update the Balance feature/API inventory after the implementation is complete.
