---
name: design
description: Use when making UI or visual design changes in this project. Consults DESIGN.md and existing Flowbite/Tailwind patterns before editing components.
---

# Design Skill

Use this skill for UI, layout, styling, component redesign, spacing, color, typography, and visual polish work.

## Project Design Source

- Read `DESIGN.md` before making UI changes.
- Preserve the established Flowbite React + Tailwind v4 visual language.
- Reuse existing shared button classes and Flowbite components before creating new patterns.
- Do not generate Tailwind theme CSS from `DESIGN.md`; it is currently documentation/source-of-truth for agents.

## Typography

- Do not change font family unless the user explicitly asks for a font change.
- Do not add `font-mono` for identifiers, guide numbers, IDs, prices, or metadata unless the user explicitly requests monospace.
- Use the app's existing typography: Geist Sans loaded in `src/app/layout.tsx`, with Tailwind utilities for size, weight, color, and spacing.
- For visual boldness, use Tailwind `font-bold` / `font-semibold` (e.g. `<span className="font-bold">`). Do **not** use the HTML `<strong>` element purely to bold text — `<strong>` is a semantic element (importance/seriousness) and is reserved for content that genuinely warrants assistive-tech emphasis. Use `<span className="font-bold">` for purely visual weight.

## Visual Checks

- Match nearby components in spacing, label style, icon size, border radius, and button treatment.
- Prefer Remix line icons already used in the feature before introducing a new icon style.
- Keep dark-mode classes when adding backgrounds, borders, or text colors.
- Run focused tests and `pnpm lint` after implementation.
