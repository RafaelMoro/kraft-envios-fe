# Update Guides DB (PATCH + Edit Entry Point) - Research Story

## Story Definition

### Story Title

Add a `PATCH /guides/db/{kraft-id}` update endpoint for Guides DB records, plus an edit entry point (icon button) on `GuideDbCard` and `GuideDbDetails` for `failed` records.

### Story Description

Extend the existing Guides DB BFF (`src/app/api/guides-db/[kraftId]/route.ts`, currently `DELETE`-only) with a `PATCH` handler that proxies to the backend `PATCH /guides/db/{kraft-id}` endpoint. When one of `parcel`, `origin`, or `destination` is edited, the client must resend **all** props of that object in the request body (full-object replacement under a PATCH verb), per the backend contract shown in the user-provided example:

```json
{ "parcel": { "length": 50, "width": 50, "height": 50, "weight": 50, "content": "a box 2", "satProductId": "sat-product-id-1" } }
```

Top-level objects that are not being edited are omitted from the payload (partial-resource PATCH, not a full PUT). `quote` and `notifyMe` are not part of the editable surface for this endpoint.

The PATCH response envelope is `{ version, message, error, data }` where `data` carries a guide-status snapshot: `kraftId`, `externalId`, `shipmentNumber`, `status`, `provider`, `carrier`, `price`, `guideLink`, `isProviderTrackingSynced`, `labelUrl`, `file`, `createdAt`, `updatedAt`, `deletedAt`, `deletedBy`, and `failureInfo`. This shape is a subset of the existing `GuideDbRecord` type (it omits `quote`, `origin`, `destination`, `parcel`) and overlaps with `CreateGuideDbResponseData` only on `kraftId`/`provider`/`status`/`failureInfo`; a new shared type is required.

**UI scope (added):** add an edit icon button (`<RiEditLine />` from `@remixicon/react`) to `GuideDbCard` and `GuideDbDetails`, visible **only on `failed` records**. Clicking it calls a new optional `onEditGuide(guide)` prop, which `Order` wires to open an edit modal. The edit modal **form** (fields, validation, submit through `updateGuideDbCb`) is intentionally **deferred to a follow-up research story**; this story ships the icon button, the `onEditGuide` prop plumbing, and a minimal `GuideDbEditModal` shell (Flowbite `Modal` with header/close, body reserved for the follow-up form). The BFF + types + callback are fully designed here; the modal form content is not.

Scope of this research: BFF PATCH handler + new shared types + client callback + edit icon button on Card/Details + `onEditGuide` prop + `Order` wiring + `GuideDbEditModal` shell. The modal form design is a follow-up story.

This research is a story note only. It does not plan implementation or include source code changes.

### Acceptance Criteria

1. A `PATCH` method is exported from `src/app/api/guides-db/[kraftId]/route.ts` (alongside the existing `DELETE`). It reads `kraftId` from `context.params`, returns `400` with `{ message: 'missing kraftId' }` when absent (mirroring the DELETE handler), and proxies to `PATCH ${BACKEND_URI}/guides/db/${encodeURIComponent(kraftId)}` with `Authorization: Bearer <accessToken>`.
2. The BFF guards `getAccessToken()` exactly like the existing `DELETE` handler: missing token returns `400` with `{ message: 'missing access token' }`. No Next-side role-guard is added (this is NOT an admin-only operation); backend authorization remains the source of truth.
3. The BFF forwards the upstream response envelope unchanged with HTTP 200 on success and collapses any non-2xx (axios error or otherwise) to `{ message }` 400 using the same fallback as the existing `DELETE` handler (`error?.response?.data?.error?.message || error.message`).
4. A new shared type `UpdateGuideDbResponse` (and an `UpdateGuideDbResponseData`) is added to `src/shared/types/guides.types.ts` matching the exact data shape from the user-provided example, including nullable `externalId`/`shipmentNumber`/`carrier`/`price`/`guideLink`/`labelUrl`/`file`/`deletedAt`/`deletedBy`, a boolean `isProviderTrackingSynced`, ISO strings for `createdAt`/`updatedAt`, and the existing `GuideDbFailureInfo` shape for `failureInfo`. The BFF return type is typed as `AxiosResponse<UpdateGuideDbResponse>`.
5. A new partial payload type `UpdateGuideDbPayload` is added, modeling the partial-resource contract: an optional `parcel?: CreateGuideDbParcelPayload`, `origin?: CreateGuideDbAddressPayload`, and `destination?: CreateGuideDbAddressPayload`, where each, when present, must carry **all** props of that object (enforced by usage, not by the type — the type is the full-object shape). `quote` and `notifyMe` are intentionally NOT in the payload type.
6. A client callback `updateGuideDbCb(kraftId, data)` is added to `src/shared/utils/guides.utils.ts` and returns `Promise<UpdateGuideDbResponse['data']>`, mirroring the existing `createGuideDbCb` / `deleteGuideDbCb` callbacks, and calling `PATCH ${UPDATE_GUIDE_DB_ENDPOINT}/${encodeURIComponent(kraftId)}` (where `UPDATE_GUIDE_DB_ENDPOINT = '/api/guides-db'` is added to `src/shared/constants/guides.constants.ts`, parallel to `DELETE_GUIDE_DB_ENDPOINT`).
7. `GuideDbCard` gains an optional `onEditGuide?: (guide: GuideDbRecord) => void` prop. When `onEditGuide` is provided AND `guide.status === 'failed'`, an edit icon button (`<RiEditLine />` from `@remixicon/react`) renders next to the existing delete button (inside the `div.w-full.mt-3.flex.justify-center.gap-3` block, before/after the delete button). When `guide.status !== 'failed'`, the edit button does NOT render. The button uses `data-testid="guide-db-edit-button"` and `aria-label="Editar guía"`.
8. `GuideDbDetails` gains the same optional `onEditGuide?: (guide: GuideDbRecord) => void` prop. When `onEditGuide` is provided AND `guide.status === 'failed'`, an edit icon button (`<RiEditLine />`) renders in the header row (next to the delete button, `div.flex.items-center.justify-between`). When `guide.status !== 'failed'`, the edit button does NOT render. Same `data-testid`/`aria-label`.
9. `Order` wires `onEditGuide` on both `GuideDbCard` and `GuideDbDetails` to a single handler that opens the `GuideDbEditModal` shell (sets `isEditOpen=true` and stores the selected guide). The modal is a new `src/features/Dashboard/subscreens/GuideDbEditModal.tsx` — a Flowbite `Modal` with a Spanish header (`Editar guía`), a close button, and an empty `ModalBody` reserved for the follow-up form. The modal closes on cancel/backdrop and is identifiable with `data-testid="guide-db-edit-modal"`.
10. The edit button is gated by an optional `onEditGuide` prop (mirrors the `onDeleteGuide` optional-prop pattern at `GuideDbCard.tsx:99` / `GuideDbDetails.tsx:74`): the button renders only when `onEditGuide` is passed. `Order` always passes `onEditGuide` for both sources (`ownDb` and `allDb`); the `failed`-only visibility is enforced inside the components via `guide.status === 'failed'`.
11. The contract "send all props of the edited object only" is documented in the story and surfaced in the callback JSDoc and the payload type definition. The type does not permit a partial sub-object (e.g., `{ parcel: { length: 50 } }` is not a valid `UpdateGuideDbPayload`); the callback receives at most the three full objects.
12. The `GuideDbEditModal` form (fields, `react-hook-form`+`yup` schema, submit through `updateGuideDbCb`, success invalidation of `['guides', 'db']`, error notification) is explicitly **out of scope** for this story and is reserved for a follow-up research story. This story ships only the modal shell so the icon button has a visible target.

### Why This Exists

After a guide is saved to the Guides DB with `status: failed` (provider never created the underlying shipment), users need to correct the parcel dimensions / content / SAT product or the origin / destination address and re-attempt creation. The backend exposes a PATCH verb that does this, returning the updated guide-state snapshot. The frontend needs a thin BFF proxy, a typed client callback, and an obvious edit entry point on the failed-record card and details screen. Shipping the icon button + modal shell now gives the user the affordance and unblocks the form work as a focused follow-up.

### Task Breakdown

This story is small-to-medium and lives in a single planning phase. High-level work:

- Add a `PATCH` handler to the existing `src/app/api/guides-db/[kraftId]/route.ts` next to the `DELETE` handler, mirroring its access-token guard, `kraftId` validation, `encodeURIComponent`, `Authorization` header, envelope forwarding, and 400 fallback.
- Add `UpdateGuideDbResponse`, `UpdateGuideDbResponseData`, and `UpdateGuideDbPayload` types to `src/shared/types/guides.types.ts`.
- Add `UPDATE_GUIDE_DB_ENDPOINT = '/api/guides-db'` to `src/shared/constants/guides.constants.ts` (parallel to `DELETE_GUIDE_DB_ENDPOINT`).
- Add `updateGuideDbCb(kraftId, data)` to `src/shared/utils/guides.utils.ts` mirroring `deleteGuideDbCb`.
- Add the `<RiEditLine />` edit icon button to `GuideDbCard` and `GuideDbDetails`, gated by `onEditGuide` prop AND `guide.status === 'failed'`.
- Add `onEditGuide?: (guide: GuideDbRecord) => void` prop to `GuideDbCard` and `GuideDbDetails`.
- Add `src/features/Dashboard/subscreens/GuideDbEditModal.tsx` — a Flowbite `Modal` shell (header `Editar guía`, close, empty body reserved for the follow-up form).
- In `Order.tsx`, add `isEditOpen` + `editGuide` state, wire `onEditGuide` on both `GuideDbCard` and `GuideDbDetails` to open the modal, and render `<GuideDbEditModal open={isEditOpen} onClose={...} guide={editGuide} />`.
- Add unit tests for the new callback (mirroring `verifyAndUpdateAddressGuideDb` test placement under `__tests__/feature/Guides-DB/`) and for edit-button visibility/rendering on `GuideDbCard` / `GuideDbDetails` (mirroring the existing delete-button tests under `__tests__/feature/Dashboard/`).

## Technical Research

### Affected Areas

Routes/pages:

- `src/app/dashboard/page.tsx`, `src/app/page.tsx`, `src/app/layout.tsx` are unchanged. No page-level changes; the PATCH is a backend-facing route handler and the UI lands in feature subscreens.

API route handlers:

- `src/app/api/guides-db/[kraftId]/route.ts` is the target file (currently `DELETE`-only). A `PATCH` named export is added in the same file. The handler:
  - Reads `kraftId` from `context.params.kraftId` and returns `NextResponse.json({ message: 'missing kraftId' }, { status: 400 })` when absent (verbatim pattern from the existing `DELETE` handler lines 18-21).
  - Calls `getAccessToken()` from `src/shared/lib/auth.lib.ts`; on missing token returns `NextResponse.json({ message: 'missing access token' }, { status: 400 })` (no `401`, matching the existing pattern across the repo).
  - Reads the request body via `await request.json()` and casts it to `UpdateGuideDbPayload`.
  - Calls `axios.patch(\`${process.env.BACKEND_URI}/guides/db/${encodeURIComponent(kraftId)}\`, payload, { headers: { Authorization: \`Bearer ${accessToken}\` } })`.
  - On 2xx, returns `NextResponse.json(res.data, { status: 200 })`.
  - On error, mirrors the existing `try/catch` shape: `axios.isAxiosError(error)` → `{ message: error?.response?.data?.error?.message || error.message }` 400; otherwise `(error as unknown as GeneralError)?.response?.data?.error?.message` → 400.
- No prefix/scope branching like the `GET` handler's `admin` path: PATCH targets a single keyed resource, the backend's `guides/db/{kraftId}` route.
- The sibling `hard/route.ts` and `route.ts` (POST/GET) are untouched.

Feature UI:

- `src/features/Dashboard/subscreens/GuideDbCard.tsx` gains:
  - Import of `RiEditLine` from `@remixicon/react` (alongside the existing `RiArrowRightLine`, `RiDeleteBinLine` at line 4).
  - An optional `onEditGuide?: (guide: GuideDbRecord) => void` prop added to the component interface (next to `onDeleteGuide` at line 29).
  - An edit `<Button>` (Flowbite, `color="alternative"` or matching the existing delete button's `outline` style — defer exact styling to planning, but visually consistent with the delete icon button) rendered **inside** the `div.w-full.mt-3.flex.justify-center.gap-3` block (line 90), placed before or after the delete button. Renders only when `onEditGuide && guide.status === 'failed'`. Uses `data-testid="guide-db-edit-button"` and `aria-label="Editar guía"`.
- `src/features/Dashboard/subscreens/GuideDbDetails.tsx` mirrors the same changes: import `RiEditLine`, add `onEditGuide?` prop, render the edit button in the header `div.flex.items-center.justify-between` (line 64) next to the delete button, gated identically by `onEditGuide && guide.status === 'failed'`.
- `src/features/Dashboard/subscreens/GuideDbEditModal.tsx` is a new file: a Flowbite `Modal` shell with `ModalHeader` (`Editar guía`), a `ModalBody` (empty / placeholder text like `Formulario de edición — próximamente`), a `ModalFooter` with a gray cancel button, and a `data-testid="guide-db-edit-modal"` on the `<Modal>`. Props: `open: boolean`, `onClose: () => void`, `guide: GuideDbRecord | null`. This is the visible target of the edit icon button; the form is filled in the follow-up story.
- `src/features/Dashboard/subscreens/Order.tsx` adds:
  - State: `const [isEditOpen, setIsEditOpen] = useState(false)` and `const [editGuide, setEditGuide] = useState<GuideDbRecord | null>(null)`.
  - A single `handleEditGuide = (guide: GuideDbRecord) => { setEditGuide(guide); setIsEditOpen(true) }` handler passed as `onEditGuide` to both `GuideDbCard` and `GuideDbDetails` (both sources: `ownDb` and `allDb`).
  - Renders `<GuideDbEditModal open={isEditOpen} onClose={() => setIsEditOpen(false)} guide={editGuide} />` next to the existing `<GuideDbDeleteModal>` usage (around lines 122-133 in Order or equivalent).

Shared code:

- `src/shared/types/guides.types.ts` receives three new types. Existing types reused as components:
  - `GuideDbFailureInfo` (already defined at lines 348-352): `{ errorCode: string; errorDetails?: string | null; timestamp?: string | null }` — reused as `failureInfo` on the new response.
  - `ProviderSource` (from `quotes.types`) — reused for `provider`.
  - `GuidesDbStatus` (`'created' | 'failed'`, line 346) — reused for `status`.
  - `CreateGuideDbParcelPayload` (lines 286-295) and `CreateGuideDbAddressPayload` (lines 268-284) — reused as the full-object shapes inside `UpdateGuideDbPayload`.
- `src/shared/utils/guides.utils.ts` receives `updateGuideDbCb(kraftId, data)` next to `deleteGuideDbCb`/`hardDeleteGuideDbCb` (lines 150-162). New import of `UpdateGuideDbPayload`, `UpdateGuideDbResponse` from the types file, and `UPDATE_GUIDE_DB_ENDPOINT` from the constants file.
- `src/shared/constants/guides.constants.ts` adds `UPDATE_GUIDE_DB_ENDPOINT = '/api/guides-db'` next to `DELETE_GUIDE_DB_ENDPOINT` (line 262). Optionally add `GUIDES_DB_EDIT_MODAL_TITLE = 'Editar guía'` (used by the modal shell). (Constants kept as separate names even where strings repeat, matching the existing `GET_GUIDES_DB_ENDPOINT`/`DELETE_GUIDE_DB_ENDPOINT` precedent.)

Tests:

- New unit test at `__tests__/feature/Guides-DB/updateGuideDb.test.ts` (placed alongside the sibling `verifyAndUpdateAddressGuideDb.test.ts`), covering the callback's URL, method, and return value via mocked `axios`. Tests must follow the project rules in `.github/copilot-instructions.md` (no internal-component mocking, mocked-data matches real shape, no `any`/`unknown`).
- Extend `__tests__/feature/Dashboard/GuideDbCard.test.tsx` with: an edit-button rendered test when `onEditGuide` is provided and `guide.status === 'failed'`; an edit-button hidden test when `guide.status === 'created'`; an edit-button hidden test when `onEditGuide` is not provided; a click test asserting `onEditGuide(guide)` is called.
- Extend `__tests__/feature/Dashboard/GuideDbDetails.test.tsx` with the same four edit-button tests.
- Optionally extend `__tests__/feature/Dashboard/Order.test.tsx` with: edit-button click opens `GuideDbEditModal` (assert `guide-db-edit-modal` is visible). The modal form submit is NOT tested (deferred).
- Route-handler tests are not common in this repo (no existing route-handler tests); defer to planning unless requested.

### Existing Patterns To Follow

App Router and client split:

- The PATCH handler is a server route handler; the client calls only the BFF (`/api/guides-db/[kraftId]`), never `${BACKEND_URI}` directly. Access token never leaves the server side.

Route handler proxy style (`src/app/api/guides-db/[kraftId]/route.ts:8-40`):

- The `DELETE` handler is the closest mirror: same `context.params.kraftId` extraction, same `getAccessToken()` guard, same `encodeURIComponent(kraftId)` in the upstream URI, same `Authorization` header, same 200/envelope-forward and `{ message }` 400 fallback. The PATCH handler clones this shape and only changes the verb, the upstream URL (no `/hard` suffix), and the body read.

Icon button pattern (`GuideDbCard.tsx:99-111`, `GuideDbDetails.tsx:74-86`):

- The delete button is a Flowbite `<Button color="red" outline>` with `<RiDeleteBinLine size={18} />` inside, an `aria-label`, and a `data-testid`. The edit button mirrors this: a Flowbite `<Button>` (`color="alternative"` or `color="light"` — planning choosing the tone that reads as "edit", not "danger") with `<RiEditLine size={18} />`, `aria-label="Editar guía"`, `data-testid="guide-db-edit-button"`. Placement is in the same button group / header row as the delete button.
- The optional-prop gating pattern (`onDeleteGuide && (isAdmin || guide.deletedAt == null)`) is reused for `onEditGuide` with the additional `guide.status === 'failed'` predicate.

Modal shell pattern (`GuideDbDeleteModal.tsx`):

- The existing delete modal is a Flowbite `<Modal show={open} onClose={onClose} size="sm">` with `ModalHeader`/`ModalBody`/`ModalFooter`. The new `GuideDbEditModal` reuses this skeleton with a `size="lg"` (the edit form will need more room — defer exact size to planning) and the same `open`/`onClose` props.

TanStack Query / mutations:

- Out of scope for this story (no mutation wired to the modal shell). A follow-up story will add a `useMutation` in `Order`/`GuideDbEditModal` calling `updateGuideDbCb` and invalidating `['guides', 'db']` on success.

Forms:

- Out of scope. The modal shell ships no form fields; `react-hook-form`+`yup` schemas for the edit flow belong to the follow-up story.

Styling:

- Tailwind v4 only. The edit icon button reuses the existing button styling vocabulary (`outline`, icon-only, `inline-flex items-center gap-2`); final color is a planning call. No new Tailwind config (none exists). DESIGN.md should be consulted before the edit button's tone is finalized (per AGENTS.md).

### Testing Rules To Follow

Project-specific rules from `.github/copilot-instructions.md`:

- Use `userEvent` not `fireEvent` for the edit-button click and modal open/close.
- Do not mock internal components from `@/features` or `@/shared`; render `GuideDbCard`, `GuideDbDetails`, and `GuideDbEditModal` as-is.
- Mock `updateGuideDbCb` (a network callback) via `jest.mock` of `src/shared/utils/guides.utils` with relative import, mirroring the existing `Order.test.tsx` mock at line 12-17. Add `updateGuideDbCb: jest.fn()` to the mock when extending `Order.test.tsx`.
- Do not mock `next/image`.
- Do not use `document.querySelector`/`getElementById`; use semantic queries or `data-testid`. The new edit button uses `data-testid="guide-db-edit-button"`; the modal uses `data-testid="guide-db-edit-modal"`.
- Do not assert styling/classes. The "edit affordance" is verified via presence/absence of the button and the click handler call, not via CSS.
- Preserve any `it.skip()` / `test.skip()`.
- Mock data must match the real backend response shape: `{ version, message, error, data: { ...guide-status snapshot... } }` (typed via the new `UpdateGuideDbResponse`).

Smallest useful tests:

- Callback (`updateGuideDb.test.ts`): asserts `axios.patch` was called with the correct URL `${UPDATE_GUIDE_DB_ENDPOINT}/${encodeURIComponent(kraftId)}`, the provided `data` payload, and that the function returns `res.data.data` (mirroring `createGuideDbCb`'s `return res?.data?.data` at line 144). One test per edited-object shape (parcel-only, origin-only, destination-only, multi-object). One rejecting/non-2xx test asserting the callback rethrows (the BFF is the one that collapses to 400; the client callback just throws, matching `deleteGuideDbCb`).
- `GuideDbCard`: edit button renders when `onEditGuide` provided and `status === 'failed'`; hidden when `status === 'created'`; hidden when `onEditGuide` not provided; click calls `onEditGuide(guide)`.
- `GuideDbDetails`: same four edit-button tests.
- `Order`: edit button click opens `guide-db-edit-modal`; cancel closes it. Modal submit is NOT tested (deferred).

### Edge Cases And Constraints

- The PATCH response `data` does NOT include `quote`, `origin`, `destination`, `parcel`. It is a status snapshot, not a full record. The new type must reflect this; do not reuse `GuideDbRecord` (which requires those fields).
- The `price`, `carrier`, `guideLink`, `labelUrl`, `file`, `externalId`, `shipmentNumber`, `deletedAt`, `deletedBy` fields are nullable in the example (all `null` for a `failed` record). Type them as `string | null` (or `string | null | undefined` if the backend sometimes omits them — flagged in Open Questions).
- `isProviderTrackingSynced` is a boolean (`false` in the example).
- `failureInfo` may be `null` (an edited object on a previously-failed record might still record a failure if the edit-recreate attempt also fails). Type as `GuideDbFailureInfo | null`.
- The payload contract "send all props of the edited object" is enforced by usage, not by TypeScript — the type is the full-object shape. The type intentionally does NOT express "at least one of parcel/origin/destination" so that the empty payload `{ }` is a valid `UpdateGuideDbPayload` at the type level. Planning decides whether the BFF or callback adds a runtime guard that at least one object is present. (The modal form, when built, will always send at least one full object, so this is moot in practice.)
- The edit button is visible **only on `failed` records** (AC 7/8). On `created` records the edit button does NOT render, even if `onEditGuide` is passed. The delete button's existing `(isAdmin || guide.deletedAt == null)` gate is independent — the edit button does NOT inherit the deletedAt gate (a soft-deleted failed record still shows the edit button if the user can see the record at all; `includeDeleted` admins would see edit on soft-deleted failed records). Flagged in Open Questions whether edit should be hidden on soft-deleted records.
- `getAccessToken()` returns `null` when the session cookie is missing/expired; the BFF returns 400 (not 401), matching every other Guides DB BFF. Do not introduce 401 here.
- `kraftId` is URL-safe in its observed format (`KFT-YYYYMM-NNNNNN`); the BFF additionally `encodeURIComponent`s it, matching the DELETE handler.
- The patch endpoint does NOT have an `/admin` variant like the `GET` list route. Do not branch on a `scope` param.
- Authorization stays in the backend for PATCH; no Next-side role guard is added (this is NOT the hard-delete precedent). The hard-delete `// ponytail:` role-guard pattern is explicitly NOT carried over to PATCH.
- `product-sat` uses `NEXT_PUBLIC_GET_SAT_PRODUCT_URI`, not `BACKEND_URI`; the `satProductId` field inside `parcel` is an opaque string carried through, not a SAT lookup at the BFF layer. (The follow-up edit form will reuse the existing `product-sat` flow for the parcel's `satProductId` field.)
- Tests always collect coverage into `coverage/`; do not run tests during research.
- The modal shell is intentionally inert (no submit). Shipping an inert modal is acceptable because the icon button's visible target is the user-facing deliverable of this story; the form is the follow-up.

### Dependencies And Integration Points

- No new dependencies. `@remixicon/react` (`RiEditLine`), Flowbite `Modal`/`Button`, `axios`, `next/server`, and the existing shared auth/types/constants/utils are all already installed and in use.
- No new env vars. The upstream PATCH endpoint is served by `BACKEND_URI`.
- Cross-feature integration: `Order` (`Ver mis guias` and `Ver todas las guias` sources) renders `GuideDbCard` and `GuideDbDetails`; both pass `onEditGuide`. `GuideDbEditModal` is a new sibling of `GuideDbDeleteModal`. The future edit-form story will reuse `src/features/Guides-DB/AddAddressGuideDb.tsx` / `ParcelInfoGuideDbForm.tsx` as building blocks; that decision is deferred.

## Open Questions

Backend contract:

- I: Question: When only the `parcel` is edited, must `origin` and `destination` be omitted entirely, or may they also be sent unchanged? The user's example shows only `parcel` in the body.
  - Status: answered
  - Answer: Omit unchanged top-level objects; the payload contains only the edited object(s).
  - Context: Drives AC 5/11 and the `UpdateGuideDbPayload` shape (optional full-object fields, not required).
- II: Question: Is `quote` ever editable via this PATCH endpoint, or strictly parcel/origin/destination?
  - Status: pending
  - Context: AC 5 explicitly excludes `quote` and `notifyMe` from the payload type. Confirm with the backend that attempting to PATCH `quote` is rejected (or that the frontend simply never sends it).
- III: Question: Does the backend accept an empty payload `{ }` as a no-op and return the current snapshot, or does it 400?
  - Status: pending
  - Context: Decides whether the BFF/callback adds a runtime guard that at least one of `parcel`/`origin`/`destination` is present. The type currently allows an empty payload; the modal form (follow-up) will always send at least one.
- IV: Question: For the response `data`, are nullable fields ever omitted (absent key) or always present as `null`? The example shows every field present.
  - Status: pending
  - Context: Decides whether the new types use `string | null` (always present) or `string | null | undefined` (sometimes omitted). The example suggests always-present; the conservative choice is `string | null` per AC 4.
- V: Question: Does editing a previously-`failed` record re-attempt provider creation, and does the response report a fresh `failureInfo`/`updatedAt` (and possibly a new `status`)?
  - Status: pending
  - Context: The example response carries `status: failed` with non-null `failureInfo`; the assumption is that PATCH re-runs the provider and updates timestamps. Drives the future edit-form UX (what does the modal show after submit — a fresh snapshot, a loading state, a refetch?). Not strictly needed for this story's icon-button/shell work, but should be confirmed before the follow-up.

UI/product decisions:

- I: Question: Should the edit button be hidden on soft-deleted `failed` records (where `guide.deletedAt != null`), or visible alongside the delete button whenever `status === 'failed'`?
  - Status: pending
  - Context: The delete button uses `(isAdmin || guide.deletedAt == null)`. The edit button as specified uses only `guide.status === 'failed'`. An admin viewing `Ver todas las guias` with `includeDeleted` would see an edit button on a soft-deleted failed record. Decide whether editing a soft-deleted record is a valid flow (it may un-delete via re-creation) or whether edit should also gate on `deletedAt == null`.
- II: Question: Should the edit icon button visually match the delete button (`outline`, danger-adjacent) or use a neutral/alternative tone to distinguish "edit" from "destructive"?
  - Status: pending
  - Context: AC 7/8 leave the color to planning. Per AGENTS.md, consult DESIGN.md before finalizing the tone. `RiEditLine` + a non-danger color (`alternative`/`light`) is the safer default; final call is a planning/product decision.
- III: Question: Should the `GuideDbEditModal` shell ship with a placeholder body (`Formulario de edición — próximamente`) or render nothing in `ModalBody`?
  - Status: pending
  - Context: A placeholder communicates "intentional WIP" to users who click the edit button; an empty body reads as a bug. Lean toward a small Spanish placeholder text until the follow-up form lands.

Create payload:

- I: Question: Empty `updateGuideDbCb` payload behavior — throw client-side, or forward and let backend reject?
  - Status: pending
  - Context: AC 11 leaves this to the future UI; this story's callback forwards whatever it receives. The modal form (follow-up) will always send at least one object.

Authorization:

- I: Question: Is PATCH admin-only, owner-only, or any authenticated user who owns the guide?
  - Status: pending
  - Context: AC 2 assumes any authenticated user (no Next-side role guard). Backend authorization is the source of truth. Confirm PATCH is not admin-restricted before the follow-up form wires edit affordances for non-owners. The icon button ships to both sources regardless; the backend is the gate.

Edit flow (follow-up story):

- I: Question: Should the follow-up edit modal reuse `AddAddressGuideDb.tsx` / `ParcelInfoGuideDbForm.tsx` from `src/features/Guides-DB/`, or build a dedicated edit form?
  - Status: pending
  - Context: Drives the follow-up story's research. Not blocking here; this story ships the shell + button only.

## Assumptions

- The backend PATCH endpoint is `PATCH /guides/db/{kraft-id}` (no `/admin` and no `/hard` suffix). It accepts a partial top-level payload with `parcel`, `origin`, `destination` as full-object replacements and returns the guide-status snapshot envelope on success.
- The BFF PATCH handler lives in the existing `src/app/api/guides-db/[kraftId]/route.ts` alongside the `DELETE` handler. It reuses `getAccessToken()`, `encodeURIComponent`, the same 200/envelope-forward, and the same `{ message }` 400 fallback. No Next-side role-guard is added (backend authorization is the source of truth).
- A new shared type `UpdateGuideDbResponse` (with `UpdateGuideDbResponseData`) is added and is NOT the same as `CreateGuideDbResponseData` or `GuideDbRecord`. The data carries `kraftId`, `externalId`, `shipmentNumber`, `status`, `provider`, `carrier`, `price`, `guideLink`, `isProviderTrackingSynced`, `labelUrl`, `file`, `createdAt`, `updatedAt`, `deletedAt`, `deletedBy`, and `failureInfo`. Nullable fields are typed as `string | null` (always present); `isProviderTrackingSynced` as `boolean`; `failureInfo` as `GuideDbFailureInfo | null`. This matches the user-provided example exactly.
- A new payload type `UpdateGuideDbPayload` has optional `parcel?: CreateGuideDbParcelPayload`, `origin?: CreateGuideDbAddressPayload`, `destination?: CreateGuideDbAddressPayload`; `quote` and `notifyMe` are intentionally excluded. Each present field is the full object (no partial sub-object permitted by the type).
- New constants `UPDATE_GUIDE_DB_ENDPOINT = '/api/guides-db'` and `GUIDES_DB_EDIT_MODAL_TITLE = 'Editar guía'` are added next to `DELETE_GUIDE_DB_ENDPOINT` (kept as separate names even where strings repeat, matching the existing `GET_GUIDES_DB_ENDPOINT`/`DELETE_GUIDE_DB_ENDPOINT` precedent).
- New callback `updateGuideDbCb(kraftId, data): Promise<UpdateGuideDbResponse['data']>` is added to `src/shared/utils/guides.utils.ts` and is the only client entry point for PATCH. It mirrors `createGuideDbCb` (returns `res.data.data`) and forwards via `axios.patch`. It is NOT wired to a `useMutation` in this story; the follow-up modal form will consume it.
- The edit icon button (`<RiEditLine />`) is added to `GuideDbCard` (inside the `div.w-full.mt-3.flex.justify-center.gap-3` block) and `GuideDbDetails` (inside the header `div.flex.items-center.justify-between`), gated by an optional `onEditGuide` prop AND `guide.status === 'failed'`. The button uses `data-testid="guide-db-edit-button"` and `aria-label="Editar guía"`. The exact Flowbite color/outline is a planning call (DESIGN.md consulted); the default recommendation is a non-danger tone (`alternative`/`light`) to distinguish edit from delete.
- `Order` always passes `onEditGuide` to both `GuideDbCard` and `GuideDbDetails` in both sources (`ownDb` and `allDb`); the `failed`-only visibility is enforced inside the components.
- A new `GuideDbEditModal.tsx` is a Flowbite `Modal` shell (`data-testid="guide-db-edit-modal"`, header `Editar guía`, cancel button, empty/placeholder body) — the visible target of the edit button. The form fields, schema, submit-via-`updateGuideDbCb`, success invalidation, and error notification are explicitly deferred to a follow-up story.
- This story does NOT wire a `useMutation` or invalidate any query (no submit happens yet). The existing delete mutation/invalidation in `Order` is untouched.
- No new dependency or env var is introduced. The existing `// ponytail:` Next-side role-guard precedent in the hard-delete route is NOT carried over to PATCH.
- The `kraftId` is URL-safe in its observed format (`KFT-YYYYMM-NNNNNN`); the BFF `encodeURIComponent`s it as a defensive default, matching the DELETE handler.
- Tests always collect coverage into `coverage/`; no tests are run during research.