# Public Landing Page At `/`

**Story of epic** — see `ai-research/landing-page.epic.md`.

**Date:** 2026-07-25
**Mode:** Full research
**Story number:** 2 of 2
**Depends on:** Story 1 (`move-signin-to-login.story-1.md`) — `/` must be free first.

## Story Definition

### Title

Build the public marketing landing page at `/`, re-mapped from the comp onto the existing design system.

### Description

Anonymous visitors arriving at `kraftenvios` have no way to learn what the product does — `/` is a login form. This story replaces it with the marketing landing specified by `comps/Kraft-Envios-Landing.html`, using the reviewed Spanish copy already committed at `docs/landing-copy-es.md`.

The comp is a bundled artifact from a design tool, not portable source. Its readable markup lives in a JSON-escaped `<script type="__bundler/template">` block and its assets in a base64 `<script type="__bundler/manifest">` block; the epic doc documents the extraction. The recovered template uses a templating dialect (`{{ }}`, `<sc-for>`, `<sc-if>`, `style-hover`, `sc-camel-on-click`) with no runtime in this repo. **Treat the comp as a layout and copy specification, not as code to port.**

Per the confirmed epic decisions, the comp is re-mapped onto `DESIGN.md`: same sections, same order, same hierarchy, same copy — but rendered with Geist Sans and the Flowbite `primary-*` scale, not the comp's Archivo/IBM Plex Mono and navy/cream/tan palette.

### Acceptance Criteria

1. `/` renders a public landing page with all twelve comp sections in order, using the copy from `docs/landing-copy-es.md`, and performs no auth cookie read and no redirect for any visitor.
2. All account CTAs resolve through the shared route constants: "Crear cuenta" → `REGISTER_ROUTE` (`/register`), "Iniciar sesión" → `LOGIN_ROUTE` (`/login`), footer "Mi saldo" → `DASHBOARD_ROUTE`. No hardcoded path strings. The header shows the same CTAs to every visitor — no authenticated personalization.
2b. The footer renders **no** `Aviso de privacidad` or `Términos y condiciones` link in any form.
2c. Every route listed in epic Open Question VI exports the title, description, and `robots` value specified there, and `/dashboard/**` is `noindex`.
3. The page uses Geist Sans and the Flowbite `primary-*` scale; it introduces no new font family and no new color tokens outside the Tailwind/Flowbite scales already in use.
4. The FAQ is an interactive accordion — one item open at a time, first item open by default — operable by keyboard and correctly announced by a screen reader.
5. The page is responsive: the comp's fixed multi-column grids (`1.05fr 0.95fr` hero, `repeat(3,…)`, `repeat(4,…)`, `repeat(2,…)`, `1.4fr 1fr 1fr 1fr` footer) collapse sensibly on mobile and tablet.
6. The page renders correctly with `data-theme="dark"` on `<html>` — light-only by design, so it must set its own surface colors rather than inherit the body's dark background.
7. `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`, `pnpm test`, and `pnpm design:lint` pass.

### Task Breakdown

1. ~~Extract the hero screenshot asset from the comp manifest into `public/`.~~ Done — `public/landing-hero-quotes.png`, pending the user's `.webp` re-export.
2. Create `src/features/Landing/` with one component per comp section.
3. Centralize the copy in `src/shared/constants/landing.constants.ts` (matching the repo's existing `*.constants.ts` convention) so the sections stay presentational.
4. Replace Story 1's temporary `/` redirect stub with `src/app/page.tsx` rendering the landing, plus a route-level `export const metadata`.
4b. Roll out per-route metadata across the app per epic Open Question VI: title template in `src/app/layout.tsx`, leaf metadata on every existing page, and a new `src/app/dashboard/layout.tsx` carrying the dashboard `noindex`.
5. Build the FAQ accordion as the one `'use client'` island.
6. Add tests under `__tests__/feature/Landing/`.
7. Record the light-only landing exception in `DESIGN.md` and run `pnpm design:lint`; update `REPO_CONTEXT.md`.

## Technical Research

### Affected areas

**Routes/pages**

| File | Change |
| --- | --- |
| `src/app/page.tsx` | Story 1's redirect stub is deleted and replaced with a server component rendering `features/Landing/Landing`. Adds `export const metadata` with the `docs/landing-copy-es.md` §1 title, description, and OG values. Must remain a server component with no cookie read so the route stays statically rendered. |

**Feature UI — new domain**

`src/features/Landing/` — one component per comp section, mirroring how `features/Login/` and `features/Balance/` are organized:

| Component | Comp section | Client? |
| --- | --- | --- |
| `Landing.tsx` | Page composition | server |
| `LandingHeader.tsx` | Sticky nav | server |
| `LandingHero.tsx` | Hero + mockup panel | server |
| `CourierMarquee.tsx` | Infinite courier scroll | server (CSS-only animation) |
| `ValueBar.tsx` | 3 numbered cards | server |
| `HowItWorks.tsx` | 4 step cards | server |
| `MidPageCta.tsx` | Banner | server |
| `PlatformFeatures.tsx` | 4 feature cards + perk pills | server |
| `AudienceGrid.tsx` | 4 dark cards | server |
| `CourierPanel.tsx` | Courier chips + disclaimer | server |
| `LandingFaq.tsx` | Accordion | **`'use client'`** |
| `LandingCta.tsx` | Dark closing panel | server |
| `LandingFooter.tsx` | 4-column footer + legal notice | server |

Only the FAQ needs client interactivity. Keeping every other section a server component matters: it is what lets `/` render statically and what keeps the landing's JS payload near zero. Do not blanket-`'use client'` the tree.

The comp also animates on scroll via an `IntersectionObserver` driving `[data-reveal]` attributes, and uses `style-hover` for hover states. Neither has a repo equivalent. Recommendation: express hover with Tailwind `hover:` utilities (free, server-safe), and either drop the scroll-reveal for v1 or implement it as a small shared client wrapper — it is decoration, not content, and the page must be fully readable without it.

**Shared constants**

| File | Change |
| --- | --- |
| `src/shared/constants/landing.constants.ts` | New. Holds the copy arrays the comp's `renderVals()` defines: `couriers` (7), `valueBullets` (3), `steps` (4), `features` (4, each with `tag`/`title`/`body`/`bullets`), `perks` (4), `audiences` (4), `faqs` (9). Matches the existing `quotes.constants.ts` / `balance.constants.ts` naming convention. |
| `src/shared/constants/global.constants.ts` | No change. `REGISTER_ROUTE`, `LOGIN_ROUTE`, `DASHBOARD_ROUTE`, `primaryButtonCSS`, and `secondaryButtonCSS` all already exist and are what the landing must import. |

**Shared types**

`src/shared/types/landing.types.ts` — new. Types for the copy structures above. Per `.github/copilot-instructions.md`, no `any` or `unknown`.

**Assets**

| File | Source |
| --- | --- |
| `public/landing-hero-quotes.webp` | **Already extracted** to `public/landing-hero-quotes.png` (manifest key `fcc5b1fc-57ff-4e9b-bd0e-64b02e699602`, 1170×1110, 130 KB). The user re-exports it as `.webp`; implementation references the `.webp` path and the `.png` is deleted once it lands. Render with `next/image` (`.github/copilot-instructions.md` forbids mocking `next/image` in tests, so it must be a real import), explicit `width`/`height`, `priority`. Alt text is specified in `docs/landing-copy-es.md` §1. |

`public/` already holds `kraft-logo.svg` and `kraft-logo-white.webp`; the comp draws the logo as styled text ("kraft" + "SOLUCIONES EN ENVÍOS"), which can be reproduced in markup or swapped for the existing SVG.

**Tests**

New under `__tests__/feature/Landing/`: `Landing.test.tsx` (renders headings and CTAs with correct `href`s from the constants) and `LandingFaq.test.tsx` (accordion open/close via `userEvent`, one-open-at-a-time, first-open-by-default).

**Docs**

| File | Change |
| --- | --- |
| `DESIGN.md` | Add a short "Landing" note: the landing route is light-only by design and sets explicit surface colors instead of inheriting the app's dark-mode body. Run `pnpm design:lint` after editing. |
| `REPO_CONTEXT.md` | Add the `Landing/` row to the features table and correct the `src/app/page.tsx` description (Story 1 already touches these lines). |

### Design re-mapping — the comp's tokens to this repo's

The confirmed decision is "re-map comp to DESIGN.md". Concretely:

| Comp value | Repo equivalent |
| --- | --- |
| Archivo (400–900) | Geist Sans (`--font-geist-sans`, already loaded in the root layout, weight range `100 900`) |
| IBM Plex Mono (eyebrows, chips, folio badge) | **Do not** substitute Geist Mono by default. `DESIGN.md` explicitly says to use Geist Mono only for true code/diagnostic blocks, not for IDs, prices, or metadata. Render the comp's mono eyebrows as small-caps/tracked Geist Sans (`text-xs uppercase tracking-widest`). |
| `#2b3990` primary navy | `primary-700` (`#1A56DB`) |
| `#1d2a75` hover navy | `primary-800` (`#1E429F`) |
| `#131b3f` ink / dark card bg | `gray-900` (`#111827`) |
| `#f6f4ef` / `#efece4` cream page bg | `gray-50` (`#F9FAFB`) / `white` |
| `#d9b98a`, `#c8a06a`, `#ecdcc3` tan accents | No equivalent in `DESIGN.md`. Drop the tan accent entirely or express those chips on the `primary-50`/`primary-100` scale. Do **not** add tan tokens. |
| `#4a5175`, `#3d4569`, `#6b7191` body/muted text | `gray-600` / `gray-500` |
| `#2e9e5b` success dot | Tailwind `green-500`-family, matching existing app usage |
| Custom radii `10–20px` | `rounded-lg` / `rounded-xl` / `rounded-2xl` |
| Inline `style="…"` throughout | Tailwind utilities. The comp is 100% inline-styled; none of it transfers. |
| CTA buttons | `primaryButtonCSS` / `secondaryButtonCSS` from `global.constants.ts`, per `DESIGN.md`'s "reuse existing shared button class strings before adding new abstractions" |

The net effect: the landing keeps the comp's *composition* (section rhythm, card grids, numbered steps, dark closing panel) and loses its *brand skin*. Flag this to the design owner — the comp reads as a rebrand, and shipping it in Flowbite blue will look meaningfully different from the mockup. That is the confirmed decision, but it should not be a surprise at review.

### Copy contract

`docs/landing-copy-es.md` is the source of truth, and the comp's `renderVals()` copy matches it. Copy that must **not** appear (blocked in `docs/landing-copy-es.md` §0 and §14):

- Label/etiqueta PDF download (🟡 backend has it; no frontend UI).
- The 8 tracking states, "En tránsito / En reparto / Entregada", or "rastrea" in the meta description.
- "Actualizar estatus con la paquetería".
- Guide-generation retry with cooldown.
- "Sin mensualidad. Pagas solo los envíos que generas." (🔴 unconfirmed by business).
- Any CTA offering to quote without registering (🔴 `/api/quotes` requires a token).

Copy that is confirmed and should be prominent (🟢, frontend-only, absent from the backend copy doc): CP-driven neighborhood/city/state autocomplete, SAT product-code search, copy-multiple-quotes-to-share, month/range-filterable guide history, the named 4-step wizard, envelope quoting, light/dark mode.

Terminology is a hard rule per §13: *paquetería* not "transportista", *guía* not "etiqueta", *folio* ≠ *rastreo*, tuteo throughout, MXN.

### Existing patterns to follow

- **Server/client split.** Default to server components; `'use client'` only for `LandingFaq`.
- **Route-level metadata.** `export const metadata` on `src/app/page.tsx` overrides the root layout's app-wide default without touching authenticated routes.
- **Constants convention.** Copy lives in `src/shared/constants/landing.constants.ts`, matching `quotes.constants.ts`, `balance.constants.ts`, `guides.constants.ts`.
- **Links.** `next/link` for internal navigation; plain `<a href="#anchor">` for in-page anchors.
- **Buttons.** The shared class strings, not new bespoke button components.
- **Flowbite.** Flowbite React has an `Accordion` component. Evaluate it for the FAQ before hand-rolling — but note that `DESIGN.md` records the dashboard's `createTheme` drawer override, and Flowbite theming is app-scoped; the landing is outside the dashboard `ThemeProvider`, so it gets Flowbite defaults.

### Testing rules to follow

Per `.github/copilot-instructions.md`:

- `userEvent`, never `fireEvent`, for the accordion.
- Do not mock any internal `@/features` or `@/shared` component, and do not mock `next/image`.
- No `document.querySelector` / `getElementById` — use `getByRole`, `getByText`, `getByRole('link', { name })`.
- **No styling assertions.** This is the sharp edge for a marketing page: there is a strong pull to assert colors, spacing, and classes. Do not. Test headings, copy, link destinations, and accordion behavior only.
- No `any` / `unknown`; type the copy structures properly.
- Assert link `href`s against the imported route constants (`REGISTER_ROUTE`, `LOGIN_ROUTE`), matching how `ResultCard.test.tsx` and `PersonalInformation.test.tsx` already do it.
- The landing needs no `QueryProviderWrapper` (no TanStack Query) and no `AppRouterContextProviderMock` unless a component uses `useRouter` — the FAQ should not.

### Dependencies and integration points

- **No new dependencies.** React, Tailwind v4, Flowbite React, `next/image`, `next/link` cover everything. Adding a package would require `package.json` + `pnpm-lock.yaml` changes and is out of scope.
- **No API routes.** The landing is fully static — no `src/app/api/**` calls, no TanStack Query, no backend contract.
- **No env vars.**
- The two web fonts the comp loads (Archivo, IBM Plex Mono, 14 `woff2` files in the manifest) are **not** needed given the re-map decision. Do not add them.

### Edge cases and constraints

- **Dark mode leakage.** The root layout stamps `data-theme={theme}` on `<html>` and `<body>` carries `dark:bg-gray-950 dark:text-gray-100`. A light-only landing whose sections don't set their own background will show dark page chrome around light cards for any visitor whose theme cookie is `dark`. Every landing section needs an explicit light surface class. This is the single most likely visual bug in this story.
- **`globals.css` sets `body { font-family: Arial, Helvetica, sans-serif }`** inside `@layer utilities`, while the root layout applies the Geist CSS variables as classes. Confirm which actually wins on the landing before assuming Geist renders — this is a pre-existing inconsistency the landing will expose.
- **Marquee accessibility.** The comp's infinite courier scroll is a 28s CSS `translateX` animation over a duplicated list. It must respect `prefers-reduced-motion`, and the duplicated half must be `aria-hidden` so screen readers don't read 14 courier names.
- **Fixed grids on mobile.** The comp has no media queries at all — it is desktop-only. Every `grid-template-columns` needs a responsive Tailwind treatment; the hero's `1.05fr 0.95fr` and the footer's `1.4fr 1fr 1fr 1fr` are the ones that break worst.
- **`text-wrap: pretty`** appears throughout the comp. `globals.css` already defines a `text-balance` utility; decide whether to add `text-pretty` or drop it. Cosmetic.
- **Hero mockup image weight.** 132 KB PNG above the fold. Convert to `.webp` (the repo already uses `.webp` for `kraft-logo-white.webp` and `empty-kraft-truck.webp`), set explicit `width`/`height` to avoid CLS, and mark it `priority` since it is LCP-adjacent.
- **The floating "folio KFT-202607-000123" badge** bakes a date into the design. Harmless, but it will read as stale in 2027.
- ~~**Footer legal links 404.**~~ Resolved — the legal links are omitted entirely (Open Question IX). No 404 risk.
- **Hero image is a real screenshot.** It contains AMPM/DHL logos and three literal prices, and it is clipped on the right edge. See epic Open Questions IX and X; the file at `public/landing-hero-quotes.webp` may be re-captured before launch, so build the hero frame with `overflow-hidden` and do not depend on the image's exact aspect ratio.
- **Footer "Mi saldo" → `/dashboard`.** For an anonymous visitor this bounces to the dashboard, which reads cookies and has no session. Verify the resulting experience is a clean redirect to `/login`, not an error — `src/app/dashboard/page.tsx` reads session cookies server-side and its behavior for a missing session must be checked, not assumed.
- **Static rendering.** After this story, `/` should appear as static (`○`) in `pnpm build` output. If it shows as dynamic (`ƒ`), something introduced a cookie or header read — find it.
- **Anchor links + sticky header.** `#como-funciona`, `#paqueterias`, `#faq`, `#top` scroll under the sticky header unless `scroll-margin-top` is set. The comp sets `html{scroll-behavior:smooth}` but no scroll margin — reproduce the smooth scroll, add the margin.

## Open Questions

### UI/product decisions

**I:** Question: Ship the comp's baked-in hero PNG, or rebuild the quotes mockup in markup?
Status: answered
Answer: Ship the PNG. Already extracted to `public/landing-hero-quotes.png` (1170×1110, 130 KB); the user is re-exporting it as `.webp`, so the implementation targets **`public/landing-hero-quotes.webp`** and the `.png` is a temporary placeholder. Markup rebuild deferred.
Context: Two follow-ups came out of the extraction and are tracked as epic Open Questions IX (the screenshot contains real AMPM/DHL **logos**, not text names) and X (it is clipped on the right edge). Neither blocks building the hero markup; both may change which file lands at that path.

**II:** Question: Keep the scroll-reveal animation (`IntersectionObserver` + `[data-reveal]`)?
Status: pending
Context: Implementing it means a client-component wrapper around otherwise-server sections, which erodes the "only the FAQ is client" property.
Explanation: This story assumes it is dropped for v1. The page must be fully readable without it either way, so it is purely additive polish.

**III:** Question: Flowbite `Accordion` or a hand-rolled FAQ?
Status: pending
Context: Flowbite is already a dependency and `DESIGN.md` says to reuse Flowbite components before adding abstractions. But the comp's FAQ has specific behavior (exactly one open, first open by default, `+`→`×` rotation) that may or may not map cleanly onto Flowbite's API.
Explanation: Try Flowbite first; hand-roll with `<button aria-expanded aria-controls>` only if it fights back.

**IV:** Question: Does the landing keep the comp's tan/gold accent in any form?
Status: pending
Context: `#d9b98a` / `#c8a06a` / `#ecdcc3` carry real visual weight in the comp (the floating folio badge, the numbered eyebrows, the feature tag chips, the CTA panel's radial gradient). The re-map decision removes them with no replacement, which flattens the design noticeably.
Explanation: This story assumes they map to the `primary-50`/`primary-100` scale. If the design owner wants the accent preserved, that is a `DESIGN.md` token addition and should be decided before implementation, not during review.

### Copy contract

**V:** Question: Which H1 variant ships?
Status: answered
Answer: Variant A — "Cotiza con varias paqueterías. / Genera tu guía en minutos." It is the recommended variant in `docs/landing-copy-es.md` §2 and the comp's default. The comp's `h1Variant` A/B/C prop is a design-tool affordance and is not carried into the implementation.

**VI:** Question: Is the 🔴 transfer-reference conflict resolved?
Status: pending
Context: See epic Open Question V. The comp's Saldo bullets sidestep the disputed field, so it does not block this story.

### Authorization

**VII:** Question: Should the landing personalize its header CTA for authenticated visitors?
Status: answered
Answer: No. One static header for every visitor. No `getAccessToken()` read on `/`; the route must stay statically rendered (`○` in `pnpm build`).

### Copy / SEO — added after the epic answered VI

**VIII:** Question: Which title and meta description does each route get?
Status: answered
Answer: Per-route metadata, driven by a `title.template` in the root layout. The full route-by-route table (titles, descriptions with character counts, and `robots` directives) is in **epic Open Question VI** — treat that table as this story's spec.
Context: This widens the story's file surface beyond `src/app/page.tsx`: it now also touches `src/app/layout.tsx` (title template, accent fix on "Kraft Envios" → "Kraft Envíos"), `src/app/login/page.tsx`, `src/app/register/page.tsx`, `src/app/forgot-password/page.tsx`, `src/app/reset-password/[slug]/page.tsx`, `src/app/dashboard/requests/[requestId]/page.tsx`, and a **new `src/app/dashboard/layout.tsx`** that exists only to carry the dashboard's metadata and `noindex`.
Explanation: Two prerequisites are still open — `metadataBase` / production URL (epic XI) and `<html lang="en">` → `es-MX` (epic XII). Neither blocks the section markup; both should land in the same change as the metadata.

**IX:** Question: What happens to the footer's Legal column now that the legal links are omitted?
Status: answered
Answer: The links are **removed entirely** — no `/privacidad`, no `/terminos`, no `#` placeholder. Recommended treatment: drop the now-empty fourth column and let the footer grid become `1.4fr 1fr 1fr` on desktop, keeping the intermediary legal notice as a full-width row above the copyright, where the comp already places it.
Context: Supersedes the "footer legal links 404" edge case listed above under *Edge cases and constraints* — that risk no longer exists.
