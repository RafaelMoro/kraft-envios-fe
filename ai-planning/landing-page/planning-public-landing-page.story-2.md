# Planning — Public Landing Page At `/`

**Story of epic** — epic research: `ai-research/landing-page.epic.md`
**Source research:** `ai-research/landing-page/public-landing-page.story-2.md`
**Story number:** 2 of 2 · **Depends on:** Story 1 (done, `cc3677f`)
**Date:** 2026-07-25
**Sign-off status:** research open questions I–IX all answered; two implementation decisions confirmed with the user during planning (see Assumptions).

## Assumptions

1. **`/` ships as dynamic (`ƒ`), not static (`○`).** Confirmed with the user. The root layout's `getThemePreference()` cookie read (`src/shared/lib/preferences.lib.ts` via `next/headers`) forces every route dynamic; this predates Story 1. AC 1's real requirement — no auth cookie read, no redirect on `/` — still holds. Removing the theme read from the root layout is explicitly **out of scope**.
2. **The accent ramp gets a fourth token, `accent-strong` (`#8A6A30`).** Confirmed with the user. Measured contrast on white: `#C8A06A` = 2.4:1 (fails AA for text), `#8A6A30` ≈ 5.0:1 (passes AA). The comp's tan-on-tan pairings already pass — `#3D2F14` on `#D9B98A` = 6.9:1 (folio badge), `#3D2F14` on `#ECDCC3` = 9.6:1 (feature tag chips). So: `accent` / `accent-muted` / `accent-subtle` are **surface/border/gradient only**; `accent-strong` is the only accent usable as text on a light surface.
3. **Footer "Mi saldo" → `/dashboard` for an anonymous visitor is a clean experience — verified, not assumed.** `src/app/dashboard/page.tsx` does not redirect; it renders `LoginRequiredModal` when `getAccessToken()` is empty, which shows "Vuelve a iniciar sesión para continuar" with a link to `LOGIN_ROUTE`. No error, no 404. No change needed.
4. **Copy source of truth is `docs/landing-copy-es.md`;** the comp's `renderVals()` block (extracted during planning) supplies the exact list-item strings, which match the copy doc. Where they differ, the copy doc wins.
5. **`metadataBase` and an OG image are deferred** (epic XI, `docs/improvement.md` §7). `openGraph.title` / `openGraph.description` still ship.

## Acceptance Criteria

Copied from the research doc:

1. `/` renders a public landing page with all twelve comp sections in order, using the copy from `docs/landing-copy-es.md`, and performs no auth cookie read and no redirect for any visitor.
2. All account CTAs resolve through the shared route constants: "Crear cuenta" → `REGISTER_ROUTE` (`/register`), "Iniciar sesión" → `LOGIN_ROUTE` (`/login`), footer "Mi saldo" → `DASHBOARD_ROUTE`. No hardcoded path strings. The header shows the same CTAs to every visitor — no authenticated personalization.
2b. The footer renders **no** `Aviso de privacidad` or `Términos y condiciones` link in any form.
2c. Every route listed in epic Open Question VI exports the title, description, and `robots` value specified there, and `/dashboard/**` is `noindex`.
3. The page uses Geist Sans and the Flowbite `primary-*` scale for typography and primary actions, and introduces no new font family. The one new token set is the decorative `accent` ramp (Q IV), declared in `DESIGN.md` and `globals.css` — no hardcoded hex or arbitrary Tailwind color values in components.
3b. The scroll-reveal wrapper and the FAQ are the only `'use client'` components, and all page content is present in the server-rendered HTML with JavaScript disabled.
4. The FAQ is an interactive accordion — one item open at a time, first item open by default — operable by keyboard and correctly announced by a screen reader.
5. The page is responsive: the comp's fixed multi-column grids collapse sensibly on mobile and tablet.
6. The page renders correctly with `data-theme="dark"` on `<html>` — light-only by design, so it must set its own surface colors rather than inherit the body's dark background.
7. `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`, `pnpm test`, and `pnpm design:lint` pass.

## Affected files

**`src/app/**`**

| File | Action |
| --- | --- |
| `src/app/page.tsx` | Modify — replace Story 1's redirect stub with the landing + `export const metadata` |
| `src/app/globals.css` | Modify — accent tokens, marquee/reveal/float keyframes, `text-pretty`, smooth scroll |
| `src/app/layout.tsx` | Modify — title template, `lang="es-MX"` |
| `src/app/login/page.tsx` | Modify — leaf `metadata` |
| `src/app/register/page.tsx` | Modify — leaf `metadata` |
| `src/app/forgot-password/page.tsx` | Modify — leaf `metadata` |
| `src/app/reset-password/[slug]/page.tsx` | Modify — leaf `metadata` |
| `src/app/dashboard/layout.tsx` | **Create** — metadata + `noindex` carrier only |
| `src/app/dashboard/requests/[requestId]/page.tsx` | Modify — leaf `metadata` |

**`src/features/Landing/**` (all new)** — `Landing.tsx`, `LandingHeader.tsx`, `LandingHero.tsx`, `CourierMarquee.tsx`, `ValueBar.tsx`, `HowItWorks.tsx`, `MidPageCta.tsx`, `PlatformFeatures.tsx`, `AudienceGrid.tsx`, `CourierPanel.tsx`, `LandingFaq.tsx` (client), `RevealOnScroll.tsx` (client), `LandingCta.tsx`, `LandingFooter.tsx`

**`src/shared/**`** — `constants/landing.constants.ts` (new), `types/landing.types.ts` (new). `constants/global.constants.ts` unchanged.

**`__tests__/**`** — `__tests__/feature/Landing/Landing.test.tsx` (new), `__tests__/feature/Landing/LandingFaq.test.tsx` (new), `__tests__/home.test.tsx` (new, page-level)

**Docs/assets** — `DESIGN.md`, `REPO_CONTEXT.md`. `public/landing-hero-quotes.webp` already in place (1200×1138, 34 KB) — no asset work.

**No changes:** `package.json`, `pnpm-lock.yaml`, `next.config.mjs`, `jest.config.ts`, any `src/app/api/**` route.

---

## Phase 1 — Design tokens, global CSS, `DESIGN.md`

### Changes Required

**`src/app/globals.css`** — Modify the existing `@theme` block (lines 5–8) and append to `@layer utilities`.

Add the accent ramp so `bg-accent`, `text-accent-strong`, `border-accent-muted` etc. become real utilities:

```css
@theme {
  --color-background: var(--background);
  --color-foreground: var(--foreground);

  /* Landing accent — decorative only. See DESIGN.md "Accent". */
  --color-accent: #C8A06A;
  --color-accent-strong: #8A6A30;
  --color-accent-muted: #D9B98A;
  --color-accent-subtle: #ECDCC3;
  --color-accent-ink: #3D2F14;

  --animate-marquee: marquee 28s linear infinite;
  --animate-floaty: floaty 5s ease-in-out infinite;

  @keyframes marquee {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  @keyframes floaty {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-10px); }
  }
}
```

Add the reveal primitive and the `text-pretty` companion to the existing `text-balance` utility:

```css
@utility text-pretty {
  text-wrap: pretty;
}

@layer utilities {
  /* existing :root / body / grid helpers stay as they are */

  html { scroll-behavior: smooth; }

  /* Scroll reveal. Default state is VISIBLE — the client wrapper opts an
     element into the hidden state on mount, so no-JS visitors see everything. */
  [data-reveal] {
    opacity: 0;
    transform: translateY(28px);
    transition: opacity .7s cubic-bezier(.2,.7,.2,1), transform .7s cubic-bezier(.2,.7,.2,1);
  }
  [data-reveal="in"] { opacity: 1; transform: none; }

  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    [data-reveal] { opacity: 1 !important; transform: none !important; transition: none !important; }
  }
}
```

Edge cases:

- `html { scroll-behavior: smooth }` is **app-wide**, not landing-scoped — `scroll-behavior` only works on the scrolling element, so it cannot live on a landing wrapper div. This is an intentional, small app-wide behavior change; it is neutralized under `prefers-reduced-motion`.
- Reduced motion is handled **entirely in CSS** (the block above plus Tailwind's `motion-reduce:` variant on the marquee/floaty elements). Do **not** call `window.matchMedia` in `RevealOnScroll` — jsdom has no `matchMedia`, and keeping it out of JS means the landing tests need no browser-API shim beyond `IntersectionObserver`.
- The `body { font-family: Arial… }` rule inside `@layer utilities` (line 49) is a pre-existing inconsistency flagged by research. **Leave it.** The root layout applies `${geistSans.variable}` as a class but never sets `font-family` from it, so Arial currently wins app-wide. Fixing that changes typography on every existing screen and is out of this story's scope. The landing gets Geist by setting `font-[family-name:var(--font-geist-sans)]` on its own root element (Phase 3) — record this in the DESIGN.md landing note and in Open Questions below.

**`DESIGN.md`** — Modify the frontmatter `colors:` map and add two short prose sections.

Frontmatter additions under `colors:`:

```yaml
  accent: "#C8A06A"
  accent-strong: "#8A6A30"
  accent-muted: "#D9B98A"
  accent-subtle: "#ECDCC3"
  accent-ink: "#3D2F14"
```

New "Accent" subsection under `## Colors`, stating: decorative only — badges, chips, eyebrows, gradients, marquee separators; **never** for primary actions, links, focus, or state, which stay on `primary-*`. Contrast rules, with the measured numbers: `accent-strong` is the only accent token allowed as text on a light surface (≈5.0:1 on white); `accent` on white is 2.4:1 and fails AA; `accent-ink` on `accent-muted` (6.9:1) and on `accent-subtle` (9.6:1) are the approved tan-on-tan pairings.

New "Landing" note under `## Do's and Don'ts` (or its own short section), recording three exceptions:

1. The `/` landing is **light-only by design** and sets explicit light surface colors on every section instead of inheriting the app body's `dark:bg-gray-950`.
2. The landing FAQ is a **hand-rolled accordion**, a deliberate exception to "reuse Flowbite React components first" — the landing renders outside the dashboard `ThemeProvider`, so Flowbite would apply untuned defaults, and the comp requires exactly-one-open with first-open-by-default.
3. The landing sets its own Geist font-family class because `globals.css` still declares `body { font-family: Arial… }`.

### Success Criteria

- **Automated:** `pnpm design:lint` · `pnpm build` (proves the new `@theme` block compiles and the utilities are generated)
- **Manual:** none this phase.

### Test Coverage

None — tokens and CSS only. Per `.github/copilot-instructions.md`, styling is not asserted in tests.

---

## Phase 2 — Copy constants and types

### Changes Required

**`src/shared/types/landing.types.ts`** — Create.

```ts
export interface LandingValueBullet { num: string; title: string; body: string }
export interface LandingStep { num: string; title: string; body: string }
export interface LandingFeature { tag: string; title: string; body: string; bullets: readonly string[] }
export interface LandingAudience { title: string; body: string }
export interface LandingFaqItem { question: string; answer: string }
```

No `any` / `unknown`. Use `readonly` arrays so the constants can be `as const` without widening.

**`src/shared/constants/landing.constants.ts`** — Create. Matches the `quotes.constants.ts` / `balance.constants.ts` convention (typed exported consts, no default export).

Exports and their exact contents (verbatim from the comp's `renderVals()`, cross-checked against `docs/landing-copy-es.md`):

| Export | Type | Contents |
| --- | --- | --- |
| `LANDING_COURIERS` | `readonly string[]` | `Estafeta, DHL, UPS, FedEx, Paquetexpress, AMPM, Tres Guerras` (7, in this order) |
| `LANDING_VALUE_BULLETS` | `readonly LandingValueBullet[]` | `01` Un formulario, varias cotizaciones · `02` Guías en cuatro pasos · `03` Todo en un panel (bodies from copy §3 / comp) |
| `LANDING_STEPS` | `readonly LandingStep[]` | `1` Cotiza · `2` Elige · `3` Genera tu guía · `4` Administra (bodies from copy §4 / comp) |
| `LANDING_FEATURES` | `readonly LandingFeature[]` | tags `COTIZACIÓN` (4 bullets), `GUÍAS` (3), `SALDO` (3), `DIRECCIONES` (3) — comp lines for §5.1, 5.2, 5.5, 5.6 |
| `LANDING_PERKS` | `readonly string[]` | 4 pills, comp `perks` array |
| `LANDING_AUDIENCES` | `readonly LandingAudience[]` | Tiendas en línea · Venta en marketplaces · Pymes y emprendedores · Venta por redes (copy §6) |
| `LANDING_FAQS` | `readonly LandingFaqItem[]` | 9 items, comp `faqData` order — note the comp **omits** the 🔴 "¿El precio que veo es el final?" and the ⚠️ "¿Cuánto tarda en aprobarse mi recarga?" / cobertura questions. Ship the comp's 9 exactly. |
| `LANDING_COURIER_DISCLAIMER` | `string` | Copy §7 nota al pie (mandatory) |
| `LANDING_LEGAL_NOTICE` | `string` | Copy §12 aviso legal al pie (mandatory) |
| `LANDING_HERO_IMAGE_ALT` | `string` | `Panel de Kraft Envíos mostrando cotizaciones de varias paqueterías para un mismo envío` (copy §1 — **not** the comp's alt text) |

**Scope note:** single-use headings, subtitles, and CTA labels stay inline in their section component; only repeated/list/long-form copy is centralized. This keeps the constants file readable and the sections self-describing, and is enough for AC 1's "sections stay presentational".

**Copy that must NOT appear anywhere** (research "Copy contract", copy doc §0/§14) — verify while transcribing: label/etiqueta PDF, the 8 tracking states, "En tránsito"/"En reparto"/"Entregada", "rastrea" in meta copy, "Actualizar estatus con la paquetería", retry cooldown, "Sin mensualidad…", any CTA offering to quote without registering. Terminology is a hard rule: *paquetería* (never "transportista"), *guía* (never "etiqueta"), *folio* ≠ *rastreo*, tuteo, MXN.

### Success Criteria

- **Automated:** `pnpm exec tsc --noEmit` · `pnpm lint`
- **Manual:** none.

### Test Coverage

None directly — the constants are exercised by the Phase 8 tests, which assert copy through the rendered components.

---

## Phase 3 — Route swap and landing shell (header, hero, marquee)

### Changes Required

**`src/app/page.tsx`** — Modify (full rewrite; the Story 1 stub is deleted).

```tsx
import type { Metadata } from 'next'
import { Landing } from '@/features/Landing/Landing'

export const metadata: Metadata = {
  title: { absolute: 'Kraft Envíos | Cotiza y genera guías con varias paqueterías' },
  description: 'Compara precios de Estafeta, DHL, FedEx, UPS y más en una sola cotización. Genera tu guía y administra todos tus envíos desde un solo lugar.',
  openGraph: {
    title: 'Un solo lugar para cotizar, enviar y administrar tus envíos',
    description: 'Kraft Envíos reúne varias paqueterías en una plataforma: cotizas, eliges el precio que te conviene y generas tu guía en minutos.',
    type: 'website',
    locale: 'es_MX',
  },
}

export default function HomePage() {
  return <Landing />
}
```

Edge cases:
- **Not `async`**, no `getAccessToken()`, no `cookies()`, no `redirect()` — AC 1 and epic Q VII. Also keeps the page component callable as `HomePage()` with no arguments in tests.
- `title.absolute` is required so the root layout's `%s | Kraft Envíos` template does not double-suffix.

**`src/features/Landing/Landing.tsx`** — Create. Server component, page composition, no props.

```tsx
export const Landing = () => (
  <div className="min-h-screen bg-gray-50 text-gray-900 font-[family-name:var(--font-geist-sans)]">
    <LandingHeader />
    <main>
      <LandingHero />          {/* contains CourierMarquee */}
      <ValueBar />
      <HowItWorks />
      <MidPageCta />
      <PlatformFeatures />
      <AudienceGrid />
      <CourierPanel />
      <LandingFaq />
      <LandingCta />
    </main>
    <LandingFooter />
  </div>
)
```

Section order is AC 1 and must match the comp's 12-section inventory. Phases 3–6 fill this in; wire each component as it lands so `/` is viewable at the end of every phase.

**AC 6 rule, applies to every section component in Phases 3–5:** each section root sets an explicit light surface (`bg-white`, `bg-gray-50`, or the dark-panel `bg-gray-900`) and explicit text color. **No `dark:` variants anywhere in `src/features/Landing/`.** The body still carries `dark:bg-gray-950 dark:text-gray-100`; the landing root above overrides it for the full page height.

**Shared layout idiom** for all sections: `mx-auto max-w-[1200px] px-7` (the comp's 1200 px / 28 px container).

**`src/features/Landing/LandingHeader.tsx`** — Create. Server component.

- `<header className="sticky top-0 z-50 border-b border-gray-200 bg-gray-50/85 backdrop-blur">` + `<nav>` in the shared container.
- Logo lockup: `<a href="#top">` wrapping "kraft" (`text-2xl font-black tracking-tight text-primary-700`) over "SOLUCIONES EN ENVÍOS" (`text-[9px] uppercase tracking-[0.14em] text-gray-600`). Comp's IBM Plex Mono eyebrow → tracked Geist Sans per the re-map table; do **not** use Geist Mono.
- Anchor links `#como-funciona`, `#paqueterias`, `#faq` — plain `<a>`, hidden below `md` (`hidden md:flex`) so the mobile header keeps only the two CTAs.
- `Iniciar sesión` → `<Link href={LOGIN_ROUTE}>`; `Crear cuenta` → `<Link href={REGISTER_ROUTE} className={primaryButtonCSS}>`. Both constants imported from `@/shared/constants/global.constants` (AC 2). No `getAccessToken()`, no conditional rendering (epic Q VII).
- Reuse `LinkButton` from `@/shared/ui/atoms/LinkButton` where a plain shared button suffices; it already maps `type="primary"|"secondary"` onto the shared class strings and renders `next/link`.

**`src/features/Landing/LandingHero.tsx`** — Create. Server component, `id="top"`.

- Root: `<section id="top" className="scroll-mt-24 bg-gray-50">`, inner grid `grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center` inside the shared container with `py-16 lg:py-22`.
- Eyebrow pill: `7 PAQUETERÍAS · 1 PLATAFORMA`, `text-xs uppercase tracking-widest text-primary-700 bg-primary-50 border border-primary-100 rounded-full`, with the comp's pulsing dot as a `<span aria-hidden="true">`.
- `<h1>`: variant A only (epic Q V) — `Cotiza con varias paqueterías.` `<br/>` `<span className="text-primary-700">Genera tu guía en minutos.</span>`, `text-4xl sm:text-5xl lg:text-[58px] font-black tracking-tight text-pretty`.
- Subtitle: copy §2 subtítulo A. Microcopy under the CTAs: `Crea tu cuenta gratis y cotiza sin compromiso.`
- CTAs: `Crear cuenta y cotizar` → `REGISTER_ROUTE` (primary), `Ver cómo funciona` → `<a href="#como-funciona">` (secondary). **Not** "Cotizar mi envío" and never a quote-without-account CTA (🔴 copy §14).
- Mockup panel: `relative mx-auto w-full max-w-[560px] lg:max-w-none` (epic Q X — caps the stacked render at 560 px so one 1200 px source covers every breakpoint). Frame: `overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl`, browser-chrome dots row, three query chips (`72000 → 94298`, `2.5 kg`, `30 × 20 × 15 cm`) as tracked Geist Sans, then:

```tsx
<Image
  src="/landing-hero-quotes.webp"
  alt={LANDING_HERO_IMAGE_ALT}
  width={1200}
  height={1138}
  priority
  sizes="(min-width: 1024px) 517px, min(560px, 100vw - 56px)"
  className="block h-auto w-full"
/>
```

- Floating badges: `folio KFT-202607-000123` on `bg-accent-muted text-accent-ink`, and `Guía generada` with a `bg-green-500` dot on white. Both `absolute`, `animate-floaty motion-reduce:animate-none`. Hide them below `sm` (`hidden sm:block`) so they do not overflow a phone viewport.

Edge cases:
- `overflow-hidden` on the frame is required — the source still has a right-edge bleed baked in (epic Q X), and the frame must not depend on the image's exact aspect ratio so the asset can be re-captured later.
- `.github/copilot-instructions.md` forbids mocking `next/image`, so this must be a real static import path under `public/`.

**`src/features/Landing/CourierMarquee.tsx`** — Create. Server component, CSS-only animation, rendered at the bottom of the hero section.

- Outer: `overflow-hidden border-t border-gray-200 bg-gray-100 py-4`.
- Track: `flex w-max gap-14 animate-marquee motion-reduce:animate-none`, containing `LANDING_COURIERS` twice.
- The **second copy must be `aria-hidden="true"`** so a screen reader reads 7 names, not 14. Separator `·` is `text-accent` (decorative, not text content) and `aria-hidden`.

### Success Criteria

- **Automated:** `pnpm lint` · `pnpm exec tsc --noEmit` · `pnpm build`
- **Manual:** `pnpm dev` → `/` renders the header and hero, no redirect to `/login`. Check at 375 px, 768 px, 1440 px: hero stacks to one column below `lg`, the mockup never exceeds ~560 px wide, no horizontal page scroll. Set the theme cookie to dark (toggle dark mode from `/dashboard`, then navigate to `/`) and confirm the landing is still fully light (AC 6). Marquee scrolls; with "Reduce motion" enabled in macOS System Settings it does not.

### Test Coverage

Deferred to Phase 8 — the landing is not meaningfully testable until all sections exist.

---

## Phase 4 — Mid sections (value bar, cómo funciona, banner, plataforma)

### Changes Required

All four are server components in `src/features/Landing/`, each consuming its constant array. Grid mapping (AC 5) — the comp has no media queries at all, so every grid needs a responsive treatment:

| Component | Comp grid | Tailwind |
| --- | --- | --- |
| `ValueBar` | `repeat(3, 1fr)` | `grid gap-5 sm:grid-cols-2 lg:grid-cols-3` |
| `HowItWorks` | `repeat(4, 1fr)` | `grid gap-4 sm:grid-cols-2 lg:grid-cols-4` |
| `PlatformFeatures` | `repeat(2, 1fr)` | `grid gap-5 md:grid-cols-2` |

**`ValueBar.tsx`** — 3 cards from `LANDING_VALUE_BULLETS`. Card: `rounded-xl border border-gray-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl`. The `01/02/03` numeral uses **`text-accent-strong`** (Assumption 2 — `text-accent` would fail AA here), `text-xs tracking-widest`. Title `<h3>`, body `text-pretty text-gray-600`.

**`HowItWorks.tsx`** — `id="como-funciona"`, `scroll-mt-24` (sticky-header offset). Eyebrow `CÓMO FUNCIONA` (`text-xs uppercase tracking-widest text-primary-700`), `<h2>` "Enviar no tiene que ser complicado", subtitle "Cuatro pasos, de la cotización a la guía generada.", then 4 cards from `LANDING_STEPS`. The oversized ghost numeral is `absolute` with `text-primary-700/10` and **`aria-hidden="true"`** — it duplicates the step order already conveyed by the card sequence.

**`MidPageCta.tsx`** — Banner: `rounded-2xl bg-primary-700 p-8` with the comp's tan radial gradient expressed as `bg-[radial-gradient(circle_at_85%_20%,theme(colors.accent-muted/22%),transparent_45%)]`, or an equivalent overlay `<div aria-hidden>` if the arbitrary-gradient syntax fights the linter. Text "Deja de cotizar paquetería por paquetería." + `Crear cuenta` → `REGISTER_ROUTE`. On `bg-primary-700` the white-fill `primaryButtonCSS` reads wrong — use a white button (`bg-white text-primary-700 hover:bg-gray-100`) as the comp does; this is the one place a bespoke button string is justified, since the shared strings assume a light background.

**`PlatformFeatures.tsx`** — Eyebrow `LA PLATAFORMA`, `<h2>` "Todo tu envío, en un solo panel", 4 cards from `LANDING_FEATURES`. Tag chip: `bg-accent-subtle text-accent-ink text-xs uppercase tracking-widest rounded-md px-2.5 py-1` (9.6:1, passes). Bullets: a real `<ul>`/`<li>` — the comp uses `<div>`s with a `→` glyph; use a list for semantics and mark the glyph `aria-hidden`. Perk pills from `LANDING_PERKS`: `flex flex-wrap gap-3.5`, each `rounded-full border border-primary-100 bg-primary-50 px-4 py-2 text-primary-700`.

### Success Criteria

- **Automated:** `pnpm lint` · `pnpm exec tsc --noEmit` · `pnpm build`
- **Manual:** `/` at 375/768/1440 px — no grid overflows, cards stack sensibly, the `#como-funciona` header link lands with the heading clear of the sticky header (verifies `scroll-mt-*`).

### Test Coverage

Deferred to Phase 8.

---

## Phase 5 — Lower sections (audiencias, paqueterías, cierre, footer)

### Changes Required

**`AudienceGrid.tsx`** — Eyebrow `PARA QUIÉN ES`, `<h2>` "Hecho para quien envía todos los días", 4 dark cards from `LANDING_AUDIENCES`: `rounded-xl bg-gray-900 p-6` with `text-white` titles and `text-gray-300` bodies. Grid `grid gap-4 sm:grid-cols-2 lg:grid-cols-4`. These cards are dark **by design** in a light-only page — no `dark:` variants.

**`CourierPanel.tsx`** — `id="paqueterias"`, `scroll-mt-24`. Centered white panel `rounded-2xl border border-gray-200 bg-white p-10 text-center`. `<h2>` "Las paqueterías que ya conoces", subtitle from copy §7, then 7 chips from `LANDING_COURIERS` (`rounded-lg border border-gray-200 bg-gray-50 px-6 py-3.5 font-extrabold`). Ends with `LANDING_COURIER_DISCLAIMER` in `text-xs text-gray-500` — **mandatory copy**, do not drop it. Text names only; no courier logos (epic Q II covers names, not logos).

**`LandingCta.tsx`** — Dark closing panel `rounded-2xl bg-gray-900 px-10 py-18 text-center` with the comp's two radial gradients (primary + accent) as `bg-[radial-gradient(...)]` or an `aria-hidden` overlay. `<h2>` "Tu próximo envío empieza aquí", copy §8, then `Crear mi cuenta` → `REGISTER_ROUTE` (white button) and `Iniciar sesión` → `LOGIN_ROUTE` (outlined white). Same rationale as `MidPageCta` for not using the shared button strings on a dark panel.

**`LandingFooter.tsx`** — `id`-less `<footer>` in the shared container.

- **Three** columns, not four (research Q IX / epic Q IV): brand+tagline, `PRODUCTO`, `CUENTA`. `grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]`.
- `PRODUCTO`: `Cotizar` → `REGISTER_ROUTE` (the comp points it at signup, since quoting requires an account), `Cómo funciona` → `#como-funciona`, `Paqueterías` → `#paqueterias`, `Preguntas frecuentes` → `#faq`.
- `CUENTA`: `Iniciar sesión` → `LOGIN_ROUTE`, `Crear cuenta` → `REGISTER_ROUTE`, `Mi saldo` → `DASHBOARD_ROUTE`.
- **AC 2b:** no `Aviso de privacidad`, no `Términos y condiciones`, no `#` placeholder, no empty Legal column.
- Full-width row above the copyright: `LANDING_LEGAL_NOTICE` (mandatory, copy §12), then `© 2026 Kraft Envíos. Todos los derechos reservados.`

Edge case: `Mi saldo` → `/dashboard` for an anonymous visitor lands on the dashboard shell, which renders `LoginRequiredModal` (Assumption 3). Verified behavior, no guard needed here.

### Success Criteria

- **Automated:** `pnpm lint` · `pnpm exec tsc --noEmit` · `pnpm build`
- **Manual:** `/` bottom half at 375/768/1440 px. Confirm the footer has exactly three columns and no legal links. Click `Mi saldo` while signed out and confirm the login-required modal, not an error.

### Test Coverage

Deferred to Phase 8.

---

## Phase 6 — Client islands: FAQ accordion and scroll reveal

These are the **only** two `'use client'` files in `src/features/Landing/` (AC 3b).

### Changes Required

**`src/features/Landing/LandingFaq.tsx`** — Create. `'use client'`.

- `id="faq"`, `scroll-mt-24`. Container `mx-auto max-w-[860px] px-7`. Eyebrow `FAQ`, `<h2>` "Preguntas frecuentes".
- State: `const [openIndex, setOpenIndex] = useState<number>(0)` — first item open by default (AC 4). Clicking the open item sets `-1` (all closed), matching the comp's `toggle`.
- Per item, from `LANDING_FAQS`:

```tsx
<h3>
  <button
    type="button"
    id={`faq-question-${index}`}
    aria-expanded={isOpen}
    aria-controls={`faq-panel-${index}`}
    onClick={() => setOpenIndex(isOpen ? -1 : index)}
  >
    <span>{item.question}</span>
    <span aria-hidden="true">{/* + rotated to × when open */}</span>
  </button>
</h3>
{isOpen && (
  <p id={`faq-panel-${index}`} role="region" aria-labelledby={`faq-question-${index}`}>
    {item.answer}
  </p>
)}
```

Accessibility contract (research Q III, AC 4): question wrapped in `<h3>` so it appears in the heading outline; `aria-expanded` + `aria-controls` on the button, `aria-labelledby` back on the panel; the `+`/`×` glyph is `aria-hidden` (state is already conveyed); collapse by **not rendering**, never `height: 0` with focusable content left in the tab order. Native `<button>` gives keyboard operability for free — no `onKeyDown` handler.

Do **not** use Flowbite's `Accordion` (research Q III; recorded as a `DESIGN.md` exception in Phase 1).

**`src/features/Landing/RevealOnScroll.tsx`** — Create. `'use client'`.

```tsx
interface RevealOnScrollProps { children: ReactNode; className?: string }
```

- Renders a single `<div ref={ref} className={className}>{children}</div>` with **no** `data-reveal` attribute during SSR — the server HTML is fully visible (AC 3b).
- `useEffect` on mount:
  1. Bail if `typeof IntersectionObserver === 'undefined'` (jsdom safety) or the ref is null.
  2. If the element is already at or above the fold (`ref.current.getBoundingClientRect().top <= window.innerHeight`), leave it visible and do nothing — this prevents a visible flash on above-the-fold content.
  3. Otherwise set `data-reveal=""` (the hidden state from Phase 1 CSS), then observe with `{ threshold: 0.12 }`; on intersect set `data-reveal="in"` and `unobserve` the element.
  4. Cleanup: `observer.disconnect()`.
- No `matchMedia` — reduced motion is the CSS rule from Phase 1.

**Why not reuse `src/shared/ui/organisms/IntersectionObserverWrapper.tsx`:** that component requires a `setIntersecting` callback prop, which forces its parent to be a stateful client component. Using it here would make every wrapped landing section a client component and break AC 3b. Different contract, different component — note this in `DESIGN.md`/`REPO_CONTEXT.md` so the duplication reads as intentional.

**`Landing.tsx`** — Modify. Wrap the below-the-fold sections in `<RevealOnScroll>`. Because the sections arrive as `children`, they **stay server components** — do not add `'use client'` to any of them. Wrap `ValueBar`, `HowItWorks`, `MidPageCta`, `PlatformFeatures`, `AudienceGrid`, `CourierPanel`, `LandingCta`; leave the header, hero, and footer unwrapped.

### Success Criteria

- **Automated:** `pnpm lint` · `pnpm exec tsc --noEmit` · `pnpm build`
- **Manual:**
  - FAQ: first item open on load; clicking another opens it and closes the first; clicking the open one collapses it. Tab to a question and press Enter/Space. With VoiceOver, the question announces its expanded/collapsed state.
  - Reveal: sections fade in on scroll with no flash on the hero/value bar. Enable "Reduce motion" → everything is visible immediately with no transition.
  - **No-JS check (AC 3b):** disable JavaScript in DevTools and reload `/` — every section, including the FAQ questions, is visible; the first FAQ answer is rendered.

### Test Coverage

See Phase 8.

---

## Phase 7 — App-wide per-route metadata

Implements AC 2c and epic Open Question VI's table verbatim.

### Changes Required

**`src/app/layout.tsx`** — Modify lines 18–21 and 31.

```ts
export const metadata: Metadata = {
  title: {
    default: 'Kraft Envíos | Cotiza y genera guías con varias paqueterías',
    template: '%s | Kraft Envíos',
  },
  description: 'Compara precios de Estafeta, DHL, FedEx, UPS y más en una sola cotización. Genera tu guía y administra todos tus envíos desde un solo lugar.',
}
```

And `<html lang="es-MX" data-theme={theme}>` (epic Q XII — every string in the app is Spanish). Grepped during planning: no test asserts on `lang`.

**Leaf metadata**, one `export const metadata: Metadata` per page:

| File | `title` (leaf) | `robots` |
| --- | --- | --- |
| `src/app/login/page.tsx` | `Iniciar sesión` | `{ index: false }` |
| `src/app/register/page.tsx` | `Crear cuenta` | (default, indexable) |
| `src/app/forgot-password/page.tsx` | `Recuperar contraseña` | `{ index: false }` |
| `src/app/reset-password/[slug]/page.tsx` | `Restablecer contraseña` | `{ index: false, follow: false }` |
| `src/app/dashboard/layout.tsx` (new) | `Panel` | `{ index: false, follow: false }` |
| `src/app/dashboard/requests/[requestId]/page.tsx` | `Solicitud de saldo` | inherits the dashboard layout's `noindex` |

Descriptions are the exact strings (with their character counts) in epic Open Question VI's table — copy them verbatim.

**`src/app/dashboard/layout.tsx`** — Create. Metadata carrier only:

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = { /* title: 'Panel', description: …, robots: { index: false, follow: false } */ }

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

Edge cases:
- The layout must render `children` in a fragment and add **no** markup, no provider, and no cookie read. `REPO_CONTEXT.md` documents that `/dashboard/requests/[requestId]` deliberately has no dashboard chrome and no server-side auth gate; this file must not change either property.
- `/` uses `title: { absolute: … }` (Phase 3) so the new template does not append a second ` | Kraft Envíos`.
- The dashboard-requests page keeps its `params` prop signature unchanged; adding `export const metadata` does not affect the existing page-as-function test pattern.

### Success Criteria

- **Automated:** `pnpm lint` · `pnpm exec tsc --noEmit` · `pnpm build` · `pnpm test` (the login page test calls `HomePage({ searchParams })` directly and must still pass)
- **Manual:** `pnpm dev`, then View Source on `/`, `/login`, `/register`, `/dashboard`: check `<title>`, `<meta name="description">`, `<meta name="robots">` (`noindex, nofollow` on `/dashboard`), and `<html lang="es-MX">`. Confirm `/` is **not** double-suffixed.

### Test Coverage

Covered indirectly by `pnpm build` and the existing page tests. No new metadata-specific test — Next resolves metadata outside the component render, so a Testing Library render cannot observe it.

---

## Phase 8 — Tests

All new tests follow `.github/copilot-instructions.md`: `userEvent` only, no mocking of `@/features` or `@/shared` components, no `next/image` mock, no `document.querySelector`, **no styling or CSS-class assertions**, no `any`/`unknown`, no file extensions in imports, named exports in mocks.

### Changes Required

**`__tests__/feature/Landing/Landing.test.tsx`** — Create.

- `Landing` is a synchronous server component with no data fetching, so `render(<Landing />)` works directly. **No** `QueryProviderWrapper` and **no** `AppRouterContextProviderMock` are needed — the landing uses no TanStack Query and no `useRouter`.
- Needs a `global.IntersectionObserver` stub because `RevealOnScroll` runs on mount. Use the `beforeAll` constructor-mock pattern from `__tests__/components/IntersectionObserverWrapper.test.tsx` (browser API — explicitly allowed to mock).

**`__tests__/feature/Landing/LandingFaq.test.tsx`** — Create. Renders `LandingFaq` alone; no IntersectionObserver needed.

**`__tests__/home.test.tsx`** — Create. Page-level test for `/`: calls `HomePage()` with no arguments and asserts the landing H1 renders and `redirect` was never called (AC 1). Mock `next/navigation`'s `redirect` with a relative import path, mirroring `__tests__/login.test.tsx`.

### Test Coverage

| File | Coverage areas | Pattern reference |
| --- | --- | --- |
| `src/features/Landing/Landing.tsx` | H1 copy; the section `<h2>`s in order; all 7 courier names appear exactly once as accessible text (proves the marquee's duplicate half is `aria-hidden`); the mandatory §7 disclaimer and §12 legal notice are present; the hero image is found by its alt text | Testing Library `getByRole('heading', …)` / `getAllByText`; real `next/image` render |
| Landing CTAs | `getAllByRole('link', { name: /crear cuenta/i })` etc. resolve to `REGISTER_ROUTE`, `LOGIN_ROUTE`, `DASHBOARD_ROUTE` — assert against the **imported constants**, never literals (AC 2) | `ResultCard.test.tsx`, `PersonalInformation.test.tsx` |
| Footer legal omission | `queryByRole('link', { name: /aviso de privacidad/i })` and `/términos y condiciones/i` are both `null` (AC 2b) | — |
| `src/features/Landing/LandingFaq.tsx` | First item `aria-expanded="true"` and its answer visible on mount; clicking a second question opens it and returns the first to `aria-expanded="false"` with its answer removed; clicking the open question collapses it; each question is a heading | `userEvent.setup()`; `getByRole('button', { name: … })`; assert `toHaveAttribute('aria-expanded', …)` |
| `src/app/page.tsx` | Renders the landing H1; `redirect` not called; the page function takes no arguments | `__tests__/login.test.tsx` page-as-function pattern |

Explicitly **not** tested: colors, spacing, class names, animation state, scroll behavior, `RevealOnScroll`'s observer internals (already covered generically by `__tests__/components/IntersectionObserverWrapper.test.tsx`; the landing wrapper's visible contract is "content is present", which the `Landing` test asserts).

### Success Criteria

- **Automated:** `pnpm test -- __tests__/feature/Landing` then `pnpm test -- __tests__/home.test.tsx`, then the full `pnpm test` (must stay green, including the 3 pre-existing skipped tests — do not un-skip).
- **Manual:** none.

---

## Phase 9 — Docs and final verification

### Changes Required

**`REPO_CONTEXT.md`** — Modify:

- `src/app/` table: replace the `page.tsx` "temporary redirect stub" row with the public landing description (server component, no cookie read, `export const metadata` with `title.absolute`).
- Add `dashboard/layout.tsx` row: metadata + `noindex` carrier only, renders `children` in a fragment, adds no chrome.
- `src/features/` table: add the `Landing/` row — public marketing landing at `/`, light-only, server components except `LandingFaq` and `RevealOnScroll`.
- Conventions section: **already done during planning** — two verified, non-obvious facts were added (the root layout's `getThemePreference()` cookie read makes every route dynamic; Geist is loaded but never applied because `globals.css` sets `body { font-family: Arial… }`). No further edit needed there.
- Testing Conventions: `__tests__/home.test.tsx` now covers the landing route (it previously covered login and was renamed to `login.test.tsx` in Story 1).

**`AGENTS.md`** — Modify the one stale line under *App Structure*: `src/app/page.tsx` is no longer "a temporary redirect stub to `/login`".

**`DESIGN.md`** — no further edits; Phase 1 already covered it.

### Success Criteria

- **Automated, full gate (AC 7):** `pnpm lint` · `pnpm exec tsc --noEmit` · `pnpm build` · `pnpm test` · `pnpm design:lint`
- **Manual, final pass:**
  - `/` at 375, 768, 1024, 1440 px — all twelve sections in comp order, no horizontal scroll at any width.
  - With a `theme=dark` cookie set, `/` is entirely light (AC 6).
  - JavaScript disabled: full content renders (AC 3b).
  - Every header/footer/CTA link navigates to `/register`, `/login`, or `/dashboard` as specified.
  - In `pnpm build` output, `/` is expected to show as `ƒ (Dynamic)` — that is the accepted outcome per Assumption 1, not a regression to chase.
  - A `metadataBase` build warning may appear and is expected (epic Q XI).
- **Design-owner review:** flag the visual delta before merge — navy `#2b3990` is now `primary-700` blue and Archivo is now Geist Sans, so the page reads differently from the mockup by design (research "Design re-mapping"). Also flag that the accent ramp is now an app-wide token set even though only the landing uses it.

---

## Cross-cutting concerns

- **No auth, no API, no env vars.** The landing calls no `src/app/api/**` route, uses no TanStack Query, reads no cookie, and adds no environment variable. `QueryProviderWrapper` still wraps it from the root layout; that is harmless and needs no change.
- **Server/client boundary.** Exactly two `'use client'` files in `src/features/Landing/`. `RevealOnScroll` receiving server-rendered `children` does **not** make those children client components — do not "fix" this by adding `'use client'` upward.
- **Dark mode leakage** is the single most likely visual bug (research). Every section sets its own surface; no `dark:` variants in the Landing feature.
- **Accent tokens are app-wide** once in `globals.css`, even though only the landing consumes them. Intentional, per research Q IV.
- **Anchor targets** (`#top`, `#como-funciona`, `#paqueterias`, `#faq`) each need `scroll-mt-24` or the sticky header covers the heading.
- **Reduced motion** applies to three animations: marquee, floaty badges, scroll reveal. All three are CSS-only.
- **Terminology** is a hard rule (copy §13): *paquetería*, *guía*, *folio* ≠ *rastreo*, tuteo, MXN.

## Open Questions

1. **`body { font-family: Arial… }` vs Geist (research edge case, unresolved by design).** Confirmed during planning that the root layout attaches only the Geist CSS variables as classes and never sets `font-family` from them, so the `globals.css` rule wins app-wide today. This plan works around it on the landing only (an explicit family class on the landing root). Fixing it properly changes typography on every existing screen and belongs in its own story.
2. **Right-edge bleed in `landing-hero-quotes.webp`** is still baked into the raster (epic Q X). `overflow-hidden` on the frame cannot remove it. Optional re-crop to ~1145 px wide; not blocking.
3. **The folio badge bakes `KFT-202607-000123` into the design** — it will read as stale in 2027. Cosmetic, accepted for the first draft (`docs/improvement.md` §5).
4. **Courier logos in the hero screenshot** ship in the first draft pending the client's answer (epic Q IX, `docs/improvement.md` §4.1).

## Out of scope

- Removing the theme cookie read from the root layout to make routes static (Assumption 1).
- Legal pages (`/privacidad`, `/terminos`), a pricing section, contact/support columns, analytics, a cookie banner, the `h1Variant` A/B switch.
- `metadataBase`, `NEXT_PUBLIC_SITE_URL`, and the 1200×630 OG image (epic Q XI).
- Rebuilding the hero mockup in markup (research Q I, deferred).
- Any new runtime dependency, any `src/app/api/**` change, any backend change.
- Refactoring `IntersectionObserverWrapper` or `Logo` to serve both the dashboard and the landing.
- Re-enabling the copy blocked by `docs/landing-copy-es.md` §14 (label PDF, tracking states, retry, "sin mensualidad", quoting without an account).
