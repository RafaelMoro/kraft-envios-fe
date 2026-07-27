# Display Current Balance - Story 1 Research
## Story Definition

### Story Title

Display the authenticated user's current balance.

### Description

Expose the authenticated user's current MXN balance in the persistent dashboard
shell across the existing Quotes, Guides, Addresses, and Profit Margin areas.
The experience must provide equivalent information on desktop and
mobile/tablet without blocking navigation while balance data loads or fails.

The balance comes from the backend `GET /balance` endpoint through an
authenticated Next.js route handler. The first dashboard visit performs an
authoritative fetch. Balance is not persisted in a cookie because approval can
happen outside the user's browser and make a stored snapshot stale.

Story 1 displays balance only. Creating, listing, cancelling, approving, and
rejecting balance-addition requests remain in later epic stories.

### Scope Classification

Single independently deliverable story with cross-feature dashboard-shell,
API, shared-data, query-cache, and test integration.

### Research Mode

Full research.

### User-Confirmed Decisions

- Show balance in the persistent shell shared across dashboard areas.
- On desktop, place it in the sidebar below the navigation buttons.
- On mobile/tablet, place it below the menu.
- Cover all current dashboard feature areas rather than one subscreen.
- Support desktop and mobile/tablet experiences.
- Fetch the current balance on first use.
- Do not save balance in a cookie.
- Do not add a cookie, polling, or real-time update mechanism; approval is
  communicated to the user by email.
- Keep Story 1 display-only; defer the request action entry point.
- Provide enough verified UI references for a separate design tool.
- Store this research at
  `ai-research/balance-addition/display-current-balance.story-1.md`.

### Acceptance Criteria

1. An authenticated dashboard session retrieves current balance from backend
   `GET /balance` through a local authenticated Next route handler.
2. A persistent balance surface is available across Quotes, Guides, Addresses,
   and Profit Margin on both desktop and mobile/tablet experiences.
3. The amount is identified as MXN, formatted with two decimal places, and a
   numeric zero is visibly rendered as `$0.00` rather than hidden.
4. Initial loading, background refresh, error, and loaded states remain compact
   and do not block or disable unrelated dashboard navigation.
5. The first mounted dashboard shell performs an authoritative fetch, and the
   balance is not persisted in a cookie.

### Delivery Boundaries

- Cover the dashboard shell and all feature areas currently switched within it.
- Cover the local balance BFF contract and authenticated data flow.
- Cover a zero-safe MXN display contract.
- Cover balance-query caching and freshness.
- Keep balance out of session and user-info cookies.
- Cover focused responsive, loading, error, zero, and positive-value tests.
- Do not include balance-request creation or an actionable request entry point.
- Do not add a dedicated balance screen, nested route, transaction ledger,
  real-time updates, or optimistic financial updates.
- Do not select the final visual layout; provide constraints and references to
  the design tool.

## Technical Research

### Verified Current State

- No balance route, endpoint constant, DTO, callback, query, component,
  fixture, or test exists under `src` or `__tests__`.
- `src/app/dashboard/page.tsx` is the only dashboard App Router page.
- There is no `src/app/dashboard/layout.tsx`.
- `src/features/Dashboard/Dashboard.tsx` owns dashboard navigation as local
  state rather than URL-based navigation.
- Current dashboard screens are `quotes`, `overview`, `marginProfit`, and
  `addresses`, as defined in `src/shared/types/dashboard.types.ts`.
- Mobile/tablet has a persistent header above conditionally mounted screens.
- Desktop has a persistent sidebar but no persistent content header.
- Existing subscreens repeat their own welcome headings; no content header is
  currently shared across every desktop screen.
- The root query provider already spans the dashboard and uses a 60-second
  default `staleTime`.

### Current Dashboard Structure

#### Server boundary

- `src/app/dashboard/page.tsx` reads the access token and user-info cookie on
  the server.
- It dynamically renders `src/features/Dashboard/Dashboard.tsx` with SSR off.
- It passes parsed `userInfo` into the client dashboard.
- It owns the local Flowbite drawer theme used by dashboard navigation.
- Missing authentication currently displays a dismissible
  `src/shared/ui/organisms/LoginRequiredModal.tsx`; this story does not change
  the authentication experience.

#### Client shell

- `src/features/Dashboard/Dashboard.tsx` initially selects `quotes`.
- Changing screens does not change the URL or browser history.
- Selected subscreens are conditionally mounted in separate responsive shell
  branches.
- A balance query owned by a subscreen would unmount during navigation.
- A shell-level balance surface can persist while users switch current screens.

#### Mobile and tablet

- `src/shared/hooks/useMediaQuery.tsx` uses `max-width: 1023px` for the
  mobile/tablet branch.
- The branch renders `Logo` and `HeaderMenuDrawer` in a persistent top header.
- `src/shared/ui/organisms/HeaderMenuDrawer.tsx` owns navigation, theme, and
  sign-out controls.
- This header spans all four current dashboard screens because it sits outside
  their conditional rendering.
- It would not automatically span future nested dashboard routes because there
  is no dashboard layout.

#### Desktop

- Desktop begins at `min-width: 1024px`.
- `Dashboard.tsx` and `src/app/globals.css` use a 20% sidebar and 80% content
  grid.
- `src/shared/ui/organisms/Aside.tsx` persists across the current screens and
  owns logo, theme, navigation, and sign-out controls.
- Desktop has no shared top content header today.
- The design must define how a new shell-level header coexists with the fixed
  sidebar and repeated subscreen headings without duplicating information.

### Cross-Feature Reach

The persistent shell currently wraps these areas:

- Quotes and guide creation through
  `src/features/Dashboard/subscreens/QuotesSubscreen.tsx`.
- External and Kraft DB guide review through
  `src/features/Dashboard/subscreens/Order.tsx`.
- Address management through
  `src/features/Dashboard/subscreens/AddressesSubscreen.tsx`.
- Admin profit margins through
  `src/features/Dashboard/subscreens/MarginProfitSubscreen.tsx`.

The balance surface should not be duplicated inside each feature. It belongs at
the common shell boundary used by these areas.

### Backend Contract

The supplied backend contract is:

- Method and path: `GET /balance`.
- Authentication: current bearer token.
- Data: `{ balance: { amount: number } }` within the documented backend
  response envelope.
- Currency: MXN major units.

The browser must call a local route handler under `src/app/api/**/route.ts`.
Only server code should access `BACKEND_URI` or extract the bearer token from
the httpOnly session cookie.

### Route-Handler Pattern

- `src/app/api/address/route.ts` is the closest simple authenticated GET
  precedent.
- It reads the access token, rejects a missing token, forwards a bearer token,
  and returns upstream JSON through the local BFF.
- `src/app/api/guides-db/route.ts` is the closest precedent for forwarding an
  upstream envelope unchanged.
- New balance handlers should preserve relevant upstream authentication and
  transport statuses as decided in the parent epic, rather than inheriting the
  older pattern that collapses every upstream failure into HTTP 400.
- Balance uses `BACKEND_URI`; the separate `product-sat` external URI is not
  involved.

### Authentication And User Cookie Flow

- `src/shared/types/login.types.ts` defines `LoginData` with user email, name,
  last name, roles, and response metadata. It has no balance field.
- `src/app/api/route.ts` stores the complete upstream `LoginData` as the
  `user-info` cookie at login.
- `src/shared/lib/auth.lib.ts` provides `saveUserInfo`, `getUserInfo`, and
  `deleteUserInfo`.
- `saveUserInfo` replaces the complete cookie; there is no merge or
  balance-specific update helper.
- The cookie is httpOnly, secure, and sameSite strict.
- Browser JavaScript cannot read or write it through `document.cookie`.
- Server code reads it and passes parsed data to the dashboard as a prop.
- The login response gives the cookie a five-day maximum age.
- Sign-out deletes both session and user-info cookies.

### Balance Persistence Decision

- Balance will not be saved in the session or user-info cookie.
- Backend approval can happen outside the user's browser, so a persisted value
  could become stale without a corresponding frontend event.
- The user receives an approval email; no additional real-time balance update
  mechanism is part of this story.
- `GET /balance` remains the sole authoritative balance source.
- TanStack Query may cache the fetched response for the active browser session.

### Query And Freshness Patterns

- `src/app/layout.tsx` wraps the app in
  `src/features/QueryProviderWrapper.tsx`.
- `QueryProviderWrapper` creates its `QueryClient` inside `useRef`; moving it to
  module scope could share user-sensitive cache across requests.
- The default query `staleTime` is 60 seconds.
- A shell-mounted query remains available while current dashboard subscreens
  mount and unmount.
- `src/features/Dashboard/subscreens/Order.tsx` demonstrates complete query
  keys, conditional `enabled` behavior, and prefix invalidation after mutation.
- `src/shared/hooks/useGetAddress.tsx` and
  `MarginProfitSubscreen.tsx` demonstrate exposing and calling `refetch`.
- Story 1 contains no balance-changing mutation and adds no explicit polling or
  real-time refresh mechanism.

### Currency Formatting

- `src/shared/utils/global.utils.ts` currently provides
  `formatNumberToCurrency()`.
- That helper formats USD with the `en-US` locale.
- Its falsy check returns an empty string for numeric zero.
- It cannot satisfy Story 1 unchanged.
- Native `Intl.NumberFormat` supports MXN and fixed two-decimal formatting
  without a new dependency.
- `es-MX` with MXN renders zero as `$0.00`; `en-US` with MXN renders `MX$0.00`.
- Because `$` alone can be ambiguous, surrounding UI copy should identify MXN
  even when the formatted value uses the short Mexican symbol.
- The display contract should handle zero as data, not as absence.

### Shared Code Conventions

- API endpoint constants live in `src/shared/constants`, including
  `src/shared/constants/global.constants.ts` and domain-specific files.
- Domain response types live under `src/shared/types`.
- Typed browser callbacks that call local BFF routes live under
  `src/shared/utils`.
- Domain UI belongs under `src/features/Balance/` rather than inside Quotes,
  Guides, Addresses, or Profit Margin.
- Shell integration remains in the existing Dashboard boundary.
- No service layer, query-key factory, state manager, or new dependency is
  justified by this story.

### UI Design Reference Handoff

Provide the design tool with these primary references:

- `DESIGN.md`: colors, typography, Flowbite/Tailwind usage, dark mode, and
  component guidance.
- `src/features/Dashboard/Dashboard.tsx`: responsive branches and shell
  ownership.
- `src/shared/ui/organisms/Aside.tsx`: persistent desktop navigation surface.
- `src/shared/ui/organisms/HeaderMenuDrawer.tsx`: persistent mobile/tablet
  header and drawer.
- `src/features/Dashboard/DashboardAsideLink.tsx`: desktop navigation item.
- `src/shared/ui/atoms/MenuMobileLink.tsx`: mobile navigation item.
- `src/shared/ui/atoms/Logo.tsx`: current shell branding.
- `src/app/globals.css`: responsive desktop grid and global theme behavior.

Provide these value and state references:

- `src/features/Quotes/QuoteCard.tsx`: current price hierarchy.
- `src/features/Dashboard/subscreens/GuideDbCard.tsx`: responsive card, amount,
  status, and dark-mode treatment.
- `src/features/ProfitMargin/ProfitMarginCardSkeleton.tsx`: compact loading
  placeholder.
- `src/features/ProfitMargin/ShowProfitMargin.tsx`: loading, error, and loaded
  branching.
- `src/shared/ui/atoms/ErrorMessage.tsx`: inline error text.
- `src/shared/ui/atoms/ErrorBanner.tsx`: dismissible error banner.
- `src/shared/ui/atoms/Notification.tsx`: toast feedback pattern.

### UI Design Constraints

- Design a persistent balance surface across all current dashboard areas.
- Mobile/tablet already has a top header at widths through 1023px.
- Desktop starts at 1024px and reserves 20% for a sidebar; show balance below
  the sidebar navigation buttons.
- On mobile/tablet, show balance below the menu.
- Equivalent information and states are required at both breakpoints; geometry
  does not need to be identical.
- Use the display pattern `Saldo: $31.45`, with the amount formatted as MXN.
- Define positive, explicit `$0.00`, loading-skeleton, refresh, and error states.
- Replace the amount with a compact skeleton while it is loading.
- Keep loading and error states compact so navigation remains stable and usable.
- Do not hide the last loaded value solely because a background refetch fails.
- Support existing light and dark themes.
- Use existing Geist typography, primary blue, neutral surfaces, Flowbite React,
  and Tailwind v4 conventions from `DESIGN.md`.
- Do not communicate errors or freshness by color alone.
- Expose asynchronous status semantically without repeatedly interrupting users.
- Give every icon-only interactive control an accessible name.
- Story 1 has no request-creation button or future-route navigation.

### Testing Rules And Relevant Coverage

Follow `.github/copilot-instructions.md`:

- Use `userEvent`, not `fireEvent`, for user interactions.
- Do not mock internal feature or shared components.
- Mock external network behavior and unavailable browser APIs only.
- Use relative paths for project modules in `jest.mock()`.
- Use explicit DTO types; do not use `any` or `unknown`.
- Match fixtures to the callback's actual return shape.
- Query by role, accessible name, label, or visible text.
- Do not assert CSS classes, colors, fonts, or layout.
- Preserve existing skipped tests.

Relevant test references:

- `__tests__/feature/Dashboard/Order.test.tsx` creates a fresh QueryClient with
  retries disabled and covers responsive loading/error behavior.
- `__tests__/feature/Dashboard/AddressesSubscreen.test.tsx` covers skeleton and
  error states.
- `__tests__/feature/Dashboard/MarginProfitSubscreen.test.tsx` demonstrates a
  query wrapper around a dashboard subscreen.
- `__tests__/feature/Quotes/QuotesSubcreen.test.tsx` covers current welcome
  behavior.
- `__tests__/home.test.tsx` demonstrates root query and App Router wrappers.
- There are no existing focused tests for `Dashboard`, `Aside`,
  `HeaderMenuDrawer`, `DashboardAsideLink`, or `MenuMobileLink`.
- `jest.config.ts` always collects coverage and ignores helper directories
  `__tests__/mocks/` and `__tests__/utils-test/` as suites.

Smallest useful Story 1 coverage:

- Initial loading does not remove dashboard navigation.
- A positive balance renders with MXN and two decimal places.
- Zero renders as `$0.00` rather than an empty value.
- A failed fetch leaves unrelated navigation usable.
- Desktop and mobile/tablet shell variants expose equivalent balance content.
- Background refresh behavior preserves the last loaded value when appropriate.

### Dependencies And Integration Points

- Existing Next.js route handlers cover the authenticated BFF boundary.
- Existing Axios usage covers local browser callbacks and upstream proxy calls.
- Existing TanStack Query covers fetch caching, refetch, and invalidation.
- Native `Intl.NumberFormat` covers MXN formatting.
- Existing Flowbite React and Tailwind v4 cover the UI surface.
- Existing Jest and Testing Library cover focused behavior tests.
- No new package, environment variable, state library, or formatting library is
  required.

### Edge Cases And Constraints

- Numeric zero is valid balance data.
- `GET /balance` returns HTTP 200 with `data.balance.amount: 0` when no balance
  record exists; missing balance is implicitly zero, not an error state.
- The balance response may fail independently of all other dashboard data.
- A refetch can fail after a previous value loaded.
- An open browser can retain an older query value after approval occurs in a
  separate admin session.
- Admin approval in another session cannot automatically update this browser.
- Current 60-second query freshness affects automatic refetch timing.
- Dashboard screen changes unmount subscreens but not the shell.
- Future nested routes will not inherit the current shell without a dashboard
  layout; nested-route support is outside Story 1.
- User-info cookie data remains authentication presentation context; balance is
  not added to it.
- The current root document uses `lang="en"` while dashboard copy is Spanish;
  this existing mismatch is relevant to accessibility review but outside this
  story's source scope.
- The current mobile menu icon lacks an accessible name; it is not a suitable
  accessibility precedent for any new control.

## Open Questions

### Backend Contract

- I: Question: Does the full `GET /balance` response retain the parent epic's
  assumed `{ version, data, message, error }` envelope in every success case?
  Status: answered
  Answer: Yes. The supplied success response is the success response that
  `GET /balance` will always return.
  Context: The local callback and fixtures can use that complete response shape
  as the stable success contract.

- II: Question: For `GET /balance`, which upstream HTTP status and error body
  represent an authenticated user whose balance record does not yet exist?
  Status: answered
  Answer: HTTP 200 with the normal `{ version, data, message, error }` success
  envelope, `data.balance.amount: 0`, `message: null`, and `error: null`.
  Context: `balanceService.getBalance` defaults a missing balance record's
  cents to zero. It does not throw a not-found error for this read path.

### Cache And Freshness

- I: Question: How does the user's open dashboard learn that an external admin
  approved the balance request?
  Status: answered
  Answer: The user receives an approval email. Story 1 adds no other
  notification, polling, or real-time balance update mechanism.
  Context: A subsequent authoritative balance fetch returns the updated value.

### UI And Product Decisions

- I: Question: Where should the persistent balance surface sit on desktop while
  preserving the existing 20% sidebar and repeated subscreen headings?
  Status: answered
  Answer: On desktop, show balance in the sidebar below the navigation buttons.
  On mobile/tablet, show it below the menu.
  Context: The separate design tool can determine the exact composition within
  these confirmed placements.

- II: Question: What Spanish label should accompany the amount?
  Status: answered
  Answer: Use `Saldo: $31.45` as the display pattern.
  Context: The numeric portion remains formatted as MXN with two decimals.

- III: Question: Should a background refetch expose a visible refreshing or
  stale indicator while retaining the last loaded amount?
  Status: answered
  Answer: Show a skeleton in place of the amount while it is loading.
  Context: The loading treatment remains local to the amount and does not block
  dashboard navigation.

- IV: Question: Should Story 1 include an entry point to balance-request
  actions?
  Status: answered
  Answer: No. Story 1 is display-only; the request action is deferred to Story
  2 or a later integrated delivery.

### Authorization

- I: Question: Is current balance available to every authenticated role using
  the same `GET /balance` contract?
  Status: answered
  Answer: Yes. Every authenticated role uses the same `GET /balance` contract.
  Context: The dashboard supports `user` and `admin` roles, including the
  admin-only Profit Margin area.

## Assumptions

- `GET /balance` is served under the existing `BACKEND_URI`.
- It accepts the existing bearer token extracted from the session cookie.
- `amount` is an MXN major-unit number returned by the backend.
- The four current local dashboard screens are the complete Story 1 reach.
- “Persistent balance surface” means shell-level UI, not repeated feature-level
  balance components.
- Equivalent responsive behavior does not require identical desktop and mobile
  geometry.
- The first shell mount always requests authoritative balance data.
- Balance is not persisted in a cookie.
- Story 1 does not add a polling, WebSocket, or server-sent-event mechanism.
- Existing dependencies are sufficient.
- Final component geometry, spacing, and visual hierarchy will be produced by a
  separate design tool using the handoff references above.
