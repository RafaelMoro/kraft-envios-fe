# Hard Delete Guide DB (Admin) - Research Story

## Story Definition

### Story Title

Hard Delete Guide DB for admin users.

### Story Description

Extend the existing soft-delete flow to allow an admin user to escalate a delete to a hard delete directly from the confirmation modal. Hard delete permanently removes the record from the database (no soft-delete audit trail remains). The escalation is gated by a checkbox inside the existing `GuideDbDeleteModal`: when the admin checks `Eliminar esta guia permanentemente?`, the modal copy and the delete endpoint switch to hard delete. Non-admins never see the checkbox or hit the hard-delete endpoint.

The hard-delete BFF route role-guards against non-admin callers (defensive layer in addition to backend authorization) and proxies the backend `DELETE /guides/db/{kraft-id}/hard` endpoint, mirroring the existing soft-delete BFF.

Hard delete is offered to admins in **both** the `Ver mis guias` and `Ver todas las guias` sources. Non-admin users see the soft-delete flow exactly as the soft-delete story ships it.

This research is a story note only. It does not plan implementation or include source code changes.

This story is Story 5 of the Guides DB epic (`ai-research/guides-db-epic.md:76-92`). It extends the soft-delete story (`ai-research/soft-delete-guide-db.story.md`) and the admin-list story (`ai-research/admin-all-guides-db-list.story.md`).

### Acceptance Criteria

1. Admin users can hard-delete a Guides DB record from both `Ver mis guias` and `Ver todas las guias` sources through both `GuideDbCard` (list) and `GuideDbDetails` (details screen). The delete control (Flowbite icon button using `RiDeleteBinLine`) is rendered in both sources for all users with delete access; the hard-delete escalation is gated separately.
2. The hard-delete escalation is gated by `userInfo.data.user.role.includes('admin')`. Non-admins never see the `Eliminar esta guia permanentemente?` checkbox and never call the hard-delete endpoint. The checkbox is rendered only for admins and only inside the existing `GuideDbDeleteModal`.
3. The UI calls a new BFF `DELETE` route at `/api/guides-db/{kraftId}/hard` when the admin confirms with the checkbox checked. The BFF proxies `DELETE /guides/db/{kraft-id}/hard` on the backend, uses `getAccessToken()` and `Authorization: Bearer <token>`, role-guards via `getUserInfo()` (returns 403 when the caller is not an admin), and otherwise follows the same `{ message }` 400 error fallback as the soft-delete BFF (`src/app/api/guides-db/[kraftId]/route.ts`).
4. The backend returns the same response envelope as soft delete (`{ version, message, error, data: { guide: { kraftId } } }` with HTTP 200) on success. The BFF forwards that envelope on success. The existing `DeleteGuideDbResponse` type is reused unchanged.
5. When the admin checks the `Eliminar esta guia permanentemente?` checkbox, the modal title, body, and primary confirm-button copy change to the hard-delete copy (proposed below in UI/II). When the checkbox is unchecked, the modal is identical to the soft-delete modal that the soft-delete story ships (`¿Deseas eliminar esta guia?` / `Esta acción no se puede deshacer.` / `Eliminar` / `Cancelar`).
6. On success the UI invalidates the active Guides DB list query keys (the shared `['guides', 'db']` prefix covers both regular and admin lists, including the `includeDeleted` admin variant) and stays on the list. From `GuideDbDetails`, success invokes `onBack` to return to the list. No success notification; the refetched list is the only signal of success (mirrors the soft-delete story). Errors use the existing `useNotification` + `Notification` atom pattern.
7. Hard delete is allowed on both live records and already-soft-deleted records in one call. The hard-delete control/checkbox is not gated on `guide.deletedAt`. Live and soft-deleted admin-visible records both expose the hard-delete escalation to admins.
8. An admin can hard-delete any admin-visible guide, regardless of whether the current admin owns it (i.e., `Ver todas las guias` rows owned by other users are hard-deletable by the admin).
9. Backend authorization still enforces admin-only hard delete; the BFF role-guard is a defensive layer, not the primary security boundary.
10. The BFF returns 403 when a non-admin caller hits the hard-delete route (e.g., via a stale role cookie or hand-crafted request). The 403 follows the existing `{ message }` error shape.

### Why This Exists

Admins need a way to permanently remove a Guides DB record (e.g., a `status: failed` record, or a soft-deleted record that must be purged). Soft delete leaves the row in the DB with `deletedAt`; hard delete is the only way to actually remove the row. The soft-delete story intentionally deferred hard delete. This story adds the admin-only hard-delete escalation by extending the soft-delete modal with a checkbox, keeping the existing icon and soft-delete flow intact for non-admins.

The escalation-inside-the-modal pattern (rather than a second icon button) avoids adding a second control to the card and details screens and keeps the destructive action consolidated under one Flowbite Modal.

### Task Breakdown

This story is small enough to live in a single planning phase. High-level work:

- Add a BFF `DELETE` route handler at `src/app/api/guides-db/[kraftId]/hard/route.ts` that proxies `DELETE /guides/db/{kraft-id}/hard` and role-guards via `getUserInfo()`.
- Add a `hardDeleteGuideDbCb(kraftId)` callback in `src/shared/utils/guides.utils.ts`.
- Extend `GuideDbDeleteModal` to accept an `isAdmin` flag, render the `Eliminar esta guia permanentemente?` checkbox for admins, and propagate the checkbox state to the confirm callback.
- Add hard-delete copy constants in `src/shared/constants/guides.constants.ts` used only when the admin checkbox is checked.
- In `Order.tsx`, add a hard-delete `useMutation`, wire `handleDeleteGuide` to branch on the checkbox state (soft vs hard), and pass `isAdmin` (derived from `userInfo.data.user.role.includes('admin')`) into `GuideDbCard` and `GuideDbDetails` so the checkbox is rendered for admins in both sources.
- Invalidate `['guides', 'db']` on success regardless of soft or hard; show a notification only on error.
- Add unit tests covering admin checkbox visibility, hard-delete endpoint call, BFF role-guard, success invalidation, and non-admin hiding.

## Technical Research

### Affected Areas

Routes/pages:

- `src/app/dashboard/page.tsx` only renders the dashboard; no change needed.
- `src/features/Dashboard/Dashboard.tsx` already passes `userInfo` down to `Order`; no change needed for hard delete itself.

API route handlers:

- `src/app/api/guides-db/[kraftId]/route.ts` is the existing soft-delete BFF. It reads `kraftId` from `context.params`, guards with `getAccessToken()`, `encodeURIComponent`s the id, forwards to `${BACKEND_URI}/guides/db/{kraftId}` with `Authorization: Bearer <token>`, returns upstream `DeleteGuideDbResponse` envelope with 200, and falls back to `{ message }` 400 on any non-2xx.
- The hard-delete BFF route lives at `src/app/api/guides-db/[kraftId]/hard/route.ts` (Next nested dynamic route) and mirrors that handler except for two differences:
  - Upstream URI appends `/hard`: `DELETE ${BACKEND_URI}/guides/db/${encodeURIComponent(kraftId)}/hard`.
  - Adds a role-guard via `getUserInfo()` (from `src/shared/lib/auth.lib.ts:55-68`); returns `NextResponse.json({ message: 'admin only' }, { status: 403 })` when `userInfo?.data?.user?.role` does not include `'admin'`. Missing `getUserInfo()` (no cookie) is also a 403. The same `Array.isArray(...) && role.includes('admin')` pattern from `src/shared/ui/organisms/Aside.tsx:19` and `Order.tsx:64` is reused.
- The soft-delete BFF stays untouched. The hard-delete BFF is a new sibling file.

Feature UI:

- `src/features/Dashboard/subscreens/Order.tsx` already derives `isAdmin` (line 64) and owns the soft-delete `useMutation`. Add a hard-delete `useMutation` and update `handleDeleteGuide` to accept a `permanent: boolean` flag. When `permanent === true && isAdmin`, call `hardDeleteGuideDbCb`; otherwise call `deleteGuideDbCb`. Pass `isAdmin` down to `GuideDbCard` and `GuideDbDetails` so the modal renders the checkbox. The `useMutation`'s `onSuccess` invalidates `['guides', 'db']` for both soft and hard, and the optional `onSuccess` inner callback calls `onBack` from details (mirroring the soft-delete story's pattern at `Order.tsx:228-236`).
- `src/features/Dashboard/subscreens/GuideDbCard.tsx` accepts an optional `isAdmin` prop. When `isAdmin`, the modal renders the checkbox. The `onDeleteGuide` prop's signature changes to `onDeleteGuide(guide, permanent: boolean)`.
- `src/features/Dashboard/subscreens/GuideDbDetails.tsx` mirrors the same `isAdmin` prop and updated `onDeleteGuide` signature.
- `src/features/Dashboard/subscreens/GuideDbDeleteModal.tsx` is the shared confirmation modal. It gains:
  - An optional `isAdmin?: boolean` prop. When true, render a Flowbite `Checkbox` (with bold label `Eliminar esta guia permanentemente?`) inside `ModalBody` between the body copy and the footer.
  - The confirm button's `onClick` calls `onConfirm(permanent)`. Cancel still closes without calling `onConfirm`.
  - When `permanent === true`, the title, body, and confirm button copy switch to the hard-delete copy. When `permanent === false`, the modal matches the existing soft-delete copy verbatim. The cancel button is unchanged.
- `src/features/Dashboard/subscreens/GuideDbDeleteModal.tsx` is the only modal file; no sibling is added.

Shared code:

- `src/shared/utils/guides.utils.ts` hosts `deleteGuideDbCb`. Add `hardDeleteGuideDbCb(kraftId)` next to it, hitting `${DELETE_GUIDE_DB_ENDPOINT}/${encodeURIComponent(kraftId)}/hard`. Reuse `DELETE_GUIDE_DB_ENDPOINT = '/api/guides-db'` from `src/shared/constants/guides.constants.ts:262`.
- `src/shared/constants/guides.constants.ts` hosts the soft-delete modal copy (`GUIDES_DB_DELETE_MODAL_*`). Add parallel hard-delete copy constants, used only when the admin checkbox is checked:
  - `GUIDES_DB_HARD_DELETE_MODAL_TITLE` = `¿Eliminar permanentemente esta guía?`
  - `GUIDES_DB_HARD_DELETE_MODAL_BODY` = `Esta acción removerá el registro de la base de datos de forma permanente. No se puede deshacer.`
  - `GUIDES_DB_HARD_DELETE_MODAL_CONFIRM` = `Eliminar permanentemente`
  - `GUIDES_DB_HARD_DELETE_MODAL_CANCEL` = `Cancelar` (reuses the soft-delete cancel; no new constant required, or `GUIDES_DB_DELETE_MODAL_CANCEL` is shared)
- `src/shared/types/guides.types.ts` `DeleteGuideDbResponse` is reused as-is for hard delete (same envelope shape per AC 4).
- `src/shared/hooks/useNotification.tsx` already powers `Order`'s notification flow; reuse it for hard-delete error feedback (no success notification per AC 6).

Tests:

- `__tests__/feature/Dashboard/Order.test.tsx` already mocks `deleteGuideDbCb` and `getGuidesDbCb`, wraps `Order` in `QueryClientProvider`, mocks `useMediaQuery`, and has both regular and admin `mockUserInfo` fixtures (from the soft-delete and admin-list stories). Extend with: mock `hardDeleteGuideDbCb`; an admin checkbox-checked test asserting `hardDeleteGuideDbCb` is called; an admin checkbox-unchecked test asserting `deleteGuideDbCb` is called; a non-admin test asserting the checkbox is not rendered and only `deleteGuideDbCb` is called.
- `__tests__/feature/Dashboard/GuideDbCard.test.tsx` extends with: an admin (`isAdmin={true}`) test that asserts the checkbox is rendered and that `onDeleteGuide(guide, true)` is called when the checkbox is checked before confirming; a non-admin test that asserts the checkbox is not rendered.
- `__tests__/feature/Dashboard/GuideDbDetails.test.tsx` mirrors the same checkbox tests for the details screen, plus an on-back-after-hard-delete test.

### Existing Patterns To Follow

App Router and client split:

- Keep the hard-delete mutation in a client component under `src/features/**`; never call `${BACKEND_URI}` directly from the client.
- Keep the backend proxy in a route handler under `src/app/api/**/route.ts`. The hard-delete BFF adds a Next-side role-guard, which is a new pattern in this repo (existing BFFs are pass-through). Document this in code as `// ponytail: defensive guard, backend authorization is the source of truth`.

TanStack Query:

- Use a second `useMutation` for hard delete, matching `Order`'s existing soft-delete `useMutation`. A single `useMutation` whose `mutationFn` branches on the `permanent` flag is an alternative and is the smaller diff; either is acceptable, defer to planning.
- Invalidate `['guides', 'db']` on success (the shared prefix covers both regular and admin list query keys, including the `includeDeleted` admin variant). Use `queryClient.invalidateQueries({ queryKey: ['guides', 'db'] })` — the exact same invalidation the soft-delete story uses (`Order.tsx:106`).

Route handler proxy style:

- `src/app/api/guides-db/[kraftId]/route.ts` is the closest DELETE handler. The hard-delete BFF clones its shape and adds a role-guard.
- Role-guard pattern: `const userInfo = await getUserInfo()`; check `Array.isArray(userInfo?.data?.user?.role) && userInfo.data.user.role.includes('admin')`; on false, return `NextResponse.json({ message: 'admin only' }, { status: 403 })`. This is the same pattern `Aside.tsx:19` and `Order.tsx:64` use, just inside a route handler.
- The `getUserInfo()` helper in `src/shared/lib/auth.lib.ts:55-68` reads the httpOnly `user-info` cookie via `next/headers`'s `cookies()`. It is server-only and returns `LoginData` (from `src/shared/types/login.types.ts`). The cookie is set on login by `/api` route handler.

Flowbite React:

- Reuse `Modal`, `Button`, and add `Checkbox` for the admin escalation. All three are part of the existing Flowbite React surface already in use.

Forms:

- Not applicable; delete is a single mutation, not a form.

Styling:

- Tailwind v4 only. Reuse existing danger styling for the hard-delete confirm button. The checkbox label is bold to satisfy the "bold" copy requirement in UI/I.

### Testing Rules To Follow

Project-specific rules from `.github/copilot-instructions.md`:

- Use `userEvent` not `fireEvent` for the modal confirm click and the checkbox toggle.
- Do not mock internal components from `@/features` or `@/shared`; render `GuideDbCard` and `GuideDbDetails` as-is.
- Mock `hardDeleteGuideDbCb` (a network callback) via `jest.mock` of `src/shared/utils/guides.utils` with relative import, mirroring the existing `Order.test.tsx` mock at line 12-17. Add `hardDeleteGuideDbCb: jest.fn()` to the mock.
- Do not mock `next/image`.
- Do not use `document.querySelector`/`getElementById`; use semantic queries or `data-testid`. The new checkbox uses `data-testid="guide-db-hard-delete-checkbox"`. The existing soft-delete confirm button (`guide-db-delete-confirm`) is reused; when the checkbox is checked, the same button's label changes but its `data-testid` is unchanged. This means tests must assert on the button's text content (or visible label) to distinguish soft vs hard confirmation; a separate `data-testid` (e.g., `guide-db-hard-delete-confirm`) is a planning-phase option.
- Do not assert styling/classes (note: the "bold" label is a copy / accessibility requirement, not a styling assertion; render the label as `<strong>` or with a Flowbite `font-semibold`/`font-bold` Tailwind class, do not assert on the class).
- Preserve any `it.skip()` / `test.skip()`.
- Mock data must match the real backend response shape: `{ version, message, error, data: { guide: { kraftId } } }` (reuse `DeleteGuideDbResponse`).

Smallest useful tests:

- BFF route (if route-handler tests are added): success returns 200 with the upstream envelope; missing access token returns 400; missing `kraftId` returns 400; non-admin caller returns 403; upstream 4xx/5xx returns `{ message }` 400. Route-handler tests are not common in this repo; defer to planning unless team requests them.
- `Order`: admin in either source sees the checkbox; non-admin never sees the checkbox; checking the checkbox and confirming calls `hardDeleteGuideDbCb` with the correct `kraftId`; unchecking and confirming calls `deleteGuideDbCb`; on success (either path) `['guides', 'db']` is invalidated; on error the existing notification is shown; from details, `onBack` is invoked on success.
- `GuideDbCard`/`GuideDbDetails`: checkbox renders only when `isAdmin={true}`; confirm without checkbox calls `onDeleteGuide(guide, false)`; confirm with checkbox calls `onDeleteGuide(guide, true)`.

### Edge Cases And Constraints

- Existing BFF routes return mixed envelopes; the hard-delete BFF returns the backend's `{ version, message, error, data: { guide: { kraftId } } }` envelope on success and `{ message }` 400 on upstream non-2xx, plus `{ message }` 403 for non-admin callers. This is consistent with the soft-delete BFF and the existing `{ message }` error fallback.
- Missing session token currently returns 400, not 401; follow the existing pattern (no session → 400, not 403). The 403 is reserved for "session present, role not admin".
- `GuideDbRecord.deletedAt` is null on live records and non-null on soft-deleted records. Per AC 7, the hard-delete escalation is NOT gated on `deletedAt`; admins see the checkbox on both live and soft-deleted records. Live records are hard-deletable in one call.
- An admin can hard-delete any admin-visible guide, including guides owned by other users in `Ver todas las guias`. There is no ownership check in the UI for the hard-delete escalation.
- A guide `status: failed` is a valid Guides DB record and is hard-deletable like any other.
- Pagination (`dbPage`, `dbLimit`) is preserved across invalidation; if the last item on a page is hard-deleted, the page may now be empty. The user sees the empty state. "Decrement page when empty" behavior was deferred by the soft-delete story; hard delete inherits the same behavior.
- Mobile/tablet vs desktop rendering in `Order`/`Dashboard` both use `GuideDbCard` and `GuideDbDetails`; the hard-delete checkbox must work in both layouts.
- `product-sat` uses `NEXT_PUBLIC_GET_SAT_PRODUCT_URI`, not `BACKEND_URI`; not affected here.
- Tests always collect coverage into `coverage/`; do not run tests during research.
- The BFF role-guard reads the httpOnly `user-info` cookie via `getUserInfo()`. The cookie is set on login; if it is stale (role demoted after login) the guard may pass for a user who is no longer admin. The backend remains the source of truth (AC 9).
- The new BFF role-guard is the first Next-side role check in any route handler. Existing BFFs are pass-through. This is intentional defensive depth, not a precedent to retrofit into other routes. Mark with a `// ponytail:` comment.

### Dependencies And Integration Points

- No new dependencies. Flowbite `Modal`, `Button`, `Checkbox`, `@remixicon/react` `RiDeleteBinLine`, TanStack Query, and `axios` are all already installed and in use.
- No new env vars. Backend hard-delete endpoint is served by `BACKEND_URI`.
- Cross-feature integration: only `Order` (`Ver mis guias` and `Ver todas las guias` sources) is affected. External guide list, `Crear guía`, and other dashboard subscreens are untouched.
- The hard-delete escalation reuses the existing `GuideDbDeleteModal`; no new modal file. The soft-delete flow stays available to non-admins and is identical to what the soft-delete story ships.

## Open Questions

All previously open questions are now answered.

Backend contract:

- I: Question: Does the backend hard-delete endpoint require the record to be soft-deleted first (`deletedAt != null`) before allowing hard delete, or can a live record be hard-deleted directly in one call?
  - Status: answered
  - Answer: A live record can be hard-deleted directly in one call. The hard-delete endpoint does not require a prior soft delete.
  - Context: Drives AC 7: the UI checkbox is not gated on `deletedAt`. Live and soft-deleted admin-visible records both expose the hard-delete escalation.
- II: Question: Does the backend return the same `{ version, message, error, data: { guide: { kraftId } } }` envelope for hard delete, including 4xx error cases?
  - Status: answered
  - Answer: Yes, the same envelope for success and 4xx errors.
  - Context: `DeleteGuideDbResponse` is reused. BFF forwards the upstream envelope on success and collapses any non-2xx to `{ message }` 400.
- III: Question: Can an admin hard-delete any guide shown in `Ver todas las guias` (including guides owned by other users), or only their own guides?
  - Status: answered
  - Answer: An admin can hard-delete any guide, theirs or someone else's.
  - Context: AC 8: the UI does not perform an ownership check on the hard-delete escalation in the admin source.
- IV: Question: Does hard delete return non-2xx for a record that is already hard-deleted (idempotency), and how should the UI treat that?
  - Status: answered
  - Answer: 4xx error, "guide not found" semantics, the same envelope as other 4xx cases.
  - Context: BFF collapses it to `{ message }` 400. The list refetch removes the record on success, so a re-delete should not happen from the regular flow.

UI/product decisions:

- I: Question: Should the hard-delete confirmation modal reuse the existing `GuideDbDeleteModal` with stronger copy prop, or add a sibling `GuideDbHardDeleteModal`?
  - Status: answered
  - Answer: Reuse `GuideDbDeleteModal`. Add the option as a bold checkbox labeled `Eliminar esta guia permanentemente?`.
  - Context: Single modal file. The checkbox appears only for admins. When checked, the modal copy and the delete endpoint switch to hard delete.
- II: Question: What copy should the hard-delete confirmation use (title, body, confirm button, cancel button)?
  - Status: answered
  - Answer: Default (checkbox unchecked) copy matches the soft-delete modal verbatim. When the checkbox is checked, the title, body, and primary confirm-button copy change to the hard-delete copy. Proposed hard-delete copy:
    - Title: `¿Eliminar permanentemente esta guía?`
    - Body: `Esta acción removerá el registro de la base de datos de forma permanente. No se puede deshacer.`
    - Confirm: `Eliminar permanentemente`
    - Cancel: `Cancelar` (unchanged)
  - Context: Final copy is a product call; this is a reasonable starting point consistent with the soft-delete modal's Spanish voice and the epic's "explicit warning copy" requirement.
- III: Question: Should the hard-delete control be a second icon button alongside the soft-delete button, or should admins see only the hard-delete control in `Ver todas las guias`?
  - Status: answered
  - Answer: Same icon (`RiDeleteBinLine`). The flow diverges inside the modal based on the checkbox.
  - Context: A single icon button + a checkbox-driven modal avoids adding a second control to the card/details and consolidates the destructive action under one Flowbite Modal.
- IV: Question: Should the hard-delete control be visually distinguishable from the soft-delete control beyond modal copy (e.g., a different icon, a "Permanent" label, a stronger button color)?
  - Status: answered
  - Answer: Distinction is in the modal copy only (title, body, primary button verbiage). No new icon, no new button color, no separate control.
  - Context: The icon and the entry-point control are shared with the soft-delete flow. The escalation is the checkbox; the copy is what changes.

Authorization:

- I: Question: Does the backend hard-delete endpoint enforce admin-only authorization on every call, regardless of who owns the guide?
  - Status: answered
  - Answer: Yes, the backend enforces admin-only.
  - Context: AC 9. The BFF role-guard is defensive depth, not the primary security boundary.
- II: Question: Should the Next BFF hard-delete route also guard against non-admin callers (defensive), or rely entirely on backend authorization?
  - Status: answered
  - Answer: Yes, the BFF should guard against non-admin callers.
  - Context: AC 3 + AC 10. The BFF reads `getUserInfo()` and returns 403 when the role is not admin. This is a new pattern in this repo (existing BFFs are pass-through) and is the only route that does Next-side role-checking; mark with a `// ponytail:` comment so it does not get retrofitted elsewhere.

Hard delete flow:

- I: Question: After a successful hard delete, should the UI show a success notification (unlike soft delete, which is silent)?
  - Status: answered
  - Answer: Silent on success. Show a notification only on error.
  - Context: AC 6. Mirrors the soft-delete flow exactly.

## Assumptions

- The backend hard-delete endpoint is `DELETE /guides/db/{kraft-id}/hard`, returns HTTP 200 with `{ version, message, error, data: { guide: { kraftId } } }` on success, and returns a 4xx error envelope on failure (e.g., "guide not found" for an already-hard-deleted record). The success envelope matches soft delete; the `DeleteGuideDbResponse` type is reused unchanged.
- The BFF route lives at `src/app/api/guides-db/[kraftId]/hard/route.ts` (Next nested dynamic route), mirrors `src/app/api/guides-db/[kraftId]/route.ts` for the proxy/header/envelope/error-fallback, and adds a Next-side role-guard via `getUserInfo()`. Missing session → 400 (existing pattern); non-admin caller → 403 with `{ message: 'admin only' }`. The 403 follows the existing `{ message }` error shape.
- The BFF role-guard is the only Next-side role check in this repo. Existing BFFs are pass-through. The guard is a defensive layer; the backend remains the source of truth. Marked with a `// ponytail:` comment in the implementation.
- Hard delete is offered to admins in **both** `Ver mis guias` and `Ver todas las guias` sources. The checkbox is rendered only when the caller is admin; the soft-delete copy + endpoint is what non-admins see, and is what admins see when the checkbox is unchecked.
- A live record can be hard-deleted directly in one call; the UI does not gate the hard-delete escalation on `guide.deletedAt`. Both live and soft-deleted admin-visible records expose the checkbox.
- An admin can hard-delete any admin-visible guide, including guides owned by other users in `Ver todas las guias`. There is no ownership check in the UI.
- The hard-delete escalation is a Flowbite `Checkbox` (bold label `Eliminar esta guia permanentemente?`) inside the existing `GuideDbDeleteModal`. When checked, the title, body, and primary confirm-button copy change to the hard-delete copy; the cancel button is unchanged. The icon, the entry-point button, and the modal chrome are unchanged.
- The `onDeleteGuide(guide, permanent: boolean)` signature is updated everywhere it is called; non-admin callers always pass `permanent=false`. The hard-delete callback (`hardDeleteGuideDbCb`) is only invoked when `permanent === true && isAdmin`.
- `queryClient.invalidateQueries({ queryKey: ['guides', 'db'] })` is the only invalidation on success; it covers both the regular and admin list query keys, including the `includeDeleted` admin variant. From details, on success the UI calls `onBack` to return to the list. No success notification; error uses `useNotification` + `Notification` atom.
- The `kraftId` is URL-safe in its observed format (`KFT-YYYYMM-NNNNNN`) and the BFF additionally `encodeURIComponent`s it as a defensive default, matching the soft-delete BFF.
- No new dependency or env var is needed. Flowbite `Modal`/`Button`/`Checkbox`, `@remixicon/react`, TanStack Query, and `axios` are already installed and in use. The hard-delete escalation reuses the existing `GuideDbDeleteModal`; no new modal file.
- Pagination state (`dbPage`, `dbLimit`) is preserved across invalidation; if the last item on a page is hard-deleted, the page may now be empty. "Decrement page when empty" behavior was deferred by the soft-delete story; hard delete inherits the same behavior.
- The hard-delete confirm button keeps the same `data-testid="guide-db-delete-confirm"` (or a new one, planning-phase call) but its text content changes; tests must assert on visible text to distinguish soft vs hard confirmation.