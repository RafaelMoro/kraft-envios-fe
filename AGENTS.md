# AGENTS.md

## Commands
- Use pnpm for installs and scripts; this repo has `pnpm-lock.yaml` and a root `pnpm-workspace.yaml` with only `allowBuilds` entries, not packages.
- `pnpm dev` starts the Next.js app on port 3000.
- `pnpm build` is the production verification; there is no dedicated typecheck script, so use `pnpm exec tsc --noEmit` for TypeScript-only checks.
- `pnpm lint` runs `next lint` with `next/core-web-vitals` and `next/typescript`.
- `pnpm test` runs Jest in jsdom and always collects coverage into `coverage/`.
- Run focused tests with `pnpm test -- __tests__/path/to/file.test.tsx` or add `-t "test name"` after the file path.

## App Structure
- This is a single Next.js 14 App Router app under `src/app`; imports use the `@/*` alias for `src/*`.
- `src/app/page.tsx` is the login entrypoint and redirects authenticated users to `/dashboard`.
- `src/app/dashboard/page.tsx` is a server component that reads auth cookies, then dynamically imports `features/Dashboard/Dashboard` with `ssr: false`.
- Feature UI lives in `src/features/*`; shared constants, hooks, types, utils, libs, and reusable UI live under `src/shared/*`.
- `src/features/QueryProviderWrapper.tsx` intentionally creates the React Query client inside a `useRef`; do not move it to module scope or it will share cache across requests.

## Env And API Routes
- Copy `.env.example` to `.env.local` for local work. Required values include `BACKEND_URI`, `SESSION_SECRET_KEY`, `FRONTEND_URI`, `NEXT_PUBLIC_LOCAL_STORAGE`, `NEXT_PUBLIC_GET_SAT_PRODUCT_URI`, and `NEXT_PUBLIC_DEFAULT_EMAIL`.
- App Route handlers in `src/app/api/**/route.ts` proxy backend calls through `BACKEND_URI` and often read the encrypted session via `getAccessToken()`.
- Session/user cookies are wrapped with `jose` in `src/shared/lib/auth.lib.ts`; `next.config.mjs` transpiles `jose` and wraps config with the Flowbite React Next plugin.
- Theme and dashboard screen preferences are cookie-backed server actions in `src/shared/lib/preferences.lib.ts`; theme is read in the root layout and written through `src/app/api/preferences/theme/route.ts`.

## Tests
- Jest setup is `next/jest`, `jest.setup.ts`, and `testEnvironment: "jsdom"`; setup adds `@testing-library/jest-dom`, `TextEncoder`/`TextDecoder`, and a `structuredClone` fallback.
- `__tests__/mocks/` and `__tests__/utils-test/` are ignored as test suites by Jest config, but helpers there are intended for imports from real tests.
- Tests mirror feature/shared UI boundaries under `__tests__/feature/*` and `__tests__/components/*`; keep new focused tests near the matching area.

## Styling
- Tailwind v4 is wired through `@tailwindcss/postcss` in `postcss.config.mjs`; there is no separate Tailwind config file.
- Flowbite React is part of the UI stack; dashboard customizes Flowbite theme locally in `src/app/dashboard/page.tsx`.
