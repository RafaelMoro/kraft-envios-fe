# Update Guides DB (PATCH + Edit Entry Point) - Planning

- Story: Update Guides DB PATCH endpoint and failed-guide edit entry point
- Source research: `ai-research/update-guides-db.story.md`
- Sign-off status: Complete. All research open questions are answered; verified against the current repository on 2026-07-13. The research document does not record a separate human sign-off date.
- Scope: PATCH BFF/types/client callback plus the failed, non-deleted record edit button and inert modal shell. The editable form is deferred.

## Assumptions Made During Planning

1. The final UI decision in research Open Question UI/I supersedes the earlier card/details wording: the edit button requires `onEditGuide`, `guide.status === 'failed'`, and `guide.deletedAt == null`. It is hidden for soft-deleted records, including admin `includeDeleted` rows.
2. Use Flowbite `color="gray"` with `outline` for the edit action. This is the existing neutral Flowbite tone and matches `DESIGN.md`'s gray secondary button guidance; the delete button remains red.
3. `GUIDES_DB_EDIT_MODAL_TITLE` is the only new modal-copy constant. The placeholder and cancel label remain local literals because no reuse is required in this story.
4. No route-handler test is added. This repository has no route-handler test pattern, and the research explicitly defers it to planning. The typed handler is covered by TypeScript/lint/build verification; the public client callback and UI paths receive focused Jest coverage.
5. The inert modal accepts `guide` to preserve the selected record for the follow-up form, even though this shell does not render it. Closing only sets `isEditOpen` to `false`; retaining selection is harmless and avoids extra state cleanup with no current behavior.

## Acceptance Criteria

Copied from `ai-research/update-guides-db.story.md` in order:

1. A `PATCH` method is exported from `src/app/api/guides-db/[kraftId]/route.ts` (alongside the existing `DELETE`). It reads `kraftId` from `context.params`, returns `400` with `{ message: 'missing kraftId' }` when absent (mirroring the DELETE handler), and proxies to `PATCH ${BACKEND_URI}/guides/db/${encodeURIComponent(kraftId)}` with `Authorization: Bearer <accessToken>`.
2. The BFF guards `getAccessToken()` exactly like the existing `DELETE` handler: missing token returns `400` with `{ message: 'missing access token' }`. No Next-side role-guard is added (this is NOT an admin-only operation); backend authorization remains the source of truth.
3. The BFF forwards the upstream response envelope unchanged with HTTP 200 on success and collapses any non-2xx (axios error or otherwise) to `{ message }` 400 using the same fallback as the existing `DELETE` handler (`error?.response?.data?.error?.message || error.message`).
4. A new shared type `UpdateGuideDbResponse` (and an `UpdateGuideDbResponseData`) is added to `src/shared/types/guides.types.ts` matching the documented status-snapshot shape, with nullable fields typed as `... | null | undefined`; `isProviderTrackingSynced` is `boolean`, timestamps are ISO strings, and `failureInfo` reuses `GuideDbFailureInfo`.
5. A new partial payload type `UpdateGuideDbPayload` is added, modeling optional `parcel?: CreateGuideDbParcelPayload`, `origin?: CreateGuideDbAddressPayload`, and `destination?: CreateGuideDbAddressPayload`, where every present object carries all its props. `quote` and `notifyMe` are intentionally NOT in the payload type.
6. A client callback `updateGuideDbCb(kraftId, data)` is added to `src/shared/utils/guides.utils.ts` and returns `Promise<UpdateGuideDbResponse['data']>`, using `PATCH ${UPDATE_GUIDE_DB_ENDPOINT}/${encodeURIComponent(kraftId)}`. It throws client-side without calling Axios when the payload has no `parcel`, `origin`, or `destination`.
7. `GuideDbCard` gains optional `onEditGuide?: (guide: GuideDbRecord) => void`. When the prop is supplied and the guide is failed, it renders a `<RiEditLine />` edit icon next to delete with `data-testid="guide-db-edit-button"` and `aria-label="Editar guía"`.
8. `GuideDbDetails` gains the same optional prop and, under the same failed-guide condition, renders the same edit icon in the header next to delete.
9. `Order` wires both edit callbacks to open a new `GuideDbEditModal` shell. The shell is a Flowbite Modal with Spanish header `Editar guía`, close behavior, reserved body, and `data-testid="guide-db-edit-modal"`.
10. The edit button is gated by the optional prop, and `Order` always passes that prop in both own and all DB sources; failed-only visibility is enforced by the child components.
11. The contract to send all props of edited objects only is documented in the payload type and callback JSDoc. The type does not allow a partial sub-object such as `{ parcel: { length: 50 } }`.
12. Form fields, validation, submit through `updateGuideDbCb`, success invalidation of `['guides', 'db']`, and error notifications are explicitly deferred to a follow-up story; this story ships only the modal shell.

## Affected Files

### `src/app/api/**`

- `src/app/api/guides-db/[kraftId]/route.ts` - **Modify**. Add the PATCH BFF beside DELETE.

### `src/shared/**`

- `src/shared/types/guides.types.ts` - **Modify**. Add update response and payload DTOs.
- `src/shared/constants/guides.constants.ts` - **Modify**. Add PATCH endpoint and edit-modal title constants.
- `src/shared/utils/guides.utils.ts` - **Modify**. Add the guarded PATCH callback.

### `src/features/**`

- `src/features/Dashboard/subscreens/GuideDbCard.tsx` - **Modify**. Add optional edit callback and neutral failed-guide action.
- `src/features/Dashboard/subscreens/GuideDbDetails.tsx` - **Modify**. Add the equivalent header action.
- `src/features/Dashboard/subscreens/GuideDbEditModal.tsx` - **Create**. Add the form-free modal shell.
- `src/features/Dashboard/subscreens/Order.tsx` - **Modify**. Own selected-guide/modal-open state and pass the edit callback to both render paths.

### `__tests__/**`

- `__tests__/feature/Guides-DB/updateGuideDb.test.ts` - **Create**. Cover the public PATCH callback.
- `__tests__/feature/Dashboard/GuideDbCard.test.tsx` - **Modify**. Cover edit visibility and callback interaction.
- `__tests__/feature/Dashboard/GuideDbDetails.test.tsx` - **Modify**. Cover the same details action behavior.
- `__tests__/feature/Dashboard/Order.test.tsx` - **Modify**. Cover modal open and cancel via the real child components.

### Docs / Config

- No config changes.
- `REPO_CONTEXT.md` - No change. PATCH behavior is story-specific and the general route conventions already document the applicable proxy/auth pattern.

## Phases

### Phase 1 - PATCH contract and failed-guide edit entry point

This is independently testable as one bounded vertical slice: the BFF exposes the typed contract, the callback calls only the BFF, and the UI opens a deliberately inert modal without submitting or mutating data.

#### Changes Required

`src/shared/types/guides.types.ts` - **Modify**, near `CreateGuideDbPayload` and the current Guides DB response types:

- Add `UpdateGuideDbPayload` with optional full-object replacements only. Its definition comment must state that callers send every field of each changed object, omit unchanged top-level objects, and never include `quote` or `notifyMe`.

```ts
export type UpdateGuideDbPayload = {
  parcel?: CreateGuideDbParcelPayload;
  origin?: CreateGuideDbAddressPayload;
  destination?: CreateGuideDbAddressPayload;
};
```

- Add `UpdateGuideDbResponseData` rather than reusing `GuideDbRecord` or `CreateGuideDbResponseData`: the PATCH envelope returns only a guide-status snapshot, without quote/address/parcel fields.
- Required snapshot fields: `kraftId: string`, `status: GuidesDbStatus`, `provider: ProviderSource`, `isProviderTrackingSynced: boolean`, `createdAt: string`, and `updatedAt: string`.
- Nullable-or-omitted snapshot fields must be `string | null | undefined`: `externalId`, `shipmentNumber`, `carrier`, `price`, `guideLink`, `labelUrl`, `file`, `deletedAt`, and `deletedBy`. `failureInfo` is `GuideDbFailureInfo | null | undefined`.
- Add `UpdateGuideDbResponse` using the existing backend envelope convention:

```ts
export type UpdateGuideDbResponse = {
  version: string;
  message: string | null;
  error: string | null;
  data: UpdateGuideDbResponseData;
};
```

`src/shared/constants/guides.constants.ts` - **Modify**, beside `DELETE_GUIDE_DB_ENDPOINT` and the existing Guides DB modal copy:

- Add `UPDATE_GUIDE_DB_ENDPOINT = '/api/guides-db'` as a separately named endpoint, matching the established GET/DELETE naming convention even though the path repeats.
- Add `GUIDES_DB_EDIT_MODAL_TITLE = 'Editar guía'` near the delete-modal title constants.

`src/shared/utils/guides.utils.ts` - **Modify**, near `deleteGuideDbCb` and `hardDeleteGuideDbCb`:

- Import `UPDATE_GUIDE_DB_ENDPOINT`, `UpdateGuideDbPayload`, and `UpdateGuideDbResponse` into the existing import groups.
- Add the exported callback and JSDoc documenting the full-object replacement rule and empty-payload rejection:

```ts
export const updateGuideDbCb = async (
  kraftId: string,
  data: UpdateGuideDbPayload,
): Promise<UpdateGuideDbResponse['data']> => { /* implementation */ };
```

- Before `axios.patch`, reject when all three fields are absent. The guard must not issue a request and should throw a stable `Error` explaining that at least one editable object is required.
- PATCH only `${UPDATE_GUIDE_DB_ENDPOINT}/${encodeURIComponent(kraftId)}` and return `res.data.data`, mirroring `createGuideDbCb`; let Axios errors propagate unchanged.

`src/app/api/guides-db/[kraftId]/route.ts` - **Modify**, add a named `PATCH` export after the DELETE handler:

- Use the same `NextRequest` and dynamic-context signature as DELETE. Read `kraftId` from `context.params`; return `NextResponse.json({ message: 'missing kraftId' }, { status: 400 })` when it is absent.
- Call `getAccessToken()` and return the existing missing-token 400 response when it is null. Do not import `getUserInfo` or branch by role/scope.
- Parse the request JSON as `UpdateGuideDbPayload`, then call Axios with the complete proxy contract:

```ts
axios.patch<UpdateGuideDbResponse>(
  `${process.env.BACKEND_URI}/guides/db/${encodeURIComponent(kraftId)}`,
  payload,
  { headers: { Authorization: `Bearer ${accessToken}` } },
);
```

- Type the response variable as `AxiosResponse<UpdateGuideDbResponse>`, return its envelope via `NextResponse.json(res.data, { status: 200 })`, and preserve both existing catch branches and their `{ message }` 400 fallback exactly.

`src/features/Dashboard/subscreens/GuideDbEditModal.tsx` - **Create**:

- Add a client component with this compact prop contract:

```ts
type GuideDbEditModalProps = {
  open: boolean;
  onClose: () => void;
  guide: GuideDbRecord | null;
};
```

- Follow `GuideDbDeleteModal`'s Flowbite structure: `<Modal show={open} onClose={onClose} size="lg">`, `ModalHeader`, `ModalBody`, and `ModalFooter`.
- Put `data-testid="guide-db-edit-modal"` on the Modal. Header uses `GUIDES_DB_EDIT_MODAL_TITLE`; body visibly says `Formulario de edición — próximamente`; footer has a gray `Cancelar` button that calls `onClose`.
- Do not add form state, field rendering, mutation hooks, submit controls, or a side effect for `guide`; its presence only preserves the intended follow-up interface.

`src/features/Dashboard/subscreens/GuideDbCard.tsx` - **Modify**, props at lines 18-30 and button group at lines 90-112:

- Import `RiEditLine` beside the existing Remix icons.
- Extend the inline props object and destructuring with `onEditGuide?: (guide: GuideDbRecord) => void`.
- Before the delete button in the current `div.w-full.mt-3.flex.justify-center.gap-3`, render a neutral outlined Flowbite Button when all conditions hold:

```ts
onEditGuide && guide.status === 'failed' && guide.deletedAt == null
```

- The button uses `type="button"`, `color="gray"`, `outline`, `className="inline-flex items-center gap-2"`, `data-testid="guide-db-edit-button"`, `aria-label="Editar guía"`, and `<RiEditLine size={18} />`; click calls `onEditGuide(guide)`.
- Keep the existing delete gate and delete-confirm state/modal untouched.

`src/features/Dashboard/subscreens/GuideDbDetails.tsx` - **Modify**, `GuideDbDetailsProps` near line 30 and header row at lines 64-87:

- Import `RiEditLine`, add optional `onEditGuide`, and destructure it in the component signature.
- In the header's right-side action area, add the same neutral icon button and exact predicate/test id/accessibility contract as the card. Wrap edit/delete controls in a small flex container if needed so the existing back button and both actions retain their layout.
- Leave details content, failure presentation, and the delete modal behavior unchanged.

`src/features/Dashboard/subscreens/Order.tsx` - **Modify**, imports/state near lines 1-75, handler area near `handleDeleteGuide`, and both DB child call sites:

- Import `GuideDbEditModal`.
- Add local state: `isEditOpen: boolean` and `editGuide: GuideDbRecord | null`.
- Add one `handleEditGuide(guide)` that stores the record and opens the modal. Do not create a mutation or import `updateGuideDbCb`.
- Pass `onEditGuide={handleEditGuide}` to `GuideDbDetails` and every `GuideDbCard`, independently of `canDelete`, so both own and all DB sources supply the optional prop.
- Render one `<GuideDbEditModal>` near the existing DB content/modal usage, with `open={isEditOpen}`, `guide={editGuide}`, and `onClose={() => setIsEditOpen(false)}`. Flowbite's existing `onClose` covers backdrop dismissal; the footer handles explicit cancel.

#### Edge Cases

- The BFF is server-side and reads the encrypted httpOnly session via `getAccessToken`; the browser only calls `/api/guides-db/{kraftId}` and must never use `BACKEND_URI` directly.
- The backend accepts a partial top-level PATCH but full replacement objects. `{ parcel: { length: 50 } }` is invalid at the type level; `{}` is rejected by the callback before Axios.
- A successful PATCH snapshot cannot replace a cached `GuideDbRecord` because it omits quote/origin/destination/parcel. No cache update or invalidation belongs in this story because the modal has no submit action.
- The owner-only backend remains the authorization boundary. `Order` exposes the affordance for visible failed records in both own/all sources; the deferred form will surface backend authorization errors.
- Card and details components do not have a separate mobile branch for these controls. Confirm card and details behavior manually at desktop and mobile/tablet viewport sizes.

#### Test Coverage

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `__tests__/feature/Guides-DB/updateGuideDb.test.ts` | `axios.patch` URL encodes `kraftId`, receives a parcel-only, origin-only, destination-only, and multi-object full payload; callback returns `response.data.data`; Axios rejection propagates; empty payload rejects without calling Axios | Axios mock pattern in existing feature tests; callback return shape from `createGuideDbCb` in `src/shared/utils/guides.utils.ts` |
| `__tests__/feature/Dashboard/GuideDbCard.test.tsx` | edit button renders only with `onEditGuide` for a failed non-deleted guide; it is absent for created, missing callback, and soft-deleted failed records; `userEvent` click calls the callback with the exact guide | Existing delete-control tests in the same file; use `screen` and `guide-db-edit-button` |
| `__tests__/feature/Dashboard/GuideDbDetails.test.tsx` | same four visibility scenarios and callback argument from the details header | Existing delete-control tests in the same file; Testing Library + `userEvent` |
| `__tests__/feature/Dashboard/Order.test.tsx` | switching to own DB with a failed record exposes the real edit button; clicking opens `guide-db-edit-modal`; footer cancel closes it; repeat the open assertion after entering details; ensure a created record has no edit control | Existing relative `jest.mock` for network/browser dependencies and QueryClient wrapper; do not mock internal Dashboard components |

Test constraints to preserve:

- Use `userEvent`, never `fireEvent`.
- Mock Axios/network and browser-only hooks only. Do not mock `GuideDbCard`, `GuideDbDetails`, `GuideDbEditModal`, or other internal components.
- Use the relative import form for any new `jest.mock()` call; mocks use named exports and real response shapes.
- Query through `screen`, not `container`, `querySelector`, or element IDs; assert visible behavior and ARIA/test ids, not classes or styling.
- Keep existing skipped tests unchanged and do not use `any` or `unknown` in test data.

#### Success Criteria

Automated:

```bash
pnpm test -- __tests__/feature/Guides-DB/updateGuideDb.test.ts
pnpm test -- __tests__/feature/Dashboard/GuideDbCard.test.tsx
pnpm test -- __tests__/feature/Dashboard/GuideDbDetails.test.tsx
pnpm test -- __tests__/feature/Dashboard/Order.test.tsx
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```

Manual:

1. Log in and open `Ver mis guias` with a failed, non-deleted DB guide. Confirm the neutral edit icon appears and opens a modal headed `Editar guía` with the intentional placeholder; cancel and backdrop both close it.
2. Open that guide's details and confirm the header edit icon opens the same shell.
3. Confirm no edit icon for a created guide or a soft-deleted failed guide. In an admin `Ver todas las guias` view with `Incluir guías eliminadas`, confirm the same soft-deleted gate remains hidden.
4. Repeat card and details checks in a mobile/tablet viewport.

## Cross-Cutting Concerns

- **Authentication:** PATCH copies the existing DELETE route's missing-token 400 response and bearer header; it deliberately has no Next-side role check.
- **API shape:** preserve the upstream envelope at the BFF boundary. The nullable update snapshot is distinct from both the create response and full list records.
- **Environment:** no new variable. The BFF proxy uses `BACKEND_URI`; this is unrelated to the external SAT lookup URI.
- **UI system:** Flowbite modal/button components and neutral gray action styling preserve the existing dashboard language and dark-mode behavior.

## Open Questions / Out-of-Scope Items

No unresolved questions block implementation.

Deliberately excluded:

- Edit fields, prefill, validation, dirty checking, submit button, `react-hook-form`, Yup, and reuse analysis for existing address/parcel forms.
- Calling `updateGuideDbCb` from React, a TanStack Query mutation, query invalidation, success messages, or backend-error notifications.
- Quote re-quote/edit support and adding `quote` or `notifyMe` to `UpdateGuideDbPayload`.
- Backend implementation, backend authorization changes, extra API variants, new environment variables, dependencies, telemetry, caching, or neighboring route refactors.
- Route-handler Jest coverage, per the repository's current testing convention and research deferral.
