# Repository Context - kraft-envios-fe

**Last Updated:** 2026-07-21

A living reference for AI agents and developers working in this repository. It documents the app wiring, module boundaries, data flow, and conventions that are not obvious from a single file read.

> Treat this file as a map, not a contract. The ground truth is the code.

## Overview

`kraft-envios-fe` is a Next.js 14 App Router frontend for shipping workflows: login/register, quotes, addresses, guide creation for multiple couriers, guide viewing, and profit-margin configuration. It proxies a backend through Next route handlers under `src/app/api/**`.

**Tech stack:**

- Next.js 14 App Router + React 18 + TypeScript strict mode.
- pnpm lockfile; `pnpm-workspace.yaml` only contains `allowBuilds`, not packages.
- Tailwind v4 through `@tailwindcss/postcss`; no `tailwind.config.*` file.
- Flowbite React with `next.config.mjs` wrapped by `flowbite-react/plugin/nextjs`.
- TanStack Query v5 via `src/features/QueryProviderWrapper.tsx`.
- `react-hook-form` + `yup` for forms.
- `axios` for HTTP calls; `jose` for signed session cookies.
- Jest 30 + Testing Library in jsdom.

## High-Level Architecture

```text
Browser
  │  session + user-info httpOnly cookies set by POST /api
  ▼
Next.js App Router
  ├── src/app/          pages, root layout, route handlers
  ├── src/features/     domain UI (Login, Dashboard, Quotes, Addresses, Guides, ProfitMargin)
  ├── src/shared/       reusable UI, hooks, utils, types, constants, server libs
  └── src/app/api/      BFF routes and cookie utilities
        ├── backend proxies via process.env.BACKEND_URI
        ├── auth via jose-signed session cookie and getAccessToken()
        └── SAT product lookup via NEXT_PUBLIC_GET_SAT_PRODUCT_URI
```

Key invariants:

- `src/app/layout.tsx` is an async server layout; it reads the theme cookie and wraps the app in `QueryProviderWrapper`.
- `QueryProviderWrapper` intentionally creates the `QueryClient` inside `useRef`; do not move it to module scope or caches can be shared across requests/users.
- `src/app/login/page.tsx` is the login entrypoint. It redirects authenticated users to `/dashboard`, otherwise renders `features/Login/Login`. Note that `src/app/page.tsx` is currently a temporary redirect stub pending the landing page (Story 2).
- `src/app/dashboard/page.tsx` reads session/user cookies server-side, wraps Flowbite `ThemeProvider`, and dynamically imports `features/Dashboard/Dashboard` with `ssr: false`.
- The Dashboard component owns the selected screen in local React state and saves screen preference through a server action in `src/shared/lib/preferences.lib.ts`.

## Directory Layout

### `src/app/`

| Path | Purpose |
| --- | --- |
| `layout.tsx` | Root layout; local Geist fonts, global styles, theme cookie, QueryProvider wrapper. |
| `page.tsx` | Temporary `/` → `/login` redirect stub (no cookie read, not `async`); removed once the landing page (Story 2) lands. |
| `login/page.tsx` | Login route `/login`; redirects authenticated users to `/dashboard` (or the sanitized `?redirect=` for admins) when `getAccessToken()` returns a token. |
| `dashboard/page.tsx` | Authenticated dashboard shell; server cookie read + client-only dashboard import. |
| `register/page.tsx` | Registration page. |
| `forgot-password/page.tsx` | Forgot-password page. |
| `reset-password/[slug]/page.tsx` | Reset-password page. |
| `dashboard/requests/[requestId]/page.tsx` | Standalone page for the balance-request email deep link. Deliberately does **no** server-side cookie read or auth gate — it renders `BalanceAdminRequestDetail` unconditionally; that client component owns the auth boundary (see Auth And Cookies below). No `src/app/dashboard/layout.tsx`, so it inherits only the root layout — no dashboard chrome (`Aside`/mobile drawer). |
| `api/**/route.ts` | Next route handlers; mostly backend proxies. |
| `fonts/` | Local Geist font files used by `next/font/local`. |

### `src/features/`

| Domain | Purpose |
| --- | --- |
| `Login/` | Login, registration, forgot-password, and reset-password UI. |
| `Dashboard/` | Dashboard shell and subscreens (`QuotesSubscreen`, `Order`, `MarginProfitSubscreen`, `AddressesSubscreen`). |
| `Quotes/` | Quote form/cards/copy flows. |
| `Addresses/` | Address management forms, previews, dropdowns, pending GE address UI. |
| `AutocompleteZipcode/` | Zipcode autocomplete inputs and region dropdowns. |
| `Guides/` | Guide creation/viewing for MN, GE, PKK, and Tone flows. |
| `Guides-DB/` | DB-backed create flow (pre-select, multi-step modal, result semantics for `created`/`failed`). |
| `ProfitMargin/` | Courier profit-margin forms/cards. |
| `Balance/` | Current MXN balance display, balance-addition request modal, the "Mis solicitudes" history/cancel screen (`BalanceRequestsScreen`) for regular users, and the admin-only "Solicitudes de saldo" queue (`BalanceAdminScreen` + `BalanceAdminRequestCard`/`BalanceAdminRequestDrawer`/`BalanceDecisionForm`) — both owned by the dashboard shell; uses `/api/balance`, `/api/balance/requests`, `/api/balance/requests/admin`, and `/api/balance/requests/[requestId]/decision` through TanStack Query. The admin and user Balance nav entries are mutually exclusive by role (admins never see "Mis solicitudes"). `BalanceDecisionForm` is intentionally reusable (owns its own mutation + invalidation, takes only `requestId`/`onDecided`) so a future full-page decision route can mount it unchanged. |
| `QueryProviderWrapper.tsx` | App-wide TanStack Query provider. |
| `AppRouterContextProviderMock.tsx` | Test helper for router context. |

### `src/shared/`

| Subdir | Purpose |
| --- | --- |
| `ui/atoms`, `ui/organisms`, `ui/icons` | Reusable UI primitives and compositions. There is no `molecules` folder in this repo. |
| `hooks` | Reusable client hooks such as media query, notifications, address lookup, autocomplete, and steps. |
| `lib` | Server-oriented helpers: auth/session cookies and preferences. |
| `utils` | Pure helpers for quotes, guides, addresses, login, local storage, globals, and `date.utils.ts` (the single timezone/date conversion boundary: `formatDateToSpanish`, `getBusinessCalendarMonthYear`, `toBusinessDateRange`, all pinned to `BUSINESS_TIMEZONE`). |
| `constants` | Route paths, API endpoints, messages, local-storage keys, and domain constants. |
| `types` | Shared TypeScript DTOs and UI types. |

## API Route Inventory

Most proxy routes read `getAccessToken()` from `src/shared/lib/auth.lib.ts`, return `400` when it is missing, attach `Authorization: Bearer <token>`, and unwrap backend errors from `error.response.data.error.message`.

| Route | Methods | Upstream / purpose |
| --- | --- | --- |
| `/api` | `POST` | Login; posts to `${BACKEND_URI}/auth/`, signs the returned cookie value with `jose`, and sets `session` + `user-info` cookies. |
| `/api/auth/sign-out` | `GET` | Deletes session/user cookies and revalidates `/login` and `/dashboard`. |
| `/api/auth/create-user` | `POST` | Proxies user creation to `${BACKEND_URI}/users`. |
| `/api/auth/forgot-password` | `POST` | Proxies to `${BACKEND_URI}/users/forgot-password`. |
| `/api/auth/reset-password` | `POST` | Proxies to `${BACKEND_URI}/users/reset-password/{slug}`. |
| `/api/quotes` | `POST` | Proxies quote requests to `${BACKEND_URI}/quotes`. |
| `/api/address-info` | `GET` | Requires `zipcode`; proxies to `${BACKEND_URI}/quotes/address-info/{zipcode}` and returns neighborhoods. |
| `/api/address` | `GET`, `POST`, `PUT`, `DELETE` | CRUD proxy for `${BACKEND_URI}/addresses`; delete encodes the address alias in the URL. |
| `/api/balance` | `GET`, `POST` | Authenticated Balance proxy. `GET` fetches current balance from `${BACKEND_URI}/balance`. `POST` creates a balance-addition request at `${BACKEND_URI}/balance/requests`, forwards only `{ amount }`, and preserves upstream success/error bodies and statuses. |
| `/api/balance/requests` | `GET` | Lists the current user's own balance requests from `${BACKEND_URI}/balance/requests`; forwards only the allowlisted `month`, `year`, `page`, `limit` query params; preserves upstream status/body. |
| `/api/balance/requests/[requestId]/cancel` | `PATCH` | Cancels a pending balance request via `PATCH ${BACKEND_URI}/balance/requests/{requestId}/cancel` (URL-encoded id, no body); preserves upstream status/body verbatim, including the `409` `BAL-BUS-002` conflict when a request is no longer `pending`. |
| `/api/balance/requests/admin` | `GET` | Lists **all** users' balance requests from `${BACKEND_URI}/balance/requests/admin`; forwards only allowlisted `month`, `year`, `page`, `limit`, `status` (`pending\|all`); preserves upstream status/body. Admin-only: defensive `getUserInfo()` guard returns `403` for non-admins before calling upstream. |
| `/api/balance/requests/admin/[requestId]` | `GET` | Fetches one balance request from `${BACKEND_URI}/balance/requests/admin/{id}` (URL-encoded); admin-only via the defensive `getUserInfo()` guard; preserves upstream status/body verbatim, notably the **flat** `404 BAL_NF_001` and the **enveloped** `403 Forbidden`. |
| `/api/balance/requests/[requestId]/decision` | `PATCH` | Approves (`{ action: 'approve', paymentReference }`) or rejects (`{ action: 'reject', reason? }`) a pending balance request via `PATCH ${BACKEND_URI}/balance/requests/{requestId}/decision` (URL-encoded id); admin-only via the same defensive guard; preserves upstream status/body verbatim, including a **flat** (not enveloped) `409 BAL-BUS-002` KraftError body when the request is no longer `pending` — unlike the cancel route's enveloped `409`. |
| `/api/ge-address` | `GET`, `POST`, `PUT`, `DELETE` | GE address proxy for `${BACKEND_URI}/ge/addresses` and `${BACKEND_URI}/ge/address/{id}`; PUT blocks alias edits. |
| `/api/guides/get-guides` | `GET` | Proxies to `${BACKEND_URI}/guides`. |
| `/api/guides-db` | `GET`, `POST` | `GET` proxies list to `${BACKEND_URI}/guides/db` (params `page`, `month`, `year`, `startDate`, `endDate`, `limit`); when `scope=all\|own` is present it branches to `${BACKEND_URI}/guides/db/admin` instead. `month`/`year` and `startDate`/`endDate` are mutually exclusive by typed browser-caller/UI contract (`GetGuidesDbParams` union), not route-level validation. `POST` proxies create to `${BACKEND_URI}/guides/db/create`; returns 201 even when upstream `data.status === 'failed'` (saved DB record, not transport error). |
| `/api/guides-db/[kraftId]` | `DELETE` | Soft-deletes a guide owned by the current user. Proxies `DELETE ${BACKEND_URI}/guides/db/{kraftId}` (URL-encoded). Forwards the upstream `{ version, message, error, data: { guide: { kraftId } } }` envelope on success; collapses any non-2xx to `{ message }` 400. |
| `/api/guides-db/[kraftId]/hard` | `DELETE` | Hard-deletes a guide for admin users. Proxies `DELETE ${BACKEND_URI}/guides/db/{kraftId}/hard` (URL-encoded); forwards the upstream `DeleteGuideDbResponse` envelope on success; 403 when the caller is not an admin via `getUserInfo()`; collapses any other non-2xx to `{ message }` 400. **Only Next-side role-guarded BFF route.** |
| `/api/guides/mn` | `POST` | Creates MN guide via `${BACKEND_URI}/mn/create-guide`; treats null-guide or embedded 400 message as failure. |
| `/api/guides/tone` | `POST` | Creates Tone guide via `${BACKEND_URI}/tone/create-guide`; same null-guide/embedded-400 failure rule as MN. |
| `/api/guides/ge` | `POST` | Creates GE guide via `${BACKEND_URI}/ge/create-guide`. |
| `/api/guides/pkk` | `POST`, `GET` | Creates PKK guide via `${BACKEND_URI}/pkk/create-guide`; `GET` fetches a single guide by `guide` query param. |
| `/api/margin-profit` | `GET`, `POST` | Reads `${BACKEND_URI}/global-configs/profit-margin`; POST sends a PUT to `/global-configs/profit-margin-providers`. |
| `/api/product-sat` | `POST` | Calls `NEXT_PUBLIC_GET_SAT_PRODUCT_URI?search=...` directly, slices results to 100, and formats code/description pairs. |
| `/api/preferences/theme` | `POST` | Cookie setter; saves Flowbite theme mode through `saveThemeCookie()`. |

## Auth And Cookies

- Cookie keys live in `src/shared/constants/global.constants.ts`: `session`, `user-info`, `theme`, and `dashboard-screen`.
- `encodeAccessToken()` signs `{ accessToken }` with `SESSION_SECRET_KEY` using HS256 and a 7-day JWT expiry.
- `saveSessionCookie()` and `saveUserInfo()` set httpOnly, secure, sameSite strict cookies. The login route also sets response cookies with `secure: process.env.NODE_ENV === 'production'` and 5-day `maxAge`.
- Client components should not read auth cookies directly. Use route handlers or server helpers.
- Preferences in `src/shared/lib/preferences.lib.ts` are server actions (`"use server"`): theme and dashboard screen are cookie-backed.
- **Exception, by design:** `/dashboard/requests/[requestId]` (the balance email deep link) does not gate on a server-rendered cookie read at all. During development, a server-component-level `getAccessToken()`/`redirect()` guard on this route was observed to intermittently treat a genuinely valid session as absent on a fresh, direct navigation (reproduced even in an incognito window with a brand-new login, so it was not a stale-browser-cache artifact) — root cause unconfirmed, but suspected to be a Next 14 App Router SSR cookie-read timing issue specific to this nested dynamic route. The fix: the page (`src/app/dashboard/requests/[requestId]/page.tsx`) renders the client component `BalanceAdminRequestDetail` unconditionally with no auth check of its own. That component's `useQuery` call to `/api/balance/requests/admin/[requestId]` is the actual auth boundary — the BFF route reads cookies fresh, in its own request, at data-fetch time, which has proven reliable: a `400` (missing token) response triggers a client-side `router.push` to `/?redirect=...`; a `403` (non-admin) response renders `BalanceRequestUnauthorized` inline. Prefer this "let the mutation/query hitting the BFF be the auth check" pattern over a page-level SSR cookie gate for any future route with this shape.

## Environment Variables

Required values are documented in `.env.example`:

- `BACKEND_URI` - backend API base URL.
- `SESSION_SECRET_KEY` - key used by `jose` for the signed session cookie.
- `NEXT_PUBLIC_LOCAL_STORAGE` - local-storage namespace.
- `FRONTEND_URI` - frontend origin.
- `NEXT_PUBLIC_GET_SAT_PRODUCT_URI` - external SAT product search endpoint.
- `NEXT_PUBLIC_DEFAULT_EMAIL` - default email used for external API data.

Confirmed cross-feature timezone contract:

- Backend timestamps remain UTC ISO 8601 strings; frontend state and API handling preserve those raw values.
- Frontend display and business-calendar defaults use `America/Mexico_City`, configured as `NEXT_PUBLIC_BUSINESS_TIMEZONE` to match backend `BUSINESS_TIMEZONE`.
- Month/year filters are calendar values, not browser-derived UTC boundaries. Guide date ranges use explicit ISO instants derived from Mexico City calendar dates.
- Browser-local time and fixed UTC offsets are not valid fallbacks.
- Frontend configuration must fail dev/build/start loading unless `NEXT_PUBLIC_BUSINESS_TIMEZONE` exactly equals `America/Mexico_City`; tests set it explicitly.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start Next dev server on port 3000. |
| `pnpm build` | Production build; use for full verification. |
| `pnpm start` | Start a built Next app. |
| `pnpm lint` | Run `next lint` with `next/core-web-vitals` and `next/typescript`. |
| `pnpm exec tsc --noEmit` | TypeScript-only check; there is no package script for this. |
| `pnpm test` | Jest run in jsdom; coverage is always collected into `coverage/`. |
| `pnpm test -- __tests__/path/to/file.test.tsx` | Focus one test file. Add `-t "test name"` to focus by name. |
| `pnpm sync:prompts` | Copy `.opencode/command/{research,plan,implement}.md` into `.github/prompts/`; run after changing those command prompts. |

## Prompt Sync

- `.opencode/command/*.md` is the source of truth for research, planning, and implementation command prompts.
- `pnpm sync:prompts` copies `research.md` to `.github/prompts/research.prompt.md`, `plan.md` to `.github/prompts/plan.prompt.md`, and `implement.md` to `.github/prompts/implement.md`.
- Do not manually update only `.github/prompts/*`; it creates drift from the opencode commands.

## Testing Conventions

- Jest uses `next/jest`, `testEnvironment: "jsdom"`, and `jest.setup.ts`.
- `next/jest` loads `next.config.mjs` while constructing Jest configuration, before `setupFilesAfterEnv`; environment values required by Next config must be set in `jest.config.ts`, not only `jest.setup.ts`.
- `jest.setup.ts` imports `@testing-library/jest-dom`, installs `TextEncoder`/`TextDecoder`, and adds a JSON-based `structuredClone` fallback.
- `__tests__/mocks/` and `__tests__/utils-test/` are ignored as test suites. Use them for fixtures/helpers imported by real tests.
- Real tests currently live under `__tests__/feature/*`, `__tests__/components/*`, and `__tests__/home.test.tsx`.
- Keep new tests near the matching feature/shared UI boundary.
- `.github/copilot-instructions.md` contains project-specific unit test rules: router/query wrappers, `userEvent` over `fireEvent`, avoid mocking internal components, avoid styling assertions, preserve skipped tests, and match mock data to real return shapes.

## Styling And UI

- Tailwind v4 is configured only through `postcss.config.mjs` with `@tailwindcss/postcss`.
- Flowbite React is in use; preserve the `withFlowbiteReact(nextConfig)` wrapper in `next.config.mjs`.
- Dashboard customizes Flowbite `drawer` theme locally in `src/app/dashboard/page.tsx`. That `createTheme` override forces `drawer.header.inner.titleText`/`titleCloseIcon`/`titleIcon` to `text-white` for **every** Flowbite `Drawer` rendered under the dashboard `ThemeProvider`, not just the blue mobile menu. A new light-surface drawer using `DrawerHeader` will render an invisible title; supply a custom header (or a per-instance `theme` override) instead.
- Root layout sets `<html lang="en" data-theme={theme}>`; update deliberately if changing locale/theme behavior.

## Conventions And Gotchas

- Path alias: `@/*` maps to `./src/*`.
- Prompt instructions live under `.opencode/command/`; run `pnpm sync:prompts` after editing them so `.github/prompts/` stays in sync.
- Add `'use client'` to files that use hooks, browser APIs, router hooks, or client-only libraries.
- Keep backend proxy behavior consistent with existing route handlers unless intentionally fixing a bug: access-token check, `Authorization` header, `NextResponse.json`, and 400 error shape.
- Do not assume all backend responses have the same envelope. Existing routes return a mix of raw upstream data, `{ data }`, `{ message }`, and feature-specific objects.
- `src/app/api/product-sat/route.ts` does not use `BACKEND_URI`; it calls `NEXT_PUBLIC_GET_SAT_PRODUCT_URI` directly.
- `src/features/Dashboard/Dashboard.tsx` is client-only and has separate mobile/tablet vs desktop rendering via `useMediaQuery()`.
- Avoid adding new state libraries. This repo uses local React state, cookies/server actions, TanStack Query, and local-storage helpers; there is no Zustand store.
- Page tests invoke page components as plain async functions with no arguments (`await HomePage()` in `__tests__/login.test.tsx`). Any props added to a page — `params`, `searchParams` — must therefore be optional with a default (`{ searchParams }: Props = {}`), or the existing test throws on destructuring `undefined`.
- Balance request creation and cancellation both invalidate only the request-history prefix `['balance', 'requests']`; neither optimistically changes nor invalidates current balance `['balance']`. The requests-history query key includes `month`, `year`, `page`, `limit` for full server-state representation. The admin decision mutation is the exception: it invalidates **both** `['balance', 'requests']` and `['balance']` because an approval moves money. The admin list query key (`['balance', 'requests', 'admin', month, year, page, limit, status]`) nests under the `['balance', 'requests']` prefix, so one prefix invalidation refetches user and admin lists alike.
- The hard-delete BFF (`/api/guides-db/[kraftId]/hard`) was the first Next-side role-guarded route via `getUserInfo()`; `/api/balance/requests/admin` and `/api/balance/requests/[requestId]/decision` are the second and third. Do not retrofit this pattern onto other BFF routes without reason; backend authorization remains the source of truth (each guard is marked with a `// ponytail:` comment).
- Balance's decision `409 BAL-BUS-002` conflict body is a **flat** KraftError (`{ code, message, technicalDetails, statusCode }`) read via `data.code`, unlike the cancel route's `409`, which nests the same code under `data.error.code`. Both are preserved verbatim by their respective BFF routes; do not assume all Balance `409`s share one shape.
- Balance now has three backend error shapes across three statuses: flat `404` (`data.code === 'BAL_NF_001'`, from `/api/balance/requests/admin/[requestId]`), enveloped `403` (`data.error.statusCode`, no `code` field at all), and flat `409` (`data.code === 'BAL-BUS-002'`). The two KraftError codes do not share a separator (underscores vs hyphen). Branch on HTTP status first; a shared "read `data.code`" helper would silently return `undefined` for the `403`.
- The post-login return-URL pattern (`/dashboard/requests/[requestId]` email deep link): `src/app/login/page.tsx` reads `?redirect=` server-side and `LoginCard.tsx` re-sanitizes the prop client-side as defense in depth before `router.push`; both call `sanitizeDashboardReturnUrl()` from `src/shared/utils/global.utils.ts`, which allowlists same-origin `/dashboard` paths and falls back to `/dashboard` otherwise. A third site, `BalanceAdminRequestDetail.tsx`, constructs the *outbound* `/login?redirect=...` URL (not the inbound sanitize) when its own data query gets a `400` — it builds the URL from the already-known, already-safe `requestId` via `buildBalanceRequestDetailRoute()`, so it doesn't need `sanitizeDashboardReturnUrl()` itself. Do not apply this pattern to other routes without reason.
- **No route in this app can render statically today.** `src/app/layout.tsx` awaits `getThemePreference()`, which reads the `theme` cookie through `next/headers`'s `cookies()` in the *root layout*, so every route — including ones that read no cookies themselves, like `/` — is marked `ƒ (Dynamic)` in `pnpm build` output. Do not chase a `○` marker on an individual page; the only fix is moving the theme read out of the root layout, which changes dark-mode wiring app-wide.
- **Geist is loaded but not actually applied.** `src/app/layout.tsx` attaches `geistSans.variable` / `geistMono.variable` as body classes, which only *define* `--font-geist-sans` / `--font-geist-mono`; nothing sets `font-family` from them. Meanwhile `src/app/globals.css` declares `body { font-family: Arial, Helvetica, sans-serif }` inside `@layer utilities`, so Arial wins app-wide. A surface that wants Geist must set the family itself (e.g. `font-[family-name:var(--font-geist-sans)]`). `DESIGN.md` documents Geist Sans as the body typeface, which is the intent, not the current computed style.
- Guides DB backend date filters use silent precedence: either `month` or `year` selects business-month mode and ignores `startDate`/`endDate`; range mode requires both month and year to be absent. Partial ranges are accepted, reversed ranges return an empty `200`, and some pattern-valid but impossible dates can escape backend parsing as an unstructured `500`.

## Key Files

| File | Purpose |
| --- | --- |
| `AGENTS.md` | Compact agent instructions: commands, architecture, env, tests, styling. |
| `package.json` | Scripts and dependencies. |
| `next.config.mjs` | Next config; transpiles `jose` and wraps Flowbite React plugin. |
| `tsconfig.json` | Strict TypeScript, `@/*` path alias. |
| `jest.config.ts` | Jest + coverage + ignored helper directories. |
| `jest.setup.ts` | Global test setup. |
| `.github/copilot-instructions.md` | Unit test conventions and mocking rules. |
| `.opencode/command/research.md` | Source research workflow prompt; syncs to `.github/prompts/research.prompt.md`. |
| `scripts/sync-opencode-commands.mjs` | Prompt sync script used by `pnpm sync:prompts`. |
| `src/app/layout.tsx` | Root layout, theme cookie, QueryProvider. |
| `src/app/login/page.tsx` | Login entrypoint and authenticated redirect. |
| `src/app/dashboard/page.tsx` | Dashboard server wrapper + Flowbite theme. |
| `src/features/QueryProviderWrapper.tsx` | TanStack Query client provider with per-request-safe `useRef`. |
| `src/shared/lib/auth.lib.ts` | Session encode/decode, user-info cookie, sign-out helpers. |
| `src/shared/lib/preferences.lib.ts` | Theme and dashboard-screen cookie actions. |

## Open Questions

- There are no CI workflow files in this checkout; branch, PR label, release, and deployment rules are not documented in-repo.
- Several route handlers collapse upstream failures into `400` and sometimes return different error shapes. Confirm desired API contract before normalizing.
- The backend contract is inferred only from this frontend's route handlers and TypeScript types; no OpenAPI or backend repo reference is present here.
