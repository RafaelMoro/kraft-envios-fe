# Guides DB Epic Research

## Story Definition

### Epic Title

Guides DB creation and guide list source switching.

### Epic Description

The backend now supports a Guides DB entity that creates a guide in the app database and also attempts guide creation with the external provider. The frontend should add DB-backed guide creation from a selected quote, add list views for DB-backed guides, and keep the current external-provider guides view available through a Flowbite button group.

This research is an epic breakdown only. It does not plan implementation or include source code changes.

### Why This Exists

The current `Ver guias` screen fetches guides directly from external-provider APIs through `/api/guides/get-guides`. Those APIs do not always return all guide details, which can mislead users. Guides DB should display the app-owned saved guide data instead of depending only on external-provider responses.

### Epic Stories

#### Story 1: Create Guides DB From Quote

Acceptance criteria:

1. A user can select exactly one quote and open a DB-backed guide creation modal from the existing `Crear guía` action in `QuotesSubscreen`.
2. The modal sends `provider`, `quoteId`, `parcel`, `origin`, `destination`, and `notifyMe` to a new BFF route that proxies the new backend create endpoint.
3. `provider` is constrained to existing quote sources and is derived from the selected quote: `GE`, `TONE`, `Pkk`, or `Mn`.
4. Parcel dimensions come from the quote request, while content, SAT product, value, quantity, and notify preference are filled in the guide flow.
5. The result UI can show both `created` and `failed` Guides DB responses without treating all HTTP 201 responses as provider success.

#### Story 2: My Guides DB List

Acceptance criteria:

1. A regular user can switch from `Ver guias externas` to `Ver mis guias` from the existing guides screen.
2. The DB-backed list supports month, year, and pagination query params.
3. The UI displays saved guide data including failed guide records when the backend returns them.
4. Soft-deleted guides are not returned by `GET /guides/db`, so regular users do not see deleted guides.
5. Loading, empty, and error states remain clear on desktop and mobile/tablet layouts.
6. The guides screen uses a Flowbite button group with `Ver guias externas`, `Ver mis guias`, and `Ver todas las guias`; the last button is reserved for Story 3 admin behavior.

#### Story 3: Admin All Guides DB List

Acceptance criteria:

1. Admin users can use the `Ver todas las guias` button group option; non-admin users do not fetch or access this source.
2. Admin users can see guides that regular users have soft-deleted for auditing.
3. The route handler proxies admin query params and preserves auth through the session token.
4. Admin UI can switch between regular-user view behavior and all-guides/admin behavior where required by the guides screen.
5. Admin list filters include month, year, pagination, and a scope select with `Todas las guías` and `Mis guías`.
6. Admin UI can show soft-deleted metadata when present (`deletedAt`, `deletedBy`) without breaking normal guide cards.
7. Non-admin access is hidden in UI and should still rely on backend authorization for enforcement.

#### Story 4: Soft Delete Guide DB (Regular User)

Acceptance criteria:

1. A regular user (any role value: `user` or `admin`) can soft-delete a non-deleted Guides DB record they own from both `GuideDbCard` (list) and `GuideDbDetails` (details screen) in the `Ver mis guias` source. Backend enforces ownership: a regular user can only soft-delete their own guides.
2. The delete control is hidden when `guide.deletedAt` is non-null so already-soft-deleted records cannot be re-deleted from the regular UI.
3. Soft delete asks for confirmation through a Flowbite `Modal` before sending the request. Modal copy: title `¿Deseas eliminar esta guia?`, body `Esta acción no se puede deshacer.`, confirm `Eliminar`, cancel `Cancelar`.
4. The UI calls a new BFF `DELETE` route at `/api/guides-db/{kraftId}` that proxies the backend `DELETE /guides/db/{kraft-id}` soft-delete endpoint with `getAccessToken()` and `Authorization: Bearer <token>`. The `kraftId` is URL-encoded as a defensive default.
5. The backend returns HTTP 200 with `{ version, message, error, data: { guide: { kraftId } } }`; the BFF forwards that envelope and reacts to non-2xx errors with the existing `{ message }` 400 pattern (including 4xx from the backend).
6. On success the UI invalidates the active Guides DB list query (regular and admin sources), which triggers a refetch that drops the deleted record. If the user is on `GuideDbDetails`, the UI calls `onBack` to return to the list. No success notification is shown; the refetched list is the only signal of success. Errors use the existing `useNotification` + `Notification` atom.
7. The delete control is a Flowbite icon button using `RiDeleteBinLine` from `@remixicon/react` (already used in `src/features/Addresses/AddressCard.tsx:2`). Planning phase should search for the exact existing icon-button implementation pattern in this repo before final placement.
8. Regular users are not informed that deletion is "soft" or that records persist; the feature is presented simply as deleting the guide. Hard delete is admin-only and never exposed to regular users in this story.
9. The hard-delete path (`DELETE /guides/db/{kraft-id}/hard`) is intentionally out of scope for this story and is captured in Story 5.
10. The delete control is only rendered in the `Ver mis guias` source. Admins viewing `Ver todas las guias` (other users' guides) do not see a soft-delete control in this story; that source is for viewing/auditing only.

Scope notes:

- This story is regular-user-facing; admin users acting as regular users in `Ver mis guias` also soft-delete via the same flow.
- Soft-deleted guides disappear from `GET /guides/db` for regular users and from refetched `GET /guides/db/admin` for admins, but remain in DB for auditing (already enforced by backend and surfaced through Story 3 admin `includeDeleted` toggle for previously-deleted records).
- The delete control belongs in the existing `Order` source views only; external guide list (`Ver guias externas`) has no delete action.
- The full research note for this story is in `ai-research/soft-delete-guide-db.story.md`.

#### Story 5: Hard Delete Guide DB (Admin)

Acceptance criteria:

1. Admin users can hard-delete a Guides DB record from the `Ver todas las guias` source through `GuideDbCard` and `GuideDbDetails`.
2. Hard delete is gated behind the same `userInfo.data.user.role.includes('admin')` check used for the admin source; non-admins never see the hard-delete control.
3. The UI calls a new BFF `DELETE` route at `/api/guides-db/{kraftId}/hard` that proxies the backend `DELETE /guides/db/{kraft-id}/hard` endpoint with the same auth guard as the soft-delete route.
4. The backend returns the same response envelope as soft delete (`{ version, message, error, data: { guide: { kraftId } } }` with HTTP 200); the BFF treats both soft and hard delete responses identically.
5. Hard-delete confirmation UI distinguishes the action from soft delete (e.g., explicit warning copy) because the record is permanently removed from DB.
6. On success the UI invalidates the admin Guides DB list query (including `includeDeleted` refresh) and stays on the list.
7. Backend authorization must still enforce admin-only hard delete; frontend gating is convenience, not security.

Scope notes (hard delete stub):

- This story is intentionally left as an un-groomed stub. ACs above are draft and should be revisited when the story is researched.
- Hard delete should be researched separately and is not in the scope of the soft-delete story below.
- Hard delete is only meaningful for admin viewing of already-soft-deleted or live records; the exact eligibility rules (e.g., can a guide be hard-deleted without being soft-deleted first) are pending backend confirmation.

### Recommended Story Order

1. Story 1: Create Guides DB From Quote.
2. Story 2: My Guides DB List.
3. Story 3: Admin All Guides DB List.
4. Story 4: Soft Delete Guide DB (Regular User).
5. Story 5: Hard Delete Guide DB (Admin).

### Story Boundary Notes

- The full request is an epic, not one story.
- Create flow touches quotes, guides, addresses, SAT lookup, BFF routes, shared types, and result UI.
- List flow touches dashboard guide screen, route handlers, query params, admin role checks, and guide card shape mapping.
- Source switching is through one Flowbite button group: `Ver guias externas`, `Ver mis guias`, and `Ver todas las guias`.
- Story 2 wires `Ver guias externas` and `Ver mis guias`; Story 3 wires admin behavior for `Ver todas las guias`.
- Retry failed guide creation is future scope and should remain out of these stories.
- Delete Guides DB is now part of this epic: Story 4 covers regular-user soft delete, Story 5 covers admin hard delete (stub).

## Technical Research

### Affected Areas

Routes/pages:

- `src/app/dashboard/page.tsx` reads auth and user cookies, then renders `Dashboard` client-side.
- `src/features/Dashboard/Dashboard.tsx` owns active dashboard screen and renders `QuotesSubscreen`, `Order`, `MarginProfitSubscreen`, and `AddressesSubscreen`.
- `src/shared/ui/organisms/Aside.tsx` already computes admin with `userInfo.data.user.role.includes('admin')` and hides admin-only margin screen.
- `src/shared/types/dashboard.types.ts` currently defines `DashboardScreens = 'quotes' | 'overview' | 'marginProfit' | 'addresses'`.

API route handlers:

- Existing external guide routes live under `src/app/api/guides/**/route.ts`.
- Current external list route is `src/app/api/guides/get-guides/route.ts`, proxying `${BACKEND_URI}/guides` and returning `{ guides, messages }`.
- Current provider create routes proxy to `${BACKEND_URI}/{provider}/create-guide`.
- New Guides DB create/list/admin endpoints should follow the same BFF route-handler pattern with `getAccessToken()` and `Authorization: Bearer <token>`.
- New backend paths provided so far: `POST /guides/db/create`, `GET /guides/db`, and `GET /guides/db/admin`.

Feature UI:

- `src/features/Dashboard/subscreens/QuotesSubscreen.tsx` owns selected quotes and currently opens provider-specific guide modals from `handleClickCreateGuide` and `handleCreateGuideQuoteCard`.
- `src/features/Dashboard/subscreens/Order.tsx` is the current `Ver guias` screen and fetches external guides with `useQuery({ queryKey: ['guides'], queryFn: getGuidesCb })`.
- `Order` should separate external, regular DB, and admin DB guide sources through a Flowbite button group using labels `Ver guias externas`, `Ver mis guias`, and `Ver todas las guias`.
- `src/features/Guides/Mn/CreateGuideModalMn.tsx` is closest to the requested DB create flow because it already uses saved address aliases, temporary addresses, SAT product search, value, and quantity.
- `src/features/Guides/Mn/AddAddressMn.tsx` maps saved addresses from `useGetAddress()` into MN payload shape.
- `src/features/Guides/Mn/ParcelInfoForm.tsx` collects SAT product, content, value, and quantity.
- `src/features/Guides/Mn/ProductSatDropdown.tsx` already searches SAT products.
- `src/features/Guides/ResultGuideScreen.tsx` currently assumes mutation `isSuccess` means guide creation success, which will not match DB responses with `status: failed`.
- `src/features/Guides/ViewGuides/GuideCard.tsx` currently renders external guide fields and has special handling for PKK deferred fetch.

Shared code:

- `src/shared/types/guides.types.ts` contains provider payloads, guide response shapes, SAT product types, schemas, and `ProviderSource` imports from quote types.
- `src/shared/types/quotes.types.ts` already defines `QUOTE_SOURCES = ['GE', 'TONE', 'Pkk', 'Mn']` and `ProviderSource`.
- `src/shared/constants/guides.constants.ts` contains current endpoints and initial form state.
- `src/shared/utils/guides.utils.ts` contains callbacks for create/list guide routes and helpers for address normalization, SAT product lookup, status mapping, and ID generation.
- `src/shared/hooks/useGetAddress.tsx` fetches saved addresses using query key `['addresses']`.
- `src/shared/types/addresses.types.ts` defines saved `Address` shape used by `SelectAddressDropdown`.

Tests:

- Existing guide tests live under `__tests__/feature/Guides/*`.
- Existing dashboard guide list tests live in `__tests__/feature/Dashboard/Order.test.tsx`.
- Existing quote flow tests live in `__tests__/feature/Quotes/QuotesSubcreen.test.tsx`.
- Test helper dirs `__tests__/mocks/` and `__tests__/utils-test/` are ignored as test suites but provide wrappers and browser API mocks.

### Existing Patterns To Follow

App Router and client split:

- Keep dashboard feature UI in client components under `src/features/**`.
- Keep backend calls requiring session cookies in `src/app/api/**/route.ts`.
- Do not read auth cookies in client components; client calls should hit BFF routes.
- Do not move the React Query client out of `src/features/QueryProviderWrapper.tsx`'s `useRef`.

TanStack Query:

- Current guide list uses `useQuery` with `getGuidesCb` and local transform in `Order`.
- New source-specific list queries should use distinct query keys including source and filters.
- Creation flows use `useMutation` and callbacks from `src/shared/utils/guides.utils.ts`.

Forms:

- Existing guide forms use `react-hook-form` with `yupResolver`.
- Existing MN flow is the closest reusable pattern for address selection, temporary addresses, SAT product, value, and quantity.
- Existing GE/Pkk/Tone flows differ mostly because their external providers require provider-specific payloads; Guides DB payload is unified across providers.

Flowbite React:

- Existing UI uses Flowbite `Button`, `Dropdown`, `Modal`, `TextInput`, `Spinner`, and badges.
- The requested source selector should use Flowbite React button group docs: https://flowbite-react.com/docs/components/button-group
- No new dependency is needed because `flowbite-react` is already installed.

Styling:

- Tailwind v4 is configured through `postcss.config.mjs` only.
- Preserve current dashboard spacing and responsive branches instead of introducing a new layout system.

Route handler proxy style:

- Existing handlers check `getAccessToken()` and return `400` for missing token.
- Existing handlers attach `Authorization: Bearer ${accessToken}`.
- Existing handlers commonly unwrap backend errors from `error.response.data.error.message`.
- Response envelopes vary; avoid assuming all backend routes return `{ data: { guide } }`.

### Backend Contract Captured So Far

Endpoint paths:

- Create Guides DB: `POST /guides/db/create`.
- Get my Guides DB: `GET /guides/db`.
- Get all/admin Guides DB: `GET /guides/db/admin`.
- Soft delete Guides DB: `DELETE /guides/db/{kraft-id}`.
- Hard delete Guides DB: `DELETE /guides/db/{kraft-id}/hard` (admin-only).

Delete Guides DB response envelope (soft and hard):

- HTTP 200.
- `{ version, message, error, data: { guide: { kraftId } } }`.
- `version` is `1.2.0` as observed.
- `message` and `error` are `null` on success.
- Soft and hard endpoints return the same response shape.

Get my Guides DB query params:

- `page`: optional number.
- `limit`: optional number; default backend page size is 10, and UI can expose default, 50, and 100.
- `month`: optional number from 1 to 12, for example `3`; do not send `03` or month names.
- `year`: optional full year number, for example `2026`; do not send two-digit years like `26`.

Get admin Guides DB query params:

- `scope`: `all | own`.
- `page`: optional number.
- `limit`: optional number; default backend page size is 10, and UI can expose default, 50, and 100.
- `month`: optional number from 1 to 12, for example `3`; do not send `03` or month names.
- `year`: optional full year number, for example `2026`; do not send two-digit years like `26`.

List response envelope:

- Envelope is `{ version, message, error, data }`.
- `data.guides` is an array of Guides DB records.
- `data.total` is total matching records.
- `data.page` is current page.
- `data.limit` is current page size.
- `data.totalPages` is total pages.
- Admin and regular list examples use the same response shape.
- `GET /guides/db` does not return soft-deleted guides.
- Admin list behavior can include guides that regular users soft-deleted.

Create Guides DB payload example:

- `provider`: one of `GE`, `TONE`, `Pkk`, `Mn`; it is derived from the selected quote source.
- `quoteId`: selected quote ID from quotes feature.
- `parcel.length`, `parcel.width`, `parcel.height`, `parcel.weight`: numeric dimensions from quote request.
- `parcel.content`: user-entered content.
- `parcel.satProductId`: use the same value current provider guide flows use, `selectedProduct.code`.
- `parcel.value`: optional; only attach when the user fills it.
- `parcel.quantity`: optional; only attach when the user fills it.
- `origin` and `destination`: same field list with alias, name, lastName, phone, email, company, street1, external_number, neighborhood, city, town, state, zipcode, country, reference.
- `notifyMe`: always accepted, defaults to `false`.

Create Guides DB response fields observed:

- Envelope may be `{ version, message, error, data }`.
- `data.kraftId` is the app-owned guide ID.
- `data.quoteId` may exist in successful responses.
- `data.externalId`, `shipmentNumber`, `carrier`, `price`, `guideLink`, `labelUrl`, and `file` can be `null`.
- `data.status` can be `created` or `failed`.
- `data.provider` uses the provider source value.
- `data.isProviderTrackingSynced` is boolean.
- `data.createdAt`, `updatedAt`, `deletedAt`, `deletedBy` are present.
- `data.failureInfo` is `null` for successful provider creation and contains `errorDetails`, `errorCode`, `timestamp` for failed provider creation.
- For `status: failed`, user-facing error messaging should be derived from `failureInfo.errorCode` and `failureInfo.errorDetails`; exact friendly-copy mapping depends on the error code context to be provided later.
- Successful response includes persisted `origin`, `destination`, and `parcel` details.

Guides DB backend error codes provided so far:

- `GDE-AUTH-001`: user email is missing from request or not found in database.
- `GDE-NF-001`: guide cannot be found by `kraftId` or ObjectId.
- `GDE-NF-002`: syncing a guide that has no external tracking ID.
- `GDE-RTL-001`: retry eligibility check fails because max attempts or cooldown is active.
- `GDE-BDN-001`: general database error during guide creation.
- `GDE-BDN-008`: `kraftId` counter update/creation fails.
- `GDE-BDN-009`: generic/unknown backend error.
- `GDE-BDN-010`: soft delete of a guide fails.
- `GDE-BDN-011`: hard delete of a guide fails.
- `GDE-BDN-012`: updating guide data fails.
- `GDE-PVR-001`: default provider error when no specific mapping exists.
- `GDE-PVR-002`: provider returns empty or invalid guide response.
- `GDE-PVR-003`: provider returns 401 unauthorized.
- `GDE-PVR-004`: provider returns 5xx server error.
- `GDE-PVR-005`: provider returns validation/fields error (400).
- `GDE-PVR-006`: provider indicates quote ID has expired.
- `GDE-NET-001`: DNS/network error (`ENOTFOUND`).
- `GDE-TMOT-001`: connection timeout error (`ETIMEDOUT`).
- `GDE-RLIM-003`: provider returns rate limit error.
- `GDE-BUS-007`: invalid provider is specified.

Story 1 error-message scope:

- Creation result UI should prioritize `GDE-PVR-*`, `GDE-NET-001`, `GDE-TMOT-001`, `GDE-RLIM-003`, `GDE-BUS-007`, `GDE-AUTH-001`, `GDE-BDN-001`, `GDE-BDN-008`, and `GDE-BDN-009` because these can affect guide creation.
- Delete, sync, retry, and update codes are useful context but out of Story 1 unless they appear in create responses.

**Important mismatch:**

- Existing `GlobalCreateGuideResponse` expects `trackingNumber`, `source`, `carrier`, `price`, `guideLink`, `labelUrl`, and `file`.
- Guides DB response uses `kraftId`, `provider`, `externalId`, `status`, and can represent provider failure as a successful DB record.
- The new DB flow needs its own types or a deliberate mapper before using existing UI.

### Existing Create Flow Findings

Current quote-to-guide flow:

- `QuotesSubscreen` stores selected quotes in local state.
- The action bar button validates one selected quote.
- Quote card action sets a single selected quote and opens the provider modal.
- Provider-specific modal is selected from `selectedQuotes[0].source`.
- `QuoteForm` stores package dimensions in `packageDimensions.current` before fetching quotes.
- `CreateGuidePkk` and `CreateGuideGE` already receive `packageDimensions`; MN and Tone currently do not.

Implication for Guides DB:

- Replacing `Crear guía` with the new DB flow can be smaller than maintaining four provider-specific create paths for this feature.
- The modal should use `selectedQuotes[0].source` as `provider` and `selectedQuotes[0].id` as `quoteId`; for example, a selected TONE quote sends `provider: 'TONE'`.
- The modal still needs access to `packageDimensions.current`; currently only GE/PKK modals receive it.
- Existing MN address and parcel components are the closest starting point, but they do not include length/width/height/weight in parcel because MN external route did not require them.

Address selection:

- `SelectAddressDropdown` fetches saved addresses through `useGetAddress()`.
- `AddAddressMn` maps saved address fields into provider shape.
- Saved `Address` uses `addressName`, `externalNumber`, `city[]`, `town[]`, and `zipcode`.
- Guides DB payload expects `street1`, `external_number`, scalar `city`, scalar `town`, and `zipcode`.
- Temporary address flows exist for MN/Tone/Pkk.

SAT product:

- `ProductSatDropdown` exists and debounces lookup by 1.5 seconds.
- Current formatted `SearchProduct` only includes `code` and `description`.
- Existing MN and GE provider guide flows send `selectedProduct.code` as `satProductId`; Guides DB should match that behavior.

Result screen:

- Existing `ResultGuideScreen` title is based on mutation success/error, not guide `status`.
- Guides DB creation can succeed at DB level while provider status is `failed`.
- Result display should distinguish `status: created` from `status: failed` after a successful HTTP response.
- Future retry endpoint is explicitly out of scope, but failure info should be visible enough for users to understand why creation failed.

### Existing Guide List Findings

Current external list flow:

- `Order` calls `getGuidesCb` against `/api/guides/get-guides`.
- The BFF unwraps backend external guides to `{ guides, messages }`.
- `Order` maps guides into `GuideUI` with `id`, `logoSrc`, `hasBeenFetched`, and normalized Tone status.
- PKK external guides can be incomplete and are lazily fetched through `GuideCardPkk`.
- Partial provider failures are communicated through `messages` with TONE and GE constants.

Implication for Guides DB lists:

- DB-backed guides should not reuse external-provider failure notification logic.
- DB-backed guides can include failed provider creation records and should render as saved records, not query errors.
- External source can keep current `getGuidesCb` path and transformation.
- My Guides DB and All Guides DB probably need separate callbacks or one callback with mode/query params.
- `Ver guias externas` should keep the current `/api/guides/get-guides` fetch; `Ver mis guias` should fetch regular `GET /guides/db`; `Ver todas las guias` is the admin source for Story 3.
- Existing `GuideCard` may need a mapper from DB guide to the current card shape or a small DB-specific card if important fields differ too much.
- Regular users will not see their soft-deleted guides in `GET /guides/db`.
- Admin users can see soft-deleted guides for auditing through admin behavior.

Admin gating:

- Role type is `UserRoles = 'user' | 'admin'` in `src/shared/types/global.types.ts`.
- `LoginData.data.user.role` is an array.
- `Aside` already uses `Array.isArray(role) && role.includes('admin')`.
- The same check can gate the admin-only source option in `Order`.
- Backend must still enforce admin authorization.

Delete behavior:

- Backend supports deleting Guides DB records.
- Regular users soft delete guides; these guides disappear from `GET /guides/db` for the user perspective but remain in DB for auditing.
- Admin users can soft delete and hard delete.
- Admin hard delete removes the guide from DB.
- Delete UI and BFF route are now in scope: Story 4 covers regular-user soft delete, Story 5 covers admin hard delete (stub).
- Soft delete endpoint: `DELETE /guides/db/{kraft-id}` returns `{ version, message, error, data: { guide: { kraftId } } }` with HTTP 200.
- Hard delete endpoint: `DELETE /guides/db/{kraft-id}/hard` returns the same envelope with HTTP 200.
- The soft-delete research story lives in `ai-research/soft-delete-guide-db.story.md`.

Pagination and filters:

- No current guide list pagination exists in `Order`.
- Current external list has no month/year filters.
- New DB list routes use `page`, `limit`, `month`, and `year`; admin also uses `scope=all|own`.
- Soft-deleted visibility is role/source behavior: regular list hides soft-deleted guides; admin can see soft-deleted guides for auditing.
- UI can use existing Flowbite form controls already installed; no dependency addition is needed.
- Pagination should include previous/next controls plus direct page numbers, and page-size selection for default, 50, and 100.

### Existing Types And Constants To Update Later

Likely type additions:

- Guides DB provider type can reuse `ProviderSource` from `quotes.types.ts`.
- `CreateGuideDbPayload` for the new unified payload.
- `GuideDbAddress` matching the origin/destination field list.
- `GuideDbParcel` matching dimensions, content, SAT product, and optional value/quantity.
- `GuideDbStatus = 'created' | 'failed'`.
- `GuideDbFailureInfo` for failure details.
- `GuideDb` response type for `kraftId`, provider data, timestamps, soft-delete metadata, failure info, origin, destination, and parcel.
- `GetGuidesDbResponse` for `{ guides, total, page, limit, totalPages }` list data.

Likely constants additions:

- New BFF endpoint constants in `src/shared/constants/guides.constants.ts`.
- Source selector labels for my DB guides and admin all DB guides.
- Final button group labels are `Ver guias externas`, `Ver mis guias`, and `Ver todas las guias`.
- Query key fragments for my-guides and admin/all-guides DB sources.

Do not add new dependencies.

### Testing Rules To Follow

Project-specific rules from `.github/copilot-instructions.md`:

- Use `userEvent` for interactions, not `fireEvent`.
- Do not mock internal components from `@/features` or `@/shared` unless absolutely necessary.
- Mock network requests and browser APIs when needed.
- When mocking hooks with `jest.mock()`, use relative imports instead of `@/` aliases.
- Do not mock `next/image`.
- Do not use `document.querySelector()` or `document.getElementById()` in new tests.
- Do not assert styling/classes unless required for critical functionality.
- Preserve `it.skip()` / `test.skip()` if encountered.
- Do not use `any` or `unknown` in new test types.
- Mock data must match real return shapes after reading actual implementations.

Relevant existing test patterns:

- `__tests__/feature/Quotes/QuotesSubcreen.test.tsx` wraps `QuotesSubscreen` in `QueryProviderWrapper` and `AppRouterContextProviderMock` and mocks `axios` for quote API calls.
- `__tests__/feature/Dashboard/Order.test.tsx` wraps `Order` in `QueryClientProvider`, mocks `useMediaQuery`, and mocks `getGuidesCb` as a network callback.
- `__tests__/feature/Guides/Mn/CreateGuideModalMn.test.tsx` wraps guide modal in a `QueryClientProvider` and uses match media mocks.
- `__tests__/feature/Guides/ViewGuides/GuideCard.test.tsx` verifies visible guide data and label links without mocking internal guide card children.

Smallest useful tests per story:

- Create story: quote action opens DB modal and sends selected quote/provider/dimensions into the flow; modal result handles `created` and `failed` statuses.
- My list story: source selection fetches DB guides with month/year/page params and renders returned DB records.
- Admin list story: admin role sees all-guides/admin UI, non-admin role does not, and admin can see soft-deleted guides.

### Edge Cases And Constraints

- Existing BFF routes return mixed envelopes; do not normalize globally without a separate story.
- Missing session token currently returns `400`, not `401`; follow existing pattern unless product wants a status change.
- `product-sat` uses `NEXT_PUBLIC_GET_SAT_PRODUCT_URI`, not `BACKEND_URI`.
- Current `src/app/api/product-sat/route.ts` logs and returns a debug-shaped `message`; avoid depending on that debug content.
- `GuideCard` uses `guide.source`; DB guide uses `provider`.
- `GuideCard` uses `trackingNumber`; DB failed guide may only have `kraftId` and no external tracking number.
- `generateGuideId()` currently returns `${guide.source}-${guide.trackingNumber}`; this is not safe for failed DB guides without tracking numbers.
- `getGuideStatus()` maps external status text and does not cover DB `failed`.
- Existing external guide statuses are displayed by `getGuideStatusLabel()` with uppercase external statuses; DB statuses are lowercase `created | failed`.
- Soft-deleted guide fields may be `null`; UI should not require them.
- Admin-only visibility in UI is convenience, not security.
- Mobile/tablet dashboard has a separate branch in `Dashboard.tsx`; source selector and filters must work in `Order` regardless of branch.
- Tests collect coverage into `coverage/`; avoid running tests in research phase.

### Dependencies And Integration Points

- No new dependency appears necessary.
- Flowbite React is already installed.
- TanStack Query is already installed.
- Axios is already used for callbacks and route handlers.
- Existing env vars are enough unless backend requires a different base URI; current BFF proxy pattern uses `BACKEND_URI`.
- `.env.example` should only change if backend introduces a new frontend-accessible env var, which is not expected.

## Open Questions

Backend contract:

- Question: Does the create endpoint return HTTP 201/200 for `status: failed`, or does provider failure ever return non-2xx?
  - Status: answered.
  - Answer: Create returns HTTP 201 even when `data.status` is `failed`; the app DB create succeeded and only the external provider failed.
- Question: Is `message` singular or `messages` plural used by the new endpoints?
  - Status: answered.
  - Answer: New endpoints use singular `message`.
- Question: What error shape should the BFF unwrap for the new endpoints?
  - Status: answered.
  - Answer: For DB guide creation failures caused by the external provider, the endpoint still returns HTTP 201 and the UI should read `data.failureInfo.errorDetails` plus `data.failureInfo.errorCode` to decide what friendly message to show. Initial backend error-code context is now listed in the backend contract section.
  - Context: This is different from transport/backend non-2xx errors; those can still follow the existing route-handler fallback pattern.

Create payload:

- Question: Should `parcel.satProductId` be the SAT product `id`, `code`, description, or a backend-specific value?
  - Status: answered.
  - Answer: `parcel.satProductId` should be `selectedProduct.code`, matching existing provider guide flows that use SAT product.
- Question: Should parcel dimensions be sent as numbers or strings?
  - Status: answered.
  - Answer: Parcel dimensions should be sent as numbers, matching the get-quotes/BFF payload behavior.
- Question: Are `parcel.value` and `parcel.quantity` required in create payload?
  - Status: answered.
  - Answer: `parcel.value` and `parcel.quantity` are optional; inputs can be optional and only filled values should be attached to the payload.
- Question: What should `country` be: `MX`, `Mexico`, user-entered value, or the saved address value?
  - Status: answered.
  - Answer: Use `MX`. For now, there will be no UI for choosing other countries.
  - Context: current MN flow already hardcodes `MX`.
- Question: Are `email`, `company`, and `reference` required or can existing default values be used?
  - Status: answered.
  - Answer: `email`, `company`, and `reference` are required values.
- Question: Should saved address `addressName` map to `street1` exactly as current guide flow does?
  - Status: answered.
  - Answer: Yes, saved address `addressName` maps to `street1`, matching current guide flow.
- Question: Is `notifyMe` provider-specific or always accepted?
  - Status: answered.
  - Answer: `notifyMe` is always accepted and defaults to `false`.

UI/product decisions:

- I: Question: Should failed DB guide creation show in the same success result screen with warning copy, or a separate failed-record screen?
  - Status: answered.
  - Answer: Map provider error codes to friendly, concise, clear user messages. Start with the known error codes and add more mappings later as they appear.
  - Context: Guides DB create returns HTTP 201 even when `data.status` is `failed`, because only the external provider failed.
- II: Question: Should month/year default to current month/year or all dates?
  - Status: answered.
  - Answer: Default to the current month and year when the user has not filled filters.
  - Context: `GET /guides/db` and `GET /guides/db/admin` accept optional numeric `month` and `year` query params. `month` is `1`-`12`; `year` is a full year such as `2026`.
- III: Question: What page size should be used by default?
  - Status: answered.
  - Answer: Do not pass a page size for the default option. The backend default `limit` is 10. The UI can expose a select for default, 50, and 100.
  - Context: List endpoints accept optional `limit`; examples return `limit: 10`.
- IV: Question: Should the existing provider-specific modals remain accessible anywhere after replacing `Crear guía`?
  - Status: answered.
  - Answer: Yes. To maintain retrocompatibility and avoid user outage from the new feature, add a pre-select screen as the first step so users can choose the new DB create flow or the legacy provider flow.
  - Context: Current quote flow branches into MN, GE, TONE, and Pkk external-provider modals; Guides DB create uses a unified payload.

Authorization:

- I: Question: Is admin role still determined only by `userInfo.data.user.role.includes('admin')` on the frontend?
  - Status: answered.
  - Answer: Yes for frontend gating. The role comes from the backend login response, is saved in the frontend `user-info` httpOnly cookie, and is read back into `userInfo.data.user.role`; `Aside` currently uses `role.includes('admin')`.
  - Context: `src/app/api/route.ts` saves backend `LoginData` via `saveUserInfo(userData)`, and `src/shared/lib/auth.lib.ts` reads it with `getUserInfo()`.
- II: Question: What happens if an admin chooses scope `own` in All Guides DB: should it match My Guides or include deleted records?
  - Status: answered.
  - Answer: It returns the guides owned by that admin user and does not show other users' guides.
  - Context: Admin endpoint supports `scope=all|own`; admins can see soft-deleted records for auditing, while regular `GET /guides/db` hides soft-deleted guides.
- III: Question: Which frontend roles can see `Ver mis guias`?
  - Status: answered.
  - Answer: Both role values can see `Ver mis guias`: `user` and `admin`.
  - Context: Verified in code: `src/shared/types/global.types.ts` defines `UserRoles = 'user' | 'admin'`; `src/shared/types/login.types.ts` stores `role: UserRoles[]`; admin-only UI checks `role.includes('admin')`.

## Assumptions

- New endpoints are served by the same backend base URI in `BACKEND_URI`.
- The frontend should add new BFF route handlers rather than calling backend endpoints directly from client components.
- The existing quote `source` maps exactly to Guides DB `provider`.
- The existing quote `id` maps exactly to Guides DB `quoteId`.
- Existing saved address aliases should be reused for origin/destination selection.
- Existing SAT product search should be reused instead of adding a new search dependency.
- Existing `Order` screen remains the home for guide viewing.
- Admin-only source visibility uses the existing role array on `LoginData`.
- Retry failed guide creation is explicitly future work and not included.

## Non-Obvious Findings

- Current `Crear guía` is split into four provider-specific external flows; the DB create payload is unified and can probably replace this branching for the requested feature.
- `QuoteForm` already saves package dimensions after quoting, but only GE/PKK guide modals currently receive those dimensions.
- Existing MN flow already has the closest parts for the DB create form: saved address selection, temporary address option, SAT lookup, content, value, and quantity.
- Existing guide result UI cannot directly represent DB `status: failed` because mutation success is not the same as provider creation success.
- Existing guide list IDs and cards assume external tracking numbers; DB failed records may only have `kraftId`.
- Admin role detection already exists in `Aside`, so admin-only source visibility should reuse the same role signal.
