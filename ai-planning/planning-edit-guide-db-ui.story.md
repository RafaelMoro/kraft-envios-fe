# Edit Guides DB UI - Implementation Plan

Source research: `ai-research/edit-guide-db-ui.story.md`

Sign-off: plan requested from completed research on 2026-07-17. The research doc does not embed a separate sign-off date.

Story: Add the full UI flow for editing an existing failed Guides DB record.

## Assumptions

- Scope is limited to editing `origin`, `destination`, and non-dimension `parcel` fields.
- `quote`, `notifyMe`, `length`, `width`, `height`, and `weight` are not user-editable in this story.
- Existing-guide quote/re-quote flow is out of scope and remains a separate story.
- Backend owner/admin rules are enforced by the backend; this UI only surfaces submit errors.
- `GuideDbEditModal` owns the mutation and invalidates `['guides', 'db']` after any successful HTTP response.
- The update response is a result snapshot and must not replace a full `GuideDbRecord` in details state.

## Acceptance Criteria

1. `GuideDbEditModal` is converted from a placeholder shell into a real multi-step edit modal for a selected `GuideDbRecord`, opened from the existing edit button on failed, non-deleted records.
2. The modal lets the user edit `origin`, `destination`, and non-dimension `parcel` data only. `quote`, `notifyMe`, and quote-derived parcel dimensions (`length`, `width`, `height`, `weight`) remain out of the editable surface for this story.
3. The edit flow reuses the existing Guides DB address and parcel form components where practical, with minimal prop additions rather than duplicated forms.
4. Initial form state is prefilled from the selected `GuideDbRecord.origin`, `GuideDbRecord.destination`, and `GuideDbRecord.parcel`.
5. The submit button is disabled until at least one editable field differs from the original guide. When disabled, it shows a Flowbite React `Popover` explaining that the user must change at least one editable field before submitting. If no fields changed, `updateGuideDbCb` is never called.
6. On submit, the modal builds an `UpdateGuideDbPayload` containing only changed top-level objects (`origin`, `destination`, `parcel`), and every included object is complete.
7. On success, the UI invalidates `['guides', 'db']`, closes or advances the modal to a result state, and returns from details to the list when appropriate so the refetched record is visible.
8. If the backend re-attempt returns `status: 'created'`, the user sees a success result. If it returns `status: 'failed'`, the user sees a saved-but-provider-failed result with the new provider error context.
9. Transport/client errors are surfaced through the existing `useNotification` + `Notification` pattern or an in-modal error state consistent with existing Guides DB create semantics.
10. The edit modal works from both `GuideDbCard` and `GuideDbDetails`, on desktop and mobile/tablet dashboard layouts.
11. Tests cover dirty-state gating, payload construction, mutation success/error behavior, and the main modal navigation paths without mocking internal components.

## Affected Files

### `src/app/**`

- No changes. Dashboard already renders the client-only `Order` flow.

### `src/app/api/**`

- No changes. `src/app/api/guides-db/[kraftId]/route.ts` already proxies PATCH.

### `src/features/**`

- `src/features/Dashboard/subscreens/GuideDbEditModal.tsx` - Modify; replace shell with edit flow.
- `src/features/Dashboard/subscreens/Order.tsx` - Modify; reset details/list state after edit success and clear edit guide on close.
- `src/features/Dashboard/subscreens/GuideDbCard.tsx` - No planned change; edit button gating already matches AC.
- `src/features/Dashboard/subscreens/GuideDbDetails.tsx` - No planned change; edit button gating already matches AC.
- `src/features/Guides-DB/AddAddressGuideDb.tsx` - Modify; add edit-prefill support through small props.
- `src/features/Guides-DB/AddTempAddressGuideDb.tsx` - Modify only if button copy or default manual-edit behavior needs a prop.
- `src/features/Guides-DB/ParcelInfoGuideDbForm.tsx` - Modify; add edit-mode behavior, dimension popovers, hide `notifyMe`, allow saved SAT ID.
- `src/features/Guides-DB/ResultGuideDbScreen.tsx` - Modify; accept update result subset and edit-mode copy.
- `src/features/Guides/Mn/ProductSatDropdown.tsx` - No planned change unless tests prove it cannot display the saved SAT ID via existing `searchProductSat` prop.

### `src/shared/**`

- `src/shared/utils/guides.utils.ts` - Modify; add pure edit conversion/dirty payload helpers near existing Guides DB helpers.
- `src/shared/types/guides.types.ts` - Modify only if a shared result subset type is cleaner than a local prop type.
- `src/shared/constants/guides.constants.ts` - Modify; add edit step labels and small user-facing edit messages.
- `src/shared/hooks/useAddAddress.tsx` - Modify; allow address flow to start in temporary/manual mode for edit prefill.

### `__tests__/**`

- `__tests__/feature/Guides-DB/guideDbEditPayload.test.ts` - Create or equivalent focused helper test file.
- `__tests__/feature/Dashboard/GuideDbEditModal.test.tsx` - Create.
- `__tests__/feature/Dashboard/Order.test.tsx` - Modify; add card/details edit-modal open and success-list-return coverage.
- `__tests__/feature/Guides-DB/ParcelInfoGuideDbForm.test.tsx` - Modify; cover edit-mode `notifyMe` hiding and dimension popover copy.
- `__tests__/feature/Guides-DB/ResultGuideDbScreen.test.tsx` - Modify; cover edit-mode result copy and update-result shape.

### Docs And Config

- No config changes. `package.json`, `jest.config.ts`, `tsconfig.json`, `AGENTS.md`, `REPO_CONTEXT.md`, `.github/copilot-instructions.md`, and `DESIGN.md` were read for constraints.
- No `REPO_CONTEXT.md` update planned; planning did not reveal a new broad repo fact beyond existing notes.

## Phase 1 - Pure Payload Helpers

### Changes Required

`src/shared/utils/guides.utils.ts`

Action: Modify near `toGuideDbParcelPayload` and `verifyAndUpdateAddressGuideDb`.

Add the smallest exported helpers needed to prefill and compare edit data. Keep field order explicit so object comparison is stable and payloads stay complete.

```ts
export const guideDbRecordToEditForm = (guide: GuideDbRecord): {
  formData: CreateGuideDbFormValues;
  packageDimensions: PackageDimensions;
  searchProductSat: string;
}

export const toGuideDbAddressPayload = (
  address: CreateGuideAddressFormValuesMn,
): CreateGuideDbAddressPayload

export const buildUpdateGuideDbPayload = (
  originalGuide: GuideDbRecord,
  currentFormData: CreateGuideDbFormValues,
  selectedProduct: SearchProduct | null,
): UpdateGuideDbPayload
```

`guideDbRecordToEditForm` maps `origin`, `destination`, and `parcel` into existing create-flow form shapes. `parcel.value` and `parcel.quantity` become empty strings when absent; dimensions become `PackageDimensions` string values; `searchProductSat` starts as `guide.parcel.satProductId`.

`toGuideDbAddressPayload` should reuse `verifyAndUpdateAddressGuideDb` and add all address payload fields, including `country`. Preserve create semantics for default email/company/reference.

`buildUpdateGuideDbPayload` should normalize current and original values, include only dirty top-level objects, and include complete objects when dirty.

Critical conditions:

- Origin dirty means any normalized origin field differs, then include full `origin`.
- Destination dirty means any normalized destination field differs, then include full `destination`.
- Parcel dirty means any normalized editable parcel field differs, then include full `parcel` including original dimensions.
- `satProductId` comes from `selectedProduct.code` when present, otherwise `originalGuide.parcel.satProductId`.
- Empty optional `value`/`quantity` remain absent, not `0`, unless the user supplied a finite number.

Edge cases:

- `GuideDbRecord.origin.name` may already be a full name while `lastName` is also present because `verifyAndUpdateAddressGuideDb` combines the form values. Tests should pin expected behavior before implementation finalizes name/lastName splitting.
- Original `country` values in tests use both `Mexico` and `MX`; payload should send the existing guide country when available, falling back to `MX` only if blank.

Rationale: AC 4, 5, and 6 are easiest to test with pure helpers and avoid duplicating payload logic inside tests.

`src/shared/types/guides.types.ts`

Action: Modify only if needed near `UpdateGuideDbResponseData`.

Prefer no new exported type. If result prop typing becomes noisy, add a narrow reusable result subset:

```ts
export type GuideDbResultData = Pick<
  CreateGuideDbResponseData,
  'status' | 'kraftId' | 'provider' | 'failureInfo'
>
```

### Success Criteria

Automated:

```bash
pnpm test -- __tests__/feature/Guides-DB/guideDbEditPayload.test.ts
pnpm test -- __tests__/feature/Guides-DB/toGuideDbParcelPayload.test.ts __tests__/feature/Guides-DB/verifyAndUpdateAddressGuideDb.test.ts __tests__/feature/Guides-DB/updateGuideDb.test.ts
```

Manual:

- None for this phase; helpers are not user-visible.

### Test Coverage

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `src/shared/utils/guides.utils.ts` | guide-to-form prefill, address payload completeness, no-change empty payload, parcel-only payload, origin-only payload, destination-only payload, multi-section payload, saved SAT ID fallback | Existing utility tests in `__tests__/feature/Guides-DB/toGuideDbParcelPayload.test.ts`, `verifyAndUpdateAddressGuideDb.test.ts`, and `updateGuideDb.test.ts` |

## Phase 2 - Reuse Existing Forms For Edit Mode

### Changes Required

`src/shared/hooks/useAddAddress.tsx`

Action: Modify `UseAddAddressProps` and initial `useTempAddress` state.

Add one optional prop so edit mode can open the manual address form prefilled with the selected guide.

```ts
interface UseAddAddressProps {
  isDestination: boolean;
  alias: string;
  toggleModal: () => void;
  goPrev: () => void;
  initialUseTempAddress?: boolean;
}
```

`src/features/Guides-DB/AddAddressGuideDb.tsx`

Action: Modify `AddAddressGuideDbProps` and call to `useAddAddress` near lines 21-66.

Add optional props only. Defaults preserve create-flow behavior.

```ts
interface AddAddressGuideDbProps {
  initialUseTempAddress?: boolean;
  nextButtonLabel?: string;
}
```

Pass `initialUseTempAddress` to `useAddAddress`. Use `nextButtonLabel ?? 'Siguiente'` for the submit buttons passed to alias and temp paths.

`src/features/Guides-DB/AddTempAddressGuideDb.tsx`

Action: Modify `AddTempAddressGuideDbProps` near lines 14-22 only if `nextButtonLabel` is threaded from `AddAddressGuideDb`.

```ts
interface AddTempAddressGuideDbProps {
  nextButtonLabel?: string;
}
```

`src/features/Guides-DB/ParcelInfoGuideDbForm.tsx`

Action: Modify props and submit logic near lines 12-71, dimension UI near lines 83-132, and notify checkbox near lines 170-178.

Add edit props with create defaults.

```ts
interface ParcelInfoGuideDbFormProps {
  editMode?: boolean;
  existingSatProductId?: string;
  nextButtonLabel?: string;
}
```

Critical behavior:

- In edit mode, hide the `notifyMe` checkbox and submit `notifyMe: false` in the existing form state shape because update payload ignores it.
- In edit mode, allow submit when `searchProductSat.trim() === existingSatProductId` and `selectedProduct` is null.
- If the user changes the SAT search text away from `existingSatProductId`, require a selected product from the dropdown.
- Keep dimensions disabled in all modes.
- Add Flowbite `Popover` copy around dimension help in edit mode: dimensions come from the quote and require a new quote to change.

Edge cases:

- Do not loosen create-flow SAT validation; create still requires a selected SAT product.
- Do not make dimensions editable in create or edit mode.

Rationale: This phase satisfies AC 2 and 3 without duplicating forms.

`src/shared/constants/guides.constants.ts`

Action: Modify near existing Guides DB labels around line 301.

Add only copy used by the edit UI.

```ts
export const GUIDES_DB_EDIT_STEPS = ['Origen', 'Destino', 'Paquete', 'Confirmar']
export const GUIDES_DB_EDIT_NO_CHANGES_MESSAGE = 'Cambia al menos un campo editable para continuar.'
export const GUIDES_DB_EDIT_DIMENSIONS_POPOVER = 'Las dimensiones vienen de la cotización. Para cambiarlas, genera una nueva cotización.'
```

### Success Criteria

Automated:

```bash
pnpm test -- __tests__/feature/Guides-DB/ParcelInfoGuideDbForm.test.tsx __tests__/feature/Guides-DB/AddAddressGuideDb.test.tsx __tests__/feature/Guides-DB/AddTempAddressGuideDb.test.tsx
```

Manual:

- In the create guide DB modal, parcel dimensions remain disabled and `notifyMe` remains visible.
- In the edit modal once Phase 3 is present, parcel dimensions are disabled with explanatory popover and `notifyMe` is not visible.

### Test Coverage

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `src/features/Guides-DB/ParcelInfoGuideDbForm.tsx` | edit-mode hides `notifyMe`, dimensions stay disabled, popover copy exists, saved SAT ID can pass without selecting a new product, changed SAT text still requires selection | Existing `__tests__/feature/Guides-DB/ParcelInfoGuideDbForm.test.tsx`; use `userEvent` |
| `src/features/Guides-DB/AddAddressGuideDb.tsx` | `initialUseTempAddress` starts manual/temp address form without changing create default | Existing `__tests__/feature/Guides-DB/AddAddressGuideDb.test.tsx` |

## Phase 3 - Replace `GuideDbEditModal` Shell

### Changes Required

`src/features/Dashboard/subscreens/GuideDbEditModal.tsx`

Action: Modify entire component, replacing the placeholder body near lines 13-23.

Prop shape:

```ts
type GuideDbEditModalProps = {
  open: boolean;
  onClose: () => void;
  onUpdated?: () => void;
  guide: GuideDbRecord | null;
}
```

State and refs:

```ts
const { isMobileTablet } = useMediaQuery()
const { step, goNext, goPrev, resetSteps } = useSteps({ firstStep: 1 })
const formData = useRef<CreateGuideDbFormValues>(initialEditFormData)
const packageDimensions = useRef<PackageDimensions | null>(null)
const selectedProduct = useRef<SearchProduct | null>(null)
const [searchProductSat, setSearchProductSat] = useState('')
const [errorProductSat, setErrorProductSat] = useState('')
```

On `open` + `guide` changes, prefill refs/state from `guideDbRecordToEditForm(guide)` and reset to step 1. Avoid prefill during render.

Flow:

- Step 1: origin address via `AddAddressGuideDb`, `initialUseTempAddress`, prefilled `formData.current.originAddress`.
- Step 2: destination address via `AddAddressGuideDb`, `initialUseTempAddress`, prefilled `formData.current.destinationAddress`, exclude origin alias when alias-based data is selected.
- Step 3: parcel via `ParcelInfoGuideDbForm` with `editMode`, `existingSatProductId={guide.parcel.satProductId}`, original dimensions, and `ProductSatDropdown` child.
- Step 4: local confirm section showing changed sections only and an `Editar` submit button.
- Step 5: `ResultGuideDbScreen` with edit-mode copy and update response data.

Mutation:

```ts
const mutation = useMutation<UpdateGuideDbResponse['data'], GeneralApiError, UpdateGuideDbPayload>({
  mutationFn: (payload) => updateGuideDbCb(guide.kraftId, payload),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['guides', 'db'] })
    onUpdated?.()
    goNext()
  },
  onError: () => goNext(),
})
```

The actual implementation must guard `guide` before calling `guide.kraftId`; if no `guide`, render an inline Flowbite `Alert` or `null` body with only close action.

Confirm step behavior:

- Build `payload = buildUpdateGuideDbPayload(guide, formData.current, selectedProduct.current)`.
- Changed sections are `Object.keys(payload)` mapped to user labels `Origen`, `Destino`, `Paquete`.
- If no changed sections, render an inline message and disable submit.
- Wrap the disabled submit control with Flowbite `Popover` using `GUIDES_DB_EDIT_NO_CHANGES_MESSAGE`.
- If submit is disabled, do not call `updateGuideDbCb`.
- If `guide.deletedAt != null`, block submit defensively and show a stale/deleted-guide message.

Result behavior:

- `status: 'created'` shows edit success result.
- `status: 'failed'` shows saved-but-provider-failed result and provider failure context.
- Mutation error shows in-modal error result using `error?.response?.data?.message` when present.

Close/reset behavior:

- `closeModal` resets steps, form refs, selected product, SAT state, and calls `onClose`.
- Do not call `onUpdated` on close; call it only after mutation success.

Edge cases:

- The modal is client-only and should continue using the BFF via `updateGuideDbCb`; do not call `BACKEND_URI` directly.
- `UpdateGuideDbResponse['data']` is not a full `GuideDbRecord`; do not set it into details state.
- Keep modal size at least `3xl` to match create flow and prevent cramped forms.

`src/features/Guides-DB/ResultGuideDbScreen.tsx`

Action: Modify prop type near lines 11-17 and headings/copy branches near lines 40-103.

Add a mode prop with default create behavior.

```ts
interface ResultGuideDbScreenProps {
  mode?: 'create' | 'edit';
  result: GuideDbResultData | undefined;
  isSuccess: boolean;
  isError: boolean;
  errorMessage?: string;
  closeModal: () => void;
}
```

Use mode only for headings and generic transport-error copy. Keep existing create copy unchanged by default.

### Success Criteria

Automated:

```bash
pnpm test -- __tests__/feature/Dashboard/GuideDbEditModal.test.tsx __tests__/feature/Guides-DB/ResultGuideDbScreen.test.tsx
```

Manual:

- Open a failed, non-deleted guide from a card, confirm the modal starts on origin with current guide data.
- Navigate origin, destination, parcel, confirm, and back buttons on desktop.
- Repeat the main navigation on mobile/tablet viewport.
- Confirm unchanged data keeps `Editar` disabled and shows the popover message.
- Change parcel content only and confirm the UI reaches a result state after submit.

### Test Coverage

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `src/features/Dashboard/subscreens/GuideDbEditModal.tsx` | prefilled state, step navigation, disabled no-change submit, parcel-only payload, origin-only payload, multiple-section payload, created result, failed result, transport error result | New `__tests__/feature/Dashboard/GuideDbEditModal.test.tsx`; Testing Library + real internal forms; mock `updateGuideDbCb` network function only |
| `src/features/Guides-DB/ResultGuideDbScreen.tsx` | update-result shape, edit success heading, edit transport-error heading, failed-provider branch preserved | Existing `__tests__/feature/Guides-DB/ResultGuideDbScreen.test.tsx` |

## Phase 4 - Parent Dashboard Wiring

### Changes Required

`src/features/Dashboard/subscreens/Order.tsx`

Action: Modify near `handleEditGuide` lines 243-246 and modal render lines 471-475.

Add close and success handlers that clear edit modal state and return details view to list after successful update.

```ts
const handleCloseEditGuide = () => {
  setIsEditOpen(false)
  setEditGuide(null)
}

const handleUpdatedGuide = () => {
  setSelectedDbGuide(null)
}
```

Pass the new props:

```tsx
<GuideDbEditModal
  open={isEditOpen}
  onClose={handleCloseEditGuide}
  onUpdated={handleUpdatedGuide}
  guide={editGuide}
/>
```

No changes are needed in `GuideDbCard.tsx` or `GuideDbDetails.tsx`; both already render edit actions only for failed, non-deleted guides when an edit callback exists.

Edge cases:

- If editing from the list, `selectedDbGuide` is already null and the handler is harmless.
- If editing from details, the details view unmounts after success so the invalidated list can refetch and become visible behind/after the result modal.

### Success Criteria

Automated:

```bash
pnpm test -- __tests__/feature/Dashboard/Order.test.tsx __tests__/feature/Dashboard/GuideDbCard.test.tsx __tests__/feature/Dashboard/GuideDbDetails.test.tsx
```

Manual:

- From `Ver mis guias`, open a failed card edit modal and close it; list remains visible.
- From failed guide details, open edit modal and complete a successful edit; after finishing the result, the list is visible, not stale details.
- Verify created, deleted, or missing-callback records still do not show edit controls.

### Test Coverage

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `src/features/Dashboard/subscreens/Order.tsx` | opens edit modal from card, opens edit modal from details, close clears modal, success returns from details to list, invalidated DB query refetch path | Existing `__tests__/feature/Dashboard/Order.test.tsx`; QueryClient wrapper pattern already in file |
| `src/features/Dashboard/subscreens/GuideDbCard.tsx` | existing failed/non-deleted edit gating remains passing | Existing `GuideDbCard.test.tsx` |
| `src/features/Dashboard/subscreens/GuideDbDetails.tsx` | existing failed/non-deleted edit gating remains passing | Existing `GuideDbDetails.test.tsx` |

## Phase 5 - Final Verification Scope

### Changes Required

No production files should be changed in this phase. Fix only defects found by the focused tests above.

Use TypeScript and lint as final implementation checks because the story touches multiple typed components and shared helpers.

### Success Criteria

Automated:

```bash
pnpm test -- __tests__/feature/Guides-DB/guideDbEditPayload.test.ts __tests__/feature/Dashboard/GuideDbEditModal.test.tsx __tests__/feature/Dashboard/Order.test.tsx __tests__/feature/Guides-DB/ParcelInfoGuideDbForm.test.tsx __tests__/feature/Guides-DB/ResultGuideDbScreen.test.tsx
pnpm exec tsc --noEmit
pnpm lint
```

Manual:

- Desktop: failed guide list card opens edit modal, prefilled data appears, unchanged submit is blocked, changed submit reaches result.
- Desktop: failed guide details edit returns to list after success.
- Mobile/tablet: same main edit navigation works and mobile headings remain readable.
- Create Guides DB flow still shows `notifyMe`, keeps quote dimensions disabled, and can advance through parcel step.

### Test Coverage

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| Cross-feature touched files | regression sweep for typed helper/component integration, no internal component mocks, user-visible behavior only | `.github/copilot-instructions.md`; existing QueryClient and media-query wrappers |

## Cross-Cutting Concerns

- Auth/cookies: no direct cookie access. Browser code calls `updateGuideDbCb`, which calls the existing Next BFF endpoint.
- API response shape: successful PATCH can return `status: 'failed'`; this is a provider result, not a transport error.
- Query invalidation: invalidate `['guides', 'db']`, matching existing delete behavior in `Order.tsx`.
- Dashboard layouts: `Order` relies on `useMediaQuery`; modal/forms must work with `isMobileTablet` headings and desktop stepper.
- SAT product lookup: keep existing `ProductSatDropdown` and `/api/product-sat` behavior; saved records may only show `satProductId` until the user searches/selects a new product.
- Styling: Flowbite `Modal`, `Button`, `Alert`, `Spinner`, and `Popover`; primary action for `Editar`, gray/light for back/cancel; preserve dark-mode classes.
- Testing: use `userEvent`, `screen`, real internal components, relative-path `jest.mock()` only for network/browser hooks, no CSS assertions, no file extensions in imports, no default-export mocks.

## Open Questions / Out Of Scope

- Open questions: none blocking. Research decisions resolved backend, quote-flow, and admin-edit behavior.
- Out of scope: editing `quote`, `notifyMe`, dimensions, or provider quote refresh.
- Out of scope: backend validation changes for dimensions or stale quote cases.
- Out of scope: new route handlers, new pages, new dependencies, new env vars, new state library, telemetry, logging, caching, or broad dashboard refactors.
- Out of scope: changing `GuideDbCard`/`GuideDbDetails` edit visibility unless tests reveal a regression from this story.

## Decisions Beyond Research

- Add `initialUseTempAddress` instead of building a new address editor. This is the smallest way to prefill the current guide address while preserving access to existing alias selection.
- Reuse `ResultGuideDbScreen` with `mode?: 'create' | 'edit'` instead of creating `ResultUpdateGuideDbScreen`. This preserves existing result semantics with less code.
- Keep confirm-changes UI local to `GuideDbEditModal` unless implementation becomes unreadable. The story needs one edit modal, not a reusable wizard framework.
