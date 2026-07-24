# Design Handoff: Balance Epic Stories 3–5

**Objective:** Provide wireframes/layouts for Stories 3, 4, and 5 so implementation can proceed without structural rework.

**Timeline:** ~3–5 days for low-fidelity wireframes; can refine to high-fidelity later.

**Reference documents:**
- `ai-research/add-balance.epic.md` — full UX requirements, states, copy, constraints
- `DESIGN.md` — Flowbite, Tailwind v4, Geist Sans, dark mode, neutral dashboard surfaces, primary blue actions, danger red for destructive
- `src/shared/ui/organisms/Aside.tsx` — desktop persistent sidebar
- `src/shared/ui/organisms/HeaderMenuDrawer.tsx` — mobile persistent drawer
- `src/features/Order.tsx` — active precedent for admin list/detail, pagination, month/year filters, cards layout

---

## Story 3: Review And Cancel Own Requests

**Route:** `/dashboard` (accessed via dashboard screen state or nav item)

### Desktop Layout
- **Persistent sidebar** + main content area (see `Aside.tsx` precedent)
- **Content structure:**
  - Page heading / title
  - Optional: month/year filter (user requests are paginated; filtering is optional per research)
  - **Paginated request list** using cards (not tables; see `Order.tsx`)
  - Each card shows: amount (MXN), status badge, creation date, decision date (when present), payment reference (when approved)
  - **Cancel button** on pending requests only; triggers confirmation modal

### Mobile/Tablet Layout
- **Persistent header** + drawer menu (see `HeaderMenuDrawer.tsx` precedent)
- Same card-based list, stacked vertically
- Confirmation modal for cancellation (no in-place confirm needed)

### States to Design
1. **Loading** — skeleton cards or spinner
2. **Empty** — "No requests yet" message + entry point to create request
3. **Error** — error message + retry button
4. **Populated** — card list with pagination controls
5. **Submitting cancel** — disable button, show spinner
6. **Cancel success** — status updates to "Cancelada" (purple/neutral badge)
7. **Cancel conflict** — error toast + reload from backend

### Key Components
- **Request card:** Shows amount, status badge, dates, cancel button (pending only)
- **Pagination:** Page selector or prev/next (match `Order.tsx` pattern)
- **Confirmation modal:** "¿Cancelar solicitud?" + confirm/cancel buttons (danger red for confirm)
- **Status badges:** `Pendiente` (yellow/warning), `Aprobada` (green/success), `Rechazada` (gray), `Cancelada` (gray)

### Responsive Notes
- Cards stack on mobile; each card is full-width or slightly inset
- Cancel button should be touch-friendly (minimum 44px tap target)
- Pagination controls adapt to smaller screens

---

## Story 4: Admin Request Queue And Decisions

**Route:** `/dashboard` (accessed via dashboard screen state or nav item; admin-only)

### Desktop Layout
- **Persistent sidebar** + main content
- **Header/filters:**
  - Month dropdown (1–12)
  - Year input (numeric)
  - Status toggle: "Pendiente" / "Todas" (radio or button group)
  - Apply/filter button or auto-filter on change
- **Paginated request queue** using cards (precedent: `Order.tsx`)
- Each card shows: request amount, user name/email, status badge, creation date, payment reference (if approved), admin in charge (if assigned)
- **Expand/click card** to open detail panel/modal/drawer (decision pending; see below)

### Mobile/Tablet Layout
- Filters stack vertically, full-width inputs
- Same card list, stacked
- Detail opens in full-screen modal or drawer (to be decided)

### Detail View (Pending Request)
- **Read-only:** Request ID, amount, user info, creation date, timestamps
- **Decision section:**
  - **Approve button:** Opens inline form or modal with:
    - Label: "Referencia de pago"
    - Input field (required, non-empty validation)
    - Submit button (primary blue)
    - Cancel button
  - **Reject button:** Opens inline form or modal with:
    - Label: "Motivo (opcional)"
    - Textarea (optional)
    - Submit button (danger red)
    - Cancel button
- **Already-decided/cancelled request:** Show status badge, decision info (date, admin in charge), payment reference (if approved). No action buttons.

### States to Design
1. **Loading queue** — skeleton cards or spinner
2. **Empty queue** — "No requests" message (for selected month/filters)
3. **Error loading queue** — error message + retry
4. **Populated queue** — card list + pagination
5. **Loading detail** — spinner in detail panel
6. **Detail with pending request** — show approve/reject forms
7. **Detail with decided request** — read-only display of decision + info
8. **Submitting decision** — disable buttons, show spinner
9. **Decision success** — status badge updates, detail refreshes (or list reloads)
10. **Decision conflict** — error toast + reload from backend

### Key Components
- **Filter bar:** Month, Year, Status toggle + apply button (or auto-filter)
- **Request card:** Amount, user info, status badge, dates, expand/click affordance
- **Detail panel:** Can be full-screen modal, drawer, or inline card expansion (TBD—see recommendation below)
- **Approve form:** Payment reference input (required)
- **Reject form:** Reason textarea (optional)
- **Status badges:** Same as Story 3 + highlight pending (yellow/warning)

### Responsive Notes
- Filters stack vertically on mobile
- Detail panel should be full-screen or large drawer on mobile (not cramped inline)
- Form inputs must be touch-friendly (44px+ tap targets)

### Detail Panel Recommendation (TBD)
**Options:**
- **A) Full-screen modal** — allows breathing room for forms, but takes over the whole screen
- **B) Drawer/slide-out** — keeps queue partially visible, good for quick decisions
- **C) Inline card expansion** — simpler on desktop, harder on mobile

**Recommendation:** Start with **drawer** (option B)—it's a middle ground that works on desktop (shows queue + detail side-by-side) and mobile (swipe-dismissible full-screen drawer).

---

## Story 5: Email Deep Link To Admin Review

**Route:** `/dashboard/requests/{requestId}` (admin-only, deep-linkable from email)

### Layout
- Same persistent sidebar (desktop) + header (mobile) as dashboard
- **Full-page request detail** (similar to Story 4 detail, but standalone)

### Structure
- **Breadcrumb or back button** → `/dashboard` (or admin queue screen)
- **Request info section:** Amount, user name/email, status badge, creation/decision dates, payment reference (if approved)
- **Decision section (if pending):**
  - Approve form: payment reference (required)
  - Reject form: reason (optional)
- **Already-decided/cancelled:** Read-only display only

### States to Design
1. **Loading** — skeleton/spinner
2. **Loaded - pending request** — show decision forms
3. **Loaded - already decided** — read-only display
4. **Loaded - missing/not found** — error message + back button
5. **Loaded - unauthorized (non-admin)** — show Spanish unauthorized message + back to dashboard button
6. **Submitting decision** — disable buttons, spinner
7. **Decision success** — redirect to admin queue or show confirmation message + back button
8. **Decision conflict** — error toast + reload from backend

### Key Components
- **Detail card/panel:** Request info in a clean, centered card (similar to Story 4 detail)
- **Decision forms:** Same as Story 4 (Approve + Reject)
- **Unauthorized screen:** Spanish message: "No tienes acceso a esta solicitud. Esta página está disponible únicamente para administradores. Inicia sesión con una cuenta de administrador o vuelve al panel principal." + "Volver al panel" button
- **Back/navigation:** Breadcrumb or button to return to queue or dashboard

### Responsive Notes
- Full-page layout adapts to mobile (centered card, full-width form inputs)
- Back button should be visible and accessible on all screen sizes

---

## Shared Wireframe Notes

### Color/Styling (from DESIGN.md)
- Primary actions: Primary blue (Flowbite primary color)
- Destructive actions (cancel, reject): Danger red (Flowbite danger color)
- Status badges: Warning (pending), Success (approved), Gray/Neutral (rejected/cancelled)
- Background: Neutral dashboard surface (light mode: white/gray; dark mode: dark gray)
- Font: Geist Sans (existing)

### Flowbite Components to Leverage
- **Card** — request card container (existing precedent: `Order.tsx`)
- **Button** — primary (blue), danger (red), secondary (gray)
- **Modal/Drawer** — for confirmation dialogs and detail panels
- **Badge** — for status labels
- **Pagination** — for list navigation (existing precedent: `Order.tsx`)
- **Input/Textarea** — for forms
- **Spinner/Skeleton** — for loading states
- **Toast/Alert** — for error/success messages

### Accessibility
- Form labels linked to inputs
- Status badges have semantic color contrast (WCAG AA minimum)
- Touch targets ≥44px on mobile
- Keyboard navigation on all interactive elements
- Error messages associated with form fields

### Dark Mode
- All designs must work in light and dark mode (Flowbite handles most of this)
- Verify contrast in both themes
- No hard-coded colors; use Tailwind utility classes

---

## Handoff Checklist

- [ ] Wireframes for Story 3 (user request list + cancel flow)
- [ ] Wireframes for Story 4 (admin queue + decision flows)
- [ ] Wireframes for Story 5 (email deep-link detail page)
- [ ] Responsive layouts for desktop (sidebar) and mobile/tablet (header/drawer)
- [ ] All states documented (loading, empty, error, populated, submitting, conflict, etc.)
- [ ] Confirm detail panel approach (drawer vs modal vs inline) for Story 4
- [ ] Confirm decision form placement (inline vs modal vs separate panel)
- [ ] Verify Flowbite component usage and dark-mode behavior
- [ ] Reference existing patterns (`Order.tsx`, `Aside.tsx`, `HeaderMenuDrawer.tsx`)

---

## Questions for Designer

1. **Story 4 detail view:** Should it be a drawer (side-by-side on desktop, full-screen on mobile), a modal, or inline expansion? (Recommended: drawer)
2. **Mobile form UX:** For approval/rejection forms, prefer inline forms in the card or separate modal/drawer on small screens?
3. **Pagination style:** Match the existing `Order.tsx` pagination, or prefer a different pattern?
4. **Empty states:** Should they include an entry point to create a request (Story 2 already exists), or just a message?
5. **Error recovery:** Retry buttons, manual refresh, or auto-refresh after error?

---

## Next Steps

1. Designer creates low-fidelity wireframes using this brief
2. Team reviews + approves wireframes (1–2 day turnaround)
3. Implementation begins using wireframes as structure guide
4. High-fidelity design / polish can happen in parallel or after implementation starts
