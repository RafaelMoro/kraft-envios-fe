# Hard Delete Guide DB (Admin) - Research Story

## Story Definition

### Story Title

Hard Delete Guide DB for admin users.

### Story Description

Add the ability for an admin user to hard-delete a Guides DB record from the `Ver todas las guias` source. Hard delete permanently removes the record from the database (no soft-delete audit trail remains). The control is admin-only and is gated by the same `userInfo.data.user.role.includes('admin')` check already used to enable the admin source. Non-admins never see the control. The backend enforces admin-only authorization; the frontend gate is convenience, not security.

This research is a story note only. It does not plan implementation or include source code changes.

This story is Story 5 of the Guides DB epic (`ai-research/guides-db-epic.md:76-92`). It intentionally mirrors the soft-delete story (`ai-research/soft-delete-guide-db.story.md`) which already shipped the regular-user delete flow that the hard-delete flow extends.

### Acceptance Criteria

1. Admin users can hard-delete a Guides DB record from the `Ver todas las guias` source through both `GuideDbCard` (list) and `GuideDbDetails` (details screen).
2. The hard-delete control is gated by `userInfo.data.user.role.includes('admin')`; non-admins never see it. The control is only rendered in the `Ver todas las guias` source (`selectedSource === 'allDb' && isAdmin`), never in `Ver mis guias`.
3. The UI calls a new BFF `DELETE` route at `/api/guides-db/{kraftId}/hard` that proxies the backend `DELETE /guides/db/{kraft-id}/hard` endpoint with the same `getAccessToken()` + `Authorization: Bearer <token>` guard and `{ message }` 400 error fallback as the existing soft-delete route (`src/app/api/guides-db/[kraftId]/route.ts`).
4. The backend returns the same response envelope as soft delete (`{ version, message, error, data: { guide: { kraftId } } }` with HTTP 200) on success. The BFF treats soft and hard delete responses identically; the `DeleteGuideDbResponse` type is reused without change.
5. Hard-delete confirmation UI is visually distinguished from the existing soft-delete confirmation (explicit permanent-deletion warning copy) because the record is permanently removed from DB.
6. On success the UI invalidates the admin Guides DB list query (including the `includeDeleted` refresh, so the hard-deleted record disappears from both `Ver mis guias` and `Ver todas las guias` refetches) and stays on the list. From `GuideDbDetails`, success invokes `onBack` to return to the list.
7. Backend authorization must still enforce admin-only hard delete; frontend gating is convenience, not security.
8. The hard-delete control is hidden when `guide.deletedAt != null` is **not** the gate; the hard-delete control is gated on admin source + admin role only. Eligibility of already-soft-deleted records for hard delete is pending backend confirmation (see Open Questions).

### Why This Exists

Admins auditing `Ver todas las guias` need a way to permanently remove a Guides DB record (e.g., a `status: failed` record, or a soft-deleted record that must be purged). Soft delete leaves the row in the DB with `deletedAt`; hard delete is the only way to actually remove the row. The soft-delete story intentionally deferred hard delete, so this story adds the admin-only hard-delete flow alongside the existing soft-delete flow.

### Task Breakdown

This story is small enough to live in a single planning phase. High-level work:

- Add a BFF `DELETE` route handler at `src/app/api/guides-db/[kraftId]/hard/route.ts` that proxies `DELETE /guides/db/{kraft-id}/hard`.
- Add a `hardDeleteGuideDbCb(kraftId)` callback in `src/shared/utils/guides.utils.ts`.
- Add hard-delete confirmation copy constants in `src/shared/constants/guides.constants.ts` distinct from soft-delete copy.
- Wire a hard-delete `useMutation` in `Order.tsx` used only when `selectedSource === 'allDb' && isAdmin`; pass `onHardDeleteGuide` into `GuideDbCard` and `GuideDbDetails`.
- Render a distinguishable hard-delete control + confirmation modal in `GuideDbCard` and `GuideDbDetails`.
- Invalidate `['guides', 'db']` (which covers both regular and admin list queries, including `includeDeleted` variants) on success; from details, call `onBack`.
- Add unit tests covering admin hard-delete visibility, confirmation, success invalidation, and non-admin hiding.

## Technical Research

### Affected Areas

Routes/pages:

- `src/app/dashboard/page.tsx` only renders the dashboard; no change needed.
- `src/features/Dashboard/Dashboard.tsx` owns the active dashboard screen and already passes `userInfo` down to `Order`; no change needed for hard delete itself.

API route handlers:

- `src/app/api/guides-db/[kraftId]/route.ts` currently implements `DELETE` for soft delete. It reads `kraftId` from `context.params`, guards with `getAccessToken()`, `encodeURIComponent`s the id, forwards to `${BACKEND_URI}/guides/db/{kraftId}` with `Authorization: Bearer <token>`, returns upstream `DeleteGuideDbResponse` envelope with 200, and falls back to `{ message }` 400 on any non-2xx.
- The hard-delete BFF route should mirror that handler exactly except for the upstream path: `DELETE ${BACKEND_URI}/guides/db/${encodeURIComponent(kraftId)}/hard`. The Next App Router convention is a new file at `src/app/api/guides-db/[kraftId]/hard/route.ts` exporting a `DELETE` (preferred to keep soft and hard handlers as siblings and to preserve the existing soft-delete file untouched). Reading `kraftId` from `context.params` in a nested dynamic route is the same pattern.

Feature UI:

- `src/features/Dashboard/subscreens/Order.tsx` owns the source selector, the admin `useQuery` keyed `['guides', 'db', 'admin', adminScope, includeDeleted, includeInternalPricing, selectedMonth, selectedYear, dbPage, dbLimit]` (enabled only when `selectedSource === 'allDb' && isAdmin`), and the existing soft-delete `useMutation` wired via `handleDeleteGuide`. Add a hard-delete `useMutation` and an `handleHardDeleteGuide` here, passing `onHardDeleteGuide` to `GuideDbCard` and `GuideDbDetails` only when `selectedSource === 'allDb' && isAdmin`.
- `src/features/Dashboard/subscreens/GuideDbCard.tsx` already supports `onDeleteGuide` (soft). Add an optional `onHardDeleteGuide` prop, render a distinguishable hard-delete control, and reuse/extend the confirmation modal pattern. Hard-delete control is rendered only when `onHardDeleteGuide` is provided; soft-delete control (`onDeleteGuide`) is rendered only when `onDeleteGuide` is provided. In `Ver todas las guias` the parent passes `onHardDeleteGuide` and (per soft-delete story) passes `onDeleteGuide={undefined}`, so admins in `Ver todas las guias` see only hard-delete.
- `src/features/Dashboard/subscreens/GuideDbDetails.tsx` mirrors `GuideDbCard`'s prop pattern for delete; add `onHardDeleteGuide` and a separate confirm modal.
- `src/features/Dashboard/subscreens/GuideDbDeleteModal.tsx` is the existing soft-delete confirmation modal. The hard-delete modal needs different (more severe) copy. Two options: parameterize `GuideDbDeleteModal` with copy props, or add a sibling `GuideDbHardDeleteModal`. Planning-phase decision; parameterizing the existing modal is the smaller diff.

Shared code:

- `src/shared/utils/guides.utils.ts` hosts `deleteGuideDbCb`. Add `hardDeleteGuideDbCb(kraftId)` next to it, hitting `${DELETE_GUIDE_DB_ENDPOINT}/${encodeURIComponent(kraftId)}/hard`. Optionally add a `DELETE_GUIDE_DB_HARD_ENDPOINT` constant; the existing `DELETE_GUIDE_DB_ENDPOINT = '/api/guides-db'` can be reused by appending `/{kraftId}/hard`.
- `src/shared/constants/guides.constants.ts` hosts `GUIDES_DB_DELETE_MODAL_*` copy. Add parallel `GUIDES_DB_HARD_DELETE_MODAL_*` constants with explicit permanent-deletion warning copy (title, body, confirm, cancel). The hard-delete confirm button copy should be more severe than `Eliminar` (e.g., `Eliminar permanentemente`) and the body should explicitly warn the record cannot be recovered and will be removed from the database.
- `src/shared/types/guides.types.ts` `DeleteGuideDbResponse` is reused as-is for hard delete (same envelope shape per AC 4).
- `src/shared/hooks/useNotification.tsx` already powers `Order`'s notification flow; reuse it for hard-delete error feedback.

Tests:

- `__tests__/feature/Dashboard/Order.test.tsx` already mocks `deleteGuideDbCb`, wraps `Order` in `QueryClientProvider`, mocks `useMediaQuery`, and has admin `mockUserInfo` fixtures from the admin-list story. Extend with: mock `hardDeleteGuideDbCb`; an admin `Ver todas las guias` hard-delete-from-card test; an admin hard-delete-from-details test asserting `onBack` and `['guides', 'db']` invalidation; a non-admin test asserting the hard-delete control is never rendered.
- `__tests__/feature/Dashboard/GuideDbCard.test.tsx` and `__tests__/feature/Dashboard/GuideDbDetails.test.tsx` extend with hard-delete-visibility and confirm-modal tests for admin props. Mirrors the existing soft-delete scenarios but with `onHardDeleteGuide`.

### Existing Patterns To Follow

App Router and client split:

- Keep the hard-delete mutation in a client component under `src/features/**`; never call `${BACKEND_URI}` directly from the client.
- Keep the backend proxy in a route handler under `src/app/api/**/route.ts`.

TanStack Query:

- Use a second `useMutation` for hard delete, matching `Order`'s existing soft-delete `useMutation`.
- Invalidate `['guides', 'db']` on success (the shared prefix covers both regular and admin list query keys, including the `includeDeleted` admin variant). Use `queryClient.invalidateQueries({ queryKey: ['guides', 'db'] })` — the exact same invalidation the soft-delete story uses (`Order.tsx:106`).

Route handler proxy style:

- `src/app/api/guides-db/[kraftId]/route.ts` is the closest DELETE handler and the exact pattern to clone: read `kraftId` from `context.params`, guard missing token, guard missing `kraftId`, `encodeURIComponent`, attach `Authorization`, return upstream body with 200, fall back to `{ message }` 400 on error. The only diff is appending `/hard` to the upstream URI.
- The hard-delete BFF must **not** add an admin-role check on the Next side; backend authorization enforces admin-only hard delete (AC 7). The BFF is a pass-through like the soft-delete BFF.

Flowbite React:

- Reuse `Modal` and `Button` for confirmation. Existing `GuideDbDeleteModal` uses `Button` `color="red"`; the hard-delete modal can use the same `color="red"` with stronger copy, or `color="failure"` if distinct severity is required. No new dependency.

Forms:

- Not applicable; hard delete is a single mutation, not a form.

Styling:

- Tailwind v4 only. Reuse existing danger styling. The hard-delete control should be visually distinguishable from the soft-delete control (different copy in the modal at minimum); whether it needs a distinct visual treatment (e.g., a second icon, a "danger" label) is a UI/product open question.

### Testing Rules To Follow

Project-specific rules from `.github/copilot-instructions.md`:

- Use `userEvent` not `fireEvent` for the modal confirm click.
- Do not mock internal components from `@/features` or `@/shared`; render `GuideDbCard` and `GuideDbDetails` as-is.
- Mock `hardDeleteGuideDbCb` (a network callback) via `jest.mock` of `src/shared/utils/guides.utils` with relative import, mirroring the existing `Order.test.tsx` mock at line 12-17.
- Do not mock `next/image`.
- Do not use `document.querySelector`/`getElementById`; use semantic queries or `data-testid`. Existing cards expose `data-testid="guide-db-delete-button"`; the hard-delete control should use a distinct `data-testid` (e.g., `guide-db-hard-delete-button`) so soft and hard controls are independently queryable.
- Do not assert styling/classes.
- Preserve any `it.skip()` / `test.skip()`.
- Mock data must match the real backend response shape: `{ version, message, error, data: { guide: { kraftId } } }` (reuse `DeleteGuideDbResponse`).

Smallest useful tests:

- BFF route (if route-handler tests are added): success returns 200 with the upstream envelope; missing access token returns 400; missing `kraftId` returns 400; upstream 4xx/5xx returns `{ message }` 400. Route-handler tests are not common in this repo; defer to planning unless team requests them.
- `Order`: admin in `Ver todas las guias` sees the hard-delete control; non-admin never sees it; clicking the hard-delete control opens the distinct confirmation modal; confirming calls `hardDeleteGuideDbCb` with the correct `kraftId`; on success `['guides', 'db']` is invalidated; from details, `onBack` is invoked on success.
- `GuideDbCard`/`GuideDbDetails`: hard-delete control renders only when `onHardDeleteGuide` is provided; soft-delete control still renders only when `onDeleteGuide` is provided; the two controls are independently queryable by `data-testid`.

### Edge Cases And Constraints

- Existing BFF routes return mixed envelopes; the hard-delete BFF returns the backend's `{ version, message, error, data: { guide: { kraftId } } }` envelope on success, not a normalized shape (matches AC 4 and the soft-delete BFF).
- Missing session token currently returns 400, not 401; follow the existing pattern.
- `GuideDbRecord.deletedAt` is null on live records and non-null on soft-deleted records. The hard-delete eligibility of a soft-deleted record (i.e., whether the backend requires a prior soft delete before allowing hard delete) is pending backend confirmation (Open Questions).
- The admin `Ver todas las guias` source can render records owned by other users. Backend must enforce that admins can hard-delete any guide they can see in the admin source (regardless of ownership) — the soft-delete story constrained soft delete to own guides only; hard delete is the admin-only path that can target any guide.
- A guide `status: failed` is a valid Guides DB record and should be hard-deletable like any other.
- A guide currently shown in `Ver todas las guias` with `includeDeleted` true may already be soft-deleted; the card already shows the deleted banner. Whether the hard-delete control should be hidden, shown, or be the only control on already-soft-deleted records is pending backend confirmation (see Open Questions).
- Pagination (`dbPage`, `dbLimit`) is preserved across invalidation; if the last item on a page is hard-deleted, the page may now be empty. The user sees the empty state. "Decrement page when empty" behavior was deferred by the soft-delete story; hard delete inherits the same behavior.
- Mobile/tablet vs desktop rendering in `Order`/`Dashboard` both use `GuideDbCard` and `GuideDbDetails`; the hard-delete control and modal must work in both layouts.
- `product-sat` uses `NEXT_PUBLIC_GET_SAT_PRODUCT_URI`, not `BACKEND_URI`; not affected here.
- Tests always collect coverage into `coverage/`; do not run tests during research.
- Admin hard-delete BFF must not perform role checks on the Next side; backend authorization enforces admin-only (AC 7). Adding a Next-side role check would create a second source of truth and break the existing pass-through BFF convention.

### Dependencies And Integration Points

- No new dependencies. Flowbite `Modal`, `Button`, `@remixicon/react` `RiDeleteBinLine` already installed. TanStack Query and `axios` already in use.
- No new env vars. Backend hard-delete endpoint is served by `BACKEND_URI`.
- Cross-feature integration: only `Order` (`Ver todas las guias` admin source) is affected. `Ver mis guias` and external guides flow are untouched.

## Open Questions

Backend contract:

- I: Question: Does the backend hard-delete endpoint require the record to be soft-deleted first (`deletedAt != null`) before allowing hard delete, or can a live record be hard-deleted directly in one call?
  - Status: pending
  - Context: The epic stub (lines 90-92) flags this as the key open eligibility rule. It determines whether the UI hides the hard-delete control on live records (only showing it after soft delete) or shows it on all admin-visible records regardless of `deletedAt`.
- II: Question: Does the backend return the same `{ version, message, error, data: { guide: { kraftId } } }` envelope for hard delete, including 4xx error cases (e.g., hard-deleting a non-existent `kraftId`, or hard-deleting a record the admin cannot see)?
  - Status: pending
  - Context: AC 4 asserts the success envelope matches soft delete. The BFF error fallback (`{ message }` 400) already handles arbitrary non-2xx, but confirming the 4xx error shape is the backend contract.
- III: Question: Can an admin hard-delete any guide shown in `Ver todas las guias` (including guides owned by other users), or only their own guides?
  - Status: pending
  - Context: AC 1 says "hard-delete a Guides DB record from the `Ver todas las guias` source" without an ownership qualifier. Soft delete is constrained to own guides; hard delete is the admin path that should target any admin-visible guide, but this needs backend confirmation.
- IV: Question: Does hard delete return non-2xx for a record that is already hard-deleted (idempotency), and how should the UI treat that?
  - Status: pending
  - Context: The list refetch removes the record on success, so a re-delete should not happen from the regular flow, but the BFF must still collapse a backend 4xx to `{ message }` 400.

UI/product decisions:

- I: Question: Should the hard-delete confirmation modal reuse the existing `GuideDbDeleteModal` with stronger copy prop, or add a sibling `GuideDbHardDeleteModal`?
  - Status: pending
  - Context: Parameterizing the existing modal is the smaller diff. The hard-delete modal must be visually distinguishable (AC 5), which can be achieved with copy alone or with a distinct button color/label.
- II: Question: What copy should the hard-delete confirmation use (title, body, confirm button, cancel button)?
  - Status: pending
  - Context: Soft-delete copy is `¿Deseas eliminar esta guia?` / `Esta acción no se puede deshacer.` / `Eliminar` / `Cancelar`. Hard-delete copy should explicitly warn that the record is permanently removed from the database and cannot be recovered. Planning should propose Spanish copy (e.g., title `¿Deseas eliminar permanentemente esta guía?`, body `Esta acción removerá el registro de la base de datos y no se puede deshacer.`, confirm `Eliminar permanentemente`, cancel `Cancelar`) for product approval.
- III: Question: Should the hard-delete control be a second icon button alongside the soft-delete button, or should admins see only the hard-delete control in `Ver todas las guias`?
  - Status: pending
  - Context: The soft-delete story already passes `onDeleteGuide={undefined}` to `GuideDbCard`/`GuideDbDetails` in `Ver todas las guias` (`Order.tsx:306`, `Order.tsx:415`), so soft delete is not offered there. If admins in `Ver todas las guias` should be able to soft-delete too, this story must also re-enable soft delete for admins; otherwise hard-delete is the only delete control in the admin source. Default assumption: hard-delete only.
- IV: Question: Should the hard-delete control be visually distinguishable from the soft-delete control beyond modal copy (e.g., a different icon, a "Permanent" label, a stronger button color)?
  - Status: pending
  - Context: AC 5 requires distinction. Copy alone satisfies the letter of AC 5; a stronger visual treatment is a UI/product call.

Authorization:

- I: Question: Does the backend hard-delete endpoint enforce admin-only authorization on every call, regardless of who owns the guide?
  - Status: pending
  - Context: AC 7 asserts backend enforcement. The BFF should not add a Next-side role check (it would violate the pass-through BFF convention); confirming backend enforcement reifies that decision.
- II: Question: Should the Next BFF hard-delete route also guard against non-admin callers (defensive), or rely entirely on backend authorization?
  - Status: pending
  - Context: Existing BFF routes (incl. soft delete) do not perform role checks; they only guard the access token. Mirroring that for hard delete means relying on backend authorization. A defensive Next-side admin guard would be a new pattern in this repo.

Hard delete flow:

- I: Question: After a successful hard delete, should the UI show a success notification (unlike soft delete, which is silent)?
  - Status: pending
  - Context: Soft delete is silent on success (only the refetched list signals success). Hard delete is a more destructive action; product may want an explicit success confirmation. Default assumption: silent, mirroring soft delete.

## Assumptions

- The backend hard-delete endpoint is `DELETE /guides/db/{kraft-id}/hard`, returns HTTP 200 with `{ version, message, error, data: { guide: { kraftId } } }` on success, and returns a 4xx error envelope that the BFF collapses to `{ message }` 400. The success envelope matches soft delete per AC 4; the `DeleteGuideDbResponse` type is reused unchanged.
- The BFF route lives at `src/app/api/guides-db/[kraftId]/hard/route.ts` (Next nested dynamic route) and mirrors `src/app/api/guides-db/[kraftId]/route.ts` exactly except for appending `/hard` to the upstream URI.
- The hard-delete control is admin-only, rendered only in the `Ver todas las guias` source (`selectedSource === 'allDb' && isAdmin`). It is never rendered in `Ver mis guias` or for non-admin users.
- The `kraftId` is URL-safe in its observed format (`KFT-YYYYMM-NNNNNN`) and the BFF additionally `encodeURIComponent`s it as a defensive default, matching the soft-delete BFF.
- Backend authorization enforces admin-only hard delete; the BFF does not perform a Next-side role check, preserving the pass-through convention used by every other guides BFF route.
- The hard-delete confirmation modal uses distinct, more severe Spanish copy than the soft-delete modal to satisfy AC 5; whether it is a parameterized `GuideDbDeleteModal` or a sibling `GuideDbHardDeleteModal` is a planning-phase decision.
- Soft delete remains unavailable in `Ver todas las guias` (per the soft-delete story); hard delete is the only delete control offered to admins in that source unless Open Question UI/III re-enables soft delete for admins.
- On success, `queryClient.invalidateQueries({ queryKey: ['guides', 'db'] })` is the only invalidation needed; it covers both the regular and admin list query keys (including the `includeDeleted` admin variant), so the hard-deleted record disappears from all refetched lists.
- From `GuideDbDetails`, on hard-delete success the UI calls `onBack` to return to the list (mirrors the soft-delete story's details behavior).
- The hard-delete control uses a distinct `data-testid` (e.g., `guide-db-hard-delete-button`) so soft and hard controls are independently queryable in tests.
- No new dependency or env var is needed. Flowbite `Modal`/`Button`, `@remixicon/react`, TanStack Query, and `axios` are already installed and in use.
- Eligibility of already-soft-deleted records for hard delete (whether the backend requires `deletedAt != null` first) is pending backend confirmation (Open Question Backend/I) and will determine whether the UI gates the hard-delete control on `deletedAt`.
- Whether an admin can hard-delete any admin-visible guide regardless of ownership is pending backend confirmation (Open Question Backend/III).