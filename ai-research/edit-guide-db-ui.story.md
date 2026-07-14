# Edit Guides DB UI - Research Story

## Story Definition

### Story Title

Add the full UI flow for editing an existing failed Guides DB record.

### Story Description

The prior story (`ai-research/update-guides-db.story.md`) and its plan (`ai-planning/planning-update-guides-db.story.md`) implemented the backend proxy contract, typed `updateGuideDbCb`, the failed-guide edit icon button, and an inert `GuideDbEditModal` shell. This follow-up story replaces that shell with the actual edit UI needed for a user to update an existing Guides DB record.

Scope is intentionally limited to editing `origin`, `destination`, and `parcel`. Editing `quote` is out of scope because the backend supports it only after the user re-quotes; that requires a separate quote flow for an existing guide DB record.

The edit modal must reuse existing Guides DB form components where practical:

- `src/features/Guides-DB/AddAddressGuideDb.tsx`
- `src/features/Guides-DB/AddTempAddressGuideDb.tsx`
- `src/features/Guides-DB/ParcelInfoGuideDbForm.tsx`
- `src/features/Guides-DB/ConfirmGuideDbData.tsx` patterns where useful
- `src/features/Guides/Mn/ProductSatDropdown.tsx`

The modal submits through the already implemented `updateGuideDbCb(kraftId, payload)`. The payload must include only changed top-level objects, but every included object must be sent complete. If the user changes only parcel content, the payload sends a full `parcel`; if the user changes origin, it sends a full `origin`; unchanged objects are omitted. If nothing changed, the submit button remains disabled and no request fires.

This is a single story. The quote re-flow is documented separately under `docs/` and should not be folded into this implementation.

### Acceptance Criteria

1. `GuideDbEditModal` is converted from a placeholder shell into a real multi-step edit modal for a selected `GuideDbRecord`, opened from the existing edit button on failed, non-deleted records.
2. The modal lets the user edit `origin`, `destination`, and `parcel` data only. `quote` and `notifyMe` remain out of the update payload for this story.
3. The edit flow reuses the existing Guides DB address and parcel form components where practical, with minimal prop additions rather than duplicated forms.
4. Initial form state is prefilled from the selected `GuideDbRecord.origin`, `GuideDbRecord.destination`, and `GuideDbRecord.parcel`.
5. The submit button is disabled until at least one editable field differs from the original guide. If no fields changed, `updateGuideDbCb` is never called.
6. On submit, the modal builds an `UpdateGuideDbPayload` containing only changed top-level objects (`origin`, `destination`, `parcel`), and every included object is complete.
7. On success, the UI invalidates `['guides', 'db']`, closes or advances the modal to a result state, and returns from details to the list when appropriate so the refetched record is visible.
8. If the backend re-attempt returns `status: 'created'`, the user sees a success result. If it returns `status: 'failed'`, the user sees a saved-but-provider-failed result with the new provider error context.
9. Transport/client errors are surfaced through the existing `useNotification` + `Notification` pattern or an in-modal error state consistent with existing Guides DB create semantics.
10. The edit modal works from both `GuideDbCard` and `GuideDbDetails`, on desktop and mobile/tablet dashboard layouts.
11. Tests cover dirty-state gating, payload construction, mutation success/error behavior, and the main modal navigation paths without mocking internal components.

### Why This Exists

Failed Guides DB records are recoverable: the guide was saved in Kraft, but the provider rejected the guide creation. Users need a way to correct bad shipment data and retry provider creation without recreating the entire flow manually. The previous story exposed the PATCH contract and edit entry point; this story makes that entry point useful.

The lazy path is to adapt the existing Guides DB create forms instead of building a second form stack. The caveat: some create-flow components assume quote-derived dimensions or alias-selection flow, so reuse requires small, explicit edit-mode props.

### Task Breakdown

- Replace `GuideDbEditModal` placeholder body with a multi-step flow.
- Add helper conversion functions to map `GuideDbRecord` into existing form state and `UpdateGuideDbPayload`.
- Extend existing address/parcel form components with edit-mode behavior only where required.
- Add dirty-checking for `origin`, `destination`, and `parcel`.
- Add a TanStack Query mutation using `updateGuideDbCb`.
- Add result handling for `created`, `failed`, and transport error states.
- Add focused tests around modal flow, dirty state, and payload construction.

## Technical Research

### Affected Areas

Routes/pages:

- `src/app/dashboard/page.tsx` remains unchanged. The dashboard already renders the client-only `Order` component.
- No new route/page is needed. The edit flow stays inside the existing dashboard modal.

API route handlers:

- No route-handler changes are required. `src/app/api/guides-db/[kraftId]/route.ts` already exposes PATCH and proxies to `${BACKEND_URI}/guides/db/{kraftId}`.

Feature UI:

- `src/features/Dashboard/subscreens/GuideDbEditModal.tsx` is the main target. It currently renders a placeholder Flowbite modal. It should become the edit flow owner: selected guide, local form refs/state, step navigation, dirty state, mutation, and result rendering.
- `src/features/Dashboard/subscreens/Order.tsx` already owns `isEditOpen` and `editGuide`; it should pass any needed callbacks such as `onUpdated`/`onCloseAfterSuccess` if the modal should reset `selectedDbGuide` after a successful edit from details.
- `src/features/Dashboard/subscreens/GuideDbCard.tsx` and `GuideDbDetails.tsx` already render the edit button only when `onEditGuide && guide.status === 'failed' && guide.deletedAt == null`; no visibility change needed.
- `src/features/Guides-DB/AddAddressGuideDb.tsx` is reusable for origin/destination if it can accept prefilled alias state and edit-specific copy. It currently relies on `useAddAddress` and saved alias refs. Reuse likely requires either pre-seeding alias refs from the guide or allowing an edit mode that defaults to the guide's current address.
- `src/features/Guides-DB/AddTempAddressGuideDb.tsx` is reusable for editing a full manual address because it accepts `addressData` and already supports default values.
- `src/features/Guides-DB/ParcelInfoGuideDbForm.tsx` currently disables dimensions and displays copy telling the user to re-quote to change dimensions. That conflicts with the PATCH example where parcel dimensions are editable. This component needs a small edit-mode prop that makes dimensions editable for guide DB edit, while preserving disabled dimensions in create flow.
- `src/features/Guides/Mn/ProductSatDropdown.tsx` is reusable for SAT product search/selection. The edit modal needs to initialize `searchProductSat` from the current parcel's `satProductId` best-effort. Because the saved guide only has `satProductId`, not the SAT product description, the input may show the ID until the user searches/selects a different product.
- `src/features/Guides-DB/ResultGuideDbScreen.tsx` handles create result semantics using `CreateGuideDbResponseData`. The update response shape is compatible on `status`, `kraftId`, `provider`, and `failureInfo`; either generalize the prop to a shared result type or add `ResultUpdateGuideDbScreen` if type friction is simpler. Prefer the smaller change: widen the result prop type to the shared subset.

Shared code:

- `src/shared/utils/guides.utils.ts` already has `updateGuideDbCb`, `toGuideDbParcelPayload`, and `verifyAndUpdateAddressGuideDb`.
- Add small pure helpers if needed, likely in `guides.utils.ts`, for testable conversion:
  - `toGuideDbAddressPayload(addressFormValues)` using the same rules as `ConfirmGuideDbData`.
  - `guideDbRecordToEditForm(guide)` for prefill.
  - `buildUpdateGuideDbPayload(originalGuide, currentFormState, selectedProduct)` for dirty-check and full-object payload construction.
- Keep helper count low. If conversion is only used by `GuideDbEditModal`, local functions are acceptable; extract only if tests or reuse justify it.

Tests:

- Existing relevant tests live under `__tests__/feature/Dashboard/*` and `__tests__/feature/Guides-DB/*`.
- Add/extend tests near `GuideDbEditModal` and `Order` rather than creating route-handler tests.

### Existing Patterns To Follow

App Router/client split:

- The modal is a client component. It calls `updateGuideDbCb`, which calls the Next BFF under `/api/guides-db/{kraftId}`. The browser never calls `BACKEND_URI` directly.

TanStack Query:

- Use `useMutation<UpdateGuideDbResponse['data'], GeneralApiError, UpdateGuideDbPayload>` inside `GuideDbEditModal` or `Order`. Prefer `GuideDbEditModal` owning the mutation because it owns the form and submit button.
- On mutation success, call `queryClient.invalidateQueries({ queryKey: ['guides', 'db'] })`, matching existing delete invalidation in `Order.tsx`.
- If editing from details, the parent may need to clear `selectedDbGuide` on success because the response snapshot is not a full `GuideDbRecord` and cannot safely update details in-place.

Forms:

- Keep `react-hook-form` + `yup` where the existing forms already use them.
- Do not add a new form library or state manager.
- Reuse the existing personal/address validation in `AddAddressGuideDb` / `AddTempAddressGuideDb`.
- Preserve create-flow behavior when adding edit props. Create should still have disabled quote-derived package dimensions.

Flowbite/Tailwind/design:

- Keep Flowbite `Modal`, `Button`, `Alert`, `Spinner`, and existing Tailwind spacing.
- `DESIGN.md` confirms neutral dashboards, blue primary actions, gray secondary buttons, and danger for destructive actions. The edit modal submit should be primary; cancel/back should be gray/light.
- Preserve dark-mode classes where adding any custom alert/panel styles.

### Proposed Modal Flow

Use a compact stepper-like flow modeled after `CreateGuideDbModal`, but do not require quote selection.

Steps:

1. Origin address
2. Destination address
3. Parcel
4. Confirm changes
5. Result

Step 1/2:

- Reuse `AddAddressGuideDb` and `AddTempAddressGuideDb` with prefilled guide values.
- Allow selecting a saved address alias or using a temporary/manual address.
- Destination still excludes the selected origin alias when both are alias-based.
- On next, store complete `CreateGuideAddressFormValuesMn` for the edited address.

Step 3:

- Reuse `ParcelInfoGuideDbForm` with an edit mode that enables dimensions (`length`, `width`, `height`, `weight`) and preloads parcel values from `guide.parcel`.
- Keep SAT product selection via `ProductSatDropdown`.
- Include `value`/`quantity` only when supplied, same as `toGuideDbParcelPayload`.
- Do not include `notifyMe` in the update payload. The existing form includes it for create; edit mode should hide it or ignore it. Prefer hiding it in edit mode to avoid a control that does nothing.

Step 4:

- Show a confirmation summary of changed sections only: origin, destination, parcel.
- If no sections changed, show an inline message and keep submit disabled.
- Submit button text should be `Guardar cambios` or `Reintentar creación`; choose one in planning. Since PATCH re-attempts provider creation, `Guardar cambios y reintentar` is clearest.

Step 5:

- If `data.status === 'created'`: show success copy and close button.
- If `data.status === 'failed'`: show saved-but-provider-failed copy with `getGuideDbFailureMessage(data.failureInfo)` when available.
- If mutation transport error: show an error state or existing notification. Prefer in-modal error state for submit failure and `Notification` only if that is easier to reuse from `Order`.

### Payload Construction

Original values come from `GuideDbRecord`:

- `guide.origin` and `guide.destination` are already full `GuideDbAddress` objects.
- `guide.parcel` is already full `GuideDbParcel`.

Current form values must be converted into update payload shapes:

- Address: `CreateGuideDbAddressPayload`
- Parcel: `CreateGuideDbParcelPayload`

Dirty comparison should happen at top-level object granularity:

- If any normalized origin field differs, include full `origin`.
- If any normalized destination field differs, include full `destination`.
- If any normalized parcel field differs, include full `parcel`.
- If nothing differs, submit disabled and `updateGuideDbCb` not called.

Normalization rules:

- Treat optional empty strings consistently before compare (`reference`, `company`, optional email).
- Convert parcel dimensions and optional numeric fields to numbers before compare.
- Compare `quantity`/`value` as absent vs number carefully. If original is undefined and form is blank, unchanged.
- `satProductId` comes from selected product code when the user selects one; otherwise keep the original `guide.parcel.satProductId`.

### Edge Cases And Constraints

- PATCH re-attempts provider creation. A successful HTTP response can still return `status: 'failed'`; this is not a transport error.
- The update response is not a full `GuideDbRecord`. Do not replace `selectedDbGuide` with it directly. Invalidate and refetch.
- Owner-only authorization is enforced by backend. Admins may see edit buttons in all-guides view for records they do not own; the follow-up submit may get a backend 4xx. Show the backend error without trying to infer ownership client-side.
- Soft-deleted guides have no edit button; modal should still handle a stale selected soft-deleted guide defensively by disabling submit or closing.
- Quote expiration is not solved here. If provider failure requires a new quote, show provider error and leave re-quote flow to the separate story.
- SAT product description may not be available from `satProductId`. The UI can display the saved ID and require a new search only if the user changes SAT product.
- Create flow must not regress: dimensions remain disabled when creating from a quote unless edit mode is explicitly enabled.
- Avoid adding broader abstractions for “wizard” state. `useSteps`, refs/state, and local helpers are enough.

### Dependencies And Integration Points

- No new dependencies.
- No new environment variables.
- Uses existing BFF PATCH endpoint and `updateGuideDbCb`.
- Uses `NEXT_PUBLIC_GET_SAT_PRODUCT_URI` indirectly through existing `/api/product-sat` and `ProductSatDropdown` when searching SAT products.
- Uses TanStack Query invalidation for DB guide lists.

### Testing Rules To Follow

From `.github/copilot-instructions.md`:

- Use `userEvent`, not `fireEvent`.
- Do not mock internal components from `@/features` or `@/shared` unless unavoidable.
- Mock network callbacks and browser-only hooks with relative import paths when needed.
- Do not assert CSS classes or layout styles.
- Use real-shaped mock data matching `GuideDbRecord`, `UpdateGuideDbPayload`, and `UpdateGuideDbResponse`.
- Preserve skipped tests.
- Avoid `any` and `unknown`.

Smallest useful test set:

- `GuideDbEditModal` opens with prefilled origin/destination/parcel data from a failed `GuideDbRecord`.
- Submit is disabled before any changes.
- Editing parcel content builds a payload with full `parcel` only.
- Editing origin builds a payload with full `origin` only.
- Editing destination builds a payload with full `destination` only.
- Editing multiple sections includes only those full objects.
- Successful `status: 'created'` response invalidates `['guides', 'db']` and shows success result.
- Successful `status: 'failed'` response invalidates and shows provider-failed result.
- Transport rejection shows an error state and does not close prematurely.
- `Order` opens the real modal from card and details, and closes it.

## Open Questions

Backend contract:

- I: Question: Does the backend accept updates to parcel dimensions (`length`, `width`, `height`, `weight`) without a new quote?
  - Status: pending
  - Context: The user-provided PATCH example edits parcel length and sends all parcel fields. Existing create UI says dimensions come from quote and require re-quote. This story assumes dimensions are editable via PATCH for failed guide retry, but backend/provider behavior should be confirmed.
- II: Question: If the provider rejects because the quote expired, can editing origin/destination/parcel and reusing the old quote ever succeed?
  - Status: pending
  - Context: Quote re-flow is out of scope and documented separately. This affects UX copy when PATCH returns another failed response.

UI/product decisions:

- I: Question: Confirm submit button copy: `Guardar cambios y reintentar`?
  - Status: pending
  - Context: PATCH both saves changes and re-attempts provider creation. This copy is clearer than plain `Guardar cambios`.
- II: Question: Should the modal close automatically on `status: 'created'`, or show the success result until the user clicks `Finalizar`?
  - Status: pending
  - Context: Existing `ResultGuideDbScreen` shows a result screen. Research recommends keeping the result screen for parity.

Authorization:

- I: Question: Should all-guides admin view hide edit buttons for guides not owned by the admin if owner metadata becomes available later?
  - Status: pending
  - Context: Current records do not expose a reliable owner field in the researched type. Backend owner-only auth remains the gate.

Quote flow:

- I: Question: Should the future re-quote flow launch from this edit modal result when the provider reports quote expiration?
  - Status: pending
  - Context: Out of scope here; captured under `docs/guide-db-existing-guide-quote-flow.md`.

## Assumptions

- This story is only for `origin`, `destination`, and `parcel` edits.
- `quote` remains out of `UpdateGuideDbPayload` for this UI, even though backend can edit it after a re-quote.
- Existing form components are reused with small edit-mode props; no duplicated address/parcel form stack.
- Parcel dimensions become editable only in edit mode.
- `notifyMe` is hidden or ignored in edit mode because it is not part of `UpdateGuideDbPayload`.
- The modal owns the mutation and invalidates `['guides', 'db']` on every successful HTTP response, regardless of returned `status`.
- The update response is displayed as a result snapshot, not used to mutate a full guide record in-place.
- No route-handler changes, dependencies, or env vars are needed.
