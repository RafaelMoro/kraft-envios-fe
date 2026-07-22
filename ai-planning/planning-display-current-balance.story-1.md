# Implementation Plan: Display Current Balance - Story 1

**Source research:** `ai-research/balance-addition/display-current-balance.story-1.md`  
**Research sign-off:** Complete; all open questions answered in the source document.  
**Planning date:** 2026-07-21

## Assumptions

- `GET ${BACKEND_URI}/balance` always returns the documented envelope and an MXN major-unit number at `data.balance.amount`.
- The local BFF returns the successful upstream envelope unchanged and preserves an upstream non-2xx status/body; an absent session token remains the established local `400` response.
- The existing TanStack Query default `staleTime` of 60 seconds supplies active-session freshness. This story adds no polling, invalidation, cookie persistence, or real-time transport.
- The final Tailwind/Flowbite composition follows the design constraints in the research and `DESIGN.md`; it introduces no new interaction or request-action control.

## Acceptance Criteria

1. An authenticated dashboard session retrieves current balance from backend `GET /balance` through a local authenticated Next route handler.
2. A persistent balance surface is available across Quotes, Guides, Addresses, and Profit Margin on both desktop and mobile/tablet experiences.
3. The amount is identified as MXN, formatted with two decimal places, and a numeric zero is visibly rendered as `$0.00` rather than hidden.
4. Initial loading, background refresh, error, and loaded states remain compact and do not block or disable unrelated dashboard navigation.
5. The first mounted dashboard shell performs an authoritative fetch, and the balance is not persisted in a cookie.

## Delivery Sequence

1. Establish the typed BFF contract before any UI calls it.
2. Add the shell-owned surface using the existing query provider and responsive boundaries.
3. Add focused handler, component, and shell tests after the production paths exist.

The phases are independently verifiable. Phase 2 depends on the endpoint constant, callback, and DTO from Phase 1; Phase 3 validates the completed contract rather than adding application behavior.

## Affected Files

### `src/app/api/**`

- Create `src/app/api/balance/route.ts`

### `src/features/**`

- Create `src/features/Balance/BalanceDisplay.tsx`
- Modify `src/features/Dashboard/Dashboard.tsx`

### `src/shared/**`

- Modify `src/shared/constants/global.constants.ts`
- Create `src/shared/types/balance.types.ts`
- Create `src/shared/utils/balance.utils.ts`
- Modify `src/shared/ui/organisms/Aside.tsx`

### `__tests__/**`

- Create `__tests__/api/balance.route.test.ts`
- Create `__tests__/feature/Balance/BalanceDisplay.test.tsx`
- Create `__tests__/feature/Dashboard/Dashboard.test.tsx`

### Deliberately Unchanged

- `src/app/dashboard/page.tsx`, `src/features/QueryProviderWrapper.tsx`, `src/shared/lib/auth.lib.ts`, login/session/user-info types and cookie helpers.
- `src/shared/ui/organisms/HeaderMenuDrawer.tsx`, individual dashboard subscreens, global CSS, dependencies, environment variables, and backend code.

## Phase 1: Balance BFF Contract

### Changes Required

#### `src/shared/types/balance.types.ts`

**Action:** Create.

- Define explicit DTOs for the documented backend response envelope, nested balance object, and `{ amount: number }` data contract.
- Include nullable `message` and `error` fields matching the confirmed success envelope; do not add balance to `LoginData`.
- The exported response type must support both the route handler's Axios response and the browser callback without `any` or `unknown`.

```ts
export interface GetBalanceResponse {
  version: string
  data: { balance: { amount: number } }
  message: null
  error: null
}
```

#### `src/shared/constants/global.constants.ts`

**Action:** Modify near the existing API endpoint constants.

- Add one `BALANCE_API_ENDPOINT` constant for the local `/api/balance` BFF path.
- Do not add a backend URL constant; `BACKEND_URI` is server-only and belongs in the route handler.

#### `src/app/api/balance/route.ts`

**Action:** Create.

- Export `GET()` following the authenticated proxy shape used by `src/app/api/address/route.ts`.
- Call `getAccessToken()` only on the server. Return the established missing-token response before making an upstream request.
- Request `${process.env.BACKEND_URI}/balance` with `Authorization: Bearer <token>` and type the Axios response as `GetBalanceResponse`.
- Return the successful upstream JSON envelope with its upstream status.
- For an Axios upstream failure, return the upstream response data and status unchanged when available. For a non-Axios transport failure, return the compact existing `{ message }` failure payload with a server-error status.

The browser-facing success body is the same documented backend envelope:

```json
{
  "version": "1.0",
  "data": {
    "balance": {
      "amount": 31.45
    }
  },
  "message": null,
  "error": null
}
```

```ts
export async function GET(): Promise<NextResponse>
```

**Edge cases:** Do not access cookies in the browser or route requests through `NEXT_PUBLIC_GET_SAT_PRODUCT_URI`. A `200` envelope containing `amount: 0` is a successful response, not a not-found branch.

**Status handling:** The new route intentionally differs from older handlers that collapse all upstream errors to `400`, because the signed-off research requires relevant upstream authentication and transport statuses to be preserved. Do not normalize other existing handlers as part of this story.

#### `src/shared/utils/balance.utils.ts`

**Action:** Create.

- Export `getBalanceCb(): Promise<number>` to call `axios.get(BALANCE_API_ENDPOINT)` and return `response.data.data.balance.amount` from the local BFF envelope.
- Export a narrow MXN formatter based on a module-level `Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2, maximumFractionDigits: 2 })`.
- Accept a numeric amount, including zero. Do not modify `formatNumberToCurrency()`, which is USD-only and treats zero as absent.

```ts
export const getBalanceCb = async (): Promise<number> => {}
export const formatBalanceMxn = (amount: number): string => {}
```

**Rationale:** Keeping the callback and formatter in the balance domain avoids changing existing USD display behavior while using native platform formatting.

### Success Criteria

**Automated**

```bash
pnpm test -- __tests__/api/balance.route.test.ts
pnpm exec tsc --noEmit
```

**Manual**

1. Sign in with a valid session and confirm the browser requests only `GET /api/balance`; confirm the browser never calls `BACKEND_URI` directly.
2. Confirm an authenticated zero-balance response is a successful `200` response, not an error.

### Test Coverage

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `__tests__/api/balance.route.test.ts` | bearer header and upstream URL on success; unchanged success envelope/status; missing access token; available upstream failure status/body | Direct handler import with mocked `axios` and `getAccessToken`; authenticated route shape from `src/app/api/address/route.ts` |
| `src/shared/utils/balance.utils.ts` | callback extracts the documented nested amount; formatter emits MXN two-decimal positive and zero values | Unit test through `BalanceDisplay`; native `Intl.NumberFormat`, no utility mock |

## Phase 2: Persistent Dashboard Balance Surface

### Changes Required

#### `src/features/Balance/BalanceDisplay.tsx`

**Action:** Create.

- Create one client component that owns `useQuery` with a stable `['balance']` key and `getBalanceCb` query function. Do not override the provider's 60-second freshness policy.
- Render the Spanish label and MXN context in every state. Loaded output follows `Saldo: $31.45` and makes the currency identifiable as MXN in accompanying text.
- Use `isPending` and `isFetching` to replace only the amount with a compact skeleton for initial loading and background refresh. Keep the label and the surrounding navigation surface present.
- When a refresh fails after data was loaded, render the retained formatted amount once fetching ends plus compact, textual error feedback. For an initial error, render the label and equivalent compact text error without disabling or hiding navigation.
- Give asynchronous state text an appropriate polite semantic announcement. Do not use color as the only indicator and do not add a retry, polling, or request-action button.
- Use Flowbite/Tailwind neutral surface, existing dark variants, Geist-based typography, and the palette described in `DESIGN.md`.

State-to-output rules:

| Query state | Visible amount area | Supporting text | Navigation behavior |
| --- | --- | --- | --- |
| First request pending | Compact skeleton | Polite loading status | Unchanged and usable |
| Loaded | `formatBalanceMxn(data)` | MXN identification | Unchanged and usable |
| Background request fetching | Compact skeleton | Polite refresh status | Unchanged and usable |
| First request failed | No fabricated amount | Compact textual error | Unchanged and usable |
| Refetch failed with cached data | Last formatted cached amount | Compact textual error | Unchanged and usable |

```tsx
export const BalanceDisplay = (): JSX.Element => {}
```

**Edge cases:** `0` must pass through formatting rather than a truthiness condition. `isFetching` can be true while cached data exists; the component must keep its compact footprint and restore cached data after a failed refetch.

#### `src/shared/ui/organisms/Aside.tsx`

**Action:** Modify near the closing desktop navigation `</nav>`.

- Import and render the single `BalanceDisplay` below the desktop navigation buttons and above sign-out, preserving the sidebar's current logo, theme, role-aware links, and sign-out behavior.
- Do not duplicate query logic or add balance-related props to `AsideProps`.

#### `src/features/Dashboard/Dashboard.tsx`

**Action:** Modify the mobile/tablet branch near its persistent `<header>`.

- Import and render the same `BalanceDisplay` immediately below the persistent mobile/tablet menu header and above conditional subscreens.
- Leave the desktop instance inside `Aside`; render exactly one balance surface per responsive branch.
- Preserve the local `screen` state, `updateScreen`, conditional screen mounting, routes, and sign-out flow. The shell-mounted component must remain mounted while a user switches Quotes, Guides, Addresses, or Profit Margin.

**Rationale:** `Dashboard` is the existing common boundary. A domain component placed at each already-persistent responsive shell location remains independent of screen changes without creating a dashboard layout or repeating UI in all subscreens.

#### No Query Provider Change

**Action:** No change to `src/features/QueryProviderWrapper.tsx`.

- Reuse the existing root `QueryClientProvider`; its `useRef` construction preserves request isolation and its default 60-second `staleTime` provides the requested active-session cache behavior.
- Do not create a balance-specific client, set global cache state, or persist the query cache to cookies or browser storage.

### Success Criteria

**Automated**

```bash
pnpm test -- __tests__/feature/Balance/BalanceDisplay.test.tsx __tests__/feature/Dashboard/Dashboard.test.tsx
pnpm exec tsc --noEmit
```

**Manual**

1. At desktop width of at least 1024px, verify one compact balance surface appears below sidebar navigation, remains visible while switching all available dashboard areas, and supports light and dark themes.
2. At mobile and tablet widths through 1023px, verify the equivalent balance surface appears below the persistent menu header, remains visible while switching areas, and the drawer/menu remains usable.
3. Verify initial load and refresh replace only the amount with a compact placeholder; navigation remains usable. Verify `$0.00` and a positive MXN value each render with two decimals.
4. Simulate an initial failure and a later refetch failure. Verify the former is compact and non-blocking; verify the latter restores the previously loaded amount with textual error feedback.

### Test Coverage

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `__tests__/feature/Balance/BalanceDisplay.test.tsx` | initial skeleton/status; positive amount; explicit zero; initial error; cached amount retained after failed refetch; accessible MXN label | Fresh retry-disabled `QueryClient` from `__tests__/feature/Dashboard/Order.test.tsx`; mock only the Axios network call |
| `__tests__/feature/Dashboard/Dashboard.test.tsx` | desktop sidebar and mobile/tablet header placement expose one equivalent balance surface; balance load/error does not prevent switching dashboard navigation | Router/query wrapper from `__tests__/home.test.tsx`; browser-media mock pattern from `__tests__/feature/Dashboard/Order.test.tsx`; real internal shell/components |

## Phase 3: Focused Regression Verification

### Changes Required

#### `__tests__/api/balance.route.test.ts`

**Action:** Create.

- Implement the Phase 1 handler cases using explicit `GetBalanceResponse` fixtures and an explicit error response fixture.
- Use named mock exports and relative module paths for `jest.mock()` calls. Restore mocks between tests.

#### `__tests__/feature/Balance/BalanceDisplay.test.tsx`

**Action:** Create.

- Render the real `BalanceDisplay` in a new retry-disabled `QueryClientProvider` for each test so rejected requests do not retry or leak cache between cases.
- Mock Axios as the external network boundary. Use `screen` queries and visible/semantic output rather than implementation classes or container selectors.
- Use fake-timer or deferred-promise control only if needed to deterministically prove a background refetch retains the last value after rejection.

#### `__tests__/feature/Dashboard/Dashboard.test.tsx`

**Action:** Create.

- Exercise the real dashboard shell with a router wrapper and a fresh retry-disabled query client.
- Mock `useMediaQuery` as the browser API boundary for desktop and mobile/tablet cases; mock external Axios calls needed by mounted subscreens and the balance BFF.
- Use `userEvent` to switch an existing dashboard navigation control while balance is loading or errored. Do not mock `Aside`, `HeaderMenuMobile`, `BalanceDisplay`, or any other internal component.

#### Test Fixture Requirements

**Action:** Apply to all three new tests.

- Define named, explicit `GetBalanceResponse` fixtures for a positive amount and zero amount. Use a separate typed rejected Axios response for error cases.
- Do not use `any`, `unknown`, CSS-class assertions, `container`, `querySelector`, or `getElementById`.
- Use `screen` role, accessible-name, text, and status queries. Keep skipped tests elsewhere unchanged.
- Do not add shared fixture infrastructure: these fixtures are used only by this story's focused tests.

### Success Criteria

**Automated**

```bash
pnpm test -- __tests__/api/balance.route.test.ts __tests__/feature/Balance/BalanceDisplay.test.tsx __tests__/feature/Dashboard/Dashboard.test.tsx
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

**Manual**

1. Repeat the desktop, mobile, tablet, zero, positive, initial-error, and refresh-error checks from Phase 2 using an authenticated account.
2. Confirm browser storage and response cookies contain no balance field before or after loading; balance is only present in TanStack Query's in-memory active-session cache.

### Test Coverage

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `__tests__/api/balance.route.test.ts` | local authenticated BFF boundary and status/envelope forwarding | `src/app/api/address/route.ts`, `src/app/api/guides-db/route.ts` |
| `__tests__/feature/Balance/BalanceDisplay.test.tsx` | all balance display state transitions and zero-safe MXN contract | `__tests__/feature/Dashboard/Order.test.tsx` query wrapper |
| `__tests__/feature/Dashboard/Dashboard.test.tsx` | responsive shell persistence and unaffected navigation | `__tests__/home.test.tsx`, `__tests__/feature/Dashboard/Order.test.tsx` |

## Cross-Cutting Concerns

- **Authentication:** Browser code uses only `/api/balance`; `getAccessToken()` and `BACKEND_URI` remain exclusively server-side in the route handler.
- **Caching and freshness:** The app-wide `QueryClient` stays created in `useRef`; the balance query uses its existing 60-second `staleTime` and is owned by a shell-level surface, not a conditional subscreen.
- **Responsive shell:** Current breakpoints are mobile/tablet through `1023px` and desktop from `1024px`. Equivalent content is required, but the sidebar and header placements intentionally differ.
- **Display contract:** MXN major units receive native fixed two-decimal formatting. Zero is valid data. Error text and asynchronous state are textual/semantic, not color-only.
- **Test conventions:** Use `userEvent`, `screen`, explicit DTO fixtures, named mock exports, no import file extensions, no CSS assertions, no internal component mocks, and preserve any existing skipped tests.
- **Design constraints:** The final UI is compact, has no icon-only control, respects existing light/dark `data-theme` behavior, and conveys load/error state through text in addition to visual treatment.
- **No persistence:** Neither route nor callback writes cookies, local storage, session state, or URL state. Query cache remains in memory for the browser session only.

## Open Questions / Out of Scope

### Open Questions

- None. The research document records answers for backend envelope, missing-record behavior, authorization, placement, display copy, refresh treatment, and later request actions.

### Out of Scope

- Balance-addition request creation, approval, rejection, cancellation, listing, transaction history, dedicated balance routes/screens, and action entry points.
- Cookies/session/user-info changes, polling, WebSockets, SSE, optimistic financial updates, cache persistence, or an explicit refresh button.
- New dashboard layouts or nested-route support, global dashboard/subscreen heading cleanup, mobile menu accessibility cleanup unrelated to this surface, backend changes, dependencies, environment variables, and broad route-handler normalization.
