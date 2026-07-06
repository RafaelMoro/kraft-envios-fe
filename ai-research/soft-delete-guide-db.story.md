# Soft Delete Guide DB (Regular User) - Research Story

## Story Definition

### Story Title

Soft Delete Guide DB for regular users.

### Story Description

Add the ability for a regular user to delete a Guides DB record from the `Ver mis guias` list. From the regular user's perspective, the guide is removed. The backend persists the record as soft-deleted so it disappears from `GET /guides/db` for that user but remains in DB for admin auditing. Regular users are never told the deletion is "soft" or that records persist; the UI presents it as plain deletion.

Hard delete (admin-only, removes the record from DB) is intentionally out of scope for this story. The hard-delete flow is captured as a stub Story 5 in `ai-research/guides-db-epic.md` and should be researched separately.

This research is a story note only. It does not plan implementation or include source code changes.

### Acceptance Criteria

1. A regular user (any role value, `user` or `admin`, acting in the `Ver mis guias` source) can soft-delete a non-deleted Guides DB record from both `GuideDbCard` (list) and `GuideDbDetails` (details screen) in the `Ver mis guias` source. Soft delete is only rendered for guides owned by the current user.
2. The Delete control is hidden when `guide.deletedAt` is non-null so already-soft-deleted records cannot be re-deleted from the regular UI.
3. Soft delete asks for confirmation through a Flowbite `Modal` before sending the request. Modal copy: title `¿Deseas eliminar esta guia?`, body `Esta acción no se puede deshacer.`, confirm button `Eliminar`, cancel button `Cancelar`.
4. The UI calls a new BFF `DELETE` route at `/api/guides-db/{kraftId}` that proxies backend `DELETE /guides/db/{kraft-id}` with `getAccessToken()` and `Authorization: Bearer <token>`, following the existing `src/app/api/guides-db/route.ts` guard and error pattern. The `kraftId` is URL-encoded as a defensive default.
5. The backend returns HTTP 200 with `{ version, message, error, data: { guide: { kraftId } } }`; the BFF forwards that envelope on success and returns `{ message }` with `400` on non-2xx errors (including any 4xx from the backend), matching the existing BFF error fallback.
6. On success the UI invalidates the active Guides DB list query (`Ver mis guidas`, which triggers a refetch and the deleted record disappears from both regular and admin sources), and when the user is on `GuideDbDetails` it calls `onBack` to return to the list. No success notification is shown; the refetched list is the only signal of success. Errors use the existing `useNotification` + `Notification` atom pattern.
7. The delete control is a Flowbite icon button using `RiDeleteBinLine` from `@remixicon/react` (already used in `src/features/Addresses/AddressCard.tsx:2`). The planning phase should search the repo for the exact existing icon-button implementation pattern before final placement.
8. Regular users see this as a plain delete: no "soft" terminology, no admin-only hint, no exposure of the hard-delete path. Hard delete is never offered here.
9. Hard delete (`DELETE /guides/db/{kraft-id}/hard`) is explicitly out of scope and is tracked as Story 5 in the epic.
10. The delete control is only rendered in the `Ver mis guias` source. Admins viewing `Ver todas las guias` (other users' guides) do not see a soft-delete control in this story; that source is for viewing/auditing only.

### Why This Exists

The `Ver mis guias` screen lists Guides DB records owned by the user. Users need a way to remove their own guides from their view. Backend supports soft delete so records remain for admin auditing (Story 3 already exposes soft-deleted metadata to admins). Until now there was no delete UI; this story adds it for the regular-user flow.

### Task Breakdown

This story is small enough to live in a single planning phase. High-level work:

- Add a BFF `DELETE` route handler that proxies `DELETE /guides/db/{kraft-id}`.
- Add a TanStack Query `useMutation` callback for soft delete.
- Add a Flowbite `Modal` confirmation in `GuideDbCard` and `GuideDbDetails`.
- Hide the delete control when `guide.deletedAt` is non-null.
- Invalidate Guides DB list queries on success and show a notification.
- Add unit tests covering the regular-user soft-delete flow.

## Technical Research

### Affected Areas

Routes/pages:

- `src/app/dashboard/page.tsx` only renders the dashboard; no change needed.
- `src/features/Dashboard/Dashboard.tsx` owns the active dashboard screen and renders `Order`; no change needed for delete itself.

API route handlers:

- `src/app/api/guides-db/route.ts` currently implements `GET` (list) and `POST` (create). It does not implement `DELETE`.
- A `DELETE` handler must be added to this file (or a sibling route file). Existing repo style for `DELETE` exists in `src/app/api/ge-address/route.ts:68-97` and is the closest pattern to follow: read `kraftId` from the URL, guard with `getAccessToken()`, attach `Authorization: Bearer <token>`, forward to `${BACKEND_URI}/guides/db/{kraft-id}`, return upstream body with 200, and fall back to `{ message }` 400 on error.
- The hard-delete endpoint (`/guides/db/{kraft-id}/hard`) is a separate route handler and is NOT in this story. It should not be added here. If a decision is needed about whether it lives in the same route file or a sibling, defer that to the hard-delete story (Story 5).

Feature UI:

- `src/features/Dashboard/subscreens/Order.tsx` owns the source selector and the Guides DB list (`Ver mis guias`, `Ver todas las guias`) and renders `GuideDbCard`. The card already receives `onViewDetails`; passing a delete callback into the card from `Order` is the smallest change to wire delete from the list.
- `src/features/Dashboard/subscreens/GuideDbCard.tsx` renders each card and already shows a `guide-db-card-deleted` banner when `guide.deletedAt != null`. Adding a delete button hidden when `deletedAt` is set is the only card-level change.
- `src/features/Dashboard/subscreens/GuideDbDetails.tsx` renders the single-guide details view and already shows a `guide-db-details-deleted` section when deleted. The existing `onBack` prop pattern fits returning to the list after a delete from details.
- Both screens use Flowbite (`Button`, `Modal`) which is already used elsewhere in the app. No new dependency is needed.

Shared code:

- `src/shared/utils/guides.utils.ts` hosts all callbacks like `getGuidesDbCb`, `createGuideDbCb`. Add a `deleteGuideDbCb(kraftId)` here.
- `src/shared/constants/guides.constants.ts` hosts endpoint constants. The existing `GET_GUIDES_DB_ENDPOINT = '/api/guides-db'` is reused for `DELETE /api/guides-db/{kraftId}` (no new constant strictly required, but a `DELETE_GUIDE_DB_ENDPOINT` constant may be added for parity with endpoints like `CREATE_GUIDE_DB_ENDPOINT`).
- `src/shared/types/guides.types.ts` should add a `DeleteGuideDbResponse` type matching `{ version, message, error, data: { guide: { kraftId } } }`. The existing `CreateGuideDbResponse` envelope is the closest existing type.
- `src/shared/hooks/useNotification.tsx` already powers `Order`'s notification flow; reuse it for delete success feedback.

Tests:

- `__tests__/feature/Dashboard/Order.test.tsx` is the nearest neighbor and wraps `Order` in `QueryClientProvider`, mocks `useMediaQuery`, and mocks `getGuidesCb`/`getGuidesDbCb` as network callbacks. Add `deleteGuideDbCb` mock coverage to that file or a sibling.
- `__tests__/feature/Dashboard/GuideDbDetails.test.tsx` pattern (if it exists) is the reference for details-screen interaction tests; otherwise follow `__tests__/feature/Guides/Mn/CreateGuideModalMn.test.tsx` for Flowbite Modal + userEvent confirmation.

### Existing Patterns To Follow

App Router and client split:

- Keep the delete mutation in a client component under `src/features/**`; never call `${BACKEND_URI}` directly from the client.
- Keep the backend proxy in a route handler under `src/app/api/**/route.ts`.

TanStack Query:

- Use `useMutation` for the delete call, matching how `createGuideDbCb` is used via mutation.
- Invalidate `['guides', 'db', ...]` and `['guides', 'db', 'admin', ...]` query keys on success. The existing query keys are defined in `Order.tsx:82` and `Order.tsx:88`. Use `queryClient.invalidateQueries({ queryKey: ['guides', 'db'] })` to cover both regular and admin DB list queries without listing every key.
- Make the mutation call `deleteGuideDbCb(kraftId)` directly and let `Order` own the `onSuccess` invalidation.

Route handler proxy style:

- `src/app/api/guides-db/route.ts` already uses `getAccessToken()` with a 400 guard and `error.response.data.error.message` fallback. Match exactly.
- `src/app/api/ge-address/route.ts:68-97` is the closest DELETE handler: reads `addressId` from query params, guards missing value with 400, forwards to backend, returns upstream body with 200.
- For Guides DB, the `kraftId` is part of the path (`/guides/db/{kraft-id}`), not a query param. The Next dynamic route convention is `src/app/api/guides-db/[kraftId]/route.ts` exporting a `DELETE(request, context)` handler, OR adding a `DELETE` to the existing `src/app/api/guides-db/route.ts` and reading `kraftId` from a query param. The backend contract uses a path parameter, so the BFF should expose a path parameter too: prefer `src/app/api/guides-db/[kraftId]/route.ts` to mirror the backend shape. This is a planning-phase decision; raise as an open question if needed.

Flowbite React:

- Existing UI uses Flowbite `Button`, `Modal`, `TextInput`, `Spinner`, `Select`, `ToggleSwitch`. Reuse `Modal` for confirmation; no new dependency.

Forms:

- Not applicable; delete is a single mutation, not a form.

Styling:

- Tailwind v4 only; reuse `primaryButtonCSS`/existing danger styles. Do not introduce a new design system.
- The existing `GUIDES_DB_DELETED_MESSAGE` constant (`src/shared/constants/guides.constants.ts:291`) already formats the deleted banner; the delete confirmation modal can reuse nearby copy style.

### Testing Rules To Follow

Project-specific rules from `.github/copilot-instructions.md`:

- Use `userEvent` not `fireEvent` for the modal confirm click.
- Do not mock internal components from `@/features` or `@/shared`; render `GuideDbCard` and `GuideDbDetails` as-is.
- Mock `deleteGuideDbCb` (a network callback) via `axios` mock or `jest.mock` with relative imports (see existing `Order.test.tsx` use of mocked callbacks).
- Do not mock `next/image`.
- Do not use `document.querySelector`/`getElementById`; use semantic queries or `data-testid`. Existing cards already expose `data-testid="guide-db-details-button"` so a parallel `data-testid="guide-db-delete-button"` fits.
- Do not assert styling/classes.
- Preserve any `it.skip()` / `test.skip()`.
- Mock data must match real backend response shape: `{ version, message, error, data: { guide: { kraftId } } }`.

Smallest useful tests:

- BFF route: success returns 200 with the upstream envelope; missing access token returns 400; missing `kraftId` returns 400; upstream 4xx/5xx returns `{ message }` 400. (Route-handler tests are not common in this repo; skip if the team prefers, but at least cover the `deleteGuideDbCb` callback contract.)
- UI: delete button is hidden when `deletedAt != null`; button is rendered when `deletedAt` is null; clicking it opens the confirm Modal; confirming sends `deleteGuideDbCb` with the correct `kraftId`; on success the list query is invalidated and a success notification shows.
- Details: delete from details, on success `onBack` is invoked and list invalidates.

### Edge Cases And Constraints

- Existing BFF routes return mixed envelopes; this story's DELETE will return the backend's `{ version, message, error, data: { guide: { kraftId } } }` envelope on success, not a normalized shape.
- Missing session token currently returns 400, not 401; follow the existing pattern.
- Soft-deleted guide fields (`deletedAt`, `deletedBy`) may be null on live guides and non-null on deleted guides. The UI must hide the delete control when `deletedAt != null` and show it otherwise.
- A guide that is `status: failed` (provider creation failed) is still a valid Guides DB record and should be soft-deletable like any other.
- A guide currently shown in `Ver todas las guias` (admin source) where `includeDeleted` is true may already be soft-deleted; the card already shows the deleted banner. The delete control should remain hidden for those records, consistent with the regular list.
- Non-admin users must never see the hard-delete path. Hard delete is `Story 5` and is intentionally not implemented here.
- Mobile/tablet dashboard has a separate branch in `Dashboard.tsx`; `Order` is used in both, so the delete control and modal must work in both layouts.
- Pagination state in `Order` (`dbPage`, `dbLimit`) is preserved across invalidation because `queryClient.invalidateQueries` does not reset local React state; if the last item on a page is deleted, the page may now be empty. The user will see the empty state; that is acceptable for this story. If a smarter "decrement page when empty" behavior is desired, defer to the hard-delete story.
- `product-sat` uses `NEXT_PUBLIC_GET_SAT_PRODUCT_URI`, not `BACKEND_URI`; not affected here.
- Tests always collect coverage into `coverage/`; do not run tests during research.

### Dependencies And Integration Points

- No new dependencies. Flowbite `Modal`, `Button` already installed. TanStack Query, axios already in use.
- No new env vars. Backend delete endpoint is served by `BACKEND_URI`.
- Cross-feature integration: only `Order` (`Ver mis guias` and `Ver todas las guias` source) is affected. External guide list and `Crear guía` flow are untouched.

## Open Questions

Backend contract:

- I: Question: Does soft delete ever return non-2xx for guides that are already soft-deleted, or for `status: failed` guides?
  - Status: answered
  - Answer: No, it could return 4xx error if something went wrong.
  - Context: The UI hides the delete control when `deletedAt != null`, so a re-delete should not happen from the regular flow, but the BFF must still handle a backend 4xx (e.g., `GDE-BDN-010` "soft delete of a guide fails") with the standard `{ message }` 400 fallback.
- II: Question: Is the `kraftId` always URL-safe (no slashes/spaces), or does it need encoding on the BFF and backend path?
  - Status: answered
  - Answer: The kraftId is URL-safe (it is a `KFT-YYYYMM-NNNNNN` style identifier with only digits and hyphens), so it can be used as a path segment without additional encoding. Encode anyway as a defensive default.
  - Context: The observed `kraftId` format is `KFT-202607-000002`. Plan: use `encodeURIComponent` on the path segment in the BFF.
- III: Question: Does the soft-delete response ever populate `data.guide` with more fields than `kraftId`, or only `kraftId`?
  - Status: answered
  - Answer: No, just the response I gave.
  - Context: Response is exactly `{ version, message, error, data: { guide: { kraftId } } }`. UI must not depend on additional fields.
- IV: Question: For an admin soft-deleting from `Ver todas las guias` with `includeDeleted` true, should the deleted record remain in the list (with the existing deleted banner) until refetch, or be re-fetched and shown with `deletedAt` set?
  - Status: answered
  - Answer: For admins and regular users, the record should remain in the list until the refetch. The refetch is what removes the record; the BE should not return it after a successful delete (for both admins and regular users).
  - Context: For admins with `includeDeleted` true, the deleted record is still removed from the refetched list because the BE hides it. This is the desired behavior; do not rely on the deleted banner to keep it visible.

UI/product decisions:

- I: Question: What copy should the confirmation Modal use (title, body, confirm button, cancel button)?
  - Status: answered
  - Answer: Reuse the existing `useNotification` pattern only for errors (see IV). Modal copy: title `¿Deseas eliminar esta guia?`, body `Esta acción no se puede deshacer.`, confirm `Eliminar`, cancel `Cancelar`.
  - Context: Spanish copy consistent with the rest of the dashboard.
- II: Question: Should the delete control on `GuideDbCard` live inline with the "Ver detalles" button, or as a secondary smaller button on the card footer?
  - Status: answered
  - Answer: Use a Flowbite icon button following the example from Flowbite docs (Button with embedded Remixicon). The icon is `RiDeleteBinLine` from `@remixicon/react`, already used in `src/features/Addresses/AddressCard.tsx:2`. Search the planning phase for the exact existing icon-button implementation pattern in this repo before final placement.
  - Context: Card footer currently centers a single `primaryButtonCSS` `Ver detalles` button. The icon button should be a secondary, danger-styled control that complements `Ver detalles` without competing with it.
- III: Question: After a successful delete from `GuideDbDetails`, should the UI call `onBack` to return to the list, or stay on the details screen with the deleted banner visible?
  - Status: answered
  - Answer: Yes, if we are on guide db details, then go back.
  - Context: From details, "stay on the list" means calling `onBack` after a successful delete; the list invalidation and refetch then removes the record.
- IV: Question: Should the success notification reuse the existing `useNotification` hook/`Notification` atom used by the external guides error flow, or be a Flowbite Toast?
  - Status: answered
  - Answer: Do not show a notification on success, only on error.
  - Context: Errors use the existing `useNotification` + `Notification` atom pattern (reused, no new toast component). Success is silent and only signaled by the removed row from the refetched list.

Authorization:

- I: Question: Does the backend enforce that a regular user can only soft-delete their own guides (owned by the authenticated user)?
  - Status: answered
  - Answer: Yes, admin can do soft and hard delete. Regular user can only do soft delete.
  - Context: Backend enforces that regular users can only soft-delete their own guides. Admins can soft-delete (Story 4) and hard-delete (Story 5 stub). UI mirrors this: soft-delete control is rendered for both `user` and `admin` roles in `Ver mis guias` (since both own the guides shown there).
- II: Question: Can an admin soft-delete from `Ver todas las guias` guides owned by other users, or only their own?
  - Status: answered
  - Answer: No, only their own guides.
  - Context: Soft delete in `Ver mis guias` only operates on guides the current user owns. Admins viewing `Ver todas las guias` (others' guides) do not get a soft-delete control in this story; the admin `Ver todas las guias` source is for viewing/auditing only.

Create payload:

- Not applicable for delete.

## Assumptions

- The backend soft-delete endpoint is `DELETE /guides/db/{kraft-id}` and returns HTTP 200 with `{ version, message, error, data: { guide: { kraftId } } }` on success; it returns a 4xx error envelope that the BFF collapses to `{ message }` 400.
- The hard-delete endpoint `DELETE /guides/db/{kraft-id}/hard` is admin-only and out of scope for this story.
- Regular users perceive soft delete as a plain delete; the UI never mentions "soft" or "hard".
- The existing `getAccessToken()` + `Authorization: Bearer <token>` + 400-on-error BFF pattern is reused unchanged.
- The existing `Order` query keys (`['guides', 'db', month, year, page, limit]` and `['guides', 'db', 'admin', scope, includeDeleted, includeInternalPricing, month, year, page, limit]`) are invalidated via the shared prefix `['guides', 'db']` on delete success. The refetch then drops the deleted record for both regular and admin sources, regardless of `includeDeleted`.
- `GuideDbRecord.deletedAt` is the canonical "already-soft-deleted" signal and is already used by `GuideDbCard` and `GuideDbDetails` to show deleted banners.
- The delete callback lives in `src/shared/utils/guides.utils.ts` next to `getGuidesDbCb` and `createGuideDbCb`.
- No new dependency or env var is needed. The icon component (`RiDeleteBinLine`) and Flowbite `Button` are already installed.
- Admin hard delete is tracked as Story 5 in the epic stub and is not researched here.
- The `kraftId` is URL-safe in its observed format (`KFT-YYYYMM-NNNNNN`) and the BFF will additionally `encodeURIComponent` it as a defensive default.
- The delete control is only offered for guides owned by the current user. In `Ver mis guias` every guide is owned by the user, so the control is rendered (subject to `deletedAt == null`). In `Ver todas las guias` (admin source), guides belong to other users, so no soft-delete control is shown in this story.
- Success is silent (no notification). Errors use the existing `useNotification` + `Notification` atom.