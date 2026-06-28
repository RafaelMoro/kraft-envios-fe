# Create Guides DB From Quote Research

## Story Definition

### Story Title

Create Guides DB from a selected quote.

### Story Description

Users can currently create external-provider guides from a selected quote through provider-specific flows. This story adds a DB-backed guide creation path that saves the guide in Kraft's database and attempts provider guide creation, while preserving the legacy provider-specific flow to avoid user outage.

The selected quote determines the `provider` sent to the backend. For example, selecting a TONE quote sends `provider: 'TONE'`.

### Acceptance Criteria

1. A user can select exactly one quote and choose between the new Guides DB flow and the legacy provider flow from the existing `Crear guía` action.
2. The new Guides DB flow sends `provider`, `quoteId`, `parcel`, `origin`, `destination`, and `notifyMe` to a new BFF route that proxies `POST /guides/db/create`.
3. `provider` is derived from the selected quote source and must be one of `GE`, `TONE`, `Pkk`, or `Mn`.
4. Parcel dimensions are sent as numbers from the quote request; `content` and `satProductId` are required, while `value` and `quantity` are optional and only included when filled.
5. The result UI treats HTTP 201 as DB creation success, then uses `data.status` to distinguish provider success (`created`) from provider failure (`failed`).

### Out Of Scope

- My Guides DB list.
- Admin All Guides DB list.
- Deleting Guides DB records.
- Retrying failed provider creation.
- Adding country selection UI; use `MX` for now.
- Normalizing all existing guide BFF route response shapes.

## Technical Research

### Affected Areas

Routes/pages:

- `src/app/dashboard/page.tsx` reads auth/user cookies and renders `Dashboard` client-side.
- `src/features/Dashboard/Dashboard.tsx` renders `QuotesSubscreen` for the quote screen.

API route handlers:

- Add a new BFF route at `src/app/api/guides-db/route.ts` for Guides DB create.
- The backend endpoint is `POST /guides/db/create` through `BACKEND_URI`.
- Follow existing route-handler proxy style: `getAccessToken()`, missing token guard, `Authorization: Bearer <token>`, `NextResponse.json`.

Feature UI:

- `src/features/Dashboard/subscreens/QuotesSubscreen.tsx` owns selected quotes and currently opens provider-specific guide modals.
- Current provider-specific modals are `CreateGuideModalMn`, `CreateGuideModalTone`, `CreateGuidePkk`, and `CreateGuideGE`.
- Story 1 should add a first-step pre-select UI after `Crear guía` so users can choose the new DB create flow or the legacy provider flow.
- `src/features/Guides/Mn/CreateGuideModalMn.tsx` is the closest existing flow to reuse conceptually because it already handles saved addresses, temporary addresses, SAT product, content, value, and quantity.
- `src/features/Guides/Mn/AddAddressMn.tsx` maps saved address aliases into guide payload fields.
- `src/features/Guides/Mn/ParcelInfoForm.tsx` handles content, value, quantity, and SAT selection validation.
- `src/features/Guides/Mn/ProductSatDropdown.tsx` already provides SAT product search.
- `src/features/Guides/ResultGuideScreen.tsx` cannot be reused as-is without adapting semantics because mutation success is not the same as provider creation success for Guides DB.
- Add DB-specific feature code under `src/features/Guides-DB` to keep it separate from the current provider-specific guide flows.

Shared code:

- `src/shared/types/quotes.types.ts` defines `QUOTE_SOURCES = ['GE', 'TONE', 'Pkk', 'Mn']` and `ProviderSource`.
- `src/shared/types/guides.types.ts` contains current provider payloads, response types, SAT types, and form schemas.
- `src/shared/constants/guides.constants.ts` contains current guide endpoints and initial form states.
- `src/shared/utils/guides.utils.ts` contains current create callbacks, address normalization helpers, SAT lookup, and guide utilities.
- `src/shared/hooks/useGetAddress.tsx` fetches saved addresses through `getAddressesCb`.
- `src/shared/types/addresses.types.ts` defines saved address shape.

Tests:

- `__tests__/feature/Quotes/QuotesSubcreen.test.tsx` covers quote flow and uses `QueryProviderWrapper` plus `AppRouterContextProviderMock`.
- `__tests__/feature/Guides/Mn/CreateGuideModalMn.test.tsx` covers modal rendering patterns with `QueryClientProvider`.
- `__tests__/feature/Guides/Mn/ConfirmGuideDataMn.test.tsx` and related guide tests cover current MN confirmation/result behavior.
- New focused tests should live near `__tests__/feature/Guides/*` or `__tests__/feature/Quotes/*`, depending on whether the behavior is quote entry or modal behavior.

### Existing Flow Summary

Quote selection:

- `QuotesSubscreen` stores `selectedQuotes` in local state.
- `handleClickCreateGuide` validates that exactly one quote is selected.
- `handleCreateGuideQuoteCard` sets one selected quote from a `QuoteCard` action.
- Both paths currently branch by `selectedQuotes[0].source` and open one provider-specific modal.

Package dimensions:

- `QuoteForm` calls `updatePackageDimensions()` with stringified `length`, `height`, `width`, and `weight` before fetching quotes.
- `QuotesSubscreen` stores those dimensions in `packageDimensions.current`.
- Current GE and PKK create components receive `packageDimensions`; MN and TONE do not.
- Guides DB create must send dimensions as numbers, so the flow needs to convert the stored quote dimensions before payload submission.

Saved addresses:

- `SelectAddressDropdown` loads saved addresses through `useGetAddress()`.
- Saved `Address` fields include `addressName`, `externalNumber`, `neighborhood`, `city[]`, `town[]`, `state`, `zipcode`, `alias`, and `reference`.
- Guides DB payload expects `street1`, `external_number`, scalar `city`, scalar `town`, `zipcode`, `country`, and contact fields.
- `addressName` maps to `street1`, matching current guide flow.
- Use `country: 'MX'`; do not add country UI now.

SAT product:

- Existing MN and GE guide flows send `selectedProduct.code` as `satProductId`.
- Guides DB should use the same value.
- Current SAT formatted option shape is `{ code, description }`.

Legacy flow preservation:

- To maintain retrocompatibility, do not remove provider-specific modal access.
- Add a pre-select step before creation so the user can choose new Guides DB create or legacy provider create.
- Legacy provider path can keep the current provider-specific branching.

### Backend Contract

Endpoint:

- `POST /guides/db/create`

Payload:

- `provider`: `GE | TONE | Pkk | Mn`, derived from selected quote source.
- `quoteId`: selected quote ID.
- `parcel.length`: number.
- `parcel.width`: number.
- `parcel.height`: number.
- `parcel.weight`: number.
- `parcel.content`: string.
- `parcel.satProductId`: string, using `selectedProduct.code`.
- `parcel.value`: optional number, only attach when filled.
- `parcel.quantity`: optional number, only attach when filled.
- `origin` and `destination`: `alias`, `name`, `lastName`, `phone`, `email`, `company`, `street1`, `external_number`, `neighborhood`, `city`, `town`, `state`, `zipcode`, `country`, `reference`.
- `notifyMe`: boolean, always accepted, default `false`.

Required address/contact values:

- `email`, `company`, and `reference` are required values.
- Current defaults may still be useful if product allows defaulting, but the requirement says these are required.

Response:

- Backend returns HTTP 201 even when external provider creation fails.
- Envelope uses singular `message`: `{ version, message, error, data }`.
- `data.status` is `created | failed`.
- `data.kraftId` is the app-owned guide ID.
- `data.provider` is the provider source.
- `data.failureInfo` is `null` on successful provider creation.
- `data.failureInfo.errorCode` and `data.failureInfo.errorDetails` drive failed-provider user messaging.

Story 1 error codes likely relevant to create result messaging:

- `GDE-AUTH-001`: user email missing or not found.
- `GDE-BDN-001`: general database error during guide creation.
- `GDE-BDN-008`: `kraftId` counter update/creation fails.
- `GDE-BDN-009`: generic/unknown backend error.
- `GDE-PVR-001`: default provider error.
- `GDE-PVR-002`: empty or invalid provider guide response.
- `GDE-PVR-003`: provider unauthorized.
- `GDE-PVR-004`: provider 5xx server error.
- `GDE-PVR-005`: provider validation/fields error.
- `GDE-PVR-006`: quote ID expired.
- `GDE-NET-001`: DNS/network error.
- `GDE-TMOT-001`: timeout error.
- `GDE-RLIM-003`: provider rate limit.
- `GDE-BUS-007`: invalid provider.

### UI Behavior Research

Entry point:

- Keep the existing `Crear guía` action in `QuotesSubscreen`.
- Preserve current validation for zero selected quotes and more than one selected quote.
- After one quote is selected, open a pre-select UI instead of directly opening a provider-specific modal.

Pre-select UI:

- Minimal options: new Guides DB flow and legacy provider flow.
- The legacy option should route to the current provider-specific modal for the selected quote source.
- The new option should route to the Guides DB modal/form flow.
- Use `Crear guía en Kraft` for the new Guides DB flow.
- Use `Crear guía externa` for the legacy provider flow.

Guides DB modal/form:

- A four-step flow can follow the existing guide modal pattern: origin, destination, parcel, confirm/result.
- The origin/destination steps can reuse the saved-address mental model and temporary-address option.
- Parcel step should include SAT product/content selection from the UI, optional value, optional quantity, and quote dimensions from the selected quote process.
- Show `width`, `height`, `length`, and `weight` as disabled inputs because they come from the quote request used to obtain the selected quote.
- Show origin and destination zip codes as disabled inputs for the same reason: they come from the quote request used to obtain the selected quote.
- Add helper copy near the disabled quote-derived fields: this information cannot be modified here; the user must quote again to change it because the selected quote is based on those values.
- Include `notifyMe`, defaulted to `false`.
- Confirm step should show enough data to verify origin, destination, parcel, provider, and quote before submit.

Result behavior:

- HTTP 201 means DB guide record was created.
- If `data.status === 'created'`, show created/success state and label/download link when available.
- If `data.status === 'failed'`, show saved-but-provider-failed state with a friendly message mapped from `failureInfo.errorCode`.
- Do not show retry UI in Story 1.

Friendly failed messages:

- Use one concise Spanish copy for known provider/create failure codes: `La guía se guardó en Kraft, pero el proveedor no pudo crearla. Intenta más tarde o contacta a soporte.`
- Use a generic fallback for unknown codes if needed.
- Keep `failureInfo.errorDetails` available for debugging or future display, but do not expose raw JSON as primary user copy.

### Existing Patterns To Follow

- Keep DB-specific guide UI under `src/features/Guides-DB`; only touch `src/features/Dashboard/subscreens` where the quote entry point lives.
- Keep shared DTOs/constants/callbacks under `src/shared/{types,constants,utils}`.
- Use `react-hook-form` and `yup` for forms, matching existing guide forms.
- Use TanStack Query `useMutation` for create.
- Keep BFF route behavior consistent with existing guide route handlers.
- Use Flowbite React components already installed.
- Do not add new dependencies.

### Testing Rules To Follow

Use `.github/copilot-instructions.md` rules:

- Use `userEvent`, not `fireEvent`.
- Do not mock internal components unless necessary.
- Mock network requests and browser APIs only as needed.
- Use relative import paths for `jest.mock()` hook mocks.
- Do not use `document.querySelector()` or `document.getElementById()` in new tests.
- Do not assert styling/classes unless critical.
- Preserve skipped tests.
- Mock response shapes must match real implementation shapes.

Focused test candidates:

- `QuotesSubscreen`: selecting one quote and clicking `Crear guía` opens the pre-select UI.
- `QuotesSubscreen`: zero or multiple selected quotes still show existing validation errors.
- Pre-select UI: legacy option opens the same provider-specific flow for the selected provider.
- Guides DB modal: submit payload derives `provider` from quote source and `quoteId` from quote ID.
- Guides DB modal: dimensions are converted to numbers.
- Guides DB modal: optional `value`/`quantity` are omitted when empty and included when filled.
- Result UI: `status: created` and `status: failed` render distinct user-visible states.
- Result UI: `failureInfo.errorCode` maps to friendly copy with fallback for unknown code.

### Edge Cases And Constraints

- Selected quote is required and must be exactly one.
- Package dimensions should come from the completed quote request. If they are missing, block Guides DB creation with an error instead of allowing manual entry.
- Stored `PackageDimensions` are strings; create payload requires numbers.
- SAT product must use `selectedProduct.code`.
- `value` and `quantity` are optional but should remain numeric if supplied.
- `email`, `company`, and `reference` are required.
- `notifyMe` defaults to `false`.
- Use `country: 'MX'` without UI.
- HTTP 201 with `status: failed` is not a transport error.
- Backend non-2xx errors still need existing BFF error fallback behavior.
- Legacy provider flow should remain accessible.

## Open Questions

Backend contract:

- I: Question: What is the exact BFF route path to expose for `POST /guides/db/create`?
  - Status: answered.
  - Answer: Use `/api/guides-db`, implemented by `src/app/api/guides-db/route.ts`; the route's `POST` method proxies backend `POST /guides/db/create`.
  - Context: This keeps the new DB guide API separate from current provider-specific guide routes.

UI/product decisions:

- I: Question: Which final pre-select button labels should be used for the new and legacy create flows?
  - Status: answered.
  - Answer: Use `Crear guía en Kraft` for the new Guides DB flow and `Crear guía externa` for the legacy provider flow.
  - Context: The requirement is to preserve both paths with clear user-facing copy.
- II: Question: Should missing package dimensions block create or allow manual entry?
  - Status: answered.
  - Answer: Do not allow manual entry. `width`, `height`, `weight`, and `length` come from the get-quote process and are shown disabled. If the user wants to change them, they must quote again.
  - Context: Quote dimensions are part of the data used to calculate the selected quote.

Error copy:

- I: Question: What friendly Spanish message should each create-relevant error code show?
  - Status: answered.
  - Answer: Use one message for known provider/create failures: `La guía se guardó en Kraft, pero el proveedor no pudo crearla. Intenta más tarde o contacta a soporte.`
  - Context: Backend error codes are known, but Story 1 does not need per-code copy.

## Assumptions

- `.opencode/command/*.md` remains the command-instruction source of truth; `.github/prompts/*` are synced copies.
- Story 1 can proceed with the current backend create contract.
- The new Guides DB create path should be added without removing the legacy provider create path.
- Selected quote source is trusted as the provider value.
- Quote dimensions are available from `packageDimensions.current` after quotes are fetched.
- Existing saved address selection and SAT product search should be reused where practical.
- The implementation can add new DB-specific types rather than forcing DB responses into legacy provider guide types.

## Non-Obvious Findings

- Existing MN flow is closest to the DB form needs, but it does not include quote dimensions in the parcel payload.
- Existing GE and PKK flows already receive quote dimensions from `QuotesSubscreen`; MN and TONE do not.
- Existing `ResultGuideScreen` treats mutation success as guide success, which conflicts with Guides DB `status: failed` records.
- Existing provider create flows should remain available behind the pre-select step for retrocompatibility.
- Provider failure is domain state in a created DB record, not necessarily an HTTP error.
