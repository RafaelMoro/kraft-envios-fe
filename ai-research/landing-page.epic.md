# Public Landing Page Epic Research

**Date:** 2026-07-25
**Branch observed:** `feat/add-landing`
**Mode:** Full research

## Story Definition

### Epic Title

Publish a public marketing landing page at `/` and relocate the sign-in screen to `/login`.

### Epic Description

Today `/` is the sign-in screen (`src/app/page.tsx` renders `features/Login/Login`). Every "back to start" affordance in the app — registration, forgot-password, reset-password, sign-out, the login-required modal, and the balance email deep link — points at `/` via the shared `LOGIN_ROUTE` constant.

The business wants `/` to become a public marketing landing page for anonymous visitors, with sign-in living at a dedicated `/login` route. The landing design is delivered as a comp in `comps/Kraft-Envios-Landing.html` and the Spanish copy is already reviewed and committed at `docs/landing-copy-es.md` (commits `970833d`, `f274d3d`).

This is an epic because the two halves have very different risk profiles. Moving the route is small, mechanical, and touches auth/redirect behavior that is already security-sensitive (open-redirect sanitization, email deep links). Building the landing is a large greenfield UI surface with nine sections, its own copy contract, and no existing marketing-page precedent in this repo.

### Scope Classification

Epic spanning two independently deliverable stories.

### Research Mode

Full research. Story 1 is contract/regression focused; Story 2 is UI/copy focused.

### User-Confirmed Decisions

Captured from the scoping questions at the start of this research:

1. **Structure:** epic with two stories. Story 1 (route move) ships first and unblocks Story 2.
2. **Visual system:** re-map the comp to `DESIGN.md`. Keep the comp's layout, section order, hierarchy, and copy, but render it with **Geist Sans** and the existing Flowbite `primary-*` scale. Do **not** introduce Archivo, IBM Plex Mono, or the comp's navy/cream/tan palette.
3. **Comp links:** every "Crear cuenta" CTA maps `/signup` → the existing `REGISTER_ROUTE` (`/register`). The footer legal links (`Aviso de privacidad`, `Términos y condiciones`) stay in the markup as placeholders, flagged TBD; the pages themselves are out of scope.
4. **Landing behavior:** light-mode only (the comp is light-only), the FAQ accordion is interactive (client component), and the landing is public to everyone — an authenticated visitor still sees the landing at `/` rather than being auto-redirected to `/dashboard`.

### Epic Acceptance Criteria

1. `/` serves a public marketing landing page to every visitor, authenticated or not, with no auth cookie read and no redirect.
2. `/login` serves the sign-in screen with the same behavior `/` has today: authenticated admins go to the sanitized `?redirect=` destination, all other authenticated users go to `/dashboard`, anonymous visitors see `features/Login/Login`.
3. Every in-app path that previously landed a user on `/` for sign-in now lands them on `/login`: register, forgot-password, reset-password, sign-out, the login-required modal, and the balance admin deep-link fallback.
4. The landing renders the reviewed `docs/landing-copy-es.md` copy — no invented claims, and none of the 🔴/🟡 blocked copy (label PDF, tracking states, retry, "sin mensualidad", "cotizar sin registro").
5. The landing is responsive across mobile, tablet, and desktop, and its interactive FAQ is keyboard- and screen-reader-accessible.
6. `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`, and `pnpm test` all pass.

## Story Breakdown

| # | Story | Doc | Depends on |
| --- | --- | --- | --- |
| 1 | Move the sign-in screen from `/` to `/login` | `ai-research/landing-page/move-signin-to-login.story-1.md` | — |
| 2 | Build the public landing page at `/` | `ai-research/landing-page/public-landing-page.story-2.md` | Story 1 |

Story 1 must land first. Until it does, `/` is occupied by the sign-in screen, so Story 2 has nowhere to mount.

## Shared Technical Research

### The comp is a bundled artifact, not readable source

`comps/Kraft-Envios-Landing.html` is a 511 KB self-unpacking bundle, not a hand-editable page. The real markup lives inside a JSON-escaped `<script type="__bundler/template">` block, and the assets live base64-encoded inside `<script type="__bundler/manifest">`.

To recover the design source and the hero screenshot:

```js
// node -e '...' from the repo root
const fs = require('fs')
const s = fs.readFileSync('comps/Kraft-Envios-Landing.html', 'utf8')

// 1. Readable markup + the component's data (copy arrays, FAQ state)
const template = JSON.parse(
  s.match(/<script type="__bundler\/template">\s*([\s\S]*?)\s*<\/script>/)[1]
)

// 2. Assets. The hero screenshot is the only image: mime image/png, ~132 KB,
//    manifest key fcc5b1fc-57ff-4e9b-bd0e-64b02e699602
const manifest = JSON.parse(
  s.match(/<script type="__bundler\/manifest">([\s\S]*?)<\/script>/)[1]
)
```

The recovered template uses a small templating dialect — `{{ expr }}`, `<sc-for list as>`, `<sc-if value>`, `style-hover="…"`, `sc-camel-on-click` — that has no runtime in this repo. Treat it as a **layout and copy specification** to be re-expressed as React + Tailwind, never as code to port.

### Comp inventory (section order, top to bottom)

| # | Section | Notes |
| --- | --- | --- |
| 1 | Sticky header / nav | Logo lockup, anchor links, `Iniciar sesión` + `Crear cuenta` CTAs |
| 2 | Hero | Eyebrow pill, H1 (variant A), subtitle, two CTAs, microcopy, product mockup panel with floating badges |
| 3 | Courier marquee | Infinite horizontal scroll of the 7 courier names |
| 4 | Value bar | 3 numbered cards |
| 5 | Cómo funciona | 4 numbered step cards |
| 6 | Mid-page CTA banner | Single line + `Crear cuenta` |
| 7 | La plataforma | 4 feature cards, each with a tag chip and a bullet list; followed by 4 "perk" pills |
| 8 | Para quién es | 4 dark cards |
| 9 | Paqueterías | Centered panel, 7 courier chips, availability disclaimer |
| 10 | FAQ | 9 accordion items, one open at a time, index 0 open by default |
| 11 | Cierre | Dark CTA panel, `Crear mi cuenta` + `Iniciar sesión` |
| 12 | Footer | 4 columns (brand, Producto, Cuenta, Legal), intermediary legal notice, copyright |

The comp's `renderVals()` block carries the literal copy for every list section. It matches `docs/landing-copy-es.md` — the copy doc remains the source of truth where the two differ.

### Route and redirect surface (relevant to both stories)

`LOGIN_ROUTE` in `src/shared/constants/global.constants.ts` is the single definition of the sign-in path, and every consumer imports it. That is the reason Story 1 is small: changing one constant value moves nearly all of them. A repo-wide grep for hardcoded root navigation (`push('/')`, `redirect('/')`, `href="/"`, `revalidatePath('/')`) returns **zero** hits outside the constant. There is no `middleware.ts`.

Consumers of `LOGIN_ROUTE` (9 source sites, 4 test sites) are enumerated in Story 1.

### Existing patterns both stories must follow

- **App Router split.** Pages under `src/app/**` are server components by default; anything with hooks, browser APIs, or router hooks needs `'use client'`.
- **Feature boundary.** Domain UI belongs in `src/features/<Domain>/`; cross-cutting primitives in `src/shared/{ui,hooks,utils,constants,types}`. A landing is a new domain — `src/features/Landing/`.
- **Design system.** `DESIGN.md` is the agent-readable source of truth. Geist Sans via `next/font/local` in the root layout; Flowbite `primary-*` for actions; shared button class strings `primaryButtonCSS` / `secondaryButtonCSS` in `global.constants.ts`. Run `pnpm design:lint` after any `DESIGN.md` edit.
- **Testing.** `.github/copilot-instructions.md` governs: `userEvent` not `fireEvent`, no mocking of internal `@/features` or `@/shared` components, no `document.querySelector`, no styling/CSS-class assertions, no `any`/`unknown`, relative import paths inside `jest.mock()`.
- **Page-component tests.** Page tests call the page as a plain async function with no arguments (`await HomePage()` in `__tests__/home.test.tsx`). Any props a page takes must be optional with a default, or the existing test throws on destructuring `undefined`.

### Constraints and non-goals

- No new runtime dependencies. Everything the landing needs (React, Tailwind v4, Flowbite React, `next/image`, `next/link`) is already present. A new dependency would require `package.json` + `pnpm-lock.yaml` changes and is out of scope.
- No dark-mode variants for the landing (user decision). The root layout still stamps `data-theme` on `<html>`; the landing must look correct with `data-theme="dark"` present, so it needs explicit light surface colors rather than inheriting the body's `dark:bg-gray-950`.
- No legal pages, no pricing section, no tracking/label/retry copy.
- No analytics, no cookie banner, no A/B variant switching. The comp exposes an `h1Variant` A/B/C prop; ship variant A only.
- No changes to any `src/app/api/**` route handler beyond the one `revalidatePath` call noted in Story 1.

## Open Questions

### UI/product decisions

**I:** Question: Should the hero mockup be the comp's baked-in PNG screenshot of the quotes panel, or a rebuilt HTML/CSS mock?
Status: pending
Context: The comp embeds a 132 KB PNG (manifest key `fcc5b1fc-…`) showing real AMPM and DHL quote rows with prices and a "crear guía" button. Shipping it means committing a raster asset to `public/` that will visibly age as the dashboard changes, and it bakes in specific prices. Rebuilding it in markup keeps it live and themeable but is meaningful extra work.
Explanation: Story 2's effort estimate depends on this. Recommendation: ship the PNG for v1 (with the alt text already written in `docs/landing-copy-es.md` §1), and note the rebuild as follow-up.

**II:** Question: Do we have the right to display courier brand names (Estafeta, DHL, UPS, FedEx, Paquetexpress, AMPM, Tres Guerras) on a public marketing page?
Status: pending
Context: `docs/landing-copy-es.md` §14 lists "Confirmar derecho de uso de los logos de paqueterías" as an unresolved pre-publication checklist item. The comp uses plain text names, not logos, which is the lower-risk form — but the marquee and the Paqueterías section both make the names prominent.
Explanation: Text-only is what the comp specifies and what Story 2 assumes. If logos are ever wanted, that is a separate decision.

**III:** Question: Should the landing show a different header CTA to an already-authenticated visitor (e.g. "Entrar a mi cuenta" → `/dashboard` instead of "Iniciar sesión" + "Crear cuenta")?
Status: pending
Context: `docs/landing-copy-es.md` §2 defines an alternate CTA for registered users: "Entrar a mi cuenta". The confirmed decision is that the landing is public to everyone and does not redirect, which leaves the door open to a personalized CTA. Doing it requires a server-side `getAccessToken()` read on `/`, which reintroduces the cookie-read cost and the SSR timing risk documented in `REPO_CONTEXT.md`.
Explanation: Story 2 assumes **no** personalization — one static header for everyone. Cheapest and lowest-risk for v1.

**IV:** Question: Do the footer legal links point at `/privacidad` and `/terminos` (404 today) or at `#`?
Status: pending
Context: The confirmed decision is "keep legal as placeholders". A link to a 404 is worse for trust than a disabled-looking link, but a `#` link is worse for a11y and for the eventual real page.
Explanation: Story 2 assumes the links render with their comp `href` values (`/privacidad`, `/terminos`) and that creating those pages is tracked as separate follow-up work, so the hrefs are correct the moment the pages exist.

### Copy contract

**V:** Question: Are the 🔴 blockers in `docs/landing-copy-es.md` §14 resolved well enough to publish?
Status: pending
Context: Four blockers are listed. Three are already handled by the comp's copy — it does not claim label PDFs, tracking states, retry, "sin mensualidad", or quoting without registration. The remaining live one is the transfer-reference ownership conflict (#1), which only affects the Saldo feature card's bullet list.
Explanation: The comp's Saldo bullets ("Solicita una recarga indicando el monto", "Confirmación por correo cuando se aprueba", "Cancela una solicitud mientras siga pendiente") avoid the disputed field entirely, so Story 2 can proceed. Flagging so the copy owner confirms rather than discovers it post-launch.

**VI:** Question: Should the page `<title>` and `<meta description>` change for the whole app, or only for `/`?
Status: pending
Context: `src/app/layout.tsx` currently exports app-wide `metadata` with title "Kraft Envios" and a description that reads like marketing copy. `docs/landing-copy-es.md` §1 defines a specific landing title and meta description, plus OG title/description.
Explanation: Story 2 assumes a route-level `export const metadata` on `src/app/page.tsx` for the landing values, leaving the layout default in place for every other route. That is the standard App Router pattern and avoids touching authenticated pages.

### Authorization

**VII:** Question: Does moving sign-in to `/login` invalidate any already-sent balance-request notification email?
Status: answered
Answer: No. The emails link to `/dashboard/requests/{requestId}` (`buildBalanceRequestDetailRoute`), never to `/`. The `/`→`/login` change only affects the *fallback* `router.push` inside `BalanceAdminRequestDetail.tsx` when its data query returns `400`, which is computed at click time in the browser.
Context: `REPO_CONTEXT.md` marks `buildBalanceRequestDetailRoute` as a stable email destination that must not change. It does not change here.

**VIII:** Question: Should `/login` still be the target of `revalidatePath` on sign-out?
Status: answered
Answer: Yes. `src/app/api/auth/sign-out/route.ts` calls `revalidatePath(LOGIN_ROUTE)`; once `LOGIN_ROUTE` is `/login` it revalidates the sign-in page, which is the intent. Story 1 additionally recommends revalidating `/` is **not** needed, because the landing is fully static and auth-independent.

## Presentation Notes

Neither story proposes implementation code. Both stop at affected files, contracts, edge cases, and acceptance criteria, per the research phase boundary.
