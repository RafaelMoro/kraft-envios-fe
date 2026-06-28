# Create Guides DB From Quote Implementation Plan

## Header

- Story name: Create Guides DB from a selected quote.
- Source research doc: `ai-research/create-guides-db-from-quote.md`
- Sign-off status: Sign-offed in the `/plan` request.
- Sign-off date: 2026-06-28.
- Planning date: 2026-06-28.

## Assumptions

- Backend contract from the research document is accepted for Story 1.
- New BFF path is `/api/guides-db`, implemented by `src/app/api/guides-db/route.ts`.
- Backend upstream path is `POST ${BACKEND_URI}/guides/db/create`.
- Selected quote `source` is trusted and already typed as `ProviderSource` from `QUOTE_SOURCES`.
- Quote dimensions are available from `packageDimensions.current` after quote fetch; if absent, block Guides DB creation.
- Existing saved address selection and SAT product search should be reused where practical, but DB-specific UI lives under `src/features/Guides-DB`.
- No new dependencies.

## Acceptance Criteria

1. A user can select exactly one quote and choose between the new Guides DB flow and the legacy provider flow from the existing `Crear guía` action.
2. The new Guides DB flow sends `provider`, `quoteId`, `parcel`, `origin`, `destination`, and `notifyMe` to a new BFF route that proxies `POST /guides/db/create`.
3. `provider` is derived from the selected quote source and must be one of `GE`, `TONE`, `Pkk`, or `Mn`.
4. Parcel dimensions are sent as numbers from the quote request; `content` and `satProductId` are required, while `value` and `quantity` are optional and only included when filled.
5. The result UI treats HTTP 201 as DB creation success, then uses `data.status` to distinguish provider success (`created`) from provider failure (`failed`).

## Affected Files

### `src/app/api/**`

- `src/app/api/guides-db/route.ts` - create new BFF route for Guides DB creation.

### `src/features/Dashboard/**`

- `src/features/Dashboard/subscreens/QuotesSubscreen.tsx` - route existing `Crear guía` action into a pre-select UI and preserve legacy modal branching.

### `src/features/Guides-DB/**`

- `src/features/Guides-DB/CreateGuideDbModal.tsx` - new DB-backed create flow modal.
- `src/features/Guides-DB/CreateGuideDbFlowSelector.tsx` - new two-option pre-select UI.
- `src/features/Guides-DB/AddAddressGuideDb.tsx` - DB address step using saved or temporary address behavior.
- `src/features/Guides-DB/ParcelInfoGuideDbForm.tsx` - DB parcel step with quote-derived disabled dimensions, SAT, content, optional value/quantity, notifyMe.
- `src/features/Guides-DB/ConfirmGuideDbData.tsx` - confirmation and payload assembly.
- `src/features/Guides-DB/ResultGuideDbScreen.tsx` - DB result semantics for `created` vs `failed`.

### `src/shared/**`

- `src/shared/types/guides.types.ts` - add Guides DB payload, response, form-value, and failure-info types.
- `src/shared/constants/guides.constants.ts` - add endpoint, initial state, and result/error copy constants.
- `src/shared/utils/guides.utils.ts` - add create callback and minimal DB payload helpers.

### `__tests__/**`

- `__tests__/feature/Quotes/QuotesSubcreen.test.tsx` - update quote entry tests for pre-select behavior and preserved validation.
- `__tests__/feature/Guides-DB/CreateGuideDbModal.test.tsx` - new DB modal flow tests.
- `__tests__/feature/Guides-DB/ResultGuideDbScreen.test.tsx` - new result-state tests.
- `__tests__/app/api/guides-db/route.test.ts` or nearest existing API-route test location if route tests already use another convention - new BFF route tests.

## Phase 1 - Shared Contract And BFF Route

### Changes Required

#### `src/shared/types/guides.types.ts`

- Action: Modify.
- Location: near current create-guide payload types and response interfaces.
- Add `CreateGuideDbAddressPayload` with fields `alias`, `name`, `lastName`, `phone`, `email`, `company`, `street1`, `external_number`, `neighborhood`, `city`, `town`, `state`, `zipcode`, `country`, `reference`.
- Add `CreateGuideDbParcelPayload` with required numeric `length`, `width`, `height`, `weight`, required `content`, required `satProductId`, optional numeric `value`, optional numeric `quantity`.
- Add `CreateGuideDbPayload` with `provider: ProviderSource`, `quoteId: string`, `origin`, `destination`, `parcel`, `notifyMe: boolean`.
- Add `CreateGuideDbResponse` matching `{ version, message, error, data }`, where `data.status` is `created | failed`, `data.kraftId` is string, `data.provider` is `ProviderSource`, and `data.failureInfo` is nullable.
- Add `CreateGuideDbFormValues` only for fields the DB modal actually stores across steps.
- Edge cases: do not force DB response into `CreateMnGuideResponse`; DB provider failure is domain data, not mutation failure.

#### `src/shared/constants/guides.constants.ts`

- Action: Modify.
- Location: near guide endpoints and initial form states.
- Add `CREATE_GUIDE_DB_ENDPOINT = '/api/guides-db'`.
- Add DB initial state with empty origin/destination, empty `content`, empty optional numeric fields as `''` or `undefined`, `notifyMe: false`.
- Add DB known failure copy: `La guía se guardó en Kraft, pero el proveedor no pudo crearla. Intenta más tarde o contacta a soporte.`
- Add generic fallback copy for unknown DB failure codes.
- Rationale: keep constants shared and avoid hard-coded endpoint/copy in components.

#### `src/shared/utils/guides.utils.ts`

- Action: Modify.
- Location: callback region near `createGuideMnCb`.
- Add `createGuideDbCb(payload: CreateGuideDbPayload): Promise<CreateGuideDbResponse['data']>` using `axios.post(CREATE_GUIDE_DB_ENDPOINT, payload)` and returning `res.data.data`.
- Add one small helper only if it avoids repeated unsafe conversion in multiple components: `toGuideDbParcelPayload(packageDimensions, parcelInfo, selectedProduct)`.
- Helper behavior: convert `length`, `width`, `height`, `weight` with `Number(...)`; include `value` and `quantity` only when the form supplied a non-empty value.
- Edge cases: if any converted quote dimension is missing or not finite, surface a user-facing block before mutation instead of submitting.
- Ponytail note: do not add a generic mapper framework; one local helper is enough if needed.

#### `src/app/api/guides-db/route.ts`

- Action: Create.
- Code structure:
  - Export `async function POST(request: NextRequest)`.
  - Read `const accessToken = await getAccessToken()`.
  - If missing, return `NextResponse.json({ message: 'missing access token' }, { status: 400 })`.
  - Read `const payload: CreateGuideDbPayload = await request.json()`.
  - Post to `${process.env.BACKEND_URI}/guides/db/create` with `Authorization: Bearer ${accessToken}`.
  - Return `NextResponse.json(res.data, { status: 201 })` for upstream success.
  - On axios error, return existing route style with `{ message }`, status `400`.
- Edge cases: do not reinterpret `data.status === 'failed'` as HTTP error; backend still returns 201 for saved DB record.

### Success Criteria

- Automated: `pnpm test -- __tests__/app/api/guides-db/route.test.ts`
- Automated: `pnpm exec tsc --noEmit`
- Manual: none for this phase.

### Test Coverage

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `src/app/api/guides-db/route.ts` | success with access token and 201, missing access token returns 400, upstream axios error returns 400 message, `status: failed` response still returns 201 | Existing route style from `src/app/api/guides/mn/route.ts` and `src/app/api/guides/ge/route.ts`; cookie/header mock pattern from `__tests__/home.test.tsx` if needed |
| `src/shared/utils/guides.utils.ts` | `createGuideDbCb` posts to `/api/guides-db` and returns `data`; optional parcel fields omitted when empty if helper is added | Existing callback tests or direct axios mock pattern from quote tests |

## Phase 2 - Quote Entry Pre-Select And Legacy Branch Preservation

### Changes Required

#### `src/features/Guides-DB/CreateGuideDbFlowSelector.tsx`

- Action: Create.
- Component signature:
  - `open: boolean`
  - `toggleModal: () => void`
  - `onCreateDb: () => void`
  - `onCreateLegacy: () => void`
- Render a Flowbite modal or small modal-like component with two buttons.
- Button labels: `Crear guía en Kraft` and `Crear guía externa`.
- Close/cancel should only close selector, not reset selected quote unless current quote flow does that explicitly.
- Rationale: a tiny component keeps `QuotesSubscreen` from growing a second modal body.

#### `src/features/Dashboard/subscreens/QuotesSubscreen.tsx`

- Action: Modify.
- Location: state near existing create-guide modal state, `handleClickCreateGuide`, `handleCreateGuideQuoteCard`, modal render tail.
- Add `openCreateGuideSelector` and `openCreateGuideDb` state.
- Extract existing provider-specific branching into a local `openLegacyGuideFlow(quote: QuoteUI)` function.
- Change `handleClickCreateGuide`:
  - Preserve zero selected quote error unchanged.
  - Preserve multiple selected quotes error unchanged.
  - With exactly one quote, open selector instead of provider modal.
- Change `handleCreateGuideQuoteCard(quote)`:
  - Set selected quote to `[quote]`.
  - Open selector instead of provider modal.
- Selector callbacks:
  - DB option closes selector and opens `CreateGuideDbModal`.
  - Legacy option closes selector and calls `openLegacyGuideFlow(selectedQuotes[0])`.
- Render `CreateGuideDbFlowSelector` and `CreateGuideDbModal` near current guide modals.
- Pass `selectedQuotes`, `packageDimensions.current`, `toggleModal`, and `resetSelectedQuotes` to DB modal.
- Edge cases: keep provider-specific modals untouched and keep GE/PKK package dimension props as-is.

### Success Criteria

- Automated: `pnpm test -- __tests__/feature/Quotes/QuotesSubcreen.test.tsx`
- Manual:
  - Generate quotes on desktop, select no quotes, click `Crear guía`, verify existing no-selection error.
  - Select two quotes, click `Crear guía`, verify existing multiple-selection error.
  - Select one quote, click `Crear guía`, verify `Crear guía en Kraft` and `Crear guía externa` options.
  - Choose legacy option for GE/TONE/Pkk/Mn quotes and verify the same provider-specific modal opens.
  - Repeat on mobile/tablet viewport if dashboard action layout differs.

### Test Coverage

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `__tests__/feature/Quotes/QuotesSubcreen.test.tsx` | existing zero/multiple selected validation, one selected quote opens pre-select, quote-card create action opens pre-select, legacy option opens provider modal for selected source | Existing wrapper with `QueryProviderWrapper`, `AppRouterContextProviderMock`, `mockMatchMedia`; use `userEvent` and `screen` |
| `src/features/Guides-DB/CreateGuideDbFlowSelector.tsx` | labels and callback behavior through integration in `QuotesSubscreen` unless standalone coverage is simpler | Do not mock internal components unless unavoidable |

## Phase 3 - Guides DB Modal Form Flow

### Changes Required

#### `src/features/Guides-DB/CreateGuideDbModal.tsx`

- Action: Create.
- Component signature:
  - `open: boolean`
  - `selectedQuotes: QuoteUI[]`
  - `packageDimensions: PackageDimensions | null`
  - `toggleModal: () => void`
  - `resetSelectedQuotes: () => void`
- Use `useSteps({ firstStep: 1 })`, `CREATE_GUIDE_STEPS`, and `Stepper`, matching existing guide modal pattern.
- Keep step shape: origin, destination, parcel, confirm, result.
- Store form state in `useRef<CreateGuideDbFormValues>` like existing guide modal.
- Use `useMutation<CreateGuideDbResponse['data'], GeneralApiError, CreateGuideDbPayload>` with `createGuideDbCb`.
- On mutation success and error, advance to result step; result step distinguishes transport error vs saved-provider-failed data.
- Close behavior resets aliases, selected product, form data, steps, selected quotes, and modal state.
- Edge cases: if selected quote or package dimensions are missing, show blocking error in the modal and do not allow submit.

#### `src/features/Guides-DB/AddAddressGuideDb.tsx`

- Action: Create.
- Code structure:
  - Reuse `AddAddressCreateGuide`, `PersonalDataForm`, `SelectAddressDropdown`, `AddTempAddressMn`-style temporary address behavior where practical.
  - Validate personal/contact fields with a DB-specific schema or minimal extension where `email`, `company`, and `reference` are required for DB.
  - Map saved `Address` to DB address fields: `addressName -> street1`, `externalNumber -> external_number`, first/scalar selected city and town, `country: 'MX'` later in payload.
  - Preserve saved-address alias state through `useSaveAlias` or DB-specific local state if MN alias shape is too narrow.
- Edge cases: `city[]` and `town[]` must become scalar strings; zip code shown disabled because it comes from quote request/address selection.
- Rationale: DB payload needs both city and town, so do not reuse MN address payload blindly.

#### `src/features/Guides-DB/ParcelInfoGuideDbForm.tsx`

- Action: Create.
- Code structure:
  - Reuse `ProductSatDropdown` for SAT search.
  - Required fields: selected SAT product and `content`.
  - Optional fields: `value`, `quantity`; keep empty as omitted values.
  - Include `notifyMe` checkbox defaulting to `false`.
  - Display disabled `length`, `width`, `height`, `weight` from `packageDimensions`.
  - Add helper copy: quote-derived fields cannot be changed here; quote again to modify them.
- Edge cases: block if any quote dimension is missing or converts to a non-finite number.

#### `src/features/Guides-DB/ConfirmGuideDbData.tsx`

- Action: Create.
- Component props include form data, selected quote, package dimensions, selected SAT product, pending state, `goPrev`, and `createGuide`.
- `handleSubmit` builds `CreateGuideDbPayload`:
  - `provider = selectedQuote.source`.
  - `quoteId = selectedQuote.id`.
  - `origin` and `destination` include `country: 'MX'`.
  - `parcel` includes numeric dimensions, `content`, `satProductId`.
  - Add `value` and `quantity` only when filled.
  - `notifyMe` from form state.
- Confirm UI should show origin, destination, parcel, provider, and quote ID/service enough for user verification.
- Edge cases: do not submit if selected quote is absent or SAT product missing.

### Success Criteria

- Automated: `pnpm test -- __tests__/feature/Guides-DB/CreateGuideDbModal.test.tsx`
- Automated: `pnpm exec tsc --noEmit`
- Manual:
  - From one selected quote, choose `Crear guía en Kraft`.
  - Complete origin and destination with saved addresses and temporary address path if available.
  - Verify disabled quote dimensions are visible and match quote request values.
  - Verify SAT product, content, optional value/quantity, and notifyMe can be entered.
  - Confirm screen shows provider, quote, origin, destination, and parcel before submit.

### Test Coverage

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `__tests__/feature/Guides-DB/CreateGuideDbModal.test.tsx` | initial render, missing package dimensions blocks DB create, payload derives provider and quoteId, dimensions converted to numbers, `value`/`quantity` omitted when empty and included when filled, `notifyMe` defaults false and submits true when checked | Existing modal tests in `__tests__/feature/Guides/Mn/CreateGuideModalMn.test.tsx`; wrap QueryClient; mock network/API only |
| `src/features/Guides-DB/AddAddressGuideDb.tsx` | saved address maps aliases/address fields into DB shape, required email/company/reference validation | Existing address tests and `AddAddressMn` test patterns |
| `src/features/Guides-DB/ParcelInfoGuideDbForm.tsx` | SAT product required, content required, disabled dimensions shown, optional numeric fields behavior | Existing `ParcelInfoFormMn` and `ProductSatDropdown` tests |

## Phase 4 - Guides DB Result Semantics

### Changes Required

#### `src/features/Guides-DB/ResultGuideDbScreen.tsx`

- Action: Create.
- Component signature:
  - `result: CreateGuideDbResponse['data'] | undefined`
  - `isSuccess: boolean`
  - `isError: boolean`
  - `errorMessage?: string`
  - `closeModal: () => void`
- Behavior:
  - Transport/mutation error: show generic create error and finish button.
  - Success with `result.status === 'created'`: show DB saved/provider-created success state, including `kraftId`, provider, and label/download link if response data includes one.
  - Success with `result.status === 'failed'`: show saved-but-provider-failed state and friendly Spanish copy for known failure codes.
  - Unknown failure code: show generic fallback, not raw JSON.
  - No retry UI.
- Edge cases: HTTP 201 with `status: failed` must render as saved DB record, not as mutation error.

#### `src/features/Guides-DB/CreateGuideDbModal.tsx`

- Action: Modify from Phase 3 if needed.
- Location: result step rendering.
- Render `ResultGuideDbScreen` instead of shared `ResultGuideScreen`.
- Pass mutation `data`, `isSuccess`, `isError`, and error message.

### Success Criteria

- Automated: `pnpm test -- __tests__/feature/Guides-DB/ResultGuideDbScreen.test.tsx`
- Automated: `pnpm test -- __tests__/feature/Guides-DB/CreateGuideDbModal.test.tsx`
- Manual:
  - Mock or trigger backend HTTP 201 with `data.status = 'created'`, verify success state.
  - Mock or trigger backend HTTP 201 with `data.status = 'failed'`, verify saved-but-provider-failed copy.
  - Verify there is no retry button.

### Test Coverage

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `__tests__/feature/Guides-DB/ResultGuideDbScreen.test.tsx` | `created` success state, `failed` saved-provider-failed state, known failure code friendly copy, unknown failure fallback, transport error state, no retry UI | Existing `__tests__/feature/Guides/ResultGuideScreen.test.tsx`; use `screen`, not CSS assertions |

## Phase 5 - Focused Integration Verification

### Changes Required

#### `__tests__/feature/Quotes/QuotesSubcreen.test.tsx`

- Action: Modify.
- Location: action bar tests near current `Crear guía` assertions.
- Add or adjust tests to assert the pre-select opens after exactly one selected quote.
- Preserve skipped tests if any are present.
- Use `userEvent` for all interactions.
- Do not mock internal feature/shared components; mock axios/network and unavailable browser APIs only.

#### `__tests__/feature/Guides-DB/CreateGuideDbModal.test.tsx`

- Action: Create.
- Keep mocks typed and matching real function return shapes.
- If mocking hooks with `jest.mock()`, use relative imports, not `@/` aliases.
- Use QueryClient wrapper if mutation/query hooks are rendered.

#### `__tests__/feature/Guides-DB/ResultGuideDbScreen.test.tsx`

- Action: Create.
- Test visible behavior only; do not assert CSS classes.

#### `__tests__/app/api/guides-db/route.test.ts`

- Action: Create if route-handler tests are practical in current Jest setup.
- If the repo has no stable API route test convention, keep route behavior covered by types and focused manual check, then run full `pnpm exec tsc --noEmit`.
- Rationale: avoid inventing a heavy test harness for one route if existing tests do not support it.

### Success Criteria

- Automated: `pnpm test -- __tests__/feature/Quotes/QuotesSubcreen.test.tsx`
- Automated: `pnpm test -- __tests__/feature/Guides-DB/CreateGuideDbModal.test.tsx`
- Automated: `pnpm test -- __tests__/feature/Guides-DB/ResultGuideDbScreen.test.tsx`
- Automated: `pnpm exec tsc --noEmit`
- Automated: `pnpm lint`
- Automated: `pnpm build`
- Manual:
  - End-to-end in dev: quote, select one quote, choose DB flow, complete form, confirm payload path, verify result states.
  - Legacy flow smoke: quote, select one quote, choose external flow, verify provider-specific modal still opens.
  - Mobile/tablet smoke: repeat selector and DB modal basic navigation.

### Test Coverage

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `__tests__/feature/Quotes/QuotesSubcreen.test.tsx` | action entry validation, selector visibility, DB vs legacy branching | Existing quote tests; Testing Library + `userEvent`; `mockMatchMedia` |
| `__tests__/feature/Guides-DB/CreateGuideDbModal.test.tsx` | modal step flow, payload assembly, numeric conversion, optional fields, missing dimensions | Existing Guide MN modal tests; QueryClientProvider |
| `__tests__/feature/Guides-DB/ResultGuideDbScreen.test.tsx` | created/failed/error UI semantics | Existing ResultGuideScreen tests |
| `src/app/api/guides-db/route.ts` | auth guard, upstream proxy, error fallback, 201 `failed` domain state | Existing API route handler shape |

## Cross-Cutting Concerns

- Auth cookies: the new BFF route must use `getAccessToken()` and return the existing missing-token 400 shape.
- API response shape: Guides DB uses singular `message` and `data.status`; do not normalize legacy guide response shapes.
- Provider typing: use existing `ProviderSource`/`QUOTE_SOURCES`; do not add a separate provider enum.
- Quote-derived data: package dimensions come from `packageDimensions.current`; users must quote again to change them.
- Address mapping: saved address arrays for `city`/`town` must become scalar strings; country is hard-coded as `MX`.
- Result semantics: HTTP 201 is DB create success even when provider creation failed.
- Tests: use `userEvent`, avoid internal component mocks, use `screen`, avoid CSS assertions, preserve skipped tests, no file extensions in imports, named exports for mocks.

## Open Questions / Out-of-Scope Items

### Open Questions

- None blocking. Research questions are answered.

### Out Of Scope

- My Guides DB list.
- Admin All Guides DB list.
- Deleting Guides DB records.
- Retrying failed provider creation.
- Country selection UI.
- Normalizing existing guide BFF response shapes.
- Backend changes outside this repository.
- New state libraries, telemetry, logging, caching, or broad guide-flow refactors.

## Decisions Beyond The Research Doc

- Use a tiny `CreateGuideDbFlowSelector` component instead of embedding selector JSX in `QuotesSubscreen`; this keeps the already-large subscreen smaller without adding a generic abstraction.
- Add DB-specific result screen instead of adapting shared `ResultGuideScreen`; existing shared semantics treat mutation success as guide success, which conflicts with DB `status: failed`.
- Add a parcel conversion helper only if used by more than one DB component/test; otherwise keep conversion in `ConfirmGuideDbData` to avoid extra abstraction.
- Prefer focused DB-specific tests under `__tests__/feature/Guides-DB` so legacy provider-guide tests remain stable.

## Repo Context Update

- No `REPO_CONTEXT.md` update needed from planning. Verified facts are already covered there or are story-specific.
