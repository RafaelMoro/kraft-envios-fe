# Hard Delete Guide DB (Admin) - Planning

- Story: Hard Delete Guide DB for admin users
- Source research: `ai-research/hard-delete-guide-db.story.md`
- Sign-off status: Research sign-off complete (all open questions answered) on 2026-07-05
- Story 5 of the Guides DB epic; extends `soft-delete-guide-db.story` and `admin-all-guides-db-list.story`
- Target: single, small admin-only escalation built on top of the existing soft-delete modal

## Assumptions made during planning

Folded back from the research doc and re-confirmed against the current code:

1. **Admin delete reach into `Ver todas las guias`.** Today `Order.tsx:306,415` passes `onDeleteGuide` only when `selectedSource === 'ownDb'`. To satisfy AC 1/AC 8 ("admin can hard-delete from both sources"), the delete control must also render in `Ver todas las guias` for admins. The research task breakdown ("pass `isAdmin` ... into `GuideDbCard` and `GuideDbDetails` so the checkbox is rendered for admins in both sources") implies the same shared `GuideDbDeleteModal` opens in both sources, so this planning interpretation is: **admin sees the checkbox (and the soft vs hard choice) in both `Ver mis guias` and `Ver todas las guias`**. Consequence: admins gain the ability to soft-delete from `Ver todas las guias` as a side effect of sharing the modal+checkbox flow. The soft-delete BFF route itself is untouched; only the call site in `Order.tsx` is wired to forward deletes in the admin source too. Non-admin behavior is unchanged (still `Ver mis guias` only, checkbox never rendered).
2. **Hard-delete on already-soft-deleted rows.** `GuideDbCard.tsx:97` and `GuideDbDetails.tsx:73` currently gate the delete icon on `guide.deletedAt == null`. AC 7 requires admins to see the hard-delete escalation on soft-deleted rows too. The gate therefore becomes: render the delete icon when `onDeleteGuide` is supplied AND (`guide.deletedAt == null` OR `isAdmin`). Non-admins keep the existing behavior (no button on soft-deleted rows).
3. **Single `useMutation` branching on `permanent`.** The research offers two options and defers to planning. Ponytail: take the smaller diff — one `useMutation` whose `mutationFn` branches on a `permanent` flag, reusing the existing `onSuccess` invalidation of `['guides', 'db']` and the existing `onError` notification. Adds zero hooks vs a second `useMutation`.
4. **`onConfirm(permanent)` modal contract.** `GuideDbDeleteModal` owns the checkbox state internally (single source of truth for the dynamic copy) and calls `onConfirm(permanent)` on confirm. Cancel closes without calling `onConfirm`. The existing `onConfirm: () => void` signature widens to `onConfirm: (permanent: boolean) => void`; callers that previously passed a no-arg `onConfirm` must wrap.
5. **`onDeleteGuide` signature.** `(guide: GuideDbRecord, permanent: boolean) => void` everywhere it is declared. Children derive `permanent` from the modal checkbox. Non-admin call sites always pass `false`. Children without an `isAdmin` prop simply pass through whatever the modal reports; the modal renders no checkbox when `isAdmin` is falsy, so `permanent` is always `false` for non-admins.
6. **`data-testid` policy.** New checkbox gets `data-testid="guide-db-hard-delete-checkbox"`. The confirm button keeps `data-testid="guide-db-delete-confirm"`; tests distinguish soft vs hard by the button's visible text (matches the research note at line 135). Cancel button and existing delete button test-ids are unchanged.
7. **BFF role-guard marker.** A `// ponytail: defensive guard, backend authorization is the source of truth` comment marks the new route handler role check, per research line 102/158/235. This is the only Next-side role check; do not retrofit onto other BFF routes.
8. **Tests for the BFF route handler are out of scope.** Route-handler tests are not common in this repo and the research explicitly defers them ("defer to planning unless team requests them"). The BFF route is exercised transitively via `Order` integration tests that mock `hardDeleteGuideDbCb`. Adding a route-handler test file is out of scope unless requested.

## Acceptance Criteria

Copied verbatim from the research doc:

1. Admin users can hard-delete a Guides DB record from both `Ver mis guias` and `Ver todas las guias` sources through both `GuideDbCard` (list) and `GuideDbDetails` (details screen). The delete control (Flowbite icon button using `RiDeleteBinLine`) is rendered in both sources for all users with delete access; the hard-delete escalation is gated separately.
2. The hard-delete escalation is gated by `userInfo.data.user.role.includes('admin')`. Non-admins never see the `Eliminar esta guia permanentemente?` checkbox and never call the hard-delete endpoint. The checkbox is rendered only for admins and only inside the existing `GuideDbDeleteModal`.
3. The UI calls a new BFF `DELETE` route at `/api/guides-db/{kraftId}/hard` when the admin confirms with the checkbox checked. The BFF proxies `DELETE /guides/db/{kraft-id}/hard` on the backend, uses `getAccessToken()` and `Authorization: Bearer <token>`, role-guards via `getUserInfo()` (returns 403 when the caller is not an admin), and otherwise follows the same `{ message }` 400 error fallback as the soft-delete BFF.
4. The backend returns the same response envelope as soft delete (`{ version, message, error, data: { guide: { kraftId } } }` with HTTP 200) on success. The BFF forwards that envelope on success. The existing `DeleteGuideDbResponse` type is reused unchanged.
5. When the admin checks the `Eliminar esta guia permanentemente?` checkbox, the modal title, body, and primary confirm-button copy change to the hard-delete copy. When the checkbox is unchecked, the modal is identical to the soft-delete modal that the soft-delete story ships (`¿Deseas eliminar esta guia?` / `Esta acción no se puede deshacer.` / `Eliminar` / `Cancelar`).
6. On success the UI invalidates the active Guides DB list query keys (the shared `['guides', 'db']` prefix covers both regular and admin lists, including the `includeDeleted` admin variant) and stays on the list. From `GuideDbDetails`, success invokes `onBack` to return to the list. No success notification; the refetched list is the only signal of success. Errors use the existing `useNotification` + `Notification` atom pattern.
7. Hard delete is allowed on both live records and already-soft-deleted records in one call. The hard-delete control/checkbox is not gated on `guide.deletedAt`. Live and soft-deleted admin-visible records both expose the hard-delete escalation to admins.
8. An admin can hard-delete any admin-visible guide, regardless of whether the current admin owns it (i.e., `Ver todas las guias` rows owned by other users are hard-deletable by the admin).
9. Backend authorization still enforces admin-only hard delete; the BFF role-guard is a defensive layer, not the primary security boundary.
10. The BFF returns 403 when a non-admin caller hits the hard-delete route (e.g., via a stale role cookie or hand-crafted request). The 403 follows the existing `{ message }` error shape.

## Affected files

### `src/app/api/**`

- `src/app/api/guides-db/[kraftId]/hard/route.ts` — **Create**. New nested dynamic route handler, sibling of the soft-delete route.

### `src/shared/**`

- `src/shared/utils/guides.utils.ts` — **Modify**. Add `hardDeleteGuideDbCb(kraftId)` next to `deleteGuideDbCb`.
- `src/shared/constants/guides.constants.ts` — **Modify**. Add the four hard-delete modal copy constants after the soft-delete constants (line 298).
- `src/shared/types/guides.types.ts` — No change. `DeleteGuideDbResponse` is reused as-is.
- `src/shared/lib/auth.lib.ts` — No change. `getUserInfo()` (lines 55-68) is reused by the new BFF.

### `src/features/**`

- `src/features/Dashboard/subscreens/GuideDbDeleteModal.tsx` — **Modify**. Add `isAdmin` prop, internal `permanent` checkbox state, dynamic copy, and `onConfirm(permanent)` contract.
- `src/features/Dashboard/subscreens/GuideDbCard.tsx` — **Modify**. Add `isAdmin` prop; widen `onDeleteGuide` to `(guide, permanent) => void`; relax the icon-on-soft-deleted gate for admins.
- `src/features/Dashboard/subscreens/GuideDbDetails.tsx` — **Modify**. Mirror the same `isAdmin` prop and `onDeleteGuide` signature change; relax the icon-on-soft-deleted gate for admins.
- `src/features/Dashboard/subscreens/Order.tsx` — **Modify**. Single branching `useMutation`; widen `handleDeleteGuide` to `(guide, permanent)`; pass `onDeleteGuide` for the admin DB source as well; pass `isAdmin` to `GuideDbCard` and `GuideDbDetails`.

### `__tests__/**`

- `__tests__/feature/Dashboard/Order.test.tsx` — **Modify**. Add `hardDeleteGuideDbCb` to the `jest.mock` factory; add admin checkbox tests.
- `__tests__/feature/Dashboard/GuideDbCard.test.tsx` — **Modify**. Add admin and non-admin checkbox tests.
- `__tests__/feature/Dashboard/GuideDbDetails.test.tsx` — **Modify**. Add admin and non-admin checkbox tests plus an `onBack`-after-hard-delete test.

### Docs / config

- `REPO_CONTEXT.md` — **Modify** (optional, only after verification). Add the hard-delete BFF row to the API Route Inventory and note that this is the only Next-side role-guarded BFF route.

## Phases

### Phase 1 — BFF route, util callback, and copy constants

Independently testable in isolation: the BFF route is a standalone file; the util callback is a pure async function; the constants are exported strings. None of these touch React, so `pnpm exec tsc --noEmit` is the natural gate.

#### Changes Required

`src/app/api/guides-db/[kraftId]/hard/route.ts` (Create):
- Mirror the soft-delete handler at `src/app/api/guides-db/[kraftId]/route.ts` exactly for the access-token check (`getAccessToken()` → 400 when missing), `kraftId` presence check (→ 400), `encodeURIComponent(kraftId)`, `Authorization: Bearer <token>`, 200 success forwarding `res.data`, and the 400 catch-all fallback for non-2xx (both the `axios.isAxiosError` branch and the `GeneralError` fallback).
- Upstream URI: `${process.env.BACKEND_URI}/guides/db/${encodeURIComponent(kraftId)}/hard`.
- Add a role-guard step **after** the access-token check and **before** the upstream call:
  - `const userInfo = await getUserInfo()`
  - `const isAdmin = Array.isArray(userInfo?.data?.user?.role) && userInfo.data.user.role.includes('admin')`
  - `if (!isAdmin) return NextResponse.json({ message: 'admin only' }, { status: 403 })`
  - Reuse the exact `Array.isArray(...) && role.includes('admin')` pattern from `Order.tsx:64` and `src/shared/ui/organisms/Aside.tsx:19`. Missing `user-info` cookie means `userInfo` is `null`, so `Array.isArray(undefined)` short-circuits to 403 — matches "missing session is also a 403" in the research (this route's 403 is **not** the soft-delete "missing access token → 400"; the access-token 400 still fires first when the session cookie itself is missing).
- Add `// ponytail: defensive guard, backend authorization is the source of truth` immediately above the role-guard block.
- Imports: `getAccessToken` and `getUserInfo` from `@/shared/lib/auth.lib`; `DeleteGuideDbResponse` from `@/shared/types/guides.types`; `GeneralError` from `@/shared/types/global.types`.

`src/shared/utils/guides.utils.ts` (Modify, near `deleteGuideDbCb` at line 150-155):
- Add `export const hardDeleteGuideDbCb = async (kraftId: string): Promise<DeleteGuideDbResponse> => { const res = await axios.delete(\`${DELETE_GUIDE_DB_ENDPOINT}/${encodeURIComponent(kraftId)}/hard\`); return res.data }`.
- `DELETE_GUIDE_DB_ENDPOINT` (`/api/guides-db`) is already imported; no new constant import needed.

`src/shared/constants/guides.constants.ts` (Modify, after line 298):
- `GUIDES_DB_HARD_DELETE_MODAL_TITLE = '¿Eliminar permanentemente esta guía?'`
- `GUIDES_DB_HARD_DELETE_MODAL_BODY = 'Esta acción removerá el registro de la base de datos de forma permanente. No se puede deshacer.'`
- `GUIDES_DB_HARD_DELETE_MODAL_CONFIRM = 'Eliminar permanentemente'`
- Cancel copy reuses `GUIDES_DB_DELETE_MODAL_CANCEL`; no new constant.

#### Edge cases

- The role-guard runs **after** the access-token check, so a 403 from this route always implies a valid session but a non-admin role; a 400 still means "no session". This matches AC 10 and the research's "missing session → 400, not 403" for the soft-delete BFF, and "missing `getUserInfo()` (no cookie) is also a 403" for the hard-delete BFF (the access-token check fires first because the session cookie is a prerequisite of any authenticated delete).
- `kraftId` is `encodeURIComponent`'d defensively, matching the soft-delete BFF.

#### Success Criteria

- `pnpm exec tsc --noEmit` — passes.
- `pnpm lint` — passes.
- No test file is added for the BFF route (out of scope per assumption 8); the route is exercised transitively by Phase 2 tests that mock `hardDeleteGuideDbCb`.

### Phase 2 — Modal checkbox, child wiring, and `Order.tsx` mutation branch

Independently testable: the modal change is a pure UI state change, the child prop additions are additive, and `Order.tsx` integrates them. All existing soft-delete tests must continue to pass (no behavior change for non-admins and for non-checked confirms).

#### Changes Required

`src/features/Dashboard/subscreens/GuideDbDeleteModal.tsx` (Modify, full-file restructure):
- Widen `GuideDbDeleteModalProps` to `{ open: boolean; onClose: () => void; onConfirm: (permanent: boolean) => void; isAdmin?: boolean }`.
- Add `const [permanent, setPermanent] = useState(false)` and reset it to `false` whenever `open` flips to `false` (use an `useEffect` keyed on `open`, or lift via `key={open ? 'open' : 'closed'}` on the modal — pick whichever is shorter; an `useEffect` is fine).
- Imports: add `Checkbox` and `ModalHeader` already imported; `useState`/`useEffect` from `react`; add `GUIDES_DB_HARD_DELETE_MODAL_*` constants to the existing import block.
- Render the checkbox only when `isAdmin` is truthy, inside `ModalBody` between the body copy and the footer:
  - Flowbite `<Checkbox id="guide-db-hard-delete-toggle" data-testid="guide-db-hard-delete-checkbox" checked={permanent} onChange={(e) => setPermanent(e.target.checked)} />`
  - Bold label via `<strong>` (or `font-semibold`/`font-bold` Tailwind class) wrapping `Eliminar esta guia permanentemente?`. **Do not** assert on the class in tests.
- Conditional copy:
  - Title: `permanent ? GUIDES_DB_HARD_DELETE_MODAL_TITLE : GUIDES_DB_DELETE_MODAL_TITLE`
  - Body paragraph text: `permanent ? GUIDES_DB_HARD_DELETE_MODAL_BODY : GUIDES_DB_DELETE_MODAL_BODY`
  - Confirm button text: `permanent ? GUIDES_DB_HARD_DELETE_MODAL_CONFIRM : GUIDES_DB_DELETE_MODAL_CONFIRM`
  - Cancel button: unchanged (uses `GUIDES_DB_DELETE_MODAL_CANCEL` either way).
- Confirm button `onClick={() => onConfirm(permanent)}`. Keep `data-testid="guide-db-delete-confirm"`. Cancel keeps `data-testid="guide-db-delete-cancel"` and calls `onClose`.
- `"use client"` directive preserved (already present).

`src/features/Dashboard/subscreens/GuideDbCard.tsx` (Modify):
- Add `isAdmin?: boolean` to the props destructuring and to the inline props type.
- Widen `onDeleteGuide?: (guide: GuideDbRecord, permanent: boolean) => void`.
- Pass `isAdmin={isAdmin}` to `<GuideDbDeleteModal>`.
- Update the confirm handler at line 124-127: `onConfirm={(permanent) => { setIsConfirmOpen(false); onDeleteGuide(guide, permanent) }}`.
- Relax the icon render gate at line 97 from `onDeleteGuide && guide.deletedAt == null` to `onDeleteGuide && (isAdmin || guide.deletedAt == null)`. Non-admin behavior is unchanged (still requires `deletedAt == null`).

`src/features/Dashboard/subscreens/GuideDbDetails.tsx` (Modify):
- Mirror `GuideDbCard`: add `isAdmin?: boolean`; widen `onDeleteGuide` to `(guide, permanent) => void`; pass `isAdmin` to the modal; update the confirm handler at line 244-247; relax the icon gate at line 73 the same way.

`src/features/Dashboard/subscreens/Order.tsx` (Modify):
- Add `hardDeleteGuideDbCb` to the import on line 9.
- Replace the existing `deleteMutation` (lines 103-112) with a single branching `useMutation`:
  - `mutationFn: ({ kraftId, permanent }: { kraftId: string; permanent: boolean }) => permanent ? hardDeleteGuideDbCb(kraftId) : deleteGuideDbCb(kraftId)`
  - `onSuccess: () => queryClient.invalidateQueries({ queryKey: ['guides', 'db'] })`
  - `onError: () => { updateNotificationMessage(GUIDES_DB_DELETE_ERROR_MESSAGE); toggleNotification() }` — reuses the existing import and message constant.
- Widen `handleDeleteGuide` (lines 228-236) to `(guide: GuideDbRecord, permanent: boolean)`:
  - Defensive guard: `if (permanent && !isAdmin) return` (so a misconfigured caller or a stale admin checkbox cannot trigger a hard-delete from a non-admin path).
  - `deleteMutation.mutate({ kraftId: guide.kraftId, permanent }, { onSuccess: () => { if (selectedDbGuide) setSelectedDbGuide(null) } })`.
- Wire `onDeleteGuide` and `isAdmin` to both child call sites:
  - `GuideDbDetails` (line 303-307): `onDeleteGuide={(selectedSource === 'ownDb' || (selectedSource === 'allDb' && isAdmin)) ? handleDeleteGuide : undefined}`; add `isAdmin={isAdmin}`.
  - `GuideDbCard` (line 410-416): same `onDeleteGuide` ternary; add `isAdmin={isAdmin}`.

#### Edge cases

- **Client/server boundary.** `Order`, `GuideDbCard`, `GuideDbDetails`, and `GuideDbDeleteModal` are all client components (`"use client"` is present on the modal and the children; `Order.tsx` is dynamically imported with `ssr: false` via `Dashboard`). No new directive needed on `Order.tsx`.
- **`deletedAt` gating.** AC 7 requires the hard-delete escalation to be visible to admins on soft-deleted rows. The gate relaxation described above is the smallest diff that satisfies AC 7 without changing non-admin behavior.
- **Mobile/tablet vs desktop.** Both layouts render `GuideDbCard` and `GuideDbDetails` exactly the same way for delete controls; no branch-specific work.
- **Pagination.** Unchanged; the existing `['guides', 'db']` invalidation covers both the regular and the admin (`includeDeleted`) list query keys because they share that prefix (see `Order.tsx:84,90`).
- **Stale admin cookie.** The BFF role-guard may pass a stale admin (role demoted after login). The backend remains the source of truth (AC 9). Nothing to do in the UI; the `// ponytail:` comment captures this.

#### Test Coverage

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `__tests__/feature/Dashboard/GuideDbDeleteModal.tsx` (no new file; covered via its callers) | — | — |
| `__tests__/feature/Dashboard/GuideDbCard.test.tsx` | admin (`isAdmin={true}`) sees the checkbox (`guide-db-hard-delete-checkbox`); checking it before confirm calls `onDeleteGuide(guide, true)`; not checking calls `onDeleteGuide(guide, false)`; non-admin (`isAdmin={false}` or omitted) does not render the checkbox; hard-delete icon renders on a `deletedAt != null` row when `isAdmin`; non-admin never sees the icon on a `deletedAt != null` row; confirm button visible text changes from `Eliminar` to `Eliminar permanentemente` when the checkbox is checked | Existing `__tests__/feature/Dashboard/GuideDbCard.test.tsx`; Testing Library + `userEvent`; no `container`/`querySelector` |
| `__tests__/feature/Dashboard/GuideDbDetails.test.tsx` | same checkbox/confirm coverage as `GuideDbCard`; the delete icon renders on a soft-deleted row for admins; `onBack` is invoked after a successful hard-delete confirm (assert the details header disappears and the list reloads) | Existing `__tests__/feature/Dashboard/GuideDbDetails.test.tsx`; same wrapping as `Order.test.tsx` for TanStack Query + router |
| `__tests__/feature/Dashboard/Order.test.tsx` | add `hardDeleteGuideDbCb: jest.fn()` to the existing `jest.mock('../../../src/shared/utils/guides.utils', ...)` factory; admin in `Ver mis guias`: checkbox renders, checked confirm calls `hardDeleteGuideDbCb` with the right `kraftId`; admin in `Ver mis guias`: unchecked confirm still calls `deleteGuideDbCb`; admin in `Ver todas las guias`: delete button is rendered (previously it was not), checkbox renders, checked confirm calls `hardDeleteGuideDbCb`; non-admin in `Ver mis guias`: checkbox not rendered; `hardDeleteGuideDbCb` is never called for non-admins; on success (either path) `['guides', 'db']` is invalidated and refetch happens; on error the existing `Notification` message is shown; from details, `onBack` is invoked on success | Existing `Order.test.tsx` mocks at lines 11-17; reuse `mockAdminUserInfo` fixture (line 877); assert on visible button text, not on test-id, to distinguish soft vs hard confirm |

Test rules from `.github/copilot-instructions.md` to preserve:
- `userEvent`, not `fireEvent`, for both the checkbox toggle and the confirm click.
- Do not mock `GuideDbDeleteModal`, `GuideDbCard`, or `GuideDbDetails` from `@/features`; render them as-is.
- Mock `hardDeleteGuideDbCb` via the existing `jest.mock('../../../src/shared/utils/guides.utils', ...)` block (relative import, named export).
- Do not assert on CSS classes; assert on visible text and `data-testid` presence.
- Preserve existing `it.skip()` / `test.skip()`.
- Mock data must match the real `DeleteGuideDbResponse` shape: `{ version, message, error, data: { guide: { kraftId } } }` (already done at `Order.test.tsx:1406-1411`).
- No file extensions in imports.

#### Success Criteria

- `pnpm test -- __tests__/feature/Dashboard/GuideDbCard.test.tsx`
- `pnpm test -- __tests__/feature/Dashboard/GuideDbDetails.test.tsx`
- `pnpm test -- __tests__/feature/Dashboard/Order.test.tsx`
- `pnpm test` — full suite (catches any cross-area regressions; coverage is collected).
- `pnpm exec tsc --noEmit`
- `pnpm lint`
- `pnpm build` — final production verification before sign-off.

Manual (when UI behavior is verified):
1. Log in as admin; open `Ver mis guias`; click the delete icon on a live row; the modal shows soft-delete copy; the `Eliminar esta guia permanentemente?` checkbox is visible; leave it unchecked and confirm → soft-delete endpoint is hit, the list refetches, no notification appears.
2. Same setup; check the box → modal title, body, and confirm button switch to the hard-delete copy; confirm → `/api/guides-db/{kraftId}/hard` is hit, the row disappears from the list, no notification.
3. Open `Ver todas las guias` (admin only); confirm the delete icon now appears on rows in that source; check the box on someone else's guide and confirm → hard-delete endpoint is hit; refetch removes the row.
4. Toggle `Incluir guías eliminadas` in `Ver todas las guias`; a soft-deleted row's delete icon is present (it was not before); confirming with the checkbox checked hard-deletes the soft-deleted row.
5. Log in as non-admin; open `Ver mis guias`; the delete icon appears only on live rows; the modal never shows the checkbox; confirming calls only the soft-delete endpoint.
6. Repeat steps 1-3 from the details screen (`Ver detalles`) and confirm `onBack` returns to the list after success.
7. Verify the same flows on a mobile/tablet viewport (`useMediaQuery` mobile) — the modal renders identically.
8. (Defensive) Craft a `DELETE /api/guides-db/{kraftId}/hard` request with a non-admin `user-info` cookie (or no cookie) → expect HTTP 403 with `{ message: 'admin only' }`.

## Cross-cutting concerns

- **Auth cookies.** The BFF role-guard reads the httpOnly `user-info` cookie via `getUserInfo()` (`src/shared/lib/auth.lib.ts:55-68`). The client never reads `user-info` directly; `Order.tsx:64` already derives `isAdmin` from the `userInfo` prop that `Dashboard` reads server-side. No new cookie access.
- **Env vars.** No new env var. The backend endpoint is served by `BACKEND_URI`, already required.
- **API response shape.** The hard-delete BFF forwards the upstream `DeleteGuideDbResponse` envelope on success and collapses any non-2xx to `{ message }` 400 — identical to the soft-delete BFF (the only addition is the 403 for non-admins, which is also `{ message }`-shaped).
- **`product-sat` exception.** Not affected; `product-sat` uses `NEXT_PUBLIC_GET_SAT_PRODUCT_URI` instead of `BACKEND_URI`.
- **`REPO_CONTEXT.md` update (optional, post-build verification).** Add the new route row:
  - `/api/guides-db/[kraftId]/hard` | `DELETE` | Hard-deletes a guide; proxies `DELETE ${BACKEND_URI}/guides/db/{kraftId}/hard` (URL-encoded); forwards the upstream `DeleteGuideDbResponse` envelope on success; 403 when the caller is not an admin via `getUserInfo()`; collapses any other non-2xx to `{ message }` 400. **Only Next-side role-guarded BFF route.**
  - Append to "Conventions And Gotchas": the hard-delete BFF is the only route with a Next-side role check; do not retrofit onto other BFF routes.

## Open Questions / Out-of-scope items

Out of scope (deliberately excluded):
- A Jest test file dedicated to the BFF route handler (assumption 8).
- "Decrement page when the last item on a page is hard-deleted" behavior — inherits the soft-delete story's deferral (research line 153, 244).
- Any change to the existing soft-delete BFF route at `src/app/api/guides-db/[kraftId]/route.ts`.
- Any change to `Dashboard.tsx`, `dashboard/page.tsx`, `Aside.tsx`, or other subscreens; `Dashboard` already passes `userInfo` to `Order`.
- Backend changes (this repo is frontend-only; the backend contract is documented as an assumption in the research doc).
- Success notifications — explicitly silent per AC 6.
- A new modal file — the existing `GuideDbDeleteModal` is reused (research UI/I).
- A new icon or button color — distinction is in copy only (research UI/IV).
- Retrofitting the Next-side role-guard to other BFF routes — explicitly out of scope (the `// ponytail:` comment marks this).

No unresolved questions carried into implementation. The one planning interpretation (assumption 1 — admins gain a soft-delete side-effect in `Ver todas las guias`) is captured above; if the team wants to restrict `Ver todas las guias` to hard-delete only, the change is one line in `Order.tsx` (force `permanent=true` for the admin source) and one extra test — flagged here, not implemented.