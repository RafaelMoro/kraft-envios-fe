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
Status: answered
Answer: Ship the screenshot. **Done** — `public/landing-hero-quotes.webp`, 1200×1138, 34 KB. Extracted from the comp manifest (key `fcc5b1fc-…`, originally 1170×1110 PNG at 130 KB), re-cropped and re-exported by the user; the placeholder `.png` has been deleted. A markup rebuild is deferred as follow-up.
Context: Alt text is already written in `docs/landing-copy-es.md` §1. Render with `next/image`, explicit `width`/`height` (avoid CLS), and `priority` (LCP-adjacent).
Explanation: Two things surfaced during extraction that were not visible from the comp source and are **new work items**, see Open Questions IX and X below: the screenshot contains real courier **logos**, and it is **cropped on the right edge**.

**II:** Question: Do we have the right to display courier brand names (Estafeta, DHL, UPS, FedEx, Paquetexpress, AMPM, Tres Guerras) on a public marketing page?
Status: answered
Answer: Yes. Text-only courier names may be used in the marquee and the Paqueterías section. `docs/landing-copy-es.md` §14's checklist item is considered resolved for **names**.
Context: This answer covers plain text names, which is what the comp specifies. It does not settle logo usage — see Open Question IX, which is about logos baked into the hero screenshot.

**III:** Question: Should the landing show a different header CTA to an already-authenticated visitor (e.g. "Entrar a mi cuenta" → `/dashboard` instead of "Iniciar sesión" + "Crear cuenta")?
Status: answered
Answer: No. One static header for every visitor: "Iniciar sesión" → `LOGIN_ROUTE` and "Crear cuenta" → `REGISTER_ROUTE`. No `getAccessToken()` read on `/`.
Context: This preserves the static-rendering property Story 2 is built around — `/` must show as `○` in `pnpm build` output. The `docs/landing-copy-es.md` §2 "Entrar a mi cuenta" variant is not used.

**IV:** Question: Do the footer legal links point at `/privacidad` and `/terminos` (404 today) or at `#`?
Status: answered
Answer: Neither — **omit both links from the footer entirely for now.** No `Aviso de privacidad` link, no `Términos y condiciones` link, and no `#` placeholder. They are added when the pages actually ship.
Context: This removes the comp's fourth footer column ("Legal") of its only two entries. Story 2 must decide what that column becomes: either drop it and reflow the footer to 3 columns, or keep the column for the intermediary legal notice text that already lives in the footer. Recommendation: drop the empty column and let the footer grid become `1.4fr 1fr 1fr` on desktop; keep the intermediary notice as a full-width row above the copyright, where the comp already puts it.
Explanation: Nothing about this blocks Story 2 — it is a subtraction from the comp, not an addition.

### Copy contract

**V:** Question: Are the 🔴 blockers in `docs/landing-copy-es.md` §14 resolved well enough to publish?
Status: answered
Answer: Yes — proceed. The landing ships as a **first draft**; the remaining copy details are polished before the public launch. The outstanding items are tracked in `docs/improvement.md`, not in this research doc.
Context: Three of the four 🔴 blockers are already avoided by the comp's copy (no label PDF, no tracking states, no retry, no "sin mensualidad", no quoting without registration). The fourth — transfer-reference ownership — is sidestepped by the Saldo bullets, which never mention the disputed field.
Explanation: "First draft, polish later" is the operating mode for all copy. `docs/improvement.md` is the running list of what still needs a business decision before public launch.

**VI:** Question: Should the page `<title>` and `<meta description>` change for the whole app, or only for `/`?
Status: answered
Answer: Per route. Every page gets its own title and description, driven by a title **template** in the root layout so each route only declares its own leaf. This expands Story 2's scope slightly — it now touches `src/app/layout.tsx` and every existing page, not just `/`.
Context: Today `src/app/layout.tsx` is the only `export const metadata` in the entire `src/app` tree (verified by grep); every route inherits the literal title "Kraft Envios" (note: no accent). There is no `dashboard/layout.tsx`.

Recommended structure:

- **Root layout** — replace the flat title with a template so leaf routes stay one line each:
  - `title.default`: `Kraft Envíos | Cotiza y genera guías con varias paqueterías` (59 chars)
  - `title.template`: `%s | Kraft Envíos`
  - `description`: same as the landing description below (it is the app-wide fallback)
  - Keep the accent — the current value is unaccented "Kraft Envios" while all product copy uses "Kraft Envíos".

- **Per-route values.** Titles below are the *leaf* string; the template appends ` | Kraft Envíos`. `/` is the exception and must use `title: { absolute: … }` so it is not double-suffixed.

| Route | File | Title | Meta description | Robots |
| --- | --- | --- | --- | --- |
| `/` (landing) | `src/app/page.tsx` | `absolute`: `Kraft Envíos \| Cotiza y genera guías con varias paqueterías` | `Compara precios de Estafeta, DHL, FedEx, UPS y más en una sola cotización. Genera tu guía y administra todos tus envíos desde un solo lugar.` (139) | index |
| `/login` | `src/app/login/page.tsx` (Story 1) | `Iniciar sesión` | `Entra a tu cuenta de Kraft Envíos para cotizar con varias paqueterías, generar guías y administrar tu saldo.` (107) | `index: false` |
| `/register` | `src/app/register/page.tsx` | `Crear cuenta` | `Crea tu cuenta gratis y empieza a cotizar envíos con Estafeta, DHL, FedEx, UPS y más paqueterías desde un solo lugar.` (116) | index |
| `/forgot-password` | `src/app/forgot-password/page.tsx` | `Recuperar contraseña` | `Restablece el acceso a tu cuenta de Kraft Envíos. Te enviamos un enlace por correo para crear una contraseña nueva.` (114) | `index: false` |
| `/reset-password/[slug]` | `src/app/reset-password/[slug]/page.tsx` | `Restablecer contraseña` | `Crea una contraseña nueva para tu cuenta de Kraft Envíos.` (56) | `index: false, follow: false` |
| `/dashboard` | new `src/app/dashboard/layout.tsx` | `Panel` | `Tu panel de Kraft Envíos: cotiza, genera guías, administra tus direcciones y consulta tu saldo.` (94) | `index: false, follow: false` |
| `/dashboard/requests/[requestId]` | `src/app/dashboard/requests/[requestId]/page.tsx` | `Solicitud de saldo` | inherits the dashboard description | inherits `noindex` from the dashboard layout |

- **Open Graph.** Only `/` needs it, using `docs/landing-copy-es.md` §1: OG title `Un solo lugar para cotizar, enviar y administrar tus envíos`, OG description `Kraft Envíos reúne varias paqueterías en una plataforma: cotizas, eliges el precio que te conviene y generas tu guía en minutos.`

Rationale for the `robots` column: `/login`, `/forgot-password`, `/reset-password` are public but have no search value and would compete with the landing for brand queries; `/register` is an acquisition page and should stay indexable; `/dashboard/**` is authenticated and its request-detail route is an **email deep link** (`buildBalanceRequestDetailRoute`) that must never be indexed.

Explanation: Two blockers this raises, tracked as new questions below — no `metadataBase` / public site URL exists for absolute OG URLs (XI), and `<html lang="en">` is wrong for Spanish content (XII). Neither blocks Story 2's UI work, but both belong in the same change.

### Authorization

**VII:** Question: Does moving sign-in to `/login` invalidate any already-sent balance-request notification email?
Status: answered
Answer: No. The emails link to `/dashboard/requests/{requestId}` (`buildBalanceRequestDetailRoute`), never to `/`. The `/`→`/login` change only affects the *fallback* `router.push` inside `BalanceAdminRequestDetail.tsx` when its data query returns `400`, which is computed at click time in the browser.
Context: `REPO_CONTEXT.md` marks `buildBalanceRequestDetailRoute` as a stable email destination that must not change. It does not change here.

**VIII:** Question: Should `/login` still be the target of `revalidatePath` on sign-out?
Status: answered
Answer: Yes. `src/app/api/auth/sign-out/route.ts` calls `revalidatePath(LOGIN_ROUTE)`; once `LOGIN_ROUTE` is `/login` it revalidates the sign-in page, which is the intent. Story 1 additionally recommends revalidating `/` is **not** needed, because the landing is fully static and auth-independent.

### Raised by answering I, II, and VI

**IX:** Question: The extracted hero screenshot contains real courier **logos** — is that covered by the text-name approval in II?
Status: answered
Answer: Ship it in the first draft. The logo question is raised with the client and decided later; the callout is recorded in `docs/improvement.md` §4.1 alongside the existing logo item (§4).
Context: `public/landing-hero-quotes.webp` is a screenshot of the live quotes panel, so it renders the **AMPM wordmark and the DHL logo as raster images**, not text. This is a different use than §4's logo list — it is a product screenshot, which reads as descriptive use rather than promotional brand use, but it is above the fold and is the most prominent brand usage on the page.
Explanation: If the client does not clear it, the fallbacks in ascending cost are (a) re-capture with logos hidden via temporary CSS, (b) replace the logos with plain text inside the capture, (c) rebuild the mockup in markup — which is Question I's deferred option and also fixes the baked-in prices. `docs/improvement.md` §4.1 records all three, plus the aging data (three literal prices, the `🟡SMART` glyph, the `KFT-202607-…` folio badge, tracked as §5).

**X:** Question: The extracted screenshot is cropped — re-take it, and at what dimensions?
Status: answered
Answer: Re-crop it. **One file, not three.** Export a single `public/landing-hero-quotes.webp` at **1200 × 1140 px** (≈1.05:1, the current composition) and let `next/image` generate the responsive `srcset` — that is exactly what it is for, and shipping three hand-cut files would be worse.

**Delivered:** `public/landing-hero-quotes.webp` at **1200 × 1138, 34 KB** — on spec, and a 74% weight reduction from the extracted PNG. One residual, low-stakes: the right-edge bleed is still baked in (the cards are clipped at roughly x≈1133 and a sliver of a second card column shows from x≈1165 to the edge). Because it is in the raster, a panel `overflow-hidden` cannot remove it. If it should go, crop the source to **~1145 px wide** — that keeps the card plus its gutter, drops the sliver, and stays well above the 1034 px the 2× desktop render needs. Optional; the sliver arguably reads as "the panel continues", which is a normal product-screenshot convention.

Sizing derivation, from the comp's actual CSS:

- The hero container is `max-width: 1200px` with `padding: 0 28px` → 1144 px of content.
- The grid is `1.05fr 0.95fr` with a `56px` gap → the mockup column is `(1144 − 56) × 0.95/2` ≈ **517 CSS px** at the desktop maximum.
- The `<img>` is `width: 100%` inside the panel with no horizontal padding, so 517 px is its true desktop render width. At 2× DPR that needs a **1034 px** source; 1200 px gives comfortable headroom.

The one trap: when the hero **stacks to a single column** on tablet, the mockup becomes full-width. If the two-column breakpoint is `lg` (1024 px), the stacked image would render up to ~968 CSS px, which at 2× would demand a ~1936 px source — nearly 4× the file weight for the least important breakpoint.

**Fix that in CSS, not in the asset:** cap the stacked mockup panel with `max-w-[560px] mx-auto` (dropped at `lg` where the grid takes over). Then 517 px is the global maximum render width at every breakpoint and one 1200 px source covers everything.

Implementation notes for Story 2:
- Pass `sizes="(min-width: 1024px) 517px, min(560px, 100vw - 56px)"` so `next/image` picks the right variant instead of serving the largest.
- Declare `width={1200} height={1140}` to reserve layout space and avoid CLS.
- Keep the panel `overflow-hidden` so the frame does the cropping — do not depend on the source's exact aspect ratio, which lets the image be re-captured later without touching the layout.
- If a shorter hero is wanted, 1200 × 900 (4:3) showing three full rows also works; anything taller than ~1.2:1 starts pushing the CTAs off a laptop viewport.

Context: The current `public/landing-hero-quotes.png` is 1170 × 1110 with every quote card **clipped on the right edge** and a second column bleeding in — an accidental viewport crop, not a designed detail. Capture at a width where one card column is fully visible.

**XI:** Question: What is the production base URL, and should a `metadataBase` be configured?
Status: answered
Answer: Deferred to the polish phase. Recorded in `docs/improvement.md` §7. The first draft ships without `metadataBase`; Next.js will log a build warning about it, which is expected and not a regression.
Context: Two things are needed before public launch — a `NEXT_PUBLIC_SITE_URL` entry in `.env.example` + `AGENTS.md` for absolute OG/canonical URLs, and an actual **OG image** (1200×630), which `docs/landing-copy-es.md` §1 never specifies. Without the image, link shares to WhatsApp/Facebook/LinkedIn render with no preview.
Explanation: Story 2 still emits `openGraph.title` and `openGraph.description`; only the absolute-URL resolution and the image are deferred.

**XII:** Question: Should `<html lang>` change from `en` to `es-MX`?
Status: answered
Answer: Yes. Change `src/app/layout.tsx:31` from `<html lang="en">` to `<html lang="es-MX">` in the same change as the metadata work (VI).
Context: Every string in the app is Spanish. Today's `lang="en"` makes screen readers pick an English voice for Spanish text (an accessibility defect) and sends the wrong language signal for a page whose entire value is Spanish-language search.
Explanation: App-wide effect, so Story 2 should sanity-check that no existing test asserts on `lang`.

## Presentation Notes

Neither story proposes implementation code. Both stop at affected files, contracts, edge cases, and acceptance criteria, per the research phase boundary.
