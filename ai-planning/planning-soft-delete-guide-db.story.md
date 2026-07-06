# Planning — Soft Delete Guide DB (Regular User)

- **Source research doc:** `ai-research/soft-delete-guide-db.story.md`
- **Sign-off status:** Sign-offed (all open questions answered). Planning date: 2026-07-05.
- **Scope:** Add soft-delete UI + BFF route for regular users acting in `Ver mis guias`. Admin `Ver todas las guias` audit-only in this story.

## Assumptions carried from research

- Backend endpoint: `DELETE /guides/db/{kraft-id}` → HTTP 200 `{ version, message, error, data: { guide: { kraftId } } }`; non-2xx collapsed by BFF to `{ message }` 400.
- `kraftId` is URL-safe (`KFT-YYYYMM-NNNNNN`); BFF `encodeURIComponent` it as defensive default.
- Soft delete is only rendered in the `Ver mis guias` source (`ownDb`). `allDb` is view-only in this story.
- Success is silent (no toast); only the refetched list signals it. Errors use existing `useNotification` + `Notification` atom.
- Regular users never see the word "soft"; UI copy is plain "Eliminar".
- Pagination state (`dbPage`, `dbLimit`) is preserved on invalidation; an empty page after deleting the last item is acceptable (deferred to Story 5).

## Decisions made during planning (beyond research)

1. **BFF route shape:** Create a dynamic route file `src/app/api/guides-db/[kraftId]/route.ts` exporting only `DELETE`. Mirrors the backend path-parameter contract; keeps `src/app/api/guides-db/route.ts` untouched for GET/POST. Hard-delete (Story 5) will live in its own sibling and add its own route if needed — out of scope here.
2. **Icon button pattern:** Use the `AddressCard.tsx:70-73` pattern (`<Button color="red" outline>` with embedded `<RiDeleteBinLine size={18} />`) — already used in this repo with `@remixicon/react`. `GuideDbCard` currently uses a plain `<button>` styled with `primaryButtonCSS` for "Ver detalles"; the delete button uses Flowbite `Button` so it visually complements `Ver detalles`.
3. **Invalidation strategy:** `queryClient.invalidateQueries({ queryKey: ['guides', 'db'] })` only (single call). TanStack Query matches query keys by prefix, so this invalidates both `['guides', 'db', ...]` (regular) and `['guides', 'db', 'admin', ...]` (admin) regardless of which is active. The inactive query is also invalidated but only refetches on activation; the active one refetches immediately and drops the deleted record for both regular and admin sources.
4. **Mutation ownership:** `Order` owns the `useMutation` and `onSuccess` (invalidation, `onBack` from details). `GuideDbCard` and `GuideDbDetails` receive `onDeleteGuide(guide)` and only manage Modal open/close + confirm click. This keeps the card components free of query-client coupling and matches how `Order` already owns query state.

## Acceptance Criteria (from research)

1. A regular user (`user` or `admin`) acting in `Ver mis guias` can soft-delete a non-deleted Guides DB record from both `GuideDbCard` and `GuideDbDetails`. Soft delete is only rendered for guides owned by the current user (true by construction in `ownDb`).
2. Delete control hidden when `guide.deletedAt` is non-null.
3. Flowbite `Modal` confirmation with copy: title `¿Deseas eliminar esta guia?`, body `Esta acción no se puede deshacer.`, confirm `Eliminar`, cancel `Cancelar`.
4. UI calls new BFF `DELETE /api/guides-db/{kraftId}` proxying backend `DELETE /guides/db/{kraft-id}` with `getAccessToken()` + `Authorization: Bearer <token>`, mirroring existing `src/app/api/guides-db/route.ts` guard and error pattern. `kraftId` URL-encoded.
5. BFF forwards success envelope and returns `{ message }` with `400` on non-2xx (incl. any 4xx), matching existing error fallback.
6. On success the active Guides DB list query is invalidated (refetch removes the record from both regular and admin sources), and on `GuideDbDetails` it calls `onBack` to return to the list. No success notification. Errors use `useNotification` + `Notification`.
7. Delete control = Flowbite icon button with `RiDeleteBinLine` from `@remixicon/react` (already in repo).
8. Regular users see plain delete: no "soft" term, no admin hint, no hard-delete path.
9. Hard delete (`DELETE /guides/db/{kraft-id}/hard`) out of scope (Story 5).
10. Delete control only rendered in `Ver mis guias`. Admins viewing `Ver todas las guias` (others' guides) do not see a soft-delete control here.

## Affected files (grouped)

### `src/app/api/**`
- `src/app/api/guides-db/[kraftId]/route.ts` — **Create**. Dynamic route exporting `DELETE`.

### `src/shared/**`
- `src/shared/types/guides.types.ts` — **Modify**. Add `DeleteGuideDbResponse`.
- `src/shared/constants/guides.constants.ts` — **Modify**. Add `DELETE_GUIDE_DB_ENDPOINT` and modal-copy constants.
- `src/shared/utils/guides.utils.ts` — **Modify**. Add `deleteGuideDbCb`.

### `src/features/**`
- `src/features/Dashboard/subscreens/Order.tsx` — **Modify**. Add `useMutation` (`deleteGuideDbCb`), `onSuccess` invalidation + `onBack`; pass `onDeleteGuide` to `GuideDbCard` and `GuideDbDetails`.
- `src/features/Dashboard/subscreens/GuideDbCard.tsx` — **Modify**. Add Flowbite icon-button delete control (hidden when `deletedAt != null`) + Flowbite `Modal` confirmation; call `onDeleteGuide` on confirm.
- `src/features/Dashboard/subscreens/GuideDbDetails.tsx` — **Modify**. Add Flowbite icon-button delete control (hidden when `deletedAt != null`) + Flowbite `Modal` confirmation; call `onDeleteGuide` on confirm.

### `__tests__/**`
- `__tests__/feature/Dashboard/Order.test.tsx` — **Modify**. Extend the `guides.utils` jest.mock allowlist to include `deleteGuideDbCb`; add tests for soft-delete flow from list and details.
- `__tests__/feature/Dashboard/GuideDbCard.test.tsx` — **Create** (new file). Card-level delete control visibility + Modal confirm behavior.
- `__tests__/feature/Dashboard/GuideDbDetails.test.tsx` — **Create** (new file). Details delete control visibility + Modal confirm + `onDeleteGuide` invocation.

### Docs/config
- `REPO_CONTEXT.md` — **Modify** (optional). If the new dynamic DELETE route lands cleanly, add one row to the API Route Inventory noting `/api/guides-db/[kraftId]` `DELETE` proxy. Skip if it would duplicate Story 5's entry confusingly.

---

## Phase 1 — BFF DELETE route + shared callback/type/constant

Goal: backend proxy ready and callable from the client before any UI is touched. Independently testable via the callback contract (route-handler tests are uncommon in this repo, so coverage lives in the callback/UI tests per the research note).

### Changes Required

**`src/shared/types/guides.types.ts`** — Modify, near `CreateGuideDbResponse` (line ~332):

- Add:
  ```ts
  export type DeleteGuideDbResponse = {
    version: string;
    message: string | null;
    error: string | null;
    data: { guide: { kraftId: string } };
  };
  ```

**`src/shared/constants/guides.constants.ts`** — Modify:

- Near the existing endpoint constants (after `GET_GUIDES_DB_ENDPOINT`, line ~261), add `DELETE_GUIDE_DB_ENDPOINT = '/api/guides-db'` (the dynamic `/{kraftId}` segment is appended by the callback so the constant mirrors the collection base path used by `GET_GUIDES_DB_ENDPOINT`).
- Near the existing `GUIDES_DB_*` message constants (after line ~291), add Modal copy constants:
  - `GUIDES_DB_DELETE_MODAL_TITLE = '¿Deseas eliminar esta guia?'`
  - `GUIDES_DB_DELETE_MODAL_BODY = 'Esta acción no se puede deshacer.'`
  - `GUIDES_DB_DELETE_MODAL_CONFIRM = 'Eliminar'`
  - `GUIDES_DB_DELETE_MODAL_CANCEL = 'Cancelar'`

**`src/shared/utils/guides.utils.ts`** — Modify:

- Import `DELETE_GUIDE_DB_ENDPOINT` and `DeleteGuideDbResponse` at the top.
- Add next to `createGuideDbCb` (~line 134):
  ```ts
  export const deleteGuideDbCb = async (kraftId: string): Promise<DeleteGuideDbResponse> => {
    const res: AxiosResponse<DeleteGuideDbResponse> = await axios.delete(
      `${DELETE_GUIDE_DB_ENDPOINT}/${encodeURIComponent(kraftId)}`,
    );
    return res.data;
  };
  ```
- No try/catch: errors propagate to the mutation's `onError`, matching `createGuideDbCb`'s `throw error`.

**`src/app/api/guides-db/[kraftId]/route.ts`** — Create:

- `export async function DELETE(request: NextRequest, context: { params: { kraftId: string } })`.
- Mirror `src/app/api/ge-address/route.ts:68-97` delete shape with these specifics:
  - Read `await getAccessToken()`; missing → `NextResponse.json({ message: 'missing access token' }, { status: 400 })`.
  - Read `kraftId` from `context.params`; missing/empty → `NextResponse.json({ message: 'missing kraftId' }, { status: 400 })`.
  - URI: `${process.env.BACKEND_URI}/guides/db/${encodeURIComponent(kraftId)}`.
  - `axios.delete(uri, { headers: { Authorization: \`Bearer ${accessToken}\` } })`.
  - Success: `NextResponse.json(res.data, { status: 200 })` (forwards the backend `DeleteGuideDbResponse` envelope).
  - Error: identical to existing `guides-db/route.ts` catch (axios-aware branch + general branch both → `{ message }` 400).
- Imports: `NextRequest, NextResponse` from `next/server`, `axios, AxiosResponse` from `axios`, `getAccessToken` from `@/shared/lib/auth.lib`, `DeleteGuideDbResponse` from `@/shared/types/guides.types`, `GeneralError` from `@/shared/types/global.types`.

### Edge cases
- `context.params` is the dynamic-route parameter; in Next 14 it is accessed synchronously (no `.then`). Confirm shape against a sibling dynamic route at implementation time if any exists; otherwise the App Router convention for `[kraftId]` is `context.params.kraftId`.
- Mixed envelope: success returns the backend's `{ version, message, error, data: { guide: { kraftId } } }`, not a normalized `{ message }`. Callers must not assume `data.guide` has more than `kraftId`.

### Success Criteria
- Automated: `pnpm exec tsc --noEmit` (new dynamic route file + type additions type-check cleanly).
- `pnpm lint` over the new files.
- Manual: not applicable (no UI yet).

### Test coverage (described, not written)
- Route-handler tests are not common in this repo (per research). Coverage of the BFF contract is achieved via the `deleteGuideDbCb` mock + the UI tests in Phase 3. If the team prefers route-level tests, the smallest useful set is: success returns 200 forwarding the upstream envelope; missing access token → 400; missing `kraftId` → 400. This is optional and not required by ACs.

---

## Phase 2 — Wire mutation + confirmation Modal into `Order`, `GuideDbCard`, `GuideDbDetails`

Goal: the user can confirm deletion from both the card (list) and the details screen; `Order` invalidates and (from details) returns to the list.

> Phases 2 and 3 are presented as one phase because the mutation wiring and Modal UI are coupled — `Order` passes the delete handler down, and the card/details緒 render the Modal that calls it. Splitting them would produce an intermediate state that cannot be tested.

### Changes Required

**`src/features/Dashboard/subscreens/Order.tsx`** — Modify:

- Imports: add `useMutation` from `@tanstack/react-query`, `deleteGuideDbCb` from `@/shared/utils/guides.utils`, `GuideDbRecord` already imported.
- Inside the component, near the existing `useQuery` calls (~line 75):
  ```ts
  const deleteMutation = useMutation({
    mutationFn: (kraftId: string) => deleteGuideDbCb(kraftId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guides', 'db'] });
    },
    onError: () => {
      updateNotificationMessage('No se pudo eliminar la guía. Intenta nuevamente.');
      toggleNotification();
    },
  });
  ```
  Requires a `const queryClient = useQueryClient();` import (add `useQueryClient` from `@tanstack/react-query`).
- Add a handler:
  ```ts
  const handleDeleteGuide = (guide: GuideDbRecord) => {
    deleteMutation.mutate(guide.kraftId, {
      onSuccess: () => {
        if (selectedDbGuide) {
          setSelectedDbGuide(null); // = onBack: return to list after delete from details
        }
      },
    });
  };
  ```
  - Use the per-call `onSuccess` option to call `setSelectedDbGuide(null)` only when the user was viewing details (`selectedDbGuide` is non-null). The mutation-level `onSuccess` (invalidation) runs regardless.
- Pass `onDeleteGuide={handleDeleteGuide}` to both `<GuideDbCard>` (line ~386) and `<GuideDbDetails>` (line ~280). `allDb` passes the same prop; the card still must hide the control in that source (see below — `GuideDbCard`/`GuideDbDetails` source-gate the control by an `isOwned` prop, see below).

  Wait — research AC 10 says the delete control is only rendered in `Ver mis guias`. `allDb` should NOT show it. Decision per AC 10: do NOT pass `onDeleteGuide` in `allDb`. Pass `onDeleteGuide={undefined}` (or omit) when `selectedSource === 'allDb'`. The `GuideDbCard`/`GuideDbDetails` components already conditionally render based on `onDeleteGuide` presence. This satisfies AC 10 without a new boolean prop.

  Concretely: at the JSX sites, branch on `selectedSource`:
  - `GuideDbCard`: `onDeleteGuide={selectedSource === 'ownDb' ? handleDeleteGuide : undefined}`
  - `GuideDbDetails`: `onDeleteGuide={selectedSource === 'ownDb' ? handleDeleteGuide : undefined}`
  - `GuideDbDetails` is rendered for both `ownDb` and `allDb` (current code at line 279). With `onDeleteGuide = undefined` in `allDb`, the delete control stays hidden for admins viewing other users' guides.

- Error message text: reuse `GUIDES_DB_ERROR_MESSAGE` ('Ha sucedido un error. Intentelo nuevamente') for the notification, matching the existing list-error copy. Do not introduce a new constant. (Alternative: introduce `GUIDES_DB_DELETE_ERROR_MESSAGE` — skip per scope discipline; the existing message is user-facing adequate.)

**`src/features/Dashboard/subscreens/GuideDbCard.tsx`** — Modify:

- Imports: add `Button, Modal` from `flowbite-react`, `RiDeleteBinLine` from `@remixicon/react`, `useState` from `react`. Import the four new modal-copy constants from `@/shared/constants/guides.constants`.
- Add prop `onDeleteGuide?: (guide: GuideDbRecord) => void` to the component signature (optional; undefined hides the control).
- Add local `const [isConfirmOpen, setIsConfirmOpen] = useState(false)`.
- Replace the existing "Ver detalles" footer block (lines 81-90) with a flex row containing the existing `Ver detalles` button + a Flowbite icon Button rendered only when `onDeleteGuide` is provided AND `guide.deletedAt == null`:
  ```tsx
  <Button
    type="button"
    color="red"
    outline
    data-testid="guide-db-delete-button"
    onClick={() => setIsConfirmOpen(true)}
    className="inline-flex items-center gap-2"
    aria-label="Eliminar guía"
  >
    <RiDeleteBinLine size={18} />
  </Button>
  ```
- Add the Flowbite `Modal` at the end of the article:
  ```tsx
  <Modal show={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} size="sm" data-testid="guide-db-delete-modal">
    <Modal.Header>{GUIDES_DB_DELETE_MODAL_TITLE}</Modal.Header>
    <Modal.Body><p>{GUIDES_DB_DELETE_MODAL_BODY}</p></Modal.Body>
    <Modal.Footer>
      <Button color="red" data-testid="guide-db-delete-confirm" onClick={() => { setIsConfirmOpen(false); onDeleteGuide?.(guide); }}>{GUIDES_DB_DELETE_MODAL_CONFIRM}</Button>
      <Button color="gray" data-testid="guide-db-delete-cancel" onClick={() => setIsConfirmOpen(false)}>{GUIDES_DB_DELETE_MODAL_CANCEL}</Button>
    </Modal.Footer>
  </Modal>
  ```
- Hide the entire delete control (button + nothing else) when `guide.deletedAt != null`. The existing deleted banner (lines 91-99) stays unchanged.

**`src/features/Dashboard/subscreens/GuideDbDetails.tsx`** — Modify:

- Same imports as `GuideDbCard` (`Button`, `Modal`, `RiDeleteBinLine`, `useState`, modal-copy constants).
- Add prop `onDeleteGuide?: (guide: GuideDbRecord) => void` to `GuideDbDetailsProps`.
- Add local `isConfirmOpen` state.
- Place the delete icon button in the existing header row (line ~57 `<div className="flex items-center justify-between">`), as a sibling to the back button, right-aligned. Render only when `onDeleteGuide` is provided AND `guide.deletedAt == null`.
- Add the same `Modal` at the end of the `<section>` (after the existing deleted banner block, lines 209-220). Confirm click calls `onDeleteGuide?.(guide)`.
- The existing deleted banner section (lines 209-220) stays unchanged. When `deletedAt != null` the delete button is hidden and the banner shows.

### Edge cases
- Client/server boundary: `Order`, `GuideDbCard`, `GuideDbDetails` are already client components via the dynamic import in `src/app/dashboard/page.tsx`. No new `'use client'` directive needed for the cards themselves, but confirm `GuideDbCard.tsx` and `GuideDbDetails.tsx` already rely on hooks/state — `GuideDbCard` currently has no hooks; adding `useState` means it must be a client component. The dashboard dynamically imports `Dashboard` with `ssr: false`, so the entire subtree is client-rendered; adding `useState` is safe without a new directive at the top of `GuideDbCard.tsx` (its parent `Order` is the client boundary). If `pnpm lint` flags it, add `'use client'` to `GuideDbCard.tsx` only.
- Mobile/tablet vs desktop: `Order` is used in both branches of `Dashboard.tsx` via `useMediaQuery`. The `Modal` is responsive by default (Flowbite). The delete icon button is the same size in both layouts. No separate mobile rendering needed.
- Inactive `allDb` query invalidation: `invalidateQueries({ queryKey: ['guides', 'db'] })` invalidates both `ownDb` and `allDb` queries by prefix match. The inactive `allDb` refetch only fires when the admin navigates back to that source, which is correct.
- Deleting from details: `selectedDbGuide` is non-null, so per-call `onSuccess` calls `setSelectedDbGuide(null)` → list view re-renders → invalidation-driven refetch removes the row. This matches AC 6.
- Deleting the last item on a page: `dbPage` does not decrement; the user may see the empty-state message. Accepted per research; deferred to Story 5.
- Notification during pending mutation: do not disable the delete button while pending. Flowbite Modal closes on confirm click; the user can click again and the mutation queues. Acceptable for this story; if duplicate-fires become an issue, defer a debounce to Story 5.

### Success Criteria
- Automated:
  - `pnpm test -- __tests__/feature/Dashboard/Order.test.tsx`
  - `pnpm test -- __tests__/feature/Dashboard/GuideDbCard.test.tsx`
  - `pnpm test -- __tests__/feature/Dashboard/GuideDbDetails.test.tsx`
  - `pnpm test` (full run; broad coverage across dashboard + guides).
  - `pnpm exec tsc --noEmit`.
  - `pnpm lint`.
- Manual:
  - Desktop: log in as `user`, go to `Ver mis guias`, click the trash icon on a non-deleted guide, see the Spanish confirm Modal with `¿Deseas eliminar esta guia?` / `Esta acción no se puede deshacer.` / `Eliminar` / `Cancelar`. Click `Eliminar`. List refetches; the row disappears. No toast.
  - Desktop: open a guide's details (`Ver detalles`), click the trash icon, confirm. UI returns to the list; the row is gone after refetch.
  - Admin: go to `Ver todas las guias`, confirm no delete button on any card or details screen.
  - Verify a guide with `deletedAt` already set shows no delete button (only the deleted banner) — if such a guide is visible via `includeDeleted`.
  - Trigger a backend error (kill backend or send a bad `kraftId`): notification shows `Ha sucedido un error. Intentelo nuevamente`; the row remains.
  - Mobile/tablet viewport: confirm the Modal and the icon button render correctly.

### Test coverage (described, not written)

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `__tests__/feature/Dashboard/Order.test.tsx` | (1) Regular user soft-deletes from list: confirm Modal opens, `deleteGuideDbCb` invoked with correct `kraftId`, on success `queryClient.invalidateQueries({ queryKey: ['guides', 'db'] })` is observable (refetch the list mock, assert the deleted record is gone). (2) Soft-delete from details: after success `selectedDbGuide` cleared → list view restored (assert `guide-db-details-header` gone, `guide-db-details-button` present). (3) Error path: `deleteGuideDbCb` rejects → `Notification` shows `Ha sucedido un error. Intentelo nuevamente`. (4) Admin `allDb` source: no `guide-db-delete-button` rendered on any card or details screen. (5) Existing tests still pass with the extended jest.mock. | Existing `Order.test.tsx` jest.mock pattern at lines 11-22 (`...jest.requireActual(...), getGuidesCb: jest.fn(), getGuidesDbCb: jest.fn()`); add `deleteGuideDbCb: jest.fn()` to the allowlist. Reuse `createMockDbRecord`/`createMockDbResponse` helpers already in the file. `userEvent` for clicks. |
| `__tests__/feature/Dashboard/GuideDbCard.test.tsx` (new) | (1) Delete button hidden when `deletedAt != null`. (2) Delete button hidden when `onDeleteGuide` is undefined (admin `allDb` projection). (3) Delete button visible when `onDeleteGuide` provided and `deletedAt == null`. (4) Clicking the button opens the Modal; Modal shows the four Spanish copy strings. (5) Confirming calls `onDeleteGuide(guide)` with the exact `GuideDbRecord` passed in; cancelling does not. | Testing Library `render` + `screen.getByRole`/`getByTestId` (`guide-db-delete-button`, `guide-db-delete-modal`, `guide-db-delete-confirm`, `guide-db-delete-cancel`). `userEvent.click`. No router or query provider needed — `GuideDbCard` is a pure presentational component (no `useQuery`). Construct a `GuideDbRecord` fixture matching `GuideDbRecord` type, mirroring the `createMockDbRecord` helper in `Order.test.tsx`. |
| `__tests__/feature/Dashboard/GuideDbDetails.test.tsx` (new) | (1) Delete button visible when `onDeleteGuide` provided and `deletedAt == null`; hidden when `deletedAt != null` (banner still shows). (2) Hidden when `onDeleteGuide` undefined. (3) Modal opens on click; confirming calls `onDeleteGuide(guide)`. (4) `Volver a guías` back button unchanged (existing `guide-db-details-back-button`). | Same pattern as `GuideDbCard.test.tsx`. `GuideDbDetails` is presentational; no query/router provider needed. Fixture must include `createdAt`/`updatedAt`/`updatedAt` valid ISO strings (the component does `new Date(...)`). |

### Test rules to honor (from `.github/copilot-instructions.md`)
- Use `userEvent`, not `fireEvent`.
- Do not mock `GuideDbCard`/`GuideDbDetails` from `@/features` — render real components.
- Mock the network callback `deleteGuideDbCb` (relative import in `jest.mock`) in `Order.test.tsx`; do NOT mock it in the new card/details tests (they receive `onDeleteGuide` as a plain jest.fn prop).
- Use `screen.getByRole`/`getByTestId`/`getByText`; no `querySelector`/`getElementById`.
- Mock data must match real shapes — `DeleteGuideDbResponse` is `{ version, message, error, data: { guide: { kraftId } } }`.
- Named exports only for mocks; no default exports.
- No file extensions in import statements.
- Preserve any pre-existing `it.skip`/`test.skip` in `Order.test.tsx`.

---

## Cross-cutting concerns

- **Auth cookies:** The new BFF route uses `getAccessToken()` exactly like the existing `guides-db/route.ts`; no new cookie reads on the client.
- **`product-sat` / external URI:** Not affected.
- **Dashboard mobile/tablet branch:** `Order` is rendered in both; the Flowbite `Modal` is responsive; the icon button is the same in both layouts. No per-branch changes.
- **Env vars:** No new ones; the BFF uses `BACKEND_URI`.
- **API response shape:** Success forwards the backend `DeleteGuideDbResponse` envelope; error collapses to `{ message }` 400. Mixed envelope expected — consistent with existing `guides-db/route.ts` semantics.
- **Query keys:** `['guides', 'db', ...]` (regular) and `['guides', 'db', 'admin', ...]` (admin). Both share the prefix `['guides', 'db']`; one `invalidateQueries` call covers both. This obviates any need to enumerate every admin key.

## Open questions / Out-of-scope items

- **Out of scope:** Hard delete (`DELETE /guides/db/{kraft-id}/hard`) — Story 5. Do not add that route, even as a stub.
- **Out of scope:** Admin soft-delete from `Ver todas las guias` (other users' guides). The admin `allDb` audit source is view-only in this story.
- **Out of scope:** Smart pagination decrement when deleting the last item on a page (deferred to Story 5 per research).
- **Out of scope:** Success notification/toast. Success is silent.
- **Out of scope:** Route-handler unit tests for the BFF. Not common in this repo; callback + UI tests cover the contract. If the team wants them, they should be added in a follow-up test-only story.
- **Out of scope:** A separate danger-button shared component. The `AddressCard` `<Button color="red" outline>` + `RiDeleteBinLine` inline pattern is reused; no new shared UI primitive is created.
- **Open (deferred):** Whether the hard-delete route (Story 5) should live in the same dynamic file as `src/app/api/guides-db/[kraftId]/route.ts` or a sibling like `src/app/api/guides-db/[kraftId]/hard/route.ts`. Not decided here; Story 5 research owns it. This plan's `DELETE` handler at `[kraftId]/route.ts` does not preclude either choice.