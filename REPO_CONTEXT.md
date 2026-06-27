# Repository Context - clean-next-budget-master

**Last Updated:** 2026-06-25

A living reference for AI agents and developers working in this repository. It documents the architecture, module boundaries, state and data flow, and the conventions that aren't obvious from a single file read.

> Keep this file updated when you introduce a new feature, store, route handler, or change a cross-cutting pattern. Pair it with `AGENTS.md` (toolchain, commands, env vars, branch flow).

---

## Overview

`clean-next-budget-master` is a personal-finance / budgeting web app (Spanish UI, `<html lang="es">`). It is a Next.js 14 frontend that **proxies** a separate backend (the source of truth for data) over HTTP. Authentication is cookie-based (`jose`-signed httpOnly session cookie set by Next route handlers).

> **Treat this file as a map, not a contract.** The ground truth is the code. When in doubt, read the file before relying on a description here.

**Tech stack:**

- Next.js 14 (App Router) + React 18 + TypeScript (strict)
- Tailwind v4 via `@tailwindcss/postcss` + `flowbite-react` (with the `next/flowbite-react` plugin wrapping `next.config.mjs`)
- Zustand 5 (with a React context provider per store) for client state
- TanStack Query v5 for server-state caching / mutations
- `react-hook-form` + `yup` for forms
- `date-fns`, `dayjs`, `@internationalized/date`, `react-day-picker` for date handling
- `axios` for backend calls; `jose` for JWT / session cookies
- `sonner` for toasts; `motion` (framer-motion) for animations; `recharts` for charts
- Jest 30 + Testing Library for unit tests
- pnpm (>=10.11) on Node >=22.15.1

---

## High-level architecture

```
Browser
  │  (httpOnly session cookie set by /api/route.ts on login)
  ▼
Next.js App Router (this repo)         ── always `dynamic = 'force-dynamic'`
  ├── src/app/         pages, layouts, route handlers
  ├── src/features/    domain UI (Accounts, Budgets, Categories, Charts, Dashboard, Login, Records)
  ├── src/shared/      cross-cutting UI, hooks, utils, types, constants
  ├── src/zustand/     client stores + providers
  └── src/app/api/     route handlers
        ├── BFF proxies ──► External Backend at process.env.BACKEND_URI
        │                   (auth via jose-signed session cookie)
        └── cookie setters (theme, selected account, sign-out)
```

Key invariants:

- The Next app **never owns the data**; it forwards requests to `process.env.BACKEND_URI` (see `src/app/api/**`).
- `src/app/layout.tsx` exports `export const dynamic = 'force-dynamic'` — pages are rendered per request, not statically.
- `<QueryProviderWrapper>` from `src/app/QueryProviderWrapper.tsx` wraps the entire app, so TanStack Query is available everywhere.
- The root page (`src/app/page.tsx`) **is** the login screen. If a session cookie is present it redirects to `/dashboard`; otherwise it renders `<LoginCard />`.

---

## Directory layout

### `src/app/` — App Router root

| Path                                               | Purpose                                                                                                                 |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `layout.tsx`                                       | Root layout; forces dynamic rendering; reads theme preference; wraps in `QueryProviderWrapper`; sets `<html lang="es">` |
| `page.tsx`                                         | Root page — login form, redirects to `/dashboard` when authenticated                                                    |
| `globals.css`                                      | Global styles                                                                                                           |
| `QueryProviderWrapper.tsx`                         | TanStack Query client provider                                                                                          |
| `dashboard/`                                       | Authenticated dashboard                                                                                                 |
| `create-record/`                                   | Income / expense creation flow                                                                                          |
| `register/`, `forgot-password/`, `reset-password/` | Auth-adjacent pages                                                                                                     |
| `api/`                                             | Route handlers (BFF proxies + cookie setters, see below)                                                                |

### `src/app/api/` — Route handlers (BFF + cookie layer)

Each subfolder contains a `route.ts` exporting HTTP method handlers (`GET`, `POST`, `PUT`, `DELETE`). They fall into two categories:

1. **BFF proxies** — forward to `${BACKEND_URI}/<path>` via `axios`, attaching the access token from the session cookie.
2. **Cookie setters / auth utilities** — read or write cookies on the Next app itself (no upstream call, or a coordinated call).

| Route                               | Methods                 | File                                      | Category          | Notes                                                                                                                                                                                                          |
| ----------------------------------- | ----------------------- | ----------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/api`                              | `POST`                  | `src/app/api/route.ts`                    | **Login**         | Posts to `${BACKEND_URI}/auth/`, signs the returned access token with `jose`, sets the httpOnly `SESSION_COOKIE_KEY` cookie (5-day max-age, `sameSite: 'strict'`, `secure` in production)                      |
| `/api/auth/sign-out`                | `GET`                   | `…/auth/sign-out/route.ts`                | **Sign-out**      | Calls `signOut()` and `revalidatePath(LOGIN_ROUTE)`                                                                                                                                                            |
| `/api/accounts`                     | `POST`, `PUT`, `DELETE` | `…/accounts/route.ts`                     | BFF proxy         | All three proxy to `${BACKEND_URI}/account-actions/` (create / edit / delete account)                                                                                                                          |
| `/api/records`                      | `POST`                  | `…/records/route.ts`                      | BFF proxy         | POST is used to send `{ accountId, month, year }` and the handler issues a GET to `${BACKEND_URI}/records/get-expenses-and-incomes-by-month/{accountId}/{month}/{year}` — naming is "fetch" despite using POST |
| `/api/records/income`               | `POST`, `PUT`, `DELETE` | `…/records/income/route.ts`               | BFF proxy         | Create / edit / delete income record                                                                                                                                                                           |
| `/api/records/expense`              | `POST`                  | `…/records/expense/route.ts`              | BFF proxy         | Create expense record                                                                                                                                                                                          |
| `/api/records/transfer`             | `POST`                  | `…/records/transfer/route.ts`             | BFF proxy         | Create transfer (forwards to `${BACKEND_URI}/records/transfer`)                                                                                                                                                |
| `/api/preferences/theme`            | `POST`                  | `…/preferences/theme/route.ts`            | **Cookie setter** | Saves the theme to a server cookie via `saveThemeCookie()` (no backend call)                                                                                                                                   |
| `/api/preferences/selected-account` | `POST`                  | `…/preferences/selected-account/route.ts` | **Cookie setter** | Saves the selected account to a server cookie via `savePreferenceCookie()`                                                                                                                                     |
| `/api/users/create-user`            | `POST`                  | `…/users/create-user/route.ts`            | BFF proxy         | User registration                                                                                                                                                                                              |
| `/api/users/forgot-password`        | `POST`                  | `…/users/forgot-password/route.ts`        | BFF proxy         | Password reset request                                                                                                                                                                                         |
| `/api/users/reset-password`         | `POST`                  | `…/users/reset-password/route.ts`         | BFF proxy         | Password reset confirm                                                                                                                                                                                         |

> The BFF convention is: read access token via `getAccessToken()` from `@/shared/lib/auth.lib`, attach as `Authorization: Bearer <token>`, return the upstream body. Errors are unwrapped to `{ message }` with status `400` (this is project convention, not great — see Open Questions).

### `src/features/<Domain>/` — Domain UI

Each folder is a self-contained slice for one business domain. Co-locate components, modals, and feature-specific types here.

| Domain       | Contents (high level)                                                                                                                                                                                                                                                                                                                          |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Accounts`   | `Accounts.tsx`, `AccountsView.tsx`, `CreateAccountButton.tsx`, `CreateAccountModal.tsx`, `EditAccountModal.tsx`, `DeleteAccountModal.tsx`, `AccountDetailsModal.tsx`, `AccountActionsModal.tsx`, `AccountProviderDropdown.tsx`, `AccountTypeDropdown.tsx`, `SelectAccountDialog.tsx`, `DropdownSelectAccount.tsx`, `NoAccountsFoundScreen.tsx` |
| `Budgets`    | Budget UI                                                                                                                                                                                                                                                                                                                                      |
| `Categories` | Category UI                                                                                                                                                                                                                                                                                                                                    |
| `Charts`     | Recharts-based visualizations                                                                                                                                                                                                                                                                                                                  |
| `Dashboard`  | `Dashboard.tsx`, `DashboardAside.tsx`, `DashboardAsideLink.tsx`, `subscreens/AccountSubscreen.tsx`, `subscreens/Overview/{OverviewAccountTransactionsSubscreen,OverviewButtonGroup,OverviewStatisticsSubscreen,OverviewSubscreen}.tsx`                                                                                                         |
| `Login`      | `Login/LoginCard.tsx` (and any login-flow siblings)                                                                                                                                                                                                                                                                                            |
| `Records`    | Income / expense record list and creation flows                                                                                                                                                                                                                                                                                                |

When you add a new domain: create `src/features/<Domain>/` and add an entry here.

### `src/shared/` — Cross-cutting code

| Subdir         | Purpose                                                                                                           |
| -------------- | ----------------------------------------------------------------------------------------------------------------- |
| `ui/atoms`     | Smallest reusable components (Button, Input, Label, …)                                                            |
| `ui/molecules` | Composed components (FormField, Card, …)                                                                          |
| `ui/organisms` | Larger compositions; also houses `AppRouterContextProviderMock.tsx` (test helper, **not** a production component) |
| `ui/tremor`    | Tremor-style chart wrappers                                                                                       |
| `ui/icons`     | Icon components                                                                                                   |
| `hooks`        | Reusable React hooks                                                                                              |
| `lib`          | Server-side libs (e.g. `preferences.lib.ts`, `auth.lib.ts`)                                                       |
| `utils`        | Pure utility functions (formatting, calculations)                                                                 |
| `constants`    | App-wide constants (cookie keys, route paths, backend URL templates)                                              |
| `types`        | Shared TypeScript types                                                                                           |

> Coverage exclusion: `src/shared/ui/tremor` and `src/shared/ui/icons` are excluded from test coverage (see `jest.config.ts`).

### `src/zustand/` — Client state

- `store/dashboard.store.ts` — Zustand store definition
- `provider/dashboard-store-provider.tsx` — React context provider

**Rule:** any component using `useDashboardStore` **must** be rendered inside `<DashboardStoreProvider>`. Tests must wrap with this provider and seed state from `mockAccounts` in `__tests__/mocks/accounts.mock.ts`.

When you add a new store: create `store/<name>.store.ts` + `provider/<name>-store-provider.tsx`, and document it here.

---

## State and data flow

```
┌─────────────────────────────────────────────────────────────────────┐
│ Component (src/features/<Domain>)                                   │
│   ├── useDashboardStore()  ─►  DashboardStoreProvider  ─► Zustand   │
│   └── useQuery / useMutation  ─►  QueryProviderWrapper  ─► TQ       │
│              │                                                     │
│              ▼  fetch                                              │
│         Route handler (src/app/api/<…>/route.ts)                    │
│              │  reads httpOnly session cookie (jose)                 │
│              ▼  axios                                              │
│         External Backend at process.env.BACKEND_URI                 │
└─────────────────────────────────────────────────────────────────────┘
```

- **Client state** (UI state, selection, filters, ephemeral data) → **Zustand**, with a per-store React context provider.
- **Server state** (anything persisted by the backend) → **TanStack Query**; never duplicate it into Zustand.
- **Form state** → `react-hook-form` + `yup` resolvers.
- **Auth state** → httpOnly session cookie set by route handlers; components read it indirectly through TanStack Query (e.g. `/api/users/me`).

---

## Authentication flow

1. User submits credentials on `src/app/page.tsx` (the root page) via `<LoginCard />`.
2. The form posts to `POST /api`, which forwards to `${BACKEND_URI}/auth/`.
3. The backend returns an access token (typically inside a `set-cookie` header); the route handler extracts the cookie value, signs it with `jose` using `process.env.SESSION_SECRET_KEY`, and sets an **httpOnly** session cookie (`SESSION_COOKIE_KEY`) on the response — `secure` in production, `sameSite: 'strict'`, 5-day `maxAge`.
4. Subsequent requests from the browser send the cookie automatically; each BFF route handler verifies it via `jose` (`getAccessToken()`) and attaches it as `Authorization: Bearer <token>` to the upstream call.
5. `GET /api/auth/sign-out` calls `signOut()` and `revalidatePath(LOGIN_ROUTE)`.

Implications:

- The session cookie is httpOnly — never read it from client components.
- `SESSION_SECRET_KEY` is required and must be kept server-side.
- Do not store tokens in `localStorage`.
- BFF route handlers should not duplicate the auth logic; they all funnel through `getAccessToken()`.

#### Auth contract with the backend

- **Backend cookie name**: `accessToken` (constant `ACCESS_TOKEN_COOKIE_NAME` in the backend's `src/constants.ts`).
- **Backend cookie flags**: `httpOnly: true`, `secure: NODE_ENV === 'production'`, `sameSite: 'strict'`, `maxAge: 5d`.
- **JWT expiry**: `5d` (matches the cookie `maxAge`). **No refresh / rotation endpoint** — the client re-logs-in after 5 days.
- **No `GET /users/me`**. The current user is hydrated from the `POST /auth` response body (`{ version, success, message, data: { user } }`). Because the cookie is httpOnly, the BFF extracts the value server-side via `getCookieProps` — the browser cannot read it.
- **Backend guard policy**: `JwtAuthGuard` is global; routes opt out with `@Public()` (applies to user registration, forgot/reset password, and `categories/create-local-categories`).

---

## Environment variables

Required (see `.env-example`, `.env.local`):

- `BACKEND_URI` — base URL of the external backend
- `SESSION_SECRET_KEY` — secret used by `jose` to sign the session cookie
- `NEXT_PUBLIC_LOCAL_STORAGE` — client-side localStorage key namespace
- `FRONTEND_URI` — used for absolute URLs / redirects

CI only sets `REACT_APP_LOCAL_STORAGE=BUDGET_MASTER`. Do not rely on other env vars being set in CI unit tests. Test code must stub or mock anything env-dependent.

---

## Commands

| Command                                        | Purpose                                                          |
| ---------------------------------------------- | ---------------------------------------------------------------- |
| `pnpm dev`                                     | Dev server on :3000                                              |
| `pnpm build`                                   | Production build                                                 |
| `pnpm start`                                   | Run the production build                                         |
| `pnpm lint`                                    | `next lint` (ESLint: `next/core-web-vitals` + `next/typescript`) |
| `pnpm test`                                    | Jest run — **always collects coverage** (`coverage/`)            |
| `pnpm test:watch`                              | Jest watch mode                                                  |
| `pnpm test -- __tests__/path/to/file.test.tsx` | Single-file test run                                             |

There is no separate `typecheck` script; use `next build` or the editor's TS server.

---

## Testing conventions

Test files live in `__tests__/`, mirroring `src/` (e.g. `src/features/Accounts/Accounts.tsx` → `__tests__/features/Accounts/Accounts.test.tsx`).

Reference helpers and patterns (see `.github/copilot-instructions.md` for the full list):

- **`AppRouterContextProviderMock`** at `src/shared/ui/organisms/AppRouterContextProviderMock.tsx` — wrap any component that uses `next/navigation`'s router; add `push: jest.fn()`.
- **`QueryProviderWrapper`** at `src/app/QueryProviderWrapper.tsx` — wrap components using `useQuery` / `useMutation`.
- **`DashboardStoreProvider` + `mockAccounts`** at `__tests__/mocks/accounts.mock.ts` — for components using `useDashboardStore`.
- **Shared mock fixtures** at `__tests__/mocks/`: `accounts.mock.ts`, `budgets.mock.ts`, `categories.mock.ts`, `records.mock.ts`.
- Cookie mocking pattern — see `__tests__/home.test.tsx` (uses `jest.mock('next/headers', ...)`).
- `ResizeObserver` mock — see `__tests__/features/Dashboard/StatisticsSubscreen.test.tsx`.

`__tests__/mocks/` and `__tests__/utils-test/` are **ignored by the test runner** (`testPathIgnorePatterns`); use them for shared fixtures/helpers only. There are also other `__tests__/` subdirs (`components/`, `features/`, `hooks/`, `lib/`, `utils/`) — those contain real test files.

**Hard rules** (enforced in CI):

- Don't mock the component under test.
- Don't mock custom hooks.
- Don't mock utilities (e.g. `@/shared/utils/*`).
- Don't mock `sonner`, `next/navigation`, or use `require()`.
- Use `userEvent`, not `fireEvent`.
- Don't assert on CSS classes / inline styles.
- Don't extract `container` from `render()` or use `querySelector`; always query via `screen`.

---

## Branch flow and release

- Integration branch: **`develop`** (no `main` / `master`). PRs target `develop`.
- Every PR must carry **exactly one** label: `major`, `minor`, or `patch` (`check-label.yml` will fail the PR otherwise).
- On merge to `develop`, `develop-pipeline.yml`:
  1. runs unit tests,
  2. bumps `package.json` via `npm version`,
  3. creates a `v<version>` tag,
  4. prepends a `CHANGELOG.md` entry (committed by `github-actions[bot]`).

**Do not** manually bump versions in `package.json` or edit `CHANGELOG.md` on PRs.

---

## Deployment

This app is deployed on **Vercel**. There is no Dockerfile, `vercel.json`, or other deployment config in the repo — Vercel's default Next.js detection is used. The CI workflows (`unit-tests.yml`, `check-label.yml`, `develop-pipeline.yml`) handle testing, label validation, and version release; they do **not** trigger a Vercel deploy directly.

If you need to reason about Vercel-specific behavior (env vars, edge runtime, ISR), consult Vercel docs rather than the repo.

---

## Conventions and gotchas

- **Path alias** `@/*` → `./src/*` (see `tsconfig.json`).
- **Server vs client components** — add `'use client'` at the top of any file that uses hooks, Zustand, TanStack Query, or browser APIs. Route handlers under `src/app/api/**` are server-side by default.
- **Tailwind v4** — config lives in `postcss.config.mjs`; no `tailwind.config.js`. Theme tokens come from CSS.
- **`next.config.mjs`** is wrapped by the flowbite-react plugin (`next/flowbite-react`) — keep that wrap intact.
- **Date handling** — three libraries are in the tree: `date-fns`, `dayjs`, `@internationalized/date`. Pick one per feature and stay consistent.
- **Charts** — `recharts` is the primary library; `src/shared/ui/tremor` wraps Tremor-style API.
- **Coverage** — every `pnpm test` run writes to `coverage/`. There are no enforced thresholds in `jest.config.ts`; CI surfaces coverage deltas.
- **Error handling in BFF** — every route handler swallows axios errors and returns `{ message }` with status `400`. This loses upstream status codes; treat 400 as "something went wrong" rather than a literal client error.

---

## External backend reference

> **Source of truth**: **[BE_Personal_Finances](git@github.com:RafaelMoro/BE_Personal_Finances.git)** — private GitHub repo, package name `be_personal_finances`. CHANGELOG entries may link the old `RafaelMoro/BE_Budget_Master` URL (the repo was renamed at some point). All backend details below are sourced from that repo's code, not invented.

### Tech stack

- **Runtime / framework**: Node ≥22.16, **NestJS 11** (`@nestjs/platform-express`). Package manager pnpm ≥10.11 (a `bun.lockb` is also present for the deploy build).
- **DB**: MongoDB via Mongoose 8 / `@nestjs/mongoose` (Atlas).
- **Auth**: `@nestjs/jwt` + `passport-jwt` + `passport-local`, `bcryptjs`.
- **Mail**: Resend + `react-email` / nodemailer, Handlebars templates under `emails/`.
- **Hosting**: AWS Lambda + API Gateway via Serverless Framework — service `budget-master-test-api`, stage `production`, `/{proxy+}` catch-all, runtime `nodejs22.x`, 15s timeout.
- **No Postgres / Redis / queue deps.**

### Versioning and contract docs

- **No URL versioning** (`setGlobalPrefix('/api/v1')`-style is absent). The "version" is the npm package version, surfaced in every response's `version` field (sourced from `process.env.npm_package_version`) and tracked in `CHANGELOG.md`. Effective policy: **ship and hope** — breaking changes land on the same unversioned paths. Phrase the BFF cross-check step accordingly.
- **No OpenAPI / Swagger UI**. `@nestjs/swagger` and `swagger-ui-express` are installed but only `PartialType` is imported; there is no `SwaggerModule.setup` call. The de-facto contract is the `class-validator` DTOs under each module's `*.dto.ts` (e.g. `accounts.dto.ts`, `budgets.dto.ts`, `categories/dtos/categories.dto.ts`, `records/dtos/records.dto.ts`, `transfer.dto.ts`, `users/dtos/users.dto.ts`, `expenses.dto.ts`, `incomes.dto.ts`, `budget-history.dto.ts`) and the shared `GeneralResponse` envelope (`src/response.interface.ts`, `INITIAL_RESPONSE`).
- **README** is the unmodified NestJS starter — no project-specific API docs. No Postman collection in the repo.

### Base URL / `BACKEND_URI`

| Env               | `BACKEND_URI`                                                     | Notes                                                                                                                                                              |
| ----------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Local dev         | `http://localhost:8080` (or whatever `PORT` is set to)            | Backend runs via `pnpm dev` (Nest) or `pnpm dev:sls` (Serverless Offline). No Docker / compose. No global API prefix — routes are at the root.                     |
| Vercel production | API Gateway URL (CloudFormation output of the `production` stage) | The only deployed Serverless stage.                                                                                                                                |
| Vercel preview    | **Not configured**                                                | No preview stage in `serverless.yml`. Either reuses the production API Gateway URL or a manually-deployed stage — confirm with `@RafaelMoro` before relying on it. |

The frontend prod origin used for CORS allow-listing and email links is `https://next.budget-master.space` (constant `PROD_URI`). That is **not** the backend URL.

### Routes inventory

No global prefix. Top-level backend paths: `/auth`, `/users`, `/account-actions`, `/records`, `/budgets`, `/categories`, `/expenses-actions`, `/incomes-actions`, `/budget-history`.

**Proxied by this app** (see the [API route handlers](#srcappapi--route-handlers-bff--cookie-layer) section above for the BFF-side file map): `/auth` (login), `/users/{create-user,forgot-password,reset-password}`, `/account-actions/`. The `/api/records` proxy hits `GET /records/get-expenses-and-incomes-by-month/{accountId}/{month}/{year}`; `/api/records/{income,expense}` POST to the legacy `/expenses-actions` and `/incomes-actions` controllers respectively.

**Not yet proxied** (real backend routes; no BFF route handler exists):

- `GET|POST /budgets`, `GET|PUT|DELETE /budgets/:budgetId` — full CRUD
- `GET /categories`, `POST /categories`, `POST /categories/create-local-categories` (public, seeds defaults), `PUT /categories`, `DELETE /categories` — full CRUD + public seed
- `GET /expenses-actions/:accountId/:month/:year`, `POST|PUT|DELETE /expenses-actions` — legacy expenses layer
- `POST|PUT|DELETE /incomes-actions` — legacy incomes layer
- `GET /records/expenses-and-incomes/:accountId/:month/:year` — newer records layer aggregator
- `GET|POST|PUT|DELETE /budget-history`, `POST /budget-history/add-record`, `POST /budget-history/delete-record` — budget ledger

The `Budget` and `Category` features in this repo's UI (and their mock fixtures under `__tests__/mocks/`) currently cannot talk to the backend until route handlers are added.

### CORS

Allow-list (env-driven, set in the backend's `src/main.ts`): `[FRONTEND_URI, TEST_FRONTEND_URI, DOMAIN_URI]`. Any new Vercel preview origin must be appended to one of these env vars. `credentials: true` is **not** explicitly set in `enableCors`; the httpOnly + `sameSite: 'strict'` cookie is fine in practice because the BFF re-signs and forwards the token server-side — the browser only ever talks to the BFF, never the backend directly.

### Domain model (entities the BFF touches)

| Entity                                   | Backend location                                        | Notable fields                                                                                                                                                                                             |
| ---------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `User`                                   | `src/users/entities/users.entity.ts`                    | `email` (unique), `password`, `firstName`, `lastName`, `middleName?`, `oneTimeToken?`                                                                                                                      |
| `Account`                                | `src/repositories/accounts/entities/accounts.entity.ts` | `title`, `alias`, `accountType: string` (free-form — the "AccountType" dropdown values are FE-only), `accountProvider: CardProvider`, `terminationFourDigits`, `backgroundColor`, `color`, `amount`, `sub` |
| `CardProvider` (alias `AccountProvider`) | `src/repositories/accounts/accounts.interface.ts:30`    | `'visa' \| 'mastercard' \| 'american-express'`; validated by `card-provider.service.ts`                                                                                                                    |
| `AccountRecord`                          | `src/domain/records/entities/records.entity.ts`         | `typeOfRecord: 'expense' \| 'income' \| 'transfer'`, embedded `indebtedPeople`, `transferRecord{transferId, account}`, refs to `Account` and `Category`, `budgets: string[]`                               |
| `Category`                               | `src/categories/entities/categories.entity.ts`          | `categoryName`, `subCategories: string[]`, `icon`, `sub`                                                                                                                                                   |
| `Budget`                                 | `src/budgets/budgets.entity.ts`                         | `name`, `description?`, `typeBudget`, `sub`, `startDate`, `endDate`, `currentAmount`, `limit`, `period?`, `isActive?`, `nestResetDate?`                                                                    |
| `BudgetHistory`                          | `src/budget-history/`                                   | Ledger of records added/removed from a budget                                                                                                                                                              |

> **Caveat — dual layer for income/expense.** There is a parallel pair of legacy modules (`src/repositories/expenses/`, `src/repositories/incomes/`) with their own `CreateExpense` / `CreateIncome` DTOs and controllers, while the newer `records` controller only exposes `transfer` + the per-month aggregator. The BFF's `/api/records/{income,expense}` proxies currently hit the legacy controllers — confirm before assuming the new `AccountRecord` schema applies to create flows.

### When you need to learn more or add a proxied endpoint

> **Do not clone the backend repo.** It is private and lives outside this workspace. The BFF agent has no SSH access. Use the delegation procedure below instead.

1. **Detect.** If the work touches a backend endpoint — adding a new proxied route, changing an existing proxy's request/response shape, debugging a 400 from the BFF that might be a backend mismatch, or scoping an unproxied feature (`/budgets`, `/categories`, `/expenses-actions`, `/incomes-actions`, `/records/transfer`, `/budget-history`) — you need backend info you cannot infer.
2. **Formulate the delegation prompt.** Open the template at [`.github/prompts/backend-research.prompt.md`](.github/prompts/backend-research.prompt.md) (the opencode equivalent is at `.opencode/command/backend-research.md`; both are the same content). Fill in the `{VARIABLE}` placeholders:
   - `{TASK_DESCRIPTION}` — what the BFF is about to do, in one or two sentences.
   - `{ENDPOINTS_OF_INTEREST}` — the specific backend paths.
   - `{SPECIFIC_QUESTIONS}` — numbered list of what you need to know (DTOs, guards, response shape, edge cases).
   - `{KNOWN_BACKEND_CONTEXT}` — leave as the default unless the BFF side has extra context the backend agent should know about.
   - `{OUTPUT_DESTINATION}` — usually `ai-research/{story}.md` under a `## Backend reference` section.
3. **Hand off.** Tell the user to run the filled-in prompt with their backend agent (in a separate session that has access to `BE_Personal_Finances`) and paste the response back. **Wait for the response** before continuing — do not invent answers.
4. **Verify and fold in.** When the response comes back, sanity-check the line numbers against this repo's own assumptions (e.g. that the BFF currently unwraps `error.response.data.error.message` on failures), then add a `## Backend reference` section to the active research doc and proceed.
5. **Mirror the BFF pattern** from `src/app/api/accounts/route.ts`: read the access token via `getAccessToken()`, attach `Authorization: Bearer <token>`, `await axios.<method>(...)`, return `NextResponse.json(data, { status })`. For login/register flows, also handle the `set-cookie` extraction via `getCookieProps` if you need to relay a cookie to the browser.
6. **Update this doc** — add the new route handler to the [API route handlers](#srcappapi--route-handlers-bff--cookie-layer) table and remove it from the "Not yet proxied" list above.

---

## Adding new code (guidelines)

### New feature domain

1. Create `src/features/<Domain>/<Component>.tsx` etc.
2. If you need a page, add `src/app/<route>/page.tsx` and update navigation.
3. If the domain needs a Zustand store, create `src/zustand/store/<domain>.store.ts` + `provider/<domain>-store-provider.tsx`. Add an entry to this file.
4. If the domain needs backend proxying, add route handlers under `src/app/api/<domain>/…`. Mirror the `getAccessToken()` + `axios` + `NextResponse.json` pattern from `src/app/api/accounts/route.ts`. **Read the backend DTO first** (see [External backend reference](#external-backend-reference)) — the contract is the `class-validator` DTO, not a published spec. Be aware there is no URL versioning, so coordinate breaking changes with the backend before relying on a response shape.
5. Add tests in `__tests__/features/<Domain>/` and `__tests__/app/api/<domain>/` as appropriate. Add a new mock fixture in `__tests__/mocks/<domain>.mock.ts` if the feature needs test data.
6. Update this document. `CHANGELOG.md` is handled by CI — don't touch it.

### New shared component

- Atom → `src/shared/ui/atoms/`
- Molecule → `src/shared/ui/molecules/`
- Organism → `src/shared/ui/organisms/`
- Add a colocated test in `__tests__/shared/ui/…`.

### New shared hook

- `src/shared/hooks/<name>.ts` + test at `__tests__/shared/hooks/<name>.test.ts`.

### New env var

1. Add to `.env-example` with a sensible default / comment.
2. Document in this file's "Environment variables" section.
3. If it's used in tests, mock it in `jest.setup.ts` (don't rely on CI env).

---

## Key files reference

| File                                                       | Purpose                                                                 |
| ---------------------------------------------------------- | ----------------------------------------------------------------------- |
| `AGENTS.md`                                                | Toolchain, commands, architecture overview, env vars, branch flow       |
| `package.json`                                             | Dependencies and npm scripts (project name: `clean-next-budget-master`) |
| `next.config.mjs`                                          | Next config (wrapped by flowbite-react plugin)                          |
| `tsconfig.json`                                            | TS config, path alias `@/*`                                             |
| `postcss.config.mjs`                                       | Tailwind v4 PostCSS config                                              |
| `jest.config.ts`                                           | Jest config (coverage always on, ignores `tremor` and `icons`)          |
| `jest.setup.ts`                                            | Global test setup                                                       |
| `src/app/layout.tsx`                                       | Root layout, dynamic rendering, theme, QueryProvider                    |
| `src/app/page.tsx`                                         | Login page (redirects to `/dashboard` when authenticated)               |
| `src/app/QueryProviderWrapper.tsx`                         | TanStack Query client provider                                          |
| `src/zustand/store/dashboard.store.ts`                     | Dashboard Zustand store                                                 |
| `src/zustand/provider/dashboard-store-provider.tsx`        | Dashboard store React provider                                          |
| `src/shared/lib/auth.lib.ts`                               | `getAccessToken`, `encodeAccessToken`, `saveSessionCookie`, `signOut`   |
| `src/shared/lib/preferences.lib.ts`                        | `getThemePreference`, `saveThemeCookie`, `savePreferenceCookie`         |
| `src/shared/ui/organisms/AppRouterContextProviderMock.tsx` | Router mock for tests                                                   |
| `.github/copilot-instructions.md`                          | Test conventions and reference test files                               |
| `.github/workflows/unit-tests.yml`                         | CI: unit tests                                                          |
| `.github/workflows/check-label.yml`                        | CI: PR label validation                                                 |
| `.github/workflows/develop-pipeline.yml`                   | CI: version bump + CHANGELOG on merge to `develop`                      |

---

## Open questions (for future maintainers)

- The BFF error-handling pattern collapses every upstream failure into `400 { message }` and discards the `GeneralResponse` envelope's `data` / `error` shape. Should this be revisited to forward upstream status codes and preserve `data`?
- The backend has no health-check route. If it's down, every BFF call returns a generic 400 — consider adding a `/api/health` route handler that pings a cheap backend endpoint.
- Why is `<html lang="es">` hardcoded in the root layout if the app is meant to be i18n-ready?
- The dual-layer income/expense situation (legacy `/expenses-actions` + `/incomes-actions` controllers vs. the newer `AccountRecord` schema) is a long-standing inconsistency on the backend side. The BFF's `/api/records/{income,expense}` proxies currently hit the legacy controllers; confirm with the backend owner before refactoring.

---

## Notes

- The app's UI locale is **Spanish** (`<html lang="es">` in `layout.tsx`).
- The default theme reads from `getThemePreference()` (server-side), and the cookie/local storage path on the client; respect SSR/CSR split when extending.
- Be conservative with new dependencies — `pnpm install` is the slowest step in CI. Prefer libs already in `package.json`.
- This file is for AI agents and humans alike. When the _layout_, _state strategy_, or _branch flow_ changes, update both this document and `AGENTS.md`.
